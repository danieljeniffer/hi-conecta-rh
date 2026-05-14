'use strict';
const { prisma }   = require('../../config/database');
const { getIO }    = require('../../sockets');
const { emailQueue } = require('../../queues/email.queue');

const enviar = async (usuarioId, empresaId, { tipo, titulo, mensagem, dados = null, prioridade = 'normal', canal = 'inapp' }) => {
  const notif = await prisma.notificacao.create({
    data: {
      empresa_id:      empresaId,
      destinatario_id: usuarioId,
      tipo,
      titulo,
      mensagem,
      dados,
      prioridade,
      canal,
    },
  });

  // Envia em tempo real via Socket.io
  try {
    const io = getIO();
    if (io) io.to(`user:${usuarioId}`).emit('notification:new', notif);
  } catch { /* socket pode não estar disponível */ }

  // Envia por email se canal inclui email
  if (canal.includes('email')) {
    const usuario = await prisma.usuario.findUnique({
      where:  { id: usuarioId },
      select: { email: true, nome: true },
    });
    if (usuario) {
      await emailQueue.add('notification', {
        to:       usuario.email,
        nome:     usuario.nome,
        titulo,
        mensagem,
      });
    }
  }

  return notif;
};

// Notifica todos os RHs da empresa
const notificarRH = async (empresaId, titulo, mensagem, tipo = 'geral') => {
  const usuarios = await prisma.usuario.findMany({
    where: { empresa_id: empresaId, perfil: { in: ['admin','rh'] }, ativo: true },
    select: { id: true },
  });

  await Promise.all(
    usuarios.map(u => enviar(u.id, empresaId, { tipo, titulo, mensagem, prioridade: 'normal' }))
  );
};

// Notifica folha aprovada (holerite disponível para todos)
const notificarFolhaAprovada = async (empresaId, competencia) => {
  const colaboradores = await prisma.usuario.findMany({
    where:  { empresa_id: empresaId, ativo: true },
    select: { id: true },
  });

  await Promise.all(
    colaboradores.map(u => enviar(u.id, empresaId, {
      tipo:      'holerite_disponivel',
      titulo:    `Holerite de ${competencia} disponível`,
      mensagem:  'Seu contracheque foi liberado. Acesse no Portal do Colaborador.',
      prioridade:'normal',
    }))
  );
};

const listar = (usuarioId, empresaId, query = {}) =>
  prisma.notificacao.findMany({
    where: {
      destinatario_id: usuarioId,
      empresa_id:      empresaId,
      ...(query.nao_lida === 'true' && { lida: false }),
    },
    orderBy: { created_at: 'desc' },
    take:    parseInt(query.limit || '30', 10),
  });

const marcarLida = (id, usuarioId) =>
  prisma.notificacao.updateMany({
    where: { id, destinatario_id: usuarioId },
    data:  { lida: true, lida_em: new Date() },
  });

const marcarTodasLidas = (usuarioId) =>
  prisma.notificacao.updateMany({
    where: { destinatario_id: usuarioId, lida: false },
    data:  { lida: true, lida_em: new Date() },
  });

module.exports = {
  notificacaoService: { enviar, notificarRH, notificarFolhaAprovada, listar, marcarLida, marcarTodasLidas },
  enviar, notificarRH, notificarFolhaAprovada, listar, marcarLida, marcarTodasLidas,
};
