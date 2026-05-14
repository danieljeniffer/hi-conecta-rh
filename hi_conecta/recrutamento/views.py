"""recrutamento/views.py — ATS: vagas, Kanban, candidatos, entrevistas."""
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.contrib import messages
from django.utils import timezone
from accounts.permissions import requer_perfil
from .models import Vaga, Candidato, Candidatura, Entrevista
from .services import RecrutamentoIAService


@login_required
@requer_perfil('rh', 'analista', 'admin', 'gestor')
def vagas_lista(request):
    status = request.GET.get('status', '')
    qs = Vaga.objects.filter(deleted_at__isnull=True)
    if status:
        qs = qs.filter(status=status)
    qs = qs.select_related('departamento', 'cargo', 'responsavel').order_by('-created_at')

    ctx = {
        'vagas':        qs,
        'status_atual': status,
        'STATUS':       Vaga.STATUS,
        'total_abertas': Vaga.objects.filter(status='aberta', deleted_at__isnull=True).count(),
        'page_title':   'Recrutamento & Seleção',
    }
    return render(request, 'recrutamento/vagas_lista.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin', 'gestor')
def vaga_detalhe(request, pk):
    vaga = get_object_or_404(Vaga, pk=pk, deleted_at__isnull=True)
    candidaturas = Candidatura.objects.filter(vaga=vaga, deleted_at__isnull=True).select_related('candidato', 'avaliador')

    pipeline = {etapa: [] for etapa, _ in Candidatura.ETAPAS if etapa not in ('reprovado','desistiu')}
    reprovados = []
    for c in candidaturas:
        if c.etapa in ('reprovado', 'desistiu'):
            reprovados.append(c)
        elif c.etapa in pipeline:
            pipeline[c.etapa].append(c)

    ctx = {
        'vaga':       vaga,
        'pipeline':   pipeline,
        'reprovados': reprovados,
        'etapas':     Candidatura.ETAPAS,
        'page_title': vaga.titulo,
    }
    return render(request, 'recrutamento/vaga_kanban.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def vaga_criar(request):
    if request.method == 'POST':
        titulo         = request.POST.get('titulo', '').strip()
        usar_ia        = request.POST.get('usar_ia') == '1'
        departamento_id= request.POST.get('departamento')
        cargo_id       = request.POST.get('cargo')
        modalidade     = request.POST.get('modalidade', 'presencial')
        tipo_contrato  = request.POST.get('tipo_contrato', 'clt')

        vaga = Vaga.objects.create(
            titulo=titulo,
            departamento_id=departamento_id or None,
            cargo_id=cargo_id or None,
            modalidade=modalidade,
            tipo_contrato=tipo_contrato,
            salario_min=request.POST.get('salario_min') or None,
            salario_max=request.POST.get('salario_max') or None,
            salario_oculto=request.POST.get('salario_oculto') == '1',
            vagas_count=int(request.POST.get('vagas_count', 1)),
            cidade=request.POST.get('cidade', ''),
            uf=request.POST.get('uf', ''),
            responsavel=request.user,
            criado_por=request.user,
        )

        if usar_ia:
            from rh.models import Cargo, Departamento
            cargo_nome = Cargo.objects.filter(pk=cargo_id).values_list('nome', flat=True).first() or titulo
            dept_nome  = Departamento.objects.filter(pk=departamento_id).values_list('nome', flat=True).first() or ''
            conteudo = RecrutamentoIAService.gerar_descricao_vaga(titulo, cargo_nome, dept_nome, tipo_contrato, modalidade)
            perguntas = RecrutamentoIAService.gerar_perguntas_entrevista(titulo, cargo_nome)
            vaga.descricao   = conteudo.get('descricao', '')
            vaga.requisitos  = conteudo.get('requisitos', '')
            vaga.beneficios  = conteudo.get('beneficios', '')
            vaga.descricao_ia = True
            vaga.perguntas_entrevista = perguntas
        else:
            vaga.descricao  = request.POST.get('descricao', '')
            vaga.requisitos = request.POST.get('requisitos', '')
            vaga.beneficios = request.POST.get('beneficios', '')

        vaga.save()
        messages.success(request, f'Vaga "{titulo}" criada com sucesso.')
        return redirect('recrutamento:vaga_detalhe', pk=vaga.pk)

    from rh.models import Departamento, Cargo
    ctx = {
        'departamentos': Departamento.objects.filter(ativo=True, deleted_at__isnull=True),
        'cargos':        Cargo.objects.filter(ativo=True, deleted_at__isnull=True).order_by('nome'),
        'modalidades':   Vaga.MODALIDADES,
        'tipos_contrato':Vaga.TIPOS_CONTRATO,
        'page_title':    'Nova Vaga',
    }
    return render(request, 'recrutamento/vaga_criar.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin')
def candidatos_lista(request):
    qs = Candidato.objects.filter(deleted_at__isnull=True, bloqueado=False).order_by('-created_at')
    busca = request.GET.get('q', '')
    if busca:
        qs = qs.filter(nome__icontains=busca) | qs.filter(email__icontains=busca)
    ctx = {
        'candidatos': qs[:100],
        'busca':      busca,
        'page_title': 'Banco de Candidatos',
    }
    return render(request, 'recrutamento/candidatos.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin', 'gestor')
@require_POST
def mover_candidatura(request):
    """AJAX: move candidato para próxima etapa no Kanban."""
    data = json.loads(request.body)
    cand_id = data.get('candidatura_id')
    nova_etapa = data.get('etapa')
    try:
        cand = Candidatura.objects.get(pk=cand_id, deleted_at__isnull=True)
        cand.etapa = nova_etapa
        cand.avaliador = request.user
        if nova_etapa == 'reprovado':
            cand.motivo_reprovacao = data.get('motivo', '')
        cand.save()
        return JsonResponse({'sucesso': True, 'etapa': nova_etapa})
    except Candidatura.DoesNotExist:
        return JsonResponse({'sucesso': False}, status=404)


@login_required
@requer_perfil('rh', 'analista', 'admin')
@require_POST
def gerar_ia_vaga(request):
    """AJAX: gera descrição e perguntas por IA."""
    data = json.loads(request.body)
    titulo = data.get('titulo', '')
    cargo  = data.get('cargo', '')
    dept   = data.get('departamento', '')
    tipo   = data.get('tipo_contrato', 'CLT')
    mod    = data.get('modalidade', 'presencial')
    descricao  = RecrutamentoIAService.gerar_descricao_vaga(titulo, cargo, dept, tipo, mod)
    perguntas  = RecrutamentoIAService.gerar_perguntas_entrevista(titulo, cargo)
    return JsonResponse({'sucesso': True, 'descricao': descricao, 'perguntas': perguntas})


@login_required
@requer_perfil('rh', 'analista', 'admin')
@require_POST
def publicar_vaga(request, pk):
    vaga = get_object_or_404(Vaga, pk=pk, deleted_at__isnull=True)
    vaga.status = 'aberta'
    vaga.publicada_em = timezone.now()
    vaga.save(update_fields=['status', 'publicada_em'])
    messages.success(request, f'Vaga "{vaga.titulo}" publicada.')
    return redirect('recrutamento:vaga_detalhe', pk=pk)
