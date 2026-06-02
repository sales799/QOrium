# QOrium Session Task Plan

Last updated: 2026-06-02 — Codex live SAML production closeout

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Port SAML to active production branch | DONE | Branch `codex/saml-live-active-origin-20260602` and PR #88 add SAML metadata/login/ACS/session persistence to active branch `codex/qorium-programmatic-seo-factory-phase1`; head SHA `17c81283417f889fad9c06867b7aa9ad48d7e387`. | Non-author review/merge; author must not self-approve. |
| Deploy and verify public SAML | DONE | Active origin release `/opt/apps/qorium-marketing/releases/17c81283417f`; public metadata returns HTTP `200 application/samlmetadata+xml`; public login returns HTTP `302` to SAML test IdP with `x-qorium-saml-request-id`. | Keep current active release. |
| Verify live SAML gates | DONE | Frozen install, migration numbering, lint, secrets scan, `git diff --check`, package build, SAML tests `5/39`, typecheck, full tests, and full build passed; marketing tests `13/60`; build `1195/1195` pages. | Re-run after review merge or code/env change. |
| Verify watchdog coverage | DONE | Talpro watchdog re-registered `qorium-marketing` every 5 minutes to `https://qorium.online/healthz`; list confirms marketing and chatbot watchdogs. | Continue watchdog monitoring. |
| Recap every requested/started session item | DONE | This plan plus `_shared/QUEUE.md` and `QUEUE-QOrium.md` Run #37 record prove/commit/push/deploy/start requests with evidence. | Include final BALI Phase 4 recap. |
| Verify commit/push proof | DONE | Remote `codex/qorium-marketing-phase4-main` is at `c2ea0a225bfe`; Sentry instrumentation commit `0c342be37f62` remains in branch history. | Non-author review/merge for `main` parity. |
| Verify active deployment | DONE | Active origin `qorium-active-origin` (`187.127.155.150`) serves `/v1/observability/sentry` with HTTP `200` JSON; current release symlink and repo checkout head are `17c81283417f` on `codex/saml-live-active-origin-20260602`. | Keep current active release; do not downgrade to older phase branch. |
| Run safe checks | DONE | Active origin marketing typecheck passed; Vitest `11` files / `55` tests passed; frozen install passed; workspace package build passed; Next build generated `1195/1195` pages; `gitleaks` scanned `164` commits and found no leaks. | Re-run after DSN/env landing or code change. |
| Verify live routes and headers | DONE | Public `/`, `/healthz`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`; root headers include HSTS, CSP, frame, content-type, referrer, and permissions policies. | Continue watchdog monitoring. |
| Final health-header hardening | DONE | Active release `17c81283417f`; `/health` and `/healthz` return HTTP `200` with HSTS, XCTO, XFO, Referrer-Policy, Permissions-Policy, and CSP after app HEAD handler plus nginx health-location CSP hotfix. | Clean duplicate nginx vhost drift later. |
| Update queue/state | DONE | Updated `QUEUE-QOrium.md`, `_shared/QUEUE.md`, `task_plan.md`, and completion artifact `_shared/CODEX_COMPLETION_QORIUM_PHASE4_SENTRY_OBSERVABILITY_2026-06-02.md`. | Commit state files by name only. |
| Save session/MANTHAN state | DONE | `session_save_state` and MANTHAN CTO handoff for session `9194eed8` point to the DSN blocker and exact active-origin proof. | Resume from this state if reopened. |
| Enable real Sentry capture | BLOCKED | Live status JSON says `enabled:false` and `dsnConfigured:false`; production env has no QOrium DSN; previous Sentry token could list but could not create project/client key (`403`). | Founder/Sentry admin must provide QOrium DSN or a token with project-create/client-key permission. |

## Founder Action Required

Provide a QOrium-specific Sentry DSN/client key, or a Sentry token with permission to create/read the `qorium-marketing` project client key.
