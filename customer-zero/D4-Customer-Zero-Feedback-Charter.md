# D4 — Customer Zero Feedback Charter

**For:** QOrium CTO Office, CEO, Talpro India Delivery Head  
**Effective:** Month 1 (May 2026), upon Customer Zero launch  
**Authority:** Constitution SO-1 (Customer Zero Mandate), SO-21 (IRT Scoring), SO-24 (No-Fiction Rule)  
**Owner:** CTO Office — Customer Success Lead  

---

## §1 Purpose

Establish a structured, weekly feedback loop with Talpro India Delivery Head to validate signal quality, identify defects, and iterate the QOrium platform in real time. This charter ensures that Customer Zero's voice is heard at every level (ops → leadership), that defects are fixed at promised SLAs, and that insights flow back into product roadmap decisions.

---

## §2 Communication Channel & Cadence

### 2.1 Primary Channel

**Options (CEO confirms preference; default: Slack):**

1. **Slack** — Preferred. Dedicated channel: `#qorium-customer-zero` (private, invite-only)
   - Members: Talpro Delivery Head + team lead + 2–3 recruiters; QOrium CTO + CDO + Customer Success Lead
   - Uses threading for clarity; daily async updates OK; weekly structured summaries pinned

2. **WhatsApp Group** — Alternative if Talpro IT blocks Slack
   - Group name: "QOrium Customer Zero – Weekly Sync"
   - Same cadence as below

3. **Telegram** — If requested (less preferred for formal audit trail)

**Chosen channel:** _____ (CEO confirms before Day 1)

### 2.2 Cadence

| Frequency | Format | Owner | Time (IST) | Notes |
|---|---|---|---|---|
| **Daily** | Async observations | Talpro recruiters | Anytime | Post feedback, blockers, observations in #qorium-customer-zero thread |
| **Weekly (Friday)** | Structured summary | CTO Office | 5:00 PM | Metrics, defect log, SLA status, next-week forecast. Pinned to channel. |
| **Monthly (1st call)** | 30-min review call | CEO + CTO + Delivery Head | TBD (first Wed of month, 3–4 PM IST) | Discuss themes, roadmap input, escalations. Recording kept in governance/. |
| **Quarterly** | Full NPS + win/loss | CTO Office + CEO | M3/M6/M9/M12 | Survey, interviews, business impact analysis. Part of Phase Gate. |

---

## §3 Weekly Friday Summary Structure

Every Friday 5:00 PM IST, CTO Office posts a structured summary to `#qorium-customer-zero`:

```
📊 WEEK OF [DATE] — QORIUM CUSTOMER ZERO METRICS

✅ VOLUME
  Questions delivered: [X] new this week
  Total active in Talpro role-graphs: [Y]
  Candidate responses recorded: [Z] (this week) / [total YTD]
  
📈 QUALITY
  IRT calibration coverage: [%] of released items
  Candidate pass rate: [%] (goal: 40–60% for balanced difficulty)
  Feedback quality score: [1–5] (per feedback form completeness)
  
🎯 SLA STATUS
  P0 defects: [count] open / [count] resolved this week
  P1 defects: [count] open / [count] resolved
  P2 defects: [count] open / [count] resolved
  
⚠️ BLOCKERS (if any)
  - [Blocker name]: [status + ETA]
  
➡️  NEXT WEEK
  - [Planned deliverable 1]
  - [Planned deliverable 2]
  - Questions for Delivery Head: [if any]

---
CTO Office · QOrium Customer Zero Lead
[Link to full governance record]
```

**Attached:** Full metrics dashboard (Grafana export or .pdf snapshot) + defect log (markdown table).

---

## §4 Defect Handling SLA

All defects reported in the `#qorium-customer-zero` channel are triaged immediately by CTO Office. SLAs are **hard** (no waivers).

### 4.1 Severity Definitions

| Severity | Definition | Example | Target SLA |
|---|---|---|---|
| **P0** (Critical) | Assessment delivery broken; candidates unable to attempt questions | API down; database corruption; bulk import failed | **4 hours** to fix |
| **P1** (High) | Wrong answer, score discrepancy, or IRT data inconsistency | Q#42 marked wrong but answer is correct; score off by 10 points | **24 hours** to fix |
| **P2** (Medium) | UX friction, slow load time, UI bug that doesn't block assessment | Bulk export takes 5+ min; dropdown sluggish; export format inconsistent | **7 days** (next sprint) |
| **P3** (Low) | Cosmetic, typo, documentation | Button label inconsistent; typo in help text | **Next sprint** (14 days) |

### 4.2 Defect Template (for Talpro to use in channel)

```
🐛 DEFECT REPORT
  
**Title:** [one-liner]
**Role:** [senior-java / senior-react / etc.]
**Candidate ID (anonymized):** [candidate_uuid or "N/A"]
**Severity:** [P0/P1/P2/P3]

**Description:**
[What happened? What should have happened?]

**Steps to reproduce:**
1. [step]
2. [step]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happened]

**Screenshot/Log:**
[Attach if possible]

**Suggested fix:**
[If known]
```

### 4.3 SLA Tracking & Escalation

- **CTO Office acknowledges defect within 1 hour** (reaction time on Slack: ✅ emoji)
- **CTO Office posts status update every 6 hours** if fix is in progress
- **Defect resolved:** CTO Office posts fix confirmation + test evidence (commit hash / screenshot)
- **If SLA missed:** CTO Office + CEO call Delivery Head within 24 hours with remediation plan (e.g., workaround, accelerated timeline, compensation)

---

## §5 What QOrium Owes Talpro (Customer Zero Terms)

### 5.1 Access & Pricing

- **Free ReadyBank access** for 12 calendar months (May 2026 – April 2027)
  - Unlimited question reads, searches, exports for internal-namespace hiring
  - No overage fees; no seat limits
  - Renewal: At Month 12, negotiate paid plan (typically 50% discount vs. external list price per Constitution SO-11)

### 5.2 Content Delivery

- **Wave 1 IRT-calibrated question packs** — Per-role, starting Month 2
  - Talpro's top 5 roles (Java, React, SQL, DevOps, Salesforce) each receive 50 fresh, vetted questions per month
  - Difficulty Rasch indices provided; time-on-task benchmarks included
  - Delivered via secure download (1Password or encrypted email)
  - Cumulative by end of Month 3: 750 fresh questions (150 per role)

- **Wave 2 expansion** (starting Month 4)
  - SAP, Salesforce, and emerging-role content (if Talpro requests)
  - Prioritized over external customer requests during Phase 1

### 5.3 Support & Communication

- **Slack SLA:** 1-business-day response to non-urgent questions; 4-hour response to blockers
- **Weekly Friday summary:** Automatic, structured metrics recap (see §3)
- **Monthly review call:** 30-minute session with CEO + CTO (not optional; scheduled)
- **Quarterly business review:** Full NPS + feedback synthesis + roadmap input from Delivery Head is incorporated into next Phase Gate planning

### 5.4 Visibility & Partnership

- **Early feature access:** Wave 2 (SAP, Salesforce, advanced anti-leak) debuts first for Talpro before external customers
- **Logo/case-study consent:** If results are positive at M3 gate, Talpro's logo appears on QOrium marketing (website, deck, case study) with Talpro's written permission for each use. No candidate data is shared; metrics are anonymized ("Leading IT staffing firm reduced false-positive hires by X% using QOrium" — no names, no numbers from Talpro's hire volume).
- **Future paid SKU discount:** If Customer Zero transitions to paid (Month 13+), Talpro receives **50% discount off list price for first 12 months** post-paid (e.g., if Stack-Vault Enterprise is ₹40L/year, Talpro pays ₹20L/year for first year; then negotiates Year 2+ pricing)

---

## §6 What Talpro Owes QOrium (Customer Zero Commitment)

### 6.1 Usage Commitment

- **3-month minimum use:** Talpro commits to use QOrium output (questions, scores, feedback) as the primary assessment tool for the 5 agreed roles from Month 1 through Month 3. No switching back to Mettl/HackerRank mid-way.
- **100+ candidates by Month 3:** At least 100 candidates screened through QOrium assessment by end of Q2 2026 (3 months in). Talpro's hiring volume drives this naturally.

### 6.2 Feedback Quality

- **Honest feedback:** Both positive and negative observations welcome. Anonymized defect reports mandatory for any issue blocking hiring.
- **Weekly async reporting:** Talpro recruiters post observations daily/weekly to #qorium-customer-zero (no minimum message count; quality over volume).
- **Structured feedback response form:** Talpro HR/Delivery Head completes a short form monthly (2 minutes):
  - Signal quality assessment (1–5 scale)
  - Any friction points for recruiters
  - Any friction points for candidates
  - Suggested improvements

### 6.3 Data Sharing & Visibility

- **Candidate flow visibility:** Talpro provides anonymized data on candidate progression (how many screen, how many pass/fail, how many move to technical interview, how many get offers). Used for IRT calibration + Phase Gate reporting.
- **No PII leakage:** Talpro ensures QOrium never sees candidate names, contact info, or hire/no-hire decisions except the assessment score and response data.

### 6.4 Case Study / Logo Use

- **Consent model:** If M3 Phase Gate passes (≥20/24 score), Talpro's CEO/Delivery Head signs a one-page "Case Study Consent" allowing QOrium to use:
  - Talpro logo (with attribution)
  - Anonymized metrics ("Leading IT staffing firm, 500+ annual hires")
  - Testimonial quote (if offered): e.g., "QOrium improved our signal quality by reducing false positives — our hiring managers are more confident faster."
- **No candidate data:** GDPR/DPDPA compliant; no candidate names, emails, or individual scores shared publicly.
- **Logo withdrawal:** Talpro may request logo removal anytime with 30-day notice.

---

## §7 Escalation Protocol

**Any blocker > 24 hours blocks Talpro hiring → escalate immediately.**

**Escalation path:**

1. **CTO Office identifies blocker** (e.g., P0 defect not fixed in 4 hours, or missing content for role)
2. **CTO Office posts in #qorium-customer-zero:** "🚨 Escalating to CEO + Delivery Head — 24-hour SLA at risk"
3. **CTO calls or Slack-DMs CEO:** "We have a blocker. Delivery Head needs this by [time]. What's the solution?"
4. **CEO + Delivery Head schedule 30-min call within 24 hours** to discuss:
   - Root cause
   - Remediation options (workaround, accelerated fix, temporary alternative)
   - New ETA
5. **Call outcomes documented** in governance/customer-zero/escalations/[date].md
6. **If SLA still missed:** Talpro receives one-time compensation (e.g., 3 months free extension of ReadyBank access) — CEO + CTO joint approval

---

## §8 Constitutional Grounding

This charter is enforceable per:

- **SO-1:** Talpro Customer Zero mandate. QOrium exists to serve Talpro India as proof of product-market fit.
- **SO-21:** IRT scoring is mandatory from Day 1. All Talpro-facing deliverables include Rasch indices + difficulty metadata.
- **SO-24:** No-Fiction Rule. Every weekly metric is backed by a live API call or database query in this session (no estimates, no "we think").

---

## §9 Slack Channel Charter

When `#qorium-customer-zero` is created, the CTO Office pins this template as the first message:

```
📌 PINNED: #qorium-customer-zero CHARTER

This channel is the home of QOrium's Customer Zero partnership with Talpro India.

MEMBERS:
  QOrium: CTO (@cto) · CDO (@cdo) · Customer Success Lead (@cs-lead)
  Talpro: Delivery Head (@delivery-head) · Hiring Managers (2–3) · Recruiters (2–3)

CADENCE:
  📅 Daily: Async observations from Talpro team
  🔔 Friday 5 PM IST: CTO posts weekly metrics summary
  📞 Monthly 1st Wednesday: 30-min review call (recording in Google Drive)
  📊 Quarterly: NPS + business impact review

DEFECT REPORTING:
  Post in-thread with the Defect Report template (pinned message #2)
  P0 = 4-hour SLA | P1 = 24-hour SLA | P2 = 7-day SLA | P3 = next sprint

COMMUNICATION NORMS:
  ✅ Thread replies (reduce notification spam)
  ✅ Async OK; no pings outside business hours
  ❌ No PII, candidate names, or hire/no-hire decisions
  ❌ No external sharing (confidential partnership)

QUESTIONS?
  Reply here or mention @cto-office. We check daily.
```

---

## §10 Drafting Notes (For CTO Office)

1. **Slack channel setup:** 
   - Create `#qorium-customer-zero` (private)
   - Invite list: CEO, CTO, CDO, CS Lead (QOrium) + Delivery Head + team (Talpro)
   - Pinned messages: This charter + Defect Report template + Weekly Friday example

2. **Monthly call scheduling:**
   - First Wednesday of every month, 3–4 PM IST (flexible if needed)
   - Google Calendar invite sent to all 6 attendees
   - Recording via Otter.ai or Granola (shared in governance/)

3. **Governance folder structure:**
   ```
   /governance/customer-zero/
     /monthly-reviews/
       2026-05-XX-m1-review.md
       2026-06-XX-m2-review.md
     /escalations/
       2026-05-XX-blocker-api-downtime.md
     /feedback-log/
       2026-05-XX-weekly.md (raw feedback + FYI notes)
     charter.md
     contact-list.md
   ```

4. **Talpro IT clearance:**
   - Before Day 1, confirm Talpro IT has approved:
     - Slack #qorium-customer-zero channel access
     - QOrium API endpoint IP (allow-list)
     - TLS certificate pinning (optional but recommended)
   - Save approval email in governance/customer-zero/talpro-it-clearance.txt

5. **Q&A doc for Talpro recruiters:**
   - CTO Office drafts a 2-page "Getting Started with QOrium" guide for recruiters (before Day 1)
   - Covers: API key access · how to search questions · how to request feedback · what IRT indices mean
   - Share via 1Password link before first assessment

6. **Slack vs Teams vs Telegram decision:**
   - CEO confirms preferred channel by Day 1
   - If Slack: CTO Office sets up immediately
   - If WhatsApp: Group created; same cadence, slightly less formal audit trail
   - If Telegram: OK but less enterprise-friendly

---

## §11 Monthly Feedback Response Form Template

CTO Office emails this form to Delivery Head on the 1st of every month (template in governance/):

```
CUSTOMER ZERO MONTHLY FEEDBACK FORM
Talpro India Feedback Cycle [MONTH]

Please complete by [DATE + 3 days] and reply to this email.

Q1. Signal Quality Assessment (1 = poor, 5 = excellent)
    "How well did QOrium's questions predict technical interview performance?"
    Your rating: ☐1 ☐2 ☐3 ☐4 ☐5
    Comment: [___________]

Q2. Candidate Experience (1 = frustrated, 5 = smooth)
    "How was the candidate experience (UX, clarity, fairness)?"
    Your rating: ☐1 ☐2 ☐3 ☐4 ☐5
    Comment: [___________]

Q3. Recruiter Experience (1 = cumbersome, 5 = frictionless)
    "How easy was it for your recruiting team to use QOrium?"
    Your rating: ☐1 ☐2 ☐3 ☐4 ☐5
    Comment: [___________]

Q4. Content Freshness (1 = stale, 5 = fresh)
    "Do the questions feel new compared to Mettl/HackerRank?"
    Your rating: ☐1 ☐2 ☐3 ☐4 ☐5
    Comment: [___________]

Q5. Top Improvement (open-ended)
    "What ONE thing would most improve QOrium for your team?"
    [___________]

Q6. Suggested new roles for Wave 2 (if any)
    [___________]

Optional: Specific praise or criticism you'd like shared with the CEO
[___________]

Thank you for your partnership. — QOrium CTO Office
```

---

*End of D4 — Customer Zero Feedback Charter.*
