'use strict';
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const compression = require('compression');
const path       = require('path');

const env    = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');

const rateLimitMiddleware  = require('./middleware/rateLimit.middleware');
const errorHandlerMiddleware = require('./middleware/errorHandler.middleware');

const app = express();

// ── Segurança ─────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Frontend SPA cuida disso
}));

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origem não permitida — ${origin}`));
  },
  credentials: true,
  methods:      ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Request-ID','X-Tenant-ID'],
  exposedHeaders: ['X-Total-Count','X-Page','X-Per-Page'],
}));

// ── Compressão + Body parsing ─────────────────
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ── Logging HTTP ──────────────────────────────
app.use(morgan(env.isProd() ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip:   (req) => req.path === '/health',
}));

// ── Rate limit global ─────────────────────────
app.use('/api', rateLimitMiddleware.global);

// ── Arquivos estáticos (uploads) ──────────────
app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

// ── Health check ──────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   process.env.npm_package_version || '1.0.0',
    env:       env.NODE_ENV,
  });
});

// ── Rotas da API ──────────────────────────────
app.use('/api/v1', routes);

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ── Tratamento global de erros ────────────────
app.use(errorHandlerMiddleware);

module.exports = app;
