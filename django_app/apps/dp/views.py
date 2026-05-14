"""apps/dp/views.py — Views do Departamento Pessoal."""
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from decimal import Decimal
from .models import FolhaPagamento, Ferias, Rescisao, BeneficioCategoria, NotificacaoDP
from .services import calcular_ferias, calcular_decimo, calcular_rescisao, calcular_liquido
from apps.rh.models import Colaborador
from apps.core.permissions import requer_nivel, requer_permissao
from apps.core.models import AuditLog
import logging

logger = logging.getLogger('apps')


@login_required
@requer_nivel('analista')
def hub(request):
    """Hub do DP com visão geral."""
    colabs = Colaborador.objects.filter(status='ativo').count()
    folha_atual = FolhaPagamento.objects.first()
    ferias_pend = Ferias.objects.filter(status='pendente').count()
    alertas     = NotificacaoDP.objects.filter(lida=False, prioridade__in=['critica','alta']).count()

    return render(request, 'dp/hub.html', {
        'page_title':  'Departamento Pessoal',
        'colabs':      colabs,
        'folha_atual': folha_atual,
        'ferias_pend': ferias_pend,
        'alertas':     alertas,
    })


@login_required
@requer_nivel('analista')
def central(request):
    """Central Trabalhista — cálculos rápidos."""
    colabs = Colaborador.objects.filter(status='ativo').select_related('cargo', 'departamento').order_by('nome')
    return render(request, 'dp/central.html', {
        'page_title': 'Central Trabalhista',
        'colabs':     colabs,
    })


@login_required
@requer_nivel('analista')
@require_POST
def api_calcular(request):
    """Endpoint AJAX para cálculos rápidos na Central."""
    tipo   = request.POST.get('tipo')
    colab_id = request.POST.get('colaborador_id')

    if not tipo or not colab_id:
        return JsonResponse({'success': False, 'message': 'Tipo e colaborador obrigatórios.'}, status=400)

    try:
        colab = get_object_or_404(Colaborador, id=colab_id)
        sal   = Decimal(str(colab.salario_base))
        dep   = colab.dependentes.filter(ir=True).count()
        resultado = {}

        if tipo == 'ferias':
            dias  = int(request.POST.get('dias', 30))
            abono = int(request.POST.get('abono', 0))
            resultado = calcular_ferias(sal, dias, abono, dep)

        elif tipo == 'decimo':
            meses = int(request.POST.get('meses', 12))
            resultado = calcular_decimo(sal, meses, dep)

        elif tipo == 'rescisao':
            from datetime import date
            tipo_rescisao = request.POST.get('tipo_rescisao', 'sem_justa_causa')
            data_rescisao = date.fromisoformat(request.POST.get('data_rescisao', date.today().isoformat()))
            aviso_ind     = request.POST.get('aviso_indenizado') == 'true'
            ferias_venc   = int(request.POST.get('ferias_vencidas', 30))
            resultado = calcular_rescisao(sal, colab.data_admissao, data_rescisao, tipo_rescisao, ferias_venc, aviso_ind)

        elif tipo == 'folha':
            resultado = calcular_liquido(sal, dep)

        # Serializa Decimal
        resultado = {k: float(v) if isinstance(v, Decimal) else v for k, v in resultado.items()}

        AuditLog.objects.create(
            usuario=request.user, acao='CALCULAR', recurso='dp_central',
            recurso_id=str(colab.id),
            dados_depois={'tipo': tipo, 'colaborador': colab.nome},
            ip=request.META.get('REMOTE_ADDR'),
        )

        return JsonResponse({'success': True, 'resultado': resultado, 'colaborador': colab.nome})

    except Exception as e:
        logger.exception('Erro no cálculo DP: %s', e)
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required
@requer_nivel('analista')
def ferias_lista(request):
    ferias = Ferias.objects.select_related('colaborador').order_by('-created_at')
    return render(request, 'dp/ferias_lista.html', {'page_title': 'Férias', 'ferias': ferias})


@login_required
@requer_nivel('analista')
def folha_lista(request):
    folhas = FolhaPagamento.objects.all()
    return render(request, 'dp/folha_lista.html', {'page_title': 'Folha de Pagamento', 'folhas': folhas})


@login_required
@requer_nivel('analista')
def rescisao_lista(request):
    rescisoes = Rescisao.objects.select_related('colaborador').order_by('-data_demissao')
    return render(request, 'dp/rescisao_lista.html', {'page_title': 'Rescisões', 'rescisoes': rescisoes})


@login_required
def holerite_colab(request, competencia):
    """Holerite individual do colaborador logado."""
    if not hasattr(request.user, 'colaborador') or not request.user.colaborador:
        messages.error(request, 'Você não tem colaborador vinculado.')
        return redirect('core:dashboard')

    try:
        item = request.user.colaborador.folha_itens.get(folha__competencia=competencia)
    except Exception:
        messages.warning(request, f'Holerite de {competencia} não encontrado.')
        return redirect('colaborador:portal')

    return render(request, 'dp/holerite.html', {'page_title': f'Holerite {competencia}', 'item': item})
