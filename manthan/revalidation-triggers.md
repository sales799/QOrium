# MANTHAN Re-Validation Triggers (SO-25 Mechanics)

**Authority:** Constitution SO-25 (Quarterly Competitive Scan + Acquisition Trigger), §10.3 (Competitive Watch protocol), §2.7 (Relationship classification)
**Owner:** CTO Office (MANTHAN operator Y1) + Bali (scan operator)

---

## Why this exists

Constitution SO-25 mandates: **"Acquisitions, market exits, or material strategic moves automatically trigger MANTHAN re-validation of any positioning that depended on the changed competitive state."**

The word that does the work is "automatically." This document defines:

1. WHAT counts as an automatic trigger.
2. HOW the trigger fires (operationally, who runs the re-validation).
3. WHICH prior MANTHAN deliverables (or governance positions) get re-validated when triggered.

Without this doc, the constitutional mandate is aspirational. With it, the mechanism is mechanical.

---

## Trigger taxonomy

Triggers come in three classes:

### Class A — Constitution-mandated (auto-fires)

Per Constitution §10.3 §4, a "material competitor move" is ANY of:

1. **Acquisition or merger** involving any classified competitor (§2.7 table)
2. **Market exit** (shutdown, public statement of withdrawal)
3. **Strategic pivot** (positioning shift, ICP shift, pricing-tier introduction or removal)
4. **Pricing change >20%** on any published tier
5. **Library size step-change >50%** (announced or measurable via API access)
6. **Founder or CEO transition**
7. **Funding round** (Series and amount, even if private)

Any of these → MANTHAN re-validation fires within 48 hours of detection.

### Class B — CTO-discretion (CTO can declare a trigger)

Even if Class A doesn't strictly fire, the CTO may declare a trigger when:

- A pattern of sub-threshold observations accumulates (e.g., 3 small pricing nudges in 6 months ≈ effective 20% change)
- A constitutional dependency is re-evaluated (e.g., Article VII auto-fail criteria added in Constitution v2.0 require re-validation of pre-v2.0 positioning)
- A customer pattern surfaces in Bali Fri weekly debriefs that the CTO judges material

### Class C — CEO-mandated

CEO can declare a re-validation at will. CTO operates it.

---

## What gets re-validated when a trigger fires

When a trigger fires, EVERY prior MANTHAN deliverable that touched the changed competitive dimension gets re-validated. Specifically:

### When a Class A #1 (acquisition) fires

- **All positioning assertions** in the Constitution §1.1 USP that referenced the acquired company
- **All pricing-band assertions** (SO-11, SO-23) that referenced competitive benchmarks involving the acquired company
- **All outreach scripts** in `bali/outreach/` referencing the acquired company by name
- **All `bali/leads/Y1-target-list.md` entries** for the acquired company (re-classify)
- **All ADRs** in `cto/adrs/` referencing the acquired company

Live precedents from this rule:

- **WeCP → Invisible Technologies (Mar 2026)** — triggered re-validation of the "what's our wedge" positioning. Result: positioning held; question-factory wedge confirmed empty pre-QOrium. (Retroactively absorbed into Constitution v2.0.)
- **Byteboard → Karat (Jan 2025)** — pre-dates SO-25; entry #001 in `competitive_research_log.md` is a retroactive log. Going forward, identical move triggers immediately.

### When a Class A #4 (pricing change >20%) fires

- **Pricing-band assertions** SO-23 ($5K-25K Platform API), SO-11 (₹40L Stack-Vault) — re-classify whether bands are still appropriate
- **Bali Playbook §6.3** Recruiter Subscription pricing — re-classify if the competitive baseline shifts
- **`bali/ai-agent/system-prompt.md`** pricing tiers — re-validate accuracy

### When a Class A #5 (library size +50%) fires

- **Strategic moat assertions** in Investor Brief §3 — re-classify whether QOrium's content engine output rate keeps pace
- **CTO Architecture §6** Anti-Leak Engine claims — re-validate against the new competitive baseline
- **SO-22 (AI plagiarism public benchmark)** SLO — re-classify whether <24h still differentiates

---

## Operational mechanism — how a trigger fires

### Step 1 — Detection (Bali quarterly scan OR ad-hoc)

Detection sources:

- Bali quarterly competitive scan (per `bali/templates/quarterly-competitive-scan.md`) — runs every 90 days
- Ad-hoc reports in Bali Fri weekly debrief (`bali/templates/win-loss-debrief.md` §4 Competitive observations)
- News monitoring by CTO during normal CTO Office cadence
- Customer-channel intel (a prospect mentions a competitor's move)

### Step 2 — Class A check + sub-threshold filter

Within 24 hours of detection:

- Bali (or detector) drafts the proposed log entry per `competitive_research_log.md` Findings template
- Checks whether the move meets a Class A threshold
- If yes → log as material; if no → log as sub-threshold (watch item)

### Step 3 — If material, log + notify

- Append to `competitive_research_log.md` with the next entry number
- Notify CTO + CEO via the team channel within 24 hours of logging
- Set the SO-25 timer: MANTHAN re-validation cycle must START within 48 hours of logging

### Step 4 — MANTHAN re-validation cycle starts

- CTO operates a fresh research classification per `manthan/research-classification-protocol.md`
- The classification's "trigger" field cites the `competitive_research_log.md` entry number
- The classification considers whether each affected positioning needs to change

### Step 5 — Outcome: hold, amend, or re-classify

- **Hold** — positioning holds despite the move. Document why; re-validation closes.
- **Amend** — positioning needs adjustment. Generate a Constitutional Amendment proposal per Article XI.
- **Re-classify** — the entire positioning needs a fresh blueprint. Run full MANTHAN cycle (`research-classification-protocol.md` → `blueprint-template.md` → IdeaForge gate → CEO acceptance → executing-Office handoff).

### Step 6 — File the cycle outcome

Save to `manthan/revalidations/YYYY-MM-DD-<title>.md`:

```markdown
# Re-Validation — <competitor / move>

**Triggered by:** competitive_research_log.md entry #NNN
**Date triggered:** YYYY-MM-DD
**Date re-validation completed:** YYYY-MM-DD (within 48h of trigger)
**Operator:** CTO Office

## Move detail

<from competitive_research_log.md>

## Affected positioning

<list of docs / SOs / ADRs / etc.>

## Re-validation outcome

- Positioning held: yes/no
- Amendment proposed: yes/no, link
- New classification triggered: yes/no, link to new manthan/classifications/...

## CEO acceptance

<date + form + any conditions>

## Status log

| Date       | Status                               |
| ---------- | ------------------------------------ |
| YYYY-MM-DD | Triggered                            |
| YYYY-MM-DD | Re-validation cycle started          |
| YYYY-MM-DD | Outcome filed; CEO accepted/rejected |
```

---

## Standing watch items (auto-monitored, not yet triggered)

Per Constitution §10.3 (Watch List, May 2026):

| #   | Watch item                                               | Trigger condition (Class A)                                                                   |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | Mettl AI-augmented content authoring at production scale | Public release notes confirming AI-augmented authoring shipped → Class A #3 (strategic pivot) |
| 2   | HackerRank content-supplier partnership signal           | Any named partnership with a content-supply firm → Class A #3                                 |
| 3   | Glider AI moving to direct customer overlap              | Glider closing >5 enterprise deals in QOrium ICP territory in a quarter → Class A #3          |
| 4   | Adaface anti-leak rotation below 24h                     | Adaface published SLA goes from 24h → 12h or better → Class A #3 + threatens our SO-22 wedge  |
| 5   | Karat-multi-product consolidation status                 | Headcount changes >25% OR customer-count public disclosure showing consolidation → Class A #3 |

These are watch items, not triggers — they fire only when a Class A threshold is met. The quarterly Bali competitive scan checks each.

---

## SO-25 SLA

The Constitution doesn't specify a hard SLA on the re-validation cycle. This doc defines one operationally:

- **Detection → log entry:** 24 hours
- **Log entry → MANTHAN cycle start:** 48 hours
- **Cycle start → outcome filed:** 14 days (most common case; full classification + blueprint + IdeaForge cycle takes ~2 weeks)
- **Outcome filed → CEO ratification:** 7 days

If the CTO can't meet these SLAs (capacity, complexity, etc.), the constitutional response is to escalate to CEO for either: (a) extending the SLA explicitly with documented reason, or (b) deferring lower-priority work to make room.

**Anti-pattern:** silently letting the SLA slip. SO-3 (Quality Gate Discipline) requires explicit handling.

---

## What happens if SO-25 is violated

A missed re-validation is a Constitutional violation. Consequences:

- **First violation:** logged in `cto/tech-debt.md` with severity Critical; CTO writes an explanatory note for the next monthly business review
- **Second violation in same year:** CEO escalates to a re-evaluation of CTO Office capacity (per Constitution §2.3 — CEO has authority to re-allocate hats)
- **Pattern of violations:** Constitutional Amendment proposed to either tighten SO-25 SLAs or formally relax them; the rule cannot remain ignored without amendment

This rigor is intentional. SO-25 was the cornerstone of v2.0's competitive-watch overhaul.

---

## What's NOT here

- ❌ Pre-detection monitoring tooling (Crunchbase / Tracxn / G2 alerts) — those are nice-to-have for Y2; Y1 detection is via Bali manual scan + CTO news monitoring
- ❌ Automated re-validation triggering (e.g., webhooks from Crunchbase) — Y2 work
- ❌ Re-validation-cycle calendar tooling — Y1 is human cadence; quarterly Bali scan + Mon weekly forecast surface anything material

---

_Cross-references: Constitution SO-25 (the mandate), §10.3 (Competitive Watch protocol), §2.7 (relationship classification — codified state). Companion: `competitive_research_log.md` (canonical scratchpad), `bali/templates/quarterly-competitive-scan.md` (Bali scan procedure), `manthan/research-classification-protocol.md` + `manthan/blueprint-template.md` + `manthan/ideaforge-rubric.md` (the cycle MANTHAN runs when triggered)._
