'use strict';
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');

const env    = require('../../config/env');
const { prisma }   = require('../../config/database');
const { blacklistToken, setSession, delSession } = require('../../config/redis');
const { emailQueue } = require('../../queues/email.queue');

// ── Geração de tokens ─────────────────────────
const gerarAccessToken = (usuario) => {
  const jti = uuid();
  const token = jwt.sign(
    {
      sub:        usuario.id,
      empresa_id: usuario.empresa_id,
      perfil:     usuario.perfil,
      jti,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN, issuer: 'hi-conecta-rh' }
  );
  return { token, jti };
};

const gerarRefreshToken = async (usuario, ip, userAgent) => {
  const token    = uuid();
  const expiraEm = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 dias

  await prisma.refreshToken.create({
    data: {
      usuario_id: usuario.id,
      token,
      expira_em:  expiraEm,
      ip,
      user_agent: userAgent,
    },
  });

  return token;
};

// ── Login ─────────────────────────────────────
const login = async (email, senha, ip, userAgent) => {
  // 1. Busca usuário
  const usuario = await prisma.usuario.findFirst({
    where: { email, ativo: true, deleted_at: null },
    select: {
      id: true, empresa_id: true, nome: true, email: true,
      perfil: true, senha_hash: true, colaborador_id: true,
      empresa: { select: { status: true, trial_ate: true, nome: true } },
    },
  });

  if (!usuario) throw { status: 401, message: 'Credenciais inválidas.' };

  // 2. Senha
  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk) throw { status: 401, message: 'Credenciais inválidas.' };

  // 3. Status da empresa
  const emp = usuario.empresa;
  if (emp.status === 'cancelada')   throw { status: 403, message: 'Conta cancelada.' };
  if (emp.status === 'suspensa')     throw { status: 403, message: 'Conta suspensa por inadimplência.' };
  if (emp.status === 'trial' && emp.trial_ate && new Date() > emp.trial_ate) {
    throw { status: 403, message: 'Trial expirado. Faça upgrade do plano.' };
  }

  // 4. Gera tokens
  const { token: accessToken, jti } = gerarAccessToken(usuario);
  const refreshToken = await gerarRefreshToken(usuario, ip, userAgent);

  // 5. Atualiza último acesso
  await prisma.usuario.update({
    where: { id: usuario.id },
    data:  { ultimo_acesso: new Date(), ultimo_ip: ip },
  });

  // 6. Salva sessão no Redis
  await setSession(usuario.id, { id: usuario.id, perfil: usuario.perfil, empresa_id: usuario.empresa_id });

  return {
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
    expires_in:    env.JWT_EXPIRES_IN,
    usuario: {
      id:             usuario.id,
      nome:           usuario.nome,
      email:          usuario.email,
      perfil:         usuario.perfil,
      empresa_id:     usuario.empresa_id,
      empresa_nome:   emp.nome,
      colaborador_id: usuario.colaborador_id,
    },
  };
};

// ── Refresh ───────────────────────────────────
const refreshToken = async (token) => {
  const rt = await prisma.refreshToken.findUnique({
    where: { token },
    include: { usuario: { select: { id: true, empresa_id: true, perfil: true, ativo: true } } },
  });

  if (!rt || rt.revogado || new Date() > rt.expira_em) {
    throw { status: 401, message: 'Refresh token inválido ou expirado.' };
  }

  if (!rt.usuario.ativo) {
    throw { status: 403, message: 'Usuário desativado.' };
  }

  // Rotação de refresh token (invalida o anterior)
  await prisma.refreshToken.update({ where: { id: rt.id }, data: { revogado: true } });
  const { token: newAccess }   = gerarAccessToken(rt.usuario);
  const newRefresh = await gerarRefreshToken(rt.usuario, rt.ip, rt.user_agent);

  return { access_token: newAccess, refresh_token: newRefresh };
};

// ── Logout ────────────────────────────────────
const logout = async (jti, refreshTokenVal, userId) => {
  if (jti) {
    // Tempo restante do access token (15 min = 900s)
    await blacklistToken(jti, 900);
  }
  if (refreshTokenVal) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenVal },
      data:  { revogado: true },
    });
  }
  await delSession(userId);
};

// ── Esqueci minha senha ───────────────────────
const forgotPassword = async (email) => {
  const usuario = await prisma.usuario.findFirst({
    where: { email, ativo: true, deleted_at: null },
    select: { id: true, nome: true, email: true },
  });

  // Sempre responde "OK" para não expor emails cadastrados
  if (!usuario) return;

  const token   = crypto.randomBytes(32).toString('hex');
  const expira  = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.usuario.update({
    where: { id: usuario.id },
    data:  { reset_token: token, reset_expira: expira },
  });

  await emailQueue.add('forgot_password', {
    to:    usuario.email,
    nome:  usuario.nome,
    token,
  });
};

// ── Redefinir senha ───────────────────────────
const resetPassword = async (token, novaSenha) => {
  const usuario = await prisma.usuario.findFirst({
    where: {
      reset_token:  token,
      reset_expira: { gte: new Date() },
      deleted_at:   null,
    },
  });

  if (!usuario) throw { status: 400, message: 'Token inválido ou expirado.' };

  const hash = await bcrypt.hash(novaSenha, env.BCRYPT_ROUNDS);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data:  { senha_hash: hash, reset_token: null, reset_expira: null },
  });
};

// ── Trocar senha ──────────────────────────────
const changePassword = async (usuarioId, senhaAtual, novaSenha) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw { status: 404, message: 'Usuário não encontrado.' };

  const ok = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!ok) throw { status: 400, message: 'Senha atual incorreta.' };

  const hash = await bcrypt.hash(novaSenha, env.BCRYPT_ROUNDS);
  await prisma.usuario.update({ where: { id: usuarioId }, data: { senha_hash: hash } });
};

module.exports = { login, refreshToken, logout, forgotPassword, resetPassword, changePassword };
