'use strict';
/**
 * candidateController.js
 * Controllers para o portal do candidato (rotas públicas e autenticadas).
 * Finos — toda lógica nos services.
 *
 * @module candidatos/controllers/candidateController
 */

const jwt     = require('jsonwebtoken');
const env     = require('../../../config/env');
const { ok, created, notFound, unauthorized } = require('../../../utils/response');
const candidateSvc  = require('../services/candidateService');
const applicationSvc= require('../services/applicationService');
const vagaPublicaSvc= require('../services/vagaPublicaService');
const uploadSvc     = require('../services/uploadService');
const conversionSvc = require('../services/conversionService');

// ── Auth do candidato ──────────────────────────────────────────────

/**
 * POST /api/v1/candidatos/auth/register
 * Cria conta do candidato no portal.
 */
const register = async (req, res, next) => {
  try {
    const candidato = await candidateSvc.register(req.body);
    const token     = _gerarToken(candidato);
    return created(res, { candidato, token }, 'Conta criada! Bem-vindo(a) ao portal.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

/**
 * POST /api/v1/candidatos/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const candidato = await candidateSvc.login(email, senha);
    const token     = _gerarToken(candidato);
    return ok(res, { candidato, token }, 'Login realizado.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Portal público (vagas) ─────────────────────────────────────────

/**
 * GET /api/v1/candidatos/portal/vagas
 * Lista vagas abertas (sem autenticação).
 */
const listarVagasPublicas = async (req, res, next) => {
  try {
    const { empresa_id } = req.params;
    const result = await vagaPublicaSvc.listarPublicas(empresa_id, req.query);
    return ok(res, result.data, 'Vagas abertas.', 200);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/candidatos/portal/:empresa_id/vagas/:slug
 * Detalhe de uma vaga pública (gera página SEO-friendly).
 */
const getVagaPublica = async (req, res, next) => {
  try {
    const { empresa_id, slug } = req.params;
    const vaga = await vagaPublicaSvc.getBySlug(empresa_id, slug);
    return ok(res, vaga);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Candidaturas ───────────────────────────────────────────────────

/**
 * POST /api/v1/candidatos/aplicar/:vagaId
 * Candidato se inscreve em uma vaga (requer auth candidato).
 */
const aplicar = async (req, res, next) => {
  try {
    const app = await applicationSvc.apply(req.candidato.id, req.params.vagaId, req.body);
    return created(res, app, 'Candidatura enviada com sucesso!');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

/**
 * GET /api/v1/candidatos/minhas-candidaturas
 * Painel do candidato — seus processos seletivos.
 */
const minhasCandidaturas = async (req, res, next) => {
  try {
    const apps = await applicationSvc.getMinhasCandidaturas(req.candidato.id);
    return ok(res, apps);
  } catch (err) { next(err); }
};

// ── Perfil do candidato ────────────────────────────────────────────

/**
 * GET /api/v1/candidatos/perfil
 */
const getPerfil = async (req, res, next) => {
  try {
    const perfil = await candidateSvc.getById(req.candidato.id);
    return ok(res, perfil);
  } catch (err) { next(err); }
};

/**
 * PUT /api/v1/candidatos/perfil
 */
const updatePerfil = async (req, res, next) => {
  try {
    const atualizado = await candidateSvc.updateProfile(req.candidato.id, req.body);
    return ok(res, atualizado, 'Perfil atualizado.');
  } catch (err) { next(err); }
};

// ── Experiências ───────────────────────────────────────────────────
const addExperience    = async (req, res, next) => {
  try { return created(res, await candidateSvc.addExperience(req.candidato.id, req.body)); }
  catch (err) { next(err); }
};
const updateExperience = async (req, res, next) => {
  try { return ok(res, await candidateSvc.updateExperience(req.candidato.id, req.params.id, req.body)); }
  catch (err) { if (err.status) return res.status(err.status).json({ success: false, message: err.message }); next(err); }
};
const deleteExperience = async (req, res, next) => {
  try { await candidateSvc.deleteExperience(req.candidato.id, req.params.id); return ok(res, null, 'Removido.'); }
  catch (err) { next(err); }
};

// ── Formações ──────────────────────────────────────────────────────
const addEducation    = async (req, res, next) => {
  try { return created(res, await candidateSvc.addEducation(req.candidato.id, req.body)); }
  catch (err) { next(err); }
};
const deleteEducation = async (req, res, next) => {
  try { await candidateSvc.deleteEducation(req.candidato.id, req.params.id); return ok(res, null, 'Removido.'); }
  catch (err) { next(err); }
};

// ── Upload ─────────────────────────────────────────────────────────
const uploadCurriculo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ success: false, message: 'Nenhum arquivo enviado.' });
    const anexo = await uploadSvc.salvarAnexo(req.candidato.id, req.file, 'curriculo', true);
    return created(res, anexo, 'Currículo enviado com sucesso!');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── RH: Pipeline e gestão ──────────────────────────────────────────

/**
 * GET /api/v1/candidatos/rh/vagas/:vagaId/pipeline
 * Pipeline Kanban da vaga para o RH.
 */
const getPipeline = async (req, res, next) => {
  try {
    const pipeline = await applicationSvc.getPipeline(req.user.empresa_id, req.params.vagaId);
    return ok(res, pipeline);
  } catch (err) { next(err); }
};

/**
 * PATCH /api/v1/candidatos/rh/applications/:id/etapa
 * Move candidato no pipeline.
 */
const moverEtapa = async (req, res, next) => {
  try {
    const { etapa, motivo, feedback_candidato } = req.body;
    const result = await applicationSvc.moverEtapa(
      req.user.empresa_id, req.params.id, etapa, req.user.id, { motivo, feedback_candidato }
    );
    return ok(res, result, `Candidato movido para "${etapa}".`);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

/**
 * POST /api/v1/candidatos/rh/applications/:id/comentario
 */
const addComment = async (req, res, next) => {
  try {
    const comentario = await applicationSvc.addComment(req.user.empresa_id, req.params.id, req.body.comentario, req.user.id);
    return created(res, comentario, 'Comentário adicionado.');
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/candidatos/rh/applications/:id/timeline
 */
const getTimeline = async (req, res, next) => {
  try {
    const timeline = await applicationSvc.getTimeline(req.user.empresa_id, req.params.id, false);
    return ok(res, timeline);
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/candidatos/rh/applications/:id/converter
 * Converte candidato aprovado em colaborador.
 */
const converter = async (req, res, next) => {
  try {
    const result = await conversionSvc.converterCandidateParaColaborador(
      req.user.empresa_id, req.params.id, req.body, req.user.id
    );
    return created(res, result, result.mensagem);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

/**
 * GET /api/v1/candidatos/rh/talent-pool
 * Banco de talentos filtrado.
 */
const getTalentPool = async (req, res, next) => {
  try {
    const result = await candidateSvc.searchTalentPool(req.user.empresa_id, req.query);
    return ok(res, result.data);
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/candidatos/rh/vagas/:id/publicar
 * Publica vaga e gera slug + token público.
 */
const publicarVaga = async (req, res, next) => {
  try {
    const { vagaPublicaService } = require('../services/vagaPublicaService');
    const vaga = await vagaPublicaSvc.publicar(req.user.empresa_id, req.params.id, req.body);
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/carreiras.html#/vaga/${vaga.slug}`;
    return ok(res, { vaga, link_publico: link }, 'Vaga publicada! Link gerado.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Helper JWT para candidatos ────────────────────────────────────

const _gerarToken = (candidato) => jwt.sign(
  { sub: candidato.id, tipo: 'candidato', email: candidato.email },
  env.JWT_SECRET,
  { expiresIn: env.JWT_EXPIRES_IN || '7d' }
);

module.exports = {
  register, login,
  listarVagasPublicas, getVagaPublica,
  aplicar, minhasCandidaturas,
  getPerfil, updatePerfil,
  addExperience, updateExperience, deleteExperience,
  addEducation, deleteEducation,
  uploadCurriculo,
  getPipeline, moverEtapa, addComment, getTimeline,
  converter, getTalentPool, publicarVaga,
};
