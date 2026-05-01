const db = require('../config/database');
const { calcularMesesTrabalhados13, calcular13Completo, calcular13Rescisao } = require('../services/calculoDecimoTerceiro');

const calcular = async (req, res) => {
  try {
    const { colaborador_id, ano } = req.query;
    const { rows: [col] } = await db.query(
      `SELECT salario_base, data_admissao, qtd_dependentes_irrf FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const meses = calcularMesesTrabalhados13(col.data_admissao, parseInt(ano));
    const resultado = calcular13Completo(
      parseFloat(col.salario_base), meses, col.qtd_dependentes_irrf || 0
    );
    res.json({ ano: parseInt(ano), mesesTrabalhados: meses, ...resultado });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const calcularTodos = async (req, res) => {
  try {
    const { ano } = req.query;
    const { rows: colaboradores } = await db.query(
      `SELECT id, nome_completo, salario_base, data_admissao, qtd_dependentes_irrf
       FROM colaboradores WHERE situacao = 'Ativo'`
    );

    const resultados = colaboradores.map(col => {
      const meses = calcularMesesTrabalhados13(col.data_admissao, parseInt(ano));
      const calc = calcular13Completo(parseFloat(col.salario_base), meses, col.qtd_dependentes_irrf || 0);
      return { colaborador_id: col.id, nome: col.nome_completo, meses, ...calc };
    });

    const totais = {
      totalBruto: resultados.reduce((s, r) => s + r.valorBruto, 0).toFixed(2),
      totalLiquido: resultados.reduce((s, r) => s + r.totalLiquido, 0).toFixed(2),
      totalINSS: resultados.reduce((s, r) => s + r.totalDescontos, 0).toFixed(2),
    };

    res.json({ ano: parseInt(ano), colaboradores: resultados, totais });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const registrar = async (req, res) => {
  try {
    const { colaborador_id, ano, parcela, data_pagamento } = req.body;
    const { rows: [col] } = await db.query(
      `SELECT salario_base, data_admissao, qtd_dependentes_irrf FROM colaboradores WHERE id = $1`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const meses = calcularMesesTrabalhados13(col.data_admissao, parseInt(ano));
    const calc = calcular13Completo(parseFloat(col.salario_base), meses, col.qtd_dependentes_irrf || 0);

    const { rows: [dec] } = await db.query(
      `INSERT INTO decimo_terceiro (
        colaborador_id, ano, meses_trabalhados, salario_referencia,
        valor_bruto_integral, valor_bruto_proporcional,
        parcela1_valor, parcela2_valor, parcela2_inss, parcela2_irrf, valor_liquido
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (colaborador_id, ano) DO UPDATE SET
        meses_trabalhados=EXCLUDED.meses_trabalhados, salario_referencia=EXCLUDED.salario_referencia,
        valor_bruto_proporcional=EXCLUDED.valor_bruto_proporcional,
        parcela1_valor=EXCLUDED.parcela1_valor, parcela2_valor=EXCLUDED.parcela2_valor,
        parcela2_inss=EXCLUDED.parcela2_inss, parcela2_irrf=EXCLUDED.parcela2_irrf,
        valor_liquido=EXCLUDED.valor_liquido
      RETURNING *`,
      [
        colaborador_id, ano, meses, col.salario_base,
        calc.valorBruto, calc.valorBruto,
        calc.parcela1.valor, calc.parcela2.valorBruto,
        calc.parcela2.inss, calc.parcela2.irrf, calc.totalLiquido,
      ]
    );

    if (parcela === 1) {
      await db.query(
        `UPDATE decimo_terceiro SET parcela1_paga=TRUE, parcela1_data=$1 WHERE colaborador_id=$2 AND ano=$3`,
        [data_pagamento, colaborador_id, ano]
      );
    } else if (parcela === 2) {
      await db.query(
        `UPDATE decimo_terceiro SET parcela2_paga=TRUE, parcela2_data=$1 WHERE colaborador_id=$2 AND ano=$3`,
        [data_pagamento, colaborador_id, ano]
      );
    }

    res.json({ mensagem: `13º registrado. Parcela ${parcela} marcada.`, calculo: calc, registro: dec });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { calcular, calcularTodos, registrar };
