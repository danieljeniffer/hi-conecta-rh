/**
 * timeline.js — Employee Timeline
 * Linha do tempo unificada do colaborador com todos os eventos.
 * Filtros, busca, integração com módulos existentes.
 */

// ── Tipos de evento ───────────────────────────
const TL_TIPOS = {
  admissao:      { icon: '🎉', label: 'Admissão',          cor: '#16a34a', grupo: 'carreira'  },
  promocao:      { icon: '⬆️', label: 'Promoção',           cor: '#7c3aed', grupo: 'carreira'  },
  reajuste:      { icon: '💰', label: 'Reajuste Salarial',  cor: '#2563eb', grupo: 'carreira'  },
  transferencia: { icon: '🔄', label: 'Transferência',      cor: '#0891b2', grupo: 'carreira'  },
  ferias:        { icon: '🏖️', label: 'Férias',             cor: '#d97706', grupo: 'ausencia'  },
  afastamento:   { icon: '🏥', label: 'Afastamento',        cor: '#dc2626', grupo: 'ausencia'  },
  avaliacao:     { icon: '📋', label: 'Avaliação',          cor: '#2563eb', grupo: 'desempenho'},
  feedback:      { icon: '💬', label: 'Feedback',           cor: '#7c3aed', grupo: 'desempenho'},
  pdi:           { icon: '🎯', label: 'PDI',                cor: '#0891b2', grupo: 'desempenho'},
  treinamento:   { icon: '🎓', label: 'Treinamento',        cor: '#16a34a', grupo: 'desenvolvimento'},
  certificado:   { icon: '🏅', label: 'Certificado',        cor: '#d97706', grupo: 'desenvolvimento'},
  advertencia:   { icon: '⚠️', label: 'Advertência',        cor: '#dc2626', grupo: 'ocorrencia' },
  elogio:        { icon: '⭐', label: 'Elogio',             cor: '#f59e0b', grupo: 'ocorrencia' },
  documento:     { icon: '📄', label: 'Documento',          cor: '#64748b', grupo: 'administrativo'},
  beneficio:     { icon: '💳', label: 'Benefício',          cor: '#16a34a', grupo: 'administrativo'},
  desligamento:  { icon: '👋', label: 'Desligamento',       cor: '#dc2626', grupo: 'carreira'  },
};

// ── Banco de dados simulado (integra com backend via API) ──
const TimelineDB = {
  KEY: 'hiRH_timeline_v1',

  _gerarEventosMock(colaboradorId) {
    const hoje = new Date();
    const admissao = new Date(hoje.getFullYear() - 2, 2, 1);

    return [
      {
        id: 'ev1', tipo: 'admissao', data: admissao.toISOString(),
        titulo: 'Admissão na empresa',
        descricao: 'Início do vínculo empregatício — Regime CLT.',
        dados: { cargo: 'Analista Jr.', salario: 3500, depto: 'Comercial' },
        autor: 'RH', privado: false,
      },
      {
        id: 'ev2', tipo: 'treinamento', data: new Date(admissao.getTime() + 5*86400000).toISOString(),
        titulo: 'Treinamento Institucional',
        descricao: 'Treinamento de integração — cultura, valores e processos.',
        dados: { duracao: '8h', status: 'concluído', nota: null },
        autor: 'RH', privado: false,
      },
      {
        id: 'ev3', tipo: 'avaliacao', data: new Date(admissao.getTime() + 15*86400000).toISOString(),
        titulo: 'Avaliação de Experiência — 15 dias',
        descricao: 'Avaliação positiva. Boa adaptação à equipe e cultura organizacional.',
        dados: { nota_geral: 4.2, recomenda_efetivacao: true },
        autor: 'Carlos Souza (Gestor)', privado: false,
      },
      {
        id: 'ev4', tipo: 'avaliacao', data: new Date(admissao.getTime() + 45*86400000).toISOString(),
        titulo: 'Avaliação de Experiência — 45 dias',
        descricao: 'Avaliação excelente. Colaborador aprovado na experiência.',
        dados: { nota_geral: 4.7, recomenda_efetivacao: true },
        autor: 'Carlos Souza (Gestor)', privado: false,
      },
      {
        id: 'ev5', tipo: 'beneficio', data: new Date(admissao.getTime() + 30*86400000).toISOString(),
        titulo: 'Ativação de Benefícios',
        descricao: 'VA Caju R$550, VT Nubus R$200, Plano SulAmérica ativados.',
        dados: { beneficios: ['VA', 'VT', 'Plano Saúde', 'Odonto'] },
        autor: 'RH', privado: false,
      },
      {
        id: 'ev6', tipo: 'ferias', data: new Date(admissao.getTime() + 400*86400000).toISOString(),
        titulo: 'Férias — 30 dias',
        descricao: 'Gozo de férias do período aquisitivo 2023–2024.',
        dados: { dias: 30, periodo: '2024–2025', liquido: 4850 },
        autor: 'RH', privado: false,
      },
      {
        id: 'ev7', tipo: 'treinamento', data: new Date(admissao.getTime() + 180*86400000).toISOString(),
        titulo: 'Treinamento: Excel Avançado',
        descricao: 'Conclusão do curso com nota 8.5/10.',
        dados: { duracao: '20h', status: 'concluído', nota: 8.5, certificado: true },
        autor: 'T&D', privado: false,
      },
      {
        id: 'ev8', tipo: 'elogio', data: new Date(admissao.getTime() + 300*86400000).toISOString(),
        titulo: 'Elogio Formal',
        descricao: 'Reconhecimento pela excelente entrega do projeto de reestruturação comercial.',
        dados: { pontos_engajamento: 50 },
        autor: 'Diretoria', privado: false,
      },
      {
        id: 'ev9', tipo: 'reajuste', data: new Date(admissao.getTime() + 365*86400000).toISOString(),
        titulo: 'Reajuste Salarial — Aniversário',
        descricao: 'Reajuste de 8% no aniversário de empresa.',
        dados: { anterior: 3500, novo: 3780, percentual: 8 },
        autor: 'RH', privado: true,
      },
      {
        id: 'ev10', tipo: 'promocao', data: new Date(admissao.getTime() + 540*86400000).toISOString(),
        titulo: 'Promoção — Analista Pleno',
        descricao: 'Promoção por mérito e desempenho acima das expectativas.',
        dados: { cargo_anterior: 'Analista Jr.', cargo_novo: 'Analista Pleno', salario_anterior: 3780, salario_novo: 5200 },
        autor: 'RH + Diretoria', privado: false,
      },
      {
        id: 'ev11', tipo: 'documento', data: new Date(admissao.getTime() + 550*86400000).toISOString(),
        titulo: 'Aditivo Contratual',
        descricao: 'Assinatura do aditivo de promoção para Analista Pleno.',
        dados: { tipo_doc: 'aditivo', assinado: true },
        autor: 'RH', privado: false,
      },
      {
        id: 'ev12', tipo: 'avaliacao', data: new Date(admissao.getTime() + 700*86400000).toISOString(),
        titulo: 'Avaliação de Desempenho — Semestral 2025.1',
        descricao: 'Nota 4.5/5.0 — Supera expectativas em comunicação e entregas.',
        dados: { nota_geral: 4.5, competencias: { comunicacao: 5, entregas: 5, lideranca: 4, tecnico: 4 } },
        autor: 'Carlos Souza (Gestor)', privado: false,
      },
    ].sort((a, b) => new Date(b.data) - new Date(a.data));
  },

  get(colabId) {
    try {
      const raw = localStorage.getItem(`${this.KEY}_${colabId}`);
      return raw ? JSON.parse(raw) : this._gerarEventosMock(colabId);
    } catch { return this._gerarEventosMock(colabId); }
  },

  add(colabId, evento) {
    const eventos = this.get(colabId);
    eventos.unshift({ id: `ev_${Date.now()}`, ...evento, criado_em: new Date().toISOString() });
    localStorage.setItem(`${this.KEY}_${colabId}`, JSON.stringify(eventos));
    return eventos[0];
  },
};

// ── Estado do componente ──────────────────────
let _tlState = {
  colaboradorId: null,
  filtroTipo:    'todos',
  filtroGrupo:   'todos',
  busca:         '',
  mostrarPrivados: false,
  expandidos:    new Set(),
};

// ── RENDER PRINCIPAL ──────────────────────────
function renderTimeline(colaboradorId, colaboradorNome) {
  _tlState.colaboradorId = colaboradorId || 'demo';

  return `
<div class="tl-root" id="tl-root">

  <!-- CABEÇALHO ──────────────────────────────── -->
  <div class="tl-header">
    <div class="tl-header-left">
      <div class="tl-header-icon">⏱️</div>
      <div>
        <h2 class="tl-header-titulo">Timeline do Colaborador</h2>
        <p class="tl-header-sub">${colaboradorNome || 'Histórico completo de eventos'}</p>
      </div>
    </div>
    <div class="tl-header-actions">
      <button class="tl-btn-add" onclick="tlAbrirModalEvento()">+ Registrar Evento</button>
      <button class="tl-btn-export" onclick="tlExportar()">⬇ Exportar</button>
    </div>
  </div>

  <!-- FILTROS ─────────────────────────────────── -->
  <div class="tl-filters">
    <div class="tl-search-wrap">
      <span class="tl-search-icon">🔍</span>
      <input type="text" id="tl-busca" class="tl-search-input"
        placeholder="Buscar eventos..."
        oninput="tlFiltrar()" />
    </div>

    <div class="tl-filter-pills">
      <button class="tl-pill ativo" data-grupo="todos" onclick="tlFiltrarGrupo(this,'todos')">Todos</button>
      <button class="tl-pill" data-grupo="carreira"      onclick="tlFiltrarGrupo(this,'carreira')">📈 Carreira</button>
      <button class="tl-pill" data-grupo="desempenho"    onclick="tlFiltrarGrupo(this,'desempenho')">🎯 Desempenho</button>
      <button class="tl-pill" data-grupo="desenvolvimento" onclick="tlFiltrarGrupo(this,'desenvolvimento')">🎓 T&D</button>
      <button class="tl-pill" data-grupo="ausencia"      onclick="tlFiltrarGrupo(this,'ausencia')">🏖️ Ausências</button>
      <button class="tl-pill" data-grupo="ocorrencia"    onclick="tlFiltrarGrupo(this,'ocorrencia')">📌 Ocorrências</button>
      <button class="tl-pill" data-grupo="administrativo" onclick="tlFiltrarGrupo(this,'administrativo')">📋 Admin</button>
    </div>

    <label class="tl-toggle-privado">
      <input type="checkbox" id="tl-privado" onchange="tlFiltrar()" />
      🔒 Incluir confidenciais
    </label>
  </div>

  <!-- ESTATÍSTICAS RÁPIDAS ──────────────────── -->
  <div class="tl-stats" id="tl-stats"></div>

  <!-- LINHA DO TEMPO ──────────────────────────── -->
  <div class="tl-body" id="tl-body">
    ${tlRenderEventos()}
  </div>

</div>

<!-- MODAL NOVO EVENTO ───────────────────────── -->
<div id="tl-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:none;align-items:center;justify-content:center">
  <div class="tl-modal">
    <div class="tl-modal-hd">
      <h3>📌 Registrar Evento</h3>
      <button onclick="tlFecharModal()" class="tl-modal-close">✕</button>
    </div>
    <div class="tl-modal-body">
      <div class="tl-form-row">
        <label>Tipo de evento</label>
        <select id="tl-novo-tipo" onchange="tlAtualizarIcone(this)">
          ${Object.entries(TL_TIPOS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="tl-form-row">
        <label>Título <span style="color:#ef4444">*</span></label>
        <input type="text" id="tl-novo-titulo" placeholder="Ex: Promoção para Analista Sênior" />
      </div>
      <div class="tl-form-row">
        <label>Data</label>
        <input type="date" id="tl-novo-data" value="${new Date().toISOString().slice(0,10)}" />
      </div>
      <div class="tl-form-row">
        <label>Descrição</label>
        <textarea id="tl-novo-desc" rows="3" placeholder="Detalhes do evento..."></textarea>
      </div>
      <div class="tl-form-row">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="tl-novo-privado" /> Confidencial (apenas RH e Gestor)
        </label>
      </div>
      <button class="tl-btn-add" style="width:100%" onclick="tlSalvarEvento()">✅ Registrar</button>
    </div>
  </div>
</div>`;
}

// ── Renderiza eventos filtrados ───────────────
function tlRenderEventos() {
  const eventos = _tlFiltrados();

  // Stats
  setTimeout(() => {
    const statsEl = document.getElementById('tl-stats');
    if (statsEl) {
      const todos  = TimelineDB.get(_tlState.colaboradorId || 'demo');
      const grupos = {};
      todos.forEach(e => { const g = TL_TIPOS[e.tipo]?.grupo || 'outro'; grupos[g] = (grupos[g]||0)+1; });
      statsEl.innerHTML = [
        { label:'Total',       val: todos.length,                      cor:'#2563eb' },
        { label:'Carreira',    val: grupos.carreira    || 0,           cor:'#7c3aed' },
        { label:'Desempenho',  val: grupos.desempenho  || 0,           cor:'#16a34a' },
        { label:'Treinamentos',val: grupos.desenvolvimento || 0,        cor:'#d97706' },
        { label:'Ocorrências', val: grupos.ocorrencia  || 0,           cor:'#dc2626' },
      ].map(s => `
        <div class="tl-stat-card">
          <div class="tl-stat-val" style="color:${s.cor}">${s.val}</div>
          <div class="tl-stat-label">${s.label}</div>
        </div>`).join('');
    }
  }, 0);

  if (eventos.length === 0) {
    return `
      <div class="tl-empty">
        <div style="font-size:48px">📭</div>
        <h3>Nenhum evento encontrado</h3>
        <p>Tente ajustar os filtros ou registre um novo evento.</p>
      </div>`;
  }

  // Agrupa por ano
  const porAno = {};
  eventos.forEach(e => {
    const ano = new Date(e.data).getFullYear();
    if (!porAno[ano]) porAno[ano] = [];
    porAno[ano].push(e);
  });

  return Object.entries(porAno)
    .sort(([a],[b]) => b - a)
    .map(([ano, evts]) => `
      <div class="tl-ano-grupo">
        <div class="tl-ano-label">${ano}</div>
        <div class="tl-ano-linha"></div>
        ${evts.map(ev => tlRenderEvento(ev)).join('')}
      </div>`)
    .join('');
}

function tlRenderEvento(ev) {
  const tipo     = TL_TIPOS[ev.tipo] || { icon:'📌', label:'Evento', cor:'#64748b' };
  const data     = new Date(ev.data);
  const dataFmt  = data.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
  const expandido= _tlState.expandidos.has(ev.id);
  const isPrivado= ev.privado;

  const dadosHtml = ev.dados ? Object.entries(ev.dados)
    .filter(([,v]) => v !== null && v !== undefined)
    .map(([k,v]) => {
      const label = k.replace(/_/g,' ').replace(/\b\w/g, l=>l.toUpperCase());
      let val = typeof v === 'object' ? JSON.stringify(v) : String(v);
      if (k.includes('salario') || k.includes('liquido')) val = `R$ ${parseFloat(val).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
      if (k.includes('percentual')) val = `${val}%`;
      if (k === 'recomenda_efetivacao') val = v ? '✅ Sim' : '❌ Não';
      return `<div class="tl-dado-item"><span class="tl-dado-key">${label}</span><span class="tl-dado-val">${val}</span></div>`;
    }).join('') : '';

  return `
<div class="tl-evento ${isPrivado?'tl-evento-privado':''}" id="tlev-${ev.id}">
  <!-- Marcador na linha -->
  <div class="tl-marcador" style="border-color:${tipo.cor};background:${tipo.cor}18">
    <span class="tl-marcador-icon">${tipo.icon}</span>
  </div>

  <!-- Card do evento -->
  <div class="tl-card" onclick="tlToggleExpandir('${ev.id}')">
    <div class="tl-card-hd">
      <div class="tl-card-left">
        <span class="tl-tipo-chip" style="background:${tipo.cor}18;color:${tipo.cor};border-color:${tipo.cor}30">
          ${tipo.icon} ${tipo.label}
        </span>
        ${isPrivado ? '<span class="tl-privado-chip">🔒 Confidencial</span>' : ''}
      </div>
      <div class="tl-card-right">
        <span class="tl-data-badge">📅 ${dataFmt}</span>
        <button class="tl-expand-btn">${expandido ? '▲' : '▼'}</button>
      </div>
    </div>

    <div class="tl-card-titulo">${ev.titulo}</div>
    <div class="tl-card-desc">${ev.descricao || ''}</div>

    ${expandido && dadosHtml ? `
    <div class="tl-dados-grid">
      ${dadosHtml}
    </div>` : ''}

    <div class="tl-card-footer">
      <span class="tl-autor">👤 ${ev.autor || 'Sistema'}</span>
      ${Auth?.isRH?.() ? `<button class="tl-del-btn" onclick="event.stopPropagation();tlRemoverEvento('${ev.id}')">🗑️</button>` : ''}
    </div>
  </div>
</div>`;
}

// ── Filtros ───────────────────────────────────
function _tlFiltrados() {
  const todos = TimelineDB.get(_tlState.colaboradorId || 'demo');
  return todos.filter(ev => {
    const tipo = TL_TIPOS[ev.tipo] || {};
    if (_tlState.filtroGrupo !== 'todos' && tipo.grupo !== _tlState.filtroGrupo) return false;
    if (!_tlState.mostrarPrivados && ev.privado) return false;
    if (_tlState.busca) {
      const q = _tlState.busca.toLowerCase();
      if (!ev.titulo.toLowerCase().includes(q) && !(ev.descricao||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

window.tlFiltrar = function() {
  _tlState.busca          = document.getElementById('tl-busca')?.value || '';
  _tlState.mostrarPrivados= document.getElementById('tl-privado')?.checked || false;
  _atualizar();
};

window.tlFiltrarGrupo = function(btn, grupo) {
  _tlState.filtroGrupo = grupo;
  document.querySelectorAll('.tl-pill').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  _atualizar();
};

window.tlToggleExpandir = function(id) {
  if (_tlState.expandidos.has(id)) _tlState.expandidos.delete(id);
  else _tlState.expandidos.add(id);
  _atualizar();
};

function _atualizar() {
  const body = document.getElementById('tl-body');
  if (body) body.innerHTML = tlRenderEventos();
}

// ── Modal novo evento ──────────────────────────
window.tlAbrirModalEvento = function() {
  const el = document.getElementById('tl-modal-overlay');
  if (el) { el.style.display = 'flex'; }
};

window.tlFecharModal = function() {
  const el = document.getElementById('tl-modal-overlay');
  if (el) { el.style.display = 'none'; }
};

window.tlSalvarEvento = function() {
  const tipo    = document.getElementById('tl-novo-tipo')?.value;
  const titulo  = document.getElementById('tl-novo-titulo')?.value?.trim();
  const data    = document.getElementById('tl-novo-data')?.value;
  const desc    = document.getElementById('tl-novo-desc')?.value?.trim();
  const privado = document.getElementById('tl-novo-privado')?.checked;

  if (!titulo) { if(window.Toast) Toast.aviso('Informe o título do evento.'); return; }

  TimelineDB.add(_tlState.colaboradorId || 'demo', {
    tipo, titulo, data: data ? new Date(data).toISOString() : new Date().toISOString(),
    descricao: desc, autor: PortalUser?.nome?.() || Auth?.nome?.() || 'RH',
    privado,
  });

  tlFecharModal();
  _atualizar();
  if (window.Toast) Toast.success('Evento registrado na timeline!');
};

window.tlRemoverEvento = function(id) {
  if (!confirm('Remover este evento?')) return;
  const eventos = TimelineDB.get(_tlState.colaboradorId || 'demo').filter(e => e.id !== id);
  localStorage.setItem(`${TimelineDB.KEY}_${_tlState.colaboradorId || 'demo'}`, JSON.stringify(eventos));
  _atualizar();
};

window.tlExportar = function() {
  const eventos = _tlFiltrados();
  const csv = ['Data,Tipo,Título,Descrição,Autor,Confidencial',
    ...eventos.map(e => [
      new Date(e.data).toLocaleDateString('pt-BR'),
      TL_TIPOS[e.tipo]?.label || e.tipo,
      `"${e.titulo}"`,
      `"${(e.descricao||'').replace(/"/g,'""')}"`,
      e.autor || 'Sistema',
      e.privado ? 'Sim' : 'Não',
    ].join(','))
  ].join('\n');

  const blob = new Blob(['﻿'+csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `timeline_${_tlState.colaboradorId}.csv`; a.click();
  URL.revokeObjectURL(url);
};

// initPage hook
function initPage_timeline() {
  _tlState = { colaboradorId:'demo', filtroTipo:'todos', filtroGrupo:'todos', busca:'', mostrarPrivados:false, expandidos:new Set() };
}
