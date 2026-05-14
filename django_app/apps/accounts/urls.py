from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/',        views.login_view,        name='login'),
    path('logout/',       views.logout_view,        name='logout'),
    path('trocar-senha/', views.trocar_senha_view,  name='trocar_senha'),
    path('perfil/',       views.perfil_view,        name='perfil'),
]
