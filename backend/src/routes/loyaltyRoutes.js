import { Router } from "express";
import { loyaltyController } from "../controllers/loyaltyController.js";
import { requireAuth } from "../middlewares/auth.js";

export const loyaltyRoutes = Router();

loyaltyRoutes.get("/", requireAuth, loyaltyController.summary);
