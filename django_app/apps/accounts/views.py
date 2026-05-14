"""apps/accounts/views.py — Autenticação enterprise."""
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.generic import FormView
from django.urls import reverse_lazy
from django.utils import timezone
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework import status
from apps.core.models import AuditLog
import logging

logger = logging.getLogger('security')


def _get_ip(request):
    x_fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR')


def login_view(request):
    """Login com rate limit e registro de auditoria."""
    if request.user.is_authenticated:
        return redirect('core:dashboard')

    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        senha = request.POST.get('senha', '').strip()
        ip    = _get_ip(request)

        if not email or not senha:
            messages.error(request, 'Preencha e-mail e senha.')
            return render(request, 'accounts/login.html')

        user = authenticate(request, email=email, password=senha)

        if user and user.is_active:
            login(request, user)
            user.registrar_acesso(ip)

            # Gera tokens JWT para uso na API
            refresh = RefreshToken.for_user(user)
            request.session['jwt_access']  = str(refresh.access_token)
            request.session['jwt_refresh'] = str(refresh)

            AuditLog.objects.create(
                usuario=user, acao='LOGIN', recurso='accounts',
                ip=ip, user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
            logger.info('LOGIN: %s IP=%s', email, ip)

            # Redireciona para troca de senha se necessário
            if user.trocar_senha:
                messages.warning(request, 'Por segurança, defina uma nova senha.')
                return redirect('accounts:trocar_senha')

            redirect_to = request.GET.get('next', 'core:dashboard')
            return redirect(redirect_to)

        else:
            logger.warning('FALHA LOGIN: %s IP=%s', email, ip)
            messages.error(request, 'E-mail ou senha incorretos.')

    return render(request, 'accounts/login.html', {'page_title': 'Login'})


@login_required
def logout_view(request):
    ip = _get_ip(request)
    AuditLog.objects.create(
        usuario=request.user, acao='LOGOUT', recurso='accounts', ip=ip
    )
    logout(request)
    messages.success(request, 'Sessão encerrada com sucesso.')
    return redirect('accounts:login')


@login_required
def trocar_senha_view(request):
    if request.method == 'POST':
        atual = request.POST.get('senha_atual')
        nova  = request.POST.get('nova_senha')
        conf  = request.POST.get('confirmar')

        if not request.user.check_password(atual):
            messages.error(request, 'Senha atual incorreta.')
        elif nova != conf:
            messages.error(request, 'As senhas não conferem.')
        elif len(nova) < 8:
            messages.error(request, 'A nova senha deve ter ao menos 8 caracteres.')
        else:
            request.user.set_password(nova)
            request.user.trocar_senha = False
            request.user.save()
            messages.success(request, 'Senha alterada com sucesso! Faça login novamente.')
            logout(request)
            return redirect('accounts:login')

    return render(request, 'accounts/trocar_senha.html', {'page_title': 'Alterar Senha'})


@login_required
def perfil_view(request):
    return render(request, 'accounts/perfil.html', {
        'page_title': 'Meu Perfil',
        'usuario': request.user,
    })


# ── API JWT ───────────────────────────────────────────────────
class AuthThrottle(AnonRateThrottle):
    rate = '10/minute'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def api_login(request):
    """Login via API — retorna JWT."""
    email = request.data.get('email', '').strip().lower()
    senha = request.data.get('senha', '').strip()

    if not email or not senha:
        return Response({'success': False, 'message': 'E-mail e senha obrigatórios.'}, status=400)

    user = authenticate(request, email=email, password=senha)

    if user and user.is_active:
        refresh = RefreshToken.for_user(user)
        user.registrar_acesso(_get_ip(request))
        AuditLog.objects.create(
            usuario=user, acao='LOGIN', recurso='api_accounts',
            ip=_get_ip(request), user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
        )
        return Response({
            'success': True,
            'access_token':  str(refresh.access_token),
            'refresh_token': str(refresh),
            'usuario': {
                'id':     str(user.id),
                'nome':   user.nome,
                'email':  user.email,
                'perfil': user.perfil,
            }
        })

    return Response({'success': False, 'message': 'Credenciais inválidas.'}, status=401)


@api_view(['POST'])
def api_logout(request):
    """Logout API — invalida refresh token."""
    try:
        token = request.data.get('refresh_token')
        if token:
            RefreshToken(token).blacklist()
    except Exception:
        pass
    return Response({'success': True, 'message': 'Logout realizado.'})
