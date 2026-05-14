from django.urls import path
from . import views

app_name = 'comunicacao'

urlpatterns = [
    path('',              views.feed,              name='feed'),
    path('novo/',         views.criar_comunicado,  name='criar_comunicado'),
    path('<uuid:pk>/comentar/', views.comentar,    name='comentar'),
    path('reconhecer/',   views.reconhecer,        name='reconhecer'),
]
