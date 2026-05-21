'use strict';
/**
 * webhookHandlers.js
 * Handlers Express para os 3 endpoints de webhook do Bitrix24.
 *
 * Cada handler:
 *   1. Valida token/assinatura via bitrixWebhookService
 *   2. Delega persistência e enfileiramento
 *   3. Responde imediatamente com 200 (resposta rápida para o Bitrix não retentar)
 *
 * URLs:
 *   POST /api/v1/integracoes/bitrix/webhook/:empresa_id/users
 *   POST /api/v1/integracoes/bitrix/webhook/:empresa_id/chat
 *   POST /api/v1/integracoes/bitrix/webhook/:empresa_id/knowledge
 *
 * @module bitrix24/webhooks/webhookHandlers
 */

const logger        = require('../../../config/logger');
const webhookService = require('../services/bitrixWebhookService');

/**
 * Handler genérico — delega ao webhookService e responde rápido.
 * @param {string} categoria
 */
const _handle = (categoria) => async (req, res) => {
  // Resposta imediata para evitar timeout do Bitrix24 (max 3s)
  res.status(200).json({ accepted: true });

  try {
    const result = await webhookService.handleWebhookRequest(req, categoria);
    if (!result.accepted) {
      logger.warn(`[Bitrix/Webhook/${categoria}] Rejeitado: ${result.message}`);
    } else {
      logger.debug(`[Bitrix/Webhook/${categoria}] Aceito: event_id=${result.event_id}`);
    }
  } catch (err) {
    // Loga mas não propaga — resposta já foi enviada
    logger.error(`[Bitrix/Webhook/${categoria}] Erro inesperado:`, err.message);
  }
};

/**
 * POST /webhook/:empresa_id/users
 * Eventos de usuários: ONUSERADD, ONUSERUPDATE
 */
const handleUsers = _handle('users');

/**
 * POST /webhook/:empresa_id/chat
 * Eventos sociais: IM_MESSAGE_ADD, POST_LIKED, COMMENT_CREATED, etc.
 */
const handleChat = _handle('chat');

/**
 * POST /webhook/:empresa_id/knowledge
 * Eventos de conhecimento: ARTICLE_VIEWED, ARTICLE_COMPLETED, etc.
 */
const handleKnowledge = _handle('knowledge');

/**
 * POST /webhook/:empresa_id (handler universal)
 * Aceita qualquer evento e detecta o grupo automaticamente.
 */
const handleAll = _handle('all');

module.exports = { handleUsers, handleChat, handleKnowledge, handleAll };
