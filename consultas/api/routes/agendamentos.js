const express = require("express");
const router = express.Router();
const pool = require("../db"); // A conexão com o banco de dados

router.post("/agendar", async (req, res) => {
  const { horarioSelecionado, planoSelecionado, precoConsulta } = req.body;
  const clienteId = req.session.clienteId; // Assumindo que o cliente está logado e armazenado na sessão
  const profissionalId = req.body.profissionalId; // Pode passar o ID do profissional via hidden input ou na sessão

  try {
    // Inserir agendamento no banco de dados
    await pool.query(
      "INSERT INTO agendamentos (cliente_id, profissional_id, horario, plano, valor_consulta) VALUES ($1, $2, $3, $4, $5)",
      [
        clienteId,
        profissionalId,
        horarioSelecionado,
        planoSelecionado,
        precoConsulta,
      ]
    );

    res.send("Consulta agendada com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao agendar a consulta");
  }
});

module.exports = router;
