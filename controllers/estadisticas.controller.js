import EstadisticasService from "../services/estadisticas.service.js";

const getPuntos = async (req, res) => {
  res.json(await EstadisticasService.getPuntos(req.usuario.id_usuario));
};

const getPartidas = async (req, res) => {
  res.json(await EstadisticasService.getPartidas(req.usuario.id_usuario));
};

export default { getPuntos, getPartidas };