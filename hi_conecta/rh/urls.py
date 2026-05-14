from django.urls import path
from . import views

app_name = 'rh'

urlpatterns = [
    # Pessoas
    path('pessoas/',                         views.pessoas,              name='pessoas'),
    path('pessoas/novo/',                    views.colaborador_novo,     name='colaborador_novo'),
    path('pessoas/<uuid:pk>/',               views.colaborador_detalhe,  name='colaborador_detalhe'),
    path('pessoas/<uuid:pk>/editar/',        views.colaborador_editar,   name='colaborador_editar'),
    path('pessoas/<uuid:pk>/desligar/',      views.colaborador_desligar, name='colaborador_desligar'),
    # Departamentos
    path('departamentos/',                   views.departamentos,        name='departamentos'),
    path('departamentos/novo/',              views.departamento_form,    name='departamento_novo'),
    path('departamentos/<uuid:pk>/editar/',  views.departamento_form,    name='departamento_editar'),
    # Cargos
    path('cargos/',                          views.cargos,               name='cargos'),
    path('cargos/novo/',                     views.cargo_form,           name='cargo_novo'),
    path('cargos/<uuid:pk>/editar/',         views.cargo_form,           name='cargo_editar'),
    # Organograma
    path('organograma/',                     views.organograma,          name='organograma'),
    path('organograma/dados/',               views.organograma_json,     name='organograma_json'),
    # Indicadores
    path('indicadores/',                     views.indicadores,          name='indicadores'),
    path('indicadores/dados/',               views.indicadores_json,     name='indicadores_json'),
    # Avaliações
    path('avaliacoes/',                      views.avaliacoes,           name='avaliacoes'),
    path('avaliacoes/nova/',                 views.avaliacao_form,       name='avaliacao_nova'),
    path('avaliacoes/<uuid:pk>/editar/',     views.avaliacao_form,       name='avaliacao_editar'),
    # Clima
    path('clima/',                           views.clima,                name='clima'),
    path('clima/pesquisa/nova/',             views.clima_pesquisa_form,  name='pesquisa_nova'),
    path('clima/pesquisa/<uuid:pk>/editar/', views.clima_pesquisa_form,  name='pesquisa_editar'),
    # Advertências
    path('advertencia/nova/',                views.advertencia_form,     name='advertencia_nova'),
    path('advertencia/nova/<uuid:colab_pk>/',views.advertencia_form,     name='advertencia_nova_colab'),
]
