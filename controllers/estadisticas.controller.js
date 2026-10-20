import EstadisticasService from "../services/estadisticas.service.js";

const getPuntos = async (req, res) => {
  res.json(await EstadisticasService.getPuntos(req.usuario.id_usuario));
};

const getPartidas = async (req, res) => {
  res.json(await EstadisticasService.getPartidas(req.usuario.id_usuario));
};

const getResumen = async (req, res) => {
  res.json(await EstadisticasService.getResumen(req.usuario.id_usuario));
};

const getMisiones = async (req, res) => {
  res.json(await EstadisticasService.getMisiones(req.usuario.id_usuario));
};

export default { getPuntos, getPartidas, getResumen, getMisiones };