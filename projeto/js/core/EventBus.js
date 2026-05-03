// =============================================
// EVENTBUS.JS — Comunicação entre módulos
// Corrigido: bug de 'this' em once(),
// limite de listeners por evento, wildcard.
// =============================================

const EventBus = (() => {
  const _listeners = {};
  const MAX_LISTENERS_POR_EVENTO = 50;

  function on(evento, callback) {
    if (typeof callback !== 'function') {
      console.warn(`[EventBus] on("${evento}"): callback deve ser uma função.`);
      return () => {};
    }
    if (!_listeners[evento]) _listeners[evento] = [];
    if (_listeners[evento].length >= MAX_LISTENERS_POR_EVENTO) {
      console.warn(`[EventBus] Limite de ${MAX_LISTENERS_POR_EVENTO} listeners atingido para "${evento}". Possível memory leak.`);
      return () => {};
    }
    _listeners[evento].push(callback);
    // Retorna função de cancelamento (unsubscribe)
    return () => off(evento, callback);
  }

  function off(evento, callback) {
    if (!_listeners[evento]) return;
    _listeners[evento] = _listeners[evento].filter(fn => fn !== callback);
    if (_listeners[evento].length === 0) delete _listeners[evento];
  }

  function emit(evento, dados) {
    // Listeners específicos do evento
    const lista = [...(_listeners[evento] || [])];
    // Listeners wildcard '*'
    const wildcards = [...(_listeners['*'] || [])];

    [...lista, ...wildcards].forEach(fn => {
      try {
        fn(dados, evento);
      } catch (e) {
        console.error(`[EventBus] Erro no listener de "${evento}":`, e);
      }
    });
  }

  function once(evento, callback) {
    if (typeof callback !== 'function') {
      console.warn(`[EventBus] once("${evento}"): callback deve ser uma função.`);
      return () => {};
    }

    // CORREÇÃO: função nomeada para que off() possa remover corretamente
    // (arrow function anônima + this não funcionava antes)
    function wrapper(dados, ev) {
      off(evento, wrapper);
      callback(dados, ev);
    }

    return on(evento, wrapper);
  }

  // Remove TODOS os listeners de um evento (útil ao desmontar módulos)
  function clear(evento) {
    if (evento) {
      delete _listeners[evento];
    } else {
      Object.keys(_listeners).forEach(k => delete _listeners[k]);
    }
  }

  // Debug: lista eventos ativos e contagem de listeners
  function debug() {
    return Object.fromEntries(
      Object.entries(_listeners).map(([ev, fns]) => [ev, fns.length])
    );
  }

  return { on, off, emit, once, clear, debug };
})();

/**
 * Eventos padronizados do sistema:
 *
 * colaborador:admitido        → { colaborador, empresa_id }
 * colaborador:desligado       → { colaborador, motivo }
 * colaborador:risco_saida     → { colaborador_id, score }
 * folha:fechada               → { competencia, colaboradores[] }
 * ferias:solicitada           → { colaboradorId, inicio, dias }
 * ferias:vencendo_30d         → { colaboradorId, dias_restantes }
 * dp:admissao_iniciada        → { candidatoId, vagaId }
 * tarefa:bitrix_criada        → { tarefaId, titulo }
 * notificacao:nova            → { usuarioId, tipo, mensagem }
 */
