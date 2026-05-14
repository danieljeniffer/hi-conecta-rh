'use strict';
const { prisma } = require('../config/database');
const logger     = require('../config/logger');

/**
 * Registra ação sensível no log de auditoria
 * Uso: router.post('/rota', audit('CREATE', 'colaboradores'), controller.fn)
 */
const audit = (acao, recurso) => async (req, res, next) => {
  // Guarda o json original antes de mutação
  req._dadosAntes = req.body ? JSON.parse(JSON.stringify(req.body)) : null;

  const originalJson = res.json.bind(res);

  res.json = function(data) {
    if (res.statusCode < 400) {
      setImmediate(async () => {
        try {
          await prisma.auditLog.create({
            data: {
              empresa_id:   req.user?.empresa_id || null,
              usuario_id:   req.user?.id         || null,
              acao,
              recurso,
              recurso_id:   req.params?.id       || data?.data?.id || null,
              dados_antes:  req._dadosAntes,
              dados_depois: req.body,
              ip:           req.ip || req.connection?.remoteAddress,
              user_agent:   req.headers['user-agent'],
            },
          });
        } catch (err) {
          logger.error('[Audit] Erro ao salvar log:', err.message);
        }
      });
    }
    return originalJson(data);
  };

  next();
};

/**
 * Middleware para logar acessos a dados sensíveis (GET)
 */
const auditRead = (recurso) => async (req, res, next) => {
  setImmediate(async () => {
    try {
      await prisma.auditLog.create({
        data: {
          empresa_id: req.user?.empresa_id || null,
          usuario_id: req.user?.id         || null,
          acao:       'READ',
          recurso,
          recurso_id: req.params?.id || null,
          ip:         req.ip,
          user_agent: req.headers['user-agent'],
        },
      });
    } catch { /* não bloqueia a resposta */ }
  });
  next();
};

module.exports = { audit, auditRead };
