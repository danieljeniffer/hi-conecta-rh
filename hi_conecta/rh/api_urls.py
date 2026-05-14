"""rh/api_urls.py — Endpoints REST do app RH."""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsGestorOuRH, IsRH
from .models import Colaborador, Departamento, Cargo, AvaliacaoDesempenho
from .serializers import (
    ColaboradorListSerializer, ColaboradorDetalheSerializer,
    ColaboradorCreateSerializer, DepartamentoSerializer, CargoSerializer,
    AvaliacaoSerializer,
)
from .services import ColaboradorService, DashboardRHService
from core.pagination import PaginacaoPadrao
from django.db.models import Q, Count


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def colaboradores_list(request):
    if request.method == 'GET':
        qs = Colaborador.objects.filter(deleted_at__isnull=True).select_related('cargo','departamento')
        if request.user.perfil == 'gestor':
            cid = getattr(request.user, 'colaborador_id', None)
            if cid:
                qs = qs.filter(Q(departamento__gestor_id=cid)|Q(gestor_id=cid))
        busca  = request.query_params.get('busca')
        status = request.query_params.get('status')
        if busca:
            qs = qs.filter(Q(nome__icontains=busca)|Q(cpf__icontains=busca))
        if status:
            qs = qs.filter(status=status)
        qs = qs.order_by(request.query_params.get('ordenar','nome'))
        paginacao = PaginacaoPadrao()
        page = paginacao.paginate_queryset(qs, request)
        if page is not None:
            return paginacao.get_paginated_response(ColaboradorListSerializer(page, many=True).data)
        return Response({'sucesso': True, 'dados': ColaboradorListSerializer(qs, many=True).data})
    if request.user.perfil not in ('admin','rh','analista'):
        return Response({'sucesso': False, 'mensagem': 'Sem permissão.'}, status=403)
    ser = ColaboradorCreateSerializer(data=request.data)
    if ser.is_valid():
        colab = ColaboradorService.admitir(ser.validated_data, usuario=request.user)
        return Response({'sucesso': True, 'dados': ColaboradorDetalheSerializer(colab).data}, status=201)
    return Response({'sucesso': False, 'erros': ser.errors}, status=400)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def colaborador_detail(request, pk):
    try:
        colab = Colaborador.objects.get(pk=pk, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Não encontrado.'}, status=404)
    if not colab.pode_visualizar(request.user):
        return Response({'sucesso': False, 'mensagem': 'Sem permissão.'}, status=403)
    if request.method == 'GET':
        return Response({'sucesso': True, 'dados': ColaboradorDetalheSerializer(colab).data})
    if request.user.perfil not in ('admin','rh','analista'):
        return Response({'sucesso': False, 'mensagem': 'Sem permissão para editar.'}, status=403)
    if request.method in ('PUT','PATCH'):
        ser = ColaboradorCreateSerializer(colab, data=request.data, partial=request.method=='PATCH')
        if ser.is_valid():
            colab = ser.save(atualizado_por=request.user)
            return Response({'sucesso': True, 'dados': ColaboradorDetalheSerializer(colab).data})
        return Response({'sucesso': False, 'erros': ser.errors}, status=400)
    colab.deletar()
    return Response({'sucesso': True}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def colaborador_timeline(request, pk):
    try:
        colab = Colaborador.objects.get(pk=pk, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Não encontrado.'}, status=404)
    if not colab.pode_visualizar(request.user):
        return Response({'sucesso': False, 'mensagem': 'Sem permissão.'}, status=403)
    tl = [{**ev, 'data': ev['data'].isoformat() if hasattr(ev.get('data'),'isoformat') else ev.get('data')} for ev in colab.timeline()]
    return Response({'sucesso': True, 'dados': tl})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def colaborador_kpis(request):
    return Response({'sucesso': True, 'dados': DashboardRHService.kpis(request.user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def departamentos_list(request):
    qs = Departamento.objects.filter(ativo=True, deleted_at__isnull=True).annotate(
        headcount=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))
    ).order_by('nome')
    return Response({'sucesso': True, 'dados': DepartamentoSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organograma_api(request):
    raizes = Departamento.objects.filter(pai__isnull=True, ativo=True, deleted_at__isnull=True)
    return Response({'sucesso': True, 'dados': {'nome': 'Empresa', 'filhos': [d.para_arvore() for d in raizes]}})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cargos_list(request):
    qs = Cargo.objects.filter(ativo=True, deleted_at__isnull=True).annotate(
        headcount=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))
    ).order_by('nome')
    return Response({'sucesso': True, 'dados': CargoSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def indicadores_api(request):
    return Response({'sucesso': True, 'dados': DashboardRHService.indicadores(request.user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def avaliacoes_api(request):
    qs = AvaliacaoDesempenho.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-prazo')[:50]
    return Response({'sucesso': True, 'dados': AvaliacaoSerializer(qs, many=True).data})


urlpatterns = [
    path('colaboradores/',                      colaboradores_list,    name='api_colaboradores'),
    path('colaboradores/kpis/',                 colaborador_kpis,      name='api_colaboradores_kpis'),
    path('colaboradores/<uuid:pk>/',            colaborador_detail,    name='api_colaborador_detail'),
    path('colaboradores/<uuid:pk>/timeline/',   colaborador_timeline,  name='api_colaborador_timeline'),
    path('departamentos/',                      departamentos_list,    name='api_departamentos'),
    path('departamentos/organograma/',          organograma_api,       name='api_organograma'),
    path('cargos/',                             cargos_list,           name='api_cargos'),
    path('indicadores/',                        indicadores_api,       name='api_indicadores_rh'),
    path('avaliacoes/',                         avaliacoes_api,        name='api_avaliacoes'),
]
