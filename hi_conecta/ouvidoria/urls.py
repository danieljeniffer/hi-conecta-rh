from django.urls import path
from . import views

app_name = 'ouvidoria'

urlpatterns = [
    path('',                  views.registrar_denuncia, name='registrar'),
    path('acompanhar/',       views.acompanhar_denuncia, name='acompanhar'),
    path('admin/',            views.lista_admin,         name='lista'),
    path('admin/<uuid:pk>/',  views.detalhe_admin,       name='detalhe'),
]
