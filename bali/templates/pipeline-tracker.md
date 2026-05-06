# Pipeline Tracker — 7-Stage Template

**Owner:** Bali · **Source-of-truth:** CRM (this file is the schema, not the data) · **Authority:** Constitution SO-1 §"CRM is the source of truth for pipeline. No spreadsheet shadow-pipelines."

---

## Why this template exists

CRM is the binding pipeline source per SO-1. This template defines:

1. The **7-stage canonical pipeline** every motion uses (Platform API · Enterprise Stack-Vault · Recruiter Subscription).
2. The **conversion benchmarks** by stage and motion (per Bali Playbook §11).
3. The **weighted forecast multipliers** for the Mon weekly review.
4. The **fields** that must be present on every CRM opportunity (to enable accurate forecast).

When a CRM is bootstrapped (Y1 likely Pipedrive or HubSpot Free for cost discipline), configure stages and required fields per this template.

---

## The 7 stages

| #   | Stage                   | Definition                                                 | Weighted % (forecast) | Owner action to advance                                                  |
| --- | ----------------------- | ---------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| 1   | **Lead**                | Outreach sent OR inbound form submission classified as fit | 5%                    | Get a reply or scheduled call                                            |
| 2   | **Contact made**        | Reply received OR call scheduled                           | 15%                   | Run discovery                                                            |
| 3   | **Discovery scheduled** | Discovery call on calendar                                 | 30%                   | Run discovery, qualify fit                                               |
| 4   | **Discovery complete**  | Call done, fit confirmed, scope hypothesis drafted         | 50%                   | Send scoping memo (Stack-Vault) or pilot proposal (Platform / Recruiter) |
| 5   | **Pilot/Proposal sent** | Scoping memo or pilot proposal in prospect's hands         | 65%                   | Get pilot or signed proposal back                                        |
| 6   | **Verbal commit**       | Decision-maker has verbally committed; legal in flight     | 85%                   | Get signature                                                            |
| 7   | **Closed-won**          | Contract signed, kickoff call scheduled                    | 100%                  | Onboarding (handoff to Customer Success)                                 |

**Closed-lost** is its own terminal state with **disposition reason** required (lost-to-competitor / pricing-too-high / not-budgeted / no-decision / wrong-fit / referred-to-Talpro). No "lost-and-untracked" — every closed-lost feeds the Fri weekly win/loss debrief.

---

## Conversion benchmarks (per Bali Playbook §11)

| Stage transition                         | Platform API target | Enterprise Stack-Vault target | Recruiter Subscription target |
| ---------------------------------------- | ------------------- | ----------------------------- | ----------------------------- |
| Lead → Contact made                      | 25%                 | 35% (warm intros)             | 8% (AI Agent outbound)        |
| Contact made → Discovery scheduled       | 60%                 | 70%                           | 30% (trial form submission)   |
| Discovery scheduled → Discovery complete | 80%                 | 85%                           | 60% (trial activation)        |
| Discovery complete → Proposal sent       | 75%                 | 80%                           | n/a (auto self-serve)         |
| Proposal sent → Verbal commit            | 35%                 | 45%                           | 25% (trial-to-paid)           |
| Verbal commit → Closed-won               | 80%                 | 75%                           | 95% (subscription auto-renew) |
| **Lead → Closed-won (cumulative)**       | **~6%**             | **~10%**                      | **~3%**                       |

These are **targets** for Y1 — actuals refresh quarterly into Bali Playbook §11. Below-target conversion at any stage triggers a process review at the Fri weekly debrief.

---

## Required CRM fields per opportunity

Configure these as required fields on the CRM opportunity object. Missing any of them = opportunity excluded from forecast.

### Identity

- Account name (linked to account record)
- Primary contact name + role + email
- Motion: Platform API · Enterprise Stack-Vault · Recruiter Subscription
- ICP segment (per Bali Playbook §4)
- Source: Outbound · Inbound (web form) · Talpro Network · Conference · Referral · AI Agent

### Stage + value

- Pipeline stage (1–7 from above)
- Stage-entered date
- Expected close date
- Forecast value (annual contract value in INR or USD)
- Probability % (auto-set by stage, override allowed with justification note)

### Discipline

- **Pricing band check:** confirmed within published band (yes/no). If "no," CEO approval reference required.
- **Customer Zero reference offered:** yes/no/not-applicable (SO-12).
- **Competitive threat:** named competitor present in deal? (drop-down from Constitution §2.7 classification)
- **Stack-Vault exclusivity boundary:** if Stack-Vault, named scope written down (SO-10).

### Activity

- Last touch date
- Next scheduled action + date
- Touches-this-week count

---

## Forecast formulas

**Weighted pipeline forecast:**

```
Weighted forecast = Σ (opportunity_value × stage_probability_%)
```

Run weekly into the Mon forecast template. Variance vs prior week ≥10% triggers commentary.

**Coverage ratio:**

```
Coverage = (Weighted forecast for the quarter) / (Quarterly target)
```

Y1 quarterly target derived from Bali Playbook §14:

| Quarter     | Y1 ARR target        | Coverage ratio target |
| ----------- | -------------------- | --------------------- |
| Q1 (M1-3)   | ₹0 (build)           | n/a                   |
| Q2 (M4-6)   | ₹50L                 | 3.0×                  |
| Q3 (M7-9)   | ₹1.5 Cr              | 2.5×                  |
| Q4 (M10-12) | ₹3.5 Cr (cumulative) | 2.0×                  |

**Why coverage ratio drops:** later in the year, deals in the pipeline are closer to close, so less raw pipeline is needed to hit the same target.

---

## Stage-progression hygiene

Every Friday the Bali office runs this audit before the weekly debrief:

- [ ] Any opportunity in stage 5 (Proposal) for >30 days without movement → flag for either advance, push to next quarter, or close-lost.
- [ ] Any opportunity in stage 6 (Verbal commit) for >45 days → escalate to CEO for direct call with decision-maker.
- [ ] Any opportunity with last-touch >14 days → re-engage or close-lost with disposition reason.
- [ ] Any opportunity missing required CRM fields → block from forecast inclusion.

---

## Reporting cadence

| When       | Output                                      | Audience               |
| ---------- | ------------------------------------------- | ---------------------- |
| Mon weekly | Forecast + variance commentary              | CEO + CTO + Bali       |
| Wed weekly | Outreach blitz adds (new leads to stage 1)  | Bali                   |
| Fri weekly | Win/loss debrief + stage-hygiene audit      | Bali                   |
| Monthly    | Cohort metrics (closed-won by motion + ICP) | CEO + CTO + Bali + COM |
| Quarterly  | Coverage ratio + Y1 trajectory              | CEO + Board prep       |

---

_Cross-references: Bali Playbook §11 (Pipeline & Forecasting Discipline), §14 (Y1 Targets). Constitution SO-1 (CRM source of truth), SO-10 (Stack-Vault exclusivity), SO-11 (pricing anchors)._
