// =============================================
// MÓDULO: SERVIÇOS RH — servicos.js
// Padrão: renderServicos() retorna HTML string
// initPage_servicos() inicializa eventos
// =============================================

// ─── DADOS ────────────────────────────────────────

const SERVICOS_CATALOGO = [
  { id: 1,  cat: 'documentos',  nome: 'Declaração de vínculo',     desc: 'Comprovante de vínculo empregatício para uso externo',        sla: '1 dia'     },
  { id: 2,  cat: 'documentos',  nome: 'Holerite',                  desc: 'Download do contracheque de qualquer mês disponível',         sla: 'Automático' },
  { id: 3,  cat: 'documentos',  nome: 'Informe de rendimentos',    desc: 'Documento anual para declaração de imposto de renda',         sla: '2 dias'    },
  { id: 4,  cat: 'ferias',      nome: 'Solicitação de férias',     desc: 'Solicite período de férias com aprovação do gestor',          sla: '3 dias'    },
  { id: 5,  cat: 'ferias',      nome: 'Venda de férias',           desc: 'Converta até 10 dias em abono pecuniário',                    sla: '5 dias'    },
  { id: 6,  cat: 'financeiro',  nome: 'Adiantamento salarial',     desc: 'Solicite adiantamento de até 40% do salário vigente',         sla: '2 dias'    },
  { id: 7,  cat: 'financeiro',  nome: 'Alteração dados bancários', desc: 'Atualize conta para depósito de salário e benefícios',        sla: '3 dias'    },
  { id: 8,  cat: 'saude',       nome: 'Envio de atestado',         desc: 'Registre atestado médico com upload do documento',            sla: '1 dia'     },
  { id: 9,  cat: 'saude',       nome: 'Solicitação de afastamento',desc: 'Inicie processo de afastamento por motivo de saúde',          sla: '2 dias'    },
  { id: 10, cat: 'treinamento', nome: 'Inscrição em treinamento',  desc: 'Inscreva-se em cursos internos ou solicite curso externo',    sla: '5 dias'    },
  { id: 11, cat: 'treinamento', nome: 'Histórico de treinamentos', desc: 'Consulte todos os cursos realizados e certificados',          sla: 'Automático'},
  { id: 12, cat: 'documentos',  nome: 'Ouvidoria / Sugestão',      desc: 'Canal anônimo ou identificado para comunicações internas',    sla: '5 dias'    },
];

const SERVICOS_COR = {
  documentos:  { bg: '#EEEDFE', icon: '#534AB7' },
  ferias:      { bg: '#FAEEDA', icon: '#854F0B' },
  financeiro:  { bg: '#E1F5EE', icon: '#0F6E56' },
  saude:       { bg: '#E6F1FB', icon: '#185FA5' },
  treinamento: { bg: '#EAF3DE', icon: '#3B6D11' },
};

const SERVICOS_MINHAS = [
  { nome: 'Solicitação de férias',    detalhe: '15 dias — Jul/2025',  tipo: 'Férias',     data: '14/06', status: 'review',   slaP: 60,  slaLabel: '2d restantes',  slaCor: '#185FA5' },
  { nome: 'Declaração de vínculo',    detalhe: 'Para banco — Caixa',  tipo: 'Documentos', data: '12/06', status: 'pending',  slaP: 85,  slaLabel: '4h restantes',  slaCor: '#EF9F27' },
  { nome: 'Adiantamento salarial',    detalhe: 'R$ 1.500,00',         tipo: 'Financeiro', data: '08/06', status: 'done',     slaP: 100, slaLabel: 'Dentro do SLA', slaCor: '#1D9E75' },
  { nome: 'Envio de atestado',        detalhe: 'Falta dia 10/06',     tipo: 'Saúde',      data: '11/06', status: 'done',     slaP: 100, slaLabel: 'Dentro do SLA', slaCor: '#1D9E75' },
  { nome: 'Inscrição em treinamento', detalhe: 'Power BI Avançado',   tipo: 'Treinamento',data: '05/06', status: 'rejected', slaP: 0,   slaLabel: 'Recusado',      slaCor: '#E24B4A' },
];

const SERVICOS_APROVACOES = [
  { iniciais: 'JC', nome: 'Julia Costa',   tipo: 'Férias · 10 dias · 01–10/Jul',    bg: '#EEEDFE', txt: '#3C3489' },
  { iniciais: 'RP', nome: 'Rafael Pinto',  tipo: 'Treinamento · Power BI Avançado', bg: '#E1F5EE', txt: '#0F6E56' },
  { iniciais: 'BS', nome: 'Beatriz Silva', tipo: 'Adiantamento · R$ 800,00',         bg: '#FAEEDA', txt: '#854F0B' },
];

const SERVICOS_VOLUME = [
  { nome: 'Documentos',  count: 24, pct: 80, cor: '#534AB7' },
  { nome: 'Férias',      count: 18, pct: 60, cor: '#EF9F27' },
  { nome: 'Financeiro',  count: 15, pct: 50, cor: '#1D9E75' },
  { nome: 'Saúde',       count: 9,  pct: 30, cor: '#378ADD' },
  { nome: 'Treinamento', count: 6,  pct: 20, cor: '#639922' },
];

const SERVICOS_ADMIN = [
  { iniciais: 'JC', nome: 'Julia Costa',   setor: 'TI · Gestor: Paulo',      tipo: 'Férias 10d',  prioridade: 'high',   status: 'review',  bg: '#EEEDFE', txt: '#3C3489' },
  { iniciais: 'TM', nome: 'Thiago Melo',   setor: 'Comercial · Gestor: Ana', tipo: 'Adiantamento',prioridade: 'urgent', status: 'pending', bg: '#FAEEDA', txt: '#854F0B' },
  { iniciais: 'LS', nome: 'Larissa Santos',setor: 'RH · Gestor: Clara',      tipo: 'Declaração',  prioridade: 'normal', status: 'done',    bg: '#E1F5EE', txt: '#0F6E56' },
];

const SERVICOS_AUDIT = [
  { cor: '#1D9E75', acao: 'Solicitação #0312 aprovada por <strong>Ana Carvalho (RH)</strong>',    meta: 'Férias — Julia Costa',       hora: 'Hoje 14:32'  },
  { cor: '#534AB7', acao: 'Solicitação #0311 criada por <strong>Thiago Melo</strong>',            meta: 'Adiantamento · R$ 800,00',   hora: 'Hoje 13:10'  },
  { cor: '#E24B4A', acao: 'Solicitação #0309 reprovada por <strong>Paulo Rocha (Gestor)</strong>',meta: 'Treinamento — Rafael Pinto',  hora: 'Hoje 11:55'  },
  { cor: '#EF9F27', acao: 'SLA vencido — solicitação #0305 escalonada para RH',                   meta: 'Declaração — Bruno Farias',   hora: 'Hoje 09:00'  },
  { cor: '#1D9E75', acao: 'Solicitação #0304 concluída automaticamente',                          meta: 'Holerite — Marcos Alves',     hora: 'Ontem 17:45' },
];

const STATUS_LABEL = {
  pending:  { label: 'Pendente',   cls: 'srv-badge srv-badge--pending'  },
  review:   { label: 'Em análise', cls: 'srv-badge srv-badge--review'   },
  done:     { label: 'Concluído',  cls: 'srv-badge srv-badge--done'     },
  rejected: { label: 'Reprovado',  cls: 'srv-badge srv-badge--rejected' },
};

const PRIORITY_LABEL = {
  normal: { label: 'Normal', cls: 'srv-badge srv-badge--done'     },
  high:   { label: 'Alta',   cls: 'srv-badge srv-badge--pending'  },
  urgent: { label: 'Urgente',cls: 'srv-badge srv-badge--rejected' },
};

// ─── HELPERS HTML ─────────────────────────────────

function _srvCatLabel(cat) {
  const map = { documentos: 'Documentos', ferias: 'Férias', financeiro: 'Financeiro', saude: 'Saúde', treinamento: 'Treinamento' };
  return map[cat] || cat;
}

function _srvCatalogCards(filtro) {
  return SERVICOS_CATALOGO
    .filter(i => filtro === 'todos' || i.cat === filtro)
    .map(i => {
      const c = SERVICOS_COR[i.cat] || SERVICOS_COR.documentos;
      return `
        <div class="srv-cat-card" data-id="${i.id}" data-nome="${i.nome}">
          <div class="srv-cat-icon" style="background:${c.bg};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="${c.icon}" stroke-width="1.8"/>
              <path d="M8 12h8M8 8h5M8 16h6" stroke="${c.icon}" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="srv-cat-name">${i.nome}</div>
          <div class="srv-cat-desc">${i.desc}</div>
          <div class="srv-cat-meta">${_srvCatLabel(i.cat)} · SLA ${i.sla}</div>
        </div>`;
    }).join('');
}

function _srvMinhasRows() {
  return SERVICOS_MINHAS.map((s, idx) => {
    const st = STATUS_LABEL[s.status];
    return `
      <div class="srv-table-row">
        <div>
          <div class="srv-td">${s.nome}</div>
          <div class="srv-td-sub">${s.detalhe}</div>
        </div>
        <div class="srv-td">${s.tipo}</div>
        <div class="srv-td">${s.data}</div>
        <div><span class="${st.cls}">${st.label}</span></div>
        <div>
          <div class="srv-sla-bar"><div class="srv-sla-fill" style="width:${s.slaP}%;background:${s.slaCor};"></div></div>
          <div class="srv-td-sub">${s.slaLabel}</div>
        </div>
      </div>`;
  }).join('');
}

function _srvAprovacoes() {
  return SERVICOS_APROVACOES.map((a, i) => `
    <div class="srv-aprov-item" id="srv-aprov-${i}">
      <div class="srv-req-avatar" style="background:${a.bg};color:${a.txt};">${a.iniciais}</div>
      <div class="srv-aprov-info">
        <div class="srv-aprov-name">${a.nome}</div>
        <div class="srv-aprov-type">${a.tipo}</div>
      </div>
      <div class="srv-aprov-actions">
        <button class="srv-btn srv-btn--success srv-btn--sm" onclick="srvAprovar(${i}, true)">Sim</button>
        <button class="srv-btn srv-btn--danger  srv-btn--sm" onclick="srvAprovar(${i}, false)">Não</button>
      </div>
    </div>`).join('');
}

function _srvVolume() {
  return SERVICOS_VOLUME.map(v => `
    <div class="srv-vol-item">
      <div class="srv-vol-dot" style="background:${v.cor};"></div>
      <div class="srv-vol-name">${v.nome}</div>
      <div class="srv-vol-bar-wrap"><div class="srv-vol-bar" style="width:${v.pct}%;background:${v.cor};"></div></div>
      <div class="srv-vol-count">${v.count}</div>
    </div>`).join('');
}

function _srvMetrics(arr) {
  return arr.map(m => `
    <div class="srv-metric-card">
      <div class="srv-metric-label">${m.label}</div>
      <div class="srv-metric-value">${m.valor}</div>
      <div class="srv-metric-sub ${m.subCls || ''}">${m.sub}</div>
    </div>`).join('');
}

function _srvAdminRows() {
  return SERVICOS_ADMIN.map((r, i) => {
    const st = STATUS_LABEL[r.status];
    const pr = PRIORITY_LABEL[r.prioridade];
    const btn = r.status !== 'done'
      ? `<button class="srv-btn srv-btn--success srv-btn--sm" onclick="srvAdminAprovar(${i})">Aprovar</button>`
      : `<span class="srv-td-sub">—</span>`;
    return `
      <div class="srv-table-row" id="srv-admin-row-${i}">
        <div class="srv-requester">
          <div class="srv-req-avatar" style="background:${r.bg};color:${r.txt};">${r.iniciais}</div>
          <div>
            <div class="srv-td">${r.nome}</div>
            <div class="srv-td-sub">${r.setor}</div>
          </div>
        </div>
        <div class="srv-td">${r.tipo}</div>
        <div><span class="${pr.cls}">${pr.label}</span></div>
        <div><span class="${st.cls}">${st.label}</span></div>
        <div>${btn}</div>
      </div>`;
  }).join('');
}

function _srvAudit() {
  return SERVICOS_AUDIT.map(a => `
    <div class="srv-audit-row">
      <div class="srv-audit-dot" style="background:${a.cor};"></div>
      <div class="srv-audit-content">
        <div class="srv-audit-action">${a.acao}</div>
        <div class="srv-audit-meta">${a.meta}</div>
      </div>
      <div class="srv-audit-time">${a.hora}</div>
    </div>`).join('');
}

// ─── RENDER PRINCIPAL ─────────────────────────────
// Chamado pelo app.js via pages['servicos']

function renderServicos() {
  return `
<div class="srv-root">

  <!-- TABS DE NAVEGAÇÃO INTERNA -->
  <div class="srv-tabs">
    <button class="srv-tab active" data-tab="catalogo">Catálogo</button>
    <button class="srv-tab" data-tab="minhas">Minhas Solicitações <span class="srv-tab-badge">5</span></button>
    <button class="srv-tab" data-tab="gestor">Painel Gestor</button>
    <button class="srv-tab" data-tab="admin">Administração</button>
    <button class="srv-tab" data-tab="auditoria">Auditoria</button>
    <button class="srv-btn srv-btn--primary" onclick="srvAbrirModal(null)" style="margin-left:auto;">+ Nova Solicitação</button>
  </div>

  <!-- TAB: CATÁLOGO -->
  <div class="srv-view active" id="srv-tab-catalogo">
    <div class="srv-filter-row" id="srv-filter-cat">
      <div class="srv-chip active" data-cat="todos">Todos</div>
      <div class="srv-chip" data-cat="documentos">Documentos</div>
      <div class="srv-chip" data-cat="financeiro">Financeiro</div>
      <div class="srv-chip" data-cat="ferias">Férias</div>
      <div class="srv-chip" data-cat="saude">Saúde</div>
      <div class="srv-chip" data-cat="treinamento">Treinamento</div>
    </div>
    <div class="srv-catalog-grid" id="srv-catalog-grid">
      ${_srvCatalogCards('todos')}
    </div>
  </div>

  <!-- TAB: MINHAS SOLICITAÇÕES -->
  <div class="srv-view" id="srv-tab-minhas">
    <div class="srv-card-table">
      <div class="srv-table-header">
        <div class="srv-th">Solicitação</div>
        <div class="srv-th">Tipo</div>
        <div class="srv-th">Data</div>
        <div class="srv-th">Status</div>
        <div class="srv-th">SLA</div>
      </div>
      <div id="srv-minhas-rows">${_srvMinhasRows()}</div>
    </div>
  </div>

  <!-- TAB: GESTOR -->
  <div class="srv-view" id="srv-tab-gestor">
    <div class="srv-metrics-row">
      ${_srvMetrics([
        { label: 'Pendentes aprovação', valor: '7',    sub: '+2 hoje',           subCls: 'srv-up' },
        { label: 'SLA cumprido',        valor: '91%',  sub: '+4% vs mês ant.',   subCls: 'srv-up' },
        { label: 'Absenteísmo',         valor: '3,2%', sub: '+0,8% vs mês ant.', subCls: 'srv-down' },
        { label: 'Headcount',           valor: '24',   sub: '2 em férias',       subCls: '' },
      ])}
    </div>
    <div class="srv-panel-grid">
      <div class="srv-panel-card">
        <div class="srv-panel-title">Aprovações pendentes</div>
        <div id="srv-aprovacoes">${_srvAprovacoes()}</div>
      </div>
      <div class="srv-panel-card">
        <div class="srv-panel-title">Volume por categoria</div>
        <div>${_srvVolume()}</div>
      </div>
    </div>
  </div>

  <!-- TAB: ADMIN -->
  <div class="srv-view" id="srv-tab-admin">
    <div class="srv-metrics-row">
      ${_srvMetrics([
        { label: 'Total em aberto', valor: '34',   sub: '↑ 5 vs ontem',        subCls: 'srv-up'   },
        { label: 'SLA atrasado',    valor: '3',    sub: 'Requer atenção',       subCls: 'srv-down' },
        { label: 'Tempo médio',     valor: '1,4d', sub: '↓ 0,3d vs mês ant.',  subCls: 'srv-up'   },
        { label: 'Satisfação',      valor: '4,7',  sub: 'de 5,0',              subCls: ''         },
      ])}
    </div>
    <div class="srv-section-title">Central de aprovação</div>
    <div class="srv-card-table">
      <div class="srv-table-header srv-table-header--admin">
        <div class="srv-th">Solicitante</div>
        <div class="srv-th">Tipo</div>
        <div class="srv-th">Prioridade</div>
        <div class="srv-th">Status</div>
        <div class="srv-th">Ação</div>
      </div>
      <div id="srv-admin-rows">${_srvAdminRows()}</div>
    </div>
  </div>

  <!-- TAB: AUDITORIA -->
  <div class="srv-view" id="srv-tab-auditoria">
    <div class="srv-section-title">Log de auditoria</div>
    <div class="srv-card-table" id="srv-audit-list">
      ${_srvAudit()}
    </div>
  </div>

</div>

<!-- MODAL NOVA SOLICITAÇÃO -->
<div class="srv-modal-overlay" id="srv-modal-overlay">
  <div class="srv-modal">
    <div class="srv-modal-title">Nova Solicitação</div>
    <div class="srv-form-group">
      <label class="srv-form-label">Tipo de serviço</label>
      <select class="srv-form-select" id="srv-modal-tipo">
        <option value="">Selecione...</option>
        <option>Declaração de vínculo</option>
        <option>Holerite</option>
        <option>Informe de rendimentos</option>
        <option>Solicitação de férias</option>
        <option>Venda de férias</option>
        <option>Adiantamento salarial</option>
        <option>Alteração de dados bancários</option>
        <option>Envio de atestado médico</option>
        <option>Afastamento</option>
        <option>Inscrição em treinamento</option>
        <option>Ouvidoria</option>
      </select>
    </div>
    <div class="srv-form-group">
      <label class="srv-form-label">Descrição / detalhes</label>
      <textarea class="srv-form-textarea" id="srv-modal-desc" placeholder="Descreva sua solicitação..."></textarea>
    </div>
    <div class="srv-form-group">
      <label class="srv-form-label">Anexo (opcional)</label>
      <input type="file" class="srv-form-input" id="srv-modal-anexo" />
    </div>
    <div class="srv-modal-actions">
      <button class="srv-btn" onclick="srvFecharModal()">Cancelar</button>
      <button class="srv-btn srv-btn--primary" onclick="srvEnviar()">Enviar solicitação</button>
    </div>
  </div>
</div>
  `;
}

// ─── INIT DA PÁGINA ───────────────────────────────
// Chamado pelo app.js via initPage_servicos() após injetar o HTML

window.initPage_servicos = function () {

  // Navegação entre tabs
  document.querySelectorAll('.srv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      if (!id) return;
      document.querySelectorAll('.srv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.srv-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      const view = document.getElementById('srv-tab-' + id);
      if (view) view.classList.add('active');
    });
  });

  // Filtro do catálogo
  const filterRow = document.getElementById('srv-filter-cat');
  if (filterRow) {
    filterRow.addEventListener('click', e => {
      const chip = e.target.closest('.srv-chip');
      if (!chip) return;
      filterRow.querySelectorAll('.srv-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      const grid = document.getElementById('srv-catalog-grid');
      if (grid) grid.innerHTML = _srvCatalogCards(cat);
      // re-bind click nos cards
      _bindCatalogCards();
    });
  }

  // Click nos cards do catálogo
  _bindCatalogCards();

  // Fecha modal clicando fora
  const overlay = document.getElementById('srv-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) srvFecharModal();
    });
  }
};

function _bindCatalogCards() {
  document.querySelectorAll('.srv-cat-card').forEach(card => {
    card.addEventListener('click', () => srvAbrirModal(card.dataset.nome));
  });
}

// ─── AÇÕES GLOBAIS ────────────────────────────────
// Precisam ser globais pois são chamadas via onclick no HTML gerado

window.srvAbrirModal = function (tipo) {
  const sel = document.getElementById('srv-modal-tipo');
  if (sel && tipo) {
    for (const opt of sel.options) {
      if (opt.text === tipo) { opt.selected = true; break; }
    }
  } else if (sel) {
    sel.selectedIndex = 0;
  }
  const desc = document.getElementById('srv-modal-desc');
  if (desc) desc.value = '';
  const overlay = document.getElementById('srv-modal-overlay');
  if (overlay) overlay.classList.add('active');
};

window.srvFecharModal = function () {
  const overlay = document.getElementById('srv-modal-overlay');
  if (overlay) overlay.classList.remove('active');
};

window.srvEnviar = function () {
  const tipo = document.getElementById('srv-modal-tipo')?.value;
  if (!tipo) { alert('Selecione o tipo de serviço.'); return; }

  srvFecharModal();
  srvToast('Solicitação enviada com sucesso!');

  // Adiciona na lista
  const hoje = new Date().toLocaleDateString('pt-BR').substring(0, 5);
  SERVICOS_MINHAS.unshift({ nome: tipo, detalhe: 'Nova solicitação', tipo: 'Geral', data: hoje, status: 'pending', slaP: 0, slaLabel: 'Aguardando', slaCor: '#EF9F27' });

  const rows = document.getElementById('srv-minhas-rows');
  if (rows) rows.innerHTML = _srvMinhasRows();

  // Atualiza badge da tab
  const badge = document.querySelector('.srv-tab-badge');
  if (badge) badge.textContent = SERVICOS_MINHAS.length;
};

window.srvAprovar = function (idx, aprovado) {
  const el = document.getElementById('srv-aprov-' + idx);
  if (!el) return;
  el.style.opacity = '0.4';
  el.style.pointerEvents = 'none';
  srvToast(aprovado ? 'Aprovação registrada!' : 'Solicitação reprovada.');
};

window.srvAdminAprovar = function (idx) {
  const row = document.getElementById('srv-admin-row-' + idx);
  if (!row) return;
  const badges = row.querySelectorAll('.srv-badge');
  const lastBadge = badges[badges.length - 1];
  if (lastBadge) {
    lastBadge.className = 'srv-badge srv-badge--done';
    lastBadge.textContent = 'Concluído';
  }
  const btn = row.querySelector('.srv-btn--success');
  if (btn) btn.remove();
  srvToast('Solicitação aprovada!');
};

function srvToast(msg) {
  let toast = document.getElementById('srv-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'srv-toast';
    toast.className = 'srv-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('active');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('active'), 3000);
}
