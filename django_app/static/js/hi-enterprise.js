/**
 * hi-enterprise.js — JavaScript Enterprise Django
 * Sidebar, notificações, AJAX seguro e utilitários.
 */
'use strict';

// ── CSRF para AJAX ────────────────────────────
function getCookie(name) {
  const val = `; ${document.cookie}`;
  const parts = val.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

const CSRF = getCookie('csrftoken') || window.CSRF_TOKEN || '';

async function postJSON(url, data = {}) {
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken':  CSRF,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function postForm(url, formData) {
  formData.append('csrfmiddlewaretoken', CSRF);
  const res = await fetch(url, { method: 'POST', body: formData });
  return res.json();
}

// ── Sidebar ───────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// Fecha sidebar ao clicar fora (mobile)
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.querySelector('.sidebar-toggle');
  if (sidebar && sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && !toggle?.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ── Dropdown usuário ──────────────────────────
function menuUsuario() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('user-dropdown');
  const av = document.querySelector('.topbar-avatar');
  if (dd && av && !av.contains(e.target) && !dd.contains(e.target)) {
    dd.style.display = 'none';
  }
});

// ── Notificações ──────────────────────────────
let _notifAberto = false;

function toggleNotificacoes(e) {
  if (e) e.stopPropagation();
  const painel = document.getElementById('notif-panel');
  _notifAberto = !_notifAberto;
  if (painel) {
    painel.style.display = _notifAberto ? 'flex' : 'none';
    painel.style.flexDirection = 'column';
    if (_notifAberto) carregarNotificacoes();
  }
}

document.addEventListener('click', (e) => {
  const painel = document.getElementById('notif-panel');
  const btn    = document.getElementById('btn-notif');
  if (painel && btn && !btn.contains(e.target) && !painel.contains(e.target)) {
    painel.style.display = 'none';
    _notifAberto = false;
  }
});

async function carregarNotificacoes() {
  // Placeholder — implementar endpoint real
  const lista = document.getElementById('notif-lista');
  if (!lista) return;
  lista.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8">Nenhuma notificação nova.</div>';
}

// ── Loading global ────────────────────────────
let _loadingCount = 0;
function setLoading(active) {
  _loadingCount = Math.max(0, _loadingCount + (active ? 1 : -1));
  const el = document.getElementById('global-loading');
  if (el) el.style.display = _loadingCount > 0 ? 'block' : 'none';
}

// Adiciona loading em todos os fetch
const _origFetch = window.fetch;
window.fetch = function(...args) {
  setLoading(true);
  return _origFetch(...args).finally(() => setLoading(false));
};

// ── Toast ─────────────────────────────────────
const Toast = {
  _container() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
      document.body.appendChild(c);
    }
    return c;
  },

  _show(msg, tipo, dur = 4000) {
    const cores = { success:'#16a34a', error:'#dc2626', warning:'#d97706', info:'#2563eb' };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };

    const t = document.createElement('div');
    t.style.cssText = `background:${cores[tipo]||'#334155'};color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;gap:10px;min-width:260px;max-width:400px;pointer-events:auto;transition:opacity .3s,transform .3s`;

    const icon = document.createElement('span');
    icon.textContent = icons[tipo] || '•';

    const txt = document.createElement('span');
    txt.textContent = msg;
    txt.style.flex = '1';

    t.append(icon, txt);
    this._container().appendChild(t);

    const fechar = () => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(110%)';
      setTimeout(() => t.remove(), 320);
    };

    t.addEventListener('click', fechar);
    setTimeout(fechar, dur);
    return t;
  },

  success: (m, d) => Toast._show(m, 'success', d),
  error:   (m, d) => Toast._show(m, 'error',   d),
  warning: (m, d) => Toast._show(m, 'warning',  d),
  aviso:   (m, d) => Toast._show(m, 'warning',  d),
  info:    (m, d) => Toast._show(m, 'info',     d),
};

window.Toast = Toast;

// ── Confirmar modal ───────────────────────────
function confirmar(msg) {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2)';

    const p = document.createElement('p');
    p.style.cssText = 'margin:0 0 22px;font-size:15px;color:#1e293b;font-weight:500;line-height:1.5';
    p.textContent = msg;

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:12px;justify-content:center';

    const cancel = document.createElement('button');
    cancel.textContent = 'Cancelar';
    cancel.style.cssText = 'padding:10px 28px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px;font-family:inherit';

    const ok = document.createElement('button');
    ok.textContent = 'Confirmar';
    ok.style.cssText = 'padding:10px 28px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit';

    btns.append(cancel, ok);
    box.append(p, btns);
    ov.appendChild(box);
    document.body.appendChild(ov);

    const fechar = (v) => { ov.remove(); resolve(v); };
    ok.onclick     = () => fechar(true);
    cancel.onclick = () => fechar(false);
    ov.addEventListener('click', e => { if (e.target === ov) fechar(false); });
  });
}

// ── Auto-dismiss mensagens Django ─────────────
document.addEventListener('DOMContentLoaded', () => {
  const msgs = document.getElementById('django-messages');
  if (msgs) {
    setTimeout(() => {
      msgs.style.transition = 'opacity .4s';
      msgs.style.opacity = '0';
      setTimeout(() => msgs.remove(), 400);
    }, 5000);
  }
});

// ── Atalhos de teclado ────────────────────────
document.addEventListener('keydown', (e) => {
  // Escape fecha dropdowns
  if (e.key === 'Escape') {
    document.getElementById('user-dropdown')?.style.setProperty('display','none');
    document.getElementById('notif-panel')?.style.setProperty('display','none');
  }
});

// ── Format helpers ────────────────────────────
const Fmt = {
  moeda: (v) => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}),
  data:  (v) => v ? new Date(v+'T12:00').toLocaleDateString('pt-BR') : '—',
  iniciais: (nome) => (nome||'?').split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(),
};

window.Fmt = Fmt;

console.info('hi Conecta RH — Enterprise JS carregado.');
