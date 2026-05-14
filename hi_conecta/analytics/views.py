"""
analytics/views.py — Dashboard Executivo e views de People Analytics.
"""
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.db.models import Avg, Count, Q
from accounts.permissions import requer_perfil
from rh.models import Colaborador, Departamento
from .models import (
    MetricaOrganizacional, ScoreColaborador, ScoreSetor,
    AlertaInteligente, PrevisaoTurnover,
)
from .services import (
    TurnoverService, EngajamentoService, RiscoDesligamentoService,
    JusticaCorporativaService, ScoreOrganizacionalService,
)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def dashboard_executivo(request):
    hoje = timezone.now().date()
    ref  = hoje.strftime('%Y-%m')

    # KPIs principais
    total_colab   = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).count()
    alertas_criticos = AlertaInteligente.objects.filter(
        status='ativo', prioridade='critica', deleted_at__isnull=True
    ).count()
    alertas_altos = AlertaInteligente.objects.filter(
        status='ativo', prioridade='alta', deleted_at__isnull=True
    ).count()

    # Scores médios
    score_medio_eng = ScoreColaborador.objects.filter(
        dimensao='engajamento', referencia=ref
    ).aggregate(m=Avg('score'))['m'] or 0

    score_medio_geral = ScoreColaborador.objects.filter(
        dimensao='geral', referencia=ref
    ).aggregate(m=Avg('score'))['m'] or 0

    # Top riscos (limitado a 5 para o dashboard)
    previsoes_criticas = PrevisaoTurnover.objects.filter(
        nivel_risco__in=['critico', 'alto'],
        referencia=ref,
        deleted_at__isnull=True,
    ).select_related('colaborador', 'colaborador__departamento').order_by('-probabilidade')[:5]

    # Scores por setor (heatmap)
    scores_setor = ScoreSetor.objects.filter(
        referencia=ref, deleted_at__isnull=True
    ).select_related('departamento').order_by('-score_geral')

    # Alertas recentes
    alertas_recentes = AlertaInteligente.objects.filter(
        status='ativo', deleted_at__isnull=True
    ).select_related('colaborador', 'departamento').order_by('-created_at')[:10]

    # Turnover do mês
    from datetime import date
    inicio_mes = date(hoje.year, hoje.month, 1)
    turnover_mes = TurnoverService.calcular_taxa(inicio_mes, hoje)

    # eNPS
    enps = EngajamentoService.eNPS_organizacional(ref)

    ctx = {
        'total_colab':          total_colab,
        'alertas_criticos':     alertas_criticos,
        'alertas_altos':        alertas_altos,
        'score_engajamento':    round(float(score_medio_eng), 1),
        'score_geral':          round(float(score_medio_geral), 1),
        'previsoes_criticas':   previsoes_criticas,
        'scores_setor':         scores_setor,
        'alertas_recentes':     alertas_recentes,
        'turnover_mes':         turnover_mes,
        'enps':                 enps,
        'referencia':           ref,
        'page_title':           'Dashboard Executivo — People Analytics',
    }
    return render(request, 'analytics/dashboard_executivo.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def perfil_inteligente(request, colaborador_id):
    colab  = get_object_or_404(Colaborador, pk=colaborador_id, deleted_at__isnull=True)
    ref    = timezone.now().date().strftime('%Y-%m')

    scores = {
        s.dimensao: s for s in ScoreColaborador.objects.filter(
            colaborador=colab, referencia=ref
        )
    }
    risco  = RiscoDesligamentoService.calcular(colab)
    justica = None
    if colab.cargo_id:
        justica = JusticaCorporativaService.analise_salarial_cargo(colab.cargo_id)

    alertas = AlertaInteligente.objects.filter(
        colaborador=colab, status='ativo', deleted_at__isnull=True
    ).order_by('-created_at')

    previsao = PrevisaoTurnover.objects.filter(
        colaborador=colab, horizonte='90d', referencia=ref
    ).first()

    ctx = {
        'colab':      colab,
        'scores':     scores,
        'risco':      risco,
        'justica':    justica,
        'alertas':    alertas,
        'previsao':   previsao,
        'page_title': f'Perfil Inteligente — {colab.nome}',
    }
    return render(request, 'analytics/perfil_inteligente.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def mapa_energia(request):
    """Heatmap de engajamento x risco por setor."""
    ref = timezone.now().date().strftime('%Y-%m')
    scores_setor = ScoreSetor.objects.filter(
        referencia=ref, deleted_at__isnull=True
    ).select_related('departamento').order_by('departamento__nome')

    dados_mapa = []
    for s in scores_setor:
        dados_mapa.append({
            'departamento':  s.departamento.nome,
            'engajamento':   float(s.score_engajamento),
            'retencao':      float(s.score_retencao),
            'geral':         float(s.score_geral),
            'headcount':     s.headcount,
            'absenteismo':   float(s.absenteismo_periodo),
        })

    ctx = {
        'dados_mapa':  dados_mapa,
        'referencia':  ref,
        'page_title':  'Mapa de Energia Organizacional',
    }
    return render(request, 'analytics/mapa_energia.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def central_alertas(request):
    tipo      = request.GET.get('tipo', '')
    prioridade= request.GET.get('prioridade', '')
    status    = request.GET.get('status', 'ativo')

    qs = AlertaInteligente.objects.filter(deleted_at__isnull=True)
    if status:         qs = qs.filter(status=status)
    if tipo:           qs = qs.filter(tipo=tipo)
    if prioridade:     qs = qs.filter(prioridade=prioridade)

    qs = qs.select_related('colaborador', 'departamento').order_by('-created_at')

    ctx = {
        'alertas':      qs[:100],
        'total':        qs.count(),
        'tipos':        AlertaInteligente.TIPOS,
        'prioridades':  AlertaInteligente.PRIORIDADES,
        'filtro_tipo':  tipo,
        'filtro_prio':  prioridade,
        'filtro_status':status,
        'page_title':   'Central de Alertas Inteligentes',
    }
    return render(request, 'analytics/central_alertas.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin', 'gestor')
def indicadores_turnover(request):
    hoje = timezone.now().date()
    ref  = hoje.strftime('%Y-%m')

    turnover_geral = TurnoverService.calcular_taxa(
        date(hoje.year, hoje.month, 1), hoje
    )
    por_dept = TurnoverService.turnover_por_departamento(ref)
    previsoes = PrevisaoTurnover.objects.filter(
        referencia=ref, deleted_at__isnull=True
    ).select_related('colaborador').order_by('-probabilidade')[:20]

    ctx = {
        'turnover_geral': turnover_geral,
        'por_dept':       por_dept,
        'previsoes':      previsoes,
        'page_title':     'Análise de Turnover',
    }
    return render(request, 'analytics/turnover.html', ctx)
