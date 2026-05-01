// =============================================
// BITRIXSERVICE.JS — Integração centralizada
// Único ponto de contato com o Bitrix24
// =============================================

const BitrixService = (() => {

  function _webhook() {
    const url = AppConfig?.bitrix?.webhookUrl;
    if (!url) throw new Error('Webhook Bitrix24 não configurado em AppConfig.bitrix.webhookUrl');
    return url.replace(/\/$/, '');
  }

  async function _post(metodo, params = {}) {
    const url = `${_webhook()}/${metodo}.json`;
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Bitrix24 retornou HTTP ${res.status} em "${metodo}"`);
    const json = await res.json();
    if (json.error) throw new Error(`Bitrix24 erro: ${json.error_description || json.error}`);
    return json.result;
  }

  // ── TAREFAS ──────────────────────────────────
  async function criarTarefa({ titulo, descricao, responsavelId, prazo, grupoId } = {}) {
    if (!titulo) throw new Error('Título da tarefa é obrigatório');
    return _post('tasks.task.add', {
      fields: {
        TITLE:          titulo,
        DESCRIPTION:    descricao || '',
        RESPONSIBLE_ID: responsavelId || AppConfig?.bitrix?.responsavelId || 1,
        DEADLINE:       prazo || null,
        GROUP_ID:       grupoId || AppConfig?.bitrix?.grupoId || null,
        ALLOW_CHANGE_DEADLINE: 'Y',
        TASK_CONTROL:   'Y',
      },
    });
  }

  async function listarTarefas(filtro = {}) {
    return _post('tasks.task.list', { filter: filtro, select: ['ID', 'TITLE', 'STATUS', 'DEADLINE', 'RESPONSIBLE_ID'] });
  }

  async function deletarTarefa(tarefaId) {
    if (!tarefaId) throw new Error('ID da tarefa é obrigatório');
    return _post('tasks.task.delete', { taskId: tarefaId });
  }

  // ── MODO DEMO (sem webhook configurado) ──────
  function _demoCriarTarefa(titulo, descricao, bitrixUrl) {
    const texto = `${titulo}\n\n${descricao}`;
    DOM.copiar(texto);
    const url = bitrixUrl || AppConfig?.bitrix?.portalUrl || 'https://bitrix24.com';
    Toast.info(`Tarefa copiada para a área de transferência.<br><small>Cole no Bitrix24: <a href="${url}" target="_blank" style="color:#fff;text-decoration:underline">Abrir Bitrix24 ↗</a></small>`, 6000);
  }

  // ── MÉTODO PRINCIPAL (detecta modo) ──────────
  async function enviarTarefa(config) {
    const modoDemo = !AppConfig?.bitrix?.webhookUrl || AppConfig?.features?.modoDemo;
    if (modoDemo) {
      _demoCriarTarefa(config.titulo, config.descricao, AppConfig?.bitrix?.portalUrl);
      return { demo: true, titulo: config.titulo };
    }
    return criarTarefa(config);
  }

  // ── TEMPLATES DE DESCRIÇÃO ────────────────────
  const templates = {
    admissao({ nome, cargo, depto, dataInicio, cpf }) {
      return [
        `📋 ADMISSÃO — ${nome}`,
        '',
        `🧑 Cargo: ${cargo}`,
        `🏢 Departamento: ${depto}`,
        `📅 Início: ${dataInicio}`,
        cpf ? `🪪 CPF: ${Fmt.cpf(cpf)}` : '',
        '',
        '✅ Checklist de admissão:',
        '- [ ] Criar acesso ao sistema',
        '- [ ] Configurar e-mail corporativo',
        '- [ ] Solicitar crachá',
        '- [ ] Cadastrar no Caju',
        '- [ ] Enviar equipamentos',
        '- [ ] Agendar onboarding',
      ].filter(Boolean).join('\n');
    },

    rescisao({ nome, motivo, dataDesligamento, tipo }) {
      return [
        `📋 RESCISÃO — ${nome}`,
        '',
        `📌 Motivo: ${motivo}`,
        `📋 Tipo: ${tipo || 'A definir'}`,
        `📅 Data: ${dataDesligamento}`,
        '',
        '✅ Checklist de rescisão:',
        '- [ ] Revogar todos os acessos',
        '- [ ] Devolver equipamentos',
        '- [ ] Calcular verbas rescisórias',
        '- [ ] Gerar TRCT',
        '- [ ] Agendar exame demissional',
        '- [ ] Cancelar benefícios',
      ].join('\n');
    },

    beneficio({ tipo, nome, data, detalhe }) {
      return [
        `📋 SOLICITAÇÃO — ${tipo.toUpperCase()}`,
        '',
        `👤 Colaborador: ${nome}`,
        `📅 Data: ${data}`,
        detalhe ? `📎 Detalhe: ${detalhe}` : '',
        '',
        '✅ Processar solicitação conforme política de benefícios.',
      ].filter(Boolean).join('\n');
    },

    vagaPreenchida({ titulo, candidato, dataInicio }) {
      return [
        `🎯 VAGA PREENCHIDA — ${titulo}`,
        '',
        `✅ Candidato aprovado: ${candidato}`,
        `📅 Início previsto: ${dataInicio}`,
        '',
        '🔁 Encaminhar para DP — abertura de processo de admissão.',
      ].join('\n');
    },

    ferias({ nome, dataInicio, dataFim, diasVenda }) {
      return [
        `🏖️ FÉRIAS — ${nome}`,
        '',
        `📅 Período: ${dataInicio} a ${dataFim}`,
        diasVenda ? `💰 Dias vendidos: ${diasVenda}` : '',
        '',
        '✅ Processar no sistema de folha.',
      ].filter(Boolean).join('\n');
    },
  };

  return { criarTarefa, listarTarefas, deletarTarefa, enviarTarefa, templates };
})();
