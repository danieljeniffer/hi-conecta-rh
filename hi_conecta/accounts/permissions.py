"""
accounts/permissions.py
RBAC completo: decorators, mixins e DRF permissions.
"""
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger('accounts')

# ── Hierarquia de perfis ──────────────────────────────────────
NIVEIS = {
    'colaborador': 1,
    'juridico':    2,
    'analista':    3,
    'gestor':      4,
    'rh':          5,
    'admin':       6,
}

# ── Matrix de permissões por módulo/ação ──────────────────────
MATRIX = {
    'admin': {'*': ['visualizar', 'criar', 'editar', 'excluir', 'exportar', 'aprovar']},
    'rh': {
        'rh':           ['visualizar', 'criar', 'editar', 'excluir', 'exportar'],
        'dp':           ['visualizar', 'criar', 'editar', 'excluir', 'exportar', 'aprovar'],
        'recrutamento': ['visualizar', 'criar', 'editar', 'excluir'],
        'colaborador':  ['visualizar'],
        'analytics':    ['visualizar', 'exportar'],
        'inteligencia': ['visualizar'],
        'documentos':   ['visualizar', 'criar', 'editar', 'excluir'],
        'ouvidoria':    ['visualizar', 'editar'],
        'comunicacao':  ['visualizar', 'criar', 'editar'],
        'treinamento':  ['visualizar', 'criar', 'editar'],
        'gamificacao':  ['visualizar', 'criar', 'editar'],
        'endomarketing':['visualizar', 'criar', 'editar'],
        'gestor':       ['visualizar', 'criar', 'editar'],
    },
    'analista': {
        'rh':           ['visualizar', 'criar', 'editar'],
        'dp':           ['visualizar', 'criar', 'editar', 'exportar'],
        'recrutamento': ['visualizar', 'criar', 'editar'],
        'documentos':   ['visualizar', 'criar', 'editar'],
        'ouvidoria':    ['visualizar', 'editar'],
        'comunicacao':  ['visualizar', 'criar'],
        'treinamento':  ['visualizar', 'criar'],
    },
    'gestor': {
        'rh':           ['visualizar'],
        'gestor':       ['visualizar', 'criar', 'editar'],
        'analytics':    ['visualizar'],
        'colaborador':  ['visualizar'],
        'comunicacao':  ['visualizar'],
        'treinamento':  ['visualizar'],
    },
    'juridico': {
        'documentos':   ['visualizar', 'editar'],
        'ouvidoria':    ['visualizar', 'editar'],
        'dp':           ['visualizar'],
    },
    'colaborador': {
        'colaborador':  ['visualizar', 'editar'],
        'comunicacao':  ['visualizar'],
        'treinamento':  ['visualizar'],
        'gamificacao':  ['visualizar'],
    },
}


def tem_permissao(usuario, modulo, acao='visualizar') -> bool:
    """Verifica permissão de um usuário para módulo+ação."""
    if not usuario or not usuario.is_authenticated:
        return False
    perfil = getattr(usuario, 'perfil', 'colaborador')
    regras = MATRIX.get(perfil, {})
    # Admin tem tudo
    if '*' in regras and acao in regras['*']:
        return True
    return acao in regras.get(modulo, [])


def get_permissoes(perfil, modulo) -> list:
    """Retorna lista de ações permitidas para perfil+módulo."""
    regras = MATRIX.get(perfil, {})
    if '*' in regras:
        return regras['*']
    return regras.get(modulo, [])


# ── Decorators para views (function-based) ────────────────────

def requer_login(view_func):
    """Exige que o usuário esteja autenticado."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(f'/accounts/login/?next={request.path}')
        return view_func(request, *args, **kwargs)
    return wrapper


def requer_perfil(*perfis):
    """Exige que o usuário tenha um dos perfis listados."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/accounts/login/?next={request.path}')
            if getattr(request.user, 'perfil', None) not in perfis:
                logger.warning('Acesso negado: %s tentou acessar %s (perfis: %s)',
                               request.user.email, request.path, perfis)
                raise PermissionDenied
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def requer_nivel(nivel_minimo):
    """Exige nível mínimo na hierarquia de perfis."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/accounts/login/?next={request.path}')
            nivel_user = NIVEIS.get(getattr(request.user, 'perfil', 'colaborador'), 0)
            nivel_req  = NIVEIS.get(nivel_minimo, 99)
            if nivel_user < nivel_req:
                raise PermissionDenied
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def requer_permissao(modulo, acao='visualizar'):
    """Exige permissão específica para módulo+ação."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/accounts/login/?next={request.path}')
            if not tem_permissao(request.user, modulo, acao):
                logger.warning('Sem permissão: %s → %s:%s em %s',
                               request.user.email, modulo, acao, request.path)
                raise PermissionDenied
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# ── Mixins para Class-Based Views ─────────────────────────────

class LoginObrigatorioMixin(LoginRequiredMixin):
    login_url = '/accounts/login/'

    def handle_no_permission(self):
        if self.request.user.is_authenticated:
            raise PermissionDenied
        return super().handle_no_permission()


class PerfilRequeridoMixin(LoginObrigatorioMixin):
    perfis_permitidos = []

    def dispatch(self, request, *args, **kwargs):
        resp = super().dispatch(request, *args, **kwargs)
        if request.user.is_authenticated:
            if self.perfis_permitidos and request.user.perfil not in self.perfis_permitidos:
                raise PermissionDenied
        return resp


class NivelMinimoMixin(LoginObrigatorioMixin):
    nivel_minimo = 'colaborador'

    def dispatch(self, request, *args, **kwargs):
        resp = super().dispatch(request, *args, **kwargs)
        if request.user.is_authenticated:
            nivel_user = NIVEIS.get(request.user.perfil, 0)
            nivel_req  = NIVEIS.get(self.nivel_minimo, 99)
            if nivel_user < nivel_req:
                raise PermissionDenied
        return resp


# ── DRF Permissions ───────────────────────────────────────────

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil == 'admin'


class IsRH(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ('admin', 'rh')


class IsGestorOuRH(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.perfil in ('admin', 'rh', 'analista', 'gestor'))


class IsAnalista(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ('admin', 'rh', 'analista')


class IsOwnerOuRH(BasePermission):
    """Colaborador acessa apenas seus próprios dados; RH+ acessa tudo."""
    def has_object_permission(self, request, view, obj):
        perfil = getattr(request.user, 'perfil', 'colaborador')
        if perfil in ('admin', 'rh', 'analista', 'gestor'):
            return True
        obj_id = str(getattr(obj, 'colaborador_id', None) or getattr(obj, 'id', None))
        user_id = str(getattr(request.user, 'colaborador_id', None) or request.user.id)
        return obj_id == user_id
