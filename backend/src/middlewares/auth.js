import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req, _res, next) {
  const token = req.cookies?.accessToken;
  if (!token) throw new AppError("Nao autenticado.", 401);

  try {
    req.auth = jwt.verify(token, env.jwtAccessSecret);
    next();
  } catch {
    throw new AppError("Token invalido ou expirado.", 401);
  }
}
