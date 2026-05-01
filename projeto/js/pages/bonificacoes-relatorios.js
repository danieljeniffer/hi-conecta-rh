/**
 * bonificacoes-relatorios.js — Relatórios, Ranking e Analytics
 * Expõe: window.BonifRelatorios
 */
window.BonifRelatorios = (() => {

  function render(container) {
    const db     = BonifDB.get();
    const colabs = BonifColabs.getAll();
    const ciclos = db.bonus_ciclos;
    const forms  = db.forms;

    if (ciclos.length === 0 && db.form_respostas.length === 0) {
      container.innerHTML = `
<div class="bnf-card">
  <div class="bnf-empty">
    <span class="bnf-empty-icon">📈</span>
    <p>Nenhum dado disponível para relatórios</p>
    <small>Gere um ciclo de bonificação ou colete respostas de formulários para ver os relatórios.</small>
  </div>
</div>`;
      return;
    }

    // Dados consolidados
    const totalBonus = ciclos.reduce((s,c)=>s+(c.itens?.reduce((ss,i)=>ss+(i.elegivel?i.valor_calculado:0),0)||0),0);
    const totalElegiv= ciclos.reduce((s,c)=>s+(c.itens?.filter(i=>i.elegivel).length||0),0);
    const economiaMO = totalBonus * 0.03;

    // Ranking por colaborador
    const rankMap = {};
    ciclos.forEach(c => {
      (c.itens||[]).forEach(i => {
        if (!i.elegivel) return;
        if (!rankMap[i.colaborador_id]) rankMap[i.colaborador_id] = { nome:i.colaborador_nome, cargo:i.cargo, setor:i.setor, total:0, ciclos:0 };
        rankMap[i.colaborador_id].total  += i.valor_calculado;
        rankMap[i.colaborador_id].ciclos += 1;
      });
    });
    const ranking = Object.values(rankMap).sort((a,b)=>b.total-a.total);

    // Consolidado por mês
    const porMes = ciclos.map(c => ({
      mes: c.mes,
      total: c.itens?.reduce((s,i)=>s+(i.elegivel?i.valor_calculado:0),0)||0,
      status:c.status,
    })).sort((a,b)=>a.mes.localeCompare(b.mes));

    // Consolidado por tipo de bônus
    const porTipo = {};
    ciclos.forEach(c => {
      (c.itens||[]).filter(i=>i.elegivel).forEach(i => {
        const rg = db.bonus_regras.find(r=>r.id===i.regra_id);
        const tp = rg?.bonus_tipo_id||'desconhecido';
        const tpObj = db.bonus_tipos.find(t=>t.id===tp);
        if (!porTipo[tp]) porTipo[tp] = { nome:tpObj?.nome||tp, total:0, count:0 };
        porTipo[tp].total  += i.valor_calculado;
        porTipo[tp].count  += 1;
      });
    });
    const tiposList = Object.values(porTipo).sort((a,b)=>b.total-a.total);
    const maxTipo   = Math.max(...tiposList.map(t=>t.total),1);

    // Gráfico de barras por mês
    const maxMes = Math.max(...porMes.map(m=>m.total),1);

    container.innerHTML = `
<div>
  <!-- KPIs resumo -->
  <div class="bnf-kpis" style="margin-bottom:20px">
    <div class="bnf-kpi bnf-kpi-green">
      <span class="bnf-kpi-icon">💰</span>
      <span class="bnf-kpi-val">${BonifFmt.moeda(totalBonus)}</span>
      <span class="bnf-kpi-label">Total bonificado</span>
      <span class="bnf-kpi-sub">${ciclos.length} ciclo(s)</span>
    </div>
    <div class="bnf-kpi bnf-kpi-blue">
      <span class="bnf-kpi-icon">👥</span>
      <span class="bnf-kpi-val">${totalElegiv}</span>
      <span class="bnf-kpi-label">Pagamentos realizados</span>
      <span class="bnf-kpi-sub">Únicos por ciclo</span>
    </div>
    <div class="bnf-kpi bnf-kpi-teal">
      <span class="bnf-kpi-icon">📋</span>
      <span class="bnf-kpi-val">${db.form_respostas.length}</span>
      <span class="bnf-kpi-label">Respostas coletadas</span>
      <span class="bnf-kpi-sub">${forms.length} formulários</span>
    </div>
    <div class="bnf-kpi bnf-kpi-green">
      <span class="bnf-kpi-icon">💡</span>
      <span class="bnf-kpi-val">${BonifFmt.moeda(economiaMO)}</span>
      <span class="bnf-kpi-label">Economia estimada</span>
      <span class="bnf-kpi-sub">vs. controle manual</span>
    </div>
  </div>

  <div class="bnf-2col">
    <!-- Gráfico por mês -->
    <div class="bnf-card">
      <div class="bnf-card-hd"><h4>📊 Bonificação por Mês</h4></div>
      ${porMes.length === 0
        ? `<div class="bnf-empty"><span class="bnf-empty-icon">📊</span><p>Sem dados ainda</p></div>`
        : `<div class="bnf-chart">
          ${porMes.map(m=>`
            <div class="bnf-bar-row">
              <span class="bnf-bar-label">${BonifFmt.mesNome(m.mes)}</span>
              <div class="bnf-bar-wrap">
                <div class="bnf-bar-fill" style="width:${Math.round(m.total/maxMes*100)}%;background:${m.status==='pago'?'#22c55e':m.status==='aprovado'?'#3b82f6':'#f59e0b'}"></div>
              </div>
              <span class="bnf-bar-pct">${BonifFmt.moeda(m.total)}</span>
            </div>`).join('')}
        </div>
        <div style="margin-top:10px;display:flex;gap:12px;font-size:11px;flex-wrap:wrap">
          <span><span style="display:inline-block;width:10px;height:10px;background:#22c55e;border-radius:2px;margin-right:4px"></span>Pago</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:2px;margin-right:4px"></span>Aprovado</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#f59e0b;border-radius:2px;margin-right:4px"></span>Calculado</span>
        </div>`}
    </div>

    <!-- Distribuição por tipo -->
    <div class="bnf-card">
      <div class="bnf-card-hd"><h4>💰 Distribuição por Tipo</h4></div>
      ${tiposList.length === 0
        ? `<div class="bnf-empty"><span class="bnf-empty-icon">💰</span><p>Sem dados ainda</p></div>`
        : `<div class="bnf-chart">
          ${tiposList.map(t=>`
            <div class="bnf-bar-row">
              <span class="bnf-bar-label" title="${t.nome}">${t.nome}</span>
              <div class="bnf-bar-wrap">
                <div class="bnf-bar-fill" style="width:${Math.round(t.total/maxTipo*100)}%;background:#7c3aed"></div>
              </div>
              <span class="bnf-bar-pct">${BonifFmt.moeda(t.total)}</span>
            </div>`).join('')}
        </div>`}
    </div>
  </div>

  <!-- Ranking de colaboradores -->
  <div class="bnf-card" style="margin-top:16px">
    <div class="bnf-card-hd">
      <h4>🏆 Ranking de Colaboradores — Maior Bonificação Total</h4>
      <button class="dp-btn dp-btn-secondary" style="font-size:11px" onclick="bnfRelExportarRanking()">📊 Exportar CSV</button>
    </div>
    ${ranking.length === 0
      ? `<div class="bnf-empty"><span class="bnf-empty-icon">🏆</span><p>Nenhum dado de ranking disponível</p></div>`
      : `<div class="bnf-ranking">
          ${ranking.map((c,i) => `
            <div class="bnf-rank-item">
              <div class="bnf-rank-pos bnf-rank-pos-${i<3?i+1:'n'}">${i+1}</div>
              <div class="bnf-colab-avatar" style="background:${i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'var(--primary,#2563eb)'}">${BonifFmt.ini(c.nome)}</div>
              <div class="bnf-colab-info" style="flex:1">
                <strong>${c.nome}</strong>
                <small>${c.cargo||'—'} · ${c.setor||'—'} · ${c.ciclos} ciclo(s)</small>
              </div>
              <span class="bnf-rank-val">${BonifFmt.moeda(c.total)}</span>
            </div>`).join('')}
        </div>`}
  </div>

  <!-- Insights automáticos -->
  ${_renderInsightsAvancados(ranking, tiposList, porMes, colabs)}

  <!-- Auditoria recente -->
  <div class="bnf-card" style="margin-top:16px">
    <div class="bnf-card-hd"><h4>📋 Log de Auditoria</h4></div>
    ${db.auditoria.slice(0,8).map(a=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color,#f1f5f9)">
        <span style="font-size:14px">📝</span>
        <div style="flex:1">
          <strong style="font-size:12px">${a.acao?.replace(/_/g,' ')}</strong>
          <small style="display:block;color:var(--text-muted)">${a.detalhes} · por ${a.por}</small>
        </div>
        <small style="color:var(--text-muted);white-space:nowrap">${BonifFmt.data(a.em)}</small>
      </div>`).join('')}
    ${db.auditoria.length === 0 ? `<p style="color:var(--text-muted);font-size:13px;margin:0">Nenhuma ação registrada.</p>` : ''}
  </div>
</div>`;
  }

  function _renderInsightsAvancados(ranking, tipos, porMes, colabs) {
    const insights = [];
    if (ranking.length > 0) {
      const lider = ranking[0];
      insights.push({ icon:'🏆', titulo:'Destaque do período', texto:`${lider.nome} lidera o ranking com ${BonifFmt.moeda(lider.total)} em bonificações acumuladas em ${lider.ciclos} ciclo(s).` });
    }
    if (porMes.length >= 2) {
      const ult = porMes[porMes.length-1];
      const ant = porMes[porMes.length-2];
      const var_ = ult.total - ant.total;
      if (Math.abs(var_) > 0) insights.push({
        icon: var_ > 0 ? '📈' : '📉',
        titulo:`${var_ > 0 ? 'Alta' : 'Queda'} vs. mês anterior`,
        texto:`A bonificação de ${BonifFmt.mesNome(ult.mes)} foi ${BonifFmt.moeda(Math.abs(var_))} ${var_>0?'maior':'menor'} que ${BonifFmt.mesNome(ant.mes)}.`,
      });
    }
    if (colabs.length > 0 && ranking.length > 0) {
      const elegPct = Math.round((ranking.length / colabs.length)*100);
      insights.push({ icon:'📊', titulo:'Taxa de elegibilidade', texto:`${elegPct}% dos colaboradores (${ranking.length} de ${colabs.length}) receberam pelo menos um bônus nos ciclos calculados.` });
    }
    if (!insights.length) return '';
    return `
<div style="margin-top:16px">
  <h4 style="font-size:14px;font-weight:700;margin:0 0 12px">🧠 Insights Automáticos</h4>
  ${insights.map(ins=>`
    <div class="bnf-insight" style="margin-bottom:10px">
      <span class="bnf-insight-icon">${ins.icon}</span>
      <div class="bnf-insight-body"><strong>${ins.titulo}</strong><p>${ins.texto}</p></div>
    </div>`).join('')}
</div>`;
  }

  window.bnfRelExportarRanking = function() {
    const db = BonifDB.get();
    const ciclos = db.bonus_ciclos;
    const rankMap = {};
    ciclos.forEach(c => {
      (c.itens||[]).forEach(i => {
        if (!i.elegivel) return;
        if (!rankMap[i.colaborador_id]) rankMap[i.colaborador_id] = { nome:i.colaborador_nome, cargo:i.cargo, setor:i.setor, total:0, ciclos:0 };
        rankMap[i.colaborador_id].total  += i.valor_calculado;
        rankMap[i.colaborador_id].ciclos += 1;
      });
    });
    const ranking = Object.values(rankMap).sort((a,b)=>b.total-a.total);
    const headers = ['Posição','Colaborador','Cargo','Setor','Ciclos','Total (R$)'];
    const linhas  = [headers.join(','), ...ranking.map((c,i)=>[i+1,`"${c.nome}"`,`"${c.cargo}"`,`"${c.setor}"`,c.ciclos,c.total.toFixed(2)].join(','))];
    const blob = new Blob(['﻿'+linhas.join('\n')],{type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='ranking_bonus.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return { render };
})();
