"""analytics/urls.py — URLs do módulo People Analytics."""
from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('',                                    views.dashboard_executivo, name='dashboard'),
    path('perfil/<uuid:colaborador_id>/',       views.perfil_inteligente,  name='perfil_inteligente'),
    path('mapa-energia/',                       views.mapa_energia,        name='mapa_energia'),
    path('alertas/',                            views.central_alertas,     name='central_alertas'),
    path('turnover/',                           views.indicadores_turnover, name='turnover'),
]
