from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.dp.services import calcular_ferias, calcular_liquido
from apps.dp.models import FolhaItem, Ferias, ColaboradorBeneficio
from decimal import Decimal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meu_holerite(request):
    colab = getattr(request.user, 'colaborador', None)
    if not colab:
        return Response({'success': False, 'message': 'Sem colaborador vinculado.'}, status=400)

    competencia = request.GET.get('competencia', '')
    if competencia:
        try:
            item = FolhaItem.objects.get(colaborador=colab, folha__competencia=competencia)
            return Response({'success': True, 'data': {
                'competencia':   item.folha.competencia,
                'salario_base':  float(item.salario_base),
                'inss':          float(item.inss),
                'irrf':          float(item.irrf),
                'fgts':          float(item.fgts),
                'total_bruto':   float(item.total_bruto),
                'total_liquido': float(item.total_liquido),
            }})
        except FolhaItem.DoesNotExist:
            return Response({'success': False, 'message': 'Holerite não encontrado.'}, status=404)

    # Lista de competências disponíveis
    holerites = FolhaItem.objects.filter(colaborador=colab).values_list('folha__competencia', flat=True).order_by('-folha__competencia')[:12]
    return Response({'success': True, 'data': list(holerites)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minhas_ferias(request):
    colab = getattr(request.user, 'colaborador', None)
    if not colab:
        return Response({'success': False, 'message': 'Sem colaborador.'}, status=400)

    ferias = Ferias.objects.filter(colaborador=colab).values(
        'id','status','dias_solicitados','gozo_inicio','gozo_fim','valor_liquido'
    ).order_by('-created_at')
    return Response({'success': True, 'data': list(ferias)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meus_beneficios(request):
    colab = getattr(request.user, 'colaborador', None)
    if not colab:
        return Response({'success': False, 'message': 'Sem colaborador.'}, status=400)

    bens = ColaboradorBeneficio.objects.filter(colaborador=colab, ativo=True).values(
        'beneficio__nome', 'beneficio__fornecedor', 'valor_empresa', 'valor_colab', 'data_inicio'
    )
    return Response({'success': True, 'data': list(bens)})


urlpatterns = [
    path('holerite/',  meu_holerite,  name='api_holerite'),
    path('ferias/',    minhas_ferias, name='api_ferias'),
    path('beneficios/',meus_beneficios, name='api_beneficios'),
]
