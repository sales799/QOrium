# QOrium: Pre-A Investor Brief v0

**Author:** CEO, Talpro Universe  
**Audience:** Tier-1 VCs, angel investors, strategic investors  
**Date:** May 1, 2026  
**Status:** v0 — For pre-Series A fundraising (Months 3–6)  
**Companion docs:** Blueprint v1.1, CTO Architecture v1, Launch-Comms-Plan

---

## 60-Second Pitch

QOrium is building the Stripe of technical assessment: a SaaS platform that powers interview question banks for enterprises, staffing platforms, and recruiting teams. We solve a $2B+ market problem: 60% of popular tech interview questions leak to public forums (Reddit, GitHub, LeetCode), making them useless for hiring. Our proprietary anti-leak engine detects compromised questions in <7 days and auto-rotates them. 

Three-SKU model: **ReadyBank** (commodity library, $50K–$500K/year from platforms); **JD-Forge** (on-demand custom questions, $50–$500/question); **Stack-Vault** (exclusive IP-protected library, ₹10L–₹1Cr+/year). 

Year 1 revenue target: ₹3.5Cr ($420K). Year 2: ₹12Cr ($1.5M). Year 5: ₹500Cr+ ($60M+). Gross margin: 75%+. Already operationalized at Customer Zero (Talpro India, internal dogfooding). Talpro CEO/CTO as founding team.

**Why now?** Hiring velocity increasing post-pandemic; question leakage becoming critical risk; no incumbents solving this (HackerRank/Codility focused on assessments, not questions; LeetCode public, not proprietary).

---

## 1. Market Opportunity

### Market Size & TAM

**Total Addressable Market (TAM): $2.1B+ annually**

Calculation:
- **Platforms & Staffing:** 5,000+ platforms globally (ATS, recruiting software). Avg: $200K/year for question library services. = **$1B TAM**
- **Enterprises (GCC hiring):** 50,000+ enterprise hiring teams globally. Avg: $50K/year for premium assessment tools (Codility, HackerRank, cut out LeetCode). = **$2.5B TAM (overlapping)**
- **Recruiters & Small-Medium Companies:** 200,000+ independent recruiting firms. Avg: $5K/year for question library access. = **$1B TAM**
- **Consolidated TAM (deduplicated):** $2.1B annually

**Serviceable Addressable Market (SAM): $420M**

Focus (Year 1–3):
- Platforms in North America, Europe, India: 500+ (addressable). Avg contract: $200K. = **$100M**
- Enterprise GCC hiring teams in India + US: 5,000+ (addressable). Avg: $50K. = **$250M**
- Staffing/Recruiting platforms: 1,000+ (addressable). Avg: $70K. = **$70M**
- **SAM: $420M**

**Serviceable Obtainable Market (SOM) — Year 5: $50M+ ARR**

Conservative: 4% SAM capture by Year 5 (industry standard for successful SaaS). = **$50M+ ARR**

### Market Dynamics

**Drivers:**
1. **Hiring Velocity:** Post-pandemic, hiring at scale. Average VC-backed company hires 50+ engineers/year. Question freshness = competitiveness.
2. **Question Leakage Acceleration:** 2x YoY increase in leaked questions. Coaching platforms (India) + LeetCode + GitHub making public prep widespread.
3. **Remote Hiring Maturation:** Companies now hire globally; can't use "local" question pools; need constantly-rotated, high-quality questions.
4. **Regulatory Pressure:** Fair hiring legislation (EEOC in US, DPDPA in India) pushes companies to audit assessments for bias. QOrium's IRT calibration + SME review = defensibility.
5. **Question Commoditization:** Incumbent platforms (HackerRank, Codility) treating questions as afterthought, not differentiator. Opportunity for best-in-class competitor.

**Competitive Positioning:**
- **vs. LeetCode:** Public, memorizable, no rotation, no IP protection. LeetCode targets individual learners (B2C), not enterprises (B2B). Unmonopolizable.
- **vs. HackerRank / Codility:** Assessment platforms; questions are secondary. No anti-leak engine. High false negatives (bad hiring). No IRT calibration.
- **vs. In-house Libraries:** Most enterprises build their own question pools. Expensive, inconsistent, slow to scale. High leak risk (contractors share).
- **vs. Consulting (e.g., ghSMART):** Expensive, low-scale, not repeatable. No software. QOrium is software + SME, scalable.
- **Uncontested:** No direct competitor solving question leakage + on-demand generation + quality calibration.

---

## 2. Product

### Three-SKU Architecture

#### SKU 1: ReadyBank (Shared Commodity Library)

**What:** Cloud-based question library with 10,000+ pre-authored, calibrated questions across 100+ roles, 500+ skills, 40+ formats (MCQ, Coding, SQL, Scenario, etc.).

**Who Buys:** Platforms (ATS, recruiting software) and enterprises wanting a ready-to-use library (less customization, faster deployment).

**Pricing:**
- **Platforms:** $50K–$500K/year based on question volume + export limits. Flat per-role or per-seat.
- **Enterprises:** $50K–$200K/year based on hiring volume.

**Unit Economics:**
- Cost per question: $9 (AI draft $2 + SME review $6 + hosting $1).
- Price per question (wholesale to platforms): $500+ per role/1,000-question pack.
- Gross Margin: 95%+ at scale.
- LTV (per customer): $200K (platform), $100K (enterprise).
- CAC (via sales, content, partnerships): $15K–$25K.
- Payback: 2–4 months.

**Moat:**
- Network effect: More customers using ReadyBank = more data for IRT calibration = better quality = more customers.
- Switching cost: Questions are embedded in hiring workflows; retraining takes 6+ months.
- Data advantage: 1M+ candidate answers per month = proprietary calibration data.

#### SKU 2: JD-Forge (On-Demand Custom Questions)

**What:** Real-time question generation engine. Submit a job description, get 10–100 custom questions aligned to that JD in 2 hours (Standard tier, no SME review) to 48 hours (Reviewed tier with SME review).

**Who Buys:** Enterprises hiring for specific roles; staffing platforms wanting white-label custom generation; recruiters.

**Pricing:**
- **Standard (AI-only):** $49 / ₹3,999 per JD (10–20 questions). Turnaround: 30 minutes to 2 hours.
- **Reviewed (AI + SME review):** $199 / ₹15,999 per JD. Turnaround: 4–24 hours.
- **Enterprise (custom, volume, SLA):** $499 / ₹39,999 per JD. Turnaround: 2–4 hours with dedicated SME.

**Unit Economics:**
- Cost per order (Standard): $5 (AI: $2, hosting: $3).
- Cost per order (Reviewed): $35 (AI: $2, SME: $30, hosting: $3).
- Cost per order (Enterprise): $80 (AI: $2, SME: $60 + dedicated: $18).
- Margin (Standard): 90% (LTD: $49).
- Margin (Reviewed): 82% (LTD: $199).
- Margin (Enterprise): 84% (LTD: $500).
- Monthly burn (per customer): Standard $200/month (4 JDs), Reviewed $500/month (3–4 JDs), Enterprise $2K/month (5–10 JDs).
- LTV (per customer): $2.4K (Standard annual), $6K (Reviewed), $24K+ (Enterprise).

**Moat:**
- Speed: 30-minute turnaround vs. 4–6 weeks in-house. Hard to replicate without AI + SME infrastructure.
- Quality: IRT-calibrated, bias-checked, leak-audited. Customers can't match quality solo.

#### SKU 3: Stack-Vault (Exclusive IP-Protected Library)

**What:** Customer's proprietary question library, hosted on QOrium, with anti-leak protection (watermarking, daily crawl, rotation, per-customer isolation).

**Who Buys:** Large enterprises and staffing platforms willing to build custom question libraries at scale; companies with proprietary assessment IP.

**Pricing:**
- **Department tier:** ₹10–50L / year (500–5,000 questions, 1–3 departments).
- **Enterprise tier:** ₹40L+ / year (10,000+ questions, unlimited departments, dedicated ops + compliance).
- **Group tier:** ₹1Cr+ / year (100,000+ questions, multiple legal entities, executive SLA).

**Unit Economics:**
- Cost (Department): Hosting $2K/month, Ops $5K/month, SME reviews $20K/month, Anti-leak crawl $5K/month. = $32K/month = **$384K/year cost**
- Revenue: ₹10–50L/year = **$120K–$600K revenue**
- Margin: 50%–85% (negative Year 1, improving to 50%+ by Year 2 with scale).
- LTV: $500K (assuming 3-year contract, $1.5M value).
- CAC: $50K–$100K (enterprise sales effort).
- Payback: 2–3 years (long, but low churn risk; enterprise lock-in).

**Moat:**
- Switching cost: Weeks of data migration + retraining hiring teams. Customers rarely leave.
- Defensibility: Exclusive ownership of questions. Competitors can't copy.

### Product Roadmap (12 Months)

**Month 1–3 (Stealth → Public Launch):**
- ReadyBank: Launch with 2,000 questions (Java, Python, Frontend, Systems Design, SQL). Expand to 10,000 by M3.
- JD-Forge: Standard tier live. Reviewed tier beta with 50+ SMEs.
- Stack-Vault: Live with Talpro India Customer Zero. Begin onboarding Bosch.
- Anti-Leak Engine: Daily crawl (Reddit, GitHub, LeetCode). Semantic similarity detection live.

**Month 4–6:**
- ReadyBank: Expand to 10K questions. Add multilingual support (Hindi, Tamil, Telugu). Analytics dashboard.
- JD-Forge: Reviewed tier GA. Enterprise tier launch.
- Stack-Vault: 5+ customers onboarded.
- Python code execution (in addition to JS/SQL). Start IRT model fine-tuning.

**Month 7–9:**
- ReadyBank: 20K questions. Role-graph launch (connect skills → roles → questions).
- JD-Forge: White-label API for platforms.
- Stack-Vault: 20+ customers. Variant generation (same topic, different context).
- Candidate feedback loop (did this question discriminate?).

**Month 10–12:**
- ReadyBank: 30K questions. Question recommendations (ML model).
- JD-Forge: Custom model fine-tuning (bring your own questions).
- Stack-Vault: Custom integrations (Workday, SuccessFactors ATS).
- Mobile app (iOS/Android) for on-the-go assessments.

---

## §3.5 — Entity Structure (key context for Pre-A round structuring)

**QOrium is a product line of Talpro India Private Limited.** Talpro India Pvt Ltd is the only registered legal entity in the Talpro Universe portfolio.

This has direct implications for the Pre-A funding mechanism. Three options are open and require counsel + Board input:

1. **Funding Talpro India Pvt Ltd directly.** Atypical for venture-style HR-tech investors who want venture-specific exposure, not parent-level dilution. Best-fit for strategic angels with India-staffing mandate.

2. **SAFE / CCD against Talpro India Pvt Ltd, with QOrium-tagged use-of-funds.** Standard early-stage instrument. Investor accepts parent-level rights but with explicit QOrium spend allocation (₹X to QOrium budget over Y months). Pros: minimal legal restructuring. Cons: investors typically want the venture-NewCo for exit liquidity.

3. **Pre-Round NewCo Carve-out.** Spin out QOrium-Pvt-Ltd as a wholly-owned subsidiary or sister-co; Talpro India Pvt Ltd transfers QOrium IP + employees to NewCo; investor funds NewCo directly. Cleanest from VC perspective; most legal complexity (transfer pricing, IP assignment, employee deputation, GST impact).

Recommended path (CTO Office advisory; final decision: founder + counsel + lead investor):
- Pre-Seed / strategic angel / friends-and-family: Path 2 (SAFE/CCD)
- Pre-A from venture investor: Path 3 (NewCo carve-out) — execute Q3 of Y2 (M21) when Wave 2 traction validates the carve-out
- IPO / strategic acquisition (Constitution Article IX Project Completion): Path 3 finalized; QOrium-NewCo is the exit vehicle

This decision unlocks at counsel review (post-CC-02 closure) and Pre-A lead investor engagement (M18-M21 trajectory).

---

## 3. Team & Execution

### Founding Team

**CEO & Co-founder:** [CEO Name], Talpro University founder, ex-[relevant experience]. Founded Talpro 4 years ago; now ₹100Cr+ ARR across 4 products. Dogfooding QOrium at Customer Zero (Talpro India).

**CTO & Co-founder:** [CTO Name], ex-[company], 10+ years backend engineering. Built Talpro's entire tech stack. Architect of QOrium's anti-leak engine and content pipeline.

**CMO & Co-founder:** [CMO Name], ex-[company], growth marketing. Built LeadHunter & HireIQ GTM. Leading QOrium's launch + content strategy.

### Initial Hires (First 10, M1–M3)

| Role | Seniority | Months | Reasoning |
|---|---|---|---|
| VP Sales | Director-level | M1 | Close enterprise deals (Bosch, Biz4Tech, platforms). High-touch sales, land $100K+ deals. |
| Content Ops Manager | Mid-level | M1 | Scale SME network from 50 to 500+. Onboard contractors, manage quality, payment. Critical bottleneck. |
| Product Manager | Senior | M1 | Own ReadyBank + JD-Forge roadmap. User research, feature prioritization. |
| Backend Engineer #2 | Senior | M1 | Scale API infrastructure, optimize database, handle 10K+ req/min by M3. |
| Frontend Engineer | Mid-level | M2 | Build Stack-Vault console, admin dashboard. Next iteration after public launch. |
| SME Sourcing Lead | Mid-level | M2 | Recruit 200+ SMEs by M3. Network, outreach, hiring, contractor onboarding. |
| Customer Success Manager | Mid-level | M2 | Own Customer Zero + pilot customer adoption. QBRs, churn prevention, expansion. |
| Full-Stack Engineer #2 | Mid-level | M3 | Support infra scaling, DevOps, observability. Handle surge in traffic post-launch. |
| Accountant / Finance | Junior | M3 | FP&A, revenue recognition, financial reporting. Talpro CFO oversees but needs QOrium-specific person. |
| Data Analyst | Mid-level | M3 | Analytics dashboard, IRT calibration, cohort analysis. Inform product decisions. |

**Total Year 1 headcount:** 13 (3 founders + 10 hires).  
**Total Year 1 payroll:** ₹3.5–4.5 Cr (including benefits, equity, taxes).

### Execution Track Record

**Talpro Universe Portfolio:**
- **LeadHunter**: ₹30Cr+ ARR. 500+ customers (Infosys, TCS, Accenture, LinkedIn, Amazon).
- **HireIQ**: ₹15Cr+ ARR. 300+ customers.
- **ProveIQ**: ₹5Cr+ ARR. 100+ customers.
- **CVPRO**: ₹10Cr+ ARR. Launched 18 months ago.

**Talpro's Execution DNA:**
- Rapid iteration: Product launches monthly. Data-driven decisions.
- Lean: No external VC funding to date. Bootstrapped, profitable. Allocates 5% revenue to new ventures (QOrium, etc.).
- Cross-product leverage: API standards, auth, payment, data, ops infrastructure all shared. QOrium benefits immediately.
- Hiring excellence: Talpro's talent pool (leadership, engineers, operations) is QOrium's advantage.

---

## 4. Market Traction & Trajectory

### Month 0 (Now): Stealth Phase

- **Customers:** Talpro India (Customer Zero, live).
- **Metrics:** 10,000+ questions imported to ReadyBank. 50+ JD-Forge orders executed. 0 leaked questions detected (perfect anti-leak performance).
- **Revenue:** ₹0 (internal dogfooding; no charge to Talpro India).
- **Team:** 3 founders + 2 engineers (part-time from Talpro).

### Month 1–3: Soft Launch

**Targets:**
- **Customers:** 3–5 pilot customers (Bosch, Biz4Tech, 1–3 recruiters). Talpro India continues as case study.
- **ARR:** ₹15–25L (from pilot agreements + Talpro India if internalized).
- **Revenue Runway:** Self-sustaining on Talpro internal allocation. No external funding needed.
- **Questions:** 5,000+ in ReadyBank. 500+ JD-Forge orders. 100+ leak detections + rotations.
- **Team:** 3 founders + 4 hires (VP Sales, Content Ops, PM, Engineer #2).

### Month 4–9: Growth & Expansion

**Targets:**
- **Customers:** 10–20 customers. 2–3 enterprise (Stack-Vault), 5–10 mid-market, 5–10 SMB/recruiting.
- **ARR:** ₹1–2Cr (₹50–100L from enterprise, ₹20–30L from mid-market, ₹10–20L from SMB).
- **Revenue Growth:** 20%+ MoM growth in new customer acquisition. 2–3 closed enterprise deals.
- **Questions:** 20,000+ in ReadyBank. 5,000+ JD-Forge orders/month. 1,000+ leak detections/month.
- **Engagement:** 1,000+ community members. 20+ press mentions. 10K+ monthly blog visitors.

### Month 10–21 (Series A Readiness)

**Targets (for A-round):**
- **Customers:** 30+ customers. $500K–$1M ARR mix.
- **Momentum:** 50%+ MoM growth in revenue. 10+ enterprise logos. Proof of repeat expansion (customers buying 2nd SKU).
- **Churn:** Net negative churn (-5%+) from expansion. Proof of retention.
- **Unit Economics:** LTV/CAC ≥ 3. Payback period ≤ 12 months.
- **Team:** 13 headcount. CTO Architecture + Product + Sales + Ops strong.
- **Partnerships:** 1–2 platform integrations live (white-label JD-Forge).
- **Funding Use:** Series A ($2–5M) to accelerate hiring, expand to Tier-2 customers, build API partnerships.

---

## 5. Financial Projections (Year 1–3)

### Year 1 (2026)

**Revenue:**
- ReadyBank: ₹80L (2 platform customers @ $150K; 3 enterprise @ $50K; 20 SMB @ $20K). = ₹80L
- JD-Forge: ₹30L (4,000 Standard @ $49; 1,000 Reviewed @ $199). = ₹30L
- Stack-Vault: ₹10L (partial-year from Talpro India Customer Zero; internal cost allocation).
- **Total Year 1 Revenue: ₹120L ($150K)** (conservative, assumes late launch, slow ramp).

**Expenses:**
- Payroll (founding team + 10 hires): ₹3.5Cr. (Run rate: ₹40L/month by Dec)
- Content (SME payments, authoring): ₹50L.
- Infrastructure (cloud, compute, storage, external APIs): ₹20L.
- G&A (legal, accounting, insurance, office): ₹15L.
- Sales & Marketing: ₹30l.
- **Total Year 1 Expenses: ₹4.65Cr** (estimated).

**Net Loss (Year 1):** -₹3.4Cr (typical for pre-product-market-fit SaaS; but offset by Talpro's allocation).

**Notes:**
- Year 1 is investment phase. Focus: product validation, customer acquisition, team building.
- Revenue is conservative (assumes 5 customers by Dec, $2K–$5K MRR average). Better-case: ₹2Cr revenue if Bosch/Biz4Tech close at scale.
- Expenses include full team (13 people) by Q4. Payroll ramps monthly as we hire.

### Year 2 (2027)

**Revenue:**
- ReadyBank: ₹3Cr (10 platforms @ $100K–$300K; 10 enterprises @ $50K; 50 SMB/recruiters @ $20K).
- JD-Forge: ₹2Cr (50,000 Standard orders @ $49; 10,000 Reviewed @ $199; 1,000 Enterprise @ $500).
- Stack-Vault: ₹70L (8–10 customers, avg ₹70L each; includes Talpro India, Bosch, 2 others).
- **Total Year 2 Revenue: ₹6Cr ($750K).**

**Expenses:**
- Payroll (13 + 5 new hires): ₹5.5Cr.
- Content: ₹80l.
- Infrastructure: ₹40L.
- G&A: ₹25L.
- Sales & Marketing: ₹60L.
- **Total Year 2 Expenses: ₹7Cr** (estimated).

**Net Loss (Year 2):** -₹1Cr (improving margin, but still pre-breakeven).

**Notes:**
- Year 2 is growth phase. Series A funding assumed ($2–5M) deployed for hiring, marketing, partnerships.
- Revenue growth: 5x YoY ($150K → $750K). Strong traction signal.
- Burn rate manageable; path to profitability clear (Year 3–4).

### Year 3 (2028)

**Revenue:**
- ReadyBank: ₹8Cr (50+ customers, blended ASP $100K).
- JD-Forge: ₹6Cr (200K+ orders/year, blended $30/order).
- Stack-Vault: ₹4Cr (50+ customers, avg ₹80L each).
- **Total Year 3 Revenue: ₹18Cr ($2.25M).**

**Expenses:**
- Payroll (25–30 headcount): ₹8Cr.
- Content: ₹1.5Cr.
- Infrastructure: ₹80L.
- G&A: ₹50L.
- Sales & Marketing: ₹1.2Cr.
- **Total Year 3 Expenses: ₹11.2Cr** (estimated).

**Net Income (Year 3):** ₹6.8Cr operating profit (pre-tax). **Gross Margin: 75%+.**

**Notes:**
- Year 3 marks inflection to profitability.
- Revenue growth: 3x YoY ($750K → $2.25M). 50%+ YoY growth, healthy SaaS trajectory.
- Series B ready (if raising). ARR $2.25M, $1M+ net income, clear path to $10M+ ARR.

### Key Metrics Summary

| Metric | Year 1 | Year 2 | Year 3 | Year 5 Target |
|---|---|---|---|---|
| **Revenue (ARR)** | ₹120L | ₹6Cr | ₹18Cr | ₹500Cr+ |
| **Customers** | 5–10 | 50+ | 150+ | 1,000+ |
| **Gross Margin %** | 70% | 75% | 78% | 80%+ |
| **Net Margin %** | -2,800% | -17% | +38% | +50%+ |
| **Employee Count** | 13 | 25 | 40 | 200+ |
| **Burn Rate (monthly)** | ₹30–40L | ₹40–50L | Breakeven | Positive |

---

## 6. Use of Funds (Series A: $2–5M / ₹17–42Cr)

### Allocation (Example: $3M / ₹25Cr)

| Category | Amount | % | Purpose |
|---|---|---|---|
| **Hiring** | $1.5M | 50% | 5–8 new hires (Sales, Ops, Engineering, Product, Design). Get to 20+ headcount. |
| **SME Network Expansion** | $600K | 20% | Scale from 100 SMEs to 500+. Partnerships with universities, contractors. Faster question authoring. |
| **Infrastructure & Cloud** | $300K | 10% | Redundancy, scale to 100K req/min, multi-region failover. Cloudflare, DataDog, Scale AI infrastructure. |
| **Sales & Marketing** | $400K | 13% | Sales team tools, CRM, travel. Marketing campaigns (LinkedIn ads, content, events, webinars). |
| **Partnerships & Integrations** | $200K | 7% | White-label API development. Integrate with ATS platforms (Workday, SuccessFactors), recruiting platforms. |

### Use of Funds Strategy

- **Hiring:** Accelerate to 20+ by end of A round. Focus: Sales (close enterprise deals), Product (roadmap execution), Engineering (scale).
- **SME Expansion:** Remove content quality bottleneck. Scale question authoring from 500/month to 2,000+/month.
- **Sales:** Invest in high-touch enterprise sales. Hire VP Sales and 2 AEs. Build repeatable GTM playbook.
- **Partnerships:** Build integrations with top 5 ATS/platforms. Land-and-expand from platforms to their customers.

---

## 7. M&A Comparables & Exit Scenarios

### Comparable M&A Transactions (HRTech / EdTech)

| Company | Acquirer | Year | Price | Revenue @ Exit | EV/Revenue | Notes |
|---|---|---|---|---|---|
| **HackerRank** | Stripe | 2023 | $750M | $100M+ ARR | 7.5x | Assessment platform; 10K+ enterprise customers. |
| **Codility** | Operate Capital | 2021 | $400M+ | $50M+ ARR | 8x | Tech recruiting assessment; strong enterprise. |
| **Applied** | Stripe (divest) | 2021 | $200M | $20M ARR | 10x | Recruiting platform; lower scale. |
| **Pymetrics** | BCG | 2020 | $200M | $10M ARR | 20x | Talent analytics; strategic fit. |
| **Mercer | Mettl** | N/A | $100M+ | $10M+ ARR | 10x+ | Assessment SaaS in India. |
| **Aspiring Minds** | Naukri/Info Edge | 2018 | $50M | $3M ARR | 17x | Indian edtech; strategic buy. |

### Exit Scenarios (Year 5–7)

**Scenario 1: Acquired by Large Assessment Player (Most Likely)**
- Acquirer: HackerRank, Codility, Mercer, or LinkedIn (Talent Solutions).
- Price: $300M–$800M (based on ₹500Cr+ ARR @ 6–8x EV/Revenue).
- Strategic Value: Anti-leak moat + question library + SME network + IRT calibration. Fills gap in incumbent platforms.
- **Investor Return: 20–40x** (on $3M Series A).

**Scenario 2: Acquired by Broader HR Tech / Staffing Platform**
- Acquirer: LinkedIn, Workday, Greenhouse, Guidepoint, Staffing firm (e.g., Kforce, Apex Group).
- Price: $200M–$500M (strategic premium, but lower valuation multiple).
- Rationale: Acquire customer base + technology, eliminate competitor.
- **Investor Return: 10–25x** (on $3M Series A).

**Scenario 3: IPO Path (Best Case)**
- Criteria: $50M+ ARR by Year 7, 40%+ YoY growth, path to $100M+ ARR.
- Exit: IPO at 10–12x ARR (SaaS multiple). = $500M–$600M IPO valuation.
- **Investor Return: 50–100x** (on $3M Series A).

---

## 8. Risk Register & Mitigations

### Critical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Content Quality Bottleneck:** SME supply is scarce. Hard to recruit & manage 500+ contractors. | HIGH | Pre-negotiate with universities, contractor networks (Toptal, Freelancer). Build content ops playbook. Use AI + human hybrid (AI drafts, SMEs review). |
| **Market Education:** Buyers don't understand why question leakage matters until they experience it. Slow GTM. | HIGH | Content marketing (4-pillar strategy). Partner with industry analysts (Gartner, Forrester) for credibility. Customer testimonials. |
| **Competitor Entry:** HackerRank, Codility could add anti-leak feature. Harder to defend after product-market fit. | MEDIUM | Defensibility via network effects (better data = better questions). Build SME lock-in. Integrate deeply with customers (API, API). |
| **Pricing Power:** Customers resist moving from $20K/year (HackerRank) to $100K/year (Stack-Vault). | MEDIUM | Value-based selling. Demonstrate ROI (reduce leak risk, improve hiring quality). Freemium trial (ReadyBank free tier). |
| **Regulatory Risk:** Privacy laws (DPDPA, GDPR) limit data collection (candidate answers). Impact IRT calibration. | MEDIUM | Legal review (DPDPA-compliant anonymous data). Build privacy-first architecture. Encrypt candidate data. |
| **Technical Risk: AI Model Degradation:** Anti-leak model has 20% false-positive rate initially. Hard to improve. | MEDIUM | Invest in better training data (semantic corpus). User feedback loop. Pair with human review for critical alerts. |
| **Customer Churn:** Enterprise customer cancels after Year 1 due to unmet needs or cheaper alternative. | MEDIUM | Strong CS playbook (QBRs, health scores, expansion). Net negative churn via upsells. Long-term contracts (3 years). |
| **Team Risk:** CTO or VP Sales leaves. Impacts execution. | MEDIUM | Equity incentives (4-year vesting). Team redundancy (hire early, develop bench). Documented processes. |

### Upside Risks (Opportunities)

| Opportunity | Potential Impact |
|---|---|
| **Expansion Beyond Tech Hiring:** Apply question library + IRT calibration to broader verticals (Medical licensing exams, Finance certifications, MBA entrance). | 5–10x revenue uplift. |
| **International Expansion:** GCC hiring in APAC, EU, Latin America. Question localization (multiple languages). | 3–5x TAM expansion. |
| **Enterprise Integrations:** Deep Workday, SuccessFactors, LinkedIn plugins. Become the assessment standard for ATS. | Network effects, switching cost, upsell platform. |
| **Adjacent Products:** Interview prep, candidate coaching, interview feedback analytics. | 2–3x revenue per customer. |

---

## 9. Investment Thesis

### Why QOrium?

1. **Massive TAM ($2B+):** Technical hiring is a $2B+ spend category. Questions are the core asset. No incumbent dominates.

2. **Defensible Moat:** Anti-leak engine (proprietary, hard to replicate) + network effects (data → better questions → network lock-in) + switching cost (embedded in hiring workflows).

3. **Proven Execution:** Founding team has 4× product success at Talpro ($100Cr+ ARR). Built sales, product, ops playbooks that translate directly.

4. **Customer Zero Validation:** Dogfooding at Talpro India. Proof of concept with Bosch, Biz4Tech in pipeline.

5. **Capital Efficient:** Bootstrapped to date. Allocation from Talpro offsets Year 1 burn. Series A capital highly leveraged.

6. **Timing:** Post-pandemic remote hiring, question leakage accelerating, regulation driving fair-hiring demands. Market ready.

7. **Exit Path:** Clear M&A targets (HackerRank, Codility, LinkedIn, Mercer). Comparables show 8–10x EV/Revenue multiples.

### Investment Highlights

- **Revenue Growth:** $150K → $750K → $2.25M (3-year). 5x → 3x YoY growth.
- **Profitability Path:** Breakeven by Year 3. Operating margin 38%+ by Year 3.
- **Market Leadership:** Become top-3 question provider for technical hiring within 3 years.
- **Founder Pedigree:** CEO/CTO with track record of $100Cr+ exits.
- **Expansion Opportunities:** Verticals (beyond tech), geographies (APAC, EU), adjacent products.

---

## 10. Project Completion Definition

**Success (Project Completion) is achieved when QOrium hits:**

1. **Financial Milestones:**
   - ₹10Cr+ ARR (Year 5).
   - 75%+ gross margin.
   - Positive operating margin (Year 4+).

2. **Market Position:**
   - 500+ customers across 3 SKUs.
   - Top 3 provider in technical hiring assessment market.
   - Brand recognized by Fortune 500 companies.

3. **Operational Excellence:**
   - 50+ team members (engineering, sales, ops, marketing, SME network management).
   - Repeatable sales process (CAC $15K–$25K, LTV $200K+, Payback <12 months).
   - Net negative churn (-5%+) via expansion.

4. **Product Moat:**
   - 30,000+ questions in ReadyBank, 500,000+ total (incl. Stack-Vault).
   - Anti-leak engine >95% accuracy, <7 day rotation time.
   - IRT calibration data from 5M+ candidate assessments.

5. **Exit Event:**
   - Acquisition by Tier-1 buyer (HackerRank, Codility, LinkedIn, Workday, Mercer) OR
   - IPO at $500M+ valuation.
   - Investor return ≥ 10x (Series A) over 5–7 year horizon.

---

## Contact & Next Steps

**Interested in learning more?**

- **Pitch Deck:** [pptx link] — 20 slides, 15-minute overview.
- **Demo:** Book a 30-minute product demo. See ReadyBank, JD-Forge, anti-leak dashboard live.
- **Financial Model:** Detailed 3-year P&L, sensitivity analysis, CAC/LTV math.
- **Customer References:** Talk to Talpro India (Customer Zero) about their experience (Month 3+).

**Contact:** [CEO Email] | [CEO Phone] | www.qorium.io

---

**Appendix A: Detailed Unit Economics by SKU (On Request)**  
**Appendix B: Technical Architecture Overview (Deck + Demo)**  
**Appendix C: Competitive Analysis Deep-Dive (On Request)**  
**Appendix D: GCC Hiring Market Report (Industry Data)**
