'use strict';
/**
 * engagementWorker.js
 * Worker BullMQ para recálculo assíncrono de scores de engajamento.
 *
 * Fila: engagement-processing
 * Concorrência: 3 (CPU-bound)
 * Deduplicação: 1 job por colaborador por hora (evita recálculos redundantes)
 *
 * Fluxo:
 *   1. Evento social processado → job enfileirado com colaborador_id
 *   2. Worker recalcula score via EngagementEngine
 *   3. Atualiza EmployeeEngagementScore no banco
 *   4. Emite evento Socket.io para atualização realtime dos dashboards
 *   5. Verifica gatilhos de automação (baixo engajamento, queda brusca, etc)
 *
 * @module bitrix24/workers/engagementWorker
 */

const { Queue, Worker } = require('bullmq');
const { bullRedis }     = require('../../../config/redis');
const logger            = require('../../../config/logger');
const { prisma }        = require('../../../config/database');

const QUEUE_NAME = 'engagement-processing';

/** Fila de recálculo de engagement */
const engagementQueue = new Queue(QUEUE_NAME, {
  connection: bullRedis,
  defaultJobOptions: {
    attempts:         3,
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 100 },
    backoff: { type: 'exponential', delay: 3_000 },
  },
});

/**
 * Inicia o worker de processamento de engagement.
 * @returns {Worker}
 */
const startEngagementWorker = () => {
  const worker = new Worker(QUEUE_NAME, async (job) => {
    const { colaborador_id, empresa_id, trigger } = job.data;

    logger.debug(`[Engagement/Worker] Recalculando score: colaborador ${colaborador_id} (trigger: ${trigger})`);

    // 1. Calcula novo score via EngagementEngine
    const EngagementEngine = require('../../../analytics/engagementEngine');
    const resultado = await EngagementEngine.calcularScore(colaborador_id, empresa_id);

    if (!resultado) {
      logger.warn(`[Engagement/Worker] Dados insuficientes para colaborador ${colaborador_id}`);
      return;
    }

    const { score, classificacao, scoreAnterior, delta7d, delta30d, componentes, diasSemInteracao, risco } = resultado;

    // 2. Persiste no banco (upsert)
    const engagementScore = await prisma.employeeEngagementScore.upsert({
      where:  { colaborador_id },
      update: {
        score_anterior:        scoreAnterior,
        score_atual:           score,
        classificacao,
        delta_7d:              delta7d,
        delta_30d:             delta30d,
        score_mensagens:       componentes.mensagens,
        score_interacoes:      componentes.interacoes,
        score_conhecimento:    componentes.conhecimento,
        score_participacao:    componentes.participacao,
        dias_sem_interacao:    diasSemInteracao,
        ultimo_evento_em:      resultado.ultimoEvento,
        total_eventos_30d:     resultado.totalEventos30d,
        risco_desengajamento:  risco,
        risco_saida_impacto:   resultado.riscoSaidaImpacto,
        computed_at:           new Date(),
      },
      create: {
        colaborador_id,
        empresa_id,
        score_atual:           score,
        score_anterior:        scoreAnterior || 0,
        classificacao,
        delta_7d:              delta7d,
        delta_30d:             delta30d,
        score_mensagens:       componentes.mensagens,
        score_interacoes:      componentes.interacoes,
        score_conhecimento:    componentes.conhecimento,
        score_participacao:    componentes.participacao,
        dias_sem_interacao:    diasSemInteracao,
        ultimo_evento_em:      resultado.ultimoEvento,
        total_eventos_30d:     resultado.totalEventos30d,
        risco_desengajamento:  risco,
        risco_saida_impacto:   resultado.riscoSaidaImpacto,
      },
    });

    // 3. Atualiza métricas mensais
    const periodo = new Date().toISOString().slice(0, 7);
    await _atualizarMetricasMensais(colaborador_id, empresa_id, periodo, componentes, score);

    // 4. Emite evento realtime para dashboards
    const { emitToEmpresa } = require('../../../sockets');
    emitToEmpresa(empresa_id, 'engagement:score_updated', {
      colaborador_id,
      score_atual:  score,
      classificacao,
      risco,
      delta_7d:     delta7d,
      updated_at:   new Date().toISOString(),
    });

    // 5. Verifica gatilhos de automação
    await _verificarGatilhos(colaborador_id, empresa_id, engagementScore, scoreAnterior, diasSemInteracao, classificacao);

    logger.info(`[Engagement/Worker] Score atualizado: ${colaborador_id} → ${score} (${classificacao}) [${trigger}]`);

    return { colaborador_id, score, classificacao, risco };

  }, {
    connection:  bullRedis,
    concurrency: 3,
  });

  worker.on('completed', (job) =>
    logger.debug(`[Engagement/Worker] Job ${job.id} concluído`)
  );

  worker.on('failed', (job, err) =>
    logger.error(`[Engagement/Worker] Job ${job?.id} falhou:`, err.message)
  );

  logger.info('[Engagement/Worker] Worker engagement-processing iniciado (concorrência: 3)');
  return worker;
};

/**
 * Atualiza ou cria as métricas mensais do colaborador.
 */
const _atualizarMetricasMensais = async (colaboradorId, empresaId, periodo, componentes, scoreAtual) => {
  const inicio  = new Date(`${periodo}-01`);
  const fim     = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59);

  const [mensagens, comentarios, curtidas, reacoes, artigos, artigosComp, politicas] = await Promise.all([
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'MESSAGE',            created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'COMMENT',            created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'LIKE',               created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'REACTION',           created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'ARTICLE_READ',       created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'ARTICLE_COMPLETED',  created_at: { gte: inicio, lte: fim } } }),
    prisma.employeeSocialEvent.count({ where: { colaborador_id: colaboradorId, event_type: 'POLICY_READ',        created_at: { gte: inicio, lte: fim } } }),
  ]);

  await prisma.employeeBehaviorMetrics.upsert({
    where:  { colaborador_id_periodo: { colaborador_id: colaboradorId, periodo } },
    update: {
      total_mensagens:          mensagens,
      total_comentarios:        comentarios,
      total_curtidas:           curtidas,
      total_reacoes:            reacoes,
      total_artigos_lidos:      artigos,
      total_artigos_completos:  artigosComp,
      total_politicas_acessadas:politicas,
      engagement_score_fim:     scoreAtual,
      computed_at:              new Date(),
    },
    create: {
      empresa_id:               empresaId,
      colaborador_id:           colaboradorId,
      periodo,
      total_mensagens:          mensagens,
      total_comentarios:        comentarios,
      total_curtidas:           curtidas,
      total_reacoes:            reacoes,
      total_artigos_lidos:      artigos,
      total_artigos_completos:  artigosComp,
      total_politicas_acessadas:politicas,
      engagement_score_fim:     scoreAtual,
      engagement_score_inicio:  scoreAtual,
    },
  });
};

/**
 * Verifica gatilhos de automação baseados na mudança de score.
 */
const _verificarGatilhos = async (colaboradorId, empresaId, score, scoreAnterior, diasSemInteracao, classificacao) => {
  const AutomationTriggers = require('../../../analytics/engagementAutomation');

  // Gatilho: baixo engajamento
  if (classificacao === 'baixo' && scoreAnterior > 30) {
    await AutomationTriggers.trigger('baixo_engajamento', {
      colaborador_id: colaboradorId,
      empresa_id:     empresaId,
      score_atual:    score.score_atual,
      score_anterior: scoreAnterior,
    });
  }

  // Gatilho: ausência de interação (15+ dias)
  if (diasSemInteracao >= 15) {
    await AutomationTriggers.trigger('ausencia_interacao', {
      colaborador_id:   colaboradorId,
      empresa_id:       empresaId,
      dias_sem_interacao: diasSemInteracao,
    });
  }

  // Gatilho: queda brusca (>20 pontos em 7 dias)
  if (score.delta_7d <= -20) {
    await AutomationTriggers.trigger('queda_brusca_atividade', {
      colaborador_id: colaboradorId,
      empresa_id:     empresaId,
      delta_7d:       score.delta_7d,
    });
  }

  // Gatilho: colaborador destaque (score > 80)
  if (score.score_atual >= 80 && scoreAnterior < 80) {
    await AutomationTriggers.trigger('colaborador_destaque', {
      colaborador_id: colaboradorId,
      empresa_id:     empresaId,
      score_atual:    score.score_atual,
    });
  }
};

module.exports = { engagementQueue, startEngagementWorker };
