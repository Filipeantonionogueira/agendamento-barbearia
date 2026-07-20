import { Router } from "express";
import { professionalController } from "../controllers/professionalController.js";
import { requireStaff } from "../middlewares/auth.js";

export const professionalRoutes = Router();

professionalRoutes.get("/", professionalController.listPublic);
professionalRoutes.get("/admin", requireStaff, professionalController.listAdmin);
professionalRoutes.post("/", requireStaff, professionalController.create);
professionalRoutes.put("/:id", requireStaff, professionalController.update);
