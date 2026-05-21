'use strict';
/**
 * bitrixChatService.js
 * Processa eventos sociais do Bitrix24 (chat, feed, reações).
 * Normaliza e persiste em EmployeeSocialEvent para o Engagement Engine.
 *
 * @module bitrix24/services/bitrixChatService
 */

const logger   = require('../../../config/logger');
const { prisma } = require('../../../config/database');

/**
 * Pesos de engajamento por tipo de evento (conforme especificação).
 */
const ENGAGEMENT_WEIGHTS = {
  MESSAGE:       2,
  COMMENT:       3,
  LIKE:          1,
  REPLY:         3,
  REACTION:      1,
  VIEW:          0,  // visualizações não pontuam diretamente
  POST_VIEWED:   0,
};

/**
 * Mapeia tipo de evento Bitrix24 para tipo normalizado interno.
 * @param {string} bitrixEventType
 * @returns {{ type: string, weight: number }}
 */
const _normalizeEventType = (bitrixEventType) => {
  const map = {
    'IM_MESSAGE_ADD':    { type: 'MESSAGE',  weight: ENGAGEMENT_WEIGHTS.MESSAGE  },
    'POST_LIKED':        { type: 'LIKE',     weight: ENGAGEMENT_WEIGHTS.LIKE     },
    'COMMENT_CREATED':   { type: 'COMMENT',  weight: ENGAGEMENT_WEIGHTS.COMMENT  },
    'MESSAGE_REACTION':  { type: 'REACTION', weight: ENGAGEMENT_WEIGHTS.REACTION },
    'POST_VIEWED':       { type: 'VIEW',     weight: ENGAGEMENT_WEIGHTS.VIEW     },
    'IMBOT_MESSAGE_ADD': { type: 'MESSAGE',  weight: ENGAGEMENT_WEIGHTS.MESSAGE  },
    'ONCRMACTIVITYADD':  { type: 'COMMENT',  weight: ENGAGEMENT_WEIGHTS.COMMENT  },
  };
  return map[bitrixEventType] || { type: bitrixEventType, weight: 0 };
};

/**
 * Encontra colaborador pelo bitrix_user_id armazenado em observacoes ou via email.
 * @param {string} empresaId
 * @param {string} bitrixUserId
 * @returns {Promise<Object|null>}
 */
const _findColaboradorByBitrixId = async (empresaId, bitrixUserId) => {
  // Primeiro tenta via BitrixEvent já processado (cache de vínculo)
  const lastEvent = await prisma.bitrixEvent.findFirst({
    where: {
      empresa_id:     empresaId,
      bitrix_user_id: String(bitrixUserId),
      colaborador_id: { not: null },
      processed:      true,
    },
    select: { colaborador_id: true },
    orderBy: { created_at: 'desc' },
  });

  if (lastEvent?.colaborador_id) {
    return { id: lastEvent.colaborador_id };
  }

  // Fallback: busca pela observação com bitrix_id
  return prisma.colaborador.findFirst({
    where: {
      empresa_id:  empresaId,
      observacoes: { contains: `bitrix_id:${bitrixUserId}` },
      deleted_at:  null,
    },
    select: { id: true },
  });
};

/**
 * Processa evento social do Bitrix24 e persiste como EmployeeSocialEvent.
 *
 * @param {string} empresaId
 * @param {string} eventType        - Tipo do evento Bitrix24
 * @param {Object} payload          - Payload do webhook
 * @param {string} bitrixEventId    - ID do registro BitrixEvent
 * @returns {Promise<Object>}
 */
const processEvent = async (empresaId, eventType, payload, bitrixEventId) => {
  const data         = payload.data || payload;
  const bitrixUserId = data.USER_ID || data.FROM_USER_ID || data.AUTHOR_ID || data.user_id;

  if (!bitrixUserId) {
    logger.warn(`[Bitrix/Chat] Evento ${eventType} sem user_id. Ignorando.`);
    return { status: 'ignorado', motivo: 'sem_user_id' };
  }

  const colaborador = await _findColaboradorByBitrixId(empresaId, String(bitrixUserId));

  if (!colaborador) {
    logger.debug(`[Bitrix/Chat] Colaborador não encontrado para Bitrix ${bitrixUserId} (${eventType})`);
    return { status: 'colaborador_nao_encontrado', bitrix_user_id: bitrixUserId };
  }

  const { type: normalizedType, weight } = _normalizeEventType(eventType);

  // Metadata sem dados pessoais (LGPD)
  const metadata = {
    bitrix_event_type: eventType,
    // Apenas IDs de referência, nunca conteúdo de mensagens
    message_id:  data.MESSAGE_ID || data.ID || null,
    channel_id:  data.CHAT_ID    || data.DIALOG_ID || null,
    post_id:     data.POST_ID    || null,
  };

  await prisma.employeeSocialEvent.create({
    data: {
      empresa_id:       empresaId,
      colaborador_id:   colaborador.id,
      bitrix_event_id:  bitrixEventId,
      event_type:       normalizedType,
      source:           'bitrix24',
      channel:          'chat',
      engagement_weight:weight,
      metadata,
    },
  });

  // Atualiza BitrixEvent com o colaborador vinculado
  await prisma.bitrixEvent.update({
    where: { id: bitrixEventId },
    data:  { colaborador_id: colaborador.id },
  });

  logger.debug(`[Bitrix/Chat] ${normalizedType} (+${weight}pts) → colaborador ${colaborador.id}`);

  return {
    status:         'processado',
    colaborador_id: colaborador.id,
    event_type:     normalizedType,
    weight,
  };
};

/**
 * Envia mensagem no Bitrix24 via API (para automações de RH).
 * Usado pelo Automation Engine para notificações.
 *
 * @param {string} empresaId
 * @param {string} bitrixUserId - ID do usuário Bitrix24
 * @param {string} message      - Texto da mensagem
 * @returns {Promise<Object>}
 */
const sendMessage = async (empresaId, bitrixUserId, message) => {
  const bitrixApi = require('./bitrixApiService');
  return bitrixApi.call(empresaId, 'im.message.add', {
    DIALOG_ID: `${bitrixUserId}`,
    MESSAGE:   message,
  }, { mutate: true });
};

module.exports = { processEvent, sendMessage };
