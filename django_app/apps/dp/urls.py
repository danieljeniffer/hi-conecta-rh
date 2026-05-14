from django.urls import path
from . import views

app_name = 'dp'

urlpatterns = [
    path('',                  views.hub,           name='hub'),
    path('central/',          views.central,        name='central'),
    path('central/calcular/', views.api_calcular,   name='calcular'),
    path('ferias/',           views.ferias_lista,   name='ferias_lista'),
    path('folha/',            views.folha_lista,    name='folha_lista'),
    path('rescisao/',         views.rescisao_lista, name='rescisao_lista'),
    path('holerite/<str:competencia>/', views.holerite_colab, name='holerite'),
]
