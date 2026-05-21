/**
 * mapa-energia.js — Mapa de Energia Organizacional
 * hi Conecta RH · Human Experience Operating System
 *
 * Monitor em tempo real do estado humano da empresa:
 *  - Pulse monitor animado (batimento cardíaco corporativo)
 *  - Heatmap de energia/estresse por setor
 *  - Temperatura organizacional
 *  - Burnout risk por equipe
 *  - Felicidade corporativa (live feed)
 *  - Energia vs. Pressão (scatter interativo)
 */

// ── Dados do mapa de energia ──────────────────────────────────

const EnergiaDB = {
  // Estado atual (seria atualizado via WebSocket/polling em produção)
  snapshot: {
    timestamp:   new Date().toISOString(),
    energia_geral: 68,
    estresse_geral:52,
    felicidade:   73,
    motivacao:    71,
    exaustao:     41,
    toxicidade:   18,
  },

  setores: [
    {
      nome: 'Comercial', headcount: 18,
      energia:   45, estresse: 78, felicidade: 54, motivacao: 61,
      burnout_risk: 'critico', produtividade: 72,
      pulse: [55,48,52,44,41,38,44,42,48,45,43,41], // últimas 12h
      emoji: '🔴',
    },
    {
      nome: 'Operações', headcount: 22,
      energia:   58, estresse: 64, felicidade: 62, motivacao: 65,
      burnout_risk: 'alto', produtividade: 78,
      pulse: [65,62,58,61,59,62,58,60,62,58,61,63],
      emoji: '🟡',
    },
    {
      nome: 'TI', headcount: 12,
      energia:   72, estresse: 48, felicidade: 76, motivacao: 79,
      burnout_risk: 'medio', produtividade: 88,
      pulse: [74,72,76,71,73,75,72,74,76,72,71,74],
      emoji: '🟢',
    },
    {
      nome: 'Financeiro', headcount: 10,
      energia:   79, estresse: 38, felicidade: 81, motivacao: 82,
      burnout_risk: 'baixo', produtividade: 91,
      pulse: [82,79,81,80,79,82,80,81,83,79,81,82],
      emoji: '🟢',
    },
    {
      nome: 'RH', headcount: 8,
      energia:   84, estresse: 32, felicidade: 88, motivacao: 85,
      burnout_risk: 'baixo', produtividade: 89,
      pulse: [86,84,87,85,84,86,85,84,87,84,86,85],
      emoji: '💚',
    },
  ],

  // Eventos live (seria streaming em produção)
  eventos_live: [
    { ts:'agora',  tipo:'alerta',  msg:'Comercial: pico de pressão detectado — 3a semana consecutiva' },
    { ts:'2min',   tipo:'positivo',msg:'RH: engajamento subiu 4% após nova política de home office' },
    { ts:'8min',   tipo:'alerta',  msg:'Operações: 2 colaboradores com sinal de exaustão alta' },
    { ts:'15min',  tipo:'info',    msg:'Empresa: 73% dos colaboradores relatam humor positivo hoje' },
    { ts:'22min',  tipo:'positivo',msg:'TI: menor taxa de absenteísmo do trimestre — 0.8%' },
    { ts:'1h',     tipo:'alerta',  msg:'Comercial: Carlos Souza com 54h na semana — atenção!' },
  ],
};

// ── Render principal ──────────────────────────────────────────

function renderMapaEnergia() {
  const pc = document.getElementById('pageContainer');
  if (!pc) return;

  const E = EnergiaDB;

  pc.innerHTML = `
<div class="me-root">

  <!-- Header -->
  <div class="me-header">
    <div>
      <h2 class="me-title">
        <span class="me-pulse-dot"></span>
        Mapa de Energia Organizacional
      </h2>
      <p class="me-sub">Monitor em tempo real do estado humano da empresa · ${E.setores.reduce((a,s)=>a+s.headcount,0)} colaboradores</p>
    </div>
    <div class="me-time" id="me-clock">${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
  </div>

  <!-- Vitais da empresa (EKG corporativo) -->
  <div class="me-vitals">
    ${_renderVital('❤️','Energia Geral',  E.snapshot.energia_geral,  '#10b981', 'Boa')}
    ${_renderVital('⚡','Estresse Médio', E.snapshot.estresse_geral, '#f59e0b', 'Moderado')}
    ${_renderVital('😊','Felicidade',     E.snapshot.felicidade,     '#06b6d4', 'Alta')}
    ${_renderVital('🔥','Motivação',      E.snapshot.motivacao,      '#8b5cf6', 'Boa')}
    ${_renderVital('🫀','Exaustão',       E.snapshot.exaustao,       '#ef4444', 'Baixa')}
    ${_renderVital('🛡️','Toxicidade',     E.snapshot.toxicidade,     '#a78bfa', 'Baixa')}
  </div>

  <!-- Pulse monitor animado (EKG corporativo) -->
  <div class="me-card me-ekg-card">
    <div class="me-card-header">
      <div class="me-card-title">
        <span class="me-live-dot"></span>
        Pulse Monitor Corporativo — Últimas 12h
      </div>
      <select class="me-select" id="me-setor-sel" onchange="MEEngine.trocarSetor(this.value)">
        <option value="">Empresa toda</option>
        ${E.setores.map(s => `<option value="${s.nome}">${s.nome}</option>`).join('')}
      </select>
    </div>
    <div class="me-ekg-wrap">
      <canvas id="me-ekg" width="900" height="80" class="me-ekg-canvas"></canvas>
    </div>
    <div class="me-ekg-labels">
      ${['12h','13h','14h','15h','16h','17h','18h','19h','20h','21h','22h','23h'].map(h =>
        `<span>${h}</span>`).join('')}
    </div>
  </div>

  <!-- Heatmap de setores -->
  <div class="me-grid">

    <!-- Heatmap principal -->
    <div class="me-card me-heatmap-card">
      <div class="me-card-header">
        <div class="me-card-title">⚡ Heatmap de Energia & Estresse</div>
        <div class="me-heatmap-legend">
          <span class="me-leg" style="background:#10b981"></span>Alta energia
          <span class="me-leg" style="background:#f59e0b"></span>Moderado
          <span class="me-leg" style="background:#ef4444"></span>Crítico
        </div>
      </div>
      <div class="me-heatmap">
        ${E.setores.map(s => _renderHeatCell(s)).join('')}
      </div>
    </div>

    <!-- Live feed -->
    <div class="me-card me-feed-card">
      <div class="me-card-header">
        <div class="me-card-title">
          <span class="me-live-dot"></span>
          Feed em Tempo Real
        </div>
      </div>
      <div class="me-feed" id="me-feed">
        ${E.eventos_live.map(e => _renderFeedItem(e)).join('')}
      </div>
    </div>

  </div>

  <!-- Detalhamento por setor -->
  <div class="me-card">
    <div class="me-card-header">
      <div class="me-card-title">🏢 Estado Detalhado por Setor</div>
    </div>
    <div class="me-setores-table">
      <div class="me-table-header">
        <span>Setor</span>
        <span>Energia</span>
        <span>Estresse</span>
        <span>Felicidade</span>
        <span>Burnout Risk</span>
        <span>Produtividade</span>
      </div>
      ${E.setores.map(s => _renderSetorRow(s)).join('')}
    </div>
  </div>

  <!-- Temperatura humanizada (gauge central) -->
  <div class="me-temp-card">
    <div class="me-temp-title">🌡️ Temperatura Humana da Empresa</div>
    <div class="me-temp-gauge">
      ${_renderTermometro(68)}
    </div>
    <div class="me-temp-desc">
      <strong style="color:#f59e0b">Morna</strong> — A empresa está operando com pressão moderada.
      Setores como Comercial precisam de atenção urgente. Os demais setores apresentam saúde positiva.
    </div>
  </div>

</div>

<style>
.me-root{padding:0 0 2rem;max-width:1300px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}
/* Header */
.me-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap}
.me-title{font-size:1.3rem;font-weight:800;color:#f1f5f9;display:flex;align-items:center;gap:.65rem}
.me-sub{color:#94a3b8;font-size:.83rem;margin-top:.25rem}
.me-time{font-size:1.5rem;font-weight:900;color:#475569;font-variant-numeric:tabular-nums}
/* Pulse dot animado */
.me-pulse-dot{width:12px;height:12px;border-radius:50%;background:#10b981;flex-shrink:0;
  box-shadow:0 0 0 0 rgba(16,185,129,.4);animation:mePulse 2s infinite}
@keyframes mePulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
.me-live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block;animation:mePulse 1.5s infinite}
/* Vitais */
.me-vitals{display:grid;grid-template-columns:repeat(6,1fr);gap:.75rem;margin-bottom:1.25rem}
@media(max-width:900px){.me-vitals{grid-template-columns:repeat(3,1fr)}}
@media(max-width:600px){.me-vitals{grid-template-columns:repeat(2,1fr)}}
.me-vital{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:14px;
  padding:.875rem;text-align:center;position:relative;overflow:hidden;transition:.2s}
.me-vital:hover{transform:translateY(-2px)}
.me-vital::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--v-cor)}
.me-vital-ico{font-size:1.2rem;margin-bottom:.3rem}
.me-vital-val{font-size:1.4rem;font-weight:900;color:var(--v-cor);line-height:1}
.me-vital-label{font-size:.65rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:.15rem}
.me-vital-status{font-size:.68rem;color:var(--v-cor);font-weight:600;margin-top:.1rem}
/* Card */
.me-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.1rem;margin-bottom:1rem}
.me-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:.875rem;flex-wrap:wrap;gap:.5rem}
.me-card-title{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:700;color:#e2e8f0}
.me-select{padding:.3rem .65rem;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#94a3b8;font-size:.75rem;cursor:pointer;font-family:inherit;outline:none}
/* EKG */
.me-ekg-card{}
.me-ekg-wrap{background:rgba(0,0,0,.4);border-radius:10px;overflow:hidden;position:relative}
.me-ekg-canvas{display:block;width:100%}
.me-ekg-labels{display:flex;justify-content:space-between;font-size:.65rem;color:#475569;margin-top:.3rem;padding:0 4px}
/* Heatmap */
.me-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:1rem;margin-bottom:1rem}
@media(max-width:900px){.me-grid{grid-template-columns:1fr}}
.me-heatmap{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.me-heatmap-legend{display:flex;align-items:center;gap:.4rem;font-size:.7rem;color:#94a3b8}
.me-leg{width:10px;height:10px;border-radius:3px;display:inline-block;margin-right:2px}
/* Heat cell */
.me-heat-cell{border-radius:14px;padding:.875rem;border:1px solid rgba(255,255,255,.06);transition:.2s;cursor:default}
.me-heat-cell:hover{transform:scale(1.02)}
.me-heat-nome{font-size:.82rem;font-weight:700;color:#f1f5f9;margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem}
.me-heat-bars{display:flex;flex-direction:column;gap:.3rem}
.me-heat-row{display:flex;align-items:center;gap:.45rem;font-size:.65rem}
.me-heat-rl{width:52px;color:#64748b;flex-shrink:0}
.me-heat-bar{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}
.me-heat-fill{height:100%;border-radius:3px}
.me-heat-rv{width:24px;text-align:right;font-weight:700;flex-shrink:0}
/* Feed */
.me-feed{display:flex;flex-direction:column;gap:.4rem;max-height:300px;overflow-y:auto}
.me-feed::-webkit-scrollbar{width:3px}
.me-feed-item{display:flex;gap:.6rem;align-items:flex-start;padding:.5rem .6rem;border-radius:8px;font-size:.76rem;color:#94a3b8;border-left:2px solid}
.me-feed-item.alerta{border-color:#ef4444;background:rgba(239,68,68,.04)}
.me-feed-item.positivo{border-color:#10b981;background:rgba(16,185,129,.04)}
.me-feed-item.info{border-color:#6366f1;background:rgba(99,102,241,.04)}
.me-feed-ts{color:#475569;flex-shrink:0;min-width:32px;font-size:.65rem}
/* Tabela setores */
.me-table-header,.me-setor-row{display:grid;grid-template-columns:120px 1fr 1fr 1fr 120px 120px;gap:.75rem;align-items:center;padding:.5rem .25rem;font-size:.78rem}
.me-table-header{font-size:.65rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:.25rem}
.me-setor-row{border-bottom:1px solid rgba(255,255,255,.04);color:#e2e8f0}
.me-setor-row:last-child{border:none}
.me-setor-nome-cell{font-weight:700;display:flex;align-items:center;gap:.4rem}
.me-bar-mini{height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden}
.me-bar-fill{height:100%;border-radius:3px}
.me-burnout-pill{padding:.15rem .5rem;border-radius:999px;font-size:.65rem;font-weight:700;display:inline-block}
/* Termômetro */
.me-temp-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.25rem;display:flex;flex-direction:column;align-items:center;gap:.875rem;text-align:center}
.me-temp-title{font-size:.8rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em}
.me-temp-gauge{position:relative}
.me-temp-desc{max-width:560px;font-size:.82rem;color:#94a3b8;line-height:1.6}
</style>
`;

  // Inicia EKG animado e relógio
  _animarEKG(EnergiaDB.setores[0].pulse);
  _iniciarRelogio();
  _animarFeed();
}

// ── Render helpers ────────────────────────────────────────────

function _renderVital(ico, label, val, cor, status) {
  return `<div class="me-vital" style="--v-cor:${cor}">
    <div class="me-vital-ico">${ico}</div>
    <div class="me-vital-val">${val}</div>
    <div class="me-vital-label">${label}</div>
    <div class="me-vital-status">${status}</div>
  </div>`;
}

function _renderHeatCell(s) {
  const fCor = s.estresse >= 70 ? '#ef4444' : s.estresse >= 50 ? '#f59e0b' : '#10b981';
  const bg   = s.estresse >= 70 ? 'rgba(239,68,68,.08)' : s.estresse >= 50 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)';
  return `<div class="me-heat-cell" style="background:${bg};border-color:${fCor}22">
    <div class="me-heat-nome">${s.emoji} ${s.nome} <span style="font-size:.65rem;color:#64748b">${s.headcount} colab.</span></div>
    <div class="me-heat-bars">
      ${[['Energia',s.energia,'#10b981'],['Estresse',s.estresse,fCor],['Felicidade',s.felicidade,'#06b6d4'],['Motivação',s.motivacao,'#8b5cf6']].map(([l,v,c]) =>
        `<div class="me-heat-row">
          <div class="me-heat-rl">${l}</div>
          <div class="me-heat-bar"><div class="me-heat-fill" style="width:${v}%;background:${c}"></div></div>
          <div class="me-heat-rv" style="color:${c}">${v}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

function _renderFeedItem(e) {
  return `<div class="me-feed-item ${e.tipo}">
    <span class="me-feed-ts">${e.ts}</span>
    <span>${e.msg}</span>
  </div>`;
}

function _renderSetorRow(s) {
  const riscoCor = { critico:'#ef4444', alto:'#f59e0b', medio:'#6366f1', baixo:'#10b981' }[s.burnout_risk];
  const riscoBg  = { critico:'rgba(239,68,68,.15)', alto:'rgba(245,158,11,.15)', medio:'rgba(99,102,241,.15)', baixo:'rgba(16,185,129,.15)' }[s.burnout_risk];
  return `<div class="me-setor-row">
    <div class="me-setor-nome-cell">${s.emoji} ${s.nome}</div>
    <div><div class="me-bar-mini"><div class="me-bar-fill" style="width:${s.energia}%;background:#10b981"></div></div></div>
    <div><div class="me-bar-mini"><div class="me-bar-fill" style="width:${s.estresse}%;background:#ef4444"></div></div></div>
    <div><div class="me-bar-mini"><div class="me-bar-fill" style="width:${s.felicidade}%;background:#06b6d4"></div></div></div>
    <div><span class="me-burnout-pill" style="background:${riscoBg};color:${riscoCor}">${s.burnout_risk}</span></div>
    <div style="color:${s.produtividade>=85?'#10b981':s.produtividade>=70?'#f59e0b':'#ef4444'};font-weight:700">${s.produtividade}%</div>
  </div>`;
}

function _renderTermometro(temp) {
  const cor = temp >= 75 ? '#ef4444' : temp >= 55 ? '#f59e0b' : '#10b981';
  const h   = temp * 1.4;
  const label = temp >= 75 ? 'Quente' : temp >= 55 ? 'Morna' : 'Fresca';
  return `<div style="display:flex;align-items:center;gap:1.5rem">
    <svg viewBox="0 0 40 140" width="40" height="140">
      <rect x="14" y="10" width="12" height="100" rx="6" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
      <rect x="14" y="${110-h}" width="12" height="${h}" rx="6" fill="${cor}"/>
      <circle cx="20" cy="122" r="14" fill="${cor}" opacity=".85"/>
      <text x="20" y="127" text-anchor="middle" fill="#fff" font-size="9" font-weight="900" font-family="inherit">${temp}</text>
    </svg>
    <div style="text-align:left">
      <div style="font-size:2.2rem;font-weight:900;color:${cor}">${label}</div>
      <div style="font-size:.78rem;color:#64748b">${temp}/100 — Índice de Temperatura</div>
    </div>
  </div>`;
}

// ── EKG animado (canvas) ──────────────────────────────────────

function _animarEKG(dados) {
  const canvas = document.getElementById('me-ekg');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let offset  = 0;
  let setor   = 0; // índice do setor atual

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // Grid sutil
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += W/12) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += H/4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Linha EKG
    const pulseData = EnergiaDB.setores[setor]?.pulse || dados;
    const n = pulseData.length;

    const getY = (i) => {
      const base = ((i + offset) % n);
      const v    = pulseData[Math.floor(base)] || 65;
      return H - (v / 100) * H * 0.8 - H * 0.1;
    };

    // Gradiente
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(99,102,241,0)');
    grad.addColorStop(.5, '#6366f1');
    grad.addColorStop(1, 'rgba(99,102,241,0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur  = 8;
    ctx.beginPath();

    for (let x = 0; x <= W; x++) {
      const progress = x / W;
      const raw      = progress * n;
      const i0       = Math.floor(raw);
      const t        = raw - i0;
      const y0       = getY(i0);
      const y1       = getY(i0 + 1);
      const y        = y0 + (y1 - y0) * t;

      // Pico EKG no meio
      const peakFactor = Math.exp(-Math.pow((progress - .5) * 20, 2));
      const ekgPeak    = peakFactor * 30;
      const yFinal     = y - ekgPeak;

      if (x === 0) ctx.moveTo(x, yFinal);
      else         ctx.lineTo(x, yFinal);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    offset = (offset + 0.05) % n;
    requestAnimationFrame(draw);
  };
  draw();
}

// ── Relógio e feed animado ────────────────────────────────────

function _iniciarRelogio() {
  const el = document.getElementById('me-clock');
  if (!el) return;
  setInterval(() => {
    el.textContent = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }, 1000);
}

function _animarFeed() {
  let idx = 0;
  setInterval(() => {
    const feed = document.getElementById('me-feed');
    if (!feed) return;
    const novo = EnergiaDB.eventos_live[idx % EnergiaDB.eventos_live.length];
    const item = document.createElement('div');
    item.className = `me-feed-item ${novo.tipo}`;
    item.innerHTML = `<span class="me-feed-ts">agora</span><span>${novo.msg}</span>`;
    item.style.animation = 'fadeSlideIn .4s ease';
    feed.prepend(item);
    if (feed.children.length > 8) feed.removeChild(feed.lastChild);
    idx++;
  }, 8000);
}

// ── Engine de interação ───────────────────────────────────────

const MEEngine = {
  trocarSetor(nome) {
    const idx = EnergiaDB.setores.findIndex(s => s.nome === nome);
    const setor = idx >= 0 ? EnergiaDB.setores[idx] : EnergiaDB.setores[0];
    _animarEKG(setor.pulse);
  },
};

window.MEEngine = MEEngine;
