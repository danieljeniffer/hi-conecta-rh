from django.urls import path
from . import views

app_name = 'gestor'

urlpatterns = [
    path('',          views.hub,          name='hub'),
    path('feedback/', views.dar_feedback, name='feedback'),
]
