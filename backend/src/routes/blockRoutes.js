import { Router } from "express";
import { blockController } from "../controllers/blockController.js";
import { requireStaff } from "../middlewares/auth.js";

export const blockRoutes = Router();

blockRoutes.get("/", requireStaff, blockController.list);
blockRoutes.post("/", requireStaff, blockController.create);
blockRoutes.delete("/:id", requireStaff, blockController.remove);
