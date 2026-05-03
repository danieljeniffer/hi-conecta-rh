// =============================================
// HI CONECTA RH — ROUTER (seguro)
// Hash-based routing com validação, guard e
// proteção contra XSS em mensagens de erro.
// =============================================

const Router = (() => {
  let _pages  = {};
  let _titles = {};
  let _rendering = false; // evita renders concorrentes

  // Páginas válidas — apenas chaves registradas são aceitas
  function _paginaValida(key) {
    return Object.prototype.hasOwnProperty.call(_pages, key);
  }

  function navigateTo(pageKey) {
    if (!_paginaValida(pageKey)) {
      console.warn(`[Router] Página desconhecida: "${pageKey}". Redirecionando para dashboard.`);
      window.location.hash = 'dashboard';
      return;
    }
    window.location.hash = pageKey;
  }

  function _render(pageKey) {
    // Evita render duplo em rápidas mudanças de hash
    if (_rendering) return;

    // Sanitiza a chave — aceita apenas letras, números e hífens
    const key = /^[a-z0-9-]+$/.test(pageKey) && _paginaValida(pageKey)
      ? pageKey
      : 'dashboard';

    _rendering = true;

    // Atualiza itens de nav
    document.querySelectorAll('.nav-item[data-page]').forEach(el =>
      el.classList.toggle('active', el.dataset.page === key)
    );

    // Atualiza título via textContent (seguro — sem innerHTML)
    const titleEl = document.getElementById('pageTitle');
    const titleStr = _titles[key] || key;
    if (titleEl) titleEl.textContent = titleStr;
    document.title = `hi Conecta RH — ${titleStr}`;

    const container = document.getElementById('pageContainer');
    if (!container) { _rendering = false; return; }

    const renderFn = _pages[key];

    if (!renderFn) {
      // Página sem render → tela "em breve" via DOM seguro
      _renderEmBreve(container, key);
      _rendering = false;
      return;
    }

    try {
      const html = renderFn();
      // Aceita string HTML das funções de render (conteúdo interno controlado)
      container.innerHTML = typeof html === 'string' ? html : '';
    } catch (err) {
      _renderErro(container, err);
      console.error('[Router] Erro ao renderizar:', key, err);
      _rendering = false;
      return;
    }

    // Hook de inicialização — aguarda microtask para garantir DOM pronto
    Promise.resolve().then(() => {
      const initFn = window[`initPage_${key}`];
      if (typeof initFn === 'function') {
        try { initFn(); }
        catch (e) { console.error(`[Router] Erro em initPage_${key}:`, e); }
      }
      _rendering = false;
    });

    // Fecha sidebar em mobile
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }

    // Scroll ao topo do conteúdo
    container.scrollTop = 0;
  }

  // Tela de erro — 100% via DOM, sem innerHTML com dados externos
  function _renderErro(container, err) {
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    wrap.style.padding = '40px';

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.textContent = '⚠️';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Erro ao carregar módulo';

    const msg = document.createElement('p');
    msg.style.color = 'var(--text-muted,#64748b)';
    msg.style.fontSize = '13px';
    // err.message pode ter conteúdo arbitrário — textContent é obrigatório
    msg.textContent = err?.message || 'Erro desconhecido. Tente recarregar a página.';

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.marginTop = '16px';
    btn.textContent = '↺ Tentar novamente';
    btn.onclick = () => window.location.reload();

    wrap.append(icon, titulo, msg, btn);
    container.appendChild(wrap);
  }

  function _renderEmBreve(container, key) {
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    wrap.style.padding = '40px';

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.textContent = '🚧';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Em construção';

    const msg = document.createElement('p');
    msg.style.color = 'var(--text-muted,#64748b)';
    msg.textContent = 'Este módulo estará disponível em breve.';

    wrap.append(icon, titulo, msg);
    container.appendChild(wrap);
  }

  function _handleHashChange() {
    const raw = window.location.hash.replace('#', '').trim();
    // Só permite chaves seguras; cai para dashboard se inválido
    const key = raw && /^[a-z0-9-]+$/.test(raw) ? raw : 'dashboard';
    _render(key);
  }

  function init(pages, titles) {
    _pages  = pages  || {};
    _titles = titles || {};
    window.addEventListener('hashchange', _handleHashChange);
    _handleHashChange();
  }

  return { navigateTo, init };
})();
