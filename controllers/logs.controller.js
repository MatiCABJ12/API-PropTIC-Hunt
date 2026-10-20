import LogsService from "../services/logs.service.js";

// Todos devuelven solo los logs del jugador que hizo el pedido (sale del token)
const getAbandono = async (req, res) => {
  res.json(await LogsService.getAbandono(req.usuario.id_usuario));
};

const getDisparoCazador = async (req, res) => {
  res.json(await LogsService.getDisparoCazador(req.usuario.id_usuario));
};

const getUsoHabilidad = async (req, res) => {
  res.json(await LogsService.getUsoHabilidad(req.usuario.id_usuario));
};

export default {
  getAbandono,
  getDisparoCazador,
  getUsoHabilidad,
};