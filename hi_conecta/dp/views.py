"""
dp/views.py — Departamento Pessoal: Hub, Folha, Férias, Rescisão, Benefícios, Dashboard.
"""
import json
from datetime import date
from decimal import Decimal
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse, HttpResponse, Http404
from django.utils import timezone
from django.db.models import Q, Sum, Count
from accounts.permissions import requer_nivel, requer_permissao, tem_permissao
from core.models import LogAuditoria
from .models import (
    FolhaPagamento, FolhaItem, Ferias, DecimoTerceiro,
    Rescisao, Beneficio, ColaboradorBeneficio,
    AdmissaoDP, NotificacaoDP, EventoFolha,
)
from .services import (
    CLTService, FolhaService, FeriasService,
    DecimoTerceiroService, RescisaoService, SimulacaoService,
    DocumentGeneratorService,
)
from rh.models import Colaborador
import logging

logger = logging.getLogger('core')


def _get_ip(request):
    x = request.META.get('HTTP_X_FORWARDED_FOR')
    return x.split(',')[0].strip() if x else request.META.get('REMOTE_ADDR', '')


def _d(v): return Decimal(str(v or 0))


# ─────────────────────────────────────────────────────────────
# HUB DO DP
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def hub(request):
    """Dashboard operacional do DP."""
    hoje       = timezone.now().date()
    inicio_mes = hoje.replace(day=1)

    # KPIs operacionais
    ferias_pend    = Ferias.objects.filter(status='pendente', deleted_at__isnull=True).count()
    ferias_vcdo60  = FeriasService.verificar_ferias_vencendo(60).count()
    rescisoes_abert= Rescisao.objects.filter(status__in=['rascunho','calculada'], deleted_at__isnull=True).count()
    folha_atual    = FolhaPagamento.objects.filter(competencia=hoje.strftime('%Y-%m')).first()
    notif_crit     = NotificacaoDP.objects.filter(lida=False, prioridade='critica').count()
    admissoes_pend = AdmissaoDP.objects.filter(status__in=['iniciada','doc_pendente']).count()

    # Timeline operacional do dia
    timeline = []
    for f in Ferias.objects.filter(aprovado_em__date=hoje).select_related('colaborador')[:5]:
        timeline.append({'icon':'🏖️','cor':'#7c3aed','texto':f'Férias aprovadas — {f.colaborador.nome}','hora':f.aprovado_em.strftime('%H:%M')})
    for r in Rescisao.objects.filter(updated_at__date=hoje).select_related('colaborador')[:3]:
        timeline.append({'icon':'👋','cor':'#dc2626','texto':f'Rescisão {r.get_status_display()} — {r.colaborador.nome}','hora':r.updated_at.strftime('%H:%M')})

    # Inconsistências
    inconsistencias = []
    sem_cpf = Colaborador.objects.filter(status='ativo', cpf='', deleted_at__isnull=True).count()
    if sem_cpf:
        inconsistencias.append({'tipo': 'warning', 'texto': f'{sem_cpf} colaborador(es) sem CPF cadastrado'})
    abaixo_min = Colaborador.objects.filter(status='ativo', salario_base__lt=1412, deleted_at__isnull=True).count()
    if abaixo_min:
        inconsistencias.append({'tipo': 'danger', 'texto': f'{abaixo_min} colaborador(es) com salário abaixo do mínimo'})

    context = {
        'titulo':         'Departamento Pessoal',
        'page_icon':      '📋',
        'kpis': {
            'ferias_pend':    ferias_pend,
            'ferias_vcdo60':  ferias_vcdo60,
            'rescisoes_abert':rescisoes_abert,
            'folha_status':   folha_atual.get_status_display() if folha_atual else 'Não aberta',
            'folha_liquido':  folha_atual.total_liquido if folha_atual else 0,
            'notif_crit':     notif_crit,
            'admissoes_pend': admissoes_pend,
        },
        'folha_atual':       folha_atual,
        'timeline':          sorted(timeline, key=lambda x: x['hora'], reverse=True),
        'inconsistencias':   inconsistencias,
        'pode_criar':        tem_permissao(request.user, 'dp', 'criar'),
    }
    return render(request, 'dp/hub.html', context)


# ─────────────────────────────────────────────────────────────
# CENTRAL TRABALHISTA
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def central(request):
    colabs = Colaborador.objects.filter(status__in=['ativo','ferias','afastado'], deleted_at__isnull=True) \
                                .select_related('cargo','departamento') \
                                .order_by('nome')
    return render(request, 'dp/central.html', {
        'titulo':    'Central Trabalhista',
        'page_icon': '⚡',
        'colabs':    colabs,
    })


@login_required
@requer_nivel('analista')
@require_POST
def central_calcular(request):
    """Cálculo AJAX na Central Trabalhista."""
    dados = json.loads(request.body)
    tipo  = dados.get('tipo')
    cid   = dados.get('colaborador_id')

    if not tipo or not cid:
        return JsonResponse({'sucesso': False, 'mensagem': 'Tipo e colaborador obrigatórios.'}, status=400)

    try:
        colab = Colaborador.objects.get(id=cid, deleted_at__isnull=True)
        sal   = colab.salario_base
        dep   = colab.dependentes.filter(ir=True).count()

        if tipo == 'liquido':
            resultado = CLTService.calcular_liquido(sal, dep)
            resultado['memoria_calculo'] = [
                {'item':'Salário Base',       'valor':float(sal),               'sinal':''},
                {'item':'INSS (Progressivo)', 'valor':float(-resultado['inss']),'sinal':'–','tipo':'desconto','pct':str(round(float(resultado['inss'])/float(sal)*100,2))+'%','lei':'Portaria MPS 2024'},
                {'item':'IRRF',               'valor':float(-resultado['irrf']),'sinal':'–','tipo':'desconto','lei':'Tabela IRRF 2024'},
                {'item':'💰 LÍQUIDO',         'valor':float(resultado['liquido']),'sinal':'=','tipo':'total'},
            ]

        elif tipo == 'ferias':
            dias  = int(dados.get('dias', 30))
            abono = int(dados.get('abono', 0))
            resultado = FeriasService.calcular(sal, dias, abono, dep)

        elif tipo == 'decimo':
            meses  = int(dados.get('meses', 12))
            parcela = dados.get('parcela', '2')
            resultado = DecimoTerceiroService.calcular(sal, meses, parcela, dep)

        elif tipo == 'rescisao':
            tipo_res = dados.get('tipo_rescisao', 'sem_justa_causa')
            data_dem = date.fromisoformat(dados.get('data_rescisao', date.today().isoformat()))
            aviso_ind = dados.get('aviso_indenizado', False)
            resultado = RescisaoService.calcular(colab, tipo_res, data_dem, aviso_indenizado=aviso_ind)

        elif tipo == 'simulacao':
            novo_sal  = float(dados.get('novo_salario', sal))
            resultado = SimulacaoService.simular_reajuste(sal, novo_sal, dep)

        else:
            return JsonResponse({'sucesso': False, 'mensagem': f'Tipo "{tipo}" inválido.'}, status=400)

        # Converte Decimal para float
        resultado_serial = _serializar(resultado)

        LogAuditoria.registrar(
            usuario=request.user, acao='CALCULAR', recurso='dp_central',
            recurso_id=cid, dados_depois={'tipo': tipo, 'colab': colab.nome}, ip=_get_ip(request),
        )

        return JsonResponse({
            'sucesso':      True,
            'resultado':    resultado_serial,
            'colaborador':  colab.nome,
            'cargo':        str(colab.cargo or '—'),
            'departamento': str(colab.departamento or '—'),
            'salario_base': float(sal),
        })

    except Exception as e:
        logger.exception('Erro na Central Trabalhista: %s', e)
        return JsonResponse({'sucesso': False, 'mensagem': str(e)}, status=400)


def _serializar(obj):
    """Converte Decimal e date para tipos serializáveis."""
    if isinstance(obj, dict):
        return {k: _serializar(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serializar(i) for i in obj]
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    return obj


# ─────────────────────────────────────────────────────────────
# FOLHA DE PAGAMENTO
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def folha_lista(request):
    folhas = FolhaPagamento.objects.filter(deleted_at__isnull=True).order_by('-competencia')
    return render(request, 'dp/folha_lista.html', {
        'titulo':    'Folha de Pagamento',
        'page_icon': '💰',
        'folhas':    folhas,
        'pode_criar':tem_permissao(request.user, 'dp', 'criar'),
    })


@login_required
@requer_permissao('dp', 'criar')
@require_POST
def folha_abrir(request):
    competencia = request.POST.get('competencia')
    if not competencia:
        messages.error(request, 'Competência obrigatória.')
        return redirect('dp:folha_lista')
    folha, criada = FolhaPagamento.objects.get_or_create(
        competencia=competencia,
        defaults={'criado_por': request.user}
    )
    if not criada:
        messages.warning(request, f'Folha {competencia} já existe.')
    else:
        messages.success(request, f'Folha {competencia} aberta.')
    return redirect('dp:folha_detalhe', pk=folha.pk)


@login_required
@requer_nivel('analista')
def folha_detalhe(request, pk):
    folha = get_object_or_404(FolhaPagamento, pk=pk, deleted_at__isnull=True)
    itens = FolhaItem.objects.filter(folha=folha).select_related('colaborador').order_by('colaborador__nome')
    return render(request, 'dp/folha_detalhe.html', {
        'titulo':    f'Folha {folha.competencia}',
        'page_icon': '💰',
        'folha':     folha,
        'itens':     itens,
        'pode_aprovar':tem_permissao(request.user, 'dp', 'aprovar'),
    })


@login_required
@requer_permissao('dp', 'criar')
@require_POST
def folha_calcular(request, pk):
    folha = get_object_or_404(FolhaPagamento, pk=pk)
    if folha.status == 'paga':
        messages.error(request, 'Folha já paga não pode ser recalculada.')
        return redirect('dp:folha_detalhe', pk=pk)
    try:
        totais = FolhaService.calcular_folha_completa(str(pk))
        LogAuditoria.registrar(usuario=request.user, acao='CALCULAR', recurso='dp_folha',
                                recurso_id=str(pk), ip=_get_ip(request))
        messages.success(request, f'Folha calculada: {totais["total_colabs"]} colaboradores.')
    except Exception as e:
        logger.exception('Erro ao calcular folha: %s', e)
        messages.error(request, f'Erro no cálculo: {e}')
    return redirect('dp:folha_detalhe', pk=pk)


@login_required
@requer_permissao('dp', 'aprovar')
@require_POST
def folha_aprovar(request, pk):
    folha = get_object_or_404(FolhaPagamento, pk=pk)
    if folha.status != 'calculada':
        messages.error(request, 'Apenas folhas calculadas podem ser aprovadas.')
        return redirect('dp:folha_detalhe', pk=pk)
    folha.status     = 'aprovada'
    folha.fechado_em = timezone.now()
    folha.atualizado_por = request.user
    folha.save()
    LogAuditoria.registrar(usuario=request.user, acao='APROVAR', recurso='dp_folha',
                            recurso_id=str(pk), ip=_get_ip(request))
    messages.success(request, 'Folha aprovada.')
    return redirect('dp:folha_detalhe', pk=pk)


@login_required
@requer_nivel('analista')
def holerite_pdf(request, item_pk):
    item = get_object_or_404(FolhaItem, pk=item_pk)
    # Colaborador só acessa seu próprio holerite
    if request.user.perfil == 'colaborador':
        colab_id = str(getattr(request.user, 'colaborador_id', ''))
        if str(item.colaborador_id) != colab_id:
            raise Http404
    pdf = DocumentGeneratorService.gerar_holerite(item)
    if not pdf:
        messages.warning(request, 'ReportLab não instalado. PDF não gerado.')
        return redirect('dp:folha_detalhe', pk=item.folha_id)
    resp = HttpResponse(pdf, content_type='application/pdf')
    resp['Content-Disposition'] = f'inline; filename="holerite_{item.folha.competencia}.pdf"'
    return resp


# ─────────────────────────────────────────────────────────────
# FÉRIAS
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('gestor')
def ferias_lista(request):
    qs = Ferias.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-created_at')
    if request.user.perfil == 'gestor':
        cid = getattr(request.user, 'colaborador_id', None)
        if cid:
            qs = qs.filter(Q(colaborador__gestor_id=cid)|Q(colaborador__departamento__gestor_id=cid))
    status = request.GET.get('status')
    if status:
        qs = qs.filter(status=status)
    return render(request, 'dp/ferias_lista.html', {
        'titulo':    'Férias', 'page_icon': '🏖️', 'ferias': qs[:100],
        'pode_criar':tem_permissao(request.user, 'dp', 'criar'),
    })


@login_required
def ferias_simulacao(request):
    """AJAX: simulação de férias."""
    sal  = float(request.GET.get('salario', 0))
    dias = int(request.GET.get('dias', 30))
    abono = int(request.GET.get('abono', 0))
    dep  = int(request.GET.get('dependentes', 0))
    if not sal:
        return JsonResponse({'sucesso': False, 'mensagem': 'Informe o salário.'}, status=400)
    resultado = FeriasService.calcular(sal, dias, abono, dep)
    return JsonResponse({'sucesso': True, 'resultado': _serializar(resultado)})


@login_required
@requer_permissao('dp', 'criar')
@require_POST
def ferias_solicitar(request):
    """Cria solicitação de férias com cálculo automático."""
    colab_id = request.POST.get('colaborador_id')
    periodo_inicio = request.POST.get('periodo_inicio')
    periodo_fim    = request.POST.get('periodo_fim')
    gozo_inicio    = request.POST.get('gozo_inicio')
    dias = int(request.POST.get('dias_solicitados', 30))
    abono = int(request.POST.get('dias_abono', 0))

    colab = get_object_or_404(Colaborador, id=colab_id, deleted_at__isnull=True)
    dep   = colab.dependentes.filter(ir=True).count()

    calc  = FeriasService.calcular(colab.salario_base, dias, abono, dep)

    ferias = Ferias.objects.create(
        colaborador=colab,
        periodo_inicio=date.fromisoformat(periodo_inicio),
        periodo_fim=date.fromisoformat(periodo_fim),
        gozo_inicio=date.fromisoformat(gozo_inicio) if gozo_inicio else None,
        dias_solicitados=dias,
        dias_abono=abono,
        status='pendente',
        valor_ferias=calc['valor_ferias'],
        valor_terco=calc['valor_terco'],
        valor_abono=calc['valor_abono'],
        valor_inss=calc['valor_inss'],
        valor_irrf=calc['valor_irrf'],
        valor_liquido=calc['valor_liquido'],
        memoria_calculo=calc['memoria_calculo'],
        criado_por=request.user,
    )

    LogAuditoria.registrar(usuario=request.user, acao='CRIAR', recurso='dp_ferias',
                            recurso_id=str(ferias.id), ip=_get_ip(request))
    messages.success(request, f'Férias de {colab.nome} solicitadas.')
    return redirect('dp:ferias_lista')


@login_required
@requer_nivel('gestor')
@require_POST
def ferias_aprovar(request, pk):
    ferias = get_object_or_404(Ferias, pk=pk, deleted_at__isnull=True)
    if ferias.status != 'pendente':
        return JsonResponse({'sucesso': False, 'mensagem': 'Apenas férias pendentes podem ser aprovadas.'}, status=400)
    ferias.status      = 'aprovada'
    ferias.aprovado_por = request.user.nome
    ferias.aprovado_em  = timezone.now()
    ferias.save()
    LogAuditoria.registrar(usuario=request.user, acao='APROVAR', recurso='dp_ferias',
                            recurso_id=str(pk), ip=_get_ip(request))
    messages.success(request, 'Férias aprovadas.')
    return JsonResponse({'sucesso': True})


@login_required
@requer_nivel('gestor')
@require_POST
def ferias_recusar(request, pk):
    ferias = get_object_or_404(Ferias, pk=pk)
    motivo = request.POST.get('motivo', '')
    ferias.status          = 'recusada'
    ferias.recusado_motivo = motivo
    ferias.save()
    return JsonResponse({'sucesso': True})


@login_required
def ferias_recibo_pdf(request, pk):
    ferias = get_object_or_404(Ferias, pk=pk)
    pdf    = DocumentGeneratorService.gerar_recibo_ferias(ferias)
    if not pdf:
        messages.warning(request, 'PDF não gerado (ReportLab ausente).')
        return redirect('dp:ferias_lista')
    resp = HttpResponse(pdf, content_type='application/pdf')
    resp['Content-Disposition'] = f'inline; filename="recibo_ferias_{ferias.colaborador.nome}.pdf"'
    return resp


# ─────────────────────────────────────────────────────────────
# RESCISÃO — WIZARD 7 ETAPAS
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def rescisao_lista(request):
    qs = Rescisao.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-data_demissao')
    return render(request, 'dp/rescisao_lista.html', {
        'titulo':    'Rescisões', 'page_icon': '👋', 'rescisoes': qs[:100],
        'pode_criar':tem_permissao(request.user, 'dp', 'criar'),
    })


@login_required
@requer_permissao('dp', 'criar')
def rescisao_wizard(request, pk=None):
    """Wizard multi-etapa de rescisão."""
    if pk:
        rescisao = get_object_or_404(Rescisao, pk=pk, deleted_at__isnull=True)
    else:
        rescisao = None

    etapa = int(request.GET.get('etapa', 1))
    LABELS = [
        {'n':1,'icon':'📋','label':'Tipo'},
        {'n':2,'icon':'📅','label':'Aviso Prévio'},
        {'n':3,'icon':'⚠️','label':'Pendências'},
        {'n':4,'icon':'💳','label':'Benefícios'},
        {'n':5,'icon':'🧮','label':'Conferência'},
        {'n':6,'icon':'📄','label':'Documentos'},
        {'n':7,'icon':'📡','label':'eSocial'},
    ]

    colabs = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).order_by('nome')

    if request.method == 'POST':
        dados_wizard = rescisao.dados_wizard if rescisao else {}
        dados_wizard.update(request.POST.dict())
        dados_wizard.pop('csrfmiddlewaretoken', None)

        colab_id = dados_wizard.get('colaborador_id') or (rescisao.colaborador_id if rescisao else None)

        if not colab_id:
            messages.error(request, 'Selecione um colaborador.')
            return redirect(f'{request.path}?etapa={etapa}')

        colab = get_object_or_404(Colaborador, id=colab_id)

        if etapa == 5:
            # Recalcula ao chegar na conferência
            tipo_res = dados_wizard.get('tipo', 'sem_justa_causa')
            data_dem = date.fromisoformat(dados_wizard.get('data_demissao', date.today().isoformat()))
            aviso_ind = dados_wizard.get('aviso_indenizado') in ('True','on','true','1')
            calc = RescisaoService.calcular(colab, tipo_res, data_dem, aviso_indenizado=aviso_ind)
            dados_wizard['calculo'] = {k: str(v) if isinstance(v, Decimal) else v for k, v in calc.items()}
            dados_wizard['calculo'].pop('memoria_calculo', None)

        if not rescisao:
            rescisao = Rescisao.objects.create(
                colaborador=colab,
                tipo=dados_wizard.get('tipo', 'sem_justa_causa'),
                data_demissao=date.fromisoformat(dados_wizard.get('data_demissao', date.today().isoformat())),
                dados_wizard=dados_wizard,
                etapa_atual=etapa + 1,
                criado_por=request.user,
            )
        else:
            rescisao.dados_wizard = dados_wizard
            rescisao.etapa_atual  = max(rescisao.etapa_atual, etapa + 1)
            rescisao.save()

        if etapa == 7:
            # Finalizar
            _finalizar_rescisao(rescisao, request.user)
            messages.success(request, 'Rescisão finalizada.')
            return redirect('dp:rescisao_lista')

        return redirect(f'{request.path}?etapa={etapa+1}&pk={rescisao.pk}' if not pk else
                        f'?etapa={etapa+1}')

    return render(request, 'dp/rescisao_wizard.html', {
        'titulo':    'Wizard de Rescisão',
        'page_icon': '👋',
        'etapa':     etapa,
        'etapas':    LABELS,
        'rescisao':  rescisao,
        'colabs':    colabs,
        'tipos_rescisao': Rescisao.TIPOS,
    })


def _finalizar_rescisao(rescisao, usuario):
    """Aplica o cálculo final e atualiza o colaborador."""
    dados = rescisao.dados_wizard
    colab = rescisao.colaborador
    tipo  = dados.get('tipo', 'sem_justa_causa')
    data_dem = date.fromisoformat(dados.get('data_demissao', date.today().isoformat()))
    aviso_ind = dados.get('aviso_indenizado') in ('True','on','true','1')

    calc = RescisaoService.calcular(colab, tipo, data_dem, aviso_indenizado=aviso_ind)

    rescisao.tipo             = tipo
    rescisao.data_demissao    = data_dem
    rescisao.aviso_indenizado = aviso_ind
    rescisao.aviso_previo_dias = calc['aviso_previo_dias']
    rescisao.saldo_salario    = calc['saldo_salario']
    rescisao.ferias_vencidas  = calc['ferias_vencidas']
    rescisao.ferias_proporc   = calc['ferias_proporc']
    rescisao.decimo_proporc   = calc['decimo_proporc']
    rescisao.aviso_previo_val = calc['aviso_previo_val']
    rescisao.fgts_saldo       = calc['fgts_saldo']
    rescisao.multa_fgts       = calc['multa_fgts']
    rescisao.inss             = calc['inss']
    rescisao.irrf             = calc['irrf']
    rescisao.total_bruto      = calc['total_bruto']
    rescisao.total_liquido    = calc['total_liquido']
    rescisao.memoria_calculo  = calc['memoria_calculo']
    rescisao.status           = 'calculada'
    rescisao.atualizado_por   = usuario
    rescisao.save()

    # Desliga o colaborador
    colab.status        = 'desligado'
    colab.data_demissao = data_dem
    colab.save(update_fields=['status','data_demissao'])

    LogAuditoria.registrar(usuario=usuario, acao='CRIAR', recurso='dp_rescisao',
                            recurso_id=str(rescisao.id))


# ─────────────────────────────────────────────────────────────
# 13º SALÁRIO
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def decimo_lista(request):
    ano = request.GET.get('ano', date.today().year)
    qs  = DecimoTerceiro.objects.filter(ano=str(ano), deleted_at__isnull=True).select_related('colaborador')
    return render(request, 'dp/decimo_lista.html', {
        'titulo':    '13º Salário', 'page_icon': '🎁', 'decimos': qs, 'ano': ano,
    })


@login_required
@requer_nivel('analista')
def decimo_simular(request):
    """AJAX: simulação de 13º."""
    sal    = float(request.GET.get('salario', 0))
    meses  = int(request.GET.get('meses', 12))
    parcela = request.GET.get('parcela', '2')
    dep    = int(request.GET.get('dependentes', 0))
    if not sal:
        return JsonResponse({'sucesso': False, 'mensagem': 'Informe o salário.'})
    resultado = DecimoTerceiroService.calcular(sal, meses, parcela, dep)
    return JsonResponse({'sucesso': True, 'resultado': _serializar(resultado)})


# ─────────────────────────────────────────────────────────────
# BENEFÍCIOS
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def beneficios(request):
    categ = Beneficio.objects.filter(ativo=True, deleted_at__isnull=True).annotate(
        total_colabs=Count('colaboradores', filter=Q(colaboradores__status='ativo'))
    ).order_by('tipo','nome')
    return render(request, 'dp/beneficios.html', {
        'titulo':    'Benefícios', 'page_icon': '💳', 'beneficios': categ,
        'pode_criar':tem_permissao(request.user, 'dp', 'criar'),
    })


# ─────────────────────────────────────────────────────────────
# NOTIFICAÇÕES DP
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def notificacoes(request):
    qs = NotificacaoDP.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-created_at')
    if request.GET.get('nao_lidas'):
        qs = qs.filter(lida=False)
    return render(request, 'dp/notificacoes.html', {
        'titulo':       'Notificações DP', 'page_icon': '🔔',
        'notificacoes': qs[:100],
        'nao_lidas':    qs.filter(lida=False).count(),
    })


@login_required
@requer_nivel('analista')
@require_POST
def notificacao_marcar_lida(request, pk):
    notif = get_object_or_404(NotificacaoDP, pk=pk)
    notif.marcar_lida()
    return JsonResponse({'sucesso': True})


@login_required
@requer_nivel('analista')
@require_POST
def gerar_alertas(request):
    """Gera alertas automáticos de férias vencendo."""
    alertas = FeriasService.gerar_alertas_ferias()
    return JsonResponse({'sucesso': True, 'gerados': len(alertas), 'mensagem': f'{len(alertas)} alerta(s) gerado(s).'})


# ─────────────────────────────────────────────────────────────
# CÁLCULO EM MASSA
# ─────────────────────────────────────────────────────────────
@login_required
@requer_nivel('analista')
def calculo_massa(request):
    colabs = Colaborador.objects.filter(status__in=['ativo','ferias'], deleted_at__isnull=True) \
                                .select_related('cargo','departamento').order_by('nome')
    return render(request, 'dp/calculo_massa.html', {
        'titulo':    'Cálculo em Massa', 'page_icon': '⚡', 'colabs': colabs,
    })


@login_required
@requer_nivel('analista')
@require_POST
def calculo_massa_executar(request):
    """Processa cálculo em lote via AJAX."""
    dados = json.loads(request.body)
    tipo  = dados.get('tipo')  # ferias | decimo | reajuste
    ids   = dados.get('colaborador_ids', [])

    if not ids:
        return JsonResponse({'sucesso': False, 'mensagem': 'Selecione colaboradores.'})

    colabs = Colaborador.objects.filter(id__in=ids, deleted_at__isnull=True)
    resultados = []
    total_liquido = Decimal('0')

    for c in colabs:
        sal = _d(c.salario_base)
        dep = c.dependentes.filter(ir=True).count()

        if tipo == 'ferias':
            r = FeriasService.calcular(sal, 30, 0, dep)
        elif tipo == 'decimo':
            r = DecimoTerceiroService.calcular(sal, date.today().month, '2', dep)
        elif tipo == 'reajuste':
            pct = Decimal(str(dados.get('percentual', 5)))
            novo_sal = _d(sal * (1 + pct/100))
            r = SimulacaoService.simular_reajuste(sal, novo_sal, dep)
        else:
            continue

        liq = r.get('valor_liquido') or r.get('total_liquido') or r.get('parcela_2', Decimal('0'))
        total_liquido += _d(liq)
        resultados.append({'nome': c.nome, 'salario_base': float(sal), 'resultado': _serializar(r)})

    LogAuditoria.registrar(usuario=request.user, acao='CALCULAR', recurso='dp_massa',
                            dados_depois={'tipo': tipo, 'total': len(resultados)}, ip=_get_ip(request))

    return JsonResponse({
        'sucesso':      True,
        'resultados':   resultados,
        'total':        len(resultados),
        'total_liquido':float(total_liquido),
    })
