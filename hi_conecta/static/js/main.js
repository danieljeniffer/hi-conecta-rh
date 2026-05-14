/**
 * hi Conecta RH — main.js
 * Sidebar, dark mode, notificações, dropdowns, utils.
 */
'use strict';

// ── Dark Mode ─────────────────────────────────────────────────
const DARK_KEY = 'hi_dark_mode';

function initDarkMode() {
  const salvo = localStorage.getItem(DARK_KEY);
  const ativo = salvo === 'true' ||
    (!salvo && window.matchMedia('(prefers-color-scheme: dark)').matches);
  aplicarDarkMode(ativo, false);
}

function aplicarDarkMode(ativo, salvar = true) {
  document.getElementById('html-root')?.setAttribute('data-bs-theme', ativo ? 'dark' : 'light');
  const icone = document.getElementById('dark-icon');
  if (icone) icone.textContent = ativo ? '☀️' : '🌙';
  if (salvar) localStorage.setItem(DARK_KEY, ativo);
}

function toggleDarkMode() {
  const atual = document.getElementById('html-root')?.getAttribute('data-bs-theme') === 'dark';
  aplicarDarkMode(!atual);
}

// ── Sidebar ───────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const aberto   = sidebar?.classList.toggle('open');
  toggleBtn?.setAttribute('aria-expanded', aberto ? 'true' : 'false');
}

// Fecha sidebar ao clicar fora (mobile)
document.addEventListener('click', function (e) {
  const sidebar  = document.getElementById('sidebar');
  const toggle   = document.getElementById('sidebar-toggle');
  if (sidebar?.classList.contains('open') &&
      !sidebar.contains(e.target) && !toggle?.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ── Dropdown usuário ──────────────────────────────────────────
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (!dd) return;
  const aberto = dd.style.display === 'block';
  dd.style.display = aberto ? 'none' : 'block';
  dd.setAttribute('aria-hidden', aberto ? 'true' : 'false');
}

document.addEventListener('click', function (e) {
  const dd  = document.getElementById('user-dropdown');
  const av  = document.querySelector('.topbar-avatar');
  if (dd && av && !av.contains(e.target) && !dd.contains(e.target)) {
    dd.style.display = 'none';
  }
});

// ── Notificações ──────────────────────────────────────────────
let _notifAberto = false;

function toggleNotificacoes(e) {
  if (e) e.stopPropagation();
  _notifAberto = !_notifAberto;
  const painel = document.getElementById('notif-panel');
  if (!painel) return;
  painel.style.display = _notifAberto ? 'block' : 'none';
  painel.setAttribute('aria-hidden', _notifAberto ? 'false' : 'true');
  if (_notifAberto) carregarNotificacoes();
}

function fecharNotificacoes() {
  _notifAberto = false;
  const painel = document.getElementById('notif-panel');
  if (painel) { painel.style.display = 'none'; painel.setAttribute('aria-hidden', 'true'); }
}

document.addEventListener('click', function (e) {
  const painel = document.getElementById('notif-panel');
  const btn    = document.getElementById('btn-notif');
  if (_notifAberto && painel && btn &&
      !btn.contains(e.target) && !painel.contains(e.target)) {
    fecharNotificacoes();
  }
});

async function carregarNotificacoes() {
  const lista = document.getElementById('notif-lista');
  if (!lista) return;
  // Implementar chamada à API quando backend de notificações estiver pronto
  lista.innerHTML = '<div class="notif-empty">Nenhuma notificação nova.</div>';
}

// ── Loading global ────────────────────────────────────────────
let _loadCount = 0;
const globalLoading = document.getElementById('global-loading');

function setLoading(ativo) {
  _loadCount = Math.max(0, _loadCount + (ativo ? 1 : -1));
  if (globalLoading) {
    globalLoading.style.display = _loadCount > 0 ? 'block' : 'none';
  }
}

// ── Toast ─────────────────────────────────────────────────────
const Toast = {
  _container() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:400px';
      document.body.appendChild(c);
    }
    return c;
  },

  _show(msg, tipo = 'info', dur = 4500) {
    const cores = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#2563eb' };
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const t   = document.createElement('div');
    t.role    = 'alert';
    t.style.cssText = `
      background:${cores[tipo] || '#334155'};color:#fff;
      padding:12px 18px;border-radius:10px;font-size:14px;font-weight:500;
      box-shadow:0 4px 20px rgba(0,0,0,.25);
      display:flex;align-items:center;gap:10px;
      min-width:260px;pointer-events:auto;
      animation:toast-in .25s ease;
    `;

    const ic  = document.createElement('span');
    ic.textContent = icons[tipo] || '•';

    const tx  = document.createElement('span');
    tx.style.flex = '1';
    tx.textContent = msg;  // textContent — zero XSS

    t.append(ic, tx);
    this._container().appendChild(t);

    const fechar = () => {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(110%)';
      t.style.transition = 'opacity .3s, transform .3s';
      setTimeout(() => t.remove(), 320);
    };

    t.addEventListener('click', fechar);
    setTimeout(fechar, dur);
  },

  success: (m, d) => Toast._show(m, 'success', d),
  error:   (m, d) => Toast._show(m, 'error',   d),
  warning: (m, d) => Toast._show(m, 'warning', d),
  info:    (m, d) => Toast._show(m, 'info',    d),
  aviso:   (m, d) => Toast._show(m, 'warning', d),
};

// Injeta CSS de animação do Toast
(function () {
  if (document.getElementById('toast-style')) return;
  const s = document.createElement('style');
  s.id = 'toast-style';
  s.textContent = '@keyframes toast-in{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}';
  document.head.appendChild(s);
})();

// ── Modal de confirmação ──────────────────────────────────────
function confirmar(msg) {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px';
    ov.setAttribute('role', 'dialog');

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:400px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.2);text-align:center';

    const p = document.createElement('p');
    p.style.cssText = 'margin:0 0 22px;font-size:15px;font-weight:500;line-height:1.5;color:#1e293b';
    p.textContent = msg;

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:12px;justify-content:center';

    const cancel = _criarBtn('Cancelar', 'padding:10px 28px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px;font-family:inherit');
    const ok     = _criarBtn('Confirmar', 'padding:10px 28px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit');

    btns.append(cancel, ok);
    box.append(p, btns);
    ov.appendChild(box);
    document.body.appendChild(ov);

    const fechar = v => { ov.remove(); resolve(v); };
    ok.onclick     = () => fechar(true);
    cancel.onclick = () => fechar(false);
    ov.addEventListener('click', e => { if (e.target === ov) fechar(false); });

    const keyHandler = e => {
      if (e.key === 'Enter') fechar(true);
      if (e.key === 'Escape') fechar(false);
      document.removeEventListener('keydown', keyHandler);
    };
    document.addEventListener('keydown', keyHandler);
    ok.focus();
  });
}

function _criarBtn(texto, css) {
  const b = document.createElement('button');
  b.style.cssText = css;
  b.textContent   = texto;
  return b;
}

// ── Auto-dismiss mensagens ────────────────────────────────────
document.querySelectorAll('[data-auto-dismiss]').forEach(el => {
  const delay = parseInt(el.getAttribute('data-auto-dismiss') || '5000');
  setTimeout(() => {
    el.style.transition = 'opacity .4s';
    el.style.opacity    = '0';
    setTimeout(() => el.remove(), 400);
  }, delay);
});

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.getElementById('user-dropdown')?.style.setProperty('display', 'none');
    fecharNotificacoes();
  }
});

// ── Inicialização ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  console.info('[hi Conecta RH] Sistema iniciado. Perfil: ' + (window.USER_PERFIL || 'anon'));
});

// Exporta globais
window.Toast          = Toast;
window.toggleDarkMode = toggleDarkMode;
window.toggleSidebar  = toggleSidebar;
window.toggleUserMenu = toggleUserMenu;
window.toggleNotificacoes  = toggleNotificacoes;
window.fecharNotificacoes  = fecharNotificacoes;
window.confirmar           = confirmar;
window.setLoading          = setLoading;
