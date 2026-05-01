const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');

router.get('/resumo', ctrl.resumoGeral);
router.get('/custo-empresa', ctrl.custoEmpresa);
router.get('/turnover', ctrl.turnover);

module.exports = router;
