# CTO-DELTA: `qorium-plagiarism-detector` co-located with `qorium-testforge-orchestrator` in v0

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `governance/TestForge-QA-Pipeline-v1.md` §2.2 (Service topology)

## Background

§2.2 names two distinct services:

| Service                       | Port | Cadence                          |
| ----------------------------- | ---- | -------------------------------- |
| qorium-plagiarism-detector    | 5109 | continuous + quarterly benchmark |
| qorium-testforge-orchestrator | 5110 | continuous; coordinates 6 above  |

Two PM2 processes for two separate codebases imply two separate workspaces,
two builds, two test suites, two CTO-DELTA approval cycles, and two memory
budgets — for code that today consists of ~250 lines of pure-logic signal
math, plus a thin orchestrator wrapper.

## Adaptation in this PR

Both live in `services/testforge-orchestrator/`:

- Pipeline coordinator: `src/orchestrator.ts`, `src/gates.ts`, `src/prior.ts`
- Plagiarism detector: `src/plagiarism/{text,signals,ensemble}.ts`

The orchestrator's public exports include both — `scoreEnsemble`,
`runBenchmark`, `nextActionFor`, `applySmeDecision`, etc. — so when the
plagiarism detector is split out (Phase 2 once load profiling justifies
the separate process), only the import paths change.

B10 receives a **single new entry**: `qorium-testforge-orchestrator`
(port 5110). Adding a sibling `qorium-plagiarism-detector` (port 5109)
will be its own CTO-DELTA when the split is justified.

## Why merge them in v0

- **Resource fit:** combined v0 footprint is well below 768 MB; spec §8
  flags Mac Mini capacity as an open question for parallel TestForge
  components, so adding fewer processes is desirable until benchmarked.
- **Single-mode failure:** when one of the six gates is down, spec §8 Q5
  asks "do other 5 continue or halt?" — keeping coordinator + detector
  in one process eliminates one failure dimension for v0.
- **No queue dependency:** the detector consumes
  `content.responses` rows directly, like every other v0 service in this
  repo (per `CTO-DELTA-judge0-bullmq-deferred.md`). Sharing a pg pool
  is more efficient than two services each holding their own pool.
- **Forward-compatible interface:** the plagiarism module is exported
  from `services/testforge-orchestrator/src/index.ts`, so any future
  caller (admin UI panel, dashboard, separate detector service) imports
  from one place today and a different place tomorrow.

## Reconciliation request to CTO Office

Two options:

1. **Ratify co-location for v0** (recommended). Split when:
   - The detector grows to needing its own resource cap (e.g., when
     perplexity-via-LM lands and the Hugging Face transformer needs ≥2 GB
     of its own memory)
   - Quarterly benchmark runs become long-running (>10 min) and warrant a
     dedicated worker so the orchestrator stays responsive
   - Mac Mini load profiling shows contention
2. **Reject** — split now into two workspaces. Cons: doubles the v0 PR
   surface; no production user benefit until perplexity / direct-model
   signals justify the split.

Default action if no reconciliation by next sprint review: **option 1**.
The split-out CTO-DELTA will be authored in the same sprint that lands
perplexity-via-HF.

## Verification

- Single PM2 entry `qorium-testforge-orchestrator` in
  `infra/B10-ecosystem.config.js`.
- Plagiarism module is exported from
  `services/testforge-orchestrator/src/index.ts` so downstream consumers
  don't import from a deep path.
- Tests live alongside their source in
  `services/testforge-orchestrator/__tests__/plagiarism/`.
