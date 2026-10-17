import pool from "../db.js";

const getPartidas = async () => {
  const { rows } = await pool.query("SELECT * FROM partida");
  return rows;
};

const guardarLogs = async (client, idPartida, idUsuario, datos) => {
  if (datos.disparos.length > 0) {
    await client.query(
      `INSERT INTO log_disparo_cazador
         (impacto_exitoso, vida_restante, linterna_activa, fase_timbre_sonando,
          segundo_partida, id_partida, id_usuario)
       SELECT x.impacto_exitoso, x.vida_restante, false, x.fase_timbre_sonando,
              x.segundo_partida, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         impacto_exitoso boolean, vida_restante int,
         fase_timbre_sonando boolean, segundo_partida int)`,
      [JSON.stringify(datos.disparos), idPartida, idUsuario]
    );
  }

  if (datos.ruidos.length > 0) {
    await client.query(
      `INSERT INTO log_mecanica_ruido
         (sospecha_generada, segundo_partida, id_partida, id_usuario)
       SELECT x.sospecha_generada, x.segundo_partida, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         sospecha_generada int, segundo_partida int)`,
      [JSON.stringify(datos.ruidos), idPartida, idUsuario]
    );
  }

  if (datos.habilidades.length > 0) {
    await client.query(
      `INSERT INTO log_uso_habilidad
         (nombre_habilidad, fue_exitosa, momento_uso, id_partida, id_usuario)
       SELECT x.nombre_habilidad, x.fue_exitosa, x.momento_uso, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         nombre_habilidad text, fue_exitosa boolean, momento_uso int)`,
      [JSON.stringify(datos.habilidades), idPartida, idUsuario]
    );
  }

  if (datos.props.length > 0) {
    await client.query(
      `INSERT INTO log_uso_prop
         (nombre_objeto, tiempo_transformado, fue_atrapado, id_partida, id_usuario)
       SELECT x.nombre_objeto, x.tiempo_transformado, x.fue_atrapado, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         nombre_objeto text, tiempo_transformado int, fue_atrapado boolean)`,
      [JSON.stringify(datos.props), idPartida, idUsuario]
    );
  }

  if (datos.progreso_misiones.length > 0) {
    await client.query(
      `INSERT INTO log_progreso_mision
         (progreso, segundo_partida, id_mision, id_partida, id_usuario)
       SELECT x.progreso, x.segundo_partida, x.id_mision, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         progreso text, segundo_partida int, id_mision int)`,
      [JSON.stringify(datos.progreso_misiones), idPartida, idUsuario]
    );
  }

  if (datos.abandonos.length > 0) {
    await client.query(
      `INSERT INTO log_abandono
         (tiempo_transcurrido, rol_actual, nivel_sospecha_actual,
          vida_cazador_actual, id_partida, id_usuario)
       SELECT x.tiempo_transcurrido, x.rol_actual, x.nivel_sospecha_actual,
              x.vida_cazador_actual, $2::int, $3::int
       FROM json_to_recordset($1::json) AS x(
         tiempo_transcurrido int, rol_actual text,
         nivel_sospecha_actual int, vida_cazador_actual int)`,
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
        datos.puntos_obtenidos,
        datos.resultado,
        idUsuario,
        idPartida,
        datos.disparos_acertados,
        datos.disparos_totales,
        datos.silbidos,
        datos.tiempo_sobrevivido,
      ]
    );

    await client.query(
      "UPDATE usuario SET puntos_totales = puntos_totales + $1 WHERE id_usuario = $2",
      [datos.puntos_obtenidos, idUsuario]
    );

    await guardarLogs(client, idPartida, idUsuario, datos);

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