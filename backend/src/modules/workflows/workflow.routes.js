'use strict';
const router = require('express').Router();
const { prisma }  = require('../../config/database');
const { ok, created, paginated } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyGestor }    = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { parsePagination } = require('../../utils/pagination');
const { notificacaoService } = require('../notificacoes/notificacao.service');

router.use(authenticate, resolveTenant);

// GET — listar workflows
router.get('/', async (req, res, next) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);
    const { status, tipo } = req.query;

    const where = {
      empresa_id: req.user.empresa_id,
      ...(status && { status }),
      ...(tipo   && { tipo }),
    };

    const [list, total] = await Promise.all([
      prisma.workflow.findMany({
        where, skip, take,
        orderBy: { created_at: 'desc' },
        include: {
          solicitante: { select: { nome: true, email: true } },
          aprovador:   { select: { nome: true, email: true } },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    return paginated(res, list, { total, page, per_page });
  } catch (err) { next(err); }
});

// POST — criar solicitação
router.post('/', async (req, res, next) => {
  try {
    const { tipo, titulo, descricao, dados, aprovador_id, prazo } = req.body;

    const wf = await prisma.workflow.create({
      data: {
        empresa_id:    req.user.empresa_id,
        tipo,
        titulo,
        descricao,
        dados,
        solicitante_id: req.user.id,
        aprovador_id,
        prazo:          prazo ? new Date(prazo) : null,
        status:         'pendente',
      },
    });

    // Notifica aprovador
    if (aprovador_id) {
      await notificacaoService.enviar(aprovador_id, req.user.empresa_id, {
        tipo:     'workflow_novo',
        titulo:   `Nova solicitação: ${titulo}`,
        mensagem: `${req.user.nome} abriu uma solicitação que precisa da sua aprovação.`,
        prioridade: 'alta',
      });
    }

    created(res, wf, 'Solicitação criada.');
  } catch (err) { next(err); }
});

// PATCH /:id/aprovar
router.patch('/:id/aprovar', onlyGestor, async (req, res, next) => {
  try {
    const wf = await prisma.workflow.update({
      where: { id: req.params.id },
      data:  {
        status:      'aprovado',
        aprovado_em: new Date(),
        aprovador_id: req.user.id,
        comentario:  req.body.comentario,
      },
    });
    ok(res, wf, 'Solicitação aprovada.');
  } catch (err) { next(err); }
});

// PATCH /:id/recusar
router.patch('/:id/recusar', onlyGestor, async (req, res, next) => {
  try {
    const wf = await prisma.workflow.update({
      where: { id: req.params.id },
      data:  {
        status:      'recusado',
        comentario:  req.body.comentario,
        aprovador_id: req.user.id,
      },
    });
    ok(res, wf, 'Solicitação recusada.');
  } catch (err) { next(err); }
});

module.exports = router;
