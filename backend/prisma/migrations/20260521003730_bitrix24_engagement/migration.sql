-- CreateTable
CREATE TABLE "bitrix_events" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "bitrix_user_id" TEXT,
    "colaborador_id" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "source_ip" TEXT,
    "webhook_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitrix_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_social_events" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "bitrix_event_id" TEXT,
    "event_type" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'bitrix24',
    "channel" TEXT,
    "engagement_weight" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_social_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_engagement_scores" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "score_atual" INTEGER NOT NULL DEFAULT 0,
    "score_anterior" INTEGER NOT NULL DEFAULT 0,
    "classificacao" TEXT NOT NULL DEFAULT 'baixo',
    "delta_7d" INTEGER NOT NULL DEFAULT 0,
    "delta_30d" INTEGER NOT NULL DEFAULT 0,
    "score_mensagens" INTEGER NOT NULL DEFAULT 0,
    "score_interacoes" INTEGER NOT NULL DEFAULT 0,
    "score_conhecimento" INTEGER NOT NULL DEFAULT 0,
    "score_participacao" INTEGER NOT NULL DEFAULT 0,
    "dias_sem_interacao" INTEGER NOT NULL DEFAULT 0,
    "ultimo_evento_em" TIMESTAMP(3),
    "total_eventos_30d" INTEGER NOT NULL DEFAULT 0,
    "risco_desengajamento" TEXT NOT NULL DEFAULT 'baixo',
    "risco_saida_impacto" DECIMAL(5,2),
    "dados_anonimizados" BOOLEAN NOT NULL DEFAULT false,
    "retencao_ate" TIMESTAMP(3),
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_engagement_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_behavior_metrics" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "total_mensagens" INTEGER NOT NULL DEFAULT 0,
    "total_comentarios" INTEGER NOT NULL DEFAULT 0,
    "total_curtidas" INTEGER NOT NULL DEFAULT 0,
    "total_reacoes" INTEGER NOT NULL DEFAULT 0,
    "total_respostas" INTEGER NOT NULL DEFAULT 0,
    "total_visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "total_artigos_lidos" INTEGER NOT NULL DEFAULT 0,
    "total_artigos_completos" INTEGER NOT NULL DEFAULT 0,
    "total_politicas_acessadas" INTEGER NOT NULL DEFAULT 0,
    "dias_ativos" INTEGER NOT NULL DEFAULT 0,
    "dias_sem_atividade" INTEGER NOT NULL DEFAULT 0,
    "influencia_score" INTEGER NOT NULL DEFAULT 0,
    "centralidade_rede" DECIMAL(5,4),
    "engagement_score_inicio" INTEGER NOT NULL DEFAULT 0,
    "engagement_score_fim" INTEGER NOT NULL DEFAULT 0,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_behavior_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bitrix_events_empresa_id_idx" ON "bitrix_events"("empresa_id");

-- CreateIndex
CREATE INDEX "bitrix_events_event_type_idx" ON "bitrix_events"("event_type");

-- CreateIndex
CREATE INDEX "bitrix_events_colaborador_id_idx" ON "bitrix_events"("colaborador_id");

-- CreateIndex
CREATE INDEX "bitrix_events_created_at_idx" ON "bitrix_events"("created_at");

-- CreateIndex
CREATE INDEX "bitrix_events_processed_idx" ON "bitrix_events"("processed");

-- CreateIndex
CREATE INDEX "bitrix_events_bitrix_user_id_idx" ON "bitrix_events"("bitrix_user_id");

-- CreateIndex
CREATE INDEX "employee_social_events_empresa_id_idx" ON "employee_social_events"("empresa_id");

-- CreateIndex
CREATE INDEX "employee_social_events_colaborador_id_idx" ON "employee_social_events"("colaborador_id");

-- CreateIndex
CREATE INDEX "employee_social_events_event_type_idx" ON "employee_social_events"("event_type");

-- CreateIndex
CREATE INDEX "employee_social_events_created_at_idx" ON "employee_social_events"("created_at");

-- CreateIndex
CREATE INDEX "employee_social_events_source_idx" ON "employee_social_events"("source");

-- CreateIndex
CREATE UNIQUE INDEX "employee_engagement_scores_colaborador_id_key" ON "employee_engagement_scores"("colaborador_id");

-- CreateIndex
CREATE INDEX "employee_engagement_scores_empresa_id_idx" ON "employee_engagement_scores"("empresa_id");

-- CreateIndex
CREATE INDEX "employee_engagement_scores_colaborador_id_idx" ON "employee_engagement_scores"("colaborador_id");

-- CreateIndex
CREATE INDEX "employee_engagement_scores_classificacao_idx" ON "employee_engagement_scores"("classificacao");

-- CreateIndex
CREATE INDEX "employee_engagement_scores_risco_desengajamento_idx" ON "employee_engagement_scores"("risco_desengajamento");

-- CreateIndex
CREATE INDEX "employee_engagement_scores_computed_at_idx" ON "employee_engagement_scores"("computed_at");

-- CreateIndex
CREATE INDEX "employee_behavior_metrics_empresa_id_idx" ON "employee_behavior_metrics"("empresa_id");

-- CreateIndex
CREATE INDEX "employee_behavior_metrics_colaborador_id_idx" ON "employee_behavior_metrics"("colaborador_id");

-- CreateIndex
CREATE INDEX "employee_behavior_metrics_periodo_idx" ON "employee_behavior_metrics"("periodo");

-- CreateIndex
CREATE INDEX "employee_behavior_metrics_computed_at_idx" ON "employee_behavior_metrics"("computed_at");

-- CreateIndex
CREATE UNIQUE INDEX "employee_behavior_metrics_colaborador_id_periodo_key" ON "employee_behavior_metrics"("colaborador_id", "periodo");

-- AddForeignKey
ALTER TABLE "bitrix_events" ADD CONSTRAINT "bitrix_events_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_social_events" ADD CONSTRAINT "employee_social_events_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_engagement_scores" ADD CONSTRAINT "employee_engagement_scores_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_behavior_metrics" ADD CONSTRAINT "employee_behavior_metrics_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
