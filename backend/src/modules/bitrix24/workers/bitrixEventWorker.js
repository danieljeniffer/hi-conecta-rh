'use strict';
/**
 * bitrixEventWorker.js
 * Worker BullMQ responsável por processar eventos brutos do Bitrix24.
 *
 * Fila: bitrix-events
 * Concorrência: 5 (eventos de usuário são serializados)
 * Retry: 4 tentativas com backoff exponencial (5s, 10s, 20s, 40s)
 *
 * Fluxo:
 *   1. Webhook recebido → BitrixEvent persistido no banco
 *   2. Job enfileirado com event_id
 *   3. Worker busca evento, identifica grupo, delega ao service correto
 *   4. Marca BitrixEvent como processed=true
 *   5. Enfileira recálculo de engagement na fila engagement-processing
 *
 * @module bitrix24/workers/bitrixEventWorker
 */

const { Queue, Worker } = require('bullmq');
const { bullRedis }     = require('../../../config/redis');
const logger            = require('../../../config/logger');
const { prisma }        = require('../../../config/database');

const QUEUE_NAME = 'bitrix-events';

/** Fila de entrada de eventos do Bitrix24 */
const bitrixEventsQueue = new Queue(QUEUE_NAME, {
  connection: bullRedis,
  defaultJobOptions: {
    attempts:         4,
    removeOnComplete: { count: 200 },
    removeOnFail:     { count: 100 },
    backoff: { type: 'exponential', delay: 5_000 },
  },
});

/**
 * Inicia o worker de processamento de eventos Bitrix24.
 * @returns {Worker}
 */
const startBitrixEventWorker = () => {
  const worker = new Worker(QUEUE_NAME, async (job) => {
    const { bitrix_event_id, empresa_id, event_type, group, payload } = job.data;

    logger.info(`[Bitrix/Worker] Processando ${event_type} (job ${job.id})`);

    // 1. Verifica se o evento ainda existe e não foi processado
    const event = await prisma.bitrixEvent.findUnique({ where: { id: bitrix_event_id } });
    if (!event) {
      logger.warn(`[Bitrix/Worker] BitrixEvent ${bitrix_event_id} não encontrado. Ignorando.`);
      return;
    }
    if (event.processed) {
      logger.debug(`[Bitrix/Worker] BitrixEvent ${bitrix_event_id} já processado. Pulando.`);
      return;
    }

    let result;

    try {
      // 2. Delega ao service correto baseado no grupo
      switch (group) {
        case 'users': {
          const usersService = require('../services/bitrixUsersService');
          if (event_type === 'ONUSERADD') {
            result = await usersService.processUserAdd(empresa_id, payload, bitrix_event_id);
          } else if (event_type === 'ONUSERUPDATE') {
            result = await usersService.processUserUpdate(empresa_id, payload, bitrix_event_id);
          }
          break;
        }
        case 'chat': {
          const chatService = require('../services/bitrixChatService');
          result = await chatService.processEvent(empresa_id, event_type, payload, bitrix_event_id);
          break;
        }
        case 'knowledge': {
          const knowledgeService = require('../services/bitrixKnowledgeService');
          result = await knowledgeService.processKnowledgeEvent(empresa_id, event_type, payload, bitrix_event_id);
          break;
        }
        default:
          logger.warn(`[Bitrix/Worker] Grupo desconhecido: ${group} (${event_type})`);
          result = { status: 'ignorado', motivo: 'grupo_desconhecido' };
      }

      // 3. Marca evento como processado
      await prisma.bitrixEvent.update({
        where: { id: bitrix_event_id },
        data: {
          processed:    true,
          processed_at: new Date(),
          retry_count:  job.attemptsMade,
        },
      });

      // 4. Se o evento gerou interação social, enfileira recálculo de engagement
      if (result?.colaborador_id && group !== 'users') {
        const { engagementQueue } = require('./engagementWorker');
        await engagementQueue.add('recalculate', {
          colaborador_id: result.colaborador_id,
          empresa_id,
          trigger:        event_type,
        }, {
          delay:  2_000, // aguarda 2s para agrupar eventos próximos
          jobId:  `eng:${result.colaborador_id}:${new Date().toISOString().slice(0, 13)}`, // 1 job por hora por colaborador
          deduplication: { id: `eng:${result.colaborador_id}` },
        });
      }

      logger.info(`[Bitrix/Worker] ${event_type} processado com sucesso (job ${job.id})`);

    } catch (err) {
      // 5. Registra erro no evento para reprocessamento manual posterior
      await prisma.bitrixEvent.update({
        where: { id: bitrix_event_id },
        data: {
          error:       err.message.substring(0, 500),
          retry_count: job.attemptsMade,
        },
      }).catch(() => {});

      logger.error(`[Bitrix/Worker] Erro ao processar ${event_type} (job ${job.id}):`, err.message);
      throw err; // BullMQ tentará novamente conforme backoff
    }

    return result;

  }, {
    connection:  bullRedis,
    concurrency: 5,
  });

  worker.on('completed', (job) =>
    logger.debug(`[Bitrix/Worker] Job ${job.id} concluído`)
  );

  worker.on('failed', (job, err) =>
    logger.error(`[Bitrix/Worker] Job ${job?.id} falhou (tentativa ${job?.attemptsMade}):`, err.message)
  );

  worker.on('stalled', (jobId) =>
    logger.warn(`[Bitrix/Worker] Job ${jobId} travado — recolocando na fila`)
  );

  logger.info('[Bitrix/Worker] Worker bitrix-events iniciado (concorrência: 5)');
  return worker;
};

module.exports = { bitrixEventsQueue, startBitrixEventWorker };
