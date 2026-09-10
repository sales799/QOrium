import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const requireFromDb = createRequire(join(root, "packages/db/package.json"));
const postgres = requireFromDb("postgres");

// The lock and ledger share a transaction: crashes roll back both schema and history.
export async function migrate(databaseUrl, directory = join(root, "packages/migrations")) {
  if (!databaseUrl) throw new Error("An explicit DATABASE_URL is required; no default database is used");
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  if (!files.length || files.some((name) => !/^\d{4}_[a-z0-9_]+\.sql$/.test(name))) {
    throw new Error("Expected numbered SQL migration files");
  }
  const migrations = await Promise.all(files.map(async (filename) => {
    const sql = await readFile(join(directory, filename), "utf8");
    return { filename, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    return await client.begin(async (tx) => {
      await tx`SET LOCAL lock_timeout = '15s'`;
      await tx`SET LOCAL statement_timeout = '60s'`;
      await tx`SET LOCAL search_path = public`;
      await tx`SELECT pg_advisory_xact_lock(716079, 1)`;
      const [ledger] = await tx`SELECT to_regclass('public.schema_migrations') AS name`;
      if (!ledger.name) {
        const objects = await tx`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S')`;
        if (objects.length) throw new Error("Existing untracked schema: reconcile and verify a baseline before migration; nothing was changed");
        await tx`CREATE TABLE schema_migrations (
          filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
        )`;
      }
      const columns = await tx`SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schema_migrations'`;
      if (!columns.some((c) => c.column_name === 'checksum')) {
        throw new Error("Legacy migration ledger has no checksums: operator baseline verification required");
      }
      const applied = await tx`SELECT filename, checksum FROM schema_migrations ORDER BY filename`;
      for (let i = 0; i < applied.length; i++) {
        if (applied[i].filename !== migrations[i]?.filename || applied[i].checksum !== migrations[i]?.checksum) {
          throw new Error(`Migration history mismatch at ${applied[i].filename}; restore the reviewed immutable migration files`);
        }
      }
      const result = [];
      for (const migration of migrations.slice(applied.length)) {
        await tx.unsafe(migration.sql);
        await tx`INSERT INTO schema_migrations (filename, checksum) VALUES (${migration.filename}, ${migration.checksum})`;
        result.push(migration.filename);
      }
      return result;
    });
  } finally {
    await client.end({ timeout: 5 });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const applied = await migrate(process.env.DATABASE_URL);
    console.log(applied.length ? `Applied: ${applied.join(', ')}` : "Database migrations already current");
  } catch (error) {
    // Avoid logging connection URLs or driver objects, which may contain credentials.
    console.error(`Database migration failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    process.exitCode = 1;
  }
}
