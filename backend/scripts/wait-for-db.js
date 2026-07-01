import "dotenv/config";
import pg from "pg";

const timeoutMs = 60_000;
const startedAt = Date.now();

while (Date.now() - startedAt < timeoutMs) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    console.log("Banco conectado.");
    process.exit(0);
  } catch {
    await client.end().catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

console.error("Nao foi possivel conectar ao PostgreSQL em 60 segundos.");
process.exit(1);
