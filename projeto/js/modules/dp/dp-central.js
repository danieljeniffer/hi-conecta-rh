/**
 * dp-central.js — Central Trabalhista Inteligente
 * Tela única para todos os cálculos do DP.
 * Selecione o colaborador → selecione o tipo → resultado imediato.
 */

// ── Tipos de cálculo disponíveis ──────────────
const DPC_TIPOS = {
  ferias: {
    icon: '🏖️', label: 'Férias',
    desc: 'Cálculo completo de férias com 1/3 constitucional e abono pecuniário.',
    campos: [
      { id: 'dias', label: 'Dias de Gozo', tipo: 'number', default: 30, min: 5, max: 30, dica: 'Período normal: 30 dias' },
      { id: 'abono', label: 'Dias de Abono Pecuniário', tipo: 'number', default: 0, min: 0, max: 10, dica: 'Máximo: 10 dias' },
      { id: 'dependentes', label: 'Dependentes (IRRF)', tipo: 'number', default: 0, min: 0, max: 20, dica: 'Para dedução IRRF' },
    ],
    legislacao: 'Art. 129–153 CLT · MP 905/2019',
  },
  rescisao: {
    icon: '👋', label: 'Rescisão',
    desc: 'Cálculo de rescisão para os 5 tipos previstos na CLT.',
    campos: [
      { id: 'tipo_rescisao', label: 'Tipo de Rescisão', tipo: 'select', opcoes: [
        { v: 'sem_justa_causa', l: 'Sem Justa Causa (empresa)' },
        { v: 'pedido_demissao', l: 'Pedido de Demissão (colaborador)' },
        { v: 'justa_causa',    l: 'Justa Causa (empresa)' },
        { v: 'acordo_mutuo',   l: 'Acordo Mútuo (Art. 484-A)' },
        { v: 'termino_contrato', l: 'Término de Contrato' },
      ]},
      { id: 'data_rescisao', label: 'Data da Rescisão', tipo: 'date', default: '', dica: 'Data do último dia trabalhado' },
      { id: 'ferias_vencidas', label: 'Saldo de Férias Vencidas (dias)', tipo: 'number', default: 30, min: 0, max: 30 },
      { id: 'aviso_indenizado', label: 'Aviso Prévio Indenizado?', tipo: 'checkbox', default: false },
    ],
    legislacao: 'Art. 477–487 CLT · Art. 484-A',
  },
  decimo: {
    icon: '🎁', label: '13º Salário',
    desc: 'Cálculo proporcional do 13º salário com INSS e IRRF.',
    campos: [
      { id: 'meses', label: 'Meses Trabalhados no Ano', tipo: 'number', default: 12, min: 1, max: 12, dica: 'Fração ≥ 15 dias = 1 mês' },
      { id: 'parcela', label: 'Parcela', tipo: 'select', opcoes: [
        { v: '1', l: '1ª Parcela (50% sem descontos)' },
        { v: '2', l: '2ª Parcela (com INSS + IRRF)' },
        { v: 'total', l: 'Total (1ª + 2ª)' },
      ]},
      { id: 'dependentes', label: 'Dependentes (IRRF)', tipo: 'number', default: 0, min: 0, max: 20 },
    ],
    legislacao: 'Lei 4.090/62 · Decreto 57.155/65',
  },
  folha: {
    icon: '💰', label: 'Folha de Pagamento',
    desc: 'Cálculo individual da folha com todos os proventos e descontos.',
    campos: [
      { id: 'dias_trabalhados', label: 'Dias Trabalhados', tipo: 'number', default: 30, min: 1, max: 31 },
      { id: 'faltas', label: 'Faltas Injustificadas', tipo: 'number', default: 0, min: 0, max: 31 },
      { id: 'horas_extras_50', label: 'Horas Extras 50%', tipo: 'number', default: 0, min: 0, dica: 'Dias úteis' },
      { id: 'horas_extras_100', label: 'Horas Extras 100%', tipo: 'number', default: 0, min: 0, dica: 'Feriados/domingos' },
      { id: 'dependentes', label: 'Dependentes (IRRF)', tipo: 'number', default: 0, min: 0, max: 20 },
      { id: 'desconto_plano', label: 'Desconto Plano Saúde (R$)', tipo: 'number', default: 85, min: 0 },
      { id: 'desconto_vt', label: 'Desconto VT (R$)', tipo: 'number', default: 0, min: 0, dica: '6% do salário (automático)' },
    ],
    legislacao: 'Art. 7º CF · CLT · Tabela INSS 2024 · Tabela IRRF 2024',
  },
  adiantamento: {
    icon: '💳', label: 'Adiantamento Salarial',
    desc: 'Cálculo do adiantamento quinzenal (até 40% do salário líquido).',
    campos: [
      { id: 'percentual', label: 'Percentual do Adiantamento', tipo: 'range', default: 40, min: 10, max: 40, dica: 'Padrão: 40% do salário líquido' },
    ],
    legislacao: 'Art. 459 CLT',
  },
  simulacao_salarial: {
    icon: '📊', label: 'Simulação Salarial',
    desc: 'Compare o salário atual com uma promoção ou reajuste.',
    campos: [
      { id: 'novo_salario', label: 'Novo Salário Bruto (R$)', tipo: 'number', default: '', min: 0, dica: 'Para promoção/reajuste' },
      { id: 'dependentes', label: 'Dependentes (IRRF)', tipo: 'number', default: 0, min: 0, max: 20 },
    ],
    legislacao: 'Comparativo com base nas tabelas vigentes 2024',
  },
  aviso_previo: {
    icon: '📅', label: 'Aviso Prévio',
    desc: 'Cálculo do aviso prévio proporcional ao tempo de serviço.',
    campos: [
      { id: 'indenizado', label: 'Aviso Indenizado?', tipo: 'checkbox', default: false, dica: 'Empresa opta por indenizar' },
    ],
    legislacao: 'Art. 487 CLT · Lei 12.506/2011',
  },
};

// ── Cache de cálculos ─────────────────────────
const DPCCache = new Map();

// ── Estado central ────────────────────────────
let _dpcState = {
  colaborador:  null,
  tipo:         null,
  resultado:    null,
  calculando:   false,
  historico:    [],
};

// ── Render principal ──────────────────────────
function renderDPCentral() {
  const colabs = _dpcGetColaboradores();

  return `
<div class="dpc-root" id="dpc-root">

  <!-- HERO ────────────────────────────────── -->
  <div class="dpc-hero">
    <div class="dpc-hero-left">
      <div class="dpc-hero-icon">⚡</div>
      <div>
        <h2>Central Trabalhista Inteligente</h2>
        <p>Selecione o colaborador e o tipo de cálculo — resultado imediato</p>
      </div>
    </div>
    <div class="dpc-hero-actions">
      <button class="dpc-btn-ghost" onclick="dpcAbrirHistorico()">📋 Histórico</button>
      <button class="dpc-btn-ghost" onclick="dpcCalculoMassa()">⚡ Cálculo em Massa</button>
      <button class="dpc-btn-primary" onclick="dpcAbrirWizardRescisao()">🧙 Wizard Rescisão</button>
    </div>
  </div>

  <!-- PAINEL PRINCIPAL ─────────────────────── -->
  <div class="dpc-painel">

    <!-- COLUNA ESQUERDA: Seleção ────────────── -->
    <div class="dpc-coluna-sel">

      <!-- Busca de colaborador -->
      <div class="dpc-secao">
        <div class="dpc-secao-titulo">👤 Colaborador</div>
        <div class="dpc-search-wrap">
          <span class="dpc-search-icon">🔍</span>
          <input type="text" id="dpc-busca-colab" class="dpc-search-input"
            placeholder="Buscar por nome ou CPF..."
            oninput="dpcFiltrarColabs(this.value)"
            autocomplete="off" />
        </div>
        <div class="dpc-colab-lista" id="dpc-colab-lista">
          ${colabs.map(c => `
          <div class="dpc-colab-item ${_dpcState.colaborador?.id === c.id ? 'ativo' : ''}"
               onclick="dpcSelecionarColab('${c.id}')"
               data-nome="${c.nome.toLowerCase()}" data-cpf="${c.cpf}">
            <div class="dpc-colab-av">${c.nome.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}</div>
            <div class="dpc-colab-info">
              <div class="dpc-colab-nome">${c.nome}</div>
              <div class="dpc-colab-sub">${c.cargo} · ${PFmt?.moeda?.(c.salario_base) || 'R$ ' + c.salario_base?.toFixed(2)}</div>
            </div>
            <div class="dpc-colab-status dpc-st-${c.status}">${c.status}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Tipo de cálculo -->
      <div class="dpc-secao" style="margin-top:16px">
        <div class="dpc-secao-titulo">🧮 Tipo de Cálculo</div>
        <div class="dpc-tipo-grid">
          ${Object.entries(DPC_TIPOS).map(([k,v]) => `
          <button class="dpc-tipo-btn ${_dpcState.tipo === k ? 'ativo' : ''}"
                  onclick="dpcSelecionarTipo('${k}')">
            <span class="dpc-tipo-icon">${v.icon}</span>
            <span class="dpc-tipo-label">${v.label}</span>
          </button>`).join('')}
        </div>
      </div>

    </div>

    <!-- COLUNA DIREITA: Formulário + Resultado ─ -->
    <div class="dpc-coluna-calc" id="dpc-coluna-calc">
      ${_dpcState.colaborador && _dpcState.tipo
        ? _dpcRenderFormulario()
        : _dpcRenderPlaceholder()}
    </div>

  </div>

</div>`;
}

// ── Placeholder quando nada selecionado ───────
function _dpcRenderPlaceholder() {
  return `
<div class="dpc-placeholder">
  <div class="dpc-placeholder-icon">⚡</div>
  <h3>Pronto para calcular</h3>
  <p>Selecione um colaborador e o tipo de cálculo à esquerda.</p>
  <div class="dpc-placeholder-atalhos">
    <div class="dpc-atalho">
      <kbd>Tab</kbd> Navegar entre campos
    </div>
    <div class="dpc-atalho">
      <kbd>Enter</kbd> Calcular
    </div>
    <div class="dpc-atalho">
      <kbd>F5</kbd> Limpar
    </div>
  </div>
</div>`;
}

// ── Formulário dinâmico por tipo ──────────────
function _dpcRenderFormulario() {
  const colab = _dpcState.colaborador;
  const tipo  = DPC_TIPOS[_dpcState.tipo];
  if (!colab || !tipo) return _dpcRenderPlaceholder();

  return `
<div class="dpc-formulario">

  <!-- Cabeçalho do formulário -->
  <div class="dpc-form-header">
    <div class="dpc-form-header-left">
      <span class="dpc-form-icon">${tipo.icon}</span>
      <div>
        <div class="dpc-form-titulo">${tipo.label} — ${colab.nome.split(' ')[0]}</div>
        <div class="dpc-form-sub">${tipo.desc}</div>
      </div>
    </div>
    <div class="dpc-legislacao">📚 ${tipo.legislacao}</div>
  </div>

  <!-- Card do colaborador -->
  <div class="dpc-colab-card">
    <div class="dpc-colab-card-av">${colab.nome.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}</div>
    <div class="dpc-colab-card-info">
      <strong>${colab.nome}</strong>
      <span>${colab.cargo} · ${colab.depto}</span>
      <span>Admissão: ${new Date(colab.admissao).toLocaleDateString('pt-BR')} · ${_calcTempoEmpresa(colab.admissao)}</span>
    </div>
    <div class="dpc-colab-card-sal">
      <div class="dpc-colab-sal-val">${PFmt?.moeda?.(colab.salario_base) || 'R$ '+colab.salario_base?.toFixed(2)}</div>
      <div class="dpc-colab-sal-label">Salário Bruto</div>
    </div>
  </div>

  <!-- Campos do formulário -->
  <div class="dpc-campos-grid">
    ${tipo.campos.map(c => _dpcRenderCampo(c)).join('')}
  </div>

  <!-- Botão calcular -->
  <button class="dpc-btn-calcular" id="dpc-btn-calc" onclick="dpcCalcular()">
    <span id="dpc-calc-txt">⚡ Calcular Agora</span>
  </button>

  <!-- Resultado -->
  <div id="dpc-resultado" class="dpc-resultado-wrap">
    ${_dpcState.resultado ? _dpcRenderResultado(_dpcState.resultado) : ''}
  </div>

</div>`;
}

// ── Campo de formulário dinâmico ──────────────
function _dpcRenderCampo(campo) {
  const val = campo.default ?? '';
  if (campo.tipo === 'select') {
    return `
<div class="dpc-campo">
  <label class="dpc-label">${campo.label}</label>
  <select id="dpc-campo-${campo.id}" class="dpc-select" onchange="dpcAutoCalc()">
    ${campo.opcoes.map(o => `<option value="${o.v}">${o.l}</option>`).join('')}
  </select>
</div>`;
  }
  if (campo.tipo === 'checkbox') {
    return `
<div class="dpc-campo dpc-campo-check">
  <label class="dpc-label-check">
    <input type="checkbox" id="dpc-campo-${campo.id}" ${val ? 'checked' : ''} onchange="dpcAutoCalc()" />
    ${campo.label}
  </label>
  ${campo.dica ? `<div class="dpc-dica">${campo.dica}</div>` : ''}
</div>`;
  }
  if (campo.tipo === 'range') {
    return `
<div class="dpc-campo">
  <label class="dpc-label">${campo.label}: <strong id="dpc-range-${campo.id}-val">${val}%</strong></label>
  <input type="range" id="dpc-campo-${campo.id}" min="${campo.min}" max="${campo.max}" value="${val}"
    oninput="document.getElementById('dpc-range-${campo.id}-val').textContent=this.value+'%';dpcAutoCalc()" class="dpc-range" />
  <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8">
    <span>${campo.min}%</span><span>${campo.max}%</span>
  </div>
</div>`;
  }
  return `
<div class="dpc-campo">
  <label class="dpc-label">${campo.label}</label>
  <input type="${campo.tipo}" id="dpc-campo-${campo.id}"
    value="${val}" ${campo.min !== undefined ? `min="${campo.min}"` : ''} ${campo.max !== undefined ? `max="${campo.max}"` : ''}
    class="dpc-input" placeholder="${campo.dica || ''}"
    oninput="dpcAutoCalc()" onkeydown="if(event.key==='Enter')dpcCalcular()" />
  ${campo.dica ? `<div class="dpc-dica">💡 ${campo.dica}</div>` : ''}
</div>`;
}

// ── Resultado + Memória de Cálculo ────────────
function _dpcRenderResultado(res) {
  if (!res) return '';

  const linhasMemoria = res.memoria || [];
  const alertas = res.alertas || [];
  const acoes   = res.acoes   || [];

  return `
<div class="dpc-resultado">

  <!-- Valor final em destaque -->
  <div class="dpc-resultado-hero" style="background:${res.cor || 'linear-gradient(135deg,#16a34a,#22c55e)'}">
    <div class="dpc-res-label">${res.label || 'Valor Final'}</div>
    <div class="dpc-res-valor">${PFmt?.moeda?.(res.liquido) || 'R$ '+parseFloat(res.liquido||0).toFixed(2)}</div>
    <div class="dpc-res-sub">${res.subtitulo || ''}</div>
  </div>

  <!-- Memória de Cálculo Visual -->
  <div class="dpc-memoria">
    <div class="dpc-memoria-titulo">📐 Memória de Cálculo</div>
    <div class="dpc-memoria-linhas">
      ${linhasMemoria.map((l, i) => `
      <div class="dpc-mem-linha ${l.tipo || ''}">
        <div class="dpc-mem-esq">
          <span class="dpc-mem-sinal">${l.sinal || ''}</span>
          <span class="dpc-mem-item">${l.item}</span>
          ${l.lei ? `<span class="dpc-mem-lei" title="${l.lei}">⚖️</span>` : ''}
        </div>
        <div class="dpc-mem-dir">
          <span class="dpc-mem-val ${l.tipo === 'desconto' ? 'neg' : l.tipo === 'total' ? 'total' : 'pos'}">${PFmt?.moeda?.(l.valor) || 'R$'+parseFloat(l.valor||0).toFixed(2)}</span>
          ${l.pct ? `<span class="dpc-mem-pct">${l.pct}%</span>` : ''}
        </div>
      </div>
      ${i < linhasMemoria.length - 1 ? '' : ''}`).join('')}
    </div>
    ${res.fgts !== undefined ? `
    <div class="dpc-fgts-box">
      <span>🏦 FGTS depositado pela empresa:</span>
      <strong>${PFmt?.moeda?.(res.fgts) || 'R$'+parseFloat(res.fgts||0).toFixed(2)}</strong>
      <span class="dpc-fgts-sub">(não descontado do colaborador)</span>
    </div>` : ''}
  </div>

  <!-- Alertas trabalhistas -->
  ${alertas.length ? `
  <div class="dpc-alertas-box">
    <div class="dpc-alertas-titulo">⚠️ Atenção Trabalhista</div>
    ${alertas.map(a => `<div class="dpc-alerta-item dpc-alerta-${a.nivel}">${a.msg}</div>`).join('')}
  </div>` : ''}

  <!-- Ações pós-cálculo -->
  <div class="dpc-acoes-pos">
    <button class="dpc-btn-acao" onclick="dpcGerarPDF()">📄 Gerar PDF</button>
    <button class="dpc-btn-acao" onclick="dpcGerarWord()">📝 Gerar Word</button>
    <button class="dpc-btn-acao" onclick="dpcCopiarResultado()">📋 Copiar</button>
    <button class="dpc-btn-acao" onclick="dpcSalvarHistorico()">💾 Salvar</button>
    ${acoes.map(a => `<button class="dpc-btn-acao dpc-btn-dest" onclick="${a.fn}">${a.icon} ${a.label}</button>`).join('')}
  </div>

</div>`;
}

// ── Motor de Cálculo ──────────────────────────
window.dpcCalcular = async function() {
  const colab = _dpcState.colaborador;
  const tipo  = _dpcState.tipo;
  if (!colab || !tipo) { Toast?.aviso('Selecione colaborador e tipo.'); return; }

  // Coleta campos
  const params = { colaborador: colab };
  const def    = DPC_TIPOS[tipo];
  def.campos.forEach(c => {
    const el = document.getElementById(`dpc-campo-${c.id}`);
    if (!el) return;
    params[c.id] = c.tipo === 'checkbox' ? el.checked :
                   c.tipo === 'number' || c.tipo === 'range' ? parseFloat(el.value) || 0 :
                   el.value;
  });

  // Chave de cache
  const cacheKey = `${colab.id}_${tipo}_${JSON.stringify(params)}`;
  if (DPCCache.has(cacheKey)) {
    _dpcState.resultado = DPCCache.get(cacheKey);
    _dpcAtualizarResultado();
    return;
  }

  // Loading
  const btn = document.getElementById('dpc-btn-calc');
  const txt = document.getElementById('dpc-calc-txt');
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = '⌛ Calculando...';

  await new Promise(r => setTimeout(r, 200)); // micro-delay para UX

  const resultado = _dpcExecutarCalculo(tipo, params, colab);
  DPCCache.set(cacheKey, resultado);
  _dpcState.resultado = resultado;
  _dpcState.historico.unshift({ tipo, colab: colab.nome, resultado, em: new Date().toISOString() });
  if (_dpcState.historico.length > 50) _dpcState.historico.pop();

  if (btn) btn.disabled = false;
  if (txt) txt.textContent = '⚡ Recalcular';

  _dpcAtualizarResultado();

  // Integração com automações
  if (window.AutomationEngine) {
    if (tipo === 'rescisao') AutomationEngine.simularExecucao({ gatilho: 'desligamento', acoes: [] });
  }
};

// Auto-cálculo com debounce (enquanto digita)
let _dpcDebounce = null;
window.dpcAutoCalc = function() {
  clearTimeout(_dpcDebounce);
  _dpcDebounce = setTimeout(() => {
    if (_dpcState.colaborador && _dpcState.tipo) dpcCalcular();
  }, 600);
};

function _dpcAtualizarResultado() {
  const el = document.getElementById('dpc-resultado');
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.innerHTML = _dpcRenderResultado(_dpcState.resultado);
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
}

// ── Executores de cálculo ─────────────────────
function _dpcExecutarCalculo(tipo, params, colab) {
  const sal = parseFloat(colab.salario_base);
  const dep = params.dependentes || 0;

  switch (tipo) {
    case 'ferias':         return _calcFerias(sal, params.dias, params.abono, dep, colab);
    case 'rescisao':       return _calcRescisao(sal, params, colab);
    case 'decimo':         return _calcDecimo(sal, params.meses, params.parcela, dep, colab);
    case 'folha':          return _calcFolha(sal, params, dep, colab);
    case 'adiantamento':   return _calcAdiantamento(sal, params.percentual, colab);
    case 'simulacao_salarial': return _calcSimulacao(sal, params.novo_salario, dep, colab);
    case 'aviso_previo':   return _calcAvisoPrevio(sal, colab, params.indenizado);
    default: return null;
  }
}

function _calcFerias(sal, dias, abono, dep, colab) {
  dias  = dias  || 30;
  abono = abono || 0;
  const base   = (sal / 30) * dias;
  const terco  = base / 3;
  const vAbono = abono > 0 ? (sal / 30) * abono : 0;
  const baseINSS = base + terco;
  const inss   = _inss(baseINSS);
  const irrf   = _irrf(baseINSS - inss, dep);
  const liquido = base + terco + vAbono - inss - irrf;
  const fgts   = sal * 0.08;

  return {
    label: 'Férias Líquidas', cor: 'linear-gradient(135deg,#7c3aed,#2563eb)',
    subtitulo: `${dias} dias + ${abono} dias de abono`,
    liquido, fgts,
    alertas: [
      dias > 30 ? { msg: 'Período não pode exceder 30 dias.', nivel: 'erro' } : null,
      abono > 10 ? { msg: 'Abono pecuniário limitado a 10 dias.', nivel: 'erro' } : null,
      _mesesAdmissao(colab.admissao) < 12 ? { msg: 'Colaborador ainda no período aquisitivo (< 12 meses).', nivel: 'aviso' } : null,
    ].filter(Boolean),
    memoria: [
      { item: 'Salário Base',             valor: sal,              sinal: '' },
      { item: `Proporcional (${dias}d)`,  valor: base,             sinal: '×', pct: ((dias/30)*100).toFixed(0) },
      { item: '⅓ Constitucional',         valor: terco,            sinal: '+', lei: 'Art. 7º, XVII CF/88' },
      ...(abono > 0 ? [{ item: `Abono (${abono}d)`, valor: vAbono, sinal: '+' }] : []),
      { item: 'INSS (progressivo)',        valor: -inss,            sinal: '–', tipo: 'desconto', pct: ((inss/baseINSS)*100).toFixed(2), lei: 'Portaria MPS nº 1/2024' },
      { item: 'IRRF',                      valor: -irrf,            sinal: '–', tipo: 'desconto', lei: 'Tabela IRRF 2024' },
      { item: '💰 LÍQUIDO A RECEBER',      valor: liquido,          sinal: '=', tipo: 'total' },
    ],
    acoes: [{ icon: '📅', label: 'Agendar Férias', fn: "ptlNav?.('ferias')" }],
  };
}

function _calcRescisao(sal, params, colab) {
  const tipo       = params.tipo_rescisao || 'sem_justa_causa';
  const dataRescis = params.data_rescisao ? new Date(params.data_rescisao) : new Date();
  const admissao   = new Date(colab.admissao);
  const mesesEmp   = _mesesAdmissao(colab.admissao);
  const anosEmp    = Math.floor(mesesEmp / 12);

  // Aviso prévio
  const diasAviso = Math.min(30 + anosEmp * 3, 90);
  const aviso     = ['sem_justa_causa','termino_contrato'].includes(tipo) ? (sal/30)*diasAviso : 0;

  // Saldo de salário
  const diaRescis = dataRescis.getDate();
  const saldo     = (sal/30) * diaRescis;

  // Férias
  const fvEnd = Math.min(params.ferias_vencidas || 30, 30);
  const fv    = (sal/30) * fvEnd * (4/3);
  const fp    = (mesesEmp % 12) > 0 ? (sal/12) * (mesesEmp % 12) * (4/3) : 0;

  // 13º
  const mesAtual = new Date().getMonth() + 1;
  const dec13    = ['justa_causa'].includes(tipo) ? 0 : (sal/12) * mesAtual;

  // FGTS + multa
  const fgtsMes = sal * 0.08;
  const fgtsAcum = fgtsMes * mesesEmp;
  const multa   = tipo === 'sem_justa_causa' ? fgtsAcum * 0.40 :
                  tipo === 'acordo_mutuo'     ? fgtsAcum * 0.20 : 0;

  const bruto  = saldo + (params.aviso_indenizado ? aviso : 0) + fv + fp + dec13 + multa;
  const baseD  = saldo + fv + fp + dec13 + (params.aviso_indenizado ? aviso : 0);
  const inss   = _inss(baseD);
  const irrf   = _irrf(baseD - inss, 0);
  const liquido = bruto - inss - irrf;

  const alertas = [];
  if (mesesEmp < 6  && tipo === 'sem_justa_causa') alertas.push({ msg: 'Homologação em sindicato obrigatória para salário > 2 SM.', nivel: 'aviso' });
  if (tipo === 'justa_causa') alertas.push({ msg: 'Justa causa exige registro documental de advertências anteriores.', nivel: 'aviso' });
  if (tipo === 'acordo_mutuo') alertas.push({ msg: 'Art. 484-A: colaborador não tem direito ao seguro-desemprego.', nivel: 'info' });

  return {
    label: 'Rescisão Líquida', cor: 'linear-gradient(135deg,#7f1d1d,#b91c1c)',
    subtitulo: DPC_TIPOS.rescisao.campos[0].opcoes.find(o=>o.v===tipo)?.l,
    liquido, fgts: fgtsAcum,
    alertas,
    memoria: [
      { item: `Saldo de Salário (${diaRescis}d)`, valor: saldo, sinal: '' },
      params.aviso_indenizado ? { item: `Aviso Prévio Indenizado (${diasAviso}d)`, valor: aviso, sinal: '+', lei: 'Lei 12.506/2011' } : null,
      { item: `Férias Vencidas (${fvEnd}d + ⅓)`, valor: fv, sinal: '+' },
      fp > 0 ? { item: `Férias Proporcionais (${mesesEmp%12}m + ⅓)`, valor: fp, sinal: '+' } : null,
      dec13 > 0 ? { item: `13º Proporcional (${mesAtual}m)`, valor: dec13, sinal: '+' } : null,
      multa > 0 ? { item: `Multa FGTS (${tipo==='acordo_mutuo'?'20%':'40%'})`, valor: multa, sinal: '+', lei: 'Art. 18 FGTS' } : null,
      { item: 'INSS', valor: -inss, sinal: '–', tipo: 'desconto' },
      { item: 'IRRF', valor: -irrf, sinal: '–', tipo: 'desconto' },
      { item: '💰 RESCISÃO LÍQUIDA', valor: liquido, sinal: '=', tipo: 'total' },
    ].filter(Boolean),
    acoes: [{ icon: '🧙', label: 'Abrir Wizard', fn: "dpcAbrirWizardRescisao()" }],
  };
}

function _calcDecimo(sal, meses, parcela, dep, colab) {
  meses = meses || 12;
  const base    = (sal / 12) * meses;
  const p1      = base * 0.5; // 1ª parcela sem descontos
  const inss    = _inss(base);
  const irrf    = _irrf(base - inss, dep);
  const p2      = base * 0.5 - inss - irrf;
  const total   = p1 + p2;
  const liquido = parcela === '1' ? p1 : parcela === '2' ? p2 : total;

  return {
    label: parcela === '1' ? '1ª Parcela' : parcela === '2' ? '2ª Parcela' : '13º Completo',
    cor: 'linear-gradient(135deg,#d97706,#f59e0b)',
    subtitulo: `Proporcional a ${meses}/12 meses`,
    liquido, fgts: sal * 0.08,
    alertas: [],
    memoria: [
      { item: 'Salário Base', valor: sal, sinal: '' },
      { item: `Proporcional (${meses}/12)`, valor: base, sinal: '×', pct: ((meses/12)*100).toFixed(0) },
      { item: '1ª Parcela (50%)', valor: p1, sinal: '→', tipo: parcela === '1' ? 'total' : '' },
      parcela !== '1' ? { item: 'INSS (sobre total)', valor: -inss, sinal: '–', tipo: 'desconto' } : null,
      parcela !== '1' ? { item: 'IRRF (sobre total)', valor: -irrf, sinal: '–', tipo: 'desconto' } : null,
      parcela !== '1' ? { item: '2ª Parcela Líquida', valor: p2, sinal: '→', tipo: parcela === '2' ? 'total' : '' } : null,
      parcela === 'total' ? { item: '💰 TOTAL LÍQUIDO', valor: liquido, sinal: '=', tipo: 'total' } : null,
    ].filter(Boolean),
  };
}

function _calcFolha(sal, params, dep, colab) {
  const dias     = params.dias_trabalhados || 30;
  const faltas   = params.faltas || 0;
  const he50     = params.horas_extras_50 || 0;
  const he100    = params.horas_extras_100 || 0;
  const plano    = params.desconto_plano || 0;

  const valHora  = sal / 220;
  const saldo    = (sal / 30) * (dias - faltas);
  const vHE50    = valHora * 1.5 * he50;
  const vHE100   = valHora * 2.0 * he100;
  const vt       = sal * 0.06;
  const bruto    = saldo + vHE50 + vHE100;
  const inss     = _inss(bruto);
  const irrf     = _irrf(bruto - inss, dep);
  const liquido  = bruto - inss - irrf - vt - plano;
  const fgts     = bruto * 0.08;

  return {
    label: 'Salário Líquido', cor: 'linear-gradient(135deg,#16a34a,#22c55e)',
    subtitulo: `${dias} dias · ${faltas} falta(s) · ${he50+he100}h extras`,
    liquido, fgts,
    alertas: [
      faltas > 5 ? { msg: `${faltas} faltas — impacto no benefício de assiduidade.`, nivel: 'aviso' } : null,
      (he50 + he100) > 40 ? { msg: 'Horas extras acima de 40h/mês — verificar legislação.', nivel: 'aviso' } : null,
    ].filter(Boolean),
    memoria: [
      { item: 'Salário Base', valor: sal, sinal: '' },
      faltas > 0 ? { item: `Desconto Faltas (${faltas}d)`, valor: -(sal/30*faltas), sinal: '–', tipo: 'desconto' } : null,
      vHE50  > 0 ? { item: `HE 50% (${he50}h)`,  valor: vHE50,  sinal: '+', lei: 'Art. 59 CLT' } : null,
      vHE100 > 0 ? { item: `HE 100% (${he100}h)`, valor: vHE100, sinal: '+' } : null,
      { item: 'INSS Progressivo', valor: -inss, sinal: '–', tipo: 'desconto', pct: ((inss/bruto)*100).toFixed(2) },
      { item: 'IRRF', valor: -irrf, sinal: '–', tipo: 'desconto' },
      vt > 0 ? { item: 'Vale Transporte (6%)', valor: -vt, sinal: '–', tipo: 'desconto', lei: 'Lei 7.418/85' } : null,
      plano > 0 ? { item: 'Plano de Saúde', valor: -plano, sinal: '–', tipo: 'desconto' } : null,
      { item: '💰 SALÁRIO LÍQUIDO', valor: liquido, sinal: '=', tipo: 'total' },
    ].filter(Boolean),
  };
}

function _calcAdiantamento(sal, pct, colab) {
  pct = pct || 40;
  const dep   = 0;
  const inss  = _inss(sal);
  const irrf  = _irrf(sal - inss, dep);
  const liq   = sal - inss - irrf;
  const adian = liq * (pct / 100);

  return {
    label: `Adiantamento (${pct}%)`, cor: 'linear-gradient(135deg,#0891b2,#06b6d4)',
    subtitulo: `${pct}% do salário líquido estimado`,
    liquido: adian,
    alertas: [
      pct > 40 ? { msg: 'Adiantamento acima de 40% requer autorização formal.', nivel: 'aviso' } : null,
    ].filter(Boolean),
    memoria: [
      { item: 'Salário Bruto', valor: sal, sinal: '' },
      { item: 'INSS estimado', valor: -inss, sinal: '–', tipo: 'desconto' },
      { item: 'IRRF estimado', valor: -irrf, sinal: '–', tipo: 'desconto' },
      { item: 'Salário Líquido estimado', valor: liq, sinal: '=' },
      { item: `Adiantamento (${pct}%)`, valor: adian, sinal: '→', tipo: 'total' },
    ],
  };
}

function _calcSimulacao(salAtual, novoSal, dep, colab) {
  novoSal = parseFloat(novoSal) || salAtual;
  const cA = { bruto: salAtual, inss: _inss(salAtual), fgts: salAtual*0.08 };
  cA.irrf   = _irrf(cA.bruto - cA.inss, dep);
  cA.liquido= cA.bruto - cA.inss - cA.irrf;

  const cN = { bruto: novoSal, inss: _inss(novoSal), fgts: novoSal*0.08 };
  cN.irrf   = _irrf(cN.bruto - cN.inss, dep);
  cN.liquido= cN.bruto - cN.inss - cN.irrf;

  const diff    = cN.liquido - cA.liquido;
  const pct     = salAtual > 0 ? ((novoSal - salAtual) / salAtual * 100).toFixed(2) : 0;

  return {
    label: `Ganho Líquido`, cor: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
    subtitulo: `Reajuste de ${pct}% — R$ ${diff.toFixed(2)}/mês adicional`,
    liquido: cN.liquido,
    alertas: [
      novoSal < salAtual ? { msg: 'Novo salário é inferior ao atual.', nivel: 'erro' } : null,
      novoSal < 1412 ? { msg: 'Salário abaixo do mínimo vigente (R$ 1.412,00).', nivel: 'erro' } : null,
    ].filter(Boolean),
    memoria: [
      { item: '🔵 Salário ATUAL Bruto',   valor: salAtual,     sinal: '' },
      { item: 'INSS atual',               valor: -cA.inss,     sinal: '–', tipo: 'desconto' },
      { item: 'IRRF atual',               valor: -cA.irrf,     sinal: '–', tipo: 'desconto' },
      { item: 'Líquido ATUAL',            valor: cA.liquido,   sinal: '=', tipo: '' },
      { item: '🟢 Salário NOVO Bruto',    valor: novoSal,      sinal: '' },
      { item: 'INSS novo',                valor: -cN.inss,     sinal: '–', tipo: 'desconto' },
      { item: 'IRRF novo',                valor: -cN.irrf,     sinal: '–', tipo: 'desconto' },
      { item: 'Líquido NOVO',             valor: cN.liquido,   sinal: '=', tipo: '' },
      { item: `📈 GANHO LÍQUIDO (${pct}%)`, valor: diff,       sinal: '+', tipo: 'total' },
    ],
  };
}

function _calcAvisoPrevio(sal, colab, indenizado) {
  const meses = _mesesAdmissao(colab.admissao);
  const anos  = Math.floor(meses / 12);
  const dias  = Math.min(30 + anos * 3, 90);
  const valor = (sal / 30) * dias;

  return {
    label: `Aviso Prévio (${dias} dias)`, cor: 'linear-gradient(135deg,#334155,#1e293b)',
    subtitulo: `${30} dias base + ${anos*3}d por ano trabalhado`,
    liquido: valor,
    alertas: [],
    memoria: [
      { item: 'Dias base', valor: 30, sinal: '' },
      { item: `Acréscimo (${anos} anos × 3 dias)`, valor: anos*3, sinal: '+', lei: 'Lei 12.506/2011' },
      { item: 'Total de dias', valor: dias, sinal: '=' },
      { item: `Valor diário (${PFmt?.moeda?.(sal/30)})`, valor: sal/30, sinal: '×' },
      { item: `Valor Total ${indenizado ? '(Indenizado)' : '(Trabalhado)'}`, valor, sinal: '=', tipo: 'total' },
    ],
  };
}

// ── Helpers CLT ───────────────────────────────
function _inss(salario) {
  const faixas = [[1412.00,0.075],[2666.68,0.09],[4000.03,0.12],[7786.02,0.14]];
  let desc = 0, base = salario;
  for (const [teto, aliq] of faixas) {
    if (base <= 0) break;
    const f = Math.min(base, teto);
    desc += f * aliq;
    base -= f;
  }
  return Math.min(Math.round(desc*100)/100, 908.85);
}

function _irrf(base, dep) {
  const deducDep = dep * 189.59;
  const bc = base - deducDep;
  if (bc <= 2259.20) return 0;
  if (bc <= 2826.65) return Math.max(0, bc*0.075 - 169.44);
  if (bc <= 3751.05) return Math.max(0, bc*0.15  - 381.44);
  if (bc <= 4664.68) return Math.max(0, bc*0.225 - 662.77);
  return Math.max(0, bc*0.275 - 896.00);
}

function _mesesAdmissao(admissao) {
  const a = new Date(admissao), h = new Date();
  return (h.getFullYear()-a.getFullYear())*12 + (h.getMonth()-a.getMonth());
}

function _calcTempoEmpresa(admissao) {
  const m = _mesesAdmissao(admissao);
  const a = Math.floor(m/12), r = m%12;
  return a > 0 ? `${a}a ${r}m na empresa` : `${m}m na empresa`;
}

// ── Dados colaboradores (demo + integração) ───
function _dpcGetColaboradores() {
  // Tenta dados reais primeiro, depois demo
  if (window.pessoasData?.colaboradores?.length) {
    return pessoasData.colaboradores.map(c => ({
      id:          c.id || c.nome,
      nome:        c.nome,
      cpf:         c.cpf || '000.000.000-00',
      cargo:       c.cargo,
      depto:       c.depto || c.setor || '—',
      salario_base:parseFloat(c.salario || c.salario_base || 3500),
      admissao:    c.admissao || c.dataAdmissao || '2023-01-01',
      status:      c.status?.toLowerCase() || 'ativo',
    }));
  }
  return [
    { id:'C1', nome:'Mariana Rodrigues', cpf:'111.222.333-44', cargo:'Analista RH',     depto:'RH',         salario_base:5200, admissao:'2023-01-02', status:'ativo'    },
    { id:'C2', nome:'Carlos Eduardo Souza', cpf:'222.333.444-55', cargo:'Supervisor',  depto:'Comercial',  salario_base:6800, admissao:'2022-03-15', status:'ativo'    },
    { id:'C3', nome:'João Paulo Silva',  cpf:'333.444.555-66', cargo:'Vendedor',        depto:'Comercial',  salario_base:3500, admissao:'2023-06-01', status:'ativo'    },
    { id:'C4', nome:'Ana Lima Ferreira', cpf:'444.555.666-77', cargo:'Analista Fin.',  depto:'Financeiro', salario_base:4200, admissao:'2022-08-10', status:'ferias'   },
    { id:'C5', nome:'Paulo R. Santos',   cpf:'555.666.777-88', cargo:'Desenvolvedor',  depto:'TI',         salario_base:8500, admissao:'2021-11-20', status:'ativo'    },
    { id:'C6', nome:'Beatriz Alves',     cpf:'666.777.888-99', cargo:'Assistente Adm.',depto:'Administrativo',salario_base:2800,admissao:'2024-01-10',status:'admissao_pendente'},
  ];
}

// ── Navegação ──────────────────────────────────
window.dpcSelecionarColab = function(id) {
  const colabs = _dpcGetColaboradores();
  _dpcState.colaborador = colabs.find(c => c.id === id) || null;
  _dpcState.resultado   = null;
  DPCCache.clear();
  _dpcRefresh();
};

window.dpcSelecionarTipo = function(tipo) {
  _dpcState.tipo      = tipo;
  _dpcState.resultado = null;
  _dpcRefresh();
  // Auto-calcula se já tiver colaborador
  if (_dpcState.colaborador) setTimeout(dpcCalcular, 100);
};

window.dpcFiltrarColabs = function(busca) {
  const q = busca.toLowerCase().trim();
  document.querySelectorAll('.dpc-colab-item').forEach(el => {
    const match = !q || el.dataset.nome?.includes(q) || el.dataset.cpf?.includes(q);
    el.style.display = match ? '' : 'none';
  });
};

function _dpcRefresh() {
  const root = document.getElementById('dpc-root');
  if (!root) return;
  root.innerHTML = renderDPCentral().replace('<div class="dpc-root" id="dpc-root">', '').replace(/^[\s\S]*?<div class="dpc-painel">/, '<div class="dpc-painel">');
  const cont = document.getElementById('dpc-coluna-calc');
  if (cont) cont.innerHTML = _dpcState.colaborador && _dpcState.tipo ? _dpcRenderFormulario() : _dpcRenderPlaceholder();
  // Re-destaca item ativo
  document.querySelectorAll('.dpc-colab-item').forEach(el => {
    el.classList.toggle('ativo', _dpcState.colaborador && el.getAttribute('onclick')?.includes(_dpcState.colaborador.id));
  });
  document.querySelectorAll('.dpc-tipo-btn').forEach(btn => {
    btn.classList.toggle('ativo', btn.getAttribute('onclick')?.includes(_dpcState.tipo));
  });
}

// ── Ações pós-cálculo ──────────────────────────
window.dpcGerarPDF = function() {
  if (!_dpcState.resultado) return;
  DocumentGeneratorService?.gerarPDFCalculo?.(_dpcState.resultado, _dpcState.colaborador, _dpcState.tipo);
  if (window.Toast) Toast.success('PDF gerado com sucesso!');
};

window.dpcGerarWord = function() {
  if (!_dpcState.resultado || !_dpcState.colaborador) return;
  const html = _dpcBuildWordHtml();
  ExportService?.word?.(`${DPC_TIPOS[_dpcState.tipo]?.label}_${_dpcState.colaborador.nome}`, html);
};

function _dpcBuildWordHtml() {
  const r = _dpcState.resultado;
  const c = _dpcState.colaborador;
  const t = DPC_TIPOS[_dpcState.tipo];
  return `<h2>${t.icon} ${t.label} — ${c.nome}</h2>
<p><b>Data:</b> ${new Date().toLocaleDateString('pt-BR')} | <b>Cargo:</b> ${c.cargo} | <b>Depto:</b> ${c.depto}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
  <thead><tr style="background:#2563eb;color:#fff"><th>Item</th><th>Valor</th></tr></thead>
  <tbody>${r.memoria.map(l=>`<tr><td>${l.sinal||''} ${l.item}</td><td style="text-align:right">${PFmt?.moeda?.(l.valor)||'R$'+parseFloat(l.valor||0).toFixed(2)}</td></tr>`).join('')}</tbody>
</table>
<p style="margin-top:20px"><b>Base Legal:</b> ${t.legislacao}</p>`;
}

window.dpcCopiarResultado = function() {
  if (!_dpcState.resultado) return;
  const r = _dpcState.resultado;
  const c = _dpcState.colaborador;
  const txt = `${DPC_TIPOS[_dpcState.tipo]?.label} — ${c?.nome}\n${'-'.repeat(40)}\n` +
    r.memoria.map(l=>`${l.sinal||'  '} ${l.item.padEnd(30)} ${(PFmt?.moeda?.(l.valor)||'R$'+parseFloat(l.valor||0).toFixed(2))}`).join('\n') +
    `\n${'-'.repeat(40)}\n🏦 FGTS: ${PFmt?.moeda?.(r.fgts)||0}`;
  navigator.clipboard?.writeText(txt);
  if (window.Toast) Toast.success('Resultado copiado!');
};

window.dpcSalvarHistorico = function() {
  if (window.Toast) Toast.success('Cálculo salvo no histórico!');
};

window.dpcAbrirHistorico = function() {
  const hist = _dpcState.historico;
  if (!hist.length) { Toast?.aviso('Nenhum cálculo no histórico.'); return; }
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
<div style="background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.2)">
  <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff">
    <h3 style="margin:0;font-size:15px">📋 Histórico de Cálculos</h3>
    <button onclick="this.closest('div[style]').remove()" style="border:none;background:#f8fafc;border-radius:6px;width:28px;height:28px;cursor:pointer">✕</button>
  </div>
  <div style="padding:16px;display:flex;flex-direction:column;gap:8px">
    ${hist.map(h => `
    <div style="background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #e2e8f0;cursor:pointer" onclick="this.closest('div[style]').remove();dpcSelecionarColab('${h.colab}')">
      <div style="font-size:13px;font-weight:700">${DPC_TIPOS[h.tipo]?.icon} ${DPC_TIPOS[h.tipo]?.label} — ${h.colab}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${new Date(h.em).toLocaleString('pt-BR')} · Líquido: ${PFmt?.moeda?.(h.resultado?.liquido)||'—'}</div>
    </div>`).join('')}
  </div>
</div>`;
  document.body.appendChild(ov);
};

window.dpcAbrirWizardRescisao = function() {
  if (_dpcState.colaborador) DPWizardRescisao.abrir(_dpcState.colaborador);
  else Toast?.aviso('Selecione um colaborador primeiro.');
};

window.dpcCalculoMassa = function() {
  navigateTo?.('dp-massa');
  setTimeout(() => {
    if (typeof renderDPMassa === 'function') {
      document.getElementById('pageContainer').innerHTML = renderDPMassa();
    }
  }, 100);
};

function initPage_dpc() {
  _dpcState = { colaborador: null, tipo: null, resultado: null, calculando: false, historico: [] };
}
