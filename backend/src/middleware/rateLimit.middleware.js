'use strict';
const rateLimit = require('express-rate-limit');
const env       = require('../config/env');

const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Muitas requisições. Tente novamente em breve.',
    retry_after: Math.ceil(env.RATE_LIMIT_WINDOW / 1000),
  });
};

// Global — todas as rotas /api
const global = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max:      env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  handler,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
});

// Auth — login e recuperação de senha
const auth = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 min
  max:            env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders:  false,
  keyGenerator:   (req) => req.body?.email || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: `Muitas tentativas de login. Aguarde ${15} minutos.`,
    });
  },
});

// Upload — mais restritivo
const upload = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max:      50,
  handler,
});

// Exportação de relatórios
const export_ = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max:      10,
  handler,
});

module.exports = { global, auth, upload, export_ };
