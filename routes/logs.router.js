import { Router } from "express";
import LogsController from "../controllers/logs.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/abandono", verifyToken, LogsController.getAbandono);
router.get("/disparo-cazador", verifyToken, LogsController.getDisparoCazador);
router.get("/mecanica-ruido", verifyToken, LogsController.getMecanicaRuido);
router.get("/progreso-mision", verifyToken, LogsController.getProgresoMision);
router.get("/uso-habilidad", verifyToken, LogsController.getUsoHabilidad);
router.get("/uso-prop", verifyToken, LogsController.getUsoProp);

export default router;