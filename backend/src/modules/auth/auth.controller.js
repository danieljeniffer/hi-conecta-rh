'use strict';
const service = require('./auth.service');
const { ok, created, badRequest, unauthorized } = require('../../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const ip        = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await service.login(email, senha, ip, userAgent);
    return ok(res, result, 'Login realizado com sucesso.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const result = await service.refreshToken(refresh_token);
    return ok(res, result, 'Token renovado.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    await service.logout(req.user?.jti, refresh_token, req.user?.id);
    return ok(res, null, 'Logout realizado com sucesso.');
  } catch (err) { next(err); }
};

const me = async (req, res) => {
  return ok(res, req.user, 'Dados do usuário logado.');
};

const forgotPassword = async (req, res, next) => {
  try {
    await service.forgotPassword(req.body.email);
    // Resposta genérica (não expõe se email existe)
    return ok(res, null, 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, nova_senha } = req.body;
    await service.resetPassword(token, nova_senha);
    return ok(res, null, 'Senha redefinida com sucesso.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    await service.changePassword(req.user.id, senha_atual, nova_senha);
    return ok(res, null, 'Senha alterada com sucesso.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

module.exports = { login, refresh, logout, me, forgotPassword, resetPassword, changePassword };
