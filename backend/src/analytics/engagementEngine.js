'use strict';
/**
 * engagementEngine.js
 * Motor central de cálculo de scores de engajamento organizacional.
 *
 * Score 0-100 baseado em:
 *   +2  mensagem enviada
 *   +3  comentário criado
 *   +1  curtida/reação
 *   +3  resposta em thread
 *   +5  participação em evento de RH
 *   +2  visualização de política
 *   +4  leitura completa de artigo/material
 *   -10 15 dias sem nenhuma interação
 *
 * Classificação:
 *   0-30   baixo
 *   31-60  médio
 *   61-80  alto
 *   81-100 muito_engajado
 *
 * LGPD: Nenhum conteúdo de mensagens é armazenado.
 * Apenas contadores e timestamps são usados no cálculo.
 *
 * @module analytics/engagementEngine
 */

const { prisma } = require('../config/database');
const logger     = require('../config/logger');

// ── Tabela de pontuação ───────────────────────────────────────────

const PONTUACAO = {
  MESSAGE:          2,
  COMMENT:          3,
  LIKE:             1,
  REPLY:            3,
  REACTION:         1,
  RH_PARTICIPATION: 5,
  POLICY_READ:      2,
  ARTICLE_READ:     2,
  ARTICLE_COMPLETED:4,
  MATERIAL_COMPLETED:4,
  KNOWLEDGE_ACCESS: 2,
  VIEW:             0,
  // Penalidades
  INATIVO_15D:     -10,
};

// ── Janelas temporais de análise ─────────────────────────────────

const JANELA_SCORE_DIAS  = 30; // janela principal do score
const JANELA_DELTA_7D    = 7;
const JANELA_DELTA_30D   = 30;
const MAX_SCORE          = 100;
const SCORE_CAP_DIARIO   = 30; // evita inflação por spam de eventos

// ── Limites de classificação ─────────────────────────────────────

const CLASSIFICACOES = [
  { min: 81, max: 100, label: 'muito_engajado' },
  { min: 61, max: 80,  label: 'alto'           },
  { min: 31, max: 60,  label: 'medio'          },
  { min: 0,  max: 30,  label: 'baixo'          },
];

/** Limites para risco de desengajamento */
const RISCO = {
  critico: { maxScore: 20, ouDias: 20 },
  alto:    { maxScore: 35, ouDias: 15 },
  medio:   { maxScore: 50, ouDias: 7  },
};

/**
 * Classifica o score em categoria textual.
 * @param {number} score
 * @returns {string}
 */
const classificar = (score) => {
  for (const c of CLASSIFICACOES) {
    if (score >= c.min && score <= c.max) return c.label;
  }
  return 'baixo';
};

/**
 * Determina o nível de risco de desengajamento.
 * @param {number} score
 * @param {number} diasSemInteracao
 * @returns {string}
 */
const calcularRisco = (score, diasSemInteracao) => {
  if (score <= RISCO.critico.maxScore || diasSemInteracao >= RISCO.critico.ouDias) return 'critico';
  if (score <= RISCO.alto.maxScore    || diasSemInteracao >= RISCO.alto.ouDias)    return 'alto';
  if (score <= RISCO.medio.maxScore   || diasSemInteracao >= RISCO.medio.ouDias)   return 'medio';
  return 'baixo';
};

/**
 * Busca eventos de um colaborador em uma janela temporal.
 * @param {string} colaboradorId
 * @param {Date}   desde
 * @param {Date}   [ate=now]
 * @returns {Promise<Array>}
 */
const _buscarEventos = (colaboradorId, desde, ate = new Date()) =>
  prisma.employeeSocialEvent.findMany({
    where: {
      colaborador_id: colaboradorId,
      created_at:     { gte: desde, lte: ate },
    },
    select: { event_type: true, engagement_weight: true, created_at: true },
    orderBy: { created_at: 'asc' },
  });

/**
 * Calcula a pontuação total de um array de eventos,
 * aplicando o cap diário (anti-spam).
 *
 * @param {Array}  eventos
 * @returns {{ total: number, porTipo: Object }}
 */
const _calcularPontuacao = (eventos) => {
  // Agrupa por dia para aplicar cap diário
  const porDia = eventos.reduce((acc, e) => {
    const dia = e.created_at.toISOString().slice(0, 10);
    if (!acc[dia]) acc[dia] = { total: 0, eventos: [] };
    acc[dia].total += e.engagement_weight;
    acc[dia].eventos.push(e);
    return acc;
  }, {});

  let total  = 0;
  const porTipo = {};

  for (const [, diaData] of Object.entries(porDia)) {
    // Aplica cap diário para evitar inflação
    const pontosHoje = Math.min(diaData.total, SCORE_CAP_DIARIO);
    total += pontosHoje;

    for (const e of diaData.eventos) {
      porTipo[e.event_type] = (porTipo[e.event_type] || 0) + e.engagement_weight;
    }
  }

  return { total, porTipo };
};

/**
 * Calcula o impacto no risco de saída (integração com People Analytics).
 * Um engajamento baixo aumenta o risco de saída.
 *
 * @param {number} score
 * @param {string} risco
 * @returns {number} impacto 0-1 (multiplicador no score de risco de saída)
 */
const _calcularRiscoSaidaImpacto = (score, risco) => {
  const base = { critico: 0.9, alto: 0.6, medio: 0.3, baixo: 0.1 };
  return parseFloat((base[risco] || 0.1).toFixed(2));
};

/**
 * Calcula o score de engajamento completo de um colaborador.
 * Função principal do Engagement Engine.
 *
 * @param {string}  colaboradorId
 * @param {string}  empresaId
 * @returns {Promise<Object|null>}
 */
const calcularScore = async (colaboradorId, empresaId) => {
  try {
    const agora       = new Date();
    const inicio30d   = new Date(agora.getTime() - JANELA_SCORE_DIAS  * 86400_000);
    const inicio7d    = new Date(agora.getTime() - JANELA_DELTA_7D    * 86400_000);
    const inicio7dAnt = new Date(agora.getTime() - JANELA_DELTA_7D    * 2 * 86400_000);

    // Busca eventos das diferentes janelas em paralelo
    const [eventos30d, eventos7d, eventos7dAnteriores, scoreAtual] = await Promise.all([
      _buscarEventos(colaboradorId, inicio30d),
      _buscarEventos(colaboradorId, inicio7d),
      _buscarEventos(colaboradorId, inicio7dAnt, inicio7d),
      prisma.employeeEngagementScore.findUnique({ where: { colaborador_id: colaboradorId } }),
    ]);

    // Calcula pontuações por janela
    const { total: total30d, porTipo } = _calcularPontuacao(eventos30d);
    const { total: total7d }           = _calcularPontuacao(eventos7d);
    const { total: total7dAnt }        = _calcularPontuacao(eventos7dAnteriores);

    // Score normalizado para 0-100 (base: 100 pontos em 30 dias = score 100)
    const scoreRaw    = Math.min(total30d, MAX_SCORE);
    const score       = Math.round(scoreRaw);

    // Penalidade por inatividade
    let diasSemInteracao = 0;
    if (eventos30d.length > 0) {
      const ultimoEvento = new Date(Math.max(...eventos30d.map(e => e.created_at)));
      diasSemInteracao   = Math.floor((agora - ultimoEvento) / 86400_000);
    } else {
      diasSemInteracao = JANELA_SCORE_DIAS; // sem eventos = 30 dias sem interação
    }

    const scoreComPenalidade = diasSemInteracao >= 15
      ? Math.max(0, score + PONTUACAO.INATIVO_15D)
      : score;

    // Deltas
    const delta7d  = total7d  - total7dAnt;
    const delta30d = scoreComPenalidade - (scoreAtual?.score_anterior || 0);

    const classificacao   = classificar(scoreComPenalidade);
    const risco           = calcularRisco(scoreComPenalidade, diasSemInteracao);
    const riscoSaidaImpacto = _calcularRiscoSaidaImpacto(scoreComPenalidade, risco);

    // Componentes do score (para breakdown no dashboard)
    const componentes = {
      mensagens:   (porTipo.MESSAGE || 0) + (porTipo.REPLY || 0),
      interacoes:  (porTipo.LIKE || 0) + (porTipo.COMMENT || 0) + (porTipo.REACTION || 0),
      conhecimento:(porTipo.ARTICLE_READ || 0) + (porTipo.ARTICLE_COMPLETED || 0) + (porTipo.POLICY_READ || 0) + (porTipo.KNOWLEDGE_ACCESS || 0),
      participacao: porTipo.RH_PARTICIPATION || 0,
    };

    const ultimoEvento = eventos30d.length > 0
      ? new Date(Math.max(...eventos30d.map(e => e.created_at)))
      : null;

    return {
      colaborador_id:     colaboradorId,
      empresa_id:         empresaId,
      score:              scoreComPenalidade,
      scoreAnterior:      scoreAtual?.score_atual || 0,
      classificacao,
      delta7d,
      delta30d,
      componentes,
      diasSemInteracao,
      ultimoEvento,
      totalEventos30d:    eventos30d.length,
      risco,
      riscoSaidaImpacto,
    };

  } catch (err) {
    logger.error(`[EngagementEngine] Erro ao calcular score de ${colaboradorId}:`, err.message);
    return null;
  }
};

/**
 * Recalcula scores de todos os colaboradores ativos de uma empresa.
 * Utilizado pelo job agendado diário.
 *
 * @param {string} empresaId
 * @returns {Promise<{ processados: number, erros: number }>}
 */
const recalcularEmpresa = async (empresaId) => {
  logger.info(`[EngagementEngine] Recalculando empresa ${empresaId}...`);

  const colaboradores = await prisma.colaborador.findMany({
    where:  { empresa_id: empresaId, status: { not: 'desligado' }, deleted_at: null },
    select: { id: true },
  });

  let processados = 0, erros = 0;

  for (const { id } of colaboradores) {
    try {
      const resultado = await calcularScore(id, empresaId);
      if (!resultado) { erros++; continue; }

      await prisma.employeeEngagementScore.upsert({
        where:  { colaborador_id: id },
        update: {
          score_anterior:       resultado.scoreAnterior,
          score_atual:          resultado.score,
          classificacao:        resultado.classificacao,
          delta_7d:             resultado.delta7d,
          delta_30d:            resultado.delta30d,
          score_mensagens:      resultado.componentes.mensagens,
          score_interacoes:     resultado.componentes.interacoes,
          score_conhecimento:   resultado.componentes.conhecimento,
          score_participacao:   resultado.componentes.participacao,
          dias_sem_interacao:   resultado.diasSemInteracao,
          ultimo_evento_em:     resultado.ultimoEvento,
          total_eventos_30d:    resultado.totalEventos30d,
          risco_desengajamento: resultado.risco,
          risco_saida_impacto:  resultado.riscoSaidaImpacto,
          computed_at:          new Date(),
        },
        create: {
          colaborador_id:       id,
          empresa_id:           empresaId,
          score_atual:          resultado.score,
          classificacao:        resultado.classificacao,
          delta_7d:             resultado.delta7d,
          delta_30d:            resultado.delta30d,
          score_mensagens:      resultado.componentes.mensagens,
          score_interacoes:     resultado.componentes.interacoes,
          score_conhecimento:   resultado.componentes.conhecimento,
          score_participacao:   resultado.componentes.participacao,
          dias_sem_interacao:   resultado.diasSemInteracao,
          ultimo_evento_em:     resultado.ultimoEvento,
          total_eventos_30d:    resultado.totalEventos30d,
          risco_desengajamento: resultado.risco,
          risco_saida_impacto:  resultado.riscoSaidaImpacto,
        },
      });
      processados++;
    } catch (err) {
      logger.error(`[EngagementEngine] Erro ao processar ${id}:`, err.message);
      erros++;
    }
  }

  logger.info(`[EngagementEngine] Empresa ${empresaId}: ${processados} OK, ${erros} erros`);
  return { processados, erros };
};

module.exports = { calcularScore, recalcularEmpresa, classificar, calcularRisco, PONTUACAO };
