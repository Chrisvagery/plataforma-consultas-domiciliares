
const express = require("express");
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

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./db");

// Importar as rotas
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app; // Exporta o app para o deploy
