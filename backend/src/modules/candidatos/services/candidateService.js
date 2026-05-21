'use strict';
/**
 * candidateService.js
 * CRUD completo do candidato — conta pública, perfil, experiências, formação, skills.
 * Suporte a deduplicação por CPF/email, salvamento incremental e LGPD.
 *
 * @module candidatos/services/candidateService
 */

const bcrypt     = require('bcrypt');
const crypto     = require('crypto');
const { prisma } = require('../../../config/database');
const { parsePagination, paginate } = require('../../../utils/pagination');
const logger     = require('../../../config/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ── Auth do candidato ──────────────────────────────────────────────

/**
 * Registra novo candidato com conta própria.
 * Deduplicação por email. Não requer empresa_id — conta global.
 */
const register = async (dados) => {
  const { email, senha, nome, cpf, aceite_lgpd } = dados;

  if (!aceite_lgpd) {
    throw { status: 422, message: 'Aceite da política de privacidade obrigatório.' };
  }

  const existe = await prisma.candidato.findFirst({ where: { email: email.toLowerCase() } });
  if (existe) throw { status: 409, message: 'E-mail já cadastrado. Faça login.' };

  if (cpf) {
    const cpfExiste = await prisma.candidato.findFirst({ where: { cpf: cpf.replace(/\D/g, '') } });
    if (cpfExiste) throw { status: 409, message: 'CPF já cadastrado. Verifique seus dados.' };
  }

  const senha_hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

  return prisma.candidato.create({
    data: {
      nome,
      email:          email.toLowerCase().trim(),
      senha_hash,
      cpf:            cpf ? cpf.replace(/\D/g, '') : null,
      telefone:       dados.telefone || null,
      aceite_lgpd:    true,
      aceite_lgpd_em: new Date(),
      aceite_marketing: dados.aceite_marketing || false,
      origem:         dados.origem || 'portal_carreiras',
      no_talent_pool: true,
    },
    select: _selectPublico(),
  });
};

/**
 * Login do candidato. Retorna candidato sem hash de senha.
 */
const login = async (email, senha) => {
  const cand = await prisma.candidato.findFirst({
    where: { email: email.toLowerCase(), ativo: true },
  });
  if (!cand) throw { status: 401, message: 'E-mail ou senha incorretos.' };
  if (!cand.senha_hash) throw { status: 401, message: 'Conta criada via portal externo. Use recuperação de senha.' };

  const ok = await bcrypt.compare(senha, cand.senha_hash);
  if (!ok) throw { status: 401, message: 'E-mail ou senha incorretos.' };

  await prisma.candidato.update({
    where: { id: cand.id },
    data:  { ultimo_acesso: new Date() },
  });

  const { senha_hash: _, reset_token: __, ...seguro } = cand;
  return seguro;
};

// ── CRUD do perfil ─────────────────────────────────────────────────

/**
 * Retorna perfil completo do candidato (para o painel do candidato).
 */
const getById = async (id) => {
  const cand = await prisma.candidato.findUnique({
    where: { id },
    include: {
      experiencias: { orderBy: [{ atual: 'desc' }, { inicio: 'desc' }] },
      formacoes:    { orderBy: { inicio: 'desc' } },
      habilidades:  { orderBy: [{ tipo: 'asc' }, { nome: 'asc' }] },
      anexos:       { orderBy: { created_at: 'desc' } },
      applications: {
        include: { vaga: { select: { id: true, titulo: true, empresa_id: true } } },
        orderBy: { inscrito_em: 'desc' },
        take: 10,
      },
    },
  });
  if (!cand) throw { status: 404, message: 'Candidato não encontrado.' };
  const { senha_hash: _, reset_token: __, ...seguro } = cand;
  return seguro;
};

/**
 * Atualiza dados do perfil (sem sobrescrever email/CPF).
 */
const updateProfile = async (id, dados) => {
  // Remove campos protegidos
  const { email, cpf, senha_hash, reset_token, aceite_lgpd, ...atualizaveis } = dados;

  return prisma.candidato.update({
    where:  { id },
    data:   atualizaveis,
    select: _selectPublico(),
  });
};

// ── Experiências ───────────────────────────────────────────────────

const addExperience = async (candidatoId, dados) =>
  prisma.candidateExperience.create({ data: { ...dados, candidato_id: candidatoId } });

const updateExperience = async (candidatoId, expId, dados) => {
  const exp = await prisma.candidateExperience.findFirst({ where: { id: expId, candidato_id: candidatoId } });
  if (!exp) throw { status: 404, message: 'Experiência não encontrada.' };
  return prisma.candidateExperience.update({ where: { id: expId }, data: dados });
};

const deleteExperience = async (candidatoId, expId) => {
  const exp = await prisma.candidateExperience.findFirst({ where: { id: expId, candidato_id: candidatoId } });
  if (!exp) throw { status: 404, message: 'Experiência não encontrada.' };
  return prisma.candidateExperience.delete({ where: { id: expId } });
};

// ── Formações ──────────────────────────────────────────────────────

const addEducation = async (candidatoId, dados) =>
  prisma.candidateEducation.create({ data: { ...dados, candidato_id: candidatoId } });

const updateEducation = async (candidatoId, eduId, dados) => {
  const edu = await prisma.candidateEducation.findFirst({ where: { id: eduId, candidato_id: candidatoId } });
  if (!edu) throw { status: 404, message: 'Formação não encontrada.' };
  return prisma.candidateEducation.update({ where: { id: eduId }, data: dados });
};

const deleteEducation = async (candidatoId, eduId) => {
  await prisma.candidateEducation.deleteMany({ where: { id: eduId, candidato_id: candidatoId } });
};

// ── Habilidades ────────────────────────────────────────────────────

const syncSkills = async (candidatoId, habilidades) => {
  await prisma.candidateSkill.deleteMany({ where: { candidato_id: candidatoId, detectado_ia: false } });
  return prisma.candidateSkill.createMany({
    data: habilidades.map(h => ({ ...h, candidato_id: candidatoId })),
    skipDuplicates: true,
  });
};

// ── Busca (para banco de talentos) ────────────────────────────────

const searchTalentPool = async (empresaId, query = {}) => {
  const { page, per_page, skip, take } = parsePagination(query);

  const where = {
    no_talent_pool: true,
    ativo:          true,
    ...(query.cidade     && { cidade:     { contains: query.cidade, mode: 'insensitive' } }),
    ...(query.estado     && { estado:     query.estado }),
    ...(query.senioridade && { senioridade: query.senioridade }),
    ...(query.disponibilidade && { disponibilidade: query.disponibilidade }),
    ...(query.busca && {
      OR: [
        { nome:        { contains: query.busca, mode: 'insensitive' } },
        { area_atuacao:{ contains: query.busca, mode: 'insensitive' } },
      ],
    }),
    ...(query.skill && {
      habilidades: { some: { nome: { contains: query.skill, mode: 'insensitive' } } },
    }),
  };

  const result = await paginate(
    (s, t) => prisma.candidato.findMany({
      where, skip: s, take: t,
      orderBy: [{ talent_score: 'desc' }, { created_at: 'desc' }],
      include: {
        habilidades: { select: { nome: true, nivel: true, tipo: true } },
        talent_pool: true,
        _count:      { select: { applications: true } },
      },
    }),
    () => prisma.candidato.count({ where }),
    { page, per_page, skip, take }
  );

  // Remove dados sensíveis do banco de talentos
  result.data = result.data.map(({ senha_hash: _, reset_token: __, cpf: _2, rg: _3, ...safe }) => safe);
  return result;
};

// ── LGPD ───────────────────────────────────────────────────────────

/**
 * Solicita exclusão de conta (soft — agenda exclusão em 30 dias).
 */
const requestAccountDeletion = async (candidatoId) => {
  const excluir_em = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.candidato.update({
    where: { id: candidatoId },
    data:  { excluir_em, ativo: false },
  });
  logger.info(`[Candidatos/LGPD] Exclusão agendada para candidato ${candidatoId} em ${excluir_em.toISOString()}`);
};

// ── Helper ─────────────────────────────────────────────────────────

const _selectPublico = () => ({
  id: true, nome: true, email: true, telefone: true, foto_url: true,
  cidade: true, estado: true, linkedin: true, senioridade: true,
  area_atuacao: true, disponibilidade: true, pretensao_min: true, pretensao_max: true,
  talent_score: true, created_at: true, aceite_lgpd: true, origem: true,
});

module.exports = {
  register, login, getById, updateProfile,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  syncSkills, searchTalentPool, requestAccountDeletion,
};
