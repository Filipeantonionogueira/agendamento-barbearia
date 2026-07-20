import { env } from "../config/env.js";
import { authService } from "../services/authService.js";
import { auditService } from "../services/auditService.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production"
};

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  if (refreshToken) res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      setAuthCookies(res, result);
      auditService.record({ userId: result.user.id, actorName: result.user.name, action: "USER_REGISTERED", entity: "User", entityId: result.user.id, req });
      res.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      setAuthCookies(res, result);
      auditService.record({ userId: result.user.id, actorName: result.user.name, action: "LOGIN", entity: "User", entityId: result.user.id, req });
      res.json({ user: result.user });
    } catch (error) {
      auditService.record({ action: "LOGIN_FAILED", entity: "User", metadata: { email: req.body?.email }, req });
      next(error);
    }
  },
  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.cookies?.refreshToken);
      setAuthCookies(res, { accessToken: result.accessToken });
      res.json({ user: result.user });
    } catch (error) {
      next(error);
    }
  },
  async me(req, res, next) {
    try {
      res.json({ user: await authService.me(req.auth.sub) });
    } catch (error) {
      next(error);
    }
  },
  async updateProfile(req, res, next) {
    try {
      res.json({ user: await authService.updateProfile(req.auth.sub, req.body) });
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req, res, next) {
    try {
      const origin = req.headers.origin || env.frontendOrigins[0];
      const result = await authService.requestPasswordReset(req.body, (token) => `${origin}/recuperar-senha?token=${token}`);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async resetPassword(req, res, next) {
    try {
      res.json(await authService.resetPassword(req.body));
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
