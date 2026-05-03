# CTO-DELTA: Apex execution path deferred to v0.1; Judge0 path canonical for Sprint 1.6

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Judge0-Sandbox-Integration-Spec-v0.md` §2.2, §8 (Apex Sandbox)

## Background

Spec §2.2 names two execution backends:

1. Judge0 (12 languages: Java, Python, Node, TypeScript, C++, Rust, Go, C, SQL, Bash, Shell/AWK)
2. Salesforce Platform CLI (Apex)

§8 describes the Apex flow in detail: developer-org provisioning, governor
limit handling, 1,000-execution rotation, `infra.apex_executions` tracking
table.

Live Apex requires:

- A registered Salesforce developer org (free) with auth credentials
- `sfdx` CLI installed on the orchestrator host (or a containerized
  alternative)
- Token-bucket rate limiter (1 req/sec)
- `infra.apex_executions` schema (not in B7 0001; would need a new
  migration)
- Org-rotation logic + automated provisioning
- Custom output parsing (`System.debug` → string match)

…none of which is required for the **Wave 1 launch corpus** (~25 coding
questions, all in Judge0-supported languages — see
`customer-zero/Wave-1-Java-Extension-*.md` etc.).

## Adaptation in v0

`services/judge0-orchestrator/src/languages.ts` declares `apex` as a
known language with `routesToJudge0: false` and `judge0Id: null`:

- The orchestrator's `executeSubmission` throws a clear error when
  invoked with `apex`, surfacing the "use the Apex path instead" message
  for any caller that mis-routes.
- `isSupportedLanguage('apex')` returns `true` so that submission
  validation accepts it (the API can still receive Apex submissions and
  enqueue them; v0 will mark them as awaiting Apex pipeline).
- The v0 polling loop (`runOnce` in `src/index.ts`) skips rows whose
  language doesn't pass `isSupportedLanguage` AND `routesToJudge0`;
  Apex submissions accumulate in `content.responses` until the Apex
  worker lands.

**v0.1 plan** (when Wave 2 introduces Apex questions, M2):

- New service `services/apex-executor/` (separate workspace)
- Migration 0006 for `infra.apex_executions`
- The orchestrator's `runOnce` adds an Apex branch dispatching to the
  Apex executor
- Token-bucket lives in the new service

## Reconciliation request to CTO Office

Two options:

1. **Ratify Apex deferral** (recommended). Pros: unblocks Sprint 1.6
   shipping; matches Wave 1 corpus reality (no Apex questions in Wave 1);
   the v0 orchestrator returns a clear, actionable error if mis-routed.
2. **Block v0 on Apex** — acquire developer org + sfdx + Talpro
   network access from the CEO; ship Apex executor in this PR. Cons:
   drags 1.6 schedule; activates a CEO-only halt condition (Salesforce
   org credentials).

Default action if no reconciliation by next sprint review: assume **option 1
(defer)**.

## Halt condition (v0.1 activation)

When Wave 2 needs Apex execution, the agent will REQUEST from CEO:

- Salesforce developer org credentials (`SFDX_AUTH_URL` or username +
  password + security token)
- Confirmation that `sfdx` CLI is approved for installation on the
  orchestrator host (or a Salesforce CLI Docker image preference)

## Verification

`services/judge0-orchestrator/__tests__/orchestrator.test.ts` includes:

- `apex language is rejected (out-of-scope for v0 Judge0 path)` — verifies
  the orchestrator throws the expected error
- `__tests__/languages.test.ts: 'apex is the only entry that does not route to judge0'`
- `__tests__/languages.test.ts: 'judge0IdFor throws for apex (does not route to judge0)'`
