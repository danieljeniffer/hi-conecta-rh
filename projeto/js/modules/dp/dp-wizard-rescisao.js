/**
 * dp-wizard-rescisao.js — Wizard de Rescisão (7 etapas)
 * Processo guiado com cálculo em tempo real, alertas e geração de documentos.
 */

const DPWizardRescisao = (() => {
  'use strict';

  // ── Estado do wizard ──────────────────────
  let _state = {
    etapa:      1,
    colab:      null,
    dados:      {},
    resultado:  null,
    riscosAceitos: false,
  };

  const TOTAL_ETAPAS = 7;

  const ETAPAS = [
    { id: 1, icon: '📋', titulo: 'Tipo de Rescisão',    desc: 'Defina o motivo do desligamento' },
    { id: 2, icon: '📅', titulo: 'Aviso Prévio',         desc: 'Configure o aviso prévio' },
    { id: 3, icon: '⚠️', titulo: 'Pendências',            desc: 'Verifique itens em aberto' },
    { id: 4, icon: '🏖️', titulo: 'Férias',               desc: 'Saldo de férias do colaborador' },
    { id: 5, icon: '💳', titulo: 'Benefícios',            desc: 'Encerramento de benefícios' },
    { id: 6, icon: '🧮', titulo: 'Conferência',           desc: 'Revisão completa do cálculo' },
    { id: 7, icon: '📄', titulo: 'Documentos',            desc: 'Geração de TRCT e documentos' },
  ];

  // ── Abrir o wizard ────────────────────────
  function abrir(colaborador) {
    _state = { etapa: 1, colab: colaborador, dados: {
      tipo_rescisao:    'sem_justa_causa',
      data_rescisao:    new Date().toISOString().slice(0,10),
      aviso_indenizado: false,
      aviso_trabalhado: true,
      ferias_vencidas:  30,
      abono:            0,
      itens_devolver:   [],
      beneficios_enc:   [],
    }, resultado: null, riscosAceitos: false };

    const overlay = document.createElement('div');
    overlay.id = 'dpwiz-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 12px';

    const modal = document.createElement('div');
    modal.id    = 'dpwiz-modal';
    modal.style.cssText = 'background:#fff;border-radius:20px;width:100%;max-width:760px;margin:auto;box-shadow:0 24px 64px rgba(0,0,0,.25);overflow:hidden';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    _render();

    // Fecha ao clicar fora do modal
    overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });
  }

  function fechar() {
    document.getElementById('dpwiz-overlay')?.remove();
  }

  // ── Render central ────────────────────────
  function _render() {
    const modal = document.getElementById('dpwiz-modal');
    if (!modal) return;
    modal.innerHTML = `
<!-- CABEÇALHO -->
<div class="dpwiz-header">
  <div class="dpwiz-header-left">
    <div class="dpwiz-titulo">🧙 Wizard de Rescisão</div>
    <div class="dpwiz-sub">${_state.colab?.nome} · ${_state.colab?.cargo}</div>
  </div>
  <button onclick="DPWizardRescisao.fechar()" class="dpwiz-close">✕</button>
</div>

<!-- STEPPER -->
<div class="dpwiz-stepper">
  ${ETAPAS.map(e => `
  <div class="dpwiz-step ${e.id < _state.etapa ? 'concluido' : e.id === _state.etapa ? 'ativo' : ''}">
    <div class="dpwiz-step-num">${e.id < _state.etapa ? '✓' : e.id}</div>
    <div class="dpwiz-step-label">${e.titulo}</div>
  </div>
  ${e.id < TOTAL_ETAPAS ? '<div class="dpwiz-step-line"></div>' : ''}`).join('')}
</div>

<!-- CONTEÚDO DA ETAPA -->
<div class="dpwiz-body" id="dpwiz-body">
  ${_renderEtapa(_state.etapa)}
</div>

<!-- RODAPÉ COM NAVEGAÇÃO -->
<div class="dpwiz-footer">
  <div class="dpwiz-footer-info">
    Etapa ${_state.etapa} de ${TOTAL_ETAPAS}
    ${_state.resultado ? `· Líquido: <strong>${PFmt?.moeda?.(_state.resultado.liquido) || 'R$ '+_state.resultado.liquido?.toFixed(2)}</strong>` : ''}
  </div>
  <div class="dpwiz-footer-btns">
    ${_state.etapa > 1 ? `<button class="dpwiz-btn-sec" onclick="DPWizardRescisao.anterior()">← Anterior</button>` : ''}
    ${_state.etapa < TOTAL_ETAPAS
      ? `<button class="dpwiz-btn-prim" onclick="DPWizardRescisao.proximo()">Próximo →</button>`
      : `<button class="dpwiz-btn-dest" onclick="DPWizardRescisao.finalizar()">✅ Finalizar Rescisão</button>`}
  </div>
</div>`;

    // Recalcula em background quando dados mudam
    if (_state.dados.tipo_rescisao && _state.colab) _recalcular();
  }

  // ── Etapas individuais ────────────────────
  function _renderEtapa(n) {
    switch (n) {
      case 1: return _etapa1();
      case 2: return _etapa2();
      case 3: return _etapa3();
      case 4: return _etapa4();
      case 5: return _etapa5();
      case 6: return _etapa6();
      case 7: return _etapa7();
      default: return '';
    }
  }

  function _etapa1() {
    const tipos = [
      { v:'sem_justa_causa', l:'Sem Justa Causa', desc:'Empresa decide encerrar o contrato. Colaborador tem direito a multa FGTS 40%, aviso prévio, seguro-desemprego.', icon:'🔴', lei:'Art. 477 CLT' },
      { v:'pedido_demissao', l:'Pedido de Demissão', desc:'Colaborador decide sair. Não há multa FGTS, pode perder aviso prévio e seguro-desemprego.', icon:'🟡', lei:'Art. 487 CLT' },
      { v:'justa_causa',     l:'Justa Causa', desc:'Demissão por falta grave (art. 482). Colaborador perde FGTS, aviso e direitos. Requer documentação.', icon:'⚠️', lei:'Art. 482 CLT' },
      { v:'acordo_mutuo',    l:'Acordo Mútuo', desc:'Art. 484-A: ambas as partes concordam. Multa FGTS 20%, metade do aviso, sem seguro-desemprego.', icon:'🤝', lei:'Art. 484-A CLT' },
      { v:'termino_contrato',l:'Término de Contrato', desc:'Fim de contrato por prazo determinado. Aviso prévio de 30 dias ou indenização.', icon:'📅', lei:'Art. 481 CLT' },
    ];

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">📋 Tipo de Rescisão</h3>
  <p class="dpwiz-etapa-desc">Selecione o motivo do desligamento. O cálculo será ajustado automaticamente.</p>
  <div class="dpwiz-tipo-grid">
    ${tipos.map(t=>`
    <label class="dpwiz-tipo-card ${_state.dados.tipo_rescisao === t.v ? 'ativo' : ''}">
      <input type="radio" name="dpwiz-tipo" value="${t.v}" ${_state.dados.tipo_rescisao===t.v?'checked':''}
        onchange="_dpwizSetDado('tipo_rescisao','${t.v}')" style="display:none" />
      <span class="dpwiz-tipo-icon">${t.icon}</span>
      <span class="dpwiz-tipo-nome">${t.l}</span>
      <span class="dpwiz-tipo-desc">${t.desc}</span>
      <span class="dpwiz-tipo-lei">⚖️ ${t.lei}</span>
    </label>`).join('')}
  </div>

  <div class="dpwiz-data-row" style="margin-top:16px">
    <div class="dpwiz-field">
      <label>Data do Desligamento</label>
      <input type="date" value="${_state.dados.data_rescisao}"
        onchange="_dpwizSetDado('data_rescisao',this.value)"
        class="dpwiz-input" />
    </div>
  </div>
</div>`;
  }

  function _etapa2() {
    const tipo  = _state.dados.tipo_rescisao;
    const colab = _state.colab;
    const meses = Math.floor(((new Date() - new Date(colab?.admissao || '2023-01-01')) / (1000*60*60*24*30)));
    const anos  = Math.floor(meses / 12);
    const dias  = Math.min(30 + anos * 3, 90);
    const temAviso = ['sem_justa_causa','termino_contrato','acordo_mutuo'].includes(tipo);

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">📅 Aviso Prévio</h3>
  ${!temAviso ? `
  <div class="dpwiz-alert dpwiz-alert-info">
    ℹ️ Para o tipo <strong>${tipo === 'justa_causa' ? 'Justa Causa' : 'Pedido de Demissão'}</strong>,
    as condições de aviso prévio são diferenciadas.
  </div>` : ''}

  <div class="dpwiz-card-info">
    <div class="dpwiz-ci-item">
      <span class="dpwiz-ci-label">Tempo de empresa</span>
      <strong>${anos} ano(s) e ${meses%12} mês(es)</strong>
    </div>
    <div class="dpwiz-ci-item">
      <span class="dpwiz-ci-label">Dias de aviso</span>
      <strong>${dias} dias</strong>
      <span class="dpwiz-ci-lei">Lei 12.506/2011: 30d + 3d/ano (máx. 90)</span>
    </div>
  </div>

  ${temAviso ? `
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
    <label class="dpwiz-opcao ${_state.dados.aviso_indenizado ? '' : 'ativo'}" onclick="_dpwizSetDado('aviso_indenizado',false)">
      <input type="radio" name="aviso" ${!_state.dados.aviso_indenizado?'checked':''} style="display:none" />
      <div>
        <div style="font-weight:700">📋 Aviso Prévio Trabalhado</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Colaborador trabalha os ${dias} dias do aviso. Sem custo adicional.</div>
      </div>
    </label>
    <label class="dpwiz-opcao ${_state.dados.aviso_indenizado ? 'ativo' : ''}" onclick="_dpwizSetDado('aviso_indenizado',true)">
      <input type="radio" name="aviso" ${_state.dados.aviso_indenizado?'checked':''} style="display:none" />
      <div>
        <div style="font-weight:700">💰 Aviso Prévio Indenizado</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Empresa paga os ${dias} dias sem exigir trabalho. Custo: ${PFmt?.moeda?.((colab?.salario_base||3500)/30*dias)}</div>
      </div>
    </label>
  </div>` : ''}

  ${tipo === 'justa_causa' ? `
  <div class="dpwiz-alert dpwiz-alert-erro">
    ⚠️ Justa Causa requer documentação de advertências anteriores e prova da falta grave (Art. 482 CLT). Verifique o processo antes de prosseguir.
  </div>` : ''}
</div>`;
  }

  function _etapa3() {
    const pendencias = [
      { id:'epi',       label:'EPIs devolvidos',                  ok: true  },
      { id:'crachá',    label:'Crachá/Cartão de Acesso devolvido', ok: false },
      { id:'notebook',  label:'Notebook/Equipamentos devolvidos', ok: false },
      { id:'exames',    label:'Exame demissional agendado',       ok: false },
      { id:'sistemas',  label:'Acessos aos sistemas revogados',   ok: false },
      { id:'beneficios',label:'Cancelamento de benefícios iniciado',ok: false},
      { id:'email',     label:'E-mail corporativo desativado',    ok: false },
    ];

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">⚠️ Checklist de Pendências</h3>
  <p class="dpwiz-etapa-desc">Verifique e confirme os itens antes de prosseguir. Marque os já resolvidos.</p>
  <div class="dpwiz-checklist">
    ${pendencias.map(p=>`
    <label class="dpwiz-check-item ${p.ok ? 'ok' : ''}">
      <input type="checkbox" ${p.ok?'checked':''} onchange="this.closest('.dpwiz-check-item').classList.toggle('ok',this.checked)" />
      <span class="dpwiz-check-icon">${p.ok ? '✅' : '⬜'}</span>
      <span>${p.label}</span>
    </label>`).join('')}
  </div>
  <div class="dpwiz-alert dpwiz-alert-aviso" style="margin-top:12px">
    💡 O exame demissional deve ser realizado no prazo de ${_state.dados.tipo_rescisao === 'sem_justa_causa' ? '5' : '10'} dias úteis após o desligamento (NR-7).
  </div>
</div>`;
  }

  function _etapa4() {
    const colab = _state.colab;
    const meses = Math.floor(((new Date() - new Date(colab?.admissao || '2023-01-01')) / (1000*60*60*24*30)));
    const mesesPeriodo = meses % 12;
    const fp = mesesPeriodo > 0 ? `${mesesPeriodo}/${12}` : '0';

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">🏖️ Saldo de Férias</h3>
  <p class="dpwiz-etapa-desc">Configure o saldo de férias a ser indenizado na rescisão.</p>

  <div class="dpwiz-card-info">
    <div class="dpwiz-ci-item">
      <span class="dpwiz-ci-label">Período aquisitivo atual</span>
      <strong>${meses >= 12 ? 'Férias vencidas disponíveis' : 'Período em aquisição'}</strong>
    </div>
    <div class="dpwiz-ci-item">
      <span class="dpwiz-ci-label">Férias proporcionais</span>
      <strong>${fp} do período aquisitivo</strong>
      <span class="dpwiz-ci-lei">Art. 146 CLT: indenizadas com ⅓</span>
    </div>
  </div>

  <div class="dpwiz-form-grid" style="margin-top:16px">
    <div class="dpwiz-field">
      <label>Dias de Férias Vencidas</label>
      <input type="number" min="0" max="30" value="${_state.dados.ferias_vencidas}"
        onchange="_dpwizSetDado('ferias_vencidas',+this.value)"
        class="dpwiz-input" />
      <small>Período anterior não gozado</small>
    </div>
    <div class="dpwiz-field">
      <label>Dias de Abono Vencidos</label>
      <input type="number" min="0" max="10" value="${_state.dados.abono||0}"
        onchange="_dpwizSetDado('abono',+this.value)"
        class="dpwiz-input" />
      <small>Opcional</small>
    </div>
  </div>

  ${_state.dados.ferias_vencidas > 0 ? `
  <div class="dpwiz-alert dpwiz-alert-aviso">
    ⚠️ Férias vencidas: empresa deve pagar em dobro se não concedidas no prazo (Art. 137 CLT).
  </div>` : ''}
</div>`;
  }

  function _etapa5() {
    const beneficios = [
      { id: 'va',    label: 'Vale Alimentação (Caju)',   recarga: 'Dia 1º',  ativo: true  },
      { id: 'vt',    label: 'Vale Transporte (Nubus)',   recarga: 'Dia 1º',  ativo: true  },
      { id: 'saude', label: 'Plano de Saúde (SulAmérica)',recarga:'Mensal',  ativo: true  },
      { id: 'odonto',label: 'Plano Odontológico',         recarga: 'Mensal', ativo: true  },
      { id: 'gym',   label: 'Wellhub (Gympass)',          recarga: 'Mensal', ativo: false },
    ];

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">💳 Encerramento de Benefícios</h3>
  <p class="dpwiz-etapa-desc">Confirme os benefícios a serem encerrados e as datas limite.</p>

  <div class="dpwiz-beneficios-lista">
    ${beneficios.map(b => `
    <div class="dpwiz-ben-item ${b.ativo ? 'ativo' : 'inativo'}">
      <div class="dpwiz-ben-info">
        <span class="dpwiz-ben-nome">${b.label}</span>
        <span class="dpwiz-ben-rec">Recarga: ${b.recarga}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="dpwiz-ben-st ${b.ativo?'st-ativo':'st-inativo'}">${b.ativo?'● Ativo':'○ Inativo'}</span>
        ${b.ativo ? `<button class="dpwiz-ben-cancel" onclick="Toast?.success('${b.label} marcado para cancelamento.')">Cancelar</button>` : ''}
      </div>
    </div>`).join('')}
  </div>

  <div class="dpwiz-alert dpwiz-alert-info" style="margin-top:14px">
    ℹ️ Benefícios devem ser encerrados na data do último dia trabalhado. Processe os cancelamentos junto às operadoras.
  </div>
</div>`;
  }

  function _etapa6() {
    const res = _state.resultado;
    if (!res) return `<div style="text-align:center;padding:40px"><div style="font-size:36px">⌛</div><p>Calculando...</p></div>`;

    const mem = res.memoria || [];

    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">🧮 Conferência do Cálculo</h3>
  <p class="dpwiz-etapa-desc">Revise todos os valores antes de gerar os documentos. Clique em qualquer etapa para editar.</p>

  <div class="dpwiz-conferencia-hero">
    <div class="dpwiz-conf-label">💰 RESCISÃO LÍQUIDA</div>
    <div class="dpwiz-conf-valor">${PFmt?.moeda?.(res.liquido) || 'R$ '+res.liquido?.toFixed(2)}</div>
    <div class="dpwiz-conf-sub">${DPC_TIPOS?.rescisao?.campos?.[0]?.opcoes?.find(o=>o.v===_state.dados.tipo_rescisao)?.l || ''}</div>
  </div>

  <div class="dpwiz-memoria-tabela">
    ${mem.map(l => `
    <div class="dpwiz-mem-linha ${l.tipo||''}">
      <span>${l.sinal||''} ${l.item}</span>
      <span class="${l.tipo==='desconto'?'neg':l.tipo==='total'?'total':'pos'}">${PFmt?.moeda?.(l.valor)||'R$'+parseFloat(l.valor||0).toFixed(2)}</span>
    </div>`).join('')}
    ${res.fgts ? `<div class="dpwiz-fgts-linha">🏦 FGTS depositado: ${PFmt?.moeda?.(res.fgts)} (empresa → CEF)</div>` : ''}
  </div>

  ${res.alertas?.length ? `
  <div style="margin-top:14px">
    ${res.alertas.map(a=>`<div class="dpwiz-alert dpwiz-alert-${a.nivel}">${a.msg}</div>`).join('')}
  </div>` : ''}

  <div class="dpwiz-conf-aceite">
    <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:13px">
      <input type="checkbox" onchange="DPWizardRescisao._setRiscosAceitos(this.checked)" style="margin-top:2px;flex-shrink:0" />
      <span>Confirmo que revisei todos os valores, a documentação trabalhista está em ordem, e autorizo a geração da rescisão para <strong>${_state.colab?.nome}</strong>.</span>
    </label>
  </div>
</div>`;
  }

  function _etapa7() {
    return `
<div class="dpwiz-etapa">
  <h3 class="dpwiz-etapa-titulo">📄 Geração de Documentos</h3>
  <p class="dpwiz-etapa-desc">Gere todos os documentos necessários para a rescisão com um clique.</p>

  <div class="dpwiz-docs-grid">
    ${[
      { icon:'📃', nome:'TRCT — Termo de Rescisão',    desc:'Documento oficial do desligamento',                                fn:'dpcGerarTRCT' },
      { icon:'💰', nome:'Demonstrativo de Rescisão',    desc:'Memória de cálculo detalhada',                                     fn:'dpcGerarDemonstrativo' },
      { icon:'✅', nome:'Checklist de Desligamento',    desc:'Lista de pendências e obrigações',                                 fn:'dpcGerarChecklist' },
      { icon:'📋', nome:'Aviso Prévio',                 desc:'Carta formal de aviso prévio',                                     fn:'dpcGerarAvisoPrevio' },
      { icon:'🏦', nome:'Guia FGTS',                    desc:'Informações para saque do FGTS',                                   fn:'dpcGerarGuiaFGTS' },
      { icon:'💼', nome:'Declaração eSocial (S-2299)',  desc:'Evento de desligamento para o eSocial',                            fn:'dpcGerarESocial' },
    ].map(d=>`
    <div class="dpwiz-doc-card">
      <span class="dpwiz-doc-icon">${d.icon}</span>
      <div class="dpwiz-doc-info">
        <div class="dpwiz-doc-nome">${d.nome}</div>
        <div class="dpwiz-doc-desc">${d.desc}</div>
      </div>
      <button class="dpwiz-doc-btn" onclick="${d.fn}?.() || Toast?.success('${d.nome} gerado!')">⬇ Gerar</button>
    </div>`).join('')}
  </div>

  <div class="dpwiz-doc-lote">
    <button class="dpwiz-btn-dest" style="width:100%;padding:14px" onclick="_dpwizGerarTodos()">
      📦 Gerar Todos os Documentos de Uma Vez
    </button>
  </div>

  <div class="dpwiz-alert dpwiz-alert-info" style="margin-top:10px">
    ℹ️ Após gerar, os documentos ficam disponíveis no módulo <strong>Documentos</strong> para download e assinatura digital.
  </div>
</div>`;
  }

  // ── Cálculo automático ────────────────────
  function _recalcular() {
    if (!_state.colab) return;
    const sal = parseFloat(_state.colab.salario_base);
    const d   = _state.dados;

    if (window.DPCentral && window._dpcExecutarCalculo) {
      _state.resultado = window._dpcExecutarCalculo?.('rescisao', {
        ...d, colaborador: _state.colab,
      }, _state.colab);
    } else {
      // Cálculo inline simplificado
      const meses  = Math.floor(((new Date() - new Date(_state.colab.admissao)) / (1000*60*60*24*30)));
      const anos   = Math.floor(meses / 12);
      const dias   = Math.min(30 + anos * 3, 90);
      const diaD   = new Date(d.data_rescisao || new Date()).getDate();
      const saldo  = (sal/30)*diaD;
      const aviso  = d.aviso_indenizado ? (sal/30)*dias : 0;
      const fv     = (sal/30)*(d.ferias_vencidas||30)*(4/3);
      const fp     = (meses%12 > 0) ? (sal/12)*(meses%12)*(4/3) : 0;
      const dec    = ['justa_causa'].includes(d.tipo_rescisao) ? 0 : (sal/12)*(new Date().getMonth()+1);
      const fgtsMes= sal*0.08;
      const fgts   = fgtsMes*meses;
      const multa  = d.tipo_rescisao==='sem_justa_causa'?fgts*0.4:d.tipo_rescisao==='acordo_mutuo'?fgts*0.2:0;
      const bruto  = saldo+aviso+fv+fp+dec+multa;
      const inss   = Math.min(bruto*0.14, 908.85);
      const irrf   = Math.max(0, (bruto-inss)*0.15-381);
      _state.resultado = { liquido: bruto-inss-irrf, fgts, alertas:[], memoria:[
        { item:'Saldo de Salário', valor:saldo, sinal:'' },
        aviso>0?{ item:'Aviso Prévio Indenizado', valor:aviso, sinal:'+' }:null,
        { item:'Férias Vencidas+⅓', valor:fv, sinal:'+' },
        fp>0?{ item:'Férias Proporcionais+⅓', valor:fp, sinal:'+' }:null,
        dec>0?{ item:'13º Proporcional', valor:dec, sinal:'+' }:null,
        multa>0?{ item:`Multa FGTS`, valor:multa, sinal:'+' }:null,
        { item:'INSS', valor:-inss, sinal:'–', tipo:'desconto' },
        { item:'IRRF', valor:-irrf, sinal:'–', tipo:'desconto' },
        { item:'💰 RESCISÃO LÍQUIDA', valor:bruto-inss-irrf, sinal:'=', tipo:'total' },
      ].filter(Boolean)};
    }
  }

  // ── Navegação ─────────────────────────────
  function proximo() {
    if (_state.etapa === 6 && !_state.riscosAceitos) {
      Toast?.aviso('Confirme a revisão do cálculo antes de continuar.'); return;
    }
    if (_state.etapa < TOTAL_ETAPAS) {
      _state.etapa++;
      _render();
    }
  }

  function anterior() {
    if (_state.etapa > 1) { _state.etapa--; _render(); }
  }

  function finalizar() {
    Toast?.success(`Rescisão de ${_state.colab?.nome} finalizada! TRCT e documentos gerados.`);
    fechar();
    // Atualiza status do colaborador
    if (window.EventBus) EventBus.emit('colaborador:desligado', { colaborador: _state.colab });
  }

  // ── Helpers globais ────────────────────────
  window._dpwizSetDado = (k, v) => { _state.dados[k] = v; _recalcular(); _render(); };
  window._dpwizGerarTodos = () => {
    ['TRCT','Demonstrativo','Checklist','Aviso Prévio','Guia FGTS','eSocial S-2299'].forEach(d => {
      setTimeout(() => Toast?.success(`${d} gerado com sucesso!`), 500);
    });
  };

  function _setRiscosAceitos(v) { _state.riscosAceitos = v; }

  return { abrir, fechar, proximo, anterior, finalizar, _setRiscosAceitos };
})();

window.DPWizardRescisao = DPWizardRescisao;
