'use strict';
/**
 * bitrixEngagementService.js
 * Camada de serviço para leitura e exposição dos dados de engajamento.
 * Não calcula scores (isso é responsabilidade do Engagement Engine).
 * Fornece queries otimizadas para dashboards e People Analytics.
 *
 * @module bitrix24/services/bitrixEngagementService
 */

const { prisma } = require('../../../config/database');
const logger     = require('../../../config/logger');

/**
 * Retorna o score de engajamento de um colaborador específico.
 * Retorna dados anonimizados se o colaborador optou por isso (LGPD).
 *
 * @param {string} colaboradorId
 * @param {string} empresaId
 * @returns {Promise<Object|null>}
 */
const getScoreByColaborador = async (colaboradorId, empresaId) => {
  const score = await prisma.employeeEngagementScore.findUnique({
    where: { colaborador_id: colaboradorId },
    include: { colaborador: { select: { id: true, nome: true, departamento_id: true, empresa_id: true } } },
  });

  if (!score || score.colaborador.empresa_id !== empresaId) return null;
  if (score.dados_anonimizados) {
    return { anonimizado: true, classificacao: score.classificacao, risco: score.risco_desengajamento };
  }
  return score;
};

/**
 * Retorna ranking de engajamento da empresa para dashboard RH.
 * Respeita LGPD: sem dados pessoais nos dashboards estratégicos.
 *
 * @param {string}  empresaId
 * @param {Object}  [opts]
 * @param {number}  [opts.limit=20]
 * @param {string}  [opts.classificacao]  - filtrar por classificação
 * @param {string}  [opts.risco]          - filtrar por risco_desengajamento
 * @returns {Promise<Array>}
 */
const getRankingEmpresa = async (empresaId, opts = {}) => {
  const { limit = 20, classificacao, risco } = opts;

  const where = {
    colaborador: { empresa_id: empresaId, deleted_at: null },
    dados_anonimizados: false,
    ...(classificacao && { classificacao }),
    ...(risco         && { risco_desengajamento: risco }),
  };

  return prisma.employeeEngagementScore.findMany({
    where,
    include: {
      colaborador: {
        select: {
          id:             true,
          nome:           true,
          foto_url:       true,
          departamento_id:true,
          departamento:   { select: { nome: true } },
          cargo:          { select: { nome: true } },
        },
      },
    },
    orderBy: { score_atual: 'desc' },
    take:    limit,
  });
};

/**
 * Retorna heatmap de engajamento por departamento.
 * Usado no dashboard de People Analytics.
 *
 * @param {string} empresaId
 * @param {string} [periodo]  - YYYY-MM (padrão: mês atual)
 * @returns {Promise<Array>}
 */
const getHeatmapDepartamentos = async (empresaId, periodo = null) => {
  const mes = periodo || new Date().toISOString().slice(0, 7);

  const metrics = await prisma.employeeBehaviorMetrics.findMany({
    where: {
      empresa_id: empresaId,
      periodo:    mes,
    },
    include: {
      colaborador: {
        select: { departamento_id: true, departamento: { select: { nome: true } } },
      },
    },
  });

  // Agrupa por departamento
  const byDept = metrics.reduce((acc, m) => {
    const deptId   = m.colaborador.departamento_id || 'sem_departamento';
    const deptNome = m.colaborador.departamento?.nome || 'Sem Departamento';
    if (!acc[deptId]) {
      acc[deptId] = { id: deptId, nome: deptNome, total_colaboradores: 0, score_medio: 0, scores: [] };
    }
    acc[deptId].total_colaboradores++;
    acc[deptId].scores.push(m.engagement_score_fim);
    return acc;
  }, {});

  return Object.values(byDept).map(d => ({
    ...d,
    score_medio: d.scores.length ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
    scores:      undefined, // não expõe array bruto
  }));
};

/**
 * Retorna colaboradores em risco de desengajamento.
 * Usado pelas automações e alertas do RH.
 *
 * @param {string}  empresaId
 * @param {string}  [nivelRisco='alto'] - 'medio' | 'alto' | 'critico'
 * @param {number}  [limit=50]
 * @returns {Promise<Array>}
 */
const getColaboradoresEmRisco = async (empresaId, nivelRisco = 'alto', limit = 50) => {
  const niveisInclusos = {
    critico: ['critico'],
    alto:    ['alto', 'critico'],
    medio:   ['medio', 'alto', 'critico'],
  }[nivelRisco] || ['alto', 'critico'];

  return prisma.employeeEngagementScore.findMany({
    where: {
      colaborador:           { empresa_id: empresaId, status: { not: 'desligado' }, deleted_at: null },
      risco_desengajamento:  { in: niveisInclusos },
      dados_anonimizados:    false,
    },
    include: {
      colaborador: {
        select: {
          id:             true,
          nome:           true,
          email:          true,
          departamento:   { select: { nome: true } },
          gestor_nome:    true,
        },
      },
    },
    orderBy: [{ risco_desengajamento: 'desc' }, { score_atual: 'asc' }],
    take:    limit,
  });
};

/**
 * Retorna métricas de comportamento de um colaborador por período.
 *
 * @param {string}   colaboradorId
 * @param {string}   empresaId
 * @param {number}   [meses=3]  - Quantos meses de histórico
 * @returns {Promise<Array>}
 */
const getMetricasHistoricas = async (colaboradorId, empresaId, meses = 3) => {
  const from = new Date();
  from.setMonth(from.getMonth() - meses);
  const periodoFrom = from.toISOString().slice(0, 7);

  return prisma.employeeBehaviorMetrics.findMany({
    where: {
      colaborador_id: colaboradorId,
      empresa_id:     empresaId,
      periodo:        { gte: periodoFrom },
    },
    orderBy: { periodo: 'asc' },
  });
};

/**
 * Retorna estatísticas globais de engajamento da empresa para o dashboard executivo.
 *
 * @param {string} empresaId
 * @returns {Promise<Object>}
 */
const getResumoEmpresa = async (empresaId) => {
  const [scores, periodoAtual] = await Promise.all([
    prisma.employeeEngagementScore.findMany({
      where:  { colaborador: { empresa_id: empresaId, deleted_at: null }, dados_anonimizados: false },
      select: { score_atual: true, classificacao: true, risco_desengajamento: true, dias_sem_interacao: true },
    }),
    prisma.employeeBehaviorMetrics.aggregate({
      where:   { empresa_id: empresaId, periodo: new Date().toISOString().slice(0, 7) },
      _sum:    { total_mensagens: true, total_artigos_lidos: true, dias_ativos: true },
      _count:  { id: true },
    }),
  ]);

  const total = scores.length || 1;
  const distribuicao = scores.reduce((acc, s) => {
    acc[s.classificacao] = (acc[s.classificacao] || 0) + 1;
    return acc;
  }, {});

  return {
    total_colaboradores_analisados: total,
    score_medio:    Math.round(scores.reduce((s, e) => s + e.score_atual, 0) / total),
    distribuicao,
    riscos: {
      critico: scores.filter(s => s.risco_desengajamento === 'critico').length,
      alto:    scores.filter(s => s.risco_desengajamento === 'alto').length,
      medio:   scores.filter(s => s.risco_desengajamento === 'medio').length,
      baixo:   scores.filter(s => s.risco_desengajamento === 'baixo').length,
    },
    atividade_mes: {
      total_mensagens:    periodoAtual._sum.total_mensagens    || 0,
      total_artigos:      periodoAtual._sum.total_artigos_lidos || 0,
      colaboradores_ativos: periodoAtual._count.id || 0,
    },
    sem_atividade_15d: scores.filter(s => s.dias_sem_interacao >= 15).length,
  };
};

module.exports = {
  getScoreByColaborador,
  getRankingEmpresa,
  getHeatmapDepartamentos,
  getColaboradoresEmRisco,
  getMetricasHistoricas,
  getResumoEmpresa,
};
