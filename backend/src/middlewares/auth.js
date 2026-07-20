import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req, _res, next) {
  const token = req.cookies?.accessToken;
  if (!token) throw new AppError("Nao autenticado.", 401);

  try {
    req.auth = jwt.verify(token, env.jwtAccessSecret);
    req.auth.roles = req.auth.roles || [];
    next();
  } catch {
    throw new AppError("Token invalido ou expirado.", 401);
  }
}

// Autentica se houver cookie valido, mas nunca bloqueia (usado no agendamento hibrido).
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.accessToken;
  if (token) {
    try {
      req.auth = jwt.verify(token, env.jwtAccessSecret);
      req.auth.roles = req.auth.roles || [];
    } catch {
      req.auth = null;
    }
  }
  next();
}

// Permissoes acumulativas: basta o usuario ter QUALQUER um dos papeis exigidos.
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.auth) throw new AppError("Nao autenticado.", 401);
    const userRoles = req.auth.roles || [];
    const allowed = allowedRoles.some((role) => userRoles.includes(role));
    if (!allowed) throw new AppError("Sem permissao para esta acao.", 403);
    next();
  };
}

// Atalho para rotas de gestao (Owner ou Admin).
export const requireStaff = [requireAuth, authorize("OWNER", "ADMIN")];
