"""gestor/views.py — Hub do Gestor: equipe, PDIs, feedbacks, metas."""
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.utils import timezone
from accounts.permissions import requer_perfil
from .models import MetaEquipe, FeedbackGestor


@login_required
@requer_perfil('gestor', 'rh', 'admin')
def hub(request):
    from rh.models import Colaborador, Departamento
    # Pega departamentos onde o usuário é gestor
    depts = Departamento.objects.filter(gestor__usuario=request.user, deleted_at__isnull=True)
    if not depts.exists() and request.user.perfil in ('rh', 'admin'):
        depts = Departamento.objects.filter(ativo=True, deleted_at__isnull=True)

    equipe = Colaborador.objects.filter(
        departamento__in=depts, status='ativo', deleted_at__isnull=True
    ).select_related('cargo', 'departamento')

    metas = MetaEquipe.objects.filter(
        gestor=request.user, status='ativa', deleted_at__isnull=True
    ).order_by('prazo')

    feedbacks_recentes = FeedbackGestor.objects.filter(
        gestor=request.user, deleted_at__isnull=True
    ).select_related('colaborador').order_by('-created_at')[:10]

    # Alertas da equipe (via analytics)
    alertas = []
    try:
        from analytics.models import AlertaInteligente
        alertas = AlertaInteligente.objects.filter(
            colaborador__in=equipe, status='ativo', deleted_at__isnull=True
        ).order_by('-created_at')[:5]
    except Exception:
        pass

    ctx = {
        'equipe':            equipe,
        'metas':             metas,
        'feedbacks_recentes':feedbacks_recentes,
        'alertas':           alertas,
        'total_equipe':      equipe.count(),
        'page_title':        'Meu Hub de Gestão',
    }
    return render(request, 'gestor/hub.html', ctx)


@login_required
@requer_perfil('gestor', 'rh', 'admin')
def dar_feedback(request):
    if request.method == 'POST':
        from rh.models import Colaborador
        colab = get_object_or_404(Colaborador, pk=request.POST.get('colaborador_id'), deleted_at__isnull=True)
        FeedbackGestor.objects.create(
            gestor=request.user,
            colaborador=colab,
            tipo=request.POST.get('tipo', 'construtivo'),
            assunto=request.POST.get('assunto', ''),
            mensagem=request.POST.get('mensagem', ''),
            privado=request.POST.get('privado') == '1',
        )
        messages.success(request, 'Feedback registrado com sucesso.')
        return redirect('gestor:hub')
    from rh.models import Colaborador
    ctx = {
        'colaboradores': Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).order_by('nome'),
        'tipos':         FeedbackGestor.TIPOS,
        'page_title':    'Dar Feedback',
    }
    return render(request, 'gestor/feedback_form.html', ctx)
