// =============================================
// HI CONECTA RH — ROUTER
// Hash-based routing: URL muda ao navegar,
// botão Voltar funciona, links diretos funcionam.
// Uso: Router.init(pages, pageTitles) no DOMContentLoaded
// =============================================
const Router = (() => {
  let _pages  = {};
  let _titles = {};

  function navigateTo(pageKey) {
    window.location.hash = pageKey;
  }

  function _render(pageKey) {
    const renderFn = _pages[pageKey];
    const titleStr = _titles[pageKey] || pageKey;

    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === pageKey)
    );

    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titleStr;
    document.title = `hi Conecta RH — ${titleStr}`;

    const container = document.getElementById('pageContainer');
    if (!container) return;

    if (renderFn) {
      try {
        container.innerHTML = renderFn();
      } catch (e) {
        container.innerHTML = `<div class="empty-state"><div style="font-size:48px">⚠️</div><h2>Erro ao carregar módulo</h2><p>${e.message}</p></div>`;
        console.error('[Router] Erro ao renderizar:', pageKey, e);
        return;
      }
      setTimeout(() => {
        const initFn = window['initPage_' + pageKey];
        if (typeof initFn === 'function') initFn();
      }, 50);
    } else {
      container.innerHTML = `<div class="empty-state"><div style="font-size:48px">🚧</div><h2>Em construção</h2><p>Este módulo estará disponível em breve.</p></div>`;
    }

    if (window.innerWidth < 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
  }

  function _handleHashChange() {
    const key = window.location.hash.replace('#', '') || 'dashboard';
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
