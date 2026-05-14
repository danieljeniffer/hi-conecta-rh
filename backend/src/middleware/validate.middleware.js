'use strict';
const { z }      = require('zod');
const { badRequest } = require('../utils/response');

/**
 * Valida req.body contra schema Zod
 * @param {z.ZodSchema} schema
 * @param {'body'|'query'|'params'} target
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const erros = result.error.errors.map(e => ({
        campo:    e.path.join('.'),
        mensagem: e.message,
      }));
      return badRequest(res, 'Dados inválidos.', { erros });
    }

    // Substitui com dados validados e sanitizados pelo Zod
    req[target] = result.data;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Valida múltiplos targets em sequência
 */
const validateAll = (schemas) => (req, res, next) => {
  for (const [target, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const erros = result.error.errors.map(e => ({
        campo:    `${target}.${e.path.join('.')}`,
        mensagem: e.message,
      }));
      return badRequest(res, 'Dados inválidos.', { erros });
    }
    req[target] = result.data;
  }
  next();
};

module.exports = { validate, validateAll };
