# hi Conecta RH — Django

## Instalação rápida

```bash
# 1. Entrar na pasta
cd django_app

# 2. Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # Linux/Mac

# 3. Instalar dependências
pip install -r requirements/development.txt

# 4. Configurar variáveis
cp .env.example .env
# Editar .env com suas configurações (DATABASE_URL, SECRET_KEY, etc.)

# 5. Criar banco PostgreSQL
# psql -c "CREATE DATABASE hiconectarh_dev"

# 6. Executar migrações
python manage.py makemigrations
python manage.py migrate

# 7. Criar superusuário
python manage.py shell -c "
from apps.accounts.models import Usuario
Usuario.objects.create_superuser(
    email='admin@empresa.com.br',
    password='Admin@2025',
    nome='Admin Sistema',
    perfil='admin'
)
print('Superusuário criado!')
"

# 8. Criar pastas necessárias
mkdir logs media

# 9. Iniciar servidor
python manage.py runserver

# Acesse: http://localhost:8000
# Admin:  http://localhost:8000/admin
```

## Credenciais padrão

| E-mail                        | Senha       | Perfil |
|-------------------------------|-------------|--------|
| admin@empresa.com.br          | Admin@2025  | Admin  |

## Estrutura de arquivos criada

```
django_app/
├── apps/                  ← 16 apps Django
│   ├── core/              ← Base, audit, middlewares
│   ├── accounts/          ← Auth JWT + RBAC
│   ├── rh/                ← RH completo
│   ├── dp/                ← DP + CLT 2024
│   ├── colaborador/       ← Portal colaborador
│   ├── analytics/         ← People Analytics
│   ├── inteligencia/      ← IA Organizacional
│   └── ...
├── config/                ← Settings, URLs
├── templates/             ← Templates Django
├── static/                ← CSS + JS enterprise
├── media/                 ← Uploads
├── logs/                  ← Logs
├── requirements/          ← Dependências
└── manage.py
```

## API REST

Base: `http://localhost:8000/api/v1/`

| Endpoint             | Método | Descrição              |
|----------------------|--------|------------------------|
| `accounts/login/`    | POST   | Login JWT              |
| `accounts/logout/`   | POST   | Logout                 |
| `dp/calcular/`       | POST   | Cálculo trabalhista    |
| `dp/ferias/`         | GET    | Lista de férias        |
| `dp/folha/`          | GET    | Histórico de folhas    |
| `analytics/riscos/`  | GET    | Scores de risco        |
| `inteligencia/pdi/`  | POST   | Gerar PDI via IA       |
| `colaborador/holerite/`| GET  | Holerite do colaborador|

## Produção

```bash
pip install -r requirements/base.txt
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py collectstatic
gunicorn config.wsgi:application --workers 4 --bind 0.0.0.0:8000
```
