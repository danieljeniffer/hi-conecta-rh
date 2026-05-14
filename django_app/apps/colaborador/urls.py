from django.urls import path
from . import views

app_name = 'colaborador'

urlpatterns = [
    path('',             views.portal,         name='portal'),
    path('holerite/',    views.holerite,        name='holerite'),
    path('ferias/',      views.ferias_view,     name='ferias'),
    path('beneficios/',  views.beneficios_view, name='beneficios'),
    path('documentos/',  views.documentos_view, name='documentos'),
]
