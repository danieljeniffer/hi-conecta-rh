const db = require('../config/database');
const { calcularINSS, calcularINSSEmpresa } = require('../services/calculoINSS');
const { calcularIRRF } = require('../services/calculoIRRF');
const { calcularFGTSMensal } = require('../services/calculoFGTS');

const SALARIO_MINIMO = 1412.00;
const VT_PERCENTUAL_MAXIMO = 0.06;

/**
 * Abre um novo período (competência) de folha
 */
const abrirPeriodo = async (req, res) => {
  try {
    const { mes, ano, data_pagamento } = req.body;
    const { rows: existe } = await db.query(
      `SELECT id FROM periodos_folha WHERE mes = $1 AND ano = $2`, [mes, ano]
    );
    if (existe.length) return res.status(409).json({ erro: `Período ${mes}/${ano} já existe.` });

    const { rows: [periodo] } = await db.query(
      `INSERT INTO periodos_folha (mes, ano, descricao, data_pagamento, responsavel_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [mes, ano, `${mes.toString().padStart(2,'0')}/${ano}`, data_pagamento, req.usuario.id]
    );
    res.status(201).json({ mensagem: 'Período aberto.', periodo });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

/**
 * Calcular folha de um colaborador específico
 */
const calcularFolhaColaborador = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { periodo_id, colaborador_id } = req.params;

    const { rows: [col] } = await client.query(
      `SELECT c.*, ca.titulo AS cargo
       FROM colaboradores c
       LEFT JOIN cargos ca ON ca.id = c.cargo_id
       WHERE c.id = $1 AND c.situacao = 'Ativo'`,
      [colaborador_id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado ou inativo.' });

    const params = req.body;
    const salarioBase = parseFloat(col.salario_base);
    const qtdDependentes = col.qtd_dependentes_irrf || 0;

    // Adicionais
    const heHoras50 = parseFloat(params.horas_extras_50 || 0);
    const heHoras100 = parseFloat(params.horas_extras_100 || 0);
    const faltas = parseFloat(params.faltas_dias || 0);
    const atrasos = parseInt(params.atrasos_minutos || 0);
    const bonus = parseFloat(params.bonus || 0);
    const comissao = parseFloat(params.comissao || 0);
    const outrosProventos = parseFloat(params.outros_proventos || 0);
    const outrosDescontos = parseFloat(params.outros_descontos || 0);

    // Cálculo hora normal (jornada 44h/semana = 220h/mês)
    const horasMes = col.jornada === '40h' ? 200 : col.jornada === '36h' ? 180 : 220;
    const valorHora = salarioBase / horasMes;

    // Horas extras
    const valorHE50 = arredondar(valorHora * 1.5 * heHoras50);
    const valorHE100 = arredondar(valorHora * 2.0 * heHoras100);

    // Adicional noturno (20% sobre hora normal, entre 22h-5h)
    const horasNoturnasDeclaradas = parseFloat(params.horas_noturnas || 0);
    const adicionalNoturno = col.adicional_noturno || horasNoturnasDeclaradas > 0
      ? arredondar(valorHora * 0.20 * horasNoturnasDeclaradas)
      : 0;

    // Insalubridade (sobre salário mínimo)
    let insalubridade = 0;
    if (col.tem_insalubridade) {
      const percentuais = { Minimo: 0.10, Medio: 0.20, Maximo: 0.40 };
      insalubridade = arredondar(SALARIO_MINIMO * (percentuais[col.grau_insalubridade] || 0.10));
    }

    // Periculosidade (sobre salário base)
    const periculosidade = col.tem_periculosidade ? arredondar(salarioBase * 0.30) : 0;

    // Total proventos
    const totalProventos = arredondar(
      salarioBase + valorHE50 + valorHE100 + adicionalNoturno +
      insalubridade + periculosidade + bonus + comissao + outrosProventos
    );

    // Descontos
    const valorFaltas = arredondar((salarioBase / 30) * faltas);
    const valorAtrasos = arredondar((valorHora / 60) * atrasos);

    // Vale Transporte (desconto máximo 6% salário)
    const vtDeclarado = parseFloat(params.vale_transporte || 0);
    const vtDesconto = Math.min(vtDeclarado, arredondar(salarioBase * VT_PERCENTUAL_MAXIMO));

    // Benefícios com desconto em folha
    const { rows: beneficios } = await client.query(
      `SELECT SUM(bco.desconto_folha) AS total_descontos_beneficios,
              SUM(CASE WHEN bc.tipo = 'Plano_Saude' THEN bco.desconto_folha ELSE 0 END) AS plano_saude,
              SUM(CASE WHEN bc.tipo = 'Plano_Odonto' THEN bco.desconto_folha ELSE 0 END) AS plano_odonto,
              SUM(CASE WHEN bc.tipo = 'Vale_Refeicao' THEN bco.desconto_folha ELSE 0 END) AS vale_refeicao
       FROM beneficios_colaborador bco
       JOIN beneficios_catalogo bc ON bc.id = bco.beneficio_id
       WHERE bco.colaborador_id = $1 AND bco.ativo = TRUE`,
      [colaborador_id]
    );
    const benef = beneficios[0];
    const planoSaude = parseFloat(benef.plano_saude || 0);
    const planoOdonto = parseFloat(benef.plano_odonto || 0);
    const valeRefeicao = parseFloat(benef.vale_refeicao || 0);

    // INSS (base = proventos habituais, exceto parcelas não habituais como bônus eventual)
    const baseINSS = arredondar(salarioBase + valorHE50 + valorHE100 + adicionalNoturno + insalubridade + periculosidade);
    const { desconto: inss } = calcularINSS(baseINSS);

    // IRRF
    const { desconto: irrf } = calcularIRRF(baseINSS, inss, qtdDependentes);

    // FGTS
    const { valor: fgts } = calcularFGTSMensal(baseINSS);

    // INSS empresa
    const { total: inssEmpresa } = calcularINSSEmpresa(baseINSS);

    const totalDescontos = arredondar(
      inss + irrf + valorFaltas + valorAtrasos + vtDesconto +
      planoSaude + planoOdonto + valeRefeicao + outrosDescontos
    );
    const salarioLiquido = arredondar(totalProventos - totalDescontos);

    // Upsert na folha
    const { rows: [folha] } = await client.query(
      `INSERT INTO folha_pagamento (
        periodo_id, colaborador_id,
        salario_base, horas_extras_50, valor_he_50, horas_extras_100, valor_he_100,
        adicional_noturno, insalubridade, periculosidade, bonus, comissao, outros_proventos,
        total_proventos, inss, irrf, faltas_dias, valor_faltas, atrasos_minutos, valor_atrasos,
        vale_transporte, vale_refeicao, plano_saude, plano_odonto, outros_descontos,
        total_descontos, salario_liquido, fgts_valor, inss_empresa
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29
      )
      ON CONFLICT (periodo_id, colaborador_id) DO UPDATE SET
        salario_base=EXCLUDED.salario_base, horas_extras_50=EXCLUDED.horas_extras_50,
        valor_he_50=EXCLUDED.valor_he_50, horas_extras_100=EXCLUDED.horas_extras_100,
        valor_he_100=EXCLUDED.valor_he_100, adicional_noturno=EXCLUDED.adicional_noturno,
        insalubridade=EXCLUDED.insalubridade, periculosidade=EXCLUDED.periculosidade,
        bonus=EXCLUDED.bonus, comissao=EXCLUDED.comissao, outros_proventos=EXCLUDED.outros_proventos,
        total_proventos=EXCLUDED.total_proventos, inss=EXCLUDED.inss, irrf=EXCLUDED.irrf,
        faltas_dias=EXCLUDED.faltas_dias, valor_faltas=EXCLUDED.valor_faltas,
        atrasos_minutos=EXCLUDED.atrasos_minutos, valor_atrasos=EXCLUDED.valor_atrasos,
        vale_transporte=EXCLUDED.vale_transporte, vale_refeicao=EXCLUDED.vale_refeicao,
        plano_saude=EXCLUDED.plano_saude, plano_odonto=EXCLUDED.plano_odonto,
        outros_descontos=EXCLUDED.outros_descontos, total_descontos=EXCLUDED.total_descontos,
        salario_liquido=EXCLUDED.salario_liquido, fgts_valor=EXCLUDED.fgts_valor,
        inss_empresa=EXCLUDED.inss_empresa, atualizado_em=NOW()
      RETURNING *`,
      [
        periodo_id, colaborador_id,
        salarioBase, heHoras50, valorHE50, heHoras100, valorHE100,
        adicionalNoturno, insalubridade, periculosidade, bonus, comissao, outrosProventos,
        totalProventos, inss, irrf, faltas, valorFaltas, atrasos, valorAtrasos,
        vtDesconto, valeRefeicao, planoSaude, planoOdonto, outrosDescontos,
        totalDescontos, salarioLiquido, fgts, inssEmpresa,
      ]
    );

    await client.query('COMMIT');
    res.json({
      mensagem: 'Folha calculada com sucesso.',
      holerite: folha,
      detalhamento: {
        valorHora: arredondar(valorHora), horasMes,
        baseINSS, fgts, inssEmpresa,
        custoTotalEmpresa: arredondar(totalProventos + fgts + inssEmpresa),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

/**
 * Calcular folha para todos os colaboradores ativos do período
 */
const calcularFolhaCompleta = async (req, res) => {
  try {
    const { periodo_id } = req.params;
    const { rows: colaboradores } = await db.query(
      `SELECT id FROM colaboradores WHERE situacao = 'Ativo'`
    );

    const resultados = [];
    for (const col of colaboradores) {
      try {
        const mockReq = { params: { periodo_id, colaborador_id: col.id }, body: {}, usuario: req.usuario };
        const mockRes = {
          json: (data) => resultados.push({ colaborador_id: col.id, ...data }),
          status: () => ({ json: (err) => resultados.push({ colaborador_id: col.id, erro: err.erro }) }),
        };
        await calcularFolhaColaborador(mockReq, mockRes);
      } catch (e) {
        resultados.push({ colaborador_id: col.id, erro: e.message });
      }
    }

    // Atualizar totais do período
    await db.query(
      `UPDATE periodos_folha SET
        total_proventos = (SELECT SUM(total_proventos) FROM folha_pagamento WHERE periodo_id = $1),
        total_descontos = (SELECT SUM(total_descontos) FROM folha_pagamento WHERE periodo_id = $1),
        total_liquido = (SELECT SUM(salario_liquido) FROM folha_pagamento WHERE periodo_id = $1),
        total_inss_empresa = (SELECT SUM(inss_empresa) FROM folha_pagamento WHERE periodo_id = $1),
        total_fgts = (SELECT SUM(fgts_valor) FROM folha_pagamento WHERE periodo_id = $1),
        status = 'Calculada'
       WHERE id = $1`,
      [periodo_id]
    );

    res.json({ mensagem: 'Folha completa calculada.', processados: resultados.length, resultados });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const listarFolhaPeriodo = async (req, res) => {
  try {
    const { periodo_id } = req.params;
    const { rows } = await db.query(
      `SELECT f.*, c.nome_completo, c.cpf, ca.titulo AS cargo, d.nome AS departamento
       FROM folha_pagamento f
       JOIN colaboradores c ON c.id = f.colaborador_id
       LEFT JOIN cargos ca ON ca.id = c.cargo_id
       LEFT JOIN departamentos d ON d.id = c.departamento_id
       WHERE f.periodo_id = $1
       ORDER BY c.nome_completo`,
      [periodo_id]
    );
    const { rows: [periodo] } = await db.query(`SELECT * FROM periodos_folha WHERE id = $1`, [periodo_id]);
    res.json({ periodo, folhas: rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const fecharPeriodo = async (req, res) => {
  try {
    const { periodo_id } = req.params;
    const { rows: [p] } = await db.query(
      `UPDATE periodos_folha SET status='Fechada', data_fechamento=CURRENT_DATE WHERE id=$1 AND status='Calculada' RETURNING *`,
      [periodo_id]
    );
    if (!p) return res.status(400).json({ erro: 'Período não pode ser fechado. Verifique se foi calculado.' });
    res.json({ mensagem: 'Período fechado.', periodo: p });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const arredondar = (v) => Math.round(v * 100) / 100;

module.exports = { abrirPeriodo, calcularFolhaColaborador, calcularFolhaCompleta, listarFolhaPeriodo, fecharPeriodo };
