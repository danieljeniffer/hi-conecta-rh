from django.urls import path
from apps.accounts.views import api_login, api_logout

urlpatterns = [
    path('login/',  api_login,  name='api_login'),
    path('logout/', api_logout, name='api_logout'),
]
