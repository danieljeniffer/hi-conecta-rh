"""
dp/models.py — Departamento Pessoal completo.
Folha, Férias, Rescisão, 13º, Benefícios, Admissão, Notificações.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords
from core.models import BaseModel, BaseAuditModel


# ── Folha de Pagamento ────────────────────────────────────────
class FolhaPagamento(BaseAuditModel):
    STATUS = [
        ('aberta',    'Aberta'),
        ('calculada', 'Calculada'),
        ('aprovada',  'Aprovada'),
        ('paga',      'Paga'),
        ('cancelada', 'Cancelada'),
    ]

    competencia      = models.CharField(max_length=7, db_index=True)   # YYYY-MM
    status           = models.CharField(max_length=10, choices=STATUS, default='aberta', db_index=True)
    total_bruto      = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_liquido    = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_descontos  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_fgts       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_inss       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_irrf       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_colabs     = models.IntegerField(default=0)
    fechado_em       = models.DateTimeField(null=True, blank=True)
    pago_em          = models.DateTimeField(null=True, blank=True)
    observacoes      = models.TextField(blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table            = 'dp_folha_pagamento'
        ordering            = ['-competencia']
        unique_together     = [('competencia',)]
        verbose_name        = 'Folha de Pagamento'
        verbose_name_plural = 'Folhas de Pagamento'

    def __str__(self):
        return f'Folha {self.competencia} — {self.get_status_display()}'

    @property
    def ano(self):
        return self.competencia[:4]

    @property
    def mes(self):
        return self.competencia[5:7]


class FolhaItem(BaseModel):
    """Linha individual de cada colaborador na folha."""
    folha            = models.ForeignKey(FolhaPagamento, on_delete=models.CASCADE, related_name='itens')
    colaborador      = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='folha_itens')
    salario_base     = models.DecimalField(max_digits=12, decimal_places=2)
    dias_trabalhados = models.IntegerField(default=30)
    horas_extras_50  = models.DecimalField(max_digits=6,  decimal_places=2, default=0)
    horas_extras_100 = models.DecimalField(max_digits=6,  decimal_places=2, default=0)
    valor_he         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    faltas           = models.IntegerField(default=0)
    desconto_faltas  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outros_proventos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    inss             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    irrf             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fgts             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    plano_saude      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vale_transporte  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outros_descontos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_bruto      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_liquido    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    proventos_json   = models.JSONField(null=True, blank=True)   # detalhamento completo
    descontos_json   = models.JSONField(null=True, blank=True)
    memoria_calculo  = models.JSONField(null=True, blank=True)   # para exibição na tela
    status_esocial   = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table        = 'dp_folha_item'
        unique_together = [('folha', 'colaborador')]
        indexes = [
            models.Index(fields=['colaborador', 'folha']),
        ]

    def __str__(self):
        return f'{self.colaborador.nome} — {self.folha.competencia}'


# ── Evento de Folha (proventos/descontos variáveis) ───────────
class EventoFolha(BaseModel):
    TIPOS = [
        ('provento',  'Provento'),
        ('desconto',  'Desconto'),
        ('informativo','Informativo'),
    ]

    colaborador = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='eventos_folha')
    competencia = models.CharField(max_length=7)
    tipo        = models.CharField(max_length=12, choices=TIPOS)
    codigo      = models.CharField(max_length=10, blank=True)
    descricao   = models.CharField(max_length=200)
    quantidade  = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    valor       = models.DecimalField(max_digits=10, decimal_places=2)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'dp_evento_folha'
        ordering = ['competencia', 'tipo']

    def __str__(self):
        return f'{self.descricao} — {self.colaborador.nome} ({self.competencia})'


# ── Férias ────────────────────────────────────────────────────
class Ferias(BaseAuditModel):
    STATUS = [
        ('pendente',   'Pendente Aprovação'),
        ('aprovada',   'Aprovada'),
        ('recusada',   'Recusada'),
        ('em_gozo',    'Em Gozo'),
        ('concluida',  'Concluída'),
        ('cancelada',  'Cancelada'),
    ]

    colaborador      = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='ferias')
    # Período aquisitivo
    periodo_inicio   = models.DateField(verbose_name='Início Período Aquisitivo')
    periodo_fim      = models.DateField(verbose_name='Fim Período Aquisitivo')
    # Período de gozo
    gozo_inicio      = models.DateField(null=True, blank=True)
    gozo_fim         = models.DateField(null=True, blank=True)
    dias_solicitados = models.IntegerField(default=30)
    dias_abono       = models.IntegerField(default=0, verbose_name='Dias de Abono Pecuniário')
    # Financeiro
    valor_ferias     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valor_terco      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_abono      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_inss       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_irrf       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_liquido    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    memoria_calculo  = models.JSONField(null=True, blank=True)
    # Fluxo
    status           = models.CharField(max_length=12, choices=STATUS, default='pendente', db_index=True)
    aprovado_por     = models.CharField(max_length=200, blank=True)
    aprovado_em      = models.DateTimeField(null=True, blank=True)
    recusado_motivo  = models.TextField(blank=True)
    observacoes      = models.TextField(blank=True)
    history          = HistoricalRecords()

    class Meta:
        db_table = 'dp_ferias'
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['colaborador', 'status']),
            models.Index(fields=['gozo_inicio']),
            models.Index(fields=['periodo_fim']),
        ]
        verbose_name        = 'Férias'
        verbose_name_plural = 'Férias'

    def __str__(self):
        return f'{self.colaborador.nome} — {self.dias_solicitados}d — {self.get_status_display()}'

    @property
    def dias_restantes_periodo(self):
        """Dias restantes até o vencimento do período aquisitivo."""
        hoje = timezone.now().date()
        delta = self.periodo_fim - hoje
        return delta.days


# ── 13º Salário ───────────────────────────────────────────────
class DecimoTerceiro(BaseAuditModel):
    STATUS   = [('pendente','Pendente'),('calculado','Calculado'),('pago','Pago'),('cancelado','Cancelado')]
    PARCELAS = [('1','1ª Parcela'),('2','2ª Parcela')]

    colaborador     = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='decimos')
    ano             = models.CharField(max_length=4)
    parcela         = models.CharField(max_length=1, choices=PARCELAS)
    meses_trabalhados = models.IntegerField(default=12, validators=[MinValueValidator(1), MaxValueValidator(12)])
    salario_base    = models.DecimalField(max_digits=12, decimal_places=2)
    valor_bruto     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valor_inss      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_irrf      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_liquido   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    memoria_calculo = models.JSONField(null=True, blank=True)
    status          = models.CharField(max_length=10, choices=STATUS, default='pendente')
    pago_em         = models.DateField(null=True, blank=True)
    history         = HistoricalRecords()

    class Meta:
        db_table        = 'dp_decimo_terceiro'
        unique_together = [('colaborador', 'ano', 'parcela')]
        ordering        = ['-ano', 'parcela']

    def __str__(self):
        return f'13º {self.ano} {self.get_parcela_display()} — {self.colaborador.nome}'


# ── Rescisão ──────────────────────────────────────────────────
class Rescisao(BaseAuditModel):
    TIPOS = [
        ('sem_justa_causa',  'Sem Justa Causa'),
        ('justa_causa',      'Justa Causa'),
        ('pedido_demissao',  'Pedido de Demissão'),
        ('acordo_mutuo',     'Acordo Mútuo (Art. 484-A)'),
        ('termino_contrato', 'Término de Contrato'),
        ('aposentadoria',    'Aposentadoria'),
        ('morte',            'Falecimento'),
    ]
    STATUS = [
        ('rascunho',   'Rascunho'),
        ('calculada',  'Calculada'),
        ('aprovada',   'Aprovada'),
        ('homologada', 'Homologada'),
        ('cancelada',  'Cancelada'),
    ]
    WIZARD_ETAPAS = ['tipo','aviso','pendencias','beneficios','conferencia','documentos','esocial']

    colaborador        = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='rescisoes')
    tipo               = models.CharField(max_length=20, choices=TIPOS)
    data_demissao      = models.DateField()
    # Aviso prévio
    aviso_previo_dias  = models.IntegerField(default=30)
    aviso_indenizado   = models.BooleanField(default=False)
    aviso_inicio       = models.DateField(null=True, blank=True)
    aviso_fim          = models.DateField(null=True, blank=True)
    # Valores discriminados
    saldo_salario      = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ferias_vencidas    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ferias_proporc     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    terco_ferias       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    decimo_proporc     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    aviso_previo_val   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fgts_saldo         = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    multa_fgts         = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    inss               = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    irrf               = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    outros_descontos   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_bruto        = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    total_liquido      = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    memoria_calculo    = models.JSONField(null=True, blank=True)
    dados_wizard       = models.JSONField(default=dict, blank=True)  # progresso do wizard
    etapa_atual        = models.IntegerField(default=1)
    # Workflow
    status             = models.CharField(max_length=12, choices=STATUS, default='rascunho', db_index=True)
    motivo_detalhado   = models.TextField(blank=True)
    homologado_em      = models.DateTimeField(null=True, blank=True)
    esocial_enviado    = models.BooleanField(default=False)
    esocial_retorno    = models.JSONField(null=True, blank=True)
    history            = HistoricalRecords()

    class Meta:
        db_table = 'dp_rescisao'
        ordering = ['-data_demissao']
        indexes  = [
            models.Index(fields=['colaborador', 'status']),
            models.Index(fields=['data_demissao']),
        ]
        verbose_name        = 'Rescisão'
        verbose_name_plural = 'Rescisões'

    def __str__(self):
        return f'{self.colaborador.nome} — {self.get_tipo_display()} ({self.data_demissao})'

    @property
    def progresso_wizard(self):
        return int((self.etapa_atual / len(self.WIZARD_ETAPAS)) * 100)


# ── Benefícios ────────────────────────────────────────────────
class Beneficio(BaseAuditModel):
    TIPOS = [
        ('va',           'Vale Alimentação'),
        ('vr',           'Vale Refeição'),
        ('vt',           'Vale Transporte'),
        ('saude',        'Plano de Saúde'),
        ('odonto',       'Plano Odontológico'),
        ('seguro_vida',  'Seguro de Vida'),
        ('gympass',      'Gympass/Wellhub'),
        ('telemedicina', 'Telemedicina'),
        ('creche',       'Auxílio Creche'),
        ('educacao',     'Auxílio Educação'),
        ('outro',        'Outro'),
    ]

    nome          = models.CharField(max_length=150)
    tipo          = models.CharField(max_length=15, choices=TIPOS)
    descricao     = models.TextField(blank=True)
    fornecedor    = models.CharField(max_length=100, blank=True)
    valor_empresa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Valor pago pela empresa')
    valor_colab   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Desconto do colaborador')
    recorrencia   = models.CharField(max_length=20, default='mensal', blank=True)
    elegibilidade = models.TextField(blank=True, verbose_name='Regras de elegibilidade')
    ativo         = models.BooleanField(default=True)
    history       = HistoricalRecords()

    class Meta:
        db_table = 'dp_beneficio'
        ordering = ['tipo', 'nome']
        verbose_name        = 'Benefício'
        verbose_name_plural = 'Benefícios'

    def __str__(self):
        return f'{self.nome} ({self.get_tipo_display()})'


class ColaboradorBeneficio(BaseModel):
    colaborador   = models.ForeignKey('rh.Colaborador', on_delete=models.CASCADE, related_name='beneficios')
    beneficio     = models.ForeignKey(Beneficio, on_delete=models.CASCADE, related_name='colaboradores')
    status        = models.CharField(max_length=10, default='ativo', choices=[('ativo','Ativo'),('cancelado','Cancelado'),('suspenso','Suspenso')])
    data_inicio   = models.DateField(default=timezone.now)
    data_fim      = models.DateField(null=True, blank=True)
    valor_empresa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_colab   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    observacoes   = models.TextField(blank=True)

    class Meta:
        db_table        = 'dp_colaborador_beneficio'
        unique_together = [('colaborador', 'beneficio')]
        verbose_name        = 'Benefício do Colaborador'
        verbose_name_plural = 'Benefícios dos Colaboradores'

    def __str__(self):
        return f'{self.colaborador.nome} — {self.beneficio.nome}'


# ── Admissão / Onboarding DP ──────────────────────────────────
class AdmissaoDP(BaseAuditModel):
    STATUS = [
        ('iniciada',    'Iniciada'),
        ('doc_pendente','Documentação Pendente'),
        ('doc_completa','Documentação Completa'),
        ('integrado',   'Integrado aos Sistemas'),
        ('concluida',   'Concluída'),
    ]

    colaborador   = models.OneToOneField('rh.Colaborador', on_delete=models.CASCADE, related_name='admissao_dp')
    status        = models.CharField(max_length=15, choices=STATUS, default='iniciada')
    checklist     = models.JSONField(default=dict, blank=True)   # {doc_id: {ok, data}}
    contratos_gerados = models.BooleanField(default=False)
    acesso_sistemas   = models.BooleanField(default=False)
    exame_admissional = models.BooleanField(default=False)
    epi_entregue      = models.BooleanField(default=False)
    esocial_enviado   = models.BooleanField(default=False)
    esocial_retorno   = models.JSONField(null=True, blank=True)
    observacoes       = models.TextField(blank=True)
    history           = HistoricalRecords()

    class Meta:
        db_table = 'dp_admissao'
        verbose_name        = 'Admissão DP'
        verbose_name_plural = 'Admissões DP'

    def __str__(self):
        return f'Admissão: {self.colaborador.nome} ({self.get_status_display()})'

    @property
    def pct_checklist(self):
        if not self.checklist:
            return 0
        itens = list(self.checklist.values())
        ok    = sum(1 for i in itens if i.get('ok'))
        return int(ok / len(itens) * 100) if itens else 0


# ── Notificação DP ────────────────────────────────────────────
class NotificacaoDP(BaseModel):
    TIPOS = [
        ('ferias_vencendo',     'Férias Vencendo'),
        ('ferias_vencida',      'Férias Vencida'),
        ('experiencia_15d',     'Avaliação 15 Dias'),
        ('experiencia_45d',     'Avaliação 45 Dias'),
        ('prazo_legal',         'Prazo Legal'),
        ('falta_registrada',    'Falta Registrada'),
        ('admissao_pendente',   'Admissão Pendente'),
        ('rescisao_pendente',   'Rescisão Pendente'),
        ('decimo_vencendo',     '13º Vencendo'),
        ('inconsistencia',      'Inconsistência Detectada'),
        ('alerta_geral',        'Alerta Geral'),
    ]
    PRIORIDADES = [('critica','Crítica'),('alta','Alta'),('normal','Normal'),('baixa','Baixa')]

    colaborador = models.ForeignKey('rh.Colaborador', null=True, blank=True, on_delete=models.SET_NULL, related_name='notificacoes_dp')
    tipo        = models.CharField(max_length=25, choices=TIPOS, db_index=True)
    titulo      = models.CharField(max_length=200)
    mensagem    = models.TextField()
    prioridade  = models.CharField(max_length=8, choices=PRIORIDADES, default='normal', db_index=True)
    lida        = models.BooleanField(default=False, db_index=True)
    lida_em     = models.DateTimeField(null=True, blank=True)
    dados       = models.JSONField(default=dict, blank=True)
    acao_url    = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'dp_notificacao'
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['lida', 'prioridade']),
            models.Index(fields=['tipo', 'created_at']),
        ]
        verbose_name        = 'Notificação DP'
        verbose_name_plural = 'Notificações DP'

    def __str__(self):
        return f'[{self.get_prioridade_display()}] {self.titulo}'

    def marcar_lida(self):
        self.lida    = True
        self.lida_em = timezone.now()
        self.save(update_fields=['lida', 'lida_em'])
