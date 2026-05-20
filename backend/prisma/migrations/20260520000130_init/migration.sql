-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('admin', 'rh', 'analista', 'gestor', 'colaborador', 'juridico');

-- CreateEnum
CREATE TYPE "StatusColaborador" AS ENUM ('ativo', 'ferias', 'afastado', 'desligado', 'admissao_pendente');

-- CreateEnum
CREATE TYPE "RegimeContratacao" AS ENUM ('clt', 'pj', 'estagio', 'temporario', 'autonomo');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('contrato', 'aditivo', 'advertencia', 'atestado', 'declaracao', 'certificado', 'exame_admissional', 'exame_demissional', 'epi', 'politica', 'outro');

-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('pendente', 'enviado', 'assinado', 'vencido', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusFerias" AS ENUM ('pendente', 'aprovada', 'recusada', 'em_gozo', 'concluida');

-- CreateEnum
CREATE TYPE "TipoRescisao" AS ENUM ('sem_justa_causa', 'pedido_demissao', 'justa_causa', 'acordo_mutuo', 'termino_contrato', 'aposentadoria');

-- CreateEnum
CREATE TYPE "StatusFolha" AS ENUM ('aberta', 'calculada', 'aprovada', 'paga', 'cancelada');

-- CreateEnum
CREATE TYPE "PrioridadeNotificacao" AS ENUM ('baixa', 'normal', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "StatusWorkflow" AS ENUM ('pendente', 'em_andamento', 'aprovado', 'recusado', 'cancelado', 'expirado');

-- CreateEnum
CREATE TYPE "TipoWorkflow" AS ENUM ('aprovacao_ferias', 'aprovacao_beneficio', 'solicitacao_documento', 'desligamento', 'admissao', 'reajuste_salarial', 'compra', 'treinamento', 'generico');

-- CreateEnum
CREATE TYPE "TipoRegistroPonto" AS ENUM ('entrada', 'saida_intervalo', 'retorno_intervalo', 'saida');

-- CreateEnum
CREATE TYPE "StatusVaga" AS ENUM ('rascunho', 'aberta', 'em_triagem', 'entrevistas', 'proposta', 'fechada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusCandidato" AS ENUM ('inscrito', 'triagem', 'entrevista_rh', 'entrevista_tecnica', 'proposta', 'aprovado', 'reprovado', 'desistiu');

-- CreateEnum
CREATE TYPE "PlanoEmpresa" AS ENUM ('trial', 'starter', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "StatusEmpresa" AS ENUM ('ativa', 'trial', 'inadimplente', 'cancelada', 'suspensa');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "razao_social" TEXT,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "logo_url" TEXT,
    "plano" "PlanoEmpresa" NOT NULL DEFAULT 'trial',
    "status" "StatusEmpresa" NOT NULL DEFAULT 'trial',
    "trial_ate" TIMESTAMP(3),
    "max_colaboradores" INTEGER NOT NULL DEFAULT 30,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'colaborador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acesso" TIMESTAMP(3),
    "ultimo_ip" TEXT,
    "mfa_secret" TEXT,
    "mfa_ativo" BOOLEAN NOT NULL DEFAULT false,
    "reset_token" TEXT,
    "reset_expira" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "gestor_id" TEXT,
    "pai_id" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo_cbo" TEXT,
    "nivel" TEXT,
    "salario_min" DECIMAL(12,2),
    "salario_max" DECIMAL(12,2),
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "departamento_id" TEXT,
    "cargo_id" TEXT,
    "gestor_id" TEXT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "sexo" TEXT,
    "estado_civil" TEXT,
    "nacionalidade" TEXT DEFAULT 'Brasileiro',
    "foto_url" TEXT,
    "pis_pasep" TEXT,
    "ctps_numero" TEXT,
    "ctps_serie" TEXT,
    "titulo_eleitor" TEXT,
    "cnh_numero" TEXT,
    "cnh_categoria" TEXT,
    "cnh_validade" TIMESTAMP(3),
    "email" TEXT,
    "email_corporativo" TEXT,
    "telefone" TEXT,
    "celular" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "tipo_conta" TEXT,
    "pix_tipo" TEXT,
    "pix_chave" TEXT,
    "regime" "RegimeContratacao" NOT NULL DEFAULT 'clt',
    "data_admissao" TIMESTAMP(3) NOT NULL,
    "data_demissao" TIMESTAMP(3),
    "status" "StatusColaborador" NOT NULL DEFAULT 'ativo',
    "salario_base" DECIMAL(12,2) NOT NULL,
    "carga_horaria" INTEGER NOT NULL DEFAULT 220,
    "gestor_nome" TEXT,
    "onboarding_completo" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_pct" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependentes" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "cpf" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "ir" BOOLEAN NOT NULL DEFAULT false,
    "plano_saude" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_salarial" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "salario_anterior" DECIMAL(12,2) NOT NULL,
    "salario_novo" DECIMAL(12,2) NOT NULL,
    "percentual" DECIMAL(5,2) NOT NULL,
    "motivo" TEXT,
    "vigencia" TIMESTAMP(3) NOT NULL,
    "aprovado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_salarial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folhas_pagamento" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "status" "StatusFolha" NOT NULL DEFAULT 'aberta',
    "total_bruto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_liquido" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_descontos" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_fgts" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_inss" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_irrf" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fechado_em" TIMESTAMP(3),
    "fechado_por" TEXT,
    "pago_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "folhas_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folha_itens" (
    "id" TEXT NOT NULL,
    "folha_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "salario_base" DECIMAL(12,2) NOT NULL,
    "dias_trabalhados" INTEGER NOT NULL DEFAULT 30,
    "horas_extras" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "valor_he" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "faltas" INTEGER NOT NULL DEFAULT 0,
    "desconto_faltas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "outros_proventos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "inss" DECIMAL(10,2) NOT NULL,
    "irrf" DECIMAL(10,2) NOT NULL,
    "fgts" DECIMAL(10,2) NOT NULL,
    "plano_saude" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vale_transporte" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "outros_descontos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_bruto" DECIMAL(12,2) NOT NULL,
    "total_liquido" DECIMAL(12,2) NOT NULL,
    "proventos_json" JSONB,
    "descontos_json" JSONB,
    "status_esocial" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folha_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ferias" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fim" TIMESTAMP(3) NOT NULL,
    "gozo_inicio" TIMESTAMP(3),
    "gozo_fim" TIMESTAMP(3),
    "dias_solicitados" INTEGER NOT NULL,
    "dias_abono" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusFerias" NOT NULL DEFAULT 'pendente',
    "aprovado_por" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "recusado_motivo" TEXT,
    "valor_ferias" DECIMAL(12,2),
    "valor_terco" DECIMAL(10,2),
    "valor_abono" DECIMAL(10,2),
    "valor_inss" DECIMAL(10,2),
    "valor_irrf" DECIMAL(10,2),
    "valor_liquido" DECIMAL(12,2),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ferias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescisoes" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "tipo" "TipoRescisao" NOT NULL,
    "data_demissao" TIMESTAMP(3) NOT NULL,
    "aviso_previo_dias" INTEGER NOT NULL,
    "aviso_inicio" TIMESTAMP(3),
    "aviso_fim" TIMESTAMP(3),
    "indenizado" BOOLEAN NOT NULL DEFAULT false,
    "saldo_salario" DECIMAL(12,2),
    "ferias_vencidas" DECIMAL(12,2),
    "ferias_proporc" DECIMAL(12,2),
    "terco_ferias" DECIMAL(12,2),
    "decimo_proporc" DECIMAL(12,2),
    "aviso_previo_val" DECIMAL(12,2),
    "multa_fgts" DECIMAL(12,2),
    "fgts_saldo" DECIMAL(12,2),
    "inss" DECIMAL(10,2),
    "irrf" DECIMAL(10,2),
    "outros" DECIMAL(10,2),
    "total_bruto" DECIMAL(14,2),
    "total_liquido" DECIMAL(14,2),
    "motivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "homologado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rescisoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficio_categorias" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "fornecedor" TEXT,
    "valor_empresa" DECIMAL(10,2),
    "valor_colab" DECIMAL(10,2),
    "recorrencia" TEXT DEFAULT 'mensal',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficio_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaborador_beneficios" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "beneficio_id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fim" TIMESTAMP(3),
    "valor_empresa" DECIMAL(10,2),
    "valor_colab" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaborador_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT,
    "tipo" "TipoDocumento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "arquivo_url" TEXT NOT NULL,
    "arquivo_nome" TEXT NOT NULL,
    "arquivo_size" INTEGER,
    "mime_type" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusDocumento" NOT NULL DEFAULT 'pendente',
    "assinado_em" TIMESTAMP(3),
    "assinado_por" TEXT,
    "vence_em" TIMESTAMP(3),
    "enviado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_templates" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_tasks" (
    "id" TEXT NOT NULL,
    "template_id" TEXT,
    "colaborador_id" TEXT,
    "empresa_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavel" TEXT,
    "prazo_dias" INTEGER NOT NULL DEFAULT 3,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluida_em" TIMESTAMP(3),
    "concluida_por" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo" "TipoWorkflow" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dados" JSONB,
    "solicitante_id" TEXT NOT NULL,
    "aprovador_id" TEXT,
    "status" "StatusWorkflow" NOT NULL DEFAULT 'pendente',
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "prazo" TIMESTAMP(3),
    "aprovado_em" TIMESTAMP(3),
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "destinatario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dados" JSONB,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lida_em" TIMESTAMP(3),
    "prioridade" "PrioridadeNotificacao" NOT NULL DEFAULT 'normal',
    "canal" TEXT NOT NULL DEFAULT 'inapp',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_ponto" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "tipo" "TipoRegistroPonto" NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "dispositivo" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "ajustado" BOOLEAN NOT NULL DEFAULT false,
    "ajustado_por" TEXT,
    "ajuste_motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_ponto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicados" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "autor_id" TEXT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "publicado_em" TIMESTAMP(3),
    "expira_em" TIMESTAMP(3),
    "segmentos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "midia_url" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'post',
    "fixado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reacoes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'like',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinamentos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "carga_horaria" INTEGER,
    "modalidade" TEXT NOT NULL DEFAULT 'ead',
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "prazo_dias" INTEGER,
    "conteudo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "treinamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinamento_colaboradores" (
    "id" TEXT NOT NULL,
    "treinamento_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "iniciado_em" TIMESTAMP(3),
    "concluido_em" TIMESTAMP(3),
    "nota" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treinamento_colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "departamento_id" TEXT,
    "cargo_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "requisitos" TEXT,
    "beneficios" TEXT,
    "salario_min" DECIMAL(12,2),
    "salario_max" DECIMAL(12,2),
    "local" TEXT,
    "remoto" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusVaga" NOT NULL DEFAULT 'rascunho',
    "vagas_qtd" INTEGER NOT NULL DEFAULT 1,
    "publicada_em" TIMESTAMP(3),
    "encerra_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "linkedin" TEXT,
    "curriculo_url" TEXT,
    "origem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" TEXT NOT NULL,
    "vaga_id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "colaborador_id" TEXT,
    "status" "StatusCandidato" NOT NULL DEFAULT 'inscrito',
    "etapa_atual" TEXT,
    "nota" DECIMAL(5,2),
    "observacoes" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "usuario_id" TEXT,
    "acao" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "recurso_id" TEXT,
    "dados_antes" JSONB,
    "dados_depois" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE INDEX "empresas_cnpj_idx" ON "empresas"("cnpj");

-- CreateIndex
CREATE INDEX "empresas_status_idx" ON "empresas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_colaborador_id_key" ON "usuarios"("colaborador_id");

-- CreateIndex
CREATE INDEX "usuarios_empresa_id_idx" ON "usuarios"("empresa_id");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empresa_id_email_key" ON "usuarios"("empresa_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "departamentos_empresa_id_idx" ON "departamentos"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_empresa_id_nome_key" ON "departamentos"("empresa_id", "nome");

-- CreateIndex
CREATE INDEX "cargos_empresa_id_idx" ON "cargos"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_empresa_id_nome_key" ON "cargos"("empresa_id", "nome");

-- CreateIndex
CREATE INDEX "colaboradores_empresa_id_idx" ON "colaboradores"("empresa_id");

-- CreateIndex
CREATE INDEX "colaboradores_status_idx" ON "colaboradores"("status");

-- CreateIndex
CREATE INDEX "colaboradores_departamento_id_idx" ON "colaboradores"("departamento_id");

-- CreateIndex
CREATE INDEX "colaboradores_cpf_idx" ON "colaboradores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_empresa_id_cpf_key" ON "colaboradores"("empresa_id", "cpf");

-- CreateIndex
CREATE INDEX "dependentes_colaborador_id_idx" ON "dependentes"("colaborador_id");

-- CreateIndex
CREATE INDEX "historico_salarial_colaborador_id_idx" ON "historico_salarial"("colaborador_id");

-- CreateIndex
CREATE INDEX "folhas_pagamento_empresa_id_competencia_idx" ON "folhas_pagamento"("empresa_id", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "folhas_pagamento_empresa_id_competencia_key" ON "folhas_pagamento"("empresa_id", "competencia");

-- CreateIndex
CREATE INDEX "folha_itens_folha_id_idx" ON "folha_itens"("folha_id");

-- CreateIndex
CREATE INDEX "folha_itens_colaborador_id_idx" ON "folha_itens"("colaborador_id");

-- CreateIndex
CREATE UNIQUE INDEX "folha_itens_folha_id_colaborador_id_key" ON "folha_itens"("folha_id", "colaborador_id");

-- CreateIndex
CREATE INDEX "ferias_empresa_id_idx" ON "ferias"("empresa_id");

-- CreateIndex
CREATE INDEX "ferias_colaborador_id_idx" ON "ferias"("colaborador_id");

-- CreateIndex
CREATE INDEX "ferias_status_idx" ON "ferias"("status");

-- CreateIndex
CREATE INDEX "rescisoes_empresa_id_idx" ON "rescisoes"("empresa_id");

-- CreateIndex
CREATE INDEX "rescisoes_colaborador_id_idx" ON "rescisoes"("colaborador_id");

-- CreateIndex
CREATE INDEX "beneficio_categorias_empresa_id_idx" ON "beneficio_categorias"("empresa_id");

-- CreateIndex
CREATE INDEX "colaborador_beneficios_colaborador_id_idx" ON "colaborador_beneficios"("colaborador_id");

-- CreateIndex
CREATE UNIQUE INDEX "colaborador_beneficios_colaborador_id_beneficio_id_key" ON "colaborador_beneficios"("colaborador_id", "beneficio_id");

-- CreateIndex
CREATE INDEX "documentos_empresa_id_idx" ON "documentos"("empresa_id");

-- CreateIndex
CREATE INDEX "documentos_colaborador_id_idx" ON "documentos"("colaborador_id");

-- CreateIndex
CREATE INDEX "documentos_tipo_idx" ON "documentos"("tipo");

-- CreateIndex
CREATE INDEX "documentos_vence_em_idx" ON "documentos"("vence_em");

-- CreateIndex
CREATE INDEX "onboarding_tasks_colaborador_id_idx" ON "onboarding_tasks"("colaborador_id");

-- CreateIndex
CREATE INDEX "onboarding_tasks_empresa_id_idx" ON "onboarding_tasks"("empresa_id");

-- CreateIndex
CREATE INDEX "workflows_empresa_id_idx" ON "workflows"("empresa_id");

-- CreateIndex
CREATE INDEX "workflows_status_idx" ON "workflows"("status");

-- CreateIndex
CREATE INDEX "workflows_solicitante_id_idx" ON "workflows"("solicitante_id");

-- CreateIndex
CREATE INDEX "notificacoes_empresa_id_destinatario_id_idx" ON "notificacoes"("empresa_id", "destinatario_id");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "notificacoes_created_at_idx" ON "notificacoes"("created_at");

-- CreateIndex
CREATE INDEX "registros_ponto_empresa_id_colaborador_id_idx" ON "registros_ponto"("empresa_id", "colaborador_id");

-- CreateIndex
CREATE INDEX "registros_ponto_data_hora_idx" ON "registros_ponto"("data_hora");

-- CreateIndex
CREATE INDEX "comunicados_empresa_id_idx" ON "comunicados"("empresa_id");

-- CreateIndex
CREATE INDEX "comunicados_publicado_idx" ON "comunicados"("publicado");

-- CreateIndex
CREATE INDEX "feed_posts_empresa_id_idx" ON "feed_posts"("empresa_id");

-- CreateIndex
CREATE INDEX "feed_posts_created_at_idx" ON "feed_posts"("created_at");

-- CreateIndex
CREATE INDEX "comentarios_post_id_idx" ON "comentarios"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "reacoes_post_id_usuario_id_key" ON "reacoes"("post_id", "usuario_id");

-- CreateIndex
CREATE INDEX "treinamentos_empresa_id_idx" ON "treinamentos"("empresa_id");

-- CreateIndex
CREATE INDEX "treinamento_colaboradores_colaborador_id_idx" ON "treinamento_colaboradores"("colaborador_id");

-- CreateIndex
CREATE UNIQUE INDEX "treinamento_colaboradores_treinamento_id_colaborador_id_key" ON "treinamento_colaboradores"("treinamento_id", "colaborador_id");

-- CreateIndex
CREATE INDEX "vagas_empresa_id_idx" ON "vagas"("empresa_id");

-- CreateIndex
CREATE INDEX "vagas_status_idx" ON "vagas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_email_key" ON "candidatos"("email");

-- CreateIndex
CREATE INDEX "candidaturas_vaga_id_idx" ON "candidaturas"("vaga_id");

-- CreateIndex
CREATE INDEX "candidaturas_candidato_id_idx" ON "candidaturas"("candidato_id");

-- CreateIndex
CREATE INDEX "candidaturas_status_idx" ON "candidaturas"("status");

-- CreateIndex
CREATE INDEX "audit_logs_empresa_id_idx" ON "audit_logs"("empresa_id");

-- CreateIndex
CREATE INDEX "audit_logs_usuario_id_idx" ON "audit_logs"("usuario_id");

-- CreateIndex
CREATE INDEX "audit_logs_recurso_idx" ON "audit_logs"("recurso");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_pai_id_fkey" FOREIGN KEY ("pai_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos" ADD CONSTRAINT "cargos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_salarial" ADD CONSTRAINT "historico_salarial_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folhas_pagamento" ADD CONSTRAINT "folhas_pagamento_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folha_itens" ADD CONSTRAINT "folha_itens_folha_id_fkey" FOREIGN KEY ("folha_id") REFERENCES "folhas_pagamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folha_itens" ADD CONSTRAINT "folha_itens_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ferias" ADD CONSTRAINT "ferias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ferias" ADD CONSTRAINT "ferias_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescisoes" ADD CONSTRAINT "rescisoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescisoes" ADD CONSTRAINT "rescisoes_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficio_categorias" ADD CONSTRAINT "beneficio_categorias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_beneficios" ADD CONSTRAINT "colaborador_beneficios_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_beneficios" ADD CONSTRAINT "colaborador_beneficios_beneficio_id_fkey" FOREIGN KEY ("beneficio_id") REFERENCES "beneficio_categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_aprovador_id_fkey" FOREIGN KEY ("aprovador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacoes" ADD CONSTRAINT "reacoes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacoes" ADD CONSTRAINT "reacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinamentos" ADD CONSTRAINT "treinamentos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinamento_colaboradores" ADD CONSTRAINT "treinamento_colaboradores_treinamento_id_fkey" FOREIGN KEY ("treinamento_id") REFERENCES "treinamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinamento_colaboradores" ADD CONSTRAINT "treinamento_colaboradores_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
