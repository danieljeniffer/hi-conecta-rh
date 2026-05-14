"""apps/colaborador/views.py — Portal do Colaborador."""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from apps.dp.models import Ferias, FolhaItem, ColaboradorBeneficio, NotificacaoDP
from apps.rh.models import AvaliacaoDesempenho
from apps.dp.services import calcular_ferias
from decimal import Decimal


def _get_colaborador(request):
    """Retorna colaborador vinculado ao usuário logado."""
    if not hasattr(request.user, 'colaborador') or not request.user.colaborador:
        return None
    return request.user.colaborador


@login_required
def portal(request):
    """Dashboard principal do colaborador."""
    colab = _get_colaborador(request)
    if not colab:
        messages.warning(request, 'Seu usuário não possui colaborador vinculado. Fale com o RH.')
        return redirect('core:dashboard')

    from apps.dp.services import calcular_liquido
    sal     = Decimal(str(colab.salario_base))
    dep     = colab.dependentes.filter(ir=True).count()
    calculos = calcular_liquido(sal, dep)

    ferias_pend  = Ferias.objects.filter(colaborador=colab, status='pendente').count()
    notificacoes = NotificacaoDP.objects.filter(colaborador=colab, lida=False).order_by('-created_at')[:5]
    beneficios   = ColaboradorBeneficio.objects.filter(colaborador=colab, ativo=True).select_related('beneficio')

    # Holerites recentes
    from apps.dp.models import FolhaPagamento
    holerites = FolhaItem.objects.filter(colaborador=colab).select_related('folha').order_by('-folha__competencia')[:5]

    # Próximos aniversariantes do time
    import datetime
    hoje       = timezone.now().date()
    proximos_7 = []
    for i in range(7):
        dia = hoje + datetime.timedelta(days=i)
        if colab.departamento:
            anivs = colab.departamento.colaboradores.filter(
                data_nascimento__month=dia.month,
                data_nascimento__day=dia.day,
                status='ativo'
            ).exclude(id=colab.id)
            proximos_7.extend(anivs)

    context = {
        'page_title':   'Meu Portal',
        'colab':        colab,
        'calculos':     calculos,
        'ferias_pend':  ferias_pend,
        'notificacoes': notificacoes,
        'beneficios':   beneficios,
        'holerites':    holerites,
        'aniversariantes': proximos_7[:5],
    }
    return render(request, 'colaborador/portal.html', context)


@login_required
def holerite(request):
    """Lista de holerites do colaborador."""
    colab = _get_colaborador(request)
    if not colab:
        return redirect('core:dashboard')

    holerites = FolhaItem.objects.filter(colaborador=colab).select_related('folha').order_by('-folha__competencia')
    return render(request, 'colaborador/holerite.html', {
        'page_title': 'Meus Holerites',
        'colab':      colab,
        'holerites':  holerites,
    })


@login_required
def ferias_view(request):
    """Férias do colaborador — saldo e solicitações."""
    colab = _get_colaborador(request)
    if not colab:
        return redirect('core:dashboard')

    ferias_lista = Ferias.objects.filter(colaborador=colab).order_by('-created_at')
    sal   = Decimal(str(colab.salario_base))
    dep   = colab.dependentes.filter(ir=True).count()
    simulacao = calcular_ferias(sal, 30, 0, dep)

    return render(request, 'colaborador/ferias.html', {
        'page_title': 'Minhas Férias',
        'colab':      colab,
        'ferias':     ferias_lista,
        'simulacao':  simulacao,
    })


@login_required
def beneficios_view(request):
    """Benefícios ativos do colaborador."""
    colab = _get_colaborador(request)
    if not colab:
        return redirect('core:dashboard')

    benef = ColaboradorBeneficio.objects.filter(colaborador=colab, ativo=True).select_related('beneficio')
    return render(request, 'colaborador/beneficios.html', {
        'page_title': 'Meus Benefícios',
        'colab':      colab,
        'beneficios': benef,
    })


@login_required
def documentos_view(request):
    """Documentos do colaborador."""
    colab = _get_colaborador(request)
    if not colab:
        return redirect('core:dashboard')

    from apps.documentos.models import Documento
    docs = Documento.objects.filter(colaborador=colab).order_by('-created_at')
    return render(request, 'colaborador/documentos.html', {
        'page_title': 'Meus Documentos',
        'colab':      colab,
        'documentos': docs,
    })
