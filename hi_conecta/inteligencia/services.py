"""
inteligencia/services.py — Serviços de IA Organizacional.
DNA Corporativo, Modo Fantasma, RH Temporal Preditivo, IA Executiva Conselheira, Simulador de Futuro.
"""
import time
import json
from decimal import Decimal
from datetime import date, timedelta
from django.conf import settings
from django.utils import timezone


# ── DNA Corporativo Service ───────────────────────────────────
class DNACorporativoService:

    @staticmethod
    def calcular(referencia: str = None) -> 'DNACorporativo':
        from .models import DNACorporativo
        from rh.models import Colaborador, Departamento
        from analytics.models import ScoreColaborador, SnapshotAbsenteismo
        from analytics.services import EngajamentoService, RiscoBurnoutService
        from django.db.models import Avg

        if not referencia:
            referencia = date.today().strftime('%Y-%m')

        dna, _ = DNACorporativo.objects.get_or_create(referencia=referencia)
        colab_ativos = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True)
        total = colab_ativos.count() or 1

        # Dimensão 1: Cultura (proxy via engajamento médio)
        eng_medio = ScoreColaborador.objects.filter(
            dimensao='engajamento', referencia=referencia
        ).aggregate(m=Avg('score'))['m'] or 50
        dna.cultura_score = round(float(eng_medio), 2)

        # Dimensão 2: Liderança (gestores com equipes grandes)
        from rh.models import Cargo
        gestores = colab_ativos.filter(cargo__nivel__in=['gerencia', 'diretoria', 'supervisao']).count()
        dna.lideranca_score = min(100, round(gestores / total * 500, 2))
        dna.lideranca_cobertura = round(gestores / total * 100, 2)

        # Dimensão 3: Aprendizado (placeholder — integrar com treinamento)
        dna.aprendizado_score = 60  # base
        dna.horas_treinamento_media = Decimal('8.0')

        # Dimensão 4: Inovação (placeholder)
        dna.inovacao_score = 55

        # Dimensão 5: Bem-estar (burnout)
        risco_count = 0
        for c in colab_ativos:
            r = RiscoBurnoutService.avaliar(c)
            if r['nivel'] in ('alto', 'critico'):
                risco_count += 1
        taxa_risco = risco_count / total * 100
        dna.bem_estar_score = max(0, round(100 - taxa_risco * 2, 2))
        dna.colaboradores_risco_burnout = risco_count

        # Dimensão 6: Resultados (via score geral)
        score_geral = ScoreColaborador.objects.filter(
            dimensao='geral', referencia=referencia
        ).aggregate(m=Avg('score'))['m'] or 60
        dna.resultados_score = round(float(score_geral), 2)

        dna.calcular_score_dna()

        # Narrativa e recomendações
        narrativa, recs = DNACorporativoService._gerar_narrativa(dna)
        dna.narrativa_ia = narrativa
        dna.recomendacoes_estrategicas = recs
        dna.save()
        return dna

    @staticmethod
    def _gerar_narrativa(dna) -> tuple:
        scores = {
            'Cultura':     float(dna.cultura_score),
            'Liderança':   float(dna.lideranca_score),
            'Aprendizado': float(dna.aprendizado_score),
            'Inovação':    float(dna.inovacao_score),
            'Bem-estar':   float(dna.bem_estar_score),
            'Resultados':  float(dna.resultados_score),
        }
        pontos_fortes = [k for k, v in scores.items() if v >= 70]
        pontos_fracos = [k for k, v in scores.items() if v < 50]
        score = float(dna.score_dna)

        nivel = 'Excelente' if score >= 80 else 'Bom' if score >= 65 else 'Em desenvolvimento' if score >= 50 else 'Crítico'
        narrativa = (
            f"O DNA Corporativo da organização está em nível {nivel} (Score {score:.0f}/100). "
        )
        if pontos_fortes:
            narrativa += f"Os pilares mais sólidos são: {', '.join(pontos_fortes)}. "
        if pontos_fracos:
            narrativa += f"As dimensões que requerem atenção prioritária são: {', '.join(pontos_fracos)}. "

        recomendacoes = []
        if scores['Bem-estar'] < 60:
            recomendacoes.append('Implementar programa de bem-estar e saúde mental para reduzir risco de burnout')
        if scores['Liderança'] < 50:
            recomendacoes.append('Investir em programa de desenvolvimento de liderança em todos os níveis')
        if scores['Aprendizado'] < 60:
            recomendacoes.append('Ampliar oferta de treinamentos e criar trilhas de aprendizado estruturadas')
        if scores['Cultura'] < 60:
            recomendacoes.append('Realizar pesquisa de clima e trabalhar plano de ação de engajamento')
        return narrativa, recomendacoes


# ── Modo Fantasma Service ─────────────────────────────────────
class ModoFantasmaService:
    """Detecta padrões organizacionais latentes."""

    @staticmethod
    def detectar(referencia: str = None) -> list:
        from .models import ModoFantasma
        from rh.models import Colaborador, Departamento
        from analytics.models import ScoreColaborador, AlertaInteligente
        from django.db.models import Avg, Count

        if not referencia:
            referencia = date.today().strftime('%Y-%m')

        insights_criados = []

        # Detectar silos: departamentos com score de colaboração muito diferente da média
        dept_scores = ScoreColaborador.objects.filter(
            dimensao='engajamento', referencia=referencia
        ).values('colaborador__departamento__nome').annotate(media=Avg('score'))

        media_geral = ScoreColaborador.objects.filter(
            dimensao='engajamento', referencia=referencia
        ).aggregate(m=Avg('score'))['m'] or 60

        for ds in dept_scores:
            if ds['media'] and float(ds['media']) < float(media_geral) * 0.7:
                dept_nome = ds['colaborador__departamento__nome'] or 'Sem departamento'
                insight, created = ModoFantasma.objects.get_or_create(
                    tipo='silo',
                    referencia=referencia,
                    titulo=f'Silo detectado: {dept_nome}',
                    defaults={
                        'descricao': (
                            f'O departamento {dept_nome} apresenta score de engajamento '
                            f'{float(ds["media"]):.0f} — significativamente abaixo da média '
                            f'organizacional de {float(media_geral):.0f}.'
                        ),
                        'impacto': 'alto',
                        'confianca': 75,
                        'recomendacao': (
                            f'Agendar dinâmica de integração para {dept_nome} e investigar '
                            'causas raízes do baixo engajamento com o gestor responsável.'
                        ),
                    }
                )
                if created:
                    insights_criados.append(insight)

        # Detectar talentos ocultos: alto score geral mas sem promoção recente
        from rh.models import HistoricoSalarial
        hoje = date.today()
        high_scores = ScoreColaborador.objects.filter(
            dimensao='geral', referencia=referencia, score__gte=80
        ).select_related('colaborador')

        for sc in high_scores:
            colab = sc.colaborador
            ultima_prom = HistoricoSalarial.objects.filter(
                colaborador=colab, tipo='promocao', deleted_at__isnull=True
            ).order_by('-data_referencia').first()
            sem_prom = not ultima_prom or (hoje - ultima_prom.data_referencia).days > 730
            if sem_prom:
                insight, created = ModoFantasma.objects.get_or_create(
                    tipo='talento_oculto',
                    referencia=referencia,
                    titulo=f'Talento oculto: {colab.nome}',
                    defaults={
                        'descricao': (
                            f'{colab.nome} possui score de desempenho {float(sc.score):.0f}/100 '
                            'mas não teve promoção nos últimos 24 meses.'
                        ),
                        'impacto': 'medio',
                        'confianca': 80,
                        'recomendacao': (
                            f'Avaliar {colab.nome} para promoção ou reajuste salarial. '
                            'Risco de perda deste talento é alto.'
                        ),
                    }
                )
                if created:
                    insights_criados.append(insight)

        return insights_criados


# ── RH Temporal Preditivo Service ────────────────────────────
class RHTemporalService:
    """Projeções temporais com tendência linear simples."""

    @staticmethod
    def projetar(metrica_tipo: str, valor_atual: float, historico: list,
                 horizonte_meses: int = 3, departamento=None) -> 'PrevisaoRHTemporal':
        from .models import PrevisaoRHTemporal
        from datetime import datetime

        referencia_base = date.today().strftime('%Y-%m')

        # Tendência linear por regressão mínima dos quadrados
        n = len(historico)
        if n >= 2:
            x_vals = list(range(n))
            x_mean = sum(x_vals) / n
            y_mean = sum(historico) / n
            num = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, historico))
            den = sum((x - x_mean) ** 2 for x in x_vals)
            slope = num / den if den != 0 else 0
        else:
            slope = 0

        # Gerar projeções
        hoje = date.today()
        mes_atual = hoje.month
        ano_atual = hoje.year
        projecoes = []
        for i in range(1, horizonte_meses + 1):
            mes = (mes_atual + i - 1) % 12 + 1
            ano = ano_atual + (mes_atual + i - 1) // 12
            valor_previsto = valor_atual + slope * i
            margem = abs(valor_previsto * 0.10)  # ±10%
            projecoes.append({
                'mes':             f'{ano:04d}-{mes:02d}',
                'valor_previsto':  round(valor_previsto, 2),
                'intervalo_min':   round(max(0, valor_previsto - margem), 2),
                'intervalo_max':   round(valor_previsto + margem, 2),
                'confianca':       85 if n >= 6 else 65,
            })

        narrativa = RHTemporalService._narrar(metrica_tipo, valor_atual, slope, horizonte_meses)

        obj, _ = PrevisaoRHTemporal.objects.update_or_create(
            metrica_tipo=metrica_tipo,
            referencia_base=referencia_base,
            horizonte_meses=horizonte_meses,
            departamento=departamento,
            defaults={
                'valor_atual':  Decimal(str(round(valor_atual, 4))),
                'projecoes':    projecoes,
                'metodologia':  'tendencia_linear',
                'narrativa':    narrativa,
                'premissas':    [
                    'Sem mudanças abruptas de mercado',
                    'Manutenção das políticas atuais de RH',
                    f'Baseado em {n} períodos históricos',
                ],
            }
        )
        return obj

    @staticmethod
    def _narrar(tipo: str, valor_atual: float, slope: float, meses: int) -> str:
        labels = {
            'headcount':    'headcount', 'turnover': 'taxa de turnover',
            'folha_custo':  'custo de folha', 'engajamento': 'engajamento',
            'absenteismo':  'absenteísmo', 'produtividade': 'produtividade',
        }
        label = labels.get(tipo, tipo)
        tendencia = 'crescente' if slope > 0 else 'decrescente' if slope < 0 else 'estável'
        return (
            f'Com base na tendência histórica, o {label} atual de {valor_atual:.2f} '
            f'apresenta comportamento {tendencia} nos próximos {meses} meses. '
            f'A variação média esperada por mês é de {abs(slope):.2f} pontos.'
        )


# ── IA Executiva Conselheira ──────────────────────────────────
class IAExecutivaService:
    """Interface com OpenAI ou Anthropic para consultas estratégicas de RH."""

    SYSTEM_PROMPT = """Você é a IA Executiva Conselheira do sistema hi Conecta RH.
Você é especialista em Recursos Humanos, Gestão de Pessoas, Psicologia Organizacional,
CLT brasileira 2024/2025 e People Analytics.

Responda sempre em português brasileiro, de forma consultiva, objetiva e estratégica.
Quando o contexto de dados organizacionais for fornecido, incorpore-os na sua análise.
Forneça recomendações práticas e acionáveis. Seja direto e evite respostas genéricas.
Identifique riscos e oportunidades com base nos dados apresentados."""

    @staticmethod
    def consultar(pergunta: str, contexto: dict, usuario, categoria: str = 'geral') -> 'ConsultaIAExecutiva':
        from .models import ConsultaIAExecutiva
        inicio = time.time()

        provedor = getattr(settings, 'IA_PROVEDOR', 'anthropic').lower()
        resposta, modelo, tokens = '', '', 0

        contexto_texto = json.dumps(contexto, ensure_ascii=False, indent=2, default=str) if contexto else ''
        prompt_completo = f"""Contexto organizacional atual:
{contexto_texto}

Pergunta do gestor de RH:
{pergunta}"""

        try:
            if provedor == 'openai':
                resposta, modelo, tokens = IAExecutivaService._consultar_openai(prompt_completo)
            else:
                resposta, modelo, tokens = IAExecutivaService._consultar_anthropic(prompt_completo)
        except Exception as e:
            resposta = IAExecutivaService._resposta_fallback(pergunta, contexto)
            modelo   = 'fallback_local'

        tempo_ms = int((time.time() - inicio) * 1000)

        consulta = ConsultaIAExecutiva.objects.create(
            usuario=usuario,
            categoria=categoria,
            pergunta=pergunta,
            contexto_json=contexto,
            resposta=resposta,
            provedor=provedor,
            modelo_usado=modelo,
            tokens_usados=tokens,
            tempo_resposta_ms=tempo_ms,
        )
        return consulta

    @staticmethod
    def _consultar_anthropic(prompt: str) -> tuple:
        import anthropic
        api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
        if not api_key:
            raise ValueError('ANTHROPIC_API_KEY não configurada')

        client  = anthropic.Anthropic(api_key=api_key)
        modelo  = getattr(settings, 'ANTHROPIC_MODEL', 'claude-opus-4-7')
        message = client.messages.create(
            model=modelo,
            max_tokens=2048,
            system=IAExecutivaService.SYSTEM_PROMPT,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return message.content[0].text, modelo, message.usage.input_tokens + message.usage.output_tokens

    @staticmethod
    def _consultar_openai(prompt: str) -> tuple:
        import openai
        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if not api_key:
            raise ValueError('OPENAI_API_KEY não configurada')

        openai.api_key = api_key
        modelo = getattr(settings, 'OPENAI_MODEL', 'gpt-4o')
        resp   = openai.chat.completions.create(
            model=modelo,
            messages=[
                {'role': 'system', 'content': IAExecutivaService.SYSTEM_PROMPT},
                {'role': 'user',   'content': prompt},
            ],
            max_tokens=2048,
        )
        tokens = resp.usage.total_tokens
        return resp.choices[0].message.content, modelo, tokens

    @staticmethod
    def _resposta_fallback(pergunta: str, contexto: dict) -> str:
        """Resposta local quando a IA externa não está disponível."""
        return (
            "⚠️ A IA Executiva está temporariamente indisponível (API não configurada ou fora do ar).\n\n"
            "**Análise baseada nos dados fornecidos:**\n\n"
            f"Com base nos dados organizacionais disponíveis, recomendo:\n\n"
            "1. Revisar os KPIs com maior desvio em relação à meta\n"
            "2. Priorizar ações nos setores com maior risco de turnover\n"
            "3. Agendar reunião com gestores das áreas críticas\n\n"
            "_Configure ANTHROPIC_API_KEY ou OPENAI_API_KEY no .env para ativar a IA completa._"
        )

    @staticmethod
    def contexto_organizacional() -> dict:
        """Monta contexto rico para enviar à IA."""
        from analytics.models import ScoreColaborador, AlertaInteligente, PrevisaoTurnover
        from rh.models import Colaborador
        from django.db.models import Avg
        from datetime import date

        ref = date.today().strftime('%Y-%m')
        total = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).count()

        return {
            'referencia':           ref,
            'total_colaboradores':  total,
            'score_engajamento':    float(ScoreColaborador.objects.filter(
                dimensao='engajamento', referencia=ref
            ).aggregate(m=Avg('score'))['m'] or 0),
            'score_geral':          float(ScoreColaborador.objects.filter(
                dimensao='geral', referencia=ref
            ).aggregate(m=Avg('score'))['m'] or 0),
            'alertas_criticos':     AlertaInteligente.objects.filter(
                status='ativo', prioridade='critica', deleted_at__isnull=True
            ).count(),
            'risco_saida_critico':  PrevisaoTurnover.objects.filter(
                nivel_risco='critico', referencia=ref
            ).count(),
        }


# ── Simulador de Futuro Corporativo ──────────────────────────
class SimuladorFuturoService:

    CENARIOS = {
        'expansao': {
            'label': 'Expansão de Headcount',
            'params': ['novas_vagas', 'salario_medio_novo', 'custo_recrutamento_por_vaga'],
        },
        'reducao': {
            'label': 'Redução de Headcount',
            'params': ['vagas_eliminadas', 'salario_medio_eliminado', 'custo_rescisao_medio'],
        },
        'reajuste_salarial': {
            'label': 'Reajuste Salarial',
            'params': ['percentual_reajuste', 'colaboradores_afetados'],
        },
        'plr': {
            'label': 'Programa de PLR',
            'params': ['valor_medio_plr', 'colaboradores_elegíveis', 'meta_engajamento_delta'],
        },
        'home_office': {
            'label': 'Implementar Home Office',
            'params': ['percentual_home', 'economia_infraestrutura_mes', 'impacto_engajamento_delta'],
        },
    }

    @staticmethod
    def simular(cenario: str, parametros: dict, usuario) -> 'SimulacaoFuturoCorporativo':
        from .models import SimulacaoFuturoCorporativo

        resultado = SimuladorFuturoService._calcular(cenario, parametros)
        narrativa = SimuladorFuturoService._narrar_cenario(cenario, parametros, resultado)

        sim = SimulacaoFuturoCorporativo.objects.create(
            usuario=usuario,
            cenario=cenario,
            nome=parametros.get('nome', f'Simulação {cenario}'),
            descricao=parametros.get('descricao', ''),
            parametros=parametros,
            resultado=resultado,
            impacto_financeiro=resultado.get('impacto_financeiro_anual'),
            impacto_engajamento_delta=resultado.get('delta_engajamento'),
            impacto_turnover_delta=resultado.get('delta_turnover'),
            narrativa_ia=narrativa,
            recomendacao=resultado.get('recomendacao', ''),
        )
        return sim

    @staticmethod
    def _calcular(cenario: str, p: dict) -> dict:
        if cenario == 'expansao':
            vagas    = int(p.get('novas_vagas', 0))
            sal_novo = float(p.get('salario_medio_novo', 3000))
            custo_rec= float(p.get('custo_recrutamento_por_vaga', 2000))
            custo_ano = vagas * sal_novo * 13.5 + vagas * custo_rec  # 13.5 = encargos ~35%
            return {
                'novas_vagas':              vagas,
                'custo_recrutamento_total': vagas * custo_rec,
                'custo_folha_adicional_anual': vagas * sal_novo * 12,
                'encargos_estimados':       vagas * sal_novo * 12 * 0.35,
                'impacto_financeiro_anual': round(-custo_ano, 2),
                'delta_engajamento':        2.5,   # leve aumento pela renovação
                'delta_turnover':           0.5,   # pequeno aumento pela adaptação
                'recomendacao': f'Expansão de {vagas} vagas com custo total estimado de R$ {custo_ano:,.0f}/ano.',
            }

        elif cenario == 'reducao':
            vagas    = int(p.get('vagas_eliminadas', 0))
            sal_medio= float(p.get('salario_medio_eliminado', 3000))
            custo_res= float(p.get('custo_rescisao_medio', 5000))
            economia_anual = vagas * sal_medio * 13.5
            return {
                'vagas_eliminadas':         vagas,
                'economia_anual':           round(economia_anual, 2),
                'custo_rescisao_total':     vagas * custo_res,
                'impacto_financeiro_anual': round(economia_anual - vagas * custo_res, 2),
                'delta_engajamento':        -15.0,  # impacto negativo no clima
                'delta_turnover':           3.0,    # aumento por insegurança
                'recomendacao': (
                    f'Redução de {vagas} colaboradores gera economia de R$ {economia_anual:,.0f}/ano '
                    f'mas pode causar queda significativa no engajamento. '
                    'Considere comunicação transparente e suporte de outplacement.'
                ),
            }

        elif cenario == 'reajuste_salarial':
            pct     = float(p.get('percentual_reajuste', 5)) / 100
            afetados= int(p.get('colaboradores_afetados', 0))
            from rh.models import Colaborador
            if not afetados:
                afetados = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).count()
            from django.db.models import Avg
            sal_medio = float(Colaborador.objects.filter(
                status='ativo', deleted_at__isnull=True
            ).aggregate(m=Avg('salario_base'))['m'] or 3000)
            custo_adicional = afetados * sal_medio * pct * 13.5
            return {
                'colaboradores_afetados': afetados,
                'percentual':             pct * 100,
                'custo_adicional_anual':  round(custo_adicional, 2),
                'impacto_financeiro_anual': round(-custo_adicional, 2),
                'delta_engajamento':        pct * 30,   # cada 1% de reajuste ≈ +0.3 engajamento
                'delta_turnover':           -(pct * 20), # reduz rotatividade
                'recomendacao': (
                    f'Reajuste de {pct*100:.1f}% para {afetados} colaboradores tem impacto anual '
                    f'de R$ {custo_adicional:,.0f} e deve melhorar engajamento em '
                    f'+{pct*30:.1f} pontos com redução de {pct*20:.1f}% no turnover.'
                ),
            }

        elif cenario == 'plr':
            valor    = float(p.get('valor_medio_plr', 2000))
            elig     = int(p.get('colaboradores_elegíveis', 0))
            from rh.models import Colaborador
            if not elig:
                elig = Colaborador.objects.filter(status='ativo', deleted_at__isnull=True).count()
            custo_total = elig * valor
            return {
                'colaboradores_elegiveis': elig,
                'valor_medio':            valor,
                'custo_total':            round(custo_total, 2),
                'impacto_financeiro_anual': round(-custo_total, 2),
                'delta_engajamento':        8.0,
                'delta_turnover':           -2.0,
                'recomendacao': (
                    f'PLR de R$ {valor:,.0f} por colaborador para {elig} elegíveis custa '
                    f'R$ {custo_total:,.0f} e deve elevar engajamento em +8 pontos.'
                ),
            }

        else:  # personalizado / não mapeado
            return {
                'impacto_financeiro_anual': 0,
                'delta_engajamento':        0,
                'delta_turnover':           0,
                'recomendacao': 'Cenário personalizado — preencha os resultados manualmente.',
            }

    @staticmethod
    def _narrar_cenario(cenario: str, params: dict, resultado: dict) -> str:
        labels = SimuladorFuturoService.CENARIOS.get(cenario, {}).get('label', cenario)
        fin    = resultado.get('impacto_financeiro_anual', 0)
        eng    = resultado.get('delta_engajamento', 0)
        turn   = resultado.get('delta_turnover', 0)

        narrativa = f"**Simulação: {labels}**\n\n"
        narrativa += f"Impacto financeiro anual estimado: R$ {fin:,.0f}\n"
        narrativa += f"Impacto no engajamento: {'+' if eng >= 0 else ''}{eng:.1f} pontos\n"
        narrativa += f"Impacto no turnover: {'+' if turn >= 0 else ''}{turn:.1f}%\n\n"
        narrativa += resultado.get('recomendacao', '')
        return narrativa
