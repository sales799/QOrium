# QOrium PostgreSQL Migrations

**Location:** `/db/migrations/` in the qorium-platform repository  
**Authored by:** CTO Office 2026-05-02  
**Status:** Active — migrations applied starting Month 1

---

## Overview

This directory contains all database schema migrations for QOrium's PostgreSQL instance. Migrations are applied sequentially, are fully reversible (rollback scripts included), and must be reviewed in PR before deployment.

**Key principles:**
- One migration = one atomic schema change (add table, add column, add index, etc.)
- Every migration is reversible (rollback script provided at end of file)
- Migrations are applied in numeric order (0001, 0002, 0003, etc.)
- Zero data loss on rollback (data is preserved; only schema reverted)
- Test all migrations on staging first before production deploy

---

## Running Migrations Locally

### Prerequisites

- Node.js 20 LTS installed
- `node-pg-migrate` (or `sqitch`) installed globally or locally
- PostgreSQL 16+ available (local or remote)
- `.env.local` configured with `DATABASE_URL`

### Install Migration Tool

**Option A: node-pg-migrate (recommended)**

```bash
npm install -g node-pg-migrate
# or
npm install --save-dev node-pg-migrate
```

**Option B: sqitch (alternative)**

```bash
brew install sqitch  # macOS
# or download from https://sqitch.org
```

### Run Migrations Locally

**Initialize (first time):**

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/qorium_dev"
node-pg-migrate create --migrations-dir db/migrations initial_schema
```

**Apply migrations:**

```bash
node-pg-migrate up
```

**Check migration status:**

```bash
node-pg-migrate status
```

**Rollback last migration:**

```bash
node-pg-migrate down
```

**Rollback all migrations:**

```bash
node-pg-migrate down --step -1
```

### Verify Schema

After applying migrations, verify the schema loaded correctly:

```bash
psql $DATABASE_URL -c "\dt"     # List all tables
psql $DATABASE_URL -c "\dn"     # List all schemas
psql $DATABASE_URL -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='app';" # Count app schema tables
```

---

## Running Migrations in CI/CD

The GitHub Actions CI pipeline (B5-CI-Pipeline.github-actions.yml) runs migrations as part of deployment:

1. **Staging deploy**: Migrations applied to staging database before app server restart
2. **Production deploy**: Migrations applied to production database with manual review gate

### CI Migration Logic

```yaml
# In B5-CI-Pipeline.yml (deploy-staging job)
- name: Apply database migrations
  run: |
    export NODE_ENV=staging
    export DATABASE_URL=${{ secrets.DATABASE_URL_STAGING }}
    npx node-pg-migrate up
    echo "✓ Staging migrations applied"

# In deploy-production job
- name: Apply database migrations
  run: |
    export NODE_ENV=production
    export DATABASE_URL=${{ secrets.DATABASE_URL_PROD }}
    npx node-pg-migrate up --step 1  # Apply one migration at a time for safety
    echo "✓ Production migrations applied"
```

---

## Naming Convention

All migration files follow the naming pattern:

```
NNNN_descriptive_name.sql
```

Where:
- `NNNN` = sequential 4-digit number (0001, 0002, 0003, ...)
- `descriptive_name` = kebab-case description of what the migration does
- `.sql` = file extension

**Examples:**
- `0001_initial_schema.sql` — Initial table creation
- `0002_rls_policies.sql` — Row-level security policies
- `0003_add_question_metadata_index.sql` — Add GIN index on jsonb column
- `0004_create_leak_alerts_table.sql` — New leak monitoring table
- `0005_migrate_api_keys_to_hashed.sql` — Hash existing API keys

---

## Migration Best Practices

### 1. One Change Per PR

Each migration should handle ONE logical change (add table, add column, add index, etc.). If you need multiple changes, create multiple migration files.

```sql
-- ✓ GOOD: Single responsibility
-- 0001_initial_schema.sql creates all tables

-- ✓ GOOD: One change
-- 0002_add_question_metadata_index.sql adds ONE index

-- ✗ BAD: Multiple unrelated changes
-- 0001_schema_and_auth_and_analytics.sql
```

### 2. Always Wrap in Transactions

Every migration must be wrapped in `BEGIN` / `COMMIT` (node-pg-migrate does this automatically, but specify explicitly for safety):

```sql
BEGIN;
  CREATE TABLE content.questions (...);
  CREATE INDEX questions_skill_idx ON content.questions (skill_id);
COMMIT;
```

### 3. Test on Staging First

Before deploying to production:

1. Apply migration to staging database
2. Run app against staging (verify no errors)
3. Run smoke tests (`/health` endpoints, sample API calls)
4. Review logs (Sentry, Grafana) for errors

Only then promote to production.

### 4. Provide Rollback Scripts

Every migration MUST include a rollback script at the end:

```sql
-- ... migration SQL ...

-- ROLLBACK
-- DROP TABLE IF EXISTS content.questions CASCADE;
-- DROP TABLE IF EXISTS content.sub_skills CASCADE;
-- DROP TABLE IF EXISTS content.skills CASCADE;
```

### 5. No Destructive Changes Without 2-Person Approval

Destructive changes (DROP TABLE, DELETE column, TRUNCATE) require:
- Two code reviewers on PR
- Explicit approval from both CTO + Tech Lead
- Backup restored before production deploy

### 6. Use JSONB for Flexible Metadata

Instead of adding columns for every new field, store flexible metadata in JSONB:

```sql
-- ✗ BAD: Inflexible
ALTER TABLE questions ADD COLUMN author_name VARCHAR(200);
ALTER TABLE questions ADD COLUMN author_email VARCHAR(200);
ALTER TABLE questions ADD COLUMN author_bio TEXT;

-- ✓ GOOD: Flexible
ALTER TABLE questions ADD COLUMN author_metadata JSONB;
-- Then store: {"name": "...", "email": "...", "bio": "..."}
```

### 7. Index Strategically

Add indexes on:
- Foreign keys (for JOIN performance)
- Frequently filtered columns (status, created_at, etc.)
- GIN indexes on JSONB columns if queried

Do NOT index every column (adds write overhead).

---

## Strict Rules (Non-Negotiable)

1. **No dynamic SQL in migrations** — All queries must be static, reversible, auditable
2. **No data-dependent logic** — Migrations must be idempotent (safe to run multiple times)
3. **Zero TypeScript errors** — If you write a Node.js migration script, it must pass `tsc --noEmit`
4. **Never change enum values mid-production** — If you must add to an enum, create a new table/column, migrate data, then deprecate old
5. **Always include rollback script** — Even if you think rollback is unlikely

---

## Connection Pooling Note

QOrium uses **pgBouncer in transaction mode** (per CTO Architecture §6). This means:

- Each transaction gets a connection from the pool
- Connections are released after COMMIT/ROLLBACK
- Migrations run in single transactions (safe with pooling)
- Avoid long-running migrations (> 5 min) — they block connection pool

If a migration exceeds 5 min, consider breaking it into multiple migrations.

---

## Disaster Recovery (DR)

### PITR Strategy

- **Backup**: Daily snapshots to Cloudflare R2 (15-min RPO target)
- **Retention**: 30 days of continuous point-in-time recovery (PITR)
- **Quarterly test**: Restore snapshot to staging; verify schema + data integrity

### Rollback Procedure

If a migration causes data corruption or app errors:

1. **Immediate**: Rollback app deployment (revert to previous commit)
2. **Database**: Run migration rollback script (usually within 5 min)
   ```bash
   export DATABASE_URL=${{ secrets.DATABASE_URL_PROD }}
   node-pg-migrate down --step 1
   ```
3. **Verification**: Run schema check + app smoke tests
4. **Investigation**: Post-mortem; determine root cause

### Restore from Backup

If rollback doesn't work (data loss detected):

1. **Restore DigitalOcean/RDS backup** to specific point-in-time (< 5 min usually)
2. **Verify schema** (compare against expected schema from git)
3. **Replay migrations** (reapply if backup was from before migration)

---

## Migration Version Strategy

Track which migrations have been applied using the `pgmigrations` table (auto-created by node-pg-migrate):

```sql
SELECT * FROM pgmigrations;
-- Lists: name, run_on
-- Example:
-- | name                         | run_on                 |
-- |------------------------------|------------------------|
-- | 0001_initial_schema          | 2026-05-02 10:15:30+00 |
-- | 0002_rls_policies            | 2026-05-02 10:16:45+00 |
```

---

## Tools & References

| Tool | Purpose | Link |
|------|---------|------|
| **node-pg-migrate** | Recommended migration runner | https://github.com/salsita/node-pg-migrate |
| **sqitch** | Alternative (SQL-native) | https://sqitch.org |
| **PostgreSQL Docs** | Schema reference | https://www.postgresql.org/docs/16/ |
| **pgAdmin** | Web UI for Postgres | https://www.pgadmin.org |

---

## FAQ

### Q: Can I modify a migration after it's been applied to production?
**A:** No. Migrations are immutable once deployed. Create a new migration to modify schema.

### Q: Can I skip a migration?
**A:** No. Migrations must run in order (0001 → 0002 → 0003 ...). If you need to undo one, rollback and reapply.

### Q: What if a migration takes > 5 minutes?
**A:** Break it into multiple smaller migrations. Long migrations block the connection pool and risk timeout.

### Q: How do I add a new column with a default value?
**A:** 
```sql
ALTER TABLE questions ADD COLUMN new_field VARCHAR(100) DEFAULT 'default_value';
```

### Q: How do I rename a column?
**A:**
```sql
ALTER TABLE questions RENAME COLUMN old_field TO new_field;
```

### Q: How do I drop a column?
**A:**
```sql
ALTER TABLE questions DROP COLUMN deprecated_field;
-- Requires 2-person approval + rollback script
```

---

## Ownership & Escalation

| Role | Responsibility |
|------|-----------------|
| **CTO Office** | Review + approve all migrations before merge |
| **Senior Engineer** | Author migrations; ensure reversibility + testing |
| **DevOps (future M9)** | Execute migrations in CI/CD; monitor for errors |
| **Tech Lead** | Approve destructive migrations (DROP, DELETE, TRUNCATE) |

---

## Next Steps

1. **Migration 0002**: Row-level security (RLS) policies (see Constitution SO-9)
2. **Migration 0003**: Audit triggers on sensitive tables
3. **Migration 0004**: Partitioning audit.events by month (production optimization)

---

*End of README. See 0001_initial_schema.sql for full schema definition.*
