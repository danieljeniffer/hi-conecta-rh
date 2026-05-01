const db = require('../config/database');
const { calcularRescisao } = require('../services/calculoRescisao');
const esocialService = require('../services/esocialService');

const calcular = async (req, res) => {
  try {
    const { colaborador_id, tipo, data_desligamento, dias_ferias_vencidas = 0, saldo_fgts = null, outros_creditos = 0 } = req.body;

    const { rows: [col] } = await db.query(
      `SELECT c.*, ca.titulo AS cargo FROM colaboradores c
       LEFT JOIN cargos ca ON ca.id = c.cargo_id WHERE c.id = $1`,
      [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const resultado = calcularRescisao({
      tipo,
      salarioBase: parseFloat(col.salario_base),
      dataAdmissao: col.data_admissao,
      dataDesligamento: data_desligamento,
      qtdDependentes: col.qtd_dependentes_irrf || 0,
      saldoFGTS: saldo_fgts,
      diasFeriasVencidas: parseInt(dias_ferias_vencidas),
      outrosCreditos: parseFloat(outros_creditos),
    });

    res.json({ colaborador: col.nome_completo, cargo: col.cargo, ...resultado });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

const registrar = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const {
      colaborador_id, tipo, data_comunicacao, data_aviso_previo,
      data_desligamento, ultimo_dia_trabalhado, saldo_fgts = null,
      dias_ferias_vencidas = 0, outros_creditos = 0, outras_deducoes = 0,
      motivo_justa_causa, observacoes,
    } = req.body;

    const { rows: [col] } = await client.query(
      `SELECT * FROM colaboradores WHERE id = $1 AND situacao = 'Ativo'`, [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado ou já inativo.' });

    const calc = calcularRescisao({
      tipo,
      salarioBase: parseFloat(col.salario_base),
      dataAdmissao: col.data_admissao,
      dataDesligamento: data_desligamento,
      qtdDependentes: col.qtd_dependentes_irrf || 0,
      saldoFGTS: saldo_fgts,
      diasFeriasVencidas: parseInt(dias_ferias_vencidas),
      outrosCreditos: parseFloat(outros_creditos),
      outrasDeducoes: parseFloat(outras_deducoes),
    });

    const { rows: [rescisao] } = await client.query(
      `INSERT INTO rescisoes (
        colaborador_id, tipo, data_comunicacao, data_aviso_previo, data_desligamento,
        ultimo_dia_trabalhado, saldo_salario, aviso_previo_indenizado, ferias_proporcionais,
        ferias_vencidas, um_terco_ferias, decimo_terceiro_proporcional, fgts_saldo,
        fgts_multa_40, outros_creditos, inss_rescisao, irrf_rescisao, outros_descontos,
        total_bruto, total_liquido, responsavel_id, motivo_justa_causa, observacoes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      ) RETURNING *`,
      [
        colaborador_id, tipo, data_comunicacao, data_aviso_previo, data_desligamento,
        ultimo_dia_trabalhado || data_desligamento,
        calc.saldoSalario, calc.avisoPrevioIndenizado, calc.feriasProporcionais,
        calc.feriasVencidas, calc.umTercoFerias, calc.decimoTerceiroProporcional,
        calc.saldoFGTS, calc.multaFGTS, outros_creditos,
        calc.inss, calc.irrf, outras_deducoes,
        calc.totalBruto, calc.totalLiquido, req.usuario.id,
        motivo_justa_causa, observacoes,
      ]
    );

    // Atualizar situação do colaborador
    await client.query(
      `UPDATE colaboradores SET situacao = 'Demitido' WHERE id = $1`, [colaborador_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Rescisão registrada.', rescisao, calculo: calc });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, c.nome_completo, c.cpf, c.data_admissao, c.salario_base,
              ca.titulo AS cargo, d.nome AS departamento, u.nome AS responsavel
       FROM rescisoes r
       JOIN colaboradores c ON c.id = r.colaborador_id
       LEFT JOIN cargos ca ON ca.id = c.cargo_id
       LEFT JOIN departamentos d ON d.id = c.departamento_id
       LEFT JOIN usuarios u ON u.id = r.responsavel_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Rescisão não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const enviarESocial = async (req, res) => {
  try {
    const evento = await esocialService.gerarEventoS2299(req.params.id);
    await db.query(
      `UPDATE rescisoes SET esocial_s2299_enviado = TRUE WHERE id = $1`, [req.params.id]
    );
    res.json({ mensagem: 'Evento S-2299 gerado para envio ao eSocial.', evento });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { calcular, registrar, buscarPorId, enviarESocial };
