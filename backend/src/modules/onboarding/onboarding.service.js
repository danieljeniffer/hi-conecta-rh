'use strict';
const { prisma } = require('../../config/database');
const { notificacaoService } = require('../notificacoes/notificacao.service');

// Tasks padrão de onboarding
const TASKS_DEFAULT = [
  { titulo: 'Assinar contrato de trabalho',   responsavel: 'colaborador', prazo_dias: 1, obrigatoria: true,  ordem: 1 },
  { titulo: 'Enviar documentos pessoais',      responsavel: 'colaborador', prazo_dias: 2, obrigatoria: true,  ordem: 2 },
  { titulo: 'Configurar e-mail corporativo',   responsavel: 'ti',         prazo_dias: 1, obrigatoria: true,  ordem: 3 },
  { titulo: 'Liberar acessos aos sistemas',    responsavel: 'ti',         prazo_dias: 2, obrigatoria: true,  ordem: 4 },
  { titulo: 'Apresentação à equipe',           responsavel: 'gestor',     prazo_dias: 1, obrigatoria: true,  ordem: 5 },
  { titulo: 'Tour pelas instalações',           responsavel: 'rh',        prazo_dias: 1, obrigatoria: false, ordem: 6 },
  { titulo: 'Treinamento institucional',        responsavel: 'rh',        prazo_dias: 5, obrigatoria: true,  ordem: 7 },
  { titulo: 'Treinamento de segurança (NR-1)', responsavel: 'rh',        prazo_dias: 5, obrigatoria: true,  ordem: 8 },
  { titulo: 'Cadastrar dados bancários no RH', responsavel: 'colaborador',prazo_dias: 3, obrigatoria: true,  ordem: 9 },
  { titulo: 'Completar perfil no portal',       responsavel: 'colaborador',prazo_dias: 3, obrigatoria: false, ordem: 10 },
  { titulo: 'Avaliação de 15 dias',             responsavel: 'gestor',    prazo_dias: 15, obrigatoria: true,  ordem: 11 },
  { titulo: 'Avaliação de 45 dias',             responsavel: 'gestor',    prazo_dias: 45, obrigatoria: true,  ordem: 12 },
];

const iniciarOnboarding = async (colaboradorId, empresaId) => {
  // Verifica se já tem tasks
  const existente = await prisma.onboardingTask.count({ where: { colaborador_id: colaboradorId } });
  if (existente > 0) return;

  await prisma.onboardingTask.createMany({
    data: TASKS_DEFAULT.map(t => ({
      colaborador_id: colaboradorId,
      empresa_id:     empresaId,
      ...t,
    })),
  });

  await _atualizarPct(colaboradorId);
};

const listarTasks = (colaboradorId) =>
  prisma.onboardingTask.findMany({
    where:   { colaborador_id: colaboradorId },
    orderBy: { ordem: 'asc' },
  });

const concluirTask = async (taskId, colaboradorId, usuarioId) => {
  const task = await prisma.onboardingTask.update({
    where: { id: taskId },
    data: {
      concluida:    true,
      concluida_em: new Date(),
      concluida_por: usuarioId,
    },
  });

  await _atualizarPct(colaboradorId);
  return task;
};

const _atualizarPct = async (colaboradorId) => {
  const [total, concluidas] = await Promise.all([
    prisma.onboardingTask.count({ where: { colaborador_id: colaboradorId } }),
    prisma.onboardingTask.count({ where: { colaborador_id: colaboradorId, concluida: true } }),
  ]);

  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  await prisma.colaborador.update({
    where: { id: colaboradorId },
    data:  { onboarding_pct: pct, onboarding_completo: pct === 100 },
  });
};

module.exports = { iniciarOnboarding, listarTasks, concluirTask };
