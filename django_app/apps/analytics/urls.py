from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('',                          views.dashboard,          name='dashboard'),
    path('riscos/',                   views.mapa_riscos,        name='mapa_riscos'),
    path('riscos/<uuid:pk>/',         views.risco_colaborador,  name='risco_colaborador'),
]
