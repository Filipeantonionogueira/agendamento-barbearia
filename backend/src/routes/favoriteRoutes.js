import { Router } from "express";
import { favoriteController } from "../controllers/favoriteController.js";
import { requireAuth } from "../middlewares/auth.js";

export const favoriteRoutes = Router();

favoriteRoutes.use(requireAuth);
favoriteRoutes.get("/", favoriteController.list);
favoriteRoutes.post("/", favoriteController.add);
favoriteRoutes.delete("/", favoriteController.remove);
