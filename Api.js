const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('¡La API de PropTIC-Hunt está funcionando!');
});

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});