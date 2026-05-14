'use strict';
const router = require('express').Router();
const { prisma }  = require('../../config/database');
const { ok, created, paginated } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH }        = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { parsePagination } = require('../../utils/pagination');

router.use(authenticate, resolveTenant);

// ── Comunicados ───────────────────────────────
router.get('/comunicados', async (req, res, next) => {
  try {
    const comunicados = await prisma.comunicado.findMany({
      where:   { empresa_id: req.user.empresa_id, publicado: true, deleted_at: null },
      orderBy: { publicado_em: 'desc' },
      take:    20,
    });
    ok(res, comunicados);
  } catch (err) { next(err); }
});

router.post('/comunicados', onlyRH, async (req, res, next) => {
  try {
    const { titulo, conteudo, urgente, segmentos, expira_em } = req.body;
    const com = await prisma.comunicado.create({
      data: {
        empresa_id:   req.user.empresa_id,
        autor_id:     req.user.id,
        titulo,
        conteudo,
        urgente:      urgente || false,
        publicado:    true,
        publicado_em: new Date(),
        segmentos,
        expira_em:    expira_em ? new Date(expira_em) : null,
      },
    });
    created(res, com, 'Comunicado publicado.');
  } catch (err) { next(err); }
});

// ── Feed ──────────────────────────────────────
router.get('/feed', async (req, res, next) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query, 20);
    const where = { empresa_id: req.user.empresa_id, deleted_at: null };

    const [posts, total] = await Promise.all([
      prisma.feedPost.findMany({
        where, skip, take,
        orderBy: [{ fixado: 'desc' }, { created_at: 'desc' }],
        include: {
          autor:      { select: { nome: true, colaborador: { select: { foto_url: true, cargo: { select: { nome: true } } } } } },
          _count:     { select: { comentarios: true, reacoes: true } },
        },
      }),
      prisma.feedPost.count({ where }),
    ]);

    return paginated(res, posts, { total, page, per_page });
  } catch (err) { next(err); }
});

router.post('/feed', async (req, res, next) => {
  try {
    const post = await prisma.feedPost.create({
      data: {
        empresa_id: req.user.empresa_id,
        autor_id:   req.user.id,
        conteudo:   req.body.conteudo,
        tipo:       req.body.tipo || 'post',
      },
    });
    created(res, post, 'Post publicado.');
  } catch (err) { next(err); }
});

// Reagir a um post
router.post('/feed/:postId/reagir', async (req, res, next) => {
  try {
    const existing = await prisma.reacao.findUnique({
      where: { post_id_usuario_id: { post_id: req.params.postId, usuario_id: req.user.id } },
    });

    if (existing) {
      await prisma.reacao.delete({ where: { id: existing.id } });
      ok(res, null, 'Reação removida.');
    } else {
      const r = await prisma.reacao.create({
        data: { post_id: req.params.postId, usuario_id: req.user.id, tipo: req.body.tipo || 'like' },
      });
      ok(res, r, 'Reação adicionada.');
    }
  } catch (err) { next(err); }
});

// Comentar
router.post('/feed/:postId/comentar', async (req, res, next) => {
  try {
    const com = await prisma.comentario.create({
      data: {
        post_id:  req.params.postId,
        autor_id: req.user.id,
        conteudo: req.body.conteudo,
      },
    });
    created(res, com, 'Comentário adicionado.');
  } catch (err) { next(err); }
});

module.exports = router;
