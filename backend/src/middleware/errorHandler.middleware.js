'use strict';
const logger = require('../config/logger');
const env    = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, _next) => {
  // Erros operacionais (esperados)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code:    err.code,
    });
  }

  // Erros do Prisma
  if (err.constructor?.name?.startsWith('Prisma')) {
    logger.error('[DB]', { code: err.code, meta: err.meta, message: err.message });

    const prismaMap = {
      P2002: { status: 409, msg: 'Registro já existe (dado duplicado).' },
      P2003: { status: 400, msg: 'Referência a registro inexistente.' },
      P2025: { status: 404, msg: 'Registro não encontrado.' },
      P2016: { status: 400, msg: 'Consulta inválida.' },
    };

    const mapped = prismaMap[err.code];
    if (mapped) {
      return res.status(mapped.status).json({ success: false, message: mapped.msg });
    }
  }

  // Erros de validação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token inválido.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expirado.' });
  }

  // Erros CORS
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Erros inesperados — log e resposta genérica
  logger.error('[ErrorHandler] Erro não tratado:', {
    message:   err.message,
    stack:     err.stack,
    url:       req.originalUrl,
    method:    req.method,
    ip:        req.ip,
    user:      req.user?.id,
    empresa:   req.user?.empresa_id,
  });

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor.',
    ...(env.isDev() && { debug: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
