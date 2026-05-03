/**
 * bonificacoes-hub.js — Hub principal do módulo Bonificações & Formulários
 * Camada de dados (BonifDB), motor de insights, navegação e dashboard
 * Expõe: renderBonificacoes(), BonifDB, BonifColabs, BonifFmt
 */

// ─────────────────────────────────────────────────────────────
// DADOS PADRÃO
// ─────────────────────────────────────────────────────────────
const _BONUS_TIPOS_DEFAULT = [
  { id:'BT_KPI',    nome:'Bônus por KPI/Meta',   descricao:'Recompensa por atingimento de metas',         tipo:'kpi',       ativo:true, cor:'#3b82f6', icon:'🎯' },
  { id:'BT_IND',    nome:'Bônus por Indicação',  descricao:'Premiação ao indicar colaborador admitido',    tipo:'indicacao', ativo:true, cor:'#16a34a', icon:'🤝' },
  { id:'BT_PIT',    nome:'PIT — Ideias & Inovaçao', descricao:'Programa de ideias e sugestões aprovadas', tipo:'pit',       ativo:true, cor:'#f59e0b', icon:'💡' },
  { id:'BT_BEN',    nome:'Benefício Extra',       descricao:'Benefícios adicionais por desempenho',        tipo:'beneficio', ativo:true, cor:'#7c3aed', icon:'🎁' },
  { id:'BT_FIX',    nome:'Bonificação Fixa',      descricao:'Valor fixo por cargo ou tempo de casa',       tipo:'fixo',      ativo:false,cor:'#64748b', icon:'💰' },
];

const _BONUS_REGRAS_DEFAULT = [
  {
    id:'BR_001', bonus_tipo_id:'BT_KPI', nome:'Meta ≥ 100% — Bônus 10%',
    formula:'salario * 0.10', ativo:true,
    condicoes:[{ campo:'meta_pct', op:'>=', valor:100 }],
    descricao:'Se o colaborador atingiu 100% ou mais da meta mensal, recebe 10% do salário base.',
  },
  {
    id:'BR_002', bonus_tipo_id:'BT_KPI', nome:'Meta ≥ 80% — Bônus 5%',
    formula:'salario * 0.05', ativo:true,
    condicoes:[{ campo:'meta_pct', op:'>=', valor:80 },{ campo:'meta_pct', op:'<', valor:100 }],
    descricao:'Se atingiu entre 80% e 99% da meta, recebe 5% do salário base.',
  },
  {
    id:'BR_003', bonus_tipo_id:'BT_IND', nome:'Indicação aprovada — R$ 500',
    formula:'500', ativo:true,
    condicoes:[{ campo:'indicacoes_aprovadas', op:'>=', valor:1 }],
    descricao:'R$ 500 por cada colaborador indicado e efetivado no mês.',
  },
  {
    id:'BR_004', bonus_tipo_id:'BT_BEN', nome:'Zero faltas — VT adicional',
    formula:'150', ativo:true,
    condicoes:[{ campo:'faltas', op:'==', valor:0 }],
    descricao:'Colaboradores sem nenhuma falta no mês recebem R$ 150 de bônus de assiduidade.',
  },
];

const _FORMS_DEFAULT = [
  {
    id:'FORM_CLIMA_01', titulo:'Pesquisa de Clima 2025.1', descricao:'Avalie sua satisfação com o ambiente de trabalho.',
    tipo:'clima', modo:'anonimo', status:'ativo', respostas_count:0,
    agendamento:{ inicio:'2025-05-01', fim:'2025-05-31' },
    envio:{ email:true, whatsapp:false, interno:true },
    criado_por:'Mariana R.', criado_em:'2025-05-01T09:00:00Z',
    campos:[
      { id:'c1', tipo:'escala', label:'Satisfação geral com a empresa', obrigatorio:true, opcoes:null, condicional:null, ordem:1 },
      { id:'c2', tipo:'nps',    label:'Em uma escala de 0 a 10, o quanto você recomendaria a empresa?', obrigatorio:true, opcoes:null, condicional:null, ordem:2 },
      { id:'c3', tipo:'multipla', label:'Qual aspecto mais precisa melhorar?', obrigatorio:false,
        opcoes:['Comunicação interna','Benefícios','Liderança','Crescimento profissional','Ambiente físico'], condicional:null, ordem:3 },
      { id:'c4', tipo:'texto', label:'Deixe sua sugestão ou comentário', obrigatorio:false, opcoes:null, condicional:null, ordem:4 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// BANCO DE DADOS
// ─────────────────────────────────────────────────────────────
const BonifDB = {
  KEY: 'hiRH_bonif_v1',

  _defaults() {
    return {
      bonus_tipos:         _BONUS_TIPOS_DEFAULT,
      bonus_regras:        _BONUS_REGRAS_DEFAULT,
      bonus_ciclos:        [],
      lancamentos:         [],   // planilha de bonificações (CRUD direto)
      forms:               _FORMS_DEFAULT,
      form_respostas:      [],
      form_respostas_meta: {},
      auditoria:           [],
    };
  },

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) { const d = this._defaults(); this.set(d); return d; }
      const p = JSON.parse(raw);
      const d = this._defaults();
      return {
        bonus_tipos:  p.bonus_tipos?.length  ? p.bonus_tipos  : d.bonus_tipos,
        bonus_regras: p.bonus_regras?.length  ? p.bonus_regras : d.bonus_regras,
        bonus_ciclos: p.bonus_ciclos  || [],
        lancamentos:  p.lancamentos   || [],
        forms:        p.forms?.length         ? p.forms        : d.forms,
        form_respostas:    p.form_respostas    || [],
        form_respostas_meta: p.form_respostas_meta || {},
        auditoria:    p.auditoria     || [],
      };
    } catch { return this._defaults(); }
  },

  set(data) { try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {} },

  upsert(col, item) {
    const d = this.get();
    const i = d[col].findIndex(x => x.id === item.id);
    if (i >= 0) d[col][i] = item; else d[col].unshift(item);
    this.set(d); return item;
  },

  remove(col, id) { const d = this.get(); d[col] = d[col].filter(x => x.id !== id); this.set(d); },

  addAuditoria(acao, detalhes) {
    const d = this.get();
    d.auditoria.unshift({ id:'AUD_'+Date.now(), acao, detalhes, em: new Date().toISOString(), por: _userNome() });
    if (d.auditoria.length > 200) d.auditoria = d.auditoria.slice(0,200);
    this.set(d);
  },
};

// ─────────────────────────────────────────────────────────────
// COLABORADORES
// ─────────────────────────────────────────────────────────────
const BonifColabs = {
  getAll() {
    const dp = JSON.parse(localStorage.getItem('dp_colaboradores') || '[]');
    const rh = (window.RHData?.colaboradores || []).map(c => ({
      id: c.id, nome_completo: c.nome, cargo: c.cargo,
      setor: c.setor || c.departamento, salario_base: c.salario,
      status: c.status, data_admissao: c.dataAdmissao,
    }));
    const merged = [...dp];
    rh.forEach(c => { if (!merged.find(x => x.id === c.id)) merged.push(c); });
    // Garante ao menos 3 colaboradores de demonstração
    if (merged.length === 0) return _colabsDemo();
    return merged.filter(c => c.status !== 'demitido');
  },
};

function _colabsDemo() {
  return [
    { id:'DEMO_01', nome_completo:'João Silva',    cargo:'Vendedor',          setor:'Comercial',  salario_base:3500,  status:'ativo', data_admissao:'2024-01-15' },
    { id:'DEMO_02', nome_completo:'Maria Oliveira',cargo:'Analista de RH',   setor:'RH',          salario_base:5200,  status:'ativo', data_admissao:'2023-06-01' },
    { id:'DEMO_03', nome_completo:'Carlos Souza',  cargo:'Supervisor',        setor:'Comercial',  salario_base:6800,  status:'ativo', data_admissao:'2022-03-10' },
    { id:'DEMO_04', nome_completo:'Ana Lima',       cargo:'Assistente Adm.',  setor:'Administrativo',salario_base:2800,status:'ativo', data_admissao:'2024-08-01' },
    { id:'DEMO_05', nome_completo:'Paulo Santos',  cargo:'Desenvolvedor',     setor:'TI',          salario_base:7500,  status:'ativo', data_admissao:'2023-11-01' },
  ];
}

// ─────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────
const BonifFmt = {
  moeda:  v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),
  data:   iso => { try { return new Date(iso.substring(0,10)+'T00:00:00').toLocaleDateString('pt-BR'); } catch { return iso||'—'; } },
  ini:    nome => { const p=String(nome||'?').split(' '); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase(); },
  mesNome:mes  => { const [y,m] = mes.split('-'); const ns=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return `${ns[+m-1]}/${y}`; },
  pct:    v => parseFloat(v||0).toFixed(1) + '%',
};

function _userNome() { try { return JSON.parse(sessionStorage.getItem('hiRH_user')||'{}').nome||'Sistema'; } catch { return 'Sistema'; } }

// ─────────────────────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────
let _bnfAba = 'dashboard';

const _ABAS = [
  { id:'dashboard',    label:'Dashboard',    icon:'📊' },
  { id:'bonificacoes', label:'Bonificações', icon:'💰' },
  { id:'relatorios',   label:'Relatórios',   icon:'📈' },
];

window.bnfIrPara = function(id) {
  _bnfAba = id;
  document.querySelectorAll('.bnf-subnav-btn').forEach(b => b.classList.toggle('ativo', b.dataset.aba === id));
  const cont = document.getElementById('bnf-conteudo');
  if (!cont) return;
  const fn = { dashboard: _renderDashboard, bonificacoes: () => window.BonifEngine?.render(cont), relatorios: () => window.BonifRelatorios?.render(cont) };
  const result = fn[id]?.(cont);
  if (typeof result === 'string') cont.innerHTML = result;
};

// ─────────────────────────────────────────────────────────────
// ENTRADA PRINCIPAL (app.js)
// ─────────────────────────────────────────────────────────────
function renderBonificacoes() {
  const db     = BonifDB.get();
  const colabs = BonifColabs.getAll();
  const forms  = db.forms;
  const ciclos = db.bonus_ciclos;
  const pendAprov = ciclos.filter(c => c.status === 'calculado').length;
  const ativosF   = forms.filter(f => f.status === 'ativo').length;

  const alerts = _calcInsights(db, colabs);

  const html = `
<div class="bnf-root">
  <!-- HERO -->
  <div class="bnf-hero">
    <div class="bnf-hero-left">
      <span class="bnf-hero-icon">🚀</span>
      <div>
        <h2>Bonificações & Formulários</h2>
        <p>Automação inteligente de bônus · Form builder · Relatórios em tempo real</p>
      </div>
    </div>
    <div class="bnf-hero-right">
      ${pendAprov > 0 ? `<span class="bnf-alert bnf-alert-warn" style="margin:0;padding:6px 12px;font-size:12px">⚠️ ${pendAprov} ciclo(s) aguardando aprovação</span>` : ''}
      ${ativosF   > 0 ? `<span style="font-size:12px;color:rgba(255,255,255,.65)">📋 ${ativosF} formulário(s) ativos</span>` : ''}
    </div>
  </div>

  <!-- SUBNAV -->
  <div class="bnf-subnav">
    ${_ABAS.map(a => `
      <button class="bnf-subnav-btn ${a.id==='dashboard'?'ativo':''}" data-aba="${a.id}" onclick="bnfIrPara('${a.id}')">
        ${a.icon} ${a.label}
        ${a.id==='bonificacoes' && pendAprov > 0 ? `<span class="bnf-badge">${pendAprov}</span>` : ''}
      </button>`).join('')}
  </div>

  <!-- CONTEÚDO -->
  <div id="bnf-conteudo"></div>
</div>`;

  setTimeout(() => bnfIrPara('dashboard'), 0);
  return html;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function _renderDashboard(container) {
  const db     = BonifDB.get();
  const colabs = BonifColabs.getAll();
  const forms  = db.forms;
  const ciclos = db.bonus_ciclos;
  const insights = _calcInsights(db, colabs);

  // Totais
  const totalRespostas = db.form_respostas.length;
  const totalBonusCalc = ciclos.reduce((s,c) => s + (c.itens?.reduce((ss,i) => ss + (i.elegivel?i.valor_calculado:0), 0)||0), 0);
  const totalCiclos    = ciclos.length;
  const ultimoCiclo    = ciclos[0];
  const economiaPlanilha = totalBonusCalc > 0 ? totalBonusCalc * 0.03 : 0; // 3% estimado de custo operacional

  const cont = container || document.getElementById('bnf-conteudo');
  if (!cont) return;

  cont.innerHTML = `
<div>
  <!-- KPIs -->
  <div class="bnf-kpis">
    <div class="bnf-kpi bnf-kpi-purple">
      <span class="bnf-kpi-icon">📋</span>
      <span class="bnf-kpi-val">${forms.length}</span>
      <span class="bnf-kpi-label">Formulários criados</span>
      <span class="bnf-kpi-sub">${forms.filter(f=>f.status==='ativo').length} ativos agora</span>
    </div>
    <div class="bnf-kpi bnf-kpi-blue">
      <span class="bnf-kpi-icon">✍️</span>
      <span class="bnf-kpi-val">${totalRespostas}</span>
      <span class="bnf-kpi-label">Respostas coletadas</span>
      <span class="bnf-kpi-sub">Em todos os formulários</span>
    </div>
    <div class="bnf-kpi bnf-kpi-green">
      <span class="bnf-kpi-icon">💰</span>
      <span class="bnf-kpi-val">${BonifFmt.moeda(totalBonusCalc)}</span>
      <span class="bnf-kpi-label">Total bonificado</span>
      <span class="bnf-kpi-sub">${totalCiclos} ciclo(s) calculados</span>
    </div>
    <div class="bnf-kpi bnf-kpi-teal">
      <span class="bnf-kpi-icon">👥</span>
      <span class="bnf-kpi-val">${colabs.length}</span>
      <span class="bnf-kpi-label">Colaboradores</span>
      <span class="bnf-kpi-sub">Base para cálculos</span>
    </div>
    <div class="bnf-kpi bnf-kpi-yellow">
      <span class="bnf-kpi-icon">⚡</span>
      <span class="bnf-kpi-val">${db.bonus_regras.filter(r=>r.ativo).length}</span>
      <span class="bnf-kpi-label">Regras ativas</span>
      <span class="bnf-kpi-sub">${db.bonus_tipos.length} tipos de bônus</span>
    </div>
    <div class="bnf-kpi bnf-kpi-green">
      <span class="bnf-kpi-icon">💡</span>
      <span class="bnf-kpi-val">${BonifFmt.moeda(economiaPlanilha)}</span>
      <span class="bnf-kpi-label">Economia estimada</span>
      <span class="bnf-kpi-sub">vs. controle manual em planilhas</span>
    </div>
  </div>

  <!-- INSIGHTS INTELIGENTES -->
  ${insights.length > 0 ? `
  <div style="margin-bottom:20px">
    ${insights.map(ins => `
      <div class="bnf-insight" style="margin-bottom:10px">
        <span class="bnf-insight-icon">${ins.icon}</span>
        <div class="bnf-insight-body">
          <strong>${ins.titulo}</strong>
          <p>${ins.texto}</p>
        </div>
        ${ins.acao ? `<button class="dp-btn dp-btn-secondary" style="flex-shrink:0;font-size:11px;padding:4px 12px;align-self:center" onclick="${ins.acao}">${ins.acao_label}</button>` : ''}
      </div>`).join('')}
  </div>` : ''}

  <div class="bnf-2col">
    <!-- Formulários recentes -->
    <div class="bnf-card">
      <div class="bnf-card-hd">
        <h4>📋 Formulários Recentes</h4>
        <a href="#" onclick="bnfIrPara('formularios')" style="font-size:12px;color:var(--primary,#2563eb)">Ver todos →</a>
      </div>
      ${forms.slice(0,4).map(f => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color,#f1f5f9)">
          <span style="font-size:20px">${_iconForm(f.tipo)}</span>
          <div style="flex:1;min-width:0">
            <strong style="font-size:13px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.titulo}</strong>
            <small style="color:var(--text-muted)">${f.respostas_count||0} respostas · ${BonifFmt.data(f.criado_em)}</small>
          </div>
          <span class="bnf-status bnf-st-${f.status}">${f.status}</span>
        </div>`).join('')}
      ${forms.length === 0 ? `<div class="bnf-empty"><span class="bnf-empty-icon">📋</span><p>Nenhum formulário ainda</p></div>` : ''}
    </div>

    <!-- Últimos ciclos de bônus -->
    <div class="bnf-card">
      <div class="bnf-card-hd">
        <h4>💰 Últimos Ciclos de Bônus</h4>
        <a href="#" onclick="bnfIrPara('bonificacoes')" style="font-size:12px;color:var(--primary,#2563eb)">Ver todos →</a>
      </div>
      ${ciclos.slice(0,4).map(c => {
        const total  = c.itens?.reduce((s,i) => s + (i.elegivel?i.valor_calculado:0), 0) || 0;
        const elegiv = c.itens?.filter(i => i.elegivel).length || 0;
        return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color,#f1f5f9)">
          <div style="flex:1">
            <strong style="font-size:13px">${BonifFmt.mesNome(c.mes)}</strong>
            <small style="display:block;color:var(--text-muted)">${elegiv} colaboradores elegíveis</small>
          </div>
          <strong style="color:#16a34a;font-size:14px">${BonifFmt.moeda(total)}</strong>
          <span class="bnf-status bnf-st-${c.status}">${c.status}</span>
        </div>`;
      }).join('')}
      ${ciclos.length === 0 ? `
        <div class="bnf-empty"><span class="bnf-empty-icon">💰</span><p>Nenhum ciclo calculado</p><small>Clique em Bonificações → Gerar</small></div>` : ''}
    </div>
  </div>

  <!-- Fluxo do sistema -->
  <div class="bnf-card" style="margin-top:16px">
    <div class="bnf-card-hd"><h4>⚙️ Como funciona o Motor Automático</h4></div>
    <div style="display:flex;gap:0;align-items:stretch;overflow-x:auto;padding-bottom:4px">
      ${[
        { n:'1', icon:'👥', titulo:'Colaboradores', desc:'Importados automaticamente do DP e Gestão de Pessoas' },
        { n:'2', icon:'⚡', titulo:'Regras',         desc:'Configure as condições: meta ≥ 100% → bônus 10%' },
        { n:'3', icon:'🔄', titulo:'Cálculo',        desc:'Clique em "Gerar Bonificação" — zero planilhas' },
        { n:'4', icon:'✅', titulo:'Aprovação',      desc:'RH revisa e aprova o ciclo calculado' },
        { n:'5', icon:'📊', titulo:'Relatório',      desc:'Exporta PDF/CSV para folha de pagamento' },
      ].map((s,i) => `
        <div style="flex:1;min-width:130px;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 12px;position:relative">
          ${i > 0 ? `<div style="position:absolute;left:0;top:28px;width:12px;border-top:2px dashed var(--border-color,#e2e8f0)"></div>` : ''}
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary,#2563eb);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:8px">${s.icon}</div>
          <strong style="font-size:12px;display:block;margin-bottom:4px">${s.titulo}</strong>
          <small style="font-size:11px;color:var(--text-muted)">${s.desc}</small>
        </div>`).join('')}
    </div>
  </div>
</div>`;
}

function _calcInsights(db, colabs) {
  const insights = [];
  const agora = new Date();

  // Formulários com alto engajamento
  const formsAtivos = db.forms.filter(f => f.status === 'ativo');
  if (formsAtivos.length > 0) {
    insights.push({
      icon:'📊', titulo:'Formulários coletando respostas',
      texto:`${formsAtivos.length} formulário(s) ativo(s). Total de ${db.form_respostas.length} resposta(s) coletadas.`,
      acao: "bnfIrPara('formularios')", acao_label:'Ver respostas',
    });
  }

  // Ciclos pendentes de aprovação
  const pendentes = db.bonus_ciclos.filter(c => c.status === 'calculado');
  if (pendentes.length > 0) {
    const totalPend = pendentes.reduce((s,c) => s + (c.itens?.reduce((ss,i)=>ss+(i.elegivel?i.valor_calculado:0),0)||0), 0);
    insights.push({
      icon:'⚠️', titulo:'Bônus calculados aguardam aprovação',
      texto:`${pendentes.length} ciclo(s) com ${BonifFmt.moeda(totalPend)} calculados. Acesse Bonificações para aprovar.`,
      acao: "bnfIrPara('bonificacoes')", acao_label:'Aprovar agora',
    });
  }

  // Sugestão: nenhum ciclo este mês
  const mesAtual = agora.toISOString().slice(0,7);
  const cicloMes = db.bonus_ciclos.find(c => c.mes === mesAtual);
  if (!cicloMes && colabs.length > 0) {
    insights.push({
      icon:'💡', titulo:`Sugestão: Gere o bônus de ${BonifFmt.mesNome(mesAtual)}`,
      texto:`Nenhum ciclo foi calculado este mês. ${colabs.length} colaboradores podem ser elegíveis com base nas regras ativas.`,
      acao: "bnfIrPara('bonificacoes')", acao_label:'Gerar agora',
    });
  }

  return insights;
}

function _iconForm(tipo) {
  return { clima:'🌡️', avaliacao:'📋', feedback:'💬', nps:'⭐', custom:'📝' }[tipo] || '📝';
}

// Globaliza helpers para uso nos sub-módulos
window.BonifDB     = BonifDB;
window.BonifColabs = BonifColabs;
window.BonifFmt    = BonifFmt;
window._userNome   = _userNome;
window._iconForm   = _iconForm;

// ─────────────────────────────────────────────────────────────
// ADAPTER PARA O DP HUB
// Permite que DPHub.irPara('bonificacoes') funcione normalmente
// ─────────────────────────────────────────────────────────────
window.DPBonificacoes = {
  render(container) {
    container.innerHTML = renderBonificacoes();
  },
};
