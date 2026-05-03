# CTO-DELTA: B10 ecosystem extension — `qorium-irt-calibration` PM2 entry

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/B10-ecosystem.config.js` (CTO Office, 2026-05-02) +
`infra/IRT-Calibration-Pipeline-v0-Spec.md` §7 (Pipeline Orchestration)

## Background

B10 (CTO Office, 2026-05-02) defines five PM2 services: `qorium-api`,
`qorium-jd-forge`, `qorium-stack-vault`, `qorium-admin`, `qorium-leak-crawler`.

`infra/IRT-Calibration-Pipeline-v0-Spec.md` §7 names a sixth service that
runs nightly at **03:00 IST** (after the leak crawler at 02:00):

> Cron job @ 03:00 IST (after anti-leak crawler @ 02:00):
>
> 1. Query: SELECT \* FROM content.questions WHERE status='calibrating' …
>    …
> 2. Email SME Lead + I/O Psych: "20 questions calibrated this week; 2 flagged for review"

…but B10 has no entry for it.

## Adaptation

`infra/B10-ecosystem.config.js` now carries a `qorium-irt-calibration` entry
mirroring the leak-crawler shape:

- Fork mode, single instance, CPU-bound
- `cron_restart: '0 3 * * *'` (03:00 IST = 21:30 UTC; one hour after leak crawler)
- `max_memory_restart: '1024M'` (slightly higher than leak crawler — Newton MLE
  on full N=30+ cohort across 1K questions can briefly hold large arrays)
- `exp_backoff_restart_delay: 500`, `max_restarts: 10`, `min_uptime: '30s'`
  matching the rest of the file
- env knobs from `services/irt-calibration/src/config.ts`:
  `IRT_MIN_RESPONSES`, `IRT_MAX_QUESTIONS_PER_RUN`, `IRT_MAX_ITERATIONS`

Script path is `./dist/workers/irt-calibration.js`, mirroring the
`./dist/workers/anti-leak-crawler.js` convention. The deployed PM2 unit
will load the leak-crawler / IRT bundles from a `workers/` build directory;
in this monorepo, each service has its own `dist/` (e.g.,
`services/irt-calibration/dist/cli.js`). The deploy step responsible for
copying compiled bundles into `/opt/qorium/dist/workers/` lives in the
deploy pipeline (see B10 `deploy.production` block) and is out of scope for
Sprint 1.5.

## Reconciliation request to CTO Office

Two options:

1. **Ratify** — adopt the new entry as canonical B10 content. Cowork session
   will fold it into the next B10 refresh.
2. **Reject** — provide an alternative scheduling shape (e.g., a single
   `qorium-batch` umbrella service that runs both crawler + calibration
   sequentially). The pros/cons of consolidating are debatable; v0 stays
   single-purpose for legibility.

Default action if no reconciliation by next sprint review: assume **option 1
(ratify)**. The PM2 entry is a no-op until the deploy pipeline is wired
in Phase 4; the in-repo TS service runs perfectly under `pnpm
qorium-irt-calibration --once` regardless.

## Verification

`infra/B10-ecosystem.config.js` continues to be loaded successfully by the
root `ecosystem.config.cjs` re-exporter. The new entry includes the same
keys (`name`, `script`, `instances`, `exec_mode`, `cron_restart`, env)
that PM2 validates.
