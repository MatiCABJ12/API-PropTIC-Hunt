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

  const partes = [];
  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}m`);
  if (segundos > 0) partes.push(`${segundos}s`);

  return partes.length > 0 ? partes.join(" ") : "0s";
};

const porcentaje = (parte, total) =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

const getPartidas = async (idUsuario) => {
  const { rows } = await pool.query(
    `SELECT
       partida.id_partida,
       partida.duracion,
       to_char(partida.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires', 'DD/MM/YYYY') AS fecha,
       to_char(partida.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires', 'HH24:MI') AS hora,
       participa.rol,
       participa.resultado,
       participa.puntos_obtenidos,
       participa.disparos_acertados,
       participa.disparos_totales,
       participa.silbidos,
       participa.tiempo_sobrevivido,
       (SELECT COUNT(*) FROM participa otros
         WHERE otros.id_partida = partida.id_partida)::int AS cantidad_jugadores,
       (SELECT COUNT(*) FROM participa otros
         WHERE otros.id_partida = partida.id_partida
           AND otros.puntos_obtenidos > participa.puntos_obtenidos)::int + 1 AS puesto
     FROM participa
     JOIN partida ON participa.id_partida = partida.id_partida
     WHERE participa.id_usuario = $1
     ORDER BY partida.fecha_hora DESC, partida.id_partida DESC`,
    [idUsuario]
  );

  return rows.map((p) => {
    const partida = {
      rol: p.rol,
      resultado: p.resultado,
      puntos_obtenidos: p.puntos_obtenidos,
      fecha: p.fecha,
      hora: p.hora,
      duracion_formateada: formatearDuracion(p.duracion),
      cantidad_jugadores: p.cantidad_jugadores,
      puesto: p.puesto,
    };

    if (p.rol === "Cazador") {
      partida.disparos_acertados = p.disparos_acertados;
      partida.disparos_totales = p.disparos_totales;
      partida.precision_disparos = porcentaje(p.disparos_acertados, p.disparos_totales);
    } else if (p.rol === "Prop") {
      partida.silbidos = p.silbidos;
      partida.tiempo_sobrevivido = formatearDuracion(p.tiempo_sobrevivido);
    }

    return partida;
  });
};

const getResumen = async (idUsuario) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS partidas_jugadas,
       COUNT(*) FILTER (WHERE participa.resultado = 'Victoria')::int AS victorias,
       COUNT(*) FILTER (WHERE participa.resultado = 'Derrota')::int AS derrotas,
       COUNT(*) FILTER (WHERE participa.rol = 'Cazador')::int AS partidas_cazador,
       COUNT(*) FILTER (WHERE participa.rol = 'Cazador' AND participa.resultado = 'Victoria')::int AS victorias_cazador,
       COUNT(*) FILTER (WHERE participa.rol = 'Prop')::int AS partidas_prop,
       COUNT(*) FILTER (WHERE participa.rol = 'Prop' AND participa.resultado = 'Victoria')::int AS victorias_prop,
       COALESCE(SUM(partida.duracion), 0)::int AS tiempo_total,
       COALESCE(ROUND(AVG(partida.duracion)), 0)::int AS duracion_promedio
     FROM participa
     JOIN partida ON participa.id_partida = partida.id_partida
     WHERE participa.id_usuario = $1`,
    [idUsuario]
  );
  const r = rows[0];

  const resultados = await pool.query(
    `SELECT participa.resultado
     FROM participa
     JOIN partida ON participa.id_partida = partida.id_partida
     WHERE participa.id_usuario = $1
     ORDER BY partida.fecha_hora ASC, partida.id_partida ASC`,
    [idUsuario]
  );

  let rachaActual = 0;
  let mejorRacha = 0;

  for (const fila of resultados.rows) {
    if (fila.resultado === "Victoria") {
      rachaActual++;
      if (rachaActual > mejorRacha) mejorRacha = rachaActual;
    } else {
      rachaActual = 0;
    }
  }

  let rolMasJugado = "Ninguno";
  if (r.partidas_cazador > r.partidas_prop) rolMasJugado = "Cazador";
  else if (r.partidas_prop > r.partidas_cazador) rolMasJugado = "Prop";
  else if (r.partidas_jugadas > 0) rolMasJugado = "Ambos";

  return {
    partidas_jugadas: r.partidas_jugadas,
    victorias: r.victorias,
    derrotas: r.derrotas,
    porcentaje_victorias: porcentaje(r.victorias, r.partidas_jugadas),
    porcentaje_victorias_cazador: porcentaje(r.victorias_cazador, r.partidas_cazador),
    porcentaje_victorias_prop: porcentaje(r.victorias_prop, r.partidas_prop),
    rol_mas_jugado: rolMasJugado,
    tiempo_total: formatearDuracion(r.tiempo_total),
    duracion_promedio: formatearDuracion(r.duracion_promedio),
    racha_actual: rachaActual,
    mejor_racha: mejorRacha,
  };
};

const calcularMisiones = async (idUsuario, db) => {
  const { rows: misiones } = await db.query(
    "SELECT id_mision, descripcion, recompensa, tipo, objetivo FROM mision ORDER BY id_mision"
  );

  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS partidas_jugadas,
       COUNT(*) FILTER (WHERE resultado = 'Victoria')::int AS victorias,
       COUNT(*) FILTER (WHERE resultado = 'Victoria' AND rol = 'Prop')::int AS victorias_prop,
       COUNT(*) FILTER (WHERE resultado = 'Victoria' AND rol = 'Cazador')::int AS victorias_cazador,
       COALESCE(MAX(tiempo_sobrevivido), 0)::int AS mejor_tiempo_sobrevivido,
       COALESCE(MAX(disparos_acertados), 0)::int AS mejor_disparos_acertados,
       COALESCE(MAX(silbidos), 0)::int AS mejor_silbidos
     FROM participa
     WHERE id_usuario = $1`,
    [idUsuario]
  );
  const partidas = rows[0];

  const timbre = await db.query(
    `SELECT COALESCE(MAX(cantidad), 0)::int AS mejor
     FROM (
       SELECT COUNT(*) AS cantidad
       FROM log_disparo_cazador
       WHERE id_usuario = $1 AND impacto_exitoso AND fase_timbre_sonando
       GROUP BY id_partida
     ) por_partida`,
    [idUsuario]
  );

  const habilidades = await db.query(
    `SELECT COALESCE(MAX(cantidad), 0)::int AS mejor
     FROM (
       SELECT COUNT(*) AS cantidad
       FROM log_uso_habilidad
       WHERE id_usuario = $1
       GROUP BY id_partida
     ) por_partida`,
    [idUsuario]
  );

  const medidas = {
    partidas_jugadas: partidas.partidas_jugadas,
    victorias: partidas.victorias,
    victorias_prop: partidas.victorias_prop,
    victorias_cazador: partidas.victorias_cazador,
    tiempo_sobrevivido: partidas.mejor_tiempo_sobrevivido,
    disparos_acertados_partida: partidas.mejor_disparos_acertados,
    silbidos_partida: partidas.mejor_silbidos,
    disparos_timbre_partida: timbre.rows[0].mejor,
    habilidades_partida: habilidades.rows[0].mejor,
  };

  return misiones.map((mision) => {
    const objetivo = mision.objetivo ?? 0;
    const progreso = Math.min(medidas[mision.tipo] ?? 0, objetivo);

    const progresoTexto =
      mision.tipo === "tiempo_sobrevivido"
        ? `${formatearDuracion(progreso)} / ${formatearDuracion(objetivo)}`
        : `${progreso} / ${objetivo}`;

    return {
      id_mision: mision.id_mision,
      descripcion: mision.descripcion,
      recompensa: mision.recompensa,
      progreso_texto: progresoTexto,
      porcentaje: porcentaje(progreso, objetivo),
      completada: objetivo > 0 && progreso >= objetivo,
    };
  });
};

const getMisiones = async (idUsuario) => {
  const misiones = await calcularMisiones(idUsuario, pool);
  return misiones.map(({ id_mision, ...resto }) => resto);
};

export default { getPuntos, getPartidas, getResumen, getMisiones, calcularMisiones };