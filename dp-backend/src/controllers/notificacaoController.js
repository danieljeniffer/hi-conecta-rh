const db = require('../config/database');
const notificacaoService = require('../services/notificacaoService');

const listar = async (req, res) => {
  try {
    const { status = 'Pendente', tipo, prioridade, page = 1, limit = 30 } = req.query;
    const params = [];
    const where = ['1=1'];

    if (status) { params.push(status); where.push(`n.status = $${params.length}`); }
    if (tipo) { params.push(tipo); where.push(`n.tipo = $${params.length}`); }
    if (prioridade) { params.push(prioridade); where.push(`n.prioridade = $${params.length}`); }

    params.push(limit, (page - 1) * limit);
    const { rows } = await db.query(
      `SELECT n.*, c.nome_completo AS colaborador_nome
       FROM notificacoes n
       LEFT JOIN colaboradores c ON c.id = n.colaborador_id
       WHERE ${where.join(' AND ')}
       ORDER BY
         CASE n.prioridade WHEN 'Critica' THEN 1 WHEN 'Alta' THEN 2 WHEN 'Normal' THEN 3 ELSE 4 END,
         n.criado_em DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: [total] } = await db.query(
      `SELECT COUNT(*) FROM notificacoes n WHERE ${where.join(' AND ')}`,
      params.slice(0, -2)
    );

    res.json({ dados: rows, total: parseInt(total.count) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const marcarLida = async (req, res) => {
  try {
    await db.query(
      `UPDATE notificacoes SET status='Lida', lida_em=NOW() WHERE id=$1`, [req.params.id]
    );
    res.json({ mensagem: 'Notificação marcada como lida.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const arquivar = async (req, res) => {
  try {
    await db.query(
      `UPDATE notificacoes SET status='Arquivada' WHERE id=$1`, [req.params.id]
    );
    res.json({ mensagem: 'Notificação arquivada.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const registrarFalta = async (req, res) => {
  try {
    const { colaborador_id, data, motivo } = req.body;
    await notificacaoService.notificarFaltaColaborador(colaborador_id, data, motivo);
    res.json({ mensagem: 'Falta registrada e notificação gerada.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const executarVerificacoes = async (req, res) => {
  try {
    await notificacaoService.verificarFeriasVencendo();
    await notificacaoService.verificarExperienciaVencendo();
    await notificacaoService.verificarPrazosLegais();
    res.json({ mensagem: 'Verificações executadas com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { listar, marcarLida, arquivar, registrarFalta, executarVerificacoes };
