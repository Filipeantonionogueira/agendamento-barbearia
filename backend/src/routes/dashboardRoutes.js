import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { requireAuth } from "../middlewares/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", requireAuth, dashboardController.summary);
