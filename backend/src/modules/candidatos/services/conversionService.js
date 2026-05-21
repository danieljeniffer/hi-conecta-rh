'use strict';
/**
 * conversionService.js
 * Conversão automática candidato → colaborador SEM REDIGITAÇÃO.
 * Porta dados do perfil ATS diretamente para o módulo RH.
 * Inicia onboarding, cria usuário, integra DP e Analytics.
 *
 * @module candidatos/services/conversionService
 */

const bcrypt  = require('bcrypt');
const { prisma }       = require('../../../config/database');
const { onboardingService } = require('../../onboarding/onboarding.service');
const { notificacaoService }= require('../../notificacoes/notificacao.service');
const { emitToEmpresa }     = require('../../../sockets');
const logger  = require('../../../config/logger');
const env     = require('../../../config/env');

const BCRYPT_ROUNDS = parseInt(env.BCRYPT_ROUNDS || '10', 10);

/**
 * Converte candidato aprovado em colaborador.
 * Cria colaborador, usuário do portal, timeline e inicia onboarding.
 *
 * @param {string}  empresaId     - ID da empresa
 * @param {string}  applicationId - ID da CandidateApplication
 * @param {Object}  dadosAdmissao - Dados complementares de admissão (cargo, depto, salário, etc.)
 * @param {string}  criadoPorId   - Usuário RH que autorizou
 * @returns {Promise<Object>}     - { colaborador, usuario, matricula }
 */
const converterCandidateParaColaborador = async (empresaId, applicationId, dadosAdmissao, criadoPorId) => {
  const app = await prisma.candidateApplication.findFirst({
    where:   { id: applicationId, empresa_id: empresaId },
    include: {
      candidato: {
        include: {
          experiencias: true,
          formacoes:    true,
          habilidades:  true,
          anexos:       { where: { tipo: 'curriculo', principal: true }, take: 1 },
        },
      },
      vaga: true,
    },
  });

  if (!app)                      throw { status: 404, message: 'Candidatura não encontrada.' };
  if (!app.candidato)            throw { status: 404, message: 'Candidato não encontrado.' };
  if (app.etapa !== 'aprovado' && app.etapa !== 'contratado') {
    throw { status: 422, message: 'Candidatura deve estar em "aprovado" ou "contratado" para converter.' };
  }
  if (app.colaborador_id)        throw { status: 409, message: 'Candidato já foi convertido em colaborador.' };

  const c = app.candidato;

  // 1. Verifica duplicata de CPF na empresa
  if (c.cpf) {
    const cpfExiste = await prisma.colaborador.findFirst({
      where: { empresa_id: empresaId, cpf: c.cpf, deleted_at: null },
    });
    if (cpfExiste) throw { status: 409, message: 'CPF já cadastrado como colaborador.' };
  }

  // 2. Gera matrícula sequencial
  const ultimoColab = await prisma.colaborador.findFirst({
    where:   { empresa_id: empresaId },
    orderBy: { created_at: 'desc' },
    select:  { matricula: true },
  });
  const proximoNum  = ultimoColab?.matricula ? parseInt(ultimoColab.matricula.replace(/\D/g, '')) + 1 : 1001;
  const matricula   = `EMP${String(proximoNum).padStart(4, '0')}`;

  // 3. Cria colaborador portando dados do candidato
  const colaborador = await prisma.colaborador.create({
    data: {
      empresa_id:       empresaId,
      nome:             c.nome,
      cpf:              c.cpf || null,
      rg:               c.rg || null,
      email:            c.email,
      telefone:         c.telefone || null,
      celular:          c.telefone || null,
      data_nascimento:  c.data_nascimento || null,
      foto_url:         c.foto_url || null,
      linkedin:         c.linkedin || null,
      cep:              c.cep || null,
      logradouro:       c.logradouro || null,
      numero:           c.numero || null,
      bairro:           c.bairro || null,
      cidade:           c.cidade || null,
      estado:           c.estado || null,
      // Dados de admissão fornecidos pelo RH
      cargo_id:         dadosAdmissao.cargo_id || app.vaga?.cargo_id || null,
      departamento_id:  dadosAdmissao.departamento_id || app.vaga?.departamento_id || null,
      salario_base:     dadosAdmissao.salario_base || c.pretensao_min || 0,
      regime:           dadosAdmissao.regime || app.vaga?.tipo_contrato || 'clt',
      data_admissao:    dadosAdmissao.data_admissao ? new Date(dadosAdmissao.data_admissao) : new Date(),
      matricula,
      status:           'ativo',
      gestor_nome:      dadosAdmissao.gestor_nome || null,
      carga_horaria:    dadosAdmissao.carga_horaria || 220,
      observacoes:      `Convertido do ATS em ${new Date().toLocaleDateString('pt-BR')}. App ID: ${applicationId}`,
      criado_por:       criadoPorId,
    },
  });

  // 4. Cria usuário de acesso ao portal
  const senhaTemporaria = _gerarSenhaTemporaria();
  const senha_hash      = await bcrypt.hash(senhaTemporaria, BCRYPT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: {
      empresa_id:     empresaId,
      colaborador_id: colaborador.id,
      email:          c.email,
      nome:           c.nome,
      senha_hash,
      perfil:         'colaborador',
      ativo:          true,
    },
  }).catch(() => null); // Se usuário já existe (ex: candidato interno), não falha

  // 5. Atualiza a candidatura com referência ao colaborador
  await prisma.candidateApplication.update({
    where: { id: applicationId },
    data:  {
      etapa:          'contratado',
      etapa_ordem:    7,
      colaborador_id: colaborador.id,
      convertido_em:  new Date(),
    },
  });

  // 6. Remove do banco de talentos ativo (entrou como colaborador)
  await prisma.candidato.update({
    where: { id: c.id },
    data:  { no_talent_pool: false },
  }).catch(() => {});

  // 7. Timeline de conversão
  await prisma.candidateTimeline.create({
    data: {
      application_id:    applicationId,
      candidato_id:      c.id,
      tipo:              'contratado',
      titulo:            '🎉 Bem-vindo(a) à equipe!',
      descricao:         `Você foi contratado(a)! Matrícula: ${matricula}`,
      visivel_candidato: true,
      criado_por:        criadoPorId,
    },
  });

  // 8. Inicia onboarding automaticamente
  try {
    await onboardingService.iniciarOnboarding(empresaId, colaborador.id, criadoPorId);
  } catch (err) {
    logger.warn('[Conversion] Onboarding não iniciado:', err.message);
  }

  // 9. Notificação ao RH e gestor
  await notificacaoService.criar({
    empresa_id:      empresaId,
    destinatario_id: criadoPorId,
    tipo:            'contratacao',
    titulo:          `${c.nome} foi contratado(a)!`,
    mensagem:        `Matrícula ${matricula} criada. Onboarding iniciado automaticamente.`,
    prioridade:      'alta',
    dados:           { colaborador_id: colaborador.id, matricula },
  });

  // 10. Socket.io — atualiza dashboards em tempo real
  emitToEmpresa(empresaId, 'ats:candidato_contratado', {
    colaborador_id: colaborador.id,
    nome:           c.nome,
    matricula,
    vaga:           app.vaga?.titulo,
    timestamp:      new Date().toISOString(),
  });

  // 11. Email com credenciais de acesso
  try {
    const { emailQueue } = require('../../../queues/email.queue');
    await emailQueue.add('boas-vindas', {
      to:                c.email,
      nome:              c.nome,
      matricula,
      senha_temporaria:  senhaTemporaria,
      empresa:           empresaId,
    });
  } catch { /* não bloqueia */ }

  logger.info(`[Conversion] ${c.nome} → Colaborador ${matricula} (empresa ${empresaId})`);

  return {
    colaborador: { id: colaborador.id, nome: colaborador.nome, matricula },
    usuario:     usuario ? { id: usuario.id, email: usuario.email } : null,
    senha_temporaria: senhaTemporaria, // retorna apenas na resposta da API, não persiste
    mensagem: `${c.nome} convertido em colaborador com sucesso. Matrícula: ${matricula}`,
  };
};

const _gerarSenhaTemporaria = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

module.exports = { converterCandidateParaColaborador };
