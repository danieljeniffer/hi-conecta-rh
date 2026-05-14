/**
 * AutomationEngine.js — Motor de Automações Corporativas
 * Gatilhos, condições e ações configuráveis sem código.
 */

const AutomationEngine = (() => {
  'use strict';

  const KEY = 'hiRH_automations_v1';

  // ── Gatilhos disponíveis ─────────────────
  const GATILHOS = [
    { id: 'admissao',           label: '👤 Colaborador admitido',        categoria: 'rh' },
    { id: 'desligamento',       label: '👋 Colaborador desligado',        categoria: 'rh' },
    { id: 'ferias_vencendo',    label: '🏖️ Férias vencendo (30 dias)',    categoria: 'ferias' },
    { id: 'aniversario',        label: '🎂 Aniversário do colaborador',   categoria: 'pessoal' },
    { id: 'avaliacao_pendente', label: '📋 Avaliação de experiência',     categoria: 'desempenho' },
    { id: 'documento_vencendo', label: '📄 Documento vencendo',           categoria: 'documentos' },
    { id: 'treinamento_pendente',label:'🎓 Treinamento obrigatório pendente',categoria:'treinamento'},
    { id: 'folha_fechada',      label: '💰 Folha de pagamento aprovada',  categoria: 'financeiro' },
    { id: 'solicitacao_aprovada',label:'✅ Solicitação aprovada no workflow',categoria:'workflow' },
    { id: 'score_risco_alto',   label: '⚠️ Score de risco de saída >70%', categoria: 'analytics' },
  ];

  // ── Ações disponíveis ───────────────────
  const ACOES = [
    { id: 'notificacao_inapp',  label: '🔔 Enviar notificação interna',   tipo: 'notificacao' },
    { id: 'email',              label: '📧 Enviar e-mail',                 tipo: 'comunicacao' },
    { id: 'whatsapp',           label: '💬 Enviar WhatsApp',               tipo: 'comunicacao' },
    { id: 'criar_tarefa',       label: '📌 Criar tarefa no sistema',       tipo: 'produtividade' },
    { id: 'criar_workflow',     label: '🔄 Iniciar workflow de aprovação', tipo: 'workflow' },
    { id: 'onboarding_task',    label: '✅ Criar task de onboarding',      tipo: 'rh' },
    { id: 'feed_post',          label: '📢 Publicar no feed corporativo',  tipo: 'comunicacao' },
    { id: 'webhook',            label: '🔗 Chamar webhook externo',        tipo: 'integracao' },
    { id: 'bitrix_tarefa',      label: '🟦 Criar tarefa no Bitrix24',      tipo: 'integracao' },
  ];

  // ── Automações padrão ────────────────────
  const _defaults = () => [
    {
      id:      'auto-001',
      nome:    'Boas-vindas automáticas na admissão',
      gatilho: 'admissao',
      ativo:   true,
      acoes: [
        { id: 'notificacao_inapp', params: { titulo: 'Bem-vindo(a)! 🎉', mensagem: 'Sua jornada de integração começa agora. Acesse o Portal do Colaborador.' } },
        { id: 'feed_post',        params: { mensagem: '🎉 Seja bem-vindo(a), {{nome}}! Felizes em tê-lo(a) no time!' } },
      ],
      executacoes: 12, ultima_execucao: '2025-05-20T08:00:00Z',
    },
    {
      id:      'auto-002',
      nome:    'Alerta de férias vencendo',
      gatilho: 'ferias_vencendo',
      ativo:   true,
      acoes: [
        { id: 'notificacao_inapp', params: { titulo: '🏖️ Suas férias estão vencendo', mensagem: 'Você tem {{dias_restantes}} dias para agendar suas férias.' } },
        { id: 'email',            params: { assunto: 'Férias vencendo em breve', template: 'ferias_vencendo' } },
        { id: 'criar_tarefa',     params: { titulo: 'Aprovar férias de {{nome}}', responsavel: 'gestor', prazo: 7 } },
      ],
      executacoes: 8, ultima_execucao: '2025-05-18T09:00:00Z',
    },
    {
      id:      'auto-003',
      nome:    'Notificação de holerite disponível',
      gatilho: 'folha_fechada',
      ativo:   true,
      acoes: [
        { id: 'notificacao_inapp', params: { titulo: '💰 Holerite disponível', mensagem: 'Seu contracheque de {{competencia}} foi liberado.' } },
        { id: 'email',            params: { assunto: 'Holerite {{competencia}} disponível', template: 'holerite_disponivel' } },
      ],
      executacoes: 3, ultima_execucao: '2025-05-05T07:30:00Z',
    },
    {
      id:      'auto-004',
      nome:    'Parabéns automático no aniversário',
      gatilho: 'aniversario',
      ativo:   true,
      acoes: [
        { id: 'feed_post', params: { mensagem: '🎂 Hoje é o aniversário de {{nome}}! Toda a equipe deseja um ótimo dia!' } },
        { id: 'notificacao_inapp', params: { titulo: '🎉 Parabéns!', mensagem: 'A equipe hi Conecta RH deseja um excelente aniversário!' } },
      ],
      executacoes: 24, ultima_execucao: '2025-05-26T08:00:00Z',
    },
    {
      id:      'auto-005',
      nome:    'Alerta de risco de desligamento',
      gatilho: 'score_risco_alto',
      ativo:   false,
      acoes: [
        { id: 'criar_tarefa',  params: { titulo: 'Plano de retenção: {{nome}}', responsavel: 'rh', prazo: 3 } },
        { id: 'bitrix_tarefa', params: { titulo: 'URGENTE: Colaborador em risco de saída — {{nome}}' } },
      ],
      executacoes: 0, ultima_execucao: null,
    },
  ];

  // ── DB ────────────────────────────────────
  const get = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : _defaults();
    } catch { return _defaults(); }
  };

  const set = (lista) => {
    try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch {}
  };

  const salvar = (automacao) => {
    const lista = get();
    const idx   = lista.findIndex(a => a.id === automacao.id);
    if (idx >= 0) lista[idx] = automacao;
    else lista.push({ ...automacao, id: 'auto-' + Date.now() });
    set(lista);
    return automacao;
  };

  const toggle = (id) => {
    const lista = get();
    const a     = lista.find(x => x.id === id);
    if (a) { a.ativo = !a.ativo; set(lista); }
    return a?.ativo;
  };

  const remover = (id) => set(get().filter(a => a.id !== id));

  // ── Simular execução ─────────────────────
  const simularExecucao = (automacao) => {
    const gatilho = GATILHOS.find(g => g.id === automacao.gatilho);
    const acoes   = automacao.acoes.map(a => {
      const def = ACOES.find(x => x.id === a.id);
      return `${def?.label || a.id}: ${JSON.stringify(a.params || {})}`;
    });

    return {
      gatilho:   gatilho?.label || automacao.gatilho,
      acoes_desc: acoes,
      simulado_em: new Date().toISOString(),
    };
  };

  // ── Render da tela de automações ──────────
  const render = () => {
    const lista = get();
    const ativos = lista.filter(a => a.ativo).length;

    return `
<div class="auto-root">
  <div class="auto-hero">
    <div class="auto-hero-left">
      <span class="auto-hero-icon">⚡</span>
      <div>
        <h2>Automation Engine</h2>
        <p>Gatilhos e ações automáticas — sem código, sem esforço manual</p>
      </div>
    </div>
    <div class="auto-hero-right">
      <div class="auto-stat">${ativos}<small>ativos</small></div>
      <div class="auto-stat">${lista.reduce((s,a)=>s+a.executacoes,0)}<small>execuções</small></div>
      <button class="auto-btn-new" onclick="autoNovaAutomacao()">+ Nova Automação</button>
    </div>
  </div>

  <!-- Lista de automações -->
  <div class="auto-lista" id="auto-lista">
    ${lista.map(a => _renderCard(a)).join('')}
  </div>

  <!-- Gatilhos disponíveis -->
  <div class="auto-card" style="margin-top:4px">
    <div class="auto-card-hd"><h4>🔗 Gatilhos Disponíveis</h4></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${GATILHOS.map(g=>`<span style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600">${g.label}</span>`).join('')}
    </div>
  </div>
</div>`;
  };

  const _renderCard = (a) => {
    const gatilho = GATILHOS.find(g => g.id === a.gatilho);
    const ultima  = a.ultima_execucao ? new Date(a.ultima_execucao).toLocaleDateString('pt-BR') : 'Nunca';

    return `
<div class="auto-card ${a.ativo ? '' : 'auto-card-inativo'}" id="auto-${a.id}">
  <div class="auto-card-hd">
    <div class="auto-card-left">
      <div class="auto-toggle ${a.ativo ? 'ativo' : ''}" onclick="autoToggle('${a.id}',this)" title="${a.ativo?'Desativar':'Ativar'}">
        <div class="auto-toggle-ball"></div>
      </div>
      <div>
        <div class="auto-card-nome">${a.nome}</div>
        <div class="auto-card-gatilho">Gatilho: ${gatilho?.label || a.gatilho}</div>
      </div>
    </div>
    <div class="auto-card-right">
      <span class="auto-exec-count">${a.executacoes} exec.</span>
      <span class="auto-ultima">Última: ${ultima}</span>
      <button class="auto-btn-edit" onclick="autoEditar('${a.id}')">✏️</button>
      <button class="auto-btn-sim"  onclick="autoSimular('${a.id}')">▶ Simular</button>
      <button class="auto-btn-del"  onclick="autoRemover('${a.id}')">🗑️</button>
    </div>
  </div>
  <div class="auto-acoes-list">
    ${a.acoes.map(ac => {
      const def = ACOES.find(x => x.id === ac.id);
      return `<span class="auto-acao-chip">${def?.label || ac.id}</span>`;
    }).join('')}
  </div>
</div>`;
  };

  // ── Handlers globais ─────────────────────
  window.autoToggle = (id, el) => {
    const ativo = toggle(id);
    const card  = document.getElementById(`auto-${id}`);
    if (card) card.classList.toggle('auto-card-inativo', !ativo);
    if (el)  el.classList.toggle('ativo', ativo);
    if (window.Toast) Toast.success(`Automação ${ativo ? 'ativada' : 'desativada'}.`);
  };

  window.autoRemover = (id) => {
    if (!confirm('Remover esta automação?')) return;
    remover(id);
    document.getElementById(`auto-${id}`)?.remove();
    if (window.Toast) Toast.success('Automação removida.');
  };

  window.autoSimular = (id) => {
    const a   = get().find(x => x.id === id);
    if (!a) return;
    const sim = simularExecucao(a);
    alert(`▶ Simulação: "${a.nome}"\n\nGatilho: ${sim.gatilho}\n\nAções:\n${sim.acoes_desc.join('\n')}\n\n✅ Executaria com sucesso.`);
  };

  window.autoEditar = (id) => {
    if (window.Toast) Toast.aviso('Editor avançado em breve. Use a API para configurações complexas.');
  };

  window.autoNovaAutomacao = () => {
    const nome    = prompt('Nome da automação:');
    if (!nome) return;
    const gatilhoOps = GATILHOS.map((g,i)=>`${i+1}. ${g.label}`).join('\n');
    const gatilhoIdx  = parseInt(prompt(`Escolha o gatilho:\n${gatilhoOps}`)) - 1;
    const gatilho     = GATILHOS[gatilhoIdx]?.id;
    if (!gatilho) { alert('Gatilho inválido.'); return; }

    salvar({ nome, gatilho, ativo: true, acoes: [{ id: 'notificacao_inapp', params: { titulo: nome } }], executacoes: 0, ultima_execucao: null });

    const lista = document.getElementById('auto-lista');
    if (lista) lista.innerHTML = get().map(a => _renderCard(a)).join('');
    if (window.Toast) Toast.success('Automação criada!');
  };

  return { get, salvar, toggle, remover, simularExecucao, render, GATILHOS, ACOES };
})();

window.AutomationEngine = AutomationEngine;

function renderAutomacao() { return AutomationEngine.render(); }
function initPage_automacao() {}
