function renderIndicadores() {
  return `
  <div class="depto-page">

    <!-- CARDS RESUMO -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📉</div>
        <div class="depto-card-info">
          <strong>4,2%</strong>
          <span>Turnover mensal</span>
        </div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">⏱️</div>
        <div class="depto-card-info">
          <strong>18 dias</strong>
          <span>Tempo médio de contratação</span>
        </div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">😊</div>
        <div class="depto-card-info">
          <strong>87%</strong>
          <span>Satisfação dos colaboradores</span>
        </div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">🎯</div>
        <div class="depto-card-info">
          <strong>92%</strong>
          <span>Metas atingidas</span>
        </div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">📊</div>
        <div class="depto-card-info">
          <strong>32</strong>
          <span>Total de colaboradores ativos</span>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="ind-grid">

      <!-- TURNOVER -->
      <div class="depto-section">
        <div class="section-header">
          <h3>Turnover Mensal</h3>
          <span class="mes-badge">Jan → Mai/2025</span>
        </div>
        <div class="bar-chart">
          ${[
            { mes: 'Jan', valor: 3.1, max: 8 },
            { mes: 'Fev', valor: 2.8, max: 8 },
            { mes: 'Mar', valor: 5.2, max: 8 },
            { mes: 'Abr', valor: 3.9, max: 8 },
            { mes: 'Mai', valor: 4.2, max: 8 },
          ].map(b => `
            <div class="bar-item">
              <div class="bar-wrap">
                <div class="bar-fill" style="height:${(b.valor/b.max)*100}%" title="${b.valor}%"></div>
              </div>
              <span class="bar-val">${b.valor}%</span>
              <span class="bar-label">${b.mes}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- HEADCOUNT -->
      <div class="depto-section">
        <div class="section-header">
          <h3>Headcount por Departamento</h3>
        </div>
        <div class="hc-list">
          ${[
            { depto: 'Comercial',         qtd: 10, cor: '#2563eb' },
            { depto: 'Operações',         qtd: 8,  cor: '#16a34a' },
            { depto: 'Administrativo',    qtd: 6,  cor: '#d97706' },
            { depto: 'TI',                qtd: 4,  cor: '#7c3aed' },
            { depto: 'RH',                qtd: 4,  cor: '#dc2626' },
          ].map(h => `
            <div class="hc-item">
              <span class="hc-label">${h.depto}</span>
              <div class="hc-bar-wrap">
                <div class="hc-bar-fill" style="width:${(h.qtd/10)*100}%;background:${h.cor}"></div>
              </div>
              <span class="hc-qtd">${h.qtd}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- SEGUNDA LINHA -->
    <div class="ind-grid">

      <!-- ABSENTEÍSMO -->
      <div class="depto-section">
        <div class="section-header">
          <h3>Absenteísmo</h3>
          <span class="mes-badge">Maio/2025</span>
        </div>
        <div class="abs-list">
          ${[
            { nome: 'João Silva',     dias: 2, motivo: 'Atestado médico' },
            { nome: 'Maria Oliveira', dias: 1, motivo: 'Falta justificada' },
            { nome: 'Paulo Santos',   dias: 3, motivo: 'Atestado médico' },
            { nome: 'Ana Lima',       dias: 0, motivo: '—' },
          ].map(a => `
            <div class="abs-item">
              <div class="abs-avatar">${a.nome.split(' ').map(n=>n[0]).join('')}</div>
              <div class="abs-info">
                <strong>${a.nome}</strong>
                <small>${a.motivo}</small>
              </div>
              <span class="abs-dias ${a.dias > 0 ? 'com-falta' : 'sem-falta'}">${a.dias} dia${a.dias !== 1 ? 's' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- METAS RH -->
      <div class="depto-section">
        <div class="section-header">
          <h3>Metas de RH</h3>
          <span class="mes-badge">2025</span>
        </div>
        <div class="metas-list">
          ${[
            { meta: 'Reduzir turnover para 3%',         progresso: 70, status: 'Em andamento' },
            { meta: 'Contratar 5 novos colaboradores',  progresso: 60, status: 'Em andamento' },
            { meta: 'Treinamentos obrigatórios 100%',   progresso: 85, status: 'Em andamento' },
            { meta: 'Pesquisa de clima trimestral',     progresso: 100, status: 'Concluído'   },
          ].map(m => `
            <div class="meta-item">
              <div class="meta-header">
                <span>${m.meta}</span>
                <span class="badge-status ${m.status === 'Concluído' ? 'pago' : 'pendente'}">${m.status}</span>
              </div>
              <div class="meta-bar-wrap">
                <div class="meta-bar-fill" style="width:${m.progresso}%"></div>
              </div>
              <small>${m.progresso}%</small>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

  </div>
  `;
}
