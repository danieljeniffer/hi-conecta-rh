// =============================================
// DOM.JS — Helpers para manipulação do DOM
// Consolida padrões repetidos no projeto
// =============================================

const DOM = {
  // Sanitiza texto para uso em innerHTML (previne XSS)
  sanitize(str) {
    if (str == null) return '';
    const el = document.createElement('div');
    el.textContent = String(str);
    return el.innerHTML;
  },

  // Substitui innerHTML seguro
  render(idOuSeletor, html) {
    const el = typeof idOuSeletor === 'string'
      ? (document.getElementById(idOuSeletor) || document.querySelector(idOuSeletor))
      : idOuSeletor;
    if (el) el.innerHTML = html;
    return el;
  },

  // Download de arquivo — consolida os 3 padrões duplicados do projeto
  download(conteudo, nomeArquivo, tipo) {
    const blob = conteudo instanceof Blob
      ? conteudo
      : new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: nomeArquivo });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Copia texto para a área de transferência
  async copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      Toast.success('Copiado para a área de transferência!');
      return true;
    } catch {
      // Fallback para navegadores mais antigos
      const el = document.createElement('textarea');
      el.value = texto;
      el.style.position = 'fixed';
      el.style.opacity  = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      Toast.success('Copiado!');
      return true;
    }
  },

  // Modal — consolida o padrão document.getElementById + style.display
  modal: {
    abrir(id) {
      const m = document.getElementById(id);
      if (m) { m.style.display = 'flex'; m.focus?.(); }
      else console.warn(`[DOM.modal] Modal "${id}" não encontrado`);
    },
    fechar(id) {
      const m = document.getElementById(id);
      if (m) m.style.display = 'none';
    },
    fecharTodos() {
      document.querySelectorAll('[id^="modal-"]').forEach(m => m.style.display = 'none');
    },
    toggle(id) {
      const m = document.getElementById(id);
      if (m) m.style.display = m.style.display === 'none' ? 'flex' : 'none';
    },
  },

  // Ativa aba — consolida o querySelectorAll + classList.toggle pattern
  ativarAba(containerSeletor, abaSeletor, abaAtiva) {
    document.querySelectorAll(`${containerSeletor} ${abaSeletor}`).forEach(el => {
      el.classList.toggle('active', el.dataset.aba === abaAtiva);
    });
  },

  // Debounce para campos de busca
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },

  // Iniciais para avatar
  iniciais: (nome) => Fmt.iniciais(nome),
};
