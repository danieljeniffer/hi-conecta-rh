'use strict';
const jwt    = require('jsonwebtoken');
const env    = require('../config/env');
const { isBlacklisted } = require('../config/redis');
const { prisma }  = require('../config/database');
const { unauthorized, forbidden } = require('../utils/response');

/**
 * Verifica JWT e injeta req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return unauthorized(res, 'Token de acesso não fornecido.');
    }

    const token = header.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Token expirado. Faça login novamente.'
        : 'Token inválido.';
      return unauthorized(res, msg);
    }

    // Verifica blacklist (logout)
    if (payload.jti && await isBlacklisted(payload.jti)) {
      return unauthorized(res, 'Token revogado. Faça login novamente.');
    }

    // Carrega usuário do banco (garante que ainda existe e está ativo)
    const usuario = await prisma.usuario.findFirst({
      where: {
        id:         payload.sub,
        ativo:      true,
        deleted_at: null,
      },
      select: {
        id:          true,
        empresa_id:  true,
        nome:        true,
        email:       true,
        perfil:      true,
        colaborador_id: true,
      },
    });

    if (!usuario) {
      return unauthorized(res, 'Usuário não encontrado ou inativo.');
    }

    // Injeta no request
    req.user = {
      id:             usuario.id,
      empresa_id:     usuario.empresa_id,
      nome:           usuario.nome,
      email:          usuario.email,
      perfil:         usuario.perfil,
      colaborador_id: usuario.colaborador_id,
      jti:            payload.jti,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Opcional — autentica se houver token, não bloqueia se não houver
 */
const authenticateOptional = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  return authenticate(req, res, next);
};

module.exports = { authenticate, authenticateOptional };
