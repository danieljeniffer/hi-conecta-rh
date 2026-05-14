"""dp/serializers.py — Serializers DRF do DP."""
from rest_framework import serializers
from .models import FolhaPagamento, FolhaItem, Ferias, Rescisao, Beneficio, DecimoTerceiro, NotificacaoDP


class FolhaPagamentoSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = FolhaPagamento
        fields = ['id','competencia','status','status_display','total_bruto',
                  'total_liquido','total_fgts','total_inss','total_irrf','total_colabs','fechado_em']


class FolhaItemSerializer(serializers.ModelSerializer):
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)

    class Meta:
        model  = FolhaItem
        fields = ['id','colaborador','colaborador_nome','salario_base','dias_trabalhados',
                  'valor_he','faltas','inss','irrf','fgts','plano_saude','vale_transporte',
                  'total_bruto','total_liquido','memoria_calculo']


class FeriasSerializer(serializers.ModelSerializer):
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Ferias
        fields = ['id','colaborador','colaborador_nome','periodo_inicio','periodo_fim',
                  'gozo_inicio','gozo_fim','dias_solicitados','dias_abono',
                  'valor_ferias','valor_terco','valor_liquido',
                  'status','status_display','aprovado_por','aprovado_em']


class RescisaoSerializer(serializers.ModelSerializer):
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)
    tipo_display     = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Rescisao
        fields = ['id','colaborador','colaborador_nome','tipo','tipo_display',
                  'data_demissao','aviso_previo_dias','aviso_indenizado',
                  'total_bruto','total_liquido','status','status_display',
                  'memoria_calculo','progresso_wizard']


class BeneficioSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model  = Beneficio
        fields = ['id','nome','tipo','tipo_display','fornecedor',
                  'valor_empresa','valor_colab','recorrencia','ativo']


class NotificacaoDPSerializer(serializers.ModelSerializer):
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    colaborador_nome   = serializers.CharField(source='colaborador.nome', read_only=True, allow_null=True)

    class Meta:
        model  = NotificacaoDP
        fields = ['id','tipo','titulo','mensagem','prioridade','prioridade_display',
                  'colaborador_nome','lida','lida_em','created_at','acao_url']


class CalculoResponseSerializer(serializers.Serializer):
    """Serializer genérico para respostas de cálculo CLT."""
    sucesso       = serializers.BooleanField()
    resultado     = serializers.DictField()
    colaborador   = serializers.CharField()
    salario_base  = serializers.FloatField()
