'use strict';
const router = require('express').Router();
const { prisma } = require('../../config/database');
const clt        = require('../../utils/clt');
const { ok, created } = require('../../utils/response');
const { authenticate } = require('../../middleware/auth.middleware');
const { onlyRH }       = require('../../middleware/rbac.middleware');
const { resolveTenant }= require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant, onlyRH);

// GET — listar rescisões
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.rescisao.findMany({
      where:   { empresa_id: req.user.empresa_id },
      include: { colaborador: { select: { nome: true, cpf: true, cargo: { select: { nome: true } } } } },
      orderBy: { created_at: 'desc' },
    });
    ok(res, list);
  } catch (err) { next(err); }
});

// POST /api/v1/rescisao/simular — simulação sem persistir
router.post('/simular', async (req, res, next) => {
  try {
    const { colaborador_id, data_rescisao, tipo_rescisao } = req.body;

    const colab = await prisma.colaborador.findFirst({
      where: { id: colaborador_id, empresa_id: req.user.empresa_id },
    });
    if (!colab) return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });

    const calc = clt.calcularRescisao({
      salarioBase:    parseFloat(colab.salario_base),
      dataAdmissao:   colab.data_admissao,
      dataRescisao:   new Date(data_rescisao),
      tipoRescisao:   tipo_rescisao,
      feriasVencidas: req.body.ferias_vencidas ?? 30,
      mesAtual:       new Date().getMonth() + 1,
    });

    ok(res, calc, 'Simulação de rescisão.');
  } catch (err) { next(err); }
});

// POST — criar rescisão oficial
router.post('/', async (req, res, next) => {
  try {
    const { colaborador_id, data_rescisao, tipo_rescisao, motivo } = req.body;

    const colab = await prisma.colaborador.findFirst({
      where: { id: colaborador_id, empresa_id: req.user.empresa_id },
    });
    if (!colab) return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });

    const calc = clt.calcularRescisao({
      salarioBase:  parseFloat(colab.salario_base),
      dataAdmissao: colab.data_admissao,
      dataRescisao: new Date(data_rescisao),
      tipoRescisao: tipo_rescisao,
      feriasVencidas: req.body.ferias_vencidas ?? 30,
      mesAtual:     new Date().getMonth() + 1,
    });

    const rescisao = await prisma.rescisao.create({
      data: {
        empresa_id:       req.user.empresa_id,
        colaborador_id,
        tipo:             tipo_rescisao,
        data_demissao:    new Date(data_rescisao),
        aviso_previo_dias: calc.aviso_previo_dias,
        saldo_salario:    calc.saldo_salario,
        ferias_vencidas:  calc.ferias_vencidas_val,
        ferias_proporc:   calc.ferias_proporcionais,
        terco_ferias:     0,
        decimo_proporc:   calc.decimo_proporcional,
        aviso_previo_val: calc.aviso_previo_indeniz,
        multa_fgts:       calc.multa_fgts,
        fgts_saldo:       calc.fgts_acumulado,
        inss:             calc.inss,
        irrf:             calc.irrf,
        total_bruto:      calc.total_bruto,
        total_liquido:    calc.total_liquido,
        motivo,
        status:           'calculada',
      },
    });

    created(res, { rescisao, calculos: calc }, 'Rescisão registrada.');
  } catch (err) { next(err); }
});

module.exports = router;
