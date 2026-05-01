const db = require('../config/database');

const resumoGeral = async (req, res) => {
  try {
    // Indicadores gerais
    const { rows: [colaboradores] } = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE situacao = 'Ativo') AS ativos,
        COUNT(*) FILTER (WHERE situacao = 'Afastado') AS afastados,
        COUNT(*) FILTER (WHERE situacao = 'Ferias') AS em_ferias,
        COUNT(*) FILTER (WHERE situacao = 'Demitido' AND data_admissao >= DATE_TRUNC('year', CURRENT_DATE)) AS demitidos_ano,
        COUNT(*) FILTER (WHERE data_admissao >= DATE_TRUNC('month', CURRENT_DATE)) AS admitidos_mes,
        ROUND(AVG(salario_base) FILTER (WHERE situacao = 'Ativo'), 2) AS salario_medio
      FROM colaboradores
    `);

    // Folha do último mês calculado
    const { rows: [folhaMes] } = await db.query(`
      SELECT p.mes, p.ano, p.total_proventos, p.total_descontos, p.total_liquido,
             p.total_fgts, p.total_inss_empresa, p.status,
             (p.total_proventos + p.total_fgts + p.total_inss_empresa) AS custo_total
      FROM periodos_folha p
      WHERE p.status IN ('Calculada','Fechada','Paga')
      ORDER BY p.ano DESC, p.mes DESC
      LIMIT 1
    `);

    // Encargos por departamento
    const { rows: encargos } = await db.query(`
      SELECT d.nome AS departamento,
             COUNT(c.id) AS colaboradores,
             ROUND(SUM(c.salario_base), 2) AS total_salarios,
             ROUND(SUM(c.salario_base) * 0.08, 2) AS total_fgts_estimado,
             ROUND(SUM(c.salario_base) * 0.278, 2) AS total_encargos_estimado
      FROM colaboradores c
      LEFT JOIN departamentos d ON d.id = c.departamento_id
      WHERE c.situacao = 'Ativo'
      GROUP BY d.nome
      ORDER BY total_salarios DESC
    `);

    // Notificações pendentes
    const { rows: notificacoes } = await db.query(`
      SELECT tipo, prioridade, COUNT(*) AS qtd
      FROM notificacoes
      WHERE status = 'Pendente'
      GROUP BY tipo, prioridade
      ORDER BY
        CASE prioridade WHEN 'Critica' THEN 1 WHEN 'Alta' THEN 2 WHEN 'Normal' THEN 3 ELSE 4 END
    `);

    // Férias vencendo em 60 dias
    const { rows: feriasAlerta } = await db.query(`
      SELECT c.nome_completo, pa.data_limite_gozo, pa.dias_saldo,
             (pa.data_limite_gozo - CURRENT_DATE)::int AS dias_restantes
      FROM periodos_aquisitivos pa
      JOIN colaboradores c ON c.id = pa.colaborador_id
      WHERE pa.status = 'Pendente'
        AND pa.data_limite_gozo <= CURRENT_DATE + INTERVAL '60 days'
        AND c.situacao = 'Ativo'
      ORDER BY pa.data_limite_gozo
      LIMIT 10
    `);

    // Contratos de experiência vencendo
    const { rows: experiencias } = await db.query(`
      SELECT c.nome_completo, a.data_experiencia_60, a.data_experiencia_45
      FROM admissoes a
      JOIN colaboradores c ON c.id = a.colaborador_id
      WHERE c.situacao = 'Ativo' AND c.tipo_contrato = 'Experiencia'
        AND (a.data_experiencia_60 BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
          OR a.data_experiencia_45 BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '15 days')
      ORDER BY COALESCE(a.data_experiencia_60, a.data_experiencia_45)
      LIMIT 5
    `);

    // Histórico folha 6 meses
    const { rows: historicoFolha } = await db.query(`
      SELECT mes, ano, total_proventos, total_fgts, total_inss_empresa,
             (total_proventos + total_fgts + total_inss_empresa) AS custo_total
      FROM periodos_folha
      WHERE status IN ('Calculada','Fechada','Paga')
      ORDER BY ano DESC, mes DESC
      LIMIT 6
    `);

    // Benefícios por tipo
    const { rows: beneficiosTotais } = await db.query(`
      SELECT bc.tipo, bc.nome,
             COUNT(DISTINCT bco.colaborador_id) AS qtd_colaboradores,
             ROUND(SUM(bco.valor_mensal), 2) AS custo_empresa_mensal
      FROM beneficios_colaborador bco
      JOIN beneficios_catalogo bc ON bc.id = bco.beneficio_id
      WHERE bco.ativo = TRUE
      GROUP BY bc.tipo, bc.nome
      ORDER BY custo_empresa_mensal DESC
    `);

    res.json({
      colaboradores,
      folhaMes: folhaMes || null,
      encargos,
      notificacoes,
      alertas: { feriasVencendo: feriasAlerta, experiencias },
      historicoFolha: historicoFolha.reverse(),
      beneficiosTotais,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const custoEmpresa = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_custo_total_empresa LIMIT 12`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const turnover = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        EXTRACT(YEAR FROM r.data_desligamento)::int AS ano,
        EXTRACT(MONTH FROM r.data_desligamento)::int AS mes,
        COUNT(*) AS demissoes,
        COUNT(*) FILTER (WHERE r.tipo = 'Pedido_Demissao') AS voluntarios,
        COUNT(*) FILTER (WHERE r.tipo = 'Sem_Justa_Causa') AS sem_justa_causa,
        COUNT(*) FILTER (WHERE r.tipo = 'Justa_Causa') AS justa_causa
      FROM rescisoes r
      WHERE r.data_desligamento >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM r.data_desligamento), EXTRACT(MONTH FROM r.data_desligamento)
      ORDER BY ano DESC, mes DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { resumoGeral, custoEmpresa, turnover };
