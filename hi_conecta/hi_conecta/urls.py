"""hi Conecta RH — URL Configuration."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

admin.site.site_header = 'hi Conecta RH — Admin'
admin.site.site_title  = 'hi Conecta RH'
admin.site.index_title = 'Administração do Sistema'

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Auth
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps principais
    path('', include('core.urls', namespace='core')),
    path('rh/', include('rh.urls', namespace='rh')),
    path('dp/', include('dp.urls', namespace='dp')),
    path('colaborador/', include('colaborador.urls', namespace='colaborador')),
    path('gestor/', include('gestor.urls', namespace='gestor')),
    path('recrutamento/', include('recrutamento.urls', namespace='recrutamento')),
    path('analytics/', include('analytics.urls', namespace='analytics')),
    path('inteligencia/', include('inteligencia.urls', namespace='inteligencia')),
    path('comunicacao/', include('comunicacao.urls', namespace='comunicacao')),
    path('treinamento/', include('treinamento.urls', namespace='treinamento')),
    path('documentos/', include('documentos.urls', namespace='documentos')),
    path('ouvidoria/', include('ouvidoria.urls', namespace='ouvidoria')),
    path('gamificacao/', include('gamificacao.urls', namespace='gamificacao')),
    path('endomarketing/', include('endomarketing.urls', namespace='endomarketing')),
    path('integracoes/', include('integracoes.urls', namespace='integracoes')),

    # APIs REST
    path('api/v1/accounts/', include('accounts.api_urls')),
    path('api/v1/rh/', include('rh.api_urls')),
    path('api/v1/dp/', include('dp.api_urls')),
    path('api/v1/analytics/', include('analytics.api_urls')),
    path('api/v1/inteligencia/', include('inteligencia.api_urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
