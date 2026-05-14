'use strict';
const Redis  = require('ioredis');
const env    = require('./env');
const logger = require('./logger');

const createClient = (options = {}) => {
  const client = new Redis(env.REDIS_URL, {
    password:        env.REDIS_PASSWORD || undefined,
    retryStrategy:   (times) => Math.min(times * 200, 5000),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect:     false,
    ...options,
  });

  client.on('connect',     () => logger.info('[Redis] Conectado.'));
  client.on('error',  (e) => logger.error('[Redis] Erro:', e.message));
  client.on('close',       () => logger.warn('[Redis] Conexão encerrada.'));

  return client;
};

// Cliente principal
const redis = createClient();

// Cliente dedicado para BullMQ (não pode ser compartilhado)
const bullRedis = createClient({ maxRetriesPerRequest: null });

// Helpers
const set    = (key, val, ttl) => redis.set(key, JSON.stringify(val), 'EX', ttl);
const get    = async (key)     => { const v = await redis.get(key); return v ? JSON.parse(v) : null; };
const del    = (key)           => redis.del(key);
const exists = (key)           => redis.exists(key);
const incr   = (key, ttl)      => { const p = redis.pipeline(); p.incr(key); if (ttl) p.expire(key, ttl); return p.exec(); };

// Blacklist de tokens JWT (logout)
const TOKEN_PREFIX = 'bl:';
const blacklistToken = (jti, ttlS) => redis.set(`${TOKEN_PREFIX}${jti}`, '1', 'EX', ttlS);
const isBlacklisted  = (jti)       => redis.exists(`${TOKEN_PREFIX}${jti}`);

// Cache de sessão
const SESSION_PREFIX = 'sess:';
const setSession  = (userId, data, ttlS = 900) => set(`${SESSION_PREFIX}${userId}`, data, ttlS);
const getSession  = (userId) => get(`${SESSION_PREFIX}${userId}`);
const delSession  = (userId) => del(`${SESSION_PREFIX}${userId}`);

module.exports = {
  redis, bullRedis,
  set, get, del, exists, incr,
  blacklistToken, isBlacklisted,
  setSession, getSession, delSession,
};
