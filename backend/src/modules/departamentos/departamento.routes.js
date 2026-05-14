'use strict';
const router  = require('express').Router();
const { prisma }  = require('../../config/database');
const { ok, created, noContent } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH }        = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant);

router.get('/', async (req, res, next) => {
  try {
    const depts = await prisma.departamento.findMany({
      where:   { empresa_id: req.user.empresa_id, ativo: true },
      include: { _count: { select: { colaboradores: true } } },
      orderBy: { nome: 'asc' },
    });
    ok(res, depts);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const dept = await prisma.departamento.findFirst({
      where: { id: req.params.id, empresa_id: req.user.empresa_id },
      include: {
        colaboradores: { where: { deleted_at: null }, select: { id: true, nome: true, foto_url: true, cargo: { select: { nome: true } } } },
        _count: { select: { colaboradores: true } },
      },
    });
    if (!dept) return res.status(404).json({ success: false, message: 'Departamento não encontrado.' });
    ok(res, dept);
  } catch (err) { next(err); }
});

router.post('/', onlyRH, async (req, res, next) => {
  try {
    const dept = await prisma.departamento.create({
      data: { empresa_id: req.user.empresa_id, ...req.body },
    });
    created(res, dept, 'Departamento criado.');
  } catch (err) { next(err); }
});

router.put('/:id', onlyRH, async (req, res, next) => {
  try {
    const dept = await prisma.departamento.update({
      where: { id: req.params.id },
      data:  req.body,
    });
    ok(res, dept, 'Departamento atualizado.');
  } catch (err) { next(err); }
});

router.delete('/:id', onlyRH, async (req, res, next) => {
  try {
    await prisma.departamento.update({
      where: { id: req.params.id },
      data:  { ativo: false, deleted_at: new Date() },
    });
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
