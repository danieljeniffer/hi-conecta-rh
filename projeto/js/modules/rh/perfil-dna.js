/**
 * perfil-dna.js — Perfil Corporativo DNA (LinkedIn Interno)
 * hi Conecta RH · Human Experience Operating System
 *
 * O perfil profissional mais completo já criado para RH interno:
 *  - DNA Profissional com 9 dimensões comportamentais
 *  - Evolução profissional animada (linha do tempo)
 *  - Skills com nível e validações por pares
 *  - Scores de Liderança · Colaboração · Inovação
 *  - Conquistas e badges
 *  - Reputação interna (eNPS pessoal)
 *  - Histórico de crescimento e marcos
 */

// ── Engine do perfil DNA ──────────────────────────────────────

const ProfileDNA = {

  // Dimensões comportamentais (9D)
  dimensoes9D: [
    { id:'lideranca',    label:'Liderança',           score:82, descricao:'Inspira e orienta pessoas',    icone:'👑', cor:'#6366f1' },
    { id:'colaboracao',  label:'Colaboração',          score:91, descricao:'Trabalha em equipe com sinergia', icone:'🤝', cor:'#10b981' },
    { id:'inovacao',     label:'Inovação',             score:68, descricao:'Propõe novas soluções',       icone:'💡', cor:'#f59e0b' },
    { id:'comunicacao',  label:'Comunicação',          score:85, descricao:'Clareza e influência verbal', icone:'🗣️', cor:'#06b6d4' },
    { id:'adaptacao',    label:'Adaptabilidade',       score:77, descricao:'Resiliente a mudanças',       icone:'🔄', cor:'#8b5cf6' },
    { id:'aprendizado',  label:'Velocidade Aprend.',   score:88, descricao:'Absorção rápida de conteúdo', icone:'🚀', cor:'#ec4899' },
    { id:'pressao',      label:'Resist. à Pressão',   score:74, descricao:'Mantém foco sob estresse',    icone:'⚖️', cor:'#a78bfa' },
    { id:'criatividade', label:'Criatividade',         score:71, descricao:'Pensamento divergente',       icone:'🎨', cor:'#f97316' },
    { id:'emocional',    label:'Intelig. Emocional',  score:84, descricao:'Empatia e autogestão',        icone:'🧠', cor:'#14b8a6' },
  ],

  // Skills técnicas e comportamentais
  skills: [
    { nome:'Microsoft Excel',         nivel:4, categoria:'ferramenta',     validadores:8  },
    { nome:'Power BI',                nivel:3, categoria:'ferramenta',     validadores:5  },
    { nome:'Recrutamento',            nivel:5, categoria:'tecnica',         validadores:12 },
    { nome:'Legislação Trabalhista',  nivel:4, categoria:'tecnica',         validadores:9  },
    { nome:'Comunicação Assertiva',   nivel:5, categoria:'comportamental',  validadores:14 },
    { nome:'Gestão de Conflitos',     nivel:3, categoria:'comportamental',  validadores:6  },
    { nome:'People Analytics',        nivel:3, categoria:'tecnica',         validadores:4  },
    { nome:'Liderança Situacional',   nivel:4, categoria:'comportamental',  validadores:7  },
  ],

  // Evolução profissional
  evolucao: [
    { ano:'2020', cargo:'Assistente RH',    empresa:'Empresa ABC',   marco:false },
    { ano:'2021', cargo:'Analista RH Jr.',  empresa:'Empresa ABC',   marco:true,  evento:'Promoção' },
    { ano:'2022', cargo:'Analista RH Pl.',  empresa:'hi Conecta',    marco:true,  evento:'Nova empresa' },
    { ano:'2023', cargo:'Analista RH Sr.',  empresa:'hi Conecta',    marco:true,  evento:'Promoção' },
    { ano:'2024', cargo:'Coord. de RH',    empresa:'hi Conecta',    marco:true,  evento:'Promoção' },
    { ano:'hoje', cargo:'Coord. de RH',    empresa:'hi Conecta',    marco:false  },
  ],

  // Badges e conquistas
  badges: [
    { icone:'🏆', label:'Destaque Q1 2024',  cor:'#f59e0b', data:'Mar/24' },
    { icone:'🌟', label:'Mentor do Ano',      cor:'#6366f1', data:'Dez/23' },
    { icone:'🚀', label:'Top Performer',      cor:'#10b981', data:'Jun/24' },
    { icone:'❤️', label:'Cultura em Ação',   cor:'#ec4899', data:'Abr/24' },
    { icone:'📊', label:'Data Champion',      cor:'#06b6d4', data:'Fev/24' },
    { icone:'💡', label:'Inovação Prática',   cor:'#f97316', data:'Jan/24' },
  ],

  // Reputação interna
  reputacao: {
    nps_pessoal:  78,   // quanto as pessoas gostam de trabalhar com este colaborador
    reconhecimentos_recebidos: 23,
    reconhecimentos_dados:     31,
    feedbacks_recebidos:       18,
    pontuacao_gamificacao:    1847,
    posicao_ranking:           4,
  },
};

// ── Render principal ──────────────────────────────────────────

function renderPerfilDNA() {
  const pc = document.getElementById('pageContainer');
  if (!pc) return;

  const userData = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const nome  = userData.nome  || 'Mariana Costa Rodrigues';
  const cargo = userData.cargo || 'Coordenadora de RH';
  const setor = userData.setor || 'Recursos Humanos';
  const iniciais = nome.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();

  const D = ProfileDNA;
  const scoreGeral = Math.round(D.dimensoes9D.reduce((a,d)=>a+d.score,0)/D.dimensoes9D.length);

  pc.innerHTML = `
<div class="pd-root">

  <!-- Header do perfil -->
  <div class="pd-hero">
    <div class="pd-hero-bg"></div>
    <div class="pd-hero-content">
      <div class="pd-avatar-wrap">
        <div class="pd-avatar">${iniciais}</div>
        <div class="pd-avatar-ring"></div>
        <div class="pd-status-dot"></div>
      </div>
      <div class="pd-identity">
        <h1 class="pd-nome">${nome}</h1>
        <div class="pd-cargo">${cargo}</div>
        <div class="pd-setor">📍 ${setor} · 4 anos de empresa</div>
        <div class="pd-tags">
          <span class="pd-tag pd-tag--blue">Analítica</span>
          <span class="pd-tag pd-tag--green">Colaborativa</span>
          <span class="pd-tag pd-tag--purple">Mentora</span>
        </div>
      </div>
      <div class="pd-scores-hero">
        <div class="pd-score-circle" style="--sc:#6366f1">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(99,102,241,.15)" stroke-width="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" stroke-width="6"
              stroke-dasharray="${2*Math.PI*34*(scoreGeral/100)} ${2*Math.PI*34}"
              stroke-linecap="round" transform="rotate(-90 40 40)"/>
          </svg>
          <div class="pd-sc-inner"><div class="pd-sc-v">${scoreGeral}</div><div class="pd-sc-l">DNA</div></div>
        </div>
        <div class="pd-hero-kpis">
          <div class="pd-hkpi"><div class="pd-hkpi-v" style="color:#f59e0b">${D.reputacao.nps_pessoal}</div><div class="pd-hkpi-l">NPS Pessoal</div></div>
          <div class="pd-hkpi"><div class="pd-hkpi-v" style="color:#10b981">${D.reputacao.reconhecimentos_recebidos}</div><div class="pd-hkpi-l">Reconhecimentos</div></div>
          <div class="pd-hkpi"><div class="pd-hkpi-v" style="color:#6366f1">#${D.reputacao.posicao_ranking}</div><div class="pd-hkpi-l">Ranking</div></div>
          <div class="pd-hkpi"><div class="pd-hkpi-v" style="color:#a78bfa">${D.reputacao.pontuacao_gamificacao}</div><div class="pd-hkpi-l">Pontos</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Grid principal -->
  <div class="pd-main-grid">

    <!-- Coluna esquerda -->
    <div class="pd-col">

      <!-- DNA 9D -->
      <div class="pd-card">
        <div class="pd-card-title">🧬 DNA Profissional — 9 Dimensões</div>
        <div class="pd-dna9d">
          ${D.dimensoes9D.map(d => `
            <div class="pd-dim">
              <div class="pd-dim-ico">${d.icone}</div>
              <div class="pd-dim-info">
                <div class="pd-dim-nome" title="${d.descricao}">${d.label}</div>
                <div class="pd-dim-bar"><div class="pd-dim-fill" style="width:${d.score}%;background:${d.cor}"></div></div>
              </div>
              <div class="pd-dim-val" style="color:${d.cor}">${d.score}</div>
              <div class="pd-dim-level">${d.score>=85?'Expert':d.score>=70?'Avançado':d.score>=55?'Pleno':'Dev.'}</div>
            </div>`).join('')}
        </div>
        <div class="pd-dna-insight">
          💡 Seus pontos mais fortes são <strong>Colaboração (91)</strong> e <strong>Velocidade de Aprendizado (88)</strong>.
          Área de desenvolvimento: <strong>Inovação (68)</strong> — considere o PDI de criatividade aplicada.
        </div>
      </div>

      <!-- Evolução profissional -->
      <div class="pd-card">
        <div class="pd-card-title">📈 Evolução Profissional</div>
        <div class="pd-timeline">
          ${D.evolucao.map((e, i) => `
            <div class="pd-tl-item ${e.marco ? 'pd-tl-item--marco' : ''}">
              <div class="pd-tl-dot ${e.marco ? 'pd-tl-dot--marco' : ''}"></div>
              ${i < D.evolucao.length-1 ? '<div class="pd-tl-line"></div>' : ''}
              <div class="pd-tl-content">
                <div class="pd-tl-ano">${e.ano}</div>
                <div class="pd-tl-cargo">${e.cargo}</div>
                <div class="pd-tl-empresa">${e.empresa}</div>
                ${e.marco ? `<span class="pd-tl-badge">🚀 ${e.evento}</span>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>

    </div>

    <!-- Coluna direita -->
    <div class="pd-col">

      <!-- Badges e conquistas -->
      <div class="pd-card">
        <div class="pd-card-title">🏆 Conquistas & Badges</div>
        <div class="pd-badges">
          ${D.badges.map(b => `
            <div class="pd-badge" style="background:${b.cor}12;border-color:${b.cor}25">
              <div class="pd-badge-ico" style="background:${b.cor}20;color:${b.cor}">${b.icone}</div>
              <div class="pd-badge-info">
                <div class="pd-badge-label">${b.label}</div>
                <div class="pd-badge-data">${b.data}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Skills -->
      <div class="pd-card">
        <div class="pd-card-title">⚙️ Skills & Competências</div>
        <div class="pd-skills">
          ${D.skills.map(s => {
            const catCor = { ferramenta:'#06b6d4', tecnica:'#6366f1', comportamental:'#10b981' }[s.categoria];
            const estrelas = '★'.repeat(s.nivel) + '☆'.repeat(5-s.nivel);
            return `<div class="pd-skill">
              <div class="pd-skill-info">
                <div class="pd-skill-nome">${s.nome}</div>
                <div class="pd-skill-cat" style="color:${catCor}">${s.categoria}</div>
              </div>
              <div class="pd-skill-stars" style="color:#f59e0b;font-size:.75rem">${estrelas}</div>
              <div class="pd-skill-valid">${s.validadores} ✓</div>
            </div>`;
          }).join('')}
        </div>
        <button class="pd-btn-skill">+ Adicionar skill</button>
      </div>

      <!-- Reputação interna -->
      <div class="pd-card">
        <div class="pd-card-title">🌟 Reputação Interna</div>
        <div class="pd-rep-grid">
          ${[
            ['NPS Pessoal', D.reputacao.nps_pessoal, '#f59e0b', 'Como as pessoas avaliam trabalhar com você'],
            ['Feedbacks dados', D.reputacao.reconhecimentos_dados, '#10b981', 'Você é generoso com reconhecimentos'],
            ['Feedbacks recebidos', D.reputacao.feedbacks_recebidos, '#6366f1', 'Feedbacks que você recebeu'],
          ].map(([l,v,c,d]) => `
            <div class="pd-rep-item" style="border-color:${c}20">
              <div class="pd-rep-val" style="color:${c}">${v}</div>
              <div class="pd-rep-label">${l}</div>
              <div class="pd-rep-desc">${d}</div>
            </div>`).join('')}
        </div>
      </div>

    </div>
  </div>
</div>

<style>
.pd-root{padding:0 0 2rem;max-width:1200px;margin:0 auto;font-family:var(--font,'Plus Jakarta Sans',sans-serif)}
/* Hero */
.pd-hero{border-radius:20px;overflow:hidden;margin-bottom:1.25rem;position:relative;background:rgba(10,15,30,.95);border:1px solid rgba(255,255,255,.07)}
.pd-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.06),transparent);pointer-events:none}
.pd-hero-content{position:relative;padding:1.75rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap}
/* Avatar */
.pd-avatar-wrap{position:relative;flex-shrink:0}
.pd-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:#fff}
.pd-avatar-ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid #6366f1;opacity:.4;animation:spin 8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.pd-status-dot{position:absolute;bottom:4px;right:4px;width:14px;height:14px;border-radius:50%;background:#10b981;border:2px solid #0a0f1e}
/* Identity */
.pd-identity{flex:1;min-width:0}
.pd-nome{font-size:1.4rem;font-weight:900;color:#f1f5f9;margin-bottom:.2rem}
.pd-cargo{font-size:.88rem;color:#94a3b8;font-weight:600;margin-bottom:.2rem}
.pd-setor{font-size:.78rem;color:#64748b;margin-bottom:.6rem}
.pd-tags{display:flex;gap:.4rem;flex-wrap:wrap}
.pd-tag{padding:.2rem .65rem;border-radius:999px;font-size:.7rem;font-weight:700;border:1px solid}
.pd-tag--blue{background:rgba(99,102,241,.12);color:#a5b4fc;border-color:rgba(99,102,241,.25)}
.pd-tag--green{background:rgba(16,185,129,.12);color:#6ee7b7;border-color:rgba(16,185,129,.25)}
.pd-tag--purple{background:rgba(139,92,246,.12);color:#c4b5fd;border-color:rgba(139,92,246,.25)}
/* Score circle */
.pd-scores-hero{display:flex;align-items:center;gap:1.25rem;flex-shrink:0}
.pd-score-circle{position:relative;flex-shrink:0}
.pd-sc-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pd-sc-v{font-size:1.2rem;font-weight:900;color:#a5b4fc;line-height:1}
.pd-sc-l{font-size:.55rem;color:#64748b;font-weight:700}
.pd-hero-kpis{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.pd-hkpi{padding:.4rem .6rem;background:rgba(255,255,255,.03);border-radius:8px;border:1px solid rgba(255,255,255,.05);text-align:center}
.pd-hkpi-v{font-size:1rem;font-weight:900;line-height:1}
.pd-hkpi-l{font-size:.6rem;color:#64748b;font-weight:600;text-transform:uppercase}
/* Grid */
.pd-main-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:1rem}
@media(max-width:900px){.pd-main-grid{grid-template-columns:1fr}}
.pd-col{display:flex;flex-direction:column;gap:1rem}
.pd-card{background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.1rem;display:flex;flex-direction:column;gap:.875rem}
.pd-card-title{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em}
/* DNA 9D */
.pd-dna9d{display:flex;flex-direction:column;gap:.45rem}
.pd-dim{display:flex;align-items:center;gap:.6rem}
.pd-dim-ico{font-size:.85rem;width:22px;text-align:center;flex-shrink:0}
.pd-dim-info{flex:1;min-width:0}
.pd-dim-nome{font-size:.72rem;color:#94a3b8;margin-bottom:.15rem;cursor:default}
.pd-dim-bar{height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden}
.pd-dim-fill{height:100%;border-radius:3px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}
.pd-dim-val{width:26px;text-align:right;font-size:.75rem;font-weight:700;flex-shrink:0}
.pd-dim-level{width:52px;text-align:right;font-size:.62rem;color:#475569;flex-shrink:0}
.pd-dna-insight{font-size:.76rem;color:#94a3b8;padding:.6rem .75rem;background:rgba(99,102,241,.05);border-radius:8px;line-height:1.5;border-left:2px solid rgba(99,102,241,.3)}
/* Timeline */
.pd-timeline{display:flex;flex-direction:column;gap:0}
.pd-tl-item{display:flex;gap:.75rem;position:relative}
.pd-tl-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.15);flex-shrink:0;margin-top:.3rem}
.pd-tl-dot--marco{background:#6366f1;border-color:#6366f1;box-shadow:0 0 8px rgba(99,102,241,.4)}
.pd-tl-line{position:absolute;left:4px;top:16px;bottom:-12px;width:2px;background:rgba(255,255,255,.06)}
.pd-tl-content{padding-bottom:.875rem;flex:1}
.pd-tl-ano{font-size:.65rem;color:#475569;font-weight:600}
.pd-tl-cargo{font-size:.82rem;font-weight:700;color:#e2e8f0}
.pd-tl-empresa{font-size:.72rem;color:#64748b}
.pd-tl-badge{display:inline-block;margin-top:.25rem;padding:.15rem .5rem;border-radius:999px;font-size:.65rem;font-weight:700;background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.25)}
/* Badges */
.pd-badges{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.pd-badge{display:flex;align-items:center;gap:.6rem;padding:.6rem .7rem;border-radius:10px;border:1px solid}
.pd-badge-ico{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0}
.pd-badge-label{font-size:.75rem;font-weight:600;color:#e2e8f0}
.pd-badge-data{font-size:.62rem;color:#64748b}
/* Skills */
.pd-skills{display:flex;flex-direction:column;gap:.4rem}
.pd-skill{display:flex;align-items:center;gap:.6rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
.pd-skill:last-child{border:none}
.pd-skill-info{flex:1;min-width:0}
.pd-skill-nome{font-size:.78rem;font-weight:600;color:#e2e8f0}
.pd-skill-cat{font-size:.64rem;text-transform:capitalize}
.pd-skill-stars{letter-spacing:-.05em;flex-shrink:0}
.pd-skill-valid{font-size:.65rem;color:#475569;min-width:32px;text-align:right;flex-shrink:0}
.pd-btn-skill{margin-top:.25rem;padding:.4rem .75rem;border-radius:8px;border:1px dashed rgba(99,102,241,.3);background:none;color:#6366f1;font-size:.75rem;cursor:pointer;transition:.15s;font-family:inherit}
.pd-btn-skill:hover{background:rgba(99,102,241,.08)}
/* Reputação */
.pd-rep-grid{display:flex;flex-direction:column;gap:.5rem}
.pd-rep-item{padding:.75rem;border-radius:10px;background:rgba(255,255,255,.02);border:1px solid}
.pd-rep-val{font-size:1.3rem;font-weight:900;line-height:1;margin-bottom:.15rem}
.pd-rep-label{font-size:.75rem;font-weight:700;color:#e2e8f0;margin-bottom:.1rem}
.pd-rep-desc{font-size:.68rem;color:#64748b;line-height:1.4}
</style>
`;
}
