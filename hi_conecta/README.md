# hi Conecta RH — Sistema Corporativo de Gestão de Pessoas

Sistema interno de RH/DP corporativo construído com **Django 4.2 + PostgreSQL + Redis**.

> **Exclusivamente interno.** Não é SaaS, não tem billing, não é multiempresa.

---

## Stack

| Componente       | Tecnologia                     |
|-----------------|-------------------------------|
| Backend         | Django 4.2                     |
| Banco de dados  | PostgreSQL 15+                 |
| Cache/Sessão    | Redis 7+                       |
| Auth            | JWT (SimpleJWT) + Session      |
| API             | Django REST Framework          |
| PDF             | ReportLab                      |
| IA              | Anthropic Claude / OpenAI GPT  |
| Deploy          | Gunicorn + WhiteNoise          |
| Segurança       | Argon2, Axes (brute-force), RBAC |

---

## Instalação

### 1. Pré-requisitos

```bash
Python 3.11+
PostgreSQL 15+
Redis 7+
```

### 2. Clonar e configurar

```bash
git clone <repo>
cd hi-conecta-rh/hi_conecta

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Copiar e editar .env
cp .env.example .env
# Edite .env com suas credenciais
```

### 3. Configurar banco de dados

```sql
-- No PostgreSQL:
CREATE DATABASE hiconecta_rh;
CREATE USER hiconecta WITH PASSWORD 'sua_senha';
GRANT ALL ON DATABASE hiconecta_rh TO hiconecta;
```

### 4. Setup automático

```bash
python setup.py
```

Ou manualmente:

```bash
pip install -r requirements/base.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Dados de demonstração:
python manage.py shell -c "exec(open('fixtures/seed_demo.py').read()); run()"
```

### 5. Iniciar

```bash
python manage.py runserver
```

Acesse: **http://localhost:8000**

---

## Credenciais de Demo

| Perfil     | E-mail                     | Senha          |
|-----------|---------------------------|----------------|
| Admin      | admin@empresa.com.br       | Admin@2026     |
| RH         | rh@empresa.com.br          | RH@2026        |
| Analista   | analista@empresa.com.br    | Analista@2026  |
| Gestor     | gestor@empresa.com.br      | Gestor@2026    |
| Colaborador| colab@empresa.com.br       | Colab@2026     |
| Jurídico   | juridico@empresa.com.br    | Juridico@2026  |

---

## Módulos Implementados

### Fase 1 — Base
- Autenticação customizada (email+senha, JWT, Argon2)
- RBAC com 6 perfis hierárquicos
- BaseModel com soft delete e auditoria

### Fase 2 — RH
- **Colaboradores**: cadastro completo (50+ campos), documentos, histórico
- **Organograma**: árvore hierárquica de departamentos
- **Cargos**: plano de cargos e salários
- **Avaliações de desempenho** com scoring
- **Advertências** com histórico

### Fase 3 — Departamento Pessoal (DP)
- **Folha de pagamento** — CLT 2024/2025 completo:
  - INSS progressivo (4 faixas, teto R$908,85)
  - IRRF progressivo (5 faixas, dedução R$189,59/dependente)
  - FGTS 8%
  - Férias + ⅓ constitucional
  - 13º salário
- **Rescisão** — 7 tipos (sem justa causa, justa causa, pedido, acordo mútuo, término, aposentadoria, falecimento)
- **Wizard de rescisão** — 7 etapas com estado persistido no banco
- **Central Trabalhista** — calculadora CLT com memória de cálculo visual
- **Cálculo em massa** — férias/13º/reajuste para múltiplos colaboradores
- **Alertas automáticos** — férias vencendo, fim de experiência
- **Holerite PDF** — gerado via ReportLab

### Fase 5 — People Analytics + IA Organizacional
- **Dashboard Executivo** — heatmap, gauges animados, eNPS
- **Perfil Inteligente** — radar chart com scores multidimensionais
- **Mapa de Energia** — scatter Engajamento × Retenção por setor
- **Central de Alertas** — 11 tipos com workflow lido/resolvido
- **Previsão de Turnover** — probabilidade por horizonte (30d–12m)
- **DNA Corporativo** — 6 dimensões organizacionais
- **Modo Fantasma** — detecta silos, talentos ocultos, micro-conflitos
- **RH Temporal Preditivo** — projeções com intervalos de confiança
- **IA Executiva Conselheira** — chat com contexto organizacional real (Claude/GPT)
- **Simulador de Futuro** — impacto de expansão, reajuste, PLR, home office

### Fase 6 — Módulos Complementares
- **Recrutamento (ATS)** — vagas com descrição por IA, Pipeline Kanban, perguntas geradas por IA
- **T&D** — catálogo de treinamentos, trilhas, matrículas, PDI gerado por IA, certificados PDF
- **Comunicação** — mural corporativo, comunicados segmentados, reconhecimentos, aniversariantes
- **Ouvidoria** — canal anônimo com protocolo, fluxo de investigação, logs de acesso restritos
- **Gamificação** — pontos, medalhas, níveis, ranking
- **Hub do Gestor** — equipe, metas, feedbacks
- **Portal do Colaborador** — holerites, férias, benefícios, treinamentos, reconhecimentos
- **Integrações** — estrutura Bitrix24, eSocial, Caju, Wellhub (adapters prontos para TI conectar)

---

## APIs REST

| Base URL                | Descrição         |
|------------------------|------------------|
| `/api/v1/accounts/`    | Autenticação      |
| `/api/v1/rh/`          | Gestão de Pessoas |
| `/api/v1/dp/`          | Depto. Pessoal    |
| `/api/v1/analytics/`   | People Analytics  |
| `/api/v1/inteligencia/`| IA Organizacional |

Autenticação: `Bearer <token>` no header `Authorization`

Obter token:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@empresa.com.br", "password": "Admin@2026"}'
```

---

## Configuração de IA

Edite o `.env`:

```env
# Escolha o provedor:
IA_PROVEDOR=anthropic        # ou 'openai'

# Anthropic (recomendado):
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-opus-4-7

# OpenAI (alternativo):
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

Funcionalidades que usam IA:
- Geração de descrição de vagas
- Geração de perguntas de entrevista
- PDI (Plano de Desenvolvimento Individual)
- IA Executiva Conselheira
- DNA Corporativo (narrativa)
- Simulador de Futuro (narrativa)

> Sem API Key configurada, o sistema usa respostas de fallback local e continua funcionando.

---

## Integrações (Estrutura Pronta)

As integrações estão com a estrutura criada em `integracoes/adapters.py`.
O time de TI deve implementar as chamadas HTTP reais:

| Sistema   | Arquivo                        | Métodos disponíveis                          |
|----------|-------------------------------|---------------------------------------------|
| Bitrix24 | `integracoes/adapters.py`     | `sync_employee`, `sync_department`, `push_event`, `handle_webhook` |
| eSocial  | `integracoes/adapters.py`     | `gerar_s2200`, `gerar_s2299`, `status_fila`  |
| Caju     | `integracoes/adapters.py`     | `sync_beneficio`                             |
| Wellhub  | `integracoes/adapters.py`     | `ativar_colaborador`, `desativar_colaborador` |

Configure via painel: **Integrações → Painel**

---

## Segurança

- **Senhas**: Argon2 (mais seguro que bcrypt/PBKDF2)
- **Brute-force**: django-axes (5 tentativas → bloqueio 15min)
- **JWT**: Access token 15min, refresh 7 dias, blacklist ao logout
- **RBAC**: 6 perfis hierárquicos + permission matrix por módulo
- **Soft delete**: nenhum dado é apagado fisicamente
- **Auditoria**: log imutável de todas as ações críticas
- **Ouvidoria**: logs de acesso ultra-restritos (quem viu o quê, quando, IP)
- **CSRF**: proteção em todos os formulários
- **Rate limiting**: 30 req/h anônimo, 1000 req/h autenticado

---

## Estrutura de Pastas

```
hi_conecta/
├── accounts/          # Autenticação + RBAC
├── core/              # BaseModel, Auditoria, Middleware
├── rh/                # Gestão de Pessoas
├── dp/                # Departamento Pessoal + CLT
├── analytics/         # People Analytics
├── inteligencia/      # IA Organizacional
├── recrutamento/      # ATS + Pipeline
├── treinamento/       # T&D + PDI
├── comunicacao/       # Mural + Reconhecimentos
├── ouvidoria/         # Canal de Ética
├── gamificacao/       # Pontos + Medalhas
├── gestor/            # Hub do Gestor
├── colaborador/       # Portal do Colaborador
├── integracoes/       # Adapters externos
├── templates/         # Templates HTML
├── static/            # CSS, JS, imagens
├── fixtures/          # Seed de dados
├── requirements/      # Dependências
├── .env.example       # Variáveis de ambiente
├── setup.py           # Script de setup
└── manage.py          # Django CLI
```

---

## Comandos Úteis

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Criar superuser
python manage.py createsuperuser

# Shell
python manage.py shell

# Seed de dados
python manage.py shell -c "exec(open('fixtures/seed_demo.py').read()); run()"

# Exportar audit log
python manage.py shell -c "
from core.models import LogAuditoria
import csv
with open('audit_export.csv','w') as f:
    w = csv.writer(f)
    w.writerow(['timestamp','usuario','acao','recurso','ip'])
    for l in LogAuditoria.objects.all():
        w.writerow([l.timestamp, l.usuario, l.acao, l.recurso, l.ip])
print('Exportado: audit_export.csv')
"

# Produção (Gunicorn)
gunicorn hi_conecta.wsgi:application --workers 4 --bind 0.0.0.0:8000
```

---

## Suporte

Sistema interno — suporte via equipe de TI corporativa.

**hi Conecta RH** — Plataforma Corporativa de Gestão de Pessoas
