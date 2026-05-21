'use strict';
/**
 * bitrixWebhookService.js
 * Validação, autenticação e roteamento de webhooks do Bitrix24.
 *
 * Responsável por:
 *  - Verificar assinatura HMAC-SHA256 do payload
 *  - Validar origem do IP (opcional por empresa)
 *  - Persistir evento bruto antes de enfileirar
 *  - Rotear para a fila correta conforme evento
 *
 * @module bitrix24/services/bitrixWebhookService
 */

const crypto   = require('crypto');
const logger   = require('../../../config/logger');
const { prisma } = require('../../../config/database');
const { _loadConfig } = require('./bitrixApiService');

/**
 * Grupos de eventos por categoria para roteamento.
 */
const EVENT_GROUPS = {
  users: ['ONUSERADD', 'ONUSERUPDATE', 'ONUSERDELETE'],
  chat:  ['IM_MESSAGE_ADD', 'POST_LIKED', 'COMMENT_CREATED', 'MESSAGE_REACTION', 'POST_VIEWED', 'IMBOT_MESSAGE_ADD'],
  knowledge: ['ARTICLE_VIEWED', 'ARTICLE_COMPLETED', 'KNOWLEDGE_ACCESS', 'POLICY_VIEWED', 'MATERIAL_COMPLETED'],
};

/**
 * Identifica o grupo de um evento Bitrix24.
 * @param {string} eventType
 * @returns {'users'|'chat'|'knowledge'|'unknown'}
 */
const getEventGroup = (eventType) => {
  for (const [group, events] of Object.entries(EVENT_GROUPS)) {
    if (events.includes(eventType)) return group;
  }
  return 'unknown';
};

/**
 * Verifica a assinatura HMAC-SHA256 do webhook do Bitrix24.
 * O Bitrix envia X-Bitrix-Signature no header.
 *
 * @param {Buffer|string} rawBody    - Corpo bruto da requisição
 * @param {string}        signature  - Header X-Bitrix-Signature
 * @param {string}        secret     - Secret configurado pela empresa
 * @returns {boolean}
 */
const verifySignature = (rawBody, signature, secret) => {
  if (!secret || !signature) return false;
  const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature.replace(/^sha256=/, '')));
};

/**
 * Persiste o evento bruto no banco e enfileira para processamento assíncrono.
 * Esta função é idempotente e resiliente — nunca perde um evento.
 *
 * @param {string}  empresaId
 * @param {string}  eventType
 * @param {Object}  payload
 * @param {string}  [sourceIp]
 * @returns {Promise<Object>} evento persistido
 */
const persistAndEnqueue = async (empresaId, eventType, payload, sourceIp = null) => {
  const bitrixUserId = payload?.data?.USER_ID
    || payload?.data?.FROM_USER_ID
    || payload?.data?.AUTHOR_ID
    || null;

  // 1. Persiste evento bruto (ledger imutável)
  const event = await prisma.bitrixEvent.create({
    data: {
      empresa_id:    empresaId,
      event_type:    eventType,
      bitrix_user_id:bitrixUserId ? String(bitrixUserId) : null,
      payload:       payload,
      processed:     false,
      source_ip:     sourceIp,
    },
  });

  // 2. Enfileira para processamento assíncrono (fila bitrix-events)
  const { bitrixEventsQueue } = require('../../bitrix24/workers/bitrixEventWorker');
  await bitrixEventsQueue.add('process-event', {
    bitrix_event_id: event.id,
    empresa_id:      empresaId,
    event_type:      eventType,
    group:           getEventGroup(eventType),
    payload,
  }, {
    priority: eventType.startsWith('ONUSER') ? 1 : 2, // usuários = alta prioridade
    jobId:    `bitrix:${event.id}`, // deduplicação por event ID
  });

  logger.info(`[Bitrix/Webhook] Evento ${eventType} persistido (${event.id}) e enfileirado`);
  return event;
};

/**
 * Valida e processa uma requisição de webhook recebida.
 *
 * @param {Object} req       - Express request
 * @param {string} categoria - 'users' | 'chat' | 'knowledge'
 * @returns {Promise<{accepted: boolean, event_id: string|null, message: string}>}
 */
const handleWebhookRequest = async (req, categoria) => {
  const empresaId = req.params.empresa_id || req.query.empresa_id;

  if (!empresaId) {
    return { accepted: false, event_id: null, message: 'empresa_id ausente na URL' };
  }

  // Carrega configuração da empresa
  const config = await _loadConfig(empresaId);
  if (!config) {
    return { accepted: false, event_id: null, message: 'Empresa não configurada para Bitrix24' };
  }

  // Extrai evento
  const body      = req.body || {};
  const eventType = body.event || body.EVENT || '';

  if (!eventType) {
    return { accepted: false, event_id: null, message: 'Tipo de evento não identificado' };
  }

  // Verifica se o evento pertence à categoria esperada
  const group = getEventGroup(eventType);
  if (categoria !== 'all' && group !== categoria) {
    logger.warn(`[Bitrix/Webhook] Evento ${eventType} enviado para endpoint errado (${categoria})`);
    return { accepted: false, event_id: null, message: `Evento ${eventType} não pertence a ${categoria}` };
  }

  // Verifica assinatura (se configurada)
  if (config.webhook_secret) {
    const signature = req.headers['x-bitrix-signature'] || '';
    const rawBody   = req.rawBody || JSON.stringify(body);
    if (!verifySignature(rawBody, signature, config.webhook_secret)) {
      logger.warn(`[Bitrix/Webhook] Assinatura inválida para empresa ${empresaId}`);
      return { accepted: false, event_id: null, message: 'Assinatura inválida' };
    }
  }

  // Persiste e enfileira
  const sourceIp = req.headers['x-forwarded-for'] || req.ip;
  const event    = await persistAndEnqueue(empresaId, eventType, body, sourceIp);

  return { accepted: true, event_id: event.id, message: 'Webhook aceito' };
};

module.exports = { handleWebhookRequest, verifySignature, getEventGroup, EVENT_GROUPS };
