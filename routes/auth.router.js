import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";

const router = Router();

router.post("/registro", AuthController.registro);
router.post("/login", AuthController.login);
router.post("/olvide-contrasena", AuthController.olvideContrasena);
router.post("/restablecer-contrasena", AuthController.restablecerContrasena);

export default router;