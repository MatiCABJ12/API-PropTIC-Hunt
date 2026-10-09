import JuegoService from "../services/juego.service.js";

const getPartidas = async (req, res) => {
  res.json(await JuegoService.getPartidas());
};

const getMisiones = async (req, res) => {
  res.json(await JuegoService.getMisiones());
};

const getParticipaciones = async (req, res) => {
  res.json(await JuegoService.getParticipaciones());
};

const getRealizaciones = async (req, res) => {
  res.json(await JuegoService.getRealizaciones());
};

export default { getPartidas, getMisiones, getParticipaciones, getRealizaciones };