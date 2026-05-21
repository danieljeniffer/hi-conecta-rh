/**
 * health-score.js — Health Score Organizacional 360°
 * hi Conecta RH · Índice composto da saúde humana da empresa
 *
 * 8 dimensões ponderadas:
 *  Felicidade | Clima | Engajamento | Energia Operacional
 *  Pressão | Saúde Emocional | Toxicidade | Estabilidade
 *
 * Exibe:
 *  - Score geral (0-100) com velocímetro animado
 *  - Score por setor (heatmap)
 *  - Score por gestor
 *  - Radar chart das 8 dimensões
 *  - Histórico de 6 meses
 *  - Recomendações IA por dimensão
 */

const HealthScoreEngine = {

  // Configuração das dimensões
  dimensoes: [
    { id:'felicidade',  label:'Felicidade',        peso:15, icone:'😊', cor:'#10b981', inverter:false },
    { id:'clima',       label:'Clima Organizacional',peso:15,icone:'🌤️', cor:'#06b6d4', inverter:false },
    { id:'engajamento', label:'Engajamento',        peso:15, icone:'⚡', cor:'#6366f1', inverter:false },
    { id:'energia',     label:'Energia Operacional',peso:10, icone:'🔋', cor:'#8b5cf6', inverter:false },
    { id:'pressao',     label:'Pressão Operacional',peso:15, icone:'⚖️', cor:'#f59e0b', inverter:true  }, // alto pressão = ruim
    { id:'saude_em',    label:'Saúde Emocional',    peso:15, icone:'🧠', cor:'#ec4899', inverter:false },
    { id:'toxicidade',  label:'Ausência Toxicidade', peso:10,icone:'🛡️', cor:'#14b8a6', inverter:false },
    { id:'estabilidade',label:'Estabilidade',        peso:5, icone:'⚓', cor:'#a78bfa', inverter:false },
  ],

  // Valores atuais da empresa
  atual: {
    felicidade:   73, clima: 71, engajamento: 74,
    energia:      68, pressao: 62, saude_em: 66,
    toxicidade:   78, estabilidade: 82,
  },

  // Por setor
  setores: [
    { nome:'Comercial',  felicidade:58, clima:55, engajamento:61, energia:72, pressao:81, saude_em:52, toxicidade:60, estabilidade:65 },
    { nome:'TI',         felicidade:76, clima:74, engajamento:79, energia:65, pressao:58, saude_em:71, toxicidade:82, estabilidade:79 },
    { nome:'RH',         felicidade:85, clima:88, engajamento:86, energia:71, pressao:42, saude_em:84, toxicidade:90, estabilidade:88 },
    { nome:'Financeiro', felicidade:79, clima:77, engajamento:74, energia:68, pressao:51, saude_em:76, toxicidade:84, estabilidade:82 },
    { nome:'Operações',  felicidade:65, clima:63, engajamento:67, energia:70, pressao:69, saude_em:61, toxicidade:70, estabilidade:72 },
  ],

  // Por gestor
  gestores: [
    { nome:'Mariana C.', setor:'RH',        score:88, trend:'+4', cor:'#10b981' },
    { nome:'Ana F.',      setor:'Financeiro',score:81, trend:'+2', cor:'#10b981' },
    { nome:'Gustavo R.',  setor:'TI',        score:76, trend:'-1', cor:'#6366f1' },
    { nome:'Renata V.',   setor:'Operações', score:64, trend:'-3', cor:'#f59e0b' },
    { nome:'Carlos S.',   setor:'Comercial', score:48, trend:'-7', cor:'#ef4444' },
  ],

  // Histórico 6 meses
  historico: [
    { mes:'Dez/24', score:76 },
    { mes:'Jan/25', score:74 },
    { mes:'Fev/25', score:72 },
    { mes:'Mar/25', score:73 },
    { mes:'Abr/25', score:71 },
    { mes:'Mai/25', score:72 },
  ],

  // Calcula score geral ponderado
  calcularScore(vals) {
    return Math.round(
      this.dimensoes.reduce((acc, d) => {
        const v = vals[d.id] ?? 50;
        const s = d.inverter ? (100 - v) : v;
        return acc + s * (d.peso / 100);
      }, 0)
    );
  },
};

// ── Render ────────────────────────────────────────────────────

function renderHealthScore() {
  const pc = document.getElementById('pageContainer');
  if (!pc) return;

  const E    = HealthScoreEngine;
  const score= E.calcularScore(E.atual);
  const cor  = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';
  const nivel= score >= 75 ? 'Saudável' : score >= 55 ? 'Atenção' : 'Crítico';

  // Scores por setor
  const setorScores = E.setores.map(s => ({ ...s, score: E.calcularScore(s) }))
    .sort((a, b) => b.score - a.score);

  pc.innerHTML = `
<div class="hs-root">

  <!-- Header -->
  <div class="hs-header">
    <div>
      <h2 class="hs-title">Health Score Organizacional</h2>
      <p class="hs-sub">Índice composto de saúde humana · 8 dimensões · Atualizado em tempo real</p>
    </div>
    <div class="hs-updated">Atualizado há 3 min ·
      <button onclick="" style="color:#6366f1;background:none;border:none;cursor:pointer;font-weight:600;font-size:.78rem">Forçar atualização</button>
    </div>
  </div>

  <!-- Score geral + Dimensões + Histórico -->
  <div class="hs-main-grid">

    <!-- Score principal -->
    <div class="hs-card hs-score-card">
      <div class="hs-score-label">Score Geral da Empresa</div>
      <div class="hs-gauge-wrap">
        ${_renderGauge(score, cor)}
      </div>
      <div class="hs-score-nivel" style="color:${cor}">${nivel}</div>
      <div class="hs-score-meta">
        Meta: 80 · Benchmark setor: 73
      </div>
      <!-- Histórico mini -->
      <div class="hs-mini-hist">
        ${E.historico.map((h, i) => {
          const prev = i > 0 ? E.historico[i-1].score : h.score;
          const delta = h.score - prev;
          return `<div class="hs-hist-col">
            <div class="hs-hist-bar-wrap"><div class="hs-hist-bar" style="height:${h.score}%;background:${h.score>=75?'#10b981':h.score>=55?'#f59e0b':'#ef4444'}"></div></div>
            <div class="hs-hist-val">${h.score}</div>
            <div class="hs-hist-mes">${h.mes.split('/')[0]}</div>
            <div class="hs-hist-delta" style="color:${delta>=0?'#10b981':'#ef4444'}">${delta>=0?'+':''}${delta}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Radar / Dimensões -->
    <div class="hs-card hs-dim-card">
      <div class="hs-card-title">8 Dimensões da Saúde</div>
      ${_renderRadar()}
      <div class="hs-dims-list">
        ${E.dimensoes.map(d => {
          const v = E.atual[d.id] ?? 0;
          const efetivo = d.inverter ? (100 - v) : v;
          const corDim  = efetivo >= 70 ? '#10b981' : efetivo >= 50 ? '#f59e0b' : '#ef4444';
          return `<div class="hs-dim-row">
            <span class="hs-dim-ico">${d.icone}</span>
            <span class="hs-dim-nome">${d.label}</span>
            <div class="hs-dim-bar"><div class="hs-dim-fill" style="width:${efetivo}%;background:${d.cor}"></div></div>
            <span class="hs-dim-val" style="color:${corDim}">${efetivo}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

  </div>

  <!-- Por setor -->
  <div class="hs-card">
    <div class="hs-card-title">Health Score por Setor</div>
    <div class="hs-setor-grid">
      ${setorScores.map(s => {
        const sCor = s.score >= 75 ? '#10b981' : s.score >= 55 ? '#f59e0b' : '#ef4444';
        return `<div class="hs-setor-card">
          <div class="hs-setor-nome">${s.nome}</div>
          <div class="hs-setor-gauge">${_renderMiniGauge(s.score, sCor)}</div>
          <div class="hs-setor-detalhe">
            ${E.dimensoes.slice(0,4).map(d => {
              const vv = s[d.id] ?? 0;
              const ee = d.inverter ? (100-vv) : vv;
              return `<div class="hs-sd-item">
                <span>${d.icone}</span>
                <div class="hs-sd-bar"><div style="width:${ee}%;height:100%;background:${d.cor};border-radius:2px"></div></div>
                <span style="font-size:.65rem;color:#94a3b8;min-width:20px">${ee}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Por gestor + Recomendações -->
  <div class="hs-bottom-grid">

    <!-- Por gestor -->
    <div class="hs-card">
      <div class="hs-card-title">Health Score por Gestor</div>
      ${E.gestores.map(g => `
        <div class="hs-gestor-row">
          <div class="hs-gestor-avatar" style="background:${g.cor}22;color:${g.cor}">
            ${g.nome.split(' ').map(w=>w[0]).join('')}
          </div>
          <div class="hs-gestor-info">
            <div class="hs-gestor-nome">${g.nome}</div>
            <div class="hs-gestor-setor">${g.setor}</div>
          </div>
          <div class="hs-gestor-bar">
            <div class="hs-gestor-fill" style="width:${g.score}%;background:${g.cor}"></div>
          </div>
          <div class="hs-gestor-score" style="color:${g.cor}">${g.score}</div>
          <div class="hs-gestor-trend" style="color:${g.trend.startsWith('+')?'#10b981':'#ef4444'}">${g.trend}</div>
        </div>`).join('')}
    </div>

    <!-- Recomendações IA -->
    <div class="hs-card">
      <div class="hs-card-title">🤖 Recomendações da IA</div>
      ${_renderRecomendacoes()}
    </div>

  </div>

</div>

<style>
.hs-root{padding:0 0 2rem;max-width:1200px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}
.hs-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap}
.hs-title{font-size:1.3rem;font-weight:800;color:#f1f5f9}
.hs-sub{color:#94a3b8;font-size:.83rem;margin-top:.25rem}
.hs-updated{font-size:.75rem;color:#475569;margin-top:.25rem}
.hs-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.25rem;margin-bottom:1rem}
.hs-card-title{font-size:.82rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:1rem}
.hs-main-grid{display:grid;grid-template-columns:300px 1fr;gap:1rem;margin-bottom:1rem}
@media(max-width:900px){.hs-main-grid{grid-template-columns:1fr}}
/* Score card */
.hs-score-card{display:flex;flex-direction:column;align-items:center;gap:.5rem}
.hs-score-label{font-size:.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em}
.hs-gauge-wrap{position:relative;width:180px;height:100px}
.hs-gauge-svg{overflow:visible}
.hs-gauge-text{position:absolute;bottom:0;left:50%;transform:translateX(-50%);text-align:center}
.hs-gauge-value{font-size:2rem;font-weight:900;line-height:1}
.hs-gauge-sub{font-size:.62rem;color:#64748b;font-weight:600}
.hs-score-nivel{font-size:.9rem;font-weight:800;letter-spacing:.05em}
.hs-score-meta{font-size:.72rem;color:#475569;text-align:center}
/* Mini histórico */
.hs-mini-hist{display:flex;gap:.5rem;margin-top:.5rem;width:100%;justify-content:center}
.hs-hist-col{display:flex;flex-direction:column;align-items:center;gap:.15rem;flex:1;max-width:40px}
.hs-hist-bar-wrap{height:40px;width:100%;background:rgba(255,255,255,.05);border-radius:3px;display:flex;align-items:flex-end;overflow:hidden}
.hs-hist-bar{width:100%;border-radius:3px;transition:height .5s}
.hs-hist-val{font-size:.62rem;font-weight:700;color:#e2e8f0}
.hs-hist-mes{font-size:.58rem;color:#475569}
.hs-hist-delta{font-size:.58rem;font-weight:700}
/* Dimensões */
.hs-dim-card{display:flex;flex-direction:column;gap:1rem}
.hs-dims-list{display:flex;flex-direction:column;gap:.45rem}
.hs-dim-row{display:flex;align-items:center;gap:.6rem}
.hs-dim-ico{font-size:.85rem;width:20px;text-align:center;flex-shrink:0}
.hs-dim-nome{width:160px;font-size:.78rem;color:#94a3b8;flex-shrink:0}
.hs-dim-bar{flex:1;height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
.hs-dim-fill{height:100%;border-radius:3px;transition:width 1s}
.hs-dim-val{width:28px;text-align:right;font-size:.78rem;font-weight:700;flex-shrink:0}
/* Setor grid */
.hs-setor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.75rem}
.hs-setor-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:.875rem;display:flex;flex-direction:column;gap:.5rem}
.hs-setor-nome{font-size:.78rem;font-weight:700;color:#e2e8f0}
.hs-setor-gauge{display:flex;justify-content:center}
.hs-setor-detalhe{display:flex;flex-direction:column;gap:.25rem}
.hs-sd-item{display:flex;align-items:center;gap:.35rem;font-size:.65rem}
.hs-sd-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
/* Gestor */
.hs-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media(max-width:800px){.hs-bottom-grid{grid-template-columns:1fr}}
.hs-gestor-row{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.hs-gestor-row:last-child{border:none}
.hs-gestor-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:800;flex-shrink:0}
.hs-gestor-info{min-width:0;flex-shrink:0;width:100px}
.hs-gestor-nome{font-size:.78rem;font-weight:600;color:#e2e8f0}
.hs-gestor-setor{font-size:.68rem;color:#94a3b8}
.hs-gestor-bar{flex:1;height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
.hs-gestor-fill{height:100%;border-radius:3px;transition:width .8s}
.hs-gestor-score{width:28px;text-align:right;font-size:.82rem;font-weight:700;flex-shrink:0}
.hs-gestor-trend{width:28px;text-align:right;font-size:.72rem;font-weight:700;flex-shrink:0}
/* Recomendações */
.hs-rec{display:flex;gap:.65rem;align-items:flex-start;padding:.7rem;border-radius:10px;margin-bottom:.45rem;border:1px solid transparent;cursor:pointer;transition:.15s;font-size:.78rem;color:#94a3b8}
.hs-rec:hover{background:rgba(255,255,255,.03)}
.hs-rec--red{background:rgba(239,68,68,.04);border-color:rgba(239,68,68,.15)}
.hs-rec--yellow{background:rgba(245,158,11,.04);border-color:rgba(245,158,11,.15)}
.hs-rec--blue{background:rgba(99,102,241,.04);border-color:rgba(99,102,241,.15)}
.hs-rec strong{color:#e2e8f0;display:block;margin-bottom:.2rem}
.hs-radar-svg{display:block;margin:0 auto .5rem}
</style>
`;
}

// ── Gauge semicircular ────────────────────────────────────────

function _renderGauge(score, cor) {
  const r    = 80;
  const cx   = 90, cy = 90;
  const full = Math.PI * r;
  const dash = full * (score / 100);

  return `<svg class="hs-gauge-svg" viewBox="0 0 180 100" width="180" height="100">
    <path d="M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="12" stroke-linecap="round"/>
    <path d="M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}" fill="none" stroke="${cor}" stroke-width="12"
      stroke-dasharray="${dash} ${full}" stroke-linecap="round"
      style="transition:stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"/>
    <text x="${cx}" y="${cy-10}" text-anchor="middle" fill="${cor}" font-size="28" font-weight="900" font-family="inherit">${score}</text>
    <text x="${cx}" y="${cy+8}"  text-anchor="middle" fill="#475569" font-size="9" font-weight="700" font-family="inherit">HEALTH SCORE</text>
  </svg>`;
}

function _renderMiniGauge(score, cor) {
  const r    = 28;
  const cx   = 32, cy = 32;
  const full = Math.PI * r;
  const dash = full * (score / 100);
  return `<svg viewBox="0 0 64 38" width="64" height="38">
    <path d="M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6" stroke-linecap="round"/>
    <path d="M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}" fill="none" stroke="${cor}" stroke-width="6"
      stroke-dasharray="${dash} ${full}" stroke-linecap="round"/>
    <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="${cor}" font-size="11" font-weight="900" font-family="inherit">${score}</text>
  </svg>`;
}

// ── Radar chart (SVG octógono) ────────────────────────────────

function _renderRadar() {
  const E    = HealthScoreEngine;
  const dims = E.dimensoes;
  const N    = dims.length;
  const CX   = 100, CY = 100, R = 80;

  const angle    = i => (i * 2 * Math.PI / N) - Math.PI / 2;
  const gridPts  = (r) => dims.map((_, i) => {
    const a = angle(i);
    return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
  }).join(' ');

  const dataPts = dims.map((d, i) => {
    const v = E.atual[d.id] ?? 0;
    const e = d.inverter ? (100-v) : v;
    const r = (e / 100) * R;
    const a = angle(i);
    return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
  }).join(' ');

  const labelsPts = dims.map((d, i) => {
    const a  = angle(i);
    const lx = CX + (R + 16) * Math.cos(a);
    const ly = CY + (R + 16) * Math.sin(a);
    return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central"
      fill="#94a3b8" font-size="9" font-family="inherit">${d.icone}</text>`;
  }).join('');

  return `<svg class="hs-radar-svg" viewBox="0 0 200 200" width="180" height="180">
    ${[20,40,60,80,100].map(pct => `<polygon points="${gridPts((pct/100)*R)}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`).join('')}
    ${dims.map((_,i) => {
      const a=angle(i); return `<line x1="${CX}" y1="${CY}" x2="${CX+R*Math.cos(a)}" y2="${CY+R*Math.sin(a)}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
    }).join('')}
    <polygon points="${dataPts}" fill="rgba(99,102,241,.2)" stroke="#6366f1" stroke-width="2"/>
    ${labelsPts}
  </svg>`;
}

// ── Recomendações ─────────────────────────────────────────────

function _renderRecomendacoes() {
  const recs = [
    { cls:'red',    ico:'🔴', titulo:'Urgente — Comercial sob pressão crítica', desc:'Score 48/100. Reduzir jornada, reunião de alinhamento e 1:1 com gestor.' },
    { cls:'yellow', ico:'🟡', titulo:'Engajamento abaixo de 70% em Operações', desc:'Implementar programa de reconhecimento e flexibilização de horário.' },
    { cls:'yellow', ico:'🟡', titulo:'Pressão operacional alta (62/100)', desc:'Revisar processos de trabalho. Mapeamento de atividades desnecessárias.' },
    { cls:'blue',   ico:'🔵', titulo:'Saúde emocional pode ser reforçada', desc:'Oferecer acesso a psicólogo corporativo ou sessões de mindfulness.' },
    { cls:'blue',   ico:'✅', titulo:'RH e Financeiro — manter práticas atuais', desc:'Setores com melhor health score. Usar como benchmark interno.' },
  ];
  return recs.map(r => `
    <div class="hs-rec hs-rec--${r.cls}">
      <div style="font-size:1rem;flex-shrink:0">${r.ico}</div>
      <div><strong>${r.titulo}</strong>${r.desc}</div>
    </div>`).join('');
}
