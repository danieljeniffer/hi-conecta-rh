/**
 * copiloto-ia.js — Copiloto IA do Gestor
 * hi Conecta RH · Painel proativo e personalizado por gestor
 *
 * Cada gestor vê:
 *  - Alertas da sua equipe em tempo real
 *  - Sugestões de ação específicas
 *  - Métricas da equipe vs benchmark
 *  - Chat com IA especializado na equipe
 *  - Insights comportamentais
 *  - Histórico de interações
 */

function renderCopilotoIA() {
  const pc   = document.getElementById('pageContainer');
  if (!pc) return;

  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const nomeGestor = userData.nome || 'Gestor';
  const primeiroNome = nomeGestor.split(' ')[0];

  // Dados da equipe do gestor
  const equipe = {
    nome: 'Comercial',
    headcount: 18,
    score_saude: 48,
    score_engajamento: 61,
    turnover: 7.1,
    meta_atingida: 78,
    alertas_criticos: 2,
    colaboradores: [
      { nome:'Diego Nunes',   risco:81, tipo:'Turnover',     foto:'DN', acao:'1:1 urgente' },
      { nome:'Beatriz Fonseca',risco:45, tipo:'Desmotivação', foto:'BF', acao:'Feedback positivo' },
      { nome:'Bruno Azevedo', risco:55, tipo:'Absenteísmo',  foto:'BA', acao:'Verificar presença' },
      { nome:'Lucas Ferreira',risco:32, tipo:'—',            foto:'LF', acao:'Acompanhar metas' },
    ],
    insights: [
      { tipo:'alerta',  msg:'Sua equipe está trabalhando em média 51h/semana. Risco de burnout em 3 colaboradores.' },
      { tipo:'sugestao',msg:'Diego Nunes não recebe feedback há 47 dias. Probabilidade de saída: 81%.' },
      { tipo:'padrao',  msg:'Turnover 3.5× acima da média: 4 saídas nos últimos 6 meses citam "gestão" como fator.' },
      { tipo:'positivo',msg:'Beatriz apresentou melhora de 12% na produtividade após sua última conversa.' },
    ],
    acoes_sugeridas: [
      { prioridade:'urgente', label:'1:1 com Diego Nunes esta semana',       impacto:94, tipo:'retenção' },
      { prioridade:'urgente', label:'Reunião de equipe — alinhamento de metas',impacto:82, tipo:'engajamento' },
      { prioridade:'alta',    label:'Reduzir jornada para máx 44h/semana',  impacto:78, tipo:'bem-estar' },
      { prioridade:'alta',    label:'Reconhecimento público — Beatriz F.',   impacto:65, tipo:'reconhecimento' },
      { prioridade:'media',   label:'Revisar distribuição de tarefas',       impacto:58, tipo:'produtividade' },
    ],
  };

  const corSaude = equipe.score_saude >= 75 ? '#10b981' : equipe.score_saude >= 55 ? '#f59e0b' : '#ef4444';

  pc.innerHTML = `
<div class="coi-root">

  <!-- Header personalizado -->
  <div class="coi-hero">
    <div class="coi-hero-content">
      <div class="coi-greeting">
        <div class="coi-ai-avatar">🤖</div>
        <div>
          <div class="coi-greeting-title">Bom dia, ${primeiroNome}!</div>
          <div class="coi-greeting-sub">Tenho <strong style="color:#f87171">${equipe.alertas_criticos} alertas críticos</strong> na sua equipe que precisam da sua atenção hoje.</div>
        </div>
      </div>
      <div class="coi-equipe-kpis">
        <div class="coi-kpi ${equipe.score_saude < 55 ? 'coi-kpi--red' : ''}">
          <div class="coi-kpi-v" style="color:${corSaude}">${equipe.score_saude}</div>
          <div class="coi-kpi-l">Health Score</div>
        </div>
        <div class="coi-kpi">
          <div class="coi-kpi-v">${equipe.score_engajamento}%</div>
          <div class="coi-kpi-l">Engajamento</div>
        </div>
        <div class="coi-kpi ${equipe.turnover > 5 ? 'coi-kpi--red' : ''}">
          <div class="coi-kpi-v" style="color:${equipe.turnover>5?'#ef4444':'#e2e8f0'}">${equipe.turnover}%</div>
          <div class="coi-kpi-l">Turnover</div>
        </div>
        <div class="coi-kpi">
          <div class="coi-kpi-v">${equipe.meta_atingida}%</div>
          <div class="coi-kpi-l">Meta atingida</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Grid principal -->
  <div class="coi-grid">

    <!-- Coluna 1: Chat IA -->
    <div class="coi-col coi-col--chat">
      <div class="coi-card coi-card--chat">
        <div class="coi-card-header">
          <div class="coi-card-title">
            <span>💬</span> Copiloto IA da Equipe
          </div>
          <div class="coi-live-badge">● Especializado na sua equipe</div>
        </div>

        <!-- Mensagens do copiloto -->
        <div class="coi-messages" id="coi-messages">
          <div class="coi-msg coi-msg--ai">
            <div class="coi-msg-avatar">🤖</div>
            <div class="coi-msg-bubble">
              Olá, ${primeiroNome}! Analisei os dados da equipe <strong>${equipe.nome}</strong>.<br><br>
              🔴 <strong>Situação crítica:</strong> Diego Nunes tem 81% de probabilidade de saída nos próximos 30 dias. Sugiro um 1:1 ainda esta semana.<br><br>
              📊 O turnover da sua equipe (7.1%) é 3.5× a média da empresa. Isso pode estar relacionado a pressão operacional acima da média.<br><br>
              O que você quer analisar primeiro?
            </div>
          </div>
          <div class="coi-shortcuts">
            ${['Por que meu turnover está alto?','Como melhorar o engajamento?','Quem precisa de atenção urgente?','Metas da equipe — análise','Como me tornar um gestor melhor?'].map(q =>
              `<button class="coi-chip" onclick="_coiPerguntar(this)">${q}</button>`
            ).join('')}
          </div>
        </div>

        <!-- Input -->
        <div class="coi-input-area">
          <input type="text" id="coi-input" class="coi-input" placeholder="Pergunte sobre sua equipe..." />
          <button class="coi-send" onclick="_coiEnviar()">→</button>
        </div>
      </div>
    </div>

    <!-- Coluna 2: Alertas + Ações -->
    <div class="coi-col">

      <!-- Pessoas em risco -->
      <div class="coi-card">
        <div class="coi-card-header">
          <div class="coi-card-title"><span>⚠️</span> Minha Equipe — Riscos</div>
        </div>
        ${equipe.colaboradores.map(c => {
          const cor = c.risco >= 70 ? '#ef4444' : c.risco >= 40 ? '#f59e0b' : '#10b981';
          return `<div class="coi-pessoa">
            <div class="coi-pessoa-av" style="background:${cor}22;color:${cor}">${c.foto}</div>
            <div class="coi-pessoa-info">
              <div class="coi-pessoa-nome">${c.nome}</div>
              <div class="coi-pessoa-tipo">${c.tipo || '—'}</div>
            </div>
            <div class="coi-pessoa-bar">
              <div class="coi-pessoa-fill" style="width:${c.risco}%;background:${cor}"></div>
            </div>
            <div class="coi-pessoa-score" style="color:${cor}">${c.risco}</div>
            <button class="coi-pessoa-btn" onclick="_coiPerguntar(this)" data-q="O que fazer com ${c.nome}?">${c.acao}</button>
          </div>`;
        }).join('')}
      </div>

      <!-- Ações recomendadas -->
      <div class="coi-card">
        <div class="coi-card-header">
          <div class="coi-card-title"><span>⚡</span> Ações Recomendadas</div>
          <span class="coi-badge">${equipe.acoes_sugeridas.length} ações</span>
        </div>
        ${equipe.acoes_sugeridas.map(a => {
          const corP = { urgente:'#ef4444', alta:'#f59e0b', media:'#6366f1' }[a.prioridade];
          return `<div class="coi-acao">
            <div class="coi-acao-dot" style="background:${corP}"></div>
            <div class="coi-acao-txt">${a.label}</div>
            <div class="coi-acao-bar"><div class="coi-acao-fill" style="width:${a.impacto}%;background:${corP}"></div></div>
            <div class="coi-acao-num">${a.impacto}</div>
          </div>`;
        }).join('')}
      </div>

    </div>

    <!-- Coluna 3: Insights -->
    <div class="coi-col">
      <div class="coi-card">
        <div class="coi-card-header">
          <div class="coi-card-title"><span>🧠</span> Insights da IA</div>
          <div class="coi-live-badge">● hoje</div>
        </div>
        ${equipe.insights.map(ins => {
          const cfg = {
            alerta:   { bg:'rgba(239,68,68,.06)',  border:'rgba(239,68,68,.2)',  ico:'🔴' },
            sugestao: { bg:'rgba(245,158,11,.06)', border:'rgba(245,158,11,.2)', ico:'💡' },
            padrao:   { bg:'rgba(99,102,241,.06)', border:'rgba(99,102,241,.2)', ico:'📊' },
            positivo: { bg:'rgba(16,185,129,.06)', border:'rgba(16,185,129,.2)', ico:'✅' },
          }[ins.tipo] || {};
          return `<div class="coi-insight" style="background:${cfg.bg};border:1px solid ${cfg.border}">
            <span class="coi-insight-ico">${cfg.ico}</span>
            <div class="coi-insight-txt">${ins.msg}</div>
          </div>`;
        }).join('')}

        <!-- Score comparativo -->
        <div class="coi-compare">
          <div class="coi-compare-title">Sua equipe vs. empresa</div>
          ${[
            ['Turnover',    equipe.turnover, 4.2, '%', true],
            ['Engajamento', equipe.score_engajamento, 74, '%', false],
            ['Health',      equipe.score_saude, 72, '', false],
          ].map(([label, val, media, suf, inverso]) => {
            const bom = inverso ? val <= media : val >= media;
            const cor = bom ? '#10b981' : '#ef4444';
            return `<div class="coi-cmp-row">
              <div class="coi-cmp-l">${label}</div>
              <div class="coi-cmp-bar">
                <div class="coi-cmp-media" style="left:${(media/100)*60+20}%">│</div>
                <div class="coi-cmp-fill" style="width:${Math.min(val,100)*0.6}%;background:${cor}"></div>
              </div>
              <div class="coi-cmp-val" style="color:${cor}">${val}${suf}</div>
              <div class="coi-cmp-ref">média ${media}${suf}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

  </div>
</div>

<style>
.coi-root{padding:0 0 2rem;max-width:1300px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}
/* Hero */
.coi-hero{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.06),transparent);
  border:1px solid rgba(99,102,241,.15);border-radius:20px;padding:1.5rem;margin-bottom:1.25rem}
.coi-hero-content{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
.coi-greeting{display:flex;align-items:center;gap:1rem}
.coi-ai-avatar{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;box-shadow:0 0 24px rgba(99,102,241,.4)}
.coi-greeting-title{font-size:1.2rem;font-weight:800;color:#f1f5f9;margin-bottom:.2rem}
.coi-greeting-sub{font-size:.83rem;color:#94a3b8;line-height:1.4}
.coi-equipe-kpis{display:flex;gap:1rem;flex-wrap:wrap}
.coi-kpi{text-align:center;padding:.5rem .875rem;background:rgba(255,255,255,.03);border-radius:10px;border:1px solid rgba(255,255,255,.06)}
.coi-kpi--red{border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.05)}
.coi-kpi-v{font-size:1.4rem;font-weight:900;color:#e2e8f0;line-height:1}
.coi-kpi-l{font-size:.65rem;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-top:.2rem}
/* Grid */
.coi-grid{display:grid;grid-template-columns:2fr 1.5fr 1.5fr;gap:1rem}
@media(max-width:1100px){.coi-grid{grid-template-columns:1fr 1fr}}
@media(max-width:700px){.coi-grid{grid-template-columns:1fr}}
.coi-col{display:flex;flex-direction:column;gap:1rem}
.coi-col--chat{grid-row:1/2}
/* Card */
.coi-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.1rem;display:flex;flex-direction:column;gap:.75rem}
.coi-card--chat{flex:1}
.coi-card-header{display:flex;align-items:center;justify-content:space-between}
.coi-card-title{display:flex;align-items:center;gap:.5rem;font-size:.82rem;font-weight:700;color:#e2e8f0}
.coi-live-badge{font-size:.65rem;color:#10b981;font-weight:700}
.coi-badge{padding:.15rem .5rem;border-radius:999px;font-size:.68rem;font-weight:700;background:rgba(99,102,241,.15);color:#a5b4fc}
/* Chat */
.coi-messages{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;max-height:380px;padding-right:.25rem}
.coi-messages::-webkit-scrollbar{width:3px}
.coi-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:999px}
.coi-msg{display:flex;gap:.6rem;align-items:flex-start}
.coi-msg--user{flex-direction:row-reverse}
.coi-msg-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0}
.coi-msg-bubble{padding:.65rem .9rem;border-radius:12px;font-size:.8rem;line-height:1.6;color:#e2e8f0;max-width:90%}
.coi-msg--ai .coi-msg-bubble{background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);border-radius:4px 12px 12px 12px}
.coi-msg--user .coi-msg-bubble{background:rgba(99,102,241,.2);border-radius:12px 4px 12px 12px}
.coi-shortcuts{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.25rem}
.coi-chip{padding:.3rem .65rem;border-radius:999px;border:1px solid rgba(99,102,241,.2);background:rgba(99,102,241,.06);color:#a5b4fc;font-size:.72rem;cursor:pointer;transition:.15s;font-family:inherit}
.coi-chip:hover{background:rgba(99,102,241,.2)}
.coi-input-area{display:flex;gap:.5rem;margin-top:.5rem}
.coi-input{flex:1;padding:.6rem .9rem;border-radius:10px;border:1px solid rgba(99,102,241,.2);background:rgba(99,102,241,.04);color:#e2e8f0;font-size:.82rem;font-family:inherit;outline:none;transition:.2s}
.coi-input:focus{border-color:rgba(99,102,241,.5)}
.coi-input::placeholder{color:#475569}
.coi-send{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s}
.coi-send:hover{transform:scale(1.05)}
/* Pessoas */
.coi-pessoa{display:flex;align-items:center;gap:.6rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.coi-pessoa:last-of-type{border:none}
.coi-pessoa-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;flex-shrink:0}
.coi-pessoa-info{min-width:0;flex:1}
.coi-pessoa-nome{font-size:.78rem;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.coi-pessoa-tipo{font-size:.65rem;color:#94a3b8}
.coi-pessoa-bar{width:50px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;flex-shrink:0}
.coi-pessoa-fill{height:100%;border-radius:2px}
.coi-pessoa-score{width:22px;font-size:.72rem;font-weight:700;text-align:right;flex-shrink:0}
.coi-pessoa-btn{padding:.2rem .5rem;border-radius:5px;border:1px solid rgba(99,102,241,.25);background:rgba(99,102,241,.07);color:#a5b4fc;font-size:.65rem;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:.15s;font-family:inherit}
.coi-pessoa-btn:hover{background:rgba(99,102,241,.2)}
/* Ações */
.coi-acao{display:flex;align-items:center;gap:.6rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.coi-acao:last-child{border:none}
.coi-acao-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.coi-acao-txt{flex:1;font-size:.78rem;color:#e2e8f0}
.coi-acao-bar{width:50px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;flex-shrink:0}
.coi-acao-fill{height:100%;border-radius:2px}
.coi-acao-num{font-size:.68rem;color:#94a3b8;font-weight:700;min-width:22px;text-align:right;flex-shrink:0}
/* Insights */
.coi-insight{display:flex;align-items:flex-start;gap:.6rem;padding:.65rem;border-radius:9px;font-size:.77rem;color:#94a3b8;line-height:1.5;margin-bottom:.35rem}
.coi-insight-ico{font-size:.9rem;flex-shrink:0;margin-top:.05rem}
.coi-insight-txt strong{color:#e2e8f0}
/* Compare */
.coi-compare{background:rgba(255,255,255,.02);border-radius:10px;padding:.75rem;margin-top:.25rem}
.coi-compare-title{font-size:.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.6rem}
.coi-cmp-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;font-size:.72rem}
.coi-cmp-l{width:80px;color:#94a3b8;flex-shrink:0}
.coi-cmp-bar{flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;position:relative}
.coi-cmp-fill{height:100%;border-radius:2px;transition:width 1s}
.coi-cmp-val{min-width:36px;text-align:right;font-weight:700;flex-shrink:0}
.coi-cmp-ref{min-width:55px;text-align:right;color:#475569;flex-shrink:0}
</style>
`;

  // Event listeners do chat
  document.getElementById('coi-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') _coiEnviar();
  });
}

// ── Chat do copiloto ──────────────────────────────────────────

function _coiPerguntar(el) {
  const pergunta = el.textContent || el.dataset?.q;
  if (pergunta) {
    const inp = document.getElementById('coi-input');
    if (inp) { inp.value = pergunta; _coiEnviar(); }
  }
}

function _coiEnviar() {
  const inp = document.getElementById('coi-input');
  const msgs= document.getElementById('coi-messages');
  if (!inp || !msgs) return;

  const pergunta = inp.value.trim();
  if (!pergunta) return;

  // Adiciona mensagem do usuário
  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const iniciais = (userData.nome || 'G').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  msgs.innerHTML += `
    <div class="coi-msg coi-msg--user">
      <div class="coi-msg-avatar" style="background:rgba(16,185,129,.3)">${iniciais}</div>
      <div class="coi-msg-bubble">${pergunta}</div>
    </div>`;

  // Indicador de digitação
  const typingId = 'coi-typing-' + Date.now();
  msgs.innerHTML += `<div class="coi-msg" id="${typingId}">
    <div class="coi-msg-avatar">🤖</div>
    <div class="coi-msg-bubble" style="padding:.5rem .9rem">
      <span style="display:inline-flex;gap:3px">
        <span style="width:5px;height:5px;border-radius:50%;background:#6366f1;animation:icType .8s infinite"></span>
        <span style="width:5px;height:5px;border-radius:50%;background:#6366f1;animation:icType .8s .15s infinite"></span>
        <span style="width:5px;height:5px;border-radius:50%;background:#6366f1;animation:icType .8s .3s infinite"></span>
      </span>
    </div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;
  inp.value = '';

  setTimeout(async () => {
    const typing = document.getElementById(typingId);
    let resposta = _respostaGestor(pergunta);

    try {
      if (window.Api?.hasToken?.()) {
        const data = await Api.post('/api/v1/inteligencia/ia/consultar/', { pergunta, categoria: 'lideranca' });
        if (data?.sucesso && data.resposta) resposta = data.resposta;
      }
    } catch { /* usa fallback local */ }

    if (typing) typing.remove();
    msgs.innerHTML += `
      <div class="coi-msg">
        <div class="coi-msg-avatar">🤖</div>
        <div class="coi-msg-bubble">${resposta.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</div>
      </div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 1000 + Math.random() * 500);
}

function _respostaGestor(p) {
  const q = p.toLowerCase();
  if (q.includes('turnover') || q.includes('alto') || q.includes('saída')) {
    return '📊 **Análise do turnover da sua equipe:**\n\nO Comercial tem 7.1% — 3.5× a média da empresa. Nas últimas 4 saídas, 3 colaboradores citaram na entrevista de desligamento: "pressão excessiva", "falta de feedback" e "ausência de reconhecimento".\n\n**O que fazer:**\n• 1:1 semanal com cada pessoa\n• Reunião de reconhecimento quinzenal\n• Revisar distribuição de metas';
  }
  if (q.includes('engajamento') || q.includes('melhorar')) {
    return '⚡ **Plano de engajamento para o Comercial:**\n\nEngajamento atual: 61% (meta: 75%). As 3 alavancas mais eficazes para sua equipe são:\n\n1. **Reconhecimento** — citar publicamente conquistas pequenas (+12% engajamento)\n2. **Clareza de metas** — revisar OKRs mensalmente\n3. **Autonomia** — dar decisões às pessoas dentro de suas alçadas';
  }
  if (q.includes('atenção') || q.includes('urgente') || q.includes('precisa')) {
    return '🔴 **Prioridade máxima — Diego Nunes:**\n\nScore de risco: **81/100**. Indicadores:\n• 8 meses sem promoção ou aumento\n• Aumento de 30% nas faltas no último mês\n• Última avaliação: 7.2 (queda de 1.8 pontos)\n\n**Ação imediata:** Agendar 1:1 ainda esta semana. Perguntar sobre expectativas de carreira e carga de trabalho. Não mencione os dados — deixe a conversa fluir.';
  }
  if (q.includes('meta') || q.includes('resultado')) {
    return '📈 **Análise de metas — Comercial:**\n\nEquipe em **78%** da meta de Maio. Para fechar o mês:\n• 22% ainda precisa ser realizado em 8 dias úteis\n• Beatriz F. está 40% abaixo da sua meta individual\n• Sugestão: foco nos clientes quentes em carteira (top 20 contatos)';
  }
  if (q.includes('gestor') || q.includes('melhor') || q.includes('liderança')) {
    return '💡 **Como crescer como gestor:**\n\nSeu maior diferencial apontado pela equipe: **resolução de problemas rápida**. Pontos de desenvolvimento:\n\n1. **Feedback estruturado** — use o modelo SBI (Situação, Comportamento, Impacto)\n2. **Delegação consciente** — 2 pessoas na equipe pedem mais autonomia\n3. **Inteligência emocional** — reconhecer sinais de burnout antes de se tornarem críticos';
  }
  return `🤖 **Analisando "${p}"...**\n\nCom base nos dados da equipe ${Math.random() > .5 ? 'Comercial' : ''}, identifiquei que o principal fator de atenção é a combinação de **alta pressão + baixo reconhecimento**. Isso está impactando diretamente o engajamento (61%) e o turnover (7.1%). Quer que eu elabore um plano de ação específico?`;
}
