# QOrium Customer Success Playbook
**Version 1.0** | **Status: Draft** | **Author:** CTO Office | **Date:** May 2, 2026

---

## Purpose

The Customer Success Playbook defines the post-sale lifecycle for all three QOrium SKUs (ReadyBank API, JD-Forge, Stack-Vault). Its goal is to reduce churn, drive expansion revenue, and ensure all customers achieve measurable outcomes within contracted SLAs. Success is measured per SKU with tailored metrics, cadence, and escalation playbooks.

---

## 1. Lifecycle Stages by SKU

### 1.1 ReadyBank API (Platforms & Recruiters)

| Stage | Duration | Key Activities | Success Criteria |
|---|---|---|---|
| **Activation** | Day 0–7 | Kickoff call, integration support (n8n template + Postman collection + sample SDKs), first 3–5 successful API calls, Slack channel setup | Customer completes auth, makes first call, confirms latency acceptable |
| **Adoption** | Week 2–4 | Weekly check-in, question preview, training on filtering/search, role-graph navigation | Customer running 5+ daily API calls; 50+ questions explored |
| **Optimization** | Month 2–3 | Performance metrics review, caching strategies, bulk-export setup, analytics dashboard walkthrough | API usage at 50%+ of committed quota; customer reports signal quality feedback |
| **Expansion** | Month 4+ | Upsell conversation (higher tier or multi-SKU), feature requests collected | Customer conversation about upgrade tier or adding JD-Forge / Stack-Vault |

### 1.2 JD-Forge (Enterprises & Staffing Firms)

| Stage | Duration | Key Activities | Success Criteria |
|---|---|---|---|
| **Order Received** | Day 0–1 | Invoice, welcome email, Zapier/n8n integration guide (if automation requested) | Customer has access credentials, understands per-JD pricing |
| **Output Delivered** | Day 1–4 (Standard) / 1–7 (Reviewed) | 20-question pack generated, export in customer's preferred format, training doc sent | Customer receives pack, verifies format, confirms spec accuracy |
| **Feedback Captured** | Week 1–2 | NPS survey (on pack quality), question relevance survey, feedback loop for AI retraining | Customer rates pack quality ≥7/10, provides 1 usable feedback item |
| **Expansion to Higher Tier** | Week 3–8 | Identify use cases for Reviewed/Enterprise tier, demo Express SME benefits, pricing discussion | Customer conversation about subscription or tier upgrade |

### 1.3 Stack-Vault (GCCs & Large Enterprises)

| Stage | Duration | Key Activities | Success Criteria |
|---|---|---|---|
| **Onboarding** | Month 0–1 | 90-day discovery kick-off, role-graph mapping, stack documentation, SME kickoff | Scope document signed, role taxonomy agreed, delivery timeline confirmed |
| **First Sample-Pack Delivery** | Month 1–2 | Initial 200-question batch delivered, customer integration complete, feedback loop established | Customer loads 200 questions into assessment platform, runs pilot candidates |
| **Multi-Stack Expansion** | Month 3–6 | Additional roles onboarded (50–100 questions/month refresh), customer shows adoption metrics | Customer running assessments across 3+ role families; refresh cadence active |
| **Renewal** | Month 11–12 | Contract renewal negotiation, scope/pricing review, annual architecture refresh discussion (if applicable) | Renewal signed or expansion agreed; no churn decision |

---

## 2. Activation Playbook (per SKU)

### 2.1 ReadyBank API Activation (Days 0–7)

**Day 0:**
- Kickoff call (30 min) — CTO Office + customer technical lead. Cover: API architecture, auth, rate limits, sample request walk-through.
- Slack channel created (`#qorium-<customer-name>`) for async support.
- Send: Postman collection (pre-populated auth), Node.js SDK starter, curl cheat sheet.

**Day 1–3:**
- Customer integration engineer follows Postman collection to make first 3 test calls.
- CTO Office monitors API logs; responds to 401/429 errors in real-time.
- Customer reports latency; CTO confirms p95 < 200ms for single-question fetch.

**Day 4–7:**
- Customer runs 5+ successful production calls with real data.
- CTO sends role-graph navigation guide; customer confirms they can filter by skill/difficulty.
- Success gate: Customer confirms "we can integrate this into our platform within 2 weeks."

### 2.2 Stack-Vault Activation (Month 0–1)

**Week 0:**
- Kickoff call (2 hours) — CEO + CTO + customer's hiring leadership + tech TA leader.
- Discovery questionnaire: current tech stack, hiring volume per role, pain points with existing assessments, integration preferences.
- Scope of work document drafted (roles, library size, refresh cadence, watermarking).

**Week 1–2:**
- Detailed role-graph mapping: customer's roles × skills × seniority levels organized into a custom taxonomy.
- First 50–100 questions authored based on initial scope.
- Customer IT clearance for QOrium API endpoint access + watermark secret generation.

**Week 3–4:**
- First 200-question batch delivered to customer's private namespace.
- Customer loads questions into existing assessment platform (Mettl, HackerRank, etc.).
- Success gate: Customer runs first pilot assessment; 5+ candidates complete; customer confirms questions align with their tech stack.

---

## 3. Health-Score Model (Weighted 100pt)

Computed monthly per customer. Scores < 40 trigger churn-save playbook.

| Component | Weight | Measurement | Scoring |
|---|---|---|---|
| **API Usage Trajectory** | 30pt | Daily-active API calls vs committed contract quota | 30 = 80%+ quota utilization; 15 = 40–80%; 5 = <40% |
| **Outcome Signal** | 25pt | Assessment completions → hires (ReadyBank/JD-Forge); candidate quality feedback (Stack-Vault) | 25 = customer reporting hires from assessments; 15 = neutral signal; 5 = negative signal / declining usage |
| **Feedback Signal** | 15pt | NPS (target ≥8/10), support tickets logged, feature requests | 15 = NPS ≥8, <1 P1 ticket/month; 10 = NPS 6–7; 5 = NPS <6 or 2+ P1 tickets |
| **Renewal Signal** | 15pt | Exec engagement (quarterly call kept?), multi-stakeholder adoption (2+ teams using) | 15 = exec sponsor engaged, 3+ teams active; 10 = 1–2 teams; 5 = single user, no exec engagement |
| **Expansion Signal** | 15pt | Conversations about additional roles (ReadyBank), higher tiers (JD-Forge), or cross-SKU | 15 = documented upsell conversation; 8 = informal interest; 0 = no signal |

**Scoring Rules:**
- 40–59 = **At-Risk** → Churn-save playbook triggered.
- 60–79 = **Stable** → Maintain cadence, quarterly business review.
- 80+ = **Growth** → Expansion playbook active.

---

## 4. Check-In Cadence

| Timing | Owner | Type | Duration | Attendees |
|---|---|---|---|---|
| **Week 1** | CTO Office | Sync | 15 min | CSM, customer tech lead |
| **Week 4** | CTO Office | Sync | 30 min | CSM, customer + manager |
| **Week 8** | CSM | Async/Sync | 30 min | Expand to procurement if applicable |
| **Monthly** | CSM | Async | N/A | Metrics report sent (email) |
| **Quarterly** | CEO / CTO | Sync | 60 min | Customer exec sponsor, technical lead, CSM |

---

## 5. Quarterly Business Review (QBR) Template

**Timing:** Month 3, 6, 9, 12 (or per contract cadence).

**Agenda (60 min):**

1. **Usage Metrics Review (15 min)**
   - API call volume (last 3 months) vs. contracted quota.
   - Question library growth (ReadyBank) or pack generation volume (JD-Forge).
   - Active users / teams per customer.
   - SLA performance: latency, uptime, error rate.

2. **Outcome Review (20 min)**
   - ReadyBank API: how many candidates assessed? Hiring conversion? Quality feedback?
   - JD-Forge: how many JD-packs generated? Cost savings vs. in-house authoring?
   - Stack-Vault: how many assessments run? Multi-role adoption progress?
   - NPS + customer satisfaction trends.

3. **Roadmap + Feature Input (15 min)**
   - Q: "What features would unlock 2x value for your team?"
   - Q: "Any integrations needed (Lever, Greenhouse, Workday)?"
   - Q: "Pricing changes acceptable, or should we discuss adjustments?"

4. **Renewal / Expansion Conversation (10 min)**
   - If approaching 6-month mark: renewal intent (churn risk assessment).
   - Upsell opportunity if Health Score suggests capacity: additional SKU, higher tier.

5. **Mutual Action Items (0 min)**
   - Document and assign owners; next sync date.

---

## 6. Churn Early-Warning Signals

Trigger escalation immediately if **any** of these occur:

| Signal | Definition | CSM Action |
|---|---|---|
| **API Usage Drop >30% WoW** | Daily-active calls fall >30% week-over-week for 2+ weeks | Call customer within 24h; ask about blockers |
| **NPS Drops Below 7** | Customer scores <7 in monthly pulse survey or QBR NPS | Immediate follow-up; root-cause discovery |
| **No Exec Engagement 60+ Days** | Exec sponsor hasn't joined a call in 60+ days | CEO calls sponsor directly; understand org politics |
| **Repeated P1 Tickets** | 2+ critical bugs in 30 days (e.g., API down, data corruption) | CTO Office prioritizes fix; SLA compensation if needed |
| **Procurement/Finance Stakeholder Change** | New finance contact or procurement review initiated | Proactive check-in; clarify contract terms; head off budget cut |

---

## 7. Churn-Save Playbook (30-Day Rapid Response)

**Triggered when:** Health Score drops below 40 OR any early-warning signal fires.

### Timeline

**Day 0–2:**
- CSM + CTO Office review account history: why did usage drop?
- CSM calls customer (tech lead + manager); ask: "What's not working?"
- Document root causes: technical issue? Wrong feature expectation? Budget cut? Competitor?

**Day 3–7:**
- CTO Office proposes recovery plan (tailored to root cause):
  - *Technical issue:* Expedite fix + offer temporary SLA waiver.
  - *Wrong expectation:* Reframe product positioning; identify actual use case fit.
  - *Budget cut:* Offer 1 free month or temporary tier downgrade to preserve relationship.
  - *Competitor threat:* Comparison demo; highlight moat (e.g., anti-leak rotation for ReadyBank).

**Day 8–30:**
- Weekly touch-base (CSM or CTO) until Health Score improves above 60.
- If churn still imminent after 30 days: escalate to CEO for executive retention call.
- Document outcome: saved, churned, or downgraded.

---

## 8. Expansion Playbook

### 3 Expansion Paths

#### Path 1: Additional Roles (within SKU 1 or 3)

**Example:** Customer is using ReadyBank for "Backend Engineers." They want coverage for "QA Automation."

- Identify unmet role coverage: CSM asks, "What other roles are you hiring for?"
- Scope new role coverage: role-graph, expected question count, timeline.
- Pricing: either subscription tier bump or à-la-carte role add-on (negotiate).
- Implementation: 2–4 weeks to author + validate new questions.

#### Path 2: SKU Tier Upsell

**Example:** Recruiter using ReadyBank "Solo" (₹4,999/month). They're at 50% quota; want more.

- Recommend "Team" tier (₹14,999/month): 5x questions, widget delivery, cost-per-question improves.
- Demo widget delivery (embeddable in recruiter's own console).
- Pricing incentive: 10% discount if they commit annual (instead of monthly).

#### Path 3: Cross-SKU Sale

**Example:** Customer with ReadyBank (API) wants to experiment with JD-Forge.

- Propose pilot: 10 free JD-Forge packs (Standard tier, unreviewed) to test quality.
- If customer likes quality: offer bundle discount (ReadyBank + JD-Forge = 15% off combined).
- Or: suggest Stack-Vault if they have 10+ roles and volume > 1K assessments/quarter.

### Expansion Metrics

- Monthly: % of accounts with active conversations in ≥2 SKUs.
- Quarterly: # of successful tier upgrades, new role additions, cross-SKU adds.
- Target: 15% of existing customers expand within 6 months of launch.

---

## 9. Renewal Playbook (90 Days Out)

**Timing:** 90 days before contract end, CSM initiates renewal motion.

1. **Renewal Intent Email (90 days out):**
   - "Hi [customer], your QOrium contract renews [date]. Should we get on a call to discuss Q3 plans?"

2. **Pricing Discussion (75 days out):**
   - If tier usage increased: propose tier bump with slight discount (negotiate margin).
   - If usage flat: propose same tier, annual commitment (3% discount vs. monthly).
   - If churn risk: offer 10% discount to retain (CTO Office approval required).

3. **Scope Review (60 days out):**
   - QBR-lite: confirm deliverables still match customer's hiring needs.
   - Roadmap alignment: new formats or roles planned? Incorporate into renewal discussion.

4. **Contract Amendment + Signature (30 days out):**
   - Finalize terms, send amendment, get CFO + customer signature.
   - Confirm any new feature enablements or integrations launching in Q1.

5. **Renewal Closed (at contract renewal date):**
   - CSM documents: renewed at same tier, upgraded, downgraded, or churned.
   - If renewed at growth tier: add to expansion funnel for additional SKU outreach.

---

## 10. CS Team Scaling

### Hiring Plan

| Period | Headcount | Model | Notes |
|---|---|---|---|
| **M1–M6** | Solo CSM function (CTO Office doubles) | 1 CSM embedded in CTO Office | Talpro Customer Zero + first 5 logos. Async via Slack + monthly calls |
| **M6–M9** | 0.5 FTE dedicated CSM hire | Junior or mid-level CSM | ReadyBank + JD-Forge focus; Stack-Vault handled by CEO + CTO |
| **M9–M12** | 1 FTE dedicated CSM | Senior CSM (TA background preferred) | Owns ReadyBank expansion + JD-Forge health. Stack-Vault: shared with CTO |
| **Y2** | 1–2 FTE CSMs | CSM team | 1 CSM per ₹1.5Cr ARR (per SaaS standard). Platform + Enterprise sales have dedicated CSMs |

### CSM Compensation

- **Salary:** Market rate for CSM in Bengaluru (₹18L–₹24L/year depending on seniority).
- **Variable:** 10% bonus if team ARR growth >20% YoY; additional 5% if <5% churn rate.
- **Territory:** CSM1 owns Recruiters + Platforms; CSM2 owns Enterprise/GCC (hire M9+).

---

## 11. Drafting Notes & Assumptions

### Note 1: HubSpot Integration
CS team will use HubSpot (Talpro standard) to track:
- Customer health score (monthly update).
- Check-in cadence (tasks + reminders).
- NPS + feedback (integrated survey).
- Renewal dates + expansion opportunities (timeline + revenue impact).

**Action:** CTO Office to set up HubSpot workflows by Month 1.

### Note 2: QBR Cadence per SKU
- **ReadyBank API & JD-Forge:** Quarterly QBRs (Month 3, 6, 9, 12).
- **Stack-Vault:** Annual QBR (Month 12) + quarterly health check-ins (lighter agenda).

*Rationale:* Stack-Vault has longer sales cycle and lower churn risk; quarterly full QBRs may be overkill.

### Note 3: CS-Led Growth Metrics
To enable CS-driven expansion, track monthly:
- **Expansion Opportunity Pipeline:** # of customers with documented expansion conversations.
- **Expansion Closure Rate:** % of expansion conversations → closed deals.
- **Net Revenue Retention (NRR):** (End ARR + Expansion ARR - Churn ARR) / Start ARR. Target: 105%+ by end of Y2.

*Assumption:* CEO ratifies NRR target and sets compensation incentives accordingly.

---

**End of Customer Success Playbook v1.0**
