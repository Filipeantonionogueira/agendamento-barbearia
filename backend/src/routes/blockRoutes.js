import { Router } from "express";
import { blockController } from "../controllers/blockController.js";
import { requireAuth } from "../middlewares/auth.js";

export const blockRoutes = Router();

blockRoutes.get("/", requireAuth, blockController.list);
blockRoutes.post("/", requireAuth, blockController.create);
blockRoutes.delete("/:id", requireAuth, blockController.remove);
