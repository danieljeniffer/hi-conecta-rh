"""
apps/core/models.py — Modelos base para todos os apps.
Soft delete, timestamps, auditoria e UUID.
"""
import uuid
from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords


class BaseManager(models.Manager):
    """Manager que exclui registros deletados por padrão."""
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def with_deleted(self):
        return super().get_queryset()

    def deleted_only(self):
        return super().get_queryset().filter(deleted_at__isnull=False)


class BaseModel(models.Model):
    """Modelo base com UUID, timestamps e soft delete."""
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name='Deletado em')

    objects     = BaseManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])

    @property
    def is_deleted(self):
        return self.deleted_at is not None


class AuditedModel(BaseModel):
    """Modelo com auditoria completa de quem criou/atualizou."""
    created_by = models.ForeignKey(
        'accounts.Usuario', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='+',
        verbose_name='Criado por'
    )
    updated_by = models.ForeignKey(
        'accounts.Usuario', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='+',
        verbose_name='Atualizado por'
    )
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True


class AuditLog(models.Model):
    """Trilha de auditoria de ações sensíveis."""
    ACOES = [
        ('CREATE',   'Criação'),
        ('UPDATE',   'Atualização'),
        ('DELETE',   'Exclusão'),
        ('LOGIN',    'Login'),
        ('LOGOUT',   'Logout'),
        ('EXPORT',   'Exportação'),
        ('CALCULAR', 'Cálculo'),
        ('APROVAR',  'Aprovação'),
        ('REJEITAR', 'Rejeição'),
        ('ASSINAR',  'Assinatura'),
        ('VIEW',     'Visualização'),
    ]

    id          = models.BigAutoField(primary_key=True)
    usuario     = models.ForeignKey('accounts.Usuario', null=True, on_delete=models.SET_NULL, related_name='audit_logs')
    acao        = models.CharField(max_length=20, choices=ACOES)
    recurso     = models.CharField(max_length=100)
    recurso_id  = models.CharField(max_length=100, blank=True)
    dados_antes = models.JSONField(null=True, blank=True)
    dados_depois= models.JSONField(null=True, blank=True)
    ip          = models.GenericIPAddressField(null=True, blank=True)
    user_agent  = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'core_audit_log'
        ordering  = ['-created_at']
        indexes   = [
            models.Index(fields=['usuario', 'created_at']),
            models.Index(fields=['recurso', 'recurso_id']),
            models.Index(fields=['acao', 'created_at']),
        ]
        verbose_name        = 'Log de Auditoria'
        verbose_name_plural = 'Logs de Auditoria'

    def __str__(self):
        return f'{self.acao} · {self.recurso} · {self.usuario} · {self.created_at:%d/%m/%Y %H:%M}'


class Configuracao(models.Model):
    """Configurações globais do sistema."""
    chave      = models.CharField(max_length=100, unique=True)
    valor      = models.TextField()
    descricao  = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_configuracao'
        verbose_name = 'Configuração'
        verbose_name_plural = 'Configurações'

    def __str__(self):
        return f'{self.chave} = {self.valor[:50]}'

    @classmethod
    def get(cls, chave, default=None):
        try:
            return cls.objects.get(chave=chave).valor
        except cls.DoesNotExist:
            return default
