'use strict';
const router = require('express').Router();

// ── Módulos ───────────────────────────────────
router.use('/auth',          require('../modules/auth/auth.routes'));
router.use('/tenant',        require('../modules/tenant/tenant.routes'));
router.use('/colaboradores', require('../modules/colaboradores/colaborador.routes'));
router.use('/departamentos', require('../modules/departamentos/departamento.routes'));
router.use('/cargos',        require('../modules/cargos/cargo.routes'));
router.use('/folha',         require('../modules/folha/folha.routes'));
router.use('/ferias',        require('../modules/ferias/ferias.routes'));
router.use('/rescisao',      require('../modules/rescisao/rescisao.routes'));
router.use('/dashboard',     require('../modules/dashboard/dashboard.routes'));
router.use('/auditoria',     require('../modules/auditoria/auditoria.routes'));
router.use('/documentos',    require('../modules/documentos/documento.routes'));
router.use('/onboarding',    require('../modules/onboarding/onboarding.routes'));
router.use('/workflows',     require('../modules/workflows/workflow.routes'));
router.use('/ponto',         require('../modules/ponto/ponto.routes'));
router.use('/notificacoes',  require('../modules/notificacoes/notificacao.routes'));
router.use('/comunicacao',   require('../modules/comunicacao/comunicacao.routes'));
router.use('/dp',            require('../modules/dp/dp-central.routes'));

module.exports = router;
