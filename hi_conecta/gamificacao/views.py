from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import PontuacaoColaborador, MedalhaColaborador, Medalha

@login_required
def ranking(request):
    top = PontuacaoColaborador.objects.filter(
        colaborador__status='ativo', colaborador__deleted_at__isnull=True
    ).select_related('colaborador').order_by('-total_pontos')[:20]
    medalhas = Medalha.objects.filter(ativa=True).order_by('-pontos')
    ctx = {'top': top, 'medalhas': medalhas, 'page_title': 'Gamificação — Ranking'}
    return render(request, 'gamificacao/ranking.html', ctx)
