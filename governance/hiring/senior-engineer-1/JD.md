# Job Description — Senior Engineer #1, QOrium

**Location:** Mumbai or Bangalore (preferred) or remote within India
**Type:** Full-time · Senior IC (no direct reports at hire)
**Reports to:** CTO
**Compensation:** ₹50-80 LPA base · 0.5-1.0% ESOP (4-year vest · 1-year cliff) · standard India benefits
**Posted:** [DATE TBD on CEO approval]

---

## About QOrium

QOrium builds **ReadyBank** — an IRT-calibrated, anti-leak-rotated,
watermark-per-candidate question library for technical hiring. The
stack is TypeScript + Node + Postgres + AWS, with a small but
deliberate codebase: every file pulls weight, every package ships
with tests, every migration is idempotent and reversible.

Today the codebase is 27 workspaces, ~1,000 unit tests green, and 6
shipped production surfaces. We are pre-cred-drop (no live customer
SES, no live SAML IdP, no live Grafana — all infra-as-code is ready;
apply gated on `BOOTSTRAP_AUTHORIZED=true`). We've shipped IRT
calibration, anti-leak detection, watermark engine, double-watermark
Stack-Vault, JD-Forge alpha, observability IaC, multi-region IaC,
and SOC 2 readiness scaffolding.

You will be the second engineer on this codebase. The CTO Office is
your peer; you ship sprints independently, review CTO-Office work,
and split on-call.

## The role in one paragraph

You own production engineering — uptime, security review, scaling,
and 50% of all sprints. You bring senior judgement on Postgres,
TypeScript, multi-tenant SaaS, and at minimum one of: psychometric/
IRT systems, SAML/OIDC/SCIM, anti-cheat, or compliance engineering.
You are not a manager (yet); you are an IC who can lead by writing
code, opening sharp PRs, and reviewing well.

## What you'll do (first 90 days)

### Week 1-4 — Onboard
- Read the codebase + commits + ADRs + Constitution + dashboard
- Pair with CTO Office on 2-3 small fixes; ship 1 small sprint solo
  (target: a Sprint 4.x feature)
- Take ownership of one production surface (likely `services/anti-leak`
  or `services/jd-forge`) — you become the primary on-call for it
- Co-author 1 ADR on something you saw in the code that wants
  fixing

### Week 5-12 — Ship
- Land 2 medium sprints (e.g., webhook subscriber wiring;
  ATS-Lever live sync; SOC 2 evidence cron)
- Review every PR the CTO Office ships; CTO Office reviews every
  one of yours
- Take primary on-call alternate weeks
- Drive at least 1 cross-cutting refactor (e.g., the audit-event
  hash backfill worker; the multi-region failover smoke harness)

### Week 13+ — Own
- Lead a feature track end-to-end (proposal → spec → ship)
- First customer-bound feature that ships in your name (e.g., live
  SAML IdP integration after cred-drop)
- Optional: start mentoring an intern or junior IC if scope warrants

## What we're looking for

### Required

- 6+ years backend engineering at a product company
- TypeScript + Node.js: not just used; opinions on testing, async
  patterns, error handling
- Postgres: comfortable with EXPLAIN, indexes, RLS, partial
  indexes, JSONB, generated columns; knows how MVCC works
- Experience with **at least one** of:
  - Psychometric / IRT / item-banking systems
  - SAML / OIDC / SCIM
  - Multi-tenant SaaS data isolation
  - Anti-cheat / watermarking / proctoring
  - SOC 2 / ISO 27001 / DPDPA compliance engineering
- Async-first, written-decision-trail working style
- Comfort with terraform / infra-as-code

### Strong to have

- AWS multi-region operations experience
- OpenTelemetry / Sentry / Grafana hands-on
- Open-source contributions (Node, pg, TS, related)
- Past CTO/co-founder experience at a smaller startup
- India-stack context: GST, RBI compliance, payment integrations

### Nice to have

- Postgrad CS degree
- Conference talks
- Recognized authorship in TS/Node ecosystem

## How you'll be evaluated

The interview process tests four things:

1. **System design under constraints** — you're given a spec, real
   QOrium constraints, and 60 minutes; design + tradeoffs + risks
2. **Code quality** — paid take-home (4 hours, ₹10K honorarium):
   small contained problem in our actual stack
3. **Production judgement** — incident-replay scenario; what do you
   check, in what order, what do you fix?
4. **Communication** — written ADR-style writeup of a real-world
   technical disagreement you've had

See `interview-process.md` for the stage gates.

## Compensation + benefits

- **Base:** ₹50-80 LPA (band; final number depends on experience)
- **ESOP:** 0.5-1.0% (depends on level; 4-year vest with 1-year
  cliff)
- **Variable:** none at this level — no perverse-incentive risk
- **Benefits:** India-standard health insurance for self + dependents;
  ₹1L/year learning budget; macOS laptop of your choice; home-office
  stipend for remote setup; conference travel reimbursed
- **Leave:** 30 days a year combined casual + earned + sick;
  unlimited unpaid sabbatical option after Y1
- **Sabbatical:** 4 weeks paid at 4-year mark
- **On-call comp:** alternate weeks; one weekend free per cycle;
  paged < 5 times per quarter target; if breached, comp adjustment
  per CEO discretion

## How to apply

Email **[careers@qorium.online]** with:

- Your CV
- A 1-page note on the strongest piece of code you've shipped — what
  was the problem, what was the design decision, what did you learn
- Your LinkedIn URL
- Optional: a public code repo or PR you're proud of
- 2-3 references (consent contacted later)

If you want a 30-min chat before applying, send a 3-line note. We
read every email.

## Anti-discrimination

QOrium is an equal-opportunity employer. We do not discriminate on
the basis of caste, religion, gender, sexual orientation, age,
disability, marital status, or any protected characteristic. We
welcome applications from candidates of all backgrounds.

## Process discipline

- We respond to every application within 7 business days
- Our take-home is **paid** (₹10,000 / 4 hours) regardless of
  outcome; we honour your time
- We do **not** ask for current-comp; we make offers based on the
  value of the role
- We give written feedback on rejections at every stage past the
  first round
- Total candidate time investment: ~10-12 hours over 5-6 weeks

---

**Apply:** careers@qorium.online
**Questions:** ceo@qorium.online (Bhaskar Anand, founder)
**About QOrium:** https://qorium.online
**Codebase glance** *(public surface only)*: `https://qorium.online/styleguide`

---

_This JD is a draft. CEO must approve before posting. Final posted
copy will reference live URLs + the live careers email
infrastructure (cred-bound on cred-drop)._
