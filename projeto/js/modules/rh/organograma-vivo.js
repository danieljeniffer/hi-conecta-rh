/**
 * organograma-vivo.js — Organograma Neural em Tempo Real
 * hi Conecta RH · Grafo SVG force-directed com IA de influência
 *
 * Visualiza:
 *  - Hierarquia real da organização
 *  - Influência informal (conexões cruzadas)
 *  - Score de risco por nó (cor + tamanho)
 *  - Fluxo de comunicação animado
 *  - Líderes informais detectados pela IA
 *  - Gargalos operacionais
 *  - Pressão por equipe (heatmap)
 */

const OrganigramaVivo = (() => {
  'use strict';

  // ── Dados do organograma ──────────────────────────────────────
  const NODES = [
    // Nível 0 — Topo
    { id:'ceo',   nome:'Dir. Geral',    setor:'Diretoria', nivel:0, x:0,    y:0,   risco:15, tipo:'exec',    headcount:1,  avatar:'DG' },
    // Nível 1 — Gestores sênior
    { id:'cto',   nome:'Gustavo R.',    setor:'TI',        nivel:1, x:-300, y:120, risco:42, tipo:'gestor',  headcount:12, avatar:'GR' },
    { id:'csales',nome:'Carlos S.',     setor:'Comercial', nivel:1, x:-100, y:120, risco:78, tipo:'gestor',  headcount:18, avatar:'CS', alerta:'⚠️' },
    { id:'cfin',  nome:'Ana F.',        setor:'Financeiro',nivel:1, x:100,  y:120, risco:23, tipo:'gestor',  headcount:10, avatar:'AF' },
    { id:'cops',  nome:'Renata V.',     setor:'Operações', nivel:1, x:300,  y:120, risco:61, tipo:'gestor',  headcount:22, avatar:'RV', alerta:'⚠️' },
    // Nível 2 — Colaboradores selecionados
    { id:'c1',    nome:'Diego N.',      setor:'Comercial', nivel:2, x:-200, y:260, risco:81, tipo:'colab',   headcount:1,  avatar:'DN', alerta:'🔴' },
    { id:'c2',    nome:'Camila A.',     setor:'TI',        nivel:2, x:-300, y:260, risco:38, tipo:'colab',   headcount:1,  avatar:'CA' },
    { id:'c3',    nome:'Thiago M.',     setor:'TI',        nivel:2, x:-400, y:260, risco:71, tipo:'colab',   headcount:1,  avatar:'TM', alerta:'🟡' },
    { id:'c4',    nome:'Fernanda L.',   setor:'Financeiro',nivel:2, x:100,  y:260, risco:31, tipo:'colab',   headcount:1,  avatar:'FL' },
    { id:'c5',    nome:'Beatriz F.',    setor:'Comercial', nivel:2, x:-100, y:260, risco:45, tipo:'colab',   headcount:1,  avatar:'BF' },
    { id:'c6',    nome:'Bruno A.',      setor:'Operações', nivel:2, x:300,  y:260, risco:55, tipo:'colab',   headcount:1,  avatar:'BA' },
    { id:'rh',    nome:'Mariana C.',    setor:'RH',        nivel:1, x:0,    y:120, risco:18, tipo:'rh',      headcount:8,  avatar:'MC' },
    // Líder informal detectado
    { id:'lid',   nome:'Thiago M.*',    setor:'TI',        nivel:2, x:-350, y:260, risco:71, tipo:'lider-inf', headcount:1, avatar:'TM', alerta:'⭐' },
  ];

  const LINKS = [
    // Hierarquia formal
    { source:'ceo',   target:'cto',    tipo:'hierarquia', peso:1 },
    { source:'ceo',   target:'csales', tipo:'hierarquia', peso:1 },
    { source:'ceo',   target:'cfin',   tipo:'hierarquia', peso:1 },
    { source:'ceo',   target:'cops',   tipo:'hierarquia', peso:1 },
    { source:'ceo',   target:'rh',     tipo:'hierarquia', peso:1 },
    { source:'csales',target:'c1',     tipo:'hierarquia', peso:1 },
    { source:'csales',target:'c5',     tipo:'hierarquia', peso:1 },
    { source:'cto',   target:'c2',     tipo:'hierarquia', peso:1 },
    { source:'cto',   target:'c3',     tipo:'hierarquia', peso:1 },
    { source:'cfin',  target:'c4',     tipo:'hierarquia', peso:1 },
    { source:'cops',  target:'c6',     tipo:'hierarquia', peso:1 },
    // Influência informal (detectada pela IA)
    { source:'c3',    target:'c2',     tipo:'influencia',  peso:.7 },
    { source:'c3',    target:'c6',     tipo:'influencia',  peso:.5 },
    { source:'rh',    target:'c1',     tipo:'atencao',    peso:.8 },
    { source:'rh',    target:'csales', tipo:'atencao',    peso:.9 },
    { source:'c5',    target:'c4',     tipo:'influencia',  peso:.4 },
  ];

  const W = 860, H = 480;
  const CX = W / 2, CY = 60;

  let svg, tooltip, selectedNode = null;

  // ── Render principal ──────────────────────────────────────────
  function render() {
    const pc = document.getElementById('pageContainer');
    if (!pc) return;

    pc.innerHTML = `
<div class="org-root">

  <!-- Header -->
  <div class="org-header">
    <div>
      <h2 class="org-title">Organograma Vivo <span class="org-badge-live">● ao vivo</span></h2>
      <p class="org-sub">Hierarquia + influência informal + risco por nó. Clique para explorar.</p>
    </div>
    <div class="org-legend">
      <span class="org-leg-item"><span class="org-leg-dot" style="background:#10b981"></span>Saudável</span>
      <span class="org-leg-item"><span class="org-leg-dot" style="background:#f59e0b"></span>Atenção</span>
      <span class="org-leg-item"><span class="org-leg-dot" style="background:#ef4444"></span>Crítico</span>
      <span class="org-leg-item"><span class="org-leg-line" style="border-color:#6366f1"></span>Hierarquia</span>
      <span class="org-leg-item"><span class="org-leg-line" style="border-color:#ec4899;border-style:dashed"></span>Influência</span>
      <span class="org-leg-item"><span class="org-leg-line" style="border-color:#f59e0b;border-style:dotted"></span>RH → Atenção</span>
      <span class="org-leg-item"><span style="font-size:.85rem">⭐</span>Líder informal</span>
    </div>
  </div>

  <!-- Controles -->
  <div class="org-controls">
    <button class="org-btn" onclick="OrganigramaVivo.filterSetor('')">Todos</button>
    ${['TI','Comercial','Financeiro','Operações','RH'].map(s =>
      `<button class="org-btn" onclick="OrganigramaVivo.filterSetor('${s}')">${s}</button>`
    ).join('')}
    <div style="flex:1"></div>
    <button class="org-btn" onclick="OrganigramaVivo.toggleInfluencia()">Influência IA</button>
    <button class="org-btn" onclick="OrganigramaVivo.toggleHeatmap()">Heatmap Risco</button>
    <button class="org-btn org-btn--primary" onclick="OrganigramaVivo.focusAlertas()">⚠️ Focar alertas</button>
  </div>

  <!-- SVG container -->
  <div class="org-canvas-wrap">
    <svg id="org-svg" viewBox="0 0 ${W} ${H}" class="org-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-strong"><feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(99,102,241,.5)"/>
        </marker>
      </defs>
      <g id="org-links-layer"></g>
      <g id="org-anim-layer"></g>
      <g id="org-nodes-layer"></g>
    </svg>
    <!-- Tooltip -->
    <div id="org-tooltip" class="org-tooltip" style="display:none"></div>
  </div>

  <!-- Painel lateral: nó selecionado -->
  <div id="org-detail" class="org-detail" style="display:none"></div>

  <!-- Insights da IA sobre o organograma -->
  <div class="org-insights">
    <div class="org-insights-title">🧠 Insights da IA sobre o Organograma</div>
    <div class="org-insights-grid">
      <div class="org-insight-card org-insight--red">
        <div class="org-insight-ico">⚠️</div>
        <div><strong>Gargalo detectado:</strong> Carlos Souza centraliza 18 pessoas. Alta dependência → alto risco.</div>
      </div>
      <div class="org-insight-card org-insight--yellow">
        <div class="org-insight-ico">⭐</div>
        <div><strong>Líder informal:</strong> Thiago Machado influencia 4 pessoas além da sua hierarquia. Considere promoção.</div>
      </div>
      <div class="org-insight-card org-insight--blue">
        <div class="org-insight-ico">📊</div>
        <div><strong>Concentração:</strong> 64% dos riscos críticos estão no Comercial — uma equipe, um gestor.</div>
      </div>
      <div class="org-insight-card org-insight--green">
        <div class="org-insight-ico">✅</div>
        <div><strong>Estável:</strong> RH e Financeiro apresentam os menores índices de risco humano da empresa.</div>
      </div>
    </div>
  </div>

</div>

<style>
.org-root{padding:0 0 2rem;font-family:var(--font,'Plus Jakarta Sans',sans-serif);max-width:1200px;margin:0 auto}
.org-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.org-title{font-size:1.3rem;font-weight:800;color:#f1f5f9;display:flex;align-items:center;gap:.6rem}
.org-badge-live{font-size:.7rem;color:#10b981;font-weight:700;letter-spacing:.05em;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.org-sub{color:#94a3b8;font-size:.83rem;margin-top:.3rem}
.org-legend{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;font-size:.72rem;color:#94a3b8}
.org-leg-item{display:flex;align-items:center;gap:.3rem}
.org-leg-dot{width:10px;height:10px;border-radius:50%}
.org-leg-line{width:20px;height:0;border-top-width:2px;border-top-style:solid}
.org-controls{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem;align-items:center}
.org-btn{padding:.35rem .8rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:#94a3b8;font-size:.75rem;font-weight:600;cursor:pointer;transition:.15s;font-family:inherit}
.org-btn:hover{background:rgba(255,255,255,.09);color:#e2e8f0;border-color:rgba(255,255,255,.2)}
.org-btn--primary{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.3);color:#a5b4fc}
.org-canvas-wrap{position:relative;background:rgba(8,12,25,.95);border-radius:20px;
  border:1px solid rgba(255,255,255,.06);overflow:hidden;margin-bottom:1rem}
.org-svg{display:block;width:100%;cursor:default}
.org-tooltip{position:absolute;background:rgba(15,23,42,.95);border:1px solid rgba(99,102,241,.3);
  border-radius:10px;padding:.6rem .9rem;font-size:.75rem;color:#e2e8f0;pointer-events:none;
  z-index:100;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.org-tooltip strong{color:#a5b4fc;display:block;margin-bottom:.2rem}
.org-detail{background:rgba(15,23,42,.9);border:1px solid rgba(99,102,241,.2);border-radius:16px;
  padding:1.25rem;margin-bottom:1rem}
/* Insights */
.org-insights{background:rgba(10,15,30,.8);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:1.25rem}
.org-insights-title{font-size:.82rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.875rem}
.org-insights-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.75rem}
.org-insight-card{display:flex;gap:.65rem;align-items:flex-start;padding:.75rem;border-radius:10px;font-size:.78rem;color:#94a3b8;line-height:1.5}
.org-insight-card strong{color:#e2e8f0}
.org-insight--red{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15)}
.org-insight--yellow{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15)}
.org-insight--blue{background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15)}
.org-insight--green{background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15)}
.org-insight-ico{font-size:1.1rem;flex-shrink:0;margin-top:.05rem}
</style>
`;

    svg     = document.getElementById('org-svg');
    tooltip = document.getElementById('org-tooltip');
    _drawLinks();
    _drawNodes();
    _startFlowAnimation();
  }

  // ── Funções de cor ────────────────────────────────────────────
  function _corRisco(risco) {
    if (risco >= 75) return '#ef4444';
    if (risco >= 50) return '#f59e0b';
    if (risco >= 30) return '#6366f1';
    return '#10b981';
  }

  function _posicaoNode(node) {
    return { x: CX + node.x, y: CY + node.y };
  }

  // ── Desenha links ─────────────────────────────────────────────
  function _drawLinks() {
    const layer = document.getElementById('org-links-layer');
    if (!layer) return;

    layer.innerHTML = LINKS.map(link => {
      const s = NODES.find(n => n.id === link.source);
      const t = NODES.find(n => n.id === link.target);
      if (!s || !t) return '';

      const sp = _posicaoNode(s), tp = _posicaoNode(t);
      const mx = (sp.x + tp.x) / 2;
      const my = (sp.y + tp.y) / 2 - 30;

      let cor, dash, opacity;
      if (link.tipo === 'hierarquia') {
        cor = 'rgba(99,102,241,.35)'; dash = ''; opacity = 0.7;
      } else if (link.tipo === 'influencia') {
        cor = 'rgba(236,72,153,.5)';  dash = '6,3'; opacity = 0.6;
      } else {
        cor = 'rgba(245,158,11,.6)';  dash = '3,3'; opacity = 0.5;
      }

      return `<path
        d="M${sp.x},${sp.y} Q${mx},${my} ${tp.x},${tp.y}"
        fill="none" stroke="${cor}" stroke-width="${link.peso * 1.5}"
        stroke-dasharray="${dash}" opacity="${opacity}"
        data-link="${link.source}-${link.target}"
        class="org-link org-link--${link.tipo}"
      />`;
    }).join('');
  }

  // ── Desenha nós ───────────────────────────────────────────────
  function _drawNodes() {
    const layer = document.getElementById('org-nodes-layer');
    if (!layer) return;

    layer.innerHTML = NODES.map(node => {
      const p      = _posicaoNode(node);
      const cor    = _corRisco(node.risco);
      const r      = node.nivel === 0 ? 28 : node.nivel === 1 ? 22 : 18;
      const isExec = node.nivel === 0;

      return `<g class="org-node" data-id="${node.id}" style="cursor:pointer"
        onmouseenter="OrganigramaVivo._tooltip(event,'${node.id}')"
        onmouseleave="OrganigramaVivo._hideTooltip()"
        onclick="OrganigramaVivo._select('${node.id}')">
        <!-- Halo de risco -->
        <circle cx="${p.x}" cy="${p.y}" r="${r+8}" fill="${cor}" opacity="0.08"/>
        <!-- Anel externo -->
        <circle cx="${p.x}" cy="${p.y}" r="${r+2}" fill="none" stroke="${cor}" stroke-width="1.5" opacity="0.4"/>
        <!-- Nó principal -->
        <circle cx="${p.x}" cy="${p.y}" r="${r}"
          fill="${isExec ? 'rgba(99,102,241,.3)' : 'rgba(15,23,42,.95)'}"
          stroke="${cor}" stroke-width="2.5"
          filter="${node.risco >= 75 ? 'url(#glow)' : ''}"
        />
        <!-- Avatar -->
        <text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central"
          fill="#f1f5f9" font-size="${r > 22 ? 9 : 8}" font-weight="700" font-family="inherit">
          ${node.avatar}
        </text>
        <!-- Alerta badge -->
        ${node.alerta ? `<text x="${p.x+r-4}" y="${p.y-r+4}" text-anchor="middle" dominant-baseline="central" font-size="9">${node.alerta}</text>` : ''}
        <!-- Nome -->
        <text x="${p.x}" y="${p.y+r+13}" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="inherit">
          ${node.nome.split('*')[0]}
        </text>
        <!-- Score risco -->
        ${node.risco >= 40 ? `<text x="${p.x}" y="${p.y+r+22}" text-anchor="middle" fill="${cor}" font-size="7" font-weight="700" font-family="inherit">risco ${node.risco}</text>` : ''}
      </g>`;
    }).join('');
  }

  // ── Animação de fluxo ─────────────────────────────────────────
  function _startFlowAnimation() {
    const layer = document.getElementById('org-anim-layer');
    if (!layer) return;

    // Partículas flutuantes nas arestas de alto risco
    const riscoLinks = LINKS.filter(l => {
      const t = NODES.find(n => n.id === l.target);
      return t && t.risco >= 60;
    });

    let frame = 0;
    const animate = () => {
      frame++;
      if (frame % 45 === 0) {
        _emitParticula(layer, riscoLinks[Math.floor(Math.random() * riscoLinks.length)]);
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  function _emitParticula(layer, link) {
    if (!link) return;
    const s = NODES.find(n => n.id === link.source);
    const t = NODES.find(n => n.id === link.target);
    if (!s || !t) return;

    const sp = _posicaoNode(s), tp = _posicaoNode(t);
    const cor = link.tipo === 'atencao' ? '#f59e0b' : '#ec4899';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', cor);
    circle.setAttribute('opacity', '0.9');
    circle.setAttribute('filter', 'url(#glow)');

    const dur = 1200 + Math.random() * 600;
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const prog = (ts - start) / dur;
      if (prog >= 1) { layer.removeChild(circle); return; }

      const mx = (sp.x + tp.x) / 2;
      const my = (sp.y + tp.y) / 2 - 30;
      const t1 = 1 - prog;
      const cx = t1*t1*sp.x + 2*t1*prog*mx + prog*prog*tp.x;
      const cy = t1*t1*sp.y + 2*t1*prog*my + prog*prog*tp.y;

      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('opacity', String(prog < 0.5 ? prog * 2 : (1 - prog) * 2));
      requestAnimationFrame(step);
    };

    layer.appendChild(circle);
    requestAnimationFrame(step);
  }

  // ── Tooltip ───────────────────────────────────────────────────
  function _tooltip(e, nodeId) {
    const node = NODES.find(n => n.id === nodeId);
    if (!node || !tooltip) return;

    const cor = _corRisco(node.risco);
    tooltip.innerHTML = `
      <strong>${node.nome}</strong>
      <div style="color:#94a3b8">${node.setor} ${node.headcount > 1 ? `· ${node.headcount} colab.` : ''}</div>
      <div style="margin-top:.3rem;display:flex;align-items:center;gap:.4rem">
        <div style="flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.1)">
          <div style="width:${node.risco}%;height:100%;background:${cor};border-radius:2px"></div>
        </div>
        <span style="color:${cor};font-weight:700;font-size:.8rem">${node.risco}</span>
      </div>
      ${node.alerta ? `<div style="margin-top:.3rem;color:#f59e0b;font-size:.72rem">${node.alerta} Alerta ativo</div>` : ''}
    `;
    tooltip.style.display = 'block';

    const wrap = document.querySelector('.org-canvas-wrap');
    const rect = wrap ? wrap.getBoundingClientRect() : { left:0, top:0 };
    tooltip.style.left = `${e.clientX - rect.left + 12}px`;
    tooltip.style.top  = `${e.clientY - rect.top  - 40}px`;
  }

  function _hideTooltip() {
    if (tooltip) tooltip.style.display = 'none';
  }

  // ── Seleção de nó ─────────────────────────────────────────────
  function _select(nodeId) {
    const node = NODES.find(n => n.id === nodeId);
    if (!node) return;

    const detail = document.getElementById('org-detail');
    if (!detail) return;

    const cor = _corRisco(node.risco);
    const nivelLabel = ['Executivo','Gestor','Colaborador'][node.nivel] || 'N/A';
    const riscoLabel = node.risco >= 75 ? 'Crítico' : node.risco >= 50 ? 'Alto' : node.risco >= 30 ? 'Médio' : 'Baixo';

    detail.style.display = 'block';
    detail.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${cor},${cor}88);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:.9rem">${node.avatar}</div>
        <div>
          <div style="font-weight:700;color:#f1f5f9;font-size:1rem">${node.nome}</div>
          <div style="color:#94a3b8;font-size:.8rem">${node.setor} · ${nivelLabel}</div>
        </div>
        <div style="margin-left:auto;padding:.3rem .75rem;border-radius:999px;font-size:.75rem;font-weight:700;background:${cor}22;color:${cor};border:1px solid ${cor}44">
          Risco ${riscoLabel} · ${node.risco}/100
        </div>
        <button onclick="document.getElementById('org-detail').style.display='none'" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.2rem">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;font-size:.8rem">
        <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:.75rem">
          <div style="color:#94a3b8;font-size:.68rem;font-weight:700;text-transform:uppercase;margin-bottom:.3rem">Score de Risco</div>
          <div style="font-size:1.5rem;font-weight:800;color:${cor}">${node.risco}/100</div>
        </div>
        <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:.75rem">
          <div style="color:#94a3b8;font-size:.68rem;font-weight:700;text-transform:uppercase;margin-bottom:.3rem">Headcount</div>
          <div style="font-size:1.5rem;font-weight:800;color:#e2e8f0">${node.headcount}</div>
        </div>
      </div>
      ${node.risco >= 60 ? `
      <div style="margin-top:.75rem;padding:.75rem;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:.78rem;color:#94a3b8">
        <strong style="color:#f87171">IA recomenda:</strong> Agendar 1:1 urgente. Verificar carga de trabalho e satisfação.
      </div>` : ''}
    `;
  }

  // ── Filtros e modos ───────────────────────────────────────────
  function filterSetor(setor) {
    document.querySelectorAll('.org-node').forEach(el => {
      const id   = el.dataset.id;
      const node = NODES.find(n => n.id === id);
      el.style.opacity = (!setor || node?.setor === setor) ? '1' : '0.15';
    });
    document.querySelectorAll('.org-btn').forEach(btn => btn.classList.remove('org-btn--primary'));
    event?.target?.classList.add('org-btn--primary');
  }

  let heatmapOn = false;
  function toggleHeatmap() {
    heatmapOn = !heatmapOn;
    document.querySelectorAll('.org-node circle:nth-child(2)').forEach((el, i) => {
      el.setAttribute('opacity', heatmapOn ? '0.35' : '0.08');
    });
  }

  let influenciaOn = true;
  function toggleInfluencia() {
    influenciaOn = !influenciaOn;
    document.querySelectorAll('.org-link--influencia, .org-link--atencao').forEach(el => {
      el.style.display = influenciaOn ? '' : 'none';
    });
  }

  function focusAlertas() {
    const alertas = NODES.filter(n => n.alerta && n.alerta.includes('🔴'));
    document.querySelectorAll('.org-node').forEach(el => {
      const id = el.dataset.id;
      const match = alertas.some(n => n.id === id);
      el.style.opacity = match ? '1' : '0.2';
    });
  }

  return { render, filterSetor, toggleHeatmap, toggleInfluencia, focusAlertas, _tooltip, _hideTooltip, _select };
})();

window.OrganigramaVivo = OrganigramaVivo;

function renderOrganogramaVivo() {
  OrganigramaVivo.render();
}
