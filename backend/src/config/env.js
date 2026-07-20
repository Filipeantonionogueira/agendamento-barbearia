import "dotenv/config";
import crypto from "node:crypto";

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// Segredos conhecidos que jamais podem ser usados em producao.
const WEAK_SECRETS = new Set([
  "dev-access-secret",
  "dev-refresh-secret",
  "troque-este-segredo",
  "troque-este-segredo-refresh",
  "secret",
  "changeme"
]);

// Fail Secure: em producao exige segredo forte; em dev gera um aleatorio por processo.
function resolveSecret(name) {
  const value = process.env[name];
  if (isProduction) {
    if (!value || WEAK_SECRETS.has(value) || value.length < 32) {
      throw new Error(
        `[SEGURANCA] ${name} ausente ou fraco em producao. Defina um segredo aleatorio com pelo menos 32 caracteres.`
      );
    }
    return value;
  }
  if (value && !WEAK_SECRETS.has(value)) return value;
  // Dev sem segredo definido: gera um efemero (invalida sessoes a cada restart, mas nunca ha segredo fraco fixo).
  const generated = crypto.randomBytes(48).toString("hex");
  console.warn(`[dev] ${name} nao definido; usando segredo aleatorio efemero desta sessao.`);
  return generated;
}

// Em producao, DATABASE_URL e obrigatorio.
if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("[SEGURANCA] DATABASE_URL e obrigatorio em producao.");
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 3333),
  databaseUrl: process.env.DATABASE_URL,
  trustProxy: process.env.TRUST_PROXY === "true" || isProduction,
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret: resolveSecret("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: resolveSecret("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  slotIntervalMinutes: Number(process.env.SLOT_INTERVAL_MINUTES || 45),
  // Antecedencia minima para agendar (evita reserva "para daqui a 2 minutos").
  minimumBookingNoticeMinutes: Number(process.env.MINIMUM_BOOKING_NOTICE_MINUTES || 15),
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 30),
  emailTransport: process.env.EMAIL_TRANSPORT || "log",
  emailFrom: process.env.EMAIL_FROM || "Barbearia Prime <no-reply@barbearia.local>",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
};
