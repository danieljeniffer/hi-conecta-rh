const router = require('express').Router();
const ctrl = require('../controllers/folhaController');

router.post('/periodos', ctrl.abrirPeriodo);
router.get('/periodos/:periodo_id', ctrl.listarFolhaPeriodo);
router.post('/periodos/:periodo_id/calcular', ctrl.calcularFolhaCompleta);
router.post('/periodos/:periodo_id/fechar', ctrl.fecharPeriodo);
router.post('/periodos/:periodo_id/colaboradores/:colaborador_id', ctrl.calcularFolhaColaborador);

module.exports = router;
