"""apps/core/views.py — Dashboard principal e utilitários."""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.utils import timezone


@login_required
def dashboard(request):
    """Dashboard executivo — dados reais do banco."""
    from apps.rh.models import Colaborador, Departamento
    from apps.dp.models import FolhaPagamento, Ferias, Rescisao
    from apps.recrutamento.models import Vaga

    hoje      = timezone.now().date()
    inicio_mes = hoje.replace(day=1)

    # KPIs principais
    total_colabs      = Colaborador.objects.filter(status='ativo').count()
    admissoes_mes     = Colaborador.objects.filter(data_admissao__gte=inicio_mes).count()
    desligamentos_mes = Colaborador.objects.filter(status='desligado', updated_at__gte=inicio_mes).count()
    ferias_pendentes  = Ferias.objects.filter(status='pendente').count()
    vagas_abertas     = Vaga.objects.filter(status='aberta').count()

    # Folha atual
    folha_atual = FolhaPagamento.objects.filter(
        competencia=hoje.strftime('%Y-%m')
    ).first()

    # Departamentos
    departamentos = Departamento.objects.annotate(
        total=Count('colaboradores', filter=Q(colaboradores__status='ativo'))
    ).order_by('-total')[:5]

    # Aniversariantes próximos 7 dias
    import datetime
    proximos_7 = []
    for i in range(7):
        dia = hoje + datetime.timedelta(days=i)
        anivs = Colaborador.objects.filter(
            data_nascimento__month=dia.month,
            data_nascimento__day=dia.day,
            status='ativo'
        )
        proximos_7.extend(anivs)

    # Alertas críticos
    ferias_vencendo = Ferias.objects.filter(
        status='pendente',
        periodo_fim__lte=hoje + datetime.timedelta(days=60)
    ).count()

    context = {
        'kpis': {
            'total_colabs':      total_colabs,
            'admissoes_mes':     admissoes_mes,
            'desligamentos_mes': desligamentos_mes,
            'ferias_pendentes':  ferias_pendentes,
            'vagas_abertas':     vagas_abertas,
            'turnover':          round((desligamentos_mes / total_colabs * 100), 2) if total_colabs else 0,
        },
        'folha_atual':     folha_atual,
        'departamentos':   departamentos,
        'aniversariantes': proximos_7[:8],
        'alertas': {
            'ferias_vencendo': ferias_vencendo,
        },
        'page_title': 'Dashboard Executivo',
    }

    return render(request, 'core/dashboard.html', context)


@login_required
def health_check(request):
    """Verificação de saúde da aplicação."""
    from django.http import JsonResponse
    from django.db import connection
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    return JsonResponse({
        'status': 'ok' if db_ok else 'degraded',
        'db': db_ok,
        'timestamp': timezone.now().isoformat(),
    })
