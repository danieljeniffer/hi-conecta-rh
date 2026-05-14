"""
apps/accounts/models.py — Usuário customizado com RBAC completo.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('E-mail obrigatório.')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('perfil', 'admin')
        return self.create_user(email, password, **extra)


class Usuario(AbstractBaseUser, PermissionsMixin):
    PERFIS = [
        ('admin',       'Administrador'),
        ('rh',          'Gestor de RH'),
        ('analista',    'Analista de RH'),
        ('gestor',      'Gestor de Equipe'),
        ('colaborador', 'Colaborador'),
        ('juridico',    'Jurídico'),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email          = models.EmailField(unique=True, verbose_name='E-mail')
    nome           = models.CharField(max_length=200, verbose_name='Nome Completo')
    perfil         = models.CharField(max_length=20, choices=PERFIS, default='colaborador')
    foto           = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)
    colaborador    = models.OneToOneField(
        'rh.Colaborador', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='usuario',
        verbose_name='Colaborador Vinculado'
    )

    is_staff      = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    ultimo_acesso = models.DateTimeField(null=True, blank=True)
    ultimo_ip     = models.GenericIPAddressField(null=True, blank=True)

    # Segurança
    trocar_senha   = models.BooleanField(default=False, verbose_name='Forçar troca na próxima sessão')
    reset_token    = models.CharField(max_length=100, blank=True)
    reset_expira   = models.DateTimeField(null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        db_table            = 'accounts_usuario'
        verbose_name        = 'Usuário'
        verbose_name_plural = 'Usuários'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['perfil']),
        ]

    def __str__(self):
        return f'{self.nome} ({self.get_perfil_display()})'

    @property
    def iniciais(self):
        partes = self.nome.split()
        return ''.join(p[0] for p in partes[:2]).upper()

    @property
    def is_rh(self):
        return self.perfil in ('rh', 'admin')

    @property
    def is_gestor(self):
        return self.perfil in ('gestor', 'rh', 'admin', 'analista')

    def registrar_acesso(self, ip=None):
        self.ultimo_acesso = timezone.now()
        if ip:
            self.ultimo_ip = ip
        self.save(update_fields=['ultimo_acesso', 'ultimo_ip'])
