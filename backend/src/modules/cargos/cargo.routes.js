'use strict';
const router = require('express').Router();
const { prisma }  = require('../../config/database');
const { ok, created, noContent } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH }        = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant);

router.get('/', async (req, res, next) => {
  try {
    const cargos = await prisma.cargo.findMany({
      where:   { empresa_id: req.user.empresa_id, ativo: true, deleted_at: null },
      include: { _count: { select: { colaboradores: true } } },
      orderBy: { nome: 'asc' },
    });
    ok(res, cargos);
  } catch (err) { next(err); }
});

router.post('/', onlyRH, async (req, res, next) => {
  try {
    const cargo = await prisma.cargo.create({
      data: { empresa_id: req.user.empresa_id, ...req.body },
    });
    created(res, cargo, 'Cargo criado.');
  } catch (err) { next(err); }
});

router.put('/:id', onlyRH, async (req, res, next) => {
  try {
    const cargo = await prisma.cargo.update({ where: { id: req.params.id }, data: req.body });
    ok(res, cargo, 'Cargo atualizado.');
  } catch (err) { next(err); }
});

router.delete('/:id', onlyRH, async (req, res, next) => {
  try {
    await prisma.cargo.update({
      where: { id: req.params.id },
      data:  { ativo: false, deleted_at: new Date() },
    });
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
