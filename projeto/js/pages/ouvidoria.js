// =============================================
// OUVIDORIA COMPLETA
// =============================================

const ouvidoriaData = {
  manifestacoes: [
    { id:'#2025-0001', tipo:'Denúncia',    assunto:'Assédio moral no setor comercial',     status:'Em andamento',      prioridade:'alta',  anonimo:true,  data:'10/05/2025', sla:48,  avaliacao:null, descricao:'Relato de comportamento inadequado por parte de liderança imediata.' },
    { id:'#2025-0002', tipo:'Reclamação',  assunto:'Atraso no pagamento de benefícios',    status:'Concluída',         prioridade:'media', anonimo:false, data:'08/05/2025', sla:72,  avaliacao:4,    descricao:'Benefício Caju não foi creditado na data correta.', colaborador:'João Silva' },
    { id:'#2025-0003', tipo:'Sugestão',    assunto:'Melhorar espaço de descanso',          status:'Em análise',        prioridade:'baixa', anonimo:false, data:'07/05/2025', sla:120, avaliacao:null, descricao:'Sugestão de criar uma área de descanso no intervalo.', colaborador:'Maria Oliveira' },
    { id:'#2025-0004', tipo:'Solicitação', assunto:'Documento de comprovante de vínculo',  status:'Aguardando retorno',prioridade:'media', anonimo:false, data:'05/05/2025', sla:120, avaliacao:null, descricao:'Necessito de comprovante de vínculo empregatício.', colaborador:'Carlos Souza' },
    { id:'#2025-0005', tipo:'Elogio',      assunto:'Excelente atendimento do RH',          status:'Concluída',         prioridade:'baixa', anonimo:false, data:'03/05/2025', sla:120, avaliacao:5,    descricao:'O time de RH foi extremamente atencioso e resolutivo!', colaborador:'Ana Lima' },
    { id:'#2025-0006', tipo:'Denúncia',    assunto:'Irregularidade em processo seletivo',  status:'Em andamento',      prioridade:'alta',  anonimo:true,  data:'01/05/2025', sla:48,  avaliacao:null, descricao:'Suspeita de favorecimento em processo seletivo interno.' },
  ],
  panorama: [
    { mes:'Jan', recebidas:8,  andamento:3, concluidas:4, aguardando:1 },
    { mes:'Fev', recebidas:12, andamento:5, concluidas:6, aguardando:1 },
    { mes:'Mar', recebidas:7,  andamento:2, concluidas:4, aguardando:1 },
    { mes:'Abr', recebidas:15, andamento:6, concluidas:7, aguardando:2 },
    { mes:'Mai', recebidas:10, andamento:4, concluidas:5, aguardando:1 },
  ],
};

const slaConfig = { Denúncia:48, Reclamação:72, Solicitação:120, Sugestão:120, Elogio:120 };

const tipoConfig = {
  Denúncia:    { cor:'#dc2626', bg:'#fee2e2', icon:'🔴', desc:'Irregularidades, fraude, assédio' },
  Reclamação:  { cor:'#d97706', bg:'#fef3c7', icon:'🟡', desc:'Insatisfação com processo ou pessoa' },
  Solicitação: { cor:'#2563eb', bg:'#dbeafe', icon:'🔵', desc:'Pedido de documento ou informação' },
  Sugestão:    { cor:'#16a34a', bg:'#dcfce7', icon:'🟢', desc:'Ideias de melhoria' },
  Elogio:      { cor:'#7c3aed', bg:'#ede9fe', icon:'🟣', desc:'Reconhecimento positivo' },
};

let ouvidoriaAbaAtiva = 'visao';

function renderOuvidoria() {
  // Controle de acesso: apenas ADM (rh) e Jurídico
  const _u = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const _p = _u.perfil || 'colab';
  if (_p !== 'rh' && _p !== 'juridico') {
    return `
    <div class="depto-page">
      <div style="
        background:linear-gradient(135deg,#1e3a5f,#2563eb);
        border-radius:20px;padding:48px 32px;text-align:center;color:white;margin-bottom:20px
      ">
        <div style="font-size:64px;margin-bottom:16px">🔒</div>
        <h2 style="font-size:24px;font-weight:900;margin-bottom:10px">Acesso Restrito</h2>
        <p style="font-size:15px;opacity:.85;max-width:480px;margin:0 auto 24px">
          A <strong>Ouvidoria</strong> é um canal confidencial acessível apenas por
          <strong>Administradores de RH</strong> e <strong>Equipe Jurídica</strong>,
          garantindo total sigilo das manifestações.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:12px 20px;font-size:13px;font-weight:700">
            👑 Administrador RH
          </div>
          <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:12px 20px;font-size:13px;font-weight:700">
            ⚖️ Jurídico
          </div>
        </div>
      </div>
      <div class="depto-section" style="text-align:center;padding:32px">
        <div style="font-size:36px;margin-bottom:12px">📢</div>
        <h3 style="margin-bottom:8px">Quer registrar uma manifestação?</h3>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;max-width:400px;margin-left:auto;margin-right:auto">
          Qualquer colaborador pode enviar denúncias, reclamações, sugestões ou elogios pelo canal externo da Ouvidoria, de forma anônima e segura.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" onclick="ouvidoriaFormExterno()">📝 Enviar Manifestação</button>
          <button class="link-btn" onclick="navigateTo('nr01')">⚠️ Reportar Risco (NR-01)</button>
        </div>
      </div>
    </div>`;
  }

  const total      = ouvidoriaData.manifestacoes.length;
  const andamento  = ouvidoriaData.manifestacoes.filter(m=>m.status==='Em andamento'||m.status==='Em análise').length;
  const concluidas = ouvidoriaData.manifestacoes.filter(m=>m.status==='Concluída').length;
  const aguardando = ouvidoriaData.manifestacoes.filter(m=>m.status==='Aguardando retorno').length;
  const avaliacoes = ouvidoriaData.manifestacoes.filter(m=>m.avaliacao);
  const satisfacao = avaliacoes.length ? (avaliacoes.reduce((a,m)=>a+m.avaliacao,0)/avaliacoes.length).toFixed(1) : '—';

  return `
  <div class="depto-page">

    <!-- HEADER -->
    <div class="ouv-header">
      <div class="ouv-header-info">
        <div class="ouv-icon">📢</div>
        <div>
          <h2>Ouvidoria</h2>
          <p>Canal seguro, confidencial e imparcial para todas as manifestações</p>
        </div>
      </div>
      <button class="btn-primary" style="padding:12px 24px" onclick="abrirNovaManifestacao()">+ Nova Manifestação</button>
    </div>

    <!-- GARANTIAS -->
    <div class="ouv-garantias">
      ${['✅ Confidencialidade','✅ Imparcialidade','✅ Isenção','✅ Não retaliação','✅ Anonimato opcional','✅ Acessibilidade'].map(g=>`
        <span class="ouv-garantia">${g}</span>
      `).join('')}
    </div>

    <!-- KPI CARDS -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📋</div>
        <div class="depto-card-info"><strong>${total}</strong><span>Total manifestações</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #d97706">
        <div class="depto-card-icon">⏳</div>
        <div class="depto-card-info"><strong>${andamento}</strong><span>Em andamento</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--success)">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${concluidas}</strong><span>Concluídas</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--primary)">
        <div class="depto-card-icon">🔄</div>
        <div class="depto-card-info"><strong>${aguardando}</strong><span>Aguardando retorno</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">⭐</div>
        <div class="depto-card-info"><strong>${satisfacao} / 5</strong><span>Satisfação média</span></div>
      </div>
    </div>

    <!-- ABAS -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchOuvTab(this,'visao')">📊 Visão Geral</button>
      <button class="exp-tab" onclick="switchOuvTab(this,'manifestacoes')">📋 Manifestações</button>
      <button class="exp-tab" onclick="switchOuvTab(this,'canais')">📞 Canais</button>
      <button class="exp-tab" onclick="switchOuvTab(this,'fluxo')">🔄 Fluxo</button>
    </div>

    <div id="ouv-content">${renderOuvVisao()}</div>

    <!-- MODAL NOVA MANIFESTAÇÃO -->
    <div class="modal-overlay" id="modal-ouvidoria" style="display:none" onclick="if(event.target.id==='modal-ouvidoria')this.style.display='none'">
      <div class="modal-box" style="max-width:600px">
        <div class="modal-header">
          <h3>📢 Nova Manifestação</h3>
          <button class="modal-close" onclick="document.getElementById('modal-ouvidoria').style.display='none'">✕</button>
        </div>
        <div class="ouv-anonimo-banner">
          🔒 Sua privacidade é garantida. Você pode optar por se identificar ou permanecer anônimo.
        </div>
        <div class="exp-form">
          <label>Tipo de manifestação</label>
          <select id="ouv-tipo" onchange="atualizarSLA()">
            <option value="Denúncia">🔴 Denúncia — Irregularidades, fraude, assédio</option>
            <option value="Reclamação">🟡 Reclamação — Insatisfação com processo ou pessoa</option>
            <option value="Solicitação">🔵 Solicitação — Pedido de documento ou informação</option>
            <option value="Sugestão">🟢 Sugestão — Ideias de melhoria</option>
            <option value="Elogio">🟣 Elogio — Reconhecimento positivo</option>
          </select>

          <div id="ouv-sla-info" class="ouv-sla-badge">⏱ SLA: Resposta em até 48 horas</div>

          <label>Assunto</label>
          <input type="text" id="ouv-assunto" placeholder="Descreva brevemente o assunto" />

          <label>Descrição detalhada</label>
          <textarea id="ouv-desc" rows="5" placeholder="Descreva com o máximo de detalhes possível. Quanto mais informações, mais rápido poderemos resolver."></textarea>

          <label>Deseja se identificar?</label>
          <div class="ouv-anonimo-opcoes">
            <label class="ouv-radio-opt" onclick="toggleAnonimo(false)">
              <input type="radio" name="anonimo" value="nao" checked />
              <div class="ouv-radio-card">
                <strong>👤 Identificado</strong>
                <small>Permite retorno personalizado</small>
              </div>
            </label>
            <label class="ouv-radio-opt" onclick="toggleAnonimo(true)">
              <input type="radio" name="anonimo" value="sim" />
              <div class="ouv-radio-card">
                <strong>🎭 Anônimo</strong>
                <small>Sua identidade não será revelada</small>
              </div>
            </label>
          </div>

          <div id="ouv-nome-campo">
            <label>Seu nome</label>
            <input type="text" id="ouv-nome" placeholder="Nome completo" />
            <label>Departamento</label>
            <input type="text" id="ouv-depto" placeholder="Seu departamento" />
          </div>

          <label>Anexar arquivos (opcional)</label>
          <button class="btn-upload" onclick="uploadOuvidoria()">📎 Anexar PDF, imagem ou documento</button>
          <div id="ouv-arquivos" style="font-size:12px;color:var(--text-muted)"></div>

          <button class="btn-primary" onclick="enviarManifestacao()">📢 Enviar Manifestação</button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALHE -->
    <div class="modal-overlay" id="modal-ouv-detalhe" style="display:none" onclick="if(event.target.id==='modal-ouv-detalhe')this.style.display='none'">
      <div class="modal-box" style="max-width:560px" id="ouv-detalhe-content"></div>
    </div>

  </div>`;
}

function switchOuvTab(btn, aba) {
  ouvidoriaAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('ouv-content');
  if (aba==='visao')         el.innerHTML = renderOuvVisao();
  if (aba==='manifestacoes') el.innerHTML = renderOuvManifestacoes();
  if (aba==='canais')        el.innerHTML = renderOuvCanais();
  if (aba==='fluxo')         el.innerHTML = renderOuvFluxo();
}

function initPage_ouvidoria() {
  setTimeout(()=>{
    const el = document.getElementById('ouv-content');
    if (el) el.innerHTML = renderOuvVisao();
  }, 50);
}

function abrirNovaManifestacao() {
  document.getElementById('modal-ouvidoria').style.display = 'flex';
}

function atualizarSLA() {
  const tipo = document.getElementById('ouv-tipo').value;
  const sla  = slaConfig[tipo] || 120;
  const el   = document.getElementById('ouv-sla-info');
  if (el) el.textContent = `⏱ SLA: Resposta em até ${sla} horas`;
}

function toggleAnonimo(sim) {
  const campo = document.getElementById('ouv-nome-campo');
  if (campo) campo.style.display = sim ? 'none' : 'block';
}

function uploadOuvidoria() {
  const input = document.createElement('input');
  input.type='file'; input.multiple=true;
  input.accept='.pdf,.jpg,.jpeg,.png,.xlsx,.doc,.docx';
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    const el = document.getElementById('ouv-arquivos');
    if (el) el.innerHTML = files.map(f=>`📎 ${f.name}`).join('<br>');
  };
  input.click();
}

function enviarManifestacao() {
  const tipo   = document.getElementById('ouv-tipo').value;
  const assunto= document.getElementById('ouv-assunto').value.trim();
  const desc   = document.getElementById('ouv-desc').value.trim();
  const anonimo= document.querySelector('input[name="anonimo"]:checked')?.value === 'sim';
  const nome   = anonimo ? null : document.getElementById('ouv-nome').value.trim();

  if (!assunto || !desc) { alert('Preencha assunto e descrição!'); return; }

  const novoId = '#2025-00' + String(ouvidoriaData.manifestacoes.length+1).padStart(2,'0');
  ouvidoriaData.manifestacoes.unshift({
    id: novoId, tipo, assunto, status:'Em análise',
    prioridade: tipo==='Denúncia'?'alta':'media',
    anonimo, data: new Date().toLocaleDateString('pt-BR'),
    sla: slaConfig[tipo]||120, avaliacao:null, descricao:desc,
    colaborador: nome||null,
  });

  document.getElementById('modal-ouvidoria').style.display = 'none';
  alert(`✅ Manifestação ${novoId} registrada com sucesso!\n\nSLA: até ${slaConfig[tipo]} horas para resposta.\n${anonimo?'Sua identidade está protegida.':'Em breve entraremos em contato.'}`);
  document.getElementById('ouv-content').innerHTML = renderOuvManifestacoes();
  document.querySelectorAll('.exp-tab')[1].click();
}
// =============================================
// VISÃO GERAL
// =============================================
function renderOuvVisao() {
  const tipos = Object.keys(tipoConfig);
  const maxPanorama = Math.max(...ouvidoriaData.panorama.map(p=>p.recebidas));

  return `
  <div style="display:flex;flex-direction:column;gap:20px">

    <div class="ind-grid">

      <!-- PANORAMA MENSAL -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📈 Panorama das Manifestações</h3>
          <span class="mes-badge">Jan → Mai/2025</span>
        </div>
        <div class="ouv-panorama">
          ${ouvidoriaData.panorama.map(p=>`
            <div class="ouv-pan-item">
              <div class="ouv-pan-bars">
                <div class="ouv-pan-bar" style="height:${(p.recebidas/maxPanorama)*120}px;background:var(--primary)" title="Recebidas: ${p.recebidas}"></div>
                <div class="ouv-pan-bar" style="height:${(p.andamento/maxPanorama)*120}px;background:var(--warning)" title="Andamento: ${p.andamento}"></div>
                <div class="ouv-pan-bar" style="height:${(p.concluidas/maxPanorama)*120}px;background:var(--success)" title="Concluídas: ${p.concluidas}"></div>
              </div>
              <span class="bar-label">${p.mes}</span>
            </div>
          `).join('')}
        </div>
        <div class="ouv-legenda">
          <span><span class="ouv-dot" style="background:var(--primary)"></span>Recebidas</span>
          <span><span class="ouv-dot" style="background:var(--warning)"></span>Em andamento</span>
          <span><span class="ouv-dot" style="background:var(--success)"></span>Concluídas</span>
        </div>
      </div>

      <!-- TIPOS -->
      <div class="depto-section">
        <div class="section-header"><h3>🍩 Tipos de Manifestação</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${tipos.map(tipo => {
            const qtd = ouvidoriaData.manifestacoes.filter(m=>m.tipo===tipo).length;
            const pct = ouvidoriaData.manifestacoes.length ? Math.round((qtd/ouvidoriaData.manifestacoes.length)*100) : 0;
            const cfg = tipoConfig[tipo];
            return `
            <div class="ouv-tipo-item">
              <span class="ouv-tipo-tag" style="background:${cfg.bg};color:${cfg.cor}">${cfg.icon} ${tipo}</span>
              <div class="hc-bar-wrap" style="flex:1">
                <div class="hc-bar-fill" style="width:${pct}%;background:${cfg.cor}"></div>
              </div>
              <span style="font-size:12px;font-weight:700;width:40px;text-align:right">${qtd} (${pct}%)</span>
            </div>`;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- SCORE DE RISCO -->
    <div class="depto-section">
      <div class="section-header">
        <h3>🎯 Score de Risco Organizacional</h3>
        <span class="mes-badge">Baseado nas manifestações</span>
      </div>
      <div class="ouv-risco-grid">
        ${[
          { label:'Assédio / Ética',  valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Denúncia').length,    max:10, cor:'#dc2626' },
          { label:'Insatisfação',     valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Reclamação').length,  max:10, cor:'#d97706' },
          { label:'Clima Interno',    valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Sugestão').length,    max:10, cor:'#2563eb' },
          { label:'Reconhecimento',   valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Elogio').length,      max:10, cor:'#16a34a' },
        ].map(r=>`
          <div class="ouv-risco-item">
            <div class="ouv-risco-label">${r.label}</div>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e8e8e8" stroke-width="10"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="${r.cor}" stroke-width="10"
                stroke-dasharray="${Math.min(r.valor/r.max,1)*188} 188" stroke-dashoffset="47" stroke-linecap="round"/>
              <text x="40" y="44" text-anchor="middle" font-size="18" font-weight="800" fill="${r.cor}">${r.valor}</text>
            </svg>
            <small>${r.valor >= 5 ? '⚠️ Atenção' : r.valor >= 3 ? '⚡ Moderado' : '✅ Normal'}</small>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ÚLTIMAS MANIFESTAÇÕES -->
    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Manifestações Recentes</h3>
        <button class="link-btn" onclick="switchOuvTab(document.querySelectorAll('.exp-tab')[1],'manifestacoes')">Ver todas →</button>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>ID</th><th>Tipo</th><th>Assunto</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead>
          <tbody>
            ${ouvidoriaData.manifestacoes.slice(0,4).map(m=>`
              <tr>
                <td><strong>${m.id}</strong></td>
                <td>
                  <span class="ouv-tipo-badge" style="background:${tipoConfig[m.tipo]?.bg};color:${tipoConfig[m.tipo]?.cor}">
                    ${tipoConfig[m.tipo]?.icon} ${m.tipo}
                  </span>
                </td>
                <td>${m.anonimo?'🎭 Anônimo':''}${m.assunto}</td>
                <td><span class="badge-status ${m.status==='Concluída'?'pago':m.status==='Em andamento'||m.status==='Em análise'?'pendente':'inativo'}">${m.status}</span></td>
                <td style="font-size:12px">${m.data}</td>
                <td><button class="link-btn" onclick="abrirDetalheOuvidoria('${m.id}')">🔍 Ver</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

// =============================================
// MANIFESTAÇÕES COMPLETAS
// =============================================
function renderOuvManifestacoes() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Todas as Manifestações</h3>
        <div style="display:flex;gap:8px">
          <select id="ouv-filtro-tipo" onchange="filtrarManifestacoes()" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit">
            <option value="">Todos os tipos</option>
            ${Object.keys(tipoConfig).map(t=>`<option value="${t}">${t}</option>`).join('')}
          </select>
          <select id="ouv-filtro-status" onchange="filtrarManifestacoes()" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit">
            <option value="">Todos os status</option>
            <option>Em andamento</option>
            <option>Em análise</option>
            <option>Concluída</option>
            <option>Aguardando retorno</option>
          </select>
          <button class="link-btn" onclick="exportarOuvidoria()">⬇ Exportar</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="depto-table" id="ouv-tabela">
          <thead><tr><th>ID</th><th>Tipo</th><th>Assunto</th><th>Prioridade</th><th>Status</th><th>SLA</th><th>Data</th><th>Ações</th></tr></thead>
          <tbody id="ouv-tbody">
            ${renderOuvLinhas(ouvidoriaData.manifestacoes)}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderOuvLinhas(lista) {
  return lista.map(m=>`
    <tr>
      <td><strong>${m.id}</strong></td>
      <td>
        <span class="ouv-tipo-badge" style="background:${tipoConfig[m.tipo]?.bg};color:${tipoConfig[m.tipo]?.cor}">
          ${tipoConfig[m.tipo]?.icon} ${m.tipo}
        </span>
      </td>
      <td>
        ${m.anonimo?'<span class="ouv-anonimo-tag">🎭 Anônimo</span> ':''} ${m.assunto}
      </td>
      <td>
        <span class="ouv-prioridade ${m.prioridade}">
          ${m.prioridade==='alta'?'🔴 Alta':m.prioridade==='media'?'🟡 Média':'🟢 Baixa'}
        </span>
      </td>
      <td><span class="badge-status ${m.status==='Concluída'?'pago':m.status==='Em andamento'||m.status==='Em análise'?'pendente':'inativo'}">${m.status}</span></td>
      <td style="font-size:12px">${m.sla}h</td>
      <td style="font-size:12px">${m.data}</td>
      <td>
        <button class="link-btn" onclick="abrirDetalheOuvidoria('${m.id}')">🔍 Ver</button>
        <button class="link-btn" onclick="mudarStatus('${m.id}')">🔄 Status</button>
      </td>
    </tr>
  `).join('');
}

function filtrarManifestacoes() {
  const tipo   = document.getElementById('ouv-filtro-tipo')?.value;
  const status = document.getElementById('ouv-filtro-status')?.value;
  let lista = ouvidoriaData.manifestacoes;
  if (tipo)   lista = lista.filter(m=>m.tipo===tipo);
  if (status) lista = lista.filter(m=>m.status===status);
  const tbody = document.getElementById('ouv-tbody');
  if (tbody) tbody.innerHTML = renderOuvLinhas(lista);
}

function abrirDetalheOuvidoria(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  const cfg = tipoConfig[m.tipo] || {};
  const estrelas = m.avaliacao ? '⭐'.repeat(m.avaliacao) : '—';

  document.getElementById('ouv-detalhe-content').innerHTML = `
    <div class="modal-header">
      <div>
        <h3>${m.id}</h3>
        <small style="color:var(--text-muted)">${m.data} · SLA: ${m.sla}h</small>
      </div>
      <button class="modal-close" onclick="document.getElementById('modal-ouv-detalhe').style.display='none'">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;padding-top:8px">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span class="ouv-tipo-badge" style="background:${cfg.bg};color:${cfg.cor}">${cfg.icon} ${m.tipo}</span>
        <span class="ouv-prioridade ${m.prioridade}">${m.prioridade==='alta'?'🔴 Alta':m.prioridade==='media'?'🟡 Média':'🟢 Baixa'}</span>
        <span class="badge-status ${m.status==='Concluída'?'pago':'pendente'}">${m.status}</span>
        ${m.anonimo?'<span class="ouv-anonimo-tag">🎭 Anônimo</span>':''}
      </div>

      <div style="background:var(--bg);border-radius:10px;padding:14px">
        <strong style="font-size:13px;display:block;margin-bottom:6px">${m.assunto}</strong>
        <p style="font-size:13px;color:var(--text-muted);line-height:1.6">${m.descricao}</p>
      </div>

      ${!m.anonimo && m.colaborador ? `
      <div class="resumo-item" style="grid-template-columns:120px 1fr">
        <span>Colaborador</span><strong>${m.colaborador}</strong>
      </div>` : ''}

      <div class="resumo-item" style="grid-template-columns:120px 1fr">
        <span>Avaliação</span><strong>${estrelas}</strong>
      </div>

      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="btn-primary" onclick="mudarStatus('${m.id}')">🔄 Atualizar Status</button>
        <button class="btn-aprovar" onclick="encerrarManifestacao('${m.id}')">✅ Encerrar</button>
        ${m.status!=='Concluída'?`<button class="btn-upload" onclick="responderManifestacao('${m.id}')">💬 Responder</button>`:''}
      </div>
    </div>`;

  document.getElementById('modal-ouv-detalhe').style.display = 'flex';
}

function mudarStatus(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  const opcoes = ['Em análise','Em andamento','Aguardando retorno','Concluída'];
  const novo   = prompt(`Status atual: ${m.status}\n\nNovo status:\n1. Em análise\n2. Em andamento\n3. Aguardando retorno\n4. Concluída\n\nDigite o número:`);
  if (novo && opcoes[parseInt(novo)-1]) {
    m.status = opcoes[parseInt(novo)-1];
    alert(`✅ Status atualizado para: ${m.status}`);
    document.getElementById('ouv-content').innerHTML = renderOuvManifestacoes();
  }
}

function encerrarManifestacao(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  m.status = 'Concluída';
  const nota = parseInt(prompt('Avaliação do atendimento (1 a 5):') || '5');
  m.avaliacao = Math.min(5, Math.max(1, nota));
  alert(`✅ Manifestação ${id} encerrada!\nAvaliação registrada: ${'⭐'.repeat(m.avaliacao)}`);
  document.getElementById('modal-ouv-detalhe').style.display = 'none';
  document.getElementById('ouv-content').innerHTML = renderOuvManifestacoes();
}

function responderManifestacao(id) {
  const resp = prompt('Digite a resposta para o colaborador:');
  if (!resp) return;
  alert(`✅ Resposta enviada!\n\nEm produção, o colaborador receberá uma notificação com sua resposta.`);
}

function exportarOuvidoria() {
  const txt = `RELATÓRIO DE OUVIDORIA\n${'='.repeat(50)}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n${
    ouvidoriaData.manifestacoes.map(m=>`${m.id} | ${m.tipo} | ${m.assunto} | ${m.status} | ${m.data}${m.anonimo?' | ANÔNIMO':''}`).join('\n')
  }`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='ouvidoria.txt'; a.click();
  URL.revokeObjectURL(url);
}
// =============================================
// VISÃO GERAL
// =============================================
function renderOuvVisao() {
  const tipos = Object.keys(tipoConfig);
  const maxPanorama = Math.max(...ouvidoriaData.panorama.map(p=>p.recebidas));

  return `
  <div style="display:flex;flex-direction:column;gap:20px">

    <div class="ind-grid">

      <!-- PANORAMA MENSAL -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📈 Panorama das Manifestações</h3>
          <span class="mes-badge">Jan → Mai/2025</span>
        </div>
        <div class="ouv-panorama">
          ${ouvidoriaData.panorama.map(p=>`
            <div class="ouv-pan-item">
              <div class="ouv-pan-bars">
                <div class="ouv-pan-bar" style="height:${(p.recebidas/maxPanorama)*120}px;background:var(--primary)" title="Recebidas: ${p.recebidas}"></div>
                <div class="ouv-pan-bar" style="height:${(p.andamento/maxPanorama)*120}px;background:var(--warning)" title="Andamento: ${p.andamento}"></div>
                <div class="ouv-pan-bar" style="height:${(p.concluidas/maxPanorama)*120}px;background:var(--success)" title="Concluídas: ${p.concluidas}"></div>
              </div>
              <span class="bar-label">${p.mes}</span>
            </div>
          `).join('')}
        </div>
        <div class="ouv-legenda">
          <span><span class="ouv-dot" style="background:var(--primary)"></span>Recebidas</span>
          <span><span class="ouv-dot" style="background:var(--warning)"></span>Em andamento</span>
          <span><span class="ouv-dot" style="background:var(--success)"></span>Concluídas</span>
        </div>
      </div>

      <!-- TIPOS -->
      <div class="depto-section">
        <div class="section-header"><h3>🍩 Tipos de Manifestação</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${tipos.map(tipo => {
            const qtd = ouvidoriaData.manifestacoes.filter(m=>m.tipo===tipo).length;
            const pct = ouvidoriaData.manifestacoes.length ? Math.round((qtd/ouvidoriaData.manifestacoes.length)*100) : 0;
            const cfg = tipoConfig[tipo];
            return `
            <div class="ouv-tipo-item">
              <span class="ouv-tipo-tag" style="background:${cfg.bg};color:${cfg.cor}">${cfg.icon} ${tipo}</span>
              <div class="hc-bar-wrap" style="flex:1">
                <div class="hc-bar-fill" style="width:${pct}%;background:${cfg.cor}"></div>
              </div>
              <span style="font-size:12px;font-weight:700;width:40px;text-align:right">${qtd} (${pct}%)</span>
            </div>`;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- SCORE DE RISCO -->
    <div class="depto-section">
      <div class="section-header">
        <h3>🎯 Score de Risco Organizacional</h3>
        <span class="mes-badge">Baseado nas manifestações</span>
      </div>
      <div class="ouv-risco-grid">
        ${[
          { label:'Assédio / Ética',  valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Denúncia').length,    max:10, cor:'#dc2626' },
          { label:'Insatisfação',     valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Reclamação').length,  max:10, cor:'#d97706' },
          { label:'Clima Interno',    valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Sugestão').length,    max:10, cor:'#2563eb' },
          { label:'Reconhecimento',   valor:ouvidoriaData.manifestacoes.filter(m=>m.tipo==='Elogio').length,      max:10, cor:'#16a34a' },
        ].map(r=>`
          <div class="ouv-risco-item">
            <div class="ouv-risco-label">${r.label}</div>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e8e8e8" stroke-width="10"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="${r.cor}" stroke-width="10"
                stroke-dasharray="${Math.min(r.valor/r.max,1)*188} 188" stroke-dashoffset="47" stroke-linecap="round"/>
              <text x="40" y="44" text-anchor="middle" font-size="18" font-weight="800" fill="${r.cor}">${r.valor}</text>
            </svg>
            <small>${r.valor >= 5 ? '⚠️ Atenção' : r.valor >= 3 ? '⚡ Moderado' : '✅ Normal'}</small>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ÚLTIMAS MANIFESTAÇÕES -->
    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Manifestações Recentes</h3>
        <button class="link-btn" onclick="switchOuvTab(document.querySelectorAll('.exp-tab')[1],'manifestacoes')">Ver todas →</button>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>ID</th><th>Tipo</th><th>Assunto</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead>
          <tbody>
            ${ouvidoriaData.manifestacoes.slice(0,4).map(m=>`
              <tr>
                <td><strong>${m.id}</strong></td>
                <td>
                  <span class="ouv-tipo-badge" style="background:${tipoConfig[m.tipo]?.bg};color:${tipoConfig[m.tipo]?.cor}">
                    ${tipoConfig[m.tipo]?.icon} ${m.tipo}
                  </span>
                </td>
                <td>${m.anonimo?'🎭 Anônimo':''}${m.assunto}</td>
                <td><span class="badge-status ${m.status==='Concluída'?'pago':m.status==='Em andamento'||m.status==='Em análise'?'pendente':'inativo'}">${m.status}</span></td>
                <td style="font-size:12px">${m.data}</td>
                <td><button class="link-btn" onclick="abrirDetalheOuvidoria('${m.id}')">🔍 Ver</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

// =============================================
// MANIFESTAÇÕES COMPLETAS
// =============================================
function renderOuvManifestacoes() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-section">
      <div class="section-header">
        <h3>📋 Todas as Manifestações</h3>
        <div style="display:flex;gap:8px">
          <select id="ouv-filtro-tipo" onchange="filtrarManifestacoes()" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit">
            <option value="">Todos os tipos</option>
            ${Object.keys(tipoConfig).map(t=>`<option value="${t}">${t}</option>`).join('')}
          </select>
          <select id="ouv-filtro-status" onchange="filtrarManifestacoes()" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit">
            <option value="">Todos os status</option>
            <option>Em andamento</option>
            <option>Em análise</option>
            <option>Concluída</option>
            <option>Aguardando retorno</option>
          </select>
          <button class="link-btn" onclick="exportarOuvidoria()">⬇ Exportar</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="depto-table" id="ouv-tabela">
          <thead><tr><th>ID</th><th>Tipo</th><th>Assunto</th><th>Prioridade</th><th>Status</th><th>SLA</th><th>Data</th><th>Ações</th></tr></thead>
          <tbody id="ouv-tbody">
            ${renderOuvLinhas(ouvidoriaData.manifestacoes)}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderOuvLinhas(lista) {
  return lista.map(m=>`
    <tr>
      <td><strong>${m.id}</strong></td>
      <td>
        <span class="ouv-tipo-badge" style="background:${tipoConfig[m.tipo]?.bg};color:${tipoConfig[m.tipo]?.cor}">
          ${tipoConfig[m.tipo]?.icon} ${m.tipo}
        </span>
      </td>
      <td>
        ${m.anonimo?'<span class="ouv-anonimo-tag">🎭 Anônimo</span> ':''} ${m.assunto}
      </td>
      <td>
        <span class="ouv-prioridade ${m.prioridade}">
          ${m.prioridade==='alta'?'🔴 Alta':m.prioridade==='media'?'🟡 Média':'🟢 Baixa'}
        </span>
      </td>
      <td><span class="badge-status ${m.status==='Concluída'?'pago':m.status==='Em andamento'||m.status==='Em análise'?'pendente':'inativo'}">${m.status}</span></td>
      <td style="font-size:12px">${m.sla}h</td>
      <td style="font-size:12px">${m.data}</td>
      <td>
        <button class="link-btn" onclick="abrirDetalheOuvidoria('${m.id}')">🔍 Ver</button>
        <button class="link-btn" onclick="mudarStatus('${m.id}')">🔄 Status</button>
      </td>
    </tr>
  `).join('');
}

function filtrarManifestacoes() {
  const tipo   = document.getElementById('ouv-filtro-tipo')?.value;
  const status = document.getElementById('ouv-filtro-status')?.value;
  let lista = ouvidoriaData.manifestacoes;
  if (tipo)   lista = lista.filter(m=>m.tipo===tipo);
  if (status) lista = lista.filter(m=>m.status===status);
  const tbody = document.getElementById('ouv-tbody');
  if (tbody) tbody.innerHTML = renderOuvLinhas(lista);
}

function abrirDetalheOuvidoria(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  const cfg = tipoConfig[m.tipo] || {};
  const estrelas = m.avaliacao ? '⭐'.repeat(m.avaliacao) : '—';

  document.getElementById('ouv-detalhe-content').innerHTML = `
    <div class="modal-header">
      <div>
        <h3>${m.id}</h3>
        <small style="color:var(--text-muted)">${m.data} · SLA: ${m.sla}h</small>
      </div>
      <button class="modal-close" onclick="document.getElementById('modal-ouv-detalhe').style.display='none'">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;padding-top:8px">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span class="ouv-tipo-badge" style="background:${cfg.bg};color:${cfg.cor}">${cfg.icon} ${m.tipo}</span>
        <span class="ouv-prioridade ${m.prioridade}">${m.prioridade==='alta'?'🔴 Alta':m.prioridade==='media'?'🟡 Média':'🟢 Baixa'}</span>
        <span class="badge-status ${m.status==='Concluída'?'pago':'pendente'}">${m.status}</span>
        ${m.anonimo?'<span class="ouv-anonimo-tag">🎭 Anônimo</span>':''}
      </div>

      <div style="background:var(--bg);border-radius:10px;padding:14px">
        <strong style="font-size:13px;display:block;margin-bottom:6px">${m.assunto}</strong>
        <p style="font-size:13px;color:var(--text-muted);line-height:1.6">${m.descricao}</p>
      </div>

      ${!m.anonimo && m.colaborador ? `
      <div class="resumo-item" style="grid-template-columns:120px 1fr">
        <span>Colaborador</span><strong>${m.colaborador}</strong>
      </div>` : ''}

      <div class="resumo-item" style="grid-template-columns:120px 1fr">
        <span>Avaliação</span><strong>${estrelas}</strong>
      </div>

      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="btn-primary" onclick="mudarStatus('${m.id}')">🔄 Atualizar Status</button>
        <button class="btn-aprovar" onclick="encerrarManifestacao('${m.id}')">✅ Encerrar</button>
        ${m.status!=='Concluída'?`<button class="btn-upload" onclick="responderManifestacao('${m.id}')">💬 Responder</button>`:''}
      </div>
    </div>`;

  document.getElementById('modal-ouv-detalhe').style.display = 'flex';
}

function mudarStatus(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  const opcoes = ['Em análise','Em andamento','Aguardando retorno','Concluída'];
  const novo   = prompt(`Status atual: ${m.status}\n\nNovo status:\n1. Em análise\n2. Em andamento\n3. Aguardando retorno\n4. Concluída\n\nDigite o número:`);
  if (novo && opcoes[parseInt(novo)-1]) {
    m.status = opcoes[parseInt(novo)-1];
    alert(`✅ Status atualizado para: ${m.status}`);
    document.getElementById('ouv-content').innerHTML = renderOuvManifestacoes();
  }
}

function encerrarManifestacao(id) {
  const m = ouvidoriaData.manifestacoes.find(x=>x.id===id);
  if (!m) return;
  m.status = 'Concluída';
  const nota = parseInt(prompt('Avaliação do atendimento (1 a 5):') || '5');
  m.avaliacao = Math.min(5, Math.max(1, nota));
  alert(`✅ Manifestação ${id} encerrada!\nAvaliação registrada: ${'⭐'.repeat(m.avaliacao)}`);
  document.getElementById('modal-ouv-detalhe').style.display = 'none';
  document.getElementById('ouv-content').innerHTML = renderOuvManifestacoes();
}

function responderManifestacao(id) {
  const resp = prompt('Digite a resposta para o colaborador:');
  if (!resp) return;
  alert(`✅ Resposta enviada!\n\nEm produção, o colaborador receberá uma notificação com sua resposta.`);
}

function exportarOuvidoria() {
  const txt = `RELATÓRIO DE OUVIDORIA\n${'='.repeat(50)}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n${
    ouvidoriaData.manifestacoes.map(m=>`${m.id} | ${m.tipo} | ${m.assunto} | ${m.status} | ${m.data}${m.anonimo?' | ANÔNIMO':''}`).join('\n')
  }`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='ouvidoria.txt'; a.click();
  URL.revokeObjectURL(url);
}



function ouvidoriaFormExterno() {
  // Modal simples para colaboradores enviarem manifestacao
  const tipos = ['Denuncia','Reclamacao','Sugestao','Solicitacao','Elogio'];
  const tipo = prompt('Tipo de manifestacao:\n1. Denuncia\n2. Reclamacao\n3. Sugestao\n4. Solicitacao\n5. Elogio\n\nDigite o tipo:');
  if (!tipo) return;
  const desc = prompt('Descreva sua manifestacao:');
  if (!desc) return;
  const anonimo = confirm('Deseja manter anonimato? (recomendado para denuncias)');
  alert('Manifestacao registrada com sucesso!\n\nSua mensagem sera analisada com total confidencialidade.\nVoce recebera retorno em ate 48h (denuncias) ou 5 dias uteis (demais tipos).\n\nObrigado por contribuir com um ambiente melhor!');
}
function exportarOuvidoriaExcel(chamados) {
  const colunas = ["ID", "Tipo", "Status", "Data"];

  const dados = chamados.map(c => [
    c.id,
    c.tipo,
    c.status,
    c.data
  ]);

  exportarExcel("ouvidoria", colunas, dados);
}