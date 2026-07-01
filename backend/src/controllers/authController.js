import { env } from "../config/env.js";
import { authService } from "../services/authService.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production"
};

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ admin: result.admin });
    } catch (error) {
      next(error);
    }
  },
  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.cookies?.refreshToken);
      res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },
  logout(_req, res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ ok: true });
  }
};
