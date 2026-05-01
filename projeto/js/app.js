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
  jornada:         () => renderJornada(),
  integracoes:     () => renderIntegracoes(),
  endomarketing:   () => renderEndomarketing(),
  nr01:            () => renderNr01(),
  gestor:          () => renderGestor(),
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
  jornada:         'Jornada do Colaborador',
  integracoes:     'Integrações',
  endomarketing:   'Endomarketing.tv',
  nr01:            'NR-01 — Segurança do Trabalho',
  gestor:          'Gestão de Equipes',
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
    const iniciais = userData.nome.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    const av1 = document.getElementById('topbar-avatar');
    const av2 = document.getElementById('sidebar-avatar');
    const nm1 = document.getElementById('topbar-nome');
    const nm2 = document.getElementById('sidebar-nome');
    const cg  = document.getElementById('sidebar-cargo');
    const dh  = document.getElementById('dropdown-header');

    if (av1) av1.textContent = iniciais;
    if (av2) av2.textContent = iniciais;
    if (nm1) nm1.textContent = userData.nome.split(' ')[0];
    if (nm2) nm2.textContent = userData.nome;
    if (cg)  cg.textContent  = userData.cargo || '—';
    if (dh)  dh.innerHTML    = `<strong>${userData.nome}</strong><small>${userData.email||''}</small>`;
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