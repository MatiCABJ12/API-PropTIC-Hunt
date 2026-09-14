const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id_usuario, nombre, mail, puntos_totales FROM usuario'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/partidas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM partida');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/misiones', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM mision');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/participaciones', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM participa');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/realizaciones', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM realiza');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-abandono', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_abandono');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-disparo-cazador', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_disparo_cazador');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-mecanica-ruido', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_mecanica_ruido');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-progreso-mision', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_progreso_mision');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-uso-habilidad', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_uso_habilidad');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-uso-prop', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_uso_prop');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});