const router = require('express').Router();
const ctrl = require('../controllers/decimoTerceiroController');

router.get('/calcular', ctrl.calcular);
router.get('/calcular-todos', ctrl.calcularTodos);
router.post('/registrar', ctrl.registrar);

module.exports = router;
