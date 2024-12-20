
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const app = express();
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, "../public")));
const paypal = require("paypal-rest-sdk");
const moment = require("moment-timezone");

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./db");
app.use(
  session({
    secret: "seuSegredoSeguro", // Use um segredo seguro para a sessão
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Defina como true se estiver usando HTTPS
  })
);

// Importar as rotas
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const agendamentosRouter = require("./routes/agendamentos");
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/agendamentos", agendamentosRouter);


app.get('/' , (req, res)=>{
  const user = req.session.user;
  res.render("home", { user });
});
app.get("/", (req, res) => {
  res.render("selecionartipocadastro");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app; // Exporta o app para o deploy
