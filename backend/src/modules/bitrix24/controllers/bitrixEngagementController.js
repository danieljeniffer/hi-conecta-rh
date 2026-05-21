'use strict';
/**
 * bitrixEngagementController.js
 * Endpoints de People Analytics de engajamento.
 * Controllers finos — toda lógica nos services.
 *
 * @module bitrix24/controllers/bitrixEngagementController
 */

const { ok, notFound, forbidden } = require('../../../utils/response');
const engagementSvc = require('../services/bitrixEngagementService');
const { prisma }    = require('../../../config/database');

/**
 * GET /api/v1/integracoes/bitrix/engagement/dashboard
 * Resumo executivo de engajamento da empresa.
 * LGPD: dados anonimizados nos totais.
 */
const getDashboard = async (req, res, next) => {
  try {
    const resumo = await engagementSvc.getResumoEmpresa(req.user.empresa_id);
    return ok(res, resumo, 'Dashboard de engajamento.');
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/integracoes/bitrix/engagement/ranking
 * Ranking de colaboradores por score de engajamento.
 */
const getRanking = async (req, res, next) => {
  try {
    const { limit, classificacao, risco } = req.query;
    const ranking = await engagementSvc.getRankingEmpresa(req.user.empresa_id, {
      limit:         parseInt(limit) || 20,
      classificacao: classificacao || undefined,
      risco:         risco || undefined,
    });
    return ok(res, ranking);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/integracoes/bitrix/engagement/heatmap
 * Heatmap de engajamento por departamento.
 */
const getHeatmap = async (req, res, next) => {
  try {
    const { periodo } = req.query;
    const heatmap = await engagementSvc.getHeatmapDepartamentos(req.user.empresa_id, periodo);
    return ok(res, heatmap, 'Heatmap de engajamento por departamento.');
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/integracoes/bitrix/engagement/riscos
 * Lista colaboradores em risco de desengajamento.
 */
const getRiscos = async (req, res, next) => {
  try {
    const { nivel = 'alto', limit } = req.query;
    const riscos = await engagementSvc.getColaboradoresEmRisco(
      req.user.empresa_id, nivel, parseInt(limit) || 50
    );
    return ok(res, riscos, `Colaboradores em risco ${nivel}.`);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/integracoes/bitrix/engagement/colaborador/:id
 * Score e métricas de um colaborador específico.
 * Requer: próprio colaborador ou perfil RH+.
 */
const getColaboradorScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { perfil, colaborador_id, empresa_id } = req.user;

    // RBAC: colaborador acessa apenas seus próprios dados
    if (!['admin','rh','analista','gestor'].includes(perfil) && colaborador_id !== id) {
      return forbidden(res, 'Acesso negado a dados de outro colaborador.');
    }

    const score = await engagementSvc.getScoreByColaborador(id, empresa_id);
    if (!score) return notFound(res, 'Score de engajamento não encontrado.');

    const historico = await engagementSvc.getMetricasHistoricas(id, empresa_id, 3);
    return ok(res, { score, historico });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/integracoes/bitrix/engagement/eventos/:colaboradorId
 * Eventos sociais de um colaborador (sem conteúdo — LGPD).
 */
const getEventosColaborador = async (req, res, next) => {
  try {
    const { colaboradorId } = req.params;
    const { perfil, colaborador_id, empresa_id } = req.user;

    if (!['admin','rh','analista','gestor'].includes(perfil) && colaborador_id !== colaboradorId) {
      return forbidden(res, 'Acesso negado.');
    }

    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    const eventos = await prisma.employeeSocialEvent.findMany({
      where:   { colaborador_id: colaboradorId, empresa_id, created_at: { gte: desde } },
      select:  { event_type: true, source: true, channel: true, engagement_weight: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take:    200,
    });

    return ok(res, eventos, 'Eventos dos últimos 30 dias (sem conteúdo pessoal).');
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/integracoes/bitrix/sync/usuarios
 * Dispara sincronização manual de usuários.
 */
const syncUsuarios = async (req, res, next) => {
  try {
    const { desde } = req.body;
    const usersService = require('../services/bitrixUsersService');
    const result = await usersService.syncAll(
      req.user.empresa_id,
      desde ? new Date(desde) : null
    );
    return ok(res, result, 'Sincronização iniciada.');
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/integracoes/bitrix/engagement/recalcular
 * Força recálculo de scores de toda a empresa (apenas admin).
 */
const recalcularTodos = async (req, res, next) => {
  try {
    const EngagementEngine = require('../../../analytics/engagementEngine');
    // Executa em background para não bloquear a resposta
    setImmediate(() => EngagementEngine.recalcularEmpresa(req.user.empresa_id));
    return ok(res, null, 'Recálculo iniciado em background. Dashboards serão atualizados em instantes.');
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard, getRanking, getHeatmap, getRiscos,
  getColaboradorScore, getEventosColaborador,
  syncUsuarios, recalcularTodos,
};
