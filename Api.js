const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verificarToken = require('./authMiddleware');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/usuarios', verificarToken, async (req, res) => {
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

app.get('/partidas', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM partida');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/misiones', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM mision');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/participaciones', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM participa');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/realizaciones', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM realiza');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-abandono', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_abandono');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-disparo-cazador', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_disparo_cazador');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-mecanica-ruido', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_mecanica_ruido');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-progreso-mision', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_progreso_mision');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-uso-habilidad', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_uso_habilidad');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/log-uso-prop', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM log_uso_prop');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/registro', async (req, res) => {
  try {
    const { nombre, mail, contrasena } = req.body;
    if (!nombre || !mail || !contrasena) {
      return res.status(400).json({ error: 'Faltan datos: nombre, mail y contrasena son obligatorios' });
    }

    const contrasenaHasheada = await bcrypt.hash(contrasena, 10);
    const resultado = await pool.query(
      'INSERT INTO usuario (nombre, mail, contrasena, puntos_totales) VALUES ($1, $2, $3, 0) RETURNING id_usuario, nombre, mail, puntos_totales',
      [nombre, mail, contrasenaHasheada]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese mail o nombre de usuario ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No existe un usuario con ese id' });
    }

    res.json({ mensaje: 'Usuario eliminado', usuario: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { mail, contrasena } = req.body;

    if (!mail || !contrasena) {
      return res.status(400).json({ error: 'Faltan datos: mail y contrasena son obligatorios' });
    }

    const resultado = await pool.query(
      'SELECT id_usuario, nombre, mail, contrasena, puntos_totales FROM usuario WHERE mail = $1',
      [mail]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Mail o contraseña incorrectos' });
    }

    const usuario = resultado.rows[0];
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Mail o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        mail: usuario.mail,
        puntos_totales: usuario.puntos_totales,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
