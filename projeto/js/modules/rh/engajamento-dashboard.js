// =============================================
// DASHBOARD DE ENGAJAMENTO & PERFORMANCE
// Integrado com Engaja Pro (modo demo)
// =============================================

// ─────────────────────────────────────────────
// DADOS MOCK — Engaja Pro + Avaliações
// ─────────────────────────────────────────────
const engajaDashData = {
  pesos: { head: 0.40, rh: 0.35, engajaPro: 0.25 },
  meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],

  colaboradores: [
    {
      id:1, nome:'João Silva',      setor:'Comercial',  cargo:'Vendedor',             avatar:'JS',
      avaliacaoHead: { comprometimento:8, qualidade:7, postura:9, proatividade:8, evolucao:9 },
      avaliacaoRH:   { participacao:85, engajamento:78, absenteismo:2 },
      engajaPro:     { eventos:8, interacoes:42, presencas:21 },
      historico:     [68, 72, 75, 78, 82],
    },
    {
      id:2, nome:'Maria Oliveira',  setor:'RH',         cargo:'Analista de RH',       avatar:'MO',
      avaliacaoHead: { comprometimento:9, qualidade:9, postura:10, proatividade:9, evolucao:8 },
      avaliacaoRH:   { participacao:95, engajamento:92, absenteismo:1 },
      engajaPro:     { eventos:12, interacoes:68, presencas:22 },
      historico:     [78, 80, 82, 84, 89],
    },
    {
      id:3, nome:'Carlos Souza',    setor:'TI',         cargo:'Dev Front-end',        avatar:'CS',
      avaliacaoHead: { comprometimento:7, qualidade:8, postura:7, proatividade:9, evolucao:8 },
      avaliacaoRH:   { participacao:65, engajamento:72, absenteismo:4 },
      engajaPro:     { eventos:6, interacoes:35, presencas:19 },
      historico:     [62, 65, 68, 70, 75],
    },
    {
      id:4, nome:'Ana Lima',        setor:'Financeiro', cargo:'Analista Financeiro',  avatar:'AL',
      avaliacaoHead: { comprometimento:9, qualidade:9, postura:8, proatividade:7, evolucao:8 },
      avaliacaoRH:   { participacao:88, engajamento:85, absenteismo:1 },
      engajaPro:     { eventos:10, interacoes:55, presencas:22 },
      historico:     [74, 76, 78, 80, 85],
    },
    {
      id:5, nome:'Paulo Santos',    setor:'Operações',  cargo:'Coordenador',          avatar:'PS',
      avaliacaoHead: { comprometimento:5, qualidade:6, postura:6, proatividade:5, evolucao:6 },
      avaliacaoRH:   { participacao:42, engajamento:38, absenteismo:9 },
      engajaPro:     { eventos:3, interacoes:15, presencas:14 },
      historico:     [58, 55, 52, 50, 48],
    },
    {
      id:6, nome:'Fernanda Castro', setor:'Comercial',  cargo:'Gerente Comercial',    avatar:'FC',
      avaliacaoHead: { comprometimento:8, qualidade:9, postura:9, proatividade:8, evolucao:7 },
      avaliacaoRH:   { participacao:80, engajamento:82, absenteismo:2 },
      engajaPro:     { eventos:9, interacoes:48, presencas:20 },
      historico:     [72, 74, 76, 78, 80],
    },
    {
      id:7, nome:'Ricardo Alves',   setor:'TI',         cargo:'Tech Lead',            avatar:'RA',
      avaliacaoHead: { comprometimento:9, qualidade:10, postura:8, proatividade:10, evolucao:9 },
      avaliacaoRH:   { participacao:76, engajamento:80, absenteismo:3 },
      engajaPro:     { eventos:7, interacoes:52, presencas:20 },
      historico:     [77, 79, 81, 83, 87],
    },
    {
      id:8, nome:'Luiza Mendes',    setor:'RH',         cargo:'Gestora de RH',        avatar:'LM',
      avaliacaoHead: { comprometimento:6, qualidade:6, postura:7, proatividade:6, evolucao:5 },
      avaliacaoRH:   { participacao:55, engajamento:50, absenteismo:7 },
      engajaPro:     { eventos:4, interacoes:22, presencas:16 },
      historico:     [65, 63, 60, 58, 55],
    },
  ],

  headsSetor: [
    { setor:'Comercial',  head:'Fernanda Castro', avatar:'FC',
      avaliacao:{ organizacao:8, comunicacao:9, desenvolvimento:8, climaEmocional:8, resultado:9 } },
    { setor:'RH',         head:'Maria Oliveira',  avatar:'MO',
      avaliacao:{ organizacao:9, comunicacao:10, desenvolvimento:9, climaEmocional:9, resultado:8 } },
    { setor:'TI',         head:'Ricardo Alves',   avatar:'RA',
      avaliacao:{ organizacao:8, comunicacao:8, desenvolvimento:9, climaEmocional:7, resultado:9 } },
    { setor:'Financeiro', head:'Ana Lima',        avatar:'AL',
      avaliacao:{ organizacao:9, comunicacao:8, desenvolvimento:7, climaEmocional:8, resultado:9 } },
    { setor:'Operações',  head:'Paulo Santos',    avatar:'PS',
      avaliacao:{ organizacao:5, comunicacao:6, desenvolvimento:5, climaEmocional:5, resultado:6 } },
  ],
};

// Estado da UI
const engajaState = {
  aba:    'visaoGeral',
  filtros:{ setor:'todos', colaborador:'todos', periodoIdx:4 },
  abaAvaliacao: 'head',
};

// ─────────────────────────────────────────────
// ENGINE DE SCORES
// ─────────────────────────────────────────────
function _calcScores(colab) {
  const h = colab.avaliacaoHead;
  const scoreHead = ((h.comprometimento + h.qualidade + h.postura + h.proatividade + h.evolucao) / 5) * 10;

  const r = colab.avaliacaoRH;
  const scoreRH = Math.min(100,
    r.participacao * 0.45 +
    r.engajamento  * 0.40 +
    Math.max(0, 100 - r.absenteismo * 8) * 0.15
  );

  const e = colab.engajaPro;
  const scoreEngajaPro = Math.min(100, e.eventos * 3.5 + e.interacoes * 0.4 + e.presencas * 1.8);

  const { head, rh, engajaPro } = engajaDashData.pesos;
  const scoreGeral = Math.round(head * scoreHead + rh * scoreRH + engajaPro * scoreEngajaPro);

  return {
    scoreHead:      Math.round(scoreHead),
    scoreRH:        Math.round(scoreRH),
    scoreEngajaPro: Math.round(scoreEngajaPro),
    scoreGeral,
  };
}

function _calcScoresSetor(setor) {
  const colabs = engajaDashData.colaboradores.filter(c => c.setor === setor);
  if (!colabs.length) return 0;
  const total = colabs.reduce((acc, c) => acc + _calcScores(c).scoreGeral, 0);
  return Math.round(total / colabs.length);
}

function _calcScoreHeadSetor(hs) {
  const av = hs.avaliacao;
  return Math.round(((av.organizacao + av.comunicacao + av.desenvolvimento + av.climaEmocional + av.resultado) / 5) * 10);
}

// ─────────────────────────────────────────────
// FILTRO
// ─────────────────────────────────────────────
function _filtrarColabs() {
  let colabs = [...engajaDashData.colaboradores];
  if (engajaState.filtros.setor !== 'todos')
    colabs = colabs.filter(c => c.setor === engajaState.filtros.setor);
  if (engajaState.filtros.colaborador !== 'todos')
    colabs = colabs.filter(c => c.nome === engajaState.filtros.colaborador);
  return colabs;
}

// ─────────────────────────────────────────────
// ALERTAS AUTOMÁTICOS
// ─────────────────────────────────────────────
function _gerarAlertas() {
  const alertas = [];
  const pidx = engajaState.filtros.periodoIdx;

  engajaDashData.colaboradores.forEach(c => {
    const scores = _calcScores(c);

    if (c.avaliacaoRH.absenteismo >= 8)
      alertas.push({ tipo:'danger', icone:'🔴', titulo:`Alto absenteísmo`, msg:`${c.nome} — ${c.avaliacaoRH.absenteismo} faltas este mês`, colab:c.nome });

    if (pidx > 0) {
      const atual    = c.historico[pidx]     ?? scores.scoreGeral;
      const anterior = c.historico[pidx - 1] ?? scores.scoreGeral;
      if (atual < anterior - 5)
        alertas.push({ tipo:'warning', icone:'🟡', titulo:`Queda de performance`, msg:`${c.nome} caiu ${anterior - atual} pts vs. mês anterior`, colab:c.nome });
      if (atual > anterior + 5)
        alertas.push({ tipo:'success', icone:'🟢', titulo:`Evolução detectada`, msg:`${c.nome} avançou ${atual - anterior} pts vs. mês anterior`, colab:c.nome });
    }

    if (scores.scoreGeral < 55)
      alertas.push({ tipo:'danger', icone:'⚠️', titulo:`Colaborador em risco`, msg:`${c.nome} — Score geral: ${scores.scoreGeral}/100`, colab:c.nome });
  });

  return alertas;
}

// ─────────────────────────────────────────────
// BADGES / GAMIFICAÇÃO
// ─────────────────────────────────────────────
function _calcBadges(colab, scores, todosSorted) {
  const badges = [];
  const pidx = engajaState.filtros.periodoIdx;

  if (todosSorted[0]?.id === colab.id)
    badges.push({ label:'🏆 Top Performer', cor:'#f59e0b' });

  if (colab.avaliacaoRH.absenteismo >= 8)
    badges.push({ label:'⚠️ Em Risco', cor:'#dc2626' });

  if (colab.engajaPro.presencas >= 21)
    badges.push({ label:'✅ Top Presença', cor:'#16a34a' });

  if (colab.engajaPro.interacoes >= 60)
    badges.push({ label:'💬 Mais Ativo', cor:'#7c3aed' });

  if (pidx > 0) {
    const evolucao = (colab.historico[pidx] ?? 0) - (colab.historico[pidx-1] ?? 0);
    if (evolucao >= 5) badges.push({ label:'📈 Em Evolução', cor:'#2563eb' });
  }

  return badges;
}

// ─────────────────────────────────────────────
// HELPERS DE COR E LABEL POR SCORE
// ─────────────────────────────────────────────
function _corScore(score) {
  if (score >= 85) return '#16a34a';
  if (score >= 70) return '#2563eb';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

function _labelScore(score) {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 55) return 'Regular';
  return 'Crítico';
}

// ─────────────────────────────────────────────
// CHARTS SVG
// ─────────────────────────────────────────────
function _svgLineChart(series, labels) {
  const W = 500, H = 140, PAD = 30;
  const cW = W - PAD * 2, cH = H - PAD * 2;
  const n  = labels.length;
  const allVals = series.flatMap(s => s.data);
  const minY = Math.max(0,   Math.min(...allVals) - 8);
  const maxY = Math.min(100, Math.max(...allVals) + 8);

  const xPos = i => PAD + (i / (n - 1)) * cW;
  const yPos = v => PAD + cH - ((v - minY) / (maxY - minY)) * cH;

  const gridLines = [0, 25, 50, 75, 100]
    .filter(v => v >= minY && v <= maxY)
    .map(v => `
      <line x1="${PAD}" y1="${yPos(v)}" x2="${W-PAD}" y2="${yPos(v)}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="${PAD-4}" y="${yPos(v)+4}" text-anchor="end" font-size="9" fill="#94a3b8">${v}</text>
    `).join('');

  const seriesHTML = series.map(s => {
    const pts  = s.data.map((v,i) => `${xPos(i)},${yPos(v)}`).join(' ');
    const area = `${xPos(0)},${yPos(minY)} ` + s.data.map((v,i) => `${xPos(i)},${yPos(v)}`).join(' ') + ` ${xPos(n-1)},${yPos(minY)}`;
    const dots = s.data.map((v,i) => `
      <circle cx="${xPos(i)}" cy="${yPos(v)}" r="4" fill="${s.color}" stroke="white" stroke-width="2"/>
      <title>${s.label}: ${v}</title>
    `).join('');
    return `
      <polygon points="${area}" fill="${s.color}" opacity="0.08"/>
      <polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>
      ${dots}
    `;
  }).join('');

  const labelsHTML = labels.map((l,i) =>
    `<text x="${xPos(i)}" y="${H-6}" text-anchor="middle" font-size="10" fill="#94a3b8">${l}</text>`
  ).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%">
      ${gridLines}
      ${seriesHTML}
      ${labelsHTML}
    </svg>`;
}

function _svgDonut(score, size = 72) {
  const cor  = _corScore(score);
  const r    = size * 0.40;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="flex-shrink:0">
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="${size*0.09}"/>
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${cor}" stroke-width="${size*0.09}"
        stroke-dasharray="${fill.toFixed(1)} ${(circ - fill).toFixed(1)}"
        stroke-linecap="round" transform="rotate(-90 ${cx} ${cx})"/>
      <text x="${cx}" y="${cx+4}" text-anchor="middle" font-size="${size*0.19}" font-weight="700" fill="#1e293b">${score}</text>
    </svg>`;
}

function _barMini(valor, max, cor) {
  const pct = Math.round((valor / max) * 100);
  return `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="flex:1;height:6px;background:#e2e8f0;border-radius:4px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${cor};border-radius:4px"></div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${cor};min-width:26px">${valor}</span>
    </div>`;
}

// ─────────────────────────────────────────────
// CSS LAZY INJECTION
// ─────────────────────────────────────────────
function _injetarCssEngaja() {
  if (document.getElementById('css-engaja')) return;
  const s = document.createElement('style');
  s.id = 'css-engaja';
  s.textContent = `
    .engaja-wrap        { display:flex;flex-direction:column;gap:16px }
    .engaja-filtros     { display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:12px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0 }
    .engaja-filtros label{ font-size:12px;font-weight:600;color:#64748b }
    .engaja-filtros select{ padding:6px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:12px;outline:none;background:white;color:#1e293b }
    .engaja-kpi-grid    { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px }
    .engaja-kpi         { background:white;border:1px solid #e2e8f0;border-radius:14px;padding:16px;display:flex;align-items:center;gap:12px }
    .engaja-kpi-icon    { font-size:28px;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0 }
    .engaja-kpi-info strong{ font-size:20px;font-weight:800;display:block;color:#1e293b;line-height:1.1 }
    .engaja-kpi-info small { font-size:11px;color:#64748b }
    .engaja-charts-row  { display:grid;grid-template-columns:1fr 1fr;gap:16px }
    .engaja-chart-box   { background:white;border:1px solid #e2e8f0;border-radius:14px;padding:16px }
    .engaja-chart-title { font-size:13px;font-weight:700;color:#1e293b;margin-bottom:12px }
    .engaja-chart-area  { height:150px }
    .engaja-top5        { display:flex;flex-direction:column;gap:8px }
    .engaja-rank-item   { display:flex;align-items:center;gap:10px;padding:10px 14px;background:white;border:1px solid #e2e8f0;border-radius:10px }
    .engaja-rank-pos    { font-size:13px;font-weight:800;min-width:24px;text-align:center }
    .engaja-rank-avatar { width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0 }
    .engaja-rank-info   { flex:1;min-width:0 }
    .engaja-rank-info strong{ font-size:13px;display:block }
    .engaja-rank-info small { font-size:11px;color:#64748b }
    .engaja-badge       { display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;color:white;margin:1px }
    .engaja-alerta      { display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:10px;font-size:13px }
    .engaja-alerta.danger  { background:#fef2f2;border-left:4px solid #dc2626 }
    .engaja-alerta.warning { background:#fffbeb;border-left:4px solid #d97706 }
    .engaja-alerta.success { background:#f0fdf4;border-left:4px solid #16a34a }
    .engaja-table th,.engaja-table td { padding:10px 12px;font-size:12px;text-align:left;border-bottom:1px solid #f1f5f9 }
    .engaja-table thead th { background:#f8fafc;font-weight:700;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.5px }
    .engaja-table tbody tr:hover { background:#fafafa }
    .engaja-form-grid   { display:grid;grid-template-columns:1fr 1fr;gap:12px }
    .engaja-nota-row    { display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9 }
    .engaja-nota-label  { flex:1;font-size:13px;color:#1e293b }
    .engaja-nota-input  { width:60px;padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;font-weight:700;text-align:center;outline:none }
    .engaja-nota-input:focus { border-color:#2563eb }
    .engaja-setor-bar   { display:flex;align-items:center;gap:12px;padding:10px 0 }
    .engaja-setor-nome  { width:90px;font-size:12px;font-weight:600;color:#64748b;flex-shrink:0 }
    .engaja-setor-barra { flex:1;height:20px;background:#e2e8f0;border-radius:6px;overflow:hidden;position:relative }
    .engaja-setor-fill  { height:100%;border-radius:6px;transition:width .4s }
    .engaja-setor-val   { font-size:12px;font-weight:700;min-width:32px;text-align:right }
    @media(max-width:700px){ .engaja-charts-row,.engaja-form-grid{ grid-template-columns:1fr } }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderEngajamentoDashboard() {
  _injetarCssEngaja();
  const setores = [...new Set(engajaDashData.colaboradores.map(c => c.setor))];
  const nomes   = engajaDashData.colaboradores.map(c => c.nome);

  return `
  <div class="engaja-wrap">

    <!-- FILTROS -->
    <div class="engaja-filtros">
      <span style="font-size:12px;font-weight:700;color:#1e293b;margin-right:4px">🔍 Filtros:</span>
      <div style="display:flex;align-items:center;gap:6px">
        <label>Período</label>
        <select onchange="filtrarEngaja('periodoIdx',this.selectedIndex)">
          ${engajaDashData.meses.map((m,i) =>
            `<option value="${i}" ${i===engajaState.filtros.periodoIdx?'selected':''}>${m}/2025</option>`
          ).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <label>Setor</label>
        <select onchange="filtrarEngaja('setor',this.value)">
          <option value="todos" ${engajaState.filtros.setor==='todos'?'selected':''}>Todos</option>
          ${setores.map(s => `<option value="${s}" ${engajaState.filtros.setor===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <label>Colaborador</label>
        <select onchange="filtrarEngaja('colaborador',this.value)">
          <option value="todos" ${engajaState.filtros.colaborador==='todos'?'selected':''}>Todos</option>
          ${nomes.map(n => `<option value="${n}" ${engajaState.filtros.colaborador===n?'selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <button class="link-btn" onclick="filtrarEngaja('reset','')" style="margin-left:auto">↺ Limpar</button>
    </div>

    <!-- ABAS DO DASHBOARD -->
    <div class="exp-tabs" style="margin:0">
      ${[
        ['visaoGeral',  '📊 Visão Geral'],
        ['rankings',    '🏆 Rankings'],
        ['evolucao',    '📈 Evolução'],
        ['avaliacoes',  '📝 Avaliações'],
        ['relatorios',  '📄 Relatórios'],
      ].map(([k,l]) =>
        `<button class="exp-tab ${engajaState.aba===k?'active':''}" onclick="switchEngajaTab('${k}')">${l}</button>`
      ).join('')}
    </div>

    <div id="engaja-content">
      ${_renderEngajaAba(engajaState.aba)}
    </div>

  </div>`;
}

function switchEngajaTab(aba) {
  engajaState.aba = aba;
  const el = document.getElementById('engaja-content');
  if (el) el.innerHTML = _renderEngajaAba(aba);
}

function filtrarEngaja(campo, valor) {
  if (campo === 'reset') {
    engajaState.filtros = { setor:'todos', colaborador:'todos', periodoIdx:4 };
  } else if (campo === 'periodoIdx') {
    engajaState.filtros.periodoIdx = parseInt(valor);
  } else {
    engajaState.filtros[campo] = valor;
  }
  document.getElementById('exp-content').innerHTML = renderEngajamentoDashboard();
}

function _renderEngajaAba(aba) {
  if (aba === 'visaoGeral')  return _renderVisaoGeral();
  if (aba === 'rankings')    return _renderRankings();
  if (aba === 'evolucao')    return _renderEvolucao();
  if (aba === 'avaliacoes')  return _renderAvaliacoes();
  if (aba === 'relatorios')  return _renderRelatorios();
  return '';
}

// ─────────────────────────────────────────────
// ABA: VISÃO GERAL
// ─────────────────────────────────────────────
function _renderVisaoGeral() {
  const colabs  = _filtrarColabs();
  const pidx    = engajaState.filtros.periodoIdx;
  const alertas = _gerarAlertas();

  const todosSorted = [...colabs].sort((a,b) => _calcScores(b).scoreGeral - _calcScores(a).scoreGeral);
  const scoresMedios  = colabs.map(c => _calcScores(c));
  const mediGeral     = colabs.length ? Math.round(scoresMedios.reduce((a,s) => a+s.scoreGeral, 0) / colabs.length) : 0;
  const top           = todosSorted[0];
  const topScores     = top ? _calcScores(top) : null;

  // Setor com maior score médio
  const setores = [...new Set(engajaDashData.colaboradores.map(c => c.setor))];
  const setorTop = setores.reduce((best, s) => {
    const sc = _calcScoresSetor(s);
    return sc > (best.sc || 0) ? { nome:s, sc } : best;
  }, {});

  // Linha de evolução — média geral por mês
  const seriesLinha = [{
    label: 'Média Geral',
    color: '#2563eb',
    data: engajaDashData.meses.map((_,i) => {
      const vals = colabs.map(c => c.historico[i] ?? _calcScores(c).scoreGeral);
      return vals.length ? Math.round(vals.reduce((a,v)=>a+v,0)/vals.length) : 0;
    }),
  }];
  if (engajaState.filtros.colaborador !== 'todos' && colabs.length === 1) {
    seriesLinha[0] = { label: colabs[0].nome, color: '#2563eb', data: colabs[0].historico };
  }

  // Barras por setor
  const setoresBar = setores.map(s => ({ nome:s, score: _calcScoresSetor(s) }))
    .sort((a,b) => b.score - a.score);
  const maxSetor = Math.max(...setoresBar.map(s => s.score));

  // Top 5
  const top5 = todosSorted.slice(0, 5);

  return `
  <div class="engaja-wrap" style="gap:14px">

    <!-- KPIs -->
    <div class="engaja-kpi-grid">
      <div class="engaja-kpi" style="border-left:4px solid ${_corScore(mediGeral)}">
        <div class="engaja-kpi-icon" style="background:${_corScore(mediGeral)}18">${_svgDonut(mediGeral, 48)}</div>
        <div class="engaja-kpi-info">
          <strong>${mediGeral}</strong>
          <small>Score Médio Geral<br><span style="color:${_corScore(mediGeral)};font-weight:700">${_labelScore(mediGeral)}</span></small>
        </div>
      </div>
      ${top ? `
      <div class="engaja-kpi" style="border-left:4px solid #f59e0b">
        <div class="engaja-kpi-icon" style="background:#fef3c7;font-size:20px">🏆</div>
        <div class="engaja-kpi-info">
          <strong style="font-size:14px">${top.nome.split(' ')[0]}</strong>
          <small>${top.setor} · Score ${topScores.scoreGeral}</small>
        </div>
      </div>` : ''}
      <div class="engaja-kpi" style="border-left:4px solid #16a34a">
        <div class="engaja-kpi-icon" style="background:#f0fdf4;font-size:20px">🏢</div>
        <div class="engaja-kpi-info">
          <strong style="font-size:14px">${setorTop.nome || '—'}</strong>
          <small>Setor Destaque · Score ${setorTop.sc || 0}</small>
        </div>
      </div>
      <div class="engaja-kpi" style="border-left:4px solid ${alertas.filter(a=>a.tipo==='danger').length?'#dc2626':'#94a3b8'}">
        <div class="engaja-kpi-icon" style="background:${alertas.filter(a=>a.tipo==='danger').length?'#fef2f2':'#f8fafc'};font-size:20px">🔔</div>
        <div class="engaja-kpi-info">
          <strong>${alertas.length}</strong>
          <small>Alertas ativos<br>${alertas.filter(a=>a.tipo==='danger').length} críticos</small>
        </div>
      </div>
    </div>

    <!-- CHARTS -->
    <div class="engaja-charts-row">
      <div class="engaja-chart-box">
        <div class="engaja-chart-title">📈 Evolução do Score — ${engajaDashData.meses[pidx]}/2025</div>
        <div class="engaja-chart-area">${_svgLineChart(seriesLinha, engajaDashData.meses)}</div>
      </div>
      <div class="engaja-chart-box">
        <div class="engaja-chart-title">🏢 Score Médio por Setor</div>
        <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">
          ${setoresBar.map(s => `
            <div class="engaja-setor-bar">
              <span class="engaja-setor-nome">${s.nome}</span>
              <div class="engaja-setor-barra">
                <div class="engaja-setor-fill" style="width:${(s.score/maxSetor)*100}%;background:${_corScore(s.score)}"></div>
              </div>
              <span class="engaja-setor-val" style="color:${_corScore(s.score)}">${s.score}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- TOP 5 + ALERTAS -->
    <div class="engaja-charts-row">
      <div class="depto-section" style="padding:16px">
        <div class="section-header" style="margin-bottom:12px"><h3>🏆 Top 5 Colaboradores</h3></div>
        <div class="engaja-top5">
          ${top5.map((c,i) => {
            const sc   = _calcScores(c);
            const cor  = _corScore(sc.scoreGeral);
            const pos  = ['🥇','🥈','🥉','4º','5º'][i];
            const badges = _calcBadges(c, sc, todosSorted);
            const av   = ['#2563eb','#7c3aed','#16a34a','#d97706','#dc2626'][i % 5];
            return `
            <div class="engaja-rank-item">
              <span class="engaja-rank-pos">${pos}</span>
              <div class="engaja-rank-avatar" style="background:${av}">${c.avatar}</div>
              <div class="engaja-rank-info">
                <strong>${c.nome}</strong>
                <small>${c.setor} · ${c.cargo}</small>
                <div style="margin-top:3px">
                  ${badges.slice(0,2).map(b =>
                    `<span class="engaja-badge" style="background:${b.cor}">${b.label}</span>`
                  ).join('')}
                </div>
              </div>
              ${_svgDonut(sc.scoreGeral, 44)}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="depto-section" style="padding:16px">
        <div class="section-header" style="margin-bottom:12px">
          <h3>🔔 Alertas & Insights</h3>
          <span class="mes-badge">${alertas.length} total</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${alertas.length === 0
            ? `<div class="empty-state" style="padding:20px"><p>Nenhum alerta ativo. Tudo certo! ✅</p></div>`
            : alertas.slice(0,6).map(a => `
              <div class="engaja-alerta ${a.tipo}">
                <span style="font-size:16px;flex-shrink:0">${a.icone}</span>
                <div>
                  <strong style="font-size:12px;display:block">${a.titulo}</strong>
                  <span style="font-size:12px;color:#64748b">${a.msg}</span>
                </div>
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// ABA: RANKINGS
// ─────────────────────────────────────────────
function _renderRankings() {
  const colabs    = _filtrarColabs();
  const pidx      = engajaState.filtros.periodoIdx;
  const sorted    = [...colabs].sort((a,b) => _calcScores(b).scoreGeral - _calcScores(a).scoreGeral);
  const maxScore  = 100;

  const rowsColab = sorted.map((c,i) => {
    const sc     = _calcScores(c);
    const badges = _calcBadges(c, sc, sorted);
    const evol   = pidx > 0 ? (c.historico[pidx] ?? sc.scoreGeral) - (c.historico[pidx-1] ?? sc.scoreGeral) : 0;
    const evolStr = evol > 0 ? `<span style="color:#16a34a">▲${evol}</span>`
                  : evol < 0 ? `<span style="color:#dc2626">▼${Math.abs(evol)}</span>`
                  : `<span style="color:#94a3b8">—</span>`;
    return `
      <tr>
        <td style="font-weight:700">${i+1}º</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="engaja-rank-avatar" style="background:#2563eb;width:28px;height:28px;font-size:10px">${c.avatar}</div>
            <div>
              <strong style="font-size:13px">${c.nome}</strong>
              <small style="display:block;color:#64748b">${c.cargo}</small>
            </div>
          </div>
        </td>
        <td>${c.setor}</td>
        <td>${_barMini(sc.scoreHead,      maxScore, '#7c3aed')}</td>
        <td>${_barMini(sc.scoreRH,        maxScore, '#2563eb')}</td>
        <td>${_barMini(sc.scoreEngajaPro, maxScore, '#16a34a')}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            ${_svgDonut(sc.scoreGeral, 36)}
            <span style="font-size:11px;font-weight:700;color:${_corScore(sc.scoreGeral)}">${_labelScore(sc.scoreGeral)}</span>
          </div>
        </td>
        <td>${evolStr}</td>
        <td style="max-width:140px">
          ${badges.map(b => `<span class="engaja-badge" style="background:${b.cor}">${b.label}</span>`).join('')}
        </td>
      </tr>`;
  }).join('');

  // Ranking de setores
  const setores = [...new Set(engajaDashData.colaboradores.map(c => c.setor))];
  const setoresSorted = setores.map(s => {
    const hs = engajaDashData.headsSetor.find(h => h.setor === s);
    return {
      setor: s,
      scoreColab:    _calcScoresSetor(s),
      scoreHead:     hs ? _calcScoreHeadSetor(hs) : 0,
      headNome:      hs ? hs.head : '—',
    };
  }).sort((a,b) => b.scoreColab - a.scoreColab);

  return `
  <div class="engaja-wrap">

    <div class="depto-section" style="padding:16px">
      <div class="section-header" style="margin-bottom:12px">
        <h3>🏆 Ranking de Colaboradores</h3>
        <button class="link-btn" onclick="exportarEngajaExcel()">⬇ Excel</button>
      </div>
      <div class="table-wrap">
        <table class="engaja-table" style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th>#</th><th>Colaborador</th><th>Setor</th>
              <th style="min-width:100px">Score Head</th>
              <th style="min-width:100px">Score RH</th>
              <th style="min-width:100px">EngajaPro</th>
              <th>Score Geral</th><th>Trend</th><th>Badges</th>
            </tr>
          </thead>
          <tbody>${rowsColab}</tbody>
        </table>
      </div>
    </div>

    <div class="depto-section" style="padding:16px">
      <div class="section-header" style="margin-bottom:12px"><h3>🏢 Ranking de Setores</h3></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${setoresSorted.map((s,i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:white;border:1px solid #e2e8f0;border-radius:10px">
            <span style="font-size:20px">${['🥇','🥈','🥉','4º','5º'][i]||''}</span>
            <div style="flex:1">
              <strong style="font-size:13px">${s.setor}</strong>
              <small style="display:block;color:#64748b">Head: ${s.headNome}</small>
              <div style="margin-top:6px">${_barMini(s.scoreColab, 100, _corScore(s.scoreColab))}</div>
            </div>
            <div style="text-align:center">
              ${_svgDonut(s.scoreColab, 44)}
              <small style="font-size:10px;color:#64748b">Equipe</small>
            </div>
            <div style="text-align:center">
              ${_svgDonut(s.scoreHead, 44)}
              <small style="font-size:10px;color:#64748b">Head</small>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// ABA: EVOLUÇÃO
// ─────────────────────────────────────────────
function _renderEvolucao() {
  const colabs  = _filtrarColabs();
  const colors  = ['#2563eb','#7c3aed','#16a34a','#d97706','#dc2626','#0ea5e9','#f43f5e','#84cc16'];

  const series = colabs.map((c,i) => ({
    label: c.nome.split(' ')[0],
    color: colors[i % colors.length],
    data:  c.historico,
  }));

  // Tabela de variação
  const rows = colabs.map(c => {
    const scores = engajaDashData.meses.map((_,i) => c.historico[i] ?? _calcScores(c).scoreGeral);
    const varAbs = scores[4] - scores[0];
    const varPct = scores[0] > 0 ? Math.round((varAbs / scores[0]) * 100) : 0;
    return { c, scores, varAbs, varPct };
  }).sort((a,b) => b.varAbs - a.varAbs);

  return `
  <div class="engaja-wrap">

    <div class="depto-section" style="padding:16px">
      <div class="section-header" style="margin-bottom:12px"><h3>📈 Evolução de Score — Jan → Mai/2025</h3></div>
      <div style="height:220px">${_svgLineChart(series, engajaDashData.meses)}</div>
      <!-- Legenda -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px">
        ${series.map(s => `
          <div style="display:flex;align-items:center;gap:5px;font-size:11px">
            <div style="width:12px;height:3px;background:${s.color};border-radius:2px"></div>
            <span>${s.label}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="depto-section" style="padding:16px">
      <div class="section-header" style="margin-bottom:12px"><h3>📊 Variação Acumulada (Jan → Mai)</h3></div>
      <div class="table-wrap">
        <table class="engaja-table" style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th>Colaborador</th><th>Setor</th>
              ${engajaDashData.meses.map(m => `<th>${m}</th>`).join('')}
              <th>Var. pts</th><th>Var. %</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(({ c, scores, varAbs, varPct }) => `
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td style="color:#64748b">${c.setor}</td>
                ${scores.map((s,i) => `
                  <td>
                    <span style="font-weight:${i===4?'800':'400'};color:${i===4?_corScore(s):'#1e293b'}">${s}</span>
                  </td>
                `).join('')}
                <td style="font-weight:700;color:${varAbs>=0?'#16a34a':'#dc2626'}">
                  ${varAbs >= 0 ? '+' : ''}${varAbs}
                </td>
                <td style="color:${varPct>=0?'#16a34a':'#dc2626'}">
                  ${varPct >= 0 ? '+' : ''}${varPct}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// ABA: AVALIAÇÕES
// ─────────────────────────────────────────────
function _renderAvaliacoes() {
  const colabs  = engajaDashData.colaboradores;
  const setores = engajaDashData.headsSetor;

  const subAbas = [['head','👤 Head → Colaborador'],['rh','📋 RH → Colaborador'],['headSetor','🏢 Head do Setor']];

  const formHead = `
    <div class="depto-section" style="padding:16px">
      <div class="section-header"><h3>👤 Avaliação do Head — Colaborador</h3></div>
      <div class="engaja-form-grid" style="margin-top:12px">
        <div>
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Colaborador</label>
            <select id="av-head-colab" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;outline:none">
              ${colabs.map(c => `<option value="${c.id}">${c.nome} — ${c.setor}</option>`).join('')}
            </select>
          </div>
          ${[
            ['Comprometimento e responsabilidade','av-h-comp'],
            ['Qualidade do trabalho',             'av-h-qual'],
            ['Postura e comportamento',            'av-h-post'],
            ['Proatividade e colaboração',         'av-h-proat'],
            ['Evolução no mês',                    'av-h-evol'],
          ].map(([label, id]) => `
            <div class="engaja-nota-row">
              <span class="engaja-nota-label">${label}</span>
              <input type="number" class="engaja-nota-input" id="${id}" min="0" max="10" placeholder="0–10" />
            </div>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;justify-content:flex-end">
          <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:12px">
            <p style="font-size:12px;color:#64748b;margin-bottom:8px"><strong>Escala de referência:</strong></p>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:12px">
              <span>9–10 → Excelente</span>
              <span>7–8 → Bom</span>
              <span>5–6 → Regular</span>
              <span>0–4 → Crítico</span>
            </div>
          </div>
          <button class="btn-primary" onclick="salvarAvaliacaoHead()">✅ Salvar Avaliação</button>
        </div>
      </div>
    </div>`;

  const formRH = `
    <div class="depto-section" style="padding:16px">
      <div class="section-header"><h3>📋 Avaliação do RH — Indicadores Automáticos</h3></div>
      <div class="engaja-form-grid" style="margin-top:12px">
        <div>
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Colaborador</label>
            <select id="av-rh-colab" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;outline:none">
              ${colabs.map(c => `<option value="${c.id}">${c.nome} — ${c.setor}</option>`).join('')}
            </select>
          </div>
          <div class="engaja-nota-row">
            <span class="engaja-nota-label">Participação em ações/eventos (0–100%)</span>
            <input type="number" class="engaja-nota-input" id="av-rh-part" min="0" max="100" placeholder="%" />
          </div>
          <div class="engaja-nota-row">
            <span class="engaja-nota-label">Engajamento voluntário (0–100)</span>
            <input type="number" class="engaja-nota-input" id="av-rh-eng" min="0" max="100" placeholder="0–100" />
          </div>
          <div class="engaja-nota-row">
            <span class="engaja-nota-label">Absenteísmo — faltas/mês (0–30)</span>
            <input type="number" class="engaja-nota-input" id="av-rh-abs" min="0" max="30" placeholder="dias" />
          </div>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:flex-end">
          <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:12px;font-size:12px">
            <strong>📐 Fórmula Score RH:</strong><br>
            <code style="font-size:11px;color:#2563eb">
              Participação × 0.45<br>
              + Engajamento × 0.40<br>
              + (100 – Falta×8) × 0.15
            </code>
          </div>
          <button class="btn-primary" onclick="salvarAvaliacaoRH()">✅ Salvar Avaliação</button>
        </div>
      </div>
    </div>`;

  const formHeadSetor = `
    <div class="depto-section" style="padding:16px">
      <div class="section-header"><h3>🏢 Avaliação do Head do Setor</h3></div>
      <div class="engaja-form-grid" style="margin-top:12px">
        <div>
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Setor / Head</label>
            <select id="av-hs-setor" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;outline:none">
              ${setores.map(hs => `<option value="${hs.setor}">${hs.setor} — ${hs.head}</option>`).join('')}
            </select>
          </div>
          ${[
            ['Organização e gestão',     'av-hs-org'],
            ['Comunicação',              'av-hs-com'],
            ['Desenvolvimento da equipe','av-hs-dev'],
            ['Clima emocional',          'av-hs-cli'],
            ['Resultado do setor',       'av-hs-res'],
          ].map(([label, id]) => `
            <div class="engaja-nota-row">
              <span class="engaja-nota-label">${label}</span>
              <input type="number" class="engaja-nota-input" id="${id}" min="0" max="10" placeholder="0–10" />
            </div>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;justify-content:flex-end">
          <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:12px;font-size:12px">
            <strong>🏆 Scores atuais dos Heads:</strong>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
              ${setores.map(hs => {
                const sc = _calcScoreHeadSetor(hs);
                return `
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span>${hs.setor}</span>
                    <strong style="color:${_corScore(sc)}">${sc}/100</strong>
                  </div>`;
              }).join('')}
            </div>
          </div>
          <button class="btn-primary" onclick="salvarAvaliacaoHeadSetor()">✅ Salvar Avaliação</button>
        </div>
      </div>
    </div>`;

  const formsMap = { head: formHead, rh: formRH, headSetor: formHeadSetor };

  return `
  <div class="engaja-wrap">
    <div class="exp-tabs" style="margin:0">
      ${subAbas.map(([k,l]) =>
        `<button class="exp-tab ${engajaState.abaAvaliacao===k?'active':''}" onclick="switchEngajaAvaliacao('${k}')">${l}</button>`
      ).join('')}
    </div>
    <div id="engaja-form-content">
      ${formsMap[engajaState.abaAvaliacao] || formHead}
    </div>
  </div>`;
}

function switchEngajaAvaliacao(aba) {
  engajaState.abaAvaliacao = aba;
  const formsMap = { head: 'head', rh: 'rh', headSetor: 'headSetor' };
  document.getElementById('engaja-content').innerHTML = _renderAvaliacoes();
}

// ─────────────────────────────────────────────
// HANDLERS DE AVALIAÇÃO
// ─────────────────────────────────────────────
function salvarAvaliacaoHead() {
  const id   = parseInt(document.getElementById('av-head-colab').value);
  const colab = engajaDashData.colaboradores.find(c => c.id === id);
  if (!colab) return;

  const campos = ['av-h-comp','av-h-qual','av-h-post','av-h-proat','av-h-evol'];
  const chaves  = ['comprometimento','qualidade','postura','proatividade','evolucao'];
  const vals    = campos.map(id => { const v = parseInt(document.getElementById(id)?.value); return isNaN(v) ? null : v; });

  if (vals.some(v => v === null || v < 0 || v > 10)) {
    Toast.error('Preencha todas as notas (0 a 10)!');
    return;
  }

  chaves.forEach((k,i) => { colab.avaliacaoHead[k] = vals[i]; });

  const scores = _calcScores(colab);
  colab.historico[engajaState.filtros.periodoIdx] = scores.scoreGeral;

  Toast.success(`Avaliação de ${DOM.sanitize(colab.nome)} salva! Score atualizado: ${scores.scoreGeral}/100`);
  EventBus.emit('engajamento:avaliacao', { colaborador: colab.nome, scoreGeral: scores.scoreGeral });
  switchEngajaTab('visaoGeral');
}

function salvarAvaliacaoRH() {
  const id    = parseInt(document.getElementById('av-rh-colab').value);
  const colab = engajaDashData.colaboradores.find(c => c.id === id);
  if (!colab) return;

  const part = parseInt(document.getElementById('av-rh-part')?.value);
  const eng  = parseInt(document.getElementById('av-rh-eng')?.value);
  const abs  = parseInt(document.getElementById('av-rh-abs')?.value);

  if ([part,eng,abs].some(v => isNaN(v) || v < 0)) {
    Toast.error('Preencha todos os indicadores de RH!');
    return;
  }

  colab.avaliacaoRH = { participacao: Math.min(part,100), engajamento: Math.min(eng,100), absenteismo: Math.min(abs,30) };

  const scores = _calcScores(colab);
  colab.historico[engajaState.filtros.periodoIdx] = scores.scoreGeral;

  if (abs >= 8) {
    Toast.warning(`Atenção: ${DOM.sanitize(colab.nome)} tem alto absenteísmo (${abs} faltas)!`);
    EventBus.emit('engajamento:alerta', { tipo:'absenteismo_alto', colaborador: colab.nome });
  } else {
    Toast.success(`Avaliação RH de ${DOM.sanitize(colab.nome)} salva! Score RH: ${scores.scoreRH}/100`);
  }
  switchEngajaTab('visaoGeral');
}

function salvarAvaliacaoHeadSetor() {
  const setor = document.getElementById('av-hs-setor')?.value;
  const hs    = engajaDashData.headsSetor.find(h => h.setor === setor);
  if (!hs) return;

  const campos = ['av-hs-org','av-hs-com','av-hs-dev','av-hs-cli','av-hs-res'];
  const chaves  = ['organizacao','comunicacao','desenvolvimento','climaEmocional','resultado'];
  const vals    = campos.map(id => { const v = parseInt(document.getElementById(id)?.value); return isNaN(v) ? null : v; });

  if (vals.some(v => v === null || v < 0 || v > 10)) {
    Toast.error('Preencha todas as notas (0 a 10)!');
    return;
  }

  chaves.forEach((k,i) => { hs.avaliacao[k] = vals[i]; });
  const sc = _calcScoreHeadSetor(hs);
  Toast.success(`Avaliação do Head de ${DOM.sanitize(setor)} salva! Score: ${sc}/100`);
  EventBus.emit('engajamento:head_avaliado', { setor, head: hs.head, score: sc });
  switchEngajaTab('rankings');
}

// ─────────────────────────────────────────────
// ABA: RELATÓRIOS
// ─────────────────────────────────────────────
function _renderRelatorios() {
  const colabs = _filtrarColabs();
  const sorted = [...colabs].sort((a,b) => _calcScores(b).scoreGeral - _calcScores(a).scoreGeral);

  return `
  <div class="engaja-wrap">
    <div class="engaja-charts-row">

      <!-- EXPORTAÇÃO -->
      <div class="depto-section" style="padding:16px">
        <div class="section-header"><h3>📤 Exportar Relatórios</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
          <button class="btn-primary" onclick="exportarEngajaPDF()" style="display:flex;align-items:center;gap:8px;justify-content:center">
            📄 Relatório Consolidado — PDF
          </button>
          <button class="btn-primary" onclick="exportarEngajaExcel()" style="display:flex;align-items:center;gap:8px;justify-content:center;background:linear-gradient(135deg,#16a34a,#15803d)">
            📊 Ranking Completo — Excel
          </button>
          <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:4px">
            <label style="font-size:12px;font-weight:600;color:#64748b;display:block;margin-bottom:6px">Relatório Individual</label>
            <div style="display:flex;gap:8px">
              <select id="rel-colab-sel" style="flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;outline:none">
                ${engajaDashData.colaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
              </select>
              <button class="btn-primary" onclick="exportarRelatorioIndividual()" style="white-space:nowrap;padding:8px 14px">⬇ Gerar</button>
            </div>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#64748b;display:block;margin-bottom:6px">Relatório por Setor</label>
            <div style="display:flex;gap:8px">
              <select id="rel-setor-sel" style="flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;outline:none">
                ${[...new Set(engajaDashData.colaboradores.map(c=>c.setor))].map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
              <button class="btn-primary" onclick="exportarRelatorioSetor()" style="white-space:nowrap;padding:8px 14px">⬇ Gerar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PREVIEW CONSOLIDADO -->
      <div class="depto-section" style="padding:16px">
        <div class="section-header"><h3>👁️ Preview — Consolidado</h3><span class="mes-badge">${engajaDashData.meses[engajaState.filtros.periodoIdx]}/2025</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          ${sorted.slice(0,6).map((c,i) => {
            const sc = _calcScores(c);
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f8fafc;border-radius:8px">
                <span style="font-size:12px;font-weight:700;color:#64748b;min-width:20px">${i+1}º</span>
                <strong style="flex:1;font-size:13px">${c.nome}</strong>
                <span style="font-size:11px;color:#64748b">${c.setor}</span>
                <span style="font-size:13px;font-weight:800;color:${_corScore(sc.scoreGeral)}">${sc.scoreGeral}</span>
              </div>`;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- CONFIGURAÇÃO DE PESOS -->
    <div class="depto-section" style="padding:16px">
      <div class="section-header"><h3>⚙️ Pesos da Fórmula de Score Geral</h3><span class="mes-badge">Configurável</span></div>
      <p style="font-size:12px;color:#64748b;margin:8px 0 14px">Ajuste os pesos de cada componente. A soma deve ser 100%.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
        ${[
          ['Avaliação do Head',   'pesos-head',      Math.round(engajaDashData.pesos.head*100),    '#7c3aed'],
          ['Avaliação do RH',     'pesos-rh',        Math.round(engajaDashData.pesos.rh*100),      '#2563eb'],
          ['Score EngajaPro',     'pesos-engajapro', Math.round(engajaDashData.pesos.engajaPro*100),'#16a34a'],
        ].map(([label, id, val, cor]) => `
          <div style="background:white;border:1.5px solid ${cor}30;border-radius:10px;padding:14px">
            <label style="font-size:12px;font-weight:600;color:${cor};display:block;margin-bottom:6px">${label}</label>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="range" id="${id}" min="0" max="100" value="${val}"
                style="flex:1" oninput="document.getElementById('${id}-val').textContent=this.value+'%'"/>
              <span id="${id}-val" style="font-size:14px;font-weight:700;color:${cor};min-width:36px">${val}%</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:14px">
        <button class="btn-primary" onclick="salvarPesos()">💾 Salvar Pesos</button>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// EXPORT + CONFIGURAÇÃO
// ─────────────────────────────────────────────
function exportarEngajaPDF() {
  const colabs = _filtrarColabs();
  const sorted = [...colabs].sort((a,b) => _calcScores(b).scoreGeral - _calcScores(a).scoreGeral);
  const linhas = sorted.map((c,i) => {
    const sc = _calcScores(c);
    return [i+1, c.nome, c.setor, c.cargo, sc.scoreHead, sc.scoreRH, sc.scoreEngajaPro, sc.scoreGeral, _labelScore(sc.scoreGeral)];
  });
  ExportService.pdf(
    `Dashboard de Engajamento — ${engajaDashData.meses[engajaState.filtros.periodoIdx]}/2025`,
    [['#','Colaborador','Setor','Cargo','Head','RH','EngajaPro','Geral','Classificação'], ...linhas]
  );
}

function exportarEngajaExcel() {
  const colabs = _filtrarColabs();
  const sorted = [...colabs].sort((a,b) => _calcScores(b).scoreGeral - _calcScores(a).scoreGeral);
  const colunas = ['#','Colaborador','Setor','Cargo','Score Head','Score RH','Score EngajaPro','Score Geral','Classificação','Absenteísmo','Participação%'];
  const dados = sorted.map((c,i) => {
    const sc = _calcScores(c);
    return [i+1, c.nome, c.setor, c.cargo, sc.scoreHead, sc.scoreRH, sc.scoreEngajaPro, sc.scoreGeral, _labelScore(sc.scoreGeral), c.avaliacaoRH.absenteismo, c.avaliacaoRH.participacao];
  });
  ExportService.excel(`engajamento-${engajaDashData.meses[engajaState.filtros.periodoIdx]}`, colunas, dados);
}

function exportarRelatorioIndividual() {
  const id    = parseInt(document.getElementById('rel-colab-sel')?.value);
  const colab = engajaDashData.colaboradores.find(c => c.id === id);
  if (!colab) return;
  const sc   = _calcScores(colab);
  const h    = colab.avaliacaoHead;
  const r    = colab.avaliacaoRH;
  const e    = colab.engajaPro;
  const hs   = engajaDashData.headsSetor.find(x => x.setor === colab.setor);
  const linhas = [
    ['DADOS'],
    ['Nome', colab.nome], ['Cargo', colab.cargo], ['Setor', colab.setor],
    [''],
    ['AVALIAÇÃO DO HEAD'],
    ['Comprometimento', h.comprometimento], ['Qualidade', h.qualidade],
    ['Postura', h.postura], ['Proatividade', h.proatividade], ['Evolução', h.evolucao],
    [''],
    ['AVALIAÇÃO RH'],
    ['Participação %', r.participacao], ['Engajamento', r.engajamento], ['Absenteísmo', r.absenteismo],
    [''],
    ['ENGAJA PRO'],
    ['Eventos', e.eventos], ['Interações', e.interacoes], ['Presenças', e.presencas],
    [''],
    ['SCORES'],
    ['Score Head', sc.scoreHead], ['Score RH', sc.scoreRH],
    ['Score EngajaPro', sc.scoreEngajaPro], ['Score Geral', sc.scoreGeral],
    ['Classificação', _labelScore(sc.scoreGeral)],
  ];
  ExportService.excel(`relatorio-${colab.nome.replace(/\s+/g,'-')}`, ['Campo','Valor'], linhas);
}

function exportarRelatorioSetor() {
  const setor  = document.getElementById('rel-setor-sel')?.value;
  const colabs = engajaDashData.colaboradores.filter(c => c.setor === setor);
  const hs     = engajaDashData.headsSetor.find(h => h.setor === setor);
  const colunas = ['Colaborador','Cargo','Score Geral','Classificação','Absenteísmo'];
  const dados   = colabs.map(c => {
    const sc = _calcScores(c);
    return [c.nome, c.cargo, sc.scoreGeral, _labelScore(sc.scoreGeral), c.avaliacaoRH.absenteismo];
  });
  if (hs) dados.push(['', `Head: ${hs.head}`, _calcScoreHeadSetor(hs), 'Score Head', '']);
  ExportService.excel(`setor-${setor}`, colunas, dados);
  Toast.success(`Relatório do setor ${DOM.sanitize(setor)} exportado!`);
}

function salvarPesos() {
  const h  = parseInt(document.getElementById('pesos-head')?.value) / 100;
  const r  = parseInt(document.getElementById('pesos-rh')?.value) / 100;
  const ep = parseInt(document.getElementById('pesos-engajapro')?.value) / 100;
  const total = Math.round((h + r + ep) * 100);
  if (total !== 100) {
    Toast.error(`A soma dos pesos deve ser 100%. Atual: ${total}%`);
    return;
  }
  engajaDashData.pesos = { head: h, rh: r, engajaPro: ep };
  Toast.success('Pesos salvos! Scores recalculados.');
  switchEngajaTab('visaoGeral');
}
