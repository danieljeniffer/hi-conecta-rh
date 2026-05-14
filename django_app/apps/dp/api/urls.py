from django.urls import path
from . import views

urlpatterns = [
    path('calcular/', views.calcular_view, name='dp_calcular'),
    path('dashboard/', views.dashboard_view, name='dp_dashboard'),
    path('ferias/', views.ferias_view, name='dp_ferias'),
    path('folha/', views.folha_view, name='dp_folha'),
]
