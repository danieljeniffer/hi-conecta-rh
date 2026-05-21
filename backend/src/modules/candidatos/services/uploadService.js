'use strict';
/**
 * uploadService.js
 * Upload seguro de currículos e anexos dos candidatos.
 * Validação MIME, limite de tamanho, nome seguro.
 *
 * @module candidatos/services/uploadService
 */

const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { prisma } = require('../../../config/database');
const logger = require('../../../config/logger');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'candidates');
const MAX_SIZE   = 10 * 1024 * 1024; // 10 MB

// MIME types permitidos
const ALLOWED_MIMES = {
  'application/pdf':                                          'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword':                                       'doc',
  'image/jpeg':                                               'jpg',
  'image/png':                                                'png',
};

// Garante diretório de upload
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Configuração do multer para upload de currículo.
 */
const curriculoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext    = ALLOWED_MIMES[file.mimetype] || 'bin';
      const seguro = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
      cb(null, seguro);
    },
  }),
  limits:  { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Tipo de arquivo não permitido. Use PDF, DOCX ou imagem.'), { status: 422 }));
    }
  },
});

/**
 * Salva referência do upload no banco e atualiza perfil do candidato.
 *
 * @param {string}  candidatoId
 * @param {Object}  file        - Objeto do multer
 * @param {string}  tipo        - 'curriculo' | 'certificado' | 'portfolio' | 'outro'
 * @param {boolean} principal   - Se é o currículo principal
 * @returns {Promise<Object>}   - CandidateAttachment criado
 */
const salvarAnexo = async (candidatoId, file, tipo = 'curriculo', principal = false) => {
  const caminho  = path.relative(process.cwd(), file.path);
  const url      = `/uploads/candidates/${file.filename}`;

  // Se for currículo principal, desmarca os outros
  if (principal && tipo === 'curriculo') {
    await prisma.candidateAttachment.updateMany({
      where: { candidato_id: candidatoId, tipo: 'curriculo', principal: true },
      data:  { principal: false },
    });
    // Atualiza URL do currículo no perfil
    await prisma.candidato.update({
      where: { id: candidatoId },
      data:  { curriculo_url: url },
    });
  }

  const anexo = await prisma.candidateAttachment.create({
    data: {
      candidato_id: candidatoId,
      tipo,
      nome_original:file.originalname,
      nome_salvo:   file.filename,
      caminho,
      tamanho:      file.size,
      mime_type:    file.mimetype,
      url,
      principal:    principal && tipo === 'curriculo',
    },
  });

  logger.info(`[Upload] Anexo salvo: ${file.originalname} (${file.size} bytes) → candidato ${candidatoId}`);

  // Dispara extração de skills por IA (assíncrono, não bloqueante)
  if (tipo === 'curriculo') {
    setImmediate(() => _extrairSkillsAsync(candidatoId, file.path).catch(err =>
      logger.warn('[Upload] Extração de skills falhou:', err.message)
    ));
  }

  return anexo;
};

/**
 * Extrai texto do PDF e processa skills com IA (assíncrono).
 */
const _extrairSkillsAsync = async (candidatoId, filePath) => {
  // Extração básica de texto (sem dependência de pdfjs pesado)
  // Em produção integrar com pdf-parse ou similar
  try {
    const texto = `Currículo candidato ${candidatoId}`; // placeholder
    const { extrairSkillsDosCurriculo } = require('../ai/curriculumMatcher');
    await extrairSkillsDosCurriculo(candidatoId, texto);
  } catch { /* silencioso */ }
};

module.exports = { curriculoUpload, salvarAnexo };
