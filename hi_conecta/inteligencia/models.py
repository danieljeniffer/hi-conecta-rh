"""
inteligencia/models.py — IA Organizacional & Inteligência Corporativa.
DNA Corporativo, Modo Fantasma, RH Temporal, Simulador de Futuro.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel


# ── DNA Corporativo ───────────────────────────────────────────
class DNACorporativo(BaseModel):
    """6 dimensões que compõem a identidade organizacional."""

    referencia    = models.CharField(max_length=7, help_text='YYYY-MM', unique=True)

    # Dimensão 1: Cultura
    cultura_score         = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    cultura_descricao     = models.TextField(blank=True)
    cultura_pontos_fortes = models.JSONField(default=list, blank=True)
    cultura_riscos        = models.JSONField(default=list, blank=True)

    # Dimensão 2: Liderança
    lideranca_score       = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    lideranca_estilo      = models.CharField(max_length=50, blank=True)  # transformacional, situacional...
    lideranca_cobertura   = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # % líderes capacitados

    # Dimensão 3: Aprendizado
    aprendizado_score     = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    horas_treinamento_media = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    taxa_conclusao_trilhas  = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Dimensão 4: Inovação
    inovacao_score        = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    ideias_propostas      = models.IntegerField(default=0)
    ideias_implementadas  = models.IntegerField(default=0)

    # Dimensão 5: Bem-estar
    bem_estar_score       = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    taxa_afastamentos     = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    colaboradores_risco_burnout = models.IntegerField(default=0)

    # Dimensão 6: Resultados
    resultados_score      = models.DecimalField(max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    metas_atingidas_pct   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    nps_colaborador       = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)

    # Score final
    score_dna             = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    narrativa_ia          = models.TextField(blank=True)  # gerado por IA
    recomendacoes_estrategicas = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'inteligencia_dna_corporativo'
        ordering = ['-referencia']
        verbose_name        = 'DNA Corporativo'
        verbose_name_plural = 'DNA Corporativo (histórico)'

    def __str__(self):
        return f'DNA Corporativo — {self.referencia} — Score {self.score_dna}'

    def calcular_score_dna(self):
        pesos = {
            'cultura':     0.20,
            'lideranca':   0.20,
            'aprendizado': 0.15,
            'inovacao':    0.15,
            'bem_estar':   0.15,
            'resultados':  0.15,
        }
        score = (
            float(self.cultura_score)     * pesos['cultura'] +
            float(self.lideranca_score)   * pesos['lideranca'] +
            float(self.aprendizado_score) * pesos['aprendizado'] +
            float(self.inovacao_score)    * pesos['inovacao'] +
            float(self.bem_estar_score)   * pesos['bem_estar'] +
            float(self.resultados_score)  * pesos['resultados']
        )
        self.score_dna = round(score, 2)
        return self.score_dna


# ── Modo Fantasma ─────────────────────────────────────────────
class ModoFantasma(BaseModel):
    """
    Análise de padrões organizacionais ocultos — detecta o que não aparece
    nos relatórios formais: micro-conflitos, silos, líderes informais, etc.
    """
    TIPOS_INSIGHT = [
        ('silo',              'Silo Departamental'),
        ('lider_informal',    'Líder Informal Detectado'),
        ('micro_conflito',    'Micro-conflito Latente'),
        ('gargalo_processo',  'Gargalo de Processo'),
        ('talento_oculto',    'Talento Não Reconhecido'),
        ('risco_cultural',    'Risco Cultural'),
        ('rede_influencia',   'Rede de Influência'),
        ('inequidade',        'Inequidade Organizacional'),
    ]

    tipo          = models.CharField(max_length=25, choices=TIPOS_INSIGHT)
    titulo        = models.CharField(max_length=200)
    descricao     = models.TextField()
    evidencias    = models.JSONField(default=list, blank=True)  # [{tipo, dados, peso}]
    confianca     = models.DecimalField(max_digits=5, decimal_places=2, default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)])
    impacto       = models.CharField(max_length=10, default='medio',
        choices=[('baixo','Baixo'),('medio','Médio'),('alto','Alto'),('critico','Crítico')])
    colaboradores_envolvidos = models.ManyToManyField(
        'rh.Colaborador', blank=True, related_name='insights_fantasma'
    )
    departamentos_envolvidos = models.ManyToManyField(
        'rh.Departamento', blank=True, related_name='insights_fantasma'
    )
    recomendacao  = models.TextField(blank=True)
    lido          = models.BooleanField(default=False)
    referencia    = models.CharField(max_length=7)

    class Meta:
        db_table = 'inteligencia_modo_fantasma'
        ordering = ['-created_at']
        verbose_name        = 'Insight Fantasma'
        verbose_name_plural = 'Insights Fantasma'

    def __str__(self):
        return f'[Fantasma] {self.tipo} — {self.titulo}'


# ── RH Temporal Preditivo ─────────────────────────────────────
class PrevisaoRHTemporal(BaseModel):
    """Projeções temporais de métricas organizacionais."""
    METRICA_TIPOS = [
        ('headcount',    'Headcount'),
        ('turnover',     'Turnover'),
        ('folha_custo',  'Custo de Folha'),
        ('engajamento',  'Engajamento'),
        ('absenteismo',  'Absenteísmo'),
        ('produtividade','Produtividade'),
    ]

    metrica_tipo  = models.CharField(max_length=20, choices=METRICA_TIPOS)
    departamento  = models.ForeignKey(
        'rh.Departamento', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='previsoes_temporais',
    )
    referencia_base = models.CharField(max_length=7)  # mês base da projeção
    horizonte_meses = models.IntegerField(default=3)   # projetar N meses à frente

    valor_atual   = models.DecimalField(max_digits=15, decimal_places=4)
    projecoes     = models.JSONField(default=list, blank=True)
    # [{mes: 'YYYY-MM', valor_previsto: X, intervalo_min: X, intervalo_max: X, confianca: X}]

    metodologia   = models.CharField(max_length=50, default='tendencia_linear')
    premissas     = models.JSONField(default=list, blank=True)
    narrativa     = models.TextField(blank=True)  # explicação gerada por IA

    class Meta:
        db_table = 'inteligencia_previsao_temporal'
        ordering = ['-created_at']
        verbose_name        = 'Previsão RH Temporal'
        verbose_name_plural = 'Previsões RH Temporais'

    def __str__(self):
        return f'{self.metrica_tipo} — base {self.referencia_base} +{self.horizonte_meses}m'


# ── IA Executiva — Consulta ───────────────────────────────────
class ConsultaIAExecutiva(BaseModel):
    """Registro de consultas à IA Executiva Conselheira."""
    PROVEDORES = [
        ('openai',    'OpenAI GPT'),
        ('anthropic', 'Anthropic Claude'),
        ('local',     'Modelo Local'),
    ]
    CATEGORIAS = [
        ('estrategia',    'Estratégia de RH'),
        ('retencao',      'Retenção de Talentos'),
        ('clima',         'Clima Organizacional'),
        ('lideranca',     'Desenvolvimento de Liderança'),
        ('reestruturacao','Reestruturação'),
        ('cultura',       'Transformação Cultural'),
        ('geral',         'Consulta Geral'),
    ]

    usuario       = models.ForeignKey(
        'accounts.Usuario', on_delete=models.CASCADE, related_name='consultas_ia'
    )
    categoria     = models.CharField(max_length=20, choices=CATEGORIAS, default='geral')
    pergunta      = models.TextField()
    contexto_json = models.JSONField(default=dict, blank=True)  # KPIs enviados para a IA
    resposta      = models.TextField(blank=True)
    provedor      = models.CharField(max_length=15, choices=PROVEDORES, default='anthropic')
    modelo_usado  = models.CharField(max_length=50, blank=True)
    tokens_usados = models.IntegerField(default=0)
    tempo_resposta_ms = models.IntegerField(default=0)
    avaliacao_usuario = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )

    class Meta:
        db_table = 'inteligencia_consulta_ia'
        ordering = ['-created_at']
        verbose_name        = 'Consulta IA Executiva'
        verbose_name_plural = 'Consultas IA Executiva'

    def __str__(self):
        return f'{self.usuario} — {self.categoria} — {self.created_at:%d/%m/%Y %H:%M}'


# ── Simulador de Futuro Corporativo ──────────────────────────
class SimulacaoFuturoCorporativo(BaseModel):
    """Simula impactos de decisões estratégicas de RH."""
    CENARIOS = [
        ('expansao',        'Expansão de Headcount'),
        ('reducao',         'Redução de Headcount'),
        ('reajuste_salarial','Reajuste Salarial'),
        ('nova_politica',   'Nova Política de Benefícios'),
        ('reestruturacao',  'Reestruturação Departamental'),
        ('home_office',     'Implementar Home Office'),
        ('plr',             'Programa de PLR'),
        ('personalizado',   'Cenário Personalizado'),
    ]

    usuario      = models.ForeignKey(
        'accounts.Usuario', on_delete=models.CASCADE, related_name='simulacoes_futuro'
    )
    cenario      = models.CharField(max_length=25, choices=CENARIOS)
    nome         = models.CharField(max_length=200)
    descricao    = models.TextField(blank=True)
    parametros   = models.JSONField(default=dict, blank=True)  # inputs do cenário
    resultado    = models.JSONField(default=dict, blank=True)  # outputs calculados
    impacto_financeiro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    impacto_engajamento_delta = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    impacto_turnover_delta    = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    narrativa_ia = models.TextField(blank=True)
    recomendacao = models.TextField(blank=True)
    favorita     = models.BooleanField(default=False)

    class Meta:
        db_table = 'inteligencia_simulacao_futuro'
        ordering = ['-created_at']
        verbose_name        = 'Simulação de Futuro Corporativo'
        verbose_name_plural = 'Simulações de Futuro Corporativo'

    def __str__(self):
        return f'{self.cenario} — {self.nome}'
