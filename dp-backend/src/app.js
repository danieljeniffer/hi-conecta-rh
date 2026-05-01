require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const routes = require('./routes');
const notificacaoService = require('./services/notificacaoService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'Departamento Pessoal - hi Conecta RH',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.path}` });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.stack);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Cron jobs para notificações automáticas
// Executa todo dia às 8h
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Verificando prazos e notificações...');
  try {
    await notificacaoService.verificarFeriasVencendo();
    await notificacaoService.verificarPrazosLegais();
    await notificacaoService.verificarExperienciaVencendo();
  } catch (err) {
    console.error('[CRON] Erro nos jobs de notificação:', err.message);
  }
}, { timezone: 'America/Sao_Paulo' });

app.listen(PORT, () => {
  console.log(`\n✅ Servidor DP rodando na porta ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api/v1`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
