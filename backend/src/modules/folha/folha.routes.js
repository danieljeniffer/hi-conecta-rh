'use strict';
const router = require('express').Router();
const svc    = require('./folha.service');
const { ok, created } = require('../../utils/response');
const { authenticate } = require('../../middleware/auth.middleware');
const { onlyRH }       = require('../../middleware/rbac.middleware');
const { resolveTenant }= require('../../middleware/tenant.middleware');
const { audit }        = require('../../middleware/audit.middleware');

router.use(authenticate, resolveTenant);

// GET  /api/v1/folha  — listar períodos
router.get('/', async (req, res, next) => {
  try { ok(res, await svc.listarPeriodos(req.user.empresa_id, req.query)); }
  catch (err) { next(err); }
});

// POST /api/v1/folha/abrir  — abrir período
router.post('/abrir', onlyRH, audit('CREATE', 'folha'), async (req, res, next) => {
  try {
    const folha = await svc.abrirPeriodo(req.user.empresa_id, req.body.competencia);
    created(res, folha, 'Período de folha aberto.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

// POST /api/v1/folha/:id/calcular  — calcular
router.post('/:id/calcular', onlyRH, audit('CALCULAR', 'folha'), async (req, res, next) => {
  try {
    const folha = await svc.calcularFolha(req.user.empresa_id, req.params.id, req.body);
    ok(res, folha, 'Folha calculada com sucesso.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

// POST /api/v1/folha/:id/aprovar
router.post('/:id/aprovar', onlyRH, audit('APROVAR', 'folha'), async (req, res, next) => {
  try {
    const folha = await svc.aprovarFolha(req.user.empresa_id, req.params.id, req.user.id);
    ok(res, folha, 'Folha aprovada.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

// POST /api/v1/folha/:id/pagar
router.post('/:id/pagar', onlyRH, async (req, res, next) => {
  try {
    const folha = await svc.marcarComoPaga(req.user.empresa_id, req.params.id);
    ok(res, folha, 'Folha marcada como paga.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

// GET /api/v1/folha/holerite/:competencia/:colaboradorId
router.get('/holerite/:competencia/:colaboradorId', async (req, res, next) => {
  try {
    const h = await svc.holerite(req.user.empresa_id, req.params.competencia, req.params.colaboradorId);
    ok(res, h);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

module.exports = router;
