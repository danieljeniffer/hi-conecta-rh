"""integracoes/models.py — Estrutura para integrações externas (Bitrix24, eSocial, Caju, Wellhub)."""
from django.db import models
from core.models import BaseModel


class IntegracaoConfig(BaseModel):
    SISTEMAS = [
        ('bitrix24', 'Bitrix24'),
        ('esocial',  'eSocial'),
        ('caju',     'Caju (Benefícios Flexíveis)'),
        ('wellhub',  'Wellhub (Gympass)'),
        ('generico', 'API Genérica'),
    ]
    STATUS = [
        ('ativa',      'Ativa'),
        ('inativa',    'Inativa'),
        ('erro',       'Com Erro'),
        ('configurando','Configurando'),
    ]

    sistema         = models.CharField(max_length=20, choices=SISTEMAS, unique=True)
    status          = models.CharField(max_length=15, choices=STATUS, default='inativa')
    url_base        = models.URLField(blank=True)
    webhook_url     = models.URLField(blank=True)
    api_key         = models.CharField(max_length=500, blank=True)  # armazenar criptografado em prod
    config_extra    = models.JSONField(default=dict, blank=True)
    ultimo_sync     = models.DateTimeField(null=True, blank=True)
    ultimo_erro     = models.TextField(blank=True)
    sync_automatico = models.BooleanField(default=False)
    intervalo_sync_min = models.IntegerField(default=60)

    class Meta:
        db_table = 'integracoes_config'
        verbose_name = 'Configuração de Integração'
        verbose_name_plural = 'Configurações de Integração'

    def __str__(self):
        return f'{self.get_sistema_display()} — {self.get_status_display()}'


class LogIntegracao(BaseModel):
    ACOES = [
        ('sync_employee',   'Sincronizar Colaborador'),
        ('sync_department', 'Sincronizar Departamento'),
        ('push_event',      'Enviar Evento'),
        ('webhook_received','Webhook Recebido'),
        ('send_esocial',    'Enviar eSocial'),
        ('pull_data',       'Buscar Dados'),
    ]
    STATUS = [
        ('sucesso', 'Sucesso'),
        ('erro',    'Erro'),
        ('pendente','Pendente'),
    ]

    integracao  = models.ForeignKey(IntegracaoConfig, on_delete=models.CASCADE, related_name='logs')
    acao        = models.CharField(max_length=25, choices=ACOES)
    status      = models.CharField(max_length=10, choices=STATUS, default='pendente')
    payload     = models.JSONField(default=dict, blank=True)
    resposta    = models.JSONField(default=dict, blank=True)
    erro        = models.TextField(blank=True)
    duracao_ms  = models.IntegerField(default=0)
    referencia_id = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'integracoes_log'
        ordering = ['-created_at']
        verbose_name = 'Log de Integração'
        verbose_name_plural = 'Logs de Integração'

    def __str__(self):
        return f'{self.integracao.sistema} — {self.acao} — {self.status}'


class FilaSincronizacao(BaseModel):
    STATUS = [
        ('pendente',    'Pendente'),
        ('processando', 'Processando'),
        ('concluido',   'Concluído'),
        ('erro',        'Erro'),
        ('ignorado',    'Ignorado'),
    ]

    integracao      = models.ForeignKey(IntegracaoConfig, on_delete=models.CASCADE, related_name='fila')
    tipo_objeto     = models.CharField(max_length=50)  # 'colaborador', 'departamento', etc
    objeto_id       = models.CharField(max_length=50)
    acao            = models.CharField(max_length=20)  # 'criar', 'atualizar', 'deletar'
    status          = models.CharField(max_length=15, choices=STATUS, default='pendente')
    tentativas      = models.IntegerField(default=0)
    max_tentativas  = models.IntegerField(default=3)
    processado_em   = models.DateTimeField(null=True, blank=True)
    erro            = models.TextField(blank=True)
    dados           = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'integracoes_fila'
        ordering = ['created_at']
        verbose_name = 'Fila de Sincronização'

    def __str__(self):
        return f'{self.integracao.sistema} — {self.tipo_objeto}/{self.objeto_id} ({self.status})'
