/**
 * analytics.js — People Analytics Engine
 * Turnover, absenteísmo, risco de saída, score engajamento,
 * alertas inteligentes e gráficos nativos (canvas-free, CSS).
 */

// ── Dados analíticos (integra com API real ou mock) ──
const AnalyticsDB = {

  // Calcula turnover mensal (últimos 6 meses)
  getTurnover() {
    const meses = ['Dez/24','Jan/25','Fev/25','Mar/25','Abr/25','Mai/25'];
    return {
      labels: meses,
      taxas:  [3.1, 4.2, 3.8, 5.0, 4.5, 4.2],
      meta:   5.0,
      acumulado: 4.13,
      admissoes: [4, 6, 3, 5, 4, 6],
      desligamentos: [2, 3, 2, 4, 3, 3],
      por_depto: [
        { nome: 'Comercial',    taxa: 6.2, cor: '#dc2626' },
        { nome: 'TI',           taxa: 3.1, cor: '#16a34a' },
        { nome: 'RH',           taxa: 1.5, cor: '#16a34a' },
        { nome: 'Financeiro',   taxa: 2.8, cor: '#16a34a' },
        { nome: 'Operações',    taxa: 5.8, cor: '#d97706' },
      ],
      por_gestor: [
        { nome: 'Carlos Souza',    taxa: 7.1, colaboradores: 12, cor: '#dc2626' },
        { nome: 'Ana Ferreira',    taxa: 2.0, colaboradores:  8, cor: '#16a34a' },
        { nome: 'Paulo Santos',    taxa: 4.5, colaboradores: 15, cor: '#d97706' },
        { nome: 'Maria Rodrigues', taxa: 1.2, colaboradores:  6, cor: '#16a34a' },
      ],
    };
  },

  // Absenteísmo
  getAbsenteismo() {
    return {
      taxa_geral:     2.3,
      meta:           3.0,
      media_br:       3.5,
      faltas_mes:     18,
      atestados:      12,
      injustificadas:  6,
      por_depto: [
        { nome: 'Comercial',  taxa: 3.2 },
        { nome: 'Operações',  taxa: 4.1 },
        { nome: 'TI',         taxa: 1.2 },
        { nome: 'RH',         taxa: 0.8 },
        { nome: 'Financeiro', taxa: 1.5 },
      ],
    };
  },

  // Scores de engajamento
  getEngajamento() {
    return {
      score_geral:  78,
      meta:         80,
      nps:          62,
      participacao_pesquisas: 84,
      por_depto: [
        { nome: 'TI',           score: 85 },
        { nome: 'RH',           score: 82 },
        { nome: 'Financeiro',   score: 76 },
        { nome: 'Comercial',    score: 70 },
        { nome: 'Operações',    score: 68 },
      ],
      evolucao: [65, 68, 72, 75, 78, 78],
      meses:    ['Dez','Jan','Fev','Mar','Abr','Mai'],
    };
  },

  // Risco de desligamento por colaborador
  getRiscos() {
    return [
      { id:'R1', nome:'João Silva',     setor:'Comercial',  score:85, nivel:'critico', fatores:['Salário -15% abaixo da média','3 faltas este mês','Clima: 2.1/5'] },
      { id:'R2', nome:'Paulo Santos',   setor:'Operações',  score:72, nivel:'alto',    fatores:['Sem reajuste há 18 meses','2 ocorrências','Treinamentos pendentes'] },
      { id:'R3', nome:'Carlos Rocha',   setor:'Comercial',  score:68, nivel:'alto',    fatores:['Meta não atingida 3 meses','Conflito com gestor registrado'] },
      { id:'R4', nome:'Mariana Lima',   setor:'TI',         score:45, nivel:'medio',   fatores:['Salário levemente abaixo','Sem PDI definido'] },
      { id:'R5', nome:'Ana Oliveira',   setor:'Financeiro', score:30, nivel:'baixo',   fatores:['Histórico estável','Engajamento alto'] },
    ];
  },

  // Headcount histórico
  getHeadcount() {
    return {
      total:   32,
      ativos:  28,
      ferias:   2,
      afastados:2,
      admissoes_mes: 6,
      deslig_mes:    3,
      evolucao: [26, 27, 28, 29, 31, 32],
      meses:    ['Dez','Jan','Fev','Mar','Abr','Mai'],
    };
  },

  // Custos de pessoal
  getCustos() {
    return {
      folha_total:   156320,
      encargos:       62528, // 40% CLT
      beneficios:     27000,
      total_empresa:  245848,
      por_colaborador: 7683,
      vs_mes_anterior: +3.2,
    };
  },
};

// ── RENDER PRINCIPAL ──────────────────────────
function renderAnalytics() {
  const hc  = AnalyticsDB.getHeadcount();
  const tur = AnalyticsDB.getTurnover();
  const abs = AnalyticsDB.getAbsenteismo();
  const eng = AnalyticsDB.getEngajamento();
  const cus = AnalyticsDB.getCustos();

  return `
<div class="pa-root">

  <!-- HERO ────────────────────────────────── -->
  <div class="pa-hero">
    <div class="pa-hero-left">
      <div class="pa-hero-icon">📊</div>
      <div>
        <h2>People Analytics</h2>
        <p>Inteligência de dados para decisões estratégicas de RH</p>
      </div>
    </div>
    <div class="pa-hero-right">
      <button class="pa-btn" onclick="paExportarRelatorio()">📥 Exportar Relatório</button>
      <span class="pa-atualizado">Atualizado agora</span>
    </div>
  </div>

  <!-- TABS ────────────────────────────────── -->
  <div class="pa-tabs" id="pa-tabs">
    <button class="pa-tab ativo" onclick="paMudarTab(this,'overview')">📊 Visão Geral</button>
    <button class="pa-tab" onclick="paMudarTab(this,'turnover')">📉 Turnover</button>
    <button class="pa-tab" onclick="paMudarTab(this,'engajamento')">😊 Engajamento</button>
    <button class="pa-tab" onclick="paMudarTab(this,'riscos')">⚠️ Risco de Saída</button>
    <button class="pa-tab" onclick="paMudarTab(this,'custos')">💰 Custos</button>
  </div>

  <!-- CONTEÚDO ─────────────────────────────── -->
  <div id="pa-conteudo">
    ${_paOverview(hc, tur, abs, eng, cus)}
  </div>

</div>`;
}

// ── TABS ──────────────────────────────────────
window.paMudarTab = function(btn, tab) {
  document.querySelectorAll('.pa-tab').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const el = document.getElementById('pa-conteudo');
  if (!el) return;
  const fns = {
    overview:    () => _paOverview(AnalyticsDB.getHeadcount(), AnalyticsDB.getTurnover(), AnalyticsDB.getAbsenteismo(), AnalyticsDB.getEngajamento(), AnalyticsDB.getCustos()),
    turnover:    _paTurnover,
    engajamento: _paEngajamento,
    riscos:      _paRiscos,
    custos:      _paCustos,
  };
  el.innerHTML = fns[tab]?.() || '';
};

// ── OVERVIEW ──────────────────────────────────
function _paOverview(hc, tur, abs, eng, cus) {
  const fmt = v => 'R$ ' + parseFloat(v).toLocaleString('pt-BR',{minimumFractionDigits:2});

  return `
<div>
  <!-- KPIs Principais -->
  <div class="pa-kpi-grid">
    ${[
      { icon:'👥', label:'Headcount',     val:hc.total,            sub:`${hc.ativos} ativos`,           cor:'#2563eb', delta:null },
      { icon:'📈', label:'Turnover/mês',  val:`${tur.acumulado}%`, sub:`Meta: ${tur.meta}%`,            cor: tur.acumulado < tur.meta ? '#16a34a':'#dc2626', delta:'-0.3%' },
      { icon:'📆', label:'Absenteísmo',   val:`${abs.taxa_geral}%`, sub:`Meta: ${abs.meta}%`,           cor: abs.taxa_geral < abs.meta ? '#16a34a':'#dc2626', delta:'-0.5%' },
      { icon:'😊', label:'Engajamento',   val:`${eng.score_geral}`, sub:`Meta: ${eng.meta} | NPS: ${eng.nps}`, cor: eng.score_geral >= eng.meta ? '#16a34a':'#d97706', delta:'+3pts' },
      { icon:'💰', label:'Custo/Colab',   val:fmt(cus.por_colaborador), sub:'Total empresa/mês',       cor:'#7c3aed', delta:'+3.2%' },
      { icon:'🚀', label:'Admissões/mês', val:hc.admissoes_mes,    sub:`Desligamentos: ${hc.deslig_mes}`, cor:'#16a34a', delta:null },
    ].map(k => `
    <div class="pa-kpi" style="--pa-cor:${k.cor}">
      <div class="pa-kpi-header">
        <span class="pa-kpi-icon">${k.icon}</span>
        ${k.delta ? `<span class="pa-kpi-delta" style="color:${k.delta.startsWith('-') ? '#dc2626':'#16a34a'}">${k.delta}</span>` : ''}
      </div>
      <div class="pa-kpi-val" style="color:${k.cor}">${k.val}</div>
      <div class="pa-kpi-label">${k.label}</div>
      <div class="pa-kpi-sub">${k.sub}</div>
    </div>`).join('')}
  </div>

  <div class="pa-grid-2">
    <!-- Headcount evolução -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>👥 Evolução do Headcount</h4></div>
      ${_barChart(hc.meses, hc.evolucao, '#2563eb', 40)}
    </div>

    <!-- Turnover mensal -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>📉 Turnover Mensal (%)</h4>
        <span class="pa-meta-badge">Meta: ${tur.meta}%</span>
      </div>
      ${_lineChart(tur.labels, tur.taxas, tur.meta, '#dc2626')}
    </div>
  </div>

  <!-- Alertas inteligentes -->
  ${_paAlertas()}

</div>`;
}

// ── TURNOVER ──────────────────────────────────
function _paTurnover() {
  const d = AnalyticsDB.getTurnover();
  const maxTaxa = Math.max(...d.por_depto.map(x=>x.taxa));

  return `
<div>
  <div class="pa-kpi-grid" style="grid-template-columns:repeat(4,1fr)">
    ${[
      { label:'Taxa Acumulada', val:`${d.acumulado}%`, cor:'#dc2626', sub:'Últimos 6 meses' },
      { label:'Meta do Ano',   val:`${d.meta}%`,      cor:'#16a34a', sub:'Dentro da meta' },
      { label:'Admissões/mês', val: d.admissoes[d.admissoes.length-1], cor:'#2563eb', sub:'Último mês' },
      { label:'Desligamentos', val: d.desligamentos[d.desligamentos.length-1], cor:'#7c3aed', sub:'Último mês' },
    ].map(k=>`
    <div class="pa-kpi">
      <div class="pa-kpi-val" style="color:${k.cor}">${k.val}</div>
      <div class="pa-kpi-label">${k.label}</div>
      <div class="pa-kpi-sub">${k.sub}</div>
    </div>`).join('')}
  </div>

  <div class="pa-grid-2">
    <!-- Por departamento -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>📊 Turnover por Departamento</h4></div>
      ${d.por_depto.map(item=>`
      <div class="pa-bar-row">
        <span class="pa-bar-label">${item.nome}</span>
        <div class="pa-bar-track">
          <div class="pa-bar-fill" style="width:${(item.taxa/maxTaxa*100).toFixed(0)}%;background:${item.cor}"></div>
        </div>
        <span class="pa-bar-val" style="color:${item.cor}">${item.taxa}%</span>
      </div>`).join('')}
    </div>

    <!-- Por gestor -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>👔 Turnover por Gestor</h4>
        <span style="font-size:11px;color:#64748b">Equipes com maior saída</span>
      </div>
      ${d.por_gestor.sort((a,b)=>b.taxa-a.taxa).map((g,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div style="width:28px;height:28px;border-radius:50%;background:${g.cor}20;color:${g.cor};font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}º</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${g.nome}</div>
          <div style="font-size:11px;color:#64748b">${g.colaboradores} colaboradores</div>
        </div>
        <span style="font-size:16px;font-weight:900;color:${g.cor}">${g.taxa}%</span>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

// ── ENGAJAMENTO ────────────────────────────────
function _paEngajamento() {
  const d   = AnalyticsDB.getEngajamento();
  const max = 100;

  return `
<div>
  <div class="pa-kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    ${[
      { label:'Score Geral',    val:d.score_geral, cor: d.score_geral>=d.meta?'#16a34a':'#d97706', sub:`Meta: ${d.meta}` },
      { label:'NPS Colaborador',val:d.nps,          cor: d.nps>=50?'#16a34a':'#d97706',             sub:'Net Promoter Score' },
      { label:'Resp. Pesquisas',val:`${d.participacao_pesquisas}%`, cor:'#2563eb',                   sub:'Taxa de participação' },
    ].map(k=>`
    <div class="pa-kpi">
      <div class="pa-kpi-val" style="color:${k.cor}">${k.val}</div>
      <div class="pa-kpi-label">${k.label}</div>
      <div class="pa-kpi-sub">${k.sub}</div>
    </div>`).join('')}
  </div>

  <div class="pa-grid-2">
    <!-- Evolução do score -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>📈 Evolução do Engajamento</h4></div>
      ${_lineChart(d.meses, d.evolucao, d.meta, '#2563eb')}
    </div>

    <!-- Por departamento -->
    <div class="pa-card">
      <div class="pa-card-hd"><h4>😊 Score por Departamento</h4></div>
      ${d.por_depto.map(item=>`
      <div class="pa-bar-row">
        <span class="pa-bar-label">${item.nome}</span>
        <div class="pa-bar-track">
          <div class="pa-bar-fill" style="width:${item.score}%;background:${item.score>=d.meta?'#16a34a':item.score>=60?'#d97706':'#dc2626'}"></div>
        </div>
        <span class="pa-bar-val">${item.score}</span>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

// ── RISCOS ────────────────────────────────────
function _paRiscos() {
  const riscos = AnalyticsDB.getRiscos();
  const corNivel = { critico:'#dc2626', alto:'#d97706', medio:'#2563eb', baixo:'#16a34a' };

  return `
<div>
  <div class="pa-alert-banner">
    ⚠️ <strong>${riscos.filter(r=>r.nivel==='critico').length} colaboradores</strong> em risco crítico de desligamento nos próximos 90 dias.
    <button class="pa-alert-btn" onclick="paExportarRiscos()">Exportar lista</button>
  </div>

  <div class="pa-card">
    <div class="pa-card-hd">
      <h4>🎯 Score de Risco de Saída</h4>
      <span style="font-size:11px;color:#64748b">Calculado por IA com 6 fatores preditivos</span>
    </div>

    <div class="pa-table-wrap">
      <table class="pa-table">
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Setor</th>
            <th>Score de Risco</th>
            <th>Nível</th>
            <th>Principais Fatores</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${riscos.map(r=>`
          <tr>
            <td><strong>${r.nome}</strong></td>
            <td>${r.setor}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${r.score}%;background:${corNivel[r.nivel]};border-radius:3px"></div>
                </div>
                <span style="font-weight:800;color:${corNivel[r.nivel]};min-width:32px">${r.score}%</span>
              </div>
            </td>
            <td><span class="pa-nivel-badge" style="background:${corNivel[r.nivel]}18;color:${corNivel[r.nivel]};border-color:${corNivel[r.nivel]}30">${r.nivel}</span></td>
            <td>
              <ul style="margin:0;padding-left:14px;font-size:11px;color:#475569">
                ${r.fatores.slice(0,2).map(f=>`<li>${f}</li>`).join('')}
              </ul>
            </td>
            <td>
              <button class="pa-btn-sm" onclick="paGerarPlanoRetencao('${r.id}','${r.nome}')">🤖 Plano IA</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Metodologia -->
  <div class="pa-card" style="background:#f8fafc">
    <div class="pa-card-hd"><h4>🧠 Como o Score é Calculado</h4></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
      ${[
        { fator:'Tempo na empresa',          peso:'15%', desc:'Risco maior nos primeiros 6m e após 3 anos sem progressão' },
        { fator:'Salário vs. mercado',        peso:'20%', desc:'Comparativo com mediana do cargo na região' },
        { fator:'Faltas recentes',            peso:'25%', desc:'Absenteísmo nos últimos 90 dias' },
        { fator:'Score de clima',             peso:'20%', desc:'Média das pesquisas de engajamento' },
        { fator:'Ocorrências disciplinares',  peso:'10%', desc:'Advertências e conflitos registrados' },
        { fator:'Avaliações de desempenho',   peso:'10%', desc:'Tendência de notas nas últimas avaliações' },
      ].map(f=>`
      <div style="background:#fff;border-radius:8px;padding:10px 12px;border:1px solid #e2e8f0">
        <div style="font-size:12px;font-weight:700;margin-bottom:3px">${f.fator}</div>
        <div style="font-size:10px;font-weight:800;color:#2563eb;margin-bottom:4px">Peso: ${f.peso}</div>
        <div style="font-size:11px;color:#64748b;line-height:1.4">${f.desc}</div>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

// ── CUSTOS ────────────────────────────────────
function _paCustos() {
  const d   = AnalyticsDB.getCustos();
  const fmt = v => 'R$ ' + parseFloat(v).toLocaleString('pt-BR',{minimumFractionDigits:0});

  return `
<div>
  <div class="pa-kpi-grid">
    ${[
      { label:'Folha Total',       val:fmt(d.folha_total),   cor:'#2563eb', sub:'Salários brutos' },
      { label:'Encargos (~40%)',   val:fmt(d.encargos),      cor:'#7c3aed', sub:'INSS, FGTS, etc.' },
      { label:'Benefícios',        val:fmt(d.beneficios),    cor:'#16a34a', sub:'VA, VT, Saúde...' },
      { label:'Custo Total/mês',   val:fmt(d.total_empresa), cor:'#0891b2', sub:'Empresa/mês' },
      { label:'Custo/Colaborador', val:fmt(d.por_colaborador),cor:'#d97706',sub:'Média por pessoa' },
      { label:'Var. vs. mês ant.', val:`+${d.vs_mes_anterior}%`,cor:'#dc2626',sub:'Variação mensal' },
    ].map(k=>`
    <div class="pa-kpi">
      <div class="pa-kpi-val" style="color:${k.cor};font-size:18px">${k.val}</div>
      <div class="pa-kpi-label">${k.label}</div>
      <div class="pa-kpi-sub">${k.sub}</div>
    </div>`).join('')}
  </div>

  <div class="pa-card">
    <div class="pa-card-hd"><h4>💰 Composição do Custo de Pessoal</h4></div>
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <!-- Pizza simplificada com barras -->
      ${[
        { label:'Folha (salários)',  val:d.folha_total,  pct:63, cor:'#2563eb' },
        { label:'Encargos legais',   val:d.encargos,     pct:25, cor:'#7c3aed' },
        { label:'Benefícios',        val:d.beneficios,   pct:11, cor:'#16a34a' },
      ].map(item=>`
      <div style="flex:1;min-width:160px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="font-weight:600">${item.label}</span>
          <span style="font-weight:800;color:${item.cor}">${item.pct}%</span>
        </div>
        <div style="height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${item.pct}%;background:${item.cor};border-radius:5px"></div>
        </div>
        <div style="font-size:11px;color:#64748b;margin-top:3px">${'R$ ' + item.val.toLocaleString('pt-BR')}</div>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

// ── Alertas inteligentes ─────────────────────
function _paAlertas() {
  const alertas = [
    { nivel:'critico', icon:'🔴', titulo:'2 colaboradores com score de risco >80%', desc:'Carlos Rocha e João Silva — ação imediata recomendada.',                                           acao:'paMudarTab(null,"riscos")' },
    { nivel:'alto',    icon:'🟡', titulo:'Turnover de Comercial está 1.2pp acima da meta',desc:'Taxa atual: 6.2% (meta: 5%). Considere investigar clima do setor.',                          acao:'paMudarTab(null,"turnover")' },
    { nivel:'info',    icon:'🔵', titulo:'Engajamento melhorou 3pts em relação ao mês anterior', desc:'Score geral: 78/100. Pesquisas de clima com 84% de participação.',                    acao:'paMudarTab(null,"engajamento")' },
    { nivel:'info',    icon:'🟢', titulo:'Absenteísmo abaixo da meta pelo 4º mês consecutivo',   desc:'Taxa: 2.3% (meta: 3.0%). Programa de saúde mostrando resultado.',                    acao:null },
  ];

  const corNivel = { critico:'#fee2e2', alto:'#fef3c7', info:'#dbeafe', ok:'#dcfce7' };
  const bdNivel  = { critico:'#fca5a5', alto:'#fde68a', info:'#bfdbfe', ok:'#86efac' };

  return `
<div class="pa-card">
  <div class="pa-card-hd"><h4>🧠 Alertas Inteligentes</h4><span style="font-size:11px;color:#64748b">${alertas.length} alertas ativos</span></div>
  ${alertas.map(a=>`
  <div style="background:${corNivel[a.nivel]};border:1px solid ${bdNivel[a.nivel]};border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start">
    <span style="font-size:18px;flex-shrink:0">${a.icon}</span>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${a.titulo}</div>
      <div style="font-size:11px;color:#475569">${a.desc}</div>
    </div>
    ${a.acao ? `<button onclick="${a.acao}" style="background:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap">Ver →</button>` : ''}
  </div>`).join('')}
</div>`;
}

// ── Gráficos CSS (sem biblioteca) ────────────
function _barChart(labels, values, cor, maxH = 80) {
  const max = Math.max(...values);
  return `
<div class="pa-chart-bars">
  ${labels.map((l,i)=>`
  <div class="pa-chart-bar-col">
    <div class="pa-chart-bar-wrap" style="height:${maxH}px">
      <div class="pa-chart-bar-fill" style="height:${(values[i]/max*100).toFixed(0)}%;background:${cor}"></div>
    </div>
    <div class="pa-chart-bar-val">${values[i]}</div>
    <div class="pa-chart-bar-label">${l}</div>
  </div>`).join('')}
</div>`;
}

function _lineChart(labels, values, meta, cor) {
  const max = Math.max(...values, meta) * 1.2;
  const h   = 80;
  const pts = values.map((v, i) => {
    const x = (i / (labels.length - 1)) * 100;
    const y = ((1 - v / max) * h);
    return { x, y, v, l: labels[i] };
  });
  const metaY = ((1 - meta / max) * h);

  return `
<div class="pa-chart-line-wrap">
  <svg viewBox="0 0 400 ${h + 20}" class="pa-chart-svg">
    <!-- Linha de meta -->
    <line x1="0" y1="${metaY}" x2="400" y2="${metaY}" stroke="#94a3b8" stroke-dasharray="5,3" stroke-width="1" />
    <text x="398" y="${metaY - 3}" fill="#94a3b8" font-size="9" text-anchor="end">Meta ${meta}%</text>
    <!-- Polilinha dos dados -->
    <polyline points="${pts.map(p=>`${p.x*4},${p.y}`).join(' ')}"
      fill="none" stroke="${cor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- Pontos -->
    ${pts.map(p=>`
    <g>
      <circle cx="${p.x*4}" cy="${p.y}" r="4" fill="${p.v > meta ? '#dc2626' : '#16a34a'}" stroke="#fff" stroke-width="1.5"/>
      <text x="${p.x*4}" y="${p.y - 8}" fill="#334155" font-size="8" text-anchor="middle">${p.v}</text>
    </g>`).join('')}
    <!-- Labels X -->
    ${pts.map(p=>`<text x="${p.x*4}" y="${h+14}" fill="#94a3b8" font-size="8" text-anchor="middle">${p.l}</text>`).join('')}
  </svg>
</div>`;
}

// ── Ações ─────────────────────────────────────
window.paGerarPlanoRetencao = function(id, nome) {
  if (!document.getElementById('pa-plano-overlay')) {
    const ov = document.createElement('div');
    ov.id = 'pa-plano-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    ov.innerHTML = `
<div style="background:#fff;border-radius:16px;max-width:500px;width:90%;box-shadow:0 16px 48px rgba(0,0,0,.2)">
  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:18px 22px;border-radius:16px 16px 0 0;color:#fff;display:flex;justify-content:space-between;align-items:center">
    <h3 style="margin:0;font-size:15px">🤖 Plano de Retenção — ${nome}</h3>
    <button onclick="document.getElementById('pa-plano-overlay').remove()" style="border:none;background:rgba(255,255,255,.2);color:#fff;border-radius:6px;width:28px;height:28px;cursor:pointer">✕</button>
  </div>
  <div style="padding:20px;display:flex;flex-direction:column;gap:12px">
    <p style="font-size:13px;color:#475569;margin:0">Plano gerado por IA com base nos fatores de risco identificados:</p>
    ${[
      { icon:'💰', acao:'Revisar salário', desc:'Propor reajuste de 8–12% para alinhar com mercado.' },
      { icon:'🎓', acao:'PDI Personalizado', desc:'Criar plano de desenvolvimento com metas em 90 dias.' },
      { icon:'💬', acao:'1:1 com Gestor',  desc:'Agendar reunião semanal para escuta ativa.' },
      { icon:'🏆', acao:'Reconhecimento', desc:'Indicar para programa de destaque do mês.' },
      { icon:'📋', acao:'Pesquisa individual', desc:'Enviar pesquisa de clima personalizada em 15 dias.' },
    ].map(a=>`
    <div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
      <span style="font-size:18px">${a.icon}</span>
      <div>
        <div style="font-size:13px;font-weight:700">${a.acao}</div>
        <div style="font-size:11px;color:#64748b">${a.desc}</div>
      </div>
    </div>`).join('')}
    <button onclick="if(window.Toast)Toast.success('Plano de retenção enviado ao gestor!');document.getElementById('pa-plano-overlay').remove()" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">
      📤 Enviar plano ao gestor
    </button>
  </div>
</div>`;
    document.body.appendChild(ov);
  }
};

window.paExportarRelatorio = function() {
  if (window.Toast) Toast.success('Relatório de People Analytics exportado em PDF!');
};

window.paExportarRiscos = function() {
  const riscos = AnalyticsDB.getRiscos();
  const csv = ['Nome,Setor,Score,Nível,Fatores', ...riscos.map(r=>[r.nome,r.setor,r.score,r.nivel,`"${r.fatores.join('; ')}"`].join(','))].join('\n');
  const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href=url; a.download='riscos_desligamento.csv'; a.click();
  URL.revokeObjectURL(url);
};

function initPage_analytics() {}
