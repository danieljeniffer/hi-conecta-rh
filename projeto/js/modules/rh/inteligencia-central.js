/**
 * inteligencia-central.js — Sistema Nervoso Corporativo
 * hi Conecta RH · Hub central de inteligência organizacional
 *
 * O painel que nenhum RH tradicional tem:
 *  - DNA Corporativo em tempo real
 *  - Motor Preditivo de Riscos Humanos
 *  - Health Score 360° da organização
 *  - Mapa de Calor de Risco por Setor
 *  - Alertas autônomos da IA
 *  - Ações sugeridas
 *  - Copiloto executivo integrado
 */

// ── Dados do sistema nervoso ──────────────────────────────────

const NervousSystem = {
  // DNA Corporativo — perfil comportamental da empresa
  dna: {
    score_geral:  79,
    dimensoes: [
      { nome: 'Cultura',       score: 82, delta: +3, cor: '#6366f1' },
      { nome: 'Liderança',     score: 71, delta: -2, cor: '#8b5cf6' },
      { nome: 'Aprendizado',   score: 88, delta: +5, cor: '#06b6d4' },
      { nome: 'Inovação',      score: 64, delta: -4, cor: '#f59e0b' },
      { nome: 'Bem-estar',     score: 75, delta: +1, cor: '#10b981' },
      { nome: 'Resultados',    score: 83, delta: +7, cor: '#ec4899' },
    ],
    narrativa: 'A empresa tem uma cultura forte de aprendizado e alta entrega de resultados. O principal ponto de atenção é inovação — equipes estão em modo operacional intenso, com pouco espaço para criatividade. Liderança intermediária requer desenvolvimento.',
  },

  // Motor Preditivo — riscos humanos em tempo real
  riscos: {
    critico:  3,
    alto:     8,
    medio:    14,
    baixo:    31,
    por_categoria: [
      { tipo: 'Burnout',        total: 6,  criticos: 2, cor: '#ef4444' },
      { tipo: 'Turnover',       total: 9,  criticos: 3, cor: '#f59e0b' },
      { tipo: 'Desmotivação',   total: 11, criticos: 1, cor: '#8b5cf6' },
      { tipo: 'Conflito',       total: 4,  criticos: 0, cor: '#06b6d4' },
      { tipo: 'Absenteísmo',    total: 7,  criticos: 1, cor: '#ec4899' },
    ],
    por_setor: [
      { nome: 'Comercial',  risco: 78, headcount: 18, criticos: 2, cor: '#ef4444' },
      { nome: 'TI',         risco: 45, headcount: 12, criticos: 1, cor: '#f59e0b' },
      { nome: 'Operações',  risco: 62, headcount: 22, criticos: 2, cor: '#f59e0b' },
      { nome: 'RH',         risco: 23, headcount:  8, criticos: 0, cor: '#10b981' },
      { nome: 'Financeiro', risco: 31, headcount: 10, criticos: 0, cor: '#10b981' },
    ],
    top_colaboradores: [
      { nome: 'Carlos E.',   setor: 'Comercial', score: 94, risco: 'critico',  tipo: 'Burnout + Turnover' },
      { nome: 'Fernanda R.', setor: 'TI',        score: 87, risco: 'critico',  tipo: 'Desmotivação' },
      { nome: 'Diego N.',    setor: 'Comercial', score: 81, risco: 'critico',  tipo: 'Turnover' },
      { nome: 'Renata V.',   setor: 'Operações', score: 75, risco: 'alto',     tipo: 'Absenteísmo' },
      { nome: 'Thiago M.',   setor: 'TI',        score: 71, risco: 'alto',     tipo: 'Burnout' },
    ],
  },

  // Alertas autônomos da IA
  alertas: [
    { id: 1, prioridade: 'critica', icone: '🔴', titulo: 'Risco crítico de desligamento detectado', desc: 'Carlos Eduardo Souza (Comercial) — 94% probabilidade de saída em 30 dias. 8 meses sem promoção + aumento de faltas.', acao: 'Ver perfil', ts: '2min' },
    { id: 2, prioridade: 'critica', icone: '🔴', titulo: 'Burnout iminente — equipe Comercial', desc: 'Média de 51h/semana nas últimas 3 semanas. 3 colaboradores com sinais clínicos de esgotamento.', acao: 'Análise completa', ts: '15min' },
    { id: 3, prioridade: 'alta',    icone: '🟡', titulo: 'Turnover pode atingir 8% em Junho', desc: 'Tendência calculada com 91% de confiança com base nos dados dos últimos 90 dias.', acao: 'Ver previsão', ts: '1h' },
    { id: 4, prioridade: 'alta',    icone: '🟡', titulo: 'Gestor Carlos Souza — padrão tóxico detectado', desc: 'Taxa de turnover na equipe: 7.1% — 3.5× acima da média. 4 saídas nos últimos 6 meses citam "gestão" como motivo.', acao: 'Plano de ação', ts: '3h' },
    { id: 5, prioridade: 'media',   icone: '🔵', titulo: '12 férias vencendo em Julho', desc: 'Ação necessária até 15/06. Risco trabalhista se não agendadas.', acao: 'Gestão de férias', ts: '6h' },
  ],

  // Ações sugeridas pela IA
  acoes: [
    { prioridade: 'urgente', label: 'Conversa 1:1 com Carlos Eduardo', tipo: 'retenção',    impacto: 94 },
    { prioridade: 'urgente', label: 'Reduzir jornada equipe Comercial',  tipo: 'bem-estar',  impacto: 88 },
    { prioridade: 'alta',    label: 'PDI — Fernanda Rodrigues (TI)',      tipo: 'pdi',        impacto: 73 },
    { prioridade: 'alta',    label: 'Programa anti-burnout em Operações', tipo: 'saude',      impacto: 71 },
    { prioridade: 'media',   label: 'Treinamento de liderança — Gestores',tipo: 'liderança',  impacto: 65 },
  ],

  // Métricas executivas
  metricas: {
    headcount:     70,
    engajamento:   74,
    turnover_mes:  4.2,
    nps_interno:   42,
    produtividade: 81,
    clima:         73,
    retencao:      89,
    meses_sem_prom:8.4,
  },
};

// ── Render principal ──────────────────────────────────────────

function renderInteligenciaCentral() {
  const pc = document.getElementById('pageContainer');
  if (!pc) return;

  pc.innerHTML = `
<div class="ic-root">

  <!-- Hero Header -->
  <div class="ic-hero">
    <div class="ic-hero-left">
      <div class="ic-hero-badge">
        <span class="ic-pulse"></span>
        Sistema Nervoso Corporativo — Online
      </div>
      <h1 class="ic-hero-title">Inteligência Central</h1>
      <p class="ic-hero-sub">Sua empresa em tempo real. 70 colaboradores · 5 setores · Atualizado há 2 min</p>
    </div>
    <div class="ic-hero-right">
      <div class="ic-score-ring" data-score="79" id="dna-ring">
        <svg viewBox="0 0 120 120" class="ic-ring-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,102,241,.12)" stroke-width="10"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ic-grad)" stroke-width="10"
            stroke-dasharray="${2*Math.PI*50}" stroke-dashoffset="${2*Math.PI*50*(1-0.79)}"
            stroke-linecap="round" transform="rotate(-90 60 60)"/>
          <defs>
            <linearGradient id="ic-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="ic-ring-center">
          <div class="ic-ring-value">79</div>
          <div class="ic-ring-label">DNA Score</div>
        </div>
      </div>
    </div>
  </div>

  <!-- KPIs executivos -->
  <div class="ic-kpis">
    ${_renderKPIs()}
  </div>

  <!-- Grade principal -->
  <div class="ic-grid">

    <!-- Coluna 1: Alertas IA + Ações -->
    <div class="ic-col">

      <!-- Alertas autônomos -->
      <div class="ic-card ic-card--alerts">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">🧠</span>
            Alertas Autônomos da IA
          </div>
          <div class="ic-live-dot"></div>
        </div>
        <div class="ic-alerts-list" id="ic-alerts">
          ${_renderAlertas()}
        </div>
      </div>

      <!-- Ações sugeridas -->
      <div class="ic-card">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">⚡</span>
            Ações Recomendadas pela IA
          </div>
          <span class="ic-badge">5 ações</span>
        </div>
        ${_renderAcoes()}
      </div>

    </div>

    <!-- Coluna 2: Motor Preditivo -->
    <div class="ic-col">

      <!-- Mapa de risco por setor -->
      <div class="ic-card">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">⚠️</span>
            Mapa de Risco por Setor
          </div>
          <span class="ic-badge ic-badge--red">${NervousSystem.riscos.critico} críticos</span>
        </div>
        ${_renderMapaRisco()}
      </div>

      <!-- Top colaboradores em risco -->
      <div class="ic-card">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">🎯</span>
            Indivíduos em Risco Máximo
          </div>
        </div>
        ${_renderTopRiscos()}
      </div>

    </div>

    <!-- Coluna 3: DNA + Riscos por categoria -->
    <div class="ic-col">

      <!-- DNA Corporativo -->
      <div class="ic-card">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">🧬</span>
            DNA Corporativo
          </div>
          <button class="ic-btn-sm" onclick="navigateTo('analytics')">Detalhe ↗</button>
        </div>
        ${_renderDNA()}
        <div class="ic-dna-narrativa">${NervousSystem.dna.narrativa}</div>
      </div>

      <!-- Distribuição de riscos -->
      <div class="ic-card">
        <div class="ic-card-header">
          <div class="ic-card-title">
            <span class="ic-card-icon">📊</span>
            Distribuição de Riscos
          </div>
        </div>
        ${_renderRiscoCategoria()}
      </div>

    </div>
  </div>

  <!-- Consulta rápida à IA -->
  <div class="ic-card ic-card--copilot">
    <div class="ic-card-header">
      <div class="ic-card-title">
        <span class="ic-card-icon">🤖</span>
        Consulta Rápida — IA Executiva
      </div>
      <button class="ic-btn-sm" onclick="navigateTo('copiloto-ia')">Abrir copiloto completo ↗</button>
    </div>
    <div class="ic-copilot-shortcuts">
      ${['Quais setores têm maior risco humano?','Quem está próximo de pedir demissão?','Gestores com maior turnover na equipe','Talentos com potencial de promoção','Previsão de turnover para próximo mês'].map(q =>
        `<button class="ic-chip" onclick="_icPerguntar(this)">${q}</button>`
      ).join('')}
    </div>
    <div class="ic-copilot-box">
      <input type="text" id="ic-pergunta" class="ic-copilot-input" placeholder="Faça uma pergunta sobre sua empresa..." />
      <button class="ic-copilot-send" onclick="_icConsultar()">→</button>
    </div>
    <div id="ic-resposta" class="ic-copilot-response"></div>
  </div>

</div>

<style>
/* ── Intelligence Central CSS ── */
.ic-root{padding:0 0 2rem;max-width:1400px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}

/* Hero */
.ic-hero{background:linear-gradient(135deg,rgba(99,102,241,.08) 0%,rgba(139,92,246,.05) 50%,transparent);
  border:1px solid rgba(99,102,241,.15);border-radius:20px;padding:2rem;
  display:flex;align-items:center;justify-content:space-between;gap:2rem;margin-bottom:1.5rem;
  position:relative;overflow:hidden;}
.ic-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;
  background:radial-gradient(circle,rgba(99,102,241,.15),transparent);pointer-events:none}
.ic-hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.3rem .8rem;border-radius:999px;
  background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);
  color:#6ee7b7;font-size:.75rem;font-weight:700;margin-bottom:.75rem}
.ic-pulse{width:8px;height:8px;border-radius:50%;background:#10b981;
  animation:pulse 1.5s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.ic-hero-title{font-size:2rem;font-weight:800;color:#f8fafc;line-height:1.1;margin-bottom:.4rem}
.ic-hero-sub{color:#94a3b8;font-size:.88rem}

/* Ring DNA */
.ic-score-ring{position:relative;width:110px;height:110px;flex-shrink:0}
.ic-ring-svg{width:100%;height:100%;transform:none}
.ic-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ic-ring-value{font-size:1.6rem;font-weight:800;color:#a5b4fc;line-height:1}
.ic-ring-label{font-size:.6rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em}

/* KPIs */
.ic-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem}
.ic-kpi{background:rgba(15,23,42,.8);border:1px solid rgba(255,255,255,.07);border-radius:14px;
  padding:1rem;display:flex;flex-direction:column;gap:.3rem;transition:.2s}
.ic-kpi:hover{border-color:rgba(99,102,241,.3);transform:translateY(-2px)}
.ic-kpi-value{font-size:1.7rem;font-weight:800;color:#f1f5f9;line-height:1}
.ic-kpi-label{font-size:.7rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.ic-kpi-delta{font-size:.72rem;font-weight:600}
.ic-kpi-delta.up{color:#10b981}.ic-kpi-delta.down{color:#ef4444}.ic-kpi-delta.neutral{color:#94a3b8}

/* Grid */
.ic-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem}
@media(max-width:1100px){.ic-grid{grid-template-columns:1fr 1fr}}
@media(max-width:700px){.ic-grid{grid-template-columns:1fr}}

/* Card */
.ic-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;
  padding:1.25rem;display:flex;flex-direction:column;gap:.875rem}
.ic-card--alerts{border-color:rgba(239,68,68,.15)}
.ic-card--copilot{border-color:rgba(99,102,241,.2);background:rgba(10,10,30,.9)}
.ic-col{display:flex;flex-direction:column;gap:1rem}
.ic-card-header{display:flex;align-items:center;justify-content:space-between}
.ic-card-title{display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:700;color:#e2e8f0}
.ic-card-icon{font-size:1rem}
.ic-badge{padding:.15rem .5rem;border-radius:999px;font-size:.68rem;font-weight:700;
  background:rgba(99,102,241,.15);color:#a5b4fc}
.ic-badge--red{background:rgba(239,68,68,.15);color:#f87171}
.ic-live-dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 2s infinite}
.ic-btn-sm{padding:.25rem .65rem;border-radius:6px;border:1px solid rgba(99,102,241,.3);
  background:none;color:#818cf8;font-size:.72rem;font-weight:600;cursor:pointer;transition:.15s}
.ic-btn-sm:hover{background:rgba(99,102,241,.15)}

/* Alertas */
.ic-alert-item{display:flex;gap:.75rem;align-items:flex-start;padding:.75rem;border-radius:10px;
  border-left:3px solid;margin-bottom:.4rem;background:rgba(255,255,255,.02);transition:.15s;cursor:pointer}
.ic-alert-item:hover{background:rgba(255,255,255,.04)}
.ic-alert-item.critica{border-color:#ef4444}
.ic-alert-item.alta{border-color:#f59e0b}
.ic-alert-item.media{border-color:#6366f1}
.ic-alert-icon{font-size:1rem;flex-shrink:0;margin-top:.1rem}
.ic-alert-titulo{font-size:.8rem;font-weight:700;color:#e2e8f0;margin-bottom:.2rem}
.ic-alert-desc{font-size:.72rem;color:#94a3b8;line-height:1.4}
.ic-alert-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.35rem}
.ic-alert-ts{font-size:.65rem;color:#475569}
.ic-alert-acao{font-size:.68rem;color:#818cf8;font-weight:600;padding:.15rem .45rem;
  border-radius:4px;border:1px solid rgba(99,102,241,.2);background:rgba(99,102,241,.08);cursor:pointer}

/* Ações */
.ic-acao-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;border-radius:10px;
  background:rgba(255,255,255,.02);margin-bottom:.35rem;border:1px solid transparent;cursor:pointer;transition:.15s}
.ic-acao-item:hover{background:rgba(255,255,255,.04);border-color:rgba(99,102,241,.2)}
.ic-acao-prio{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ic-acao-prio.urgente{background:#ef4444}.ic-acao-prio.alta{background:#f59e0b}.ic-acao-prio.media{background:#6366f1}
.ic-acao-label{flex:1;font-size:.8rem;color:#e2e8f0;font-weight:500}
.ic-acao-bar{width:60px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}
.ic-acao-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#6366f1,#8b5cf6)}
.ic-acao-num{font-size:.68rem;color:#818cf8;font-weight:700;min-width:28px;text-align:right}

/* Mapa de risco */
.ic-risco-row{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.ic-risco-row:last-child{border:none}
.ic-risco-nome{width:90px;font-size:.8rem;color:#e2e8f0;font-weight:600;flex-shrink:0}
.ic-risco-bar{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden}
.ic-risco-fill{height:100%;border-radius:4px;transition:width 1s}
.ic-risco-score{width:30px;text-align:right;font-size:.78rem;font-weight:700;flex-shrink:0}
.ic-risco-count{font-size:.68rem;color:#475569;width:50px;text-align:right;flex-shrink:0}

/* Top riscos */
.ic-risco-pessoa{display:flex;align-items:center;gap:.65rem;padding:.6rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.ic-risco-pessoa:last-child{border:none}
.ic-risco-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;flex-shrink:0}
.ic-risco-pinfo{flex:1;min-width:0}
.ic-risco-pnome{font-size:.8rem;font-weight:600;color:#e2e8f0}
.ic-risco-ptipo{font-size:.68rem;color:#94a3b8}
.ic-risco-pill{padding:.15rem .5rem;border-radius:999px;font-size:.65rem;font-weight:700;flex-shrink:0}
.ic-risco-pill.critico{background:rgba(239,68,68,.15);color:#f87171}
.ic-risco-pill.alto{background:rgba(245,158,11,.15);color:#fbbf24}

/* DNA */
.ic-dna-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.ic-dna-dim{display:flex;align-items:center;gap:.6rem;padding:.4rem}
.ic-dna-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ic-dna-info{flex:1;min-width:0}
.ic-dna-nome{font-size:.72rem;color:#94a3b8;margin-bottom:.2rem}
.ic-dna-bar{height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}
.ic-dna-fill{height:100%;border-radius:2px}
.ic-dna-val{font-size:.72rem;font-weight:700;color:#e2e8f0;min-width:26px;text-align:right}
.ic-dna-delta{font-size:.62rem;font-weight:700;min-width:24px;text-align:right}
.ic-dna-delta.pos{color:#10b981}.ic-dna-delta.neg{color:#ef4444}
.ic-dna-narrativa{font-size:.78rem;color:#94a3b8;line-height:1.6;padding:.75rem;
  background:rgba(99,102,241,.05);border-radius:8px;border-left:3px solid rgba(99,102,241,.3)}

/* Riscos por categoria */
.ic-cat-item{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.ic-cat-item:last-child{border:none}
.ic-cat-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.ic-cat-nome{flex:1;font-size:.8rem;color:#e2e8f0}
.ic-cat-bar{width:80px;height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}
.ic-cat-fill{height:100%;border-radius:3px;opacity:.7}
.ic-cat-stats{text-align:right;min-width:60px}
.ic-cat-total{font-size:.78rem;font-weight:700;color:#e2e8f0}
.ic-cat-crit{font-size:.65rem;color:#ef4444;font-weight:600}

/* Copiloto */
.ic-copilot-shortcuts{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}
.ic-chip{padding:.35rem .7rem;border-radius:999px;border:1px solid rgba(99,102,241,.2);
  background:rgba(99,102,241,.06);color:#a5b4fc;font-size:.75rem;cursor:pointer;transition:.15s;font-family:inherit}
.ic-chip:hover{background:rgba(99,102,241,.2);border-color:rgba(99,102,241,.4)}
.ic-copilot-box{display:flex;gap:.5rem;align-items:center}
.ic-copilot-input{flex:1;padding:.65rem 1rem;border-radius:10px;border:1px solid rgba(99,102,241,.2);
  background:rgba(99,102,241,.05);color:#e2e8f0;font-size:.85rem;font-family:inherit;outline:none;transition:.2s}
.ic-copilot-input:focus{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.08)}
.ic-copilot-input::placeholder{color:#475569}
.ic-copilot-send{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  border:none;color:#fff;font-size:1.1rem;cursor:pointer;transition:.15s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ic-copilot-send:hover{transform:scale(1.05)}
.ic-copilot-response{margin-top:.75rem;padding:.875rem 1rem;border-radius:10px;
  background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);
  font-size:.82rem;color:#e2e8f0;line-height:1.7;display:none}
.ic-copilot-response.visible{display:block}
.ic-typing{display:inline-flex;gap:3px;align-items:center}
.ic-typing span{width:5px;height:5px;border-radius:50%;background:#6366f1;animation:icType .8s infinite}
.ic-typing span:nth-child(2){animation-delay:.15s}
.ic-typing span:nth-child(3){animation-delay:.3s}
@keyframes icType{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
</style>
`;
}

// ── Renderers ─────────────────────────────────────────────────

function _renderKPIs() {
  const m = NervousSystem.metricas;
  const kpis = [
    { value: m.headcount,     label: 'Headcount',       delta: '+3',    dir: 'up',      suffix: '' },
    { value: m.engajamento+'%', label: 'Engajamento',   delta: '+2%',   dir: 'up',      suffix: '' },
    { value: m.turnover_mes+'%', label: 'Turnover/mês',  delta: '-0.3%', dir: 'up',     suffix: '' },
    { value: m.nps_interno,   label: 'eNPS Interno',    delta: '+5',    dir: 'up',      suffix: '' },
    { value: m.produtividade+'%', label: 'Produtividade', delta: '-3%', dir: 'down',    suffix: '' },
    { value: m.clima+'%',     label: 'Clima',            delta: '+1%',  dir: 'up',      suffix: '' },
    { value: m.retencao+'%',  label: 'Retenção',         delta: '+0.5%',dir: 'up',      suffix: '' },
    { value: m.meses_sem_prom+'m',label:'Sem promoção avg',delta: '+1m',dir: 'down',    suffix: '' },
  ];
  return kpis.map(k => `
    <div class="ic-kpi">
      <div class="ic-kpi-value">${k.value}</div>
      <div class="ic-kpi-label">${k.label}</div>
      <div class="ic-kpi-delta ${k.dir}">${k.dir === 'up' ? '↑' : '↓'} ${k.delta}</div>
    </div>`).join('');
}

function _renderAlertas() {
  return NervousSystem.alertas.map(a => `
    <div class="ic-alert-item ${a.prioridade}">
      <div class="ic-alert-icon">${a.icone}</div>
      <div style="flex:1;min-width:0">
        <div class="ic-alert-titulo">${a.titulo}</div>
        <div class="ic-alert-desc">${a.desc}</div>
        <div class="ic-alert-footer">
          <span class="ic-alert-ts">${a.ts} atrás</span>
          <button class="ic-alert-acao">${a.acao}</button>
        </div>
      </div>
    </div>`).join('');
}

function _renderAcoes() {
  return NervousSystem.acoes.map(a => `
    <div class="ic-acao-item">
      <div class="ic-acao-prio ${a.prioridade}"></div>
      <div class="ic-acao-label">${a.label}</div>
      <div class="ic-acao-bar"><div class="ic-acao-fill" style="width:${a.impacto}%"></div></div>
      <div class="ic-acao-num">${a.impacto}</div>
    </div>`).join('');
}

function _renderMapaRisco() {
  const maxRisco = Math.max(...NervousSystem.riscos.por_setor.map(s => s.risco));
  return NervousSystem.riscos.por_setor.map(s => `
    <div class="ic-risco-row">
      <div class="ic-risco-nome">${s.nome}</div>
      <div class="ic-risco-bar">
        <div class="ic-risco-fill" style="width:${s.risco/maxRisco*100}%;background:${s.cor}"></div>
      </div>
      <div class="ic-risco-score" style="color:${s.cor}">${s.risco}</div>
      <div class="ic-risco-count">${s.headcount} colab.</div>
    </div>`).join('');
}

function _renderTopRiscos() {
  return NervousSystem.riscos.top_colaboradores.map(c => `
    <div class="ic-risco-pessoa">
      <div class="ic-risco-avatar">${c.nome.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
      <div class="ic-risco-pinfo">
        <div class="ic-risco-pnome">${c.nome} · ${c.setor}</div>
        <div class="ic-risco-ptipo">${c.tipo}</div>
      </div>
      <span class="ic-risco-pill ${c.risco}">${c.risco} · ${c.score}</span>
    </div>`).join('');
}

function _renderDNA() {
  return `<div class="ic-dna-grid">${NervousSystem.dna.dimensoes.map(d => `
    <div class="ic-dna-dim">
      <div class="ic-dna-dot" style="background:${d.cor}"></div>
      <div class="ic-dna-info">
        <div class="ic-dna-nome">${d.nome}</div>
        <div class="ic-dna-bar"><div class="ic-dna-fill" style="width:${d.score}%;background:${d.cor}"></div></div>
      </div>
      <div class="ic-dna-val">${d.score}</div>
      <div class="ic-dna-delta ${d.delta >= 0 ? 'pos' : 'neg'}">${d.delta >= 0 ? '+' : ''}${d.delta}</div>
    </div>`).join('')}</div>`;
}

function _renderRiscoCategoria() {
  const max = Math.max(...NervousSystem.riscos.por_categoria.map(c => c.total));
  return NervousSystem.riscos.por_categoria.map(c => `
    <div class="ic-cat-item">
      <div class="ic-cat-dot" style="background:${c.cor}"></div>
      <div class="ic-cat-nome">${c.tipo}</div>
      <div class="ic-cat-bar"><div class="ic-cat-fill" style="width:${c.total/max*100}%;background:${c.cor}"></div></div>
      <div class="ic-cat-stats">
        <div class="ic-cat-total">${c.total}</div>
        ${c.criticos ? `<div class="ic-cat-crit">${c.criticos} crítico${c.criticos>1?'s':''}</div>` : ''}
      </div>
    </div>`).join('');
}

// ── Copiloto IA rápido ────────────────────────────────────────

function _icPerguntar(btn) {
  const inp = document.getElementById('ic-pergunta');
  if (inp) inp.value = btn.textContent;
  _icConsultar();
}

async function _icConsultar() {
  const inp = document.getElementById('ic-pergunta');
  const resp= document.getElementById('ic-resposta');
  if (!inp || !resp) return;
  const pergunta = inp.value.trim();
  if (!pergunta) return;

  resp.className = 'ic-copilot-response visible';
  resp.innerHTML = '<div class="ic-typing"><span></span><span></span><span></span></div> Analisando os dados da empresa...';

  // Tenta API real; fallback para respostas inteligentes locais
  try {
    const token = window.Api?.hasToken?.() && window.Api;
    if (token) {
      const data = await Api.post('/api/v1/inteligencia/ia/consultar/', { pergunta, categoria: 'estrategia' });
      if (data.sucesso) {
        resp.innerHTML = _formatarResposta(data.resposta);
        inp.value = '';
        return;
      }
    }
  } catch { /* fallback */ }

  // Respostas inteligentes locais baseadas na pergunta
  setTimeout(() => {
    resp.innerHTML = _respostaLocal(pergunta);
    inp.value = '';
  }, 1200);
}

function _respostaLocal(pergunta) {
  const p = pergunta.toLowerCase();
  if (p.includes('risco') || p.includes('setor')) {
    return '🎯 <strong>Análise de risco por setor:</strong> O setor Comercial apresenta o maior risco humano (78/100) com 2 colaboradores em situação crítica. Operações está em segundo lugar (62/100). Recomendo ação imediata no Comercial: reunião de equipe + análise de carga de trabalho.';
  }
  if (p.includes('demiss') || p.includes('saída') || p.includes('saida')) {
    return '⚠️ <strong>Risco de desligamento:</strong> 3 colaboradores estão com probabilidade >85%: Carlos Eduardo (Comercial, 94%), Fernanda Rodrigues (TI, 87%), Diego Nunes (Comercial, 81%). Todos compartilham o padrão: sem promoção há >8 meses + aumento de absenteísmo recente.';
  }
  if (p.includes('gestor') || p.includes('turnover')) {
    return '📊 <strong>Gestores com maior impacto no turnover:</strong> Carlos Souza (Comercial) lidera com 7.1% de turnover na equipe — 3.5× a média da empresa. Saídas nos últimos 6 meses citaram "estilo de gestão" como fator. Recomendo: coaching de liderança + avaliação 360°.';
  }
  if (p.includes('talent') || p.includes('promoção') || p.includes('promocao')) {
    return '🌟 <strong>Talentos com potencial de promoção:</strong> Ana Lima Ferreira (Financeiro) — desempenho 9.1/10, 3 anos na empresa, zero ocorrências. Thiago Machado (TI) — entregas acima da meta por 5 meses consecutivos. Juliana Costa (Operações) — score de liderança 88%.';
  }
  if (p.includes('previs') || p.includes('próximo') || p.includes('proximo')) {
    return '📈 <strong>Previsão para próximo mês:</strong> Com base nos dados atuais, o turnover em Junho deverá atingir 5.8-7.2% se não houver intervenção no Comercial. O absenteísmo deve aumentar 1.2 pontos. Recomendo plano de retenção de emergência para os 3 colaboradores críticos.';
  }
  return `🤖 <strong>Análise realizada:</strong> Com base nos dados de ${NervousSystem.metricas.headcount} colaboradores e ${Object.keys(NervousSystem.riscos.por_setor).length} setores, a empresa apresenta Health Score de 74/100. Os principais pontos de atenção são: pressão excessiva no Comercial, pipeline de liderança fraco no médio prazo e necessidade de ações de retenção nos próximos 30 dias.`;
}

function _formatarResposta(texto) {
  return texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
