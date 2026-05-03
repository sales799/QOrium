# QOrium — Document 4 of 4
# QOrium Blueprint v1 — The Operating Thesis

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Date:** May 1, 2026
**Status:** Draft v1.0 — for IdeaForge gate review

---

## Reading Guide

This blueprint operationalizes everything from Documents 1, 2, and 3 into an actionable plan. It is the single document a team would use to actually go build QOrium. Sections:

1. **Identity & Vision** — the company in one paragraph
2. **The USP — Three-Sentence Version** — the elevator pitch
3. **Product Architecture** — content engine + 4 delivery modes + 3 buyer packages
4. **Pricing & Unit Economics** — by segment, with target gross margins
5. **GTM Strategy** — three parallel motions, sequenced
6. **12-Month Roadmap** — what ships, when, with success metrics
7. **Team & Hiring Plan** — first 10 hires
8. **The Moats** — defended on day 1, deepened over years
9. **Operating Cadence & Governance** — how the company is run
10. **Risk Register** — what kills QOrium and how we prevent it
11. **The 5-Year North Star** — what success looks like

---

## 1. Identity & Vision

### Name
**QOrium** (capital Q + capital O; "Q" for Question, "Orium" connotes a place/hub of curated content — like an arboretum of questions; pronounced "kore-ee-um"). Working name confirmed by CEO May 1, 2026.

### Tagline (working)
**"The world's question bank for hiring."**

### One-Paragraph Identity

QOrium is the world's first **enterprise-grade Question-Bank-as-a-Service** for the assessment industry. We don't run assessments — we supply the questions that power the assessments other platforms run. Every question is AI-authored, I/O-psychologist-validated, anti-leak-rotated, role-graph-tagged, and available in any of the 20 major platform import formats. Our customers are the assessment platforms themselves (HackerRank, Mettl, HackerEarth, iMocha, WeCP, Adaface, Vervoe, etc.), large enterprises and GCCs that need confidential white-label question packs, and IT staffing firms that need fresh content per client engagement. We are headquartered in India because the world's largest assessment-volume market sits in our backyard, our cost-to-validate is half the global average, and our existing Talpro Universe network is our distribution and SME pool from Day 1.

### Vision (10-year)

Every coding question, MCQ, SJT, and simulation administered in a hiring assessment somewhere in the world should — by 2036 — have a non-trivial probability of being authored, calibrated, or anti-leak-rotated by QOrium. We want to be the **AWS S3 of assessment content**: invisible, indispensable, and underneath everything.

### Mission (3-year)

Make QOrium the obvious, defensible answer to "where does your platform get its content?" for at least **50 assessment platforms, 200 enterprise customers, and 500 staffing firms** by end of FY2029.

---

## 2. The USP — Three-Sentence Version

> **QOrium is the only company in the world that combines AI-speed authoring with I/O-psychologist-grade validation, runs a continuous anti-leak rotation engine, organizes every question in a normalized role-graph, and ships it to any assessment platform's import format via a single API. We don't compete with HackerRank, Mettl, or Codility — we make their content libraries better, fresher, and harder to leak. We are the content layer the entire $30 billion talent assessment industry was missing.**

---

## 3. Product Architecture

QOrium is one engine, four delivery modes, three buyer packages, and one library. Below: the architecture.

### 3.1 The Content Engine (the "factory floor")

Every question in QOrium passes through a 7-stage pipeline:

```
1. SPEC IN          ← Job-role / skill / difficulty / format requested
2. AI DRAFT         ← Claude Opus 4.6 generates v0 with structured fields
3. AI SELF-CRITIQUE ← Same model critiques its own output for ambiguity, bias, edge cases
4. SME REVIEW       ← Human SME (paid contractor or in-house) validates + edits
5. CALIBRATE        ← Sample run on QOrium Reference Panel (paid candidates) → IRT difficulty estimate
6. RELEASE          ← Tagged in role-graph, watermarked, indexed for retrieval
7. POST-DEPLOY      ← Performance analytics + leak monitor; auto-retire + regenerate when triggered
```

Each stage has SLAs, cost targets, and quality gates. The pipeline is the moat.

### 3.2 The Four Delivery Modes

QOrium serves the same content library through four packaging modes. Buyers choose what fits their tech maturity:

#### Mode A — REST API + SDKs

- Endpoints: `/v1/questions/search`, `/v1/questions/{id}`, `/v1/packs/generate`, `/v1/leak-check`
- SDKs: Node.js, Python, Java, Go (Year 1); Ruby, .NET (Year 2)
- Pricing: usage-based (per question fetched) + platform license fee
- Target buyer: assessment platforms (HackerRank, Mettl, HackerEarth tier)
- Latency target: <200 ms p95 for question retrieval, <2 s for pack generation

#### Mode B — Bulk Export (CSV / JSON / XLSX)

- Native exporters for HackerRank import format, Mettl bulk-upload XLSX, Codility import JSON, HackerEarth CSV, generic JSON, generic CSV, generic XLSX
- Buyer logs into QOrium console, defines pack (role + difficulty + count + format), downloads
- Pricing: per pack (one-time) or subscription (unlimited packs)
- Target buyer: mid-market platforms, enterprises that prefer offline workflow, staffing firms

#### Mode C — Embedded Widget / iframe

- Drop-in JavaScript widget that delivers QOrium questions directly into the customer's existing assessment UI
- Customer adds 10 lines of code; QOrium handles the question rendering, code execution (via Judge0 backend), grading
- Pricing: per assessment delivered + monthly platform fee
- Target buyer: staffing firms with no engineering team, small consultancies, training institutes

#### Mode D — White-Label Content Packs

- Fully custom, client-confidential question packs authored end-to-end by QOrium for a specific enterprise / GCC / drive
- 50–500 questions per engagement, 6–12 weeks turnaround
- Includes per-client variants, watermarking, exclusivity
- Pricing: per-engagement (₹5L–50L / $6K–60K), with annual refresh contracts
- Target buyer: GCCs, large enterprises, government drives

### 3.3 The Three Buyer Packages

| Package | Buyer | Modes | Annual ACV | Sales Motion |
|---|---|---|---|---|
| **QOrium Platform API** | Assessment platforms | A + B | $50K – $500K | Enterprise sales, BD, 6–12 mo cycle |
| **QOrium Enterprise Library** | GCCs, large IT services, BFSI | B + D | ₹5L – 50L (~$6K–60K) per engagement | Enterprise sales + Talpro network referral, 3–6 mo cycle |
| **QOrium for Recruiters** | IT staffing firms, boutique recruiters | B + C | ₹50K – 5L/year (~$600 – $6K) | Self-serve + Talpro network, 1–3 mo cycle |

### 3.4 The Three SKU Use Cases (added per CEO directive May 1, 2026)

QOrium's product offering is carved into three distinct SKUs along the IP / exclusivity dimension. Together they cover the entire continuum from "shared commodity content" to "fully exclusive customer-owned IP." See **Document 5** for the full SKU architecture, pricing, unit economics, and moats.

| SKU | Use Case | Buyer Fit | Pricing Anchor |
|---|---|---|---|
| **SKU 1: ReadyBank** | Readymade skill-wise question library, sold non-exclusively to multiple clients | Platforms (primary) + Staffing firms + Mid-market enterprises | $50K–$500K/year (platforms); ₹4,999–49,999/month (recruiters); one-time packs ₹1L–6L |
| **SKU 2: JD-Forge** | Customised JD-specific questions generated on-demand every time a JD is uploaded | Enterprises (high JD volume) + Staffing firms (active drives) | $49 standard / $199 reviewed / $499 enterprise per JD; subscription tiers $499–$9,999/month |
| **SKU 3: Stack-Vault** | Customer-exclusive IP-protected library aligned to one company's tech stack, reusable infinitely | GCCs + Large enterprises + IT services giants | ₹10L (Department) / ₹40L (Enterprise) / ₹1Cr+ (Group) per year; quarterly refresh included |

The 3 SKUs are orthogonal to the 4 delivery modes — SKUs describe *what* is being delivered (content type and exclusivity), while modes describe *how* (API, bulk export, widget, white-label). The 3 × 4 SKU-by-mode matrix is detailed in Doc 5 §5.

**SKU sequencing for Year 1:**
- M1–M3: SKU 1 (ReadyBank) v0 ships — basic library + bulk export + recruiter subscription
- M4–M6: SKU 3 (Stack-Vault) Logo #1 — Bosch GCC engagement
- M5–M7: SKU 1 API GA — REST API for platform customers
- M6–M9: SKU 2 (JD-Forge) v1 — Standard tier (AI-only) launches
- M9–M12: SKU 2 (JD-Forge) v2 — Reviewed + Enterprise tiers; SKU 3 Group tier ready

### 3.5 Format & Role Coverage Roadmap

We ship in waves. First wave (Months 0–3): the highest-leverage formats × highest-priority roles. Subsequent waves expand both axes.

**Wave 1 (Months 0-3) — Tech Core:**
- Formats: MCQ, MSQ, single-function coding (DSA, SQL)
- Roles: Backend (Java/Python/Node), Frontend (React), Data (SQL/Python), DevOps basics
- Goal: 5,000 validated questions; first 5 logos signed (1 platform + 2 enterprise + 2 staffing including Talpro)

**Wave 2 (Months 3–6) — Tech Breadth + India Stack:**
- Formats: System design (whiteboard), real-codebase tasks, cloud sandbox starter
- Roles: SAP (ABAP, FICO), Oracle (HCM, EBS), Salesforce (Admin, Dev), Mobile (iOS/Android), QA Automation
- Goal: 12,000 questions; 15 logos; first WhiteLabel engagement complete

**Wave 3 (Months 6–9) — Domain + Aptitude:**
- Formats: SJT, cognitive ability (numerical, verbal, abstract reasoning), case study response
- Roles: Sales (SDR/AE), Customer Success, BFSI Domain (Cards, Loans, Capital Markets), Insurance (Guidewire / Duck Creek)
- Goal: 25,000 questions; 30 logos; first international platform pilot

**Wave 4 (Months 9–12) — AI-Era + Premium Formats:**
- Formats: AI-prompt-engineering tests, pair-programming-with-AI, autonomous-workflow design, AI-augmented code review
- Roles: AI-native engineering, ML / GenAI engineering, AI Product Manager
- Goal: 40,000 questions; 50 logos; international expansion ready

---

## 4. Pricing & Unit Economics

> **Note:** The pricing tables below show the v1 unified-product framing. The 3-SKU model in §3.4 (and detailed in Doc 5) supersedes this with per-SKU pricing — ReadyBank (subscription/per-question/API metering), JD-Forge (per-JD generation fee), Stack-Vault (annual exclusive-library license). The economics here remain directionally accurate; see Doc 5 for the canonical per-SKU pricing.

### 4.1 The Pricing Tables

#### QOrium Platform API (annual, USD)

| Tier | Questions/month | Anti-leak service | API rate limit | Price |
|---|---|---|---|---|
| **Starter** | 10,000 | Basic (monthly scan) | 100 req/min | $50,000/year |
| **Growth** | 50,000 | Premium (weekly scan) | 500 req/min | $150,000/year |
| **Enterprise** | Unlimited | Continuous (real-time) + per-client variants | 5,000 req/min | $500,000/year (custom above) |

#### QOrium Enterprise Library (engagement-based, INR)

| Pack Size | Custom Authoring | Refresh Cadence | Price (₹) |
|---|---|---|---|
| **Starter Pack** | 50 questions, 1 role | One-time | ₹5,00,000 |
| **Department Pack** | 200 questions, 5 roles | Quarterly | ₹15,00,000 |
| **Enterprise Pack** | 500+ questions, 20+ roles | Quarterly | ₹50,00,000+ |

Add-ons: per-client watermarking (+15%), regional language localization (+30%), live SME interview design (+₹2L per role).

#### QOrium for Recruiters (subscription, INR)

| Tier | Questions/month | Roles | Modes | Price |
|---|---|---|---|---|
| **Solo** | 200 | 5 | B (CSV export) | ₹4,999/month |
| **Team** | 1,000 | 20 | B + C (widget) | ₹14,999/month |
| **Agency** | 5,000 | Unlimited | B + C + light API | ₹49,999/month |

### 4.2 Unit Economics

#### Cost to produce one validated coding question (Wave 1):

| Stage | Cost |
|---|---|
| AI generation (Claude Opus, full pipeline) | $0.40 |
| AI self-critique | $0.20 |
| SME review (15 min @ India rates) | $5.00 |
| Calibration sampling (5 candidates @ ₹50 each) | $3.00 |
| Indexing + watermarking + storage | $0.30 |
| **Total cost per validated coding question** | **~$9.00 (₹750)** |

For MCQ: ~$2.50 per question. For SJT/case study: ~$15. For real-codebase task: ~$80.

#### Effective price per question delivered (depending on package):

| Package | Effective $/question delivered | Gross margin |
|---|---|---|
| Platform API (Growth tier) | ~$0.25 (high volume) | ~96% (after amortization) |
| Enterprise White-Label | ~$60–$200 | ~85% |
| Recruiter Solo subscription | ~$0.80 | ~70% |

**Blended target gross margin Year 1: 75%. Year 3: 85%+.**

This is SaaS-grade margin economics, not staffing-grade. Critical for venture math.

### 4.3 Year 1 Revenue Plan (Updated to reflect 3-SKU model)

| Segment | SKU | Logos | Year 1 Revenue |
|---|---|---|---|
| Platform API (Buyer A) | SKU 1 (ReadyBank API) | 3 (1 Growth + 2 Starter) | $240K (~₹20L) |
| Enterprise Stack-Vault (Buyer B) | SKU 3 | 5 (3 Department + 2 Enterprise tier) | ₹1.1Cr (~$130K) |
| Enterprise JD-Forge (Buyer B) | SKU 2 | 8 (subscription, mostly Reviewed tier) | ₹50L (~$60K) |
| Recruiter ReadyBank (Buyer C) | SKU 1 | 30 (Solo + Team subscriptions) | ₹45L (~$54K) |
| Recruiter JD-Forge (Buyer C) | SKU 2 | 20 (per-JD + subscription) | ₹30L (~$36K) |
| **Total Year 1** | **3 SKUs** | **66 logos** | **~₹3.5 Cr / $420K ARR** |

**Year 2 target:** $2M ARR (~₹17 Cr) with all 3 SKUs maturing. **Year 3 target:** $7M ARR. **Year 5 target:** $50M+ ARR with international expansion.

(Year 1 ARR moved from $384K → $420K because JD-Forge unlocks new revenue from buyers who previously only paid for ReadyBank.)

---

## 5. GTM Strategy — Three Parallel Motions

### Motion 1 — Talpro Network (Recruiter Segment)

- **Target:** 30 staffing-firm logos in Year 1
- **Channel:** Direct outreach via Bhaskar's existing network (TalproX network, IT staffing alumni groups, NASSCOM staffing affiliates)
- **Pitch:** "You and 50 other staffing firms run candidates through the same leaked HackerRank bank. Your client wants signal. QOrium gives you a per-client question pack at ₹14,999/month."
- **Sales cycle:** 1–4 weeks
- **CAC target:** ₹15K per logo
- **LTV:** ₹3L+ over 2-year average
- **Talpro India is Customer Zero** — runs on QOrium from Day 1, becomes the public reference

### Motion 2 — GCC Enterprise Direct (White-Label Segment)

- **Target:** 5 GCC engagements in Year 1
- **Channel:** Direct enterprise sales (Bhaskar + 1 Senior AE hire), TA-leader events (NASSCOM GCC Summit, India HR Tech, NHRDN), warm intros via Talpro network
- **Pitch:** "Your candidates have already seen the Mettl/HackerEarth questions. Buy a confidential, role-specific, watermarked question pack — only your hiring drive uses it. ₹15L/quarter, refreshed quarterly."
- **Sales cycle:** 3–6 months
- **CAC target:** ₹3L per engagement (sales time + travel + diligence)
- **LTV:** ₹60L+ over 3-year average (recurring quarterly engagements)
- **First marquee:** Bosch GCC Bengaluru (Bhaskar's existing relationship → likely Logo #1)

### Motion 3 — Assessment Platform BD (API Segment)

- **Target:** 3 platform pilots in Year 1, 10+ in Year 2
- **Channel:** Direct BD to platform CEOs / VP Product (Bhaskar + 1 BD hire Year 1, full BD function Year 2). Industry conferences (HR Tech World, Unleash, India HR Tech). Thought-leadership content (CTO blog).
- **Pitch:** "You're spending $1.2M/year on a content team that ships 1,800 questions. We'll give you 5,000 fresh, calibrated, anti-leak-rotated questions for $150K/year via API. Your team focuses on your platform; we focus on your library."
- **Sales cycle:** 6–12 months
- **CAC target:** $15K per logo (sales + integration support)
- **LTV:** $600K+ over 3-year average (enterprise tier becomes sticky once integrated)
- **First targets:** WeCP (founder rapport — Bengaluru), Xobin (mid-market, fast-moving), iMocha (India + global presence), Adaface (anti-leak philosophical alignment)

### Why Three Parallel Motions Work

- **Different sales cycles:** Recruiter logos sign in weeks (cash flow Year 1 Q1). Enterprise in months (cash flow Year 1 Q2-Q3). Platform in 6+ months (cash flow Year 1 Q4 onward, ramping Year 2).
- **Different CACs and team profiles:** Recruiter is founder-led, low-touch. Enterprise needs 1 senior AE. Platform needs 1 BD lead. Distinct hires, distinct comp plans.
- **Same engine:** All three are served by the same content factory + role-graph + pipeline. Marginal cost of serving a third segment is near zero.
- **De-risking:** If any one motion under-performs, the other two carry. If the platform sale is slow (likely), enterprise + recruiter cover overhead.

---

## 6. 12-Month Roadmap

| Month | Engineering / Content | GTM | Cash & Team |
|---|---|---|---|
| **M0 (now)** | Blueprint approved (this doc); IdeaForge gate run | CEO + CTO commit; QUEUE updated | Talpro CTO doubling as QOrium founding CTO |
| **M1** | Engine v0: Pipeline scaffolding, role-graph schema, Wave 1 spec; Talpro Customer Zero integration | Talpro India runs first 100 candidates through QOrium | First content SME hire (1 contractor) |
| **M2** | 1,000 Wave 1 questions live; bulk export (CSV) working; admin console | First 5 recruiter conversations; Bosch GCC discovery call | Hire #1: Senior Engineer (content engine); Hire #2: SME content lead |
| **M3** | 5,000 Wave 1 questions; REST API alpha; HackerRank/Mettl/Codility export formats | First 5 recruiter logos signed; first GCC engagement scoped; WeCP/Adaface BD intros | Hire #3: AE (enterprise sales); Hire #4: BD (platforms) |
| **M4** | Wave 2 begins (SAP, Oracle, Salesforce); anti-leak monitor v0 (weekly scan) | First GCC engagement signed; 10 recruiter logos | Hire #5: I/O Psych contractor (validation lead) |
| **M5** | 12,000 questions; per-client watermarking v1; widget delivery mode beta | First platform pilot signed (Tier 3 platform — Xobin or Testlify) | Hire #6: Frontend engineer (admin + widget) |
| **M6** | API v1 GA; performance analytics dashboard; second GCC engagement | 15 recruiter logos; 2 GCC engagements active; first Mettl exec conversation | $300K ARR run-rate |
| **M7** | Wave 3 begins (SJT, cognitive, case study); IRT calibration pipeline live | First international staffing-firm logo (UK or UAE) | Hire #7: Content ops manager |
| **M8** | 25,000 questions; conversational delivery mode (Adaface-style) v0 | 25 recruiter logos; 4 GCC engagements; Mettl pilot scoping | Series Pre-A conversations begin |
| **M9** | Wave 4 begins (AI-era formats); GenAI authoring v2 (multi-model) | First Tier 1 platform pilot (one of: WeCP, iMocha) | Hire #8: I/O Psych full-time |
| **M10** | Forensic leak attribution working; multi-format export library complete | 30 recruiter logos; 5 GCC engagements; 3 platform logos signed/piloting | $500K+ ARR run-rate |
| **M11** | 35,000 questions; v2 platform API (better SDKs, finer-grained billing) | International expansion plan finalized; first US platform conversations | Hire #9: Marketing / Content Lead; Hire #10: Customer Success |
| **M12** | 40,000+ questions; QOrium Reference Panel (paid-candidate calibration network) live | 50 logos total; first marquee case study (with Bosch or Talpro); Series Pre-A close | $1M+ ARR; team of 11; pipeline of 100+ |

### Decision Gates

- **End of M3:** Wave 1 must be at 5K validated questions, 5 logos signed. If not, slow Wave 2; double down on content quality.
- **End of M6:** Must hit $300K ARR run-rate. If not, reduce headcount and focus only on the highest-velocity motion (recruiter).
- **End of M9:** Must have 1 Tier-1 or Tier-2 platform pilot. If not, the platform-API thesis is wrong; pivot to enterprise-white-label-first.
- **End of M12:** Must hit $1M ARR. If not, no Series Pre-A; bootstrap mode through Year 2.

---

## 7. Team & Hiring Plan

### Founding Team (Day 0)

- **Bhaskar Anand** — Founder/CEO; sets strategy, owns enterprise + platform sales motions
- **CTO (Talpro Universe CTO doubles in Year 1)** — Owns content engine architecture, AI pipeline, API design

### First 10 Hires (in order)

1. **Senior Engineer — Content Engine** (full-stack, AI pipeline experience): Month 2
2. **SME Content Lead** (senior engineer turned content engineer; defines question quality standard): Month 2
3. **AE — Enterprise** (5+ years selling into HR/TA leaders, ideally India + GCC experience): Month 3
4. **BD — Platforms** (5+ years partnerships/BD in HR Tech): Month 3
5. **I/O Psychologist** (PhD or M.A. with assessment-design experience; contractor in Year 1, FTE Year 2): Month 4
6. **Frontend Engineer** (React, admin console + widget delivery): Month 5
7. **Content Operations Manager** (manages SME contractor network, quality QA, throughput): Month 7
8. **I/O Psychologist FTE** (validation lead, regulatory defensibility): Month 9
9. **Marketing / Content Lead** (long-form content, thought-leadership, SEO, conferences): Month 11
10. **Customer Success** (onboarding + expansion of existing logos): Month 11

### SME Contractor Network (parallel)

- 30 SME contractors by Month 6 (across tech stacks + India domain stacks)
- 100 SME contractors by Month 12
- Sourced via Talpro network, NIT/IIT alumni groups, freelance platforms
- Compensation: ₹500–2,000 per validated question depending on complexity

### QOrium Reference Panel (paid candidates for calibration)

- 200 paid candidates by Month 6 (calibration sampling for IRT difficulty)
- 1,000 by Month 12
- Compensation: ₹50–200 per question attempted
- Sourced via TopCoder-style developer communities, college coding clubs, Talpro candidate database (with consent)

---

## 8. The Moats — Day 1 vs Long-Term

### Day-1 Moats (defensible from Week 1)

1. **Talpro Customer Zero + 500-firm network** — Distribution moat. No other content startup has this.
2. **Bhaskar's enterprise relationships** — Direct GCC TA-leader access, warm intros to platform CEOs.
3. **CTO + CEO experience compounding** — Ability to ship the engineering AND sell to the buyer.
4. **India cost-base** — SME validation at half the global cost; 2–3× capital efficiency vs US-based competitors.

### 12-Month Moats (built by end of Year 1)

5. **Anti-leak rotation engine** — Operational pipeline + leak-pattern corpus that takes 6–12 months to replicate.
6. **Role-graph taxonomy** — Becomes a reference standard once the first 5,000 questions are organized in it.
7. **I/O Psych validation pipeline** — Hard to copy without 1+ I/O psych FTE and a year of process iteration.

### 3-Year Moats (durable competitive advantages)

8. **Calibration data** — Years of IRT calibration data on QOrium Reference Panel candidates. Becomes the standard for "this is what a Hard question really means."
9. **Per-client variant library** — Years of accumulated semantic-equivalence transformations. Forensically-attributable leaks become a courtroom-defensible IP claim.
10. **Brand: "Where do you get your questions?"** — Industry standard answer becomes "QOrium." See: SHL for psychometric, Salesforce for CRM. First-mover advantage compounds.

---

## 9. Operating Cadence & Governance

### Weekly Rhythms

- **Monday Content Pipeline Review:** Throughput vs target, quality flags, leak alerts
- **Wednesday GTM Review:** Pipeline by motion, deals at-risk, customer success KPIs
- **Friday Engineering Review:** Sprint progress, infra health, security posture, AI-stack health

### Monthly Rhythms

- **Month-end metrics close:** ARR, NRR, gross margin, content-throughput, library size
- **CEO + CTO 1:1 strategy review:** What's working, what's not, what to change next month
- **All-hands** (when team >5): Wins, losses, learnings, roadmap

### Quarterly Rhythms

- **OKRs reviewed and reset**
- **CTO Constitution Quality Gate** — applies QOrium against the 80-point Talpro Universe quality gate
- **Board / Advisor update** (when applicable)

### Constitution & Standards

- Adopts **CTO Constitution v8.1** (Talpro Universe standard) for all engineering, security, and infra decisions
- All deployments pass the **80-point quality gate** before going live
- All sensitive content gated by **DPDPA + GDPR DPAs** at the contract level
- All AI-authored content goes through the **mandatory SME validation step** — no exceptions, no auto-publish

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation Owner |
|---|---|---|---|
| WeCP pivots back to content business | Low | High | CEO — speed, distribution, India-stack depth |
| Mettl/HackerRank build internal AI authoring + skip QOrium | Medium | High | CEO + CTO — buy-vs-build math (5–10× cost advantage), reference logos in Year 1 |
| AI generation quality regresses or model access is restricted | Low | High | CTO — multi-model fallback (Claude + GPT-5 + Gemini Pro), local Llama-derivative for sovereignty |
| SME validator network can't scale past 100 contractors | Medium | Medium | COM (Content Ops Manager) — Talpro alumni network, Bali AI agent for SME triage |
| Per-client watermarking has unintended leakage | Low | High | CTO — extensive E2E testing before any white-label engagement; legal/contractual fallback |
| GCC volume slows materially (recession) | Medium | Medium-High | CEO — 3-segment diversification + global expansion in Year 2 |
| Founding team burnout (Bhaskar wears 3 hats) | High | High | CEO — disciplined hiring of AE + BD by Month 3; protect 1 day/week for strategy |
| Cash runway tight before Series Pre-A | Medium | High | CEO + CTO — bootstrap-able to $1M ARR via recruiter motion alone if needed |
| Competitive AI content shop emerges (Glider AI scale) under-prices | Medium | Medium | CEO + CTO — defend on validation rigor + India stack + Talpro network |
| Question content copyright dispute (overlap with LeetCode etc.) | Low | High | CTO — original-authorship documentation per question; legal counsel on retainer |

---

## 11. The 5-Year North Star

By end of FY2031:

- **Revenue:** $50M+ ARR
- **Customers:** 50+ assessment platforms, 500+ enterprises/GCCs, 2,000+ staffing firms
- **Library:** 200,000+ validated questions across 50+ formats and 200+ role/stack combinations
- **Geographic spread:** India (anchor), US (largest market), UK/EU (regulatory-defensible content), MENA (GCC-equivalent demand)
- **Team:** 80–120 people, half engineering/content, half GTM
- **Strategic options:**
  - (a) Independent profitable scale-up → strategic acquisition by Mercer (Mettl parent) or Workday or HireVue at $300M–$1B
  - (b) Independent IPO path on Indian markets (~₹3,000 Cr valuation)
  - (c) Anchor company in a Talpro Universe platform play with cross-product leverage (LeadHunter feeds candidates → QOrium assesses → ProveIQ certifies → HireIQ closes)

The third option is the most distinctive and the most aligned with the broader Talpro Universe thesis. QOrium becomes the assessment layer of an integrated talent stack.

---

## 12. The IdeaForge Gate Quick Score (preview)

(Full IdeaForge gate report ships in Phase 2.)

| Dimension | Weight | Score (4-pt scale) | Notes |
|---|---|---|---|
| **Market Size & Growth** | 4 | 4 | $30B+ market, 9–11% CAGR, fast-growing sub-segment |
| **Founder/Team Fit** | 4 | 4 | Bhaskar's distribution + Talpro network is uniquely strong here |
| **Technical Defensibility** | 4 | 3 | AI authoring is increasingly commodity; the I/O psych + lifecycle is the moat |
| **Distribution / GTM Clarity** | 4 | 4 | Three motions, clear sequencing, Talpro Customer Zero |
| **Unit Economics** | 4 | 3 | SaaS-grade margins after Wave 1 scale; bootstrap-able to $1M ARR |
| **Defensibility / Moats** | 4 | 3 | Day-1 moats real; long-term moats need 1–3 years to compound |
| **Total** | **24** | **21 / 24** | **PROCEED** (threshold: ≥20/24) |

---

## 13. The Executive Ask (CEO action items)

For QOrium to move from blueprint to reality, the following needs CEO sign-off / decision in the next 14 days:

1. **Name confirmation** — QOrium accepted? (Working assumption: YES.)
2. **Initial capital allocation** — ₹50L runway for Months 0-3 (engineering + 2 content hires + tooling)?
3. **Talpro Customer Zero commitment** — Talpro India hiring drives switch to QOrium internally from Month 1?
4. **First marquee logo target** — Bosch GCC Bengaluru as Logo #1 Stack-Vault engagement?
5. **CTO bandwidth** — Talpro Universe CTO doubles as QOrium founding CTO for Year 1 (estimated 50% time allocation)?
6. **Authority delegation** — QOrium hiring (first 5 hires) authorized to be made by CEO + CTO without further board approval?
7. **SKU naming** — Working names: ReadyBank, JD-Forge, Stack-Vault. Acceptable, or should marketing rename pre-launch?
8. **Stack-Vault pricing anchor** — Is ₹40L/year for Stack-Vault Enterprise the right pitch to Bosch GCC, or should we model ₹25L (lower CAC) or ₹60L (higher value-per-tier)?
9. **SKU sequencing** — Year 1 priority sequence in Doc 5 §5.3 (SKU 1 first, SKU 3 second, SKU 1 API third, SKU 2 fourth) — does this match CEO's intuition?

---

*End of Document 4. See Document 5 for the full 3-SKU architecture (ReadyBank, JD-Forge, Stack-Vault). Next deliverables (Phase 2): PPT Deck, IdeaForge Full Gate Report, CTO Architecture, Bali Sales Playbook.*
