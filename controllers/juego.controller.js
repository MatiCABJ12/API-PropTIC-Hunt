import JuegoService from "../services/juego.service.js";

const ROLES = ["Cazador", "Prop"];
const RESULTADOS = ["Victoria", "Derrota"];
const CAMPOS_OPCIONALES = [
  "disparos_acertados",
  "disparos_totales",
  "silbidos",
  "tiempo_sobrevivido",
];
const MAX_EVENTOS = 500;

const LOGS = {
  disparos: {
    impacto_exitoso: "bool",
    vida_restante: "int",
    fase_timbre_sonando: "bool",
    segundo_partida: "int",
  },
  habilidades: { nombre_habilidad: "texto", momento_uso: "int" },
  abandonos: {
    tiempo_transcurrido: "int",
    rol_actual: "texto",
    nivel_sospecha_actual: "int",
    vida_cazador_actual: "int",
  },
};

const esEntero = (valor) => Number.isInteger(valor) && valor >= 0;
const esTexto = (valor) =>
  typeof valor === "string" && valor.trim() !== "" && valor.length <= 100;

const VALIDADORES = {
  int: esEntero,
  bool: (valor) => typeof valor === "boolean",
  texto: esTexto,
};

const DESCRIPCIONES = {
  int: "un número entero mayor o igual a 0",
  bool: "true o false",
  texto: "un texto de hasta 100 caracteres",
};

const validarLogs = (datos) => {
  for (const [nombre, campos] of Object.entries(LOGS)) {
    const eventos = datos[nombre];
    if (eventos === undefined) continue;

    if (!Array.isArray(eventos)) {
      return `${nombre} tiene que ser una lista`;
    }
    if (eventos.length > MAX_EVENTOS) {
      return `${nombre} tiene demasiados eventos (máximo ${MAX_EVENTOS})`;
    }

    for (const [i, evento] of eventos.entries()) {
      if (typeof evento !== "object" || evento === null) {
        return `${nombre}[${i}] tiene que ser un objeto`;
      }
      for (const [campo, tipo] of Object.entries(campos)) {
        if (!VALIDADORES[tipo](evento[campo])) {
          return `${nombre}[${i}].${campo} es inválido: se espera ${DESCRIPCIONES[tipo]}`;
        }
      }
      if (nombre === "abandonos" && !ROLES.includes(evento.rol_actual)) {
        return `${nombre}[${i}].rol_actual tiene que ser Cazador o Prop`;
      }
    }
  }

  if ((datos.abandonos ?? []).length > 1) {
    return "abandonos puede tener como máximo 1 elemento";
  }

  return null;
};

const validarPartida = (d) => {
  if (!esTexto(d.codigo_partida)) {
    return "Falta el codigo_partida (un texto de hasta 100 caracteres)";
  }
  if (!esEntero(d.duracion) || d.duracion === 0) {
    return "La duración tiene que ser un número entero de segundos mayor a 0";
  }
  if (!ROLES.includes(d.rol)) {
    return "El rol tiene que ser Cazador o Prop";
  }
  if (!RESULTADOS.includes(d.resultado)) {
    return "El resultado tiene que ser Victoria o Derrota";
  }

  for (const campo of CAMPOS_OPCIONALES) {
    if (d[campo] !== undefined && !esEntero(d[campo])) {
      return `${campo} tiene que ser un número entero mayor o igual a 0`;
    }
  }

  if ((d.disparos_acertados ?? 0) > (d.disparos_totales ?? 0)) {
    return "Los disparos acertados no pueden superar a los totales";
  }
  if ((d.tiempo_sobrevivido ?? 0) > d.duracion) {
    return "El tiempo sobrevivido no puede superar la duración de la partida";
  }

  const errorLogs = validarLogs(d);
  if (errorLogs) return errorLogs;

  if (d.rol === "Prop" && (d.disparos ?? []).length > 0) {
    return "Solo el Cazador puede mandar disparos";
  }

  return null;
};

const getPartidas = async (req, res) => {
  res.json(await JuegoService.getPartidas());
};

const guardarPartida = async (req, res) => {
  const datos = req.body || {};

  const error = validarPartida(datos);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const limpio = {
    codigo_partida: datos.codigo_partida.trim(),
    duracion: datos.duracion,
    rol: datos.rol,
    resultado: datos.resultado,
    disparos_acertados: datos.rol === "Cazador" ? datos.disparos_acertados ?? 0 : 0,
    disparos_totales: datos.rol === "Cazador" ? datos.disparos_totales ?? 0 : 0,
    silbidos: datos.rol === "Prop" ? datos.silbidos ?? 0 : 0,
    tiempo_sobrevivido: datos.rol === "Prop" ? datos.tiempo_sobrevivido ?? 0 : 0,
    disparos: datos.disparos ?? [],
    habilidades: datos.habilidades ?? [],
    abandonos: datos.abandonos ?? [],
  };

  const misionesCumplidas = await JuegoService.guardarPartida(req.usuario.id_usuario, limpio);

    res.status(201).json({
    message: "Partida guardada correctamente",
    misiones_cumplidas: misionesCumplidas,
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