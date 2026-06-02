# @qorium/db

Database client and migration runner.

**Schema source-of-truth:** `infra/B7-postgres-migrations/` (canonical, authored by CTO Office). This package consumes those SQL files via `node-pg-migrate`; it does **not** own the schema.

## Usage

```ts
import { createPool, ping } from '@qorium/db';

const pool = createPool({ applicationName: 'qorium-readybank' });

if (!(await ping(pool))) {
  throw new Error('Cannot reach Postgres');
}

const { rows } = await pool.query<{ count: string }>(
  'SELECT count(*)::text AS count FROM content.questions WHERE status = $1',
  ['released'],
);
```

## Migrations

The migration runner is a thin custom runner (`src/migrate.ts` + CLI in `src/cli.ts`)
that reads SQL files from the canonical `infra/B7-postgres-migrations/` directory.

`node-pg-migrate` was attempted first but cannot parse the canonical `NNNN_name.sql`
filename format (it expects ms-epoch timestamps). See
[`infra/CTO-deltas/CTO-DELTA-migration-runner.md`](../../infra/CTO-deltas/CTO-DELTA-migration-runner.md).
Tracking table is `public.pgmigrations` — same name node-pg-migrate uses, so a
future switch is a no-op.

| Command               | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `pnpm migrate:up`     | Apply all pending migrations (idempotent) |
| `pnpm migrate:status` | List applied vs pending migrations        |

Rollback (`down`) is intentionally not yet implemented; `0001_initial_schema.sql`
contains rollback SQL in trailing comments that can be applied manually if
needed. A `down` subcommand will be added when migration `0002` lands.

`DATABASE_URL` must be set; or `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_USER`
/ `POSTGRES_PASSWORD` / `POSTGRES_DB` (composes a URL).

## Smoke test

The migration smoke test (`__tests__/migration.smoke.test.ts`) verifies that the
canonical schema applies cleanly and produces the expected table layout
(`app.*`, `content.*`, `audit.*`) plus a couple of CHECK constraints.

Run it after `pnpm migrate:up`:

```bash
DATABASE_URL=postgresql://localhost:5432/qorium_test pnpm test
```

The test auto-skips when `DATABASE_URL` / `QORIUM_TEST_DATABASE_URL` is unset
(so the suite stays green on environments without a Postgres available, e.g.
local lint runs).
