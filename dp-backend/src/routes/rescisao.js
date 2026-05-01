const router = require('express').Router();
const ctrl = require('../controllers/rescisaoController');

router.post('/calcular', ctrl.calcular);
router.post('/', ctrl.registrar);
router.get('/:id', ctrl.buscarPorId);
router.post('/:id/esocial', ctrl.enviarESocial);

module.exports = router;
