from django.urls import path
from . import views

app_name = 'integracoes'

urlpatterns = [
    path('',                         views.painel,            name='painel'),
    path('<str:sistema>/toggle/',    views.toggle_integracao, name='toggle'),
]
