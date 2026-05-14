'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const { prisma }  = require('../../config/database');
const { ok, created, badRequest } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyAdmin }     = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const env = require('../../config/env');

// Cadastro de empresa (público — onboarding SaaS)
router.post('/signup', async (req, res, next) => {
  try {
    const { empresa_nome, cnpj, email, nome_admin, senha } = req.body;
    if (!empresa_nome || !cnpj || !email || !senha)
      return badRequest(res, 'Campos obrigatórios: empresa_nome, cnpj, email, senha.');

    const existe = await prisma.empresa.findUnique({ where: { cnpj: cnpj.replace(/\D/g,'') } });
    if (existe) return res.status(409).json({ success: false, message: 'CNPJ já cadastrado.' });

    const empresa = await prisma.$transaction(async (tx) => {
      const emp = await tx.empresa.create({
        data: {
          nome:      empresa_nome,
          cnpj:      cnpj.replace(/\D/g,''),
          email,
          plano:     'trial',
          status:    'trial',
          trial_ate: new Date(Date.now() + 14 * 86400000), // 14 dias
          max_colaboradores: 30,
        },
      });

      const hash = await bcrypt.hash(senha, env.BCRYPT_ROUNDS);
      await tx.usuario.create({
        data: {
          empresa_id: emp.id,
          nome:       nome_admin || empresa_nome,
          email,
          senha_hash: hash,
          perfil:     'admin',
          ativo:      true,
        },
      });

      return emp;
    });

    created(res, { empresa_id: empresa.id, nome: empresa.nome, trial_ate: empresa.trial_ate },
      'Empresa cadastrada! Trial de 14 dias iniciado.');
  } catch (err) { next(err); }
});

// GET — dados da empresa logada
router.get('/empresa', authenticate, resolveTenant, async (req, res, next) => {
  try { ok(res, req.empresa); }
  catch (err) { next(err); }
});

// PUT — atualizar empresa
router.put('/empresa', authenticate, resolveTenant, onlyAdmin, async (req, res, next) => {
  try {
    const updated = await prisma.empresa.update({
      where: { id: req.user.empresa_id },
      data:  req.body,
    });
    ok(res, updated, 'Empresa atualizada.');
  } catch (err) { next(err); }
});

// GET — usuários da empresa
router.get('/usuarios', authenticate, resolveTenant, onlyAdmin, async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where:   { empresa_id: req.user.empresa_id, deleted_at: null },
      select:  { id: true, nome: true, email: true, perfil: true, ativo: true, ultimo_acesso: true },
      orderBy: { nome: 'asc' },
    });
    ok(res, usuarios);
  } catch (err) { next(err); }
});

// POST — criar usuário na empresa
router.post('/usuarios', authenticate, resolveTenant, onlyAdmin, async (req, res, next) => {
  try {
    const { nome, email, perfil, senha } = req.body;
    const hash = await bcrypt.hash(senha || 'Mudar@123', env.BCRYPT_ROUNDS);

    const u = await prisma.usuario.create({
      data: {
        empresa_id: req.user.empresa_id,
        nome, email,
        senha_hash: hash,
        perfil:     perfil || 'colaborador',
        ativo:      true,
      },
    });

    created(res, { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil }, 'Usuário criado.');
  } catch (err) { next(err); }
});

module.exports = router;
