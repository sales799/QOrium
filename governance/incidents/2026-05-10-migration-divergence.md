# Branch divergence — incident report 2026-05-10

**Severity:** High (blocks merge of significant unmerged work; risks DB-state corruption)
**Discovered by:** CTO (autonomous CTO-King mode), 2026-05-10 ~10:50 UTC
**Discovered while:** Auditing `claude/setup-qorium-build-agent-zA0l5` for sibling-PR opening (Option A from `2026-05-10-deploy-handoff.md`)

## Summary

Two long-lived feature branches forked from the same `main` ancestor (commit `3528232 (#7) /v1/packs`) and developed independently for **weeks** without ever merging back. They have now diverged in a way that **cannot be reconciled by a routine `git merge`**:

| Branch | Commits ahead of main (pre-PR-#51) | Sprint coverage | Notable areas of divergence |
|---|---:|---|---|
| `claude/qorium-continuation-eJJlB` (now merged via PR #51) | 107 | Sprint 1.5 → 2.21 (mailer, IRT, anti-leak, JD-Forge, billing, audit, SSO, ATS, etc.) | Migrations 0004–0015; ATS connectors v1; mailer; |
| `claude/setup-qorium-build-agent-zA0l5` (NOT MERGED) | 50 | Sprint 1.1 → 2.21 (different cuts of: TestForge, Judge0, JD-Forge, ATS, billing, audit, SSO, observability, leak-rotation, my-portal, bootstrap fixes) | Migrations 0003–0014 (different content!); ATS connectors v2; bootstrap/PM2 infra fixes |

**Root cause:** Two separate Claude Code agents were given parallel feature work without trunk-discipline guardrails. Neither rebased onto the other, and `main` was never updated to reflect either's progress until PR #51 today.

## Conflict surface

A `git merge-tree origin/main origin/claude/setup-qorium-build-agent-zA0l5` (post PR #51) shows 3-way conflicts in:

| Path | Conflict type |
|---|---|
| `infra/B7-postgres-migrations/0004_*.sql` | **Same number, different file** (main: `0004_recruiter_auth.sql`; sibling: `0004_calibration_history.sql`) |
| `infra/B7-postgres-migrations/0005_*.sql` | **Same number, different file** (main: `0005_recruiter_invitations.sql`; sibling: `0005_judge0_sandbox.sql`) |
| `infra/B7-postgres-migrations/0006_*.sql` through `0014_*.sql` | All 11 migrations have same numbers, different content |
| `packages/ats-connectors/{src/,package.json,tsconfig.json}` | Both branches independently authored ATS connectors with different shapes |
| `.env.example` | Each branch added env-var blocks the other doesn't have |
| `pnpm-lock.yaml` | Divergent dependency graphs |
| `_QORIUM_BUILD_LOG.md` | Each side appended different log entries |

**Worst risk:** the VPS at `147.93.103.194` runs the sibling branch and has its postgres at sibling-migration state (`0001` through some subset of `0003`-`0014`-as-sibling-defines-them). If we naïvely apply main's `0004_recruiter_auth.sql`, the migration runner will either reject it (if the tracker keys on number) or apply it on top of unrelated schema (if the tracker keys on filename hash).

## Why this is worse than typical merge conflict

Migration numbering is a **monotonic global namespace**. `git` cannot resolve `0004` collisions semantically — a textual auto-merge would arbitrarily pick one side, silently dropping the other. And the **DB state** on the VPS embodies one of the two histories; renumbering changes how the migration runner identifies past applies.

## Recommended reconciliation plan

This is a multi-day effort. Roughly:

### Phase A — Establish current DB truth (before touching code)
1. SSH to VPS (after deploy-key fix from `2026-05-10-deploy-handoff.md`).
2. `psql` and read `app.schema_migrations` (or whatever the tracker table is) to determine **exactly which migration files have been applied** to the production DB.
3. Snapshot postgres (`pg_dump`) before any further work.

### Phase B — Renumber sibling-branch migrations onto a clean tail
4. On a new branch `chore/sibling-migration-renumber`, rename sibling migrations `0003-0014` → `0016-0027` (current main top is `0015`). Adjust any cross-references.
5. Add a migration-runner shim that **maps the historical numbers used on the VPS** → the new numbers, so the tracker table can be updated atomically.
6. Author one transitional migration (`0028_recruiter_auth_reconcile.sql` or similar) that reconciles any schema differences between sibling's `0003`-as-sibling-defines-it and main's `0004_recruiter_auth.sql`.

### Phase C — Reconcile non-migration conflicts
7. ATS connectors: pick the better-tested implementation (probably whichever has more specs); manually merge.
8. `.env.example`: union the two; document each variable's owner.
9. `pnpm-lock.yaml`: regenerate from the union package.json files.
10. `_QORIUM_BUILD_LOG.md`: chronological merge.

### Phase D — Open PR with full conflict accounting
11. Open PR with the renumbered migrations + reconciled code. CI must pass including a test that runs the full migration sequence against an empty DB.
12. **Mandatory human review.** This is not a single-CTO call.

### Phase E — Apply on VPS
13. Drop into staging-mirror first if one exists; if not, snapshot prod again immediately before.
14. Stop `qorium-api` PM2 cluster. Apply the schema-tracker remap migration. Apply the new tail migrations (`0028+`). Restart.
15. Smoke test all surfaces — not just mailer.

## Process changes to prevent recurrence

1. **Trunk-based discipline.** No long-lived feature branches. Sprint work merges to `main` weekly at minimum.
2. **Migration numbering policy.** Migration numbers are reserved at PR-open time, not at write time. A simple `infra/B7-postgres-migrations/RESERVED.txt` file edited per PR prevents collisions.
3. **One-agent-per-area rule.** Two Claude agents must not both work on the same `services/` or `packages/` directory in overlapping windows. Use repo `CODEOWNERS` or a coordination file.
4. **Required `main` rebase before merge.** GitHub branch-protection rule: PR must be up-to-date with `main` before the merge button activates.

## Owner / next action

- **Owner:** CEO (Bhaskar) to assign Phase A on next office-hours.
- **Until reconciliation lands:** Sibling branch `claude/setup-qorium-build-agent-zA0l5` remains the canonical VPS code. Do **not** attempt to deploy main to VPS without the reconciliation work above.
- **What main IS good for right now:** isolated dev / fresh-VPS bootstrap (with the noted pgcrypto/CITEXT extension caveat from `2026-05-10-deploy-handoff.md`).

## Honest meta-comment from the CTO

I (the autonomous-mode Claude) was prepared to open a draft PR for the sibling branch as Option A's second half. The conflict audit caught me before I created a PR that would have visually misled future viewers about its mergeability. Aborting was the right move. CEO's "bypass all permission" delegation does not bypass *engineering judgment* — and the right judgment here is "stop, document, escalate to human."
