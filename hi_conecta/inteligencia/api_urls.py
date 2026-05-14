"""inteligencia/api_urls.py — API REST de IA Organizacional."""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from accounts.permissions import IsAnalista
from .models import DNACorporativo, ModoFantasma, PrevisaoRHTemporal, ConsultaIAExecutiva, SimulacaoFuturoCorporativo
from .services import DNACorporativoService, ModoFantasmaService, RHTemporalService, IAExecutivaService, SimuladorFuturoService
from django.utils import timezone


class DNASerializer(serializers.ModelSerializer):
    class Meta:
        model  = DNACorporativo
        fields = '__all__'

class FantasmaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ModoFantasma
        exclude = ['colaboradores_envolvidos', 'departamentos_envolvidos']

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConsultaIAExecutiva
        fields = ['id', 'categoria', 'pergunta', 'resposta', 'modelo_usado',
                  'tokens_usados', 'tempo_resposta_ms', 'created_at', 'avaliacao_usuario']

class SimulacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SimulacaoFuturoCorporativo
        fields = '__all__'


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAnalista])
def dna_list(request):
    ref = request.query_params.get('ref')
    qs  = DNACorporativo.objects.order_by('-referencia')
    if ref:
        qs = qs.filter(referencia=ref)
    return Response({'sucesso': True, 'dados': DNASerializer(qs[:12], many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAnalista])
def dna_calcular(request):
    ref = request.data.get('referencia', timezone.now().date().strftime('%Y-%m'))
    dna = DNACorporativoService.calcular(ref)
    return Response({'sucesso': True, 'dados': DNASerializer(dna).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAnalista])
def fantasma_list(request):
    ref    = request.query_params.get('ref', timezone.now().date().strftime('%Y-%m'))
    lido   = request.query_params.get('lido')
    qs     = ModoFantasma.objects.filter(referencia=ref).order_by('-created_at')
    if lido is not None:
        qs = qs.filter(lido=lido == 'true')
    return Response({'sucesso': True, 'dados': FantasmaSerializer(qs[:50], many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAnalista])
def fantasma_detectar(request):
    ref     = request.data.get('referencia', timezone.now().date().strftime('%Y-%m'))
    novos   = ModoFantasmaService.detectar(ref)
    return Response({'sucesso': True, 'novos': len(novos), 'mensagem': f'{len(novos)} insights detectados.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAnalista])
def ia_consultar(request):
    pergunta  = request.data.get('pergunta', '').strip()
    categoria = request.data.get('categoria', 'geral')
    if not pergunta:
        return Response({'sucesso': False, 'mensagem': 'Pergunta obrigatória.'}, status=400)
    contexto = IAExecutivaService.contexto_organizacional()
    consulta = IAExecutivaService.consultar(pergunta, contexto, request.user, categoria)
    return Response({
        'sucesso':  True,
        'resposta': consulta.resposta,
        'modelo':   consulta.modelo_usado,
        'tokens':   consulta.tokens_usados,
        'id':       str(consulta.id),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAnalista])
def ia_historico(request):
    qs = ConsultaIAExecutiva.objects.filter(usuario=request.user).order_by('-created_at')[:20]
    return Response({'sucesso': True, 'dados': ConsultaSerializer(qs, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAnalista])
def simulador_executar(request):
    cenario = request.data.get('cenario', 'personalizado')
    params  = request.data.get('parametros', {})
    params['nome'] = request.data.get('nome', f'Simulação {cenario}')
    sim = SimuladorFuturoService.simular(cenario, params, request.user)
    return Response({'sucesso': True, 'dados': SimulacaoSerializer(sim).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAnalista])
def simulacoes_list(request):
    qs = SimulacaoFuturoCorporativo.objects.filter(usuario=request.user).order_by('-created_at')[:20]
    return Response({'sucesso': True, 'dados': SimulacaoSerializer(qs, many=True).data})


urlpatterns = [
    path('dna/',                  dna_list,           name='api_dna_list'),
    path('dna/calcular/',         dna_calcular,       name='api_dna_calcular'),
    path('fantasma/',             fantasma_list,      name='api_fantasma_list'),
    path('fantasma/detectar/',    fantasma_detectar,  name='api_fantasma_detectar'),
    path('ia/consultar/',         ia_consultar,       name='api_ia_consultar'),
    path('ia/historico/',         ia_historico,       name='api_ia_historico'),
    path('simulador/',            simulacoes_list,    name='api_simulacoes'),
    path('simulador/executar/',   simulador_executar, name='api_simulador_executar'),
]
