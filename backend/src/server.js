// Fuso horario da barbearia. Precisa ser definido ANTES de qualquer uso de Date:
// servidores de producao rodam em UTC por padrao e os horarios ficariam deslocados.
import "dotenv/config";
process.env.TZ = process.env.TIMEZONE || "America/Sao_Paulo";

const { app } = await import("./app.js");
const { env } = await import("./config/env.js");
const { logger } = await import("./utils/logger.js");

app.listen(env.port, () => {
  logger.info("server_started", { port: env.port, timezone: process.env.TZ });
});
