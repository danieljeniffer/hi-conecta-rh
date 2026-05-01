/**
 * Serviço de Cálculo de Férias
 * CLT Art. 129-153 e CF/88 Art. 7º, XVII
 * Período aquisitivo: 12 meses
 * Prazo de gozo: até 12 meses após o período aquisitivo (perda = 18 meses)
 * Abono pecuniário (venda): até 10 dias (1/3 do período)
 */

const { calcularINSSFerias } = require('./calculoINSS');
const { calcularIRRF } = require('./calculoIRRF');

const DIAS_FERIAS_COMPLETO = 30;
const DIAS_ABONO_MAXIMO = 10;

/**
 * Calcula valor bruto das férias
 * @param {number} salarioBase
 * @param {number} diasFerias - Padrão 30 dias
 * @param {number} diasVendidos - Abono pecuniário (max 10 dias)
 * @param {number} outrosProventos - Adicionais recorrentes (insalubridade, noturno, etc.)
 * @returns {object}
 */
const calcularFerias = (salarioBase, diasFerias = 30, diasVendidos = 0, outrosProventos = 0) => {
  if (diasVendidos > DIAS_ABONO_MAXIMO) {
    throw new Error(`Abono pecuniário máximo é de ${DIAS_ABONO_MAXIMO} dias.`);
  }
  if (diasFerias + diasVendidos > DIAS_FERIAS_COMPLETO) {
    throw new Error('Total de dias (gozo + abono) não pode exceder 30 dias.');
  }

  const salarioTotal = salarioBase + outrosProventos;
  const valorDiario = salarioTotal / 30;

  const valorFerias = arredondar(valorDiario * diasFerias);
  const umTerco = arredondar(valorFerias / 3);
  const valorAbono = diasVendidos > 0 ? arredondar(valorDiario * diasVendidos) : 0;
  const umTercoAbono = diasVendidos > 0 ? arredondar(valorAbono / 3) : 0;

  const totalBruto = arredondar(valorFerias + umTerco + valorAbono + umTercoAbono);

  return {
    salarioBase,
    outrosProventos,
    diasFerias,
    diasVendidos,
    valorFerias,
    umTerco,
    valorAbono,
    umTercoAbono,
    totalBruto,
    valorDiario: arredondar(valorDiario),
  };
};

/**
 * Calcula férias com descontos (INSS e IRRF)
 * @param {number} salarioBase
 * @param {number} diasFerias
 * @param {number} diasVendidos
 * @param {number} qtdDependentes
 * @param {number} outrosProventos
 */
const calcularFeriasCompleto = (salarioBase, diasFerias = 30, diasVendidos = 0, qtdDependentes = 0, outrosProventos = 0) => {
  const ferias = calcularFerias(salarioBase, diasFerias, diasVendidos, outrosProventos);

  const { desconto: inss } = calcularINSSFerias(ferias.totalBruto);
  const { desconto: irrf, baseCalculo } = calcularIRRF(ferias.totalBruto, inss, qtdDependentes);

  const totalLiquido = arredondar(ferias.totalBruto - inss - irrf);

  return {
    ...ferias,
    inss,
    irrf,
    baseIRRF: baseCalculo,
    totalLiquido,
  };
};

/**
 * Calcula férias proporcionais (para rescisão)
 * @param {number} salarioBase
 * @param {number} mesesTrabalhados - Meses no período aquisitivo atual
 * @param {boolean} incluirUmTerco
 */
const calcularFeriasProporcionais = (salarioBase, mesesTrabalhados, incluirUmTerco = true) => {
  if (mesesTrabalhados < 0 || mesesTrabalhados > 12) {
    throw new Error('Meses trabalhados deve ser entre 0 e 12.');
  }

  const diasProporcional = Math.floor((DIAS_FERIAS_COMPLETO / 12) * mesesTrabalhados);
  const valorDiario = salarioBase / 30;
  const valorFerias = arredondar(valorDiario * diasProporcional);
  const umTerco = incluirUmTerco ? arredondar(valorFerias / 3) : 0;
  const totalBruto = arredondar(valorFerias + umTerco);

  return {
    mesesTrabalhados,
    diasProporcional,
    valorFerias,
    umTerco,
    totalBruto,
    valorDiario: arredondar(valorDiario),
  };
};

/**
 * Calcula período aquisitivo e data limite de gozo
 * @param {Date} dataAdmissao
 * @param {number} periodoNumero - 1 para primeiro período, 2 para segundo, etc.
 */
const calcularPeriodoAquisitivo = (dataAdmissao, periodoNumero = 1) => {
  const admissao = new Date(dataAdmissao);
  const inicio = new Date(admissao);
  inicio.setFullYear(inicio.getFullYear() + (periodoNumero - 1));
  const fim = new Date(inicio);
  fim.setFullYear(fim.getFullYear() + 1);
  fim.setDate(fim.getDate() - 1);
  const dataLimiteGozo = new Date(fim);
  dataLimiteGozo.setFullYear(dataLimiteGozo.getFullYear() + 1);

  return {
    inicio: inicio.toISOString().split('T')[0],
    fim: fim.toISOString().split('T')[0],
    dataLimiteGozo: dataLimiteGozo.toISOString().split('T')[0],
    diasRestantes: Math.floor((dataLimiteGozo - new Date()) / (1000 * 60 * 60 * 24)),
  };
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularFerias,
  calcularFeriasCompleto,
  calcularFeriasProporcionais,
  calcularPeriodoAquisitivo,
  DIAS_FERIAS_COMPLETO,
  DIAS_ABONO_MAXIMO,
};
