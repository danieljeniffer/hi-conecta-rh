"""colaborador/views.py — Portal do colaborador."""
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.utils import timezone


@login_required
def portal(request):
    """Portal principal do colaborador."""
    colab = getattr(request.user, 'colaborador', None)
    ctx   = {'colab': colab, 'page_title': 'Meu Portal'}

    if colab:
        from dp.models import FolhaItem, Ferias, Beneficio
        from treinamento.models import Matricula
        from comunicacao.models import Comunicado, Reconhecimento
        from gamificacao.models import PontuacaoColaborador

        ctx['ultimos_holerites'] = FolhaItem.objects.filter(
            colaborador=colab, deleted_at__isnull=True
        ).order_by('-folha__competencia')[:3]

        ctx['ferias'] = Ferias.objects.filter(
            colaborador=colab, deleted_at__isnull=True
        ).order_by('-created_at')[:3]

        ctx['matriculas'] = Matricula.objects.filter(
            colaborador=colab, deleted_at__isnull=True
        ).select_related('treinamento').order_by('-created_at')[:5]

        ctx['reconhecimentos'] = Reconhecimento.objects.filter(
            destinatario=colab, deleted_at__isnull=True
        ).order_by('-created_at')[:5]

        try:
            ctx['pontuacao'] = PontuacaoColaborador.objects.get(colaborador=colab)
        except PontuacaoColaborador.DoesNotExist:
            ctx['pontuacao'] = None

        ctx['comunicados'] = Comunicado.objects.filter(
            ativo=True, deleted_at__isnull=True
        ).order_by('-fixado', '-publicado_em')[:5]

    return render(request, 'colaborador/portal.html', ctx)


@login_required
def holerite(request):
    colab = getattr(request.user, 'colaborador', None)
    ctx = {'colab': colab, 'page_title': 'Meus Holerites'}
    if colab:
        from dp.models import FolhaItem
        ctx['holerites'] = FolhaItem.objects.filter(
            colaborador=colab, deleted_at__isnull=True
        ).select_related('folha').order_by('-folha__competencia')
    return render(request, 'colaborador/holerite.html', ctx)


@login_required
def ferias(request):
    colab = getattr(request.user, 'colaborador', None)
    ctx = {'colab': colab, 'page_title': 'Minhas Férias'}
    if colab:
        from dp.models import Ferias
        ctx['ferias_list'] = Ferias.objects.filter(
            colaborador=colab, deleted_at__isnull=True
        ).order_by('-data_inicio')
    return render(request, 'colaborador/ferias.html', ctx)


@login_required
def beneficios(request):
    colab = getattr(request.user, 'colaborador', None)
    ctx = {'colab': colab, 'page_title': 'Meus Benefícios'}
    if colab:
        from dp.models import Beneficio
        ctx['beneficios'] = Beneficio.objects.filter(ativo=True, deleted_at__isnull=True).order_by('tipo', 'nome')
    return render(request, 'colaborador/beneficios.html', ctx)


@login_required
def documentos(request):
    colab = getattr(request.user, 'colaborador', None)
    ctx = {'colab': colab, 'page_title': 'Meus Documentos'}
    return render(request, 'colaborador/documentos.html', ctx)
