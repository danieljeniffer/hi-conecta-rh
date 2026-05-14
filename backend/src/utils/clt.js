'use strict';

// ─────────────────────────────────────────────
// CLT.JS — Cálculos trabalhistas brasileiros
// Tabelas: 2024/2025
// ─────────────────────────────────────────────

// Tabela INSS 2024 — progressiva por faixas
const TABELA_INSS = [
  { teto: 1_412.00,  aliquota: 0.075 },
  { teto: 2_666.68,  aliquota: 0.09  },
  { teto: 4_000.03,  aliquota: 0.12  },
  { teto: 7_786.02,  aliquota: 0.14  },
];

const TETO_INSS_2024     = 908.85;
const DEDUCAO_DEPENDENTE = 189.59;
const SALARIO_MINIMO     = 1_412.00;

// Tabela IRRF 2024
const TABELA_IRRF = [
  { base:    2_259.20, aliquota: 0,     deducao:    0.00 },
  { base:    2_826.65, aliquota: 0.075, deducao:  169.44 },
  { base:    3_751.05, aliquota: 0.15,  deducao:  381.44 },
  { base:    4_664.68, aliquota: 0.225, deducao:  662.77 },
  { base: Infinity,    aliquota: 0.275, deducao:  896.00 },
];

/**
 * Calcula INSS pela tabela progressiva 2024
 */
const calcularINSS = (salarioBruto) => {
  if (!salarioBruto || salarioBruto <= 0) return 0;

  let desconto   = 0;
  let baseRestante = salarioBruto;

  for (const { teto, aliquota } of TABELA_INSS) {
    if (baseRestante <= 0) break;
    const faixa = Math.min(baseRestante, teto);
    desconto    += faixa * aliquota;
    baseRestante -= faixa;
  }

  return Math.min(Math.round(desconto * 100) / 100, TETO_INSS_2024);
};

/**
 * Calcula IRRF pela tabela progressiva 2024
 */
const calcularIRRF = (salarioBruto, dependentes = 0, inss = null) => {
  const descontoINSS = inss ?? calcularINSS(salarioBruto);
  const baseCalculo  = salarioBruto - descontoINSS - (dependentes * DEDUCAO_DEPENDENTE);

  if (baseCalculo <= 0) return 0;

  for (const { base, aliquota, deducao } of TABELA_IRRF) {
    if (baseCalculo <= base) {
      const irrf = baseCalculo * aliquota - deducao;
      return Math.max(0, Math.round(irrf * 100) / 100);
    }
  }
  return 0;
};

/**
 * Calcula FGTS (8% do salário bruto)
 */
const calcularFGTS = (salarioBruto) =>
  Math.round(salarioBruto * 0.08 * 100) / 100;

/**
 * Calcula salário líquido
 */
const calcularLiquido = (salarioBruto, dependentes = 0) => {
  const inss  = calcularINSS(salarioBruto);
  const irrf  = calcularIRRF(salarioBruto, dependentes, inss);
  return {
    bruto:    salarioBruto,
    inss,
    irrf,
    fgts:    calcularFGTS(salarioBruto),
    liquido: Math.round((salarioBruto - inss - irrf) * 100) / 100,
  };
};

/**
 * Calcula férias (30 dias padrão + ⅓)
 */
const calcularFerias = (salarioBase, dias = 30, dependentes = 0, diasAbono = 0) => {
  // Salário proporcional
  const salarioFerias = (salarioBase / 30) * dias;
  const terco         = salarioFerias / 3;
  const abono         = diasAbono > 0 ? (salarioBase / 30) * diasAbono : 0;
  const baseCalculo   = salarioFerias + terco;

  const inss   = calcularINSS(baseCalculo);
  const irrf   = calcularIRRF(baseCalculo, dependentes, inss);
  const liquido = baseCalculo + abono - inss - irrf;

  return {
    salario_ferias: Math.round(salarioFerias * 100) / 100,
    terco:          Math.round(terco * 100) / 100,
    abono:          Math.round(abono * 100) / 100,
    base_calculo:   Math.round(baseCalculo * 100) / 100,
    inss:           Math.round(inss * 100) / 100,
    irrf:           Math.round(irrf * 100) / 100,
    bruto:          Math.round((baseCalculo + abono) * 100) / 100,
    liquido:        Math.round(liquido * 100) / 100,
  };
};

/**
 * Calcula 13º salário
 * meses: meses trabalhados no ano (1-12)
 */
const calcularDecimo = (salarioBase, meses = 12, dependentes = 0) => {
  const base = (salarioBase / 12) * meses;

  // 1ª parcela (50% sem descontos)
  const parcela1 = Math.round(base * 0.5 * 100) / 100;

  // 2ª parcela com INSS e IRRF
  const inss  = calcularINSS(base);
  const irrf  = calcularIRRF(base, dependentes, inss);
  const parcela2 = Math.round((base * 0.5 - inss - irrf) * 100) / 100;

  return {
    base:            Math.round(base * 100) / 100,
    meses_trabalhados: meses,
    inss:            Math.round(inss * 100) / 100,
    irrf:            Math.round(irrf * 100) / 100,
    parcela1,
    parcela2,
    liquido:         Math.round((parcela1 + parcela2) * 100) / 100,
  };
};

/**
 * Calcula rescisão completa
 */
const calcularRescisao = ({
  salarioBase,
  dataAdmissao,
  dataRescisao,
  tipoRescisao,    // sem_justa_causa | pedido_demissao | justa_causa | acordo_mutuo | termino_contrato
  feriasVencidas = 0, // saldo de dias de férias vencidas
  mesAtual = new Date().getMonth() + 1,
}) => {
  const admissao  = new Date(dataAdmissao);
  const rescisao  = new Date(dataRescisao);
  const mesesEmpresa = _mesesEntre(admissao, rescisao);
  const anosEmpresa  = Math.floor(mesesEmpresa / 12);

  // Aviso prévio (30 dias + 3 por ano, máx. 90)
  let avisoPrevioDias = 0;
  if (['sem_justa_causa','termino_contrato'].includes(tipoRescisao)) {
    avisoPrevioDias = Math.min(30 + (anosEmpresa * 3), 90);
  }

  // Saldo de salário (dias trabalhados no mês)
  const diaRescisao  = rescisao.getDate();
  const saldoSalario = (salarioBase / 30) * diaRescisao;

  // Férias vencidas + ⅓
  const valorFeriasVenc = feriasVencidas > 0
    ? (salarioBase / 30) * feriasVencidas * (4/3)
    : 0;

  // Férias proporcionais + ⅓
  const mesesParaFerias  = mesesEmpresa % 12;
  const feriasProporc    = (salarioBase / 12) * mesesParaFerias * (4/3);

  // 13º proporcional (meses no ano atual)
  const decimoPropor = (salarioBase / 12) * mesAtual;

  // Multa FGTS
  const fgtsMensal   = calcularFGTS(salarioBase);
  const fgtsAcumulado = fgtsMensal * mesesEmpresa; // estimativa
  const multaFGTS = tipoRescisao === 'sem_justa_causa' ? fgtsAcumulado * 0.40 :
                    tipoRescisao === 'acordo_mutuo'     ? fgtsAcumulado * 0.20 : 0;

  // Aviso prévio indenizado
  const avisoPrevioIndeniz = tipoRescisao === 'sem_justa_causa'
    ? (salarioBase / 30) * avisoPrevioDias : 0;

  const bruto = saldoSalario + valorFeriasVenc + feriasProporc +
                decimoPropor + avisoPrevioIndeniz + multaFGTS;

  // Descontos (INSS e IRRF sobre base = saldo + férias + 13º)
  const baseDesconto = saldoSalario + valorFeriasVenc + feriasProporc + decimoPropor;
  const inss  = calcularINSS(baseDesconto);
  const irrf  = calcularIRRF(baseDesconto, 0, inss);
  const liquido = bruto - inss - irrf;

  return {
    tipo_rescisao:       tipoRescisao,
    aviso_previo_dias:   avisoPrevioDias,
    saldo_salario:       _r(saldoSalario),
    ferias_vencidas_val: _r(valorFeriasVenc),
    ferias_proporcionais:_r(feriasProporc),
    decimo_proporcional: _r(decimoPropor),
    aviso_previo_indeniz:_r(avisoPrevioIndeniz),
    multa_fgts:          _r(multaFGTS),
    fgts_acumulado:      _r(fgtsAcumulado),
    inss:                _r(inss),
    irrf:                _r(irrf),
    total_bruto:         _r(bruto),
    total_liquido:       _r(liquido),
  };
};

// ── Helpers internos ──────────────────────────
const _r = (v) => Math.round(v * 100) / 100;

const _mesesEntre = (d1, d2) => {
  const anos  = d2.getFullYear() - d1.getFullYear();
  const meses = d2.getMonth()    - d1.getMonth();
  return anos * 12 + meses;
};

/**
 * Calcula horas extras
 * tipo: 'diurna' (50%) | 'noturna' (70%) | 'dominical' (100%)
 */
const calcularHoraExtra = (salarioBase, cargaHoraria, horas, tipo = 'diurna') => {
  const percentuais = { diurna: 1.5, noturna: 1.7, dominical: 2.0 };
  const pct         = percentuais[tipo] ?? 1.5;
  const valorHora   = salarioBase / cargaHoraria;
  return _r(valorHora * pct * horas);
};

module.exports = {
  calcularINSS,
  calcularIRRF,
  calcularFGTS,
  calcularLiquido,
  calcularFerias,
  calcularDecimo,
  calcularRescisao,
  calcularHoraExtra,
  SALARIO_MINIMO,
  TABELA_INSS,
  TABELA_IRRF,
};
