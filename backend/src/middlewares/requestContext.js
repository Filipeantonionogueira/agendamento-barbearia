import crypto from "node:crypto";
import { logger } from "../utils/logger.js";

// Correlaciona requisicoes e mede tempo de resposta (observabilidade).
// O mesmo requestId volta no header para o cliente e aparece nos logs de erro.
export function requestContext(req, res, next) {
  const incoming = req.headers["x-request-id"];
  const requestId = typeof incoming === "string" && incoming.length <= 100 ? incoming : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const payload = {
      requestId,
      method: req.method,
      route: req.originalUrl.split("?")[0],
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1))
    };

    // Nivel proporcional a severidade: 5xx=error, 4xx=warn, lento=warn, resto=info.
    if (res.statusCode >= 500) logger.error("request_completed", payload);
    else if (res.statusCode === 401 || res.statusCode === 403) logger.warn("request_denied", payload);
    else if (res.statusCode >= 400) logger.warn("request_failed", payload);
    else if (durationMs > 1000) logger.warn("request_slow", payload);
    else logger.info("request_completed", payload);
  });

  next();
}
