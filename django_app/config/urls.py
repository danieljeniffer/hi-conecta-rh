"""hi Conecta RH — URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView


admin.site.site_header = "hi Conecta RH — Administração"
admin.site.site_title  = "hi Conecta RH"
admin.site.index_title = "Painel Administrativo"

urlpatterns = [
    # Admin customizado
    path('admin/', admin.site.urls),

    # Autenticação
    path('accounts/', include('apps.accounts.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dashboard principal
    path('', include('apps.core.urls')),

    # Módulos RH
    path('rh/',             include('apps.rh.urls')),
    path('dp/',             include('apps.dp.urls')),
    path('colaborador/',    include('apps.colaborador.urls')),
    path('gestor/',         include('apps.gestor.urls')),
    path('recrutamento/',   include('apps.recrutamento.urls')),
    path('analytics/',      include('apps.analytics.urls')),
    path('inteligencia/',   include('apps.inteligencia.urls')),
    path('integracoes/',    include('apps.integracoes.urls')),
    path('comunicacao/',    include('apps.comunicacao.urls')),
    path('treinamento/',    include('apps.treinamento.urls')),
    path('documentos/',     include('apps.documentos.urls')),
    path('ouvidoria/',      include('apps.ouvidoria.urls')),
    path('gamificacao/',    include('apps.gamificacao.urls')),
    path('endomarketing/',  include('apps.endomarketing.urls')),

    # APIs REST (v1)
    path('api/v1/accounts/',    include('apps.accounts.api.urls')),
    path('api/v1/rh/',          include('apps.rh.api.urls')),
    path('api/v1/dp/',          include('apps.dp.api.urls')),
    path('api/v1/colaborador/', include('apps.colaborador.api.urls')),
    path('api/v1/analytics/',   include('apps.analytics.api.urls')),
    path('api/v1/inteligencia/',include('apps.inteligencia.api.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
