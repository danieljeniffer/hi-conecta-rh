/**
 * dp-dashboard-ops.js — Dashboard Operacional do DP
 * KPIs, alertas críticos, timeline, SLA e atalhos rápidos.
 */

function renderDPDashboardOps() {
  const dados = _getDashboardData();
  return `
<div class="dpd-root">

  <!-- HERO ────────────────────────────────── -->
  <div class="dpd-hero">
    <div class="dpd-hero-left">
      <div class="dpd-hero-icon">🏢</div>
      <div>
        <h2>Dashboard Operacional — DP</h2>
        <p>${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
    </div>
    <div class="dpd-hero-actions">
      <button class="dpd-btn" onclick="navigateTo('departamento')">⚡ Central de Cálculos</button>
      <button class="dpd-btn dpd-btn-outline" onclick="dpcCalculoMassa?.()">📊 Cálculo em Massa</button>
    </div>
  </div>

  <!-- KPIs CRÍTICOS ──────────────────────── -->
  <div class="dpd-kpis">
    ${dados.kpis.map(k => `
    <div class="dpd-kpi dpd-kpi-${k.nivel}" onclick="${k.acao||''}">
      <div class="dpd-kpi-icon">${k.icon}</div>
      <div class="dpd-kpi-val">${k.val}</div>
      <div class="dpd-kpi-label">${k.label}</div>
      ${k.sub ? `<div class="dpd-kpi-sub">${k.sub}</div>` : ''}
      ${k.badge ? `<span class="dpd-kpi-badge dpd-badge-${k.nivel}">${k.badge}</span>` : ''}
    </div>`).join('')}
  </div>

  <!-- ALERTAS CRÍTICOS ───────────────────── -->
  ${dados.alertasCriticos.length ? `
  <div class="dpd-alertas-secao">
    <div class="dpd-secao-hd">
      <h3>🚨 Alertas Críticos</h3>
      <span class="dpd-badge-red">${dados.alertasCriticos.length} pendente(s)</span>
    </div>
    <div class="dpd-alertas-lista">
      ${dados.alertasCriticos.map(a => `
      <div class="dpd-alerta-card dpd-alerta-${a.nivel}">
        <span class="dpd-alerta-icon">${a.icon}</span>
        <div class="dpd-alerta-body">
          <div class="dpd-alerta-titulo">${a.titulo}</div>
          <div class="dpd-alerta-desc">${a.desc}</div>
        </div>
        <div class="dpd-alerta-meta">
          <span class="dpd-alerta-prazo">${a.prazo || ''}</span>
          <button class="dpd-btn-mini" onclick="${a.acao||''}">Resolver →</button>
        </div>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- GRID: Férias + Rescisões + Folha ────── -->
  <div class="dpd-grid-3">

    <!-- Férias vencendo -->
    <div class="dpd-card">
      <div class="dpd-card-hd">
        <h4>🏖️ Férias Vencendo</h4>
        <span class="dpd-badge-amber">${dados.feriasVencendo.length}</span>
      </div>
      ${dados.feriasVencendo.map(f => `
      <div class="dpd-lista-item">
        <div class="dpd-li-av">${f.av}</div>
        <div class="dpd-li-info">
          <strong>${f.nome}</strong>
          <small>${f.dias} dias restantes</small>
        </div>
        <button class="dpd-btn-mini" onclick="dpcSelecionarColab?.('${f.id}');dpcSelecionarTipo?.('ferias')">Calcular</button>
      </div>`).join('')}
      <button class="dpd-card-link" onclick="navigateTo('departamento')">Ver todas →</button>
    </div>

    <!-- Rescisões em andamento -->
    <div class="dpd-card">
      <div class="dpd-card-hd">
        <h4>👋 Rescisões Abertas</h4>
        <span class="dpd-badge-red">${dados.rescisoes.length}</span>
      </div>
      ${dados.rescisoes.map(r => `
      <div class="dpd-lista-item">
        <div class="dpd-li-av">${r.av}</div>
        <div class="dpd-li-info">
          <strong>${r.nome}</strong>
          <small>${r.tipo} · ${r.prazo}</small>
        </div>
        <span class="dpd-st-${r.status}">${r.status}</span>
      </div>`).join('')}
      <button class="dpd-card-link" onclick="dpcAbrirWizardRescisao?.()">Novo wizard →</button>
    </div>

    <!-- Folha de pagamento -->
    <div class="dpd-card">
      <div class="dpd-card-hd">
        <h4>💰 Folha de Pagamento</h4>
        <span class="dpd-badge-${dados.folha.status==='paga'?'green':'amber'}">${dados.folha.status}</span>
      </div>
      <div class="dpd-folha-info">
        <div class="dpd-fi-item">
          <span>Competência</span>
          <strong>${dados.folha.competencia}</strong>
        </div>
        <div class="dpd-fi-item">
          <span>Total Bruto</span>
          <strong>${PFmt?.moeda?.(dados.folha.bruto)}</strong>
        </div>
        <div class="dpd-fi-item">
          <span>Total Líquido</span>
          <strong style="color:#16a34a">${PFmt?.moeda?.(dados.folha.liquido)}</strong>
        </div>
        <div class="dpd-fi-item">
          <span>FGTS Empresa</span>
          <strong>${PFmt?.moeda?.(dados.folha.fgts)}</strong>
        </div>
      </div>
      <div class="dpd-folha-progress">
        <div class="dpd-folha-bar" style="width:${dados.folha.progresso}%"></div>
      </div>
      <small>${dados.folha.progresso}% processado · ${dados.folha.colaboradores} colaboradores</small>
    </div>

  </div>

  <!-- SLA OPERACIONAL ────────────────────── -->
  <div class="dpd-card">
    <div class="dpd-card-hd"><h4>⏱️ SLA Operacional</h4><span style="font-size:11px;color:#64748b">Metas de atendimento do DP</span></div>
    <div class="dpd-sla-grid">
      ${dados.sla.map(s => `
      <div class="dpd-sla-item">
        <div class="dpd-sla-header">
          <span class="dpd-sla-label">${s.label}</span>
          <span class="dpd-sla-val ${s.ok?'ok':'nok'}">${s.atual}/${s.meta}h</span>
        </div>
        <div class="dpd-sla-bar-bg">
          <div class="dpd-sla-bar" style="width:${Math.min(100,(s.atual/s.meta)*100)}%;background:${s.ok?'#16a34a':'#dc2626'}"></div>
        </div>
        <div class="dpd-sla-status ${s.ok?'ok':'nok'}">${s.ok?'✓ Dentro do SLA':'✗ Acima do SLA'}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- TIMELINE OPERACIONAL ────────────────── -->
  <div class="dpd-card">
    <div class="dpd-card-hd"><h4>📋 Atividades Recentes</h4></div>
    <div class="dpd-timeline">
      ${dados.timeline.map(t => `
      <div class="dpd-tl-item">
        <div class="dpd-tl-icon" style="background:${t.cor}18;color:${t.cor}">${t.icon}</div>
        <div class="dpd-tl-body">
          <div class="dpd-tl-titulo">${t.titulo}</div>
          <div class="dpd-tl-sub">${t.sub}</div>
        </div>
        <div class="dpd-tl-tempo">${t.tempo}</div>
      </div>`).join('')}
    </div>
  </div>

</div>`;
}

function _getDashboardData() {
  return {
    kpis: [
      { icon:'👥', val:32,    label:'Colaboradores Ativos',  nivel:'azul',   sub:'28 CLT · 4 PJ',                 acao:"navigateTo('pessoas')"    },
      { icon:'🏖️', val:5,     label:'Férias Vencendo',        nivel:'amber',  sub:'Próximos 60 dias',              badge:'ATENÇÃO',                 acao:'' },
      { icon:'👋', val:2,     label:'Rescisões Abertas',      nivel:'erro',   sub:'Processos em andamento',        badge:'URGENTE',                 acao:'' },
      { icon:'💰', val:'R$ 156k', label:'Folha Maio/2025',   nivel:'verde',  sub:'Aprovada e em processamento',   acao:''                         },
      { icon:'📋', val:8,     label:'Admissões Pendentes',    nivel:'azul',   sub:'Onboarding em andamento',       acao:''                         },
      { icon:'⚠️', val:3,     label:'Inconsistências',        nivel:'amber',  sub:'Requerem verificação',          badge:'REVISAR',                 acao:'' },
    ],
    alertasCriticos: [
      { nivel:'erro',  icon:'🔴', titulo:'Rescisão vencendo hoje',   desc:'Paulo Santos — prazo TRCT: 30/05/2025.',   prazo:'Hoje!',    acao:"DPWizardRescisao.abrir({nome:'Paulo Santos',salario_base:3500,admissao:'2022-01-01'})" },
      { nivel:'amber', icon:'🟡', titulo:'Férias vencidas sem gozo', desc:'Ana Lima — período 2023–2024 expirado.',    prazo:'Urgente',  acao:'' },
      { nivel:'amber', icon:'📋', titulo:'Exame médico vencendo',    desc:'3 colaboradores com ASO vencendo em 15 dias.',prazo:'15 dias',acao:'' },
    ],
    feriasVencendo: [
      { id:'C4', av:'AL', nome:'Ana Lima',    dias:12, cor:'#dc2626' },
      { id:'C2', av:'CE', nome:'Carlos Souza',dias:28, cor:'#d97706' },
      { id:'C1', av:'MR', nome:'Mariana R.',  dias:45, cor:'#2563eb' },
    ],
    rescisoes: [
      { av:'PS', nome:'Paulo Santos',  tipo:'Sem Justa Causa', prazo:'30/05', status:'calculada' },
      { av:'BR', nome:'Bruno Rocha',   tipo:'Pedido Demissão', prazo:'05/06', status:'rascunho'  },
    ],
    folha: {
      competencia:'Maio/2025', bruto:156320, liquido:118540, fgts:12505,
      status:'calculada', progresso:65, colaboradores:32,
    },
    sla: [
      { label:'Admissão (5 dias úteis)',       meta:120, atual:48,  ok:true  },
      { label:'Rescisão TRCT (10 dias)',        meta:240, atual:180, ok:true  },
      { label:'Resposta Solicitação (48h)',     meta:48,  atual:52,  ok:false },
      { label:'Geração Holerite (dia 5)',       meta:120, atual:96,  ok:true  },
    ],
    timeline: [
      { icon:'👤', cor:'#16a34a', titulo:'Admissão concluída',       sub:'Beatriz Alves — TI',           tempo:'Hoje 09:12' },
      { icon:'💰', cor:'#2563eb', titulo:'Folha calculada',          sub:'Maio/2025 · 32 colaboradores',  tempo:'Hoje 08:30' },
      { icon:'📄', cor:'#7c3aed', titulo:'TRCT gerado',             sub:'Paulo Santos · R$ 18.450',       tempo:'Ontem 16:00'},
      { icon:'🏖️', cor:'#d97706', titulo:'Férias aprovadas',        sub:'Carlos Souza · 30 dias',         tempo:'Ontem 14:22'},
      { icon:'📋', cor:'#0891b2', titulo:'Holerites disponíveis',   sub:'32 holerites Abril/2025',        tempo:'05/05 07:00'},
    ],
  };
}

function initPage_dpdashboard() {}
