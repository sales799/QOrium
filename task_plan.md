# QOrium Session Task Plan

Last updated: 2026-06-02 — Codex Run #40 SAML + legacy redirect active-origin deploy proof

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Deploy current SAML/redirect branch | DONE | Active origin `qorium-active-origin` deployed branch `codex/saml-live-active-origin-20260602` at `a929cb1ee69a8c172b1fb181da4c3222290f2843`; release `/opt/apps/qorium-marketing/releases/a929cb1ee69a`; `current` symlink flipped to that release. | Keep live release; rerun deploy only after reviewed changes or DNS update. |
| Verify SAML/Bing public surface | DONE | `BingSiteAuth.xml` returned HTTP `200` with `application/xml`; metadata route returned HTTP `200` with `application/samlmetadata+xml`; login route returned HTTP `302` to `https://www.samltest.dev/...`. | Configure customer IdP metadata/secrets when a tenant arrives. |
| Verify legacy aliases | DONE | `/product/jd-forge`, `/product/ai-grading`, `/product/assessment-builder`, and `/product/anti-cheating` returned HTTP `301` to the canonical live pages. `/product/readybank` remains HTTP `404` because it is not a declared alias. | Add more redirects only if product owner explicitly declares them honest legacy aliases. |
| Verify post-deploy runtime | DONE | `https://qorium.online/healthz` returned HTTP `200` with hardened headers; PM2 `qorium-marketing` and `qorium-chatbot` are online with unstable restarts `0`; deploy local probes returned HTTP `200`. | Continue watchdog monitoring. |
| Recap every requested/started session item | DONE | This plan plus `_shared/QUEUE.md` and `QUEUE-QOrium.md` Run #38 record the exact `PROVE` continuation with evidence. | Include final BALI Phase 4 recap. |
| Verify current specs head | DONE | Clean worktree fast-forwarded to `qorium/specs` at `17bac264bde112131717fc585f3235646a29d661`; Wave-2 shard specs are present. | Keep Wave-2 shards queued for implementation. |
| Verify active deployment | DONE | Active origin `qorium-active-origin` (`187.127.155.150`) is at `a929cb1ee69a8c172b1fb181da4c3222290f2843` on `codex/saml-live-active-origin-20260602`; public route matrix returned HTTP `200`/`301` as expected. | Keep current active release. |
| Run safe checks | DONE | `git diff --check HEAD^..HEAD` passed; `gitleaks detect --log-opts=HEAD^..HEAD` found `0` leaks; `pnpm scan:secrets` passed across `69` tracked/untracked text files. | Re-run after DSN/env landing or code change. |
| Verify live routes and headers | DONE | Public home, OpenAPI, sitemap, API chatbot health, API `/healthz`, API `/health`, admin `/api/health`, and Sentry status route returned HTTP `200`; sampled headers include HSTS, CSP, frame, content-type, referrer, permissions, and rate-limit policies. | Continue watchdog monitoring. |
| Update queue/state | DONE | Updated `QUEUE-QOrium.md`, `_shared/QUEUE.md`, `task_plan.md`, and completion artifact `_shared/CODEX_COMPLETION_QORIUM_BHIMA_PROVE_ARCHIVE_REVERIFY_2026-06-02.md`. | Commit state files by name only. |
| Save session/MANTHAN state | DONE | `session_save_state` and MANTHAN CTO handoff for session `9194eed8` point to the DSN blocker and exact active-origin proof. | Resume from this state if reopened. |
| Enable real Sentry capture | BLOCKED | Live status JSON says `enabled:false` and `dsnConfigured:false`; active-origin env has no Sentry DSN/token/org/project variables; previous Sentry token could list but could not create project/client key (`403`). | Founder/Sentry admin must provide QOrium DSN or a token with project-create/client-key permission. |
| Merge PR #88 to `main` | BLOCKED | PR #88 is open at `a929cb1ee69a8c172b1fb181da4c3222290f2843`; production is already deployed from the branch. | Non-author reviewer must review/merge; author must not approve own merge. |
| Enable `qorium.in` active-origin redirect | BLOCKED | Deploy skipped `qorium.in` redirect vhost because DNS resolves to `147.93.103.194`, not active origin `187.127.155.150`. | DNS owner points `qorium.in` to active origin, then rerun deploy. |
| Confirm Bing sitemap processing | IN PROGRESS | Public sitemap is HTTP `200`, `211200` bytes, `1190` URLs; no Bing/Webmaster/IndexNow credential names are present locally or on active origin for authenticated processing status. | Re-check Bing Webmaster Tools later. |
| State Correction Wave-2 SC-1/SC-2/SC-4 | DONE | `CLAUDE.md` fleet/routing canon updated; `apps/scripts/qorium-fleet-snapshot.sh` run proved active `12/12` and old-origin `38/38` QOrium services online; API health truth recorded; `infra/NIRANTAR-Replacement-Plan-v0.md` created. | Commit and push scoped state-correction files. |
| State Correction Wave-2 SC-3 registry patch | PARTIAL | Canon now points to raw PM2 across both origins; `talpro_qorium_fleet_status` implementation is outside this repository/tool surface in this session. | Patch MCP registry implementation in Talpro MCP repo when available. |

## Founder Action Required

1. Provide a QOrium-specific Sentry DSN/client key, or a Sentry token with permission to create/read the `qorium-marketing` project client key.
2. Arrange non-author review/merge for PR #88 if `main` parity is required.
3. Point `qorium.in` DNS to `187.127.155.150` if the active-origin redirect vhost should be enabled.
4. Re-check Bing Webmaster Tools later for sitemap processing completion; no code action is pending while the public sitemap is healthy.
5. Decide NIRANTAR sunset path after the 360-audit: extend current service or replace with `nirantar-v2` (default).
