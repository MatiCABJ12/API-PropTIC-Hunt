import UsuarioService from "../services/usuario.service.js";

const getUsuarios = async (req, res) => {
  res.json(await UsuarioService.getUsuarios());
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Se necesita un ID numérico" });
  }

  const usuario = await UsuarioService.deleteUsuario(id);

  if (!usuario) {
    return res.status(404).json({ message: "No existe un usuario con ese id" });
  }

  res.json({ message: "Usuario eliminado", usuario });
};

export default { getUsuarios, deleteUsuario };