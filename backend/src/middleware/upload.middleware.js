'use strict';
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuid } = require('uuid');
const env    = require('../config/env');

// Tipos MIME permitidos
const MIME_TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// Storage organizado por tenant
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const empresaId = req.user?.empresa_id || 'geral';
    const dir = path.join(process.cwd(), env.UPLOAD_DIR, empresaId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${uuid()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (MIME_TIPOS_PERMITIDOS.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
};

// Instâncias prontas para uso
const uploadDoc  = multer({ storage, fileFilter, limits: { fileSize: env.UPLOAD_MAX_SIZE } });
const uploadFoto = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg','image/png','image/webp'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Apenas imagens JPG, PNG ou WebP.'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB para fotos
});

// Middleware de campo único
const singleDoc  = uploadDoc.single('arquivo');
const singleFoto = uploadFoto.single('foto');

// Wrapper que converte erro do Multer para formato padrão
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msgs = {
        LIMIT_FILE_SIZE: `Arquivo muito grande. Máximo: ${Math.round(env.UPLOAD_MAX_SIZE / 1024 / 1024)}MB`,
        LIMIT_FILE_COUNT: 'Muitos arquivos.',
        LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado.',
      };
      return res.status(400).json({ success: false, message: msgs[err.code] || err.message });
    }
    return res.status(400).json({ success: false, message: err.message });
  });
};

module.exports = {
  singleDoc:  handleUpload(singleDoc),
  singleFoto: handleUpload(singleFoto),
  uploadDoc,
  uploadFoto,
};
