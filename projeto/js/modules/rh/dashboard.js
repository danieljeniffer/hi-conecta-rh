// =============================================
// DASHBOARD — 3 PERFIS: rh | gestor | colab
// =============================================

// ─────────────────────────────────────────────
// SISTEMA DE NOTIFICAÇÕES
// ─────────────────────────────────────────────
const notifData = {
  rh: [
    { id:1,  tipo:'aprovacao',   icone:'✅', titulo:'Solicitação aprovada',         desc:'Férias de Maria Oliveira aprovadas',              tempo:'Agora',       lida:false, acao:'departamento' },
    { id:2,  tipo:'alerta',      icone:'⚠️', titulo:'Férias vencidas',              desc:'João Silva e Paulo Santos com férias vencidas',   tempo:'5 min',       lida:false, acao:'departamento' },
    { id:3,  tipo:'recrutamento',icone:'🔍', titulo:'Nova candidatura',             desc:'28 candidatos — Dev Front-end',                   tempo:'12 min',      lida:false, acao:'recrutamento' },
    { id:4,  tipo:'documento',   icone:'📄', titulo:'Documento pendente',           desc:'Contrato de Pedro Henrique aguarda assinatura',   tempo:'1h',          lida:false, acao:'documentos'   },
    { id:5,  tipo:'comunicado',  icone:'📢', titulo:'Comunicado publicado',         desc:'Política de Home Office v2 disponível',           tempo:'2h',          lida:false, acao:'comunicacao'  },
    { id:6,  tipo:'sistema',     icone:'🔄', titulo:'Sync Bitrix24 concluído',      desc:'Tarefas sincronizadas com sucesso',               tempo:'3h',          lida:true,  acao:'integracoes'  },
    { id:7,  tipo:'ouvidoria',   icone:'📢', titulo:'Nova manifestação',            desc:'Denúncia anônima recebida — SLA: 48h',            tempo:'5h',          lida:true,  acao:'ouvidoria'    },
    { id:8,  tipo:'folha',       icone:'💰', titulo:'Fechamento de folha',          desc:'Folha de Maio fecha em 4 dias — 20/05',          tempo:'Ontem',       lida:true,  acao:'departamento' },
  ],
  gestor: [
    { id:1,  tipo:'aprovacao',   icone:'✅', titulo:'Aprovação pendente',           desc:'Maria Oliveira solicitou 15 dias de férias',      tempo:'Agora',       lida:false, acao:'servicos'     },
    { id:2,  tipo:'aprovacao',   icone:'✅', titulo:'Aprovação pendente',           desc:'Paulo Santos solicitou home office esta semana',  tempo:'30 min',      lida:false, acao:'servicos'     },
    { id:3,  tipo:'alerta',      icone:'⚠️', titulo:'Meta da equipe',              desc:'Equipe Comercial em 78% da meta de Maio',         tempo:'2h',          lida:false, acao:'indicadores'  },
    { id:4,  tipo:'recrutamento',icone:'🔍', titulo:'Candidato para entrevistar',  desc:'Gerente Comercial — 3 finalistas aguardam',       tempo:'3h',          lida:false, acao:'recrutamento' },
    { id:5,  tipo:'comunicado',  icone:'📢', titulo:'Novo comunicado do RH',       desc:'Reunião geral amanhã às 09h — Presença obrigatória', tempo:'4h',      lida:true,  acao:'comunicacao'  },
    { id:6,  tipo:'sistema',     icone:'💰', titulo:'Holerite disponível',          desc:'Seu holerite de Maio/2025 foi liberado',         tempo:'Ontem',       lida:true,  acao:'departamento' },
  ],
  colab: [
    { id:1,  tipo:'holerite',    icone:'💰', titulo:'Holerite disponível!',         desc:'Seu holerite de Maio/2025 foi liberado — R$ 2.150,00', tempo:'Agora', lida:false, acao:'departamento' },
    { id:2,  tipo:'ferias',      icone:'🏖️', titulo:'Férias próximas',             desc:'Suas férias vencem em 30 dias — agende agora',   tempo:'1h',          lida:false, acao:'servicos'     },
    { id:3,  tipo:'comunicado',  icone:'📢', titulo:'Comunicado importante',       desc:'Reunião geral amanhã às 09h — todos os colaboradores', tempo:'2h',   lida:false, acao:'comunicacao'  },
    { id:4,  tipo:'treinamento', icone:'🎓', titulo:'Treinamento pendente',        desc:'Curso de Compliance vence em 5 dias',            tempo:'3h',          lida:false, acao:'desenvolvimento'},
    { id:5,  tipo:'aprovacao',   icone:'✅', titulo:'Solicitação aprovada',         desc:'Seu pedido de cartão alimentação foi aprovado',   tempo:'5h',          lida:true,  acao:'servicos'     },
    { id:6,  tipo:'aniversario', icone:'🎂', titulo:'Aniversário da empresa',      desc:'Hoje é aniversário de Carlos Souza! Parabenize!', tempo:'Ontem',       lida:true,  acao:'clima'        },
  ],
};

let notifPainelAberto = false;

function getNotifPerfil() {
  const u = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const p = u.perfil || 'colab';
  return p === 'rh' ? 'rh' : p === 'gestor' ? 'gestor' : 'colab';
}

function getNaoLidas() {
  const perfil = getNotifPerfil();
  return (notifData[perfil] || []).filter(n => !n.lida);
}

function atualizarBadgeNotif() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const count = getNaoLidas().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline' : 'none';
}

function renderListaNotif() {
  const perfil = getNotifPerfil();
  const lista  = notifData[perfil] || [];
  const corTipo = {
    aprovacao:'#16a34a', alerta:'#d97706', recrutamento:'#2563eb',
    documento:'#7c3aed', comunicado:'#0ea5e9', sistema:'#6b7280',
    ouvidoria:'#dc2626', folha:'#16a34a', holerite:'#16a34a',
    ferias:'#d97706', treinamento:'#2563eb', aniversario:'#ec4899',
  };

  if (lista.length === 0) {
    return `<div style="padding:24px;text-align:center;color:var(--text-muted)">
      <div style="font-size:36px;margin-bottom:8px">🔔</div>
      <p style="font-size:13px">Nenhuma notificação</p>
    </div>`;
  }

  return lista.map(n => `
    <div class="notif-item ${n.lida ? 'lida' : ''}" onclick="abrirNotif(${n.id})">
      <div class="notif-icone" style="background:${(corTipo[n.tipo]||'#6b7280')}15;color:${corTipo[n.tipo]||'#6b7280'}">
        ${n.icone}
      </div>
      <div class="notif-body">
        <strong>${n.titulo}</strong>
        <p>${n.desc}</p>
        <small>${n.tempo}</small>
      </div>
      ${!n.lida ? '<span class="notif-dot"></span>' : ''}
    </div>
  `).join('');
}

function togglePainelNotif(event) {
  if (event) event.stopPropagation();
  const painel = document.getElementById('notif-panel');
  if (!painel) return;
  notifPainelAberto = !notifPainelAberto;
  painel.style.display = notifPainelAberto ? 'flex' : 'none';
  if (notifPainelAberto) {
    document.getElementById('notif-lista').innerHTML = renderListaNotif();
  }
}

function abrirNotif(id) {
  const perfil = getNotifPerfil();
  const notif  = (notifData[perfil] || []).find(n => n.id === id);
  if (!notif) return;
  notif.lida = true;
  atualizarBadgeNotif();
  togglePainelNotif();
  if (notif.acao && typeof navigateTo === 'function') navigateTo(notif.acao);
}

function marcarTodasLidas() {
  const perfil = getNotifPerfil();
  (notifData[perfil] || []).forEach(n => { n.lida = true; });
  atualizarBadgeNotif();
  document.getElementById('notif-lista').innerHTML = renderListaNotif();
}

function verTodasNotif() {
  togglePainelNotif();
  alert('📋 Histórico completo de notificações.\n\nEsta funcionalidade estará disponível na versão integrada.');
}

// Fecha painel ao clicar fora
document.addEventListener('click', (e) => {
  const painel = document.getElementById('notif-panel');
  const btn    = document.getElementById('btn-notif');
  if (painel && btn && !btn.contains(e.target) && !painel.contains(e.target)) {
    painel.style.display = 'none';
    notifPainelAberto = false;
  }
});

// ─────────────────────────────────────────────
// RENDER PRINCIPAL — detecta perfil
// ─────────────────────────────────────────────
function renderDashboard() {
  const u = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const perfil = u.perfil || 'colab';

  // Atualiza badge de notificações
  setTimeout(atualizarBadgeNotif, 100);

  if (['admin','rh','analista'].includes(perfil)) return renderDashboardADM(u);
  if (perfil === 'gestor') return renderDashboardGestor(u);
  return renderDashboardColab(u);
}

// Helper de saudação
function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getDataHoje() {
  return new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ─────────────────────────────────────────────
// DASHBOARD ADM / RH
// ─────────────────────────────────────────────
function renderDashboardADM(u) {
  const emp      = RHData.empresa;
  const naoLidas = getNaoLidas().length;

  const aprovacoesPendentes = [
    { colab:'Maria Oliveira', tipo:'Férias — 15 dias',        urgencia:'normal', depto:'RH'        },
    { colab:'Paulo Santos',   tipo:'Home Office — 2 dias/sem', urgencia:'normal', depto:'Operações' },
    { colab:'Ana Lima',       tipo:'Cópia de Contrato',        urgencia:'baixa',  depto:'Financeiro'},
    { colab:'Felipe Rocha',   tipo:'Cartão Alimentação',       urgencia:'alta',   depto:'TI'        },
  ];

  const alertasSistema = [
    { icone:'⚠️', cor:'#d97706', msg:'2 colaboradores com férias vencidas',        acao:'departamento' },
    { icone:'🔴', cor:'#dc2626', msg:'1 manifestação na ouvidoria — SLA: 48h',     acao:'ouvidoria'    },
    { icone:'📋', cor:'#2563eb', msg:'Fechamento de folha em 4 dias (20/05)',       acao:'departamento' },
    { icone:'🔍', cor:'#7c3aed', msg:'28 candidatos aguardam triagem — Dev Front',  acao:'recrutamento' },
  ];

  const deptoCards = (typeof pessoasData !== 'undefined' ? pessoasData.departamentos : []).map(d => `
    <div style="
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 14px;border-radius:10px;background:${d.cor}10;
      border-left:3px solid ${d.cor};cursor:pointer
    " onclick="navigateTo('pessoas')">
      <div>
        <strong style="font-size:13px">${d.nome}</strong>
        <small style="display:block;color:var(--text-muted)">${d.gestor}</small>
      </div>
      <strong style="color:${d.cor};font-size:18px">${d.colaboradores}</strong>
    </div>
  `).join('');

  return `
  <div class="depto-page">

    <!-- BOAS VINDAS ADM -->
    <div class="dash-boas-vindas dash-adm">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <h2 style="margin:0">${getSaudacao()}, ${u.nome?.split(' ')[0] || 'Administrador'}! 👋</h2>
          <span class="dash-perfil-badge adm">👑 Administrador RH</span>
        </div>
        <p style="color:rgba(255,255,255,.8);margin:0;font-size:13px">${getDataHoje()} — Visão geral da empresa</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        ${naoLidas > 0 ? `<div style="background:rgba(255,255,255,.15);border-radius:20px;padding:8px 16px;font-size:13px;font-weight:600;color:white">🔔 ${naoLidas} alertas ativos</div>` : ''}
        <div style="background:rgba(255,255,255,.15);border-radius:20px;padding:8px 16px;font-size:13px;font-weight:600;color:white">💰 Folha: R$ ${emp.folhaMaio.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
      </div>
    </div>

    <!-- ALERTAS DO SISTEMA -->
    ${alertasSistema.length ? `
    <div class="dash-alertas">
      ${alertasSistema.map(a => `
        <div class="dash-alerta-item" style="border-left-color:${a.cor};cursor:pointer" onclick="navigateTo('${a.acao}')">
          <span>${a.icone}</span>
          <span style="font-size:12px;font-weight:600">${a.msg}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:auto">Ver →</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- KPIs EMPRESA -->
    <div class="depto-cards">
      <div class="depto-card" onclick="navigateTo('pessoas')" style="cursor:pointer">
        <div class="depto-card-icon">👥</div>
        <div class="depto-card-info"><strong>${emp.totalColaboradores}</strong><span>Colaboradores ativos</span></div>
      </div>
      <div class="depto-card" onclick="navigateTo('recrutamento')" style="cursor:pointer">
        <div class="depto-card-icon">🔍</div>
        <div class="depto-card-info"><strong>${RHData.vagas.filter(v=>v.status==='Aberta').length}</strong><span>Vagas abertas</span></div>
      </div>
      <div class="depto-card" onclick="navigateTo('servicos')" style="cursor:pointer" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">📝</div>
        <div class="depto-card-info"><strong>${emp.solicitacoesPendentes}</strong><span>Solicitações pendentes</span></div>
      </div>
      <div class="depto-card" onclick="navigateTo('indicadores')" style="cursor:pointer">
        <div class="depto-card-icon">📉</div>
        <div class="depto-card-info"><strong>4,2%</strong><span>Turnover mensal</span></div>
      </div>
      <div class="depto-card destaque" onclick="navigateTo('departamento')" style="cursor:pointer">
        <div class="depto-card-icon">💰</div>
        <div class="depto-card-info"><strong>R$ ${emp.folhaMaio.toLocaleString('pt-BR',{minimumFractionDigits:2})}</strong><span>Folha Maio/2025</span></div>
      </div>
    </div>

    <!-- GRID PRINCIPAL -->
    <div class="ind-grid">

      <!-- APROVAÇÕES PENDENTES -->
      <div class="depto-section">
        <div class="section-header">
          <h3>⏳ Aprovações Pendentes</h3>
          <span class="badge-status pendente">${aprovacoesPendentes.length} aguardando</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px" id="dash-aprovacoes">
          ${aprovacoesPendentes.map((ap, i) => `
            <div class="dash-aprovacao-item" id="aprov-${i}">
              <div class="abs-avatar" style="width:32px;height:32px;font-size:10px;flex-shrink:0">
                ${ap.colab.split(' ').map(n=>n[0]).join('').substring(0,2)}
              </div>
              <div style="flex:1;min-width:0">
                <strong style="font-size:12px">${ap.colab}</strong>
                <small style="display:block;color:var(--text-muted)">${ap.tipo} · ${ap.depto}</small>
              </div>
              <div class="decisao-btns" style="gap:4px">
                <button class="btn-aprovar" style="padding:4px 10px;font-size:11px" onclick="aprovarDash(${i},'${ap.colab}','${ap.tipo}')">✓ Aprovar</button>
                <button style="padding:4px 10px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600"
                  onclick="recusarDash(${i},'${ap.colab}')">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="link-btn" style="margin-top:10px;font-size:12px" onclick="navigateTo('servicos')">Ver todas as solicitações →</button>
      </div>

      <!-- ATIVIDADES RECENTES -->
      <div class="depto-section">
        <div class="section-header">
          <h3>⚡ Atividades Recentes</h3>
          <button class="link-btn" onclick="navigateTo('pessoas')">Ver todas</button>
        </div>
        <div class="atividades-list">
          ${[
            { icon:'👤', texto:'Nova admissão: Carlos Mendes — TI',           tempo:'Hoje, 09:12', cor:'verde'  },
            { icon:'📄', texto:'Documento enviado: Contrato Ana Lima',         tempo:'Hoje, 08:45', cor:'azul'   },
            { icon:'⚠️', texto:'Solicitação pendente: Cartão Alimentação',     tempo:'Ontem, 17:30',cor:'laranja'},
            { icon:'✅', texto:'Pagamento aprovado: João Silva — R$ 2.150',    tempo:'Ontem, 15:00',cor:'verde'  },
            { icon:'🔍', texto:'Nova candidatura: Vaga Analista de RH',        tempo:'Ontem, 11:20',cor:'azul'   },
            { icon:'📊', texto:'Relatório de turnover gerado — Maio/2025',     tempo:'22/04, 10:00',cor:'roxo'   },
          ].map(a => `
            <div class="ativ-item">
              <span class="ativ-icon bg-${a.cor}">${a.icon}</span>
              <div class="ativ-info"><span>${a.texto}</span><small>${a.tempo}</small></div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- HEADCOUNT POR DEPTO -->
      <div class="depto-section">
        <div class="section-header">
          <h3>🏢 Headcount por Departamento</h3>
          <button class="link-btn" onclick="navigateTo('pessoas')">Detalhes</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${deptoCards}
        </div>
      </div>

      <!-- AGENDA DO DIA -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📅 Agenda do Dia</h3>
          <span class="mes-badge">${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}</span>
        </div>
        <div class="agenda-list">
          ${[
            { hora:'09:00', evento:'Entrevista — Vaga Dev Front-end',      tipo:'entrevista' },
            { hora:'10:30', evento:'Reunião: alinhamento de metas Q2',     tipo:'reuniao'    },
            { hora:'13:00', evento:'Onboarding: Carlos Mendes',            tipo:'onboarding' },
            { hora:'15:00', evento:'Revisão folha de pagamento Maio',      tipo:'financeiro' },
            { hora:'16:30', evento:'Pesquisa de clima — equipe Comercial', tipo:'clima'      },
          ].map(ag => `
            <div class="agenda-item">
              <span class="agenda-hora">${ag.hora}</span>
              <span class="agenda-dot tipo-${ag.tipo}"></span>
              <span class="agenda-evento">${ag.evento}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- INDICADORES RÁPIDOS -->
    <div class="depto-section">
      <div class="section-header"><h3>📊 Indicadores Rápidos</h3><button class="link-btn" onclick="navigateTo('indicadores')">Ver completo →</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:4px">
        ${[
          { label:'Turnover Mensal',    valor:'4,2%',   meta:'< 5%',    ok:true,  icon:'📉' },
          { label:'Absenteísmo',        valor:'2,1%',   meta:'< 3%',    ok:true,  icon:'📆' },
          { label:'Time to Hire',       valor:'18 dias', meta:'< 25d',   ok:true,  icon:'⏱️' },
          { label:'NPS Colaborador',    valor:'72',     meta:'> 70',    ok:true,  icon:'😊' },
          { label:'Trein. concluídos',  valor:'68%',    meta:'> 80%',   ok:false, icon:'🎓' },
          { label:'Headcount previsto', valor:'35',     meta:'atual:32', ok:true,  icon:'👥' },
        ].map(ind => `
          <div style="
            background:${ind.ok?'#f0fdf4':'#fef2f2'};
            border:1px solid ${ind.ok?'#bbf7d0':'#fecaca'};
            border-radius:12px;padding:14px;text-align:center
          ">
            <div style="font-size:22px;margin-bottom:4px">${ind.icon}</div>
            <strong style="font-size:20px;font-weight:800;color:${ind.ok?'#16a34a':'#dc2626'}">${ind.valor}</strong>
            <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin:2px 0">${ind.label}</div>
            <div style="font-size:10px;color:var(--text-muted)">Meta: ${ind.meta}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ACESSO RÁPIDO ADM -->
    <div class="depto-section">
      <div class="section-header"><h3>⚡ Acesso Rápido</h3></div>
      <div class="dash-acoes-grid">
        <button onclick="navigateTo('departamento')">📋 Depto. Pessoal</button>
        <button onclick="navigateTo('recrutamento')">🔍 Recrutamento</button>
        <button onclick="navigateTo('pessoas')">👥 Gestão de Pessoas</button>
        <button onclick="navigateTo('indicadores')">📊 Indicadores</button>
        <button onclick="navigateTo('documentos')">📄 Documentos</button>
        <button onclick="navigateTo('ouvidoria')">📢 Ouvidoria</button>
        <button onclick="navigateTo('cargos')">🏗️ Cargos & Estrutura</button>
        <button onclick="navigateTo('integracoes')">🔌 Integrações</button>
        <button onclick="navigateTo('comunicacao')">📣 Comunicação</button>
        <button onclick="navigateTo('desenvolvimento')">🎓 T&D</button>
        <button onclick="navigateTo('clima')">😊 Clima</button>
        <button onclick="navigateTo('endomarketing')">📺 Endomarketing.tv</button>
      </div>
    </div>

  </div>`;
}

function aprovarDash(i, colab, tipo) {
  const el = document.getElementById(`aprov-${i}`);
  if (el) { el.style.opacity='0.5'; el.innerHTML=`<span style="color:var(--success);font-size:13px;font-weight:600;padding:8px">✅ Aprovado — ${colab}</span>`; }
  setTimeout(() => { if (el) el.style.display='none'; }, 1500);
}

function recusarDash(i, colab) {
  if (!confirm(`Recusar solicitação de ${colab}?`)) return;
  const el = document.getElementById(`aprov-${i}`);
  if (el) { el.style.opacity='0.5'; el.innerHTML=`<span style="color:var(--danger);font-size:13px;font-weight:600;padding:8px">✕ Recusado — ${colab}</span>`; }
  setTimeout(() => { if (el) el.style.display='none'; }, 1500);
}

// ─────────────────────────────────────────────
// DASHBOARD GESTOR
// ─────────────────────────────────────────────
function renderDashboardGestor(u) {
  const nomeGestor = u.nome || 'Gestor';
  const deptoGestor = 'Comercial';
  const naoLidas = getNaoLidas().length;

  // Equipe do gestor (filtra do pessoasData se disponível)
  const equipe = (typeof pessoasData !== 'undefined'
    ? pessoasData.colaboradores.filter(c => c.depto === deptoGestor && c.nivel !== 'admin')
    : [
        { nome:'João Silva',  cargo:'Vendedor',    status:'Ativo',    admissao:'01/03/2022' },
        { nome:'Paulo Santos',cargo:'Estoquista',  status:'Afastado', admissao:'05/11/2021' },
      ]
  );

  const solicitacoesPendentes = [
    { colab:'Maria Oliveira', tipo:'Férias — 15 dias',         data:'24/05/2025', urgencia:'media'  },
    { colab:'Paulo Santos',   tipo:'Home Office — 2 dias/sem', data:'23/05/2025', urgencia:'baixa'  },
    { colab:'Felipe Rocha',   tipo:'Cartão Alimentação',       data:'22/05/2025', urgencia:'alta'   },
  ];

  const minhasSolicPessoais = [
    { tipo:'Férias — Julho', status:'Aprovada',    data:'10/05/2025', statusCor:'pago'    },
    { tipo:'Adiantamento',   status:'Em análise',  data:'20/05/2025', statusCor:'pendente'},
  ];

  return `
  <div class="depto-page">

    <!-- BOAS VINDAS GESTOR -->
    <div class="dash-boas-vindas dash-gestor">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <h2 style="margin:0">${getSaudacao()}, ${nomeGestor.split(' ')[0]}! 👋</h2>
          <span class="dash-perfil-badge gestor">👔 Gestor — ${deptoGestor}</span>
        </div>
        <p style="color:rgba(255,255,255,.8);margin:0;font-size:13px">${getDataHoje()} · Sua equipe e suas pendências</p>
      </div>
      ${naoLidas > 0 ? `<div style="background:rgba(255,255,255,.15);border-radius:20px;padding:8px 16px;font-size:13px;font-weight:600;color:white">🔔 ${naoLidas} pendência${naoLidas>1?'s':''}</div>` : ''}
    </div>

    <!-- KPIs DA EQUIPE -->
    <div class="depto-cards">
      <div class="depto-card" style="border-left:4px solid #16a34a">
        <div class="depto-card-icon">👥</div>
        <div class="depto-card-info"><strong>${equipe.length}</strong><span>Membros da equipe</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #dc2626">
        <div class="depto-card-icon">😴</div>
        <div class="depto-card-info"><strong>${equipe.filter(c=>c.status==='Afastado').length}</strong><span>Afastados hoje</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #d97706">
        <div class="depto-card-icon">⏳</div>
        <div class="depto-card-info"><strong>${solicitacoesPendentes.length}</strong><span>Aguardando sua aprovação</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">📈</div>
        <div class="depto-card-info"><strong>78%</strong><span>Meta do time em Maio</span></div>
      </div>
    </div>

    <!-- GRID PRINCIPAL -->
    <div class="ind-grid">

      <!-- APROVAÇÕES DA EQUIPE -->
      <div class="depto-section">
        <div class="section-header">
          <h3>⏳ Aprovações da Equipe</h3>
          <span class="badge-status pendente">${solicitacoesPendentes.length} pendentes</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px" id="gest-aprovacoes">
          ${solicitacoesPendentes.map((sol, i) => `
            <div class="dash-aprovacao-item" id="gaprov-${i}">
              <div class="abs-avatar" style="width:32px;height:32px;font-size:10px;flex-shrink:0">
                ${sol.colab.split(' ').map(n=>n[0]).join('').substring(0,2)}
              </div>
              <div style="flex:1;min-width:0">
                <strong style="font-size:12px">${sol.colab}</strong>
                <small style="display:block;color:var(--text-muted)">${sol.tipo} · ${sol.data}</small>
              </div>
              <div class="decisao-btns" style="gap:4px">
                <button class="btn-aprovar" style="padding:4px 10px;font-size:11px" onclick="aprovarGestor(${i},'${sol.colab}')">✓ Aprovar</button>
                <button style="padding:4px 10px;font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600"
                  onclick="recusarGestor(${i},'${sol.colab}')">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="link-btn" style="margin-top:10px;font-size:12px" onclick="navigateTo('servicos')">Ver todas →</button>
      </div>

      <!-- MINHA EQUIPE -->
      <div class="depto-section">
        <div class="section-header">
          <h3>👥 Minha Equipe — ${deptoGestor}</h3>
          <button class="link-btn" onclick="navigateTo('pessoas')">Ver perfis</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${equipe.slice(0,6).map(c => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;background:var(--surface)">
              <div class="abs-avatar" style="width:32px;height:32px;font-size:10px;flex-shrink:0">
                ${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}
              </div>
              <div style="flex:1;min-width:0">
                <strong style="font-size:12px">${c.nome}</strong>
                <small style="display:block;color:var(--text-muted)">${c.cargo}</small>
              </div>
              <span class="badge-status ${c.status==='Ativo'?'pago':c.status==='Afastado'?'inativo':'pendente'}">${c.status}</span>
              <button class="link-btn" style="font-size:11px" onclick="verColabDash('${c.nome}')">👁️</button>
            </div>
          `).join('')}
          ${equipe.length > 6 ? `<button class="link-btn" style="text-align:center;padding:6px" onclick="navigateTo('pessoas')">Ver mais ${equipe.length-6} colaboradores →</button>` : ''}
        </div>
      </div>

      <!-- AGENDA DO DIA -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📅 Minha Agenda</h3>
          <span class="mes-badge">${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}</span>
        </div>
        <div class="agenda-list">
          ${[
            { hora:'09:30', evento:'1:1 com Maria Oliveira',              tipo:'reuniao'    },
            { hora:'11:00', evento:'Reunião de meta — equipe Comercial',  tipo:'reuniao'    },
            { hora:'14:00', evento:'Entrevista — Gerente Comercial',      tipo:'entrevista' },
            { hora:'16:00', evento:'Feedback: João Silva',                tipo:'clima'      },
          ].map(ag => `
            <div class="agenda-item">
              <span class="agenda-hora">${ag.hora}</span>
              <span class="agenda-dot tipo-${ag.tipo}"></span>
              <span class="agenda-evento">${ag.evento}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MINHAS SOLICITAÇÕES PESSOAIS -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📝 Minhas Solicitações</h3>
          <button class="link-btn" onclick="navigateTo('servicos')">+ Nova</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${minhasSolicPessoais.map(sol => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:var(--surface)">
              <div style="flex:1">
                <strong style="font-size:12px">${sol.tipo}</strong>
                <small style="display:block;color:var(--text-muted)">${sol.data}</small>
              </div>
              <span class="badge-status ${sol.statusCor}">${sol.status}</span>
            </div>
          `).join('')}
          <button class="link-btn" style="text-align:center;padding:8px;font-size:12px" onclick="navigateTo('servicos')">
            Ver todas as minhas solicitações →
          </button>
        </div>
      </div>

    </div>

    <!-- PERFORMANCE DA EQUIPE -->
    <div class="depto-section">
      <div class="section-header"><h3>📈 Performance da Equipe — Maio/2025</h3><button class="link-btn" onclick="navigateTo('indicadores')">Detalhes →</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:8px">
        ${[
          { label:'Meta de Vendas',   valor:'78%',    cor:'#d97706', ok:false },
          { label:'Atendimento',      valor:'94%',    cor:'#16a34a', ok:true  },
          { label:'Satisfação',       valor:'4,6/5',  cor:'#16a34a', ok:true  },
          { label:'Absenteísmo',      valor:'1,5%',   cor:'#16a34a', ok:true  },
        ].map(p => `
          <div style="background:${p.cor}10;border:1px solid ${p.cor}30;border-radius:10px;padding:14px;text-align:center">
            <strong style="font-size:22px;font-weight:800;color:${p.cor}">${p.valor}</strong>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${p.label}</div>
            <div style="font-size:10px;font-weight:700;color:${p.cor};margin-top:2px">${p.ok?'✓ Ok':'⚠️ Atenção'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ACESSO RÁPIDO GESTOR -->
    <div class="depto-section">
      <div class="section-header"><h3>⚡ Acesso Rápido</h3></div>
      <div class="dash-acoes-grid">
        <button onclick="navigateTo('servicos')">📝 Solicitações</button>
        <button onclick="navigateTo('pessoas')">👥 Minha Equipe</button>
        <button onclick="navigateTo('recrutamento')">🔍 Recrutamento</button>
        <button onclick="navigateTo('indicadores')">📊 Indicadores</button>
        <button onclick="navigateTo('documentos')">📄 Documentos</button>
        <button onclick="navigateTo('desenvolvimento')">🎓 T&D</button>
        <button onclick="navigateTo('clima')">😊 Clima</button>
        <button onclick="navigateTo('departamento')">💰 Meu Holerite</button>
      </div>
    </div>

  </div>`;
}

function aprovarGestor(i, colab) {
  const el = document.getElementById(`gaprov-${i}`);
  if (el) { el.style.opacity='0.5'; el.innerHTML=`<span style="color:var(--success);font-size:13px;font-weight:600;padding:8px">✅ Aprovado — ${colab}</span>`; }
  setTimeout(() => { if(el) el.style.display='none'; }, 1500);
}

function recusarGestor(i, colab) {
  if (!confirm(`Recusar solicitação de ${colab}?`)) return;
  const el = document.getElementById(`gaprov-${i}`);
  if (el) { el.style.opacity='0.5'; el.innerHTML=`<span style="color:var(--danger);font-size:13px;font-weight:600;padding:8px">✕ Recusado — ${colab}</span>`; }
  setTimeout(() => { if(el) el.style.display='none'; }, 1500);
}

function verColabDash(nome) {
  alert(`👤 ${nome}\n\nVer perfil completo em Gestão de Pessoas.`);
  navigateTo('pessoas');
}

// ─────────────────────────────────────────────
// DASHBOARD COLABORADOR
// ─────────────────────────────────────────────
function renderDashboardColab(u) {
  const nomeColab = u.nome  || 'Colaborador';
  const cargo     = u.cargo || 'Colaborador';
  const naoLidas  = getNaoLidas().length;

  // Dados do colaborador logado
  const colabData = (typeof pessoasData !== 'undefined'
    ? pessoasData.colaboradores.find(c => c.nome.includes(nomeColab.split(' ')[0]))
    : null) || {
      nome: nomeColab, cargo, depto: 'Comercial',
      gestor: 'Carlos Souza', admissao: '01/03/2022', salario: 2000,
    };

  // Dias de empresa
  const admDate = colabData.admissao
    ? new Date(colabData.admissao.split('/').reverse().join('-'))
    : new Date('2022-03-01');
  const diasEmpresa = Math.floor((new Date() - admDate) / 86400000);
  const anosEmpresa = Math.floor(diasEmpresa / 365);
  const mesesResto  = Math.floor((diasEmpresa % 365) / 30);

  const minhasSolic = [
    { tipo:'Cartão Alimentação',  status:'Aprovada',   data:'20/05/2025', statusCor:'pago'    },
    { tipo:'Holerite Maio/2025',  status:'Disponível', data:'15/05/2025', statusCor:'pago'    },
    { tipo:'Declaração de Vínculo',status:'Em andamento',data:'22/05/2025',statusCor:'pendente'},
  ];

  const treinamentos = [
    { nome:'Compliance e Ética',      prazo:'30/05/2025', progresso:60, cor:'#d97706' },
    { nome:'Atendimento ao Cliente',  prazo:'15/06/2025', progresso:100,cor:'#16a34a' },
    { nome:'Segurança no Trabalho',   prazo:'01/07/2025', progresso:0,  cor:'#6b7280' },
  ];

  const meusBeneficios = [
    { icon:'🍽️', nome:'Alimentação (Caju)',     valor:'R$ 550/mês',   ativo:true  },
    { icon:'🚌', nome:'Mobilidade (Caju)',        valor:'R$ 200/mês',   ativo:true  },
    { icon:'❤️', nome:'Plano de Saúde',           valor:'SulAmérica',  ativo:true  },
    { icon:'💚', nome:'Telemedicina',             valor:'Conexa Saúde', ativo:true  },
  ];

  return `
  <div class="depto-page">

    <!-- BOAS VINDAS COLABORADOR -->
    <div class="dash-boas-vindas dash-colab">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <h2 style="margin:0">${getSaudacao()}, ${nomeColab.split(' ')[0]}! 👋</h2>
          <span class="dash-perfil-badge colab">👤 Colaborador</span>
        </div>
        <p style="color:rgba(255,255,255,.8);margin:0;font-size:13px">${getDataHoje()}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${naoLidas > 0 ? `
          <div style="background:rgba(255,255,255,.15);border-radius:20px;padding:8px 16px;font-size:12px;font-weight:600;color:white;cursor:pointer" onclick="togglePainelNotif(event)">
            🔔 ${naoLidas} notificação${naoLidas>1?'ões':''}
          </div>` : ''}
        <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:8px 16px;font-size:12px;color:white;text-align:center">
          <strong style="display:block;font-size:16px">${anosEmpresa > 0 ? anosEmpresa+'a '+mesesResto+'m' : mesesResto+'m'}</strong>
          <small>na empresa</small>
        </div>
      </div>
    </div>

    <!-- NOTIFICAÇÕES ATIVAS (se houver não lidas) -->
    ${naoLidas > 0 ? `
    <div class="dash-alertas">
      ${(notifData[getNotifPerfil()]||[]).filter(n=>!n.lida).slice(0,3).map(n => `
        <div class="dash-alerta-item" style="cursor:pointer" onclick="abrirNotif(${n.id})">
          <span>${n.icone}</span>
          <span style="font-size:12px;font-weight:600">${n.titulo}: ${n.desc}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:auto;white-space:nowrap">${n.tempo} →</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- CARTÃO PESSOAL -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:16px;padding:20px 24px;color:white;display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <div class="abs-avatar" style="width:56px;height:56px;font-size:18px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);flex-shrink:0">
        ${nomeColab.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <strong style="font-size:18px;display:block">${nomeColab}</strong>
        <span style="font-size:13px;opacity:.85">${colabData.cargo} · ${colabData.depto}</span>
        <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap">
          <span style="font-size:12px;opacity:.8">👔 Gestor: ${colabData.gestor}</span>
          <span style="font-size:12px;opacity:.8">📅 Desde: ${colabData.admissao}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
        <button onclick="navigateTo('jornada')" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">🚀 Minha Jornada</button>
        <button onclick="navigateTo('servicos')" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">📝 Fazer Solicitação</button>
      </div>
    </div>

    <!-- KPIs PESSOAIS -->
    <div class="depto-cards">
      <div class="depto-card" style="border-left:4px solid #16a34a">
        <div class="depto-card-icon">🏖️</div>
        <div class="depto-card-info"><strong>30 dias</strong><span>Saldo de férias</span></div>
      </div>
      <div class="depto-card" onclick="navigateTo('servicos')" style="cursor:pointer">
        <div class="depto-card-icon">📝</div>
        <div class="depto-card-info"><strong>${minhasSolic.filter(s=>s.status==='Em andamento').length}</strong><span>Solicitações em andamento</span></div>
      </div>
      <div class="depto-card" onclick="navigateTo('desenvolvimento')" style="cursor:pointer" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">🎓</div>
        <div class="depto-card-info"><strong>${treinamentos.filter(t=>t.progresso<100).length}</strong><span>Treinamentos pendentes</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">💰</div>
        <div class="depto-card-info"><strong>R$ ${colabData.salario.toLocaleString('pt-BR',{minimumFractionDigits:2})}</strong><span>Holerite Maio/2025</span></div>
      </div>
    </div>

    <!-- GRID PRINCIPAL -->
    <div class="ind-grid">

      <!-- MINHAS SOLICITAÇÕES -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📝 Minhas Solicitações</h3>
          <button class="btn-primary" style="padding:6px 12px;font-size:11px" onclick="navigateTo('servicos')">+ Nova</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${minhasSolic.map(sol => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
              <div style="flex:1;min-width:0">
                <strong style="font-size:12px">${sol.tipo}</strong>
                <small style="display:block;color:var(--text-muted)">${sol.data}</small>
              </div>
              <span class="badge-status ${sol.statusCor}">${sol.status}</span>
            </div>
          `).join('')}
          <button class="link-btn" style="text-align:center;padding:6px;font-size:12px" onclick="navigateTo('servicos')">Ver todas →</button>
        </div>
      </div>

      <!-- MEUS TREINAMENTOS -->
      <div class="depto-section">
        <div class="section-header">
          <h3>🎓 Meus Treinamentos</h3>
          <button class="link-btn" onclick="navigateTo('desenvolvimento')">Ver todos</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${treinamentos.map(t => `
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:12px;font-weight:600">${t.nome}</span>
                <span style="font-size:11px;font-weight:700;color:${t.cor}">${t.progresso}%</span>
              </div>
              <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${t.progresso}%;background:${t.cor};border-radius:3px;transition:width .5s"></div>
              </div>
              <small style="color:var(--text-muted)">Prazo: ${t.prazo}</small>
            </div>
          `).join('')}
          <button class="btn-primary" style="padding:8px;font-size:12px" onclick="navigateTo('desenvolvimento')">Continuar treinamentos →</button>
        </div>
      </div>

      <!-- MEUS BENEFÍCIOS -->
      <div class="depto-section">
        <div class="section-header">
          <h3>💳 Meus Benefícios</h3>
          <button class="link-btn" onclick="navigateTo('jornada')">Ver detalhes</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${meusBeneficios.map(b => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:${b.ativo?'#f0fdf4':'var(--surface)'};border:1px solid ${b.ativo?'#bbf7d0':'var(--border)'}">
              <span style="font-size:20px">${b.icon}</span>
              <div style="flex:1">
                <strong style="font-size:12px">${b.nome}</strong>
                <small style="display:block;color:var(--text-muted)">${b.valor}</small>
              </div>
              <span class="badge-status ${b.ativo?'pago':'inativo'}">${b.ativo?'Ativo':'Inativo'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AGENDA / PRÓXIMOS EVENTOS -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📅 Próximos Eventos</h3>
          <button class="link-btn" onclick="navigateTo('endomarketing')">Agenda cultural →</button>
        </div>
        <div class="agenda-list">
          ${[
            { hora:'Amanhã 09:00', evento:'Reunião geral — todos colaboradores', tipo:'reuniao'   },
            { hora:'29/05 09:00',  evento:'Campanha de vacinação — RH',          tipo:'clima'     },
            { hora:'30/05',        evento:'Fechamento de ponto — regularize!',   tipo:'financeiro'},
            { hora:'01/06',        evento:'Recarga Caju (alimentação + mobi)',    tipo:'onboarding'},
          ].map(ag => `
            <div class="agenda-item">
              <span class="agenda-hora" style="min-width:90px;font-size:11px">${ag.hora}</span>
              <span class="agenda-dot tipo-${ag.tipo}"></span>
              <span class="agenda-evento">${ag.evento}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- ACESSO RÁPIDO COLABORADOR -->
    <div class="depto-section">
      <div class="section-header"><h3>⚡ Acesso Rápido</h3></div>
      <div class="dash-acoes-grid">
        <button onclick="navigateTo('servicos')">📝 Solicitações</button>
        <button onclick="navigateTo('departamento')">💰 Meu Holerite</button>
        <button onclick="navigateTo('jornada')">🚀 Minha Jornada</button>
        <button onclick="navigateTo('desenvolvimento')">🎓 Treinamentos</button>
        <button onclick="navigateTo('documentos')">📄 Meus Documentos</button>
        <button onclick="navigateTo('ouvidoria')">📢 Ouvidoria</button>
        <button onclick="navigateTo('clima')">😊 Feed & Clima</button>
        <button onclick="navigateTo('experiencia')">✨ Experiência</button>
      </div>
    </div>

  </div>`;
}
