// =============================================
// VALIDATORS.JS — Validação de dados
// =============================================

const Validators = {
  cpf(cpf) {
    const c = String(cpf || '').replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
    let r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(c[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
    r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === parseInt(c[10]);
  },

  cnpj(cnpj) {
    const c = String(cnpj || '').replace(/\D/g, '');
    if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
    const calc = (c, n) => {
      let soma = 0, pos = n - 7;
      for (let i = n; i >= 1; i--) { soma += parseInt(c[n - i]) * pos--; if (pos < 2) pos = 9; }
      const r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(c, 12) === parseInt(c[12]) && calc(c, 13) === parseInt(c[13]);
  },

  email(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
  },

  telefone(v) {
    const d = String(v || '').replace(/\D/g, '');
    return d.length === 10 || d.length === 11;
  },

  requerido(v) {
    return v != null && String(v).trim() !== '';
  },

  minimo(v, min) {
    return Number(v) >= min;
  },

  maximo(v, max) {
    return Number(v) <= max;
  },

  faixaSalarial(min, max) {
    return Number(min) > 0 && Number(max) > 0 && Number(min) <= Number(max);
  },

  // Valida um formulário inteiro e retorna erros
  // campos = { nomeCampo: { valor, regras: ['requerido', 'email'] } }
  form(campos) {
    const erros = {};
    const msgs  = {
      requerido: 'Campo obrigatório',
      email:     'E-mail inválido',
      cpf:       'CPF inválido',
      telefone:  'Telefone inválido',
    };
    for (const [campo, { valor, regras }] of Object.entries(campos)) {
      for (const regra of (regras || [])) {
        const fn = Validators[regra];
        if (fn && !fn(valor)) {
          erros[campo] = msgs[regra] || `${campo} inválido`;
          break;
        }
      }
    }
    return { valido: Object.keys(erros).length === 0, erros };
  },
};
