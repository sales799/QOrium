# CTO-DELTA: JD-Forge v0 ships with Stub parser + generator; live Anthropic gated on `ANTHROPIC_API_KEY`

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/JD-Forge-v0-Design.md` §3.1 (Stage 1 — JD Parsing) + §3.4 (Stage 4 — AI Draft)

## Background

Stages 1 and 4 of the JD-Forge pipeline both call Claude Opus via the
Anthropic Messages API. Production activation requires
`ANTHROPIC_API_KEY` (and the per-account budget approval that comes with
it — spec §9 estimates 1M tokens/day burn for 20 JD packs/day).

`ANTHROPIC_API_KEY` is a CEO-only secret per the handoff's halt rules and
hasn't been provisioned for the Stream B build session.

## Adaptation in `services/jd-forge`

The pipeline ships behind the `JdParser` and `AIQuestionGenerator`
interfaces with two implementations each:

| Interface             | Stub                    | Real                         |
| --------------------- | ----------------------- | ---------------------------- |
| `JdParser`            | `StubJdParser`          | `AnthropicJdParser`          |
| `AIQuestionGenerator` | `StubQuestionGenerator` | `AnthropicQuestionGenerator` |

Both real implementations **throw on construction** when no `apiKey` is
provided, so a production deploy that forgets to set `ANTHROPIC_API_KEY`
fails loud at startup rather than silently degrading.

The `services/jd-forge/src/index.ts` boot logic picks the impl per env:

```
const parser = config.anthropicApiKey
  ? new AnthropicJdParser({ apiKey: config.anthropicApiKey, model: config.anthropicModel })
  : new StubJdParser();
```

Same shape for the generator. So:

- **Local dev / CI / Stream B build session:** Stubs run end-to-end, all
  tests + the `runOrder` orchestrator exercise the full 5-stage flow
  without touching Anthropic.
- **Production:** Real impls are picked when `ANTHROPIC_API_KEY` is set;
  the orchestrator code path is identical.

## Stub behaviour (what it actually does)

The stub parser uses regex + a small token dictionary (`tech_stack`,
`seniority`, `domain`) to produce a deterministic `ParsedJd`. It's enough
to exercise the spec generator + role-graph mapper with realistic
shapes. Roles with no recognised tech tokens produce empty
`requiredSkills` (which the orchestrator then surfaces as a clean
`failed → no_questions_in_spec` outcome).

The stub generator emits one canned question per spec item, in the right
shape per format (MCQ has options + correctIndex, coding has
referenceSolution + testCases, etc.). Self-critique is hard-coded at
{8, 8, 8, 9, 9} — high enough to pass the validator's `accept` floor
so the stub-driven smoke flow exercises the whole pipeline including
the export step.

## Reconciliation request to CTO Office

Two options:

1. **Ratify the stubbed-by-default v0 ship** (recommended). Pros: the
   pipeline is fully testable today; provider integration is a
   one-env-var flip; production deploy is gated on a single CEO action
   (provision `ANTHROPIC_API_KEY` + Anthropic enterprise contract).
2. **Block v0 on real Anthropic** — provision the key + budget before
   shipping. Cons: blocks the v0 PR on a CEO-only action; the test
   suite would still need stubs for CI cost reasons.

Default action if no reconciliation by next sprint review: **option 1**.
Spec §12 explicitly calls Standard tier the M0–M3 scope; the Stub-vs-
Anthropic swap is the only remaining production-flip and is captured
on the Customer Zero Day-1 runbook activation list (Sprint 1.8).

## Verification

`services/jd-forge/__tests__/`:

- `parser.test.ts` — both `StubJdParser` (5 cases) and `AnthropicJdParser`
  (3 cases including a mocked-fetch happy path + non-2xx + missing-key
  throw)
- `generator.test.ts` — same pattern (4 stub cases + 4 Anthropic cases)
- `orchestrator.test.ts` — end-to-end with stub deps + parser-throws
  - all-questions-rejected + leak-heuristic-rejection

Cost / budget envelope (from spec §3.4 + §9):

- Per JD pack at 20 questions: ~$2–3 in Anthropic tokens
- v0 sustainable: ~600 packs/month per Anthropic account
- v1+ scale: 100 customers × 2 packs/month = 200 packs/month, well
  within v0 envelope
