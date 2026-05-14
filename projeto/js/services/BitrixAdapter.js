/**
 * BitrixAdapter.js — Adaptador Bitrix24 desacoplado
 * Arquitetura pronta para o time de TI conectar.
 * Mock completo + interface real quando webhookUrl configurado.
 */

const BitrixAdapter = (() => {
  'use strict';

  // ── Configuração ──────────────────────────
  const getConfig = () => ({
    baseUrl:     AppConfig?.bitrix?.portalUrl    || '',
    webhookUrl:  AppConfig?.bitrix?.webhookUrl   || '',
    responsavel: AppConfig?.bitrix?.responsavel  || 'RH',
    workspace:   AppConfig?.bitrix?.workspace    || 'RH Connect',
    autoCreate:  AppConfig?.bitrix?.autoCreate   ?? false,
  });

  const isMock = () => !getConfig().webhookUrl;

  // ── Log de sincronização ──────────────────
  const _log = [];
  const addLog = (acao, status, detalhes) => {
    const entry = { acao, status, detalhes, em: new Date().toISOString() };
    _log.unshift(entry);
    if (_log.length > 200) _log.splice(200);
    return entry;
  };

  // ── Chamada HTTP real ─────────────────────
  const _call = async (method, params = {}) => {
    const cfg = getConfig();
    if (!cfg.webhookUrl) throw new Error('Webhook Bitrix24 não configurado.');

    const url = `${cfg.webhookUrl}${method}.json`;

    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
      signal:  AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Bitrix24 HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`Bitrix24 API: ${json.error_description || json.error}`);
    return json.result;
  };

  // ── Templates de tarefa ───────────────────
  const TEMPLATES = {
    admissao: ({ colab, depto }) => ({
      TITLE: `🟢 Nova Admissão: ${colab}`,
      DESCRIPTION: `Colaborador ${colab} admitido no depto. ${depto}.\n\nPendências:\n• Criar e-mail corporativo\n• Liberar acessos aos sistemas\n• Preparar estação de trabalho`,
      DEADLINE: _addDias(new Date(), 3).toISOString(),
      PRIORITY: '1',
    }),
    ferias: ({ colab, inicio, fim }) => ({
      TITLE: `🏖️ Férias Aprovadas: ${colab}`,
      DESCRIPTION: `Férias de ${colab}\nPeríodo: ${inicio} a ${fim}`,
      DEADLINE: new Date(inicio).toISOString(),
      PRIORITY: '0',
    }),
    rescisao: ({ colab, tipo, data }) => ({
      TITLE: `⚠️ Rescisão: ${colab}`,
      DESCRIPTION: `Tipo: ${tipo}\nData: ${data}\n\nChecklist:\n• TRCT\n• Homologação\n• Devolução de equipamentos\n• Revogação de acessos`,
      DEADLINE: new Date(data).toISOString(),
      PRIORITY: '2', // Alta
    }),
    documento: ({ titulo, colaborador, vence }) => ({
      TITLE: `📄 Doc. Pendente: ${titulo}`,
      DESCRIPTION: `Documento "${titulo}" de ${colaborador} aguarda assinatura. Vence em: ${vence}`,
      DEADLINE: new Date(vence).toISOString(),
      PRIORITY: '1',
    }),
    treinamento: ({ colab, treinamento, prazo }) => ({
      TITLE: `🎓 Treinamento Pendente: ${colab}`,
      DESCRIPTION: `${colab} deve concluir "${treinamento}" até ${prazo}.`,
      DEADLINE: new Date(prazo).toISOString(),
      PRIORITY: '0',
    }),
  };

  // ── API pública ───────────────────────────

  /** Cria tarefa no Bitrix24 */
  const criarTarefa = async (tipo, params) => {
    const template = TEMPLATES[tipo];
    if (!template) throw new Error(`Template "${tipo}" não encontrado.`);

    const taskData = template(params);

    if (isMock()) {
      const resultado = { id: `MOCK-${Date.now()}`, ...taskData };
      addLog('criarTarefa', 'mock', { tipo, task: taskData });

      // Copia para clipboard em modo demo
      const texto = `[Bitrix24 Mock]\n${taskData.TITLE}\n${taskData.DESCRIPTION}`;
      navigator.clipboard?.writeText(texto).catch(() => {});

      if (window.Toast) Toast.info(`💬 Bitrix24 (modo demo): "${taskData.TITLE}" copiado.`);
      return resultado;
    }

    try {
      const resultado = await _call('tasks.task.add', { fields: taskData });
      addLog('criarTarefa', 'sucesso', { tipo, task_id: resultado.task?.id });
      return resultado;
    } catch (err) {
      addLog('criarTarefa', 'erro', { tipo, erro: err.message });
      throw err;
    }
  };

  /** Lista tarefas do grupo RH */
  const listarTarefas = async (filtros = {}) => {
    if (isMock()) {
      return [
        { id: 'M1', title: '🟢 Nova Admissão: João Silva', status: '2', deadline: _addDias(new Date(),2).toISOString() },
        { id: 'M2', title: '⚠️ Rescisão: Maria Oliveira',  status: '2', deadline: _addDias(new Date(),5).toISOString() },
        { id: 'M3', title: '📄 Contrato pendente assinatura', status: '3', deadline: null },
      ];
    }

    return _call('tasks.task.list', {
      filter: { CREATED_BY: '', GROUP_ID: '', ...filtros },
      select: ['ID','TITLE','STATUS','DEADLINE','CREATED_DATE'],
    });
  };

  /** Status da integração */
  const getStatus = () => ({
    configurado:  !isMock(),
    mock:          isMock(),
    webhook_url:  isMock() ? '(não configurado)' : '***configurado***',
    logs_count:   _log.length,
    ultima_sync:  _log[0]?.em || null,
    logs:         _log.slice(0, 20),
  });

  // ── Helpers internos ──────────────────────
  const _addDias = (data, dias) => new Date(data.getTime() + dias * 86400000);

  return { criarTarefa, listarTarefas, getStatus, TEMPLATES, isMock };
})();

window.BitrixAdapter = BitrixAdapter;

// Compatibilidade com BitrixService.js existente
if (window.BitrixService) {
  const _orig = window.BitrixService.enviarTarefa;
  window.BitrixService.enviarTarefa = async (dados) => {
    if (dados.tipo) return BitrixAdapter.criarTarefa(dados.tipo, dados);
    return _orig(dados);
  };
}
