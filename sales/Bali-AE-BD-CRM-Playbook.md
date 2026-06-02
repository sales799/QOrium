# Bali Sales Playbook: AE Enterprise & BD Platforms CRM + Workflow

**Status:** Complete
**Version:** 1.0
**Last Updated:** May 2, 2026
**Owner:** CTO Office (Sales Operations)
**Audience:** AE Enterprise, BD Platforms Lead, CEO (governance), CRM Admin

---

## 1. Executive Summary

This playbook defines the operational framework for QOrium's two parallel GTM motions: Enterprise Stack-Vault (AE Enterprise role) and Platform API (BD Platforms role). Both use HubSpot CRM as the source of truth, with standardized pipeline stages, qualification criteria, and pricing guardrails. The playbook ensures repeatable deal progression, transparent forecasting, and adherence to QOrium's Constitution (pricing anchors, discount discipline, expansion metrics).

**Scope:** CRM setup, pipeline definitions, MEDDPICC qualification, pricing playbook, quote templates, activity standards, compensation alignment, and escalation protocols.

---

## 2. CRM Choice: HubSpot vs Pipedrive Analysis

### Decision: HubSpot (Selected)

**Rationale:**
- **Native integration:** Talpro Universe already uses HubSpot; reuse eliminates setup cost
- **Complexity:** Enterprise deals (4–9 month cycles, multi-stakeholder) require deal stages, custom fields, task automation, and forecasting
- **Workflow:** HubSpot's Sequences automate outreach cadences; Deal Stage tracking enables predictive close date
- **Reporting:** HubSpot Dashboards support real-time pipeline reviews (Monday standup)
- **Sales tools:** Dialer + email integration (HubSpot Sales Hub) reduces context switching

### Pipedrive Alternative (Rejected)
- **Pros:** Simpler UI, faster onboarding
- **Cons:** Limited custom field support, weaker forecasting, no native dialer integration
- **Verdict:** Too lightweight for AE motion; adequate for BD motion but standardizing on HubSpot for ease

### HubSpot Implementation Checklist
- [ ] Provision Sales Hub seat for AE Enterprise
- [ ] Provision Sales Hub seat for BD Platforms Lead
- [ ] Customize Object: Deal (add custom fields per §3)
- [ ] Create two Pipelines: "Enterprise Stack-Vault" and "Platform API"
- [ ] Set up Teams (AE + CEO team; BD + CEO team)
- [ ] Import Prospect Lists (Bosch, Siemens, JPMC, WeCP, Xobin, Adaface)
- [ ] Activate Sequences (Cold Outreach, Discovery Follow-up, Proposal Follow-up)
- [ ] Configure Forecasting (weighted pipeline by stage)
- [ ] Grant CEO read/write + reporting access

---

## 3. Pipeline Definitions

### Enterprise Stack-Vault Pipeline (AE) — 7 Stages

| Stage | Duration | Entry Criteria | Exit Criteria | Owner | Notes |
|---|---|---|---|---|---|
| **Prospect** | — | Target GCC in tier-A list; TA Head/CFO identified | First contact made (email/call); decision to engage | AE | List-building phase. No deal record yet. |
| **Outreach** | 2–4 weeks | Contact made; prospect has read initial email or taken call | Discovery call scheduled OR 3 touches with no response = archive | AE | LinkedIn, warm intro, email sequence. Track touch count. |
| **Discovery** | 2–4 weeks | Discovery call held; pain validated; assessment spend confirmed | Sample pack requested + delivery date confirmed OR unqualified (de-prioritize) | AE + CEO | 3–5 calls typical. Uncover stack, hiring volume, procurement timeline. |
| **Sample Pack Review** | 2–3 weeks | 50-question sample delivered; engineering panel begins review | Engineering panel endorsement received OR panel rejects (revisit) | AE + Senior Eng | 2-week review typical. Document feedback. |
| **Scoping** | 3–6 weeks | Sample pack endorsed; detailed requirements captured; proposal drafted | Signed proposal (agreed terms, pricing, delivery timeline) OR pricing negotiation stalled (hold) | AE + CEO | MSA template shared. Procurement path clarified. 4–8 week close target. |
| **Negotiation** | 4–8 weeks | Proposal signed; security review + MSA amendment process underway | PO received + signature authority confirmed OR deal slips (re-forecast) | AE + CEO + Legal | DPA signature, legal review, procurement alignment. Typical blocker: CFO approval at >₹50L. |
| **Won** | — | PO signed; cash received or within 30 days of receipt | Contract in place; delivery schedule locked; first payment received | AE + Ops | Archive prospect record; create customer record in Success CRM. |

**Probability Weighting (for forecasting):**
- Prospect: 5%
- Outreach: 10%
- Discovery: 25%
- Sample Pack Review: 50%
- Scoping: 75%
- Negotiation: 90%
- Won: 100%

---

### Platform API Pipeline (BD) — 5 Stages

| Stage | Duration | Entry Criteria | Exit Criteria | Owner | Notes |
|---|---|---|---|---|---|
| **Prospect** | — | Tier 1–3 assessment platform identified; VP Product/CTO known | First contact made | BD | Tier-1 (HackerRank, CodeSignal, SHL) = harder; Tier-2 (Mettl, iMocha, Adaface) = mid; Tier-3 (WeCP, Glider AI) = easier. |
| **Outreach** | 4–8 weeks | Contact made; platform has received intro or pitch deck | Executive pitch scheduled OR 4 touches, no engagement = deprioritize | BD + CEO | Founder intro (CEO) for Tier 1/2. Cold LinkedIn for Tier 3. Expect slower cadence. |
| **Technical Evaluation** | 4–6 weeks | Executive pitch held; platform interested in integration; sample API data shared | Technical team evaluates API; integration plan drafted OR platform uninterested (archive) | BD + Senior Eng | Platform engineering reviews latency, data format, rate limiting, security. Provide Postman collection, OpenAPI spec. |
| **Pilot Scoping** | 4–8 weeks | Technical eval complete; platform commits to pilot; pilot terms drafted | Signed pilot agreement (usage limits, success metrics, pricing, term) OR deal deprioritized | BD + CEO | Scope typical: 10,000 questions/month, 6-month pilot, $50K–$150K. Expansion path defined. |
| **Won** | — | Pilot contract signed; cash received | Integration complete; questions flowing via API; pilot metrics tracked | BD + Ops | Pilot entry = "won" from sales perspective. Customer Success owns pilot delivery + conversion to annual. |

**Probability Weighting:**
- Prospect: 5%
- Outreach: 15%
- Technical Evaluation: 40%
- Pilot Scoping: 70%
- Won: 100%

---

## 4. Qualification Criteria: MEDDPICC Framework

### Enterprise Stack-Vault (AE)

| Criterion | Threshold | Assessment |
|---|---|---|
| **Metrics** | >1,000 hires/year, >₹50L annual assessment spend | Qualify only if both met. Use LinkedIn Sales Nav to estimate headcount. |
| **Economic Buyer** | CFO or VP Finance aware + approval timeline clear | CFO must sign >₹50L POs. Budget allocation calendar known (e.g., Q2 approval for Q3 spend). |
| **Decision Criteria** | Content quality, anti-leak capability, cost-per-assessment | Ask: "What matters most—freshness, security, or price?" Score on impact. Likely: all three equal. |
| **Decision Process** | TA Head → CHRO → CFO (usual order); procurement involved >₹30L | Map stakeholders early (discovery call 1). Understand approval gates. |
| **Pain** | Candidate fraud, question repetition, content staleness, high authoring cost | Validate all three present. If only one (e.g., fraud), lower priority. |
| **Implicit Needs** | Multi-stack hiring, procurement maturity, strategic hiring roadmap | Stack variety = complexity = Stack-Vault stickiness. Procurement maturity = deal closure speed. |
| **Champion** | TA Head or Hiring Manager with budget visibility | Champion must be willing to advocate internally. Lack of champion = longer cycle. |

**Qualification Pass/Fail:**
- **PASS:** 6+ of 7 criteria met; schedule discovery call
- **HOLD:** 4–5 criteria met; re-engage in Q2 or deprioritize
- **FAIL:** <4 criteria; archive prospect

---

### Platform API (BD)

| Criterion | Threshold | Assessment |
|---|---|---|
| **Metrics** | 5,000+ annual assessments, own question library, engineering team dedicated to content | Qualify Tier 1/2 only; Tier 3 (mid-market) = lower bar if growth trajectory present. |
| **Economic Buyer** | VP Product or CEO with budget authority | API integration ~ $50K–$150K = product team sign-off sufficient. CEO approval typically on first contract. |
| **Decision Criteria** | Integration simplicity, cost-per-question savings, content freshness, lock-in (strategic importance) | Most platforms care about: 1) simplicity, 2) content quality, 3) pricing. Position SaveBank as 10x cheaper than in-house authoring. |
| **Decision Process** | VP Product → Engineering CTO → CEO (usual); procurement less formal (<$100K) | Faster than Enterprise. Procurement gate at ~$150K. |
| **Pain** | Library staleness, content leak risk, authoring burn-out, user complaints about repetition | Quantify: "How many in-house engineers maintain your question library?" Typical: 2–4 FTE @ ₹80L–₹150L/year. |
| **Implicit Needs** | Ongoing partnership mindset, API integration maturity, content strategy | Platform must see QOrium as long-term (3-year+) strategic partner, not point solution. |
| **Champion** | VP Product or Head of Content willing to own pilot success | Champion = key to deal momentum. If champion hesitant, expect 12+ month cycle. |

**Qualification Pass/Fail:**
- **PASS:** 5+ of 7 criteria met; schedule executive pitch
- **HOLD:** 3–4 criteria met; wait for signal or pivot to another prospect
- **FAIL:** <3 criteria; archive prospect

---

## 5. Pricing Playbook

### Anchor Pricing (Non-Negotiable per Constitution SO-23)

#### Stack-Vault (Enterprise)
| Tier | Annual | Monthly | Use Case | Roles Included | Expansion Path |
|---|---|---|---|---|---|
| **Department** | ₹10L | ₹8.3L | Single large role (e.g., all Senior Java hires) or 3–4 smaller roles | 3–5 roles | Expand to Enterprise (2x volume) |
| **Enterprise** | ₹40L | ₹3.3L | Multi-role, multi-stack (e.g., 10+ roles across SAP, Salesforce, Java, Cloud) | 10–20 roles | Expand to Global (multiple geographies) |

**Floor:** Department = ₹10L; Enterprise = ₹35L (no deeper discount without CEO approval >10%).
**Ceiling:** Department = ₹15L; Enterprise = ₹50L (premium for 20+ roles, localization, SLA tiers).
**Standard term:** 3 years preferred, 1-year minimum. Multi-year discount: –10% for 3-year commitment.

#### JD-Forge Subscription (Upsell to Stack-Vault Customers)
| Tier | Annual | Use Case |
|---|---|---|
| **Team** | ₹5L | Up to 5 concurrent JD editors; 500 JD/month authoring capacity |
| **Enterprise** | ₹15L | Unlimited editors; 5,000 JD/month authoring capacity |

**Bundling strategy:** If customer buys Stack-Vault + JD-Forge, apply –5% bundle discount (total package discounted, not per SKU).

---

### ReadyBank API (Platform Motion)

| Tier | Annual | Monthly | Use Case | Starter Pilot | Growth Pilot |
|---|---|---|---|---|---|
| **Starter** | ₹50K ($600/year) | ~₹4.1K | 10,000 questions/month, basic SLA | 6-month pilot | Expand to Growth (3x volume) |
| **Growth** | ₹150K ($1,800/year) | ~₹12.5K | 30,000 questions/month, 24h SLA, dedicated support | 6-month pilot | Expand to Enterprise (custom) |
| **Enterprise** | Custom | Custom | 100,000+ questions/month, white-label, geo-specific SLA | Quote per scope | Long-term strategic contract |

**Floor:** Starter = $45K; Growth = $120K (no deeper discount without CEO approval).
**Ceiling:** Starter = $60K; Growth = $180K (premium for 24h SLA, dedicated account mgmt, security review).
**Standard term:** 6-month pilot → 3-year annual contract (if metrics hit).

---

### Discount Discipline

**Allowed without CEO approval:**
- Bundle discount (Stack-Vault + JD-Forge): –5% maximum
- Multi-year commitment discount: –10% for 3-year, –5% for 2-year
- Volume discount (Platform API, >100K questions/month): –10% maximum
- Net expansion discount (upsell existing customer): –5% maximum

**Requires CEO approval:**
- Any discount >10% from anchor pricing (e.g., $135K on Growth tier)
- Discount >15% bundled
- Pilot-to-annual conversion discount (platform threatens to leave)
- Discount below floor (Department <₹10L, Enterprise <₹35L, Starter <$45K)

**Never allowed:**
- Free trial longer than 3 weeks (impacts pricing power)
- Revenue-share arrangements (lock-in reduces margins)
- Retroactive discounts (undermine anchor pricing)

**Discount request template (for AE/BD to CEO):**
```
Prospect: [Name]
Tier: [Department / Growth]
Anchor price: [amount]
Requested discount: [% and $]
Justification: [why they need discount]
Risk if we decline: [deal slips / lost to competitor]
Risk if we approve: [anchor pricing damage / margin impact]
Recommendation: [AE/BD recommendation]
```

---

## 6. Quote Template & Delivery

### Quote Format (PDF via HubSpot Quotes)

**Header:**
```
QOrium
The Source of Truth for Technical Assessment

PROPOSAL
[Prospect Name]
Date: [YYYY-MM-DD]
Valid Until: [YYYY-MM-DD, +30 days]
Prepared by: [AE/BD name]
```

**Section 1: Executive Summary**
- 2–3 sentences positioning the engagement (e.g., "Stack-Vault will deliver exclusive, anti-leak-rotated questions aligned to your SAP and Salesforce hiring stacks. This engagement covers 8 roles across both stacks, with quarterly refresh cycles and forensic watermarking.")
- Success metrics (e.g., "By Month 3, your engineering panel will report improved question quality; your TA team will report 30% reduction in content curation effort.")

**Section 2: Scope of Engagement**
- **Roles in scope:** List by category (SAP roles, Salesforce roles, etc.)
- **Questions per role:** 50 (initial), 200 (by Month 3)
- **Delivery timeline:** Wave 1 (Month 1), Wave 2 (Month 2), Wave 3 (Month 3)
- **Watermarking scope:** All questions forensically marked with [Prospect Name] fingerprint
- **Refresh cadence:** Quarterly (every 13 weeks)
- **Localization:** English primary; [Hindi/Tamil/Telugu] if specified

**Section 3: Pricing**
```
Stack-Vault | Enterprise Tier
Annual Term (1 year)              ₹40,00,000
Multi-year discount (3-year)      –₹4,00,000 (–10%)
Subtotal (3-year commitment)      ₹1,08,00,000
Monthly equivalent (36 months)    ₹3,00,000

Payment terms: Net 30 (invoiced monthly or upfront at signing)
```

**Section 4: Success Metrics & Pilot Conversion**
- Month 1 metric: "50 questions delivered; engineering panel validation complete"
- Month 2 metric: "150 questions live in your platform; 100+ candidates assessed"
- Month 3 metric: "200 questions live; platform users report improved question relevance; TA team cost savings quantified"
- Pilot conversion: "If Month 3 metrics achieved, pilot converts to annual contract with expansion path to additional roles"

**Section 5: Standard Terms**
- 30-day notice for termination (pilot phase); no early termination after pilot → annual conversion
- Security review (DPA signature required before delivery)
- IP exclusivity: "Questions are exclusive to your organization; QOrium retains authorship IP"
- SLA: "99.5% API uptime (if API-based delivery); delivery within timeline; leak detection response within 24 hours"
- Refresh guarantee: "Quarterly refresh batches delivered; if batch delayed >7 days, [1 month credit]"

**Section 6: Legal & Signatures**
- QOrium signature block (CEO or designated authority)
- Prospect signature block (TA Head, CHRO, or CFO as appropriate)
- Date signed
- Execution: "This quote becomes binding upon both parties' signatures below"

**Section 7: Appendix**
- Sample pack summary (50-question list)
- QOrium's watermarking process (1 page)
- Competitor comparison chart (if needed)
- Talpro Universe reference (company backgrounder)

### Quote Delivery
- **Timing:** Within 5 business days of scoping call
- **Medium:** Email + HubSpot Quote (embedded signature flow)
- **Validity:** 30 days from issue date
- **Follow-up:** AE touches base on Day 5, Day 12, Day 20 (if unsigned)

---

## 7. Forecast Methodology

### Monthly Forecast Structure (Input: HubSpot Pipeline)

**Weighted Pipeline Calculation:**
```
Forecast = Σ (Deal Value × Stage Probability × Close Likelihood)

Example:
  Prospect A | ₹40L | Scoping (75%) | Likely close M5 (90%) = ₹40L × 0.75 × 0.90 = ₹27L
  Prospect B | ₹10L | Discovery (25%) | Likely close M6 (70%) = ₹10L × 0.25 × 0.70 = ₹1.75L
  Total Weighted Forecast = ₹28.75L
```

**Forecast Categories:**
- **Commit:** Deals in Negotiation + Won stages (≥90% probability)
- **Likely:** Deals in Scoping + Sample Pack Review (≥50% probability)
- **Pipeline:** Deals in Outreach + Discovery (<50% probability)

**Forecast Discipline:**
- **Monday morning standup:** AE/BD reviews pipeline, updates stage, revises close date if slipping
- **Monthly (1st Friday):** CEO + AE/BD align on weighted forecast; compare to quota
- **If slipping:** CEO and AE/BD discuss mitigation (accelerate existing deals, activate new prospects)
- **Quarterly business review:** Forecast accuracy measured; adjust probability weights if systematic bias detected (e.g., "we always slip Discovery stage by 2 weeks")

---

## 8. Activity Standards

### AE Enterprise (Weekly Targets)

| Activity | Target | Notes |
|---|---|---|
| **Discovery calls** | 2–3 | With prospects in Outreach, Discovery, Sample Pack Review |
| **Proposal/scoping calls** | 1–2 | With prospects in Scoping, Negotiation |
| **Emails sent** | 10–15 | Outreach, discovery follow-up, proposal follow-up |
| **LinkedIn touches** | 3–5 | Connection requests, personalized messages, engagement |
| **CEO co-sells** | 1–2 | CEO present on first discovery call, sample pack review, negotiation close |
| **Deals closed** | 0.25 (1 per month avg) | Ramp quarter (M3–M6): 0 expected; Quota quarter (M7–M12): 1 per 4–6 weeks |

---

### BD Platforms (Weekly Targets)

| Activity | Target | Notes |
|---|---|---|
| **Executive pitches** | 1–2 | With VP Product or CTO (platform founder/leadership) |
| **Technical eval calls** | 1–2 | With platform engineering team; demos API, answers architecture questions |
| **Emails/outreach** | 8–12 | Cold, founder intro follow-up, proposal circulation |
| **CEO co-sells** | 2–3 | CEO on first pitch (founder credibility); BD leads scoping independently by deal 2–3 |
| **Deals closed** | 0.2 (1 per 4–5 months avg) | Longer cycle; expect 1 pilot/quarter by Month 4 |

---

## 9. Tools Stack & HubSpot Automation

### Core Tools
- **CRM:** HubSpot Sales Hub (Talpro instance)
- **Email:** HubSpot Email + Gmail integration
- **Calendar:** HubSpot Sequences + Calendly (booking links)
- **Dialer:** HubSpot Dialer or Dialpad integration
- **Proposals:** HubSpot Quotes
- **Signature:** DocuSign (integrated via HubSpot workflow)

### HubSpot Workflows (Auto-Triggers)

1. **Prospect → Outreach:** When prospect moves to Outreach, trigger 7-email Sequence (touches over 4 weeks). Template: intro, value prop, social proof, sample pack preview, soft close, re-engage, final touch.

2. **Discovery Scheduled:** When discovery call logged + attendee = CEO, trigger internal reminder (24h before call). Sends CEO and AE a prep template.

3. **Sample Pack Delivered:** When prospect moves to Sample Pack Review, trigger follow-up cadence (auto email Day 5, Day 10, Day 15 asking for engineering feedback).

4. **Proposal Sent:** When proposal logged in deal, trigger: a) internal approval check (CEO reviews if >₹30L), b) external follow-up sequence (if unsigned after 7 days, send "just checking in" email).

5. **Deal Won:** When deal moves to Won, trigger: a) create Customer success record, b) send internal "deal won" notification to ops team, c) log deal in compensation system (CRM custom field for commission calculation).

### HubSpot Custom Fields

**Deal object:**
- `Anchor_Price_Tier` (dropdown: Department / Enterprise / Starter / Growth)
- `Deal_Type` (dropdown: Stack-Vault / ReadyBank API / JD-Forge)
- `Close_Probability` (percentage, auto-calculated from stage)
- `Discount_Applied` (percentage, manual entry; triggers CEO approval workflow if >10%)
- `Success_Metrics_Defined` (checkbox; checked when pilot KPIs locked)
- `Procurement_Stage` (dropdown: Internal Review / Security Review / Legal Review / PO Ready / PO Signed)
- `Champion_Name` (text; decision maker)
- `Next_Review_Date` (date; re-engagement prompt)

---

## 10. Battlecards

### Enterprise Stack-Vault Objection Handling

| Objection | Response | Evidence |
|---|---|---|
| *"We can build this in-house."* | "You likely can, but authoring scales slowly. Your content team costs ~₹80L–₹150L/year for 2–4 FTE. QOrium is ₹40L/year (3-year) for unlimited refresh + anti-leak rotation. ROI breaks even in 3 months." | Case study: Mettl (saved ₹60L/year post-integration) |
| *"Your content is generic; we need custom."* | "Our Stack-Vault is entirely custom to your stacks and roles. We author specifically for your tech stack, not off-the-shelf. Watermarking means the content is yours exclusively." | Sample pack validation; reference call with existing customer |
| *"How do we know your content is better than Mettl?"* | "Mettl uses generic libraries; ours are exclusive + IRT-calibrated. Proof: your engineering panel validates sample pack. If they say 'yes, we'd ask our candidates this,' we've proven quality." | Sample pack review results; IRT calibration certificate |
| *"What's your anti-leak guarantee?"* | "Forensic watermarking. Every question encrypted with your fingerprint. If your question leaks externally, we trace it back to you, pull it within 24 hours, and replace it. Zero questions re-used." | Watermarking white paper; SLA guarantee in contract |

---

### Platform API Objection Handling

| Objection | Response | Evidence |
|---|---|---|
| *"We have our own content engine."* | "You likely do—but is your team happy maintaining it? We'll take the burden. API integration is <2 weeks; fresh questions flowing in Month 1. You can sunset your authoring pipeline." | Integration specs; Postman collection; customer onboarding timeline |
| *"What if the API goes down?"* | "99.5% uptime SLA backed by DPA. If we exceed downtime, you get service credits. Plus: all questions cached in your system after fetch—no live dependency." | SLA document; architecture diagram showing caching |
| *"How much will integration cost you?"* | "Integration is free. Our cost is content authorship + maintenance. Your cost is the annual fee. By year 3, you'll have authored ~100K questions; we've authored 150K custom to you—10x cheaper than hiring." | Unit economics breakdown; cost comparison spreadsheet |
| *"Do you lock us in?"* | "No lock-in. 6-month pilot, then 3-year preferred. You can exit with 90-day notice. But once your team integrates us, switching is expensive (re-train content team, re-platform questions)—so we focus on being indispensable." | Contract excerpt; exit clause visibility |

---

## 11. Forecasting Cadence

### Daily
- AE/BD logs all calls, emails, proposals in HubSpot
- Auto-calculated weighted forecast updates based on stage transitions

### Weekly (Monday, 10am)
- AE/BD + CEO standup: review new deals, stage changes, at-risk flags, next week activities
- 30 minutes; standing meeting
- Agenda: (1) Pipeline snapshot, (2) top 3 at-risk deals, (3) new prospects activated, (4) blockers
- Output: Updated close dates, risk flags, CEO co-sell priorities

### Monthly (1st Friday, 2pm)
- CEO + AE/BD full forecast review
- Weighted pipeline vs quota
- Probability adjustments based on deal progression
- Forecast accuracy retrospective (did we close what we said?)
- 60 minutes

### Quarterly (End of Q, 3pm)
- CEO + AE/BD + CFO business review
- Annual run-rate projection
- Year-end quota re-forecast
- Commission accuracy check (commissions paid match actuals)
- 90 minutes

---

## 12. Compensation Alignment

### AE Enterprise Commission Structure

**Quota:** Year 1 ₹400K ARR (~3–4 deals); Year 2 ₹800K ARR (growth + retention)

**Commission:**
- **20% of commission on signature** (deal signed, MSA executed)
- **20% on first payment received** (payment in bank)
- **Example:** ₹40L deal = ₹2L commission. If AE is 15% OTE (on ₹25L base): ₹2L commission = 8% of base earned. All deals contribute to annual OTE target.

**Bonus structure:**
- **Pilot-to-annual conversion bonus:** 5% of Year 1 ARR if customer renews beyond pilot term (encourages customer success focus)
- **Expansion bonus:** 5% of incremental ARR on upsells to existing customers (NRR growth incentive)

### BD Platforms Commission Structure

**Quota:** Year 1 3 platform pilots signed (~$240K blended); Year 2 5–8 pilots + 2+ conversions to annual

**Commission:**
- **15% on signature** (pilot contract signed)
- **15% on first payment** (payment received)
- **Example:** $150K Growth tier = $22.5K commission. 15% OTE target on ₹20L base = ~₹3L/year = $360/month. 2 deals/quarter = ~$90K/year revenue opportunity.

**Bonus structure:**
- **Pilot-to-annual conversion bonus:** 10% of Year 1 ARR (higher than AE because platform deals are longer cycle and stickier once live)

---

## 13. Escalation Protocols

### Discount Approval

**<5% discount:**
- AE/BD approval only; log in deal record

**5–10% discount:**
- CEO approval required; AE/BD submits discount request form + justification; CEO responds within 24 hours

**>10% discount:**
- CEO + CFO approval required; deal escalation meeting; document decision + rationale in CRM

### Deal Slippage

**If deal slips >1 month from forecast close date:**
- AE/BD updates deal in HubSpot + notifies CEO same day
- Weekly re-engagement plan (new touch, change approach, CEO co-sell, etc.)
- If slip >2 months, escalate to CEO for strategic decision (invest more, deprioritize, pivot)

### Procurement Delay (>8 weeks legal/security review)

- AE/BD schedules "unblock call" with prospect's procurement lead + QOrium CEO
- CEO may reach out directly to prospect's CFO/General Counsel (peer-to-peer)
- If unblock fails, deal moved to "On Hold" pending prospect internal change

---

## 14. Onboarding Sequence (AE/BD)

**Week 1:**
- Access HubSpot, Gmail, Calendly, dialer
- Read Constitution (SO-23 pricing, SO-1 Customer Zero)
- Meet CEO: 60-min product strategy + sales philosophy alignment
- Pair with Senior Engineer: 30-min API/content architecture overview

**Week 2:**
- Read Bali Sales Playbook (this doc) + call recordings from past prospects
- Meet CFO: 30-min on pricing, discount discipline, quota structure
- Attend Monday standup (observer mode)

**Week 3:**
- Build initial prospect list (30 targets for AE; 20 for BD)
- CEO provides founder intros (3–5 for AE, 2–3 for BD)
- Write 5 personalized cold emails (review with CEO before send)

**Week 4:**
- First discovery call (AE) or pitch (BD) with prospect (CEO co-present)
- Debrief: what went well, what to improve
- Activate Sequences on HubSpot for next 10 prospects

---

## 15. Three Open Questions for CEO/Bali

1. **Platform motion velocity:** Are we confident in 3 pilot closures by end of Year 1? Or should we target 2 + 1 conversion (conservative)? Impacts BD lead hiring + comp planning.

2. **AE ramp timeline:** Can we confidently hire mid-Year 1 and have them close a deal by Dec 31? Or should we plan for Year 2 first close? Impacts quota attainment realistic forecast.

3. **Discount guardrails:** Is the <5%/5-10%/10%+ escalation ladder too rigid? Should we auto-approve 7% discounts for Growth-tier pilots (volume play) and only escalate Enterprise deals? Or maintain strict discipline?

---

**End of Bali Sales Playbook**
