/**
 * gestor-ocorrencias.js — Ocorrências e Advertências
 * Expõe: window.GestorOcorrencias
 */
window.GestorOcorrencias = (() => {
  let _aba = 'ocorrencias';

  function render(container) {
    container.innerHTML = _shell();
    _renderAba(container);
  }

  function _shell() {
    const isRH = GestorUser.isRH();
    return `
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div class="g-filter-bar" style="margin:0">
      <button class="g-filter-btn ${_aba==='ocorrencias'?'ativo':''}" onclick="gestorOcAbas('ocorrencias')">📝 Ocorrências</button>
      <button class="g-filter-btn ${_aba==='advertencias'?'ativo':''}" onclick="gestorOcAbas('advertencias')">⚠️ Advertências</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="dp-btn" onclick="gestorNovaOcorrencia()">+ Nova Ocorrência</button>
      <button class="dp-btn dp-btn-secondary" onclick="gestorNovaAdvertencia()">+ Advertência</button>
    </div>
  </div>
  <div id="g-oc-corpo"></div>
</div>`;
  }

  function _renderAba(container) {
    const corpo = (container || document.getElementById('g-conteudo'))?.querySelector('#g-oc-corpo');
    if (!corpo) return;
    corpo.innerHTML = _aba === 'ocorrencias' ? _renderOcorrencias() : _renderAdvertencias();
  }

  // ── Ocorrências ────────────────────────────────────────────
  function _renderOcorrencias() {
    const db     = GestorDB.get();
    const colabs = GestorColabs.getBySector();
    const isRH   = GestorUser.isRH();
    const lista  = db.ocorrencias.filter(o =>
      isRH ? true : colabs.find(c => c.id === o.colaborador_id));

    if (lista.length === 0) return `<div class="g-empty">
      <span class="g-empty-icon">📝</span>
      <p>Nenhuma ocorrência registrada</p>
      <small>Clique em "+ Nova Ocorrência" para registrar.</small>
    </div>`;

    return `<div class="g-table-wrap"><table class="g-table">
      <thead><tr>
        <th>Colaborador</th><th>Tipo</th><th>Descrição</th>
        <th>Registrada por</th><th>Data</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        ${lista.map(o => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="g-avatar" style="width:28px;height:28px;font-size:10px;background:#f59e0b">${GestorFmt.ini(o.colaborador_nome)}</div>
                <strong>${o.colaborador_nome}</strong>
              </div>
            </td>
            <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:${_corTipo(o.tipo)};color:#fff">${o.tipo_label || o.tipo}</span></td>
            <td><span style="font-size:12px;color:var(--text-muted)">${(o.descricao||'').slice(0,60)}${(o.descricao||'').length>60?'…':''}</span></td>
            <td>${o.registrada_por || '—'}</td>
            <td>${GestorFmt.data(o.em)}</td>
            <td><span class="g-status g-status-aberta">Aberta</span></td>
            <td>
              <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorVerOcorrencia('${o.id}')">Ver</button>
              ${GestorUser.isRH() ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;padding:4px 8px" onclick="gestorExcluirOcorrencia('${o.id}')">🗑️</button>` : ''}
            </td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
  }

  function _corTipo(tipo) {
    return { leve:'#22c55e', moderada:'#f59e0b', grave:'#ef4444', ausencia:'#6b7280', atraso:'#f59e0b' }[tipo] || '#94a3b8';
  }

  // ── Advertências ───────────────────────────────────────────
  function _renderAdvertencias() {
    const db    = GestorDB.get();
    const colabs = GestorColabs.getBySector();
    const isRH  = GestorUser.isRH();
    const lista = db.advertencias.filter(a =>
      isRH ? true : colabs.find(c => c.id === a.colaborador_id));

    if (lista.length === 0) return `<div class="g-empty">
      <span class="g-empty-icon">⚠️</span>
      <p>Nenhuma advertência registrada</p>
      <small>Clique em "+ Advertência" para emitir.</small>
    </div>`;

    return `<div class="g-table-wrap"><table class="g-table">
      <thead><tr>
        <th>Colaborador</th><th>Tipo</th><th>Motivo</th>
        <th>Gestor</th><th>Data</th><th>Doc. Gerado</th><th></th>
      </tr></thead>
      <tbody>
        ${lista.map(a => `
          <tr>
            <td><strong>${a.colaborador_nome}</strong></td>
            <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:${_corAdv(a.tipo)};color:#fff">${_labelAdv(a.tipo)}</span></td>
            <td><span style="font-size:12px;color:var(--text-muted)">${(a.motivo||'').slice(0,50)}…</span></td>
            <td>${a.gestor || '—'}</td>
            <td>${GestorFmt.data(a.em)}</td>
            <td>${a.doc_gerado ? '<span style="color:#16a34a;font-size:12px;font-weight:700">✅ Sim</span>' : '<span style="color:#94a3b8;font-size:12px">Não</span>'}</td>
            <td style="white-space:nowrap">
              <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorVerAdvertencia('${a.id}')">Ver Doc.</button>
              ${GestorUser.isRH() ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;padding:4px 8px" onclick="gestorExcluirAdvertencia('${a.id}')">🗑️</button>` : ''}
            </td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
  }

  function _corAdv(tipo) {
    return { advertencia_verbal:'#f59e0b', advertencia_escrita:'#ef4444', suspensao:'#7c3aed' }[tipo] || '#94a3b8';
  }
  function _labelAdv(tipo) {
    return { advertencia_verbal:'Verbal', advertencia_escrita:'Por Escrito', suspensao:'Suspensão' }[tipo] || tipo;
  }

  // ─────────────────────────────────────────────────────────
  // MODAL NOVA OCORRÊNCIA
  // ─────────────────────────────────────────────────────────
  window.gestorNovaOcorrencia = function() {
    const colabs = GestorColabs.getBySector();
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
      <div class="g-modal">
        <div class="g-modal-hd">
          <h3>📝 Nova Ocorrência</h3>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body">
          <div class="dp-form-grid">
            <div class="dp-field dp-field-full">
              <label>Colaborador *</label>
              <select id="goc-colab">
                <option value="">Selecione o colaborador</option>
                ${colabs.map(c => `<option value="${c.id}" data-nome="${c.nome_completo||c.nome}">${c.nome_completo||c.nome} — ${c.setor||''}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field">
              <label>Tipo de Ocorrência *</label>
              <select id="goc-tipo">
                <option value="leve"    data-label="Leve">🟢 Leve</option>
                <option value="moderada" data-label="Moderada">🟡 Moderada</option>
                <option value="grave"   data-label="Grave">🔴 Grave</option>
                <option value="ausencia" data-label="Ausência">⚫ Ausência injustificada</option>
                <option value="atraso"  data-label="Atraso">🟡 Atraso recorrente</option>
              </select>
            </div>
            <div class="dp-field dp-field-full">
              <label>Descrição detalhada *</label>
              <textarea id="goc-desc" rows="4" placeholder="Descreva a ocorrência com detalhes: data, local, situação…" style="width:100%;resize:vertical"></textarea>
            </div>
            <div class="dp-field dp-field-full">
              <label>Providência tomada</label>
              <input type="text" id="goc-providencia" placeholder="Ex: Conversa informal, orientação dada, etc." />
            </div>
          </div>
          <div class="g-alert g-alert-info" style="margin-top:12px">
            <span>ℹ️</span>
            <span>O RH será notificado automaticamente após o registro. A ocorrência ficará no histórico do colaborador.</span>
          </div>
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
          <button class="dp-btn" onclick="gestorSalvarOcorrencia()">📝 Registrar Ocorrência</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  };

  window.gestorSalvarOcorrencia = function() {
    const colabEl = document.getElementById('goc-colab');
    const tipoEl  = document.getElementById('goc-tipo');
    const desc    = document.getElementById('goc-desc')?.value?.trim();
    const prov    = document.getElementById('goc-providencia')?.value?.trim();

    if (!colabEl?.value || !desc) { alert('Preencha colaborador e descrição.'); return; }

    const colabId   = colabEl.value;
    const colabNome = colabEl.selectedOptions[0]?.dataset.nome || '';
    const tipo      = tipoEl.value;
    const tipoLabel = tipoEl.selectedOptions[0]?.dataset.label || tipo;

    const oc = {
      id: 'OC_' + Date.now(),
      colaborador_id: colabId,
      colaborador_nome: colabNome,
      setor: GestorUser.setor() || '',
      tipo, tipo_label: tipoLabel,
      descricao: desc,
      providencia: prov || '',
      registrada_por: GestorUser.nome(),
      em: new Date().toISOString(),
    };

    GestorDB.upsert('ocorrencias', oc);
    GestorDB.addNotificacao('ocorrencia', 'Nova ocorrência registrada',
      `${colabNome} — Tipo: ${tipoLabel} · Por: ${oc.registrada_por}`);

    // Histórico
    const db = GestorDB.get();
    if (!db._historico) db._historico = [];
    db._historico.push({
      id: 'HIST_OC_' + Date.now(), colaborador_id: colabId,
      tipo: 'ocorrencia', titulo: `Ocorrência: ${tipoLabel}`,
      descricao: desc.slice(0, 100), em: oc.em,
    });
    GestorDB.set(db);

    document.querySelector('.g-overlay')?.remove();
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorVerOcorrencia = function(id) {
    const oc = GestorDB.get().ocorrencias.find(x => x.id === id);
    if (!oc) return;
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
      <div class="g-modal">
        <div class="g-modal-hd">
          <h3>Ocorrência — ${oc.colaborador_nome}</h3>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div><label style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Tipo</label><p>${oc.tipo_label}</p></div>
            <div><label style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Data</label><p>${GestorFmt.data(oc.em)}</p></div>
            <div><label style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Registrada por</label><p>${oc.registrada_por}</p></div>
            <div><label style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase">Setor</label><p>${oc.setor}</p></div>
          </div>
          <div class="dp-field"><label>Descrição</label><div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:12px;font-size:13px;line-height:1.6">${oc.descricao}</div></div>
          ${oc.providencia ? `<div class="dp-field" style="margin-top:12px"><label>Providência</label><div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:12px;font-size:13px">${oc.providencia}</div></div>` : ''}
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
          ${GestorUser.isRH() ? `<button class="dp-btn" onclick="gestorConverterEmAdvertencia('${id}')">⚠️ Gerar Advertência</button>` : ''}
        </div>
      </div>`;
    document.body.appendChild(overlay);
  };

  window.gestorExcluirOcorrencia = function(id) {
    if (!confirm('Excluir esta ocorrência?')) return;
    GestorDB.remove('ocorrencias', id);
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  // ─────────────────────────────────────────────────────────
  // MODAL ADVERTÊNCIA
  // ─────────────────────────────────────────────────────────
  window.gestorNovaAdvertencia = function(colabIdPre, colabNomePre) {
    const colabs = GestorColabs.getBySector();
    const db     = GestorDB.get();
    const modelos = db.modelos_doc.filter(m => m.tipo.includes('advertencia') || m.tipo.includes('suspensao'));

    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.id = 'g-adv-overlay';
    overlay.innerHTML = `
      <div class="g-modal g-modal-lg">
        <div class="g-modal-hd">
          <h3>⚠️ Emitir Advertência</h3>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body">
          <div class="dp-form-grid" style="margin-bottom:16px">
            <div class="dp-field dp-field-full">
              <label>Colaborador *</label>
              <select id="gadv-colab">
                <option value="">Selecione</option>
                ${colabs.map(c => `<option value="${c.id}" data-nome="${c.nome_completo||c.nome}" ${colabIdPre===c.id?'selected':''}>${c.nome_completo||c.nome}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom:14px">
            <label style="display:block;font-size:12px;font-weight:700;margin-bottom:8px">Tipo de Documento *</label>
            <div class="g-adv-modelos">
              ${modelos.map((m, i) => `
                <div class="g-adv-modelo-card ${i===0?'selecionado':''}" onclick="gestorSelModelo(this,'${m.id}')" data-modelo-id="${m.id}">
                  <span class="g-adv-icon">${m.tipo.includes('suspensao')?'🚫':m.tipo.includes('escrita')?'📄':'💬'}</span>
                  <strong>${m.nome}</strong>
                  <small>${m.tipo}</small>
                </div>`).join('')}
            </div>
          </div>
          <div class="dp-field" style="margin-bottom:12px">
            <label>Motivo da Advertência *</label>
            <textarea id="gadv-motivo" rows="4" placeholder="Descreva detalhadamente o motivo da advertência…" style="width:100%;resize:vertical"></textarea>
          </div>
          <div class="dp-field dp-field-full" style="margin-bottom:12px" id="gadv-dias-wrap" style="display:none">
            <label>Dias de Suspensão</label>
            <input type="number" id="gadv-dias" min="1" max="30" value="1" placeholder="Nº de dias" style="width:80px" />
          </div>
          <div id="gadv-preview-area" style="display:none">
            <label style="font-size:12px;font-weight:700;margin-bottom:6px;display:block">Pré-visualização do Documento</label>
            <div class="g-doc-preview" id="gadv-preview-txt"></div>
          </div>
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="gestorPreviewAdv()">👁️ Pré-visualizar</button>
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
          <button class="dp-btn" onclick="gestorSalvarAdvertencia()">📄 Gerar Advertência</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    window._advModeloSel = modelos[0]?.id;
  };

  window.gestorSelModelo = function(el, modeloId) {
    document.querySelectorAll('.g-adv-modelo-card').forEach(c => c.classList.remove('selecionado'));
    el.classList.add('selecionado');
    window._advModeloSel = modeloId;
    const db = GestorDB.get();
    const m  = db.modelos_doc.find(x => x.id === modeloId);
    const diasWrap = document.getElementById('gadv-dias-wrap');
    if (diasWrap) diasWrap.style.display = m?.tipo === 'suspensao' ? '' : 'none';
  };

  window.gestorPreviewAdv = function() {
    const txt = _gerarTextoAdv();
    const area = document.getElementById('gadv-preview-area');
    const prev = document.getElementById('gadv-preview-txt');
    if (area && prev && txt) { area.style.display = ''; prev.textContent = txt; }
  };

  function _gerarTextoAdv() {
    const colabEl  = document.getElementById('gadv-colab');
    const motivo   = document.getElementById('gadv-motivo')?.value?.trim();
    const modeloId = window._advModeloSel;
    if (!colabEl?.value || !motivo || !modeloId) { alert('Preencha todos os campos obrigatórios.'); return null; }
    const db      = GestorDB.get();
    const modelo  = db.modelos_doc.find(m => m.id === modeloId);
    const dias    = document.getElementById('gadv-dias')?.value || '1';
    const colabNome = colabEl.selectedOptions[0]?.dataset.nome || '';
    const user    = GestorUser.get();
    const hoje    = new Date().toLocaleDateString('pt-BR');
    return (modelo?.conteudo || '')
      .replace(/\{colaborador\}/g, colabNome)
      .replace(/\{gestor\}/g, user.nome || 'Gestor')
      .replace(/\{setor\}/g, user.setor || colabEl.selectedOptions[0]?.parentElement?.label || '')
      .replace(/\{empresa\}/g, 'hi Conecta RH')
      .replace(/\{data\}/g, hoje)
      .replace(/\{motivo\}/g, motivo)
      .replace(/\{dias_suspensao\}/g, dias);
  }

  window.gestorSalvarAdvertencia = function() {
    const colabEl  = document.getElementById('gadv-colab');
    const motivo   = document.getElementById('gadv-motivo')?.value?.trim();
    const modeloId = window._advModeloSel;
    if (!colabEl?.value || !motivo || !modeloId) { alert('Preencha todos os campos obrigatórios.'); return; }

    const db       = GestorDB.get();
    const modelo   = db.modelos_doc.find(m => m.id === modeloId);
    const colabId  = colabEl.value;
    const colabNome= colabEl.selectedOptions[0]?.dataset.nome || '';
    const texto    = _gerarTextoAdv();

    const adv = {
      id: 'ADV_' + Date.now(),
      colaborador_id: colabId,
      colaborador_nome: colabNome,
      tipo: modelo?.tipo || 'advertencia_escrita',
      modelo_id: modeloId,
      modelo_nome: modelo?.nome || '',
      motivo,
      texto_gerado: texto,
      gestor: GestorUser.nome(),
      setor: GestorUser.setor(),
      doc_gerado: true,
      assinada: false,
      em: new Date().toISOString(),
    };

    GestorDB.upsert('advertencias', adv);
    GestorDB.addNotificacao('advertencia', 'Advertência emitida',
      `${colabNome} — ${modelo?.nome || ''} · Por: ${adv.gestor}`);

    // Histórico
    if (!db._historico) db._historico = [];
    db._historico.push({
      id: 'HIST_ADV_' + Date.now(), colaborador_id: colabId,
      tipo: 'advertencia', titulo: modelo?.nome || 'Advertência',
      descricao: motivo.slice(0, 100), em: adv.em,
    });
    GestorDB.set(db);

    document.getElementById('g-adv-overlay')?.remove();
    _aba = 'advertencias';
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorConverterEmAdvertencia = function(ocId) {
    const oc = GestorDB.get().ocorrencias.find(x => x.id === ocId);
    document.querySelector('.g-overlay')?.remove();
    if (oc) { gestorNovaAdvertencia(oc.colaborador_id, oc.colaborador_nome); }
  };

  window.gestorVerAdvertencia = function(id) {
    const adv = GestorDB.get().advertencias.find(x => x.id === id);
    if (!adv) return;
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
      <div class="g-modal g-modal-lg">
        <div class="g-modal-hd">
          <h3>${adv.modelo_nome} — ${adv.colaborador_nome}</h3>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body">
          <div class="g-doc-preview">${adv.texto_gerado || 'Documento não disponível.'}</div>
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
          <button class="dp-btn" onclick="window.print()">🖨️ Imprimir</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  };

  window.gestorExcluirAdvertencia = function(id) {
    if (!confirm('Excluir esta advertência?')) return;
    GestorDB.remove('advertencias', id);
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorOcAbas = function(aba) {
    _aba = aba;
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  return { render };
})();
