# ADR 0001 (ReadyBank) — Express, not Fastify

**Status:** Accepted
**Date:** 2026-04-29 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Talpro Universe Tech Stack — Express adopted as standard)
**Reviewers:** CTO (sole, Y1)

---

## Context

ReadyBank is a REST API service. Two natural framework choices:

- **Express** — long-standing, vast ecosystem, mature middleware, ~5x slower per-request than Fastify on synthetic benchmarks
- **Fastify** — newer, faster, schema-first validation, smaller ecosystem, less in-house familiarity

Per `services/readybank/src/server.ts` and the existing repo precedent, Express was the choice. This ADR backfills the rationale for the audit trail.

## Decision

**Use Express as the HTTP server framework for ReadyBank.**

Schema validation handled via Zod at the route boundary (parallel to the marketing app's server-action pattern in [ADR 0003 of `cto/adrs/`](../../../../cto/adrs/0003-mailer-fallback-chain.md)). Logging via Pino (per QOrium quality bars in root README). Middleware stack: helmet (security headers) + cors (origin allow-list) + auth middleware from `@qorium/auth` + Pino logging.

## Consequences

### Positive

- Aligns with Constitution SO-13 ("Talpro Universe adopts Next.js + Express + PostgreSQL + Redis as standard")
- Vast ecosystem of middleware battle-tested in production
- Operator familiarity — every full-stack engineer knows Express
- Easy to wire `@qorium/auth` middleware (the package's main consumer)

### Negative

- Per-request throughput is ~5x slower than Fastify on synthetic benchmarks. Mitigated by:
  - The bottleneck for ReadyBank is database I/O + IRT calibration metadata fetch, not the framework
  - VPS 1 (KVM4) has 4 vCPU; Express overhead is not the limit
  - We'll re-evaluate if measured p95 exceeds the SLO (200ms per `cto/sli-slo.md` ReadyBank section)
- Schema validation is a Zod afterthought, not a Fastify-style first-class feature. Manageable; Zod is already a project dependency.

### Neutral / observations

- Express 4.x → 5.x migration may surface as work in Y2; track in `cto/tech-debt.md` if needed
- If we ever build a streaming endpoint (e.g., real-time anti-leak rotation events), Fastify's faster baseline matters more — re-evaluate then

## Alternatives considered

### Alternative 1: Fastify

Rejected. SO-13 mandates Express. Deviation requires Architecture document update which would require a Constitutional Amendment cycle for SO-13 — overkill for the marginal performance gain at QOrium's expected Y1 traffic.

### Alternative 2: Bare Node http module

Rejected. Reinventing routing + middleware = wasteful. Express is the standard.

### Alternative 3: Hono / Elysia (newer Bun-friendly frameworks)

Rejected for Y1. Pre-1.0 ecosystem maturity; SO-13 mandate; team familiarity.

## Implementation notes

- **File:** `services/readybank/src/server.ts` — Express app setup
- **Middleware order:** helmet → cors → auth → pino-http → routes → error handler
- **Error format:** RFC 7807 Problem Details on every public error response (per QOrium quality bars)
- **Commit:** `e07108c` (Sprint — readybank service skeleton on :5101)

## Verification

- `pnpm --filter @qorium/readybank typecheck` clean
- `pnpm --filter @qorium/readybank test` — middleware order verified in tests
- Production smoke: `curl -I http://localhost:5101/health` returns 200 + security headers

## References

- Constitution SO-13 (Tech Stack)
- `services/readybank/src/server.ts` — implementation
- `services/readybank/__tests__/` — middleware tests
- Express docs (express.com)
- ADR 0001 of `cto/adrs/` (parallel decision for marketing app's standalone tsconfig)
