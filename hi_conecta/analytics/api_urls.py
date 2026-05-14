"""analytics/api_urls.py — API REST de People Analytics."""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsRH, IsAnalista
from .models import (
    MetricaOrganizacional, ScoreColaborador, ScoreSetor,
    AlertaInteligente, PrevisaoTurnover,
)
from .serializers import (
    MetricaOrganizacionalSerializer, ScoreColaboradorSerializer,
    ScoreSetorSerializer, AlertaInteligenteSerializer, PrevisaoTurnoverSerializer,
)
from .services import (
    TurnoverService, EngajamentoService, RiscoDesligamentoService,
    ScoreOrganizacionalService, JusticaCorporativaService,
)
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def dashboard_kpis(request):
    ref  = timezone.now().date().strftime('%Y-%m')
    hoje = timezone.now().date()
    from datetime import date
    inicio = date(hoje.year, hoje.month, 1)

    from django.db.models import Avg
    return Response({
        'sucesso': True,
        'dados': {
            'score_engajamento_medio': ScoreColaborador.objects.filter(
                dimensao='engajamento', referencia=ref
            ).aggregate(m=Avg('score'))['m'],
            'score_geral_medio': ScoreColaborador.objects.filter(
                dimensao='geral', referencia=ref
            ).aggregate(m=Avg('score'))['m'],
            'alertas_criticos': AlertaInteligente.objects.filter(
                status='ativo', prioridade='critica', deleted_at__isnull=True
            ).count(),
            'turnover_mes': TurnoverService.calcular_taxa(inicio, hoje),
            'enps': EngajamentoService.eNPS_organizacional(ref),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def scores_colaboradores(request):
    ref    = request.query_params.get('ref', timezone.now().date().strftime('%Y-%m'))
    dimensao = request.query_params.get('dimensao', 'geral')
    dept_id  = request.query_params.get('departamento')

    qs = ScoreColaborador.objects.filter(dimensao=dimensao, referencia=ref)
    if dept_id:
        qs = qs.filter(colaborador__departamento_id=dept_id)
    qs = qs.select_related('colaborador').order_by('-score')[:50]
    return Response({'sucesso': True, 'dados': ScoreColaboradorSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def scores_setores(request):
    ref = request.query_params.get('ref', timezone.now().date().strftime('%Y-%m'))
    qs  = ScoreSetor.objects.filter(referencia=ref).select_related('departamento').order_by('-score_geral')
    return Response({'sucesso': True, 'dados': ScoreSetorSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def alertas_list(request):
    qs = AlertaInteligente.objects.filter(deleted_at__isnull=True)
    status = request.query_params.get('status', 'ativo')
    tipo   = request.query_params.get('tipo')
    prio   = request.query_params.get('prioridade')
    if status:  qs = qs.filter(status=status)
    if tipo:    qs = qs.filter(tipo=tipo)
    if prio:    qs = qs.filter(prioridade=prio)
    qs = qs.select_related('colaborador', 'departamento').order_by('-created_at')[:100]
    return Response({
        'sucesso': True,
        'dados':   AlertaInteligenteSerializer(qs, many=True).data,
        'nao_lidos': AlertaInteligente.objects.filter(status='ativo', deleted_at__isnull=True).count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRH])
def alerta_resolver(request, pk):
    try:
        alerta = AlertaInteligente.objects.get(pk=pk, deleted_at__isnull=True)
    except AlertaInteligente.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Alerta não encontrado.'}, status=404)
    acao = request.data.get('acao', 'resolver')
    if acao == 'resolver':
        alerta.resolver()
    elif acao == 'ignorar':
        alerta.status = 'ignorado'
        alerta.save(update_fields=['status'])
    else:
        alerta.marcar_lido(request.user)
    return Response({'sucesso': True, 'status': alerta.status})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def previsoes_turnover(request):
    ref    = request.query_params.get('ref', timezone.now().date().strftime('%Y-%m'))
    nivel  = request.query_params.get('nivel')
    qs     = PrevisaoTurnover.objects.filter(referencia=ref, deleted_at__isnull=True)
    if nivel:
        qs = qs.filter(nivel_risco=nivel)
    qs = qs.select_related('colaborador', 'colaborador__departamento').order_by('-probabilidade')[:50]
    return Response({'sucesso': True, 'dados': PrevisaoTurnoverSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def risco_colaborador(request, colaborador_id):
    from rh.models import Colaborador
    try:
        colab = Colaborador.objects.get(pk=colaborador_id, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Colaborador não encontrado.'}, status=404)
    return Response({'sucesso': True, 'dados': RiscoDesligamentoService.calcular(colab)})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def turnover_por_dept(request):
    ref = request.query_params.get('ref', timezone.now().date().strftime('%Y-%m'))
    return Response({'sucesso': True, 'dados': TurnoverService.turnover_por_departamento(ref)})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def equidade_salarial(request):
    cargo_id = request.query_params.get('cargo_id')
    if cargo_id:
        return Response({'sucesso': True, 'dados': JusticaCorporativaService.analise_salarial_cargo(cargo_id)})
    return Response({'sucesso': True, 'dados': JusticaCorporativaService.ranking_equidade_departamentos()})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRH])
def rodar_analise(request):
    ref = request.data.get('referencia', timezone.now().date().strftime('%Y-%m'))
    ScoreOrganizacionalService.rodar_analise_completa(ref)
    return Response({'sucesso': True, 'mensagem': f'Análise para {ref} concluída.'})


urlpatterns = [
    path('dashboard/',                         dashboard_kpis,         name='api_analytics_dashboard'),
    path('scores/colaboradores/',              scores_colaboradores,   name='api_scores_colab'),
    path('scores/setores/',                    scores_setores,         name='api_scores_setor'),
    path('alertas/',                           alertas_list,           name='api_alertas'),
    path('alertas/<uuid:pk>/acao/',            alerta_resolver,        name='api_alerta_acao'),
    path('turnover/',                          previsoes_turnover,     name='api_turnover'),
    path('turnover/por-departamento/',         turnover_por_dept,      name='api_turnover_dept'),
    path('risco/<uuid:colaborador_id>/',       risco_colaborador,      name='api_risco_colab'),
    path('equidade/',                          equidade_salarial,      name='api_equidade'),
    path('analise/rodar/',                     rodar_analise,          name='api_rodar_analise'),
]
