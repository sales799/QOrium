# A4 — required Postgres grants (runtime application)

The A4 send-pack → candidate-portal → grader flow (this PR) persists scored
rows to `content.responses` via the qorium-api service. That service runs
under the least-privilege `qorium_app` role (`DATABASE_URL` in the pm2 env),
which in the current production database does NOT yet hold INSERT on
`content.responses`. Without the grant the grader fails with PG error
`42501 permission denied for table responses` and the candidate sees a 500.

These grants were applied manually on the VPS during A4 enablement
(2026-06-03) by the privileged `qorium` role. They are recorded here so they
can be re-applied (idempotently) on staging and any rebuilt cluster, and so
the next migration in the numeric series can fold them into a proper
`infra/B7-postgres-migrations/00XX_a4_app_role_grants.sql` file once the
slot is allocated by the migration owner.

```sql
-- Minimum grants required for /a4/grade to persist a response row.
GRANT INSERT, SELECT ON content.responses TO qorium_app;
```

When migration 0015 (`content.invitations`, `content.attempts`,
`content.responses.attempt_id`) lands, also grant:

```sql
GRANT INSERT, SELECT, UPDATE ON content.invitations TO qorium_app;
GRANT INSERT, SELECT, UPDATE ON content.attempts    TO qorium_app;
```

When migration 0019 (`content.grade_decisions`) lands, also grant:

```sql
GRANT INSERT, SELECT ON content.grade_decisions TO qorium_app;
```

## Verification

```sql
SELECT
  has_table_privilege('qorium_app', 'content.responses', 'INSERT') AS ins,
  has_table_privilege('qorium_app', 'content.responses', 'SELECT') AS sel;
-- expected: (true, true)
```
