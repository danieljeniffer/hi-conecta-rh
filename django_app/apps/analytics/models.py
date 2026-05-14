"""
apps/analytics/models.py — People Analytics e IA Organizacional.
Score colaborador, risco turnover, burnout, DNA corporativo.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.rh.models import Colaborador, Departamento


class ScoreColaborador(BaseModel):
    """Score calculado diariamente por IA para cada colaborador."""
    NIVEIS = [('critico','Crítico'),('alto','Alto'),('medio','Médio'),('baixo','Baixo')]

    colaborador        = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='scores')
    score_risco_saida  = models.IntegerField(default=0)  # 0–100
    nivel_risco        = models.CharField(max_length=10, choices=NIVEIS, default='baixo')
    score_engajamento  = models.IntegerField(default=50)
    score_burnout      = models.IntegerField(default=0)
    score_satisfacao   = models.IntegerField(default=50)
    score_produtividade= models.IntegerField(default=50)
    fatores_json       = models.JSONField(default=dict)
    calculado_em       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_score_colaborador'
        ordering = ['-calculado_em']
        get_latest_by = 'calculado_em'

    def __str__(self):
        return f'{self.colaborador.nome} — Risco: {self.score_risco_saida}%'


class ScoreSetor(BaseModel):
    """Score de saúde organizacional por departamento."""
    departamento       = models.ForeignKey(Departamento, on_delete=models.CASCADE, related_name='scores')
    score_clima        = models.IntegerField(default=50)
    score_produtividade= models.IntegerField(default=50)
    score_engajamento  = models.IntegerField(default=50)
    turnover_mensal    = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    absenteismo        = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    calculado_em       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_score_setor'
        ordering = ['-calculado_em']


class EntrevistaDesligamento(BaseModel):
    """Entrevista de saída — Exit Intelligence."""
    MOTIVOS = [
        ('salario',       'Salário Abaixo do Mercado'),
        ('lideranca',     'Problemas com Liderança'),
        ('crescimento',   'Falta de Crescimento'),
        ('clima',         'Clima Organizacional'),
        ('proposta',      'Melhor Proposta'),
        ('pessoal',       'Razões Pessoais'),
        ('outro',         'Outro'),
    ]

    colaborador    = models.OneToOneField(Colaborador, on_delete=models.CASCADE, related_name='entrevista_saida')
    motivo_saida   = models.CharField(max_length=20, choices=MOTIVOS)
    satisfacao_geral = models.IntegerField(default=3)  # 1–5
    satisfacao_lider = models.IntegerField(default=3)
    satisfacao_salario = models.IntegerField(default=3)
    satisfacao_cultura = models.IntegerField(default=3)
    recomendaria     = models.BooleanField(default=True)
    retornaria       = models.BooleanField(default=False)
    pontos_positivos = models.TextField(blank=True)
    pontos_negativos = models.TextField(blank=True)
    sugestoes        = models.TextField(blank=True)
    insights_ia      = models.JSONField(default=dict)
    realizada_em     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_entrevista_desligamento'

    def __str__(self):
        return f'Entrevista — {self.colaborador.nome}'


class InsightOrganizacional(BaseModel):
    """Insights gerados pela IA sobre a saúde da organização."""
    TIPOS = [
        ('turnover',    'Risco Turnover'),
        ('burnout',     'Risco Burnout'),
        ('clima',       'Clima Organizacional'),
        ('lideranca',   'Análise de Liderança'),
        ('cultura',     'DNA Cultural'),
        ('shadow',      'Shadow Organization'),
    ]

    tipo       = models.CharField(max_length=20, choices=TIPOS)
    titulo     = models.CharField(max_length=200)
    descricao  = models.TextField()
    dados      = models.JSONField(default=dict)
    score      = models.IntegerField(null=True, blank=True)
    urgencia   = models.CharField(max_length=10, default='normal')
    gerado_em  = models.DateTimeField(auto_now_add=True)
    valido_ate = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'analytics_insight'
        ordering = ['-gerado_em']

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.titulo}'
