"""inteligencia/urls.py — URLs da IA Organizacional."""
from django.urls import path
from . import views

app_name = 'inteligencia'

urlpatterns = [
    path('',                    views.hub_inteligencia,   name='hub'),
    path('dna/',                views.dna_corporativo,    name='dna_corporativo'),
    path('fantasma/',           views.modo_fantasma,      name='modo_fantasma'),
    path('temporal/',           views.rh_temporal,        name='rh_temporal'),
    path('ia/',                 views.ia_executiva,        name='ia_executiva'),
    path('ia/consultar/',       views.ia_consultar,        name='ia_consultar'),
    path('simulador/',          views.simulador_futuro,   name='simulador_futuro'),
    path('simulador/executar/', views.simulador_executar, name='simulador_executar'),
]
