from django.urls import path
from . import views
app_name = 'gamificacao'
urlpatterns = [
    path('', views.ranking, name='ranking'),
]
