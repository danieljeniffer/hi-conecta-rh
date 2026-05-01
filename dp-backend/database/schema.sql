-- ============================================================
-- SCHEMA: Sistema Departamento Pessoal - hi Conecta RH
-- Banco: PostgreSQL
-- Versão: 1.0.0 | 2024
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
CREATE TYPE genero_enum AS ENUM ('M', 'F', 'Outro');
CREATE TYPE estado_civil_enum AS ENUM ('Solteiro', 'Casado', 'Divorciado', 'Viuvo', 'Uniao_Estavel');
CREATE TYPE tipo_contrato_enum AS ENUM ('CLT', 'Experiencia', 'Temporario', 'Estagio', 'Aprendiz');
CREATE TYPE situacao_colaborador_enum AS ENUM ('Ativo', 'Afastado', 'Ferias', 'Demitido');
CREATE TYPE jornada_enum AS ENUM ('44h', '40h', '36h', '30h', '20h', 'Escala_12x36', 'Escala_6x1');
CREATE TYPE tipo_rescisao_enum AS ENUM ('Pedido_Demissao', 'Sem_Justa_Causa', 'Justa_Causa', 'Acordo_Mutuo', 'Termino_Contrato');
CREATE TYPE status_ferias_enum AS ENUM ('Pendente', 'Agendada', 'Gozando', 'Concluida', 'Vencida');
CREATE TYPE status_folha_enum AS ENUM ('Aberta', 'Calculada', 'Fechada', 'Paga');
CREATE TYPE tipo_beneficio_enum AS ENUM ('Vale_Alimentacao', 'Vale_Refeicao', 'Vale_Transporte', 'Plano_Saude', 'Plano_Odonto', 'Seguro_Vida', 'Auxilio_Creche', 'Outro');
CREATE TYPE grau_insalubridade_enum AS ENUM ('Minimo', 'Medio', 'Maximo');
CREATE TYPE status_notificacao_enum AS ENUM ('Pendente', 'Lida', 'Arquivada');
CREATE TYPE tipo_notificacao_enum AS ENUM ('Ferias_Vencendo', 'Experiencia_Vencendo', 'Prazo_Legal', 'Falta_Colaborador', 'Admissao_Pendente', 'Rescisao_Pendente', 'Decimo_Terceiro', 'Alerta_Geral');

-- ------------------------------------------------------------
-- TABELA: usuarios (para autenticação)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'rh',
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: departamentos
-- ------------------------------------------------------------
CREATE TABLE departamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    responsavel_id UUID,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: cargos
-- ------------------------------------------------------------
CREATE TABLE cargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(150) NOT NULL,
    codigo_cbo VARCHAR(10),
    departamento_id UUID REFERENCES departamentos(id),
    salario_minimo NUMERIC(12,2),
    salario_maximo NUMERIC(12,2),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: colaboradores (cadastro principal)
-- ------------------------------------------------------------
CREATE TABLE colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Dados pessoais
    nome_completo VARCHAR(200) NOT NULL,
    nome_social VARCHAR(200),
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    rg_orgao_expedidor VARCHAR(20),
    rg_data_expedicao DATE,
    data_nascimento DATE NOT NULL,
    genero genero_enum,
    estado_civil estado_civil_enum,
    nacionalidade VARCHAR(80) DEFAULT 'Brasileiro(a)',
    naturalidade VARCHAR(100),

    -- Documentos trabalhistas
    pis_pasep VARCHAR(14) UNIQUE,
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(10),
    ctps_uf VARCHAR(2),
    titulo_eleitor VARCHAR(20),
    cnh VARCHAR(20),
    cnh_categoria VARCHAR(5),

    -- Contato
    email VARCHAR(150),
    email_corporativo VARCHAR(150),
    telefone VARCHAR(20),
    celular VARCHAR(20),

    -- Endereço
    cep VARCHAR(10),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),

    -- Dados bancários
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20) DEFAULT 'Corrente',
    pix_chave VARCHAR(150),

    -- Vínculo empregatício
    cargo_id UUID REFERENCES cargos(id),
    departamento_id UUID REFERENCES departamentos(id),
    tipo_contrato tipo_contrato_enum DEFAULT 'CLT',
    jornada jornada_enum DEFAULT '44h',
    salario_base NUMERIC(12,2) NOT NULL,
    data_admissao DATE NOT NULL,
    data_fim_contrato DATE,
    situacao situacao_colaborador_enum DEFAULT 'Ativo',

    -- Dependentes (contador, detalhes em tabela separada)
    qtd_dependentes_irrf INTEGER DEFAULT 0,

    -- Adicionais
    tem_insalubridade BOOLEAN DEFAULT FALSE,
    grau_insalubridade grau_insalubridade_enum,
    tem_periculosidade BOOLEAN DEFAULT FALSE,
    adicional_noturno BOOLEAN DEFAULT FALSE,

    -- eSocial
    esocial_enviado BOOLEAN DEFAULT FALSE,
    esocial_recibo VARCHAR(100),

    -- Controle
    foto_url VARCHAR(500),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: dependentes_colaborador
-- ------------------------------------------------------------
CREATE TABLE dependentes_colaborador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    cpf VARCHAR(14),
    data_nascimento DATE NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    dependente_irrf BOOLEAN DEFAULT FALSE,
    dependente_plano_saude BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: documentos_colaborador
-- ------------------------------------------------------------
CREATE TABLE documentos_colaborador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tamanho_bytes INTEGER,
    enviado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: admissoes (registro de admissão)
-- ------------------------------------------------------------
CREATE TABLE admissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    data_admissao DATE NOT NULL,
    data_experiencia_15 DATE,
    data_experiencia_45 DATE,
    data_experiencia_60 DATE,
    tipo_contrato tipo_contrato_enum DEFAULT 'CLT',
    salario_inicial NUMERIC(12,2) NOT NULL,
    cargo_id UUID REFERENCES cargos(id),
    departamento_id UUID REFERENCES departamentos(id),
    modalidade_trabalho VARCHAR(30) DEFAULT 'Presencial',
    contrato_gerado BOOLEAN DEFAULT FALSE,
    contrato_url VARCHAR(500),
    esocial_s2200_enviado BOOLEAN DEFAULT FALSE,
    esocial_s2200_recibo VARCHAR(100),
    responsavel_id UUID REFERENCES usuarios(id),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: periodos_folha (competências mensais)
-- ------------------------------------------------------------
CREATE TABLE periodos_folha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INTEGER NOT NULL CHECK (ano >= 2020),
    descricao VARCHAR(50),
    status status_folha_enum DEFAULT 'Aberta',
    data_fechamento DATE,
    data_pagamento DATE,
    total_proventos NUMERIC(14,2),
    total_descontos NUMERIC(14,2),
    total_liquido NUMERIC(14,2),
    total_inss_empresa NUMERIC(12,2),
    total_fgts NUMERIC(12,2),
    responsavel_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT NOW(),
    UNIQUE(mes, ano)
);

-- ------------------------------------------------------------
-- TABELA: folha_pagamento (holerite individual)
-- ------------------------------------------------------------
CREATE TABLE folha_pagamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    periodo_id UUID REFERENCES periodos_folha(id),
    colaborador_id UUID REFERENCES colaboradores(id),

    -- Proventos
    salario_base NUMERIC(12,2) NOT NULL,
    horas_extras_50 NUMERIC(5,1) DEFAULT 0,
    valor_he_50 NUMERIC(12,2) DEFAULT 0,
    horas_extras_100 NUMERIC(5,1) DEFAULT 0,
    valor_he_100 NUMERIC(12,2) DEFAULT 0,
    adicional_noturno NUMERIC(12,2) DEFAULT 0,
    insalubridade NUMERIC(12,2) DEFAULT 0,
    periculosidade NUMERIC(12,2) DEFAULT 0,
    bonus NUMERIC(12,2) DEFAULT 0,
    comissao NUMERIC(12,2) DEFAULT 0,
    adiantamento_13 NUMERIC(12,2) DEFAULT 0,
    outros_proventos NUMERIC(12,2) DEFAULT 0,
    total_proventos NUMERIC(12,2) DEFAULT 0,

    -- Descontos
    inss NUMERIC(12,2) DEFAULT 0,
    irrf NUMERIC(12,2) DEFAULT 0,
    faltas_dias NUMERIC(5,1) DEFAULT 0,
    valor_faltas NUMERIC(12,2) DEFAULT 0,
    atrasos_minutos INTEGER DEFAULT 0,
    valor_atrasos NUMERIC(12,2) DEFAULT 0,
    vale_transporte NUMERIC(12,2) DEFAULT 0,
    vale_refeicao NUMERIC(12,2) DEFAULT 0,
    plano_saude NUMERIC(12,2) DEFAULT 0,
    plano_odonto NUMERIC(12,2) DEFAULT 0,
    outros_descontos NUMERIC(12,2) DEFAULT 0,
    total_descontos NUMERIC(12,2) DEFAULT 0,

    -- Líquido
    salario_liquido NUMERIC(12,2) DEFAULT 0,

    -- Encargos empresa
    fgts_valor NUMERIC(12,2) DEFAULT 0,
    inss_empresa NUMERIC(12,2) DEFAULT 0,

    -- Controle
    holerite_gerado BOOLEAN DEFAULT FALSE,
    holerite_url VARCHAR(500),
    esocial_s1200_enviado BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),

    UNIQUE(periodo_id, colaborador_id)
);

-- ------------------------------------------------------------
-- TABELA: periodos_aquisitivos (férias)
-- ------------------------------------------------------------
CREATE TABLE periodos_aquisitivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    inicio DATE NOT NULL,
    fim DATE NOT NULL,
    data_limite_gozo DATE NOT NULL,
    dias_direito INTEGER DEFAULT 30,
    dias_gozados INTEGER DEFAULT 0,
    dias_vendidos INTEGER DEFAULT 0,
    dias_saldo INTEGER GENERATED ALWAYS AS (dias_direito - dias_gozados - dias_vendidos) STORED,
    status status_ferias_enum DEFAULT 'Pendente',
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: ferias (solicitações e pagamentos)
-- ------------------------------------------------------------
CREATE TABLE ferias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    periodo_aquisitivo_id UUID REFERENCES periodos_aquisitivos(id),
    colaborador_id UUID REFERENCES colaboradores(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias_ferias INTEGER NOT NULL,
    dias_vendidos INTEGER DEFAULT 0,
    salario_referencia NUMERIC(12,2) NOT NULL,
    valor_ferias NUMERIC(12,2),
    valor_um_terco NUMERIC(12,2),
    valor_dias_vendidos NUMERIC(12,2) DEFAULT 0,
    valor_total NUMERIC(12,2),
    data_pagamento DATE,
    status status_ferias_enum DEFAULT 'Pendente',
    recibo_gerado BOOLEAN DEFAULT FALSE,
    recibo_url VARCHAR(500),
    aprovado_por UUID REFERENCES usuarios(id),
    esocial_s2230_enviado BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: decimo_terceiro
-- ------------------------------------------------------------
CREATE TABLE decimo_terceiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id),
    ano INTEGER NOT NULL,
    meses_trabalhados INTEGER NOT NULL,
    salario_referencia NUMERIC(12,2) NOT NULL,
    valor_bruto_integral NUMERIC(12,2),
    valor_bruto_proporcional NUMERIC(12,2),

    -- 1ª parcela (até 30/nov ou antecipada)
    parcela1_valor NUMERIC(12,2),
    parcela1_data DATE,
    parcela1_paga BOOLEAN DEFAULT FALSE,

    -- 2ª parcela (até 20/dez, com INSS e IRRF)
    parcela2_valor NUMERIC(12,2),
    parcela2_inss NUMERIC(12,2),
    parcela2_irrf NUMERIC(12,2),
    parcela2_data DATE,
    parcela2_paga BOOLEAN DEFAULT FALSE,

    valor_liquido NUMERIC(12,2),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),

    UNIQUE(colaborador_id, ano)
);

-- ------------------------------------------------------------
-- TABELA: rescisoes
-- ------------------------------------------------------------
CREATE TABLE rescisoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id),
    tipo tipo_rescisao_enum NOT NULL,
    data_comunicacao DATE NOT NULL,
    data_aviso_previo DATE,
    data_desligamento DATE NOT NULL,
    ultimo_dia_trabalhado DATE,

    -- Cálculos
    saldo_salario NUMERIC(12,2) DEFAULT 0,
    aviso_previo_indenizado NUMERIC(12,2) DEFAULT 0,
    aviso_previo_trabalhado NUMERIC(12,2) DEFAULT 0,
    ferias_proporcionais NUMERIC(12,2) DEFAULT 0,
    ferias_vencidas NUMERIC(12,2) DEFAULT 0,
    um_terco_ferias NUMERIC(12,2) DEFAULT 0,
    decimo_terceiro_proporcional NUMERIC(12,2) DEFAULT 0,
    fgts_saldo NUMERIC(12,2) DEFAULT 0,
    fgts_multa_40 NUMERIC(12,2) DEFAULT 0,
    outros_creditos NUMERIC(12,2) DEFAULT 0,

    -- Descontos rescisão
    inss_rescisao NUMERIC(12,2) DEFAULT 0,
    irrf_rescisao NUMERIC(12,2) DEFAULT 0,
    outros_descontos NUMERIC(12,2) DEFAULT 0,

    total_bruto NUMERIC(12,2) DEFAULT 0,
    total_liquido NUMERIC(12,2) DEFAULT 0,

    -- Controle
    termo_gerado BOOLEAN DEFAULT FALSE,
    termo_url VARCHAR(500),
    homologado BOOLEAN DEFAULT FALSE,
    data_homologacao DATE,
    esocial_s2299_enviado BOOLEAN DEFAULT FALSE,
    esocial_s2299_recibo VARCHAR(100),
    responsavel_id UUID REFERENCES usuarios(id),
    motivo_justa_causa TEXT,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: beneficios_catalogo (catálogo de benefícios da empresa)
-- ------------------------------------------------------------
CREATE TABLE beneficios_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_beneficio_enum NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    fornecedor VARCHAR(150),
    valor_empresa NUMERIC(10,2) DEFAULT 0,
    valor_colaborador NUMERIC(10,2) DEFAULT 0,
    percentual_desconto NUMERIC(5,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: beneficios_colaborador
-- ------------------------------------------------------------
CREATE TABLE beneficios_colaborador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    beneficio_id UUID REFERENCES beneficios_catalogo(id),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor_mensal NUMERIC(10,2),
    desconto_folha NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: notificacoes
-- ------------------------------------------------------------
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_notificacao_enum NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    colaborador_id UUID REFERENCES colaboradores(id),
    referencia_id UUID,
    referencia_tabela VARCHAR(50),
    data_prazo DATE,
    prioridade VARCHAR(10) DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Critica')),
    status status_notificacao_enum DEFAULT 'Pendente',
    destinatario_id UUID REFERENCES usuarios(id),
    lida_em TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: historico_salarial
-- ------------------------------------------------------------
CREATE TABLE historico_salarial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    salario_anterior NUMERIC(12,2),
    salario_novo NUMERIC(12,2) NOT NULL,
    data_vigencia DATE NOT NULL,
    motivo VARCHAR(200),
    aprovado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABELA: esocial_eventos (log de envios ao eSocial)
-- ------------------------------------------------------------
CREATE TABLE esocial_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_evento VARCHAR(20) NOT NULL,
    colaborador_id UUID REFERENCES colaboradores(id),
    referencia_id UUID,
    referencia_tabela VARCHAR(50),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'Pendente',
    recibo VARCHAR(100),
    resposta JSONB,
    tentativas INTEGER DEFAULT 0,
    ultimo_envio TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ÍNDICES para performance
-- ------------------------------------------------------------
CREATE INDEX idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX idx_colaboradores_situacao ON colaboradores(situacao);
CREATE INDEX idx_colaboradores_departamento ON colaboradores(departamento_id);
CREATE INDEX idx_folha_periodo ON folha_pagamento(periodo_id);
CREATE INDEX idx_folha_colaborador ON folha_pagamento(colaborador_id);
CREATE INDEX idx_ferias_colaborador ON ferias(colaborador_id);
CREATE INDEX idx_notificacoes_status ON notificacoes(status);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX idx_esocial_status ON esocial_eventos(status);
CREATE INDEX idx_periodos_aquisitivos_colaborador ON periodos_aquisitivos(colaborador_id);

-- ------------------------------------------------------------
-- TRIGGER: atualizar campo atualizado_em
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_colaboradores_atualizado
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_folha_atualizado
    BEFORE UPDATE ON folha_pagamento
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_decimo_atualizado
    BEFORE UPDATE ON decimo_terceiro
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- ------------------------------------------------------------
-- VIEW: resumo_colaboradores (usada no dashboard)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_resumo_colaboradores AS
SELECT
    c.id,
    c.nome_completo,
    c.cpf,
    c.salario_base,
    c.data_admissao,
    c.situacao,
    c.tipo_contrato,
    ca.titulo AS cargo,
    d.nome AS departamento,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.data_admissao)) AS anos_empresa,
    EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.data_admissao)) AS meses_empresa
FROM colaboradores c
LEFT JOIN cargos ca ON ca.id = c.cargo_id
LEFT JOIN departamentos d ON d.id = c.departamento_id
WHERE c.situacao != 'Demitido';

-- ------------------------------------------------------------
-- VIEW: custo_total_empresa (dashboard gerencial)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_custo_total_empresa AS
SELECT
    p.mes,
    p.ano,
    COUNT(DISTINCT f.colaborador_id) AS total_colaboradores,
    SUM(f.total_proventos) AS total_proventos,
    SUM(f.total_descontos) AS total_descontos,
    SUM(f.salario_liquido) AS total_liquido,
    SUM(f.fgts_valor) AS total_fgts,
    SUM(f.inss_empresa) AS total_inss_empresa,
    SUM(f.total_proventos + f.fgts_valor + f.inss_empresa) AS custo_total_empresa
FROM periodos_folha p
JOIN folha_pagamento f ON f.periodo_id = p.id
GROUP BY p.mes, p.ano
ORDER BY p.ano DESC, p.mes DESC;
