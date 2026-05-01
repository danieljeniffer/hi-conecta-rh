const db = require('../config/database');
const { validarCPF } = require('../middlewares/validation');

const listar = async (req, res) => {
  try {
    const { situacao, departamento_id, cargo_id, busca, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const condicoes = ['1=1'];

    if (situacao) { params.push(situacao); condicoes.push(`c.situacao = $${params.length}`); }
    if (departamento_id) { params.push(departamento_id); condicoes.push(`c.departamento_id = $${params.length}`); }
    if (cargo_id) { params.push(cargo_id); condicoes.push(`c.cargo_id = $${params.length}`); }
    if (busca) {
      params.push(`%${busca}%`);
      condicoes.push(`(c.nome_completo ILIKE $${params.length} OR c.cpf ILIKE $${params.length} OR c.email ILIKE $${params.length})`);
    }

    const where = condicoes.join(' AND ');

    const { rows: total } = await db.query(
      `SELECT COUNT(*) FROM colaboradores c WHERE ${where}`, params
    );

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT c.id, c.nome_completo, c.cpf, c.email, c.celular, c.salario_base,
              c.data_admissao, c.situacao, c.tipo_contrato, c.jornada, c.foto_url,
              ca.titulo AS cargo, d.nome AS departamento,
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.data_admissao))::int AS anos_empresa
       FROM colaboradores c
       LEFT JOIN cargos ca ON ca.id = c.cargo_id
       LEFT JOIN departamentos d ON d.id = c.departamento_id
       WHERE ${where}
       ORDER BY c.nome_completo
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      dados: rows,
      paginacao: { total: parseInt(total[0].count), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              ca.titulo AS cargo_titulo, ca.codigo_cbo,
              d.nome AS departamento_nome
       FROM colaboradores c
       LEFT JOIN cargos ca ON ca.id = c.cargo_id
       LEFT JOIN departamentos d ON d.id = c.departamento_id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const { rows: dependentes } = await db.query(
      `SELECT * FROM dependentes_colaborador WHERE colaborador_id = $1`, [req.params.id]
    );
    const { rows: documentos } = await db.query(
      `SELECT id, tipo, nome_arquivo, criado_em FROM documentos_colaborador WHERE colaborador_id = $1`, [req.params.id]
    );
    const { rows: beneficios } = await db.query(
      `SELECT bc.nome, bc.tipo, bco.valor_mensal, bco.desconto_folha, bco.ativo
       FROM beneficios_colaborador bco
       JOIN beneficios_catalogo bc ON bc.id = bco.beneficio_id
       WHERE bco.colaborador_id = $1 AND bco.ativo = TRUE`, [req.params.id]
    );

    res.json({ ...rows[0], dependentes, documentos, beneficios });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const criar = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { cpf, pis_pasep, dependentes = [], ...dados } = req.body;

    if (!validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF inválido.' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    const { rows: existe } = await client.query(
      `SELECT id FROM colaboradores WHERE cpf = $1`, [cpfLimpo]
    );
    if (existe.length) return res.status(409).json({ erro: 'CPF já cadastrado.' });

    const { rows: [colaborador] } = await client.query(
      `INSERT INTO colaboradores (
        nome_completo, nome_social, cpf, rg, rg_orgao_expedidor, rg_data_expedicao,
        data_nascimento, genero, estado_civil, nacionalidade, naturalidade,
        pis_pasep, ctps_numero, ctps_serie, ctps_uf, titulo_eleitor,
        email, email_corporativo, telefone, celular,
        cep, logradouro, numero, complemento, bairro, cidade, uf,
        banco, agencia, conta, tipo_conta, pix_chave,
        cargo_id, departamento_id, tipo_contrato, jornada, salario_base,
        data_admissao, data_fim_contrato, qtd_dependentes_irrf,
        tem_insalubridade, grau_insalubridade, tem_periculosidade, adicional_noturno, observacoes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
        $41,$42,$43,$44,$45
      ) RETURNING id, nome_completo, cpf`,
      [
        dados.nome_completo, dados.nome_social, cpfLimpo, dados.rg, dados.rg_orgao_expedidor, dados.rg_data_expedicao,
        dados.data_nascimento, dados.genero, dados.estado_civil, dados.nacionalidade || 'Brasileiro(a)', dados.naturalidade,
        pis_pasep, dados.ctps_numero, dados.ctps_serie, dados.ctps_uf, dados.titulo_eleitor,
        dados.email, dados.email_corporativo, dados.telefone, dados.celular,
        dados.cep, dados.logradouro, dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.uf,
        dados.banco, dados.agencia, dados.conta, dados.tipo_conta || 'Corrente', dados.pix_chave,
        dados.cargo_id, dados.departamento_id, dados.tipo_contrato || 'CLT', dados.jornada || '44h', dados.salario_base,
        dados.data_admissao, dados.data_fim_contrato, dados.qtd_dependentes_irrf || 0,
        dados.tem_insalubridade || false, dados.grau_insalubridade, dados.tem_periculosidade || false,
        dados.adicional_noturno || false, dados.observacoes,
      ]
    );

    // Inserir dependentes
    for (const dep of dependentes) {
      await client.query(
        `INSERT INTO dependentes_colaborador (colaborador_id, nome, cpf, data_nascimento, parentesco, dependente_irrf)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [colaborador.id, dep.nome, dep.cpf, dep.data_nascimento, dep.parentesco, dep.dependente_irrf || false]
      );
    }

    // Registrar salário inicial no histórico
    await client.query(
      `INSERT INTO historico_salarial (colaborador_id, salario_novo, data_vigencia, motivo)
       VALUES ($1, $2, $3, 'Admissão')`,
      [colaborador.id, dados.salario_base, dados.data_admissao]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Colaborador cadastrado com sucesso.', colaborador });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const { rows } = await db.query(
      `UPDATE colaboradores SET
        nome_completo = COALESCE($1, nome_completo),
        nome_social = COALESCE($2, nome_social),
        email = COALESCE($3, email),
        celular = COALESCE($4, celular),
        cargo_id = COALESCE($5, cargo_id),
        departamento_id = COALESCE($6, departamento_id),
        jornada = COALESCE($7, jornada),
        situacao = COALESCE($8, situacao),
        tem_insalubridade = COALESCE($9, tem_insalubridade),
        grau_insalubridade = COALESCE($10, grau_insalubridade),
        tem_periculosidade = COALESCE($11, tem_periculosidade),
        adicional_noturno = COALESCE($12, adicional_noturno),
        qtd_dependentes_irrf = COALESCE($13, qtd_dependentes_irrf),
        observacoes = COALESCE($14, observacoes),
        banco = COALESCE($15, banco),
        agencia = COALESCE($16, agencia),
        conta = COALESCE($17, conta),
        pix_chave = COALESCE($18, pix_chave)
      WHERE id = $19 RETURNING id, nome_completo`,
      [
        dados.nome_completo, dados.nome_social, dados.email, dados.celular,
        dados.cargo_id, dados.departamento_id, dados.jornada, dados.situacao,
        dados.tem_insalubridade, dados.grau_insalubridade, dados.tem_periculosidade,
        dados.adicional_noturno, dados.qtd_dependentes_irrf, dados.observacoes,
        dados.banco, dados.agencia, dados.conta, dados.pix_chave, id,
      ]
    );

    if (!rows.length) return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    res.json({ mensagem: 'Colaborador atualizado.', colaborador: rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const atualizarSalario = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { salario_novo, data_vigencia, motivo } = req.body;

    const { rows: [col] } = await client.query(
      `SELECT salario_base FROM colaboradores WHERE id = $1`, [id]
    );
    if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    await client.query(
      `UPDATE colaboradores SET salario_base = $1 WHERE id = $2`, [salario_novo, id]
    );
    await client.query(
      `INSERT INTO historico_salarial (colaborador_id, salario_anterior, salario_novo, data_vigencia, motivo, aprovado_por)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, col.salario_base, salario_novo, data_vigencia, motivo, req.usuario.id]
    );

    await client.query('COMMIT');
    res.json({ mensagem: 'Salário atualizado.', salario_anterior: col.salario_base, salario_novo });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const historico = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT hs.*, u.nome AS aprovado_por_nome
       FROM historico_salarial hs
       LEFT JOIN usuarios u ON u.id = hs.aprovado_por
       WHERE hs.colaborador_id = $1
       ORDER BY hs.data_vigencia DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, atualizarSalario, historico };
