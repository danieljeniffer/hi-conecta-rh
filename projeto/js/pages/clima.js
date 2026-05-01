// =============================================
// CLIMA & ENGAJAMENTO
// =============================================

const climaData = {
  notificacoes: [],
  posts: [
    {
      id: 1,
      tipo: 'aniversario',
      autor: 'RH Oficial',
      avatar: '🎂',
      oficial: true,
      tempo: '2h atrás',
      texto: '🎉 Hoje é dia de comemorar! Desejamos um feliz aniversário para nossa querida MARIA OLIVEIRA! Que seu dia seja repleto de alegria! 🎂🥳',
      reacoes: { curtir:12, amar:8, haha:2, uau:1 },
      minhasReacoes: [],
      comentarios: [
        { autor:'João Silva',   avatar:'JS', texto:'Parabéns Maria!! 🎉', tempo:'1h atrás'  },
        { autor:'Carlos Souza', avatar:'CS', texto:'Feliz aniversário! 🥳', tempo:'45min atrás' },
      ]
    },
    {
      id: 2,
      tipo: 'novo_colaborador',
      autor: 'RH Oficial',
      avatar: '👋',
      oficial: true,
      tempo: '1 dia atrás',
      texto: '👋 Deem as boas-vindas ao nosso novo colaborador! PEDRO HENRIQUE entra hoje para o time de TI! Seja muito bem-vindo! 🚀',
      reacoes: { curtir:20, amar:15, haha:0, uau:5 },
      minhasReacoes: [],
      comentarios: [
        { autor:'Ana Lima', avatar:'AL', texto:'Bem-vindo Pedro! 👏', tempo:'23h atrás' },
      ]
    },
    {
      id: 3,
      tipo: 'momento',
      autor: 'João Silva',
      avatar: 'JS',
      oficial: false,
      tempo: '5h atrás',
      texto: '☕ Aquela pausa do café com a melhor equipe do mundo! Gratidão! #TimeHi',
      reacoes: { curtir:8, amar:6, haha:1, uau:0 },
      minhasReacoes: [],
      comentarios: [
        { autor:'Maria Oliveira', avatar:'MO', texto:'Que time incrível! ❤️', tempo:'4h atrás' },
      ]
    },
  ],
  comunicados: [
    { titulo:'Juntos somos mais fortes!',  texto:'Essa é a força que nos move todos os dias.',          urgente:true,  data:'24/05/2025', autor:'RH Oficial' },
    { titulo:'Reunião de líderes',          texto:'Segunda-feira às 09h00. Presença obrigatória.',       urgente:false, data:'26/05/2025', autor:'RH Oficial' },
    { titulo:'Semana da Saúde Mental',      texto:'De 10 a 14/06 teremos ações especiais de bem-estar.', urgente:false, data:'01/06/2025', autor:'RH Oficial' },
  ],
};

const reacaoEmojis = { curtir:'👍', amar:'❤️', haha:'😂', uau:'😮' };

let climaAbaAtiva = 'feed';

function renderClima() {
  return `
  <div class="depto-page">

    <div class="exp-tabs">
      <button class="exp-tab active"  onclick="switchClimaTab(this,'feed')">📰 Feed</button>
      <button class="exp-tab" onclick="switchClimaTab(this,'comunicados')">📢 Comunicados</button>
      <button class="exp-tab" onclick="switchClimaTab(this,'engajamento')">📊 Engajamento</button>
    </div>

    <div id="clima-content">
      ${renderClimaFeed()}
    </div>

  </div>`;
}

function switchClimaTab(btn, aba) {
  climaAbaAtiva = aba;
  document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('clima-content');
  if (aba==='feed')        el.innerHTML = renderClimaFeed();
  if (aba==='comunicados') el.innerHTML = renderClimaComunicados();
  if (aba==='engajamento') el.innerHTML = renderClimaEngajamento();
}

function initPage_clima() {
  setTimeout(() => {
    const el = document.getElementById('clima-content');
    if (el) el.innerHTML = renderClimaFeed();
  }, 50);
}
// =============================================
// FEED
// =============================================
function renderClimaFeed() {
  return `
  <div class="feed-layout">

    <!-- ESQUERDA -->
    <div class="feed-sidebar-left">

      <div class="depto-section">
        <div class="section-header">
          <h3>🔔 Notificações</h3>
          <span class="mes-badge" id="notif-count">${climaData.notificacoes.length}</span>
        </div>
        <div id="notif-list">
          ${climaData.notificacoes.length===0
            ? '<p style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px">Nenhuma notificação</p>'
            : climaData.notificacoes.map(n=>`<div class="notif-item"><span>${n.emoji}</span><span style="font-size:12px">${n.texto}</span></div>`).join('')
          }
        </div>
      </div>

      <div class="depto-section" style="margin-top:16px">
        <div class="section-header">
          <h3>🎂 Aniversariantes</h3>
          <span class="mes-badge">Maio</span>
        </div>
        <div class="aniv-list">
          ${[
            { nome:'Maria Oliveira', dia:'24/05', avatar:'MO' },
            { nome:'João Silva',     dia:'28/05', avatar:'JS' },
          ].map(a=>`
            <div class="aniv-item">
              <div class="abs-avatar">${a.avatar}</div>
              <div>
                <strong style="font-size:13px">${a.nome}</strong>
                <small style="display:block;font-size:11px;color:var(--text-muted)">🎂 ${a.dia}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="depto-section" style="margin-top:16px">
        <div class="section-header"><h3>⭐ Tempo de Casa</h3></div>
        <div class="aniv-list">
          ${[
            { nome:'Carlos Souza', anos:'5 anos', avatar:'CS' },
            { nome:'Ana Lima',     anos:'3 anos', avatar:'AL' },
          ].map(a=>`
            <div class="aniv-item">
              <div class="abs-avatar" style="background:var(--warning-light);color:var(--warning)">${a.avatar}</div>
              <div>
                <strong style="font-size:13px">${a.nome}</strong>
                <small style="display:block;font-size:11px;color:var(--text-muted)">🏆 ${a.anos}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- FEED CENTRAL -->
    <div class="feed-main">

      <div class="depto-section publicar-box">
        <div class="publicar-top">
          <div class="abs-avatar">MR</div>
          <input type="text" id="post-texto" placeholder="Compartilhe um momento com o time..." onclick="abrirPublicar()" readonly style="cursor:pointer" />
        </div>
        <div class="publicar-acoes">
          <button onclick="publicarRH('aniversario')">🎂 Aniversariante</button>
          <button onclick="publicarRH('novo_colaborador')">👋 Novo Colaborador</button>
          <button onclick="publicarRH('tempo_casa')">🏆 Tempo de Casa</button>
          <button onclick="abrirPublicar()">📸 Momento</button>
        </div>
      </div>

      <div id="feed-posts">
        ${climaData.posts.map(p => renderPost(p)).join('')}
      </div>

    </div>

    <!-- DIREITA -->
    <div class="feed-sidebar-right">

      <div class="depto-section">
        <div class="section-header"><h3>👥 Online agora</h3></div>
        <div class="online-list">
          ${[
            { nome:'Mariana R.',   avatar:'MR', status:'online'  },
            { nome:'João Silva',   avatar:'JS', status:'online'  },
            { nome:'Ana Lima',     avatar:'AL', status:'ausente' },
            { nome:'Carlos Souza', avatar:'CS', status:'online'  },
          ].map(u=>`
            <div class="online-item">
              <div style="position:relative;display:inline-block">
                <div class="abs-avatar" style="width:30px;height:30px;font-size:10px">${u.avatar}</div>
                <span class="status-dot ${u.status}"></span>
              </div>
              <span style="font-size:13px">${u.nome}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="depto-section" style="margin-top:16px">
        <div class="section-header"><h3>📊 Engajamento</h3></div>
        <div class="eng-stats">
          <div class="eng-stat">
            <strong>${climaData.posts.length}</strong>
            <span>Posts</span>
          </div>
          <div class="eng-stat">
            <strong>${climaData.posts.reduce((a,p)=>a+Object.values(p.reacoes).reduce((x,y)=>x+y,0),0)}</strong>
            <span>Reações</span>
          </div>
          <div class="eng-stat">
            <strong>${climaData.posts.reduce((a,p)=>a+p.comentarios.length,0)}</strong>
            <span>Comentários</span>
          </div>
        </div>
      </div>

      <div class="depto-section" style="margin-top:16px">
        <div class="section-header"><h3>📢 Último Comunicado</h3></div>
        <div style="font-size:13px">
          <strong>${climaData.comunicados[0].titulo}</strong>
          <p style="color:var(--text-muted);font-size:12px;margin-top:4px">${climaData.comunicados[0].texto}</p>
          <button class="link-btn" style="margin-top:8px" onclick="switchClimaTab(document.querySelectorAll('.exp-tab')[1],'comunicados')">Ver todos →</button>
        </div>
      </div>

    </div>

  </div>

  <!-- MODAL PUBLICAR -->
  <div class="modal-overlay" id="modal-publicar" style="display:none" onclick="fecharModalPublicar(event)">
    <div class="modal-box" style="max-width:520px">
      <div class="modal-header">
        <h3>✍️ Nova Publicação</h3>
        <button class="modal-close" onclick="document.getElementById('modal-publicar').style.display='none'">✕</button>
      </div>
      <div class="exp-form">
        <label>Tipo de publicação</label>
        <select id="pub-tipo">
          <option value="momento">📸 Momento com o time</option>
          <option value="aniversario">🎂 Aniversariante</option>
          <option value="novo_colaborador">👋 Novo Colaborador</option>
          <option value="tempo_casa">🏆 Tempo de Casa</option>
        </select>
        <label>Mensagem</label>
        <textarea id="pub-texto" rows="5" placeholder="O que você quer compartilhar?"></textarea>
        <button class="btn-primary" onclick="publicar()">📢 Publicar para todos</button>
      </div>
    </div>
  </div>`;
}

function renderPost(p) {
  const totalReacoes = Object.values(p.reacoes).reduce((a,b)=>a+b,0);
  const reacoesBtns = Object.entries(reacaoEmojis).map(([tipo,emoji])=>`
    <button class="reacao-btn ${p.minhasReacoes.includes(tipo)?'ativa':''}" onclick="reagir(${p.id},'${tipo}')">
      ${emoji} <span>${p.reacoes[tipo]}</span>
    </button>
  `).join('');

  const comentariosHtml = p.comentarios.map(c=>`
    <div class="comentario-item">
      <div class="abs-avatar" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${c.avatar}</div>
      <div class="comentario-balao">
        <strong>${c.autor}</strong>
        <p>${c.texto}</p>
        <small>${c.tempo}</small>
      </div>
    </div>
  `).join('');

  const tipoLabel = {
    aniversario:'🎂 Aniversário', novo_colaborador:'👋 Novo Colaborador',
    tempo_casa:'🏆 Tempo de Casa', momento:'📸 Momento',
  };

  return `
  <div class="post-card" id="post-${p.id}">
    <div class="post-header">
      <div class="post-avatar">${p.avatar}</div>
      <div class="post-autor-info">
        <strong>${p.autor}${p.oficial?' <span class="oficial-badge">✓ Oficial</span>':''}</strong>
        <small>${p.tempo} · ${tipoLabel[p.tipo]||''}</small>
      </div>
    </div>
    <div class="post-body"><p>${p.texto}</p></div>
    <div class="post-stats">
      <span>${totalReacoes>0?totalReacoes+' reações':''}</span>
      <span>${p.comentarios.length>0?p.comentarios.length+' comentário'+(p.comentarios.length!==1?'s':''):''}</span>
    </div>
    <div class="post-reacoes">${reacoesBtns}</div>
    <div class="post-comentarios">
      ${comentariosHtml}
      <div class="comentar-wrap">
        <div class="abs-avatar" style="width:28px;height:28px;font-size:10px;flex-shrink:0">MR</div>
        <input type="text" class="comentar-input" id="comentar-${p.id}" placeholder="Escreva um comentário..." />
        <button class="comentar-btn" onclick="comentar(${p.id})">Enviar</button>
      </div>
    </div>
  </div>`;
}

function reagir(postId, tipo) {
  const post = climaData.posts.find(p=>p.id===postId);
  if (!post) return;
  if (post.minhasReacoes.includes(tipo)) {
    post.minhasReacoes = post.minhasReacoes.filter(r=>r!==tipo);
    post.reacoes[tipo]--;
  } else {
    post.minhasReacoes.push(tipo);
    post.reacoes[tipo]++;
  }
  document.getElementById('post-'+postId).outerHTML = renderPost(post);
}

function comentar(postId) {
  const input = document.getElementById('comentar-'+postId);
  const texto = input.value.trim();
  if (!texto) return;
  const post = climaData.posts.find(p=>p.id===postId);
  post.comentarios.push({ autor:'Mariana R.', avatar:'MR', texto, tempo:'agora' });
  adicionarNotificacao('💬', `Você comentou no post de ${post.autor}`);
  document.getElementById('post-'+postId).outerHTML = renderPost(post);
}

function abrirPublicar() {
  document.getElementById('modal-publicar').style.display = 'flex';
}

function publicar() {
  const tipo  = document.getElementById('pub-tipo').value;
  const texto = document.getElementById('pub-texto').value.trim();
  if (!texto) { alert('Escreva algo antes de publicar!'); return; }
  climaData.posts.unshift({
    id: Date.now(), tipo, autor:'Mariana R.', avatar:'MR',
    oficial:false, tempo:'agora', texto,
    reacoes:{curtir:0,amar:0,haha:0,uau:0},
    minhasReacoes:[], comentarios:[]
  });
  adicionarNotificacao('📢', `Nova publicação: ${texto.substring(0,40)}...`);
  document.getElementById('modal-publicar').style.display = 'none';
  document.getElementById('feed-posts').innerHTML = climaData.posts.map(p=>renderPost(p)).join('');
}

function publicarRH(tipo) {
  const textos = {
    aniversario:     '🎂 Hoje é aniversário de [NOME]! Feliz aniversário! 🎉',
    novo_colaborador:'👋 Sejam bem-vindos ao nosso novo colaborador [NOME]! 🚀',
    tempo_casa:      '🏆 [NOME] completa hoje [X] anos de empresa! Parabéns! ⭐',
  };
  document.getElementById('modal-publicar').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('pub-tipo').value = tipo;
    document.getElementById('pub-texto').value = textos[tipo]||'';
  }, 50);
}

function adicionarNotificacao(emoji, texto) {
  climaData.notificacoes.unshift({ emoji, texto });
  const el  = document.getElementById('notif-count');
  const lst = document.getElementById('notif-list');
  if (el)  el.textContent = climaData.notificacoes.length;
  if (lst) lst.innerHTML  = climaData.notificacoes.map(n=>`
    <div class="notif-item"><span>${n.emoji}</span><span style="font-size:12px">${n.texto}</span></div>
  `).join('');
}

function fecharModalPublicar(event) {
  if (event.target.id==='modal-publicar') document.getElementById('modal-publicar').style.display='none';
}

function publicarNoFeedClima(titulo, msg) {
  climaData.posts.unshift({
    id: Date.now(), tipo:'momento',
    autor:'Endomarketing.tv', avatar:'📺',
    oficial:true, tempo:'agora', texto:msg,
    reacoes:{curtir:0,amar:0,haha:0,uau:0},
    minhasReacoes:[], comentarios:[]
  });
  adicionarNotificacao('📺', `Endomarketing.tv publicou: ${titulo}`);
}
// =============================================
// COMUNICADOS (integrado com Endomarketing)
// =============================================
function renderClimaComunicados() {
  return `
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="depto-section">
      <div class="section-header">
        <h3>📢 Comunicados Internos</h3>
        <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="novoComunicadoClima()">+ Novo Comunicado</button>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        Os comunicados publicados aqui aparecem automaticamente no Feed e no Endomarketing.tv
      </p>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${climaData.comunicados.map((c,i) => `
          <div class="comunicado-item ${c.urgente?'urgente':''}">
            <div class="comunicado-item-header">
              ${c.urgente?'<span class="urgente-tag">🔴 URGENTE</span>':''}
              <span class="comunicado-data">${c.data} · ${c.autor}</span>
            </div>
            <h4 style="margin-bottom:4px">${c.titulo}</h4>
            <p style="color:var(--text-muted);font-size:13px;margin-bottom:10px">${c.texto}</p>
            <div style="display:flex;gap:8px">
              <button class="btn-endo-pub" onclick="publicarComunicadoNoFeed(${i})">📰 Publicar no Feed</button>
              <button class="btn-endo-pub repub" onclick="publicarNoEndomarketing(${i})">📺 Enviar ao Endomarketing.tv</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

  </div>`;
}

function novoComunicadoClima() {
  const titulo  = prompt('Título do comunicado:');
  if (!titulo) return;
  const texto   = prompt('Texto do comunicado:');
  if (!texto) return;
  const urgente = confirm('É urgente?');
  climaData.comunicados.unshift({
    titulo, texto, urgente,
    data: new Date().toLocaleDateString('pt-BR'),
    autor: 'Mariana R.'
  });
  alert(`✅ Comunicado criado!\nPublicado automaticamente no Feed.`);
  publicarNoFeedClima(titulo, `📢 ${titulo}\n\n${texto}\n\nEquipe hi Conecta RH`);
  document.getElementById('clima-content').innerHTML = renderClimaComunicados();
}

function publicarComunicadoNoFeed(i) {
  const c = climaData.comunicados[i];
  publicarNoFeedClima(c.titulo, `📢 ${c.titulo}\n\n${c.texto}\n\nEquipe hi Conecta RH`);
  alert('✅ Publicado no Feed!');
}

function publicarNoEndomarketing(i) {
  const c = climaData.comunicados[i];
  if (typeof endoData !== 'undefined') {
    endoData.comunicados.unshift({ titulo:c.titulo, texto:c.texto, urgente:c.urgente, data:c.data });
    alert('✅ Enviado ao Endomarketing.tv!');
  } else {
    alert('✅ Comunicado sincronizado com Endomarketing.tv!');
  }
  publicarNoFeedClima(c.titulo, `📢 ${c.titulo}\n\n${c.texto}\n\nEquipe hi Conecta RH`);
}

// =============================================
// ENGAJAMENTO — DASHBOARD
// =============================================
function renderClimaEngajamento() {
  const meses = ['Jan','Fev','Mar','Abr','Mai'];
  const dados  = [18,22,20,27,30];
  const maxVal = Math.max(...dados);

  return `
  <div style="display:flex;flex-direction:column;gap:20px">

    <div class="depto-cards">
      <div class="depto-card">
        <div class="depto-card-icon">📝</div>
        <div class="depto-card-info"><strong>${climaData.posts.length}</strong><span>Publicações</span></div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">❤️</div>
        <div class="depto-card-info">
          <strong>${climaData.posts.reduce((a,p)=>a+Object.values(p.reacoes).reduce((x,y)=>x+y,0),0)}</strong>
          <span>Reações totais</span>
        </div>
      </div>
      <div class="depto-card">
        <div class="depto-card-icon">💬</div>
        <div class="depto-card-info">
          <strong>${climaData.posts.reduce((a,p)=>a+p.comentarios.length,0)}</strong>
          <span>Comentários</span>
        </div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">📊</div>
        <div class="depto-card-info"><strong>87%</strong><span>Índice de engajamento</span></div>
      </div>
    </div>

    <div class="ind-grid">
      <div class="depto-section">
        <div class="section-header">
          <h3>📈 Engajamento Mensal</h3>
          <span class="mes-badge">2025</span>
        </div>
        <div class="bar-chart" style="height:180px">
          ${dados.map((v,i)=>`
            <div class="bar-item">
              <div class="bar-wrap">
                <div class="bar-fill" style="height:${(v/maxVal)*100}%"></div>
              </div>
              <span class="bar-val">${v}</span>
              <span class="bar-label">${meses[i]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="depto-section">
        <div class="section-header"><h3>🏆 Posts Mais Curtidos</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${[...climaData.posts]
            .sort((a,b)=>Object.values(b.reacoes).reduce((x,y)=>x+y,0)-Object.values(a.reacoes).reduce((x,y)=>x+y,0))
            .slice(0,3)
            .map((p,i)=>`
              <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:var(--bg)">
                <span style="font-size:18px;font-weight:800;color:var(--primary)">${i+1}º</span>
                <div style="flex:1">
                  <p style="font-size:12px;font-weight:600;margin-bottom:2px">${p.texto.substring(0,60)}...</p>
                  <small style="color:var(--text-muted)">${p.autor} · ${Object.values(p.reacoes).reduce((x,y)=>x+y,0)} reações</small>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    </div>

    <div class="depto-section">
      <div class="section-header"><h3>😊 Pesquisa de Clima Rápida</h3></div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Como você avalia o clima da empresa hoje?</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        ${['😞 Ruim','😐 Regular','🙂 Bom','😊 Ótimo','🤩 Excelente'].map((op,i)=>`
          <button class="nota-btn" onclick="votarClima(this,'${op}')">${op}</button>
        `).join('')}
      </div>
      <div id="clima-resultado" style="display:none;padding:12px;background:var(--success-light);border-radius:8px;color:var(--success);font-weight:600;font-size:13px"></div>
    </div>

  </div>`;
}

function votarClima(btn, opcao) {
  document.querySelectorAll('.nota-btn').forEach(b=>b.classList.remove('ativa'));
  btn.classList.add('ativa');
  const res = document.getElementById('clima-resultado');
  res.style.display = 'block';
  res.textContent = `✅ Obrigado pelo feedback! Você avaliou o clima como: ${opcao}`;
} 