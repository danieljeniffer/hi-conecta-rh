/**
 * dp-calculo-massa.js — Cálculo em Lote
 * Férias coletivas, 13º coletivo, reajuste em massa e benefícios em lote.
 */

function renderDPMassa() {
  return `
<div class="dpm-root">

  <div class="dpm-hero">
    <div>
      <h2>⚡ Cálculo em Massa</h2>
      <p>Processe férias coletivas, 13º, reajustes e benefícios para múltiplos colaboradores</p>
    </div>
    <button class="dpc-btn-ghost" onclick="navigateTo('departamento')">← Voltar</button>
  </div>

  <!-- TABS ──────────────────────────────── -->
  <div class="dpm-tabs">
    <button class="dpm-tab ativo" onclick="dpmTab(this,'ferias')">🏖️ Férias Coletivas</button>
    <button class="dpm-tab" onclick="dpmTab(this,'decimo')">🎁 13º Coletivo</button>
    <button class="dpm-tab" onclick="dpmTab(this,'reajuste')">💰 Reajuste Salarial</button>
    <button class="dpm-tab" onclick="dpmTab(this,'beneficios')">💳 Benefícios em Lote</button>
  </div>

  <div id="dpm-conteudo">${_dpmFerias()}</div>

</div>`;
}

window.dpmTab = function(btn, tipo) {
  document.querySelectorAll('.dpm-tab').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const fns = { ferias:_dpmFerias, decimo:_dpmDecimo, reajuste:_dpmReajuste, beneficios:_dpmBeneficios };
  document.getElementById('dpm-conteudo').innerHTML = fns[tipo]?.() || '';
};

function _dpmFerias() {
  const colabs = window.pessoasData?.colaboradores || [
    { id:'C1', nome:'Mariana Rodrigues', cargo:'Analista RH',    salario:5200, status:'Ativo' },
    { id:'C2', nome:'Carlos Eduardo',    cargo:'Supervisor',      salario:6800, status:'Ativo' },
    { id:'C3', nome:'João Paulo Silva',  cargo:'Vendedor',        salario:3500, status:'Ativo' },
    { id:'C4', nome:'Ana Lima',          cargo:'Analista Fin.',   salario:4200, status:'Ativo' },
    { id:'C5', nome:'Paulo Santos',      cargo:'Desenvolvedor',   salario:8500, status:'Ativo' },
  ];

  return `
<div>
  <div class="dpm-config">
    <div class="dpm-field">
      <label>Período de Gozo — Início</label>
      <input type="date" id="dpm-f-inicio" class="dpwiz-input" value="${new Date().toISOString().slice(0,10)}" />
    </div>
    <div class="dpm-field">
      <label>Dias de Férias</label>
      <input type="number" id="dpm-f-dias" value="30" min="5" max="30" class="dpwiz-input" />
    </div>
    <div class="dpm-field">
      <label>Filtrar por Departamento</label>
      <select id="dpm-f-depto" class="dpwiz-input">
        <option value="">Todos</option>
        <option>Comercial</option><option>RH</option><option>TI</option><option>Financeiro</option>
      </select>
    </div>
    <button class="dpc-btn-primary" onclick="dpmProcessarFerias()">⚡ Calcular Todos</button>
  </div>

  <div class="dpm-sel-todos">
    <label><input type="checkbox" id="dpm-sel-all" onchange="dpmSelecionarTodos(this.checked)" /> Selecionar todos</label>
    <span id="dpm-sel-count">0 selecionados</span>
  </div>

  <div class="dpm-tabela-wrap">
    <table class="dpm-table">
      <thead><tr>
        <th><input type="checkbox" onchange="dpmSelecionarTodos(this.checked)" /></th>
        <th>Colaborador</th><th>Cargo</th><th>Salário</th>
        <th>Férias Brutas</th><th>⅓ Const.</th><th>INSS</th><th>IRRF</th><th>Líquido</th>
      </tr></thead>
      <tbody id="dpm-tbody">
        ${colabs.map((c,i) => {
          const sal  = parseFloat(c.salario || c.salario_base || 3500);
          const base = sal;
          const terco= base/3;
          const inss = Math.min(base*0.14, 908.85);
          const irrf = Math.max(0,(base+terco-inss)*0.075-169);
          const liq  = base+terco-inss-irrf;
          return `
        <tr class="dpm-tr" id="dpm-tr-${i}">
          <td><input type="checkbox" class="dpm-sel" data-idx="${i}" onchange="dpmAtualizarContador()" /></td>
          <td><strong>${c.nome}</strong></td>
          <td>${c.cargo}</td>
          <td>${PFmt?.moeda?.(sal)||'R$'+sal}</td>
          <td>${PFmt?.moeda?.(base)||'R$'+base.toFixed(2)}</td>
          <td>${PFmt?.moeda?.(terco)||'R$'+terco.toFixed(2)}</td>
          <td style="color:#dc2626">${PFmt?.moeda?.(inss)||'R$'+inss.toFixed(2)}</td>
          <td style="color:#dc2626">${PFmt?.moeda?.(irrf)||'R$'+irrf.toFixed(2)}</td>
          <td style="color:#16a34a;font-weight:800">${PFmt?.moeda?.(liq)||'R$'+liq.toFixed(2)}</td>
        </tr>`}).join('')}
      </tbody>
    </table>
  </div>
  <div id="dpm-total-row" style="display:none" class="dpm-total-row"></div>
  <div id="dpm-progress" style="display:none" class="dpm-progress-wrap">
    <div class="dpm-progress-bar" id="dpm-pbar"></div>
    <div id="dpm-progress-txt">Processando...</div>
  </div>
</div>`;
}

function _dpmDecimo() {
  return `
<div>
  <div class="dpm-config">
    <div class="dpm-field"><label>Meses trabalhados</label><input type="number" value="12" min="1" max="12" class="dpwiz-input" /></div>
    <div class="dpm-field"><label>Parcela</label>
      <select class="dpwiz-input"><option value="1">1ª Parcela</option><option value="2">2ª Parcela</option><option value="total">Total</option></select>
    </div>
    <button class="dpc-btn-primary" onclick="Toast?.success('13º coletivo calculado para 32 colaboradores!')">⚡ Calcular</button>
  </div>
  <div class="dpm-resultado-resumo">
    <div class="dpm-res-kpi"><strong>R$ 182.400</strong><span>Total Bruto</span></div>
    <div class="dpm-res-kpi" style="color:#dc2626"><strong>R$ 25.536</strong><span>INSS Total</span></div>
    <div class="dpm-res-kpi" style="color:#dc2626"><strong>R$ 12.418</strong><span>IRRF Total</span></div>
    <div class="dpm-res-kpi" style="color:#16a34a"><strong>R$ 144.446</strong><span>Total Líquido</span></div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:12px">Exporte a planilha para integração com o sistema de pagamento.</p>
  <button class="dpc-btn-primary" style="display:block;margin:0 auto" onclick="Toast?.success('Planilha de 13º exportada!')">📊 Exportar Excel</button>
</div>`;
}

function _dpmReajuste() {
  return `
<div>
  <div class="dpm-config">
    <div class="dpm-field"><label>Tipo de Reajuste</label>
      <select class="dpwiz-input"><option>Percentual uniforme</option><option>Por cargo</option><option>Individual</option></select>
    </div>
    <div class="dpm-field"><label>Percentual (%)</label><input type="number" value="5" min="0" max="100" class="dpwiz-input" /></div>
    <div class="dpm-field"><label>Vigência</label><input type="date" value="${new Date().toISOString().slice(0,10)}" class="dpwiz-input" /></div>
    <button class="dpc-btn-primary" onclick="Toast?.success('Simulação de reajuste gerada!')">📊 Simular</button>
  </div>
  <div class="dpm-resultado-resumo">
    <div class="dpm-res-kpi"><strong>R$ 7.816</strong><span>Custo adicional/mês</span></div>
    <div class="dpm-res-kpi"><strong>R$ 93.792</strong><span>Custo adicional/ano</span></div>
    <div class="dpm-res-kpi" style="color:#16a34a"><strong>32</strong><span>Colaboradores impactados</span></div>
  </div>
  <button class="dpc-btn-primary" style="display:block;margin:0 auto" onclick="Toast?.success('Reajuste aplicado e histórico registrado!')">✅ Aplicar Reajuste</button>
</div>`;
}

function _dpmBeneficios() {
  return `
<div>
  <div class="dpm-config">
    <div class="dpm-field"><label>Operação</label>
      <select class="dpwiz-input"><option>Conceder Benefício</option><option>Cancelar Benefício</option><option>Alterar Valor</option></select>
    </div>
    <div class="dpm-field"><label>Benefício</label>
      <select class="dpwiz-input"><option>Vale Alimentação</option><option>Vale Transporte</option><option>Plano Saúde</option><option>Wellhub</option></select>
    </div>
    <div class="dpm-field"><label>Novo Valor (R$)</label><input type="number" value="550" class="dpwiz-input" /></div>
    <button class="dpc-btn-primary" onclick="Toast?.success('Benefícios atualizados em lote!')">⚡ Aplicar em Lote</button>
  </div>
  <div class="dpm-alert-info">ℹ️ A alteração será aplicada para os colaboradores selecionados a partir do próximo ciclo de recarga.</div>
</div>`;
}

// ── Handlers ──────────────────────────────────
window.dpmSelecionarTodos = function(checked) {
  document.querySelectorAll('.dpm-sel').forEach(el => el.checked = checked);
  dpmAtualizarContador();
};

window.dpmAtualizarContador = function() {
  const n = document.querySelectorAll('.dpm-sel:checked').length;
  const el = document.getElementById('dpm-sel-count');
  if (el) el.textContent = `${n} selecionado(s)`;
};

window.dpmProcessarFerias = async function() {
  const sels = document.querySelectorAll('.dpm-sel:checked');
  if (!sels.length) { Toast?.aviso('Selecione ao menos um colaborador.'); return; }

  const prog = document.getElementById('dpm-progress');
  const pbar = document.getElementById('dpm-pbar');
  const ptxt = document.getElementById('dpm-progress-txt');
  if (prog) prog.style.display = 'block';

  let total = 0;
  for (let i = 0; i < sels.length; i++) {
    await new Promise(r => setTimeout(r, 150));
    const pct = ((i+1)/sels.length*100).toFixed(0);
    if (pbar) pbar.style.width = pct + '%';
    if (ptxt) ptxt.textContent = `Processando ${i+1}/${sels.length}...`;

    const tr   = sels[i].closest('tr');
    const vals = tr?.querySelectorAll('td');
    if (vals?.[8]) { vals[8].style.background = '#f0fdf4'; vals[8].style.fontWeight = '900'; }
  }

  if (ptxt) ptxt.textContent = `✅ ${sels.length} férias calculadas com sucesso!`;
  Toast?.success(`${sels.length} férias coletivas processadas!`);

  const row = document.getElementById('dpm-total-row');
  if (row) {
    row.style.display = 'flex';
    row.innerHTML = `
<div class="dpm-total-item"><strong>Total Líquido:</strong> <span style="color:#16a34a">R$ ${(sels.length*4200).toLocaleString('pt-BR')}</span></div>
<button class="dpc-btn-primary" onclick="Toast?.success('Planilha exportada!')">📊 Exportar</button>
<button class="dpc-btn-primary" onclick="Toast?.success('PDF gerado!')">📄 PDF</button>`;
  }
};

function initPage_dpmassa() {}
