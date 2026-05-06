# Win/Loss Debrief Template — Fri Weekly

**Cadence:** Every Friday afternoon · **Authority:** Constitution §675 · **Owner:** Bali · **Audience:** Bali (CEO + CTO read async)

---

## Why this exists

Per Constitution §675, Friday weekly is the **win/loss debrief** for sales process improvements. Wins get studied for replication; losses get studied for prevention. The debrief feeds:

1. Updates to outreach scripts (`bali/outreach/*.md`) when patterns emerge.
2. Updates to objection handling (Bali Playbook §8) when new objections surface.
3. Updates to pricing benchmarks (Bali Playbook §11 conversion table) when stage-friction shifts.
4. Append-only entries to `competitive_research_log.md` if competitive material moves were observed in lost deals.

**Discipline:** every closed-won AND every closed-lost is debriefed. No "lost-and-untracked." Disposition reasons (per `pipeline-tracker.md`) are required.

---

## Template

Copy below into `bali/debriefs/YYYY-MM-DD-fri-debrief.md` each Friday OR drop in CRM weekly notes (see Storage at end).

---

```markdown
# Win/Loss Debrief — {{week_ending_date}} (Friday)

## 1. Wins this week

(For each closed-won deal — even subscription auto-renews count as wins.)

### Win #1 — {{Account name}}

- **Motion:** Platform API · Enterprise Stack-Vault · Recruiter Subscription
- **Tier / ACV:** {{tier or amount}}
- **Cycle length:** Lead-to-close days = {{N}}
- **What worked:**
  - {{Specific tactic — e.g., warm intro via Talpro Network shaved 30 days off cycle}}
  - {{Customer Zero reference call closed the security objection}}
- **Pricing:** within-band / discount-applied (if discount, % and CEO approval ref)
- **Champion:** {{Name + role}} — what made them advocate?
- **Next-action:** onboarding call scheduled · case-study consent asked (per SO-12)?
- **Replication signal:** is this win pattern repeatable across other accounts in pipeline?

(Repeat per win.)

---

## 2. Losses this week

(For each closed-lost deal — required disposition reason.)

### Loss #1 — {{Account name}}

- **Motion:** Platform API · Enterprise Stack-Vault · Recruiter Subscription
- **Stage at loss:** Stage {{N}} ({{stage name}})
- **Disposition reason** (one only — pick from list):
  - lost-to-competitor → which one? (cross-ref Constitution §2.7 classification)
  - pricing-too-high → which tier? Did we offer multi-year / phased delivery?
  - not-budgeted → realistic to re-open at next budget cycle? When?
  - no-decision → was decision-maker engaged? Did we identify the right one?
  - wrong-fit → outside ICP per Bali Playbook §4? Recategorize the lead source.
  - referred-to-Talpro → did Talpro India hire from this prospect's stack? Cross-revenue logged?
- **What we'd do differently:**
  - {{Specific learning — e.g., "Should have offered 3-year terms earlier when pricing pushback surfaced"}}
- **Competitive intel:** if lost-to-competitor, what did they offer that we didn't? Log in `competitive_research_log.md` if material per SO-25.
- **Re-engage trigger:** is there a future condition that re-opens the door? (e.g., "Re-engage at next FY budget cycle, or if their current vendor has a public leak incident.")

(Repeat per loss.)

---

## 3. Common stage friction this week

(Look across the whole pipeline — not just deals that moved this week. Where are deals slowing down?)

| Stage transition                             | Friction observed                      | Suggested process change                                       | Owner                   |
| -------------------------------------------- | -------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| {{e.g., Discovery complete → Proposal sent}} | {{e.g., scoping memos taking >7 days}} | {{e.g., template-ize the scoping memo into 4 reusable blocks}} | {{e.g., Bali this Mon}} |
|                                              |                                        |                                                                |                         |

---

## 4. Competitive observations

(Anything new heard in the field this week. If material per the SO-25 thresholds, log a new finding entry in `competitive_research_log.md`.)

- {{e.g., "Two prospects mentioned Glider AI under-cutting our published pricing on Tier-2 deals — verify in Q3 quarterly scan."}}
- {{e.g., "Adaface released anti-leak SLA dashboard publicly — visible at adaface.com/security; doesn't break our daily-vs-24h wedge but worth quarterly re-check."}}

**Logged to `competitive_research_log.md` this week:** {{Yes — entry #NNN}} / {{No — sub-threshold}}

---

## 5. Sales-process improvements (proposed)

(Concrete changes to operational artifacts. Each improvement gets an owner + a deadline.)

| Improvement                                                                                                | Owner           | Target        | Status                                                  |
| ---------------------------------------------------------------------------------------------------------- | --------------- | ------------- | ------------------------------------------------------- |
| {{e.g., Update `bali/outreach/enterprise-stack-vault.md` objection O5 with the multi-year-pricing escape}} | Bali            | Mon next week | proposed                                                |
| {{e.g., Add "scoping memo template" link to outreach scripts}}                                             | Bali            | Wed next week | proposed                                                |
| {{e.g., Increase trial pack from 50 → 100 questions for Pro-tier prospects}}                               | AI Agent + Bali | M3            | proposed (needs CEO approval if affects unit economics) |

---

## 6. Reference customer cultivation (SO-12 check)

(Per SO-12: ask before quoting, offer 15-min calls, pay 5-10% renewal discount for 3 active references in Year 1.)

- Customer Zero (Talpro India) reference calls offered this week: {{N}}
- Customer Zero reference calls completed this week: {{N}}
- Other reference customers cultivated: {{names}}
- Reference-customer renewal discounts applied this week: {{names + %}}

---

## 7. Read-aheads for Mon weekly forecast

- {{Top 3 deals to push hard next week}}
- {{Risks to highlight in Mon forecast §6}}
- {{Asks for CEO/CTO}}
```

---

## Storage

Same two patterns as `weekly-forecast.md`:

**Pattern A (in-repo):** `bali/debriefs/YYYY-MM-DD-fri-debrief.md` — committed if repo private.
**Pattern B (CRM-only):** debriefs in CRM weekly notes — recommended Y2+ when team grows.

Y1 default: Pattern A while team < 3.

---

## Cadence note

The debrief runs **Friday afternoon (~4pm IST)**. Wins/losses logged earlier in the week are referenced; this is the synthesis — what did we learn, what changes Monday's plan?

If no wins or losses occurred this week, the debrief STILL runs — sections 3, 4, 5 capture pipeline-wide friction and competitive intel. Skipping a Friday debrief is a Constitutional violation per §675.

---

_Cross-references: Constitution §675 (Friday weekly cadence), Bali Playbook §10 (Operating Cadence) and §8 (Objection handling — updated through this debrief), `bali/templates/pipeline-tracker.md` (disposition reasons), `competitive_research_log.md` (material moves logged here)._
