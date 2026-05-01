/**
 * Serviço de Cálculo de FGTS
 * Lei 8.036/1990 e atualizações
 * Alíquota: 8% sobre remuneração bruta (CLT)
 * Aprendiz: 2%
 * Multa rescisória sem justa causa: 40% sobre saldo FGTS
 * Multa rescisória por acordo mútuo: 20% (Lei 13.467/2017)
 */

const ALIQUOTA_CLT = 0.08;
const ALIQUOTA_APRENDIZ = 0.02;
const MULTA_SEM_JUSTA_CAUSA = 0.40;
const MULTA_ACORDO_MUTUO = 0.20;

/**
 * Calcula FGTS mensal
 * @param {number} remuneracaoBruta - Soma de todos os proventos tributáveis
 * @param {boolean} ehAprendiz
 */
const calcularFGTSMensal = (remuneracaoBruta, ehAprendiz = false) => {
  const aliquota = ehAprendiz ? ALIQUOTA_APRENDIZ : ALIQUOTA_CLT;
  const valor = arredondar(remuneracaoBruta * aliquota);
  return { valor, aliquota: aliquota * 100, base: remuneracaoBruta };
};

/**
 * Calcula FGTS de 13º salário (também incide)
 */
const calcularFGTS13 = (valor13Bruto) => {
  const valor = arredondar(valor13Bruto * ALIQUOTA_CLT);
  return { valor, aliquota: ALIQUOTA_CLT * 100 };
};

/**
 * Calcula multa FGTS na rescisão
 * @param {number} saldoFGTS - Saldo acumulado na conta FGTS
 * @param {string} tipoRescisao
 */
const calcularMultaFGTS = (saldoFGTS, tipoRescisao) => {
  let percentualMulta = 0;
  let multa = 0;

  switch (tipoRescisao) {
    case 'Sem_Justa_Causa':
      percentualMulta = MULTA_SEM_JUSTA_CAUSA;
      multa = arredondar(saldoFGTS * MULTA_SEM_JUSTA_CAUSA);
      break;
    case 'Acordo_Mutuo':
      percentualMulta = MULTA_ACORDO_MUTUO;
      multa = arredondar(saldoFGTS * MULTA_ACORDO_MUTUO);
      break;
    case 'Pedido_Demissao':
    case 'Justa_Causa':
    case 'Termino_Contrato':
      percentualMulta = 0;
      multa = 0;
      break;
  }

  return { multa, percentualMulta: percentualMulta * 100, saldoBase: saldoFGTS };
};

/**
 * Estima saldo de FGTS com base no histórico salarial
 * Considera 8% ao mês de todos os meses trabalhados
 * @param {number} salarioMedio - Salário médio no período
 * @param {number} mesesTrabalhados
 */
const estimarSaldoFGTS = (salarioMedio, mesesTrabalhados) => {
  return arredondar(salarioMedio * ALIQUOTA_CLT * mesesTrabalhados);
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularFGTSMensal,
  calcularFGTS13,
  calcularMultaFGTS,
  estimarSaldoFGTS,
  ALIQUOTA_CLT,
  MULTA_SEM_JUSTA_CAUSA,
  MULTA_ACORDO_MUTUO,
};
