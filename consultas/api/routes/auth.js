const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const { sendEmail } = require("../mailer");
const crypto = require("crypto");


router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/forgot-password", (req, res) => {
  res.render("recuperarsenha");
});
router.get("/verify-token", (req, res) => {
  res.render("verificartoken");

});
router.get("/reset-password", (req, res) => {
  res.render("novasenha");
});

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const clientResult = await pool.query(
      `SELECT * FROM clientes WHERE email = $1`,
      [email]
    );
    const professionalResult = await pool.query(
      `SELECT * FROM profissionais WHERE email = $1`,
      [email]
    );

    let user;

    if (clientResult.rows.length > 0) {
      user = clientResult.rows[0];
      user.isProfessional = false;
    } else if (professionalResult.rows.length > 0) {
      user = professionalResult.rows[0];
      user.isProfessional = true;
    } else {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.isProfessional = user.isProfessional;

    res.json({ message: "Login realizado com sucesso!", user });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login." });
  }
});

// router.get("/forgot-password", (req, res) => {
//   res.render("recuperarsenha");
// });

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe na tabela de clientes
    const clientResult = await pool.query(
      `SELECT * FROM clientes WHERE email = $1`,
      [email]
    );

    // Verifica se o usuário existe na tabela de profissionais
    const professionalResult = await pool.query(
      `SELECT * FROM profissionais WHERE email = $1`,
      [email]
    );

    let user;

    // Se encontrado na tabela de clientes
    if (clientResult.rows.length > 0) {
      user = clientResult.rows[0];
    }
    // Se encontrado na tabela de profissionais
    else if (professionalResult.rows.length > 0) {
      user = professionalResult.rows[0];
    } else {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    // Gerar o token de redefinição de senha (um código de 4 dígitos)
    const token = crypto.randomInt(1000, 9999).toString();

    // Define o token e a expiração (1 hora em milissegundos)
    const resetPasswordExpires = Date.now() + 3600000; // Mantém em milissegundos

    // Atualiza o usuário com o token e a expiração
    await pool.query(
      `UPDATE ${clientResult.rows.length > 0 ? "clientes" : "profissionais"} 
       SET reset_password_token = $1, reset_password_expires = $2 
       WHERE email = $3`,
      [token, resetPasswordExpires, email] // Passa o valor em bigint
    );

    await sendEmail(
      email,
      "Redefinição de Senha",
      `Olá ${user.nome},
       Recebemos uma solicitação para um código de recuperação de senha da sua conta. Use o código abaixo para redefinir sua senha e continuar aproveitando os benefícios do Baú da Saúde: ${token}
       Caso não tenha solicitado esse código, pode ignorar a presente mensagem com segurança. Outra pessoa pode ter digitado seu e-mail por engano.
       Se precisar de qualquer ajuda, nossa equipe está à disposição.
       Atenciosamente, Plataforma consultas domiciliares`,
      `<p>Olá <strong>${user.nome}</strong>,</p>
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

// router.get("/verify-token", (req, res) => {
//   res.render("verificartoken");
// });

router.post("/verify-token", async (req, res) => {
  const { token } = req.body;

  try {
    // Busca o usuário na tabela de clientes pelo token e verifica o tempo de expiração
    const clientResult = await pool.query(
      `SELECT * FROM clientes WHERE reset_password_token = $1 AND reset_password_expires > EXTRACT(EPOCH FROM NOW()) * 1000`,
      [token]
    );

    // Busca o usuário na tabela de profissionais pelo token e verifica o tempo de expiração
    const professionalResult = await pool.query(
      `SELECT * FROM profissionais WHERE reset_password_token = $1 AND reset_password_expires > EXTRACT(EPOCH FROM NOW()) * 1000`,
      [token]
    );

    let user;

    // Se encontrado na tabela de clientes
    if (clientResult.rows.length > 0) {
      user = clientResult.rows[0];
    }
    // Se encontrado na tabela de profissionais
    else if (professionalResult.rows.length > 0) {
      user = professionalResult.rows[0];
    } else {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    // Se o token for válido, o usuário pode redefinir a senha
    return res
      .status(200)
      .json({ message: "Token válido. Você pode redefinir sua senha." });
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    return res
      .status(500)
      .json({ message: "Erro no servidor ao verificar o token." });
  }
});

// router.get("/reset-password", (req, res) => {
//   res.render("novasenha");
// });

router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  try {
    // Verifica se o usuário existe e se o token de redefinição não expirou
    const clientResult = await pool.query(
      `SELECT * FROM clientes WHERE email = $1 AND reset_password_expires > $2`,
      [email, Date.now()]
    );

    const professionalResult = await pool.query(
      `SELECT * FROM profissionais WHERE email = $1 AND reset_password_expires > $2`,
      [email, Date.now()]
    );

    let user;

    // Verifica se o usuário foi encontrado em clientes ou profissionais
    if (clientResult.rows.length > 0) {
      user = clientResult.rows[0];
      user.isProfessional = false; // Adiciona uma propriedade para identificar o tipo de usuário
    } else if (professionalResult.rows.length > 0) {
      user = professionalResult.rows[0];
      user.isProfessional = true; // Adiciona uma propriedade para identificar o tipo de usuário
    } else {
      console.log("Usuário não encontrado ou token expirado.");
      return res.status(400).send("Token inválido ou expirado.");
    }

    // Atualiza a senha do usuário com a nova senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha no banco de dados de acordo com o tipo de usuário
    await pool.query(
      `UPDATE ${user.isProfessional ? "profissionais" : "clientes"} 
       SET senha = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE email = $2`,
      [hashedPassword, email] // Passa o hash da senha e o email
    );

    res.status(200).send("Senha redefinida com sucesso!");
  } catch (error) {
    console.log("Erro no servidor:", error.message);
    res.status(500).send("Erro no servidor. Tente novamente mais tarde.");
  }
});

module.exports = router;
