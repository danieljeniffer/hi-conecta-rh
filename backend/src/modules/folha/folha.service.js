'use strict';
const { prisma }  = require('../../config/database');
const clt         = require('../../utils/clt');
const { notificacaoService } = require('../notificacoes/notificacao.service');

// ── Abrir período ─────────────────────────────
const abrirPeriodo = async (empresaId, competencia) => {
  const existe = await prisma.folhaPagamento.findFirst({
    where: { empresa_id: empresaId, competencia },
  });
  if (existe) throw { status: 409, message: `Folha ${competencia} já existe.` };

  return prisma.folhaPagamento.create({
    data: { empresa_id: empresaId, competencia, status: 'aberta' },
  });
};

// ── Calcular folha completa ───────────────────
const calcularFolha = async (empresaId, competencia, opcoes = {}) => {
  const folha = await prisma.folhaPagamento.findFirst({
    where: { empresa_id: empresaId, competencia, deleted_at: null },
  });
  if (!folha) throw { status: 404, message: 'Folha não encontrada. Abra o período primeiro.' };
  if (folha.status === 'paga') throw { status: 400, message: 'Folha já foi paga.' };

  // Busca colaboradores ativos
  const colaboradores = await prisma.colaborador.findMany({
    where: {
      empresa_id:  empresaId,
      deleted_at:  null,
      status:      { in: ['ativo', 'ferias', 'afastado'] },
    },
    include: {
      dependentes: { where: { ir: true } },
      beneficios:  { where: { ativo: true }, include: { beneficio: true } },
    },
  });

  let totalBruto = 0, totalLiquido = 0, totalDesc = 0, totalFgts = 0, totalInss = 0, totalIrrf = 0;

  await prisma.$transaction(async (tx) => {
    // Remove itens existentes
    await tx.folhaItem.deleteMany({ where: { folha_id: folha.id } });

    for (const col of colaboradores) {
      const salario    = parseFloat(col.salario_base);
      const dependentes = col.dependentes.length;
      const calc        = clt.calcularLiquido(salario, dependentes);

      // Calcula descontos de benefícios
      let descontoBeneficios = 0;
      for (const cb of col.beneficios) {
        descontoBeneficios += parseFloat(cb.valor_colab || cb.beneficio?.valor_colab || 0);
      }

      // Vale transporte (6% até o valor do benefício)
      const vt = col.beneficios.find(b => b.beneficio?.nome?.toLowerCase().includes('transporte'));
      const descontoVT = vt ? Math.min(salario * 0.06, parseFloat(vt.valor_empresa || 200)) : 0;

      // Plano de saúde
      const plano  = col.beneficios.find(b => b.beneficio?.nome?.toLowerCase().includes('saúde'));
      const descontoPlano = plano ? parseFloat(plano.valor_colab || 0) : 0;

      const totalDescontos = calc.inss + calc.irrf + descontoVT + descontoPlano;
      const liquido        = salario + (opcoes.he_valor || 0) - totalDescontos;

      await tx.folhaItem.create({
        data: {
          folha_id:        folha.id,
          colaborador_id:  col.id,
          salario_base:    salario,
          dias_trabalhados:30,
          inss:            calc.inss,
          irrf:            calc.irrf,
          fgts:            calc.fgts,
          vale_transporte: descontoVT,
          plano_saude:     descontoPlano,
          outros_descontos:0,
          total_bruto:     salario,
          total_liquido:   Math.max(0, liquido),
          proventos_json:  { salario_base: salario },
          descontos_json:  { inss: calc.inss, irrf: calc.irrf, vt: descontoVT, saude: descontoPlano },
        },
      });

      totalBruto   += salario;
      totalLiquido += liquido;
      totalDesc    += totalDescontos;
      totalFgts    += calc.fgts;
      totalInss    += calc.inss;
      totalIrrf    += calc.irrf;
    }

    // Atualiza totais da folha
    await tx.folhaPagamento.update({
      where: { id: folha.id },
      data: {
        status:          'calculada',
        total_bruto:     totalBruto,
        total_liquido:   totalLiquido,
        total_descontos: totalDesc,
        total_fgts:      totalFgts,
        total_inss:      totalInss,
        total_irrf:      totalIrrf,
      },
    });
  });

  return prisma.folhaPagamento.findUnique({ where: { id: folha.id } });
};

// ── Aprovar folha ─────────────────────────────
const aprovarFolha = async (empresaId, folhaId, aprovadoPorId) => {
  const folha = await prisma.folhaPagamento.findFirst({
    where: { id: folhaId, empresa_id: empresaId },
  });
  if (!folha) throw { status: 404, message: 'Folha não encontrada.' };
  if (folha.status !== 'calculada') throw { status: 400, message: 'Folha precisa estar calculada para ser aprovada.' };

  const atualizada = await prisma.folhaPagamento.update({
    where: { id: folhaId },
    data:  { status: 'aprovada', fechado_em: new Date(), fechado_por: aprovadoPorId },
  });

  // Notifica que holerites estão disponíveis
  setImmediate(() => notificacaoService.notificarFolhaAprovada(empresaId, folha.competencia));

  return atualizada;
};

// ── Marcar como paga ──────────────────────────
const marcarComoPaga = async (empresaId, folhaId) => {
  const folha = await prisma.folhaPagamento.findFirst({
    where: { id: folhaId, empresa_id: empresaId },
  });
  if (!folha) throw { status: 404, message: 'Folha não encontrada.' };
  if (folha.status !== 'aprovada') throw { status: 400, message: 'Folha precisa estar aprovada.' };

  return prisma.folhaPagamento.update({
    where: { id: folhaId },
    data:  { status: 'paga', pago_em: new Date() },
  });
};

// ── Listar períodos ───────────────────────────
const listarPeriodos = (empresaId, query = {}) =>
  prisma.folhaPagamento.findMany({
    where:   { empresa_id: empresaId, deleted_at: null },
    orderBy: { competencia: 'desc' },
    take:    parseInt(query.limit || '12', 10),
  });

// ── Holerite individual ───────────────────────
const holerite = async (empresaId, competencia, colaboradorId) => {
  const item = await prisma.folhaItem.findFirst({
    where: {
      colaborador_id: colaboradorId,
      folha: { empresa_id: empresaId, competencia },
    },
    include: {
      folha:      { select: { competencia: true, status: true } },
      colaborador:{ select: { nome: true, cpf: true, cargo: { select: { nome: true } }, departamento: { select: { nome: true } } } },
    },
  });

  if (!item) throw { status: 404, message: 'Holerite não encontrado.' };
  return item;
};

module.exports = { abrirPeriodo, calcularFolha, aprovarFolha, marcarComoPaga, listarPeriodos, holerite };
