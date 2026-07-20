import { Router } from "express";
import { adminClientController } from "../controllers/adminClientController.js";
import { requireStaff } from "../middlewares/auth.js";

export const adminClientRoutes = Router();

adminClientRoutes.use(requireStaff);
adminClientRoutes.get("/", adminClientController.list);
adminClientRoutes.get("/exportar", adminClientController.exportCsv);
adminClientRoutes.put("/:id/bloqueio", adminClientController.setBlocked);
