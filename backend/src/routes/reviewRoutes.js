import { Router } from "express";
import { reviewController } from "../controllers/reviewController.js";
import { requireAuth, requireStaff } from "../middlewares/auth.js";
import { reviewLimiter } from "../middlewares/rateLimit.js";

export const reviewRoutes = Router();

// Publico: lista avaliacoes e resumo (media, distribuicao).
reviewRoutes.get("/", reviewController.listPublic);
// Cliente autenticado.
reviewRoutes.get("/pendentes", requireAuth, reviewController.pending);
reviewRoutes.post("/", reviewLimiter, requireAuth, reviewController.create);
// Staff (barbeiro/admin/owner).
reviewRoutes.get("/admin", requireStaff, reviewController.listAdmin);
reviewRoutes.put("/:id/resposta", requireStaff, reviewController.reply);
