/**
 * gestor-historico.js — Histórico & Linha do Tempo do Colaborador
 * Exibe todos os eventos de um colaborador em ordem cronológica
 * Expõe: window.GestorHistorico
 */
window.GestorHistorico = (() => {
  let _colabSel = null;
  let _filtroTipo = 'todos';

  // ─── RENDER PRINCIPAL ──────────────────────────────────────
  function render(container) {
    const colabs = GestorColabs.getBySector();
    if (!_colabSel && colabs.length > 0) _colabSel = colabs[0].id;

    container.innerHTML = `
<div>
  <!-- Seletor de colaborador + filtro -->
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
    <div class="g-colab-selector">
      <label style="font-size:12px;font-weight:700;white-space:nowrap;color:var(--text-muted)">Colaborador:</label>
      <select id="g-hist-colab" onchange="gestorHistSelColab(this.value)" style="min-width:220px">
        ${colabs.map(c => `<option value="${c.id}" ${c.id===_colabSel?'selected':''}>${c.nome_completo||c.nome} — ${c.setor||''}</option>`).join('')}
      </select>
    </div>
    <div class="g-filter-bar" style="margin:0">
      ${['todos','admissao','avaliacao','ocorrencia','advertencia','documento','reuniao'].map(t => `
        <button class="g-filter-btn ${_filtroTipo===t?'ativo':''}" onclick="gestorHistFiltro('${t}')">
          ${_tipoIcon(t)} ${_tipoLabel(t)}
        </button>`).join('')}
    </div>
  </div>

  <!-- Ficha resumo do colaborador -->
  ${_fichaColab(colabs.find(c => c.id === _colabSel))}

  <!-- Timeline -->
  <div id="g-hist-tl">
    ${_renderTimeline()}
  </div>
</div>`;
  }

  function _fichaColab(colab) {
    if (!colab) return '';
    const nome = colab.nome_completo || colab.nome || '—';
    const db   = GestorDB.get();
    const avas = db.avaliacoes.filter(a => a.colaborador_id === colab.id);
    const ocs  = db.ocorrencias.filter(o => o.colaborador_id === colab.id);
    const advs = db.advertencias.filter(a => a.colaborador_id === colab.id);
    const heus = db.reunioes.filter(r => r.participantes?.includes(colab.id));
    const medias = avas.filter(a => a.media != null).map(a => a.media);
    const mediaGeral = medias.length ? (medias.reduce((s,m) => s+m, 0)/medias.length).toFixed(1) : null;

    return `
<div class="g-card" style="margin-bottom:20px">
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <div class="g-avatar" style="width:52px;height:52px;font-size:18px;flex-shrink:0">${GestorFmt.ini(nome)}</div>
    <div style="flex:1">
      <h3 style="margin:0 0 2px;font-size:18px">${nome}</h3>
      <span style="font-size:12px;color:var(--text-muted)">${colab.cargo||'—'} · ${colab.setor||'—'}</span>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:900;color:#3b82f6">${avas.length}</div>
        <small style="color:var(--text-muted);font-size:10px">Avaliações</small>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:900;color:${mediaGeral>=4?'#22c55e':mediaGeral>=3?'#f59e0b':'#ef4444'}">${mediaGeral || '—'}</div>
        <small style="color:var(--text-muted);font-size:10px">Média geral</small>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:900;color:#f59e0b">${ocs.length}</div>
        <small style="color:var(--text-muted);font-size:10px">Ocorrências</small>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:900;color:#ef4444">${advs.length}</div>
        <small style="color:var(--text-muted);font-size:10px">Advertências</small>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:900;color:#06b6d4">${heus.length}</div>
        <small style="color:var(--text-muted);font-size:10px">Reuniões</small>
      </div>
    </div>
  </div>
</div>`;
  }

  function _renderTimeline() {
    if (!_colabSel) return `<div class="g-empty"><span class="g-empty-icon">👤</span><p>Selecione um colaborador</p></div>`;

    const eventos = _coletarEventos(_colabSel);
    const filtrados = _filtroTipo === 'todos' ? eventos : eventos.filter(e => e.tipo === _filtroTipo);
    filtrados.sort((a,b) => new Date(b.em) - new Date(a.em));

    if (filtrados.length === 0) return `
      <div class="g-empty">
        <span class="g-empty-icon">${_tipoIcon(_filtroTipo)}</span>
        <p>Nenhum evento de "${_tipoLabel(_filtroTipo)}" registrado</p>
        <small>Os eventos aparecem aqui conforme são criados no sistema.</small>
      </div>`;

    return `
<div class="g-card">
  <div class="g-tl">
    ${filtrados.map((ev, i) => `
      <div class="g-tl-item">
        <div class="g-tl-left">
          <div class="g-tl-dot ${ev.tipo}">${_tipoIcon(ev.tipo)}</div>
          ${i < filtrados.length - 1 ? '<div class="g-tl-line"></div>' : ''}
        </div>
        <div class="g-tl-content">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <strong>${ev.titulo}</strong>
            <time>${GestorFmt.data(ev.em)} ${_hora(ev.em)}</time>
          </div>
          <p>${ev.descricao || ''}</p>
          ${ev.extra ? `<div style="margin-top:6px;padding:8px 10px;background:var(--bg-sidebar,#f8fafc);border-radius:6px;font-size:11px">${ev.extra}</div>` : ''}
          ${ev.acao ? `<div style="margin-top:8px">${ev.acao}</div>` : ''}
        </div>
      </div>`).join('')}
  </div>
</div>`;
  }

  function _coletarEventos(colabId) {
    const db     = GestorDB.get();
    const colabs = GestorColabs.getAll();
    const colab  = colabs.find(c => c.id === colabId);
    const eventos = [];

    // 1. Admissão (baseada na data de admissão do colaborador)
    if (colab?.data_admissao || colab?.admitidoEm) {
      const dtAdm = colab.data_admissao || colab.admitidoEm;
      eventos.push({
        tipo: 'admissao', em: dtAdm,
        titulo: 'Admissão registrada',
        descricao: `Cargo: ${colab.cargo||'—'} · Setor: ${colab.setor||'—'} · Contrato: ${colab.tipo_contrato||'CLT'}`,
        extra: colab.salario_base ? `💰 Salário base: R$ ${parseFloat(colab.salario_base||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '',
      });
    }

    // 2. Avaliações
    db.avaliacoes.filter(a => a.colaborador_id === colabId).forEach(a => {
      const dt = a.concluida_em || a.criada_em;
      if (!dt) return;
      eventos.push({
        tipo: 'avaliacao', em: dt,
        titulo: a.status === 'concluida'
          ? `✅ Avaliação ${a.tipo} concluída`
          : `📋 Avaliação ${a.tipo} criada (${_statusLabel(a.status)})`,
        descricao: a.status === 'concluida'
          ? `Média: ${a.media!=null ? a.media.toFixed(1)+'/5.0' : '—'} · Avaliador: ${a.concluida_por||'—'}`
          : `Prazo: ${GestorFmt.data(a.prazo)}`,
        extra: a.media != null ? _starsHTML(a.media) : '',
        acao: a.status !== 'concluida'
          ? `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:3px 10px" onclick="gestorResponderAvaliacao('${a.id}')">✍️ Responder agora</button>`
          : '',
      });
    });

    // 3. Ocorrências
    db.ocorrencias.filter(o => o.colaborador_id === colabId).forEach(o => {
      eventos.push({
        tipo: 'ocorrencia', em: o.em,
        titulo: `📝 Ocorrência: ${o.tipo_label||o.tipo}`,
        descricao: `${o.descricao?.slice(0,100)||''}${(o.descricao||'').length>100?'…':''}`,
        extra: `Registrada por: ${o.registrada_por||'—'}${o.providencia ? ' · Providência: '+o.providencia : ''}`,
      });
    });

    // 4. Advertências
    db.advertencias.filter(a => a.colaborador_id === colabId).forEach(a => {
      eventos.push({
        tipo: 'advertencia', em: a.em,
        titulo: `⚠️ ${a.modelo_nome||'Advertência'} emitida`,
        descricao: `Motivo: ${a.motivo?.slice(0,100)||'—'}`,
        extra: `Emitida por: ${a.gestor||'—'}`,
        acao: `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:3px 10px" onclick="gestorVerDocAdv('${a.id}')">📄 Ver documento</button>`,
      });
    });

    // 5. Documentos (Home Office)
    db.termos_ho.filter(t => t.colaborador_id === colabId).forEach(t => {
      eventos.push({
        tipo: 'documento', em: t.em,
        titulo: `🏠 Termo de Home Office gerado`,
        descricao: `${t.modalidade||'Home Office'} · ${GestorFmt.data(t.periodo_inicio)} → ${t.periodo_fim ? GestorFmt.data(t.periodo_fim) : 'Indeterminado'}`,
        extra: `Aprovado por: ${t.gestor||'—'}`,
        acao: `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:3px 10px" onclick="gestorVerHO('${t.id}')">📄 Ver documento</button>`,
      });
    });

    // 6. Reuniões
    db.reunioes.filter(r => r.participantes?.includes(colabId)).forEach(r => {
      eventos.push({
        tipo: 'reuniao', em: r.data_hora,
        titulo: `📅 Reunião: ${r.titulo}`,
        descricao: `${GestorFmt.data(r.data_hora)} às ${_hora(r.data_hora)} · ${r.local||'Local a definir'}`,
        extra: r.pauta ? `Pauta: ${r.pauta.slice(0,80)}…` : '',
      });
    });

    // 7. Histórico interno (_historico)
    if (db._historico) {
      db._historico
        .filter(h => h.colaborador_id === colabId)
        .forEach(h => {
          // Evita duplicatas com os eventos já coletados acima
          const jaExiste = eventos.some(e =>
            e.titulo === h.titulo && e.em === h.em);
          if (jaExiste) return;
          eventos.push({
            tipo: h.tipo || 'sistema', em: h.em,
            titulo: h.titulo || 'Evento registrado',
            descricao: h.descricao || '',
          });
        });
    }

    return eventos;
  }

  function _statusLabel(s) {
    return { pendente:'Pendente', proxima:'Próxima', atrasada:'Atrasada', concluida:'Concluída' }[s] || s;
  }

  function _starsHTML(media) {
    return `<div style="display:flex;gap:2px;margin-top:4px">
      ${[1,2,3,4,5].map(n => `<span style="font-size:14px;color:${media>=n?'#f59e0b':'#d1d5db'}">★</span>`).join('')}
      <span style="font-size:11px;margin-left:4px;color:var(--text-muted)">${media.toFixed(1)}/5.0</span>
    </div>`;
  }

  function _hora(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); } catch { return ''; }
  }

  function _tipoIcon(tipo) {
    return {
      todos:'📌', admissao:'🟢', avaliacao:'📋',
      ocorrencia:'📝', advertencia:'⚠️', documento:'🏠',
      reuniao:'📅', sistema:'🔔',
    }[tipo] || '📌';
  }

  function _tipoLabel(tipo) {
    return {
      todos:'Todos', admissao:'Admissão', avaliacao:'Avaliações',
      ocorrencia:'Ocorrências', advertencia:'Advertências', documento:'Documentos',
      reuniao:'Reuniões', sistema:'Sistema',
    }[tipo] || tipo;
  }

  // ─── GLOBAIS ──────────────────────────────────────────────
  window.gestorHistSelColab = function(id) {
    _colabSel = id;
    const tl = document.getElementById('g-hist-tl');
    const fichaEl = tl?.previousElementSibling;
    const colabs = GestorColabs.getBySector();
    const colab  = colabs.find(c => c.id === id);
    if (fichaEl) fichaEl.outerHTML = _fichaColab(colab);
    if (tl) tl.innerHTML = _renderTimeline();
  };

  window.gestorHistFiltro = function(tipo) {
    _filtroTipo = tipo;
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  return { render };
})();
