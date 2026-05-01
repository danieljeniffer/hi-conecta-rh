/**
 * Serviço de Cálculo de 13º Salário
 * CLT Art. 457 e Lei 4.090/1962
 * 1ª parcela: até 30/novembro (ou antecipada em férias)
 * 2ª parcela: até 20/dezembro (com INSS e IRRF)
 * Proporcional: 1/12 por mês trabalhado (15 dias ou mais = mês cheio)
 */

const { calcularINSS13 } = require('./calculoINSS');
const { calcularIRRF13 } = require('./calculoIRRF');

/**
 * Calcula meses trabalhados para base do 13º
 * @param {Date|string} dataAdmissao
 * @param {Date|string} dataReferencia - Data de referência (default: 31/12 do ano)
 * @param {number} ano - Ano do 13º
 */
const calcularMesesTrabalhados13 = (dataAdmissao, ano, dataReferencia = null) => {
  const admissao = new Date(dataAdmissao);
  const referencia = dataReferencia ? new Date(dataReferencia) : new Date(ano, 11, 31);

  let meses = 0;
  const anoAdmissao = admissao.getFullYear();
  const mesAdmissao = admissao.getMonth(); // 0-indexed
  const diaAdmissao = admissao.getDate();

  const anoFim = referencia.getFullYear() === ano ? referencia.getMonth() : 11;
  const mesFim = referencia.getFullYear() === ano ? referencia.getMonth() : 11;
  const diaFim = referencia.getFullYear() === ano ? referencia.getDate() : 31;

  if (anoAdmissao > ano) return 0;

  const mesInicio = anoAdmissao === ano ? mesAdmissao : 0;

  for (let m = mesInicio; m <= mesFim; m++) {
    if (m === mesInicio && anoAdmissao === ano) {
      // Mês de admissão: conta se entrou até dia 15
      if (diaAdmissao <= 15) meses++;
    } else {
      meses++;
    }
  }

  return Math.min(meses, 12);
};

/**
 * Calcula valor bruto do 13º proporcional
 * @param {number} salarioBase
 * @param {number} mesesTrabalhados
 * @param {number} outrasRemuneracoes - Médias de HE, comissões, adicionais
 */
const calcular13Bruto = (salarioBase, mesesTrabalhados, outrasRemuneracoes = 0) => {
  const baseCalculo = salarioBase + outrasRemuneracoes;
  const valorIntegral = arredondar(baseCalculo);
  const valorProporcional = arredondar((baseCalculo / 12) * mesesTrabalhados);

  return {
    baseCalculo,
    mesesTrabalhados,
    valorIntegral,
    valorProporcional,
    ehProporcional: mesesTrabalhados < 12,
  };
};

/**
 * Calcula 13º salário completo (ambas parcelas) com descontos
 * @param {number} salarioBase
 * @param {number} mesesTrabalhados
 * @param {number} qtdDependentes
 * @param {number} outrasRemuneracoes
 * @param {number} adiantamento1Parcela - Valor já pago na 1ª parcela (opcional)
 */
const calcular13Completo = (salarioBase, mesesTrabalhados, qtdDependentes = 0, outrasRemuneracoes = 0, adiantamento1Parcela = null) => {
  const { valorProporcional } = calcular13Bruto(salarioBase, mesesTrabalhados, outrasRemuneracoes);

  // 1ª parcela: metade do 13º, sem descontos
  const parcela1 = adiantamento1Parcela !== null
    ? arredondar(adiantamento1Parcela)
    : arredondar(valorProporcional / 2);

  // 2ª parcela: restante com INSS e IRRF calculados sobre o TOTAL do 13º
  const parcela2Bruta = arredondar(valorProporcional - parcela1);
  const { desconto: inss } = calcularINSS13(valorProporcional);
  const { desconto: irrf } = calcularIRRF13(valorProporcional, inss, qtdDependentes);
  const parcela2Liquida = arredondar(parcela2Bruta - inss - irrf);

  return {
    salarioBase,
    mesesTrabalhados,
    valorBruto: valorProporcional,
    parcela1: {
      valor: parcela1,
      prazo: 'Até 30/novembro',
      inss: 0,
      irrf: 0,
      liquido: parcela1,
    },
    parcela2: {
      valorBruto: parcela2Bruta,
      inss,
      irrf,
      liquido: parcela2Liquida,
      prazo: 'Até 20/dezembro',
    },
    totalLiquido: arredondar(parcela1 + parcela2Liquida),
    totalDescontos: arredondar(inss + irrf),
  };
};

/**
 * Calcula 13º proporcional para rescisão
 * Na rescisão: INSS e IRRF são calculados junto com a rescisão
 * @param {number} salarioBase
 * @param {number} mesesTrabalhados - Meses no ano corrente até rescisão
 */
const calcular13Rescisao = (salarioBase, mesesTrabalhados) => {
  const valor = arredondar((salarioBase / 12) * mesesTrabalhados);
  return { valor, mesesTrabalhados, salarioBase };
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularMesesTrabalhados13,
  calcular13Bruto,
  calcular13Completo,
  calcular13Rescisao,
};
