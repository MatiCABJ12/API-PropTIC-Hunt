import pool from "../db.js";

const getPuntos = async (idUsuario) => {
  const { rows } = await pool.query(
    "SELECT puntos_totales FROM usuario WHERE id_usuario = $1",
    [idUsuario]
  );
  return rows[0];
};

const formatearDuracion = (segundosTotales) => {
  const horas = Math.floor(segundosTotales / 3600);
  const minutos = Math.floor((segundosTotales % 3600) / 60);
  const segundos = segundosTotales % 60;
  return `${horas}h ${minutos}m ${segundos}s`;
};

const getPartidas = async (idUsuario) => {
  const { rows } = await pool.query(
    `SELECT partida.id_partida, partida.duracion, partida.fecha_hora,
            participa.rol, participa.puntos_obtenidos, participa.resultado
     FROM participa
     JOIN partida ON participa.id_partida = partida.id_partida
     WHERE participa.id_usuario = $1
     ORDER BY partida.fecha_hora DESC`,
    [idUsuario]
  );

  return rows.map((partida) => ({
    id_partida: partida.id_partida,
    rol: partida.rol,
    resultado: partida.resultado,
    puntos_obtenidos: partida.puntos_obtenidos,
    fecha_hora: partida.fecha_hora,
    duracion_formateada: formatearDuracion(partida.duracion),
  }));
};

export default { getPuntos, getPartidas };