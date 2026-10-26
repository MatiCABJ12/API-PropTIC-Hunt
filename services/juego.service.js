import pool from "../db.js";
import estadisticasService from "./estadisticas.service.js";

const getPartidas = async () => {
  const { rows } = await pool.query("SELECT * FROM partida");
  return rows;
};

const guardarLogs = async (client, idPartida, idUsuario, datos) => {
  if (datos.disparos.length > 0) {
    await client.query(
      `INSERT INTO log_disparo_cazador
         (impacto_exitoso, vida_restante, fase_timbre_sonando,
          segundo_partida, id_partida, id_usuario)
       SELECT x.impacto_exitoso, x.vida_restante, x.fase_timbre_sonando,
              x.segundo_partida, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         impacto_exitoso boolean, vida_restante int,
         fase_timbre_sonando boolean, segundo_partida int)`,
      [JSON.stringify(datos.disparos), idPartida, idUsuario]
    );
  }

  if (datos.habilidades.length > 0) {
    await client.query(
      `INSERT INTO log_uso_habilidad
         (nombre_habilidad, momento_uso, id_partida, id_usuario)
       SELECT x.nombre_habilidad, x.momento_uso, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         nombre_habilidad text, momento_uso int)`,
      [JSON.stringify(datos.habilidades), idPartida, idUsuario]
    );
  }

    if (datos.abandonos.length > 0) {
    await client.query(
      `INSERT INTO log_abandono
         (tiempo_transcurrido, rol_actual,
          vida_cazador_actual, id_partida, id_usuario)
       SELECT x.tiempo_transcurrido, x.rol_actual,
              x.vida_cazador_actual, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         tiempo_transcurrido int, rol_actual text,
         vida_cazador_actual int)`,
      [JSON.stringify(datos.abandonos), idPartida, idUsuario]
    );
  }
};

const guardarPartida = async (idUsuario, datos) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO partida (codigo, duracion, fecha_hora)
       VALUES ($1, $2, NOW() AT TIME ZONE 'UTC')
       ON CONFLICT (codigo) DO UPDATE
         SET duracion = GREATEST(partida.duracion, EXCLUDED.duracion)
       RETURNING id_partida`,
      [datos.codigo_partida, datos.duracion]
    );
    const idPartida = rows[0].id_partida;

    await client.query(
      `INSERT INTO participa
         (rol, puntos_obtenidos, resultado, id_usuario, id_partida,
          disparos_acertados, disparos_totales, silbidos, tiempo_sobrevivido)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        datos.rol,
        0,
        datos.resultado,
        idUsuario,
        idPartida,
        datos.disparos_acertados,
        datos.disparos_totales,
        datos.silbidos,
        datos.tiempo_sobrevivido,
      ]
    );

    await guardarLogs(client, idPartida, idUsuario, datos);

    const misiones = await estadisticasService.calcularMisiones(idUsuario, client);
    const cumplidas = misiones.filter((m) => m.completada);
    let misionesNuevas = [];

    if (cumplidas.length > 0) {
      const { rows: insertadas } = await client.query(
        `INSERT INTO usuario_mision (id_usuario, id_mision)
         SELECT $1::int, UNNEST($2::int[])
         ON CONFLICT DO NOTHING
         RETURNING id_mision`,
        [idUsuario, cumplidas.map((m) => m.id_mision)]
      );

      misionesNuevas = cumplidas.filter((m) =>
        insertadas.some((i) => i.id_mision === m.id_mision)
      );
    }

    const premio = misionesNuevas.reduce((total, m) => total + m.recompensa, 0);

    await client.query(
      "UPDATE participa SET puntos_obtenidos = $1 WHERE id_partida = $2 AND id_usuario = $3",
      [premio, idPartida, idUsuario]
    );

    if (premio > 0) {
      await client.query(
        "UPDATE usuario SET puntos_totales = puntos_totales + $1 WHERE id_usuario = $2",
        [premio, idUsuario]
      );
    }

    await client.query("COMMIT");
    return misionesNuevas.map(({ id_mision, ...resto }) => resto);
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