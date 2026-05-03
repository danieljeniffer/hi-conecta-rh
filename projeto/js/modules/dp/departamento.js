// =============================================
// DEPARTAMENTO PESSOAL — unificado (departamento.js + departamento2.js)
// =============================================

// ─────────────────────────────────────────────
// DADOS
// ─────────────────────────────────────────────
const dpData = {
  admissoes: [
    { id:1, nome:'Pedro Henrique', cpf:'123.456.789-00', cargo:'Dev Front-end', setor:'TI', salario:'R$ 4.500,00', dataAdmissao:'01/05/2025', tipoContrato:'CLT', status:'Ativo' },
    { id:2, nome:'Juliana Costa',  cpf:'987.654.321-00', cargo:'Gerente Comercial', setor:'Comercial', salario:'R$ 7.000,00', dataAdmissao:'15/04/2025', tipoContrato:'CLT', status:'Ativo' },
  ],
  rescisoes: [
    { id:1, nome:'Rafael Moura', cpf:'111.222.333-00', cargo:'Vendedor', setor:'Comercial', dataAdmissao:'01/01/2024', dataRescisao:'30/04/2025', tipoRescisao:'Pedido de Demissão', status:'Concluída' },
  ],
  tarefasBitrix: [],
};

const bitrixCategorias = [
  { id:'alimentacao',   label:'🍽️ Alimentação Proporcional' },
  { id:'bonificacao',   label:'🏆 Bonificação'              },
  { id:'mobilidade',    label:'🚌 Mobilidade (Caju/VT)'     },
  { id:'portabilidade', label:'💳 Portabilidade de Salário'  },
  { id:'rescisao',      label:'📋 Acerto Rescisório'         },
  { id:'adiantamento',  label:'💰 Adiantamento Salarial'    },
  { id:'outro',         label:'📝 Outro'                    },
];

const bitrixPrompts = {
  alimentacao:   (n,d) => `📋 SOLICITAÇÃO — ALIMENTAÇÃO PROPORCIONAL\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSolicito o processamento do benefício de alimentação proporcional.\n\nAtenciosamente,\nEquipe RH`,
  bonificacao:   (n,d) => `📋 SOLICITAÇÃO — BONIFICAÇÃO\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSolicito o processamento de bonificação conforme aprovação da gestão.\n\nAtenciosamente,\nEquipe RH`,
  mobilidade:    (n,d) => `📋 SOLICITAÇÃO — MOBILIDADE\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSolicito ativação/recarga do benefício de mobilidade.\n\nAtenciosamente,\nEquipe RH`,
  portabilidade: (n,d) => `📋 SOLICITAÇÃO — PORTABILIDADE DE SALÁRIO\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSolicito a portabilidade salarial. Dados bancários em anexo.\n\nAtenciosamente,\nEquipe RH`,
  rescisao:      (n,d) => `📋 SOLICITAÇÃO — ACERTO RESCISÓRIO\n\nColaborador: ${n}\nData rescisão: ${d}\n\nPrezado Financeiro,\n\nSolicito o processamento do acerto rescisório.\n\nAtenciosamente,\nEquipe RH`,
  adiantamento:  (n,d) => `📋 SOLICITAÇÃO — ADIANTAMENTO SALARIAL\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSolicito adiantamento salarial conforme aprovação.\n\nAtenciosamente,\nEquipe RH`,
  outro:         (n,d) => `📋 SOLICITAÇÃO — RH\n\nColaborador: ${n}\nData: ${d}\n\nPrezado Financeiro,\n\nSegue solicitação para análise e providências.\n\nAtenciosamente,\nEquipe RH`,
};

const feriasData = {
  colaboradores: [
    { nome:'João Silva',    depto:'Comercial',  admissao:'01/03/2022', diasVencidos:30, periodoAquisitivo:'01/03/2024 a 01/03/2025', status:'Vencidas',   deFerias:false },
    { nome:'Maria Oliveira',depto:'RH',         admissao:'15/06/2021', diasVencidos:15, periodoAquisitivo:'15/06/2023 a 15/06/2024', status:'Vencendo',   deFerias:false },
    { nome:'Carlos Souza',  depto:'TI',         admissao:'10/01/2023', diasVencidos:0,  periodoAquisitivo:'10/01/2024 a 10/01/2025', status:'A vencer',   deFerias:true  },
    { nome:'Ana Lima',      depto:'Financeiro', admissao:'20/08/2022', diasVencidos:0,  periodoAquisitivo:'20/08/2024 a 20/08/2025', status:'A vencer',   deFerias:false },
    { nome:'Paulo Santos',  depto:'Operações',  admissao:'05/11/2021', diasVencidos:30, periodoAquisitivo:'05/11/2023 a 05/11/2024', status:'Vencidas',   deFerias:false },
  ],
  planoAnual: [],
  solicitacoes: [],
  horasExtras: [
    { colaborador:'João Silva',    horasTrab:176, horasExtras:12, saldoBanco:12  },
    { colaborador:'Maria Oliveira',horasTrab:168, horasExtras:0,  saldoBanco:-4  },
    { colaborador:'Carlos Souza',  horasTrab:184, horasExtras:8,  saldoBanco:20  },
    { colaborador:'Ana Lima',      horasTrab:172, horasExtras:4,  saldoBanco:4   },
    { colaborador:'Paulo Santos',  horasTrab:180, horasExtras:16, saldoBanco:16  },
  ],
};

const arquivosDP = {};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL — integrado ao sistema DP completo
// ─────────────────────────────────────────────
function renderDepartamento() {
  if (window.DPHub) {
    return '<div id="dp-hub-shell" style="min-height:400px;"></div>';
  }

  // Fallback legado se o DPHub não estiver disponível
  const d = RHData;
  const emp = d.empresa;

  const colaboradoresRows = d.colaboradores.map(c => `
    <tr>
      <td>${DOM.sanitize(c.nome)}</td><td>${DOM.sanitize(c.cargo)}</td>
      <td>${Fmt.moeda(c.salario)}</td>
      <td>${Fmt.moeda(c.bonificacoes)}</td>
      <td>${Fmt.moeda(c.descontos)}</td>
      <td>${Fmt.moeda(c.total)}</td>
      <td>${Fmt.badge(c.status)}</td>
    </tr>
  `).join('');

  const movsRows = d.financeiro.ultimasMovimentacoes.map(m => `
    <div class="mov-item">
      <span class="mov-icon ${m.tipo}">●</span>
      <div class="mov-info"><span>${DOM.sanitize(m.descricao)}</span><small>${DOM.sanitize(m.data)}</small></div>
      <strong>${Fmt.moeda(m.valor)}</strong>
    </div>
  `).join('');

  const bonCards = d.bonificacoes.map(b => `
    <div class="bon-card">
      <span class="bon-icon">🏆</span>
      <div>
        <strong>${DOM.sanitize(b.titulo)}</strong>
        <small>${DOM.sanitize(b.periodo)}</small>
        <span>${Fmt.moeda(b.valor)}</span>
      </div>
    </div>
  `).join('');

  return `
  <div class="depto-page">

    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">👥</div>
        <div class="depto-card-info"><strong>${emp.totalColaboradores}</strong><span>Colaboradores ativos</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📋</div>
        <div class="depto-card-info"><strong>${emp.admissoesAndamento}</strong><span>Admissões em andamento</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📝</div>
        <div class="depto-card-info"><strong>${emp.solicitacoesPendentes}</strong><span>Solicitações pendentes</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📅</div>
        <div class="depto-card-info"><strong>${emp.proximoFechamento}</strong><span>Próximo fechamento</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">💰</div>
        <div class="depto-card-info"><strong>${Fmt.moeda(emp.folhaMaio)}</strong><span>Folha maio/2025</span></div>
      </div>
    </div>

    <div class="section-header"><h3>Fluxo Rápido</h3><span class="mes-badge">Atalhos para Bitrix24</span></div>
    <div class="fluxo-rapido">
      <button class="fluxo-btn" onclick="fluxoRapido('passagem')">🚌<span>Cartão de Passagem</span></button>
      <button class="fluxo-btn" onclick="fluxoRapido('alimentacao')">🍽️<span>Cartão Alimentação</span></button>
      <button class="fluxo-btn" onclick="fluxoRapido('exame')">🏥<span>Exame Admissional</span></button>
      <button class="fluxo-btn" onclick="fluxoRapido('documento')">📄<span>Pedir Documentos</span></button>
      <button class="fluxo-btn" onclick="fluxoRapido('lavanderia')">👕<span>Crédito Lavanderia</span></button>
      <button class="fluxo-btn" onclick="fluxoRapido('marketing')">📣<span>Tarefa Marketing</span></button>
      <button class="fluxo-btn mais" onclick="mostrarMaisFluxos()">•••<span>Mais</span></button>
    </div>

    <!-- Modal Fluxo Rápido -->
    <div class="modal-overlay" id="modal-fluxo" style="display:none" onclick="if(event.target.id==='modal-fluxo')this.style.display='none'">
      <div class="modal-box" style="max-width:560px" id="modal-fluxo-content"></div>
    </div>

    <!-- Modal Mais Fluxos -->
    <div class="modal-overlay" id="modal-mais-fluxos" style="display:none" onclick="if(event.target.id==='modal-mais-fluxos')this.style.display='none'">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-header">
          <h3>⚡ Mais Ações Rápidas</h3>
          <button class="modal-close" onclick="document.getElementById('modal-mais-fluxos').style.display='none'">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:8px">
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('adiantamento');document.getElementById('modal-mais-fluxos').style.display='none'">💰<span>Adiantamento Salarial</span></button>
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('portabilidade');document.getElementById('modal-mais-fluxos').style.display='none'">💳<span>Portabilidade Salário</span></button>
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('rescisao_rapida');document.getElementById('modal-mais-fluxos').style.display='none'">📋<span>Acerto Rescisório</span></button>
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('bonificacao');document.getElementById('modal-mais-fluxos').style.display='none'">🏆<span>Bonificação</span></button>
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('uniforme');document.getElementById('modal-mais-fluxos').style.display='none'">👔<span>Uniforme</span></button>
          <button class="fluxo-btn" style="flex-direction:row;gap:8px;padding:12px 16px;justify-content:flex-start" onclick="fluxoRapido('treinamento');document.getElementById('modal-mais-fluxos').style.display='none'">🎓<span>Treinamento</span></button>
        </div>
      </div>
    </div>

    <div class="depto-grid">
      <div class="depto-section">
        <div class="section-header"><h3>Folha de Pagamento</h3><span class="mes-badge">Maio/2025</span></div>
        <div class="table-wrap">
          <table class="depto-table">
            <thead><tr><th>Colaborador</th><th>Cargo</th><th>Salário Bruto</th><th>Bonificações</th><th>Descontos</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>${colaboradoresRows}</tbody>
            <tfoot><tr><td colspan="2"><strong>Total Geral</strong></td><td><strong>R$ 10.600,00</strong></td><td><strong>R$ 1.250,00</strong></td><td><strong>R$ 630,00</strong></td><td><strong>R$ 11.220,00</strong></td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Financeiro</h3><button class="link-btn">Ver todos</button></div>
        <div class="resumo-financeiro">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#e8e8e8" stroke-width="10"/>
            <circle cx="40" cy="40" r="30" fill="none" stroke="#4CAF50" stroke-width="10" stroke-dasharray="101 89" stroke-dashoffset="25" stroke-linecap="round"/>
            <text x="40" y="44" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">32</text>
          </svg>
          <div class="resumo-lista">
            <div class="resumo-item"><span class="dot verde"></span><span>Pagos</span><strong>${d.financeiro.pagos.quantidade}</strong><span class="val">${Fmt.moeda(d.financeiro.pagos.valor)}</span></div>
            <div class="resumo-item"><span class="dot laranja"></span><span>Pendentes</span><strong>${d.financeiro.pendentes.quantidade}</strong><span class="val">${Fmt.moeda(d.financeiro.pendentes.valor)}</span></div>
            <div class="resumo-item total-row"><span></span><span><strong>Total</strong></span><strong></strong><span class="val"><strong>${Fmt.moeda(d.financeiro.totalGeral)}</strong></span></div>
          </div>
        </div>
        <div class="section-header" style="margin-top:16px"><h4>Últimas Movimentações</h4></div>
        <div class="movimentacoes">${movsRows}</div>
      </div>
    </div>

    <div class="depto-section" style="margin-top:24px">
      <div class="section-header"><h3>Bonificações do Mês</h3></div>
      <div class="bonificacoes-grid">${bonCards}</div>
    </div>

    <div class="exp-tabs" style="margin-top:24px">
      <button class="exp-tab active" onclick="switchDpTab('admissao',event)">✅ Admissão</button>
      <button class="exp-tab" onclick="switchDpTab('rescisao',event)">📋 Rescisão</button>
      <button class="exp-tab" onclick="switchDpTab('ferias',event)">🏖️ Férias</button>
      <button class="exp-tab" onclick="switchDpTab('bitrix',event)">🔗 Tarefas Bitrix24</button>
    </div>
    <div id="dp-aba-content" style="margin-top:4px"></div>

  </div>`;
}

function initPage_departamento() {
  if (window.DPHub) {
    try {
      const shell = document.getElementById('dp-hub-shell');
      if (shell) DPHub.render(shell);
    } catch (e) {
      console.error('[DP] Erro ao inicializar hub:', e);
    }
    return;
  }
  setTimeout(() => {
    const el = document.getElementById('dp-aba-content');
    if (el) el.innerHTML = renderDpAdmissao();
  }, 50);
}

function switchDpTab(aba, event) {
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  if (event) event.target.classList.add('active');
  const content = document.getElementById('dp-aba-content');
  if (!content) return;
  if (aba === 'admissao') content.innerHTML = renderDpAdmissao();
  if (aba === 'rescisao') content.innerHTML = renderDpRescisao();
  if (aba === 'ferias')   content.innerHTML = renderDpFerias();
  if (aba === 'bitrix')   content.innerHTML = renderDpBitrix();
}

function fecharModalDp(event, id) {
  if (event.target.id === id) document.getElementById(id).style.display = 'none';
}

// ─────────────────────────────────────────────
// FLUXO RÁPIDO — Geração de tarefas Bitrix24
// ─────────────────────────────────────────────
const fluxoConfig = {
  passagem:        { label: '🚌 Cartão de Passagem',      cat: 'mobilidade'    },
  alimentacao:     { label: '🍽️ Cartão Alimentação',      cat: 'alimentacao'   },
  exame:           { label: '🏥 Exame Admissional',        cat: 'outro'         },
  documento:       { label: '📄 Pedir Documentos',         cat: 'outro'         },
  lavanderia:      { label: '👕 Crédito Lavanderia',       cat: 'outro'         },
  marketing:       { label: '📣 Tarefa Marketing',          cat: 'outro'         },
  adiantamento:    { label: '💰 Adiantamento Salarial',    cat: 'adiantamento'  },
  portabilidade:   { label: '💳 Portabilidade de Salário', cat: 'portabilidade' },
  rescisao_rapida: { label: '📋 Acerto Rescisório',        cat: 'rescisao'      },
  bonificacao:     { label: '🏆 Bonificação',              cat: 'bonificacao'   },
  uniforme:        { label: '👔 Uniforme',                  cat: 'outro'         },
  treinamento:     { label: '🎓 Treinamento',               cat: 'outro'         },
};

function fluxoRapido(tipo) {
  const cfg = fluxoConfig[tipo];
  if (!cfg) return;
  const modal   = document.getElementById('modal-fluxo');
  const content = document.getElementById('modal-fluxo-content');
  if (!modal || !content) return;

  const colabOptions = [
    ...RHData.colaboradores.map(c => `<option value="${c.nome}">${c.nome} — ${c.cargo}</option>`),
    ...dpData.admissoes.map(a => `<option value="${a.nome}">${a.nome} — ${a.cargo}</option>`),
  ].join('');

  const hoje = new Date().toISOString().split('T')[0];
  const bitrixUrl = (typeof AppConfig !== 'undefined' ? AppConfig.bitrix.portalUrl : 'https://bitrix24.com.br');

  content.innerHTML = `
    <div class="modal-header">
      <h3>${cfg.label}</h3>
      <button class="modal-close" onclick="document.getElementById('modal-fluxo').style.display='none'">✕</button>
    </div>
    <div class="exp-form">
      <label>Colaborador</label>
      <select id="fr-colab">
        <option value="">Selecione...</option>
        ${colabOptions}
      </select>
      <div class="form-row">
        <div><label>Data</label><input type="date" id="fr-data" value="${hoje}" /></div>
        <div><label>Responsável (Financeiro)</label><input type="text" id="fr-resp" placeholder="Ex: Maria Financeiro" /></div>
      </div>
      <label>Observações (opcional)</label>
      <textarea id="fr-obs" rows="3" placeholder="Informações adicionais..."></textarea>
      <div style="background:var(--primary-light);border-radius:8px;padding:12px;font-size:12px;color:var(--primary);margin-bottom:8px">
        <strong>🔗 Integração Bitrix24:</strong> Após gerar, copie a descrição e cole no Bitrix24.<br>
        <a href="${bitrixUrl}" target="_blank" class="link-btn" style="display:inline-block;margin-top:4px">Abrir Bitrix24 ↗</a>
      </div>
      <div class="decisao-btns">
        <button class="btn-aprovar" onclick="gerarTarefaFluxo('${tipo}')">📋 Gerar & Copiar</button>
        <button class="btn-primary" onclick="salvarTarefaFluxo('${tipo}')">✅ Salvar Tarefa</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
}

function gerarTarefaFluxo(tipo) {
  const cfg   = fluxoConfig[tipo];
  const colab = document.getElementById('fr-colab')?.value;
  const data  = document.getElementById('fr-data')?.value;
  const resp  = document.getElementById('fr-resp')?.value || '[RESPONSÁVEL]';
  const obs   = document.getElementById('fr-obs')?.value;
  if (!colab) { Toast.error('Selecione um colaborador!'); return; }
  const dataFmt = data ? new Date(data+'T12:00').toLocaleDateString('pt-BR') : '[DATA]';
  const desc = BitrixService.templates.beneficio({
    tipo:   cfg.label.replace(/^\S+\s/, ''),
    nome:   colab,
    data:   dataFmt,
    detalhe: obs || (resp !== '[RESPONSÁVEL]' ? `Responsável: ${resp}` : ''),
  });
  DOM.copiar(desc);
}

function salvarTarefaFluxo(tipo) {
  const colab = document.getElementById('fr-colab')?.value;
  if (!colab) { Toast.error('Selecione um colaborador!'); return; }
  const cfg = fluxoConfig[tipo];
  DOM.modal.fechar('modal-fluxo');
  if (typeof abrirTarefaBitrixRapida === 'function') {
    abrirTarefaBitrixRapida(colab, cfg.cat);
  } else {
    Toast.success(`Tarefa "${DOM.sanitize(cfg.label)}" para ${DOM.sanitize(colab)} registrada!`);
  }
}

function mostrarMaisFluxos() {
  DOM.modal.abrir('modal-mais-fluxos');
}

// ─────────────────────────────────────────────
// ADMISSÃO
// ─────────────────────────────────────────────
function renderDpAdmissao() {
  const rows = dpData.admissoes.map(a => `
    <tr>
      <td>${a.nome}</td><td>${a.cpf}</td><td>${a.cargo}</td><td>${a.setor}</td>
      <td>${a.salario}</td><td>${a.dataAdmissao}</td><td>${a.tipoContrato}</td>
      <td><span class="badge-status pago">${a.status}</span></td>
      <td>
        <button class="link-btn" onclick="exportarAdmissao(${a.id})">⬇ Relatório</button>
        <button class="link-btn" onclick="abrirTarefaBitrixRapida('${a.nome}')">🔗 Bitrix</button>
      </td>
    </tr>
  `).join('');

  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>✅ Controle de Admissões</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="abrirModalAdmissao()">+ Nova Admissão</button>
    </div>
    <div class="table-wrap">
      <table class="depto-table">
        <thead><tr><th>Nome</th><th>CPF</th><th>Cargo</th><th>Setor</th><th>Salário</th><th>Admissão</th><th>Contrato</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>

  <div class="modal-overlay" id="modal-admissao" style="display:none" onclick="fecharModalDp(event,'modal-admissao')">
    <div class="modal-box" style="max-width:620px">
      <div class="modal-header">
        <h3>✅ Nova Admissão</h3>
        <button class="modal-close" onclick="document.getElementById('modal-admissao').style.display='none'">✕</button>
      </div>
      <div class="exp-form">
        <div class="form-row">
          <div><label>Nome completo</label><input type="text" id="adm-nome" placeholder="Nome do colaborador" /></div>
          <div><label>CPF</label><input type="text" id="adm-cpf" placeholder="000.000.000-00" /></div>
        </div>
        <div class="form-row">
          <div><label>Cargo</label><input type="text" id="adm-cargo" placeholder="Ex: Analista de RH" /></div>
          <div><label>Setor</label>
            <select id="adm-setor"><option>RH</option><option>TI</option><option>Comercial</option><option>Financeiro</option><option>Operações</option><option>Logística</option></select>
          </div>
        </div>
        <div class="form-row">
          <div><label>Salário</label><input type="text" id="adm-salario" placeholder="R$ 0,00" /></div>
          <div><label>Data de Admissão</label><input type="date" id="adm-data" /></div>
        </div>
        <div class="form-row">
          <div><label>Tipo de Contrato</label>
            <select id="adm-contrato"><option>CLT</option><option>PJ</option><option>Temporário</option><option>Estágio</option></select>
          </div>
          <div><label>E-mail</label><input type="email" id="adm-email" placeholder="email@empresa.com" /></div>
        </div>
        <div class="form-row">
          <div><label>Telefone</label><input type="text" id="adm-tel" placeholder="(00) 00000-0000" /></div>
          <div><label>Data de Nascimento</label><input type="date" id="adm-nasc" /></div>
        </div>
        <label>Endereço</label>
        <input type="text" id="adm-end" placeholder="Rua, número, bairro, cidade" />
        <label>Banco para salário</label>
        <input type="text" id="adm-banco" placeholder="Ex: Nubank — Ag: 0001 CC: 12345678-9" />
        <label>Benefícios</label>
        <div class="ben-checks">
          <label class="check-item"><input type="checkbox" id="adm-alimentacao" checked /> 🍽️ Alimentação</label>
          <label class="check-item"><input type="checkbox" id="adm-saude" /> ❤️ Plano de Saúde</label>
          <label class="check-item"><input type="checkbox" id="adm-caju" checked /> 🟧 Mobilidade Caju</label>
          <label class="check-item"><input type="checkbox" id="adm-vt" /> 🚌 Vale Transporte</label>
        </div>
        <button class="btn-primary" onclick="salvarAdmissao()">✅ Cadastrar Colaborador</button>
      </div>
    </div>
  </div>`;
}

function abrirModalAdmissao() {
  document.getElementById('modal-admissao').style.display = 'flex';
}

function salvarAdmissao() {
  const nome    = document.getElementById('adm-nome').value.trim();
  const cpf     = document.getElementById('adm-cpf').value.trim();
  const cargo   = document.getElementById('adm-cargo').value.trim();
  const setor   = document.getElementById('adm-setor').value;
  const salario = document.getElementById('adm-salario').value.trim();
  const data    = document.getElementById('adm-data').value;
  const contrato= document.getElementById('adm-contrato').value;
  if (!nome || !cpf || !cargo || !data) { Toast.error('Preencha Nome, CPF, Cargo e Data!'); return; }
  if (!Validators.cpf(cpf)) { Toast.error('CPF inválido!'); return; }
  const dataFmt = new Date(data+'T12:00').toLocaleDateString('pt-BR');
  dpData.admissoes.push({ id: dpData.admissoes.length+1, nome, cpf, cargo, setor, salario: salario||'—', dataAdmissao: dataFmt, tipoContrato: contrato, status:'Ativo' });
  RHData.empresa.totalColaboradores++;
  DOM.modal.fechar('modal-admissao');
  Toast.success(`${DOM.sanitize(nome)} cadastrado com sucesso!`);
  EventBus.emit('colaborador:cadastrado', { nome, cargo, setor });
  document.getElementById('dp-aba-content').innerHTML = renderDpAdmissao();
}

function exportarAdmissao(id) {
  const a = dpData.admissoes.find(x => x.id===id);
  if (!a) return;
  const txt = `FICHA DE ADMISSÃO\n${'='.repeat(40)}\nNome: ${a.nome}\nCPF: ${a.cpf}\nCargo: ${a.cargo}\nSetor: ${a.setor}\nSalário: ${a.salario}\nAdmissão: ${a.dataAdmissao}\nContrato: ${a.tipoContrato}`;
  DOM.download(txt, `admissao-${a.nome.replace(/\s+/g,'-')}.txt`, 'text/plain;charset=utf-8');
}

// ─────────────────────────────────────────────
// RESCISÃO
// ─────────────────────────────────────────────
function renderDpRescisao() {
  const rows = dpData.rescisoes.map(r => `
    <tr>
      <td>${r.nome}</td><td>${r.cpf}</td><td>${r.cargo}</td>
      <td>${r.dataAdmissao}</td><td>${r.dataRescisao}</td><td>${r.tipoRescisao}</td>
      <td><span class="badge-status ${r.status==='Concluída'?'pago':'pendente'}">${r.status}</span></td>
      <td>
        <button class="link-btn" onclick="exportarRescisao(${r.id})">⬇ Relatório</button>
        <button class="link-btn" onclick="abrirTarefaBitrixRapida('${r.nome}','rescisao')">🔗 Bitrix</button>
      </td>
    </tr>
  `).join('');

  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>📋 Controle de Rescisões</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="abrirModalRescisao()">+ Nova Rescisão</button>
    </div>
    <div class="table-wrap">
      <table class="depto-table">
        <thead><tr><th>Nome</th><th>CPF</th><th>Cargo</th><th>Admissão</th><th>Rescisão</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>

  <div class="modal-overlay" id="modal-rescisao" style="display:none" onclick="fecharModalDp(event,'modal-rescisao')">
    <div class="modal-box" style="max-width:580px">
      <div class="modal-header">
        <h3>📋 Nova Rescisão</h3>
        <button class="modal-close" onclick="document.getElementById('modal-rescisao').style.display='none'">✕</button>
      </div>
      <div class="exp-form">
        <div class="form-row">
          <div><label>Nome</label><input type="text" id="res-nome" placeholder="Nome do colaborador" /></div>
          <div><label>CPF</label><input type="text" id="res-cpf" placeholder="000.000.000-00" /></div>
        </div>
        <div class="form-row">
          <div><label>Cargo</label><input type="text" id="res-cargo" placeholder="Cargo ocupado" /></div>
          <div><label>Data de Admissão</label><input type="date" id="res-admissao" /></div>
        </div>
        <div class="form-row">
          <div><label>Data de Rescisão</label><input type="date" id="res-data" /></div>
          <div><label>Tipo</label>
            <select id="res-tipo">
              <option>Pedido de Demissão</option>
              <option>Demissão sem Justa Causa</option>
              <option>Demissão por Justa Causa</option>
              <option>Acordo entre as Partes</option>
              <option>Término de Contrato</option>
            </select>
          </div>
        </div>
        <label>Aviso Prévio</label>
        <select id="res-aviso"><option>Trabalhado</option><option>Indenizado</option><option>Dispensado</option></select>
        <label>Observações</label>
        <textarea id="res-obs" rows="3" placeholder="Informações adicionais..."></textarea>
        <button class="btn-primary" onclick="salvarRescisao()">📋 Registrar Rescisão</button>
      </div>
    </div>
  </div>`;
}

function abrirModalRescisao() {
  document.getElementById('modal-rescisao').style.display = 'flex';
}

function salvarRescisao() {
  const nome    = document.getElementById('res-nome').value.trim();
  const cpf     = document.getElementById('res-cpf').value.trim();
  const cargo   = document.getElementById('res-cargo').value.trim();
  const admissao= document.getElementById('res-admissao').value;
  const data    = document.getElementById('res-data').value;
  const tipo    = document.getElementById('res-tipo').value;
  if (!nome || !cpf || !data) { Toast.error('Preencha Nome, CPF e Data de Rescisão!'); return; }
  if (!Validators.cpf(cpf)) { Toast.error('CPF inválido!'); return; }
  const dataFmt = new Date(data+'T12:00').toLocaleDateString('pt-BR');
  const admFmt  = admissao ? new Date(admissao+'T12:00').toLocaleDateString('pt-BR') : '—';
  dpData.rescisoes.push({ id: dpData.rescisoes.length+1, nome, cpf, cargo, dataAdmissao: admFmt, dataRescisao: dataFmt, tipoRescisao: tipo, status:'Pendente' });
  DOM.modal.fechar('modal-rescisao');
  Toast.success(`Rescisão de ${DOM.sanitize(nome)} registrada!`);
  EventBus.emit('colaborador:desligado', { nome, motivo: tipo });
  document.getElementById('dp-aba-content').innerHTML = renderDpRescisao();
}

function exportarRescisao(id) {
  const r = dpData.rescisoes.find(x => x.id===id);
  if (!r) return;
  const txt = `FICHA DE RESCISÃO\n${'='.repeat(40)}\nNome: ${r.nome}\nCPF: ${r.cpf}\nCargo: ${r.cargo}\nAdmissão: ${r.dataAdmissao}\nRescisão: ${r.dataRescisao}\nTipo: ${r.tipoRescisao}\nStatus: ${r.status}`;
  DOM.download(txt, `rescisao-${r.nome.replace(/\s+/g,'-')}.txt`, 'text/plain;charset=utf-8');
}

// ─────────────────────────────────────────────
// TAREFAS BITRIX24
// ─────────────────────────────────────────────
function renderDpBitrix() {
  const rows = dpData.tarefasBitrix.map((t,i) => `
    <tr>
      <td>${t.colaborador}</td><td>${t.categoria}</td><td>${t.responsavel}</td>
      <td>${t.data} ${t.hora}</td>
      <td><span class="badge-status ${t.enviada?'pago':'pendente'}">${t.enviada?'Enviada':'Pendente'}</span></td>
      <td><button class="link-btn" onclick="copiarTarefaBitrix(${i})">📋 Copiar</button></td>
    </tr>
  `).join('');

  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>🔗 Tarefas Bitrix24</h3>
      <div style="display:flex;gap:8px">
        <a href="https://bitrix24.com.br" target="_blank" class="link-btn">Abrir Bitrix ↗</a>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="abrirModalBitrix()">+ Nova Tarefa</button>
      </div>
    </div>
    ${dpData.tarefasBitrix.length > 0 ? `
    <div class="table-wrap" style="margin-bottom:16px">
      <table class="depto-table">
        <thead><tr><th>Colaborador</th><th>Categoria</th><th>Responsável</th><th>Data/Hora</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>` : `<div class="empty-state" style="padding:24px"><p>Nenhuma tarefa criada. Clique em "+ Nova Tarefa".</p></div>`}
  </div>

  <div class="modal-overlay" id="modal-bitrix" style="display:none" onclick="fecharModalDp(event,'modal-bitrix')">
    <div class="modal-box" style="max-width:640px">
      <div class="modal-header">
        <h3>🔗 Nova Tarefa — Bitrix24</h3>
        <button class="modal-close" onclick="document.getElementById('modal-bitrix').style.display='none'">✕</button>
      </div>
      <div class="exp-form">
        <label>Colaborador</label>
        <select id="btx-colab" onchange="atualizarPromptBitrix()">
          <option value="">Selecione...</option>
          ${RHData.colaboradores.map(c => `<option value="${c.nome}">${c.nome} — ${c.cargo}</option>`).join('')}
          ${dpData.admissoes.map(a => `<option value="${a.nome}">${a.nome} — ${a.cargo}</option>`).join('')}
        </select>
        <label>Categoria</label>
        <select id="btx-cat" onchange="atualizarPromptBitrix()">
          <option value="">Selecione...</option>
          ${bitrixCategorias.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
        <div class="form-row">
          <div><label>Responsável (Financeiro)</label><input type="text" id="btx-resp" placeholder="Ex: Maria Financeiro" oninput="atualizarPromptBitrix()" /></div>
          <div><label>Data</label><input type="date" id="btx-data" value="${new Date().toISOString().split('T')[0]}" oninput="atualizarPromptBitrix()" /></div>
        </div>
        <div class="form-row">
          <div><label>Horário</label><input type="time" id="btx-hora" value="09:00" oninput="atualizarPromptBitrix()" /></div>
          <div><label>Prazo</label><input type="date" id="btx-prazo" oninput="atualizarPromptBitrix()" /></div>
        </div>
        <label>Descrição (editável)</label>
        <textarea id="btx-prompt" rows="8" placeholder="Selecione colaborador e categoria para gerar automaticamente..."></textarea>
        <div class="decisao-btns">
          <button class="btn-aprovar" onclick="copiarDescricaoBitrix()">📋 Copiar descrição</button>
          <button class="btn-primary" onclick="salvarTarefaBitrix()">✅ Salvar tarefa</button>
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--primary-light);border-radius:8px;font-size:12px">
          <strong>💡 Como usar:</strong> Preencha, copie a descrição e cole no Bitrix24.
          <a href="https://bitrix24.com.br" target="_blank" class="link-btn" style="display:inline-block;margin-top:4px">🔗 Abrir Bitrix24 ↗</a>
        </div>
      </div>
    </div>
  </div>`;
}

function abrirModalBitrix() {
  document.getElementById('modal-bitrix').style.display = 'flex';
}

function atualizarPromptBitrix() {
  const nome  = document.getElementById('btx-colab')?.value || '';
  const cat   = document.getElementById('btx-cat')?.value || '';
  const data  = document.getElementById('btx-data')?.value || '';
  const hora  = document.getElementById('btx-hora')?.value || '';
  const resp  = document.getElementById('btx-resp')?.value || '[RESPONSÁVEL]';
  const prazo = document.getElementById('btx-prazo')?.value || '';
  if (!nome || !cat) return;
  const dataFmt  = data  ? new Date(data+'T12:00').toLocaleDateString('pt-BR')  : '[DATA]';
  const prazoFmt = prazo ? new Date(prazo+'T12:00').toLocaleDateString('pt-BR') : '[PRAZO]';
  const base = bitrixPrompts[cat]?.(nome, `${dataFmt} às ${hora}`) || '';
  const el = document.getElementById('btx-prompt');
  if (el) el.value = `${base}\n\nResponsável: ${resp}\nPrazo: ${prazoFmt}`;
}

function copiarDescricaoBitrix() {
  const el = document.getElementById('btx-prompt');
  if (!el?.value) { Toast.error('Preencha os campos primeiro!'); return; }
  DOM.copiar(el.value);
}

function copiarTarefaBitrix(idx) {
  const t = dpData.tarefasBitrix[idx];
  DOM.copiar(t.prompt || `Tarefa: ${t.colaborador} — ${t.categoria}`);
}

function salvarTarefaBitrix() {
  const nome  = document.getElementById('btx-colab').value;
  const cat   = document.getElementById('btx-cat').value;
  const resp  = document.getElementById('btx-resp').value;
  const data  = document.getElementById('btx-data').value;
  const hora  = document.getElementById('btx-hora').value;
  const desc  = document.getElementById('btx-prompt').value;
  if (!nome || !cat || !resp) { Toast.error('Preencha colaborador, categoria e responsável!'); return; }
  const catLabel = bitrixCategorias.find(c => c.id===cat)?.label || cat;
  const dataFmt  = data ? new Date(data+'T12:00').toLocaleDateString('pt-BR') : '—';
  dpData.tarefasBitrix.push({ colaborador:nome, categoria:catLabel, responsavel:resp, data:dataFmt, hora, prompt:desc, enviada:false });
  DOM.modal.fechar('modal-bitrix');
  Toast.success(`Tarefa para ${DOM.sanitize(nome)} salva!`);
  document.getElementById('dp-aba-content').innerHTML = renderDpBitrix();
}

function abrirTarefaBitrixRapida(nome, cat) {
  document.querySelectorAll('.exp-tab').forEach((t,i) => t.classList.toggle('active', i===3));
  document.getElementById('dp-aba-content').innerHTML = renderDpBitrix();
  setTimeout(() => {
    abrirModalBitrix();
    const sel = document.getElementById('btx-colab');
    if (sel) { for (let o of sel.options) { if (o.value===nome) { sel.value=nome; break; } } }
    if (cat) document.getElementById('btx-cat').value = cat;
    atualizarPromptBitrix();
  }, 100);
}

// ─────────────────────────────────────────────
// FÉRIAS
// ─────────────────────────────────────────────
function gerarPlanoAnual(colab) {
  const admissao = new Date(colab.admissao.split('/').reverse().join('-'));
  const plano = [];
  for (let i = 0; i < 12; i++) {
    const mes = new Date(admissao);
    mes.setMonth(admissao.getMonth() + i);
    plano.push({
      colaborador: colab.nome,
      depto: colab.depto,
      mes: mes.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),
      diasAcumulados: i + 1,
    });
  }
  feriasData.planoAnual.push(...plano);
}

function renderDpFerias() {
  const vencidas  = feriasData.colaboradores.filter(c=>c.status==='Vencidas').length;
  const vencendo  = feriasData.colaboradores.filter(c=>c.status==='Vencendo').length;
  const aVencer   = feriasData.colaboradores.filter(c=>c.status==='A vencer').length;
  const deFerias  = feriasData.colaboradores.filter(c=>c.deFerias).length;
  const totalVenc = feriasData.colaboradores.reduce((a,c)=>a+c.diasVencidos,0);

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="depto-cards">
      <div class="depto-card" style="border-left:4px solid var(--danger)">
        <div class="depto-card-icon">⚠️</div>
        <div class="depto-card-info"><strong>${vencidas}</strong><span>Férias vencidas</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--warning)">
        <div class="depto-card-icon">⏰</div>
        <div class="depto-card-info"><strong>${vencendo}</strong><span>Vencendo em breve</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--success)">
        <div class="depto-card-icon">📅</div>
        <div class="depto-card-info"><strong>${aVencer}</strong><span>A vencer</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--primary)">
        <div class="depto-card-icon">🏖️</div>
        <div class="depto-card-info"><strong>${deFerias}</strong><span>De férias hoje</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">📊</div>
        <div class="depto-card-info"><strong>${totalVenc} dias</strong><span>Total dias vencidos</span></div>
      </div>
    </div>

    ${deFerias > 0 ? `
    <div class="depto-section" style="border-left:4px solid var(--primary)">
      <div class="section-header"><h3>🏖️ De Férias Hoje</h3></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${feriasData.colaboradores.filter(c=>c.deFerias).map(c=>`
          <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--primary-light);border-radius:10px">
            <div class="abs-avatar" style="width:32px;height:32px;font-size:10px">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <div><strong style="font-size:13px">${c.nome}</strong><small style="display:block;color:var(--text-muted)">${c.depto}</small></div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="depto-section">
      <div class="section-header"><h3>📅 Timeline de Vencimento</h3></div>
      <div class="ferias-timeline">
        <div class="timeline-grupo">
          <div class="timeline-label urgente">🔴 Esta semana</div>
          ${feriasData.colaboradores.filter(c=>c.status==='Vencidas').map(c=>`
            <div class="timeline-item urgente-item" onclick="abrirDetalheFerias('${c.nome}')">
              <span class="timeline-avatar">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</span>
              <div><strong>${c.nome}</strong><small>${c.depto} · ${c.diasVencidos} dias vencidos</small></div>
              <span class="badge-status inativo">Vencidas</span>
            </div>
          `).join('')}
        </div>
        <div class="timeline-grupo">
          <div class="timeline-label proximo">🟡 Próximas</div>
          ${feriasData.colaboradores.filter(c=>c.status==='Vencendo').map(c=>`
            <div class="timeline-item proximo-item" onclick="abrirDetalheFerias('${c.nome}')">
              <span class="timeline-avatar">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</span>
              <div><strong>${c.nome}</strong><small>${c.depto} · ${c.diasVencidos} dias</small></div>
              <span class="badge-status pendente">Vencendo</span>
            </div>
          `).join('')}
        </div>
        <div class="timeline-grupo">
          <div class="timeline-label ok">🟢 Trimestral</div>
          ${feriasData.colaboradores.filter(c=>c.status==='A vencer').map(c=>`
            <div class="timeline-item ok-item" onclick="abrirDetalheFerias('${c.nome}')">
              <span class="timeline-avatar">${c.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}</span>
              <div><strong>${c.nome}</strong><small>${c.depto}</small></div>
              <span class="badge-status pago">A vencer</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Controle de Férias</h3>
        <div style="display:flex;gap:8px">
          <button class="link-btn" onclick="solicitarVendaFerias()">💰 Venda de Férias</button>
          <button class="link-btn" onclick="solicitarAbono()">📄 Abono</button>
          <button class="btn-primary" style="padding:6px 12px;font-size:12px" onclick="exportarFerias()">⬇ Exportar</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Departamento</th><th>Admissão</th><th>Dias Vencidos</th><th>Período Aquisitivo</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            ${feriasData.colaboradores.map((c,i) => `
              <tr>
                <td><button class="link-btn" onclick="abrirDetalheFerias('${c.nome}')">${c.nome}</button></td>
                <td>${c.depto}</td>
                <td>${c.admissao}</td>
                <td><strong style="color:${c.diasVencidos>0?'var(--danger)':'var(--success)'}">${c.diasVencidos} dias</strong></td>
                <td style="font-size:12px">${c.periodoAquisitivo}</td>
                <td><span class="badge-status ${c.status==='Vencidas'?'inativo':c.status==='Vencendo'?'pendente':'pago'}">${c.status}</span></td>
                <td>
                  <button class="link-btn" onclick="abrirDetalheFerias('${c.nome}')">🔍 Detalhes</button>
                  <button class="link-btn" onclick="agendarFerias(${i})">📅 Agendar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>🎯 Matriz de Risco — Férias</h3></div>
      <div class="matriz-risco">
        <div class="risco-card alto">
          <strong>🔴 Alto Risco</strong>
          <div class="risco-num">${vencidas}</div>
          <small>Férias vencidas há mais de 30 dias</small>
          ${feriasData.colaboradores.filter(c=>c.status==='Vencidas').map(c=>`<div class="risco-nome">${c.nome}</div>`).join('')}
        </div>
        <div class="risco-card medio">
          <strong>🟡 Médio Risco</strong>
          <div class="risco-num">${vencendo}</div>
          <small>Vencimento em até 60 dias</small>
          ${feriasData.colaboradores.filter(c=>c.status==='Vencendo').map(c=>`<div class="risco-nome">${c.nome}</div>`).join('')}
        </div>
        <div class="risco-card baixo">
          <strong>🟢 Baixo Risco</strong>
          <div class="risco-num">${aVencer}</div>
          <small>Férias dentro do prazo</small>
          ${feriasData.colaboradores.filter(c=>c.status==='A vencer').map(c=>`<div class="risco-nome">${c.nome}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header">
        <h3>⏱️ Apuração de Horas Extras</h3>
        <span class="mes-badge">Maio/2025</span>
      </div>
      <div class="depto-cards" style="margin-bottom:16px">
        <div class="depto-card">
          <div class="depto-card-icon">⏱️</div>
          <div class="depto-card-info"><strong>${feriasData.horasExtras.reduce((a,h)=>a+h.horasExtras,0)}h</strong><span>Total horas extras</span></div>
        </div>
        <div class="depto-card">
          <div class="depto-card-icon">🏦</div>
          <div class="depto-card-info"><strong>${feriasData.horasExtras.reduce((a,h)=>a+h.saldoBanco,0)}h</strong><span>Saldo banco de horas</span></div>
        </div>
        <div class="depto-card destaque">
          <div class="depto-card-icon">📊</div>
          <div class="depto-card-info"><strong>${feriasData.horasExtras.reduce((a,h)=>a+h.horasTrab,0)}h</strong><span>Total horas trabalhadas</span></div>
        </div>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Horas Trabalhadas</th><th>Horas Extras</th><th>Saldo Banco</th><th>Status</th></tr></thead>
          <tbody>
            ${feriasData.horasExtras.map(h => `
              <tr>
                <td><strong>${h.colaborador}</strong></td>
                <td>${h.horasTrab}h</td>
                <td style="color:${h.horasExtras>0?'var(--primary)':'var(--text-muted)'};font-weight:700">+${h.horasExtras}h</td>
                <td style="color:${h.saldoBanco>=0?'var(--success)':'var(--danger)'};font-weight:700">${h.saldoBanco>=0?'+':''}${h.saldoBanco}h</td>
                <td><span class="badge-status ${h.saldoBanco>0?'pago':h.saldoBanco<0?'inativo':'pendente'}">${h.saldoBanco>0?'Crédito':h.saldoBanco<0?'Débito':'Zerado'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <div class="modal-overlay" id="modal-ferias-detalhe" style="display:none" onclick="if(event.target.id==='modal-ferias-detalhe')this.style.display='none'">
    <div class="modal-box" style="max-width:500px" id="modal-ferias-content"></div>
  </div>`;
}

function abrirDetalheFerias(nome) {
  const c = feriasData.colaboradores.find(x=>x.nome===nome);
  if (!c) return;
  const saldoAcumulado = c.diasVencidos + 30;
  document.getElementById('modal-ferias-content').innerHTML = `
    <div class="modal-header">
      <h3>🏖️ ${c.nome}</h3>
      <button class="modal-close" onclick="document.getElementById('modal-ferias-detalhe').style.display='none'">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;padding-top:8px">
      <div class="resumo-item" style="grid-template-columns:1fr 1fr"><span>Departamento</span><strong>${c.depto}</strong></div>
      <div class="resumo-item" style="grid-template-columns:1fr 1fr"><span>Admissão</span><strong>${c.admissao}</strong></div>
      <div class="resumo-item" style="grid-template-columns:1fr 1fr"><span>Período Aquisitivo</span><strong style="font-size:12px">${c.periodoAquisitivo}</strong></div>
      <div class="resumo-item" style="grid-template-columns:1fr 1fr"><span>Dias Vencidos</span><strong style="color:${c.diasVencidos>0?'var(--danger)':'var(--success)'}">${c.diasVencidos} dias</strong></div>
      <div class="resumo-item total-row" style="grid-template-columns:1fr 1fr"><span><strong>Saldo Acumulado</strong></span><strong style="color:var(--primary)">${saldoAcumulado} dias</strong></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-primary" onclick="agendarFeriasModal('${c.nome}')">📅 Agendar Férias</button>
        <button class="btn-aprovar" onclick="solicitarVendaFeriasModal('${c.nome}')">💰 Venda de Férias</button>
      </div>
    </div>`;
  document.getElementById('modal-ferias-detalhe').style.display = 'flex';
}

function agendarFerias(i) { abrirDetalheFerias(feriasData.colaboradores[i].nome); }
function agendarFeriasModal(nome) { Toast.info(`Agendamento de férias para ${DOM.sanitize(nome)} em desenvolvimento.`); }
function solicitarVendaFeriasModal(nome) { Toast.success(`Solicitação de venda de férias para ${DOM.sanitize(nome)} enviada para aprovação do gestor!`); }

async function solicitarVendaFerias() {
  const nome = await Toast.input('Nome do colaborador para venda de férias:');
  if (nome) Toast.success(`Solicitação de venda de férias para ${DOM.sanitize(nome)} enviada para aprovação!`);
}

async function solicitarAbono() {
  const nome = await Toast.input('Nome do colaborador para abono:');
  if (nome) Toast.success(`Solicitação de abono para ${DOM.sanitize(nome)} registrada!`);
}

function exportarFerias() {
  const txt = `CONTROLE DE FÉRIAS\n${'='.repeat(40)}\n${feriasData.colaboradores.map(c=>`${c.nome} | ${c.depto} | Vencidos: ${c.diasVencidos}d | ${c.status}`).join('\n')}`;
  DOM.download(txt, 'ferias.txt', 'text/plain;charset=utf-8');
}

// ─────────────────────────────────────────────
// UPLOAD DE ARQUIVOS
// ─────────────────────────────────────────────
function uploadArquivoDP(colaborador, tipo) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.pdf,.xlsx,.xls,.jpg,.jpeg,.png,.doc,.docx';
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    const key   = `${tipo}-${colaborador}`;
    if (!arquivosDP[key]) arquivosDP[key] = [];
    files.forEach(f => {
      arquivosDP[key].push({
        nome: f.name,
        tipo: f.name.split('.').pop().toUpperCase(),
        tamanho: (f.size/1024).toFixed(0)+' KB',
        data: new Date().toLocaleDateString('pt-BR'),
        url: URL.createObjectURL(f),
      });
    });
    Toast.success(`${files.length} arquivo(s) de ${DOM.sanitize(colaborador)} anexado(s)!`);
  };
  input.click();
}

function verArquivosDP(colaborador, tipo) {
  const key  = `${tipo}-${colaborador}`;
  const arqs = arquivosDP[key] || [];
  if (!arqs.length) { Toast.warning('Nenhum arquivo anexado ainda.'); return; }

  const modalId = 'modal-arquivos-dp';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:440px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="margin:0;font-size:15px">📎 ${DOM.sanitize(colaborador)} — ${DOM.sanitize(tipo)}</h3>
        <button onclick="DOM.modal.fechar('${modalId}')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${arqs.map(a => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-radius:8px">
            <span style="font-size:20px">📄</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${DOM.sanitize(a.nome)}</div>
              <div style="font-size:11px;color:#94a3b8">${DOM.sanitize(a.tipo)} · ${DOM.sanitize(a.tamanho)} · ${DOM.sanitize(a.data)}</div>
            </div>
            <a href="${a.url}" download="${DOM.sanitize(a.nome)}" style="color:var(--primary,#1b56d6);font-size:18px;text-decoration:none">⬇</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function exportarDPExcel(colaboradores) {
  const colunas = ["Nome", "Cargo", "Salário", "Férias"];
  const dados = colaboradores.map(c => [c.nome, c.cargo, c.salario, c.ferias]);
  exportarExcel("departamento_pessoal", colunas, dados);
}
