const express = require("express");
const session = require("express-session");
const router = express.Router();
const pool = require("../db");
const { sendEmail } = require("../mailer");
//const indexRouter = require("./routes/index");

// Middleware de autenticação
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// // Rota para mostrar detalhes do profissional e horários disponíveis
// router.get("/home", isAuthenticated, async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM profissionais"); // Busca todos os profissionais
//     const profissionais = result.rows; // Obtém os dados
//     res.render("home", { profissionais }); // Renderiza a página principal e passa os dados
//   } catch (error) {
//     console.error("Erro ao buscar profissionais:", error);
//     res.status(500).send("Erro ao buscar profissionais."); // Tratamento de erro
//   }
// });

// // Rota para mostrar detalhes do profissional e horários disponíveis
// router.get("/detalhes-profissional/:id", async (req, res) => {
//   const profissionalId = req.params.id; // Obtém o ID do profissional da URL

//   try {
//     // Busca os detalhes do profissional
//     const profissionalResult = await pool.query(
//       "SELECT * FROM profissionais WHERE id = $1",
//       [profissionalId]
//     );
//     const profissional = profissionalResult.rows[0];

//     // Busca os horários disponíveis para esse profissional
//     const horariosResult = await pool.query(
//       "SELECT data_horario FROM horarios_disponiveis WHERE profissional_id = $1 AND disponivel = true",
//       [profissionalId]
//     );
//     const horariosDisponiveis = horariosResult.rows; // Obtém os horários disponíveis

//     // Renderiza a página de detalhes do profissional com os horários disponíveis
//     res.render("detalhes-profissional", {
//       profissional,
//       horariosDisponiveis,
//     });
//   } catch (error) {
//     console.error("Erro ao buscar detalhes do profissional:", error);
//     res.status(500).send("Erro ao buscar detalhes do profissional.");
//   }
// });

router.post("/agendar-consulta", isAuthenticated, async (req, res) => {
  const { dataHorarioSelecionado, precoConsulta, profissionalId } = req.body;
  const clienteId = req.session.userId;

  if (!dataHorarioSelecionado) {
    return res.status(400).send("Horário não selecionado.");
  }

  try {
    // Formata a data para o padrão ISO sem fuso horário
    const dataHorarioFormatado = new Date(dataHorarioSelecionado)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Log para verificar o formato da data
    console.log(
      "Data e hora formatada para agendamento:",
      dataHorarioFormatado
    );

    // Insere a nova consulta com a data/hora formatada
    const insertConsulta = await pool.query(
      "INSERT INTO consultas (profissional_id, cliente_id, data_horario, valor) VALUES ($1, $2, $3, $4) RETURNING id",
      [profissionalId, clienteId, dataHorarioFormatado, precoConsulta]
    );

    // Atualiza a disponibilidade do horário para `false`
    await pool.query(
      "UPDATE horarios_disponiveis SET disponivel = false WHERE profissional_id = $1 AND data_horario = $2 RETURNING *",
      [profissionalId, dataHorarioFormatado]
    );

    // Obtenha os dados do cliente e do profissional
    const clienteResult = await pool.query(
      "SELECT nome, email, telefone FROM clientes WHERE id = $1",
      [clienteId]
    );
    const profissionalResult = await pool.query(
      "SELECT nome, email FROM profissionais WHERE id = $1",
      [profissionalId]
    );
    const cliente = clienteResult.rows[0];
    const profissional = profissionalResult.rows[0];

    // Envia o e-mail ao profissional com os detalhes da consulta
    const subject = "Nova Consulta Agendada";
    const text = `Olá ${profissional.nome}, uma nova consulta foi agendada.\n\n
                  Cliente: ${cliente.nome}\n
                  E-mail: ${cliente.email}\n
                  Telefone: ${cliente.telefone}\n
                  Data e Hora: ${new Date(dataHorarioFormatado).toLocaleString(
                    "pt-BR"
                  )}\n\n
                  Atenciosamente,\nEquipe`;

    const html = `<p>Olá <strong>${
      profissional.nome
    }</strong>, uma nova consulta foi agendada.</p>
                  <p><strong>Cliente:</strong> ${cliente.nome}</p>
                  <p><strong>E-mail:</strong> ${cliente.email}</p>
                  <p><strong>Telefone:</strong> ${cliente.telefone}</p>
                  <p><strong>Data e Hora:</strong> ${new Date(
                    dataHorarioFormatado
                  ).toLocaleString("pt-BR")}</p>
                  <p>Atenciosamente,<br>Equipe</p>`;

    await sendEmail(profissional.email, subject, text, html);

    res.status(200).send("Consulta agendada com sucesso!");
  } catch (error) {
    console.error("Erro ao agendar consulta:", error);
    res.status(500).send("Erro ao agendar consulta.");
  }
});

module.exports = router;
