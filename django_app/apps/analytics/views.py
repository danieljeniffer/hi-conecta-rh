"""apps/analytics/views.py — People Analytics Dashboard."""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Avg, Q
from django.http import JsonResponse
from django.utils import timezone
from apps.core.permissions import requer_nivel
from apps.rh.models import Colaborador, Departamento
from .models import ScoreColaborador, InsightOrganizacional
from .services import calcular_score_risco_saida
import logging

logger = logging.getLogger('apps')


@login_required
@requer_nivel('gestor')
def dashboard(request):
    """Dashboard executivo de People Analytics."""
    hoje = timezone.now().date()

    # Headcount
    total    = Colaborador.objects.filter(status='ativo').count()
    ferias   = Colaborador.objects.filter(status='ferias').count()
    afastados= Colaborador.objects.filter(status='afastado').count()

    # Turnover
    inicio_mes = hoje.replace(day=1)
    deslig_mes = Colaborador.objects.filter(
        status='desligado', updated_at__date__gte=inicio_mes
    ).count()
    turnover   = round((deslig_mes / total * 100), 2) if total else 0

    # Scores críticos
    riscos_criticos = ScoreColaborador.objects.filter(
        nivel_risco='critico'
    ).select_related('colaborador').distinct('colaborador')[:10]

    # Insights
    insights = InsightOrganizacional.objects.filter(
        valido_ate__gte=timezone.now()
    ).order_by('-urgencia')[:5]

    # Score médio por departamento
    dept_scores = Departamento.objects.annotate(
        headcount=Count('colaboradores', filter=Q(colaboradores__status='ativo')),
    ).filter(headcount__gt=0)[:8]

    # Histórico de engajamento (últimos 6 meses)
    import datetime
    historico = []
    for i in range(5, -1, -1):
        mes_ref = (hoje.replace(day=1) - datetime.timedelta(days=i*30))
        avg_score = ScoreColaborador.objects.filter(
            calculado_em__year=mes_ref.year,
            calculado_em__month=mes_ref.month,
        ).aggregate(avg=Avg('score_engajamento'))['avg'] or 0

        historico.append({
            'mes':   mes_ref.strftime('%b/%y'),
            'score': round(avg_score),
        })

    context = {
        'page_title':     'People Analytics',
        'kpis': {
            'total':        total,
            'ferias':       ferias,
            'afastados':    afastados,
            'deslig_mes':   deslig_mes,
            'turnover':     turnover,
        },
        'riscos_criticos': riscos_criticos,
        'insights':        insights,
        'dept_scores':     dept_scores,
        'historico_eng':   historico,
    }
    return render(request, 'analytics/dashboard.html', context)


@login_required
@requer_nivel('gestor')
def risco_colaborador(request, pk):
    """Detalhe do score de risco de um colaborador."""
    from apps.rh.models import Colaborador as C
    colab  = C.objects.get(pk=pk)
    dados  = calcular_score_risco_saida(colab)

    if request.headers.get('HX-Request') or request.GET.get('json'):
        return JsonResponse({'success': True, 'dados': dados})

    return render(request, 'analytics/risco_detalhe.html', {
        'page_title': f'Risco — {colab.nome}',
        'colab':      colab,
        'dados':      dados,
    })


@login_required
@requer_nivel('gestor')
def mapa_riscos(request):
    """Mapa de calor de riscos por departamento."""
    depts = Departamento.objects.filter(ativo=True).prefetch_related('colaboradores')
    return render(request, 'analytics/mapa_riscos.html', {
        'page_title': 'Mapa de Riscos',
        'depts':      depts,
    })
