'use strict';
/**
 * candidatos.routes.js
 * Roteador completo do Portal de Carreiras + ATS Enterprise.
 *
 * ROTAS PÚBLICAS (sem JWT):
 *   POST /auth/register              — cadastro candidato
 *   POST /auth/login                 — login candidato
 *   GET  /portal/:empresa_id/vagas   — listar vagas públicas
 *   GET  /portal/:empresa_id/vagas/:slug — detalhe da vaga
 *
 * ROTAS CANDIDATO (JWT candidato):
 *   GET/PUT /perfil
 *   POST    /aplicar/:vagaId
 *   GET     /minhas-candidaturas
 *   CRUD    /perfil/experiencias, /perfil/formacoes, /perfil/habilidades
 *   POST    /curriculo
 *
 * ROTAS RH (JWT RH + RBAC):
 *   GET    /rh/vagas/:vagaId/pipeline
 *   PATCH  /rh/applications/:id/etapa
 *   POST   /rh/applications/:id/comentario
 *   POST   /rh/applications/:id/converter
 *   GET    /rh/talent-pool
 *   POST   /rh/vagas/:id/publicar
 *
 * @module candidatos/routes/candidatos.routes
 */

const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const env     = require('../../../config/env');
const rateLimit   = require('../../../middleware/rateLimit.middleware');
const { authenticate }  = require('../../../middleware/auth.middleware');
const { onlyRH, onlyGestor } = require('../../../middleware/rbac.middleware');
const { resolveTenant } = require('../../../middleware/tenant.middleware');
const { audit }         = require('../../../middleware/audit.middleware');
const { validate }      = require('../../../middleware/validate.middleware');
const { z }             = require('zod');

const ctrl   = require('../controllers/candidateController');
const upload = require('../services/uploadService');

// ── Middleware auth do candidato ──────────────────────────────────

const authCandidato = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token de candidato não fornecido.' });
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], env.JWT_SECRET);
    if (payload.tipo !== 'candidato') {
      return res.status(403).json({ success: false, message: 'Token inválido para candidato.' });
    }
    req.candidato = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token expirado ou inválido.' });
  }
};

// ── Validators ────────────────────────────────────────────────────

const registerSchema = z.object({
  nome:             z.string().min(3),
  email:            z.string().email(),
  senha:            z.string().min(8),
  telefone:         z.string().optional(),
  cpf:              z.string().optional(),
  aceite_lgpd:      z.boolean({ required_error: 'Aceite da LGPD é obrigatório.' }),
  aceite_marketing: z.boolean().optional().default(false),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

const etapaSchema = z.object({
  etapa:              z.enum(['inscrito','triagem','entrevista_rh','entrevista_gestor','teste_tecnico','aprovado','contratado','banco_talentos','reprovado']),
  motivo:             z.string().optional(),
  feedback_candidato: z.string().optional(),
});

// ════════════════════════════════════════════════════════════════
// ROTAS PÚBLICAS — Portal de Carreiras
// ════════════════════════════════════════════════════════════════

/**
 * @api {post} /auth/register Criar conta de candidato
 */
router.post('/auth/register',
  rateLimit.auth,
  validate(registerSchema),
  ctrl.register
);

/**
 * @api {post} /auth/login Login do candidato
 */
router.post('/auth/login',
  rateLimit.auth,
  validate(loginSchema),
  ctrl.login
);

/**
 * @api {get} /portal/:empresa_id/vagas Vagas abertas (público, SEO)
 */
router.get('/portal/:empresa_id/vagas', ctrl.listarVagasPublicas);

/**
 * @api {get} /portal/:empresa_id/vagas/:slug Detalhe da vaga (público)
 */
router.get('/portal/:empresa_id/vagas/:slug', ctrl.getVagaPublica);

// ════════════════════════════════════════════════════════════════
// ROTAS DO CANDIDATO — Requerem JWT de candidato
// ════════════════════════════════════════════════════════════════

/**
 * @api {get} /perfil Perfil completo do candidato
 */
router.get('/perfil',
  authCandidato,
  ctrl.getPerfil
);

/**
 * @api {put} /perfil Atualizar perfil
 */
router.put('/perfil',
  authCandidato,
  ctrl.updatePerfil
);

/**
 * @api {post} /aplicar/:vagaId Candidatar-se a uma vaga
 */
router.post('/aplicar/:vagaId',
  authCandidato,
  ctrl.aplicar
);

/**
 * @api {get} /minhas-candidaturas Processos seletivos do candidato
 */
router.get('/minhas-candidaturas',
  authCandidato,
  ctrl.minhasCandidaturas
);

// ── Experiências ──────────────────────────────────────────────────
router.post  ('/perfil/experiencias',       authCandidato, ctrl.addExperience);
router.put   ('/perfil/experiencias/:id',   authCandidato, ctrl.updateExperience);
router.delete('/perfil/experiencias/:id',   authCandidato, ctrl.deleteExperience);

// ── Formações ─────────────────────────────────────────────────────
router.post  ('/perfil/formacoes',          authCandidato, ctrl.addEducation);
router.delete('/perfil/formacoes/:id',      authCandidato, ctrl.deleteEducation);

// ── Habilidades ───────────────────────────────────────────────────
router.put('/perfil/habilidades', authCandidato, async (req, res, next) => {
  try {
    const candidateSvc = require('../services/candidateService');
    await candidateSvc.syncSkills(req.candidato.id, req.body.habilidades || []);
    return res.json({ success: true, message: 'Habilidades atualizadas.' });
  } catch (err) { next(err); }
});

// ── Upload de currículo ───────────────────────────────────────────
/**
 * @api {post} /curriculo Upload do currículo (PDF/DOCX)
 */
router.post('/curriculo',
  authCandidato,
  upload.curriculoUpload.single('curriculo'),
  ctrl.uploadCurriculo
);

// ── LGPD ─────────────────────────────────────────────────────────
router.delete('/minha-conta', authCandidato, async (req, res, next) => {
  try {
    const candidateSvc = require('../services/candidateService');
    await candidateSvc.requestAccountDeletion(req.candidato.id);
    return res.json({ success: true, message: 'Solicitação de exclusão registrada. Dados removidos em 30 dias conforme LGPD.' });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════
// ROTAS RH — Requerem JWT de usuário RH + RBAC
// ════════════════════════════════════════════════════════════════

router.use('/rh', authenticate, resolveTenant);

/**
 * @api {post} /rh/vagas/:id/publicar Publica vaga e gera link público
 */
router.post('/rh/vagas/:id/publicar',
  onlyRH,
  audit('PUBLICAR', 'vagas'),
  ctrl.publicarVaga
);

/**
 * @api {get} /rh/vagas/:vagaId/pipeline Pipeline Kanban da vaga
 */
router.get('/rh/vagas/:vagaId/pipeline',
  onlyGestor,
  ctrl.getPipeline
);

/**
 * @api {get} /rh/vagas/:vagaId/candidatos Lista candidatos da vaga
 */
router.get('/rh/vagas/:vagaId/candidatos', onlyGestor, async (req, res, next) => {
  try {
    const applicationSvc = require('../services/applicationService');
    const result = await applicationSvc.listarPorVaga(req.user.empresa_id, req.params.vagaId, req.query);
    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) { next(err); }
});

/**
 * @api {patch} /rh/applications/:id/etapa Move candidato no pipeline
 */
router.patch('/rh/applications/:id/etapa',
  onlyGestor,
  validate(etapaSchema),
  audit('MOVER_ETAPA', 'ats_applications'),
  ctrl.moverEtapa
);

/**
 * @api {post} /rh/applications/:id/comentario Adiciona comentário interno
 */
router.post('/rh/applications/:id/comentario',
  onlyGestor,
  ctrl.addComment
);

/**
 * @api {get} /rh/applications/:id/timeline Timeline da candidatura
 */
router.get('/rh/applications/:id/timeline',
  onlyGestor,
  ctrl.getTimeline
);

/**
 * @api {post} /rh/applications/:id/converter Converte candidato em colaborador
 */
router.post('/rh/applications/:id/converter',
  onlyRH,
  audit('CONVERTER_CANDIDATO', 'ats_applications'),
  ctrl.converter
);

/**
 * @api {get} /rh/talent-pool Banco de talentos filtrado
 */
router.get('/rh/talent-pool',
  onlyGestor,
  ctrl.getTalentPool
);

/**
 * @api {get} /rh/dashboard Dashboard de recrutamento
 */
router.get('/rh/dashboard', onlyGestor, async (req, res, next) => {
  try {
    const { prisma } = require('../../../config/database');
    const emp        = req.user.empresa_id;

    const [totalVagas, totalCandidatos, porEtapa, recentes] = await Promise.all([
      prisma.vaga.count({ where: { empresa_id: emp, status: 'aberta', deleted_at: null } }),
      prisma.candidateApplication.count({ where: { empresa_id: emp, ativo: true } }),
      prisma.candidateApplication.groupBy({
        by: ['etapa'],
        where: { empresa_id: emp, ativo: true },
        _count: true,
      }),
      prisma.candidateApplication.findMany({
        where:   { empresa_id: emp, ativo: true },
        orderBy: { inscrito_em: 'desc' },
        take:    10,
        include: {
          candidato: { select: { nome: true, foto_url: true, cidade: true } },
          vaga:      { select: { titulo: true, slug: true } },
        },
      }),
    ]);

    return res.json({ success: true, data: {
      total_vagas_abertas: totalVagas,
      total_candidatos:    totalCandidatos,
      pipeline_por_etapa:  porEtapa.map(p => ({ etapa: p.etapa, total: p._count })),
      candidaturas_recentes: recentes,
    }});
  } catch (err) { next(err); }
});

module.exports = router;
