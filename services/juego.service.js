import pool from "../db.js";

const getPartidas = async () => {
  const { rows } = await pool.query("SELECT * FROM partida");
  return rows;
};

// Guarda la partida, a cada jugador y suma sus puntos, todo junto:
// si algo falla, no se guarda nada (ROLLBACK)
const guardarPartida = async (duracion, participantes) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "INSERT INTO partida (duracion, fecha_hora) VALUES ($1, NOW() AT TIME ZONE 'UTC') RETURNING id_partida",
      [duracion]
    );
    const idPartida = rows[0].id_partida;

    for (const p of participantes) {
      await client.query(
        `INSERT INTO participa
           (rol, puntos_obtenidos, resultado, id_usuario, id_partida,
            disparos_acertados, disparos_totales, silbidos, tiempo_sobrevivido)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          p.rol,
          p.puntos_obtenidos,
          p.resultado,
          p.id_usuario,
          idPartida,
          p.disparos_acertados,
          p.disparos_totales,
          p.silbidos,
          p.tiempo_sobrevivido,
        ]
      );

      await client.query(
        "UPDATE usuario SET puntos_totales = puntos_totales + $1 WHERE id_usuario = $2",
        [p.puntos_obtenidos, p.id_usuario]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

export default {
  getPartidas,
  guardarPartida,
  getMisiones,
  getParticipaciones,
  getRealizaciones,
};