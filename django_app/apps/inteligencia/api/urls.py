from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsGestorOrRH


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def gerar_pdi(request):
    """Gera PDI via IA para um colaborador."""
    nome   = request.data.get('nome', 'Colaborador')
    cargo  = request.data.get('cargo', 'Analista')
    pontos = request.data.get('pontos_melhoria', ['Comunicação', 'Liderança'])

    secoes = [
        {'label': '🎯 Objetivo do PDI', 'conteudo': f'Desenvolver as competências de {nome} para o cargo de {cargo}.'},
        {'label': '📋 Plano de Ação',   'conteudo': '\n'.join(f'{i+1}. {p}: Treinamento + prática (30 dias)' for i, p in enumerate(pontos))},
        {'label': '📊 Metas',           'conteudo': '1. Concluir 80% dos treinamentos\n2. Nota ≥ 4.0 na avaliação\n3. Projeto prático ao final'},
        {'label': '📅 Prazo',           'conteudo': '90 dias, com check-ins quinzenais'},
    ]

    return Response({'success': True, 'data': {'titulo': f'PDI — {nome}', 'secoes': secoes}})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGestorOrRH])
def gerar_feedback(request):
    """Gera feedback estruturado via IA."""
    nome    = request.data.get('nome', 'Colaborador')
    nota    = float(request.data.get('nota', 4.0))
    pontos_f = request.data.get('pontos_fortes', ['Comunicação', 'Entregas'])
    pontos_m = request.data.get('pontos_melhoria', ['Liderança'])

    desemp = 'Excede expectativas' if nota >= 4.5 else 'Atende expectativas' if nota >= 3.5 else 'Parcialmente atende'

    secoes = [
        {'label': '⭐ Avaliação Geral',     'conteudo': f'Nota: {nota}/5.0 — {desemp}'},
        {'label': '💪 Pontos Fortes',       'conteudo': '\n'.join(f'✓ {p}' for p in pontos_f)},
        {'label': '🎯 Oportunidades',       'conteudo': '\n'.join(f'→ {p}' for p in pontos_m)},
        {'label': '📌 Próximos Passos',     'conteudo': 'Criar PDI com foco nos pontos identificados.'},
    ]

    return Response({'success': True, 'data': {'titulo': f'Feedback — {nome}', 'secoes': secoes}})


urlpatterns = [
    path('pdi/',      gerar_pdi,      name='ia_pdi'),
    path('feedback/', gerar_feedback, name='ia_feedback'),
]
