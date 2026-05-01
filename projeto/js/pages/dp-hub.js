/**
 * dp-hub.js — Hub do Departamento Pessoal
 * Gerencia a sub-navegação e delega render para cada módulo
 */
const DPHub = (() => {
  const MODULOS = [
    { id: 'dashboard',     label: 'Dashboard',         icon: '📊', fn: () => window.DPDashboard    },
    { id: 'colaboradores', label: 'Colaboradores',     icon: '👤', fn: () => window.DPColaboradores },
    { id: 'admissao',      label: 'Admissão',          icon: '📥', fn: () => window.DPAdmissao      },
    { id: 'folha',         label: 'Folha de Pagamento',icon: '💰', fn: () => window.DPFolha         },
    { id: 'ferias',        label: 'Férias',             icon: '🌴', fn: () => window.DPFerias        },
    { id: 'decimo',        label: '13º Salário',        icon: '🎁', fn: () => window.DPDecimo        },
    { id: 'rescisao',      label: 'Rescisão',           icon: '📄', fn: () => window.DPRescisao      },
    { id: 'beneficios',    label: 'Benefícios',         icon: '💳', fn: () => window.DPBeneficios    },
    { id: 'bonificacoes',  label: 'Bonificações',       icon: '🚀', fn: () => window.DPBonificacoes  },
    { id: 'notificacoes',  label: 'Notificações',       icon: '🔔', fn: () => window.DPNotificacoes  },
  ];

  let abaAtiva = 'dashboard';

  const render = (el) => {
    el.innerHTML = buildShell();
    irPara('dashboard');
  };

  const buildShell = () => `
    <div id="dp-hub-root">
      <div class="dp-subnav">
        ${MODULOS.map(m => `
          <button class="dp-subnav-btn ${m.id === abaAtiva ? 'ativo' : ''}"
            data-modulo="${m.id}"
            onclick="DPHub.irPara('${m.id}')">
            <span>${m.icon}</span><span>${m.label}</span>
          </button>`).join('')}
      </div>
      <div id="dp-conteudo" style="padding-top:4px;min-height:300px;"></div>
    </div>`;

  const irPara = (id) => {
    abaAtiva = id;
    document.querySelectorAll('.dp-subnav-btn').forEach(b =>
      b.classList.toggle('ativo', b.dataset.modulo === id));
    _renderModulo(id);
  };

  const _renderModulo = async (id) => {
    const mc = document.getElementById('dp-conteudo');
    if (!mc) return;
    const def = MODULOS.find(m => m.id === id);
    if (!def) return;

    mc.innerHTML = `<div style="padding:32px;text-align:center;color:#64748b;font-size:13px;">
                      Carregando ${def.label}…</div>`;
    const mod = def.fn();
    if (!mod || typeof mod.render !== 'function') {
      mc.innerHTML = `<div class="dp-alert dp-alert-warn" style="margin:16px;">
        Módulo <strong>${def.label}</strong> não encontrado. Verifique se o script está carregado.
      </div>`;
      return;
    }
    try {
      await mod.render(mc);
    } catch (err) {
      mc.innerHTML = `<div class="dp-alert dp-alert-danger" style="margin:16px;">
        Erro em <strong>${def.label}</strong>: ${err.message}</div>`;
      console.error('[DP Hub]', id, err);
    }
  };

  return { render, irPara };
})();

window.DPHub = DPHub;

// ─── Módulo de Admissão ────────────────────────────────────────────────────
const DPAdmissao = (() => {
  const fmtD = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '—';

  const prazos = [
    { label: 'CTPS assinada',            prazo: 'Até 5 dias corridos', detalhe: 'CLT art. 29'            },
    { label: 'Exame admissional',         prazo: 'Antes do 1º dia',    detalhe: 'NR-7 obrigatório'        },
    { label: 'eSocial S-2200',            prazo: 'Antes do 1º dia',    detalhe: 'Antes de o colaborador iniciar' },
    { label: 'Experiência — 1ª fase',    prazo: '15 dias',             detalhe: 'Prorrogável por 45 dias' },
    { label: 'Experiência — 2ª fase',    prazo: '45 dias',             detalhe: 'Total máximo: 60 dias'   },
    { label: 'FGTS — 1º recolhimento',   prazo: 'Dia 7 do mês seguinte', detalhe: 'Mês de admissão'      },
  ];

  const render = async (container) => {
    let lista = [];
    try { lista = await DPService.listarAdmissoes(); } catch { /* offline */ }

    container.innerHTML = `
      <div>
        <div class="dp-alert dp-alert-info" style="margin-bottom:16px;">
          Registre admissões, acompanhe contratos de experiência e envie eventos S-2200 ao eSocial.
        </div>
        <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;">
          <div class="dp-table-wrap">
            <div class="dp-table-header">
              <span class="dp-table-title">Admissões Recentes</span>
              <button class="dp-btn dp-btn-primary" id="dp-adm-btn-novo">+ Nova Admissão</button>
            </div>
            <table class="dp-table">
              <thead><tr>
                <th>Colaborador</th><th>Cargo</th><th>Admissão</th>
                <th>Contrato</th><th>Experiência 45d</th><th>S-2200</th><th></th>
              </tr></thead>
              <tbody>
                ${lista.length ? lista.map(a => `
                  <tr>
                    <td><strong>${a.nome_completo}</strong></td>
                    <td>${a.cargo || '—'}</td>
                    <td>${fmtD(a.data_admissao)}</td>
                    <td>${a.tipo_contrato}</td>
                    <td>${a.data_experiencia_45 ? fmtD(a.data_experiencia_45) : '—'}</td>
                    <td><span class="dp-status ${a.esocial_s2200_enviado ? 'fechada' : 'pendente'}">
                      ${a.esocial_s2200_enviado ? 'Enviado' : 'Pendente'}</span></td>
                    <td>${!a.esocial_s2200_enviado
                      ? `<button class="dp-btn dp-btn-secondary" style="font-size:11px;padding:4px 8px;"
                           onclick="DPAdmissao.enviarS2200('${a.id}')">Enviar S-2200</button>`
                      : ''}</td>
                  </tr>`).join('')
                  : `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b;">
                      ${lista.length === 0
                        ? 'Nenhuma admissão registrada. Conecte o backend para ver dados reais.'
                        : 'Sem resultados.'}</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="dp-table-wrap" style="padding:18px;">
            <div class="dp-table-title" style="margin-bottom:12px;">Prazos Legais</div>
            ${prazos.map(p => `
              <div style="padding:10px 0;border-bottom:1px solid var(--border,#e2e8f0);">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary,#0f172a);">${p.label}</div>
                <div style="font-size:12px;color:var(--primary,#1B56D6);font-weight:500;margin-top:2px;">${p.prazo}</div>
                <div style="font-size:11px;color:var(--text-muted,#64748b);margin-top:1px;">${p.detalhe}</div>
              </div>`).join('')}
          </div>
        </div>
        <div id="dp-adm-modal"></div>
      </div>`;

    document.getElementById('dp-adm-btn-novo').addEventListener('click', _abrirModal);
  };

  const _abrirModal = () => {
    document.getElementById('dp-adm-modal').innerHTML = `
      <div class="dp-modal-overlay" onclick="if(event.target===this)DPAdmissao.fecharModal()">
      <div class="dp-modal">
        <div class="dp-modal-head">
          <h3>Nova Admissão</h3>
          <button class="dp-btn dp-btn-icon" onclick="DPAdmissao.fecharModal()">✕</button>
        </div>
        <div class="dp-modal-body">
          <div class="dp-alert dp-alert-info" style="margin-bottom:14px;">
            O colaborador deve estar cadastrado em <strong>Colaboradores</strong> antes de registrar a admissão.
          </div>
          <div class="dp-form-grid cols-2">
            <div class="dp-field dp-field-full">
              <label>ID do Colaborador *</label>
              <input id="dp-adm-colid" placeholder="UUID do colaborador">
            </div>
            <div class="dp-field">
              <label>Data de Admissão *</label>
              <input type="date" id="dp-adm-data" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="dp-field">
              <label>Tipo de Contrato</label>
              <select id="dp-adm-tipo">
                ${['CLT','Experiencia','Temporario','Estagio','Aprendiz']
                  .map(v => `<option value="${v}">${v}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field">
              <label>Salário Inicial (R$) *</label>
              <input type="number" step="0.01" min="0" id="dp-adm-salario" placeholder="Ex: 3500.00">
            </div>
            <div class="dp-field">
              <label>Modalidade</label>
              <select id="dp-adm-modalidade">
                ${['Presencial','Híbrido','Remoto'].map(v => `<option>${v}</option>`).join('')}
              </select>
            </div>
            <div class="dp-field">
              <label>Prorrogar experiência (45d)?</label>
              <select id="dp-adm-prorroga">
                <option value="true">Sim — total 60 dias</option>
                <option value="false">Não — apenas 15 dias</option>
              </select>
            </div>
          </div>
        </div>
        <div class="dp-modal-footer">
          <button class="dp-btn dp-btn-secondary" onclick="DPAdmissao.fecharModal()">Cancelar</button>
          <button class="dp-btn dp-btn-primary" id="dp-adm-salvar">Registrar Admissão</button>
        </div>
      </div></div>`;

    document.getElementById('dp-adm-salvar').addEventListener('click', async () => {
      const btn = document.getElementById('dp-adm-salvar');
      btn.disabled = true; btn.textContent = 'Registrando…';
      try {
        await DPService.registrarAdmissao({
          colaborador_id:    document.getElementById('dp-adm-colid').value,
          data_admissao:     document.getElementById('dp-adm-data').value,
          tipo_contrato:     document.getElementById('dp-adm-tipo').value,
          salario_inicial:   parseFloat(document.getElementById('dp-adm-salario').value),
          modalidade_trabalho: document.getElementById('dp-adm-modalidade').value,
          proroga_experiencia: document.getElementById('dp-adm-prorroga').value === 'true',
        });
        DPAdmissao.fecharModal();
        alert('Admissão registrada! Envie o S-2200 ao eSocial antes do 1º dia.');
        const mc = document.getElementById('dp-conteudo');
        if (mc) await render(mc);
      } catch (err) {
        alert(err.message);
        btn.disabled = false; btn.textContent = 'Registrar Admissão';
      }
    });
  };

  const enviarS2200 = async (id) => {
    if (!confirm('Gerar evento S-2200 para eSocial?')) return;
    try {
      await DPService.enviarS2200(id);
      alert('Evento S-2200 gerado!');
      const mc = document.getElementById('dp-conteudo');
      if (mc) await render(mc);
    } catch (err) { alert(err.message); }
  };

  const fecharModal = () => {
    const m = document.getElementById('dp-adm-modal');
    if (m) m.innerHTML = '';
  };

  return { render, enviarS2200, fecharModal };
})();

window.DPAdmissao = DPAdmissao;
