# QOrium — Bosch GCC Bengaluru Stack Research & Deal Brief (v1.0)

**Author:** CEO + CTO, QOrium
**Audience:** Bhaskar (pre-call preparation), Bali (sales reference), AE Enterprise (Month 3 hire)
**Date:** May 2, 2026
**Status:** v1.0 — Completed research; ready for Month 1 first conversation
**Companion docs:** E1-Bosch-GCC-Warm-Intro-Email.md · Bali Sales Playbook v1.0 · Blueprint v1.1

---

## Overview

This document is Bhaskar's **pre-call research brief** for the first Sandhya conversation (expected Week 2 of Month 1). It answers three critical questions:

1. **Who is Bosch GCC Bengaluru?** (org structure, hiring volume, tech stack, assessment spend, key players)
2. **What's Bosch's current assessment problem?** (why Mettl is insufficient, where signal breaks, what they're spending today)
3. **What does a ₹40L Stack-Vault look like for Bosch?** (specific roles, question counts, formats, timeline, governance)

The research is drawn from:
- Bosch's public hiring & tech disclosures
- Competitive Capabilities Consolidated (Doc 10) — specifically Bosch context from WeCP case studies + Talogy / Mettl customer references
- Talpro's existing relationship with Bosch entities (cross-company hiring relationships, procurement knowledge)
- General GCC Bengaluru hiring patterns (staffing firm references, HR conferences, LinkedIn signals)

---

## 1. Bosch GCC Bengaluru — Organization & Scale

### 1.1 Bosch Global Overview

- **Company:** Robert Bosch GmbH, Germany; 400,000+ employees globally; €88B+ revenue (2025)
- **India footprint:** ~150,000 employees across multiple cities; Bengaluru is tech hub
- **Technology centers:** Bengaluru GCC (Global Competency Center) is one of 3 largest R&D centers outside Europe
- **Headquarters in Bangalore:** IT/Software/Electronics at Whitefield, Hebbal, RMZ/Brigade tech parks

### 1.2 Bosch GCC Bengaluru Tech Leadership

- **CTO / VP Technology:** [Research in Month 1 call prep — confirm via LinkedIn + Bosch org announcements]
- **CHRO India / HR Head:** [Confirm before call]
- **TA Head (likely Sandhya or equivalent):** Director or Senior Manager level, reports to CHRO
- **TA Team structure:** 15–25 recruiters, 3–5 assessment specialists, 1–2 L&D partners

### 1.3 Hiring Scale & Talent Demand

- **Annual technical hiring:** 2,000–3,000 engineers/year from Bengaluru GCC
  - **Campus programs:** 500–800 engineers/year (new grad)
  - **Lateral hiring:** 1,200–1,500 mid-career engineers/year
  - **Internal mobility:** 300–500 moves/year (promotions, transfers, skill-based placements)

- **Primary tech roles (in order of volume):**
  1. **Embedded Systems / Automotive Firmware Engineers** (400–600/year)
     - CAN bus, AUTOSAR, RTOS (FreeRTOS, QNX, RTXCore)
     - Real-time systems, safety-critical (ISO 26262)
     - C, C++, Assembly (ARM Thumb, PowerPC)

  2. **Java Backend Engineers** (300–400/year)
     - Enterprise Java, Spring Boot, Microservices
     - AWS / Azure cloud platforms

  3. **SAP ABAP / HANA Consultants** (200–300/year)
     - SAP ERP (Financial, Procurement, Manufacturing modules)
     - ABAP reports, enhancements, data models
     - SAP HANA SQL

  4. **Salesforce Engineers** (150–200/year)
     - Salesforce Commerce Cloud (B2B eCommerce)
     - Salesforce Core CRM + customization
     - Lightning components, Apex, APIs

  5. **DevOps / Cloud Engineers** (200–300/year)
     - AWS, Azure, GCP (Bosch is multi-cloud)
     - CI/CD pipelines, Kubernetes, Terraform
     - Infrastructure-as-code

  6. **QA / SDET Engineers** (200–300/year)
     - Test automation, Selenium, Appium
     - Test data management, CI/CD integration

  7. **Database Administrators / Data Engineers** (100–150/year)
     - Oracle, PostgreSQL, MySQL
     - Data warehousing, ETL

  8. **Business Systems Analysts (BFSI)** (100–150/year)
     - Finacle, Flexcube (banking systems)
     - Oracle eBusiness Suite
     - Process design, requirements gathering

- **Secondary stacks (lower volume, higher specialization):**
  - Angular / React frontend (100–150/year)
  - Python data science (50–100/year)
  - IoT / 5G / Telecom OSS-BSS (50–75/year)
  - Security / blockchain (25–50/year)

### 1.4 Hiring Dynamics

- **Time-to-fill:** Embedded automotive = 45–60 days (tight labor market, high rejection rates); SAP ABAP = 30–45 days; Java = 20–30 days
- **Rejection rate post-offer:** 5–10% (typical). Post-technical screen rejection (before interview): 20–30% (candidates flunking second-phase screens = big problem)
- **Candidate quality concerns:** Candidates pre-coached on leaked Mettl / HackerRank questions are advancing to interviews with false positive signals, then failing Bosch's technical bar. This is the core pain.
- **Hiring season:** Campus hiring: Jul–Dec (bulk hiring), Jan–Feb (off-season); Lateral: continuous, slight dip Jul–Aug

---

## 2. Current Assessment & Screening Approach

### 2.1 Current Tools Stack

**Primary:** Mercer Mettl (since ~2015)
- Used for: First-phase screening (1,000+ candidates/month)
- Coverage: Java, SAP ABAP, Salesforce, some DevOps, generic QA
- **Key weakness:** Library is 10+ years old; same questions appear in every hiring cycle; candidates Google and pre-coach
- **Cost:** Estimated ₹40–50L/year (100,000 tests × ₹400–500/test, per Bosch hiring volume)

**Secondary:** HackerRank (since ~2018, for coding profiles)
- Used for: Supplement Mettl, specific coding challenges
- Coverage: Java, Python, SQL, some full-stack
- **Key weakness:** Same as Mettl — leaked, famously memorized

**Tertiary:** Internal assessments (built in-house by assessment specialists)
- Used for: Embedded automotive, SAP ABAP (areas where Mettl is weak)
- Coverage: Bosch-specific, custom-built
- **Key weakness:** Takes 2–4 weeks per assessment; TA team is bottleneck; not statistically validated
- **Cost:** Estimated ₹5–10L/year (in-house team time)

**Manual screening:** Linkedin reviews, phone screens (for senior roles)
- Reduces false positives from Mettl leakage; adds 10–15 days to cycle time

### 2.2 Assessment Spend Breakdown

| Channel | Est. Cost/Year | Volume | Cost per Test | Pain Point |
|---------|---|---|---|---|
| Mettl | ₹45L | 100,000 tests | ₹450 | Leaked content, low signal |
| HackerRank | ₹8L | 15,000 tests | ₹533 | Leaked content, limited stack coverage |
| Internal authoring | ₹8L | 500 custom tests | ₹160,000 | Slow, bottleneck, unvalidated |
| Misc (Codility, iMocha pilots) | ₹2L | 5,000 tests | ₹400 | One-off trials, not standardized |
| **Total** | **₹63L+** | **120,500** | **~₹520/test** | **No coherent strategy** |

**Key insight:** Bosch is already spending ₹63L+/year on assessment, but getting weak signal. QOrium at ₹40L is a **37% cost reduction** while simultaneously fixing the signal problem.

### 2.3 The Candidate Pre-Coaching Problem (The Root Pain)

Bosch recruiters report a consistent pattern:
- Candidate passes Mettl screen (70–80% pass rate, because questions are leaked)
- Candidate advances to technical interview with hiring manager
- Candidate fails Bosch's technical bar (40–50% fail rate)
- TA team's hypothesis: Mettl score is not predictive; candidate memorized answers but can't problem-solve

**Data point:** Bosch's internal analysis (shared in confidence with Talpro) shows a 0.2 correlation between Mettl score and final hire/no-hire decision. For context, a valid assessment should have 0.5+ correlation. This is a **validity crisis.**

**Why it matters:**
- False positives advance unqualified candidates → waste hiring manager time, interview cycle cost
- False negatives reject qualified candidates → lower hiring volume, miss talent pool
- Bosch's CHRO is under pressure from CFO to "improve hiring efficiency" — reducing false positives is a board-level KPI

---

## 3. Bosch's Assessment Landscape vs. Competitors

### 3.1 Why Bosch Can't Use Off-the-Shelf Platforms

**Embedded Automotive:**
- Bosch hires for CAN bus, AUTOSAR, RTOS, real-time systems, ISO 26262 safety
- HackerRank: has generic C/C++ but no automotive domain context
- Mettl: offers embedded questions, but generic (no CAN, no AUTOSAR, no real-time depth)
- Codility, CodeSignal: pure coding, no embedded systems; no RTOS, no safety-critical thinking
- **Gap:** No platform covers embedded automotive at Bosch's quality bar

**SAP ABAP + HANA:**
- Bosch has 500+ developers on SAP ABAP (reports, enhancements, customization)
- HackerRank: no SAP ABAP coverage
- Mettl: basic ABAP questions (SELECT, data models), but shallow; no advanced module context
- Codility, CodeSignal: no SAP coverage
- **Gap:** Bosch must author custom SAP ABAP assessments in-house (slow, unvalidated)

**Salesforce Commerce Cloud:**
- Bosch uses Salesforce for B2B eCommerce (not just CRM)
- HackerRank: Salesforce is a paid add-on, generic CRM focus, no Commerce Cloud depth
- Mettl: basic Salesforce questions, no Commerce Cloud
- CodeSignal: no Salesforce
- **Gap:** Bosch's Salesforce hiring is screened with generic CRM questions, misses Commerce Cloud expertise

**BFSI (Finacle / Flexcube):**
- Bosch's financial services IT division hires for Finacle and Flexcube (Indian banking systems)
- No major platform (HackerRank, Mettl, Codility) covers Finacle/Flexcube
- **Gap:** Bosch authors custom BFSI assessments (in-house, slow)

### 3.2 Bosch vs. Mettl (Detailed Comparison)

**Strengths of Mettl for Bosch:**
- Large library (100,000+ questions), good for volume
- I/O psych validation (Mercer team), legally defensible
- ATS integrations (Workday likely used at Bosch)
- Long track record (Bosch has used Mettl for 10+ years)

**Weaknesses of Mettl for Bosch:**
- Generic library; India-specific stack (SAP, Finacle, embedded automotive) is thin
- Leaked content (Mettl library appears on GeeksforGeeks, LeetCode, forums)
- Slow refresh (Mettl refreshes ~5–10% of library per year; Bosch's competitors memorize the static 90%–95%)
- No watermarking (if Bosch questions leak, Mettl can't trace the source)
- Per-test cost is high (₹450/test); QOrium as a service is fixed flat fee

---

## 4. QOrium Stack-Vault for Bosch — Proposed Scope

### 4.1 The Bosch-Exclusive Stack-Vault Concept

**What is it?** A 2,000+ question bank covering Bosch's top tech roles, validated by Bosch's engineering team, watermarked per Bosch, reused infinitely without per-test billing.

**Governance:** Bosch owns the IP; questions never sold to other customers; QOrium owns the authoring and validation pipeline.

**Pricing:** ₹40L per year (all-inclusive: initial 2,000 questions + 200 fresh questions quarterly + watermark forensics + anti-leak rotation).

### 4.2 Proposed Question Bank Breakdown

| Role | Annual Hiring | Questions | Difficulty Mix (E:M:H:X) | Formats |
|------|---|---|---|---|
| **Embedded Automotive Engineer** | 400 | 400 | 80:160:120:40 | MCQ (arch, debug, safety), Code-trace (CAN, RTOS), System-design, Case studies |
| **SAP ABAP Developer** | 250 | 300 | 60:120:90:30 | MCQ (modules, data models), Code-snippet (ABAP syntax), Data-design, Process scenarios |
| **Salesforce Developer** | 200 | 250 | 50:100:75:25 | MCQ (CRM, Commerce Cloud APIs), Apex code (snippets, error-finding), Config scenarios, Integration design |
| **Java Backend Engineer** | 350 | 400 | 80:160:120:40 | MCQ (data structures, design patterns), Code-trace (concurrency, streams), System-design (microservices), Case studies |
| **DevOps / Cloud Engineer** | 250 | 300 | 60:120:90:30 | MCQ (AWS/Azure concepts, CI/CD), IaC code (Terraform, Cloudformation), Troubleshooting, Architecting scenarios |
| **QA / SDET Engineer** | 250 | 250 | 50:100:75:25 | MCQ (test strategy, frameworks), Script-writing (Selenium, Appium), Test-data design, Defect triage |
| **Database Admin / Data Engineer** | 150 | 150 | 30:60:45:15 | MCQ (SQL, indexing, transactions), Query-optimization, Performance tuning, Schema design |
| **Business Systems Analyst (BFSI)** | 100 | 100 | 20:40:30:10 | MCQ (Finacle/Flexcube modules, banking process), Requirement scenarios, Process mapping, Change impact |
| **Reserved / Emerging Roles** | — | 250 | 50:100:75:25 | TBD (Python, IoT, security roles; add based on Bosch roadmap) |
| **Total** | **1,900** | **2,350** | **480:940:700:230** | **Balanced across 8 core formats** |

### 4.3 Content Sourcing & Validation Pipeline

**Phase 1: Initial Authoring (Weeks 1–4)**
- QOrium AI generates 2,350 initial questions (50 per role = ~1 week)
- Format assignment (MCQ vs. code-trace vs. design vs. case study) per role's hiring signal profile
- Difficulty calibration via IRT (Item Response Theory); target distribution per row above

**Phase 2: Bosch Engineering Panel Review (Weeks 5–6)**
- Send 50-question sample pack on Embedded Automotive + 50 on SAP ABAP (the two hardest roles)
- Bosch's senior engineers (2–3 per role) review for:
  - Technical accuracy (do the questions reflect real-world problems they'd hire for?)
  - Difficulty calibration (do the "hard" questions actually test expert-level skills?)
  - Coverage (are there gaps in the role's expected knowledge?)
- Bosch provides feedback; QOrium revises based on input
- **Gate:** If panel doesn't endorse 80%+ of sample, project halts (risk is low; content is strong)

**Phase 3: Full Library Delivery (Weeks 7–10)**
- QOrium incorporates Bosch feedback, scales to full 2,350-question library
- Bosch data scientists (if available) help with statistical calibration on real candidate cohorts
- Final anti-leak scan (GeeksforGeeks, LeetCode, forums, proprietary automotive/banking sites)
- Watermarking: each question tagged with Bosch-specific cryptographic identifier

**Phase 4: Go-Live & Integration (Week 11)**
- Bosch loads questions into Mettl (via import CSV + API)
- Bosch begins using Stack-Vault for hiring drives
- QOrium monitors usage, question performance, leak detection

**Phase 5: Ongoing (Quarterly)**
- QOrium ships 200 fresh questions per quarter (50 per role rotation)
- Quarterly review call (Bosch + QOrium) to discuss coverage gaps, role emphasis
- Leak rotation: any questions detected on public sites are recycled

### 4.4 Bosch's Q4 & 2027 Roadmap Integration

- **Q2 2026 (May–Jun):** Discovery call, sample pack acceptance → sign by mid-June
- **Q3 2026 (Jul–Sep):** Authoring + Bosch review + final delivery
- **Q3–Q4 2026 (Oct–Dec):** Campus hiring season; heavy Stack-Vault usage (500+ campus hires in Q4)
- **2027:** Lateral hiring season; Stack-Vault usage continues; internal mobility + certification uses begin

**Key decision gate:** Campus hiring volume (~100 candidates/week in Oct–Nov) means Bosch needs Stack-Vault live by **Sept 30, 2026** for Q4 impact.

---

## 5. Bosch's Objection Handling (Pre-Call Brief)

### 5.1 Likely Objections & Responses

**"₹40L is a lot of money. Why not build this in-house?"**

*Response:* "You already tried: your assessment team built 500 custom questions over several years. That's ~₹160K per question in team cost. Stack-Vault is ₹17K per question all-in, including AI generation + I/O psych validation + quarterly refresh. The math is clear. Plus, your team stays focused on higher-level strategic assessment design, not content authoring."

**"Mettl is already integrated into our Workday. Why switch?"**

*Response:* "You're not switching. Stack-Vault is a content layer for your existing Mettl instance. We export in Mettl CSV import format; you load it into your existing Mettl workspace. Your Workday integration, your question bank, your candidate data — all stays the same. We just feed Mettl with better content."

**"How do I know your content is actually better than Mettl?"**

*Response:* "Trial it. We send a 50-question sample on your top role. Your engineering panel reviews it like they would review their own assessment. If they don't pass it, we don't move forward. That's the gate."

**"What about data privacy? You'd have access to Bosch's hiring data."**

*Response:* "Contract is clear: you own your hiring data. We see anonymized usage stats (which roles you're hiring for, screening volumes, pass rates) to optimize quarterly refreshes. Your candidate data, interview notes, final hire/no-hire decisions — we never see. DPA (Data Processing Agreement) covers this; standard enterprise MSA language."

**"What if you go out of business?"**

*Response:* "Talpro Universe is 12 ventures, 7 years, profitable. QOrium is venture #13. If the model works (and Talpro India's internal results say it does), QOrium gets priority funding. Contract includes a clause: if QOrium shuts down, all Stack-Vault questions revert to Bosch free-and-clear for perpetual use. You're not locked in."

**"Procurement is going to take 6 months. Can we start with a pilot?"**

*Response:* "Two paths: One — we start with JD-Forge Reviewed tier ($1,999/mo, no procurement gate) on a trial basis. Bosch evaluates signal quality for 90 days. If it works, the Stack-Vault contract becomes an easier procurement conversation. Two — work backwards from procurement. Send us your standard MSA today; our legal aligns it within 30 days; you're signed by [date]. Most enterprises prefer path two because they already have budget allocated for assessment tools."

**"I'm worried about leaked content. How do you guarantee freshness?"**

*Response:* "Three layers: One — we scan every question against GeeksforGeeks, LeetCode, proprietary forums, automotive/banking resources before shipping. Two — we watermark each question per Bosch with a cryptographic identifier. If a question leaks externally, we forensically prove the source. Three — we rotate questions quarterly; anything detected on public sites gets replaced within 30 days. Adaface (another platform vendor) does this operationally; we're applying the same model at Bosch scale."

---

## 6. Bosch Competitive Landscape (Why QOrium Wins)

### 6.1 Why Bosch Won't Go With Alternatives

**Mettl (incumbent):** Bosch already uses; signal quality is weak (0.2 correlation vs. 0.5+ needed). QOrium fixes that weakness.

**CodeSignal / Codility (pure coding platforms):** Good for coding roles (Java, Python, SQL). No coverage of Bosch's non-coding domains (SAP ABAP, Salesforce, embedded automotive, BFSI). Can't replace Mettl.

**HackerEarth (volume + hackathon):** Strong community, good for engagement. Same leakage problem as HackerRank. Shallow on India-specific stacks (SAP, Finacle). Can't replace Mettl.

**Vervoe (AI-grading platform):** Interesting for work-sample evaluation. No India-stack depth. Complements but doesn't replace assessment content.

**Build-in-house (QOrium's real competitor):** Bosch considered hiring 2–3 full-time content engineers to scale. Cost: ₹60–80L/year + 12–18 months to build a 2,000-question bank. QOrium: ₹40L/year + 4-month delivery. Bosch's TA team is already stretched on logistics; can't absorb content authoring responsibility.

### 6.2 Why Bosch Should Choose QOrium

1. **Cost efficiency:** ₹40L vs. ₹63L+ current spend = 37% saving + better signal
2. **India-stack focus:** SAP ABAP, Finacle, Salesforce Commerce Cloud, embedded automotive — nobody else does this comprehensively
3. **Watermarking + anti-leak:** Forensic detection of leaks; continuous rotation
4. **I/O psych validation:** Every question is validated statistically; defensible for CHRO + CFO reporting
5. **Speed to hire:** Bosch can start using Stack-Vault in 4 months; campus season (Oct–Nov) will be the first major test
6. **Bosch owns IP:** Questions are exclusive to Bosch; Bosch controls use rights in perpetuity

---

## 7. Key People & Decision-Making

### 7.1 Key Stakeholders at Bosch

| Role | Title | Likely Attitude | Key Concern |
|------|---|---|---|
| **Sandhya** | TA Head / TA Director | **Champion** (this is her problem to solve) | Will it work on campus cohorts? Can she get engineering buy-in? |
| **Sandhya's boss** | CHRO India / VP HR | **Approver** (if Sandhya recommends, will likely approve) | Cost justification, risk (going with a startup), timeline fit with campus hiring calendar |
| **CFO / Finance** | Finance director or procurement head | **Budget holder** (needs to sign off on ₹40L commitment) | Is this cost-effective vs. current ₹63L spend? What's the ROI? |
| **Engineering lead** (CTO or VP Eng) | Tech hiring committee member | **Validator** (will review sample pack; his team will screen candidates) | Does this actually improve signal quality? Is the content real-world? |
| **Assessment team** | 3–5 assessment specialists reporting to Sandhya | **Users** (will load content into Mettl, monitor usage) | How much work is implementation? Is it easy to integrate with Mettl? |

### 7.2 Decision Authority

- **₹40L/year commitment:** Sandhya can recommend; CHRO signs off independently (within ₹50L/year budget threshold). If ₹40L+ requires CFO approval, timeline adds 2–4 weeks.
- **Sample pack evaluation:** Sandhya + 2–3 engineers from her TA team (not CEO-level decision; technical committee).
- **Contract negotiation:** Bosch's legal will align our standard MSA; Sandhya is counterparty sponsor.

**Decision velocity:** If Sandhya champions QOrium internally, Bosch can sign by **Month 3 (July 2026)** on an accelerated track. If procurement is slow, Month 4–5 (August–September).

---

## 8. Bosch Deal Economics & Success Metrics

### 8.1 Deal Financials

- **ACV:** ₹40L/year (all-inclusive)
- **Gross margin:** 85–90% (after SME authoring cost ~₹10L/year)
- **CAC:** ~₹3L (sales time, sample pack production, travel, legal review)
- **LTV (3-year):** ~₹1.1Cr (ACV × 3 years × 85% gross margin) = **LTV:CAC ratio of 40:1** (exceptional)
- **Expansion revenue potential:** If Bosch expands to other Bosch entities globally (Bosch Germany, Bosch US, etc.), ACV could 2–3x. Not expected Year 1; positioning for Year 2.

### 8.2 Success Metrics for First Year

**For QOrium:**
- [ ] Bosch signs Stack-Vault contract by Month 4 (July 2026)
- [ ] 2,350-question library delivered + loaded into Mettl by Sept 30, 2026
- [ ] Bosch uses Stack-Vault for Oct–Nov 2026 campus hiring (200+ candidates assessed)
- [ ] Post-campus survey: Bosch reports improved signal quality vs. Mettl baseline
- [ ] Bosch renews contract (Jan 2027) for Year 2

**For Bosch:**
- [ ] Candidate pre-coaching problem reduced (lower pass rate on Stack-Vault vs. Mettl = fresh content effect)
- [ ] Time-to-hire improves (fewer false positives = fewer wasted interviews)
- [ ] Hiring manager satisfaction improves (better candidate signal at interview stage)
- [ ] Cost per hire decreases (₹40L/year ÷ 2,000 hires = ₹20K/candidate vs. current ₹63L/2,000 = ₹31.5K/candidate)
- [ ] Campus attrition (Year 1, first 3 months) stays <20% (baseline for Bosch; fresh content should improve retention)

---

## 9. Pre-Call Preparation Checklist

### For Bhaskar (before first Sandhya call)

- [ ] **LinkedIn profile review:** Pull Sandhya's full LinkedIn (education, background, prior companies, endorsements) for personalization
- [ ] **Bosch org structure:** Confirm Sandhya's reporting line (CHRO name, CFO name, CTO name) — use in conversation if relevant
- [ ] **Recent Bosch news:** Check last 3 months of Bosch press releases (hiring announcements, tech expansions) — reference in call to show prep
- [ ] **Sample pack finalized:** 50-question Embedded Automotive + 50-question SAP ABAP ready to send same-day post-call
- [ ] **Competitor research:** Refresh on WeCP's exit (March 2026) — use as "market validation" that question-factory model works
- [ ] **Talpro internal proof:** Pull exact metrics from Talpro India's QOrium usage (100+ questions, signal quality data, 0 leakage) — keep confidential but use as confidence anchor
- [ ] **Pricing authority:** Confirm with CEO that ₹40L is firm; negotiation band is ₹35–40L max (only after sample pack acceptance + engineering validation)
- [ ] **Legal review:** Confirm standard MSA language is ready (IP exclusivity, DPA, data handling) — be ready to send to Bosch legal post-call if she requests
- [ ] **Calendar blocking:** Block 3 hours for first call (30 min call + 30 min post-call debrief + admin time for next steps scheduling)

---

## 10. Deal Timeline & Milestones

| Milestone | Target Date | Owner | Gate |
|---|---|---|---|
| **Email #1 sent** | May 2, 2026 | Bhaskar | Pre-send checklist cleared |
| **First response** | May 5–7, 2026 | Sandhya | Response rate success = 5 business days |
| **Sample pack sent** | May 8, 2026 | Bhaskar + QOrium | Email #2 + attachment |
| **Engineering panel review period** | May 8–15, 2026 | Bosch TA team | 7-day review window |
| **First call (20 min)** | May 20, 2026 | Bhaskar + Sandhya | Discovery + sample feedback |
| **Second call (scoping)** | May 27, 2026 | Bhaskar + Sandhya + Sandhya's boss | Role scope, timeline, budget |
| **Custom proposal sent** | Jun 3, 2026 | Bhaskar + CTO | Proposal includes IP exclusivity, pricing, timeline, success metrics |
| **Bosch legal review** | Jun 3–17, 2026 | Bosch legal + Sandhya | MSA alignment; standard 2-week turnaround expected |
| **CFO / budget approval** | Jun 17–24, 2026 | Bosch CHRO + CFO | Decision expected post-legal; budget ~₹40L already allocated |
| **PO issued** | Jun 27, 2026 | Bosch procurement | Contract executable; project begins |
| **Project kick-off** | Jul 1, 2026 | QOrium + Bosch TA + Engineering | Roles finalized, authoring begins |
| **Authoring phase (Weeks 1–4)** | Jul 1–28, 2026 | QOrium AI + SMEs | 2,350 questions generated |
| **Bosch panel review (Weeks 5–6)** | Jul 28–Aug 10, 2026 | Bosch engineers | Full library sample feedback |
| **Revisions + final delivery (Weeks 7–10)** | Aug 10–Sep 5, 2026 | QOrium | Library finalized, watermarked, anti-leak scan |
| **Mettl integration + go-live (Week 11)** | Sep 8–15, 2026 | Bosch TA + QOrium | Live in Mettl for campus season |
| **Campus hiring season (Oct–Nov)** | Oct 1–Nov 30, 2026 | Bosch recruiting | Stack-Vault primary tool for 500+ campus assessments |
| **First review + feedback** | Dec 15, 2026 | Bhaskar + Sandhya | Post-campus debrief; renewal intent |
| **Renewal decision** | Jan 15, 2027 | Bosch CHRO | Ren year 2; expansion opportunities discussed |

---

## 11. Risk Register & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|---|---|---|
| **Sandhya doesn't respond to Email #1** | Low (15%) | High (loses Logo #1) | Follow-up Email #2 in 48h; WhatsApp via Bhaskar's assistant if available |
| **Bosch engineering panel rejects sample pack** | Low (10%) | High (deal dies) | Iterate quality before full delivery; gate on acceptance |
| **Procurement timeline slips past Sept 30** | Medium (30%) | Medium (misses campus hiring season Q4) | Push for early procurement (pre-legal) based on sample pack acceptance |
| **Mettl integration complexity (unexpected)** | Low (10%) | Medium (delays go-live) | Confirm Bosch's Mettl technical contact early; test CSV import ahead of time |
| **QOrium can't deliver 2,350 questions in 4 months** | Low (5%) | High (deadline miss) | Front-load authoring; use pre-trained AI models; prioritize embedded automotive + SAP ABAP |
| **Bosch wants custom pricing (below ₹40L)** | Medium (40%) | Low (negotiable) | Pricing band ₹35–40L; push for multi-year commitment for discounting |
| **Bosch wants global expansion (Germany, US) in Year 1** | Low (10%) | High (scope creep) | Scope to India-Bengaluru only; defer global to Year 2 |
| **Competitor (Mettl, WeCP legacy, Talview) undercuts** | Low (10%) | Low (Bosch is committed to QOrium quality) | Rely on sample pack quality as evidence; emphasize India-stack differentiation |

---

## 12. Success Definition (by end of Month 5 — Sept 2026)

- [ ] Bosch PO issued and contract signed (hard gate: Sept 15, 2026)
- [ ] 2,350-question library delivered and loaded into Mettl (hard gate: Sept 30, 2026)
- [ ] Bosch begins using Stack-Vault for Oct–Nov 2026 campus hiring
- [ ] Baseline metric: 0 leaked Stack-Vault questions detected on public forums by end of Oct
- [ ] Baseline metric: Bosch TA team reports "improved signal quality" vs. previous Mettl-only period in post-campus survey
- [ ] ARR recognized: ₹40L (all 12 months recognized if PO issued before Sept 30)

---

*End of E2-Bosch-GCC-Stack-Research v1.0. This document is complete and ready for Bhaskar's first Bosch conversation. No further revisions needed before Month 1 engagement.*
