"""
apps/analytics/services.py — Motor de People Analytics e IA.
Calcula scores de risco, engajamento, burnout, DNA corporativo.
"""
from decimal import Decimal
from datetime import date, timedelta
import math
import logging

logger = logging.getLogger('apps')


def calcular_score_risco_saida(colaborador) -> dict:
    """
    Score de risco de saída (0–100) baseado em 6 fatores preditivos.
    Quanto mais alto, maior o risco de desligamento.
    """
    score = 0
    fatores = []

    # 1. Tempo de empresa (15%)
    meses = math.floor((date.today() - colaborador.data_admissao).days / 30)
    if meses < 6:
        pts = 15
        fatores.append({'fator': 'tempo_empresa', 'pts': pts, 'desc': 'Menos de 6 meses — alto risco inicial'})
    elif meses < 18:
        pts = 8
        fatores.append({'fator': 'tempo_empresa', 'pts': pts, 'desc': '6–18 meses — período crítico'})
    elif meses > 36:
        pts = 5
        fatores.append({'fator': 'tempo_empresa', 'pts': pts, 'desc': '> 3 anos sem promoção — risco médio'})
    else:
        pts = 2
        fatores.append({'fator': 'tempo_empresa', 'pts': pts, 'desc': 'Tempo estável'})
    score += pts

    # 2. Salário vs. mercado (20%)
    try:
        cargo = colaborador.cargo
        if cargo and cargo.salario_max and cargo.salario_min:
            mediana = (cargo.salario_min + cargo.salario_max) / 2
            sal     = Decimal(str(colaborador.salario_base))
            if sal < mediana * Decimal('0.85'):
                pts = 20
                fatores.append({'fator': 'salario', 'pts': pts, 'desc': 'Salário >15% abaixo da mediana'})
            elif sal < mediana * Decimal('0.95'):
                pts = 10
                fatores.append({'fator': 'salario', 'pts': pts, 'desc': 'Salário levemente abaixo da mediana'})
            else:
                pts = 2
                fatores.append({'fator': 'salario', 'pts': pts, 'desc': 'Salário competitivo'})
            score += pts
    except Exception:
        pass

    # 3. Avaliações de desempenho (20%)
    try:
        ultima_aval = colaborador.avaliacoes.filter(status='concluida').first()
        if ultima_aval:
            nota = float(ultima_aval.nota_geral or 3)
            if nota < 3.0:
                pts = 20
                fatores.append({'fator': 'avaliacao', 'pts': pts, 'desc': f'Nota baixa: {nota:.1f}/5'})
            elif nota < 3.5:
                pts = 10
                fatores.append({'fator': 'avaliacao', 'pts': pts, 'desc': f'Nota regular: {nota:.1f}/5'})
            else:
                pts = 0
                fatores.append({'fator': 'avaliacao', 'pts': pts, 'desc': f'Nota boa: {nota:.1f}/5'})
            score += pts
        else:
            pts = 10
            score += pts
            fatores.append({'fator': 'avaliacao', 'pts': pts, 'desc': 'Sem avaliação recente'})
    except Exception:
        pass

    # 4. Faltas recentes nos últimos 90 dias (25%)
    try:
        from apps.dp.models import NotificacaoDP
        faltas_90d = NotificacaoDP.objects.filter(
            colaborador=colaborador,
            tipo='falta',
            created_at__gte=date.today() - timedelta(days=90)
        ).count()
        pts = min(int(faltas_90d * 5), 25)
        score += pts
        fatores.append({'fator': 'faltas', 'pts': pts, 'desc': f'{faltas_90d} faltas nos últimos 90 dias'})
    except Exception:
        pass

    # 5. Clima organizacional (10%)
    try:
        from apps.rh.models import RespostaPesquisa
        ultima_resp = RespostaPesquisa.objects.filter(
            colaborador=colaborador,
            pesquisa__tipo='clima'
        ).order_by('-created_at').first()
        if ultima_resp and ultima_resp.respostas:
            satisf = ultima_resp.respostas.get('satisfacao', 3)
            if float(satisf) < 2:
                pts = 10
                fatores.append({'fator': 'clima', 'pts': pts, 'desc': 'Satisfação muito baixa no clima'})
            elif float(satisf) < 3:
                pts = 6
                fatores.append({'fator': 'clima', 'pts': pts, 'desc': 'Satisfação abaixo da média no clima'})
            else:
                pts = 1
                fatores.append({'fator': 'clima', 'pts': pts, 'desc': 'Satisfação adequada'})
            score += pts
    except Exception:
        pass

    # 6. Histórico salarial — sem reajuste em 18+ meses (10%)
    try:
        ultimo_reaj = colaborador.historico_salarial.first()
        if ultimo_reaj:
            meses_sem_reaj = math.floor((date.today() - ultimo_reaj.vigencia).days / 30)
            if meses_sem_reaj > 18:
                pts = 10
                fatores.append({'fator': 'reajuste', 'pts': pts, 'desc': f'Sem reajuste há {meses_sem_reaj} meses'})
            elif meses_sem_reaj > 12:
                pts = 5
                factores_append = {'fator': 'reajuste', 'pts': pts, 'desc': f'Sem reajuste há {meses_sem_reaj} meses'}
                score += pts
    except Exception:
        pass

    score = min(score, 100)
    nivel = 'critico' if score >= 70 else 'alto' if score >= 45 else 'medio' if score >= 25 else 'baixo'

    return {
        'score':      score,
        'nivel':      nivel,
        'fatores':    fatores,
        'colaborador_id': str(colaborador.id),
    }


def calcular_score_engajamento(colaborador) -> int:
    """Score de engajamento 0–100."""
    pts = 50  # Base

    try:
        # Pesquisas respondidas
        from apps.rh.models import RespostaPesquisa
        respostas = RespostaPesquisa.objects.filter(colaborador=colaborador).count()
        pts += min(respostas * 5, 20)

        # Treinamentos concluídos
        from apps.treinamento.models import TreinamentoColaborador
        trein = TreinamentoColaborador.objects.filter(colaborador=colaborador, status='concluido').count()
        pts += min(trein * 3, 15)

        # Avaliações positivas
        av = colaborador.avaliacoes.filter(status='concluida', nota_geral__gte=4).count()
        pts += min(av * 5, 15)

    except Exception:
        pass

    return min(max(pts, 0), 100)


def atualizar_scores_todos():
    """Tarefa periódica para recalcular scores de todos os colaboradores ativos."""
    from apps.rh.models import Colaborador
    from .models import ScoreColaborador

    colabs = Colaborador.objects.filter(status='ativo')
    atualizados = 0

    for colab in colabs:
        try:
            dados  = calcular_score_risco_saida(colab)
            engaj  = calcular_score_engajamento(colab)

            ScoreColaborador.objects.create(
                colaborador=colab,
                score_risco_saida=dados['score'],
                nivel_risco=dados['nivel'],
                score_engajamento=engaj,
                fatores_json={'fatores': dados['fatores']},
            )
            atualizados += 1
        except Exception as e:
            logger.error('Erro calculando score de %s: %s', colab.nome, e)

    logger.info('Scores atualizados: %d/%d colaboradores', atualizados, colabs.count())
    return atualizados
