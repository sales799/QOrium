# CODEX COMPLETION — QORIUM BHIMA — QUEUE RECONCILIATION — 2026-06-02

## Status

PARTIAL COMPLETE: local queue reconciliation, gitignore hygiene, and live blocker refresh are complete. Production route repair remains blocked by active-origin/Cloudflare authority.

During verification, the local app CI exposed a Java sandbox Docker fallback bug. That bug is fixed and covered by a regression test.

## PROVE Acceptance

Founder replied `PROVE` on 2026-06-02. BALI ownership engaged for the QOrium queue in this Codex session.

## Repo Evidence

- Current workspace: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium`
- Branch: `specs`
- Remote: `qorium https://github.com/sales799/QOrium.git`
- Current pre-run HEAD: `6f2a456` (`docs: record QOrium active origin blocker`)
- Named Batch A-E mission files are already tracked on `specs`.
- Prior relevant proof commits:
  - `1a85334` — marketing redesign brief
  - `65ad4e0` — live-domain working-file alignment
  - `6f2a456` — active-origin blocker evidence
  - `9f5d215` — QG-05 conditional Rakshak follow-ups
  - `40452c4` — Postgres repository persistence
  - `7fad155` — persistent grader reasoning traces
  - `55b4865` — recruiter auth
  - `bb1d459` — browser e2e flow

## Files Updated This Run

- `.gitignore` — added `*.append-*`.
- `_shared/CODEX_PENDING.md` — marked completed P2 hardening rows with SHAs and added P3 live route blockers.
- `QUEUE-QOrium.md` — added Run #22 with current live evidence.
- `qorium-app/apps/sandbox-bridge/src/runner.ts` — fixed Docker Java fallback so it no longer depends on mounting a macOS temp directory into the container.
- `qorium-app/tests/sandbox-runner.test.ts` — added regression coverage for Java fallback execution.
- `_shared/CODEX_COMPLETION_QORIUM_BHIMA_QUEUE_RECONCILIATION_2026-06-02.md` — this report.

## Verification

- `git diff --check` → PASS.
- `pnpm exec vitest run tests/sandbox-runner.test.ts` → failed before the fix with Java sandbox exit code `2`, then PASS after the fix.
- `pnpm run ci` in `qorium-app` → PASS:
  - seed generation PASS (`155` taxonomy nodes, `250` library questions)
  - secret scan PASS
  - typecheck PASS
  - build PASS
  - smoke PASS, including JS/Python/Java sandbox
  - Playwright e2e PASS (`1/1`)

## Live Verification

- `https://qorium.online/` → HTTP `200` HTML.
- `https://qorium.online/product/api` → HTTP `200` HTML.
- `https://qorium.online/resources/docs` → HTTP `307` then `200` to `/product/api`.
- `https://api.qorium.online/healthz` → HTTP `200` JSON.
- `https://api.qorium.online/health` → HTTP `404` problem JSON.
- `https://api.qorium.online/chatbot/v1/healthz` → HTTP `404` HTML.
- `POST https://qorium.online/api/chatbot/session` with `{}` → HTTP `404` problem JSON.
- `https://qorium.online/openapi.json` → HTTP `404` HTML with `x-nextjs-cache: HIT`.
- Forced old-origin chatbot health (`147.93.103.194`) → HTTP `200` JSON.
- Forced active-origin chatbot/OpenAPI probes (`187.127.155.150`) → HTTP `404`; strict TLS verification also fails locally on forced-origin probes.

## Branch/Worktree Note

The real marketing implementation lives in `/private/tmp/qorium-marketing-site` on branch `codex/qorium-marketing-phase4-main`. That branch contains the tracked `apps/marketing/src/app/openapi.json/route.ts`, `apps/marketing/src/app/api/chatbot/session/route.ts`, and `services/chatbot` source. The `specs` worktree only has untracked fallback catch-all API route fragments under root `apps/marketing`; these were not staged because they are not the production implementation.

## Hard Blockers

1. Active-origin SSH/deploy access is still unavailable: `ssh -p 2244 root@187.127.155.150 true` returns `Permission denied (publickey)`.
2. Public chatbot routes are not on the Cloudflare-routed origin, even though the old origin has `/chatbot/v1/healthz` working.
3. OpenAPI JSON is currently `404` on public and both tested forced-origin paths from this workstation. This now needs origin-side route/deploy repair before a cache purge can fully close it.
4. No local `CLOUDFLARE_*` or `CF_*` token names are visible in this shell or checked token locations.

## Required Infra Action

- Provide active-origin SSH/deploy access for `187.127.155.150`, or explicitly authorize a Cloudflare route/DNS change to the origin that has the chatbot service.
- Provide a Cloudflare token with `Zone.Cache Purge` for `qorium.online` after the origin route is repaired.

## Archive Readiness

Not archive-ready yet. Documentation and local queue reconciliation are complete, but production route repair remains externally blocked.
