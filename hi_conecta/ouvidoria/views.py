"""ouvidoria/views.py — Canal anônimo, investigação, logs."""
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from accounts.permissions import requer_perfil
from .models import Denuncia, LogAcessoOuvidoria


def registrar_denuncia(request):
    """Canal público — não requer login."""
    if request.method == 'POST':
        d = Denuncia.objects.create(
            categoria=request.POST.get('categoria'),
            descricao=request.POST.get('descricao', '').strip(),
            data_ocorrencia=request.POST.get('data_ocorrencia') or None,
            local=request.POST.get('local', ''),
            envolvidos=request.POST.get('envolvidos', ''),
            anonima=request.POST.get('contato_opcional', '') == '',
            contato_opcional=request.POST.get('contato_opcional', ''),
        )
        if 'evidencia' in request.FILES:
            d.evidencias = request.FILES['evidencia']
            d.save()
        return render(request, 'ouvidoria/confirmacao.html', {'protocolo': d.protocolo})

    ctx = {
        'categorias': Denuncia.CATEGORIAS,
        'page_title': 'Canal de Ética e Ouvidoria',
    }
    return render(request, 'ouvidoria/registrar.html', ctx)


def acompanhar_denuncia(request):
    """Acompanhamento por protocolo — sem login."""
    protocolo = request.GET.get('protocolo', '').strip().upper()
    denuncia  = None
    if protocolo:
        denuncia = Denuncia.objects.filter(protocolo=protocolo).first()
    return render(request, 'ouvidoria/acompanhar.html', {
        'denuncia':  denuncia,
        'protocolo': protocolo,
        'page_title':'Acompanhar Denúncia',
    })


@login_required
@requer_perfil('rh', 'admin', 'juridico')
def lista_admin(request):
    qs = Denuncia.objects.filter(deleted_at__isnull=True).order_by('-created_at')
    status = request.GET.get('status', '')
    categoria = request.GET.get('categoria', '')
    if status:    qs = qs.filter(status=status)
    if categoria: qs = qs.filter(categoria=categoria)

    for d in qs:
        LogAcessoOuvidoria.objects.create(
            denuncia=d, usuario=request.user, acao='visualizou',
            ip=request.META.get('REMOTE_ADDR'),
        )

    ctx = {
        'denuncias':  qs[:100],
        'categorias': Denuncia.CATEGORIAS,
        'status_choices': Denuncia.STATUS,
        'filtro_status':  status,
        'filtro_cat':     categoria,
        'page_title':     'Ouvidoria — Painel de Gestão',
    }
    return render(request, 'ouvidoria/lista_admin.html', ctx)


@login_required
@requer_perfil('rh', 'admin', 'juridico')
def detalhe_admin(request, pk):
    d = get_object_or_404(Denuncia, pk=pk, deleted_at__isnull=True)
    LogAcessoOuvidoria.objects.create(
        denuncia=d, usuario=request.user, acao='visualizou_detalhe',
        ip=request.META.get('REMOTE_ADDR'),
    )
    if request.method == 'POST':
        d.status             = request.POST.get('status', d.status)
        d.prioridade         = request.POST.get('prioridade', d.prioridade)
        d.conclusao_interna  = request.POST.get('conclusao_interna', d.conclusao_interna)
        d.resposta_publica   = request.POST.get('resposta_publica', d.resposta_publica)
        d.investigador       = request.user
        if d.status == 'concluida' and not d.concluida_em:
            d.concluida_em = timezone.now()
        d.save()
        LogAcessoOuvidoria.objects.create(
            denuncia=d, usuario=request.user, acao='editou',
            ip=request.META.get('REMOTE_ADDR'),
            detalhes=f'Status: {d.status}',
        )
        return redirect('ouvidoria:lista')
    ctx = {
        'denuncia':  d,
        'prioridades': Denuncia.PRIORIDADES,
        'status_choices': Denuncia.STATUS,
        'page_title': f'Denúncia #{d.protocolo}',
    }
    return render(request, 'ouvidoria/detalhe_admin.html', ctx)
