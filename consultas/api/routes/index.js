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
const moment = require("moment-timezone");

router.get("/", (req, res) => {
  res.render("index");
});
//Exemplo de rota
// router.get("/home", (req, res) => {
//   res.render('home');
// });

router.get("/register", (req, res) => {
  res.render("cadastro_cliente");
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

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/login");

}

function isClient(req, res, next) {
  if (!req.session.isClient) {
     return res.redirect("/login");
  }
  next();
 // res.redirect("/login");
}

function isProfessional(req, res, next) {
  if (!req.session.isProfessional) {
     return res.redirect("/login");
    
  }
  next();
 // res.redirect("/login");
}

function formatDateForInterface(date) {
  return moment(date).tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");
}

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

router.post(
  "/register-profissional",
  upload.single("foto"),
  async (req, res) => {
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
    if (req.file) {
      foto = fs.readFileSync(req.file.path); // Lê a imagem como um buffer
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
        return res
          .status(400)
          .json({ error: "Este email já está cadastrado." });
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
      res
        .status(201)
        .json({
          message: "Profissional cadastrado com sucesso!",
          profissionalId: profissionalId,
        });
    } catch (error) {
      console.error("Erro ao inserir profissional:", error);
      res.status(500).json({ error: "Erro ao cadastrar profissional" });
    } finally {
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
      user.isProfessional = false;
    }
    // Se encontrado na tabela de profissionais
    else if (professionalResult.rows.length > 0) {
      user = professionalResult.rows[0];
      user.isProfessional = true;
    } else {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    // Compara a senha
    const isMatch = await bcrypt.compare(senha, user.senha); // Alterar 'password' para 'senha'
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.isProfessional = user.isProfessional;

    // Retorna uma resposta de sucesso
    //res.json({ message: "Login realizado com sucesso!", user });
    res.json({
      message: "Login realizado com sucesso!",
      isProfessional: user.isProfessional,
    });
    // res.redirect("/home");
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

    req.session.email = email;
    req.session.resetToken = token;

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
       <p>Atenciosamente,<br>Equipe Plataforma consultas domiciliares </p>`
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
    req.session.email = user.email;
    req.session.isProfessional = !!professionalResult.rows.length;

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
  const { password } = req.body;

  try {
    const email = req.session.email;
    const isProfessional = req.session.isProfessional;

    if (!email) {
      return res.status(400).send("Email não encontrado na sessão.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE ${isProfessional ? "profissionais" : "clientes"} 
       SET senha = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE email = $2`,
      [hashedPassword, email]
    );

    // Limpa os dados da sessão
    req.session.email = null;
    req.session.isProfessional = null;

    res.status(200).send("Senha redefinida com sucesso!");
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).send("Erro no servidor.");
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

// // Rota para listar profissionais
// //
router.get("/home",  async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profissionais"); // Busca todos os profissionais
    const profissionais = result.rows; // Obtém os dados
    res.render("home", { profissionais }); // Renderiza a página principal e passa os dados
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    res.status(500).send("Erro ao buscar profissionais."); // Tratamento de erro
  }
});

router.get("/detalhes-profissional/:id", isAuthenticated, async (req, res) => {
  const profissionalId = req.params.id;

  try {
    // Busca os detalhes do profissional
    const profissionalResult = await pool.query(
      "SELECT * FROM profissionais WHERE id = $1",
      [profissionalId]
    );
    const profissional = profissionalResult.rows[0];

    if (!profissional) {
      return res.status(404).send("Profissional não encontrado.");
    }

    // Busca os horários disponíveis no banco
    const horariosResult = await pool.query(
      "SELECT * FROM horarios_disponiveis WHERE profissional_id = $1 AND disponivel = true",
      [profissionalId]
    );

    // Converte os horários para o formato esperado pela interface
    const horariosDisponiveis = horariosResult.rows.map((horario) => ({
      ...horario,
      data_horario_formatado: moment(horario.data_horario).format(
        "YYYY-MM-DD HH:mm:ss"
      ), // Formato padrão
    }));

    // Renderiza a página com os dados formatados
    res.render("detalhes-profissional", {
      profissional,
      horariosDisponiveis,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do profissional:", error);
    res.status(500).send("Erro ao buscar detalhes do profissional.");
  }
});

router.post("/agendar-consulta", isAuthenticated, async (req, res) => {
  const { dataHorarioSelecionado, precoConsulta, profissionalId } = req.body;
  const clienteId = req.session.userId;

  if (!dataHorarioSelecionado) {
    return res.status(400).send("Horário não selecionado.");
  }

  try {
    // Formata o horário no formato aceito pelo PostgreSQL
    const dataHorarioFormatado = moment(
      dataHorarioSelecionado,
      "YYYY-MM-DD HH:mm:ss"
    ).format("YYYY-MM-DD HH:mm:ss");

    console.log("Data e Hora Selecionada:", dataHorarioFormatado);

    // Verifica se o horário existe e está disponível
    const horarioDisponivel = await pool.query(
      "SELECT * FROM horarios_disponiveis WHERE profissional_id = $1 AND data_horario = $2 AND disponivel = true",
      [profissionalId, dataHorarioFormatado]
    );

    if (horarioDisponivel.rows.length === 0) {
      return res.status(400).send("Horário já foi escolhido ou não existe.");
    }

    // Insere a consulta diretamente
    const insertConsulta = await pool.query(
      "INSERT INTO consultas (profissional_id, cliente_id, data_horario, valor) VALUES ($1, $2, $3, $4) RETURNING id",
      [profissionalId, clienteId, dataHorarioFormatado, precoConsulta]
    );

    console.log("Consulta Inserida com ID:", insertConsulta.rows[0].id);

    // Atualiza o horário para indisponível
    await pool.query(
      "UPDATE horarios_disponiveis SET disponivel = false WHERE profissional_id = $1 AND data_horario = $2",
      [profissionalId, dataHorarioFormatado]
    );

    // Obtenha os dados do cliente e do profissional
    const clienteResult = await pool.query(
      `SELECT nome, email, telefone, rua, numero, bairro, cidade, estado, cep 
       FROM clientes WHERE id = $1`,
      [clienteId]
    );
    const profissionalResult = await pool.query(
      "SELECT nome, email FROM profissionais WHERE id = $1",
      [profissionalId]
    );

    const cliente = clienteResult.rows[0];
    const profissional = profissionalResult.rows[0];

    // Formata o endereço do cliente
    const enderecoCliente = `${cliente.rua}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade} - ${cliente.estado}, CEP: ${cliente.cep}`;

    // Envia o e-mail ao profissional com os detalhes da consulta
    const subjectToProfessional = "Nova Consulta Agendada";
    const textToProfessional = `Olá ${
      profissional.nome
    }, uma nova consulta foi agendada.\n\n
                                Cliente: ${cliente.nome}\n
                                Endereço: ${enderecoCliente}\n
                                E-mail: ${cliente.email}\n
                                Telefone: ${cliente.telefone}\n
                                Data e Hora: ${new Date(
                                  dataHorarioFormatado
                                ).toLocaleString("pt-BR")}\n\n
                                Atenciosamente,\nEquipe`;

    const htmlToProfessional = `<p>Olá <strong>${
      profissional.nome
    }</strong>,</p>
                                <p>Uma nova consulta foi agendada.</p>
                                <p><strong>Cliente:</strong> ${cliente.nome}</p>
                                <p><strong>Endereço:</strong> ${enderecoCliente}</p>
                                <p><strong>E-mail:</strong> ${cliente.email}</p>
                                <p><strong>Telefone:</strong> ${
                                  cliente.telefone
                                }</p>
                                <p><strong>Data e Hora:</strong> ${new Date(
                                  dataHorarioFormatado
                                ).toLocaleString("pt-BR")}</p>
                                <p>Atenciosamente,<br>Equipe</p>`;

    await sendEmail(
      profissional.email,
      subjectToProfessional,
      textToProfessional,
      htmlToProfessional
    );

    // Envia o e-mail ao cliente com os detalhes da consulta
    const subjectToClient = "Sua Consulta Foi Agendada!";
    const textToClient = `Olá ${
      cliente.nome
    }, sua consulta foi agendada com sucesso!\n\n
                          Profissional: ${profissional.nome}\n
                          Data e Hora: ${new Date(
                            dataHorarioFormatado
                          ).toLocaleString("pt-BR")}\n\n
                          Obrigado por usar nossa plataforma!\nAtenciosamente,\nEquipe`;

    const htmlToClient = `<p>Olá <strong>${cliente.nome}</strong>,</p>
                          <p>Sua consulta foi agendada com sucesso!</p>
                          <p><strong>Profissional:</strong> ${
                            profissional.nome
                          }</p>
                          <p><strong>Data e Hora:</strong> ${new Date(
                            dataHorarioFormatado
                          ).toLocaleString("pt-BR")}</p>
                          <p>Obrigado por usar nossa plataforma!</p>
                          <p>Atenciosamente,<br>Equipe</p>`;

    await sendEmail(cliente.email, subjectToClient, textToClient, htmlToClient);

    //res.status(200).send("Consulta agendada com sucesso!");
   res.send(`
  <script>
    alert('Consulta agendada com sucesso!');
    window.location.href = '/';
  </script>
`);


  } catch (error) {
    console.error("Erro ao agendar consulta:", error);
    res.status(500).send("Erro ao agendar consulta.");
  }
});


router.get("/perfil", isAuthenticated, async (req, res) => {
  const clienteId = req.session.userId;

  try {
    // Busca o nome do cliente
    const clienteResult = await pool.query(
      "SELECT nome FROM clientes WHERE id = $1",
      [clienteId]
    );
    const clienteNome = clienteResult.rows[0].nome;

    // Busca todas as consultas agendadas do cliente
    const consultasResult = await pool.query(
      `SELECT c.*, p.nome AS profissional_nome 
       FROM consultas c
       JOIN profissionais p ON c.profissional_id = p.id
       WHERE c.cliente_id = $1 AND c.status = 'agendada'`,
      [clienteId]
    );

    // Formata as datas das consultas para o mesmo formato
    const consultasAgendadas = consultasResult.rows.map((consulta) => ({
      ...consulta,
      data_horario_formatado: moment(consulta.data_horario).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    }));

    res.render("perfil", { consultasAgendadas, clienteNome });
  } catch (error) {
    console.error("Erro ao buscar consultas do cliente:", error);
    res.status(500).send("Erro ao buscar consultas.");
  }
});

router.post("/cancelar-consulta", isAuthenticated, async (req, res) => {
  const consultaId = req.body.consultaId;
  const clienteId = req.session.userId;

  try {
    const consultaResult = await pool.query(
      "SELECT * FROM consultas WHERE id = $1 AND cliente_id = $2 AND status = 'agendada'",
      [consultaId, clienteId]
    );

    if (consultaResult.rows.length === 0) {
      return res.status(400).send("Consulta não encontrada ou já cancelada.");
    }

    const consulta = consultaResult.rows[0];

    await pool.query("BEGIN");

    await pool.query("DELETE FROM consultas WHERE id = $1", [consultaId]);

    await pool.query(
      "UPDATE horarios_disponiveis SET disponivel = true WHERE profissional_id = $1 AND data_horario = $2",
      [consulta.profissional_id, consulta.data_horario]
    );

    const profissionalResult = await pool.query(
      "SELECT nome, email FROM profissionais WHERE id = $1",
      [consulta.profissional_id]
    );

    if (profissionalResult.rows.length === 0) {
      throw new Error("Profissional não encontrado.");
    }

    const profissional = profissionalResult.rows[0];

    const clienteResult = await pool.query(
      `SELECT nome, email, telefone, rua, numero, bairro, cidade, estado, cep
       FROM clientes WHERE id = $1`,
      [clienteId]
    );

    if (clienteResult.rows.length === 0) {
      throw new Error("Cliente não encontrado.");
    }

    const cliente = clienteResult.rows[0];

    const enderecoCliente = `${cliente.rua}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade} - ${cliente.estado}, CEP: ${cliente.cep}`;

    // Envia e-mail ao profissional
    const subjectToProfessional = "Notificação de Cancelamento de Consulta";
    const textToProfessional = `Olá ${profissional.nome},\n\n
                                A consulta agendada para ${consulta.data_horario.toLocaleString(
                                  "pt-BR"
                                )} foi cancelada pelo cliente ${cliente.nome}.\n
                                Endereço do cliente: ${enderecoCliente}\n
                                E-mail do cliente: ${cliente.email}\n\n
                                Atenciosamente,\nEquipe`;

    const htmlToProfessional = `<p>Olá <strong>${
      profissional.nome
    }</strong>,</p>
                                <p>A consulta agendada para <strong>${consulta.data_horario.toLocaleString(
                                  "pt-BR"
                                )}</strong> foi cancelada pelo cliente <strong>${
      cliente.nome
    }</strong>.</p>
                                <p><strong>Endereço do cliente:</strong> ${enderecoCliente}</p>
                                <p><strong>E-mail do cliente:</strong> ${
                                  cliente.email
                                }</p>
                                <p>Atenciosamente,<br>Equipe</p>`;

    await sendEmail(
      profissional.email,
      subjectToProfessional,
      textToProfessional,
      htmlToProfessional
    );

    // Envia e-mail ao cliente
    const subjectToClient = "Confirmação de Cancelamento de Consulta";
    const textToClient = `Olá ${cliente.nome},\n\n
                          A consulta agendada com o profissional ${
                            profissional.nome
                          } para ${consulta.data_horario.toLocaleString(
      "pt-BR"
    )} foi cancelada com sucesso.\n\n
                          Obrigado por usar nossa plataforma!\nAtenciosamente,\nEquipe`;

    const htmlToClient = `<p>Olá <strong>${cliente.nome}</strong>,</p>
                          <p>A consulta agendada com o profissional <strong>${
                            profissional.nome
                          }</strong> para <strong>${consulta.data_horario.toLocaleString(
      "pt-BR"
    )}</strong> foi cancelada com sucesso.</p>
                          <p>Caso tenha sido um engano, entre em contato conosco</p>
                          <p>Atenciosamente,<br>Equipe</p>`;

    await sendEmail(cliente.email, subjectToClient, textToClient, htmlToClient);

    await pool.query("COMMIT");
    res.redirect("/perfil");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Erro ao cancelar consulta:", error.message);
    res.status(500).send("Erro ao cancelar consulta.");
  }
});

router.get( "/profissional/consultas",isAuthenticated, isProfessional, async (req, res) => {
    const profissionalId = req.session.userId; // ID do profissional logado

    try {
      // Busca o nome do profissional
      const profissionalResult = await pool.query(
        "SELECT nome FROM profissionais WHERE id = $1",
        [profissionalId]
      );
      const profissionalNome =
        profissionalResult.rows[0]?.nome || "Profissional";

      const consultasResult = await pool.query(
        `SELECT c.*, 
          cl.nome AS cliente_nome, 
          cl.email AS cliente_email, 
          cl.telefone AS cliente_telefone,
          cl.rua AS cliente_rua, 
          cl.numero AS cliente_numero, 
          cl.bairro AS cliente_bairro, 
          cl.cidade AS cliente_cidade, 
          cl.estado AS cliente_estado
           FROM consultas c
          JOIN clientes cl ON c.cliente_id = cl.id
           WHERE c.profissional_id = $1 AND c.status = 'agendada'
          ORDER BY c.data_horario`,
          [profissionalId]
      );


      // Formata as datas das consultas agendadas
      const consultas = consultasResult.rows.map((consulta) => ({
        ...consulta,
        data_horario_formatado: moment(consulta.data_horario).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        endereco_cliente: `${consulta.cliente_rua}, ${consulta.cliente_numero} - ${consulta.cliente_bairro}, ${consulta.cliente_cidade} - ${consulta.cliente_estado}`,
      }));

      // Busca os horários disponíveis
      const horariosResult = await pool.query(
        "SELECT * FROM horarios_disponiveis WHERE profissional_id = $1 AND disponivel = true",
        [profissionalId]
      );

      // Formata as datas dos horários disponíveis
      const horariosDisponiveis = horariosResult.rows.map((horario) => ({
        ...horario,
        data_horario_formatado: moment(horario.data_horario).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      }));

      // Renderiza o template e passa as informações
      res.render("consultas_profissional", {
        profissionalNome,
        consultas,
        horariosDisponiveis,
      });
    } catch (error) {
      console.error(
        "Erro ao buscar consultas e horários do profissional:",
        error
      );
      res.status(500).send("Erro ao buscar informações.");
    }
  }
);

// Rota para liberar um horário específico
router.post("/profissional/liberar-horario", isAuthenticated, async (req, res) => {
  const horarioId = req.body.horarioId;

  try {
    await pool.query(
      "UPDATE horarios_disponiveis SET disponivel = true WHERE id = $1",
      [horarioId]
    );
    res.redirect("/profissional/consultas");
  } catch (error) {
    console.error("Erro ao liberar horário:", error);
    res.status(500).send("Erro ao liberar horário.");
  }
});

router.post(
  "/profissional/adicionar-horario",
  isAuthenticated,
  async (req, res) => {
    const { dataHorario } = req.body;
    const profissionalId = req.session.userId;

    try {
      // Formata o horário para o formato consistente
      const dataHorarioFormatado = moment(
        dataHorario,
        "YYYY-MM-DDTHH:mm",
        true
      ); // Formato enviado pelo input `datetime-local`

      // Valida o formato da data
      if (!dataHorarioFormatado.isValid()) {
        console.error("Erro: Horário inválido.");
        return res.status(400).send("Formato de horário inválido.");
      }

      // Converte para o formato desejado
      const dataHorarioFinal = dataHorarioFormatado.format(
        "YYYY-MM-DD HH:mm:ss"
      );

      // Insere no banco
      await pool.query(
        "INSERT INTO horarios_disponiveis (profissional_id, data_horario, disponivel) VALUES ($1, $2, true)",
        [profissionalId, dataHorarioFinal]
      );

      res.redirect("/profissional/consultas");
    } catch (error) {
      console.error("Erro ao adicionar horário:", error);
      res.status(500).send("Erro ao adicionar horário.");
    }
  }
);

router.post(
  "/profissional/deletar-horario",
  isAuthenticated,
  async (req, res) => {
    const { horarioId } = req.body;

    try {
      // Deleta o horário pelo ID
      const deleteResult = await pool.query(
        "DELETE FROM horarios_disponiveis WHERE id = $1 RETURNING *",
        [horarioId]
      );

      // Verifica se o horário foi deletado
      if (deleteResult.rowCount === 0) {
        console.error("Horário não encontrado para exclusão.");
        return res.status(404).send("Horário não encontrado.");
      }

      console.log("Horário deletado:", deleteResult.rows[0]);
      res.redirect("/profissional/consultas"); // Redireciona para a página de gerenciamento de horários
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      res.status(500).send("Erro ao deletar horário.");
    }
  }
);

module.exports = router;
