# QOrium Session Task Plan

Last updated: 2026-06-02 — Codex archive closeout + NIRANTAR registry proof

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Recap every requested/started session item | DONE | `_shared/QUEUE.md` contains task table and archive certification. | Include final summary. |
| Run safe checks | DONE | `pnpm install --frozen-lockfile`, `pnpm run scan:secrets`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`, `pnpm run smoke`, and `pnpm run e2e` passed on 2026-06-02. | Keep gates green. |
| Fix broken local gate | DONE | `@qorium/web` lint no longer runs removed `next lint || true`; it now runs `tsc -p tsconfig.json --noEmit` and passes inside Turbo. | Done. |
| Verify live routes and headers | DONE | `https://qorium.online/`, `/healthz`, `/sitemap.xml`, `https://api.qorium.online/healthz`, and `/health` returned HTTP `200` across the 2026-06-02 closeout checks; active-origin head is `18110f1`; public routes include HSTS, CSP, frame, content-type, referrer, and permissions headers where applicable. | Continue watchdog monitoring. |
| Verify SEO indexing state | IN PROGRESS | Bing Webmaster Tools still shows sitemap status `Processing`, known `1`, errors `0`, warnings `0`, total URLs discovered `0`; sitemap is public `200` with `1190` URLs and Bing CNAME resolves. | Re-check Bing later. |
| Update queue/state | DONE | Updated `_shared/QUEUE.md`, `task_plan.md`, `QUEUE-QOrium.md` Run #36, and the live NIRANTAR completion queues; MCP evidence branch `codex/nirantar-fleet-registry-20260602` is pushed at `965ea45`. | Done. |
| Save session state | DONE | `session_save_state` called for project `QOrium`. | Resume from saved state if thread is reopened. |
| Commit/push safe verified work | DONE | Scoped closeout repair committed and pushed on branch `specs`; final report carries the exact SHA. | No author self-merge. |
| Deploy/reverify production | DONE | No runtime deploy needed for the lint-script-only code change; current production remains live and verified. | Re-check Bing processing later. |
| PM2 saved-state check | DONE | Active-origin `pm2 save` completed; direct PM2 shows marketing/chatbot/leak-crawler online with unstable restarts `0`; MCP orphan tool output was inconsistent with direct host PM2 and recorded as a tool-context warning. | Re-run direct host PM2 check if fleet dashboard disagrees. |

## Founder Action Required

Bing sitemap processing remains external/pending; no founder action required.
