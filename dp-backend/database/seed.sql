-- ============================================================
-- SEED: Dados iniciais para testes - Sistema DP
-- Execute após schema.sql
-- ============================================================

-- Usuário administrador
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador DP', 'admin@hiconecta.com.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Analista RH', 'rh@hiconecta.com.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'rh');
-- senha padrão: password

-- Departamentos
INSERT INTO departamentos (id, nome, codigo) VALUES
('11111111-0000-0000-0000-000000000001', 'Tecnologia da Informação', 'TI'),
('11111111-0000-0000-0000-000000000002', 'Recursos Humanos', 'RH'),
('11111111-0000-0000-0000-000000000003', 'Financeiro', 'FIN'),
('11111111-0000-0000-0000-000000000004', 'Comercial', 'COM'),
('11111111-0000-0000-0000-000000000005', 'Operações', 'OPS');

-- Cargos
INSERT INTO cargos (id, titulo, codigo_cbo, departamento_id, salario_minimo, salario_maximo) VALUES
('22222222-0000-0000-0000-000000000001', 'Desenvolvedor Pleno', '2124-05', '11111111-0000-0000-0000-000000000001', 5000.00, 9000.00),
('22222222-0000-0000-0000-000000000002', 'Analista de RH', '2521-05', '11111111-0000-0000-0000-000000000002', 3500.00, 6000.00),
('22222222-0000-0000-0000-000000000003', 'Analista Financeiro', '2524-05', '11111111-0000-0000-0000-000000000003', 4000.00, 7000.00),
('22222222-0000-0000-0000-000000000004', 'Gerente Comercial', '1412-10', '11111111-0000-0000-0000-000000000004', 7000.00, 15000.00),
('22222222-0000-0000-0000-000000000005', 'Assistente Administrativo', '4110-10', '11111111-0000-0000-0000-000000000005', 1800.00, 3000.00);

-- Colaboradores de teste
INSERT INTO colaboradores (
    id, nome_completo, cpf, pis_pasep, data_nascimento, genero, estado_civil,
    cargo_id, departamento_id, salario_base, data_admissao, situacao, tipo_contrato,
    email, celular, jornada, qtd_dependentes_irrf, banco, agencia, conta, tipo_conta
) VALUES
(
    '33333333-0000-0000-0000-000000000001',
    'Ana Paula Ferreira Santos', '111.222.333-44', '12345678901',
    '1990-03-15', 'F', 'Casado',
    '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
    7500.00, '2022-01-10', 'Ativo', 'CLT',
    'ana.paula@empresa.com.br', '(11) 98765-4321', '44h', 2,
    'Itaú', '1234', '56789-0', 'Corrente'
),
(
    '33333333-0000-0000-0000-000000000002',
    'Carlos Eduardo Melo', '222.333.444-55', '23456789012',
    '1985-07-22', 'M', 'Solteiro',
    '22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002',
    4200.00, '2021-06-01', 'Ativo', 'CLT',
    'carlos.melo@empresa.com.br', '(11) 97654-3210', '44h', 0,
    'Bradesco', '5678', '12345-6', 'Corrente'
),
(
    '33333333-0000-0000-0000-000000000003',
    'Mariana Costa Oliveira', '333.444.555-66', '34567890123',
    '1995-11-08', 'F', 'Solteiro',
    '22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003',
    5200.00, '2023-03-15', 'Ativo', 'CLT',
    'mariana.costa@empresa.com.br', '(11) 96543-2109', '44h', 1,
    'Nubank', '0001', '98765432-1', 'Corrente'
),
(
    '33333333-0000-0000-0000-000000000004',
    'Roberto Alves Lima', '444.555.666-77', '45678901234',
    '1978-04-30', 'M', 'Casado',
    '22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004',
    10000.00, '2020-08-01', 'Ativo', 'CLT',
    'roberto.lima@empresa.com.br', '(11) 95432-1098', '44h', 3,
    'Banco do Brasil', '9012', '34567-8', 'Corrente'
),
(
    '33333333-0000-0000-0000-000000000005',
    'Fernanda Souza Rocha', '555.666.777-88', '56789012345',
    '1993-09-12', 'F', 'Casado',
    '22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005',
    2200.00, '2024-01-08', 'Ativo', 'CLT',
    'fernanda.rocha@empresa.com.br', '(11) 94321-0987', '44h', 1,
    'Caixa', '3456', '78901-2', 'Corrente'
);

-- Benefícios catálogo
INSERT INTO beneficios_catalogo (tipo, nome, descricao, fornecedor, valor_empresa, valor_colaborador) VALUES
('Vale_Alimentacao', 'Vale Alimentação Caju', 'Cartão benefício flexível - alimentação', 'Caju', 500.00, 0.00),
('Vale_Refeicao', 'Vale Refeição Caju', 'Cartão benefício flexível - refeição', 'Caju', 700.00, 0.00),
('Vale_Transporte', 'Vale Transporte', 'Crédito para transporte público', 'Empresa', 0.00, 0.00),
('Plano_Saude', 'Plano de Saúde SulAmérica', 'Plano de saúde coletivo empresarial', 'SulAmérica', 800.00, 150.00),
('Plano_Odonto', 'Plano Odontológico', 'Cobertura odontológica básica', 'SulAmérica', 50.00, 30.00),
('Seguro_Vida', 'Seguro de Vida em Grupo', 'Cobertura morte e invalidez', 'SulAmérica', 80.00, 0.00);

-- Benefícios dos colaboradores
INSERT INTO beneficios_colaborador (colaborador_id, beneficio_id, data_inicio, valor_mensal, desconto_folha)
SELECT
    '33333333-0000-0000-0000-000000000001'::UUID,
    id, '2022-01-10', valor_empresa + valor_colaborador, valor_colaborador
FROM beneficios_catalogo WHERE ativo = TRUE;

INSERT INTO beneficios_colaborador (colaborador_id, beneficio_id, data_inicio, valor_mensal, desconto_folha)
SELECT
    '33333333-0000-0000-0000-000000000002'::UUID,
    id, '2021-06-01', valor_empresa + valor_colaborador, valor_colaborador
FROM beneficios_catalogo WHERE ativo = TRUE;

-- Período folha de teste (Abril 2025)
INSERT INTO periodos_folha (id, mes, ano, descricao, status, data_pagamento) VALUES
('44444444-0000-0000-0000-000000000001', 4, 2025, 'Abril/2025', 'Calculada', '2025-04-30');

-- Folha de pagamento de exemplo (Ana Paula - R$ 7.500)
-- INSS: 7,5% de 1412 + 9% de (2666.68-1412) + 12% de (4000.03-2666.68) + 14% de (7500-4000.03)
-- = 105,90 + 112,93 + 160,00 + 489,99 = 868,82
-- IRRF: base = 7500 - 868.82 - (2 * 189.59) = 7500 - 868.82 - 379.18 = 6252
-- 27.5% de 6252 - 1147.70 = 1719.30 - 1147.70 = 571.60
INSERT INTO folha_pagamento (
    periodo_id, colaborador_id,
    salario_base, total_proventos,
    inss, irrf, vale_transporte, plano_saude, plano_odonto,
    total_descontos, salario_liquido,
    fgts_valor, inss_empresa
) VALUES (
    '44444444-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000001',
    7500.00, 7500.00,
    868.82, 571.60, 0.00, 150.00, 30.00,
    1620.42, 5879.58,
    600.00, 1657.50
);

-- Período aquisitivo Ana Paula (vence em breve para teste de notificações)
INSERT INTO periodos_aquisitivos (colaborador_id, inicio, fim, data_limite_gozo, dias_direito, status)
VALUES (
    '33333333-0000-0000-0000-000000000001',
    '2023-01-10', '2024-01-09', '2024-07-09', 30, 'Pendente'
);

-- Notificações iniciais
INSERT INTO notificacoes (tipo, titulo, mensagem, colaborador_id, data_prazo, prioridade)
VALUES
(
    'Ferias_Vencendo',
    'Férias vencendo - Ana Paula Ferreira Santos',
    'O período de gozo das férias de Ana Paula Ferreira Santos vence em 09/07/2024. Agende com urgência.',
    '33333333-0000-0000-0000-000000000001',
    '2024-07-09',
    'Alta'
),
(
    'Experiencia_Vencendo',
    'Contrato de experiência - Fernanda Souza Rocha',
    'O contrato de experiência de Fernanda Souza Rocha (45 dias) vence em 22/02/2024. Confirme ou encerre.',
    '33333333-0000-0000-0000-000000000005',
    '2024-02-22',
    'Normal'
),
(
    'Prazo_Legal',
    'Prazo eSocial: enviar S-1200 de Abril/2025',
    'Folha de Abril/2025 calculada. Envie o evento S-1200 ao eSocial até o prazo legal (dia 15 do mês seguinte).',
    NULL,
    '2025-05-15',
    'Alta'
);
