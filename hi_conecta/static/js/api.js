/**
 * hi Conecta RH — api.js
 * Cliente HTTP seguro com CSRF, JWT e tratamento de erros.
 */
'use strict';

const Api = (function () {

  function getCsrf() {
    return window.CSRF_TOKEN ||
      document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
      document.cookie.split('; ').find(r => r.startsWith('csrftoken='))?.split('=')[1] || '';
  }

  async function request(method, url, data = null, opts = {}) {
    setLoading(true);

    const headers = {
      'X-CSRFToken':      getCsrf(),
      'X-Requested-With': 'XMLHttpRequest',
      ...opts.headers,
    };

    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method,
      headers,
      signal: AbortSignal.timeout(15000),
      ...opts,
    };

    if (data) {
      config.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    try {
      const res  = await fetch(url, config);
      const json = res.status === 204 ? null : await res.json();

      if (!res.ok) {
        const msg = json?.mensagem || json?.detail || `Erro ${res.status}`;
        Toast.error(msg);
        throw { status: res.status, mensagem: msg, dados: json };
      }

      return json;
    } catch (err) {
      if (err.name === 'TimeoutError') {
        Toast.error('Servidor demorou muito para responder.');
        throw err;
      }
      if (err.status) throw err;  // Erro já tratado acima
      Toast.error('Erro de comunicação com o servidor.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    get:    (url, opts)       => request('GET',    url, null, opts),
    post:   (url, data, opts) => request('POST',   url, data, opts),
    put:    (url, data, opts) => request('PUT',    url, data, opts),
    patch:  (url, data, opts) => request('PATCH',  url, data, opts),
    delete: (url, opts)       => request('DELETE', url, null, opts),

    upload: async (url, formData) => {
      return request('POST', url, formData, {
        headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
      });
    },
  };
})();

window.Api = Api;
