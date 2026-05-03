/**
 * bonificacoes-forms.js — Form Builder dinâmico
 * Criar, editar, responder e visualizar resultados de formulários
 * Expõe: window.BonifForms
 */
window.BonifForms = (() => {
  let _view    = 'lista';   // 'lista' | 'builder' | 'responder' | 'respostas'
  let _formEd  = null;      // form em edição
  let _campos  = [];        // campos do form sendo editado
  let _campoSel= null;      // campo selecionado no builder
  let _container = null;

  const TIPOS_CAMPO = [
    { tipo:'texto',    icon:'📝', label:'Texto curto'    },
    { tipo:'paragrafo',icon:'📄', label:'Parágrafo'      },
    { tipo:'multipla', icon:'☑️', label:'Múltipla escolha'},
    { tipo:'escala',   icon:'⭐', label:'Escala 1–5'     },
    { tipo:'nps',      icon:'📊', label:'NPS 0–10'       },
    { tipo:'sim_nao',  icon:'✅', label:'Sim / Não'      },
    { tipo:'upload',   icon:'📎', label:'Upload arquivo' },
  ];

  // ─── RENDER PRINCIPAL ──────────────────────────────────────
  function render(container) {
    _container = container;
    _view = 'lista';
    _refresh();
  }

  function _refresh() {
    if (!_container) return;
    if      (_view === 'lista')    _container.innerHTML = _renderLista();
    else if (_view === 'builder')  _container.innerHTML = _renderBuilder();
    else if (_view === 'responder')_container.innerHTML = _renderResponder(_formEd);
    else if (_view === 'respostas')_container.innerHTML = _renderRespostas(_formEd);
    _bindBuilderEvents();
  }

  // ─── LISTA DE FORMULÁRIOS ──────────────────────────────────
  function _renderLista() {
    const db    = BonifDB.get();
    const forms = db.forms;
    return `
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="dp-btn" onclick="bnfFormNovo()">+ Criar Formulário</button>
      <button class="dp-btn dp-btn-secondary" onclick="bnfFormNovoPreset('clima')">🌡️ Pesquisa de Clima</button>
      <button class="dp-btn dp-btn-secondary" onclick="bnfFormNovoPreset('nps')">📊 NPS Rápido</button>
    </div>
  </div>

  ${forms.length === 0
    ? `<div class="bnf-card"><div class="bnf-empty"><span class="bnf-empty-icon">📋</span><p>Nenhum formulário criado</p><small>Crie seu primeiro formulário clicando acima.</small></div></div>`
    : `<div class="bnf-table-wrap"><table class="bnf-table">
        <thead><tr><th>Formulário</th><th>Tipo</th><th>Modo</th><th>Respostas</th><th>Status</th><th>Criado em</th><th>Ações</th></tr></thead>
        <tbody>
          ${forms.map(f => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:20px">${_iconForm(f.tipo)}</span>
                  <div>
                    <strong>${f.titulo}</strong>
                    <small style="display:block;color:var(--text-muted)">${(f.descricao||'').slice(0,50)}</small>
                  </div>
                </div>
              </td>
              <td><span class="bnf-tipo-tag bnf-tipo-${f.tipo}">${f.tipo}</span></td>
              <td><span style="font-size:11px">${f.modo==='anonimo'?'🔒 Anônimo':'👤 Identificado'}</span></td>
              <td>
                <strong>${f.respostas_count||0}</strong>
                ${(f.respostas_count||0) > 0 ? `<a style="font-size:11px;margin-left:4px;color:var(--primary);cursor:pointer" onclick="bnfVerRespostas('${f.id}')">ver</a>` : ''}
              </td>
              <td><span class="bnf-status bnf-st-${f.status}">${f.status}</span></td>
              <td>${BonifFmt.data(f.criado_em)}</td>
              <td style="white-space:nowrap">
                <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 8px" onclick="bnfEditarForm('${f.id}')">✏️</button>
                <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 8px;margin-left:4px" onclick="bnfResponderForm('${f.id}')">📝 Responder</button>
                <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 8px;margin-left:4px" onclick="bnfToggleStatus('${f.id}')">
                  ${f.status==='ativo'?'⏸ Encerrar':'▶ Ativar'}
                </button>
                ${Auth?.isRH() ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;padding:4px 6px" onclick="bnfExcluirForm('${f.id}')">🗑️</button>` : ''}
              </td>
            </tr>`).join('')}
        </tbody>
      </table></div>`}
</div>`;
  }

  // ─── BUILDER ──────────────────────────────────────────────
  function _renderBuilder() {
    const form = _formEd || {};
    return `
<div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
    <button class="dp-btn dp-btn-secondary" onclick="bnfFormVoltar()">← Voltar</button>
    <h3 style="margin:0;font-size:16px;font-weight:700">${form.id ? 'Editar Formulário' : 'Novo Formulário'}</h3>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="dp-btn dp-btn-secondary" onclick="bnfFormPreview()">👁️ Preview</button>
      <button class="dp-btn" onclick="bnfFormSalvar()">💾 Salvar Formulário</button>
    </div>
  </div>

  <!-- Configurações do form -->
  <div class="bnf-card" style="margin-bottom:14px">
    <div class="dp-form-grid">
      <div class="dp-field dp-field-full">
        <label>Título do Formulário <span style="color:#ef4444">*</span></label>
        <input type="text" id="bnf-form-titulo" value="${form.titulo||''}" placeholder="Ex: Pesquisa de Clima — Mai/2025" />
      </div>
      <div class="dp-field dp-field-full">
        <label>Descrição</label>
        <input type="text" id="bnf-form-desc" value="${form.descricao||''}" placeholder="Explique o objetivo do formulário" />
      </div>
      <div class="dp-field">
        <label>Tipo</label>
        <select id="bnf-form-tipo">
          ${['clima','avaliacao','feedback','nps','custom'].map(t => `<option value="${t}" ${form.tipo===t?'selected':''}>${_nomeTipo(t)}</option>`).join('')}
        </select>
      </div>
      <div class="dp-field">
        <label>Modo de identificação</label>
        <select id="bnf-form-modo">
          <option value="anonimo"     ${form.modo==='anonimo'?'selected':''}>🔒 Anônimo</option>
          <option value="identificado"${form.modo==='identificado'?'selected':''}>👤 Identificado</option>
        </select>
      </div>
      <div class="dp-field">
        <label>Data de abertura</label>
        <input type="date" id="bnf-form-inicio" value="${form.agendamento?.inicio||''}" />
      </div>
      <div class="dp-field">
        <label>Data de encerramento</label>
        <input type="date" id="bnf-form-fim" value="${form.agendamento?.fim||''}" />
      </div>
    </div>
  </div>

  <!-- Builder -->
  <div class="bnf-fb-root" id="bnf-fb-root">
    <!-- Painel esquerdo: tipos de campo -->
    <div class="bnf-fb-panel">
      <div class="bnf-fb-panel-hd">🧩 Adicionar Campo</div>
      <div class="bnf-fb-panel-body">
        ${TIPOS_CAMPO.map(t => `
          <button class="bnf-tipo-btn" onclick="bnfAddCampo('${t.tipo}')">
            <span class="bnf-tipo-icon">${t.icon}</span>${t.label}
          </button>`).join('')}
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-color,#e2e8f0)">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">Dica</div>
          <p style="font-size:11px;color:var(--text-muted);line-height:1.5">Clique em um tipo para adicionar o campo ao formulário. Use ✏️ para editar e 🗑️ para remover.</p>
        </div>
      </div>
    </div>

    <!-- Canvas central -->
    <div class="bnf-fb-panel" style="background:var(--bg-sidebar,#f8fafc)">
      <div class="bnf-fb-panel-hd">📋 Campos do Formulário <span style="font-size:11px;font-weight:400;color:var(--text-muted)">${_campos.length} campo(s)</span></div>
      <div class="bnf-fb-panel-body">
        <div class="bnf-canvas" id="bnf-canvas">
          ${_campos.length === 0
            ? `<div class="bnf-canvas-empty"><span style="font-size:32px">📋</span><p style="margin:8px 0 4px;font-size:14px;font-weight:600">Canvas vazio</p><small>Adicione campos no painel à esquerda</small></div>`
            : _campos.map((c,i) => _renderCampoCanvas(c,i)).join('')}
        </div>
      </div>
    </div>

    <!-- Painel direito: propriedades -->
    <div class="bnf-fb-panel" id="bnf-props-panel">
      <div class="bnf-fb-panel-hd">⚙️ Propriedades</div>
      <div class="bnf-fb-panel-body" id="bnf-props-body">
        ${_campoSel ? _renderProps(_campoSel) : `<p style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:24px">Clique em um campo para editar suas propriedades</p>`}
      </div>
    </div>
  </div>
</div>`;
  }

  function _renderCampoCanvas(c, idx) {
    const icon = TIPOS_CAMPO.find(t => t.tipo === c.tipo)?.icon || '📝';
    const isSel = _campoSel?.id === c.id;
    return `
<div class="bnf-campo-card ${isSel?'selecionado':''}" id="fc-${c.id}" onclick="bnfSelCampo('${c.id}')">
  <div class="bnf-campo-hd">
    <span class="bnf-campo-drag">⠿</span>
    <span class="bnf-campo-tipo-icon">${icon}</span>
    <div class="bnf-campo-label-wrap" style="flex:1">
      <strong style="font-size:13px">${c.label||'Sem título'}</strong>
      ${c.obrigatorio ? '<span style="color:#ef4444;font-size:11px;margin-left:4px">*</span>' : ''}
    </div>
    <div class="bnf-campo-actions">
      ${idx > 0 ? `<button class="bnf-campo-btn" onclick="event.stopPropagation();bnfMoverCampo('${c.id}',-1)" title="Mover acima">↑</button>` : ''}
      ${idx < _campos.length-1 ? `<button class="bnf-campo-btn" onclick="event.stopPropagation();bnfMoverCampo('${c.id}',1)" title="Mover abaixo">↓</button>` : ''}
      <button class="bnf-campo-btn delete" onclick="event.stopPropagation();bnfRemCampo('${c.id}')" title="Remover">🗑️</button>
    </div>
  </div>
  ${_previewCampo(c)}
</div>`;
  }

  function _previewCampo(c) {
    switch (c.tipo) {
      case 'texto':    return `<input type="text" placeholder="Resposta curta..." disabled style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:6px;padding:6px 10px;font-size:12px;background:var(--bg-sidebar,#f8fafc);cursor:not-allowed">`;
      case 'paragrafo':return `<textarea rows="2" disabled placeholder="Resposta longa..." style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:6px;padding:6px 10px;font-size:12px;background:var(--bg-sidebar,#f8fafc);resize:none;cursor:not-allowed"></textarea>`;
      case 'multipla': return `<div>${(c.opcoes||['Opção 1','Opção 2']).map(o=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><input type="radio" disabled/><span style="font-size:12px">${o}</span></div>`).join('')}</div>`;
      case 'escala':   return `<div class="bnf-scale-preview">${[1,2,3,4,5].map(n=>`<div class="bnf-scale-dot">${n}</div>`).join('')}</div>`;
      case 'nps':      return `<div class="bnf-nps-row">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<div class="bnf-nps-num">${n}</div>`).join('')}</div>`;
      case 'sim_nao':  return `<div style="display:flex;gap:8px"><button disabled style="flex:1;padding:6px;border:1px solid #86efac;border-radius:6px;background:#f0fdf4;font-size:12px;cursor:not-allowed">✅ Sim</button><button disabled style="flex:1;padding:6px;border:1px solid #fca5a5;border-radius:6px;background:#fef2f2;font-size:12px;cursor:not-allowed">❌ Não</button></div>`;
      case 'upload':   return `<div style="border:2px dashed var(--border-color,#e2e8f0);border-radius:6px;padding:12px;text-align:center;font-size:11px;color:var(--text-muted)">📎 Clique para selecionar arquivo</div>`;
      default: return '';
    }
  }

  function _renderProps(c) {
    return `
<div id="bnf-props-inner">
  <div class="bnf-prop-campo">
    <label class="bnf-prop-label">Título do campo</label>
    <input type="text" value="${c.label||''}" id="prop-label" oninput="bnfUpdateProp('label',this.value)" style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:8px 10px;font-size:12px" />
  </div>
  <div class="bnf-prop-campo">
    <label class="bnf-prop-label">Tipo</label>
    <select id="prop-tipo" onchange="bnfUpdateProp('tipo',this.value)" style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:8px 10px;font-size:12px">
      ${TIPOS_CAMPO.map(t=>`<option value="${t.tipo}" ${c.tipo===t.tipo?'selected':''}>${t.icon} ${t.label}</option>`).join('')}
    </select>
  </div>
  <div class="bnf-prop-campo">
    <label class="bnf-prop-label" style="display:flex;align-items:center;gap:6px">
      <input type="checkbox" id="prop-obrig" ${c.obrigatorio?'checked':''} onchange="bnfUpdateProp('obrigatorio',this.checked)" />
      Campo obrigatório
    </label>
  </div>
  ${c.tipo === 'multipla' ? `
  <div class="bnf-prop-campo">
    <label class="bnf-prop-label">Opções (uma por linha)</label>
    <textarea id="prop-opcoes" rows="5" style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:8px 10px;font-size:12px;resize:vertical" oninput="bnfUpdateProp('opcoes',this.value.split('\\n').filter(o=>o.trim()))">${(c.opcoes||[]).join('\n')}</textarea>
  </div>` : ''}
  <div class="bnf-prop-campo" style="margin-top:8px">
    <label class="bnf-prop-label">Lógica condicional</label>
    <div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:10px;font-size:11px;color:var(--text-muted)">
      ${c.condicional
        ? `<div>Exibir se "<strong>${c.condicional.campo_id}</strong>" = <strong>${c.condicional.valor}</strong></div><button onclick="bnfUpdateProp('condicional',null)" style="margin-top:4px;border:none;background:transparent;color:#ef4444;cursor:pointer;font-size:11px">Remover condição</button>`
        : `Sem condição. <a href="#" onclick="bnfAddCondicional('${c.id}')" style="font-size:11px;color:var(--primary)">Adicionar</a>`}
    </div>
  </div>
</div>`;
  }

  // ─── RESPONDER FORMULÁRIO ──────────────────────────────────
  function _renderResponder(form) {
    if (!form) return '<div class="bnf-empty">Formulário não encontrado.</div>';
    return `
<div>
  <button class="dp-btn dp-btn-secondary" onclick="bnfFormVoltar()" style="margin-bottom:16px">← Voltar à lista</button>
  <div class="bnf-form-preview">
    <div class="bnf-form-header">
      <h2>${form.titulo}</h2>
      ${form.descricao ? `<p>${form.descricao}</p>` : ''}
      ${form.modo==='anonimo' ? `<p style="font-size:11px;opacity:.7;margin-top:8px">🔒 Suas respostas são anônimas</p>` : ''}
    </div>
    <div class="bnf-form-body">
      ${form.campos.map((c,i) => `
        <div class="bnf-campo-q" id="cq-${c.id}">
          <label>${i+1}. ${c.label}${c.obrigatorio?'<span style="color:#ef4444"> *</span>':''}</label>
          ${_inputResposta(c)}
        </div>`).join('')}
      <div style="display:flex;justify-content:flex-end;margin-top:8px">
        <button class="dp-btn" onclick="bnfEnviarResposta('${form.id}')">✅ Enviar Respostas</button>
      </div>
    </div>
  </div>
</div>`;
  }

  function _inputResposta(c) {
    switch (c.tipo) {
      case 'texto':     return `<input type="text" id="r-${c.id}" placeholder="Sua resposta..." class="bnf-resp-input" style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:10px 12px;font-size:13px">`;
      case 'paragrafo': return `<textarea id="r-${c.id}" rows="4" placeholder="Escreva aqui..." class="bnf-resp-input" style="width:100%;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:10px 12px;font-size:13px;resize:vertical"></textarea>`;
      case 'multipla':  return `<div id="r-${c.id}">${(c.opcoes||[]).map(o=>`
        <div class="bnf-mc-opt" onclick="bnfSelOpcao(this,'${c.id}','${o.replace(/'/g,"\\'")}')">
          <span style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border-color,#cbd5e1);flex-shrink:0;display:inline-block"></span>${o}
        </div>`).join('')}</div>`;
      case 'escala':    return `<div class="bnf-scale-preview" id="r-${c.id}">
        ${[1,2,3,4,5].map(n=>`<div class="bnf-scale-dot" onclick="bnfSelEscala(this,'${c.id}',${n})" title="${n}">${n}</div>`).join('')}
        <input type="hidden" id="rhid-${c.id}" value="" /></div>`;
      case 'nps':       return `<div>
        <div class="bnf-nps-row" id="r-${c.id}">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<div class="bnf-nps-num" onclick="bnfSelNps(this,'${c.id}',${n})" title="${n}">${n}</div>`).join('')}
        </div>
        <input type="hidden" id="rhid-${c.id}" value="" />
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px"><span>Muito improvável</span><span>Muito provável</span></div>
      </div>`;
      case 'sim_nao':   return `<div class="g-sim-nao" id="r-${c.id}">
        <button onclick="bnfSelSimNao(this,'${c.id}','sim')" style="flex:1;padding:10px;border:2px solid var(--border-color,#e2e8f0);border-radius:8px;font-size:13px;cursor:pointer;background:transparent;font-weight:700;transition:all .15s">✅ Sim</button>
        <button onclick="bnfSelSimNao(this,'${c.id}','nao')" style="flex:1;padding:10px;border:2px solid var(--border-color,#e2e8f0);border-radius:8px;font-size:13px;cursor:pointer;background:transparent;font-weight:700;transition:all .15s">❌ Não</button>
        <input type="hidden" id="rhid-${c.id}" value="" /></div>`;
      case 'upload':    return `<input type="file" id="r-${c.id}" style="width:100%;padding:8px;border:2px dashed var(--border-color,#e2e8f0);border-radius:8px">`;
      default: return '';
    }
  }

  // ─── RESULTADOS / RESPOSTAS ────────────────────────────────
  function _renderRespostas(form) {
    if (!form) return '';
    const db       = BonifDB.get();
    const respostas = db.form_respostas.filter(r => r.form_id === form.id);
    const total    = respostas.length;

    if (total === 0) return `
<div>
  <button class="dp-btn dp-btn-secondary" onclick="bnfFormVoltar()" style="margin-bottom:16px">← Voltar</button>
  <div class="bnf-card"><div class="bnf-empty"><span class="bnf-empty-icon">📊</span><p>Nenhuma resposta recebida ainda</p><small>Compartilhe o formulário para começar a coletar dados.</small></div></div>
</div>`;

    return `
<div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button class="dp-btn dp-btn-secondary" onclick="bnfFormVoltar()">← Voltar</button>
    <h3 style="margin:0;font-size:15px;font-weight:700">Respostas: ${form.titulo}</h3>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="dp-btn dp-btn-secondary" onclick="bnfExportarRespostas('${form.id}')">📊 Exportar CSV</button>
    </div>
  </div>

  <!-- Summary cards -->
  <div class="bnf-kpis" style="margin-bottom:16px">
    <div class="bnf-kpi bnf-kpi-blue"><span class="bnf-kpi-icon">✍️</span><span class="bnf-kpi-val">${total}</span><span class="bnf-kpi-label">Total de respostas</span></div>
    <div class="bnf-kpi bnf-kpi-green"><span class="bnf-kpi-icon">✅</span><span class="bnf-kpi-val">100%</span><span class="bnf-kpi-label">Taxa de conclusão</span></div>
    ${_calcNPS(respostas, form) !== null ? `<div class="bnf-kpi bnf-kpi-purple"><span class="bnf-kpi-icon">📊</span><span class="bnf-kpi-val">${_calcNPS(respostas, form)}</span><span class="bnf-kpi-label">NPS médio</span></div>` : ''}
  </div>

  <!-- Gráficos por campo -->
  <div style="display:flex;flex-direction:column;gap:14px">
    ${form.campos.map(c => _graficoCampo(c, respostas)).join('')}
  </div>

  <!-- Respostas individuais (texto/parágrafo) -->
  ${_respostasTexto(form.campos, respostas)}
</div>`;
  }

  function _graficoCampo(c, respostas) {
    if (['texto','paragrafo','upload'].includes(c.tipo)) return '';
    const vals = respostas.map(r => r.respostas[c.id]).filter(v => v != null && v !== '');
    if (vals.length === 0) return '';

    let chartHTML = '';
    if (c.tipo === 'multipla') {
      const counts = {};
      (c.opcoes||[]).forEach(o => counts[o] = 0);
      vals.forEach(v => { if (counts[v] !== undefined) counts[v]++; });
      const max = Math.max(...Object.values(counts), 1);
      chartHTML = `<div class="bnf-chart">${Object.entries(counts).map(([label,cnt]) => `
        <div class="bnf-bar-row">
          <span class="bnf-bar-label" title="${label}">${label}</span>
          <div class="bnf-bar-wrap"><div class="bnf-bar-fill" style="width:${Math.round(cnt/max*100)}%;background:var(--primary,#2563eb)"></div></div>
          <span class="bnf-bar-pct">${cnt} (${Math.round(cnt/vals.length*100)}%)</span>
        </div>`).join('')}</div>`;
    } else if (c.tipo === 'escala') {
      const avg = (vals.reduce((s,v)=>s+Number(v),0)/vals.length).toFixed(1);
      const counts = {1:0,2:0,3:0,4:0,5:0};
      vals.forEach(v => { if (counts[v] !== undefined) counts[v]++; });
      const max = Math.max(...Object.values(counts),1);
      chartHTML = `
        <div style="text-align:center;margin-bottom:10px"><span style="font-size:32px;font-weight:900;color:var(--primary)">${avg}</span><small style="color:var(--text-muted)">/5.0</small></div>
        <div class="bnf-chart">${Object.entries(counts).map(([n,cnt])=>`
          <div class="bnf-bar-row">
            <span class="bnf-bar-label">⭐ ${n}</span>
            <div class="bnf-bar-wrap"><div class="bnf-bar-fill" style="width:${Math.round(cnt/max*100)}%;background:#f59e0b"></div></div>
            <span class="bnf-bar-pct">${cnt}</span>
          </div>`).join('')}</div>`;
    } else if (c.tipo === 'nps') {
      const nums  = vals.map(Number);
      const promo = nums.filter(n=>n>=9).length;
      const detrat= nums.filter(n=>n<=6).length;
      const nps   = Math.round(((promo-detrat)/nums.length)*100);
      const avg   = (nums.reduce((s,v)=>s+v,0)/nums.length).toFixed(1);
      chartHTML = `
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px">
          <div style="text-align:center"><div style="font-size:28px;font-weight:900;color:${nps>=50?'#16a34a':nps>=0?'#b45309':'#dc2626'}">${nps}</div><small style="color:var(--text-muted)">NPS Score</small></div>
          <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:#16a34a">${promo}</div><small style="color:var(--text-muted)">Promotores (9–10)</small></div>
          <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:#dc2626">${detrat}</div><small style="color:var(--text-muted)">Detratores (0–6)</small></div>
          <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--primary)">${avg}</div><small style="color:var(--text-muted)">Média</small></div>
        </div>`;
    } else if (c.tipo === 'sim_nao') {
      const sim = vals.filter(v=>v==='sim').length;
      const nao = vals.filter(v=>v==='nao').length;
      chartHTML = `<div class="bnf-chart">
        <div class="bnf-bar-row"><span class="bnf-bar-label">✅ Sim</span><div class="bnf-bar-wrap"><div class="bnf-bar-fill" style="width:${Math.round(sim/vals.length*100)}%;background:#22c55e"></div></div><span class="bnf-bar-pct">${sim}</span></div>
        <div class="bnf-bar-row"><span class="bnf-bar-label">❌ Não</span><div class="bnf-bar-wrap"><div class="bnf-bar-fill" style="width:${Math.round(nao/vals.length*100)}%;background:#ef4444"></div></div><span class="bnf-bar-pct">${nao}</span></div>
      </div>`;
    }

    return `<div class="bnf-card"><div class="bnf-card-hd"><h4>${c.label}</h4><small style="color:var(--text-muted)">${vals.length} resposta(s)</small></div>${chartHTML}</div>`;
  }

  function _respostasTexto(campos, respostas) {
    const textCampos = campos.filter(c => c.tipo === 'texto' || c.tipo === 'paragrafo');
    if (textCampos.length === 0) return '';
    return `<div class="bnf-card"><div class="bnf-card-hd"><h4>💬 Respostas Abertas</h4></div>
      ${textCampos.map(c => {
        const vals = respostas.map(r => r.respostas[c.id]).filter(v=>v?.trim());
        if (!vals.length) return '';
        return `<div style="margin-bottom:16px">
          <strong style="font-size:13px;display:block;margin-bottom:8px">${c.label}</strong>
          ${vals.map(v=>`<div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:6px;border-left:3px solid var(--primary,#2563eb)">"${v}"</div>`).join('')}
        </div>`;
      }).join('')}</div>`;
  }

  function _calcNPS(respostas, form) {
    const npsCampo = form.campos.find(c => c.tipo === 'nps');
    if (!npsCampo) return null;
    const vals = respostas.map(r => Number(r.respostas[npsCampo.id])).filter(v => !isNaN(v));
    if (!vals.length) return null;
    const promo  = vals.filter(v=>v>=9).length;
    const detrat = vals.filter(v=>v<=6).length;
    return Math.round(((promo-detrat)/vals.length)*100);
  }

  // ─── GLOBAIS ──────────────────────────────────────────────
  window.bnfFormNovo = function() {
    _formEd = null; _campos = []; _campoSel = null;
    _view = 'builder'; _refresh();
  };

  window.bnfFormNovoPreset = function(tipo) {
    _formEd = { tipo, modo:'anonimo', titulo: tipo==='clima'?'Pesquisa de Clima':'NPS Rápido', descricao:'' };
    _campos = tipo === 'clima' ? [
      { id:'p1', tipo:'escala',  label:'Satisfação geral com a empresa',           obrigatorio:true,  opcoes:null, condicional:null, ordem:1 },
      { id:'p2', tipo:'nps',     label:'Recomendaria a empresa para um amigo?',    obrigatorio:true,  opcoes:null, condicional:null, ordem:2 },
      { id:'p3', tipo:'multipla',label:'O que mais precisa melhorar?',              obrigatorio:false, opcoes:['Comunicação','Benefícios','Liderança','Carreira','Ambiente'], condicional:null, ordem:3 },
      { id:'p4', tipo:'paragrafo',label:'Deixe sua sugestão',                       obrigatorio:false, opcoes:null, condicional:null, ordem:4 },
    ] : [
      { id:'n1', tipo:'nps',     label:'Em uma escala de 0 a 10, o quanto você nos recomendaria?', obrigatorio:true, opcoes:null, condicional:null, ordem:1 },
      { id:'n2', tipo:'paragrafo',label:'Por qual motivo você deu essa nota?',     obrigatorio:false, opcoes:null, condicional:null, ordem:2 },
    ];
    _campoSel = null; _view = 'builder'; _refresh();
  };

  window.bnfEditarForm = function(id) {
    const f = BonifDB.get().forms.find(x => x.id === id);
    if (!f) return;
    _formEd  = { ...f };
    _campos  = JSON.parse(JSON.stringify(f.campos || []));
    _campoSel= null; _view = 'builder'; _refresh();
  };

  window.bnfFormVoltar = function() { _view = 'lista'; _refresh(); };

  window.bnfFormPreview = function() {
    _coletarMeta();
    _view = 'responder';
    _formEd = _formEd || {};
    _formEd.campos = _campos;
    _refresh();
  };

  window.bnfAddCampo = function(tipo) {
    const c = { id:'c_'+Date.now(), tipo, label:'', obrigatorio:false, opcoes: tipo==='multipla'?['Opção 1','Opção 2']:null, condicional:null, ordem:_campos.length+1 };
    _campos.push(c); _campoSel = c; _refresh();
  };

  window.bnfSelCampo = function(id) {
    _campoSel = _campos.find(c => c.id === id) || null;
    document.querySelectorAll('.bnf-campo-card').forEach(el => el.classList.remove('selecionado'));
    document.getElementById('fc-'+id)?.classList.add('selecionado');
    const pb = document.getElementById('bnf-props-body');
    if (pb && _campoSel) pb.innerHTML = _renderProps(_campoSel);
  };

  window.bnfRemCampo = function(id) {
    _campos = _campos.filter(c => c.id !== id);
    if (_campoSel?.id === id) _campoSel = null;
    _refresh();
  };

  window.bnfMoverCampo = function(id, dir) {
    const idx = _campos.findIndex(c => c.id === id);
    const toIdx = idx + dir;
    if (toIdx < 0 || toIdx >= _campos.length) return;
    [_campos[idx], _campos[toIdx]] = [_campos[toIdx], _campos[idx]];
    _refresh();
  };

  window.bnfUpdateProp = function(key, val) {
    if (!_campoSel) return;
    _campoSel[key] = val;
    const cidx = _campos.findIndex(c => c.id === _campoSel.id);
    if (cidx >= 0) _campos[cidx] = { ..._campoSel };
    const card = document.getElementById('fc-' + _campoSel.id);
    if (card) card.outerHTML = _renderCampoCanvas(_campoSel, cidx);
  };

  window.bnfAddCondicional = function(campoId) {
    if (_campos.length < 2) { alert('Adicione mais campos para criar condicionais.'); return; }
    const outros = _campos.filter(c => c.id !== campoId);
    const ref    = outros[0];
    const cidx   = _campos.findIndex(c => c.id === campoId);
    if (cidx >= 0) { _campos[cidx].condicional = { campo_id: ref.id, valor: 'sim' }; if (_campoSel?.id===campoId) _campoSel = _campos[cidx]; }
    _refresh();
  };

  function _coletarMeta() {
    if (!_formEd) _formEd = {};
    _formEd.titulo     = document.getElementById('bnf-form-titulo')?.value?.trim() || _formEd.titulo || 'Formulário';
    _formEd.descricao  = document.getElementById('bnf-form-desc')?.value?.trim()  || '';
    _formEd.tipo       = document.getElementById('bnf-form-tipo')?.value           || 'custom';
    _formEd.modo       = document.getElementById('bnf-form-modo')?.value           || 'anonimo';
    _formEd.agendamento= { inicio: document.getElementById('bnf-form-inicio')?.value || '', fim: document.getElementById('bnf-form-fim')?.value || '' };
  }

  window.bnfFormSalvar = function() {
    _coletarMeta();
    if (!_formEd?.titulo) { alert('Informe o título do formulário.'); return; }
    if (_campos.length === 0) { alert('Adicione pelo menos um campo.'); return; }
    const camposComLabel = _campos.filter(c => c.label?.trim());
    if (camposComLabel.length < _campos.length) { if (!confirm('Alguns campos estão sem título. Salvar mesmo assim?')) return; }
    const id = _formEd.id || 'FORM_'+Date.now();
    const form = {
      id, titulo:_formEd.titulo, descricao:_formEd.descricao||'',
      tipo:_formEd.tipo||'custom', modo:_formEd.modo||'anonimo',
      status: _formEd.status||'ativo',
      agendamento:_formEd.agendamento||{inicio:'',fim:''},
      envio:{email:true,whatsapp:false,interno:true},
      campos: _campos.map((c,i)=>({...c,ordem:i+1})),
      respostas_count: _formEd.respostas_count||0,
      criado_por:_formEd.criado_por||_userNome(),
      criado_em:_formEd.criado_em||new Date().toISOString(),
    };
    BonifDB.upsert('forms', form);
    BonifDB.addAuditoria('form_salvo', `Formulário "${form.titulo}" (${id})`);
    _view = 'lista'; _refresh();
    _toast('✅ Formulário salvo com sucesso!');
  };

  window.bnfToggleStatus = function(id) {
    const db = BonifDB.get();
    const f  = db.forms.find(x=>x.id===id);
    if (!f) return;
    f.status = f.status==='ativo'?'encerrado':'ativo';
    BonifDB.upsert('forms',f);
    _refresh();
  };

  window.bnfExcluirForm = function(id) {
    if (!confirm('Excluir este formulário? Todas as respostas serão perdidas.')) return;
    BonifDB.remove('forms',id);
    const db = BonifDB.get();
    db.form_respostas = db.form_respostas.filter(r=>r.form_id!==id);
    BonifDB.set(db);
    _refresh();
  };

  window.bnfResponderForm = function(id) {
    const f = BonifDB.get().forms.find(x=>x.id===id);
    if (!f) return;
    _formEd = f; _view = 'responder'; _refresh();
  };

  window.bnfVerRespostas = function(id) {
    const f = BonifDB.get().forms.find(x=>x.id===id);
    if (!f) return;
    _formEd = f; _view = 'respostas'; _refresh();
  };

  // Handlers de resposta
  window.bnfSelOpcao = function(el, campoId, valor) {
    const wrapper = el.parentElement;
    wrapper.querySelectorAll('.bnf-mc-opt').forEach(o => o.classList.remove('selecionada'));
    el.classList.add('selecionada');
    let inp = document.getElementById('rhid-'+campoId);
    if (!inp) { inp = document.createElement('input'); inp.type='hidden'; inp.id='rhid-'+campoId; wrapper.appendChild(inp); }
    inp.value = valor;
  };
  window.bnfSelEscala = function(el, campoId, val) {
    const row = el.parentElement;
    row.querySelectorAll('.bnf-scale-dot').forEach((d,i)=>{ d.style.background=i<val?'var(--primary,#2563eb)':''; d.style.color=i<val?'#fff':''; d.style.borderColor=i<val?'var(--primary,#2563eb)':''; });
    const inp = document.getElementById('rhid-'+campoId);
    if (inp) inp.value = val;
  };
  window.bnfSelNps = function(el, campoId, val) {
    const row = el.parentElement;
    row.querySelectorAll('.bnf-nps-num').forEach(d=>d.style.fontWeight='');
    el.style.fontWeight = '900';
    const inp = document.getElementById('rhid-'+campoId);
    if (inp) inp.value = val;
  };
  window.bnfSelSimNao = function(btn, campoId, val) {
    const row = btn.parentElement;
    row.querySelectorAll('button').forEach(b=>{ b.style.background='transparent';b.style.borderColor='var(--border-color,#e2e8f0)'; });
    btn.style.background = val==='sim'?'#f0fdf4':'#fef2f2';
    btn.style.borderColor= val==='sim'?'#22c55e':'#ef4444';
    const inp = document.getElementById('rhid-'+campoId);
    if (inp) inp.value = val;
  };

  window.bnfEnviarResposta = function(formId) {
    const f = BonifDB.get().forms.find(x=>x.id===formId);
    if (!f) return;
    const respostas = {};
    let ok = true;
    f.campos.forEach(c => {
      const el  = document.getElementById('r-'+c.id) || document.getElementById('rhid-'+c.id);
      const val = el?.value?.trim() || '';
      if (c.obrigatorio && !val) { ok=false; document.getElementById('cq-'+c.id)?.scrollIntoView({behavior:'smooth'}); _toast('⚠️ Preencha todos os campos obrigatórios.','warn'); return; }
      respostas[c.id] = val;
    });
    if (!ok) return;
    const resp = { id:'RESP_'+Date.now(), form_id:formId, colaborador_id:null, respostas, em:new Date().toISOString() };
    const db = BonifDB.get();
    db.form_respostas.push(resp);
    const fi = db.forms.findIndex(x=>x.id===formId);
    if (fi>=0) db.forms[fi].respostas_count = (db.forms[fi].respostas_count||0)+1;
    BonifDB.set(db);
    _toast('✅ Resposta enviada! Obrigado pela participação.');
    setTimeout(()=>{ _view='lista';_refresh(); },1500);
  };

  window.bnfExportarRespostas = function(formId) {
    const db = BonifDB.get();
    const f  = db.forms.find(x=>x.id===formId);
    if (!f) return;
    const resps = db.form_respostas.filter(r=>r.form_id===formId);
    const headers = ['ID','Data',...f.campos.map(c=>c.label)];
    const linhas  = [headers.join(','),...resps.map(r=>[r.id,r.em,...f.campos.map(c=>`"${r.respostas[c.id]||''}"`)].join(','))];
    const blob = new Blob([linhas.join('\n')],{type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`respostas_${formId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  function _bindBuilderEvents() {}

  function _nomeTipo(t) {
    return {clima:'🌡️ Clima',avaliacao:'📋 Avaliação',feedback:'💬 Feedback',nps:'📊 NPS',custom:'📝 Personalizado'}[t]||t;
  }

  function _toast(msg, tipo='ok') {
    document.querySelectorAll('.bnf-toast').forEach(e=>e.remove());
    const el = document.createElement('div');
    el.className = `dpa-toast dpa-toast-${tipo} bnf-toast`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300);},3500);
  }

  return { render };
})();
