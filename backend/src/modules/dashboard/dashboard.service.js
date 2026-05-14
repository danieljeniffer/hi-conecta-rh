'use strict';
const { prisma } = require('../../config/database');
const dayjs      = require('dayjs');

const getDashboard = async (empresaId) => {
  const hoje    = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim3meses = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [
    totalColabs, ativos, ferias, afastados,
    admissoesMes, desligamentosMes,
    folhaMes, solicitacoesPend,
    aniversariantesMes, feriasVencendo,
    treinamentosPend,
  ] = await Promise.all([
    // Headcount
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'ativo' } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'ferias' } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'afastado' } }),

    // Movimentações do mês
    prisma.colaborador.count({
      where: { empresa_id: empresaId, deleted_at: null, data_admissao: { gte: inicioMes } },
    }),
    prisma.colaborador.count({
      where: { empresa_id: empresaId, deleted_at: null, status: 'desligado', data_demissao: { gte: inicioMes } },
    }),

    // Folha do mês atual
    prisma.folhaPagamento.findFirst({
      where:   { empresa_id: empresaId, competencia: dayjs().format('YYYY-MM') },
      select:  { total_liquido: true, total_bruto: true, status: true },
    }),

    // Workflows pendentes
    prisma.workflow.count({
      where: { empresa_id: empresaId, status: 'pendente' },
    }),

    // Aniversariantes nos próximos 7 dias
    _aniversariantesProximos(empresaId, 7),

    // Férias vencendo em 60 dias
    prisma.ferias.count({
      where: {
        empresa_id: empresaId,
        status:     'pendente',
        gozo_inicio:{ lte: fim3meses },
      },
    }),

    // Treinamentos obrigatórios pendentes
    prisma.treinamentoColaborador.count({
      where: {
        colaborador: { empresa_id: empresaId, status: 'ativo' },
        status:      'pendente',
        treinamento: { obrigatorio: true },
      },
    }),
  ]);

  // Histórico de headcount (últimos 6 meses)
  const headcountHistorico = await _headcountHistorico(empresaId, 6);

  // Turnover mensal
  const turnover = totalColabs > 0 ? +((desligamentosMes / totalColabs) * 100).toFixed(2) : 0;

  return {
    headcount: { total: totalColabs, ativos, ferias, afastados },
    movimentacoes: {
      admissoesMes, desligamentosMes, turnover,
    },
    financeiro: {
      folha_bruto:  folhaMes?.total_bruto  || 0,
      folha_liquido:folhaMes?.total_liquido || 0,
      folha_status: folhaMes?.status || 'sem_folha',
    },
    alertas: {
      solicitacoesPend,
      aniversariantesMes,
      feriasVencendo,
      treinamentosPend,
    },
    headcountHistorico,
    gerado_em: new Date().toISOString(),
  };
};

const _headcountHistorico = async (empresaId, meses) => {
  const resultado = [];
  for (let i = meses - 1; i >= 0; i--) {
    const data  = dayjs().subtract(i, 'month');
    const label = data.format('MMM/YY');
    const fim   = data.endOf('month').toDate();

    const total = await prisma.colaborador.count({
      where: {
        empresa_id:   empresaId,
        data_admissao:{ lte: fim },
        OR: [
          { deleted_at: null },
          { data_demissao: { gt: fim } },
        ],
      },
    });

    resultado.push({ mes: label, total });
  }
  return resultado;
};

const _aniversariantesProximos = async (empresaId, dias) => {
  const hoje  = dayjs();
  const colabs = await prisma.colaborador.findMany({
    where: {
      empresa_id:      empresaId,
      deleted_at:      null,
      status:          { in: ['ativo', 'ferias'] },
      data_nascimento: { not: null },
    },
    select: { id: true, nome: true, data_nascimento: true, foto_url: true, departamento: { select: { nome: true } } },
  });

  return colabs.filter(c => {
    const aniv = dayjs(c.data_nascimento).year(hoje.year());
    const diff = aniv.diff(hoje, 'day');
    return diff >= 0 && diff <= dias;
  }).length;
};

module.exports = { getDashboard };
