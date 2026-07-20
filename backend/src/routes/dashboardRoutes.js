import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { requireStaff } from "../middlewares/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", requireStaff, dashboardController.summary);
