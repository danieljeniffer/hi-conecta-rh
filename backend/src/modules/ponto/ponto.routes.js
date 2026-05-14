'use strict';
const router  = require('express').Router();
const dayjs   = require('dayjs');
const { prisma }  = require('../../config/database');
const { ok, created } = require('../../utils/response');
const { authenticate }  = require('../../middleware/auth.middleware');
const { resolveTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, resolveTenant);

// POST — registrar ponto
router.post('/registrar', async (req, res, next) => {
  try {
    const { tipo, colaborador_id } = req.body;
    const colId = colaborador_id || req.user.colaborador_id;
    if (!colId) return res.status(400).json({ success: false, message: 'Colaborador não identificado.' });

    const registro = await prisma.registroPonto.create({
      data: {
        empresa_id:    req.user.empresa_id,
        colaborador_id: colId,
        tipo,
        data_hora:     new Date(),
        ip:            req.ip,
        dispositivo:   req.headers['user-agent']?.slice(0, 100),
        latitude:      req.body.latitude  ? parseFloat(req.body.latitude)  : null,
        longitude:     req.body.longitude ? parseFloat(req.body.longitude) : null,
      },
    });

    created(res, registro, `${tipo} registrado às ${dayjs().format('HH:mm:ss')}.`);
  } catch (err) { next(err); }
});

// GET — espelho de ponto por mês
router.get('/espelho', async (req, res, next) => {
  try {
    const { colaborador_id, mes } = req.query;
    const colId = colaborador_id || req.user.colaborador_id;
    if (!colId) return res.status(400).json({ success: false, message: 'Colaborador não identificado.' });

    const ref    = mes ? dayjs(mes) : dayjs();
    const inicio = ref.startOf('month').toDate();
    const fim    = ref.endOf('month').toDate();

    const registros = await prisma.registroPonto.findMany({
      where: {
        empresa_id:     req.user.empresa_id,
        colaborador_id: colId,
        data_hora:      { gte: inicio, lte: fim },
      },
      orderBy: { data_hora: 'asc' },
    });

    // Agrupa por dia
    const porDia = {};
    for (const r of registros) {
      const dia = dayjs(r.data_hora).format('YYYY-MM-DD');
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(r);
    }

    ok(res, { competencia: ref.format('YYYY-MM'), registros: porDia });
  } catch (err) { next(err); }
});

// POST — solicitar ajuste de ponto
router.post('/ajuste', async (req, res, next) => {
  try {
    const { registro_id, motivo } = req.body;
    await prisma.registroPonto.update({
      where: { id: registro_id },
      data:  { ajuste_motivo: motivo, ajustado: false }, // false = aguardando aprovação
    });
    ok(res, null, 'Solicitação de ajuste enviada ao RH.');
  } catch (err) { next(err); }
});

module.exports = router;
