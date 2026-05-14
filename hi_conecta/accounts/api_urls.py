from django.urls import path
from . import views

urlpatterns = [
    path('login/',  views.api_login,  name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    path('me/',     views.api_me,     name='api_me'),
]
