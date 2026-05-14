"""
inteligencia/views.py — IA Organizacional: DNA Corporativo, Fantasma, Temporal, IA Executiva, Simulador.
"""
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.utils import timezone
from accounts.permissions import requer_perfil
from .models import (
    DNACorporativo, ModoFantasma, PrevisaoRHTemporal,
    ConsultaIAExecutiva, SimulacaoFuturoCorporativo,
)
from .services import (
    DNACorporativoService, ModoFantasmaService, RHTemporalService,
    IAExecutivaService, SimuladorFuturoService,
)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def hub_inteligencia(request):
    """Hub central de IA Organizacional."""
    ref  = timezone.now().date().strftime('%Y-%m')
    dna  = DNACorporativo.objects.filter(referencia=ref).first()
    alertas_fantasma = ModoFantasma.objects.filter(lido=False, referencia=ref).count()
    consultas_recentes = ConsultaIAExecutiva.objects.filter(
        usuario=request.user
    ).order_by('-created_at')[:5]
    simulacoes = SimulacaoFuturoCorporativo.objects.filter(
        usuario=request.user
    ).order_by('-created_at')[:5]

    ctx = {
        'dna':               dna,
        'alertas_fantasma':  alertas_fantasma,
        'consultas_recentes':consultas_recentes,
        'simulacoes':        simulacoes,
        'referencia':        ref,
        'page_title':        'Central de Inteligência Organizacional',
    }
    return render(request, 'inteligencia/hub.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def dna_corporativo(request):
    ref = request.GET.get('ref', timezone.now().date().strftime('%Y-%m'))

    if request.method == 'POST' and request.POST.get('recalcular'):
        dna = DNACorporativoService.calcular(ref)
        messages.success(request, f'DNA Corporativo calculado para {ref}.')
        return redirect('inteligencia:dna_corporativo')

    dna = DNACorporativo.objects.filter(referencia=ref).first()
    historico = DNACorporativo.objects.order_by('-referencia')[:12]

    ctx = {
        'dna':      dna,
        'historico':historico,
        'referencia':ref,
        'page_title':'DNA Corporativo',
    }
    return render(request, 'inteligencia/dna_corporativo.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def modo_fantasma(request):
    ref = request.GET.get('ref', timezone.now().date().strftime('%Y-%m'))

    if request.method == 'POST' and request.POST.get('detectar'):
        novos = ModoFantasmaService.detectar(ref)
        messages.success(request, f'{len(novos)} novos insights detectados.')
        return redirect('inteligencia:modo_fantasma')

    tipo     = request.GET.get('tipo', '')
    impacto  = request.GET.get('impacto', '')

    qs = ModoFantasma.objects.filter(referencia=ref).order_by('-created_at')
    if tipo:    qs = qs.filter(tipo=tipo)
    if impacto: qs = qs.filter(impacto=impacto)

    ctx = {
        'insights':      qs,
        'tipos':         ModoFantasma.TIPOS_INSIGHT,
        'nao_lidos':     ModoFantasma.objects.filter(lido=False, referencia=ref).count(),
        'referencia':    ref,
        'filtro_tipo':   tipo,
        'filtro_impacto':impacto,
        'page_title':    'Modo Fantasma — Insights Ocultos',
    }
    return render(request, 'inteligencia/modo_fantasma.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def rh_temporal(request):
    """Dashboard de projeções temporais."""
    previsoes = PrevisaoRHTemporal.objects.order_by('-created_at')[:20]
    ctx = {
        'previsoes':  previsoes,
        'page_title': 'RH Temporal Preditivo',
    }
    return render(request, 'inteligencia/rh_temporal.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def ia_executiva(request):
    """Interface conversacional com a IA Executiva Conselheira."""
    historico = ConsultaIAExecutiva.objects.filter(
        usuario=request.user
    ).order_by('-created_at')[:20]

    ctx = {
        'historico':   historico,
        'categorias':  ConsultaIAExecutiva.CATEGORIAS,
        'page_title':  'IA Executiva Conselheira',
    }
    return render(request, 'inteligencia/ia_executiva.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
@require_POST
def ia_consultar(request):
    """Processa consulta à IA Executiva (AJAX)."""
    import json
    try:
        body      = json.loads(request.body)
        pergunta  = body.get('pergunta', '').strip()
        categoria = body.get('categoria', 'geral')
        if not pergunta:
            return JsonResponse({'sucesso': False, 'erro': 'Pergunta obrigatória.'}, status=400)

        contexto = IAExecutivaService.contexto_organizacional()
        consulta = IAExecutivaService.consultar(pergunta, contexto, request.user, categoria)

        return JsonResponse({
            'sucesso':   True,
            'resposta':  consulta.resposta,
            'modelo':    consulta.modelo_usado,
            'tokens':    consulta.tokens_usados,
            'tempo_ms':  consulta.tempo_resposta_ms,
            'id':        str(consulta.id),
        })
    except Exception as e:
        return JsonResponse({'sucesso': False, 'erro': str(e)}, status=500)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def simulador_futuro(request):
    """Simulador de cenários futuros corporativos."""
    simulacoes = SimulacaoFuturoCorporativo.objects.filter(
        usuario=request.user
    ).order_by('-created_at')

    ctx = {
        'simulacoes':  simulacoes,
        'cenarios':    SimuladorFuturoService.CENARIOS,
        'page_title':  'Simulador de Futuro Corporativo',
    }
    return render(request, 'inteligencia/simulador_futuro.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
@require_POST
def simulador_executar(request):
    """Executa simulação (AJAX)."""
    import json
    try:
        body     = json.loads(request.body)
        cenario  = body.get('cenario', 'personalizado')
        params   = body.get('parametros', {})
        params['nome'] = body.get('nome', f'Simulação {cenario}')

        sim = SimuladorFuturoService.simular(cenario, params, request.user)
        return JsonResponse({
            'sucesso':   True,
            'id':        str(sim.id),
            'resultado': sim.resultado,
            'narrativa': sim.narrativa_ia,
        })
    except Exception as e:
        return JsonResponse({'sucesso': False, 'erro': str(e)}, status=500)
