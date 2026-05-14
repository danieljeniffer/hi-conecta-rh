"""core/views.py — Dashboard principal e utilitários."""
from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from accounts.permissions import requer_login
import logging

logger = logging.getLogger('core')


@requer_login
def dashboard(request):
    """Dashboard executivo com dados reais do banco."""
    context = {
        'titulo':    'Dashboard',
        'page_icon': '⊞',
        'kpis':      _kpis(request),
    }
    return render(request, 'core/dashboard.html', context)


def _kpis(request):
    """KPIs dinâmicos por perfil."""
    try:
        # Importa aqui para evitar circular imports
        from rh.models import Colaborador, Departamento
        from dp.models import FolhaPagamento, Ferias

        hoje       = timezone.now().date()
        inicio_mes = hoje.replace(day=1)

        total  = Colaborador.objects.filter(status='ativo').count()
        demiss = Colaborador.objects.filter(status='desligado', updated_at__date__gte=inicio_mes).count()
        adm    = Colaborador.objects.filter(data_admissao__gte=inicio_mes).count()
        fvenc  = Ferias.objects.filter(status='pendente').count()
        folha  = FolhaPagamento.objects.filter(competencia=hoje.strftime('%Y-%m')).first()

        return {
            'total_colaboradores': total,
            'admissoes_mes':       adm,
            'demissoes_mes':       demiss,
            'turnover':            round(demiss / total * 100, 2) if total else 0,
            'ferias_pendentes':    fvenc,
            'folha':               folha,
        }
    except Exception as e:
        logger.warning('Erro ao carregar KPIs: %s', e)
        return {}


def health_check(request):
    """Endpoint de health check para monitoramento."""
    from django.db import connection
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    return JsonResponse({
        'status':    'ok' if db_ok else 'degraded',
        'db':        db_ok,
        'timestamp': timezone.now().isoformat(),
        'version':   '1.0.0',
    }, status=200 if db_ok else 503)
