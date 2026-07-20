import { Router } from "express";
import { accountController } from "../controllers/accountController.js";
import { requireAuth } from "../middlewares/auth.js";

export const accountRoutes = Router();

accountRoutes.use(requireAuth);
// LGPD: direito de acesso/portabilidade e direito de exclusao.
accountRoutes.get("/meus-dados", accountController.exportData);
accountRoutes.delete("/", accountController.deleteAccount);
