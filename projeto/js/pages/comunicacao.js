// =============================================
// COMUNICAÇÃO — MÓDULO COMPLETO
// =============================================

const comunicacaoData = {
  abaAtiva: 'feed',

  feed: [
    {
      id: 1, autor: 'Ana Paula', avatar: 'AP', cargo: 'Diretora de RH',
      tipo: 'comunicado', urgente: true,
      titulo: '📢 Reunião Geral — Todos os Colaboradores',
      texto: 'Convocamos todos os colaboradores para a Reunião Geral de Alinhamento do 2º semestre. Presença obrigatória para gestores e recomendada para demais colaboradores.',
      data: '26/05/2025', hora: '09:14',
      reacoes: { '👍': 12, '❤️': 5, '🎉': 3 },
      comentarios: [
        { autor: 'Carlos Souza', avatar: 'CS', texto: 'Confirmado! Estarei presente.', hora: '09:30' },
        { autor: 'Maria Oliveira', avatar: 'MO', texto: 'Ótimo! Qual a pauta?', hora: '09:45' },
      ],
      visualizacoes: 28,
    },
    {
      id: 2, autor: 'Roberta Lima', avatar: 'RL', cargo: 'Coordenadora de RH',
      tipo: 'noticia', urgente: false,
      titulo: '🏆 Colaborador Destaque — Maio 2025',
      texto: 'É com muita alegria que reconhecemos João Silva como Colaborador Destaque do mês de Maio! Sua dedicação, proatividade e resultados excepcionais são um exemplo para toda a equipe.',
      data: '25/05/2025', hora: '14:20',
      reacoes: { '👍': 24, '❤️': 18, '🎉': 31 },
      comentarios: [
        { autor: 'Ana Paula', avatar: 'AP', texto: 'Merecidíssimo! Parabéns João!', hora: '14:35' },
      ],
      visualizacoes: 45,
    },
    {
      id: 3, autor: 'Carlos Souza', avatar: 'CS', cargo: 'Supervisor Comercial',
      tipo: 'evento', urgente: false,
      titulo: '⚽ Campeonato Interno de Futebol — Inscrições Abertas!',
      texto: 'Abriram as inscrições para o 1º Campeonato Interno de Futebol Society! Forme seu time com colegas e venha se divertir. Times de 7 pessoas. Premiação para o campeão.',
      data: '24/05/2025', hora: '11:00',
      reacoes: { '👍': 8, '🎉': 15, '⚽': 20 },
      comentarios: [],
      visualizacoes: 60,
    },
    {
      id: 4, autor: 'RH Automático', avatar: '🤖', cargo: 'Sistema',
      tipo: 'sistema', urgente: false,
      titulo: '✅ Nova política de Home Office publicada',
      texto: 'A Política de Home Office foi atualizada e está disponível para consulta em Gestão de Pessoas → Políticas. Vigência a partir de 01/06/2025.',
      data: '23/05/2025', hora: '08:00',
      reacoes: { '👍': 6 },
      comentarios: [],
      visualizacoes: 32,
    },
  ],

  avisos: [
    { id: 1, titulo: 'Fechamento de Folha', texto: 'O fechamento de ponto do mês de Maio será no dia 30/05. Regularize seu ponto até lá.', prioridade: 'alta', data: '26/05/2025', ativo: true },
    { id: 2, titulo: 'Manutenção do Sistema', texto: 'Haverá manutenção programada no domingo (26/05) das 02h às 06h. Plataforma ficará indisponível.', prioridade: 'media', data: '25/05/2025', ativo: true },
    { id: 3, titulo: 'Campanha de Vacinação', texto: 'A campanha de vacinação contra gripe será na quinta-feira (29/05) no RH. Traga seu cartão.', prioridade: 'baixa', data: '24/05/2025', ativo: true },
  ],

  canais: [
    { id: 'geral', nome: 'Geral', icon: '💬', membros: 32, descricao: 'Canal principal da empresa', bitrixLink: '' },
    { id: 'rh', nome: 'RH', icon: '👥', membros: 8, descricao: 'Comunicados internos do RH', bitrixLink: '' },
    { id: 'comercial', nome: 'Comercial', icon: '📈', membros: 10, descricao: 'Time comercial e vendas', bitrixLink: '' },
    { id: 'ti', nome: 'TI', icon: '💻', membros: 5, descricao: 'Suporte técnico e tecnologia', bitrixLink: '' },
    { id: 'financeiro', nome: 'Financeiro', icon: '💰', membros: 6, descricao: 'Financeiro e contabilidade', bitrixLink: '' },
    { id: 'operacoes', nome: 'Operações', icon: '⚙️', membros: 8, descricao: 'Operações e logística', bitrixLink: '' },
  ],
};

let comunicacaoAbaAtiva = 'feed';
let feedReacoes = {};
let feedComentariosAberto = {};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function renderComunicacao() {
  return `
  <div class="depto-page">

    <!-- HEADER KPIs -->
    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📢</div>
        <div class="depto-card-info"><strong>${comunicacaoData.feed.length}</strong><span>Publicações</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid var(--danger)">
        <div class="depto-card-icon">🔴</div>
        <div class="depto-card-info"><strong>${comunicacaoData.feed.filter(f=>f.urgente).length}</strong><span>Urgentes</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">📌</div>
        <div class="depto-card-info"><strong>${comunicacaoData.avisos.filter(a=>a.ativo).length}</strong><span>Avisos ativos</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">💬</div>
        <div class="depto-card-info"><strong>${comunicacaoData.canais.length}</strong><span>Canais</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">👁️</div>
        <div class="depto-card-info"><strong>${comunicacaoData.feed.reduce((a,f)=>a+f.visualizacoes,0)}</strong><span>Total visualizações</span></div>
      </div>
    </div>

    <!-- ABAS -->
    <div class="exp-tabs">
      <button class="exp-tab active" onclick="switchComTab(this,'feed')">📰 Feed</button>
      <button class="exp-tab" onclick="switchComTab(this,'avisos')">📌 Avisos</button>
      <button class="exp-tab" onclick="switchComTab(this,'canais')">💬 Canais</button>
      <button class="exp-tab" onclick="switchComTab(this,'novo')">✏️ Novo Comunicado</button>
    </div>
    <div id="com-content" style="margin-top:4px">
      ${renderComFeed()}
    </div>

  </div>`;
}

function initPage_comunicacao() {
  const el = document.getElementById('com-content');
  if (el) el.innerHTML = renderComFeed();
}

function switchComTab(btn, aba) {
  comunicacaoAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('com-content');
  if (!el) return;
  if (aba === 'feed')   el.innerHTML = renderComFeed();
  if (aba === 'avisos') el.innerHTML = renderComAvisos();
  if (aba === 'canais') el.innerHTML = renderComCanais();
  if (aba === 'novo')   el.innerHTML = renderComNovo();
}

// ─────────────────────────────────────────────
// ABA: FEED
// ─────────────────────────────────────────────
function renderComFeed() {
  const tipoCor = { comunicado:'#dc2626', noticia:'#2563eb', evento:'#16a34a', sistema:'#6b7280' };
  const tipoLabel = { comunicado:'COMUNICADO', noticia:'NOTÍCIA', evento:'EVENTO', sistema:'SISTEMA' };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- FILTROS -->
    <div class="section-header">
      <h3>📰 Feed de Comunicação</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select onchange="filtrarFeed(this.value)" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none">
          <option value="">Todos os tipos</option>
          <option value="comunicado">Comunicados</option>
          <option value="noticia">Notícias</option>
          <option value="evento">Eventos</option>
          <option value="sistema">Sistema</option>
        </select>
        <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="abrirNovoPost()">+ Publicar</button>
      </div>
    </div>

    <div id="feed-lista">
      ${comunicacaoData.feed.map((post, idx) => renderPostCard(post, idx, tipoCor, tipoLabel)).join('')}
    </div>

  </div>`;
}

function renderPostCard(post, idx, tipoCor, tipoLabel) {
  const tc = tipoCor  || { comunicado:'#dc2626', noticia:'#2563eb', evento:'#16a34a', sistema:'#6b7280' };
  const tl = tipoLabel|| { comunicado:'COMUNICADO', noticia:'NOTÍCIA', evento:'EVENTO', sistema:'SISTEMA' };
  const cor = tc[post.tipo] || '#6b7280';
  const label = tl[post.tipo] || post.tipo.toUpperCase();
  const reacaoTotal = Object.values(post.reacoes).reduce((a,b)=>a+b,0);
  const comsAberto = feedComentariosAberto[post.id];

  return `
  <div class="depto-section" style="border-left:4px solid ${cor};padding:16px 20px" id="post-${post.id}">

    <!-- Header do post -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div style="display:flex;gap:10px;align-items:center">
        <div class="abs-avatar" style="width:36px;height:36px;font-size:12px;flex-shrink:0">${post.avatar}</div>
        <div>
          <strong style="font-size:13px">${post.autor}</strong>
          <small style="display:block;color:var(--text-muted)">${post.cargo} · ${post.data} às ${post.hora}</small>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${post.urgente ? '<span style="background:#fef2f2;color:#dc2626;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;border:1px solid #fecaca">🔴 URGENTE</span>' : ''}
        <span style="background:${cor}15;color:${cor};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">${label}</span>
        <button class="link-btn" style="font-size:11px" onclick="fixarPost(${post.id})">📌 Fixar</button>
        <button class="link-btn" style="font-size:11px" onclick="excluirPost(${post.id})">🗑️</button>
      </div>
    </div>

    <!-- Conteúdo -->
    <h4 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--text-primary)">${post.titulo}</h4>
    <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">${post.texto}</p>

    <!-- Reações -->
    <div style="display:flex;gap:8px;align-items:center;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:10px;flex-wrap:wrap">
      ${Object.entries(post.reacoes).map(([emoji, count]) => `
        <button onclick="reagirPost(${post.id},'${emoji}')" style="
          display:flex;align-items:center;gap:4px;padding:4px 10px;
          border-radius:20px;border:1px solid var(--border);background:var(--surface);
          cursor:pointer;font-size:12px;font-family:inherit;
          transition:all .15s
        " onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--surface)'">
          ${emoji} <span>${count}</span>
        </button>
      `).join('')}
      <button onclick="reagirPost(${post.id},'👍')" style="
        display:flex;align-items:center;gap:4px;padding:4px 10px;
        border-radius:20px;border:1px dashed var(--border);background:transparent;
        cursor:pointer;font-size:12px;font-family:inherit;color:var(--text-muted)
      ">+ Reagir</button>
      <span style="margin-left:auto;font-size:11px;color:var(--text-muted)">👁️ ${post.visualizacoes} visualizações</span>
    </div>

    <!-- Ações -->
    <div style="display:flex;gap:12px;align-items:center">
      <button class="link-btn" onclick="toggleComentarios(${post.id})">
        💬 ${post.comentarios.length} comentário${post.comentarios.length !== 1 ? 's' : ''}
      </button>
      <button class="link-btn" onclick="compartilharPost(${post.id})">↗ Compartilhar</button>
      <button class="link-btn" onclick="exportarPost(${post.id})">⬇ Exportar</button>
    </div>

    <!-- Comentários -->
    <div id="coms-${post.id}" style="display:${comsAberto?'block':'none'};margin-top:12px">
      ${post.comentarios.map(c => `
        <div style="display:flex;gap:8px;margin-bottom:8px;padding:8px;background:var(--surface);border-radius:8px">
          <div class="abs-avatar" style="width:28px;height:28px;font-size:9px;flex-shrink:0">${c.avatar}</div>
          <div>
            <strong style="font-size:12px">${c.autor}</strong>
            <span style="font-size:11px;color:var(--text-muted);margin-left:6px">${c.hora}</span>
            <p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0">${c.texto}</p>
          </div>
        </div>
      `).join('')}
      <div style="display:flex;gap:8px;margin-top:8px">
        <input type="text" id="com-input-${post.id}" placeholder="Escreva um comentário..."
          style="flex:1;border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:12px;font-family:inherit;outline:none"
          onkeydown="if(event.key==='Enter')enviarComentario(${post.id})" />
        <button class="btn-primary" style="padding:8px 14px;font-size:12px" onclick="enviarComentario(${post.id})">Enviar</button>
      </div>
    </div>

  </div>`;
}

function filtrarFeed(tipo) {
  const lista = document.getElementById('feed-lista');
  if (!lista) return;
  const tc = { comunicado:'#dc2626', noticia:'#2563eb', evento:'#16a34a', sistema:'#6b7280' };
  const tl = { comunicado:'COMUNICADO', noticia:'NOTÍCIA', evento:'EVENTO', sistema:'SISTEMA' };
  const dados = tipo ? comunicacaoData.feed.filter(f => f.tipo === tipo) : comunicacaoData.feed;
  lista.innerHTML = dados.map((post, i) => renderPostCard(post, i, tc, tl)).join('');
}

function toggleComentarios(id) {
  feedComentariosAberto[id] = !feedComentariosAberto[id];
  const el = document.getElementById(`coms-${id}`);
  if (el) el.style.display = feedComentariosAberto[id] ? 'block' : 'none';
}

function reagirPost(id, emoji) {
  const post = comunicacaoData.feed.find(p => p.id === id);
  if (!post) return;
  post.reacoes[emoji] = (post.reacoes[emoji] || 0) + 1;
  const tc = { comunicado:'#dc2626', noticia:'#2563eb', evento:'#16a34a', sistema:'#6b7280' };
  const tl = { comunicado:'COMUNICADO', noticia:'NOTÍCIA', evento:'EVENTO', sistema:'SISTEMA' };
  const el = document.getElementById(`post-${id}`);
  if (el) el.outerHTML = renderPostCard(post, id, tc, tl);
}

function enviarComentario(id) {
  const input = document.getElementById(`com-input-${id}`);
  if (!input || !input.value.trim()) return;
  const post = comunicacaoData.feed.find(p => p.id === id);
  if (!post) return;
  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const nome = userData.nome || 'Você';
  const iniciais = nome.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  post.comentarios.push({
    autor: nome, avatar: iniciais,
    texto: input.value.trim(),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });
  feedComentariosAberto[id] = true;
  const tc = { comunicado:'#dc2626', noticia:'#2563eb', evento:'#16a34a', sistema:'#6b7280' };
  const tl = { comunicado:'COMUNICADO', noticia:'NOTÍCIA', evento:'EVENTO', sistema:'SISTEMA' };
  const el = document.getElementById(`post-${id}`);
  if (el) el.outerHTML = renderPostCard(post, id, tc, tl);
}

function fixarPost(id) {
  const post = comunicacaoData.feed.find(p => p.id === id);
  if (post) alert(`📌 "${post.titulo}" foi fixado no topo do feed!`);
}

function excluirPost(id) {
  if (!confirm('Deseja excluir esta publicação?')) return;
  const idx = comunicacaoData.feed.findIndex(p => p.id === id);
  if (idx >= 0) comunicacaoData.feed.splice(idx, 1);
  document.getElementById('com-content').innerHTML = renderComFeed();
}

function compartilharPost(id) {
  const post = comunicacaoData.feed.find(p => p.id === id);
  if (post) alert(`↗ Link copiado!\n\nCompartilhe "${post.titulo}" com seu time via Bitrix24.`);
}

function exportarPost(id) {
  const post = comunicacaoData.feed.find(p => p.id === id);
  if (!post) return;
  const txt = `COMUNICADO\n${'='.repeat(40)}\n${post.titulo}\n\n${post.texto}\n\nPublicado por: ${post.autor}\nData: ${post.data} às ${post.hora}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download=`comunicado-${post.id}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function abrirNovoPost() {
  document.querySelectorAll('.exp-tab').forEach((t,i) => t.classList.toggle('active', i===3));
  document.getElementById('com-content').innerHTML = renderComNovo();
}

// ─────────────────────────────────────────────
// ABA: AVISOS
// ─────────────────────────────────────────────
function renderComAvisos() {
  const corPri = { alta: '#dc2626', media: '#d97706', baixa: '#16a34a' };
  const bgPri  = { alta: '#fef2f2', media: '#fffbeb', baixa: '#f0fdf4' };

  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>📌 Quadro de Avisos</h3>
      <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="novoAviso()">+ Novo Aviso</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px" id="avisos-lista">
      ${comunicacaoData.avisos.filter(a=>a.ativo).map((aviso, i) => `
        <div style="
          border-radius:12px;padding:16px 20px;
          background:${bgPri[aviso.prioridade]};
          border-left:4px solid ${corPri[aviso.prioridade]};
          display:flex;gap:16px;align-items:flex-start
        ">
          <div style="font-size:24px">${aviso.prioridade==='alta'?'🔴':aviso.prioridade==='media'?'🟡':'🟢'}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <strong style="font-size:14px">${aviso.titulo}</strong>
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${corPri[aviso.prioridade]};color:white">
                ${aviso.prioridade.toUpperCase()}
              </span>
            </div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">${aviso.texto}</p>
            <small style="color:var(--text-muted)">📅 ${aviso.data}</small>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button class="link-btn" onclick="editarAviso(${i})">✏️ Editar</button>
            <button class="link-btn" onclick="arquivarAviso(${i})">📁 Arquivar</button>
            <button class="link-btn" onclick="publicarAvisoFeed(${i})">📢 Publicar</button>
          </div>
        </div>
      `).join('')}
    </div>

  </div>`;
}

function novoAviso() {
  const titulo = prompt('Título do aviso:');
  if (!titulo) return;
  const texto = prompt('Texto do aviso:');
  if (!texto) return;
  const pris = ['alta','media','baixa'];
  const pri = pris[Math.floor(Math.random()*3)];
  comunicacaoData.avisos.unshift({
    id: Date.now(), titulo, texto, prioridade: pri,
    data: new Date().toLocaleDateString('pt-BR'), ativo: true,
  });
  document.getElementById('com-content').innerHTML = renderComAvisos();
}

function editarAviso(i) {
  const aviso = comunicacaoData.avisos.filter(a=>a.ativo)[i];
  if (!aviso) return;
  const novo = prompt('Editar texto:', aviso.texto);
  if (novo) { aviso.texto = novo; document.getElementById('com-content').innerHTML = renderComAvisos(); }
}

function arquivarAviso(i) {
  if (!confirm('Arquivar este aviso?')) return;
  const ativos = comunicacaoData.avisos.filter(a=>a.ativo);
  if (ativos[i]) { ativos[i].ativo = false; document.getElementById('com-content').innerHTML = renderComAvisos(); }
}

function publicarAvisoFeed(i) {
  const aviso = comunicacaoData.avisos.filter(a=>a.ativo)[i];
  if (!aviso) return;
  comunicacaoData.feed.unshift({
    id: Date.now(), autor: 'RH', avatar: 'RH', cargo: 'Recursos Humanos',
    tipo: 'comunicado', urgente: aviso.prioridade === 'alta',
    titulo: `📌 ${aviso.titulo}`,
    texto: aviso.texto,
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    reacoes: { '👍': 0 }, comentarios: [], visualizacoes: 0,
  });
  alert('✅ Aviso publicado no Feed!');
}

// ─────────────────────────────────────────────
// ABA: CANAIS
// ─────────────────────────────────────────────
function renderComCanais() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="section-header">
      <h3>💬 Canais de Comunicação</h3>
      <div style="display:flex;gap:8px">
        <a href="${(typeof AppConfig !== 'undefined' ? AppConfig.bitrix.portalUrl : 'https://bitrix24.com.br')}" target="_blank" class="link-btn">Abrir Bitrix24 ↗</a>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="novoCanal()">+ Novo Canal</button>
      </div>
    </div>

    <div style="
      background:linear-gradient(135deg,#1e3a5f,#2563eb);
      border-radius:14px;padding:20px;color:white;margin-bottom:8px
    ">
      <h4 style="margin-bottom:6px">🔗 Integração com Bitrix24</h4>
      <p style="font-size:13px;opacity:.85;margin-bottom:12px">
        Os canais abaixo são espelhados no Bitrix24. Mensagens enviadas lá aparecem aqui e vice-versa após integração.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span style="background:rgba(255,255,255,.15);padding:4px 12px;border-radius:20px;font-size:12px">✅ Sincronização configurada</span>
        <span style="background:rgba(255,255,255,.15);padding:4px 12px;border-radius:20px;font-size:12px">🔔 Notificações ativas</span>
        <span style="background:rgba(255,255,255,.15);padding:4px 12px;border-radius:20px;font-size:12px">📱 App mobile disponível</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
      ${comunicacaoData.canais.map((canal, i) => `
        <div class="depto-section" style="cursor:pointer;transition:all .2s" id="canal-${canal.id}"
          onmouseover="this.style.borderColor='var(--primary)'"
          onmouseout="this.style.borderColor='var(--border)'">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="font-size:24px">${canal.icon}</span>
            <div>
              <strong># ${canal.nome}</strong>
              <small style="display:block;color:var(--text-muted)">${canal.membros} membros</small>
            </div>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${canal.descricao}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-primary" style="padding:6px 12px;font-size:11px" onclick="abrirCanal('${canal.id}')">💬 Abrir</button>
            <button class="link-btn" style="font-size:11px" onclick="configurarCanal('${canal.id}')">⚙️ Config</button>
            <button class="link-btn" style="font-size:11px" onclick="enviarMensagemCanal('${canal.id}','${canal.nome}')">📨 Mensagem</button>
          </div>
        </div>
      `).join('')}
    </div>

  </div>`;
}

function abrirCanal(id) {
  const canal = comunicacaoData.canais.find(c => c.id === id);
  if (!canal) return;
  const bitrixUrl = (typeof AppConfig !== 'undefined' ? AppConfig.bitrix.portalUrl : 'https://bitrix24.com.br');
  if (canal.bitrixLink) { window.open(canal.bitrixLink, '_blank'); }
  else { alert(`💬 Canal #${canal.nome}\n\nConfigure o link do Bitrix24 em Integrações → Bitrix24.\n\nPortal: ${bitrixUrl}`); }
}

function configurarCanal(id) {
  const canal = comunicacaoData.canais.find(c => c.id === id);
  if (!canal) return;
  const link = prompt(`Link do canal no Bitrix24 (#${canal.nome}):`, canal.bitrixLink);
  if (link !== null) { canal.bitrixLink = link; alert('✅ Canal configurado!'); }
}

function enviarMensagemCanal(id, nome) {
  const msg = prompt(`Mensagem para #${nome}:`);
  if (!msg) return;
  alert(`✅ Mensagem enviada para #${nome}:\n\n"${msg}"\n\nApós integração, será enviada automaticamente pelo Bitrix24.`);
}

function novoCanal() {
  const nome = prompt('Nome do canal (sem #):');
  if (!nome) return;
  const desc = prompt('Descrição:') || '';
  const icons = ['💬','📢','🎯','🔧','💡','🌟'];
  comunicacaoData.canais.push({
    id: nome.toLowerCase().replace(' ','-'),
    nome: nome.charAt(0).toUpperCase() + nome.slice(1),
    icon: icons[Math.floor(Math.random()*icons.length)],
    membros: 1, descricao: desc, bitrixLink: '',
  });
  document.getElementById('com-content').innerHTML = renderComCanais();
}

// ─────────────────────────────────────────────
// ABA: NOVO COMUNICADO
// ─────────────────────────────────────────────
function renderComNovo() {
  return `
  <div style="max-width:680px">
    <div class="depto-section">
      <div class="section-header">
        <h3>✏️ Novo Comunicado</h3>
        <span class="mes-badge">Publicação interna</span>
      </div>
      <div class="exp-form">
        <div class="form-row">
          <div>
            <label>Tipo</label>
            <select id="com-tipo">
              <option value="comunicado">📢 Comunicado</option>
              <option value="noticia">📰 Notícia</option>
              <option value="evento">🎉 Evento</option>
              <option value="sistema">⚙️ Sistema</option>
            </select>
          </div>
          <div>
            <label>Prioridade</label>
            <select id="com-urgente">
              <option value="false">Normal</option>
              <option value="true">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <label>Título</label>
        <input type="text" id="com-titulo" placeholder="Título do comunicado" />

        <label>Texto</label>
        <textarea id="com-texto" rows="5" placeholder="Escreva o conteúdo do comunicado..."></textarea>

        <label>Canais de distribuição</label>
        <div class="ben-checks">
          <label class="check-item"><input type="checkbox" id="com-ch-feed" checked /> 📰 Feed interno</label>
          <label class="check-item"><input type="checkbox" id="com-ch-aviso" /> 📌 Quadro de avisos</label>
          <label class="check-item"><input type="checkbox" id="com-ch-endo" /> 📺 Endomarketing.tv</label>
          <label class="check-item"><input type="checkbox" id="com-ch-btx" /> 🔗 Bitrix24</label>
        </div>

        <label>Destinatários</label>
        <div class="ben-checks">
          <label class="check-item"><input type="checkbox" checked /> 👥 Todos os colaboradores</label>
          <label class="check-item"><input type="checkbox" /> 👔 Apenas gestores</label>
          <label class="check-item"><input type="checkbox" /> 🏗️ Por departamento</label>
        </div>

        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-primary" onclick="publicarComunicado()">📢 Publicar agora</button>
          <button class="link-btn" onclick="agendarComunicado()">📅 Agendar</button>
          <button class="link-btn" onclick="previewComunicado()">👁️ Preview</button>
        </div>
      </div>
    </div>
  </div>`;
}

function publicarComunicado() {
  const titulo  = document.getElementById('com-titulo')?.value.trim();
  const texto   = document.getElementById('com-texto')?.value.trim();
  const tipo    = document.getElementById('com-tipo')?.value;
  const urgente = document.getElementById('com-urgente')?.value === 'true';
  if (!titulo || !texto) { alert('Preencha título e texto!'); return; }

  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const autor  = userData.nome  || 'RH';
  const cargo  = userData.cargo || 'Recursos Humanos';
  const iniciais = autor.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

  comunicacaoData.feed.unshift({
    id: Date.now(), autor, avatar: iniciais, cargo,
    tipo, urgente,
    titulo: `${tipo==='comunicado'?'📢':tipo==='noticia'?'📰':tipo==='evento'?'🎉':'⚙️'} ${titulo}`,
    texto,
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    reacoes: { '👍': 0 }, comentarios: [], visualizacoes: 0,
  });

  const noAviso = document.getElementById('com-ch-aviso')?.checked;
  if (noAviso) {
    comunicacaoData.avisos.unshift({
      id: Date.now(), titulo, texto, prioridade: urgente?'alta':'media',
      data: new Date().toLocaleDateString('pt-BR'), ativo: true,
    });
  }

  const noBtx = document.getElementById('com-ch-btx')?.checked;
  if (noBtx) {
    alert(`✅ Comunicado publicado!\n\n📰 Feed interno: sim\n${noAviso?'📌 Avisos: sim\n':''}\n🔗 Bitrix24: mensagem copiada — cole no canal após integração.`);
  } else {
    alert('✅ Comunicado publicado no feed!');
  }

  // Volta para o feed
  document.querySelectorAll('.exp-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.getElementById('com-content').innerHTML = renderComFeed();
}

function agendarComunicado() {
  const data  = prompt('Data de publicação (DD/MM/AAAA):');
  const hora  = prompt('Hora (HH:MM):');
  if (data && hora) alert(`📅 Comunicado agendado para ${data} às ${hora}.\n\nO sistema publicará automaticamente após integração.`);
}

function previewComunicado() {
  const titulo = document.getElementById('com-titulo')?.value || '(sem título)';
  const texto  = document.getElementById('com-texto')?.value  || '(sem texto)';
  alert(`PREVIEW:\n\n${titulo}\n\n${texto}`);
}
