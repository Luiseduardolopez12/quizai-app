const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "QuizAI API funcionando" });
});

module.exports = app;
