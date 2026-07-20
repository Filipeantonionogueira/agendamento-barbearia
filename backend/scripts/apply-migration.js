import "dotenv/config";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import pg from "pg";

const migrationsDir = path.join("prisma", "migrations");
const folders = (await fs.readdir(migrationsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  for (const migrationName of folders) {
    const { rows } = await client.query('SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = $1', [migrationName]);
    if (rows.length) {
      console.log(`Migracao ${migrationName} ja aplicada; pulando.`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, migrationName, "migration.sql"), "utf8");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
         VALUES ($1, $2, now(), $3, 1)
         ON CONFLICT ("id") DO NOTHING`,
        [crypto.randomUUID(), checksum, migrationName]
      );
      await client.query("COMMIT");
      console.log(`Migracao ${migrationName} aplicada.`);
    } catch (error) {
      await client.query("ROLLBACK");
      if (String(error.message).includes("already exists")) {
        console.log(`Tabelas de ${migrationName} ja existem; mantendo banco atual.`);
      } else {
        throw error;
      }
    }
  }
} finally {
  await client.end();
}
