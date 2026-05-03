// =============================================
// HI CONECTA RH — CONFIG.JS
// Configuração central parametrizada
// Substitua os valores antes do deploy
// =============================================

const AppConfig = {

  // ── EMPRESA ──────────────────────────────────
  empresa: {
    nome:       'hi Conecta RH',
    cnpj:       '00.000.000/0001-00',
    cidade:     'João Pessoa',
    uf:         'PB',
    logotipo:   null, // URL do logo
  },

  // ── API BASE (Backend futuro) ─────────────────
  api: {
    baseUrl:    '',          // Ex: 'https://api.hiconectarh.com.br/v1'
    timeout:    10000,       // ms
    token:      '',          // JWT injetado após login real
    version:    'v1',
  },

  // ── BITRIX24 ──────────────────────────────────
  bitrix: {
    portalUrl:     'https://seudominio.bitrix24.com.br', // troque pelo domínio real
    webhookUrl:    '',          // Ex: 'https://seudominio.bitrix24.com.br/rest/1/token/'
    responsavel:   'RH',        // Responsável padrão nas tarefas
    workspace:     'RH Connect',
    autoCreate:    true,        // Cria tarefa automaticamente ao admitir
    // Categorias de tarefa (IDs do Bitrix)
    categorias: {
      admissao:   1,
      rescisao:   2,
      ferias:     3,
      documento:  4,
      financeiro: 5,
    },
  },

  // ── SISTEMAS INTEGRADOS ───────────────────────
  sistemas: {
    caju: {
      url:       'https://app.caju.com.br',
      apiUrl:    '',    // endpoint real quando disponível
      ativo:     true,
    },
    rhid: {
      url:       'https://rhid.com.br',
      apiUrl:    '',
      ativo:     true,
    },
    rhsolutio: {
      url:       'https://rhsolutio.com.br',
      apiUrl:    '',
      ativo:     true,
    },
    wellhub: {
      url:       'https://wellhub.com',
      apiUrl:    '',
      ativo:     true,
    },
    sulamerica: {
      url:       'https://sulamerica.com.br',
      apiUrl:    '',
      ativo:     true,
    },
    conexaoSaude: {
      url:       'https://conexasaude.com.br',
      apiUrl:    '',
      ativo:     true,
    },
    nubus: {
      url:       'https://nubus.com.br',
      apiUrl:    '',
      ativo:     true,
    },
  },

  // ── SLAs (em horas) ───────────────────────────
  sla: {
    denuncia:    48,
    reclamacao:  72,
    solicitacao: 120,
    sugestao:    120,
    elogio:      120,
    // Serviços RH
    ferias:      72,
    documento:   48,
    financeiro:  24,
    beneficio:   48,
  },

  // ── BENEFÍCIOS — VALORES PADRÃO ───────────────
  beneficios: {
    alimentacao: { valor: 550,  recarga: 'Todo dia 1º', ativo: true  },
    mobilidade:  { valor: 200,  recarga: 'Todo dia 1º', ativo: true  },
    lavanderia:  { valor: 80,   recarga: 'Mensal',      ativo: true  },
    vt:          { valor: 0,    recarga: 'Automático',  ativo: false },
    saude:       { operadora: 'SulAmérica', ativo: true              },
    odonto:      { operadora: 'SulAmérica', ativo: true              },
    fitness:     { plano: 'Silver',         ativo: true              },
  },

  // ── FAIXAS SALARIAIS ──────────────────────────
  faixas: {
    operacional: { min: 1320,  max: 2500  },
    administrativo: { min: 2000, max: 5000 },
    tecnico:    { min: 3000,  max: 8000  },
    lideranca:  { min: 5000,  max: 15000 },
    direcao:    { min: 10000, max: 35000 },
  },

  // ── JORNADA DE TRABALHO ───────────────────────
  jornada: {
    horasDiarias:   8,
    diasSemanais:   5,
    toleranciaMin:  10,
    bancoHoras:     true,
    horaExtraPerc:  50,
  },

  // ── FÉRIAS ────────────────────────────────────
  ferias: {
    diasPorAno:        30,
    maximoPeriodos:    3,
    avisoPreviosDias:  30,
    ventoAlerta:       30, // dias antes do vencimento para alertar
  },

  // ── FOLHA ─────────────────────────────────────
  folha: {
    diaFechamento:    20,
    diaPagamento:     5,  // do mês seguinte
    competenciaAtual: 'Maio/2025',
  },

  // ── FEATURE FLAGS ─────────────────────────────
  features: {
    bitrixIntegrado:     false, // true quando webhook estiver configurado
    emailNotificacoes:   false,
    pushNotificacoes:    false,
    exportacaoPdf:       true,
    modoDemo:            true,  // false em produção
  },

  // ── AUTENTICAÇÃO ──────────────────────────────
  auth: {
    sessionKey:    'hiRH_user',
    loginUrl:      'login.html',
    tokenExpMin:   480, // 8 horas
  },
};

// Helper: retorna URL do Bitrix com trailing-slash normalizado
function getBitrixUrl(path) {
  const base = (AppConfig.bitrix.portalUrl || '').replace(/\/$/, '');
  const suffix = path ? '/' + String(path).replace(/^\//, '') : '';
  return base + suffix;
}

// Helper: retorna URL da API interna — corrige duplas barras
function getApiUrl(endpoint) {
  const base    = (AppConfig.api.baseUrl   || '').replace(/\/$/, '');
  const version = (AppConfig.api.version   || 'v1').replace(/^\//, '');
  const ep      = (endpoint               || '').replace(/^\//, '');
  if (!base) return `/${version}/${ep}`;      // sem baseUrl configurada → relativo
  return `${base}/${version}/${ep}`;
}

// Helper: URL completa verificando protocolo HTTPS em produção
function getApiUrlSafe(endpoint) {
  const url = getApiUrl(endpoint);
  if (url.startsWith('http:') && !location.hostname.match(/localhost|127\.0\.0\.1/)) {
    console.warn('[Config] API usando HTTP em produção. Configure HTTPS.');
  }
  return url;
}

// Helper: SLA em horas → label legível
function getSlaLabel(tipo) {
  const h = AppConfig.sla[tipo] || 120;
  if (typeof h !== 'number' || h <= 0) return '—';
  return h < 24 ? `${h}h` : `${h / 24}d úteis`;
}

// Helper: verifica se uma feature flag está ativa
function featureAtiva(flag) {
  return Boolean(AppConfig.features?.[flag]);
}

// Helper: nome da empresa ou fallback
function nomeEmpresa() {
  return AppConfig.empresa?.nome || 'hi Conecta RH';
}
