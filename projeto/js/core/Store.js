// =============================================
// STORE.JS — Estado centralizado da aplicação
// Substitui variáveis globais soltas por módulo
// =============================================

const Store = (() => {
  const _state = {
    recrutamento: {
      aba: 'vagas',
      vagaSelecionada: null,
      filtros: {},
      trilhaSel: 0,
    },
    dp: {
      aba: 'admissao',
      admissaoEmEdicao: null,
    },
    pessoas: {
      aba: 'lista',
      filtro: '',
      colaboradorSelecionado: null,
    },
    jornada: {
      aba: 'inicio',
    },
    ui: {
      sidebarAberta: true,
      notificacoes: [],
    },
  };

  const _subs = {};

  function get(caminho) {
    return caminho.split('.').reduce((obj, k) => obj?.[k], _state);
  }

  function set(caminho, valor) {
    const chaves = caminho.split('.');
    const ultima = chaves.pop();
    const alvo   = chaves.reduce((obj, k) => obj[k], _state);
    if (!alvo) { console.warn(`[Store] Caminho inválido: ${caminho}`); return; }
    const anterior = alvo[ultima];
    alvo[ultima] = valor;
    (_subs[caminho] || []).forEach(fn => {
      try { fn(valor, anterior); }
      catch (e) { console.error(`[Store] Erro no subscriber de "${caminho}":`, e); }
    });
  }

  function subscribe(caminho, callback) {
    if (!_subs[caminho]) _subs[caminho] = [];
    _subs[caminho].push(callback);
    return () => { _subs[caminho] = _subs[caminho].filter(f => f !== callback); };
  }

  function getState() {
    return JSON.parse(JSON.stringify(_state));
  }

  return { get, set, subscribe, getState };
})();
