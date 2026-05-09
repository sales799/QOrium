# Screening Rubric — Senior Engineer #1

The hire decision rests on four dimensions, each with a 1-5 score
and worked examples. Final hire requires ≥ 4 on every dimension and
≥ 17 total (out of 20).

---

## Dimension 1 — Code quality (weight 30%)

**What it tests:** can the candidate write production-grade
TypeScript that ships?

**Test instrument:** the paid take-home (4 hours · ₹10K honorarium ·
7-day deadline). See `sourcing-pipeline.md` for the sample brief
(audit-chain verifier).

**Scoring criteria:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Clean separation of pure logic from I/O; types are tight; tests cover the 4 stated cases + at least 2 edge cases; canonical JSON serialisation is deterministic; no over-engineering | Mixes I/O with hashing; types are `any`-heavy; no tests OR tests are smoke-only; non-deterministic JSON ordering; uses libs unnecessarily |
| 4 | Strong code; tests cover all 4 stated cases; minor stylistic nits | Code works but pattern is fragile (e.g., Object.keys() order assumption) |
| 3 | Code works; tests are partial; some edge cases missed | Works for happy path only; legacy NULL case not handled |
| 2 | Compiles, partially works; missing test or correctness gap | Doesn't run cleanly; types broken in places |
| 1 | Doesn't run OR doesn't solve the problem | Misunderstands the brief entirely |

**Calibration:** the CTO Office's own audit-hash.ts implementation
(shipped Sprint 4.4.3) scores 4.5/5 on this rubric. We expect senior
candidates to land at ≥ 4.

---

## Dimension 2 — System design under constraints (weight 25%)

**What it tests:** when given a real QOrium spec, can the candidate
design + reason about tradeoffs + surface risks?

**Test instrument:** 60-minute design interview (whiteboard or
shared doc, no code). Sample prompt:

> Design QOrium's webhook delivery service. Given:
>
> - We emit `audit.events` rows; subscribers are tenants who
>   register `(event_type pattern, callback URL)`
> - Retry schedule is `[0s, 60s, 5m, 30m, 4h, 24h]` over 35 hours
> - Delivery must be HMAC-signed; subscribers verify the signature
> - Volume target: 10K events/min sustained, 100K/min burst
> - Subscribers can be temporarily down for hours; we must recover
>   gracefully
> - Tenants can suspend / unsuspend subscriptions; their events buffer
>
> Design the system. Cover: data model, processing model (queue
> shape, worker count, idempotency), failure modes, observability,
> rate-limiting per tenant, and how you'd incrementally roll out.

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Identifies the back-pressure problem early; proposes a queue + worker design with idempotency keys; addresses noisy-neighbour with per-tenant rate limit; proposes circuit-breaker + retries with jitter; surfaces 3+ failure modes proactively; talks observability dimensions; talks rollout (shadow mode, then real); knows when to use Postgres vs Redis vs SQS | No queue; assumes synchronous delivery; no idempotency; no rate limiting; no failure-mode surfacing |
| 4 | Strong design; misses 1 of the listed dimensions | Decent design; doesn't surface noisy-neighbour or rollout |
| 3 | Reasonable v0 design; misses 2-3 dimensions | Buys into "obvious" patterns without justifying |
| 2 | Confused or surface-level | Cargo-cults Kafka/RabbitMQ without rationale |
| 1 | Cannot reason about the problem | Refuses or gives up |

**Bonus signal:** candidate asks clarifying questions before
designing. Senior ICs do this; juniors jump to whiteboard.

**Calibration:** matches what CTO Office shipped in Sprint 4.5
(`packages/webhooks` — RETRY_SCHEDULE_SECONDS, MAX_DELIVERY_AGE,
HMAC signing, attempt-classifier).

---

## Dimension 3 — Production judgement (weight 25%)

**What it tests:** when prod is on fire, what do you do?

**Test instrument:** 30-minute incident-replay scenario. Sample
prompt:

> It's 11pm IST on a Tuesday. Page: ReadyBank API has been returning
> 500s for the last 6 minutes. p95 latency in Grafana is 12s (was
> 80ms an hour ago). Pg replica is showing replica lag of 4 minutes
> (alert threshold: 30s). The audit-events table just hit a 1B row
> milestone yesterday.
>
> What do you check, in what order? What hypotheses are you
> forming? At what point do you escalate? At what point do you
> consider rolling back the last deploy?

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | First check: pm2 logs for crashes; second: pg pg_stat_activity for long queries; third: replica's hot_standby_feedback; suspects 1B-row milestone is causing index degradation; correlates with last deploy; defines "rollback at 15 minutes" line; mentions paging human (CEO) at 30 min if not understood; talks about post-incident write-up | Says "restart the service" without diagnosing |
| 4 | Strong sequence; misses 1-2 specific checks | Right instincts; less specific |
| 3 | Generic SRE flow; not QOrium-specific | "Check the logs" without specifics |
| 2 | Confused order; misses replica lag implications | Suggests destructive actions before diagnosing |
| 1 | Panics or stalls | Cannot reason about prod ops |

**Calibration:** the CTO Office's own incident response per
`governance/observability-runbook.md` and `governance/dr-runbook.md`.

---

## Dimension 4 — Communication (weight 20%)

**What it tests:** can the candidate articulate a technical
disagreement in writing for an async-first team?

**Test instrument:** 30-minute take-home essay (2-3 days deadline).
Prompt:

> Tell us about a real-world technical disagreement you had at a
> previous role. What did the other side believe? What did you
> believe? What evidence did you bring? How did it resolve? What
> did you learn?
>
> 600-800 words. Plain prose. Real example only — we'll probe in
> the deep panel.

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Specific situation; both positions articulated fairly; concrete evidence brought; humility about being wrong; learning is non-trivial; under 800 words | Vague situation; only "their" position explained; pure assertion of being right; no learning surfaced |
| 4 | Strong narrative; minor gap | Strong on what happened; thin on learning |
| 3 | Decent but generic | Plenty of detail but lacks self-awareness |
| 2 | Confused timeline; one-sided | "I was right; they came around" without nuance |
| 1 | Refuses or essay is irrelevant | "I never disagreed with anyone" (red flag) |

**Why this matters:** QOrium's working norm is async + written.
Engineers who can't write a sharp disagreement memo become bottlenecks.

---

## Total scoring + decision rule

Total = (D1 + D2 + D3 + D4) out of 20.

| Total | Decision |
|---|---|
| 18-20 | Strong hire — extend offer |
| 17 | Hire if D1 ≥ 4 — confirm with CTO Office one-pager |
| 14-16 | Borderline — schedule second-round panel; decide post-panel |
| ≤ 13 | Decline |

**Mandatory floors:**
- D1 (code quality) ≥ 4 — non-negotiable for an IC role
- D3 (prod judgement) ≥ 3 — they'll be on-call
- D4 (communication) ≥ 3 — async-first is non-negotiable

If any mandatory floor fails, decline regardless of total.

---

## Anti-patterns

- **Whiteboard champion, code-thin** — high D2, low D1. Common
  pattern for big-co interview-prepped candidates. Decline.
- **Confidently wrong on prod** — high D2 + D4 but D3 reveals "always
  rolls back without diagnosis." Production wisdom can't be faked.
- **Manager in IC clothing** — claims to be hands-on but the take-
  home shows rust. Decline; they want a manager role.
- **Cargo-cult Kubernetes** — every answer is "k8s + service mesh +
  istio." We're TS+pg+AWS in 2 services with PM2. Decline.
- **One-domain expert** — strong on TypeScript but cannot reason
  about pg internals. Decline; we are deeply pg.

---

## How to administer

| Stage | When | Who runs it | Time |
|---|---|---|---|
| D1 take-home | post-phone-screen | sent by CTO Office | 4h candidate · 1h scoring |
| D2 design | round 2 | CTO Office | 60 min |
| D3 prod scenario | round 2 | CTO Office | 30 min (same call as D2) |
| D4 essay | between rounds | take-home | 30 min candidate · 30 min scoring |
| Reference checks | round 3 | CEO | 30 min × 2-3 |
| Final | round 4 | CEO + CTO Office | 30 min decision + offer call |

Total candidate investment: ~10 hours (paid for take-homes).
Total QOrium time per candidate: ~6 hours.

For a target close in 10-14 weeks, run 5-7 candidates through the
full process. Phone-screen filter ratio: ~30%.

---

_Rubric calibrated against CTO Office's own performance on the same
exercises. Scorecards stored in
`governance/hiring/senior-engineer-1/scorecards/`._
