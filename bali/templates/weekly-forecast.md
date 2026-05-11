# Weekly Forecast Template — Mon Pipeline Review

**Cadence:** Every Monday morning · **Authority:** Constitution §671 · **Owner:** Bali · **Audience:** CEO + CTO + Bali

---

## When to use

This is the canonical weekly pipeline review template. Per Constitution §671, every Monday morning Bali presents the forecast against this format. Variance commentary is mandatory — the review is for discussion, not just reporting.

---

## Template

Copy the below into a new file each week, named `bali/forecasts/YYYY-MM-DD-mon-forecast.md` (this file pattern is committed to repo or kept in a private CRM workspace — see "Storage" at end).

---

```markdown
# Weekly Forecast — {{week_start_date}} (Monday)

## 1. TL;DR (≤3 lines)

{{Two-to-three-line summary: are we on track for Q quarter target, what changed
this week, what's the one focal action for the week ahead.}}

---

## 2. Pipeline by motion

### Platform API motion

| Metric                            | This week | Last week | Δ     | Notes |
| --------------------------------- | --------- | --------- | ----- | ----- |
| Open opportunities                | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 1 (Lead)                    | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 2 (Contact made)            | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 3 (Discovery scheduled)     | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 4 (Discovery complete)      | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 5 (Proposal sent)           | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 6 (Verbal commit)           | {{N}}     | {{N}}     | {{Δ}} |       |
| Stage 7 (Closed-won this quarter) | {{N}}     | {{N}}     | {{Δ}} |       |
| Weighted pipeline value           | {{$/₹}}   | {{$/₹}}   | {{Δ}} |       |

**Commentary:**

- New adds this week: {{names + values}}
- Stage advances: {{names + from→to}}
- Closed-won: {{names + values}}
- Closed-lost: {{names + dispositions}}

### Enterprise Stack-Vault motion

| Metric                  | This week       | Last week | Δ     | Notes |
| ----------------------- | --------------- | --------- | ----- | ----- |
| Open opportunities      | {{N}}           | {{N}}     | {{Δ}} |       |
| Stage breakdown         | (same as above) |           |       |       |
| Weighted pipeline value | {{₹}}           | {{₹}}     | {{Δ}} |       |

**Commentary:** {{same structure}}

### Recruiter Subscription motion

| Metric                        | This week     | Last week     | Δ     | Notes |
| ----------------------------- | ------------- | ------------- | ----- | ----- |
| Inbound trial sign-ups        | {{N}}         | {{N}}         | {{Δ}} |       |
| Trial-to-paid conversions     | {{N}}         | {{N}}         | {{Δ}} |       |
| Active subscriptions (MRR)    | {{N}} ({{₹}}) | {{N}} ({{₹}}) | {{Δ}} |       |
| Tier mix (Lite / Pro / Scale) | {{counts}}    |               |       |       |
| AI Agent escalations to human | {{N}}         | {{N}}         | {{Δ}} |       |

**Commentary:**

- AI Agent performance: {{any drop-offs, any anomalies}}
- Notable escalations: {{names + reasons}}
- Churn flags: {{any login-frequency drops, any cancellation requests}}

---

## 3. Quarter-to-date trajectory

| Metric                     | QTD   | Quarterly target | % of target | Coverage ratio (weighted pipeline / remaining) |
| -------------------------- | ----- | ---------------- | ----------- | ---------------------------------------------- |
| Closed-won (Platform API)  | {{$}} | {{$}}            | {{%}}       | {{ratio}}                                      |
| Closed-won (Stack-Vault)   | {{₹}} | {{₹}}            | {{%}}       | {{ratio}}                                      |
| Closed-won (Recruiter MRR) | {{₹}} | {{₹}}            | {{%}}       | {{ratio}}                                      |
| **Total ARR closed QTD**   | {{₹}} | {{₹}}            | {{%}}       | {{ratio}}                                      |

**Coverage targets per Bali Playbook §11:**

- Q1: n/a (build phase)
- Q2: 3.0× target coverage
- Q3: 2.5×
- Q4: 2.0×

**On-track / At-risk / Off-track:** {{verdict}}

---

## 4. Stage hygiene audit

(Run before this review per pipeline-tracker.md)

- [ ] Stage 5 (Proposal) opportunities >30 days idle: {{count}} ← {{names}}
- [ ] Stage 6 (Verbal commit) opportunities >45 days idle: {{count}} ← {{names}} (CEO call required)
- [ ] Last-touch >14 days: {{count}} ← {{names}}
- [ ] Missing required CRM fields: {{count}} ← {{names}} (excluded from forecast above)

---

## 5. Top 3 deals to focus this week

1. **{{Account name}}** — {{stage}} → {{target stage by Friday}}. Action: {{specific action and owner}}.
2. **{{Account name}}** — {{stage}} → {{target stage by Friday}}. Action: {{specific action and owner}}.
3. **{{Account name}}** — {{stage}} → {{target stage by Friday}}. Action: {{specific action and owner}}.

---

## 6. Risks + asks

**Risks:**

- {{Specific risks to the quarter target — pricing pressure on a deal, competitive threat surfaced, procurement delay, etc.}}

**Asks for CEO/CTO:**

- {{Specific asks — pricing exception >10%, CEO call into a stalled deal, technical demo needed, security questionnaire support, etc.}}

---

## 7. Competitive intelligence

(Append-only updates to `competitive_research_log.md` if material — per SO-25)

- {{Anything new heard in the field about competitors. If material per the SO-25 thresholds, log a new finding entry in `competitive_research_log.md`.}}

---

## 8. Customer Zero refresh check

(SO-1 + SO-12)

- Talpro India weekly screen count: {{N}} (target: 50+)
- Talpro India reference calls offered this week: {{N}}
- Talpro India reference calls completed this week: {{N}}
- Customer Zero data on `qorium.online/customers` last refreshed: {{date}}
```

---

## How to use it

1. **Sunday evening or Monday 8am:** Bali pulls CRM data, fills the template, commits as `bali/forecasts/YYYY-MM-DD-mon-forecast.md` if using repo OR drops in CRM weekly notes if not.
2. **Monday standing review (30 min):** CEO + CTO + Bali walk through sections 1, 5, 6 line by line. Sections 2, 3, 4, 7, 8 are read-ahead.
3. **Asks (section 6):** decisions are taken in the meeting; no async deferrals on pricing or escalations.
4. **Top 3 deals (section 5):** these become Bali's focal commitments for the week. Wed outreach blitz aligns to these.
5. **Fri weekly debrief:** revisits the Top 3 — which advanced, which didn't, why.

---

## Storage

Two patterns acceptable:

**Pattern A (in-repo, transparent):**

- Forecasts live in `bali/forecasts/YYYY-MM-DD-mon-forecast.md`.
- Account names and dollar values in plaintext.
- Pros: full audit trail, version controlled, no CRM lock-in.
- Cons: requires repo discipline; sensitive deal info in source-controlled files.
- Recommended only if repo stays private (Constitution C1.2 reminder).

**Pattern B (CRM-only):**

- This template is the reference; weekly notes live in CRM (HubSpot/Pipedrive/SFDC weekly notes feature).
- Pros: less surface area, sales rep familiarity.
- Cons: no version control, harder to audit historical accuracy.

**Y1 default:** Pattern A while team is small + repo is private. Migrate to Pattern B when team grows beyond 3 (Y2+).

---

_Cross-references: Constitution §671 (Mon weekly cadence), Bali Playbook §10 (Operating Cadence), §11 (Pipeline & Forecasting). Pipeline tracker template: `bali/templates/pipeline-tracker.md`._
