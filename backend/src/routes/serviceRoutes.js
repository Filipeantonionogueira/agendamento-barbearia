import { Router } from "express";
import { serviceController } from "../controllers/serviceController.js";
import { requireAuth } from "../middlewares/auth.js";

export const serviceRoutes = Router();

serviceRoutes.get("/", serviceController.listPublic);
serviceRoutes.get("/admin", requireAuth, serviceController.listAdmin);
serviceRoutes.post("/", requireAuth, serviceController.create);
serviceRoutes.put("/:id", requireAuth, serviceController.update);
serviceRoutes.delete("/:id", requireAuth, serviceController.remove);
