# CTO-DELTA: Webhooks delivery in v0 is in-process; BullMQ + Redis deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Webhooks-Service-v0-Spec.md` §6 (Retry Policy), §7 (Architecture Diagram), §9 (Performance)

## Background

Spec §7 names a Redis-backed BullMQ pipeline between the producer (whoever
emits the domain event) and the worker that posts to the customer endpoint:

> domain event → webhooks.events row → BullMQ job → delivery worker → POST

§9 calls for ≥1K deliveries/min sustained throughput with a horizontally
scaled worker pool.

Wiring BullMQ live now requires Redis, a producer in every emitter
(`services/readybank`, `services/jd-forge`, `services/stack-vault`,
`services/leak-crawler`) plus a consumer + dead-letter handling. None of
that infra is in scope for Sprint 2.3.

## Adaptation in v0

The v0 webhooks service ships:

- The full data model from spec §2 (`webhooks.subscriptions`,
  `webhooks.events`, `webhooks.deliveries`)
- The signing primitive (`computeDeliverySignature`) and headers
  (`X-QOrium-Signature`, `X-QOrium-Timestamp`, `X-QOrium-Delivery`)
- The full retry schedule (`ATTEMPT_DELAYS_MS = [0, 1m, 5m, 30m, 4h, 24h]`,
  `MAX_AGE_MS = 35h`) as a pure-logic helper
- The HTTP status classifier (`classifyHttpStatus`) used by both v0 and v1
- CRUD endpoints for `webhooks.subscriptions` so customers can configure
  endpoints today

**What is deferred:**

- The actual outbound HTTP delivery loop (`postEnvelope` → fetch with
  timeout + abort)
- The BullMQ worker that drains `webhooks.deliveries` rows where
  `next_retry_at <= NOW()`
- The producer hooks in domain services that emit events

A v1 worker will:

1. SELECT … FROM webhooks.deliveries WHERE status = 'pending' AND
   next_retry_at <= NOW() ORDER BY next_retry_at LIMIT N
2. Call `postEnvelope(subscription, envelope)` (uses the v0 signing helper)
3. Apply `classifyHttpStatus(status).action` to decide success / retry /
   permanent failure
4. UPDATE the delivery row + increment `consecutive_failures` on the
   subscription if needed
5. Schedule the next attempt via `nextAttempt({attemptCount, firstAttemptAt})`

The v0 helpers are already structured so this swap is mechanical: zero
business-logic changes, only a producer + consumer added.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 control plane, BullMQ delivery in 2.4+** (recommended).
   Pros: ships subscriptions UI now; signing + retry semantics identical
   between v0 and v1; partial index `webhooks_deliveries_pending_idx` is
   already in place (migration 0010).
2. **Block v0 on BullMQ wiring** — provision Redis, ship the worker now.
   Cons: drags Sprint 2.3; producer hooks in 4 services + integration
   testing.

Default action if no reconciliation by next sprint review: assume
**option 1**. A follow-up sprint will introduce the worker, the producer
hooks in domain services, and a load-test target of 1K deliveries/min.

## Verification

- `services/webhooks/__tests__/signing.test.ts` pins the HMAC-SHA256
  signing format + tolerance window.
- `services/webhooks/__tests__/retry.test.ts` pins the spec backoff curve
  - abandonment rules.
- `services/webhooks/__tests__/envelope.test.ts` pins the envelope shape.
- `services/webhooks/__tests__/server.test.ts` exercises the
  subscriptions CRUD flow including HTTPS-only validation, duplicate
  detection, and event-type allow-list.
- `migration.smoke.test.ts` adds a smoke for the three webhooks tables
  plus the CHECK constraint on `webhooks.deliveries.status`.
