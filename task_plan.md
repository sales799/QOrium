# QOrium Session Task Plan

Last updated: 2026-06-02 — Codex Run #39 state correction partial closeout

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Recap every requested/started session item | DONE | This plan plus `_shared/QUEUE.md` and `QUEUE-QOrium.md` Run #38 record the exact `PROVE` continuation with evidence. | Include final BALI Phase 4 recap. |
| Verify current specs head | DONE | Clean worktree fast-forwarded to `qorium/specs` at `17bac264bde112131717fc585f3235646a29d661`; Wave-2 shard specs are present. | Keep Wave-2 shards queued for implementation. |
| Verify active deployment | DONE | Active origin `qorium-active-origin` (`187.127.155.150`) is at `031883a` on `codex/saml-live-active-origin-20260602`; public route matrix returned HTTP `200`. | Keep current active release. |
| Run safe checks | DONE | `git diff --check HEAD^..HEAD` passed; `gitleaks detect --log-opts=HEAD^..HEAD` found `0` leaks; `pnpm scan:secrets` passed across `69` tracked/untracked text files. | Re-run after DSN/env landing or code change. |
| Verify live routes and headers | DONE | Public home, OpenAPI, sitemap, API chatbot health, API `/healthz`, API `/health`, admin `/api/health`, and Sentry status route returned HTTP `200`; sampled headers include HSTS, CSP, frame, content-type, referrer, permissions, and rate-limit policies. | Continue watchdog monitoring. |
| Update queue/state | DONE | Updated `QUEUE-QOrium.md`, `_shared/QUEUE.md`, `task_plan.md`, and completion artifact `_shared/CODEX_COMPLETION_QORIUM_BHIMA_PROVE_ARCHIVE_REVERIFY_2026-06-02.md`. | Commit state files by name only. |
| Save session/MANTHAN state | DONE | `session_save_state` and MANTHAN CTO handoff for session `9194eed8` point to the DSN blocker and exact active-origin proof. | Resume from this state if reopened. |
| Enable real Sentry capture | BLOCKED | Live status JSON says `enabled:false` and `dsnConfigured:false`; active-origin env has no Sentry DSN/token/org/project variables; previous Sentry token could list but could not create project/client key (`403`). | Founder/Sentry admin must provide QOrium DSN or a token with project-create/client-key permission. |
| Confirm Bing sitemap processing | IN PROGRESS | Public sitemap is HTTP `200`, `211200` bytes, `1190` URLs; no Bing/Webmaster/IndexNow credential names are present locally or on active origin for authenticated processing status. | Re-check Bing Webmaster Tools later. |
| State Correction Wave-2 SC-1/SC-2/SC-4 | DONE | `CLAUDE.md` fleet/routing canon updated; `apps/scripts/qorium-fleet-snapshot.sh` run proved active `12/12` and old-origin `38/38` QOrium services online; API health truth recorded; `infra/NIRANTAR-Replacement-Plan-v0.md` created. | Commit and push scoped state-correction files. |
| State Correction Wave-2 SC-3 registry patch | PARTIAL | Canon now points to raw PM2 across both origins; `talpro_qorium_fleet_status` implementation is outside this repository/tool surface in this session. | Patch MCP registry implementation in Talpro MCP repo when available. |

## Founder Action Required

1. Provide a QOrium-specific Sentry DSN/client key, or a Sentry token with permission to create/read the `qorium-marketing` project client key.
2. Re-check Bing Webmaster Tools later for sitemap processing completion; no code action is pending while the public sitemap is healthy.
3. Decide NIRANTAR sunset path after the 360-audit: extend current service or replace with `nirantar-v2` (default).
