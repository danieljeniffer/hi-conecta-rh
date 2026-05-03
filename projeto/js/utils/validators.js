// =============================================
// VALIDATORS.JS — Validação de dados
// CPF/CNPJ com dígito verificador + sequências
// =============================================

const Validators = {

  cpf(cpf) {
    const c = String(cpf ?? '').replace(/\D/g, '');
    if (c.length !== 11) return false;

    // Rejeita sequências de dígitos iguais: 111.111.111-11, 000.000.000-00, etc.
    if (/^(\d)\1{10}$/.test(c)) return false;

    // Primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
    let r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(c[9])) return false;

    // Segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
    r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === parseInt(c[10]);
  },

  cnpj(cnpj) {
    const c = String(cnpj ?? '').replace(/\D/g, '');
    if (c.length !== 14) return false;

    // Rejeita sequências: 00.000.000/0000-00, 11.111.111/1111-11, etc.
    if (/^(\d)\1{13}$/.test(c)) return false;

    const calcDigito = (base, n) => {
      let soma = 0;
      let pos  = n - 7;
      for (let i = n; i >= 1; i--) {
        soma += parseInt(base[n - i]) * pos--;
        if (pos < 2) pos = 9;
      }
      const r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };

    return (
      calcDigito(c, 12) === parseInt(c[12]) &&
      calcDigito(c, 13) === parseInt(c[13])
    );
  },

  email(v) {
    if (!v) return false;
    const str = String(v).trim().toLowerCase();
    // RFC 5322 simplificado — cobre 99% dos casos reais
    return /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(str);
  },

  telefone(v) {
    const d = String(v ?? '').replace(/\D/g, '');
    // Aceita 10 (fixo) ou 11 (celular com 9) dígitos
    if (d.length !== 10 && d.length !== 11) return false;
    // Rejeita sequências inválidas: 00000000000
    if (/^0+$/.test(d)) return false;
    return true;
  },

  requerido(v) {
    if (v == null) return false;
    return String(v).trim().length > 0;
  },

  minimo(v, min) {
    const n = parseFloat(v);
    return !isNaN(n) && n >= Number(min);
  },

  maximo(v, max) {
    const n = parseFloat(v);
    return !isNaN(n) && n <= Number(max);
  },

  // Comprimento de string
  minLen(v, min) {
    return String(v ?? '').trim().length >= Number(min);
  },

  maxLen(v, max) {
    return String(v ?? '').trim().length <= Number(max);
  },

  // Senha com mínimo de segurança: 8+ chars, 1 maiúscula, 1 número
  senha(v) {
    const s = String(v ?? '');
    return s.length >= 8 && /[A-Z]/.test(s) && /[0-9]/.test(s);
  },

  faixaSalarial(min, max) {
    const a = parseFloat(min), b = parseFloat(max);
    return !isNaN(a) && !isNaN(b) && a > 0 && b > 0 && a <= b;
  },

  /**
   * Valida formulário inteiro.
   * campos = {
   *   nomeCampo: { valor: 'joao@x.com', regras: ['requerido', 'email'] },
   *   salario:   { valor: 2500,         regras: ['requerido'], params: { minimo: 1320 } },
   * }
   * Retorna { valido: boolean, erros: { nomeCampo: 'mensagem' } }
   */
  form(campos) {
    const erros = {};

    const msgs = {
      requerido:     'Campo obrigatório',
      email:         'E-mail inválido',
      cpf:           'CPF inválido',
      cnpj:          'CNPJ inválido',
      telefone:      'Telefone inválido (10 ou 11 dígitos)',
      senha:         'Senha fraca: mín. 8 caracteres, 1 maiúscula, 1 número',
      faixaSalarial: 'Faixa salarial inválida',
    };

    for (const [campo, config] of Object.entries(campos)) {
      if (!config) continue;
      const { valor, regras = [], params = {} } = config;

      for (const regra of regras) {
        const fn = Validators[regra];
        if (typeof fn !== 'function') {
          console.warn(`[Validators] Regra desconhecida: "${regra}"`);
          continue;
        }

        // Regras com parâmetro adicional (minimo, maximo, minLen, maxLen)
        const param = params[regra];
        const valido = param != null ? fn(valor, param) : fn(valor);

        if (!valido) {
          erros[campo] = msgs[regra] || `${campo}: valor inválido`;
          break; // primeira regra que falhar por campo
        }
      }
    }

    return { valido: Object.keys(erros).length === 0, erros };
  },
};
