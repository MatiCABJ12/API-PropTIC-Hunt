import pool from "../db.js";

const getPartidas = async () => {
  const { rows } = await pool.query("SELECT * FROM partida");
  return rows;
};

const getMisiones = async () => {
  const { rows } = await pool.query("SELECT * FROM mision");
  return rows;
};

const getParticipaciones = async () => {
  const { rows } = await pool.query("SELECT * FROM participa");
  return rows;
};

const getRealizaciones = async () => {
  const { rows } = await pool.query("SELECT * FROM realiza");
  return rows;
};

export default { getPartidas, getMisiones, getParticipaciones, getRealizaciones };