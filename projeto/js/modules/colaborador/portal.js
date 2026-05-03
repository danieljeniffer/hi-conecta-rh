/**
 * portal.js — Portal do Colaborador
 * hi Conecta RH · Autoatendimento completo com regras CLT brasileiras
 */

// ─── BANCO DE DADOS ───────────────────────────────────────────
const PortalDB = {
  KEY: 'hiRH_portal_v1',

  _defaults(user) {
    const hoje = new Date();
    const mes  = hoje.toISOString().slice(0,7);
    return {
      pontos: _gerarEspelho(hoje),
      solicitacoes_ferias: [],
      ideias: [
        { id:'ID1', titulo:'Horário flexível às sextas', descricao:'Permitir saída às 16h às sextas mediante cumprimento de horas semanais.', status:'aprovada', votos:28, data:'2025-04-10', autor: user?.nome||'Você' },
        { id:'ID2', titulo:'Espaço de relaxamento', descricao:'Criar uma sala de descanso com sofá e plantas.', status:'em_analise', votos:14, data:'2025-05-02', autor: user?.nome||'Você' },
      ],
      documentos_assinados: [],
      notificacoes: [
        { id:'N1', tipo:'ferias',    icone:'🏖️', titulo:'Férias vencendo',        desc:'Seu período aquisitivo vence em 45 dias.',          tempo:'Hoje',   lida:false, acao:'ferias' },
        { id:'N2', tipo:'pagamento', icone:'💰', titulo:'Holerite disponível',     desc:'Seu contracheque de Maio/2025 foi liberado.',       tempo:'2h',     lida:false, acao:'holerite' },
        { id:'N3', tipo:'avaliacao', icone:'📋', titulo:'Avaliação pendente',      desc:'Avaliação de 45 dias aguarda sua participação.',    tempo:'1 dia',  lida:false, acao:'avaliacoes' },
        { id:'N4', tipo:'ponto',     icone:'⏱️', titulo:'Ajuste de ponto aprovado','desc':'Solicitação de ajuste do dia 20/05 foi aprovada.', tempo:'3 dias', lida:true,  acao:'ponto' },
        { id:'N5', tipo:'beneficio', icone:'💳', titulo:'Recarga Caju realizada',  desc:'R$ 550 creditados no seu cartão alimentação.',      tempo:'5 dias', lida:true,  acao:'beneficios' },
      ],
      chat: [],
      perfil_extra: {
        banco: 'Banco do Brasil', agencia: '1234-5', conta: '98765-4', tipo_conta: 'Corrente',
        dependentes: [
          { nome:'Ana Silva', parentesco:'Cônjuge', cpf:'***.456.789-**', nascimento:'1990-03-15' },
        ],
        endereco: 'Rua das Flores, 123 — João Pessoa, PB',
        telefone: '(83) 99999-1234',
      },
      pesquisas_respondidas: [],
    };
  },

  get() {
    const user = PortalUser.get();
    try {
      const raw = localStorage.getItem(this.KEY + '_' + (user?.email||'anon'));
      if (!raw) { const d = this._defaults(user); this.set(d); return d; }
      return JSON.parse(raw);
    } catch { return this._defaults(user); }
  },

  set(data) {
    const user = PortalUser.get();
    try { localStorage.setItem(this.KEY + '_' + (user?.email||'anon'), JSON.stringify(data)); } catch {}
  },

  update(fn) { const d = this.get(); fn(d); this.set(d); },
};

function _gerarEspelho(hoje) {
  const registros = [];
  const ano  = hoje.getFullYear();
  const mes  = hoje.getMonth();
  const diasNoMes = new Date(ano, mes+1, 0).getDate();
  const diaHoje = hoje.getDate();

  for (let d = 1; d <= Math.min(diaHoje, diasNoMes); d++) {
    const dt  = new Date(ano, mes, d);
    const dow = dt.getDay();
    if (dow === 0 || dow === 6) continue; // fim de semana
    const falta = d === 7; // simula falta no dia 7
    const atraso = d === 14; // simula atraso no dia 14
    registros.push({
      data: dt.toISOString().slice(0,10),
      entrada:  falta ? null : atraso ? '08:18' : '08:00',
      intervalo:'12:00',
      retorno:  falta ? null : '13:00',
      saida:    falta ? null : '17:00',
      falta, atraso,
      he: false,
    });
  }
  return registros;
}

// ─── CONTEXTO DO USUÁRIO ──────────────────────────────────────
const PortalUser = {
  get() { try { return JSON.parse(sessionStorage.getItem('hiRH_user')||'{}'); } catch { return {}; } },
  nome()    { return this.get().nome  || 'Colaborador'; },
  cargo()   { return this.get().cargo || '—'; },
  setor()   { return this.get().setor || 'Comercial'; },
  iniciais(){ const n = this.nome().split(' '); return ((n[0]?.[0]||'')+(n[1]?.[0]||'')).toUpperCase(); },
  salario() {
    const u = this.get();
    if (u.salario) return parseFloat(u.salario);
    const map = { rh:5200, gestor:6800, analista:4500, admin:8000, colab:3500, juridico:7000 };
    return map[u.perfil||'colab'] || 3500;
  },
  admissao(){ return this.get().admissao || '2023-03-01'; },
};

// ─── FORMATADORES ─────────────────────────────────────────────
const PFmt = {
  moeda:  v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),
  data:   iso => { try { return new Date(iso+'T12:00').toLocaleDateString('pt-BR'); } catch { return iso||'—'; } },
  mesNome:iso => { const [y,m]=iso.split('-'); const ns=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return `${ns[+m-1]}/${y}`; },
  ini:    nome => { const p=String(nome||'?').split(' '); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase(); },
  diaSemana: iso => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date(iso+'T12:00').getDay()],
};

// ─── CÁLCULOS CLT (Brasil 2024) ───────────────────────────────
const CLT = {
  inss(salario) {
    const faixas = [[1320.00,0.075],[2571.29,0.09],[3856.94,0.12],[7507.49,0.14]];
    let desc = 0, base = salario;
    for (const [teto, aliq] of faixas) {
      if (salario <= 0) break;
      const faixa = Math.min(base, teto);
      desc += faixa * aliq;
      base -= faixa;
      if (base <= 0) break;
    }
    return Math.min(desc, 908.85); // teto INSS 2024
  },

  irrf(salario, dependentes=0) {
    const base = salario - this.inss(salario) - (dependentes * 189.59);
    const faixas = [
      [2259.20, 0,      0      ],
      [2826.65, 0.075,  169.44 ],
      [3751.05, 0.15,   381.44 ],
      [4664.68, 0.225,  662.77 ],
      [Infinity,0.275,  896.00 ],
    ];
    for (const [teto, aliq, deducao] of faixas) {
      if (base <= teto) return Math.max(0, base * aliq - deducao);
    }
    return 0;
  },

  fgts: (salario) => salario * 0.08,

  liquido(salario, dependentes=0) {
    const inss  = this.inss(salario);
    const irrf  = this.irrf(salario, dependentes);
    return salario - inss - irrf;
  },

  ferias(salario, dias=30) {
    const base    = (salario / 30) * dias;
    const terco   = base / 3;
    const inss    = this.inss(base + terco);
    const irrf    = this.irrf(base + terco - inss);
    return { bruto: base + terco, terco, inss, irrf, liquido: base + terco - inss - irrf };
  },
};

// ─── NAVEGAÇÃO ────────────────────────────────────────────────
let _ptlSec = 'dashboard';

const _MENUS = [
  { sec:'dashboard',    icon:'🏠', label:'Meu Painel',       grupo:'pessoal' },
  { sec:'jornada',      icon:'🚀', label:'Minha Jornada',    grupo:'pessoal' },
  { sec:'ponto',        icon:'⏱️', label:'Ponto Eletrônico', grupo:'pessoal', badge: 0 },
  { sec:'holerite',     icon:'💰', label:'Holerite',          grupo:'pessoal' },
  { sec:'ferias',       icon:'🏖️', label:'Férias',            grupo:'pessoal' },
  { sec:'beneficios',   icon:'💳', label:'Benefícios',        grupo:'pessoal' },
  { sec:'documentos',   icon:'📄', label:'Documentos',        grupo:'pessoal' },
  { sec:'perfil',       icon:'👤', label:'Meu Perfil',        grupo:'pessoal' },
  { sec:'comunicacao',  icon:'📢', label:'Comunicação',       grupo:'empresa' },
  { sec:'avaliacoes',   icon:'📋', label:'Avaliações',        grupo:'empresa', dot: true },
  { sec:'ideias',       icon:'💡', label:'Ideias (PIT)',      grupo:'empresa' },
  { sec:'pesquisas',    icon:'📝', label:'Pesquisas',         grupo:'empresa' },
  { sec:'notificacoes', icon:'🔔', label:'Notificações',      grupo:'empresa', badge: 3 },
  { sec:'assistente',   icon:'🤖', label:'Assistente IA',     grupo:'extra' },
];

function renderPortal() {
  const user = PortalUser.get();
  const ini  = PortalUser.iniciais();
  const db   = PortalDB.get();
  const nNL  = db.notificacoes.filter(n=>!n.lida).length;

  const menuHtml = _MENUS.map(m => {
    const badge = m.sec==='notificacoes' ? nNL : (m.badge||0);
    return `
    <button class="ptl-nav-btn ${_ptlSec===m.sec?'ativo':''}" onclick="ptlNav('${m.sec}')">
      <span class="ptl-nav-icon">${m.icon}</span>
      <span class="ptl-nav-label">${m.label}</span>
      ${badge > 0 ? `<span class="ptl-nav-badge">${badge}</span>` : ''}
      ${m.dot && !badge ? `<span class="ptl-nav-dot"></span>` : ''}
    </button>`;
  });

  const grupoLabel = g => `<div class="ptl-nav-section">${{pessoal:'Meus Dados',empresa:'Empresa',extra:'Inteligente'}[g]}</div>`;
  let lastGrupo = '';
  const navCompleto = _MENUS.map(m => {
    let out = '';
    if (m.grupo !== lastGrupo) { out += grupoLabel(m.grupo); lastGrupo = m.grupo; }
    const badge = m.sec==='notificacoes' ? nNL : (m.badge||0);
    out += `<button class="ptl-nav-btn ${_ptlSec===m.sec?'ativo':''}" onclick="ptlNav('${m.sec}')">
      <span class="ptl-nav-icon">${m.icon}</span>
      <span class="ptl-nav-label">${m.label}</span>
      ${badge>0?`<span class="ptl-nav-badge">${badge}</span>`:''}
      ${m.dot&&!badge?`<span class="ptl-nav-dot"></span>`:''}
    </button>`;
    return out;
  }).join('');

  const pts = _calcPontos(db);

  const html = `
<div class="ptl-root">
  <!-- SIDEBAR -->
  <div class="ptl-sidebar">
    <div class="ptl-sidebar-hd">
      <div class="ptl-sidebar-avatar">${ini}</div>
      <div class="ptl-sidebar-nome">${PortalUser.nome()}</div>
      <div class="ptl-sidebar-cargo">${PortalUser.cargo()}</div>
      <span class="ptl-sidebar-badge">⭐ ${pts} pts</span>
    </div>
    <div class="ptl-sidebar-nav">${navCompleto}</div>
    <div class="ptl-sidebar-footer">
      <div class="ptl-sidebar-pts">
        <strong>⭐ ${pts} pts</strong>
        Nível: ${pts >= 500 ? '🥇 Ouro' : pts >= 200 ? '🥈 Prata' : '🥉 Bronze'}
      </div>
    </div>
  </div>

  <!-- CONTEÚDO -->
  <div class="ptl-main" id="ptl-conteudo"></div>
</div>`;

  setTimeout(() => { ptlNav(_ptlSec); }, 0);
  return html;
}

window.ptlNav = function(sec) {
  _ptlSec = sec;

  // Controla modo página-inteira para a jornada
  const root = document.querySelector('.ptl-root');
  if (root) root.classList.toggle('ptl-jornada-page', sec === 'jornada');

  document.querySelectorAll('.ptl-nav-btn').forEach(b => {
    b.classList.toggle('ativo', b.getAttribute('onclick')?.includes(`'${sec}'`));
  });

  const cont = document.getElementById('ptl-conteudo');
  if (!cont) return;

  const fns = {
    dashboard:    _ptlDashboard,
    jornada:      _ptlJornada,
    ponto:        _ptlPonto,
    holerite:     _ptlHolerite,
    ferias:       _ptlFerias,
    beneficios:   _ptlBeneficios,
    documentos:   _ptlDocumentos,
    comunicacao:  _ptlComunicacao,
    avaliacoes:   _ptlAvaliacoes,
    ideias:       _ptlIdeias,
    pesquisas:    _ptlPesquisas,
    notificacoes: _ptlNotificacoes,
    perfil:       _ptlPerfil,
    assistente:   _ptlAssistente,
  };

  cont.innerHTML = fns[sec]?.() || '<p>Em breve.</p>';
  if (sec === 'ponto') _iniciarRelogio();
  cont.scrollTop = 0;
};

// ── 1. DASHBOARD ──────────────────────────────────────────────
function _ptlDashboard() {
  const user    = PortalUser.get();
  const salario = PortalUser.salario();
  const liq     = CLT.liquido(salario, 1);
  const db      = PortalDB.get();
  const nNL     = db.notificacoes.filter(n=>!n.lida).length;
  const saldo   = _calcSaldoFerias();
  const pts     = _calcPontos(db);
  const h = new Date().getHours();
  const saudacao = h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';

  const alertas = db.notificacoes.filter(n=>!n.lida).slice(0,3);

  return `
<div>
  <!-- HERO -->
  <div class="ptl-hero">
    <div>
      <h2>${saudacao}, ${PortalUser.nome().split(' ')[0]}! 👋</h2>
      <p>${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Portal do Colaborador</p>
    </div>
    <div class="ptl-hero-right">
      ${nNL>0?`<button class="ptl-btn" onclick="ptlNav('notificacoes')">🔔 ${nNL} alerta${nNL>1?'s':''}</button>`:''}
      <button class="ptl-btn" style="background:rgba(255,255,255,.15)" onclick="ptlNav('assistente')">🤖 Assistente</button>
    </div>
  </div>

  <!-- GAMIFICAÇÃO -->
  <div class="ptl-gamif">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-size:13px;opacity:.8;margin-bottom:4px">Seu nível de engajamento</div>
        <div style="font-size:18px;font-weight:800">${pts >= 500 ? '🥇 Ouro' : pts >= 200 ? '🥈 Prata' : '🥉 Bronze'} — ${pts} pts</div>
      </div>
      <div style="text-align:right;font-size:11px;opacity:.75">
        Próximo nível: ${pts >= 500 ? '—' : pts >= 200 ? `${500-pts} pts para Ouro` : `${200-pts} pts para Prata`}
      </div>
    </div>
    <div class="ptl-progress-bar">
      <div class="ptl-progress-fill" style="width:${Math.min(100, pts >= 500 ? 100 : pts >= 200 ? (pts-200)/3 : pts/2)}%"></div>
    </div>
    <div style="display:flex;gap:16px;margin-top:4px;font-size:11px;opacity:.75;flex-wrap:wrap">
      <span>✅ Presença: +5 pts/dia</span>
      <span>💡 Ideia aprovada: +50 pts</span>
      <span>📋 Avaliação: +30 pts</span>
    </div>
  </div>

  <!-- KPIs -->
  <div class="ptl-kpis">
    <div class="ptl-kpi ptl-kpi-green">
      <div class="ptl-kpi-icon">💰</div>
      <div class="ptl-kpi-val">${PFmt.moeda(liq)}</div>
      <div class="ptl-kpi-label">Salário Líquido</div>
      <div class="ptl-kpi-sub">Bruto: ${PFmt.moeda(salario)}</div>
    </div>
    <div class="ptl-kpi ptl-kpi-purple">
      <div class="ptl-kpi-icon">🏖️</div>
      <div class="ptl-kpi-val">${saldo} dias</div>
      <div class="ptl-kpi-label">Saldo de Férias</div>
      <div class="ptl-kpi-sub">${saldo > 0 ? 'Disponível para gozo' : 'Acumulando período'}</div>
    </div>
    <div class="ptl-kpi ptl-kpi-blue">
      <div class="ptl-kpi-icon">⏱️</div>
      <div class="ptl-kpi-val">+2h 30m</div>
      <div class="ptl-kpi-label">Banco de Horas</div>
      <div class="ptl-kpi-sub">Saldo acumulado</div>
    </div>
    <div class="ptl-kpi ptl-kpi-amber">
      <div class="ptl-kpi-icon">💳</div>
      <div class="ptl-kpi-val">R$ 550</div>
      <div class="ptl-kpi-label">Saldo VA (Caju)</div>
      <div class="ptl-kpi-sub">Recarga dia 1º</div>
    </div>
    <div class="ptl-kpi ptl-kpi-teal">
      <div class="ptl-kpi-icon">⭐</div>
      <div class="ptl-kpi-val">${pts}</div>
      <div class="ptl-kpi-label">Pontos de Engajamento</div>
      <div class="ptl-kpi-sub">${pts >= 500 ? 'Nível Ouro' : pts >= 200 ? 'Nível Prata' : 'Nível Bronze'}</div>
    </div>
    <div class="ptl-kpi ptl-kpi-red">
      <div class="ptl-kpi-icon">🔔</div>
      <div class="ptl-kpi-val">${nNL}</div>
      <div class="ptl-kpi-label">Pendências</div>
      <div class="ptl-kpi-sub">${nNL>0?'Requer atenção':'Tudo em dia ✓'}</div>
    </div>
  </div>

  <!-- ALERTAS -->
  ${alertas.length > 0 ? `
  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>🚨 Pendências & Alertas</h3><button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlNav('notificacoes')">Ver todas</button></div>
    ${alertas.map(n=>`
    <div class="ptl-alert ptl-alert-warn" style="cursor:pointer" onclick="ptlNav('${n.acao}')">
      <span style="font-size:18px">${n.icone}</span>
      <div><strong>${n.titulo}</strong><br><span style="font-size:11px">${n.desc}</span></div>
      <span style="margin-left:auto;font-size:11px;opacity:.6">${n.tempo} →</span>
    </div>`).join('')}
  </div>` : `
  <div class="ptl-alert ptl-alert-ok">✅ <strong>Tudo em dia!</strong> Nenhuma pendência no momento.</div>`}

  <div class="ptl-grid-2">
    <!-- PRÓXIMOS EVENTOS -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>📅 Próximos Eventos</h3></div>
      <div class="ptl-timeline">
        ${[
          {data:'01/06/2025', titulo:'Recarga Caju VA+VT', desc:'R$ 550 + R$ 200 creditados automaticamente', cor:'#16a34a'},
          {data:'05/06/2025', titulo:'Pagamento do Holerite', desc:'Salário de Maio/2025 disponível', cor:'#2563eb'},
          {data:'15/06/2025', titulo:'Avaliação de Desempenho', desc:'Ciclo semestral 2025.1', cor:'#7c3aed'},
          {data:'30/06/2025', titulo:'Férias Vencendo', desc:'Período aquisitivo 2024–2025 expira', cor:'#dc2626'},
        ].map(e=>`
        <div class="ptl-tl-item" style="--ptl-cor:${e.cor}">
          <div class="ptl-tl-titulo">${e.titulo}</div>
          <div class="ptl-tl-desc">${e.desc}</div>
          <div class="ptl-tl-data">📅 ${e.data}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- ACESSO RÁPIDO -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>⚡ Acesso Rápido</h3></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          {icon:'⏱️',label:'Bater Ponto',   sec:'ponto'},
          {icon:'💰',label:'Ver Holerite',  sec:'holerite'},
          {icon:'🏖️',label:'Solicitar Férias',sec:'ferias'},
          {icon:'📝',label:'Solicitar Serviço',sec:'documentos'},
          {icon:'💡',label:'Enviar Ideia',  sec:'ideias'},
          {icon:'🤖',label:'Perguntar ao IA',sec:'assistente'},
        ].map(a=>`
        <button onclick="ptlNav('${a.sec}')" style="
          display:flex;align-items:center;gap:8px;padding:10px 12px;
          border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;
          cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;
          text-align:left;transition:all .14s;color:#1e293b"
          onmouseover="this.style.background='#eff6ff';this.style.borderColor='#bfdbfe'"
          onmouseout="this.style.background='#f8fafc';this.style.borderColor='#e2e8f0'">
          <span style="font-size:18px">${a.icon}</span> ${a.label}
        </button>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

// ── 2. PONTO ELETRÔNICO ───────────────────────────────────────
function _ptlPonto() {
  const db  = PortalDB.get();
  const esp = db.pontos.slice(-10).reverse();
  const mes = new Date().toLocaleString('pt-BR',{month:'long',year:'numeric'});

  const faltas = db.pontos.filter(p=>p.falta).length;
  const atrasos = db.pontos.filter(p=>p.atraso).length;
  const trabalhados = db.pontos.filter(p=>!p.falta).length;

  return `
<div>
  <div class="ptl-card" style="padding:0;overflow:hidden">
    <div class="ptl-ponto-clock">
      <div class="ptl-clock-display" id="ptl-clock">--:--:--</div>
      <div class="ptl-clock-date">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
      <div class="ptl-ponto-btns">
        <button class="ptl-ponto-btn ptl-ponto-entrada"   onclick="ptlRegistrarPonto('entrada')">▶ Entrada</button>
        <button class="ptl-ponto-btn ptl-ponto-intervalo" onclick="ptlRegistrarPonto('intervalo')">⏸ Intervalo</button>
        <button class="ptl-ponto-btn ptl-ponto-retorno"   onclick="ptlRegistrarPonto('retorno')">▷ Retorno</button>
        <button class="ptl-ponto-btn ptl-ponto-saida"     onclick="ptlRegistrarPonto('saida')">■ Saída</button>
      </div>
      <div class="ptl-ponto-status">
        <span class="ptl-ponto-chip">✅ ${trabalhados} dias trabalhados</span>
        <span class="ptl-ponto-chip">${faltas > 0 ? '❌':'✅'} ${faltas} falta${faltas!==1?'s':''}</span>
        <span class="ptl-ponto-chip">${atrasos > 0 ? '⚠️':'✅'} ${atrasos} atraso${atrasos!==1?'s':''}</span>
        <span class="ptl-ponto-chip">⏱️ +2h 30m banco de horas</span>
      </div>
    </div>
  </div>

  <div id="ptl-ponto-msg"></div>

  <div class="ptl-grid-2">
    <div class="ptl-card">
      <div class="ptl-card-hd">
        <h3>📅 Espelho de Ponto — ${mes.charAt(0).toUpperCase()+mes.slice(1)}</h3>
        <button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlSolicitarAjuste()">✏️ Solicitar Ajuste</button>
      </div>
      ${esp.map(p => {
        const dow = PFmt.diaSemana(p.data);
        return `
        <div class="ptl-espelho-row">
          <div class="ptl-esp-dia">${dow} ${PFmt.data(p.data).slice(0,5)}</div>
          <div class="ptl-esp-regs">
            ${p.falta
              ? `<span class="ptl-esp-chip falta">FALTA</span>`
              : `<span class="ptl-esp-chip ${p.atraso?'alerta':'ok'}">${p.entrada||'—'}</span>
                 <span class="ptl-esp-chip ok">${p.intervalo||'—'}</span>
                 <span class="ptl-esp-chip ok">${p.retorno||'—'}</span>
                 <span class="ptl-esp-chip ok">${p.saida||'—'}</span>`}
          </div>
          <div class="ptl-esp-total">${p.falta?'—':p.atraso?'<span style="color:#d97706">⚠️ Atraso</span>':'8h00'}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>📊 Resumo do Mês</h3></div>
      ${[
        {label:'Dias trabalhados', val:trabalhados, cor:'#16a34a'},
        {label:'Faltas',           val:faltas,       cor:'#dc2626'},
        {label:'Atrasos',          val:atrasos,      cor:'#d97706'},
        {label:'Horas extras',     val:'2h 30m',     cor:'#2563eb'},
        {label:'Banco de horas',   val:'+2h 30m',    cor:'#7c3aed'},
        {label:'Dias úteis no mês',val:22,           cor:'#64748b'},
      ].map(r=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <span style="font-size:13px">${r.label}</span>
        <strong style="color:${r.cor}">${r.val}</strong>
      </div>`).join('')}
      <div style="margin-top:14px">
        <button class="ptl-btn" style="width:100%" onclick="ptlExportarPonto()">📊 Exportar Espelho PDF</button>
      </div>
    </div>
  </div>
</div>`;
}

window.ptlRegistrarPonto = function(tipo) {
  const hora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const label = {entrada:'Entrada',intervalo:'Início Intervalo',retorno:'Retorno Intervalo',saida:'Saída'}[tipo];
  const msg = document.getElementById('ptl-ponto-msg');
  if (msg) {
    msg.innerHTML = `<div class="ptl-alert ptl-alert-ok" style="margin-bottom:12px">
      ✅ <strong>${label} registrada às ${hora}</strong> — ${new Date().toLocaleDateString('pt-BR')}
    </div>`;
    setTimeout(() => { if (msg) msg.innerHTML = ''; }, 5000);
  }
  if (window.Toast) Toast.success(`${label} registrada às ${hora}`);
};

window.ptlSolicitarAjuste = function() {
  const overlay = document.createElement('div');
  overlay.id = 'ptl-ajuste-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
<div style="background:#fff;border-radius:16px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.2)">
  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:18px 22px;color:#fff;display:flex;justify-content:space-between;align-items:center">
    <h3 style="margin:0;font-size:15px">✏️ Solicitar Ajuste de Ponto</h3>
    <button onclick="document.getElementById('ptl-ajuste-modal').remove()" style="border:none;background:rgba(255,255,255,.2);color:#fff;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:14px">✕</button>
  </div>
  <div style="padding:22px;display:flex;flex-direction:column;gap:14px">
    <div class="ptl-form-field"><label>Data do ajuste</label><input type="date" id="aj-data" class="ptl-input" value="${new Date().toISOString().slice(0,10)}"/></div>
    <div class="ptl-form-field"><label>Tipo de ajuste</label>
      <select id="aj-tipo" class="ptl-select">
        <option>Esqueci de bater entrada</option>
        <option>Esqueci de bater saída</option>
        <option>Ponto duplicado</option>
        <option>Hora incorreta</option>
        <option>Outro</option>
      </select>
    </div>
    <div class="ptl-form-field"><label>Horário correto</label><input type="time" id="aj-hora" class="ptl-input"/></div>
    <div class="ptl-form-field"><label>Justificativa</label><textarea id="aj-just" class="ptl-textarea" placeholder="Descreva o motivo do ajuste..."></textarea></div>
    <button class="ptl-btn" style="width:100%" onclick="ptlEnviarAjuste()">✅ Enviar Solicitação</button>
  </div>
</div>`;
  document.body.appendChild(overlay);
};

window.ptlEnviarAjuste = function() {
  document.getElementById('ptl-ajuste-modal')?.remove();
  if (window.Toast) Toast.success('Solicitação de ajuste enviada ao RH!');
};

window.ptlExportarPonto = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('jsPDF não carregado.'); return; }
  const doc = new jsPDF();
  doc.setFillColor(37,99,235); doc.rect(0,0,210,14,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('hi Conecta RH — Espelho de Ponto', 10, 9);
  doc.text(new Date().toLocaleDateString('pt-BR'), 200, 9, {align:'right'});
  doc.setTextColor(30,41,59); doc.setFontSize(13);
  doc.text(`Espelho de Ponto — ${PortalUser.nome()}`, 10, 24);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
  doc.text(`Cargo: ${PortalUser.cargo()} · Setor: ${PortalUser.setor()}`, 10, 31);
  const db = PortalDB.get();
  const cols = [{l:'Data',x:10},{l:'Entrada',x:50},{l:'Intervalo',x:85},{l:'Retorno',x:120},{l:'Saída',x:155},{l:'Total',x:185}];
  let y = 38;
  doc.setFillColor(37,99,235); doc.rect(10,y,190,8,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
  cols.forEach(c=>doc.text(c.l,c.x+1,y+5.5)); y+=8;
  doc.setFont('helvetica','normal');
  db.pontos.forEach((p,i)=>{
    if(y>275){doc.addPage();y=20;}
    doc.setFillColor(i%2===0?248:255,i%2===0?250:255,i%2===0?252:255);
    doc.rect(10,y,190,7,'F'); doc.setDrawColor(226,232,240); doc.rect(10,y,190,7,'D');
    doc.setTextColor(30,41,59); doc.setFontSize(7);
    doc.text(`${PFmt.diaSemana(p.data)} ${PFmt.data(p.data)}`,cols[0].x+1,y+5);
    doc.text(p.falta?'FALTA':p.entrada||'—',cols[1].x+1,y+5);
    doc.text(p.falta?'—':p.intervalo||'—',cols[2].x+1,y+5);
    doc.text(p.falta?'—':p.retorno||'—',cols[3].x+1,y+5);
    doc.text(p.falta?'—':p.saida||'—',cols[4].x+1,y+5);
    doc.text(p.falta?'FALTA':p.atraso?'Atraso':'8h00',cols[5].x+1,y+5);
    y+=7;
  });
  doc.save(`espelho_ponto_${PortalUser.nome().replace(' ','_')}.pdf`);
  if(window.Toast) Toast.success('Espelho exportado em PDF!');
};

let _ptlClockInterval = null;
function _iniciarRelogio() {
  if (_ptlClockInterval) clearInterval(_ptlClockInterval);
  const tick = () => {
    const el = document.getElementById('ptl-clock');
    if (!el) { clearInterval(_ptlClockInterval); return; }
    el.textContent = new Date().toLocaleTimeString('pt-BR');
  };
  tick();
  _ptlClockInterval = setInterval(tick, 1000);
}

// ── 3. HOLERITE ────────────────────────────────────────────────
function _ptlHolerite() {
  const sal  = PortalUser.salario();
  const inss = CLT.inss(sal);
  const irrf = CLT.irrf(sal, 1);
  const fgts = CLT.fgts(sal);
  const liq  = sal - inss - irrf;
  const va   = 550, vt = 200, plano = 85;
  const proventos = sal + va + vt;
  const descontos = inss + irrf + plano + vt;

  const meses = ['Jan/2025','Fev/2025','Mar/2025','Abr/2025','Mai/2025'];

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>💰 Holerite Digital</h3>
      <div style="display:flex;gap:8px;align-items:center">
        <select id="ptl-hol-mes" class="ptl-select" style="width:140px;padding:6px 10px;font-size:12px" onchange="ptlTrocarHolerite(this.value)">
          ${meses.map((m,i)=>`<option value="${i}" ${i===4?'selected':''}>${m}</option>`).join('')}
        </select>
        <button class="ptl-btn ptl-btn-sm" onclick="ptlDownloadHolerite()">📄 PDF</button>
      </div>
    </div>

    <div class="ptl-holerite-hd">
      <div>
        <div class="ptl-hol-empresa">hi Conecta RH</div>
        <div class="ptl-hol-cnpj">CNPJ: ${AppConfig?.empresa?.cnpj||'00.000.000/0001-00'}</div>
        <div class="ptl-hol-periodo">Competência: Maio/2025 · Pagamento: 05/06/2025</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;opacity:.8">${PortalUser.nome()}</div>
        <div style="font-size:11px;opacity:.6">${PortalUser.cargo()} — ${PortalUser.setor()}</div>
        <div style="font-size:11px;opacity:.6">Admissão: ${PFmt.data(PortalUser.admissao())}</div>
      </div>
    </div>

    <div class="ptl-hol-grid">
      <div class="ptl-hol-col">
        <div class="ptl-hol-col-title">📈 Proventos</div>
        ${[
          ['Salário Base',                PFmt.moeda(sal)],
          ['Vale Alimentação (Caju)',      PFmt.moeda(va)],
          ['Vale Transporte (Nubus)',      PFmt.moeda(vt)],
          ['Adicional de Assiduidade',    PFmt.moeda(0)],
        ].map(([l,v])=>`<div class="ptl-hol-row"><span>${l}</span><span class="val-prov">${v}</span></div>`).join('')}
        <div class="ptl-hol-total"><span>Total Bruto</span><span style="color:#16a34a">${PFmt.moeda(proventos)}</span></div>
      </div>
      <div class="ptl-hol-col">
        <div class="ptl-hol-col-title">📉 Descontos</div>
        ${[
          ['INSS (Progressivo)',           PFmt.moeda(inss)],
          ['IRRF (após INSS e dep.)',      PFmt.moeda(irrf)],
          ['Plano de Saúde (SulAmérica)', PFmt.moeda(plano)],
          ['Vale Transporte (desconto 6%)',PFmt.moeda(vt)],
        ].map(([l,v])=>`<div class="ptl-hol-row"><span>${l}</span><span class="val-desc">${v}</span></div>`).join('')}
        <div class="ptl-hol-total"><span>Total Descontos</span><span style="color:#dc2626">${PFmt.moeda(descontos)}</span></div>
      </div>
    </div>

    <div class="ptl-hol-liquido">
      <div>
        <div class="ptl-hol-liquido-label">💰 Salário Líquido</div>
        <div style="font-size:11px;opacity:.75;margin-top:2px">FGTS depositado: ${PFmt.moeda(fgts)} (não descontado)</div>
      </div>
      <div class="ptl-hol-liquido-val">${PFmt.moeda(liq)}</div>
    </div>
  </div>

  <!-- HISTÓRICO -->
  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>📋 Histórico de Holerites</h3></div>
    <div class="ptl-table-wrap">
      <table class="ptl-table">
        <thead><tr><th>Competência</th><th>Salário Bruto</th><th>Descontos</th><th>Líquido</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          ${meses.map((m,i)=>`<tr>
            <td><strong>${m}</strong></td>
            <td>${PFmt.moeda(proventos)}</td>
            <td style="color:#dc2626">${PFmt.moeda(descontos)}</td>
            <td style="color:#16a34a;font-weight:700">${PFmt.moeda(liq)}</td>
            <td><span class="ptl-badge ${i===4?'ptl-badge-amber':'ptl-badge-green'}">${i===4?'Aguardando':'Pago'}</span></td>
            <td><button class="ptl-btn ptl-btn-sm" onclick="ptlDownloadHolerite()">📄 PDF</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

window.ptlTrocarHolerite = function(v) {};

window.ptlDownloadHolerite = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('jsPDF não carregado.'); return; }
  const sal  = PortalUser.salario();
  const inss = CLT.inss(sal);
  const irrf = CLT.irrf(sal, 1);
  const fgts = CLT.fgts(sal);
  const liq  = sal - inss - irrf;
  const doc = new jsPDF();
  doc.setFillColor(37,99,235); doc.rect(0,0,210,14,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('hi Conecta RH — Holerite / Contracheque', 10, 9);
  doc.setTextColor(30,41,59); doc.setFontSize(14);
  doc.text('CONTRACHEQUE — Maio/2025', 10, 24);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
  doc.text(`${PortalUser.nome()} · ${PortalUser.cargo()} · ${PortalUser.setor()}`, 10, 31);
  let y = 42;
  const _linha = (label, val, cor=[30,41,59]) => {
    doc.setTextColor(30,41,59); doc.setFontSize(9); doc.text(label, 10, y);
    doc.setTextColor(...cor); doc.setFont('helvetica','bold');
    doc.text(PFmt.moeda(val), 200, y, {align:'right'});
    doc.setFont('helvetica','normal'); y += 8;
  };
  doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(37,99,235);
  doc.text('PROVENTOS', 10, y); y += 6;
  _linha('Salário Base', sal, [22,163,74]);
  _linha('Vale Alimentação (Caju)', 550, [22,163,74]);
  _linha('Vale Transporte', 200, [22,163,74]);
  doc.setDrawColor(226,232,240); doc.line(10,y,200,y); y+=4;
  doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(220,38,38);
  doc.text('DESCONTOS', 10, y); y += 6;
  _linha('INSS', inss, [220,38,38]);
  _linha('IRRF', irrf, [220,38,38]);
  _linha('Plano de Saúde', 85, [220,38,38]);
  doc.line(10,y,200,y); y+=6;
  doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(22,163,74);
  doc.text('LÍQUIDO A RECEBER:', 10, y);
  doc.text(PFmt.moeda(liq), 200, y, {align:'right'}); y+=8;
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
  doc.text(`FGTS depositado: ${PFmt.moeda(fgts)} (Caixa Econômica Federal)`, 10, y);
  doc.save(`holerite_${PortalUser.nome().replace(' ','_')}_Mai2025.pdf`);
  if(window.Toast) Toast.success('Holerite exportado em PDF!');
};

// ── 4. FÉRIAS ─────────────────────────────────────────────────
function _ptlFerias() {
  const saldo = _calcSaldoFerias();
  const sal   = PortalUser.salario();
  const sim   = CLT.ferias(sal, 30);
  const db    = PortalDB.get();

  return `
<div>
  <div class="ptl-ferias-saldo">
    <div class="ptl-ferias-dias">${saldo}</div>
    <div class="ptl-ferias-label">dias de férias disponíveis</div>
    <div class="ptl-ferias-info">
      <div class="ptl-ferias-info-item">
        <strong>2024-2025</strong>Período Aquisitivo
      </div>
      <div class="ptl-ferias-info-item">
        <strong>${PFmt.data(PortalUser.admissao())}</strong>Admissão
      </div>
      <div class="ptl-ferias-info-item">
        <strong>${saldo > 0 ? 'Vence em 45d' : 'Acumulando'}</strong>Status
      </div>
    </div>
  </div>

  <div class="ptl-grid-2">
    <!-- SIMULADOR -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>🧮 Simulador de Férias</h3></div>
      <div class="ptl-form-field">
        <label>Dias de férias</label>
        <input type="range" id="ptl-ferias-dias-range" min="5" max="30" step="5" value="30" oninput="ptlSimularFerias(this.value)" style="width:100%;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8"><span>5 dias</span><span>30 dias</span></div>
      </div>
      <div id="ptl-ferias-sim-resultado" class="ptl-simulador" style="margin-top:12px">
        <div style="font-size:12px;color:#64748b;margin-bottom:8px">Simulação — 30 dias + ⅓</div>
        ${[
          ['Salário de Férias (30d)',PFmt.moeda(sim.bruto - sim.terco),'#1e293b'],
          ['1/3 Constitucional',    PFmt.moeda(sim.terco),             '#7c3aed'],
          ['INSS s/ Férias',        `- ${PFmt.moeda(sim.inss)}`,      '#dc2626'],
          ['IRRF s/ Férias',        `- ${PFmt.moeda(sim.irrf)}`,      '#dc2626'],
        ].map(([l,v,c])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span>${l}</span><span style="font-weight:700;color:${c}">${v}</span></div>`).join('')}
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:14px;font-weight:800">
          <span>💰 Líquido estimado</span>
          <span class="ptl-sim-result" id="ptl-ferias-liq">${PFmt.moeda(sim.liquido)}</span>
        </div>
      </div>
    </div>

    <!-- SOLICITAR -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>📝 Solicitar Férias</h3></div>
      <div class="ptl-form-field"><label>Data de início</label><input type="date" id="ptl-f-inicio" class="ptl-input"/></div>
      <div class="ptl-form-field"><label>Dias solicitados</label>
        <select id="ptl-f-dias" class="ptl-select">
          <option value="30">30 dias (período completo)</option>
          <option value="20">20 dias + 10 abono</option>
          <option value="15">15 dias (1ª parcela)</option>
          <option value="10">10 dias (abono pecuniário)</option>
        </select>
      </div>
      <div class="ptl-form-field"><label>Observação</label><textarea id="ptl-f-obs" class="ptl-textarea" placeholder="Alguma preferência ou informação adicional..."></textarea></div>
      <button class="ptl-btn" style="width:100%" onclick="ptlSolicitarFerias()">📤 Enviar Solicitação</button>
    </div>
  </div>

  <!-- HISTÓRICO -->
  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>📋 Histórico de Férias</h3></div>
    ${db.solicitacoes_ferias.length === 0
      ? `<div style="text-align:center;padding:24px;color:#94a3b8"><div style="font-size:32px">🏖️</div><p>Nenhuma solicitação ainda</p></div>`
      : `<div class="ptl-table-wrap"><table class="ptl-table">
          <thead><tr><th>Período</th><th>Dias</th><th>Status</th><th>Líquido Est.</th></tr></thead>
          <tbody>${db.solicitacoes_ferias.map(s=>`<tr>
            <td>${PFmt.data(s.inicio)} → ${PFmt.data(s.fim)}</td>
            <td>${s.dias} dias</td>
            <td><span class="ptl-badge ptl-badge-amber">${s.status}</span></td>
            <td style="color:#16a34a;font-weight:700">${PFmt.moeda(CLT.ferias(PortalUser.salario(),s.dias).liquido)}</td>
          </tr>`).join('')}</tbody>
        </table></div>`}
  </div>
</div>`;
}

window.ptlSimularFerias = function(dias) {
  const sim = CLT.ferias(PortalUser.salario(), parseInt(dias));
  const el  = document.getElementById('ptl-ferias-liq');
  if (el) el.textContent = PFmt.moeda(sim.liquido);
};

window.ptlSolicitarFerias = function() {
  const inicio = document.getElementById('ptl-f-inicio')?.value;
  const dias   = parseInt(document.getElementById('ptl-f-dias')?.value||30);
  if (!inicio) { if(window.Toast) Toast.aviso('Informe a data de início.'); return; }
  const fim = new Date(new Date(inicio).getTime() + dias*86400000).toISOString().slice(0,10);
  PortalDB.update(d => {
    d.solicitacoes_ferias.unshift({ inicio, fim, dias, status:'Em análise', solicitadoEm: new Date().toISOString() });
  });
  if(window.Toast) Toast.success(`Solicitação de ${dias} dias enviada para aprovação!`);
  ptlNav('ferias');
};

function _calcSaldoFerias() {
  const adm  = new Date(PortalUser.admissao());
  const hoje = new Date();
  const meses = (hoje.getFullYear()-adm.getFullYear())*12 + (hoje.getMonth()-adm.getMonth());
  if (meses < 12) return 0;
  const periodos = Math.floor(meses / 12);
  return Math.min(periodos * 30, 30);
}

// ── 5. BENEFÍCIOS ──────────────────────────────────────────────
function _ptlBeneficios() {
  const beneficios = [
    { icon:'🍽️', nome:'Vale Alimentação (Caju)', sub:'Aceito em supermercados e restaurantes', saldo:550, recarga:'Dia 1º', cor:'#ff6b00', ativo:true },
    { icon:'🚌', nome:'Vale Transporte (Nubus)',  sub:'Créditos automáticos para transporte',    saldo:200, recarga:'Dia 1º', cor:'#0ea5e9', ativo:true },
    { icon:'❤️', nome:'Plano de Saúde (SulAmérica)',sub:'Cobertura nacional + urgência 24h',   saldo:null, recarga:'Mensal', cor:'#dc2626', ativo:true },
    { icon:'🦷', nome:'Plano Odontológico',        sub:'Consultas e procedimentos cobertos',    saldo:null, recarga:'Mensal', cor:'#7c3aed', ativo:true },
    { icon:'💪', nome:'Wellhub (Gympass)',          sub:'+ 5.000 academias, apps e estúdios',   saldo:null, recarga:'Mensal', cor:'#16a34a', ativo:true },
    { icon:'💊', nome:'Telemedicina (Conexa)',      sub:'Consultas online 24h/7 dias',          saldo:null, recarga:'Ilimitado', cor:'#2563eb', ativo:true },
  ];

  return `
<div>
  <div class="ptl-kpis" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">
    <div class="ptl-kpi ptl-kpi-green"><div class="ptl-kpi-icon">💳</div><div class="ptl-kpi-val">R$ 750</div><div class="ptl-kpi-label">Saldo total VA + VT</div></div>
    <div class="ptl-kpi ptl-kpi-blue"><div class="ptl-kpi-icon">📦</div><div class="ptl-kpi-val">6</div><div class="ptl-kpi-label">Benefícios ativos</div></div>
    <div class="ptl-kpi ptl-kpi-amber"><div class="ptl-kpi-icon">📅</div><div class="ptl-kpi-val">01/06</div><div class="ptl-kpi-label">Próxima recarga</div></div>
    <div class="ptl-kpi ptl-kpi-purple"><div class="ptl-kpi-icon">📊</div><div class="ptl-kpi-val">R$ 835</div><div class="ptl-kpi-label">Custo total empresa/mês</div></div>
  </div>

  ${beneficios.map(b=>`
  <div class="ptl-beneficio-card">
    <div class="ptl-beneficio-icon" style="background:${b.cor}15">
      <span style="filter:saturate(1.5)">${b.icon}</span>
    </div>
    <div class="ptl-beneficio-info">
      <div class="ptl-beneficio-nome">${b.nome}</div>
      <div class="ptl-beneficio-sub">${b.sub}</div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      ${b.saldo !== null
        ? `<div class="ptl-beneficio-val">${PFmt.moeda(b.saldo)}</div><div class="ptl-beneficio-recarga">Recarga: ${b.recarga}</div>`
        : `<div><span class="ptl-badge ptl-badge-green">● Ativo</span></div><div class="ptl-beneficio-recarga">${b.recarga}</div>`}
    </div>
  </div>`).join('')}

  <div class="ptl-card" style="margin-top:16px">
    <div class="ptl-card-hd"><h3>⚠️ Regra de Faltas e Benefícios (CLT)</h3></div>
    ${[
      ['0 faltas',          'Benefício integral + bônus assiduidade R$ 150','#16a34a'],
      ['1–2 faltas',        'Desconto proporcional no vale transporte',     '#d97706'],
      ['3+ faltas injustificadas','Suspensão parcial do vale transporte',    '#dc2626'],
    ].map(([cond,desc,cor])=>`
    <div class="ptl-alert" style="background:${cor}10;border:1px solid ${cor}30;color:${cor};margin-bottom:6px">
      <strong>${cond}:</strong> <span style="color:#334155">${desc}</span>
    </div>`).join('')}
  </div>
</div>`;
}

// ── 6. DOCUMENTOS ──────────────────────────────────────────────
function _ptlDocumentos() {
  const docs = [
    { icon:'📃', nome:'Contrato de Trabalho',           tipo:'Contrato',    data:'01/03/2023', status:'assinado', tags:['CLT'] },
    { icon:'📋', nome:'Aditivo Salarial — Jan/2025',    tipo:'Aditivo',     data:'02/01/2025', status:'assinado', tags:['Salário'] },
    { icon:'📄', nome:'Declaração de Vínculo',           tipo:'Declaração',  data:'05/05/2025', status:'disponivel', tags:['RH'] },
    { icon:'⚠️', nome:'Política de Uso de TI',           tipo:'Política',    data:'01/01/2025', status:'pendente_assinatura', tags:['Compliance'] },
    { icon:'🔒', nome:'LGPD — Consentimento de Dados',  tipo:'LGPD',        data:'01/01/2025', status:'pendente_assinatura', tags:['Legal'] },
    { icon:'🎓', nome:'Certificado Excel Avançado',      tipo:'Certificado', data:'12/04/2025', status:'disponivel', tags:['T&D'] },
  ];

  const statusBadge = s => ({
    assinado:             '<span class="ptl-badge ptl-badge-green">✓ Assinado</span>',
    disponivel:           '<span class="ptl-badge ptl-badge-blue">⬇ Disponível</span>',
    pendente_assinatura:  '<span class="ptl-badge ptl-badge-amber">✏️ Assinar</span>',
  })[s] || '';

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>📂 Meus Documentos</h3>
      <button class="ptl-btn ptl-btn-sm" onclick="ptlUploadDoc()">⬆ Enviar Documento</button>
    </div>
    ${docs.map(d=>`
    <div class="ptl-doc-item">
      <span class="ptl-doc-icon">${d.icon}</span>
      <div class="ptl-doc-info">
        <div class="ptl-doc-nome">${d.nome}</div>
        <div class="ptl-doc-meta">${d.tipo} · ${d.data} · ${d.tags.map(t=>`<span style="background:#f1f5f9;border-radius:4px;padding:1px 5px;font-size:10px">${t}</span>`).join(' ')}</div>
      </div>
      ${statusBadge(d.status)}
      <div style="display:flex;gap:6px;margin-left:8px">
        ${d.status==='pendente_assinatura'
          ? `<button class="ptl-btn ptl-btn-sm ptl-btn-amber" onclick="ptlAssinarDoc('${d.nome}')">✍️ Assinar</button>`
          : `<button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlBaixarDoc('${d.nome}')">⬇ Baixar</button>`}
      </div>
    </div>`).join('')}
  </div>

  <!-- UPLOAD -->
  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>⬆ Enviar Documento</h3></div>
    <div class="ptl-form-grid">
      <div class="ptl-form-field"><label>Tipo de documento</label>
        <select class="ptl-select">
          <option>Atestado Médico</option><option>Declaração de Dependente</option>
          <option>Comprovante de Endereço</option><option>Certificado de Curso</option><option>Outro</option>
        </select>
      </div>
      <div class="ptl-form-field"><label>Arquivo</label><input type="file" class="ptl-input" accept=".pdf,.jpg,.png"/></div>
      <div class="ptl-form-field ptl-form-full"><label>Observação</label><textarea class="ptl-textarea" placeholder="Informações adicionais sobre o documento..."></textarea></div>
    </div>
    <button class="ptl-btn ptl-btn-green" onclick="if(window.Toast)Toast.success('Documento enviado ao RH para análise!')">📤 Enviar</button>
  </div>
</div>`;
}

window.ptlUploadDoc    = function() { document.querySelector('.ptl-doc-item + .ptl-card .ptl-input[type=file]')?.click(); };
window.ptlBaixarDoc    = function(n) { if(window.Toast) Toast.success(`Download de "${n}" iniciado.`); };
window.ptlAssinarDoc   = function(n) {
  if (confirm(`Assinar digitalmente: "${n}"?\nAo confirmar, sua assinatura eletrônica será registrada.`)) {
    if(window.Toast) Toast.success(`Documento "${n}" assinado com sucesso!`);
    PortalDB.update(d => { if(!d.documentos_assinados) d.documentos_assinados=[]; d.documentos_assinados.push({nome:n,em:new Date().toISOString()}); });
  }
};

// ── 7. COMUNICAÇÃO ─────────────────────────────────────────────
function _ptlComunicacao() {
  const avisos = [
    { cor:'#dc2626', icone:'🚨', titulo:'IMPORTANTE: Recadastramento RAIS', corpo:'Todos os colaboradores devem atualizar seus dados até 30/05 para o envio da RAIS 2025.', data:'24/05/2025', tipo:'urgente' },
    { cor:'#2563eb', icone:'📢', titulo:'Reunião Geral — 28/05 às 09h',     corpo:'Apresentação dos resultados do Q1/2025 e metas do Q2. Presença obrigatória na sala de reuniões.', data:'22/05/2025', tipo:'evento' },
    { cor:'#16a34a', icone:'🎉', titulo:'Aniversariantes de Maio',          corpo:'Parabéns a Carlos Souza (08/05), Ana Lima (15/05) e Paulo Santos (28/05)!', data:'20/05/2025', tipo:'comemorativo' },
    { cor:'#7c3aed', icone:'🎓', titulo:'Novo treinamento disponível: Power BI', corpo:'A plataforma hi Academy liberou o curso Power BI para Analistas. Acesse pela aba Desenvolvimento.', data:'18/05/2025', tipo:'treinamento' },
    { cor:'#d97706', icone:'⚠️', titulo:'Manutenção do sistema — 31/05', corpo:'O sistema ficará indisponível das 22h às 02h para manutenção preventiva.', data:'17/05/2025', tipo:'aviso' },
  ];

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>📢 Comunicados da Empresa</h3>
      <span class="ptl-badge ptl-badge-blue">${avisos.length} comunicados</span>
    </div>
    ${avisos.map(a=>`
    <div style="border-left:4px solid ${a.cor};background:#fff;border:1px solid #e2e8f0;border-left:4px solid ${a.cor};border-radius:10px;padding:14px 16px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:18px">${a.icone}</span>
        <strong style="font-size:13px">${a.titulo}</strong>
        <span class="ptl-badge" style="margin-left:auto;background:${a.cor}15;color:${a.cor};border:1px solid ${a.cor}30">${a.tipo}</span>
      </div>
      <p style="font-size:12px;color:#475569;margin:0 0 6px;line-height:1.5">${a.corpo}</p>
      <small style="color:#94a3b8;font-size:10px">📅 ${a.data}</small>
    </div>`).join('')}
  </div>

  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>📺 TV Corporativa — Endomarketing.tv</h3></div>
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:10px;padding:24px;text-align:center;color:#fff">
      <div style="font-size:36px;margin-bottom:12px">📺</div>
      <p style="font-size:13px;opacity:.7;margin:0 0 14px">Acesse os conteúdos da TV Corporativa</p>
      <button class="ptl-btn" onclick="navigateTo('endomarketing')">Abrir Endomarketing.tv →</button>
    </div>
  </div>
</div>`;
}

// ── 8. AVALIAÇÕES ──────────────────────────────────────────────
function _ptlAvaliacoes() {
  const adm   = new Date(PortalUser.admissao());
  const hoje  = new Date();
  const diasAdm = Math.floor((hoje-adm)/86400000);

  const av15  = { prazo: new Date(adm.getTime()+15*86400000), feita: diasAdm > 15 };
  const av45  = { prazo: new Date(adm.getTime()+45*86400000), feita: diasAdm > 45 };
  const pendente45 = diasAdm >= 40 && diasAdm <= 50 && !av45.feita;

  return `
<div>
  <div class="ptl-grid-2">
    <div class="ptl-aval-card ${av15.feita?'concluida':'pendente'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="ptl-aval-titulo">📋 Avaliação de Experiência — 15 dias</div>
          <div class="ptl-aval-desc">Adaptação cultural, relacionamento e pontualidade</div>
          <div style="font-size:11px;color:#64748b;margin-top:6px">Prazo: ${av15.prazo.toLocaleDateString('pt-BR')}</div>
        </div>
        <span class="ptl-badge ${av15.feita?'ptl-badge-green':'ptl-badge-amber'}">${av15.feita?'✓ Concluída':'Pendente'}</span>
      </div>
      ${!av15.feita?`<button class="ptl-btn ptl-btn-sm" style="margin-top:12px" onclick="ptlIniciarAvaliacao('15d')">Iniciar Avaliação</button>`:'<div style="margin-top:10px;font-size:11px;color:#15803d">✅ Avaliação concluída com sucesso</div>'}
    </div>

    <div class="ptl-aval-card ${av45.feita?'concluida':pendente45?'pendente':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="ptl-aval-titulo">📋 Avaliação de Experiência — 45 dias</div>
          <div class="ptl-aval-desc">Desempenho, habilidades técnicas e recomendação de efetivação</div>
          <div style="font-size:11px;color:#64748b;margin-top:6px">Prazo: ${av45.prazo.toLocaleDateString('pt-BR')}</div>
        </div>
        <span class="ptl-badge ${av45.feita?'ptl-badge-green':pendente45?'ptl-badge-amber':'ptl-badge-gray'}">${av45.feita?'✓ Concluída':pendente45?'Pendente':'Aguardando prazo'}</span>
      </div>
      ${pendente45&&!av45.feita?`<button class="ptl-btn ptl-btn-sm" style="margin-top:12px" onclick="ptlIniciarAvaliacao('45d')">Iniciar Avaliação</button>`:''}
    </div>
  </div>

  <!-- AUTOAVALIAÇÃO -->
  <div class="ptl-card">
    <div class="ptl-card-hd"><h3>🌟 Autoavaliação de Desempenho — Semestral 2025.1</h3><span class="ptl-badge ptl-badge-amber">Aberta até 15/06</span></div>
    ${[
      'Qualidade do meu trabalho e entregas',
      'Colaboração com a equipe',
      'Proatividade e iniciativa',
      'Comunicação e clareza',
      'Cumprimento de prazos',
    ].map((c,i)=>`
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;margin-bottom:6px">${i+1}. ${c}</div>
      <div style="display:flex;gap:6px">
        ${[1,2,3,4,5].map(n=>`
        <button onclick="ptlSelecionarNota(this,${i})" data-nota="${n}"
          style="flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:all .14s"
          onmouseover="this.style.background='#eff6ff';this.style.borderColor='#bfdbfe'"
          onmouseout="if(!this.classList.contains('sel')){this.style.background='#f8fafc';this.style.borderColor='#e2e8f0'}">
          ${['','😞','😐','🙂','😊','🤩'][n]} ${n}
        </button>`).join('')}
      </div>
    </div>`).join('')}
    <div class="ptl-form-field"><label>Comentários e metas para o próximo semestre</label><textarea class="ptl-textarea" placeholder="Descreva suas conquistas e o que deseja melhorar..."></textarea></div>
    <button class="ptl-btn ptl-btn-green" onclick="if(window.Toast)Toast.success('Autoavaliação enviada com sucesso!')">✅ Enviar Autoavaliação</button>
  </div>
</div>`;
}

window.ptlSelecionarNota = function(btn, idx) {
  btn.closest('div').querySelectorAll('button').forEach(b => {
    b.classList.remove('sel');
    b.style.background = '#f8fafc'; b.style.borderColor = '#e2e8f0'; b.style.color = '#1e293b';
  });
  btn.classList.add('sel');
  btn.style.background = '#2563eb'; btn.style.borderColor = '#2563eb'; btn.style.color = '#fff';
};

window.ptlIniciarAvaliacao = function(tipo) {
  if(window.Toast) Toast.success(`Avaliação de ${tipo === '15d' ? '15' : '45'} dias iniciada! Redirecionando para o formulário.`);
};

// ── 9. IDEIAS (PIT) ────────────────────────────────────────────
function _ptlIdeias() {
  const db     = PortalDB.get();
  const ideias = db.ideias || [];
  const ranking = [...ideias].sort((a,b)=>b.votos-a.votos);

  const statusBadge = s => ({
    aprovada:   '<span class="ptl-badge ptl-badge-green">✓ Aprovada</span>',
    em_analise: '<span class="ptl-badge ptl-badge-amber">⏳ Em análise</span>',
    reprovada:  '<span class="ptl-badge ptl-badge-red">✕ Reprovada</span>',
  })[s] || '';

  return `
<div>
  <div class="ptl-kpis" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
    <div class="ptl-kpi ptl-kpi-purple"><div class="ptl-kpi-icon">💡</div><div class="ptl-kpi-val">${ideias.length}</div><div class="ptl-kpi-label">Minhas ideias</div></div>
    <div class="ptl-kpi ptl-kpi-green"><div class="ptl-kpi-icon">✅</div><div class="ptl-kpi-val">${ideias.filter(i=>i.status==='aprovada').length}</div><div class="ptl-kpi-label">Aprovadas</div></div>
    <div class="ptl-kpi ptl-kpi-amber"><div class="ptl-kpi-icon">👍</div><div class="ptl-kpi-val">${ideias.reduce((s,i)=>s+i.votos,0)}</div><div class="ptl-kpi-label">Votos recebidos</div></div>
    <div class="ptl-kpi ptl-kpi-blue"><div class="ptl-kpi-icon">💰</div><div class="ptl-kpi-val">${ideias.filter(i=>i.status==='aprovada').length > 0 ? 'R$ 500' : 'R$ 0'}</div><div class="ptl-kpi-label">Bônus recebido</div></div>
  </div>

  <div class="ptl-grid-2">
    <!-- NOVA IDEIA -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>💡 Enviar Nova Ideia</h3></div>
      <div class="ptl-form-field"><label>Título da ideia</label><input type="text" id="ptl-ideia-titulo" class="ptl-input" placeholder="Ex: Sistema de carpooling para economizar VT"/></div>
      <div class="ptl-form-field"><label>Categoria</label>
        <select id="ptl-ideia-cat" class="ptl-select">
          <option>Melhoria de Processos</option><option>Redução de Custos</option>
          <option>Bem-estar e Clima</option><option>Tecnologia</option>
          <option>Sustentabilidade</option><option>Atendimento ao Cliente</option>
        </select>
      </div>
      <div class="ptl-form-field"><label>Descrição detalhada</label><textarea id="ptl-ideia-desc" class="ptl-textarea" rows="4" placeholder="Descreva sua ideia, o problema que resolve e os benefícios esperados..."></textarea></div>
      <div class="ptl-form-field"><label>Impacto estimado</label>
        <select id="ptl-ideia-impacto" class="ptl-select">
          <option>Alto — afeta toda a empresa</option>
          <option>Médio — afeta meu setor</option>
          <option>Baixo — melhoria pontual</option>
        </select>
      </div>
      <button class="ptl-btn ptl-btn-purple" style="width:100%" onclick="ptlEnviarIdeia()">💡 Enviar Ideia (+50 pts se aprovada)</button>
    </div>

    <!-- RANKING -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>🏆 Ranking de Ideias</h3></div>
      ${ranking.map((ideia, i)=>`
      <div class="ptl-ideia-item">
        <div class="ptl-ideia-rank" style="${i===0?'background:#fef3c7;color:#d97706':i===1?'background:#f1f5f9;color:#475569':'background:#fef0e0;color:#b45309'}">${i+1}º</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700">${ideia.titulo}</div>
          <div style="font-size:11px;color:#64748b">${ideia.autor} · ${PFmt.data(ideia.data)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${statusBadge(ideia.status)}
          <div style="font-size:12px;font-weight:700;color:#7c3aed;margin-top:4px">👍 ${ideia.votos}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

window.ptlEnviarIdeia = function() {
  const titulo = document.getElementById('ptl-ideia-titulo')?.value?.trim();
  const desc   = document.getElementById('ptl-ideia-desc')?.value?.trim();
  if (!titulo || !desc) { if(window.Toast) Toast.aviso('Preencha título e descrição.'); return; }
  PortalDB.update(d => {
    d.ideias.push({ id:'ID_'+Date.now(), titulo, descricao:desc, status:'em_analise', votos:0, data:new Date().toISOString().slice(0,10), autor:PortalUser.nome() });
  });
  if(window.Toast) Toast.success('Ideia enviada! Você receberá R$ 500 de bônus se aprovada. +10 pts de engajamento!');
  ptlNav('ideias');
};

// ── 10. PESQUISAS ──────────────────────────────────────────────
function _ptlPesquisas() {
  const db = PortalDB.get();
  const pesquisas = [
    { id:'P1', titulo:'Pesquisa de Clima 2025.1', desc:'Avalie sua satisfação com o ambiente de trabalho.', tipo:'clima', respondida: db.pesquisas_respondidas.includes('P1'), prazo:'31/05/2025' },
    { id:'P2', titulo:'NPS Colaborador — Maio',   desc:'Recomendaria a empresa como local de trabalho?', tipo:'nps',   respondida: db.pesquisas_respondidas.includes('P2'), prazo:'28/05/2025' },
    { id:'P3', titulo:'Avaliação do RH',           desc:'Como você avalia o atendimento do RH?',         tipo:'avaliacao', respondida: db.pesquisas_respondidas.includes('P3'), prazo:'30/05/2025' },
  ];

  if (window._ptlPesquisaAtiva) {
    const p = pesquisas.find(x=>x.id===window._ptlPesquisaAtiva);
    return _ptlResponderPesquisa(p);
  }

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>📝 Pesquisas Abertas</h3>
      <span class="ptl-badge ptl-badge-amber">${pesquisas.filter(p=>!p.respondida).length} pendente(s)</span>
    </div>
    ${pesquisas.map(p=>`
    <div class="ptl-pesquisa-card">
      <span style="font-size:28px">${{clima:'🌡️',nps:'📊',avaliacao:'⭐'}[p.tipo]||'📝'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700">${p.titulo}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px">${p.desc}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px">Prazo: ${p.prazo} · 🔒 Anônima</div>
      </div>
      ${p.respondida
        ? `<span class="ptl-badge ptl-badge-green">✓ Respondida</span>`
        : `<button class="ptl-btn ptl-btn-sm" onclick="ptlAbrirPesquisa('${p.id}')">Responder</button>`}
    </div>`).join('')}
  </div>
</div>`;
}

window.ptlAbrirPesquisa = function(id) {
  window._ptlPesquisaAtiva = id;
  ptlNav('pesquisas');
};

function _ptlResponderPesquisa(p) {
  if (!p) return '<p>Pesquisa não encontrada.</p>';
  return `
<div>
  <button class="ptl-btn ptl-btn-ghost" style="margin-bottom:16px" onclick="delete window._ptlPesquisaAtiva;ptlNav('pesquisas')">← Voltar</button>
  <div class="ptl-card">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:10px;padding:18px;color:#fff;margin-bottom:18px">
      <h3 style="margin:0 0 4px;font-size:15px">${p.titulo}</h3>
      <p style="margin:0;font-size:12px;opacity:.75">${p.desc} · 🔒 Suas respostas são anônimas</p>
    </div>
    ${[
      {tipo:'escala', pergunta:'Satisfação geral com a empresa'},
      {tipo:'nps',    pergunta:'De 0 a 10, o quanto recomendaria trabalhar aqui?'},
      {tipo:'multi',  pergunta:'O que mais precisa melhorar?', opts:['Comunicação','Benefícios','Liderança','Carreira','Ambiente físico']},
      {tipo:'texto',  pergunta:'Deixe uma sugestão ou comentário'},
    ].map((q,i)=>`
    <div style="margin-bottom:18px">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px">${i+1}. ${q.pergunta}</div>
      ${q.tipo==='escala'?`<div style="display:flex;gap:6px">${[1,2,3,4,5].map(n=>`<button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='#f8fafc');this.style.background='#2563eb';this.style.color='#fff'" style="flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:#f8fafc">${n}</button>`).join('')}</div>`:
       q.tipo==='nps'   ?`<div style="display:flex;gap:4px;flex-wrap:wrap">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='#f8fafc');this.style.background='#2563eb';this.style.color='#fff'" style="width:36px;height:36px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;background:#f8fafc">${n}</button>`).join('')}</div>`:
       q.tipo==='multi' ?`<div style="display:flex;flex-direction:column;gap:6px">${(q.opts||[]).map(o=>`<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer"><input type="checkbox"> ${o}</label>`).join('')}</div>`:
       `<textarea class="ptl-textarea" placeholder="Sua resposta..."></textarea>`}
    </div>`).join('')}
    <button class="ptl-btn ptl-btn-green" style="width:100%" onclick="ptlEnviarPesquisa('${p.id}')">✅ Enviar Resposta (+10 pts)</button>
  </div>
</div>`;
}

window.ptlEnviarPesquisa = function(id) {
  PortalDB.update(d => {
    if (!d.pesquisas_respondidas) d.pesquisas_respondidas = [];
    if (!d.pesquisas_respondidas.includes(id)) d.pesquisas_respondidas.push(id);
  });
  delete window._ptlPesquisaAtiva;
  if(window.Toast) Toast.success('Obrigado pela sua resposta! +10 pts de engajamento.');
  ptlNav('pesquisas');
};

// ── 11. NOTIFICAÇÕES ───────────────────────────────────────────
function _ptlNotificacoes() {
  const db  = PortalDB.get();
  const nots = db.notificacoes;
  const nNL  = nots.filter(n=>!n.lida).length;

  const corTipo = { ferias:'#7c3aed', pagamento:'#16a34a', avaliacao:'#2563eb', ponto:'#d97706', beneficio:'#0891b2' };

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>🔔 Notificações <span class="ptl-badge ptl-badge-red" style="margin-left:6px">${nNL} não lidas</span></h3>
      <button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlMarcarTodasLidas()">Marcar todas como lidas</button>
    </div>
    ${nots.map(n=>`
    <div class="ptl-notif-item ${!n.lida?'ptl-notif-nao-lida':''}" style="cursor:pointer" onclick="ptlAbrirNotif('${n.id}')">
      <div class="ptl-notif-icon" style="background:${corTipo[n.tipo]||'#64748b'}15;color:${corTipo[n.tipo]||'#64748b'}">
        ${n.icone}
      </div>
      <div class="ptl-notif-body">
        <div class="ptl-notif-titulo">${n.titulo} ${!n.lida?'<span style="display:inline-block;width:7px;height:7px;background:#2563eb;border-radius:50%;margin-left:4px;vertical-align:middle"></span>':''}</div>
        <div class="ptl-notif-desc">${n.desc||n['desc']}</div>
        <div class="ptl-notif-tempo">🕐 ${n.tempo}</div>
      </div>
      <button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="event.stopPropagation();ptlNav('${n.acao}')">Ver →</button>
    </div>`).join('')}
  </div>
</div>`;
}

window.ptlMarcarTodasLidas = function() {
  PortalDB.update(d => { d.notificacoes.forEach(n => n.lida = true); });
  if(window.Toast) Toast.success('Todas as notificações marcadas como lidas.');
  ptlNav('notificacoes');
};

window.ptlAbrirNotif = function(id) {
  PortalDB.update(d => {
    const n = d.notificacoes.find(x=>x.id===id);
    if (n) n.lida = true;
  });
  const db = PortalDB.get();
  const notif = db.notificacoes.find(n=>n.id===id);
  if (notif) ptlNav(notif.acao);
};

// ── 12. PERFIL ─────────────────────────────────────────────────
function _ptlPerfil() {
  const user = PortalUser.get();
  const db   = PortalDB.get();
  const pe   = db.perfil_extra || {};
  const ini  = PortalUser.iniciais();

  return `
<div>
  <div class="ptl-perfil-hd">
    <div class="ptl-perfil-avatar">${ini}</div>
    <div style="flex:1">
      <div style="font-size:20px;font-weight:800;margin-bottom:4px">${PortalUser.nome()}</div>
      <div style="font-size:13px;opacity:.75">${PortalUser.cargo()} · ${PortalUser.setor()}</div>
      <div style="font-size:11px;opacity:.55;margin-top:4px">Admissão: ${PFmt.data(PortalUser.admissao())} · Reg.: CLT</div>
    </div>
    <button class="ptl-btn" style="background:rgba(255,255,255,.15)" onclick="ptlEditarPerfil()">✏️ Editar</button>
  </div>

  <div class="ptl-grid-2">
    <!-- DADOS PESSOAIS -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>👤 Dados Pessoais</h3></div>
      ${[
        ['Nome completo', PortalUser.nome()],
        ['E-mail',        user.email||'—'],
        ['Telefone',      pe.telefone||'(83) 99999-1234'],
        ['Endereço',      pe.endereco||'—'],
        ['Setor',         PortalUser.setor()],
        ['Cargo',         PortalUser.cargo()],
        ['Data Admissão', PFmt.data(PortalUser.admissao())],
        ['Regime',        'CLT'],
      ].map(([l,v])=>`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
        <span style="color:#64748b;font-weight:600">${l}</span>
        <span style="font-weight:500;max-width:55%;text-align:right">${v}</span>
      </div>`).join('')}
    </div>

    <!-- DADOS BANCÁRIOS -->
    <div class="ptl-card">
      <div class="ptl-card-hd"><h3>🏦 Dados Bancários</h3><button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlEditarBanco()">Editar</button></div>
      ${[
        ['Banco',      pe.banco||'—'],
        ['Agência',    pe.agencia||'—'],
        ['Conta',      pe.conta||'—'],
        ['Tipo',       pe.tipo_conta||'Corrente'],
        ['Chave PIX',  user.email||'—'],
      ].map(([l,v])=>`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
        <span style="color:#64748b;font-weight:600">${l}</span>
        <span style="font-weight:500">${v}</span>
      </div>`).join('')}
      <div class="ptl-alert ptl-alert-info" style="margin-top:12px">ℹ️ Alterações bancárias passam por aprovação do RH em até 48h.</div>
    </div>
  </div>

  <!-- DEPENDENTES -->
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>👨‍👩‍👧 Dependentes</h3>
      <button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlAdicionarDep()">+ Adicionar</button>
    </div>
    ${(pe.dependentes||[]).length === 0
      ? `<div style="text-align:center;padding:20px;color:#94a3b8">Nenhum dependente cadastrado</div>`
      : `<div class="ptl-table-wrap"><table class="ptl-table">
          <thead><tr><th>Nome</th><th>Parentesco</th><th>CPF</th><th>Nascimento</th><th>Ações</th></tr></thead>
          <tbody>${(pe.dependentes||[]).map(d=>`<tr>
            <td><strong>${d.nome}</strong></td>
            <td>${d.parentesco}</td>
            <td>${d.cpf}</td>
            <td>${PFmt.data(d.nascimento)}</td>
            <td><button class="ptl-btn ptl-btn-sm ptl-btn-ghost">✏️</button></td>
          </tr>`).join('')}</tbody>
        </table></div>`}
  </div>
</div>`;
}

window.ptlEditarPerfil = function() { if(window.Toast) Toast.aviso('Edições de dados pessoais enviadas ao RH para aprovação.'); };
window.ptlEditarBanco  = function() { if(window.Toast) Toast.aviso('Abra um chamado com o RH para atualizar dados bancários.'); };
window.ptlAdicionarDep = function() { if(window.Toast) Toast.success('Envie os documentos do dependente para o RH.'); };

// ── 13. ASSISTENTE IA ──────────────────────────────────────────
function _ptlAssistente() {
  const db   = PortalDB.get();
  const hist = db.chat || [];
  if (hist.length === 0) {
    hist.push({ de:'bot', msg:'Olá! 👋 Sou o **Hi Assistant**, seu assistente de RH inteligente. Posso responder perguntas sobre holerite, férias, benefícios e muito mais. Como posso ajudar?' });
  }

  const sugestoes = [
    'Quanto vou receber nas férias?',
    'Tenho saldo de banco de horas?',
    'Quando posso tirar férias?',
    'Como funciona meu INSS?',
    'Qual o prazo para solicitar ajuste de ponto?',
  ];

  return `
<div>
  <div class="ptl-card">
    <div class="ptl-card-hd">
      <h3>🤖 Hi Assistant — Assistente de RH</h3>
      <button class="ptl-btn ptl-btn-sm ptl-btn-ghost" onclick="ptlLimparChat()">🗑️ Limpar</button>
    </div>

    <div class="ptl-chat-wrap" id="ptl-chat-wrap">
      ${hist.map(m=>`
      <div class="ptl-chat-msg ${m.de==='bot'?'ptl-chat-bot':'ptl-chat-user'}">
        ${m.de==='bot'?'<span class="ptl-chat-bot-name">Hi Assistant</span>':''}
        ${m.msg.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}
      </div>`).join('')}
    </div>

    <div class="ptl-sugestoes">
      ${sugestoes.map(s=>`<button class="ptl-sugestao-btn" onclick="ptlEnviarChat('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('')}
    </div>

    <div class="ptl-chat-input-row">
      <input type="text" id="ptl-chat-input" class="ptl-chat-input"
        placeholder="Pergunte sobre férias, holerite, benefícios..."
        onkeydown="if(event.key==='Enter')ptlEnviarChat(this.value)"/>
      <button class="ptl-btn" onclick="ptlEnviarChat(document.getElementById('ptl-chat-input').value)">➤ Enviar</button>
    </div>
  </div>
</div>`;
}

window.ptlEnviarChat = function(msg) {
  msg = (msg||'').trim();
  if (!msg) return;
  const input = document.getElementById('ptl-chat-input');
  if (input) input.value = '';

  PortalDB.update(d => { if(!d.chat) d.chat=[]; d.chat.push({de:'user', msg}); });

  const resp = _ptlIA(msg);
  setTimeout(() => {
    PortalDB.update(d => { d.chat.push({de:'bot', msg:resp}); });
    ptlNav('assistente');
    setTimeout(() => {
      const wrap = document.getElementById('ptl-chat-wrap');
      if (wrap) wrap.scrollTop = wrap.scrollHeight;
    }, 50);
  }, 600);

  ptlNav('assistente');
  setTimeout(() => { const w = document.getElementById('ptl-chat-wrap'); if(w) w.scrollTop = w.scrollHeight; }, 50);
};

function _ptlIA(pergunta) {
  const p  = pergunta.toLowerCase();
  const sal = PortalUser.salario();

  if (p.includes('férias') && (p.includes('quanto') || p.includes('valor') || p.includes('receber'))) {
    const sim = CLT.ferias(sal, 30);
    return `Nas suas férias de 30 dias você receberá aproximadamente:\n\n**Salário de férias:** ${PFmt.moeda(sim.bruto - sim.terco)}\n**⅓ constitucional:** ${PFmt.moeda(sim.terco)}\n**INSS:** - ${PFmt.moeda(sim.inss)}\n**IRRF:** - ${PFmt.moeda(sim.irrf)}\n\n💰 **Líquido estimado: ${PFmt.moeda(sim.liquido)}**\n\nSe optar por abono de 10 dias, pode vender 10 dias em dinheiro e gozar 20 dias.`;
  }

  if (p.includes('férias') && (p.includes('quando') || p.includes('tirar') || p.includes('posso'))) {
    const saldo = _calcSaldoFerias();
    return saldo > 0
      ? `Você tem **${saldo} dias de férias disponíveis**! Pode solicitar a qualquer momento pela aba Férias. O RH deve ser avisado com pelo menos 30 dias de antecedência (CLT Art. 135).`
      : `Você ainda está no período aquisitivo. As férias ficam disponíveis após **12 meses de trabalho** contínuo na empresa (CLT Art. 130).`;
  }

  if (p.includes('banco de horas')) {
    return `Seu **banco de horas atual é +2h 30m** a seu favor. Horas extras são computadas automaticamente a 50% (dias úteis) ou 100% (domingos/feriados), conforme CLT Art. 59. Você pode compensar ou receber em dinheiro — fale com o RH.`;
  }

  if (p.includes('inss') || p.includes('desconto')) {
    const inss = CLT.inss(sal);
    return `O INSS é calculado pela **tabela progressiva 2024**:\n\n• Até R$1.320,00: **7,5%**\n• R$1.320,01 a R$2.571,29: **9%**\n• R$2.571,30 a R$3.856,94: **12%**\n• R$3.856,95 a R$7.507,49: **14%**\n\nSobre o seu salário de ${PFmt.moeda(sal)}, o desconto é **${PFmt.moeda(inss)}**.`;
  }

  if (p.includes('fgts')) {
    const fgts = CLT.fgts(sal);
    return `O FGTS corresponde a **8% do seu salário bruto**, depositado pela empresa mensalmente na Caixa Econômica Federal. Sobre ${PFmt.moeda(sal)}, o depósito mensal é de **${PFmt.moeda(fgts)}**. Você NÃO perde esse dinheiro — ele fica na sua conta vinculada e pode ser sacado em caso de demissão sem justa causa, compra de imóvel, aposentadoria e outros casos previstos em lei.`;
  }

  if (p.includes('ponto') && (p.includes('ajuste') || p.includes('esquecer') || p.includes('prazo'))) {
    return `O prazo para solicitar **ajuste de ponto** é de até **5 dias úteis** após a ocorrência. Acesse a aba **Ponto Eletrônico** → botão "Solicitar Ajuste". O gestor e o RH analisarão em até 48h.`;
  }

  if (p.includes('holerite') || p.includes('contracheque')) {
    const liq = CLT.liquido(sal, 1);
    return `Seu holerite de **Maio/2025** está disponível na aba Holerite.\n\n💰 **Salário líquido: ${PFmt.moeda(liq)}**\n\nO pagamento é realizado todo dia **5 do mês seguinte** via depósito bancário. Você pode baixar em PDF.`;
  }

  if (p.includes('benefício') || p.includes('caju') || p.includes('va') || p.includes('vt')) {
    return `Seus benefícios ativos:\n\n🍽️ **VA Caju:** R$ 550/mês (recarga dia 1º)\n🚌 **VT Nubus:** R$ 200/mês (recarga dia 1º)\n❤️ **Plano de Saúde:** SulAmérica\n🦷 **Plano Odonto:** SulAmérica\n💪 **Wellhub:** Plano Silver (+ 5.000 parceiros)\n💊 **Telemedicina:** Conexa Saúde 24h\n\nFaltas podem impactar o VT (desconto proporcional por dia).`;
  }

  if (p.includes('demissão') || p.includes('rescisão') || p.includes('aviso prévio')) {
    return `Em caso de **demissão sem justa causa**, você tem direito a:\n\n• Saldo de salário\n• Aviso prévio (30 dias + 3 dias/ano trabalhado, máx. 90 dias)\n• 13º proporcional\n• Férias + ⅓ (vencidas e proporcionais)\n• Multa de 40% sobre o FGTS\n• Saque do FGTS\n• Seguro desemprego\n\nO RH faz todo o cálculo pela aba Depto. Pessoal.`;
  }

  if (p.includes('salário') && p.includes('liquid')) {
    const liq = CLT.liquido(sal, 1);
    return `Seu salário líquido estimado é **${PFmt.moeda(liq)}**.\n\n• Salário bruto: ${PFmt.moeda(sal)}\n• INSS: - ${PFmt.moeda(CLT.inss(sal))}\n• IRRF: - ${PFmt.moeda(CLT.irrf(sal,1))}\n\nO valor exato pode variar com outros descontos (vale transporte, plano de saúde, etc.).`;
  }

  if (p.includes('oi') || p.includes('olá') || p.includes('bom dia') || p.includes('boa tarde')) {
    const h = new Date().getHours();
    const s = h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
    return `${s}, ${PortalUser.nome().split(' ')[0]}! 😊 Como posso ajudar você hoje? Pergunte sobre férias, holerite, benefícios, ponto ou qualquer dúvida trabalhista.`;
  }

  return `Entendi sua pergunta sobre **"${pergunta}"**. Para dúvidas mais específicas, recomendo:\n\n📋 **Holerite** → aba Holerite\n🏖️ **Férias** → aba Férias\n💳 **Benefícios** → aba Benefícios\n📝 **Documentos** → aba Documentos\n\nOu entre em contato com o RH: **rh@empresa.com.br** | Ramal 2100.`;
}

window.ptlLimparChat = function() {
  PortalDB.update(d => { d.chat = []; });
  ptlNav('assistente');
};

// ── JORNADA — página separada dentro do portal ────────────────
function _ptlJornada() {
  if (typeof renderJornada !== 'function') {
    return `<div style="padding:48px;text-align:center;color:#94a3b8">
      <div style="font-size:48px;margin-bottom:12px">🚀</div>
      <h3 style="margin:0 0 8px">Módulo Jornada não carregado</h3>
      <p style="font-size:13px">Recarregue a página para tentar novamente.</p>
    </div>`;
  }

  const jornada = renderJornada();

  setTimeout(() => {
    if (typeof initPage_jornada === 'function') initPage_jornada();
  }, 80);

  return `
<div class="ptl-jornada-wrapper">
  <!-- Barra de retorno ao portal -->
  <div class="ptl-jornada-topbar">
    <button class="ptl-jornada-back" onclick="ptlNav('dashboard')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Voltar ao Portal
    </button>
    <div class="ptl-jornada-topbar-title">
      <span>🚀</span> Jornada do Colaborador
    </div>
    <div class="ptl-jornada-topbar-user">
      <span>${PortalUser.nome().split(' ')[0]}</span>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">
        ${PortalUser.iniciais()}
      </div>
    </div>
  </div>
  <!-- Conteúdo completo da jornada -->
  <div class="ptl-jornada-body">${jornada}</div>
</div>`;
}

// ── GAMIFICAÇÃO ────────────────────────────────────────────────
function _calcPontos(db) {
  let pts = 0;
  pts += (db.pontos?.filter(p=>!p.falta).length || 0) * 5;
  pts += (db.ideias?.filter(i=>i.status==='aprovada').length || 0) * 50;
  pts += (db.ideias?.filter(i=>i.status==='em_analise').length || 0) * 10;
  pts += (db.pesquisas_respondidas?.length || 0) * 10;
  pts += (db.documentos_assinados?.length || 0) * 5;
  return pts;
}

// ── initPage ──────────────────────────────────────────────────
function initPage_portal() {
  _ptlSec = 'dashboard';
  if (_ptlClockInterval) clearInterval(_ptlClockInterval);
}
