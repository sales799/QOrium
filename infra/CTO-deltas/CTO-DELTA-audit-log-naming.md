# CTO-DELTA: Audit-log API exposes spec field names; storage keeps the migration-0001 column names

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Audit-Log-API-Spec-v0.md` §2 (Source: Existing audit.events Table), §5 (Standard Event Envelope)

## Background

Two specs disagree on the column names for `audit.events`:

- **Migration 0001** ships the table with `event_type`, `entity_type`,
  `entity_id`, `occurred_at`.
- **`infra/Audit-Log-API-Spec-v0.md` §5** uses SaaS-conventional names:
  `action`, `resource_type`, `resource_id`, `timestamp`.

The spec text §2 acknowledges the mismatch (it quotes a hypothetical
`audit.events` definition with `action` / `resource_type` / `created_at`
that does not match what 0001 actually shipped). We can't rename the
columns without breaking every existing audit emitter, but we also
shouldn't ship the API with the storage names because they violate the
public contract.

## Adaptation in v0

The audit-log service maps storage names → spec names at the API
boundary:

| Storage column  | API field      | Mapping site                   |
| --------------- | -------------- | ------------------------------ |
| `event_type`    | `action`       | `repositories/events.ts:toRow` |
| `entity_type`   | `resourceType` | `repositories/events.ts:toRow` |
| `entity_id`     | `resourceId`   | `repositories/events.ts:toRow` |
| `occurred_at`   | `occurredAt`   | `repositories/events.ts:toRow` |
| `payload` JSONB | `payload`      | passthrough                    |
| `changes` JSONB | `changes`      | passthrough                    |

The query builder uses storage names internally (`event_type = $`,
`entity_type = $`, `occurred_at >= $`) while the API accepts spec
names (`action`, `resource_type`, `start_date`, `end_date`).

**Why not rename the columns:**

- Migration 0001 has been live since Sprint 1.1. Renaming requires a
  data migration, a coordinated swap across all audit emitters
  (`packages/auth`, `services/readybank`, every domain service), and
  a deprecation window for any downstream consumer that already reads
  the columns directly.
- The API mapping is a 4-line projection that costs nothing at query
  time.
- The migration-0001 names match the existing event taxonomy
  ("question.created", "secret.rotated") which already uses
  `event_type`-style verbs, not action verbs.

**What is deferred:**

- The async export endpoint (spec §7). The storage path is the same
  query as the list endpoint with no LIMIT; deferring until we have a
  cron / job-queue infrastructure and an S3-equivalent for the export
  artefact.
- Hash-chaining (spec §10). Adds two columns + a verification job;
  optional per spec, deferred to Month 9.
- Compliance hooks (`/v1/compliance/data-subject-access-request`,
  `/v1/compliance/data-deletion-request`) — spec §11. Workflow + queue
  required; deferred.

## Reconciliation request to CTO Office

Two options:

1. **Ratify the storage→API mapping** (recommended). Pros: ships v0
   today; no data migration; storage stays canonical for emitters;
   API stays canonical for customers.
2. **Migrate columns** — rename `event_type → action`, `entity_type →
resource_type`, `entity_id → resource_id`, `occurred_at → created_at`.
   Cons: requires a coordinated migration plus deprecation window;
   no functional benefit for v0.

Default action if no reconciliation by next sprint review: assume
**option 1**. A follow-up CTO-DELTA can revisit if a customer-facing
ergonomics review demands the rename.

## Verification

- `services/audit-log/__tests__/query.test.ts` pins that the SQL emits
  storage names (`event_type`, `entity_type`, `occurred_at`).
- `services/audit-log/__tests__/server.test.ts` pins that the JSON
  response uses API names (`action`, `resourceType`, `resourceId`).
- `migration.smoke.test.ts` adds a smoke for the new `tenant_id` column
  added in migration 0010, which the API uses for tenant scoping.
