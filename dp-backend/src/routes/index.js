const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { autenticar } = require('../middlewares/auth');

const colaboradorRoutes = require('./colaboradores');
const admissaoRoutes = require('./admissao');
const folhaRoutes = require('./folha');
const feriasRoutes = require('./ferias');
const decimoRoutes = require('./decimoTerceiro');
const rescisaoRoutes = require('./rescisao');
const beneficioRoutes = require('./beneficios');
const notificacaoRoutes = require('./notificacoes');
const dashboardRoutes = require('./dashboard');

// Auth
router.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const { rows: [user] } = await db.query(
      `SELECT * FROM usuarios WHERE email = $1 AND ativo = TRUE`, [email]
    );
    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    await db.query(`UPDATE usuarios SET ultimo_acesso=NOW() WHERE id=$1`, [user.id]);
    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Rotas protegidas
router.use('/colaboradores', autenticar, colaboradorRoutes);
router.use('/admissoes', autenticar, admissaoRoutes);
router.use('/folha', autenticar, folhaRoutes);
router.use('/ferias', autenticar, feriasRoutes);
router.use('/decimo-terceiro', autenticar, decimoRoutes);
router.use('/rescisoes', autenticar, rescisaoRoutes);
router.use('/beneficios', autenticar, beneficioRoutes);
router.use('/notificacoes', autenticar, notificacaoRoutes);
router.use('/dashboard', autenticar, dashboardRoutes);

// Endpoint de dados auxiliares (departamentos, cargos)
router.get('/departamentos', autenticar, async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM departamentos WHERE ativo=TRUE ORDER BY nome`);
  res.json(rows);
});
router.get('/cargos', autenticar, async (req, res) => {
  const { departamento_id } = req.query;
  const params = departamento_id ? [departamento_id] : [];
  const where = departamento_id ? 'WHERE departamento_id=$1 AND ativo=TRUE' : 'WHERE ativo=TRUE';
  const { rows } = await db.query(`SELECT * FROM cargos ${where} ORDER BY titulo`, params);
  res.json(rows);
});

// Simulações rápidas (sem autenticação para testes)
router.post('/simular/inss', (req, res) => {
  const { calcularINSS } = require('../services/calculoINSS');
  const { salario } = req.body;
  res.json(calcularINSS(parseFloat(salario)));
});
router.post('/simular/irrf', (req, res) => {
  const { calcularIRRF } = require('../services/calculoIRRF');
  const { salario, inss, dependentes = 0 } = req.body;
  res.json(calcularIRRF(parseFloat(salario), parseFloat(inss), parseInt(dependentes)));
});
router.post('/simular/rescisao', (req, res) => {
  const { calcularRescisao } = require('../services/calculoRescisao');
  try {
    const resultado = calcularRescisao(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;
