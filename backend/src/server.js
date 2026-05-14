'use strict';
require('dotenv').config();

const http   = require('http');
const app    = require('./app');
const env    = require('./config/env');
const logger = require('./config/logger');
const { connect: dbConnect } = require('./config/database');
const { initSockets } = require('./sockets');
const { startJobs }   = require('./jobs');

const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────
initSockets(server);

const start = async () => {
  try {
    // 1. Banco de dados
    await dbConnect();

    // 2. Jobs agendados
    startJobs();

    // 3. Servidor HTTP
    server.listen(env.PORT, () => {
      logger.info(`
╔════════════════════════════════════════╗
║   hi Conecta RH — Backend Enterprise  ║
║   Porta:    ${String(env.PORT).padEnd(26)} ║
║   Ambiente: ${env.NODE_ENV.padEnd(26)} ║
║   API:      /api/v1                    ║
╚════════════════════════════════════════╝`);
    });

    // 4. Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`[Server] ${signal} recebido — encerrando...`);
      server.close(async () => {
        const { disconnect } = require('./config/database');
        const { redis }      = require('./config/redis');
        await disconnect();
        await redis.quit();
        logger.info('[Server] Encerrado com sucesso.');
        process.exit(0);
      });

      // Força saída após 15 segundos
      setTimeout(() => { logger.error('[Server] Timeout de shutdown.'); process.exit(1); }, 15000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('[Server] Falha na inicialização:', err);
    process.exit(1);
  }
};

// Captura erros não tratados
process.on('unhandledRejection', (reason) => {
  logger.error('[Server] unhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('[Server] uncaughtException:', err);
  process.exit(1);
});

start();
