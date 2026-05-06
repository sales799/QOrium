# QOrium

Role-graph-native Question-Bank-as-a-Service. Powers ATS/HR-tech platforms,
enterprises, and IT staffing firms with calibrated, defended question banks
across **ReadyBank**, **JD-Forge**, **Stack-Vault**, and the **Anti-Leak Engine**.

Strategy, blueprint, architecture, and Phase 0/1 plan are authored in the
Cowork session and will be pushed into this repo. Code lives here.

## Status

**Phase 1 Engine MVP — feature-complete (Sprints 1.1 → 1.8)**. Eight
workspaces shipped; **396 tests** active green; deployment readiness
runner (`make ready`) gates Customer Zero activation.

Live workspaces:

- `services/readybank` — REST API on :5101 (Sprint 1.0)
- `apps/admin` — Next.js 15 admin console on :5104 (Sprint 1.2 / 1.3)
- `services/leak-crawler` — Anti-Leak Engine v0 (Sprint 1.4)
- `services/irt-calibration` — IRT 2-PL nightly batch (Sprint 1.5)
- `services/judge0-orchestrator` — Sandboxed code execution (Sprint 1.6)
- `services/testforge-orchestrator` — 6-gate QA pipeline coordinator (Sprint 1.7)
- `packages/{auth,db,smoke}` — shared toolchain
- `infra/B7-postgres-migrations/` — 6 migrations applied (0001 → 0006)
- `infra/B10-ecosystem.config.js` — PM2 ecosystem (8 services)

See [`_QORIUM_BUILD_LOG.md`](./_QORIUM_BUILD_LOG.md) for the full sprint
log + every CTO-DELTA filed.

## Prerequisites

- **Node.js 20 LTS** (`>=20`)
- **pnpm 10** (`corepack enable && corepack prepare pnpm@10.33.0 --activate`)
- **Docker** with Compose v2
- **gitleaks** (required for pre-commit secret scanning)
  - macOS: `brew install gitleaks`
  - Linux: download from <https://github.com/gitleaks/gitleaks/releases>

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template
cp .env.example .env

# 3. Bring up local infra (postgres, redis, minio, judge0)
make dev-up

# 4. Verify quality bars
pnpm typecheck
pnpm lint
make secrets-scan
```

## Make targets

Run `make help` for the full list. Common ones:

| Target           | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `make dev-up`    | Start postgres + redis + minio + judge0                     |
| `make dev-down`  | Stop infra (volumes preserved)                              |
| `make dev-reset` | Stop infra + wipe volumes (destructive)                     |
| `make dev-logs`  | Tail logs from all infra services                           |
| `make typecheck` | `tsc --noEmit` across all workspaces                        |
| `make lint`      | ESLint across the repo                                      |
| `make format`    | Prettier write across the repo                              |
| `make smoke`     | Run smoke healthchecks (requires DB env)                    |
| `make ready`     | Full deployment-readiness suite (gates Customer Zero Day-1) |

## Repo layout (target — see handoff §4)

```
apps/         # web, app, admin, partners (Next.js)
services/     # readybank, jdforge, stackvault, antileak, content-engine, gateway
packages/     # db, ai, irt, role-graph, auth, shared-types, ui
infra/        # docker, nginx, pm2, migrations, ci, ops
tests/        # e2e, integration, load
scripts/      # seed-questions, irt-recalibrate, anti-leak-scan
```

Workspaces are populated incrementally as sprints land. Empty subtrees are
not committed.

## Quality bars (non-negotiable)

Per handoff §3 / Constitution Article VII:

- Zero TypeScript errors (`tsc --noEmit` must pass)
- Zero ESLint errors
- Test coverage ≥80% on changed files
- gitleaks must pass on pre-commit and in CI
- RFC 7807 Problem Details on all public API errors
- Pino structured logging on every significant code path
- Security headers on every HTTP response

## Contributing

All development happens on feature branches. The active branch is
`claude/setup-qorium-build-hKTHq`.

Pre-commit hooks run Prettier, ESLint, and gitleaks. Do not bypass with
`--no-verify` without logging the reason in `_QORIUM_BUILD_LOG.md`.
