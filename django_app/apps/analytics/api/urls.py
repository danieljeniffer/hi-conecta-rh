from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsGestorOrRH
from ..services import calcular_score_risco_saida
from apps.rh.models import Colaborador


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def riscos_view(request):
    colabs = Colaborador.objects.filter(status='ativo').select_related('cargo')[:20]
    resultados = []
    for c in colabs:
        d = calcular_score_risco_saida(c)
        resultados.append({
            'id':    str(c.id), 'nome': c.nome,
            'cargo': str(c.cargo), 'depto': str(c.departamento),
            'score': d['score'], 'nivel': d['nivel'],
            'fatores': d['fatores'],
        })
    resultados.sort(key=lambda x: x['score'], reverse=True)
    return Response({'success': True, 'data': resultados})


urlpatterns = [
    path('riscos/', riscos_view, name='api_riscos'),
]
