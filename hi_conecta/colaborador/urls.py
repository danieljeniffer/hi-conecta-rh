from django.urls import path
from . import views

app_name = 'colaborador'

urlpatterns = [
    path('',            views.portal,     name='portal'),
    path('holerite/',   views.holerite,   name='holerite'),
    path('ferias/',     views.ferias,     name='ferias'),
    path('beneficios/', views.beneficios, name='beneficios'),
    path('documentos/', views.documentos, name='documentos'),
]
