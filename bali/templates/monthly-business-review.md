# Monthly Business Review Template

**Cadence:** First Monday of each month · **Authority:** Constitution §671 row "Monthly" · **Owner:** Bali (presenter) + COM (data) · **Audience:** CEO + CTO + Bali + COM (Content Ops Manager)

---

## Why this exists

The Mon weekly forecast (`weekly-forecast.md`) is tactical — what's in the next 5 working days. The monthly business review is **strategic** — what trajectory are we actually on, where is the cohort going, what would change Q+1 plans?

Per Constitution §671, monthly cadence is "cohort metrics" reviewed by CEO + CTO + Bali + COM. This template defines the canonical structure.

---

## Template

Copy below into `bali/reviews/YYYY-MM-monthly-review.md` first Monday of each month.

---

```markdown
# Monthly Business Review — {{month}} {{YYYY}}

**Reviewing:** {{previous_month_name}} {{YYYY}}
**Presented:** {{first_Monday_of_current_month}}
**Attendees:** CEO · CTO · Bali · COM

---

## 1. Headline (≤4 lines)

{{Where we are vs the M21 trajectory ($1M ARR per Investor Brief §3.1).
The one most important shift this month.
The one risk that matters for next month.
Recommended decision out of this review.}}

---

## 2. ARR + logos by motion

| Motion                 | Logos opened (cumulative) | Logos new this month | ARR closed-won (cumulative) | ARR new this month | Y1 target              | % to target |
| ---------------------- | ------------------------- | -------------------- | --------------------------- | ------------------ | ---------------------- | ----------- |
| Platform API           | {{N}}                     | {{N}}                | $ {{X}}                     | $ {{X}}            | 3 logos / $240K        | {{%}}       |
| Enterprise Stack-Vault | {{N}}                     | {{N}}                | ₹ {{X}}                     | ₹ {{X}}            | 5 logos / ₹3.5 Cr      | {{%}}       |
| Recruiter Subscription | {{N}}                     | {{N}}                | ₹ {{X}} (MRR × 12)          | ₹ {{X}}            | 30 logos / ₹1.5 Cr     | {{%}}       |
| **Total**              | {{N}}                     | {{N}}                | **₹ {{X}}**                 | **₹ {{X}}**        | **66 logos / ₹3.5 Cr** | **{{%}}**   |

**Y1 trajectory verdict:** on-track / at-risk / off-track · {{one-line rationale}}

(Targets sourced from Bali Playbook §14.)

---

## 3. Cohort retention + expansion signals

(For Recruiter motion mainly; Platform + Stack-Vault renewals don't surface till Y2.)

| Cohort            | Logos at start of month | Active end of month | Churned this month | Expanded tier this month |
| ----------------- | ----------------------- | ------------------- | ------------------ | ------------------------ |
| Recruiter — Lite  | {{N}}                   | {{N}}               | {{N}}              | {{N → Pro count}}        |
| Recruiter — Pro   | {{N}}                   | {{N}}               | {{N}}              | {{N → Scale count}}      |
| Recruiter — Scale | {{N}}                   | {{N}}               | {{N}}              | n/a                      |

**Net retention this month:** {{%}} (target: ≥110% Y1, ≥125% Y2)
**Churn signal flags:** {{names + reasons}}

---

## 4. Top 5 wins of the month

1. **{{Account}}** ({{motion}} · {{ACV}}) — what made it close · is it a replicable pattern?
2. **{{Account}}** ({{motion}} · {{ACV}}) —
3. **{{Account}}** ({{motion}} · {{ACV}}) —
4. **{{Account}}** ({{motion}} · {{ACV}}) —
5. **{{Account}}** ({{motion}} · {{ACV}}) —

**Common thread across wins:** {{e.g., "All 5 came through the Talpro Network — confirms SO-1 distribution moat thesis"}}

---

## 5. Top 5 losses of the month

1. **{{Account}}** ({{motion}} · disposition: {{reason}}) — recoverable? When?
2. **{{Account}}** ({{motion}} · disposition: {{reason}}) —
3. **{{Account}}** ({{motion}} · disposition: {{reason}}) —
4. **{{Account}}** ({{motion}} · disposition: {{reason}}) —
5. **{{Account}}** ({{motion}} · disposition: {{reason}}) —

**Common thread across losses:** {{e.g., "3 of 5 lost on SOC 2 Type II — pattern matches CTO Architecture roadmap M21 timing; consider scoping security-attestation rider for enterprise contracts"}}

---

## 6. AI Agent (Recruiter motion) performance — SO-18 check

(The AI Agent owns Recruiter outreach per SO-18. Is it hitting unit economics?)

| Metric                                  | This month | Last month | Δ     | Y1 target                |
| --------------------------------------- | ---------- | ---------- | ----- | ------------------------ |
| Outbound touches sent                   | {{N}}      | {{N}}      | {{Δ}} | 1500/mo                  |
| Inbound conversion (form → trial)       | {{%}}      | {{%}}      | {{Δ}} | ≥8%                      |
| Trial-to-paid conversion                | {{%}}      | {{%}}      | {{Δ}} | ≥25%                     |
| Tier mix at-conversion (Lite/Pro/Scale) | {{counts}} |            |       | 60/30/10                 |
| Escalations to human                    | {{N}}      | {{N}}      | {{Δ}} | ≤5% of trial conversions |
| Anti-spam guardrail violations          | {{N}}      | {{N}}      | {{Δ}} | 0                        |

**AI Agent verdict:** healthy / drift / breakdown · {{rationale}}

If "drift" or "breakdown," propose remediation in §9 (Asks).

---

## 7. Customer Zero (Talpro India) refresh — SO-1 check

(SO-1 is non-negotiable: Talpro India dogfoods QOrium internal hiring drives. The numbers below land on `qorium.online/customers` Customer Zero detail section + Bali Playbook §7.)

| Metric                                 | This month  | Last month  | Δ     |
| -------------------------------------- | ----------- | ----------- | ----- |
| Weekly screen count (avg)              | {{N}}+/week | {{N}}+/week | {{Δ}} |
| Reference calls offered to prospects   | {{N}}       | {{N}}       | {{Δ}} |
| Reference calls completed              | {{N}}       | {{N}}       | {{Δ}} |
| Reference-call → won deal correlation  | {{%}}       | {{%}}       | {{Δ}} |
| Talpro internal NPS for QOrium dogfood | {{score}}   | {{score}}   | {{Δ}} |

**Action:** is `qorium.online/customers` Customer Zero detail section refreshed with this month's numbers? **Yes / No** — owner: COM by next Mon weekly.

---

## 8. Risks for next month

(What's the top-3 risk the team is carrying into next month?)

1. {{Risk + impact + mitigation}}
2. {{Risk + impact + mitigation}}
3. {{Risk + impact + mitigation}}

(Cross-reference Constitution §806-813 for the master risk register.)

---

## 9. Asks for CEO + CTO

(Decisions taken in this meeting; no async deferrals.)

- [ ] {{e.g., "Approve pricing exception for {{Account}} at -12% (>10% threshold per SO-11)"}}
- [ ] {{e.g., "Greenlight extending AI Agent capacity from 50 → 75 outbound prospects/day"}}
- [ ] {{e.g., "CTO call into stalled BFSI procurement at {{Account}}"}}
- [ ] {{e.g., "Approve marquee logo target update from Bosch GCC → BFSI major X based on momentum"}}
- [ ] {{e.g., "Authorize MANTHAN re-validation on $5K-25K pricing band given new Glider AI pricing data — per SO-25 trigger"}}

---

## 10. Next-month commitments

(What does Bali commit to? What will be true at the next monthly review?)

1. {{Commitment with measurable end-state}}
2. {{Commitment with measurable end-state}}
3. {{Commitment with measurable end-state}}
```

---

## How to use it

1. **Last Friday of the month:** Bali drafts §1, §2, §3, §4, §5, §10. COM fills §6, §7. CEO + CTO read async over the weekend.
2. **First Monday of the month (60 min):** review meeting walks through §1, §8, §9 line-by-line. §2-7 are read-ahead.
3. **Asks (§9):** decisions taken in the meeting; no async. Pricing exceptions, AI Agent capacity changes, MANTHAN triggers — all decided here.
4. **Commitments (§10):** become Bali's monthly commit. They appear in next month's §2-5 measured outcomes.

---

## Cadence interaction with other reviews

- **Mon weekly forecast (`weekly-forecast.md`):** tactical, next 5 days. References this monthly's commitments (§10) as the macro context.
- **Fri weekly debrief (`win-loss-debrief.md`):** tactical, last 5 days. Feeds patterns into this monthly's §4-5.
- **Quarterly competitive scan (`quarterly-competitive-scan.md`):** strategic, every 3 months. Feeds §6 AI Agent + §8 Risks if material.

---

_Cross-references: Constitution §671 (monthly cadence) and §806-813 (risk register), Bali Playbook §11 (Pipeline + Forecasting Discipline), §14 (Y1 Targets), `bali/templates/weekly-forecast.md`, `bali/templates/win-loss-debrief.md`, `bali/templates/quarterly-competitive-scan.md`, Standing Orders SO-1, SO-11, SO-12, SO-18, SO-25._
