'use strict';
const bcrypt = require('bcrypt');
const { prisma } = require('../../config/database');
const { parsePagination, paginate, parseOrderBy } = require('../../utils/pagination');
const { notificacaoService } = require('../notificacoes/notificacao.service');
const { onboardingService }  = require('../onboarding/onboarding.service');
const env = require('../../config/env');

const CAMPOS_PERMITIDOS_SORT = [
  'nome','data_admissao','created_at','salario_base','status','cargo.nome','departamento.nome',
];

// ── Listar com filtros ────────────────────────
const listar = async (empresaId, query) => {
  const { page, per_page, skip, take } = parsePagination(query);
  const orderBy = parseOrderBy(query, CAMPOS_PERMITIDOS_SORT);

  const where = {
    empresa_id:  empresaId,
    deleted_at:  null,
    ...(query.status        && { status: query.status }),
    ...(query.departamento  && { departamento_id: query.departamento }),
    ...(query.cargo         && { cargo_id: query.cargo }),
    ...(query.regime        && { regime: query.regime }),
    ...(query.busca && {
      OR: [
        { nome:              { contains: query.busca, mode: 'insensitive' } },
        { cpf:               { contains: query.busca } },
        { email:             { contains: query.busca, mode: 'insensitive' } },
        { email_corporativo: { contains: query.busca, mode: 'insensitive' } },
      ],
    }),
  };

  const result = await paginate(
    (s, t) => prisma.colaborador.findMany({
      where,
      skip: s, take: t,
      orderBy,
      select: {
        id: true, nome: true, cpf: true, email: true, email_corporativo: true,
        foto_url: true, status: true, regime: true, data_admissao: true,
        salario_base: true, onboarding_pct: true,
        departamento: { select: { id: true, nome: true } },
        cargo:        { select: { id: true, nome: true } },
      },
    }),
    () => prisma.colaborador.count({ where }),
    { page, per_page, skip, take }
  );

  return result;
};

// ── Buscar por ID ─────────────────────────────
const buscarPorId = async (empresaId, id) => {
  const colab = await prisma.colaborador.findFirst({
    where: { id, empresa_id: empresaId, deleted_at: null },
    include: {
      departamento:      { select: { id: true, nome: true } },
      cargo:             { select: { id: true, nome: true, salario_min: true, salario_max: true } },
      dependentes:       true,
      historico_salarial:{ orderBy: { vigencia: 'desc' }, take: 10 },
      beneficios:        { where: { ativo: true }, include: { beneficio: true } },
      usuario:           { select: { id: true, email: true, perfil: true, ativo: true } },
    },
  });

  if (!colab) throw { status: 404, message: 'Colaborador não encontrado.' };
  return colab;
};

// ── Criar colaborador (admissão) ──────────────
const criar = async (empresaId, dados, criadoPorId) => {
  // Verifica CPF único na empresa
  const existe = await prisma.colaborador.findFirst({
    where: { empresa_id: empresaId, cpf: dados.cpf, deleted_at: null },
  });
  if (existe) throw { status: 409, message: 'CPF já cadastrado nesta empresa.' };

  const colab = await prisma.$transaction(async (tx) => {
    // 1. Cria colaborador
    const novo = await tx.colaborador.create({
      data: {
        empresa_id: empresaId,
        ...dados,
        status: 'admissao_pendente',
      },
    });

    // 2. Cria usuário de acesso (se e-mail corporativo informado)
    if (dados.email_corporativo) {
      const senhaTemp = Math.random().toString(36).slice(-8) + 'A1';
      const hash      = await bcrypt.hash(senhaTemp, env.BCRYPT_ROUNDS);

      await tx.usuario.create({
        data: {
          empresa_id:    empresaId,
          colaborador_id:novo.id,
          nome:          dados.nome,
          email:         dados.email_corporativo,
          senha_hash:    hash,
          perfil:        'colaborador',
        },
      });
    }

    // 3. Histórico salarial inicial
    await tx.historicoSalarial.create({
      data: {
        colaborador_id:    novo.id,
        salario_anterior:  0,
        salario_novo:      dados.salario_base,
        percentual:        100,
        motivo:            'Admissão',
        vigencia:          new Date(dados.data_admissao),
        aprovado_por:      criadoPorId,
      },
    });

    return novo;
  });

  // 4. Inicia onboarding (fora da transaction)
  setImmediate(() => {
    onboardingService.iniciarOnboarding(colab.id, empresaId).catch(console.error);
    notificacaoService.notificarRH(empresaId, '👤 Novo Colaborador',
      `${dados.nome} foi admitido. Verifique o onboarding.`, 'admissao');
  });

  return colab;
};

// ── Atualizar ─────────────────────────────────
const atualizar = async (empresaId, id, dados) => {
  const colab = await prisma.colaborador.findFirst({
    where: { id, empresa_id: empresaId, deleted_at: null },
  });
  if (!colab) throw { status: 404, message: 'Colaborador não encontrado.' };

  // Se salário mudou, registra histórico
  if (dados.salario_base && dados.salario_base !== Number(colab.salario_base)) {
    await prisma.historicoSalarial.create({
      data: {
        colaborador_id:   id,
        salario_anterior: colab.salario_base,
        salario_novo:     dados.salario_base,
        percentual:       ((dados.salario_base - colab.salario_base) / colab.salario_base * 100),
        motivo:           dados.motivo_reajuste || 'Reajuste salarial',
        vigencia:         new Date(),
      },
    });
    delete dados.motivo_reajuste;
  }

  return prisma.colaborador.update({
    where: { id },
    data:  { ...dados, updated_at: new Date() },
  });
};

// ── Desligar (soft delete lógico) ─────────────
const desligar = async (empresaId, id, dados) => {
  const colab = await prisma.colaborador.findFirst({
    where: { id, empresa_id: empresaId, deleted_at: null, status: { not: 'desligado' } },
  });
  if (!colab) throw { status: 404, message: 'Colaborador não encontrado ou já desligado.' };

  return prisma.$transaction(async (tx) => {
    // Atualiza colaborador
    const atualizado = await tx.colaborador.update({
      where: { id },
      data: {
        status:        'desligado',
        data_demissao: new Date(dados.data_demissao),
        updated_at:    new Date(),
      },
    });

    // Desativa usuário
    await tx.usuario.updateMany({
      where: { colaborador_id: id },
      data:  { ativo: false },
    });

    // Cria registro de rescisão rascunho
    if (dados.tipo_rescisao) {
      await tx.rescisao.create({
        data: {
          empresa_id:    empresaId,
          colaborador_id: id,
          tipo:          dados.tipo_rescisao,
          data_demissao: new Date(dados.data_demissao),
          aviso_previo_dias: dados.aviso_previo_dias ?? 30,
          motivo:        dados.motivo,
          status:        'rascunho',
        },
      });
    }

    return atualizado;
  });
};

// ── Soft delete ───────────────────────────────
const remover = async (empresaId, id) => {
  const colab = await prisma.colaborador.findFirst({
    where: { id, empresa_id: empresaId, deleted_at: null },
  });
  if (!colab) throw { status: 404, message: 'Colaborador não encontrado.' };

  return prisma.colaborador.update({
    where: { id },
    data:  { deleted_at: new Date() },
  });
};

// ── Dependentes ───────────────────────────────
const listarDependentes = (colaboradorId) =>
  prisma.dependente.findMany({ where: { colaborador_id: colaboradorId } });

const criarDependente = (colaboradorId, dados) =>
  prisma.dependente.create({ data: { colaborador_id: colaboradorId, ...dados } });

const removerDependente = (id) =>
  prisma.dependente.delete({ where: { id } });

// ── Histórico salarial ────────────────────────
const historicSalarial = (colaboradorId) =>
  prisma.historicoSalarial.findMany({
    where:   { colaborador_id: colaboradorId },
    orderBy: { vigencia: 'desc' },
  });

// ── KPIs rápidos ──────────────────────────────
const kpis = async (empresaId) => {
  const [
    total, ativos, ferias, afastados, admissoesMes, desligamentosMes,
  ] = await Promise.all([
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'ativo' } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'ferias' } }),
    prisma.colaborador.count({ where: { empresa_id: empresaId, deleted_at: null, status: 'afastado' } }),
    prisma.colaborador.count({
      where: {
        empresa_id:    empresaId,
        deleted_at:    null,
        data_admissao: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    prisma.colaborador.count({
      where: {
        empresa_id:    empresaId,
        deleted_at:    null,
        status:        'desligado',
        data_demissao: { gte: new Date(new Date().setDate(1)) },
      },
    }),
  ]);

  const turnover = total > 0 ? ((desligamentosMes / total) * 100).toFixed(2) : 0;

  return { total, ativos, ferias, afastados, admissoesMes, desligamentosMes, turnover };
};

module.exports = {
  listar, buscarPorId, criar, atualizar, desligar, remover,
  listarDependentes, criarDependente, removerDependente,
  historicSalarial, kpis,
};
