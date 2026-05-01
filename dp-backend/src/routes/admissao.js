const router = require('express').Router();
const ctrl = require('../controllers/admissaoController');

router.get('/', ctrl.listar);
router.post('/', ctrl.registrar);
router.post('/:admissao_id/esocial', ctrl.enviarESocial);

module.exports = router;
