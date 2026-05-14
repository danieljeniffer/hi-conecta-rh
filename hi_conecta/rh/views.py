"""
rh/views.py — Views do módulo de Gestão de Pessoas.
CRUD, filtros, exportação, organograma e timeline.
"""
import csv
import io
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_http_methods
from django.http import JsonResponse, HttpResponse, Http404
from django.db.models import Q, Count, Avg
from django.core.paginator import Paginator
from django.utils import timezone
from accounts.permissions import requer_nivel, requer_permissao, tem_permissao
from core.models import LogAuditoria
from .models import (
    Colaborador, Departamento, Cargo, Dependente,
    HistoricoSalarial, AvaliacaoDesempenho, Advertencia,
    Politica, PesquisaClima, RespostaPesquisa,
)
from .forms import (
    ColaboradorBasicoForm, ColaboradorContratualForm,
    ColaboradorEnderecoForm, ColaboradorBancarioForm,
    ColaboradorDocumentosForm, ColaboradorFiltroForm,
    AvaliacaoDesempenhoForm, AdvertenciaForm,
    DepartamentoForm, CargoForm, PesquisaClimaForm,
)
from .services import ColaboradorService, DashboardRHService
import logging

logger = logging.getLogger('core')


def _get_ip(request):
    x_fwd = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR', '')


# ── Utilitário: queryset filtrado por perfil ──────────────────
def _qs_colaboradores(request):
    qs = Colaborador.objects.filter(deleted_at__isnull=True).select_related('departamento', 'cargo', 'gestor')
    if request.user.perfil == 'gestor':
        colab_id = getattr(request.user, 'colaborador_id', None)
        if colab_id:
            qs = qs.filter(Q(departamento__gestor_id=colab_id) | Q(gestor_id=colab_id))
    return qs


# ─────────────────────────────────────────────────────────────
# COLABORADORES
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('gestor')
def pessoas(request):
    """Listagem de colaboradores com filtros e paginação."""
    form = ColaboradorFiltroForm(request.GET)
    qs   = _qs_colaboradores(request)

    if form.is_valid():
        busca = form.cleaned_data.get('busca')
        if busca:
            qs = qs.filter(
                Q(nome__icontains=busca) | Q(cpf__icontains=busca) |
                Q(email_corporativo__icontains=busca) | Q(email__icontains=busca)
            )
        if form.cleaned_data.get('departamento'):
            qs = qs.filter(departamento=form.cleaned_data['departamento'])
        if form.cleaned_data.get('cargo'):
            qs = qs.filter(cargo=form.cleaned_data['cargo'])
        if form.cleaned_data.get('status'):
            qs = qs.filter(status=form.cleaned_data['status'])
        if form.cleaned_data.get('regime'):
            qs = qs.filter(regime=form.cleaned_data['regime'])
        ordenar = form.cleaned_data.get('ordenar') or 'nome'
        qs = qs.order_by(ordenar)
    else:
        qs = qs.order_by('nome')

    # Exportação CSV
    if request.GET.get('exportar') == 'csv':
        return _exportar_csv_colaboradores(qs)
    if request.GET.get('exportar') == 'json':
        return _exportar_json_colaboradores(qs)

    paginator = Paginator(qs, 20)
    page_obj  = paginator.get_page(request.GET.get('page', 1))

    context = {
        'titulo':       'Gestão de Pessoas',
        'page_icon':    '👥',
        'page_obj':     page_obj,
        'form':         form,
        'total':        qs.count(),
        'kpis':         DashboardRHService.kpis(request.user),
        'pode_criar':   tem_permissao(request.user, 'rh', 'criar'),
        'pode_exportar':tem_permissao(request.user, 'rh', 'exportar'),
    }
    return render(request, 'rh/pessoas.html', context)


@login_required
def colaborador_detalhe(request, pk):
    """Perfil completo do colaborador."""
    qs    = _qs_colaboradores(request)
    colab = get_object_or_404(qs.prefetch_related(
        'dependentes', 'historico_salarial', 'avaliacoes',
        'advertencias',
    ), pk=pk)

    if not colab.pode_visualizar(request.user):
        raise Http404

    LogAuditoria.registrar(
        usuario=request.user, acao='VISUALIZAR', recurso='colaboradores',
        recurso_id=str(colab.id), ip=_get_ip(request),
    )

    return render(request, 'rh/colaborador_detalhe.html', {
        'titulo':       colab.nome,
        'page_icon':    '👤',
        'colab':        colab,
        'timeline':     colab.timeline(),
        'pode_editar':  tem_permissao(request.user, 'rh', 'editar'),
    })


@login_required
@requer_permissao('rh', 'criar')
def colaborador_novo(request):
    """Wizard multi-etapa de admissão."""
    etapa    = int(request.GET.get('etapa', 1))
    session_key = 'novo_colab_dados'

    dados_sessao = request.session.get(session_key, {})

    FORMS_ETAPA = {
        1: ColaboradorBasicoForm,
        2: ColaboradorContratualForm,
        3: ColaboradorEnderecoForm,
        4: ColaboradorBancarioForm,
        5: ColaboradorDocumentosForm,
    }

    FormClass = FORMS_ETAPA.get(etapa, ColaboradorBasicoForm)

    if request.method == 'POST':
        form = FormClass(request.POST, request.FILES)
        if form.is_valid():
            dados_sessao.update(form.cleaned_data)
            # Converte campos não-serializáveis
            for k, v in list(dados_sessao.items()):
                if hasattr(v, 'pk'):
                    dados_sessao[k] = v.pk

            request.session[session_key] = dados_sessao

            if etapa < 5:
                return redirect(f'{request.path}?etapa={etapa + 1}')

            # Etapa final — cria o colaborador
            try:
                colab = ColaboradorService.admitir(
                    dados=_restaurar_fks(dados_sessao),
                    usuario=request.user
                )
                del request.session[session_key]
                messages.success(request, f'✅ {colab.nome} admitido(a) com sucesso!')
                return redirect('rh:colaborador_detalhe', pk=colab.pk)
            except Exception as e:
                logger.exception('Erro ao admitir colaborador: %s', e)
                messages.error(request, f'Erro ao criar colaborador: {e}')
    else:
        form = FormClass(initial=_restaurar_fks(dados_sessao))

    return render(request, 'rh/colaborador_form.html', {
        'titulo':     f'Nova Admissão — Etapa {etapa}/5',
        'page_icon':  '👤',
        'form':       form,
        'etapa':      etapa,
        'etapas':     [
            {'n': 1, 'label': 'Dados Pessoais'},
            {'n': 2, 'label': 'Contrato'},
            {'n': 3, 'label': 'Endereço'},
            {'n': 4, 'label': 'Banco'},
            {'n': 5, 'label': 'Documentos'},
        ],
    })


def _restaurar_fks(dados):
    """Restaura chaves estrangeiras salvas como ID na sessão."""
    from django.apps import apps
    resultado = {}
    fks = {'departamento': Departamento, 'cargo': Cargo, 'gestor': Colaborador}
    for k, v in dados.items():
        if k in fks and v:
            try:
                resultado[k] = fks[k].objects.get(pk=v)
            except Exception:
                resultado[k] = None
        else:
            resultado[k] = v
    return resultado


@login_required
@requer_permissao('rh', 'editar')
def colaborador_editar(request, pk):
    """Edição do colaborador."""
    qs    = _qs_colaboradores(request)
    colab = get_object_or_404(qs, pk=pk)

    if request.method == 'POST':
        form = ColaboradorBasicoForm(request.POST, request.FILES, instance=colab)
        if form.is_valid():
            antes = {'nome': colab.nome, 'status': colab.status}
            obj   = form.save(commit=False)
            obj.atualizado_por = request.user
            obj.save()
            LogAuditoria.registrar(
                usuario=request.user, acao='EDITAR', recurso='colaboradores',
                recurso_id=str(colab.id), ip=_get_ip(request),
                dados_antes=antes,
                dados_depois={'nome': obj.nome, 'status': obj.status},
            )
            messages.success(request, 'Colaborador atualizado com sucesso.')
            return redirect('rh:colaborador_detalhe', pk=pk)
    else:
        form = ColaboradorBasicoForm(instance=colab)

    return render(request, 'rh/colaborador_form.html', {
        'titulo':    f'Editar — {colab.nome}',
        'page_icon': '✏️',
        'form':      form,
        'colab':     colab,
        'editando':  True,
    })


@login_required
@requer_permissao('rh', 'editar')
@require_POST
def colaborador_desligar(request, pk):
    """Desliga colaborador via AJAX."""
    colab  = get_object_or_404(_qs_colaboradores(request), pk=pk)
    data   = request.POST.get('data_demissao')
    motivo = request.POST.get('motivo', '')

    try:
        from datetime import date
        ColaboradorService.desligar(
            colab, date.fromisoformat(data), motivo, request.user
        )
        messages.success(request, f'{colab.nome} desligado(a).')
        return JsonResponse({'sucesso': True})
    except Exception as e:
        return JsonResponse({'sucesso': False, 'mensagem': str(e)}, status=400)


# ── Exportações ───────────────────────────────────────────────
def _exportar_csv_colaboradores(qs):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Nome', 'CPF', 'Cargo', 'Departamento', 'Status', 'Admissão', 'Salário'])
    for c in qs:
        writer.writerow([
            c.nome, c.cpf_formatado,
            str(c.cargo or '—'), str(c.departamento or '—'),
            c.get_status_display(),
            c.data_admissao.strftime('%d/%m/%Y'),
            f'R$ {c.salario_base:,.2f}'.replace(',','X').replace('.',',').replace('X','.'),
        ])
    resp = HttpResponse(output.getvalue(), content_type='text/csv; charset=utf-8-sig')
    resp['Content-Disposition'] = 'attachment; filename="colaboradores.csv"'
    return resp


def _exportar_json_colaboradores(qs):
    import json
    dados = list(qs.values(
        'id','nome','cpf','status','regime',
        'cargo__nome','departamento__nome','data_admissao','salario_base'
    ))
    return JsonResponse({'sucesso': True, 'dados': dados, 'total': len(dados)})


# ─────────────────────────────────────────────────────────────
# DEPARTAMENTOS
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('gestor')
def departamentos(request):
    qs = Departamento.objects.filter(ativo=True, deleted_at__isnull=True, pai__isnull=True) \
                             .prefetch_related('subdepartamentos', 'colaboradores') \
                             .annotate(hc=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))) \
                             .order_by('nome')
    return render(request, 'rh/departamentos.html', {
        'titulo':    'Departamentos',
        'page_icon': '🏢',
        'depts':     qs,
        'pode_criar':tem_permissao(request.user, 'rh', 'criar'),
    })


@login_required
@requer_permissao('rh', 'criar')
def departamento_form(request, pk=None):
    obj  = get_object_or_404(Departamento, pk=pk, deleted_at__isnull=True) if pk else None
    form = DepartamentoForm(request.POST or None, instance=obj)
    if form.is_valid():
        dept = form.save(commit=False)
        dept.atualizado_por = request.user if obj else None
        dept.criado_por     = request.user if not obj else dept.criado_por
        dept.save()
        messages.success(request, 'Departamento salvo.')
        return redirect('rh:departamentos')
    return render(request, 'rh/departamento_form.html', {
        'titulo':    'Editar Departamento' if obj else 'Novo Departamento',
        'page_icon': '🏢', 'form': form, 'obj': obj,
    })


# ─────────────────────────────────────────────────────────────
# CARGOS
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('gestor')
def cargos(request):
    qs = Cargo.objects.filter(ativo=True, deleted_at__isnull=True) \
                      .select_related('departamento') \
                      .annotate(hc=Count('colaboradores', filter=Q(colaboradores__status='ativo', colaboradores__deleted_at__isnull=True))) \
                      .order_by('nome')
    return render(request, 'rh/cargos.html', {
        'titulo':    'Cargos & Estrutura',
        'page_icon': '🏗',
        'cargos':    qs,
        'pode_criar':tem_permissao(request.user, 'rh', 'criar'),
    })


@login_required
@requer_permissao('rh', 'criar')
def cargo_form(request, pk=None):
    obj  = get_object_or_404(Cargo, pk=pk, deleted_at__isnull=True) if pk else None
    form = CargoForm(request.POST or None, instance=obj)
    if form.is_valid():
        form.save()
        messages.success(request, 'Cargo salvo.')
        return redirect('rh:cargos')
    return render(request, 'rh/cargo_form.html', {
        'titulo':    'Editar Cargo' if obj else 'Novo Cargo',
        'page_icon': '🏗', 'form': form, 'obj': obj,
    })


# ─────────────────────────────────────────────────────────────
# ORGANOGRAMA
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('gestor')
def organograma(request):
    return render(request, 'rh/organograma.html', {
        'titulo':    'Organograma',
        'page_icon': '🌳',
    })


@login_required
@requer_nivel('gestor')
def organograma_json(request):
    """Retorna árvore de departamentos para o D3.js."""
    raizes = Departamento.objects.filter(pai__isnull=True, ativo=True, deleted_at__isnull=True)
    arvore = {'nome': 'Empresa', 'filhos': [d.para_arvore() for d in raizes]}
    return JsonResponse({'sucesso': True, 'dados': arvore})


# ─────────────────────────────────────────────────────────────
# INDICADORES
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('analista')
def indicadores(request):
    return render(request, 'rh/indicadores.html', {
        'titulo':    'Indicadores de RH',
        'page_icon': '📊',
        'ind':       DashboardRHService.indicadores(request.user),
    })


@login_required
@requer_nivel('analista')
def indicadores_json(request):
    return JsonResponse({'sucesso': True, 'dados': DashboardRHService.indicadores(request.user)})


# ─────────────────────────────────────────────────────────────
# AVALIAÇÕES
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('gestor')
def avaliacoes(request):
    qs = AvaliacaoDesempenho.objects.filter(deleted_at__isnull=True).select_related('colaborador', 'avaliador').order_by('-prazo')
    if request.user.perfil == 'gestor':
        colab_id = getattr(request.user, 'colaborador_id', None)
        if colab_id:
            qs = qs.filter(Q(avaliador_id=colab_id) | Q(colaborador__gestor_id=colab_id))

    return render(request, 'rh/avaliacoes.html', {
        'titulo':    'Avaliações de Desempenho',
        'page_icon': '📋',
        'avaliacoes':qs[:50],
        'pode_criar':tem_permissao(request.user, 'rh', 'criar'),
    })


@login_required
@requer_nivel('gestor')
def avaliacao_form(request, pk=None):
    obj  = get_object_or_404(AvaliacaoDesempenho, pk=pk, deleted_at__isnull=True) if pk else None
    form = AvaliacaoDesempenhoForm(request.POST or None, instance=obj)
    if form.is_valid():
        aval = form.save(commit=False)
        if aval.status == 'concluida' and not aval.realizada_em:
            aval.realizada_em = timezone.now()
        aval.save()
        LogAuditoria.registrar(
            usuario=request.user, acao='CRIAR' if not obj else 'EDITAR',
            recurso='avaliacoes', recurso_id=str(aval.id), ip=_get_ip(request),
        )
        messages.success(request, 'Avaliação salva.')
        return redirect('rh:avaliacoes')
    return render(request, 'rh/avaliacao_form.html', {
        'titulo':    'Avaliação de Desempenho',
        'page_icon': '📋', 'form': form, 'obj': obj,
    })


# ─────────────────────────────────────────────────────────────
# CLIMA
# ─────────────────────────────────────────────────────────────

@login_required
@requer_nivel('analista')
def clima(request):
    pesquisas = PesquisaClima.objects.filter(deleted_at__isnull=True).order_by('-created_at')
    return render(request, 'rh/clima.html', {
        'titulo':     'Clima & Engajamento',
        'page_icon':  '😊',
        'pesquisas':  pesquisas,
        'pode_criar': tem_permissao(request.user, 'rh', 'criar'),
    })


@login_required
@requer_permissao('rh', 'criar')
def clima_pesquisa_form(request, pk=None):
    obj  = get_object_or_404(PesquisaClima, pk=pk, deleted_at__isnull=True) if pk else None
    form = PesquisaClimaForm(request.POST or None, instance=obj)
    if form.is_valid():
        form.save()
        messages.success(request, 'Pesquisa salva.')
        return redirect('rh:clima')
    return render(request, 'rh/pesquisa_form.html', {
        'titulo':    'Pesquisa de Clima',
        'page_icon': '😊', 'form': form, 'obj': obj,
    })


# ─────────────────────────────────────────────────────────────
# ADVERTÊNCIAS
# ─────────────────────────────────────────────────────────────

@login_required
@requer_permissao('rh', 'criar')
def advertencia_form(request, colab_pk=None):
    colab = get_object_or_404(Colaborador, pk=colab_pk, deleted_at__isnull=True) if colab_pk else None
    form  = AdvertenciaForm(request.POST or None, initial={'colaborador': colab})
    if form.is_valid():
        adv = form.save(commit=False)
        adv.criado_por = request.user
        adv.save()
        LogAuditoria.registrar(
            usuario=request.user, acao='CRIAR', recurso='advertencias',
            recurso_id=str(adv.id), ip=_get_ip(request),
            descricao=f'Advertência emitida para {adv.colaborador.nome}',
        )
        messages.success(request, 'Advertência registrada.')
        return redirect('rh:colaborador_detalhe', pk=adv.colaborador.pk)
    return render(request, 'rh/advertencia_form.html', {
        'titulo':    'Registrar Advertência',
        'page_icon': '⚠️', 'form': form, 'colab': colab,
    })
