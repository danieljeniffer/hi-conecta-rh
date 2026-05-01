/**
 * dp-ferias.js — Módulo de Férias
 */
const DPFerias = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtData = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';
  const diasRestantes = (d) => Math.floor((new Date(d) - new Date()) / 86400000);

  const render = async (container) => {
    container.innerHTML = `
      <div>
        <div class="dp-alert dp-alert-info" style="margin-bottom:16px;">
          Gerencie períodos aquisitivos e agendamentos de férias dos colaboradores.
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div>
            <div class="dp-table-wrap">
              <div class="dp-table-header">
                <span class="dp-table-title">Férias Vencendo</span>
              </div>
              <div id="dp-ferias-alerta"></div>
            </div>
          </div>

          <div>
            <div class="dp-table-wrap" style="padding:18px;">
              <div class="dp-table-title" style="margin-bottom:14px;">Calcular Férias</div>
              <div class="dp-form-grid" style="gap:12px;">
                <div class="dp-field dp-field-full">
                  <label>Salário Base (R$)</label>
                  <input type="number" step="0.01" id="dp-fer-salario" placeholder="Ex: 3500.00">
                </div>
                <div class="dp-field">
                  <label>Dias de Férias (máx. 30)</label>
                  <input type="number" id="dp-fer-dias" value="30" min="1" max="30">
                </div>
                <div class="dp-field">
                  <label>Dias de Abono (venda)</label>
                  <input type="number" id="dp-fer-abono" value="0" min="0" max="10">
                </div>
                <div class="dp-field">
                  <label>Dependentes IRRF</label>
                  <input type="number" id="dp-fer-dep" value="0" min="0">
                </div>
              </div>
              <button class="dp-btn dp-btn-primary" style="width:100%;margin-top:14px;" id="dp-fer-calcular">Calcular Férias</button>
              <div id="dp-fer-resultado" style="margin-top:16px;"></div>
            </div>
          </div>
        </div>

        <div class="dp-table-wrap" style="margin-top:20px;">
          <div class="dp-table-header">
            <span class="dp-table-title">Todos os Agendamentos</span>
            <button class="dp-btn dp-btn-primary" id="dp-fer-agendar">+ Agendar Férias</button>
          </div>
          <div id="dp-ferias-lista">
            <div style="padding:24px;text-align:center;color:#64748b;font-size:13px;">
              Carregando agendamentos...
            </div>
          </div>
        </div>

        <div id="dp-ferias-modal"></div>
      </div>`;

    await carregarAlertasFerias();
    bindEvents();
  };

  const carregarAlertasFerias = async () => {
    const el = document.getElementById('dp-ferias-alerta');
    try {
      const dados = await DPService.dashboard();
      const alertas = dados.alertas?.feriasVencendo || [];
      if (!alertas.length) {
        el.innerHTML = `<div style="padding:16px;text-align:center;color:#64748b;font-size:13px;">Nenhuma férias vencendo em 60 dias.</div>`;
        return;
      }
      el.innerHTML = alertas.map(f => {
        const dr = f.dias_restantes;
        const cls = dr <= 15 ? 'vermelho' : dr <= 30 ? 'amarelo' : 'normal';
        return `
          <div class="dp-notif-item">
            <div class="dp-notif-icon ${dr <= 30 ? 'alta' : 'normal'}">🌴</div>
            <div class="dp-notif-content">
              <div class="dp-notif-titulo">${f.nome_completo}</div>
              <div class="dp-notif-msg">
                ${f.dias_saldo} dias restantes — vence ${fmtData(f.data_limite_gozo)}
                <span class="dp-card-badge ${cls}">${dr} dias para vencer</span>
              </div>
            </div>
          </div>`;
      }).join('');
    } catch {
      el.innerHTML = `<div style="padding:16px;color:#64748b;font-size:13px;">Erro ao carregar alertas.</div>`;
    }
  };

  const bindEvents = () => {
    document.getElementById('dp-fer-calcular')?.addEventListener('click', calcularFerias);
    document.getElementById('dp-fer-agendar')?.addEventListener('click', abrirAgendamento);
  };

  const calcularFerias = async () => {
    const salario = parseFloat(document.getElementById('dp-fer-salario').value);
    const dias = parseInt(document.getElementById('dp-fer-dias').value) || 30;
    const abono = parseInt(document.getElementById('dp-fer-abono').value) || 0;
    const dep = parseInt(document.getElementById('dp-fer-dep').value) || 0;

    if (!salario) return alert('Informe o salário base.');
    if (dias + abono > 30) return alert('Soma de dias de gozo + abono não pode exceder 30.');

    const el = document.getElementById('dp-fer-resultado');
    el.innerHTML = '<div style="color:#64748b;font-size:13px;">Calculando...</div>';

    try {
      const res = await DPService.calcularFerias({
        colaborador_id: 'simulacao',
        salario_base: salario,
        dias_ferias: dias,
        dias_vendidos: abono,
      });

      // Cálculo local para simulação sem colaborador_id
      const valorDiario = salario / 30;
      const valorFerias = valorDiario * dias;
      const umTerco = valorFerias / 3;
      const valorAbono = valorDiario * abono;
      const umTercoAbono = valorAbono / 3;
      const totalBruto = valorFerias + umTerco + valorAbono + umTercoAbono;
      const inssSimulado = totalBruto > 7786.02 ? 868.86 : totalBruto * 0.14;
      const totalLiquido = totalBruto - inssSimulado;

      el.innerHTML = `
        <div class="dp-rescisao-resultado">
          <div class="dp-rescisao-linha credito"><span>Salário (${dias} dias)</span><span>${fmt(valorFerias)}</span></div>
          <div class="dp-rescisao-linha credito"><span>1/3 Constitucional</span><span>${fmt(umTerco)}</span></div>
          ${abono > 0 ? `<div class="dp-rescisao-linha credito"><span>Abono (${abono} dias)</span><span>${fmt(valorAbono)}</span></div>` : ''}
          ${abono > 0 ? `<div class="dp-rescisao-linha credito"><span>1/3 do Abono</span><span>${fmt(umTercoAbono)}</span></div>` : ''}
          <div class="dp-rescisao-linha" style="font-weight:600;padding-top:8px;border-top:1px solid #e2e8f0;"><span>Total Bruto</span><span>${fmt(totalBruto)}</span></div>
          <div class="dp-rescisao-linha debito"><span>INSS (estimado)</span><span>– ${fmt(inssSimulado)}</span></div>
          <div class="dp-rescisao-linha total liquido"><span>Estimativa Líquida</span><span>${fmt(totalLiquido)}</span></div>
          <div style="font-size:11px;color:#64748b;margin-top:8px;">* INSS e IRRF exatos requerem base de cálculo com todos os proventos.</div>
        </div>`;
    } catch (err) {
      el.innerHTML = `<div class="dp-alert dp-alert-danger">${err.message}</div>`;
    }
  };

  const abrirAgendamento = () => {
    const modal = document.getElementById('dp-ferias-modal');
    modal.innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPFerias.fecharModal()">
      <div class="dp-modal">
        <div class="dp-modal-head"><h3>Agendar Férias</h3><button class="dp-btn dp-btn-icon" onclick="DPFerias.fecharModal()">✕</button></div>
        <div class="dp-modal-body">
          <div class="dp-form-grid cols-2">
            <div class="dp-field dp-field-full"><label>ID do Colaborador</label><input id="dp-ag-col" placeholder="UUID do colaborador"></div>
            <div class="dp-field"><label>Data de Início *</label><input type="date" id="dp-ag-inicio"></div>
            <div class="dp-field"><label>Dias de Férias *</label><input type="number" id="dp-ag-dias" value="30" min="5" max="30"></div>
            <div class="dp-field"><label>Dias de Abono (venda)</label><input type="number" id="dp-ag-abono" value="0" min="0" max="10"></div>
            <div class="dp-field dp-field-full"><label>ID do Período Aquisitivo</label><input id="dp-ag-periodo" placeholder="UUID do período aquisitivo"></div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPFerias.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-ag-salvar">Agendar</button>
        </div>
      </div></div>`;

    document.getElementById('dp-ag-salvar').addEventListener('click', async () => {
      try {
        await DPService.agendarFerias({
          colaborador_id: document.getElementById('dp-ag-col').value,
          periodo_aquisitivo_id: document.getElementById('dp-ag-periodo').value,
          data_inicio: document.getElementById('dp-ag-inicio').value,
          dias_ferias: parseInt(document.getElementById('dp-ag-dias').value),
          dias_vendidos: parseInt(document.getElementById('dp-ag-abono').value) || 0,
        });
        fecharModal();
        alert('Férias agendadas com sucesso!');
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const fecharModal = () => {
    const modal = document.getElementById('dp-ferias-modal');
    if (modal) modal.innerHTML = '';
  };

  return { render, fecharModal };
})();

window.DPFerias = DPFerias;
