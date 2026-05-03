/**
 * gestor-documentos.js — Documentos do Gestor
 * Termo de Home Office · Advertências emitidas · Modelos RH
 * Expõe: window.GestorDocumentos
 */
window.GestorDocumentos = (() => {
  let _aba = 'home_office';

  // ─── RENDER PRINCIPAL ──────────────────────────────────────
  function render(container) {
    container.innerHTML = _shell();
    _renderAba();
  }

  function _shell() {
    const isRH  = GestorUser.isRH();
    const db    = GestorDB.get();
    const qtdHO = db.termos_ho.length;
    const qtdAdv= db.advertencias.length;

    return `
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div class="g-filter-bar" style="margin:0">
      <button class="g-filter-btn ${_aba==='home_office'?'ativo':''}" onclick="gestorDocAba('home_office')">
        🏠 Termos de Home Office (${qtdHO})
      </button>
      <button class="g-filter-btn ${_aba==='advertencias'?'ativo':''}" onclick="gestorDocAba('advertencias')">
        ⚠️ Advertências emitidas (${qtdAdv})
      </button>
      ${isRH ? `<button class="g-filter-btn ${_aba==='modelos'?'ativo':''}" onclick="gestorDocAba('modelos')">⚙️ Modelos (RH)</button>` : ''}
    </div>
    <button class="dp-btn" onclick="gestorNovoHO()">+ Termo de Home Office</button>
  </div>
  <div id="g-doc-corpo"></div>
</div>`;
  }

  function _renderAba() {
    const el = document.getElementById('g-doc-corpo');
    if (!el) return;
    if (_aba === 'home_office')  el.innerHTML = _renderHO();
    if (_aba === 'advertencias') el.innerHTML = _renderAdvs();
    if (_aba === 'modelos')      el.innerHTML = _renderModelos();
  }

  // ─── TERMOS DE HOME OFFICE ────────────────────────────────
  function _renderHO() {
    const db     = GestorDB.get();
    const colabs = GestorColabs.getBySector();
    const isRH   = GestorUser.isRH();
    const lista  = db.termos_ho.filter(t =>
      isRH ? true : colabs.find(c => c.id === t.colaborador_id));

    if (lista.length === 0) return `
      <div class="g-card">
        <div class="g-empty">
          <span class="g-empty-icon">🏠</span>
          <p>Nenhum termo de home office gerado</p>
          <small>Clique em "+ Termo de Home Office" para criar o primeiro.</small>
        </div>
      </div>`;

    return `
<div class="g-table-wrap">
  <table class="g-table">
    <thead><tr>
      <th>Colaborador</th><th>Período</th><th>Modalidade</th>
      <th>Gerado por</th><th>Data</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${lista.map(t => `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="g-avatar" style="width:28px;height:28px;font-size:10px;background:#06b6d4">${GestorFmt.ini(t.colaborador_nome)}</div>
              <div>
                <strong>${t.colaborador_nome}</strong>
                <small style="display:block;color:var(--text-muted)">${t.setor || ''}</small>
              </div>
            </div>
          </td>
          <td>
            <strong>${GestorFmt.data(t.periodo_inicio)}</strong>
            <small style="display:block;color:var(--text-muted)">até ${GestorFmt.data(t.periodo_fim)}</small>
          </td>
          <td>
            <span style="font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(6,182,212,.1);color:#0e7490;font-weight:700">
              ${t.modalidade || 'Home Office'}
            </span>
          </td>
          <td>${t.gestor || '—'}</td>
          <td>${GestorFmt.data(t.em)}</td>
          <td style="white-space:nowrap">
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorVerHO('${t.id}')">👁️ Ver</button>
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px;margin-left:4px" onclick="gestorImprimirHO('${t.id}')">🖨️</button>
            ${isRH ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;padding:4px 8px" onclick="gestorExcluirHO('${t.id}')">🗑️</button>` : ''}
          </td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>`;
  }

  // ─── ADVERTÊNCIAS EMITIDAS ────────────────────────────────
  function _renderAdvs() {
    const db     = GestorDB.get();
    const colabs = GestorColabs.getBySector();
    const isRH   = GestorUser.isRH();
    const lista  = db.advertencias.filter(a =>
      isRH ? true : colabs.find(c => c.id === a.colaborador_id));

    if (lista.length === 0) return `
      <div class="g-card">
        <div class="g-empty">
          <span class="g-empty-icon">⚠️</span>
          <p>Nenhuma advertência emitida</p>
          <small>Advertências são geradas na aba Ocorrências.</small>
        </div>
      </div>`;

    const corAdv = { advertencia_verbal:'#f59e0b', advertencia_escrita:'#ef4444', suspensao:'#7c3aed' };
    const lblAdv = { advertencia_verbal:'Verbal', advertencia_escrita:'Por Escrito', suspensao:'Suspensão' };

    return `
<div class="g-table-wrap">
  <table class="g-table">
    <thead><tr>
      <th>Colaborador</th><th>Tipo</th><th>Motivo (resumo)</th>
      <th>Emitida por</th><th>Data</th><th>Doc.</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${lista.map(a => `
        <tr>
          <td><strong>${a.colaborador_nome}</strong></td>
          <td>
            <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:${corAdv[a.tipo]||'#94a3b8'}20;color:${corAdv[a.tipo]||'#94a3b8'};border:1px solid ${corAdv[a.tipo]||'#94a3b8'}40">
              ${lblAdv[a.tipo]||a.tipo}
            </span>
          </td>
          <td><span style="font-size:12px;color:var(--text-muted)">${(a.motivo||'').slice(0,60)}${(a.motivo||'').length>60?'…':''}</span></td>
          <td>${a.gestor||'—'}</td>
          <td>${GestorFmt.data(a.em)}</td>
          <td>${a.doc_gerado ? '<span style="color:#16a34a;font-size:12px;font-weight:700">✅</span>' : '<span style="color:#94a3b8">—</span>'}</td>
          <td style="white-space:nowrap">
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorVerDocAdv('${a.id}')">👁️ Ver</button>
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px;margin-left:4px" onclick="gestorImprimirDocAdv('${a.id}')">🖨️</button>
          </td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>`;
  }

  // ─── MODELOS (RH) ─────────────────────────────────────────
  function _renderModelos() {
    const db = GestorDB.get();
    return `
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
  ${db.modelos_doc.map(m => `
    <div class="g-card" style="cursor:default">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
        <div style="font-size:28px">${_iconModelo(m.tipo)}</div>
        <div>
          <strong style="font-size:14px;display:block">${m.nome}</strong>
          <small style="color:var(--text-muted)">${m.tipo}</small>
        </div>
      </div>
      <div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:10px;font-size:11px;font-family:Georgia,serif;color:var(--text-secondary);line-height:1.6;max-height:80px;overflow:hidden;white-space:pre-wrap">
        ${(m.conteudo||'').slice(0,200)}…
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="dp-btn dp-btn-secondary" style="flex:1;font-size:11px" onclick="gestorEditarModelo('${m.id}')">✏️ Editar</button>
        <button class="dp-btn" style="flex:1;font-size:11px" onclick="gestorPreviewModelo('${m.id}')">👁️ Preview</button>
      </div>
    </div>`).join('')}
  <div class="g-card" style="display:flex;align-items:center;justify-content:center;min-height:160px;border:2px dashed var(--border-color,#e2e8f0);background:var(--bg-sidebar,#f8fafc);cursor:pointer" onclick="gestorNovoModelo()">
    <div style="text-align:center;color:var(--text-muted)">
      <div style="font-size:32px;margin-bottom:8px">➕</div>
      <strong style="font-size:13px">Novo Modelo</strong>
    </div>
  </div>
</div>`;
  }

  function _iconModelo(tipo) {
    if (!tipo) return '📄';
    if (tipo.includes('verbal'))   return '💬';
    if (tipo.includes('escrita'))  return '📝';
    if (tipo.includes('suspensao'))return '🚫';
    if (tipo.includes('home'))     return '🏠';
    return '📄';
  }

  // ─── MODAL TERMO DE HOME OFFICE ───────────────────────────
  window.gestorNovoHO = function() {
    const colabs = GestorColabs.getBySector();
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.id = 'g-ho-overlay';
    overlay.innerHTML = `
<div class="g-modal g-modal-lg">
  <div class="g-modal-hd">
    <h3>🏠 Novo Termo de Home Office</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div class="dp-form-grid">
      <div class="dp-field dp-field-full">
        <label>Colaborador <span style="color:#ef4444">*</span></label>
        <select id="gho-colab">
          <option value="">Selecione o colaborador</option>
          ${colabs.map(c => `<option value="${c.id}" data-nome="${c.nome_completo||c.nome}" data-setor="${c.setor||''}">${c.nome_completo||c.nome} — ${c.setor||''}</option>`).join('')}
        </select>
      </div>
      <div class="dp-field">
        <label>Modalidade</label>
        <select id="gho-modalidade">
          <option value="Home Office">Home Office (Integral)</option>
          <option value="Híbrido">Híbrido (parcial)</option>
          <option value="Remoto Temporário">Remoto Temporário</option>
        </select>
      </div>
      <div class="dp-field">
        <label>Dias por semana (se híbrido)</label>
        <select id="gho-dias">
          <option value="">—</option>
          <option value="1 dia/semana">1 dia/semana</option>
          <option value="2 dias/semana">2 dias/semana</option>
          <option value="3 dias/semana">3 dias/semana</option>
          <option value="4 dias/semana">4 dias/semana</option>
        </select>
      </div>
      <div class="dp-field">
        <label>Data de início <span style="color:#ef4444">*</span></label>
        <input type="date" id="gho-inicio" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="dp-field">
        <label>Data de término</label>
        <input type="date" id="gho-fim" />
      </div>
    </div>

    <div class="dp-field" style="margin-top:12px">
      <label>Regras e obrigações do colaborador <span style="color:#ef4444">*</span></label>
      <textarea id="gho-regras" rows="4" style="width:100%;resize:vertical" placeholder="Ex: Manter disponibilidade das 08h às 17h; comparecer presencialmente quando solicitado; garantir ambiente adequado e conexão estável...">${_regrasDefault()}</textarea>
    </div>

    <div class="dp-field" style="margin-top:12px">
      <label>Observações adicionais</label>
      <textarea id="gho-obs" rows="2" style="width:100%;resize:vertical" placeholder="Qualquer observação específica para este colaborador..."></textarea>
    </div>

    <div id="gho-preview-area" style="display:none;margin-top:14px">
      <label style="font-size:12px;font-weight:700;margin-bottom:6px;display:block">📄 Pré-visualização do Documento</label>
      <div class="g-doc-preview" id="gho-preview-txt"></div>
    </div>
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="gestorPreviewHO()">👁️ Pré-visualizar</button>
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
    <button class="dp-btn" onclick="gestorSalvarHO()">📄 Gerar Termo</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  function _regrasDefault() {
    return `1. Manter disponibilidade durante o horário de trabalho (08h–17h);\n2. Atender chamadas e responder mensagens em até 30 minutos;\n3. Participar de reuniões presencialmente quando convocado;\n4. Garantir ambiente silencioso, conexão estável e equipamentos adequados;\n5. Proteger informações sigilosas da empresa fora do ambiente corporativo;\n6. Reportar qualquer incidente de segurança imediatamente ao gestor.`;
  }

  function _gerarTextoHO() {
    const colabEl    = document.getElementById('gho-colab');
    const inicio     = document.getElementById('gho-inicio')?.value;
    const fim        = document.getElementById('gho-fim')?.value;
    const modalidade = document.getElementById('gho-modalidade')?.value || 'Home Office';
    const dias       = document.getElementById('gho-dias')?.value;
    const regras     = document.getElementById('gho-regras')?.value?.trim();
    const obs        = document.getElementById('gho-obs')?.value?.trim();

    if (!colabEl?.value || !inicio || !regras) { alert('Preencha colaborador, data de início e regras.'); return null; }

    const colabNome = colabEl.selectedOptions[0]?.dataset.nome || '';
    const colabSetor= colabEl.selectedOptions[0]?.dataset.setor || '';
    const user      = GestorUser.get();
    const hoje      = new Date().toLocaleDateString('pt-BR');
    const inicioFmt = new Date(inicio + 'T00:00:00').toLocaleDateString('pt-BR');
    const fimFmt    = fim ? new Date(fim + 'T00:00:00').toLocaleDateString('pt-BR') : 'Indeterminado';

    return `TERMO DE AUTORIZAÇÃO PARA TRABALHO EM REGIME DE HOME OFFICE

Empresa: hi Conecta RH
Data de emissão: ${hoje}

DADOS DO COLABORADOR
Colaborador(a): ${colabNome}
Setor: ${colabSetor}

MODALIDADE DE TRABALHO
Regime: ${modalidade}${dias ? ' — ' + dias : ''}
Vigência: ${inicioFmt} até ${fimFmt}

CONDIÇÕES E OBRIGAÇÕES

O(A) colaborador(a) acima identificado(a) fica autorizado(a) a realizar suas atividades em regime de trabalho remoto, devendo observar rigorosamente as seguintes regras:

${regras}

${obs ? 'OBSERVAÇÕES ESPECÍFICAS\n' + obs + '\n' : ''}
RESPONSABILIDADE

O(A) colaborador(a) declara ciência de que o descumprimento das regras acima poderá resultar em revogação imediata deste termo e nas medidas disciplinares cabíveis.

Este termo tem validade a partir da data de assinatura.

____________________________________
${colabNome}
Colaborador(a)
Data: ___/___/______

____________________________________
${user.nome || 'Gestor(a)'}
Gestor(a) Responsável — ${user.setor || colabSetor}
Data: ___/___/______

____________________________________
RH / Departamento Pessoal
Data: ___/___/______`;
  }

  window.gestorPreviewHO = function() {
    const txt = _gerarTextoHO();
    if (!txt) return;
    const area = document.getElementById('gho-preview-area');
    const prev = document.getElementById('gho-preview-txt');
    if (area && prev) { area.style.display = ''; prev.textContent = txt; }
  };

  window.gestorSalvarHO = function() {
    const colabEl = document.getElementById('gho-colab');
    const inicio  = document.getElementById('gho-inicio')?.value;
    const fim     = document.getElementById('gho-fim')?.value;
    const modal   = document.getElementById('gho-modalidade')?.value || 'Home Office';
    const regras  = document.getElementById('gho-regras')?.value?.trim();
    const obs     = document.getElementById('gho-obs')?.value?.trim();
    const texto   = _gerarTextoHO();
    if (!texto) return;

    const colabId   = colabEl.value;
    const colabNome = colabEl.selectedOptions[0]?.dataset.nome || '';
    const colabSetor= colabEl.selectedOptions[0]?.dataset.setor || '';

    const ho = {
      id: 'HO_' + Date.now(),
      colaborador_id: colabId,
      colaborador_nome: colabNome,
      setor: colabSetor,
      periodo_inicio: inicio,
      periodo_fim: fim || '',
      modalidade: modal,
      regras, obs,
      texto_gerado: texto,
      gestor: GestorUser.nome(),
      em: new Date().toISOString(),
    };

    GestorDB.upsert('termos_ho', ho);
    GestorDB.addNotificacao('documento', 'Termo de Home Office gerado',
      `${colabNome} — ${modal} · ${new Date(inicio+'T00:00:00').toLocaleDateString('pt-BR')}`);

    // Timeline
    const db = GestorDB.get();
    if (!db._historico) db._historico = [];
    db._historico.push({
      id: 'HIST_HO_' + Date.now(), colaborador_id: colabId,
      tipo: 'documento', titulo: 'Termo de Home Office gerado',
      descricao: `${modal} — vigência a partir de ${new Date(inicio+'T00:00:00').toLocaleDateString('pt-BR')}`,
      em: ho.em,
    });
    GestorDB.set(db);

    document.getElementById('g-ho-overlay')?.remove();
    _aba = 'home_office';
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
    _showToast('✅ Termo de Home Office gerado com sucesso!');
  };

  window.gestorVerHO = function(id) {
    const t = GestorDB.get().termos_ho.find(x => x.id === id);
    if (!t) return;
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
<div class="g-modal g-modal-lg">
  <div class="g-modal-hd">
    <h3>🏠 Termo de HO — ${t.colaborador_nome}</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div class="g-doc-preview">${t.texto_gerado || 'Documento não disponível.'}</div>
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
    <button class="dp-btn" onclick="window.print()">🖨️ Imprimir</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  window.gestorImprimirHO     = (id) => { gestorVerHO(id); setTimeout(() => window.print(), 300); };
  window.gestorImprimirDocAdv = (id) => { gestorVerDocAdv(id); setTimeout(() => window.print(), 300); };

  window.gestorVerDocAdv = function(id) {
    const a = GestorDB.get().advertencias.find(x => x.id === id);
    if (!a) return;
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
<div class="g-modal g-modal-lg">
  <div class="g-modal-hd">
    <h3>⚠️ ${a.modelo_nome||'Advertência'} — ${a.colaborador_nome}</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div class="g-doc-preview">${a.texto_gerado || 'Documento não disponível.'}</div>
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
    <button class="dp-btn" onclick="window.print()">🖨️ Imprimir</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  window.gestorExcluirHO = function(id) {
    if (!confirm('Excluir este termo de home office?')) return;
    GestorDB.remove('termos_ho', id);
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorPreviewModelo = function(id) {
    const m = GestorDB.get().modelos_doc.find(x => x.id === id);
    if (!m) return;
    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
<div class="g-modal g-modal-lg">
  <div class="g-modal-hd">
    <h3>${m.nome}</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div class="g-alert g-alert-info"><span>ℹ️</span><span>Variáveis disponíveis: {colaborador}, {gestor}, {setor}, {empresa}, {data}, {motivo}</span></div>
    <div class="g-doc-preview" style="margin-top:12px">${m.conteudo||''}</div>
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
    <button class="dp-btn" onclick="gestorEditarModelo('${m.id}');this.closest('.g-overlay').remove()">✏️ Editar</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  window.gestorDocAba = function(aba) {
    _aba = aba;
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  function _showToast(msg) {
    document.querySelectorAll('.g-toast').forEach(e => e.remove());
    const el = document.createElement('div');
    el.className = 'dpa-toast dpa-toast-ok g-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  return { render };
})();
