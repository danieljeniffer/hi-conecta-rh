"""
apps/dp/models.py — Departamento Pessoal completo.
Folha, Férias, Rescisão, Benefícios, 13º, eSocial.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import AuditedModel, BaseModel
from apps.rh.models import Colaborador
from simple_history.models import HistoricalRecords


class FolhaPagamento(AuditedModel):
    STATUS = [
        ('aberta',    'Aberta'),
        ('calculada', 'Calculada'),
        ('aprovada',  'Aprovada'),
        ('paga',      'Paga'),
        ('cancelada', 'Cancelada'),
    ]

    competencia      = models.CharField(max_length=7)  # YYYY-MM
    status           = models.CharField(max_length=15, choices=STATUS, default='aberta')
    total_bruto      = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_liquido    = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_descontos  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_fgts       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_inss       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_irrf       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    fechado_em       = models.DateTimeField(null=True, blank=True)
    pago_em          = models.DateTimeField(null=True, blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table    = 'dp_folha_pagamento'
        unique_together = [('competencia',)]
        ordering    = ['-competencia']

    def __str__(self):
        return f'Folha {self.competencia} — {self.get_status_display()}'


class FolhaItem(BaseModel):
    folha            = models.ForeignKey(FolhaPagamento, on_delete=models.CASCADE, related_name='itens')
    colaborador      = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='folha_itens')
    salario_base     = models.DecimalField(max_digits=12, decimal_places=2)
    dias_trabalhados = models.IntegerField(default=30)
    horas_extras     = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    valor_he         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    faltas           = models.IntegerField(default=0)
    desconto_faltas  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outros_proventos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    inss             = models.DecimalField(max_digits=10, decimal_places=2)
    irrf             = models.DecimalField(max_digits=10, decimal_places=2)
    fgts             = models.DecimalField(max_digits=10, decimal_places=2)
    plano_saude      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vale_transporte  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outros_descontos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_bruto      = models.DecimalField(max_digits=12, decimal_places=2)
    total_liquido    = models.DecimalField(max_digits=12, decimal_places=2)
    proventos_json   = models.JSONField(null=True, blank=True)
    descontos_json   = models.JSONField(null=True, blank=True)
    status_esocial   = models.CharField(max_length=30, blank=True)

    class Meta:
        db_table        = 'dp_folha_item'
        unique_together = [('folha', 'colaborador')]
        indexes         = [models.Index(fields=['colaborador', 'folha'])]

    def __str__(self):
        return f'{self.colaborador.nome} — {self.folha.competencia}'


class Ferias(AuditedModel):
    STATUS = [
        ('pendente',  'Pendente'),
        ('aprovada',  'Aprovada'),
        ('recusada',  'Recusada'),
        ('em_gozo',   'Em Gozo'),
        ('concluida', 'Concluída'),
    ]

    colaborador      = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='ferias')
    periodo_inicio   = models.DateField(verbose_name='Início Período Aquisitivo')
    periodo_fim      = models.DateField(verbose_name='Fim Período Aquisitivo')
    gozo_inicio      = models.DateField(null=True, blank=True)
    gozo_fim         = models.DateField(null=True, blank=True)
    dias_solicitados = models.IntegerField(default=30)
    dias_abono       = models.IntegerField(default=0)
    status           = models.CharField(max_length=15, choices=STATUS, default='pendente')
    aprovado_por     = models.CharField(max_length=200, blank=True)
    aprovado_em      = models.DateTimeField(null=True, blank=True)
    recusado_motivo  = models.TextField(blank=True)
    valor_ferias     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valor_terco      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_abono      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_inss       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_irrf       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_liquido    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    observacoes      = models.TextField(blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table = 'dp_ferias'
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['colaborador', 'status']),
            models.Index(fields=['gozo_inicio']),
        ]

    def __str__(self):
        return f'Férias {self.colaborador.nome} — {self.get_status_display()}'


class Rescisao(AuditedModel):
    TIPOS = [
        ('sem_justa_causa',  'Sem Justa Causa'),
        ('pedido_demissao',  'Pedido de Demissão'),
        ('justa_causa',      'Justa Causa'),
        ('acordo_mutuo',     'Acordo Mútuo'),
        ('termino_contrato', 'Término de Contrato'),
        ('aposentadoria',    'Aposentadoria'),
    ]

    colaborador       = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='rescisoes')
    tipo              = models.CharField(max_length=25, choices=TIPOS)
    data_demissao     = models.DateField()
    aviso_previo_dias = models.IntegerField(default=30)
    aviso_indenizado  = models.BooleanField(default=False)
    saldo_salario     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ferias_vencidas   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ferias_proporc    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    terco_ferias      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    decimo_proporc    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    aviso_previo_val  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    multa_fgts        = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fgts_saldo        = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    inss              = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    irrf              = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    outros            = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_bruto       = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    total_liquido     = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    motivo            = models.TextField(blank=True)
    status            = models.CharField(max_length=20, default='rascunho')
    homologado_em     = models.DateTimeField(null=True, blank=True)
    history           = HistoricalRecords()

    class Meta:
        db_table = 'dp_rescisao'
        ordering = ['-data_demissao']

    def __str__(self):
        return f'{self.colaborador.nome} — {self.get_tipo_display()} ({self.data_demissao})'


class BeneficioCategoria(AuditedModel):
    nome          = models.CharField(max_length=150)
    descricao     = models.TextField(blank=True)
    fornecedor    = models.CharField(max_length=100, blank=True)
    valor_empresa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_colab   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    recorrencia   = models.CharField(max_length=20, default='mensal')
    ativo         = models.BooleanField(default=True)

    class Meta:
        db_table = 'dp_beneficio_categoria'
        verbose_name = 'Categoria de Benefício'

    def __str__(self):
        return self.nome


class ColaboradorBeneficio(BaseModel):
    colaborador   = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='beneficios')
    beneficio     = models.ForeignKey(BeneficioCategoria, on_delete=models.CASCADE)
    ativo         = models.BooleanField(default=True)
    data_inicio   = models.DateField()
    data_fim      = models.DateField(null=True, blank=True)
    valor_empresa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_colab   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'dp_colaborador_beneficio'
        unique_together = [('colaborador', 'beneficio')]

    def __str__(self):
        return f'{self.colaborador.nome} — {self.beneficio.nome}'


class NotificacaoDP(BaseModel):
    TIPOS = [
        ('ferias_vencendo',     'Férias Vencendo'),
        ('experiencia_15',      'Avaliação 15 dias'),
        ('experiencia_45',      'Avaliação 45 dias'),
        ('prazo_legal',         'Prazo Legal'),
        ('falta',               'Falta Registrada'),
        ('admissao_pendente',   'Admissão Pendente'),
        ('rescisao',            'Rescisão'),
        ('decimo_terceiro',     '13º Salário'),
        ('alerta_geral',        'Alerta Geral'),
    ]
    PRIORIDADES = [('critica','Crítica'),('alta','Alta'),('normal','Normal'),('baixa','Baixa')]

    colaborador = models.ForeignKey(Colaborador, null=True, on_delete=models.SET_NULL, related_name='notificacoes_dp')
    tipo        = models.CharField(max_length=25, choices=TIPOS)
    titulo      = models.CharField(max_length=200)
    mensagem    = models.TextField()
    prioridade  = models.CharField(max_length=10, choices=PRIORIDADES, default='normal')
    lida        = models.BooleanField(default=False)
    lida_em     = models.DateTimeField(null=True, blank=True)
    dados       = models.JSONField(default=dict)

    class Meta:
        db_table = 'dp_notificacao'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_tipo_display()} — {self.titulo}'
