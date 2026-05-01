// =============================================
// ENDOMARKETING.TV — REDESIGN LEVEL HARD
// Canal de TV corporativo interno
// =============================================

const endoData = {
  acoes: [],
  comunicados: [
    { titulo:'Juntos somos mais fortes!', texto:'Essa é a força que nos move todos os dias.', urgente:true,  data:'24/05/2025' },
    { titulo:'Reunião de líderes',        texto:'Segunda-feira às 09h00. Presença obrigatória.',urgente:false, data:'26/05/2025' },
    { titulo:'Nova política de HO',       texto:'Home office 2 dias/semana aprovado a partir de junho.',urgente:false,data:'23/05/2025'},
  ],
  aniversariantes: [
    { nome:'Ana Paula Souza', dia:'25/05', avatar:'AS', setor:'RH'         },
    { nome:'Carlos Eduardo',  dia:'26/05', avatar:'CE', setor:'Comercial'  },
    { nome:'Mariana Lima',    dia:'27/05', avatar:'ML', setor:'Financeiro' },
    { nome:'Roberto Alves',   dia:'30/05', avatar:'RA', setor:'TI'         },
  ],
  paoDiario: [
    { versiculo:'"O Senhor é o meu pastor; nada me faltará."', ref:'Salmos 23:1', reflexao:'Confie mais no processo de hoje e descubra o cuidado de Deus em cada detalhe.' },
  ],
  dicaBemEstar: [
    'Que tal uma caminhada ao ar livre hoje? Pequenas escolhas, grandes mudanças!',
    'Beba água regularmente. Seu corpo agradece!',
    'Respire fundo. Um minuto de pausa pode mudar seu dia.',
    'Uma postura correta evita dores. Ajuste sua cadeira agora!',
    'Elogie um colega hoje. Gratidão transforma ambientes!',
  ],
  agendaCultural: [
    { dia:'SEX', data:'24/05', tipo:'SHOW',      titulo:'Nando Reis',             local:'Teatro Pedra do Reino',  hora:'21h00', cor:'#7c3aed', foto:'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80' },
    { dia:'SÁB', data:'25/05', tipo:'FESTIVAL',  titulo:'Festival Paraíba Junina',local:'Centro Histórico',       hora:'16h00', cor:'#16a34a', foto:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80' },
    { dia:'DOM', data:'26/05', tipo:'MÚSICA',    titulo:'Domingo no Parque',      local:'Parque Solon de Lucena', hora:'17h00', cor:'#2563eb', foto:'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80' },
    { dia:'QUI', data:'30/05', tipo:'TEATRO',    titulo:'O Auto da Compadecida',  local:'Teatro Santa Roza',      hora:'20h00', cor:'#dc2626', foto:'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80' },
  ],
  noticias: [
    { emoji:'🇧🇷⚽', cat:'COPA 2026',          titulo:'Brasil anuncia os 26 convocados para a Copa do Mundo 2026',              desc:'Dorival Júnior confirmou a lista com surpresas: Endrick é titular e Vini Jr. lidera o ataque. A seleção enfrenta Espanha, Japão e Marrocos na fase de grupos.',                                                  tempo:'2h'  },
    { emoji:'🏆',   cat:'COPA 2026',          titulo:'FIFA divulga tabela: Brasil estreia dia 15/06 em Los Angeles',           desc:'O sorteio realizado em Miami definiu o caminho da seleção. As partidas serão no SoFi Stadium, com capacidade para 70 mil torcedores e transmissão ao vivo pela Globo.',                              tempo:'5h'  },
    { emoji:'🏀',   cat:'NBA PLAYOFFS',       titulo:'OKC Thunder elimina Denver e avança à final do Oeste',                  desc:'Shai Gilgeous-Alexander anotou 38 pontos no jogo 6. OKC aguarda o vencedor da série Warriors x Timberwolves para disputar a final da Conferência Oeste.',                                             tempo:'3h'  },
    { emoji:'🔴⚫', cat:'BRASILEIRÃO',        titulo:'Flamengo vence clássico e abre 5 pontos na liderança',                  desc:'Com gol de Pedro nos acréscimos, o Rubro-Negro bateu o Vasco por 2×1 no Maracanã. São Paulo e Palmeiras pressionam em segundo e terceiro lugar, respectivamente.',                                    tempo:'6h'  },
    { emoji:'⚽',   cat:'CHAMPIONS LEAGUE',   titulo:'Final definida: Real Madrid × Manchester City em Wembley',              desc:'Após eliminar o Bayern na semifinal, o Real Madrid enfrenta o City no dia 30 de maio. Mbappé e Haaland são os grandes nomes desta que promete ser uma final histórica.',                              tempo:'1d'  },
    { emoji:'🎾',   cat:'ROLAND GARROS',      titulo:'Alcaraz chega como favorito ao Roland Garros 2026',                    desc:'O espanhol Carlos Alcaraz defende o título a partir do dia 26 de maio. No feminino, Iga Swiatek busca seu quinto título em Paris contra a ascendente Mirra Andreeva.',                            tempo:'8h'  },
    { emoji:'🏎️',   cat:'FÓRMULA 1',          titulo:'Verstappen lidera o campeonato com 34 pts de vantagem após GP Miami',   desc:'A Red Bull venceu de ponta a ponta o GP de Miami. Hamilton larga segundo no próximo GP em Mônaco, marcado para o dia 25 de maio, com transmissão na Band e F1TV.',                                    tempo:'12h' },
    { emoji:'🥊',   cat:'BOXE',               titulo:'Canelo × Benavidez: duelo pelo cinturão unificado neste sábado',        desc:'Canelo Álvarez enfrenta David Benavidez no T-Mobile Arena, em Las Vegas. A luta começa às 22h pelo horário de Brasília, com transmissão pelo DAZN e ESPN.',                                          tempo:'4h'  },
    { emoji:'🇧🇷🥇', cat:'PAN-AMERICANO',      titulo:'Brasil lidera quadro de medalhas no Pan-Americano Júnior 2026',         desc:'Com 18 ouros e 32 medalhas no total, o Brasil supera EUA e Cuba na classificação geral. Destaques nas modalidades de natação, judô e atletismo.',                                                       tempo:'1d'  },
    { emoji:'📊',   cat:'ESPORTES & NEGÓCIOS', titulo:'Clubes brasileiros batem recorde histórico: R$ 12 bilhões em receitas', desc:'Relatório da Deloitte aponta crescimento de 28% nas receitas dos clubes da Série A em 2025. Flamengo lidera com R$ 1,4 bi, seguido por Palmeiras e Corinthians.',                                tempo:'2d'  },
  ],
  datas: [
    { data:'01/01', titulo:'🎆 Ano Novo',          categoria:'feriado',      publicado:true  },
    { data:'08/03', titulo:'👩 Dia da Mulher',      categoria:'comemorativa', publicado:false },
    { data:'01/05', titulo:'👷 Dia do Trabalho',    categoria:'feriado',      publicado:true  },
    { data:'12/06', titulo:'💝 Dia dos Namorados',  categoria:'comemorativa', publicado:false },
    { data:'07/09', titulo:'🇧🇷 Independência',     categoria:'feriado',      publicado:false },
    { data:'10/10', titulo:'🧠 Saúde Mental',       categoria:'rh',           publicado:false },
    { data:'25/12', titulo:'🎄 Natal',              categoria:'feriado',      publicado:false },
  ],
  sistemas: [
    { nome:'Caju',       descricao:'Benefícios',          logo:'https://logo.clearbit.com/caju.com.br',        fallback:'🟠', cor:'#ff6b00', link:'https://app.caju.com.br'     },
    { nome:'Bitrix24',   descricao:'CRM & Colaboração',   logo:'https://logo.clearbit.com/bitrix24.com',       fallback:'🔵', cor:'#2563eb', link:'https://bitrix24.com'        },
    { nome:'SulAmérica', descricao:'Plano de Saúde',      logo:'https://logo.clearbit.com/sulamerica.com.br',  fallback:'❤️', cor:'#dc2626', link:'https://sulamerica.com.br'   },
    { nome:'Connexa',    descricao:'Telemedicina',         logo:'https://logo.clearbit.com/conexasaude.com.br', fallback:'💚', cor:'#16a34a', link:'https://conexasaude.com.br'  },
    { nome:'RHID',       descricao:'Ponto Eletrônico',     logo:null,                                           fallback:'👥', cor:'#1e3a5f', link:'https://rhid.com.br'         },
    { nome:'Wellhub',    descricao:'Fitness',              logo:'https://logo.clearbit.com/wellhub.com',        fallback:'💪', cor:'#16a34a', link:'https://wellhub.com'         },
  ],
  cotacoes: [
    { nome:'Dólar',   valor:'R$ 5,15', var:'+0,73%', up:true  },
    { nome:'Euro',    valor:'R$ 5,62', var:'-0,12%', up:false },
    { nome:'Bitcoin', valor:'R$ 318k', var:'+2,10%', up:true  },
    { nome:'Selic',   valor:'10,50%',  var:'stable', up:null  },
  ],
  ticker: [
    '📢 Reunião de líderes — segunda-feira 09h00',
    '🎂 Aniversariantes do mês: Ana Paula, Carlos Eduardo, Mariana Lima e Roberto Alves!',
    '✅ Nova política de Home Office aprovada — 2 dias/semana a partir de junho',
    '🏆 Colaborador Destaque Maio: João Silva — Comercial',
    '💰 Holerite de Maio disponível no RHsolutio',
    '⚽ Copa do Mundo 2026 — Brasil na corrida!',
    '🧠 10/10 — Dia Mundial da Saúde Mental. Cuide-se!',
    '📋 Treinamento NR-01 obrigatório — prazo: 30/06',
    '🎓 Novos cursos disponíveis na plataforma de T&D',
    '🌟 Canal hi Conecta RH — Conectando pessoas, inspirando resultados',
  ],
  colaboradorDestaque: {
    nome: 'Beatriz Souza',
    dept: 'Comercial',
    motivo: 'Pelo excelente desempenho e dedicação em abril!',
    avatar: 'BS',
    foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80',
  },
  dicaCulinaria: {
    titulo: 'Wrap de Frango',
    subtitulo: 'Rápido e saudável!',
    tempo: 'Pronto em 15 minutos',
    foto: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
  },
  voceSabia: [
    'Empresas que investem em pessoas são 23% mais lucrativas.',
    'Colaboradores felizes são 31% mais produtivos.',
    '70% dos profissionais valorizam o ambiente de trabalho acima do salário.',
    'Times com diversidade tomam decisões melhores 87% das vezes.',
  ],
  momentoLeve: [
    { titulo: 'Café e foco: a combinação perfeita! ☕', foto: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { titulo: 'Uma boa música transforma o seu dia! 🎵', foto: null },
    { titulo: 'Sorria! Isso é contagiante. 😄', foto: null },
  ],
  indicadores: [
    { nome: 'Meta do Mês', atual: 78, meta: 100, cor: '#22c55e' },
  ],
  dicaDia: {
    titulo: 'Organize seu dia na noite anterior',
    desc: 'Pequenas ações hoje, grandes conquistas amanhã.',
  },
};

// Estado global do player
const endoTV = {
  canal:        'streaming',
  slideIndex:   0,
  autoplay:     true,
  fullscreen:   false,
  breakingNews: null,
  intervals:    [],
  eventoInteresses: {},
};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL — TV BROADCAST
// ─────────────────────────────────────────────
function renderEndomarketing() {
  const agora    = new Date();
  const horaFmt  = agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const diasem   = agora.toLocaleDateString('pt-BR', { weekday:'long' });
  const dataFmt  = agora.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  return `
  <div class="tv-root" id="tv-root">

    <!-- ═══════════════ TOPBAR DA TV ═══════════════ -->
    <div class="tv-topbar">
      <!-- Logo / Brand -->
      <div class="tv-brand">
        <div class="tv-live-badge">
          <span class="tv-live-dot"></span>LIVE
        </div>
        <div class="tv-logo">
          <span style="color:#60a5fa;font-weight:900">hi</span><span style="color:white">.tv</span>
        </div>
        <div class="tv-slogan">Canal Interno — hi Conecta RH</div>
      </div>

      <!-- Canais / Tabs -->
      <nav class="tv-canais">
        <button class="tv-canal-btn" data-canal="home"            onclick="tvMudarCanal(this,'home')">🏠 INÍCIO</button>
        <button class="tv-canal-btn" data-canal="comunicados"      onclick="tvMudarCanal(this,'comunicados')">📢 COMUNICADOS</button>
        <button class="tv-canal-btn" data-canal="aniversarios"     onclick="tvMudarCanal(this,'aniversarios')">🎂 ANIVERSARIANTES</button>
        <button class="tv-canal-btn" data-canal="beneficios"       onclick="tvMudarCanal(this,'beneficios')">💳 BENEFÍCIOS</button>
        <button class="tv-canal-btn" data-canal="agenda"           onclick="tvMudarCanal(this,'agenda')">📅 AGENDA</button>
        <button class="tv-canal-btn" data-canal="noticias"         onclick="tvMudarCanal(this,'noticias')">⚽ NOTÍCIAS</button>
        <button class="tv-canal-btn" data-canal="sistemas"         onclick="tvMudarCanal(this,'sistemas')">🔗 SISTEMAS</button>
        <button class="tv-canal-btn active" data-canal="streaming"  onclick="tvMudarCanal(this,'streaming')">🎬 STREAMING</button>
        <button class="tv-canal-btn" data-canal="slides"           onclick="tvMudarCanal(this,'slides')">📺 SLIDES</button>
        <button class="tv-canal-btn" data-canal="admin"            onclick="tvMudarCanal(this,'admin')">⚙️ ADMIN</button>
      </nav>

      <!-- Relógio + controles -->
      <div class="tv-controls-right">
        <div class="tv-clock">
          <div class="tv-clock-time" id="tv-clock-time">${horaFmt}</div>
          <div class="tv-clock-date">
            <span style="text-transform:capitalize">${diasem}</span>
            <span>${dataFmt}</span>
          </div>
          <div class="tv-clima">☀️ 29°C — João Pessoa</div>
        </div>
        <div class="tv-action-btns">
          <button class="tv-action-btn" title="Auto-play" id="tv-autoplay-btn" onclick="tvToggleAutoplay()">▶</button>
          <button class="tv-action-btn" title="Tela cheia" onclick="tvFullscreen()">⛶</button>
          <button class="tv-action-btn" title="Breaking News" onclick="tvBreakingNews()">🚨</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════ BREAKING NEWS (overlay) ═══════════════ -->
    <div class="tv-breaking" id="tv-breaking" style="display:none">
      <span class="tv-breaking-tag">🚨 BREAKING NEWS</span>
      <span class="tv-breaking-text" id="tv-breaking-text"></span>
      <button onclick="tvFecharBreaking()" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;flex-shrink:0">✕</button>
    </div>

    <!-- ═══════════════ CONTEÚDO PRINCIPAL ═══════════════ -->
    <div class="tv-body" id="tv-body">
      ${tvRenderCanal('streaming')}
    </div>

    <!-- ═══════════════ TICKER DE NOTÍCIAS ═══════════════ -->
    <div class="tv-ticker-wrap">
      <div class="tv-ticker-label">📡 HI.TV</div>
      <div class="tv-ticker-track">
        <div class="tv-ticker-content" id="tv-ticker-content">
          ${endoData.ticker.map(t => `<span class="tv-ticker-item">${t}</span>`).join('<span class="tv-ticker-sep">◆</span>')}
          ${endoData.ticker.map(t => `<span class="tv-ticker-item">${t}</span>`).join('<span class="tv-ticker-sep">◆</span>')}
        </div>
      </div>
    </div>

  </div><!-- /tv-root -->`;
}

function initPage_endomarketing() {
  tvIniciarRelogio();
  if (endoTV.autoplay) tvIniciarAutoplay();
}

// ─────────────────────────────────────────────
// ROTEADOR DE CANAIS
// ─────────────────────────────────────────────
function tvMudarCanal(btn, canal) {
  endoTV.canal = canal;
  document.querySelectorAll('.tv-canal-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const body = document.getElementById('tv-body');
  if (!body) return;
  body.style.opacity = '0';
  body.style.transform = 'translateY(10px)';
  setTimeout(() => {
    body.innerHTML = tvRenderCanal(canal);
    body.style.transition = 'opacity .3s, transform .3s';
    body.style.opacity = '1';
    body.style.transform = 'translateY(0)';
  }, 200);
}

function tvRenderCanal(canal) {
  if (canal === 'home')        return tvCanal_Home();
  if (canal === 'comunicados') return tvCanal_Comunicados();
  if (canal === 'aniversarios')return tvCanal_Aniversarios();
  if (canal === 'beneficios')  return tvCanal_Beneficios();
  if (canal === 'agenda')      return tvCanal_Agenda();
  if (canal === 'noticias')    return tvCanal_Noticias();
  if (canal === 'sistemas')    return tvCanal_Sistemas();
  if (canal === 'streaming')   return tvCanal_Netflix();
  if (canal === 'slides')      return tvCanal_TVSlides();
  if (canal === 'admin')       return tvCanal_Admin();
  return '';
}

// ─────────────────────────────────────────────
// CANAL: HOME — Layout 3 colunas
// ─────────────────────────────────────────────
function tvCanal_Home() {
  const com   = endoData.comunicados[0];
  const pao   = endoData.paoDiario[0];
  const dica  = endoData.dicaBemEstar[Math.floor(Math.random() * endoData.dicaBemEstar.length)];
  const agenda = endoData.agendaCultural[0];

  return `
  <div class="tv-home-grid">

    <!-- ── COLUNA ESQUERDA ── -->
    <div class="tv-col tv-col-left">

      <!-- COMUNICADO HERO -->
      <div class="tv-card tv-hero-comunicado">
        <div class="tv-com-tag">
          <span class="tv-com-urgente">📢 COMUNICADO</span>
          <span class="tv-com-data">${com.data}</span>
        </div>
        <h2 class="tv-hero-titulo">${com.titulo}</h2>
        <p class="tv-hero-texto">${com.texto}</p>
        <button class="tv-btn-outline" onclick="tvMudarCanal(null,'comunicados')">Ver todos →</button>
      </div>

      <!-- AGENDA DESTAQUE -->
      <div class="tv-card tv-agenda-destaque" style="position:relative;overflow:hidden;min-height:200px">
        <img src="${agenda.foto}" alt="${agenda.titulo}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.35"
          onerror="this.style.display='none'" />
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span class="tv-agenda-tipo" style="background:${agenda.cor}">${agenda.tipo}</span>
            <span style="font-size:12px;opacity:.75">${agenda.dia} · ${agenda.data}</span>
          </div>
          <h3 style="font-size:20px;font-weight:900;margin-bottom:4px">${agenda.titulo}</h3>
          <p style="font-size:13px;opacity:.75">📍 ${agenda.local} &nbsp;·&nbsp; 🕐 ${agenda.hora}</p>
          <button class="tv-btn-outline" style="margin-top:10px" onclick="tvMudarCanal(null,'agenda')">Ver agenda completa →</button>
        </div>
      </div>

    </div>

    <!-- ── COLUNA CENTRAL ── -->
    <div class="tv-col tv-col-center">

      <!-- SPOTLIGHT ROTATIVO (últimas notícias) -->
      <div class="tv-card tv-spotlight" id="tv-spotlight">
        ${tvSpotlightContent(0)}
      </div>

      <!-- COTAÇÕES -->
      <div class="tv-card tv-cotacoes-row">
        <div class="tv-cotacoes-header">📈 MERCADO</div>
        <div class="tv-cotacoes-list">
          ${endoData.cotacoes.map(c=>`
            <div class="tv-cotacao-item">
              <span class="tv-cotacao-nome">${c.nome}</span>
              <span class="tv-cotacao-val">${c.valor}</span>
              <span class="tv-cotacao-var ${c.up===true?'up':c.up===false?'down':'flat'}">
                ${c.up===true?'▲':c.up===false?'▼':'–'} ${c.var}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- ── COLUNA DIREITA ── -->
    <div class="tv-col tv-col-right">

      <!-- ANIVERSARIANTES -->
      <div class="tv-card">
        <div class="tv-card-header">🎂 ANIVERSARIANTES</div>
        <div class="tv-aniv-lista">
          ${endoData.aniversariantes.map(a=>`
            <div class="tv-aniv-item">
              <div class="tv-aniv-avatar">${a.avatar}</div>
              <div class="tv-aniv-info">
                <strong>${a.nome}</strong>
                <span>${a.setor}</span>
              </div>
              <span class="tv-aniv-dia">${a.dia}</span>
            </div>
          `).join('')}
        </div>
        <button class="tv-btn-outline" style="margin-top:8px;width:100%" onclick="tvMudarCanal(null,'aniversarios')">Ver todos →</button>
      </div>

      <!-- PÃO DIÁRIO -->
      <div class="tv-card tv-pao-card">
        <div class="tv-card-header" style="color:#fbbf24">📖 PÃO DIÁRIO</div>
        <p class="tv-pao-versiculo">${pao.versiculo}</p>
        <span class="tv-pao-ref">${pao.ref}</span>
        <p class="tv-pao-reflexao">${pao.reflexao}</p>
      </div>

      <!-- DICA DE BEM-ESTAR -->
      <div class="tv-card tv-dica-card">
        <div class="tv-card-header" style="color:#93c5fd">💙 DICA DE BEM-ESTAR</div>
        <p style="font-size:13px;color:#bfdbfe;line-height:1.6">${dica}</p>
        <div style="font-size:32px;margin-top:8px;text-align:center">🌟</div>
      </div>

      <!-- SISTEMAS RÁPIDO -->
      <div class="tv-card">
        <div class="tv-card-header">🔗 SISTEMAS</div>
        <div class="tv-sistemas-mini">
          ${endoData.sistemas.map(s=>`
            <a href="${s.link}" target="_blank" class="tv-sis-logo" title="${s.nome}" style="border-color:${s.cor}30">
              ${s.logo
                ? `<img src="${s.logo}" alt="${s.nome}" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
                : ''
              }
              <span style="display:${s.logo?'none':'flex'};font-size:20px;align-items:center;justify-content:center">${s.fallback}</span>
            </a>
          `).join('')}
        </div>
      </div>

    </div>

  </div><!-- /tv-home-grid -->`;
}

function tvSpotlightContent(idx) {
  const items = [
    ...endoData.comunicados.map(c=>({ titulo:c.titulo, sub:c.texto,          icon:'📢', cor:'#3b82f6' })),
    ...endoData.noticias.slice(0,2).map(n=>({ titulo:n.titulo, sub:n.cat,    icon:n.emoji, cor:'#7c3aed' })),
  ];
  const item = items[idx % items.length];
  return `
  <div class="tv-spotlight-inner">
    <div class="tv-spotlight-icon">${item.icon}</div>
    <div>
      <div class="tv-spotlight-cat" style="color:${item.cor}">${item.sub}</div>
      <h3 class="tv-spotlight-titulo">${item.titulo}</h3>
    </div>
  </div>
  <div class="tv-spotlight-dots">
    ${items.map((_,i)=>`<span class="tv-dot ${i===idx%items.length?'ativo':''}"></span>`).join('')}
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: COMUNICADOS
// ─────────────────────────────────────────────
function tvCanal_Comunicados() {
  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header">
      <h2>📢 Comunicados Internos</h2>
      <button class="tv-btn-primary" onclick="tvNovoComunicado()">+ Novo Comunicado</button>
    </div>
    <div class="tv-comunicados-grid">
      ${endoData.comunicados.map((c,i)=>`
        <div class="tv-comunicado-card ${c.urgente?'urgente':''}">
          <div class="tv-com-card-header">
            ${c.urgente?'<span class="tv-urgente-badge">🔴 URGENTE</span>':''}
            <span class="tv-com-card-data">${c.data}</span>
          </div>
          <h3 class="tv-com-card-titulo">${c.titulo}</h3>
          <p class="tv-com-card-texto">${c.texto}</p>
          <div class="tv-com-card-actions">
            <button class="tv-btn-outline" onclick="tvPublicarFeed(${i})">📢 Publicar no Feed</button>
            <button class="tv-btn-outline" onclick="tvEditarComunicado(${i})">✏️ Editar</button>
          </div>
        </div>
      `).join('')}

      <!-- Card de novo comunicado -->
      <div class="tv-comunicado-card novo-card" onclick="tvNovoComunicado()">
        <div style="font-size:40px;margin-bottom:12px">✏️</div>
        <h3>Criar Comunicado</h3>
        <p>Clique para publicar um novo comunicado para toda a equipe</p>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: ANIVERSARIANTES
// ─────────────────────────────────────────────
function tvCanal_Aniversarios() {
  const hoje = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}).slice(0,5);
  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header">
      <h2>🎂 Aniversariantes do Mês</h2>
      <button class="tv-btn-primary" onclick="tvPublicarAnivFeed()">📢 Publicar no Feed</button>
    </div>
    <div class="tv-aniv-grid">
      ${endoData.aniversariantes.map(a=>`
        <div class="tv-aniv-card-full ${a.dia === hoje ? 'hoje' : ''}">
          ${a.dia === hoje ? '<div class="tv-aniv-hoje-badge">🎉 Hoje!</div>' : ''}
          <div class="tv-aniv-card-avatar">${a.avatar}</div>
          <div class="tv-aniv-confetti">🎊</div>
          <h3>${a.nome}</h3>
          <span class="tv-aniv-setor">${a.setor}</span>
          <div class="tv-aniv-data">📅 ${a.dia}</div>
          <div class="tv-aniv-btns">
            <button class="tv-btn-primary" onclick="tvParabenizar('${a.nome}')">🎉 Parabenizar</button>
            <button class="tv-btn-outline" onclick="tvPublicarAnivIndividual('${a.nome}')">📢 Publicar</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: BENEFÍCIOS
// ─────────────────────────────────────────────
function tvCanal_Beneficios() {
  const bens = [
    { icon:'🍽️', nome:'Alimentação (Caju)',      val:'R$ 550/mês',         link:'https://app.caju.com.br',     cor:'#ff6b00', rec:'Todo dia 1º', uso:'Supermercados e restaurantes'   },
    { icon:'❤️', nome:'Plano de Saúde',           val:'Cobertura nacional',  link:'https://sulamerica.com.br',   cor:'#dc2626', rec:'Mensal',       uso:'Hospitais credenciados'         },
    { icon:'🏥', nome:'Telemedicina (Conexa)',    val:'Sem custo adicional', link:'https://conexasaude.com.br',  cor:'#2563eb', rec:'Imediato',      uso:'App ou site — 24h'              },
    { icon:'🚌', nome:'Mobilidade (Caju ou VT)',  val:'R$ 200/mês',         link:'https://app.caju.com.br',     cor:'#d97706', rec:'Todo dia 1º',   uso:'Transporte público'             },
    { icon:'💪', nome:'Wellhub (Gympass)',         val:'Plano Silver',       link:'https://wellhub.com',         cor:'#16a34a', rec:'Ativação única', uso:'50.000+ academias'            },
    { icon:'🦷', nome:'Odontológico (SulAmérica)',val:'Desconto em folha',   link:'https://sulamerica.com.br',   cor:'#7c3aed', rec:'Mensal',         uso:'Dentistas credenciados'        },
  ];

  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header"><h2>💳 Benefícios da Empresa</h2></div>
    <div class="tv-bens-grid">
      ${bens.map((b,i)=>`
        <div class="tv-ben-card" style="border-top:3px solid ${b.cor}">
          <div class="tv-ben-icon" style="background:${b.cor}18;color:${b.cor}">${b.icon}</div>
          <h3 class="tv-ben-nome">${b.nome}</h3>
          <div class="tv-ben-val">${b.val}</div>
          <div class="tv-ben-meta">
            <span>🔄 ${b.rec}</span>
            <span>📍 ${b.uso}</span>
          </div>
          <button class="tv-ben-como" id="tv-como-${i}" onclick="tvToggleBen(${i},this)">ℹ Como usar ▾</button>
          <div class="tv-ben-como-box" id="tv-como-box-${i}" style="display:none">
            Acesse via <strong>${b.nome.split('(')[0].trim()}</strong> com seu e-mail corporativo.
            Dúvidas? Fale com o RH via Serviços RH.
          </div>
          <a href="${b.link}" target="_blank" class="tv-btn-primary" style="text-decoration:none;text-align:center;display:block;margin-top:8px">Acessar ↗</a>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: AGENDA CULTURAL
// ─────────────────────────────────────────────
function tvCanal_Agenda() {
  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header">
      <h2>📅 Agenda Cultural — João Pessoa</h2>
      <button class="tv-btn-outline" onclick="tvIndicarEvento()">+ Indicar Evento</button>
    </div>
    <div class="tv-agenda-grid">
      ${endoData.agendaCultural.map((e,i)=>`
        <div class="tv-agenda-card">
          <div class="tv-agenda-foto" style="position:relative;height:160px;overflow:hidden;border-radius:12px 12px 0 0">
            <img src="${e.foto}" alt="${e.titulo}"
              style="width:100%;height:100%;object-fit:cover"
              onerror="this.parentElement.style.background='${e.cor}33'" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent)"></div>
            <span class="tv-agenda-tipo-badge" style="background:${e.cor}">${e.tipo}</span>
            <div class="tv-agenda-dia-badge">${e.dia} · ${e.data}</div>
          </div>
          <div class="tv-agenda-info">
            <h3>${e.titulo}</h3>
            <div class="tv-agenda-meta">
              <span>📍 ${e.local}</span>
              <span>🕐 ${e.hora}</span>
            </div>
            <button class="tv-btn-interesse ${endoTV.eventoInteresses[e.titulo]?'ativo':''}"
              onclick="tvMarcarInteresse('${e.titulo}',this)">
              ${endoTV.eventoInteresses[e.titulo]?'❤️ Tenho interesse':'🤍 Tenho interesse'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: NOTÍCIAS
// ─────────────────────────────────────────────
function tvCanal_Noticias() {
  const d = endoData.noticias[0];
  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header">
      <h2>📰 Notícias</h2>
      <span style="color:rgba(255,255,255,.5);font-size:12px">${endoData.noticias.length} notícias · atualizado agora</span>
    </div>
    <div class="tv-noticias-layout">
      <!-- Destaque -->
      <div class="tv-noticia-destaque">
        <div style="font-size:52px;margin-bottom:14px;line-height:1">${d.emoji}</div>
        <span class="tv-noticia-cat-badge">${d.cat}</span>
        <h2 style="font-size:21px;font-weight:900;margin:12px 0 10px;color:white;line-height:1.3">${d.titulo}</h2>
        <p style="font-size:14px;color:rgba(255,255,255,.7);line-height:1.6;margin:0 0 16px">${d.desc}</p>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:6px;height:6px;background:#3b82f6;border-radius:50%;display:inline-block"></span>
          <small style="color:rgba(255,255,255,.45);font-size:11px">${d.tempo} atrás</small>
        </div>
      </div>
      <!-- Lista -->
      <div class="tv-noticias-lista">
        ${endoData.noticias.slice(1).map(n=>`
          <div class="tv-noticia-item">
            <span style="font-size:22px;flex-shrink:0;margin-top:2px">${n.emoji}</span>
            <div style="flex:1;min-width:0">
              <span class="tv-noticia-cat-badge" style="font-size:9px">${n.cat}</span>
              <p style="font-size:13px;color:white;margin:5px 0 4px;font-weight:700;line-height:1.35">${n.titulo}</p>
              <p style="font-size:11px;color:rgba(255,255,255,.5);margin:0 0 5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${n.desc}</p>
              <small style="color:rgba(255,255,255,.35);font-size:10px">${n.tempo} atrás</small>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: SISTEMAS
// ─────────────────────────────────────────────
function tvCanal_Sistemas() {
  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header"><h2>🔗 Sistemas & Ferramentas</h2><span style="color:rgba(255,255,255,.6);font-size:13px">Todos os sistemas estão ativos</span></div>
    <div class="tv-sistemas-grid">
      ${endoData.sistemas.map(s=>`
        <a href="${s.link}" target="_blank" class="tv-sis-card" style="border-top:3px solid ${s.cor};text-decoration:none">
          <div class="tv-sis-card-logo">
            ${s.logo
              ? `<img src="${s.logo}" alt="${s.nome}" style="width:48px;height:48px;object-fit:contain"
                   onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
              : ''
            }
            <span style="display:${s.logo?'none':'flex'};font-size:28px;align-items:center;justify-content:center">${s.fallback}</span>
          </div>
          <h3 class="tv-sis-nome">${s.nome}</h3>
          <p class="tv-sis-desc">${s.descricao}</p>
          <span class="tv-sis-status">● Ativo</span>
        </a>
      `).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: STREAMING — Dashboard Corporativo
// ─────────────────────────────────────────────
function tvCanal_Netflix() {
  const com   = endoData.comunicados[0];
  const pao   = endoData.paoDiario[0];
  const dica  = endoData.dicaDia;
  const anivs = endoData.aniversariantes.slice(0, 3);
  const colab = endoData.colaboradorDestaque;
  const cul   = endoData.dicaCulinaria;
  const agenda= endoData.agendaCultural[0];
  const vs    = endoData.voceSabia[Math.floor(Math.random() * endoData.voceSabia.length)];
  const bem   = endoData.dicaBemEstar[Math.floor(Math.random() * endoData.dicaBemEstar.length)];
  const leve  = endoData.momentoLeve[Math.floor(Math.random() * endoData.momentoLeve.length)];
  const ind   = endoData.indicadores[0];

  const r = 30, circ = +(2 * Math.PI * r).toFixed(1);
  const dash = +((circ * ind.atual) / ind.meta).toFixed(1);

  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const [day, mon] = (com.data || '31/05').split('/');
  const monthName  = meses[(parseInt(mon, 10) - 1)] || '';

  const photoCard = (foto, cls, content) =>
    `<div class="tv-sc ${cls}" style="position:relative;overflow:hidden">
       ${foto ? `<div class="tv-sc-fotobg" style="background-image:url('${foto}')"></div>` : ''}
       <div class="tv-sc-content">${content}</div>
     </div>`;

  return `
  <div class="tv-stream-root">

    <!-- ══ DESTAQUES ══ -->
    <div>
      <p class="tv-stream-section-title">Destaques</p>
      <div class="tv-stream-destaques">

        <!-- COMUNICADO -->
        <div class="tv-sc tv-sc-purple">
          <span class="tv-sc-label">Comunicado</span>
          <h3 class="tv-sc-title">${com.titulo}</h3>
          <p class="tv-sc-sub">${com.texto}</p>
          <div style="margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between">
            <div>
              <div class="tv-sc-date">${day}</div>
              <div class="tv-sc-month">${monthName}</div>
            </div>
            <span style="font-size:38px;opacity:.28;line-height:1">📣</span>
          </div>
        </div>

        <!-- ANIVERSARIANTES -->
        <div class="tv-sc tv-sc-dark">
          <span class="tv-sc-label">Aniversariantes</span>
          <p class="tv-sc-title" style="font-size:15px">Parabéns! 🎉</p>
          <p class="tv-sc-sub" style="margin-bottom:6px">Feliz aniversário!</p>
          ${anivs.map(a => `
            <div class="tv-sc-aniv-item">
              <div class="tv-sc-aniv-avatar">${a.avatar}</div>
              <span>${a.nome}</span>
            </div>`).join('')}
        </div>

        <!-- PÃO DIÁRIO -->
        <div class="tv-sc tv-sc-amber">
          <span class="tv-sc-label">Pão Diário</span>
          <span style="font-size:32px;line-height:.8;font-weight:900;color:rgba(255,255,255,.4)">"</span>
          <p class="tv-sc-title" style="font-size:13px;font-weight:700;font-style:italic;line-height:1.55">
            ${pao.versiculo.replace(/^["""]/,'').replace(/["""]$/,'')}
          </p>
          <p class="tv-sc-sub" style="font-size:10px;opacity:.55;margin-top:auto">${pao.ref}</p>
        </div>

        <!-- DICA DO DIA -->
        <div class="tv-sc tv-sc-blue">
          <span class="tv-sc-label">Dica do Dia</span>
          <h3 class="tv-sc-title">${dica.titulo}</h3>
          <p class="tv-sc-sub">${dica.desc}</p>
          <div style="margin-top:auto;text-align:right;font-size:30px;opacity:.25">✅</div>
        </div>

        <!-- INDICADORES -->
        <div class="tv-sc tv-sc-navy" style="align-items:center;justify-content:center;text-align:center;gap:8px">
          <span class="tv-sc-label">Indicadores</span>
          <p class="tv-sc-sub" style="font-size:11px">Meta do mês</p>
          <div class="tv-sc-progress-ring">
            <svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg)">
              <circle cx="36" cy="36" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="6"/>
              <circle cx="36" cy="36" r="${r}" fill="none" stroke="${ind.cor}" stroke-width="6"
                stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>
            </svg>
            <div class="tv-sc-progress-pct">${ind.atual}%</div>
          </div>
          <div style="line-height:1.8">
            <div style="font-size:11px;color:rgba(255,255,255,.4)">Meta: ${ind.meta}%</div>
            <div style="font-size:11px;color:rgba(255,255,255,.4)">Atual: ${ind.atual}%</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══ PARA VOCÊ ══ -->
    <div>
      <p class="tv-stream-section-title">Para você</p>
      <div class="tv-stream-paravoc">

        <!-- COLABORADOR DESTAQUE -->
        <div class="tv-sc tv-sc-dark" style="flex-direction:row;gap:12px;padding:14px;align-items:stretch">
          <div class="tv-sc-colab-side">
            ${colab.foto
              ? `<img src="${colab.foto}" alt="${colab.nome}" class="tv-sc-colab-photo"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
              : ''
            }
            <div class="tv-sc-colab-avatar" style="display:${colab.foto ? 'none' : 'flex'}">${colab.avatar}</div>
          </div>
          <div class="tv-sc-content" style="gap:4px">
            <span class="tv-sc-label">Colaborador Destaque</span>
            <p class="tv-sc-title" style="font-size:14px">${colab.nome}</p>
            <p class="tv-sc-sub" style="font-size:11px">${colab.motivo}</p>
            <div style="margin-top:auto;font-size:20px">⭐</div>
          </div>
        </div>

        <!-- DICA DE CULINÁRIA -->
        ${photoCard(cul.foto, 'tv-sc-olive', `
          <span class="tv-sc-label">Dica de Culinária</span>
          <h3 class="tv-sc-title" style="font-size:15px">${cul.titulo}</h3>
          <p class="tv-sc-sub" style="font-size:11px">${cul.subtitulo}</p>
          <p class="tv-sc-sub" style="font-size:11px;margin-top:auto">${cul.tempo}</p>
        `)}

        <!-- AGENDA CULTURAL -->
        ${photoCard(agenda.foto, 'tv-sc-crimson', `
          <span class="tv-sc-label">Agenda Cultural</span>
          <h3 class="tv-sc-title" style="font-size:14px">${agenda.titulo}</h3>
          <p class="tv-sc-sub" style="font-size:11px">${agenda.dia} · ${agenda.data} às ${agenda.hora}</p>
          <p class="tv-sc-sub" style="font-size:11px">📍 ${agenda.local}</p>
        `)}

        <!-- VOCÊ SABIA? -->
        <div class="tv-sc tv-sc-navy2">
          <span class="tv-sc-label">Você Sabia?</span>
          <p class="tv-sc-title" style="font-size:13px;font-weight:700;line-height:1.55">${vs}</p>
          <div style="margin-top:auto;text-align:right;font-size:28px;opacity:.2">📈</div>
        </div>

        <!-- BEM-ESTAR -->
        <div class="tv-sc tv-sc-green">
          <span class="tv-sc-label">Bem-Estar</span>
          <h3 class="tv-sc-title" style="font-size:15px">Alongue-se!</h3>
          <p class="tv-sc-sub" style="font-size:11px;line-height:1.5">${bem}</p>
          <div style="margin-top:auto;text-align:right;font-size:26px;opacity:.3">🧘</div>
        </div>

        <!-- MOMENTO LEVE -->
        ${photoCard(leve.foto, 'tv-sc-orange', `
          <span class="tv-sc-label">Momento Leve</span>
          <h3 class="tv-sc-title" style="font-size:14px;line-height:1.4">${leve.titulo}</h3>
        `)}

      </div>
    </div>

    <!-- ══ FOOTER ══ -->
    <div class="tv-stream-footer">
      <p>Juntos fazemos <em>nossa empresa</em> acontecer.</p>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:rgba(255,255,255,.3)">Siga nossas redes</span>
        <div class="tv-stream-social">
          <a href="#" title="Instagram" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="#" title="Facebook" aria-label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" title="LinkedIn" aria-label="LinkedIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// CANAL: ADMIN — Gestão do canal
// ─────────────────────────────────────────────
function tvCanal_Admin() {
  const u = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  if (u.perfil !== 'rh') return `
    <div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:12px;color:rgba(255,255,255,.5)">
      <div style="font-size:48px">🔒</div>
      <p>Acesso restrito à equipe de RH.</p>
    </div>`;

  return `
  <div class="tv-canal-full">
    <div class="tv-canal-header"><h2>⚙️ Administração — hi.tv</h2></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">

      <!-- Novo Comunicado -->
      <div class="tv-admin-card">
        <div class="tv-admin-card-icon">📢</div>
        <h3>Criar Comunicado</h3>
        <div class="exp-form" style="margin-top:12px">
          <input type="text" id="adm-com-titulo" placeholder="Título do comunicado"
            style="border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:white;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:12px;width:100%;box-sizing:border-box;outline:none" />
          <textarea id="adm-com-texto" rows="3" placeholder="Texto..."
            style="border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:white;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:12px;width:100%;box-sizing:border-box;margin-top:8px;outline:none;resize:vertical"></textarea>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.7);margin:8px 0;cursor:pointer">
            <input type="checkbox" id="adm-com-urgente" />🔴 Marcar como urgente
          </label>
          <button class="tv-btn-primary" style="width:100%" onclick="tvAdmNovoComunicado()">✅ Publicar Agora</button>
        </div>
      </div>

      <!-- Estatísticas do canal -->
      <div class="tv-admin-card">
        <div class="tv-admin-card-icon">📊</div>
        <h3>Estatísticas do Canal</h3>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
          ${[
            { label:'Comunicados publicados', val:endoData.comunicados.length, cor:'#60a5fa' },
            { label:'Aniversariantes do mês', val:endoData.aniversariantes.length, cor:'#f472b6' },
            { label:'Eventos na agenda',      val:endoData.agendaCultural.length,  cor:'#34d399' },
            { label:'Sistemas monitorados',   val:endoData.sistemas.length,        cor:'#fb923c' },
          ].map(s=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,.06);border-radius:8px">
              <span style="font-size:12px;color:rgba(255,255,255,.7)">${s.label}</span>
              <strong style="color:${s.cor}">${s.val}</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Ticker -->
      <div class="tv-admin-card">
        <div class="tv-admin-card-icon">📡</div>
        <h3>Gerenciar Ticker</h3>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;max-height:200px;overflow-y:auto">
          ${endoData.ticker.map((t,i)=>`
            <div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border-radius:6px;padding:6px 10px">
              <span style="flex:1;font-size:11px;color:rgba(255,255,255,.7)">${t}</span>
              <button onclick="endoData.ticker.splice(${i},1);tvMudarCanal(null,'admin')" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:14px">✕</button>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <input type="text" id="adm-ticker-novo" placeholder="Nova mensagem..."
            style="flex:1;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:white;border-radius:8px;padding:6px 10px;font-family:inherit;font-size:11px;outline:none" />
          <button class="tv-btn-primary" onclick="tvAdmAddTicker()">+</button>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="tv-admin-card">
        <div class="tv-admin-card-icon">⚡</div>
        <h3>Ações Rápidas</h3>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          <button class="tv-btn-outline" onclick="tvBreakingNews()">🚨 Breaking News</button>
          <button class="tv-btn-outline" onclick="tvPublicarAnivFeed()">🎂 Publicar Aniversariantes</button>
          <button class="tv-btn-outline" onclick="navigateTo('comunicacao')">📣 Ir para Comunicação</button>
          <button class="tv-btn-outline" onclick="navigateTo('endomarketing')">🔄 Recarregar Canal</button>
        </div>
      </div>

    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// TIMER / RELÓGIO / AUTOPLAY
// ─────────────────────────────────────────────
function tvIniciarRelogio() {
  endoTV.intervals.forEach(id => clearInterval(id));
  endoTV.intervals = [];
  const id = setInterval(() => {
    const el = document.getElementById('tv-clock-time');
    if (!el) { clearInterval(id); return; }
    el.textContent = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }, 1000);
  endoTV.intervals.push(id);
}

let tvSpotlightIdx = 0;
function tvIniciarAutoplay() {
  const totalSpotlight = endoData.comunicados.length + 2;
  const id = setInterval(() => {
    if (!endoTV.autoplay) return;
    tvSpotlightIdx = (tvSpotlightIdx + 1) % totalSpotlight;
    const el = document.getElementById('tv-spotlight');
    if (!el) { clearInterval(id); return; }
    el.style.opacity = '0';
    setTimeout(() => {
      el.innerHTML = tvSpotlightContent(tvSpotlightIdx);
      el.style.transition = 'opacity .4s';
      el.style.opacity = '1';
    }, 300);
  }, 8000);
  endoTV.intervals.push(id);
}

function tvToggleAutoplay() {
  endoTV.autoplay = !endoTV.autoplay;
  const btn = document.getElementById('tv-autoplay-btn');
  if (btn) btn.textContent = endoTV.autoplay ? '▶' : '⏸';
}

function tvFullscreen() {
  const el = document.getElementById('tv-root') || document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

// ─────────────────────────────────────────────
// BREAKING NEWS
// ─────────────────────────────────────────────
function tvBreakingNews() {
  const msg = prompt('Texto do Breaking News:');
  if (!msg) return;
  const el = document.getElementById('tv-breaking');
  const txt = document.getElementById('tv-breaking-text');
  if (el && txt) { txt.textContent = msg; el.style.display = 'flex'; }
}

function tvFecharBreaking() {
  const el = document.getElementById('tv-breaking');
  if (el) el.style.display = 'none';
}

// ─────────────────────────────────────────────
// AÇÕES DOS CANAIS
// ─────────────────────────────────────────────
function tvNovoComunicado() {
  const titulo = prompt('Título do comunicado:');
  if (!titulo) return;
  const texto  = prompt('Texto:');
  if (!texto) return;
  const urgente = confirm('Marcar como urgente?');
  endoData.comunicados.unshift({ titulo, texto, urgente, data: new Date().toLocaleDateString('pt-BR') });
  tvMudarCanal(null, 'comunicados');
}

function tvPublicarFeed(i) {
  const c = endoData.comunicados[i];
  if (typeof publicarNoFeedClima === 'function') publicarNoFeedClima(c.titulo, `📢 ${c.titulo}\n\n${c.texto}\n\nEquipe hi Conecta RH`);
  alert('✅ Publicado no Feed!');
}

function tvEditarComunicado(i) {
  const c = endoData.comunicados[i];
  const novo = prompt('Editar texto:', c.texto);
  if (novo) { c.texto = novo; tvMudarCanal(null,'comunicados'); }
}

function tvPublicarAnivFeed() {
  const nomes = endoData.aniversariantes.map(a=>`🎂 ${a.nome} — ${a.dia}`).join('\n');
  if (typeof publicarNoFeedClima === 'function') publicarNoFeedClima('🎉 Aniversariantes do Mês', `🎂 PARABÉNS!\n\n${nomes}\n\nEquipe hi Conecta RH 💙`);
  alert('✅ Publicado no Feed!');
}

function tvParabenizar(nome) {
  if (typeof publicarNoFeedClima === 'function') publicarNoFeedClima(`🎂 Feliz Aniversário, ${nome}!`, `🎉 Hoje é aniversário de ${nome}!\n\nDesejamos um dia incrível!\n\nEquipe hi Conecta RH 💙`);
  alert(`✅ Parabéns enviado para ${nome}!`);
}

function tvPublicarAnivIndividual(nome) { tvParabenizar(nome); }

function tvMarcarInteresse(titulo, btn) {
  endoTV.eventoInteresses[titulo] = !endoTV.eventoInteresses[titulo];
  btn.className = 'tv-btn-interesse' + (endoTV.eventoInteresses[titulo]?' ativo':'');
  btn.textContent = endoTV.eventoInteresses[titulo] ? '❤️ Tenho interesse' : '🤍 Tenho interesse';
}

function tvIndicarEvento() {
  const titulo = prompt('Nome do evento:');
  if (titulo) alert('✅ Evento indicado para avaliação do RH!');
}

function tvToggleBen(i, btn) {
  const box = document.getElementById(`tv-como-box-${i}`);
  if (!box) return;
  const open = box.style.display !== 'none';
  box.style.display = open ? 'none' : 'block';
  btn.textContent = open ? 'ℹ Como usar ▾' : 'ℹ Como usar ▴';
}

function tvAdmNovoComunicado() {
  const titulo = document.getElementById('adm-com-titulo')?.value.trim();
  const texto  = document.getElementById('adm-com-texto')?.value.trim();
  const urgente= document.getElementById('adm-com-urgente')?.checked;
  if (!titulo || !texto) { alert('Preencha título e texto!'); return; }
  endoData.comunicados.unshift({ titulo, texto, urgente, data: new Date().toLocaleDateString('pt-BR') });
  alert('✅ Comunicado publicado!');
  tvMudarCanal(null, 'comunicados');
}

function tvAdmAddTicker() {
  const input = document.getElementById('adm-ticker-novo');
  if (!input?.value.trim()) return;
  endoData.ticker.push(input.value.trim());
  input.value = '';
  tvMudarCanal(null, 'admin');
}

// Aliases retrocompatibilidade
function switchEndoTab2(btn, aba) { tvMudarCanal(btn, aba==='home'?'home':aba==='comunicados'?'comunicados':aba==='aniversarios'?'aniversarios':aba==='beneficios2'?'beneficios':aba==='agenda'?'agenda':aba==='noticias2'?'noticias':aba==='sistemas'?'sistemas':'home'); }
function marcarInteresse(titulo) { const btn = document.querySelector(`[onclick="marcarInteresse('${titulo}')"]`); if(btn) tvMarcarInteresse(titulo,btn); }
function indicarEvento() { tvIndicarEvento(); }
function novoComunicado() { tvNovoComunicado(); }
function publicarComunicadoFeed(i) { tvPublicarFeed(i); }
function renderEndoHome()        { return tvCanal_Home();        }
function renderEndoComunicados() { return tvCanal_Comunicados(); }
function renderEndoAniversarios(){ return tvCanal_Aniversarios();}
function renderEndoBeneficios2() { return tvCanal_Beneficios(); }
function renderEndoAgenda()      { return tvCanal_Agenda();      }
function renderEndoNoticias2()   { return tvCanal_Noticias();    }
function renderEndoSistemas()    { return tvCanal_Sistemas();    }
