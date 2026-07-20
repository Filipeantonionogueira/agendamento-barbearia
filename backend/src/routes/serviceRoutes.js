import { Router } from "express";
import { serviceController } from "../controllers/serviceController.js";
import { requireStaff } from "../middlewares/auth.js";

export const serviceRoutes = Router();

serviceRoutes.get("/", serviceController.listPublic);
serviceRoutes.get("/admin", requireStaff, serviceController.listAdmin);
serviceRoutes.post("/", requireStaff, serviceController.create);
serviceRoutes.put("/:id", requireStaff, serviceController.update);
serviceRoutes.delete("/:id", requireStaff, serviceController.remove);
