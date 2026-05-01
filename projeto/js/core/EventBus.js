// =============================================
// EVENTBUS.JS — Comunicação entre módulos
// Desacopla módulos sem import direto
// =============================================

const EventBus = (() => {
  const _listeners = {};

  return {
    on(evento, callback) {
      if (!_listeners[evento]) _listeners[evento] = [];
      _listeners[evento].push(callback);
    },

    off(evento, callback) {
      if (!_listeners[evento]) return;
      _listeners[evento] = _listeners[evento].filter(fn => fn !== callback);
    },

    emit(evento, dados) {
      (_listeners[evento] || []).forEach(fn => {
        try { fn(dados); }
        catch (e) { console.error(`[EventBus] Erro em "${evento}":`, e); }
      });
    },

    once(evento, callback) {
      const wrapper = (dados) => { callback(dados); this.off(evento, wrapper); };
      this.on(evento, wrapper);
    },
  };
})();

// Eventos padronizados do sistema:
// candidato:aprovado        → { vaga, candidato }
// candidato:reprovado       → { vaga, candidato }
// colaborador:cadastrado    → { colaborador }
// colaborador:desligado     → { colaborador, motivo }
// tarefa:bitrix_criada      → { tarefaId, titulo }
// ferias:solicitada         → { colaboradorId, periodo }
// dp:admissao_iniciada      → { candidatoId, vagaId }
