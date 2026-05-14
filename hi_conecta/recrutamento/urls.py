from django.urls import path
from . import views

app_name = 'recrutamento'

urlpatterns = [
    path('',                          views.vagas_lista,       name='vagas'),
    path('nova/',                     views.vaga_criar,        name='vaga_criar'),
    path('<uuid:pk>/',                views.vaga_detalhe,      name='vaga_detalhe'),
    path('<uuid:pk>/publicar/',       views.publicar_vaga,     name='publicar_vaga'),
    path('candidatos/',               views.candidatos_lista,  name='candidatos'),
    path('ajax/mover/',               views.mover_candidatura, name='mover_candidatura'),
    path('ajax/ia/',                  views.gerar_ia_vaga,     name='gerar_ia'),
]
