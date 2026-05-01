/**
 * dp-dashboard.js — Dashboard Gerencial do Departamento Pessoal
 */
const DPDashboard = (() => {
  const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtN = (v) => (v || 0).toLocaleString('pt-BR');

  const prioIcon = { Critica: '🔴', Alta: '🟠', Normal: '🔵', Baixa: '⚪' };
  const tipoLabel = {
    Ferias_Vencendo: 'Férias vencendo', Experiencia_Vencendo: 'Experiência vencendo',
    Prazo_Legal: 'Prazo legal', Falta_Colaborador: 'Falta', Alerta_Geral: 'Alerta',
  };

  // ── helpers inline ────────────────────────────────────────────────────────
  const card = (label, value, sub, cor) => `
    <div class="dp-card" style="--card-accent:${cor || 'var(--primary,#1B56D6)'}">
      <div class="dp-card-label">${label}</div>
      <div class="dp-card-value">${value}</div>
      ${sub ? `<div class="dp-card-sub">${sub}</div>` : ''}
    </div>`;

  const fmtD = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';

  // ── offline (sem backend) ─────────────────────────────────────────────────
  const htmlOffline = () => `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="dp-alert dp-alert-warn">
        <strong>Backend desconectado.</strong>
        Os simuladores de cálculo (Rescisão, 13º, Férias, INSS) funcionam normalmente offline.
        Para dados reais inicie o servidor:<br>
        <code style="display:block;margin-top:8px;padding:8px 12px;background:rgba(0,0,0,0.07);
          border-radius:6px;font-size:12px;font-family:monospace;">
          cd dp-backend &amp;&amp; npm install &amp;&amp; npm run dev
        </code>
      </div>
      <div class="dp-cards-grid">
        ${card('Colaboradores',  '—', 'Conectar backend', '#64748b')}
        ${card('Folha do Mês',   '—', 'Conectar backend', '#64748b')}
        ${card('FGTS Estimado',  '—', '8% remuneração',   '#64748b')}
        ${card('13º Salário',    '—', 'Use o simulador',  '#64748b')}
        ${card('Rescisões',      '—', 'Use o simulador',  '#64748b')}
        ${card('Notificações',   '—', 'Conectar backend', '#64748b')}
      </div>
      <div class="dp-alert dp-alert-info">
        Use as abas <strong>Rescisão</strong>, <strong>13º Salário</strong> e <strong>Férias</strong>
        para calcular valores sem precisar do backend.
      </div>
    </div>`;

  // ── render principal ──────────────────────────────────────────────────────
  const render = async (container) => {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-size:13px;">
      Carregando dashboard...</div>`;
    try {
      const dados = await DPService.dashboard();
      container.innerHTML = htmlDashboard(dados);
    } catch (err) {
      container.innerHTML = htmlOffline();
    }
  };

  // ── HTML do dashboard (dados reais) ──────────────────────────────────────
  const htmlDashboard = (d) => {
    const col   = d.colaboradores || {};
    const folha = d.folhaMes;
    const notifs = d.notificacoes || [];
    const qtdAlerta = notifs.filter(n => ['Alta','Critica'].includes(n.prioridade))
                            .reduce((s, n) => s + parseInt(n.qtd || 0), 0);
    const custoTotal = folha
      ? parseFloat(folha.total_proventos || 0) + parseFloat(folha.total_fgts || 0) + parseFloat(folha.total_inss_empresa || 0)
      : 0;

    return `
    <div style="display:flex;flex-direction:column;gap:20px;">

      <div class="dp-cards-grid">
        ${card('Colaboradores Ativos',  fmtN(col.ativos),
               col.admitidos_mes > 0 ? `+${col.admitidos_mes} este mês` : 'Total ativo', '#1B56D6')}
        ${card('Folha Líquida',         folha ? fmt(folha.total_liquido) : '—',
               folha ? `${String(folha.mes).padStart(2,'0')}/${folha.ano} — ${folha.status}` : 'Abrir um período', '#16a34a')}
        ${card('Custo Total Empresa',   custoTotal ? fmt(custoTotal) : '—',
               'Salário + FGTS + INSS patronal', '#7C22E8')}
        ${card('FGTS do Mês',          folha ? fmt(folha.total_fgts) : '—', '8% remuneração bruta', '#d97706')}
        ${card('INSS Patronal',        folha ? fmt(folha.total_inss_empresa) : '—', '≈27,8% sobre folha', '#dc2626')}
        ${card('Alertas',              fmtN(qtdAlerta),
               qtdAlerta > 0 ? 'Requerem atenção' : 'Nenhum urgente',
               qtdAlerta > 0 ? '#dc2626' : '#16a34a')}
        ${card('Em Férias',            fmtN(col.em_ferias),  'Colaboradores ausentes',  '#0891b2')}
        ${card('Afastados',            fmtN(col.afastados),  'Licenças e INSS',         col.afastados > 0 ? '#d97706' : '#64748b')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="dp-table-wrap">
          <div class="dp-table-header">
            <span class="dp-table-title">Alertas Prioritários</span>
          </div>
          ${buildAlerts(d)}
        </div>

        <div class="dp-table-wrap">
          <div class="dp-table-header">
            <span class="dp-table-title">Custo por Departamento</span>
          </div>
          <table class="dp-table">
            <thead><tr><th>Departamento</th><th>Pessoas</th><th class="moeda">Folha</th><th class="moeda">Encargos*</th></tr></thead>
            <tbody>
              ${(d.encargos || []).map(e => `
                <tr>
                  <td>${e.departamento || '—'}</td>
                  <td>${e.colaboradores}</td>
                  <td class="moeda">${fmt(e.total_salarios)}</td>
                  <td class="moeda">${fmt(e.total_encargos_estimado)}</td>
                </tr>`).join('') || noData(4)}
            </tbody>
          </table>
          <div style="padding:6px 14px;font-size:11px;color:#64748b;">*Estimativa FGTS + INSS + RAT</div>
        </div>
      </div>

      ${(d.historicoFolha && d.historicoFolha.length) ? `
      <div class="dp-table-wrap">
        <div class="dp-table-header"><span class="dp-table-title">Histórico de Folha</span></div>
        <table class="dp-table">
          <thead><tr>
            <th>Competência</th><th class="moeda">Proventos</th><th class="moeda">Descontos</th>
            <th class="moeda">Líquido</th><th class="moeda">FGTS</th><th class="moeda">Custo Total</th>
          </tr></thead>
          <tbody>
            ${d.historicoFolha.map(h => `
              <tr>
                <td>${String(h.mes).padStart(2,'0')}/${h.ano}</td>
                <td class="moeda">${fmt(h.total_proventos)}</td>
                <td class="moeda">${fmt(h.total_descontos || 0)}</td>
                <td class="moeda">${fmt(h.total_liquido)}</td>
                <td class="moeda">${fmt(h.total_fgts)}</td>
                <td class="moeda"><strong>${fmt(h.custo_total)}</strong></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

    </div>`;
  };

  const buildAlerts = (d) => {
    const ferias  = (d.alertas && d.alertas.feriasVencendo) || [];
    const notifs  = d.notificacoes || [];
    const items   = [];

    ferias.forEach(f => {
      const dr = f.dias_restantes;
      items.push({ icon: '🌴', cor: dr <= 30 ? 'alta' : 'normal',
        titulo: f.nome_completo,
        msg: `${f.dias_saldo} dias — vence ${fmtD(f.data_limite_gozo)} (${dr} dias)` });
    });
    notifs.forEach(n => {
      items.push({ icon: prioIcon[n.prioridade] || '🔔', cor: n.prioridade.toLowerCase(),
        titulo: tipoLabel[n.tipo] || n.tipo, msg: `${n.qtd} ocorrência(s)` });
    });

    if (!items.length) {
      return `<div style="padding:20px;text-align:center;color:#64748b;font-size:13px;">
                Nenhum alerta pendente.</div>`;
    }
    return items.map(i => `
      <div class="dp-notif-item">
        <div class="dp-notif-icon ${i.cor}">${i.icon}</div>
        <div class="dp-notif-content">
          <div class="dp-notif-titulo">${i.titulo}</div>
          <div class="dp-notif-msg">${i.msg}</div>
        </div>
      </div>`).join('');
  };

  const noData = (cols) =>
    `<tr><td colspan="${cols}" style="text-align:center;padding:20px;color:#64748b;">Sem dados.</td></tr>`;

  return { render };
})();

window.DPDashboard = DPDashboard;
