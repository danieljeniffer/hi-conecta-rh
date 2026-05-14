'use strict';
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ── 1. Empresa de demonstração ────────────────
  const empresa = await prisma.empresa.upsert({
    where:  { cnpj: '00000000000100' },
    update: {},
    create: {
      id:     'emp-demo-001',
      nome:   'hi Conecta RH — Demo',
      razao_social: 'hi Conecta Recursos Humanos Ltda',
      cnpj:   '00000000000100',
      email:  'demo@hiconectarh.com.br',
      plano:  'pro',
      status: 'ativa',
      max_colaboradores: 150,
    },
  });
  console.log(`✅ Empresa: ${empresa.nome}`);

  // ── 2. Departamentos ──────────────────────────
  const departamentos = await Promise.all([
    prisma.departamento.upsert({ where: { id: 'dept-rh' },          update: {}, create: { id: 'dept-rh',          empresa_id: empresa.id, nome: 'Recursos Humanos',   codigo: 'RH'  } }),
    prisma.departamento.upsert({ where: { id: 'dept-comercial' },   update: {}, create: { id: 'dept-comercial',   empresa_id: empresa.id, nome: 'Comercial',          codigo: 'COM' } }),
    prisma.departamento.upsert({ where: { id: 'dept-ti' },          update: {}, create: { id: 'dept-ti',          empresa_id: empresa.id, nome: 'Tecnologia',         codigo: 'TI'  } }),
    prisma.departamento.upsert({ where: { id: 'dept-financeiro' },  update: {}, create: { id: 'dept-financeiro',  empresa_id: empresa.id, nome: 'Financeiro',         codigo: 'FIN' } }),
    prisma.departamento.upsert({ where: { id: 'dept-operacoes' },   update: {}, create: { id: 'dept-operacoes',   empresa_id: empresa.id, nome: 'Operações',          codigo: 'OPR' } }),
  ]);
  console.log(`✅ ${departamentos.length} Departamentos criados`);

  // ── 3. Cargos ─────────────────────────────────
  const cargos = await Promise.all([
    prisma.cargo.upsert({ where: { id: 'cargo-analista-rh' }, update: {}, create: { id: 'cargo-analista-rh', empresa_id: empresa.id, nome: 'Analista de RH',     codigo_cbo: '2520-05', nivel: 'administrativo', salario_min: 3000, salario_max: 6000 } }),
    prisma.cargo.upsert({ where: { id: 'cargo-vendedor' },     update: {}, create: { id: 'cargo-vendedor',    empresa_id: empresa.id, nome: 'Vendedor',           codigo_cbo: '3521-05', nivel: 'operacional',     salario_min: 1500, salario_max: 4000 } }),
    prisma.cargo.upsert({ where: { id: 'cargo-dev' },          update: {}, create: { id: 'cargo-dev',         empresa_id: empresa.id, nome: 'Desenvolvedor',      codigo_cbo: '2124-05', nivel: 'tecnico',         salario_min: 5000, salario_max: 15000 } }),
    prisma.cargo.upsert({ where: { id: 'cargo-supervisor' },   update: {}, create: { id: 'cargo-supervisor',  empresa_id: empresa.id, nome: 'Supervisor',         codigo_cbo: '1421-05', nivel: 'gerencial',       salario_min: 4000, salario_max: 10000 } }),
    prisma.cargo.upsert({ where: { id: 'cargo-financeiro' },   update: {}, create: { id: 'cargo-financeiro',  empresa_id: empresa.id, nome: 'Analista Financeiro',codigo_cbo: '2523-05', nivel: 'administrativo', salario_min: 3500, salario_max: 7000 } }),
  ]);
  console.log(`✅ ${cargos.length} Cargos criados`);

  // ── 4. Colaboradores ──────────────────────────
  const colaboradores = [
    { id: 'colab-001', nome: 'Mariana Rodrigues',  cpf: '11122233344', dept: 'dept-rh',       cargo: 'cargo-analista-rh',  sal: 5200, admissao: '2023-01-02' },
    { id: 'colab-002', nome: 'Carlos Eduardo Souza',cpf: '22233344455', dept: 'dept-comercial',cargo: 'cargo-supervisor',   sal: 6800, admissao: '2022-03-15' },
    { id: 'colab-003', nome: 'João Paulo Silva',   cpf: '33344455566', dept: 'dept-comercial', cargo: 'cargo-vendedor',     sal: 3500, admissao: '2023-06-01' },
    { id: 'colab-004', nome: 'Ana Lima Ferreira',  cpf: '44455566677', dept: 'dept-financeiro',cargo: 'cargo-financeiro',   sal: 4200, admissao: '2022-08-10' },
    { id: 'colab-005', nome: 'Paulo Ricardo Santos',cpf: '55566677788', dept: 'dept-ti',        cargo: 'cargo-dev',         sal: 8500, admissao: '2021-11-20' },
  ];

  for (const c of colaboradores) {
    await prisma.colaborador.upsert({
      where:  { id: c.id },
      update: {},
      create: {
        id:              c.id,
        empresa_id:      empresa.id,
        departamento_id: c.dept,
        cargo_id:        c.cargo,
        nome:            c.nome,
        cpf:             c.cpf,
        email_corporativo:`${c.nome.split(' ')[0].toLowerCase()}@empresa.com.br`,
        data_admissao:   new Date(c.admissao),
        salario_base:    c.sal,
        status:          'ativo',
        regime:          'clt',
        data_nascimento: new Date('1990-01-01'),
      },
    });
  }
  console.log(`✅ ${colaboradores.length} Colaboradores criados`);

  // ── 5. Usuários de acesso ─────────────────────
  const ROUNDS = 10;
  const usuarios = [
    { email: 'admin.sistema@empresa.com.br', senha: 'Admin@2025',  perfil: 'admin',       nome: 'Admin Sistema'        },
    { email: 'admin@empresa.com.br',         senha: 'admin123',    perfil: 'rh',          nome: 'Mariana Rodrigues'     },
    { email: 'analista@empresa.com.br',      senha: 'analista123', perfil: 'analista',    nome: 'Beatriz Analista'      },
    { email: 'gestor@empresa.com.br',        senha: 'gestor123',   perfil: 'gestor',      nome: 'Carlos Eduardo Souza'  },
    { email: 'colab@empresa.com.br',         senha: 'colab123',    perfil: 'colaborador', nome: 'João Paulo Silva'       },
    { email: 'juridico@empresa.com.br',      senha: 'juridico123', perfil: 'juridico',    nome: 'Dra. Ana Fonseca'      },
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.senha, ROUNDS);
    await prisma.usuario.upsert({
      where:  { id: `usr-${u.perfil}` },
      update: { senha_hash: hash },
      create: {
        id:         `usr-${u.perfil}`,
        empresa_id: empresa.id,
        nome:       u.nome,
        email:      u.email,
        senha_hash: hash,
        perfil:     u.perfil,
        ativo:      true,
      },
    });
    console.log(`  👤 ${u.perfil}: ${u.email} / ${u.senha}`);
  }

  // ── 6. Benefícios ──────────────────────────────
  await prisma.beneficioCategoria.upsert({
    where:  { id: 'benef-va' },
    update: {},
    create: {
      id: 'benef-va', empresa_id: empresa.id,
      nome: 'Vale Alimentação (Caju)', descricao: 'Cartão VA aceito em supermercados e restaurantes',
      fornecedor: 'Caju', valor_empresa: 550, valor_colab: 0, recorrencia: 'mensal',
    },
  });

  await prisma.beneficioCategoria.upsert({
    where:  { id: 'benef-plano' },
    update: {},
    create: {
      id: 'benef-plano', empresa_id: empresa.id,
      nome: 'Plano de Saúde (SulAmérica)', descricao: 'Plano de saúde coletivo empresarial',
      fornecedor: 'SulAmérica', valor_empresa: 450, valor_colab: 85, recorrencia: 'mensal',
    },
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin:      admin.sistema@empresa.com.br / Admin@2025');
  console.log('   RH:         admin@empresa.com.br / admin123');
  console.log('   Gestor:     gestor@empresa.com.br / gestor123');
  console.log('   Colaborador:colab@empresa.com.br / colab123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('\n❌ Erro no seed:', err);
    prisma.$disconnect();
    process.exit(1);
  });
