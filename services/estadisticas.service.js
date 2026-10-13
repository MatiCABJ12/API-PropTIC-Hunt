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

const porcentaje = (parte, total) =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

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

export default { getPuntos, getPartidas, getResumen };