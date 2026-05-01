// =============================================
// INTEGRAÇÕES — unificado (integracoes.js + integracoes2.js)
// =============================================

// ─────────────────────────────────────────────
// DADOS
// ─────────────────────────────────────────────
const integData = {
  sistemas: [
    {
      id:'caju',      nome:'Caju',          icon:'🟧', cor:'#ff6b00',
      desc:'Benefícios, cartão alimentação e auxílio mobilidade',
      link:'https://app.caju.com.br', status:'conectado',
      versao:'API v2.1', ultimaSync:'Hoje 08:00',
    },
    {
      id:'nubus',     nome:'Nubus',         icon:'🚌', cor:'#0ea5e9',
      desc:'Vale transporte e gestão de mobilidade urbana',
      link:'https://nubus.com.br', status:'conectado',
      versao:'API v1.8', ultimaSync:'Hoje 08:00',
    },
    {
      id:'wellhub',   nome:'Wellhub (Gympass)', icon:'💪', cor:'#16a34a',
      desc:'Benefício fitness — academias, apps de saúde e bem-estar',
      link:'https://wellhub.com', status:'conectado',
      versao:'API v3.0', ultimaSync:'Hoje 07:45',
    },
    {
      id:'bitrix',    nome:'Bitrix24',      icon:'🟦', cor:'#0072b1',
      desc:'CRM, tarefas, comunicação e fluxo de aprovação',
      link:'https://bitrix24.com.br', status:'conectado',
      versao:'API v24.0', ultimaSync:'Há 5 min',
    },
    {
      id:'rhid',      nome:'RHid',          icon:'🟩', cor:'#00b86e',
      desc:'Ponto eletrônico, espelho de ponto e jornada de trabalho',
      link:'https://rhid.com.br', status:'conectado',
      versao:'API v2.3', ultimaSync:'Tempo real',
    },
    {
      id:'rhsolutio', nome:'RHsolutio',     icon:'📊', cor:'#7c3aed',
      desc:'Sistema de contracheque e folha de pagamento — RHsolutio',
      link:'https://rhsolutio.com.br', status:'conectado',
      versao:'API v1.5', ultimaSync:'Hoje 06:00',
    },
    {
      id:'sulamerica',nome:'SulAmérica',    icon:'❤️', cor:'#dc2626',
      desc:'Plano de saúde e odontológico',
      link:'https://sulamerica.com.br', status:'conectado',
      versao:'Portal', ultimaSync:'Manual',
    },
    {
      id:'conexao',   nome:'Conexão Saúde', icon:'🏥', cor:'#2563eb',
      desc:'Telemedicina 24h e consultas online',
      link:'https://conexaosaude.com.br', status:'conectado',
      versao:'API v1.0', ultimaSync:'Hoje 08:00',
    },
  ],

  processos: [
    {
      id:'admissao',      titulo:'Admissão de Colaborador',
      icon:'👤', cor:'#2563eb',
      sistemas:['rhid','caju','nubus','wellhub','bitrix','rhsolutio'],
      etapas:[
        { label:'RH cadastra', nivel:'admin' },
        { label:'Gestor confirma', nivel:'gestor' },
        { label:'Sistemas integrados', nivel:'auto' },
        { label:'Colaborador recebe acesso', nivel:'colab' },
      ],
    },
    {
      id:'beneficio',     titulo:'Solicitação de Benefício',
      icon:'🎁', cor:'#ff6b00',
      sistemas:['caju','nubus','wellhub'],
      etapas:[
        { label:'Colaborador solicita', nivel:'colab' },
        { label:'Gestor aprova', nivel:'gestor' },
        { label:'RH valida', nivel:'admin' },
        { label:'Caju/Nubus processa', nivel:'auto' },
      ],
    },
    {
      id:'ponto',         titulo:'Controle de Ponto',
      icon:'⏱️', cor:'#00b86e',
      sistemas:['rhid'],
      etapas:[
        { label:'Cadastro automático', nivel:'auto' },
        { label:'Colaborador registra', nivel:'colab' },
        { label:'Gestor valida', nivel:'gestor' },
        { label:'RH apura', nivel:'admin' },
      ],
    },
    {
      id:'contracheque',  titulo:'Contracheque RHsolutio',
      icon:'💰', cor:'#7c3aed',
      sistemas:['rhsolutio'],
      etapas:[
        { label:'Folha processada', nivel:'admin' },
        { label:'RHsolutio gera holerite', nivel:'auto' },
        { label:'Colaborador visualiza', nivel:'colab' },
        { label:'Confirmação assinada', nivel:'colab' },
      ],
    },
    {
      id:'wellhub_sol',   titulo:'Adesão Wellhub (Gympass)',
      icon:'💪', cor:'#16a34a',
      sistemas:['wellhub','caju'],
      etapas:[
        { label:'Admin ativa benefício', nivel:'admin' },
        { label:'Colaborador solicita', nivel:'colab' },
        { label:'Gestor aprova', nivel:'gestor' },
        { label:'Wellhub ativa acesso', nivel:'auto' },
      ],
    },
    {
      id:'lavanderia',    titulo:'Crédito Lavanderia',
      icon:'👕', cor:'#d97706',
      sistemas:['caju','bitrix'],
      etapas:[
        { label:'Colaborador/Gestor solicita', nivel:'colab' },
        { label:'Gestor aprova', nivel:'gestor' },
        { label:'Bitrix cria tarefa', nivel:'auto' },
        { label:'Caju credita', nivel:'auto' },
      ],
    },
  ],

  pendencias: [
    { colaborador:'Pedro Henrique', sistema:'Caju',     tipo:'Ativação benefício alimentação', urgencia:'alta'  },
    { colaborador:'Maria Oliveira', sistema:'Nubus',     tipo:'Cadastro vale transporte',       urgencia:'media' },
    { colaborador:'Paulo Santos',   sistema:'Wellhub',  tipo:'Adesão Gympass pendente',        urgencia:'media' },
    { colaborador:'Ana Lima',       sistema:'RHsolutio',tipo:'Contracheque não visualizado',   urgencia:'baixa' },
    { colaborador:'Pedro Henrique', sistema:'RHid',     tipo:'Biometria não cadastrada',       urgencia:'alta'  },
  ],

  syncLog: [
    { sistema:'RHid',       acao:'Sincronização de ponto',       status:'sucesso', data:'Hoje 08:00' },
    { sistema:'Caju',       acao:'Processamento de benefícios',  status:'sucesso', data:'Hoje 08:00' },
    { sistema:'RHsolutio',  acao:'Geração de contracheques',     status:'sucesso', data:'Hoje 06:00' },
    { sistema:'Wellhub',    acao:'Atualização de planos',        status:'sucesso', data:'Hoje 07:45' },
    { sistema:'Nubus',      acao:'Sincronização VT',             status:'alerta',  data:'Ontem 18:00'},
    { sistema:'Bitrix24',   acao:'Criação automática de tarefas',status:'sucesso', data:'Há 5 min'   },
  ],

  parametrizacoes: {
    caju: {
      alimentacao:  { ativo:true,  valor:550,  cargo:'Todos',    recarga:'Dia 1' },
      mobilidade:   { ativo:true,  valor:200,  cargo:'Todos',    recarga:'Dia 1' },
      lavanderia:   { ativo:true,  valor:150,  cargo:'Operações',recarga:'Mensal'},
    },
    nubus: {
      vt:           { ativo:true,  valor:'Automático', cargo:'Todos', recarga:'Dia útil' },
    },
    wellhub: {
      plano:        { ativo:true,  nivel:'Silver', cargo:'Todos', copart:0 },
    },
    rhsolutio: {
      competencia:  'Maio/2025',
      dataFolha:    '30/05/2025',
      acesso:       'Digital — App e Web',
    },
    rhid: {
      jornada:      '8h/dia — Segunda a Sexta',
      tolerancia:   '10 minutos',
      bancoHoras:   true,
    },
    bitrix: {
      workspace:    'hi Conecta RH',
      responsible:  'Financeiro',
      autoCreate:   true,
    },
  },
};

let integAbaAtiva = 'visao';

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderIntegracoes() {
  const conectados = integData.sistemas.filter(s=>s.status==='conectado').length;
  const pendencias = integData.pendencias.length;
  const urgentes   = integData.pendencias.filter(p=>p.urgencia==='alta').length;

  return `
  <div class="depto-page">

    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">🔗</div>
        <div class="depto-card-info"><strong>${conectados}</strong><span>Sistemas conectados</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--danger)">
        <div class="depto-card-icon">⚠️</div>
        <div class="depto-card-info"><strong>${urgentes}</strong><span>Pendências urgentes</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">📋</div>
        <div class="depto-card-info"><strong>${pendencias}</strong><span>Pendências totais</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--success)">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${integData.syncLog.filter(s=>s.status==='sucesso').length}</strong><span>Syncs bem-sucedidos hoje</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">🚀</div>
        <div class="depto-card-info"><strong>${integData.processos.length}</strong><span>Processos automatizados</span></div>
      </div>
    </div>

    <div class="integ-sistemas-grid">
      ${integData.sistemas.map(s=>`
        <div class="integ-sistema-card">
          <div class="integ-sistema-top">
            <div class="integ-sistema-icon" style="background:${s.cor}20;color:${s.cor}">${s.icon}</div>
            <div class="integ-sistema-info">
              <strong>${s.nome}</strong>
              <small>${s.desc}</small>
              <small style="color:var(--text-muted)">🔄 ${s.ultimaSync} · ${s.versao}</small>
            </div>
            <span class="integ-status-dot" title="Conectado"></span>
          </div>
          <div class="integ-sistema-acoes">
            <a href="${s.link}" target="_blank" class="btn-integ" style="background:${s.cor}">Acessar ↗</a>
            <button class="link-btn" onclick="abrirParametrizacao('${s.id}')">⚙️ Config</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="exp-tabs" style="flex-wrap:wrap">
      <button class="exp-tab active"  onclick="switchIntegTab2(this,'visao')">📊 Visão Geral</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'processos')">🔁 Processos</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'admissao')">👤 Admissão</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'contracheque')">💰 Contracheque</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'wellhub')">💪 Wellhub</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'parametrizacoes')">⚙️ Parametrizações</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'pendencias')">⚠️ Pendências</button>
      <button class="exp-tab" onclick="switchIntegTab2(this,'sync')">🔄 Sync Log</button>
    </div>

    <div id="integ2-content">${renderIntegVisao2()}</div>

    <div class="modal-overlay" id="modal-param" style="display:none" onclick="if(event.target.id==='modal-param')this.style.display='none'">
      <div class="modal-box" style="max-width:560px" id="modal-param-content"></div>
    </div>

  </div>`;
}

function switchIntegTab2(btn, aba) {
  integAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('integ2-content');
  if (aba==='visao')           el.innerHTML = renderIntegVisao2();
  if (aba==='processos')       el.innerHTML = renderIntegProcessos();
  if (aba==='admissao')        el.innerHTML = renderIntegAdmissaoFluxo();
  if (aba==='contracheque')    el.innerHTML = renderIntegContracheque();
  if (aba==='wellhub')         el.innerHTML = renderIntegWellhub();
  if (aba==='parametrizacoes') el.innerHTML = renderIntegParametrizacoes();
  if (aba==='pendencias')      el.innerHTML = renderIntegPendencias2();
  if (aba==='sync')            el.innerHTML = renderIntegSyncLog();
}

function initPage_integracoes() {
  setTimeout(()=>{
    const el = document.getElementById('integ2-content');
    if (el) el.innerHTML = renderIntegVisao2();
  }, 50);
}

function exportarJornadaExcel(lista) {
  const colunas = ["Nome", "Etapa", "Status", "Data"];
  const dados = lista.map(i => [i.nome, i.etapa, i.status, i.data]);
  exportarExcel("jornada", colunas, dados);
}

// ─────────────────────────────────────────────
// ABAS DETALHADAS
// ─────────────────────────────────────────────
function renderIntegVisao2() {
  const nivelCor = { admin:'#dc2626', gestor:'#d97706', colab:'#2563eb', auto:'#16a34a' };
  const nivelLabel = { admin:'👑 Admin', gestor:'👔 Gestor', colab:'👤 Colaborador', auto:'⚡ Automático' };

  return `
  <div style="display:flex;flex-direction:column;gap:20px">

    <div class="depto-section" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white">
      <div class="section-header">
        <h3 style="color:white">🧠 Fluxo Hierárquico de Aprovações</h3>
        <span class="mes-badge" style="background:rgba(255,255,255,0.2);color:white">Regra Global</span>
      </div>
      <div class="fluxo-hierarquico">
        ${[
          { nivel:'admin', icon:'👑', titulo:'Administrador', desc:'Define regras, ativa processos, configura sistemas', cor:'#dc2626' },
          { nivel:'gestor', icon:'👔', titulo:'Gestor',         desc:'Solicita para equipe, aprova solicitações', cor:'#d97706' },
          { nivel:'colab',  icon:'👤', titulo:'Colaborador',    desc:'Solicita direto na plataforma, acompanha status', cor:'#60a5fa' },
          { nivel:'auto',   icon:'⚡', titulo:'Automático',     desc:'Sistema integra, notifica e executa nos sistemas externos', cor:'#4ade80' },
        ].map((n,i)=>`
          <div class="hier-item">
            <div class="hier-circle" style="background:${n.cor}30;border:2px solid ${n.cor}">${n.icon}</div>
            <div class="hier-info">
              <strong>${n.titulo}</strong>
              <small>${n.desc}</small>
            </div>
          </div>
          ${i<3?'<div class="hier-arrow">↓</div>':''}
        `).join('')}
      </div>
      <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.1);border-radius:10px;font-size:13px;color:rgba(255,255,255,0.9)">
        ⚡ Após aprovação → vai automaticamente para <strong>Serviços de RH → Minhas Solicitações</strong> do colaborador
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>🔁 Processos Automatizados</h3></div>
      <div class="processos-grid">
        ${integData.processos.map(p=>`
          <div class="processo-card" style="border-left:4px solid ${p.cor}">
            <div style="font-size:24px;margin-bottom:6px">${p.icon}</div>
            <strong>${p.titulo}</strong>
            <div class="processo-sistemas">
              ${p.sistemas.map(s=>{
                const sis = integData.sistemas.find(x=>x.id===s);
                return sis?`<span class="processo-sis-tag" style="background:${sis.cor}20;color:${sis.cor}">${sis.icon} ${sis.nome}</span>`:'';
              }).join('')}
            </div>
            <div class="processo-etapas">
              ${p.etapas.map((e,i)=>`
                <span class="etapa-mini" style="background:${nivelCor[e.nivel]}20;color:${nivelCor[e.nivel]}">${i+1}. ${e.label}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>🔄 Sincronizações Recentes</h3><button class="link-btn" onclick="switchIntegTab2(document.querySelectorAll('.exp-tab')[7],'sync')">Ver todas →</button></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${integData.syncLog.slice(0,4).map(s=>`
          <div class="sync-item">
            <span class="sync-status ${s.status}">${s.status==='sucesso'?'✅':'⚠️'}</span>
            <strong style="font-size:13px;min-width:120px">${s.sistema}</strong>
            <span style="flex:1;font-size:13px;color:var(--text-muted)">${s.acao}</span>
            <small style="color:var(--text-muted)">${s.data}</small>
          </div>
        `).join('')}
      </div>
    </div>

  </div>`;
}

function renderIntegProcessos() {
  const nivelCor = { admin:'#dc2626', gestor:'#d97706', colab:'#2563eb', auto:'#16a34a' };
  const nivelIcon = { admin:'👑', gestor:'👔', colab:'👤', auto:'⚡' };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    ${integData.processos.map(p=>`
      <div class="depto-section" style="border-left:4px solid ${p.cor}">
        <div class="section-header">
          <h3>${p.icon} ${p.titulo}</h3>
          <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="iniciarProcesso('${p.id}')">▶ Iniciar</button>
        </div>
        <div class="processo-sistemas" style="margin-bottom:12px">
          ${p.sistemas.map(s=>{
            const sis = integData.sistemas.find(x=>x.id===s);
            return sis?`<a href="${sis.link}" target="_blank" class="processo-sis-tag" style="background:${sis.cor}20;color:${sis.cor};text-decoration:none">${sis.icon} ${sis.nome} ↗</a>`:'';
          }).join('')}
        </div>
        <div class="fluxo-etapas-visual">
          ${p.etapas.map((e,i)=>`
            <div class="etapa-proc" style="border-color:${nivelCor[e.nivel]};background:${nivelCor[e.nivel]}10">
              <span style="font-size:16px">${nivelIcon[e.nivel]}</span>
              <div>
                <small style="color:${nivelCor[e.nivel]};font-weight:700;font-size:10px">${e.nivel.toUpperCase()}</small>
                <span style="font-size:12px;font-weight:600;display:block">${e.label}</span>
              </div>
            </div>
            ${i<p.etapas.length-1?'<div class="etapa-seta">→</div>':''}
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

function iniciarProcesso(id) {
  const p = integData.processos.find(x=>x.id===id);
  if (!p) return;
  const nome = prompt(`Iniciar: ${p.titulo}\n\nNome do colaborador:`);
  if (!nome) return;

  if (typeof servicosData !== 'undefined') {
    servicosData.minhasSolicitacoes.unshift({
      id: 'SOL-' + Date.now(),
      tipo: p.titulo,
      colaborador: nome,
      status: 'Pendente',
      prioridade: 'media',
      data: new Date().toLocaleDateString('pt-BR'),
      sistemas: p.sistemas,
      etapaAtual: 0,
    });
  }

  alert(`✅ Processo "${p.titulo}" iniciado para ${nome}!\n\n📋 Acompanhe em: Serviços RH → Minhas Solicitações`);
}

function renderIntegAdmissaoFluxo() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="depto-section" style="background:linear-gradient(135deg,#1e3a5f,#1e40af);color:white">
      <h3 style="color:white;margin-bottom:8px">👤 Admissão Inteligente — Integração Total</h3>
      <p style="font-size:13px;color:rgba(255,255,255,0.8)">Ao cadastrar um colaborador, o sistema automaticamente integra com todos os sistemas.</p>
    </div>

    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header"><h3>📋 Checklist de Admissão</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px" id="checklist-admissao-integ">
          ${[
            { sis:'RHid',       icon:'🟩', cor:'#00b86e', acao:'Cadastrar colaborador no ponto'           },
            { sis:'Caju',       icon:'🟧', cor:'#ff6b00', acao:'Solicitar cartão alimentação'              },
            { sis:'Caju',       icon:'🟧', cor:'#ff6b00', acao:'Ativar benefício de mobilidade'           },
            { sis:'Nubus',      icon:'🚌', cor:'#0ea5e9', acao:'Cadastrar vale transporte'                },
            { sis:'Wellhub',    icon:'💪', cor:'#16a34a', acao:'Ativar plano Wellhub (Gympass)'           },
            { sis:'SulAmérica', icon:'❤️', cor:'#dc2626', acao:'Incluir no plano de saúde'               },
            { sis:'RHsolutio',  icon:'📊', cor:'#7c3aed', acao:'Cadastrar na folha — RHsolutio'          },
            { sis:'Bitrix24',   icon:'🟦', cor:'#0072b1', acao:'Criar usuário e tarefa de onboarding'    },
          ].map((item,i)=>`
            <div class="checklist-item" id="adm-check-${i}">
              <span style="background:${item.cor}20;color:${item.cor};font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;min-width:90px;text-align:center">${item.icon} ${item.sis}</span>
              <span class="chk-tarefa">${item.acao}</span>
              <span class="chk-status pendente" id="adm-status-${i}">⏳ Pendente</span>
              <button class="link-btn" onclick="concluirCheckAdm(${i})">✓ Feito</button>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn-primary" onclick="concluirTodosAdm()">✅ Marcar todos como feito</button>
          <button class="link-btn" onclick="exportarCheckAdm()">⬇ Exportar</button>
        </div>
      </div>

      <div class="depto-section">
        <div class="section-header"><h3>⚡ Iniciar Nova Admissão</h3></div>
        <div class="exp-form">
          <label>Nome do colaborador</label>
          <input type="text" id="adm-integ-nome" placeholder="Nome completo" />
          <label>Cargo</label>
          <input type="text" id="adm-integ-cargo" placeholder="Ex: Analista de RH" />
          <label>Departamento</label>
          <select id="adm-integ-depto">
            <option>RH</option><option>Comercial</option><option>Financeiro</option>
            <option>Operações</option><option>TI</option>
          </select>
          <label>Sistemas para integrar</label>
          <div class="ben-checks">
            ${integData.sistemas.map(s=>`
              <label class="check-item">
                <input type="checkbox" value="${s.id}" checked />
                ${s.icon} ${s.nome}
              </label>
            `).join('')}
          </div>
          <button class="btn-primary" onclick="iniciarAdmissaoIntegrada()">🚀 Iniciar Admissão Integrada</button>
        </div>
      </div>
    </div>
  </div>`;
}

function concluirCheckAdm(i) {
  const status = document.getElementById(`adm-status-${i}`);
  const item   = document.getElementById(`adm-check-${i}`);
  if (status) { status.className='chk-status concluido'; status.textContent='✅ Concluído'; }
  if (item)   item.style.opacity = '0.6';
}

function concluirTodosAdm() {
  for (let i=0;i<8;i++) concluirCheckAdm(i);
}

function exportarCheckAdm() {
  alert('⬇ Exportando checklist de admissão...');
}

function iniciarAdmissaoIntegrada() {
  const nome  = document.getElementById('adm-integ-nome').value.trim();
  const cargo = document.getElementById('adm-integ-cargo').value.trim();
  const depto = document.getElementById('adm-integ-depto').value;
  if (!nome || !cargo) { alert('Preencha nome e cargo!'); return; }
  alert(`🚀 ADMISSÃO INTEGRADA INICIADA!\n\nColaborador: ${nome}\nCargo: ${cargo}\nDepartamento: ${depto}\n\n✅ Checklist gerado automaticamente\n✅ Sistemas notificados\n✅ Acompanhe em: Serviços RH → Minhas Solicitações`);
  concluirTodosAdm();
}

function renderIntegContracheque() {
  const config = integData.parametrizacoes.rhsolutio;
  const colabs = [
    { nome:'João Silva',    cargo:'Vendedor',    salario:2000, descontos:320, liquido:1680, status:'Disponível' },
    { nome:'Maria Oliveira',cargo:'Analista RH', salario:3200, descontos:510, liquido:2690, status:'Disponível' },
    { nome:'Carlos Souza',  cargo:'Supervisor',  salario:5500, descontos:880, liquido:4620, status:'Disponível' },
    { nome:'Ana Lima',      cargo:'Caixa',       salario:1800, descontos:290, liquido:1510, status:'Pendente'   },
    { nome:'Paulo Santos',  cargo:'Estoquista',  salario:1700, descontos:272, liquido:1428, status:'Disponível' },
  ];

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section" style="border-left:4px solid #7c3aed">
      <div class="section-header">
        <h3>📊 RHsolutio — Contracheque Digital</h3>
        <div style="display:flex;gap:8px">
          <span class="mes-badge">${config.competencia}</span>
          <a href="https://rhsolutio.com.br" target="_blank" class="link-btn">Abrir RHsolutio ↗</a>
        </div>
      </div>
      <div class="depto-cards" style="margin-bottom:16px">
        <div class="depto-card"><div class="depto-card-icon">📅</div><div class="depto-card-info"><strong>${config.competencia}</strong><span>Competência</span></div></div>
        <div class="depto-card"><div class="depto-card-icon">💰</div><div class="depto-card-info"><strong>${config.dataFolha}</strong><span>Data de pagamento</span></div></div>
        <div class="depto-card destaque"><div class="depto-card-icon">📱</div><div class="depto-card-info"><strong>${config.acesso}</strong><span>Forma de acesso</span></div></div>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Cargo</th><th>Salário Bruto</th><th>Descontos</th><th>Líquido</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            ${colabs.map(c=>`
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.cargo}</td>
                <td>R$ ${c.salario.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="color:var(--danger)">- R$ ${c.descontos.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="color:var(--success);font-weight:700">R$ ${c.liquido.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td><span class="badge-status ${c.status==='Disponível'?'pago':'pendente'}">${c.status}</span></td>
                <td>
                  <button class="link-btn" onclick="verContracheque('${c.nome}',${c.salario},${c.descontos},${c.liquido})">📄 Ver</button>
                  <button class="link-btn" onclick="alert('⬇ Baixando contracheque de ${c.nome}...')">⬇ PDF</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function verContracheque(nome, salario, descontos, liquido) {
  alert(`CONTRACHEQUE — ${nome}\n${'='.repeat(35)}\nCompetência: Maio/2025\n\nSalário Bruto:  R$ ${salario.toLocaleString('pt-BR',{minimumFractionDigits:2})}\nINSS:           - R$ ${Math.round(salario*0.09).toLocaleString('pt-BR',{minimumFractionDigits:2})}\nIRRF:           - R$ ${Math.round(salario*0.075).toLocaleString('pt-BR',{minimumFractionDigits:2})}\nOutros desc.:   - R$ ${Math.round(descontos*0.16).toLocaleString('pt-BR',{minimumFractionDigits:2})}\n${'─'.repeat(35)}\nSalário Líquido: R$ ${liquido.toLocaleString('pt-BR',{minimumFractionDigits:2})}\n\n✅ Powered by RHsolutio`);
}

function renderIntegWellhub() {
  const config = integData.parametrizacoes.wellhub;
  const planos = [
    { nome:'Silver', preco:'R$ 49,90/mês', academias:'3.000+', apps:'10+',  desc:'Academias locais e apps básicos'    },
    { nome:'Gold',   preco:'R$ 89,90/mês', academias:'8.000+', apps:'20+',  desc:'Academias premium e apps avançados' },
    { nome:'Diamond',preco:'R$ 149,90/mês',academias:'50.000+',apps:'50+',  desc:'Acesso ilimitado e personal virtual'},
  ];
  const colabs = [
    { nome:'João Silva',    plano:'Silver',  status:'Ativo',   desde:'01/04/2025' },
    { nome:'Maria Oliveira',plano:'Gold',    status:'Ativo',   desde:'15/03/2025' },
    { nome:'Carlos Souza',  plano:'Gold',    status:'Ativo',   desde:'01/01/2025' },
    { nome:'Paulo Santos',  plano:'Silver',  status:'Pendente',desde:'—'          },
  ];

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section" style="border-left:4px solid #16a34a">
      <div class="section-header">
        <h3>💪 Wellhub (Gympass) — Benefício Fitness</h3>
        <a href="https://wellhub.com" target="_blank" class="link-btn">Acessar Wellhub ↗</a>
      </div>
      <div class="depto-cards" style="margin-bottom:16px">
        <div class="depto-card"><div class="depto-card-icon">💪</div><div class="depto-card-info"><strong>Plano ${config.plano.nivel}</strong><span>Plano atual da empresa</span></div></div>
        <div class="depto-card"><div class="depto-card-icon">👥</div><div class="depto-card-info"><strong>${colabs.filter(c=>c.status==='Ativo').length}</strong><span>Colaboradores ativos</span></div></div>
        <div class="depto-card destaque"><div class="depto-card-icon">💰</div><div class="depto-card-info"><strong>R$ 0</strong><span>Coparticipação colaborador</span></div></div>
      </div>
      <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">📋 Planos Disponíveis</h4>
      <div class="beneficios-grid2" style="margin-bottom:20px">
        ${planos.map(p=>`
          <div class="beneficio2-card" style="border-top:3px solid #16a34a">
            <div style="font-size:28px">💪</div>
            <strong>${p.nome}</strong>
            <span style="font-size:16px;font-weight:800;color:#16a34a">${p.preco}</span>
            <small>🏋️ ${p.academias} academias</small>
            <small>📱 ${p.apps} apps</small>
            <small style="color:var(--text-muted)">${p.desc}</small>
            ${config.plano.nivel===p.nome?`<span class="badge-status pago">✓ Plano atual</span>`:
              `<button class="btn-endo-pub" onclick="mudarPlanoWellhub('${p.nome}')">Mudar para ${p.nome}</button>`}
          </div>
        `).join('')}
      </div>
      <div class="section-header" style="margin-bottom:12px"><h4>👥 Colaboradores no Wellhub</h4></div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Plano</th><th>Status</th><th>Desde</th><th>Ações</th></tr></thead>
          <tbody>
            ${colabs.map(c=>`
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.plano}</td>
                <td><span class="badge-status ${c.status==='Ativo'?'pago':'pendente'}">${c.status}</span></td>
                <td>${c.desde}</td>
                <td>
                  <a href="https://wellhub.com" target="_blank" class="link-btn">Gerenciar ↗</a>
                  ${c.status==='Pendente'?`<button class="link-btn" onclick="ativarWellhub('${c.nome}')">▶ Ativar</button>`:''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function mudarPlanoWellhub(plano) {
  if (confirm(`Mudar para o plano ${plano}?\n\nIsso afetará todos os colaboradores.`)) {
    integData.parametrizacoes.wellhub.plano.nivel = plano;
    alert(`✅ Plano alterado para ${plano}!`);
    document.getElementById('integ2-content').innerHTML = renderIntegWellhub();
  }
}

function ativarWellhub(nome) {
  alert(`✅ Wellhub ativado para ${nome}!\nAcesso liberado automaticamente.`);
}

function renderIntegParametrizacoes() {
  const p = integData.parametrizacoes;

  const renderSecao = (titulo, icon, cor, campos) => `
    <div class="depto-section" style="border-left:4px solid ${cor}">
      <div class="section-header"><h3>${icon} ${titulo}</h3><button class="link-btn" onclick="salvarParam('${titulo}')">💾 Salvar</button></div>
      <div class="param-grid">
        ${campos.map(c=>`
          <div class="param-field">
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">${c.label}</label>
            ${c.tipo==='toggle'
              ? `<label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                  <input type="checkbox" ${c.valor?'checked':''} onchange="toggleParam('${titulo}','${c.key}',this.checked)" />
                  <span style="font-size:13px">${c.valor?'Ativo':'Inativo'}</span>
                </label>`
              : `<input type="${c.tipo||'text'}" value="${c.valor}" style="border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-family:inherit;font-size:13px;outline:none" />`
            }
          </div>
        `).join('')}
      </div>
    </div>`;

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    ${renderSecao('Caju — Benefícios','🟧','#ff6b00',[
      { label:'Alimentação — Valor mensal (R$)', key:'alimentacao', tipo:'number', valor:p.caju.alimentacao.valor },
      { label:'Alimentação — Ativo', key:'ativo_alim', tipo:'toggle', valor:p.caju.alimentacao.ativo },
      { label:'Mobilidade — Valor mensal (R$)', key:'mobilidade', tipo:'number', valor:p.caju.mobilidade.valor },
      { label:'Lavanderia — Valor (R$)', key:'lavanderia', tipo:'number', valor:p.caju.lavanderia.valor },
      { label:'Data de recarga', key:'recarga', tipo:'text', valor:p.caju.alimentacao.recarga },
    ])}
    ${renderSecao('Nubus — Vale Transporte','🚌','#0ea5e9',[
      { label:'Vale Transporte — Ativo', key:'vt', tipo:'toggle', valor:p.nubus.vt.ativo },
      { label:'Valor (automático por trajeto)', key:'valor', tipo:'text', valor:p.nubus.vt.valor },
      { label:'Data de recarga', key:'recarga', tipo:'text', valor:p.nubus.vt.recarga },
    ])}
    ${renderSecao('Wellhub (Gympass)','💪','#16a34a',[
      { label:'Benefício ativo', key:'ativo', tipo:'toggle', valor:p.wellhub.plano.ativo },
      { label:'Plano padrão', key:'plano', tipo:'text', valor:p.wellhub.plano.nivel },
      { label:'Coparticipação colaborador (R$)', key:'copart', tipo:'number', valor:p.wellhub.plano.copart },
    ])}
    ${renderSecao('RHsolutio — Contracheque','📊','#7c3aed',[
      { label:'Competência', key:'comp', tipo:'text', valor:p.rhsolutio.competencia },
      { label:'Data de folha', key:'folha', tipo:'text', valor:p.rhsolutio.dataFolha },
      { label:'Forma de acesso', key:'acesso', tipo:'text', valor:p.rhsolutio.acesso },
    ])}
    ${renderSecao('RHid — Ponto Eletrônico','🟩','#00b86e',[
      { label:'Jornada padrão', key:'jornada', tipo:'text', valor:p.rhid.jornada },
      { label:'Tolerância de ponto', key:'tol', tipo:'text', valor:p.rhid.tolerancia },
      { label:'Banco de horas', key:'banco', tipo:'toggle', valor:p.rhid.bancoHoras },
    ])}
    ${renderSecao('Bitrix24 — Tarefas','🟦','#0072b1',[
      { label:'Workspace', key:'ws', tipo:'text', valor:p.bitrix.workspace },
      { label:'Responsável padrão', key:'resp', tipo:'text', valor:p.bitrix.responsible },
      { label:'Criar tarefas automaticamente', key:'auto', tipo:'toggle', valor:p.bitrix.autoCreate },
    ])}
  </div>`;
}

function salvarParam(sistema) {
  alert(`✅ Parametrizações de ${sistema} salvas com sucesso!`);
}

function toggleParam(sistema, key, val) {
  console.log(`${sistema} > ${key}: ${val}`);
}

function renderIntegPendencias2() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>⚠️ Pendências nos Sistemas</h3>
      <button class="link-btn" onclick="resolverTodasPendencias()">✓ Resolver todas</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px" id="pendencias-integ">
      ${integData.pendencias.map((p,i)=>`
        <div class="pendencia-item urgencia-${p.urgencia}">
          <div class="pendencia-urgencia">${p.urgencia==='alta'?'🔴':p.urgencia==='media'?'🟡':'🟢'}</div>
          <div class="pendencia-info">
            <strong>${p.colaborador}</strong>
            <span>${p.tipo}</span>
            <small>Sistema: ${p.sistema}</small>
          </div>
          <div style="display:flex;gap:8px">
            <a href="${integData.sistemas.find(s=>s.nome===p.sistema)?.link||'#'}" target="_blank" class="link-btn">Abrir ${p.sistema} ↗</a>
            <button class="link-btn" onclick="resolverPendenciaInteg(${i})">✓ Resolver</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function resolverPendenciaInteg(i) {
  integData.pendencias.splice(i,1);
  document.getElementById('integ2-content').innerHTML = renderIntegPendencias2();
}

function resolverTodasPendencias() {
  if (confirm('Marcar todas como resolvidas?')) {
    integData.pendencias = [];
    document.getElementById('integ2-content').innerHTML = renderIntegPendencias2();
  }
}

function renderIntegSyncLog() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>🔄 Log de Sincronizações</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="forcarSync()">🔄 Forçar Sync</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${integData.syncLog.map(s=>`
        <div class="sync-item">
          <span class="sync-status ${s.status}">${s.status==='sucesso'?'✅':'⚠️'}</span>
          <strong style="font-size:13px;min-width:120px">${s.sistema}</strong>
          <span style="flex:1;font-size:13px;color:var(--text-muted)">${s.acao}</span>
          <small style="color:var(--text-muted);white-space:nowrap">${s.data}</small>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function forcarSync() {
  alert('🔄 Sincronização forçada iniciada!\n\nTodos os sistemas serão atualizados.\nTempo estimado: 2-5 minutos.');
  integData.syncLog.unshift({ sistema:'Todos', acao:'Sincronização manual forçada', status:'sucesso', data:'Agora' });
}

function abrirParametrizacao(id) {
  const sis = integData.sistemas.find(s=>s.id===id);
  if (!sis) return;
  document.getElementById('modal-param-content').innerHTML = `
    <div class="modal-header">
      <h3>${sis.icon} ${sis.nome} — Configurações</h3>
      <button class="modal-close" onclick="document.getElementById('modal-param').style.display='none'">✕</button>
    </div>
    <div style="padding-top:12px;display:flex;flex-direction:column;gap:12px">
      <div class="resumo-item" style="grid-template-columns:130px 1fr"><span>Status</span><span class="badge-status pago">✓ Conectado</span></div>
      <div class="resumo-item" style="grid-template-columns:130px 1fr"><span>Versão API</span><strong>${sis.versao}</strong></div>
      <div class="resumo-item" style="grid-template-columns:130px 1fr"><span>Última sync</span><strong>${sis.ultimaSync}</strong></div>
      <div class="resumo-item" style="grid-template-columns:130px 1fr"><span>Link</span><a href="${sis.link}" target="_blank" class="link-btn">Acessar ↗</a></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-primary" onclick="forcarSyncSistema('${sis.nome}')">🔄 Forçar Sync</button>
        <a href="${sis.link}" target="_blank" class="btn-aprovar" style="text-decoration:none;display:flex;align-items:center">Acessar Sistema ↗</a>
      </div>
    </div>`;
  document.getElementById('modal-param').style.display = 'flex';
}

function forcarSyncSistema(nome) {
  alert(`🔄 Sincronização de ${nome} iniciada!\nAtualização em andamento...`);
  document.getElementById('modal-param').style.display = 'none';
}
