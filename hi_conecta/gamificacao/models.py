"""gamificacao/models.py — Pontos, medalhas, ranking, conquistas."""
from django.db import models
from django.core.validators import MinValueValidator
from core.models import BaseModel


class Medalha(BaseModel):
    CATEGORIAS = [
        ('desempenho',   'Desempenho'),
        ('treinamento',  'Treinamento'),
        ('pontualidade', 'Pontualidade'),
        ('colaboracao',  'Colaboração'),
        ('inovacao',     'Inovação'),
        ('tempo',        'Tempo de Casa'),
        ('especial',     'Especial'),
    ]

    nome        = models.CharField(max_length=100)
    descricao   = models.TextField(blank=True)
    categoria   = models.CharField(max_length=20, choices=CATEGORIAS)
    icone       = models.CharField(max_length=10, default='🏆')
    pontos      = models.IntegerField(default=100, validators=[MinValueValidator(0)])
    cor         = models.CharField(max_length=20, default='#6366f1')
    criterio    = models.TextField(blank=True, help_text='Descrição do critério para ganhar')
    ativa       = models.BooleanField(default=True)

    class Meta:
        db_table = 'gamificacao_medalha'
        ordering = ['-pontos', 'nome']
        verbose_name = 'Medalha'
        verbose_name_plural = 'Medalhas'

    def __str__(self):
        return f'{self.icone} {self.nome}'


class PontuacaoColaborador(BaseModel):
    colaborador = models.OneToOneField('rh.Colaborador', on_delete=models.CASCADE, related_name='pontuacao')
    total_pontos = models.IntegerField(default=0)
    pontos_mes   = models.IntegerField(default=0)
    nivel        = models.CharField(max_length=20, default='iniciante')
    referencia_mes = models.CharField(max_length=7, blank=True)  # YYYY-MM do pontos_mes

    class Meta:
        db_table = 'gamificacao_pontuacao'
        ordering = ['-total_pontos']
        verbose_name = 'Pontuação do Colaborador'

    def __str__(self):
        return f'{self.colaborador} — {self.total_pontos} pts'

    def recalcular_nivel(self):
        p = self.total_pontos
        if p >= 5000:   self.nivel = 'lenda'
        elif p >= 2000: self.nivel = 'expert'
        elif p >= 1000: self.nivel = 'avancado'
        elif p >= 500:  self.nivel = 'intermediario'
        elif p >= 100:  self.nivel = 'iniciante'
        else:           self.nivel = 'novato'


class MedalhaColaborador(BaseModel):
    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='medalhas')
    medalha     = models.ForeignKey(Medalha, on_delete=models.CASCADE, related_name='conquistas')
    concedida_por = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                    on_delete=models.SET_NULL, related_name='medalhas_concedidas')
    motivo      = models.TextField(blank=True)

    class Meta:
        db_table = 'gamificacao_medalha_colaborador'
        ordering = ['-created_at']
        verbose_name = 'Medalha do Colaborador'

    def __str__(self):
        return f'{self.colaborador} — {self.medalha}'


class TransacaoPontos(BaseModel):
    ORIGENS = [
        ('avaliacao',    'Avaliação de Desempenho'),
        ('treinamento',  'Conclusão de Treinamento'),
        ('reconhecimento','Reconhecimento'),
        ('aniversario',  'Aniversário'),
        ('medalha',      'Medalha Conquistada'),
        ('admin',        'Atribuição Manual'),
        ('estorno',      'Estorno'),
    ]

    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='transacoes_pontos')
    pontos      = models.IntegerField()  # positivo = ganho, negativo = desconto
    origem      = models.CharField(max_length=20, choices=ORIGENS)
    descricao   = models.CharField(max_length=200)
    referencia_id = models.CharField(max_length=50, blank=True)  # id do objeto de origem

    class Meta:
        db_table = 'gamificacao_transacao_pontos'
        ordering = ['-created_at']
        verbose_name = 'Transação de Pontos'

    def __str__(self):
        sinal = '+' if self.pontos >= 0 else ''
        return f'{self.colaborador}: {sinal}{self.pontos} ({self.origem})'
