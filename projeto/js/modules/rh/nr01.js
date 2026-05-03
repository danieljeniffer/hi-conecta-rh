// =============================================
// NR-01 — NORMA REGULAMENTADORA N.º 1
// Programa de Gerenciamento de Riscos (PGR)
// 3 Dashboards: rh | gestor | colab
// =============================================

const nr01Data = {
  empresa: {
    pgrVigencia:    'Janeiro/2025 — Dezembro/2025',
    pgrStatus:      'Vigente',
    proximaRevisao: '30/11/2025',
    responsavel:    'Roberta Lima — SESMT',
    cipa:           true,
    totalRiscos:    18,
    riscosControle: 14,
    naoConformidades: 2,
    treinadosPct:   87,
  },

  riscos: [
    { id:1, tipo:'Psicossocial', descricao:'Sobrecarga de trabalho — Equipe Comercial', nivel:'alto',   depto:'Comercial',  status:'Monitorando',  medida:'Revisão da carga horária e reuniões 1:1 semanais' },
    { id:2, tipo:'Ergonômico',   descricao:'Postura inadequada — estações de trabalho', nivel:'medio',  depto:'TI',         status:'Controlado',   medida:'Ajuste de mesas e fornecimento de apoio para pés' },
    { id:3, tipo:'Físico',       descricao:'Ruído elevado — setor de expedição',        nivel:'alto',   depto:'Operações',  status:'Em tratamento',medida:'EPIs auditivos obrigatórios e barreiras acústicas' },
    { id:4, tipo:'Psicossocial', descricao:'Conflitos interpessoais — Financeiro',      nivel:'medio',  depto:'Financeiro', status:'Monitorando',  medida:'Treinamento de comunicação não-violenta' },
    { id:5, tipo:'Químico',      descricao:'Exposição a produtos de limpeza',           nivel:'baixo',  depto:'Operações',  status:'Controlado',   medida:'EPI e ficha de segurança disponíveis' },
    { id:6, tipo:'Acidente',     descricao:'Piso escorregadio — corredor logístico',    nivel:'medio',  depto:'Operações',  status:'Controlado',   medida:'Piso antiderrapante e sinalização instalados' },
    { id:7, tipo:'Psicossocial', descricao:'Assédio moral — denúncia em apuração',      nivel:'critico',depto:'Comercial',  status:'Em apuração',  medida:'Comissão de investigação formada — 30 dias' },
    { id:8, tipo:'Ergonômico',   descricao:'Levantamento de peso irregular — estoque',  nivel:'medio',  depto:'Logística',  status:'Controlado',   medida:'Treinamento de ergonomia e uso de equipamentos' },
  ],

  acoes: [
    { acao:'Revisão do PGR Psicossocial (NR-01/2024)',   prazo:'30/06/2025', resp:'Roberta Lima', status:'Em andamento', prioridade:'alta'  },
    { acao:'Treinamento NR-01 — novos colaboradores',    prazo:'15/06/2025', resp:'Ana Paula',    status:'Pendente',     prioridade:'alta'  },
    { acao:'Auditoria interna SESMT',                    prazo:'30/07/2025', resp:'SESMT',        status:'Agendada',     prioridade:'media' },
    { acao:'Atualização PCMSO 2025',                     prazo:'01/08/2025', resp:'Medicina Trab.',status:'Pendente',    prioridade:'alta'  },
    { acao:'Mapeamento de riscos — área de TI',          prazo:'20/06/2025', resp:'Felipe Rocha', status:'Em andamento', prioridade:'media' },
    { acao:'CIPA — eleição e posse',                     prazo:'01/07/2025', resp:'RH',           status:'Agendada',     prioridade:'media' },
  ],

  alertasGestor: {
    Comercial: [
      { tipo:'critico', msg:'Risco psicossocial crítico identificado — assédio moral em apuração',     link:'nr01' },
      { tipo:'alto',    msg:'Sobrecarga detectada em 3 colaboradores — ação preventiva necessária',     link:'nr01' },
      { tipo:'info',    msg:'Treinamento NR-01 pendente para 2 membros da equipe',                     link:'desenvolvimento' },
    ],
    RH:       [
      { tipo:'info',    msg:'PGR em vigência — próxima revisão: 30/11/2025',                           link:'nr01' },
      { tipo:'alto',    msg:'2 não conformidades pendentes de resolução',                               link:'nr01' },
    ],
    TI:       [
      { tipo:'medio',   msg:'Risco ergonômico identificado — mapeamento em andamento',                 link:'nr01' },
      { tipo:'info',    msg:'1 colaborador pendente de treinamento NR-01',                              link:'desenvolvimento' },
    ],
    Financeiro:[
      { tipo:'medio',   msg:'Conflito interpessoal monitorado — acompanhamento em curso',              link:'nr01' },
    ],
    Operações: [
      { tipo:'alto',    msg:'Risco físico (ruído) — uso de EPI obrigatório e monitorado',              link:'nr01' },
      { tipo:'info',    msg:'Verificar checklist mensal de segurança',                                  link:'nr01' },
    ],
  },

  historico: [
    { data:'15/05/2025', evento:'Auditoria SESMT concluída — 2 não conformidades identificadas',              autor:'Roberta Lima' },
    { data:'01/04/2025', evento:'PGR revisado e aprovado — vigência até dez/2025',                            autor:'Diretoria'    },
    { data:'10/03/2025', evento:'Treinamento NR-01 realizado — 28 colaboradores certificados',                autor:'Ana Paula'    },
    { data:'01/01/2025', evento:'PGR 2025 aprovado pela diretoria e SESMT',                                   autor:'Diretoria'    },
    { data:'15/11/2024', evento:'Atualização NR-01 publicada pelo MTE — riscos psicossociais incluídos',      autor:'MTE'          },
  ],

  direitos: [
    { icon:'🛡️', titulo:'Proteção contra riscos',     desc:'Direito a ambiente de trabalho seguro e saudável, com riscos identificados e controlados.'   },
    { icon:'📋', titulo:'Informação clara',           desc:'Ser informado sobre os riscos do seu posto de trabalho e as medidas de proteção adotadas.'    },
    { icon:'🎓', titulo:'Treinamento obrigatório',    desc:'Receber treinamento sobre NR-01 e demais normas aplicáveis à sua função, com certificação.'   },
    { icon:'📢', titulo:'Denúncia protegida',         desc:'Denunciar irregularidades de segurança sem medo de represálias. A ouvidoria é confidencial.'  },
    { icon:'🏥', titulo:'Saúde ocupacional',          desc:'Realizar exames médicos periódicos conforme PCMSO e ter acesso ao programa de saúde.'         },
    { icon:'🤝', titulo:'CIPA — representação',       desc:'Participar ou votar na eleição da CIPA — Comissão Interna de Prevenção de Acidentes.'         },
  ],
};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL — detecta perfil
// ─────────────────────────────────────────────
function renderNr01() {
  const u = JSON.parse(sessionStorage.getItem('hiRH_user') || '{}');
  const p = u.perfil || 'colab';
  if (p === 'rh')     return renderNr01ADM(u);
  if (p === 'gestor') return renderNr01Gestor(u);
  return renderNr01Colab(u);
}

function initPage_nr01() {}

// Helpers
function nivelCor(nivel) {
  return { critico:'#7f1d1d', alto:'#dc2626', medio:'#d97706', baixo:'#16a34a' }[nivel] || '#6b7280';
}
function nivelBg(nivel) {
  return { critico:'#fef2f2', alto:'#fef2f2', medio:'#fffbeb', baixo:'#f0fdf4' }[nivel] || '#f8fafc';
}
function nivelLabel(nivel) {
  return { critico:'🔴 Crítico', alto:'🟠 Alto', medio:'🟡 Médio', baixo:'🟢 Baixo' }[nivel] || nivel;
}
function statusCor(st) {
  return { 'Controlado':'pago','Monitorando':'pendente','Em tratamento':'pendente','Em apuração':'inativo','Agendada':'pendente','Em andamento':'pendente','Pendente':'inativo','Vigente':'pago' }[st] || 'pendente';
}

// ─────────────────────────────────────────────
// DASHBOARD ADM
// ─────────────────────────────────────────────
function renderNr01ADM(u) {
  const d = nr01Data;
  const criticos = d.riscos.filter(r => r.nivel === 'critico').length;
  const altos    = d.riscos.filter(r => r.nivel === 'alto').length;
  const medios   = d.riscos.filter(r => r.nivel === 'medio').length;
  const baixos   = d.riscos.filter(r => r.nivel === 'baixo').length;
  const pgrOk    = d.empresa.pgrStatus === 'Vigente';

  return `
  <div class="depto-page">

    <!-- BANNER ADM -->
    <div class="nr01-banner adm">
      <div class="nr01-banner-left">
        <div class="nr01-banner-icon">⚖️</div>
        <div>
          <div class="nr01-badge">👑 Administrador — Visão Completa</div>
          <h2>NR-01 — Gerenciamento de Riscos Ocupacionais</h2>
          <p>PGR vigente · Responsável: ${d.empresa.responsavel} · Revisão: ${d.empresa.proximaRevisao}</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <span class="badge-status pago" style="font-size:13px;padding:6px 16px">${pgrOk?'✅ PGR Vigente':'⚠️ PGR Pendente'}</span>
        <button class="link-btn" style="color:white;opacity:.8" onclick="nr01ExportarRelatorio()">⬇ Exportar Relatório</button>
      </div>
    </div>

    <!-- KPIs GERAIS -->
    <div class="depto-cards">
      <div class="depto-card" style="border-left:4px solid #dc2626">
        <div class="depto-card-icon">⚠️</div>
        <div class="depto-card-info"><strong>${d.empresa.totalRiscos}</strong><span>Riscos mapeados</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #7f1d1d">
        <div class="depto-card-icon">🔴</div>
        <div class="depto-card-info"><strong>${criticos + altos}</strong><span>Riscos críticos/altos</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #d97706">
        <div class="depto-card-icon">🛡️</div>
        <div class="depto-card-info"><strong>${d.empresa.riscosControle}</strong><span>Riscos sob controle</span></div>
      </div>
      <div class="depto-card" style="border-left:4px solid #dc2626">
        <div class="depto-card-icon">🚨</div>
        <div class="depto-card-info"><strong>${d.empresa.naoConformidades}</strong><span>Não conformidades</span></div>
      </div>
      <div class="depto-card destaque">
        <div class="depto-card-icon">🎓</div>
        <div class="depto-card-info"><strong>${d.empresa.treinadosPct}%</strong><span>Colaboradores treinados</span></div>
      </div>
    </div>

    <!-- GRID PRINCIPAL -->
    <div class="ind-grid">

      <!-- MATRIZ DE RISCOS -->
      <div class="depto-section">
        <div class="section-header"><h3>🗺️ Matriz de Riscos — Atual</h3><button class="link-btn" onclick="nr01FiltrarRiscos()">Filtrar</button></div>
        <div class="nr01-matriz">
          ${[{nivel:'critico',lista:d.riscos.filter(r=>r.nivel==='critico')},{nivel:'alto',lista:d.riscos.filter(r=>r.nivel==='alto')},{nivel:'medio',lista:d.riscos.filter(r=>r.nivel==='medio')},{nivel:'baixo',lista:d.riscos.filter(r=>r.nivel==='baixo')}].map(g=>`
            <div class="nr01-risco-grupo" style="border-left:3px solid ${nivelCor(g.nivel)}">
              <div class="nr01-risco-nivel" style="color:${nivelCor(g.nivel)}">${nivelLabel(g.nivel)} (${g.lista.length})</div>
              ${g.lista.map(r=>`
                <div class="nr01-risco-item" style="background:${nivelBg(r.nivel)}">
                  <div class="nr01-risco-top">
                    <span class="nr01-tipo-tag" style="background:${nivelCor(r.nivel)}20;color:${nivelCor(r.nivel)}">${r.tipo}</span>
                    <span class="badge-status ${statusCor(r.status)}">${r.status}</span>
                  </div>
                  <strong style="font-size:12px;display:block;margin:4px 0">${r.descricao}</strong>
                  <small style="color:var(--text-muted)">🏢 ${r.depto}</small>
                  <div class="nr01-medida">💡 ${r.medida}</div>
                  <button class="link-btn" style="margin-top:6px;font-size:11px" onclick="nr01DetalheRisco(${r.id})">📋 Detalhes</button>
                </div>
              `).join('')}
              ${g.lista.length===0?`<div style="padding:10px;font-size:12px;color:var(--text-muted)">Nenhum risco neste nível.</div>`:''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PLANO DE AÇÃO -->
      <div class="depto-section">
        <div class="section-header">
          <h3>📋 Plano de Ação PGR</h3>
          <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="nr01NovaAcao()">+ Nova Ação</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${d.acoes.map((a,i)=>`
            <div class="nr01-acao-item" style="border-left:3px solid ${a.prioridade==='alta'?'#dc2626':a.prioridade==='media'?'#d97706':'#16a34a'}">
              <div style="flex:1;min-width:0">
                <strong style="font-size:12px;display:block">${a.acao}</strong>
                <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap">
                  <small style="color:var(--text-muted)">📅 Prazo: ${a.prazo}</small>
                  <small style="color:var(--text-muted)">👤 ${a.resp}</small>
                </div>
              </div>
              <span class="badge-status ${statusCor(a.status)}">${a.status}</span>
              <button class="link-btn" style="font-size:11px" onclick="nr01ConcluirAcao(${i})">✓</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- DISTRIBUIÇÃO POR TIPO -->
      <div class="depto-section">
        <div class="section-header"><h3>📊 Riscos por Tipo</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
          ${['Psicossocial','Ergonômico','Físico','Químico','Acidente'].map(tipo=>{
            const count = d.riscos.filter(r=>r.tipo===tipo).length;
            const pct   = Math.round((count/d.riscos.length)*100);
            const cor   = {Psicossocial:'#7c3aed',Ergonômico:'#2563eb',Físico:'#d97706',Químico:'#dc2626',Acidente:'#ea580c'}[tipo]||'#6b7280';
            return `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                <span style="font-weight:600">${tipo}</span>
                <span style="color:${cor};font-weight:700">${count} (${pct}%)</span>
              </div>
              <div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${cor};border-radius:4px;transition:width .5s"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- HISTÓRICO / TIMELINE -->
      <div class="depto-section">
        <div class="section-header"><h3>📅 Histórico NR-01</h3></div>
        <div style="display:flex;flex-direction:column;gap:0;margin-top:8px;position:relative">
          <div style="position:absolute;left:15px;top:0;bottom:0;width:2px;background:var(--border)"></div>
          ${d.historico.map(h=>`
            <div style="display:flex;gap:12px;padding-bottom:16px;position:relative">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;position:relative;z-index:1">📌</div>
              <div style="flex:1;padding-top:4px">
                <strong style="font-size:12px;display:block">${h.evento}</strong>
                <small style="color:var(--text-muted)">${h.data} · ${h.autor}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div><!-- /grid -->

    <!-- INDICADOR LGPD / CONFORMIDADE -->
    <div class="depto-section" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white">
      <div class="section-header">
        <h3 style="color:white">📜 Status de Conformidade NR-01 / 2024</h3>
        <span class="mes-badge" style="background:rgba(255,255,255,.2);color:white">Atualizado ${new Date().toLocaleDateString('pt-BR')}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:8px">
        ${[
          { label:'PGR Aprovado',           ok:true  },
          { label:'PCMSO Atualizado',        ok:true  },
          { label:'CIPA Constituída',        ok:true  },
          { label:'Riscos Psicossociais',    ok:false },
          { label:'Treinamentos em dia',     ok:false },
          { label:'Exames Periódicos',       ok:true  },
          { label:'SESMT Ativo',             ok:true  },
          { label:'Laudos Técnicos',         ok:true  },
        ].map(item=>`
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px">
            <span style="font-size:16px">${item.ok?'✅':'⚠️'}</span>
            <span style="font-size:12px;font-weight:600">${item.label}</span>
          </div>
        `).join('')}
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// DASHBOARD GESTOR
// ─────────────────────────────────────────────
function renderNr01Gestor(u) {
  const depto  = 'Comercial'; // poderia vir do perfil
  const alertas = nr01Data.alertasGestor[depto] || nr01Data.alertasGestor['RH'];
  const riscosMeuDepto = nr01Data.riscos.filter(r => r.depto === depto);
  const criticos = alertas.filter(a => a.tipo === 'critico' || a.tipo === 'alto').length;

  return `
  <div class="depto-page">

    <!-- BANNER GESTOR -->
    <div class="nr01-banner gestor">
      <div class="nr01-banner-left">
        <div class="nr01-banner-icon">⚠️</div>
        <div>
          <div class="nr01-badge">👔 Gestor — ${depto}</div>
          <h2>NR-01 — Alertas da Sua Equipe</h2>
          <p>Monitore os riscos e garanta a conformidade do seu time</p>
        </div>
      </div>
      ${criticos > 0 ? `
        <div style="background:rgba(220,38,38,.3);border:1px solid rgba(220,38,38,.5);border-radius:12px;padding:12px 20px;text-align:center">
          <div style="font-size:28px;font-weight:900;color:white">${criticos}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.8)">alertas urgentes</div>
        </div>` : ''}
    </div>

    <!-- ALERTAS DA EQUIPE -->
    <div class="depto-section" style="border-left:4px solid #dc2626">
      <div class="section-header"><h3>🚨 Alertas da Equipe — ${depto}</h3></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${alertas.map(a=>`
          <div class="nr01-alerta-item ${a.tipo}" onclick="navigateTo('${a.link}')">
            <span class="nr01-alerta-icon">${a.tipo==='critico'?'🔴':a.tipo==='alto'?'🟠':a.tipo==='medio'?'🟡':'ℹ️'}</span>
            <span style="flex:1;font-size:13px;font-weight:600">${a.msg}</span>
            <span style="font-size:11px;color:var(--text-muted)">Ver →</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- RISCOS DO MEU DEPARTAMENTO -->
    <div class="depto-section">
      <div class="section-header">
        <h3>🗺️ Riscos Identificados — ${depto}</h3>
        <button class="link-btn" onclick="nr01ReportarRisco()">+ Reportar Risco</button>
      </div>
      ${riscosMeuDepto.length > 0 ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${riscosMeuDepto.map(r=>`
            <div class="nr01-risco-card-gestor" style="border-left:3px solid ${nivelCor(r.nivel)}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px">
                <div>
                  <span class="nr01-tipo-tag" style="background:${nivelCor(r.nivel)}20;color:${nivelCor(r.nivel)}">${r.tipo}</span>
                  <strong style="font-size:13px;display:block;margin-top:4px">${r.descricao}</strong>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0">
                  <span class="badge-status ${statusCor(r.status)}">${r.status}</span>
                  <span style="background:${nivelBg(r.nivel)};color:${nivelCor(r.nivel)};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">${nivelLabel(r.nivel)}</span>
                </div>
              </div>
              <div style="font-size:12px;color:var(--text-muted);background:var(--surface);padding:8px 12px;border-radius:8px">💡 <strong>Medida:</strong> ${r.medida}</div>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button class="link-btn" style="font-size:11px" onclick="nr01AtualizarStatus(${r.id})">📝 Atualizar status</button>
                <button class="link-btn" style="font-size:11px" onclick="nr01VerDetalhes(${r.id})">🔍 Detalhes</button>
              </div>
            </div>
          `).join('')}
        </div>` : `
        <div class="empty-state" style="padding:20px">
          <div style="font-size:36px">✅</div>
          <p>Nenhum risco mapeado para o departamento ${depto}.</p>
        </div>`
      }
    </div>

    <!-- CHECKLIST DO GESTOR -->
    <div class="depto-section">
      <div class="section-header"><h3>✅ Checklist de Responsabilidades — Gestor</h3></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          { texto:'Realizar reunião de segurança mensal com a equipe',          ok:true  },
          { texto:'Verificar uso correto de EPIs pelos colaboradores',           ok:true  },
          { texto:'Reportar incidentes e quase-acidentes ao SESMT em 24h',       ok:false },
          { texto:'Garantir que novos colaboradores façam treinamento NR-01',    ok:false },
          { texto:'Identificar e reportar novos riscos psicossociais',           ok:true  },
          { texto:'Acompanhar plano de ação dos riscos do departamento',         ok:false },
        ].map((item,i)=>`
          <label class="nr01-check-row" onclick="nr01ToggleCheck(this,${i})">
            <div class="nr01-chk-circle ${item.ok?'ok':''}">
              ${item.ok?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>':''}
            </div>
            <span style="font-size:13px;${item.ok?'text-decoration:line-through;color:var(--text-muted)':''}">${item.texto}</span>
          </label>
        `).join('')}
      </div>
    </div>

    <!-- AÇÕES RÁPIDAS -->
    <div class="depto-section">
      <div class="section-header"><h3>⚡ Ações Rápidas</h3></div>
      <div class="dash-acoes-grid">
        <button onclick="nr01ReportarRisco()">⚠️ Reportar Risco</button>
        <button onclick="nr01SolicitarVistoria()">🔍 Solicitar Vistoria</button>
        <button onclick="navigateTo('desenvolvimento')">🎓 Treinamentos NR</button>
        <button onclick="nr01ContatoSESMT()">📞 Contato SESMT</button>
        <button onclick="navigateTo('ouvidoria')">📢 Ouvidoria</button>
        <button onclick="nr01VerMateriais()">📚 Materiais NR-01</button>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// DASHBOARD COLABORADOR
// ─────────────────────────────────────────────
function renderNr01Colab(u) {
  return `
  <div class="depto-page">

    <!-- BANNER COLAB -->
    <div class="nr01-banner colab">
      <div class="nr01-banner-left">
        <div class="nr01-banner-icon">🛡️</div>
        <div>
          <div class="nr01-badge">👤 Colaborador</div>
          <h2>Sua Segurança é Nossa Prioridade</h2>
          <p>Conheça a NR-01, seus direitos e como a empresa cuida de você</p>
        </div>
      </div>
      <div class="nr01-pgr-chip">
        <div style="font-size:22px">📋</div>
        <div>
          <strong>PGR Ativo</strong>
          <small>Vigência: ${nr01Data.empresa.pgrVigencia}</small>
        </div>
      </div>
    </div>

    <!-- O QUE É NR-01 -->
    <div class="nr01-o-que-e">
      <div class="nr01-oqe-icon">⚖️</div>
      <div class="nr01-oqe-content">
        <h3>O que é a NR-01?</h3>
        <p>A <strong>Norma Regulamentadora N.º 1</strong> é a principal norma de saúde e segurança do trabalho no Brasil. Ela exige que todas as empresas implementem um <strong>Programa de Gerenciamento de Riscos (PGR)</strong> para identificar, avaliar e controlar os riscos que podem afetar a saúde e integridade dos colaboradores.</p>
        <p style="margin-top:8px">Em 2024, o Ministério do Trabalho incluiu os <strong>riscos psicossociais</strong> (estresse, assédio, sobrecarga) como riscos ocupacionais obrigatórios no PGR.</p>
      </div>
    </div>

    <!-- COMO A EMPRESA CUIDA DE VOCÊ -->
    <div class="depto-section">
      <div class="section-header"><h3>❤️ Como a Empresa Cuida de Você</h3></div>
      <div class="nr01-cuidados-grid">
        ${[
          { icon:'📋', titulo:'PGR Ativo',               desc:`Programa de Gerenciamento de Riscos vigente em ${nr01Data.empresa.pgrVigencia}. Todos os riscos do seu ambiente de trabalho são monitorados.` },
          { icon:'🏥', titulo:'PCMSO — Saúde Ocupacional',desc:'Programa de Controle Médico atualizado. Você tem direito a exames periódicos gratuitos conforme sua função.' },
          { icon:'🎓', titulo:'Treinamentos NR-01',       desc:`${nr01Data.empresa.treinadosPct}% dos colaboradores já foram treinados. O treinamento é obrigatório e certificado.` },
          { icon:'🤝', titulo:'CIPA Constituída',         desc:'Comissão Interna de Prevenção de Acidentes ativa, representando você nos assuntos de segurança.' },
          { icon:'🧠', titulo:'Saúde Psicossocial',       desc:'Monitoramos estresse, sobrecarga e relações interpessoais. Reporte ao RH ou ouvidoria se sentir algo.' },
          { icon:'⚕️', titulo:'SESMT Disponível',         desc:`Equipe de Serviço Especializado em Engenharia de Segurança e Medicina do Trabalho — ${nr01Data.empresa.responsavel}.` },
        ].map(c=>`
          <div class="nr01-cuidado-card">
            <div class="nr01-cuidado-icon">${c.icon}</div>
            <div>
              <strong>${c.titulo}</strong>
              <p>${c.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SEUS DIREITOS -->
    <div class="depto-section" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0">
      <div class="section-header"><h3 style="color:#15803d">🛡️ Seus Direitos como Colaborador</h3></div>
      <div class="nr01-direitos-grid">
        ${nr01Data.direitos.map(d=>`
          <div class="nr01-direito-item">
            <span style="font-size:24px">${d.icon}</span>
            <div>
              <strong>${d.titulo}</strong>
              <p>${d.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- TIPOS DE RISCO QUE VOCÊ DEVE CONHECER -->
    <div class="depto-section">
      <div class="section-header"><h3>⚠️ Tipos de Risco que Você Deve Conhecer</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
        ${[
          { icon:'🧠', tipo:'Psicossocial', desc:'Estresse, assédio, sobrecarga, burnout', cor:'#7c3aed' },
          { icon:'🪑', tipo:'Ergonômico',   desc:'Postura, esforço repetitivo, jornada', cor:'#2563eb' },
          { icon:'🔊', tipo:'Físico',       desc:'Ruído, calor, frio, radiação',          cor:'#d97706' },
          { icon:'⚗️', tipo:'Químico',      desc:'Produtos tóxicos, poeiras, vapores',   cor:'#dc2626' },
          { icon:'🦠', tipo:'Biológico',    desc:'Vírus, bactérias, fungos',              cor:'#16a34a' },
          { icon:'🏗️', tipo:'Acidente',     desc:'Quedas, máquinas, objetos',            cor:'#ea580c' },
        ].map(r=>`
          <div style="padding:14px;border-radius:12px;border:1px solid ${r.cor}30;background:${r.cor}08">
            <div style="font-size:24px;margin-bottom:6px">${r.icon}</div>
            <strong style="font-size:13px;color:${r.cor};display:block;margin-bottom:2px">${r.tipo}</strong>
            <p style="font-size:11px;color:var(--text-muted);margin:0">${r.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- COMO REPORTAR -->
    <div class="depto-section" style="border-left:4px solid #dc2626">
      <div class="section-header"><h3>📢 Identificou um Risco? Reporte Agora!</h3></div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        Sua denúncia é <strong>protegida por lei</strong>. Você pode reportar de forma anônima pela Ouvidoria ou diretamente ao SESMT/RH.
        A empresa tem obrigação de investigar e responder em até <strong>48 horas</strong> para casos críticos.
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn-primary" onclick="nr01AbrirFormReporte()">📢 Reportar via Ouvidoria</button>
        <button class="link-btn" onclick="nr01ContatoSESMT()">📞 Contato SESMT: ${nr01Data.empresa.responsavel}</button>
        <button class="link-btn" onclick="nr01VerMateriais()">📚 Manual NR-01</button>
      </div>
    </div>

    <!-- FORMULÁRIO RÁPIDO DE REPORTE -->
    <div class="depto-section" id="nr01-form-reporte" style="display:none">
      <div class="section-header"><h3>📝 Reporte de Risco Ocupacional</h3></div>
      <div class="exp-form">
        <div class="form-row">
          <div>
            <label>Tipo de Risco</label>
            <select id="nr01-tipo">
              <option>Psicossocial</option><option>Ergonômico</option><option>Físico</option>
              <option>Químico</option><option>Biológico</option><option>Acidente</option>
            </select>
          </div>
          <div>
            <label>Local / Departamento</label>
            <input type="text" id="nr01-local" placeholder="Ex: Almoxarifado, bloco B" />
          </div>
        </div>
        <label>Descrição do Risco</label>
        <textarea id="nr01-desc" rows="3" placeholder="Descreva o que observou de forma clara e objetiva..."></textarea>
        <label class="check-item">
          <input type="checkbox" id="nr01-anonimo" checked /> 🔒 Reportar de forma anônima (recomendado)
        </label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-primary" onclick="nr01EnviarReporte()">✅ Enviar Reporte</button>
          <button class="link-btn" onclick="document.getElementById('nr01-form-reporte').style.display='none'">Cancelar</button>
        </div>
      </div>
    </div>

  </div>`;
}

// ─────────────────────────────────────────────
// AÇÕES / FUNÇÕES HELPERS
// ─────────────────────────────────────────────
function nr01AbrirFormReporte() {
  const el = document.getElementById('nr01-form-reporte');
  if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; el.scrollIntoView({behavior:'smooth'}); }
}

function nr01EnviarReporte() {
  const tipo  = document.getElementById('nr01-tipo')?.value;
  const local = document.getElementById('nr01-local')?.value.trim();
  const desc  = document.getElementById('nr01-desc')?.value.trim();
  const anon  = document.getElementById('nr01-anonimo')?.checked;
  if (!local || !desc) { alert('Preencha local e descrição!'); return; }
  alert(`✅ Reporte enviado com sucesso!\n\nTipo: ${tipo}\nLocal: ${local}\nAnônimo: ${anon?'Sim':'Não'}\n\nO SESMT e RH serão notificados e responderão em até 48h.`);
  document.getElementById('nr01-form-reporte').style.display = 'none';
}

function nr01ReportarRisco() { nr01AbrirFormReporte(); }
function nr01SolicitarVistoria() { alert('🔍 Solicitação de vistoria enviada ao SESMT!\n\nResposta em até 48h.'); }
function nr01ContatoSESMT()  { alert(`📞 SESMT — ${nr01Data.empresa.responsavel}\n\nEntre em contato diretamente ou via Serviços RH → Suporte SESMT.`); }
function nr01VerMateriais()  { alert('📚 Manual NR-01 disponível em Documentos → Políticas RH.\n\nApós integração, o download será direto.'); }

function nr01DetalheRisco(id) {
  const r = nr01Data.riscos.find(x=>x.id===id);
  if (!r) return;
  alert(`📋 DETALHE DO RISCO\n\nTipo: ${r.tipo}\nNível: ${r.nivel.toUpperCase()}\nDepartamento: ${r.depto}\nStatus: ${r.status}\n\nDescrição:\n${r.descricao}\n\nMedida de controle:\n${r.medida}`);
}

function nr01AtualizarStatus(id) {
  const r = nr01Data.riscos.find(x=>x.id===id);
  if (!r) return;
  const novoStatus = prompt(`Status atual: ${r.status}\nNovo status:`, r.status);
  if (novoStatus) { r.status = novoStatus; alert(`✅ Status do risco "${r.descricao}" atualizado para "${novoStatus}"`); }
}

function nr01VerDetalhes(id) { nr01DetalheRisco(id); }

function nr01ToggleCheck(el, i) {
  const circle = el.querySelector('.nr01-chk-circle');
  const span   = el.querySelector('span');
  const ok     = !circle.classList.contains('ok');
  circle.classList.toggle('ok', ok);
  circle.innerHTML = ok ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>' : '';
  if (span) { span.style.textDecoration = ok ? 'line-through' : ''; span.style.color = ok ? 'var(--text-muted)' : ''; }
}

function nr01NovaAcao() {
  const acao  = prompt('Descrição da ação:');
  if (!acao) return;
  const prazo = prompt('Prazo (DD/MM/AAAA):');
  const resp  = prompt('Responsável:');
  if (!prazo || !resp) return;
  nr01Data.acoes.push({ acao, prazo, resp, status:'Pendente', prioridade:'media' });
  alert(`✅ Ação "${acao}" adicionada ao plano!`);
  document.getElementById('pageContainer').innerHTML = renderNr01ADM({});
}

function nr01ConcluirAcao(i) {
  nr01Data.acoes[i].status = 'Concluída';
  alert(`✅ Ação "${nr01Data.acoes[i].acao}" marcada como concluída!`);
  document.getElementById('pageContainer').innerHTML = renderNr01ADM({});
}

function nr01FiltrarRiscos() {
  const nivel = prompt('Filtrar por nível (critico/alto/medio/baixo):');
  if (nivel) alert(`Filtro "${nivel}" aplicado. Na versão integrada, a tabela será filtrada dinamicamente.`);
}

function nr01ExportarRelatorio() {
  const txt = `RELATÓRIO NR-01 — ${new Date().toLocaleDateString('pt-BR')}\n${'='.repeat(50)}\n\n` +
    `PGR: ${nr01Data.empresa.pgrStatus} (${nr01Data.empresa.pgrVigencia})\n` +
    `Responsável: ${nr01Data.empresa.responsavel}\n` +
    `Riscos mapeados: ${nr01Data.empresa.totalRiscos}\n` +
    `Não conformidades: ${nr01Data.empresa.naoConformidades}\n\n` +
    `RISCOS:\n${nr01Data.riscos.map(r=>`[${r.nivel.toUpperCase()}] ${r.tipo} — ${r.descricao} (${r.depto}) — ${r.status}`).join('\n')}`;
  const url = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  const a = document.createElement('a'); a.href=url; a.download='relatorio-nr01.txt'; a.click();
  URL.revokeObjectURL(url);
}
