# MANTHAN — Research Classification Protocol

**Authority:** Constitution §2.1 (MANTHAN charter) + Article VI (Decision Framework) + SO-24 (recursive no-fiction rule)
**Owner:** CTO Office (Y1 MANTHAN operator)

---

## Purpose

When an open question reaches MANTHAN, the first deliverable is always a **research classification** — a structured analysis that frames the question, lists the alternatives, scores them against the 5 weighted priorities of the Decision Framework, and recommends a path.

Classifications are NOT decisions. They feed the blueprint stage (separate doc); the blueprint feeds CEO acceptance.

---

## When to run

A research classification is required when:

- The open question affects pricing, ICP, positioning, SKU sequencing, or any decision >₹3L cost (Constitution Article VI threshold).
- A material competitor move triggers SO-25 re-validation of prior positioning.
- CEO or CTO surfaces a question and explicitly asks MANTHAN to weigh it.

---

## When NOT to run

Skip MANTHAN classification when:

- The decision is tactical (within-band pricing, customer-specific contract terms within Bali's authority per §2.7).
- The decision is routine engineering (within ADR scope, not strategic).
- The decision is reserved to CEO per §2.2 (capital, hiring, partnerships) — CEO may consume MANTHAN inputs but doesn't require one to act.

---

## Classification template

Every research classification follows this structure. Save to `manthan/classifications/YYYY-MM-DD-<short-title>.md`.

```markdown
# Research Classification — <one-line title>

**Date:** YYYY-MM-DD
**Trigger:** <what surfaced this question — CEO ask, CTO ask, SO-25, quarterly scan>
**Operator:** CTO Office (Y1)
**Status:** Draft | Reviewed | Accepted (handed to blueprint) | Rejected (no action)

---

## 1. The question

<One sentence. Clear, falsifiable, scoped. Bad: "Should we change pricing?".
Good: "Should we lower the Stack-Vault floor from ₹35L to ₹30L for Year 1
to accelerate first 3 logos?">

## 2. Why now

<What surfaced this question NOW vs 6 months ago. Trigger source — competitor
move, customer feedback pattern, capital constraint, etc. Cite the trigger
explicitly.>

## 3. Constraints (constitutional)

<Which Standing Orders bind this question. Which Article articles. Any
clauses that pre-determine parts of the answer. Examples:

- SO-11: "Stack-Vault Enterprise tier never sells below ₹35L without CEO approval"
  → narrows the question to "should we change the SO" rather than "should we
  discount this specific deal"
- §1.1 locked USP: positioning answers must preserve verbatim USP
- §2.7 outreach discipline: ICP framing must respect the codified classification>

## 4. Frames considered

<Three to five distinct frames for thinking about the question. Each frame
is a lens, not a recommendation. Example frames for "should we lower
Stack-Vault floor":

- Frame A: "Pricing as a wedge" — keep floor high, build moat through scarcity
- Frame B: "Pricing as growth" — lower floor to accelerate logo count
- Frame C: "Pricing as discrimination" — segment the floor by ICP class
- Frame D: "Pricing as Y2 opt" — keep floor Y1, plan adjustment Y2 if needed>

## 5. Scoring matrix (Decision Framework — Constitution Article VI)

For each frame, score against the 5 weighted priorities (1-5 scale; weight per priority).
Weights are constitutional (not changed per question):

| Priority              | Weight   | Frame A    | Frame B    | Frame C    | Frame D    |
| --------------------- | -------- | ---------- | ---------- | ---------- | ---------- |
| Customer Zero proof   | 0.25     | <1-5>      | ...        | ...        | ...        |
| Strategic moat        | 0.25     | <1-5>      | ...        | ...        | ...        |
| Capital efficiency    | 0.20     | <1-5>      | ...        | ...        | ...        |
| Founder fit           | 0.15     | <1-5>      | ...        | ...        | ...        |
| Distribution leverage | 0.15     | <1-5>      | ...        | ...        | ...        |
| **Weighted total**    | **1.00** | **<calc>** | **<calc>** | **<calc>** | **<calc>** |

**Threshold:** weighted score ≥3.5 = APPROVE. Below = REJECT or escalate to CEO per Article VI.

## 6. Sources cited (SO-24 audit trail)

<Every numerical claim, every market-state assertion, every customer-pattern
observation must source to a specific document. Failures of grounding are
SO-24 violations and disqualify the classification.

Example sources:

- Bali Sales Playbook §6.1 (current ₹40L Stack-Vault anchor)
- competitive_research_log.md #003 (no material moves Q2 2026)
- Investor Brief §3.1 (revenue model trajectory)
- 06-IdeaForge Gate Report (TBD — referenced but not yet in repo)>

## 7. Recommendation

<The frame with the highest weighted score is the default recommendation.
But MANTHAN may recommend a non-highest-score frame if a constitutional
constraint forces it (e.g., a frame scores 3.8 but violates SO-11 floor →
recommend frame B at 3.6 instead).

State the recommendation in one sentence. Then list the 2-3 conditions
that, if met, would cause MANTHAN to reverse the recommendation in a
future cycle.>

## 8. Handoff target

- IdeaForge gate scoring (Office 4): yes / no — if yes, generate `manthan/handoffs/YYYY-MM-DD-ideaforge-<title>.md`
- CTO architecture work: yes / no — if yes, generate `manthan/handoffs/YYYY-MM-DD-cto-<title>.md`
- Bali sales execution: yes / no — if yes, generate `manthan/handoffs/YYYY-MM-DD-testforge-<title>.md`
- CEO direct decision: yes / no — if yes, send classification + blueprint directly to CEO; no handoff doc

## 9. Re-validation triggers (per SO-25)

<List the conditions that would require this classification to be re-run.
Examples:

- Stack-Vault floor question would re-run if: any competitor changes published
  enterprise pricing >20% · WeCP/Byteboard-equivalent acquisition of a
  Strong Partnership Candidate · Customer Zero (Talpro) hiring drive count
  drops below 30 screens/week
- These triggers feed into the quarterly competitive scan.>

## 10. Status log

| Date       | Status        | Notes                                |
| ---------- | ------------- | ------------------------------------ |
| YYYY-MM-DD | Draft         | Initial classification by CTO Office |
| YYYY-MM-DD | Reviewed      | CEO read; comments incorporated      |
| YYYY-MM-DD | Accepted      | Handed to blueprint stage            |
| YYYY-MM-DD | (or) Rejected | No action; reasons logged            |
```

---

## Anti-patterns (don't do these)

- ❌ **Inventing market data.** SO-24. If you don't have a source, the analysis is incomplete; flag the gap and stop, don't invent.
- ❌ **Pre-committing to a frame.** MANTHAN classifications consider 3-5 frames genuinely; if the operator already knows the answer, the classification is theater.
- ❌ **Recommending a frame that violates a Standing Order.** SOs are immutable except via Constitutional Amendment (Article XI). MANTHAN can recommend AMENDING an SO, but cannot recommend ignoring one.
- ❌ **Mixing classification and blueprint in one doc.** Classification = scored options. Blueprint = recommended path with execution detail. Two docs, two stages.
- ❌ **Skipping the re-validation triggers section.** SO-25 says material moves auto-trigger re-runs; without explicit triggers documented, re-validation never fires.

---

## Worked example (skeleton — for orientation only)

Question: "Should we extend the $5K-25K Platform API band upward to $5K-50K to capture larger Tier 1 customers in Y2?"

Trigger: Glider AI raised their published enterprise pricing 30% (hypothetical; would be entry #NNN in `competitive_research_log.md` if real).

Constraints: SO-23 anchors the band at $5K-25K. Changing it requires Constitutional Amendment per Article XI.

Frames considered:

- A: Hold the band ($5K-25K) and rely on Stack-Vault for Tier 1 ACV
- B: Extend to $5K-50K via Constitutional Amendment to SO-23
- C: Introduce a "Platform API Plus" tier at $25K-50K alongside the existing band
- D: Defer the question to Y2+ when actual Tier 1 deals close

(Each frame scores against the 5 priorities. Numbers depend on grounded research.)

Recommendation: TBD — depends on the actual scoring. The point of the example is the **structure**, not the answer.

---

_Cross-references: Constitution §2.1 (MANTHAN), Article VI (Decision Framework), SO-3 (Quality Gate), SO-24 (no-fiction rule), SO-25 (re-validation triggers). `governance/Decision-Framework-Reusable-Template-v1.md` (current canonical template), `governance/Quality-Gate-92pt-Scorecard.md` (scoring authority)._
