from django.urls import path
from . import views
app_name = 'endomarketing'
urlpatterns = [
    path('', views.hub, name='hub'),
]
