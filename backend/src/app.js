const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "QuizAI API funcionando" });
});

app.use("/api/auth", authRoutes);

module.exports = app;
