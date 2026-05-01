const db = require('../config/database');

const listarCatalogo = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM beneficios_catalogo WHERE ativo=TRUE ORDER BY tipo`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const listarPorColaborador = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT bco.*, bc.nome, bc.tipo, bc.fornecedor, bc.valor_empresa
       FROM beneficios_colaborador bco
       JOIN beneficios_catalogo bc ON bc.id = bco.beneficio_id
       WHERE bco.colaborador_id = $1
       ORDER BY bc.tipo`,
      [req.params.colaborador_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const atribuir = async (req, res) => {
  try {
    const { colaborador_id, beneficio_id, data_inicio, valor_mensal, desconto_folha } = req.body;
    const { rows: [ben] } = await db.query(
      `SELECT valor_empresa, valor_colaborador FROM beneficios_catalogo WHERE id = $1`, [beneficio_id]
    );
    if (!ben) return res.status(404).json({ erro: 'Benefício não encontrado.' });

    const { rows: [atrib] } = await db.query(
      `INSERT INTO beneficios_colaborador (colaborador_id, beneficio_id, data_inicio, valor_mensal, desconto_folha)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING RETURNING *`,
      [colaborador_id, beneficio_id, data_inicio,
       valor_mensal || (ben.valor_empresa + ben.valor_colaborador),
       desconto_folha || ben.valor_colaborador]
    );
    res.status(201).json({ mensagem: 'Benefício atribuído.', atribuicao: atrib });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const remover = async (req, res) => {
  try {
    await db.query(
      `UPDATE beneficios_colaborador SET ativo=FALSE, data_fim=CURRENT_DATE WHERE id=$1`,
      [req.params.id]
    );
    res.json({ mensagem: 'Benefício removido.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const relatorioBeneficios = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT bc.tipo, bc.nome, bc.fornecedor,
             COUNT(bco.colaborador_id) AS qtd_colaboradores,
             ROUND(SUM(bco.valor_mensal), 2) AS custo_total_mensal,
             ROUND(SUM(bco.desconto_folha), 2) AS total_desconto_colaboradores,
             ROUND(SUM(bco.valor_mensal) - SUM(bco.desconto_folha), 2) AS custo_liquido_empresa
      FROM beneficios_colaborador bco
      JOIN beneficios_catalogo bc ON bc.id = bco.beneficio_id
      WHERE bco.ativo = TRUE
      GROUP BY bc.tipo, bc.nome, bc.fornecedor
      ORDER BY custo_total_mensal DESC
    `);
    const { rows: [total] } = await db.query(`
      SELECT ROUND(SUM(bco.valor_mensal), 2) AS total_empresa,
             ROUND(SUM(bco.desconto_folha), 2) AS total_colaboradores
      FROM beneficios_colaborador bco WHERE bco.ativo = TRUE
    `);
    res.json({ beneficios: rows, totais: total });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { listarCatalogo, listarPorColaborador, atribuir, remover, relatorioBeneficios };
