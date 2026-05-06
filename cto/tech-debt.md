# Tech Debt Register

**Owner:** CTO Office · **Authority:** Constitution SO-3 (Quality Gate), SO-16 (Documentation as Code)
**Cadence:** Reviewed every Friday in Bali debrief (10-min CTO slot); cleared in priority order in Mon weekly sprint planning.
**Discipline:** Append-only. Never delete an entry; mark `RESOLVED` with commit reference and date.

---

## Why this exists

Honest accounting of every shortcut taken during build sessions. The Constitution + ADRs + runbooks define the right way to do things. This register tracks where we knowingly diverged because the cost of doing it right wasn't worth the timeline cost.

Two rules:

1. **No silent shortcuts.** If you cut a corner, log it here in the same commit.
2. **No compounding.** Tech debt entries that age >90 days without progress get escalated to the monthly business review for prioritization (or explicit deprioritization).

---

## Severity rubric

| Severity     | Definition                                                                                                                 | Pay-down deadline |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Critical** | Constitutional violation (SO-3, SO-15, SO-16, etc.) currently in production. Active risk.                                  | 30 days           |
| **High**     | Quality bar miss with measurable customer impact OR security weakness in a non-prod path that will become prod.            | 90 days           |
| **Medium**   | Operational annoyance, missing test coverage, missing instrumentation. No active customer impact but slows next iteration. | 180 days          |
| **Low**      | Style nits, documentation gaps, deferred polish.                                                                           | Y2+               |

---

## Open debt

### TD-001 — UptimeRobot or equivalent uptime monitor not yet provisioned

- **Severity:** Medium
- **Logged:** 2026-05-06 (Completion Sprint v1)
- **Why:** SLI uptime target documented in `cto/sli-slo.md` is currently unmeasured. Manual cURL checks happen on deploy; nothing checks 24/7.
- **Cost of doing it right:** ~30 min setup (UptimeRobot free tier; alert to CTO email + WhatsApp).
- **Why deferred:** Pre-launch Y1 traffic = 0; downtime impact = 0; ROI on monitor was lower than "ship Phase 1 work first" trade.
- **Pay-down trigger:** Site goes live + first external customer mention ≥1 → set up immediately.
- **Owner:** CTO
- **ETA:** Within 7 days post-launch

### TD-002 — No real-time p95 latency metric

- **Severity:** Medium
- **Logged:** 2026-05-06
- **Why:** Marketing claim of `<200ms p95` for ReadyBank API and `<500ms TTFB` for marketing site are unmeasured continuously. Sampled manually.
- **Cost of doing it right:** Plausible Analytics performance plugin OR Vercel's Speed Insights (if we ever flip to Vercel) OR custom synthetic monitor.
- **Why deferred:** ReadyBank has no live customers; marketing latency observed in smoke tests is acceptable. Same Y1 ROI calculus as TD-001.
- **Pay-down trigger:** First ReadyBank customer onboards.
- **Owner:** CTO
- **ETA:** Within 14 days post-first-customer

### TD-003 — Anti-leak engine + IRT calibration job not yet built

- **Severity:** High (constitutional claim — `qorium.online` claims daily anti-leak rotation; SO-22 requires it)
- **Logged:** 2026-05-06
- **Why:** The website asserts a daily anti-leak SLA. Today, Talpro Customer Zero hires through manual question reuse + ad-hoc rotation. The automated engine (per CTO Architecture §6) is M2 deliverable.
- **Cost of doing it right:** Significant — multi-week engineering project. Tracked in CTO Architecture v1 as M2 scope.
- **Why we ship the claim now:** Customer Zero (Talpro India) does run a daily rotation discipline manually. The website's claim is honest at the daily-rotation level; the AUTOMATION is what's deferred.
- **Pay-down trigger:** M2 sprint; per Blueprint trajectory.
- **Owner:** CTO + CDO hat
- **ETA:** M2 (approximately 60 days from current)

### TD-004 — No status page (no customer-facing incident notification surface)

- **Severity:** Low
- **Logged:** 2026-05-06
- **Why:** P0/P1 incidents currently notified via email per `cto/runbooks/incident-response.md` §Customer notification. No status.qorium.online page.
- **Pay-down trigger:** First paid customer onboards.
- **Owner:** CTO
- **ETA:** Within 30 days post-first-paid-customer

### TD-005 — Marketing site has no Vitest/Jest unit tests

- **Severity:** Low
- **Logged:** 2026-05-06
- **Why:** Marketing app's test coverage is Playwright E2E only (5 critical-route smoke tests). Copy decks, utilities (`lib/cn`, `lib/seo`), components are untested.
- **Why deferred (Completion Sprint v1):** TS strict mode catches the most common errors at compile time; E2E catches integration issues; unit tests for marketing-only utils are low-leverage.
- **Pay-down trigger:** A bug in production that a unit test would have caught.
- **Owner:** CTO
- **ETA:** Reactive (don't proactively chase coverage; add tests when bugs surface)

### TD-006 — Lighthouse + axe in CI run in `warn` mode (not enforced)

- **Severity:** Low
- **Logged:** 2026-05-06 (per `apps/marketing/lighthouserc.json` thresholds)
- **Why:** Lighthouse perf ≥85, a11y ≥90, etc. configured as `warn` not `error` in `lighthouserc.json`. CI doesn't fail the PR if scores drop.
- **Why deferred:** Need 3 successful PR runs to baseline real scores before flipping to `error`. Per `apps/marketing/PRE-LAUNCH-CHECKLIST.md` §B.
- **Pay-down trigger:** After 3 PR runs land scores; flip warn → error in `lighthouserc.json`.
- **Owner:** CTO
- **ETA:** Within 30 days of first 3 PR runs

### TD-007 — Sentry DSN not configured (no error tracking)

- **Severity:** Medium
- **Logged:** 2026-05-06
- **Why:** Frontend errors and Server Action errors land in PM2 logs (server-side) or browser console (client-side). No aggregation, no alerting.
- **Cost of doing it right:** Sentry account + DSN env var + `@sentry/nextjs` integration.
- **Why deferred:** No customer impact yet; PM2 logs are sufficient for the current investigation cadence.
- **Pay-down trigger:** First customer-reported bug that would have been caught by Sentry.
- **Owner:** CTO
- **ETA:** Within 60 days post-first-paid-customer

### TD-008 — No CRM integration for /contact and /demo form submissions

- **Severity:** Medium
- **Logged:** 2026-05-06
- **Why:** Form submissions go via mailer (Resend → Gmail SMTP → console-fallback per ADR 0003). They do NOT auto-flow to a CRM (Pipedrive / HubSpot Free / etc.). Bali manually transcribes from email to CRM.
- **Cost of doing it right:** Webhook integration in the Server Action → CRM API.
- **Why deferred:** Volume is Y1 = low; manual entry is fine; CRM choice (Pipedrive vs HubSpot vs SFDC) is a Bali decision for Y1.
- **Pay-down trigger:** Form submissions exceed 5/day OR Bali signals manual entry is the bottleneck.
- **Owner:** CTO + Bali
- **ETA:** Y1 Q3 (after CRM choice locks)

### TD-009 — Bundle baseline not yet captured

- **Severity:** Low
- **Logged:** 2026-05-06
- **Why:** `@next/bundle-analyzer` plumbed (per Phase 1.6 of Completion Sprint v1) but baseline run not captured to `apps/marketing/BUNDLE-BASELINE.md`.
- **Cost of doing it right:** Run `pnpm --filter @qorium/marketing build:analyze` once, capture the per-route gzip sizes.
- **Pay-down trigger:** Next time CTO is doing bundle work.
- **Owner:** CTO
- **ETA:** Within 30 days

### TD-010 — Logo SVG is placeholder; final brand identity pending

- **Severity:** Low
- **Logged:** 2026-05-06 (per PRE-LAUNCH-CHECKLIST D3)
- **Why:** `apps/marketing/src/components/site/Logo.tsx` + `app/api/brand/{logo,wordmark}.svg/route.ts` are marked `// PLACEHOLDER`.
- **Why deferred:** Final brand identity is a design review cycle (3-5 days). Site is launchable with the placeholder.
- **Pay-down trigger:** CEO + design team complete the final brand asset.
- **Owner:** CEO + design (CTO swaps file when delivered)
- **ETA:** D3 in PRE-LAUNCH-CHECKLIST

### TD-011 — Backfilled ADRs from prior build sessions

- **Severity:** Low
- **Logged:** 2026-05-06
- **Why:** ADRs 0001-0006 were written in this CTO sprint after the decisions were already implemented in prior sessions. Going forward (per `cto/adrs/README.md` Backfill discipline), no new architectural decision merges to `main` without an ADR in the same PR.
- **Pay-down trigger:** This entry stays open as a reminder of the discipline shift; no further action required (unless the rule is broken — which would be a separate entry).
- **Owner:** CTO
- **ETA:** Permanent reference

### TD-012 — secret-rotation-log.md doesn't exist yet (no rotations have happened)

- **Severity:** Low
- **Logged:** 2026-05-06
- **Why:** `cto/runbooks/secret-rotation.md` references `cto/secret-rotation-log.md` as the place to log rotations. The file will be created on the first rotation.
- **Pay-down trigger:** First quarterly rotation (target 2026-08-05).
- **Owner:** CTO
- **ETA:** Q3 2026

### TD-013 — Bali AI Agent service (services/bali-agent/) not built

- **Severity:** Low (artifacts exist; engineering deferred)
- **Logged:** 2026-05-06
- **Why:** Per SO-18 + Bali Playbook §9, the Recruiter motion needs an AI Agent. Prompts + templates + escalation rubric + guardrails ALL shipped (in `bali/ai-agent/`). What's missing is the TypeScript service that loads them.
- **Cost of doing it right:** ~2-3 week engineering sprint.
- **Why deferred:** Per Blueprint, the AI Agent is M2 scope. Y1 first 3 months are content engine + first hires. Recruiter motion runs founder-led + manual until M2.
- **Pay-down trigger:** M2 per Blueprint.
- **Owner:** CTO + Bali
- **ETA:** M2 (~60 days)

---

## Resolved debt (historical record)

(Empty — first entries land when something gets resolved. Format will be:)

```
### TD-NNN — <title> — RESOLVED YYYY-MM-DD

- Original severity: <X>
- Original logged: YYYY-MM-DD
- Resolved by: commit <SHA> + PR #NN
- Pay-down approach: <one-line description>
- Lessons learned: <if any>
```

---

## Aging audit

Entries older than 90 days without status change → flagged in monthly business review.

| Entry               | Logged     | Days open | Status |
| ------------------- | ---------- | --------- | ------ |
| All current entries | 2026-05-06 | 0         | New    |

(This table updates monthly during business review.)

---

## How to add an entry

1. Pick the next TD-NNN number.
2. Use the existing entry format (Severity / Logged / Why / Cost of doing it right / Why deferred / Pay-down trigger / Owner / ETA).
3. Reference any ADR or runbook the entry relates to.
4. Commit in the same PR as the shortcut you're logging.

---

_Cross-references: Constitution SO-3 (Quality Gate Discipline — tech debt is the honest accounting of where we knowingly violate it), SO-16 (Documentation as Code). Companion: `cto/sli-slo.md` (gaps tracked here become tech debt). Operating cadence: Friday CTO slot in Bali debrief + monthly business review aging audit._
