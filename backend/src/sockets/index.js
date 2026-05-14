'use strict';
const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const env        = require('../config/env');
const logger     = require('../config/logger');

let _io = null;

const initSockets = (httpServer) => {
  _io = new Server(httpServer, {
    cors: {
      origin:      env.CORS_ORIGINS,
      methods:     ['GET','POST'],
      credentials: true,
    },
    pingTimeout:  20000,
    pingInterval: 25000,
  });

  // ── Autenticação via token ────────────────────
  _io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Token não fornecido.'));

      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.user = {
        id:         payload.sub,
        empresa_id: payload.empresa_id,
        perfil:     payload.perfil,
      };
      next();
    } catch {
      next(new Error('Token inválido.'));
    }
  });

  _io.on('connection', (socket) => {
    const { id: userId, empresa_id } = socket.user;

    // Salas: por usuário e por empresa
    socket.join(`user:${userId}`);
    socket.join(`empresa:${empresa_id}`);

    logger.debug(`[Socket] Conectado: ${userId} (${empresa_id})`);

    // Evento de digitação (chat/feed)
    socket.on('feed:typing', (data) => {
      socket.to(`empresa:${empresa_id}`).emit('feed:typing', {
        usuario_id: userId,
        ...data,
      });
    });

    // Confirmação de leitura de notificação
    socket.on('notification:read', (notifId) => {
      logger.debug(`[Socket] Notif lida: ${notifId} por ${userId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket] Desconectado: ${userId} — ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error('[Socket] Erro:', err.message);
    });
  });

  logger.info('[Socket.io] Iniciado.');
  return _io;
};

// Retorna instância do io para uso nos services
const getIO = () => _io;

// Helpers para emitir eventos de qualquer módulo
const emitToUser    = (userId, event, data) => _io?.to(`user:${userId}`).emit(event, data);
const emitToEmpresa = (empresaId, event, data) => _io?.to(`empresa:${empresaId}`).emit(event, data);
const emitToAll     = (event, data)           => _io?.emit(event, data);

module.exports = { initSockets, getIO, emitToUser, emitToEmpresa, emitToAll };
