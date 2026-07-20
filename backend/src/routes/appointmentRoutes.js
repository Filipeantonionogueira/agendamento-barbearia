import { Router } from "express";
import { appointmentController } from "../controllers/appointmentController.js";
import { bookingLimiter } from "../middlewares/rateLimit.js";
import { requireStaff, optionalAuth, requireAuth } from "../middlewares/auth.js";

export const appointmentRoutes = Router();

appointmentRoutes.get("/", requireStaff, appointmentController.list);
appointmentRoutes.get("/minhas", requireAuth, appointmentController.listMine);
appointmentRoutes.post("/minhas/:id/cancelar", requireAuth, appointmentController.cancelMine);
appointmentRoutes.post("/", bookingLimiter, optionalAuth, appointmentController.create);
appointmentRoutes.put("/:id/status", requireStaff, appointmentController.updateStatus);
appointmentRoutes.put("/:id/reagendar", requireStaff, appointmentController.reschedule);
