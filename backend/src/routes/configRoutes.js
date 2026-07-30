import { Router } from "express";
import { configController } from "../controllers/configController.js";
import { requireStaff } from "../middlewares/auth.js";

export const configRoutes = Router();

configRoutes.get("/publica", configController.getPublic);
configRoutes.get("/", requireStaff, configController.get);
configRoutes.put("/", requireStaff, configController.update);

// CMS da landing page.
configRoutes.get("/conteudo", requireStaff, configController.getContent);
configRoutes.put("/conteudo", requireStaff, configController.updateContent);
