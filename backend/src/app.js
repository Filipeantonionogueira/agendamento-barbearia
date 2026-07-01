import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { serviceRoutes } from "./routes/serviceRoutes.js";
import { appointmentRoutes } from "./routes/appointmentRoutes.js";
import { availabilityRoutes } from "./routes/availabilityRoutes.js";
import { blockRoutes } from "./routes/blockRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { configRoutes } from "./routes/configRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { publicLimiter } from "./middlewares/rateLimit.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origem nao permitida pelo CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(morgan("combined"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", publicLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/servicos", serviceRoutes);
app.use("/api/agendamentos", appointmentRoutes);
app.use("/api/disponibilidade", availabilityRoutes);
app.use("/api/bloqueios", blockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/configuracoes", configRoutes);

app.use(notFound);
app.use(errorHandler);
