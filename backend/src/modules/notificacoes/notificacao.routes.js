'use strict';
const router = require('express').Router();
const svc    = require('./notificacao.service');
const { ok } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant);

router.get('/', async (req, res, next) => {
  try {
    const list = await svc.listar(req.user.id, req.user.empresa_id, req.query);
    ok(res, list);
  } catch (err) { next(err); }
});

router.patch('/:id/lida', async (req, res, next) => {
  try {
    await svc.marcarLida(req.params.id, req.user.id);
    ok(res, null, 'Notificação marcada como lida.');
  } catch (err) { next(err); }
});

router.patch('/todas/lidas', async (req, res, next) => {
  try {
    await svc.marcarTodasLidas(req.user.id);
    ok(res, null, 'Todas notificações marcadas como lidas.');
  } catch (err) { next(err); }
});

module.exports = router;
