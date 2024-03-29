﻿/*
 *---------- GENERAL SETUP ----------
 */
global.baseDir = __dirname;
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db/connect");
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// includiamo il file delle variabili d'ambiente di sviluppo o di produzione
if (process.argv.length > 2)
  require("dotenv").config({
    path: path.join(__dirname, ".env.development"),
  });
else
  require("dotenv").config({
    path: path.join(__dirname, ".env.production"),
  });

const app = express();

// gestore degli errori asincroni, per non usare il costrutto trycatch
require("express-async-errors");
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/img", express.static(path.join(__dirname, "public", "media")));
app.use("/js", express.static(path.join(__dirname, "..", "back-office", "js")));
app.use("/elements", express.static(path.join(__dirname, "node_modules", "tw-elements", "dist", "js")));
app.use("/chart", express.static(path.join(__dirname, "node_modules", "chart.js", "dist")));
app.use(express.static(path.join(__dirname, "./back-office")));
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "frontofficeBuild")));
app.use(express.static(path.join(__dirname, "gameBuild")));
app.use(express.static(path.join(__dirname, "public", "")));
// middleware per usare i dati nel body delle richieste
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.enable("trust proxy");
app.get("/frontoffice*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontofficeBuild", "index.html"));
});
app.get("/game*", (req, res) => {
  res.sendFile(path.join(__dirname, "gameBuild", "index.html"));
});
app.get("/resetPassword/:token", (req, res) => {
  res.sendFile(path.join(global.baseDir, "..", "./back-office", "resetPassword.html"));
});
// Routes
app.use("/back-office", require("./routes/back-office"));
app.use("/api/v1", require("./routes/apiRouter"));
app.use(notFound);
// Da usare sempre come ultimo
app.use(errorHandlerMiddleware);

/*
 *---------- SERVER ----------
 */
const port = 8000;

const start = async () => {
  try {
    connectDB(process.env.DB_URL);
    app.listen(port, () => console.log(`app listening on port ${port}!`));
  } catch (error) {
    console.log(error);
  }
};

start();
