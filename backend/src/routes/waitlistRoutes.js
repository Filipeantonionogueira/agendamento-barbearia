import { Router } from "express";
import { waitlistController } from "../controllers/waitlistController.js";
import { requireAuth } from "../middlewares/auth.js";

export const waitlistRoutes = Router();

waitlistRoutes.use(requireAuth);
waitlistRoutes.get("/", waitlistController.listMine);
waitlistRoutes.post("/", waitlistController.join);
waitlistRoutes.delete("/:id", waitlistController.cancel);
