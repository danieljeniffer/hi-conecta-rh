/**
 * dp-decimo.js — Módulo 13º Salário
 */
const DPDecimo = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const render = async (container) => {
    const anoAtual = new Date().getFullYear();
    container.innerHTML = `
      <div>
        <div class="dp-cards-grid" style="margin-bottom:16px;grid-template-columns:repeat(3,1fr);">
          <div class="dp-card">
            <div class="dp-card-label">1ª Parcela</div>
            <div class="dp-card-value" style="font-size:14px;">Até 30/novembro</div>
            <div class="dp-card-sub">50% do 13º sem descontos</div>
          </div>
          <div class="dp-card">
            <div class="dp-card-label">2ª Parcela</div>
            <div class="dp-card-value" style="font-size:14px;">Até 20/dezembro</div>
            <div class="dp-card-sub">Saldo com INSS e IRRF</div>
          </div>
          <div class="dp-card">
            <div class="dp-card-label">Base de Cálculo</div>
            <div class="dp-card-value" style="font-size:14px;">1/12 por mês</div>
            <div class="dp-card-sub">15+ dias = mês cheio</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <!-- Simulador individual -->
          <div class="dp-table-wrap" style="padding:18px;">
            <div class="dp-table-title" style="margin-bottom:14px;">Simulador — 13º Individual</div>
            <div class="dp-form-grid" style="gap:12px;">
              <div class="dp-field dp-field-full"><label>Salário Base (R$)</label>
                <input type="number" step="0.01" id="dp-13-salario" placeholder="Ex: 3500.00">
              </div>
              <div class="dp-field"><label>Meses Trabalhados no Ano</label>
                <input type="number" id="dp-13-meses" value="12" min="1" max="12">
              </div>
              <div class="dp-field"><label>Dependentes IRRF</label>
                <input type="number" id="dp-13-dep" value="0" min="0">
              </div>
            </div>
            <button class="dp-btn dp-btn-primary" style="width:100%;margin-top:14px;" id="dp-13-calcular">Calcular 13º</button>
            <div id="dp-13-resultado" style="margin-top:16px;"></div>
          </div>

          <!-- Cálculo coletivo -->
          <div class="dp-table-wrap" style="padding:18px;">
            <div class="dp-table-title" style="margin-bottom:14px;">Previsão Total — ${anoAtual}</div>
            <div class="dp-alert dp-alert-info" style="margin-bottom:14px;">
              Calcula o 13º de todos os colaboradores ativos com base nos salários atuais.
            </div>
            <select id="dp-13-ano" class="dp-search-input" style="margin-bottom:12px;">
              ${[anoAtual-1, anoAtual].map(a => `<option value="${a}" ${a===anoAtual?'selected':''}>${a}</option>`).join('')}
            </select>
            <button class="dp-btn dp-btn-secondary" style="width:100%;" id="dp-13-calcular-todos">Calcular Previsão</button>
            <div id="dp-13-totais" style="margin-top:14px;"></div>
          </div>
        </div>

        <div class="dp-table-wrap" style="margin-top:20px;" id="dp-13-tabela-todos">
          <!-- Preenchido após calcular todos -->
        </div>
      </div>`;

    bindEvents();
  };

  const bindEvents = () => {
    document.getElementById('dp-13-calcular')?.addEventListener('click', calcularIndividual);
    document.getElementById('dp-13-calcular-todos')?.addEventListener('click', calcularTodos);
  };

  const calcularIndividual = () => {
    const salario = parseFloat(document.getElementById('dp-13-salario').value);
    const meses = parseInt(document.getElementById('dp-13-meses').value) || 12;
    const dep = parseInt(document.getElementById('dp-13-dep').value) || 0;

    if (!salario) return alert('Informe o salário base.');

    const el = document.getElementById('dp-13-resultado');

    // Cálculo local (simulação)
    const proporcional = (salario / 12) * meses;
    const parcela1 = proporcional / 2;
    const inss = calcularINSSLocal(proporcional);
    const baseIRRF = proporcional - inss - (dep * 189.59);
    const irrf = calcularIRRFLocal(baseIRRF);
    const parcela2Bruto = proporcional - parcela1;
    const parcela2Liquido = parcela2Bruto - inss - irrf;
    const totalLiquido = parcela1 + parcela2Liquido;

    el.innerHTML = `
      <div class="dp-rescisao-resultado">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Resumo do 13º — ${meses}/12 meses</div>
        <div class="dp-rescisao-linha"><span>13º Bruto Proporcional</span><span>${fmt(proporcional)}</span></div>
        <div style="font-size:12px;font-weight:700;color:#2563eb;margin:10px 0 6px;">1ª Parcela (até 30/nov)</div>
        <div class="dp-rescisao-linha credito"><span>Valor (50%)</span><span>${fmt(parcela1)}</span></div>
        <div class="dp-rescisao-linha credito"><span>Sem descontos</span><span>—</span></div>
        <div style="font-size:12px;font-weight:700;color:#2563eb;margin:10px 0 6px;">2ª Parcela (até 20/dez)</div>
        <div class="dp-rescisao-linha"><span>Bruto</span><span>${fmt(parcela2Bruto)}</span></div>
        <div class="dp-rescisao-linha debito"><span>INSS (sobre total)</span><span>– ${fmt(inss)}</span></div>
        <div class="dp-rescisao-linha debito"><span>IRRF (estimado)</span><span>– ${fmt(irrf)}</span></div>
        <div class="dp-rescisao-linha credito"><span>Líquido 2ª Parcela</span><span>${fmt(parcela2Liquido)}</span></div>
        <div class="dp-rescisao-linha total liquido" style="margin-top:8px;padding-top:10px;border-top:2px solid #2563eb;">
          <span>TOTAL LÍQUIDO</span><span>${fmt(totalLiquido)}</span>
        </div>
      </div>`;
  };

  const calcularTodos = async () => {
    const ano = parseInt(document.getElementById('dp-13-ano').value);
    const totaisEl = document.getElementById('dp-13-totais');
    const tabelaEl = document.getElementById('dp-13-tabela-todos');
    totaisEl.innerHTML = '<div style="color:#64748b;font-size:13px;">Calculando...</div>';

    try {
      const resp = await DPService.calcular13Todos(ano);
      totaisEl.innerHTML = `
        <div style="display:grid;gap:8px;">
          <div class="dp-rescisao-linha"><span>Colaboradores</span><span>${resp.colaboradores.length}</span></div>
          <div class="dp-rescisao-linha credito"><span>Total 13º Bruto</span><span>${fmt(resp.totais.totalBruto)}</span></div>
          <div class="dp-rescisao-linha debito"><span>Total Descontos</span><span>– ${fmt(resp.totais.totalINSS)}</span></div>
          <div class="dp-rescisao-linha total liquido"><span>Total Líquido</span><span>${fmt(resp.totais.totalLiquido)}</span></div>
        </div>`;

      tabelaEl.innerHTML = `
        <div class="dp-table-header">
          <span class="dp-table-title">13º por Colaborador — ${ano}</span>
        </div>
        <table class="dp-table">
          <thead><tr>
            <th>Colaborador</th><th>Meses</th>
            <th class="moeda">13º Bruto</th><th class="moeda">1ª Parcela</th>
            <th class="moeda">INSS + IRRF</th><th class="moeda">Total Líquido</th>
          </tr></thead>
          <tbody>
            ${resp.colaboradores.map(c => `
              <tr>
                <td>${c.nome}</td>
                <td>${c.meses}/12</td>
                <td class="moeda">${fmt(c.valorBruto)}</td>
                <td class="moeda">${fmt(c.parcela1?.valor || 0)}</td>
                <td class="moeda">${fmt(c.totalDescontos)}</td>
                <td class="moeda"><strong>${fmt(c.totalLiquido)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    } catch (err) {
      const isOffline = err.message.toLowerCase().includes('offline') || err.message.includes('refused');
      totaisEl.innerHTML = isOffline
        ? `<div class="dp-alert dp-alert-warn">Backend offline. A previsão coletiva requer conexão com o servidor DP.</div>`
        : `<div class="dp-alert dp-alert-danger">${err.message}</div>`;
    }
  };

  // Funções de cálculo local para simulação sem API
  const calcularINSSLocal = (base) => {
    const tabela = [[1412, 0.075], [2666.68, 0.09], [4000.03, 0.12], [7786.02, 0.14]];
    let total = 0, prev = 0;
    const b = Math.min(base, 7786.02);
    for (const [lim, aliq] of tabela) {
      if (b <= prev) break;
      total += (Math.min(b, lim) - prev) * aliq;
      prev = lim;
      if (b <= lim) break;
    }
    return Math.round(total * 100) / 100;
  };

  const calcularIRRFLocal = (base) => {
    if (base <= 2824) return 0;
    if (base <= 3751.05) return Math.round((base * 0.075 - 211.80) * 100) / 100;
    if (base <= 4664.68) return Math.round((base * 0.15 - 492.60) * 100) / 100;
    if (base <= 6101.06) return Math.round((base * 0.225 - 842.17) * 100) / 100;
    return Math.round((base * 0.275 - 1147.70) * 100) / 100;
  };

  return { render };
})();

window.DPDecimo = DPDecimo;
