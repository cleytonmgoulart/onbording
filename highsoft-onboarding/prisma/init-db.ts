import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";

function splitSql(sql: string) {
  return sql
    .replace(/^--.*$/gm, "")
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);
}

async function main() {
  const migration = path.join(process.cwd(), "prisma", "migrations", "20260623001100_init", "migration.sql");
  const sql = fs.readFileSync(migration, "utf8");

  for (const statement of splitSql(sql)) {
    await prisma.$executeRawUnsafe(statement);
  }

  await prisma.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS \"_prisma_migrations\" (\"id\" TEXT NOT NULL PRIMARY KEY, \"checksum\" TEXT NOT NULL, \"finished_at\" DATETIME, \"migration_name\" TEXT NOT NULL, \"logs\" TEXT, \"rolled_back_at\" DATETIME, \"started_at\" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \"applied_steps_count\" INTEGER UNSIGNED NOT NULL DEFAULT 0);"
  );
  await prisma.$executeRawUnsafe(
    "INSERT OR IGNORE INTO \"_prisma_migrations\" (\"id\", \"checksum\", \"finished_at\", \"migration_name\", \"applied_steps_count\") VALUES ('20260623001100_init', 'manual-init', CURRENT_TIMESTAMP, '20260623001100_init', 1);"
  );

  console.log("Banco SQLite inicializado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
