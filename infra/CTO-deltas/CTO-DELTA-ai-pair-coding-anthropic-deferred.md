# CTO-DELTA: AI pair-coding ships v0 grader + Anthropic stub; live API key + UX deferred

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §2, §3, §4.

## Background

Spec §2.2 calls for live Claude Sonnet calls during a 30-minute
candidate session, plus a CodeMirror 6 editor + AI sidebar UX. Both
are M6+ deliverables and depend on:

- Real `ANTHROPIC_API_KEY` (CEO action)
- CodeMirror 6 + WebSocket UX (frontend deliverable; not yet in
  scope of `apps/admin`)
- Senior Engineer #1 architectural review per spec §3.1
- Wave 3 budget envelope ratification (spec authority statement)

## Adaptation in v0

- Migration `0014_ai_pair_coding.sql` ships
  `content.ai_pair_coding_sessions` + `content.ai_pair_coding_messages`
  with status / role CHECK constraints.
- **Pure-logic 6-dimension grader** (`gradeSession`) — exhaustively
  tested across all six dimensions (A: final code quality, B:
  acceptance discipline, C: rejection discipline, D: question asking,
  E: iteration rhythm, F: self-correction). Default weights match
  spec §2.4 verbatim. Behavioural anchors documented in code +
  reasoning text emitted alongside each score.
- **Anthropic Claude client** with Stub-vs-Real pattern. The Real
  impl uses `x-api-key` + `anthropic-version: 2023-06-01` per
  https://docs.anthropic.com/en/api/messages and throws on missing
  key. Stub returns deterministic mock for dev + tests.
- **`services/ai-pair-coding-orchestrator`** (port 5115; CTO-DELTA
  #28 covers the port renumber) — Express endpoints for session
  CRUD, turn submission (candidate message → AI completion), and
  final submit (with grade computation).
- **PM2 ecosystem updated** — adds `qorium-ai-pair-coding-orchestrator`
  (cluster mode, port 5115).

## What is deferred

- **Live Anthropic API calls** — needs `ANTHROPIC_API_KEY` (Phase 1
  halt; same as JD-Forge / TestForge).
- **CodeMirror 6 + AI sidebar UX** — frontend deliverable; will live
  in a separate `apps/candidate-portal` app once Wave 3 starts.
- **Anti-cheat enforcement** (clipboard monitoring, secondary monitor
  detection per spec §3.4) — frontend deliverable.
- **Question authoring framework** (spec §4.1) — content-side; M9
  per Wave 3 Plan §3.2 (50 Qs by M9).
- **Senior Engineer #1 architectural review** — Wave 3 hire pending.

## Reconciliation request to CTO Office

Default action: **ratify v0 grader + orchestrator + Anthropic stub**.
Live wire-up flips when the CEO supplies `ANTHROPIC_API_KEY` and
the frontend portal is ready (Wave 3 milestone).

## Verification

- `services/ai-pair-coding-orchestrator/__tests__/grader.test.ts` —
  19 cases (every dimension's behavioural anchors + aggregation +
  custom weights)
- `services/ai-pair-coding-orchestrator/__tests__/anthropic.test.ts` —
  3 cases (stub mock, real-throws-on-missing-creds, real wires
  x-api-key + anthropic-version)
- `services/ai-pair-coding-orchestrator/__tests__/server.test.ts` —
  7 cases (healthz, session create, no-tenant 401, bad-id 400,
  missing 404, turn happy path, submit + grade)
- `migration.smoke.test.ts` — verifies migration 0014 (two tables +
  status CHECK)
