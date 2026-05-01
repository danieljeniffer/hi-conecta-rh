/**
 * Serviço de integração eSocial
 * Estrutura dos principais eventos conforme leiaute S-1.2
 *
 * Eventos implementados:
 * - S-2200: Admissão do colaborador
 * - S-1200: Remuneração mensal (folha)
 * - S-2230: Afastamento temporário (férias, licenças)
 * - S-2299: Desligamento (rescisão)
 */

const db = require('../config/database');

const AMBIENTE = {
  1: 'Produção',
  2: 'Testes (Homologação)',
};

/**
 * Gera payload do evento S-2200 (Admissão)
 * @param {string} colaboradorId
 * @param {string} admissaoId
 */
const gerarEventoS2200 = async (colaboradorId, admissaoId) => {
  const { rows: [colaborador] } = await db.query(
    `SELECT c.*, ca.titulo AS cargo, ca.codigo_cbo, d.nome AS departamento
     FROM colaboradores c
     LEFT JOIN cargos ca ON ca.id = c.cargo_id
     LEFT JOIN departamentos d ON d.id = c.departamento_id
     WHERE c.id = $1`,
    [colaboradorId]
  );

  const { rows: [admissao] } = await db.query(
    `SELECT * FROM admissoes WHERE id = $1`, [admissaoId]
  );

  if (!colaborador || !admissao) throw new Error('Colaborador ou admissão não encontrados.');

  const evento = {
    eSocial: {
      evtAdmissao: {
        ideEvento: {
          indRetificacao: 1,
          nrRec: null,
          indGuia: null,
          dtInicio: admissao.data_admissao,
          tpAmb: parseInt(process.env.ESOCIAL_AMBIENTE) || 2,
          procEmi: 1,
          verProc: process.env.ESOCIAL_VERSAO_LAYOUT || 'S-1.2',
        },
        ideEmpregador: {
          tpInsc: 1,
          nrInsc: (process.env.EMPRESA_CNPJ || '').replace(/\D/g, ''),
        },
        trabalhador: {
          cpfTrab: colaborador.cpf.replace(/\D/g, ''),
          nmTrab: colaborador.nome_completo,
          sexo: colaborador.genero === 'M' ? 'M' : 'F',
          racaCor: 1,
          estCiv: mapearEstadoCivil(colaborador.estado_civil),
          codMunic: null,
          escolaridade: null,
          dtNascto: colaborador.data_nascimento,
          paisNascto: 'BR',
          paisNac: 'BR',
          nmMae: null,
          nisPisPasep: colaborador.pis_pasep?.replace(/\D/g, ''),
        },
        vinculo: {
          matricula: colaborador.id.substring(0, 8).toUpperCase(),
          tpRegTrab: 1,
          tpRegPrev: 1,
          dtAdm: admissao.data_admissao,
          tpAdmissao: 1,
          indAdmissao: null,
          nrProcTrab: null,
          natAtividade: 1,
          dtBase: null,
          cnpjSindCateg: null,
          remuneracao: {
            vrSalFx: admissao.salario_inicial,
            undSalFixo: 5,
            dscSalVar: null,
          },
          jornada: {
            qtdHrsSem: mapearJornada(colaborador.jornada),
            tpJornada: 2,
            tmpParc: 0,
            horNoturno: colaborador.adicional_noturno ? 'S' : 'N',
            dscJorn: colaborador.jornada,
          },
          cargo: {
            nmCargo: colaborador.cargo,
            CBOCargo: colaborador.codigo_cbo || '2521-05',
          },
          locTrabalho: {
            logradouro: colaborador.logradouro,
            numero: colaborador.numero,
            complemento: colaborador.complemento,
            bairro: colaborador.bairro,
            cep: colaborador.cep?.replace(/\D/g, ''),
            codMunic: null,
            uf: colaborador.uf,
          },
        },
      },
    },
    _meta: {
      tipo: 'S-2200',
      colaboradorId,
      admissaoId,
      geradoEm: new Date().toISOString(),
      ambiente: AMBIENTE[parseInt(process.env.ESOCIAL_AMBIENTE) || 2],
    },
  };

  await registrarEvento('S-2200', colaboradorId, admissaoId, 'admissoes', evento);
  return evento;
};

/**
 * Gera payload do evento S-1200 (Remuneração mensal - folha)
 * @param {string} folhaId
 */
const gerarEventoS1200 = async (folhaId) => {
  const { rows: [folha] } = await db.query(
    `SELECT f.*, c.nome_completo, c.cpf, c.pis_pasep, p.mes, p.ano
     FROM folha_pagamento f
     JOIN colaboradores c ON c.id = f.colaborador_id
     JOIN periodos_folha p ON p.id = f.periodo_id
     WHERE f.id = $1`,
    [folhaId]
  );

  if (!folha) throw new Error('Folha não encontrada.');

  const evento = {
    eSocial: {
      evtRemun: {
        ideEvento: {
          indRetificacao: 1,
          nrRec: null,
          indApuracao: 1,
          perApur: `${folha.ano}-${String(folha.mes).padStart(2, '0')}`,
          tpAmb: parseInt(process.env.ESOCIAL_AMBIENTE) || 2,
          procEmi: 1,
          verProc: process.env.ESOCIAL_VERSAO_LAYOUT || 'S-1.2',
        },
        ideEmpregador: {
          tpInsc: 1,
          nrInsc: (process.env.EMPRESA_CNPJ || '').replace(/\D/g, ''),
        },
        ideTrabalhador: {
          cpfTrab: folha.cpf.replace(/\D/g, ''),
          nisPisPasep: folha.pis_pasep?.replace(/\D/g, ''),
        },
        dmDev: {
          codCateg: 101,
          remunPerApur: {
            matricula: folha.colaborador_id.substring(0, 8).toUpperCase(),
            indSimples: null,
            dtAdm: null,
            remun: {
              vrVrDesc: folha.total_descontos,
              vrCpSegurado: folha.inss,
              itensRemun: gerarItensRemuneracao(folha),
            },
            infoSaudeColet: null,
          },
          infoAgNocivo: null,
        },
      },
    },
    _meta: {
      tipo: 'S-1200',
      folhaId,
      competencia: `${folha.mes}/${folha.ano}`,
      geradoEm: new Date().toISOString(),
    },
  };

  await registrarEvento('S-1200', folha.colaborador_id, folhaId, 'folha_pagamento', evento);
  return evento;
};

/**
 * Gera payload do evento S-2299 (Desligamento)
 * @param {string} rescisaoId
 */
const gerarEventoS2299 = async (rescisaoId) => {
  const { rows: [rescisao] } = await db.query(
    `SELECT r.*, c.nome_completo, c.cpf, c.pis_pasep, c.data_admissao
     FROM rescisoes r
     JOIN colaboradores c ON c.id = r.colaborador_id
     WHERE r.id = $1`,
    [rescisaoId]
  );

  if (!rescisao) throw new Error('Rescisão não encontrada.');

  const evento = {
    eSocial: {
      evtDeslig: {
        ideEvento: {
          indRetificacao: 1,
          nrRec: null,
          tpAmb: parseInt(process.env.ESOCIAL_AMBIENTE) || 2,
          procEmi: 1,
          verProc: process.env.ESOCIAL_VERSAO_LAYOUT || 'S-1.2',
        },
        ideEmpregador: {
          tpInsc: 1,
          nrInsc: (process.env.EMPRESA_CNPJ || '').replace(/\D/g, ''),
        },
        ideTrabalhador: {
          cpfTrab: rescisao.cpf.replace(/\D/g, ''),
          nisPisPasep: rescisao.pis_pasep?.replace(/\D/g, ''),
        },
        infoDeslig: {
          matricula: rescisao.colaborador_id.substring(0, 8).toUpperCase(),
          dtDeslig: rescisao.data_desligamento,
          mtvDeslig: mapearMotivoDesligamento(rescisao.tipo),
          dtProjFimAPI: null,
          pensAlim: null,
          infoPensDivida: null,
        },
        verbas: {
          saldoSalario: rescisao.saldo_salario,
          avisoPrevioIndenizado: rescisao.aviso_previo_indenizado,
          feriasProporcionais: rescisao.ferias_proporcionais,
          decimoTerceiro: rescisao.decimo_terceiro_proporcional,
          multaFGTS: rescisao.fgts_multa_40,
          totalBruto: rescisao.total_bruto,
          totalLiquido: rescisao.total_liquido,
        },
      },
    },
    _meta: {
      tipo: 'S-2299',
      rescisaoId,
      geradoEm: new Date().toISOString(),
    },
  };

  await registrarEvento('S-2299', rescisao.colaborador_id, rescisaoId, 'rescisoes', evento);
  return evento;
};

// Helpers internos
const registrarEvento = async (tipoEvento, colaboradorId, referenciaId, referenciaTabel, payload) => {
  await db.query(
    `INSERT INTO esocial_eventos (tipo_evento, colaborador_id, referencia_id, referencia_tabela, payload, status)
     VALUES ($1, $2, $3, $4, $5, 'Pendente')`,
    [tipoEvento, colaboradorId, referenciaId, referenciaTabel, JSON.stringify(payload)]
  );
};

const mapearEstadoCivil = (ec) => {
  const mapa = { Solteiro: 1, Casado: 2, Divorciado: 3, Viuvo: 4, Uniao_Estavel: 5 };
  return mapa[ec] || 9;
};

const mapearJornada = (jornada) => {
  const mapa = { '44h': 44, '40h': 40, '36h': 36, '30h': 30, '20h': 20, Escala_12x36: 36, Escala_6x1: 44 };
  return mapa[jornada] || 44;
};

const mapearMotivoDesligamento = (tipo) => {
  const mapa = {
    Pedido_Demissao: '10',
    Sem_Justa_Causa: '03',
    Justa_Causa: '02',
    Acordo_Mutuo: '61',
    Termino_Contrato: '23',
  };
  return mapa[tipo] || '99';
};

const gerarItensRemuneracao = (folha) => {
  const itens = [{ codRubr: '0001', ideTabRubr: 'SALARIO', vrRubr: folha.salario_base, indApurIR: 0 }];
  if (folha.valor_he_50 > 0) itens.push({ codRubr: '0002', ideTabRubr: 'HE_50', vrRubr: folha.valor_he_50, indApurIR: 0 });
  if (folha.valor_he_100 > 0) itens.push({ codRubr: '0003', ideTabRubr: 'HE_100', vrRubr: folha.valor_he_100, indApurIR: 0 });
  if (folha.adicional_noturno > 0) itens.push({ codRubr: '0004', ideTabRubr: 'AD_NOT', vrRubr: folha.adicional_noturno, indApurIR: 0 });
  if (folha.insalubridade > 0) itens.push({ codRubr: '0005', ideTabRubr: 'INSALUB', vrRubr: folha.insalubridade, indApurIR: 0 });
  return itens;
};

module.exports = {
  gerarEventoS2200,
  gerarEventoS1200,
  gerarEventoS2299,
};
