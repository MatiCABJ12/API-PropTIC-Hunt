const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,   // 👈 nuevo: necesario para conectar con Neon
  },
});

module.exports = pool;