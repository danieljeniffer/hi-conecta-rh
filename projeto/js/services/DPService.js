/**
 * DPService — cliente HTTP para a API do Departamento Pessoal
 * Conecta o frontend vanilla JS ao backend Node.js/Express
 */
const DPService = (() => {
  const BASE = 'http://localhost:3001/api/v1';

  const getToken = () => sessionStorage.getItem('dp_token');

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  });

  const req = async (method, path, body = null) => {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    let resp;
    try {
      resp = await fetch(`${BASE}${path}`, opts);
    } catch (netErr) {
      throw new Error(`Backend offline: verifique se o servidor DP está rodando (porta 3001). ${netErr.message}`);
    }
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.erro || `Erro ${resp.status}`);
    return data;
  };

  const get = (path) => req('GET', path);
  const post = (path, body) => req('POST', path, body);
  const put = (path, body) => req('PUT', path, body);
  const patch = (path, body) => req('PATCH', path, body);
  const del = (path) => req('DELETE', path);

  return {
    // Auth
    login: (email, senha) => post('/auth/login', { email, senha }),

    // Dashboard
    dashboard: () => get('/dashboard/resumo'),
    custoEmpresa: () => get('/dashboard/custo-empresa'),
    turnover: () => get('/dashboard/turnover'),

    // Colaboradores
    listarColaboradores: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/colaboradores${q ? '?' + q : ''}`);
    },
    buscarColaborador: (id) => get(`/colaboradores/${id}`),
    criarColaborador: (dados) => post('/colaboradores', dados),
    atualizarColaborador: (id, dados) => put(`/colaboradores/${id}`, dados),
    atualizarSalario: (id, dados) => patch(`/colaboradores/${id}/salario`, dados),
    historicoSalarial: (id) => get(`/colaboradores/${id}/historico-salarial`),

    // Admissão
    listarAdmissoes: () => get('/admissoes'),
    registrarAdmissao: (dados) => post('/admissoes', dados),
    enviarS2200: (admissaoId) => post(`/admissoes/${admissaoId}/esocial`),

    // Folha
    abrirPeriodo: (dados) => post('/folha/periodos', dados),
    listarFolhaPeriodo: (periodoId) => get(`/folha/periodos/${periodoId}`),
    calcularFolhaCompleta: (periodoId) => post(`/folha/periodos/${periodoId}/calcular`),
    calcularFolhaColaborador: (periodoId, colaboradorId, dados) =>
      post(`/folha/periodos/${periodoId}/colaboradores/${colaboradorId}`, dados),
    fecharPeriodo: (periodoId) => post(`/folha/periodos/${periodoId}/fechar`),

    // Férias
    listarFerias: (colaboradorId) => get(`/ferias/colaborador/${colaboradorId}`),
    calcularFerias: (dados) => post('/ferias/calcular', dados),
    agendarFerias: (dados) => post('/ferias/agendar', dados),
    sincronizarPeriodosAquisitivos: (colaboradorId) =>
      post(`/ferias/colaborador/${colaboradorId}/sincronizar`),

    // 13º
    calcular13: (colaboradorId, ano) =>
      get(`/decimo-terceiro/calcular?colaborador_id=${colaboradorId}&ano=${ano}`),
    calcular13Todos: (ano) => get(`/decimo-terceiro/calcular-todos?ano=${ano}`),
    registrar13: (dados) => post('/decimo-terceiro/registrar', dados),

    // Rescisão
    simularRescisao: (dados) => post('/rescisoes/calcular', dados),
    registrarRescisao: (dados) => post('/rescisoes', dados),
    buscarRescisao: (id) => get(`/rescisoes/${id}`),
    enviarS2299: (id) => post(`/rescisoes/${id}/esocial`),

    // Benefícios
    catalogoBeneficios: () => get('/beneficios/catalogo'),
    beneficiosColaborador: (id) => get(`/beneficios/colaborador/${id}`),
    atribuirBeneficio: (dados) => post('/beneficios/atribuir', dados),
    removerBeneficio: (id) => del(`/beneficios/${id}`),
    relatorioBeneficios: () => get('/beneficios/relatorio'),

    // Notificações
    listarNotificacoes: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/notificacoes${q ? '?' + q : ''}`);
    },
    marcarLida: (id) => patch(`/notificacoes/${id}/ler`),
    arquivarNotif: (id) => patch(`/notificacoes/${id}/arquivar`),
    registrarFalta: (dados) => post('/notificacoes/falta', dados),

    // Aux
    listarDepartamentos: () => get('/departamentos'),
    listarCargos: (deptId) => get(`/cargos${deptId ? '?departamento_id=' + deptId : ''}`),

    // Simulações (sem auth)
    simularINSS: (salario) => post('/simular/inss', { salario }),
    simularIRRF: (salario, inss, dependentes) => post('/simular/irrf', { salario, inss, dependentes }),
    simularRescisaoRapida: (dados) => post('/simular/rescisao', dados),
  };
})();

window.DPService = DPService;
