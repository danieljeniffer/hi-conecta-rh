/**
 * dashboard-adaptativo.js — Dashboard Adaptativo por Perfil DISC
 * hi Conecta RH · Human Experience Operating System
 *
 * Cada usuário vê uma experiência completamente diferente baseada em:
 *   D (Dominância)   → metas, ranking, desafios, velocidade
 *   I (Influência)   → pessoas, reconhecimento, comunicação, engajamento
 *   S (Estabilidade) → bem-estar, equilíbrio, suporte, harmonia
 *   C (Conformidade) → dados, precisão, qualidade, organização
 *
 * O sistema detecta o perfil DISC via Auth.js + configura a UI
 * automaticamente. O usuário pode alternar manualmente.
 */

// ── Engine DISC ───────────────────────────────────────────────

const DISCEngine = {

  perfis: {
    D: {
      label:    'Dominante',
      emoji:    '🔥',
      cor:      '#ef4444',
      cor2:     '#dc2626',
      gradiente:'linear-gradient(135deg, rgba(239,68,68,.15), rgba(220,38,38,.05))',
      descricao:'Orientado a resultados, competitivo e decisivo.',
      foco:     'Metas · Rankings · Desafios · Velocidade',
      kpis:     ['meta_mensal','posicao_ranking','desafios_abertos','recordes'],
      widgets:  ['ranking','metas','desafios','sprint'],
      mensagem: 'Você está {pct}% da meta. Mais {falta} para bater o recorde!',
      acoes:    ['Ver ranking', 'Novo desafio', 'Bater meta', 'Acelerar'],
    },
    I: {
      label:    'Influente',
      emoji:    '⭐',
      cor:      '#f59e0b',
      cor2:     '#d97706',
      gradiente:'linear-gradient(135deg, rgba(245,158,11,.15), rgba(217,119,6,.05))',
      descricao:'Comunicativo, otimista e colaborativo.',
      foco:     'Pessoas · Reconhecimento · Comunicação · Engajamento',
      kpis:     ['reconhecimentos','network_score','comunicados','equipe_felicidade'],
      widgets:  ['reconhecimentos','feed','aniversarios','colaboracao'],
      mensagem: 'Você recebeu {n} reconhecimentos este mês! ⭐',
      acoes:    ['Reconhecer alguém', 'Ver feed', 'Dar feedback', 'Conectar'],
    },
    S: {
      label:    'Estável',
      emoji:    '🌿',
      cor:      '#10b981',
      cor2:     '#059669',
      gradiente:'linear-gradient(135deg, rgba(16,185,129,.15), rgba(5,150,105,.05))',
      descricao:'Confiável, empático e orientado ao suporte.',
      foco:     'Bem-estar · Equilíbrio · Suporte · Harmonia',
      kpis:     ['bem_estar','equilibrio','solicitacoes','satisfacao'],
      widgets:  ['bem_estar','apoio','calendario','suporte'],
      mensagem: 'Seu índice de bem-estar é {score}/100 esta semana.',
      acoes:    ['Ver benefícios', 'Solicitar ajuda', 'Agenda', 'Bem-estar'],
    },
    C: {
      label:    'Conforme',
      emoji:    '📊',
      cor:      '#6366f1',
      cor2:     '#4f46e5',
      gradiente:'linear-gradient(135deg, rgba(99,102,241,.15), rgba(79,70,229,.05))',
      descricao:'Analítico, preciso e orientado à qualidade.',
      foco:     'Dados · Precisão · Qualidade · Organização',
      kpis:     ['qualidade','tarefas_concluidas','pendencias','score_precisao'],
      widgets:  ['dados','tarefas','qualidade','relatorios'],
      mensagem: 'Taxa de conclusão: {pct}%. {pendencias} pendências.',
      acoes:    ['Ver relatórios', 'Tarefas', 'Qualidade', 'Analisar'],
    },
  },

  // Detecta perfil DISC do usuário (via sessionStorage ou pergunta rápida)
  detectarPerfil() {
    const stored = sessionStorage.getItem('disc_perfil');
    if (stored && this.perfis[stored]) return stored;

    // Inferência básica pelo cargo/perfil de acesso
    const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
    const cargo    = (userData.cargo || '').toLowerCase();
    const perfil   = (userData.perfil || 'colab').toLowerCase();

    if (perfil === 'admin' || cargo.includes('diretor') || cargo.includes('gerente')) return 'D';
    if (cargo.includes('comercial') || cargo.includes('vendas') || cargo.includes('rh')) return 'I';
    if (cargo.includes('ti') || cargo.includes('analista') || cargo.includes('financeiro')) return 'C';
    return 'S'; // default: estável
  },

  salvarPerfil(letra) {
    sessionStorage.setItem('disc_perfil', letra);
  },
};

// ── Dados adaptativos ─────────────────────────────────────────

const DASHData = {
  D: {
    kpis: [
      { val:'87%',  label:'Meta mensal',      delta:'+12%',  dir:'up',  cor:'#ef4444' },
      { val:'3°',   label:'Ranking equipe',   delta:'↑2',    dir:'up',  cor:'#f59e0b' },
      { val:'4',    label:'Desafios ativos',  delta:'nov.',  dir:'neutral', cor:'#6366f1' },
      { val:'23d',  label:'Streak produtivo', delta:'recorde!', dir:'up', cor:'#10b981' },
    ],
    alertas: [
      { tipo:'meta',       msg:'Meta a 13% — sprint final! Você consegue.' },
      { tipo:'ranking',    msg:'Subiu 2 posições. Pedro Henrique está 4% à frente.' },
      { tipo:'desafio',    msg:'Novo desafio disponível: "10 clientes esta semana"' },
    ],
    widgets: [_widgetRanking, _widgetMeta, _widgetDesafios, _widgetVelocidade],
  },
  I: {
    kpis: [
      { val:'12',   label:'Reconhecimentos',  delta:'+5',    dir:'up',  cor:'#f59e0b' },
      { val:'94',   label:'Network score',    delta:'+3',    dir:'up',  cor:'#ec4899' },
      { val:'8',    label:'Feedbacks dados',  delta:'+2',    dir:'up',  cor:'#6366f1' },
      { val:'87%',  label:'Engajamento',      delta:'+7%',   dir:'up',  cor:'#10b981' },
    ],
    alertas: [
      { tipo:'social',     msg:'5 colegas aguardam feedback da sua parte.' },
      { tipo:'aniversario',msg:'3 aniversários na equipe esta semana 🎂' },
      { tipo:'comunicado', msg:'Novo comunicado do RH — Leia e reaja!' },
    ],
    widgets: [_widgetReconhecimentos, _widgetFeed, _widgetAniversarios, _widgetRede],
  },
  S: {
    kpis: [
      { val:'82',   label:'Bem-estar',        delta:'+4',    dir:'up',  cor:'#10b981' },
      { val:'7/10', label:'Equilíbrio vida',  delta:'ok',    dir:'neutral', cor:'#06b6d4' },
      { val:'3',    label:'Pendências RH',    delta:'-1',    dir:'up',  cor:'#f59e0b' },
      { val:'94%',  label:'Satisfação',       delta:'+2%',   dir:'up',  cor:'#a78bfa' },
    ],
    alertas: [
      { tipo:'bem_estar',  msg:'Você completou 5 dias seguidos de jornada equilibrada! 🌿' },
      { tipo:'ferias',     msg:'Suas próximas férias: 15 de julho (47 dias).' },
      { tipo:'apoio',      msg:'Sessão de mentoria disponível — agende agora.' },
    ],
    widgets: [_widgetBemEstar, _widgetCalendario, _widgetSolicitacoes, _widgetAprendizado],
  },
  C: {
    kpis: [
      { val:'96%',  label:'Qualidade',        delta:'+1%',   dir:'up',  cor:'#6366f1' },
      { val:'47',   label:'Tarefas concluídas',delta:'+8',   dir:'up',  cor:'#10b981' },
      { val:'3',    label:'Pendências',        delta:'-2',    dir:'up',  cor:'#f59e0b' },
      { val:'8.9',  label:'Score precisão',   delta:'+0.3',  dir:'up',  cor:'#a78bfa' },
    ],
    alertas: [
      { tipo:'qualidade',  msg:'Taxa de retrabalho: 2.1% — abaixo da meta de 5%.' },
      { tipo:'deadline',   msg:'2 entregáveis vencem em 3 dias. Tudo no prazo.' },
      { tipo:'relatorio',  msg:'Relatório mensal disponível para download.' },
    ],
    widgets: [_widgetDados, _widgetTarefas, _widgetQualidade, _widgetRelatorios],
  },
};

// ── Render principal ──────────────────────────────────────────

function renderDashboardAdaptativo() {
  const pc = document.getElementById('pageContainer');
  if (!pc) return;

  let discLetra = DISCEngine.detectarPerfil();
  const p       = DISCEngine.perfis[discLetra];
  const dados   = DASHData[discLetra];
  const userData= JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const nome    = (userData.nome || 'Colaborador').split(' ')[0];

  pc.innerHTML = `
<div class="da-root">

  <!-- Seletor de perfil DISC -->
  <div class="da-disc-selector">
    <span class="da-disc-label">Seu perfil DISC:</span>
    ${Object.entries(DISCEngine.perfis).map(([letra, prof]) =>
      `<button class="da-disc-btn ${discLetra === letra ? 'da-disc-btn--ativo' : ''}"
        onclick="DASHEngine.mudarPerfil('${letra}')"
        style="--disc-cor:${prof.cor}" title="${prof.label}">
        ${prof.emoji} ${letra} · ${prof.label}
      </button>`
    ).join('')}
  </div>

  <!-- Hero adaptativo -->
  <div class="da-hero" style="background:${p.gradiente};border-color:${p.cor}33">
    <div class="da-hero-left">
      <div class="da-hero-badge" style="background:${p.cor}22;color:${p.cor};border-color:${p.cor}44">
        ${p.emoji} Perfil ${p.label}
      </div>
      <h1 class="da-hero-title">Olá, ${nome}.</h1>
      <p class="da-hero-desc">${p.descricao} Foco: <strong style="color:${p.cor}">${p.foco}</strong></p>
    </div>
    <div class="da-hero-acoes">
      ${p.acoes.map(a => `<button class="da-acao-btn" style="border-color:${p.cor}44;color:${p.cor}">${a}</button>`).join('')}
    </div>
  </div>

  <!-- KPIs adaptados ao perfil -->
  <div class="da-kpis">
    ${dados.kpis.map(k => `
      <div class="da-kpi" style="--kpi-cor:${k.cor}">
        <div class="da-kpi-value" style="color:${k.cor}">${k.val}</div>
        <div class="da-kpi-label">${k.label}</div>
        <div class="da-kpi-delta ${k.dir === 'up' ? 'up' : k.dir === 'down' ? 'down' : 'neutral'}">${k.delta}</div>
      </div>`).join('')}
  </div>

  <!-- Alertas contextuais -->
  <div class="da-alertas">
    ${dados.alertas.map(a => `
      <div class="da-alerta" style="border-left-color:${p.cor}">
        <span class="da-alerta-dot" style="background:${p.cor}"></span>
        <span class="da-alerta-msg">${a.msg}</span>
      </div>`).join('')}
  </div>

  <!-- Widgets adaptativos -->
  <div class="da-widgets" id="da-widgets-container">
    ${dados.widgets.map(fn => fn(p)).join('')}
  </div>

  <!-- Mini perfil DISC -->
  <div class="da-profile-card">
    <div class="da-pc-title">Seu DNA Profissional</div>
    <div class="da-disc-bars">
      ${Object.entries({D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'}).map(([letra, nome]) => {
        const scores = {D:{D:85,I:32,S:28,C:41},I:{D:44,I:82,S:61,C:38},S:{D:31,I:58,S:88,C:52},C:{D:40,I:35,S:48,C:91}};
        const v = (scores[discLetra] || scores.S)[letra];
        const cor = DISCEngine.perfis[letra].cor;
        return `<div class="da-disc-row">
          <span class="da-disc-l" style="color:${cor}">${letra}</span>
          <span class="da-disc-nm">${nome}</span>
          <div class="da-disc-bar"><div class="da-disc-fill" style="width:${v}%;background:${cor}"></div></div>
          <span class="da-disc-v" style="color:${cor}">${v}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="da-disc-insight">
      💡 ${_insightDISC(discLetra)}
    </div>
  </div>

</div>

<style>
.da-root{padding:0 0 2rem;max-width:1300px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}
/* Selector DISC */
.da-disc-selector{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem}
.da-disc-label{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em}
.da-disc-btn{padding:.35rem .85rem;border-radius:999px;border:1.5px solid rgba(255,255,255,.08);background:transparent;
  color:#94a3b8;font-size:.75rem;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit}
.da-disc-btn:hover{border-color:var(--disc-cor);color:var(--disc-cor);background:color-mix(in srgb,var(--disc-cor) 10%,transparent)}
.da-disc-btn--ativo{border-color:var(--disc-cor)!important;color:var(--disc-cor)!important;background:color-mix(in srgb,var(--disc-cor) 12%,transparent)!important}
/* Hero */
.da-hero{border:1px solid;border-radius:20px;padding:1.75rem;display:flex;align-items:center;
  justify-content:space-between;gap:1.5rem;margin-bottom:1.25rem;flex-wrap:wrap;
  animation:fadeSlideIn .5s ease}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.da-hero-badge{display:inline-flex;padding:.3rem .85rem;border-radius:999px;border:1px solid;font-size:.78rem;font-weight:700;margin-bottom:.75rem}
.da-hero-title{font-size:1.9rem;font-weight:900;color:#f8fafc;margin-bottom:.4rem;line-height:1.1}
.da-hero-desc{color:#94a3b8;font-size:.875rem;line-height:1.5}
.da-hero-acoes{display:flex;gap:.5rem;flex-wrap:wrap}
.da-acao-btn{padding:.45rem 1rem;border-radius:10px;border:1.5px solid;background:transparent;
  font-size:.8rem;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit}
.da-acao-btn:hover{opacity:.8;transform:translateY(-1px)}
/* KPIs */
.da-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:.875rem;margin-bottom:1rem}
@media(max-width:900px){.da-kpis{grid-template-columns:repeat(2,1fr)}}
.da-kpi{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:14px;
  padding:1rem;border-left:3px solid var(--kpi-cor);transition:.2s}
.da-kpi:hover{transform:translateY(-2px);border-color:var(--kpi-cor)44}
.da-kpi-value{font-size:1.8rem;font-weight:900;line-height:1;margin-bottom:.2rem}
.da-kpi-label{font-size:.7rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.da-kpi-delta{font-size:.72rem;font-weight:700;margin-top:.25rem}
.da-kpi-delta.up{color:#10b981}.da-kpi-delta.down{color:#ef4444}.da-kpi-delta.neutral{color:#64748b}
/* Alertas */
.da-alertas{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.25rem}
.da-alerta{display:flex;align-items:center;gap:.65rem;padding:.6rem .875rem;border-radius:10px;
  border-left:3px solid;background:rgba(255,255,255,.025);font-size:.82rem;color:#e2e8f0;
  animation:fadeSlideIn .4s ease}
.da-alerta-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
/* Widgets grid */
.da-widgets{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.875rem;margin-bottom:1.25rem}
.da-widget{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.1rem}
.da-widget-title{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.875rem}
/* DISC bars */
.da-profile-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.1rem}
.da-pc-title{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.875rem}
.da-disc-bars{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.875rem}
.da-disc-row{display:flex;align-items:center;gap:.65rem}
.da-disc-l{width:16px;font-size:.9rem;font-weight:900;flex-shrink:0;text-align:center}
.da-disc-nm{width:90px;font-size:.75rem;color:#94a3b8;flex-shrink:0}
.da-disc-bar{flex:1;height:7px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}
.da-disc-fill{height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}
.da-disc-v{width:28px;text-align:right;font-size:.78rem;font-weight:700;flex-shrink:0}
.da-disc-insight{font-size:.78rem;color:#94a3b8;padding:.6rem .75rem;background:rgba(255,255,255,.02);border-radius:8px;line-height:1.5}
/* Widget genérico items */
.da-witem{display:flex;align-items:center;gap:.6rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.8rem}
.da-witem:last-child{border:none}
.da-wrank{width:20px;font-size:.72rem;font-weight:700;color:#64748b;text-align:center;flex-shrink:0}
.da-wname{flex:1;color:#e2e8f0}
.da-wval{font-size:.75rem;font-weight:700;text-align:right}
.da-wbar{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden}
.da-wfill{height:100%;border-radius:3px}
/* Gauge mini */
.da-gauge{display:flex;justify-content:center;margin-bottom:.75rem}
</style>
`;
}

// ── Widgets por perfil ────────────────────────────────────────

function _widgetRanking(p) {
  const items = [
    ['Ana Lima',   92, p.cor],['Você',        87, p.cor],
    ['Pedro H.',   84, '#94a3b8'],['Camila A.',   79, '#94a3b8'],
  ];
  return `<div class="da-widget">
    <div class="da-widget-title">🏆 Ranking da Equipe</div>
    ${items.map(([n,v,c],i) => `<div class="da-witem">
      <div class="da-wrank" style="color:${i<2?p.cor:'#475569'}">${i===1?'👤':i+1}</div>
      <div class="da-wname" style="color:${i===1?p.cor:'#e2e8f0'};font-weight:${i===1?700:400}">${n}</div>
      <div class="da-wbar"><div class="da-wfill" style="width:${v}%;background:${c}"></div></div>
      <div class="da-wval" style="color:${c}">${v}</div>
    </div>`).join('')}
  </div>`;
}

function _widgetMeta(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🎯 Meta do Mês</div>
    <div style="text-align:center;padding:.5rem 0">
      <svg viewBox="0 0 100 60" width="160" style="display:block;margin:0 auto">
        <path d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10" stroke-linecap="round"/>
        <path d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="${p.cor}" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${141*.87} 141"/>
        <text x="50" y="48" text-anchor="middle" fill="${p.cor}" font-size="18" font-weight="900" font-family="inherit">87%</text>
      </svg>
      <div style="font-size:.75rem;color:#94a3b8;margin-top:.5rem">Faltam <strong style="color:${p.cor}">R$ 13.500</strong> para a meta</div>
    </div>
  </div>`;
}

function _widgetDesafios(p) {
  const ds = [
    { label:'10 novos clientes',     prog:7,  total:10 },
    { label:'NPS > 90 em pesquisa',  prog:87, total:90 },
    { label:'Zero cancelamentos',    prog:2,  total:0  },
  ];
  return `<div class="da-widget">
    <div class="da-widget-title">⚡ Desafios Ativos</div>
    ${ds.map(d => `<div class="da-witem" style="flex-direction:column;align-items:flex-start;gap:.3rem">
      <div style="font-size:.78rem;color:#e2e8f0">${d.label}</div>
      <div style="width:100%;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden">
        <div style="width:${d.total>0?Math.min(d.prog/d.total*100,100):100}%;height:100%;background:${p.cor};border-radius:3px"></div>
      </div>
    </div>`).join('')}
  </div>`;
}

function _widgetVelocidade(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🏃 Velocidade Operacional</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
      ${[['Tempo resp.','4.2h','↓','#10b981'],['Conversão','34%','↑',p.cor],['Ciclo venda','8d','→','#f59e0b'],['Rejeição','12%','↓','#10b981']].map(([l,v,d,c]) =>
        `<div style="padding:.5rem;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.05)">
          <div style="font-size:1.1rem;font-weight:800;color:${c}">${v}</div>
          <div style="font-size:.65rem;color:#64748b">${l} ${d}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

function _widgetReconhecimentos(p) {
  const items = [
    { de:'Carlos S.', msg:'Apresentação incrível!', ico:'⭐' },
    { de:'RH',        msg:'Colaborador do mês!',    ico:'🏆' },
    { de:'Ana L.',    msg:'Obrigada pelo suporte.',  ico:'💛' },
  ];
  return `<div class="da-widget">
    <div class="da-widget-title">⭐ Reconhecimentos Recebidos</div>
    ${items.map(r => `<div class="da-witem">
      <span style="font-size:1rem">${r.ico}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:.72rem;color:#64748b">${r.de}</div>
        <div style="font-size:.8rem;color:#e2e8f0">${r.msg}</div>
      </div>
    </div>`).join('')}
  </div>`;
}

function _widgetFeed(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">📣 Mural Corporativo</div>
    <div style="font-size:.78rem;color:#e2e8f0;line-height:1.6;padding:.5rem;background:rgba(255,255,255,.02);border-radius:8px;margin-bottom:.5rem">
      📢 <strong>Reunião geral</strong> — Amanhã 09h — Todos presentes!
    </div>
    <div style="font-size:.78rem;color:#e2e8f0;line-height:1.6;padding:.5rem;background:rgba(255,255,255,.02);border-radius:8px">
      🎉 <strong>Camila foi promovida!</strong> Parabéns à nossa nova Coordenadora!
    </div>
  </div>`;
}

function _widgetAniversarios(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🎂 Aniversários esta semana</div>
    ${[['Pedro H.','Amanhã','TI'],['Ana Lima','Qua.','Comercial'],['Bruno A.','Sex.','Operações']].map(([n,d,s]) =>
      `<div class="da-witem">
        <div style="width:30px;height:30px;border-radius:50%;background:${p.cor}22;color:${p.cor};display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;flex-shrink:0">${n.split(' ').map(w=>w[0]).join('')}</div>
        <div style="flex:1"><div style="font-size:.8rem;color:#e2e8f0;font-weight:600">${n}</div><div style="font-size:.68rem;color:#64748b">${s}</div></div>
        <div style="font-size:.72rem;color:${p.cor};font-weight:600">${d}</div>
      </div>`).join('')}
  </div>`;
}

function _widgetRede(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🌐 Minha Rede Interna</div>
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.75rem">
      ${['Carlos S.','Ana L.','Pedro H.','RH','Mariana','Diego N.','Beatriz'].map(n =>
        `<span style="padding:.2rem .55rem;border-radius:999px;background:${p.cor}15;color:${p.cor};font-size:.7rem;border:1px solid ${p.cor}30">${n}</span>`
      ).join('')}
    </div>
    <div style="font-size:.72rem;color:#94a3b8">Network score: <strong style="color:${p.cor}">94</strong> · Top 10%</div>
  </div>`;
}

function _widgetBemEstar(p) {
  const dias = ['S','T','Q','Q','S','S','D'];
  const vals = [72,78,65,82,80,88,83];
  return `<div class="da-widget">
    <div class="da-widget-title">🌿 Bem-estar da Semana</div>
    <div style="display:flex;align-items:flex-end;gap:.3rem;height:60px;margin-bottom:.5rem">
      ${vals.map((v,i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.2rem">
        <div style="width:100%;height:${v*0.6}px;background:${p.cor};border-radius:3px 3px 0 0;opacity:${i===4?.5:1}"></div>
        <div style="font-size:.6rem;color:#64748b">${dias[i]}</div>
      </div>`).join('')}
    </div>
    <div style="font-size:.75rem;color:#94a3b8">Média: <strong style="color:${p.cor}">78.3/100</strong> · Ótimo!</div>
  </div>`;
}

function _widgetCalendario(p) {
  const eventos = [
    { hora:'09:00', label:'Reunião de equipe',  cor:p.cor },
    { hora:'14:00', label:'1:1 com gestor',     cor:'#6366f1' },
    { hora:'16:30', label:'Treinamento online',  cor:'#10b981' },
  ];
  return `<div class="da-widget">
    <div class="da-widget-title">📅 Agenda de hoje</div>
    ${eventos.map(e => `<div class="da-witem">
      <div style="width:42px;font-size:.68rem;color:#64748b;flex-shrink:0">${e.hora}</div>
      <div style="width:3px;height:32px;background:${e.cor};border-radius:2px;flex-shrink:0"></div>
      <div style="font-size:.8rem;color:#e2e8f0">${e.label}</div>
    </div>`).join('')}
  </div>`;
}

function _widgetSolicitacoes(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🛠️ Minhas Solicitações</div>
    ${[['Férias — Jul/25','Aprovada','#10b981'],['Home office','Pendente','#f59e0b'],['Treinamento React','Em análise','#6366f1']].map(([l,s,c]) =>
      `<div class="da-witem">
        <div style="flex:1;font-size:.78rem;color:#e2e8f0">${l}</div>
        <span style="padding:.15rem .5rem;border-radius:999px;font-size:.65rem;font-weight:700;background:${c}20;color:${c}">${s}</span>
      </div>`).join('')}
  </div>`;
}

function _widgetAprendizado(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">🎓 Aprendizado</div>
    <div style="font-size:.8rem;color:#e2e8f0;padding:.5rem;background:rgba(255,255,255,.02);border-radius:8px;margin-bottom:.5rem;display:flex;gap:.5rem;align-items:center">
      <span>📘</span><div><div style="font-weight:600">Liderança Situacional</div><div style="font-size:.7rem;color:#64748b">Em andamento · 68% concluído</div></div>
    </div>
    <div style="height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden">
      <div style="width:68%;height:100%;background:${p.cor};border-radius:3px"></div>
    </div>
  </div>`;
}

function _widgetDados(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">📊 Painel de Dados</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
      ${[['Precisão','96.2%','↑',p.cor],['Retrabalho','2.1%','↓','#10b981'],['Entregas','47','—','#e2e8f0'],['SLA','99.1%','↑',p.cor]].map(([l,v,d,c]) =>
        `<div style="padding:.45rem;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.05)">
          <div style="font-size:.95rem;font-weight:800;color:${c}">${v} <span style="font-size:.65rem;font-weight:400">${d}</span></div>
          <div style="font-size:.62rem;color:#64748b">${l}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

function _widgetTarefas(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">✅ Tarefas</div>
    ${[['Revisar relatório Q2','alta','#ef4444'],['Validar planilha budget','media','#f59e0b'],['Atualizar indicadores','baixa','#6366f1']].map(([l,pr,c]) =>
      `<div class="da-witem">
        <div style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0"></div>
        <div style="flex:1;font-size:.78rem;color:#e2e8f0">${l}</div>
        <span style="font-size:.65rem;color:${c};font-weight:600">${pr}</span>
      </div>`).join('')}
  </div>`;
}

function _widgetQualidade(p) {
  const m = [['Jan','92%'],['Fev','94%'],['Mar','95%'],['Abr','93%'],['Mai','96%']];
  return `<div class="da-widget">
    <div class="da-widget-title">🎯 Histórico de Qualidade</div>
    <div style="display:flex;align-items:flex-end;gap:.35rem;height:50px;margin-bottom:.4rem">
      ${m.map(([mes,v]) => {
        const h = parseInt(v);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.15rem">
          <div style="width:100%;height:${(h-88)*5}px;background:${p.cor};border-radius:2px 2px 0 0"></div>
          <div style="font-size:.58rem;color:#64748b">${mes}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="font-size:.72rem;color:#94a3b8">Tendência: <strong style="color:#10b981">↑ crescente</strong></div>
  </div>`;
}

function _widgetRelatorios(p) {
  return `<div class="da-widget">
    <div class="da-widget-title">📄 Relatórios</div>
    ${[['Relatório Mensal — Maio','PDF · 2.3MB'],['Análise Orçamentária Q2','Excel · 1.1MB'],['KPIs de Qualidade','PDF · 890KB']].map(([l,m]) =>
      `<div class="da-witem" style="cursor:pointer" onmouseenter="this.style.background='rgba(255,255,255,.04)'" onmouseleave="this.style.background=''" >
        <span style="font-size:.9rem">📊</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.78rem;color:#e2e8f0;font-weight:500">${l}</div>
          <div style="font-size:.65rem;color:#64748b">${m}</div>
        </div>
        <span style="font-size:.7rem;color:${p.cor}">↓</span>
      </div>`).join('')}
  </div>`;
}

// ── Insights DISC ─────────────────────────────────────────────

function _insightDISC(letra) {
  const insights = {
    D:'Você age rápido e gosta de resultados tangíveis. Canal sua energia para projetos estratégicos de alto impacto.',
    I:'Sua influência positiva energiza a equipe. Use isso para construir pontes e facilitar colaborações difíceis.',
    S:'Sua estabilidade é âncora para a equipe em momentos de pressão. Você cria segurança psicológica naturalmente.',
    C:'Sua precisão e análise sistemática elevam a qualidade de tudo que toca. Seja o guardião dos padrões.',
  };
  return insights[letra] || insights.S;
}

// ── Engine de mudança de perfil ───────────────────────────────

const DASHEngine = {
  mudarPerfil(letra) {
    DISCEngine.salvarPerfil(letra);
    renderDashboardAdaptativo();
  },
};

window.DASHEngine = DASHEngine;
