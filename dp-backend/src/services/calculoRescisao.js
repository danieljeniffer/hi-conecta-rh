/**
 * Serviço de Cálculo de Rescisão Contratual
 * CLT Art. 477-500 e legislação complementar
 * Lei 13.467/2017 (Reforma Trabalhista)
 *
 * Tipos:
 * - Pedido_Demissao: sem multa FGTS, sem aviso indenizado pela empresa
 * - Sem_Justa_Causa: aviso indenizado + multa 40% FGTS
 * - Justa_Causa: saldo salário + férias vencidas apenas
 * - Acordo_Mutuo: metade do aviso + multa 20% FGTS (art. 484-A CLT)
 * - Termino_Contrato: saldo + férias prop + 13º prop (sem multa FGTS para contrato de prazo determinado)
 */

const { calcularFeriasProporcionais } = require('./calculoFerias');
const { calcular13Rescisao } = require('./calculoDecimoTerceiro');
const { calcularMultaFGTS, estimarSaldoFGTS } = require('./calculoFGTS');
const { calcularINSS } = require('./calculoINSS');
const { calcularIRRFRescisao } = require('./calculoIRRF');

/**
 * Calcula aviso prévio proporcional (art. 487 CLT + Lei 12.506/2011)
 * 30 dias + 3 dias por ano de serviço, máximo 90 dias
 * @param {number} anosServico
 */
const calcularAvisoPrevio = (anosServico) => {
  const diasBase = 30;
  const diasAdicionais = Math.min(anosServico * 3, 60);
  return diasBase + diasAdicionais;
};

/**
 * Calcula saldo de salário (dias trabalhados no mês da rescisão)
 * @param {number} salarioBase
 * @param {Date|string} dataDesligamento
 */
const calcularSaldoSalario = (salarioBase, dataDesligamento) => {
  const data = new Date(dataDesligamento);
  const diasTrabalhados = data.getDate();
  const valorDiario = salarioBase / 30;
  return arredondar(valorDiario * diasTrabalhados);
};

/**
 * Cálculo completo da rescisão
 * @param {object} params
 */
const calcularRescisao = ({
  tipo,
  salarioBase,
  dataAdmissao,
  dataDesligamento,
  qtdDependentes = 0,
  saldoFGTS = null,
  diasFeriasVencidas = 0,
  mesesPeriodoAtual = null,
  outrosCreditos = 0,
  outrasDeducoes = 0,
}) => {
  const admissao = new Date(dataAdmissao);
  const desligamento = new Date(dataDesligamento);

  // Tempo de serviço
  const diffMs = desligamento - admissao;
  const totalDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const anosCompletos = Math.floor(totalDias / 365);
  const mesesRestantes = Math.floor((totalDias % 365) / 30);
  const diasAvisoPrevio = calcularAvisoPrevio(anosCompletos);

  // Meses no período aquisitivo atual (para férias proporcionais)
  const mesDesligamento = desligamento.getMonth() + 1;
  const anoDesligamento = desligamento.getFullYear();
  const mesAdmissaoMesmoAno = admissao.getMonth() + 1;
  const mesesPeriodo = mesesPeriodoAtual !== null
    ? mesesPeriodoAtual
    : ((anoDesligamento - admissao.getFullYear()) * 12 + mesDesligamento - mesAdmissaoMesmoAno) % 12 || 12;

  // Meses no ano para 13º
  const meses13 = mesDesligamento;
  const valorSaldoSalario = calcularSaldoSalario(salarioBase, dataDesligamento);
  const feriasProporcionais = calcularFeriasProporcionais(salarioBase, Math.min(mesesPeriodo, 11));
  const decimoTerceiro = calcular13Rescisao(salarioBase, meses13);
  const saldoFGTSCalc = saldoFGTS !== null ? saldoFGTS : estimarSaldoFGTS(salarioBase, anosCompletos * 12 + mesesRestantes);

  let resultado = {
    tipo,
    anosServico: anosCompletos,
    mesesServico: mesesRestantes,
    diasAvisoPrevio,
    saldoSalario: 0,
    avisoPrevioIndenizado: 0,
    feriasProporcionais: 0,
    feriasVencidas: 0,
    umTercoFerias: 0,
    decimoTerceiroProporcional: 0,
    saldoFGTS: saldoFGTSCalc,
    multaFGTS: 0,
    outrosCreditos,
    totalBruto: 0,
    inss: 0,
    irrf: 0,
    outrasDeducoes,
    totalDescontos: 0,
    totalLiquido: 0,
    detalhamento: {},
  };

  switch (tipo) {
    case 'Sem_Justa_Causa':
      resultado.saldoSalario = valorSaldoSalario;
      resultado.avisoPrevioIndenizado = arredondar((salarioBase / 30) * diasAvisoPrevio);
      resultado.feriasProporcionais = feriasProporcionais.valorFerias;
      resultado.feriasVencidas = arredondar((salarioBase / 30) * diasFeriasVencidas);
      resultado.umTercoFerias = arredondar((resultado.feriasProporcionais + resultado.feriasVencidas) / 3);
      resultado.decimoTerceiroProporcional = decimoTerceiro.valor;
      resultado.multaFGTS = calcularMultaFGTS(saldoFGTSCalc, tipo).multa;
      break;

    case 'Pedido_Demissao':
      resultado.saldoSalario = valorSaldoSalario;
      // Colaborador não recebe aviso indenizado; pode dever aviso à empresa (desconto)
      resultado.feriasProporcionais = feriasProporcionais.valorFerias;
      resultado.feriasVencidas = arredondar((salarioBase / 30) * diasFeriasVencidas);
      resultado.umTercoFerias = arredondar((resultado.feriasProporcionais + resultado.feriasVencidas) / 3);
      resultado.decimoTerceiroProporcional = decimoTerceiro.valor;
      resultado.multaFGTS = 0;
      break;

    case 'Justa_Causa':
      resultado.saldoSalario = valorSaldoSalario;
      // Justa causa: só saldo de salário e férias VENCIDAS (não proporcionais se < 12 meses)
      resultado.feriasVencidas = arredondar((salarioBase / 30) * diasFeriasVencidas);
      resultado.umTercoFerias = diasFeriasVencidas > 0 ? arredondar(resultado.feriasVencidas / 3) : 0;
      resultado.decimoTerceiroProporcional = 0;
      resultado.multaFGTS = 0;
      break;

    case 'Acordo_Mutuo':
      resultado.saldoSalario = valorSaldoSalario;
      resultado.avisoPrevioIndenizado = arredondar(((salarioBase / 30) * diasAvisoPrevio) / 2);
      resultado.feriasProporcionais = feriasProporcionais.valorFerias;
      resultado.feriasVencidas = arredondar((salarioBase / 30) * diasFeriasVencidas);
      resultado.umTercoFerias = arredondar((resultado.feriasProporcionais + resultado.feriasVencidas) / 3);
      resultado.decimoTerceiroProporcional = decimoTerceiro.valor;
      resultado.multaFGTS = calcularMultaFGTS(saldoFGTSCalc, tipo).multa;
      break;

    case 'Termino_Contrato':
      resultado.saldoSalario = valorSaldoSalario;
      resultado.feriasProporcionais = feriasProporcionais.valorFerias;
      resultado.feriasVencidas = arredondar((salarioBase / 30) * diasFeriasVencidas);
      resultado.umTercoFerias = arredondar((resultado.feriasProporcionais + resultado.feriasVencidas) / 3);
      resultado.decimoTerceiroProporcional = decimoTerceiro.valor;
      resultado.multaFGTS = 0;
      break;
  }

  // Total bruto tributável (INSS e IRRF incidem sobre: saldo + aviso + 13º prop; não sobre multa FGTS, férias > 12 meses)
  const baseTributavel = arredondar(
    resultado.saldoSalario +
    resultado.avisoPrevioIndenizado +
    resultado.decimoTerceiroProporcional
  );

  const baseFeriasRescisao = arredondar(
    resultado.feriasProporcionais +
    resultado.feriasVencidas +
    resultado.umTercoFerias
  );

  resultado.totalBruto = arredondar(
    baseTributavel + baseFeriasRescisao + resultado.multaFGTS + outrosCreditos
  );

  // Descontos
  if (baseTributavel > 0) {
    const { desconto: inss } = calcularINSS(baseTributavel);
    const { desconto: irrf } = calcularIRRFRescisao(baseTributavel, inss, qtdDependentes);
    resultado.inss = inss;
    resultado.irrf = irrf;
  }

  resultado.totalDescontos = arredondar(resultado.inss + resultado.irrf + outrasDeducoes);
  resultado.totalLiquido = arredondar(resultado.totalBruto - resultado.totalDescontos);

  resultado.detalhamento = {
    prazoRescisao: calcularPrazoRescisao(tipo, diasAvisoPrevio, dataDesligamento),
    baseTributavel,
    baseFeriasRescisao,
    diasAvisoPrevio,
    meses13,
    mesesFeriasProporcionais: mesesPeriodo,
  };

  return resultado;
};

const calcularPrazoRescisao = (tipo, diasAviso, dataDesligamento) => {
  const data = new Date(dataDesligamento);
  let prazo;

  if (['Sem_Justa_Causa', 'Acordo_Mutuo'].includes(tipo)) {
    prazo = new Date(data);
    prazo.setDate(prazo.getDate() + 10);
  } else {
    prazo = new Date(data);
    prazo.setDate(prazo.getDate() + 10);
  }

  return prazo.toISOString().split('T')[0];
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

module.exports = {
  calcularRescisao,
  calcularAvisoPrevio,
  calcularSaldoSalario,
  calcularPrazoRescisao,
};
