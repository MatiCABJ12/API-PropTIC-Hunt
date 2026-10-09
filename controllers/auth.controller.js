import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import UsuarioService from "../services/usuario.service.js";
import EmailService from "../services/email.service.js";

const registro = async (req, res) => {
  const { nombre, mail, contrasena } = req.body;

  if (!nombre || !mail || !contrasena) {
    return res.status(400).json({
      message: "Faltan datos: nombre, mail y contrasena son obligatorios",
    });
  }

  const contrasenaHasheada = await bcrypt.hash(contrasena, 10);
  const usuario = await UsuarioService.crearUsuario(nombre, mail, contrasenaHasheada);

  res.status(201).json(usuario);
};

const login = async (req, res) => {
  const { mail, contrasena } = req.body;

  if (!mail || !contrasena) {
    return res.status(400).json({ message: "Faltan datos: mail y contrasena son obligatorios" });
  }

  const usuario = await UsuarioService.buscarPorMail(mail);

  if (!usuario) {
    return res.status(401).json({ message: "Mail o contraseña incorrectos" });
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!contrasenaValida) {
    return res.status(401).json({ message: "Mail o contraseña incorrectos" });
  }

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    usuario: {
      nombre: usuario.nombre,
      mail: usuario.mail,
      puntos_totales: usuario.puntos_totales,
    },
  });
};

const olvideContrasena = async (req, res) => {
  const { mail } = req.body;

  if (!mail) {
    return res.status(400).json({ message: "Falta el mail" });
  }

  const usuario = await UsuarioService.buscarPorMail(mail);

  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    await UsuarioService.guardarTokenRecuperacion(usuario.id_usuario, token);
    await EmailService.enviarCodigoRecuperacion(mail, usuario.nombre, token);
  }

  res.json({ message: "Si el mail existe, se envió un correo con instrucciones" });
};

const restablecerContrasena = async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  if (!token || !nuevaContrasena) {
    return res.status(400).json({
      message: "Faltan datos: token y nuevaContrasena son obligatorios",
    });
  }

  const usuario = await UsuarioService.buscarPorTokenRecuperacion(token);

  if (!usuario) {
    return res.status(400).json({ message: "Token inválido o expirado" });
  }

  const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, 10);
  await UsuarioService.actualizarContrasena(usuario.id_usuario, contrasenaHasheada);

  res.json({ message: "Contraseña actualizada correctamente" });
};

export default { registro, login, olvideContrasena, restablecerContrasena };