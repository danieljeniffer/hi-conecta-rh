"""integracoes/views.py — Painel de status das integrações."""
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib import messages
from accounts.permissions import requer_perfil
from .models import IntegracaoConfig, LogIntegracao, FilaSincronizacao


@login_required
@requer_perfil('admin', 'rh')
def painel(request):
    sistemas = ['bitrix24', 'esocial', 'caju', 'wellhub']
    configs  = {c.sistema: c for c in IntegracaoConfig.objects.all()}
    status   = []
    for s in sistemas:
        cfg = configs.get(s)
        pendentes = FilaSincronizacao.objects.filter(
            integracao__sistema=s, status='pendente'
        ).count() if cfg else 0
        erros = FilaSincronizacao.objects.filter(
            integracao__sistema=s, status='erro'
        ).count() if cfg else 0
        status.append({
            'sistema':  s,
            'label':    dict(IntegracaoConfig.SISTEMAS).get(s, s),
            'config':   cfg,
            'pendentes':pendentes,
            'erros':    erros,
        })

    logs_recentes = LogIntegracao.objects.select_related('integracao').order_by('-created_at')[:20]

    ctx = {
        'status':       status,
        'logs':         logs_recentes,
        'page_title':   'Painel de Integrações',
    }
    return render(request, 'integracoes/painel.html', ctx)


@login_required
@requer_perfil('admin')
@require_POST
def toggle_integracao(request, sistema):
    cfg, _ = IntegracaoConfig.objects.get_or_create(
        sistema=sistema,
        defaults={
            'url_base': request.POST.get('url_base', ''),
            'api_key':  request.POST.get('api_key', ''),
        }
    )
    novo_status = 'ativa' if cfg.status != 'ativa' else 'inativa'
    cfg.status = novo_status
    cfg.url_base = request.POST.get('url_base', cfg.url_base)
    cfg.api_key  = request.POST.get('api_key', cfg.api_key)
    cfg.save()
    messages.success(request, f'{cfg.get_sistema_display()} {novo_status}.')
    return redirect('integracoes:painel')
