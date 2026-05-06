# CTO-DELTA: Judge0 orchestrator polls Postgres in v0; BullMQ deferred to v1

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Judge0-Sandbox-Integration-Spec-v0.md` §2.1 (System Diagram), §2.2 (Components — qorium-judge0-orchestrator)

## Background

Spec §2.1 names a Redis BullMQ job queue between the Express API and the
orchestrator:

> POST /v1/submissions ← Candidate submits code
> ↓
> Redis queue (pending jobs)
> ↓
> qorium-judge0-orchestrator (PM2, fork mode)

§2.2 reiterates: "Dequeue submission jobs from Redis (BullMQ queue)."

A live BullMQ pipeline requires:

- Redis configured + reachable from both API and orchestrator
- BullMQ producer in `services/readybank` (or a dedicated submissions API)
- BullMQ consumer in `services/judge0-orchestrator`
- Failure handling: dead-letter queue, retry-with-exponential-backoff,
  job-stalled detection
- Operational tooling: queue depth monitoring, manual retry CLI

…all of which can ship cleanly on top of the v0 orchestrator's contract
once the rest of Phase 1 is wired (specifically: the submissions API in
Sprint ≥1.7).

## Adaptation in v0

The v0 orchestrator polls `content.responses` directly:

- `listPendingResponses(pool, { limit })` — selects rows where
  `execution_metadata IS NULL AND score IS NULL`, ordered by
  `submitted_at ASC`
- Uses the partial index added in migration 0005
  (`responses_pending_execution_idx`) so the scan is O(pending)
- The `--once` CLI mode drains a bounded batch (default 100) and exits;
  PM2 controls cadence (the v0 entry recommends a frequent restart, e.g.,
  every minute, until BullMQ lands)

**Why this is acceptable for v0:**

- Wave 1 throughput is ~80 executions/day (spec §7.1); even a 1-minute
  poll is overkill
- Postgres is already a dependency of the orchestrator; no new infra
- The v0 orchestrator's I/O contract is identical to what BullMQ would
  need: `(pendingRow) -> executeSubmission(...) -> applyExecutionOutcome(...)`.
  Swapping the producer is a one-file change
- Migration 0005 added the partial index that makes the polling cheap

**Why we're not just running this forever:** at M3 scale (1,667
executions/day) Postgres polling becomes wasteful, and the spec's BullMQ
shape gives us per-job retry, dead-letter queues, and queue-depth alerts
that the polling approach would have to re-implement.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 polling, BullMQ in 1.7+** (recommended). Pros: ships v0
   today; the orchestrator interface is BullMQ-ready; partial-index keeps
   the scan cheap until throughput justifies the queue.
2. **Block v0 on BullMQ wiring** — acquire Redis, ship the producer in
   the API, ship the consumer in the orchestrator. Cons: drags Sprint 1.6;
   the submissions API itself isn't in this PR.

Default action if no reconciliation by next sprint review: assume **option 1**.
A follow-up sprint will introduce BullMQ alongside the submissions API,
swap the orchestrator's producer to a queue worker, and remove the polling
shim.

## Verification

- `services/judge0-orchestrator/__tests__/orchestrator.test.ts` exercises
  the `executeSubmission` function end-to-end against a stubbed Judge0;
  this is the unit BullMQ would call.
- `__tests__/judge0/client.test.ts` validates the HTTP contract against
  Judge0 v1.13+.
- `migration.smoke.test.ts` adds a smoke for the new partial index +
  columns from migration 0005.
