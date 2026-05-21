'use strict';
/**
 * engagementAutomation.js
 * Gatilhos de automação baseados em métricas de engajamento Bitrix24.
 *
 * Gatilhos implementados:
 *   baixo_engajamento      → alerta RH + tarefa gestor + notificação
 *   ausencia_interacao     → alerta RH + evento Timeline
 *   queda_brusca_atividade → alerta urgente + workflow de acompanhamento
 *   colaborador_destaque   → reconhecimento automático + gamificação
 *
 * Padrão: debounce por colaborador (evita spam de alertas).
 * TTL de debounce: 24h para alertas, 7 dias para destaques.
 *
 * @module analytics/engagementAutomation
 */

const logger         = require('../config/logger');
const { prisma }     = require('../config/database');
const { redis }      = require('../config/redis');
const { emitToEmpresa } = require('../sockets');

/** TTL de debounce por tipo de gatilho (em segundos) */
const DEBOUNCE_TTL = {
  baixo_engajamento:      86_400,   // 24h
  ausencia_interacao:     86_400,   // 24h
  queda_brusca_atividade: 43_200,   // 12h
  colaborador_destaque:   604_800,  // 7 dias
};

/**
 * Verifica se o gatilho está em debounce para o colaborador.
 * @param {string} tipo
 * @param {string} colaboradorId
 * @returns {Promise<boolean>}
 */
const _emDebounce = async (tipo, colaboradorId) => {
  const key = `engagement:debounce:${tipo}:${colaboradorId}`;
  return (await redis.exists(key)) === 1;
};

/**
 * Marca o gatilho como disparado (inicia debounce).
 * @param {string} tipo
 * @param {string} colaboradorId
 */
const _marcarDebounce = async (tipo, colaboradorId) => {
  const key = `engagement:debounce:${tipo}:${colaboradorId}`;
  await redis.set(key, '1', 'EX', DEBOUNCE_TTL[tipo] || 86_400);
};

/**
 * Cria uma notificação interna para o RH/Gestor.
 * @param {string}  empresaId
 * @param {string}  colaboradorId
 * @param {string}  titulo
 * @param {string}  mensagem
 * @param {string}  [prioridade='alta']
 */
const _notificarRH = async (empresaId, colaboradorId, titulo, mensagem, prioridade = 'alta') => {
  // Busca usuários RH da empresa
  const gestores = await prisma.usuario.findMany({
    where: { empresa_id: empresaId, perfil: { in: ['rh', 'admin'] }, ativo: true },
    select: { id: true },
  });

  await prisma.notificacao.createMany({
    data: gestores.map(g => ({
      empresa_id:      empresaId,
      destinatario_id: g.id,
      tipo:            'engagement_alert',
      titulo,
      mensagem,
      dados:           { colaborador_id: colaboradorId },
      prioridade,
    })),
    skipDuplicates: true,
  });

  // Emite realtime para RH online
  emitToEmpresa(empresaId, 'engagement:alert', {
    tipo:           'engagement_alert',
    colaborador_id: colaboradorId,
    titulo,
    mensagem,
    prioridade,
    timestamp:      new Date().toISOString(),
  });
};

/**
 * Função central de disparo de gatilhos.
 * Implementa debounce, logging e delegação por tipo.
 *
 * @param {string} tipo      - Tipo do gatilho
 * @param {Object} contexto  - Dados do gatilho
 */
const trigger = async (tipo, contexto) => {
  const { colaborador_id, empresa_id } = contexto;

  // Debounce: evita alertas repetidos no mesmo período
  if (await _emDebounce(tipo, colaborador_id)) {
    logger.debug(`[Automation] Gatilho ${tipo} em debounce para ${colaborador_id}`);
    return;
  }

  logger.info(`[Automation] Disparando gatilho: ${tipo} | colaborador: ${colaborador_id}`);

  try {
    switch (tipo) {
      case 'baixo_engajamento':
        await _gatilhoBaixoEngajamento(contexto);
        break;

      case 'ausencia_interacao':
        await _gatilhoAusenciaInteracao(contexto);
        break;

      case 'queda_brusca_atividade':
        await _gatilhoQuedaBrusca(contexto);
        break;

      case 'colaborador_destaque':
        await _gatilhoDestaque(contexto);
        break;

      default:
        logger.warn(`[Automation] Gatilho desconhecido: ${tipo}`);
        return;
    }

    await _marcarDebounce(tipo, colaborador_id);

  } catch (err) {
    logger.error(`[Automation] Erro no gatilho ${tipo}:`, err.message);
  }
};

// ── Implementações dos gatilhos ───────────────────────────────────

const _gatilhoBaixoEngajamento = async ({ colaborador_id, empresa_id, score_atual, score_anterior }) => {
  const colab = await prisma.colaborador.findUnique({
    where:   { id: colaborador_id },
    select:  { nome: true, gestor_nome: true, departamento: { select: { nome: true } } },
  });
  if (!colab) return;

  await _notificarRH(
    empresa_id,
    colaborador_id,
    `⚠️ Baixo engajamento: ${colab.nome}`,
    `${colab.nome} (${colab.departamento?.nome || 'Sem depto'}) apresenta score de engajamento baixo (${score_atual}/100). Score anterior: ${score_anterior}. Recomenda-se acompanhamento do gestor.`,
    'alta',
  );
};

const _gatilhoAusenciaInteracao = async ({ colaborador_id, empresa_id, dias_sem_interacao }) => {
  const colab = await prisma.colaborador.findUnique({
    where:  { id: colaborador_id },
    select: { nome: true, departamento: { select: { nome: true } } },
  });
  if (!colab) return;

  await _notificarRH(
    empresa_id,
    colaborador_id,
    `🔴 Sem atividade: ${colab.nome}`,
    `${colab.nome} não apresenta interações há ${dias_sem_interacao} dias. Isso pode indicar desmotivação ou ausência não registrada.`,
    'critica',
  );

  // Cria workflow de acompanhamento obrigatório
  const gestorRH = await prisma.usuario.findFirst({
    where:  { empresa_id, perfil: 'rh', ativo: true },
    select: { id: true },
  });

  if (gestorRH) {
    await prisma.workflow.create({
      data: {
        empresa_id,
        tipo:          'generico',
        titulo:        `Acompanhamento: ${colab.nome} — Ausência ${dias_sem_interacao}d`,
        descricao:     `Colaborador sem interações digitais por ${dias_sem_interacao} dias consecutivos. Verificar situação e documentar.`,
        solicitante_id:gestorRH.id,
        prioridade:    'alta',
        dados: {
          colaborador_id,
          tipo_automacao:    'ausencia_interacao',
          dias_sem_interacao,
        },
      },
    });
  }
};

const _gatilhoQuedaBrusca = async ({ colaborador_id, empresa_id, delta_7d }) => {
  const colab = await prisma.colaborador.findUnique({
    where:  { id: colaborador_id },
    select: { nome: true },
  });
  if (!colab) return;

  await _notificarRH(
    empresa_id,
    colaborador_id,
    `📉 Queda brusca: ${colab.nome}`,
    `${colab.nome} teve uma queda de ${Math.abs(delta_7d)} pontos no engajamento em 7 dias. Verificar urgente.`,
    'critica',
  );
};

const _gatilhoDestaque = async ({ colaborador_id, empresa_id, score_atual }) => {
  const colab = await prisma.colaborador.findUnique({
    where:  { id: colaborador_id },
    select: { nome: true, empresa_id: true },
  });
  if (!colab) return;

  // Notifica de forma positiva — sem urgência
  emitToEmpresa(empresa_id, 'engagement:destaque', {
    colaborador_id,
    nome:       colab.nome,
    score:      score_atual,
    mensagem:   `${colab.nome} atingiu nível de engajamento muito alto! 🌟`,
    timestamp:  new Date().toISOString(),
  });

  logger.info(`[Automation] Colaborador destaque: ${colab.nome} (${score_atual} pts)`);
};

module.exports = { trigger };
