'use strict';
/**
 * bitrixApiService.js
 * Cliente HTTP enterprise para a API REST do Bitrix24.
 *
 * Responsável por:
 *  - Gerenciar credenciais e tokens OAuth2 do Bitrix24
 *  - Executar chamadas autenticadas com retry exponencial
 *  - Cache de respostas frequentes no Redis
 *  - Rate-limit aware (respeita os limites do Bitrix24: 2 req/s)
 *
 * @module bitrix24/services/bitrixApiService
 */

const env    = require('../../../config/env');
const logger = require('../../../config/logger');
const { redis, get: redisGet, set: redisSet } = require('../../../config/redis');
const { prisma } = require('../../../config/database');

/** Intervalo mínimo entre requisições ao Bitrix24 (rate-limit: 2 req/s) */
const BITRIX_MIN_INTERVAL_MS = 600;
/** Máximo de tentativas em retry exponencial */
const MAX_RETRIES = 4;
/** Cache TTL para chamadas de leitura (30 min) */
const CACHE_TTL_S = 1800;

let _lastRequest = 0;

/**
 * Throttle para respeitar o rate-limit do Bitrix24.
 * @returns {Promise<void>}
 */
const _throttle = async () => {
  const now  = Date.now();
  const wait = BITRIX_MIN_INTERVAL_MS - (now - _lastRequest);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  _lastRequest = Date.now();
};

/**
 * Carrega configuração do Bitrix24 da empresa no banco.
 * @param {string} empresaId
 * @returns {Promise<{webhook_url:string, token:string}|null>}
 */
const _loadConfig = async (empresaId) => {
  const cacheKey = `bitrix:config:${empresaId}`;
  const cached   = await redisGet(cacheKey);
  if (cached) return cached;

  const empresa = await prisma.empresa.findUnique({
    where:  { id: empresaId },
    select: { config: true },
  });

  const cfg = empresa?.config?.bitrix24 || null;
  if (cfg) await redisSet(cacheKey, cfg, 300); // cache 5 min
  return cfg;
};

/**
 * Executa uma chamada REST ao Bitrix24 com retry exponencial.
 *
 * @param {string}  empresaId  - ID da empresa
 * @param {string}  method     - Método Bitrix (ex: user.get, im.message.add)
 * @param {Object}  [params]   - Parâmetros da chamada
 * @param {Object}  [opts]     - Opções extras
 * @param {boolean} [opts.useCache=false]  - Usar cache Redis para GETs
 * @param {boolean} [opts.mutate=false]    - Indica que é uma mutação (não cachear)
 * @returns {Promise<Object>}
 */
const call = async (empresaId, method, params = {}, opts = {}) => {
  const config = await _loadConfig(empresaId);
  if (!config) {
    throw Object.assign(new Error('Bitrix24 não configurado para esta empresa.'), { status: 503 });
  }

  const cacheKey = `bitrix:resp:${empresaId}:${method}:${JSON.stringify(params)}`;

  if (opts.useCache && !opts.mutate) {
    const cached = await redisGet(cacheKey);
    if (cached) {
      logger.debug(`[Bitrix24] Cache HIT: ${method}`);
      return cached;
    }
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    await _throttle();
    try {
      const url = `${config.webhook_url}${method}`;
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 15_000);

      const resp = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(params),
        signal:  controller.signal,
      });
      clearTimeout(timeout);

      if (resp.status === 429) {
        // Rate limit — esperar conforme header Retry-After
        const retryAfter = parseInt(resp.headers.get('Retry-After') || '2', 10);
        logger.warn(`[Bitrix24] Rate-limit atingido. Aguardando ${retryAfter}s...`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        attempt++;
        continue;
      }

      if (!resp.ok) {
        throw Object.assign(
          new Error(`Bitrix24 HTTP ${resp.status}: ${method}`),
          { status: resp.status }
        );
      }

      const data = await resp.json();

      if (data.error) {
        throw Object.assign(
          new Error(`Bitrix24 API Error: ${data.error_description || data.error}`),
          { bitrix_error: data.error, status: 400 }
        );
      }

      if (opts.useCache && !opts.mutate) {
        await redisSet(cacheKey, data.result ?? data, CACHE_TTL_S);
      }

      logger.debug(`[Bitrix24] ${method} → OK (tentativa ${attempt + 1})`);
      return data.result ?? data;

    } catch (err) {
      if (err.name === 'AbortError') {
        logger.warn(`[Bitrix24] Timeout em ${method} (tentativa ${attempt + 1})`);
      } else if (err.bitrix_error) {
        throw err; // Erro de negócio — não retenta
      } else {
        logger.warn(`[Bitrix24] Erro em ${method} (tentativa ${attempt + 1}):`, err.message);
      }

      attempt++;
      if (attempt > MAX_RETRIES) throw err;

      // Backoff exponencial: 1s, 2s, 4s, 8s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

/**
 * Invalida cache de configuração (usar após salvar novas credenciais).
 * @param {string} empresaId
 */
const invalidateConfigCache = (empresaId) => redis.del(`bitrix:config:${empresaId}`);

module.exports = { call, invalidateConfigCache, _loadConfig };
