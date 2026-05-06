# CTO-DELTA: TestForge plagiarism v0 ships statistical + stylometric only; perplexity / direct-model / self-check deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` §3 (Detection Signals), §3.5 (Ensemble Scoring)

## Background

§3 defines a 5-group ensemble:

| Weight | Group        | v0 status                                                       |
| ------ | ------------ | --------------------------------------------------------------- |
| 0.30   | Statistical  | **Live** (burstiness, n-gram entropy)                           |
| 0.20   | Behavioral   | Deferred (needs keystroke telemetry; spec §3.2 says "Y1: skip") |
| 0.20   | Stylometric  | **Live** (lexical-diversity, sentence-length-variance)          |
| 0.15   | Direct model | Deferred (GPT-Zero / Pangram require external API + key)        |
| 0.15   | Self-check   | Deferred (LLM-as-judge — needs Anthropic prompt cost)           |

§3.1 also names **perplexity** under Statistical: "Perplexity < 50 = AI-signal".
Computing perplexity requires an actual language model (Hugging Face
`transformers` per spec §3.1 implementation note). Adding HF transformers
in v0 would require Python or a heavy bundle (`@xenova/transformers`),
neither of which fits the rest of the QOrium TS service shape.

## Adaptation in `services/testforge-orchestrator/src/plagiarism/`

Ships four pure-logic signals matching spec thresholds:

- **`burstinessScore`** — stddev/mean of sentence lengths. AI text smoother
  → high AI-likelihood. Maps spec's `burstiness > 0.7 = human-signal`.
- **`ngramEntropyScore`** — Shannon entropy of bigrams. Maps spec's
  `entropy < 4.5 bits = AI-signal` (low entropy → high AI-likelihood).
- **`lexicalDiversityScore`** — type-token ratio. AI lower TTR (more
  repetitive) → high AI-likelihood. Threshold band: TTR ≤ 0.5 → 1.0,
  TTR ≥ 0.75 → 0.0.
- **`sentenceLengthVarianceScore`** — stddev of sentence lengths in
  tokens. Spec §3.3: AI uniform → high AI-likelihood when stddev low.

`scoreEnsemble` accepts optional `behavioralAiLikelihood`,
`directModelAiLikelihood`, `selfCheckAiLikelihood` inputs so the v0
orchestrator can still consume the partial ensemble while also being
forward-compatible with the deferred signals once they ship. The
`activeWeightSum` field on the result tells SME Lead reviewers exactly
which signals contributed.

Because v0 only weights 0.30 + 0.20 = 0.50 of the spec ensemble, the
score is **renormalised** to keep it on a `[0, 1]` scale. The
flag-threshold (0.6) stays unchanged.

## Reconciliation request to CTO Office

Three options:

1. **Ratify v0 partial ensemble** (recommended). Pros: ships the testable
   pure-logic backbone; downstream sprints add perplexity / direct-model /
   self-check as drop-in signals; SO-22 quarterly benchmark can run on the
   v0 ensemble and report its score honestly with `activeWeightSum` for
   transparency.
2. **Block v0 on full ensemble** — bring Hugging Face transformers (Python
   sidecar) + GPT-Zero/Pangram API keys + Anthropic self-check prompts
   before shipping. Cons: Phase 1 schedule hit; activates 3 CEO-only halt
   conditions (HF infra, GPT-Zero key, expanded Anthropic budget).
3. **Hybrid** — ratify v0 but require the **first quarterly SO-22 benchmark
   to use the full ensemble**, even if only run by the I/O Psych contractor
   manually with external tooling. v0 production scoring stays on the
   partial ensemble until the deferred signals ship; the public benchmark
   number is whichever ensemble was actually run.

Default action if no reconciliation by next sprint review: **option 1
(ratify v0)** with planned upgrades to (perplexity → Sprint ≥1.8;
direct-model → Sprint ≥2.0 once GPT-Zero/Pangram contracts land;
self-check → Sprint ≥2.0 alongside Anthropic Bedrock keys).

## SO-22 implications

SO-22 mandates **≥93% public benchmark detection rate**. With v0's partial
ensemble we may not reach that on a real corpus (pure-logic signals are
weaker than perplexity + direct models). The orchestrator records
`runBenchmark` results in `content.testforge_runs` per spec §9; if the
detection rate falls below 93 % the J5 monthly close + Quality-Gate
scorecard will surface this as a Phase 1 blocker per SO-22 auto-fail.

The CTO + CDO offices should plan to ship at least one direct-model
signal (GPT-Zero via API key, or self-check via Anthropic) before the
**first quarterly external benchmark** (Q1 2027 or M3, whichever lands
first per spec §6.2).

## Verification

`services/testforge-orchestrator/__tests__/plagiarism/`:

- `signals.test.ts` — each signal returns higher AI-likelihood on the
  AI fixture than on the human fixture (relative-comparison test;
  doesn't pin absolute values which would be brittle)
- `ensemble.test.ts` — weight renormalisation, flag threshold,
  optional-signal blending, benchmark report shape
