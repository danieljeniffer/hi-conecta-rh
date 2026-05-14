"""
apps/core/permissions.py — RBAC completo.
Decorators, mixins e permissões por perfil.
"""
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden
from rest_framework.permissions import BasePermission


# ── Hierarquia de perfis ──────────────────────────────────────
NIVEIS = {
    'colaborador': 1,
    'juridico':    2,
    'analista':    3,
    'gestor':      4,
    'rh':          5,
    'admin':       6,
}

# ── Matrix de permissões por módulo ──────────────────────────
MATRIX = {
    'admin': {
        '*': ['view', 'create', 'edit', 'delete', 'export', 'approve'],
    },
    'rh': {
        'rh':           ['view', 'create', 'edit', 'delete', 'export'],
        'dp':           ['view', 'create', 'edit', 'delete', 'export', 'approve'],
        'recrutamento': ['view', 'create', 'edit', 'delete'],
        'analytics':    ['view', 'export'],
        'inteligencia': ['view'],
        'documentos':   ['view', 'create', 'edit', 'delete'],
        'ouvidoria':    ['view', 'edit'],
        'gestor':       ['view', 'create', 'edit'],
        'colaborador':  ['view'],
        'comunicacao':  ['view', 'create', 'edit'],
    },
    'analista': {
        'rh':           ['view', 'create', 'edit'],
        'dp':           ['view', 'create', 'edit', 'export'],
        'recrutamento': ['view', 'create', 'edit'],
        'documentos':   ['view', 'create', 'edit'],
        'ouvidoria':    ['view', 'edit'],
        'comunicacao':  ['view', 'create'],
    },
    'gestor': {
        'rh':           ['view'],
        'gestor':       ['view', 'create', 'edit'],
        'analytics':    ['view'],
        'colaborador':  ['view'],
        'comunicacao':  ['view'],
    },
    'juridico': {
        'documentos':   ['view', 'edit'],
        'ouvidoria':    ['view', 'edit'],
        'dp':           ['view'],
    },
    'colaborador': {
        'colaborador':  ['view', 'edit'],
        'comunicacao':  ['view'],
    },
}


def get_permissoes(perfil, modulo):
    """Retorna lista de ações permitidas para perfil + módulo."""
    matrix = MATRIX.get(perfil, {})
    return matrix.get('*', []) or matrix.get(modulo, [])


def tem_permissao(usuario, modulo, acao='view'):
    """Verifica se usuário tem permissão para ação no módulo."""
    if not usuario or not usuario.is_authenticated:
        return False
    perfil = getattr(usuario, 'perfil', 'colaborador')
    return acao in get_permissoes(perfil, modulo)


# ── Decorator para views baseadas em função ───────────────────
def requer_perfil(*perfis):
    """Exige que o usuário tenha um dos perfis listados."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                from django.shortcuts import redirect
                return redirect('accounts:login')
            if getattr(request.user, 'perfil', None) not in perfis:
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
                from django.shortcuts import redirect
                return redirect('accounts:login')
            nivel_usuario = NIVEIS.get(getattr(request.user, 'perfil', 'colaborador'), 0)
            if nivel_usuario < NIVEIS.get(nivel_minimo, 99):
                raise PermissionDenied
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def requer_permissao(modulo, acao='view'):
    """Exige permissão específica no módulo."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not tem_permissao(request.user, modulo, acao):
                raise PermissionDenied
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# ── Mixins para views baseadas em classe ──────────────────────
class PerfilRequeridoMixin(LoginRequiredMixin):
    """Mixin que verifica perfil na CBV."""
    perfis_permitidos = []

    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        if request.user.is_authenticated:
            if self.perfis_permitidos and getattr(request.user, 'perfil', None) not in self.perfis_permitidos:
                raise PermissionDenied
        return result


class NivelMinimoMixin(LoginRequiredMixin):
    """Mixin que verifica nível mínimo na CBV."""
    nivel_minimo = 'colaborador'

    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        if request.user.is_authenticated:
            nivel = NIVEIS.get(getattr(request.user, 'perfil', 'colaborador'), 0)
            if nivel < NIVEIS.get(self.nivel_minimo, 99):
                raise PermissionDenied
        return result


# ── DRF Permissions ───────────────────────────────────────────
class IsRH(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                getattr(request.user, 'perfil', '') in ('rh', 'admin'))


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                getattr(request.user, 'perfil', '') == 'admin')


class IsGestorOrRH(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                getattr(request.user, 'perfil', '') in ('gestor', 'rh', 'admin', 'analista'))


class IsOwnerOrRH(BasePermission):
    """Para recursos do colaborador: dono pode acessar, RH também."""
    def has_object_permission(self, request, view, obj):
        perfil = getattr(request.user, 'perfil', '')
        if perfil in ('rh', 'admin', 'analista', 'gestor'):
            return True
        colaborador_id = getattr(obj, 'colaborador_id', None) or getattr(obj, 'id', None)
        return str(colaborador_id) == str(getattr(request.user, 'colaborador_id', None))
