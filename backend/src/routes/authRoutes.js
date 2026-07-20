import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimit.js";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, authController.register);
authRoutes.post("/login", authLimiter, authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/forgot-password", passwordResetLimiter, authController.forgotPassword);
authRoutes.post("/reset-password", passwordResetLimiter, authController.resetPassword);
authRoutes.get("/me", requireAuth, authController.me);
authRoutes.put("/me", requireAuth, authController.updateProfile);
