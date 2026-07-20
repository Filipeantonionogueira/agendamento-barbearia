import { Router } from "express";
import { availabilityController } from "../controllers/availabilityController.js";
import { requireStaff } from "../middlewares/auth.js";

export const availabilityRoutes = Router();

availabilityRoutes.get("/", availabilityController.list);
availabilityRoutes.put("/", requireStaff, availabilityController.update);
