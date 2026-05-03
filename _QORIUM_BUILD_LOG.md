# QOrium Build Log

A running log of the parallel Claude Code build session.
Cowork session reads this to know what's been built.

---

## 2026-05-03 — Sprint 0 kickoff (bounded)

Per CTO recommendation and user "go": initial work was bounded to Sprint 0.1 + 0.2,
since the §2 required-reading specs were not present in this environment at session
start. Bounded scope: only work fully specified by handoff §3 (tech stack) and §4
(repo layout).

### Sprint 0.1 — Monorepo bootstrap ✅

- pnpm workspace, TS strict, ESLint flat config, Prettier
- Husky + lint-staged + gitleaks pre-commit
- `.env.example`, `.gitignore`, `tsconfig.base.json`
- PR #1 (draft): https://github.com/sales799/QOrium/pull/1

### Sprint 0.2 — Dev orchestration ✅

- `infra/docker/docker-compose.dev.yml`: postgres 16, redis 7, minio + bucket-init,
  judge0 1.13.1 (with its own pg+redis to avoid schema collision)
- `Makefile`: `dev-up`, `dev-down`, `dev-reset`, `dev-logs`, `dev-ps`,
  `compose-config`, `typecheck`, `lint`, `format`, `test`, `build`, `secrets-scan`
- README quickstart + prerequisites + quality bars

---

## 2026-05-03 — Spec ingest + canonical wire-up ✅

User pushed binding specs from the Cowork Mac to `sales799/qorium:specs` (146 files,
46k insertions). PR #2 ingests them into the build branch and wires the canonical
configs into the locations the toolchain expects.

### What landed

- All Constitution / Architecture / blueprint / SKU docs at repo root
- `customer-zero/` — Wave 1 + Wave 2 + Wave 3 question batches, recruiter onboarding,
  reference-panel governance, Talpro Customer Zero kickoff materials
- `governance/` — 92-pt Quality Gate scorecard, AI plagiarism benchmark, bias
  detection methodology, incident response runbook, operating rituals, investor brief
- `infra/` — B1, B5, B6, B7, B10 plus design specs for Anti-Leak, JD-Forge,
  IRT calibration, Judge0 sandbox, SSO/SAML, webhooks, billing, ATS connectors,
  audit log API, Talpro internal API key spec
- `task_plan_phase0_phase1.md`

### Wire-up changes (in this PR)

- `.github/workflows/ci.yml` — pnpm-port of `infra/B5-CI-Pipeline.github-actions.yml`
  (delta: `infra/CTO-deltas/CTO-DELTA-CI-pnpm-adoption.md`)
- `.gitleaks.toml` — gitleaks v8-valid form mirroring intent of
  `infra/B6-gitleaks-config.yaml` (delta:
  `infra/CTO-deltas/CTO-DELTA-gitleaks-v8-syntax.md`)
- `ecosystem.config.cjs` at repo root — re-exports `infra/B10-ecosystem.config.js`
- `infra/package.json` — CJS scope override so B10 (`module.exports`) works under
  root `"type": "module"`
- `.env.example` — service ports updated to canonical PM2 5101–5104 (was 4001–4005)

### Discrepancies surfaced (logged as CTO-DELTAs, not blockers)

| Topic                                                                       | Resolution                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Node version: arch §2.2 says 22, B5 CI says 20                              | CI pinned to 20 (B5 canonical); `engines.node` is `>=20` so both pass |
| Test coverage: arch §12 says 70%, B5 + 92-pt Gate say 80%                   | 80% per newer docs                                                    |
| Migration tool: handoff suggested Drizzle, B7 README says `node-pg-migrate` | Sprint 0.3 will use `node-pg-migrate` (canonical)                     |
| Schema: arch §5.1 illustrative ≠ actual `0001_initial_schema.sql`           | Migration is canonical (UUID PKs, `app/content/audit` schemas)        |
| Package manager: arch implies npm, handoff says pnpm                        | pnpm; CI ported (delta logged)                                        |

### BLOCKED items — all cleared

Specs that were missing at session start are all now present in `main`. Nothing
is blocking Sprint 0.3 onward.

---

## Next up — Sprint 0.3 Database package

Per handoff §5 Item 0.3, adapted to canonical specs:

- `packages/db` workspace
- `node-pg-migrate` runner (per `infra/B7-postgres-migrations/README.md`)
- Move/symlink `infra/B7-postgres-migrations/0001_initial_schema.sql` into the
  `node-pg-migrate` directory layout (`db/migrations/`)
- Typed `pg` connection pool (postgres.js or `pg`); ORM choice deferred to first
  consuming sprint
- Smoke test: migrate up against ephemeral Postgres, verify table count, migrate down

Will ship as PR #3 stacked on PR #2.
