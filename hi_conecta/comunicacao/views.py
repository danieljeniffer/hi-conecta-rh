"""comunicacao/views.py — Mural, comunicados, reconhecimentos."""
from datetime import date
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from accounts.permissions import requer_perfil
from .models import Comunicado, ComentarioComunicado, Reconhecimento
import json


@login_required
def feed(request):
    hoje = timezone.now()
    qs = Comunicado.objects.filter(ativo=True, deleted_at__isnull=True)
    qs = qs.filter(
        models.Q(expira_em__isnull=True) | models.Q(expira_em__gte=hoje)
    ).select_related('autor').prefetch_related('comentarios')

    # Aniversariantes do mês
    from rh.models import Colaborador
    aniversariantes = Colaborador.objects.filter(
        status='ativo', deleted_at__isnull=True,
        data_nascimento__month=hoje.month,
    ).order_by('data_nascimento__day')

    reconhecimentos = Reconhecimento.objects.filter(
        publico=True, deleted_at__isnull=True
    ).select_related('remetente', 'destinatario').order_by('-created_at')[:10]

    ctx = {
        'comunicados':     qs[:30],
        'aniversariantes': aniversariantes,
        'reconhecimentos': reconhecimentos,
        'page_title':      'Mural Corporativo',
    }
    return render(request, 'comunicacao/feed.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def criar_comunicado(request):
    if request.method == 'POST':
        c = Comunicado.objects.create(
            titulo=request.POST.get('titulo'),
            tipo=request.POST.get('tipo', 'noticia'),
            conteudo=request.POST.get('conteudo'),
            segmento=request.POST.get('segmento', 'todos'),
            fixado=request.POST.get('fixado') == '1',
            permite_comentarios=request.POST.get('permite_comentarios') == '1',
            ativo=True,
            publicado_em=timezone.now(),
            autor=request.user,
            criado_por=request.user,
        )
        return redirect('comunicacao:feed')
    from rh.models import Departamento
    ctx = {
        'departamentos': Departamento.objects.filter(ativo=True, deleted_at__isnull=True),
        'tipos':         Comunicado.TIPOS,
        'page_title':    'Novo Comunicado',
    }
    return render(request, 'comunicacao/criar_comunicado.html', ctx)


@login_required
@require_POST
def comentar(request, pk):
    comunicado = get_object_or_404(Comunicado, pk=pk, ativo=True, permite_comentarios=True)
    texto = json.loads(request.body).get('texto', '').strip()
    if not texto:
        return JsonResponse({'sucesso': False}, status=400)
    c = ComentarioComunicado.objects.create(
        comunicado=comunicado, autor=request.user, texto=texto
    )
    return JsonResponse({
        'sucesso': True,
        'autor':   request.user.get_full_name() or request.user.email,
        'texto':   c.texto,
        'quando':  c.created_at.strftime('%d/%m/%Y %H:%M'),
    })


@login_required
@require_POST
def reconhecer(request):
    data = json.loads(request.body)
    from rh.models import Colaborador
    colab_id = data.get('colaborador_id')
    try:
        colab = Colaborador.objects.get(pk=colab_id, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return JsonResponse({'sucesso': False}, status=404)
    Reconhecimento.objects.create(
        remetente=request.user,
        destinatario=colab,
        tipo=data.get('tipo', 'destaque_mes'),
        mensagem=data.get('mensagem', ''),
        publico=data.get('publico', True),
        pontos=50,
    )
    # Gamificação: adicionar pontos
    try:
        from gamificacao.models import PontuacaoColaborador, TransacaoPontos
        pt, _ = PontuacaoColaborador.objects.get_or_create(colaborador=colab)
        pt.total_pontos += 50
        pt.pontos_mes   += 50
        pt.recalcular_nivel()
        pt.save()
        TransacaoPontos.objects.create(
            colaborador=colab, pontos=50, origem='reconhecimento',
            descricao=f'Reconhecimento de {request.user.get_full_name() or request.user.email}',
        )
    except Exception:
        pass
    return JsonResponse({'sucesso': True})


from django.db import models  # noqa — necessário para o Q dentro da view
