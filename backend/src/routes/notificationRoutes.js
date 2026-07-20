import { Router } from "express";
import { notificationController } from "../controllers/notificationController.js";
import { requireAuth } from "../middlewares/auth.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/", notificationController.list);
notificationRoutes.get("/nao-lidas", notificationController.unreadCount);
notificationRoutes.put("/lidas", notificationController.markAllRead);
notificationRoutes.put("/:id/lida", notificationController.markRead);
notificationRoutes.put("/:id/arquivar", notificationController.archive);
