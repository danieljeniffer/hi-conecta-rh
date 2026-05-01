/**
 * dp-colaboradores.js — Módulo de Colaboradores do DP
 */
const DPColaboradores = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const formatData = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';
  const iniciais = (n) => n ? n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() : '??';

  let state = { page: 1, busca: '', situacao: '', departamentos: [], cargos: [], lista: [], total: 0 };

  const render = async (container) => {
    container.innerHTML = buildShell();
    await carregarAuxiliares();
    await carregar(container);
    bindEvents(container);
  };

  const buildShell = () => `
    <div id="dp-col-wrapper">
      <div class="dp-table-header" style="margin-bottom:16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;">
        <div class="dp-search-bar" style="flex:1;">
          <input type="text" id="dp-col-busca" class="dp-search-input" placeholder="Buscar por nome, CPF ou e-mail..." style="max-width:320px;">
          <select id="dp-col-situacao" class="dp-search-input" style="max-width:160px;flex:none;">
            <option value="">Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Afastado">Afastados</option>
            <option value="Ferias">Em Férias</option>
            <option value="Demitido">Demitidos</option>
          </select>
          <select id="dp-col-dept" class="dp-search-input" style="max-width:200px;flex:none;">
            <option value="">Todos os depto.</option>
          </select>
        </div>
        <div class="dp-table-actions">
          <button class="dp-btn dp-btn-primary" id="dp-col-novo">+ Novo Colaborador</button>
        </div>
      </div>
      <div class="dp-table-wrap">
        <div id="dp-col-tabela"></div>
      </div>
      <div id="dp-col-modal"></div>
    </div>`;

  const carregar = async (container) => {
    const tabel = document.getElementById('dp-col-tabela');
    tabel.innerHTML = `<div style="padding:24px;text-align:center;color:#64748b;font-size:13px;">Carregando...</div>`;
    try {
      const params = { page: state.page, limit: 15 };
      if (state.busca) params.busca = state.busca;
      if (state.situacao) params.situacao = state.situacao;
      const resp = await DPService.listarColaboradores(params);
      state.lista = resp.dados;
      state.total = resp.paginacao?.total || 0;
      tabel.innerHTML = buildTabela(resp);
    } catch (err) {
      const msg = err.message.includes('fetch') || err.message.includes('refused') || err.message.includes('Failed')
        ? 'Backend desconectado. Inicie o servidor DP com <code>npm run dev</code> na pasta dp-backend.'
        : err.message;
      tabel.innerHTML = `<div class="dp-alert dp-alert-warn" style="margin:16px;">${msg}</div>`;
    }
  };

  const buildTabela = (resp) => `
    <table class="dp-table">
      <thead><tr>
        <th>Colaborador</th><th>CPF</th><th>Cargo</th><th>Depto.</th>
        <th class="moeda">Salário</th><th>Admissão</th><th>Contrato</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        ${resp.dados.length ? resp.dados.map(c => `
          <tr>
            <td>
              <div class="dp-avatar-nome">
                <div class="dp-avatar">${iniciais(c.nome_completo)}</div>
                <span class="nome-col">${c.nome_completo}</span>
              </div>
            </td>
            <td>${c.cpf}</td>
            <td>${c.cargo || '—'}</td>
            <td>${c.departamento || '—'}</td>
            <td class="moeda">${fmt(c.salario_base)}</td>
            <td>${formatData(c.data_admissao)}</td>
            <td>${c.tipo_contrato}</td>
            <td><span class="dp-status ${c.situacao.toLowerCase()}">${c.situacao}</span></td>
            <td>
              <button class="dp-btn dp-btn-icon" title="Ver detalhes" onclick="DPColaboradores.abrirDetalhe('${c.id}')">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
              </button>
              <button class="dp-btn dp-btn-icon" title="Editar" onclick="DPColaboradores.abrirEditar('${c.id}')">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
            </td>
          </tr>
        `).join('') : '<tr><td colspan="9" style="text-align:center;padding:32px;color:#64748b;">Nenhum colaborador encontrado.</td></tr>'}
      </tbody>
    </table>
    <div class="dp-pagination">
      <span>${state.total} colaboradores</span>
      <button onclick="DPColaboradores.mudarPagina(-1)" ${state.page <= 1 ? 'disabled' : ''}>‹ Anterior</button>
      <button class="ativo">${state.page}</button>
      <button onclick="DPColaboradores.mudarPagina(1)" ${state.page * 15 >= state.total ? 'disabled' : ''}>Próxima ›</button>
    </div>`;

  const abrirDetalhe = async (id) => {
    const modal = document.getElementById('dp-col-modal');
    modal.innerHTML = `<div class="dp-modal-overlay"><div class="dp-modal dp-modal-lg">
      <div class="dp-modal-head"><h3>Carregando...</h3><button onclick="DPColaboradores.fecharModal()" class="dp-btn dp-btn-icon">✕</button></div>
      <div class="dp-modal-body"><div style="text-align:center;padding:32px;color:#64748b;">Carregando dados...</div></div>
    </div></div>`;

    try {
      const c = await DPService.buscarColaborador(id);
      const hist = await DPService.historicoSalarial(id);
      modal.innerHTML = buildDetalhe(c, hist);
    } catch (err) {
      modal.innerHTML = `<div class="dp-modal-overlay"><div class="dp-modal dp-modal-sm">
        <div class="dp-modal-head"><h3>Erro</h3><button onclick="DPColaboradores.fecharModal()" class="dp-btn dp-btn-icon">✕</button></div>
        <div class="dp-modal-body"><div class="dp-alert dp-alert-danger">${err.message}</div></div>
      </div></div>`;
    }
  };

  const buildDetalhe = (c, hist) => `
    <div class="dp-modal-overlay" onclick="if(event.target===this)DPColaboradores.fecharModal()">
    <div class="dp-modal dp-modal-lg">
      <div class="dp-modal-head">
        <h3>${c.nome_completo}</h3>
        <div style="display:flex;gap:6px;">
          <button class="dp-btn dp-btn-secondary" onclick="DPColaboradores.abrirEditar('${c.id}')">Editar</button>
          <button class="dp-btn dp-btn-icon" onclick="DPColaboradores.fecharModal()">✕</button>
        </div>
      </div>
      <div class="dp-modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div>
            <div class="dp-section-title">Dados Pessoais</div>
            <div class="dp-form-grid" style="grid-template-columns:1fr 1fr;">
              ${dado('CPF', c.cpf)}
              ${dado('PIS/PASEP', c.pis_pasep || '—')}
              ${dado('Nascimento', formatData(c.data_nascimento))}
              ${dado('Gênero', c.genero || '—')}
              ${dado('Estado Civil', c.estado_civil || '—')}
              ${dado('Celular', c.celular || '—')}
            </div>

            <div class="dp-section-title">Dados do Vínculo</div>
            <div class="dp-form-grid" style="grid-template-columns:1fr 1fr;">
              ${dado('Cargo', c.cargo_titulo || '—')}
              ${dado('Departamento', c.departamento_nome || '—')}
              ${dado('Admissão', formatData(c.data_admissao))}
              ${dado('Tipo Contrato', c.tipo_contrato)}
              ${dado('Jornada', c.jornada)}
              ${dado('Salário Base', new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c.salario_base))}
            </div>

            <div class="dp-section-title">Adicionais</div>
            <div class="dp-form-grid" style="grid-template-columns:1fr 1fr;">
              ${dado('Insalubridade', c.tem_insalubridade ? `Sim — Grau ${c.grau_insalubridade}` : 'Não')}
              ${dado('Periculosidade', c.tem_periculosidade ? 'Sim (30%)' : 'Não')}
              ${dado('Adicional Noturno', c.adicional_noturno ? 'Sim' : 'Não')}
              ${dado('Dependentes IRRF', c.qtd_dependentes_irrf || '0')}
            </div>
          </div>

          <div>
            <div class="dp-section-title">Dados Bancários</div>
            <div class="dp-form-grid" style="grid-template-columns:1fr 1fr;">
              ${dado('Banco', c.banco || '—')}
              ${dado('Agência', c.agencia || '—')}
              ${dado('Conta', c.conta || '—')}
              ${dado('Tipo Conta', c.tipo_conta || '—')}
              ${dado('PIX', c.pix_chave || '—', '1/-1')}
            </div>

            <div class="dp-section-title">Histórico Salarial</div>
            ${hist.length ? `
              <table class="dp-table">
                <thead><tr><th>Data</th><th>Anterior</th><th>Novo</th><th>Motivo</th></tr></thead>
                <tbody>${hist.map(h => `
                  <tr>
                    <td>${formatData(h.data_vigencia)}</td>
                    <td class="moeda">${h.salario_anterior ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(h.salario_anterior) : '—'}</td>
                    <td class="moeda">${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(h.salario_novo)}</td>
                    <td>${h.motivo || '—'}</td>
                  </tr>
                `).join('')}</tbody>
              </table>` : '<div style="color:#64748b;font-size:13px;">Sem histórico.</div>'}

            ${c.dependentes?.length ? `
              <div class="dp-section-title">Dependentes</div>
              <table class="dp-table">
                <thead><tr><th>Nome</th><th>Parentesco</th><th>IRRF</th></tr></thead>
                <tbody>${c.dependentes.map(d => `
                  <tr><td>${d.nome}</td><td>${d.parentesco}</td><td>${d.dependente_irrf ? 'Sim' : 'Não'}</td></tr>
                `).join('')}</tbody>
              </table>` : ''}
          </div>
        </div>
      </div>
      <div class="dp-modal-footer">
        <button class="dp-btn dp-btn-secondary" onclick="DPColaboradores.fecharModal()">Fechar</button>
        <button class="dp-btn dp-btn-primary" onclick="DPColaboradores.abrirEditar('${c.id}')">Editar Colaborador</button>
      </div>
    </div></div>`;

  const dado = (label, value, gridCol) => `
    <div class="dp-field" ${gridCol ? `style="grid-column:${gridCol}"` : ''}>
      <label>${label}</label>
      <div style="font-size:13px;padding:8px 0;color:#1e293b;font-weight:500;">${value}</div>
    </div>`;

  const abrirNovo = () => {
    const modal = document.getElementById('dp-col-modal');
    modal.innerHTML = buildFormModal(null);
    bindFormEvents(modal);
  };

  const abrirEditar = async (id) => {
    const modal = document.getElementById('dp-col-modal');
    modal.innerHTML = `<div class="dp-modal-overlay"><div class="dp-modal dp-modal-lg"><div class="dp-modal-body" style="text-align:center;padding:32px;">Carregando...</div></div></div>`;
    try {
      const c = await DPService.buscarColaborador(id);
      modal.innerHTML = buildFormModal(c);
      bindFormEvents(modal, c);
    } catch (err) {
      fecharModal();
    }
  };

  const buildFormModal = (c) => `
    <div class="dp-modal-overlay" onclick="if(event.target===this)DPColaboradores.fecharModal()">
    <div class="dp-modal dp-modal-lg">
      <div class="dp-modal-head">
        <h3>${c ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
        <button class="dp-btn dp-btn-icon" onclick="DPColaboradores.fecharModal()">✕</button>
      </div>
      <div class="dp-modal-body">
        <form id="dp-col-form">
          <div class="dp-section-title">Dados Pessoais</div>
          <div class="dp-form-grid cols-3">
            <div class="dp-field dp-field-full"><label>Nome Completo *</label><input name="nome_completo" value="${c?.nome_completo||''}" required></div>
            <div class="dp-field"><label>CPF *</label><input name="cpf" value="${c?.cpf||''}" placeholder="000.000.000-00" ${c ? 'readonly' : ''} required></div>
            <div class="dp-field"><label>PIS/PASEP</label><input name="pis_pasep" value="${c?.pis_pasep||''}" placeholder="000.00000.00-0"></div>
            <div class="dp-field"><label>Data de Nascimento *</label><input type="date" name="data_nascimento" value="${c?.data_nascimento?.split('T')[0]||''}" required></div>
            <div class="dp-field"><label>Gênero</label><select name="genero">
              <option value="">Selecione</option>
              <option value="M" ${c?.genero==='M'?'selected':''}>Masculino</option>
              <option value="F" ${c?.genero==='F'?'selected':''}>Feminino</option>
              <option value="Outro" ${c?.genero==='Outro'?'selected':''}>Outro</option>
            </select></div>
            <div class="dp-field"><label>Estado Civil</label><select name="estado_civil">
              <option value="">Selecione</option>
              ${['Solteiro','Casado','Divorciado','Viuvo','Uniao_Estavel'].map(v=>`<option value="${v}" ${c?.estado_civil===v?'selected':''}>${v.replace('_',' ')}</option>`).join('')}
            </select></div>
            <div class="dp-field"><label>E-mail</label><input type="email" name="email" value="${c?.email||''}"></div>
            <div class="dp-field"><label>Celular</label><input name="celular" value="${c?.celular||''}" placeholder="(11) 99999-9999"></div>
          </div>

          <div class="dp-section-title">Vínculo Empregatício</div>
          <div class="dp-form-grid cols-3">
            <div class="dp-field"><label>Cargo</label>
              <select name="cargo_id" id="dp-sel-cargo">
                <option value="">Selecione</option>
                ${state.cargos.map(cg=>`<option value="${cg.id}" ${c?.cargo_id===cg.id?'selected':''}>${cg.titulo}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field"><label>Departamento</label>
              <select name="departamento_id">
                <option value="">Selecione</option>
                ${state.departamentos.map(d=>`<option value="${d.id}" ${c?.departamento_id===d.id?'selected':''}>${d.nome}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field"><label>Tipo de Contrato</label><select name="tipo_contrato">
              ${['CLT','Experiencia','Temporario','Estagio','Aprendiz'].map(v=>`<option value="${v}" ${c?.tipo_contrato===v?'selected':''}>${v}</option>`).join('')}
            </select></div>
            <div class="dp-field"><label>Jornada</label><select name="jornada">
              ${['44h','40h','36h','30h','20h','Escala_12x36','Escala_6x1'].map(v=>`<option value="${v}" ${c?.jornada===v?'selected':''}>${v.replace('_',' ')}</option>`).join('')}
            </select></div>
            <div class="dp-field"><label>Salário Base *</label><input type="number" step="0.01" name="salario_base" value="${c?.salario_base||''}" required></div>
            <div class="dp-field"><label>Data de Admissão *</label><input type="date" name="data_admissao" value="${c?.data_admissao?.split('T')[0]||''}" ${c?'readonly':''} required></div>
            <div class="dp-field"><label>Dependentes IRRF</label><input type="number" min="0" name="qtd_dependentes_irrf" value="${c?.qtd_dependentes_irrf||0}"></div>
          </div>

          <div class="dp-section-title">Adicionais e Benefícios</div>
          <div class="dp-form-grid cols-3">
            <div class="dp-field"><label>Insalubridade</label><select name="tem_insalubridade" id="dp-insalubridade-check">
              <option value="false" ${!c?.tem_insalubridade?'selected':''}>Não</option>
              <option value="true" ${c?.tem_insalubridade?'selected':''}>Sim</option>
            </select></div>
            <div class="dp-field" id="dp-grau-wrap"><label>Grau Insalubridade</label><select name="grau_insalubridade">
              ${['Minimo','Medio','Maximo'].map(v=>`<option value="${v}" ${c?.grau_insalubridade===v?'selected':''}>${v} ${v==='Minimo'?'(10%)':v==='Medio'?'(20%)':'(40%)'}</option>`).join('')}
            </select></div>
            <div class="dp-field"><label>Periculosidade (30%)</label><select name="tem_periculosidade">
              <option value="false" ${!c?.tem_periculosidade?'selected':''}>Não</option>
              <option value="true" ${c?.tem_periculosidade?'selected':''}>Sim</option>
            </select></div>
            <div class="dp-field"><label>Adicional Noturno</label><select name="adicional_noturno">
              <option value="false" ${!c?.adicional_noturno?'selected':''}>Não</option>
              <option value="true" ${c?.adicional_noturno?'selected':''}>Sim</option>
            </select></div>
          </div>

          <div class="dp-section-title">Dados Bancários</div>
          <div class="dp-form-grid cols-3">
            <div class="dp-field"><label>Banco</label><input name="banco" value="${c?.banco||''}"></div>
            <div class="dp-field"><label>Agência</label><input name="agencia" value="${c?.agencia||''}"></div>
            <div class="dp-field"><label>Conta</label><input name="conta" value="${c?.conta||''}"></div>
            <div class="dp-field"><label>Tipo de Conta</label><select name="tipo_conta">
              <option value="Corrente" ${c?.tipo_conta==='Corrente'?'selected':''}>Corrente</option>
              <option value="Poupança" ${c?.tipo_conta==='Poupança'?'selected':''}>Poupança</option>
            </select></div>
            <div class="dp-field"><label>Chave PIX</label><input name="pix_chave" value="${c?.pix_chave||''}"></div>
          </div>
        </form>
      </div>
      <div class="dp-modal-footer">
        <button class="dp-btn dp-btn-secondary" onclick="DPColaboradores.fecharModal()">Cancelar</button>
        <button class="dp-btn dp-btn-primary" id="dp-col-salvar">${c ? 'Salvar Alterações' : 'Cadastrar Colaborador'}</button>
      </div>
    </div></div>`;

  const bindFormEvents = (modal, colaborador = null) => {
    const btn = modal.querySelector('#dp-col-salvar');
    btn.addEventListener('click', async () => {
      const form = modal.querySelector('#dp-col-form');
      const formData = new FormData(form);
      const dados = Object.fromEntries(formData.entries());
      dados.tem_insalubridade = dados.tem_insalubridade === 'true';
      dados.tem_periculosidade = dados.tem_periculosidade === 'true';
      dados.adicional_noturno = dados.adicional_noturno === 'true';
      dados.salario_base = parseFloat(dados.salario_base);
      dados.qtd_dependentes_irrf = parseInt(dados.qtd_dependentes_irrf) || 0;

      btn.textContent = 'Salvando...';
      btn.disabled = true;
      try {
        if (colaborador) {
          await DPService.atualizarColaborador(colaborador.id, dados);
          mostrarAlerta('Colaborador atualizado com sucesso!', 'success');
        } else {
          await DPService.criarColaborador(dados);
          mostrarAlerta('Colaborador cadastrado com sucesso!', 'success');
        }
        fecharModal();
        await carregar(document.getElementById('dp-col-wrapper'));
      } catch (err) {
        mostrarAlerta(err.message, 'error');
        btn.textContent = colaborador ? 'Salvar Alterações' : 'Cadastrar Colaborador';
        btn.disabled = false;
      }
    });
  };

  const bindEvents = (container) => {
    let timer;
    const busca = document.getElementById('dp-col-busca');
    busca?.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.busca = busca.value;
        state.page = 1;
        carregar(container);
      }, 400);
    });

    document.getElementById('dp-col-situacao')?.addEventListener('change', (e) => {
      state.situacao = e.target.value;
      state.page = 1;
      carregar(container);
    });

    document.getElementById('dp-col-novo')?.addEventListener('click', abrirNovo);
  };

  const carregarAuxiliares = async () => {
    try {
      const [depts, cargos] = await Promise.all([DPService.listarDepartamentos(), DPService.listarCargos()]);
      state.departamentos = depts;
      state.cargos = cargos;
      const sel = document.getElementById('dp-col-dept');
      if (sel) depts.forEach(d => { const o = document.createElement('option'); o.value = d.id; o.textContent = d.nome; sel.appendChild(o); });
    } catch { /* sem aux */ }
  };

  const fecharModal = () => {
    const modal = document.getElementById('dp-col-modal');
    if (modal) modal.innerHTML = '';
  };

  const mudarPagina = (delta) => {
    state.page = Math.max(1, state.page + delta);
    carregar(document.getElementById('dp-col-wrapper'));
  };

  const mostrarAlerta = (msg, tipo) => {
    if (window.Toast) {
      Toast[tipo === 'success' ? 'success' : 'error']?.(msg);
    } else {
      alert(msg);
    }
  };

  return { render, abrirDetalhe, abrirEditar, fecharModal, mudarPagina };
})();

window.DPColaboradores = DPColaboradores;
