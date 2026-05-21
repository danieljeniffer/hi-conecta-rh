'use strict';
/**
 * curriculumMatcher.js
 * IA de aderência: calcula % de compatibilidade entre candidato e vaga.
 * Extrai skills de currículo usando IA (Anthropic/OpenAI) ou matching local.
 * Exibe resultado como "Aderência à vaga: 87%".
 *
 * @module candidatos/ai/curriculumMatcher
 */

const logger  = require('../../../config/logger');
const { prisma } = require('../../../config/database');
const env     = require('../../../config/env');

/**
 * Calcula score de aderência entre candidato e vaga.
 * Usa IA se disponível, fallback para matching por keywords.
 *
 * @param {string} candidatoId
 * @param {string} vagaId
 * @returns {Promise<{score: number, aderencia_pct: number, breakdown: Object}>}
 */
const calcularAderencia = async (candidatoId, vagaId) => {
  const [candidato, vaga] = await Promise.all([
    prisma.candidato.findUnique({
      where:   { id: candidatoId },
      include: {
        habilidades:  { select: { nome: true, nivel: true } },
        experiencias: { select: { cargo: true, empresa: true, descricao: true } },
        formacoes:    { select: { curso: true, grau: true, status: true } },
      },
    }),
    prisma.vaga.findUnique({
      where:  { id: vagaId },
      select: { titulo: true, requisitos: true, descricao: true, senioridade: true },
    }),
  ]);

  if (!candidato || !vaga) return { score: 0, aderencia_pct: 0 };

  let aderenciaPct = 0;
  let breakdown    = {};

  const provedor = env.IA_PROVEDOR?.toLowerCase();
  const temIA    = (provedor === 'openai' && env.OPENAI_API_KEY) ||
                   (provedor === 'anthropic' && env.ANTHROPIC_API_KEY);

  if (temIA) {
    try {
      const resultado = await _calcularComIA(candidato, vaga);
      aderenciaPct = resultado.aderencia;
      breakdown    = resultado.breakdown;
    } catch (err) {
      logger.warn('[ATS/IA] Fallback para matching local:', err.message);
      ({ aderenciaPct, breakdown } = _calcularLocal(candidato, vaga));
    }
  } else {
    ({ aderenciaPct, breakdown } = _calcularLocal(candidato, vaga));
  }

  // Persiste o score na candidatura
  await prisma.candidateApplication.updateMany({
    where: { candidato_id: candidatoId, vaga_id: vagaId },
    data:  { aderencia_pct: aderenciaPct, score_ia: aderenciaPct },
  });

  return { score: aderenciaPct, aderencia_pct: aderenciaPct, breakdown };
};

/**
 * Cálculo via IA (Anthropic ou OpenAI).
 */
const _calcularComIA = async (candidato, vaga) => {
  const prompt = `Analise a compatibilidade entre o candidato e a vaga. Responda APENAS em JSON.

VAGA:
- Título: ${vaga.titulo}
- Senioridade: ${vaga.senioridade || 'não informado'}
- Requisitos: ${vaga.requisitos || 'não informado'}
- Descrição: ${(vaga.descricao || '').substring(0, 500)}

CANDIDATO:
- Habilidades: ${candidato.habilidades.map(h => h.nome).join(', ') || 'não informado'}
- Experiências: ${candidato.experiencias.map(e => `${e.cargo} na ${e.empresa}`).join('; ') || 'não informado'}
- Formação: ${candidato.formacoes.map(f => `${f.curso} (${f.grau})`).join('; ') || 'não informado'}

Responda com: {"aderencia": 0-100, "breakdown": {"habilidades": 0-100, "experiencia": 0-100, "formacao": 0-100, "senioridade": 0-100}, "pontos_fortes": ["..."], "lacunas": ["..."]}`;

  if (env.IA_PROVEDOR === 'anthropic') {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const msg    = await client.messages.create({
      model:    env.ANTHROPIC_MODEL || 'claude-opus-4-7',
      max_tokens:512,
      system:   'Você é um especialista em RH. Analise compatibilidade candidato-vaga. Responda APENAS JSON.',
      messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } else {
    const openai = require('openai');
    const client = new openai.OpenAI({ apiKey: env.OPENAI_API_KEY });
    const resp   = await client.chat.completions.create({
      model:           env.OPENAI_MODEL || 'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(resp.choices[0].message.content);
  }
};

/**
 * Cálculo local por keyword matching (sem IA).
 */
const _calcularLocal = (candidato, vaga) => {
  const requisitosWords = _extractWords(vaga.requisitos + ' ' + vaga.descricao);
  const candidatoWords  = _extractWords([
    ...candidato.habilidades.map(h => h.nome),
    ...candidato.experiencias.map(e => `${e.cargo} ${e.descricao || ''}`),
    ...candidato.formacoes.map(f => f.curso),
  ].join(' '));

  let matches = 0;
  requisitosWords.forEach(w => { if (candidatoWords.includes(w)) matches++; });
  const aderenciaPct = requisitosWords.length > 0
    ? Math.min(100, Math.round((matches / requisitosWords.length) * 100))
    : 50;

  return {
    aderenciaPct,
    breakdown: {
      habilidades: aderenciaPct,
      experiencia: candidato.experiencias.length > 0 ? 70 : 30,
      formacao:    candidato.formacoes.length > 0 ? 70 : 40,
      senioridade: 60,
    },
  };
};

const _extractWords = (text = '') =>
  text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !['para','como','este','esta','deve','será'].includes(w));

/**
 * Extrai skills do currículo usando IA.
 * Retorna array de strings com as habilidades detectadas.
 */
const extrairSkillsDosCurriculo = async (candidatoId, textoCurriculo) => {
  if (!textoCurriculo?.trim()) return [];

  const prompt = `Extraia as habilidades técnicas e comportamentais do texto do currículo.
Responda APENAS com JSON: {"skills": [{"nome": "...", "tipo": "tecnica|comportamental|idioma", "nivel": "basico|intermediario|avancado"}]}

CURRÍCULO:
${textoCurriculo.substring(0, 2000)}`;

  try {
    let skills = [];

    if (env.IA_PROVEDOR === 'anthropic' && env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const client    = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const msg       = await client.messages.create({
        model: env.ANTHROPIC_MODEL || 'claude-opus-4-7',
        max_tokens: 500,
        system:   'Extraia skills de currículo. Responda APENAS JSON.',
        messages: [{ role: 'user', content: prompt }],
      });
      const data = JSON.parse(msg.content[0].text.trim().replace(/```json|```/g, '').trim());
      skills = data.skills || [];
    }

    if (skills.length > 0) {
      // Salva skills detectadas
      await prisma.candidateSkill.deleteMany({ where: { candidato_id: candidatoId, detectado_ia: true } });
      await prisma.candidateSkill.createMany({
        data: skills.map(s => ({ ...s, candidato_id: candidatoId, detectado_ia: true })),
        skipDuplicates: true,
      });

      await prisma.candidato.update({
        where: { id: candidatoId },
        data:  { skills_detectadas: skills.map(s => s.nome), ai_parsed_at: new Date() },
      });
    }

    return skills;
  } catch (err) {
    logger.warn('[ATS/IA] Extração de skills falhou:', err.message);
    return [];
  }
};

module.exports = { calcularAderencia, extrairSkillsDosCurriculo };
