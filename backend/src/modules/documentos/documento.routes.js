'use strict';
const router = require('express').Router();
const path   = require('path');
const { prisma } = require('../../config/database');
const { ok, created, noContent, paginated } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { onlyRH, ownOrRH } = require('../../middleware/rbac.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');
const { singleDoc }     = require('../../middleware/upload.middleware');
const { audit }         = require('../../middleware/audit.middleware');
const { parsePagination } = require('../../utils/pagination');
const env = require('../../config/env');

router.use(authenticate, resolveTenant);

// GET /api/v1/documentos
router.get('/', onlyRH, async (req, res, next) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);
    const { tipo, status, colaborador_id } = req.query;

    const where = {
      empresa_id:  req.user.empresa_id,
      deleted_at:  null,
      ...(tipo           && { tipo }),
      ...(status         && { status }),
      ...(colaborador_id && { colaborador_id }),
    };

    const [docs, total] = await Promise.all([
      prisma.documento.findMany({
        where, skip, take,
        orderBy: { created_at: 'desc' },
        include: { colaborador: { select: { id: true, nome: true } } },
      }),
      prisma.documento.count({ where }),
    ]);

    return paginated(res, docs, { total, page, per_page });
  } catch (err) { next(err); }
});

// POST /api/v1/documentos — upload
router.post('/',
  onlyRH, singleDoc, audit('CREATE', 'documentos'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Arquivo não enviado.' });

      const urlArquivo = `/uploads/${req.user.empresa_id}/${req.file.filename}`;

      const doc = await prisma.documento.create({
        data: {
          empresa_id:     req.user.empresa_id,
          colaborador_id: req.body.colaborador_id || null,
          tipo:           req.body.tipo || 'outro',
          titulo:         req.body.titulo || req.file.originalname,
          descricao:      req.body.descricao,
          arquivo_url:    urlArquivo,
          arquivo_nome:   req.file.originalname,
          arquivo_size:   req.file.size,
          mime_type:      req.file.mimetype,
          vence_em:       req.body.vence_em ? new Date(req.body.vence_em) : null,
          enviado_por:    req.user.id,
          status:         'enviado',
        },
      });

      created(res, doc, 'Documento enviado com sucesso.');
    } catch (err) { next(err); }
  }
);

// PATCH /api/v1/documentos/:id/assinar
router.patch('/:id/assinar', async (req, res, next) => {
  try {
    const doc = await prisma.documento.update({
      where: { id: req.params.id },
      data:  { status: 'assinado', assinado_em: new Date(), assinado_por: req.user.id },
    });
    ok(res, doc, 'Documento assinado digitalmente.');
  } catch (err) { next(err); }
});

// DELETE /api/v1/documentos/:id
router.delete('/:id', onlyRH, async (req, res, next) => {
  try {
    await prisma.documento.update({
      where: { id: req.params.id },
      data:  { deleted_at: new Date() },
    });
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
