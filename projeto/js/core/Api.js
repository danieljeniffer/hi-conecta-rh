/**
 * Api.js — Cliente HTTP centralizado
 * JWT automático, refresh silencioso, retry, timeouts.
 * Compatível com SPA Vanilla JS existente.
 */

const Api = (() => {
  'use strict';

  // ── Configuração ────────────────────────────
  // Prioridade: window.ENV.API_URL > window.AppConfig.api.baseUrl > fallback local
  const BASE_URL = window.ENV?.API_URL
    || window.AppConfig?.api?.baseUrl
    || 'http://localhost:3001/api/v1';
  const TIMEOUT_MS    = 15_000;
  const MAX_RETRIES   = 1;

  // Chaves de storage
  const KEY_TOKEN   = '_at';    // access token
  const KEY_REFRESH = '_rt';    // refresh token
  const KEY_USER    = 'hiRH_user';

  // Estado interno
  let _refreshing     = null;   // Promise em andamento de refresh
  let _requestCount   = 0;      // Para indicador de loading global

  // ── Storage seguro ───────────────────────────
  const token   = {
    get:     ()    => sessionStorage.getItem(KEY_TOKEN),
    set:     (t)   => sessionStorage.setItem(KEY_TOKEN, t),
    del:     ()    => sessionStorage.removeItem(KEY_TOKEN),
  };

  const refresh = {
    get:     ()    => sessionStorage.getItem(KEY_REFRESH),
    set:     (t)   => sessionStorage.setItem(KEY_REFRESH, t),
    del:     ()    => sessionStorage.removeItem(KEY_REFRESH),
  };

  // ── Indicador global de loading ──────────────
  const _setLoading = (active) => {
    _requestCount = Math.max(0, _requestCount + (active ? 1 : -1));
    const el = document.getElementById('global-loading');
    if (el) el.style.display = _requestCount > 0 ? 'block' : 'none';
    document.documentElement.classList.toggle('api-loading', _requestCount > 0);
  };

  // ── Refresh token silencioso ──────────────────
  const _refreshToken = async () => {
    if (_refreshing) return _refreshing;

    const rt = refresh.get();
    if (!rt) { _logout(); throw new ApiError('Sessão expirada.', 401); }

    _refreshing = fetch(`${BASE_URL}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh_token: rt }),
    })
      .then(async (res) => {
        if (!res.ok) { _logout(); throw new ApiError('Sessão expirada.', 401); }
        const data = await res.json();
        token.set(data.data.access_token);
        if (data.data.refresh_token) refresh.set(data.data.refresh_token);
        return data.data.access_token;
      })
      .finally(() => { _refreshing = null; });

    return _refreshing;
  };

  // ── Logout global ─────────────────────────────
  const _logout = () => {
    token.del();
    refresh.del();
    sessionStorage.removeItem(KEY_USER);
    // Redireciona para login mantendo hash para retorno
    const hash = window.location.hash;
    window.location.href = `login.html${hash ? '?redirect=' + encodeURIComponent(hash) : ''}`;
  };

  // ── Request core ──────────────────────────────
  const _request = async (method, endpoint, body = null, retries = MAX_RETRIES) => {
    _setLoading(true);

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers = {
      'Content-Type':  'application/json',
      'X-Request-ID':  _uuid(),
    };

    const at = token.get();
    if (at) headers['Authorization'] = `Bearer ${at}`;

    const opts = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body && ['POST','PUT','PATCH'].includes(method)) {
      opts.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, opts);
      clearTimeout(timeoutId);

      // ── 401 → refresh token ──────────────────
      if (res.status === 401 && retries > 0) {
        try {
          await _refreshToken();
          return _request(method, endpoint, body, retries - 1);
        } catch {
          _logout();
          throw new ApiError('Sessão expirada. Faça login novamente.', 401);
        }
      }

      // ── 403 → sem permissão ──────────────────
      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(err.message || 'Sem permissão para esta ação.', 403);
      }

      // ── 204 No Content ───────────────────────
      if (res.status === 204) return { success: true, data: null };

      const json = await res.json();

      if (!res.ok) {
        throw new ApiError(json.message || 'Erro na requisição.', res.status, json);
      }

      return json;

    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) throw err;

      if (err.name === 'AbortError') {
        throw new ApiError('Servidor demorou muito para responder.', 408);
      }

      if (!navigator.onLine) {
        throw new ApiError('Sem conexão com a internet.', 0);
      }

      throw new ApiError(err.message || 'Erro de comunicação com o servidor.', 0);

    } finally {
      _setLoading(false);
    }
  };

  // ── Upload de arquivo ─────────────────────────
  const upload = async (endpoint, formData) => {
    _setLoading(true);
    try {
      const at = token.get();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method:  'POST',
        headers: {
          ...(at && { Authorization: `Bearer ${at}` }),
          'X-Request-ID': _uuid(),
        },
        body: formData, // Sem Content-Type — browser define o boundary
      });

      const json = await res.json();
      if (!res.ok) throw new ApiError(json.message || 'Erro no upload.', res.status, json);
      return json;
    } finally {
      _setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────
  const _uuid = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

  // ── Classe de erro padronizada ────────────────
  class ApiError extends Error {
    constructor(message, status = 0, payload = null) {
      super(message);
      this.name    = 'ApiError';
      this.status  = status;
      this.payload = payload;
    }
  }

  // ── API Pública ───────────────────────────────
  return {
    get:    (endpoint)        => _request('GET',    endpoint),
    post:   (endpoint, body)  => _request('POST',   endpoint, body),
    put:    (endpoint, body)  => _request('PUT',    endpoint, body),
    patch:  (endpoint, body)  => _request('PATCH',  endpoint, body),
    delete: (endpoint)        => _request('DELETE', endpoint),
    upload,

    // Auth helpers
    setTokens: (at, rt) => { token.set(at); if (rt) refresh.set(rt); },
    clearTokens: _logout,
    hasToken: () => !!token.get(),

    // Utilitários
    ApiError,
    logout: _logout,
  };
})();

// ── Namespaces de domínio ─────────────────────────────────────────
// Usados pelos módulos SPA: import { Colaboradores } from '../core/Api.js'

const Auth = {
  login:   (email, senha) => Api.post('/auth/login', { email, senha }),
  refresh: (refresh_token) => Api.post('/auth/refresh', { refresh_token }),
  logout:  (refresh_token) => Api.post('/auth/logout', { refresh_token }),
  me:      () => Api.get('/auth/me'),
};

const Colaboradores = {
  listar:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return Api.get(`/colaboradores${qs ? '?' + qs : ''}`);
  },
  kpis:     () => Api.get('/colaboradores/kpis'),
  buscar:   (id) => Api.get(`/colaboradores/${id}`),
  criar:    (dados) => Api.post('/colaboradores', dados),
  atualizar:(id, dados) => Api.put(`/colaboradores/${id}`, dados),
  desligar: (id, dados) => Api.patch(`/colaboradores/${id}/desligar`, dados),
  remover:  (id) => Api.delete(`/colaboradores/${id}`),
  dependentes:    (id) => Api.get(`/colaboradores/${id}/dependentes`),
  addDependente:  (id, dep) => Api.post(`/colaboradores/${id}/dependentes`, dep),
  historicoSal:   (id) => Api.get(`/colaboradores/${id}/historico-salarial`),
};

const Departamentos = {
  listar: () => Api.get('/departamentos'),
  buscar: (id) => Api.get(`/departamentos/${id}`),
};

const Cargos = {
  listar: () => Api.get('/cargos'),
};

const DP = {
  calcular:     (dados) => Api.post('/dp/calcular', dados),
  calcularLote: (dados) => Api.post('/dp/calcular-lote', dados),
  dashboardOps: () => Api.get('/dp/dashboard-ops'),
};

const Folha = {
  listar:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return Api.get(`/folha${qs ? '?' + qs : ''}`);
  },
  abrir:     (dados) => Api.post('/folha', dados),
  calcular:  (id) => Api.post(`/folha/${id}/calcular`),
  aprovar:   (id) => Api.post(`/folha/${id}/aprovar`),
  pagar:     (id) => Api.post(`/folha/${id}/pagar`),
  holerite:  (id) => Api.get(`/folha/holerite/${id}`),
  itens:     (id) => Api.get(`/folha/${id}/itens`),
};

const Ferias = {
  listar:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return Api.get(`/ferias${qs ? '?' + qs : ''}`);
  },
  solicitar:(dados) => Api.post('/ferias', dados),
  simular:  (dados) => Api.post('/ferias/simulacao', dados),
  aprovar:  (id) => Api.patch(`/ferias/${id}/aprovar`),
  rejeitar: (id, motivo) => Api.patch(`/ferias/${id}/rejeitar`, { motivo }),
};

const Rescisao = {
  simular:  (dados) => Api.post('/rescisao/simular', dados),
  processar:(dados) => Api.post('/rescisao', dados),
  buscar:   (id) => Api.get(`/rescisao/${id}`),
};

const Analytics = {
  riscos:  () => Api.get('/colaboradores/riscos'),
  turnover:() => Api.get('/dashboard/turnover'),
  clima:   () => Api.get('/dashboard/clima'),
};

const Portal = {
  holerite:    () => Api.get('/folha/holerite'),
  ferias:      () => Api.get('/ferias/minhas'),
  beneficios:  () => Api.get('/colaboradores/beneficios'),
  ponto:       () => Api.get('/ponto/espelho'),
  baterPonto:  (tipo) => Api.post('/ponto', { tipo }),
  notificacoes:() => Api.get('/notificacoes'),
};

const conectarSocket = (io) => {
  if (!io) return null;
  const at = sessionStorage.getItem('_at');
  if (!at) return null;
  const BASE = window.ENV?.API_URL?.replace('/api/v1', '')
    || window.AppConfig?.api?.baseUrl?.replace('/api/v1', '')
    || 'http://localhost:3001';
  return io(BASE, {
    auth: { token: at },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  });
};

// Disponível globalmente
window.Api         = Api;
window.Auth        = Auth;
window.Colaboradores = Colaboradores;
window.Departamentos = Departamentos;
window.Cargos      = Cargos;
window.DP          = DP;
window.Folha       = Folha;
window.Ferias      = Ferias;
window.Rescisao    = Rescisao;
window.Analytics   = Analytics;
window.Portal      = Portal;
window.conectarSocket = conectarSocket;
