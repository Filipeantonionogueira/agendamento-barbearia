import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function originAllowed(value) {
  if (!value) return true; // ausente: nao ha como forjar cross-site via browser sem Origin
  try {
    const url = new URL(value);
    const origin = `${url.protocol}//${url.host}`;
    return env.frontendOrigins.includes(origin);
  } catch {
    return false;
  }
}

// Protecao CSRF: em mutacoes com cookie, exige Origin/Referer confiavel.
// Em producao o cookie e SameSite=None (frontend e API em dominios diferentes),
// portanto esta verificacao — junto do CORS com allowlist — e a defesa principal.
export function csrfGuard(req, _res, next) {
  if (!MUTATING.has(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Valida Origin quando presente; senao, cai para Referer.
  const ok = origin ? originAllowed(origin) : originAllowed(referer);
  if (!ok) throw new AppError("Origem da requisicao nao permitida.", 403);
  next();
}
