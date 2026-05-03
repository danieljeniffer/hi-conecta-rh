/**
 * dp-notificacoes.js — Módulo de Notificações Inteligentes
 */
const DPNotificacoes = (() => {
  const PRIORIDADE_COR = { Critica: 'vermelho', Alta: 'vermelho', Normal: 'azul', Baixa: '' };
  const PRIORIDADE_ICON = { Critica: '🔴', Alta: '🟠', Normal: '🔵', Baixa: '⚪' };
  const TIPO_LABEL = {
    Ferias_Vencendo: '🌴 Férias vencendo',
    Experiencia_Vencendo: '📋 Experiência vencendo',
    Prazo_Legal: '⚖️ Prazo legal',
    Falta_Colaborador: '❌ Falta de colaborador',
    Admissao_Pendente: '📥 Admissão pendente',
    Rescisao_Pendente: '📄 Rescisão pendente',
    Decimo_Terceiro: '🎁 13º Salário',
    Alerta_Geral: '🔔 Alerta',
  };

  const fmtData = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';

  const render = async (container) => {
    container.innerHTML = `
      <div>
        <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
          <select id="dp-notif-filtro-status" class="dp-search-input" style="max-width:160px;flex:none;">
            <option value="Pendente">Pendentes</option>
            <option value="Lida">Lidas</option>
            <option value="Arquivada">Arquivadas</option>
            <option value="">Todas</option>
          </select>
          <select id="dp-notif-filtro-prio" class="dp-search-input" style="max-width:160px;flex:none;">
            <option value="">Todas as prioridades</option>
            <option value="Critica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Normal">Normal</option>
            <option value="Baixa">Baixa</option>
          </select>
          <div style="flex:1;"></div>
          <button class="dp-btn dp-btn-secondary" id="dp-notif-verificar">Executar verificações</button>
          <button class="dp-btn dp-btn-primary" id="dp-notif-falta">Registrar Falta</button>
        </div>

        <div class="dp-table-wrap">
          <div class="dp-table-header">
            <span class="dp-table-title" id="dp-notif-count">Notificações</span>
          </div>
          <div id="dp-notif-lista">
            <div style="padding:32px;text-align:center;color:#64748b;">Carregando...</div>
          </div>
        </div>

        <div id="dp-notif-modal"></div>
      </div>`;

    await carregar();
    bindEvents();
  };

  const carregar = async () => {
    const lista = document.getElementById('dp-notif-lista');
    const status = document.getElementById('dp-notif-filtro-status')?.value || 'Pendente';
    const prioridade = document.getElementById('dp-notif-filtro-prio')?.value || '';

    lista.innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;font-size:13px;">Carregando...</div>';
    try {
      const params = { status, limit: 50 };
      if (prioridade) params.prioridade = prioridade;
      const resp = await DPService.listarNotificacoes(params);

      document.getElementById('dp-notif-count').textContent = `Notificações (${resp.total || 0})`;

      if (!resp.dados?.length) {
        lista.innerHTML = '<div style="padding:32px;text-align:center;color:#64748b;font-size:13px;">Nenhuma notificação encontrada.</div>';
        return;
      }

      lista.innerHTML = resp.dados.map(n => `
        <div class="dp-notif-item ${n.status === 'Lida' ? 'lida' : ''}">
          <div class="dp-notif-icon ${PRIORIDADE_COR[n.prioridade] || 'normal'}">
            ${PRIORIDADE_ICON[n.prioridade] || '🔔'}
          </div>
          <div class="dp-notif-content">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="dp-notif-titulo">${n.titulo}</div>
              <span class="dp-card-badge ${PRIORIDADE_COR[n.prioridade] || ''}">${n.prioridade}</span>
            </div>
            <div class="dp-notif-msg">${n.mensagem}</div>
            <div class="dp-notif-meta">
              ${TIPO_LABEL[n.tipo] || n.tipo}
              ${n.data_prazo ? ` · Prazo: <strong>${fmtData(n.data_prazo)}</strong>` : ''}
              ${n.colaborador_nome ? ` · ${n.colaborador_nome}` : ''}
              · ${formatarDataRelativa(n.criado_em)}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
            ${n.status === 'Pendente' ? `
              <button class="dp-btn dp-btn-icon" title="Marcar como lida" onclick="DPNotificacoes.marcarLida('${n.id}')">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px;height:14px;"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </button>
              <button class="dp-btn dp-btn-icon" title="Arquivar" onclick="DPNotificacoes.arquivar('${n.id}')">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px;height:14px;"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      const isOffline = err.message.toLowerCase().includes('offline') || err.message.includes('refused');
      lista.innerHTML = isOffline
        ? `<div class="dp-alert dp-alert-warn" style="margin:16px;">Backend desconectado. Inicie o servidor DP para ver notificações.</div>`
        : `<div class="dp-alert dp-alert-danger" style="margin:16px;">${err.message}</div>`;
    }
  };

  const marcarLida = async (id) => {
    try {
      await DPService.marcarLida(id);
      await carregar();
    } catch (err) {
      alert(err.message);
    }
  };

  const arquivar = async (id) => {
    try {
      await DPService.arquivarNotif(id);
      await carregar();
    } catch (err) {
      alert(err.message);
    }
  };

  const abrirRegistroFalta = () => {
    const modal = document.getElementById('dp-notif-modal');
    modal.innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPNotificacoes.fecharModal()">
      <div class="dp-modal dp-modal-sm">
        <div class="dp-modal-head"><h3>Registrar Falta de Colaborador</h3><button class="dp-btn dp-btn-icon" onclick="DPNotificacoes.fecharModal()">✕</button></div>
        <div class="dp-modal-body">
          <div class="dp-form-grid" style="gap:12px;">
            <div class="dp-field dp-field-full"><label>ID do Colaborador *</label><input id="dp-falta-col" placeholder="UUID do colaborador"></div>
            <div class="dp-field"><label>Data da Falta *</label><input type="date" id="dp-falta-data" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="dp-field dp-field-full"><label>Motivo</label><input id="dp-falta-motivo" placeholder="Não informado, atestado, etc."></div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPNotificacoes.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-falta-salvar">Registrar</button>
        </div>
      </div></div>`;

    document.getElementById('dp-falta-salvar').addEventListener('click', async () => {
      try {
        await DPService.registrarFalta({
          colaborador_id: document.getElementById('dp-falta-col').value,
          data: document.getElementById('dp-falta-data').value,
          motivo: document.getElementById('dp-falta-motivo').value || 'Não informado',
        });
        fecharModal();
        await carregar();
        alert('Falta registrada com sucesso!');
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const bindEvents = () => {
    document.getElementById('dp-notif-filtro-status')?.addEventListener('change', carregar);
    document.getElementById('dp-notif-filtro-prio')?.addEventListener('change', carregar);
    document.getElementById('dp-notif-falta')?.addEventListener('click', abrirRegistroFalta);
    document.getElementById('dp-notif-verificar')?.addEventListener('click', async () => {
      const btn = document.getElementById('dp-notif-verificar');
      btn.textContent = 'Verificando...';
      btn.disabled = true;
      try {
        await fetch('http://localhost:3001/api/v1/notificacoes/verificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('dp_token')}` },
        });
        await carregar();
        alert('Verificações executadas!');
      } catch { alert('Erro ao executar verificações.'); }
      btn.textContent = 'Executar verificações';
      btn.disabled = false;
    });
  };

  const formatarDataRelativa = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min atrás`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `${horas}h atrás`;
    const dias = Math.floor(horas / 24);
    return `${dias} dia(s) atrás`;
  };

  const fecharModal = () => {
    const modal = document.getElementById('dp-notif-modal');
    if (modal) modal.innerHTML = '';
  };

  const abrirModal = () => {
    if (window.DPHub) {
      DPHub.irPara('notificacoes');
    } else if (typeof navigateTo === 'function') {
      navigateTo('departamento');
    }
  };

  return { render, marcarLida, arquivar, fecharModal, abrirModal };
})();

window.DPNotificacoes = DPNotificacoes;
