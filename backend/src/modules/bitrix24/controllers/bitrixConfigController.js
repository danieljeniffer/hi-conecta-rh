'use strict';
/**
 * bitrixConfigController.js
 * Gerenciamento da configuração Bitrix24 por empresa.
 * Apenas perfis admin/rh têm acesso.
 *
 * @module bitrix24/controllers/bitrixConfigController
 */

const { ok, created, notFound, serverError } = require('../../../utils/response');
const logger = require('../../../config/logger');
const { prisma } = require('../../../config/database');
const { invalidateConfigCache } = require('../services/bitrixApiService');

/**
 * GET /api/v1/integracoes/bitrix/config
 * Retorna configuração atual (sem expor secrets).
 */
const getConfig = async (req, res, next) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where:  { id: req.user.empresa_id },
      select: { config: true },
    });

    const cfg = empresa?.config?.bitrix24 || null;
    if (!cfg) return ok(res, null, 'Bitrix24 não configurado.');

    // Ofusca o secret — nunca expõe ao frontend
    const { webhook_secret, ...seguro } = cfg;
    return ok(res, {
      ...seguro,
      tem_secret: !!webhook_secret,
      configurado: true,
    });
  } catch (err) { next(err); }
};

/**
 * PUT /api/v1/integracoes/bitrix/config
 * Salva ou atualiza configuração Bitrix24 na empresa.
 */
const saveConfig = async (req, res, next) => {
  try {
    const empresaId = req.user.empresa_id;
    const dados     = req.body;

    const empresa = await prisma.empresa.findUnique({
      where:  { id: empresaId },
      select: { config: true },
    });

    const configAtual = empresa?.config || {};
    const novaConfig  = {
      ...configAtual,
      bitrix24: {
        ...(configAtual.bitrix24 || {}),
        webhook_url:           dados.webhook_url,
        webhook_secret:        dados.webhook_secret || configAtual.bitrix24?.webhook_secret,
        sincronizar_usuarios:  dados.sincronizar_usuarios ?? true,
        sincronizar_chat:      dados.sincronizar_chat ?? true,
        sincronizar_knowledge: dados.sincronizar_knowledge ?? true,
        retencao_dias:         dados.retencao_dias ?? 365,
        ip_allowlist:          dados.ip_allowlist || [],
        atualizado_em:         new Date().toISOString(),
        atualizado_por:        req.user.id,
      },
    };

    await prisma.empresa.update({
      where: { id: empresaId },
      data:  { config: novaConfig },
    });

    // Invalida cache de configuração
    await invalidateConfigCache(empresaId);

    logger.info(`[Bitrix/Config] Configuração atualizada por ${req.user.email} (empresa ${empresaId})`);
    return ok(res, { configurado: true }, 'Configuração Bitrix24 salva com sucesso.');
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/integracoes/bitrix/config
 * Remove configuração Bitrix24 da empresa.
 */
const deleteConfig = async (req, res, next) => {
  try {
    const empresaId = req.user.empresa_id;

    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { config: true } });
    const config  = empresa?.config || {};
    delete config.bitrix24;

    await prisma.empresa.update({ where: { id: empresaId }, data: { config } });
    await invalidateConfigCache(empresaId);

    logger.warn(`[Bitrix/Config] Configuração removida por ${req.user.email}`);
    return ok(res, null, 'Configuração Bitrix24 removida.');
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/integracoes/bitrix/test
 * Testa a conectividade com o Bitrix24.
 */
const testConnection = async (req, res, next) => {
  try {
    const bitrixApi = require('../services/bitrixApiService');
    const result    = await bitrixApi.call(req.user.empresa_id, 'app.info', {});
    return ok(res, result, 'Conexão com Bitrix24 bem-sucedida.');
  } catch (err) {
    return ok(res, { erro: err.message, conectado: false }, 'Falha na conexão com Bitrix24.');
  }
};

module.exports = { getConfig, saveConfig, deleteConfig, testConnection };
