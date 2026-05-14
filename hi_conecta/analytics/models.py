"""
analytics/models.py — People Analytics & Inteligência Organizacional.
Métricas, scores, alertas, previsões e análise comportamental.
"""
import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from core.models import BaseModel


# ── Métrica Organizacional ────────────────────────────────────
class MetricaOrganizacional(BaseModel):
    CATEGORIAS = [
        ('turnover',      'Turnover'),
        ('absenteismo',   'Absenteísmo'),
        ('engajamento',   'Engajamento'),
        ('produtividade', 'Produtividade'),
        ('clima',         'Clima Organizacional'),
        ('treinamento',   'Treinamento & Desenvolvimento'),
        ('recrutamento',  'Recrutamento'),
        ('folha',         'Folha de Pagamento'),
        ('diversidade',   'Diversidade & Inclusão'),
        ('saude',         'Saúde & Bem-estar'),
    ]
    PERIODICIDADES = [
        ('diario',    'Diário'),
        ('semanal',   'Semanal'),
        ('mensal',    'Mensal'),
        ('trimestral','Trimestral'),
        ('anual',     'Anual'),
    ]

    nome          = models.CharField(max_length=150)
    categoria     = models.CharField(max_length=30, choices=CATEGORIAS)
    periodicidade = models.CharField(max_length=15, choices=PERIODICIDADES, default='mensal')
    valor         = models.DecimalField(max_digits=15, decimal_places=4)
    valor_meta    = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    valor_anterior= models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    unidade       = models.CharField(max_length=20, default='%')  # %, R$, dias, pessoas
    departamento  = models.ForeignKey(
        'rh.Departamento', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='metricas',
    )
    referencia    = models.CharField(max_length=7, help_text='YYYY-MM')  # período
    descricao     = models.TextField(blank=True)
    dados_json    = models.JSONField(default=dict, blank=True)  # breakdown adicional

    class Meta:
        db_table = 'analytics_metrica_organizacional'
        ordering = ['-referencia', 'categoria', 'nome']
        verbose_name        = 'Métrica Organizacional'
        verbose_name_plural = 'Métricas Organizacionais'
        indexes = [
            models.Index(fields=['categoria', 'referencia']),
            models.Index(fields=['departamento', 'referencia']),
        ]

    def __str__(self):
        return f'{self.nome} — {self.referencia}'

    @property
    def variacao(self):
        if self.valor_anterior and self.valor_anterior != 0:
            return float((self.valor - self.valor_anterior) / self.valor_anterior * 100)
        return None

    @property
    def atingiu_meta(self):
        if self.valor_meta is None:
            return None
        return self.valor >= self.valor_meta


# ── Score do Colaborador ──────────────────────────────────────
class ScoreColaborador(BaseModel):
    DIMENSOES = [
        ('desempenho',      'Desempenho'),
        ('engajamento',     'Engajamento'),
        ('risco_saida',     'Risco de Saída'),
        ('potencial',       'Potencial de Crescimento'),
        ('bem_estar',       'Bem-estar'),
        ('lideranca',       'Liderança'),
        ('colaboracao',     'Colaboração'),
        ('inovacao',        'Inovação'),
        ('geral',           'Score Geral'),
    ]

    colaborador  = models.ForeignKey(
        'rh.Colaborador', on_delete=models.CASCADE, related_name='scores',
    )
    dimensao     = models.CharField(max_length=20, choices=DIMENSOES)
    score        = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    score_anterior = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )
    referencia   = models.CharField(max_length=7, help_text='YYYY-MM')
    fatores      = models.JSONField(default=dict, blank=True)  # {fator: peso, valor, contribuicao}
    observacoes  = models.TextField(blank=True)
    calculado_por_ia = models.BooleanField(default=True)

    class Meta:
        db_table = 'analytics_score_colaborador'
        unique_together = [('colaborador', 'dimensao', 'referencia')]
        ordering = ['-referencia', 'colaborador']
        verbose_name        = 'Score do Colaborador'
        verbose_name_plural = 'Scores dos Colaboradores'

    def __str__(self):
        return f'{self.colaborador} | {self.dimensao} | {self.score}'

    @property
    def nivel(self):
        s = float(self.score)
        if s >= 80: return 'excelente'
        if s >= 65: return 'bom'
        if s >= 50: return 'regular'
        if s >= 35: return 'atencao'
        return 'critico'

    @property
    def tendencia(self):
        if self.score_anterior is None:
            return 'estavel'
        diff = float(self.score - self.score_anterior)
        if diff > 5:  return 'subindo'
        if diff < -5: return 'caindo'
        return 'estavel'


# ── Score por Setor ───────────────────────────────────────────
class ScoreSetor(BaseModel):
    departamento = models.ForeignKey(
        'rh.Departamento', on_delete=models.CASCADE, related_name='scores',
    )
    referencia   = models.CharField(max_length=7)
    score_geral  = models.DecimalField(max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_engajamento  = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    score_desempenho   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    score_bem_estar    = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    score_retencao     = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    headcount          = models.IntegerField(default=0)
    turnover_periodo   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    absenteismo_periodo= models.DecimalField(max_digits=5, decimal_places=2, default=0)
    dados_extras       = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'analytics_score_setor'
        unique_together = [('departamento', 'referencia')]
        ordering = ['-referencia', '-score_geral']
        verbose_name        = 'Score do Setor'
        verbose_name_plural = 'Scores dos Setores'

    def __str__(self):
        return f'{self.departamento} | {self.referencia} | {self.score_geral}'


# ── Alerta Inteligente ────────────────────────────────────────
class AlertaInteligente(BaseModel):
    TIPOS = [
        ('burnout',           'Risco de Burnout'),
        ('saida',             'Risco de Saída'),
        ('desempenho',        'Queda de Desempenho'),
        ('absenteismo',       'Alto Absenteísmo'),
        ('conflito',          'Conflito Potencial'),
        ('turnover_setor',    'Turnover Elevado no Setor'),
        ('ferias_vencendo',   'Férias Vencendo'),
        ('meta_nao_atingida', 'Meta Não Atingida'),
        ('aniversario',       'Aniversário / Data Comemorativa'),
        ('potencial',         'Talento com Potencial Não Explorado'),
        ('injustica_salarial','Injustiça Salarial Detectada'),
    ]
    PRIORIDADES = [
        ('critica', 'Crítica'),
        ('alta',    'Alta'),
        ('media',   'Média'),
        ('baixa',   'Baixa'),
    ]
    STATUS = [
        ('ativo',     'Ativo'),
        ('lido',      'Lido'),
        ('resolvido', 'Resolvido'),
        ('ignorado',  'Ignorado'),
    ]

    tipo         = models.CharField(max_length=30, choices=TIPOS)
    prioridade   = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    status       = models.CharField(max_length=10, choices=STATUS, default='ativo')
    colaborador  = models.ForeignKey(
        'rh.Colaborador', null=True, blank=True,
        on_delete=models.CASCADE, related_name='alertas_ia',
    )
    departamento = models.ForeignKey(
        'rh.Departamento', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='alertas',
    )
    titulo       = models.CharField(max_length=200)
    descricao    = models.TextField()
    recomendacao = models.TextField(blank=True)
    confianca    = models.DecimalField(  # 0-100%
        max_digits=5, decimal_places=2, default=80,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    dados_contexto = models.JSONField(default=dict, blank=True)
    lido_por    = models.ForeignKey(
        'accounts.Usuario', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='alertas_lidos',
    )
    lido_em     = models.DateTimeField(null=True, blank=True)
    resolvido_em= models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'analytics_alerta_inteligente'
        ordering = ['-created_at']
        verbose_name        = 'Alerta Inteligente'
        verbose_name_plural = 'Alertas Inteligentes'
        indexes = [
            models.Index(fields=['tipo', 'status']),
            models.Index(fields=['prioridade', 'status']),
            models.Index(fields=['colaborador', 'status']),
        ]

    def __str__(self):
        return f'[{self.prioridade.upper()}] {self.titulo}'

    def marcar_lido(self, usuario):
        self.status  = 'lido'
        self.lido_por = usuario
        self.lido_em  = timezone.now()
        self.save(update_fields=['status', 'lido_por', 'lido_em'])

    def resolver(self):
        self.status       = 'resolvido'
        self.resolvido_em = timezone.now()
        self.save(update_fields=['status', 'resolvido_em'])


# ── Previsão de Turnover ──────────────────────────────────────
class PrevisaoTurnover(BaseModel):
    HORIZONTES = [
        ('30d',  '30 dias'),
        ('60d',  '60 dias'),
        ('90d',  '90 dias'),
        ('180d', '6 meses'),
        ('365d', '12 meses'),
    ]

    colaborador  = models.ForeignKey(
        'rh.Colaborador', on_delete=models.CASCADE, related_name='previsoes_turnover',
    )
    horizonte    = models.CharField(max_length=5, choices=HORIZONTES, default='90d')
    probabilidade= models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Probabilidade (%) de saída no horizonte'
    )
    nivel_risco  = models.CharField(max_length=10, default='medio')  # baixo/medio/alto/critico
    fatores_risco= models.JSONField(default=list, blank=True)  # [{fator, peso, valor, descricao}]
    acoes_retencao = models.JSONField(default=list, blank=True)  # sugestões de retenção
    referencia   = models.CharField(max_length=7, help_text='YYYY-MM da análise')
    modelo_versao= models.CharField(max_length=20, default='v1.0')
    confirmado   = models.BooleanField(null=True, blank=True)  # True=saiu, False=ficou, None=aguardando

    class Meta:
        db_table = 'analytics_previsao_turnover'
        unique_together = [('colaborador', 'horizonte', 'referencia')]
        ordering = ['-probabilidade']
        verbose_name        = 'Previsão de Turnover'
        verbose_name_plural = 'Previsões de Turnover'

    def __str__(self):
        return f'{self.colaborador} — {self.horizonte} — {self.probabilidade}%'

    def save(self, *args, **kwargs):
        p = float(self.probabilidade)
        if p >= 75:   self.nivel_risco = 'critico'
        elif p >= 50: self.nivel_risco = 'alto'
        elif p >= 25: self.nivel_risco = 'medio'
        else:         self.nivel_risco = 'baixo'
        super().save(*args, **kwargs)


# ── Snapshot de Absenteísmo ───────────────────────────────────
class SnapshotAbsenteismo(BaseModel):
    colaborador   = models.ForeignKey(
        'rh.Colaborador', on_delete=models.CASCADE, related_name='snapshots_absenteismo',
    )
    referencia    = models.CharField(max_length=7)
    dias_falta    = models.IntegerField(default=0)
    dias_uteis    = models.IntegerField(default=22)
    taxa          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    justificados  = models.IntegerField(default=0)
    nao_justificados = models.IntegerField(default=0)
    motivos       = models.JSONField(default=dict, blank=True)  # {motivo: dias}

    class Meta:
        db_table = 'analytics_snapshot_absenteismo'
        unique_together = [('colaborador', 'referencia')]
        ordering = ['-referencia']
        verbose_name        = 'Snapshot de Absenteísmo'
        verbose_name_plural = 'Snapshots de Absenteísmo'

    def __str__(self):
        return f'{self.colaborador} | {self.referencia} | {self.taxa}%'
