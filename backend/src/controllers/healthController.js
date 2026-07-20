import { prisma } from "../config/prisma.js";

const startedAt = Date.now();

// Liveness: o processo esta de pe (nao toca dependencias).
export function liveness(_req, res) {
  res.json({ status: "ok", uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) });
}

// Readiness: verifica dependencias criticas. Usado por orquestrador/monitor.
export async function readiness(_req, res) {
  const checks = {};
  let healthy = true;

  const dbStart = process.hrtime.bigint();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "up", latencyMs: Number(Number(process.hrtime.bigint() - dbStart) / 1e6).toFixed(1) };
  } catch {
    // Nao expoe detalhes do erro (evita vazar infraestrutura).
    checks.database = { status: "down" };
    healthy = false;
  }

  const memory = process.memoryUsage();
  checks.process = {
    status: "up",
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    rssMb: Math.round(memory.rss / 1024 / 1024)
  };

  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", checks });
}
