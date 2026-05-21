/**
 * modules.js — Configuração Central de Módulos
 * hi Conecta RH · Fonte Única de Verdade para toda a hierarquia
 *
 * Cada setor define:
 *   id         → chave interna do setor
 *   label      → nome exibido no sidebar
 *   icon       → emoji/ícone do setor
 *   color      → cor de destaque (CSS var ou hex)
 *   perfis     → quais perfis veem este setor
 *   modulos    → lista de submódulos
 *
 * Cada módulo define:
 *   id         → pageKey usado no Router/app.js
 *   label      → nome no menu
 *   icon       → ícone
 *   perfis     → perfis com acesso (herda do setor se omitido)
 *   badge      → texto do badge opcional ('novo','beta','em breve')
 *   external   → URL externa (abre nova aba)
 *   divider    → insere separador acima deste item
 */

window.MODULES_CONFIG = [

  // ══════════════════════════════════════════════════════════════
  // DEPARTAMENTO PESSOAL
  // ══════════════════════════════════════════════════════════════
  {
    id:     'dp',
    label:  'Departamento Pessoal',
    icon:   '🏛️',
    color:  'var(--dp-color, #6366f1)',
    perfis: ['admin','rh','analista','juridico'],
    modulos: [
      { id: 'dpdashboard',    label: 'Dashboard DP',         icon: '📊', perfis: ['admin','rh','analista'] },
      { id: 'dpc',            label: 'Central Trabalhista',  icon: '⚡', perfis: ['admin','rh','analista'] },
      { id: 'dp-massa',       label: 'Cálculo em Massa',     icon: '⚙️', perfis: ['admin','rh'] },
      { divider: true },
      { id: 'departamento',   label: 'Folha & Admissão',     icon: '📋', perfis: ['admin','rh','analista'] },
      { id: 'documentos',     label: 'Documentos',           icon: '📄', perfis: ['admin','rh','analista','juridico'] },
      { id: 'nr01',           label: 'NR-01 · Segurança',    icon: '⚖️', perfis: ['admin','rh','analista','juridico'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // RECURSOS HUMANOS
  // ══════════════════════════════════════════════════════════════
  {
    id:     'rh',
    label:  'Recursos Humanos',
    icon:   '👥',
    color:  'var(--rh-color, #10b981)',
    perfis: ['admin','rh','analista','gestor'],
    modulos: [
      { id: 'pessoas',        label: 'Gestão de Pessoas',    icon: '👤', perfis: ['admin','rh','analista','gestor'] },
      { id: 'cargos',         label: 'Cargos & Estrutura',   icon: '🏗️', perfis: ['admin','rh','analista'] },
      { divider: true },
      { id: 'recrutamento',   label: 'Recrutamento & Seleção',icon: '🔍', perfis: ['admin','rh','analista'] },
      { id: 'ats',            label: 'Portal de Vagas (ATS)', icon: '🌐', perfis: ['admin','rh','analista'], external: '/carreiras.html', badge: 'novo' },
      { divider: true },
      { id: 'jornada',        label: 'Onboarding',           icon: '🚀', perfis: ['admin','rh','analista'] },
      { id: 'desenvolvimento', label: 'T&D · Treinamentos',  icon: '🎓', perfis: ['admin','rh','analista','gestor'] },
      { id: 'clima',          label: 'Pesquisa de Clima',    icon: '😊', perfis: ['admin','rh','analista','gestor'] },
      { id: 'bonificacoes',   label: 'Avaliações & Bônus',   icon: '🎯', perfis: ['admin','rh','analista'] },
      { divider: true },
      { id: 'comunicacao',    label: 'Comunicação Interna',  icon: '📣', perfis: ['admin','rh','analista','gestor'] },
      { id: 'ouvidoria',      label: 'Canal de Denúncias',   icon: '📢', perfis: ['admin','rh','juridico'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // INTELIGÊNCIA CORPORATIVA (Sistema Nervoso)
  // ══════════════════════════════════════════════════════════════
  {
    id:     'inteligencia',
    label:  'Inteligência Corporativa',
    icon:   '🧠',
    color:  '#8b5cf6',
    perfis: ['admin','rh','gestor'],
    modulos: [
      { id: 'inteligencia-central', label: 'Sistema Nervoso',       icon: '⚡', perfis: ['admin','rh'],         badge: 'ia'  },
      { id: 'organograma-vivo',     label: 'Organograma Vivo',      icon: '🕸️', perfis: ['admin','rh','gestor'], badge: 'novo'},
      { id: 'health-score',         label: 'Health Score 360°',     icon: '❤️', perfis: ['admin','rh'],          badge: 'ia'  },
      { id: 'copiloto-ia',          label: 'Copiloto IA Gestor',    icon: '🤖', perfis: ['admin','rh','gestor'], badge: 'ia'  },
      { divider: true },
      { id: 'analytics',            label: 'People Analytics',      icon: '📊', perfis: ['admin','rh','gestor'] },
      { id: 'timeline',             label: 'Timeline Colaborador',  icon: '⏱️', perfis: ['admin','rh','gestor'] },
      { id: 'automacao',            label: 'Automation Engine',     icon: '⚙️', perfis: ['admin','rh'],         badge: 'ia'  },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // GESTÃO DE EQUIPES
  // ══════════════════════════════════════════════════════════════
  {
    id:     'gestao',
    label:  'Gestão de Equipes',
    icon:   '📈',
    color:  'var(--gestao-color, #f59e0b)',
    perfis: ['admin','rh','gestor'],
    modulos: [
      { id: 'gestor',         label: 'Hub do Gestor',        icon: '🎯', perfis: ['admin','rh','gestor'] },
      { id: 'indicadores',    label: 'Indicadores',          icon: '📊', perfis: ['admin','rh','gestor'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // PORTAL DO COLABORADOR
  // ══════════════════════════════════════════════════════════════
  {
    id:     'colaborador',
    label:  'Meu Espaço',
    icon:   '🏠',
    color:  'var(--colab-color, #06b6d4)',
    perfis: ['admin','rh','gestor','analista','colab','juridico'],
    modulos: [
      { id: 'portal',         label: 'Meu Painel',           icon: '🏠', perfis: ['admin','rh','gestor','analista','colab','juridico'] },
      { id: 'servicos',       label: 'Solicitações',         icon: '🛠️', perfis: ['admin','rh','gestor','analista','colab'] },
      { id: 'experiencia',    label: 'Benefícios & Extras',  icon: '✨', perfis: ['admin','rh','analista','colab'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // COMUNICAÇÃO & CULTURA
  // ══════════════════════════════════════════════════════════════
  {
    id:     'cultura',
    label:  'Comunicação & Cultura',
    icon:   '📺',
    color:  'var(--cultura-color, #ec4899)',
    perfis: ['admin','rh'],
    modulos: [
      { id: 'endomarketing',  label: 'Endomarketing.tv',     icon: '📺', perfis: ['admin','rh'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ADMINISTRAÇÃO DO SISTEMA
  // ══════════════════════════════════════════════════════════════
  {
    id:     'admin',
    label:  'Administração',
    icon:   '⚙️',
    color:  'var(--admin-color, #94a3b8)',
    perfis: ['admin'],
    modulos: [
      { id: 'usuarios',       label: 'Usuários & Permissões', icon: '🔐', perfis: ['admin'] },
      { id: 'integracoes',    label: 'Integrações & APIs',    icon: '🔌', perfis: ['admin'] },
    ],
  },

];

/**
 * Matriz de permissões hierárquica — mapeada sobre os IDs acima.
 * 'edit' | 'view' | 'own' | false
 */
window.PERMISSION_MATRIX = {
  admin: {
    // Acesso total — todos os módulos
    '*': 'edit',
    // Explícito para segurança adicional
    dp: 'edit', rh: 'edit', gestao: 'edit', colaborador: 'edit', cultura: 'edit', admin: 'edit',
  },
  rh: {
    dp: 'edit', rh: 'edit', gestao: 'edit', colaborador: 'view', cultura: 'edit', admin: false,
    // Módulos específicos restritos
    _restricoes: { usuarios: false, integracoes: false, 'dp-massa': 'view' },
  },
  gestor: {
    dp: false, rh: 'view', gestao: 'edit', colaborador: 'view', cultura: false, admin: false,
    _restricoes: { pessoas: 'edit', gestor: 'edit', indicadores: 'view', desenvolvimento: 'view', clima: 'view', analytics: 'view', timeline: 'view' },
  },
  analista: {
    dp: 'edit', rh: 'edit', gestao: false, colaborador: 'view', cultura: 'view', admin: false,
    _restricoes: { analytics: false, automacao: false, usuarios: false, integracoes: false },
  },
  colab: {
    dp: false, rh: false, gestao: false, colaborador: 'own', cultura: false, admin: false,
    _restricoes: { portal: 'view', servicos: 'view', experiencia: 'view', comunicacao: 'view', clima: 'view', documentos: 'view', nr01: 'view' },
  },
  juridico: {
    dp: 'view', rh: false, gestao: false, colaborador: false, cultura: false, admin: false,
    _restricoes: { documentos: 'edit', ouvidoria: 'edit', nr01: 'view' },
  },
};

/**
 * Retorna os módulos visíveis para o perfil informado.
 * @param {string} perfil
 * @returns {Array} setores filtrados com módulos permitidos
 */
window.getModulosParaPerfil = function(perfil) {
  const perm = window.PERMISSION_MATRIX[perfil] || window.PERMISSION_MATRIX.colab;

  return window.MODULES_CONFIG
    .filter(setor => setor.perfis.includes(perfil))
    .map(setor => ({
      ...setor,
      modulos: setor.modulos.filter(mod => {
        if (mod.divider) return true; // separadores sempre passam
        const perfs = mod.perfis || setor.perfis;
        return perfs.includes(perfil);
      }),
    }))
    .filter(setor => setor.modulos.filter(m => !m.divider).length > 0);
};
