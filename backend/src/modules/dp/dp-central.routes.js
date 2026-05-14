'use strict';
const router  = require('express').Router();
const { ok }  = require('../../utils/response');
const clt     = require('../../utils/clt');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH }        = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { prisma }        = require('../../config/database');
const { audit }         = require('../../middleware/audit.middleware');
const { z }             = require('zod');
const { validate }      = require('../../middleware/validate.middleware');

router.use(authenticate, resolveTenant);

// ── Schemas ────────────────────────────────────────
const calcSchema = z.object({
  tipo:          z.enum(['ferias','rescisao','decimo','folha','adiantamento','simulacao_salarial','aviso_previo']),
  colaborador_id:z.string().uuid(),
  dias:               z.number().min(5).max(30).optional(),
  abono:              z.number().min(0).max(10).optional(),
  dependentes:        z.number().min(0).max(20).optional(),
  tipo_rescisao:      z.string().optional(),
  data_rescisao:      z.string().optional(),
  ferias_vencidas:    z.number().min(0).max(30).optional(),
  aviso_indenizado:   z.boolean().optional(),
  meses:              z.number().min(1).max(12).optional(),
  parcela:            z.enum(['1','2','total']).optional(),
  dias_trabalhados:   z.number().min(1).max(31).optional(),
  faltas:             z.number().min(0).optional(),
  horas_extras_50:    z.number().min(0).optional(),
  horas_extras_100:   z.number().min(0).optional(),
  desconto_plano:     z.number().min(0).optional(),
  percentual:         z.number().min(1).max(100).optional(),
  novo_salario:       z.number().min(0).optional(),
});

// POST /api/v1/dp/calcular — cálculo central com dados do banco
router.post('/calcular', validate(calcSchema), audit('CALCULAR', 'dp_central'), async (req, res, next) => {
  try {
    const { tipo, colaborador_id, ...params } = req.body;

    const colab = await prisma.colaborador.findFirst({
      where: { id: colaborador_id, empresa_id: req.user.empresa_id, deleted_at: null },
      include: { dependentes: { where: { ir: true } } },
    });

    if (!colab) return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });

    const sal        = parseFloat(colab.salario_base);
    const dep        = colab.dependentes.length + (params.dependentes || 0);
    const admissao   = colab.data_admissao;
    let resultado;

    switch (tipo) {
      case 'ferias':
        resultado = clt.calcularFerias(sal, params.dias || 30, dep, params.abono || 0);
        break;

      case 'rescisao':
        resultado = clt.calcularRescisao({
          salarioBase:    sal,
          dataAdmissao:   admissao,
          dataRescisao:   params.data_rescisao ? new Date(params.data_rescisao) : new Date(),
          tipoRescisao:   params.tipo_rescisao || 'sem_justa_causa',
          feriasVencidas: params.ferias_vencidas ?? 30,
          mesAtual:       new Date().getMonth() + 1,
        });
        break;

      case 'decimo':
        resultado = clt.calcularDecimo(sal, params.meses || 12, dep);
        break;

      case 'folha': {
        const base   = (sal / 30) * (params.dias_trabalhados || 30);
        const faltas = ((params.faltas || 0) / 30) * sal;
        const he50   = (sal / 220) * 1.5 * (params.horas_extras_50 || 0);
        const he100  = (sal / 220) * 2.0 * (params.horas_extras_100 || 0);
        const bruto  = base - faltas + he50 + he100;
        const inss   = clt.calcularINSS(bruto);
        const irrf   = clt.calcularIRRF(bruto, dep, inss);
        const vt     = sal * 0.06;
        const plano  = params.desconto_plano || 0;
        resultado = {
          bruto, inss, irrf, fgts: clt.calcularFGTS(bruto),
          vt, plano, liquido: bruto - inss - irrf - vt - plano,
        };
        break;
      }

      case 'adiantamento': {
        const liquido = clt.calcularLiquido(sal, dep).liquido;
        resultado = { liquido: liquido * ((params.percentual || 40) / 100), percentual: params.percentual || 40 };
        break;
      }

      case 'simulacao_salarial': {
        const atual = clt.calcularLiquido(sal, dep);
        const novo  = clt.calcularLiquido(params.novo_salario || sal, dep);
        resultado   = { atual, novo, diferenca: novo.liquido - atual.liquido };
        break;
      }

      case 'aviso_previo': {
        const meses = Math.floor((new Date() - new Date(admissao)) / (1000*60*60*24*30));
        const anos  = Math.floor(meses / 12);
        const dias  = Math.min(30 + anos * 3, 90);
        resultado = { dias, valor: (sal / 30) * dias };
        break;
      }

      default:
        return res.status(400).json({ success: false, message: `Tipo "${tipo}" não suportado.` });
    }

    ok(res, {
      tipo,
      colaborador: { id: colab.id, nome: colab.nome, cargo: colab.cargo, salario_base: sal },
      resultado,
      calculado_em: new Date().toISOString(),
    }, 'Cálculo realizado.');

  } catch (err) { next(err); }
});

// GET /api/v1/dp/dashboard-ops — dashboard operacional
router.get('/dashboard-ops', onlyRH, async (req, res, next) => {
  try {
    const emp = req.user.empresa_id;

    const [
      totalAtivos, feriasVencendo, rescisoes, folhaMes,
    ] = await Promise.all([
      prisma.colaborador.count({ where: { empresa_id: emp, status: 'ativo', deleted_at: null } }),
      prisma.ferias.count({
        where: { empresa_id: emp, status: 'pendente', gozo_inicio: { lte: new Date(Date.now()+60*86400000) } },
      }),
      prisma.rescisao.count({ where: { empresa_id: emp, status: { notIn: ['concluida','cancelada'] } } }),
      prisma.folhaPagamento.findFirst({
        where: { empresa_id: emp },
        orderBy: { competencia: 'desc' },
        select: { competencia: true, total_bruto: true, total_liquido: true, total_fgts: true, status: true },
      }),
    ]);

    ok(res, { totalAtivos, feriasVencendo, rescisoes, folhaMes });
  } catch (err) { next(err); }
});

// POST /api/v1/dp/calcular-lote — cálculo em lote
router.post('/calcular-lote', onlyRH, async (req, res, next) => {
  try {
    const { tipo, colaborador_ids, params = {} } = req.body;
    if (!colaborador_ids?.length) return res.status(400).json({ success: false, message: 'Informe colaborador_ids.' });

    const colabs = await prisma.colaborador.findMany({
      where: { id: { in: colaborador_ids }, empresa_id: req.user.empresa_id, deleted_at: null },
    });

    const resultados = colabs.map(c => {
      const sal = parseFloat(c.salario_base);
      let res;
      if (tipo === 'ferias')  res = clt.calcularFerias(sal, params.dias||30, 0, 0);
      if (tipo === 'decimo')  res = clt.calcularDecimo(sal, params.meses||12, 0);
      if (tipo === 'folha')   res = clt.calcularLiquido(sal);
      return { colaborador_id: c.id, nome: c.nome, salario_base: sal, resultado: res };
    });

    const totais = {
      bruto:   resultados.reduce((s,r) => s + (r.resultado?.bruto || r.resultado?.base || r.salario_base), 0),
      liquido: resultados.reduce((s,r) => s + (r.resultado?.liquido || 0), 0),
      inss:    resultados.reduce((s,r) => s + (r.resultado?.inss || 0), 0),
    };

    ok(res, { tipo, total_colaboradores: colabs.length, resultados, totais }, 'Cálculo em lote concluído.');
  } catch (err) { next(err); }
});

module.exports = router;
