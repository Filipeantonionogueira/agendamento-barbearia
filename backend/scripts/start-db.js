import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs/promises";

const pg = new EmbeddedPostgres({
  databaseDir: "./.postgres-data-pg16",
  user: "postgres",
  password: "postgres",
  port: 5432,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: (message) => console.log(String(message).trim()),
  onError: (message) => console.error(String(message).trim())
});

let stopping = false;

async function main() {
  const alreadyInitialised = await fs
    .access("./.postgres-data-pg16/PG_VERSION")
    .then(() => true)
    .catch(() => false);

  if (!alreadyInitialised) await pg.initialise();
  await pg.start();
  await pg.createDatabase("barbearia").catch((error) => {
    if (!String(error?.message || error).includes("already exists")) throw error;
  });

  console.log("PostgreSQL local rodando em localhost:5432, database barbearia.");

  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await pg.stop().catch(() => {});
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 60_000);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
