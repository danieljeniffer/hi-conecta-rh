/**
 * dp-admissao.js — Cadastro Inteligente de Colaborador
 * Motor de Automação Completo · hi Conecta RH
 * Expõe: window.DPAdmissao
 */
window.DPAdmissao = (() => {

  // ─── CONFIGURAÇÃO ────────────────────────────────────────────
  const ETAPAS = [
    { id: 1, label: 'Dados Pessoais',  icon: '👤' },
    { id: 2, label: 'Filiação',         icon: '👨‍👩‍👧' },
    { id: 3, label: 'Endereço',         icon: '📍' },
    { id: 4, label: 'Dados Bancários', icon: '🏦' },
    { id: 5, label: 'Contrato',        icon: '📋' },
    { id: 6, label: 'Operacional',     icon: '⚙️' },
    { id: 7, label: 'Documentos',      icon: '📎' },
  ];

  const AUTOMACOES = [
    { id: 'ambiente',   icon: '📁', label: 'Criando ambiente digital do colaborador',   det: 'Estrutura de pastas e arquivos configurada' },
    { id: 'ficha',      icon: '📄', label: 'Gerando ficha de registro',                 det: 'Ficha de registro CLT/eSocial gerada' },
    { id: 'contrato',   icon: '📝', label: 'Gerando contrato de trabalho',              det: 'Contrato assinável criado automaticamente' },
    { id: 'termos',     icon: '📃', label: 'Emitindo termos obrigatórios',              det: 'Confidencialidade, EPI e LGPD preparados' },
    { id: 'agenda',     icon: '📅', label: 'Criando agenda admissional',                det: 'Exame médico, integração e entrega de docs agendados' },
    { id: 'tarefas',    icon: '✅', label: 'Gerando tarefas automáticas',              det: 'Tarefas criadas para RH e gestor responsável' },
    { id: 'epi',        icon: '🦺', label: 'Configurando ficha de EPI',                det: 'Itens obrigatórios listados, controle de entrega ativo', condicional: 'usa_epi' },
    { id: 'ponto',      icon: '🕒', label: 'Registrando no controle de ponto',         det: 'Jornada e horários configurados no sistema' },
    { id: 'folha',      icon: '💰', label: 'Preparando folha de pagamento',             det: 'Salário, INSS, IRRF e benefícios calculados' },
    { id: 'beneficios', icon: '💳', label: 'Ativando pacote de benefícios',            det: 'VT, VA/VR e plano de saúde configurados' },
    { id: 'timeline',   icon: '📈', label: 'Criando linha do tempo do colaborador',    det: 'Admissão, experiência e marcos registrados' },
    { id: 'modulos',    icon: '🔗', label: 'Conectando a todos os módulos',            det: 'Documentos, DP, Treinamentos e Folha integrados' },
    { id: 'dashboard',  icon: '📊', label: 'Atualizando indicadores do dashboard',     det: 'Admissões, headcount e métricas de RH atualizados' },
    { id: 'esocial',    icon: '🇧🇷', label: 'Preparando envio para o eSocial',         det: 'Evento S-2200 gerado — aguardando transmissão' },
  ];

  const BANCOS = [
    { c: '001', n: 'Banco do Brasil'           }, { c: '033', n: 'Santander'           },
    { c: '077', n: 'Banco Inter'               }, { c: '104', n: 'Caixa Econômica'     },
    { c: '237', n: 'Bradesco'                  }, { c: '260', n: 'Nubank'               },
    { c: '290', n: 'PagSeguro'                 }, { c: '336', n: 'C6 Bank'              },
    { c: '341', n: 'Itaú'                      }, { c: '380', n: 'PicPay'               },
    { c: '422', n: 'Safra'                     }, { c: '748', n: 'Sicredi'              },
    { c: '756', n: 'Sicoob'                    },
  ];

  const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  // ─── ESTADO ──────────────────────────────────────────────────
  let state = {
    etapa: 1,
    dados: {},
    dependentes: [],
    documentos: {},
    processando: false,
    _container: null,
  };

  function resetState() {
    state = {
      etapa: 1,
      dados: { data_admissao: new Date().toISOString().split('T')[0], tipo_contrato: 'CLT', jornada: '44', turno: 'comercial', horario_entrada: '08:00', horario_saida: '18:00', intervalo: '01:00', tipo_conta: 'corrente', qtd_dependentes_irrf: 0, nacionalidade: 'Brasileiro(a)' },
      dependentes: [],
      documentos: {},
      processando: false,
      _container: state._container,
    };
  }

  // ─── PONTO DE ENTRADA ────────────────────────────────────────
  function render(container) {
    state._container = container;
    resetState();
    _registerGlobals();
    container.innerHTML = _html();
    _attachEvents();
  }

  // ─── HTML RAIZ ───────────────────────────────────────────────
  function _html() {
    return `
<div class="dpa-root" id="dpa-root">
  ${_stepper()}
  <div class="dpa-body" id="dpa-body">${_etapaHTML(1)}</div>
  <div class="dpa-footer" id="dpa-footer">${_navHTML()}</div>
</div>`;
  }

  // ─── STEPPER ─────────────────────────────────────────────────
  function _stepper() {
    return `
<div class="dpa-stepper" id="dpa-stepper">
  ${ETAPAS.map(e => `
    <div class="dpa-step ${state.etapa === e.id ? 'active' : ''} ${state.etapa > e.id ? 'done' : ''}" title="${e.label}">
      <div class="dpa-step-circle">${state.etapa > e.id ? '✓' : e.id}</div>
      <span class="dpa-step-label">${e.label}</span>
    </div>
    ${e.id < ETAPAS.length ? '<div class="dpa-step-line"></div>' : ''}`).join('')}
</div>`;
  }

  // ─── NAVEGAÇÃO ───────────────────────────────────────────────
  function _navHTML() {
    const isFirst = state.etapa === 1;
    const isLast  = state.etapa === ETAPAS.length;
    const pct     = Math.round((state.etapa / ETAPAS.length) * 100);
    return `
<div class="dpa-nav-inner">
  <div class="dpa-nav-left">
    <span class="dpa-nav-label">Etapa ${state.etapa} de ${ETAPAS.length}</span>
    <div class="dpa-nav-bar"><div class="dpa-nav-fill" style="width:${pct}%"></div></div>
  </div>
  <div class="dpa-nav-btns">
    ${!isFirst ? `<button class="dp-btn dp-btn-secondary dpa-btn-ant" id="dpa-ant">← Anterior</button>` : '<div></div>'}
    ${isLast
      ? `<button class="dp-btn dpa-btn-finish" id="dpa-fin"><span class="dpa-rocket">🚀</span> Finalizar Admissão</button>`
      : `<button class="dp-btn dpa-btn-prox" id="dpa-prox">Próximo →</button>`}
  </div>
</div>`;
  }

  // ─── ETAPAS ──────────────────────────────────────────────────
  function _etapaHTML(n) {
    const map = { 1: _e1, 2: _e2, 3: _e3, 4: _e4, 5: _e5, 6: _e6, 7: _e7 };
    return map[n] ? map[n]() : '';
  }

  function _header(icon, titulo, sub) {
    return `<div class="dpa-section-hd"><span class="dpa-section-icon">${icon}</span><div><h3>${titulo}</h3><p>${sub}</p></div></div>`;
  }
  function _divider(txt) {
    return `<div class="dpa-divider"><span>${txt}</span></div>`;
  }
  function _field(label, input, span = '') {
    return `<div class="dp-field ${span}"><label>${label}</label>${input}</div>`;
  }
  function _sel(name, opts, cur, placeholder = 'Selecione') {
    return `<select name="${name}"><option value="">${placeholder}</option>${opts.map(o =>
      `<option value="${o.v}" ${cur === o.v ? 'selected' : ''}>${o.l}</option>`).join('')}</select>`;
  }
  function _inp(name, type, val, placeholder = '', extra = '') {
    return `<input type="${type}" name="${name}" value="${val || ''}" placeholder="${placeholder}" ${extra} />`;
  }

  // ETAPA 1 — Dados Pessoais
  function _e1() {
    const d = state.dados;
    return `
<div class="dpa-etapa" data-etapa="1">
  ${_header('👤', 'Dados Pessoais', 'Identificação e documentos do colaborador')}
  <div class="dp-form-grid">
    ${_field('Nome Completo <span class="dpa-req">*</span>',   _inp('nome_completo','text',d.nome_completo,'Nome conforme documento oficial'), 'dp-field-full')}
    ${_field('CPF <span class="dpa-req">*</span>',             _inp('cpf','text',d.cpf,'000.000.000-00','maxlength="14"'))}
    ${_field('Data de Nascimento <span class="dpa-req">*</span>', _inp('data_nascimento','date',d.data_nascimento))}
    ${_field('Gênero', _sel('genero',[{v:'M',l:'Masculino'},{v:'F',l:'Feminino'},{v:'NB',l:'Não binário'},{v:'NI',l:'Prefiro não informar'}],d.genero))}
    ${_field('Estado Civil', _sel('estado_civil',[{v:'solteiro',l:'Solteiro(a)'},{v:'casado',l:'Casado(a)'},{v:'divorciado',l:'Divorciado(a)'},{v:'viuvo',l:'Viúvo(a)'},{v:'uniao_estavel',l:'União Estável'}],d.estado_civil))}
    ${_field('Nacionalidade', _inp('nacionalidade','text',d.nacionalidade||'Brasileiro(a)'))}
    ${_field('Naturalidade (Cidade/UF)', _inp('naturalidade','text',d.naturalidade,'Ex: João Pessoa/PB'))}
  </div>
  ${_divider('Documentos de Identificação')}
  <div class="dp-form-grid">
    ${_field('RG',              _inp('rg','text',d.rg,'0000000'))}
    ${_field('Órgão Emissor',   _inp('rg_orgao','text',d.rg_orgao,'SSP/PB'))}
    ${_field('Emissão RG',      _inp('rg_data','date',d.rg_data))}
    ${_field('PIS/PASEP',       _inp('pis_pasep','text',d.pis_pasep,'000.00000.00-0'))}
    ${_field('CTPS (Nº)',       _inp('ctps','text',d.ctps,'Número'))}
    ${_field('CTPS Série',      _inp('ctps_serie','text',d.ctps_serie,'00000'))}
    ${_field('CNH (Nº)',        _inp('cnh','text',d.cnh,'Nº do documento'))}
    ${_field('Categoria CNH',   _sel('cnh_categoria',[{v:'A',l:'A'},{v:'B',l:'B'},{v:'AB',l:'AB'},{v:'C',l:'C'},{v:'D',l:'D'},{v:'E',l:'E'}],d.cnh_categoria,'Não possui'))}
    ${_field('Validade CNH',    _inp('cnh_validade','date',d.cnh_validade))}
  </div>
  ${_divider('Contato')}
  <div class="dp-form-grid">
    ${_field('E-mail Pessoal <span class="dpa-req">*</span>',   _inp('email','email',d.email,'colaborador@email.com'))}
    ${_field('E-mail Corporativo', _inp('email_corp','email',d.email_corp,'nome@empresa.com.br'))}
    ${_field('Celular <span class="dpa-req">*</span>',          _inp('celular','tel',d.celular,'(83) 9 0000-0000'))}
    ${_field('Telefone Fixo',  _inp('telefone','tel',d.telefone,'(83) 0000-0000'))}
  </div>
</div>`;
  }

  // ETAPA 2 — Filiação e Dependentes
  function _e2() {
    const d = state.dados;
    return `
<div class="dpa-etapa" data-etapa="2">
  ${_header('👨‍👩‍👧', 'Filiação e Dependentes', 'Dados familiares para benefícios e IRRF')}
  <div class="dp-form-grid">
    ${_field('Nome da Mãe <span class="dpa-req">*</span>', _inp('nome_mae','text',d.nome_mae,'Nome completo da mãe'), 'dp-field-full')}
    ${_field('Nome do Pai',                                _inp('nome_pai','text',d.nome_pai,'Nome completo do pai'), 'dp-field-full')}
  </div>
  ${_divider('Dependentes')}
  <div id="dpa-dep-lista">
    ${_renderDependentesLista()}
  </div>
  <button class="dp-btn dp-btn-secondary dpa-btn-add-dep" id="dpa-add-dep">+ Adicionar Dependente</button>
</div>`;
  }

  function _renderDependentesLista() {
    if (state.dependentes.length === 0) return `
      <div class="dpa-empty-state">
        <span>👨‍👩‍👧</span>
        <p>Nenhum dependente cadastrado</p>
        <small>Adicione dependentes para cálculo de benefícios e dedução de IRRF</small>
      </div>`;
    return state.dependentes.map((dep, i) => `
      <div class="dpa-dep-card" data-idx="${i}">
        <div class="dpa-dep-card-hd">
          <strong>${dep.nome || ('Dependente ' + (i + 1))}</strong>
          <span class="dpa-dep-badge">${dep.parentesco || 'parentesco não definido'}</span>
          <button class="dpa-dep-remove" onclick="dpaRemoverDep(${i})">✕</button>
        </div>
        <div class="dp-form-grid" style="margin-top:10px">
          <div class="dp-field dp-field-full">
            <label>Nome Completo</label>
            <input type="text" value="${dep.nome||''}" placeholder="Nome do dependente" oninput="dpaAtualizarDep(${i},'nome',this.value)" />
          </div>
          <div class="dp-field">
            <label>Data de Nascimento</label>
            <input type="date" value="${dep.data_nascimento||''}" onchange="dpaAtualizarDep(${i},'data_nascimento',this.value)" />
          </div>
          <div class="dp-field">
            <label>CPF</label>
            <input type="text" value="${dep.cpf||''}" placeholder="000.000.000-00" oninput="dpaAtualizarDep(${i},'cpf',this.value)" />
          </div>
          <div class="dp-field">
            <label>Parentesco</label>
            <select onchange="dpaAtualizarDep(${i},'parentesco',this.value)">
              <option value="">Selecione</option>
              <option value="conjuge"  ${dep.parentesco==='conjuge'?'selected':''}>Cônjuge</option>
              <option value="filho"    ${dep.parentesco==='filho'?'selected':''}>Filho(a)</option>
              <option value="enteado"  ${dep.parentesco==='enteado'?'selected':''}>Enteado(a)</option>
              <option value="pai_mae"  ${dep.parentesco==='pai_mae'?'selected':''}>Pai / Mãe</option>
              <option value="outro"    ${dep.parentesco==='outro'?'selected':''}>Outro</option>
            </select>
          </div>
          <div class="dp-field">
            <label>Dedução IRRF</label>
            <select onchange="dpaAtualizarDep(${i},'dep_irrf',this.value==='1')">
              <option value="1" ${dep.dep_irrf?'selected':''}>Sim</option>
              <option value="0" ${!dep.dep_irrf?'selected':''}>Não</option>
            </select>
          </div>
          <div class="dp-field">
            <label>Plano de Saúde</label>
            <select onchange="dpaAtualizarDep(${i},'dep_plano',this.value==='1')">
              <option value="1" ${dep.dep_plano?'selected':''}>Sim</option>
              <option value="0" ${!dep.dep_plano?'selected':''}>Não</option>
            </select>
          </div>
        </div>
      </div>`).join('');
  }

  // ETAPA 3 — Endereço
  function _e3() {
    const d = state.dados;
    return `
<div class="dpa-etapa" data-etapa="3">
  ${_header('📍', 'Endereço', 'Endereço residencial do colaborador')}
  <div class="dp-form-grid">
    <div class="dp-field">
      <label>CEP <span class="dpa-req">*</span></label>
      <div class="dpa-input-row">
        <input type="text" name="cep" id="dpa-cep" value="${d.cep||''}" placeholder="00000-000" maxlength="9" />
        <button class="dp-btn dp-btn-sm" onclick="dpaBuscarCep()">Buscar</button>
      </div>
    </div>
    ${_field('Logradouro <span class="dpa-req">*</span>', `<input type="text" name="logradouro" id="dpa-logradouro" value="${d.logradouro||''}" placeholder="Rua, Avenida, Travessa..." />`, 'dp-field-full')}
    ${_field('Número <span class="dpa-req">*</span>', _inp('numero','text',d.numero,'Nº'))}
    ${_field('Complemento', _inp('complemento','text',d.complemento,'Apto, Bloco, Casa...'))}
    ${_field('Bairro <span class="dpa-req">*</span>', `<input type="text" name="bairro" id="dpa-bairro" value="${d.bairro||''}" />`)}
    ${_field('Cidade <span class="dpa-req">*</span>', `<input type="text" name="cidade" id="dpa-cidade" value="${d.cidade||''}" />`)}
    <div class="dp-field">
      <label>Estado <span class="dpa-req">*</span></label>
      <select name="estado" id="dpa-estado">
        <option value="">UF</option>
        ${UFS.map(uf => `<option value="${uf}" ${d.estado === uf ? 'selected' : ''}>${uf}</option>`).join('')}
      </select>
    </div>
  </div>
</div>`;
  }

  // ETAPA 4 — Dados Bancários
  function _e4() {
    const d = state.dados;
    return `
<div class="dpa-etapa" data-etapa="4">
  ${_header('🏦', 'Dados Bancários', 'Conta para crédito de salário e benefícios')}
  <div class="dp-form-grid">
    <div class="dp-field dp-field-full">
      <label>Banco <span class="dpa-req">*</span></label>
      <select name="banco">
        <option value="">Selecione o banco</option>
        ${BANCOS.map(b => `<option value="${b.c}" ${d.banco === b.c ? 'selected' : ''}>${b.c} — ${b.n}</option>`).join('')}
      </select>
    </div>
    ${_field('Agência <span class="dpa-req">*</span>', _inp('agencia','text',d.agencia,'0000'))}
    ${_field('Conta <span class="dpa-req">*</span>',   _inp('conta','text',d.conta,'00000'))}
    ${_field('Dígito',                                 _inp('digito','text',d.digito,'0','maxlength="2"'))}
    <div class="dp-field">
      <label>Tipo de Conta <span class="dpa-req">*</span></label>
      <select name="tipo_conta">
        <option value="corrente" ${d.tipo_conta==='corrente'?'selected':''}>Conta Corrente</option>
        <option value="poupanca" ${d.tipo_conta==='poupanca'?'selected':''}>Conta Poupança</option>
        <option value="salario"  ${d.tipo_conta==='salario'?'selected':''}>Conta Salário</option>
      </select>
    </div>
  </div>
  ${_divider('Chave PIX')}
  <div class="dp-form-grid">
    <div class="dp-field">
      <label>Tipo de Chave PIX</label>
      <select name="pix_tipo" id="dpa-pix-tipo" onchange="dpaTogglePix(this.value)">
        <option value="">Não informar</option>
        <option value="cpf"       ${d.pix_tipo==='cpf'?'selected':''}>CPF</option>
        <option value="email"     ${d.pix_tipo==='email'?'selected':''}>E-mail</option>
        <option value="celular"   ${d.pix_tipo==='celular'?'selected':''}>Celular</option>
        <option value="aleatoria" ${d.pix_tipo==='aleatoria'?'selected':''}>Chave Aleatória</option>
      </select>
    </div>
    <div class="dp-field dp-field-full" id="dpa-pix-campo" style="${d.pix_tipo ? '' : 'display:none'}">
      <label>Chave PIX</label>
      <input type="text" name="pix_chave" value="${d.pix_chave||''}" placeholder="Informe a chave PIX" />
    </div>
  </div>
  <div class="dpa-info-box">
    <span>ℹ️</span>
    <p>Os dados bancários são usados para crédito de salário, 13º, férias e benefícios. Confira cuidadosamente antes de avançar.</p>
  </div>
</div>`;
  }

  // ETAPA 5 — Dados Contratuais
  function _e5() {
    const d = state.dados;
    const mostrarFim = ['CLT_EXPERIENCIA','TEMPORARIO','ESTAGIO'].includes(d.tipo_contrato);
    return `
<div class="dpa-etapa" data-etapa="5">
  ${_header('📋', 'Dados Contratuais', 'Vínculo empregatício, cargo e remuneração')}
  <div class="dp-form-grid">
    <div class="dp-field dp-field-full">
      <label>Cargo <span class="dpa-req">*</span></label>
      <input type="text" name="cargo" value="${d.cargo||''}" list="dpa-cargos-list" placeholder="Digite ou selecione o cargo" />
      <datalist id="dpa-cargos-list">
        ${['Analista de RH','Assistente Administrativo','Assistente de DP','Coordenador','Desenvolvedor','Diretor','Estagiário','Gerente','Motorista','Operador','Recepcionista','Supervisor','Técnico','Vendedor'].map(c=>`<option value="${c}">`).join('')}
      </datalist>
    </div>
    <div class="dp-field dp-field-full">
      <label>Setor / Departamento <span class="dpa-req">*</span></label>
      ${_sel('setor',[{v:'Administrativo',l:'Administrativo'},{v:'Comercial',l:'Comercial'},{v:'Financeiro',l:'Financeiro'},{v:'Jurídico',l:'Jurídico'},{v:'Logística',l:'Logística'},{v:'Marketing',l:'Marketing'},{v:'Operacional',l:'Operacional'},{v:'Produção',l:'Produção'},{v:'RH',l:'RH / DP'},{v:'TI',l:'TI'}],d.setor)}
    </div>
    <div class="dp-field">
      <label>Tipo de Contrato <span class="dpa-req">*</span></label>
      <select name="tipo_contrato" id="dpa-tipo-contrato" onchange="dpaTipoContrato(this.value)">
        <option value="CLT"             ${d.tipo_contrato==='CLT'?'selected':''}>CLT — Efetivo</option>
        <option value="CLT_EXPERIENCIA" ${d.tipo_contrato==='CLT_EXPERIENCIA'?'selected':''}>CLT — Experiência</option>
        <option value="PJ"              ${d.tipo_contrato==='PJ'?'selected':''}>Pessoa Jurídica (PJ)</option>
        <option value="ESTAGIO"         ${d.tipo_contrato==='ESTAGIO'?'selected':''}>Estágio</option>
        <option value="TEMPORARIO"      ${d.tipo_contrato==='TEMPORARIO'?'selected':''}>Temporário</option>
        <option value="APRENDIZ"        ${d.tipo_contrato==='APRENDIZ'?'selected':''}>Jovem Aprendiz</option>
      </select>
    </div>
    ${_field('Data de Admissão <span class="dpa-req">*</span>', _inp('data_admissao','date',d.data_admissao))}
    <div class="dp-field" id="dpa-fim-contrato" style="${mostrarFim ? '' : 'display:none'}">
      <label>Data de Término</label>
      ${_inp('data_fim_contrato','date',d.data_fim_contrato)}
    </div>
    <div class="dp-field">
      <label>Salário Base <span class="dpa-req">*</span></label>
      <div class="dpa-prefix-wrap"><span>R$</span><input type="text" name="salario_base" value="${d.salario_base||''}" placeholder="0,00" /></div>
    </div>
    ${_field('CBO (Código Brasileiro de Ocupações)', _inp('cbo','text',d.cbo,'0000-00'))}
  </div>
  ${_divider('Jornada de Trabalho')}
  <div class="dp-form-grid">
    <div class="dp-field">
      <label>Jornada Semanal <span class="dpa-req">*</span></label>
      <select name="jornada">
        <option value="44" ${d.jornada==='44'?'selected':''}>44h/semana — CLT padrão</option>
        <option value="40" ${d.jornada==='40'?'selected':''}>40h/semana</option>
        <option value="36" ${d.jornada==='36'?'selected':''}>36h/semana</option>
        <option value="30" ${d.jornada==='30'?'selected':''}>30h/semana</option>
        <option value="20" ${d.jornada==='20'?'selected':''}>20h/semana — Meio período</option>
      </select>
    </div>
    <div class="dp-field">
      <label>Turno</label>
      <select name="turno">
        <option value="comercial" ${d.turno==='comercial'?'selected':''}>Comercial (08h–18h)</option>
        <option value="manha"     ${d.turno==='manha'?'selected':''}>Manhã</option>
        <option value="tarde"     ${d.turno==='tarde'?'selected':''}>Tarde</option>
        <option value="noite"     ${d.turno==='noite'?'selected':''}>Noite</option>
        <option value="escala"    ${d.turno==='escala'?'selected':''}>Escala (12×36, 6×1...)</option>
      </select>
    </div>
    ${_field('Entrada',   _inp('horario_entrada','time',d.horario_entrada||'08:00'))}
    ${_field('Saída',     _inp('horario_saida','time',d.horario_saida||'18:00'))}
    ${_field('Intervalo', _inp('intervalo','time',d.intervalo||'01:00'))}
  </div>
</div>`;
  }

  // ETAPA 6 — Operacional
  function _e6() {
    const d = state.dados;
    function toggle(campo, icon, titulo, sub, cardId) {
      const on = !!d[campo];
      return `
      <label class="dpa-toggle-card ${on ? 'on' : ''}" id="${cardId}">
        <div class="dpa-tc-icon">${icon}</div>
        <div class="dpa-tc-info"><strong>${titulo}</strong><small>${sub}</small></div>
        <input type="checkbox" name="${campo}" ${on ? 'checked' : ''} onchange="dpaToggle('${campo}',this.checked,'${cardId}')" />
        <div class="dpa-tc-switch"></div>
      </label>`;
    }
    return `
<div class="dpa-etapa" data-etapa="6">
  ${_header('⚙️', 'Informações Operacionais', 'Condições de trabalho, benefícios e adicionais')}
  <div class="dp-form-grid">
    <div class="dp-field dp-field-full">
      <label>Local de Trabalho</label>
      <input type="text" name="local_trabalho" value="${d.local_trabalho||''}" placeholder="Unidade, filial ou endereço" />
    </div>
    <div class="dp-field">
      <label>Dependentes IRRF</label>
      <input type="number" name="qtd_dependentes_irrf" min="0" max="20" value="${d.qtd_dependentes_irrf||0}" />
    </div>
  </div>
  ${_divider('Condições Especiais')}
  <div class="dpa-toggles-grid">
    ${toggle('usa_epi',            '🦺', 'Usa EPI',           'Cria ficha de EPI automaticamente',         'tc-epi')}
    ${toggle('insalubridade',      '☣️',  'Insalubridade',     'Adicional calculado automaticamente',        'tc-insalub')}
    ${toggle('periculosidade',     '⚡',  'Periculosidade',    'Adicional de 30% sobre o salário base',      'tc-periculosidade')}
    ${toggle('adicional_noturno',  '🌙', 'Adicional Noturno', 'Acréscimo de 20% nas horas 22h–05h',        'tc-noturno')}
  </div>
  <div id="dpa-grau-insalub" style="${d.insalubridade ? '' : 'display:none'}">
    <div class="dp-form-grid" style="margin-top:12px">
      <div class="dp-field">
        <label>Grau de Insalubridade</label>
        <select name="grau_insalubridade">
          <option value="minimo" ${d.grau_insalubridade==='minimo'?'selected':''}>Mínimo (10%)</option>
          <option value="medio"  ${d.grau_insalubridade==='medio'?'selected':''}>Médio (20%)</option>
          <option value="maximo" ${d.grau_insalubridade==='maximo'?'selected':''}>Máximo (40%)</option>
        </select>
      </div>
    </div>
  </div>
  ${_divider('Benefícios')}
  <div class="dpa-toggles-grid">
    ${toggle('vale_transporte',  '🚌', 'Vale Transporte',    'Desconto de 6% sobre o salário base',           'tc-vt')}
    ${toggle('vale_alimentacao', '🍽️', 'Vale Alimentação',  'Ativado pelo RH após conclusão do cadastro',    'tc-va')}
    ${toggle('vale_refeicao',    '🍱', 'Vale Refeição',      'Ativado pelo RH após conclusão do cadastro',    'tc-vr')}
    ${toggle('plano_saude',      '❤️‍🩺','Plano de Saúde',     'SulAmérica — ativação em até 30 dias',          'tc-ps')}
  </div>
</div>`;
  }

  // ETAPA 7 — Documentos + Resumo
  function _e7() {
    const DOCS = [
      { id: 'rg',           label: 'RG / Identidade',                icon: '🪪', req: true  },
      { id: 'cpf',          label: 'CPF',                            icon: '📄', req: true  },
      { id: 'ctps',         label: 'Carteira de Trabalho (CTPS)',    icon: '📗', req: true  },
      { id: 'pis',          label: 'PIS / PASEP',                    icon: '📋', req: true  },
      { id: 'comp_res',     label: 'Comprovante de Residência',      icon: '🏠', req: true  },
      { id: 'foto_3x4',     label: 'Foto 3×4 recente',               icon: '📷', req: true  },
      { id: 'cert_nasc',    label: 'Certidão de Nascimento/Casamento',icon: '📜', req: false },
      { id: 'escolaridade', label: 'Comprovante de Escolaridade',    icon: '🎓', req: false },
      { id: 'cnh',          label: 'CNH',                            icon: '🚗', req: false },
      { id: 'cert_mil',     label: 'Certidão Militar (masculino)',   icon: '🪖', req: false },
      { id: 'atestado_adm', label: 'Atestado Médico Admissional',    icon: '🏥', req: false },
      { id: 'outros',       label: 'Outros Documentos',              icon: '📁', req: false },
    ];
    const d = state.dados;
    const admFmt = d.data_admissao ? new Date(d.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    const salFmt = d.salario_base
      ? 'R$ ' + parseFloat(String(d.salario_base).replace(',','.')).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
      : '—';
    const autosFiltrados = AUTOMACOES.filter(a => !a.condicional || !!d[a.condicional]);

    return `
<div class="dpa-etapa" data-etapa="7">
  ${_header('📎', 'Documentos', 'Faça upload dos documentos. Obrigatórios marcados com <span class="dpa-req">*</span>')}
  <div class="dpa-doc-grid">
    ${DOCS.map(doc => `
      <div class="dpa-doc-item ${state.documentos[doc.id] ? 'uploaded' : ''}" id="dpa-doc-${doc.id}">
        <div class="dpa-doc-icon">${doc.icon}</div>
        <div class="dpa-doc-label">${doc.label}${doc.req ? ' <span class="dpa-req">*</span>' : ''}</div>
        ${state.documentos[doc.id]
          ? `<div class="dpa-doc-ok">✓ Enviado</div>`
          : `<label class="dpa-doc-btn">Selecionar
               <input type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="dpaUploadDoc('${doc.id}',this)" />
             </label>`}
      </div>`).join('')}
  </div>

  <div class="dpa-resumo-box">
    <div class="dpa-resumo-hd">📋 Resumo da Admissão</div>
    <div class="dpa-resumo-grid">
      <div><label>Nome</label><span>${d.nome_completo || '—'}</span></div>
      <div><label>CPF</label><span>${d.cpf || '—'}</span></div>
      <div><label>Cargo</label><span>${d.cargo || '—'}</span></div>
      <div><label>Setor</label><span>${d.setor || '—'}</span></div>
      <div><label>Contrato</label><span>${d.tipo_contrato || '—'}</span></div>
      <div><label>Admissão</label><span>${admFmt}</span></div>
      <div><label>Salário Base</label><span>${salFmt}</span></div>
      <div><label>Dependentes</label><span>${state.dependentes.length}</span></div>
    </div>
    ${d.usa_epi || d.insalubridade || d.periculosidade ? `
      <div class="dpa-resumo-badges">
        ${d.usa_epi        ? `<span class="dpa-pill dpa-pill-warn">🦺 EPI Obrigatório</span>` : ''}
        ${d.insalubridade  ? `<span class="dpa-pill dpa-pill-warn">☣️ Insalubridade (${d.grau_insalubridade||'—'})</span>` : ''}
        ${d.periculosidade ? `<span class="dpa-pill dpa-pill-danger">⚡ Periculosidade</span>` : ''}
      </div>` : ''}
    <div class="dpa-auto-preview">
      <div class="dpa-auto-preview-hd">🤖 ${autosFiltrados.length} automações serão executadas:</div>
      <div class="dpa-auto-preview-lista">
        ${autosFiltrados.map(a => `
          <div class="dpa-auto-preview-item">
            <span>${a.icon}</span><span>${a.label}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
  }

  // ─── EVENTS ──────────────────────────────────────────────────
  function _attachEvents() {
    const root = state._container;
    root.addEventListener('click', e => {
      if (e.target.closest('#dpa-prox'))    _avancar();
      if (e.target.closest('#dpa-ant'))     _voltar();
      if (e.target.closest('#dpa-fin'))     _finalizar();
      if (e.target.closest('#dpa-add-dep')) _addDep();
    });
    root.addEventListener('change', e => { if (e.target.name) state.dados[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
    root.addEventListener('input',  e => { if (e.target.name) state.dados[e.target.name] = e.target.value; });
  }

  function _coletarTudo() {
    state._container.querySelectorAll('[name]').forEach(el => {
      if (el.type === 'checkbox') state.dados[el.name] = el.checked;
      else if (el.value)          state.dados[el.name] = el.value;
    });
  }

  function _avancar() {
    _coletarTudo();
    if (!_validar()) return;
    if (state.etapa < ETAPAS.length) { state.etapa++; _refresh(); }
  }
  function _voltar() {
    if (state.etapa > 1) { state.etapa--; _refresh(); }
  }

  function _refresh() {
    const root = state._container;
    root.querySelector('#dpa-body').innerHTML   = _etapaHTML(state.etapa);
    root.querySelector('#dpa-footer').innerHTML = _navHTML();
    root.querySelector('#dpa-stepper').outerHTML = _stepper();
    root.scrollIntoView({ behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _validar() {
    const req = {
      1: ['nome_completo','cpf','data_nascimento','email','celular'],
      2: ['nome_mae'],
      3: ['cep','logradouro','numero','bairro','cidade','estado'],
      4: ['banco','agencia','conta','tipo_conta'],
      5: ['cargo','setor','tipo_contrato','data_admissao','salario_base'],
    };
    const campos = req[state.etapa] || [];
    const faltando = campos.filter(c => !state.dados[c] || !String(state.dados[c]).trim());
    if (faltando.length) { _toast(`⚠️ Preencha os campos obrigatórios antes de avançar.`, 'warn'); return false; }
    return true;
  }

  // ─── MOTOR DE AUTOMAÇÃO ──────────────────────────────────────
  function _finalizar() {
    if (state.processando) return;
    _coletarTudo();
    state.processando = true;
    _abrirModalAutomacao();
  }

  function _abrirModalAutomacao() {
    const lista = AUTOMACOES.filter(a => !a.condicional || !!state.dados[a.condicional]);
    const overlay = document.createElement('div');
    overlay.id = 'dpa-auto-overlay';
    overlay.className = 'dpa-auto-overlay';
    overlay.innerHTML = `
<div class="dpa-auto-modal">
  <div class="dpa-auto-modal-hd">
    <div class="dpa-auto-pulse">🤖</div>
    <h2>Motor de Automação Ativo</h2>
    <p>Configurando o ambiente completo de <strong>${state.dados.nome_completo?.split(' ')[0] || 'colaborador'}</strong>…</p>
    <div class="dpa-auto-bar"><div class="dpa-auto-fill" id="dpa-auto-fill" style="width:0%"></div></div>
    <span class="dpa-auto-pct" id="dpa-auto-pct">0%</span>
  </div>
  <div class="dpa-auto-lista" id="dpa-auto-lista">
    ${lista.map(a => `
      <div class="dpa-auto-item" id="dpa-ai-${a.id}">
        <div class="dpa-ai-icon">${a.icon}</div>
        <div class="dpa-ai-info"><strong>${a.label}</strong><small>${a.det}</small></div>
        <div class="dpa-ai-status" id="dpa-as-${a.id}"><span class="dpa-spin"></span></div>
      </div>`).join('')}
  </div>
  <div class="dpa-auto-success-wrap" id="dpa-auto-success" style="display:none"></div>
</div>`;
    document.body.appendChild(overlay);
    _executarAutomacoes(lista, overlay);
  }

  async function _executarAutomacoes(lista, overlay) {
    const n = lista.length;
    for (let i = 0; i < n; i++) {
      await _sleep(500 + Math.random() * 500);
      const a   = lista[i];
      const st  = document.getElementById(`dpa-as-${a.id}`);
      const row = document.getElementById(`dpa-ai-${a.id}`);
      const pct = Math.round(((i + 1) / n) * 100);
      if (st)  { st.className = 'dpa-ai-status done'; st.textContent = '✓'; }
      if (row) row.classList.add('done');
      const fill = document.getElementById('dpa-auto-fill');
      const pctEl = document.getElementById('dpa-auto-pct');
      if (fill)  fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    }
    await _sleep(400);
    _mostrarSucesso(overlay);
    _persistirColaborador();
  }

  function _mostrarSucesso(overlay) {
    const wrap = overlay.querySelector('#dpa-auto-success');
    if (!wrap) return;
    const nome = state.dados.nome_completo?.split(' ').slice(0, 2).join(' ') || 'Colaborador';
    wrap.style.display = 'block';
    wrap.innerHTML = `
<div class="dpa-success">
  <div class="dpa-success-icon">🎉</div>
  <h2>${nome} admitido com sucesso!</h2>
  <p>Todas as automações foram concluídas. O colaborador já está integrado a todos os módulos do sistema.</p>
  <div class="dpa-success-stats">
    <div><span>${AUTOMACOES.filter(a=>!a.condicional||!!state.dados[a.condicional]).length}</span><small>Automações</small></div>
    <div><span>${state.dependentes.length}</span><small>Dependentes</small></div>
    <div><span>${Object.keys(state.documentos).length}</span><small>Documentos</small></div>
    <div><span>${state.dados.tipo_contrato || 'CLT'}</span><small>Contrato</small></div>
  </div>
  <div class="dpa-success-timeline">
    ${_gerarTimeline()}
  </div>
  <div class="dpa-success-actions">
    <button class="dp-btn" onclick="document.getElementById('dpa-auto-overlay').remove();window.DPHub&&DPHub.irPara('colaboradores')">
      👤 Ver Colaboradores
    </button>
    <button class="dp-btn dp-btn-secondary" onclick="document.getElementById('dpa-auto-overlay').remove();dpaNovaAdmissao()">
      + Nova Admissão
    </button>
  </div>
</div>`;
  }

  function _gerarTimeline() {
    const adm    = state.dados.data_admissao ? new Date(state.dados.data_admissao + 'T00:00:00') : new Date();
    const fmt    = d => d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
    const expFim = new Date(adm); expFim.setDate(expFim.getDate() + 90);
    const items  = [
      { icon: '🟢', label: 'Admissão',             data: fmt(adm) },
      { icon: '📋', label: 'Início do Contrato',    data: fmt(adm) },
      { icon: '⏱️', label: 'Fim do Período de Experiência', data: fmt(expFim) },
    ];
    return `
<div class="dpa-tl">
  ${items.map((it, i) => `
    <div class="dpa-tl-item">
      <div class="dpa-tl-icon">${it.icon}</div>
      <div class="dpa-tl-info"><strong>${it.label}</strong><span>${it.data}</span></div>
      ${i < items.length - 1 ? '<div class="dpa-tl-line"></div>' : ''}
    </div>`).join('')}
</div>`;
  }

  function _persistirColaborador() {
    const id = 'COL_' + Date.now();
    const col = {
      id,
      ...state.dados,
      dependentes:  [...state.dependentes],
      documentos:   Object.keys(state.documentos),
      status:       'ativo',
      admitidoEm:   new Date().toISOString(),
    };
    try {
      const lista = JSON.parse(localStorage.getItem('dp_colaboradores') || '[]');
      lista.push(col);
      localStorage.setItem('dp_colaboradores', JSON.stringify(lista));
    } catch { /* storage cheio — ignora */ }

    // Integra com RHData se disponível
    if (window.RHData?.colaboradores) {
      window.RHData.colaboradores.push({
        id,
        nome:    col.nome_completo,
        cargo:   col.cargo,
        salario: parseFloat(String(col.salario_base || '0').replace(',','.')),
        status:  'ativo',
        setor:   col.setor,
      });
    }
  }

  // ─── UTILIDADES ──────────────────────────────────────────────
  function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function _toast(msg, tipo = 'error') {
    document.querySelectorAll('.dpa-toast').forEach(e => e.remove());
    const el = document.createElement('div');
    el.className = `dpa-toast dpa-toast-${tipo}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  // ─── GLOBAIS (handlers inline) ───────────────────────────────
  function _registerGlobals() {
    window.dpaAtualizarDep = (idx, campo, valor) => {
      if (state.dependentes[idx]) state.dependentes[idx][campo] = valor;
    };
    window.dpaRemoverDep = (idx) => {
      state.dependentes.splice(idx, 1);
      const el = document.getElementById('dpa-dep-lista');
      if (el) el.innerHTML = _renderDependentesLista();
    };
    window.dpaToggle = (campo, valor, cardId) => {
      state.dados[campo] = valor;
      document.getElementById(cardId)?.classList.toggle('on', valor);
      if (campo === 'insalubridade') {
        const el = document.getElementById('dpa-grau-insalub');
        if (el) el.style.display = valor ? '' : 'none';
      }
    };
    window.dpaTogglePix = (tipo) => {
      const el = document.getElementById('dpa-pix-campo');
      if (el) el.style.display = tipo ? '' : 'none';
    };
    window.dpaTipoContrato = (tipo) => {
      const el = document.getElementById('dpa-fim-contrato');
      if (el) el.style.display = ['CLT_EXPERIENCIA','TEMPORARIO','ESTAGIO'].includes(tipo) ? '' : 'none';
    };
    window.dpaBuscarCep = async () => {
      const cepEl = document.getElementById('dpa-cep');
      const cep   = (cepEl?.value || '').replace(/\D/g, '');
      if (cep.length !== 8) { _toast('CEP inválido. Digite os 8 dígitos.', 'warn'); return; }
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const d   = await res.json();
        if (d.erro) { _toast('CEP não encontrado.', 'warn'); return; }
        const set = (id, field, v) => {
          const el = document.getElementById(id);
          if (el) { el.value = v; state.dados[field] = v; }
        };
        set('dpa-logradouro', 'logradouro', d.logradouro || '');
        set('dpa-bairro',     'bairro',     d.bairro     || '');
        set('dpa-cidade',     'cidade',     d.localidade || '');
        set('dpa-estado',     'estado',     d.uf         || '');
      } catch { _toast('Não foi possível buscar o CEP. Verifique sua conexão.', 'warn'); }
    };
    window.dpaUploadDoc = (docId, input) => {
      if (!input.files?.[0]) return;
      state.documentos[docId] = input.files[0].name;
      const item = document.getElementById(`dpa-doc-${docId}`);
      if (item) {
        item.classList.add('uploaded');
        const btn = item.querySelector('.dpa-doc-btn');
        if (btn) btn.outerHTML = `<div class="dpa-doc-ok">✓ Enviado</div>`;
      }
    };
    window.dpaNovaAdmissao = () => { if (state._container) render(state._container); };
    window._addDep = _addDep;
  }

  function _addDep() {
    state.dependentes.push({ nome: '', parentesco: '', data_nascimento: '', cpf: '', dep_irrf: false, dep_plano: false });
    const el = document.getElementById('dpa-dep-lista');
    if (el) el.innerHTML = _renderDependentesLista();
  }

  return { render };
})();
