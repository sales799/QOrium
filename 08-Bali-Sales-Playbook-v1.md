# QOrium — Document 8 of N

# Bali Sales Playbook v1.0

**Author:** CTO Office, Talpro Universe (drafted overnight by Cowork CTO)
**Audience:** Bali (Sales Office) — CEO + AE Enterprise + BD Platforms + AI Agent
**Date:** 2026-05-05
**Status:** Draft v1.0 — for CEO review prior to first external customer engagement
**Companion docs:** Blueprint v1 · SKU Architecture v1 · CTO Architecture v1 · Constitution v2.0 · Investor Brief Pre-A v1

---

## Reading Guide

This is the operating manual for **Bali — the Sales Office** as constituted in Constitution Article II §2.7. It defines who sells what, to whom, how, at what price, and how we handle the predictable objections. Sections:

1. **Mission & Authority** — what Bali owns, what is reserved
2. **Org & Hiring Plan** — Year 1, Year 2, Year 3
3. **The Three Sales Motions** — Platform API, Enterprise Stack-Vault, Recruiter Subscription
4. **ICP Segmentation** — qualifying criteria per motion
5. **Pricing Discipline** — anchors, floors, the 10% exception rule
6. **Commercial Templates** — Stack-Vault, Platform API, Recruiter
7. **Customer Zero Pattern** — Talpro India as the first reference
8. **Objection Handling** — the 8 objections we hear most
9. **AI Agent + Human AE Hybrid** — the SO-18 architecture
10. **Operating Cadence** — daily / weekly / monthly / quarterly
11. **Pipeline & Forecasting Discipline**
12. **Competitive Watch** — quarterly scan, MANTHAN re-validation triggers
13. **Customer Success & Renewal**
14. **Year-1 Targets**
15. **Sales-Motion Risks & Mitigations**
16. **Appendix** — scripts, links, escalation paths

---

## 1. Mission & Authority

### Mission

Bali turns the QOrium product story into customers, contracts, and renewable revenue. Y1 target: **66 logos · ₹3.5 Cr ARR**. Y3 target: **200+ logos · $7M ARR** (per Investor Brief Pre-A §3).

### Authority — what Bali decides

Per Constitution v2.0 §381 (Authority — Decisions Reserved to Bali):

- All customer acquisition motions (the three motions in §3 below)
- Pipeline management — qualification, progression, forecast
- Customer onboarding (delivery handoff to CTO/COM)
- Customer success — health, expansion signals
- Renewal & expansion — Stack-Vault annual, Recruiter monthly
- **Customer-by-customer pricing within published bands** (Constitution §167)
- Day-to-day sales activity (Constitution §168)
- Quarterly competitive scan + classification update (Constitution §10.3)

### Authority — what is reserved

- Pricing exceptions >10% from anchor → **CEO approval required** (SO-11)
- New SKU introductions → CTO Office
- New ICP segmentation → MANTHAN process
- Acquisition/M&A discussions → CEO
- Public press / investor narrative → CEO

### Reporting line

Bali reports operationally to the CEO (founder-led sales in Y1). All Bali decisions log to `competitive_research_log.md` (competitive) or the CRM (pipeline). Weekly pipeline review: Mon, CEO + CTO + Bali.

---

## 2. Org & Hiring Plan

### Y1 (M0–M12) — founder-led + first hires

| Role                                | Headcount           | Start  | Compensation anchor                  | Owns                                                                   |
| ----------------------------------- | ------------------- | ------ | ------------------------------------ | ---------------------------------------------------------------------- |
| **CEO (founder sales lead)**        | 1 (already in seat) | M0     | n/a                                  | All deal closures > ₹20L; Stack-Vault discovery; investor demos        |
| **AE — Enterprise**                 | 1                   | **M3** | ₹25-35L base + variable; OTE ₹50-65L | GCC + BFSI + IT services pipeline; Stack-Vault deals < ₹50L            |
| **BD — Platforms**                  | 1                   | **M3** | ₹18-25L base + variable; OTE ₹35-50L | Assessment-platform partnerships (HackerRank tier); Platform API deals |
| **AI Agent (Recruiter outreach)**   | 1 (engineered)      | **M2** | infra cost only                      | Recruiter subscription self-serve funnel; lead qualification at scale  |
| **CDO (Customer Delivery Officer)** | shared with CTO     | M0     | n/a                                  | Onboarding handoff; first 90 days of every Stack-Vault customer        |

### Y2 (M13–M24)

| Role                       | Headcount | Trigger                                                                      |
| -------------------------- | --------- | ---------------------------------------------------------------------------- |
| **Sales Lead (full-time)** | 1         | When Y1 closes ≥40 logos OR ARR ≥₹2.5 Cr                                     |
| **CSM — Stack-Vault**      | 1         | When Stack-Vault customers ≥5 (per Investor Brief Y1 target)                 |
| **AE — Platforms (US)**    | 1         | When first US platform partnership signed                                    |
| **Marketing Lead**         | 1         | M11 (per Constitution §583 — referenced as "future marketing hire Month 11") |

### Y3 (M25–M36)

- AE region splits: India + US + EU
- Sales Engineering function (technical demos, RFP responses)
- RevOps (SFDC, attribution, forecasting infra)

### What we do NOT hire in Y1

- Inside sales / SDR team — replaced by AI Agent on the Recruiter motion
- Solutions Engineer — CEO/CTO covers technical demos in Y1
- Channel partner manager — Talpro Universe network IS the channel in Y1

---

## 3. The Three Sales Motions

Each motion has a distinct buyer, deal size, sales cycle, win rate, and primary SKU. All three run in parallel.

### 3.1 Platform API motion (Mode A)

**Buyer:** Assessment platform companies. Mid-tier first (Adaface, iMocha, Equip, WeCP-equivalents), then Tier 1 (HackerRank, Mettl/Mercer, Codility, HackerEarth) once Day-0 traction exists.

**Primary SKU:** ReadyBank Platform API ($50K–$500K/year per Investor Brief §3.1) + JD-Forge Enterprise tier on top.

**Deal anatomy:**

- **Average ACV:** $80K (Y1) → $185K (Y3)
- **Sales cycle:** 6–12 months
- **Stages:** Outbound → Discovery (45 min) → Technical demo (60 min, CEO+CTO) → POC scoping (30 days, 3 questions/integration test) → Procurement → Contract → Onboarding (30 days)
- **Win rate target:** 18% closed-won at qualified-lead stage; 35% closed-won at POC stage

**Owner:** BD — Platforms (lead) + CEO (close support).

**Y1 target:** 3 logos, ARR $240K.

### 3.2 Enterprise Stack-Vault motion (Mode D)

**Buyer:** GCCs (Bosch, JPMC India, Citi GCC, Lowe's GCC), BFSI majors (HDFC, ICICI, Axis), IT services (TCS, Infosys, Wipro, HCL, Tech Mahindra).

**Primary SKU:** Stack-Vault Enterprise (₹40L–1Cr+/year per SKU §4.4).

**Deal anatomy:**

- **Average ACV:** ₹70L (Y1) → ₹1.2Cr (Y3)
- **Sales cycle:** 3–6 months for first contract; renewals 30–60 days
- **Stages:** Talpro warm intro → Discovery (60 min, CEO + CDO) → Stack discovery scoping (90 days for Bosch-tier; 30 days for smaller scopes) → Contract negotiation → Phase-1 library build (8–12 weeks, owned by COM) → Per-quarter refresh
- **Win rate target:** 25% close from qualified-discovery stage (lower than Platform because: smaller pool, more thoughtful procurement)

**Owner:** AE — Enterprise (lead) + CEO (close + Talpro warm intros).

**Y1 target:** 5 logos, ARR ₹3.5 Cr.

### 3.3 Recruiter Subscription motion (Modes A + B + C)

**Buyer:** IT staffing firms (Talpro India peers), boutique recruiters, mid-market enterprises with high-volume hiring.

**Primary SKUs:** ReadyBank Recruiter (₹4,999–49,999/mo) + JD-Forge per-JD or subscription ($49–$499/JD).

**Deal anatomy:**

- **Average ACV:** ₹2.4L (Recruiter Solo annualized) → ₹6L (Recruiter Team) → ₹18L (Agency)
- **Sales cycle:** 1–4 weeks; mostly self-serve with AI Agent assist
- **Stages:** AI agent outreach → Self-serve trial (free pack of 50 questions) → Subscription conversion → Auto-renew
- **Win rate target:** 8% trial-to-paid; 65% paid-to-renewal at month 6

**Owner:** AI Agent (lead) + CEO (escalations, Agency-tier deals).

**Y1 target:** 30 logos, ARR ₹54L.

### Cross-motion arithmetic (Investor Brief §3.1 reproduced)

| Motion                          | Logos        | Y1 ARR                           |
| ------------------------------- | ------------ | -------------------------------- |
| Platform API                    | 3            | $240K (~₹2 Cr)                   |
| Enterprise Stack-Vault          | 5            | ₹3.5 Cr                          |
| Recruiter Subscription          | 30           | ₹54L                             |
| JD-Forge (cross-motion add-ons) | 28           | $280K (~₹2.3 Cr)                 |
| **Total**                       | **66 logos** | **₹3.5 Cr / $420K (FX-blended)** |

---

## 4. ICP Segmentation

### Platform API (3 ICPs)

| ICP                  | Profile                                  | Qualifying signal                                           | Primary contact              |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| **Tier 1 platform**  | HackerRank, Mettl, Codility, HackerEarth | Public revenue >$30M, content team headcount 20+            | VP Product or VP Engineering |
| **Tier 2 platform**  | Adaface, iMocha, Equip, WeCP-tier        | $5–30M ARR, content team 5–15                               | CEO or CPO directly          |
| **Niche specialist** | Codesignal, Karat, ProveIQ               | Specific format gaps (e.g., system design, leadership SJTs) | CTO or Head of Content       |

**Disqualification criteria** (Bali says no immediately):

- Platform <$2M ARR (their content investment is too small to justify our floor)
- Platform whose content team is publicly bragged about as a moat (cultural mismatch — they won't outsource)
- Platform with active legal hostility to Talpro Universe

### Enterprise Stack-Vault (4 ICPs)

| ICP                       | Profile                                 | Qualifying signal                                                         | Primary contact                  |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| **GCC large**             | Bosch, JPMC India, Citi GCC, Lowe's     | >5,000 tech assessments/quarter; warm intro via Talpro                    | Head of TA + Head of Engineering |
| **BFSI tech major**       | HDFC, ICICI, Axis, JPMC India           | Hiring 200+ tech roles/year; existing assessment platform leak complaints | CIO or Head of Tech Hiring       |
| **IT services giant**     | TCS, Infosys, Wipro, HCL, Tech Mahindra | Campus hiring 50,000+ candidates/year; brand-protection mandate           | Chief Talent Officer             |
| **Mid-market enterprise** | India unicorns, growth-stage tech cos   | Hiring 100+ tech roles/year; pricing pressure on assessment               | VP People or VP Engineering      |

**Disqualification criteria:**

- <100 tech hires/year (Stack-Vault Department tier ROI doesn't work below this)
- Procurement requires SOC 2 Type II completion before pilot (Y1 we don't have it; defer to M9+)
- No procurement budget for current FY (defer to next FY entry)

### Recruiter Subscription (3 ICPs)

| ICP                                  | Profile                                         | Qualifying signal                                                   | Primary contact             |
| ------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| **Mid-tier IT staffing firm**        | Talpro India peers (~50–500 placements/quarter) | Active drives across 10+ skills; complains about assessment quality | Founder or Head of Delivery |
| **Boutique recruiter**               | <50 placements/quarter, executive search        | 5+ tech roles/month; per-JD value high                              | Owner or Recruitment Lead   |
| **Mid-market enterprise (in-house)** | 100–500 hires/year, no dedicated content team   | Currently using Mettl/HackerEarth and complaints leak               | Head of TA                  |

---

## 5. Pricing Discipline — anchors, floors, exceptions

### The three Standing Orders that govern pricing

- **SO-11 — Stack-Vault Enterprise floor:** Anchor ₹40L/year. Floor ₹35L/year. Exceptions <₹35L require CEO approval (logged).
- **SO-23 — Platform API band:** $5K-25K/year for entry; up to $500K/year at Enterprise tier. Bali holds the band; <$5K/year is auto-rejected (the customer is misqualified).
- **SO-11 (companion) — Recruiter Subscription:** ₹4,999/mo (Solo) → ₹14,999/mo (Team) → ₹49,999/mo (Agency). No floor; published band is final. Bali may offer 1 free month for annual prepay; nothing more without CEO.

### The 10% exception rule (Constitution §584)

Pricing >10% below the anchor on ANY motion requires CEO approval. Logged in `competitive_research_log.md` with:

- Customer name
- Motion + tier
- Anchor → proposed price → discount %
- Reason (matched competitor offer, multi-year commitment, strategic logo, etc.)
- CEO approval timestamp

### Pricing playbook — when to discount

**Discount IF:**

- Customer commits to 2+ year contract (10% max off anchor)
- Customer is a strategic logo for case study (15% max, CEO approval)
- Multi-SKU bundle (5% per additional SKU, max 15% blended)
- First-3 logos in any motion (founder-pricing — CEO call, up to 25% off, time-bound to M6)

**Don't discount IF:**

- Customer says "your competitor offered X" — qualify the offer ("which platform, which scope, which library size?"); usually it's not apples-to-apples
- Procurement asks for 30%+ discount as opening posture — counter with scope reduction (move from Enterprise to Department tier), not price cut
- Customer is in Y2+ renewal — increase 8% YoY (CPI + value-density growth) is the default; no discount

### Pricing scripts (memorize)

- **Stack-Vault Enterprise opening:** _"Stack-Vault Enterprise is ₹40 lakhs annually for the 2,000-question library across 20–30 roles, refreshed quarterly with 200 new questions and 100 retired. The license covers unlimited internal use. Watermarking and forensic attribution are included. Multi-year contracts get a 10% discount; no other variation without procurement-finance review."_

- **Platform API opening:** _"ReadyBank Platform API starts at $50,000/year for the Starter tier — 10,000 questions per month with monthly anti-leak scans. Most of our platform partners land in the Growth tier at $150,000 with weekly scans and 50,000 questions. Enterprise is $500K+ with continuous rotation. We anchor here because authoring + validation + IRT calibration costs us $9 per question; we deliver them at $0.10–$5 effective per question depending on volume."_

- **Recruiter Subscription opening:** _"Recruiter Solo is ₹4,999 a month for 200 questions and 5 roles — fits a boutique. Team at ₹14,999 covers most of your hiring volume. Agency at ₹49,999 is unlimited roles plus light API. Annual prepay gets you one month free."_

---

## 6. Commercial Templates

### 6.1 Stack-Vault Enterprise commercial template

```
QORIUM STACK-VAULT ENTERPRISE — COMMERCIAL TERMS (TEMPLATE v1)

CUSTOMER:        [legal entity name]
EFFECTIVE DATE:  [DD-MMM-YYYY]
TERM:            12 months, auto-renewing for 12-month periods
                 unless cancelled with 60-day notice

LICENSE FEE:     ₹40,00,000 (Forty lakh Indian Rupees) per year
                 OR
                 ₹35,00,000 (with CEO-approved exception SO-11)

LIBRARY SCOPE:   2,000 questions across [X] role families:
                 [list — locked in 90-day discovery]

REFRESH:         200 new questions + 100 retired per quarter
                 Continuous anti-leak monitoring (24h SLA)

DELIVERABLES:    - Private QOrium namespace under customer account
                 - Per-customer cryptographic watermarking
                 - Quarterly delivery report
                 - Forensic attribution if leak detected

EXCLUSIVITY:     Contractual — no question in this library appears in
                 ReadyBank, in any JD-Forge output to another customer,
                 or in any other Stack-Vault customer.

PAYMENT:         Annual in advance OR quarterly with 8% surcharge

ESCALATION:      8% annual increase from year 2 (CPI + value density)

TERMINATION:     For cause: 30-day cure period. For convenience:
                 60-day notice; no refund of paid portion.

GOVERNING LAW:   India (jurisdiction: Bengaluru courts).
```

### 6.2 Platform API license template (excerpt)

```
QORIUM PLATFORM API LICENSE — STARTER (TEMPLATE v1)

CUSTOMER:        [platform legal entity]
TERM:            12 months
LICENSE FEE:     $50,000 (Starter) / $150,000 (Growth) / $500,000+ (Enterprise)
USAGE CAP:       10,000 questions/mo (Starter) / 50,000 (Growth) / unlimited (Enterprise)
RATE LIMIT:      100 req/min (Starter) / 500 (Growth) / 5,000 (Enterprise)
ANTI-LEAK SLA:   Monthly scan + quarterly rotation (Starter) /
                 Weekly scan + monthly rotation (Growth) /
                 Continuous + real-time rotation (Enterprise)
SUPPORT:         8x5 IST email (Starter) / 12x6 IST + Slack (Growth) /
                 24x7 + dedicated Slack (Enterprise)
SLA UPTIME:      99.5% (Starter) / 99.9% (Growth) / 99.95% (Enterprise)
DATA RIGHTS:     Customer owns its candidate response data;
                 QOrium retains anonymized usage analytics.
```

### 6.3 Recruiter Subscription self-serve

Self-serve via website + AI Agent. No human handoff unless:

- Pack >₹50K (Agency tier or one-time pack)
- Custom format request
- Multi-seat (5+ users) — escalate to human AE for volume pricing
- Annual prepay >₹15L

---

## 7. Customer Zero Pattern (Constitution Standing Order #1)

### Why Talpro India is Customer Zero

Constitution SO-1 mandates that every Talpro Universe venture run on its own dogfood before external sale. For QOrium:

- **Volume:** Talpro India runs ~500+ GCC placements/year through assessment-platform-screened drives (Constitution §rationale)
- **Use case fit:** Talpro hits all three motions:
  - Platform-side (Talpro is mid-market enterprise = ReadyBank Recruiter Team subscription)
  - Enterprise-side (Talpro could buy a Stack-Vault for its top-50-placements segment)
  - Recruiter-side (Talpro IS a staffing firm — primary recruiter subscription user)
- **Speed:** Internal sale = zero CAC, zero procurement cycle, instant feedback loop
- **Marquee credibility:** "Talpro India runs on QOrium" is a real, defensible claim from Day 1

### How to leverage Customer Zero in sales conversations

**Use it for:** social proof, technical credibility, case-study velocity, leak-rate evidence.

**Don't use it for:** _"if it's good enough for our parent company, it's good enough for you."_ That signals weakness. Position as: _"We dogfood our own product on the world's largest tech-staffing market — India's GCC sector. The leak data we observe in our own delivery is what tells us when to rotate."_

### Customer Zero data points (refresh quarterly)

- Talpro placements running on QOrium content: target 100% by M3
- Average leak detection time on Talpro deliveries: target <72 hours
- Talpro candidate screen-to-interview pass rate before/after QOrium: target 35% improvement by M6 (vs Mettl baseline)
- Talpro placement velocity uplift: target 15% by M9

---

## 8. Objection Handling — the 8 we hear most

### O1: "We'll just buy ReadyBank, why pay 20× for Stack-Vault?"

**Diagnosis:** Cannibalization risk (SKU §2.7).

**Counter:** _"ReadyBank is a shared library — the questions you get are also delivered to Mettl's customers, HackerRank's customers, every other paying buyer. Stack-Vault is contractually exclusive to you. If your competitive advantage in hiring is that your interview process picks up signal others miss, you don't want shared questions. ReadyBank fits commodity hiring at scale; Stack-Vault fits hiring where the signal-to-noise ratio matters."_

**When this works:** Buyer has 5,000+ assessments/quarter AND a brand-protection mandate.

**When it doesn't:** Buyer is in commodity volume hiring without IP concerns — sell ReadyBank. Don't force Stack-Vault.

### O2: "Bosch procurement is 6+ months. We can't wait."

**Diagnosis:** Procurement cycle mismatch with sales urgency.

**Counter (per Constitution §rationale to Risk Register):** _"Run JD-Forge Reviewed during the procurement window. $1,999/month for 15 reviewed JDs. No procurement gate — invoice goes through expense, not capex. Three months in, you have validated outputs we can hand to your assessment platform of choice. Stack-Vault discovery starts in parallel; the contract activates Day 1 of Q3."_

**Why it works:** Decouples the value delivery from the procurement cycle. Customer gets immediate ROI; we secure the larger contract on their procurement timeline.

### O3: "Why can't we just prompt GPT-5 ourselves?"

**Diagnosis:** Build-vs-buy challenge from a technically literate buyer.

**Counter:** _"You can. The hard parts aren't generation — those are well-solved. The hard parts are: (1) IRT calibration against a reference panel — you'd need 200+ paid candidates per question family; (2) anti-leak filter trained on the leaked-question corpus — that's a continuously updated dataset; (3) format coverage across 40+ question types — each with its own self-critique loop; (4) SME validation operations at ₹500–₹2,000 per question. We've made a content company out of these. You'd be making it on the side. Either you fund a $1.2M/year content team or you license ours."_

**Hard close:** _"Want to see the leak filter live? Send me a question, I'll show you our semantic similarity match against 7 public sources in real time."_

### O4: "Mettl/HackerRank already work fine for us."

**Diagnosis:** Status quo defense.

**Counter:** _"What's your screen-to-interview pass rate? If 95% of candidates score above 75 on Mettl but only 30% pass your final round, that's not a hiring funnel — that's a leak funnel. Pull last quarter's data; if pass-rates correlate with leak velocity (we'll show you the GeeksforGeeks tagging), Mettl is screening for prep, not skill. Run a 50-candidate pilot with QOrium-rotated questions. If pass-rate doesn't separate, we'll refund."_

**Why it works:** Forces them to confront real data they don't usually look at. Most buyers don't measure screen-to-interview discrimination quality.

### O5: "Pricing pushback — your floor is too high."

**Diagnosis:** Procurement opening move OR genuine budget mismatch.

**Counter:** First, qualify which one. _"Help me understand — is this a budget you don't have, or a comparison to a quote you have in hand?"_

- If **budget gap:** offer scope reduction (Enterprise → Department), not price cut. _"Department tier at ₹10L covers 500 questions across one department. If that fits this fiscal year, we can plan a Department-to-Enterprise expansion at FY+1."_
- If **comparison quote:** ask to see it. Usually the competitor quote is for a smaller scope, a different exclusivity model, or a per-seat pricing that grows linearly — apples to oranges. _"Send me their proposal; I'll show you where ours is structurally different and we can decide together if the price gap is real."_

### O6: "We need SOC 2 Type II before we sign."

**Diagnosis:** Enterprise compliance gate. Real for some buyers (BFSI), nice-to-have for others.

**Counter:** _"Our SOC 2 Type II is in audit window H2 FY26. We can sign a contract today with a SOC 2 obligation clause — we deliver the report by end-of-fiscal-year, you have termination-for-convenience until we deliver. This is standard for early-stage vendors. Or, if your compliance team won't accept the obligation, we can ramp a JD-Forge-only relationship (which doesn't store your candidate data) until SOC 2 lands."_

### O7: "We don't trust AI-generated content."

**Diagnosis:** Editorial/quality concern. Common with academic-leaning buyers.

**Counter:** _"Every QOrium question runs through a 5-stage validation: AI draft → AI self-critique scoring 6 dimensions → human SME review by a paid contractor (₹500–₹2,000 per question depending on complexity) → IRT calibration against the reference panel (200+ paid candidates) → release. The AI is a force-multiplier; the SMEs are the quality gate. If you want to audit the validation log for any specific question, it's available — we'll show you the SME's name, time-to-validate, and edit history."_

### O8: "Talpro India is our competitor — why would we buy from your sister company?"

**Diagnosis:** Talpro Universe brand association as a sales risk.

**Counter:** _"QOrium has a separate legal structure, a separate roadmap, separate engineering. Talpro India's role is Customer Zero — we use them to dogfood. Stack-Vault customers' libraries are contractually exclusive to them; Talpro India does not see Bosch's library, JPMC's library, etc. The data segregation is in our SOC 2 scope. The Talpro association is a credibility signal, not a conflict — we know the assessment industry from the buyer side because we ARE a buyer."_

---

## 9. AI Agent + Human AE Hybrid (SO-18)

Constitution Standing Order #18: Bali operates as a hybrid AI-Agent + human-AE function. Human-only sales doesn't scale to the Recruiter motion's volume; AI-only sales doesn't close enterprise. Hybrid is the model.

### Workload split

| Stage                    | Recruiter motion           | Platform motion                | Stack-Vault motion           |
| ------------------------ | -------------------------- | ------------------------------ | ---------------------------- |
| **Outbound**             | AI Agent                   | Human BD + AI agent enrichment | Human AE + Talpro warm intro |
| **Qualification**        | AI Agent                   | Human BD                       | Human AE                     |
| **Demo**                 | Self-serve                 | Human (CEO + CTO)              | Human (CEO + AE + CDO)       |
| **POC scoping**          | n/a (free trial)           | Human BD                       | Human AE + COM               |
| **Contract negotiation** | n/a                        | Human BD + CEO                 | Human AE + CEO               |
| **Onboarding**           | AI Agent + self-serve docs | Human BD + CDO                 | CDO + COM (90-day immersion) |
| **Renewal**              | AI Agent reminders         | Human BD (annual)              | Human AE (annual)            |

### AI Agent capability spec

The Recruiter outreach AI Agent (engineered M2):

- **LinkedIn Sales Navigator + Apollo + Apify scraping** — daily ICP enrichment for IT staffing firms
- **Personalized first-touch email** — references their last 30 days of LinkedIn activity, current open requisitions on their website, recent Glassdoor reviews of their candidate experience
- **Calendar booking** — Calendly handoff if they reply
- **Trial provisioning** — sends free 50-question pack with their next open requisition's keywords
- **Subscription conversion nudge** — Day 5 trial reminder, Day 12 expiration, Day 14 paid conversion offer
- **Renewal nurture** — monthly check-in for the first 6 months of paid

The AI Agent does NOT:

- Negotiate price
- Make custom commitments
- Handle complaints (escalates to human)
- Approve refunds
- Discuss product roadmap

### Escalation triggers (AI Agent → Human)

- Customer asks for pricing exception >0% (any discount request)
- Customer asks "talk to a human"
- Customer asks technical question the AI's confidence-score is <0.8
- Customer mentions any of: SOC 2, GDPR, DPA, custom terms, multi-seat (5+)
- Trial expired without conversion AND customer-LTV-prediction >₹50K — manual outreach
- Negative sentiment detected in any reply

### What the AI Agent makes unnecessary

A traditional inside-sales / SDR team of 4–6 humans for the Recruiter motion. We don't hire those roles. The cost savings (~₹40L/year) goes to the Marketing Lead (M11) and the Y2 Sales Lead.

---

## 10. Operating Cadence (Constitution §671–687, reproduced)

### Daily

- **08:30 IST** — AE Enterprise reviews overnight platform-pipeline messages
- **09:00 IST** — BD Platforms outbound block (60 min, 25 personalized touches)
- **10:00–18:00 IST** — pipeline activity logged in CRM as it happens
- **18:30 IST** — daily pipeline summary auto-emailed to CEO

### Weekly

| Day     | Cadence                              | Owner            | Output                                                                 |
| ------- | ------------------------------------ | ---------------- | ---------------------------------------------------------------------- |
| **Mon** | Pipeline review (60 min)             | CEO + CTO + Bali | Forecast for the week; deals at risk                                   |
| **Wed** | Customer outreach blitz (90 min)     | All of Bali      | 50 net-new touches added to pipeline                                   |
| **Fri** | Win/loss debrief (30 min)            | Bali             | One concrete sales-process improvement per week                        |
| **Fri** | AI Agent performance review (15 min) | CTO + Bali       | Conversion rate, false-positive escalations, model retraining requests |

### Monthly

- **First Mon** — month-over-month pipeline + ARR review (CEO + Bali + CFO equivalent)
- **Mid-month** — Standing Orders refresh: any pricing exceptions logged + any new objection patterns documented in this Playbook
- **Last Fri** — case-study production: one closed-won customer interviewed for the public site

### Quarterly (Constitution SO-25)

- **Competitive scan:** Bali runs the 20-competitor refresh against `competitive_research_log.md`. Material changes trigger MANTHAN re-validation per Constitution §10.3.
- **ICP recalibration:** any ICP with <5% qualification rate gets reviewed; either qualifying criteria tightened or ICP retired
- **Pricing band review:** comparison against competitor pricing landscape; potential band adjustment for next quarter (CEO approval)
- **Renewal pulse check:** all customers in Q+1 renewal window get a CSM/AE health check

---

## 11. Pipeline & Forecasting Discipline

### Stages (CRM-aligned)

| #   | Stage           | Definition                                      | Default conversion → next | Weighted % |
| --- | --------------- | ----------------------------------------------- | ------------------------- | ---------- |
| 1   | **Lead**        | Inbound or AI-Agent-qualified contact           | n/a                       | 0%         |
| 2   | **Qualified**   | Company fits ICP + meets qualifying signals     | 60% → 3                   | 10%        |
| 3   | **Discovery**   | Discovery call held, decision criteria captured | 40% → 4                   | 25%        |
| 4   | **POC/Pilot**   | Pilot scope agreed, contract framework drafted  | 65% → 5                   | 50%        |
| 5   | **Negotiation** | Commercial terms in active negotiation          | 75% → 6                   | 80%        |
| 6   | **Closed-won**  | Signed contract, first invoice issued           | n/a                       | 100%       |
| 7   | **Closed-lost** | Customer chose alternative or no-go decision    | n/a                       | 0%         |

### Hygiene rules (Constitution-graded violations)

- **Every deal must have a next-step date** within 14 days. Anything stale beyond 14 days is auto-flagged at Mon pipeline review.
- **Every deal closing this quarter must have a verbal commitment** — no surprise pulls into Q2 from "verbal" deals that turn out to be wishful.
- **Every deal must have a champion identified** — first name, role, why they care personally.
- **Every deal must have a known dollar/rupee value** — no "TBD" amounts.
- **No deal may be moved to Closed-won without an issued invoice.** Forecast purity > pipeline velocity.

### Forecasting doctrine

- **Commit:** all stage-5 deals + 80% of stage-4 deals. This is the number Bali commits to the CEO each month.
- **Best-case:** all stage-5 + all stage-4 + 50% of stage-3 deals.
- **Worst-case:** all stage-5 + 50% of stage-4.

The CEO uses the Commit number for runway planning. Misses against Commit are reviewed in the next Mon pipeline review with a written postmortem if 2 consecutive months miss.

---

## 12. Competitive Watch (Constitution §10.3 + SO-25)

### The 20-competitor list (cited in `10-Competitive-Capabilities-Consolidated-Final.md`)

Tier 1 platforms: HackerRank, Mettl/Mercer, Codility, HackerEarth.
Modern platforms: Adaface, iMocha, Equip, WeCP (now Invisible — March 2026).
Specialist: Codesignal, Karat (acquired Byteboard Jan 2025), Vervoe, Glider AI, ProveIQ.
Adjacent: TestGorilla, Toggl Hire, Bryq, Hireology, JobTrigger, Refyne.

### What Bali tracks per quarter

Per competitor:

- Public revenue movement
- Hiring signals (HR + content + sales headcount changes)
- Pricing changes >20%
- Library size step-changes >50%
- Founder/CEO transitions
- Funding rounds
- Strategic pivots (e.g., WeCP exited content layer in 2019; reentered as Invisible's training-data play in March 2026)

### MANTHAN re-validation triggers

Per Constitution §10.3, any of these auto-trigger a MANTHAN review of QOrium positioning:

- Any acquisition of a top-20 competitor by a hyperscaler (Microsoft, Google, AWS, etc.)
- Any new entrant raising >$25M with overlapping positioning
- Any top-3 competitor announcing AI-native question generation as a flagship feature
- Any competitor pricing move that drops their effective $/question >30%

When triggered, Bali files the trigger event in `competitive_research_log.md`, calls a MANTHAN session within 7 days, and outputs a positioning amendment to this Playbook (next version).

---

## 13. Customer Success & Renewal Motion

### Onboarding (handed off from sales)

| SKU                        | Onboarding owner      | Duration | Milestones                                                                                                                                                       |
| -------------------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stack-Vault**            | CDO + COM             | 90 days  | Day 0: discovery scoping signed · Day 30: role-graph mapping done · Day 60: first 500 questions delivered · Day 90: full library + Q1 refresh schedule activated |
| **Platform API**           | BD + CDO              | 30 days  | Day 0: API keys issued · Day 7: integration test passed · Day 14: first production traffic · Day 30: usage-fit review                                            |
| **Recruiter Subscription** | AI Agent + self-serve | 7 days   | Day 0: account provisioned · Day 7: first pack downloaded                                                                                                        |

### Health metrics (tracked weekly per customer)

- **Stack-Vault:** quarterly question utilization rate, refresh acceptance rate, leak-detection events caught
- **Platform API:** monthly question fetch volume vs cap, error rate, anti-leak rotation acceptance
- **Recruiter Subscription:** logins/week, packs downloaded/month, reply rate to AI Agent renewal nudges

### Expansion triggers

- **Stack-Vault Department → Enterprise:** when customer hits 80% utilization on Department tier OR adds a 2nd department to scope
- **Platform API Starter → Growth:** when customer hits 80% of monthly cap for 2 consecutive months
- **Recruiter Solo → Team → Agency:** when customer adds 2nd or 6th seat (auto-prompted)

### Renewal cycle

- **Stack-Vault (annual):** AE engages 90 days before renewal date, books renewal call 60 days out, signed amendment 30 days out, no lapse
- **Platform API (annual):** BD engages 90 days before, usage report at 60 days, signed renewal at 30 days
- **Recruiter Subscription (monthly auto-renew):** AI Agent monitors; if 2 consecutive months show <50% baseline activity, AE outreach for retention

---

## 14. Year-1 Targets (Investor Brief reproduced + made operational)

### Quarterly milestones

| Quarter          | Closed-won logos (cumulative) | ARR (cumulative) | Key milestone                                                                                    |
| ---------------- | ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| **Q1 (M0–M3)**   | 8                             | ₹40L             | First Stack-Vault discovery (Bosch); first 5 Recruiter logos via Talpro network; AE+BD onboarded |
| **Q2 (M4–M6)**   | 22                            | ₹1.2 Cr          | First Stack-Vault Enterprise contract signed; 3 Platform Tier 2 logos; 12 Recruiter logos        |
| **Q3 (M7–M9)**   | 44                            | ₹2.3 Cr          | First US platform partnership; 2nd Stack-Vault contract; AI Agent self-serve flow live           |
| **Q4 (M10–M12)** | 66                            | ₹3.5 Cr          | 5th Stack-Vault contract; 30 Recruiter logos; full Y1 plan delivered                             |

### Per-Bali individual targets (Y1)

| Owner             | Quota                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| **CEO**           | 5 Stack-Vault closes, 1 Platform Tier 1, 5 Talpro-warm Recruiter              |
| **AE Enterprise** | 4 Stack-Vault closes (after onboarding M3), 8 mid-market enterprise Recruiter |
| **BD Platforms**  | 3 Platform API closes (1 Tier 1 + 2 Tier 2/3)                                 |
| **AI Agent**      | 17 Recruiter Subscription closes (after launch M2)                            |

---

## 15. Sales-Motion Risks & Mitigations

| Risk                                                | Likelihood | Impact      | Mitigation owner | Specific mitigation                                                                                                                       |
| --------------------------------------------------- | ---------- | ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Bosch procurement >6 months**                     | Medium     | Medium-High | CEO + AE         | JD-Forge Reviewed bridge at $1,999/mo (per O2 above)                                                                                      |
| **Talpro network conversion <expected**             | Medium     | Medium      | Bali             | First 10 calls reveal it; pivot ICP to Bengaluru tech ecosystem direct outbound if Talpro warmth doesn't convert                          |
| **Glider AI undercut on Stack-Vault**               | Medium     | Medium      | CEO + Bali       | Lean on 3 moats: I/O psych validation, India-stack content, Talpro distribution. Don't price-match below floor                            |
| **Stack-Vault Y1 cash flow tight**                  | Medium     | Medium-High | CEO + Bali       | Y1 unit economics are negative-on-day-1 by design (high CAC); diversified motions; Recruiter motion bootstraps to $1M ARR alone if needed |
| **AI Agent false-positive escalation rate >20%**    | Low        | Low         | CTO + Bali       | Weekly Fri review; retrain confidence threshold quarterly                                                                                 |
| **No SOC 2 by M9**                                  | Low        | Medium      | CEO + CTO        | JD-Forge-only contracts as bridge; obligation clauses standard                                                                            |
| **Top-3 competitor announces AI-native generation** | Medium     | High        | CEO + Bali       | MANTHAN re-validation per §12; double down on validation rigor + anti-leak as the moat                                                    |
| **Talpro brand association harms enterprise sale**  | Low        | Medium      | CEO + Bali       | Use O8 counter; offer to anonymize Talpro-as-Customer-Zero references in MSAs                                                             |

---

## 16. Appendix

### 16.1 Key contacts (internal)

- **CEO:** Bhaskar Anand · `bhaskar@talpro.in`
- **CTO Office:** Cowork CTO + (future) Senior Engineer #1
- **CDO (Customer Delivery):** [TBD by M3]
- **COM (Content Ops Manager):** [TBD by M3]
- **AE Enterprise:** [TBD by M3 — see §2 hiring plan]
- **BD Platforms:** [TBD by M3]

### 16.2 Tools

- **CRM:** [TBD — recommend HubSpot Free until M6, migrate to Salesforce when seat count >5]
- **Calendar:** Calendly (founder seat already provisioned)
- **AI Agent infra:** Engineered in-house using Anthropic Claude Opus + n8n on VPS 1
- **Pipeline review:** Whatever the CRM shows, exported to Sheets weekly for offline review

### 16.3 Escalation paths

- **Pricing exception** (any size) → CEO email + log in `competitive_research_log.md`
- **Custom contract terms** → CEO + legal counsel
- **Customer complaint** → AE/BD owns response within 4 business hours; CEO copied if unresolved in 24 hours
- **Deal at risk of closed-lost** → flag in Mon pipeline review with concrete recovery plan
- **Competitor surprise** → §12 trigger evaluation within 24 hours; MANTHAN within 7 days if material

### 16.4 First 30 days for the Bali function (Day 0–30)

A concrete checklist Bali (CEO-led + future AE + BD) executes end-to-end in the first month:

| Day | Task                                                                                                           | Owner                   |
| --- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 0   | Read this Playbook + Constitution + SKU + Investor Brief                                                       | All                     |
| 1   | CRM stood up; ICP lists imported (Talpro Universe network → 50 Recruiter, 30 Enterprise, 20 Platform contacts) | CEO + ops               |
| 3   | First 5 Stack-Vault discovery emails sent (warm intros via Talpro alumni)                                      | CEO                     |
| 5   | Customer Zero pattern: Talpro India onboarded as ReadyBank Recruiter Team customer (internal contract)         | CEO + CTO               |
| 7   | Bosch GCC discovery call booked                                                                                | CEO                     |
| 10  | First Stack-Vault Enterprise commercial template walked through with first procurement (dry run)               | CEO + (future) AE       |
| 14  | First 5 Platform Tier 2 outbound sequences live (Adaface, iMocha, Equip, WeCP, ProveIQ)                        | (future) BD             |
| 20  | First Recruiter Subscription self-serve sale closes via AI Agent flow                                          | AI Agent                |
| 25  | 90-day discovery scoping doc drafted for Bosch                                                                 | CEO + (future) AE + COM |
| 30  | Day-30 pipeline review with full-quarter forecast committed                                                    | CEO + CTO + Bali        |

---

_End of Bali Sales Playbook v1.0. Companion docs: Blueprint v1, SKU Architecture v1, CTO Architecture v1, Constitution v2.0, Investor Brief Pre-A v1. Update cadence: monthly minor (objection patterns, ICP recalibration); quarterly major (competitive watch, pricing band review); annual rewrite (v2.0) at first IdeaForge re-gate (M12)._
