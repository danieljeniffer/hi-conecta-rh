// =============================================
// HI CONECTA RH — DATA.JS (Dados simulados)
// =============================================

const RHData = {
  empresa: {
    nome: 'hi Conecta RH',
    totalColaboradores: 32,
    admissoesAndamento: 8,
    solicitacoesPendentes: 12,
    proximoFechamento: '20/05',
    folhaMaio: 156320.00,
  },

  colaboradores: [
    { id: 1, nome: 'João Silva',    cargo: 'Vendedor',    salario: 2000, bonificacoes: 300, descontos: 150, total: 2150, status: 'Pendente' },
    { id: 2, nome: 'Maria Oliveira',cargo: 'Atendente',   salario: 1800, bonificacoes: 200, descontos: 100, total: 1900, status: 'Pendente' },
    { id: 3, nome: 'Carlos Souza',  cargo: 'Supervisor',  salario: 3500, bonificacoes: 500, descontos: 200, total: 3800, status: 'Pago'     },
    { id: 4, nome: 'Ana Lima',      cargo: 'Caixa',       salario: 1600, bonificacoes: 150, descontos: 80,  total: 1650, status: 'Pago'     },
    { id: 5, nome: 'Paulo Santos',  cargo: 'Estoquista',  salario: 1700, bonificacoes: 100, descontos: 80,  total: 1720, status: 'Pendente' },
  ],

  financeiro: {
    totalGeral: 111220,
    pagos:     { quantidade: 16, valor: 56430 },
    pendentes: { quantidade: 14, valor: 49890 },
    aVencer:   { quantidade: 2,  valor: 4900  },
    ultimasMovimentacoes: [
      { descricao: 'Pagamento realizado - João Silva',    valor: 2150, data: '15/05/2025', tipo: 'pago'     },
      { descricao: 'Pagamento pendente - Maria Oliveira', valor: 1900, data: '15/05/2025', tipo: 'pendente' },
      { descricao: 'Pagamento realizado - Carlos Souza',  valor: 3800, data: '14/05/2025', tipo: 'pago'     },
    ],
  },

  bonificacoes: [
    { titulo: 'Meta de Vendas',         periodo: 'Maio/2025', valor: 850  },
    { titulo: 'Bonificação por Desempenho', periodo: 'Maio/2025', valor: 450  },
    { titulo: 'Premiação Equipe',       periodo: 'Maio/2025', valor: 600  },
  ],

  vagas: [
    { id: 1, titulo: 'Analista de RH',      depto: 'Recursos Humanos', candidatos: 12, status: 'Aberta'   },
    { id: 2, titulo: 'Desenvolvedor Front',  depto: 'TI',               candidatos: 28, status: 'Aberta'   },
    { id: 3, titulo: 'Gerente Comercial',    depto: 'Comercial',        candidatos: 7,  status: 'Em triagem'},
    { id: 4, titulo: 'Assistente Financeiro',depto: 'Financeiro',       candidatos: 19, status: 'Fechada'  },
  ],
};
