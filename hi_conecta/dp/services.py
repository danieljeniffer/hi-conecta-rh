"""
dp/services.py — Cálculos trabalhistas CLT 2024/2025.
INSS progressivo, IRRF, FGTS, Férias, 13º, Rescisão, Simulação.
"""
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
import math
import logging

logger = logging.getLogger('core')

# ── Constantes 2024/2025 ─────────────────────────────────────
TABELA_INSS = [
    (Decimal('1412.00'),  Decimal('0.075')),
    (Decimal('2666.68'),  Decimal('0.09')),
    (Decimal('4000.03'),  Decimal('0.12')),
    (Decimal('7786.02'),  Decimal('0.14')),
]
TETO_INSS          = Decimal('908.85')
DEDUCAO_DEPENDENTE = Decimal('189.59')
SALARIO_MINIMO     = Decimal('1412.00')
ALIQ_FGTS          = Decimal('0.08')

TABELA_IRRF = [
    (Decimal('2259.20'),  Decimal('0'),     Decimal('0')),
    (Decimal('2826.65'),  Decimal('0.075'), Decimal('169.44')),
    (Decimal('3751.05'),  Decimal('0.15'),  Decimal('381.44')),
    (Decimal('4664.68'),  Decimal('0.225'), Decimal('662.77')),
    (Decimal('99999.99'), Decimal('0.275'), Decimal('896.00')),
]


def _d(v):
    """Converte para Decimal."""
    return Decimal(str(v or 0))


def _r2(v):
    """Arredonda para 2 casas decimais."""
    return Decimal(str(v)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _meses_entre(d_inicio: date, d_fim: date) -> int:
    return (d_fim.year - d_inicio.year) * 12 + (d_fim.month - d_inicio.month)


# ─────────────────────────────────────────────────────────────
# CLTService — cálculos base
# ─────────────────────────────────────────────────────────────
class CLTService:

    @staticmethod
    def calcular_inss(salario_bruto) -> Decimal:
        """INSS progressivo tabela 2024."""
        sal   = _d(salario_bruto)
        if sal <= 0:
            return Decimal('0.00')
        desc  = Decimal('0.00')
        base  = sal
        for teto, aliq in TABELA_INSS:
            if base <= 0:
                break
            faixa = min(base, teto)
            desc += faixa * aliq
            base -= faixa
        return _r2(min(desc, TETO_INSS))

    @staticmethod
    def calcular_irrf(salario_bruto, dependentes: int = 0, inss: Decimal = None) -> Decimal:
        """IRRF progressivo 2024 com dedução de dependentes e INSS."""
        sal   = _d(salario_bruto)
        if inss is None:
            inss = CLTService.calcular_inss(sal)
        base = sal - inss - (DEDUCAO_DEPENDENTE * Decimal(str(dependentes)))
        if base <= 0:
            return Decimal('0.00')
        for limite, aliq, ded in TABELA_IRRF:
            if base <= limite:
                irrf = base * aliq - ded
                return _r2(max(Decimal('0.00'), irrf))
        return Decimal('0.00')

    @staticmethod
    def calcular_fgts(salario_bruto) -> Decimal:
        return _r2(_d(salario_bruto) * ALIQ_FGTS)

    @staticmethod
    def calcular_liquido(salario_bruto, dependentes: int = 0) -> dict:
        sal    = _d(salario_bruto)
        inss   = CLTService.calcular_inss(sal)
        irrf   = CLTService.calcular_irrf(sal, dependentes, inss)
        fgts   = CLTService.calcular_fgts(sal)
        liquido = _r2(sal - inss - irrf)
        return {
            'bruto':   sal,
            'inss':    inss,
            'irrf':    irrf,
            'fgts':    fgts,
            'liquido': liquido,
            'inss_pct': _r2(inss / sal * 100) if sal > 0 else Decimal('0'),
            'irrf_pct': _r2(irrf / sal * 100) if sal > 0 else Decimal('0'),
        }

    @staticmethod
    def calcular_aviso_previo(data_admissao: date, data_demissao: date) -> dict:
        """Lei 12.506/2011: 30 dias + 3 dias por ano trabalhado (máx. 90)."""
        meses = _meses_entre(data_admissao, data_demissao)
        anos  = meses // 12
        dias  = min(30 + anos * 3, 90)
        return {'dias': dias, 'anos': anos, 'meses': meses}


# ─────────────────────────────────────────────────────────────
# FolhaService
# ─────────────────────────────────────────────────────────────
class FolhaService:

    @staticmethod
    def calcular_item(colaborador, competencia: str, dias_trabalhados=30,
                      faltas=0, he_50=0, he_100=0,
                      outros_proventos=0, plano_saude=0) -> dict:
        """Calcula folha de um colaborador para a competência."""
        sal   = _d(colaborador.salario_base)
        dep   = colaborador.dependentes.filter(ir=True).count()
        ch    = colaborador.carga_horaria or 220

        # Saldo de salário (proporcional por faltas)
        saldo = _r2(sal - (sal / 30 * _d(faltas))) if faltas > 0 else sal

        # Horas extras
        valor_hora   = _r2(sal / ch)
        val_he_50    = _r2(valor_hora * Decimal('1.5') * _d(he_50))
        val_he_100   = _r2(valor_hora * Decimal('2.0') * _d(he_100))

        bruto = _r2(saldo + val_he_50 + val_he_100 + _d(outros_proventos))

        # Desconto VT (6% do salário, limitado ao valor do benefício)
        val_vt = _r2(sal * Decimal('0.06'))

        # INSS e IRRF sobre o bruto
        inss   = CLTService.calcular_inss(bruto)
        irrf   = CLTService.calcular_irrf(bruto, dep, inss)
        fgts   = CLTService.calcular_fgts(bruto)

        total_desc = _r2(inss + irrf + _d(plano_saude) + val_vt)
        liquido    = _r2(bruto - total_desc)

        # Memória de cálculo
        memoria = [
            {'item': 'Salário Base',         'valor': float(sal),     'sinal': '', 'lei': 'CLT Art. 457'},
            {'item': f'Faltas ({faltas}d)',   'valor': float(-(sal/30*_d(faltas))), 'sinal': '–'} if faltas > 0 else None,
            {'item': f'HE 50% ({he_50}h)',    'valor': float(val_he_50),  'sinal': '+'} if he_50 else None,
            {'item': f'HE 100% ({he_100}h)',  'valor': float(val_he_100), 'sinal': '+'} if he_100 else None,
            {'item': 'Outros Proventos',      'valor': float(outros_proventos), 'sinal': '+'} if outros_proventos else None,
            {'item': 'INSS (Progressivo)',     'valor': float(-inss),   'sinal': '–', 'tipo': 'desconto', 'pct': str(_r2(inss/bruto*100))+'%', 'lei': 'Portaria MPS 2024'},
            {'item': f'IRRF ({dep} dep.)',     'valor': float(-irrf),   'sinal': '–', 'tipo': 'desconto', 'lei': 'Tabela IRRF 2024'},
            {'item': 'Plano de Saúde',        'valor': float(-_d(plano_saude)), 'sinal': '–', 'tipo': 'desconto'} if plano_saude else None,
            {'item': 'Vale Transporte (6%)',   'valor': float(-val_vt), 'sinal': '–', 'tipo': 'desconto', 'lei': 'Lei 7.418/85'},
            {'item': '💰 SALÁRIO LÍQUIDO',    'valor': float(liquido), 'sinal': '=', 'tipo': 'total'},
        ]
        memoria = [m for m in memoria if m is not None]

        return {
            'colaborador_id': str(colaborador.id),
            'competencia':    competencia,
            'salario_base':   sal,
            'dias_trabalhados':dias_trabalhados,
            'horas_extras_50': _d(he_50),
            'horas_extras_100':_d(he_100),
            'valor_he':       _r2(val_he_50 + val_he_100),
            'faltas':          faltas,
            'desconto_faltas': _r2(sal / 30 * _d(faltas)) if faltas else Decimal('0'),
            'outros_proventos':_d(outros_proventos),
            'inss':            inss,
            'irrf':            irrf,
            'fgts':            fgts,
            'plano_saude':     _d(plano_saude),
            'vale_transporte': val_vt,
            'total_bruto':     bruto,
            'total_liquido':   liquido,
            'memoria_calculo': memoria,
        }

    @staticmethod
    def calcular_folha_completa(folha_id: str) -> dict:
        """Calcula folha para todos os colaboradores ativos."""
        from .models import FolhaPagamento, FolhaItem, EventoFolha
        from rh.models import Colaborador
        from django.db import transaction

        folha = FolhaPagamento.objects.get(id=folha_id)
        colabs = Colaborador.objects.filter(
            status__in=['ativo','ferias','afastado'],
            deleted_at__isnull=True
        ).prefetch_related('dependentes', 'beneficios__beneficio')

        totais = {
            'total_bruto': Decimal('0'), 'total_liquido': Decimal('0'),
            'total_descontos': Decimal('0'), 'total_fgts': Decimal('0'),
            'total_inss': Decimal('0'), 'total_irrf': Decimal('0'),
            'total_colabs': 0,
        }

        with transaction.atomic():
            FolhaItem.objects.filter(folha=folha).delete()

            for colab in colabs:
                plano_saude = Decimal('0')
                for cb in colab.beneficios.filter(status='ativo'):
                    if cb.beneficio.tipo in ('saude', 'odonto') and cb.valor_colab:
                        plano_saude += _d(cb.valor_colab)

                dados = FolhaService.calcular_item(
                    colab, folha.competencia, plano_saude=float(plano_saude)
                )

                FolhaItem.objects.create(folha=folha, **{
                    k: v for k, v in dados.items()
                    if k not in ('colaborador_id', 'competencia')
                }, colaborador=colab)

                totais['total_bruto']     += dados['total_bruto']
                totais['total_liquido']   += dados['total_liquido']
                totais['total_descontos'] += dados['inss'] + dados['irrf'] + dados['plano_saude'] + dados['vale_transporte']
                totais['total_fgts']      += dados['fgts']
                totais['total_inss']      += dados['inss']
                totais['total_irrf']      += dados['irrf']
                totais['total_colabs']    += 1

            for k in ('total_bruto','total_liquido','total_descontos','total_fgts','total_inss','total_irrf'):
                totais[k] = _r2(totais[k])

            folha.status = 'calculada'
            for k, v in totais.items():
                setattr(folha, k, v)
            folha.save()

        return totais


# ─────────────────────────────────────────────────────────────
# FeriasService
# ─────────────────────────────────────────────────────────────
class FeriasService:

    @staticmethod
    def calcular(salario_base, dias: int = 30, abono: int = 0, dependentes: int = 0) -> dict:
        """
        Cálculo completo de férias com ⅓ constitucional.
        Art. 129 e seguintes da CLT.
        """
        sal  = _d(salario_base)
        dias = min(int(dias), 30)
        abono = min(int(abono), 10)

        # Proporcional por dias
        valor_ferias = _r2((sal / 30) * dias)
        terco        = _r2(valor_ferias / 3)
        valor_abono  = _r2((sal / 30) * abono) if abono > 0 else Decimal('0')

        base_calc = _r2(valor_ferias + terco)

        # INSS e IRRF incidem sobre férias + ⅓
        inss    = CLTService.calcular_inss(base_calc)
        irrf    = CLTService.calcular_irrf(base_calc, dependentes, inss)
        fgts    = CLTService.calcular_fgts(sal)
        liquido = _r2(base_calc + valor_abono - inss - irrf)

        memoria = [
            {'item': 'Salário Base',              'valor': float(sal),          'sinal': '', 'lei': 'CLT Art. 129'},
            {'item': f'Férias ({dias} dias)',      'valor': float(valor_ferias), 'sinal': '×', 'pct': f'{dias}/30'},
            {'item': '⅓ Constitucional',           'valor': float(terco),        'sinal': '+', 'lei': 'CF Art. 7º, XVII'},
        ] + ([
            {'item': f'Abono Pecuniário ({abono}d)','valor': float(valor_abono), 'sinal': '+', 'lei': 'CLT Art. 143'},
        ] if abono > 0 else []) + [
            {'item': 'INSS s/ Férias',             'valor': float(-inss),        'sinal': '–', 'tipo': 'desconto', 'pct': str(_r2(inss/base_calc*100))+'%'},
            {'item': 'IRRF s/ Férias',             'valor': float(-irrf),        'sinal': '–', 'tipo': 'desconto'},
            {'item': '💰 FÉRIAS LÍQUIDAS',         'valor': float(liquido),      'sinal': '=', 'tipo': 'total'},
        ]

        return {
            'salario_base':  sal,
            'dias':          dias,
            'dias_abono':    abono,
            'valor_ferias':  valor_ferias,
            'valor_terco':   terco,
            'valor_abono':   valor_abono,
            'valor_inss':    inss,
            'valor_irrf':    irrf,
            'valor_liquido': liquido,
            'fgts':          fgts,
            'memoria_calculo': memoria,
        }

    @staticmethod
    def calcular_ferias_em_dobro(salario_base, dependentes: int = 0) -> dict:
        """Férias em dobro (Art. 137 CLT) — quando não concedidas no prazo."""
        base   = FeriasService.calcular(salario_base, 30, 0, dependentes)
        liquido = _r2(base['valor_liquido'] * 2)
        return {**base, 'valor_liquido': liquido, 'em_dobro': True,
                'observacao': 'Férias em dobro — Art. 137 CLT (não concedidas no prazo)'}

    @staticmethod
    def verificar_ferias_vencendo(dias: int = 60):
        """Retorna colaboradores com férias vencendo nos próximos N dias."""
        from .models import Ferias
        from rh.models import Colaborador

        hoje  = date.today()
        limite = hoje + timedelta(days=dias)

        pendentes = Ferias.objects.filter(
            status__in=['pendente','aprovada'],
            periodo_fim__lte=limite,
            deleted_at__isnull=True,
        ).select_related('colaborador')

        return pendentes

    @staticmethod
    def gerar_alertas_ferias():
        """Cria notificações para férias vencendo."""
        from .models import NotificacaoDP

        vencendo = FeriasService.verificar_ferias_vencendo(60)
        alertas  = []
        for f in vencendo:
            dias_rest = f.dias_restantes_periodo
            prioridade = 'critica' if dias_rest <= 10 else 'alta' if dias_rest <= 30 else 'normal'
            notif, criada = NotificacaoDP.objects.get_or_create(
                colaborador=f.colaborador,
                tipo='ferias_vencendo',
                lida=False,
                defaults={
                    'titulo':    f'Férias vencendo em {dias_rest} dias',
                    'mensagem':  f'{f.colaborador.nome}: período {f.periodo_fim.strftime("%d/%m/%Y")} vence em {dias_rest} dias.',
                    'prioridade':prioridade,
                    'dados':     {'ferias_id': str(f.id), 'dias_restantes': dias_rest},
                }
            )
            if criada:
                alertas.append(notif)
        return alertas


# ─────────────────────────────────────────────────────────────
# DecimoTerceiroService
# ─────────────────────────────────────────────────────────────
class DecimoTerceiroService:

    @staticmethod
    def calcular(salario_base, meses: int = 12, parcela: str = '2', dependentes: int = 0) -> dict:
        """
        Cálculo do 13º salário.
        1ª parcela: 50% sem INSS/IRRF (Nov)
        2ª parcela: restante com INSS/IRRF (Dez)
        """
        sal    = _d(salario_base)
        meses  = min(max(int(meses), 1), 12)
        base   = _r2((sal / 12) * meses)
        parc1  = _r2(base / 2)

        inss   = CLTService.calcular_inss(base)
        irrf   = CLTService.calcular_irrf(base, dependentes, inss)
        parc2  = _r2(base / 2 - inss - irrf)
        fgts   = CLTService.calcular_fgts(base)

        memoria_2 = [
            {'item': 'Salário Base',                'valor': float(sal),   'sinal': ''},
            {'item': f'Proporcional ({meses}/12)',   'valor': float(base),  'sinal': '×', 'pct': f'{meses}/12'},
            {'item': '1ª Parcela (50%)',             'valor': float(parc1), 'sinal': '→', 'lei': 'Lei 4.090/62'},
            {'item': 'INSS s/ 13º',                 'valor': float(-inss), 'sinal': '–', 'tipo': 'desconto'},
            {'item': 'IRRF s/ 13º',                 'valor': float(-irrf), 'sinal': '–', 'tipo': 'desconto'},
            {'item': '💰 2ª Parcela Líquida',       'valor': float(parc2), 'sinal': '=', 'tipo': 'total'},
        ]

        return {
            'salario_base':  sal,
            'meses':         meses,
            'base':          base,
            'parcela_1':     parc1,
            'inss':          inss,
            'irrf':          irrf,
            'parcela_2':     parc2,
            'total_liquido': _r2(parc1 + parc2),
            'fgts':          fgts,
            'memoria_calculo': memoria_2,
        }


# ─────────────────────────────────────────────────────────────
# RescisaoService
# ─────────────────────────────────────────────────────────────
class RescisaoService:

    REGRAS_POR_TIPO = {
        'sem_justa_causa': {
            'aviso_previo': True, 'multa_fgts': Decimal('0.40'),
            'ferias_venc': True, 'ferias_prop': True, 'decimo': True,
            'seguro_desemprego': True,
        },
        'justa_causa': {
            'aviso_previo': False, 'multa_fgts': Decimal('0'),
            'ferias_venc': True,  'ferias_prop': False, 'decimo': False,
            'seguro_desemprego': False,
        },
        'pedido_demissao': {
            'aviso_previo': True, 'multa_fgts': Decimal('0'),
            'ferias_venc': True, 'ferias_prop': True, 'decimo': True,
            'seguro_desemprego': False,
        },
        'acordo_mutuo': {
            'aviso_previo': True, 'multa_fgts': Decimal('0.20'),
            'ferias_venc': True, 'ferias_prop': True, 'decimo': True,
            'seguro_desemprego': False,
        },
        'termino_contrato': {
            'aviso_previo': True, 'multa_fgts': Decimal('0.40'),
            'ferias_venc': True, 'ferias_prop': True, 'decimo': True,
            'seguro_desemprego': True,
        },
        'aposentadoria': {
            'aviso_previo': False, 'multa_fgts': Decimal('0'),
            'ferias_venc': True, 'ferias_prop': True, 'decimo': True,
            'seguro_desemprego': False,
        },
    }

    @staticmethod
    def calcular(colaborador, tipo: str, data_demissao: date,
                 ferias_vencidas_dias: int = 30, aviso_indenizado: bool = False,
                 fgts_acumulado: Decimal = None) -> dict:
        sal        = _d(colaborador.salario_base)
        admissao   = colaborador.data_admissao
        regras     = RescisaoService.REGRAS_POR_TIPO.get(tipo, RescisaoService.REGRAS_POR_TIPO['sem_justa_causa'])

        # Tempo de empresa
        aviso_info = CLTService.calcular_aviso_previo(admissao, data_demissao)
        meses      = aviso_info['meses']
        dias_aviso = aviso_info['dias']

        # Saldo de salário (dias no mês da demissão)
        dia_demissao  = data_demissao.day
        saldo_salario = _r2((sal / 30) * dia_demissao)

        # Aviso prévio
        val_aviso = _r2((sal / 30) * dias_aviso) if (regras['aviso_previo'] and aviso_indenizado) else Decimal('0')

        # Férias vencidas + ⅓
        ferias_vencidas_val = _r2((sal / 30) * ferias_vencidas_dias * Decimal('1.333333')) if regras['ferias_venc'] and ferias_vencidas_dias > 0 else Decimal('0')

        # Férias proporcionais + ⅓
        meses_prop = meses % 12
        ferias_prop = _r2((sal / 12) * meses_prop * Decimal('1.333333')) if regras['ferias_prop'] and meses_prop > 0 else Decimal('0')

        # 13º proporcional
        mes_demissao = data_demissao.month
        decimo_prop  = _r2((sal / 12) * mes_demissao) if regras['decimo'] else Decimal('0')

        # FGTS e multa
        if fgts_acumulado is None:
            fgts_mensal   = CLTService.calcular_fgts(sal)
            fgts_acumulado = _r2(fgts_mensal * meses)
        multa_fgts = _r2(fgts_acumulado * regras['multa_fgts'])

        # Base para INSS e IRRF
        base_desc = _r2(saldo_salario + ferias_vencidas_val + ferias_prop + decimo_prop + val_aviso)
        inss      = CLTService.calcular_inss(base_desc)
        irrf      = CLTService.calcular_irrf(base_desc, 0, inss)

        total_bruto  = _r2(base_desc + multa_fgts)
        total_liquido = _r2(total_bruto - inss - irrf)

        memoria = [
            {'item': f'Saldo de Salário ({dia_demissao}d)',     'valor': float(saldo_salario), 'sinal': ''},
            {'item': f'Aviso Prévio Indenizado ({dias_aviso}d)', 'valor': float(val_aviso), 'sinal': '+'} if val_aviso else None,
            {'item': f'Férias Vencidas ({ferias_vencidas_dias}d + ⅓)', 'valor': float(ferias_vencidas_val), 'sinal': '+'} if ferias_vencidas_val else None,
            {'item': f'Férias Proporcionais ({meses_prop}m + ⅓)',      'valor': float(ferias_prop), 'sinal': '+'} if ferias_prop else None,
            {'item': f'13º Proporcional ({mes_demissao}m)',     'valor': float(decimo_prop), 'sinal': '+'} if decimo_prop else None,
            {'item': f'Multa FGTS ({int(regras["multa_fgts"]*100)}%)',  'valor': float(multa_fgts), 'sinal': '+', 'lei': 'Art. 18 FGTS'} if multa_fgts else None,
            {'item': 'INSS',                                    'valor': float(-inss),  'sinal': '–', 'tipo': 'desconto'},
            {'item': 'IRRF',                                    'valor': float(-irrf),  'sinal': '–', 'tipo': 'desconto'},
            {'item': '💰 RESCISÃO LÍQUIDA',                    'valor': float(total_liquido), 'sinal': '=', 'tipo': 'total'},
        ]
        memoria = [m for m in memoria if m is not None]

        return {
            'tipo':               tipo,
            'salario_base':       sal,
            'meses_empresa':      meses,
            'aviso_previo_dias':  dias_aviso,
            'aviso_indenizado':   aviso_indenizado,
            'saldo_salario':      saldo_salario,
            'ferias_vencidas':    ferias_vencidas_val,
            'ferias_proporc':     ferias_prop,
            'terco_ferias':       Decimal('0'),
            'decimo_proporc':     decimo_prop,
            'aviso_previo_val':   val_aviso,
            'fgts_saldo':         fgts_acumulado,
            'multa_fgts':         multa_fgts,
            'inss':               inss,
            'irrf':               irrf,
            'total_bruto':        total_bruto,
            'total_liquido':      total_liquido,
            'seguro_desemprego':  regras['seguro_desemprego'],
            'memoria_calculo':    memoria,
        }


# ─────────────────────────────────────────────────────────────
# SimulacaoService
# ─────────────────────────────────────────────────────────────
class SimulacaoService:

    @staticmethod
    def simular_reajuste(salario_atual, novo_salario, dependentes: int = 0) -> dict:
        sal_atual = _d(salario_atual)
        sal_novo  = _d(novo_salario)
        pct       = _r2((sal_novo - sal_atual) / sal_atual * 100) if sal_atual > 0 else Decimal('0')

        atual = CLTService.calcular_liquido(sal_atual, dependentes)
        novo  = CLTService.calcular_liquido(sal_novo, dependentes)

        ganho_liquido = _r2(novo['liquido'] - atual['liquido'])
        ganho_bruto   = _r2(sal_novo - sal_atual)
        custo_empresa = _r2(ganho_bruto + CLTService.calcular_fgts(ganho_bruto))

        return {
            'salario_atual':  sal_atual,
            'salario_novo':   sal_novo,
            'percentual':     pct,
            'atual':          {k: float(v) for k, v in atual.items()},
            'novo':           {k: float(v) for k, v in novo.items()},
            'ganho_liquido':  float(ganho_liquido),
            'ganho_bruto':    float(ganho_bruto),
            'custo_empresa':  float(custo_empresa),
        }

    @staticmethod
    def projecao_folha(colaboradores) -> dict:
        """Projeta custo total da folha para os colaboradores informados."""
        total_bruto = total_liquido = total_fgts = Decimal('0')
        for c in colaboradores:
            calc = CLTService.calcular_liquido(c.salario_base)
            total_bruto   += _d(c.salario_base)
            total_liquido += calc['liquido']
            total_fgts    += calc['fgts']
        encargos  = _r2(total_bruto * Decimal('0.30'))   # estimativa 30%
        custo_emp = _r2(total_bruto + encargos + total_fgts)
        return {
            'total_bruto':  float(total_bruto),
            'total_liquido':float(total_liquido),
            'total_fgts':   float(total_fgts),
            'encargos_est': float(encargos),
            'custo_empresa':float(custo_emp),
            'headcount':    len(list(colaboradores)),
        }


# ─────────────────────────────────────────────────────────────
# DocumentGeneratorService
# ─────────────────────────────────────────────────────────────
class DocumentGeneratorService:
    """Gera documentos DP em PDF usando ReportLab."""

    EMPRESA = {}  # Preenchido no startup via settings

    @staticmethod
    def _cabecalho(canvas, doc, titulo):
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        canvas.saveState()
        canvas.setFillColor(colors.HexColor('#2563eb'))
        canvas.rect(0, doc.height + doc.topMargin, doc.width + doc.leftMargin * 2, 1.2*cm, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(doc.leftMargin, doc.height + doc.topMargin + 0.35*cm, 'hi Conecta RH')
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(doc.width + doc.leftMargin, doc.height + doc.topMargin + 0.35*cm, titulo)
        canvas.restoreState()

    @staticmethod
    def gerar_holerite(folha_item) -> bytes:
        """Gera holerite em PDF para um FolhaItem."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.lib.units import cm
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            import io

            buf = io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=A4,
                                    leftMargin=1.5*cm, rightMargin=1.5*cm,
                                    topMargin=2.5*cm, bottomMargin=1.5*cm)
            styles = getSampleStyleSheet()
            story  = []
            colab  = folha_item.colaborador

            # Cabeçalho
            story.append(Paragraph(f'<b>HOLERITE — {folha_item.folha.competencia}</b>', styles['Title']))
            story.append(Paragraph(f'{colab.nome} | {colab.cargo} | {colab.departamento}', styles['Normal']))
            story.append(Spacer(1, 0.4*cm))

            # Tabela proventos / descontos
            dados = [
                ['PROVENTOS', 'VALOR', 'DESCONTOS', 'VALOR'],
                ['Salário Base', f'R$ {folha_item.salario_base:,.2f}', 'INSS', f'R$ {folha_item.inss:,.2f}'],
            ]
            if folha_item.valor_he > 0:
                dados.append(['Horas Extras', f'R$ {folha_item.valor_he:,.2f}', 'IRRF', f'R$ {folha_item.irrf:,.2f}'])
            else:
                dados.append(['', '', 'IRRF', f'R$ {folha_item.irrf:,.2f}'])

            if folha_item.plano_saude > 0:
                dados.append(['', '', 'Plano de Saúde', f'R$ {folha_item.plano_saude:,.2f}'])
            if folha_item.vale_transporte > 0:
                dados.append(['', '', 'Vale Transporte', f'R$ {folha_item.vale_transporte:,.2f}'])

            dados.append(['TOTAL BRUTO', f'R$ {folha_item.total_bruto:,.2f}', 'TOTAL DESC.', f'R$ {(folha_item.inss+folha_item.irrf+folha_item.plano_saude+folha_item.vale_transporte):,.2f}'])

            t = Table(dados, colWidths=[5*cm, 3*cm, 5*cm, 3*cm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563eb')),
                ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
                ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('FONTSIZE', (0,0), (-1,-1), 9),
            ]))
            story.append(t)
            story.append(Spacer(1, 0.4*cm))

            # Líquido
            liquido_t = Table([['💰 SALÁRIO LÍQUIDO A RECEBER', f'R$ {folha_item.total_liquido:,.2f}']], colWidths=[12*cm, 4*cm])
            liquido_t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#16a34a')),
                ('TEXTCOLOR',  (0,0), (-1,-1), colors.white),
                ('FONTNAME',   (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE',   (0,0), (-1,-1), 12),
                ('ALIGN',      (1,0), (1,0), 'RIGHT'),
            ]))
            story.append(liquido_t)
            story.append(Spacer(1, 0.3*cm))
            story.append(Paragraph(f'FGTS depositado pela empresa: R$ {folha_item.fgts:,.2f}', styles['Normal']))

            doc.build(story)
            return buf.getvalue()
        except ImportError:
            logger.warning('ReportLab não instalado. Retornando bytes vazios.')
            return b''

    @staticmethod
    def gerar_recibo_ferias(ferias) -> bytes:
        """Recibo de férias simplificado."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib import colors
            from reportlab.lib.units import cm
            import io

            buf = io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2.5*cm, bottomMargin=1.5*cm)
            styles = getSampleStyleSheet()
            story  = []

            story.append(Paragraph('<b>RECIBO DE FÉRIAS</b>', styles['Title']))
            story.append(Paragraph(f'Colaborador: {ferias.colaborador.nome}', styles['Normal']))
            story.append(Paragraph(f'Cargo: {ferias.colaborador.cargo} | Departamento: {ferias.colaborador.departamento}', styles['Normal']))
            story.append(Paragraph(f'Período Aquisitivo: {ferias.periodo_inicio.strftime("%d/%m/%Y")} a {ferias.periodo_fim.strftime("%d/%m/%Y")}', styles['Normal']))
            story.append(Paragraph(f'Período de Gozo: {ferias.gozo_inicio.strftime("%d/%m/%Y") if ferias.gozo_inicio else "—"} a {ferias.gozo_fim.strftime("%d/%m/%Y") if ferias.gozo_fim else "—"} ({ferias.dias_solicitados} dias)', styles['Normal']))
            story.append(Spacer(1, 0.4*cm))

            dados = [
                ['Item', 'Valor'],
                ['Férias', f'R$ {ferias.valor_ferias or 0:,.2f}'],
                ['⅓ Constitucional', f'R$ {ferias.valor_terco or 0:,.2f}'],
                ['Abono Pecuniário', f'R$ {ferias.valor_abono or 0:,.2f}'],
                ['(-) INSS', f'R$ {ferias.valor_inss or 0:,.2f}'],
                ['(-) IRRF', f'R$ {ferias.valor_irrf or 0:,.2f}'],
                ['💰 LÍQUIDO', f'R$ {ferias.valor_liquido or 0:,.2f}'],
            ]
            t = Table(dados, colWidths=[10*cm, 6*cm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#7c3aed')),
                ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
                ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTNAME',   (0,-1),(-1,-1),'Helvetica-Bold'),
                ('BACKGROUND', (0,-1),(-1,-1), colors.HexColor('#dcfce7')),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            story.append(t)
            story.append(Spacer(1, 1.5*cm))
            story.append(Paragraph('Assinatura do Colaborador: _________________________________', styles['Normal']))
            story.append(Spacer(1, 0.5*cm))
            story.append(Paragraph(f'Data: ___/___/______', styles['Normal']))

            doc.build(story)
            return buf.getvalue()
        except ImportError:
            return b''
