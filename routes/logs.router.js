import { Router } from "express";
import LogsController from "../controllers/logs.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/abandono", verifyToken, LogsController.getAbandono);
router.get("/disparo-cazador", verifyToken, LogsController.getDisparoCazador);
router.get("/uso-habilidad", verifyToken, LogsController.getUsoHabilidad);

export default router;