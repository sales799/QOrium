# CTO-DELTA: Secret rotation worker ships v0 reminders + stub rotators

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/B6-Secret-Rotation-Calendar.md` §1, §2, §3, §4

## Background

B6 specifies a 5-step rotation runbook for every secret in the
inventory: pre-rotation verification, generate, update env, deploy +
validate, archive + log. Many of those steps require live provider
APIs (Anthropic dashboard, Razorpay account, Hostinger Postgres
console) that the build agent cannot exercise.

## Adaptation in v0

The worker ships:

- Migration `0013_secret_rotations.sql` — `app.secret_rotations`
  ledger + `app.secret_rotation_log` audit table. CHECK constraints
  enforce status / resource_type vocabularies.
- `services/secret-rotation-worker` (PM2 fork mode) running every
  6 hours by default. Each tick:
  1. Selects rows past their `next_rotation_due` (or within the 14-day
     reminder window).
  2. Pure-logic policy evaluator decides per row: send_reminder /
     mark_overdue / no_op.
  3. If `SECRET_ROTATION_PERFORM=true` AND a rotator is registered
     for the resource_type, calls the rotator and updates
     `next_rotation_due`.
  4. Emits a row to `app.secret_rotation_log` for every state change.
- Rotators (Stub default; Real on activation):
  - `database_url` → stub
  - `api_key` → stub
  - `webhook_subscription_secret` → live-ready (POSTs to
    services/webhooks rotation endpoint when admin token provided)
  - `tls_certificate` → stub (Let's Encrypt is auto-renewed by certbot)
  - everything else → stub

## What is deferred

- **Live Anthropic / Razorpay / OpenAI rotation APIs** — require
  per-provider account access (CEO action).
- **Database password rotation** — needs Hostinger Postgres console
  access (CEO + Cowork CTO Office action).
- **Cloudflare R2 access key rotation** — needs CF account API token
  (CEO action).
- **PM2 reload after rotation** — needs SSH access to the VPS
  (CEO action).
- **Slack alert channel for reminders** — needs the Slack webhook URL
  (CTO Office action, Sprint 2.9).
- **Per-resource rotation runbook execution** — v0 only schedules +
  emits reminders. The actual rotation runbook (§4 in B6) remains
  manual until upstream APIs are wired.

## Reconciliation request to CTO Office

Default action: **ratify v0 reminder + ledger surface**. The CEO can
flip from `SECRET_ROTATION_PERFORM=false` to `true` once at least one
upstream rotator is wired live (most likely
`webhook_subscription_secret`, since `services/webhooks` is in-process).

## Verification

- `services/secret-rotation-worker/__tests__/policy.test.ts` — 11
  cases (paused / healthy / reminder / overdue / grace / lookup
  defaults)
- `services/secret-rotation-worker/__tests__/rotators.test.ts` —
  5 cases (stub rotator, webhook rotator with + without token,
  registry, throw-on-unknown)
- `services/secret-rotation-worker/__tests__/runner.test.ts` —
  5 cases (reminder, overdue, paused skip, perform=false, log emit)
- `migration.smoke.test.ts` — adds verification of migration 0013
  (`app.secret_rotations` + `app.secret_rotation_log`).
