/**
 * Serviço de Notificações Automáticas
 * Monitora prazos trabalhistas e gera alertas proativos
 */

const db = require('../config/database');

const ALERTAS_ANTECEDENCIA = {
  feriasVencendo: 60,       // dias antes do vencimento
  experienciaVencendo: 15,  // dias antes do fim da experiência
  prazoLegal: 5,            // dias antes do prazo legal
};

/**
 * Verifica colaboradores com férias vencendo
 */
const verificarFeriasVencendo = async () => {
  const sql = `
    SELECT
      pa.id, pa.colaborador_id, pa.data_limite_gozo, pa.dias_saldo,
      c.nome_completo, c.email
    FROM periodos_aquisitivos pa
    JOIN colaboradores c ON c.id = pa.colaborador_id
    WHERE pa.status = 'Pendente'
      AND pa.data_limite_gozo <= CURRENT_DATE + INTERVAL '${ALERTAS_ANTECEDENCIA.feriasVencendo} days'
      AND pa.data_limite_gozo >= CURRENT_DATE
      AND c.situacao = 'Ativo'
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.referencia_id = pa.id
          AND n.tipo = 'Ferias_Vencendo'
          AND n.criado_em > NOW() - INTERVAL '7 days'
      )
  `;

  const { rows } = await db.query(sql);

  for (const row of rows) {
    const diasRestantes = Math.floor(
      (new Date(row.data_limite_gozo) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const prioridade = diasRestantes <= 30 ? 'Alta' : 'Normal';

    await criarNotificacao({
      tipo: 'Ferias_Vencendo',
      titulo: `Férias vencendo em ${diasRestantes} dias — ${row.nome_completo}`,
      mensagem: `O colaborador ${row.nome_completo} possui ${row.dias_saldo} dias de férias a gozar. O prazo limite é ${formatarData(row.data_limite_gozo)}. Agende imediatamente.`,
      colaboradorId: row.colaborador_id,
      referenciaId: row.id,
      referenciaTabel: 'periodos_aquisitivos',
      dataPrazo: row.data_limite_gozo,
      prioridade,
    });
  }

  console.log(`[NOTIF] Férias vencendo: ${rows.length} alertas gerados.`);
};

/**
 * Verifica contratos de experiência vencendo
 */
const verificarExperienciaVencendo = async () => {
  const sql = `
    SELECT
      a.id, a.colaborador_id, a.data_experiencia_45, a.data_experiencia_60,
      c.nome_completo
    FROM admissoes a
    JOIN colaboradores c ON c.id = a.colaborador_id
    WHERE c.situacao = 'Ativo'
      AND c.tipo_contrato = 'Experiencia'
      AND (
        a.data_experiencia_45 BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${ALERTAS_ANTECEDENCIA.experienciaVencendo} days'
        OR
        a.data_experiencia_60 BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${ALERTAS_ANTECEDENCIA.experienciaVencendo} days'
      )
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.referencia_id = a.id
          AND n.tipo = 'Experiencia_Vencendo'
          AND n.criado_em > NOW() - INTERVAL '3 days'
      )
  `;

  const { rows } = await db.query(sql);

  for (const row of rows) {
    const dataVenc = row.data_experiencia_60 || row.data_experiencia_45;
    await criarNotificacao({
      tipo: 'Experiencia_Vencendo',
      titulo: `Experiência vencendo — ${row.nome_completo}`,
      mensagem: `O contrato de experiência de ${row.nome_completo} vence em ${formatarData(dataVenc)}. Defina: efetivação, prorrogação ou encerramento.`,
      colaboradorId: row.colaborador_id,
      referenciaId: row.id,
      referenciaTabel: 'admissoes',
      dataPrazo: dataVenc,
      prioridade: 'Alta',
    });
  }

  console.log(`[NOTIF] Experiências vencendo: ${rows.length} alertas gerados.`);
};

/**
 * Verifica prazos legais (eSocial, FGTS, INSS, folha)
 */
const verificarPrazosLegais = async () => {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  // Alerta para envio do eSocial S-1200 (dia 15 do mês seguinte)
  if (dia >= 10 && dia <= 15) {
    const mesFolha = mes === 1 ? 12 : mes - 1;
    const anoFolha = mes === 1 ? ano - 1 : ano;

    const { rows } = await db.query(
      `SELECT id FROM periodos_folha WHERE mes = $1 AND ano = $2 AND status = 'Calculada'`,
      [mesFolha, anoFolha]
    );

    if (rows.length > 0) {
      const prazo = new Date(ano, mes - 1, 15);
      await criarNotificacao({
        tipo: 'Prazo_Legal',
        titulo: `Prazo eSocial: enviar S-1200 de ${mesFolha}/${anoFolha}`,
        mensagem: `A folha de ${mesFolha}/${anoFolha} está calculada. Envie o evento S-1200 ao eSocial até ${formatarData(prazo.toISOString().split('T')[0])}.`,
        dataPrazo: prazo.toISOString().split('T')[0],
        prioridade: 'Alta',
      });
    }
  }
};

/**
 * Registra falta de colaborador e notifica gestores
 * @param {string} colaboradorId
 * @param {string} data
 * @param {string} motivo
 */
const notificarFaltaColaborador = async (colaboradorId, data, motivo = 'Não informado') => {
  const { rows } = await db.query(
    `SELECT nome_completo, departamento_id FROM colaboradores WHERE id = $1`,
    [colaboradorId]
  );

  if (!rows.length) return;

  await criarNotificacao({
    tipo: 'Falta_Colaborador',
    titulo: `Falta registrada — ${rows[0].nome_completo}`,
    mensagem: `O colaborador ${rows[0].nome_completo} faltou em ${formatarData(data)}. Motivo: ${motivo}. Verifique impacto na folha.`,
    colaboradorId,
    dataPrazo: data,
    prioridade: 'Normal',
  });
};

/**
 * Cria uma notificação no banco
 */
const criarNotificacao = async ({
  tipo, titulo, mensagem, colaboradorId = null, referenciaId = null,
  referenciaTabel = null, dataPrazo = null, prioridade = 'Normal', destinatarioId = null,
}) => {
  await db.query(
    `INSERT INTO notificacoes
      (tipo, titulo, mensagem, colaborador_id, referencia_id, referencia_tabela, data_prazo, prioridade, destinatario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [tipo, titulo, mensagem, colaboradorId, referenciaId, referenciaTabel, dataPrazo, prioridade, destinatarioId]
  );
};

const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

module.exports = {
  verificarFeriasVencendo,
  verificarExperienciaVencendo,
  verificarPrazosLegais,
  notificarFaltaColaborador,
  criarNotificacao,
};
