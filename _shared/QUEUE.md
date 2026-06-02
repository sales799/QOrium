# Shared Queue — QOrium PROVE Archive Reverification

Last touched: 2026-06-02 — Codex Run #39

## DONE

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Reverify current `qorium/specs` head | DONE | Clean specs worktree fast-forwarded to `17bac264bde112131717fc585f3235646a29d661`; remote `qorium/specs` matches. | Keep Wave-2 shards queued. |
| Reverify live QOrium routes | DONE | Public home, OpenAPI, sitemap, API chatbot health, API `/healthz`, API `/health`, admin `/api/health`, and Sentry status route all returned HTTP `200` on 2026-06-02. | Continue watchdog monitoring. |
| Reverify active-origin runtime | DONE | Active origin checkout is `031883a` on `codex/saml-live-active-origin-20260602`; PM2 QOrium fleet is `12/12 online`, `51` aggregate restarts, `0` unstable restarts. | Re-run after next deploy. |
| Reverify repo safety | DONE | `git diff --check HEAD^..HEAD` passed; `gitleaks detect --log-opts=HEAD^..HEAD` found `0` leaks; `pnpm scan:secrets` passed across `69` tracked/untracked text files. | Re-run after code/doc changes. |
| Reverify sitemap health | DONE | `https://qorium.online/sitemap.xml` returned HTTP `200`, `application/xml`, `211200` bytes, `1190` `<loc>` entries. | Wait for Bing processing. |
| Recap every requested item this session | DONE | User asked: exact `PROVE` after typo, remote auto mode, no-human-touch safe continuation. This closeout reconciled current specs, live routes, Sentry status, sitemap health, PM2, and recorded Run #38 in `QUEUE-QOrium.md`. | Include final BALI recap. |
| Commit/push Phase 4 Sentry proof code | DONE | Original instrumentation commit `0c342be37f62` is pushed; remote phase branch `codex/qorium-marketing-phase4-main` is at `c2ea0a225bfe` and contains the Sentry route/instrumentation history. | Non-author review/merge if `main` parity is required. |
| Deploy/verify Phase 4 observability route | DONE | Active production origin `qorium-active-origin` (`187.127.155.150`) is at `18110f1f5653` on `codex/qorium-programmatic-seo-factory-phase1`; build output lists `/v1/observability/sentry`; public and forced-origin route calls return HTTP `200` JSON. | Keep the newer active-origin release; do not roll back to older phase branch. |
| Run safe checks on active production checkout | DONE | On `qorium-active-origin`: marketing typecheck pass; Vitest `11` files / `55` tests pass; Next build pass with `1195/1195` pages; `gitleaks` scanned `162` commits and found no leaks. | Re-run after any code/env change. |
| Verify production routes/security headers | DONE | Public `/`, `/healthz`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`; root headers include HSTS, CSP, frame, content-type, referrer, and permissions policies. | Continue watchdog monitoring. |
| Update state and handoff | DONE | Updated `QUEUE-QOrium.md`, `_shared/QUEUE.md`, `task_plan.md`, and `_shared/CODEX_COMPLETION_QORIUM_PHASE4_SENTRY_OBSERVABILITY_2026-06-02.md`; saved session state; saved MANTHAN CTO handoff for `9194eed8`. | Archive only after founder blocker is acknowledged. |
| State Correction Wave-2 SC-1/SC-2/SC-4 | DONE | `CLAUDE.md` now records current routing/fleet truth; `apps/scripts/qorium-fleet-snapshot.sh` proved active `12/12` and old-origin `38/38` QOrium services online; API health truth is `/healthz` and `/health` = HTTP `200`, `/v1/healthz` and `/v1/health` = HTTP `404`; `infra/NIRANTAR-Replacement-Plan-v0.md` created. | Commit/push scoped state-correction files. |

## BLOCKED

| Task | Status | Owner | Evidence | Next |
| --- | --- | --- | --- | --- |
| Enable real Sentry event capture | BLOCKED | Founder/Sentry admin | Live status JSON says `enabled:false` and `dsnConfigured:false`; active-origin env has no `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, or `SENTRY_PROJECT`; prior Sentry token could list projects/teams but project creation returned HTTP `403`. | Provide QOrium Sentry DSN/client key or a Sentry token with project-create/client-key permission. |
| Confirm Bing sitemap processing completion | IN PROGRESS | Bing / SEO operator | Public sitemap is healthy with `1190` URLs, but no Bing/Webmaster/IndexNow credential names are present locally or on active origin for authenticated Webmaster Tools status. | Re-check Bing Webmaster Tools later; no code action pending. |
| Merge author-owned phase branch to `main` | BLOCKED | Non-author reviewer | Current production includes the route via newer active release, but branch `codex/qorium-marketing-phase4-main` still needs cross-account review/merge for `main` parity. | Have another account review/merge; author must not approve own merge. |
| Patch `talpro_qorium_fleet_status` MCP registry | PARTIAL | Codex / MCP owner | This repo now includes canonical raw-PM2 snapshot script; the MCP registry implementation is outside this repository/tool surface in this session. | Patch the Talpro MCP registry implementation when available. |
| Choose NIRANTAR sunset path | BLOCKED | CEO/CTO | Live NIRANTAR headers still show `deprecation: true` and `sunset: Mon, 31 Aug 2026 00:00:00 GMT`; stub plan exists. | Choose extend-current-service or `nirantar-v2` after 360-audit. |

## ARCHIVE CERTIFICATION

Not archive-ready as a fully complete Sentry activation or Bing ingestion certification. Code/deploy proof is archive-ready; real Sentry capture waits on the DSN/permission blocker, and Bing sitemap processing is an external wait. No `.env` or secret files were staged by this closeout.
