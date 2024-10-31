
// const { Pool } = require('pg');
// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL,
//   // ssl: {
//   //   rejectUnauthorized: false, // Opcional: Use com cautela em produção
//   // },
// });

// // Teste a conexão
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error("Erro ao conectar ao banco de dados", err.stack);
//     return;
//   }
//   console.log("Conexão bem-sucedida ao banco de dados");
//   release();
// });

// module.exports = pool;

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Função para criar tabelas e testar a conexão
async function criarTabelas() {
  // Teste a conexão antes de criar tabelas
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err.stack);
      return;
    }
    console.log("Conexão bem-sucedida ao banco de dados");
    release();
  });

  // Conexão para criar tabelas
  const client = await pool.connect();

  try {
    // Criação da tabela `clientes`
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        genero VARCHAR(10),
        dataNascimento DATE,
        telefone VARCHAR(15),
        cep VARCHAR(10),
        rua VARCHAR(100),
        numero VARCHAR(10),
        complemento VARCHAR(50),
        bairro VARCHAR(50),
        cidade VARCHAR(50),
        estado VARCHAR(50)
      );
    `);

    // Criação da tabela `profissionais`
    await client.query(`
      CREATE TABLE IF NOT EXISTS profissionais (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        genero VARCHAR(10),
        datanascimento DATE,
        telefone VARCHAR(15),
        formacao VARCHAR(100),
        especialidade VARCHAR(100),
        tempo_experiencia INT,
        crefito_ou_crm VARCHAR(20),
        descricao TEXT,
        foto BYTEA,
        cidade VARCHAR(100)
      );
    `);

    // Criação da tabela `horarios_disponiveis`
    await client.query(`
      CREATE TABLE IF NOT EXISTS horarios_disponiveis (
        id SERIAL PRIMARY KEY,
        profissional_id INT REFERENCES profissionais(id) ON DELETE CASCADE,
        data_horario TIMESTAMP NOT NULL,
        disponivel BOOLEAN DEFAULT true
      );
    `);

    // Criação da tabela `consultas`
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultas (
        id SERIAL PRIMARY KEY,
        profissional_id INT REFERENCES profissionais(id) ON DELETE CASCADE,
        cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE,
        data_horario TIMESTAMP NOT NULL,
        valor NUMERIC(10, 2) NOT NULL
      );
    `);

    console.log("Tabelas criadas com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabelas:", err);
  } finally {
    client.release(); // Libera o cliente
  }
}

// Executa a função para criar as tabelas e testar a conexão
criarTabelas();

module.exports = pool;

