"""
apps/core/middleware.py — Middlewares customizados.
Auditoria automática e contexto de perfil.
"""
import logging
from .models import AuditLog

logger = logging.getLogger('security')


class AuditMiddleware:
    """Registra automaticamente ações nas rotas sensitivas."""

    ROTAS_AUDITADAS = {
        '/dp/': 'DP',
        '/rh/colaboradores/': 'RH',
        '/documentos/': 'Documentos',
        '/ouvidoria/': 'Ouvidoria',
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated and request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
            recurso = self._get_recurso(request.path)
            if recurso:
                AuditLog.objects.create(
                    usuario=request.user,
                    acao=self._get_acao(request.method),
                    recurso=recurso,
                    ip=self._get_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                )

        return response

    def _get_recurso(self, path):
        for prefix, nome in self.ROTAS_AUDITADAS.items():
            if path.startswith(prefix):
                return nome
        return None

    def _get_acao(self, method):
        return {'POST': 'CREATE', 'PUT': 'UPDATE', 'PATCH': 'UPDATE', 'DELETE': 'DELETE'}.get(method, 'VIEW')

    def _get_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')


class PerfilMiddleware:
    """Injeta perfil do usuário no request para uso nos templates."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.perfil = getattr(request.user, 'perfil', 'colaborador')
        else:
            request.perfil = None
        return self.get_response(request)
