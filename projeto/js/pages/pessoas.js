// =============================================
// GESTÃO DE PESSOAS — COMPLETO
// =============================================

const pessoasData = {
  colaboradores: [
    { id:1,  nome:'João Silva',      cargo:'Vendedor',              depto:'Comercial',  nivel:'colaborador', status:'Ativo',     gestor:'Carlos Souza',  admissao:'01/03/2022', salario:2000, email:'joao@empresa.com',    tel:'(83)99001-1111' },
    { id:2,  nome:'Maria Oliveira',  cargo:'Analista de RH',        depto:'RH',         nivel:'colaborador', status:'Ativo',     gestor:'Roberta Lima',  admissao:'15/06/2021', salario:3200, email:'maria@empresa.com',   tel:'(83)98002-2222' },
    { id:3,  nome:'Carlos Souza',    cargo:'Supervisor Comercial',  depto:'Comercial',  nivel:'gestor',      status:'Ativo',     gestor:'Ana Paula',     admissao:'10/01/2019', salario:5500, email:'carlos@empresa.com',  tel:'(83)97003-3333' },
    { id:4,  nome:'Ana Lima',        cargo:'Caixa',                 depto:'Financeiro', nivel:'colaborador', status:'Ativo',     gestor:'Fernanda Souza',admissao:'20/08/2022', salario:1800, email:'ana@empresa.com',     tel:'(83)96004-4444' },
    { id:5,  nome:'Paulo Santos',    cargo:'Estoquista',            depto:'Operações',  nivel:'colaborador', status:'Afastado',  gestor:'Rafael Costa',  admissao:'05/11/2021', salario:1700, email:'paulo@empresa.com',   tel:'(83)95005-5555' },
    { id:6,  nome:'Roberta Lima',    cargo:'Coordenadora de RH',    depto:'RH',         nivel:'gestor',      status:'Ativo',     gestor:'Ana Paula',     admissao:'01/02/2018', salario:6000, email:'roberta@empresa.com', tel:'(83)94006-6666' },
    { id:7,  nome:'Fernanda Souza',  cargo:'Coordenadora Financeira',depto:'Financeiro',nivel:'gestor',      status:'Ativo',     gestor:'Ana Paula',     admissao:'15/03/2017', salario:6500, email:'fernanda@empresa.com',tel:'(83)93007-7777' },
    { id:8,  nome:'Rafael Costa',    cargo:'Coord. Operacional',    depto:'Operações',  nivel:'gestor',      status:'Ativo',     gestor:'Ana Paula',     admissao:'10/05/2016', salario:6200, email:'rafael@empresa.com',  tel:'(83)92008-8888' },
    { id:9,  nome:'Ana Paula',       cargo:'Diretora de RH',        depto:'RH',         nivel:'admin',       status:'Ativo',     gestor:'CEO',           admissao:'01/01/2015', salario:15000,email:'anapaula@empresa.com',tel:'(83)91009-9999' },
    { id:10, nome:'Felipe Rocha',    cargo:'Analista de TI',        depto:'TI',         nivel:'colaborador', status:'Ativo',     gestor:'Ana Paula',     admissao:'01/06/2023', salario:4500, email:'felipe@empresa.com',  tel:'(83)90010-0000' },
  ],

  departamentos: [
    { nome:'RH',         gestor:'Roberta Lima',   colaboradores:3, cor:'#2563eb' },
    { nome:'Comercial',  gestor:'Carlos Souza',   colaboradores:8, cor:'#16a34a' },
    { nome:'Financeiro', gestor:'Fernanda Souza', colaboradores:5, cor:'#d97706' },
    { nome:'Operações',  gestor:'Rafael Costa',   colaboradores:6, cor:'#7c3aed' },
    { nome:'TI',         gestor:'Felipe Rocha',   colaboradores:4, cor:'#dc2626' },
  ],

  perfisAcesso: [
    { nivel:'admin',       label:'Administrador',  icon:'👑', cor:'#dc2626', permissoes:['tudo'],                                            desc:'Acesso total ao sistema'            },
    { nivel:'gestor',      label:'Gestor',         icon:'👔', cor:'#d97706', permissoes:['equipe','relatorios','aprovacoes'],                desc:'Gerencia equipe e aprovações'       },
    { nivel:'colaborador', label:'Colaborador',    icon:'👤', cor:'#2563eb', permissoes:['perfil','solicitacoes','treinamentos'],            desc:'Acesso aos próprios dados'          },
  ],

  politicas: [
    { titulo:'Política de Férias',           descricao:'30 dias por ano. Podem ser divididos em até 3 períodos. Aviso com 30 dias de antecedência.',               ativa:true  },
    { titulo:'Política de Ponto',            descricao:'Jornada de 8h diárias. Banco de horas permitido. Horas extras pagas com 50% adicional.',                    ativa:true  },
    { titulo:'Política de Benefícios',       descricao:'Alimentação, saúde, odonto e mobilidade conforme cargo e nível.',                                            ativa:true  },
    { titulo:'Código de Conduta',            descricao:'Respeito, ética e integridade são valores inegociáveis. Violações resultam em processo disciplinar.',        ativa:true  },
    { titulo:'Política de Home Office',      descricao:'Cargos elegíveis podem trabalhar remotamente até 2 dias por semana mediante aprovação do gestor.',           ativa:false },
    { titulo:'Política de Desenvolvimento',  descricao:'Empresa investe em treinamentos e certificações. Colaboradores têm direito a 40h de treinamento por ano.',   ativa:true  },
  ],

  logs: [
    { usuario:'Ana Paula',   acao:'Cadastrou colaborador',         detalhe:'Felipe Rocha — TI',              data:'01/06/2023 09:12' },
    { usuario:'Roberta Lima',acao:'Atualizou salário',             detalhe:'João Silva: R$1.800 → R$2.000',  data:'01/03/2023 14:30' },
    { usuario:'Carlos Souza',acao:'Aprovou solicitação de férias', detalhe:'Maria Oliveira — 15 dias',       data:'15/02/2023 11:00' },
    { usuario:'Sistema',     acao:'Backup automático',             detalhe:'Dados exportados com sucesso',   data:'25/04/2026 00:00' },
    { usuario:'Ana Paula',   acao:'Alterou permissão',             detalhe:'Carlos Souza: colab → gestor',   data:'10/01/2023 16:45' },
  ],

  parametrizacoes: {
    camposPersonalizados: ['Data de aniversário', 'Tamanho de uniforme', 'Veículo próprio'],
    fluxos: [
      { nome:'Solicitação de férias',    etapas:['Solicitação','Aprovação gestor','Confirmação RH'] },
      { nome:'Admissão',                 etapas:['Cadastro','Documentação','Onboarding','Ativo'] },
      { nome:'Desligamento',             etapas:['Comunicação','Entrevista','Rescisão','Arquivado'] },
    ],
  },
};

let pessoasAbaAtiva = 'colaboradores';
let colaboradorSelecionado = null;
function renderPessoas() {
  const ativos    = pessoasData.colaboradores.filter(c=>c.status==='Ativo').length;
  const afastados = pessoasData.colaboradores.filter(c=>c.status==='Afastado').length;
  const admins    = pessoasData.colaboradores.filter(c=>c.nivel==='admin').length;
  const gestores  = pessoasData.colaboradores.filter(c=>c.nivel==='gestor').length;

  return `
  <div class="depto-page">

    <!-- KPIs -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">👥</div>
        <div class="depto-card-info"><strong>${pessoasData.colaboradores.length}</strong><span>Total colaboradores</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--success)">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${ativos}</strong><span>Ativos</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">⏸️</div>
        <div class="depto-card-info"><strong>${afastados}</strong><span>Afastados</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--primary)">
        <div class="depto-card-icon">🏢</div>
        <div class="depto-card-info"><strong>${pessoasData.departamentos.length}</strong><span>Departamentos</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">👑</div>
        <div class="depto-card-info"><strong>${admins} admin · ${gestores} gestores</strong><span>Lideranças</span></div>
      </div>
    </div>

    <!-- ABAS -->
    <div class="exp-tabs" style="flex-wrap:wrap">
      <button class="exp-tab active"  onclick="switchPessoasTab(this,'colaboradores')">👥 Colaboradores</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'departamentos')">🏢 Departamentos</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'organograma')">📊 Organograma</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'permissoes')">🔐 Permissões</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'politicas')">📜 Políticas</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'parametrizacoes')">⚙️ Parametrizações</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'relatorios')">📈 Relatórios</button>
      <button class="exp-tab" onclick="switchPessoasTab(this,'logs')">🕓 Logs</button>
    </div>

    <div id="pessoas-content">${renderPessoasColaboradores()}</div>

    <!-- MODAL COLABORADOR -->
    <div class="modal-overlay" id="modal-colaborador-detalhe" style="display:none" onclick="if(event.target.id==='modal-colaborador-detalhe')this.style.display='none'">
      <div class="modal-box" style="max-width:620px" id="colaborador-detalhe-content"></div>
    </div>

    <!-- MODAL NOVO COLABORADOR -->
    <div class="modal-overlay" id="modal-novo-colab" style="display:none" onclick="if(event.target.id==='modal-novo-colab')this.style.display='none'">
      <div class="modal-box" style="max-width:580px">
        <div class="modal-header">
          <h3>👤 Novo Colaborador</h3>
          <button class="modal-close" onclick="document.getElementById('modal-novo-colab').style.display='none'">✕</button>
        </div>
        <div class="exp-form">
          <div class="form-row">
            <div><label>Nome completo</label><input type="text" id="nc-nome" placeholder="Nome completo" /></div>
            <div><label>E-mail</label><input type="email" id="nc-email" placeholder="email@empresa.com" /></div>
          </div>
          <div class="form-row">
            <div><label>Cargo</label><input type="text" id="nc-cargo" placeholder="Ex: Analista de RH" /></div>
            <div><label>Departamento</label>
              <select id="nc-depto">
                ${pessoasData.departamentos.map(d=>`<option>${d.nome}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div><label>Nível de acesso</label>
              <select id="nc-nivel">
                <option value="colaborador">👤 Colaborador</option>
                <option value="gestor">👔 Gestor</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>
            <div><label>Salário</label><input type="number" id="nc-salario" placeholder="0,00" /></div>
          </div>
          <div class="form-row">
            <div><label>Gestor direto</label><input type="text" id="nc-gestor" placeholder="Nome do gestor" /></div>
            <div><label>Data de admissão</label><input type="date" id="nc-admissao" /></div>
          </div>
          <label>Telefone</label>
          <input type="text" id="nc-tel" placeholder="(00) 00000-0000" />
          <button class="btn-primary" onclick="salvarNovoColaborador()">✅ Cadastrar Colaborador</button>
        </div>
      </div>
    </div>

  </div>`;
}

function switchPessoasTab(btn, aba) {
  pessoasAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('pessoas-content');
  if (aba==='colaboradores')   el.innerHTML = renderPessoasColaboradores();
  if (aba==='departamentos')   el.innerHTML = renderPessoasDepartamentos();
  if (aba==='organograma')     el.innerHTML = renderPessoasOrganograma();
  if (aba==='permissoes')      el.innerHTML = renderPessoasPermissoes();
  if (aba==='politicas')       el.innerHTML = renderPessoasPoliticas();
  if (aba==='parametrizacoes') el.innerHTML = renderPessoasParametrizacoes();
  if (aba==='relatorios')      el.innerHTML = renderPessoasRelatorios();
  if (aba==='logs')            el.innerHTML = renderPessoasLogs();
}

function initPage_pessoas() {
  setTimeout(()=>{
    const el = document.getElementById('pessoas-content');
    if (el) el.innerHTML = renderPessoasColaboradores();
  }, 50);
}

// =============================================
// COLABORADORES
// =============================================
function renderPessoasColaboradores() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section">
      <div class="section-header">
        <h3>👥 Colaboradores</h3>
        <div style="display:flex;gap:8px">
          <input type="text" placeholder="🔍 Buscar..." oninput="filtrarColaboradores(this.value)"
            style="border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:13px;font-family:inherit;outline:none" />
          <select onchange="filtrarPorDepto(this.value)"
            style="border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:13px;font-family:inherit;outline:none">
            <option value="">Todos os deptos</option>
            ${pessoasData.departamentos.map(d=>`<option value="${d.nome}">${d.nome}</option>`).join('')}
          </select>
          <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="document.getElementById('modal-novo-colab').style.display='flex'">+ Novo</button>
        </div>
      </div>

      <div class="pessoas-grid" id="pessoas-grid">
        ${pessoasData.colaboradores.map(c=>renderCardColaborador(c)).join('')}
      </div>
    </div>
  </div>`;
}

function renderCardColaborador(c) {
  const iniciais = c.nome.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  const cfg = pessoasData.perfisAcesso.find(p=>p.nivel===c.nivel);
  return `
  <div class="pessoa-card" onclick="abrirDetalheColaborador(${c.id})">
    <div class="pessoa-avatar" style="background:${c.status==='Ativo'?'var(--primary)':'#94a3b8'}">${iniciais}</div>
    <div class="pessoa-info">
      <strong>${c.nome}</strong>
      <span>${c.cargo}</span>
      <small>${c.depto}</small>
    </div>
    <div class="pessoa-badges">
      <span class="badge-status ${c.status==='Ativo'?'pago':c.status==='Afastado'?'pendente':'inativo'}">${c.status}</span>
      <span class="pessoa-nivel-badge" style="background:${cfg?.cor}20;color:${cfg?.cor}">${cfg?.icon} ${cfg?.label}</span>
    </div>
  </div>`;
}

function filtrarColaboradores(termo) {
  const grid = document.getElementById('pessoas-grid');
  if (!grid) return;
  const lista = pessoasData.colaboradores.filter(c=>
    c.nome.toLowerCase().includes(termo.toLowerCase()) ||
    c.cargo.toLowerCase().includes(termo.toLowerCase()) ||
    c.depto.toLowerCase().includes(termo.toLowerCase())
  );
  grid.innerHTML = lista.map(c=>renderCardColaborador(c)).join('');
}

function filtrarPorDepto(depto) {
  const grid = document.getElementById('pessoas-grid');
  if (!grid) return;
  const lista = depto ? pessoasData.colaboradores.filter(c=>c.depto===depto) : pessoasData.colaboradores;
  grid.innerHTML = lista.map(c=>renderCardColaborador(c)).join('');
}

function abrirDetalheColaborador(id) {
  const c = pessoasData.colaboradores.find(x=>x.id===id);
  if (!c) return;
  const iniciais = c.nome.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  const cfg = pessoasData.perfisAcesso.find(p=>p.nivel===c.nivel);

  document.getElementById('colaborador-detalhe-content').innerHTML = `
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:14px">
        <div class="pessoa-avatar" style="width:52px;height:52px;font-size:18px;background:${c.status==='Ativo'?'var(--primary)':'#94a3b8'}">${iniciais}</div>
        <div>
          <h3>${c.nome}</h3>
          <small style="color:var(--text-muted)">${c.cargo} · ${c.depto}</small>
        </div>
      </div>
      <button class="modal-close" onclick="document.getElementById('modal-colaborador-detalhe').style.display='none'">✕</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
      ${[
        ['📧 E-mail', c.email],
        ['📱 Telefone', c.tel],
        ['🏢 Departamento', c.depto],
        ['👤 Gestor', c.gestor],
        ['📅 Admissão', c.admissao],
        ['💰 Salário', `R$ ${c.salario.toLocaleString('pt-BR',{minimumFractionDigits:2})}`],
        ['🔐 Nível', `${cfg?.icon} ${cfg?.label}`],
        ['📊 Status', c.status],
      ].map(([k,v])=>`
        <div style="background:var(--bg);border-radius:8px;padding:10px">
          <small style="color:var(--text-muted);font-size:11px;display:block">${k}</small>
          <strong style="font-size:13px">${v}</strong>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
      <button class="btn-primary" onclick="editarColaborador(${c.id})">✏️ Editar</button>
      <button class="btn-aprovar" onclick="alterarPermissao(${c.id})">🔐 Permissão</button>
      <button class="link-btn" onclick="navigateTo('departamento')">📋 Ver no DP</button>
      <button class="link-btn" onclick="uploadArquivoDP('${c.nome}','colaborador')">📎 Arquivos</button>
      ${c.status==='Ativo'
        ? `<button class="btn-upload" onclick="afastarColaborador(${c.id})">⏸️ Afastar</button>`
        : `<button class="btn-upload" onclick="reativarColaborador(${c.id})">▶️ Reativar</button>`}
    </div>`;

  document.getElementById('modal-colaborador-detalhe').style.display = 'flex';
}

function salvarNovoColaborador() {
  const nome    = document.getElementById('nc-nome').value.trim();
  const email   = document.getElementById('nc-email').value.trim();
  const cargo   = document.getElementById('nc-cargo').value.trim();
  const depto   = document.getElementById('nc-depto').value;
  const nivel   = document.getElementById('nc-nivel').value;
  const salario = parseFloat(document.getElementById('nc-salario').value)||0;
  const gestor  = document.getElementById('nc-gestor').value.trim();
  const admissao= document.getElementById('nc-admissao').value;
  const tel     = document.getElementById('nc-tel').value.trim();

  if (!nome || !cargo) { alert('Preencha nome e cargo!'); return; }

  const admFmt = admissao ? new Date(admissao+'T12:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

  pessoasData.colaboradores.push({
    id: pessoasData.colaboradores.length+1,
    nome, email, cargo, depto, nivel, salario, gestor,
    admissao: admFmt, tel, status:'Ativo'
  });

  pessoasData.logs.unshift({
    usuario: 'Usuário atual',
    acao: 'Cadastrou colaborador',
    detalhe: `${nome} — ${depto}`,
    data: new Date().toLocaleString('pt-BR')
  });

  document.getElementById('modal-novo-colab').style.display = 'none';
  alert(`✅ ${nome} cadastrado com sucesso!`);
  document.getElementById('pessoas-content').innerHTML = renderPessoasColaboradores();
}

function editarColaborador(id) {
  alert('✏️ Em produção, abrirá formulário completo de edição do colaborador.');
}

function alterarPermissao(id) {
  const c      = pessoasData.colaboradores.find(x=>x.id===id);
  if (!c) return;
  const opcao  = prompt(`Nível atual: ${c.nivel}\n\nNovo nível:\n1. colaborador\n2. gestor\n3. admin\n\nDigite o número:`);
  const niveis = ['colaborador','gestor','admin'];
  if (opcao && niveis[parseInt(opcao)-1]) {
    const anterior = c.nivel;
    c.nivel = niveis[parseInt(opcao)-1];
    pessoasData.logs.unshift({ usuario:'Usuário atual', acao:'Alterou permissão', detalhe:`${c.nome}: ${anterior} → ${c.nivel}`, data: new Date().toLocaleString('pt-BR') });
    alert(`✅ Permissão de ${c.nome} alterada para: ${c.nivel}`);
    document.getElementById('modal-colaborador-detalhe').style.display = 'none';
    document.getElementById('pessoas-content').innerHTML = renderPessoasColaboradores();
  }
}

function afastarColaborador(id) {
  const c = pessoasData.colaboradores.find(x=>x.id===id);
  if (!c || !confirm(`Afastar ${c.nome}?`)) return;
  c.status = 'Afastado';
  alert(`✅ ${c.nome} marcado como afastado.`);
  document.getElementById('modal-colaborador-detalhe').style.display = 'none';
  document.getElementById('pessoas-content').innerHTML = renderPessoasColaboradores();
}

function reativarColaborador(id) {
  const c = pessoasData.colaboradores.find(x=>x.id===id);
  if (!c || !confirm(`Reativar ${c.nome}?`)) return;
  c.status = 'Ativo';
  alert(`✅ ${c.nome} reativado.`);
  document.getElementById('modal-colaborador-detalhe').style.display = 'none';
  document.getElementById('pessoas-content').innerHTML = renderPessoasColaboradores();
}
// =============================================
// DEPARTAMENTOS
// =============================================
function renderPessoasDepartamentos() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section">
      <div class="section-header">
        <h3>🏢 Departamentos</h3>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="adicionarDepartamento()">+ Novo Depto</button>
      </div>
      <div class="deptos-grid">
        ${pessoasData.departamentos.map(d=>`
          <div class="depto-card-org" style="border-top:4px solid ${d.cor}">
            <div class="depto-org-icon" style="background:${d.cor}20;color:${d.cor}">🏢</div>
            <h4>${d.nome}</h4>
            <div class="depto-org-info">
              <span>👤 Gestor: <strong>${d.gestor}</strong></span>
              <span>👥 <strong>${d.colaboradores}</strong> colaboradores</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <button class="link-btn" onclick="verEquipeDepto('${d.nome}')">Ver equipe</button>
              <button class="link-btn" onclick="editarDepto('${d.nome}')">✏️ Editar</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function adicionarDepartamento() {
  const nome   = prompt('Nome do departamento:');
  if (!nome) return;
  const gestor = prompt('Nome do gestor:') || '—';
  pessoasData.departamentos.push({ nome, gestor, colaboradores:0, cor:'#2563eb' });
  alert(`✅ Departamento "${nome}" criado!`);
  document.getElementById('pessoas-content').innerHTML = renderPessoasDepartamentos();
}

function verEquipeDepto(depto) {
  const equipe = pessoasData.colaboradores.filter(c=>c.depto===depto);
  alert(`EQUIPE — ${depto}\n\n${equipe.map(c=>`${c.nome} · ${c.cargo}`).join('\n')}`);
}

function editarDepto(nome) {
  const d = pessoasData.departamentos.find(x=>x.nome===nome);
  if (!d) return;
  const novoGestor = prompt(`Gestor atual: ${d.gestor}\nNovo gestor:`, d.gestor);
  if (novoGestor) { d.gestor = novoGestor; document.getElementById('pessoas-content').innerHTML = renderPessoasDepartamentos(); }
}

// =============================================
// ORGANOGRAMA
// =============================================
function renderPessoasOrganograma() {
  const admin   = pessoasData.colaboradores.filter(c=>c.nivel==='admin');
  const gestores = pessoasData.colaboradores.filter(c=>c.nivel==='gestor');
  const colabs  = pessoasData.colaboradores.filter(c=>c.nivel==='colaborador');

  return `
  <div class="depto-section">
    <div class="section-header"><h3>📊 Organograma</h3></div>
    <div class="organograma">

      <div class="org-nivel">
        ${admin.map(c=>`
          <div class="org-card admin-card">
            <div class="org-avatar" style="background:#dc262620;color:#dc2626">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <strong>${c.nome}</strong>
            <span>${c.cargo}</span>
            <small>${c.depto}</small>
          </div>
        `).join('')}
      </div>

      <div class="org-linha"><div class="org-linha-v"></div></div>

      <div class="org-nivel">
        ${gestores.map(c=>`
          <div class="org-card gestor-card">
            <div class="org-avatar" style="background:#d9770620;color:#d97706">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <strong>${c.nome}</strong>
            <span>${c.cargo}</span>
            <small>${c.depto}</small>
          </div>
        `).join('')}
      </div>

      <div class="org-linha"><div class="org-linha-v"></div></div>

      <div class="org-nivel">
        ${colabs.map(c=>`
          <div class="org-card colab-card">
            <div class="org-avatar" style="background:var(--primary-light);color:var(--primary)">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <strong>${c.nome}</strong>
            <span>${c.cargo}</span>
            <small>${c.depto}</small>
          </div>
        `).join('')}
      </div>

    </div>
  </div>`;
}

// =============================================
// PERMISSÕES
// =============================================
function renderPessoasPermissoes() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section">
      <div class="section-header"><h3>🔐 Perfis de Acesso</h3></div>
      <div class="perfis-grid">
        ${pessoasData.perfisAcesso.map(p=>`
          <div class="perfil-card" style="border-top:4px solid ${p.cor}">
            <div style="font-size:36px;margin-bottom:8px">${p.icon}</div>
            <h4 style="color:${p.cor}">${p.label}</h4>
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${p.desc}</p>
            <div class="perfil-perms">
              ${p.permissoes.map(perm=>`<span class="perm-tag">${perm}</span>`).join('')}
            </div>
            <div style="margin-top:12px;font-size:12px;color:var(--text-muted)">
              ${pessoasData.colaboradores.filter(c=>c.nivel===p.nivel).length} colaboradores neste perfil
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>🔄 Controle de Acesso por Colaborador</h3></div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Departamento</th><th>Perfil atual</th><th>Módulos acessíveis</th><th>Ação</th></tr></thead>
          <tbody>
            ${pessoasData.colaboradores.map(c=>{
              const cfg = pessoasData.perfisAcesso.find(p=>p.nivel===c.nivel);
              const modulos = c.nivel==='admin'?'Todos os módulos':c.nivel==='gestor'?'Equipe, Relatórios, Aprovações':'Perfil, Solicitações, Treinamentos';
              return `
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.depto}</td>
                <td><span class="badge-status ${c.nivel==='admin'?'inativo':c.nivel==='gestor'?'pendente':'pago'}">${cfg?.icon} ${cfg?.label}</span></td>
                <td style="font-size:12px;color:var(--text-muted)">${modulos}</td>
                <td><button class="link-btn" onclick="alterarPermissaoLista(${c.id})">🔐 Alterar</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function alterarPermissaoLista(id) { alterarPermissao(id); }

// =============================================
// POLÍTICAS
// =============================================
function renderPessoasPoliticas() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>📜 Políticas e Regras</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="adicionarPolitica()">+ Nova Política</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${pessoasData.politicas.map((p,i)=>`
        <div class="politica-card ${p.ativa?'':'inativa'}">
          <div class="politica-header">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${p.ativa?'📗':'📕'}</span>
              <strong>${p.titulo}</strong>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="badge-status ${p.ativa?'pago':'inativo'}">${p.ativa?'Ativa':'Inativa'}</span>
              <button class="link-btn" onclick="togglePolitica(${i})">${p.ativa?'Desativar':'Ativar'}</button>
              <button class="link-btn" onclick="editarPolitica(${i})">✏️</button>
            </div>
          </div>
          <p style="font-size:13px;color:var(--text-muted);margin-top:8px;line-height:1.5">${p.descricao}</p>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function togglePolitica(i) {
  pessoasData.politicas[i].ativa = !pessoasData.politicas[i].ativa;
  document.getElementById('pessoas-content').innerHTML = renderPessoasPoliticas();
}

function editarPolitica(i) {
  const nova = prompt('Nova descrição:', pessoasData.politicas[i].descricao);
  if (nova) { pessoasData.politicas[i].descricao = nova; document.getElementById('pessoas-content').innerHTML = renderPessoasPoliticas(); }
}

function adicionarPolitica() {
  const titulo = prompt('Título da política:');
  if (!titulo) return;
  const desc = prompt('Descrição:') || '';
  pessoasData.politicas.push({ titulo, descricao: desc, ativa: true });
  document.getElementById('pessoas-content').innerHTML = renderPessoasPoliticas();
}
// =============================================
// PARAMETRIZAÇÕES
// =============================================
function renderPessoasParametrizacoes() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="ind-grid">

      <div class="depto-section">
        <div class="section-header">
          <h3>🧾 Campos Personalizados</h3>
          <button class="link-btn" onclick="adicionarCampo()">+ Adicionar</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${pessoasData.parametrizacoes.camposPersonalizados.map((c,i)=>`
            <div class="param-item">
              <span>📝 ${c}</span>
              <div>
                <button class="link-btn" onclick="editarCampo(${i})">✏️</button>
                <button class="link-btn" onclick="removerCampo(${i})">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="depto-section">
        <div class="section-header"><h3>🔔 Notificações</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${[
            { label:'Férias vencendo',       ativo:true  },
            { label:'Novo colaborador',       ativo:true  },
            { label:'Solicitação pendente',   ativo:true  },
            { label:'Aniversário',            ativo:true  },
            { label:'Horas extras acumuladas',ativo:false },
          ].map((n,i)=>`
            <div class="param-item">
              <span>🔔 ${n.label}</span>
              <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
                <input type="checkbox" ${n.ativo?'checked':''} onchange="toggleNotif(${i},this.checked)" />
                <span style="font-size:12px">${n.ativo?'Ativo':'Inativo'}</span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <div class="depto-section">
      <div class="section-header"><h3>🔄 Fluxos de Aprovação</h3></div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${pessoasData.parametrizacoes.fluxos.map((f,i)=>`
          <div class="fluxo-param">
            <div class="section-header" style="margin-bottom:10px">
              <strong>${f.nome}</strong>
              <button class="link-btn" onclick="editarFluxo(${i})">✏️ Editar etapas</button>
            </div>
            <div class="fluxo-etapas-visual">
              ${f.etapas.map((e,j)=>`
                <div class="fluxo-etapa-pill">
                  <span class="fluxo-num">${j+1}</span>
                  <span>${e}</span>
                </div>
                ${j<f.etapas.length-1?'<span class="fluxo-seta">→</span>':''}
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>👁️ Visibilidade por Cargo</h3></div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Módulo</th><th>Colaborador</th><th>Gestor</th><th>Admin</th></tr></thead>
          <tbody>
            ${[
              ['Dashboard',          '✅','✅','✅'],
              ['Gestão de Pessoas',  '❌','⚠️','✅'],
              ['Folha de Pagamento', '❌','⚠️','✅'],
              ['Recrutamento',       '❌','✅','✅'],
              ['Indicadores',        '❌','✅','✅'],
              ['Ouvidoria',          '✅','✅','✅'],
              ['Configurações',      '❌','❌','✅'],
            ].map(([mod,...perms])=>`
              <tr>
                <td><strong>${mod}</strong></td>
                ${perms.map(p=>`<td style="text-align:center">${p}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <small style="color:var(--text-muted);font-size:11px;margin-top:8px;display:block">✅ Acesso total · ⚠️ Acesso parcial · ❌ Sem acesso</small>
      </div>
    </div>

  </div>`;
}

function adicionarCampo() {
  const campo = prompt('Nome do novo campo:');
  if (campo) { pessoasData.parametrizacoes.camposPersonalizados.push(campo); document.getElementById('pessoas-content').innerHTML = renderPessoasParametrizacoes(); }
}
function editarCampo(i) {
  const novo = prompt('Novo nome:', pessoasData.parametrizacoes.camposPersonalizados[i]);
  if (novo) { pessoasData.parametrizacoes.camposPersonalizados[i]=novo; document.getElementById('pessoas-content').innerHTML = renderPessoasParametrizacoes(); }
}
function removerCampo(i) {
  if (confirm('Remover este campo?')) { pessoasData.parametrizacoes.camposPersonalizados.splice(i,1); document.getElementById('pessoas-content').innerHTML = renderPessoasParametrizacoes(); }
}
function toggleNotif(i, val) { console.log(`Notificação ${i}: ${val}`); }
function editarFluxo(i) {
  const f = pessoasData.parametrizacoes.fluxos[i];
  alert(`Fluxo: ${f.nome}\nEtapas: ${f.etapas.join(' → ')}\n\nEdição completa disponível em produção.`);
}

// =============================================
// RELATÓRIOS
// =============================================
function renderPessoasRelatorios() {
  const porDepto = pessoasData.departamentos.map(d=>({
    nome: d.nome,
    qtd: pessoasData.colaboradores.filter(c=>c.depto===d.nome).length,
    cor: d.cor,
  }));
  const maxQtd = Math.max(...porDepto.map(d=>d.qtd));

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header"><h3>📈 Headcount por Departamento</h3></div>
        <div class="hc-list">
          ${porDepto.map(d=>`
            <div class="hc-item">
              <span class="hc-label">${d.nome}</span>
              <div class="hc-bar-wrap">
                <div class="hc-bar-fill" style="width:${(d.qtd/maxQtd)*100}%;background:${d.cor}"></div>
              </div>
              <span class="hc-qtd">${d.qtd}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="depto-section">
        <div class="section-header"><h3>📊 Distribuição por Nível</h3></div>
        <div class="hc-list">
          ${pessoasData.perfisAcesso.map(p=>{
            const qtd = pessoasData.colaboradores.filter(c=>c.nivel===p.nivel).length;
            return `
            <div class="hc-item">
              <span class="hc-label">${p.icon} ${p.label}</span>
              <div class="hc-bar-wrap">
                <div class="hc-bar-fill" style="width:${(qtd/pessoasData.colaboradores.length)*100}%;background:${p.cor}"></div>
              </div>
              <span class="hc-qtd">${qtd}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Relatório Completo de Colaboradores</h3>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="exportarRelatorioCompleto()">⬇ Exportar</button>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Nome</th><th>Cargo</th><th>Depto</th><th>Nível</th><th>Admissão</th><th>Salário</th><th>Status</th></tr></thead>
          <tbody>
            ${pessoasData.colaboradores.map(c=>`
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.cargo}</td>
                <td>${c.depto}</td>
                <td>${pessoasData.perfisAcesso.find(p=>p.nivel===c.nivel)?.label||c.nivel}</td>
                <td>${c.admissao}</td>
                <td>R$ ${c.salario.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td><span class="badge-status ${c.status==='Ativo'?'pago':c.status==='Afastado'?'pendente':'inativo'}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

function exportarRelatorioCompleto() {
  const txt = `RELATÓRIO DE COLABORADORES\n${'='.repeat(50)}\nData: ${new Date().toLocaleDateString('pt-BR')}\nTotal: ${pessoasData.colaboradores.length}\n\n${
    pessoasData.colaboradores.map(c=>`${c.nome} | ${c.cargo} | ${c.depto} | ${c.nivel} | ${c.admissao} | R$${c.salario} | ${c.status}`).join('\n')
  }`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='colaboradores.txt'; a.click();
  URL.revokeObjectURL(url);
}

// =============================================
// LOGS
// =============================================
function renderPessoasLogs() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>🕓 Histórico e Logs de Auditoria</h3>
      <button class="link-btn" onclick="exportarLogs()">⬇ Exportar</button>
    </div>
    <div class="table-wrap">
      <table class="depto-table">
        <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Detalhe</th></tr></thead>
        <tbody>
          ${pessoasData.logs.map(l=>`
            <tr>
              <td style="font-size:12px;white-space:nowrap">${l.data}</td>
              <td><strong>${l.usuario}</strong></td>
              <td>${l.acao}</td>
              <td style="font-size:12px;color:var(--text-muted)">${l.detalhe}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function exportarLogs() {
  const txt = `LOGS DE AUDITORIA\n${'='.repeat(50)}\n${pessoasData.logs.map(l=>`${l.data} | ${l.usuario} | ${l.acao} | ${l.detalhe}`).join('\n')}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='logs.txt'; a.click();
  URL.revokeObjectURL(url);
}