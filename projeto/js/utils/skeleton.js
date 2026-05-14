/**
 * skeleton.js — Skeleton Loaders e Loading States
 * Melhora percepção de performance — substitui spinners.
 */

const Skeleton = (() => {
  'use strict';

  // ── Componentes skeleton ─────────────────
  const linha = (w = '100%', h = '14px', r = '6px') =>
    `<div class="sk-linha" style="width:${w};height:${h};border-radius:${r}"></div>`;

  const card = (linhas = 3) => `
<div class="sk-card">
  ${linha('60%','18px','8px')}
  ${Array(linhas).fill(null).map(() => linha()).join('')}
  ${linha('40%','12px')}
</div>`;

  const tabela = (cols = 4, rows = 5) => `
<div class="sk-card">
  <div class="sk-table-header">
    ${Array(cols).fill(null).map(() => linha(`${Math.floor(80/cols)+10}%`,'12px')).join('')}
  </div>
  ${Array(rows).fill(null).map(() => `
  <div class="sk-table-row">
    ${Array(cols).fill(null).map(() => linha(`${Math.floor(80/cols)+10}%`,'12px')).join('')}
  </div>`).join('')}
</div>`;

  const kpis = (n = 4) => `
<div class="sk-kpis">
  ${Array(n).fill(null).map(() => `
  <div class="sk-kpi-card">
    ${linha('40px','40px','10px')}
    ${linha('60%','24px')}
    ${linha('80%','12px')}
  </div>`).join('')}
</div>`;

  const avatar = (size = '40px') =>
    `<div class="sk-avatar" style="width:${size};height:${size};border-radius:50%"></div>`;

  const colaboradorCard = () => `
<div class="sk-card" style="display:flex;gap:12px;align-items:center;padding:12px">
  ${avatar('44px')}
  <div style="flex:1">
    ${linha('60%','14px')}
    ${linha('40%','11px')}
  </div>
  ${linha('80px','28px','20px')}
</div>`;

  const dashboard = () => `
<div style="display:flex;flex-direction:column;gap:16px">
  ${kpis(5)}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    ${card(4)}
    ${card(4)}
  </div>
  ${tabela(5, 6)}
</div>`;

  // ── Injetar skeleton em container ────────
  const mostrar = (containerId, tipo = 'card', opcoes = {}) => {
    const el = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!el) return null;

    const templates = {
      card:        () => card(opcoes.linhas),
      tabela:      () => tabela(opcoes.cols, opcoes.rows),
      kpis:        () => kpis(opcoes.n),
      dashboard:   () => dashboard(),
      colaborador: () => Array(opcoes.n || 3).fill(null).map(() => colaboradorCard()).join(''),
    };

    el.innerHTML = `<div class="sk-wrapper">${(templates[tipo] || templates.card)()}</div>`;
    return el;
  };

  // Remove skeleton e exibe conteúdo
  const remover = (containerId, html) => {
    const el = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!el) return;

    if (html !== undefined) {
      el.classList.add('sk-fade-in');
      el.innerHTML = html;
      setTimeout(() => el.classList.remove('sk-fade-in'), 400);
    } else {
      const wrapper = el.querySelector('.sk-wrapper');
      if (wrapper) {
        wrapper.classList.add('sk-fade-out');
        setTimeout(() => wrapper.remove(), 300);
      }
    }
  };

  // Wrapper para fetch com skeleton automático
  const comLoading = async (containerId, fetchFn, renderFn, tipo = 'card', opcoes = {}) => {
    mostrar(containerId, tipo, opcoes);
    try {
      const dados = await fetchFn();
      remover(containerId, renderFn(dados));
      return dados;
    } catch (err) {
      remover(containerId, `
<div style="text-align:center;padding:32px;color:#94a3b8">
  <div style="font-size:32px">⚠️</div>
  <p style="font-size:13px;margin-top:8px">${err.message || 'Erro ao carregar dados.'}</p>
  <button onclick="location.reload()" style="margin-top:8px;padding:6px 14px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-family:inherit;font-size:12px">
    ↺ Tentar novamente
  </button>
</div>`);
      throw err;
    }
  };

  // ── CSS embutido ─────────────────────────
  const _injectCSS = () => {
    if (document.getElementById('skeleton-styles')) return;
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
/* ── Skeleton Base ──────────────────── */
.sk-wrapper { animation: sk-pulse 1.5s ease-in-out infinite; }

@keyframes sk-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .5; }
}

.sk-linha, .sk-avatar, .sk-kpi-card > div:first-child {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.5s ease-in-out infinite;
  display: block;
  margin-bottom: 6px;
}

@keyframes sk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.sk-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 12px;
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
  gap: 12px; margin-bottom: 16px;
}

.sk-kpi-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
}

.sk-table-header {
  display: flex; gap: 12px; padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9; margin-bottom: 6px;
}

.sk-table-row {
  display: flex; gap: 12px; padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.sk-avatar { flex-shrink: 0; }

/* ── Transições ──────────────────────── */
.sk-fade-in {
  animation: sk-fadeIn .3s ease;
}

.sk-fade-out {
  animation: sk-fadeOut .25s ease forwards;
}

@keyframes sk-fadeIn  { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sk-fadeOut { from { opacity: 1; } to { opacity: 0; } }

/* ── Loading global ──────────────────── */
#global-loading {
  position: fixed; top: 0; left: 0; right: 0;
  height: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed, #2563eb);
  background-size: 200% 100%;
  animation: sk-loading-bar 1.2s linear infinite;
  z-index: 99999; display: none;
}

@keyframes sk-loading-bar {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`;
    document.head.appendChild(style);
  };

  _injectCSS();

  return { linha, card, tabela, kpis, avatar, colaboradorCard, dashboard, mostrar, remover, comLoading };
})();

window.Skeleton = Skeleton;

// Injeta barra de loading global no topo
if (!document.getElementById('global-loading')) {
  const bar = document.createElement('div');
  bar.id = 'global-loading';
  document.body.prepend(bar);
}
