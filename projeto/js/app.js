// =============================================
// HI CONECTA RH — APP.JS
// =============================================

const pages = {
  dashboard:       () => renderDashboard(),
  pessoas:         () => renderPessoas(),
  indicadores:     () => renderIndicadores(),
  servicos:        () => renderServicos(),
  comunicacao:     () => renderComunicacao(),
  experiencia:     () => renderExperiencia(),
  recrutamento:    () => renderRecrutamento(),
  departamento:    () => renderDepartamento(),
  cargos:          () => renderCargos(),
  desenvolvimento: () => renderDesenvolvimento(),
  clima:           () => renderClima(),
  documentos:      () => renderDocumentos(),
  ouvidoria:       () => renderOuvidoria(),
  jornada:         () => { setTimeout(() => { if (typeof ptlNav==='function') ptlNav('jornada'); }, 80); return renderPortal(); },
  integracoes:     () => renderIntegracoes(),
  endomarketing:   () => renderEndomarketing(),
  nr01:            () => renderNr01(),
  gestor:          () => renderGestor(),
  bonificacoes:    () => renderBonificacoes(),
  portal:          () => renderPortal(),
  // ── Enterprise Analytics ─────────────────────────────────
  analytics:              () => renderAnalytics(),
  timeline:               () => renderTimeline('demo', 'Timeline do Colaborador'),
  automacao:              () => renderAutomacao(),
  // ── Sistema Nervoso Corporativo (camada IA) ───────────────
  'inteligencia-central':  () => renderInteligenciaCentral(),
  'organograma-vivo':      () => renderOrganogramaVivo(),
  'health-score':          () => renderHealthScore(),
  'copiloto-ia':           () => renderCopilotoIA(),
  // ── Human Experience Operating System (HXOS) ─────────────
  'dashboard-adaptativo':  () => renderDashboardAdaptativo(),
  'mapa-energia':          () => renderMapaEnergia(),
  'perfil-dna':            () => renderPerfilDNA(),
  // ── DP Inteligente ────────────────────────────────────────
  dpc:             () => renderDPCentral(),
  dpdashboard:     () => renderDPDashboardOps(),
  'dp-massa':      () => renderDPMassa(),
  usuarios:        () => renderUsuarios(),
};

const pageTitles = {
  dashboard:       'Dashboard',
  pessoas:         'Gestão de Pessoas',
  indicadores:     'Indicadores',
  servicos:        'Serviços RH',
  comunicacao:     'Comunicação',
  experiencia:     'Experiência',
  recrutamento:    'Recrutamento',
  departamento:    'Departamento Pessoal',
  cargos:          'Cargos & Estrutura',
  desenvolvimento: 'Treinamento & Desenvolvimento',
  clima:           'Clima & Engajamento',
  documentos:      'Documentos',
  ouvidoria:       'Ouvidoria',
  jornada:         'Portal do Colaborador',
  integracoes:     'Integrações',
  endomarketing:   'Endomarketing.tv',
  nr01:            'NR-01 — Segurança do Trabalho',
  gestor:          'Gestão de Equipes',
  bonificacoes:    'Bonificações & Formulários',
  portal:          'Portal do Colaborador',
  analytics:              'People Analytics',
  timeline:               'Timeline do Colaborador',
  automacao:              'Automation Engine',
  'inteligencia-central': '🧠 Inteligência Central',
  'organograma-vivo':     '🕸️ Organograma Vivo',
  'health-score':         '❤️ Health Score Organizacional',
  'copiloto-ia':           '🤖 Copiloto IA do Gestor',
  'dashboard-adaptativo':  '🎯 Meu Dashboard Adaptativo',
  'mapa-energia':          '⚡ Mapa de Energia',
  'perfil-dna':            '🧬 Meu Perfil DNA',
  dpc:                     'Central Trabalhista Inteligente',
  dpdashboard:            'DP — Dashboard Operacional',
  'dp-massa':             'DP — Cálculo em Massa',
  usuarios:               'Usuários & Permissões',
};

function navigateTo(pageKey) {
  Router.navigateTo(pageKey);
}

/**
 * Atualiza o breadcrumb na topbar com setor + módulo atual.
 * @param {string} pageKey
 */
function _atualizarBreadcrumb(pageKey) {
  const el = document.getElementById('pageTitle');
  if (!el || typeof window.MODULES_CONFIG === 'undefined') return;

  let setorLabel = '';
  let moduloLabel = pageTitles[pageKey] || pageKey;

  // Busca o setor que contém este módulo
  for (const setor of window.MODULES_CONFIG) {
    const mod = setor.modulos.find(m => !m.divider && m.id === pageKey);
    if (mod) {
      setorLabel   = setor.label;
      moduloLabel  = mod.label;
      break;
    }
  }

  if (setorLabel && setorLabel !== moduloLabel) {
    el.innerHTML = `
      <span class="topbar-breadcrumb">
        <span class="breadcrumb-setor">${setorLabel}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-page">${moduloLabel}</span>
      </span>`;
  } else {
    el.textContent = moduloLabel || 'Dashboard';
  }
}

// ── Toggle sidebar mobile ─────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    sb.classList.toggle('open');
  } else {
    toggleSidebarCollapse();
  }
}

// ── Colapso lateral (desktop) ─────────────────────────────────
function toggleSidebarCollapse() {
  const sb  = document.getElementById('sidebar');
  const btn = document.getElementById('btn-collapse-sidebar');
  if (!sb) return;
  const collapsed = sb.classList.toggle('collapsed');
  sessionStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
  if (btn) btn.textContent = collapsed ? '›' : '‹';
  if (btn) btn.title = collapsed ? 'Expandir menu' : 'Colapsar menu';
}

// ── Fechar sidebar mobile (overlay) ──────────────────────────
function closeSidebarMobile() {
  document.getElementById('sidebar')?.classList.remove('open');
}

function menuUsuario() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

async function sairSistema() {
  const ok = await Toast.confirmar('Deseja sair da plataforma?');
  if (ok) {
    sessionStorage.removeItem('hiRH_user');
    window.location.href = 'login.html';
  }
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
  // Carrega dados do usuário
  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');

  if (userData.nome) {
    // Todos os dados do usuário via textContent — nunca innerHTML
    const _safe  = v => String(v ?? '').slice(0, 200); // limita tamanho
    const nome   = _safe(userData.nome);
    const cargo  = _safe(userData.cargo) || '—';
    const email  = _safe(userData.email);
    const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

    const _set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    _set('topbar-avatar', iniciais);
    _set('sidebar-avatar', iniciais);
    _set('topbar-nome', nome.split(' ')[0]);
    _set('sidebar-nome', nome);
    _set('sidebar-cargo', cargo);

    // Dropdown: construído via DOM, sem innerHTML com dados externos
    const dh = document.getElementById('dropdown-header');
    if (dh) {
      dh.textContent = ''; // limpa conteúdo anterior
      const strong = document.createElement('strong');
      strong.textContent = nome;
      const small = document.createElement('small');
      small.textContent = email;
      dh.append(strong, document.createElement('br'), small);
    }
  }

  // ── Sidebar Enterprise dinâmica ───────────────────────────
  if (window.Sidebar && window.MODULES_CONFIG) {
    const perfil   = userData.perfil || 'colab';
    const hashInicial = window.location.hash.replace('#','') || 'dashboard';
    Sidebar.render(perfil, hashInicial);

    // Hooka a função navigateTo do Router para atualizar sidebar
    const _origNavigateTo = window.navigateTo;
    window.navigateTo = function(pageKey) {
      Sidebar.setActive(pageKey);
      _atualizarBreadcrumb(pageKey);
      _origNavigateTo(pageKey);
    };
  } else if (window.Auth) {
    // Fallback: sidebar estática legada
    Auth.applySidebar();
  }

  // Guard de permissão no hash inicial
  if (window.Auth) {
    const hashAtual = window.location.hash.replace('#','') || 'dashboard';
    if (!Auth.canView(hashAtual)) window.location.hash = 'dashboard';
  }

  // Restaura estado de colapso
  if (sessionStorage.getItem('sidebar_collapsed') === '1') {
    document.getElementById('sidebar')?.classList.add('collapsed');
    const btn = document.getElementById('btn-collapse-sidebar');
    if (btn) { btn.textContent = '›'; btn.title = 'Expandir menu'; }
  }

  // Fecha dropdown ao clicar fora
  document.addEventListener('click', e => {
    const dd = document.getElementById('user-dropdown');
    const av = document.getElementById('topbar-avatar');
    if (dd && av && !av.contains(e.target) && !dd.contains(e.target)) {
      dd.style.display = 'none';
    }
  });

  Router.init(pages, pageTitles);
});