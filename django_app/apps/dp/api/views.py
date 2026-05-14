"""API REST do DP — endpoints para consumo pelo frontend."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsGestorOrRH
from apps.rh.models import Colaborador
from ..services import calcular_ferias, calcular_decimo, calcular_rescisao, calcular_liquido
from ..models import FolhaPagamento, Ferias
from decimal import Decimal
from datetime import date


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def calcular_view(request):
    """Endpoint de cálculo trabalhista via API REST."""
    tipo     = request.data.get('tipo')
    colab_id = request.data.get('colaborador_id')

    if not tipo or not colab_id:
        return Response({'success': False, 'message': 'tipo e colaborador_id são obrigatórios.'}, status=400)

    try:
        colab = Colaborador.objects.get(id=colab_id)
        sal   = Decimal(str(colab.salario_base))
        dep   = colab.dependentes.filter(ir=True).count()

        if tipo == 'ferias':
            resultado = calcular_ferias(sal, int(request.data.get('dias', 30)), int(request.data.get('abono', 0)), dep)
        elif tipo == 'decimo':
            resultado = calcular_decimo(sal, int(request.data.get('meses', 12)), dep)
        elif tipo == 'folha':
            resultado = calcular_liquido(sal, dep)
        elif tipo == 'rescisao':
            data_r = request.data.get('data_rescisao', date.today().isoformat())
            resultado = calcular_rescisao(
                sal, colab.data_admissao, date.fromisoformat(data_r),
                request.data.get('tipo_rescisao', 'sem_justa_causa'),
                int(request.data.get('ferias_vencidas', 30)),
                request.data.get('aviso_indenizado', False),
            )
        else:
            return Response({'success': False, 'message': f'Tipo "{tipo}" inválido.'}, status=400)

        resultado_serial = {k: float(v) if isinstance(v, Decimal) else v for k, v in resultado.items()}
        return Response({'success': True, 'resultado': resultado_serial, 'colaborador': colab.nome})

    except Colaborador.DoesNotExist:
        return Response({'success': False, 'message': 'Colaborador não encontrado.'}, status=404)
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def dashboard_view(request):
    """KPIs do DP para o dashboard."""
    from django.utils import timezone
    hoje  = timezone.now().date()
    inicio = hoje.replace(day=1)

    return Response({
        'success': True,
        'data': {
            'total_ativos':    Colaborador.objects.filter(status='ativo').count(),
            'ferias_pendentes':Ferias.objects.filter(status='pendente').count(),
            'folha_atual':     FolhaPagamento.objects.filter(competencia=hoje.strftime('%Y-%m')).values('competencia','status','total_liquido').first(),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def ferias_view(request):
    """Lista de férias para a API."""
    ferias = Ferias.objects.select_related('colaborador').values(
        'id', 'colaborador__nome', 'status', 'dias_solicitados', 'gozo_inicio', 'valor_liquido'
    ).order_by('-created_at')[:50]
    return Response({'success': True, 'data': list(ferias)})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def folha_view(request):
    """Histórico de folhas."""
    folhas = FolhaPagamento.objects.values(
        'id', 'competencia', 'status', 'total_bruto', 'total_liquido'
    ).order_by('-competencia')[:12]
    return Response({'success': True, 'data': list(folhas)})
