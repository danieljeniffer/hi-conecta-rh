const router = require('express').Router();
const ctrl = require('../controllers/beneficioController');

router.get('/catalogo', ctrl.listarCatalogo);
router.get('/relatorio', ctrl.relatorioBeneficios);
router.get('/colaborador/:colaborador_id', ctrl.listarPorColaborador);
router.post('/atribuir', ctrl.atribuir);
router.delete('/:id', ctrl.remover);

module.exports = router;
