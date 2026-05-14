'use strict';
const router = require('express').Router();
const { getDashboard } = require('./dashboard.service');
const { ok } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyGestor }    = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant, onlyGestor);

router.get('/', async (req, res, next) => {
  try {
    const data = await getDashboard(req.user.empresa_id);
    ok(res, data, 'Dashboard carregado.');
  } catch (err) { next(err); }
});

module.exports = router;
