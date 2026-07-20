import { Router } from "express";
import { couponController } from "../controllers/couponController.js";
import { requireStaff } from "../middlewares/auth.js";

export const couponRoutes = Router();

// Publico: valida um cupom e mostra o desconto antes de confirmar o agendamento.
couponRoutes.post("/validar", couponController.preview);

// Staff: CRUD de cupons.
couponRoutes.get("/", requireStaff, couponController.list);
couponRoutes.post("/", requireStaff, couponController.create);
couponRoutes.put("/:id", requireStaff, couponController.update);
couponRoutes.delete("/:id", requireStaff, couponController.remove);
