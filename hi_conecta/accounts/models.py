"""
accounts/models.py
Usuário customizado com RBAC por perfil e segurança enterprise.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('E-mail é obrigatório.')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('perfil', 'admin')
        if not extra['is_staff']:
            raise ValueError('Superuser precisa de is_staff=True.')
        return self.create_user(email, password, **extra)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Usuário central do sistema hi Conecta RH.
    Substituí o User padrão do Django.
    """
    PERFIS = [
        ('admin',       'Administrador'),
        ('rh',          'Gestor de RH'),
        ('analista',    'Analista de RH'),
        ('gestor',      'Gestor de Equipe'),
        ('colaborador', 'Colaborador'),
        ('juridico',    'Jurídico'),
    ]

    id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email   = models.EmailField(_('e-mail'), unique=True, db_index=True)
    nome    = models.CharField(_('nome completo'), max_length=200)
    perfil  = models.CharField(max_length=20, choices=PERFIS, default='colaborador', db_index=True)
    foto    = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)

    # Vínculo com colaborador (preenchido após onboarding)
    colaborador_id = models.UUIDField(null=True, blank=True, db_index=True)

    # Status
    is_staff  = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Segurança
    trocar_senha   = models.BooleanField(default=False, help_text='Força troca na próxima sessão')
    tentativas_login = models.SmallIntegerField(default=0)
    bloqueado_ate  = models.DateTimeField(null=True, blank=True)
    reset_token    = models.CharField(max_length=128, blank=True)
    reset_expira   = models.DateTimeField(null=True, blank=True)

    # Rastreio
    ultimo_acesso = models.DateTimeField(null=True, blank=True)
    ultimo_ip     = models.GenericIPAddressField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        db_table            = 'accounts_usuario'
        verbose_name        = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering            = ['nome']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['perfil', 'is_active']),
        ]

    def __str__(self):
        return f'{self.nome} <{self.email}> [{self.get_perfil_display()}]'

    # ── Propriedades de perfil ────────────────────────────────
    @property
    def iniciais(self):
        partes = self.nome.strip().split()
        return ''.join(p[0] for p in partes[:2]).upper() if partes else '?'

    @property
    def primeiro_nome(self):
        return self.nome.split()[0] if self.nome else ''

    @property
    def is_admin(self):
        return self.perfil == 'admin'

    @property
    def is_rh(self):
        return self.perfil in ('admin', 'rh')

    @property
    def is_gestor_ou_rh(self):
        return self.perfil in ('admin', 'rh', 'analista', 'gestor')

    @property
    def nivel(self):
        """Nível numérico para comparação de hierarquia."""
        niveis = {'colaborador': 1, 'juridico': 2, 'analista': 3,
                  'gestor': 4, 'rh': 5, 'admin': 6}
        return niveis.get(self.perfil, 0)

    # ── Ações ─────────────────────────────────────────────────
    def registrar_acesso(self, ip=None):
        self.ultimo_acesso = timezone.now()
        if ip:
            self.ultimo_ip = ip
        self.tentativas_login = 0
        self.save(update_fields=['ultimo_acesso', 'ultimo_ip', 'tentativas_login'])

    def esta_bloqueado(self):
        if self.bloqueado_ate and timezone.now() < self.bloqueado_ate:
            return True
        return False


# ── Tabela de permissões por módulo ──────────────────────────
class PermissaoModulo(models.Model):
    """
    Permissões específicas por perfil e módulo.
    Permite customização além do RBAC padrão.
    """
    ACOES = [
        ('visualizar', 'Visualizar'),
        ('criar',      'Criar'),
        ('editar',     'Editar'),
        ('excluir',    'Excluir'),
        ('exportar',   'Exportar'),
        ('aprovar',    'Aprovar'),
    ]

    perfil  = models.CharField(max_length=20, choices=Usuario.PERFIS)
    modulo  = models.CharField(max_length=50)
    acao    = models.CharField(max_length=20, choices=ACOES)
    ativo   = models.BooleanField(default=True)

    class Meta:
        db_table        = 'accounts_permissao_modulo'
        unique_together = ('perfil', 'modulo', 'acao')
        verbose_name        = 'Permissão de Módulo'
        verbose_name_plural = 'Permissões de Módulos'

    def __str__(self):
        return f'{self.perfil} → {self.modulo} → {self.acao}'


# ── Log de sessões ────────────────────────────────────────────
class SessaoUsuario(models.Model):
    """Rastreio de sessões ativas e histórico de acessos."""
    usuario    = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='sessoes')
    token_jti  = models.CharField(max_length=128, unique=True)  # JWT ID
    ip         = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    criada_em  = models.DateTimeField(auto_now_add=True)
    expira_em  = models.DateTimeField()
    ativa      = models.BooleanField(default=True)
    encerrada_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'accounts_sessao_usuario'
        ordering = ['-criada_em']
        indexes  = [models.Index(fields=['token_jti']), models.Index(fields=['usuario', 'ativa'])]

    def __str__(self):
        return f'Sessão {self.usuario.email} — {self.criada_em:%d/%m/%Y %H:%M}'
