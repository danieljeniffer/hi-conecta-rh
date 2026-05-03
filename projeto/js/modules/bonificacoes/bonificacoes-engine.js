/**
 * bonificacoes-engine.js — Planilha de Bonificações
 * Interface estilo planilha com CRUD completo e cálculo em tempo real
 * Expõe: window.BonifEngine
 */
window.BonifEngine = (() => {

  // ─── ESTADO ───────────────────────────────────────────────
  let _mes      = new Date().toISOString().slice(0, 7);  // 'YYYY-MM'
  let _filtro   = 'todos';   // 'todos' | 'pendente' | 'aprovado' | 'pago' | 'cancelado'
  let _container= null;
  let _editId   = null;      // id do lançamento em edição

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    _container = container;
    _draw();
  }

  function _draw() {
    if (!_container) return;
    _container.innerHTML = _html();
  }

  function _html() {
    const db        = BonifDB.get();
    const colabs    = BonifColabs.getAll();
    const tipos     = db.bonus_tipos.filter(t => t.ativo);
    const todos     = db.lancamentos.filter(l => l.mes === _mes);
    const lista     = _filtro === 'todos' ? todos : todos.filter(l => l.status === _filtro);

    // Totais por status
    const cnt = {
      total:    todos.length,
      pendente: todos.filter(l => l.status === 'pendente').length,
      aprovado: todos.filter(l => l.status === 'aprovado').length,
      pago:     todos.filter(l => l.status === 'pago').length,
      cancelado:todos.filter(l => l.status === 'cancelado').length,
    };

    // Valor total dos lançamentos visíveis
    const somaTotal     = lista.reduce((s, l) => s + (l.valor_final || 0), 0);
    const somaAprovados = todos.filter(l => l.status === 'aprovado' || l.status === 'pago')
                               .reduce((s, l) => s + (l.valor_final || 0), 0);

    // Meses disponíveis para o selector
    const meses = _gerarMeses();

    return `
<div class="bnf-plan-root">

  <!-- ── CABEÇALHO DA PLANILHA ── -->
  <div class="bnf-plan-hd">
    <div class="bnf-plan-hd-left">
      <div class="bnf-plan-title">
        <span class="bnf-plan-icon">💰</span>
        <div>
          <h3>Planilha de Bonificações</h3>
          <small>Adicione, edite e calcule bônus por período</small>
        </div>
      </div>

      <!-- Selector de período -->
      <div class="bnf-plan-periodo">
        <label>Período:</label>
        <select id="bnf-plan-mes" onchange="bnfPlanMes(this.value)">
          ${meses.map(m => `<option value="${m.val}" ${m.val === _mes ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="bnf-plan-hd-right">
      <button class="dp-btn dp-btn-secondary" onclick="bnfPlanAutoGerar()" title="Aplica as regras configuradas automaticamente">
        ⚡ Gerar Automático
      </button>
      <button class="dp-btn" onclick="bnfPlanNovo()">
        + Adicionar Bônus
      </button>
    </div>
  </div>

  <!-- ── KPIs RÁPIDOS ── -->
  <div class="bnf-plan-kpis">
    <div class="bnf-plan-kpi bnf-plan-kpi-blue"   onclick="bnfPlanFiltro('todos')"    style="cursor:pointer">
      <span>${cnt.total}</span><small>Total de lançamentos</small>
    </div>
    <div class="bnf-plan-kpi bnf-plan-kpi-yellow"  onclick="bnfPlanFiltro('pendente')" style="cursor:pointer">
      <span>${cnt.pendente}</span><small>Pendentes</small>
    </div>
    <div class="bnf-plan-kpi bnf-plan-kpi-green"   onclick="bnfPlanFiltro('aprovado')" style="cursor:pointer">
      <span>${cnt.aprovado}</span><small>Aprovados</small>
    </div>
    <div class="bnf-plan-kpi bnf-plan-kpi-teal"    onclick="bnfPlanFiltro('pago')"     style="cursor:pointer">
      <span>${cnt.pago}</span><small>Pagos</small>
    </div>
    <div class="bnf-plan-kpi bnf-plan-kpi-purple">
      <span>${BonifFmt.moeda(somaAprovados)}</span><small>Aprovados + Pagos</small>
    </div>
  </div>

  <!-- Filtros de status -->
  <div class="bnf-plan-filtros">
    ${['todos','pendente','aprovado','pago','cancelado'].map(s => `
      <button class="bnf-plan-filtro-btn ${_filtro === s ? 'ativo' : ''}" onclick="bnfPlanFiltro('${s}')">
        ${_statusIcon(s)} ${s.charAt(0).toUpperCase()+s.slice(1)}
        ${s !== 'todos' ? `<span class="bnf-plan-cnt">${cnt[s]||0}</span>` : ''}
      </button>`).join('')}
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      ${lista.length > 0 && (window.Auth?.isRH() ?? true) ? `
        <button class="dp-btn dp-btn-secondary" style="font-size:11px" onclick="bnfPlanAprovarTodos()">✅ Aprovar todos pendentes</button>` : ''}
      <div style="position:relative">
        <button class="dp-btn dp-btn-secondary" style="font-size:11px;display:flex;align-items:center;gap:5px" onclick="bnfToggleExportMenu('bnf-plan-emenu')">
          ⬇️ Exportar <span style="font-size:9px;opacity:.7">▾</span>
        </button>
        <div id="bnf-plan-emenu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid var(--border-color,#e2e8f0);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:200;min-width:170px;overflow:hidden">
          <button onclick="bnfPlanExportarExcel();bnfToggleExportMenu('bnf-plan-emenu')" style="display:flex;align-items:center;gap:9px;padding:10px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left;transition:background .12s" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='transparent'">🟢 Excel (.xlsx)</button>
          <button onclick="bnfPlanExportarPDF();bnfToggleExportMenu('bnf-plan-emenu')" style="display:flex;align-items:center;gap:9px;padding:10px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left;transition:background .12s" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">🔴 PDF (.pdf)</button>
          <button onclick="bnfPlanExportarWord();bnfToggleExportMenu('bnf-plan-emenu')" style="display:flex;align-items:center;gap:9px;padding:10px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left;transition:background .12s" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">🔵 Word (.doc)</button>
          <div style="height:1px;background:var(--border-color,#e2e8f0);margin:2px 0"></div>
          <button onclick="bnfPlanExportar();bnfToggleExportMenu('bnf-plan-emenu')" style="display:flex;align-items:center;gap:9px;padding:10px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left;color:var(--text-muted,#64748b);transition:background .12s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">⬜ CSV</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── PLANILHA ── -->
  <div class="bnf-plan-table-wrap">
    <table class="bnf-plan-table" id="bnf-plan-table">
      <thead>
        <tr>
          <th class="bnf-th-num">#</th>
          <th>Colaborador</th>
          <th>Cargo / Setor</th>
          <th class="bnf-th-num">Salário Base</th>
          <th>Tipo de Bônus</th>
          <th>Motivo / Descrição</th>
          <th class="bnf-th-num">Cálculo</th>
          <th class="bnf-th-num">% ou Valor</th>
          <th class="bnf-th-num bnf-col-valor">Bônus (R$)</th>
          <th>Status</th>
          <th class="bnf-th-acoes">Ações</th>
        </tr>
      </thead>
      <tbody id="bnf-plan-tbody">
        ${lista.length === 0
          ? `<tr><td colspan="11" class="bnf-plan-empty">
              <div>
                <span>📋</span>
                <p>Nenhum lançamento em ${BonifFmt.mesNome(_mes)}</p>
                <small>Clique em <strong>+ Adicionar Bônus</strong> ou <strong>⚡ Gerar Automático</strong></small>
              </div>
            </td></tr>`
          : lista.map((l, i) => _rowLancamento(l, i + 1)).join('')}
      </tbody>

      <!-- ── RODAPÉ COM TOTAIS ── -->
      ${lista.length > 0 ? `
      <tfoot>
        ${_footerTotais(lista)}
        <tr class="bnf-plan-grand-total">
          <td colspan="8" style="text-align:right;padding-right:16px;font-size:13px;font-weight:700">
            TOTAL GERAL DO PERÍODO
            <small style="font-weight:400;color:rgba(255,255,255,.7);margin-left:8px">(${lista.length} lançamento${lista.length>1?'s':''})</small>
          </td>
          <td class="bnf-td-valor bnf-grand-val">${BonifFmt.moeda(somaTotal)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>` : ''}
    </table>
  </div>

  <!-- ── PAINEL LATERAL DE INSIGHTS ── -->
  ${lista.length > 0 ? _painelInsights(lista, todos) : ''}

</div>`;
  }

  // ─── ROW DA PLANILHA ──────────────────────────────────────
  function _rowLancamento(l, num) {
    const isRH   = window.Auth?.isRH() ?? true;
    const corSt  = { pendente:'#f59e0b', aprovado:'#22c55e', pago:'#06b6d4', cancelado:'#94a3b8' };
    const ini    = BonifFmt.ini(l.colaborador_nome);
    const calLabel = l.calculo_tipo === 'percentual' ? `${l.percentual||0}% s/ sal.` : 'Fixo';
    const entradaLabel = l.calculo_tipo === 'percentual' ? `${l.percentual||0}%` : `${BonifFmt.moeda(l.valor_final)}`;

    return `
<tr class="bnf-plan-row bnf-plan-row-${l.status}" data-id="${l.id}">
  <td class="bnf-td-num bnf-td-muted">${num}</td>
  <td>
    <div class="bnf-plan-colab-cell">
      <div class="bnf-plan-avatar" style="background:${corSt[l.status]||'#94a3b8'}">${ini}</div>
      <div>
        <strong>${l.colaborador_nome}</strong>
        ${l.origem === 'automatico' ? '<span class="bnf-plan-badge-auto">⚡ auto</span>' : ''}
      </div>
    </div>
  </td>
  <td class="bnf-td-muted">
    <div style="font-size:12px">${l.cargo||'—'}</div>
    <div style="font-size:11px;color:var(--text-muted)">${l.setor||'—'}</div>
  </td>
  <td class="bnf-td-num">${BonifFmt.moeda(l.salario_base||0)}</td>
  <td>
    <span class="bnf-plan-tipo-chip" style="background:${_corTipo(l.tipo_id)}18;border:1px solid ${_corTipo(l.tipo_id)}30;color:${_corTipo(l.tipo_id)}">
      ${l.tipo_icon||'💰'} ${l.tipo_nome||'—'}
    </span>
  </td>
  <td class="bnf-td-muted">
    <span title="${l.descricao||''}" style="display:block;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">
      ${l.descricao||'—'}
    </span>
  </td>
  <td class="bnf-td-num">
    <span class="bnf-plan-calc-badge">${calLabel}</span>
  </td>
  <td class="bnf-td-num">${entradaLabel}</td>
  <td class="bnf-td-num bnf-col-valor">
    <strong class="bnf-plan-valor">${BonifFmt.moeda(l.valor_final||0)}</strong>
  </td>
  <td>
    <span class="bnf-plan-status" style="background:${corSt[l.status]||'#94a3b8'}18;color:${corSt[l.status]||'#94a3b8'};border:1px solid ${corSt[l.status]||'#94a3b8'}30">
      ${_statusIcon(l.status)} ${l.status}
    </span>
  </td>
  <td class="bnf-td-acoes">
    ${l.status !== 'pago' ? `<button class="bnf-plan-btn-acao bnf-btn-edit" onclick="bnfPlanEditar('${l.id}')" title="Editar">✏️</button>` : ''}
    ${l.status === 'pendente' && isRH ? `<button class="bnf-plan-btn-acao bnf-btn-ok" onclick="bnfPlanAprovar('${l.id}')" title="Aprovar">✅</button>` : ''}
    ${l.status === 'aprovado' && isRH ? `<button class="bnf-plan-btn-acao bnf-btn-ok" onclick="bnfPlanMarcarPago('${l.id}')" title="Marcar pago">💳</button>` : ''}
    <button class="bnf-plan-btn-acao bnf-btn-del" onclick="bnfPlanExcluir('${l.id}')" title="Excluir">🗑️</button>
  </td>
</tr>`;
  }

  // ─── FOOTER DE TOTAIS ──────────────────────────────────────
  function _footerTotais(lista) {
    const db    = BonifDB.get();
    const tipos = db.bonus_tipos;
    // Soma por tipo
    const porTipo = {};
    lista.forEach(l => {
      if (!porTipo[l.tipo_id]) porTipo[l.tipo_id] = { nome: l.tipo_nome, icon: l.tipo_icon, total: 0, qtd: 0 };
      porTipo[l.tipo_id].total += (l.valor_final || 0);
      porTipo[l.tipo_id].qtd++;
    });
    if (Object.keys(porTipo).length < 2) return '';
    return `
<tr class="bnf-plan-subtotal-row">
  <td colspan="8" style="padding:8px 12px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px">
    Subtotais por tipo
  </td>
  <td class="bnf-td-valor" style="text-align:left;padding:8px 12px">
    ${Object.values(porTipo).map(t =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:11px">
        <span>${t.icon} ${t.nome} <span style="color:var(--text-muted)">(${t.qtd})</span></span>
        <strong>${BonifFmt.moeda(t.total)}</strong>
      </div>`).join('')}
  </td>
  <td colspan="2"></td>
</tr>`;
  }

  // ─── PAINEL DE INSIGHTS ───────────────────────────────────
  function _painelInsights(lista, todos) {
    const soma     = lista.reduce((s,l)=>s+(l.valor_final||0),0);
    const somaAprov= todos.filter(l=>['aprovado','pago'].includes(l.status)).reduce((s,l)=>s+(l.valor_final||0),0);
    const maiorBonus= [...lista].sort((a,b)=>b.valor_final-a.valor_final)[0];
    const totalColabs= new Set(lista.map(l=>l.colaborador_id)).size;
    const mediaPorColab= totalColabs > 0 ? soma/totalColabs : 0;

    return `
<div class="bnf-plan-insights">
  <div class="bnf-plan-insight-hd">🧠 Análise do Período</div>
  <div class="bnf-plan-insight-item">
    <span class="bnf-pii-label">Colaboradores beneficiados</span>
    <strong>${totalColabs}</strong>
  </div>
  <div class="bnf-plan-insight-item">
    <span class="bnf-pii-label">Média por colaborador</span>
    <strong>${BonifFmt.moeda(mediaPorColab)}</strong>
  </div>
  <div class="bnf-plan-insight-item">
    <span class="bnf-pii-label">Maior bônus individual</span>
    <strong>${maiorBonus ? BonifFmt.moeda(maiorBonus.valor_final) : '—'}</strong>
    ${maiorBonus ? `<small>${maiorBonus.colaborador_nome.split(' ')[0]}</small>` : ''}
  </div>
  <div class="bnf-plan-insight-item">
    <span class="bnf-pii-label">% do total aprovado</span>
    <strong>${soma > 0 ? Math.round(somaAprov/soma*100) : 0}%</strong>
  </div>
  <hr style="border:none;border-top:1px solid var(--border-color,#e2e8f0);margin:8px 0">
  <div class="bnf-plan-insight-item bnf-plan-total-big">
    <span class="bnf-pii-label">Total filtrado</span>
    <strong style="font-size:16px;color:#16a34a">${BonifFmt.moeda(soma)}</strong>
  </div>
</div>`;
  }

  // ─── MODAL NOVO / EDITAR ───────────────────────────────────
  function _abrirModal(lancamento) {
    const db     = BonifDB.get();
    const colabs = BonifColabs.getAll();
    const tipos  = db.bonus_tipos.filter(t => t.ativo);
    const isEd   = !!lancamento;
    const l      = lancamento || {};

    // Pré-selecionar colaborador para recalcular salário
    const colabSel = colabs.find(c => c.id === l.colaborador_id);
    const salario  = parseFloat(String(colabSel?.salario_base || 0).replace(',', '.'));

    const overlay = document.createElement('div');
    overlay.className = 'bnf-plan-overlay';
    overlay.id = 'bnf-plan-modal';
    overlay.innerHTML = `
<div class="bnf-plan-modal">
  <div class="bnf-plan-modal-hd">
    <div>
      <h3>${isEd ? '✏️ Editar Bônus' : '➕ Adicionar Bônus'}</h3>
      <small style="color:var(--text-muted)">${BonifFmt.mesNome(_mes)}</small>
    </div>
    <button onclick="document.getElementById('bnf-plan-modal').remove()" style="border:none;background:var(--bg-sidebar,#f8fafc);border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px">✕</button>
  </div>
  <div class="bnf-plan-modal-body">

    <!-- Colaborador -->
    <div class="dp-field">
      <label>Colaborador <span style="color:#ef4444">*</span></label>
      <select id="bpm-colab" onchange="bnfPlanModalSalario(this)">
        <option value="">Selecione o colaborador</option>
        ${colabs.map(c => {
          const sal = parseFloat(String(c.salario_base||0).replace(',','.'));
          return `<option value="${c.id}" data-nome="${c.nome_completo||c.nome}" data-cargo="${c.cargo||''}" data-setor="${c.setor||''}" data-sal="${sal}" ${l.colaborador_id===c.id?'selected':''}>${c.nome_completo||c.nome} — ${c.setor||''}</option>`;
        }).join('')}
      </select>
    </div>

    <!-- Salário base (leitura) -->
    <div class="bnf-plan-sal-box" id="bpm-sal-box" style="${colabSel?'':'display:none'}">
      <span>💰</span>
      <span>Salário base: <strong id="bpm-sal-label">${BonifFmt.moeda(salario)}</strong></span>
      <input type="hidden" id="bpm-sal" value="${salario}" />
    </div>

    <!-- Tipo de bônus -->
    <div class="dp-field">
      <label>Tipo de Bônus <span style="color:#ef4444">*</span></label>
      <select id="bpm-tipo">
        <option value="">Selecione</option>
        ${tipos.map(t => `<option value="${t.id}" data-nome="${t.nome}" data-icon="${t.icon||'💰'}" data-cor="${t.cor||'#2563eb'}" ${l.tipo_id===t.id?'selected':''}>${t.icon||'💰'} ${t.nome}</option>`).join('')}
      </select>
    </div>

    <!-- Descrição / Motivo -->
    <div class="dp-field">
      <label>Motivo / Descrição</label>
      <input type="text" id="bpm-desc" value="${l.descricao||''}" placeholder="Ex: Atingiu 105% da meta de maio" />
    </div>

    <!-- Tipo de cálculo -->
    <div class="dp-field">
      <label>Forma de cálculo <span style="color:#ef4444">*</span></label>
      <div class="bnf-plan-calc-toggle">
        <button type="button" id="bpm-btn-pct" class="bnf-plan-ct-btn ${l.calculo_tipo!=='fixo'?'ativo':''}" onclick="bnfPlanToggleCalc('percentual')">
          📊 % do Salário
        </button>
        <button type="button" id="bpm-btn-fixo" class="bnf-plan-ct-btn ${l.calculo_tipo==='fixo'?'ativo':''}" onclick="bnfPlanToggleCalc('fixo')">
          🔒 Valor Fixo (R$)
        </button>
      </div>
    </div>

    <!-- Entrada de valor -->
    <div id="bpm-entrada-pct" style="${l.calculo_tipo==='fixo'?'display:none':''}">
      <div class="dp-field">
        <label>Percentual (%) <span style="color:#ef4444">*</span></label>
        <div class="bnf-plan-pct-wrap">
          <input type="number" id="bpm-pct" min="0" max="200" step="0.5" value="${l.percentual||''}" placeholder="Ex: 10" oninput="bnfPlanCalcPreview()" />
          <span>%</span>
        </div>
        <small style="color:var(--text-muted)">Sugestões rápidas:
          ${[5,10,15,20,25].map(p => `<button type="button" onclick="document.getElementById('bpm-pct').value=${p};bnfPlanCalcPreview()" style="border:1px solid var(--border-color,#e2e8f0);border-radius:4px;padding:1px 6px;cursor:pointer;font-size:11px;background:transparent;margin:0 2px">${p}%</button>`).join('')}
        </small>
      </div>
    </div>

    <div id="bpm-entrada-fixo" style="${l.calculo_tipo!=='fixo'?'display:none':''}">
      <div class="dp-field">
        <label>Valor fixo (R$) <span style="color:#ef4444">*</span></label>
        <div class="bnf-plan-pct-wrap">
          <span>R$</span>
          <input type="number" id="bpm-fixo" min="0" step="0.01" value="${l.calculo_tipo==='fixo'?l.valor_final:''}" placeholder="0,00" oninput="bnfPlanCalcPreview()" />
        </div>
      </div>
    </div>

    <!-- Preview do cálculo em tempo real -->
    <div class="bnf-plan-preview" id="bpm-preview">
      <div class="bnf-plan-preview-inner">
        <div>
          <span class="bnf-plan-preview-label">Valor calculado</span>
          <span class="bnf-plan-preview-val" id="bpm-preview-val">${l.valor_final ? BonifFmt.moeda(l.valor_final) : 'R$ —'}</span>
        </div>
        <div id="bpm-preview-formula" class="bnf-plan-preview-formula">
          ${l.calculo_tipo === 'percentual' && l.percentual ? `${l.percentual}% × ${BonifFmt.moeda(l.salario_base||0)}` : ''}
        </div>
      </div>
    </div>

    <!-- Status -->
    <div class="dp-field">
      <label>Status</label>
      <div class="bnf-plan-status-btns" id="bpm-status-group">
        ${['pendente','aprovado','pago','cancelado'].map(s => `
          <button type="button" class="bnf-plan-st-btn ${(l.status||'pendente')===s?'ativo':''}" data-status="${s}" onclick="bnfPlanSelStatus(this)">
            ${_statusIcon(s)} ${s.charAt(0).toUpperCase()+s.slice(1)}
          </button>`).join('')}
      </div>
    </div>

  </div>

  <div class="bnf-plan-modal-ft">
    <div style="font-size:12px;color:var(--text-muted)">
      ${isEd ? `Última edição: ${BonifFmt.data(l.criado_em)}` : 'Novo lançamento'}
    </div>
    <div style="display:flex;gap:10px">
      <button class="dp-btn dp-btn-secondary" onclick="document.getElementById('bnf-plan-modal').remove()">Cancelar</button>
      <button class="dp-btn" onclick="bnfPlanSalvar('${l.id||''}')">
        ${isEd ? '💾 Salvar Alterações' : '✅ Adicionar'}
      </button>
    </div>
  </div>
</div>`;

    document.body.appendChild(overlay);
    // Preview inicial se em edição
    if (isEd) setTimeout(() => bnfPlanCalcPreview(), 50);
  }

  // ─── HELPERS ──────────────────────────────────────────────
  function _statusIcon(s) {
    return { todos:'📌', pendente:'🟡', aprovado:'🟢', pago:'💳', cancelado:'⛔' }[s] || '●';
  }

  function _corTipo(tipoId) {
    const t = BonifDB.get().bonus_tipos.find(x => x.id === tipoId);
    return t?.cor || '#2563eb';
  }

  function _gerarMeses() {
    const meses = [];
    const hoje  = new Date();
    for (let i = -5; i <= 2; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const val = d.toISOString().slice(0, 7);
      meses.push({ val, label: BonifFmt.mesNome(val) });
    }
    return meses;
  }

  function _calcValor(calcTipo, pct, fixo, salario) {
    if (calcTipo === 'percentual') {
      const p = parseFloat(pct) || 0;
      const s = parseFloat(salario) || 0;
      return +(p / 100 * s).toFixed(2);
    }
    return +(parseFloat(fixo) || 0).toFixed(2);
  }

  // ─── GLOBAIS ──────────────────────────────────────────────
  window.bnfPlanMes = function(mes) {
    _mes = mes; _draw();
  };

  window.bnfPlanFiltro = function(f) {
    _filtro = f; _draw();
  };

  window.bnfPlanNovo = function() {
    _editId = null; _abrirModal(null);
  };

  window.bnfPlanEditar = function(id) {
    const l = BonifDB.get().lancamentos.find(x => x.id === id);
    if (l) { _editId = id; _abrirModal(l); }
  };

  window.bnfPlanModalSalario = function(sel) {
    const opt = sel.selectedOptions[0];
    const sal = parseFloat(opt?.dataset.sal || 0);
    const box = document.getElementById('bpm-sal-box');
    const lbl = document.getElementById('bpm-sal-label');
    const inp = document.getElementById('bpm-sal');
    if (box) box.style.display = sel.value ? '' : 'none';
    if (lbl) lbl.textContent = BonifFmt.moeda(sal);
    if (inp) inp.value = sal;
    bnfPlanCalcPreview();
  };

  window.bnfPlanToggleCalc = function(tipo) {
    document.getElementById('bpm-btn-pct')?.classList.toggle('ativo',  tipo === 'percentual');
    document.getElementById('bpm-btn-fixo')?.classList.toggle('ativo', tipo === 'fixo');
    document.getElementById('bpm-entrada-pct').style.display  = tipo === 'percentual' ? '' : 'none';
    document.getElementById('bpm-entrada-fixo').style.display = tipo === 'fixo'       ? '' : 'none';
    bnfPlanCalcPreview();
  };

  window.bnfPlanCalcPreview = function() {
    const isFixo   = document.getElementById('bpm-btn-fixo')?.classList.contains('ativo');
    const pct      = document.getElementById('bpm-pct')?.value;
    const fixo     = document.getElementById('bpm-fixo')?.value;
    const salario  = parseFloat(document.getElementById('bpm-sal')?.value || 0);
    const valor    = _calcValor(isFixo ? 'fixo' : 'percentual', pct, fixo, salario);
    const valEl    = document.getElementById('bpm-preview-val');
    const fmlaEl   = document.getElementById('bpm-preview-formula');
    if (valEl)  valEl.textContent  = valor > 0 ? BonifFmt.moeda(valor) : 'R$ —';
    if (fmlaEl) fmlaEl.textContent = !isFixo && pct && salario > 0 ? `${pct}% × ${BonifFmt.moeda(salario)} = ${BonifFmt.moeda(valor)}` : '';
  };

  window.bnfPlanSelStatus = function(btn) {
    document.querySelectorAll('#bpm-status-group .bnf-plan-st-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
  };

  window.bnfPlanSalvar = function(idEx) {
    const colabEl = document.getElementById('bpm-colab');
    const tipoEl  = document.getElementById('bpm-tipo');
    const desc    = document.getElementById('bpm-desc')?.value?.trim();
    const isFixo  = document.getElementById('bpm-btn-fixo')?.classList.contains('ativo');
    const pct     = document.getElementById('bpm-pct')?.value;
    const fixo    = document.getElementById('bpm-fixo')?.value;
    const salario = parseFloat(document.getElementById('bpm-sal')?.value || 0);
    const statusBtn = document.querySelector('#bpm-status-group .bnf-plan-st-btn.ativo');

    if (!colabEl?.value || !tipoEl?.value) { _toast('⚠️ Selecione colaborador e tipo de bônus.', 'warn'); return; }
    if (!isFixo && !pct)  { _toast('⚠️ Informe o percentual.', 'warn'); return; }
    if (isFixo  && !fixo) { _toast('⚠️ Informe o valor fixo.', 'warn'); return; }

    const colabOpt = colabEl.selectedOptions[0];
    const tipoOpt  = tipoEl.selectedOptions[0];
    const calcTipo = isFixo ? 'fixo' : 'percentual';
    const valor    = _calcValor(calcTipo, pct, fixo, salario);

    if (valor <= 0) { _toast('⚠️ O valor do bônus deve ser maior que zero.', 'warn'); return; }

    const lan = {
      id:              idEx || 'LAN_' + Date.now(),
      mes:             _mes,
      colaborador_id:  colabEl.value,
      colaborador_nome:colabOpt.dataset.nome || '',
      cargo:           colabOpt.dataset.cargo || '',
      setor:           colabOpt.dataset.setor || '',
      salario_base:    salario,
      tipo_id:         tipoEl.value,
      tipo_nome:       tipoOpt.dataset.nome || tipoEl.selectedOptions[0]?.text || '',
      tipo_icon:       tipoOpt.dataset.icon || '💰',
      tipo_cor:        tipoOpt.dataset.cor  || '#2563eb',
      descricao:       desc || '',
      calculo_tipo:    calcTipo,
      percentual:      calcTipo === 'percentual' ? parseFloat(pct) : null,
      valor_base:      salario,
      valor_final:     valor,
      status:          statusBtn?.dataset.status || 'pendente',
      origem:          'manual',
      criado_por:      _userNome(),
      criado_em:       idEx ? (BonifDB.get().lancamentos.find(x=>x.id===idEx)?.criado_em || new Date().toISOString()) : new Date().toISOString(),
    };

    BonifDB.upsert('lancamentos', lan);
    BonifDB.addAuditoria(idEx ? 'bonus_editado' : 'bonus_adicionado',
      `${lan.colaborador_nome} — ${lan.tipo_nome} — ${BonifFmt.moeda(valor)} (${_mes})`);

    document.getElementById('bnf-plan-modal')?.remove();
    _draw();
    _toast(`✅ Bônus ${idEx ? 'atualizado' : 'adicionado'}: ${BonifFmt.moeda(valor)} para ${lan.colaborador_nome.split(' ')[0]}`);
  };

  window.bnfPlanExcluir = function(id) {
    const l = BonifDB.get().lancamentos.find(x => x.id === id);
    if (!l) return;
    if (!confirm(`Excluir o bônus de ${BonifFmt.moeda(l.valor_final)} para ${l.colaborador_nome}?`)) return;
    BonifDB.remove('lancamentos', id);
    BonifDB.addAuditoria('bonus_excluido', `${l.colaborador_nome} — ${BonifFmt.moeda(l.valor_final)} (${l.mes})`);
    _draw();
    _toast(`🗑️ Bônus excluído.`);
  };

  window.bnfPlanAprovar = function(id) {
    const db = BonifDB.get();
    const l  = db.lancamentos.find(x => x.id === id);
    if (!l) return;
    l.status = 'aprovado';
    BonifDB.set(db);
    BonifDB.addAuditoria('bonus_aprovado', `${l.colaborador_nome} — ${BonifFmt.moeda(l.valor_final)}`);
    _draw();
    _toast(`✅ Bônus aprovado: ${BonifFmt.moeda(l.valor_final)}`);
  };

  window.bnfPlanMarcarPago = function(id) {
    if (!confirm('Marcar este bônus como PAGO? Esta ação não pode ser desfeita.')) return;
    const db = BonifDB.get();
    const l  = db.lancamentos.find(x => x.id === id);
    if (!l) return;
    l.status = 'pago';
    BonifDB.set(db);
    BonifDB.addAuditoria('bonus_pago', `${l.colaborador_nome} — ${BonifFmt.moeda(l.valor_final)}`);
    _draw();
    _toast(`💳 Bônus marcado como pago.`);
  };

  window.bnfPlanAprovarTodos = function() {
    const db    = BonifDB.get();
    const pends = db.lancamentos.filter(l => l.mes === _mes && l.status === 'pendente');
    if (pends.length === 0) { _toast('Nenhum lançamento pendente.', 'warn'); return; }
    const total = pends.reduce((s,l)=>s+l.valor_final,0);
    if (!confirm(`Aprovar ${pends.length} lançamento(s) pendentes?\nTotal: ${BonifFmt.moeda(total)}`)) return;
    pends.forEach(l => { l.status = 'aprovado'; });
    BonifDB.set(db);
    BonifDB.addAuditoria('bonus_aprovados_lote', `${pends.length} lançamentos — ${BonifFmt.moeda(total)} (${_mes})`);
    _draw();
    _toast(`✅ ${pends.length} bônus aprovados: ${BonifFmt.moeda(total)}`);
  };

  window.bnfPlanAutoGerar = function() {
    const db     = BonifDB.get();
    const colabs = BonifColabs.getAll();
    if (colabs.length === 0) { _toast('Nenhum colaborador encontrado.', 'warn'); return; }
    if (db.bonus_regras.filter(r=>r.ativo).length === 0) { _toast('Configure as regras antes de gerar automaticamente.', 'warn'); return; }

    const existentes = db.lancamentos.filter(l=>l.mes===_mes && l.origem==='automatico').map(l=>l.colaborador_id);
    const novos = colabs.filter(c=>!existentes.includes(c.id));

    if (novos.length === 0 && !confirm('Todos os colaboradores já têm lançamentos automáticos neste período. Deseja recriar?')) return;
    if (novos.length === 0) {
      // Remove automáticos existentes e recria
      const d = BonifDB.get();
      d.lancamentos = d.lancamentos.filter(l => !(l.mes===_mes && l.origem==='automatico'));
      BonifDB.set(d);
    }

    let criados = 0;
    colabs.forEach(col => {
      const salario = parseFloat(String(col.salario_base||0).replace(',','.'));
      const meta    = 75 + Math.random()*35; // simulação: 75–110%
      const faltas  = Math.floor(Math.random()*3);
      const base    = { salario, meta_pct: meta, faltas, indicacoes_aprovadas: 0 };

      for (const regra of db.bonus_regras.filter(r=>r.ativo)) {
        const tipo = db.bonus_tipos.find(t=>t.id===regra.bonus_tipo_id);
        if (!tipo?.ativo) continue;
        const ok = regra.condicoes.every(c => _avalCond(base[c.campo], c.op, c.valor));
        if (!ok) continue;
        const valor = _evalFormula(regra.formula, base);
        if (!valor || valor <= 0) continue;
        const lan = {
          id: 'LAN_AUTO_'+col.id+'_'+Date.now()+Math.random().toString(36).slice(2,6),
          mes: _mes,
          colaborador_id: col.id, colaborador_nome: col.nome_completo||col.nome||'—',
          cargo: col.cargo||'—', setor: col.setor||'—', salario_base: salario,
          tipo_id: tipo.id, tipo_nome: tipo.nome, tipo_icon: tipo.icon||'💰', tipo_cor: tipo.cor||'#2563eb',
          descricao: regra.nome, calculo_tipo: 'fixo',
          percentual: null, valor_base: salario, valor_final: +valor.toFixed(2),
          status: 'pendente', origem: 'automatico',
          criado_por: 'Sistema', criado_em: new Date().toISOString(),
        };
        BonifDB.upsert('lancamentos', lan);
        criados++;
        break; // Uma regra por colaborador (a primeira que bater)
      }
    });

    BonifDB.addAuditoria('bonus_auto_gerado', `${criados} lançamentos automáticos — ${_mes}`);
    _draw();
    _toast(`⚡ ${criados} bônus gerados automaticamente para ${BonifFmt.mesNome(_mes)}!`);
  };

  function _avalCond(val, op, ref) {
    const v = parseFloat(val); const r = parseFloat(ref);
    if (isNaN(v)) return false;
    return ({ '>=': v>=r, '<=': v<=r, '>': v>r, '<': v<r, '==': v===r, '!=': v!==r })[op] ?? false;
  }

  function _evalFormula(formula, vars) {
    try {
      const { salario, meta_pct, faltas, indicacoes_aprovadas } = vars;
      return Function('"use strict";return (' +
        formula.replace(/salario/g, salario).replace(/meta_pct/g, meta_pct)
               .replace(/faltas/g, faltas).replace(/indicacoes_aprovadas/g, indicacoes_aprovadas) +
      ')')();
    } catch { return null; }
  }

  window.bnfPlanExportar = function() {
    const db   = BonifDB.get();
    const lista= db.lancamentos.filter(l => l.mes === _mes && (_filtro === 'todos' || l.status === _filtro));
    if (!lista.length) { _toast('Nenhum dado para exportar.','warn'); return; }
    const headers = ['#','Colaborador','Cargo','Setor','Salário Base','Tipo','Cálculo','%','Bônus (R$)','Status','Descrição','Criado por'];
    const linhas  = [headers.join(','), ...lista.map((l,i) => [
      i+1, `"${l.colaborador_nome}"`, `"${l.cargo}"`, `"${l.setor}"`,
      l.salario_base?.toFixed(2)||0, `"${l.tipo_nome}"`,
      l.calculo_tipo, l.percentual||'—', l.valor_final?.toFixed(2)||0,
      l.status, `"${l.descricao||''}"`, `"${l.criado_por||''}"`,
    ].join(','))];
    const total = lista.reduce((s,l)=>s+(l.valor_final||0),0);
    linhas.push(`"","","","","","","","","TOTAL: ${total.toFixed(2)}","","",""`);
    const blob = new Blob(['﻿'+linhas.join('\n')], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`bonificacoes_${_mes}.csv`; a.click();
    URL.revokeObjectURL(url);
    _toast('📊 CSV exportado com sucesso!');
  };

  // ─── EXPORTAR EXCEL ───────────────────────────────────────
  window.bnfPlanExportarExcel = function() {
    const db    = BonifDB.get();
    const lista = db.lancamentos.filter(l => l.mes === _mes && (_filtro === 'todos' || l.status === _filtro));
    if (!lista.length) { _toast('Nenhum dado para exportar.', 'warn'); return; }
    if (typeof XLSX === 'undefined') { _toast('Biblioteca XLSX não carregada.', 'warn'); return; }

    const mes   = BonifFmt.mesNome(_mes);
    const total = lista.reduce((s, l) => s + (l.valor_final || 0), 0);
    const cols  = ['#', 'Colaborador', 'Cargo', 'Setor', 'Salário Base (R$)', 'Tipo de Bônus', 'Motivo', 'Cálculo', '% Aplicado', 'Bônus (R$)', 'Status', 'Criado por'];
    const rows  = lista.map((l, i) => [
      i + 1,
      l.colaborador_nome || '',
      l.cargo            || '',
      l.setor            || '',
      l.salario_base     || 0,
      l.tipo_nome        || '',
      l.descricao        || '',
      l.calculo_tipo     || '',
      l.percentual       || '',
      l.valor_final      || 0,
      l.status           || '',
      l.criado_por       || '',
    ]);
    rows.push(['', 'TOTAL GERAL', '', '', '', '', '', '', '', total, `${lista.length} lançamento(s)`, '']);

    try {
      const wsData = [cols, ...rows];
      const ws     = XLSX.utils.aoa_to_sheet(wsData);
      // Largura das colunas
      ws['!cols'] = [5,30,20,18,18,22,30,12,12,16,14,16].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, mes);
      XLSX.writeFile(wb, `bonificacoes_${_mes}.xlsx`);
      _toast('🟢 Excel gerado com sucesso!');
    } catch (e) {
      _toast('Erro ao gerar Excel: ' + e.message, 'warn');
    }
  };

  // ─── EXPORTAR PDF ─────────────────────────────────────────
  window.bnfPlanExportarPDF = function() {
    const db    = BonifDB.get();
    const lista = db.lancamentos.filter(l => l.mes === _mes && (_filtro === 'todos' || l.status === _filtro));
    if (!lista.length) { _toast('Nenhum dado para exportar.', 'warn'); return; }
    if (typeof window.jspdf === 'undefined') { _toast('Biblioteca jsPDF não carregada.', 'warn'); return; }

    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF({ orientation: 'landscape' });
    const mes       = BonifFmt.mesNome(_mes);
    const total     = lista.reduce((s, l) => s + (l.valor_final || 0), 0);
    const trunc     = (s, n) => s && s.length > n ? s.slice(0, n - 2) + '..' : (s || '—');

    // Cabeçalho azul
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 297, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('hi Conecta RH — Relatório de Bonificações', 10, 9);
    doc.text(new Date().toLocaleDateString('pt-BR'), 287, 9, { align: 'right' });

    // Título
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(15);
    doc.text(`Bonificações — ${mes}`, 10, 24);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total: ${BonifFmt.moeda(total)}  ·  ${lista.length} lançamento(s)  ·  Período: ${mes}`, 10, 31);

    // Definição das colunas
    const cols = [
      { label: '#',            w:  8, x: 10  },
      { label: 'Colaborador',  w: 52, x: 18  },
      { label: 'Cargo',        w: 32, x: 70  },
      { label: 'Setor',        w: 28, x: 102 },
      { label: 'Sal. Base',    w: 26, x: 130 },
      { label: 'Tipo de Bônus',w: 36, x: 156 },
      { label: 'Motivo',       w: 36, x: 192 },
      { label: 'Bônus (R$)',   w: 26, x: 228 },
      { label: 'Status',       w: 20, x: 254 },
    ];
    const tableW = 264;

    let y = 37;

    const _drawHeader = () => {
      doc.setFillColor(37, 99, 235);
      doc.rect(10, y, tableW, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      cols.forEach(c => doc.text(c.label, c.x + 1, y + 5.5));
      y += 8;
    };

    _drawHeader();
    doc.setFont('helvetica', 'normal');

    lista.forEach((l, i) => {
      if (y > 193) {
        doc.addPage();
        y = 16;
        _drawHeader();
        doc.setFont('helvetica', 'normal');
      }

      doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
      doc.rect(10, y, tableW, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(10, y, tableW, 7, 'D');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7);
      doc.text(String(i + 1),                           cols[0].x + 1, y + 5);
      doc.text(trunc(l.colaborador_nome, 24),            cols[1].x + 1, y + 5);
      doc.text(trunc(l.cargo, 16),                       cols[2].x + 1, y + 5);
      doc.text(trunc(l.setor, 14),                       cols[3].x + 1, y + 5);
      doc.text(BonifFmt.moeda(l.salario_base || 0),      cols[4].x + 1, y + 5);
      doc.text(trunc(l.tipo_nome, 18),                   cols[5].x + 1, y + 5);
      doc.text(trunc(l.descricao, 18),                   cols[6].x + 1, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text(BonifFmt.moeda(l.valor_final || 0),       cols[7].x + 1, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(l.status || '—',                          cols[8].x + 1, y + 5);
      y += 7;
    });

    // Linha de total
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y, tableW, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('TOTAL GERAL', cols[1].x + 1, y + 5.5);
    doc.text(BonifFmt.moeda(total),    cols[7].x + 1, y + 5.5);
    doc.text(`${lista.length} lançs.`, cols[8].x + 1, y + 5.5);

    // Rodapé em todas as páginas
    const nPags = doc.internal.getNumberOfPages();
    for (let p = 1; p <= nPags; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 10, 205);
      doc.text(`Página ${p} de ${nPags}`, 287, 205, { align: 'right' });
    }

    doc.save(`bonificacoes_${_mes}.pdf`);
    _toast('🔴 PDF gerado com sucesso!');
  };

  // ─── EXPORTAR WORD ────────────────────────────────────────
  window.bnfPlanExportarWord = function() {
    const db    = BonifDB.get();
    const lista = db.lancamentos.filter(l => l.mes === _mes && (_filtro === 'todos' || l.status === _filtro));
    if (!lista.length) { _toast('Nenhum dado para exportar.', 'warn'); return; }

    const mes   = BonifFmt.mesNome(_mes);
    const total = lista.reduce((s, l) => s + (l.valor_final || 0), 0);

    const html = `
      <h2 style="color:#1e3a5f">Relatório de Bonificações — ${mes}</h2>
      <p><b>Período:</b> ${mes} &nbsp;|&nbsp; <b>Lançamentos:</b> ${lista.length} &nbsp;|&nbsp; <b>Total:</b> ${BonifFmt.moeda(total)}</p>
      <p style="color:#64748b;font-size:10pt">Gerado em ${new Date().toLocaleString('pt-BR')} · hi Conecta RH</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt">
        <thead>
          <tr style="background:#2563eb;color:#fff">
            <th>#</th><th>Colaborador</th><th>Cargo</th><th>Setor</th>
            <th>Salário Base</th><th>Tipo de Bônus</th><th>Motivo</th>
            <th>Bônus (R$)</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map((l, i) => `
          <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
            <td style="text-align:center">${i + 1}</td>
            <td><b>${l.colaborador_nome || '—'}</b></td>
            <td>${l.cargo || '—'}</td>
            <td>${l.setor || '—'}</td>
            <td style="text-align:right">${BonifFmt.moeda(l.salario_base || 0)}</td>
            <td>${l.tipo_nome || '—'}</td>
            <td>${l.descricao || '—'}</td>
            <td style="text-align:right;color:#16a34a;font-weight:bold">${BonifFmt.moeda(l.valor_final || 0)}</td>
            <td style="text-align:center">${l.status || '—'}</td>
          </tr>`).join('')}
          <tr style="background:#dbeafe;font-weight:bold">
            <td colspan="7" style="text-align:right;padding-right:12px">TOTAL GERAL</td>
            <td style="text-align:right;color:#1e40af">${BonifFmt.moeda(total)}</td>
            <td style="text-align:center">${lista.length} lançs.</td>
          </tr>
        </tbody>
      </table>`;

    ExportService.word(`Bonificacoes_${_mes}`, html);
    _toast('🔵 Word gerado com sucesso!');
  };

  // ─── TOGGLE MENU EXPORTAR ─────────────────────────────────
  window.bnfToggleExportMenu = function(id) {
    const menu = document.getElementById(id);
    if (!menu) return;
    const visible = menu.style.display !== 'none';
    document.querySelectorAll('[id$="-emenu"]').forEach(m => m.style.display = 'none');
    if (!visible) {
      menu.style.display = 'block';
      setTimeout(() => {
        const off = e => { if (!menu.contains(e.target)) { menu.style.display = 'none'; document.removeEventListener('click', off); } };
        document.addEventListener('click', off);
      }, 0);
    }
  };

  function _toast(msg, tipo='ok') {
    document.querySelectorAll('.bnf-plan-toast').forEach(e=>e.remove());
    const el = document.createElement('div');
    el.className = `dpa-toast dpa-toast-${tipo} bnf-plan-toast`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300);},4000);
  }

  return { render };
})();
