// =============================================
// TREINAMENTO & DESENVOLVIMENTO
// =============================================

const devData = {
  treinamentos: [
    { id:1, titulo:'Excel Avançado', tipo:'EAD', categoria:'TI', instrutor:'Ana Paula', dataInicio:'01/05/2025', dataFim:'31/05/2025', vagas:20, inscritos:15, status:'Em andamento' },
    { id:2, titulo:'Liderança e Gestão', tipo:'Presencial', categoria:'RH', instrutor:'Carlos Souza', dataInicio:'10/05/2025', dataFim:'10/05/2025', vagas:15, inscritos:12, status:'Concluído' },
    { id:3, titulo:'Comunicação Assertiva', tipo:'EAD', categoria:'Geral', instrutor:'Maria Lima', dataInicio:'15/05/2025', dataFim:'30/06/2025', vagas:30, inscritos:8, status:'Aberto' },
    { id:4, titulo:'Segurança no Trabalho', tipo:'Presencial', categoria:'Geral', instrutor:'João Silva', dataInicio:'20/05/2025', dataFim:'20/05/2025', vagas:25, inscritos:25, status:'Concluído' },
  ],
  materiais: [
    { id:1, titulo:'Manual de Integração',      tipo:'PDF',  tamanho:'2.3 MB', categoria:'Geral', data:'01/05/2025' },
    { id:2, titulo:'Política de Benefícios',    tipo:'PDF',  tamanho:'1.1 MB', categoria:'RH',    data:'10/04/2025' },
    { id:3, titulo:'Planilha de Metas Q2',      tipo:'XLSX', tamanho:'0.8 MB', categoria:'Geral', data:'01/04/2025' },
    { id:4, titulo:'Guia de Atendimento',       tipo:'PDF',  tamanho:'3.2 MB', categoria:'Comercial', data:'15/03/2025' },
  ],
  provas: [
    { id:1, titulo:'Prova — Excel Avançado',       treinamento:'Excel Avançado',       questoes:20, tempo:60, status:'Aberta',   responderam:8  },
    { id:2, titulo:'Avaliação — Liderança',         treinamento:'Liderança e Gestão',   questoes:15, tempo:45, status:'Encerrada',responderam:12 },
    { id:3, titulo:'Teste — Comunicação Assertiva', treinamento:'Comunicação Assertiva',questoes:10, tempo:30, status:'Aberta',   responderam:3  },
  ],
  controle: [
    { colaborador:'João Silva',    treinamento:'Excel Avançado',       progresso:80,  nota:null,  status:'Em andamento' },
    { colaborador:'Maria Oliveira',treinamento:'Liderança e Gestão',   progresso:100, nota:9.2,   status:'Concluído'    },
    { colaborador:'Carlos Souza',  treinamento:'Segurança no Trabalho',progresso:100, nota:8.5,   status:'Concluído'    },
    { colaborador:'Ana Lima',      treinamento:'Comunicação Assertiva',progresso:30,  nota:null,  status:'Em andamento' },
    { colaborador:'Paulo Santos',  treinamento:'Excel Avançado',       progresso:0,   nota:null,  status:'Não iniciado'  },
  ],
};

let devAbaAtiva = 'treinamentos';

function renderDesenvolvimento() {
  return `
  <div class="depto-page">

    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📚</div>
        <div class="depto-card-info"><strong>${devData.treinamentos.length}</strong><span>Treinamentos</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${devData.treinamentos.filter(t=>t.status==='Concluído').length}</strong><span>Concluídos</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📄</div>
        <div class="depto-card-info"><strong>${devData.materiais.length}</strong><span>Materiais</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📝</div>
        <div class="depto-card-info"><strong>${devData.provas.length}</strong><span>Provas</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">🎓</div>
        <div class="depto-card-info">
          <strong>${devData.controle.filter(c=>c.status==='Concluído').length}/${devData.controle.length}</strong>
          <span>Colaboradores certificados</span>
        </div>
      </div>
    </div>

    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchDevTab(this,'treinamentos')">📚 Treinamentos</button>
      <button class="exp-tab" onclick="switchDevTab(this,'materiais')">📄 Materiais</button>
      <button class="exp-tab" onclick="switchDevTab(this,'provas')">📝 Provas e Testes</button>
      <button class="exp-tab" onclick="switchDevTab(this,'controle')">📊 Controle</button>
    </div>
    <div id="dev-content">${renderDevTreinamentos()}</div>

  </div>`;
}

function switchDevTab(btn, aba) {
  devAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('dev-content');
  if (aba==='treinamentos') el.innerHTML = renderDevTreinamentos();
  if (aba==='materiais')    el.innerHTML = renderDevMateriais();
  if (aba==='provas')       el.innerHTML = renderDevProvas();
  if (aba==='controle')     el.innerHTML = renderDevControle();
}

function initPage_desenvolvimento() {
  setTimeout(() => {
    const el = document.getElementById('dev-content');
    if (el) el.innerHTML = renderDevTreinamentos();
  }, 50);
}

function renderDevTreinamentos() {
  const rows = devData.treinamentos.map((t,i) => `
    <tr>
      <td><strong>${t.titulo}</strong></td>
      <td><span class="badge-status ${t.tipo==='EAD'?'pago':'pendente'}">${t.tipo}</span></td>
      <td>${t.categoria}</td>
      <td>${t.instrutor}</td>
      <td>${t.dataInicio}</td>
      <td>${t.inscritos}/${t.vagas}</td>
      <td><span class="badge-status ${t.status==='Concluído'?'pago':t.status==='Em andamento'?'pendente':'inativo'}">${t.status}</span></td>
      <td>
        <button class="link-btn" onclick="inscreverTreinamento(${i})">+ Inscrever</button>
        <button class="link-btn" onclick="exportarTreinamento(${i})">⬇</button>
      </td>
    </tr>
  `).join('');

  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>📚 Gestão de Treinamentos</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="abrirModalTreinamento()">+ Novo Treinamento</button>
    </div>
    <div class="table-wrap">
      <table class="depto-table">
        <thead><tr><th>Título</th><th>Tipo</th><th>Categoria</th><th>Instrutor</th><th>Início</th><th>Inscritos</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>

  <div class="modal-overlay" id="modal-treinamento" style="display:none" onclick="if(event.target.id==='modal-treinamento')this.style.display='none'">
    <div class="modal-box" style="max-width:560px">
      <div class="modal-header">
        <h3>📚 Novo Treinamento</h3>
        <button class="modal-close" onclick="document.getElementById('modal-treinamento').style.display='none'">✕</button>
      </div>
      <div class="exp-form">
        <label>Título</label><input type="text" id="trein-titulo" placeholder="Nome do treinamento" />
        <div class="form-row">
          <div><label>Tipo</label>
            <select id="trein-tipo"><option>EAD</option><option>Presencial</option><option>Híbrido</option></select>
          </div>
          <div><label>Categoria</label>
            <select id="trein-cat"><option>Geral</option><option>RH</option><option>TI</option><option>Comercial</option><option>Financeiro</option></select>
          </div>
        </div>
        <label>Instrutor</label><input type="text" id="trein-instrutor" placeholder="Nome do instrutor" />
        <div class="form-row">
          <div><label>Data Início</label><input type="date" id="trein-inicio" /></div>
          <div><label>Data Fim</label><input type="date" id="trein-fim" /></div>
        </div>
        <label>Vagas</label><input type="number" id="trein-vagas" placeholder="Número de vagas" />
        <button class="btn-primary" onclick="salvarTreinamento()">✅ Criar Treinamento</button>
      </div>
    </div>
  </div>`;
}

function abrirModalTreinamento() {
  document.getElementById('modal-treinamento').style.display = 'flex';
}

function salvarTreinamento() {
  const titulo   = document.getElementById('trein-titulo').value.trim();
  const tipo     = document.getElementById('trein-tipo').value;
  const cat      = document.getElementById('trein-cat').value;
  const instrutor= document.getElementById('trein-instrutor').value.trim();
  const inicio   = document.getElementById('trein-inicio').value;
  const fim      = document.getElementById('trein-fim').value;
  const vagas    = parseInt(document.getElementById('trein-vagas').value)||0;
  if (!titulo) { alert('Informe o título!'); return; }
  const iFmt = inicio ? new Date(inicio+'T12:00').toLocaleDateString('pt-BR') : '—';
  const fFmt = fim    ? new Date(fim+'T12:00').toLocaleDateString('pt-BR')    : '—';
  devData.treinamentos.push({ id: devData.treinamentos.length+1, titulo, tipo, categoria:cat, instrutor, dataInicio:iFmt, dataFim:fFmt, vagas, inscritos:0, status:'Aberto' });
  document.getElementById('modal-treinamento').style.display = 'none';
  alert(`✅ Treinamento "${titulo}" criado!`);
  document.getElementById('dev-content').innerHTML = renderDevTreinamentos();
}

function inscreverTreinamento(i) {
  const nome = prompt('Nome do colaborador:');
  if (!nome) return;
  devData.treinamentos[i].inscritos++;
  devData.controle.push({ colaborador:nome, treinamento:devData.treinamentos[i].titulo, progresso:0, nota:null, status:'Não iniciado' });
  alert(`✅ ${nome} inscrito em "${devData.treinamentos[i].titulo}"!`);
  document.getElementById('dev-content').innerHTML = renderDevTreinamentos();
}

function exportarTreinamento(i) {
  const t = devData.treinamentos[i];
  const txt = `TREINAMENTO\n${'='.repeat(40)}\nTítulo: ${t.titulo}\nTipo: ${t.tipo}\nInstrutor: ${t.instrutor}\nInício: ${t.dataInicio}\nFim: ${t.dataFim}\nInscritos: ${t.inscritos}/${t.vagas}\nStatus: ${t.status}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download=`treinamento-${t.titulo}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function renderDevMateriais() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>📄 Materiais para Download</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="adicionarMaterial()">+ Adicionar Material</button>
    </div>
    <div class="materiais-grid">
      ${devData.materiais.map((m,i) => `
        <div class="material-card">
          <div class="material-icon ${m.tipo==='PDF'?'pdf':'xlsx'}">${m.tipo==='PDF'?'📄':'📊'}</div>
          <div class="material-info">
            <strong>${m.titulo}</strong>
            <small>${m.categoria} · ${m.tamanho} · ${m.data}</small>
          </div>
          <button class="btn-endo-pub" onclick="baixarMaterial(${i})">⬇ Baixar</button>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function adicionarMaterial() {
  const titulo = prompt('Título do material:');
  if (!titulo) return;
  const tipo = prompt('Tipo (PDF, XLSX, PPTX):') || 'PDF';
  const cat  = prompt('Categoria:') || 'Geral';
  devData.materiais.push({ id: devData.materiais.length+1, titulo, tipo, tamanho:'—', categoria:cat, data: new Date().toLocaleDateString('pt-BR') });
  alert(`✅ Material "${titulo}" adicionado!`);
  document.getElementById('dev-content').innerHTML = renderDevMateriais();
}

function baixarMaterial(i) {
  alert(`⬇ Baixando: ${devData.materiais[i].titulo}\n\nEm produção, este botão abrirá o arquivo real.`);
}

function renderDevProvas() {
  return `
  <div class="depto-section">
    <div class="section-header">
      <h3>📝 Provas e Testes</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="criarProva()">+ Criar Prova</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${devData.provas.map((p,i) => `
        <div class="prova-card">
          <div class="prova-header">
            <div>
              <strong>${p.titulo}</strong>
              <small style="display:block;color:var(--text-muted)">${p.treinamento} · ${p.questoes} questões · ${p.tempo} min</small>
            </div>
            <span class="badge-status ${p.status==='Aberta'?'pago':'inativo'}">${p.status}</span>
          </div>
          <div class="prova-stats">
            <span>👥 ${p.responderam} responderam</span>
            <div style="display:flex;gap:8px">
              <button class="link-btn" onclick="responderProva(${i})">✏️ Responder</button>
              <button class="link-btn" onclick="verResultados(${i})">📊 Resultados</button>
            </div>
          </div>
          <div class="meta-bar-wrap" style="margin-top:8px">
            <div class="meta-bar-fill" style="width:${Math.round((p.responderam/15)*100)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function criarProva() {
  const titulo = prompt('Título da prova:');
  if (!titulo) return;
  const questoes = parseInt(prompt('Número de questões:')||'10');
  const tempo    = parseInt(prompt('Tempo em minutos:')||'30');
  devData.provas.push({ id: devData.provas.length+1, titulo, treinamento:'Geral', questoes, tempo, status:'Aberta', responderam:0 });
  alert(`✅ Prova "${titulo}" criada!`);
  document.getElementById('dev-content').innerHTML = renderDevProvas();
}

function responderProva(i) {
  const nome = prompt('Seu nome:');
  if (!nome) return;
  devData.provas[i].responderam++;
  alert(`✅ Resposta de ${nome} registrada!`);
  document.getElementById('dev-content').innerHTML = renderDevProvas();
}

function verResultados(i) {
  const p = devData.provas[i];
  alert(`📊 RESULTADOS — ${p.titulo}\n\nResponderam: ${p.responderam}\nStatus: ${p.status}\nQuestões: ${p.questoes}\nTempo: ${p.tempo} min`);
}

function renderDevControle() {
  const concluidos  = devData.controle.filter(c=>c.status==='Concluído').length;
  const andamento   = devData.controle.filter(c=>c.status==='Em andamento').length;
  const naoIniciado = devData.controle.filter(c=>c.status==='Não iniciado').length;

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">✅</div>
        <div class="depto-card-info"><strong>${concluidos}</strong><span>Concluídos</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">⏳</div>
        <div class="depto-card-info"><strong>${andamento}</strong><span>Em andamento</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">⭕</div>
        <div class="depto-card-info"><strong>${naoIniciado}</strong><span>Não iniciados</span></div>
      </div>
    </div>
    <div class="depto-section">
      <div class="section-header">
        <h3>📊 Controle de Treinamentos</h3>
        <button class="link-btn" onclick="exportarControle()">⬇ Exportar</button>
      </div>
      <div class="table-wrap">
        <table class="depto-table">
          <thead><tr><th>Colaborador</th><th>Treinamento</th><th>Progresso</th><th>Nota</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            ${devData.controle.map((c,i) => `
              <tr>
                <td>${c.colaborador}</td>
                <td>${c.treinamento}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="meta-bar-wrap" style="width:80px;margin:0">
                      <div class="meta-bar-fill" style="width:${c.progresso}%;background:${c.progresso===100?'var(--success)':'var(--primary)'}"></div>
                    </div>
                    <span style="font-size:12px">${c.progresso}%</span>
                  </div>
                </td>
                <td>${c.nota !== null ? c.nota.toFixed(1) : '—'}</td>
                <td><span class="badge-status ${c.status==='Concluído'?'pago':c.status==='Em andamento'?'pendente':'inativo'}">${c.status}</span></td>
                <td><button class="link-btn" onclick="atualizarProgresso(${i})">Atualizar</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function atualizarProgresso(i) {
  const prog = parseInt(prompt('Progresso (0-100):') || '0');
  devData.controle[i].progresso = Math.min(100, Math.max(0, prog));
  if (prog >= 100) {
    devData.controle[i].status = 'Concluído';
    const nota = parseFloat(prompt('Nota final (0-10):') || '0');
    devData.controle[i].nota = nota;
  } else if (prog > 0) {
    devData.controle[i].status = 'Em andamento';
  }
  document.getElementById('dev-content').innerHTML = renderDevControle();
}

function exportarControle() {
  const txt = `CONTROLE DE TREINAMENTOS\n${'='.repeat(40)}\n${devData.controle.map(c=>`${c.colaborador} | ${c.treinamento} | ${c.progresso}% | Nota: ${c.nota??'—'} | ${c.status}`).join('\n')}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='controle-treinamentos.txt'; a.click();
  URL.revokeObjectURL(url);
}

