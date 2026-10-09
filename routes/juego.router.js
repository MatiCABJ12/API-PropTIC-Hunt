import { Router } from "express";
import JuegoController from "../controllers/juego.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/partidas", verifyToken, JuegoController.getPartidas);
router.get("/misiones", verifyToken, JuegoController.getMisiones);
router.get("/participaciones", verifyToken, JuegoController.getParticipaciones);
router.get("/realizaciones", verifyToken, JuegoController.getRealizaciones);

export default router;