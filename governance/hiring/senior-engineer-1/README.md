# Senior Engineer #1 — Hiring Pack

**Owner:** CEO + CTO Office
**Anchor:** QOrium Constitution Article IX M2 hire (Phase 1 punchlist I1)
**Tile:** `human-prep.senior-eng-hire.jd-and-pipeline` (auto-eligible: true)
**Linked human tile:** `human.senior-eng-hire` (blocked-on-CEO+CTO)
**Status:** ready-for-CEO-review
**Role type:** Full-time employee · Senior IC · Mumbai/Bangalore preferred or remote (India only)

This folder is the recruiting pack for QOrium's first non-founder
engineer — Senior Engineer #1. The role is the technical
counterweight to the CTO Office and the operational owner of the
ReadyBank service in production.

## Why this hire matters

Today the entire stack — `services/readybank`, `packages/irt`,
`packages/auth`, `packages/saml`, `services/anti-leak`,
`services/jd-forge` (alpha), `infra/auto-bootstrap/*` — runs through
the CTO Office. That's structurally fragile:

- One brain on production = one failure mode
- Y1 cadence is sustainable only because the codebase is small
- Y2 must scale (multi-region, SOC 2 prod, real ATS connectors,
  webhook subscribers) — that requires 2+ engineers minimum
- Customer-bound features (Stack-Vault tenant onboarding, SAML
  live integration) need a second pair of eyes for security review

Senior Engineer #1 is the first peer to the CTO Office — not a
junior IC, not a manager — someone who can ship Sprints
independently, review CTO-Office work, and own production on-call
for half the week.

## Profile we're looking for

### Required

- 6+ years backend engineering at a real-volume product company
- TypeScript + Node.js (services/readybank is TS+Express+pg)
- Postgres (we are deeply in pg; we use migrations + RLS + JSONB +
  partial indexes; we treat pg as an active part of the design)
- Experience with **at least one** of:
  - Psychometric / IRT / item-banking systems (HackerRank, Mettl,
    AspiringMinds, ETS, Pearson VUE — even tangential exposure
    counts)
  - High-stakes assessment / certification platform engineering
  - Anti-cheat / proctoring / watermarking / fraud-detection
    systems
- Experience with **at least one** of:
  - SAML / OIDC / SCIM (Sprint 3.3 alpha shipped @qorium/saml; we
    need someone who can take this to GA with live IdP testing
    after cred-drop)
  - Multi-tenant SaaS hardening (Sprint 3.4 shipped tenant-isolation
    middleware; needs scale-up)
  - SOC 2 / ISO 27001 / Indian DPDPA compliance engineering
- Comfort with India-stack context: GST / NEFT / RBI compliance is
  somewhere on the codebase roadmap
- Async-first, written-decision-trail working style

### Strong to have

- Open-source contributions to TS/Node/pg ecosystem
- Direct AWS infra experience (we use multi-region IaC in Sprint 5.0)
- Observability-as-code (Grafana/Sentry/OpenTelemetry — Sprint 4.1
  shipped IaC; needs someone who can debug a real incident)
- Experience hiring + mentoring engineers (Y2 we'll likely add 1-2 ICs)

### Nice to have

- Past life as a CTO/co-founder at a smaller startup (returnees
  often make great senior ICs at the next stage)
- Postgraduate degree (CS or relevant)
- Conference talks; open-source maintenance

### What we're NOT looking for

- Engineering managers without recent IC time
- Frontend-only engineers (we have a static HTML/JS admin SPA;
  there's no Next.js / React project to lead)
- Big-co generalists with no startup exposure

## Files in this pack

| File | Purpose |
|---|---|
| `JD.md` | Job description (publishable) |
| `sourcing-pipeline.md` | Channel mix + target list + outreach plan |
| `screening-rubric.md` | Take-home + interview rubric |
| `compensation-band.md` | TC band + ESOP + benefits |
| `interview-process.md` | Stage gates + decision criteria |

## Decision required from CEO

| # | Decision | Recommendation |
|---|---|---|
| 1 | Approve JD as written | YES |
| 2 | Approve compensation band | ₹50L-₹80L base + 0.5-1.0% ESOP, 4-year vest, 1-year cliff |
| 3 | Approve sourcing channel mix + spend | Recommended ₹3L recruiter retainer + ₹1L LinkedIn + ₹1L referral bonuses |
| 4 | Approve a 4-hour paid take-home | YES — paid ₹10K, structured, optional alternative live coding |
| 5 | Designate hiring panel | Recommended: CEO (final), CTO Office (technical depth), Talpro Delivery Head (consultative for India-stack fit) |

## Timeline target

- Week 1-2: post JD + recruiter brief + open referral bounty
- Week 3-5: candidate flow; phone screens
- Week 6-8: deep interviews; reference checks
- Week 9-10: offer + close

Realistic close: 10-14 weeks from JD post. Senior engineers who fit
this profile are 2-3 month commits in India market.

## What changes when hired

- `human.senior-eng-hire` flips `blocked-on-human` → `complete`
- Production on-call splits 50/50 between CTO Office and Sr Eng #1
- Sprints become parallel-trackable (one CTO-Office sprint + one
  Sr-Eng-1 sprint per week)
- Code review becomes 2-eye on every customer-bound PR (security
  win)
- M2 hire (per Constitutional Y1 punchlist I1) closes
- Master Meter denominator drops by 1 in the human lane

---

_Prepared by CTO Office under MANTHAN human-lane acceleration plan, 2026-05-08._
_NO outreach has been sent. Job posting is gated on CEO approval._
