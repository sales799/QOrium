#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { migrationStatus, runPendingMigrations } from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default: <repo>/infra/B7-postgres-migrations/
// __dirname is packages/db/dist (after build) or packages/db/src (during dev)
const DEFAULT_MIGRATIONS_DIR = resolve(__dirname, '../../../infra/B7-postgres-migrations');

function parseArgs(argv: string[]): { command: string; migrationsDir: string } {
  const args = argv.slice(2);
  const command = args[0] ?? 'up';
  const dirIdx = args.indexOf('--migrations-dir');
  const migrationsDir =
    dirIdx >= 0 && args[dirIdx + 1] ? resolve(args[dirIdx + 1]!) : DEFAULT_MIGRATIONS_DIR;
  return { command, migrationsDir };
}

async function main(): Promise<void> {
  const { command, migrationsDir } = parseArgs(process.argv);

  switch (command) {
    case 'up': {
      const result = await runPendingMigrations({ migrationsDir });
      if (result.applied.length === 0) {
        console.warn(`No pending migrations. ${result.skipped.length} already applied.`);
      } else {
        console.warn(`Applied ${result.applied.length} migration(s): ${result.applied.join(', ')}`);
      }
      break;
    }
    case 'status': {
      const result = await migrationStatus({ migrationsDir });
      console.warn(`Applied (${result.applied.length}):`);
      for (const name of result.applied) console.warn(`  ✓ ${name}`);
      console.warn(`Pending (${result.pending.length}):`);
      for (const name of result.pending) console.warn(`  • ${name}`);
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Usage: qorium-db <up|status> [--migrations-dir <path>]');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
