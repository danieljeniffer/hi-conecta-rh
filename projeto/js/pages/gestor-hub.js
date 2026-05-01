/**
 * gestor-hub.js — Módulo do Gestor e RH
 * Hub principal, camada de dados, motor de automação e dashboard
 * Expõe: renderGestor(), GestorDB, GestorUser, GestorColabs, GestorMotor, gestorIrPara()
 */

// ─────────────────────────────────────────────────────────────
// DADOS PADRÃO
// ─────────────────────────────────────────────────────────────
const GESTOR_DEFAULT_FORMULARIOS = [
  {
    id: 'FORM_15D', nome: 'Avaliação de Experiência — 15 dias', tipo: '15d', ativo: true,
    criado_em: new Date().toISOString(),
    campos: [
      { id: 'c1', label: 'Adaptação à cultura e valores da empresa',       tipo: 'nota',    obrigatorio: true  },
      { id: 'c2', label: 'Qualidade e organização do trabalho',             tipo: 'nota',    obrigatorio: true  },
      { id: 'c3', label: 'Relacionamento interpessoal com a equipe',        tipo: 'nota',    obrigatorio: true  },
      { id: 'c4', label: 'Pontualidade e frequência',                        tipo: 'sim_nao', obrigatorio: true  },
      { id: 'c5', label: 'O colaborador demonstrou interesse em aprender?', tipo: 'sim_nao', obrigatorio: true  },
      { id: 'c6', label: 'Observações gerais do gestor',                    tipo: 'texto',   obrigatorio: false },
    ],
  },
  {
    id: 'FORM_45D', nome: 'Avaliação de Experiência — 45 dias', tipo: '45d', ativo: true,
    criado_em: new Date().toISOString(),
    campos: [
      { id: 'c1', label: 'Desempenho e produtividade geral',         tipo: 'nota',    obrigatorio: true  },
      { id: 'c2', label: 'Habilidades técnicas para o cargo',         tipo: 'nota',    obrigatorio: true  },
      { id: 'c3', label: 'Comunicação e clareza',                     tipo: 'nota',    obrigatorio: true  },
      { id: 'c4', label: 'Iniciativa e proatividade',                 tipo: 'nota',    obrigatorio: true  },
      { id: 'c5', label: 'Trabalho em equipe e colaboração',          tipo: 'nota',    obrigatorio: true  },
      { id: 'c6', label: 'Recomenda efetivação do colaborador?',      tipo: 'sim_nao', obrigatorio: true  },
      { id: 'c7', label: 'Pontos fortes observados no período',       tipo: 'texto',   obrigatorio: false },
      { id: 'c8', label: 'Pontos de melhoria e feedback construtivo', tipo: 'texto',   obrigatorio: false },
    ],
  },
];

const GESTOR_DEFAULT_MODELOS = [
  {
    id: 'MOD_ADV_VERBAL', nome: 'Advertência Verbal', tipo: 'advertencia_verbal',
    conteudo: `ADVERTÊNCIA VERBAL\n\nEmpresa: {empresa}\nData: {data}\n\nCaro(a) {colaborador},\n\nVimos por meio deste documento registrar formalmente a advertência verbal que lhe foi comunicada nesta data, em razão de:\n\n{motivo}\n\nSolicitamos que regularize a situação e mantenha conduta adequada ao ambiente de trabalho, conforme normas internas.\n\nEsta advertência será registrada em seu prontuário funcional.\n\nAtenciosamente,\n\n{gestor}\nGestor(a) do setor {setor}`,
  },
  {
    id: 'MOD_ADV_ESCRITA', nome: 'Advertência por Escrito', tipo: 'advertencia_escrita',
    conteudo: `ADVERTÊNCIA POR ESCRITO\n\nEmpresa: {empresa}\nData: {data}\n\nCaro(a) {colaborador},\n\nPor meio deste documento, a empresa vem formalmente adverti-lo(a) pela seguinte conduta:\n\n{motivo}\n\nInformamos que a reincidência poderá resultar em medidas disciplinares mais severas, incluindo suspensão ou demissão por justa causa, conforme previsto na CLT.\n\nSolicitamos que assine este documento em duas vias, sendo uma para seu arquivo pessoal.\n\n_______________________________\n{colaborador}\n\n_______________________________\n{gestor} — Gestor(a) {setor}\n\nData de assinatura: ___/___/______`,
  },
  {
    id: 'MOD_SUSPENSAO', nome: 'Suspensão Disciplinar', tipo: 'suspensao',
    conteudo: `SUSPENSÃO DISCIPLINAR\n\nEmpresa: {empresa}\nData: {data}\n\nCaro(a) {colaborador},\n\nEm razão da conduta abaixo descrita, a empresa aplica a presente suspensão disciplinar de {dias_suspensao} dias, sem remuneração, conforme art. 474 da CLT:\n\n{motivo}\n\nInformamos que nova ocorrência poderá ensejar rescisão por justa causa.\n\n_______________________________\n{colaborador}\n\n_______________________________\n{gestor} — Gestor(a) {setor}`,
  },
];

const GESTOR_AUTOMACAO_REGRAS = [
  { id: 'ava_15d',   ativo: true, evento: 'Colaborador admitido',    acao: 'Criar avaliação de 15 dias',          icone: '📋' },
  { id: 'ava_45d',   ativo: true, evento: 'Colaborador admitido',    acao: 'Criar avaliação de 45 dias',          icone: '📋' },
  { id: 'notif_2d',  ativo: true, evento: '2 dias antes do prazo',   acao: 'Notificar gestor responsável',        icone: '🔔' },
  { id: 'notif_dia', ativo: true, evento: 'No dia do vencimento',    acao: 'Notificar gestor + RH',               icone: '⚠️'  },
  { id: 'notif_oc',  ativo: true, evento: 'Ocorrência registrada',   acao: 'Notificar RH automaticamente',       icone: '📝' },
  { id: 'hist_ev',   ativo: true, evento: 'Qualquer evento criado',  acao: 'Registrar na timeline do colaborador',icone: '📈' },
];

// ─────────────────────────────────────────────────────────────
// BANCO DE DADOS (localStorage)
// ─────────────────────────────────────────────────────────────
const GestorDB = {
  KEY: 'hiRH_gestor_v2',

  _defaults() {
    return {
      avaliacoes: [], ocorrencias: [], advertencias: [],
      termos_ho: [], reunioes: [], notificacoes: [],
      formularios: GESTOR_DEFAULT_FORMULARIOS,
      modelos_doc: GESTOR_DEFAULT_MODELOS,
      automacao_regras: GESTOR_AUTOMACAO_REGRAS,
    };
  },

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this._defaults();
      const parsed = JSON.parse(raw);
      // Garantir arrays obrigatórios
      const d = this._defaults();
      return {
        avaliacoes:       parsed.avaliacoes       || d.avaliacoes,
        ocorrencias:      parsed.ocorrencias      || d.ocorrencias,
        advertencias:     parsed.advertencias     || d.advertencias,
        termos_ho:        parsed.termos_ho        || d.termos_ho,
        reunioes:         parsed.reunioes         || d.reunioes,
        notificacoes:     parsed.notificacoes     || d.notificacoes,
        formularios:      parsed.formularios?.length ? parsed.formularios : d.formularios,
        modelos_doc:      parsed.modelos_doc?.length ? parsed.modelos_doc : d.modelos_doc,
        automacao_regras: parsed.automacao_regras || d.automacao_regras,
      };
    } catch { return this._defaults(); }
  },

  set(data) { try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch { } },

  upsert(colecao, item) {
    const d = this.get();
    const idx = d[colecao].findIndex(x => x.id === item.id);
    if (idx >= 0) d[colecao][idx] = item; else d[colecao].unshift(item);
    this.set(d); return item;
  },

  remove(colecao, id) {
    const d = this.get();
    d[colecao] = d[colecao].filter(x => x.id !== id);
    this.set(d);
  },

  addNotificacao(tipo, titulo, msg, link = '') {
    const n = { id: 'N_' + Date.now(), tipo, titulo, mensagem: msg, link, lida: false, em: new Date().toISOString() };
    this.upsert('notificacoes', n);
    return n;
  },
};

// ─────────────────────────────────────────────────────────────
// USUÁRIO ATUAL
// ─────────────────────────────────────────────────────────────
const GestorUser = {
  get() {
    try { return JSON.parse(sessionStorage.getItem('hiRH_user')) || {}; } catch { return {}; }
  },
  perfil()  { return this.get().perfil  || 'gestor'; },
  setor()   { return this.get().setor   || ''; },
  nome()    { return this.get().nome    || 'Usuário'; },
  isRH()    { const p = this.perfil(); return p === 'rh' || p === 'admin'; },
  isAdmin() { return this.perfil() === 'admin'; },
  canEdit() { return this.isRH(); },
};

// ─────────────────────────────────────────────────────────────
// COLABORADORES
// ─────────────────────────────────────────────────────────────
const GestorColabs = {
  getAll() {
    const dp = JSON.parse(localStorage.getItem('dp_colaboradores') || '[]');
    const rh = (window.RHData?.colaboradores || []).map(c => ({
      id: c.id, nome_completo: c.nome, nome: c.nome,
      cargo: c.cargo, setor: c.setor || c.departamento,
      salario_base: c.salario, status: c.status,
    }));
    const merged = [...dp];
    rh.forEach(c => { if (!merged.find(x => x.id === c.id)) merged.push(c); });
    return merged.filter(c => c.status !== 'demitido');
  },

  getBySector() {
    const all = this.getAll();
    if (GestorUser.isRH()) return all;
    const setor = GestorUser.setor();
    return setor ? all.filter(c => c.setor === setor) : all;
  },

  getNome(id) {
    const c = this.getAll().find(x => x.id === id);
    return c ? (c.nome_completo || c.nome || '—') : '—';
  },
};

// ─────────────────────────────────────────────────────────────
// MOTOR DE AUTOMAÇÃO
// ─────────────────────────────────────────────────────────────
const GestorMotor = {
  run() {
    const db     = GestorDB.get();
    const colabs = GestorColabs.getAll();
    const now    = new Date();
    let changed  = false;

    colabs.forEach(col => {
      if (!col.data_admissao) return;
      const adm = new Date(col.data_admissao + 'T00:00:00');

      ['15d', '45d'].forEach(tipo => {
        const dias   = tipo === '15d' ? 15 : 45;
        const prazoD = new Date(adm); prazoD.setDate(prazoD.getDate() + dias);
        const prazo  = prazoD.toISOString().split('T')[0];
        const formId = tipo === '15d' ? 'FORM_15D' : 'FORM_45D';
        const found  = db.avaliacoes.find(a => a.colaborador_id === col.id && a.tipo === tipo);

        if (!found) {
          const formOk = db.formularios.find(f => f.id === formId && f.ativo);
          if (!formOk) return;
          const diff   = prazoD - now;
          const status = diff < 0 ? 'atrasada' : diff < 2 * 86400000 ? 'proxima' : 'pendente';
          db.avaliacoes.push({
            id: `AVA_${tipo}_${col.id}`,
            colaborador_id: col.id,
            colaborador_nome: col.nome_completo || col.nome || '—',
            setor: col.setor || '—', cargo: col.cargo || '—',
            tipo, prazo, status, formulario_id: formId,
            respostas: {}, media: null,
            criada_em: new Date().toISOString(), concluida_em: null,
          });
          // Notificação automática
          if (status !== 'concluida') {
            GestorDB.addNotificacao('avaliacao',
              `Avaliação ${tipo} criada`,
              `${col.nome_completo || col.nome} — prazo: ${new Date(prazo + 'T00:00:00').toLocaleDateString('pt-BR')}`,
              'avaliacoes');
          }
          changed = true;
        }
      });
    });

    // Atualizar status das avaliações existentes
    db.avaliacoes.forEach(a => {
      if (a.status === 'concluida') return;
      const prazoD = new Date(a.prazo + 'T23:59:59');
      const diff   = prazoD - now;
      const novoStatus = diff < 0 ? 'atrasada' : diff < 2 * 86400000 ? 'proxima' : 'pendente';
      if (a.status !== novoStatus) { a.status = novoStatus; changed = true; }
    });

    if (changed) GestorDB.set(db);
  },
};

// ─────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────
const GestorFmt = {
  data(iso)  { if (!iso) return '—'; try { return new Date(iso.substring(0,10)+'T00:00:00').toLocaleDateString('pt-BR'); } catch { return iso; } },
  hora(iso)  { if (!iso) return '—'; try { return new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); } catch { return ''; } },
  rel(iso)   {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000)        return 'agora';
    if (diff < 3600000)      return Math.floor(diff/60000) + ' min atrás';
    if (diff < 86400000)     return Math.floor(diff/3600000) + 'h atrás';
    return Math.floor(diff/86400000) + 'd atrás';
  },
  moeda(v)   { return 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2}); },
  ini(nome)  { const p = String(nome||'?').split(' '); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase(); },
};

// ─────────────────────────────────────────────────────────────
// HUB — NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────
const GESTOR_MODULOS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '📊', roles: ['admin','rh','gestor'] },
  { id: 'avaliacoes',  label: 'Avaliações',   icon: '📋', roles: ['admin','rh','gestor'] },
  { id: 'ocorrencias', label: 'Ocorrências',  icon: '📝', roles: ['admin','rh','gestor'] },
  { id: 'documentos',  label: 'Documentos',   icon: '📄', roles: ['admin','rh','gestor'] },
  { id: 'reunioes',    label: 'Reuniões',     icon: '📅', roles: ['admin','rh','gestor'] },
  { id: 'historico',   label: 'Histórico',    icon: '🕒', roles: ['admin','rh','gestor'] },
  { id: 'automacao',   label: 'Automação',    icon: '⚙️', roles: ['admin','rh']          },
];

let _gestorAbaAtiva = 'dashboard';

function gestorIrPara(id) {
  _gestorAbaAtiva = id;
  document.querySelectorAll('.g-subnav-btn').forEach(b =>
    b.classList.toggle('ativo', b.dataset.mod === id));

  const cont = document.getElementById('g-conteudo');
  if (!cont) return;
  cont.innerHTML = `<div class="g-empty"><span class="g-empty-icon">⏳</span><p>Carregando…</p></div>`;

  const render = {
    dashboard:   _renderDashboard,
    avaliacoes:  () => window.GestorAvaliacoes?.render(cont),
    ocorrencias: () => window.GestorOcorrencias?.render(cont),
    documentos:  () => window.GestorDocumentos?.render(cont),
    reunioes:    () => window.GestorReunioes?.render(cont),
    historico:   () => window.GestorHistorico?.render(cont),
    automacao:   _renderAutomacao,
  };

  const fn = render[id];
  if (fn) { const html = fn(cont); if (typeof html === 'string') cont.innerHTML = html; }
}

window.gestorIrPara = gestorIrPara;

// ─────────────────────────────────────────────────────────────
// RENDER PRINCIPAL (entrada do app.js)
// ─────────────────────────────────────────────────────────────
function renderGestor() {
  GestorMotor.run();
  const user  = GestorUser.get();
  const perfil = GestorUser.perfil();
  const db    = GestorDB.get();
  const naoLidas = db.notificacoes.filter(n => !n.lida).length;
  const urgentes = db.avaliacoes.filter(a => a.status === 'proxima' || a.status === 'atrasada').length;

  const modulos = GESTOR_MODULOS.filter(m => m.roles.includes(perfil));

  const html = `
<div class="g-root">
  <div class="g-page-hd">
    <div style="display:flex;align-items:center;gap:12px">
      <h2>👥 Gestão de Equipes</h2>
      <span class="g-perfil-badge g-perfil-${perfil}">${perfil === 'rh' ? '🏢 RH' : perfil === 'admin' ? '⭐ Admin' : '👤 Gestor'}</span>
    </div>
    <div class="g-page-hd-right">
      ${urgentes > 0 ? `<span class="g-alert g-alert-warn" style="margin:0;padding:6px 12px;font-size:12px">⚠️ ${urgentes} avaliação(ões) urgente(s)</span>` : ''}
      <span style="font-size:12px;color:var(--text-muted,#64748b)">${user.nome || 'Usuário'} · ${user.setor || ''}</span>
    </div>
  </div>
  <div class="g-subnav" style="margin-top:16px">
    ${modulos.map(m => `
      <button class="g-subnav-btn ${m.id === 'dashboard' ? 'ativo' : ''}" data-mod="${m.id}" onclick="gestorIrPara('${m.id}')">
        ${m.icon} ${m.label}
        ${m.id === 'avaliacoes' && urgentes > 0 ? `<span class="g-notif-dot">${urgentes}</span>` : ''}
        ${m.id === 'dashboard'  && naoLidas > 0  ? '' : ''}
      </button>`).join('')}
  </div>
  <div id="g-conteudo" style="margin-top:4px"></div>
</div>`;

  setTimeout(() => gestorIrPara('dashboard'), 0);
  return html;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function _renderDashboard() {
  const db     = GestorDB.get();
  const colabs = GestorColabs.getBySector();
  const now    = new Date();

  const avas       = db.avaliacoes.filter(a => colabs.find(c => c.id === a.colaborador_id));
  const pendentes  = avas.filter(a => a.status === 'pendente').length;
  const proximas   = avas.filter(a => a.status === 'proxima').length;
  const atrasadas  = avas.filter(a => a.status === 'atrasada').length;
  const concluidas = avas.filter(a => a.status === 'concluida').length;
  const ocsMes     = db.ocorrencias.filter(o => {
    const d = new Date(o.em); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const reuProx = db.reunioes.filter(r => new Date(r.data_hora) >= now).length;
  const naoLidas = db.notificacoes.filter(n => !n.lida).length;

  const avasUrgentes = avas
    .filter(a => a.status === 'proxima' || a.status === 'atrasada')
    .slice(0, 5);
  const ocsRecentes = db.ocorrencias
    .filter(o => colabs.find(c => c.id === o.colaborador_id))
    .slice(0, 4);
  const reuProximas = db.reunioes
    .filter(r => {
      if (!GestorUser.isRH() && r.setor && r.setor !== GestorUser.setor()) return false;
      return new Date(r.data_hora) >= now;
    })
    .sort((a,b) => new Date(a.data_hora)-new Date(b.data_hora))
    .slice(0, 3);
  const notRecentes = db.notificacoes.slice(0, 5);

  return `
<div>
  <!-- KPIs -->
  <div class="g-kpis">
    <div class="g-kpi g-kpi-blue" onclick="gestorIrPara('avaliacoes')" style="cursor:pointer">
      <span class="g-kpi-icon">📋</span>
      <span class="g-kpi-value">${pendentes}</span>
      <span class="g-kpi-label">Avaliações Pendentes</span>
    </div>
    <div class="g-kpi g-kpi-yellow" onclick="gestorIrPara('avaliacoes')" style="cursor:pointer">
      <span class="g-kpi-icon">⏰</span>
      <span class="g-kpi-value">${proximas}</span>
      <span class="g-kpi-label">Próximas do Vencimento</span>
    </div>
    <div class="g-kpi g-kpi-red" onclick="gestorIrPara('avaliacoes')" style="cursor:pointer">
      <span class="g-kpi-icon">🚨</span>
      <span class="g-kpi-value">${atrasadas}</span>
      <span class="g-kpi-label">Avaliações Atrasadas</span>
    </div>
    <div class="g-kpi g-kpi-green">
      <span class="g-kpi-icon">✅</span>
      <span class="g-kpi-value">${concluidas}</span>
      <span class="g-kpi-label">Avaliações Concluídas</span>
    </div>
    <div class="g-kpi g-kpi-teal" onclick="gestorIrPara('reunioes')" style="cursor:pointer">
      <span class="g-kpi-icon">📅</span>
      <span class="g-kpi-value">${reuProx}</span>
      <span class="g-kpi-label">Reuniões Agendadas</span>
    </div>
    <div class="g-kpi g-kpi-purple">
      <span class="g-kpi-icon">👥</span>
      <span class="g-kpi-value">${colabs.length}</span>
      <span class="g-kpi-label">Colaboradores ${GestorUser.isRH() ? 'Total' : 'no Setor'}</span>
    </div>
  </div>

  ${atrasadas > 0 ? `<div class="g-alert g-alert-danger"><span>🚨</span><span>Você tem <strong>${atrasadas} avaliação(ões) atrasada(s)</strong>. Responda imediatamente para evitar problemas no processo de experiência.</span></div>` : ''}
  ${proximas  > 0 ? `<div class="g-alert g-alert-warn"><span>⏰</span><span><strong>${proximas} avaliação(ões)</strong> vencem nos próximos 2 dias. Priorize o preenchimento.</span></div>` : ''}

  <div class="g-dash-grid">
    <div class="g-dash-col">
      <!-- Avaliações urgentes -->
      <div class="g-card">
        <div class="g-card-hd">
          <h4>⚠️ Avaliações Urgentes</h4>
          <a onclick="gestorIrPara('avaliacoes')">Ver todas →</a>
        </div>
        ${avasUrgentes.length === 0
          ? `<div class="g-empty"><span class="g-empty-icon">🎉</span><p>Nenhuma avaliação urgente!</p></div>`
          : `<div class="g-table-wrap"><table class="g-table">
              <thead><tr><th>Colaborador</th><th>Tipo</th><th>Prazo</th><th>Status</th><th></th></tr></thead>
              <tbody>${avasUrgentes.map(a => `
                <tr>
                  <td><strong>${a.colaborador_nome}</strong><br><small style="color:var(--text-muted)">${a.setor}</small></td>
                  <td><strong>${a.tipo === '15d' ? '15 dias' : '45 dias'}</strong></td>
                  <td>${GestorFmt.data(a.prazo)}</td>
                  <td><span class="g-status g-status-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
                  <td><button class="dp-btn" style="font-size:11px;padding:4px 10px" onclick="gestorIrPara('avaliacoes')">Responder</button></td>
                </tr>`).join('')}
              </tbody>
            </table></div>`}
      </div>

      <!-- Ocorrências recentes -->
      <div class="g-card">
        <div class="g-card-hd">
          <h4>📝 Ocorrências Recentes</h4>
          <a onclick="gestorIrPara('ocorrencias')">Ver todas →</a>
        </div>
        ${ocsRecentes.length === 0
          ? `<div class="g-empty"><span class="g-empty-icon">✅</span><p>Nenhuma ocorrência registrada</p></div>`
          : ocsRecentes.map(o => `
              <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color,#e2e8f0)">
                <div class="g-avatar" style="background:${o.tipo==='grave'?'#ef4444':'#f59e0b'}">${GestorFmt.ini(o.colaborador_nome)}</div>
                <div style="flex:1">
                  <strong style="font-size:13px">${o.colaborador_nome}</strong>
                  <small style="display:block;color:var(--text-muted)">${o.tipo_label || o.tipo} · ${GestorFmt.rel(o.em)}</small>
                </div>
                <span class="g-status g-status-aberta">Aberta</span>
              </div>`).join('')}
      </div>
    </div>

    <div class="g-dash-col">
      <!-- Próximas reuniões -->
      <div class="g-card">
        <div class="g-card-hd">
          <h4>📅 Próximas Reuniões</h4>
          <a onclick="gestorIrPara('reunioes')">Ver todas →</a>
        </div>
        ${reuProximas.length === 0
          ? `<div class="g-empty"><span class="g-empty-icon">📅</span><p>Nenhuma reunião agendada</p></div>`
          : reuProximas.map(r => {
              const dt  = new Date(r.data_hora);
              const dia = String(dt.getDate()).padStart(2,'0');
              const mes = dt.toLocaleDateString('pt-BR',{month:'short'}).toUpperCase();
              return `
                <div class="g-reu-card" onclick="gestorIrPara('reunioes')">
                  <div class="g-reu-date"><span class="g-reu-day">${dia}</span><span class="g-reu-month">${mes}</span></div>
                  <div class="g-reu-body">
                    <strong>${r.titulo}</strong>
                    <p>🕐 ${GestorFmt.hora(r.data_hora)} · 📍 ${r.local || 'A definir'}</p>
                    <p style="margin-top:4px"><span class="g-reu-setor">${r.setor || 'Geral'}</span></p>
                  </div>
                </div>`;
            }).join('')}
      </div>

      <!-- Notificações recentes -->
      <div class="g-card">
        <div class="g-card-hd">
          <h4>🔔 Notificações ${naoLidas > 0 ? `<span class="g-notif-dot" style="background:#ef4444;color:#fff;border-radius:10px;font-size:9px;padding:2px 6px;margin-left:4px">${naoLidas}</span>` : ''}</h4>
          <a onclick="gestorLerTodasNotificacoes()">Marcar lidas</a>
        </div>
        ${notRecentes.length === 0
          ? `<div class="g-empty"><span class="g-empty-icon">🔔</span><p>Sem notificações</p></div>`
          : notRecentes.map(n => `
              <div class="g-notif-item ${n.lida?'':'nao-lida'}" onclick="gestorMarcarLida('${n.id}')">
                <span class="g-notif-item-icon">${_tipoIcon(n.tipo)}</span>
                <div class="g-notif-item-body">
                  <strong>${n.titulo}</strong>
                  <p>${n.mensagem}</p>
                  <time>${GestorFmt.rel(n.em)}</time>
                </div>
                ${!n.lida ? '<div class="g-notif-dot-unread"></div>' : ''}
              </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

// ─────────────────────────────────────────────────────────────
// AUTOMAÇÃO (RH only)
// ─────────────────────────────────────────────────────────────
function _renderAutomacao() {
  if (!GestorUser.isRH()) return `<div class="g-alert g-alert-danger"><span>🔒</span><span>Acesso restrito ao RH e Administradores.</span></div>`;
  const db = GestorDB.get();
  const regras = db.automacao_regras;

  return `
<div>
  ${GestorUser.isRH() ? `<div class="g-alert g-alert-info"><span>ℹ️</span><span>Configure as regras de automação do sistema. Cada regra executa uma ação automaticamente quando o evento correspondente ocorre.</span></div>` : ''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="g-card">
      <div class="g-card-hd"><h4>🤖 Regras de Automação</h4></div>
      <div class="g-automacao-regras">
        ${regras.map(r => `
          <div class="g-regra-card">
            <span class="g-regra-icon">${r.icone}</span>
            <div class="g-regra-info">
              <strong>${r.acao}</strong>
              <small>Evento: ${r.evento}</small>
            </div>
            <span class="g-regra-status ${r.ativo ? 'g-regra-on' : 'g-regra-off'}">${r.ativo ? 'Ativo' : 'Inativo'}</span>
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorToggleRegra('${r.id}')">
              ${r.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>`).join('')}
      </div>
    </div>
    <div class="g-card">
      <div class="g-card-hd"><h4>📋 Formulários de Avaliação</h4>
        <a onclick="gestorNovoFormulario()">+ Novo</a>
      </div>
      ${db.formularios.map(f => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color,#e2e8f0)">
          <div style="flex:1">
            <strong style="font-size:13px">${f.nome}</strong>
            <small style="display:block;color:var(--text-muted)">${f.campos.length} campos · ${f.tipo}</small>
          </div>
          <span class="g-regra-status ${f.ativo?'g-regra-on':'g-regra-off'}">${f.ativo?'Ativo':'Inativo'}</span>
          <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorEditarFormulario('${f.id}')">✏️ Editar</button>
        </div>`).join('')}
      <div style="margin-top:16px">
        <div class="g-card-hd"><h4>📄 Modelos de Documentos</h4>
          <a onclick="gestorNovoModelo()">+ Novo</a>
        </div>
        ${db.modelos_doc.map(m => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color,#e2e8f0)">
            <div style="flex:1">
              <strong style="font-size:13px">${m.nome}</strong>
              <small style="display:block;color:var(--text-muted)">${m.tipo}</small>
            </div>
            <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorEditarModelo('${m.id}')">✏️ Editar</button>
          </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

// ─────────────────────────────────────────────────────────────
// HELPERS GLOBAIS
// ─────────────────────────────────────────────────────────────
function _tipoIcon(tipo) {
  return { avaliacao:'📋', ocorrencia:'📝', advertencia:'⚠️', reuniao:'📅', documento:'📄', sistema:'🔔' }[tipo] || '🔔';
}

window.gestorMarcarLida = function(id) {
  const db = GestorDB.get();
  const n  = db.notificacoes.find(x => x.id === id);
  if (n) { n.lida = true; GestorDB.set(db); }
  if (_gestorAbaAtiva === 'dashboard') gestorIrPara('dashboard');
};

window.gestorLerTodasNotificacoes = function() {
  const db = GestorDB.get();
  db.notificacoes.forEach(n => n.lida = true);
  GestorDB.set(db);
  gestorIrPara('dashboard');
};

window.gestorToggleRegra = function(id) {
  const db = GestorDB.get();
  const r  = db.automacao_regras.find(x => x.id === id);
  if (r) { r.ativo = !r.ativo; GestorDB.set(db); }
  gestorIrPara('automacao');
};

window.gestorNovoFormulario = function() {
  gestorAbrirModalFormulario(null);
};
window.gestorEditarFormulario = function(id) {
  const f = GestorDB.get().formularios.find(x => x.id === id);
  if (f) gestorAbrirModalFormulario(f);
};

function gestorAbrirModalFormulario(form) {
  const id    = form?.id || ('FORM_' + Date.now());
  const nome  = form?.nome || '';
  const tipo  = form?.tipo || '15d';
  const campos = form?.campos || [];

  const overlay = document.createElement('div');
  overlay.className = 'g-overlay';
  overlay.innerHTML = `
    <div class="g-modal g-modal-lg">
      <div class="g-modal-hd">
        <h3>${form ? 'Editar' : 'Novo'} Formulário</h3>
        <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
      </div>
      <div class="g-modal-body">
        <div class="dp-form-grid" style="margin-bottom:16px">
          <div class="dp-field dp-field-full">
            <label>Nome do Formulário</label>
            <input type="text" id="gf-nome" value="${nome}" placeholder="Ex: Avaliação de Experiência" />
          </div>
          <div class="dp-field">
            <label>Tipo</label>
            <select id="gf-tipo">
              <option value="15d" ${tipo==='15d'?'selected':''}>15 dias</option>
              <option value="45d" ${tipo==='45d'?'selected':''}>45 dias</option>
              <option value="custom" ${tipo==='custom'?'selected':''}>Personalizado</option>
            </select>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <strong style="font-size:13px">Campos do Formulário</strong>
          <button class="dp-btn dp-btn-secondary" style="font-size:11px" onclick="gestorAddCampo()">+ Campo</button>
        </div>
        <div id="gf-campos">
          ${campos.map(c => _renderCampoEditor(c)).join('')}
        </div>
      </div>
      <div class="g-modal-ft">
        <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
        <button class="dp-btn" onclick="gestorSalvarFormulario('${id}')">💾 Salvar Formulário</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function _renderCampoEditor(c) {
  return `<div class="g-campo-card" data-campo-id="${c.id}">
    <span class="g-campo-drag">⠿</span>
    <input class="g-campo-label-input" type="text" value="${c.label}" placeholder="Descrição do campo" />
    <span class="g-campo-tipo">${c.tipo}</span>
    <button class="g-campo-remove" onclick="this.closest('.g-campo-card').remove()">✕</button>
  </div>`;
}

window.gestorAddCampo = function() {
  const cont = document.getElementById('gf-campos');
  if (!cont) return;
  const id = 'c_' + Date.now();
  const div = document.createElement('div');
  div.innerHTML = _renderCampoEditor({ id, label: '', tipo: 'nota', obrigatorio: false });
  cont.appendChild(div.firstElementChild);
};

window.gestorSalvarFormulario = function(id) {
  const nome = document.getElementById('gf-nome')?.value?.trim();
  const tipo = document.getElementById('gf-tipo')?.value;
  if (!nome) { alert('Informe o nome do formulário.'); return; }
  const campos = [...document.querySelectorAll('.g-campo-card')].map((el, i) => ({
    id: el.dataset.campoId || ('c_' + i),
    label: el.querySelector('.g-campo-label-input')?.value || '',
    tipo: 'nota', obrigatorio: false,
  }));
  const form = { id, nome, tipo, campos, ativo: true, criado_em: new Date().toISOString() };
  GestorDB.upsert('formularios', form);
  document.querySelector('.g-overlay')?.remove();
  gestorIrPara('automacao');
};

window.gestorNovoModelo  = function() { gestorAbrirModalModelo(null); };
window.gestorEditarModelo = function(id) {
  const m = GestorDB.get().modelos_doc.find(x => x.id === id);
  if (m) gestorAbrirModalModelo(m);
};

function gestorAbrirModalModelo(modelo) {
  const id = modelo?.id || ('MOD_' + Date.now());
  const overlay = document.createElement('div');
  overlay.className = 'g-overlay';
  overlay.innerHTML = `
    <div class="g-modal g-modal-lg">
      <div class="g-modal-hd">
        <h3>${modelo ? 'Editar' : 'Novo'} Modelo de Documento</h3>
        <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
      </div>
      <div class="g-modal-body">
        <div class="dp-form-grid" style="margin-bottom:16px">
          <div class="dp-field dp-field-full">
            <label>Nome do Modelo</label>
            <input type="text" id="gm-nome" value="${modelo?.nome||''}" placeholder="Ex: Advertência por Escrito" />
          </div>
        </div>
        <div class="dp-field" style="margin-bottom:12px">
          <label>Conteúdo do Documento <small style="color:var(--text-muted)">(Use {colaborador}, {gestor}, {setor}, {data}, {motivo})</small></label>
          <textarea id="gm-conteudo" rows="12" style="width:100%;resize:vertical;font-family:Georgia,serif;font-size:13px">${modelo?.conteudo||''}</textarea>
        </div>
      </div>
      <div class="g-modal-ft">
        <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
        <button class="dp-btn" onclick="gestorSalvarModelo('${id}')">💾 Salvar Modelo</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

window.gestorSalvarModelo = function(id) {
  const nome = document.getElementById('gm-nome')?.value?.trim();
  const conteudo = document.getElementById('gm-conteudo')?.value;
  if (!nome) { alert('Informe o nome do modelo.'); return; }
  GestorDB.upsert('modelos_doc', { id, nome, tipo: 'custom', conteudo });
  document.querySelector('.g-overlay')?.remove();
  gestorIrPara('automacao');
};
