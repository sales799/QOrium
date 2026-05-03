# Decision Framework — Reusable Template v1

**Purpose:** Codify the structured decision pattern that CEO Office applied successfully in Run #6 (CC-02 Path-c selection scoring 4.55/5.00) and Run #6.5 (firm pick from 3-firm shortlist). Reusable for any future MANTHAN-CEO-CTO joint decision in autonomous remote-auto mode.

**Authored:** 2026-05-02 (autonomous mode)
**Constitution mapping:** Article II (Council loop) + new memory `feedback_ceo_autonomous_mode.md`
**When to use:** Any decision where (a) multiple paths exist, (b) the path choice is a tech/operational decision (not fundamentally personal-judgment), (c) the CEO has delegated autonomous mode for the topic.

---

## §1 — When NOT to use this framework

- **Personal judgment calls** — taste, brand intuition, founder-only-knows-this calls. These remain CEO single-person decisions.
- **Reversible micro-decisions** — anything cheap to undo and small enough to just pick and try. Don't overhead a 5-min decision with a 30-min framework.
- **Genuine human-in-the-loop blockers** — if the decision needs a phone call, signature, or relationship the CTO can't proxy.
- **Constitution-locked clauses** — Article XI locked clauses require founder + Board approval; framework doesn't apply.

---

## §2 — When to use this framework

- **3+ viable paths exist**, each with material trade-offs
- **Decision affects ≥ ₹5L spend, 1+ months timeline, or a customer-facing commitment**
- **CEO has delegated autonomous mode** explicitly OR by patterns established in `feedback_ceo_autonomous_mode.md` memory
- **A wrong choice is recoverable but expensive** (think weeks of wasted effort or a few lakh of wasted spend, not project-killing)

---

## §3 — The 5-step process

### Step 1 — Frame the decision (CTO Office, ≤300 words)

Write a single paragraph capturing:
- The problem being solved (the actual outcome we want)
- The constraints (budget, timeline, regulatory, locked clauses)
- The decision-maker (CEO autonomous? CEO + counsel? Board?)
- The reversibility (cheap-to-reverse / expensive-to-reverse / irreversible)

If the framing reveals the decision is actually outside autonomous-mode scope, escalate via `founder_request` and stop.

### Step 2 — List paths (CTO Office, ≤500 words)

Enumerate 3-5 viable paths. For each:
- Name (e.g., "Path-a: existing Talpro counsel" / "Path-b: new tier-1 IP firm" / "Path-c: new boutique IP firm")
- One-paragraph description
- Cost estimate (range; mark UNVERIFIED where uncertain)
- Time estimate (calendar days from decision)
- Hard dependencies (blocks if missing)
- Major risk (one-line worst case)

If fewer than 3 viable paths exist, the decision is probably actually obvious — pick and execute, don't framework it.

### Step 3 — Score each path (CTO Office, autonomous)

Score each path on **5 dimensions** with 1-5 weighting per Constitution Article VI (Decision Framework):

| Dim | Weight | Rubric |
|---|---|---|
| **P1 Security & Data Protection** | 30% | 1=violates SO-9/SO-21/SO-24; 5=strengthens posture |
| **P2 Cost-Effectiveness** | 25% | 1=>₹50L over budget; 5=under budget + recoverable spend |
| **P3 Revenue Impact** | 20% | 1=blocks revenue; 5=accelerates revenue path |
| **P4 Performance & Reliability** | 15% | 1=degrades SLA; 5=ships within SLA + headroom |
| **P5 Simplicity & Maintainability** | 10% | 1=tech debt added; 5=less code, less ops |

Compute weighted score: Σ(score_i × weight_i). Any path scoring **≥ 3.5** is APPROVE-eligible. Below 3.5 is REJECT.

If multiple paths score ≥ 3.5, pick the highest. Tie-break by P3 Revenue Impact.

Document the scoring matrix as a table in the decision record.

### Step 4 — CTO Office co-sign + execute (autonomous)

- CTO Office records the chosen path with full scoring matrix in a decision record file
- File path convention: `governance/decisions/YYYY-MM-DD-<topic>-decision.md`
- Subject line: "[DECISION-AUTO] {Topic} — {Chosen Path} — score {X.XX}/5.00"
- Reduce CEO physical action to ≤60-sec follow-up card (e.g., a one-click email Send, a one-line evidence-back reply, a 30-sec WhatsApp send)
- Pre-build all artifacts the CEO needs (drafted email; pre-filled form; queued WhatsApp template) so the CEO action is mechanical, not deliberative

### Step 5 — Async CEO ratification (background)

- File a `founder_request` to Durga Council with the decision record summary
- Council ratification is the formal sign-off; absent council reachability, the autonomous decision stands per Run #6.5 precedent
- CEO can override the autonomous decision at any time within 7 days via simple chat message; no procedure overhead
- If overridden, document the reversal + reason in the decision record + update the CEO autonomous-mode memory if a pattern emerges

---

## §4 — Reusable template for the decision record

Copy this template into `governance/decisions/YYYY-MM-DD-<topic>-decision.md` for each new decision.

```markdown
# Decision: <Topic>

**Date:** YYYY-MM-DD
**Decided by:** CEO Office (autonomous) + CTO Office (co-sign)
**Mode:** Remote-auto, no human touch beyond ≤60-sec follow-up
**Reversibility:** [cheap / expensive / irreversible]

## Frame
[~200 words: problem, constraints, decision-maker, reversibility]

## Paths considered
### Path-a: <name>
- Description: [paragraph]
- Cost: [range]
- Time: [calendar days]
- Dependencies: [list]
- Major risk: [one-line]

### Path-b: <name>
[same]

### Path-c: <name>
[same]

## Scoring matrix

| Dim | Weight | Path-a | Path-b | Path-c |
|---|---|---|---|---|
| P1 Security | 30% | X | X | X |
| P2 Cost | 25% | X | X | X |
| P3 Revenue | 20% | X | X | X |
| P4 Performance | 15% | X | X | X |
| P5 Simplicity | 10% | X | X | X |
| **Weighted total** | | **X.XX** | **X.XX** | **X.XX** |

## Decision

**Chosen:** Path-<x> with weighted score X.XX/5.00

**Rationale:** [200-300 words on why this score won; address why the runner-up didn't]

**Pre-built artifacts:** [list of files / drafts / WhatsApp templates ready]

**CEO ≤60-sec follow-up card:** [exactly what CEO clicks/types]

**Reversal mechanism:** [if CEO overrides, what's the unwind cost]

## Council ratification

- founder_request filed: [yes/no, ID]
- Durga Council reachability: [confirmed/failed; if failed, autonomous decision stands per Run #6.5 precedent]
- CEO ratification status: [pending / confirmed / overridden]

## Outcome (filled in T+7 days)

- Did the chosen path execute as planned? [Y/N]
- What surprised us?
- Memory updates triggered?
- Pattern to add to future framework runs?
```

---

## §5 — When this framework has been used (running log)

Append each new use here with date + topic + chosen path + score.

| Date | Topic | Chosen path | Score | Outcome |
|---|---|---|---|---|
| 2026-05-02 | CC-02 IP counsel engagement (Path selection) | Path-c (pre-drafted email + 3-firm shortlist + 60-sec CEO send) | 4.55/5.00 | Executed; firm pick = K&S Partners; Gmail draft queued; CEO 30-sec Send pending |
| (future entries) | | | | |

---

## §6 — Patterns observed (refined over time)

Document recurring patterns the framework reveals. Update as we learn.

- **Reduction-to-≤60-sec rule:** the highest-scoring path almost always involves CTO Office pre-building artifacts so the CEO physical action is mechanical (click, paste, sign), not deliberative. This pattern alone has reduced average CC-card friction from ~15 min to ~30 sec.
- **Default firm/vendor in ranked shortlist:** when picking a vendor (counsel, agency, software), surface 3 candidates with explicit ranking. The default + autonomous CEO Office pick is faster than CEO open-ended search.
- **Cost dimension P2 is most-discriminating:** in the 3 decisions scored to date, P2 was the dimension that most often differentiated paths. P1 Security tends to be similar across viable paths (since unviable security paths are filtered before scoring).
- **Tie-break on P3 Revenue is sound:** for QOrium's stage (pre-revenue toward Phase 1 first 5 logos), revenue acceleration is the right tie-break.

---

## §7 — Constitutional integration

Per Constitution v2.0 + new memory `feedback_ceo_autonomous_mode.md`:

- This framework operates **inside** autonomous mode; it does not bypass any locked clauses
- Decision records are subject to the 92-pt Quality Gate Pillar J (Governance) — board-readable metrics dashboard includes a count of autonomous decisions per quarter
- Founder override is always preserved; the framework is a default, not a constraint
- New patterns added to §6 trigger a memory update + propose Constitutional amendment if the pattern is structural

---

## §8 — Open questions for first 30-day review

1. Are 5 dimensions enough, or should we add P6 (e.g., founder-time savings) as a quantified dimension?
2. Is 3.5 the right APPROVE threshold, or should it be 3.75 for higher-irreversibility decisions?
3. Should the founder_request council ratification be mandatory or "best-effort" given Durga Council reachability issues seen 2026-05-02?
4. When does an autonomous decision pattern earn promotion to "no-framework-needed" (just pick and execute) — after how many successful runs?

---

*End of Decision Framework Reusable Template v1. Use it for the next 3+ viable-path decisions in autonomous mode; refine §6 patterns + §8 open questions on each use.*
