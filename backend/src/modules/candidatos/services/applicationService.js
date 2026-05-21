'use strict';
/**
 * applicationService.js
 * Gerencia candidaturas (CandidateApplication) — pipeline ATS completo.
 * Movimentação de etapas, timeline, entrevistas, avaliações, conversão.
 *
 * @module candidatos/services/applicationService
 */

const { prisma }    = require('../../../config/database');
const { parsePagination, paginate } = require('../../../utils/pagination');
const logger        = require('../../../config/logger');
const { emitToEmpresa } = require('../../../sockets');

/** Ordem canônica das etapas do pipeline */
const ETAPAS = {
  inscrito:           1,
  triagem:            2,
  entrevista_rh:      3,
  entrevista_gestor:  4,
  teste_tecnico:      5,
  aprovado:           6,
  contratado:         7,
  banco_talentos:     8,
  reprovado:          99,
};

// ── Candidatura ────────────────────────────────────────────────────

/**
 * Candidato se inscreve em uma vaga.
 * Verifica duplicata, cria application e insere na timeline.
 */
const apply = async (candidatoId, vagaId, extras = {}) => {
  const [candidato, vaga] = await Promise.all([
    prisma.candidato.findUnique({ where: { id: candidatoId } }),
    prisma.vaga.findFirst({ where: { id: vagaId, status: 'aberta', deleted_at: null } }),
  ]);

  if (!candidato) throw { status: 404, message: 'Candidato não encontrado.' };
  if (!vaga)      throw { status: 404, message: 'Vaga não encontrada ou encerrada.' };

  // Deduplicação
  const existente = await prisma.candidateApplication.findUnique({
    where: { candidato_id_vaga_id: { candidato_id: candidatoId, vaga_id: vagaId } },
  });
  if (existente) throw { status: 409, message: 'Você já se candidatou a esta vaga.' };

  const app = await prisma.candidateApplication.create({
    data: {
      candidato_id:      candidatoId,
      vaga_id:           vagaId,
      empresa_id:        vaga.empresa_id,
      etapa:             'inscrito',
      etapa_ordem:       1,
      origem:            extras.origem || 'portal',
      curriculo_url:     extras.curriculo_url || candidato.curriculo_url,
      carta_apresentacao:extras.carta_apresentacao || null,
    },
    include: { vaga: { select: { titulo: true, empresa_id: true } } },
  });

  // Timeline: inscrição
  await _addTimeline(app.id, candidatoId, 'inscricao', '🎯 Candidatura recebida',
    `Sua candidatura para "${vaga.titulo}" foi recebida com sucesso!`, true);

  // Socket.io realtime para o RH
  emitToEmpresa(vaga.empresa_id, 'ats:nova_candidatura', {
    vaga_id:    vagaId,
    vaga_titulo:vaga.titulo,
    candidato:  candidato.nome,
    app_id:     app.id,
  });

  // Enfileira IA de matching (opcional)
  try {
    const { atsMatcher } = require('../workers/atsMatcher');
    await atsMatcher.add('score-candidate', { app_id: app.id, candidato_id: candidatoId, vaga_id: vagaId });
  } catch { /* IA opcional */ }

  logger.info(`[ATS] Nova candidatura: ${candidato.nome} → ${vaga.titulo}`);
  return app;
};

/**
 * Lista candidaturas de uma vaga (visão RH — pipeline kanban).
 */
const listarPorVaga = async (empresaId, vagaId, query = {}) => {
  const { page, per_page, skip, take } = parsePagination(query);
  const where = {
    vaga_id:    vagaId,
    empresa_id: empresaId,
    ativo:      true,
    ...(query.etapa && { etapa: query.etapa }),
    ...(query.busca && {
      candidato: {
        OR: [
          { nome:  { contains: query.busca, mode: 'insensitive' } },
          { email: { contains: query.busca, mode: 'insensitive' } },
        ],
      },
    }),
  };

  return paginate(
    (s, t) => prisma.candidateApplication.findMany({
      where, skip: s, take: t,
      orderBy: [{ etapa_ordem: 'asc' }, { inscrito_em: 'desc' }],
      include: {
        candidato: {
          select: {
            id: true, nome: true, foto_url: true, email: true, telefone: true,
            cidade: true, estado: true, linkedin: true, senioridade: true,
            habilidades: { select: { nome: true, nivel: true } },
          },
        },
        _count: { select: { entrevistas: true, assessments: true, timeline: true } },
      },
    }),
    () => prisma.candidateApplication.count({ where }),
    { page, per_page, skip, take }
  );
};

/**
 * Pipeline kanban — agrupa candidaturas por etapa para visualização.
 */
const getPipeline = async (empresaId, vagaId) => {
  const apps = await prisma.candidateApplication.findMany({
    where:   { vaga_id: vagaId, empresa_id: empresaId, ativo: true },
    include: {
      candidato: {
        select: {
          id: true, nome: true, foto_url: true, email: true, cidade: true,
          senioridade: true, pretensao_min: true, pretensao_max: true,
          habilidades: { select: { nome: true }, take: 5 },
        },
      },
    },
    orderBy: { inscrito_em: 'desc' },
  });

  // Agrupa por etapa
  const pipeline = Object.keys(ETAPAS).reduce((acc, etapa) => {
    acc[etapa] = { etapa, ordem: ETAPAS[etapa], candidatos: [] };
    return acc;
  }, {});

  apps.forEach(app => {
    if (pipeline[app.etapa]) {
      pipeline[app.etapa].candidatos.push(app);
    }
  });

  return Object.values(pipeline).sort((a, b) => a.ordem - b.ordem);
};

/**
 * Move candidato para outra etapa do pipeline.
 * Registra na timeline e emite evento realtime.
 */
const moverEtapa = async (empresaId, appId, novaEtapa, rhUserId, dados = {}) => {
  if (!ETAPAS[novaEtapa]) throw { status: 400, message: `Etapa "${novaEtapa}" inválida.` };

  const app = await prisma.candidateApplication.findFirst({
    where:   { id: appId, empresa_id: empresaId },
    include: { candidato: { select: { nome: true, email: true } }, vaga: { select: { titulo: true } } },
  });
  if (!app) throw { status: 404, message: 'Candidatura não encontrada.' };

  const etapaAnterior = app.etapa;

  const atualizado = await prisma.candidateApplication.update({
    where: { id: appId },
    data:  {
      etapa:       novaEtapa,
      etapa_ordem: ETAPAS[novaEtapa],
      ...(novaEtapa === 'reprovado' && {
        motivo_reprovacao: dados.motivo || null,
        reprovado_em:      new Date(),
        reprovado_por:     rhUserId,
      }),
      ...(novaEtapa === 'aprovado' && { aprovado_em: new Date() }),
    },
  });

  // Timeline
  const labels = {
    triagem:           { icon: '🔍', titulo: 'Em triagem', desc: 'Seu perfil está sendo analisado pelo RH.' },
    entrevista_rh:     { icon: '🎙️', titulo: 'Entrevista com RH agendada', desc: 'O RH irá entrar em contato para agendar.' },
    entrevista_gestor: { icon: '👔', titulo: 'Entrevista com Gestor', desc: 'Parabéns! Você avançou para a entrevista com o gestor.' },
    teste_tecnico:     { icon: '💻', titulo: 'Avaliação técnica', desc: 'Uma avaliação técnica será enviada em breve.' },
    aprovado:          { icon: '✅', titulo: 'Aprovado!', desc: 'Parabéns! Você foi aprovado no processo seletivo.' },
    contratado:        { icon: '🎉', titulo: 'Contratado!', desc: 'Bem-vindo(a) à equipe!' },
    reprovado:         { icon: '📋', titulo: 'Processo encerrado', desc: dados.feedback_candidato || 'Agradecemos sua participação. Seu perfil ficará em nosso banco de talentos.' },
    banco_talentos:    { icon: '🌟', titulo: 'Banco de talentos', desc: 'Seu perfil foi adicionado ao nosso banco de talentos!' },
  };

  const info = labels[novaEtapa] || { icon: '↗️', titulo: `Movido para ${novaEtapa}`, desc: '' };

  await _addTimeline(appId, app.candidato_id, 'etapa_mudada', info.titulo, info.desc, true, { etapa: novaEtapa });

  if (dados.feedback_candidato) {
    await prisma.candidateApplication.update({
      where: { id: appId },
      data:  { feedback_candidato: dados.feedback_candidato },
    });
  }

  // Notificação realtime
  emitToEmpresa(empresaId, 'ats:etapa_atualizada', {
    app_id:        appId,
    candidato:     app.candidato.nome,
    etapa_anterior:etapaAnterior,
    nova_etapa:    novaEtapa,
    vaga:          app.vaga.titulo,
  });

  // Email automático ao candidato (não bloqueante)
  try {
    const { emailQueue } = require('../../../queues/email.queue');
    await emailQueue.add('ats-etapa', {
      to:       app.candidato.email,
      nome:     app.candidato.nome,
      titulo:   info.titulo,
      mensagem: info.desc,
      vaga:     app.vaga.titulo,
      etapa:    novaEtapa,
    });
  } catch { /* email opcional */ }

  logger.info(`[ATS] Etapa: ${app.candidato.nome} — ${etapaAnterior} → ${novaEtapa}`);
  return atualizado;
};

/**
 * Candidaturas do próprio candidato (painel do candidato).
 */
const getMinhasCandidaturas = async (candidatoId) =>
  prisma.candidateApplication.findMany({
    where:   { candidato_id: candidatoId },
    include: {
      vaga: { select: { id: true, titulo: true, slug: true, cidade: true, tipo_contrato: true, empresa: { select: { nome: true, logo_url: true } } } },
      timeline: { orderBy: { created_at: 'desc' }, take: 3, where: { visivel_candidato: true } },
      entrevistas: { where: { status: { not: 'cancelada' } }, orderBy: { data_hora: 'asc' }, take: 2 },
    },
    orderBy: { inscrito_em: 'desc' },
  });

// ── Timeline ───────────────────────────────────────────────────────

const _addTimeline = async (appId, candidatoId, tipo, titulo, descricao, visivelCandidato = true, dados = {}) =>
  prisma.candidateTimeline.create({
    data: {
      application_id:    appId,
      candidato_id:      candidatoId,
      tipo,
      titulo,
      descricao,
      visivel_candidato: visivelCandidato,
      criado_por:        'sistema',
      dados_extras:      dados,
    },
  });

const addComment = async (empresaId, appId, comentario, rhUserId) => {
  const app = await prisma.candidateApplication.findFirst({ where: { id: appId, empresa_id: empresaId } });
  if (!app) throw { status: 404, message: 'Candidatura não encontrada.' };

  return prisma.candidateTimeline.create({
    data: {
      application_id:    appId,
      candidato_id:      app.candidato_id,
      tipo:              'comentario_rh',
      titulo:            'Observação interna',
      descricao:         comentario,
      visivel_candidato: false, // comentários internos nunca visíveis ao candidato
      criado_por:        rhUserId,
    },
  });
};

const getTimeline = async (empresaId, appId, soVisiveisAoCandidato = false) => {
  const app = await prisma.candidateApplication.findFirst({ where: { id: appId, empresa_id: empresaId } });
  if (!app) throw { status: 404, message: 'Candidatura não encontrada.' };

  return prisma.candidateTimeline.findMany({
    where: {
      application_id:    appId,
      ...(soVisiveisAoCandidato && { visivel_candidato: true }),
    },
    orderBy: { created_at: 'desc' },
  });
};

module.exports = {
  apply, listarPorVaga, getPipeline, moverEtapa,
  getMinhasCandidaturas, addComment, getTimeline, ETAPAS,
};
