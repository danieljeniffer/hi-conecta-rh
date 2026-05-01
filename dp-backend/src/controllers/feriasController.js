const db = require('../config/database');
const { calcularFeriasCompleto, calcularPeriodoAquisitivo } = require('../services/calculoFerias');

const listarPorColaborador = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT pa.*, f.data_inicio, f.data_fim, f.dias_ferias, f.valor_total, f.status AS status_gozo
       FROM periodos_aquisitivos pa
       LEFT JOIN ferias f ON f.periodo_aquisitivo_id = pa.id
       WHERE pa.colaborador_id = $1
       ORDER BY pa.inicio DESC`,
      [req.params.colaborador_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const calcular = async (req, res) => {
  try {
    const { colaborador_id, dias_ferias = 30, dias_vendidos = 0 } = req.body;
    const { rows: [col] } = await db.query(
      `SELECT salario_base, qtd_dependentes_irrf FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const resultado = calcularFeriasCompleto(
      parseFloat(col.salario_base), parseInt(dias_ferias), parseInt(dias_vendidos),
      col.qtd_dependentes_irrf || 0
    );
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

const agendar = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { colaborador_id, periodo_aquisitivo_id, data_inicio, dias_ferias, dias_vendidos = 0 } = req.body;

    const { rows: [col] } = await client.query(
      `SELECT salario_base, qtd_dependentes_irrf FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const dataInicio = new Date(data_inicio);
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + parseInt(dias_ferias) - 1);

    const calculo = calcularFeriasCompleto(
      parseFloat(col.salario_base), parseInt(dias_ferias), parseInt(dias_vendidos),
      col.qtd_dependentes_irrf || 0
    );

    const { rows: [ferias] } = await client.query(
      `INSERT INTO ferias (
        periodo_aquisitivo_id, colaborador_id, data_inicio, data_fim,
        dias_ferias, dias_vendidos, salario_referencia,
        valor_ferias, valor_um_terco, valor_dias_vendidos, valor_total, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Agendada') RETURNING *`,
      [
        periodo_aquisitivo_id, colaborador_id, data_inicio,
        dataFim.toISOString().split('T')[0], dias_ferias, dias_vendidos,
        col.salario_base, calculo.valorFerias, calculo.umTerco,
        calculo.valorAbono + calculo.umTercoAbono, calculo.totalBruto,
      ]
    );

    await client.query(
      `UPDATE periodos_aquisitivos SET dias_gozados = dias_gozados + $1, dias_vendidos = dias_vendidos + $2
       WHERE id = $3`,
      [dias_ferias, dias_vendidos, periodo_aquisitivo_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Férias agendadas.', ferias: { ...ferias, calculo } });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const gerarPeriodosAquisitivos = async (req, res) => {
  try {
    const { colaborador_id } = req.params;
    const { rows: [col] } = await db.query(
      `SELECT data_admissao FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const hoje = new Date();
    const periodos = [];
    let periodo = 1;
    while (true) {
      const p = calcularPeriodoAquisitivo(col.data_admissao, periodo);
      if (new Date(p.inicio) > hoje) break;
      periodos.push({ ...p, numero: periodo });
      periodo++;
      if (periodo > 50) break;
    }
    res.json(periodos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const sincronizarPeriodos = async (req, res) => {
  try {
    const { colaborador_id } = req.params;
    const { rows: [col] } = await db.query(
      `SELECT data_admissao FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const hoje = new Date();
    let periodo = 1;
    let criados = 0;

    while (true) {
      const p = calcularPeriodoAquisitivo(col.data_admissao, periodo);
      if (new Date(p.inicio) > hoje) break;

      const { rows: existe } = await db.query(
        `SELECT id FROM periodos_aquisitivos WHERE colaborador_id=$1 AND inicio=$2`,
        [colaborador_id, p.inicio]
      );

      if (!existe.length) {
        const status = new Date(p.dataLimiteGozo) < hoje ? 'Vencida' : 'Pendente';
        await db.query(
          `INSERT INTO periodos_aquisitivos (colaborador_id, inicio, fim, data_limite_gozo, status)
           VALUES ($1,$2,$3,$4,$5)`,
          [colaborador_id, p.inicio, p.fim, p.dataLimiteGozo, status]
        );
        criados++;
      }

      periodo++;
      if (periodo > 50) break;
    }

    res.json({ mensagem: `Períodos sincronizados. ${criados} criados.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { listarPorColaborador, calcular, agendar, gerarPeriodosAquisitivos, sincronizarPeriodos };
