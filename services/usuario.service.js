import pool from "../db.js";

const crearUsuario = async (nombre, mail, contrasenaHasheada) => {
  const { rows } = await pool.query(
    "INSERT INTO usuario (nombre, mail, contrasena, puntos_totales) VALUES ($1, $2, $3, 0) RETURNING nombre, mail, puntos_totales",
    [nombre, mail, contrasenaHasheada]
  );
  return rows[0];
};

const buscarPorMail = async (mail) => {
  const { rows } = await pool.query(
    "SELECT id_usuario, nombre, mail, contrasena, puntos_totales FROM usuario WHERE mail = $1",
    [mail]
  );
  return rows[0];
};

const guardarTokenRecuperacion = async (idUsuario, token) => {
  await pool.query(
    `UPDATE usuario
     SET token_recuperacion = $1,
         token_expiracion = NOW() + INTERVAL '15 minutes'
     WHERE id_usuario = $2`,
    [token, idUsuario]
  );
};

const buscarPorTokenRecuperacion = async (token) => {
  const { rows } = await pool.query(
    "SELECT id_usuario FROM usuario WHERE token_recuperacion = $1 AND token_expiracion > NOW()",
    [token]
  );
  return rows[0];
};

const actualizarContrasena = async (idUsuario, contrasenaHasheada) => {
  await pool.query(
    "UPDATE usuario SET contrasena = $1, token_recuperacion = NULL, token_expiracion = NULL WHERE id_usuario = $2",
    [contrasenaHasheada, idUsuario]
  );
};

const getUsuarios = async () => {
  const { rows } = await pool.query(
    "SELECT id_usuario, nombre, mail, puntos_totales FROM usuario"
  );
  return rows;
};

const deleteUsuario = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre",
    [id]
  );
  return rows[0];
};

export default {
  crearUsuario,
  buscarPorMail,
  guardarTokenRecuperacion,
  buscarPorTokenRecuperacion,
  actualizarContrasena,
  getUsuarios,
  deleteUsuario,
};