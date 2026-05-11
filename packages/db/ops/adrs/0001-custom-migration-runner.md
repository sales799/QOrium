# ADR 0001 (db) — Custom migration runner instead of node-pg-migrate / sqitch / Prisma Migrate

**Status:** Accepted
**Date:** 2026-04-15 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Tech Stack — deviation justified), SO-3 (Quality Gate Discipline)
**Reviewers:** CTO (sole, Y1)

---

## Context

QOrium needs to run database migrations. The schema lives in `infra/B7-postgres-migrations/` as raw SQL files (canonical, authored by CTO Office). The question is: which tool runs them?

Options surveyed at Sprint 0:

1. **node-pg-migrate** — established, well-maintained, opinionated about file naming conventions
2. **sqitch** — Perl-based, Postgres-specific, plan-file model
3. **Prisma Migrate** — TypeScript-native, but tightly coupled to Prisma ORM (which we don't use; see `packages/db/ops/README.md` ADR rationale for ORM rejection)
4. **Knex migrations** — TypeScript-friendly, same coupling problem (Knex query builder we don't use)
5. **Custom runner** — minimal Node script that reads SQL files in order, applies them via `pg`, tracks applied migrations in a `migrations.applied` table

QOrium chose **#5 — custom runner**. This ADR backfills why.

## Decision

**Implement a minimal custom migration runner in `@qorium/db`.** It:

- Reads `.sql` files from a configurable directory (default: `infra/B7-postgres-migrations/`)
- Applies them in lexicographic order (`001_initial.sql`, `002_add_questions_table.sql`, ...)
- Tracks applied migrations in a `migrations.applied` table (filename + sha256 of contents + timestamp)
- Refuses to apply a migration whose checksum doesn't match the previously-recorded checksum (immutability check)
- Exposes `migrate:up` (apply pending) + `migrate:down --steps=N` (eligible-scenario rollback only — see `runbooks/migration-discipline.md`)

## Consequences

### Positive

- **Zero dependency surface for the migration mechanism.** Just `pg` + node fs/crypto. No supply-chain risk specific to migration tooling.
- **Trivial to debug.** When something goes wrong with a migration, the entire runner is ~150 lines of code. Open it, read it.
- **Schema source-of-truth is the SQL files** (per `packages/db/README.md`), not a tool's plan-file abstraction. CTOs can read raw SQL forever; tool conventions evolve.
- **Forward-only by construction** — `migrate:down` exists but is gated on the eligible-scenario check (per `runbooks/migration-discipline.md`); the default workflow is forward-only via new corrective migrations, not reversal.
- **Checksum verification catches schema-file tampering.** If someone edits a migration after it's already been applied to prod, the next `migrate:up` notices the checksum mismatch and refuses.

### Negative

- **No fancy features** — no schema diffing, no auto-rollback transactions, no out-of-the-box up/down pairs. The team writes raw SQL and lives with it.
- **More CTO discipline required.** With node-pg-migrate, conventions are enforced by the tool. Here, the team enforces them by review (per `gatekeeper/release-gate-protocol.md`).
- **No migration-template generator.** Writing `002_add_foo.sql` is manual; tools auto-stub. Acceptable cost for control.

### Neutral / observations

- Small migration count (Y1: ~15-20 migrations expected) keeps the manual discipline tractable. Re-evaluate at 100+ migrations.
- The `migrations.applied` table sits in its own `migrations` schema to avoid conflict with app schemas

## Alternatives considered

### Alternative 1: node-pg-migrate

Rejected. Adds a dependency tree just for the runner; we'd still write raw SQL underneath; tool conventions (file naming, `up`/`down` pairs) become rules to learn. Net: marginal benefit over custom.

### Alternative 2: sqitch

Rejected. Perl runtime on the VPS; team isn't Perl-fluent; introducing a non-Node tool just for migrations creates an operational fork.

### Alternative 3: Prisma Migrate / Knex migrations

Rejected. Both couple to ORM/query-builder layers we don't use. Adopting them just for migrations means installing the parent abstraction we explicitly chose to avoid (per `packages/db/README.md` "raw SQL via `pool.query()` is the standard").

### Alternative 4: Liquibase / Flyway

Rejected. JVM runtime; same operational-fork problem as sqitch.

## Implementation notes

- **Source:** `packages/db/src/migrate.ts` (or equivalent)
- **Tracking table:** `migrations.applied` with columns: `filename TEXT PRIMARY KEY`, `checksum TEXT NOT NULL`, `applied_at TIMESTAMPTZ DEFAULT now()`
- **CLI:** `pnpm --filter @qorium/db migrate:up` and `migrate:down --steps=N`
- **Migration files location:** `infra/B7-postgres-migrations/` (per `packages/db/README.md`)
- **Naming convention:** `NNN_<short_description>.sql` where NNN is zero-padded sequence
- **Tests:** `packages/db/__tests__/migrate.test.ts` covers up + down + checksum verification + dry-run
- **Commit:** `0a74e6f` (Sprint 0 — @qorium/db with custom migration runner)

## Verification

- `pnpm --filter @qorium/db test` — all migration runner tests pass
- Manual: in dev container, run `migrate:up` → `migrate:down --steps=1` → `migrate:up` round trip; data preserved across the cycle
- gitleaks: `qorium:qorium_test@` allowlist entry handles the test-fixture password without false-positive

## References

- Constitution SO-13 (Tech Stack — Postgres standard; tool choice rationalized via this ADR)
- Constitution SO-3 (Quality Gate — migrations land via PR review)
- `packages/db/README.md` — usage examples
- `infra/B7-postgres-migrations/` — schema source-of-truth
- `packages/db/ops/runbooks/migration-discipline.md` — operational discipline derived from this ADR
- `cto/runbooks/deploy-rollback.md` §migrations — deploy-time interaction
