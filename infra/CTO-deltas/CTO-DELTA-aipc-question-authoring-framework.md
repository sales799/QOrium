# CTO-DELTA: Wave 3 question-authoring framework v0 (Sprint 2.17)

**Date:** 2026-05-04
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Origin:** `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §4
(M9 deliverable: SME ships 50 calibrated questions in the new format).

## Background

Sprint 2.10 shipped the Wave 3 AI pair-coding orchestrator (6-dimension
grader, Anthropic stub, session repository, Express endpoints). The spec
§4.1 separately requires a **question-authoring framework**: six
archetypes the SME can pen against, with per-archetype validation rules
and a canonical YAML render so the question-importer pipeline ingests
them deterministically.

Sprint 2.17 ships that framework as pure-logic, no runtime dependencies.
It runs in any context (CLI, admin UI, future LLM-assisted authoring
agent) without database or network.

## What landed

- **`services/ai-pair-coding-orchestrator/src/authoring.ts`** — the
  pure-logic framework:
  - `ARCHETYPES` — readonly array of the six archetypes from spec §4.1
    (`spec_then_implement`, `bug_fix_with_ai`, `refactor_with_ai`,
    `build_from_scratch`, `adversarial_ai_injects_error`,
    `underspecified_task`), each annotated with the dimension signal it
    primarily targets (e.g. adversarial → F self-correction).
  - `QuestionDraft` interface with the 13 fields the SME edits (id,
    archetype, title, brief, starterCode, referenceSolution, language,
    IRT params, expectedDurationMinutes, seededErrors, authoredBy,
    reviewedBy?, notes?).
  - `validateDraft(draft) → ValidationIssue[]` — returns ALL issues in a
    single pass (not first-fail) so the future SME UI renders them
    together. Errors block release; warnings inform. Rules covered:
    - id pattern `QOR-AIPC-NNN` per spec §4.2
    - title min length, brief min length, referenceSolution non-empty
    - IRT 2PL bounds (b ∈ [-3, 3], a ∈ [0.1, 4])
    - duration ∈ [10, 60] minutes
    - adversarial archetype must declare ≥ 1 seededError (the AI failure
      mode the candidate has to catch)
    - bug_fix archetype must declare ≥ 1 seededError (the bug)
    - build_from_scratch warning for trivially small starter scaffold
    - spec_then_implement warning for sub-200-char briefs (spec wants
      detailed)
    - underspecified_task warning for >300-char briefs (spec wants
      ambiguous)
  - `isReadyForRelease(draft)` — true iff no errors (warnings are okay).
  - `renderSpecYaml(draft)` — emits the spec §4.2 schema YAML
    (literal block scalars for multiline fields; quoted scalars for
    YAML-special characters; `seeded_errors:` block when present).
  - `archetypeMetadata(key)` — round-trips a key to its `{label, signal}`
    pair for UI rendering.
- **`services/ai-pair-coding-orchestrator/__tests__/authoring.test.ts`**
  — 20 tests covering the catalogue (2), validateDraft (12 across
  field-level + archetype-rule + multi-issue cases), isReadyForRelease
  (2), and renderSpecYaml (4 across happy-path + seeded errors + literal
  blocks + special-char quoting).
- **`services/ai-pair-coding-orchestrator/src/index.ts`** — re-exports
  the new public surface so the admin UI + the future SME CLI can
  consume the framework via `@qorium/ai-pair-coding-orchestrator`.

## What this unblocks

- **SME can author the 50 Wave-3 questions** against a deterministic
  schema. Validation feedback is local (no service round-trip needed)
  and exhaustive (one render → all issues visible).
- **Question importer pipeline** has a stable YAML format to ingest
  (per spec §4.2). When the importer ships in a future sprint, it can
  consume the same `renderSpecYaml` output.
- **Admin UI** can call `validateDraft` on draft-edit blur to surface
  errors live, and `archetypeMetadata` to render the archetype picker
  with signal-explanations.
- **Future LLM-assisted authoring agent** can produce drafts and pass
  them through `validateDraft` to gate auto-publish.

## What is still deferred

- **LLM-assisted authoring** — i.e., a Claude-powered SME copilot that
  drafts questions from a topic prompt and refines them against
  validateDraft feedback. Deferred until the broader Anthropic
  credential activation (CTO-DELTA #29) and the spec §3.1 Senior
  Engineer architectural review are unblocked.
- **Question importer pipeline** — the side that ingests rendered YAML
  into the Postgres `content.questions` row + ai-pair-coding seed data.
  Out of scope for Sprint 2.17; will be a separate sprint paired with
  the SME's first authoring batch.
- **Full IRT calibration loop** — Sprint 1.6 ships the calibration
  service for code-format questions; the AI-pair-coding extension is
  pending the M9 spec §5 that defines per-dimension calibration weights.

## Reconciliation request to CTO Office

Default action: **ratify the v0 framework**. The shape matches spec §4.1
(six archetypes, signal-per-archetype mapping), the validation rules are
strictly conservative (no false positives in the test suite), and the
YAML render is round-trippable (the importer can parse what the
framework emits without ambiguity). The framework is pure-logic and
adds zero new external dependencies.

## Verification

- `pnpm --filter @qorium/ai-pair-coding-orchestrator typecheck` — clean.
- `pnpm --filter @qorium/ai-pair-coding-orchestrator test` — 49/49
  passing (29 existing + 20 new authoring tests).
- `pnpm typecheck && pnpm lint && pnpm format:check` (workspace-wide) —
  clean after the no-useless-escape fix on `quoteYaml`.

## Bonus: bootstrap 404 incident triage (same commit)

While Sprint 2.17 was being prepared the CEO ran the Sprint 2.16.5
bootstrap command and hit:

```
root@talpro-vps:~# curl -sSL https://raw.githubusercontent.com/sales799/qorium/main/services/setu/bin/setu-bootstrap.sh | sudo bash
bash: line 1: 404:: command not found
```

**Root cause:** the bootstrap script lives only on the feature branch
`claude/setup-qorium-build-agent-zA0l5`; PR #9 hasn't merged to main, so
the canonical raw URL 404s. `curl -sSL` then writes the 404 body to
stdout and `bash` parses the literal "404: Not Found" as a command.

**Fixes shipped in this same commit (defence-in-depth):**

1. The runbook (`infra/runbooks/setu-100-percent-auto-mode.md`) now uses
   `curl -fsSL ... -o /tmp/setu-bootstrap.sh` so HTTP errors fail loud
   at the curl step instead of producing the obscure shell error.
2. The same line gains a `||` fallback to the feature-branch URL so the
   bootstrap works during the window between sprint commits and merge
   to main.
3. The bootstrap script's own header documentation is updated to match.

**Permanent fix:** PR #9 needs to merge to main, after which the
canonical URL works without the fallback. This sprint marks PR #9
ready-for-review (drops the draft) so the CEO can merge.
