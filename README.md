# hi Conecta RH

**Plataforma Corporativa Interna de Recursos Humanos e Departamento Pessoal**

> Sistema enterprise completo para gestão de pessoas, automatização de processos trabalhistas e inteligência organizacional — desenvolvido para uso interno corporativo.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat&logo=django&logoColor=white)

---

## Visão Geral

O **hi Conecta RH** é um sistema de RH/DP moderno, modular e seguro, construído como SPA (Single Page Application) em Vanilla JS com backend Node.js + PostgreSQL e uma versão paralela em Django enterprise.

Reúne em uma única plataforma desde o **Departamento Pessoal completo** (cálculos CLT reais) até **People Analytics** com score de risco de saída, gamificação, endomarketing e portal do colaborador.

---

## Stack Tecnológica

### Frontend (SPA)

| Tecnologia | Uso |
|---|---|
| Vanilla JS ES6+ | SPA modular, ~12.000 linhas |
| Hash Router | Navegação sem framework |
| CSS3 modular | 23 arquivos, ~4.000 linhas |
| jsPDF | Geração de PDF no browser |
| XLSX.js | Exportação Excel |
| Socket.io (client) | Notificações em tempo real |

### Backend Node.js

| Tecnologia | Uso |
|---|---|
| Node.js 20 + Express | API REST (porta 3001) |
| PostgreSQL 16 | Banco de dados principal |
| Prisma ORM | 22 modelos, migrations, seed |
| JWT + bcrypt | Autenticação e hash de senhas |
| BullMQ + Redis | Filas de e-mail e notificações |
| Socket.io | WebSocket para tempo real |
| Nodemailer (Resend) | E-mails transacionais |
| Multer + R2 | Upload e storage de documentos |
| Helmet + CORS | Headers de segurança HTTP |

### Backend Django (enterprise)

| Tecnologia | Uso |
|---|---|
| Django 4.2 | Framework Python |
| Django REST Framework | API REST versionada |
| SimpleJWT | Autenticação JWT com blacklist |
| Redis + django-redis | Cache e sessões |
| Celery | Tarefas assíncronas e cron |
| django-axes | Proteção brute-force |
| simple-history | Auditoria e versionamento |
| Argon2 | Hash de senhas premium |

---

## Arquitetura do Projeto

```
hi-conecta-rh/
│
├── projeto/                     ← Frontend SPA (Vanilla JS)
│   ├── index.html               ← Shell da aplicação
│   ├── login.html               ← Tela de login segura
│   ├── css/  (23 arquivos)      ← Estilos por módulo
│   └── js/
│       ├── app.js               ← Roteador SPA (26 rotas)
│       ├── core/                ← Api, Auth, Router, Store, EventBus, Toast
│       ├── services/            ← DP, Export, Bitrix, IA, Automação, Docs
│       ├── utils/               ← formatters, validators, dom, skeleton
│       └── modules/
│           ├── rh/              ← Dashboard, Pessoas, Analytics, Timeline
│           ├── dp/              ← Hub, Central, Folha, Férias, Rescisão...
│           ├── colaborador/     ← Portal, Jornada, Experiência
│           ├── gestor/          ← Avaliações, Ocorrências, Reuniões
│           ├── bonificacoes/    ← Engine, Forms, Relatórios
│           ├── recrutamento/    ← Vagas, Candidatos, Trilhas
│           ├── endomarketing/   ← TV corporativa, Netflix-style
│           └── admin/           ← Integrações, Usuários
│
├── backend/                     ← Backend Node.js + Express
│   ├── src/
│   │   ├── app.js               ← Express + middlewares + segurança
│   │   ├── server.js            ← HTTP + Socket.io + Jobs
│   │   ├── config/              ← env, database, redis, logger
│   │   ├── middleware/          ← auth, rbac, tenant, audit, upload...
│   │   ├── modules/             ← auth, colaboradores, dp, folha, ferias...
│   │   ├── services/            ← email, storage, eSocial
│   │   ├── sockets/             ← Socket.io (notif, feed, aniversários)
│   │   ├── queues/              ← BullMQ email queue + workers
│   │   ├── jobs/                ← Cron jobs diários
│   │   └── utils/               ← response, clt (cálculos CLT), pagination
│   ├── prisma/
│   │   ├── schema.prisma        ← 22 modelos, relações, índices
│   │   └── seed.js              ← Dados iniciais + 6 usuários de demo
│   ├── docker-compose.yml       ← PostgreSQL + Redis + API
│   └── .env.example
│
├── hi_conecta/                  ← Backend Django enterprise (versão principal)
│   ├── accounts/                ← Usuário customizado + JWT + Argon2 + RBAC
│   ├── rh/                      ← Colaborador (50+ campos), Cargo, Depto, Avaliações
│   ├── dp/                      ← Folha CLT 2024, Férias, Rescisão 7 tipos, Wizard
│   ├── analytics/               ← People Analytics: Score, Turnover, Burnout, Alertas
│   ├── inteligencia/            ← IA: DNA Corporativo, Modo Fantasma, IA Executiva
│   ├── recrutamento/            ← ATS: Vagas + IA, Pipeline Kanban, Candidatos
│   ├── treinamento/             ← T&D: Catálogo, Trilhas, PDI por IA, Certificados
│   ├── comunicacao/             ← Mural, Comunicados, Reconhecimentos
│   ├── ouvidoria/               ← Canal anônimo, Investigação, Logs restritos
│   ├── gamificacao/             ← Pontos, Medalhas, Níveis, Ranking
│   ├── gestor/                  ← Hub do Gestor: Equipe, Metas, Feedbacks
│   ├── colaborador/             ← Portal: Holerites, Férias, Benefícios
│   ├── integracoes/             ← Adapters: Bitrix24, eSocial, Caju, Wellhub
│   ├── templates/               ← 50+ templates Django dark mode
│   ├── fixtures/seed_demo.py    ← Seed com dados realistas
│   ├── setup.py                 ← Script de instalação automática
│   └── .env.example             ← 35 variáveis documentadas
│
└── django_app/                  ← Backend Django (versão legada — substituída por hi_conecta/)
    └── apps/ (16 apps legados)
```

---

## Módulos do Sistema (26 rotas)

### Departamento Pessoal

| Módulo | Rota | Descrição |
|---|---|---|
| DP Hub | `#departamento` | Central de navegação com 10 submódulos |
| Central Trabalhista | `#dpc` | Cálculo rápido: férias, rescisão, 13º, folha, simulação |
| Dashboard Operacional | `#dpdashboard` | KPIs críticos, SLA, alertas, timeline atividades |
| Folha de Pagamento | — | Abertura, cálculo CLT, aprovação, holerites, exportação |
| Férias | — | Solicitação, aprovação, simulador com valores reais |
| 13º Salário | — | Simulador individual e coletivo (2 parcelas) |
| Rescisão | — | **Wizard 7 etapas**, 5 tipos CLT, TRCT automático |
| Benefícios | — | Catálogo, atribuição, relatório de custo |
| Admissão | — | Wizard 7 etapas, 14 automações, eSocial S-2200 |

### RH e Gestão de Pessoas

| Módulo | Rota | Descrição |
|---|---|---|
| Dashboard | `#dashboard` | KPIs executivos, aprovações, agenda, acesso rápido |
| Gestão de Pessoas | `#pessoas` | CRUD, 7 abas, organograma, políticas, logs |
| Indicadores | `#indicadores` | Turnover, headcount, metas, treinamentos, clima |
| Recrutamento | `#recrutamento` | Vagas, pipeline 5 etapas, 3 trilhas de carreira |
| Cargos & Estrutura | `#cargos` | Faixas salariais, CBO, plano de carreira |
| T&D | `#desenvolvimento` | Treinamentos EAD/presencial, materiais, provas |
| Clima & Engajamento | `#clima` | Feed, comunicados, métricas |
| NR-01 Segurança | `#nr01` | PGR, CIPA, riscos, treinamentos SST |
| Ouvidoria | `#ouvidoria` | Manifestações anônimas, SLA, histórico |
| Serviços RH | `#servicos` | Catálogo, solicitações, SLA, auditoria |
| Comunicação | `#comunicacao` | Feed corporativo, avisos, canais |
| Gestor de Equipes | `#gestor` | 6 submódulos: avaliações, ocorrências, reuniões... |

### Portal do Colaborador (13 seções)

| Seção | Descrição |
|---|---|
| Meu Painel | KPIs pessoais, gamificação (Bronze/Prata/Ouro), alertas |
| **Minha Jornada** | Onboarding 8 etapas — página separada fullscreen |
| Ponto Eletrônico | Relógio em tempo real, espelho mensal, PDF |
| Holerite | CLT 2024 completo, histórico 5 meses, download PDF |
| Férias | Saldo, simulador CLT real, solicitação |
| Benefícios | 6 benefícios com saldo e regras de falta |
| Documentos | Upload, download, assinatura digital |
| Comunicação | Comunicados + TV Corporativa |
| Avaliações | 15d/45d + autoavaliação semestral com notas |
| Ideias (PIT) | Envio, votação, ranking, bônus R$500 |
| Pesquisas | Pesquisas anônimas com gráficos |
| Notificações | 5 tipos com ações diretas |
| **Assistente IA** | Chat CLT: férias, INSS, FGTS, banco de horas, rescisão |
| Meu Perfil | Dados pessoais, bancários, dependentes |

### Inteligência & Analytics

| Módulo | Rota | Descrição |
|---|---|---|
| People Analytics | `#analytics` | Turnover, Engajamento, Risco de Saída, Custos |
| Employee Timeline | `#timeline` | 16 tipos de evento, filtros por grupo, exportação CSV |
| Automation Engine | `#automacao` | 10 gatilhos, 9 ações, 5 automações padrão |

### Extras

| Módulo | Rota | Descrição |
|---|---|---|
| Bonificações | `#bonificacoes` | Engine, form builder, relatórios PDF/Excel/Word |
| Endomarketing.tv | `#endomarketing` | TV corporativa, slides, streaming Netflix-style |
| Experiência | `#experiencia` | Indique & Ganhe, hi Move, Academy, Ideias, Formulários |
| Integrações | `#integracoes` | 8 sistemas mapeados com adapters |
| Usuários | `#usuarios` | CRUD, matrix de permissões visual, 6 perfis |
| Portal | `#portal` | Portal do colaborador com sidebar interna |

---

## Cálculos Trabalhistas — CLT 2024

Implementados em `utils/clt.js` (frontend) e `backend/src/utils/clt.js` (Node.js) e `apps/dp/services.py` (Django):

| Cálculo | Base Legal | Detalhe |
|---|---|---|
| **INSS Progressivo** | Portaria MPS nº 1/2024 | 4 faixas: 7,5% → 9% → 12% → 14%, teto R$908,85 |
| **IRRF Progressivo** | Tabela IRRF 2024 | 5 faixas, dedução dependente R$189,59 |
| **FGTS** | Art. 15 Lei 8.036/90 | 8% sobre salário bruto |
| **Férias + ⅓** | Art. 7º CF + Art. 129 CLT | Proporcional + 1/3 + abono pecuniário (até 10 dias) |
| **13º Salário** | Lei 4.090/62 | Proporcional, 2 parcelas, INSS+IRRF na 2ª |
| **Rescisão** | Art. 477–487 CLT | 5 tipos: Sem Justa Causa, Pedido, Justa Causa, Acordo, Término |
| **Aviso Prévio** | Lei 12.506/2011 | 30 dias + 3 dias/ano trabalhado (máx. 90) |
| **Multa FGTS** | Art. 18 Lei 8.036/90 | 40% (sem justa causa) / 20% (acordo mútuo) |

---

## Segurança

| Camada | Implementação |
|---|---|
| **Autenticação** | JWT Access (15min) + Refresh Token (7d) com rotação e blacklist |
| **Senhas** | bcrypt rounds=12 (Node.js) / Argon2 (Django) |
| **Rate Limit** | 5 tentativas login / 15min por email (client-side + server-side) |
| **RBAC** | 6 perfis com matrix de permissões por módulo e ação |
| **Prevenção XSS** | `textContent` em dados externos, nunca `innerHTML` com input |
| **CSRF** | Tokens Django nativos, `X-CSRFToken` em AJAX |
| **Auditoria** | Log automático de ações sensíveis (CREATE/UPDATE/DELETE/LOGIN) |
| **Brute-force** | django-axes / contador sessionStorage com lockout |
| **Headers HTTP** | Helmet.js (Node) / SecurityMiddleware (Django) |
| **Sessão** | Validação de perfil e integridade no sessionStorage |
| **Senha na sessão** | Nunca armazenada na sessão do browser |

---

## Perfis de Acesso (RBAC)

| Perfil | Acesso | Hierarquia |
|---|---|---|
| `admin` | Total — todos os módulos + gestão de usuários | Nível 6 |
| `rh` | Quase total — sem config de sistema | Nível 5 |
| `analista` | Operacional de RH — admissões, recrutamento, documentos | Nível 4 |
| `gestor` | Escopo do seu setor — equipe, avaliações, reuniões | Nível 4 |
| `colab` | Dados próprios — portal, holerite, férias, benefícios | Nível 1 |
| `juridico` | Ouvidoria, documentos, DP (leitura) | Nível 2 |

---

## Credenciais de Demonstração

| E-mail | Senha | Perfil |
|---|---|---|
| `admin.sistema@empresa.com.br` | `Admin@2025` | Administrador |
| `admin@empresa.com.br` | `admin123` | Gestor de RH |
| `analista@empresa.com.br` | `analista123` | Analista de RH |
| `gestor@empresa.com.br` | `gestor123` | Gestor de Equipe |
| `colab@empresa.com.br` | `colab123` | Colaborador |
| `juridico@empresa.com.br` | `juridico123` | Jurídico |

> ⚠️ Credenciais apenas para ambiente de desenvolvimento/demo. Em produção, configure o backend Node.js com autenticação JWT real.

---

## Instalação

### Frontend — modo demo (sem backend)

```bash
# VS Code + extensão Live Server → clic em "Go Live"
# ou:
cd projeto
python -m http.server 5500
# Acesse: http://localhost:5500
```

### Backend Node.js

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Subir banco e Redis
npm run docker:up

# 4. Banco de dados
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Iniciar (porta 3001)
npm run dev
```

### Backend Django (hi_conecta — versão enterprise)

```bash
cd hi_conecta

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate           # Windows
source .venv/bin/activate        # Linux/Mac

# Setup automático (instala deps + roda migrations + seed)
cp .env.example .env             # Editar DATABASE_URL, SECRET_KEY, API Keys de IA
python setup.py                  # Setup completo em um comando

# Ou manualmente:
pip install -r requirements/base.txt
python manage.py migrate
python manage.py shell -c "exec(open('fixtures/seed_demo.py').read()); run()"
python manage.py runserver       # http://localhost:8000
```

**Credenciais Django (após seed):**

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@empresa.com.br` | `Admin@2026` | Administrador |
| `rh@empresa.com.br` | `RH@2026` | Gestor de RH |
| `analista@empresa.com.br` | `Analista@2026` | Analista de RH |
| `gestor@empresa.com.br` | `Gestor@2026` | Gestor de Equipe |
| `colab@empresa.com.br` | `Colab@2026` | Colaborador |
| `juridico@empresa.com.br` | `Juridico@2026` | Jurídico |

---

## API REST (Node.js — `localhost:3001/api/v1`)

```
# Autenticação
POST /auth/login          → { access_token, refresh_token, usuario }
POST /auth/refresh        → { access_token, refresh_token }
POST /auth/logout
GET  /auth/me

# Colaboradores
GET    /colaboradores             → Listar (paginado, filtrável, buscável)
GET    /colaboradores/kpis        → Headcount, turnover, admissões
GET    /colaboradores/:id         → Perfil completo
POST   /colaboradores             → Admitir (cria usuário e inicia onboarding)
PUT    /colaboradores/:id         → Atualizar dados
PATCH  /colaboradores/:id/desligar
DELETE /colaboradores/:id         → Soft delete

# DP — Cálculos
POST /dp/calcular                 → férias | rescisão | decimo | folha | adiantamento
POST /dp/calcular-lote            → Cálculo em massa (lista de IDs)
GET  /dp/dashboard-ops            → KPIs operacionais

# Folha
POST /folha/abrir
POST /folha/:id/calcular          → CLT completo para todos os colaboradores
POST /folha/:id/aprovar
POST /folha/:id/pagar
GET  /folha/holerite/:mes/:id

# Férias e Rescisão
POST /ferias                      → Solicitar
POST /ferias/simulacao            → Simular sem persistir
GET  /ferias/simulacao?salario=X
POST /rescisao/simular
POST /rescisao

# Analytics
GET /analytics/riscos             → Score de risco de saída todos os colabs

# Portal Colaborador
GET /colaborador/holerite
GET /colaborador/ferias
GET /colaborador/beneficios
```

---

## People Analytics — Score de Risco de Saída

Calcula um score preditivo (0–100) com **6 fatores ponderados**:

| Fator | Peso | Critério |
|---|---|---|
| Tempo de empresa | 15% | Alto risco: <6m ou >3 anos sem progressão |
| Salário vs. mercado | 20% | >15% abaixo da mediana = risco alto |
| Faltas recentes (90d) | 25% | Cada falta adiciona 5 pontos |
| Score de clima | 20% | Baseado nas pesquisas respondidas |
| Ocorrências disciplinares | 10% | Advertências nos últimos 180 dias |
| Avaliações de desempenho | 10% | Tendência de notas declinando |

**Nível por score:** 🔴 Crítico (≥70) · 🟡 Alto (45–69) · 🔵 Médio (25–44) · 🟢 Baixo (<25)

---

## Automation Engine

Motor de automações sem código:

**10 Gatilhos:** admissão · desligamento · férias vencendo · aniversário · avaliação · documento vencendo · treinamento pendente · folha aprovada · workflow aprovado · risco de saída >70%

**9 Ações:** notificação in-app · e-mail · WhatsApp · criar tarefa · iniciar workflow · task onboarding · publicar no feed · webhook externo · tarefa Bitrix24

---

## Integrações

| Sistema | Tipo | Adaptador |
|---|---|---|
| **Caju** | VA + mobilidade | `BitrixAdapter.js` + template |
| **Bitrix24** | CRM + tarefas | Webhook configurável |
| **RHid** | Ponto eletrônico | Service desacoplado |
| **RHsolutio** | Folha / contracheque | Service desacoplado |
| **Wellhub** | Fitness | Service desacoplado |
| **SulAmérica** | Saúde + odonto | Service desacoplado |
| **Conexão Saúde** | Telemedicina | Service desacoplado |
| **Nubus** | Vale transporte | Service desacoplado |
| **eSocial** | S-2200, S-1200, S-2299 | `esocialService.js` + leiaute S-1.2 |

---

## Métricas do Sistema

| Item | Quantidade |
|---|---|
| Arquivos JS frontend | 57 |
| Arquivos CSS | 23 |
| Linhas de JS | ~12.000 |
| Linhas de CSS | ~4.000 |
| Módulos / rotas SPA | 26 |
| Seções internas totais | 100+ |
| Perfis de acesso | 6 |
| Cálculos CLT implementados | 8 |
| Eventos eSocial | 3 (S-2200, S-1200, S-2299) |
| Formatos de exportação | PDF, Excel, Word, CSV |
| Integrações mapeadas | 9 sistemas |
| Automações padrão | 5 (configuráveis via UI) |
| Models Prisma (Node.js) | 22 |
| Apps Django | 16 |

---

## Uso Exclusivo Interno

Este sistema é de **uso interno corporativo exclusivo**:

- ❌ Não é um produto SaaS
- ❌ Não possui cobrança ou assinatura
- ❌ Não é multiempresa
- ✅ Desenvolvido para uma única empresa
- ✅ Pode ser customizado livremente

---

**Versão:** 2.0.0 · **Stack:** Vanilla JS + Node.js + PostgreSQL | Django 4.2 + Redis + IA · **Atualizado:** Maio/2026
