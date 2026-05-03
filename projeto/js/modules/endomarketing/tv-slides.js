// =============================================
// HI.TV — SLIDES CORPORATIVOS
// 11 tipos · Auto-play · Design TV fullscreen
// =============================================

// ─────────────────────────────────────────────
// CONTEÚDO DOS SLIDES
// ─────────────────────────────────────────────
const tvSlidesContent = {

  produtividade: [
    { icone:'⏱️', titulo:'Regra dos 2 Minutos', desc:'Se a tarefa leva menos de 2 min, faça agora. Não adie o simples!' },
    { icone:'🎯', titulo:'Uma Coisa de Cada Vez', desc:'Multitarefa reduz produtividade em 40%. Foque em uma coisa por vez.' },
    { icone:'📝', titulo:'Suas 3 Prioridades', desc:'Todo dia: escolha as 3 tarefas mais importantes e entregue antes das outras.' },
    { icone:'🧠', titulo:'Pausas Inteligentes', desc:'5 minutos de pausa a cada hora aumentam a produtividade em 20%.' },
    { icone:'🌅', titulo:'Ritual da Manhã', desc:'Os primeiros 30 min definem seu dia. Comece pelas tarefas que importam.' },
  ],

  culinaria: [
    {
      icone:'🥗', titulo:'Salada Grega Rápida', tempo:'5 min',
      passos:['Corte tomate, pepino e queijo feta', 'Adicione azeitonas pretas e cebola roxa', 'Tempere com azeite, limão e orégano'],
    },
    {
      icone:'🍳', titulo:'Ovos Mexidos Cremosos', tempo:'3 min',
      passos:['Bata 2 ovos com sal e pimenta-do-reino', 'Cozinhe em fogo baixo mexendo sempre', 'Finalize com manteiga e cebolinha fresca'],
    },
    {
      icone:'🥤', titulo:'Vitamina Energética', tempo:'2 min',
      passos:['Bata banana + aveia + leite no liquidificador', 'Adicione mel e canela a gosto', 'Sirva gelado e comece o dia com energia!'],
    },
    {
      icone:'🥑', titulo:'Torrada de Abacate', tempo:'4 min',
      passos:['Torre o pão e amasse o abacate com limão', 'Tempere com sal, pimenta e azeite', 'Finalize com ovo pochê ou gergelim'],
    },
  ],

  curiosidades: [
    { icone:'💡', titulo:'Você Sabia?',   desc:'Empresas que incentivam ideias dos colaboradores têm 3× mais inovação registrada.' },
    { icone:'📊', titulo:'Dado Curioso',  desc:'Feedback contínuo aumenta o engajamento da equipe em até 40% ao longo do ano.' },
    { icone:'🌱', titulo:'Sabia Que...',  desc:'Culturas organizacionais fortes geram até 72% mais engajamento dos times.' },
    { icone:'🤝', titulo:'Interessante!', desc:'Times com diversidade resolvem problemas 35% mais rápido que equipes homogêneas.' },
    { icone:'🏆', titulo:'Fato!',         desc:'Reconhecimento semanal aumenta a retenção de talentos em até 56%.' },
  ],

  bemEstar: [
    { icone:'🧘', titulo:'Respire Agora',   desc:'4 segundos inspirando · 4 segundos segurando · 4 segundos expirando. Repita 3×.' },
    { icone:'💧', titulo:'Hidratação!',     desc:'Beba um copo d\'água agora. Seu cérebro é 75% água — ele precisa de combustível.' },
    { icone:'🚶', titulo:'Mexa-se!',        desc:'Levante, caminhe 2 minutos. Quem fica sentado por 8h tem 5× mais risco de dor lombar.' },
    { icone:'👁️', titulo:'Descanso Visual', desc:'Olhe para longe por 20 segundos a cada 20 minutos. Regra 20-20-20.' },
    { icone:'🪑', titulo:'Postura Certa',   desc:'Costas retas · Pés no chão · Tela na altura dos olhos. Ajuste agora!' },
  ],

  humor: [
    { icone:'😄', titulo:'Hora do Riso!',    desc:'"Segunda-feira: a semana que prometia ser produtiva... ainda tem quinta!" 😅' },
    { icone:'☕', titulo:'Verdade Absoluta!', desc:'"O segredo da produtividade é simples: café, foco e... mais café." ☕☕' },
    { icone:'🦸', titulo:'Herói do Dia!',    desc:'"Wi-fi caiu? Em 3 segundos o técnico de TI virou o MVP da empresa." 🙌' },
    { icone:'📧', titulo:'Realidade RH!',    desc:'"Esta reunião poderia ter sido um e-mail. Mas o café estava bom." ☕' },
    { icone:'🎯', titulo:'Metas!',           desc:'"Nossa meta é ambiciosa. Mas como diz o time: café primeiro, metas depois!" 💪' },
  ],

  destaques: [
    { nome:'Maria Oliveira', cargo:'Analista de RH',    motivo:'Atendimento excepcional e suporte incrível à equipe este mês!', avatar:'MO', cor:'#7c3aed' },
    { nome:'João Silva',     cargo:'Vendedor',          motivo:'Superou a meta em 150% — melhor resultado do semestre!',       avatar:'JS', cor:'#2563eb' },
    { nome:'Ricardo Alves',  cargo:'Tech Lead',         motivo:'Entregou o projeto antes do prazo com qualidade top!',         avatar:'RA', cor:'#16a34a' },
  ],

  indicadores: {
    label:     'Meta Comercial — Maio/2025',
    meta:       100,
    atual:       78,
    admissoes:    3,
    satisfacao:  92,
    presenca:    95,
  },
};

// ─────────────────────────────────────────────
// ESTADO DO PLAYER
// ─────────────────────────────────────────────
const tvSlidesState = {
  idx:        0,
  playing:    true,
  duration:   9000,
  _timer:     null,
  _progTimer: null,
  _progVal:   0,
};

// ─────────────────────────────────────────────
// MONTA SEQUÊNCIA DE SLIDES
// ─────────────────────────────────────────────
function _buildAllSlides() {
  const s = [];

  // Começa com indicadores para impacto imediato
  s.push({ tipo:'indicadores' });

  // Comunicado (da endoData)
  if (endoData.comunicados && endoData.comunicados.length)
    endoData.comunicados.slice(0,2).forEach(function(c){ s.push(Object.assign({ tipo:'comunicado' }, c)); });

  // Aniversariantes
  if (endoData.aniversariantes && endoData.aniversariantes.length)
    s.push({ tipo:'aniversario' });

  // Destaque
  tvSlidesContent.destaques.forEach(function(d){ s.push(Object.assign({ tipo:'destaque' }, d)); });

  // Pão Diário
  if (endoData.paoDiario && endoData.paoDiario[0])
    s.push(Object.assign({ tipo:'pao' }, endoData.paoDiario[0]));

  // Produtividade
  tvSlidesContent.produtividade.forEach(function(d){ s.push(Object.assign({ tipo:'produtividade' }, d)); });

  // Culinária
  tvSlidesContent.culinaria.forEach(function(r){ s.push(Object.assign({ tipo:'culinaria' }, r)); });

  // Agenda Cultural
  if (endoData.agendaCultural && endoData.agendaCultural.length)
    endoData.agendaCultural.slice(0,3).forEach(function(e){ s.push(Object.assign({ tipo:'agenda' }, e)); });

  // Bem-estar
  tvSlidesContent.bemEstar.forEach(b => s.push({ tipo:'bemEstar', ...b }));

  // Curiosidades
  tvSlidesContent.curiosidades.forEach(c => s.push({ tipo:'curiosidade', ...c }));

  // Humor
  tvSlidesContent.humor.forEach(h => s.push({ tipo:'humor', ...h }));

  return s;
}

// ─────────────────────────────────────────────
// CSS INJETADO LAZY
// ─────────────────────────────────────────────
function _injetarCssSlides() {
  if (document.getElementById('css-tv-slides')) return;
  const st = document.createElement('style');
  st.id = 'css-tv-slides';
  st.textContent = `
    .tvs-wrap         { display:flex;flex-direction:column;gap:0;min-height:560px }
    .tvs-slide        { min-height:460px;border-radius:16px;padding:52px 60px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;transition:opacity .35s }
    .tvs-deco-c1      { position:absolute;width:420px;height:420px;border-radius:50%;opacity:.08;top:-120px;right:-120px;background:white;pointer-events:none }
    .tvs-deco-c2      { position:absolute;width:260px;height:260px;border-radius:50%;opacity:.06;bottom:-80px;left:-60px;background:white;pointer-events:none }
    .tvs-deco-c3      { position:absolute;width:160px;height:160px;border-radius:50%;opacity:.05;top:30%;left:40%;background:white;pointer-events:none }
    .tvs-tag          { display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;background:rgba(255,255,255,.15);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:white;margin-bottom:20px;width:fit-content }
    .tvs-icon         { font-size:72px;line-height:1;margin-bottom:16px }
    .tvs-title        { font-family:'Syne',sans-serif;font-size:44px;font-weight:900;color:white;line-height:1.1;margin-bottom:12px;text-shadow:0 2px 20px rgba(0,0,0,.2) }
    .tvs-title.sm     { font-size:34px }
    .tvs-title.lg     { font-size:56px }
    .tvs-sub          { font-size:20px;color:rgba(255,255,255,.82);max-width:620px;line-height:1.55;font-weight:400 }
    .tvs-sub.lg       { font-size:26px;font-weight:600;color:white;font-style:italic;line-height:1.4 }
    .tvs-dest         { font-family:'Syne',sans-serif;font-size:68px;font-weight:900;color:white;line-height:1 }
    .tvs-layout-2col  { display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center }
    .tvs-layout-row   { display:flex;align-items:flex-start;gap:48px }
    .tvs-steps        { display:flex;flex-direction:column;gap:12px;margin-top:8px }
    .tvs-step         { display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.12);backdrop-filter:blur(4px);border-radius:12px;padding:12px 16px }
    .tvs-step-num     { width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;flex-shrink:0 }
    .tvs-step-txt     { font-size:16px;color:white;font-weight:500 }
    .tvs-kpi-row      { display:flex;gap:16px;margin-top:20px;flex-wrap:wrap }
    .tvs-kpi          { background:rgba(255,255,255,.12);backdrop-filter:blur(4px);border-radius:14px;padding:14px 20px;display:flex;flex-direction:column;gap:4px;min-width:120px }
    .tvs-kpi-val      { font-size:32px;font-weight:900;color:white;line-height:1 }
    .tvs-kpi-label    { font-size:11px;color:rgba(255,255,255,.7);font-weight:600;text-transform:uppercase;letter-spacing:1px }
    .tvs-ring-wrap    { display:flex;align-items:center;gap:32px }
    .tvs-ring-info    { display:flex;flex-direction:column;gap:8px }
    .tvs-ring-item    { display:flex;align-items:center;gap:10px;font-size:15px;color:rgba(255,255,255,.9) }
    .tvs-avatar-big   { width:100px;height:100px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:white;border:3px solid rgba(255,255,255,.3);background:rgba(255,255,255,.15);flex-shrink:0 }
    .tvs-aniv-grid    { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-top:8px }
    .tvs-aniv-card    { background:rgba(255,255,255,.15);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:20px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center }
    .tvs-aniv-av      { width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:white }
    .tvs-aniv-nome    { font-size:15px;font-weight:700;color:white }
    .tvs-aniv-dia     { font-size:12px;color:rgba(255,255,255,.7) }
    .tvs-brand        { position:absolute;bottom:20px;right:28px;font-size:12px;color:rgba(255,255,255,.4);font-weight:600;letter-spacing:1px }
    .tvs-clock        { position:absolute;top:24px;right:32px;font-size:13px;color:rgba(255,255,255,.5);font-weight:600;font-family:monospace }
    /* Controls */
    .tvs-ctrl-bar     { display:flex;align-items:center;gap:10px;padding:12px 16px;background:#0f172a;border-radius:0 0 16px 16px;border-top:1px solid #1e293b }
    .tvs-ctrl-btn     { background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.8);border-radius:8px;padding:7px 14px;cursor:pointer;font-size:16px;transition:all .2s;font-family:inherit }
    .tvs-ctrl-btn:hover{ background:rgba(255,255,255,.12);color:white }
    .tvs-ctrl-btn.active{ background:#2563eb;border-color:#2563eb;color:white }
    .tvs-ctrl-counter { color:rgba(255,255,255,.5);font-size:13px;min-width:50px;text-align:center }
    .tvs-dots         { display:flex;gap:5px;flex:1;flex-wrap:wrap;padding:0 8px;align-items:center }
    .tvs-dot          { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;transition:all .2s;flex-shrink:0 }
    .tvs-dot.ativo    { background:#2563eb;width:22px;border-radius:4px }
    .tvs-dot:hover    { background:rgba(255,255,255,.4) }
    .tvs-prog-wrap    { height:3px;background:#1e293b;border-radius:0 }
    .tvs-prog-fill    { height:100%;background:#2563eb;border-radius:0;width:0%;transition:none }
    @keyframes tvs-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    .tvs-slide        { animation:tvs-fadein .35s ease }
  `;
  document.head.appendChild(st);
}

// ─────────────────────────────────────────────
// CANAL PRINCIPAL
// ─────────────────────────────────────────────
function tvCanal_TVSlides() {
  _injetarCssSlides();
  const all = _buildAllSlides();
  const total = all.length;
  const idx = tvSlidesState.idx % total;
  const slide = all[idx];

  _tvSlidesStartTimer(total);

  return `
  <div class="tvs-wrap">

    <!-- SLIDE -->
    <div id="tvs-slide-area">
      ${_renderSlide(slide, idx, total)}
    </div>

    <!-- BARRA DE PROGRESSO -->
    <div class="tvs-prog-wrap">
      <div class="tvs-prog-fill" id="tvs-prog"></div>
    </div>

    <!-- CONTROLES -->
    <div class="tvs-ctrl-bar">
      <button class="tvs-ctrl-btn" onclick="tvSlidesPrev()" title="Anterior">◀</button>
      <button class="tvs-ctrl-btn ${tvSlidesState.playing?'active':''}" onclick="tvSlidesPlayPause()" id="tvs-playbtn">
        ${tvSlidesState.playing ? '⏸' : '▶'}
      </button>
      <button class="tvs-ctrl-btn" onclick="tvSlidesNext()" title="Próximo">▶</button>
      <span class="tvs-ctrl-counter">${idx + 1}/${total}</span>
      <div class="tvs-dots" id="tvs-dots">
        ${all.map((_,i) => `<div class="tvs-dot ${i===idx?'ativo':''}" onclick="tvSlidesGoTo(${i})" title="Slide ${i+1}"></div>`).join('')}
      </div>
      <button class="tvs-ctrl-btn" onclick="tvSlidesFullscreen()" title="Tela cheia">⛶</button>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// DISPATCH DE TIPOS
// ─────────────────────────────────────────────
function _renderSlide(slide, idx, total) {
  const map = {
    comunicado:   () => _slideComunicado(slide),
    aniversario:  () => _slideAniversario(),
    pao:          () => _slidePao(slide),
    produtividade:() => _slideProdutividade(slide),
    indicadores:  () => _slideIndicadores(),
    destaque:     () => _slideDestaque(slide),
    culinaria:    () => _slideCulinaria(slide),
    agenda:       () => _slideAgenda(slide),
    curiosidade:  () => _slideCuriosidade(slide),
    bemEstar:     () => _slideBemEstar(slide),
    humor:        () => _slideHumor(slide),
  };
  return (map[slide.tipo] || (() => ''))();
}

// Helper de horário para cada slide
function _tvClock() {
  return `<div class="tvs-clock" id="tvs-clock-${Date.now()}">${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>`;
}

// ─────────────────────────────────────────────
// 1. COMUNICADO INTERNO — Azul
// ─────────────────────────────────────────────
function _slideComunicado(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 60%,#3b82f6 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div><div class="tvs-deco-c3"></div>
    ${_tvClock()}
    <div class="tvs-tag">📢 Comunicado Interno</div>
    <div class="tvs-icon">📣</div>
    <div class="tvs-title${s.titulo?.length > 30?' sm':''}">${s.titulo || 'Atenção, equipe!'}</div>
    <div class="tvs-sub">${s.texto || ''}</div>
    ${s.data ? `<div style="margin-top:20px;font-size:14px;color:rgba(255,255,255,.5);font-weight:600">📅 ${s.data}</div>` : ''}
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 2. ANIVERSARIANTES — Rosa/Festivo
// ─────────────────────────────────────────────
function _slideAniversario() {
  const anivs = endoData.aniversariantes || [];
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#7c2d92 0%,#db2777 55%,#f43f5e 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">🎂 Aniversariantes do Mês</div>
    <div class="tvs-title lg" style="margin-bottom:24px">Parabéns! 🎉</div>
    <div class="tvs-aniv-grid">
      ${anivs.map(a => `
        <div class="tvs-aniv-card">
          <div style="font-size:36px">🎂</div>
          <div class="tvs-aniv-av">${a.avatar}</div>
          <div class="tvs-aniv-nome">${a.nome}</div>
          <div class="tvs-aniv-dia">📅 ${a.dia} · ${a.setor}</div>
          <div style="font-size:22px;margin-top:4px">🎊</div>
        </div>
      `).join('')}
      ${anivs.length === 0 ? '<div style="color:rgba(255,255,255,.6);font-size:16px">Nenhum aniversariante este mês.</div>' : ''}
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 3. PÃO DIÁRIO / REFLEXÃO — Roxo/Índigo
// ─────────────────────────────────────────────
function _slidePao(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 55%,#7c3aed 100%);min-height:480px">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">📖 Pão Diário · Reflexão</div>
    <div style="font-size:56px;margin:12px 0">✝️</div>
    <div class="tvs-sub lg">${s.versiculo || '"Porque para Deus nada é impossível."'}</div>
    <div style="margin-top:14px;font-size:16px;color:#fbbf24;font-weight:700">${s.ref || 'Lucas 1:37'}</div>
    ${s.reflexao ? `
    <div style="margin-top:20px;background:rgba(255,255,255,.1);border-radius:12px;padding:16px 20px;border-left:3px solid #fbbf24">
      <p style="font-size:15px;color:rgba(255,255,255,.8);line-height:1.6;font-style:italic">${s.reflexao}</p>
    </div>` : ''}
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 4. DICA DE PRODUTIVIDADE — Azul Escuro
// ─────────────────────────────────────────────
function _slideProdutividade(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">💡 Dica de Produtividade</div>
    <div class="tvs-layout-row" style="align-items:center;gap:40px">
      <div style="font-size:88px;line-height:1;flex-shrink:0">${s.icone}</div>
      <div>
        <div class="tvs-title">${s.titulo}</div>
        <div class="tvs-sub">${s.desc}</div>
      </div>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 5. INDICADORES DA EMPRESA — Verde
// ─────────────────────────────────────────────
function _slideIndicadores() {
  const d = tvSlidesContent.indicadores;
  const pct = Math.round((d.atual / d.meta) * 100);
  const circ = 2 * Math.PI * 52;
  const fill = (pct / 100) * circ;

  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#064e3b 0%,#065f46 50%,#059669 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">📊 Indicadores — Maio/2025</div>
    <div class="tvs-layout-2col">
      <div>
        <div class="tvs-title" style="font-size:32px;margin-bottom:8px">${d.label}</div>
        <div class="tvs-ring-wrap" style="margin-top:16px">
          <svg viewBox="0 0 120 120" width="120" height="120" style="flex-shrink:0">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="10"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#4ade80" stroke-width="10"
              stroke-dasharray="${fill.toFixed(1)} ${(circ-fill).toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 60 60)"/>
            <text x="60" y="56" text-anchor="middle" font-size="22" font-weight="900" fill="white">${pct}%</text>
            <text x="60" y="74" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.6)">atingido</text>
          </svg>
          <div class="tvs-ring-info">
            <div class="tvs-ring-item"><span style="color:#4ade80;font-size:20px">●</span><span>Meta: <strong>${d.meta}%</strong></span></div>
            <div class="tvs-ring-item"><span style="color:#fbbf24;font-size:20px">●</span><span>Atual: <strong>${d.atual}%</strong></span></div>
            <div style="height:8px;background:rgba(255,255,255,.15);border-radius:4px;width:180px;margin-top:8px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#4ade80,#22d3ee);border-radius:4px"></div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="tvs-kpi-row" style="flex-direction:column;margin:0">
          <div class="tvs-kpi">
            <div class="tvs-kpi-val" style="color:#4ade80">${d.satisfacao}%</div>
            <div class="tvs-kpi-label">Satisfação</div>
          </div>
          <div class="tvs-kpi">
            <div class="tvs-kpi-val" style="color:#34d399">+${d.admissoes}</div>
            <div class="tvs-kpi-label">Novas Admissões</div>
          </div>
          <div class="tvs-kpi">
            <div class="tvs-kpi-val" style="color:#6ee7b7">${d.presenca}%</div>
            <div class="tvs-kpi-label">Presença</div>
          </div>
        </div>
      </div>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 6. COLABORADOR DESTAQUE — Âmbar/Dourado
// ─────────────────────────────────────────────
function _slideDestaque(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#78350f 0%,#b45309 45%,#d97706 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">⭐ Colaborador Destaque do Mês</div>
    <div class="tvs-layout-row" style="align-items:center;gap:36px;margin-top:8px">
      <div style="text-align:center;flex-shrink:0">
        <div style="font-size:48px;margin-bottom:8px">🏆</div>
        <div class="tvs-avatar-big" style="width:96px;height:96px;font-size:32px;font-weight:900;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.4)">
          ${s.avatar || '⭐'}
        </div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:#fef3c7;text-transform:uppercase;margin-bottom:8px">Parabéns!</div>
        <div class="tvs-title" style="font-size:46px;margin-bottom:6px">${s.nome}</div>
        <div style="font-size:17px;color:#fef3c7;font-weight:600;margin-bottom:14px">${s.cargo} ${s.setor ? '· ' + s.setor : ''}</div>
        <div style="background:rgba(255,255,255,.12);backdrop-filter:blur(6px);border-radius:12px;padding:14px 18px;border-left:3px solid #fbbf24">
          <p style="font-size:17px;color:white;line-height:1.5;font-style:italic">"${s.motivo}"</p>
        </div>
      </div>
    </div>
    <div style="margin-top:20px;display:flex;gap:8px">
      <span style="font-size:24px">⭐</span><span style="font-size:24px">⭐</span><span style="font-size:24px">⭐</span>
      <span style="font-size:24px">⭐</span><span style="font-size:24px">⭐</span>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 7. DICA DE CULINÁRIA — Laranja
// ─────────────────────────────────────────────
function _slideCulinaria(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#7c2d12 0%,#c2410c 50%,#ea580c 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">👩‍🍳 Receita do Dia · ${s.tempo || '5 min'}</div>
    <div class="tvs-layout-2col" style="align-items:flex-start;gap:40px">
      <div>
        <div style="font-size:72px;margin-bottom:12px">${s.icone}</div>
        <div class="tvs-title sm">${s.titulo}</div>
        <div style="font-size:16px;color:rgba(255,255,255,.7);margin-top:6px">⏱️ Pronto em ${s.tempo || '5 min'}</div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.6);text-transform:uppercase;margin-bottom:12px">Modo de Preparo:</div>
        <div class="tvs-steps">
          ${(s.passos || []).map((p,i) => `
            <div class="tvs-step">
              <div class="tvs-step-num">${i+1}</div>
              <div class="tvs-step-txt">${p}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 8. AGENDA CULTURAL — Índigo
// ─────────────────────────────────────────────
function _slideAgenda(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#1e1b4b 0%,#3730a3 55%,#4f46e5 100%);min-height:460px;position:relative;overflow:hidden">
    ${s.foto ? `<img src="${s.foto}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.18;pointer-events:none">` : ''}
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">📅 Agenda Cultural</div>
    <div class="tvs-layout-row" style="align-items:center;gap:40px">
      <div style="flex-shrink:0">
        <div style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:20px 24px;text-align:center;min-width:110px">
          <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.6);text-transform:uppercase">${s.dia || 'SEX'}</div>
          <div style="font-size:36px;font-weight:900;color:white;line-height:1;margin:4px 0">${s.data?.split('/')[0] || '24'}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.6)">/${s.data?.split('/')[1] || '05'}</div>
        </div>
      </div>
      <div>
        ${s.tipo ? `<div style="display:inline-block;background:${s.cor||'#4f46e5'};color:white;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">${s.tipo}</div>` : ''}
        <div class="tvs-title sm">${s.titulo}</div>
        <div class="tvs-sub" style="margin-top:8px">
          ${s.local ? `📍 ${s.local}` : ''}
          ${s.hora  ? ` &nbsp;·&nbsp; 🕐 ${s.hora}` : ''}
        </div>
      </div>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 9. CURIOSIDADE EMPRESARIAL — Verde Esmeralda
// ─────────────────────────────────────────────
function _slideCuriosidade(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#022c22 0%,#064e3b 50%,#065f46 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">💡 ${s.titulo || 'Você Sabia?'}</div>
    <div style="font-size:80px;margin:12px 0;line-height:1">${s.icone || '💡'}</div>
    <div class="tvs-title" style="font-size:38px;margin-bottom:16px">${s.titulo || 'Você Sabia?'}</div>
    <div style="background:rgba(255,255,255,.1);backdrop-filter:blur(6px);border-radius:16px;padding:24px 28px;border-left:4px solid #4ade80;max-width:680px">
      <p class="tvs-sub" style="font-size:22px;font-style:italic">"${s.desc}"</p>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 10. BEM-ESTAR — Azul Oceano
// ─────────────────────────────────────────────
function _slideBemEstar(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 55%,#0284c7 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">💙 Bem-estar & Saúde</div>
    <div class="tvs-layout-row" style="align-items:center;gap:44px">
      <div style="font-size:100px;line-height:1;flex-shrink:0">${s.icone || '💙'}</div>
      <div>
        <div class="tvs-title">${s.titulo}</div>
        <div class="tvs-sub" style="margin-top:10px;font-size:22px">${s.desc}</div>
        <div style="margin-top:20px;background:rgba(255,255,255,.12);border-radius:10px;padding:10px 16px;display:inline-block">
          <span style="font-size:14px;color:rgba(255,255,255,.7);font-weight:600">⏱️ Faça agora — leva menos de 1 minuto</span>
        </div>
      </div>
    </div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// 11. HUMOR CORPORATIVO — Amarelo Vibrante
// ─────────────────────────────────────────────
function _slideHumor(s) {
  return `
  <div class="tvs-slide" style="background:linear-gradient(135deg,#713f12 0%,#92400e 45%,#b45309 100%)">
    <div class="tvs-deco-c1"></div><div class="tvs-deco-c2"></div>
    ${_tvClock()}
    <div class="tvs-tag">😄 Hora do Riso!</div>
    <div style="font-size:88px;line-height:1;margin:8px 0">${s.icone || '😄'}</div>
    <div class="tvs-title" style="font-size:34px;color:#fef3c7;margin-bottom:16px">${s.titulo}</div>
    <div style="background:rgba(255,255,255,.12);backdrop-filter:blur(6px);border-radius:16px;padding:22px 28px;border-left:4px solid #fbbf24;max-width:680px">
      <p style="font-size:20px;color:white;line-height:1.6;font-style:italic">${s.desc}</p>
    </div>
    <div style="margin-top:20px;font-size:14px;color:rgba(255,255,255,.5)">Humor leve e respeitoso 😊</div>
    <div class="tvs-brand">hi Conecta RH</div>
  </div>`;
}

// ─────────────────────────────────────────────
// CONTROLES DE NAVEGAÇÃO
// ─────────────────────────────────────────────
function tvSlidesNext() {
  const all = _buildAllSlides();
  tvSlidesState.idx = (tvSlidesState.idx + 1) % all.length;
  _tvSlidesRefresh(all);
}

function tvSlidesPrev() {
  const all = _buildAllSlides();
  tvSlidesState.idx = (tvSlidesState.idx - 1 + all.length) % all.length;
  _tvSlidesRefresh(all);
}

function tvSlidesGoTo(idx) {
  tvSlidesState.idx = idx;
  _tvSlidesRefresh(_buildAllSlides());
}

function tvSlidesPlayPause() {
  tvSlidesState.playing = !tvSlidesState.playing;
  const btn = document.getElementById('tvs-playbtn');
  if (btn) {
    btn.textContent = tvSlidesState.playing ? '⏸' : '▶';
    btn.classList.toggle('active', tvSlidesState.playing);
  }
  if (tvSlidesState.playing) {
    _tvSlidesStartTimer(_buildAllSlides().length);
  } else {
    _tvSlidesStopTimer();
  }
}

function tvSlidesFullscreen() {
  const el = document.getElementById('tvs-slide-area') || document.getElementById('tv-root');
  if (!document.fullscreenElement) {
    (el || document.documentElement).requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

// ─────────────────────────────────────────────
// REFRESH DO SLIDE ATUAL (sem re-render total)
// ─────────────────────────────────────────────
function _tvSlidesRefresh(all) {
  _tvSlidesStopTimer();
  const idx = tvSlidesState.idx % all.length;
  const slide = all[idx];

  const area = document.getElementById('tvs-slide-area');
  if (area) area.innerHTML = _renderSlide(slide, idx, all.length);

  // Atualizar contador e dots
  const counter = document.querySelector('.tvs-ctrl-counter');
  if (counter) counter.textContent = `${idx + 1}/${all.length}`;

  document.querySelectorAll('.tvs-dot').forEach((d, i) => {
    d.classList.toggle('ativo', i === idx);
  });

  _tvSlidesResetProg();
  if (tvSlidesState.playing) _tvSlidesStartTimer(all.length);
}

// ─────────────────────────────────────────────
// TIMER AUTO-PLAY + BARRA DE PROGRESSO
// ─────────────────────────────────────────────
function _tvSlidesStartTimer(total) {
  _tvSlidesStopTimer();
  if (!tvSlidesState.playing) return;

  _tvSlidesResetProg();
  const step = 100 / (tvSlidesState.duration / 80);

  tvSlidesState._progTimer = setInterval(() => {
    tvSlidesState._progVal = Math.min(100, tvSlidesState._progVal + step);
    const bar = document.getElementById('tvs-prog');
    if (bar) bar.style.width = tvSlidesState._progVal + '%';
    if (tvSlidesState._progVal >= 100) {
      clearInterval(tvSlidesState._progTimer);
      tvSlidesState.idx = (tvSlidesState.idx + 1) % total;
      _tvSlidesRefresh(_buildAllSlides());
    }
  }, 80);

  // Registra no endoTV para limpeza global
  if (typeof endoTV !== 'undefined') endoTV.intervals.push(tvSlidesState._progTimer);
}

function _tvSlidesStopTimer() {
  if (tvSlidesState._progTimer) {
    clearInterval(tvSlidesState._progTimer);
    tvSlidesState._progTimer = null;
  }
}

function _tvSlidesResetProg() {
  tvSlidesState._progVal = 0;
  const bar = document.getElementById('tvs-prog');
  if (bar) bar.style.width = '0%';
}

// Atualiza relógio nos slides a cada minuto
setInterval(() => {
  const clocks = document.querySelectorAll('[id^="tvs-clock-"]');
  const hora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  clocks.forEach(el => el.textContent = hora);
}, 30000);
