// =============================================
// RECRUTAMENTO — REDESIGN COMPLETO
// =============================================

const recrutData = {
  vagas: [
    {
      id: 1, titulo: 'Analista de RH', depto: 'Recursos Humanos',
      local: 'João Pessoa - PB', contrato: 'CLT', salarioMin: 3000, salarioMax: 4500,
      status: 'Aberta', dataAbertura: '01/05/2025', prioridade: 'alta',
      descricao: 'Buscamos profissional para compor equipe de RH com foco em recrutamento, treinamento e desenvolvimento.',
      requisitos: 'Superior completo em RH, Psicologia ou áreas afins. Experiência mínima de 2 anos.',
      origem: 'Indeed',
      candidatos: [
        { id: 1, nome: 'Lucas Ferreira',   email: 'lucas@email.com',   telefone: '(83) 99001-1111', etapa: 1, status: 'pendente', origem: 'Indeed', dataInscricao: '05/05/2025', nota: 7.5, notas: [], exp: '2 anos em RH', formacao: 'Psicologia — UFPB' },
        { id: 2, nome: 'Camila Santos',    email: 'camila@email.com',  telefone: '(83) 98002-2222', etapa: 2, status: 'pendente', origem: 'Indeed', dataInscricao: '06/05/2025', nota: 8.2, notas: [], exp: '3 anos em RH', formacao: 'Adm. RH — UNIPE'   },
        { id: 3, nome: 'Rafael Moura',     email: 'rafael@email.com',  telefone: '(83) 97003-3333', etapa: 1, status: 'reprovado',origem: 'Indeed', dataInscricao: '07/05/2025', nota: 5.0, notas: [], exp: '1 ano',       formacao: 'Cursando'           },
      ]
    },
    {
      id: 2, titulo: 'Desenvolvedor Front-end', depto: 'TI',
      local: 'Remoto', contrato: 'PJ', salarioMin: 5000, salarioMax: 9000,
      status: 'Aberta', dataAbertura: '10/04/2025', prioridade: 'alta',
      descricao: 'Desenvolvedor front-end para criar interfaces modernas com React e TypeScript.',
      requisitos: 'React, TypeScript, CSS avançado. Portfólio obrigatório.',
      origem: 'Indeed',
      candidatos: [
        { id: 4, nome: 'Ana Beatriz Lima', email: 'ana@email.com',     telefone: '(83) 96004-4444', etapa: 3, status: 'aprovado', origem: 'Indeed', dataInscricao: '12/04/2025', nota: 9.1, notas: [], exp: '4 anos',     formacao: 'Ciência da Computação' },
        { id: 5, nome: 'Pedro Henrique',   email: 'pedro@email.com',   telefone: '(83) 95005-5555', etapa: 2, status: 'pendente', origem: 'Indeed', dataInscricao: '14/04/2025', nota: 7.8, notas: [], exp: '2 anos',     formacao: 'Sistemas de Informação'},
        { id: 6, nome: 'Gabriel Costa',    email: 'gabriel@email.com', telefone: '(83) 94006-4040', etapa: 1, status: 'pendente', origem: 'LinkedIn', dataInscricao: '20/04/2025', nota: 6.5, notas: [], exp: '1 ano',    formacao: 'ADS — IFPB'            },
      ]
    },
    {
      id: 3, titulo: 'Gerente Comercial', depto: 'Comercial',
      local: 'João Pessoa - PB', contrato: 'CLT', salarioMin: 8000, salarioMax: 14000,
      status: 'Em triagem', dataAbertura: '15/04/2025', prioridade: 'media',
      descricao: 'Gerente para liderar time comercial de 10 pessoas com foco em expansão regional.',
      requisitos: '5+ anos em gestão comercial, inglês intermediário, Excel avançado.',
      origem: 'Indeed',
      candidatos: [
        { id: 7, nome: 'Juliana Costa',    email: 'juliana@email.com', telefone: '(83) 94006-6666', etapa: 4, status: 'aprovado', origem: 'Indeed',   dataInscricao: '18/04/2025', nota: 9.5, notas: [], exp: '8 anos', formacao: 'Administração — UFPB' },
        { id: 8, nome: 'Marcos Oliveira',  email: 'marcos@email.com',  telefone: '(83) 93007-7777', etapa: 1, status: 'pendente', origem: 'Indeed',   dataInscricao: '20/04/2025', nota: 7.0, notas: [], exp: '5 anos', formacao: 'Administração'        },
      ]
    },
    {
      id: 4, titulo: 'Assistente Financeiro', depto: 'Financeiro',
      local: 'João Pessoa - PB', contrato: 'CLT', salarioMin: 1500, salarioMax: 2500,
      status: 'Aberta', dataAbertura: '20/05/2025', prioridade: 'baixa',
      descricao: 'Assistente para suporte nas rotinas financeiras e conciliação bancária.',
      requisitos: 'Ensino superior cursando Contabilidade ou Finanças. Excel intermediário.',
      origem: 'Indeed',
      candidatos: [
        { id: 9, nome: 'Fernanda Rocha',   email: 'fernanda@email.com',telefone: '(83) 92008-8888', etapa: 1, status: 'pendente', origem: 'Indeed', dataInscricao: '22/05/2025', nota: null, notas: [], exp: '1 ano', formacao: 'Contabilidade — UEPB' },
      ]
    },
  ],

  etapasNomes: ['Triagem', 'Entrevista RH', 'Entrevista Técnica', 'Proposta', 'Contratado'],
};

// ── dados de mapeamento e descritivo de cargos (sem conflito com cargos.js)
const recrutPerfisBehavior = [
  {
    vaga: 'Analista de RH',
    perfil: { Liderança:60, Comunicação:85, Analítico:80, Criatividade:50, Execução:75, Relacionamento:90 },
    comportamentos: ['Empático','Organizado','Comunicativo','Orientado a pessoas','Resolutivo'],
    descricao: 'Perfil predominantemente relacional e analítico. Interpessoal + capacidade de análise de dados.',
  },
  {
    vaga: 'Desenvolvedor Front-end',
    perfil: { Liderança:40, Comunicação:65, Analítico:90, Criatividade:85, Execução:80, Relacionamento:60 },
    comportamentos: ['Analítico','Criativo','Autodidata','Orientado a detalhes','Inovador'],
    descricao: 'Perfil técnico e criativo. Alta capacidade analítica combinada com criatividade visual.',
  },
  {
    vaga: 'Gerente Comercial',
    perfil: { Liderança:90, Comunicação:95, Analítico:70, Criatividade:65, Execução:85, Relacionamento:95 },
    comportamentos: ['Líder nato','Persuasivo','Orientado a resultados','Resiliente','Estratégico'],
    descricao: 'Perfil dominante e influente. Alta liderança e persuasão com foco total em resultados.',
  },
];

const recrutCandidatosMapeados = [];

const recrutTrilhas = [
  {
    funcao: 'Comercial', cor: '#16a34a',
    cargos: [
      { nivel:1, cargo:'Diretor Comercial',    salarioMin:15000, salarioMax:25000, req:'10+ anos, MBA, liderança' },
      { nivel:2, cargo:'Gerente Comercial',     salarioMin:8000,  salarioMax:14000, req:'5+ anos, superior, gestão' },
      { nivel:3, cargo:'Coordenador Comercial', salarioMin:5000,  salarioMax:7500,  req:'3+ anos, superior'        },
      { nivel:4, cargo:'Analista Sr',           salarioMin:3500,  salarioMax:5000,  req:'3+ anos'                  },
      { nivel:5, cargo:'Analista Pl',           salarioMin:2500,  salarioMax:3500,  req:'2+ anos'                  },
      { nivel:6, cargo:'Analista Jr',           salarioMin:1800,  salarioMax:2500,  req:'0-2 anos, cursando'       },
      { nivel:7, cargo:'Assistente',            salarioMin:1320,  salarioMax:1800,  req:'Ensino médio'             },
      { nivel:8, cargo:'Estagiário',            salarioMin:800,   salarioMax:1200,  req:'Superior cursando 3º+'    },
    ]
  },
  {
    funcao: 'RH', cor: '#2563eb',
    cargos: [
      { nivel:1, cargo:'Diretor de RH',       salarioMin:12000, salarioMax:22000, req:'10+ anos, pós-graduação'  },
      { nivel:2, cargo:'Gerente de RH',        salarioMin:7000,  salarioMax:11000, req:'5+ anos'                 },
      { nivel:3, cargo:'Coordenador de RH',    salarioMin:4500,  salarioMax:7000,  req:'3+ anos'                 },
      { nivel:4, cargo:'Analista Sr',          salarioMin:3200,  salarioMax:4500,  req:'3+ anos'                 },
      { nivel:5, cargo:'Analista Pl',          salarioMin:2200,  salarioMax:3200,  req:'2+ anos'                 },
      { nivel:6, cargo:'Analista Jr',          salarioMin:1600,  salarioMax:2200,  req:'0-2 anos'                },
      { nivel:7, cargo:'Assistente de RH',     salarioMin:1320,  salarioMax:1600,  req:'Ensino médio'            },
      { nivel:8, cargo:'Estagiário de RH',     salarioMin:700,   salarioMax:1000,  req:'Superior cursando 2º+'   },
    ]
  },
  {
    funcao: 'TI', cor: '#7c3aed',
    cargos: [
      { nivel:1, cargo:'CTO / Diretor de TI',  salarioMin:18000, salarioMax:35000, req:'10+ anos'                },
      { nivel:2, cargo:'Gerente de TI',         salarioMin:10000, salarioMax:18000, req:'7+ anos'                 },
      { nivel:3, cargo:'Coordenador de TI',     salarioMin:7000,  salarioMax:10000, req:'5+ anos'                 },
      { nivel:4, cargo:'Dev Senior',            salarioMin:8000,  salarioMax:14000, req:'5+ anos'                 },
      { nivel:5, cargo:'Dev Pleno',             salarioMin:4500,  salarioMax:8000,  req:'2-5 anos'                },
      { nivel:6, cargo:'Dev Junior',            salarioMin:2500,  salarioMax:4500,  req:'0-2 anos'                },
      { nivel:7, cargo:'Suporte Técnico',       salarioMin:1800,  salarioMax:3000,  req:'Técnico/superior'        },
      { nivel:8, cargo:'Estagiário de TI',      salarioMin:1000,  salarioMax:1500,  req:'Superior cursando 3º+'   },
    ]
  },
];

// Estado global
let recrAbaAtiva    = 'pipeline';
let vagaSelecionada = null;
let recrutTrilhaSel = 0;
let recrutSalEdit   = {};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderRecrutamento() {
  const todasVagas     = recrutData.vagas;
  const todosCandidat  = todasVagas.flatMap(v => v.candidatos);
  const emPipeline     = todosCandidat.filter(c => c.status === 'pendente').length;
  const aprovados      = todosCandidat.filter(c => c.status === 'aprovado').length;
  const reprovados     = todosCandidat.filter(c => c.status === 'reprovado').length;
  const altaPrior      = todasVagas.filter(v => v.prioridade === 'alta').length;

  // Time-to-hire médio (simulado em dias)
  const tth = 18;

  return `
  <div class="depto-page">

    <!-- ── BANNER ─────────────────────────────── -->
    <div class="recr-banner">
      <div class="recr-banner-left">
        <div class="recr-banner-icon">🔍</div>
        <div>
          <h2>Recrutamento & Seleção</h2>
          <p>Pipeline integrado · Indeed · Bitrix24</p>
        </div>
      </div>
      <div class="recr-banner-stats">
        <div class="recr-banner-stat">
          <strong>${todasVagas.length}</strong><span>Vagas</span>
        </div>
        <div class="recr-banner-stat">
          <strong>${todosCandidat.length}</strong><span>Candidatos</span>
        </div>
        <div class="recr-banner-stat">
          <strong>${tth}d</strong><span>Time-to-hire</span>
        </div>
        <div class="recr-banner-stat destaque">
          <strong>${aprovados}</strong><span>Aprovados</span>
        </div>
      </div>
    </div>

    <!-- ── KPIs ───────────────────────────────── -->
    <div class="depto-cards">
      <div class="depto-card" onclick="recrSwitchTab(null,'vagas')" style="cursor:pointer">
        <div class="depto-card-icon">📋</div>
        <div class="depto-card-info"><strong>${todasVagas.length}</strong><span>Vagas abertas</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #d97706">
        <div class="depto-card-icon">⏳</div>
        <div class="depto-card-info"><strong>${emPipeline}</strong><span>Em pipeline</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #16a34a">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${aprovados}</strong><span>Aprovados</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #dc2626">
        <div class="depto-card-icon">🎯</div>
        <div class="depto-card-info"><strong>${altaPrior}</strong><span>Alta prioridade</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">⏱️</div>
        <div class="depto-card-info"><strong>${tth} dias</strong><span>Time-to-hire médio</span></div>
      </div>
    </div>

    <!-- ── ABAS ───────────────────────────────── -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="recrSwitchTab(this,'pipeline')">📊 Pipeline Kanban</button>
      <button class="exp-tab" onclick="recrSwitchTab(this,'vagas')">📁 Vagas</button>
      <button class="exp-tab" onclick="recrSwitchTab(this,'mapeamento')">🧠 Mapeamento</button>
      <button class="exp-tab" onclick="recrSwitchTab(this,'cargos')">🏗️ Descritivo de Cargos</button>
    </div>
    <div id="recr-content">
      ${recrRenderAba('pipeline')}
    </div>

    <!-- Modal candidato -->
    <div class="modal-overlay" id="modal-candidato" style="display:none" onclick="if(event.target.id==='modal-candidato')this.style.display='none'">
      <div class="modal-box" style="max-width:700px;max-height:90vh;overflow-y:auto" id="modal-candidato-box"></div>
    </div>

    <!-- Modal nova vaga -->
    <div class="modal-overlay" id="modal-nova-vaga" style="display:none" onclick="if(event.target.id==='modal-nova-vaga')this.style.display='none'">
      <div class="modal-box" style="max-width:640px">${recrFormNovaVaga()}</div>
    </div>

    <!-- Modal mapeamento -->
    <div class="modal-overlay" id="modal-mapeamento" style="display:none" onclick="if(event.target.id==='modal-mapeamento')this.style.display='none'">
      <div class="modal-box" style="max-width:520px" id="modal-mapeamento-box">${recrFormMapeamento()}</div>
    </div>

  </div>`;
}

function initPage_recrutamento() {}

function recrSwitchTab(btn, aba) {
  recrAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const tabs = document.querySelectorAll('.exp-tab');
    const idx = ['pipeline','vagas','mapeamento','cargos'].indexOf(aba);
    if (tabs[idx]) tabs[idx].classList.add('active');
  }
  const el = document.getElementById('recr-content');
  if (el) el.innerHTML = recrRenderAba(aba);
}

function recrRenderAba(aba) {
  if (aba === 'pipeline')   return recrRenderPipeline();
  if (aba === 'vagas')      return recrRenderVagas();
  if (aba === 'mapeamento') return recrRenderMapeamento();
  if (aba === 'cargos')     return recrRenderCargos();
  return '';
}

// ─────────────────────────────────────────────
// ABA 1 — PIPELINE KANBAN
// ─────────────────────────────────────────────
function recrRenderPipeline() {
  const etapas = recrutData.etapasNomes;
  const todos   = recrutData.vagas.flatMap(v =>
    v.candidatos.filter(c => c.status !== 'reprovado').map(c => ({ ...c, vagaTitulo: v.titulo, vagaId: v.id }))
  );

  const reprovados = recrutData.vagas.flatMap(v =>
    v.candidatos.filter(c => c.status === 'reprovado').map(c => ({ ...c, vagaTitulo: v.titulo, vagaId: v.id }))
  );

  const colunas = etapas.map((nome, idx) => ({
    nome,
    idx: idx + 1,
    cor: ['#6b7280','#2563eb','#7c3aed','#d97706','#16a34a'][idx],
    candidatos: todos.filter(c => c.etapa === idx + 1),
  }));

  const taxaAprovacao = todos.length > 0
    ? Math.round((todos.filter(c => c.etapa === 5).length / todos.length) * 100)
    : 0;

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- Mini funil -->
    <div class="recr-funil-mini">
      ${colunas.map(col => `
        <div class="recr-funil-etapa">
          <div class="recr-funil-bar" style="background:${col.cor}">
            <span>${col.candidatos.length}</span>
          </div>
          <small>${col.nome}</small>
        </div>
        ${col.idx < 5 ? '<div class="recr-funil-arrow">›</div>' : ''}
      `).join('')}
      <div style="margin-left:auto;font-size:12px;color:var(--text-muted)">Taxa aprovação: <strong style="color:#16a34a">${taxaAprovacao}%</strong></div>
    </div>

    <!-- Kanban board -->
    <div class="recr-kanban">
      ${colunas.map(col => `
        <div class="recr-kanban-col">
          <div class="recr-kanban-col-header" style="border-top:3px solid ${col.cor}">
            <span style="font-weight:800;font-size:13px">${col.nome}</span>
            <span class="recr-kanban-count" style="background:${col.cor}20;color:${col.cor}">${col.candidatos.length}</span>
          </div>
          <div class="recr-kanban-col-body">
            ${col.candidatos.length > 0
              ? col.candidatos.map(c => recrKanbanCard(c, col.cor)).join('')
              : `<div class="recr-kanban-vazio">Nenhum candidato</div>`
            }
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Reprovados -->
    ${reprovados.length > 0 ? `
    <div class="depto-section" style="border-left:4px solid #dc2626">
      <div class="section-header">
        <h3>❌ Reprovados (${reprovados.length})</h3>
        <button class="link-btn" onclick="this.closest('.depto-section').querySelector('.recr-reprov-lista').classList.toggle('hidden')">Mostrar/Ocultar</button>
      </div>
      <div class="recr-reprov-lista hidden" style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        ${reprovados.map(c => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;opacity:.75">
            <div class="abs-avatar" style="width:28px;height:28px;font-size:9px;flex-shrink:0">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <div style="flex:1;min-width:0">
              <strong style="font-size:12px">${c.nome}</strong>
              <small style="display:block;color:var(--text-muted)">${c.vagaTitulo} · Etapa ${c.etapa} · ${c.dataInscricao}</small>
            </div>
            <button class="link-btn" onclick="recrAbrirCandidato(${c.vagaId},${c.id})">Ver</button>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

  </div>`;
}

function recrKanbanCard(c, cor) {
  const nota = c.nota ? `<span style="font-size:10px;font-weight:700;background:${c.nota>=8?'#dcfce7':c.nota>=6?'#fef9c3':'#fee2e2'};color:${c.nota>=8?'#15803d':c.nota>=6?'#854d0e':'#991b1b'};padding:1px 6px;border-radius:20px">${c.nota}</span>` : '';
  return `
  <div class="recr-kanban-card" onclick="recrAbrirCandidato(${c.vagaId},${c.id})">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div class="abs-avatar" style="width:28px;height:28px;font-size:9px;flex-shrink:0;background:${cor}20;color:${cor}">
        ${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}
      </div>
      <div style="flex:1;min-width:0">
        <strong style="font-size:12px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.nome}</strong>
        <small style="color:var(--text-muted);font-size:10px">${c.vagaTitulo}</small>
      </div>
      ${nota}
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <span style="font-size:10px;background:var(--surface);border:1px solid var(--border);padding:1px 6px;border-radius:20px;color:var(--text-muted)">${c.origem}</span>
      <span style="font-size:10px;color:var(--text-muted)">${c.dataInscricao}</span>
    </div>
    <div style="display:flex;gap:4px;margin-top:8px">
      <button class="link-btn" style="font-size:10px;padding:3px 8px" onclick="event.stopPropagation();recrAprovar(${c.vagaId},${c.id})">✓ Avançar</button>
      <button class="link-btn" style="font-size:10px;padding:3px 8px;color:#dc2626" onclick="event.stopPropagation();recrReprovar(${c.vagaId},${c.id})">✕</button>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// ABA 2 — VAGAS
// ─────────────────────────────────────────────
function recrRenderVagas() {
  const priorCor = { alta:'#dc2626', media:'#d97706', baixa:'#16a34a' };
  const statusCor = { 'Aberta':'pago', 'Em triagem':'pendente', 'Pausada':'inativo', 'Encerrada':'inativo' };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>📁 Vagas em Aberto (${recrutData.vagas.length})</h3>
      <div style="display:flex;gap:8px">
        <select style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none"
          onchange="recrFiltrarVagas(this.value)">
          <option value="">Todos os deptos</option>
          ${[...new Set(recrutData.vagas.map(v=>v.depto))].map(d=>`<option value="${d}">${d}</option>`).join('')}
        </select>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="recrAbrirNovaVaga()">+ Nova Vaga</button>
      </div>
    </div>

    <div class="recr-vagas-grid" id="recr-vagas-grid">
      ${recrutData.vagas.map(v => recrVagaCard(v, priorCor, statusCor)).join('')}
    </div>

  </div>`;
}

function recrVagaCard(v, priorCor, statusCor) {
  const total     = v.candidatos.length;
  const pendentes = v.candidatos.filter(c => c.status === 'pendente').length;
  const aprovados = v.candidatos.filter(c => c.status === 'aprovado').length;
  const priC = priorCor || { alta:'#dc2626', media:'#d97706', baixa:'#16a34a' };
  const stC  = statusCor || { 'Aberta':'pago' };

  return `
  <div class="recr-vaga-card">
    <div class="recr-vaga-card-header">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
          <h3 class="recr-vaga-titulo">${v.titulo}</h3>
          <span style="font-size:10px;font-weight:700;background:${priC[v.prioridade]||'#6b7280'}20;color:${priC[v.prioridade]||'#6b7280'};padding:2px 8px;border-radius:20px">${v.prioridade?.toUpperCase()}</span>
        </div>
        <div class="recr-vaga-meta">
          <span>🏢 ${v.depto}</span>
          <span>📍 ${v.local}</span>
          <span>📄 ${v.contrato}</span>
          <span>💰 R$ ${v.salarioMin?.toLocaleString('pt-BR')} — R$ ${v.salarioMax?.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <span class="badge-status ${stC[v.status]||'pendente'}">${v.status}</span>
    </div>

    <p class="recr-vaga-desc">${v.descricao}</p>

    <!-- Funil da vaga -->
    <div class="recr-vaga-funil">
      ${recrutData.etapasNomes.map((e, i) => {
        const count = v.candidatos.filter(c => c.etapa === i+1 && c.status !== 'reprovado').length;
        const cores = ['#6b7280','#2563eb','#7c3aed','#d97706','#16a34a'];
        return `
          <div class="recr-vaga-funil-etapa" title="${e}: ${count}">
            <div class="recr-vaga-funil-bar" style="background:${cores[i]};opacity:${count>0?1:.25}"></div>
            <span style="font-size:9px;font-weight:700;color:${cores[i]}">${count}</span>
          </div>`;
      }).join('')}
    </div>

    <!-- Stats -->
    <div class="recr-vaga-stats">
      <div class="recr-vaga-stat"><strong>${total}</strong><span>candidatos</span></div>
      <div class="recr-vaga-stat"><strong>${pendentes}</strong><span>em análise</span></div>
      <div class="recr-vaga-stat"><strong>${aprovados}</strong><span>aprovados</span></div>
      <div class="recr-vaga-stat"><strong>${v.dataAbertura}</strong><span>abertura</span></div>
    </div>

    <!-- Ações -->
    <div class="recr-vaga-acoes">
      <button class="btn-primary" style="padding:7px 14px;font-size:12px" onclick="recrVerCandidatos(${v.id})">👥 Ver candidatos (${total})</button>
      <button class="link-btn" onclick="recrAdicionarCandidato(${v.id})">+ Candidato</button>
      <button class="link-btn" onclick="recrEditarVaga(${v.id})">✏️ Editar</button>
      <button class="link-btn" onclick="recrPublicarIndeed(${v.id})">
        <img src="https://logo.clearbit.com/indeed.com" alt="Indeed" style="width:12px;height:12px;vertical-align:middle" onerror="this.style.display='none'" /> Publicar
      </button>
    </div>
  </div>`;
}

function recrFiltrarVagas(depto) {
  const grid = document.getElementById('recr-vagas-grid');
  if (!grid) return;
  const lista = depto ? recrutData.vagas.filter(v => v.depto === depto) : recrutData.vagas;
  const priC = { alta:'#dc2626', media:'#d97706', baixa:'#16a34a' };
  const stC  = { 'Aberta':'pago', 'Em triagem':'pendente', 'Pausada':'inativo' };
  grid.innerHTML = lista.map(v => recrVagaCard(v, priC, stC)).join('') || `<div class="empty-state" style="padding:24px">Nenhuma vaga para este departamento.</div>`;
}

// ─────────────────────────────────────────────
// CANDIDATOS DA VAGA — painel lateral (usado no ver)
// ─────────────────────────────────────────────
function recrVerCandidatos(vagaId) {
  vagaSelecionada = recrutData.vagas.find(v => v.id === vagaId);
  if (!vagaSelecionada) return;

  const etNomes = recrutData.etapasNomes;
  const etCores = ['#6b7280','#2563eb','#7c3aed','#d97706','#16a34a'];

  const html = `
  <div class="depto-page" style="padding:0">
    <div class="section-header" style="padding:0 0 12px">
      <div>
        <h3>👥 ${vagaSelecionada.titulo}</h3>
        <small style="color:var(--text-muted)">${vagaSelecionada.depto} · ${vagaSelecionada.candidatos.length} candidatos · Aberta em ${vagaSelecionada.dataAbertura}</small>
      </div>
      <div style="display:flex;gap:8px">
        <button class="link-btn" onclick="recrAdicionarCandidato(${vagaId})">+ Candidato</button>
        <button class="link-btn" onclick="recrSwitchTab(null,'pipeline')">📊 Ver no pipeline</button>
      </div>
    </div>

    ${etNomes.map((nome, idx) => {
      const lista = vagaSelecionada.candidatos.filter(c => c.etapa === idx+1 && c.status !== 'reprovado');
      if (lista.length === 0) return '';
      return `
        <div class="depto-section" style="border-left:3px solid ${etCores[idx]}">
          <div class="section-header">
            <h4 style="color:${etCores[idx]}">${nome} (${lista.length})</h4>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${lista.map(c => `
              <div class="recr-cand-row" onclick="recrAbrirCandidato(${vagaId},${c.id})">
                <div class="abs-avatar" style="width:32px;height:32px;font-size:10px;flex-shrink:0">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                <div style="flex:1;min-width:0">
                  <strong style="font-size:13px">${c.nome}</strong>
                  <div style="display:flex;gap:8px;margin-top:2px;flex-wrap:wrap">
                    <small style="color:var(--text-muted)">${c.email}</small>
                    <small style="color:var(--text-muted)">${c.telefone}</small>
                    <small style="color:var(--text-muted)">📅 ${c.dataInscricao}</small>
                  </div>
                </div>
                ${c.nota ? `<span class="recr-nota ${c.nota>=8?'alta':c.nota>=6?'media':'baixa'}">${c.nota}</span>` : ''}
                <div class="decisao-btns" style="gap:4px;flex-shrink:0">
                  <button class="btn-aprovar" style="padding:4px 10px;font-size:11px" onclick="event.stopPropagation();recrAprovar(${vagaId},${c.id})">✓</button>
                  <button style="padding:4px 10px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600"
                    onclick="event.stopPropagation();recrReprovar(${vagaId},${c.id})">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }).join('')}

    ${vagaSelecionada.candidatos.filter(c=>c.status==='reprovado').length > 0 ? `
    <div style="font-size:12px;color:var(--text-muted);padding:8px 0">
      ❌ ${vagaSelecionada.candidatos.filter(c=>c.status==='reprovado').length} reprovado(s) —
      <button class="link-btn" style="font-size:12px" onclick="this.nextElementSibling.classList.toggle('hidden')">mostrar</button>
      <div class="hidden" style="margin-top:8px;display:flex;flex-direction:column;gap:4px">
        ${vagaSelecionada.candidatos.filter(c=>c.status==='reprovado').map(c=>`
          <div style="padding:6px 10px;background:#fef2f2;border-radius:6px;font-size:12px;display:flex;justify-content:space-between">
            <span>${c.nome}</span>
            <button class="link-btn" style="font-size:11px" onclick="recrAbrirCandidato(${vagaId},${c.id})">Ver</button>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
  </div>`;

  // Injeta no conteúdo
  document.getElementById('recr-content').innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:16px">
      <button class="link-btn" onclick="recrSwitchTab(null,'vagas')" style="align-self:start;padding:8px 12px">← Voltar às Vagas</button>
      <div>${html}</div>
    </div>`;
}

// ─────────────────────────────────────────────
// MODAL CANDIDATO COMPLETO
// ─────────────────────────────────────────────
function recrAbrirCandidato(vagaId, candidatoId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  if (!vaga) return;
  vagaSelecionada = vaga;
  const c = vaga.candidatos.find(x => x.id === candidatoId);
  if (!c) return;

  const hoje       = new Date().toISOString().split('T')[0];
  const etapaNome  = recrutData.etapasNomes[c.etapa - 1] || `Etapa ${c.etapa}`;
  const etCores    = ['#6b7280','#2563eb','#7c3aed','#d97706','#16a34a'];
  const msgAuto    = recrGerarMensagem('entrevista', c, vaga);

  document.getElementById('modal-candidato-box').innerHTML = `
    <!-- HEADER DO CANDIDATO -->
    <div class="recr-modal-header">
      <div style="display:flex;align-items:center;gap:14px">
        <div class="abs-avatar" style="width:52px;height:52px;font-size:16px;background:linear-gradient(135deg,#2563eb,#7c3aed)">
          ${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}
        </div>
        <div>
          <h3 style="font-size:18px;font-weight:800;margin-bottom:4px">${c.nome}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="mes-badge">${vaga.titulo}</span>
            <span style="font-size:11px;background:${etCores[c.etapa-1]}20;color:${etCores[c.etapa-1]};padding:2px 8px;border-radius:20px;font-weight:700">${etapaNome}</span>
            <span class="badge-status ${c.status==='aprovado'?'pago':c.status==='reprovado'?'inativo':'pendente'}">${c.status}</span>
          </div>
        </div>
      </div>
      <button class="modal-close" onclick="document.getElementById('modal-candidato').style.display='none'">✕</button>
    </div>

    <!-- PIPELINE VISUAL -->
    <div class="recr-modal-pipeline">
      ${recrutData.etapasNomes.map((e, i) => `
        <div class="recr-pipeline-step ${i+1===c.etapa?'atual':i+1<c.etapa?'feito':''}">
          <div class="recr-pipeline-circle" style="background:${i+1<=c.etapa?etCores[i]:'var(--border)'}">
            ${i+1<c.etapa?'✓':i+1===c.etapa?'●':`${i+1}`}
          </div>
          <span>${e}</span>
        </div>
        ${i<4?'<div class="recr-pipeline-linha '+(i+1<c.etapa?'feita':'')+'"></div>':''}
      `).join('')}
    </div>

    <!-- INFORMAÇÕES -->
    <div class="recr-modal-grid">

      <!-- CURRÍCULO SIMULADO -->
      <div>
        <div class="recr-modal-section-title">📋 Currículo — ${c.origem}</div>
        <div class="recr-curriculo">
          <div class="recr-cur-row"><span>📧</span><strong>E-mail</strong><span>${c.email}</span></div>
          <div class="recr-cur-row"><span>📱</span><strong>Telefone</strong><span>${c.telefone}</span></div>
          <div class="recr-cur-row"><span>💼</span><strong>Experiência</strong><span>${c.exp}</span></div>
          <div class="recr-cur-row"><span>🎓</span><strong>Formação</strong><span>${c.formacao}</span></div>
          <div class="recr-cur-row"><span>📅</span><strong>Inscrito em</strong><span>${c.dataInscricao}</span></div>
          <div class="recr-cur-row"><span>📍</span><strong>Origem</strong><span>${c.origem}</span></div>
          ${c.nota ? `<div class="recr-cur-row"><span>⭐</span><strong>Nota</strong><span class="recr-nota ${c.nota>=8?'alta':c.nota>=6?'media':'baixa'}" style="font-size:14px">${c.nota}/10</span></div>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="link-btn" onclick="recrUploadArq(${vagaId},'${c.nome}')">📎 Anexar currículo</button>
          <button class="link-btn" onclick="recrVerArquivos(${vagaId},'${c.nome}')">📁 Ver arquivos</button>
        </div>
      </div>

      <!-- AGENDAR ENTREVISTA -->
      <div>
        <div class="recr-modal-section-title">📅 Agendar Entrevista — ${etapaNome}</div>
        <div class="exp-form" style="gap:8px">
          <div class="form-row">
            <div><label>Data</label><input type="date" id="recr-ent-data" value="${hoje}" /></div>
            <div><label>Hora</label><input type="time" id="recr-ent-hora" value="09:00" /></div>
          </div>
          <label>Formato</label>
          <select id="recr-ent-fmt">
            <option>Presencial</option>
            <option>Online — Google Meet</option>
            <option>Online — Zoom</option>
            <option>Híbrido</option>
          </select>
          <label>Mensagem (editável)</label>
          <textarea id="recr-ent-msg" rows="5" style="font-size:12px">${msgAuto}</textarea>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-primary" onclick="recrCopiarMsg('recr-ent-msg')">📋 Copiar mensagem</button>
            <button class="link-btn" onclick="recrGerarNovaMsg(${vagaId},${candidatoId})">🔄 Regenerar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- NOTA -->
    <div style="padding:0 0 12px">
      <div class="recr-modal-section-title">⭐ Avaliar Candidato</div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <input type="range" id="recr-nota-range" min="0" max="10" step="0.5" value="${c.nota||5}"
          oninput="document.getElementById('recr-nota-val').textContent=this.value"
          style="flex:1;min-width:120px" />
        <strong id="recr-nota-val" style="font-size:18px;min-width:40px">${c.nota||5}</strong>
        <button class="link-btn" onclick="recrSalvarNota(${vagaId},${candidatoId})">💾 Salvar nota</button>
      </div>
    </div>

    <!-- DECISÃO -->
    <div class="recr-modal-decisao">
      <div class="recr-modal-section-title">🎯 Decisão — ${etapaNome}</div>
      <div class="decisao-btns">
        <button class="btn-aprovar" onclick="recrAprovar(${vagaId},${candidatoId},true)">
          ✅ Aprovar ${c.etapa < 5 ? '→ ' + recrutData.etapasNomes[c.etapa] : '(Contratar)'}
        </button>
        <button class="btn-reprovar" onclick="recrReprovar(${vagaId},${candidatoId},true)">
          ❌ Reprovar candidato
        </button>
      </div>
      <div id="recr-decisao-resultado" style="margin-top:12px"></div>
    </div>

    <!-- INTEGRAÇÃO BITRIX24 -->
    <div style="margin-top:12px;padding:12px 14px;background:var(--primary-light);border-radius:10px;font-size:12px;color:var(--primary);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span>🔗 <strong>Bitrix24:</strong> Candidato aprovado gera tarefa de admissão automaticamente.</span>
      <button class="link-btn" style="font-size:11px" onclick="recrCriarTarefaBitrix('${c.nome}','${vaga.titulo}')">Criar tarefa agora</button>
    </div>
  `;

  document.getElementById('modal-candidato').style.display = 'flex';
}

// ─────────────────────────────────────────────
// APROVAR / REPROVAR
// ─────────────────────────────────────────────
function recrAprovar(vagaId, candidatoId, noModal) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  const c    = vaga?.candidatos.find(x => x.id === candidatoId);
  if (!c) return;

  const etAnterior = c.etapa;
  if (c.etapa < 5) {
    c.etapa++;
    c.status = 'pendente';
  } else {
    c.status = 'aprovado';
  }

  const tipoMsg = c.etapa === 2 ? 'aprovado_etapa2' : c.etapa === 3 ? 'aprovado_etapa3' : c.etapa >= 5 ? 'aprovado_final' : 'entrevista';
  const msg = recrGerarMensagem(tipoMsg, c, vaga);
  const novaEtapa = recrutData.etapasNomes[c.etapa-1] || 'Contratado';

  if (noModal) {
    document.getElementById('recr-decisao-resultado').innerHTML = `
      <div class="decisao-resultado aprovado">
        <strong>✅ Candidato avançou para: ${novaEtapa}</strong>
        <label style="margin-top:10px;display:block;font-size:12px;font-weight:600;color:var(--text-muted)">Mensagem sugerida:</label>
        <textarea id="msg-res" rows="6" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:10px;font-size:12px;margin-top:6px;font-family:inherit;box-sizing:border-box">${msg}</textarea>
        <button class="btn-primary" style="margin-top:8px" onclick="recrCopiarMsg('msg-res')">📋 Copiar mensagem</button>
      </div>`;
  } else {
    // Atualiza pipeline
    document.getElementById('recr-content').innerHTML = recrRenderAba(recrAbaAtiva);
  }

  if (c.etapa >= 5 || c.status === 'aprovado') {
    recrCriarTarefaBitrix(c.nome, vaga.titulo);
  }
}

async function recrReprovar(vagaId, candidatoId, noModal) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  const c    = vaga?.candidatos.find(x => x.id === candidatoId);
  if (!c) return;

  const ok = await Toast.confirmar(`Reprovar <strong>${DOM.sanitize(c.nome)}</strong>?`);
  if (!ok) return;
  c.status = 'reprovado';

  const tipoMsg = c.etapa === 1 ? 'reprovado_etapa1' : c.etapa === 2 ? 'reprovado_etapa2' : 'reprovado_etapa3';
  const msg = recrGerarMensagem(tipoMsg, c, vaga);

  if (noModal) {
    document.getElementById('recr-decisao-resultado').innerHTML = `
      <div class="decisao-resultado reprovado">
        <strong>❌ Candidato reprovado na Etapa ${c.etapa} — ${recrutData.etapasNomes[c.etapa-1]}</strong>
        <label style="margin-top:10px;display:block;font-size:12px;font-weight:600;color:var(--text-muted)">Mensagem de feedback:</label>
        <textarea id="msg-res" rows="6" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:10px;font-size:12px;margin-top:6px;font-family:inherit;box-sizing:border-box">${msg}</textarea>
        <button class="btn-primary" style="margin-top:8px" onclick="recrCopiarMsg('msg-res')">📋 Copiar mensagem</button>
      </div>`;
  } else {
    document.getElementById('recr-content').innerHTML = recrRenderAba(recrAbaAtiva);
  }
}

function recrSalvarNota(vagaId, candidatoId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  const c    = vaga?.candidatos.find(x => x.id === candidatoId);
  const nota = parseFloat(document.getElementById('recr-nota-range')?.value || 5);
  if (c) { c.nota = nota; Toast.success(`Nota ${nota} salva para ${DOM.sanitize(c.nome)}!`); }
}

// ─────────────────────────────────────────────
// MENSAGENS AUTOMÁTICAS
// ─────────────────────────────────────────────
function recrGerarMensagem(tipo, c, vaga) {
  const nome    = c.nome.split(' ')[0];
  const cargo   = vaga.titulo;
  const depto   = vaga.depto;
  const ph      = (t) => `${t}\n\n📅 Data: [DATA]\n⏰ Hora: [HORA]\n📍 Formato: [FORMATO]\n\nPor favor, confirme sua disponibilidade.\n\nEquipe hi Conecta RH`;

  const msgs = {
    entrevista: {
      1: ph(`Olá, ${nome}! 😊\n\nSeu currículo foi selecionado para a vaga de ${cargo} e gostaríamos de convidá-lo(a) para uma entrevista inicial com o RH.`),
      2: ph(`Olá, ${nome}! 🎉\n\nParabéns por avançar para a 2ª etapa do processo para ${cargo}!\n\nEsta etapa consiste em uma avaliação técnica.`),
      3: ph(`Olá, ${nome}! 🚀\n\nParabéns! Você está na 3ª etapa — entrevista com o gestor da área de ${depto}.`),
      4: ph(`Olá, ${nome}! ⭐\n\nExcelente! Você chegou à etapa de proposta para ${cargo}. Nossa equipe irá entrar em contato com os detalhes.`),
    },
    aprovado_etapa2: `Olá, ${nome}! 🎉\n\nParabéns! Você foi aprovado(a) na triagem inicial para ${cargo}!\n\nVocê avançou para a etapa de Avaliação Técnica.\n\n${ph('Aguardamos sua confirmação.')}`,
    aprovado_etapa3: `Olá, ${nome}! 🚀\n\nParabéns! Você passou da avaliação técnica para ${cargo}!\n\nPróxima etapa: Entrevista com o Gestor.\n\n${ph('')}`,
    aprovado_final:  `Olá, ${nome}! 🎊🎊\n\nÉ com imensa alegria que informamos: você foi APROVADO(A) para a vaga de ${cargo}!\n\nEntraremos em contato em breve com os detalhes para início.\n\nSeja muito bem-vindo(a) à família hi Conecta RH! 🚀\n\nEquipe hi Conecta RH`,
    reprovado_etapa1:`Olá, ${nome}.\n\nAgradecemos imensamente o seu interesse na vaga de ${cargo} e o tempo dedicado.\n\nApós análise cuidadosa dos perfis, não seguiremos com sua candidatura neste momento.\n\nSeu perfil ficará em nosso banco de talentos!\n\nAtenciosamente,\nEquipe hi Conecta RH`,
    reprovado_etapa2:`Olá, ${nome}.\n\nAgradecemos sua participação na avaliação técnica para ${cargo}.\n\nApós avaliação detalhada, não seguiremos nesta etapa.\n\nFoi um prazer conhecê-lo(a)!\n\nAtenciosamente,\nEquipe hi Conecta RH`,
    reprovado_etapa3:`Olá, ${nome}.\n\nObrigado por participar de todas as etapas para ${cargo}.\n\nApós entrevista com o gestor, não prosseguiremos desta vez.\n\nSeu perfil é muito qualificado — desejamos muito sucesso!\n\nAtenciosamente,\nEquipe hi Conecta RH`,
  };

  if (tipo === 'entrevista') return msgs.entrevista[c.etapa] || msgs.entrevista[1];
  return msgs[tipo] || '';
}

function recrCopiarMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  DOM.copiar(el.value || el.textContent);
}

function recrGerarNovaMsg(vagaId, candidatoId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  const c    = vaga?.candidatos.find(x => x.id === candidatoId);
  if (c && vaga) {
    const el = document.getElementById('recr-ent-msg');
    if (el) el.value = recrGerarMensagem('entrevista', c, vaga);
  }
}

// ─────────────────────────────────────────────
// ABA 3 — MAPEAMENTO COMPORTAMENTAL
// ─────────────────────────────────────────────
function recrRenderMapeamento() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>🧠 Mapeamento Comportamental</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="document.getElementById('modal-mapeamento').style.display='flex'">+ Mapear Candidato</button>
    </div>

    <div class="recr-mapa-grid">
      ${recrutPerfisBehavior.map((p, i) => `
        <div class="recr-mapa-card">
          <div class="recr-mapa-card-header">
            <h4>${p.vaga}</h4>
            <button class="link-btn" onclick="recrMapearVaga(${i})">🔍 Comparar</button>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin:0 0 10px">${p.descricao}</p>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
            ${p.comportamentos.map(c=>`<span style="font-size:10px;background:var(--primary-light);color:var(--primary);padding:2px 8px;border-radius:20px;font-weight:600">${c}</span>`).join('')}
          </div>
          ${Object.entries(p.perfil).map(([k,v])=>`
            <div style="margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;margin-bottom:2px">
                <span>${k}</span>
                <span style="color:${v>=80?'var(--success)':v>=60?'var(--primary)':'var(--warning)'}">${v}%</span>
              </div>
              <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${v}%;background:${v>=80?'var(--success)':v>=60?'var(--primary)':'var(--warning)'};border-radius:3px;transition:width .5s"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    ${recrutCandidatosMapeados.length > 0 ? `
    <div class="depto-section">
      <div class="section-header"><h3>📊 Candidatos Mapeados</h3></div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Candidato</th><th>Vaga</th><th>Compatibilidade</th><th>Pontos Fortes</th><th>Recomendação</th></tr></thead>
          <tbody>
            ${recrutCandidatosMapeados.map(c=>`
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.vaga}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;min-width:60px">
                      <div style="height:100%;width:${c.compat}%;background:${c.compat>=80?'var(--success)':c.compat>=60?'var(--primary)':'var(--danger)'};border-radius:3px"></div>
                    </div>
                    <strong style="color:${c.compat>=80?'var(--success)':c.compat>=60?'var(--primary)':'var(--danger)'};min-width:36px">${c.compat}%</strong>
                  </div>
                </td>
                <td style="font-size:12px;color:var(--text-muted)">${c.fortes}</td>
                <td><span class="badge-status ${c.compat>=80?'pago':c.compat>=60?'pendente':'inativo'}">${c.compat>=80?'✅ Recomendado':c.compat>=60?'Compatível':'⚠️ Atenção'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

  </div>`;
}

function recrMapearVaga(i) {
  document.getElementById('modal-mapeamento').style.display = 'flex';
  const sel = document.getElementById('recr-map-vaga');
  if (sel) sel.value = recrutPerfisBehavior[i].vaga;
}

function recrFormMapeamento() {
  return `
  <div class="modal-header">
    <h3>🧠 Mapear Candidato</h3>
    <button class="modal-close" onclick="document.getElementById('modal-mapeamento').style.display='none'">✕</button>
  </div>
  <div class="exp-form">
    <label>Nome do candidato</label>
    <input type="text" id="recr-map-nome" placeholder="Nome completo" />
    <label>Vaga pretendida</label>
    <select id="recr-map-vaga">
      ${recrutData.vagas.map(v=>`<option value="${v.titulo}">${v.titulo}</option>`).join('')}
    </select>
    <label style="margin-top:4px">Avalie cada competência (0–100)</label>
    ${['Liderança','Comunicação','Analítico','Criatividade','Execução','Relacionamento'].map(k=>`
      <div style="display:flex;align-items:center;gap:10px">
        <label style="width:120px;font-size:12px;font-weight:600;flex-shrink:0">${k}</label>
        <input type="range" id="recr-map-${k}" min="0" max="100" value="50" style="flex:1"
          oninput="document.getElementById('recr-mapval-${k}').textContent=this.value+'%'" />
        <span id="recr-mapval-${k}" style="width:36px;font-size:12px;font-weight:700;text-align:right">50%</span>
      </div>
    `).join('')}
    <button class="btn-primary" onclick="recrSalvarMapeamento()">✅ Calcular Compatibilidade</button>
  </div>`;
}

function recrSalvarMapeamento() {
  const nome = document.getElementById('recr-map-nome')?.value.trim();
  const vaga = document.getElementById('recr-map-vaga')?.value;
  if (!nome) { Toast.error('Informe o nome do candidato!'); return; }

  const chaves  = ['Liderança','Comunicação','Analítico','Criatividade','Execução','Relacionamento'];
  const perfil  = recrutPerfisBehavior.find(p=>p.vaga===vaga)?.perfil;

  let compat = 0;
  if (perfil) {
    chaves.forEach(k => {
      const val   = parseInt(document.getElementById(`recr-map-${k}`)?.value||50);
      const ideal = perfil[k] || 50;
      compat += Math.max(0, 100 - Math.abs(val - ideal));
    });
    compat = Math.round(compat / chaves.length);
  } else {
    compat = Math.round(chaves.reduce((a,k)=>a+parseInt(document.getElementById(`recr-map-${k}`)?.value||50),0)/chaves.length);
  }

  const fortes = chaves.filter(k=>parseInt(document.getElementById(`recr-map-${k}`)?.value||0)>=70).join(', ') || 'A avaliar';
  recrutCandidatosMapeados.push({ nome, vaga, compat, fortes });
  DOM.modal.fechar('modal-mapeamento');
  Toast.success(`${DOM.sanitize(nome)} mapeado! Compatibilidade com "${DOM.sanitize(vaga)}": ${compat}%`);
  document.getElementById('recr-content').innerHTML = recrRenderMapeamento();
}

// ─────────────────────────────────────────────
// ABA 4 — DESCRITIVO DE CARGOS (trilha salarial)
// ─────────────────────────────────────────────
function recrRenderCargos() {
  const trilha = recrutTrilhas[recrutTrilhaSel];

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>🏗️ Descritivo de Cargos — Trilha Salarial</h3>
      <div style="display:flex;gap:8px">
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="recrExportarTrilha()">⬇ Exportar</button>
        <button class="link-btn" onclick="recrAdicionarCargo()">+ Cargo</button>
        <button class="link-btn" onclick="recrAdicionarTrilha()">+ Função</button>
      </div>
    </div>

    <!-- Seletor de trilha -->
    <div class="recr-trilha-tabs">
      ${recrutTrilhas.map((t, i)=>`
        <button class="recr-trilha-tab ${i===recrutTrilhaSel?'active':''}" style="${i===recrutTrilhaSel?`background:${t.cor}15;color:${t.cor};border-color:${t.cor}`:''}"
          onclick="recrSelecionarTrilha(${i})">${t.funcao}</button>
      `).join('')}
    </div>

    <!-- Pirâmide de cargos -->
    <div class="depto-section">
      <div class="section-header" style="margin-bottom:16px">
        <h3 style="color:${trilha.cor}">Trilha — ${trilha.funcao}</h3>
        <small style="color:var(--text-muted)">${trilha.cargos.length} níveis</small>
      </div>
      <div class="recr-trilha-piramide">
        ${trilha.cargos.map((c, i) => {
          const salMin = recrutSalEdit[`${recrutTrilhaSel}-${i}-min`] ?? c.salarioMin;
          const salMax = recrutSalEdit[`${recrutTrilhaSel}-${i}-max`] ?? c.salarioMax;
          const larg   = 100 - (i * (60 / trilha.cargos.length));
          return `
          <div class="recr-trilha-row" style="width:${larg}%;border-left:3px solid ${trilha.cor}">
            <div class="recr-trilha-nivel" style="background:${trilha.cor}">N${c.nivel}</div>
            <div class="recr-trilha-info">
              <strong style="font-size:13px">${c.cargo}</strong>
              <small style="color:var(--text-muted)">${c.req}</small>
            </div>
            <div class="recr-trilha-sal">
              <span style="font-size:11px;color:var(--text-muted)">R$</span>
              <input type="number" class="recr-sal-input" value="${salMin}"
                onchange="recrEditarSal(${recrutTrilhaSel},${i},'min',this.value)" />
              <span style="color:var(--text-muted)">—</span>
              <input type="number" class="recr-sal-input" value="${salMax}"
                onchange="recrEditarSal(${recrutTrilhaSel},${i},'max',this.value)" />
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

  </div>`;
}

function recrSelecionarTrilha(i) {
  recrutTrilhaSel = i;
  document.getElementById('recr-content').innerHTML = recrRenderCargos();
}

function recrEditarSal(t, c, tipo, v) {
  recrutSalEdit[`${t}-${c}-${tipo}`] = parseInt(v)||0;
}

async function recrAdicionarTrilha() {
  const nome = await Toast.input('Nome da função (ex: Financeiro):');
  if (!nome) return;
  recrutTrilhas.push({ funcao: nome, cor: '#6b7280', cargos: [] });
  recrutTrilhaSel = recrutTrilhas.length - 1;
  document.getElementById('recr-content').innerHTML = recrRenderCargos();
  Toast.success(`Trilha "${DOM.sanitize(nome)}" criada!`);
}

async function recrAdicionarCargo() {
  const cargo  = await Toast.input('Nome do cargo:');
  if (!cargo) return;
  const salMinStr = await Toast.input('Salário mínimo (R$):');
  const salMaxStr = await Toast.input('Salário máximo (R$):');
  const req       = await Toast.input('Requisitos:') || '—';
  const salMin    = parseInt(salMinStr) || 0;
  const salMax    = parseInt(salMaxStr) || 0;
  const t         = recrutTrilhas[recrutTrilhaSel];
  t.cargos.push({ nivel: t.cargos.length + 1, cargo, salarioMin: salMin, salarioMax: salMax, req });
  document.getElementById('recr-content').innerHTML = recrRenderCargos();
  Toast.success(`Cargo "${DOM.sanitize(cargo)}" adicionado!`);
}

function recrExportarTrilha() {
  const t   = recrutTrilhas[recrutTrilhaSel];
  const txt = `DESCRITIVO DE CARGOS — ${t.funcao}\n${'='.repeat(50)}\n\n` +
    t.cargos.map(c => `N${c.nivel} — ${c.cargo}\n  Salário: ${Fmt.moeda(c.salarioMin)} — ${Fmt.moeda(c.salarioMax)}\n  Requisitos: ${c.req}\n`).join('\n');
  DOM.download(txt, `cargos-${t.funcao}.txt`, 'text/plain;charset=utf-8');
}

// ─────────────────────────────────────────────
// NOVA VAGA — FORMULÁRIO
// ─────────────────────────────────────────────
function recrFormNovaVaga() {
  return `
  <div class="modal-header">
    <h3>📋 Nova Vaga</h3>
    <button class="modal-close" onclick="document.getElementById('modal-nova-vaga').style.display='none'">✕</button>
  </div>
  <div class="exp-form">
    <label>Título da Vaga</label>
    <input type="text" id="nv-titulo" placeholder="Ex: Analista de Marketing" />
    <div class="form-row">
      <div>
        <label>Departamento</label>
        <select id="nv-depto">
          <option>RH</option><option>TI</option><option>Comercial</option>
          <option>Financeiro</option><option>Operações</option><option>Marketing</option><option>Logística</option>
        </select>
      </div>
      <div>
        <label>Tipo de Contrato</label>
        <select id="nv-contrato"><option>CLT</option><option>PJ</option><option>Temporário</option><option>Estágio</option></select>
      </div>
    </div>
    <div class="form-row">
      <div>
        <label>Salário Mínimo (R$)</label>
        <input type="number" id="nv-salmin" placeholder="3000" />
      </div>
      <div>
        <label>Salário Máximo (R$)</label>
        <input type="number" id="nv-salmax" placeholder="5000" />
      </div>
    </div>
    <div class="form-row">
      <div>
        <label>Localidade</label>
        <input type="text" id="nv-local" placeholder="Ex: João Pessoa - PB" />
      </div>
      <div>
        <label>Prioridade</label>
        <select id="nv-prioridade"><option value="alta">🔴 Alta</option><option value="media" selected>🟡 Média</option><option value="baixa">🟢 Baixa</option></select>
      </div>
    </div>
    <label>Descrição da Vaga</label>
    <textarea id="nv-descricao" rows="3" placeholder="Descreva as responsabilidades e o contexto da vaga..."></textarea>
    <label>Requisitos</label>
    <textarea id="nv-requisitos" rows="2" placeholder="Formação, experiência, habilidades técnicas..."></textarea>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn-primary" onclick="recrSalvarVaga()">✅ Criar Vaga</button>
      <button class="link-btn" onclick="recrSalvarVaga(true)">📤 Criar e Publicar no Indeed</button>
    </div>
  </div>`;
}

function recrAbrirNovaVaga() {
  document.getElementById('modal-nova-vaga').style.display = 'flex';
}

function recrSalvarVaga(publicar) {
  const titulo    = document.getElementById('nv-titulo')?.value.trim();
  const depto     = document.getElementById('nv-depto')?.value;
  const contrato  = document.getElementById('nv-contrato')?.value;
  const salMin    = parseInt(document.getElementById('nv-salmin')?.value)||0;
  const salMax    = parseInt(document.getElementById('nv-salmax')?.value)||0;
  const local     = document.getElementById('nv-local')?.value.trim() || 'João Pessoa - PB';
  const prioridade= document.getElementById('nv-prioridade')?.value || 'media';
  const desc      = document.getElementById('nv-descricao')?.value.trim() || '';
  const req       = document.getElementById('nv-requisitos')?.value.trim() || '';

  if (!titulo || !depto) { Toast.error('Preencha pelo menos título e departamento!'); return; }

  recrutData.vagas.push({
    id: recrutData.vagas.length + 1, titulo, depto, local, contrato,
    salarioMin: salMin, salarioMax: salMax, status: 'Aberta',
    dataAbertura: new Date().toLocaleDateString('pt-BR'),
    prioridade, descricao: desc, requisitos: req, origem: 'Indeed', candidatos: [],
  });

  DOM.modal.fechar('modal-nova-vaga');
  const msg = publicar
    ? `Vaga "${DOM.sanitize(titulo)}" criada e enviada para publicação no Indeed!`
    : `Vaga "${DOM.sanitize(titulo)}" cadastrada com sucesso!`;
  Toast.success(msg);
  document.getElementById('pageContainer').innerHTML = renderRecrutamento();
}

// ─────────────────────────────────────────────
// ADICIONAR CANDIDATO MANUALMENTE
// ─────────────────────────────────────────────
function recrAdicionarCandidato(vagaId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  if (!vaga) return;

  // Injeta formulário modal para entrada de dados (sem prompt nativo)
  const modalId = 'modal-add-candidato';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id    = modalId;
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px;width:90%;max-width:480px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:16px">➕ Adicionar Candidato — ${DOM.sanitize(vaga.titulo)}</h3>
        <button onclick="DOM.modal.fechar('${modalId}')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><label style="font-size:12px;font-weight:600;color:#64748b">Nome *</label>
          <input id="_ac_nome" placeholder="Nome completo" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px" /></div>
        <div><label style="font-size:12px;font-weight:600;color:#64748b">E-mail *</label>
          <input id="_ac_email" type="email" placeholder="email@exemplo.com" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px" /></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:12px;font-weight:600;color:#64748b">Telefone</label>
            <input id="_ac_tel" placeholder="(83) 99999-9999" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px" /></div>
          <div><label style="font-size:12px;font-weight:600;color:#64748b">Origem</label>
            <select id="_ac_orig" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px">
              <option>Indeed</option><option>LinkedIn</option><option>Indicação</option><option>Site</option><option>Manual</option>
            </select></div>
        </div>
        <div><label style="font-size:12px;font-weight:600;color:#64748b">Experiência</label>
          <input id="_ac_exp" placeholder="Ex: 2 anos em RH" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px" /></div>
        <div><label style="font-size:12px;font-weight:600;color:#64748b">Formação</label>
          <input id="_ac_form" placeholder="Ex: Psicologia — UFPB" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:4px" /></div>
      </div>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px">
        <button onclick="DOM.modal.fechar('${modalId}')" style="padding:10px 22px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:500">Cancelar</button>
        <button onclick="_recrSalvarCandidato(${vagaId},'${modalId}')" style="padding:10px 22px;border:none;border-radius:8px;background:var(--primary,#1b56d6);color:#fff;cursor:pointer;font-weight:600">✅ Salvar</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  setTimeout(() => modal.querySelector('#_ac_nome')?.focus(), 50);
}

function _recrSalvarCandidato(vagaId, modalId) {
  const nome  = document.getElementById('_ac_nome')?.value.trim();
  const email = document.getElementById('_ac_email')?.value.trim();
  const tel   = document.getElementById('_ac_tel')?.value.trim()  || '—';
  const orig  = document.getElementById('_ac_orig')?.value         || 'Manual';
  const exp   = document.getElementById('_ac_exp')?.value.trim()  || '—';
  const form  = document.getElementById('_ac_form')?.value.trim() || '—';

  if (!nome)  { Toast.error('Nome é obrigatório!');  return; }
  if (!email) { Toast.error('E-mail é obrigatório!'); return; }
  if (!Validators.email(email)) { Toast.error('E-mail inválido!'); return; }

  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  if (!vaga) return;

  const novoId = Math.max(0, ...recrutData.vagas.flatMap(v => v.candidatos.map(c => c.id))) + 1;
  vaga.candidatos.push({
    id: novoId,
    nome:  nome,
    email: email,
    telefone: tel,
    etapa: 1,
    status: 'pendente',
    origem: orig,
    dataInscricao: new Date().toLocaleDateString('pt-BR'),
    nota: null, notas: [], exp, formacao: form,
  });

  DOM.modal.fechar(modalId);
  Toast.success(`${DOM.sanitize(nome)} adicionado à vaga "${DOM.sanitize(vaga.titulo)}"!`);
  document.getElementById('pageContainer').innerHTML = renderRecrutamento();
}

async function recrEditarVaga(vagaId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  if (!vaga) return;
  const novoTitulo = await Toast.input('Título da vaga:', vaga.titulo);
  if (novoTitulo) {
    vaga.titulo = novoTitulo;
    document.getElementById('recr-content').innerHTML = recrRenderVagas();
    Toast.success('Vaga atualizada!');
  }
}

function recrPublicarIndeed(vagaId) {
  const vaga = recrutData.vagas.find(v => v.id === vagaId);
  if (vaga) Toast.info(`Vaga "${DOM.sanitize(vaga.titulo)}" enviada para o Indeed! Integração via API disponível após configurar o webhook em Integrações.`);
}

// ─────────────────────────────────────────────
// UPLOAD / ARQUIVOS
// ─────────────────────────────────────────────
const arquivosRecrutamento = {};

function recrUploadArq(vagaId, nome) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.pdf,.xlsx,.xls,.jpg,.jpeg,.png,.doc,.docx';
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    const key   = `${vagaId}-${nome}`;
    if (!arquivosRecrutamento[key]) arquivosRecrutamento[key] = [];
    files.forEach(f => {
      arquivosRecrutamento[key].push({ nome:f.name, tipo:f.name.split('.').pop().toUpperCase(), tamanho:(f.size/1024).toFixed(0)+' KB', data:new Date().toLocaleDateString('pt-BR'), url:URL.createObjectURL(f) });
    });
    Toast.success(`${files.length} arquivo(s) anexado(s) com sucesso!`);
  };
  input.click();
}

function recrVerArquivos(vagaId, nome) {
  const arqs = arquivosRecrutamento[`${vagaId}-${nome}`] || [];
  if (!arqs.length) { Toast.warning('Nenhum arquivo anexado ainda.'); return; }

  const modalId = 'modal-arquivos-recr';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:440px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="margin:0;font-size:15px">📎 Arquivos — ${DOM.sanitize(nome)}</h3>
        <button onclick="DOM.modal.fechar('${modalId}')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${arqs.map(a => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-radius:8px">
            <span style="font-size:20px">📄</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${DOM.sanitize(a.nome)}</div>
              <div style="font-size:11px;color:#94a3b8">${DOM.sanitize(a.tipo)} · ${DOM.sanitize(a.tamanho)} · ${DOM.sanitize(a.data)}</div>
            </div>
            <a href="${a.url}" download="${DOM.sanitize(a.nome)}" style="color:var(--primary,#1b56d6);font-size:18px;text-decoration:none">⬇</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// ─────────────────────────────────────────────
// INTEGRAÇÃO BITRIX24
// ─────────────────────────────────────────────
async function recrCriarTarefaBitrix(nomeCandidat, vaga) {
  const desc = BitrixService.templates.vagaPreenchida({
    titulo:    vaga,
    candidato: nomeCandidat,
    dataInicio: new Date().toLocaleDateString('pt-BR'),
  });
  try {
    await BitrixService.enviarTarefa({
      titulo:    `Admissão — ${nomeCandidat}`,
      descricao: desc,
    });
  } catch (e) {
    Toast.error('Erro ao criar tarefa Bitrix24: ' + e.message);
  }
}

// Compatibilidade com código legado
function selecionarVaga(id)     { recrVerCandidatos(id); }
function abrirCandidato(id)     { if (vagaSelecionada) recrAbrirCandidato(vagaSelecionada.id, id); }
function decidirCandidato(d)    { if (vagaSelecionada && candidatoSelecionado) { if(d==='aprovado') recrAprovar(vagaSelecionada.id,candidatoSelecionado.id,true); else recrReprovar(vagaSelecionada.id,candidatoSelecionado.id,true); } }
function copiarMensagem(id)     { recrCopiarMsg(id); }
function fecharModal(event)     { if (event.target.id==='modal-candidato') document.getElementById('modal-candidato').style.display='none'; }
function abrirNovaVaga()        { recrAbrirNovaVaga(); }
let candidatoSelecionado = null;
function exportarRecrutamentoExcel(vagas) {
  const colunas = ["Vaga", "Candidatos", "Aprovados", "Reprovados"];

  const dados = vagas.map(v => [
    v.titulo,
    v.total,
    v.aprovados,
    v.reprovados
  ]);

  exportarExcel("recrutamento", colunas, dados);
}


function exportarRecrutamentoPDF(vagas) {
  const linhas = vagas.map(v =>
    `${v.titulo} - ${v.total} candidatos (${v.aprovados} aprovados)`
  );

  exportarPDF("Relatório Recrutamento", linhas);
}