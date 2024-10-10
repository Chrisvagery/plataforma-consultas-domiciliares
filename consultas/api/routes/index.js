const express = require("express");
const multer = require("multer");
const fs = require("fs"); 
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { sendEmail } = require("./../mailer");
const crypto = require("crypto");

// Exemplo de rota
// router.get("/", (req, res) => {
//   res.render('index');
// });

router.get("/register", (req, res) => {
  res.render("cadastro");
});
router.get("/register-profissional", (req, res) => {
  res.render("cadastro_profissional");
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

router.get("/pagamento", (req, res) => {
  res.render("pagamento");
});

router.post("/register", async (req, res) => {
  const {
    nome,
    email,
    cpf,
    senha,
    genero,
    dataNascimento,
    telefone,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
  } = req.body;

  try {
    // Verifica se o email ou CPF já existe
    const emailCheck = await pool.query(
      `SELECT * FROM clientes WHERE email = $1`,
      [email]
    );
    const cpfCheck = await pool.query(`SELECT * FROM clientes WHERE cpf = $1`, [
      cpf,
    ]);

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Este email já está cadastrado." });
    }

    if (cpfCheck.rows.length > 0) {
      return res.status(400).json({ error: "Este CPF já está cadastrado." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Insere o cliente na tabela clientes
    const result = await pool.query(
      `INSERT INTO clientes (nome, email, cpf, senha, genero, dataNascimento, telefone, cep, rua, numero, complemento, bairro, cidade, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        nome,
        email,
        cpf,
        hashedPassword,
        genero,
        dataNascimento,
        telefone,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      ]
    );

    const clienteId = result.rows[0].id;

    res.status(201).json({
      message: "Cliente cadastrado com sucesso!",
      clienteId: clienteId,
    });
  } catch (error) {
    console.error("Erro ao inserir cliente:", error);
    res.status(500).json({ error: "Erro ao cadastrar cliente." });
  }
});

const upload = multer({ dest: "uploads/" });

router.post("/register-profissional", upload.single("foto"), async (req, res) => {
    const {
      nome,
      email,
      cpf,
      senha,
      genero,
      dataNascimento,
      telefone,
      formacao,
      especialidade,
      tempo_experiencia,
      crefito_ou_crm,
      descricao,
      cidade,
    } = req.body;

    let foto = null;
    if (req.file) { foto = fs.readFileSync(req.file.path); // Lê a imagem como um buffer
    }

    try {
      // Verifica se o email ou CPF já existe
      const emailCheck = await pool.query(
        `SELECT * FROM profissionais WHERE email = $1`,
        [email]
      );
      const cpfCheck = await pool.query(
        `SELECT * FROM profissionais WHERE cpf = $1`,
        [cpf]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400) .json({ error: "Este email já está cadastrado." });
      }

      if (cpfCheck.rows.length > 0) {
        return res.status(400).json({ error: "Este CPF já está cadastrado." });
      }

      const foto = req.file ? fs.readFileSync(req.file.path) : null; // Se não houver arquivo, `foto` será `null`

      // Hash da senha utilizando bcrypt
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Query para inserir os dados do profissional
      const query = `
      INSERT INTO profissionais (nome, email, cpf, senha, genero, datanascimento, telefone, formacao, especialidade, tempo_experiencia, crefito_ou_crm, descricao, foto, cidade)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`; 

      const values = [
        nome,
        email,
        cpf,
        hashedPassword,
        genero,
        dataNascimento,
        telefone,
        formacao,
        especialidade,
        tempo_experiencia,
        crefito_ou_crm,
        descricao,
        foto,
        cidade, 
      ];
      
      const result = await pool.query(query, values);
      const profissionalId = result.rows[0].id;
      res.status(201).json({message: "Profissional cadastrado com sucesso!",
        profissionalId: profissionalId, 
      });
    } catch (error) {
      console.error("Erro ao inserir profissional:", error);
      res.status(500).json({ error: "Erro ao cadastrar profissional" });
    }finally {
      // Remove o arquivo temporário após a leitura
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, senha } = req.body; // Altere 'password' para 'senha'

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

    // Compara a senha
    const isMatch = await bcrypt.compare(senha, user.senha); // Alterar 'password' para 'senha'
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }
    res.json({ message: "Login realizado com sucesso!", user });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login." });
  }
});


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

router.post("/pagamento", (req, res) => {
  console.log("Recibido webhook:", req.body);

  const event = req.body;
  if (event && event.event_type === "PAYMENT.SALE.COMPLETED") {
    console.log("Pagamento concluído com sucesso:", event);
  } else {
    console.log("Evento não processado:", event);
  }
  res.sendStatus(200);
});

// Rota para listar profissionais
// 
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profissionais"); // Busca todos os profissionais
    const profissionais = result.rows; // Obtém os dados
    res.render("index", { profissionais }); // Renderiza a página principal e passa os dados
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    res.status(500).send("Erro ao buscar profissionais."); // Tratamento de erro
  }
});

// Rota para buscar detalhes de um profissional
router.get("/profissionais/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM profissionais WHERE id = $1", [id]);
    const profissional = result.rows[0]; // Obtém os dados do profissional
    if (profissional) {
      res.json(profissional); // Retorna os detalhes como JSON
    } else {
      res.status(404).send("Profissional não encontrado."); // Profissional não encontrado
    }
  } catch (error) {
    console.error("Erro ao buscar profissional:", error);
    res.status(500).send("Erro ao buscar profissional."); // Tratamento de erro
  }
});


module.exports = router;
