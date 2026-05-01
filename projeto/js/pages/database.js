const { Pool } = require('pg');

// Configurações de conexão (ajuste com seus dados)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sistema_dp',
  password: 'sua_senha_aqui',
  port: 5432,
});

const initDatabase = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255),
        cnpj VARCHAR(18) UNIQUE,
        config_esocial JSONB
    );

    CREATE TABLE IF NOT EXISTS colaboradores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        pis VARCHAR(11),
        cargo VARCHAR(100),
        salario_base DECIMAL(10,2) NOT NULL,
        data_admissao DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Ativo',
        jornada_mensal INT DEFAULT 220
    );

    CREATE TABLE IF NOT EXISTS folha_pagamento (
        id SERIAL PRIMARY KEY,
        colaborador_id INT REFERENCES colaboradores(id),
        mes_referencia INT,
        ano_referencia INT,
        proventos JSONB,
        descontos JSONB,
        valor_liquido DECIMAL(10,2),
        status_esocial VARCHAR(50) DEFAULT 'Pendente'
    );
  `;

  try {
    await pool.query(sql);
    console.log("✅ Tabelas de RH verificadas/criadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar tabelas:", err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDatabase
};

