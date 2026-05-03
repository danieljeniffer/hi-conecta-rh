// =============================================
// TOAST.JS — Sistema de notificações seguro
// Sem XSS: usa createElement em vez de innerHTML
// =============================================

const Toast = (() => {
  const DURACAO_PADRAO = 4000;

  // Sanitiza texto simples (nunca aceita HTML como mensagem)
  function _txt(str) {
    const el = document.createElement('span');
    el.textContent = String(str ?? '');
    return el;
  }

  function _injetar() {
    let c = document.getElementById('toast-container');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'toast-container';
    c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:440px';
    document.body.appendChild(c);
    return c;
  }

  function _criar(mensagem, tipo, duracao) {
    if (!mensagem) return;
    const container = _injetar();

    const cores = {
      success: { bg: 'var(--success,#16a34a)', icon: '✅' },
      error:   { bg: 'var(--danger,#dc2626)',  icon: '❌' },
      warning: { bg: 'var(--warning,#d97706)', icon: '⚠️' },
      info:    { bg: 'var(--primary,#1b56d6)', icon: 'ℹ️' },
    };
    const { bg, icon } = cores[tipo] || cores.info;

    // Constrói via DOM — zero innerHTML, zero XSS
    const t = document.createElement('div');
    t.setAttribute('role', 'alert');
    t.setAttribute('aria-live', 'assertive');
    t.style.cssText = [
      `background:${bg}`,
      'color:#fff',
      'padding:12px 18px',
      'border-radius:10px',
      'font-size:14px',
      'font-weight:500',
      'box-shadow:0 4px 20px rgba(0,0,0,.25)',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'min-width:260px',
      'max-width:420px',
      'pointer-events:auto',
      'transition:opacity .3s,transform .3s',
      'cursor:pointer',
    ].join(';');

    const iconeEl = document.createElement('span');
    iconeEl.style.fontSize = '16px';
    iconeEl.textContent = icon;

    const textoEl = document.createElement('span');
    textoEl.style.flex = '1';
    textoEl.textContent = String(mensagem); // textContent — nunca interpreta HTML

    t.append(iconeEl, textoEl);
    container.appendChild(t);

    const fechar = () => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(110%)';
      setTimeout(() => t.remove(), 320);
    };

    t.addEventListener('click', fechar);
    const timer = setTimeout(fechar, duracao ?? DURACAO_PADRAO);

    // Pausa o timer ao hover (UX: usuário pode ler)
    t.addEventListener('mouseenter', () => clearTimeout(timer));
    t.addEventListener('mouseleave', () => setTimeout(fechar, 1500));

    return t;
  }

  // ── Diálogo de confirmação seguro ────────────────────────
  function confirmar(mensagem) {
    return new Promise(resolve => {
      const overlay = _criarOverlay();

      const caixa = document.createElement('div');
      caixa.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.2)';

      const p = document.createElement('p');
      p.style.cssText = 'margin:0 0 22px;font-size:15px;color:#1e293b;font-weight:500;line-height:1.5';
      p.textContent = String(mensagem); // seguro — textContent

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center';

      const btnCancelar = _criarBtn('Cancelar', 'padding:10px 28px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px;font-family:inherit');
      const btnOk       = _criarBtn('Confirmar', 'padding:10px 28px;border:none;border-radius:8px;background:var(--primary,#1b56d6);color:#fff;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit');

      btnRow.append(btnCancelar, btnOk);
      caixa.append(p, btnRow);
      overlay.appendChild(caixa);
      document.body.appendChild(overlay);

      const fechar = (resultado) => { overlay.remove(); resolve(resultado); };
      btnOk.onclick       = () => fechar(true);
      btnCancelar.onclick = () => fechar(false);
      overlay.addEventListener('click', e => { if (e.target === overlay) fechar(false); });

      // Acessibilidade: ESC fecha
      const onKey = e => { if (e.key === 'Escape') { fechar(false); document.removeEventListener('keydown', onKey); } };
      document.addEventListener('keydown', onKey);
      btnOk.focus();
    });
  }

  // ── Input seguro ─────────────────────────────────────────
  function input(titulo, valorPadrao = '') {
    return new Promise(resolve => {
      const overlay = _criarOverlay();

      const caixa = document.createElement('div');
      caixa.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.2)';

      const label = document.createElement('p');
      label.style.cssText = 'margin:0 0 14px;font-size:14px;font-weight:600;color:#1e293b';
      label.textContent = String(titulo); // seguro

      const inp = document.createElement('input');
      inp.type = 'text';
      inp.autocomplete = 'off';
      inp.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;margin-bottom:18px;font-family:inherit';
      inp.value = String(valorPadrao); // atribui via .value, nunca via innerHTML

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:12px;justify-content:flex-end';

      const btnCancelar = _criarBtn('Cancelar', 'padding:9px 22px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500;font-size:14px;font-family:inherit');
      const btnOk       = _criarBtn('OK', 'padding:9px 22px;border:none;border-radius:8px;background:var(--primary,#1b56d6);color:#fff;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit');

      btnRow.append(btnCancelar, btnOk);
      caixa.append(label, inp, btnRow);
      overlay.appendChild(caixa);
      document.body.appendChild(overlay);

      const fechar = (val) => { overlay.remove(); resolve(val); };
      btnOk.onclick       = () => fechar(inp.value.trim() || null);
      btnCancelar.onclick = () => fechar(null);
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter')  fechar(inp.value.trim() || null);
        if (e.key === 'Escape') fechar(null);
      });

      setTimeout(() => inp.focus(), 50);
    });
  }

  // ── Helpers internos ─────────────────────────────────────
  function _criarOverlay() {
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:flex;align-items:center;justify-content:center';
    return o;
  }

  function _criarBtn(texto, css) {
    const b = document.createElement('button');
    b.style.cssText = css;
    b.textContent = texto;
    return b;
  }

  return {
    success:  (msg, dur) => _criar(msg, 'success', dur),
    error:    (msg, dur) => _criar(msg, 'error',   dur),
    warning:  (msg, dur) => _criar(msg, 'warning', dur),
    info:     (msg, dur) => _criar(msg, 'info',    dur),
    aviso:    (msg, dur) => _criar(msg, 'warning', dur), // alias PT-BR
    confirmar,
    input,
  };
})();
