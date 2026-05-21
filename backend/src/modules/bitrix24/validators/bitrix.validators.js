'use strict';
/**
 * bitrix.validators.js
 * Schemas Zod para validação de entrada das rotas Bitrix24.
 *
 * @module bitrix24/validators/bitrix.validators
 */

const { z } = require('zod');

/** Configuração da integração Bitrix24 por empresa */
const configSchema = z.object({
  webhook_url:    z.string().url('webhook_url deve ser uma URL válida'),
  webhook_secret: z.string().min(16, 'webhook_secret deve ter ao menos 16 caracteres').optional(),
  sincronizar_usuarios: z.boolean().default(true),
  sincronizar_chat:     z.boolean().default(true),
  sincronizar_knowledge:z.boolean().default(true),
  retencao_dias:        z.number().int().min(30).max(3650).default(365),
  ip_allowlist:         z.array(z.string()).optional(),
});

/** Parâmetros de sincronização incremental */
const syncSchema = z.object({
  desde: z.string().datetime({ message: 'desde deve ser uma data ISO 8601' }).optional(),
  empresa_id: z.string().uuid().optional(),
});

/** Parâmetros de query para dashboard de engajamento */
const engagementQuerySchema = z.object({
  limit:         z.coerce.number().int().min(1).max(200).default(20),
  classificacao: z.enum(['baixo','medio','alto','muito_engajado']).optional(),
  risco:         z.enum(['baixo','medio','alto','critico']).optional(),
  departamento_id:z.string().uuid().optional(),
  periodo:       z.string().regex(/^\d{4}-\d{2}$/, 'período deve ser YYYY-MM').optional(),
}).optional();

/** Parâmetros de envio de mensagem Bitrix */
const sendMessageSchema = z.object({
  bitrix_user_id: z.string().min(1),
  message:        z.string().min(1).max(4096),
});

/** Payload de webhook (validação mínima — aceita qualquer evento válido do Bitrix) */
const webhookPayloadSchema = z.object({
  event:       z.string().min(1).optional(),
  EVENT:       z.string().min(1).optional(),
  data:        z.record(z.unknown()).optional(),
  auth:        z.record(z.unknown()).optional(),
}).passthrough(); // aceita campos extras (Bitrix envia muitos campos variáveis)

module.exports = { configSchema, syncSchema, engagementQuerySchema, sendMessageSchema, webhookPayloadSchema };
