/**
 * gestor-reunioes.js — Reuniões por Setor
 * Criar, listar e visualizar reuniões do time
 * Expõe: window.GestorReunioes
 */
window.GestorReunioes = (() => {
  let _filtro = 'proximas'; // 'proximas' | 'realizadas' | 'todas'

  // ─── RENDER PRINCIPAL ──────────────────────────────────────
  function render(container) {
    const db     = GestorDB.get();
    const now    = new Date();
    const colabs = GestorColabs.getBySector();
    const isRH   = GestorUser.isRH();

    const todasReu = db.reunioes.filter(r =>
      isRH ? true : (!r.setor || r.setor === GestorUser.setor()));

    const proximas   = todasReu.filter(r => new Date(r.data_hora) >= now);
    const realizadas = todasReu.filter(r => new Date(r.data_hora) < now);

    const filtradas = _filtro === 'proximas'   ? proximas
                    : _filtro === 'realizadas' ? realizadas
                    : todasReu;

    container.innerHTML = `
<div>
  <!-- Header com filtros + botão -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div class="g-filter-bar" style="margin:0">
      <button class="g-filter-btn ${_filtro==='proximas'?'ativo':''}" onclick="gestorReuFiltro('proximas')">
        📅 Próximas (${proximas.length})
      </button>
      <button class="g-filter-btn ${_filtro==='realizadas'?'ativo':''}" onclick="gestorReuFiltro('realizadas')">
        ✅ Realizadas (${realizadas.length})
      </button>
      <button class="g-filter-btn ${_filtro==='todas'?'ativo':''}" onclick="gestorReuFiltro('todas')">
        Todas (${todasReu.length})
      </button>
    </div>
    <button class="dp-btn" onclick="gestorNovaReuniao()">+ Nova Reunião</button>
  </div>

  <!-- Lista de reuniões -->
  ${filtradas.length === 0
    ? `<div class="g-card">
        <div class="g-empty">
          <span class="g-empty-icon">📅</span>
          <p>${_filtro === 'proximas' ? 'Nenhuma reunião agendada' : 'Nenhuma reunião encontrada'}</p>
          <small>Clique em "+ Nova Reunião" para criar.</small>
        </div>
      </div>`
    : `<div style="display:flex;flex-direction:column;gap:10px">
        ${filtradas
          .sort((a,b) => new Date(a.data_hora) - new Date(b.data_hora))
          .map(r => _cardReuniao(r, now)).join('')}
      </div>`}
</div>`;
  }

  function _cardReuniao(r, now) {
    const dt       = new Date(r.data_hora);
    const passada  = dt < now;
    const hoje     = dt.toDateString() === now.toDateString();
    const dia      = String(dt.getDate()).padStart(2,'0');
    const mes      = dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase();
    const hora     = dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const diasRest = Math.ceil((dt - now) / 86400000);

    const corCard  = passada ? '#94a3b8' : hoje ? '#f59e0b' : '#3b82f6';
    const labelReu = passada ? 'Realizada' : hoje ? 'Hoje' : `Em ${diasRest}d`;

    return `
<div class="g-card" style="cursor:pointer;border-left:4px solid ${corCard};padding:16px" onclick="gestorVerReuniao('${r.id}')">
  <div style="display:flex;gap:16px;align-items:flex-start">
    <!-- Data pill -->
    <div style="min-width:52px;background:${corCard};color:#fff;border-radius:12px;padding:8px 6px;text-align:center;flex-shrink:0">
      <div style="font-size:20px;font-weight:900;line-height:1">${dia}</div>
      <div style="font-size:10px;font-weight:700;opacity:.9">${mes}</div>
    </div>
    <!-- Info -->
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <strong style="font-size:15px">${r.titulo}</strong>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${corCard}18;color:${corCard};border:1px solid ${corCard}30">${labelReu}</span>
        ${r.setor ? `<span class="g-reu-setor">${r.setor}</span>` : ''}
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <span style="font-size:12px;color:var(--text-muted)">🕐 ${hora}</span>
        ${r.local ? `<span style="font-size:12px;color:var(--text-muted)">📍 ${r.local}</span>` : ''}
        <span style="font-size:12px;color:var(--text-muted)">👤 Por: ${r.criada_por||'—'}</span>
        ${r.participantes?.length ? `<span style="font-size:12px;color:var(--text-muted)">👥 ${r.participantes.length} participante(s)</span>` : ''}
      </div>
      ${r.pauta ? `<p style="margin:6px 0 0;font-size:12px;color:var(--text-secondary);line-height:1.5">${r.pauta.slice(0,120)}${r.pauta.length>120?'…':''}</p>` : ''}
    </div>
    <!-- Ações -->
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0">
      ${!passada ? `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px;white-space:nowrap" onclick="event.stopPropagation();gestorEditarReuniao('${r.id}')">✏️ Editar</button>` : ''}
      ${GestorUser.isRH() ? `<button style="background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:12px" onclick="event.stopPropagation();gestorExcluirReuniao('${r.id}')">🗑️</button>` : ''}
    </div>
  </div>
</div>`;
  }

  // ─── MODAL NOVA / EDITAR REUNIÃO ──────────────────────────
  window.gestorNovaReuniao = function() { _abrirModal(null); };
  window.gestorEditarReuniao = function(id) {
    const r = GestorDB.get().reunioes.find(x => x.id === id);
    if (r) _abrirModal(r);
  };

  function _abrirModal(reu) {
    const isEdicao = !!reu;
    const colabs   = GestorColabs.getBySector();
    const setores  = ['Geral','RH','Comercial','Financeiro','Operacional','TI','Marketing','Jurídico'];
    const user     = GestorUser.get();

    // data-hora padrão: amanhã 09h
    const amanha = new Date(); amanha.setDate(amanha.getDate()+1); amanha.setHours(9,0,0,0);
    const dtDefault = reu?.data_hora
      ? new Date(reu.data_hora).toISOString().slice(0,16)
      : amanha.toISOString().slice(0,16);

    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.id = 'g-reu-overlay';
    overlay.innerHTML = `
<div class="g-modal g-modal-lg">
  <div class="g-modal-hd">
    <h3>${isEdicao ? '✏️ Editar Reunião' : '📅 Nova Reunião'}</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div class="dp-form-grid">
      <div class="dp-field dp-field-full">
        <label>Título da Reunião <span style="color:#ef4444">*</span></label>
        <input type="text" id="greu-titulo" value="${reu?.titulo||''}" placeholder="Ex: Alinhamento semanal da equipe" />
      </div>
      <div class="dp-field">
        <label>Data e Hora <span style="color:#ef4444">*</span></label>
        <input type="datetime-local" id="greu-dt" value="${dtDefault}" />
      </div>
      <div class="dp-field">
        <label>Local / Link</label>
        <input type="text" id="greu-local" value="${reu?.local||''}" placeholder="Ex: Sala 3 ou https://meet.google.com/..." />
      </div>
      <div class="dp-field">
        <label>Setor</label>
        <select id="greu-setor">
          ${setores.map(s => `<option value="${s}" ${(reu?.setor||user.setor||'Geral')===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="dp-field">
        <label>Duração prevista</label>
        <select id="greu-duracao">
          <option value="30min" ${reu?.duracao==='30min'?'selected':''}>30 minutos</option>
          <option value="1h"    ${reu?.duracao==='1h'||!reu?.duracao?'selected':''}>1 hora</option>
          <option value="1h30"  ${reu?.duracao==='1h30'?'selected':''}>1h30</option>
          <option value="2h"    ${reu?.duracao==='2h'?'selected':''}>2 horas</option>
        </select>
      </div>
    </div>

    <div class="dp-field" style="margin-top:12px">
      <label>Pauta / Descrição</label>
      <textarea id="greu-pauta" rows="3" style="width:100%;resize:vertical" placeholder="Tópicos que serão abordados na reunião...">${reu?.pauta||''}</textarea>
    </div>

    <!-- Participantes -->
    <div style="margin-top:14px">
      <label style="font-size:12px;font-weight:700;margin-bottom:8px;display:block">Participantes</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;max-height:180px;overflow-y:auto;padding:8px;border:1px solid var(--border-color,#e2e8f0);border-radius:8px">
        ${colabs.map(c => {
          const nome = c.nome_completo || c.nome || '';
          const check = reu?.participantes?.includes(c.id) ? 'checked' : '';
          return `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;padding:4px 6px;border-radius:6px;transition:background .1s" onmouseover="this.style.background='var(--bg-sidebar,#f8fafc)'" onmouseout="this.style.background=''">
            <input type="checkbox" value="${c.id}" data-nome="${nome}" class="greu-part" ${check} />
            <div class="g-avatar" style="width:22px;height:22px;font-size:8px;flex-shrink:0">${GestorFmt.ini(nome)}</div>
            ${nome}
          </label>`;
        }).join('')}
      </div>
      <small style="color:var(--text-muted,#94a3b8);font-size:11px">Os participantes serão notificados automaticamente.</small>
    </div>
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
    <button class="dp-btn" onclick="gestorSalvarReuniao('${reu?.id||''}')">
      ${isEdicao ? '💾 Salvar Alterações' : '📅 Agendar Reunião'}
    </button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  }

  window.gestorSalvarReuniao = function(idExistente) {
    const titulo  = document.getElementById('greu-titulo')?.value?.trim();
    const dt      = document.getElementById('greu-dt')?.value;
    const local   = document.getElementById('greu-local')?.value?.trim();
    const setor   = document.getElementById('greu-setor')?.value;
    const duracao = document.getElementById('greu-duracao')?.value;
    const pauta   = document.getElementById('greu-pauta')?.value?.trim();

    if (!titulo || !dt) { alert('Preencha título e data/hora.'); return; }

    const partsEls = document.querySelectorAll('.greu-part:checked');
    const parts    = [...partsEls].map(el => el.value);
    const partNomes= [...partsEls].map(el => el.dataset.nome);

    const id  = idExistente || 'REU_' + Date.now();
    const reu = {
      id, titulo, data_hora: new Date(dt).toISOString(),
      local, setor, duracao, pauta,
      participantes: parts,
      participantes_nomes: partNomes,
      criada_por: GestorUser.nome(),
      em: new Date().toISOString(),
    };

    GestorDB.upsert('reunioes', reu);
    GestorDB.addNotificacao('reuniao', `${idExistente ? 'Reunião atualizada' : 'Nova reunião agendada'}`,
      `${titulo} — ${new Date(reu.data_hora).toLocaleDateString('pt-BR')} às ${new Date(reu.data_hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);

    // Notifica participantes (registro no histórico de cada um)
    const db = GestorDB.get();
    if (!db._historico) db._historico = [];
    parts.forEach(colabId => {
      db._historico.push({
        id: 'HIST_REU_' + colabId + '_' + Date.now(),
        colaborador_id: colabId,
        tipo: 'reuniao', titulo: `Reunião: ${titulo}`,
        descricao: `${new Date(reu.data_hora).toLocaleDateString('pt-BR')} às ${new Date(reu.data_hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,
        em: reu.em,
      });
    });
    GestorDB.set(db);

    document.getElementById('g-reu-overlay')?.remove();
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
    _showToast(`✅ Reunião "${titulo}" ${idExistente?'atualizada':'agendada'}!`);
  };

  // ─── VER REUNIÃO ──────────────────────────────────────────
  window.gestorVerReuniao = function(id) {
    const r  = GestorDB.get().reunioes.find(x => x.id === id);
    if (!r) return;
    const dt = new Date(r.data_hora);

    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
<div class="g-modal">
  <div class="g-modal-hd">
    <h3>📅 ${r.titulo}</h3>
    <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
  </div>
  <div class="g-modal-body">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Data & Hora</label>
        <p style="margin:4px 0;font-size:14px;font-weight:700">${dt.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p>
        <p style="margin:0;font-size:13px;color:var(--text-muted)">🕐 ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${r.duracao||'—'}</p>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Local</label>
        <p style="margin:4px 0;font-size:14px">${r.local || 'Não definido'}</p>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Setor</label>
        <p style="margin:4px 0"><span class="g-reu-setor">${r.setor||'Geral'}</span></p>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Criada por</label>
        <p style="margin:4px 0;font-size:13px">${r.criada_por||'—'}</p>
      </div>
    </div>

    ${r.pauta ? `
      <div style="margin-bottom:16px">
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Pauta</label>
        <div style="background:var(--bg-sidebar,#f8fafc);border-radius:8px;padding:12px;margin-top:6px;font-size:13px;line-height:1.6;white-space:pre-wrap">${r.pauta}</div>
      </div>` : ''}

    ${r.participantes_nomes?.length ? `
      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px">Participantes (${r.participantes_nomes.length})</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${r.participantes_nomes.map(n => `
            <div style="display:flex;align-items:center;gap:6px;background:var(--bg-sidebar,#f8fafc);border:1px solid var(--border-color,#e2e8f0);border-radius:20px;padding:4px 10px 4px 4px">
              <div class="g-avatar" style="width:22px;height:22px;font-size:8px">${GestorFmt.ini(n)}</div>
              <span style="font-size:12px;font-weight:600">${n}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}
  </div>
  <div class="g-modal-ft">
    <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
    ${new Date(r.data_hora) >= new Date() ? `<button class="dp-btn" onclick="gestorEditarReuniao('${r.id}');this.closest('.g-overlay').remove()">✏️ Editar</button>` : ''}
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  window.gestorExcluirReuniao = function(id) {
    if (!confirm('Excluir esta reunião?')) return;
    GestorDB.remove('reunioes', id);
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorReuFiltro = function(filtro) {
    _filtro = filtro;
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  function _showToast(msg) {
    document.querySelectorAll('.g-toast').forEach(e => e.remove());
    const el = document.createElement('div');
    el.className = 'dpa-toast dpa-toast-ok g-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  return { render };
})();
