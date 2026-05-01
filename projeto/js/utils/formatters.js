// =============================================
// FORMATTERS.JS — Formatação centralizada
// Substitui toLocaleString inline por todo o projeto
// =============================================

const Fmt = {
  moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  numero(valor, casas = 2) {
    return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  },

  data(str) {
    if (!str) return '—';
    const d = new Date(str.includes('/') ? str.split('/').reverse().join('-') + 'T00:00:00' : str + 'T00:00:00');
    return isNaN(d) ? str : d.toLocaleDateString('pt-BR');
  },

  dataHora(str) {
    if (!str) return '—';
    const d = new Date(str);
    return isNaN(d) ? str : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  },

  cpf(v) {
    if (!v) return '';
    return String(v).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  telefone(v) {
    if (!v) return '';
    const d = String(v).replace(/\D/g, '');
    return d.length === 11
      ? d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  },

  iniciais(nome) {
    if (!nome) return '?';
    return nome.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase();
  },

  primeiroNome(nome) {
    return nome?.split(' ')[0] || nome || '';
  },

  badge(status) {
    const mapa = {
      aprovado:    { cor: 'var(--success,#16a34a)', label: 'Aprovado' },
      reprovado:   { cor: 'var(--danger,#dc2626)',  label: 'Reprovado' },
      pendente:    { cor: 'var(--warning,#d97706)', label: 'Pendente' },
      ativo:       { cor: 'var(--success,#16a34a)', label: 'Ativo' },
      inativo:     { cor: '#6b7280',                label: 'Inativo' },
      aberta:      { cor: 'var(--success,#16a34a)', label: 'Aberta' },
      'em triagem':{ cor: 'var(--warning,#d97706)', label: 'Em triagem' },
      pausada:     { cor: '#6b7280',                label: 'Pausada' },
      encerrada:   { cor: 'var(--danger,#dc2626)',  label: 'Encerrada' },
    };
    const s = mapa[(status || '').toLowerCase()] || { cor: '#6b7280', label: status || '—' };
    return `<span style="background:${s.cor}20;color:${s.cor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap">${s.label}</span>`;
  },

  prioridade(nivel) {
    const mapa = {
      alta:  { cor: '#dc2626', label: '🔴 Alta' },
      media: { cor: '#d97706', label: '🟡 Média' },
      baixa: { cor: '#16a34a', label: '🟢 Baixa' },
    };
    return mapa[(nivel || '').toLowerCase()] || { cor: '#6b7280', label: nivel };
  },

  percentual(valor, total) {
    if (!total) return '0%';
    return Math.round((valor / total) * 100) + '%';
  },

  diasRestantes(dataFim) {
    const hoje = new Date();
    const fim  = new Date(dataFim + 'T00:00:00');
    const dias = Math.ceil((fim - hoje) / 86400000);
    if (dias < 0)  return `${Math.abs(dias)} dias em atraso`;
    if (dias === 0) return 'Vence hoje';
    return `${dias} dias restantes`;
  },
};
