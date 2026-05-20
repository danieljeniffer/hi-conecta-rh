'use strict';
/**
 * seed-teste.js — Base de dados de teste completa
 *
 * Cria:
 *   - 1 empresa de demo
 *   - 5 departamentos
 *   - 10 cargos com salários reais
 *   - 20 colaboradores com dados completos
 *   - 6 usuários de acesso (perfis distintos)
 *   - 1 folha de pagamento calculada (CLT 2024)
 *   - 3 registros de férias
 *
 * Uso:
 *   node seed/seed-teste.js
 *   ou: npm run db:seed:test  (adicione ao package.json se quiser)
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt           = require('bcrypt');

const prisma = new PrismaClient();

// ── Cálculos CLT 2024 inline (sem dependência circular) ──────────
const TABELA_INSS = [
  { teto: 1_412.00,  aliquota: 0.075 },
  { teto: 2_666.68,  aliquota: 0.09  },
  { teto: 4_000.03,  aliquota: 0.12  },
  { teto: 7_786.02,  aliquota: 0.14  },
];
const TETO_INSS        = 908.85;
const DEDUCAO_DEP      = 189.59;
const TABELA_IRRF = [
  { base:    2_259.20, aliquota: 0,     deducao:    0.00 },
  { base:    2_826.65, aliquota: 0.075, deducao:  169.44 },
  { base:    3_751.05, aliquota: 0.15,  deducao:  381.44 },
  { base:    4_664.68, aliquota: 0.225, deducao:  662.77 },
  { base: Infinity,    aliquota: 0.275, deducao:  896.00 },
];

const calcINSS = (sal) => {
  let d = 0, rest = sal;
  for (const { teto, aliquota } of TABELA_INSS) {
    if (rest <= 0) break;
    d    += Math.min(rest, teto) * aliquota;
    rest -= teto;
  }
  return Math.min(parseFloat(d.toFixed(2)), TETO_INSS);
};

const calcIRRF = (sal, dep = 0, inss = null) => {
  const base = sal - (inss ?? calcINSS(sal)) - dep * DEDUCAO_DEP;
  if (base <= 0) return 0;
  for (const { base: b, aliquota, deducao } of TABELA_IRRF) {
    if (base <= b) return Math.max(0, parseFloat((base * aliquota - deducao).toFixed(2)));
  }
  return 0;
};

const calcFGTS  = (sal) => parseFloat((sal * 0.08).toFixed(2));
const calcLiq   = (sal, dep = 0) => {
  const inss = calcINSS(sal);
  const irrf = calcIRRF(sal, dep, inss);
  return { bruto: sal, inss, irrf, fgts: calcFGTS(sal), liquido: sal - inss - irrf };
};

// ── Dados de teste ────────────────────────────────────────────────
const EMPRESA_ID = 'emp-teste-001';
const BCRYPT_ROUNDS = 10; // menor para seed rápido

const DEPTS = [
  { id: 'td-rh',       nome: 'Recursos Humanos',     codigo: 'RH'  },
  { id: 'td-ti',       nome: 'Tecnologia',            codigo: 'TI'  },
  { id: 'td-com',      nome: 'Comercial',             codigo: 'COM' },
  { id: 'td-fin',      nome: 'Financeiro',            codigo: 'FIN' },
  { id: 'td-ops',      nome: 'Operações',             codigo: 'OPR' },
];

const CARGOS = [
  { id: 'tc-analista-rh',   nome: 'Analista de RH',           nivel: 'administrativo', salario_min: 3000,  salario_max: 6000  },
  { id: 'tc-gerente-rh',    nome: 'Gerente de RH',            nivel: 'gerencial',      salario_min: 7000,  salario_max: 15000 },
  { id: 'tc-dev-jr',        nome: 'Desenvolvedor Jr',         nivel: 'tecnico',        salario_min: 3000,  salario_max: 5000  },
  { id: 'tc-dev-pl',        nome: 'Desenvolvedor Pleno',      nivel: 'tecnico',        salario_min: 5000,  salario_max: 9000  },
  { id: 'tc-dev-sr',        nome: 'Desenvolvedor Sênior',     nivel: 'tecnico',        salario_min: 9000,  salario_max: 18000 },
  { id: 'tc-vendedor',      nome: 'Vendedor',                 nivel: 'operacional',    salario_min: 1800,  salario_max: 4000  },
  { id: 'tc-sup-vendas',    nome: 'Supervisor de Vendas',     nivel: 'gerencial',      salario_min: 5000,  salario_max: 10000 },
  { id: 'tc-analista-fin',  nome: 'Analista Financeiro',      nivel: 'administrativo', salario_min: 3500,  salario_max: 7000  },
  { id: 'tc-aux-adm',       nome: 'Auxiliar Administrativo',  nivel: 'operacional',    salario_min: 1500,  salario_max: 2800  },
  { id: 'tc-ops-coord',     nome: 'Coordenador de Operações', nivel: 'gerencial',      salario_min: 6000,  salario_max: 12000 },
];

// 20 colaboradores com dados realistas
const COLABS = [
  { id: 'tc01', nome: 'Mariana Costa Rodrigues',    cpf: '11122233301', email: 'mariana.rodrigues@empresa.com.br',   dept: 'td-rh',  cargo: 'tc-gerente-rh',    sal: 9500,  admissao: '2021-03-01', gen: 'F' },
  { id: 'tc02', nome: 'Carlos Eduardo Souza Lima',  cpf: '22233344402', email: 'carlos.souza@empresa.com.br',        dept: 'td-ti',  cargo: 'tc-dev-sr',        sal: 12000, admissao: '2020-08-10', gen: 'M' },
  { id: 'tc03', nome: 'Ana Paula Ferreira Silva',   cpf: '33344455503', email: 'ana.ferreira@empresa.com.br',        dept: 'td-rh',  cargo: 'tc-analista-rh',   sal: 4800,  admissao: '2022-01-15', gen: 'F' },
  { id: 'tc04', nome: 'João Pedro Alves Mendes',    cpf: '44455566604', email: 'joao.alves@empresa.com.br',          dept: 'td-com', cargo: 'tc-sup-vendas',    sal: 7200,  admissao: '2021-07-20', gen: 'M' },
  { id: 'tc05', nome: 'Fernanda Lima Oliveira',     cpf: '55566677705', email: 'fernanda.lima@empresa.com.br',       dept: 'td-fin', cargo: 'tc-analista-fin',  sal: 5500,  admissao: '2022-04-01', gen: 'F' },
  { id: 'tc06', nome: 'Rafael Santos Pereira',      cpf: '66677788806', email: 'rafael.santos@empresa.com.br',       dept: 'td-ti',  cargo: 'tc-dev-pl',        sal: 7500,  admissao: '2023-02-13', gen: 'M' },
  { id: 'tc07', nome: 'Juliana Martins Costa',      cpf: '77788899907', email: 'juliana.martins@empresa.com.br',     dept: 'td-ops', cargo: 'tc-ops-coord',     sal: 8000,  admissao: '2020-11-05', gen: 'F' },
  { id: 'tc08', nome: 'Diego Nunes Barbosa',        cpf: '88899900008', email: 'diego.nunes@empresa.com.br',         dept: 'td-com', cargo: 'tc-vendedor',       sal: 2800,  admissao: '2023-06-01', gen: 'M' },
  { id: 'tc09', nome: 'Camila Araujo Teixeira',     cpf: '99900011109', email: 'camila.araujo@empresa.com.br',       dept: 'td-ti',  cargo: 'tc-dev-jr',        sal: 3800,  admissao: '2023-09-18', gen: 'F' },
  { id: 'tc10', nome: 'Rodrigo Carvalho Melo',      cpf: '00011122210', email: 'rodrigo.carvalho@empresa.com.br',    dept: 'td-fin', cargo: 'tc-analista-fin',  sal: 6200,  admissao: '2021-05-10', gen: 'M' },
  { id: 'tc11', nome: 'Luciana Pires Brandão',      cpf: '11100022311', email: 'luciana.pires@empresa.com.br',       dept: 'td-rh',  cargo: 'tc-analista-rh',   sal: 4500,  admissao: '2022-09-01', gen: 'F' },
  { id: 'tc12', nome: 'Thiago Machado Vieira',      cpf: '22211133412', email: 'thiago.machado@empresa.com.br',      dept: 'td-ti',  cargo: 'tc-dev-pl',        sal: 8000,  admissao: '2022-03-07', gen: 'M' },
  { id: 'tc13', nome: 'Beatriz Fonseca Amaral',     cpf: '33322244513', email: 'beatriz.fonseca@empresa.com.br',     dept: 'td-com', cargo: 'tc-vendedor',       sal: 2400,  admissao: '2023-11-20', gen: 'F' },
  { id: 'tc14', nome: 'Gustavo Ribeiro Cavalcante', cpf: '44433355614', email: 'gustavo.ribeiro@empresa.com.br',     dept: 'td-ops', cargo: 'tc-aux-adm',       sal: 2100,  admissao: '2024-01-08', gen: 'M' },
  { id: 'tc15', nome: 'Patricia Sousa Corrêa',      cpf: '55544466715', email: 'patricia.sousa@empresa.com.br',      dept: 'td-fin', cargo: 'tc-analista-fin',  sal: 5800,  admissao: '2021-12-01', gen: 'F' },
  { id: 'tc16', nome: 'Leonardo Duarte Freitas',    cpf: '66655577816', email: 'leonardo.duarte@empresa.com.br',     dept: 'td-ti',  cargo: 'tc-dev-sr',        sal: 13500, admissao: '2019-06-17', gen: 'M' },
  { id: 'tc17', nome: 'Isabela Gonçalves Moura',    cpf: '77766688917', email: 'isabela.goncalves@empresa.com.br',   dept: 'td-rh',  cargo: 'tc-analista-rh',   sal: 4200,  admissao: '2023-04-03', gen: 'F' },
  { id: 'tc18', nome: 'Marcelo Cunha Rocha',        cpf: '88877799018', email: 'marcelo.cunha@empresa.com.br',       dept: 'td-com', cargo: 'tc-sup-vendas',    sal: 6800,  admissao: '2020-02-25', gen: 'M' },
  { id: 'tc19', nome: 'Renata Vasconcelos Lopes',   cpf: '99988800119', email: 'renata.vasconcelos@empresa.com.br', dept: 'td-ops', cargo: 'tc-ops-coord',     sal: 7500,  admissao: '2022-07-11', gen: 'F' },
  { id: 'tc20', nome: 'Bruno Azevedo Monteiro',     cpf: '00099911220', email: 'bruno.azevedo@empresa.com.br',       dept: 'td-com', cargo: 'tc-vendedor',       sal: 3200,  admissao: '2023-08-14', gen: 'M' },
];

// 6 usuários de acesso
const USUARIOS = [
  { id: 'tu-admin',   email: 'admin.sistema@empresa.com.br', perfil: 'admin',       nome: 'Administrador do Sistema' },
  { id: 'tu-rh',      email: 'rh@empresa.com.br',            perfil: 'rh',          nome: 'Mariana Costa Rodrigues', colab_id: 'tc01' },
  { id: 'tu-analista',email: 'analista@empresa.com.br',      perfil: 'analista',    nome: 'Ana Paula Ferreira Silva', colab_id: 'tc03' },
  { id: 'tu-gestor',  email: 'gestor@empresa.com.br',        perfil: 'gestor',      nome: 'João Pedro Alves Mendes', colab_id: 'tc04' },
  { id: 'tu-colab',   email: 'colab@empresa.com.br',         perfil: 'colaborador', nome: 'Diego Nunes Barbosa', colab_id: 'tc08' },
  { id: 'tu-juridico',email: 'juridico@empresa.com.br',      perfil: 'juridico',    nome: 'Patricia Sousa Corrêa', colab_id: 'tc15' },
];

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 hi Conecta RH — Seed de Teste\n');
  console.log('📋 Configuração:');
  console.log(`   DB: ${process.env.DATABASE_URL?.substring(0, 40)}...`);
  console.log('');

  // 1. Empresa
  const empresa = await prisma.empresa.upsert({
    where:  { cnpj: '00000000000199' },
    update: { nome: 'hi Conecta RH — Ambiente de Teste' },
    create: {
      id:               EMPRESA_ID,
      nome:             'hi Conecta RH — Ambiente de Teste',
      razao_social:     'hi Conecta Tecnologia Ltda',
      cnpj:             '00000000000199',
      email:            'teste@hiconectarh.com.br',
      plano:            'enterprise',
      status:           'ativa',
      max_colaboradores: 200,
    },
  });
  console.log(`✅ Empresa: ${empresa.nome}`);

  // 2. Departamentos
  for (const d of DEPTS) {
    await prisma.departamento.upsert({
      where:  { id: d.id },
      update: { nome: d.nome },
      create: { ...d, empresa_id: EMPRESA_ID },
    });
  }
  console.log(`✅ ${DEPTS.length} Departamentos`);

  // 3. Cargos
  for (const c of CARGOS) {
    await prisma.cargo.upsert({
      where:  { id: c.id },
      update: { nome: c.nome },
      create: { ...c, empresa_id: EMPRESA_ID },
    });
  }
  console.log(`✅ ${CARGOS.length} Cargos`);

  // 4. Colaboradores
  for (const c of COLABS) {
    await prisma.colaborador.upsert({
      where:  { id: c.id },
      update: { salario_base: c.sal },
      create: {
        id:                c.id,
        empresa_id:        EMPRESA_ID,
        nome:              c.nome,
        cpf:               c.cpf,
        email:             c.email,
        departamento_id:   c.dept,
        cargo_id:          c.cargo,
        salario_base:      c.sal,
        data_admissao:     new Date(c.admissao),
        data_nascimento:   new Date('1990-01-01'),
        sexo:              c.gen,
        status:            'ativo',
        regime:            'clt',
        telefone:          `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`,
        cep:               '01310-100',
        logradouro:        'Av. Paulista',
        numero:            `${100 + parseInt(c.id.replace('tc', ''), 10)}`,
        cidade:            'São Paulo',
        estado:            'SP',
        banco:             '341',
        agencia:           '0001',
        conta:             `${10000 + parseInt(c.id.replace('tc', ''), 10)}-0`,
      },
    });
  }
  console.log(`✅ ${COLABS.length} Colaboradores`);

  // 5. Usuários de acesso
  const hashSenha = await bcrypt.hash('Senha@2025', BCRYPT_ROUNDS);
  const hashAdmin = await bcrypt.hash('Admin@2025', BCRYPT_ROUNDS);

  for (const u of USUARIOS) {
    await prisma.usuario.upsert({
      where:  { empresa_id_email: { empresa_id: EMPRESA_ID, email: u.email } },
      update: { nome: u.nome },
      create: {
        id:            u.id,
        empresa_id:    EMPRESA_ID,
        email:         u.email,
        senha_hash:    u.id === 'tu-admin' ? hashAdmin : hashSenha,
        nome:          u.nome,
        perfil:        u.perfil,
        colaborador_id:u.colab_id || null,
        ativo:         true,
      },
    });
  }
  console.log(`✅ ${USUARIOS.length} Usuários`);

  // 6. Folha de Pagamento — competência atual calculada com CLT 2024
  const competencia = new Date();
  const mesStr = `${competencia.getFullYear()}-${String(competencia.getMonth() + 1).padStart(2, '0')}`;

  const folha = await prisma.folhaPagamento.upsert({
    where: { empresa_id_competencia: { empresa_id: EMPRESA_ID, competencia: mesStr } },
    update: {},
    create: {
      empresa_id:    EMPRESA_ID,
      competencia:   mesStr,
      status:        'calculada',
      total_bruto:   0,
      total_liquido: 0,
      total_inss:    0,
      total_irrf:    0,
      total_fgts:    0,
    },
  });

  // Calcula e insere item por colaborador
  let totalBruto = 0, totalLiq = 0, totalINSS = 0, totalIRRF = 0, totalFGTS = 0;

  for (const c of COLABS) {
    const calc = calcLiq(c.sal);
    totalBruto += calc.bruto;
    totalLiq   += calc.liquido;
    totalINSS  += calc.inss;
    totalIRRF  += calc.irrf;
    totalFGTS  += calc.fgts;

    await prisma.folhaItem.create({
      data: {
        folha_id:        folha.id,
        colaborador_id:  c.id,
        salario_base:    c.sal,
        total_bruto:     calc.bruto,
        total_liquido:   calc.liquido,
        inss:            calc.inss,
        irrf:            calc.irrf,
        fgts:            calc.fgts,
        vale_transporte: parseFloat((c.sal * 0.06).toFixed(2)),
        plano_saude:     0,
        dias_trabalhados:30,
        faltas:          0,
        horas_extras:    0,
        valor_he:        0,
        desconto_faltas: 0,
        outros_proventos:0,
        outros_descontos:0,
        proventos_json: {
          inss:    calc.inss,
          irrf:    calc.irrf,
          fgts:    calc.fgts,
          liquido: calc.liquido,
        },
      },
    }).catch(() => {}); // ignora duplicatas em re-runs
  }

  // Atualizar totais da folha
  await prisma.folhaPagamento.update({
    where:  { id: folha.id },
    data: {
      total_bruto:   parseFloat(totalBruto.toFixed(2)),
      total_liquido: parseFloat(totalLiq.toFixed(2)),
      total_inss:    parseFloat(totalINSS.toFixed(2)),
      total_irrf:    parseFloat(totalIRRF.toFixed(2)),
      total_fgts:    parseFloat(totalFGTS.toFixed(2)),
    },
  });
  console.log(`✅ Folha ${mesStr}: R$ ${totalBruto.toFixed(2)} bruto / R$ ${totalLiq.toFixed(2)} líquido`);

  // 7. Férias — 3 registros aprovados
  const feriasData = [
    { colab: 'tc02', inicio: '2025-07-07', fim: '2025-07-26', dias: 20, abono: 10 },
    { colab: 'tc07', inicio: '2025-08-04', fim: '2025-08-23', dias: 20, abono: 0  },
    { colab: 'tc16', inicio: '2025-09-01', fim: '2025-09-30', dias: 30, abono: 0  },
  ];

  for (const f of feriasData) {
    const colab = COLABS.find(c => c.id === f.colab);
    const calc  = calcLiq(colab.sal);
    const valorFerias = colab.sal / 30 * f.dias * (1 + 1/3);
    await prisma.ferias.create({
      data: {
        empresa_id:      EMPRESA_ID,
        colaborador_id:  f.colab,
        periodo_inicio:  new Date('2024-01-01'),  // período aquisitivo (obrigatório)
        periodo_fim:     new Date('2024-12-31'),
        gozo_inicio:     new Date(f.inicio),
        gozo_fim:        new Date(f.fim),
        dias_solicitados:f.dias,
        dias_abono:      f.abono,
        valor_ferias:    parseFloat(valorFerias.toFixed(2)),
        valor_terco:     parseFloat((valorFerias / 3).toFixed(2)),
        status:          'aprovada',
        aprovado_por:    'tu-rh',
      },
    }).catch(() => {}); // Ignora duplicatas
  }
  console.log(`✅ 3 Registros de Férias`);

  // ── Resumo final ─────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seed concluído!\n');
  console.log('Credenciais de acesso:');
  console.log('  admin.sistema@empresa.com.br  →  Admin@2025  [admin]');
  console.log('  rh@empresa.com.br             →  Senha@2025  [rh]');
  console.log('  analista@empresa.com.br       →  Senha@2025  [analista]');
  console.log('  gestor@empresa.com.br         →  Senha@2025  [gestor]');
  console.log('  colab@empresa.com.br          →  Senha@2025  [colaborador]');
  console.log('  juridico@empresa.com.br       →  Senha@2025  [juridico]');
  console.log('\n  Empresa ID:', EMPRESA_ID);
  console.log('  Folha competência:', mesStr);
  console.log('─'.repeat(50) + '\n');
}

main()
  .catch(err => {
    console.error('\n❌ Erro no seed:', err.message);
    if (err.code === 'P2002') console.error('   Dado duplicado — rode com --reset-db ou remova os registros existentes');
    if (err.code === 'P1001') console.error('   Não foi possível conectar ao banco — verifique se o Docker está rodando');
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
