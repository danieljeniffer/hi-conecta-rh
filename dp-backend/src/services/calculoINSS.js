/**
 * Serviço de Cálculo de INSS
 * Tabela Progressiva vigente desde março/2020
 * Atualizada com salário mínimo 2024: R$ 1.412,00
 * Teto INSS 2024: R$ 7.786,02
 */

const TABELA_INSS_2024 = [
  { limite: 1412.00,  aliquota: 0.075 },
  { limite: 2666.68,  aliquota: 0.09  },
  { limite: 4000.03,  aliquota: 0.12  },
  { limite: 7786.02,  aliquota: 0.14  },
];

const TETO_INSS = 7786.02;

/**
 * Calcula INSS pelo método progressivo (correto conforme Lei 13.135/2020)
 * @param {number} salarioBruto - Salário bruto do colaborador
 * @returns {{ desconto: number, aliquotaEfetiva: number, detalhamento: Array }}
 */
const calcularINSS = (salarioBruto) => {
  const base = Math.min(salarioBruto, TETO_INSS);
  let desconto = 0;
  let faixaAnterior = 0;
  const detalhamento = [];

  for (const faixa of TABELA_INSS_2024) {
    if (base <= faixaAnterior) break;
    const teto = Math.min(base, faixa.limite);
    const valorFaixa = (teto - faixaAnterior) * faixa.aliquota;
    desconto += valorFaixa;

    detalhamento.push({
      de: faixaAnterior,
      ate: teto,
      aliquota: faixa.aliquota * 100,
      valor: arredondar(valorFaixa),
    });

    faixaAnterior = faixa.limite;
    if (base <= faixa.limite) break;
  }

  desconto = arredondar(desconto);
  const aliquotaEfetiva = arredondar((desconto / salarioBruto) * 100);

  return { desconto, aliquotaEfetiva, detalhamento };
};

/**
 * Cálculo INSS para 13º salário (mesma tabela, base = valor do 13º)
 */
const calcularINSS13 = (valor13) => calcularINSS(valor13);

/**
 * Cálculo INSS para férias (base = salário + 1/3)
 * Férias seguem a tabela normal
 */
const calcularINSSFerias = (salarioFerias) => calcularINSS(salarioFerias);

/**
 * INSS parte empresa:
 * - 20% sobre remuneração total (contribuição patronal)
 * - 1 a 3% de RAT (Risco de Acidente de Trabalho) - usamos 2% como default
 * - Terceiros: varia por CNAE (usamos 5.8% como referência média)
 */
const calcularINSSEmpresa = (salarioBruto, aliquotaRAT = 0.02, aliquotaTerceiros = 0.058) => {
  const contribuicaoPatronal = arredondar(salarioBruto * 0.20);
  const rat = arredondar(salarioBruto * aliquotaRAT);
  const terceiros = arredondar(salarioBruto * aliquotaTerceiros);
  const total = arredondar(contribuicaoPatronal + rat + terceiros);

  return {
    contribuicaoPatronal,
    rat,
    terceiros,
    total,
  };
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularINSS,
  calcularINSS13,
  calcularINSSFerias,
  calcularINSSEmpresa,
  TABELA_INSS_2024,
  TETO_INSS,
};
