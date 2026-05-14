'use strict';
const { Queue, Worker } = require('bullmq');
const { bullRedis }  = require('../config/redis');
const logger         = require('../config/logger');
const emailService   = require('../services/email.service');

const QUEUE_NAME = 'emails';

// Cria fila
const emailQueue = new Queue(QUEUE_NAME, {
  connection: bullRedis,
  defaultJobOptions: {
    attempts:       3,
    removeOnComplete: { count: 100 },
    removeOnFail:     { count: 50 },
    backoff: {
      type:  'exponential',
      delay: 5000,
    },
  },
});

// Worker que processa os jobs
const startEmailWorker = () => {
  const worker = new Worker(QUEUE_NAME, async (job) => {
    const { name, data } = job;
    logger.debug(`[Email Queue] Processando: ${name} para ${data.to}`);

    await emailService.enviar({
      to:       data.to,
      template: name,
      data,
    });

    logger.info(`[Email Queue] Enviado: ${name} → ${data.to}`);
  }, {
    connection:  bullRedis,
    concurrency: 3,
  });

  worker.on('completed', (job) => logger.debug(`[Email] Job ${job.id} concluído.`));
  worker.on('failed',    (job, err) => logger.error(`[Email] Job ${job?.id} falhou:`, err.message));

  return worker;
};

module.exports = { emailQueue, startEmailWorker };
