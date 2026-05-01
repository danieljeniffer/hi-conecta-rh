/**
 * dp-beneficios.js — Módulo de Benefícios
 */
const DPBeneficios = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const TIPO_LABEL = {
    Vale_Alimentacao: 'Vale Alimentação',
    Vale_Refeicao: 'Vale Refeição',
    Vale_Transporte: 'Vale Transporte',
    Plano_Saude: 'Plano de Saúde',
    Plano_Odonto: 'Plano Odontológico',
    Seguro_Vida: 'Seguro de Vida',
    Auxilio_Creche: 'Auxílio Creche',
    Outro: 'Outro',
  };

  const render = async (container) => {
    container.innerHTML = `<div style="padding:32px;text-align:center;color:#64748b;">Carregando benefícios...</div>`;
    try {
      const [catalogo, relatorio] = await Promise.all([
        DPService.catalogoBeneficios(),
        DPService.relatorioBeneficios(),
      ]);
      container.innerHTML = buildHTML(catalogo, relatorio);
      bindEvents();
    } catch (err) {
      const isOffline = err.message.toLowerCase().includes('offline') || err.message.includes('refused') || err.message.includes('Failed');
      container.innerHTML = isOffline
        ? `<div class="dp-alert dp-alert-warn">Backend desconectado. Inicie o servidor DP para gerenciar benefícios.</div>`
        : `<div class="dp-alert dp-alert-danger">${err.message}</div>`;
    }
  };

  const buildHTML = (catalogo, relatorio) => {
    const totais = relatorio.totais || {};
    return `
      <div>
        <div class="dp-cards-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px;">
          <div class="dp-card"><div class="dp-card-label">Custo Total Mensal</div>
            <div class="dp-card-value" style="font-size:18px;">${fmt(totais.total_empresa || 0)}</div>
          </div>
          <div class="dp-card"><div class="dp-card-label">Desconto Empregados</div>
            <div class="dp-card-value" style="font-size:18px;">${fmt(totais.total_colaboradores || 0)}</div>
          </div>
          <div class="dp-card"><div class="dp-card-label">Custo Líquido Empresa</div>
            <div class="dp-card-value" style="font-size:18px;">${fmt((totais.total_empresa || 0) - (totais.total_colaboradores || 0))}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <!-- Catálogo -->
          <div class="dp-table-wrap">
            <div class="dp-table-header">
              <span class="dp-table-title">Catálogo de Benefícios</span>
              <button class="dp-btn dp-btn-primary" id="dp-ben-novo">+ Atribuir a Colaborador</button>
            </div>
            <table class="dp-table">
              <thead><tr><th>Benefício</th><th>Fornecedor</th><th class="moeda">Empresa</th><th class="moeda">Empregado</th></tr></thead>
              <tbody>
                ${catalogo.map(b => `
                  <tr>
                    <td>
                      <strong>${b.nome}</strong><br>
                      <span class="dp-card-badge azul" style="font-size:10px;">${TIPO_LABEL[b.tipo] || b.tipo}</span>
                    </td>
                    <td>${b.fornecedor || '—'}</td>
                    <td class="moeda">${fmt(b.valor_empresa)}</td>
                    <td class="moeda">${fmt(b.valor_colaborador)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#64748b;">Sem benefícios cadastrados.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Relatório por benefício -->
          <div class="dp-table-wrap">
            <div class="dp-table-header">
              <span class="dp-table-title">Uso por Benefício</span>
            </div>
            <table class="dp-table">
              <thead><tr><th>Benefício</th><th>Colaboradores</th><th class="moeda">Custo Total</th><th class="moeda">Custo Empresa</th></tr></thead>
              <tbody>
                ${(relatorio.beneficios || []).map(b => `
                  <tr>
                    <td>${b.nome}</td>
                    <td>${b.qtd_colaboradores}</td>
                    <td class="moeda">${fmt(b.custo_total_mensal)}</td>
                    <td class="moeda"><strong>${fmt(b.custo_liquido_empresa)}</strong></td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#64748b;">Sem dados.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div id="dp-ben-modal"></div>
      </div>`;
  };

  const bindEvents = () => {
    document.getElementById('dp-ben-novo')?.addEventListener('click', abrirAtribuir);
  };

  const abrirAtribuir = async () => {
    const modal = document.getElementById('dp-ben-modal');
    const catalogo = await DPService.catalogoBeneficios();
    modal.innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPBeneficios.fecharModal()">
      <div class="dp-modal dp-modal-sm">
        <div class="dp-modal-head"><h3>Atribuir Benefício</h3><button class="dp-btn dp-btn-icon" onclick="DPBeneficios.fecharModal()">✕</button></div>
        <div class="dp-modal-body">
          <div class="dp-form-grid" style="gap:12px;">
            <div class="dp-field dp-field-full"><label>ID do Colaborador *</label><input id="dp-ben-col" placeholder="UUID do colaborador"></div>
            <div class="dp-field dp-field-full"><label>Benefício *</label>
              <select id="dp-ben-tipo">
                ${catalogo.map(b => `<option value="${b.id}">${b.nome} (empresa: ${fmt(b.valor_empresa)} | empregado: ${fmt(b.valor_colaborador)})</option>`).join('')}
              </select>
            </div>
            <div class="dp-field"><label>Data de Início *</label><input type="date" id="dp-ben-inicio" value="${new Date().toISOString().split('T')[0]}"></div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPBeneficios.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-ben-salvar">Atribuir</button>
        </div>
      </div></div>`;

    document.getElementById('dp-ben-salvar').addEventListener('click', async () => {
      try {
        await DPService.atribuirBeneficio({
          colaborador_id: document.getElementById('dp-ben-col').value,
          beneficio_id: document.getElementById('dp-ben-tipo').value,
          data_inicio: document.getElementById('dp-ben-inicio').value,
        });
        fecharModal();
        alert('Benefício atribuído com sucesso!');
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const fecharModal = () => {
    const modal = document.getElementById('dp-ben-modal');
    if (modal) modal.innerHTML = '';
  };

  return { render, fecharModal };
})();

window.DPBeneficios = DPBeneficios;
