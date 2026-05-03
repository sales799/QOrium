# @qorium/readybank

ReadyBank service — calibrated question library, REST API + bulk export. Listens on port `5101` per `infra/B10-ecosystem.config.js` (`qorium-api`).

Per CTO Architecture §6 the public API surface is:

```
GET    /v1/questions/search       — Search by role/skill/format/difficulty
GET    /v1/questions/{uuid}       — Fetch single question (full body)
POST   /v1/packs/generate         — Generate pack from criteria
GET    /v1/packs/{id}/export      — Export pack (CSV/JSON/HackerRank/Mettl format)
GET    /v1/role-graph/search      — Search role graph nodes
```

## Status (Sprint 1.1)

Skeleton only. Endpoints not yet implemented; this PR ships:

- Express 5 + TypeScript app factory (`createServer({ config, pool? })`)
- Pino structured logging — `service`, `request_id`, `version`, `git_sha`, `env`,
  with Authorization / API key / cookie / password redaction
- pino-http middleware emitting `x-request-id` (auto-generated UUID v4 unless
  caller supplies one of length 1–128)
- helmet security headers — HSTS, X-Content-Type-Options, X-Frame-Options,
  strict CSP (no `unsafe-inline`)
- Sentry init (no-op when `SENTRY_DSN` unset)
- RFC 7807 Problem Details — `application/problem+json` on 404 + 5xx with
  `type`, `title`, `status`, `detail`, `instance`
- `GET /healthz` (liveness) — 200 with version/sha/uptime/db check status
- `GET /readyz` (readiness) — 200 ok, 503 if pool configured but unreachable
- Graceful shutdown on SIGINT/SIGTERM (drains pg pool)
- 9 vitest cases (supertest); all pass without external dependencies

## Run locally

```bash
# Build deps first (workspace-aware)
pnpm install

# Dev mode (watch)
pnpm --filter @qorium/readybank dev

# Production mode
pnpm --filter @qorium/readybank build
pnpm --filter @qorium/readybank start
```

Default port is `5101`; override with `READYBANK_PORT` or `PORT`.

## Configuration

| Var                           | Default       | Notes                                                               |
| ----------------------------- | ------------- | ------------------------------------------------------------------- |
| `NODE_ENV`                    | `development` | one of `development` / `staging` / `production` / `test`            |
| `READYBANK_PORT` / `PORT`     | `5101`        | matches B10 PM2 config                                              |
| `LOG_LEVEL`                   | `info`        | pino level                                                          |
| `GIT_SHA`                     | `unknown`     | injected by CI / deploy                                             |
| `npm_package_version`         | `0.0.0`       | injected by pnpm                                                    |
| `SENTRY_DSN`                  | unset         | optional; init is a no-op when unset                                |
| `DATABASE_URL` / `POSTGRES_*` | unset         | optional at skeleton stage; required once Sprint 1.3 endpoints land |

## Testing

```bash
pnpm --filter @qorium/readybank test
```

The test suite uses `supertest` against an in-memory Express app — no listener is bound, no Postgres required.
