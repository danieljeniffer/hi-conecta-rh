'use strict';
const svc = require('./colaborador.service');
const { ok, created, noContent, paginated } = require('../../utils/response');

const listar = async (req, res, next) => {
  try {
    const { data, meta } = await svc.listar(req.user.empresa_id, req.query);
    return paginated(res, data, meta);
  } catch (err) { next(err); }
};

const buscar = async (req, res, next) => {
  try {
    const colab = await svc.buscarPorId(req.user.empresa_id, req.params.id);
    return ok(res, colab);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const colab = await svc.criar(req.user.empresa_id, req.body, req.user.id);
    return created(res, colab, 'Colaborador admitido com sucesso.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const colab = await svc.atualizar(req.user.empresa_id, req.params.id, req.body);
    return ok(res, colab, 'Colaborador atualizado.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const desligar = async (req, res, next) => {
  try {
    const colab = await svc.desligar(req.user.empresa_id, req.params.id, req.body);
    return ok(res, colab, 'Colaborador desligado.');
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    await svc.remover(req.user.empresa_id, req.params.id);
    return noContent(res);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const listarDependentes = async (req, res, next) => {
  try {
    const dep = await svc.listarDependentes(req.params.id);
    return ok(res, dep);
  } catch (err) { next(err); }
};

const criarDependente = async (req, res, next) => {
  try {
    const dep = await svc.criarDependente(req.params.id, req.body);
    return created(res, dep, 'Dependente cadastrado.');
  } catch (err) { next(err); }
};

const removerDependente = async (req, res, next) => {
  try {
    await svc.removerDependente(req.params.depId);
    return noContent(res);
  } catch (err) { next(err); }
};

const historicSalarial = async (req, res, next) => {
  try {
    const hist = await svc.historicSalarial(req.params.id);
    return ok(res, hist);
  } catch (err) { next(err); }
};

const kpis = async (req, res, next) => {
  try {
    const data = await svc.kpis(req.user.empresa_id);
    return ok(res, data, 'KPIs de colaboradores.');
  } catch (err) { next(err); }
};

module.exports = {
  listar, buscar, criar, atualizar, desligar, remover,
  listarDependentes, criarDependente, removerDependente,
  historicSalarial, kpis,
};
