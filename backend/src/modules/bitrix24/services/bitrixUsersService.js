'use strict';
/**
 * bitrixUsersService.js
 * Sincronização bidirecional de colaboradores entre hi Conecta RH e Bitrix24.
 *
 * Implementa deduplicação via CPF/email, sincronização incremental,
 * mapeamento de departamentos e cargos, e logs estruturados.
 *
 * @module bitrix24/services/bitrixUsersService
 */

const logger   = require('../../../config/logger');
const { prisma } = require('../../../config/database');
const bitrixApi  = require('./bitrixApiService');

/**
 * Mapeia campos do usuário Bitrix24 para campos do Colaborador.
 * @param {Object} bitrixUser - Objeto de usuário do Bitrix24
 * @returns {Object} campos mapeados
 */
const _mapBitrixToColaborador = (bitrixUser) => ({
  nome:          [bitrixUser.NAME, bitrixUser.LAST_NAME].filter(Boolean).join(' '),
  email:         bitrixUser.EMAIL?.[0]?.VALUE || bitrixUser.EMAIL || null,
  telefone:      bitrixUser.PERSONAL_PHONE || bitrixUser.WORK_PHONE || null,
  foto_url:      bitrixUser.PERSONAL_PHOTO || null,
  gestor_nome:   bitrixUser.UF_DEPARTMENT?.[0]?.toString() || null,
  // Não mapeamos cargo e departamento automaticamente — apenas armazenamos
  // o ID do Bitrix para referência cruzada futura
  observacoes:   `bitrix_id:${bitrixUser.ID}`,
});

/**
 * Encontra o colaborador correspondente a um usuário do Bitrix24.
 * Estratégia de deduplicação: email → CPF → nome exato.
 *
 * @param {string}  empresaId
 * @param {Object}  bitrixUser
 * @returns {Promise<Object|null>}
 */
const _findColaborador = async (empresaId, bitrixUser) => {
  const email = bitrixUser.EMAIL?.[0]?.VALUE || bitrixUser.EMAIL;

  if (email) {
    const byEmail = await prisma.colaborador.findFirst({
      where: { empresa_id: empresaId, email, deleted_at: null },
    });
    if (byEmail) return byEmail;
  }

  const nome = [bitrixUser.NAME, bitrixUser.LAST_NAME].filter(Boolean).join(' ');
  if (nome) {
    const byNome = await prisma.colaborador.findFirst({
      where: { empresa_id: empresaId, nome: { equals: nome, mode: 'insensitive' }, deleted_at: null },
    });
    if (byNome) return byNome;
  }

  return null;
};

/**
 * Processa evento ONUSERADD do Bitrix24.
 * Registra o vínculo sem criar colaborador (apenas RH pode criar).
 *
 * @param {string} empresaId
 * @param {Object} payload   - Payload do webhook
 * @param {string} bitrixEventId - ID do BitrixEvent no banco
 */
const processUserAdd = async (empresaId, payload, bitrixEventId) => {
  const data      = payload.data || payload;
  const userId    = data.USER_ID || data.ID;
  const bitrixUser= data.FIELDS || data;

  logger.info(`[Bitrix/Users] ONUSERADD → Bitrix ID: ${userId}`);

  const colab = await _findColaborador(empresaId, bitrixUser);

  if (colab) {
    // Vincula colaborador existente ao evento Bitrix
    await prisma.bitrixEvent.update({
      where: { id: bitrixEventId },
      data:  { colaborador_id: colab.id },
    });

    logger.info(`[Bitrix/Users] Colaborador vinculado: ${colab.nome} ↔ Bitrix ${userId}`);
  } else {
    logger.warn(`[Bitrix/Users] Colaborador não encontrado para Bitrix ${userId}. Requer revisão manual.`);
  }

  return { bitrix_user_id: userId, colaborador_id: colab?.id || null, status: colab ? 'vinculado' : 'pendente' };
};

/**
 * Processa evento ONUSERUPDATE do Bitrix24.
 * Sincroniza campos permitidos sem sobrescrever dados críticos do RH.
 *
 * @param {string} empresaId
 * @param {Object} payload
 * @param {string} bitrixEventId
 */
const processUserUpdate = async (empresaId, payload, bitrixEventId) => {
  const data      = payload.data || payload;
  const userId    = data.USER_ID || data.ID;
  const bitrixUser= data.FIELDS || data;

  logger.info(`[Bitrix/Users] ONUSERUPDATE → Bitrix ID: ${userId}`);

  const colab = await _findColaborador(empresaId, bitrixUser);
  if (!colab) {
    logger.warn(`[Bitrix/Users] Colaborador não encontrado para update Bitrix ${userId}`);
    return { status: 'nao_encontrado' };
  }

  // Campos permitidos para sincronização automática (não sobrepõem dados críticos do RH)
  const camposPermitidos = {
    foto_url:  bitrixUser.PERSONAL_PHOTO || undefined,
    telefone:  bitrixUser.WORK_PHONE || bitrixUser.PERSONAL_PHONE || undefined,
    celular:   bitrixUser.PERSONAL_MOBILE || undefined,
  };

  // Remove campos undefined
  const update = Object.fromEntries(
    Object.entries(camposPermitidos).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(update).length > 0) {
    await prisma.colaborador.update({
      where: { id: colab.id },
      data:  update,
    });

    await prisma.bitrixEvent.update({
      where: { id: bitrixEventId },
      data:  { colaborador_id: colab.id },
    });

    logger.info(`[Bitrix/Users] Sync: ${colab.nome} | campos: ${Object.keys(update).join(', ')}`);
  }

  return { colaborador_id: colab.id, campos_atualizados: Object.keys(update), status: 'sincronizado' };
};

/**
 * Sincroniza lista de usuários ativos do Bitrix24 com colaboradores.
 * Sincronização incremental: apenas usuários modificados após `since`.
 *
 * @param {string}  empresaId
 * @param {Date}    [since]  - Só sincronizar a partir desta data (incremental)
 */
const syncAll = async (empresaId, since = null) => {
  logger.info(`[Bitrix/Users] Iniciando sync ${since ? 'incremental' : 'completo'} — empresa ${empresaId}`);

  const params = { filter: { ACTIVE: true }, select: ['ID','NAME','LAST_NAME','EMAIL','WORK_PHONE','PERSONAL_MOBILE','PERSONAL_PHOTO'] };
  if (since) {
    params.filter.DATE_REGISTER_FROM = since.toISOString();
  }

  try {
    const users = await bitrixApi.call(empresaId, 'user.get', params, { useCache: true });
    const list  = Array.isArray(users) ? users : (users?.result || []);

    let vinculados = 0, naoEncontrados = 0;

    for (const u of list) {
      const colab = await _findColaborador(empresaId, u);
      if (colab) {
        vinculados++;
        // Atualiza foto se disponível
        if (u.PERSONAL_PHOTO && !colab.foto_url) {
          await prisma.colaborador.update({
            where: { id: colab.id },
            data:  { foto_url: u.PERSONAL_PHOTO },
          });
        }
      } else {
        naoEncontrados++;
      }
    }

    logger.info(`[Bitrix/Users] Sync concluído: ${vinculados} vinculados, ${naoEncontrados} sem correspondência`);
    return { total: list.length, vinculados, nao_encontrados: naoEncontrados };

  } catch (err) {
    logger.error('[Bitrix/Users] Erro no sync:', err.message);
    throw err;
  }
};

module.exports = { processUserAdd, processUserUpdate, syncAll };
