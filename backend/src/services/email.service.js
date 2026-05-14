'use strict';
const nodemailer = require('nodemailer');
const env        = require('../config/env');
const logger     = require('../config/logger');

// ── Transporte SMTP ───────────────────────────
const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  } : undefined,
});

// ── Templates de email ────────────────────────
const templates = {
  forgot_password: ({ nome, token }) => ({
    subject: 'Redefinição de senha — hi Conecta RH',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">Redefinição de Senha</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos sua solicitação de redefinição de senha. Use o token abaixo:</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px;text-align:center;letter-spacing:4px;font-size:24px;font-weight:bold;color:#1e293b;margin:16px 0">
          ${token.slice(0,8).toUpperCase()}
        </div>
        <p style="color:#64748b;font-size:12px">Este código expira em 1 hora.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
        <p style="color:#94a3b8;font-size:11px">hi Conecta RH — Se não foi você, ignore este e-mail.</p>
      </div>`,
  }),

  boas_vindas: ({ nome, empresa }) => ({
    subject: `Bem-vindo(a) ao ${empresa} — hi Conecta RH`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">Bem-vindo(a) ao time! 🎉</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Sua conta foi criada na plataforma <strong>hi Conecta RH</strong>.</p>
        <p>Acesse o sistema para:</p>
        <ul>
          <li>Visualizar seu holerite</li>
          <li>Solicitar férias</li>
          <li>Acompanhar seus benefícios</li>
          <li>Completar o onboarding</li>
        </ul>
        <p>Qualquer dúvida, fale com o RH.</p>
      </div>`,
  }),

  notification: ({ nome, titulo, mensagem }) => ({
    subject: titulo,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h3 style="color:#2563eb">${titulo}</h3>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>${mensagem}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:11px">hi Conecta RH</p>
      </div>`,
  }),

  holerite_disponivel: ({ nome, mes, valor }) => ({
    subject: `Holerite de ${mes} disponível — hi Conecta RH`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#16a34a">💰 Holerite Disponível</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Seu contracheque de <strong>${mes}</strong> está disponível no Portal do Colaborador.</p>
        ${valor ? `<p>Valor líquido: <strong style="color:#16a34a">R$ ${valor}</strong></p>` : ''}
        <p>Acesse o portal para baixar o PDF.</p>
      </div>`,
  }),
};

// ── Enviar email ──────────────────────────────
const enviar = async ({ to, template, data }) => {
  if (!to || !template) throw new Error('to e template são obrigatórios.');

  const tpl = templates[template];
  if (!tpl) throw new Error(`Template "${template}" não encontrado.`);

  const { subject, html } = tpl(data);

  try {
    const info = await transporter.sendMail({
      from:    env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`[Email] Enviado: ${subject} → ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    logger.error(`[Email] Falha ao enviar para ${to}:`, err.message);
    throw err;
  }
};

// Verificar conexão SMTP
const verificar = async () => {
  try {
    await transporter.verify();
    logger.info('[Email] SMTP OK.');
    return true;
  } catch (err) {
    logger.warn('[Email] SMTP não disponível:', err.message);
    return false;
  }
};

module.exports = { enviar, verificar };
