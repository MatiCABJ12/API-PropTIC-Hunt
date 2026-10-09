import pool from "../db.js";

const getAbandono = async () => {
  const { rows } = await pool.query("SELECT * FROM log_abandono");
  return rows;
};

const getDisparoCazador = async () => {
  const { rows } = await pool.query("SELECT * FROM log_disparo_cazador");
  return rows;
};

const getMecanicaRuido = async () => {
  const { rows } = await pool.query("SELECT * FROM log_mecanica_ruido");
  return rows;
};

const getProgresoMision = async () => {
  const { rows } = await pool.query("SELECT * FROM log_progreso_mision");
  return rows;
};

const getUsoHabilidad = async () => {
  const { rows } = await pool.query("SELECT * FROM log_uso_habilidad");
  return rows;
};

const getUsoProp = async () => {
  const { rows } = await pool.query("SELECT * FROM log_uso_prop");
  return rows;
};

export default {
  getAbandono,
  getDisparoCazador,
  getMecanicaRuido,
  getProgresoMision,
  getUsoHabilidad,
  getUsoProp,
};