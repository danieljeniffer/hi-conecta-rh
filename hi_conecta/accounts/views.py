"""
accounts/views.py
Login/logout com JWT, troca de senha e perfil do usuário.
"""
from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Usuario, SessaoUsuario
from .serializers import LoginSerializer, UsuarioResumoSerializer
from core.models import LogAuditoria
import logging

logger = logging.getLogger('accounts')


def _get_ip(request):
    x_fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR', '')


# ─── Login / Logout (Django Session) ─────────────────────────

def login_view(request):
    """Login com sessão Django e emissão de JWT."""
    if request.user.is_authenticated:
        return redirect('core:dashboard')

    context = {'titulo': 'Login', 'erros': []}

    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        senha = request.POST.get('senha', '').strip()
        ip    = _get_ip(request)

        if not email or not senha:
            context['erros'].append('Preencha e-mail e senha.')
            return render(request, 'accounts/login.html', context)

        try:
            usuario = Usuario.objects.get(email=email, is_active=True)
        except Usuario.DoesNotExist:
            logger.warning('Login falhou — e-mail não encontrado: %s | IP: %s', email, ip)
            context['erros'].append('Credenciais inválidas.')
            return render(request, 'accounts/login.html', context)

        if usuario.esta_bloqueado():
            restante = int((usuario.bloqueado_ate - timezone.now()).total_seconds() / 60)
            context['erros'].append(f'Conta temporariamente bloqueada. Tente novamente em {restante} min.')
            return render(request, 'accounts/login.html', context)

        if not usuario.check_password(senha):
            usuario.tentativas_login += 1
            if usuario.tentativas_login >= 5:
                usuario.bloqueado_ate = timezone.now() + timezone.timedelta(minutes=15)
                usuario.save(update_fields=['tentativas_login', 'bloqueado_ate'])
                logger.warning('Conta bloqueada: %s | IP: %s', email, ip)
                context['erros'].append('Muitas tentativas. Conta bloqueada por 15 minutos.')
            else:
                usuario.save(update_fields=['tentativas_login'])
                restam = 5 - usuario.tentativas_login
                context['erros'].append(f'Credenciais inválidas. {restam} tentativa(s) restantes.')
            return render(request, 'accounts/login.html', context)

        # Login bem-sucedido
        usuario.registrar_acesso(ip)

        # Gera tokens JWT
        refresh = RefreshToken.for_user(usuario)
        access  = str(refresh.access_token)

        # Salva JWT na sessão (para uso nos templates)
        request.session['jwt_access']  = access
        request.session['jwt_refresh'] = str(refresh)
        request.session['user_id']     = str(usuario.id)
        request.session['user_perfil'] = usuario.perfil
        request.session['user_nome']   = usuario.nome
        request.session['user_email']  = usuario.email

        # Rastreia sessão
        SessaoUsuario.objects.create(
            usuario=usuario,
            token_jti=str(refresh.access_token.payload.get('jti', '')),
            ip=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            expira_em=timezone.now() + timezone.timedelta(days=7),
        )

        LogAuditoria.registrar(
            usuario=usuario, acao='LOGIN', recurso='accounts',
            ip=ip, descricao='Login realizado com sucesso',
        )

        logger.info('Login: %s | Perfil: %s | IP: %s', email, usuario.perfil, ip)

        if usuario.trocar_senha:
            messages.warning(request, 'Por segurança, altere sua senha antes de continuar.')
            return redirect('accounts:trocar_senha')

        next_url = request.GET.get('next', '/dashboard/')
        return redirect(next_url)

    return render(request, 'accounts/login.html', context)


def logout_view(request):
    """Encerra sessão e invalida JWT."""
    if request.user.is_authenticated:
        ip = _get_ip(request)
        LogAuditoria.registrar(
            usuario=request.user, acao='LOGOUT', recurso='accounts',
            ip=ip, descricao='Logout realizado',
        )
        # Revoga sessão ativa
        jti = request.session.get('jwt_access', '')
        SessaoUsuario.objects.filter(
            usuario=request.user, ativa=True
        ).update(ativa=False, encerrada_em=timezone.now())

        request.session.flush()

    logout(request)
    messages.info(request, 'Sessão encerrada com segurança.')
    return redirect('accounts:login')


@login_required
def trocar_senha_view(request):
    """Troca de senha obrigatória ou voluntária."""
    context = {'titulo': 'Alterar Senha', 'erros': []}

    if request.method == 'POST':
        atual    = request.POST.get('senha_atual', '')
        nova     = request.POST.get('nova_senha', '')
        confirma = request.POST.get('confirmar_senha', '')

        if not request.user.check_password(atual):
            context['erros'].append('Senha atual incorreta.')
        elif nova != confirma:
            context['erros'].append('A nova senha e a confirmação não conferem.')
        elif len(nova) < 8:
            context['erros'].append('A nova senha deve ter no mínimo 8 caracteres.')
        elif nova == atual:
            context['erros'].append('A nova senha deve ser diferente da atual.')
        else:
            request.user.set_password(nova)
            request.user.trocar_senha = False
            request.user.save()
            LogAuditoria.registrar(
                usuario=request.user, acao='ALTERAR_SENHA', recurso='accounts',
                ip=_get_ip(request), descricao='Senha alterada com sucesso',
            )
            messages.success(request, 'Senha alterada! Faça login novamente.')
            logout(request)
            return redirect('accounts:login')

    return render(request, 'accounts/trocar_senha.html', context)


@login_required
def perfil_view(request):
    """Perfil do usuário logado."""
    return render(request, 'accounts/perfil.html', {
        'titulo': 'Meu Perfil',
        'usuario': request.user,
    })


# ─── API REST — Autenticação JWT ──────────────────────────────

class ThrottleLogin(AnonRateThrottle):
    rate = '10/minute'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ThrottleLogin])
def api_login(request):
    """
    POST /api/v1/accounts/login/
    Body: { "email": "...", "senha": "..." }
    Retorna: { access_token, refresh_token, usuario }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'sucesso': False, 'erros': serializer.errors}, status=400)

    email = serializer.validated_data['email']
    senha = serializer.validated_data['senha']
    ip    = _get_ip(request)

    try:
        usuario = Usuario.objects.get(email=email, is_active=True)
    except Usuario.DoesNotExist:
        logger.warning('API Login falhou — não encontrado: %s | IP: %s', email, ip)
        return Response({'sucesso': False, 'mensagem': 'Credenciais inválidas.'}, status=401)

    if usuario.esta_bloqueado():
        return Response({'sucesso': False, 'mensagem': 'Conta bloqueada temporariamente.'}, status=403)

    if not usuario.check_password(senha):
        usuario.tentativas_login += 1
        usuario.save(update_fields=['tentativas_login'])
        return Response({'sucesso': False, 'mensagem': 'Credenciais inválidas.'}, status=401)

    usuario.registrar_acesso(ip)
    refresh = RefreshToken.for_user(usuario)

    LogAuditoria.registrar(
        usuario=usuario, acao='LOGIN_API', recurso='accounts',
        ip=ip, descricao='Login via API',
    )

    return Response({
        'sucesso':       True,
        'access_token':  str(refresh.access_token),
        'refresh_token': str(refresh),
        'token_type':    'Bearer',
        'usuario':       UsuarioResumoSerializer(usuario).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """POST /api/v1/accounts/logout/ — invalida refresh token."""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except (TokenError, Exception):
        pass  # Token já inválido ou expirado

    LogAuditoria.registrar(
        usuario=request.user, acao='LOGOUT_API', recurso='accounts',
        ip=_get_ip(request), descricao='Logout via API',
    )
    return Response({'sucesso': True, 'mensagem': 'Logout realizado.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    """GET /api/v1/accounts/me/ — dados do usuário logado."""
    return Response({'sucesso': True, 'usuario': UsuarioResumoSerializer(request.user).data})
