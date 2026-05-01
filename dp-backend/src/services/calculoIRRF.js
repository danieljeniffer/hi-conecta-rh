/**
 * Serviço de Cálculo de IRRF (Imposto de Renda Retido na Fonte)
 * Tabela Progressiva Mensal - vigência a partir de 05/2023 (Lei 14.663/2023)
 * Dedução por dependente: R$ 189,59/mês
 */

const TABELA_IRRF_2024 = [
  { limite: 2824.00,   aliquota: 0,     deducao: 0       },
  { limite: 3751.05,   aliquota: 0.075, deducao: 211.80  },
  { limite: 4664.68,   aliquota: 0.15,  deducao: 492.60  },
  { limite: 6101.06,   aliquota: 0.225, deducao: 842.17  },
  { limite: Infinity,  aliquota: 0.275, deducao: 1147.70 },
];

const DEDUCAO_DEPENDENTE = 189.59;

/**
 * Calcula IRRF mensal da folha
 * @param {number} salarioBruto
 * @param {number} inss - Desconto INSS já calculado
 * @param {number} qtdDependentes - Número de dependentes habilitados
 * @param {number} outrasDeducoes - Pensão alimentícia e outros (opcional)
 * @returns {{ desconto: number, baseCalculo: number, aliquota: number, faixaAplicada: object }}
 */
const calcularIRRF = (salarioBruto, inss, qtdDependentes = 0, outrasDeducoes = 0) => {
  const deducaoDependentes = qtdDependentes * DEDUCAO_DEPENDENTE;
  const baseCalculo = salarioBruto - inss - deducaoDependentes - outrasDeducoes;

  if (baseCalculo <= 0 || baseCalculo <= TABELA_IRRF_2024[0].limite) {
    return {
      desconto: 0,
      baseCalculo: arredondar(baseCalculo),
      aliquota: 0,
      deducaoDependentes: arredondar(deducaoDependentes),
      faixaAplicada: { limite: 2824.00, aliquota: 0, deducao: 0 },
    };
  }

  const faixa = TABELA_IRRF_2024.find(f => baseCalculo <= f.limite);
  const desconto = arredondar((baseCalculo * faixa.aliquota) - faixa.deducao);

  return {
    desconto: Math.max(0, desconto),
    baseCalculo: arredondar(baseCalculo),
    aliquota: faixa.aliquota * 100,
    deducaoDependentes: arredondar(deducaoDependentes),
    faixaAplicada: faixa,
  };
};

/**
 * Calcula IRRF sobre 13º salário (tabela exclusiva - não acumula com mensal)
 * Base = 13º bruto - INSS 13º - deduções
 */
const calcularIRRF13 = (valor13Bruto, inss13, qtdDependentes = 0) => {
  const deducaoDependentes = qtdDependentes * DEDUCAO_DEPENDENTE;
  const baseCalculo = valor13Bruto - inss13 - deducaoDependentes;

  if (baseCalculo <= 0 || baseCalculo <= TABELA_IRRF_2024[0].limite) {
    return { desconto: 0, baseCalculo: arredondar(baseCalculo), aliquota: 0 };
  }

  const faixa = TABELA_IRRF_2024.find(f => baseCalculo <= f.limite);
  const desconto = arredondar((baseCalculo * faixa.aliquota) - faixa.deducao);

  return {
    desconto: Math.max(0, desconto),
    baseCalculo: arredondar(baseCalculo),
    aliquota: faixa.aliquota * 100,
  };
};

/**
 * Calcula IRRF sobre rescisão
 * Rescisão tem base de cálculo diferente (sem 13º, apenas verbas tributáveis)
 */
const calcularIRRFRescisao = (baseTributavel, inssRescisao, qtdDependentes = 0) => {
  return calcularIRRF(baseTributavel, inssRescisao, qtdDependentes, 0);
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularIRRF,
  calcularIRRF13,
  calcularIRRFRescisao,
  TABELA_IRRF_2024,
  DEDUCAO_DEPENDENTE,
};
