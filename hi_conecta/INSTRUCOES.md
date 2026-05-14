# hi Conecta RH — Fase 1

## Instalação e execução

```bash
# 1. Entrar na pasta
cd hi_conecta

# 2. Criar virtualenv
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

# 3. Instalar dependências
pip install -r requirements/development.txt

# 4. Configurar ambiente
copy .env.example .env        # Windows
cp .env.example .env          # Linux/Mac
# Editar .env — preencher SECRET_KEY, DB_PASSWORD

# 5. Criar banco PostgreSQL
# psql -c "CREATE DATABASE hiconecta_rh"

# 6. Executar migrations
python manage.py makemigrations
python manage.py migrate

# 7. Criar dados iniciais
python manage.py seed

# 8. Criar pasta de logs
mkdir logs

# 9. Iniciar servidor
python manage.py runserver

# Acesse: http://localhost:8000
```

## Credenciais após seed

| Perfil      | E-mail                              | Senha       |
|-------------|-------------------------------------|-------------|
| admin       | admin.sistema@empresa.com.br        | Admin@2025  |
| rh          | admin@empresa.com.br                | admin123    |
| analista    | analista@empresa.com.br             | analista123 |
| gestor      | gestor@empresa.com.br               | gestor123   |
| colaborador | colab@empresa.com.br                | colab123    |
| juridico    | juridico@empresa.com.br             | juridico123 |

## O que foi entregue na Fase 1

### Estrutura
- 16 apps Django criados
- Pastas: templates/, static/, media/, logs/, requirements/, fixtures/
- settings.py enterprise completo (PostgreSQL, Redis, JWT, Axes, Argon2)

### App `accounts`
- `Usuario` — model customizado com UUID, perfis RBAC, segurança
- `SessaoUsuario` — rastreio de sessões JWT
- `PermissaoModulo` — permissões granulares por módulo
- Login/logout com sessão Django + emissão JWT
- API REST: `/api/v1/accounts/login/`, `/logout/`, `/me/`
- Proteção brute-force (5 tentativas → bloqueio 15min)
- Admin customizado com cores e badges

### App `core`
- `BaseModel` — UUID + timestamps + soft delete
- `AuditMixin` — rastreia criado_por / atualizado_por
- `LogAuditoria` — trilha completa de ações sensíveis
- `Configuracao` — chave-valor do sistema
- Middlewares: `AuditoriaMiddleware`, `PerfilContextMiddleware`
- `permissions.py` — decorators, mixins e DRF permissions completos
- `context_processors.py` — empresa, menu por perfil, notificações
- `templatetags/hi_tags.py` — moeda, CPF, iniciais, badge_status, tem_perm

### Frontend
- `base.html` — layout completo: sidebar por perfil, topbar, notificações, dark mode
- `login.html` — dois painéis, JWT, auto-dismiss, acessibilidade
- `dashboard.html` — KPIs + atalhos rápidos
- `main.css` — 350+ linhas, sidebar, topbar, cards, responsivo
- `login.css`, `components.css`, `dark-mode.css`
- `main.js` — sidebar, dark mode, Toast, confirmar modal, API loading
- `api.js` — cliente HTTP com CSRF e JWT

### Seed
- `python manage.py seed` — cria 6 usuários + 8 configurações iniciais

## Próxima etapa: Fase 2

Aguardando instrução para implementar:
- App `rh` completo (Colaborador, Departamento, Cargo, Avaliações)
- App `dp` completo (Folha, Férias, Rescisão + cálculos CLT)
- App `colaborador` (Portal do colaborador)
- Demais apps
