'use strict';

const ok = (res, data = null, message = 'Sucesso', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Criado com sucesso.') =>
  res.status(201).json({ success: true, message, data });

const noContent = (res) =>
  res.status(204).send();

const badRequest = (res, message = 'Dados inválidos.', extra = {}) =>
  res.status(400).json({ success: false, message, ...extra });

const unauthorized = (res, message = 'Não autorizado.') =>
  res.status(401).json({ success: false, message });

const forbidden = (res, message = 'Acesso negado.') =>
  res.status(403).json({ success: false, message });

const notFound = (res, message = 'Recurso não encontrado.') =>
  res.status(404).json({ success: false, message });

const conflict = (res, message = 'Conflito com recurso existente.') =>
  res.status(409).json({ success: false, message });

const unprocessable = (res, message, erros = []) =>
  res.status(422).json({ success: false, message, erros });

const serverError = (res, message = 'Erro interno do servidor.') =>
  res.status(500).json({ success: false, message });

// Paginação
const paginated = (res, data, meta) =>
  res.status(200)
    .set({
      'X-Total-Count': meta.total,
      'X-Page':        meta.page,
      'X-Per-Page':    meta.per_page,
    })
    .json({
      success: true,
      data,
      meta: {
        total:      meta.total,
        page:       meta.page,
        per_page:   meta.per_page,
        last_page:  Math.ceil(meta.total / meta.per_page),
        from:       (meta.page - 1) * meta.per_page + 1,
        to:         Math.min(meta.page * meta.per_page, meta.total),
      },
    });

module.exports = {
  ok, created, noContent,
  badRequest, unauthorized, forbidden,
  notFound, conflict, unprocessable,
  serverError, paginated,
};
