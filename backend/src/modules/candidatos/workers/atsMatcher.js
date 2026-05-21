'use strict';
/**
 * atsMatcher.js
 * Worker BullMQ para processamento assíncrono de matching IA de candidatos.
 * Calcula aderência e extrai skills sem bloquear a candidatura.
 *
 * @module candidatos/workers/atsMatcher
 */

const { Queue, Worker } = require('bullmq');
const { bullRedis }     = require('../../../config/redis');
const logger            = require('../../../config/logger');

const QUEUE_NAME = 'ats-matching';

const atsMatcher = new Queue(QUEUE_NAME, {
  connection: bullRedis,
  defaultJobOptions: {
    attempts:         3,
    removeOnComplete: { count: 200 },
    removeOnFail:     { count: 50 },
    backoff: { type: 'exponential', delay: 3_000 },
  },
});

const startAtsMatcherWorker = () => {
  const worker = new Worker(QUEUE_NAME, async (job) => {
    const { app_id, candidato_id, vaga_id } = job.data;
    logger.debug(`[ATS/Matcher] Calculando aderência: candidato ${candidato_id} → vaga ${vaga_id}`);

    const { calcularAderencia } = require('../ai/curriculumMatcher');
    const resultado = await calcularAderencia(candidato_id, vaga_id);

    logger.info(`[ATS/Matcher] Aderência calculada: ${resultado.aderencia_pct}% (app ${app_id})`);
    return resultado;
  }, {
    connection:  bullRedis,
    concurrency: 2,
  });

  worker.on('completed', job => logger.debug(`[ATS/Matcher] Job ${job.id} concluído`));
  worker.on('failed', (job, err) => logger.error(`[ATS/Matcher] Job ${job?.id} falhou:`, err.message));

  logger.info('[ATS/Matcher] Worker ats-matching iniciado');
  return worker;
};

module.exports = { atsMatcher, startAtsMatcherWorker };
