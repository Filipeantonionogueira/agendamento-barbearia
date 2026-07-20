import { Router } from "express";
import { auditController } from "../controllers/auditController.js";
import { requireStaff } from "../middlewares/auth.js";

export const auditRoutes = Router();

auditRoutes.get("/", requireStaff, auditController.list);
