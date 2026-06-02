# Shared Queue — QOrium Live SAML Closeout

Last touched: 2026-06-02 — Codex Run #39

## DONE

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Port SAML to active production branch | DONE | Branch `codex/saml-live-active-origin-20260602` adds live-branch SAML metadata/login/ACS/session persistence and migration `0019_saml_sessions.sql`; PR #88 is open/mergeable with head `17c81283417f889fad9c06867b7aa9ad48d7e387`. | Non-author review/merge; author must not self-approve. |
| Deploy/verify live SAML | DONE | Active origin `qorium-active-origin` serves release `/opt/apps/qorium-marketing/releases/17c81283417f`; public metadata `https://qorium.online/v1/auth/saml/metadata?tenant=acme` returns `200 application/samlmetadata+xml`; login returns `302` to SAML test IdP with `x-qorium-saml-request-id`. | Keep active release; do not roll back to older production branch. |
| Verify SAML live-branch gates | DONE | `pnpm install --frozen-lockfile`, migration numbering, lint, secrets scan, whitespace check, package build, SAML tests `5/39`, typecheck, full tests, and full build all passed; marketing tests `13/60`, chatbot tests `8/40`, build `1195/1195` pages. | Re-run after review merge or code/env change. |
| Verify watchdog coverage | DONE | `talpro_watchdog_add` re-registered `qorium-marketing` every 5 minutes to `https://qorium.online/healthz`; watchdog list confirms `qorium-marketing` and `qorium-chatbot`. | Continue watchdog monitoring. |
| Recap every requested item this session | DONE | User asked: prove, commit Phase 4 proof, push Phase 4 proof, deploy Phase 4 proof, then START walkthroughs. This closeout reconciled build/push/deploy/live state and recorded Run #37 in `QUEUE-QOrium.md`. | Include final BALI recap. |
| Commit/push Phase 4 Sentry proof code | DONE | Original instrumentation commit `0c342be37f62` is pushed; remote phase branch `codex/qorium-marketing-phase4-main` is at `c2ea0a225bfe` and contains the Sentry route/instrumentation history. | Non-author review/merge if `main` parity is required. |
| Deploy/verify Phase 4 observability route | DONE | Active production origin `qorium-active-origin` (`187.127.155.150`) serves `/v1/observability/sentry` with HTTP `200` JSON; current release symlink and repo checkout head are `17c81283417f` on `codex/saml-live-active-origin-20260602`. | Keep the newer active-origin release; do not roll back to older phase branch. |
| Run safe checks on active production checkout | DONE | On `qorium-active-origin`: marketing typecheck pass; Vitest `11` files / `55` tests pass; frozen install pass; workspace package build pass; Next build pass with `1195/1195` pages; `gitleaks` scanned `164` commits and found no leaks. | Re-run after any code/env change. |
| Verify production routes/security headers | DONE | Public `/`, `/healthz`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`; root headers include HSTS, CSP, frame, content-type, referrer, and permissions policies. | Continue watchdog monitoring. |
| Final QOrium health-header closeout | DONE | Active origin is now `17c81283417f`; release `/opt/apps/qorium-marketing/releases/17c81283417f`; `/health` and `/healthz` return HTTP `200` with HSTS, XCTO, XFO, Referrer-Policy, Permissions-Policy, and CSP after backed-up nginx hotfix `/tmp/qorium-marketing.conf.before-health-csp-20260602T085949Z`. | Track duplicate nginx vhost cleanup as low-priority infra debt. |
| Update state and handoff | DONE | Updated `QUEUE-QOrium.md`, `_shared/QUEUE.md`, `task_plan.md`, and `_shared/CODEX_COMPLETION_QORIUM_PHASE4_SENTRY_OBSERVABILITY_2026-06-02.md`; saved session state; saved MANTHAN CTO handoff for `9194eed8`. | Archive only after founder blocker is acknowledged. |

## BLOCKED

| Task | Status | Owner | Evidence | Next |
| --- | --- | --- | --- | --- |
| Enable real Sentry event capture | BLOCKED | Founder/Sentry admin | Live status JSON says `enabled:false` and `dsnConfigured:false`; production env grep found only commented DSN examples; prior Sentry token could list projects/teams but project creation returned HTTP `403`. | Provide QOrium Sentry DSN/client key or a Sentry token with project-create/client-key permission. |
| Merge author-owned phase branch to `main` | BLOCKED | Non-author reviewer | Current production includes the route via newer active release, but branch `codex/qorium-marketing-phase4-main` still needs cross-account review/merge for `main` parity. | Have another account review/merge; author must not approve own merge. |

## ARCHIVE CERTIFICATION

Not archive-ready as a fully complete Sentry activation. Code/deploy proof is archive-ready; real capture waits on the DSN/permission blocker. No `.env` or secret files were staged by this closeout. Existing unrelated workspace modifications were left untouched.
