"""
treinamento/models.py — T&D: catálogo, trilhas, PDI, matrículas, certificados.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel, BaseAuditModel


class Treinamento(BaseAuditModel):
    MODALIDADES = [('presencial','Presencial'),('ead','EAD'),('hibrido','Híbrido'),('externo','Externo')]
    TIPOS = [
        ('tecnico','Técnico'),('comportamental','Comportamental'),
        ('seguranca','Segurança do Trabalho'),('compliance','Compliance'),
        ('lideranca','Liderança'),('onboarding','Onboarding'),('outro','Outro'),
    ]

    titulo          = models.CharField(max_length=200)
    tipo            = models.CharField(max_length=20, choices=TIPOS, default='tecnico')
    modalidade      = models.CharField(max_length=15, choices=MODALIDADES, default='ead')
    descricao       = models.TextField(blank=True)
    conteudo_programatico = models.TextField(blank=True)
    carga_horaria   = models.IntegerField(default=4)
    instrutor       = models.CharField(max_length=200, blank=True)
    link_conteudo   = models.URLField(blank=True)
    arquivo         = models.FileField(upload_to='treinamentos/materiais/', blank=True, null=True)
    ativo           = models.BooleanField(default=True)
    obrigatorio     = models.BooleanField(default=False)
    validade_meses  = models.IntegerField(null=True, blank=True)
    departamentos_alvo = models.ManyToManyField('rh.Departamento', blank=True, related_name='treinamentos')
    cargos_alvo     = models.ManyToManyField('rh.Cargo', blank=True, related_name='treinamentos')
    gera_certificado = models.BooleanField(default=True)
    nota_minima_aprovacao = models.DecimalField(max_digits=4, decimal_places=1, default=7.0)

    class Meta:
        db_table = 'treinamento_treinamento'
        ordering = ['titulo']
        verbose_name = 'Treinamento'
        verbose_name_plural = 'Treinamentos'

    def __str__(self):
        return self.titulo


class Trilha(BaseAuditModel):
    NIVEIS = [('junior','Júnior'),('pleno','Pleno'),('senior','Sênior'),('todos','Todos')]

    nome        = models.CharField(max_length=200)
    descricao   = models.TextField(blank=True)
    cargo_alvo  = models.ForeignKey('rh.Cargo', null=True, blank=True,
                    on_delete=models.SET_NULL, related_name='trilhas')
    nivel       = models.CharField(max_length=20, default='todos', choices=NIVEIS)
    ativa       = models.BooleanField(default=True)
    ordem_treinamentos = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'treinamento_trilha'
        verbose_name = 'Trilha'
        verbose_name_plural = 'Trilhas'

    def __str__(self):
        return self.nome


class Matricula(BaseAuditModel):
    STATUS = [
        ('inscrito','Inscrito'),('em_curso','Em Curso'),
        ('concluido','Concluído'),('reprovado','Reprovado'),('cancelado','Cancelado'),
    ]

    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='matriculas')
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, related_name='matriculas')
    status      = models.CharField(max_length=15, choices=STATUS, default='inscrito')
    data_inicio = models.DateField(null=True, blank=True)
    data_conclusao = models.DateField(null=True, blank=True)
    nota        = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    progresso   = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    certificado_emitido = models.BooleanField(default=False)
    certificado_arquivo = models.FileField(upload_to='treinamentos/certificados/', blank=True, null=True)
    validade_certificado = models.DateField(null=True, blank=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'treinamento_matricula'
        unique_together = [('colaborador', 'treinamento')]
        ordering = ['-created_at']
        verbose_name = 'Matrícula'
        verbose_name_plural = 'Matrículas'

    def __str__(self):
        return f'{self.colaborador} — {self.treinamento}'

    @property
    def aprovado(self):
        if self.nota is None:
            return None
        return self.nota >= self.treinamento.nota_minima_aprovacao


class PDI(BaseAuditModel):
    STATUS = [('rascunho','Rascunho'),('ativo','Ativo'),('concluido','Concluído'),('arquivado','Arquivado')]

    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='pdis')
    gestor      = models.ForeignKey('accounts.Usuario', null=True, blank=True,
                    on_delete=models.SET_NULL, related_name='pdis_geridos')
    titulo      = models.CharField(max_length=200)
    objetivo    = models.TextField()
    prazo       = models.DateField()
    status      = models.CharField(max_length=15, choices=STATUS, default='rascunho')
    gerado_por_ia = models.BooleanField(default=False)
    acoes       = models.JSONField(default=list, blank=True)
    progresso   = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    notas_gestor = models.TextField(blank=True)
    notas_colaborador = models.TextField(blank=True)

    class Meta:
        db_table = 'treinamento_pdi'
        ordering = ['-created_at']
        verbose_name = 'PDI'
        verbose_name_plural = 'PDIs'

    def __str__(self):
        return f'PDI — {self.colaborador} — {self.titulo}'
