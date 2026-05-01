/**
 * Auth.js — Motor Central de Permissões
 * hi Conecta RH · Controle de Acesso por Perfil
 *
 * Perfis:
 *   admin    → Administrador (acesso total)
 *   rh       → Gestor de RH (quase total, sem config de sistema)
 *   gestor   → Gestor de Equipe (escopo restrito ao seu setor)
 *   analista → Analista de RH (operacional, sem config)
 *   colab    → Colaborador (apenas próprios dados)
 *   juridico → Jurídico (acesso legado mantido)
 */
const Auth = (() => {

  // ─── PERFIL DO USUÁRIO LOGADO ─────────────────────────────
  function user()   { try { return JSON.parse(sessionStorage.getItem('hiRH_user') || '{}'); } catch { return {}; } }
  function perfil() { return user().perfil || 'colab'; }
  function nome()   { return user().nome   || 'Usuário'; }
  function setor()  { return user().setor  || ''; }

  // ─── MATRIX DE PERMISSÕES ─────────────────────────────────
  // Valores: 'edit' | 'view' | 'own' | 'responder' | false
  const MATRIX = {
    // ── ADMIN ─────────────────────────────────────────────
    admin: {
      dashboard: 'edit', pessoas: 'edit', indicadores: 'edit',
      servicos: 'edit',  comunicacao: 'edit', experiencia: 'edit',
      jornada: 'edit',   endomarketing: 'edit', recrutamento: 'edit',
      departamento: 'edit', integracoes: 'edit', cargos: 'edit',
      desenvolvimento: 'edit', clima: 'edit', documentos: 'edit',
      nr01: 'edit', ouvidoria: 'edit', gestor: 'edit', usuarios: 'edit',
    },

    // ── GESTOR DE RH ──────────────────────────────────────
    rh: {
      dashboard: 'view',    pessoas: 'edit',   indicadores: 'view',
      servicos: 'edit',     comunicacao: 'edit', experiencia: 'edit',
      jornada: 'view',      endomarketing: 'edit', recrutamento: 'edit',
      departamento: 'edit', integracoes: false, cargos: 'edit',
      desenvolvimento: 'edit', clima: 'edit', documentos: 'edit',
      nr01: 'edit', ouvidoria: 'edit', gestor: 'edit', usuarios: false,
    },

    // ── GESTOR DE EQUIPE ──────────────────────────────────
    gestor: {
      dashboard: 'view',  pessoas: 'edit',   indicadores: 'view',
      servicos: 'view',   comunicacao: 'view', experiencia: 'view',
      jornada: 'view',    endomarketing: false, recrutamento: 'view',
      departamento: false, integracoes: false, cargos: 'view',
      desenvolvimento: 'view', clima: 'view', documentos: 'view',
      nr01: 'view', ouvidoria: 'view', gestor: 'edit', usuarios: false,
    },

    // ── ANALISTA DE RH ────────────────────────────────────
    analista: {
      dashboard: 'view',    pessoas: 'edit',  indicadores: false,
      servicos: 'view',     comunicacao: 'edit', experiencia: 'edit',
      jornada: 'view',      endomarketing: 'view', recrutamento: 'edit',
      departamento: 'edit', integracoes: false, cargos: 'view',
      desenvolvimento: 'edit', clima: 'view', documentos: 'edit',
      nr01: 'view', ouvidoria: 'edit', gestor: 'view', usuarios: false,
    },

    // ── COLABORADOR ───────────────────────────────────────
    colab: {
      dashboard: 'view',  pessoas: 'own',  indicadores: false,
      servicos: 'view',   comunicacao: 'view', experiencia: 'view',
      jornada: 'view',    endomarketing: 'view', recrutamento: false,
      departamento: false, integracoes: false, cargos: false,
      desenvolvimento: 'view', clima: 'responder', documentos: 'view',
      nr01: 'view', ouvidoria: 'view', gestor: false, usuarios: false,
    },

    // ── JURÍDICO (legado) ─────────────────────────────────
    juridico: {
      dashboard: 'view',  pessoas: 'view', indicadores: false,
      servicos: 'view',   comunicacao: 'view', experiencia: false,
      jornada: false,     endomarketing: false, recrutamento: false,
      departamento: 'view', integracoes: false, cargos: false,
      desenvolvimento: false, clima: false, documentos: 'edit',
      nr01: 'view', ouvidoria: 'edit', gestor: false, usuarios: false,
    },
  };

  // ─── PÁGINAS VISÍVEIS NO SIDEBAR POR PERFIL ──────────────
  const SIDEBAR_PAGES = {
    admin: [
      'dashboard','pessoas','indicadores','servicos','comunicacao',
      'experiencia','jornada','endomarketing',
      'recrutamento','departamento','integracoes','cargos',
      'desenvolvimento','clima','documentos','nr01','ouvidoria',
      'gestor','usuarios',
    ],
    rh: [
      'dashboard','pessoas','indicadores','servicos','comunicacao',
      'experiencia','jornada','endomarketing',
      'recrutamento','departamento','cargos',
      'desenvolvimento','clima','documentos','nr01','ouvidoria',
      'gestor',
    ],
    gestor: [
      'dashboard','pessoas','servicos','comunicacao',
      'experiencia','jornada',
      'cargos','desenvolvimento','clima','documentos','nr01','ouvidoria',
      'gestor',
    ],
    analista: [
      'dashboard','pessoas','servicos','comunicacao',
      'experiencia','jornada','endomarketing',
      'recrutamento','departamento','cargos',
      'desenvolvimento','clima','documentos','nr01','ouvidoria',
      'gestor',
    ],
    colab: [
      'dashboard','pessoas','servicos','comunicacao',
      'experiencia','jornada','clima','documentos','nr01',
    ],
    juridico: [
      'dashboard','pessoas','servicos','comunicacao',
      'departamento','documentos','nr01','ouvidoria',
    ],
  };

  // ─── LABELS DOS PERFIS ────────────────────────────────────
  const PERFIL_LABELS = {
    admin:    { label: 'Administrador',    icon: '⭐', cor: '#7c3aed' },
    rh:       { label: 'Gestor de RH',     icon: '🏢', cor: '#2563eb' },
    gestor:   { label: 'Gestor de Equipe', icon: '👥', cor: '#16a34a' },
    analista: { label: 'Analista de RH',   icon: '🔍', cor: '#0891b2' },
    colab:    { label: 'Colaborador',      icon: '👤', cor: '#64748b' },
    juridico: { label: 'Jurídico',         icon: '⚖️', cor: '#b45309' },
  };

  // ─── API PÚBLICA ──────────────────────────────────────────
  function getPermissao(page) {
    const p = perfil();
    const matrix = MATRIX[p] || MATRIX.colab;
    return matrix[page] || false;
  }

  function canView(page) {
    const perm = getPermissao(page);
    return perm !== false;
  }

  function canEdit(page) {
    return getPermissao(page) === 'edit';
  }

  function hasAccess(page) {
    return canView(page);
  }

  function isAdmin()    { return perfil() === 'admin'; }
  function isRH()       { const p = perfil(); return p === 'rh' || p === 'admin'; }
  function isGestor()   { return perfil() === 'gestor'; }
  function isAnalista() { return perfil() === 'analista'; }
  function isColab()    { return perfil() === 'colab'; }

  function getPerfilLabel() { return PERFIL_LABELS[perfil()] || PERFIL_LABELS.colab; }
  function getPerfis()      { return PERFIL_LABELS; }

  /**
   * Filtra o sidebar para mostrar apenas os módulos
   * permitidos para o perfil logado.
   */
  function applySidebar() {
    const p     = perfil();
    const pages = SIDEBAR_PAGES[p] || SIDEBAR_PAGES.colab;

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      const page = item.dataset.page;
      const show = pages.includes(page);
      item.style.display = show ? '' : 'none';
    });

    // Labels de seção: esconde se todos os itens da seção estiverem ocultos
    document.querySelectorAll('.nav-section-label').forEach(label => {
      let next = label.nextElementSibling;
      let temVisivel = false;
      while (next && !next.classList.contains('nav-section-label')) {
        if (next.style.display !== 'none') temVisivel = true;
        next = next.nextElementSibling;
      }
      label.style.display = temVisivel ? '' : 'none';
    });

    // Adiciona badge de perfil no sidebar
    _renderPerfilBadge(p);
  }

  function _renderPerfilBadge(p) {
    const info    = PERFIL_LABELS[p] || PERFIL_LABELS.colab;
    const cargoEl = document.getElementById('sidebar-cargo');
    if (cargoEl && !cargoEl.querySelector('.auth-badge')) {
      const badge = document.createElement('span');
      badge.className = 'auth-badge';
      badge.style.cssText = `
        display:inline-block;margin-top:3px;font-size:9px;font-weight:700;
        letter-spacing:.5px;padding:2px 6px;border-radius:10px;
        background:${info.cor}20;color:${info.cor};border:1px solid ${info.cor}40;
      `;
      badge.textContent = `${info.icon} ${info.label}`;
      cargoEl.insertAdjacentElement('afterend', badge);
    }
  }

  /**
   * Gera texto descritivo do que o perfil pode fazer
   * (usado na tela de cadastro de usuário)
   */
  function getDescricaoPerfil(p) {
    const desc = {
      admin:    'Acesso total ao sistema. Pode criar/editar usuários, configurar integrações e gerenciar todos os módulos.',
      rh:       'Acesso a quase todos os módulos. Pode gerenciar colaboradores, recrutamento, DP, documentos e avaliações.',
      gestor:   'Acesso restrito ao seu setor. Pode gerenciar seu time, criar avaliações, ocorrências e reuniões.',
      analista: 'Perfil operacional de RH. Pode editar admissões, recrutamento, documentos e acompanhar clima.',
      colab:    'Acesso apenas aos próprios dados: jornada, serviços, comunicados e pesquisas de clima.',
      juridico: 'Acesso a documentos, ouvidoria e visualização do DP. Perfil de suporte jurídico.',
    };
    return desc[p] || 'Perfil não configurado.';
  }

  /**
   * Verifica se a rota atual é permitida.
   * Redireciona para dashboard se negado.
   */
  function guardRoute(page) {
    if (!canView(page)) {
      console.warn(`[Auth] Acesso negado à página "${page}" para perfil "${perfil()}"`);
      if (typeof navigateTo === 'function') navigateTo('dashboard');
      return false;
    }
    return true;
  }

  return {
    user, perfil, nome, setor,
    canView, canEdit, hasAccess, getPermissao,
    isAdmin, isRH, isGestor, isAnalista, isColab,
    getPerfilLabel, getPerfis, getDescricaoPerfil,
    applySidebar, guardRoute,
    SIDEBAR_PAGES, MATRIX, PERFIL_LABELS,
  };
})();

// Disponível globalmente
window.Auth = Auth;
