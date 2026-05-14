"""analytics/serializers.py"""
from rest_framework import serializers
from .models import (
    MetricaOrganizacional, ScoreColaborador, ScoreSetor,
    AlertaInteligente, PrevisaoTurnover, SnapshotAbsenteismo,
)


class MetricaOrganizacionalSerializer(serializers.ModelSerializer):
    variacao     = serializers.SerializerMethodField()
    atingiu_meta = serializers.SerializerMethodField()

    class Meta:
        model  = MetricaOrganizacional
        fields = '__all__'

    def get_variacao(self, obj):     return obj.variacao
    def get_atingiu_meta(self, obj): return obj.atingiu_meta


class ScoreColaboradorSerializer(serializers.ModelSerializer):
    nivel    = serializers.SerializerMethodField()
    tendencia= serializers.SerializerMethodField()
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)

    class Meta:
        model  = ScoreColaborador
        fields = '__all__'

    def get_nivel(self, obj):    return obj.nivel
    def get_tendencia(self, obj): return obj.tendencia


class ScoreSetorSerializer(serializers.ModelSerializer):
    departamento_nome = serializers.CharField(source='departamento.nome', read_only=True)

    class Meta:
        model  = ScoreSetor
        fields = '__all__'


class AlertaInteligenteSerializer(serializers.ModelSerializer):
    colaborador_nome  = serializers.CharField(source='colaborador.nome', read_only=True)
    departamento_nome = serializers.CharField(source='departamento.nome', read_only=True)

    class Meta:
        model  = AlertaInteligente
        fields = '__all__'


class PrevisaoTurnoverSerializer(serializers.ModelSerializer):
    colaborador_nome  = serializers.CharField(source='colaborador.nome', read_only=True)
    departamento_nome = serializers.CharField(source='colaborador.departamento.nome', read_only=True)

    class Meta:
        model  = PrevisaoTurnover
        fields = '__all__'


class SnapshotAbsenteismoSerializer(serializers.ModelSerializer):
    colaborador_nome = serializers.CharField(source='colaborador.nome', read_only=True)

    class Meta:
        model  = SnapshotAbsenteismo
        fields = '__all__'
