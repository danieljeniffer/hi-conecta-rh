from django.urls import path
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from . import views as v

app_name = 'rh'


def simple_view(template, title):
    @login_required
    def _view(request):
        return render(request, template, {'page_title': title})
    return _view


urlpatterns = [
    path('pessoas/',      simple_view('rh/pessoas.html',    'Gestão de Pessoas'), name='pessoas'),
    path('indicadores/',  simple_view('rh/indicadores.html','Indicadores'),       name='indicadores'),
    path('clima/',        simple_view('rh/clima.html',      'Clima & Engajamento'),name='clima'),
    path('bonificacoes/', simple_view('rh/bonificacoes.html','Bonificações'),      name='bonificacoes'),
]
