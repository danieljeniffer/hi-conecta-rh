from .base import *

DEBUG = True

INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']

# Banco local
DATABASES['default'].update({
    'NAME': config('DB_NAME', default='hiconectarh_dev'),
})

# Email no console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache simples em dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

CORS_ALLOW_ALL_ORIGINS = True
