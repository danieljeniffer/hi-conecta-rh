from django.urls import path
from . import views

app_name = 'treinamento'

urlpatterns = [
    path('',             views.lista,         name='lista'),
    path('<uuid:pk>/matricular/', views.matricular, name='matricular'),
    path('pdis/',        views.pdis_lista,    name='pdis'),
    path('pdis/gerar/',  views.gerar_pdi_ia,  name='gerar_pdi'),
]
