"""
recrutamento/models.py — ATS completo: Vagas, Pipeline Kanban, Candidatos, Entrevistas.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel, BaseAuditModel


class Vaga(BaseAuditModel):
    STATUS = [
        ('rascunho',  'Rascunho'),
        ('aberta',    'Aberta'),
        ('pausada',   'Pausada'),
        ('fechada',   'Fechada'),
        ('cancelada', 'Cancelada'),
    ]
    MODALIDADES = [
        ('presencial', 'Presencial'),
        ('hibrido',    'Híbrido'),
        ('remoto',     'Remoto'),
    ]
    TIPOS_CONTRATO = [
        ('clt',         'CLT'),
        ('pj',          'PJ'),
        ('estagio',     'Estágio'),
        ('temporario',  'Temporário'),
        ('freelancer',  'Freelancer'),
    ]

    titulo          = models.CharField(max_length=200)
    departamento    = models.ForeignKey('rh.Departamento', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='vagas')
    cargo           = models.ForeignKey('rh.Cargo', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='vagas')
    status          = models.CharField(max_length=15, choices=STATUS, default='rascunho')
    modalidade      = models.CharField(max_length=15, choices=MODALIDADES, default='presencial')
    tipo_contrato   = models.CharField(max_length=15, choices=TIPOS_CONTRATO, default='clt')
    descricao       = models.TextField(blank=True)
    requisitos      = models.TextField(blank=True)
    beneficios      = models.TextField(blank=True)
    salario_min     = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salario_max     = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salario_oculto  = models.BooleanField(default=False)
    vagas_count     = models.IntegerField(default=1)
    cidade          = models.CharField(max_length=100, blank=True)
    uf              = models.CharField(max_length=2, blank=True)
    prazo_inscricao = models.DateField(null=True, blank=True)
    descricao_ia    = models.BooleanField(default=False)  # foi gerada por IA
    perguntas_entrevista = models.JSONField(default=list, blank=True)  # geradas por IA
    responsavel     = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='vagas_responsavel')
    publicada_em    = models.DateTimeField(null=True, blank=True)
    fechada_em      = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'recrutamento_vaga'
        ordering = ['-created_at']
        verbose_name        = 'Vaga'
        verbose_name_plural = 'Vagas'

    def __str__(self):
        return f'{self.titulo} ({self.get_status_display()})'

    @property
    def total_candidatos(self):
        return self.candidaturas.filter(deleted_at__isnull=True).count()

    @property
    def candidatos_por_etapa(self):
        from django.db.models import Count
        return dict(self.candidaturas.filter(deleted_at__isnull=True)
                    .values_list('etapa').annotate(c=Count('id')))


class Candidato(BaseAuditModel):
    FONTES = [
        ('linkedin',    'LinkedIn'),
        ('indicacao',   'Indicação Interna'),
        ('site',        'Site da Empresa'),
        ('recrutadora', 'Recrutadora Parceira'),
        ('proativo',    'Candidatura Espontânea'),
        ('outro',       'Outro'),
    ]

    nome            = models.CharField(max_length=200)
    email           = models.EmailField()
    telefone        = models.CharField(max_length=20, blank=True)
    linkedin        = models.URLField(blank=True)
    cidade          = models.CharField(max_length=100, blank=True)
    uf              = models.CharField(max_length=2, blank=True)
    fonte           = models.CharField(max_length=15, choices=FONTES, default='site')
    curriculo       = models.FileField(upload_to='recrutamento/curriculos/', blank=True, null=True)
    resumo_ia       = models.TextField(blank=True)  # resumo gerado por IA
    score_fit       = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                        validators=[MinValueValidator(0), MaxValueValidator(100)])
    tags            = models.JSONField(default=list, blank=True)  # skills extraídas por IA
    indicado_por    = models.ForeignKey('rh.Colaborador', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='indicacoes')
    bloqueado       = models.BooleanField(default=False)  # não contratar / DNC
    observacoes     = models.TextField(blank=True)

    class Meta:
        db_table = 'recrutamento_candidato'
        ordering = ['nome']
        verbose_name        = 'Candidato'
        verbose_name_plural = 'Candidatos'

    def __str__(self):
        return self.nome


class Candidatura(BaseAuditModel):
    ETAPAS = [
        ('triagem',    'Triagem'),
        ('entrevista', 'Entrevista RH'),
        ('tecnico',    'Técnico/Gestor'),
        ('proposta',   'Proposta'),
        ('contratado', 'Contratado'),
        ('reprovado',  'Reprovado'),
        ('desistiu',   'Desistiu'),
    ]
    ETAPA_ORDEM = {'triagem':1,'entrevista':2,'tecnico':3,'proposta':4,'contratado':5,'reprovado':99,'desistiu':98}

    vaga            = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name='candidaturas')
    candidato       = models.ForeignKey(Candidato, on_delete=models.CASCADE, related_name='candidaturas')
    etapa           = models.CharField(max_length=15, choices=ETAPAS, default='triagem')
    score           = models.IntegerField(default=0,
                        validators=[MinValueValidator(0), MaxValueValidator(100)])
    observacoes     = models.TextField(blank=True)
    avaliador       = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='candidaturas_avaliadas')
    data_movimentacao = models.DateTimeField(auto_now=True)
    motivo_reprovacao = models.TextField(blank=True)
    salario_pretendido = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'recrutamento_candidatura'
        unique_together = [('vaga', 'candidato')]
        ordering = ['-data_movimentacao']
        verbose_name        = 'Candidatura'
        verbose_name_plural = 'Candidaturas'

    def __str__(self):
        return f'{self.candidato} → {self.vaga} [{self.etapa}]'


class Entrevista(BaseAuditModel):
    FORMATOS = [
        ('presencial', 'Presencial'),
        ('video',      'Vídeo (Teams/Meet)'),
        ('telefone',   'Telefone'),
    ]
    STATUS = [
        ('agendada',  'Agendada'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
        ('no_show',   'No-show'),
    ]

    candidatura     = models.ForeignKey(Candidatura, on_delete=models.CASCADE, related_name='entrevistas')
    entrevistador   = models.ForeignKey('accounts.Usuario', on_delete=models.CASCADE, related_name='entrevistas')
    formato         = models.CharField(max_length=15, choices=FORMATOS, default='video')
    status          = models.CharField(max_length=15, choices=STATUS, default='agendada')
    data_hora       = models.DateTimeField()
    duracao_min     = models.IntegerField(default=60)
    link_video      = models.URLField(blank=True)
    notas           = models.TextField(blank=True)
    nota_tecnica    = models.IntegerField(null=True, blank=True,
                        validators=[MinValueValidator(1), MaxValueValidator(10)])
    nota_comportamental = models.IntegerField(null=True, blank=True,
                        validators=[MinValueValidator(1), MaxValueValidator(10)])
    recomendacao    = models.CharField(max_length=10, blank=True,
                        choices=[('aprovar','Aprovar'),('reprovar','Reprovar'),('duvida','Dúvida')])
    perguntas_usadas = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'recrutamento_entrevista'
        ordering = ['data_hora']
        verbose_name        = 'Entrevista'
        verbose_name_plural = 'Entrevistas'

    def __str__(self):
        return f'{self.candidatura.candidato} — {self.data_hora:%d/%m/%Y %H:%M}'
