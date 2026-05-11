const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya esta registrado" });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar usuario", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contrasena son requeridos" });
    }

    const user = await User.findOne({ email });

    console.log("Usuario encontrado:", user ? "SI" : "NO");
    console.log("Email buscado:", email);

    if (!user) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    const passwordMatch = await user.comparePassword(password);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Password incorrecto" });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    console.log("ERROR login:", error.message);
    res
      .status(500)
      .json({ message: "Error al iniciar sesion", error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
