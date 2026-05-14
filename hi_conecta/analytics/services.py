"""
analytics/services.py — Serviços de People Analytics.
Cálculos de Turnover, Absenteísmo, Engajamento, Burnout, Desligamento, Justiça Corporativa.
"""
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from django.db.models import Avg, Count, Sum, Q, F
from django.utils import timezone


# ── Turnover Service ──────────────────────────────────────────
class TurnoverService:
    """Cálculo e análise de turnover (rotatividade)."""

    @staticmethod
    def calcular_taxa(periodo_inicio: date, periodo_fim: date, departamento_id=None) -> dict:
        from rh.models import Colaborador
        qs = Colaborador.all_objects.filter(deleted_at__isnull=True)
        if departamento_id:
            qs = qs.filter(departamento_id=departamento_id)

        total_inicio = qs.filter(data_admissao__lte=periodo_inicio).exclude(
            Q(data_demissao__isnull=False) & Q(data_demissao__lt=periodo_inicio)
        ).count()

        total_fim = qs.filter(data_admissao__lte=periodo_fim).exclude(
            Q(data_demissao__isnull=False) & Q(data_demissao__lt=periodo_fim)
        ).count()

        demitidos = qs.filter(
            data_demissao__gte=periodo_inicio,
            data_demissao__lte=periodo_fim,
        ).count()

        admitidos = qs.filter(
            data_admissao__gte=periodo_inicio,
            data_admissao__lte=periodo_fim,
        ).count()

        media_headcount = (total_inicio + total_fim) / 2 if (total_inicio + total_fim) > 0 else 1
        taxa_voluntario = (demitidos / media_headcount * 100) if media_headcount else 0

        return {
            'periodo_inicio':   periodo_inicio.isoformat(),
            'periodo_fim':      periodo_fim.isoformat(),
            'headcount_inicio': total_inicio,
            'headcount_fim':    total_fim,
            'admitidos':        admitidos,
            'demitidos':        demitidos,
            'taxa_turnover':    round(taxa_voluntario, 2),
            'benchmark_mercado': 1.5,  # ~18% ao ano / 1.5% ao mês
            'status':           'critico' if taxa_voluntario > 3 else
                                'atencao' if taxa_voluntario > 1.5 else 'ok',
        }

    @staticmethod
    def turnover_por_departamento(referencia: str) -> list:
        """Retorna turnover de cada departamento em um mês."""
        from rh.models import Departamento
        ano, mes = int(referencia[:4]), int(referencia[5:7])
        inicio = date(ano, mes, 1)
        fim    = date(ano, mes + 1, 1) - timedelta(days=1) if mes < 12 else date(ano, 12, 31)

        resultado = []
        for dept in Departamento.objects.filter(ativo=True, deleted_at__isnull=True):
            dados = TurnoverService.calcular_taxa(inicio, fim, departamento_id=dept.id)
            dados['departamento'] = dept.nome
            dados['departamento_id'] = str(dept.id)
            resultado.append(dados)
        return sorted(resultado, key=lambda x: x['taxa_turnover'], reverse=True)

    @staticmethod
    def previsao_turnover_colaborador(colaborador) -> dict:
        """Calcula probabilidade de desligamento voluntário usando fatores ponderados."""
        fatores = []
        score   = Decimal('0')

        # Tempo de empresa (curto = maior risco)
        hoje = date.today()
        meses_empresa = (hoje - colaborador.data_admissao).days // 30
        if meses_empresa < 6:
            v, p = 25, 0.20
        elif meses_empresa < 18:
            v, p = 15, 0.20
        elif meses_empresa < 36:
            v, p = 5, 0.20
        else:
            v, p = 0, 0.20
        fatores.append({'fator': 'Tempo de empresa', 'valor': v, 'peso': p, 'contribuicao': v * p})
        score += Decimal(str(v * p))

        # Tempo sem promoção
        from rh.models import HistoricoSalarial
        ultima_promocao = HistoricoSalarial.objects.filter(
            colaborador=colaborador, tipo='promocao', deleted_at__isnull=True
        ).order_by('-data_referencia').first()
        meses_sem_prom = ((hoje - ultima_promocao.data_referencia).days // 30) if ultima_promocao else meses_empresa
        if meses_sem_prom > 24:
            v, p = 20, 0.15
        elif meses_sem_prom > 12:
            v, p = 10, 0.15
        else:
            v, p = 2, 0.15
        fatores.append({'fator': 'Meses sem promoção', 'valor': v, 'peso': p, 'contribuicao': v * p})
        score += Decimal(str(v * p))

        # Avaliações recentes (baixas = maior risco)
        from rh.models import AvaliacaoDesempenho
        ult_aval = AvaliacaoDesempenho.objects.filter(
            colaborador=colaborador, deleted_at__isnull=True
        ).order_by('-data_avaliacao').first()
        if ult_aval:
            nota = float(ult_aval.nota_geral or 0)
            v = max(0, (5 - nota) / 5 * 25)
        else:
            v = 15
        p = 0.25
        fatores.append({'fator': 'Avaliação de desempenho', 'valor': round(v, 1), 'peso': p, 'contribuicao': round(v * p, 2)})
        score += Decimal(str(round(v * p, 2)))

        # Advertências recentes
        from rh.models import Advertencia
        adv = Advertencia.objects.filter(
            colaborador=colaborador,
            data_advertencia__gte=hoje - timedelta(days=180),
            deleted_at__isnull=True,
        ).count()
        v, p = min(adv * 15, 30), 0.15
        fatores.append({'fator': 'Advertências (6 meses)', 'valor': v, 'peso': p, 'contribuicao': v * p})
        score += Decimal(str(v * p))

        # Absenteísmo recente
        from .models import SnapshotAbsenteismo
        ref_atual = hoje.strftime('%Y-%m')
        snap = SnapshotAbsenteismo.objects.filter(
            colaborador=colaborador, referencia=ref_atual
        ).first()
        taxa_abs = float(snap.taxa) if snap else 0
        v, p = min(taxa_abs * 3, 25), 0.10
        fatores.append({'fator': 'Taxa absenteísmo atual', 'valor': round(v, 1), 'peso': p, 'contribuicao': round(v * p, 2)})
        score += Decimal(str(round(v * p, 2)))

        # Score score final (0-100)
        prob = min(float(score), 100)

        acoes = []
        if prob >= 50:
            acoes += ['Conversa de retenção urgente com gestor', 'Plano de desenvolvimento personalizado']
        if meses_sem_prom > 18:
            acoes.append('Avaliar possibilidade de promoção ou reajuste salarial')
        if taxa_abs > 5:
            acoes.append('Investigar causas de absenteísmo — possível insatisfação')

        return {
            'probabilidade': round(prob, 2),
            'nivel_risco':   'critico' if prob >= 75 else 'alto' if prob >= 50 else 'medio' if prob >= 25 else 'baixo',
            'fatores':       fatores,
            'acoes_retencao': acoes,
        }


# ── Absenteísmo Service ───────────────────────────────────────
class AbsenteismoService:

    @staticmethod
    def calcular_taxa(faltas: int, dias_uteis: int = 22) -> Decimal:
        if dias_uteis == 0:
            return Decimal('0')
        return Decimal(str(faltas / dias_uteis * 100)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @staticmethod
    def benchmark() -> dict:
        return {
            'ideal':    1.5,
            'aceitavel':3.5,
            'critico':  5.0,
            'referencia': 'ABERJE / SHRM 2024',
        }

    @staticmethod
    def gerar_snapshot(colaborador_id: str, referencia: str, dias_falta: int,
                       justificados: int = 0, motivos: dict = None) -> 'SnapshotAbsenteismo':
        from .models import SnapshotAbsenteismo
        taxa = AbsenteismoService.calcular_taxa(dias_falta)
        snap, _ = SnapshotAbsenteismo.objects.update_or_create(
            colaborador_id=colaborador_id,
            referencia=referencia,
            defaults={
                'dias_falta':         dias_falta,
                'taxa':               taxa,
                'justificados':       justificados,
                'nao_justificados':   dias_falta - justificados,
                'motivos':            motivos or {},
            }
        )
        return snap

    @staticmethod
    def ranking_departamentos(referencia: str) -> list:
        from .models import SnapshotAbsenteismo
        from rh.models import Departamento
        resultado = []
        for dept in Departamento.objects.filter(ativo=True, deleted_at__isnull=True):
            snaps = SnapshotAbsenteismo.objects.filter(
                colaborador__departamento=dept,
                referencia=referencia,
            )
            if not snaps.exists():
                continue
            media = snaps.aggregate(m=Avg('taxa'))['m'] or 0
            resultado.append({
                'departamento': dept.nome,
                'media_taxa':   round(float(media), 2),
                'colaboradores': snaps.count(),
            })
        return sorted(resultado, key=lambda x: x['media_taxa'], reverse=True)


# ── Engajamento Service ───────────────────────────────────────
class EngajamentoService:
    """eNPS simplificado e análise de engajamento."""

    PESOS = {
        'avaliacao_nota':       0.30,
        'tempo_empresa_bonus':  0.10,
        'ausencias_penalidade': 0.20,
        'advertencias_penal':   0.20,
        'treinamentos_bonus':   0.10,
        'promocoes_bonus':      0.10,
    }

    @staticmethod
    def calcular_score(colaborador) -> dict:
        score = Decimal('60')  # base
        fatores = []
        hoje = date.today()

        # Avaliação
        from rh.models import AvaliacaoDesempenho
        ult = AvaliacaoDesempenho.objects.filter(
            colaborador=colaborador, deleted_at__isnull=True
        ).order_by('-data_avaliacao').first()
        if ult and ult.nota_geral:
            bonus = Decimal(str((float(ult.nota_geral) / 5) * 20 - 10))
            score += bonus
            fatores.append({'fator': 'Avaliação', 'impacto': float(bonus)})

        # Absenteísmo (penalidade)
        from .models import SnapshotAbsenteismo
        ref = hoje.strftime('%Y-%m')
        snap = SnapshotAbsenteismo.objects.filter(colaborador=colaborador, referencia=ref).first()
        if snap:
            pen = Decimal(str(min(float(snap.taxa) * 2, 20)))
            score -= pen
            fatores.append({'fator': 'Absenteísmo', 'impacto': float(-pen)})

        # Advertências
        from rh.models import Advertencia
        adv = Advertencia.objects.filter(
            colaborador=colaborador,
            data_advertencia__gte=hoje - timedelta(days=365),
            deleted_at__isnull=True,
        ).count()
        pen = Decimal(str(min(adv * 10, 30)))
        if pen:
            score -= pen
            fatores.append({'fator': 'Advertências', 'impacto': float(-pen)})

        # Tempo de empresa (longo = bonus de lealdade)
        meses = (hoje - colaborador.data_admissao).days // 30
        if meses > 36:
            score += Decimal('5')
            fatores.append({'fator': 'Lealdade (3+ anos)', 'impacto': 5.0})

        score = max(Decimal('0'), min(score, Decimal('100')))
        return {
            'score':    float(score),
            'nivel':    'excelente' if score >= 80 else 'bom' if score >= 65 else
                        'regular' if score >= 50 else 'critico',
            'fatores':  fatores,
        }

    @staticmethod
    def eNPS_organizacional(referencia: str) -> dict:
        """Calcula eNPS da organização no período."""
        from rh.models import Colaborador
        from .models import ScoreColaborador
        scores = ScoreColaborador.objects.filter(
            dimensao='engajamento', referencia=referencia
        ).values_list('score', flat=True)

        if not scores:
            return {'eNPS': None, 'promotores': 0, 'neutros': 0, 'detratores': 0}

        promotores  = sum(1 for s in scores if s >= 75)
        neutros     = sum(1 for s in scores if 50 <= s < 75)
        detratores  = sum(1 for s in scores if s < 50)
        total       = len(scores)
        enps        = round((promotores - detratores) / total * 100, 1) if total else 0

        return {
            'eNPS':       enps,
            'promotores': promotores,
            'neutros':    neutros,
            'detratores': detratores,
            'total':      total,
            'classificacao': 'excelente' if enps > 50 else 'bom' if enps > 0 else 'critico',
        }


# ── Risco Burnout Service ─────────────────────────────────────
class RiscoBurnoutService:
    """Detecta sinais precoces de burnout usando padrões comportamentais."""

    INDICADORES = {
        'absenteismo_crescente':   {'peso': 0.25, 'desc': 'Aumento de faltas nos últimos 3 meses'},
        'queda_avaliacao':         {'peso': 0.25, 'desc': 'Queda de mais de 20% na avaliação'},
        'sem_ferias_12m':          {'peso': 0.20, 'desc': 'Sem tirar férias há mais de 12 meses'},
        'horas_extras_excessivas': {'peso': 0.15, 'desc': 'Padrão de horas extras recorrentes'},
        'advertencias_reativas':   {'peso': 0.15, 'desc': 'Advertências por postura ou comportamento'},
    }

    @staticmethod
    def avaliar(colaborador) -> dict:
        score_risco = Decimal('0')
        indicadores_ativos = []
        hoje = date.today()

        # Absenteísmo crescente
        from .models import SnapshotAbsenteismo
        refs = [
            (hoje - timedelta(days=60)).strftime('%Y-%m'),
            (hoje - timedelta(days=30)).strftime('%Y-%m'),
            hoje.strftime('%Y-%m'),
        ]
        taxas = []
        for r in refs:
            s = SnapshotAbsenteismo.objects.filter(colaborador=colaborador, referencia=r).first()
            taxas.append(float(s.taxa) if s else 0)
        if len(taxas) == 3 and taxas[2] > taxas[0] * 1.5 and taxas[2] > 3:
            score_risco += Decimal('25')
            indicadores_ativos.append('absenteismo_crescente')

        # Queda na avaliação
        from rh.models import AvaliacaoDesempenho
        avals = list(AvaliacaoDesempenho.objects.filter(
            colaborador=colaborador, deleted_at__isnull=True
        ).order_by('-data_avaliacao')[:2])
        if len(avals) == 2 and avals[1].nota_geral and avals[0].nota_geral:
            queda = (float(avals[1].nota_geral) - float(avals[0].nota_geral)) / float(avals[1].nota_geral)
            if queda > 0.20:
                score_risco += Decimal('25')
                indicadores_ativos.append('queda_avaliacao')

        # Sem férias há 12+ meses
        from dp.models import Ferias
        tem_ferias_recentes = Ferias.objects.filter(
            colaborador=colaborador,
            data_inicio__gte=hoje - timedelta(days=365),
            status='aprovada',
            deleted_at__isnull=True,
        ).exists()
        if not tem_ferias_recentes:
            score_risco += Decimal('20')
            indicadores_ativos.append('sem_ferias_12m')

        # Advertências comportamentais
        from rh.models import Advertencia
        adv_comportamental = Advertencia.objects.filter(
            colaborador=colaborador,
            tipo__in=['verbal', 'escrita'],
            data_advertencia__gte=hoje - timedelta(days=180),
            deleted_at__isnull=True,
        ).count()
        if adv_comportamental >= 2:
            score_risco += Decimal('15')
            indicadores_ativos.append('advertencias_reativas')

        nivel = (
            'critico' if score_risco >= 60 else
            'alto'    if score_risco >= 40 else
            'medio'   if score_risco >= 20 else
            'baixo'
        )
        recomendacoes = []
        if 'sem_ferias_12m' in indicadores_ativos:
            recomendacoes.append('Programar férias imediatamente — colaborador está sem descanso há mais de 12 meses')
        if 'absenteismo_crescente' in indicadores_ativos:
            recomendacoes.append('Agendar conversa de escuta ativa com o gestor direto')
        if 'queda_avaliacao' in indicadores_ativos:
            recomendacoes.append('Verificar carga de trabalho e necessidade de suporte')
        if score_risco >= 60:
            recomendacoes.append('Encaminhar para apoio do RH e/ou programa de bem-estar')

        return {
            'score_risco':          float(score_risco),
            'nivel':                nivel,
            'indicadores_ativos':   indicadores_ativos,
            'recomendacoes':        recomendacoes,
            'colaborador':          str(colaborador.id),
        }


# ── Risco Desligamento Service ────────────────────────────────
class RiscoDesligamentoService:
    """Combina risco de burnout + risco de turnover voluntário."""

    @staticmethod
    def calcular(colaborador) -> dict:
        burnout   = RiscoBurnoutService.avaliar(colaborador)
        turnover  = TurnoverService.previsao_turnover_colaborador(colaborador)

        score_combinado = (burnout['score_risco'] * 0.4 + turnover['probabilidade'] * 0.6)
        nivel = (
            'critico' if score_combinado >= 65 else
            'alto'    if score_combinado >= 45 else
            'medio'   if score_combinado >= 25 else
            'baixo'
        )
        return {
            'score_combinado':   round(score_combinado, 2),
            'nivel':             nivel,
            'risco_burnout':     burnout,
            'risco_turnover':    turnover,
            'acao_urgente':      score_combinado >= 65,
            'recomendacoes':     list(set(burnout['recomendacoes'] + turnover['acoes_retencao'])),
        }

    @staticmethod
    def top_riscos(limite: int = 10, nivel: str = None) -> list:
        """Retorna lista dos colaboradores com maior risco."""
        from rh.models import Colaborador
        colaboradores = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True)
        resultados = []
        for c in colaboradores:
            r = RiscoDesligamentoService.calcular(c)
            if nivel and r['nivel'] != nivel:
                continue
            resultados.append({
                'colaborador_id':   str(c.id),
                'colaborador_nome': c.nome,
                'departamento':     c.departamento.nome if c.departamento else '—',
                **r,
            })
        return sorted(resultados, key=lambda x: x['score_combinado'], reverse=True)[:limite]


# ── Justiça Corporativa Service ───────────────────────────────
class JusticaCorporativaService:
    """Detecta desigualdades salariais e de crescimento dentro da organização."""

    @staticmethod
    def analise_salarial_cargo(cargo_id: str) -> dict:
        from rh.models import Colaborador
        colab = Colaborador.objects.filter(
            cargo_id=cargo_id, status='ativo', deleted_at__isnull=True
        ).values('id', 'nome', 'salario_base', 'genero', 'data_admissao')

        salarios = [float(c['salario_base']) for c in colab if c['salario_base']]
        if not salarios:
            return {'erro': 'Sem dados suficientes'}

        media   = sum(salarios) / len(salarios)
        minimo  = min(salarios)
        maximo  = max(salarios)
        variacao = ((maximo - minimo) / media * 100) if media else 0

        # Brecha de gênero simplificada
        masc = [float(c['salario_base']) for c in colab if c.get('genero') == 'M' and c['salario_base']]
        fem  = [float(c['salario_base']) for c in colab if c.get('genero') == 'F' and c['salario_base']]
        brecha_genero = None
        if masc and fem:
            med_m = sum(masc) / len(masc)
            med_f = sum(fem)  / len(fem)
            brecha_genero = round((med_m - med_f) / med_m * 100, 2) if med_m else 0

        alertas = []
        if variacao > 30:
            alertas.append(f'Variação salarial alta ({variacao:.1f}%) — revisar equidade interna')
        if brecha_genero and abs(brecha_genero) > 15:
            alertas.append(f'Brecha de gênero de {brecha_genero:.1f}% detectada no cargo')

        return {
            'cargo_id':      str(cargo_id),
            'total_colab':   len(salarios),
            'media_salarial': round(media, 2),
            'minimo':        round(minimo, 2),
            'maximo':        round(maximo, 2),
            'variacao_pct':  round(variacao, 2),
            'brecha_genero': brecha_genero,
            'alertas':       alertas,
        }

    @staticmethod
    def ranking_equidade_departamentos() -> list:
        from rh.models import Departamento
        resultado = []
        for dept in Departamento.objects.filter(ativo=True, deleted_at__isnull=True):
            colab = dept.colaboradores.filter(status='ativo', deleted_at__isnull=True)
            sals  = [float(c.salario_base) for c in colab if c.salario_base]
            if len(sals) < 2:
                continue
            media = sum(sals) / len(sals)
            var   = max(sals) - min(sals)
            score_equidade = max(0, 100 - (var / media * 50)) if media else 50
            resultado.append({
                'departamento':      dept.nome,
                'score_equidade':    round(score_equidade, 1),
                'media_salarial':    round(media, 2),
                'variacao_absoluta': round(var, 2),
                'headcount':         len(sals),
            })
        return sorted(resultado, key=lambda x: x['score_equidade'])


# ── Score Geral (Orquestrador) ────────────────────────────────
class ScoreOrganizacionalService:
    """Calcula e persiste scores de colaborador e setor."""

    @staticmethod
    def calcular_e_salvar_colaborador(colaborador, referencia: str) -> list:
        from .models import ScoreColaborador
        resultados = []

        # Engajamento
        eng = EngajamentoService.calcular_score(colaborador)
        obj, _ = ScoreColaborador.objects.update_or_create(
            colaborador=colaborador, dimensao='engajamento', referencia=referencia,
            defaults={'score': eng['score'], 'fatores': {'detalhes': eng['fatores']}, 'calculado_por_ia': True},
        )
        resultados.append(obj)

        # Risco saída
        turn = TurnoverService.previsao_turnover_colaborador(colaborador)
        ScoreColaborador.objects.update_or_create(
            colaborador=colaborador, dimensao='risco_saida', referencia=referencia,
            defaults={'score': turn['probabilidade'], 'fatores': {'fatores': turn['fatores']}, 'calculado_por_ia': True},
        )

        # Score geral = média ponderada
        score_geral = (eng['score'] * 0.5 + (100 - turn['probabilidade']) * 0.5)
        ScoreColaborador.objects.update_or_create(
            colaborador=colaborador, dimensao='geral', referencia=referencia,
            defaults={'score': round(score_geral, 2), 'calculado_por_ia': True},
        )
        return resultados

    @staticmethod
    def calcular_setor(departamento, referencia: str):
        from .models import ScoreSetor, ScoreColaborador, SnapshotAbsenteismo
        colab_ids = list(departamento.colaboradores.filter(
            status='ativo', deleted_at__isnull=True
        ).values_list('id', flat=True))

        def _media(dimensao):
            r = ScoreColaborador.objects.filter(
                colaborador_id__in=colab_ids, dimensao=dimensao, referencia=referencia
            ).aggregate(m=Avg('score'))
            return float(r['m'] or 0)

        score_eng  = _media('engajamento')
        score_risco= _media('risco_saida')
        score_geral= _media('geral')

        abs_media = SnapshotAbsenteismo.objects.filter(
            colaborador_id__in=colab_ids, referencia=referencia
        ).aggregate(m=Avg('taxa'))['m'] or 0

        ScoreSetor.objects.update_or_create(
            departamento=departamento, referencia=referencia,
            defaults={
                'score_geral':          round(score_geral, 2),
                'score_engajamento':    round(score_eng, 2),
                'score_retencao':       round(100 - score_risco, 2),
                'headcount':            len(colab_ids),
                'absenteismo_periodo':  round(float(abs_media), 2),
            }
        )

    @staticmethod
    def rodar_analise_completa(referencia: str):
        """Executa análise para todos os colaboradores e setores. Chamar via Celery."""
        from rh.models import Colaborador, Departamento
        from .models import AlertaInteligente, PrevisaoTurnover

        for colab in Colaborador.objects.filter(status='ativo', deleted_at__isnull=True):
            ScoreOrganizacionalService.calcular_e_salvar_colaborador(colab, referencia)

            # Previsão de turnover
            turn = TurnoverService.previsao_turnover_colaborador(colab)
            PrevisaoTurnover.objects.update_or_create(
                colaborador=colab, horizonte='90d', referencia=referencia,
                defaults={
                    'probabilidade':   turn['probabilidade'],
                    'fatores_risco':   turn['fatores'],
                    'acoes_retencao':  turn['acoes_retencao'],
                }
            )

            # Alertas automáticos
            if turn['probabilidade'] >= 50:
                AlertaInteligente.objects.get_or_create(
                    tipo='saida', colaborador=colab,
                    status='ativo',
                    defaults={
                        'prioridade': 'critica' if turn['probabilidade'] >= 75 else 'alta',
                        'titulo':     f'Risco de saída: {colab.nome}',
                        'descricao':  f'Probabilidade de desligamento voluntário: {turn["probabilidade"]}%',
                        'recomendacao': '\n'.join(turn['acoes_retencao']),
                        'confianca':  85,
                    }
                )

        for dept in Departamento.objects.filter(ativo=True, deleted_at__isnull=True):
            ScoreOrganizacionalService.calcular_setor(dept, referencia)
