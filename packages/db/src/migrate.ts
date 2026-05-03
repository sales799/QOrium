import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { createPool } from './client.js';

/**
 * QOrium migration runner.
 *
 * Why a custom runner: node-pg-migrate cannot parse the canonical
 * `NNNN_name.sql` filenames in `infra/B7-postgres-migrations/` (its parser
 * expects ms-epoch timestamps). See
 * `infra/CTO-deltas/CTO-DELTA-migration-runner.md`.
 *
 * Behaviour:
 *  - Reads `*.sql` files from the configured `migrationsDir`, sorted lexically
 *    (so `0001_*` runs before `0002_*`).
 *  - Tracks applied migrations in `public.pgmigrations` (same table name
 *    node-pg-migrate uses, so a future switch is no-op).
 *  - Each migration runs in a single transaction. If the migration file is
 *    already wrapped in BEGIN/COMMIT (as our 0001 is), the runner detects
 *    that and skips wrapping to avoid nested-tx errors.
 */

export interface MigrationRecord {
  name: string;
  run_on: Date;
}

export interface RunMigrationsOptions {
  migrationsDir: string;
  databaseUrl?: string;
  log?: (msg: string) => void;
}

const TRACKING_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS public.pgmigrations (
  id     SERIAL PRIMARY KEY,
  name   VARCHAR(255) NOT NULL UNIQUE,
  run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

function stripExtension(filename: string): string {
  return filename.replace(/\.sql$/i, '');
}

function isPreWrappedTransaction(sql: string): boolean {
  // Detect a leading BEGIN; / END BEGIN / etc. (case-insensitive, comment-tolerant).
  const stripped = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')
    .trim();
  return /^begin\b/i.test(stripped);
}

async function listMigrationFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
}

async function getAppliedMigrations(pool: import('./client.js').Pool): Promise<Set<string>> {
  await pool.query(TRACKING_TABLE_DDL);
  const result = await pool.query<MigrationRecord>(
    'SELECT name, run_on FROM public.pgmigrations ORDER BY id',
  );
  return new Set(result.rows.map((r) => r.name));
}

export async function runPendingMigrations(options: RunMigrationsOptions): Promise<{
  applied: string[];
  skipped: string[];
}> {
  const { migrationsDir } = options;
  const log = options.log ?? ((msg: string) => console.warn(msg));

  const pool = createPool({
    ...(options.databaseUrl !== undefined ? { connectionString: options.databaseUrl } : {}),
    max: 2,
    applicationName: 'qorium-migrate',
  });

  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    const alreadyApplied = await getAppliedMigrations(pool);
    const files = await listMigrationFiles(migrationsDir);

    for (const file of files) {
      const name = stripExtension(file);
      if (alreadyApplied.has(name)) {
        skipped.push(name);
        continue;
      }

      const path = join(migrationsDir, file);
      const sql = await readFile(path, 'utf8');

      log(`applying ${basename(file)} ...`);

      const client = await pool.connect();
      try {
        if (isPreWrappedTransaction(sql)) {
          // The migration manages its own BEGIN/COMMIT. Run it raw.
          await client.query(sql);
        } else {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('COMMIT');
        }

        await client.query(
          'INSERT INTO public.pgmigrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [name],
        );
        applied.push(name);
        log(`  applied ${name}`);
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // Pre-wrapped migrations may have already aborted; ignore.
        }
        throw err;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }

  return { applied, skipped };
}

export async function migrationStatus(
  options: Pick<RunMigrationsOptions, 'migrationsDir' | 'databaseUrl'>,
): Promise<{ applied: string[]; pending: string[] }> {
  const pool = createPool({
    ...(options.databaseUrl !== undefined ? { connectionString: options.databaseUrl } : {}),
    max: 1,
    applicationName: 'qorium-migrate-status',
  });

  try {
    const alreadyApplied = await getAppliedMigrations(pool);
    const files = await listMigrationFiles(options.migrationsDir);
    const all = files.map(stripExtension);
    return {
      applied: all.filter((n) => alreadyApplied.has(n)),
      pending: all.filter((n) => !alreadyApplied.has(n)),
    };
  } finally {
    await pool.end();
  }
}
