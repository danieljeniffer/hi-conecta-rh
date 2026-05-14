'use strict';
const { PrismaClient } = require('@prisma/client');
const env    = require('./env');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: env.isDev()
    ? [
        { emit: 'event', level: 'query'  },
        { emit: 'event', level: 'error'  },
        { emit: 'event', level: 'warn'   },
      ]
    : [
        { emit: 'event', level: 'error' },
      ],
  errorFormat: 'minimal',
});

// Log de queries em desenvolvimento
if (env.isDev()) {
  prisma.$on('query', (e) => {
    logger.debug(`[DB] ${e.query} — ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error('[DB] Erro Prisma:', e);
});

// Graceful shutdown
const disconnect = async () => {
  await prisma.$disconnect();
  logger.info('[DB] Conexão encerrada.');
};

process.on('beforeExit', disconnect);
process.on('SIGINT',     disconnect);
process.on('SIGTERM',    disconnect);

// Testa conexão na inicialização
const connect = async () => {
  try {
    await prisma.$connect();
    logger.info('[DB] PostgreSQL conectado.');
  } catch (err) {
    logger.error('[DB] Falha ao conectar:', err.message);
    process.exit(1);
  }
};

module.exports = { prisma, connect, disconnect };
