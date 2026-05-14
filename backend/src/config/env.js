'use strict';
require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`[Env] Variável obrigatória não definida: ${key}`);
  return val;
};

const optional = (key, fallback = '') => process.env[key] ?? fallback;

module.exports = {
  NODE_ENV:   optional('NODE_ENV', 'development'),
  PORT:       parseInt(optional('PORT', '3001'), 10),
  APP_NAME:   optional('APP_NAME', 'hi Conecta RH'),
  APP_URL:    optional('APP_URL', 'http://localhost:3001'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5500'),

  // JWT
  JWT_SECRET:          required('JWT_SECRET'),
  JWT_EXPIRES_IN:      optional('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET:  required('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // Banco
  DATABASE_URL: required('DATABASE_URL'),

  // Redis
  REDIS_URL:      optional('REDIS_URL', 'redis://localhost:6379'),
  REDIS_PASSWORD: optional('REDIS_PASSWORD'),

  // Email
  SMTP_HOST:   optional('SMTP_HOST', 'localhost'),
  SMTP_PORT:   parseInt(optional('SMTP_PORT', '587'), 10),
  SMTP_SECURE: optional('SMTP_SECURE', 'false') === 'true',
  SMTP_USER:   optional('SMTP_USER'),
  SMTP_PASS:   optional('SMTP_PASS'),
  EMAIL_FROM:  optional('EMAIL_FROM', 'noreply@hiconectarh.com.br'),

  // Upload
  UPLOAD_DIR:      optional('UPLOAD_DIR', 'uploads'),
  UPLOAD_MAX_SIZE: parseInt(optional('UPLOAD_MAX_SIZE', '10485760'), 10),

  // Logs
  LOG_LEVEL: optional('LOG_LEVEL', 'debug'),
  LOG_DIR:   optional('LOG_DIR', 'logs'),

  // Rate limit
  RATE_LIMIT_WINDOW:   parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX:      parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  RATE_LIMIT_AUTH_MAX: parseInt(optional('RATE_LIMIT_AUTH_MAX', '10'), 10),

  // Segurança
  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),
  CORS_ORIGINS:  optional('CORS_ORIGINS', 'http://localhost:5500').split(','),

  // Helpers
  isProd: () => process.env.NODE_ENV === 'production',
  isDev:  () => process.env.NODE_ENV !== 'production',
};
