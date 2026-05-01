const router = require('express').Router();
const ctrl = require('../controllers/notificacaoController');

router.get('/', ctrl.listar);
router.patch('/:id/ler', ctrl.marcarLida);
router.patch('/:id/arquivar', ctrl.arquivar);
router.post('/falta', ctrl.registrarFalta);
router.post('/verificar', ctrl.executarVerificacoes);

module.exports = router;
