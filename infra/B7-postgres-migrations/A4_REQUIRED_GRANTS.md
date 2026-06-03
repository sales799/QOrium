# A4 — required Postgres grants (runtime application)

The A4 send-pack → candidate-portal → grader flow persists scored rows to
`content.responses` via the qorium-api/readybank service. That service runs
under the least-privilege `qorium_app` role (`DATABASE_URL` in the pm2 env),
which did NOT hold INSERT on `content.responses` before A4 — nothing wrote
that table previously; A4 is the first writer. Without the grant the grader
fails with PG error `42501 permission denied for table responses` and the
candidate sees a 500.

## What was applied to production (2026-06-03)

Applied manually on the active origin by the privileged `qorium` role during
A4 enablement. `GRANT` is idempotent — re-running is a harmless no-op.

```sql
-- Minimum grants required for /a4/grade to persist a response row.
GRANT INSERT, SELECT ON content.responses TO qorium_app;
```

Verification:

```sql
SELECT
  has_table_privilege('qorium_app', 'content.responses', 'INSERT') AS ins,
  has_table_privilege('qorium_app', 'content.responses', 'SELECT') AS sel;
-- expected: (true, true)
```

## How to fold this into the migration series — READ FIRST

**Do not pick a migration number on this branch.** This branch
(`codex/qorium-a4-send-flow-*`, descended from
`claude/setup-qorium-build-agent-zA0l5`) is the *divergent sibling* called
out in `governance/incidents/2026-05-10-migration-divergence.md`. Its local
`0003–0015` numbering does NOT match `main`. The single source of truth for
migration numbers is **`infra/B7-postgres-migrations/RESERVED.md` on `main`**,
enforced by `.github/workflows/migration-numbering.yml`.

As of 2026-06-03, `main`'s RESERVED.md shows `0001–0015` applied and
**next-available = 0016**. Phase B reconciliation also plans to renumber this
sibling's migrations onto `0016+`, so the A4 grant migration's final number
must be chosen by the **migration owner against `main`**, in coordination with
that reconciliation — not pre-assigned here.

Recommended procedure for whoever lands this on `main`:

1. On a branch cut from `main`, reserve the next-free number in RESERVED.md
   (add a row, status `RESERVED`, owner = your branch) in the same PR.
2. Create `infra/B7-postgres-migrations/NNNN_a4_app_role_grants.sql`:

   ```sql
   BEGIN;
   GRANT INSERT, SELECT ON content.responses TO qorium_app;
   COMMIT;
   ```

3. When migration 0015-equivalent (`content.invitations`, `content.attempts`,
   `content.responses.attempt_id`) lands on `main`, extend with:

   ```sql
   GRANT INSERT, SELECT, UPDATE ON content.invitations TO qorium_app;
   GRANT INSERT, SELECT, UPDATE ON content.attempts    TO qorium_app;
   ```

4. When the `content.grade_decisions` table lands (the "0019" in the CTO
   brief — verify its final number on `main`'s RESERVED.md, as 0019 is also
   referenced for `saml_sessions` in some docs), extend with:

   ```sql
   GRANT INSERT, SELECT ON content.grade_decisions TO qorium_app;
   ```

This file is documentation only — it is intentionally NOT a numbered `.sql`
migration, so the numbering CI guard ignores it.
