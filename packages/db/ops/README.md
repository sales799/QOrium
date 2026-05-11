# @qorium/db — Package Operating Folder

**Package status:** Shipped (PR #3). PostgreSQL connection pool + custom migration runner. Consumed by `services/readybank` and any future DB-using service.
**Owner:** CTO Office (engineering)
**Source-of-truth README:** [`packages/db/README.md`](../README.md)
**Schema source-of-truth:** `infra/B7-postgres-migrations/` (canonical, authored by CTO Office; this package CONSUMES the SQL files, doesn't own them)
**Constitutional authority:** SO-13 (Tech Stack — PostgreSQL standard), SO-3 (Quality Gate)

---

## Why this folder

The DB layer is foundational + irreversible. Migrations especially have a "ship and you can't take it back without data loss" property. The team needs:

1. A clear ADR for the custom migration runner (vs an off-the-shelf tool)
2. A binding migration discipline runbook (forward-only; no `migrate:down` on prod)
3. Numerical SLOs for connection pool health + migration latency

This folder owns those.

---

## Folder structure

```
packages/db/ops/
├── README.md                              ← you are here
├── adrs/
│   └── 0001-custom-migration-runner.md    ← why we built our own vs node-pg-migrate / sqitch
└── runbooks/
    └── migration-discipline.md            ← forward-only rule + edge cases
```

SLOs for the DB layer live in `cto/sli-slo.md` operational section + `services/readybank/ops/sli-slo.md` (which depends on DB performance for its own targets); duplicating here would drift.

---

## What @qorium/db does (high-level)

Per `packages/db/README.md`:

- Exports `createPool({ applicationName })` — wrapped `pg.Pool` with QOrium defaults
- Exports `ping(pool)` — health-check helper (returns boolean)
- Exposes a custom migration runner (`migrate:up`, `migrate:down`) that consumes SQL files from `infra/B7-postgres-migrations/`

---

## What @qorium/db does NOT do

- ❌ NOT an ORM. Direct SQL via `pool.query()` is the standard (per CTO Architecture); ORMs add complexity for marginal benefit.
- ❌ NOT a query builder. Same reason.
- ❌ NOT the schema source-of-truth. The SQL migration files in `infra/B7-postgres-migrations/` are canonical; this package executes them.
- ❌ NOT a connection-string builder. Connection params come from env vars per `.env.example`; the package consumes them.
- ❌ NOT a multi-DB / multi-tenant abstraction. One PostgreSQL instance per QOrium environment; multi-tenancy is at the DATA level (per-vault `vault_uuid`), not the connection level.

---

## Cadence

| Cadence                           | Activity                                                                          | Owner            |
| --------------------------------- | --------------------------------------------------------------------------------- | ---------------- |
| **Per migration ship**            | Author SQL + verify reversibility (or document forward-only-irreversible reason)  | CTO              |
| **Per deploy**                    | `migrate:up` runs as part of `cto/runbooks/deploy-rollback.md` standard procedure | CTO              |
| **Per migration rollback** (rare) | Per `runbooks/migration-discipline.md` eligible-scenario gate                     | CTO              |
| **Quarterly**                     | Connection pool sizing review (any saturation?)                                   | CTO              |
| **Quarterly**                     | Migration history audit (any rollbacks? any forward-fixes? what patterns?)        | CTO + GATEKEEPER |

---

## Constitutional anchors

- **SO-13** Tech Stack — PostgreSQL adopted; deviations require ADR
- **SO-3** Quality Gate — migrations land via PR review; no direct prod schema changes
- **SO-15** Zero Secrets — `DATABASE_URL` is env-var only, never committed (gitleaks enforces; allowlist for test fixture in `packages/db/README.md` per `.gitleaks.toml`)
- **CTO Architecture §B7** — full B-series spec for the migration plan

---

## Cross-references

| Topic                                      | Lives at                                                                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Package README**                         | [`packages/db/README.md`](../README.md)                                                                                                                                                              |
| **Source code**                            | [`packages/db/src/`](../src/)                                                                                                                                                                        |
| **Test suite**                             | [`packages/db/__tests__/`](../__tests__/)                                                                                                                                                            |
| **Schema source-of-truth (the SQL files)** | `infra/B7-postgres-migrations/`                                                                                                                                                                      |
| **Consumed by**                            | [`services/readybank/`](../../../services/readybank/), [`packages/auth/`](../../../packages/auth/) (audit log writes)                                                                                |
| **Migration discipline runbook**           | [`runbooks/migration-discipline.md`](./runbooks/migration-discipline.md)                                                                                                                             |
| **Deploy rollback (where migrations fit)** | [`cto/runbooks/deploy-rollback.md`](../../../cto/runbooks/deploy-rollback.md), [`services/readybank/ops/runbooks/api-deploy.md`](../../../services/readybank/ops/runbooks/api-deploy.md) §migrations |
| **DB SLOs**                                | [`cto/sli-slo.md`](../../../cto/sli-slo.md) operational section + [`services/readybank/ops/sli-slo.md`](../../../services/readybank/ops/sli-slo.md)                                                  |

---

_Maintained by CTO Office. Authority: Constitution §2.3._
