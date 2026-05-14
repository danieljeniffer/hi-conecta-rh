"""
core/middleware.py
Middlewares de auditoria automática e contexto de perfil.
"""
import logging
import time
from .models import LogAuditoria

logger_seg  = logging.getLogger('django.security')
logger_app  = logging.getLogger('core')


class AuditoriaMiddleware:
    """
    Registra automaticamente ações de escrita (POST/PUT/PATCH/DELETE)
    em rotas sensíveis.
    """
    ROTAS_SENSIVEIS = (
        '/dp/', '/rh/', '/colaborador/', '/recrutamento/',
        '/documentos/', '/ouvidoria/', '/accounts/trocar-senha/',
    )

    METODOS_ESCRITA = {'POST', 'PUT', 'PATCH', 'DELETE'}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (request.user.is_authenticated
                and request.method in self.METODOS_ESCRITA
                and self._e_rota_sensivel(request.path)):

            acao = {
                'POST': 'CRIAR', 'PUT': 'EDITAR',
                'PATCH': 'EDITAR', 'DELETE': 'EXCLUIR'
            }.get(request.method, 'VISUALIZAR')

            recurso = self._extrair_recurso(request.path)

            LogAuditoria.registrar(
                usuario=request.user,
                acao=acao,
                recurso=recurso,
                ip=self._get_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )

        return response

    def _e_rota_sensivel(self, path):
        return any(path.startswith(r) for r in self.ROTAS_SENSIVEIS)

    def _extrair_recurso(self, path):
        partes = [p for p in path.strip('/').split('/') if p]
        return partes[0] if partes else 'desconhecido'

    @staticmethod
    def _get_ip(request):
        x_fwd = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR', '')


class PerfilContextMiddleware:
    """
    Injeta o perfil do usuário no request para uso rápido em views
    sem precisar acessar request.user.perfil repetidamente.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.perfil      = getattr(request.user, 'perfil', 'colaborador')
            request.is_admin    = request.perfil == 'admin'
            request.is_rh       = request.perfil in ('admin', 'rh')
            request.is_gestor   = request.perfil in ('admin', 'rh', 'analista', 'gestor')
        else:
            request.perfil      = None
            request.is_admin    = False
            request.is_rh       = False
            request.is_gestor   = False

        return self.get_response(request)


class TempoRespostaMiddleware:
    """Log do tempo de resposta de cada request (útil em produção)."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        inicio   = time.monotonic()
        response = self.get_response(request)
        duracao  = (time.monotonic() - inicio) * 1000  # ms

        if duracao > 1000:
            logger_app.warning(
                'Request lento: %s %s → %dms | Usuário: %s',
                request.method, request.path, duracao,
                getattr(request.user, 'email', 'anon')
            )

        return response
