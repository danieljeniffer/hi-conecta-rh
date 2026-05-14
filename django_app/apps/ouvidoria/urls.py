from django.urls import path
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
app_name = 'ouvidoria'

@login_required
def _hub(request):
    return render(request, 'ouvidoria/hub.html', {'page_title': 'ouvidoria'.title()})

urlpatterns = [
    path('', _hub, name='hub'),
    path('feed/', _hub, name='feed'),
    path('lista/', _hub, name='lista'),
    path('vagas/', _hub, name='vagas'),
    path('dashboard/', _hub, name='dashboard'),
]
