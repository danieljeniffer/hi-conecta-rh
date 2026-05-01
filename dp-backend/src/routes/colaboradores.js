const router = require('express').Router();
const ctrl = require('../controllers/colaboradorController');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.patch('/:id/salario', ctrl.atualizarSalario);
router.get('/:id/historico-salarial', ctrl.historico);

module.exports = router;
