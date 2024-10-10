
const { Pool } = require('pg');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Opcional: Use com cautela em produção
  },
});

// Teste a conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados", err.stack);
    return;
  }
  console.log("Conexão bem-sucedida ao banco de dados");
  release();
});

module.exports = pool;
