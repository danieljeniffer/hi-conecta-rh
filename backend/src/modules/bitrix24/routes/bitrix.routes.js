'use strict';
/**
 * bitrix.routes.js
 * Roteador completo da integração Bitrix24.
 *
 * Rotas públicas (webhook):
 *   POST /webhook/:empresa_id/users
 *   POST /webhook/:empresa_id/chat
 *   POST /webhook/:empresa_id/knowledge
 *   POST /webhook/:empresa_id  (universal)
 *
 * Rotas autenticadas (API RH):
 *   GET  /config
 *   PUT  /config
 *   DELETE /config
 *   POST /test
 *
 *   GET  /engagement/dashboard
 *   GET  /engagement/ranking
 *   GET  /engagement/heatmap
 *   GET  /engagement/riscos
 *   GET  /engagement/colaborador/:id
 *   GET  /engagement/eventos/:colaboradorId
 *
 *   POST /sync/usuarios
 *   POST /engagement/recalcular
 *
 * @module bitrix24/routes/bitrix.routes
 */

const router = require('express').Router();

// ── Middleware ────────────────────────────────────────────────────
const { authenticate }   = require('../../../middleware/auth.middleware');
const { onlyRH, onlyAdmin, onlyGestor } = require('../../../middleware/rbac.middleware');
const { resolveTenant }  = require('../../../middleware/tenant.middleware');
const { audit }          = require('../../../middleware/audit.middleware');
const { validate }       = require('../../../middleware/validate.middleware');
const rateLimit          = require('../../../middleware/rateLimit.middleware');

// ── Validators ────────────────────────────────────────────────────
const {
  configSchema, engagementQuerySchema,
  sendMessageSchema, webhookPayloadSchema,
} = require('../validators/bitrix.validators');

// ── Controllers ───────────────────────────────────────────────────
const configCtrl    = require('../controllers/bitrixConfigController');
const engagCtrl     = require('../controllers/bitrixEngagementController');
const webhookHandlers = require('../webhooks/webhookHandlers');

// Rate limit específico para webhooks (mais permissivo — Bitrix envia muitos eventos)
const webhookRateLimit = rateLimit.global; // usa global por padrão

// ════════════════════════════════════════════════════════════════
// ROTAS PÚBLICAS — Webhooks do Bitrix24 (sem autenticação JWT)
// A segurança é feita via assinatura HMAC + token por empresa
// ════════════════════════════════════════════════════════════════

/**
 * @api {post} /webhook/:empresa_id/users Webhook de usuários
 * @apiDescription Recebe eventos ONUSERADD, ONUSERUPDATE do Bitrix24
 * @apiParam  {string} empresa_id ID da empresa (no path)
 * @apiHeader {string} X-Bitrix-Signature Assinatura HMAC-SHA256 (opcional se configurada)
 * @apiSuccess {boolean} accepted true se aceito
 */
router.post('/webhook/:empresa_id/users',
  webhookRateLimit,
  webhookHandlers.handleUsers
);

/**
 * @api {post} /webhook/:empresa_id/chat Webhook de chat/feed
 * @apiDescription Recebe eventos IM_MESSAGE_ADD, POST_LIKED, COMMENT_CREATED, etc.
 */
router.post('/webhook/:empresa_id/chat',
  webhookRateLimit,
  webhookHandlers.handleChat
);

/**
 * @api {post} /webhook/:empresa_id/knowledge Webhook de base de conhecimento
 * @apiDescription Recebe eventos ARTICLE_VIEWED, ARTICLE_COMPLETED, etc.
 */
router.post('/webhook/:empresa_id/knowledge',
  webhookRateLimit,
  webhookHandlers.handleKnowledge
);

/**
 * @api {post} /webhook/:empresa_id Handler universal (todos os eventos)
 */
router.post('/webhook/:empresa_id',
  webhookRateLimit,
  webhookHandlers.handleAll
);

// ════════════════════════════════════════════════════════════════
// ROTAS AUTENTICADAS — Requerem JWT + perfil adequado
// ════════════════════════════════════════════════════════════════

router.use(authenticate, resolveTenant);

// ── Configuração ──────────────────────────────────────────────────

/**
 * @api {get} /config Obtém configuração atual do Bitrix24
 * @apiPermission rh, admin
 */
router.get('/config',
  onlyRH,
  configCtrl.getConfig
);

/**
 * @api {put} /config Salva/atualiza configuração Bitrix24
 * @apiPermission admin
 */
router.put('/config',
  onlyAdmin,
  validate(configSchema),
  audit('UPDATE', 'bitrix24_config'),
  configCtrl.saveConfig
);

/**
 * @api {delete} /config Remove configuração Bitrix24
 * @apiPermission admin
 */
router.delete('/config',
  onlyAdmin,
  audit('DELETE', 'bitrix24_config'),
  configCtrl.deleteConfig
);

/**
 * @api {post} /test Testa conectividade com Bitrix24
 * @apiPermission admin
 */
router.post('/test',
  onlyAdmin,
  configCtrl.testConnection
);

// ── Dashboard de Engajamento ──────────────────────────────────────

/**
 * @api {get} /engagement/dashboard Dashboard executivo de engajamento
 * @apiPermission rh, analista, gestor, admin
 */
router.get('/engagement/dashboard',
  onlyGestor,
  engagCtrl.getDashboard
);

/**
 * @api {get} /engagement/ranking Ranking de colaboradores por engajamento
 * @apiPermission rh, analista, gestor, admin
 * @apiQuery {number} [limit=20] Máx. colaboradores
 * @apiQuery {string} [classificacao] Filtro por classificação
 * @apiQuery {string} [risco] Filtro por nível de risco
 */
router.get('/engagement/ranking',
  onlyGestor,
  engagCtrl.getRanking
);

/**
 * @api {get} /engagement/heatmap Heatmap por departamento
 * @apiPermission rh, analista, gestor, admin
 * @apiQuery {string} [periodo] YYYY-MM (padrão: mês atual)
 */
router.get('/engagement/heatmap',
  onlyGestor,
  engagCtrl.getHeatmap
);

/**
 * @api {get} /engagement/riscos Colaboradores em risco de desengajamento
 * @apiPermission rh, admin
 * @apiQuery {string} [nivel=alto] Nível mínimo de risco (medio|alto|critico)
 * @apiQuery {number} [limit=50]
 */
router.get('/engagement/riscos',
  onlyRH,
  engagCtrl.getRiscos
);

/**
 * @api {get} /engagement/colaborador/:id Score de um colaborador específico
 * @apiPermission próprio colaborador, gestor+
 */
router.get('/engagement/colaborador/:id',
  engagCtrl.getColaboradorScore
);

/**
 * @api {get} /engagement/eventos/:colaboradorId Eventos sociais (sem conteúdo)
 * @apiPermission próprio colaborador, gestor+
 */
router.get('/engagement/eventos/:colaboradorId',
  engagCtrl.getEventosColaborador
);

// ── Sincronização e Administração ────────────────────────────────

/**
 * @api {post} /sync/usuarios Dispara sincronização manual de usuários
 * @apiPermission rh, admin
 * @apiBody {string} [desde] Data ISO 8601 para sync incremental
 */
router.post('/sync/usuarios',
  onlyRH,
  audit('SYNC', 'bitrix24_usuarios'),
  engagCtrl.syncUsuarios
);

/**
 * @api {post} /engagement/recalcular Força recálculo de scores da empresa
 * @apiPermission admin
 */
router.post('/engagement/recalcular',
  onlyAdmin,
  audit('RECALCULAR', 'engagement_scores'),
  engagCtrl.recalcularTodos
);

module.exports = router;
