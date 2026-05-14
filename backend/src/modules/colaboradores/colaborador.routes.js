'use strict';
const router = require('express').Router();
const ctrl   = require('./colaborador.controller');
const { authenticate }   = require('../../middleware/auth.middleware');
const { onlyRH, onlyGestor, ownOrRH } = require('../../middleware/rbac.middleware');
const { resolveTenant, checkColaboradorLimit } = require('../../middleware/tenant.middleware');
const { audit, auditRead } = require('../../middleware/audit.middleware');
const { singleFoto }     = require('../../middleware/upload.middleware');

// Todos precisam estar autenticados e com tenant resolvido
router.use(authenticate, resolveTenant);

// GET /api/v1/colaboradores
router.get('/',      onlyGestor, ctrl.listar);
router.get('/kpis',  onlyGestor, ctrl.kpis);

// GET /api/v1/colaboradores/:id
router.get('/:id',   ownOrRH, auditRead('colaboradores'), ctrl.buscar);

// POST /api/v1/colaboradores
router.post('/',
  onlyRH,
  checkColaboradorLimit,
  audit('CREATE', 'colaboradores'),
  ctrl.criar
);

// PUT /api/v1/colaboradores/:id
router.put('/:id',
  onlyRH,
  audit('UPDATE', 'colaboradores'),
  ctrl.atualizar
);

// PATCH /api/v1/colaboradores/:id/desligar
router.patch('/:id/desligar',
  onlyRH,
  audit('DESLIGAR', 'colaboradores'),
  ctrl.desligar
);

// DELETE /api/v1/colaboradores/:id
router.delete('/:id',
  onlyRH,
  audit('DELETE', 'colaboradores'),
  ctrl.remover
);

// ── Dependentes ───────────────────────────────
router.get   ('/:id/dependentes',         ownOrRH, ctrl.listarDependentes);
router.post  ('/:id/dependentes',         onlyRH, ctrl.criarDependente);
router.delete('/:id/dependentes/:depId',  onlyRH, ctrl.removerDependente);

// ── Histórico salarial ────────────────────────
router.get('/:id/historico-salarial', onlyGestor, ctrl.historicSalarial);

module.exports = router;
