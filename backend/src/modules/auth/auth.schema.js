'use strict';
const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase().trim(),
  senha: z.string().min(6, 'Senha deve ter mínimo 6 caracteres.'),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token obrigatório.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase().trim(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  nova_senha: z.string()
    .min(8, 'Senha deve ter mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Senha deve conter ao menos 1 letra maiúscula.')
    .regex(/[0-9]/, 'Senha deve conter ao menos 1 número.'),
});

const changePasswordSchema = z.object({
  senha_atual:  z.string().min(1, 'Senha atual obrigatória.'),
  nova_senha:   z.string().min(8, 'Nova senha deve ter mínimo 8 caracteres.'),
  confirmar:    z.string().min(1),
}).refine(d => d.nova_senha === d.confirmar, {
  message: 'Senhas não conferem.',
  path:    ['confirmar'],
});

module.exports = {
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
