/**
 * dp-folha.js — Módulo de Folha de Pagamento (Holerite)
 */
const DPFolha = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtData = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';

  let periodoAtual = null;

  const render = async (container) => {
    container.innerHTML = buildShell();
    await carregarPeriodos(container);
  };

  const buildShell = () => `
    <div id="dp-folha-wrapper">
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="dp-btn dp-btn-primary" id="dp-folha-novo-periodo">+ Abrir Período</button>
        <button class="dp-btn dp-btn-secondary" id="dp-folha-calcular-tudo" disabled>Calcular Folha Completa</button>
        <button class="dp-btn dp-btn-secondary" id="dp-folha-fechar" disabled>Fechar Período</button>
      </div>
      <div id="dp-folha-conteudo"></div>
      <div id="dp-folha-modal"></div>
    </div>`;

  const carregarPeriodos = async (container) => {
    const content = document.getElementById('dp-folha-conteudo');

    // Tenta carregar o período mais recente
    content.innerHTML = `<div class="dp-alert dp-alert-info">Selecione ou abra um período de folha para começar.</div>
      <div id="dp-periodo-lista"></div>`;

    bindFolhaEvents();
  };

  const carregarFolhaPeriodo = async (periodoId) => {
    const content = document.getElementById('dp-folha-conteudo');
    content.innerHTML = `<div style="padding:32px;text-align:center;color:#64748b;">Carregando folha...</div>`;
    try {
      const resp = await DPService.listarFolhaPeriodo(periodoId);
      periodoAtual = resp.periodo;
      document.getElementById('dp-folha-calcular-tudo').disabled = resp.periodo?.status === 'Fechada';
      document.getElementById('dp-folha-fechar').disabled = resp.periodo?.status !== 'Calculada';
      content.innerHTML = buildFolha(resp);
    } catch (err) {
      const isOffline = err.message.toLowerCase().includes('offline') || err.message.includes('refused');
      content.innerHTML = isOffline
        ? `<div class="dp-alert dp-alert-warn">Backend desconectado. Inicie o servidor DP para acessar a folha de pagamento.</div>`
        : `<div class="dp-alert dp-alert-danger">${err.message}</div>`;
    }
  };

  const buildFolha = (resp) => {
    const p = resp.periodo;
    const folhas = resp.folhas || [];
    const totalProventos = folhas.reduce((s, f) => s + parseFloat(f.total_proventos || 0), 0);
    const totalDescontos = folhas.reduce((s, f) => s + parseFloat(f.total_descontos || 0), 0);
    const totalLiquido = folhas.reduce((s, f) => s + parseFloat(f.salario_liquido || 0), 0);
    const totalFGTS = folhas.reduce((s, f) => s + parseFloat(f.fgts_valor || 0), 0);
    const totalINSSEmpresa = folhas.reduce((s, f) => s + parseFloat(f.inss_empresa || 0), 0);

    return `
      <div class="dp-cards-grid" style="margin-bottom:16px;grid-template-columns:repeat(5,1fr);">
        <div class="dp-card">
          <div class="dp-card-label">Competência</div>
          <div class="dp-card-value" style="font-size:18px;">${String(p.mes).padStart(2,'0')}/${p.ano}</div>
          <span class="dp-status ${p.status.toLowerCase()}">${p.status}</span>
        </div>
        <div class="dp-card"><div class="dp-card-label">Total Proventos</div><div class="dp-card-value" style="font-size:16px;">${fmt(totalProventos)}</div></div>
        <div class="dp-card"><div class="dp-card-label">Total Descontos</div><div class="dp-card-value" style="font-size:16px;">${fmt(totalDescontos)}</div></div>
        <div class="dp-card"><div class="dp-card-label">Líquido a Pagar</div><div class="dp-card-value" style="font-size:16px;">${fmt(totalLiquido)}</div></div>
        <div class="dp-card"><div class="dp-card-label">Custo Total (c/encargos)</div><div class="dp-card-value" style="font-size:14px;">${fmt(totalProventos + totalFGTS + totalINSSEmpresa)}</div>
          <div class="dp-card-sub">FGTS: ${fmt(totalFGTS)} | INSS: ${fmt(totalINSSEmpresa)}</div>
        </div>
      </div>

      <div class="dp-table-wrap">
        <div class="dp-table-header">
          <span class="dp-table-title">Holerites — ${String(p.mes).padStart(2,'0')}/${p.ano}</span>
          <button class="dp-btn dp-btn-secondary" onclick="DPFolha.abrirLancamento()">+ Lançar Individual</button>
        </div>
        <table class="dp-table">
          <thead><tr>
            <th>Colaborador</th><th>Cargo</th>
            <th class="moeda">Proventos</th><th class="moeda">INSS</th>
            <th class="moeda">IRRF</th><th class="moeda">Outros Desc.</th>
            <th class="moeda">Líquido</th><th class="moeda">FGTS</th><th></th>
          </tr></thead>
          <tbody>
            ${folhas.length ? folhas.map(f => `
              <tr>
                <td><strong>${f.nome_completo}</strong><br><span style="font-size:11px;color:#64748b;">${f.cpf}</span></td>
                <td>${f.cargo || '—'}</td>
                <td class="moeda">${fmt(f.total_proventos)}</td>
                <td class="moeda">${fmt(f.inss)}</td>
                <td class="moeda">${fmt(f.irrf)}</td>
                <td class="moeda">${fmt(parseFloat(f.total_descontos||0) - parseFloat(f.inss||0) - parseFloat(f.irrf||0))}</td>
                <td class="moeda"><strong>${fmt(f.salario_liquido)}</strong></td>
                <td class="moeda">${fmt(f.fgts_valor)}</td>
                <td>
                  <button class="dp-btn dp-btn-icon" title="Ver holerite" onclick="DPFolha.verHolerite('${f.id}')">
                    <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px;height:14px;"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" clip-rule="evenodd"/></svg>
                  </button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">Nenhum holerite calculado. Clique em "Calcular Folha Completa".</td></tr>'}
          </tbody>
        </table>
      </div>`;
  };

  const verHolerite = async (folhaId) => {
    // Busca dados da folha pelo ID
    const modal = document.getElementById('dp-folha-modal');
    modal.innerHTML = `<div class="dp-modal-overlay" onclick="if(event.target===this)DPFolha.fecharModal()">
      <div class="dp-modal dp-modal-lg">
        <div class="dp-modal-head"><h3>Holerite</h3><button class="dp-btn dp-btn-icon" onclick="DPFolha.fecharModal()">✕</button></div>
        <div class="dp-modal-body" id="dp-holerite-content">
          <div style="text-align:center;padding:32px;color:#64748b;">Carregando holerite...</div>
        </div>
      </div>
    </div>`;

    // Reutiliza dados já carregados (em produção faria GET individual)
    modal.innerHTML = `<div class="dp-modal-overlay" onclick="if(event.target===this)DPFolha.fecharModal()">
      <div class="dp-modal dp-modal-lg">
        <div class="dp-modal-head"><h3>Holerite — ${periodoAtual ? `${String(periodoAtual.mes).padStart(2,'0')}/${periodoAtual.ano}` : ''}</h3>
          <button class="dp-btn dp-btn-icon" onclick="DPFolha.fecharModal()">✕</button>
        </div>
        <div class="dp-modal-body">
          <div class="dp-alert dp-alert-info">Holerite em PDF disponível após integração com backend. ID: ${folhaId}</div>
        </div>
      </div>
    </div>`;
  };

  const abrirNovoPeriodo = () => {
    const modal = document.getElementById('dp-folha-modal');
    const hoje = new Date();
    modal.innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPFolha.fecharModal()">
      <div class="dp-modal dp-modal-sm">
        <div class="dp-modal-head"><h3>Abrir Período de Folha</h3><button class="dp-btn dp-btn-icon" onclick="DPFolha.fecharModal()">✕</button></div>
        <div class="dp-modal-body">
          <div class="dp-form-grid cols-2">
            <div class="dp-field"><label>Mês *</label>
              <select id="dp-periodo-mes">
                ${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i+1===hoje.getMonth()+1?'selected':''}>${String(i+1).padStart(2,'0')} — ${new Date(2000,i).toLocaleString('pt-BR',{month:'long'})}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field"><label>Ano *</label>
              <input type="number" id="dp-periodo-ano" value="${hoje.getFullYear()}" min="2020" max="2030">
            </div>
            <div class="dp-field dp-field-full"><label>Data de Pagamento</label>
              <input type="date" id="dp-periodo-pagamento">
            </div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPFolha.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-periodo-criar">Abrir Período</button>
        </div>
      </div></div>`;

    document.getElementById('dp-periodo-criar').addEventListener('click', async () => {
      const mes = parseInt(document.getElementById('dp-periodo-mes').value);
      const ano = parseInt(document.getElementById('dp-periodo-ano').value);
      const pagamento = document.getElementById('dp-periodo-pagamento').value;
      try {
        const resp = await DPService.abrirPeriodo({ mes, ano, data_pagamento: pagamento || null });
        fecharModal();
        carregarFolhaPeriodo(resp.periodo.id);
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const abrirLancamento = () => {
    if (!periodoAtual) return alert('Abra um período primeiro.');
    const modal = document.getElementById('dp-folha-modal');
    modal.innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPFolha.fecharModal()">
      <div class="dp-modal">
        <div class="dp-modal-head"><h3>Lançar Holerite Individual</h3><button class="dp-btn dp-btn-icon" onclick="DPFolha.fecharModal()">✕</button></div>
        <div class="dp-modal-body">
          <div class="dp-alert dp-alert-info">Preencha os dados adicionais do colaborador para este mês.</div>
          <div class="dp-form-grid cols-2">
            <div class="dp-field dp-field-full"><label>Colaborador</label>
              <input type="text" id="dp-lanc-busca-col" placeholder="Digite o nome do colaborador...">
              <input type="hidden" id="dp-lanc-col-id">
            </div>
            <div class="dp-field"><label>H.Extras 50% (horas)</label><input type="number" step="0.5" id="dp-lanc-he50" value="0" min="0"></div>
            <div class="dp-field"><label>H.Extras 100% (horas)</label><input type="number" step="0.5" id="dp-lanc-he100" value="0" min="0"></div>
            <div class="dp-field"><label>Faltas (dias)</label><input type="number" step="0.5" id="dp-lanc-faltas" value="0" min="0"></div>
            <div class="dp-field"><label>Atrasos (minutos)</label><input type="number" id="dp-lanc-atrasos" value="0" min="0"></div>
            <div class="dp-field"><label>Bônus</label><input type="number" step="0.01" id="dp-lanc-bonus" value="0" min="0"></div>
            <div class="dp-field"><label>Vale Transporte (R$)</label><input type="number" step="0.01" id="dp-lanc-vt" value="0" min="0"></div>
            <div class="dp-field"><label>Horas Noturnas</label><input type="number" step="0.5" id="dp-lanc-noturno" value="0" min="0"></div>
            <div class="dp-field"><label>Outros Descontos (R$)</label><input type="number" step="0.01" id="dp-lanc-outrosDesc" value="0" min="0"></div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPFolha.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-lanc-calcular">Calcular e Salvar</button>
        </div>
      </div></div>`;

    document.getElementById('dp-lanc-calcular').addEventListener('click', async () => {
      const colId = document.getElementById('dp-lanc-col-id').value;
      if (!colId) return alert('Selecione um colaborador.');
      try {
        const dados = {
          horas_extras_50: parseFloat(document.getElementById('dp-lanc-he50').value),
          horas_extras_100: parseFloat(document.getElementById('dp-lanc-he100').value),
          faltas_dias: parseFloat(document.getElementById('dp-lanc-faltas').value),
          atrasos_minutos: parseInt(document.getElementById('dp-lanc-atrasos').value),
          bonus: parseFloat(document.getElementById('dp-lanc-bonus').value),
          vale_transporte: parseFloat(document.getElementById('dp-lanc-vt').value),
          horas_noturnas: parseFloat(document.getElementById('dp-lanc-noturno').value),
          outros_descontos: parseFloat(document.getElementById('dp-lanc-outrosDesc').value),
        };
        await DPService.calcularFolhaColaborador(periodoAtual.id, colId, dados);
        fecharModal();
        carregarFolhaPeriodo(periodoAtual.id);
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const bindFolhaEvents = () => {
    document.getElementById('dp-folha-novo-periodo')?.addEventListener('click', abrirNovoPeriodo);

    document.getElementById('dp-folha-calcular-tudo')?.addEventListener('click', async () => {
      if (!periodoAtual) return alert('Abra um período primeiro.');
      if (!confirm('Calcular folha para todos os colaboradores ativos?')) return;
      try {
        await DPService.calcularFolhaCompleta(periodoAtual.id);
        carregarFolhaPeriodo(periodoAtual.id);
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById('dp-folha-fechar')?.addEventListener('click', async () => {
      if (!periodoAtual) return;
      if (!confirm('Fechar o período? Esta ação não pode ser desfeita.')) return;
      try {
        await DPService.fecharPeriodo(periodoAtual.id);
        carregarFolhaPeriodo(periodoAtual.id);
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const fecharModal = () => {
    const modal = document.getElementById('dp-folha-modal');
    if (modal) modal.innerHTML = '';
  };

  return { render, verHolerite, abrirLancamento, fecharModal };
})();

window.DPFolha = DPFolha;
