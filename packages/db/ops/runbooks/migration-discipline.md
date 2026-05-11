# Runbook — Migration Discipline (Forward-Only)

**Owner:** CTO Office · **Authority:** ADR 0001 (custom migration runner) + Constitution SO-3 (Quality Gate Discipline)
**Cadence:** Per migration shipped + per rollback decision

---

## The forward-only rule

**Migrations are forward-only in production.** If a migration is wrong, the fix is a NEW forward migration, not a rollback. `migrate:down` exists but is gated on a strict eligible-scenario check (next section) — the default workflow never uses it.

Why: rolling back a migration AFTER production traffic has written data using the new schema causes data loss or data corruption. There is no general "undo" for a migration that's been live; only forward fixes preserve data integrity.

---

## When `migrate:down` IS eligible (the rare exception)

ALL of the following must be true:

- [ ] The migration was applied to production in the last <5 minutes
- [ ] No production traffic has hit the new schema yet (verify via DB query: row count on the affected table = 0 OR unchanged from pre-migration baseline)
- [ ] The migration's only change is non-destructive: `CREATE TABLE`, `ADD COLUMN` (with default that's been backfilled), `CREATE INDEX`, etc.
- [ ] CTO + GATEKEEPER both approve in writing (Slack screenshot or PR comment is sufficient documentation)

If ANY of the above fails → migration is INELIGIBLE for rollback. Use forward-fix instead (next section).

---

## Forward-fix workflow (the default)

When a migration is wrong:

### Step 1 — Stop new code reaching the bad schema state

If the issue is "the app is now broken because of this migration":

- Roll back the CODE per `cto/runbooks/deploy-rollback.md` to a SHA that doesn't reference the new schema state
- The DB stays at the new state; the code returns to behaving against the OLD state
- This is acceptable because schema changes are typically additive (new columns are NULL-able, new tables sit empty, new indexes are unused)

### Step 2 — Author the corrective migration

Write a new SQL file in `infra/B7-postgres-migrations/`:

- Filename: `NNN_revert_<bad-migration-name>.sql` where NNN is the next sequence number
- Body: SQL that returns the schema to the desired state (drop the bad table, drop the bad column, etc.)
- Comment block at top citing the bad migration's filename + commit SHA + reason

### Step 3 — Apply the corrective migration

PR → review → merge → `migrate:up` runs as part of normal deploy → schema converges to the desired state.

### Step 4 — Document

- Add to `cto/tech-debt.md` if the failure pattern is recurring (e.g., "tests didn't catch this because we don't have a migration-rehearsal env" → tech-debt item)
- Postmortem if customer-facing impact (per `cto/runbooks/incident-response.md` Step 7)

---

## Migration authoring checklist (per migration before shipping)

Pre-PR checks:

- [ ] Filename matches `NNN_<description>.sql` convention (zero-padded sequence)
- [ ] All DDL is idempotent OR explicitly fails fast on conflict (e.g., `CREATE TABLE IF NOT EXISTS` ONLY for genuinely-idempotent operations; otherwise fail fast)
- [ ] Adding a NOT NULL column? Verify default value works for existing rows (or split into two migrations: add nullable + backfill + alter to NOT NULL)
- [ ] Renaming a column? **Avoid.** Add new + dual-write + retire old in 3 migrations. NEVER `ALTER TABLE ... RENAME COLUMN` in a single migration on a live table.
- [ ] Dropping a column? Verify no app code references it. Use `git grep` on the column name across `services/` + `packages/`.
- [ ] Adding an index on a large table? Use `CREATE INDEX CONCURRENTLY` (PostgreSQL specific) to avoid blocking writes.
- [ ] Migration runs in <30 seconds on a representative dataset (test on staging first; production tables grow)
- [ ] If migration takes >30s on production-size data, plan a maintenance window OR split into smaller migrations

---

## Pre-deploy verification

Before any migration applies to production:

1. **CI green:** the migration file has been parsed by `pnpm --filter @qorium/db test` (which runs migrations against a test container per `.github/workflows/ci.yml` test job)
2. **GATEKEEPER release-gate signed off** per `gatekeeper/release-gate-protocol.md` Section 1
3. **Backup taken:** manual `pg_dump` from production before `migrate:up` runs (per `services/readybank/ops/runbooks/api-deploy.md` Step 4)
4. **CTO + GATEKEEPER both approve** the migration content (Y1 = CTO solo with audit-log discipline; Y2+ separation of duties)

---

## Production migration execution

### Standard flow

```bash
# On VPS:
ssh -p 2244 root@147.93.103.194
cd /opt/apps/qorium-monorepo

# Backup first
pg_dump $DATABASE_URL > /var/backups/qorium-db-$(date +%Y%m%d-%H%M%S).sql

# Apply migrations
pnpm --filter @qorium/db migrate:up

# Verify
pnpm --filter @qorium/db migrate:status
```

The migration runner outputs which files were applied + their checksums. Capture this output in the deploy log per `gatekeeper/release-signoffs/<date>.md`.

### Failure modes during apply

| Failure                                                                         | Action                                                                                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Migration SQL syntax error** (rare; CI would have caught)                     | Migration runner errors out; previous state unchanged. Fix SQL; re-run.                                               |
| **Migration timeout (>statement_timeout)**                                      | DB rolls back; runner reports failure. Either bump statement_timeout for the migration window OR split the migration. |
| **Lock contention** (e.g., another migration in progress, or app holding locks) | Runner waits + retries 3x; if still locked, fails. Investigate locking session via `SELECT * FROM pg_stat_activity`   |
| **Disk full**                                                                   | Migration fails partway; transactional DDL means partial state is rolled back. Free space; re-run.                    |
| **Network blip mid-migration**                                                  | DB connection drops; transaction rolls back; runner reports failure. Re-run.                                          |

---

## Pattern catalog (common migration shapes)

### Adding a NULL-able column (safe, common)

```sql
-- 015_add_question_anti_leak_metadata.sql
ALTER TABLE content.questions
  ADD COLUMN anti_leak_status TEXT,
  ADD COLUMN anti_leak_last_scan TIMESTAMPTZ;
COMMENT ON COLUMN content.questions.anti_leak_status IS
  'Per SO-22; "clean" or "retired"; updated by anti-leak engine';
```

Forward-only: dropping the column later requires an inverse migration after verifying no code references it.

### Adding a NOT NULL column (multi-step, safer)

```sql
-- 016_add_irt_calibrated_at.sql — Step 1: nullable
ALTER TABLE content.questions ADD COLUMN irt_calibrated_at TIMESTAMPTZ;

-- 017_backfill_irt_calibrated_at.sql — Step 2: backfill
UPDATE content.questions SET irt_calibrated_at = NOW() WHERE irt_calibrated_at IS NULL;

-- 018_irt_calibrated_at_not_null.sql — Step 3: enforce
ALTER TABLE content.questions ALTER COLUMN irt_calibrated_at SET NOT NULL;
```

Three migrations across three deploys, but data integrity preserved at every step.

### Renaming a column (DON'T — use add+migrate+retire pattern instead)

```sql
-- 020_add_difficulty_band.sql — Step 1: add new column
ALTER TABLE content.questions ADD COLUMN difficulty_band INTEGER;
UPDATE content.questions SET difficulty_band = difficulty_score WHERE ...;

-- 021_app_dual_writes.sql + code change — Step 2: app writes both columns

-- 030_drop_difficulty_score.sql — Step 3 (after several deploys + code-side cleanup):
ALTER TABLE content.questions DROP COLUMN difficulty_score;
```

Multi-deploy operation; never single-migration.

### Dropping a table (delicate)

```sql
-- First migration: rename to deprecated_<table>
ALTER TABLE content.old_table RENAME TO content.deprecated_old_table_2026_05;

-- Wait at least 30 days. If no issues, second migration:
DROP TABLE content.deprecated_old_table_2026_05;
```

The 30-day window is the safety budget; plenty of time to discover that something still depends on the table.

---

## Anti-patterns (don't do these)

- ❌ **`migrate:down` on production "to fix a tiny issue."** Forward-fix is always safer.
- ❌ **Editing a migration file after it's been applied to prod.** Checksum verification catches this; never override.
- ❌ **Single-migration column rename.** Always add+migrate+retire.
- ❌ **Migration in the same PR as code that depends on the new schema, when migrations apply pre-deploy.** Risk: if migration succeeds but code deploy fails, schema is ahead of code. Sequence: ship migration first (separate deploy), then ship code that uses it.
- ❌ **DROP TABLE / DROP COLUMN without 30-day soak.** Reversibility evaporates.

---

## Y1 reality

QOrium has shipped a small number of migrations as part of `infra/B7-postgres-migrations/`. Production traffic = zero (no live ReadyBank API customers). Once first customer onboards, every word of this runbook becomes binding.

This runbook gets updated:

- After every production migration that surfaces a new pattern worth catalogging
- After every postmortem that traces back to a migration discipline gap
- At each Phase Gate milestone review

---

_Cross-references: ADR 0001 in this folder (custom migration runner — the foundation), Constitution SO-3, `cto/runbooks/deploy-rollback.md` §migrations (parent), `services/readybank/ops/runbooks/api-deploy.md` Step 4 (consumer of this discipline), `gatekeeper/release-gate-protocol.md` (every migration passes the gate). Schema source-of-truth: `infra/B7-postgres-migrations/`._
