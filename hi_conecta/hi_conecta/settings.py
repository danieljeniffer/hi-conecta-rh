"""
hi Conecta RH — Settings Enterprise
Plataforma corporativa interna de RH/DP
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

# ─── Caminhos base ───────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Segurança ───────────────────────────────────────────────
SECRET_KEY  = config('SECRET_KEY')
DEBUG       = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ─── Apps ────────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'axes',
    'simple_history',
    'auditlog',
    'widget_tweaks',
    'crispy_forms',
    'crispy_bootstrap5',
]

LOCAL_APPS = [
    'core',
    'accounts',
    'rh',
    'dp',
    'recrutamento',
    'colaborador',
    'gestor',
    'analytics',
    'inteligencia',
    'integracoes',
    'comunicacao',
    'treinamento',
    'documentos',
    'ouvidoria',
    'gamificacao',
    'endomarketing',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Auth customizado ─────────────────────────────────────────
AUTH_USER_MODEL = 'accounts.Usuario'

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ─── Middleware ───────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
    'auditlog.middleware.AuditlogMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
    'core.middleware.AuditoriaMiddleware',
    'core.middleware.PerfilContextMiddleware',
]

# ─── URLs e Templates ─────────────────────────────────────────
ROOT_URLCONF = 'hi_conecta.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.empresa_context',
                'core.context_processors.menu_context',
                'core.context_processors.notificacoes_context',
                'accounts.context_processors.usuario_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'hi_conecta.wsgi.application'
ASGI_APPLICATION = 'hi_conecta.asgi.application'

# ─── Banco de dados ───────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     config('DB_NAME', default='hiconecta_rh'),
        'USER':     config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST':     config('DB_HOST', default='localhost'),
        'PORT':     config('DB_PORT', default='5432'),
        'OPTIONS':  {'connect_timeout': 10},
        'CONN_MAX_AGE': 60,
        'TEST': {'NAME': 'test_hiconecta_rh'},
    }
}

# ─── Cache (Redis) ────────────────────────────────────────────
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND':  'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS':  {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
        },
        'KEY_PREFIX': 'hiconecta',
        'TIMEOUT': 300,
    }
}

# Sessões no Redis
SESSION_ENGINE      = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE  = 28800        # 8 horas
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE   = config('SESSION_COOKIE_SECURE', default=False, cast=bool)

# ─── JWT ─────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=config('JWT_ACCESS_MINUTES', default=15, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_DAYS', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN':        True,
    'ALGORITHM':                'HS256',
    'SIGNING_KEY':              SECRET_KEY,
    'AUTH_HEADER_TYPES':        ('Bearer',),
    'USER_ID_FIELD':            'id',
    'USER_ID_CLAIM':            'user_id',
    'TOKEN_TYPE_CLAIM':         'token_type',
    'JTI_CLAIM':                'jti',
    'AUTH_TOKEN_CLASSES':       ('rest_framework_simplejwt.tokens.AccessToken',),
}

# ─── REST Framework ───────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.PaginacaoPadrao',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/hour',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'core.exceptions.handler_excecao',
}

# ─── Proteção contra brute-force (Axes) ──────────────────────
AXES_FAILURE_LIMIT       = 5
AXES_COOLOFF_TIME        = timedelta(minutes=15)
AXES_RESET_ON_SUCCESS    = True
AXES_LOCKOUT_TEMPLATE    = 'accounts/bloqueado.html'
AXES_USERNAME_FORM_FIELD = 'email'

# ─── Senhas ───────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

# ─── Internacionalização ──────────────────────────────────────
LANGUAGE_CODE = 'pt-br'
TIME_ZONE     = 'America/Sao_Paulo'
USE_I18N      = True
USE_TZ        = True

# ─── Static / Media ──────────────────────────────────────────
STATIC_URL        = '/static/'
STATIC_ROOT       = BASE_DIR / 'staticfiles'
STATICFILES_DIRS  = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Email ────────────────────────────────────────────────────
EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST          = config('EMAIL_HOST', default='localhost')
EMAIL_PORT          = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER     = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS       = True
DEFAULT_FROM_EMAIL  = config('DEFAULT_FROM_EMAIL', default='hi Conecta RH <noreply@empresa.com.br>')

# ─── CORS ────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()
CSRF_COOKIE_SECURE   = config('CSRF_COOKIE_SECURE', default=False, cast=bool)

# ─── Login / Logout ──────────────────────────────────────────
LOGIN_URL          = '/accounts/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/accounts/login/'

# ─── Crispy Forms ────────────────────────────────────────────
CRISPY_ALLOWED_TEMPLATE_PACKS = 'bootstrap5'
CRISPY_TEMPLATE_PACK          = 'bootstrap5'

# ─── Configurações da empresa ─────────────────────────────────
EMPRESA = {
    'NOME':   config('EMPRESA_NOME',   default='hi Conecta RH'),
    'CNPJ':   config('EMPRESA_CNPJ',   default='00.000.000/0001-00'),
    'CIDADE': config('EMPRESA_CIDADE', default='João Pessoa'),
    'UF':     config('EMPRESA_UF',     default='PB'),
    'LOGO':   None,
}

# ─── Logs ────────────────────────────────────────────────────
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {module} (PID {process}) — {message}',
            'style': '{',
            'datefmt': '%d/%m/%Y %H:%M:%S',
        },
        'simples': {
            'format': '{levelname} {asctime} — {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simples',
        },
        'arquivo_app': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'app.log',
            'maxBytes': 10 * 1024 * 1024,   # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },
        'arquivo_seguranca': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'seguranca.log',
            'maxBytes': 5 * 1024 * 1024,
            'backupCount': 10,
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },
        'arquivo_erros': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'erros.log',
            'maxBytes': 10 * 1024 * 1024,
            'backupCount': 5,
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'arquivo_app'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['arquivo_erros'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['arquivo_seguranca'],
            'level': 'WARNING',
            'propagate': False,
        },
        'accounts': {
            'handlers': ['console', 'arquivo_seguranca'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'core': {
            'handlers': ['console', 'arquivo_app'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console', 'arquivo_app'],
        'level': 'WARNING',
    },
}

# ─── IA Executiva Conselheira ─────────────────────────────────
IA_PROVEDOR     = config('IA_PROVEDOR', default='anthropic')        # 'anthropic' ou 'openai'
ANTHROPIC_API_KEY = config('ANTHROPIC_API_KEY', default='')
ANTHROPIC_MODEL   = config('ANTHROPIC_MODEL', default='claude-opus-4-7')
OPENAI_API_KEY    = config('OPENAI_API_KEY', default='')
OPENAI_MODEL      = config('OPENAI_MODEL', default='gpt-4o')

# ─── Debug Toolbar (apenas em DEBUG) ─────────────────────────
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    CACHES['default'] = {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'
