const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { sendEmail } = require("./../mailer");
const crypto = require("crypto");

// Exemplo de rota
router.get("/", (req, res) => {
  res.render('index');
});
router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/home", (req, res) => {
  res.render("home");
});

router.post("/register", async (req, res) => {
  const { name, email, password, birthDate, telefone, tipo } = req.body;


  try {
    // Verifica se o email já existe
    const emailCheck = await pool.query(
      `SELECT * FROM usuario WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Este email já está cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuario (name, email, password, birthDate, telefone, tipo) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, hashedPassword, birthDate, telefone, tipo]
    );

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao inserir usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query(
      `SELECT * FROM usuario WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const user = userResult.rows[0];

    // Compara a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    // Retorna uma resposta de sucesso
    res.json({ message: "Login realizado com sucesso!", user });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login." });
  }
});
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query(
      `SELECT * FROM usuario WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const user = userResult.rows[0];

    // Gerar o token de redefinição de senha (um código de 4 dígitos)
    const token = crypto.randomInt(1000, 9999).toString();

    // Define o token e a expiração (1 hora)
    const resetPasswordExpires = Date.now() + 3600000; // 1 hora

    // Atualiza o usuário com o token e a expiração
    await pool.query(
      `UPDATE usuario SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3`,
      [token, resetPasswordExpires, email]
    );

    // Envia o email para o usuário
    await sendEmail(
      email,
      "Redefinição de Senha",
      `Olá ${user.name},
       Recebemos uma solicitação para um código de recuperação de senha da sua conta. Use o código abaixo para redefinir sua senha e continuar aproveitando os benefícios do Baú da Saúde: ${token}
       Caso não tenha solicitado esse código, pode ignorar a presente mensagem com segurança. Outra pessoa pode ter digitado seu e-mail por engano.
       Se precisar de qualquer ajuda, nossa equipe está à disposição.
       Atenciosamente, Plataforma consultas domiciliares`,
      `<p>Olá <strong>${user.name}</strong>,</p>
       <p>Recebemos uma solicitação para um código de recuperação de senha da sua conta.<br>Use o código abaixo para redefinir sua senha e continuar aproveitando os benefícios do <strong>Baú da Saúde</strong>:</p>
       <p style="font-size: 18px; font-weight: bold;">${token}</p>
       <p>Caso não tenha solicitado esse código, pode ignorar a presente mensagem com segurança. Outra pessoa pode ter digitado seu e-mail por engano.<br>Se precisar de qualquer ajuda, nossa equipe está à disposição.</p>
       <p>Atenciosamente,<br>Equipe Baú da Saúde</p>`
    );

    res.json({ message: "Código de redefinição de senha enviado." });
  } catch (error) {
    console.error("Erro ao processar pedido de redefinição de senha:", error);
    res
      .status(500)
      .json({ message: "Erro ao processar o pedido de redefinição de senha." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  try {
    // Verifica se o usuário existe e se o token de redefinição não expirou
    const userResult = await pool.query(
      `SELECT * FROM usuario WHERE email = $1 AND reset_password_expires > $2`,
      [email, Date.now()]
    );

    if (userResult.rows.length === 0) {
      console.log("Usuário não encontrado ou token expirado.");
      return res.status(400).send("Token inválido ou expirado.");
    }

    const user = userResult.rows[0];

    // Verifica se o token é válido
    if (!user.reset_password_token || user.reset_password_token !== token) {
      console.log("Token de redefinição de senha não encontrado ou inválido.");
      return res.status(400).send("Token inválido ou expirado.");
    }

    // Atualiza a senha do usuário com a nova senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE usuario SET password = $1, reset_password_token = $2, reset_password_expires = $3 WHERE email = $4`,
      [hashedPassword, null, null, email] // Remove o token e a expiração após redefinir a senha
    );

    res.status(200).send("Senha redefinida com sucesso!");
  } catch (error) {
    console.log("Erro no servidor:", error.message);
    res.status(500).send("Erro no servidor. Tente novamente mais tarde.");
  }
});


module.exports = router;
