/**
 * dp-rescisao.js — Módulo de Rescisão Contratual
 */
const DPRescisao = (() => {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtData = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';

  const TIPOS = {
    Sem_Justa_Causa: 'Sem Justa Causa (dispensa)',
    Pedido_Demissao: 'Pedido de Demissão',
    Justa_Causa: 'Demissão por Justa Causa',
    Acordo_Mutuo: 'Acordo Mútuo (art. 484-A CLT)',
    Termino_Contrato: 'Término de Contrato',
  };

  let resultadoSimulacao = null;

  const render = (container) => {
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

        <!-- Simulador -->
        <div>
          <div class="dp-table-wrap" style="padding:20px;">
            <div class="dp-table-title" style="margin-bottom:16px;">Simulador de Rescisão</div>

            <div class="dp-alert dp-alert-info" style="margin-bottom:16px;">
              Preencha os dados para simular os valores da rescisão conforme a legislação trabalhista.
            </div>

            <div class="dp-form-grid" style="gap:14px;">
              <div class="dp-field dp-field-full">
                <label>Colaborador (ID ou nome)</label>
                <input type="text" id="dp-res-col" placeholder="ID do colaborador...">
              </div>
              <div class="dp-field">
                <label>Tipo de Rescisão *</label>
                <select id="dp-res-tipo">
                  ${Object.entries(TIPOS).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
                </select>
              </div>
              <div class="dp-field">
                <label>Salário Base (R$)</label>
                <input type="number" step="0.01" id="dp-res-salario" placeholder="Ex: 3500.00">
              </div>
              <div class="dp-field">
                <label>Data de Admissão</label>
                <input type="date" id="dp-res-admissao">
              </div>
              <div class="dp-field">
                <label>Data de Desligamento *</label>
                <input type="date" id="dp-res-desligamento" value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="dp-field">
                <label>Dependentes IRRF</label>
                <input type="number" id="dp-res-dep" value="0" min="0">
              </div>
              <div class="dp-field">
                <label>Dias de Férias Vencidas</label>
                <input type="number" id="dp-res-ferias-venc" value="0" min="0">
              </div>
              <div class="dp-field">
                <label>Saldo FGTS estimado (R$)</label>
                <input type="number" step="0.01" id="dp-res-fgts" placeholder="Deixe 0 para calcular">
              </div>
            </div>

            <div style="margin-top:16px;">
              <button class="dp-btn dp-btn-primary" style="width:100%;" id="dp-res-simular">Simular Rescisão</button>
            </div>
          </div>
        </div>

        <!-- Resultado -->
        <div id="dp-res-resultado">
          <div class="dp-table-wrap" style="padding:20px;">
            <div class="dp-table-title" style="margin-bottom:12px;">Resultado da Simulação</div>
            <div style="text-align:center;padding:32px;color:#64748b;font-size:13px;">
              Preencha o formulário e clique em "Simular Rescisão".
            </div>
          </div>
        </div>
      </div>

      <div id="dp-res-modal"></div>`;

    document.getElementById('dp-res-simular').addEventListener('click', simular);
  };

  const simular = async () => {
    const tipo = document.getElementById('dp-res-tipo').value;
    const salario = parseFloat(document.getElementById('dp-res-salario').value);
    const admissao = document.getElementById('dp-res-admissao').value;
    const desligamento = document.getElementById('dp-res-desligamento').value;
    const dependentes = parseInt(document.getElementById('dp-res-dep').value) || 0;
    const feriasVenc = parseInt(document.getElementById('dp-res-ferias-venc').value) || 0;
    const saldoFGTS = parseFloat(document.getElementById('dp-res-fgts').value) || null;

    if (!salario || !admissao || !desligamento) {
      return alert('Preencha salário, data de admissão e data de desligamento.');
    }

    const btn = document.getElementById('dp-res-simular');
    btn.textContent = 'Calculando...';
    btn.disabled = true;

    try {
      const res = await DPService.simularRescisaoRapida({
        tipo, salario_base: salario, data_admissao: admissao,
        data_desligamento: desligamento, qtd_dependentes: dependentes,
        dias_ferias_vencidas: feriasVenc, saldo_fgts: saldoFGTS,
      });
      resultadoSimulacao = res;
      renderResultado(res);
    } catch (err) {
      // Fallback: cálculo local quando backend offline
      if (err.message.toLowerCase().includes('offline') || err.message.includes('refused') || err.message.includes('Failed')) {
        const res = calcularRescisaoLocal(tipo, salario, admissao, desligamento, dependentes, feriasVenc, saldoFGTS);
        resultadoSimulacao = res;
        renderResultado(res);
      } else {
        document.getElementById('dp-res-resultado').innerHTML =
          `<div class="dp-alert dp-alert-danger">${err.message}</div>`;
      }
    } finally {
      btn.textContent = 'Simular Rescisão';
      btn.disabled = false;
    }
  };

  const renderResultado = (res) => {
    const el = document.getElementById('dp-res-resultado');
    const tipo = TIPOS[res.tipo] || res.tipo;

    const linha = (label, valor, cls = '') => `
      <div class="dp-rescisao-linha ${cls}">
        <span>${label}</span>
        <span>${fmt(valor)}</span>
      </div>`;

    el.innerHTML = `
      <div class="dp-table-wrap">
        <div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
          <div class="dp-table-title">Rescisão: ${tipo}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">
            ${res.anosServico} ano(s) e ${res.mesesServico} mês(es) de serviço
            — Aviso prévio: ${res.detalhamento?.diasAvisoPrevio || 0} dias
          </div>
        </div>

        <div style="padding:16px 18px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#166534;margin-bottom:8px;">Créditos do Empregado</div>
          ${res.saldoSalario > 0 ? linha('Saldo de Salário', res.saldoSalario, 'credito') : ''}
          ${res.avisoPrevioIndenizado > 0 ? linha('Aviso Prévio Indenizado', res.avisoPrevioIndenizado, 'credito') : ''}
          ${res.feriasProporcionais > 0 ? linha(`Férias Proporcionais (${res.detalhamento?.mesesFeriasProporcionais || 0}m)`, res.feriasProporcionais, 'credito') : ''}
          ${res.feriasVencidas > 0 ? linha('Férias Vencidas', res.feriasVencidas, 'credito') : ''}
          ${(res.feriasProporcionais + res.feriasVencidas) > 0 ? linha('1/3 Constitucional (Férias)', res.umTercoFerias, 'credito') : ''}
          ${res.decimoTerceiroProporcional > 0 ? linha(`13º Proporcional (${res.detalhamento?.meses13 || 0}m)`, res.decimoTerceiroProporcional, 'credito') : ''}
          ${res.multaFGTS > 0 ? linha('Multa FGTS (40%)', res.multaFGTS, 'credito') : ''}
          ${res.outrosCreditos > 0 ? linha('Outros Créditos', res.outrosCreditos, 'credito') : ''}

          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#991b1b;margin:12px 0 8px;">Descontos</div>
          ${res.inss > 0 ? linha('INSS', res.inss, 'debito') : ''}
          ${res.irrf > 0 ? linha('IRRF', res.irrf, 'debito') : ''}
          ${res.outrasDeducoes > 0 ? linha('Outros Descontos', res.outrasDeducoes, 'debito') : ''}

          <div style="margin-top:16px;padding-top:12px;border-top:2px solid #e2e8f0;">
            <div class="dp-rescisao-linha" style="font-weight:600;">
              <span>Total Bruto</span><span>${fmt(res.totalBruto)}</span>
            </div>
            <div class="dp-rescisao-linha" style="font-weight:600;color:#991b1b;">
              <span>Total Descontos</span><span>– ${fmt(res.totalDescontos)}</span>
            </div>
            <div class="dp-rescisao-linha total liquido" style="font-size:18px;font-weight:700;color:#2563eb;padding-top:10px;border-top:2px solid #2563eb;margin-top:6px;">
              <span>TOTAL LÍQUIDO A PAGAR</span><span>${fmt(res.totalLiquido)}</span>
            </div>
          </div>

          <div style="margin-top:16px;" class="dp-alert dp-alert-info">
            Prazo para pagamento: ${res.detalhamento?.prazoRescisao ? res.detalhamento.prazoRescisao.split('-').reverse().join('/') : '10 dias após desligamento'}
          </div>
          ${res.saldoFGTS > 0 ? `<div class="dp-alert dp-alert-warn" style="margin-top:8px;">
            Saldo FGTS utilizado no cálculo: ${fmt(res.saldoFGTS)}<br>
            Para valores exatos, consulte o extrato FGTS do colaborador.
          </div>` : ''}

          <div style="margin-top:16px;display:flex;gap:8px;">
            <button class="dp-btn dp-btn-primary" onclick="DPRescisao.abrirRegistro()">Registrar Rescisão</button>
            <button class="dp-btn dp-btn-secondary" onclick="window.print()">Imprimir</button>
          </div>
        </div>
      </div>`;
  };

  const abrirRegistro = () => {
    if (!resultadoSimulacao) return;
    alert('Para registrar a rescisão, preencha todos os dados do colaborador no sistema e confirme. Esta ação atualizará o status do colaborador para "Demitido" e gerará o termo de rescisão.');
  };

  // Cálculo local para modo offline (mesma lógica do backend)
  const calcularRescisaoLocal = (tipo, salario, admissao, desligamento, dependentes, feriasVencDias, saldoFGTSParam) => {
    const adm = new Date(admissao);
    const desl = new Date(desligamento);
    const totalDias = Math.floor((desl - adm) / 86400000);
    const anosCompletos = Math.floor(totalDias / 365);
    const mesesRestantes = Math.floor((totalDias % 365) / 30);
    const diasAviso = Math.min(30 + (anosCompletos * 3), 90);
    const meses13 = desl.getMonth() + 1;
    const mesesPeriodo = Math.min(desl.getMonth() + 1, 11);
    const ar = (v) => Math.round(v * 100) / 100;
    const vd = salario / 30;
    const saldoSal = ar(vd * desl.getDate());
    const ferProp = ar(vd * Math.floor((30 / 12) * mesesPeriodo));
    const ferVenc = ar(vd * feriasVencDias);
    const umTerco = ar((ferProp + ferVenc) / 3);
    const decimo = ar((salario / 12) * meses13);
    const saldoFGTS = saldoFGTSParam || ar(salario * 0.08 * (anosCompletos * 12 + mesesRestantes));
    let aviso = 0, multa = 0;
    if (tipo === 'Sem_Justa_Causa') { aviso = ar(vd * diasAviso); multa = ar(saldoFGTS * 0.40); }
    if (tipo === 'Acordo_Mutuo') { aviso = ar((vd * diasAviso) / 2); multa = ar(saldoFGTS * 0.20); }
    const ferJC = tipo === 'Justa_Causa' ? 0 : ferProp;
    const decJC = tipo === 'Justa_Causa' ? 0 : decimo;
    const totalBruto = ar(saldoSal + aviso + ferJC + ferVenc + umTerco + decJC + multa);
    const baseTrib = ar(saldoSal + aviso + decJC);
    const inss = calcINSSLocal(baseTrib);
    const irrf = calcIRRFLocal(baseTrib - inss - dependentes * 189.59);
    const totalDesc = ar(inss + irrf);
    return {
      tipo, anosServico: anosCompletos, mesesServico: mesesRestantes,
      saldoSalario: saldoSal, avisoPrevioIndenizado: aviso,
      feriasProporcionais: ferJC, feriasVencidas: ferVenc, umTercoFerias: umTerco,
      decimoTerceiroProporcional: decJC, saldoFGTS, multaFGTS: multa, outrosCreditos: 0,
      inss, irrf, outrasDeducoes: 0,
      totalBruto, totalDescontos: totalDesc, totalLiquido: ar(totalBruto - totalDesc),
      detalhamento: { diasAvisoPrevio: diasAviso, meses13, mesesFeriasProporcionais: mesesPeriodo },
    };
  };

  const calcINSSLocal = (base) => {
    const t = [[1412, 0.075], [2666.68, 0.09], [4000.03, 0.12], [7786.02, 0.14]];
    let v = 0, p = 0, b = Math.min(base, 7786.02);
    for (const [l, a] of t) { if (b <= p) break; v += (Math.min(b, l) - p) * a; p = l; if (b <= l) break; }
    return Math.round(v * 100) / 100;
  };

  const calcIRRFLocal = (base) => {
    if (base <= 2824) return 0;
    if (base <= 3751.05) return Math.max(0, Math.round((base * 0.075 - 211.80) * 100) / 100);
    if (base <= 4664.68) return Math.round((base * 0.15 - 492.60) * 100) / 100;
    if (base <= 6101.06) return Math.round((base * 0.225 - 842.17) * 100) / 100;
    return Math.round((base * 0.275 - 1147.70) * 100) / 100;
  };

  return { render, abrirRegistro };
})();

window.DPRescisao = DPRescisao;
