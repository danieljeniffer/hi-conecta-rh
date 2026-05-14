'use strict';

/**
 * Extrai e valida parâmetros de paginação da query string
 */
const parsePagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page     = Math.max(1, parseInt(query.page  || '1', 10));
  const per_page = Math.min(maxLimit, Math.max(1, parseInt(query.per_page || String(defaultLimit), 10)));
  const skip     = (page - 1) * per_page;
  const take     = per_page;

  return { page, per_page, skip, take };
};

/**
 * Executa query com paginação e retorna { data, meta }
 * @param {Function} queryFn  — fn(skip, take) que retorna dados
 * @param {Function} countFn  — fn() que retorna total
 * @param {Object}   pagination — { page, per_page, skip, take }
 */
const paginate = async (queryFn, countFn, pagination) => {
  const { page, per_page, skip, take } = pagination;

  const [data, total] = await Promise.all([
    queryFn(skip, take),
    countFn(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      per_page,
      last_page: Math.ceil(total / per_page),
    },
  };
};

/**
 * Helper para ordenação dinâmica no Prisma
 */
const parseOrderBy = (query, allowedFields, defaultField = 'created_at', defaultDir = 'desc') => {
  const field = allowedFields.includes(query.sort_by) ? query.sort_by : defaultField;
  const dir   = ['asc','desc'].includes(query.sort_dir?.toLowerCase())
    ? query.sort_dir.toLowerCase()
    : defaultDir;

  return { [field]: dir };
};

module.exports = { parsePagination, paginate, parseOrderBy };
