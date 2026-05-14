'use strict';
const router  = require('express').Router();
const { prisma }  = require('../../config/database');
const { ok, paginated } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH }        = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { parsePagination } = require('../../utils/pagination');

router.use(authenticate, resolveTenant, onlyRH);

router.get('/', async (req, res, next) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);
    const { recurso, usuario_id, acao, data_inicio, data_fim } = req.query;

    const where = {
      empresa_id: req.user.empresa_id,
      ...(recurso    && { recurso }),
      ...(usuario_id && { usuario_id }),
      ...(acao       && { acao }),
      ...(data_inicio && data_fim && {
        created_at: { gte: new Date(data_inicio), lte: new Date(data_fim) },
      }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip, take,
        orderBy: { created_at: 'desc' },
        include: { usuario: { select: { nome: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return paginated(res, logs, { total, page, per_page });
  } catch (err) { next(err); }
});

module.exports = router;
