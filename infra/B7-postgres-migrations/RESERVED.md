# Migration number reservation registry

Authored: 2026-05-10 (post `governance/incidents/2026-05-10-migration-divergence.md`)

## Why this file exists

The migration sequence under `infra/B7-postgres-migrations/` is a **monotonic global namespace**. Two parallel agents (or humans) writing migration `0007` independently produces a file collision that `git` cannot resolve semantically. The reconciliation cost is high; prevention is cheap.

This file is the **single source of truth** for which migration numbers exist or are claimed. The CI workflow at `.github/workflows/migration-numbering.yml` runs `scripts/check-numbering.sh` on every PR touching this directory and **fails the PR** if:

- Two files share the same number
- A new file uses a number that is already reserved here without claiming it
- The naming format is wrong (`NNNN_snake_case.sql`)
- A new gap is introduced without a `### GAP nnnn` entry below

## Reservation protocol

Before writing a new migration:

1. Pick the next available number (current top + 1, OR claim a documented `RESERVED` slot below).
2. Add a row to the table below in the same PR that adds the migration file.
3. The CI check then passes.

For long-lived feature work that won't merge for weeks, **reserve** a slot by adding a row with a placeholder filename and your branch name. This blocks other agents from claiming the same number.

## Current state

| Number | File                                        | Status   | Owner / branch                              |
| ------ | ------------------------------------------- | -------- | ------------------------------------------- |
| 0001   | `0001_initial_schema.sql`                   | applied  | (pre-history)                               |
| 0002   | `0002_packs.sql`                            | applied  | (pre-history)                               |
| 0003   | _(gap — see below)_                         | GAP      | (divergence-aftermath)                      |
| 0004   | `0004_recruiter_auth.sql`                   | applied  | PR #51                                      |
| 0005   | `0005_recruiter_invitations.sql`            | applied  | PR #51                                      |
| 0006   | `0006_bloom_tags.sql`                       | applied  | (pre-history)                               |
| 0007   | `0007_reference_panel.sql`                  | applied  | (pre-history)                               |
| 0008   | `0008_sso_jit_provisioning.sql`             | applied  | (pre-history)                               |
| 0009   | `0009_stack_vault.sql`                      | applied  | (pre-history)                               |
| 0010   | `0010_audit_events_tenant_id.sql`           | applied  | (pre-history)                               |
| 0011   | `0011_audit_export_jobs.sql`                | applied  | (pre-history)                               |
| 0012   | `0012_audit_events_hash_columns.sql`        | applied  | (pre-history)                               |
| 0013   | `0013_webhooks.sql`                         | applied  | (pre-history)                               |
| 0014   | `0014_ats_connectors.sql`                   | applied  | (pre-history)                               |
| 0015   | `0015_outcome_metrics_views.sql`            | applied  | (pre-history)                               |
| 0016   | `0016_programmatic_seo_role_graph.sql`      | applied  | codex/qorium-marketing-phase4-main          |
| 0017   | `0017_interactive_proof.sql`                | applied  | codex/qorium-marketing-phase4-main          |
| 0018   | `0018_chatbot.sql`                          | applied  | codex/qorium-c1-chatbot                     |
| 0019   | `0019_saml_sessions.sql`                    | applied  | codex/saml-live-active-origin-20260602      |

**Next available number: 0020.**

## Documented gaps (CI ignores these)

### GAP 0003

Reason: The sibling branch `claude/setup-qorium-build-agent-zA0l5` independently authored `0003_review_decisions.sql`, `0004_calibration_history.sql`, and others using these numbers with completely different content. When PR #51 (recruiter invitation pipeline) merged to `main`, we kept the `main`-side numbers (`0004_recruiter_auth.sql`, `0005_recruiter_invitations.sql`) and left `0003` as an intentional gap to make the divergence visible.

The eventual reconciliation (see `governance/incidents/2026-05-10-migration-divergence.md`, Phase B) will renumber the sibling branch's migrations onto a clean tail starting at `0016+`. The `0003` gap will be **closed** at that time by a transitional migration.

Until then, do not author a new `0003_*.sql`.

## Reserving a future number (procedure)

To claim a migration number before you've written the file:

1. Edit the **Current state** table above and add a new row at the end.
2. Set the file column to your planned filename in backticks (e.g., `` `0016_my_feature.sql` ``).
3. Set the status column to `RESERVED` (case-insensitive).
4. Set the owner column to your branch name + handle.
5. Commit and push — the CI guard (`scripts/check-numbering.sh`) treats any row with status `RESERVED` or `GAP` as not-yet-requiring a file on disk.

When you actually write the migration, change the status to `applied` (or whatever your runner expects) in the same PR.
