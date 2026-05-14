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
  // ── Enterprise ────────────────────────────────────────────
  analytics:       () => renderAnalytics(),
  timeline:        () => renderTimeline('demo', 'Timeline do Colaborador'),
  automacao:       () => renderAutomacao(),
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
  analytics:       'People Analytics',
  timeline:        'Timeline do Colaborador',
  automacao:       'Automation Engine',
  dpc:             'Central Trabalhista Inteligente',
  dpdashboard:     'DP — Dashboard Operacional',
  'dp-massa':      'DP — Cálculo em Massa',
  usuarios:        'Usuários & Permissões',
};

function navigateTo(pageKey) {
  Router.navigateTo(pageKey);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
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

  // ── Filtrar sidebar por perfil (Auth.js) ──────────────────
  if (window.Auth) {
    Auth.applySidebar();
    // Guard: se o hash atual não for permitido, redireciona para dashboard
    const hashAtual = window.location.hash.replace('#','') || 'dashboard';
    if (!Auth.canView(hashAtual)) window.location.hash = 'dashboard';
  }

  // Navegação (com guard de permissão por clique)
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const page = item.dataset.page;
      if (window.Auth && !Auth.canView(page)) {
        if (window.Toast) Toast.aviso('Você não tem permissão para acessar este módulo.');
        return;
      }
      navigateTo(page);
    });
  });

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