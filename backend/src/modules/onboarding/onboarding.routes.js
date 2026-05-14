'use strict';
const router  = require('express').Router();
const svc     = require('./onboarding.service');
const { ok }  = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant);

router.get('/:colaboradorId/tasks', async (req, res, next) => {
  try {
    const tasks = await svc.listarTasks(req.params.colaboradorId);
    ok(res, tasks);
  } catch (err) { next(err); }
});

router.patch('/tasks/:taskId/concluir', async (req, res, next) => {
  try {
    const task = await svc.concluirTask(req.params.taskId, req.body.colaborador_id, req.user.id);
    ok(res, task, 'Task concluída.');
  } catch (err) { next(err); }
});

router.post('/:colaboradorId/iniciar', async (req, res, next) => {
  try {
    await svc.iniciarOnboarding(req.params.colaboradorId, req.user.empresa_id);
    ok(res, null, 'Onboarding iniciado.');
  } catch (err) { next(err); }
});

module.exports = router;
