// =============================================
// DOCUMENTOS — MÓDULO COMPLETO
// =============================================

const documentosData = {
  categorias: [
    { id: 'contratos',   label: 'Contratos',       icon: '📄', cor: '#2563eb' },
    { id: 'exames',      label: 'Exames Médicos',  icon: '🏥', cor: '#dc2626' },
    { id: 'holerites',   label: 'Holerites',       icon: '💰', cor: '#16a34a' },
    { id: 'ferias',      label: 'Férias',           icon: '🏖️', cor: '#d97706' },
    { id: 'admissao',    label: 'Admissão',         icon: '✅', cor: '#7c3aed' },
    { id: 'rescisao',    label: 'Rescisão',         icon: '📋', cor: '#6b7280' },
    { id: 'certificados',label: 'Certificados',     icon: '🎓', cor: '#0ea5e9' },
    { id: 'politicas',   label: 'Políticas RH',     icon: '📜', cor: '#059669' },
  ],

  documentos: [
    {
      id: 1, nome: 'Contrato de Trabalho — João Silva', categoria: 'contratos',
      tipo: 'PDF', tamanho: '245 KB', data: '01/03/2022',
      colaborador: 'João Silva', depto: 'Comercial', status: 'Ativo',
      url: null, assinado: true,
    },
    {
      id: 2, nome: 'Contrato de Trabalho — Maria Oliveira', categoria: 'contratos',
      tipo: 'PDF', tamanho: '240 KB', data: '15/06/2021',
      colaborador: 'Maria Oliveira', depto: 'RH', status: 'Ativo',
      url: null, assinado: true,
    },
    {
      id: 3, nome: 'Exame Admissional — Pedro Henrique', categoria: 'exames',
      tipo: 'PDF', tamanho: '180 KB', data: '28/04/2025',
      colaborador: 'Pedro Henrique', depto: 'TI', status: 'Válido',
      url: null, assinado: false,
    },
    {
      id: 4, nome: 'Holerite Maio/2025 — João Silva', categoria: 'holerites',
      tipo: 'PDF', tamanho: '95 KB', data: '15/05/2025',
      colaborador: 'João Silva', depto: 'Comercial', status: 'Disponível',
      url: null, assinado: false,
    },
    {
      id: 5, nome: 'Holerite Maio/2025 — Maria Oliveira', categoria: 'holerites',
      tipo: 'PDF', tamanho: '98 KB', data: '15/05/2025',
      colaborador: 'Maria Oliveira', depto: 'RH', status: 'Disponível',
      url: null, assinado: false,
    },
    {
      id: 6, nome: 'Aviso de Férias — Carlos Souza', categoria: 'ferias',
      tipo: 'PDF', tamanho: '120 KB', data: '01/04/2025',
      colaborador: 'Carlos Souza', depto: 'TI', status: 'Aprovado',
      url: null, assinado: true,
    },
    {
      id: 7, nome: 'Política de Home Office v2', categoria: 'politicas',
      tipo: 'PDF', tamanho: '320 KB', data: '23/05/2025',
      colaborador: 'Todos', depto: 'Empresa', status: 'Vigente',
      url: null, assinado: false,
    },
    {
      id: 8, nome: 'Certificado T&D — João Silva', categoria: 'certificados',
      tipo: 'PDF', tamanho: '210 KB', data: '10/04/2025',
      colaborador: 'João Silva', depto: 'Comercial', status: 'Válido',
      url: null, assinado: false,
    },
  ],

  solicitacoes: [
    { id: 1, tipo: 'Cópia de Contrato', colaborador: 'Ana Lima',    status: 'Pendente',  data: '24/05/2025' },
    { id: 2, tipo: 'Holerite',          colaborador: 'Paulo Santos', status: 'Entregue',  data: '20/05/2025' },
    { id: 3, tipo: 'Declaração de Vínculo', colaborador: 'Felipe Rocha', status: 'Em andamento', data: '22/05/2025' },
  ],
};

let docsAbaAtiva = 'todos';
let docsFiltroCategoria = '';
let docsBusca = '';

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderDocumentos() {
  const total      = documentosData.documentos.length;
  const categorias = [...new Set(documentosData.documentos.map(d => d.categoria))].length;
  const pendentes  = documentosData.solicitacoes.filter(s => s.status === 'Pendente').length;

  return `
  <div class="depto-page">

    <!-- KPIs -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📄</div>
        <div class="depto-card-info"><strong>${total}</strong><span>Documentos</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--primary)">
        <div class="depto-card-icon">📁</div>
        <div class="depto-card-info"><strong>${categorias}</strong><span>Categorias</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">⏳</div>
        <div class="depto-card-info"><strong>${pendentes}</strong><span>Solicitações pendentes</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${documentosData.documentos.filter(d=>d.assinado).length}</strong><span>Assinados digitalmente</span></div>
      </div>
    </div>

    <!-- ABAS -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchDocTab(this,'todos')">📄 Todos</button>
      <button class="exp-tab" onclick="switchDocTab(this,'categorias')">📁 Categorias</button>
      <button class="exp-tab" onclick="switchDocTab(this,'solicitacoes')">📝 Solicitações</button>
      <button class="exp-tab" onclick="switchDocTab(this,'upload')">⬆️ Upload</button>
    </div>
    <div id="doc-content" style="margin-top:4px">
      ${renderDocTodos()}
    </div>

  </div>`;
}

function initPage_documentos() {
  const el = document.getElementById('doc-content');
  if (el) el.innerHTML = renderDocTodos();
}

function switchDocTab(btn, aba) {
  docsAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('doc-content');
  if (!el) return;
  if (aba === 'todos')       el.innerHTML = renderDocTodos();
  if (aba === 'categorias')  el.innerHTML = renderDocCategorias();
  if (aba === 'solicitacoes')el.innerHTML = renderDocSolicitacoes();
  if (aba === 'upload')      el.innerHTML = renderDocUpload();
}

// ─────────────────────────────────────────────
// ABA: TODOS OS DOCUMENTOS
// ─────────────────────────────────────────────
function renderDocTodos() {
  let docs = documentosData.documentos;
  if (docsFiltroCategoria) docs = docs.filter(d => d.categoria === docsFiltroCategoria);
  if (docsBusca) {
    const b = docsBusca.toLowerCase();
    docs = docs.filter(d =>
      d.nome.toLowerCase().includes(b) ||
      d.colaborador.toLowerCase().includes(b) ||
      d.depto.toLowerCase().includes(b)
    );
  }

  const statusCor = {
    'Ativo':'pago','Válido':'pago','Disponível':'pago','Aprovado':'pago',
    'Vigente':'pago','Pendente':'pendente','Vencido':'inativo',
  };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- Barra de ações -->
    <div class="section-header" style="flex-wrap:wrap;gap:8px">
      <h3>📄 Todos os Documentos</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" placeholder="🔍 Buscar..." value="${docsBusca}"
          oninput="docsBusca=this.value;document.getElementById('doc-content').innerHTML=renderDocTodos()"
          style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none;width:180px" />
        <select onchange="docsFiltroCategoria=this.value;document.getElementById('doc-content').innerHTML=renderDocTodos()"
          style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none">
          <option value="">Todas categorias</option>
          ${documentosData.categorias.map(c => `<option value="${c.id}" ${docsFiltroCategoria===c.id?'selected':''}>${c.label}</option>`).join('')}
        </select>
        <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="document.querySelectorAll('.exp-tab')[3].click()">⬆️ Upload</button>
        <button class="link-btn" onclick="exportarListaDocs()">⬇ Exportar lista</button>
      </div>
    </div>

    <!-- Tabela -->
    <div class="depto-section">
      <div class="table-wrap">
        <table class="depto-table">
          <thead>
            <tr>
              <th>Documento</th><th>Categoria</th><th>Colaborador</th>
              <th>Tipo</th><th>Tamanho</th><th>Data</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${docs.length > 0 ? docs.map(doc => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span>${getDocIcon(doc.tipo)}</span>
                    <div>
                      <strong style="font-size:12px">${doc.nome}</strong>
                      ${doc.assinado ? '<small style="display:block;color:var(--success);font-size:10px">✍️ Assinado digitalmente</small>' : ''}
                    </div>
                  </div>
                </td>
                <td>${getCatLabel(doc.categoria)}</td>
                <td>${doc.colaborador}</td>
                <td><span class="mes-badge">${doc.tipo}</span></td>
                <td style="color:var(--text-muted)">${doc.tamanho}</td>
                <td style="color:var(--text-muted)">${doc.data}</td>
                <td><span class="badge-status ${statusCor[doc.status]||'pendente'}">${doc.status}</span></td>
                <td>
                  <button class="link-btn" onclick="visualizarDoc(${doc.id})">👁️ Ver</button>
                  <button class="link-btn" onclick="downloadDoc(${doc.id})">⬇ Baixar</button>
                  <button class="link-btn" onclick="compartilharDoc(${doc.id})">↗ Enviar</button>
                  <button class="link-btn" onclick="excluirDoc(${doc.id})">🗑️</button>
                </td>
              </tr>
            `).join('') : `
              <tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">
                Nenhum documento encontrado.
              </td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

function getDocIcon(tipo) {
  const icons = { PDF:'📄', XLSX:'📊', DOC:'📝', JPG:'🖼️', PNG:'🖼️', ZIP:'📦' };
  return icons[tipo] || '📄';
}

function getCatLabel(catId) {
  const cat = documentosData.categorias.find(c => c.id === catId);
  return cat ? `${cat.icon} ${cat.label}` : catId;
}

function visualizarDoc(id) {
  const doc = documentosData.documentos.find(d => d.id === id);
  if (!doc) return;
  if (doc.url) { window.open(doc.url, '_blank'); return; }
  alert(`👁️ VISUALIZAR: ${doc.nome}\n\nArquivo: ${doc.tipo} · ${doc.tamanho}\nData: ${doc.data}\nColaborador: ${doc.colaborador}\n\n💡 Após integração, o documento será exibido diretamente aqui.`);
}

function downloadDoc(id) {
  const doc = documentosData.documentos.find(d => d.id === id);
  if (!doc) return;
  if (doc.url) {
    const a = document.createElement('a'); a.href = doc.url; a.download = doc.nome; a.click();
    return;
  }
  const txt = `DOCUMENTO: ${doc.nome}\nCategoria: ${getCatLabel(doc.categoria)}\nColaborador: ${doc.colaborador}\nData: ${doc.data}\nStatus: ${doc.status}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download=doc.nome+'.txt'; a.click();
  URL.revokeObjectURL(url);
}

function compartilharDoc(id) {
  const doc = documentosData.documentos.find(d => d.id === id);
  if (!doc) return;
  const destino = prompt(`Enviar "${doc.nome}" para (e-mail ou colaborador):`);
  if (destino) alert(`✅ Documento enviado para ${destino}!\n\nApós integração, será enviado automaticamente por e-mail.`);
}

function excluirDoc(id) {
  if (!confirm('Deseja excluir este documento? A ação não pode ser desfeita.')) return;
  const idx = documentosData.documentos.findIndex(d => d.id === id);
  if (idx >= 0) {
    documentosData.documentos.splice(idx, 1);
    document.getElementById('doc-content').innerHTML = renderDocTodos();
  }
}

function exportarListaDocs() {
  const txt = `LISTA DE DOCUMENTOS\n${'='.repeat(50)}\n` +
    documentosData.documentos.map(d => `${d.nome} | ${getCatLabel(d.categoria)} | ${d.colaborador} | ${d.data} | ${d.status}`).join('\n');
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='documentos.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// ABA: CATEGORIAS
// ─────────────────────────────────────────────
function renderDocCategorias() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>📁 Documentos por Categoria</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="document.querySelectorAll('.exp-tab')[3].click()">⬆️ Upload</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
      ${documentosData.categorias.map(cat => {
        const docs = documentosData.documentos.filter(d => d.categoria === cat.id);
        return `
          <div class="depto-section" style="cursor:pointer;border-top:3px solid ${cat.cor};transition:all .2s"
            onclick="abrirCategoria('${cat.id}')"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'"
            onmouseout="this.style.boxShadow=''">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
              <span style="font-size:32px">${cat.icon}</span>
              <div>
                <strong>${cat.label}</strong>
                <small style="display:block;color:var(--text-muted)">${docs.length} documento${docs.length!==1?'s':''}</small>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${docs.slice(0,3).map(d => `
                <span style="font-size:10px;background:var(--surface);padding:2px 8px;border-radius:20px;color:var(--text-muted)">
                  ${getDocIcon(d.tipo)} ${d.nome.split('—')[0].trim().substring(0,20)}...
                </span>
              `).join('')}
              ${docs.length > 3 ? `<span style="font-size:10px;color:var(--text-muted)">+${docs.length-3} mais</span>` : ''}
            </div>
            <button class="link-btn" style="margin-top:10px;font-size:12px" onclick="event.stopPropagation();abrirCategoria('${cat.id}')">
              Ver todos →
            </button>
          </div>`;
      }).join('')}
    </div>

  </div>`;
}

function abrirCategoria(catId) {
  docsFiltroCategoria = catId;
  document.querySelectorAll('.exp-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.getElementById('doc-content').innerHTML = renderDocTodos();
}

// ─────────────────────────────────────────────
// ABA: SOLICITAÇÕES
// ─────────────────────────────────────────────
function renderDocSolicitacoes() {
  const statusCor = { 'Pendente':'pendente','Em andamento':'pendente','Entregue':'pago','Cancelada':'inativo' };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>📝 Solicitações de Documentos</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="novaSolicitacaoDoc()">+ Nova Solicitação</button>
    </div>

    <div class="depto-section">
      <div class="table-wrap">
        <table class="depto-table">
          <thead>
            <tr><th>Tipo</th><th>Colaborador</th><th>Data</th><th>Status</th><th>Ações</th></tr>
          </thead>
          <tbody id="sol-doc-tbody">
            ${documentosData.solicitacoes.map((sol, i) => `
              <tr>
                <td><strong>${sol.tipo}</strong></td>
                <td>${sol.colaborador}</td>
                <td>${sol.data}</td>
                <td><span class="badge-status ${statusCor[sol.status]||'pendente'}">${sol.status}</span></td>
                <td>
                  <button class="link-btn" onclick="atenderSolicitacao(${i})">✅ Atender</button>
                  <button class="link-btn" onclick="cancelarSolicitacao(${i})">✕ Cancelar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tipos de documento disponíveis -->
    <div class="depto-section">
      <div class="section-header"><h3>📋 Tipos Disponíveis para Solicitação</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:4px">
        ${[
          '📄 Cópia de Contrato','💰 Holerite','📜 Declaração de Vínculo','✅ Carta de Referência',
          '🏖️ Aviso de Férias','🏥 Resultado de Exame','🎓 Certificado','📊 Informe de Rendimentos',
        ].map(tipo => `
          <button onclick="novaSolicitacaoTipo('${tipo}')" style="
            text-align:left;padding:10px 14px;border:1px solid var(--border);
            border-radius:8px;background:var(--surface);font-size:12px;
            cursor:pointer;font-family:inherit;transition:all .2s
          " onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
            ${tipo}
          </button>
        `).join('')}
      </div>
    </div>

  </div>`;
}

function novaSolicitacaoDoc() {
  const tipo  = prompt('Tipo de documento solicitado:');
  if (!tipo) return;
  const colab = prompt('Nome do colaborador:');
  if (!colab) return;
  documentosData.solicitacoes.unshift({
    id: Date.now(), tipo, colaborador: colab,
    status: 'Pendente', data: new Date().toLocaleDateString('pt-BR'),
  });
  document.getElementById('doc-content').innerHTML = renderDocSolicitacoes();
}

function novaSolicitacaoTipo(tipo) {
  const tipoLimpo = tipo.replace(/[^\w\sáéíóúãõâêôüç]/gu,'').trim();
  const colab = prompt(`Solicitar "${tipoLimpo}".\n\nNome do colaborador:`);
  if (!colab) return;
  documentosData.solicitacoes.unshift({
    id: Date.now(), tipo: tipoLimpo, colaborador: colab,
    status: 'Pendente', data: new Date().toLocaleDateString('pt-BR'),
  });
  alert(`✅ Solicitação de "${tipoLimpo}" para ${colab} registrada!\n\nAcompanhe em Solicitações.`);
  document.getElementById('doc-content').innerHTML = renderDocSolicitacoes();
}

function atenderSolicitacao(i) {
  const sol = documentosData.solicitacoes[i];
  if (!sol) return;
  if (sol.status === 'Entregue') { alert('Esta solicitação já foi atendida.'); return; }
  sol.status = 'Entregue';
  alert(`✅ Solicitação de "${sol.tipo}" marcada como entregue para ${sol.colaborador}!`);
  document.getElementById('doc-content').innerHTML = renderDocSolicitacoes();
}

function cancelarSolicitacao(i) {
  if (!confirm('Cancelar esta solicitação?')) return;
  documentosData.solicitacoes.splice(i, 1);
  document.getElementById('doc-content').innerHTML = renderDocSolicitacoes();
}

// ─────────────────────────────────────────────
// ABA: UPLOAD
// ─────────────────────────────────────────────
function renderDocUpload() {
  return `
  <div style="max-width:680px">
    <div class="depto-section">
      <div class="section-header">
        <h3>⬆️ Upload de Documento</h3>
        <span class="mes-badge">Formatos: PDF, XLSX, DOC, JPG, PNG</span>
      </div>
      <div class="exp-form">

        <div class="form-row">
          <div>
            <label>Colaborador</label>
            <select id="doc-up-colab">
              <option value="">Selecione...</option>
              ${(typeof pessoasData !== 'undefined' ? pessoasData.colaboradores : []).map(c =>
                `<option value="${c.nome}">${c.nome} — ${c.depto}</option>`
              ).join('')}
              <option value="Todos">📢 Todos (documento geral)</option>
            </select>
          </div>
          <div>
            <label>Categoria</label>
            <select id="doc-up-cat">
              ${documentosData.categorias.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <label>Nome do documento</label>
        <input type="text" id="doc-up-nome" placeholder="Ex: Contrato de Trabalho — João Silva" />

        <label>Arquivo</label>
        <div id="doc-drop-area" style="
          border:2px dashed var(--border);border-radius:12px;padding:32px;
          text-align:center;cursor:pointer;transition:all .2s;color:var(--text-muted)
        "
          onclick="document.getElementById('doc-up-file').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='var(--primary-light)'"
          ondragleave="this.style.borderColor='var(--border)';this.style.background=''"
          ondrop="handleDocDrop(event)">
          <div style="font-size:36px;margin-bottom:8px">📎</div>
          <strong>Clique ou arraste o arquivo aqui</strong>
          <p style="font-size:12px;margin-top:4px">PDF, XLSX, DOC, JPG, PNG — máximo 10 MB</p>
          <input type="file" id="doc-up-file" style="display:none" accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
            onchange="handleDocFile(this)" />
        </div>
        <div id="doc-file-preview" style="display:none;margin-top:8px;padding:10px 14px;background:var(--surface);border-radius:8px;font-size:13px"></div>

        <div class="form-row">
          <div>
            <label>Status</label>
            <select id="doc-up-status">
              <option>Ativo</option><option>Válido</option><option>Disponível</option>
              <option>Pendente</option><option>Vigente</option>
            </select>
          </div>
          <div>
            <label>Requer assinatura digital?</label>
            <select id="doc-up-assinar">
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-primary" onclick="salvarUploadDoc()">⬆️ Enviar documento</button>
          <button class="link-btn" onclick="limparFormDoc()">🗑️ Limpar</button>
        </div>

      </div>
    </div>
  </div>`;
}

function handleDocFile(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById('doc-file-preview');
  const drop    = document.getElementById('doc-drop-area');
  if (preview) {
    preview.style.display = 'block';
    preview.innerHTML = `${getDocIcon(file.name.split('.').pop().toUpperCase())} <strong>${file.name}</strong> — ${(file.size/1024).toFixed(0)} KB`;
  }
  if (drop) drop.style.borderColor = 'var(--success)';
  // Pré-preenche nome se estiver vazio
  const nomeInput = document.getElementById('doc-up-nome');
  if (nomeInput && !nomeInput.value) nomeInput.value = file.name.replace(/\.[^.]+$/, '');
}

function handleDocDrop(event) {
  event.preventDefault();
  const area = document.getElementById('doc-drop-area');
  if (area) { area.style.borderColor = 'var(--border)'; area.style.background = ''; }
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const input = document.getElementById('doc-up-file');
  const dt    = new DataTransfer();
  dt.items.add(file);
  if (input) { input.files = dt.files; handleDocFile(input); }
}

function salvarUploadDoc() {
  const colab  = document.getElementById('doc-up-colab')?.value;
  const cat    = document.getElementById('doc-up-cat')?.value;
  const nome   = document.getElementById('doc-up-nome')?.value.trim();
  const status = document.getElementById('doc-up-status')?.value;
  const assinar= document.getElementById('doc-up-assinar')?.value === 'true';
  const file   = document.getElementById('doc-up-file')?.files[0];

  if (!colab || !nome) { alert('Preencha colaborador e nome do documento!'); return; }

  const ext    = file ? file.name.split('.').pop().toUpperCase() : 'PDF';
  const tam    = file ? (file.size/1024).toFixed(0)+' KB' : '—';
  const url    = file ? URL.createObjectURL(file) : null;
  const depto  = (typeof pessoasData !== 'undefined' ? pessoasData.colaboradores.find(c=>c.nome===colab)?.depto : null) || 'Empresa';

  documentosData.documentos.unshift({
    id: Date.now(), nome, categoria: cat,
    tipo: ext, tamanho: tam, data: new Date().toLocaleDateString('pt-BR'),
    colaborador: colab, depto, status, url, assinado: false,
  });

  const msg = assinar
    ? `✅ Documento enviado!\n\n📄 ${nome}\n\n✍️ Solicitação de assinatura digital enviada para ${colab}.`
    : `✅ Documento enviado com sucesso!\n\n📄 ${nome}`;
  alert(msg);

  // Volta para a lista
  document.querySelectorAll('.exp-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  docsFiltroCategoria = '';
  document.getElementById('doc-content').innerHTML = renderDocTodos();
}

function limparFormDoc() {
  ['doc-up-colab','doc-up-nome'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const preview = document.getElementById('doc-file-preview');
  const drop    = document.getElementById('doc-drop-area');
  const input   = document.getElementById('doc-up-file');
  if (preview) preview.style.display = 'none';
  if (drop)    drop.style.borderColor = 'var(--border)';
  if (input)   input.value = '';
}
