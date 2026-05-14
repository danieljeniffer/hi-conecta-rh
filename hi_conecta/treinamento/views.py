"""treinamento/views.py — T&D: catálogo, trilhas, PDI, certificados."""
import io
from datetime import date, timedelta
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from accounts.permissions import requer_perfil
from .models import Treinamento, Trilha, Matricula, PDI


@login_required
def lista(request):
    qs = Treinamento.objects.filter(ativo=True, deleted_at__isnull=True)
    tipo = request.GET.get('tipo', '')
    if tipo:
        qs = qs.filter(tipo=tipo)

    matriculas_usuario = {}
    colab = getattr(request.user, 'colaborador', None)
    if colab:
        matriculas_usuario = {
            m.treinamento_id: m
            for m in Matricula.objects.filter(colaborador=colab, deleted_at__isnull=True)
        }

    ctx = {
        'treinamentos':      qs,
        'tipos':             Treinamento.TIPOS,
        'tipo_filtrado':     tipo,
        'matriculas':        matriculas_usuario,
        'page_title':        'Catálogo de Treinamentos',
    }
    return render(request, 'treinamento/lista.html', ctx)


@login_required
def matricular(request, pk):
    treinamento = get_object_or_404(Treinamento, pk=pk, ativo=True, deleted_at__isnull=True)
    colab = getattr(request.user, 'colaborador', None)
    if not colab:
        return redirect('treinamento:lista')
    m, criada = Matricula.objects.get_or_create(
        colaborador=colab, treinamento=treinamento,
        defaults={'status': 'inscrito', 'data_inicio': date.today(), 'criado_por': request.user},
    )
    if criada:
        from gamificacao.models import PontuacaoColaborador, TransacaoPontos
        try:
            pt, _ = PontuacaoColaborador.objects.get_or_create(colaborador=colab)
            pt.total_pontos += 10
            pt.save()
            TransacaoPontos.objects.create(
                colaborador=colab, pontos=10, origem='treinamento',
                descricao=f'Inscrito em: {treinamento.titulo}',
            )
        except Exception:
            pass
    return redirect('treinamento:lista')


@login_required
def pdis_lista(request):
    colab = getattr(request.user, 'colaborador', None)
    if request.user.perfil in ('rh', 'admin', 'analista', 'gestor'):
        qs = PDI.objects.filter(deleted_at__isnull=True).select_related('colaborador').order_by('-created_at')
    elif colab:
        qs = PDI.objects.filter(colaborador=colab, deleted_at__isnull=True).order_by('-created_at')
    else:
        qs = PDI.objects.none()

    ctx = {'pdis': qs, 'page_title': 'PDIs — Planos de Desenvolvimento'}
    return render(request, 'treinamento/pdis.html', ctx)


@login_required
@requer_perfil('rh', 'analista', 'admin', 'gestor')
def gerar_pdi_ia(request):
    """Gera PDI por IA para um colaborador."""
    import json
    from django.conf import settings
    if request.method != 'POST':
        from rh.models import Colaborador
        ctx = {
            'colaboradores': Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).order_by('nome'),
            'page_title': 'Gerar PDI com IA',
        }
        return render(request, 'treinamento/gerar_pdi.html', ctx)

    data = json.loads(request.body)
    colab_id = data.get('colaborador_id')
    from rh.models import Colaborador
    try:
        colab = Colaborador.objects.get(pk=colab_id, deleted_at__isnull=True)
    except Colaborador.DoesNotExist:
        return JsonResponse({'sucesso': False, 'mensagem': 'Colaborador não encontrado.'}, status=404)

    # Contexto para a IA
    contexto = {
        'colaborador': colab.nome,
        'cargo': colab.cargo.nome if colab.cargo else 'Não definido',
        'departamento': colab.departamento.nome if colab.departamento else 'Não definido',
        'objetivos': data.get('objetivos', 'Crescimento profissional geral'),
        'pontos_fortes': data.get('pontos_fortes', ''),
        'areas_melhoria': data.get('areas_melhoria', ''),
    }

    prompt = f"""Crie um PDI (Plano de Desenvolvimento Individual) para:
Colaborador: {contexto['colaborador']}
Cargo: {contexto['cargo']} | Departamento: {contexto['departamento']}
Objetivos: {contexto['objetivos']}
Pontos fortes: {contexto['pontos_fortes']}
Áreas de melhoria: {contexto['areas_melhoria']}

Responda em JSON: {{"titulo": "...", "objetivo": "...", "acoes": [{{"acao": "...", "prazo_dias": 30, "recurso": "...", "status": "pendente"}}]}}
Gere 4 a 6 ações práticas e específicas."""

    try:
        provedor = getattr(settings, 'IA_PROVEDOR', 'anthropic')
        if provedor == 'openai':
            import openai
            openai.api_key = getattr(settings, 'OPENAI_API_KEY', '')
            resp = openai.chat.completions.create(
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o'),
                messages=[{'role': 'user', 'content': prompt}],
                response_format={'type': 'json_object'},
            )
            pdi_data = json.loads(resp.choices[0].message.content)
        else:
            import anthropic
            client = anthropic.Anthropic(api_key=getattr(settings, 'ANTHROPIC_API_KEY', ''))
            msg = client.messages.create(
                model=getattr(settings, 'ANTHROPIC_MODEL', 'claude-opus-4-7'),
                max_tokens=1000,
                system='Responda APENAS com JSON válido.',
                messages=[{'role': 'user', 'content': prompt}],
            )
            texto = msg.content[0].text.strip().strip('```json').strip('```')
            pdi_data = json.loads(texto)
    except Exception as e:
        pdi_data = {
            'titulo': f'PDI — {colab.nome}',
            'objetivo': 'Desenvolvimento profissional e crescimento de carreira.',
            'acoes': [
                {'acao': 'Participar de treinamento técnico na área', 'prazo_dias': 30, 'recurso': 'Plataforma EAD', 'status': 'pendente'},
                {'acao': 'Realizar mentoria com líder sênior', 'prazo_dias': 60, 'recurso': 'Agenda interna', 'status': 'pendente'},
                {'acao': 'Estudar case de sucesso do setor', 'prazo_dias': 45, 'recurso': 'Biblioteca/YouTube', 'status': 'pendente'},
                {'acao': 'Apresentar resultado para equipe', 'prazo_dias': 90, 'recurso': 'Sala de reuniões', 'status': 'pendente'},
            ],
        }

    # Calcular prazos absolutos
    hoje = date.today()
    for a in pdi_data.get('acoes', []):
        a['prazo'] = (hoje + timedelta(days=a.pop('prazo_dias', 30))).isoformat()

    # Salvar PDI
    pdi = PDI.objects.create(
        colaborador=colab,
        gestor=request.user,
        titulo=pdi_data.get('titulo', f'PDI — {colab.nome}'),
        objetivo=pdi_data.get('objetivo', ''),
        prazo=hoje + timedelta(days=90),
        status='ativo',
        gerado_por_ia=True,
        acoes=pdi_data.get('acoes', []),
        criado_por=request.user,
    )
    return JsonResponse({'sucesso': True, 'pdi_id': str(pdi.id), 'dados': pdi_data})


def gerar_certificado_pdf(matricula_id):
    """Gera certificado PDF para uma matrícula concluída."""
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.pdfgen import canvas
        from reportlab.lib.styles import getSampleStyleSheet
    except ImportError:
        return None

    try:
        m = Matricula.objects.select_related('colaborador', 'treinamento').get(pk=matricula_id)
    except Matricula.DoesNotExist:
        return None

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    w, h = landscape(A4)

    # Fundo
    c.setFillColorRGB(0.05, 0.08, 0.17)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Borda decorativa
    c.setStrokeColorRGB(0.38, 0.40, 0.94)
    c.setLineWidth(4)
    c.rect(2*cm, 2*cm, w-4*cm, h-4*cm, fill=0, stroke=1)

    # Título
    c.setFillColorRGB(0.95, 0.96, 0.99)
    c.setFont('Helvetica-Bold', 32)
    c.drawCentredString(w/2, h-4*cm, 'CERTIFICADO DE CONCLUSÃO')

    c.setFont('Helvetica', 16)
    c.setFillColorRGB(0.57, 0.64, 0.85)
    c.drawCentredString(w/2, h-5*cm, 'hi Conecta RH — Sistema Corporativo')

    # Corpo
    c.setFillColorRGB(0.95, 0.96, 0.99)
    c.setFont('Helvetica', 14)
    c.drawCentredString(w/2, h/2+1.5*cm, 'Certificamos que')
    c.setFont('Helvetica-Bold', 22)
    c.drawCentredString(w/2, h/2, m.colaborador.nome)
    c.setFont('Helvetica', 14)
    c.drawCentredString(w/2, h/2-1.5*cm, f'concluiu com sucesso o treinamento:')
    c.setFont('Helvetica-Bold', 18)
    c.drawCentredString(w/2, h/2-2.8*cm, m.treinamento.titulo)
    c.setFont('Helvetica', 12)
    c.drawCentredString(w/2, h/2-4*cm,
        f'Carga Horária: {m.treinamento.carga_horaria}h  |  Concluído em: '
        f'{m.data_conclusao.strftime("%d/%m/%Y") if m.data_conclusao else "—"}')

    # Assinatura
    c.setFillColorRGB(0.57, 0.64, 0.85)
    c.setFont('Helvetica', 10)
    c.drawCentredString(w/2, 3.5*cm, f'Documento gerado em {date.today().strftime("%d/%m/%Y")} — Válido mediante verificação digital')

    c.save()
    buf.seek(0)
    return buf.read()
