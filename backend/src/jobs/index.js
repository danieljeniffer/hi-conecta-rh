'use strict';
const { startEmailWorker } = require('../queues/email.queue');
const logger = require('../config/logger');

// Cron jobs inline (sem dependências extras)
const startJobs = () => {
  // 1. Worker de emails
  startEmailWorker();

  // 2. Workers de integração Bitrix24
  try {
    const { startBitrixEventWorker } = require('../modules/bitrix24/workers/bitrixEventWorker');
    const { startEngagementWorker }  = require('../modules/bitrix24/workers/engagementWorker');
    startBitrixEventWorker();
    startEngagementWorker();
  } catch (err) {
    logger.warn('[Jobs] Workers Bitrix24 não iniciados (módulo opcional):', err.message);
  }

  // 3. Worker ATS — matching candidatos ↔ vagas
  try {
    const { startAtsMatcherWorker } = require('../modules/candidatos/workers/atsMatcher');
    startAtsMatcherWorker();
  } catch (err) {
    logger.warn('[Jobs] Worker ATS não iniciado:', err.message);
  }

  // 4. Job diário às 8h — alertas de férias e aniversários
  const agendarCron = (nomeFn, intervalMs, fn) => {
    fn(); // executa na inicialização
    setInterval(fn, intervalMs);
    logger.info(`[Jobs] ${nomeFn} agendado (${intervalMs / 1000 / 60} min).`);
  };

  // A cada 6h — verifica férias vencendo
  agendarCron('ferias_alerta', 6 * 3600 * 1000, verificarFeriasVencendo);

  // A cada 24h — encerramento automático de vagas vencidas no ATS
  agendarCron('vagas_vencidas', 24 * 3600 * 1000, encerrarVagasVencidas);

  // A cada 24h — aniversariantes
  agendarCron('aniversariantes', 24 * 3600 * 1000, alertarAniversariantes);

  // A cada 6h — recalcula scores de engajamento de todas as empresas
  agendarCron('engagement_recalculo', 6 * 3600 * 1000, recalcularEngagamento);

  logger.info('[Jobs] Todos os jobs iniciados.');
};

// ── Jobs individuais ──────────────────────────
const verificarFeriasVencendo = async () => {
  const { prisma } = require('../config/database');
  const { emailQueue } = require('../queues/email.queue');
  const dayjs = require('dayjs');

  try {
    const limite = dayjs().add(30, 'day').toDate();
    const ferias = await prisma.ferias.findMany({
      where: {
        status:      'pendente',
        gozo_inicio: { lte: limite },
      },
      include: {
        colaborador: { include: { usuario: { select: { email: true, nome: true } } } },
      },
    });

    for (const f of ferias) {
      const u = f.colaborador.usuario;
      if (!u?.email) continue;
      await emailQueue.add('notification', {
        to:       u.email,
        nome:     u.nome,
        titulo:   '🏖️ Férias vencendo em breve',
        mensagem: `Suas férias no período ${dayjs(f.periodo_fim).format('DD/MM/YYYY')} vencem em breve.`,
      });
    }

    if (ferias.length > 0) logger.info(`[Jobs] ${ferias.length} alertas de férias disparados.`);
  } catch (err) {
    logger.error('[Jobs] Erro em verificarFeriasVencendo:', err.message);
  }
};

const alertarAniversariantes = async () => {
  const { prisma } = require('../config/database');
  const dayjs = require('dayjs');
  const { emitToEmpresa } = require('../sockets');

  try {
    const hoje = dayjs();
    const mes  = hoje.month() + 1;
    const dia  = hoje.date();

    const anivs = await prisma.colaborador.findMany({
      where: {
        status:          { not: 'desligado' },
        deleted_at:      null,
        data_nascimento: {
          not: null,
        },
      },
      select: { id: true, nome: true, empresa_id: true, data_nascimento: true, foto_url: true },
    });

    const hoje_anivs = anivs.filter(c => {
      const d = dayjs(c.data_nascimento);
      return d.month() + 1 === mes && d.date() === dia;
    });

    for (const a of hoje_anivs) {
      emitToEmpresa(a.empresa_id, 'aniversario:hoje', {
        nome:    a.nome,
        foto:    a.foto_url,
        empresa: a.empresa_id,
      });
    }

    if (hoje_anivs.length > 0) logger.info(`[Jobs] ${hoje_anivs.length} aniversariantes hoje.`);
  } catch (err) {
    logger.error('[Jobs] Erro em alertarAniversariantes:', err.message);
  }
};

/**
 * Recalcula scores de engajamento Bitrix24 para todas as empresas ativas.
 * Executa a cada 6 horas.
 */
const recalcularEngagamento = async () => {
  try {
    const EngagementEngine = require('../analytics/engagementEngine');
    const { prisma }       = require('../config/database');
    const { emitToEmpresa } = require('../sockets');

    const empresas = await prisma.empresa.findMany({
      where:  { status: { in: ['ativa', 'trial'] }, deleted_at: null },
      select: { id: true },
    });

    for (const { id } of empresas) {
      const resultado = await EngagementEngine.recalcularEmpresa(id);

      // Emite evento Socket.io para atualizar dashboards em tempo real
      if (resultado.processados > 0) {
        emitToEmpresa(id, 'engagement:batch_updated', {
          empresa_id: id,
          processados: resultado.processados,
          timestamp:   new Date().toISOString(),
        });
      }

      logger.info(`[Jobs] Engagement recalculado: empresa ${id} — ${resultado.processados} colaboradores`);
    }
  } catch (err) {
    logger.error('[Jobs] Erro em recalcularEngagamento:', err.message);
  }
};

/** Encerra vagas com prazo vencido e notifica RH. */
const encerrarVagasVencidas = async () => {
  try {
    const { prisma } = require('../config/database');
    const vencidas   = await prisma.vaga.findMany({
      where: { status: 'aberta', encerra_em: { lte: new Date() }, deleted_at: null },
      select: { id: true, titulo: true, empresa_id: true },
    });
    for (const v of vencidas) {
      await prisma.vaga.update({ where: { id: v.id }, data: { status: 'fechada' } });
      logger.info(`[Jobs/ATS] Vaga encerrada automaticamente: "${v.titulo}"`);
    }
    if (vencidas.length > 0) logger.info(`[Jobs/ATS] ${vencidas.length} vagas encerradas.`);
  } catch (err) { logger.error('[Jobs/ATS] Erro em encerrarVagasVencidas:', err.message); }
};

module.exports = { startJobs };
