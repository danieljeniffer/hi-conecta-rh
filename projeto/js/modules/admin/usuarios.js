/**
 * usuarios.js — Gestão de Usuários & Permissões
 * hi Conecta RH · Acesso exclusivo: Administrador
 *
 * Expõe: renderUsuarios()
 * Storage: localStorage('hiRH_users_v1')
 */

// ─────────────────────────────────────────────────────────────
// BANCO DE USUÁRIOS (localStorage)
// ─────────────────────────────────────────────────────────────
const UsuariosDB = {
  KEY: 'hiRH_users_v1',

  _defaults() {
    return [
      { id:'USR_001', nome:'Mariana R.',       email:'admin@empresa.com.br',    senha:'admin123',    perfil:'rh',       cargo:'Analista de RH',     setor:'RH',          ativo:true,  criadoEm:'2024-01-10' },
      { id:'USR_002', nome:'Carlos Souza',     email:'gestor@empresa.com.br',   senha:'gestor123',   perfil:'gestor',   cargo:'Supervisor',          setor:'Comercial',   ativo:true,  criadoEm:'2024-01-10' },
      { id:'USR_003', nome:'João Silva',       email:'colab@empresa.com.br',    senha:'colab123',    perfil:'colab',    cargo:'Vendedor',            setor:'Comercial',   ativo:true,  criadoEm:'2024-01-15' },
      { id:'USR_004', nome:'Dra. Ana Fonseca', email:'juridico@empresa.com.br', senha:'juridico123', perfil:'juridico', cargo:'Advogada',            setor:'Jurídico',    ativo:true,  criadoEm:'2024-02-01' },
      { id:'USR_005', nome:'Admin Sistema',    email:'admin.sistema@empresa.com.br', senha:'Admin@2025', perfil:'admin', cargo:'Administrador',    setor:'TI',           ativo:true,  criadoEm:'2024-01-01' },
      { id:'USR_006', nome:'Beatriz Analista', email:'analista@empresa.com.br', senha:'analista123', perfil:'analista', cargo:'Analista de RH Jr.', setor:'RH',          ativo:true,  criadoEm:'2024-03-01' },
    ];
  },

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) { const d = this._defaults(); localStorage.setItem(this.KEY, JSON.stringify(d)); return d; }
      return JSON.parse(raw);
    } catch { return this._defaults(); }
  },

  set(lista) { localStorage.setItem(this.KEY, JSON.stringify(lista)); },

  upsert(user) {
    const lista = this.get();
    const idx   = lista.findIndex(u => u.id === user.id);
    if (idx >= 0) lista[idx] = user; else lista.push(user);
    this.set(lista);
  },

  remove(id) { this.set(this.get().filter(u => u.id !== id)); },

  findByEmail(email) { return this.get().find(u => u.email === email); },
};

// ─────────────────────────────────────────────────────────────
// ESTADO LOCAL
// ─────────────────────────────────────────────────────────────
let _uFiltro = 'todos';
let _uEdicao = null; // usuário sendo editado

// ─────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────
function renderUsuarios() {
  // Somente admin pode acessar
  if (!Auth.isAdmin()) {
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;gap:16px">
      <div style="font-size:56px">🔒</div>
      <h2 style="margin:0;font-size:22px">Acesso Restrito</h2>
      <p style="color:var(--text-muted,#64748b);max-width:380px">
        Esta área é exclusiva para Administradores do sistema.<br>
        Fale com o responsável pelo TI para solicitar acesso.
      </p>
    </div>`;
  }

  const lista   = UsuariosDB.get();
  const filtrada = _uFiltro === 'todos' ? lista : lista.filter(u => u.perfil === _uFiltro);
  const totalPorPerfil = _contarPorPerfil(lista);

  return `
<div class="usr-root">

  <!-- HERO ──────────────────────────────────────────── -->
  <div class="usr-hero">
    <div class="usr-hero-left">
      <div class="usr-hero-icon">🔐</div>
      <div>
        <h2>Usuários & Permissões</h2>
        <p>Gerencie os acessos e perfis de todos os usuários do sistema.</p>
      </div>
    </div>
    <button class="dp-btn usr-btn-novo" onclick="usuNovo()">+ Novo Usuário</button>
  </div>

  <!-- STATS ──────────────────────────────────────────── -->
  <div class="usr-stats">
    ${Object.entries(Auth.PERFIL_LABELS).map(([key, info]) => `
      <div class="usr-stat-card" style="border-top:3px solid ${info.cor}">
        <span style="font-size:22px">${info.icon}</span>
        <div>
          <strong style="font-size:20px;color:${info.cor}">${totalPorPerfil[key] || 0}</strong>
          <small>${info.label}</small>
        </div>
      </div>`).join('')}
    <div class="usr-stat-card" style="border-top:3px solid #22c55e">
      <span style="font-size:22px">👥</span>
      <div>
        <strong style="font-size:20px;color:#16a34a">${lista.filter(u => u.ativo).length}</strong>
        <small>Ativos</small>
      </div>
    </div>
  </div>

  <!-- FILTROS ────────────────────────────────────────── -->
  <div class="usr-filter-bar">
    <button class="usr-filter ${_uFiltro==='todos'?'ativo':''}" onclick="usuFiltrar('todos')">Todos (${lista.length})</button>
    ${Object.entries(Auth.PERFIL_LABELS).map(([key, info]) => `
      <button class="usr-filter ${_uFiltro===key?'ativo':''}" onclick="usuFiltrar('${key}')">
        ${info.icon} ${info.label} (${totalPorPerfil[key]||0})
      </button>`).join('')}
  </div>

  <!-- TABELA ─────────────────────────────────────────── -->
  <div class="usr-table-wrap">
    <table class="usr-table">
      <thead><tr>
        <th>Usuário</th>
        <th>E-mail</th>
        <th>Perfil</th>
        <th>Setor</th>
        <th>Status</th>
        <th>Criado em</th>
        <th>Ações</th>
      </tr></thead>
      <tbody>
        ${filtrada.length === 0
          ? `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted,#94a3b8)">Nenhum usuário encontrado.</td></tr>`
          : filtrada.map(u => _rowUsuario(u)).join('')}
      </tbody>
    </table>
  </div>

  <!-- LEGENDA DE PERMISSÕES ──────────────────────────── -->
  <div class="usr-matrix-wrap">
    <div class="usr-matrix-hd">
      <h4>📊 Matriz de Permissões por Perfil</h4>
      <small>✏️ Editar &nbsp;·&nbsp; 👁️ Visualizar &nbsp;·&nbsp; 👤 Apenas próprio &nbsp;·&nbsp; ✋ Responder &nbsp;·&nbsp; — Sem acesso</small>
    </div>
    ${_renderMatriz()}
  </div>

</div>`;
}

function _contarPorPerfil(lista) {
  return lista.reduce((acc, u) => { acc[u.perfil] = (acc[u.perfil] || 0) + 1; return acc; }, {});
}

function _rowUsuario(u) {
  const info    = Auth.PERFIL_LABELS[u.perfil] || { label: u.perfil, icon: '?', cor: '#94a3b8' };
  const iniciais = u.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const isMe     = Auth.user().email === u.email;
  return `
<tr>
  <td>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:34px;height:34px;border-radius:50%;background:${info.cor}20;color:${info.cor};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0">${iniciais}</div>
      <div>
        <strong>${u.nome}</strong>${isMe ? ' <span style="font-size:9px;background:#dbeafe;color:#2563eb;padding:1px 6px;border-radius:10px;font-weight:700">Você</span>' : ''}
        <small style="display:block;color:var(--text-muted,#94a3b8)">${u.cargo || '—'}</small>
      </div>
    </div>
  </td>
  <td><small>${u.email}</small></td>
  <td>
    <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:${info.cor}15;color:${info.cor};border:1px solid ${info.cor}30">
      ${info.icon} ${info.label}
    </span>
  </td>
  <td>${u.setor || '—'}</td>
  <td>
    <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;${u.ativo ? 'background:#dcfce7;color:#16a34a' : 'background:#f1f5f9;color:#94a3b8'}">
      ${u.ativo ? '● Ativo' : '○ Inativo'}
    </span>
  </td>
  <td><small style="color:var(--text-muted,#94a3b8)">${u.criadoEm || '—'}</small></td>
  <td style="white-space:nowrap">
    <button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="usuEditar('${u.id}')">✏️ Editar</button>
    ${!isMe ? `<button style="background:transparent;border:1px solid #fecaca;color:#ef4444;border-radius:6px;padding:4px 8px;cursor:pointer;margin-left:4px;font-size:11px" onclick="usuToggleAtivo('${u.id}')">${u.ativo ? 'Desativar' : 'Ativar'}</button>` : ''}
    ${!isMe ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;padding:4px 8px;font-size:12px" onclick="usuExcluir('${u.id}')">🗑️</button>` : ''}
  </td>
</tr>`;
}

function _renderMatriz() {
  const modulos = [
    { key: 'dashboard',    label: 'Dashboard'        },
    { key: 'recrutamento', label: 'Recrutamento'      },
    { key: 'departamento', label: 'Depto. Pessoal'   },
    { key: 'pessoas',      label: 'Gestão de Pessoas' },
    { key: 'gestor',       label: 'Performance/AVD'  },
    { key: 'clima',        label: 'Engajamento'       },
    { key: 'comunicacao',  label: 'Comunicação'       },
    { key: 'indicadores',  label: 'Indicadores'       },
    { key: 'usuarios',     label: 'Configurações'     },
    { key: 'cargos',       label: 'Cargos'           },
    { key: 'desenvolvimento', label: 'T&D'           },
    { key: 'documentos',   label: 'Documentos'       },
    { key: 'integracoes',  label: 'Integrações'      },
  ];
  const perfis = ['admin','rh','gestor','analista','colab'];
  const icons  = { edit:'✏️', view:'👁️', own:'👤', responder:'✋', false:'—' };
  const cores  = { edit:'#dcfce7', view:'#dbeafe', own:'#fef3c7', responder:'#f0fdf4', false:'#f1f5f9' };
  const tcores = { edit:'#15803d', view:'#1d4ed8', own:'#92400e', responder:'#166534', false:'#94a3b8' };

  return `
<div class="usr-matrix-scroll">
  <table class="usr-matrix">
    <thead>
      <tr>
        <th>Módulo</th>
        ${perfis.map(p => `<th style="color:${Auth.PERFIL_LABELS[p]?.cor}">${Auth.PERFIL_LABELS[p]?.icon} ${Auth.PERFIL_LABELS[p]?.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${modulos.map(m => `
        <tr>
          <td><strong style="font-size:12px">${m.label}</strong></td>
          ${perfis.map(p => {
            const perm = Auth.MATRIX[p]?.[m.key] || false;
            const permStr = String(perm);
            return `<td style="text-align:center">
              <span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:${cores[permStr]||'#f1f5f9'};color:${tcores[permStr]||'#94a3b8'}">
                ${icons[permStr]||'—'} ${permStr !== 'false' ? permStr.charAt(0).toUpperCase()+permStr.slice(1) : 'Sem acesso'}
              </span>
            </td>`;
          }).join('')}
        </tr>`).join('')}
    </tbody>
  </table>
</div>`;
}

// ─────────────────────────────────────────────────────────────
// MODAL CRIAR / EDITAR
// ─────────────────────────────────────────────────────────────
window.usuNovo = function() {
  _uEdicao = null;
  _abrirModal(null);
};

window.usuEditar = function(id) {
  _uEdicao = UsuariosDB.get().find(u => u.id === id) || null;
  _abrirModal(_uEdicao);
};

function _abrirModal(user) {
  const isEdicao = !!user;
  const perfis   = Object.entries(Auth.PERFIL_LABELS);
  const setores  = ['RH','Comercial','Financeiro','Operacional','TI','Marketing','Jurídico','Administrativo','Produção'];

  const overlay = document.createElement('div');
  overlay.className = 'usr-overlay';
  overlay.id = 'usr-modal-overlay';
  overlay.innerHTML = `
<div class="usr-modal">
  <div class="usr-modal-hd">
    <h3>${isEdicao ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</h3>
    <button class="usr-modal-close" onclick="document.getElementById('usr-modal-overlay').remove()">✕</button>
  </div>
  <div class="usr-modal-body">

    <!-- Nome + E-mail -->
    <div class="dp-form-grid">
      <div class="dp-field dp-field-full">
        <label>Nome Completo <span style="color:#ef4444">*</span></label>
        <input type="text" id="usr-nome" value="${user?.nome||''}" placeholder="Nome do usuário" />
      </div>
      <div class="dp-field dp-field-full">
        <label>E-mail <span style="color:#ef4444">*</span></label>
        <input type="email" id="usr-email" value="${user?.email||''}" placeholder="email@empresa.com.br" ${isEdicao?'readonly style="background:var(--bg-sidebar,#f8fafc)"':''} />
      </div>
      <div class="dp-field">
        <label>Senha ${isEdicao ? '<small style="color:var(--text-muted)">(deixe vazio para manter)</small>' : '<span style="color:#ef4444">*</span>'}</label>
        <div style="position:relative">
          <input type="password" id="usr-senha" placeholder="${isEdicao?'Nova senha (opcional)':'Mínimo 6 caracteres'}" style="padding-right:40px" />
          <button type="button" onclick="usuToggleSenha('usr-senha')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:16px">👁</button>
        </div>
      </div>
      <div class="dp-field">
        <label>Confirmar Senha</label>
        <div style="position:relative">
          <input type="password" id="usr-senha2" placeholder="Repita a senha" style="padding-right:40px" />
          <button type="button" onclick="usuToggleSenha('usr-senha2')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:16px">👁</button>
        </div>
      </div>
    </div>

    <!-- Perfil com descrição dinâmica -->
    <div class="dp-field" style="margin-bottom:8px">
      <label>Perfil de Acesso <span style="color:#ef4444">*</span></label>
      <select id="usr-perfil" onchange="usuDescricaoPerfil(this.value)">
        ${perfis.map(([key, info]) => `
          <option value="${key}" ${user?.perfil===key?'selected':''}>${info.icon} ${info.label}</option>`).join('')}
      </select>
    </div>
    <div class="usr-perfil-desc" id="usr-perfil-desc">
      ${_descricaoPerfil(user?.perfil || 'rh')}
    </div>

    <!-- Cargo + Setor -->
    <div class="dp-form-grid" style="margin-top:14px">
      <div class="dp-field">
        <label>Cargo / Função</label>
        <input type="text" id="usr-cargo" value="${user?.cargo||''}" placeholder="Ex: Analista de RH" />
      </div>
      <div class="dp-field">
        <label>Setor / Departamento</label>
        <select id="usr-setor">
          <option value="">Selecione</option>
          ${setores.map(s => `<option value="${s}" ${user?.setor===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Status -->
    <div class="dp-field" style="margin-top:14px">
      <label>Status</label>
      <div style="display:flex;gap:12px">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="usr-ativo" value="true"  ${!isEdicao||user?.ativo ?'checked':''} /> Ativo
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="usr-ativo" value="false" ${isEdicao&&!user?.ativo?'checked':''} /> Inativo
        </label>
      </div>
    </div>

  </div>
  <div class="usr-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="document.getElementById('usr-modal-overlay').remove()">Cancelar</button>
    <button class="dp-btn" onclick="usuSalvar('${user?.id||''}')">
      ${isEdicao ? '💾 Salvar Alterações' : '✅ Criar Usuário'}
    </button>
  </div>
</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => usuDescricaoPerfil(user?.perfil || 'rh'), 0);
}

function _descricaoPerfil(perfil) {
  const info = Auth.PERFIL_LABELS[perfil] || {};
  const desc = Auth.getDescricaoPerfil(perfil);
  const pages = Auth.SIDEBAR_PAGES[perfil] || [];
  return `
<div class="usr-perfil-info" style="border-left:3px solid ${info.cor||'#94a3b8'}">
  <strong style="color:${info.cor||'#94a3b8'}">${info.icon||''} ${info.label||perfil}</strong>
  <p>${desc}</p>
  <small>Módulos visíveis: <strong>${pages.length}</strong> de ${Object.keys(Auth.SIDEBAR_PAGES.admin).length}</small>
</div>`;
}

window.usuDescricaoPerfil = function(perfil) {
  const el = document.getElementById('usr-perfil-desc');
  if (el) el.innerHTML = _descricaoPerfil(perfil);
};

window.usuToggleSenha = function(id) {
  const el = document.getElementById(id);
  if (el) el.type = el.type === 'password' ? 'text' : 'password';
};

window.usuSalvar = function(idExistente) {
  const nome  = document.getElementById('usr-nome')?.value?.trim();
  const email = document.getElementById('usr-email')?.value?.trim();
  const senha = document.getElementById('usr-senha')?.value;
  const senha2= document.getElementById('usr-senha2')?.value;
  const perfil= document.getElementById('usr-perfil')?.value;
  const cargo = document.getElementById('usr-cargo')?.value?.trim();
  const setor = document.getElementById('usr-setor')?.value;
  const ativo = document.querySelector('input[name="usr-ativo"]:checked')?.value !== 'false';

  // Validação
  if (!nome || !email || !perfil) { _toast('⚠️ Preencha nome, e-mail e perfil.', 'warn'); return; }
  if (!idExistente && !senha)     { _toast('⚠️ Informe uma senha para o novo usuário.', 'warn'); return; }
  if (senha && senha.length < 6)  { _toast('⚠️ A senha deve ter pelo menos 6 caracteres.', 'warn'); return; }
  if (senha && senha !== senha2)  { _toast('⚠️ As senhas não conferem.', 'error'); return; }

  const emailExistente = UsuariosDB.findByEmail(email);
  if (!idExistente && emailExistente) { _toast('⚠️ Este e-mail já está cadastrado.', 'warn'); return; }

  const id   = idExistente || 'USR_' + Date.now();
  const hoje = new Date().toISOString().split('T')[0];
  const user = {
    id, nome, email, perfil, cargo, setor, ativo,
    criadoEm: idExistente ? (UsuariosDB.get().find(u=>u.id===idExistente)?.criadoEm || hoje) : hoje,
  };
  if (senha) user.senha = senha;
  else if (idExistente) user.senha = UsuariosDB.get().find(u=>u.id===idExistente)?.senha || '';

  UsuariosDB.upsert(user);
  document.getElementById('usr-modal-overlay')?.remove();

  // Re-renderizar
  const container = document.getElementById('pageContainer');
  if (container) container.innerHTML = renderUsuarios();
  _toast(`✅ Usuário "${nome}" ${idExistente?'atualizado':'criado'} com sucesso!`, 'ok');
};

window.usuToggleAtivo = function(id) {
  const lista = UsuariosDB.get();
  const u = lista.find(x => x.id === id);
  if (!u) return;
  u.ativo = !u.ativo;
  UsuariosDB.set(lista);
  const container = document.getElementById('pageContainer');
  if (container) container.innerHTML = renderUsuarios();
  _toast(`Usuário ${u.ativo ? 'ativado' : 'desativado'}.`, 'ok');
};

window.usuExcluir = function(id) {
  const u = UsuariosDB.get().find(x => x.id === id);
  if (!u) return;
  if (!confirm(`Excluir permanentemente o usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
  UsuariosDB.remove(id);
  const container = document.getElementById('pageContainer');
  if (container) container.innerHTML = renderUsuarios();
  _toast(`Usuário "${u.nome}" excluído.`, 'ok');
};

window.usuFiltrar = function(filtro) {
  _uFiltro = filtro;
  const container = document.getElementById('pageContainer');
  if (container) container.innerHTML = renderUsuarios();
};

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function _toast(msg, tipo = 'ok') {
  document.querySelectorAll('.usr-toast').forEach(e => e.remove());
  const el = document.createElement('div');
  el.className = `dpa-toast dpa-toast-${tipo} usr-toast`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}

// ─────────────────────────────────────────────────────────────
// ESTILOS INLINE (sem criar novo CSS)
// ─────────────────────────────────────────────────────────────
(function _injectStyles() {
  if (document.getElementById('usr-styles')) return;
  const style = document.createElement('style');
  style.id = 'usr-styles';
  style.textContent = `
/* ── Usuários module ───────────────────────── */
.usr-root { display:flex;flex-direction:column;gap:20px; }

.usr-hero {
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
  background:linear-gradient(135deg,#1e3a5f,#2563eb,#7c3aed);
  border-radius:14px;padding:20px 24px;color:#fff;
}
.usr-hero-left { display:flex;align-items:center;gap:14px; }
.usr-hero-icon { font-size:36px; }
.usr-hero h2   { margin:0 0 4px;font-size:20px;font-weight:800;color:#fff; }
.usr-hero p    { margin:0;font-size:13px;color:rgba(255,255,255,.75); }
.usr-btn-novo  { background:#fff!important;color:#2563eb!important;font-weight:700; }

.usr-stats { display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px; }
.usr-stat-card {
  background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);
  border-radius:10px;padding:14px;display:flex;align-items:center;gap:10px;
}
.usr-stat-card strong { display:block;line-height:1; }
.usr-stat-card small  { font-size:10px;color:var(--text-muted,#94a3b8);font-weight:600; }

.usr-filter-bar { display:flex;gap:6px;flex-wrap:wrap; }
.usr-filter {
  padding:5px 12px;border-radius:20px;border:1px solid var(--border-color,#e2e8f0);
  font-size:11px;font-weight:600;cursor:pointer;background:transparent;color:var(--text-muted,#64748b);
  transition:all .15s;
}
.usr-filter.ativo  { background:var(--primary,#2563eb);color:#fff;border-color:var(--primary,#2563eb); }
.usr-filter:hover:not(.ativo) { border-color:var(--primary,#2563eb);color:var(--primary,#2563eb); }

.usr-table-wrap { overflow-x:auto;background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px; }
.usr-table { width:100%;border-collapse:collapse;font-size:13px; }
.usr-table th {
  text-align:left;padding:10px 14px;
  font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;
  color:var(--text-muted,#94a3b8);border-bottom:1px solid var(--border-color,#e2e8f0);
}
.usr-table td { padding:12px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);vertical-align:middle; }
.usr-table tr:last-child td { border-bottom:none; }
.usr-table tr:hover td { background:var(--bg-sidebar,#f8fafc); }

/* Matriz */
.usr-matrix-wrap { background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:18px; }
.usr-matrix-hd   { margin-bottom:14px; }
.usr-matrix-hd h4{ margin:0 0 4px;font-size:14px;font-weight:700; }
.usr-matrix-hd small { font-size:11px;color:var(--text-muted,#94a3b8); }
.usr-matrix-scroll { overflow-x:auto; }
.usr-matrix { width:100%;border-collapse:collapse;font-size:12px;min-width:680px; }
.usr-matrix th { padding:8px 12px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.5px;border-bottom:1px solid var(--border-color,#e2e8f0);white-space:nowrap; }
.usr-matrix th:first-child { text-align:left; }
.usr-matrix td { padding:8px 12px;border-bottom:1px solid var(--border-color,#f8fafc);text-align:center; }
.usr-matrix td:first-child { text-align:left; }
.usr-matrix tr:hover td { background:var(--bg-sidebar,#f8fafc); }

/* Modal */
.usr-overlay {
  position:fixed;inset:0;z-index:9500;
  background:rgba(0,0,0,.55);backdrop-filter:blur(3px);
  display:flex;align-items:center;justify-content:center;padding:20px;
}
.usr-modal {
  background:var(--bg-card,#fff);border-radius:16px;
  width:100%;max-width:560px;max-height:90vh;overflow-y:auto;
  box-shadow:0 16px 48px rgba(0,0,0,.25);
}
.usr-modal-hd {
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 22px;border-bottom:1px solid var(--border-color,#e2e8f0);
  position:sticky;top:0;background:var(--bg-card,#fff);z-index:1;
}
.usr-modal-hd h3 { margin:0;font-size:16px;font-weight:800; }
.usr-modal-close { border:none;background:var(--bg-sidebar,#f8fafc);border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px; }
.usr-modal-body  { padding:22px; }
.usr-modal-ft    { padding:14px 22px;border-top:1px solid var(--border-color,#e2e8f0);display:flex;gap:10px;justify-content:flex-end; }

/* Perfil desc */
.usr-perfil-desc { margin-bottom:4px; }
.usr-perfil-info {
  background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:12px 14px;
  font-size:12px;line-height:1.5;
}
.usr-perfil-info strong { display:block;margin-bottom:4px;font-size:13px; }
.usr-perfil-info p { margin:0 0 6px;color:var(--text-secondary,#475569); }
.usr-perfil-info small { color:var(--text-muted,#94a3b8); }

@media(max-width:640px) {
  .usr-hero { flex-direction:column; }
  .usr-stats { grid-template-columns:repeat(3,1fr); }
}
`;
  document.head.appendChild(style);
})();
