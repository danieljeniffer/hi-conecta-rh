'use strict';
const { prisma }   = require('../config/database');
const { forbidden, badRequest } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Injeta req.empresa com dados do tenant atual
 * e bloqueia requests se empresa inativa/vencida
 */
const resolveTenant = async (req, res, next) => {
  try {
    const empresaId = req.user?.empresa_id;
    if (!empresaId) return badRequest(res, 'Empresa não identificada.');

    const empresa = await prisma.empresa.findFirst({
      where: { id: empresaId, deleted_at: null },
      select: {
        id:               true,
        nome:             true,
        cnpj:             true,
        plano:            true,
        status:           true,
        trial_ate:        true,
        max_colaboradores: true,
        config:           true,
      },
    });

    if (!empresa) return forbidden(res, 'Empresa não encontrada.');

    // Verifica status da empresa
    if (empresa.status === 'cancelada') {
      return forbidden(res, 'Sua assinatura foi cancelada. Contate o suporte.');
    }

    if (empresa.status === 'suspensa') {
      return forbidden(res, 'Conta suspensa por inadimplência. Regularize o pagamento.');
    }

    // Verifica expiração do trial
    if (empresa.status === 'trial' && empresa.trial_ate && new Date() > empresa.trial_ate) {
      logger.warn(`[Tenant] Trial vencido: ${empresa.id} — ${empresa.nome}`);
      return forbidden(res, 'Período de trial expirado. Faça upgrade do seu plano.');
    }

    req.empresa = empresa;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Verifica limite de colaboradores por plano
 * Usar em rotas de criação de colaborador
 */
const checkColaboradorLimit = async (req, res, next) => {
  try {
    if (!req.empresa) return next();

    const { id, max_colaboradores, plano } = req.empresa;

    const count = await prisma.colaborador.count({
      where: { empresa_id: id, deleted_at: null, status: { not: 'desligado' } },
    });

    if (count >= max_colaboradores) {
      return forbidden(res,
        `Limite de ${max_colaboradores} colaboradores atingido no plano ${plano}. ` +
        'Faça upgrade para adicionar mais.'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { resolveTenant, checkColaboradorLimit };
