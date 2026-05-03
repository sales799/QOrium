# CTO-DELTA: custom migration runner instead of node-pg-migrate

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** **RATIFIED 2026-05-03** by CTO Office (Sprint 1.1)
**Reconcile against:** `infra/B7-postgres-migrations/README.md` (canonical layout preserved)

## Ratification (CTO Office, 2026-05-03)

**Decision: `packages/db/src/migrate.ts` — the thin custom runner — is the canonical migration tool for QOrium at this scale.**

Rationale:

- The custom runner is ~150 lines of TS we own and can extend (RLS policies, partitioning, multi-tenancy guards) without fighting an upstream CLI parser.
- It consumes the canonical `NNNN_name.sql` filename layout from `infra/B7-postgres-migrations/` exactly — no rename of Cowork-authored content required.
- State is tracked in `public.pgmigrations`, the same table `node-pg-migrate` uses, so a future switch (if ever justified by scale) is a cheap drop-in.
- sqitch is heavier than QOrium needs at this scale and is not TypeScript-native; deferred indefinitely.
- B7 README's intent (SQL-first, sequential numbering, in-file rollback comments, single-transaction atomicity) is preserved verbatim.

**Operational impact:** None. `pnpm migrate:up` / `pnpm migrate:status` are already wired and verified across 2 migrations (0001, 0002). Future enhancement: `down` subcommand when a migration first needs to be rolled back; punted until a real need surfaces.

## Background

The B7 README recommends `node-pg-migrate` (or sqitch). When attempted with the canonical filename `0001_initial_schema.sql`:

```
$ node-pg-migrate up --migrations-dir ../../infra/B7-postgres-migrations --migration-file-language sql
Can't determine timestamp for README.md
Can't determine timestamp for 0001
Error: Can't get migration files: ...
```

`node-pg-migrate` v7.9 expects ms-epoch timestamp prefixes (e.g. `1715846400000_initial_schema.sql`), and it tries to load `README.md` as a JavaScript migration despite the `--migration-file-language sql` flag.

Renaming the canonical file to a timestamp form would (a) modify Cowork-authored content (handoff §6 says specs are read-only) and (b) break filename ordering (`0001`, `0002` is more readable than `1715846400000`, `1715946400000`).

## Adaptation

`packages/db/src/migrate.ts` is a ~150-line custom runner that:

- Reads `*.sql` files from `infra/B7-postgres-migrations/`, sorted lexically (`0001_*` before `0002_*`).
- Tracks applied migrations in `public.pgmigrations` — **same table name node-pg-migrate uses**, so a future switch is a no-op (`SELECT name, run_on FROM public.pgmigrations`).
- Detects pre-wrapped `BEGIN; ... COMMIT;` files (as our 0001 is) and runs them raw to avoid nested-transaction errors.
- Provides `up` and `status` subcommands; rollback (`down`) deferred — the rollback SQL is in comments at the bottom of each migration; future runner enhancement when needed.

CLI:

```
$ qorium-db up      # apply all pending
$ qorium-db status  # list applied vs pending
```

The B7 README's intent is preserved: SQL-first migrations, sequential numbering, in-file rollback comments, single-transaction atomicity.

## Verification

```
$ DATABASE_URL=postgresql://qorium:qorium_dev_password@localhost:5432/qorium pnpm migrate:up
applying 0001_initial_schema.sql ...
  applied 0001_initial_schema
Applied 1 migration(s): 0001_initial_schema

$ pnpm migrate:status
Applied (1):
  ✓ 0001_initial_schema
Pending (0):
```

Schema verified: `app.{users,tenants,tenant_users,api_keys}`, `content.{skills,sub_skills,roles,role_skills,questions,question_variants,responses,leak_alerts}`, `audit.events` all present.

## Reconciliation request to CTO Office

Either:

1. **Ratify** — keep this thin custom runner. Pros: handles the canonical filename format; ~150 lines of code we own and can extend (RLS policies, partitioning) without fighting the upstream parser.
2. **Reject** — rename migrations to ms-epoch timestamps, switch to `node-pg-migrate`. Costs renaming canonical files (1 today, more later), and B7's `0001`-style numbering is lost.
3. **Switch to sqitch** — the README's other suggestion. Heavier setup; sqitch handles arbitrary filenames but isn't TypeScript-native. Out of scope for Sprint 0.3; can revisit.

Default action if no reconciliation by next sprint review: assume **ratify** (option 1).
