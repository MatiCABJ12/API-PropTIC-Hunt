import LogsService from "../services/logs.service.js";

const getAbandono = async (req, res) => {
  res.json(await LogsService.getAbandono(req.usuario.id_usuario));
};

const getDisparoCazador = async (req, res) => {
  res.json(await LogsService.getDisparoCazador(req.usuario.id_usuario));
};

const getMecanicaRuido = async (req, res) => {
  res.json(await LogsService.getMecanicaRuido(req.usuario.id_usuario));
};

const getProgresoMision = async (req, res) => {
  res.json(await LogsService.getProgresoMision(req.usuario.id_usuario));
};

const getUsoHabilidad = async (req, res) => {
  res.json(await LogsService.getUsoHabilidad(req.usuario.id_usuario));
};

const getUsoProp = async (req, res) => {
  res.json(await LogsService.getUsoProp(req.usuario.id_usuario));
};

export default {
  getAbandono,
  getDisparoCazador,
  getMecanicaRuido,
  getProgresoMision,
  getUsoHabilidad,
  getUsoProp,
};