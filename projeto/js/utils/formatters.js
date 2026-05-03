// =============================================
// FORMATTERS.JS — Formatação centralizada
// Sem XSS: badge() retorna Node, não HTML string
// =============================================

const Fmt = {

  moeda(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return 'R$ —';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  numero(valor, casas = 2) {
    const n = parseFloat(valor);
    if (isNaN(n)) return '—';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  },

  // Aceita DD/MM/YYYY, YYYY-MM-DD e ISO
  data(str) {
    if (!str) return '—';
    try {
      let iso;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split('/');
        iso = `${y}-${m}-${d}T12:00:00`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        iso = `${str}T12:00:00`;
      } else {
        iso = str;
      }
      const dt = new Date(iso);
      if (isNaN(dt.getTime())) return str; // retorna original se inválido
      return dt.toLocaleDateString('pt-BR');
    } catch {
      return String(str);
    }
  },

  dataHora(str) {
    if (!str) return '—';
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return String(str);
      return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return String(str);
    }
  },

  cpf(v) {
    if (!v) return '';
    const d = String(v).replace(/\D/g, '').slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  telefone(v) {
    if (!v) return '';
    const d = String(v).replace(/\D/g, '').slice(0, 11);
    return d.length === 11
      ? d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  },

  iniciais(nome) {
    if (!nome) return '?';
    return String(nome).trim().split(/\s+/).slice(0, 2).map(n => n[0] || '').join('').toUpperCase() || '?';
  },

  primeiroNome(nome) {
    if (!nome) return '';
    return String(nome).split(' ')[0];
  },

  /**
   * badge() — retorna SPAN element (Node), não string HTML.
   * Uso: element.appendChild(Fmt.badge('aprovado'))
   * Nunca usar como innerHTML — use Fmt.badgeHtml() para template literals
   * quando o HTML de estrutura for seu (não o label/status).
   */
  badge(status) {
    const mapa = {
      aprovado:    { cor: '#16a34a', label: 'Aprovado'    },
      reprovado:   { cor: '#dc2626', label: 'Reprovado'   },
      pendente:    { cor: '#d97706', label: 'Pendente'    },
      ativo:       { cor: '#16a34a', label: 'Ativo'       },
      inativo:     { cor: '#6b7280', label: 'Inativo'     },
      aberta:      { cor: '#16a34a', label: 'Aberta'      },
      'em triagem':{ cor: '#d97706', label: 'Em triagem'  },
      pausada:     { cor: '#6b7280', label: 'Pausada'     },
      encerrada:   { cor: '#dc2626', label: 'Encerrada'   },
      pago:        { cor: '#16a34a', label: 'Pago'        },
      cancelado:   { cor: '#dc2626', label: 'Cancelado'   },
      'em análise':{ cor: '#2563eb', label: 'Em análise'  },
    };

    const key = String(status || '').toLowerCase();
    const s   = mapa[key] || { cor: '#6b7280', label: String(status || '—') };

    const span = document.createElement('span');
    span.style.cssText = `background:${s.cor}20;color:${s.cor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap`;
    span.textContent = s.label; // textContent — nunca innerHTML
    return span;
  },

  /**
   * badgeHtml() — retorna HTML string para uso CONTROLADO em template literals
   * onde o HTML de estrutura é seu código (não dado do usuário).
   * O label é escapado via textContent na construção interna.
   */
  badgeHtml(status) {
    const node = Fmt.badge(status);
    return node.outerHTML; // outerHTML do nó já construído de forma segura
  },

  prioridade(nivel) {
    const mapa = {
      alta:  { cor: '#dc2626', label: '🔴 Alta'  },
      media: { cor: '#d97706', label: '🟡 Média' },
      baixa: { cor: '#16a34a', label: '🟢 Baixa' },
    };
    return mapa[String(nivel || '').toLowerCase()] || { cor: '#6b7280', label: String(nivel || '—') };
  },

  percentual(valor, total) {
    if (!total || isNaN(valor) || isNaN(total)) return '0%';
    return Math.round((Number(valor) / Number(total)) * 100) + '%';
  },

  diasRestantes(dataFim) {
    if (!dataFim) return '—';
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const fim = new Date(String(dataFim).includes('T') ? dataFim : `${dataFim}T00:00:00`);
      if (isNaN(fim.getTime())) return '—';
      const dias = Math.ceil((fim - hoje) / 86400000);
      if (dias < 0)   return `${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''} em atraso`;
      if (dias === 0) return 'Vence hoje';
      return `${dias} dia${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`;
    } catch {
      return '—';
    }
  },
};
