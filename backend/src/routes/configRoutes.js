import { Router } from "express";
import { configController } from "../controllers/configController.js";
import { requireAuth } from "../middlewares/auth.js";

export const configRoutes = Router();

configRoutes.get("/", requireAuth, configController.get);
configRoutes.put("/", requireAuth, configController.update);
