const router = require('express').Router();
const ctrl = require('../controllers/feriasController');

router.get('/colaborador/:colaborador_id', ctrl.listarPorColaborador);
router.get('/colaborador/:colaborador_id/periodos', ctrl.gerarPeriodosAquisitivos);
router.post('/colaborador/:colaborador_id/sincronizar', ctrl.sincronizarPeriodos);
router.post('/calcular', ctrl.calcular);
router.post('/agendar', ctrl.agendar);

module.exports = router;
