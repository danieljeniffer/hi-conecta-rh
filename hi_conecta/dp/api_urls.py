"""dp/api_urls.py — API REST do Departamento Pessoal."""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsRH, IsGestorOuRH
from .models import FolhaPagamento, FolhaItem, Ferias, Rescisao, Beneficio, NotificacaoDP
from .serializers import (
    FolhaPagamentoSerializer, FolhaItemSerializer,
    FeriasSerializer, RescisaoSerializer, BeneficioSerializer,
    NotificacaoDPSerializer,
)
from .services import CLTService, FeriasService, DecimoTerceiroService, RescisaoService, SimulacaoService
from decimal import Decimal
from datetime import date


def _d(v): return Decimal(str(v or 0))
def _s(obj):
    if isinstance(obj, dict):
        return {k: _s(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_s(i) for i in obj]
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    return obj


# ── Folha ──────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def folhas_list(request):
    qs  = FolhaPagamento.objects.filter(deleted_at__isnull=True).order_by('-competencia')[:24]
    return Response({'sucesso': True, 'dados': FolhaPagamentoSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def folha_itens(request, pk):
    try:
        folha = FolhaPagamento.objects.get(pk=pk, deleted_at__isnull=True)
    except FolhaPagamento.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Não encontrada.'}, status=404)
    itens = FolhaItem.objects.filter(folha=folha).select_related('colaborador')
    return Response({'sucesso': True, 'dados': FolhaItemSerializer(itens, many=True).data})


# ── Férias ─────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def ferias_list(request):
    qs = Ferias.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-created_at')[:100]
    status = request.query_params.get('status')
    if status:
        qs = qs.filter(status=status)
    return Response({'sucesso': True, 'dados': FeriasSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ferias_simular(request):
    sal  = float(request.query_params.get('salario', 0))
    dias = int(request.query_params.get('dias', 30))
    abono = int(request.query_params.get('abono', 0))
    dep   = int(request.query_params.get('dependentes', 0))
    if not sal:
        return Response({'sucesso': False, 'mensagem': 'Informe o salário.'}, status=400)
    return Response({'sucesso': True, 'resultado': _s(FeriasService.calcular(sal, dias, abono, dep))})


# ── Rescisão ───────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRH])
def rescisoes_list(request):
    qs = Rescisao.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-data_demissao')[:100]
    return Response({'sucesso': True, 'dados': RescisaoSerializer(qs, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def rescisao_simular(request):
    from rh.models import Colaborador
    cid      = request.data.get('colaborador_id')
    tipo     = request.data.get('tipo', 'sem_justa_causa')
    data_dem = date.fromisoformat(request.data.get('data_demissao', date.today().isoformat()))
    aviso    = request.data.get('aviso_indenizado', False)
    try:
        colab = Colaborador.objects.get(id=cid, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return Response({'sucesso': False, 'mensagem': 'Colaborador não encontrado.'}, status=404)
    calc = RescisaoService.calcular(colab, tipo, data_dem, aviso_indenizado=aviso)
    return Response({'sucesso': True, 'resultado': _s(calc), 'colaborador': colab.nome})


# ── Cálculo CLT genérico ───────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calcular(request):
    tipo    = request.data.get('tipo')
    salario = float(request.data.get('salario', 0))
    dep     = int(request.data.get('dependentes', 0))

    if not tipo or not salario:
        return Response({'sucesso': False, 'mensagem': 'Tipo e salário obrigatórios.'}, status=400)

    if tipo == 'inss':
        return Response({'sucesso': True, 'inss': float(CLTService.calcular_inss(salario))})
    elif tipo == 'liquido':
        return Response({'sucesso': True, 'resultado': _s(CLTService.calcular_liquido(salario, dep))})
    elif tipo == 'ferias':
        dias  = int(request.data.get('dias', 30))
        abono = int(request.data.get('abono', 0))
        return Response({'sucesso': True, 'resultado': _s(FeriasService.calcular(salario, dias, abono, dep))})
    elif tipo == 'decimo':
        meses   = int(request.data.get('meses', 12))
        parcela = request.data.get('parcela', '2')
        return Response({'sucesso': True, 'resultado': _s(DecimoTerceiroService.calcular(salario, meses, parcela, dep))})
    elif tipo == 'simulacao':
        novo_sal = float(request.data.get('novo_salario', salario))
        return Response({'sucesso': True, 'resultado': _s(SimulacaoService.simular_reajuste(salario, novo_sal, dep))})

    return Response({'sucesso': False, 'mensagem': f'Tipo "{tipo}" inválido.'}, status=400)


# ── Benefícios ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def beneficios_list(request):
    qs = Beneficio.objects.filter(ativo=True, deleted_at__isnull=True).order_by('tipo','nome')
    return Response({'sucesso': True, 'dados': BeneficioSerializer(qs, many=True).data})


# ── Notificações ───────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def notificacoes_list(request):
    qs = NotificacaoDP.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-created_at')[:50]
    if request.query_params.get('nao_lidas'):
        qs = qs.filter(lida=False)
    return Response({'sucesso': True, 'dados': NotificacaoDPSerializer(qs, many=True).data, 'nao_lidas': qs.filter(lida=False).count()})


# ── Dashboard DP ───────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGestorOuRH])
def dashboard_dp(request):
    from django.utils import timezone
    hoje = timezone.now().date()
    return Response({
        'sucesso': True,
        'dados': {
            'ferias_pendentes':    Ferias.objects.filter(status='pendente', deleted_at__isnull=True).count(),
            'ferias_vencendo_60':  FeriasService.verificar_ferias_vencendo(60).count(),
            'rescisoes_abertas':   Rescisao.objects.filter(status__in=['rascunho','calculada'], deleted_at__isnull=True).count(),
            'notificacoes_criticas': NotificacaoDP.objects.filter(lida=False, prioridade='critica').count(),
            'folha_atual':         FolhaPagamentoSerializer(
                FolhaPagamento.objects.filter(competencia=hoje.strftime('%Y-%m')).first()
            ).data if FolhaPagamento.objects.filter(competencia=hoje.strftime('%Y-%m')).exists() else None,
        }
    })


urlpatterns = [
    path('calcular/',             calcular,        name='api_dp_calcular'),
    path('folhas/',               folhas_list,     name='api_folhas'),
    path('folhas/<uuid:pk>/itens/', folha_itens,   name='api_folha_itens'),
    path('ferias/',               ferias_list,     name='api_ferias'),
    path('ferias/simular/',       ferias_simular,  name='api_ferias_simular'),
    path('rescisoes/',            rescisoes_list,  name='api_rescisoes'),
    path('rescisoes/simular/',    rescisao_simular,name='api_rescisao_simular'),
    path('beneficios/',           beneficios_list, name='api_beneficios'),
    path('notificacoes/',         notificacoes_list,name='api_notificacoes'),
    path('dashboard/',            dashboard_dp,    name='api_dp_dashboard'),
]
