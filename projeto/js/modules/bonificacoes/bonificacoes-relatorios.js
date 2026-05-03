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
      <div style="display:flex;gap:8px">
        <div style="position:relative">
          <button class="dp-btn dp-btn-secondary" style="font-size:11px;display:flex;align-items:center;gap:5px" onclick="bnfToggleExportMenu('bnf-rel-emenu')">
            ⬇️ Exportar <span style="font-size:9px;opacity:.7">▾</span>
          </button>
          <div id="bnf-rel-emenu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid var(--border-color,#e2e8f0);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:200;min-width:190px;overflow:hidden">
            <div style="padding:8px 16px 4px;font-size:9px;font-weight:700;color:var(--text-muted,#94a3b8);letter-spacing:.5px;text-transform:uppercase">Ranking</div>
            <button onclick="bnfRelExportarExcel();bnfToggleExportMenu('bnf-rel-emenu')" style="display:flex;align-items:center;gap:9px;padding:8px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='transparent'">🟢 Excel (.xlsx)</button>
            <button onclick="bnfRelExportarPDF();bnfToggleExportMenu('bnf-rel-emenu')" style="display:flex;align-items:center;gap:9px;padding:8px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">🔴 PDF (.pdf)</button>
            <button onclick="bnfRelExportarWord();bnfToggleExportMenu('bnf-rel-emenu')" style="display:flex;align-items:center;gap:9px;padding:8px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">🔵 Word (.doc)</button>
            <div style="height:1px;background:var(--border-color,#e2e8f0);margin:2px 0"></div>
            <button onclick="bnfRelExportarRanking();bnfToggleExportMenu('bnf-rel-emenu')" style="display:flex;align-items:center;gap:9px;padding:8px 16px;width:100%;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;text-align:left;color:var(--text-muted,#64748b)" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">⬜ CSV</button>
          </div>
        </div>
      </div>
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

  // ─── HELPERS INTERNOS ────────────────────────────────────
  function _buildRanking() {
    const db  = BonifDB.get();
    const map = {};
    db.bonus_ciclos.forEach(c => {
      (c.itens||[]).forEach(i => {
        if (!i.elegivel) return;
        if (!map[i.colaborador_id]) map[i.colaborador_id] = { nome:i.colaborador_nome, cargo:i.cargo||'—', setor:i.setor||'—', total:0, ciclos:0 };
        map[i.colaborador_id].total  += i.valor_calculado;
        map[i.colaborador_id].ciclos += 1;
      });
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }

  function _buildLancamentos() {
    const db = BonifDB.get();
    return db.lancamentos.slice().sort((a,b) => a.mes.localeCompare(b.mes));
  }

  // ─── EXPORTAR EXCEL ──────────────────────────────────────
  window.bnfRelExportarExcel = function() {
    if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
    const ranking     = _buildRanking();
    const lancamentos = _buildLancamentos();
    if (!ranking.length && !lancamentos.length) { alert('Sem dados para exportar.'); return; }

    const wb = XLSX.utils.book_new();

    // Aba 1 — Ranking
    if (ranking.length) {
      const colsR = ['Posição','Colaborador','Cargo','Setor','Ciclos','Total Bonificado (R$)'];
      const rowsR = ranking.map((c, i) => [i+1, c.nome, c.cargo, c.setor, c.ciclos, c.total]);
      const wsR   = XLSX.utils.aoa_to_sheet([colsR, ...rowsR]);
      wsR['!cols'] = [8,30,22,18,8,22].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, wsR, 'Ranking');
    }

    // Aba 2 — Todos os lançamentos
    if (lancamentos.length) {
      const colsL = ['#','Mês','Colaborador','Cargo','Setor','Tipo de Bônus','Motivo','Salário Base','Bônus (R$)','Status'];
      const rowsL = lancamentos.map((l, i) => [
        i+1, BonifFmt.mesNome(l.mes), l.colaborador_nome, l.cargo, l.setor,
        l.tipo_nome, l.descricao, l.salario_base||0, l.valor_final||0, l.status,
      ]);
      const totalL = lancamentos.reduce((s,l)=>s+(l.valor_final||0),0);
      rowsL.push(['','','TOTAL','','','','','',totalL,'']);
      const wsL   = XLSX.utils.aoa_to_sheet([colsL, ...rowsL]);
      wsL['!cols'] = [5,12,28,20,16,22,28,16,16,14].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, wsL, 'Lançamentos');
    }

    XLSX.writeFile(wb, 'relatorio_bonificacoes.xlsx');
    _toastRel('🟢 Excel gerado com sucesso!');
  };

  // ─── EXPORTAR PDF ────────────────────────────────────────
  window.bnfRelExportarPDF = function() {
    if (typeof window.jspdf === 'undefined') { alert('Biblioteca jsPDF não carregada.'); return; }
    const ranking     = _buildRanking();
    const lancamentos = _buildLancamentos();
    if (!ranking.length && !lancamentos.length) { alert('Sem dados para exportar.'); return; }

    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF({ orientation: 'landscape' });
    const trunc = (s, n) => s && s.length > n ? s.slice(0, n-2) + '..' : (s || '—');
    const tableW = 264;

    const _drawBand = (y, txt, subTxt) => {
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 297, 14, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('hi Conecta RH — Relatório de Bonificações', 10, 9);
      doc.text(new Date().toLocaleDateString('pt-BR'), 287, 9, { align:'right' });
      doc.setTextColor(30, 41, 59); doc.setFontSize(14);
      doc.text(txt, 10, y);
      if (subTxt) { doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139); doc.text(subTxt, 10, y+7); }
    };

    // PÁGINA 1 — Ranking
    if (ranking.length) {
      const totalR = ranking.reduce((s,c)=>s+c.total,0);
      _drawBand(24, 'Ranking de Colaboradores', `${ranking.length} colaboradores · Total: ${BonifFmt.moeda(totalR)}`);
      let y = 37;
      const rCols = [
        { label:'Pos.',        w:12,  x:10  },
        { label:'Colaborador', w:60,  x:22  },
        { label:'Cargo',       w:40,  x:82  },
        { label:'Setor',       w:35,  x:122 },
        { label:'Ciclos',      w:18,  x:157 },
        { label:'Total (R$)',  w:36,  x:175 },
      ];
      doc.setFillColor(37,99,235); doc.rect(10,y,tableW,8,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
      rCols.forEach(c => doc.text(c.label, c.x+1, y+5.5));
      y += 8;
      doc.setFont('helvetica','normal');
      ranking.forEach((c, i) => {
        if (y > 193) { doc.addPage(); y=16; }
        doc.setFillColor(i%2===0?248:255, i%2===0?250:255, i%2===0?252:255);
        doc.rect(10,y,tableW,7,'F'); doc.setDrawColor(226,232,240); doc.rect(10,y,tableW,7,'D');
        doc.setTextColor(30,41,59); doc.setFontSize(7);
        doc.text(String(i+1), rCols[0].x+1, y+5);
        doc.text(trunc(c.nome,28),  rCols[1].x+1, y+5);
        doc.text(trunc(c.cargo,20), rCols[2].x+1, y+5);
        doc.text(trunc(c.setor,17), rCols[3].x+1, y+5);
        doc.text(String(c.ciclos),  rCols[4].x+1, y+5);
        doc.setFont('helvetica','bold'); doc.setTextColor(22,163,74);
        doc.text(BonifFmt.moeda(c.total), rCols[5].x+1, y+5);
        doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
        y += 7;
      });
      // total
      doc.setFillColor(37,99,235); doc.rect(10,y,tableW,8,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(7);
      doc.text('TOTAL', rCols[1].x+1, y+5.5);
      doc.text(BonifFmt.moeda(totalR), rCols[5].x+1, y+5.5);
    }

    // PÁGINA 2 — Lançamentos (se houver)
    if (lancamentos.length) {
      doc.addPage();
      const totalL = lancamentos.reduce((s,l)=>s+(l.valor_final||0),0);
      _drawBand(24, 'Todos os Lançamentos', `${lancamentos.length} lançamentos · Total: ${BonifFmt.moeda(totalL)}`);
      let y = 37;
      const lCols = [
        { label:'#',           w:7,  x:10  },
        { label:'Mês',         w:18, x:17  },
        { label:'Colaborador', w:48, x:35  },
        { label:'Cargo',       w:32, x:83  },
        { label:'Tipo',        w:32, x:115 },
        { label:'Motivo',      w:35, x:147 },
        { label:'Bônus (R$)',  w:26, x:182 },
        { label:'Status',      w:20, x:208 },
      ];
      doc.setFillColor(37,99,235); doc.rect(10,y,tableW,8,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
      lCols.forEach(c => doc.text(c.label, c.x+1, y+5.5));
      y += 8;
      doc.setFont('helvetica','normal');
      lancamentos.forEach((l, i) => {
        if (y > 193) { doc.addPage(); y=16; }
        doc.setFillColor(i%2===0?248:255, i%2===0?250:255, i%2===0?252:255);
        doc.rect(10,y,tableW,7,'F'); doc.setDrawColor(226,232,240); doc.rect(10,y,tableW,7,'D');
        doc.setTextColor(30,41,59); doc.setFontSize(7);
        doc.text(String(i+1),                    lCols[0].x+1, y+5);
        doc.text(BonifFmt.mesNome(l.mes),         lCols[1].x+1, y+5);
        doc.text(trunc(l.colaborador_nome,22),    lCols[2].x+1, y+5);
        doc.text(trunc(l.cargo,16),               lCols[3].x+1, y+5);
        doc.text(trunc(l.tipo_nome,16),           lCols[4].x+1, y+5);
        doc.text(trunc(l.descricao,17),           lCols[5].x+1, y+5);
        doc.setFont('helvetica','bold'); doc.setTextColor(22,163,74);
        doc.text(BonifFmt.moeda(l.valor_final||0),lCols[6].x+1, y+5);
        doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
        doc.text(l.status||'—',                   lCols[7].x+1, y+5);
        y += 7;
      });
      doc.setFillColor(37,99,235); doc.rect(10,y,tableW,8,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(7);
      doc.text('TOTAL', lCols[2].x+1, y+5.5);
      doc.text(BonifFmt.moeda(totalL), lCols[6].x+1, y+5.5);
    }

    // Rodapé
    const nPags = doc.internal.getNumberOfPages();
    for (let p=1;p<=nPags;p++) {
      doc.setPage(p); doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 10, 205);
      doc.text(`Página ${p} de ${nPags}`, 287, 205, { align:'right' });
    }

    doc.save('relatorio_bonificacoes.pdf');
    _toastRel('🔴 PDF gerado com sucesso!');
  };

  // ─── EXPORTAR WORD ───────────────────────────────────────
  window.bnfRelExportarWord = function() {
    const ranking     = _buildRanking();
    const lancamentos = _buildLancamentos();
    if (!ranking.length && !lancamentos.length) { alert('Sem dados para exportar.'); return; }

    const totalR = ranking.reduce((s,c)=>s+c.total,0);
    const totalL = lancamentos.reduce((s,l)=>s+(l.valor_final||0),0);
    const gerado = new Date().toLocaleString('pt-BR');

    const rankHtml = ranking.length ? `
      <h2>🏆 Ranking de Colaboradores</h2>
      <p><b>Total bonificado:</b> ${BonifFmt.moeda(totalR)} · <b>Colaboradores:</b> ${ranking.length}</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt">
        <thead><tr style="background:#2563eb;color:#fff">
          <th>Pos.</th><th>Colaborador</th><th>Cargo</th><th>Setor</th><th>Ciclos</th><th>Total (R$)</th>
        </tr></thead>
        <tbody>
          ${ranking.map((c,i)=>`<tr style="background:${i%2===0?'#f8fafc':'#fff'}">
            <td style="text-align:center">${i+1}</td>
            <td><b>${c.nome}</b></td><td>${c.cargo}</td><td>${c.setor}</td>
            <td style="text-align:center">${c.ciclos}</td>
            <td style="text-align:right;color:#16a34a;font-weight:bold">${BonifFmt.moeda(c.total)}</td>
          </tr>`).join('')}
          <tr style="background:#dbeafe;font-weight:bold">
            <td colspan="5" style="text-align:right">TOTAL</td>
            <td style="text-align:right;color:#1e40af">${BonifFmt.moeda(totalR)}</td>
          </tr>
        </tbody>
      </table>` : '';

    const lancHtml = lancamentos.length ? `
      <h2 style="margin-top:30pt">📋 Todos os Lançamentos</h2>
      <p><b>Total:</b> ${BonifFmt.moeda(totalL)} · <b>Lançamentos:</b> ${lancamentos.length}</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:9pt">
        <thead><tr style="background:#2563eb;color:#fff">
          <th>#</th><th>Mês</th><th>Colaborador</th><th>Cargo</th><th>Tipo</th><th>Motivo</th><th>Bônus (R$)</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${lancamentos.map((l,i)=>`<tr style="background:${i%2===0?'#f8fafc':'#fff'}">
            <td style="text-align:center">${i+1}</td>
            <td>${BonifFmt.mesNome(l.mes)}</td>
            <td><b>${l.colaborador_nome||'—'}</b></td>
            <td>${l.cargo||'—'}</td>
            <td>${l.tipo_nome||'—'}</td>
            <td>${l.descricao||'—'}</td>
            <td style="text-align:right;color:#16a34a;font-weight:bold">${BonifFmt.moeda(l.valor_final||0)}</td>
            <td style="text-align:center">${l.status||'—'}</td>
          </tr>`).join('')}
          <tr style="background:#dbeafe;font-weight:bold">
            <td colspan="6" style="text-align:right">TOTAL GERAL</td>
            <td style="text-align:right;color:#1e40af">${BonifFmt.moeda(totalL)}</td><td></td>
          </tr>
        </tbody>
      </table>` : '';

    const html = `${rankHtml}${lancHtml}
      <p style="margin-top:20pt;font-size:9pt;color:#64748b">Gerado em ${gerado} · hi Conecta RH</p>`;

    ExportService.word('Relatorio_Bonificacoes', html);
    _toastRel('🔵 Word gerado com sucesso!');
  };

  function _toastRel(msg, tipo='ok') {
    document.querySelectorAll('.bnf-rel-toast').forEach(e=>e.remove());
    const el = document.createElement('div');
    el.className = `dpa-toast dpa-toast-${tipo} bnf-rel-toast`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300);},4000);
  }

  return { render };
})();
