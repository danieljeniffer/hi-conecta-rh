'use strict';
/**
 * bitrixKnowledgeService.js
 * Processa eventos de Base de Conhecimento do Bitrix24.
 * Leitura de artigos, acesso a políticas e conclusão de materiais
 * são pontuados no Engagement Engine.
 *
 * @module bitrix24/services/bitrixKnowledgeService
 */

const logger   = require('../../../config/logger');
const { prisma } = require('../../../config/database');

/**
 * Pesos específicos para eventos de conhecimento.
 */
const KNOWLEDGE_WEIGHTS = {
  ARTICLE_VIEWED:     2,
  ARTICLE_COMPLETED:  4,
  KNOWLEDGE_ACCESS:   2,
  POLICY_VIEWED:      2,
  MATERIAL_COMPLETED: 4,
};

/**
 * Normaliza evento de conhecimento.
 * @param {string} eventType
 * @returns {{ type: string, weight: number, channel: string }}
 */
const _normalizeKnowledgeEvent = (eventType) => {
  const map = {
    'ARTICLE_VIEWED':      { type: 'ARTICLE_READ',      weight: 2, channel: 'knowledge' },
    'ARTICLE_COMPLETED':   { type: 'ARTICLE_COMPLETED', weight: 4, channel: 'knowledge' },
    'KNOWLEDGE_ACCESS':    { type: 'KNOWLEDGE_ACCESS',  weight: 2, channel: 'knowledge' },
    'POLICY_VIEWED':       { type: 'POLICY_READ',       weight: 2, channel: 'knowledge' },
    'MATERIAL_COMPLETED':  { type: 'MATERIAL_COMPLETED',weight: 4, channel: 'knowledge' },
  };
  return map[eventType] || { type: eventType, weight: 0, channel: 'knowledge' };
};

/**
 * Processa evento de base de conhecimento.
 *
 * @param {string} empresaId
 * @param {string} eventType
 * @param {Object} payload
 * @param {string} bitrixEventId
 * @returns {Promise<Object>}
 */
const processKnowledgeEvent = async (empresaId, eventType, payload, bitrixEventId) => {
  const data         = payload.data || payload;
  const bitrixUserId = data.USER_ID || data.AUTHOR_ID || data.user_id;
  const articleId    = data.ARTICLE_ID || data.SECTION_ID || data.ID;

  if (!bitrixUserId) {
    logger.warn(`[Bitrix/Knowledge] Evento ${eventType} sem user_id. Ignorando.`);
    return { status: 'ignorado', motivo: 'sem_user_id' };
  }

  // Encontra colaborador (reutiliza lógica do chat service)
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

  const colaboradorId = lastEvent?.colaborador_id;

  if (!colaboradorId) {
    logger.debug(`[Bitrix/Knowledge] Colaborador não encontrado para Bitrix ${bitrixUserId}`);
    return { status: 'colaborador_nao_encontrado' };
  }

  const { type, weight, channel } = _normalizeKnowledgeEvent(eventType);

  // Metadata sem dados pessoais (LGPD compliant)
  const metadata = {
    bitrix_event_type: eventType,
    article_id:        articleId || null,
    section_id:        data.SECTION_ID || null,
  };

  await prisma.employeeSocialEvent.create({
    data: {
      empresa_id:       empresaId,
      colaborador_id:   colaboradorId,
      bitrix_event_id:  bitrixEventId,
      event_type:       type,
      source:           'bitrix24',
      channel,
      engagement_weight:weight,
      metadata,
    },
  });

  await prisma.bitrixEvent.update({
    where: { id: bitrixEventId },
    data:  { colaborador_id: colaboradorId },
  });

  // Eventos de conclusão = participação em treinamento RH (+5pts via Engagement Engine)
  if (type === 'MATERIAL_COMPLETED' || type === 'ARTICLE_COMPLETED') {
    await prisma.employeeSocialEvent.create({
      data: {
        empresa_id:       empresaId,
        colaborador_id:   colaboradorId,
        bitrix_event_id:  bitrixEventId,
        event_type:       'RH_PARTICIPATION',
        source:           'bitrix24',
        channel:          'rh_event',
        engagement_weight:5, // bônus por conclusão
        metadata:         { ...metadata, bonus: true },
      },
    });
  }

  logger.debug(`[Bitrix/Knowledge] ${type} (+${weight}pts) → colaborador ${colaboradorId}`);

  return {
    status:         'processado',
    colaborador_id: colaboradorId,
    event_type:     type,
    weight,
  };
};

module.exports = { processKnowledgeEvent };
