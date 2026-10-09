import LogsService from "../services/logs.service.js";

const getAbandono = async (req, res) => {
  res.json(await LogsService.getAbandono());
};

const getDisparoCazador = async (req, res) => {
  res.json(await LogsService.getDisparoCazador());
};

const getMecanicaRuido = async (req, res) => {
  res.json(await LogsService.getMecanicaRuido());
};

const getProgresoMision = async (req, res) => {
  res.json(await LogsService.getProgresoMision());
};

const getUsoHabilidad = async (req, res) => {
  res.json(await LogsService.getUsoHabilidad());
};

const getUsoProp = async (req, res) => {
  res.json(await LogsService.getUsoProp());
};

export default {
  getAbandono,
  getDisparoCazador,
  getMecanicaRuido,
  getProgresoMision,
  getUsoHabilidad,
  getUsoProp,
};