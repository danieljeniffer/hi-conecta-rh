'use strict';
const router  = require('express').Router();
const { prisma }  = require('../../config/database');
const clt         = require('../../utils/clt');
const { ok, created } = require('../../utils/response');
const { authenticate } = require('../../middleware/auth.middleware');
const { onlyRH, onlyGestor } = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { audit } = require('../../middleware/audit.middleware');

router.use(authenticate, resolveTenant);

// GET /api/v1/ferias — listar
router.get('/', onlyGestor, async (req, res, next) => {
  try {
    const { status, colaborador_id } = req.query;
    const ferias = await prisma.ferias.findMany({
      where: {
        empresa_id: req.user.empresa_id,
        deleted_at: null,
        ...(status         && { status }),
        ...(colaborador_id && { colaborador_id }),
      },
      include: {
        colaborador: { select: { id: true, nome: true, foto_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    ok(res, ferias);
  } catch (err) { next(err); }
});

// POST /api/v1/ferias — solicitar
router.post('/', audit('CREATE', 'ferias'), async (req, res, next) => {
  try {
    const {
      colaborador_id, periodo_inicio, periodo_fim,
      gozo_inicio, dias_solicitados, dias_abono,
    } = req.body;

    // Calcula valores estimados
    const colab = await prisma.colaborador.findFirst({ where: { id: colaborador_id, empresa_id: req.user.empresa_id } });
    if (!colab) return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });

    const calc = clt.calcularFerias(parseFloat(colab.salario_base), dias_solicitados, 1, dias_abono || 0);

    const ferias = await prisma.ferias.create({
      data: {
        empresa_id:       req.user.empresa_id,
        colaborador_id,
        periodo_inicio:   new Date(periodo_inicio),
        periodo_fim:      new Date(periodo_fim),
        gozo_inicio:      gozo_inicio ? new Date(gozo_inicio) : null,
        gozo_fim:         gozo_inicio ? new Date(new Date(gozo_inicio).getTime() + dias_solicitados * 86400000) : null,
        dias_solicitados,
        dias_abono:       dias_abono || 0,
        status:           'pendente',
        valor_ferias:     calc.salario_ferias,
        valor_terco:      calc.terco,
        valor_abono:      calc.abono,
        valor_inss:       calc.inss,
        valor_irrf:       calc.irrf,
        valor_liquido:    calc.liquido,
      },
    });

    created(res, ferias, 'Férias solicitadas. Aguardando aprovação.');
  } catch (err) { next(err); }
});

// PATCH /api/v1/ferias/:id/aprovar
router.patch('/:id/aprovar', onlyGestor, audit('APROVAR', 'ferias'), async (req, res, next) => {
  try {
    const ferias = await prisma.ferias.update({
      where: { id: req.params.id },
      data:  { status: 'aprovada', aprovado_por: req.user.id, aprovado_em: new Date() },
    });
    ok(res, ferias, 'Férias aprovadas.');
  } catch (err) { next(err); }
});

// PATCH /api/v1/ferias/:id/recusar
router.patch('/:id/recusar', onlyGestor, async (req, res, next) => {
  try {
    const ferias = await prisma.ferias.update({
      where: { id: req.params.id },
      data:  { status: 'recusada', recusado_motivo: req.body.motivo },
    });
    ok(res, ferias, 'Férias recusadas.');
  } catch (err) { next(err); }
});

// GET /api/v1/ferias/simulacao
router.get('/simulacao', async (req, res, next) => {
  try {
    const { salario, dias = 30, dependentes = 0, abono = 0 } = req.query;
    const calc = clt.calcularFerias(parseFloat(salario), parseInt(dias), parseInt(dependentes), parseInt(abono));
    ok(res, calc, 'Simulação de férias.');
  } catch (err) { next(err); }
});

module.exports = router;
