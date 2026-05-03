/**
 * gestor-avaliacoes.js — Avaliações de Experiência (D+15 / D+45)
 * Expõe: window.GestorAvaliacoes
 */
window.GestorAvaliacoes = (() => {
  let _filtro = 'todas';

  function render(container) {
    GestorMotor.run();
    const db     = GestorDB.get();
    const colabs = GestorColabs.getBySector();
    const isRH   = GestorUser.isRH();

    const todasAvas = db.avaliacoes.filter(a =>
      isRH ? true : colabs.find(c => c.id === a.colaborador_id));

    const filtradas = _filtro === 'todas'
      ? todasAvas
      : todasAvas.filter(a => a.status === _filtro);

    const counts = {
      todas:    todasAvas.length,
      pendente: todasAvas.filter(a => a.status === 'pendente').length,
      proxima:  todasAvas.filter(a => a.status === 'proxima').length,
      atrasada: todasAvas.filter(a => a.status === 'atrasada').length,
      concluida:todasAvas.filter(a => a.status === 'concluida').length,
    };

    container.innerHTML = `
<div>
  ${isRH ? `<div class="g-alert g-alert-info"><span>🏢</span><span>Visão RH — exibindo avaliações de todos os setores. Você pode visualizar, editar e excluir qualquer avaliação.</span></div>` : ''}

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div class="g-filter-bar" style="margin:0">
      ${_filtroBtn('todas',    `Todas (${counts.todas})`, '')}
      ${_filtroBtn('pendente', `Pendentes (${counts.pendente})`, '')}
      ${_filtroBtn('proxima',  `Próximas (${counts.proxima})`, 'warn')}
      ${_filtroBtn('atrasada', `Atrasadas (${counts.atrasada})`, 'danger')}
      ${_filtroBtn('concluida',`Concluídas (${counts.concluida})`, '')}
    </div>
    ${isRH ? `<button class="dp-btn dp-btn-secondary" onclick="gestorExportarAvaliacoes()">📊 Exportar</button>` : ''}
  </div>

  ${filtradas.length === 0
    ? `<div class="g-empty"><span class="g-empty-icon">📋</span><p>Nenhuma avaliação encontrada</p><small>As avaliações são criadas automaticamente ao admitir colaboradores.</small></div>`
    : `<div class="g-table-wrap"><table class="g-table">
        <thead><tr>
          <th>Colaborador</th><th>Setor</th><th>Tipo</th><th>Prazo</th>
          <th>Status</th><th>Média</th><th>Ações</th>
        </tr></thead>
        <tbody>
          ${filtradas.map(a => _rowAvaliacao(a, isRH)).join('')}
        </tbody>
      </table></div>`}
</div>`;
  }

  function _filtroBtn(val, label, extra) {
    const ativo = _filtro === val ? 'ativo' : '';
    return `<button class="g-filter-btn ${ativo} ${extra}" onclick="gestorFiltroAvaliacoes('${val}')">${label}</button>`;
  }

  function _rowAvaliacao(a, isRH) {
    const diasRestantes = Math.ceil((new Date(a.prazo + 'T23:59:59') - new Date()) / 86400000);
    const prazoLabel    = a.status === 'concluida'
      ? `<small style="color:var(--text-muted)">Concluída em ${GestorFmt.data(a.concluida_em)}</small>`
      : diasRestantes < 0
        ? `<span style="color:#dc2626;font-size:11px;font-weight:700">${Math.abs(diasRestantes)}d atrasada</span>`
        : `${GestorFmt.data(a.prazo)}<br><small style="color:var(--text-muted)">${diasRestantes}d restantes</small>`;

    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="g-avatar" style="width:28px;height:28px;font-size:10px">${GestorFmt.ini(a.colaborador_nome)}</div>
          <div>
            <strong>${a.colaborador_nome}</strong>
            <small style="display:block;color:var(--text-muted)">${a.cargo || ''}</small>
          </div>
        </div>
      </td>
      <td>${a.setor || '—'}</td>
      <td><strong style="color:var(--primary)">${a.tipo === '15d' ? '⏱️ 15 dias' : '📋 45 dias'}</strong></td>
      <td>${prazoLabel}</td>
      <td><span class="g-status g-status-${a.status}">${_statusLabel(a.status)}</span></td>
      <td>${a.media != null ? `<strong>${a.media.toFixed(1)}</strong>/5.0` : '—'}</td>
      <td style="white-space:nowrap">
        ${a.status !== 'concluida'
          ? `<button class="dp-btn" style="font-size:11px;padding:4px 10px" onclick="gestorResponderAvaliacao('${a.id}')">✍️ Responder</button>`
          : `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 10px" onclick="gestorVerAvaliacao('${a.id}')">👁️ Ver</button>`}
        ${isRH ? `<button class="dp-btn-icon" style="padding:4px 8px;margin-left:4px;border:1px solid var(--border-color);border-radius:6px;cursor:pointer;background:transparent;color:#ef4444" onclick="gestorExcluirAvaliacao('${a.id}')">🗑️</button>` : ''}
      </td>
    </tr>`;
  }

  function _statusLabel(s) {
    return { pendente:'Pendente', proxima:'Próxima', atrasada:'Atrasada', concluida:'Concluída' }[s] || s;
  }

  // ─── MODAL RESPONDER AVALIAÇÃO ──────────────────────────────
  window.gestorFiltroAvaliacoes = function(filtro) {
    _filtro = filtro;
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorResponderAvaliacao = function(avaId) {
    const db  = GestorDB.get();
    const ava = db.avaliacoes.find(a => a.id === avaId);
    if (!ava) return;
    const form = db.formularios.find(f => f.id === ava.formulario_id) || db.formularios[0];
    if (!form) { alert('Formulário não encontrado.'); return; }

    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.id = 'g-ava-overlay';
    overlay.innerHTML = `
      <div class="g-modal g-modal-lg">
        <div class="g-modal-hd">
          <div>
            <h3>${form.nome}</h3>
            <small style="color:var(--text-muted)">${ava.colaborador_nome} · Prazo: ${GestorFmt.data(ava.prazo)}</small>
          </div>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body" id="g-ava-form">
          ${_renderFormulario(form, ava.respostas || {})}
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Cancelar</button>
          <button class="dp-btn" onclick="gestorSalvarAvaliacao('${avaId}', '${form.id}')">✅ Finalizar Avaliação</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  };

  function _renderFormulario(form, respostas) {
    return form.campos.map(c => {
      const val = respostas[c.id];
      return `
      <div class="g-form-campo">
        <label>${c.label}${c.obrigatorio ? ' <span style="color:#ef4444">*</span>' : ''}</label>
        ${_renderCampoInput(c, val)}
      </div>`;
    }).join('');
  }

  function _renderCampoInput(campo, val) {
    switch (campo.tipo) {
      case 'nota':
        return `<div class="g-stars" id="stars-${campo.id}">
          ${[1,2,3,4,5].map(n => `
            <span class="g-star ${val >= n ? 'on' : ''}" data-val="${n}"
              onclick="gestorSetStar('${campo.id}', ${n})" title="${n} estrela(s)">★</span>`).join('')}
          <input type="hidden" id="resp-${campo.id}" value="${val || ''}" />
          <small style="margin-left:8px;color:var(--text-muted)">
            ${val ? `${val}/5 — ${_notaLabel(val)}` : 'Clique para avaliar'}
          </small>
        </div>`;

      case 'sim_nao':
        return `<div class="g-sim-nao">
          <button class="${val === true ? 'on-sim' : ''}" onclick="gestorSetSimNao(this,'${campo.id}',true)">✅ Sim</button>
          <button class="${val === false ? 'on-nao' : ''}" onclick="gestorSetSimNao(this,'${campo.id}',false)">❌ Não</button>
          <input type="hidden" id="resp-${campo.id}" value="${val != null ? val : ''}" />
        </div>`;

      case 'texto':
        return `<textarea id="resp-${campo.id}" rows="3" placeholder="Descreva sua observação…"
                  style="width:100%;resize:vertical">${val || ''}</textarea>`;

      case 'multipla':
        return `<div>
          ${(campo.opcoes || []).map(op => `
            <label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;cursor:pointer">
              <input type="radio" name="resp-${campo.id}" value="${op}" ${val===op?'checked':''} />
              ${op}
            </label>`).join('')}
          <input type="hidden" id="resp-${campo.id}" value="${val||''}" />
        </div>`;

      default: return `<input type="text" id="resp-${campo.id}" value="${val||''}" />`;
    }
  }

  function _notaLabel(n) {
    return ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][n] || '';
  }

  window.gestorSetStar = function(campoId, val) {
    const cont = document.getElementById(`stars-${campoId}`);
    if (!cont) return;
    cont.querySelectorAll('.g-star').forEach(s => s.classList.toggle('on', +s.dataset.val <= val));
    const inp = document.getElementById(`resp-${campoId}`);
    if (inp) inp.value = val;
    const small = cont.querySelector('small');
    if (small) small.textContent = `${val}/5 — ${_notaLabel(val)}`;
  };

  window.gestorSetSimNao = function(btn, campoId, valor) {
    const cont = btn.closest('.g-sim-nao');
    cont.querySelectorAll('button').forEach(b => b.classList.remove('on-sim','on-nao'));
    btn.classList.add(valor ? 'on-sim' : 'on-nao');
    const inp = document.getElementById(`resp-${campoId}`);
    if (inp) inp.value = valor;
  };

  window.gestorSalvarAvaliacao = function(avaId, formId) {
    const db   = GestorDB.get();
    const ava  = db.avaliacoes.find(a => a.id === avaId);
    const form = db.formularios.find(f => f.id === formId);
    if (!ava || !form) return;

    const respostas = {};
    let somaNotas = 0, qtdNotas = 0, ok = true;

    form.campos.forEach(c => {
      let val;
      if (c.tipo === 'nota')    val = +document.getElementById(`resp-${c.id}`)?.value || null;
      else if (c.tipo === 'sim_nao') {
        const v = document.getElementById(`resp-${c.id}`)?.value;
        val = v === 'true' ? true : v === 'false' ? false : null;
      } else if (c.tipo === 'multipla') {
        const checked = document.querySelector(`input[name="resp-${c.id}"]:checked`);
        val = checked?.value || document.getElementById(`resp-${c.id}`)?.value || '';
      } else val = document.getElementById(`resp-${c.id}`)?.value || '';

      if (c.obrigatorio && (val === null || val === '' || val === undefined)) {
        alert(`Campo obrigatório: "${c.label}"`);
        ok = false; return;
      }
      respostas[c.id] = val;
      if (c.tipo === 'nota' && val) { somaNotas += val; qtdNotas++; }
    });

    if (!ok) return;

    ava.respostas    = respostas;
    ava.media        = qtdNotas > 0 ? +(somaNotas / qtdNotas).toFixed(2) : null;
    ava.status       = 'concluida';
    ava.concluida_em = new Date().toISOString();
    ava.concluida_por= GestorUser.nome();

    // Registrar no histórico
    const hist = {
      id:             'HIST_' + Date.now(),
      colaborador_id: ava.colaborador_id,
      tipo:           'avaliacao',
      titulo:         `Avaliação ${ava.tipo} concluída`,
      descricao:      `Média: ${ava.media ? ava.media.toFixed(1) + '/5.0' : '—'} · Por: ${ava.concluida_por}`,
      em:             ava.concluida_em,
    };
    if (!db._historico) db._historico = [];
    db._historico.push(hist);

    GestorDB.set(db);
    GestorDB.addNotificacao('avaliacao', 'Avaliação concluída',
      `Avaliação ${ava.tipo} de ${ava.colaborador_nome} foi respondida com média ${ava.media?.toFixed(1) || '—'}`);

    document.getElementById('g-ava-overlay')?.remove();
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);

    // Feedback
    _toast(`✅ Avaliação de ${ava.colaborador_nome} salva com sucesso!`, 'ok');
  };

  window.gestorVerAvaliacao = function(avaId) {
    const db  = GestorDB.get();
    const ava = db.avaliacoes.find(a => a.id === avaId);
    if (!ava) return;
    const form = db.formularios.find(f => f.id === ava.formulario_id);

    const overlay = document.createElement('div');
    overlay.className = 'g-overlay';
    overlay.innerHTML = `
      <div class="g-modal g-modal-lg">
        <div class="g-modal-hd">
          <div>
            <h3>Resultado: ${form?.nome || 'Avaliação'}</h3>
            <small>${ava.colaborador_nome} · Concluída em ${GestorFmt.data(ava.concluida_em)} por ${ava.concluida_por || '—'}</small>
          </div>
          <button class="g-modal-close" onclick="this.closest('.g-overlay').remove()">✕</button>
        </div>
        <div class="g-modal-body">
          ${ava.media != null ? `
            <div style="text-align:center;margin-bottom:20px;padding:16px;background:rgba(37,99,235,.05);border-radius:10px">
              <div style="font-size:36px;font-weight:900;color:var(--primary)">${ava.media.toFixed(1)}</div>
              <div style="font-size:13px;color:var(--text-muted)">Média Geral / 5.0</div>
              <div class="g-stars g-star-sm" style="justify-content:center;margin-top:8px">
                ${[1,2,3,4,5].map(n => `<span class="g-star ${ava.media >= n ? 'on' : ''}">★</span>`).join('')}
              </div>
            </div>` : ''}
          ${form ? form.campos.map(c => {
            const val = ava.respostas?.[c.id];
            return `
            <div class="g-form-campo">
              <label>${c.label}</label>
              ${c.tipo === 'nota'
                ? `<div class="g-stars g-star-sm">
                    ${[1,2,3,4,5].map(n=>`<span class="g-star ${val>=n?'on':''}">★</span>`).join('')}
                    <small style="margin-left:6px">${val || '—'}/5 — ${_notaLabel(+val)}</small>
                  </div>`
                : c.tipo === 'sim_nao'
                ? `<span style="font-weight:700;color:${val===true?'#16a34a':'#dc2626'}">${val===true?'✅ Sim':'❌ Não'}</span>`
                : `<p style="color:var(--text-secondary)">${val || '—'}</p>`}
            </div>`;}).join('')
          : '<p>Formulário não encontrado.</p>'}
        </div>
        <div class="g-modal-ft">
          <button class="dp-btn dp-btn-secondary" onclick="this.closest('.g-overlay').remove()">Fechar</button>
          ${GestorUser.isRH() ? `<button class="dp-btn" onclick="gestorImprimirAvaliacao('${avaId}')">🖨️ Imprimir</button>` : ''}
        </div>
      </div>`;
    document.body.appendChild(overlay);
  };

  window.gestorExcluirAvaliacao = function(id) {
    if (!confirm('Excluir esta avaliação?')) return;
    GestorDB.remove('avaliacoes', id);
    const cont = document.getElementById('g-conteudo');
    if (cont) render(cont);
  };

  window.gestorImprimirAvaliacao = function(id) {
    window.print();
  };

  window.gestorExportarAvaliacoes = function() {
    const db = GestorDB.get();
    const linhas = ['Colaborador,Setor,Tipo,Prazo,Status,Média'];
    db.avaliacoes.forEach(a => linhas.push(`"${a.colaborador_nome}","${a.setor}","${a.tipo}","${a.prazo}","${a.status}","${a.media||''}"`));
    const blob = new Blob([linhas.join('\n')], {type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'avaliacoes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  function _toast(msg, tipo = 'ok') {
    document.querySelectorAll('.g-toast').forEach(e => e.remove());
    const el = document.createElement('div');
    el.className = `dpa-toast dpa-toast-${tipo} g-toast`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  return { render };
})();
