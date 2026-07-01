import { Router } from "express";
import { availabilityController } from "../controllers/availabilityController.js";
import { requireAuth } from "../middlewares/auth.js";

export const availabilityRoutes = Router();

availabilityRoutes.get("/", availabilityController.list);
availabilityRoutes.put("/", requireAuth, availabilityController.update);
