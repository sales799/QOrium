# CTO-DELTA: Observability ships pure-logic shims; live Sentry/Loki/Slack deferred

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `governance/Operating-Rituals-v1.md`,
`governance/Incident-Response-Runbook-v1.md`, CTO Architecture §13.

## Background

Spec calls for Sentry-based error tracking, Grafana Loki centralized
logging, OpenTelemetry tracing, and Slack-based alerting on uptime
breaches. None of those external services can be wired without:

- Real Sentry DSN
- Real Grafana Cloud token (or self-hosted Loki URL)
- Real Slack webhook URL for the QOrium ops channel
- Real Talpro Sentinel webhook for SO-9 anti-leak alerts

## Adaptation in v0

- **`@qorium/observability` package** ships pure-logic shims:
  - `createSentryClient({ dsn, sdk })` — when `dsn` is empty OR `sdk`
    is missing, returns a Stub that no-ops. When both are wired, the
    Real impl forwards to the injected `@sentry/node`-shaped SDK.
  - `buildLokiPayload(events, labels)` — pure-logic transformer from
    Pino log events to the Loki HTTP push schema.
  - `shipBatch(payload, opts)` — fetch wrapper; returns ok=true with
    bytesSent=0 when the URL is empty (stub mode).
  - `describeResource()` + `defaultSampler()` + `shouldSampleRoute()`
    — OpenTelemetry resource + sampler config helpers.
- **`services/uptime-monitor`** (port 5114; PM2 fork; 60s tick) — runs
  the smoke check matrix from `@qorium/smoke` against every v0
  service health endpoint and exposes:
  - `GET /healthz` — liveness for the monitor itself
  - `GET /v1/uptime/status` — most recent check matrix snapshot
  - `GET /v1/uptime/slo?window={15m|1h|24h}` — rolling availability
- **`apps/admin/src/app/admin/uptime/page.tsx`** — admin dashboard
  tile that renders the SLO + latest matrix.
- **`infra/grafana/dashboards/qorium-overview.json`** — Grafana
  dashboard JSON ready for import once Grafana Cloud is wired.

## What is deferred

- Live `@sentry/node` SDK wiring (caller-injected at deploy time).
- Live `pino-loki` transport on every service's logger.
- OpenTelemetry SDK init (the helpers describe the resource +
  sampler; the SDK itself is a deploy-time dependency).
- Slack webhook for breach alerts.
- Pagerduty integration for SO-9 24-hour leak rotation alerts.
- Talpro Sentinel webhook (governance/Operating-Rituals-v1.md).
- Grafana Cloud account provisioning + dashboard import.

## Reconciliation request to CTO Office

Default action: **ratify v0 monitor + shims + dashboard JSON**. The
deployment can wire Sentry / Loki / Slack incrementally without
re-architecting the v0 services.

## Verification

- `packages/observability/__tests__/sentry.test.ts` — 4 cases
  (stub when DSN missing, stub when SDK missing, real SDK forwarding,
  inspectable stub for tests)
- `packages/observability/__tests__/loki.test.ts` — 4 cases
  (label assembly, version label, stub mode, fetch wiring)
- `packages/observability/__tests__/otel.test.ts` — 6 cases
- `services/uptime-monitor/__tests__/state.test.ts` — 6 cases
- `services/uptime-monitor/__tests__/server.test.ts` — 4 cases
- `infra/grafana/dashboards/qorium-overview.json` — 6 panels covering
  uptime, webhook delivery rate, billing failures, secret rotations
  overdue, API key 4xx rates.
