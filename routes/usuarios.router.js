import { Router } from "express";
import UsuariosController from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, UsuariosController.getUsuarios);
router.delete("/:id", verifyToken, UsuariosController.deleteUsuario);

export default router;