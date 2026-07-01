import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export function notFound(req, _res, next) {
  next(new AppError("Rota nao encontrada.", 404));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Dados invalidos.", errors: error.flatten() });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message, details: error.details });
  }

  logger.error("internal_error", { message: error.message, stack: error.stack });
  return res.status(500).json({
    message: "Erro interno do servidor.",
    stack: env.nodeEnv === "production" ? undefined : error.stack
  });
}
