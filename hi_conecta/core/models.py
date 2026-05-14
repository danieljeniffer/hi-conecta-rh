"""
core/models.py
Modelos base reutilizáveis em toda a aplicação.
"""
import uuid
from django.db import models
from django.utils import timezone


# ── Managers ─────────────────────────────────────────────────

class SoftDeleteManager(models.Manager):
    """Exclui registros com deleted_at por padrão."""
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def com_deletados(self):
        return super().get_queryset()

    def apenas_deletados(self):
        return super().get_queryset().filter(deleted_at__isnull=False)


# ── Mixins / Base Models ──────────────────────────────────────

class TimestampMixin(models.Model):
    """Adiciona created_at e updated_at automáticos."""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True,     verbose_name='Atualizado em')

    class Meta:
        abstract = True


class UUIDMixin(models.Model):
    """ID como UUID — evita enumeração sequencial."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class SoftDeleteMixin(models.Model):
    """Soft delete — registros nunca são apagados fisicamente."""
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name='Deletado em')

    objects     = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def deletar(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def restaurar(self):
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])

    @property
    def deletado(self):
        return self.deleted_at is not None


class AuditMixin(models.Model):
    """Rastreia quem criou e quem atualizou o registro."""
    criado_por    = models.ForeignKey(
        'accounts.Usuario', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='+',
        verbose_name='Criado por'
    )
    atualizado_por = models.ForeignKey(
        'accounts.Usuario', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='+',
        verbose_name='Atualizado por'
    )

    class Meta:
        abstract = True


class BaseModel(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Modelo base completo: UUID + timestamps + soft delete."""
    class Meta:
        abstract = True
        ordering = ['-created_at']


class BaseAuditModel(UUIDMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """Modelo base com auditoria completa."""
    class Meta:
        abstract = True
        ordering = ['-created_at']


# ── Log de Auditoria ──────────────────────────────────────────

class LogAuditoria(models.Model):
    """
    Trilha de auditoria de todas as ações sensíveis do sistema.
    Não pode ser deletado — apenas inserido.
    """
    ACOES = [
        ('LOGIN',          'Login'),
        ('LOGIN_API',      'Login via API'),
        ('LOGOUT',         'Logout'),
        ('LOGOUT_API',     'Logout via API'),
        ('ALTERAR_SENHA',  'Alteração de Senha'),
        ('CRIAR',          'Criação'),
        ('EDITAR',         'Edição'),
        ('EXCLUIR',        'Exclusão'),
        ('EXPORTAR',       'Exportação'),
        ('APROVAR',        'Aprovação'),
        ('REJEITAR',       'Rejeição'),
        ('VISUALIZAR',     'Visualização'),
        ('CALCULAR',       'Cálculo'),
        ('UPLOAD',         'Upload de Arquivo'),
        ('DOWNLOAD',       'Download de Arquivo'),
    ]

    id          = models.BigAutoField(primary_key=True)
    usuario     = models.ForeignKey(
        'accounts.Usuario', null=True, on_delete=models.SET_NULL,
        related_name='logs_auditoria'
    )
    acao        = models.CharField(max_length=30, choices=ACOES, db_index=True)
    recurso     = models.CharField(max_length=100, db_index=True)
    recurso_id  = models.CharField(max_length=100, blank=True)
    descricao   = models.TextField(blank=True)
    dados_antes = models.JSONField(null=True, blank=True)
    dados_depois= models.JSONField(null=True, blank=True)
    ip          = models.GenericIPAddressField(null=True, blank=True)
    user_agent  = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table            = 'core_log_auditoria'
        ordering            = ['-created_at']
        verbose_name        = 'Log de Auditoria'
        verbose_name_plural = 'Logs de Auditoria'
        indexes = [
            models.Index(fields=['usuario', 'created_at']),
            models.Index(fields=['recurso', 'recurso_id']),
            models.Index(fields=['acao', 'created_at']),
        ]

    def __str__(self):
        return f'{self.acao} | {self.recurso} | {self.usuario} | {self.created_at:%d/%m/%Y %H:%M}'

    @classmethod
    def registrar(cls, usuario=None, acao='', recurso='', recurso_id='',
                  descricao='', dados_antes=None, dados_depois=None,
                  ip=None, user_agent=''):
        """Helper para criar log de forma simplificada."""
        try:
            cls.objects.create(
                usuario=usuario,
                acao=acao,
                recurso=recurso,
                recurso_id=str(recurso_id) if recurso_id else '',
                descricao=descricao,
                dados_antes=dados_antes,
                dados_depois=dados_depois,
                ip=ip,
                user_agent=str(user_agent)[:500],
            )
        except Exception:
            pass  # Nunca deixa log quebrar o fluxo


# ── Configuração do Sistema ────────────────────────────────────

class Configuracao(models.Model):
    """Configurações globais chave-valor do sistema."""
    chave      = models.CharField(max_length=100, unique=True)
    valor      = models.TextField()
    descricao  = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'core_configuracao'
        verbose_name        = 'Configuração'
        verbose_name_plural = 'Configurações'
        ordering            = ['chave']

    def __str__(self):
        return f'{self.chave} = {self.valor[:50]}'

    @classmethod
    def get(cls, chave, default=None):
        try:
            return cls.objects.get(chave=chave).valor
        except cls.DoesNotExist:
            return default

    @classmethod
    def set(cls, chave, valor, descricao=''):
        obj, _ = cls.objects.update_or_create(
            chave=chave,
            defaults={'valor': str(valor), 'descricao': descricao}
        )
        return obj
