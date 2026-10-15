import JuegoService from "../services/juego.service.js";
import UsuarioService from "../services/usuario.service.js";

const ROLES = ["Cazador", "Prop"];
const RESULTADOS = ["Victoria", "Derrota"];
const CAMPOS_OPCIONALES = [
  "disparos_acertados",
  "disparos_totales",
  "silbidos",
  "tiempo_sobrevivido",
];

const esEnteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0;

const validarParticipante = (p, duracion) => {
  if (typeof p !== "object" || p === null) {
    return "Cada participante tiene que ser un objeto";
  }
  if (typeof p.nombre !== "string" || p.nombre.trim() === "") {
    return "Cada participante necesita un nombre";
  }
  if (!ROLES.includes(p.rol)) {
    return `${p.nombre}: el rol tiene que ser Cazador o Prop`;
  }
  if (!RESULTADOS.includes(p.resultado)) {
    return `${p.nombre}: el resultado tiene que ser Victoria o Derrota`;
  }
  if (!esEnteroNoNegativo(p.puntos_obtenidos)) {
    return `${p.nombre}: puntos_obtenidos tiene que ser un número entero mayor o igual a 0`;
  }

  for (const campo of CAMPOS_OPCIONALES) {
    if (p[campo] !== undefined && !esEnteroNoNegativo(p[campo])) {
      return `${p.nombre}: ${campo} tiene que ser un número entero mayor o igual a 0`;
    }
  }

  if ((p.disparos_acertados ?? 0) > (p.disparos_totales ?? 0)) {
    return `${p.nombre}: los disparos acertados no pueden superar a los totales`;
  }
  if ((p.tiempo_sobrevivido ?? 0) > duracion) {
    return `${p.nombre}: el tiempo sobrevivido no puede superar la duración de la partida`;
  }

  return null;
};

const getPartidas = async (req, res) => {
  res.json(await JuegoService.getPartidas());
};

const guardarPartida = async (req, res) => {
  const { duracion, participantes } = req.body || {};

  if (!esEnteroNoNegativo(duracion) || duracion === 0) {
    return res.status(400).json({
      message: "La duración tiene que ser un número entero de segundos mayor a 0",
    });
  }

  if (!Array.isArray(participantes) || participantes.length === 0) {
    return res.status(400).json({ message: "Faltan los participantes" });
  }

  for (const p of participantes) {
    const error = validarParticipante(p, duracion);
    if (error) {
      return res.status(400).json({ message: error });
    }
  }

  // Dejamos cada participante "limpio": los datos de un rol quedan en 0 para el otro
  const limpios = participantes.map((p) => ({
    nombre: p.nombre.trim(),
    rol: p.rol,
    resultado: p.resultado,
    puntos_obtenidos: p.puntos_obtenidos,
    disparos_acertados: p.rol === "Cazador" ? p.disparos_acertados ?? 0 : 0,
    disparos_totales: p.rol === "Cazador" ? p.disparos_totales ?? 0 : 0,
    silbidos: p.rol === "Prop" ? p.silbidos ?? 0 : 0,
    tiempo_sobrevivido: p.rol === "Prop" ? p.tiempo_sobrevivido ?? 0 : 0,
  }));

  const nombres = limpios.map((p) => p.nombre);

  if (new Set(nombres).size !== nombres.length) {
    return res
      .status(400)
      .json({ message: "Hay jugadores repetidos en la partida" });
  }

  // Buscamos a los jugadores por nombre de usuario
  const usuarios = await UsuarioService.buscarPorNombres(nombres);
  const faltantes = nombres.filter(
    (nombre) => !usuarios.some((u) => u.nombre === nombre)
  );

  if (faltantes.length > 0) {
    return res
      .status(404)
      .json({ message: `No existen estos jugadores: ${faltantes.join(", ")}` });
  }

  // Quien manda la partida tiene que ser uno de los jugadores
  if (!usuarios.some((u) => u.id_usuario === req.usuario.id_usuario)) {
    return res.status(403).json({
      message: "Solo un jugador de la partida puede guardar su resultado",
    });
  }

  const conId = limpios.map((p) => ({
    ...p,
    id_usuario: usuarios.find((u) => u.nombre === p.nombre).id_usuario,
  }));

  await JuegoService.guardarPartida(duracion, conId);

  res.status(201).json({
    message: "Partida guardada correctamente",
    cantidad_jugadores: conId.length,
  });
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

export default {
  getPartidas,
  guardarPartida,
  getMisiones,
  getParticipaciones,
  getRealizaciones,
};