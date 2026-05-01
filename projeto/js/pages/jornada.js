// =============================================
// JORNADA DO COLABORADOR — REDESIGN PREMIUM V2
// =============================================

const jornadaConfig = {
  colaboradorAtual: {
    nome:     'João Silva',
    cargo:    'Analista de Logística',
    setor:    'Logística',
    avatar:   'JS',
    admissao: '01/05/2025',
    gestor:   'Carlos Ferreira',
    beneficios: {
      alimentacao:  true,
      saude:        true,
      odonto:       false,
      conexaoSaude: true,
      telemedicina: true,
      mobilidade:   'caju',
    },
    etapasCompletas: [1, 2],
    etapaAtual: 3,
  },

  etapas: [
    { id:1, label:'Boas-vindas',  icon:'👋', cor:'#7c3aed', desc:'Conheça a empresa e sua cultura'      },
    { id:2, label:'Documentos',   icon:'📄', cor:'#2563eb', desc:'Assine e envie seus documentos'       },
    { id:3, label:'Acessos',      icon:'🔐', cor:'#0ea5e9', desc:'Configure suas plataformas'           },
    { id:4, label:'Integrações',  icon:'🔗', cor:'#06b6d4', desc:'Ative suas ferramentas de trabalho'   },
    { id:5, label:'Benefícios',   icon:'💎', cor:'#d97706', desc:'Conheça e ative seus benefícios'      },
    { id:6, label:'Meu Time',     icon:'👥', cor:'#16a34a', desc:'Conheça seus colegas de equipe'       },
    { id:7, label:'Treinamentos', icon:'🎓', cor:'#dc2626', desc:'Inicie seus treinamentos obrigatórios' },
    { id:8, label:'Feedback',     icon:'💬', cor:'#ec4899', desc:'Compartilhe sua experiência conosco'  },
  ],

  treinamentos: {
    'Logística':  [
      { nome:'Gestão de Estoque',          duracao:'45min', obrigatorio:true,  progresso:100 },
      { nome:'Logística Reversa',          duracao:'60min', obrigatorio:true,  progresso:60  },
      { nome:'Processos de Expedição',     duracao:'45min', obrigatorio:true,  progresso:0   },
      { nome:'WMS — Sistema de Armazém',   duracao:'90min', obrigatorio:false, progresso:0   },
    ],
    'RH':         [
      { nome:'Legislação Trabalhista',     duracao:'60min', obrigatorio:true,  progresso:100 },
      { nome:'Gestão de Pessoas',          duracao:'45min', obrigatorio:true,  progresso:40  },
      { nome:'Recrutamento & Seleção',     duracao:'60min', obrigatorio:false, progresso:0   },
      { nome:'Folha de Pagamento',         duracao:'90min', obrigatorio:false, progresso:0   },
    ],
    'TI':         [
      { nome:'Segurança da Informação',    duracao:'60min', obrigatorio:true,  progresso:100 },
      { nome:'Desenvolvimento Ágil',       duracao:'45min', obrigatorio:true,  progresso:50  },
      { nome:'DevOps Básico',              duracao:'90min', obrigatorio:false, progresso:0   },
      { nome:'Boas práticas de código',    duracao:'45min', obrigatorio:false, progresso:0   },
    ],
    'Comercial':  [
      { nome:'Técnicas de Vendas',         duracao:'60min', obrigatorio:true,  progresso:100 },
      { nome:'CRM — Gestão de Clientes',   duracao:'45min', obrigatorio:true,  progresso:30  },
      { nome:'Negociação Avançada',        duracao:'90min', obrigatorio:false, progresso:0   },
      { nome:'Pós-venda',                  duracao:'30min', obrigatorio:false, progresso:0   },
    ],
    'Padrão':     [
      { nome:'Integração Institucional',   duracao:'30min', obrigatorio:true,  progresso:100 },
      { nome:'Cultura e Valores',          duracao:'20min', obrigatorio:true,  progresso:0   },
      { nome:'Código de Conduta',          duracao:'30min', obrigatorio:true,  progresso:0   },
      { nome:'SST — Segurança no Trabalho',duracao:'45min', obrigatorio:true,  progresso:0   },
    ],
  },

  time: [
    { nome:'João Silva',      cargo:'Analista de Logística',   setor:'Logística',  avatar:'JS', cor:'#2563eb', voce:true  },
    { nome:'Carlos Ferreira', cargo:'Supervisor de Logística', setor:'Logística',  avatar:'CF', cor:'#16a34a', voce:false },
    { nome:'Marina Santos',   cargo:'Assistente de Logística', setor:'Logística',  avatar:'MS', cor:'#7c3aed', voce:false },
    { nome:'Rafael Costa',    cargo:'Coord. Operacional',      setor:'Operações',  avatar:'RC', cor:'#d97706', voce:false },
    { nome:'Juliana Alves',   cargo:'Analista de Operações',   setor:'Operações',  avatar:'JA', cor:'#0ea5e9', voce:false },
    { nome:'Pedro Lima',      cargo:'Assistente Operacional',  setor:'Operações',  avatar:'PL', cor:'#dc2626', voce:false },
    { nome:'Camila Martins',  cargo:'Analista Financeira',     setor:'Financeiro', avatar:'CM', cor:'#ec4899', voce:false },
    { nome:'Bruno Oliveira',  cargo:'Assistente Financeiro',   setor:'Financeiro', avatar:'BO', cor:'#06b6d4', voce:false },
    { nome:'Fernanda Souza',  cargo:'Coord. Financeira',       setor:'Financeiro', avatar:'FS', cor:'#16a34a', voce:false },
    { nome:'Ana Paula',       cargo:'Analista de RH',          setor:'RH',         avatar:'AP', cor:'#7c3aed', voce:false },
    { nome:'Lucas Andrade',   cargo:'Assistente de RH',        setor:'RH',         avatar:'LA', cor:'#2563eb', voce:false },
    { nome:'Roberta Lima',    cargo:'Coord. de RH',            setor:'RH',         avatar:'RL', cor:'#d97706', voce:false },
    { nome:'Felipe Rocha',    cargo:'Analista de TI',          setor:'TI',         avatar:'FR', cor:'#dc2626', voce:false },
    { nome:'Gabriel Martins', cargo:'Suporte Técnico',         setor:'TI',         avatar:'GM', cor:'#0ea5e9', voce:false },
    { nome:'Thiago Almeida',  cargo:'Desenvolvedor',           setor:'TI',         avatar:'TA', cor:'#16a34a', voce:false },
  ],

  plataformas: [
    {
      nome:'Bitrix24',     cor:'#2FC6F6',  fallback:'B24',
      logo:'https://cdn.worldvectorlogo.com/logos/bitrix24.svg',
      desc:'Comunicação, tarefas e processos',
      link:'https://bitrix24.com.br',
      tags:['CRM','Tarefas','Chat'],
      appStore:'https://apps.apple.com/br/app/bitrix24/id561683282',
      playStore:'https://play.google.com/store/apps/details?id=com.bitrix24.android',
    },
    {
      nome:'RHid',         cor:'#00b86e',  fallback:'RH',
      logo:null,
      desc:'Ponto eletrônico e espelho de ponto',
      link:'https://rhid.com.br',
      tags:['Ponto','Jornada'],
      appStore:null, playStore:null,
    },
    {
      nome:'Caju',         cor:'#ff6b00',  fallback:'CAJ',
      logo:'https://logo.clearbit.com/caju.com.br',
      desc:'Benefícios, cartão e mobilidade',
      link:'https://app.caju.com.br',
      tags:['Alimentação','Mobilidade'],
      appStore:'https://apps.apple.com/br/app/caju/id1459665826',
      playStore:'https://play.google.com/store/apps/details?id=br.com.caju',
    },
    {
      nome:'RHsolutio',    cor:'#7c3aed',  fallback:'RHS',
      logo:null,
      desc:'Contracheque e folha digital',
      link:'https://rhsolutio.com.br',
      tags:['Holerite','Folha'],
      appStore:null, playStore:null,
    },
    {
      nome:'Wellhub',      cor:'#16a34a',  fallback:'WH',
      logo:'https://logo.clearbit.com/wellhub.com',
      desc:'Academias, apps fitness e bem-estar',
      link:'https://wellhub.com',
      tags:['Fitness','Saúde'],
      appStore:'https://apps.apple.com/br/app/wellhub/id596297732',
      playStore:'https://play.google.com/store/apps/details?id=com.gympass.android',
    },
    {
      nome:'SulAmérica',   cor:'#dc2626',  fallback:'SA',
      logo:'https://logo.clearbit.com/sulamerica.com.br',
      desc:'Plano de saúde e odontológico',
      link:'https://sulamerica.com.br',
      tags:['Saúde','Odonto'],
      appStore:null, playStore:null,
    },
  ],
};

let jornadaEtapaAtiva = 3;
let jv2NotaSelecionada = 0;
let jv2FiltroSetor = 'Todos';

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderJornada() {
  const col      = jornadaConfig.colaboradorAtual;
  const total    = jornadaConfig.etapas.length;
  const completas = col.etapasCompletas.length;
  const pct      = Math.round((completas / total) * 100);

  // Calcula dias na empresa
  const admDate   = new Date(col.admissao.split('/').reverse().join('-'));
  const diasEmp   = Math.max(0, Math.floor((new Date() - admDate) / 86400000));

  // Circunferência do SVG ring (r=34 → C = 2π×34 ≈ 213.6)
  const circ = 213.6;
  const dash  = (pct / 100) * circ;

  return `
  <div class="jv2">

    <!-- ═══════════════ HERO ═══════════════ -->
    <div class="jv2-hero">
      <!-- Fundo animado -->
      <div class="jv2-hero-bg">
        <div class="jv2-blob jv2-blob-1"></div>
        <div class="jv2-blob jv2-blob-2"></div>
        <div class="jv2-blob jv2-blob-3"></div>
        <div class="jv2-hero-grid"></div>
      </div>

      <div class="jv2-hero-inner">

        <!-- Avatar + Info -->
        <div class="jv2-hero-user">
          <div class="jv2-avatar-wrap">
            <div class="jv2-avatar">${col.avatar}</div>
            <span class="jv2-avatar-badge">🟢</span>
          </div>
          <div class="jv2-hero-info">
            <div class="jv2-hero-greeting">Bem-vindo(a) ao time!</div>
            <h1 class="jv2-hero-name">${col.nome}</h1>
            <div class="jv2-hero-meta">
              <span class="jv2-meta-chip">💼 ${col.cargo}</span>
              <span class="jv2-meta-chip">🏢 ${col.setor}</span>
              <span class="jv2-meta-chip">👔 ${col.gestor}</span>
            </div>
          </div>
        </div>

        <!-- Progresso central -->
        <div class="jv2-hero-center">
          <div class="jv2-ring-wrap">
            <svg class="jv2-ring" viewBox="0 0 80 80" width="120" height="120">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stop-color="#60a5fa"/>
                  <stop offset="100%" stop-color="#a78bfa"/>
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#ringGrad)" stroke-width="7"
                stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ * 0.25}"
                stroke-linecap="round" class="jv2-ring-fill"/>
              <text x="40" y="36" text-anchor="middle" font-size="16" font-weight="900" fill="white">${pct}%</text>
              <text x="40" y="50" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.7)">completo</text>
            </svg>
          </div>
          <div class="jv2-progress-label">${completas} de ${total} etapas</div>
        </div>

        <!-- Stats -->
        <div class="jv2-hero-stats">
          <div class="jv2-stat">
            <strong>${diasEmp}</strong>
            <span>dias na empresa</span>
          </div>
          <div class="jv2-stat-divider"></div>
          <div class="jv2-stat">
            <strong>${completas}</strong>
            <span>etapas concluídas</span>
          </div>
          <div class="jv2-stat-divider"></div>
          <div class="jv2-stat">
            <strong>${total - completas}</strong>
            <span>etapas pendentes</span>
          </div>
          <div class="jv2-stat-divider"></div>
          <div class="jv2-stat">
            <strong>${jornadaConfig.plataformas.length}</strong>
            <span>plataformas</span>
          </div>
        </div>

      </div><!-- /hero-inner -->
    </div><!-- /hero -->

    <!-- ═══════════════ BODY ═══════════════ -->
    <div class="jv2-body">

      <!-- STEPPER LATERAL -->
      <nav class="jv2-stepper">
        <div class="jv2-stepper-header">Sua Jornada</div>
        ${jornadaConfig.etapas.map((etapa, idx) => {
          const completa = col.etapasCompletas.includes(etapa.id);
          const ativa    = etapa.id === jornadaEtapaAtiva;
          const estado   = completa ? 'completa' : ativa ? 'ativa' : 'pendente';
          return `
          <div class="jv2-step ${estado}" onclick="jv2IrEtapa(${etapa.id})" title="${etapa.label}">
            <div class="jv2-step-left">
              <div class="jv2-step-circle" style="${ativa ? `--step-cor:${etapa.cor}` : ''}">
                ${completa
                  ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                  : `<span class="jv2-step-icon">${etapa.icon}</span>`
                }
              </div>
              ${idx < jornadaConfig.etapas.length - 1 ? `<div class="jv2-step-line ${completa ? 'feita' : ''}"></div>` : ''}
            </div>
            <div class="jv2-step-body">
              <span class="jv2-step-num">Etapa ${etapa.id}</span>
              <strong class="jv2-step-label">${etapa.label}</strong>
              <span class="jv2-step-desc">${etapa.desc}</span>
              ${ativa ? `<span class="jv2-step-tag">Em andamento</span>` : completa ? `<span class="jv2-step-tag done">Concluída</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </nav>

      <!-- CONTEÚDO DA ETAPA -->
      <div class="jv2-content" id="jv2-content">
        ${renderJv2Conteudo(jornadaEtapaAtiva)}
      </div>

    </div><!-- /body -->

  </div><!-- /jv2 -->`;
}

function initPage_jornada() {
  // Garante que o stepper começa na etapa ativa
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────
function jv2IrEtapa(id) {
  jornadaEtapaAtiva = id;
  const col = jornadaConfig.colaboradorAtual;

  // Atualiza stepper
  document.querySelectorAll('.jv2-step').forEach((el, i) => {
    const eid = i + 1;
    el.className = 'jv2-step ' + (col.etapasCompletas.includes(eid) ? 'completa' : eid === id ? 'ativa' : 'pendente');
  });

  // Atualiza conteúdo com animação
  const content = document.getElementById('jv2-content');
  if (content) {
    content.style.opacity = '0';
    content.style.transform = 'translateY(12px)';
    setTimeout(() => {
      content.innerHTML = renderJv2Conteudo(id);
      content.style.transition = 'opacity .25s,transform .25s';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 150);
  }
}

function renderJv2Conteudo(id) {
  if (id === 1) return jv2Etapa1();
  if (id === 2) return jv2Etapa2();
  if (id === 3) return jv2Etapa3();
  if (id === 4) return jv2Etapa4();
  if (id === 5) return jv2Etapa5();
  if (id === 6) return jv2Etapa6();
  if (id === 7) return jv2Etapa7();
  if (id === 8) return jv2Etapa8();
  return '';
}

// Helper: card de etapa com header colorido
function jv2Card(etapaId, body) {
  const etapa = jornadaConfig.etapas.find(e => e.id === etapaId);
  const col   = jornadaConfig.colaboradorAtual;
  const completa = col.etapasCompletas.includes(etapaId);
  return `
  <div class="jv2-card">
    <div class="jv2-card-header" style="background:linear-gradient(135deg,${etapa.cor}ee,${etapa.cor}99)">
      <div class="jv2-card-header-left">
        <div class="jv2-card-icon">${etapa.icon}</div>
        <div>
          <div class="jv2-card-num">Etapa ${etapa.id} de ${jornadaConfig.etapas.length}</div>
          <h2 class="jv2-card-title">${etapa.label}</h2>
          <p class="jv2-card-subtitle">${etapa.desc}</p>
        </div>
      </div>
      ${completa ? `<div class="jv2-card-done-badge">✓ Concluída</div>` : ''}
    </div>
    <div class="jv2-card-body">${body}</div>
    <div class="jv2-card-nav">
      ${etapaId > 1 ? `<button class="jv2-nav-btn prev" onclick="jv2IrEtapa(${etapaId-1})">← Anterior</button>` : '<div></div>'}
      ${!completa
        ? `<button class="jv2-btn-concluir" onclick="jv2Concluir(${etapaId})">✓ Concluir etapa ${etapaId > 1 ? '& avançar' : ''}</button>`
        : etapaId < 8
          ? `<button class="jv2-nav-btn next" onclick="jv2IrEtapa(${etapaId+1})">Próxima etapa →</button>`
          : `<button class="jv2-btn-concluir" onclick="jv2Celebrar()">🎉 Ver resultado</button>`
      }
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// ETAPA 1 — BEM-VINDO
// ─────────────────────────────────────────────
function jv2Etapa1() {
  const col = jornadaConfig.colaboradorAtual;
  return jv2Card(1, `
    <!-- Vídeo de boas-vindas -->
    <div class="jv2-video-wrap" onclick="jv2PlayVideo()">
      <div class="jv2-video-overlay">
        <div class="jv2-play-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
        <div class="jv2-video-info">
          <strong>Vídeo de Boas-vindas</strong>
          <span>Seja bem-vindo(a) ao nosso time! · 2:45 min</span>
        </div>
      </div>
    </div>

    <!-- Mensagem personalizada -->
    <div class="jv2-welcome-msg">
      <div class="jv2-welcome-avatar">${col.avatar}</div>
      <div>
        <p>Olá, <strong>${col.nome}</strong>! 🎉</p>
        <p>É um prazer imenso ter você no time de <strong>${col.setor}</strong>. Esta jornada foi preparada especialmente para você. Siga cada etapa no seu ritmo — estamos aqui para apoiar.</p>
      </div>
    </div>

    <!-- Valores da empresa -->
    <div class="jv2-section-title">Nossa Cultura & Valores</div>
    <div class="jv2-values-grid">
      ${[
        { icon:'💡', titulo:'Inovação',    desc:'Buscamos sempre novas formas de resolver desafios.'    },
        { icon:'🤝', titulo:'Colaboração', desc:'Crescemos juntos, compartilhando conhecimento.'        },
        { icon:'❤️', titulo:'Cuidado',     desc:'Valorizamos as pessoas acima de tudo.'                },
        { icon:'🎯', titulo:'Resultado',   desc:'Focamos em entregas que geram impacto real.'          },
        { icon:'🔍', titulo:'Transparência',desc:'Comunicação honesta em todos os níveis.'            },
        { icon:'🚀', titulo:'Crescimento', desc:'Investimos no desenvolvimento contínuo de todos.'     },
      ].map(v => `
        <div class="jv2-value-card">
          <span class="jv2-value-icon">${v.icon}</span>
          <strong>${v.titulo}</strong>
          <p>${v.desc}</p>
        </div>
      `).join('')}
    </div>

    <!-- Links rápidos -->
    <div class="jv2-section-title">Links Úteis</div>
    <div class="jv2-links-row">
      <a href="#" onclick="navigateTo('comunicacao');return false" class="jv2-link-chip">📣 Comunicação interna</a>
      <a href="#" onclick="navigateTo('ouvidoria');return false" class="jv2-link-chip">📢 Ouvidoria</a>
      <a href="#" onclick="navigateTo('servicos');return false" class="jv2-link-chip">🛠 Serviços RH</a>
      <a href="#" onclick="navigateTo('clima');return false" class="jv2-link-chip">😊 Feed da empresa</a>
    </div>
  `);
}

function jv2PlayVideo() {
  alert('▶ Reproduzindo vídeo de integração...\n\nApós integração, o vídeo será carregado diretamente aqui.');
}

// ─────────────────────────────────────────────
// ETAPA 2 — DOCUMENTOS
// ─────────────────────────────────────────────
function jv2Etapa2() {
  const docs = [
    { nome:'Contrato de Trabalho (CLT)',  tipo:'PDF',  status:'Assinado',  icon:'📋', urgente:false },
    { nome:'Termo de Confidencialidade', tipo:'PDF',  status:'Assinado',  icon:'🔒', urgente:false },
    { nome:'Ficha de Registro (CTPS)',   tipo:'PDF',  status:'Pendente',  icon:'📄', urgente:true  },
    { nome:'Declaração de Benefícios',   tipo:'PDF',  status:'Pendente',  icon:'💎', urgente:true  },
    { nome:'Exame Admissional',          tipo:'PDF',  status:'Concluído', icon:'🏥', urgente:false },
    { nome:'Dados Bancários',            tipo:'Form', status:'Enviado',   icon:'🏦', urgente:false },
  ];

  const total    = docs.length;
  const ok       = docs.filter(d => d.status !== 'Pendente').length;
  const pct      = Math.round((ok / total) * 100);

  return jv2Card(2, `
    <!-- Progresso geral dos documentos -->
    <div class="jv2-doc-progress">
      <div class="jv2-doc-progress-info">
        <span><strong>${ok}</strong> de <strong>${total}</strong> documentos completos</span>
        <span style="font-weight:700;color:${pct===100?'#16a34a':'#d97706'}">${pct}%</span>
      </div>
      <div class="jv2-doc-bar">
        <div class="jv2-doc-bar-fill" style="width:${pct}%"></div>
      </div>
    </div>

    <!-- Lista de documentos -->
    <div class="jv2-doc-lista">
      ${docs.map((d, i) => `
        <div class="jv2-doc-item ${d.status==='Pendente'?'urgente':''}">
          <div class="jv2-doc-icone">${d.icon}</div>
          <div class="jv2-doc-info">
            <strong>${d.nome}</strong>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
              <span style="font-size:10px;background:var(--surface);border:1px solid var(--border);padding:1px 7px;border-radius:20px;color:var(--text-muted)">${d.tipo}</span>
              ${d.urgente ? '<span style="font-size:10px;color:#d97706;font-weight:700">⚠️ Ação necessária</span>' : ''}
            </div>
          </div>
          <div class="jv2-doc-actions">
            <span class="jv2-doc-status ${
              d.status==='Assinado'||d.status==='Concluído'||d.status==='Enviado' ? 'ok' : 'pend'
            }">
              ${d.status==='Assinado'||d.status==='Concluído'||d.status==='Enviado'
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
                : '◎'
              } ${d.status}
            </span>
            ${d.status === 'Pendente'
              ? `<button class="jv2-btn-sm" onclick="jv2UploadDoc(${i})">⬆ Enviar</button>`
              : `<button class="jv2-btn-sm secondary" onclick="alert('Abrindo ${d.nome}...')">👁 Ver</button>`
            }
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Upload rápido -->
    <div class="jv2-upload-box" onclick="document.getElementById('jv2-file-input').click()">
      <input type="file" id="jv2-file-input" style="display:none" multiple accept=".pdf,.jpg,.png" onchange="jv2HandleUpload(this)" />
      <div class="jv2-upload-icon">📎</div>
      <strong>Arraste arquivos ou clique para enviar</strong>
      <span>PDF, JPG, PNG — máx. 10 MB por arquivo</span>
    </div>
  `);
}

function jv2UploadDoc(i) {
  document.getElementById('jv2-file-input')?.click();
}

function jv2HandleUpload(input) {
  const files = Array.from(input.files || []);
  if (files.length) alert(`✅ ${files.length} arquivo(s) enviado(s) com sucesso!\n\nO RH irá verificar em até 24h.`);
}

// ─────────────────────────────────────────────
// ETAPA 3 — ACESSOS (plataformas premium)
// ─────────────────────────────────────────────
function jv2Etapa3() {
  return jv2Card(3, `
    <div class="jv2-section-title" style="margin-top:0">
      Suas plataformas de trabalho estão prontas. Configure cada uma agora.
    </div>

    <div class="jv2-plat-grid">
      ${jornadaConfig.plataformas.map(p => `
        <div class="jv2-plat-card">
          <div class="jv2-plat-header" style="background:${p.cor}18;border-bottom:1px solid ${p.cor}25">
            <div class="jv2-plat-logo-wrap">
              ${p.logo
                ? `<img src="${p.logo}" alt="${p.nome}" class="jv2-plat-logo"
                     onerror="this.parentElement.innerHTML='<div class=jv2-plat-fallback style=background:${p.cor}>${p.fallback}</div>'" />`
                : `<div class="jv2-plat-fallback" style="background:${p.cor}">${p.fallback}</div>`
              }
            </div>
            <div>
              <strong class="jv2-plat-nome">${p.nome}</strong>
              <div class="jv2-plat-tags">
                ${p.tags.map(t => `<span style="background:${p.cor}20;color:${p.cor};font-size:9px;font-weight:700;padding:1px 6px;border-radius:20px">${t}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="jv2-plat-body">
            <p class="jv2-plat-desc">${p.desc}</p>
            <a href="${p.link}" target="_blank" class="jv2-plat-btn" style="background:${p.cor}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Acessar Web
            </a>
            ${(p.appStore || p.playStore) ? `
            <div class="jv2-plat-stores">
              ${p.appStore ? `<a href="${p.appStore}" target="_blank" class="jv2-store-btn">🍎 App Store</a>` : ''}
              ${p.playStore ? `<a href="${p.playStore}" target="_blank" class="jv2-store-btn">▶ Google Play</a>` : ''}
            </div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="jv2-info-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      Seus dados de login foram enviados por e-mail corporativo. Em caso de dúvidas, acesse <strong>Serviços RH → Suporte de TI</strong>.
    </div>
  `);
}

// ─────────────────────────────────────────────
// ETAPA 4 — INTEGRAÇÕES
// ─────────────────────────────────────────────
function jv2Etapa4() {
  const checks = [
    { id:'email',     icon:'📧', nome:'E-mail corporativo',         desc:'Configure seu e-mail institucional no celular e computador',  ok:true,  sistema:'TI'      },
    { id:'bitrix',    icon:'🔵', nome:'Perfil no Bitrix24',         desc:'Complete seu perfil, adicione foto e defina seu status',       ok:true,  sistema:'Bitrix24'},
    { id:'app',       icon:'📱', nome:'App hi Conecta RH',          desc:'Baixe o app no celular para acesso rápido a tudo',             ok:false, sistema:'RH'      },
    { id:'ponto',     icon:'⏱️', nome:'Ponto Digital (RHid)',       desc:'Cadastre seu dispositivo e faça o primeiro registro de ponto', ok:false, sistema:'RHid'   },
    { id:'caju',      icon:'🟧', nome:'Cartão Caju ativado',        desc:'Ative seu cartão de benefícios no app Caju',                  ok:false, sistema:'Caju'    },
    { id:'saude',     icon:'❤️', nome:'Plano de Saúde validado',    desc:'Verifique sua carteirinha no app SulAmérica',                 ok:false, sistema:'SulAmérica'},
    { id:'teams',     icon:'💬', nome:'Bitrix24 — Canal da equipe', desc:'Entre no canal do seu departamento no Bitrix24',              ok:true,  sistema:'Bitrix24'},
    { id:'assinatura',icon:'✍️', nome:'Assinatura de e-mail',       desc:'Configure sua assinatura corporativa padrão',                 ok:false, sistema:'TI'      },
  ];

  const feitos  = checks.filter(c => c.ok).length;
  const pct     = Math.round((feitos / checks.length) * 100);

  return jv2Card(4, `
    <!-- Progress bar -->
    <div class="jv2-doc-progress">
      <div class="jv2-doc-progress-info">
        <span><strong>${feitos}</strong> de <strong>${checks.length}</strong> integrações concluídas</span>
        <span style="font-weight:700;color:${pct===100?'#16a34a':'#d97706'}">${pct}%</span>
      </div>
      <div class="jv2-doc-bar"><div class="jv2-doc-bar-fill" style="width:${pct}%"></div></div>
    </div>

    <!-- Checklist visual -->
    <div class="jv2-check-lista">
      ${checks.map((c, i) => `
        <div class="jv2-check-item ${c.ok ? 'feito' : ''}" id="jcheck-${i}" onclick="jv2ToggleCheck(${i})">
          <div class="jv2-check-circle ${c.ok ? 'ok' : ''}">
            ${c.ok
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`
              : ''
            }
          </div>
          <div class="jv2-check-info">
            <div style="display:flex;align-items:center;gap:8px">
              <span>${c.icon}</span>
              <strong style="font-size:13px">${c.nome}</strong>
              <span style="font-size:10px;background:var(--surface);border:1px solid var(--border);padding:1px 7px;border-radius:20px;color:var(--text-muted)">${c.sistema}</span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0">${c.desc}</p>
          </div>
          <span class="jv2-check-status ${c.ok ? 'ok' : 'pend'}">${c.ok ? 'Feito' : 'Pendente'}</span>
        </div>
      `).join('')}
    </div>

    <div class="jv2-info-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>
      Clique em qualquer item para marcar como concluído. O RH é notificado automaticamente ao completar todas as integrações.
    </div>
  `);
}

const jv2ChecksInteg = [true, true, false, false, false, false, true, false];
function jv2ToggleCheck(i) {
  jv2ChecksInteg[i] = !jv2ChecksInteg[i];
  const el = document.getElementById(`jcheck-${i}`);
  if (!el) return;
  el.classList.toggle('feito', jv2ChecksInteg[i]);
  const circle = el.querySelector('.jv2-check-circle');
  const status = el.querySelector('.jv2-check-status');
  if (circle) {
    circle.className = 'jv2-check-circle' + (jv2ChecksInteg[i] ? ' ok' : '');
    circle.innerHTML = jv2ChecksInteg[i]
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>` : '';
  }
  if (status) {
    status.className = 'jv2-check-status ' + (jv2ChecksInteg[i] ? 'ok' : 'pend');
    status.textContent = jv2ChecksInteg[i] ? 'Feito' : 'Pendente';
  }
}

// ─────────────────────────────────────────────
// ETAPA 5 — BENEFÍCIOS
// ─────────────────────────────────────────────
function jv2Etapa5() {
  const ben = jornadaConfig.colaboradorAtual.beneficios;

  const beneficios = [
    {
      key:'alimentacao', icon:'🍽️', nome:'Alimentação',   plataforma:'Caju',
      valor:'R$ 550/mês', recarga:'Todo dia 1º',
      cor:'#ff6b00', link:'https://app.caju.com.br',
      como:'Crédito automático no cartão Caju. Válido em supermercados, restaurantes e padarias.',
      ativo:ben.alimentacao,
    },
    {
      key:'saude', icon:'❤️', nome:'Plano de Saúde', plataforma:'SulAmérica',
      valor:'Cobertura nacional', recarga:'Mensal em folha',
      cor:'#dc2626', link:'https://sulamerica.com.br',
      como:'Carteirinha digital no app SulAmérica. Consultas, exames e internações em toda a rede.',
      ativo:ben.saude,
    },
    {
      key:'conexaoSaude', icon:'🏥', nome:'Conexa Saúde', plataforma:'Conexa',
      valor:'Sem custo adicional', recarga:'Imediato',
      cor:'#2563eb', link:'https://conexasaude.com.br',
      como:'Telemedicina 24h com especialistas. Acesse pelo app ou site.',
      ativo:ben.conexaoSaude,
    },
    {
      key:'telemedicina', icon:'💊', nome:'Telemedicina', plataforma:'Portal',
      valor:'Sem custo', recarga:'Imediato',
      cor:'#16a34a', link:'#',
      como:'Consultas online com médicos especialistas. Receita digital válida em farmácias.',
      ativo:ben.telemedicina,
    },
    {
      key:'odonto', icon:'🦷', nome:'Odontológico', plataforma:'SulAmérica',
      valor:'Desconto em folha', recarga:'Mensal',
      cor:'#7c3aed', link:'https://sulamerica.com.br',
      como:'Dentistas credenciados em todo o Brasil. Carteirinha digital no app SulAmérica.',
      ativo:ben.odonto,
    },
  ];

  const ativos = beneficios.filter(b => b.ativo);
  const inativos = beneficios.filter(b => !b.ativo);

  return jv2Card(5, `
    <!-- Resumo -->
    <div class="jv2-ben-resumo">
      <div class="jv2-ben-kpi">
        <strong>${ativos.length}</strong>
        <span>benefícios ativos</span>
      </div>
      <div class="jv2-ben-kpi" style="border-color:#d97706">
        <strong>${inativos.length}</strong>
        <span>não incluídos</span>
      </div>
      <div class="jv2-ben-kpi" style="border-color:#16a34a">
        <strong>R$ 750<small style="font-size:12px">/mês</small></strong>
        <span>valor total em benefícios</span>
      </div>
    </div>

    <!-- Benefícios ativos -->
    <div class="jv2-section-title">Seus Benefícios Ativos</div>
    <div class="jv2-ben-grid">
      ${ativos.map((b, i) => `
        <div class="jv2-ben-card ativo" style="border-top:3px solid ${b.cor}">
          <div class="jv2-ben-card-header">
            <span class="jv2-ben-icon" style="background:${b.cor}18">${b.icon}</span>
            <div>
              <strong>${b.nome}</strong>
              <small style="display:block;color:var(--text-muted)">${b.plataforma}</small>
            </div>
            <span style="margin-left:auto;font-size:10px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;padding:2px 8px;border-radius:20px;font-weight:700">● Ativo</span>
          </div>
          <div class="jv2-ben-valores">
            <span>💰 ${b.valor}</span>
            <span>🔄 ${b.recarga}</span>
          </div>
          <div class="jv2-ben-como" id="como-ben-${i}">
            <button class="jv2-como-btn" onclick="jv2ToggleComo('como-ben-${i}',this)">ℹ Como funciona ▾</button>
            <div class="jv2-como-texto" style="display:none">${b.como}</div>
          </div>
          <a href="${b.link}" target="_blank" class="jv2-plat-btn" style="background:${b.cor};text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px">
            Acessar ${b.plataforma} ↗
          </a>
        </div>
      `).join('')}
    </div>

    ${inativos.length > 0 ? `
    <div class="jv2-section-title" style="margin-top:24px">Não incluídos no seu pacote</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${inativos.map(b => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--border);opacity:.7">
          <span style="font-size:20px">${b.icon}</span>
          <div style="flex:1"><strong style="font-size:13px">${b.nome}</strong><small style="display:block;color:var(--text-muted)">${b.plataforma}</small></div>
          <button class="jv2-btn-sm" onclick="alert('Solicite ao RH em Serviços → Benefícios')">Solicitar</button>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- Mobilidade -->
    <div class="jv2-section-title" style="margin-top:24px">Opção de Mobilidade — Escolha uma</div>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Apenas uma opção pode estar ativa por vez. A troca pode ser solicitada ao RH a qualquer momento.</p>
    <div class="jv2-mob-opcoes">
      <div class="jv2-mob-card ${ben.mobilidade==='caju'?'ativa':ben.mobilidade==='vt'?'bloq':''}"
        onclick="jv2EscolherMob('caju')">
        <div class="jv2-mob-left">
          <span style="font-size:28px">🟧</span>
          <div>
            <strong>Auxílio Mobilidade — Caju</strong>
            <small>R$ 200/mês · Crédito no cartão</small>
          </div>
        </div>
        <div class="jv2-mob-status ${ben.mobilidade==='caju'?'ativo':ben.mobilidade==='vt'?'bloq':'neutro'}">
          ${ben.mobilidade==='caju'?'✓ Ativo':ben.mobilidade==='vt'?'🔒 Bloqueado':'Selecionar'}
        </div>
      </div>
      <div class="jv2-mob-card ${ben.mobilidade==='vt'?'ativa':ben.mobilidade==='caju'?'bloq':''}"
        onclick="jv2EscolherMob('vt')">
        <div class="jv2-mob-left">
          <span style="font-size:28px">🚌</span>
          <div>
            <strong>Vale Transporte</strong>
            <small>Conforme trajeto · Recarga automática</small>
          </div>
        </div>
        <div class="jv2-mob-status ${ben.mobilidade==='vt'?'ativo':ben.mobilidade==='caju'?'bloq':'neutro'}">
          ${ben.mobilidade==='vt'?'✓ Ativo':ben.mobilidade==='caju'?'🔒 Bloqueado':'Selecionar'}
        </div>
      </div>
    </div>
  `);
}

function jv2ToggleComo(id, btn) {
  const box = document.querySelector(`#${id} .jv2-como-texto`);
  if (!box) return;
  const aberto = box.style.display !== 'none';
  box.style.display = aberto ? 'none' : 'block';
  btn.textContent = aberto ? 'ℹ Como funciona ▾' : 'ℹ Como funciona ▴';
}

function jv2EscolherMob(opcao) {
  const ben   = jornadaConfig.colaboradorAtual.beneficios;
  const outro = opcao === 'caju' ? 'Vale Transporte' : 'Auxílio Mobilidade (Caju)';
  if (ben.mobilidade === opcao) {
    if (!confirm(`Cancelar ${opcao === 'caju' ? 'Auxílio Mobilidade' : 'Vale Transporte'}?`)) return;
    ben.mobilidade = null;
  } else {
    if (ben.mobilidade && !confirm(`Você já tem ${outro} ativo. Deseja trocar?`)) return;
    ben.mobilidade = opcao;
    alert(`✅ ${opcao === 'caju' ? 'Auxílio Mobilidade (Caju)' : 'Vale Transporte'} ativado!\n\nO benefício estará disponível no próximo ciclo.`);
  }
  document.getElementById('jv2-content').innerHTML = renderJv2Conteudo(5);
}

// ─────────────────────────────────────────────
// ETAPA 6 — MEU TIME
// ─────────────────────────────────────────────
function jv2Etapa6() {
  const setores  = [...new Set(jornadaConfig.time.map(c => c.setor))];
  const buscaEl  = () => document.getElementById('jv2-time-busca')?.value.toLowerCase() || '';

  const renderMembro = (c) => `
    <div class="jv2-membro-card ${c.voce ? 'voce' : ''}">
      <div class="jv2-membro-avatar" style="background:${c.cor}">${c.avatar}</div>
      ${c.voce ? '<div class="jv2-membro-voce">Você</div>' : ''}
      <strong class="jv2-membro-nome">${c.nome}</strong>
      <span class="jv2-membro-cargo">${c.cargo}</span>
      ${!c.voce ? `
        <div class="jv2-membro-acoes">
          <button onclick="jv2Contato('${c.nome}')" title="Mensagem">💬</button>
          <button onclick="jv2Perfil('${c.nome}')" title="Perfil">👁</button>
        </div>` : ''}
    </div>`;

  return jv2Card(6, `
    <!-- Busca e filtro -->
    <div class="jv2-time-bar">
      <div class="jv2-time-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:var(--text-muted)"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="text" id="jv2-time-busca" placeholder="Buscar colaborador..."
          oninput="jv2FiltrarTime()" />
      </div>
      <select id="jv2-setor-sel" onchange="jv2FiltrarTime()" class="jv2-select">
        <option value="Todos">Todos os setores</option>
        ${setores.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>

    <!-- Estatísticas rápidas -->
    <div class="jv2-time-kpis">
      ${setores.map(s => {
        const membros = jornadaConfig.time.filter(c => c.setor === s);
        const cor = membros[0]?.cor || '#6b7280';
        return `
          <div class="jv2-time-kpi" style="border-left:3px solid ${cor}" onclick="document.getElementById('jv2-setor-sel').value='${s}';jv2FiltrarTime()">
            <strong style="color:${cor}">${membros.length}</strong>
            <span>${s}</span>
          </div>`;
      }).join('')}
    </div>

    <!-- Grid do time -->
    <div id="jv2-time-grid">
      ${setores.map(s => {
        const membros = jornadaConfig.time.filter(c => c.setor === s);
        return `
          <div class="jv2-setor-grupo" id="grupo-${s.replace(/\s/g,'_')}">
            <div class="jv2-setor-titulo">
              <strong>${s}</strong>
              <span class="jv2-setor-count">${membros.length}</span>
            </div>
            <div class="jv2-membros-grid">
              ${membros.map(renderMembro).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>

    <div class="jv2-info-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      Dados sincronizados automaticamente via <strong>RHid</strong>.
    </div>
  `);
}

function jv2FiltrarTime() {
  const busca  = document.getElementById('jv2-time-busca')?.value.toLowerCase() || '';
  const setor  = document.getElementById('jv2-setor-sel')?.value || 'Todos';
  const setores = [...new Set(jornadaConfig.time.map(c => c.setor))];

  setores.forEach(s => {
    const grupo = document.getElementById(`grupo-${s.replace(/\s/g,'_')}`);
    if (!grupo) return;
    if (setor !== 'Todos' && setor !== s) { grupo.style.display = 'none'; return; }
    grupo.style.display = '';
    grupo.querySelectorAll('.jv2-membro-card').forEach((el, i) => {
      const m = jornadaConfig.time.filter(c => c.setor === s)[i];
      el.style.display = (!busca || (m?.nome.toLowerCase().includes(busca) || m?.cargo.toLowerCase().includes(busca))) ? '' : 'none';
    });
  });
}

function jv2Contato(nome) {
  alert(`💬 Mensagem para ${nome} via Bitrix24.\n\nApós integração, a conversa abrirá diretamente no Bitrix24.`);
}

function jv2Perfil(nome) {
  const m = jornadaConfig.time.find(c => c.nome === nome);
  if (m) alert(`👤 ${m.nome}\n${m.cargo}\nSetor: ${m.setor}`);
}

// ─────────────────────────────────────────────
// ETAPA 7 — TREINAMENTOS
// ─────────────────────────────────────────────
function jv2Etapa7() {
  const setor     = jornadaConfig.colaboradorAtual.setor;
  const especificos = jornadaConfig.treinamentos[setor] || jornadaConfig.treinamentos['Padrão'];
  const gerais    = jornadaConfig.treinamentos['Padrão'];

  const renderCurso = (t, i, prefixo) => `
    <div class="jv2-curso-card">
      <div class="jv2-curso-thumb" style="background:linear-gradient(135deg,${t.progresso===100?'#16a34a,#22c55e':t.progresso>0?'#2563eb,#7c3aed':'#64748b,#94a3b8'})">
        <span style="font-size:28px">🎓</span>
        ${t.progresso === 100 ? '<div class="jv2-curso-done">✓</div>' : ''}
      </div>
      <div class="jv2-curso-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
          <strong class="jv2-curso-nome">${t.nome}</strong>
          <span class="jv2-curso-badge ${t.obrigatorio?'obrig':'opt'}">${t.obrigatorio?'Obrigatório':'Opcional'}</span>
        </div>
        <div style="display:flex;gap:10px;font-size:11px;color:var(--text-muted);margin-bottom:8px">
          <span>⏱ ${t.duracao}</span>
          <span>${t.progresso===100?'✅ Concluído':t.progresso>0?`📖 ${t.progresso}% feito`:'📚 Não iniciado'}</span>
        </div>
        <div class="jv2-curso-bar">
          <div class="jv2-curso-bar-fill" style="width:${t.progresso}%;background:${t.progresso===100?'#16a34a':t.progresso>0?'#2563eb':'#e2e8f0'}"></div>
        </div>
        <button class="jv2-btn-sm ${t.progresso===100?'secondary':''}" style="margin-top:8px"
          onclick="jv2AbrirCurso('${t.nome}',${t.progresso})">
          ${t.progresso===100?'🏆 Ver certificado':t.progresso>0?'▶ Continuar':'▶ Iniciar'}
        </button>
      </div>
    </div>`;

  const totalCursos = especificos.length + gerais.length;
  const concluidos  = [...especificos, ...gerais].filter(t => t.progresso === 100).length;
  const emAndamento = [...especificos, ...gerais].filter(t => t.progresso > 0 && t.progresso < 100).length;

  return jv2Card(7, `
    <!-- KPIs de treinamento -->
    <div class="jv2-trein-kpis">
      <div class="jv2-trein-kpi verde">
        <strong>${concluidos}</strong><span>Concluídos</span>
      </div>
      <div class="jv2-trein-kpi azul">
        <strong>${emAndamento}</strong><span>Em andamento</span>
      </div>
      <div class="jv2-trein-kpi cinza">
        <strong>${totalCursos - concluidos - emAndamento}</strong><span>Não iniciados</span>
      </div>
      <div class="jv2-trein-kpi roxo">
        <strong>${Math.round((concluidos/totalCursos)*100)}%</strong><span>Conclusão geral</span>
      </div>
    </div>

    <!-- Trilha do setor -->
    <div class="jv2-section-title">📚 Trilha de ${setor}</div>
    <div class="jv2-cursos-grid">
      ${especificos.map((t, i) => renderCurso(t, i, 'esp')).join('')}
    </div>

    <!-- Treinamentos gerais -->
    <div class="jv2-section-title" style="margin-top:24px">🏢 Treinamentos Gerais — Todos os Colaboradores</div>
    <div class="jv2-cursos-grid">
      ${gerais.map((t, i) => renderCurso(t, i, 'ger')).join('')}
    </div>

    <div class="jv2-info-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Ao concluir todos os treinamentos obrigatórios, você receberá o <strong>Certificado de Integração</strong>.
    </div>
  `);
}

function jv2AbrirCurso(nome, progresso) {
  if (progresso === 100) {
    alert(`🏆 CERTIFICADO DE CONCLUSÃO\n\n${nome}\n\nConcluído com sucesso!\n\nO download do certificado estará disponível após integração com a plataforma de T&D.`);
  } else {
    alert(`▶ Iniciando: ${nome}\n\nApós integração, o curso abrirá na plataforma de T&D.`);
  }
}

// ─────────────────────────────────────────────
// ETAPA 8 — FEEDBACK
// ─────────────────────────────────────────────
function jv2Etapa8() {
  const emojis = [
    { emoji:'😞', label:'Ruim',      valor:1 },
    { emoji:'😕', label:'Regular',   valor:2 },
    { emoji:'😊', label:'Bom',       valor:3 },
    { emoji:'😄', label:'Ótimo',     valor:4 },
    { emoji:'🤩', label:'Incrível!', valor:5 },
  ];

  return jv2Card(8, `
    <div class="jv2-fb-intro">
      <div style="font-size:48px;margin-bottom:8px">💬</div>
      <h3>Sua opinião é muito importante para nós!</h3>
      <p>Conta como foi sua experiência de integração. Levará menos de 2 minutos.</p>
    </div>

    <!-- Emoji rating -->
    <div class="jv2-section-title">Como foi sua experiência de integração?</div>
    <div class="jv2-emoji-rating">
      ${emojis.map(e => `
        <button class="jv2-emoji-btn" id="fbemoji-${e.valor}" onclick="jv2SelecionarNota(${e.valor})">
          <span class="jv2-emoji">${e.emoji}</span>
          <span class="jv2-emoji-label">${e.label}</span>
        </button>
      `).join('')}
    </div>

    <!-- Perguntas -->
    <div class="exp-form" style="margin-top:20px">
      <label style="font-weight:700">O que mais gostou no processo de integração?</label>
      <textarea id="fb-gostou" rows="3" placeholder="Escreva o que foi positivo, o que te surpreendeu, o que te fez sentir bem-vindo(a)..."></textarea>

      <label style="font-weight:700">O que podemos melhorar?</label>
      <textarea id="fb-melhorar" rows="3" placeholder="Sua opinião nos ajuda a melhorar a experiência para os próximos colaboradores..."></textarea>

      <label style="font-weight:700">Ficou alguma dúvida sem resposta?</label>
      <textarea id="fb-duvida" rows="2" placeholder="Pode perguntar à vontade — o time de RH responderá em até 24h..."></textarea>

      <label style="font-weight:700">Com que frequência você usa a plataforma?</label>
      <select id="fb-freq">
        <option>Várias vezes ao dia</option>
        <option>Uma vez ao dia</option>
        <option>Algumas vezes na semana</option>
        <option>Raramente</option>
      </select>

      <div class="jv2-fb-actions">
        <button class="jv2-btn-concluir" style="width:100%" onclick="jv2EnviarFeedback()">
          🎉 Enviar Feedback e Finalizar Jornada
        </button>
      </div>
    </div>
  `);
}

function jv2SelecionarNota(n) {
  jv2NotaSelecionada = n;
  document.querySelectorAll('.jv2-emoji-btn').forEach((btn, i) => {
    btn.classList.toggle('selecionado', i < n);
    btn.classList.toggle('ativo', i === n - 1);
  });
}

function jv2EnviarFeedback() {
  const gostou = document.getElementById('fb-gostou')?.value.trim();
  if (!jv2NotaSelecionada) { alert('Selecione uma avaliação com os emojis!'); return; }
  if (!gostou) { alert('Conta o que mais gostou para concluir!'); return; }
  jornadaConfig.colaboradorAtual.etapasCompletas = [1,2,3,4,5,6,7,8];
  jv2Celebrar();
}

function jv2Celebrar() {
  const col = jornadaConfig.colaboradorAtual;
  document.getElementById('pageContainer').innerHTML = `
  <div class="jv2-celebracao">
    <div class="jv2-cel-bg"></div>
    <div class="jv2-cel-content">
      <div class="jv2-cel-icon">🎉</div>
      <h1>Parabéns, ${col.nome.split(' ')[0]}!</h1>
      <p>Você concluiu <strong>100%</strong> da sua jornada de integração.<br>Bem-vindo(a) oficialmente ao time!</p>
      <div class="jv2-cel-badges">
        <div class="jv2-cel-badge">🏆<span>Integração Completa</span></div>
        <div class="jv2-cel-badge">⭐<span>Colaborador Ativo</span></div>
        <div class="jv2-cel-badge">🚀<span>Pronto para decolar</span></div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px">
        <button class="jv2-btn-concluir" onclick="navigateTo('dashboard')">🏠 Ir para o Dashboard</button>
        <button class="jv2-nav-btn next" onclick="navigateTo('clima')">😊 Ver o Feed da Empresa</button>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CONCLUIR ETAPA
// ─────────────────────────────────────────────
function jv2Concluir(id) {
  const col = jornadaConfig.colaboradorAtual;
  if (!col.etapasCompletas.includes(id)) col.etapasCompletas.push(id);
  col.etapaAtual = Math.min(id + 1, jornadaConfig.etapas.length);
  jornadaEtapaAtiva = col.etapaAtual;

  if (id === 8) { jv2Celebrar(); return; }

  // Re-renderiza a página inteira para atualizar o progresso
  document.getElementById('pageContainer').innerHTML = renderJornada();
  setTimeout(() => jv2IrEtapa(col.etapaAtual), 80);
}

// Aliases de compatibilidade
function irParaEtapa(id)     { jv2IrEtapa(id); }
function concluirEtapa(id)   { jv2Concluir(id); }
function escolherMobilidade(o){ jv2EscolherMob(o); }
function filtrarSetor(s)     { document.getElementById('jv2-setor-sel').value=s; jv2FiltrarTime(); }
function buscarColaborador(v){ if(document.getElementById('jv2-time-busca'))document.getElementById('jv2-time-busca').value=v; jv2FiltrarTime(); }
function enviarFeedback()    { jv2EnviarFeedback(); }
function selecionarNota(n)   { jv2SelecionarNota(n); }
