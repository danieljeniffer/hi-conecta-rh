// =============================================
// TOAST.JS — Sistema de notificações
// Substitui alert() / confirm() nativos
// =============================================

const Toast = (() => {
  const DURACAO_PADRAO = 4000;

  function _injetar() {
    if (document.getElementById('toast-container')) return document.getElementById('toast-container');
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(el);
    return el;
  }

  function _criar(mensagem, tipo, duracao) {
    const container = _injetar();
    const cores = {
      success: { bg: 'var(--success,#16a34a)', icon: '✅' },
      error:   { bg: 'var(--danger,#dc2626)',  icon: '❌' },
      warning: { bg: 'var(--warning,#d97706)', icon: '⚠️' },
      info:    { bg: 'var(--primary,#1b56d6)', icon: 'ℹ️' },
    };
    const { bg, icon } = cores[tipo] || cores.info;

    const t = document.createElement('div');
    t.style.cssText = `
      background:${bg};color:#fff;padding:12px 18px;border-radius:10px;
      font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,.25);
      display:flex;align-items:center;gap:10px;min-width:260px;max-width:420px;
      pointer-events:auto;transform:translateX(0);transition:opacity .3s,transform .3s;
    `;
    t.innerHTML = `<span style="font-size:16px">${icon}</span><span style="flex:1">${mensagem}</span>`;
    container.appendChild(t);

    const fechar = () => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(110%)';
      setTimeout(() => t.remove(), 320);
    };
    t.addEventListener('click', fechar);
    setTimeout(fechar, duracao ?? DURACAO_PADRAO);
  }

  function confirmar(mensagem) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center';

      const caixa = document.createElement('div');
      caixa.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2)';
      caixa.innerHTML = `
        <p style="margin:0 0 22px;font-size:15px;color:#1e293b;font-weight:500;line-height:1.5">${mensagem}</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button id="_t_cancel" style="padding:10px 28px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px">Cancelar</button>
          <button id="_t_ok"     style="padding:10px 28px;border:none;border-radius:8px;background:var(--primary,#1b56d6);color:#fff;cursor:pointer;font-weight:600;font-size:14px">Confirmar</button>
        </div>
      `;

      overlay.appendChild(caixa);
      document.body.appendChild(overlay);

      const fechar = (resultado) => { overlay.remove(); resolve(resultado); };
      caixa.querySelector('#_t_ok').onclick     = () => fechar(true);
      caixa.querySelector('#_t_cancel').onclick = () => fechar(false);
      overlay.addEventListener('click', e => { if (e.target === overlay) fechar(false); });
    });
  }

  // Substitui o prompt() nativo
  function input(titulo, valorPadrao = '') {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center';

      const caixa = document.createElement('div');
      caixa.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.2)';
      caixa.innerHTML = `
        <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1e293b">${titulo}</p>
        <input id="_t_input" value="${valorPadrao.replace(/"/g,'&quot;')}"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;margin-bottom:18px"
          autocomplete="off" />
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button id="_t_cancel" style="padding:9px 22px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px">Cancelar</button>
          <button id="_t_ok"     style="padding:9px 22px;border:none;border-radius:8px;background:var(--primary,#1b56d6);color:#fff;cursor:pointer;font-weight:600;font-size:14px">OK</button>
        </div>
      `;

      overlay.appendChild(caixa);
      document.body.appendChild(overlay);

      const inp = caixa.querySelector('#_t_input');
      setTimeout(() => inp.focus(), 50);

      const fechar = (val) => { overlay.remove(); resolve(val); };
      caixa.querySelector('#_t_ok').onclick     = () => fechar(inp.value.trim() || null);
      caixa.querySelector('#_t_cancel').onclick = () => fechar(null);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') fechar(inp.value.trim() || null); if (e.key === 'Escape') fechar(null); });
    });
  }

  return {
    success: (msg, dur)  => _criar(msg, 'success', dur),
    error:   (msg, dur)  => _criar(msg, 'error',   dur),
    warning: (msg, dur)  => _criar(msg, 'warning',  dur),
    info:    (msg, dur)  => _criar(msg, 'info',    dur),
    confirmar,
    input,
  };
})();
