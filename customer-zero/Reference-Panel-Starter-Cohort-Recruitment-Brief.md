# Reference Panel Starter Cohort Recruitment Brief

**For:** Talpro India HR + Talpro Delivery Head + (later) I/O Psychologist contractor
**Hosted by:** CTO Office (autonomous agent — operations)
**Filed:** 2026-05-09
**Refs:** `governance/CEO-Decision-Packet-2026-05-08.md` §2, `customer-zero/Reference-Panel-Governance-v0.md`, Constitution v2.1 SO-21

---

## Why this brief exists

QOrium needs **30 paid panelists** to start IRT calibration of the 1,300+ AI-drafted questions. Per the CEO Decision Packet §2 recommendation (Option B: starter cohort + parallel I/O Psych contractor sign), we ship the platform with a "v0.1 calibration in progress" honesty label rather than waiting 3 months for the full Reference Panel ramp.

This brief is the recruitment ad + workflow for the starter cohort. **Total cost: ₹60K** for honoraria; **CEO time: ~1 hour** to authorise + brief HR.

---

## Who we want (starter cohort criteria)

### Hard requirements (all must be true)

- 3+ years professional engineering experience
- Comfortable with at least ONE of: Java, Python, React, SQL, DevOps/SRE, Salesforce Apex, AWS, AI Prompt Engineering
- India-based (timezone alignment + DPDPA compliance simpler)
- Can commit to one 90-min session in next 4 weeks; willing to take 2-3 follow-up sessions over 6 months
- English fluency for assessment items (we have hi/ta/te stubs but English is the calibration baseline)
- Signs informed consent + the Reference Panel Governance terms

### Soft preferences (we'll oversample on these)

- 50% from Talpro India internal engineering bench (free recruitment, trusted talent, matches our customer profile)
- 50% from external network (Coding Ninjas alumni, IIT/NIT alumni, niche tech Slack communities, ex-Mettl candidate database if any)
- Demographic spread: target 40% women / 60% men (vs Indian engineering's ~25/75); 3 cities minimum (Bangalore + Pune + Hyderabad as floor)
- Seniority spread: 60% mid-level (3-7 yrs), 30% senior (7-12 yrs), 10% staff+ (12+ yrs) — calibration math benefits from bell curve

### Disqualifiers

- Has worked on QOrium / contributed to question authoring (would inflate scores artificially)
- Talpro recruiter or sales personnel (their judgments contaminate, and they're our SoT for "real recruiter")
- Currently a customer's candidate (conflict)

---

## Honorarium structure

| Tier | Per session | Notes |
|---|---|---|
| Starter cohort (this brief) | **₹2,000 / 90-min session** | Capped at 30 panelists × 1 session = ₹60K |
| Reference Panel formal (post I/O Psych onboard) | **₹3,000 / 90-min session** | Capped at 250 panelists × 3 sessions/yr; ₹22.5L Year-1 ceiling |

Payment: UPI or bank transfer within 7 days of session completion.

---

## What panelists actually do

Each session:
1. Logs into QOrium platform (using their pre-issued panel-token, not real recruiter credentials)
2. Takes a 10-15 question pack from ONE Wave-1 sub-skill of their choice
3. Their responses + timing are stored as `is_reference_panel = TRUE` rows in `content.responses`
4. (Optional) 5-min post-survey: "Was any question unclear? Hostile? Trick-question-like?"

Their data feeds the IRT calibration job (`packages/irt`), which estimates true `difficulty_b` and `discrimination_a` per question. After ~20 panelists per sub-skill, AI-drafted parameter estimates are replaced with empirical ones; SO-21 quality gate then enforces real per-question pass-rate guardrails.

---

## What panelists DO NOT do

- They do NOT see the questions before signing the consent
- They do NOT get told their score (no feedback; that would change behavior in subsequent sessions)
- They do NOT use the platform as customers / candidates (they're labelers, not users)
- They do NOT discuss specific questions outside the panel (anti-leak terms in consent)

---

## Recruitment ad copy (HR can use as-is or adapt)

> ### 🎯 Paid 90-min: Help calibrate a new tech-hiring assessment platform (₹2,000 honorarium)
>
> **Who:** Senior software engineers (3+ years) comfortable in Java, Python, React, SQL, DevOps, Salesforce, AWS, or AI prompt engineering.
>
> **What:** Take a 10-15 question technical assessment on QOrium (a new India-built tech-hiring platform). Your responses will be used to calibrate question difficulty for fairness across thousands of future candidates.
>
> **Format:** 90-minute session, fully remote, your own time within the next 4 weeks. We send you a take-link; you take the assessment; you fill a 5-min post-survey.
>
> **Compensation:** ₹2,000 via UPI within 7 days. Optional: 2-3 follow-up sessions over 6 months at ₹3,000 each (you can decline).
>
> **Consent:** You'll review and sign a 1-page consent before starting (DPDPA-compliant; data scoped to calibration only; you can withdraw at any time).
>
> **Anti-conflict:** You should NOT be a current QOrium candidate, employee, or content-author.
>
> **Apply:** Email **panel@qorium.online** with: name, current role + company, primary tech stack, city. We send 30 invites in order of fit; the rest go on a waitlist for the formal Reference Panel ramp (₹3K/session).

---

## Workflow (CEO-authorised steps)

### Step 1 — CEO authorises spend (5 min)
- Email Talpro India CFO (or finance person): "Approve ₹60K starter-cohort honoraria budget for QOrium Reference Panel; per-panelist max ₹2,000; max 30 panelists; bookable as Talpro India OpEx until QOrium revenue starts"
- Confirmation: written email or Talpro-India internal accounting reference

### Step 2 — HR posts the ad (1 day)
- Internal Talpro India bench: post on internal Slack / "tech bench" group
- External: LinkedIn post (Talpro India page); 3-4 Coding Ninjas / Scaler / IIT alumni Slack channels (if Manthan or Bhaskar has reach)
- Inbox: `panel@qorium.online` (alias to Bhaskar's existing mailbox until SES production-access lands)

### Step 3 — CTO Office triages applications (1 hour, daily for 5 days)
- Agent reads inbox; ranks by hard requirements + soft preferences
- Outputs a CSV: name, email, fit-score (0-1), invite Y/N, demographic-bucket
- Sends top 30 a take-link via email (post-SES-production-access; until then: WhatsApp the link)

### Step 4 — Panelists take their session (their own time, 4-week window)
- Token is single-use, scoped to one sub-skill, expires in 14 days
- Platform records responses with `is_reference_panel = TRUE` flag
- Post-session survey collected via embedded form

### Step 5 — Pay honoraria (within 7 days)
- Talpro India finance pays ₹2,000 per completed session via UPI
- Agent generates receipt template each panelist signs (DPDPA + tax-compliance: panel income < ₹50K/year is below TDS threshold)

### Step 6 — Calibration job runs (auto, weekly)
- Once any sub-skill has ≥10 panelist responses on ≥5 distinct questions, the IRT calibration job (`packages/irt`) auto-runs
- Output: per-question `difficulty_b` and `discrimination_a` updates to `content.questions`
- SO-21 gate now enforces real per-question pass-rate guardrails

### Step 7 — Report monthly (CEO + future CDO)
- Agent emits monthly Reference Panel health report:
  - Active panelists by sub-skill + demographic
  - Calibration coverage % (questions with ≥10 responses / total released)
  - Per-question DIF (Differential Item Functioning) flags
  - Cumulative honoraria paid

---

## Risk + mitigations

| Risk | Mitigation |
|---|---|
| Low signup volume (< 30 in 4 weeks) | Talpro India internal pool guarantees 15-20; external network closes the gap. If still short, raise honorarium to ₹3K and re-post. |
| Calibration math degrades with N < 30 | Spec is "v0.1 calibration; refining" — honest comms posture; full 250-panelist ramp via Item §2 main path |
| Consent-form drift from DPDPA | Use the form already drafted in `customer-zero/Reference-Panel-Governance-v0.md`; CEO + Legal review before launch |
| Panelist accidentally posts questions to LinkedIn / Reddit | Anti-leak engine catches; consent terms enforce; track via watermark |
| Talpro bench panelists score artificially high (familiarity bias) | Tag `cohort=talpro_internal` in their data; calibration job can weight or exclude |
| Demographic skew | Track via `panel.metadata` per `Reference-Panel-Governance-v0.md`; recruit with targets |

---

## Success metric (60-day target)

- 30 panelists onboarded
- 30 sessions completed (1 per panelist minimum)
- ≥6 sub-skills with ≥10 calibrated questions each
- Calibration coverage: ≥40% of "released" questions
- Zero consent / DPDPA / honorarium-payment incidents

---

## What this brief is NOT

- NOT a path to the formal 250-panelist Reference Panel — that's still gated on I/O Psych contractor sign + ₹15L Year-1 budget per CEO Decision Packet §2
- NOT a marketing channel — panel members are paid contractors, not lead-gen
- NOT real-customer feedback — that comes from Customer-Zero (Item §4)
- NOT a substitute for SME Lead review — calibration measures item parameters; SME judges item quality

---

## CEO sign-off block

When ready to authorise:

```
APPROVED — Reference Panel Starter Cohort Recruitment Brief v1.

Spend authorised:        ₹60K (max 30 panelists × ₹2K)
Approved by:             Bhaskar Anand, CEO
Date:                    YYYY-MM-DD
HR contact:              <Talpro India HR person, cc'd>
Finance contact:         <Talpro India finance person, cc'd>
Inbox alias active:      panel@qorium.online → bhaskar@qorium.online (until SES production-access)
Recruitment ad live by:  YYYY-MM-DD (target: 7 days from approval)
First panelist target:   30 days from approval
Follow-up 250-panelist:  pending I/O Psych contractor sign (separate decision)
```

---

**End of brief v1.** Reviewer: CEO + Talpro India HR. Author: CTO Office (autonomous agent), 2026-05-09.
