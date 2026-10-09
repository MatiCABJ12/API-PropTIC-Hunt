import { Router } from "express";
import EstadisticasController from "../controllers/estadisticas.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/puntos", verifyToken, EstadisticasController.getPuntos);
router.get("/partidas", verifyToken, EstadisticasController.getPartidas);

export default router;