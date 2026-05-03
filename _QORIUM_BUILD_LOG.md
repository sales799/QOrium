# QOrium Build Log

A running log of the parallel Claude Code build session.
Cowork session reads this to know what's been built.

---

## 2026-05-03 — Sprint 0 kickoff (bounded)

Per CTO recommendation and user "go": executing Sprint 0.1 + 0.2 only,
since the §2 required-reading specs are not present in this environment.

Local repo `/home/user/QOrium` and remote `sales799/qorium` contained only
`README.md` at session start. The Constitution, CTO Architecture v1.0,
task_plan, and `infra/B5/B6/B7/B10` referenced as "already exist" in the
handoff live on the Cowork Mac and were never pushed to GitHub.

Bounded scope: only work fully specified by handoff §3 (tech stack)
and §4 (repo layout). Stop at Sprint 0.3 (db package) which needs
`infra/B7-postgres-migrations/0001_initial_schema.sql`.

### Sprint 0.1 — Monorepo bootstrap

- pnpm workspace, TS strict, ESLint flat config, Prettier
- Husky + lint-staged + gitleaks pre-commit
- `.env.example`, `.gitignore`, `tsconfig.base.json`

### Sprint 0.2 — Dev orchestration

- `infra/docker/docker-compose.dev.yml`: postgres 16, redis 7, minio, judge0
- `Makefile`: `dev-up`, `dev-down`, `dev-reset`

### BLOCKED — needed from Cowork session before Sprint 0.3+

- `09-QOrium-Constitution-v1.0.md`
- `07-CTO-Architecture-v1.md` (the 13-section spec — required to validate schema, API, and pipeline implementations)
- `task_plan_phase0_phase1.md`
- `infra/B5-CI-Pipeline.github-actions.yml`
- `infra/B6-gitleaks-config.yaml`
- `infra/B7-postgres-migrations/0001_initial_schema.sql`
- `infra/B10-ecosystem.config.js`
- `infra/Anti-Leak-Engine-v0-Design.md`
- `infra/JD-Forge-v0-Design.md`
- `infra/IRT-Calibration-Pipeline-v0-Spec.md`
- `customer-zero/Wave-1-Question-Batch-Plan.md`
- `governance/Quality-Gate-92pt-Scorecard.md`

Push these to `sales799/qorium` (any branch) and Sprint 0.3 onward unblocks.

### Note on Node version

Handoff §3 specifies Node 20 LTS. Build runner has Node 22. `engines.node`
set to `>=20` so both work; CI will pin 20.
