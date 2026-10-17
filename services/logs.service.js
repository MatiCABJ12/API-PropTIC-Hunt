import pool from "../db.js";

const FECHA =
  "to_char(partida.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires', 'DD/MM/YYYY')";
const HORA =
  "to_char(partida.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires', 'HH24:MI')";

const consultar = async (tabla, columnas, orden, idUsuario, joinExtra = "") => {
  const { rows } = await pool.query(
    `SELECT ${FECHA} AS fecha, ${HORA} AS hora, ${columnas}
     FROM ${tabla} AS l
     JOIN partida ON l.id_partida = partida.id_partida
     ${joinExtra}
     WHERE l.id_usuario = $1
     ORDER BY partida.fecha_hora DESC, partida.id_partida DESC, ${orden}`,
    [idUsuario]
  );
  return rows;
};

const getAbandono = (idUsuario) =>
  consultar(
    "log_abandono",
    "l.tiempo_transcurrido, l.rol_actual, l.nivel_sospecha_actual, l.vida_cazador_actual",
    "l.id_abandono",
    idUsuario
  );

const getDisparoCazador = (idUsuario) =>
  consultar(
    "log_disparo_cazador",
    "l.segundo_partida, l.impacto_exitoso, l.vida_restante, l.fase_timbre_sonando",
    "l.segundo_partida",
    idUsuario
  );

const getMecanicaRuido = (idUsuario) =>
  consultar(
    "log_mecanica_ruido",
    "l.segundo_partida, l.sospecha_generada",
    "l.segundo_partida",
    idUsuario
  );

const getProgresoMision = (idUsuario) =>
  consultar(
    "log_progreso_mision",
    "mision.descripcion AS mision, l.progreso, l.segundo_partida",
    "l.segundo_partida",
    idUsuario,
    "JOIN mision ON l.id_mision = mision.id_mision"
  );

const getUsoHabilidad = (idUsuario) =>
  consultar(
    "log_uso_habilidad",
    "l.momento_uso, l.nombre_habilidad, l.fue_exitosa",
    "l.momento_uso",
    idUsuario
  );

const getUsoProp = (idUsuario) =>
  consultar(
    "log_uso_prop",
    "l.nombre_objeto, l.tiempo_transformado, l.fue_atrapado",
    "l.id_uso_prop",
    idUsuario
  );

export default {
  getAbandono,
  getDisparoCazador,
  getMecanicaRuido,
  getProgresoMision,
  getUsoHabilidad,
  getUsoProp,
};