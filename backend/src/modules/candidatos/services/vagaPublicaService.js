'use strict';
/**
 * vagaPublicaService.js
 * Gerencia vagas do portal público de carreiras.
 * Gera slugs automáticos, tokens públicos e SEO.
 *
 * @module candidatos/services/vagaPublicaService
 */

const crypto     = require('crypto');
const { prisma } = require('../../../config/database');
const { parsePagination, paginate } = require('../../../utils/pagination');
const slugify    = require('slugify');

/**
 * Gera slug único para a vaga.
 * Ex: "Analista de RH Pleno" → "analista-de-rh-pleno"
 * Se já existe, adiciona sufixo numérico.
 */
const gerarSlug = async (titulo, empresaId) => {
  const base = slugify(titulo, { lower: true, strict: true, locale: 'pt' });
  let slug   = base;
  let n      = 1;

  while (true) {
    const existe = await prisma.vaga.findFirst({ where: { slug, empresa_id: empresaId } });
    if (!existe) return slug;
    slug = `${base}-${n++}`;
  }
};

/**
 * Prepara vaga para publicação — gera slug + token público.
 */
const publicar = async (empresaId, vagaId, dadosExtras = {}) => {
  const vaga = await prisma.vaga.findFirst({ where: { id: vagaId, empresa_id: empresaId } });
  if (!vaga) throw { status: 404, message: 'Vaga não encontrada.' };

  const slug         = vaga.slug || await gerarSlug(vaga.titulo, empresaId);
  const token_publico= vaga.token_publico || crypto.randomBytes(16).toString('hex');

  return prisma.vaga.update({
    where: { id: vagaId },
    data: {
      slug,
      token_publico,
      status:      'aberta',
      publicada_em:new Date(),
      ...dadosExtras,
    },
  });
};

/**
 * Lista vagas publicadas de uma empresa para o portal público.
 * Sem autenticação — dados públicos apenas.
 */
const listarPublicas = async (empresaId, query = {}) => {
  const { page, per_page, skip, take } = parsePagination(query);

  const where = {
    empresa_id:       empresaId,
    status:           'aberta',
    deleted_at:       null,
    ativa_candidatos: true,
    ...(query.cidade    && { cidade:          { contains: query.cidade,    mode: 'insensitive' } }),
    ...(query.remoto    && { remoto:          true }),
    ...(query.senioridade && { senioridade:   query.senioridade }),
    ...(query.contrato  && { tipo_contrato:   query.contrato }),
    ...(query.busca && {
      OR: [
        { titulo:    { contains: query.busca, mode: 'insensitive' } },
        { descricao: { contains: query.busca, mode: 'insensitive' } },
      ],
    }),
  };

  return paginate(
    (s, t) => prisma.vaga.findMany({
      where, skip: s, take: t,
      orderBy: { publicada_em: 'desc' },
      select: _selectPublico(),
    }),
    () => prisma.vaga.count({ where }),
    { page, per_page, skip, take }
  );
};

/**
 * Busca vaga por slug para a página pública da vaga.
 * Incrementa contador de visualizações.
 */
const getBySlug = async (empresaId, slug) => {
  const vaga = await prisma.vaga.findFirst({
    where:   { empresa_id: empresaId, slug, status: 'aberta', deleted_at: null },
    include: {
      empresa:     { select: { nome: true, logo_url: true } },
      _count:      { select: { applications: true } },
    },
  });
  if (!vaga) throw { status: 404, message: 'Vaga não encontrada ou encerrada.' };

  // Incrementa views de forma não bloqueante
  setImmediate(() => prisma.vaga.update({
    where: { id: vaga.id },
    data:  { views_count: { increment: 1 } },
  }).catch(() => {}));

  // Remove campos internos
  const { token_publico: _, ...publica } = vaga;
  return publica;
};

/**
 * Verifica se candidato já se candidatou à vaga.
 */
const verificarCandidatura = async (vagaId, candidatoId) => {
  const app = await prisma.candidateApplication.findUnique({
    where: { candidato_id_vaga_id: { candidato_id: candidatoId, vaga_id: vagaId } },
  });
  return { ja_candidatou: !!app, etapa: app?.etapa || null };
};

// ── Select público (sem dados internos) ────────────────────────────
const _selectPublico = () => ({
  id: true, slug: true, titulo: true, descricao: true, requisitos: true,
  beneficios: true, cultura: true, etapas_processo: true,
  salario_min: true, salario_max: true, salario_oculto: true,
  local: true, cidade: true, uf: true, remoto: true, hibrido: true,
  tipo_contrato: true, senioridade: true, vagas_qtd: true,
  banner_url: true, publicada_em: true, encerra_em: true, views_count: true,
  empresa:     { select: { nome: true, logo_url: true } },
  _count:      { select: { applications: true } },
});

module.exports = { gerarSlug, publicar, listarPublicas, getBySlug, verificarCandidatura };
