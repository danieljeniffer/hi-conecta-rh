function renderExperiencia() {
  return `
  <div class="depto-page">

    <!-- ABAS -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchExpTab('indique')">🎁 hi Indique & Ganhe</button>
      <button class="exp-tab" onclick="switchExpTab('move')">🏃 hi Move</button>
      <button class="exp-tab" onclick="switchExpTab('experience')">⭐ hi Experience</button>
      <button class="exp-tab" onclick="switchExpTab('academy')">🎓 hi Academy</button>
      <button class="exp-tab" onclick="switchExpTab('ideias')">💡 Programa de Ideias</button>
      <button class="exp-tab" onclick="switchExpTab('engajamento')">📊 Engajamento</button>
    </div>

    <!-- CONTEÚDO DAS ABAS -->
    <div id="exp-content"></div>

  </div>
  `;
}
const expData = {
  indique: [
    { nome:'João Silva',    data:'10/05/2025', indicado:'Pedro Alves',    status:'Aprovado',  bonus:'R$ 500,00' },
    { nome:'Maria Oliveira',data:'12/05/2025', indicado:'Lucia Souza',    status:'Pendente',  bonus:'—'         },
    { nome:'Carlos Souza',  data:'14/05/2025', indicado:'Rafael Costa',   status:'Aprovado',  bonus:'R$ 500,00' },
  ],
  move: [
    { nome:'João Silva',     data:'15/05/2025', atividade:'Corrida 5km',    pontos:150 },
    { nome:'Ana Lima',       data:'15/05/2025', atividade:'Yoga',           pontos:100 },
    { nome:'Paulo Santos',   data:'14/05/2025', atividade:'Musculação',     pontos:120 },
    { nome:'Maria Oliveira', data:'13/05/2025', atividade:'Ciclismo 10km',  pontos:180 },
  ],
  academy: [
    { nome:'João Silva',     data:'08/05/2025', curso:'Excel Avançado',         progresso:100, status:'Concluído'    },
    { nome:'Maria Oliveira', data:'10/05/2025', curso:'Liderança e Gestão',      progresso:60,  status:'Em andamento' },
    { nome:'Carlos Souza',   data:'12/05/2025', curso:'Comunicação Assertiva',   progresso:30,  status:'Em andamento' },
    { nome:'Ana Lima',       data:'05/05/2025', curso:'Excel Avançado',          progresso:100, status:'Concluído'    },
  ],
  ideias: [
    { nome:'Paulo Santos',   data:'11/05/2025', ideia:'Sistema de recompensas por metas',    status:'Em análise', votos:12 },
    { nome:'João Silva',     data:'09/05/2025', ideia:'Horário flexível às sextas',           status:'Aprovada',   votos:28 },
    { nome:'Maria Oliveira', data:'07/05/2025', ideia:'Espaço de relaxamento na empresa',    status:'Em análise', votos:19 },
  ],
  assinaturas: [
    { nome:'João Silva',     hora:'08:02', data:'24/04/2025' },
    { nome:'Maria Oliveira', hora:'08:15', data:'24/04/2025' },
    { nome:'Carlos Souza',   hora:'08:30', data:'24/04/2025' },
    { nome:'Ana Lima',       hora:'09:00', data:'24/04/2025' },
  ],
  engajamento: [
    { mes:'Jan', total:18 }, { mes:'Fev', total:22 },
    { mes:'Mar', total:20 }, { mes:'Abr', total:27 },
    { mes:'Mai', total:30 },
  ],
};
function switchExpTab(tab) {
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  const content = document.getElementById('exp-content');

  if (tab === 'indique')    content.innerHTML = renderIndique();
  if (tab === 'move')       content.innerHTML = renderMove();
  if (tab === 'experience') content.innerHTML = renderExpTab();
  if (tab === 'academy')    content.innerHTML = renderAcademy();
  if (tab === 'ideias')       content.innerHTML = renderIdeias();
  if (tab === 'engajamento') content.innerHTML = renderEngajamentoDashboard();
}
function renderIndique() {
  const rows = expData.indique.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.indicado}</td>
      <td>${p.data}</td>
      <td><span class="badge-status ${p.status==='Aprovado'?'pago':'pendente'}">${p.status}</span></td>
      <td><strong>${p.bonus}</strong></td>
    </tr>
  `).join('');

  return `
  <div class="exp-section-wrap">
    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>🎁 Indique & Ganhe</h3>
          <button class="link-btn" onclick="exportarRelatorio('indique')">⬇ Exportar</button>
        </div>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">Indique um amigo para trabalhar conosco e ganhe R$ 500,00 após a contratação.</p>
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Indicado</th><th>Data</th><th>Status</th><th>Bônus</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Nova Indicação</h3></div>
        <div class="exp-form">
          <label>Seu nome</label>
          <input type="text" id="ind-nome" placeholder="Ex: João Silva" />
          <label>Nome do indicado</label>
          <input type="text" id="ind-indicado" placeholder="Ex: Pedro Alves" />
          <label>Cargo pretendido</label>
          <input type="text" id="ind-cargo" placeholder="Ex: Analista de RH" />
          <label>Contato do indicado</label>
          <input type="text" id="ind-contato" placeholder="(00) 00000-0000" />
          <button class="btn-primary" onclick="cadastrarIndique()">Enviar Indicação</button>
        </div>
      </div>
    </div>
  </div>`;
}

function cadastrarIndique() {
  const nome     = document.getElementById('ind-nome').value.trim();
  const indicado = document.getElementById('ind-indicado').value.trim();
  const cargo    = document.getElementById('ind-cargo').value.trim();
  if (!nome || !indicado || !cargo) { alert('Preencha todos os campos!'); return; }
  const hoje = new Date().toLocaleDateString('pt-BR');
  expData.indique.push({ nome, indicado, data: hoje, status:'Pendente', bonus:'—' });
  alert(`✅ Indicação de ${indicado} registrada com sucesso!`);
  document.getElementById('exp-content').innerHTML = renderIndique();
}
function renderMove() {
  const rows = expData.move.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.atividade}</td>
      <td>${p.data}</td>
      <td><strong style="color:var(--primary)">${p.pontos} pts</strong></td>
    </tr>
  `).join('');

  const ranking = [...expData.move]
    .sort((a,b) => b.pontos - a.pontos)
    .map((p,i) => `
      <div class="rank-item">
        <span class="rank-pos ${i===0?'ouro':i===1?'prata':i===2?'bronze':''}">${i+1}º</span>
        <div class="abs-avatar">${p.nome.split(' ').map(n=>n[0]).join('')}</div>
        <span style="flex:1;font-size:13px;font-weight:500">${p.nome}</span>
        <strong style="color:var(--primary)">${p.pontos} pts</strong>
      </div>
    `).join('');

  return `
  <div class="exp-section-wrap">
    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>🏃 Registro de Atividades</h3>
          <button class="link-btn" onclick="exportarRelatorio('move')">⬇ Exportar</button>
        </div>
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Atividade</th><th>Data</th><th>Pontos</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="exp-form" style="margin-top:20px">
          <div class="section-header"><h4>Registrar Atividade</h4></div>
          <label>Seu nome</label>
          <input type="text" id="move-nome" placeholder="Ex: João Silva" />
          <label>Atividade realizada</label>
          <input type="text" id="move-ativ" placeholder="Ex: Corrida 5km" />
          <label>Pontos</label>
          <input type="number" id="move-pts" placeholder="Ex: 150" />
          <button class="btn-primary" onclick="cadastrarMove()">Registrar</button>
        </div>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>🏆 Ranking do Mês</h3></div>
        <div class="rank-list">${ranking}</div>
      </div>
    </div>
  </div>`;
}

function cadastrarMove() {
  const nome = document.getElementById('move-nome').value.trim();
  const ativ = document.getElementById('move-ativ').value.trim();
  const pts  = parseInt(document.getElementById('move-pts').value);
  if (!nome || !ativ || !pts) { alert('Preencha todos os campos!'); return; }
  const hoje = new Date().toLocaleDateString('pt-BR');
  expData.move.push({ nome, atividade: ativ, data: hoje, pontos: pts });
  alert(`✅ Atividade registrada para ${nome}!`);
  document.getElementById('exp-content').innerHTML = renderMove();
}
function renderExpTab() {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const assinHoje = expData.assinaturas.filter(a => a.data === hoje);
  const maxEng = Math.max(...expData.engajamento.map(e=>e.total));

  const assinRows = expData.assinaturas.map(a => `
    <tr>
      <td>${a.nome}</td>
      <td>${a.data}</td>
      <td>${a.hora}</td>
    </tr>
  `).join('');

  const barras = expData.engajamento.map(e => `
    <div class="bar-item">
      <div class="bar-wrap">
        <div class="bar-fill" style="height:${(e.total/maxEng)*100}%;background:var(--primary)"></div>
      </div>
      <span class="bar-val">${e.total}</span>
      <span class="bar-label">${e.mes}</span>
    </div>
  `).join('');

  return `
  <div class="exp-section-wrap">

    <!-- DASHBOARD ENGAJAMENTO -->
    <div class="ind-grid" style="margin-bottom:20px">
      <div class="depto-section">
        <div class="section-header">
          <h3>📊 Engajamento Mensal</h3>
          <span class="mes-badge">2025</span>
        </div>
        <div class="bar-chart" style="height:180px">${barras}</div>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Resumo</h3></div>
        <div class="hc-list">
          <div class="resumo-item" style="grid-template-columns:12px 1fr auto">
            <span class="dot verde"></span><span>Assinaturas hoje</span><strong>${assinHoje.length}</strong>
          </div>
          <div class="resumo-item" style="grid-template-columns:12px 1fr auto">
            <span class="dot azul"></span><span>Total no mês</span><strong>${expData.assinaturas.length}</strong>
          </div>
          <div class="resumo-item" style="grid-template-columns:12px 1fr auto">
            <span class="dot laranja"></span><span>Meta mensal</span><strong>32</strong>
          </div>
          <div class="resumo-item total-row" style="grid-template-columns:12px 1fr auto">
            <span></span><span><strong>Engajamento</strong></span>
            <strong style="color:var(--success)">${Math.round((expData.assinaturas.length/32)*100)}%</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- ASSINATURA DO DIA -->
    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>✍️ Assinatura de Participação</h3>
          <button class="link-btn" onclick="exportarRelatorio('experience')">⬇ Exportar</button>
        </div>
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Data</th><th>Hora</th></tr></thead>
          <tbody>${assinRows}</tbody>
        </table>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Assinar Presença</h3></div>
        <div class="exp-form">
          <label>Seu nome</label>
          <input type="text" id="exp-nome" placeholder="Ex: João Silva" />
          <label>Data</label>
          <input type="date" id="exp-data" value="${new Date().toISOString().split('T')[0]}" />
          <button class="btn-primary" onclick="assinarPresenca()">✍️ Assinar Participação</button>
        </div>
      </div>
    </div>

  </div>`;
}
function assinarPresenca() {
  const nome  = document.getElementById('exp-nome').value.trim();
  const data  = document.getElementById('exp-data').value;
  if (!nome || !data) { alert('Preencha todos os campos!'); return; }
  const dataFmt = new Date(data+'T12:00').toLocaleDateString('pt-BR');
  const hora  = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
  const jaAssinou = expData.assinaturas.find(a => a.nome === nome && a.data === dataFmt);
  if (jaAssinou) { alert(`⚠️ ${nome} já assinou presença hoje!`); return; }
  expData.assinaturas.push({ nome, data: dataFmt, hora });
  expData.engajamento[expData.engajamento.length-1].total++;
  alert(`✅ Presença de ${nome} registrada às ${hora}!`);
  document.getElementById('exp-content').innerHTML = renderExpTab();
}

function renderAcademy() {
  const rows = expData.academy.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.curso}</td>
      <td>${p.data}</td>
      <td>
        <div class="meta-bar-wrap" style="width:120px">
          <div class="meta-bar-fill" style="width:${p.progresso}%;background:${p.progresso===100?'var(--success)':'var(--primary)'}"></div>
        </div>
        <small>${p.progresso}%</small>
      </td>
      <td><span class="badge-status ${p.status==='Concluído'?'pago':'pendente'}">${p.status}</span></td>
    </tr>
  `).join('');

  return `
  <div class="exp-section-wrap">
    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>🎓 hi Academy</h3>
          <button class="link-btn" onclick="exportarRelatorio('academy')">⬇ Exportar</button>
        </div>
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Curso</th><th>Início</th><th>Progresso</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Inscrever em Curso</h3></div>
        <div class="exp-form">
          <label>Seu nome</label>
          <input type="text" id="aca-nome" placeholder="Ex: João Silva" />
          <label>Curso</label>
          <select id="aca-curso">
            <option>Excel Avançado</option>
            <option>Liderança e Gestão</option>
            <option>Comunicação Assertiva</option>
            <option>Gestão do Tempo</option>
            <option>Atendimento ao Cliente</option>
          </select>
          <button class="btn-primary" onclick="cadastrarAcademy()">Inscrever</button>
        </div>
      </div>
    </div>
  </div>`;
}
function cadastrarAcademy() {
  const nome  = document.getElementById('aca-nome').value.trim();
  const curso = document.getElementById('aca-curso').value;
  if (!nome) { alert('Preencha seu nome!'); return; }
  const hoje = new Date().toLocaleDateString('pt-BR');
  expData.academy.push({ nome, curso, data: hoje, progresso: 0, status:'Em andamento' });
  alert(`✅ ${nome} inscrito em "${curso}"!`);
  document.getElementById('exp-content').innerHTML = renderAcademy();
}
function renderIdeias() {
  const rows = expData.ideias.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.ideia}</td>
      <td>${p.data}</td>
      <td><span class="badge-status ${p.status==='Aprovada'?'pago':'pendente'}">${p.status}</span></td>
      <td>
        <button class="link-btn" onclick="votarIdeia('${p.ideia}')">👍 ${p.votos}</button>
      </td>
    </tr>
  `).join('');

  return `
  <div class="exp-section-wrap">
    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>💡 Programa de Ideias</h3>
          <button class="link-btn" onclick="exportarRelatorio('ideias')">⬇ Exportar</button>
        </div>
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Ideia</th><th>Data</th><th>Status</th><th>Votos</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="depto-section">
        <div class="section-header"><h3>Enviar Ideia</h3></div>
        <div class="exp-form">
          <label>Seu nome</label>
          <input type="text" id="ideia-nome" placeholder="Ex: João Silva" />
          <label>Sua ideia</label>
          <textarea id="ideia-texto" placeholder="Descreva sua ideia..." rows="4"></textarea>
          <button class="btn-primary" onclick="cadastrarIdeia()">Enviar Ideia</button>
        </div>
      </div>
    </div>
  </div>`;
}
function cadastrarIdeia() {
  const nome  = document.getElementById('ideia-nome').value.trim();
  const ideia = document.getElementById('ideia-texto').value.trim();
  if (!nome || !ideia) { alert('Preencha todos os campos!'); return; }
  const hoje = new Date().toLocaleDateString('pt-BR');
  expData.ideias.push({ nome, ideia, data: hoje, status:'Em análise', votos: 0 });
  alert(`✅ Ideia enviada com sucesso!`);
  document.getElementById('exp-content').innerHTML = renderIdeias();
}
function votarIdeia(ideiaTexto) {
  const ideia = expData.ideias.find(i => i.ideia === ideiaTexto);
  if (ideia) { ideia.votos++; document.getElementById('exp-content').innerHTML = renderIdeias(); }
}
function exportarRelatorio(modulo) {
  const dados = {
    indique:    expData.indique,
    move:       expData.move,
    experience: expData.assinaturas,
    academy:    expData.academy,
    ideias:     expData.ideias,
  };
  const json = JSON.stringify(dados[modulo], null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `relatorio-${modulo}.json`; a.click();
  URL.revokeObjectURL(url);
}
function initPage_experiencia() {
  document.getElementById('exp-content').innerHTML = renderIndique();
}