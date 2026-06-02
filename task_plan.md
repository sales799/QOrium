# QOrium Session Task Plan

Last updated: 2026-06-02 — Codex archive closeout + lint gate repair

| Task | Status | Evidence | Next |
| --- | --- | --- | --- |
| Recap every requested/started session item | DONE | `_shared/QUEUE.md` contains task table and archive certification. | Include final summary. |
| Run safe checks | DONE | `pnpm install --frozen-lockfile`, `pnpm run scan:secrets`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`, `pnpm run smoke`, and `pnpm run e2e` passed on 2026-06-02. | Keep gates green. |
| Fix broken local gate | DONE | `@qorium/web` lint no longer runs removed `next lint || true`; it now runs `tsc -p tsconfig.json --noEmit` and passes inside Turbo. | Commit/push lint gate repair. |
| Verify live routes and headers | DONE | `https://qorium.online/`, `/healthz`, `/sitemap.xml`, `https://api.qorium.online/healthz`, and `/health` returned HTTP `200` at `2026-06-02T08:50:08Z`; public routes include HSTS, CSP, frame, content-type, referrer, and permissions headers where applicable. | Continue watchdog monitoring. |
| Verify SEO indexing state | IN PROGRESS | Bing Webmaster Tools still shows sitemap status `Processing`, known `1`, errors `0`, warnings `0`, total URLs discovered `0`; sitemap is public `200` with `1190` URLs and Bing CNAME resolves. | Re-check Bing later. |
| Update queue/state | DONE | Updated `_shared/QUEUE.md` and `task_plan.md`; existing `QUEUE-QOrium.md` already contains latest Run #35 live deployment evidence. | Commit and push state files only. |
| Save session state | DONE | `session_save_state` called for project `QOrium`. | Resume from saved state if thread is reopened. |
| Commit/push safe verified work | IN PROGRESS | Safe files identified: `qorium-app/apps/web/package.json`, `_shared/QUEUE.md`, `task_plan.md`. | Stage by name, commit, push. |
| Deploy/reverify production | DONE | No runtime deploy needed for the lint-script-only code change; current production remains live and verified. | Re-check Bing processing later. |
| PM2 saved-state check | DONE | Active-origin `pm2 save` completed; direct PM2 shows marketing/chatbot/leak-crawler online with unstable restarts `0`; MCP orphan tool output was inconsistent with direct host PM2 and recorded as a tool-context warning. | Re-run direct host PM2 check if fleet dashboard disagrees. |

## Founder Action Required

Bing sitemap processing remains external/pending; no founder action required.
