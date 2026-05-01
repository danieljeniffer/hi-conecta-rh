// =============================================
// CARGOS & ESTRUTURA — MÓDULO COMPLETO
// =============================================

const cargosData = {
  cargos: [
    { id: 1,  titulo: 'CEO / Diretor Geral',         nivel: 'C-Level',    depto: 'Diretoria',  cbo: '1231-10', faixaMin: 20000, faixaMax: 50000, colaboradores: 1,  status: 'Ativo' },
    { id: 2,  titulo: 'Diretor de RH',                nivel: 'Diretoria',  depto: 'RH',         cbo: '1232-10', faixaMin: 12000, faixaMax: 25000, colaboradores: 1,  status: 'Ativo' },
    { id: 3,  titulo: 'Coordenadora de RH',           nivel: 'Liderança',  depto: 'RH',         cbo: '2521-05', faixaMin: 5000,  faixaMax: 10000, colaboradores: 1,  status: 'Ativo' },
    { id: 4,  titulo: 'Analista de RH',               nivel: 'Técnico',    depto: 'RH',         cbo: '2521-05', faixaMin: 3000,  faixaMax: 6000,  colaboradores: 1,  status: 'Ativo' },
    { id: 5,  titulo: 'Supervisor Comercial',         nivel: 'Liderança',  depto: 'Comercial',  cbo: '3541-05', faixaMin: 4500,  faixaMax: 9000,  colaboradores: 1,  status: 'Ativo' },
    { id: 6,  titulo: 'Vendedor',                     nivel: 'Operacional',depto: 'Comercial',  cbo: '3541-10', faixaMin: 1320,  faixaMax: 3000,  colaboradores: 5,  status: 'Ativo' },
    { id: 7,  titulo: 'Coordenadora Financeira',      nivel: 'Liderança',  depto: 'Financeiro', cbo: '1311-05', faixaMin: 5500,  faixaMax: 11000, colaboradores: 1,  status: 'Ativo' },
    { id: 8,  titulo: 'Assistente Financeiro',        nivel: 'Administrativo',depto:'Financeiro',cbo: '4131-05', faixaMin: 1500,  faixaMax: 3500,  colaboradores: 2,  status: 'Ativo' },
    { id: 9,  titulo: 'Caixa',                        nivel: 'Operacional',depto: 'Financeiro', cbo: '4211-10', faixaMin: 1320,  faixaMax: 2500,  colaboradores: 2,  status: 'Ativo' },
    { id: 10, titulo: 'Coordenador Operacional',      nivel: 'Liderança',  depto: 'Operações',  cbo: '3131-05', faixaMin: 4000,  faixaMax: 8500,  colaboradores: 1,  status: 'Ativo' },
    { id: 11, titulo: 'Estoquista',                   nivel: 'Operacional',depto: 'Operações',  cbo: '4141-10', faixaMin: 1320,  faixaMax: 2200,  colaboradores: 3,  status: 'Ativo' },
    { id: 12, titulo: 'Analista de TI',               nivel: 'Técnico',    depto: 'TI',         cbo: '2124-05', faixaMin: 4000,  faixaMax: 9000,  colaboradores: 2,  status: 'Ativo' },
    { id: 13, titulo: 'Desenvolvedor Front-end',      nivel: 'Técnico',    depto: 'TI',         cbo: '2124-10', faixaMin: 4500,  faixaMax: 12000, colaboradores: 1,  status: 'Ativo' },
    { id: 14, titulo: 'Gerente Comercial',            nivel: 'Liderança',  depto: 'Comercial',  cbo: '1411-10', faixaMin: 7000,  faixaMax: 15000, colaboradores: 0,  status: 'Vaga Aberta' },
  ],

  niveis: [
    { nivel: 'C-Level',      cor: '#dc2626', bg: '#fef2f2', icon: '👑', desc: 'Diretores e fundadores'            },
    { nivel: 'Diretoria',    cor: '#7c3aed', bg: '#f5f3ff', icon: '🏛️', desc: 'Diretores de área'                },
    { nivel: 'Liderança',    cor: '#d97706', bg: '#fffbeb', icon: '👔', desc: 'Coordenadores e supervisores'       },
    { nivel: 'Técnico',      cor: '#2563eb', bg: '#eff6ff', icon: '⚙️', desc: 'Especialistas e analistas'         },
    { nivel: 'Administrativo',cor:'#0ea5e9', bg: '#f0f9ff', icon: '📋', desc: 'Assistentes e auxiliares'          },
    { nivel: 'Operacional',  cor: '#16a34a', bg: '#f0fdf4', icon: '🔧', desc: 'Executores e operadores'           },
  ],

  organograma: {
    ceo: {
      nome: 'CEO / Diretor Geral',
      filhos: [
        {
          nome: 'Diretor de RH',
          filhos: [
            { nome: 'Coordenadora de RH', filhos: [{ nome: 'Analista de RH', filhos: [] }] },
          ],
        },
        {
          nome: 'Supervisor Comercial',
          filhos: [
            { nome: 'Vendedor (×5)', filhos: [] },
            { nome: 'Gerente Comercial ⚠️ Vaga', filhos: [] },
          ],
        },
        {
          nome: 'Coordenadora Financeira',
          filhos: [
            { nome: 'Assistente Financeiro (×2)', filhos: [] },
            { nome: 'Caixa (×2)', filhos: [] },
          ],
        },
        {
          nome: 'Coordenador Operacional',
          filhos: [
            { nome: 'Estoquista (×3)', filhos: [] },
          ],
        },
        {
          nome: 'Analista de TI',
          filhos: [
            { nome: 'Desenvolvedor Front-end', filhos: [] },
          ],
        },
      ],
    },
  },

  planoCarreira: [
    {
      depto: 'Comercial', icon: '📈', cor: '#16a34a',
      trilhas: [
        { cargo: 'Vendedor',          nivel: 'Operacional', tempo: '0-2 anos',   requisitos: ['Ensino médio','CRM básico'] },
        { cargo: 'Vendedor Sênior',   nivel: 'Operacional', tempo: '2-4 anos',   requisitos: ['Ensino superior','Meta atingida 12m'] },
        { cargo: 'Supervisor',        nivel: 'Liderança',   tempo: '4-6 anos',   requisitos: ['Liderança de equipe','MBA'] },
        { cargo: 'Gerente Comercial', nivel: 'Liderança',   tempo: '6+ anos',    requisitos: ['Gestão P&L','Inglês'] },
      ],
    },
    {
      depto: 'RH', icon: '👥', cor: '#2563eb',
      trilhas: [
        { cargo: 'Assistente de RH',  nivel: 'Administrativo',tempo: '0-1 ano',  requisitos: ['Superior cursando','Excel'] },
        { cargo: 'Analista de RH',    nivel: 'Técnico',      tempo: '1-3 anos',  requisitos: ['Superior completo','HRBP'] },
        { cargo: 'Coordenador de RH', nivel: 'Liderança',    tempo: '3-5 anos',  requisitos: ['Pós-graduação','Projeto'] },
        { cargo: 'Diretor de RH',     nivel: 'Diretoria',    tempo: '5+ anos',   requisitos: ['MBA','Estratégia'] },
      ],
    },
    {
      depto: 'TI', icon: '💻', cor: '#7c3aed',
      trilhas: [
        { cargo: 'Estagiário TI',     nivel: 'Operacional',  tempo: '0-1 ano',   requisitos: ['Superior cursando','Lógica'] },
        { cargo: 'Desenvolvedor Jr',  nivel: 'Técnico',      tempo: '1-3 anos',  requisitos: ['Superior completo','Git'] },
        { cargo: 'Desenvolvedor Pl',  nivel: 'Técnico',      tempo: '3-5 anos',  requisitos: ['Especialização','Cloud'] },
        { cargo: 'Tech Lead',         nivel: 'Liderança',    tempo: '5+ anos',   requisitos: ['Arquitetura','Inglês fluente'] },
      ],
    },
  ],
};

let cargosAbaAtiva = 'tabela';

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderCargos() {
  const totalCargos = cargosData.cargos.length;
  const vagasAbertas = cargosData.cargos.filter(c => c.status === 'Vaga Aberta').length;
  const totalColabs  = cargosData.cargos.reduce((a,c) => a + c.colaboradores, 0);
  const deptos = [...new Set(cargosData.cargos.map(c => c.depto))].length;

  return `
  <div class="depto-page">

    <!-- KPIs -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">🏗️</div>
        <div class="depto-card-info"><strong>${totalCargos}</strong><span>Cargos cadastrados</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">🔍</div>
        <div class="depto-card-info"><strong>${vagasAbertas}</strong><span>Vagas abertas</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">👥</div>
        <div class="depto-card-info"><strong>${totalColabs}</strong><span>Colaboradores</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">🏢</div>
        <div class="depto-card-info"><strong>${deptos}</strong><span>Departamentos</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">💰</div>
        <div class="depto-card-info">
          <strong>R$ ${(cargosData.cargos.reduce((a,c)=>a+c.faixaMin,0)/cargosData.cargos.length/1000).toFixed(1)}k</strong>
          <span>Média faixa mínima</span>
        </div>
      </div>
    </div>

    <!-- ABAS -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchCargosTab(this,'tabela')">📋 Tabela de Cargos</button>
      <button class="exp-tab" onclick="switchCargosTab(this,'organograma')">🏗️ Organograma</button>
      <button class="exp-tab" onclick="switchCargosTab(this,'niveis')">🏆 Níveis & Faixas</button>
      <button class="exp-tab" onclick="switchCargosTab(this,'carreira')">📈 Plano de Carreira</button>
    </div>
    <div id="cargos-content" style="margin-top:4px">
      ${renderCargosTabela()}
    </div>

  </div>`;
}

function initPage_cargos() {
  const el = document.getElementById('cargos-content');
  if (el) el.innerHTML = renderCargosTabela();
}

function switchCargosTab(btn, aba) {
  cargosAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('cargos-content');
  if (!el) return;
  if (aba === 'tabela')      el.innerHTML = renderCargosTabela();
  if (aba === 'organograma') el.innerHTML = renderCargosOrganograma();
  if (aba === 'niveis')      el.innerHTML = renderCargosNiveis();
  if (aba === 'carreira')    el.innerHTML = renderCargosCarreira();
}

// ─────────────────────────────────────────────
// ABA: TABELA DE CARGOS
// ─────────────────────────────────────────────
function renderCargosTabela() {
  let cargosLista = [...cargosData.cargos];
  const nivelCor = {};
  cargosData.niveis.forEach(n => { nivelCor[n.nivel] = n.cor; });

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header" style="flex-wrap:wrap;gap:8px">
      <h3>📋 Tabela de Cargos e Salários</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" placeholder="🔍 Buscar cargo..."
          oninput="buscarCargoTabela(this.value)"
          style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none;width:180px" />
        <select id="filtro-depto-cargos" onchange="filtrarCargoDepto(this.value)"
          style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none">
          <option value="">Todos os departamentos</option>
          ${[...new Set(cargosData.cargos.map(c=>c.depto))].map(d=>`<option value="${d}">${d}</option>`).join('')}
        </select>
        <select onchange="filtrarCargoNivel(this.value)"
          style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none">
          <option value="">Todos os níveis</option>
          ${cargosData.niveis.map(n=>`<option value="${n.nivel}">${n.nivel}</option>`).join('')}
        </select>
        <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="abrirModalNovoCargo()">+ Novo Cargo</button>
        <button class="link-btn" onclick="exportarCargos()">⬇ Exportar</button>
      </div>
    </div>

    <div class="depto-section" id="cargos-tabela-container">
      <div class="table-wrap">
        <table class="depto-table">
          <thead>
            <tr>
              <th>Cargo</th><th>Nível</th><th>Departamento</th>
              <th>CBO</th><th>Faixa Mínima</th><th>Faixa Máxima</th>
              <th>Colaboradores</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="cargos-tbody">
            ${cargosLista.map(cargo => `
              <tr>
                <td><strong>${cargo.titulo}</strong></td>
                <td>
                  <span style="
                    background:${(nivelCor[cargo.nivel]||'#6b7280')}20;
                    color:${nivelCor[cargo.nivel]||'#6b7280'};
                    font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px
                  ">${cargo.nivel}</span>
                </td>
                <td>${cargo.depto}</td>
                <td style="font-size:11px;color:var(--text-muted)">${cargo.cbo}</td>
                <td style="color:var(--success);font-weight:600">R$ ${cargo.faixaMin.toLocaleString('pt-BR')}</td>
                <td style="color:var(--primary);font-weight:600">R$ ${cargo.faixaMax.toLocaleString('pt-BR')}</td>
                <td style="text-align:center">
                  <span style="font-weight:700;color:${cargo.colaboradores>0?'var(--text-primary)':'var(--text-muted)'}">${cargo.colaboradores}</span>
                </td>
                <td>
                  <span class="badge-status ${cargo.status==='Ativo'?'pago':cargo.status==='Vaga Aberta'?'pendente':'inativo'}">
                    ${cargo.status}
                  </span>
                </td>
                <td>
                  <button class="link-btn" onclick="editarCargo(${cargo.id})">✏️ Editar</button>
                  <button class="link-btn" onclick="verDetalhesCargo(${cargo.id})">🔍 Detalhes</button>
                  ${cargo.status==='Vaga Aberta'?`<button class="link-btn" onclick="abrirRecrutamentoCargo('${cargo.titulo}')">🔍 Recrutar</button>`:''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Novo Cargo -->
    <div class="modal-overlay" id="modal-novo-cargo" style="display:none" onclick="if(event.target.id==='modal-novo-cargo')this.style.display='none'">
      <div class="modal-box" style="max-width:600px">
        <div class="modal-header">
          <h3>🏗️ Novo Cargo</h3>
          <button class="modal-close" onclick="document.getElementById('modal-novo-cargo').style.display='none'">✕</button>
        </div>
        <div class="exp-form">
          <label>Título do Cargo</label>
          <input type="text" id="nc-titulo" placeholder="Ex: Analista de Marketing" />
          <div class="form-row">
            <div>
              <label>Departamento</label>
              <select id="nc-depto">
                ${[...new Set(cargosData.cargos.map(c=>c.depto))].map(d=>`<option value="${d}">${d}</option>`).join('')}
                <option value="Marketing">Marketing</option>
                <option value="Logística">Logística</option>
              </select>
            </div>
            <div>
              <label>Nível</label>
              <select id="nc-nivel">
                ${cargosData.niveis.map(n=>`<option value="${n.nivel}">${n.nivel}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div>
              <label>Faixa Salarial Mínima (R$)</label>
              <input type="number" id="nc-min" placeholder="1320" min="1320" />
            </div>
            <div>
              <label>Faixa Salarial Máxima (R$)</label>
              <input type="number" id="nc-max" placeholder="5000" />
            </div>
          </div>
          <label>Código CBO</label>
          <input type="text" id="nc-cbo" placeholder="Ex: 2521-05" />
          <div class="form-row">
            <div>
              <label>Status</label>
              <select id="nc-status"><option value="Ativo">Ativo</option><option value="Vaga Aberta">Vaga Aberta</option></select>
            </div>
            <div>
              <label>Nº de vagas</label>
              <input type="number" id="nc-vagas" value="1" min="0" />
            </div>
          </div>
          <button class="btn-primary" onclick="salvarNovoCargo()">✅ Cadastrar Cargo</button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div class="modal-overlay" id="modal-detalhe-cargo" style="display:none" onclick="if(event.target.id==='modal-detalhe-cargo')this.style.display='none'">
      <div class="modal-box" style="max-width:480px" id="modal-detalhe-cargo-content"></div>
    </div>

    <!-- Modal Editar Cargo -->
    <div class="modal-overlay" id="modal-editar-cargo" style="display:none" onclick="if(event.target.id==='modal-editar-cargo')this.style.display='none'">
      <div class="modal-box" style="max-width:580px" id="modal-editar-cargo-content"></div>
    </div>

  </div>`;
}


function abrirModalNovoCargo() {
  document.getElementById('modal-novo-cargo').style.display = 'flex';
}

function salvarNovoCargo() {
  const titulo = document.getElementById('nc-titulo')?.value.trim();
  const depto  = document.getElementById('nc-depto')?.value;
  const nivel  = document.getElementById('nc-nivel')?.value;
  const min    = parseInt(document.getElementById('nc-min')?.value) || 1320;
  const max    = parseInt(document.getElementById('nc-max')?.value) || 5000;
  const cbo    = document.getElementById('nc-cbo')?.value.trim() || '—';
  const status = document.getElementById('nc-status')?.value;
  if (!titulo || !depto) { alert('Preencha o título e o departamento!'); return; }
  cargosData.cargos.push({
    id: cargosData.cargos.length + 1, titulo, nivel, depto, cbo,
    faixaMin: min, faixaMax: max, colaboradores: 0, status,
  });
  document.getElementById('modal-novo-cargo').style.display = 'none';
  alert(`✅ Cargo "${titulo}" cadastrado com sucesso!`);
  document.getElementById('cargos-content').innerHTML = renderCargosTabela();
}

// ─────────────────────────────────────────────
// BUSCA E FILTROS
// ─────────────────────────────────────────────

let _filtroBusca = '';
let _filtroDepto = '';
let _filtroNivel = '';

function _aplicarFiltros() {
  const nivelCor = {};
  cargosData.niveis.forEach(n => { nivelCor[n.nivel] = n.cor; });

  const lista = cargosData.cargos.filter(c => {
    const matchBusca = !_filtroBusca ||
      c.titulo.toLowerCase().includes(_filtroBusca) ||
      c.depto.toLowerCase().includes(_filtroBusca) ||
      c.cbo.toLowerCase().includes(_filtroBusca);
    const matchDepto = !_filtroDepto || c.depto === _filtroDepto;
    const matchNivel = !_filtroNivel || c.nivel === _filtroNivel;
    return matchBusca && matchDepto && matchNivel;
  });

  const tbody = document.getElementById('cargos-tbody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">Nenhum cargo encontrado com os filtros aplicados.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(cargo => `
    <tr>
      <td><strong>${cargo.titulo}</strong></td>
      <td><span style="background:${(nivelCor[cargo.nivel]||'#6b7280')}20;color:${nivelCor[cargo.nivel]||'#6b7280'};font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px">${cargo.nivel}</span></td>
      <td>${cargo.depto}</td>
      <td style="font-size:11px;color:var(--text-muted)">${cargo.cbo}</td>
      <td style="color:var(--success);font-weight:600">R$ ${cargo.faixaMin.toLocaleString('pt-BR')}</td>
      <td style="color:var(--primary);font-weight:600">R$ ${cargo.faixaMax.toLocaleString('pt-BR')}</td>
      <td style="text-align:center"><span style="font-weight:700">${cargo.colaboradores}</span></td>
      <td><span class="badge-status ${cargo.status==='Ativo'?'pago':cargo.status==='Vaga Aberta'?'pendente':'inativo'}">${cargo.status}</span></td>
      <td>
        <button class="link-btn" onclick="editarCargo(${cargo.id})">✏️ Editar</button>
        <button class="link-btn" onclick="verDetalhesCargo(${cargo.id})">🔍 Detalhes</button>
        <button class="link-btn" style="color:#dc2626" onclick="excluirCargo(${cargo.id})">🗑️</button>
        ${cargo.status==='Vaga Aberta'?`<button class="link-btn" onclick="abrirRecrutamentoCargo('${cargo.titulo}')">🔍 Recrutar</button>`:''}
      </td>
    </tr>
  `).join('');
}

function buscarCargoTabela(valor) {
  _filtroBusca = valor.toLowerCase().trim();
  _aplicarFiltros();
}

function filtrarCargoDepto(depto) {
  _filtroDepto = depto;
  _aplicarFiltros();
}

function filtrarCargoNivel(nivel) {
  _filtroNivel = nivel;
  _aplicarFiltros();
}

function excluirCargo(id) {
  const cargo = cargosData.cargos.find(c => c.id === id);
  if (!cargo) return;
  if (!confirm(`Excluir o cargo "${cargo.titulo}"?\n\nEsta ação não pode ser desfeita.`)) return;
  cargosData.cargos.splice(cargosData.cargos.indexOf(cargo), 1);
  document.getElementById('cargos-content').innerHTML = renderCargosTabela();
}

// ─────────────────────────────────────────────

function editarCargo(id) {
  const cargo = cargosData.cargos.find(c => c.id === id);
  if (!cargo) return;

  // Fechar modal de detalhes se estiver aberto
  const det = document.getElementById('modal-detalhe-cargo');
  if (det) det.style.display = 'none';

  // Preenche o modal de edição
  const box = document.getElementById('modal-editar-cargo-content');
  if (!box) return;

  box.innerHTML = `
    <div class="modal-header">
      <h3>✏️ Editar Cargo</h3>
      <button class="modal-close" onclick="document.getElementById('modal-editar-cargo').style.display='none'">✕</button>
    </div>
    <div class="exp-form">
      <label>Título do Cargo</label>
      <input type="text" id="ec-titulo" value="${cargo.titulo}" />

      <div class="form-row">
        <div>
          <label>Departamento</label>
          <select id="ec-depto">
            ${[...new Set(cargosData.cargos.map(c=>c.depto))].map(d=>`
              <option value="${d}" ${d===cargo.depto?'selected':''}>${d}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label>Nível</label>
          <select id="ec-nivel">
            ${cargosData.niveis.map(n=>`
              <option value="${n.nivel}" ${n.nivel===cargo.nivel?'selected':''}>${n.nivel}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div>
          <label>Faixa Mínima (R$)</label>
          <input type="number" id="ec-min" value="${cargo.faixaMin}" min="1320" />
        </div>
        <div>
          <label>Faixa Máxima (R$)</label>
          <input type="number" id="ec-max" value="${cargo.faixaMax}" />
        </div>
      </div>

      <div class="form-row">
        <div>
          <label>Código CBO</label>
          <input type="text" id="ec-cbo" value="${cargo.cbo}" />
        </div>
        <div>
          <label>Status</label>
          <select id="ec-status">
            <option value="Ativo" ${cargo.status==='Ativo'?'selected':''}>Ativo</option>
            <option value="Vaga Aberta" ${cargo.status==='Vaga Aberta'?'selected':''}>Vaga Aberta</option>
            <option value="Inativo" ${cargo.status==='Inativo'?'selected':''}>Inativo</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn-primary" onclick="salvarEdicaoCargo(${cargo.id})">💾 Salvar Alterações</button>
        <button class="link-btn" onclick="document.getElementById('modal-editar-cargo').style.display='none'">Cancelar</button>
      </div>
    </div>`;

  document.getElementById('modal-editar-cargo').style.display = 'flex';
}

function salvarEdicaoCargo(id) {
  const cargo  = cargosData.cargos.find(c => c.id === id);
  if (!cargo) return;

  const titulo = document.getElementById('ec-titulo')?.value.trim();
  const depto  = document.getElementById('ec-depto')?.value;
  const nivel  = document.getElementById('ec-nivel')?.value;
  const min    = parseInt(document.getElementById('ec-min')?.value)  || cargo.faixaMin;
  const max    = parseInt(document.getElementById('ec-max')?.value)  || cargo.faixaMax;
  const cbo    = document.getElementById('ec-cbo')?.value.trim()    || cargo.cbo;
  const status = document.getElementById('ec-status')?.value;

  if (!titulo) { alert('O título não pode estar vazio!'); return; }
  if (min > max) { alert('A faixa mínima não pode ser maior que a máxima!'); return; }

  cargo.titulo   = titulo;
  cargo.depto    = depto;
  cargo.nivel    = nivel;
  cargo.faixaMin = min;
  cargo.faixaMax = max;
  cargo.cbo      = cbo;
  cargo.status   = status;

  document.getElementById('modal-editar-cargo').style.display = 'none';
  document.getElementById('cargos-content').innerHTML = renderCargosTabela();
}

function verDetalhesCargo(id) {
  const cargo = cargosData.cargos.find(c => c.id === id);
  if (!cargo) return;
  const nivel = cargosData.niveis.find(n => n.nivel === cargo.nivel);
  document.getElementById('modal-detalhe-cargo-content').innerHTML = `
    <div class="modal-header">
      <h3>🏗️ ${cargo.titulo}</h3>
      <button class="modal-close" onclick="document.getElementById('modal-detalhe-cargo').style.display='none'">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;padding-top:8px">
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Departamento</span><strong>${cargo.depto}</strong></div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Nível</span>
        <span style="background:${(nivel?.cor||'#6b7280')}20;color:${nivel?.cor||'#6b7280'};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;width:fit-content">${cargo.nivel}</span>
      </div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>CBO</span><strong>${cargo.cbo}</strong></div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Faixa Mínima</span><strong style="color:var(--success)">R$ ${cargo.faixaMin.toLocaleString('pt-BR')}</strong></div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Faixa Máxima</span><strong style="color:var(--primary)">R$ ${cargo.faixaMax.toLocaleString('pt-BR')}</strong></div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Colaboradores</span><strong>${cargo.colaboradores}</strong></div>
      <div class="resumo-item" style="grid-template-columns:140px 1fr"><span>Status</span>
        <span class="badge-status ${cargo.status==='Ativo'?'pago':'pendente'}">${cargo.status}</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-primary" onclick="editarCargo(${cargo.id});document.getElementById('modal-detalhe-cargo').style.display='none'">✏️ Editar</button>
        ${cargo.status==='Vaga Aberta'?`<button class="btn-aprovar" onclick="abrirRecrutamentoCargo('${cargo.titulo}')">🔍 Recrutar</button>`:''}
      </div>
    </div>`;
  document.getElementById('modal-detalhe-cargo').style.display = 'flex';
}

function abrirRecrutamentoCargo(titulo) {
  document.getElementById('modal-detalhe-cargo').style.display = 'none';
  if (typeof navigateTo === 'function') navigateTo('recrutamento');
  else alert(`🔍 Abrir Recrutamento para a vaga: ${titulo}`);
}

function exportarCargos() {
  const txt = `TABELA DE CARGOS E SALÁRIOS\n${'='.repeat(50)}\n` +
    cargosData.cargos.map(c =>
      `${c.titulo} | ${c.nivel} | ${c.depto} | R$ ${c.faixaMin.toLocaleString('pt-BR')} - R$ ${c.faixaMax.toLocaleString('pt-BR')} | ${c.status}`
    ).join('\n');
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='cargos.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// ABA: ORGANOGRAMA
// ─────────────────────────────────────────────
function renderCargosOrganograma() {
  function renderNo(no, nivel) {
    const cor = ['#dc2626','#7c3aed','#d97706','#2563eb','#16a34a','#0ea5e9'][nivel] || '#6b7280';
    const filhos = no.filhos || [];
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0">
        <div style="
          background:${cor}15;border:2px solid ${cor};border-radius:12px;
          padding:10px 18px;font-size:12px;font-weight:700;color:${cor};
          white-space:nowrap;text-align:center;cursor:default;
          box-shadow:0 2px 8px ${cor}25;max-width:200px;
          ${no.nome.includes('⚠️')?'border-style:dashed;':''}
        " title="${no.nome}">
          ${no.nome}
        </div>
        ${filhos.length > 0 ? `
          <div style="width:2px;height:20px;background:${cor}50"></div>
          <div style="display:flex;gap:16px;align-items:flex-start;position:relative">
            ${filhos.length > 1 ? `
              <div style="position:absolute;top:0;left:16px;right:16px;height:2px;background:${cor}30"></div>
            ` : ''}
            ${filhos.map(filho => renderNo(filho, nivel+1)).join('')}
          </div>
        ` : ''}
      </div>`;
  }

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>🏗️ Organograma</h3>
      <div style="display:flex;gap:8px">
        <button class="link-btn" onclick="exportarOrganograma()">⬇ Exportar</button>
        <button class="link-btn" onclick="editarOrganograma()">✏️ Editar</button>
      </div>
    </div>

    <div class="depto-section" style="overflow-x:auto">
      <div style="min-width:800px;padding:24px;display:flex;justify-content:center">
        ${renderNo({ nome: cargosData.organograma.ceo.nome, filhos: cargosData.organograma.ceo.filhos }, 0)}
      </div>
    </div>

    <!-- Legenda de Cores -->
    <div class="depto-section">
      <div class="section-header"><h3>🎨 Legenda de Níveis</h3></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">
        ${['C-Level','Diretoria','Liderança','Técnico','Administrativo','Operacional'].map((nivel,i) => {
          const cor = ['#dc2626','#7c3aed','#d97706','#2563eb','#16a34a','#0ea5e9'][i];
          return `
            <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:${cor}10;border-radius:20px;border:1px solid ${cor}30">
              <div style="width:10px;height:10px;border-radius:50%;background:${cor}"></div>
              <span style="font-size:12px;font-weight:600;color:${cor}">${nivel}</span>
            </div>`;
        }).join('')}
        <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:#fef2f2;border-radius:20px;border:2px dashed #dc2626">
          <span style="font-size:12px;color:#dc2626">⚠️ Vaga Aberta</span>
        </div>
      </div>
    </div>

  </div>`;
}

function exportarOrganograma() {
  alert('⬇ Exportando organograma...\n\nApós integração, será exportado em PDF/PNG com layout visual completo.');
}

function editarOrganograma() {
  alert('✏️ Editor de organograma.\n\nEsta funcionalidade estará disponível na versão integrada com o Bitrix24.');
}

// ─────────────────────────────────────────────
// ABA: NÍVEIS & FAIXAS
// ─────────────────────────────────────────────
function renderCargosNiveis() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>🏆 Níveis Hierárquicos e Faixas Salariais</h3>
      <button class="link-btn" onclick="exportarCargos()">⬇ Exportar</button>
    </div>

    ${cargosData.niveis.map(nivel => {
      const cargosNivel = cargosData.cargos.filter(c => c.nivel === nivel.nivel);
      const minGeral = cargosNivel.length ? Math.min(...cargosNivel.map(c=>c.faixaMin)) : 0;
      const maxGeral = cargosNivel.length ? Math.max(...cargosNivel.map(c=>c.faixaMax)) : 0;
      return `
        <div class="depto-section" style="border-left:4px solid ${nivel.cor}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:28px">${nivel.icon}</span>
              <div>
                <strong style="font-size:15px">${nivel.nivel}</strong>
                <small style="display:block;color:var(--text-muted)">${nivel.desc}</small>
              </div>
            </div>
            <div style="text-align:right">
              <strong style="font-size:13px;color:${nivel.cor}">
                R$ ${minGeral.toLocaleString('pt-BR')} — R$ ${maxGeral.toLocaleString('pt-BR')}
              </strong>
              <small style="display:block;color:var(--text-muted)">${cargosNivel.length} cargo${cargosNivel.length!==1?'s':''}</small>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${cargosNivel.map(cargo => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:${nivel.cor}08;border-radius:8px">
                <strong style="flex:2;font-size:13px">${cargo.titulo}</strong>
                <span style="flex:1;font-size:12px;color:var(--text-muted)">${cargo.depto}</span>
                <!-- Barra de faixa salarial -->
                <div style="flex:2;position:relative">
                  <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${Math.min(100,(cargo.faixaMax/maxGeral)*100)}%;background:${nivel.cor};border-radius:3px"></div>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:2px">
                    <span>R$ ${cargo.faixaMin.toLocaleString('pt-BR')}</span>
                    <span>R$ ${cargo.faixaMax.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <span style="font-size:11px;color:var(--text-muted);min-width:60px;text-align:right">${cargo.colaboradores} colab.</span>
                <span class="badge-status ${cargo.status==='Ativo'?'pago':'pendente'}" style="min-width:80px;text-align:center">${cargo.status}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }).join('')}

  </div>`;
}

// ─────────────────────────────────────────────
// ABA: PLANO DE CARREIRA
// ─────────────────────────────────────────────
function renderCargosCarreira() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>📈 Trilhas de Carreira</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="novaTrilha()">+ Nova Trilha</button>
    </div>

    ${cargosData.planoCarreira.map(plano => `
      <div class="depto-section" style="border-top:3px solid ${plano.cor}">
        <div class="section-header" style="margin-bottom:20px">
          <h3>${plano.icon} ${plano.depto}</h3>
          <button class="link-btn" onclick="editarTrilha('${plano.depto}')">✏️ Editar</button>
        </div>

        <div style="display:flex;gap:0;overflow-x:auto;padding-bottom:8px">
          ${plano.trilhas.map((trilha, i) => `
            <div style="display:flex;align-items:center;gap:0;flex-shrink:0">
              <div style="
                background:${plano.cor}${Math.round(15 + i*25).toString(16).padStart(2,'0')};
                border:2px solid ${plano.cor};border-radius:12px;padding:16px;
                min-width:180px;max-width:200px;
                ${i===0?'border-left-width:4px':''}
              ">
                <div style="font-size:20px;margin-bottom:8px">${['🌱','📊','🚀','🏆'][i]||'⭐'}</div>
                <strong style="font-size:13px;display:block;margin-bottom:4px;color:${plano.cor}">${trilha.cargo}</strong>
                <span style="font-size:10px;font-weight:700;color:${plano.cor};background:${plano.cor}15;padding:2px 8px;border-radius:20px;display:inline-block;margin-bottom:8px">${trilha.nivel}</span>
                <small style="display:block;color:var(--text-muted);margin-bottom:8px">⏱️ ${trilha.tempo}</small>
                <div>
                  <small style="font-weight:600;display:block;margin-bottom:4px;color:var(--text-secondary)">Requisitos:</small>
                  ${trilha.requisitos.map(r=>`<div style="font-size:11px;color:var(--text-muted);display:flex;gap:4px;margin-bottom:2px"><span style="color:${plano.cor}">✓</span>${r}</div>`).join('')}
                </div>
              </div>
              ${i < plano.trilhas.length-1 ? `
                <div style="display:flex;align-items:center;padding:0 4px;color:${plano.cor};font-size:20px;font-weight:700;flex-shrink:0">→</div>
              ` : ''}
            </div>
          `).join('')}
        </div>

      </div>
    `).join('')}

  </div>`;
}

function novaTrilha() {
  const depto = prompt('Nome do departamento para a nova trilha:');
  if (!depto) return;
  alert(`✅ Trilha de carreira para ${depto} criada!\n\nEdite os cargos e requisitos clicando em "✏️ Editar".`);
  cargosData.planoCarreira.push({
    depto, icon: '📋', cor: '#6b7280',
    trilhas: [
      { cargo: 'Júnior',   nivel: 'Operacional', tempo: '0-2 anos', requisitos: ['A definir'] },
      { cargo: 'Pleno',    nivel: 'Técnico',      tempo: '2-4 anos', requisitos: ['A definir'] },
      { cargo: 'Sênior',   nivel: 'Liderança',    tempo: '4+ anos',  requisitos: ['A definir'] },
    ],
  });
  document.getElementById('cargos-content').innerHTML = renderCargosCarreira();
}

function editarTrilha(depto) {
  alert(`✏️ Editor de trilha: ${depto}\n\nFuncionalidade de edição visual estará disponível na versão integrada.`);
}
