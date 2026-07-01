import { Router } from "express";
import { appointmentController } from "../controllers/appointmentController.js";
import { bookingLimiter } from "../middlewares/rateLimit.js";
import { requireAuth } from "../middlewares/auth.js";

export const appointmentRoutes = Router();

appointmentRoutes.get("/", requireAuth, appointmentController.list);
appointmentRoutes.post("/", bookingLimiter, appointmentController.create);
appointmentRoutes.put("/:id/status", requireAuth, appointmentController.updateStatus);
