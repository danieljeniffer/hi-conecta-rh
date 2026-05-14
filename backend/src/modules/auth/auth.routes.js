'use strict';
const router = require('express').Router();
const ctrl   = require('./auth.controller');
const { validate }      = require('../../middleware/validate.middleware');
const { authenticate }  = require('../../middleware/auth.middleware');
const rateLimitMw       = require('../../middleware/rateLimit.middleware');
const {
  loginSchema, refreshSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema,
} = require('./auth.schema');

// POST /api/v1/auth/login
router.post('/login',
  rateLimitMw.auth,
  validate(loginSchema),
  ctrl.login
);

// POST /api/v1/auth/refresh
router.post('/refresh',
  validate(refreshSchema),
  ctrl.refresh
);

// POST /api/v1/auth/logout
router.post('/logout',
  authenticate,
  ctrl.logout
);

// GET /api/v1/auth/me
router.get('/me',
  authenticate,
  ctrl.me
);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password',
  rateLimitMw.auth,
  validate(forgotPasswordSchema),
  ctrl.forgotPassword
);

// POST /api/v1/auth/reset-password
router.post('/reset-password',
  validate(resetPasswordSchema),
  ctrl.resetPassword
);

// PUT /api/v1/auth/change-password
router.put('/change-password',
  authenticate,
  validate(changePasswordSchema),
  ctrl.changePassword
);

module.exports = router;
