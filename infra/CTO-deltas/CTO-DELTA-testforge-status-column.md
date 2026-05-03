# CTO-DELTA: TestForge state lives on a sibling column, not the existing `content.questions.status`

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `governance/TestForge-QA-Pipeline-v1.md` §2.3 (Database schema deltas) +
`infra/B7-postgres-migrations/0001_initial_schema.sql` (existing
`content.questions.status` CHECK constraint)

## Background

`content.questions.status` (B7 0001 schema) accepts:

```
'draft' | 'sme_review' | 'calibrating' | 'released' | 'deprecated' | 'leaked'
```

TestForge §2.3 adds three states the pipeline owns end-to-end:

```
'accepted' | 'bias_review' | 'rejected'
```

…**without** removing any of the existing six. We could either:

A. Extend the existing `status` CHECK to accept the union of nine states.
B. Add a sibling `testforge_status` column with the union; keep the
existing `status` as the customer-facing column.

§2.3 explicitly proposes option B (`ALTER TABLE … ADD COLUMN testforge_status`).

## Adaptation in migration 0006

```
ALTER TABLE content.questions
  ADD COLUMN testforge_status VARCHAR(40) DEFAULT 'draft'
    CHECK (testforge_status IN (
      'draft', 'sme_review', 'accepted', 'calibrating',
      'bias_review', 'released', 'leaked', 'rejected'
    ));
```

`testforge_status` is the pipeline-internal column. The orchestrator keeps
it consistent with the customer-facing `status` via
`customerFacingStatusFor` (`src/gates.ts`):

| testforge_status | content.questions.status |
| ---------------- | ------------------------ |
| draft            | draft                    |
| sme_review       | sme_review               |
| accepted         | sme_review               |
| calibrating      | calibrating              |
| bias_review      | sme_review               |
| released         | released                 |
| leaked           | leaked                   |
| rejected         | deprecated               |

The orchestrator writes both columns transactionally inside `syncStatus`
and `applyPriorAndTransition`.

## Why a sibling column instead of extending the existing CHECK

- **API compatibility**: ReadyBank `/v1/questions/*` (Sprint 1.0) treats
  `status='released'` as customer-visible. If we extended the existing
  status to include `'accepted'` and `'bias_review'`, every existing API
  filter would need a defensive update to ignore them.
- **Pre-existing migrations** (0002 packs, 0003 review_decisions) already
  reference `status` semantics. Splitting pipeline state from
  customer-facing state preserves their assumptions.
- **Audit clarity**: the J5 monthly dashboard and the
  `content.testforge_runs` table can query `testforge_status` without
  worrying about whether a row is also customer-visible.
- **Rollback safety**: dropping `testforge_status` is a no-op for the
  customer-facing API.

## Reconciliation request to CTO Office

Two options:

1. **Ratify the sibling-column approach** (matches §2.3 verbatim).
2. **Reject** — extend the existing `status` enum, accept the API filter
   churn. Cons: every reader of `content.questions.status` (ReadyBank
   service, packs export, admin queue, leak crawler, IRT calibration,
   judge0 orchestrator) needs a defensive check; small but meaningful
   risk of accidental customer exposure of `accepted` items.

Default action if no reconciliation by next sprint review: **option 1
(ratify §2.3 verbatim)**.

## Verification

`packages/db/__tests__/migration.smoke.test.ts` adds a smoke test for
the new column + CHECK constraint. The orchestrator unit tests
(`gates.test.ts`) cover the customer-facing-status mapping for every
TestForge state.
