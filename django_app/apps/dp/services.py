"""
apps/dp/services.py — Serviços de cálculo trabalhista CLT 2024.
INSS progressivo, IRRF, FGTS, Férias, 13º, Rescisão.
"""
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
import math
import logging

logger = logging.getLogger('apps')

# ── Constantes 2024 ───────────────────────────────────────────
TABELA_INSS_2024 = [
    (Decimal('1412.00'),  Decimal('0.075')),
    (Decimal('2666.68'),  Decimal('0.09')),
    (Decimal('4000.03'),  Decimal('0.12')),
    (Decimal('7786.02'),  Decimal('0.14')),
]
TETO_INSS_2024       = Decimal('908.85')
DEDUCAO_DEPENDENTE   = Decimal('189.59')
SALARIO_MINIMO_2024  = Decimal('1412.00')
ALIQUOTA_FGTS        = Decimal('0.08')

TABELA_IRRF_2024 = [
    (Decimal('2259.20'),  Decimal('0'),     Decimal('0')),
    (Decimal('2826.65'),  Decimal('0.075'), Decimal('169.44')),
    (Decimal('3751.05'),  Decimal('0.15'),  Decimal('381.44')),
    (Decimal('4664.68'),  Decimal('0.225'), Decimal('662.77')),
    (Decimal('999999.99'),Decimal('0.275'), Decimal('896.00')),
]


def _r(valor):
    """Arredonda para 2 casas decimais."""
    return Decimal(str(valor)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calcular_inss(salario_bruto: Decimal) -> Decimal:
    """Cálculo progressivo do INSS — Tabela 2024."""
    salario = Decimal(str(salario_bruto))
    if salario <= 0:
        return Decimal('0.00')

    desconto     = Decimal('0.00')
    base_restante = salario

    for teto, aliquota in TABELA_INSS_2024:
        if base_restante <= 0:
            break
        faixa = min(base_restante, teto)
        desconto += faixa * aliquota
        base_restante -= faixa

    return _r(min(desconto, TETO_INSS_2024))


def calcular_irrf(salario_bruto: Decimal, dependentes: int = 0, inss: Decimal = None) -> Decimal:
    """Cálculo progressivo do IRRF — Tabela 2024."""
    salario = Decimal(str(salario_bruto))
    if inss is None:
        inss = calcular_inss(salario)

    base_calculo = salario - inss - (DEDUCAO_DEPENDENTE * Decimal(str(dependentes)))

    if base_calculo <= 0:
        return Decimal('0.00')

    for limite, aliquota, deducao in TABELA_IRRF_2024:
        if base_calculo <= limite:
            irrf = base_calculo * aliquota - deducao
            return _r(max(Decimal('0.00'), irrf))

    return Decimal('0.00')


def calcular_fgts(salario_bruto: Decimal) -> Decimal:
    return _r(Decimal(str(salario_bruto)) * ALIQUOTA_FGTS)


def calcular_liquido(salario_bruto: Decimal, dependentes: int = 0) -> dict:
    """Calcula salário líquido completo."""
    sal  = Decimal(str(salario_bruto))
    inss = calcular_inss(sal)
    irrf = calcular_irrf(sal, dependentes, inss)
    fgts = calcular_fgts(sal)
    return {
        'bruto':    _r(sal),
        'inss':     inss,
        'irrf':     irrf,
        'fgts':     fgts,
        'liquido':  _r(sal - inss - irrf),
    }


def calcular_ferias(salario_base: Decimal, dias: int = 30, abono: int = 0, dependentes: int = 0) -> dict:
    """Cálculo completo de férias com ⅓ constitucional."""
    sal  = Decimal(str(salario_base))
    dias = min(dias, 30)
    abono = min(abono, 10)

    valor_ferias = _r((sal / 30) * dias)
    terco        = _r(valor_ferias / 3)
    valor_abono  = _r((sal / 30) * abono) if abono > 0 else Decimal('0.00')
    base_calc    = valor_ferias + terco

    inss    = calcular_inss(base_calc)
    irrf    = calcular_irrf(base_calc, dependentes, inss)
    fgts    = calcular_fgts(sal)
    liquido = _r(base_calc + valor_abono - inss - irrf)

    return {
        'salario_base':   _r(sal),
        'dias':           dias,
        'valor_ferias':   valor_ferias,
        'terco':          terco,
        'valor_abono':    valor_abono,
        'base_calculo':   base_calc,
        'inss':           inss,
        'irrf':           irrf,
        'fgts':           fgts,
        'bruto':          _r(base_calc + valor_abono),
        'liquido':        liquido,
    }


def calcular_decimo(salario_base: Decimal, meses: int = 12, dependentes: int = 0) -> dict:
    """Cálculo do 13º salário proporcional."""
    sal   = Decimal(str(salario_base))
    meses = min(max(meses, 1), 12)
    base  = _r((sal / 12) * meses)

    parcela1 = _r(base * Decimal('0.5'))
    inss     = calcular_inss(base)
    irrf     = calcular_irrf(base, dependentes, inss)
    parcela2 = _r(base * Decimal('0.5') - inss - irrf)
    fgts     = calcular_fgts(base)

    return {
        'base':     base,
        'meses':    meses,
        'parcela1': parcela1,
        'inss':     inss,
        'irrf':     irrf,
        'parcela2': parcela2,
        'total':    _r(parcela1 + parcela2),
        'fgts':     fgts,
    }


def calcular_rescisao(
    salario_base: Decimal,
    data_admissao: date,
    data_rescisao: date,
    tipo: str,
    ferias_vencidas_dias: int = 30,
    aviso_indenizado: bool = False,
) -> dict:
    """Cálculo completo de rescisão para os 5 tipos CLT."""
    sal  = Decimal(str(salario_base))

    # Tempo de empresa
    delta  = data_rescisao - data_admissao
    meses  = math.floor(delta.days / 30)
    anos   = meses // 12

    # Aviso prévio (Lei 12.506/2011)
    dias_aviso = min(30 + anos * 3, 90)
    valor_aviso = _r((sal / 30) * dias_aviso) if aviso_indenizado and tipo in ('sem_justa_causa', 'termino_contrato') else Decimal('0.00')

    # Saldo de salário
    dia_rescisao  = data_rescisao.day
    saldo_salario = _r((sal / 30) * dia_rescisao)

    # Férias
    fv    = _r((sal / 30) * ferias_vencidas_dias * Decimal('1.333333'))
    fp    = _r((sal / 12) * (meses % 12) * Decimal('1.333333'))

    # 13º proporcional
    mes_atual  = data_rescisao.month
    dec_prop   = Decimal('0.00') if tipo == 'justa_causa' else _r((sal / 12) * mes_atual)

    # FGTS + Multa
    fgts_mensal  = calcular_fgts(sal)
    fgts_acum    = _r(fgts_mensal * meses)
    multa_pct    = Decimal('0.40') if tipo == 'sem_justa_causa' else (Decimal('0.20') if tipo == 'acordo_mutuo' else Decimal('0.00'))
    multa_fgts   = _r(fgts_acum * multa_pct)

    # Parcelas que sofrem INSS e IRRF
    base_desc = saldo_salario + fv + fp + dec_prop + (valor_aviso if aviso_indenizado else Decimal('0.00'))
    inss      = calcular_inss(base_desc)
    irrf      = calcular_irrf(base_desc, 0, inss)

    bruto   = base_desc + multa_fgts
    liquido = _r(bruto - inss - irrf)

    return {
        'tipo':               tipo,
        'aviso_previo_dias':  dias_aviso,
        'saldo_salario':      saldo_salario,
        'ferias_vencidas':    fv,
        'ferias_proporcionais': fp,
        'decimo_proporcional':dec_prop,
        'aviso_previo_val':   valor_aviso,
        'multa_fgts':         multa_fgts,
        'fgts_acumulado':     fgts_acum,
        'inss':               inss,
        'irrf':               irrf,
        'total_bruto':        bruto,
        'total_liquido':      liquido,
    }


def calcular_aviso_previo(data_admissao: date, salario_base: Decimal) -> dict:
    """Calcula aviso prévio proporcional ao tempo de empresa."""
    hoje  = date.today()
    meses = math.floor((hoje - data_admissao).days / 30)
    anos  = meses // 12
    dias  = min(30 + anos * 3, 90)
    valor = _r((Decimal(str(salario_base)) / 30) * dias)
    return {'dias': dias, 'valor': valor, 'anos': anos}
