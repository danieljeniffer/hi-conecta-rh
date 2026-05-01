const db = require('../config/database');
const esocialService = require('../services/esocialService');

const registrar = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const {
      colaborador_id, data_admissao, tipo_contrato = 'CLT',
      salario_inicial, cargo_id, departamento_id,
      modalidade_trabalho = 'Presencial', proroga_experiencia = true,
    } = req.body;

    const { rows: [col] } = await client.query(
      `SELECT id, data_admissao FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    // Calcular datas de experiência (15 + 45 dias = 60 dias total, prorrogável)
    const admissao = new Date(data_admissao);
    const exp15 = new Date(admissao); exp15.setDate(exp15.getDate() + 15);
    const exp45 = new Date(admissao); exp45.setDate(exp45.getDate() + 45);
    const exp60 = proroga_experiencia ? new Date(admissao) : null;
    if (exp60) exp60.setDate(exp60.getDate() + 60);

    const { rows: [admissaoReg] } = await client.query(
      `INSERT INTO admissoes (
        colaborador_id, data_admissao, data_experiencia_15, data_experiencia_45, data_experiencia_60,
        tipo_contrato, salario_inicial, cargo_id, departamento_id, modalidade_trabalho, responsavel_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        colaborador_id, data_admissao,
        exp15.toISOString().split('T')[0],
        exp45.toISOString().split('T')[0],
        exp60 ? exp60.toISOString().split('T')[0] : null,
        tipo_contrato, salario_inicial, cargo_id, departamento_id,
        modalidade_trabalho, req.usuario.id,
      ]
    );

    // Atualizar colaborador
    await client.query(
      `UPDATE colaboradores SET tipo_contrato=$1, cargo_id=$2, departamento_id=$3 WHERE id=$4`,
      [tipo_contrato, cargo_id, departamento_id, colaborador_id]
    );

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Admissão registrada com sucesso.',
      admissao: admissaoReg,
      datas: {
        admissao: data_admissao,
        experiencia15dias: exp15.toISOString().split('T')[0],
        experiencia45dias: exp45.toISOString().split('T')[0],
        experiencia60dias: exp60 ? exp60.toISOString().split('T')[0] : null,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const enviarESocial = async (req, res) => {
  try {
    const { admissao_id } = req.params;
    const { rows: [admissao] } = await db.query(
      `SELECT * FROM admissoes WHERE id = $1`, [admissao_id]
    );
    if (!admissao) return res.status(404).json({ erro: 'Admissão não encontrada.' });

    const evento = await esocialService.gerarEventoS2200(admissao.colaborador_id, admissao_id);
    await db.query(
      `UPDATE admissoes SET esocial_s2200_enviado=TRUE WHERE id=$1`, [admissao_id]
    );

    res.json({ mensagem: 'Evento S-2200 gerado.', evento });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const listar = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, c.nome_completo, c.cpf, ca.titulo AS cargo, d.nome AS departamento
       FROM admissoes a
       JOIN colaboradores c ON c.id = a.colaborador_id
       LEFT JOIN cargos ca ON ca.id = a.cargo_id
       LEFT JOIN departamentos d ON d.id = a.departamento_id
       ORDER BY a.data_admissao DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { registrar, enviarESocial, listar };
