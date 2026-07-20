import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { serviceRoutes } from "./routes/serviceRoutes.js";
import { professionalRoutes } from "./routes/professionalRoutes.js";
import { appointmentRoutes } from "./routes/appointmentRoutes.js";
import { availabilityRoutes } from "./routes/availabilityRoutes.js";
import { blockRoutes } from "./routes/blockRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { configRoutes } from "./routes/configRoutes.js";
import { favoriteRoutes } from "./routes/favoriteRoutes.js";
import { loyaltyRoutes } from "./routes/loyaltyRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { couponRoutes } from "./routes/couponRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { waitlistRoutes } from "./routes/waitlistRoutes.js";
import { adminClientRoutes } from "./routes/adminClientRoutes.js";
import { auditRoutes } from "./routes/auditRoutes.js";
import { accountRoutes } from "./routes/accountRoutes.js";
import { galleryRoutes } from "./routes/galleryRoutes.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { UPLOAD_DIR } from "./middlewares/upload.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { publicLimiter, readLimiter } from "./middlewares/rateLimit.js";
import { csrfGuard } from "./middlewares/csrf.js";
import { requestContext } from "./middlewares/requestContext.js";
import { liveness, readiness } from "./controllers/healthController.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

// Atras de proxy reverso (Nginx/CDN): confia no X-Forwarded-* para IP real (rate-limit/auditoria) e cookies secure.
app.set("trust proxy", env.trustProxy ? 1 : false);
app.disable("x-powered-by");

// Headers de seguranca (Defense in Depth). CSP restritiva; API responde JSON.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"], // anti-clickjacking
        baseUri: ["'none'"],
        formAction: ["'none'"]
      }
    },
    hsts: env.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginOpenerPolicy: { policy: "same-origin" }
  })
);

// Permissions-Policy: desabilita APIs sensiveis do navegador nao utilizadas.
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=(), payment=(), usb=()");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError("Origem nao permitida.", 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Observabilidade: correlacao (X-Request-Id) e tempo de resposta.
app.use(requestContext);

// Health checks: /health (liveness) e /health/ready (readiness com dependencias).
app.get("/api/health", liveness);
app.get("/api/health/ready", readiness);

app.use("/api", readLimiter);
app.use("/api", publicLimiter);
app.use("/api", csrfGuard);
app.use("/api/auth", authRoutes);
app.use("/api/servicos", serviceRoutes);
app.use("/api/profissionais", professionalRoutes);
app.use("/api/agendamentos", appointmentRoutes);
app.use("/api/disponibilidade", availabilityRoutes);
app.use("/api/bloqueios", blockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/configuracoes", configRoutes);
app.use("/api/favoritos", favoriteRoutes);
app.use("/api/fidelidade", loyaltyRoutes);
app.use("/api/avaliacoes", reviewRoutes);
app.use("/api/cupons", couponRoutes);
app.use("/api/notificacoes", notificationRoutes);
app.use("/api/lista-espera", waitlistRoutes);
app.use("/api/clientes", adminClientRoutes);
app.use("/api/auditoria", auditRoutes);
app.use("/api/conta", accountRoutes);
app.use("/api/galeria", galleryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Arquivos enviados: somente leitura, sem execucao e sem sniffing de tipo.
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: "deny",
    maxAge: "7d",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Disposition", "inline");
    }
  })
);

app.use(notFound);
app.use(errorHandler);
