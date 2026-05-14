'use strict';
const { forbidden } = require('../utils/response');

// Hierarquia de perfis (quanto maior, mais permissões)
const NIVEIS = {
  colaborador: 1,
  juridico:    2,
  analista:    3,
  gestor:      4,
  rh:          5,
  admin:       6,
};

/**
 * Exige um dos perfis listados
 * @param {...string} perfis
 */
const requirePerfil = (...perfis) => (req, res, next) => {
  if (!req.user) return forbidden(res, 'Autenticação necessária.');
  if (perfis.includes(req.user.perfil)) return next();
  return forbidden(res, `Perfil insuficiente. Necessário: ${perfis.join(' ou ')}.`);
};

/**
 * Exige nível mínimo na hierarquia
 */
const requireNivel = (nivelMinimo) => (req, res, next) => {
  if (!req.user) return forbidden(res, 'Autenticação necessária.');
  const nivel = NIVEIS[req.user.perfil] ?? 0;
  if (nivel >= (NIVEIS[nivelMinimo] ?? 0)) return next();
  return forbidden(res, `Nível de acesso insuficiente. Necessário: ${nivelMinimo}.`);
};

/**
 * Somente admin
 */
const onlyAdmin = requirePerfil('admin');

/**
 * Admin ou RH
 */
const onlyRH = requirePerfil('admin', 'rh');

/**
 * Admin, RH ou analista
 */
const onlyAnalista = requirePerfil('admin', 'rh', 'analista');

/**
 * Admin, RH, analista ou gestor
 */
const onlyGestor = requirePerfil('admin', 'rh', 'analista', 'gestor');

/**
 * Verifica se o usuário acessa apenas seus próprios dados
 * Para colaboradores que só podem ver o próprio perfil
 */
const ownOrRH = (req, res, next) => {
  const { perfil, colaborador_id } = req.user;
  const idAlvo = req.params.id || req.params.colaboradorId;

  // RH e admin passam direto
  if (['admin','rh','analista','gestor'].includes(perfil)) return next();

  // Colaborador só acessa os próprios dados
  if (colaborador_id && (idAlvo === colaborador_id || idAlvo === req.user.id)) return next();

  return forbidden(res, 'Você só pode acessar seus próprios dados.');
};

module.exports = {
  requirePerfil,
  requireNivel,
  onlyAdmin,
  onlyRH,
  onlyAnalista,
  onlyGestor,
  ownOrRH,
  NIVEIS,
};
