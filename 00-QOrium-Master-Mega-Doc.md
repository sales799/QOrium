# QOrium — Master Blueprint v1.1

## A consolidated launch document for the Talpro Universe CEO

**Author:** CTO, Talpro Universe
**Prepared for:** Bhaskar Anand, CEO
**Date:** May 1, 2026
**Status:** Phase 1 deliverable — for IdeaForge gate review
**Version:** v1.1 (added Doc 5 — 3-SKU architecture per CEO directive)

---

## How to Read This Document

This Master Blueprint consolidates the full QOrium launch package into a single mega-document organized in five parts. Each part also exists as a standalone document for sharing with specific stakeholders:

- **Part 1 — Market Landscape** *(also: 01-Market-Landscape.docx)* — TAM, growth drivers, leakage economics, GCC tailwind, regulatory context
- **Part 2 — Top 20 Competitor Audit** *(also: 02-Top-20-Competitor-Audit.docx)* — Full profiles + question-creation models for the 20 platforms QOrium will partner with, sell to, or compete around
- **Part 3 — Gap Analysis** *(also: 03-Gap-Analysis.docx)* — Format coverage matrix, role coverage matrix, lifecycle maturity matrix, and the seven structural gaps QOrium attacks
- **Part 4 — QOrium Blueprint v1** *(also: 04-QOrium-Blueprint-v1.docx)* — The operating thesis: identity, USP, product architecture, pricing, GTM, 12-month roadmap, hiring, moats, and the IdeaForge gate score
- **Part 5 — Three Use Cases / SKU Architecture** *(also: 05-QOrium-Three-Use-Cases-SKU-Architecture.docx)* — The 3-SKU model (ReadyBank, JD-Forge, Stack-Vault), per-SKU pricing, unit economics, moats, and the SKU × buyer × delivery-mode matrix

For a 60-second read, see the Executive Summary below. For a 5-minute read, see the One-Pager. For the 60-minute deep read, continue into Part 1.

---

## Executive Summary (60 seconds)

The global talent assessment market is **$30B+ in 2026**, growing at 9–11% CAGR. Behind every assessment platform — HackerRank, Mettl, HackerEarth, Codility, CodeSignal, iMocha, WeCP, TestGorilla, Adaface, Vervoe, and 100+ others — sits the same structural problem: **they are content-hungry, and their content leaks faster than they can replenish it.** Question authoring at platform scale is expensive, slow, and increasingly indefensible against private candidate-prep ecosystems.

**QOrium is the world's first enterprise-grade Question-Bank-as-a-Service.** We don't run assessments — we supply the questions that power the assessments other platforms run. Every question in QOrium is **AI-authored, I/O-psychologist-validated, anti-leak-rotated, role-graph-tagged, and exportable to any major platform's import format.** We sell to all three buyers from Day 1: **assessment platforms** (via API + bulk export), **enterprises and GCCs** (via white-label confidential question packs), and **IT staffing firms** (via subscription, with Talpro India as Customer Zero).

QOrium ships in **three SKU use cases** that span the entire IP-exclusivity continuum:

- **SKU 1 — ReadyBank:** shared, multi-tenant question library indexed by skill (volume/scale play)
- **SKU 2 — JD-Forge:** customised JD-specific questions generated on-demand per JD upload (real-time/transactional)
- **SKU 3 — Stack-Vault:** customer-exclusive IP-protected library aligned to one company's tech stack, reusable infinitely (high-touch/lock-in)

**The wedge is operational, not technological.** AI question generation is increasingly commodity. What is not commodity is the disciplined production pipeline (AI authoring + I/O psych validation + anti-leak rotation + per-client watermarking + multi-format export + role-graph organization) that makes QOrium-supplied content enterprise-defensible. Combined with India's structural advantages (1,800+ GCCs, 5–10× cost-to-validate vs Western competitors, Talpro's distribution network, English-default content suitable for global expansion in Year 2), this is a credible path to **$420K ARR by Month 12, $7M ARR by Year 3, and $50M+ ARR with international scale by Year 5.**

**IdeaForge gate quick score: 21/24 — PROCEED.** Nine executive decisions are required from the CEO in the next 14 days to translate the blueprint into operating reality (full list in Part 4 §13).

---

## One-Pager (5-minute read)

### What QOrium Is

A Question-Bank-as-a-Service company that supplies enterprise-grade assessment content (MCQ, coding, SJT, simulations, video, voice, AI-prompt tests — all 40+ formats) to the global hiring assessment industry via API, bulk export, embedded widget, and white-label channels. Headquartered in India for cost, talent, and GCC-market proximity advantages.

### Who Buys From Us (and Why)

1. **Assessment platforms** (HackerRank, Mettl, HackerEarth, iMocha, WeCP, Adaface, Vervoe, ~20 globally) — they need fresh, calibrated, anti-leak-rotated content faster and cheaper than their in-house teams can author it. We sell ReadyBank API + bulk export at $50K–$500K/year per platform.
2. **Enterprises and GCCs** (TCS, Infosys, Bosch GCC, Siemens GCC, BFSI majors) — they need confidential, role-specific, watermarked question packs. They buy Stack-Vault (annual exclusive library, ₹10L–1Cr/year) and JD-Forge (per-JD generation, $49–$499 per JD or subscription).
3. **IT staffing firms** (Talpro India = Customer Zero, plus 200+ mid-tier staffing firms) — they need fresh per-client question packs. They buy ReadyBank subscription (₹4,999–49,999/month) and JD-Forge per-JD or subscription.

### The Three SKUs

- **SKU 1 — ReadyBank:** Shared library, sold non-exclusively to many clients. Volume/scale play. 90%+ gross margin at scale. Defensibility: library size + role-graph + anti-leak rotation.
- **SKU 2 — JD-Forge:** On-demand JD-specific question generation. ~30-second turnaround for Standard tier; 4-hour SLA for Reviewed tier. 80–95% gross margin. Defensibility: pipeline quality + JD-parsing accuracy + speed.
- **SKU 3 — Stack-Vault:** Customer-exclusive private library aligned to a customer's tech stack, reusable infinitely. Annual license ₹10L–1Cr+. 60–75% gross margin (Year 2+). Defensibility: customer-specific corpus + watermarking + switching cost + accumulated calibration data.

### Why Now

Five forces converged in 2024–2026 that did not all hold in 2020: (a) AI authoring quality reached human-junior parity, (b) India GCC volume hit 1,800+ GCCs hiring ~400K technical roles/year, (c) skills-first hiring crossed 62% adoption, (d) question leakage became transparently measurable on Glassdoor/Reddit/GeeksforGeeks, (e) the in-house-vs-outsourced cost gap widened to 5–10×. The window is 24–36 months before incumbents either build internally, acquire content shops, or accept content-as-a-service as a permanent supply layer (the most likely outcome).

### The Seven Structural Gaps QOrium Attacks

1. **Anti-leak operational engine** — ZERO platforms run continuous scan + auto-retire + AI-regenerate + validate loops
2. **India enterprise stack content** — SAP, Oracle, Salesforce, ServiceNow, BFSI core, embedded automotive, mainframe — universally thin
3. **Role-graph taxonomy** — No platform has a normalized role × skill × difficulty × format graph
4. **Per-client variants + forensic watermarking** — ZERO platforms operationalize this
5. **Multi-format universal export** — ZERO platforms export natively to all 20 major platforms' import formats
6. **AI-era format coverage** — Prompt-engineering tests, pair-programming-with-AI, autonomous-workflow design — first-mover whitespace
7. **Hybrid AI-authored + I/O-psych-validated production pipeline** — the moat that requires both engineering discipline AND assessment science (these almost never co-exist)

### The Three-Sentence USP

> QOrium is the only company in the world that combines AI-speed authoring with I/O-psychologist-grade validation, runs a continuous anti-leak rotation engine, organizes every question in a normalized role-graph, and ships it to any assessment platform's import format via a single API. We sell three SKUs — a shared ReadyBank library, on-demand JD-Forge generation, and customer-exclusive Stack-Vault libraries — covering the full continuum from commodity content to fully-exclusive IP. We are the content layer the entire $30 billion talent assessment industry was missing.

### What Ships in 12 Months

**Engineering & Content:** A 7-stage content pipeline producing 40,000+ validated questions across 4 release waves (Tech Core → Tech Breadth + India Stack → Domain + Aptitude → AI-Era Formats), exposed via REST API + bulk export + embedded widget + white-label channels. Anti-leak rotation engine, per-client watermarking, role-graph indexing all live. **All 3 SKUs ship within Year 1** (SKU 1 Month 1, SKU 3 Month 4, SKU 2 Month 6).

**GTM:** 66 logos (~50 staffing firms across SKU 1 + SKU 2, ~13 enterprise/GCC across SKU 2 + SKU 3, ~3 platforms across SKU 1) generating $420K ARR run-rate.

**Team:** 11 people (CEO + CTO + 9 hires across engineering, content, sales, BD, I/O psych, marketing, customer success), supported by a 100-strong SME contractor network and a 1,000-strong paid candidate panel for IRT calibration.

### The Capital Question

**Bootstrap-able to $1M ARR via the recruiter motion alone if needed.** ₹50L of initial capital funds Months 0–3 (engineering + 2 content hires + tooling). Series Pre-A conversation begins Month 8, targeting close by Month 12 to fund Year 2 scale to $2M ARR.

### The 5-Year Outcome

$50M+ ARR, 50+ platforms, 500+ enterprises, 2,000+ staffing firms, 200K+ validated questions, presence in India + US + UK/EU + MENA. Strategic options: independent profitable scale-up → acquisition by Mercer/Workday/HireVue at $300M–$1B, or anchor of an integrated Talpro Universe talent stack (LeadHunter → QOrium → ProveIQ → HireIQ).

---

*End of preamble. Continue to Part 1 — Market Landscape.*

---
---
---

# QOrium — Document 1 of 4
# The Global Assessment Content Market — Landscape, Drivers & Why Now

**Author:** CTO, Talpro Universe
**Prepared for:** Bhaskar Anand, CEO
**Date:** May 1, 2026
**Status:** Draft v1.0 — for CEO review
**Companion docs:** 02 Competitor Audit · 03 Gap Analysis · 04 QOrium Blueprint v1

---

## Executive Summary

The global talent assessment market crossed **USD 30 billion in 2025** and is on track to reach **USD 32 billion in 2026**, growing at a steady **9–11% CAGR** through 2034. Within that, the technical-hiring sub-segment — coding tests, role-specific MCQs, work-sample simulations — is the fastest growing slice, pulled by three converging tailwinds: skills-first hiring, the explosion of India-based Global Capability Centers (GCCs), and AI-driven volume hiring.

But behind every assessment platform — HackerRank, Mercer Mettl, HackerEarth, Codility, CodeSignal, iMocha, TestGorilla, WeCP, Adaface, Vervoe, and 100+ others — sits the same structural problem: **they are all content-hungry, and their content leaks faster than they can replenish it.**

A typical coding question on a major platform has a half-life of 6–9 months before it shows up on Glassdoor, Reddit, GeeksforGeeks, LeetCode discussion forums, and private WhatsApp/Telegram groups. Platforms employ in-house question authors at $80K–$150K/year per head — a model that does not scale to the 1,000+ skills × 5+ difficulty levels × continuous-refresh cadence the market demands. Meanwhile, the buyers (enterprise hiring leads, GCC TA heads, IT staffing firms) are forced to choose between expensive private question banks ($50K+ engagements with SHL or Talogy) or generic, leaked public banks.

**This is the white space QOrium occupies.** Not another assessment platform — a dedicated, AI-augmented, human-validated **Question Content Factory** that supplies fresh, calibrated, role-specific assessment items to platforms (via API), to enterprises (as white-label question packs), and to staffing firms (as licensed libraries). One company, validated proof-of-concept, and an enterprise-grade quality moat is what stands between today and a 9-figure ARR business in 5 years.

This document establishes the market context. Documents 2, 3, and 4 break down the competitive landscape, the structural gap, and QOrium's go-to-market blueprint.

---

## 1. Market Sizing & Growth

### 1.1 Total Addressable Market

The global **Talent Assessment market** is one of the largest and most-fragmented sub-categories of HR Technology. Multiple independent research firms have published 2025-2026 estimates:

| Source | 2025 Size | 2026 Projection | CAGR | Horizon |
|---|---|---|---|---|
| Cognitive Market Research | USD 22.5B (2024) | ~USD 25B | ~10% | 2024–2031 |
| Business Research Insights | — | **USD 32.16B** | **9.4%** | to USD 57.09B by 2035 |
| 360iResearch (Services-only) | USD 9.88B | USD 10.7B | 8% | 2025–2030 |
| Verified Market Reports | — | mid-double-digit | — | 2026–2034 |

**Why the wide range?** Because "talent assessment" is a fuzzy bucket. Narrow definitions (only pre-employment software tests) sit at $5–10B. Broad definitions (which include managed-service psychometrics, leadership assessment consulting, and certification testing) sit at $30B+. For QOrium's purposes, the **addressable wedge is the technical and skills-screening sub-segment** — pre-employment + GCC-scale internal mobility — which we conservatively size at **USD 5–8B in 2026** and **USD 12–15B by 2030**.

### 1.2 Sub-Segment Growth Velocity

Three sub-segments are growing materially faster than the headline number:

1. **AI-augmented assessments** (auto-grading, generated questions, conversational tests): up **55% YoY in adoption**. Platforms rebranding around AI: iMocha, Adaface, Vervoe, HackerRank's "AI Interviewer."
2. **Skills-based hiring** (replacing degree-based screening): now **62% of mid-to-large enterprises** report using skills assessments as a primary or co-primary screen. Up from ~40% in 2022.
3. **Online proctored testing** (high-stakes hiring drives, GCC mass hiring): **48% YoY growth in online assessment volume**, driven by post-pandemic remote-first hiring norms.

Concretely: AI-based automated assessments alone reportedly drove **42% accuracy improvement, 37% reduction in time-to-hire, and 29% productivity gain** for the enterprises that adopted them at scale.

### 1.3 The "Content Inside" Sub-Wedge — QOrium's Specific TAM

Of every dollar spent on an assessment platform license, roughly **15–25% is attributable to the value of the content itself** (the question library, calibration, freshness, role coverage). The rest is the platform UX, proctoring, integrations, and reporting.

That implies QOrium's specific addressable wedge — **content-as-a-service for assessment** — is approximately:

- **2026:** USD 1.0–1.5B globally (15% of $7B technical-screening segment)
- **2030:** USD 2.5–3.5B globally
- **India-only (GCC + IT Services + Staffing):** USD 200–400M in 2026, USD 600M+ by 2030

Capturing **0.5–1% of the global content wedge** is a $5–10M ARR business in Year 3. Capturing **5%** is a $50–100M ARR business in Year 5. Both are within reach for a focused, defensible content company.

---

## 2. Why the Market Exists — The Five Structural Drivers

### 2.1 Driver #1 — Question Leakage Is Endemic

Every coding question used in a high-volume hiring drive leaks. This is not opinion — it is observable on Glassdoor (interview-experience posts), Reddit (r/cscareerquestions, r/leetcode, r/india_recruitment), GeeksforGeeks (company-tagged problem archives), LeetCode discussion forums, and private candidate-prep WhatsApp/Telegram groups that are a multi-million-rupee tutoring industry in India alone.

**Typical leakage timeline for a "fresh" question:**

- **Week 1–4:** First 200–500 candidates sit it. ~5% post screenshots or memory-reconstructed versions.
- **Month 2–6:** Aggregator sites (LeetSummary, GfG-Company, etc.) begin tagging it. Tutoring services teach the optimal solution.
- **Month 6–9:** Question is "burned" — pass rates spike, signal collapses, hiring teams stop trusting it.
- **Month 9–12:** Question is formally retired by platform.

Implication: an active platform with 10,000 active questions needs to **author, validate, and rotate ~150–200 net-new questions per month** just to stay still. Most don't.

### 2.2 Driver #2 — In-House Authoring Doesn't Scale

A typical content team at a major platform consists of:

- 5–15 in-house question authors (mid-level engineers turned content engineers, $80K–$150K each)
- 1–3 I/O psychologists / psychometricians (Mettl, Codility, SHL pioneer this)
- An external SME network (paid per question, $50–$300 each, freelance)

For a 10,000-question library refreshed at ~150 questions/month, blended cost per validated question lands around **$80–$300 (₹6,500–₹25,000)**. AI-augmented authoring (Claude/GPT for first drafts, human validation) can cut that to **$15–$50 per question** — a **5–10× cost advantage** that platforms cannot internally replicate at speed without disrupting their existing teams.

### 2.3 Driver #3 — The GCC Tailwind in India

India hosts approximately **1,800 Global Capability Centers (GCCs)** as of 2025 — captive R&D / engineering / shared-service hubs of multinationals. These GCCs alone hire **~300,000–400,000 technical roles per year** through pre-screened assessment pipelines. They are the single largest buyer of high-volume coding/technical assessments globally.

GCC-specific demand patterns:

- **Domain coverage:** SAP ABAP, Oracle HCM/EBS, Salesforce, ServiceNow, Workday, Pega, BFSI core systems, embedded systems (automotive), mainframe, Guidewire — areas that generic platforms barely cover.
- **Volume:** A single GCC may run 5,000–20,000 candidate assessments per quarter.
- **Confidentiality:** GCCs increasingly demand company-specific question packs that aren't shared across other employers — to defeat the leak problem.
- **Localization:** Hindi/Tamil/Telugu instructions for support-tier roles; English for engineering.

This combination — high-volume + niche stack + confidentiality + localization — is precisely what generic platforms struggle with. It is QOrium's natural beachhead.

### 2.4 Driver #4 — Skills-First Hiring & Internal Mobility

Two structural shifts compound demand:

1. **Skills-first external hiring.** Job descriptions are being rewritten around skill sets, not degrees. Every skill in the JD needs to be assessable — and "every skill" is a much wider taxonomy than "knows Java."
2. **Internal mobility platforms** (Gloat, Eightfold, Fuel50, ServiceNow ELM). These tools require a continuous pulse on the internal workforce's skills — which is itself a massive new assessment-content market that did not exist 5 years ago. iMocha has explicitly pivoted toward this with its "Skills Intelligence Platform."

### 2.5 Driver #5 — AI Has Made High-Quality Authoring Possible

Three years ago, AI-generated coding questions were obviously bad — generic, ambiguous, no test cases, no edge-case coverage. Today, with frontier models (Claude Opus, GPT-4 class), a properly prompted pipeline can generate:

- Coding problems with structured problem statements, sample I/O, edge-case test cases, reference solutions across 5 programming languages, complexity analysis, and a difficulty estimate
- MCQs with one correct answer + 3 distractors that are all plausible (the hard part)
- SJTs with grounded, role-specific scenarios
- Domain MCQs (SAP, Oracle, Salesforce) using retrieval-augmented generation against official documentation

The remaining 10–20% of quality work is human SME validation. This shifts the unit economics: a content company can **author at AI speed and validate at human quality**, achieving both scale and trust simultaneously.

---

## 3. The Buyers — Who Pays for Content

QOrium's buyers fall into three distinct segments. Each has different willingness-to-pay, different sales cycles, and different content needs.

### Segment A — Assessment Platforms (B2B2B / API)

**Examples:** Mercer Mettl, HackerEarth, WeCP, iMocha, TestGorilla, Adaface, Xobin, HirePro, Speedexam, SkillRobo, Codility, CodeSignal, DevSkiller.

**The pitch:** "Why pay your in-house team $1.2M/year to author 1,800 questions when you can plug into our API and get 5,000 fresh, calibrated, anti-leak-rotated questions for $200K?"

**Willingness to pay:** USD 100K–$1M per platform per year (API license + revenue share on assessments)
**Sales cycle:** 6–12 months (procurement, security review, content audit)
**Sticky once integrated:** Yes — content is the platform's lifeblood
**Risk:** Some will say "we'll build it ourselves." Most won't follow through; the ones who do will partly self-cannibalize their content team's tenure security.

### Segment B — Enterprises (B2B Direct / White-Label Packs)

**Examples:** TCS, Infosys, Wipro, HCL, Cognizant, Capgemini India, Bosch GCC, Siemens GCC, Deloitte India, Accenture, JPMC GCC, Goldman Sachs Bengaluru.

**The pitch:** "Your candidates have already seen the public Mettl/HackerRank questions. Buy a confidential, role-specific question pack authored just for your hiring drive — re-licensed quarterly with a fresh set."

**Willingness to pay:** INR 5L–50L per engagement (USD 6K–60K)
**Sales cycle:** 3–6 months (TA leadership + procurement + security)
**Sticky once integrated:** Annual contracts with quarterly question refreshes
**Risk:** Enterprise procurement is slow; needs a large enterprise sales motion

### Segment C — IT Staffing Firms & Boutique Recruiters (B2B Niche)

**Examples:** Talpro India (Customer Zero), Randstad India, ManpowerGroup, Adecco, Quess, TeamLease, Allegis, Magna Infotech, IDC Technologies, NTT Data Services, plus 200+ mid-tier staffing firms.

**The pitch:** "Stop running candidate screening on the same leaked HackerRank bank that everyone else uses. Plug QOrium's per-client question pack into your existing assessment workflow and give your end-clients a clean signal."

**Willingness to pay:** INR 50K–5L per year per firm (USD 600–6K)
**Sales cycle:** 1–3 months (founder-to-founder direct)
**Sticky once integrated:** Recurring annual subscriptions
**Risk:** Lower ACV, but very fast sales cycle and Talpro's direct network gives instant pipeline access.

### Why "All Three from Day 1" Works

Conventional product-strategy advice is "pick one segment first, dominate it, then expand." We're consciously choosing differently for QOrium. The reasons:

- **Talpro India is Customer Zero for Segment C** — zero customer-acquisition cost, instant feedback loop, real-world dogfooding from Day 1.
- **The same content engine serves all three.** The question authoring + validation pipeline is identical; only the packaging (API vs CSV vs white-label vs embedded widget) differs.
- **Each segment de-risks the others.** Talpro proves Day 1 demand. Enterprises generate cash flow. Platforms (Year 2-3) provide scale and venture-grade outcomes.

The risk is dilution. The mitigation is a **disciplined product rhythm**: one content engine, four packaging modes, three GTM motions running in parallel with three different lead-gen budgets and clear handoffs. (See Document 4 for the operational blueprint.)

---

## 4. Regulatory & IP Context

### 4.1 India — DPDPA 2023

The Digital Personal Data Protection Act 2023 governs personal-data processing in India. **QOrium is structurally low-risk** under DPDPA because:

- We do **not** store candidate PII. We sell content (questions, test cases, rubrics) — not assessment results.
- Our enterprise & staffing customers are the data fiduciaries; QOrium is at most a data processor for white-label authoring engagements (where SME human reviewers see candidate-anonymized data only).
- Data Processing Agreements (DPAs) and standard contractual clauses cover our enterprise contracts.

### 4.2 European Union — GDPR

Same posture: QOrium is a content vendor, not a data processor for end-candidate data. Where API-integrated platform clients pull questions from EU customers, the platform remains the data fiduciary.

### 4.3 Intellectual Property — The Defensible Moat

Question content IS QOrium's product, so IP strategy matters disproportionately:

- **Original-authorship documentation.** Every question logged with author, date, source corpus (if RAG-grounded), and validation reviewer. This protects against "you copied LeetCode" disputes.
- **Copyright registration** on bundled question packs (annual filings in India + US).
- **Watermarking & per-client variants.** Same conceptual question, different surface form, different test-case ranges per client. Enables forensic leak attribution.
- **Trade secret protection** on the authoring pipeline, prompts, and validation rubrics. NDAs with all SME reviewers.

### 4.4 US & UK — Bias / Adverse-Impact Regulation

EEOC (US) and Equality Act 2010 (UK) require that selection tests not produce disparate impact on protected classes. For psychometric and SJT content this is high-risk; for technical/coding content it is lower-risk but still nonzero. QOrium will need:

- I/O psychologist sign-off on any psychometric/SJT content
- Statistical adverse-impact testing for high-volume question packs
- Documented validation evidence for every released pack

This is a **moat**, not a tax: most pure-AI content shops cannot afford the I/O psych overhead. QOrium's hybrid model (AI authoring + I/O psych validation) makes it enterprise-defensible.

---

## 5. The "Why Now" Convergence

Five forces have converged in 2024–2026 that did not all hold in 2020:

| Force | 2020 State | 2026 State |
|---|---|---|
| AI authoring quality | Obviously poor | Indistinguishable from junior author drafts |
| GCC volume hiring in India | Recovering from COVID | 1,800+ GCCs, ~400K hires/year |
| Skills-first hiring adoption | <40% of enterprises | >62% of enterprises |
| Question leakage transparency | Anecdotal | Crawlable, measurable, public |
| Content cost gap (in-house vs outsourced) | 2× | 5–10× |

Any one of these would be insufficient to support a content-only company. All five together create a structural opening — and a window of 24–36 months before the major platforms either (a) build internal AI-authoring teams, (b) acquire a content company, or (c) accept content-as-a-service as a permanent supply-chain layer (the most likely outcome — they already accept it for proctoring, video interviewing, and reporting).

---

## 6. What This Means for QOrium

The market is large, growing, and structurally underserved on the content layer. Three concrete implications drive the rest of this blueprint:

1. **Position as a content factory, not a platform.** The moment QOrium tries to be an assessment platform, it is competing with HackerRank's $200M war chest. As a content supplier, HackerRank becomes a customer.
2. **Build the AI-validated pipeline first; sell the output second.** The defensible asset is the content engine + the I/O psych validation layer + the anti-leak rotation system. The packaging (API, CSV, widget, white-label) is downstream.
3. **Win India first, expand globally Year 2–3.** GCC tailwind, Talpro distribution, English-default content, lower-cost validation labor — every one of these is asymmetric in India. The same content engine can serve global customers in Year 2.

Document 2 audits the top 20 platforms in detail. Document 3 maps the format and role-coverage gaps. Document 4 is the QOrium blueprint itself.

---

## Appendix A — Sources

- Cognitive Market Research, *Talent Assessment Market Report* (2024): USD 22.5B 2024 baseline.
- Business Research Insights, *Talent Assessment Market Report 2035*: USD 32.16B 2026 → USD 57.09B 2035 at 9.4% CAGR.
- 360iResearch, *Talent Assessment Services Market 2025–2030*: USD 9.88B 2025 → USD 10.7B 2026.
- Verified Market Reports, *Global Talent Assessment Market 2026–2034*.
- HackerRank, HackerEarth, Codility, CodeSignal, Mercer Mettl, iMocha, WeCP, TestGorilla, Adaface, Vervoe — official product pages, support docs, and research papers (full URLs listed in Doc 2).
- WeCP founding history: Business Standard, YourStory, Crunchbase, ScoopEarth profile of Abhishek Kaushik & Mohit Goyal (NIT Trichy, 2016 founding).
- CodeSignal General Coding Framework — technical research papers (codesignal.com/resource/general-coding-assessment-framework/).
- NASSCOM GCC Council 2025 estimates — 1,600–1,800 GCCs in India.

(Full hyperlinked source list with URLs in the consolidated Master Mega Doc.)

---

*End of Document 1. Next: Document 2 — Top 20 Competitor Audit.*
# QOrium — Document 2 of 4
# The Top 20 Global Assessment Platforms — Profiles, Question-Creation Models & Strategic Posture

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Date:** May 1, 2026
**Status:** Draft v1.0

---

## Reading Guide

For each of the 20 platforms below, this document covers:

1. **Snapshot** — HQ, founding year, primary buyer, library size
2. **What they sell** — Core product offering
3. **How they create questions** — Authoring model (in-house team, AI, crowdsource, hybrid)
4. **Question-bank size & coverage** — What's in the library
5. **Strengths & weaknesses** — What they're good at, where the gap is
6. **QOrium relationship** — Customer, competitor, or partner

The profiles are grouped into four tiers:

- **Tier 1** — Global category leaders (5 platforms)
- **Tier 2** — Specialist coding/technical platforms (5 platforms)
- **Tier 3** — India-strong platforms (5 platforms)
- **Tier 4** — Emerging AI / niche / next-gen (5 platforms)

---

# TIER 1 — Global Category Leaders

These are the platforms that dominate global mind-share, set the pricing benchmarks, and have the largest enterprise install bases. They are QOrium's most strategic API customers (highest LTV) but also the highest sales-cycle friction.

---

## 1. HackerRank

| | |
|---|---|
| **HQ** | Mountain View, California, USA |
| **Founded** | 2009 (Vivek Ravisankar, Hari Karunanidhi) |
| **Primary buyer** | Engineering hiring teams at mid-to-large tech companies |
| **Library size** | ~1,000 curated coding challenges + 26M-developer community-contributed practice problems |
| **G2 rating** | 4.5 / 5 |
| **Market share (Pre-employment Assessment)** | ~3.5% |

**What they sell.** Coding-skills assessments, technical screens, AI-augmented interviewing (HackerRank for Work + HackerRank Interviews). Their flagship is the role-specific coding test bundled with a developer-friendly IDE.

**How they create questions.** A hybrid in-house + community model:

- **In-house content team** — Engineers turned content engineers, supported by a documented question-creation workflow. Each question is required to include a problem name, structured problem description, sample I/O, hidden test cases, scoring rubric, and a documented reference solution. Public support docs walk customers through the same workflow when authoring custom company-specific questions.
- **Community contribution** — The 26M-developer practice-problem corpus is largely community-contributed and used for developer engagement, not directly for hiring assessments.
- **Customer authoring** — Enterprises increasingly author their own questions (using HackerRank's tools) to defeat leakage.

**Strengths.** Brand recognition, dev community network effects, polished IDE, deep integrations (ATS, Greenhouse, Workday).

**Weaknesses.** Library is finite and famously leaked. Customer-authored questions are common precisely because the public library is burned. Pricing is premium ($25K–$200K/year) which leaves the mid-market under-served.

**QOrium relationship.** **API customer (Tier 1 target).** Their content team is overstretched and customer-author tools are an admission of library decay. A QOrium API offering "5,000 fresh, calibrated, never-leaked questions" is a credible cost-saving + signal-quality pitch.

---

## 2. Mercer Mettl (now Mercer | Mettl)

| | |
|---|---|
| **HQ** | Gurgaon, India (acquired by Mercer 2018) |
| **Founded** | 2010 (Ketan Kapoor, Tonmoy Shingal) |
| **Primary buyer** | Enterprise HR (psychometric + technical), university certification, government exams |
| **Library size** | "One of the most advanced and extensive" — estimated 100,000+ questions across 800+ tests |
| **Coverage** | Psychometric, aptitude, coding, domain (BFSI, IT, sales), language |

**What they sell.** Full-spectrum assessment platform — psychometric tests, aptitude, technical coding, domain-skills, certification exams. Also runs proctored online certification (Mettl is a major provider for many Indian university and government certification exams).

**How they create questions.** **The Mettl model is the gold standard for hybrid in-house authoring + I/O psychology validation:**

- **In-house team of industrial-organizational (I/O) psychologists, psychometricians, and data scientists** — Their content team is explicitly structured around scientific test development (a rare investment in the assessment space).
- **Item Response Theory (IRT) calibration** — Mettl explicitly applies IRT, which weights candidate scores by both correctness and the statistical difficulty of each item, derived from the empirical distribution of pass rates across thousands of test-takers.
- **Customer-authored content** — Bulk-upload and authoring tools for coding, MCQ, whiteboard questions are exposed to the customer.

**Strengths.** Largest library in India, scientific test development, government-grade proctoring, multi-language. Strong moat in psychometric science.

**Weaknesses.** Quality is inconsistent at scale (the size is also the weakness — not every question gets the same I/O psych treatment). Coding-track depth is weaker than HackerRank/Codility. UX dated relative to newer entrants.

**QOrium relationship.** **API + white-label content partner (Tier 1 target).** Mettl needs continuous library refresh; their I/O psych team is bandwidth-constrained. QOrium's calibrated content API + India-stack-specialization (SAP, Oracle, BFSI) directly maps to their gap.

---

## 3. HackerEarth

| | |
|---|---|
| **HQ** | Bengaluru, India (US offices, sold to Talview-backed group, originally founded 2012 by Sachin Gupta & Vivek Prakash) |
| **Founded** | 2012 |
| **Primary buyer** | GCC enterprises, mid-large tech, hackathon organizers |
| **Library size** | **40,000+ problems**, 1,000+ skills, 40+ programming languages |
| **Differentiator** | Hackathons-as-recruiting + intelligence-backed question engine |

**What they sell.** Coding assessments, technical screening, hackathon platform (a major source of pipeline for many GCCs). Recently leaning into AI-powered interviewing.

**How they create questions.** A combination of in-house authoring, hackathon-derived content (problems written by HE engineers and used in public competitions), and a documented customer-authoring workflow that supports custom libraries with manual or auto-evaluated test cases.

**Strengths.** Largest publicly-stated library (40K+), hackathon-derived problem freshness, strong India + GCC enterprise penetration, depth in algorithmic problems.

**Weaknesses.** Library leak rate is high (hackathon problems are public, then leak into hiring). Less depth in non-coding domains. Refresh cadence depends on hackathon flow.

**QOrium relationship.** **API customer (Tier 1 target).** HackerEarth's value prop is "library size" — but the library is increasingly tainted by leakage. A "premium, never-public, anti-leak-rotated" QOrium API would be a logical premium tier.

---

## 4. Codility

| | |
|---|---|
| **HQ** | Warsaw, Poland + London, UK (offices in San Francisco) |
| **Founded** | 2009 (Greg Jakacki) |
| **Primary buyer** | Enterprise engineering hiring, Fortune 500 |
| **Library size** | Smaller (curated), high quality |
| **Differentiator** | Industrial-Organizational psychology baked into every aspect |

**What they sell.** Premium technical assessment with a heavy emphasis on **work-sample fidelity** — the candidate solves problems that mirror real engineering tasks rather than abstract algorithm puzzles. Codility is positioned as the "scientifically rigorous" alternative to HackerRank.

**How they create questions.** **Codility's I/O Psychology Team is the centerpiece.** They have an explicit "Industrial-Organizational psychologist" function (`iopsych@codility.com`) that:

- Designs structured technical interview programs based on job-requirement analysis
- Develops custom structured-interview questions and scoring protocols
- Validates assessments for predictive accuracy
- Publishes research on hiring-interview structure (more structure = higher reliability + lower bias)

The I/O psychology team is the marketing centerpiece — Codility sells the science as much as the platform.

**Strengths.** Scientific rigor, predictive validity, defensibility under EEOC / bias scrutiny, premium brand. Trusted by Microsoft (and used in several Microsoft Codility-style practice tests publicly available).

**Weaknesses.** Slower content cycle (every question takes weeks of I/O psych validation). Smaller library. Premium pricing limits SMB reach.

**QOrium relationship.** **Less likely as direct API customer** (their I/O psych team is the moat — they would resist outsourcing). **More likely as a partnership** — QOrium provides high-velocity AI-authored draft content, Codility's I/O psych team validates it.

---

## 5. CodeSignal

| | |
|---|---|
| **HQ** | San Francisco, California, USA |
| **Founded** | 2014 (Tigran Sloyan, Aram Shatakhtsyan) |
| **Primary buyer** | Enterprise tech (Netflix, Robinhood, Asana cited customers) |
| **Library size** | Smaller, research-backed |
| **Differentiator** | "General Coding Framework" (GCF) — a published, peer-style research methodology |

**What they sell.** Realistic technical assessments + interviews using a coding environment that mirrors real developer tooling. Their differentiator is the **Coding Score** — a calibrated, framework-based skills score that customers trust as an industry benchmark.

**How they create questions.** CodeSignal's content development is **research-led**:

- The General Coding Framework (GCF) is a published, validated framework. They have technical research papers on the methodology.
- Internal claim of **2,800+ hours of research per assessment framework** (cited in marketing).
- Question authoring is done in-house by content engineers, with each question mapped to the GCF skill taxonomy and IRT-style difficulty calibration.
- Heavy investment in **assessment science** — they explicitly market their "Skills Evaluation Lab" as a research arm.

**Strengths.** Premium positioning, research-defensible Coding Score, very strong with senior-engineer hiring, polished UX.

**Weaknesses.** Smaller library, premium pricing, limited non-coding coverage (no psychometric, no domain MCQ).

**QOrium relationship.** **API content partner (Tier 1 target, but slower sale).** CodeSignal's research moat is its strength — but they need volume content to expand role coverage (they're thin outside core CS roles). QOrium's role-graph + India-stack content fills the white space.

---

# TIER 2 — Specialist Coding & Technical Platforms

These platforms compete in the technical-screening lane but have made specific architectural bets (live human interviews, take-home projects, real-codebase challenges) that differentiate them from the volume-screening Tier 1 players.

---

## 6. WeCP (We Create Problems)

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2016 (Abhishek Kaushik, Mohit Goyal — both NIT Trichy alumni) |
| **Primary buyer** | Enterprise engineering hiring, Indian IT services & GCCs |
| **Library size** | **7,000+ skill-sets, 5,000+ job functions** |
| **Origin story** | **Started as a question-selling business**, pivoted to platform 2019 |

**What they sell.** Technical assessment platform with a strong India focus. Their original product was literally a **"problems" (questions) catalog** sold to companies — the founders' insight was that public practice problems and real hiring questions came from the same source pool, defeating the screen.

**How they create questions.** **They built AI-driven, company-specific problem generation from Day 1.** Their early customers — Microsoft, Infosys, Mindtree, Robert Bosch, L&T — bought custom unique problem packs, not platform access. The pivot to platform was a 2019 decision; the original content business validated the exact wedge QOrium is targeting.

**Strengths.** Engineering credibility (founders are NIT engineers), India enterprise relationships, deep customer-authoring tools, AI question generation roots.

**Weaknesses.** As a platform, competes head-on with HackerRank and Mettl — diluted from its original content-only DNA. Their customer-authoring focus is itself an admission that platform-supplied content is insufficient.

**QOrium relationship.** **Most strategically interesting competitor.** WeCP validated the exact "question-factory" model QOrium is building, then walked away from it to chase platform economics. Their pivot is QOrium's permission slip. They are **simultaneously a competitive threat (could pivot back), a potential acquirer, and a benchmark of feasibility**.

---

## 7. DevSkiller

| | |
|---|---|
| **HQ** | Warsaw, Poland |
| **Founded** | 2014 |
| **Primary buyer** | Engineering teams hiring for backend, frontend, DevOps roles |
| **Library size** | Mid-size, focus on real-codebase tasks |
| **Differentiator** | "RealLifeTesting" methodology — candidates work on a pre-configured codebase |

**What they sell.** Technical screening using **real codebase challenges** — candidates build features in a pre-existing repo, not write isolated functions. This eliminates much of the LeetCode-style leakage problem.

**How they create questions.** Tasks are built by a content team that constructs realistic project codebases (React apps, Spring Boot services, etc.) with built-in bugs to fix or features to extend. Each task includes documented expected behavior, automated tests, and a scoring rubric. Customer-authoring is supported.

**Strengths.** Anti-leak by design (realistic tasks are harder to memorize), high signal for senior engineering roles, very strong for hiring on specific tech stacks.

**Weaknesses.** Each task is expensive to author (full codebase + tests + rubric). Slow library refresh. Less suitable for high-volume entry-level screening.

**QOrium relationship.** **Partnership candidate.** DevSkiller's expensive task-authoring model could benefit hugely from QOrium's AI-assisted task generation pipeline.

---

## 8. CoderPad / CodinGame for Work

| | |
|---|---|
| **HQ** | San Francisco (CoderPad) + Paris (CodinGame, parent CodinGame Group) |
| **Founded** | CoderPad 2013, CodinGame 2014 (merged 2022) |
| **Primary buyer** | Engineering teams running live coding interviews + technical screens |
| **Library size** | 90+ technical roles + community-contributed challenges |
| **Differentiator** | Best-in-class live collaborative coding IDE + gamified screening |

**What they sell.** Two complementary products: CoderPad (live coding interview environment, the Zoom-of-coding-IDEs) and CodinGame for Work (game-based technical screening). Together they cover both screen and interview.

**How they create questions.** CodinGame leverages a community of millions of developers who contribute "puzzles." For Work, content is curated from this corpus with additional in-house authoring + a customer-authoring framework.

**Strengths.** Best-in-class live interview UX, community-driven content engine, strong in Europe. Gamification differentiates for graduate hiring.

**Weaknesses.** Community-contributed content has the same leakage problem; gamification works for grad hiring but not for senior screens.

**QOrium relationship.** **API customer (Tier 2 target).** Their content backbone is community — quality varies. A QOrium-supplied "premium curated" tier is a logical upsell.

---

## 9. Karat

| | |
|---|---|
| **HQ** | Seattle, Washington, USA |
| **Founded** | 2014 (Mohit Bhende, Jeffrey Spector) |
| **Primary buyer** | Mid-large tech companies running outsourced first-round technical interviews |
| **Library size** | Internal — used by Karat's own Interview Engineers |
| **Differentiator** | **Live, structured technical interviews delivered by a network of trained "Interview Engineers"** |

**What they sell.** Outsourced first-round technical interviewing-as-a-service. Karat's network of trained Interview Engineers (typically senior software engineers moonlighting) conducts structured, recorded technical interviews on behalf of the hiring company. The hiring company gets a transcript, score, and recommendation.

**How they create questions.** Internal library of structured interview questions, designed and validated for inter-rater consistency across the Interview Engineer network. Heavy emphasis on rubric design, scoring calibration, and interviewer training.

**Strengths.** Solves the "we have no senior engineers free to interview" pain. Highly structured = lower bias = better signal. Defensible moat in the human-network.

**Weaknesses.** Service business with people-cost ceiling. Limited scalability vs pure-software platforms. Premium pricing.

**QOrium relationship.** **Content partner.** Karat's library is internal but constantly needs refresh — QOrium-authored questions could feed the Karat network. Lower direct API revenue, but a credibility-stamping partnership.

---

## 10. Byteboard

| | |
|---|---|
| **HQ** | San Francisco, California (Google spin-out) |
| **Founded** | 2019 (originally inside Google's Area 120) |
| **Primary buyer** | Companies wanting to reduce bias in technical screening |
| **Library size** | Curated, project-based scenarios |
| **Differentiator** | **Project-based take-home interviews designed by ex-Google engineers** to predict on-the-job performance |

**What they sell.** Take-home project interviews — candidates spend 2 hours reviewing a design doc, fixing a bug, or extending a real-world feature. Designed explicitly to reduce unconscious bias and to test judgment, not LeetCode recall.

**How they create questions.** In-house team of ex-Google engineers + I/O psychologists. Each scenario is a multi-document project (PRD, design doc, partial code, partial tests) — each takes weeks to author and validate.

**Strengths.** Very high signal for product engineering roles. Strong bias-reduction story. Polished UX.

**Weaknesses.** Each scenario is enormously expensive to build → small library, slow refresh. Over-engineered for high-volume entry-level hiring.

**QOrium relationship.** **Partnership candidate.** Byteboard's authoring cost is a known constraint. QOrium-assisted authoring could 3–5× their library refresh cadence.

---

# TIER 3 — India-Strong Platforms

These platforms have particular relevance for QOrium's GCC + Indian-staffing wedge. They tend to under-invest in I/O psychology depth but over-index on India-specific features (regional language support, BFSI/IT-services domain content, integration with Indian ATS like Naukri, Talent500).

---

## 11. iMocha

| | |
|---|---|
| **HQ** | Pune, India + Edison, USA |
| **Founded** | 2015 (Sujit Karpe, Amit Mishra) |
| **Primary buyer** | Enterprise + GCC for both pre-employment and **internal skills-intelligence** |
| **Library size** | **2,500+ skills, 35+ coding languages, 10,000+ pre-built tests** |
| **Differentiator** | Pivoting hard into **"Skills Intelligence Platform"** — internal mobility + workforce skills mapping |

**What they sell.** Full-spectrum skills assessment, pivoting from pre-employment into a broader skills-intelligence and internal-mobility play. Their **AI-EnglishPro** product (NLP-based business English assessment, CEFR-aligned) is a notable differentiator.

**How they create questions.** Hybrid in-house + customer-authoring + AI-assisted authoring. Bulk-upload and combine-with-library tools are mature. EnglishPro uses computational linguistics for spoken-and-written English scoring — a sophisticated AI pipeline.

**Strengths.** India + US dual presence, enterprise relationships, English-proficiency niche, internal-mobility positioning is correct ahead of the market.

**Weaknesses.** Coding-depth is shallower than HackerRank/Codility. Library size masks variable quality. Spreading thin between hiring + internal mobility + L&D.

**QOrium relationship.** **API + content-partner (Tier 1 priority for India play).** iMocha's library breadth is partly a marketing position; backend coding/domain content is thin. QOrium-supplied India-stack (SAP, Oracle, BFSI) content + EnglishPro-feeder content is a clean fit.

---

## 12. Xobin

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2013 |
| **Primary buyer** | Mid-market Indian enterprises, IT services, recruitment firms |
| **Library size** | Tests for **9,000+ roles**, 1,800+ skills |
| **Differentiator** | Adaptive testing, mid-market price point |

**What they sell.** Mid-market assessment platform with strong adaptive-testing engine. Positioned as a more affordable Mettl/HackerEarth alternative for Indian SMBs and mid-tier IT services firms.

**How they create questions.** In-house content team, customer-authoring tools, some AI-assisted authoring. Less I/O psychology rigor than Mettl but adequate for mid-market trust.

**Strengths.** Mid-market price point ($-friendly), adaptive engine differentiator, India focus.

**Weaknesses.** Smaller content team = slower library refresh; competes on price more than science.

**QOrium relationship.** **API customer (Tier 3 — easier sell, smaller ACV).** Mid-market platforms with thin content teams are QOrium's quickest API wins. Self-serve API at the right price could lock in 50+ such platforms.

---

## 13. HirePro

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2004 |
| **Primary buyer** | Indian IT services giants — TCS, Wipro, Infosys, Cognizant, HCL |
| **Library size** | Massive — IT services hiring is HirePro's core; large internal library |
| **Differentiator** | Deep relationships with Indian IT services + campus hiring at scale |

**What they sell.** End-to-end campus-hiring + lateral-hiring assessment platform. Unmatched for Indian IT services campus hiring drives (volumes of 50,000–500,000 candidates per drive).

**How they create questions.** In-house content team specialized in IT services + BFSI domain content. Long history (since 2004) gives them a deep institutional library.

**Strengths.** Unbeatable for high-volume Indian IT services hiring. Deep proctoring + venue-based testing capabilities (often does on-campus offline + online assessments).

**Weaknesses.** Less modern UX, limited expansion outside India IT services, library refresh is bandwidth-limited.

**QOrium relationship.** **Content partner / white-label (Tier 2 target for India play).** HirePro's customers (TCS, Infy, Wipro) are also QOrium's direct enterprise targets. Could be either competitor (if they expand content licensing) or partner (if they license QOrium content for refresh velocity).

---

## 14. Speedexam / SkillRobo / Talview (cluster of mid-market India platforms)

| | |
|---|---|
| **HQ** | Various (Bengaluru, Chennai, Hyderabad) |
| **Founded** | 2010s |
| **Primary buyer** | Mid-market Indian enterprises, training institutes |
| **Library size** | Smaller; many serve as resellers/integrators |
| **Differentiator** | Affordable, India-language support, training-center focus |

**What they sell.** Mid-market assessment + proctoring tools, often bundled with corporate training platforms. Talview specifically has invested in AI-proctoring and conversational interviewing.

**How they create questions.** Mostly customer-authored, with thin in-house libraries used as defaults. Heavy reliance on customers bringing their own content.

**Strengths.** Low price, regional-language support, training-institute distribution.

**Weaknesses.** Content quality is the explicit weakness. They are content-starved — exactly QOrium's pitch.

**QOrium relationship.** **Quickest API wins.** Self-serve API tier targeted at this cluster could land 30+ logos in Year 1.

---

## 15. Adaface

| | |
|---|---|
| **HQ** | Singapore (founded by Indian engineers, India operations strong) |
| **Founded** | 2018 (Deepti Chopra, Siddhartha Gunti — Adani / IIT alumni) |
| **Primary buyer** | Mid-market enterprises globally; strong India presence |
| **Library size** | **10,273 "non-googleable" questions, 500+ ready-made tests for 500+ roles** |
| **Differentiator** | **Conversational chatbot ("Ada") + non-googleable questions** |

**What they sell.** Conversational assessment via a chatbot interface. Their explicit positioning is "non-googleable" — every question in their library is hand-authored to defeat Google/Stack Overflow / LeetCode lookup.

**How they create questions.** In-house authoring + heavy investment in **anti-leak, anti-Google curation**. The non-googleable promise is backed by an internal QA process that searches each question against major leak sites before release.

**Strengths.** Anti-leak positioning is correct (and rare). Conversational UX is candidate-friendly. Strong mid-market traction.

**Weaknesses.** Library size (10K) is a fraction of HackerEarth's 40K — they trade volume for quality, but enterprises with high-volume needs may need more. Conversational UI doesn't fit all roles (live coding pads do better for senior engineering screens).

**QOrium relationship.** **Partnership + API customer.** Adaface validates the anti-leak positioning. QOrium's anti-leak rotation engine is upstream of their human-curation effort — could be a wholesale content source for them.

---

# TIER 4 — Emerging AI / Niche / Next-Gen

These are the platforms making bets on AI, novel formats, or specific niches. They are smaller today but represent where the puck is moving — and they are the most natural QOrium API customers because they don't have legacy content teams to defend.

---

## 16. Vervoe

| | |
|---|---|
| **HQ** | Melbourne, Australia + New York, USA |
| **Founded** | 2016 (Omer Molad, David Weinberg) |
| **Primary buyer** | Mid-large enterprises focused on work-sample testing |
| **Library size** | **300,000+ question bank, 300+ assessment templates** |
| **Differentiator** | **AI-graded job simulations** — three-model architecture (How / What / Preference) |

**What they sell.** AI-powered job simulations. Candidates complete realistic job tasks; Vervoe's AI grades them using three models: the **How Model** (interaction patterns), the **What Model** (response content), and the **Preference Model** (tuned to each customer's grading style with ~20 calibration grades).

**How they create questions.** Hybrid: customer-authored, AI-generated, and from Vervoe's library of 300K+ questions and 300+ templates. The **AI-Powered Assessment Builder** generates a custom assessment from a job description or job title.

**Strengths.** Largest stated question bank in the industry (300K+). AI grading is mature and customer-tunable. Work-sample fidelity is high.

**Weaknesses.** AI grading requires customer training (~20 calibration grades) which adds friction. Library quality varies (300K is sheer volume, not all curated).

**QOrium relationship.** **API content partner.** Vervoe's library size masks quality variance — a curated, calibrated QOrium content layer would be a premium upgrade. Their AI-grading layer + QOrium content layer is a complementary stack.

---

## 17. SHL

| | |
|---|---|
| **HQ** | London, UK |
| **Founded** | 1977 |
| **Primary buyer** | Fortune 500 enterprises, government, military |
| **Library size** | Decades-deep psychometric library, narrow on coding |
| **Differentiator** | **The most-validated psychometric library in the world** |

**What they sell.** Premium psychometric and cognitive ability testing. SHL's tests (OPQ, Verify, Talent Measurement) are standards in enterprise hiring globally — every Big 4 consultancy and most of the FTSE 100 use SHL as a screening layer.

**How they create questions.** Decades of in-house I/O psychology and psychometric science. New items go through extensive trial, calibration, fairness analysis (adverse-impact testing), and longitudinal validation. Each item is a multi-month investment.

**Strengths.** Unmatched scientific rigor in psychometrics. Defensible under any regulatory regime. Premium pricing reflected.

**Weaknesses.** Coding/technical content is shallow — they partner with HackerRank or Codility rather than build it themselves. Slow innovation cycle. UX dated.

**QOrium relationship.** **Partnership / content partner for technical content.** SHL needs technical-stack content to round out their offering; QOrium's coding + domain content + India-stack specialization fills their gap. Partnership > API customer.

---

## 18. Talogy (Cubiks + PSI Services + IBM Kenexa)

| | |
|---|---|
| **HQ** | London, UK |
| **Founded** | Roll-up of Cubiks (2018), PSI Services, ETS People → "Talogy" brand |
| **Primary buyer** | Fortune 500, government, military |
| **Library size** | Deep psychometric, narrow on coding |
| **Differentiator** | Talent science consulting + assessment |

**What they sell.** Similar to SHL — premium psychometric + leadership assessment, increasingly AI-augmented.

**How they create questions.** In-house I/O psych team, similar to SHL.

**Strengths.** Scientific rigor, leadership-assessment depth.

**Weaknesses.** Same as SHL — thin on technical content.

**QOrium relationship.** **Partnership / content partner.**

---

## 19. Glider AI

| | |
|---|---|
| **HQ** | Foster City, California, USA |
| **Founded** | 2014 |
| **Primary buyer** | Mid-large enterprises, GCCs |
| **Library size** | 500+ skills |
| **Differentiator** | **Generative-AI-first assessment platform** — explicitly positions on AI-generated content |

**What they sell.** AI-augmented skills validation + interview platform. Heavy on AI-generated questions and AI-graded responses.

**How they create questions.** Generative AI + in-house validation. Their explicit pitch is that AI generates better, more current content than slow in-house teams — this is **the closest direct positioning competitor to QOrium for the AI-generation pitch**.

**Strengths.** AI-first positioning is differentiated. Cost structure is favorable.

**Weaknesses.** Quality control is the open question — pure-AI content without rigorous validation has had public failures. Less I/O psychology depth.

**QOrium relationship.** **Direct competitor on positioning** — but their model is "AI-only platform" while QOrium's is "AI-authored + I/O psych validated content for ANY platform." Partnership unlikely; QOrium needs to position against them as "the validated, defensible alternative."

---

## 20. Testlify (+ honorable mention to Toggl Hire, Canditech, eSkill)

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2022 |
| **Primary buyer** | Startups, mid-market |
| **Library size** | 1,800+ tests across roles |
| **Differentiator** | Affordable, modern, fast-growing Adaface-style alternative |

**What they sell.** Modern, low-friction skills assessment for SMBs and mid-market. Multiple question types (MCQ, coding, audio, video, case study), AI-augmented authoring.

**How they create questions.** In-house + customer-authored + AI-assisted. Volume-over-rigor model.

**Strengths.** Modern UX, fast growth, affordable, multi-format.

**Weaknesses.** Newer = thinner content team; quality variance is the trade-off for affordability.

**QOrium relationship.** **Easy API customer.** Newer mid-market platforms with thin content teams are QOrium's "first 50 logos" play.

**Honorable mentions in this tier:**
- **Toggl Hire** (Estonia) — Skills-test focused, modern UX, mid-market.
- **Canditech** (Israel) — AI skill tests, work-sample focus.
- **eSkill** (US) — Long-running, broad library, traditional UX.
- **IKM Assessments** (US) — Legacy, mostly MCQ, no coding — illustrates what NOT to be in 2026.

---

# Cross-Cutting Pattern: How Question Creation Actually Works

After profiling all 20, six distinct authoring models emerge:

| # | Model | Used by | Strength | Weakness |
|---|---|---|---|---|
| 1 | **In-house engineering authors** (no I/O psych) | HackerRank, HackerEarth, WeCP, most India platforms | Fast, technically credible | Bias/leakage blind spots |
| 2 | **In-house I/O psychologist team** | Mettl, Codility, CodeSignal (partial), SHL, Talogy | Defensible, predictive validity | Slow, expensive, doesn't scale |
| 3 | **Community-contributed** | HackerRank practice, CodinGame, LeetCode-style | Massive volume, free/cheap | Quality variance, leakage |
| 4 | **Customer-authored (BYO content)** | All of them, increasingly | Customer locks in their own IP | Pushes the cost back to the customer |
| 5 | **AI-generated + human validated** | Adaface, Vervoe, Glider, WeCP, increasingly all | Speed + quality combined | Validation pipeline is the moat |
| 6 | **Outsourced human-network (interviewers)** | Karat | Highest signal for senior screens | People-cost ceiling |

**QOrium's bet:** Combine #2 (I/O psychology rigor) + #5 (AI authoring speed) into a single content-as-a-service company that supplies all six end-state models above. Nobody is doing this end-to-end today.

---

# What This Means for QOrium Positioning

Three inescapable conclusions from the audit:

1. **No platform is content-rich AND content-fresh AND content-defensible.** Each makes a 2-of-3 trade-off. QOrium's value prop is the 3-of-3 combination, packaged as a service.
2. **The "anti-leak" wedge is wide open.** Only Adaface explicitly markets it; nobody operationalizes it as a continuous engineering process. QOrium's anti-leak rotation engine is genuinely novel.
3. **India-specific stack content is materially under-served.** SAP ABAP, Oracle HCM, Salesforce, BFSI core systems, embedded automotive — every GCC TA leader has this on their wish list, and no platform's library covers it adequately.

Document 3 quantifies these gaps in matrices. Document 4 turns them into the QOrium go-to-market blueprint.

---

## Appendix B — Source URLs (Document 2 only)

- HackerRank: hackerrank.com · support.hackerrank.com (question creation docs)
- HackerEarth: hackerearth.com · help.hackerearth.com
- Codility: codility.com/blog/bringing-industrial-organizational-psychology-to-tech-hiring/ · engage.codility.com
- CodeSignal: codesignal.com/resource/general-coding-assessment-framework/ · discover.codesignal.com (technical research papers)
- Mercer Mettl: mettl.com · resources.mettl.com (psychometric assessments)
- iMocha: imocha.io · blog.imocha.io
- TestGorilla: testgorilla.com · support.testgorilla.com
- WeCP: wecreateproblems.com · business-standard.com (founding history) · yourstory.com (company profile) · crunchbase.com
- Adaface: adaface.com
- Vervoe: vervoe.com · help.vervoe.com (How / What / Preference Models)
- Karat: karat.com
- Byteboard: byteboard.dev
- DevSkiller: devskiller.com
- Xobin: xobin.com
- HirePro: hirepro.in
- SHL: shl.com
- Talogy: talogy.com
- Glider AI: glider.ai
- Testlify: testlify.com · testlify.com/adaface-alternatives/
- CoderPad / CodinGame: coderpad.io · codingame.com/work

(All URLs validated against May 2026 search results; full hyperlink list in Master Mega Doc.)

---

*End of Document 2. Next: Document 3 — Gap Analysis with format + role coverage matrices.*
# QOrium — Document 3 of 4
# Gap Analysis — Where the Top 20 Fall Short and Where QOrium Wins

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Date:** May 1, 2026
**Status:** Draft v1.0

---

## Reading Guide

This document quantifies and visualizes the structural gaps surfaced in Document 2. It is organized in five sections:

1. **The Universe of Assessment Question Formats** — every format that exists, mapped to use cases
2. **Format Coverage Matrix** — Top 20 × format coverage
3. **Role / Stack Coverage Matrix** — Top 20 × role-domain coverage (with India-specific stack)
4. **Question-Lifecycle Maturity Matrix** — leakage, calibration, governance, refresh
5. **The QOrium Wedge** — synthesizing the seven structural gaps into an operating thesis

---

## 1. The Universe of Assessment Question Formats

The popular shorthand "MCQ + coding" hides a large taxonomy. Below is the comprehensive list of formats actually used in enterprise hiring assessments today, organized by candidate-interaction modality.

### 1.1 Selected-Response Formats

| Format | What it tests | Typical use |
|---|---|---|
| **Multiple Choice (MCQ — single correct)** | Recall, recognition, simple application | Aptitude, knowledge tests, domain MCQ |
| **Multiple Select (MSQ — many correct)** | Discrimination, partial-knowledge | Concept assessment, certification |
| **True/False** | Fact recall (lowest fidelity) | Basic knowledge screens |
| **Matching / Drag-and-drop pairing** | Relational knowledge | Vocabulary, concept mapping |
| **Sequencing / Ordering** | Procedural knowledge | Process steps, sorting |
| **Fill-in-the-Blank (numeric / text)** | Recall + precision | Math, vocabulary, formulae |
| **Hot-spot / Image-region selection** | Visual identification | Anatomy, UI testing, design |

### 1.2 Constructed-Response Formats

| Format | What it tests | Typical use |
|---|---|---|
| **Short Answer / Open-ended Text** | Recall + articulation | Domain writing, problem analysis |
| **Long-form Essay** | Reasoning, communication, structured argument | Consulting, leadership, strategy |
| **Case Study Response** | Analytical depth + business judgment | Consulting, product management, leadership |
| **Code Submission (function-level)** | Algorithmic thinking, syntax fluency | All technical screening |
| **Code Submission (project / codebase)** | Real-world engineering judgment | Senior engineering hires (DevSkiller, Byteboard model) |
| **Whiteboard / Diagram** | System design, architecture | Senior engineering, product design |
| **Spreadsheet / Document Production** | Tool fluency + business communication | Finance, ops, consulting |

### 1.3 Performance / Simulation Formats

| Format | What it tests | Typical use |
|---|---|---|
| **Coding in IDE (live + recorded)** | Real-world coding workflow | Engineering interviews (CoderPad model) |
| **SQL Sandbox** | Data fluency | Data analyst, data engineer |
| **Data Notebook (Jupyter / Colab)** | End-to-end data analysis | Data scientist, ML engineer |
| **Cloud Sandbox (AWS / Azure / GCP)** | Hands-on cloud ops | DevOps, SRE, Cloud Engineer |
| **CRM / ERP Simulation (Salesforce, SAP, Oracle)** | Domain-tool mastery | GCC + IT services niche |
| **Customer-Service / Support Simulation** | Soft skills + product knowledge | Support, success, sales |
| **Sales Pitch Roleplay (with AI rep)** | Sales conversation skills | SDR, AE, sales leadership |
| **Design Critique / Mockup Review** | Visual + UX judgment | Designers, PMs |

### 1.4 Behavioral / Psychometric Formats

| Format | What it tests | Typical use |
|---|---|---|
| **Personality (Big Five, OPQ-style)** | Trait disposition | Cultural fit, leadership |
| **Cognitive Ability (IQ-style numerical, verbal, abstract)** | General mental ability — strongest predictor of job performance per meta-analyses | Graduate hiring, management |
| **Situational Judgment Test (SJT)** | Practical judgment in role-relevant scenarios | All roles, especially leadership and customer-facing |
| **Forced-Choice / Ranking** | Discriminating preferences | Personality, values |
| **Emotional Intelligence (EQ)** | Self/social awareness | Leadership, customer success |
| **Integrity / Reliability** | Counterproductive behavior risk | Sensitive roles, compliance |

### 1.5 Media & Modality Formats

| Format | What it tests | Typical use |
|---|---|---|
| **Video Response (asynchronous)** | Communication, presentation, "soft skills" | Sales, customer-facing, leadership |
| **Video Interview (live, structured)** | Real-time interaction quality | All later-stage interviews |
| **Voice / Audio Response** | Spoken communication, language fluency | Support, BPO, language roles |
| **Game-based Assessment** | Cognitive ability via novel-task performance | Graduate hiring, bias-reduction emphasis |
| **Conversational / Chatbot Assessment** | Interactive testing with AI tutor (Adaface model) | Mid-volume screening |
| **AR/VR Simulation (emerging)** | Spatial / kinesthetic skills | Surgery, manufacturing, defense |

### 1.6 Emerging / Next-Gen Formats (2025–2026)

| Format | What it tests | Typical use |
|---|---|---|
| **AI Prompt-Engineering Test** | Working WITH AI — composing/iterating prompts | Engineering, marketing, product |
| **AI-Augmented Code Review** | Reviewing AI-generated code, identifying issues | Senior engineering |
| **Pair-Programming with AI** | Collaboration with AI agents | Engineering of all levels |
| **Autonomous Workflow Design** | Designing agentic workflows | Engineering, ops, product |
| **Data-Pipeline Building** | End-to-end ETL + ML productionization | Data engineer, ML engineer |
| **Security / Red-team Simulation** | Offensive + defensive security | Security engineer, SOC analyst |

**Total taxonomy:** ~40 distinct format-categories. **No single platform covers more than 12-15 of these.** This is the first dimension of the gap.

---

## 2. Format Coverage Matrix — Top 20 Platforms

Legend: ● = strong native coverage · ◐ = partial / customer-authored only · ○ = weak or absent

The format universe (40+ formats from §1) is grouped into four categories below, with one sub-matrix per category. Each sub-matrix shows all 21 platforms (rows) × 5 representative formats (columns). This split keeps the data legible across rendering environments while preserving the full picture.

### 2.1 Selected-Response & Core Coding Formats

| Platform | MCQ | MSQ | Code (fn) | Code (proj) | SQL |
|---|---|---|---|---|---|
| HackerRank | ● | ◐ | ● | ◐ | ● |
| HackerEarth | ● | ◐ | ● | ◐ | ● |
| Codility | ● | ◐ | ● | ● | ● |
| CodeSignal | ● | ◐ | ● | ● | ● |
| Mercer Mettl | ● | ● | ● | ◐ | ● |
| iMocha | ● | ● | ● | ◐ | ● |
| TestGorilla | ● | ● | ◐ | ○ | ◐ |
| WeCP | ● | ● | ● | ◐ | ● |
| Adaface | ● | ◐ | ● | ◐ | ● |
| Vervoe | ● | ● | ● | ◐ | ◐ |
| Karat | ○ | ○ | ● | ● | ● |
| Byteboard | ○ | ○ | ◐ | ● | ◐ |
| DevSkiller | ● | ◐ | ● | ● | ● |
| Xobin | ● | ● | ● | ◐ | ● |
| HirePro | ● | ● | ● | ◐ | ● |
| Speedexam/Talview | ● | ● | ◐ | ○ | ◐ |
| CoderPad/CodinGame | ◐ | ○ | ● | ● | ● |
| SHL | ● | ● | ◐ | ○ | ○ |
| Talogy | ● | ● | ○ | ○ | ○ |
| Glider AI | ● | ● | ● | ◐ | ● |
| Testlify | ● | ● | ◐ | ○ | ◐ |
| **QOrium target (v1)** | **●** | **●** | **●** | **●** | **●** |

### 2.2 Performance / Simulation Formats

| Platform | Data Notebook | Whiteboard / Sys Design | Cloud Sandbox | CRM/ERP Sim | Real Codebase |
|---|---|---|---|---|---|
| HackerRank | ◐ | ● | ◐ | ○ | ◐ |
| HackerEarth | ◐ | ◐ | ◐ | ○ | ◐ |
| Codility | ◐ | ● | ◐ | ○ | ◐ |
| CodeSignal | ● | ● | ◐ | ○ | ◐ |
| Mercer Mettl | ◐ | ◐ | ◐ | ◐ | ◐ |
| iMocha | ◐ | ● | ◐ | ◐ | ◐ |
| TestGorilla | ○ | ○ | ○ | ○ | ○ |
| WeCP | ◐ | ● | ◐ | ○ | ◐ |
| Adaface | ◐ | ◐ | ○ | ○ | ○ |
| Vervoe | ○ | ◐ | ○ | ◐ | ◐ |
| Karat | ● | ● | ◐ | ○ | ● |
| Byteboard | ◐ | ● | ◐ | ○ | ● |
| DevSkiller | ◐ | ◐ | ◐ | ○ | ● |
| Xobin | ◐ | ◐ | ◐ | ◐ | ◐ |
| HirePro | ◐ | ◐ | ◐ | ◐ | ◐ |
| Speedexam/Talview | ○ | ○ | ○ | ○ | ○ |
| CoderPad/CodinGame | ◐ | ● | ◐ | ○ | ◐ |
| SHL | ○ | ○ | ○ | ○ | ○ |
| Talogy | ○ | ○ | ○ | ○ | ○ |
| Glider AI | ◐ | ◐ | ◐ | ○ | ◐ |
| Testlify | ○ | ○ | ○ | ○ | ○ |
| **QOrium target (v1)** | **●** | **●** | **●** | **●** | **●** |

### 2.3 Behavioral / Psychometric / Cognitive Formats

| Platform | SJT | Psychometric | Cognitive | Case Study | Game-based |
|---|---|---|---|---|---|
| HackerRank | ○ | ○ | ◐ | ○ | ○ |
| HackerEarth | ○ | ○ | ◐ | ○ | ○ |
| Codility | ◐ | ○ | ◐ | ○ | ○ |
| CodeSignal | ○ | ○ | ◐ | ○ | ○ |
| Mercer Mettl | ● | ● | ● | ◐ | ◐ |
| iMocha | ● | ● | ● | ◐ | ◐ |
| TestGorilla | ● | ● | ● | ◐ | ◐ |
| WeCP | ◐ | ◐ | ◐ | ◐ | ◐ |
| Adaface | ◐ | ◐ | ◐ | ◐ | ○ |
| Vervoe | ● | ● | ● | ● | ● |
| Karat | ○ | ○ | ○ | ◐ | ○ |
| Byteboard | ○ | ○ | ○ | ● | ○ |
| DevSkiller | ○ | ○ | ○ | ○ | ○ |
| Xobin | ● | ◐ | ● | ◐ | ◐ |
| HirePro | ● | ◐ | ● | ◐ | ○ |
| Speedexam/Talview | ◐ | ◐ | ● | ◐ | ○ |
| CoderPad/CodinGame | ○ | ○ | ◐ | ○ | ● |
| SHL | ● | ● | ● | ● | ● |
| Talogy | ● | ● | ● | ● | ◐ |
| Glider AI | ● | ◐ | ● | ● | ◐ |
| Testlify | ● | ● | ● | ◐ | ◐ |
| **QOrium target (v1)** | **●** | **●** | **●** | **●** | **●** |

### 2.4 Media, Modality & Emerging Formats

| Platform | Video | Voice | Conversational | Sales Sim | AI-Prompt |
|---|---|---|---|---|---|
| HackerRank | ◐ | ○ | ○ | ○ | ○ |
| HackerEarth | ◐ | ○ | ○ | ○ | ○ |
| Codility | ◐ | ○ | ○ | ○ | ○ |
| CodeSignal | ◐ | ○ | ○ | ○ | ◐ |
| Mercer Mettl | ● | ◐ | ○ | ◐ | ○ |
| iMocha | ● | ● | ◐ | ◐ | ○ |
| TestGorilla | ● | ◐ | ◐ | ◐ | ○ |
| WeCP | ◐ | ◐ | ◐ | ○ | ◐ |
| Adaface | ◐ | ○ | ● | ○ | ◐ |
| Vervoe | ● | ● | ◐ | ● | ◐ |
| Karat | ○ | ○ | ○ | ○ | ◐ |
| Byteboard | ○ | ○ | ○ | ○ | ◐ |
| DevSkiller | ○ | ○ | ○ | ○ | ◐ |
| Xobin | ● | ◐ | ○ | ○ | ○ |
| HirePro | ● | ◐ | ○ | ◐ | ○ |
| Speedexam/Talview | ● | ◐ | ◐ | ○ | ○ |
| CoderPad/CodinGame | ◐ | ○ | ○ | ○ | ◐ |
| SHL | ● | ◐ | ◐ | ◐ | ○ |
| Talogy | ● | ◐ | ◐ | ◐ | ○ |
| Glider AI | ● | ◐ | ● | ◐ | ● |
| Testlify | ● | ◐ | ◐ | ○ | ○ |
| **QOrium target (v1)** | **●** | **●** | **●** | **●** | **●** |

### Pattern: Where the Coverage Holes Are Concentrated

Reading the four sub-matrices together, **six format categories show systematic under-coverage** (mostly ○ or ◐, rarely ●):

1. **Real-codebase / project-based coding** — only Karat, Byteboard, DevSkiller cover well
2. **Cloud sandbox simulations** (AWS / GCP / Azure hands-on) — universally weak
3. **CRM/ERP simulations** (Salesforce, SAP, Oracle hands-on) — universally absent
4. **AI Prompt-Engineering tests** — only Glider AI is close; the rest are zero
5. **Sales-pitch roleplay** — only Vervoe (and Glider partially) — huge SDR/AE hiring market under-served
6. **Conversational / chatbot assessments** — Adaface owns; nobody else has shipped

These six format gaps represent **multi-billion-dollar enterprise hiring use cases** — every one of them is a QOrium content category.

---

## 3. Role / Stack Coverage Matrix

The format gap is one dimension. The role-coverage gap is the other. Below: roles grouped into three categories — **Core Engineering**, **India Enterprise Stack**, and **Non-Tech Roles** — each shown as its own sub-matrix to keep the column count readable. The 10 representative platforms are the same across all three.

Legend: ● = depth · ◐ = surface · ○ = weak/absent

### 3.1 Core Engineering Roles

| Role | HackerRank | HackerEarth | Codility | CodeSignal | Mettl |
|---|---|---|---|---|---|
| Core CS / DSA | ● | ● | ● | ● | ◐ |
| Frontend (React, Vue, Angular) | ● | ● | ◐ | ● | ◐ |
| Backend (Java, Python, Go, Node) | ● | ● | ● | ● | ◐ |
| DevOps / SRE / Cloud | ◐ | ◐ | ◐ | ◐ | ○ |
| Data Engineering / SQL / ETL | ● | ◐ | ◐ | ● | ◐ |
| Data Science / ML | ● | ● | ◐ | ● | ◐ |
| Mobile (iOS / Android / RN) | ◐ | ◐ | ◐ | ◐ | ○ |
| Security / SOC / DevSecOps | ◐ | ◐ | ○ | ○ | ○ |
| QA / Test Automation | ◐ | ◐ | ◐ | ◐ | ◐ |

| Role | iMocha | WeCP | Vervoe | SHL | India platforms |
|---|---|---|---|---|---|
| Core CS / DSA | ◐ | ● | ◐ | ○ | ◐ |
| Frontend (React, Vue, Angular) | ◐ | ● | ◐ | ○ | ◐ |
| Backend (Java, Python, Go, Node) | ◐ | ● | ◐ | ○ | ◐ |
| DevOps / SRE / Cloud | ○ | ◐ | ◐ | ○ | ○ |
| Data Engineering / SQL / ETL | ◐ | ◐ | ○ | ○ | ◐ |
| Data Science / ML | ◐ | ● | ◐ | ○ | ◐ |
| Mobile (iOS / Android / RN) | ◐ | ◐ | ○ | ○ | ◐ |
| Security / SOC / DevSecOps | ○ | ◐ | ○ | ○ | ○ |
| QA / Test Automation | ◐ | ◐ | ◐ | ○ | ◐ |

### 3.2 India Enterprise Stack Roles

| Role | HackerRank | HackerEarth | Codility | CodeSignal | Mettl |
|---|---|---|---|---|---|
| Embedded Systems / Automotive | ○ | ◐ | ○ | ○ | ◐ |
| Mainframe / COBOL | ○ | ○ | ○ | ○ | ◐ |
| SAP (ABAP, FICO, MM, HCM) | ○ | ◐ | ○ | ○ | ● |
| Oracle (DBA, EBS, HCM, Apps) | ○ | ◐ | ○ | ○ | ● |
| Salesforce (Admin, Dev, CPQ) | ○ | ◐ | ○ | ○ | ● |
| ServiceNow / Workday / Pega | ○ | ○ | ○ | ○ | ◐ |
| Guidewire / Duck Creek (Insurance core) | ○ | ○ | ○ | ○ | ◐ |
| BFSI Domain (Capital Markets, Cards, Loans) | ○ | ○ | ○ | ○ | ● |
| Cybersecurity Domain (CISSP, OSCP-ish) | ○ | ◐ | ○ | ○ | ◐ |

| Role | iMocha | WeCP | Vervoe | SHL | India platforms |
|---|---|---|---|---|---|
| Embedded Systems / Automotive | ◐ | ◐ | ○ | ○ | ◐ |
| Mainframe / COBOL | ◐ | ◐ | ○ | ○ | ◐ |
| SAP (ABAP, FICO, MM, HCM) | ● | ◐ | ○ | ○ | ◐ |
| Oracle (DBA, EBS, HCM, Apps) | ● | ◐ | ○ | ○ | ◐ |
| Salesforce (Admin, Dev, CPQ) | ● | ◐ | ○ | ○ | ◐ |
| ServiceNow / Workday / Pega | ◐ | ○ | ○ | ○ | ○ |
| Guidewire / Duck Creek (Insurance core) | ○ | ○ | ○ | ○ | ◐ |
| BFSI Domain (Capital Markets, Cards, Loans) | ◐ | ○ | ○ | ◐ | ◐ |
| Cybersecurity Domain (CISSP, OSCP-ish) | ◐ | ○ | ○ | ○ | ○ |

### 3.3 Non-Tech & Specialized Roles

| Role | HackerRank | HackerEarth | Codility | CodeSignal | Mettl |
|---|---|---|---|---|---|
| Sales / SDR / AE | ○ | ○ | ○ | ○ | ◐ |
| Customer Success / Support | ○ | ○ | ○ | ○ | ◐ |
| Marketing / Content / Growth | ○ | ○ | ○ | ○ | ◐ |
| Consulting / Strategy | ○ | ○ | ○ | ○ | ● |
| HR / TA / People | ○ | ○ | ○ | ○ | ◐ |
| Finance / Accounting (Excel, Modeling) | ○ | ○ | ○ | ○ | ● |
| Operations / Supply Chain / Logistics | ○ | ○ | ○ | ○ | ◐ |
| Design (UX, Visual, Product) | ○ | ○ | ○ | ○ | ◐ |
| Product Management | ○ | ○ | ○ | ○ | ◐ |
| Indian Regional-Language Customer Service | ○ | ○ | ○ | ○ | ◐ |

| Role | iMocha | WeCP | Vervoe | SHL | India platforms |
|---|---|---|---|---|---|
| Sales / SDR / AE | ◐ | ○ | ● | ● | ◐ |
| Customer Success / Support | ◐ | ○ | ◐ | ◐ | ◐ |
| Marketing / Content / Growth | ◐ | ○ | ◐ | ◐ | ○ |
| Consulting / Strategy | ◐ | ○ | ◐ | ● | ◐ |
| HR / TA / People | ◐ | ○ | ○ | ● | ◐ |
| Finance / Accounting (Excel, Modeling) | ◐ | ○ | ◐ | ● | ◐ |
| Operations / Supply Chain / Logistics | ◐ | ○ | ◐ | ◐ | ○ |
| Design (UX, Visual, Product) | ○ | ○ | ◐ | ◐ | ○ |
| Product Management | ◐ | ○ | ● | ● | ◐ |
| Indian Regional-Language Customer Service | ◐ | ○ | ○ | ○ | ◐ |

### Pattern: The India Stack & Non-Tech Domains Are the Biggest Holes

- **India enterprise stack (SAP, Oracle, Salesforce, ServiceNow, Workday, Guidewire)** — only Mettl and iMocha cover at "●" or "◐" depth. Even they have variable quality. **This is GCC's #1 unmet content need.**
- **Non-engineering roles (sales, customer success, marketing, ops, finance, design, PM)** — almost universally underserved by the technical-screening platforms. SHL and Talogy (psychometric) cover, but with thin task-fidelity.
- **DevSecOps, embedded, mainframe** — the high-value-per-hire niches almost nobody covers well.
- **Indian regional languages** — only weak partial coverage.

---

## 4. Question-Lifecycle Maturity Matrix

Beyond format and role coverage, there is the **operational** dimension: how mature is each platform's process around the lifecycle of a question? This is where structural gaps become QOrium's true moat. The 15 lifecycle stages are split into two sub-matrices below — Authoring & Validation, then Operational & Delivery — each shown across the same 10 representative platforms.

Legend: ● = mature production process · ◐ = ad hoc / partial · ○ = absent

### 4.1 Authoring & Validation Maturity

| Lifecycle Stage | HackerRank | Mettl | Codility | CodeSignal | iMocha |
|---|---|---|---|---|---|
| Authoring (in-house engineers) | ● | ● | ● | ● | ● |
| Authoring (AI-assisted) | ◐ | ◐ | ○ | ○ | ◐ |
| Authoring (I/O psych grounding) | ○ | ● | ● | ● | ◐ |
| Validation (test-case completeness) | ● | ● | ● | ● | ● |
| Validation (statistical IRT calibration) | ◐ | ● | ● | ● | ◐ |
| Validation (adverse-impact / bias testing) | ○ | ● | ● | ◐ | ◐ |
| Performance analytics (post-deployment) | ● | ● | ● | ● | ● |

| Lifecycle Stage | WeCP | Adaface | Vervoe | SHL | India platforms |
|---|---|---|---|---|---|
| Authoring (in-house engineers) | ● | ● | ● | ● | ◐ |
| Authoring (AI-assisted) | ◐ | ◐ | ● | ○ | ◐ |
| Authoring (I/O psych grounding) | ○ | ○ | ◐ | ● | ○ |
| Validation (test-case completeness) | ● | ● | ◐ | ● | ◐ |
| Validation (statistical IRT calibration) | ○ | ○ | ◐ | ● | ○ |
| Validation (adverse-impact / bias testing) | ○ | ○ | ◐ | ● | ○ |
| Performance analytics (post-deployment) | ● | ◐ | ● | ● | ◐ |

### 4.2 Operational & Delivery Maturity

| Lifecycle Stage | HackerRank | Mettl | Codility | CodeSignal | iMocha |
|---|---|---|---|---|---|
| Anti-leak monitoring (continuous web crawl) | ○ | ○ | ○ | ◐ | ○ |
| Anti-leak rotation (auto-retire + replace) | ○ | ○ | ○ | ○ | ○ |
| Versioning (v1, v2, v3 of same concept) | ◐ | ◐ | ◐ | ◐ | ◐ |
| Refresh cadence (formal pipeline) | ◐ | ◐ | ◐ | ◐ | ◐ |
| Per-client variant generation | ◐ | ◐ | ◐ | ◐ | ◐ |
| Watermarking / forensic leak attribution | ○ | ○ | ○ | ○ | ○ |
| Open API for content delivery | ◐ | ◐ | ◐ | ◐ | ◐ |
| Multi-format export (HR/HE/Mettl/CSV) | ○ | ○ | ○ | ○ | ○ |

| Lifecycle Stage | WeCP | Adaface | Vervoe | SHL | India platforms |
|---|---|---|---|---|---|
| Anti-leak monitoring (continuous web crawl) | ○ | ◐ | ○ | ○ | ○ |
| Anti-leak rotation (auto-retire + replace) | ○ | ○ | ○ | ○ | ○ |
| Versioning (v1, v2, v3 of same concept) | ◐ | ◐ | ◐ | ◐ | ○ |
| Refresh cadence (formal pipeline) | ◐ | ◐ | ◐ | ◐ | ○ |
| Per-client variant generation | ● | ◐ | ◐ | ◐ | ○ |
| Watermarking / forensic leak attribution | ○ | ○ | ○ | ○ | ○ |
| Open API for content delivery | ◐ | ○ | ◐ | ○ | ○ |
| Multi-format export (HR/HE/Mettl/CSV) | ○ | ○ | ○ | ○ | ○ |

### The Five Lifecycle Stages Where ALL Platforms Are Weak

Reading the matrix vertically, five lifecycle capabilities are **universally weak across all 20 platforms**:

1. **Anti-leak rotation (auto-retire + replace)** — ZERO platforms operationalize this
2. **Watermarking / forensic leak attribution** — ZERO platforms have it
3. **Multi-format export** (so a question pack can land in any platform's import format) — ZERO
4. **Refresh cadence as a formal engineering pipeline** — universally ad hoc
5. **AI-assisted authoring at production volume** — only Vervoe is strong; the rest are exploring

**These five gaps are not features missing on a roadmap — they are structural absences in the entire industry.** Each one is a defensible QOrium product line.

---

## 5. The QOrium Wedge — Seven Structural Gaps Synthesized

Combining the three matrices above with the market drivers from Document 1 yields seven structural gaps. Each is independently a product-line opportunity; together they constitute the QOrium thesis.

### Gap 1 — The Anti-Leak Operational Engine

**The gap:** No platform runs a continuous "scan public web → identify leaked questions → auto-retire → AI-generate replacement → human-validate → release" loop.

**The QOrium offering:** A scheduled engineering pipeline (web crawl + LLM-based semantic match + retire + regenerate + validate) that protects every question pack we sell. Sold both as a feature (built-in to all packs) and as a standalone "Leak Protection Service" to platforms that don't want to license content, just leak protection.

**Defensibility:** Operational moat — anyone can copy the idea, but the actual pipeline + corpus of "what leak-shaped looks like" + the validated regeneration quality requires ~6–12 months of engineering investment.

### Gap 2 — The India-Stack Content Library

**The gap:** SAP, Oracle, Salesforce, ServiceNow, Workday, Pega, Guidewire, BFSI core systems, embedded automotive, mainframe — universally thin or absent across all 20 platforms.

**The QOrium offering:** The world's deepest library for India enterprise stack roles — co-developed with GCC TA leaders who are the buyers. Each pack includes domain MCQs, scenario-based SJTs, hands-on configuration tasks, and (where applicable) sandbox simulations.

**Defensibility:** Domain depth is hard to copy. Every certified SAP consultant in India is a potential SME validator — Talpro's 500+ network is QOrium's distribution + validation pool.

### Gap 3 — The Role-Graph Taxonomy

**The gap:** Every platform's library is organized by ad-hoc tags ("Java," "React," "SQL"). No platform has a normalized **role × skill × difficulty × format** graph that lets a buyer say "give me 50 questions for a Senior Backend Engineer hire at a Series-B fintech in Bengaluru" and get a calibrated set.

**The QOrium offering:** A formal role-graph (job-family × seniority × tech-stack × domain × geography), with every question tagged at all five dimensions. This is the QOrium **knowledge graph** and it is queryable via API.

**Defensibility:** Becomes a reference standard over time — like how SHL's OPQ became the de facto personality framework. First-mover advantage compounds.

### Gap 4 — Per-Client Variants & Forensic Watermarking

**The gap:** Today, a "premium" question is the same question every client receives. Leakage from any client contaminates all clients.

**The QOrium offering:** Each client gets a per-client variant — same conceptual question, different surface form (different identifiers, different number ranges in test cases, different scenario flavor). When a leak is detected, watermark forensics tells QOrium WHICH client leaked it — actionable for both legal recourse and product credibility.

**Defensibility:** Engineering complexity + the corpus of validated semantic-equivalence transformations. Hard to reverse-engineer.

### Gap 5 — Multi-Format Universal Export

**The gap:** Each platform has its own import format. A buyer who wants to use QOrium content across HackerRank, Mettl, and Codility today has to manually re-format three times.

**The QOrium offering:** Native exporters for all 20 platforms. Buyer uploads once to QOrium, exports anywhere. Removes the lock-in advantage of any single platform.

**Defensibility:** Engineering breadth + maintenance overhead. Platforms can change formats; QOrium tracks and updates. The exporter library becomes the universal translator.

### Gap 6 — Next-Gen Format Coverage (AI-Era Skills)

**The gap:** AI-prompt-engineering tests, pair-programming-with-AI, autonomous-workflow design, AI-augmented code review — almost universally absent. Yet these are the fastest-growing hiring categories of 2026.

**The QOrium offering:** First-to-market content packs for the AI-era skill set, sold both standalone and bundled. Continuous additions as new AI-native job families emerge.

**Defensibility:** Recency moat (first-to-market) + thought leadership. Talpro's CTO office can publish original research on assessing AI-era skills, building category authority.

### Gap 7 — Hybrid AI-Authored + I/O-Psych-Validated Pipeline

**The gap:** Today the market splits: pure-AI shops (Glider) sacrifice rigor; pure-I/O-psych shops (Mettl, Codility, SHL) sacrifice speed. Nobody runs a production pipeline that genuinely combines both.

**The QOrium offering:** The pipeline IS the product. Every question is AI-authored (Claude Opus 4.6) → AI-self-critiqued → human SME validated → IRT-calibrated post-release. Defensible because it requires the engineering discipline of a SaaS company AND the I/O-psych expertise of an assessment-science firm — these two disciplines almost never co-exist in one company.

**Defensibility:** Operational moat (the pipeline) + people moat (the I/O psych team) + data moat (calibration data accumulating over years).

---

## 6. The Composite Wedge — One Sentence

QOrium is the world's first **AI-authored, I/O-psychologist-validated, anti-leak-rotated, multi-format-exporting, India-stack-deep, role-graph-organized, per-client-watermarked, content-API-first** Question Bank for the global assessment industry. No platform competes on more than 2 of those 8 dimensions. QOrium competes on all 8.

---

## 7. Risks to the Wedge & Their Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Mettl or HackerRank acquires a content shop and builds this internally** | Medium-High | High | Move fast; price the API attractively enough that buy-vs-build math favors buy; secure 5+ marquee logos in Year 1 to establish reference architecture |
| **WeCP pivots back to its original content-business** | Low-Medium | High | Speed; India-stack depth they lack; Talpro distribution they don't have |
| **A pure-AI competitor (Glider AI scale) under-prices** | Medium | Medium | I/O psych validation = enterprise defensibility they can't match without 2+ years of investment |
| **Foundation-model providers (OpenAI, Anthropic) ship a vertical assessment-content product** | Low | High | Unlikely — not their lane; if it happens, partner not compete |
| **Question-bank IP becomes commoditized (everyone has GPT-4)** | Medium | Medium | Moat shifts from "having questions" to "having the validated, calibrated, anti-leak-rotated lifecycle around them" — this is the sustainable moat |
| **GCC India hiring slows materially (recession scenario)** | Low-Medium | Medium-High | Diversification across all 3 segments + global expansion in Year 2; coding-content demand is counter-cyclical (cost-pressure increases standardization) |

---

## 8. What Document 4 Will Build From This

Document 4 (the QOrium Blueprint) operationalizes these gaps into:

- A specific product roadmap (which gap to attack first, second, third)
- A pricing architecture for the 3 buyer segments
- A 12-month execution plan with monthly milestones
- The team / hiring plan (especially the I/O psych SME network)
- The CTO architecture for the content engine + API + delivery modes

---

*End of Document 3. Next: Document 4 — QOrium Blueprint v1.*
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
# QOrium — Document 5 of 5
# The Three Use Cases — SKU Architecture, Pricing & Positioning

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Date:** May 1, 2026
**Status:** Draft v1.0 — addendum to Blueprint v1 (CEO-directed addition)

---

## Why This Document Exists

The original Blueprint v1 (Doc 4) defined QOrium across two axes — **3 buyer segments** and **4 delivery modes**. The CEO has now added a third, structurally important axis: **3 product-IP use cases** that determine *what kind of library* the customer is buying. This is the SKU architecture.

The three use cases collapse cleanly into three QOrium product SKUs. Each has a distinct value proposition, distinct pricing model, distinct moat, and distinct content-engineering pipeline. Together they cover the entire continuum from "shared commodity content" to "fully exclusive customer-owned IP."

Use cases recap (per CEO directive, May 1, 2026):

1. **Use Case 1 — Readymade Skill-Wise Question Bank** — Same questions sold to multiple clients across all major tech skills. Commodity-tier, high-volume, lowest unit price.
2. **Use Case 2 — Customised JD-Specific Question Generation** — Every time a new job description is uploaded, a fresh JD-aligned question pack is generated on-demand.
3. **Use Case 3 — Customer-Exclusive IP-Protected Bank** — A private, customer-owned question library aligned to one specific company's tech stack, reusable infinitely across all assessments by that customer.

This document maps each use case to QOrium's buyers, delivery modes, pricing, moats, content-engineering pipeline, and risk profile.

---

## 1. The Three SKUs at a Glance

| Dimension | **SKU 1: ReadyBank** | **SKU 2: JD-Forge** | **SKU 3: Stack-Vault** |
|---|---|---|---|
| **What it is** | Shared, multi-tenant question library indexed by skill / role / difficulty | On-demand custom question pack generated from an uploaded JD | Customer-exclusive private library aligned to a company's tech stack, reusable forever |
| **IP / Exclusivity** | Non-exclusive; same question shipped to many clients | Generated fresh per JD; not stored in shared library by default | Fully exclusive; customer owns the library |
| **Delivery cadence** | Continuous (always available, refreshed quarterly) | On-demand (every JD upload) | Annual license + quarterly refresh add-ons |
| **Production model** | Bulk authoring → SME validation → indexed in shared library | Real-time AI generation → near-instant SME validation → return to customer | High-touch authoring + SME validation + per-client variants + watermarking |
| **Primary buyer** | Platforms (Tier 1 by ARR) + Staffing firms + Mid-market enterprises | Enterprises with high JD volume + Staffing firms running active drives | GCCs + Large enterprises + IT services giants |
| **Best delivery modes** | A (REST API), B (Bulk Export), C (Embedded Widget) | A (REST API real-time), web app upload UI | D (White-label private), B (Bulk Export private), A (private API) |
| **Pricing model** | Subscription (monthly/annual) + per-question API metering | Per-JD generation fee + subscription with included JD allowance | Annual license fee scaled by stack scope + add-ons |
| **Typical price** | $50K–$500K/year (platforms); ₹4,999–49,999/month (recruiters) | $50–$500 per JD; $5K–$30K subscription with allowance | ₹10L–1Cr/year (USD $12K–$120K) |
| **Gross margin target** | 90%+ at scale (commodity, fully amortized) | 70–80% (real-time AI generation cost is variable) | 60–75% (high human SME involvement) |
| **Moat depth** | Scale + role-graph organization + anti-leak refresh | AI pipeline quality + JD-parsing accuracy + speed | Customer lock-in + accumulated stack-specific corpus + watermarking |
| **Cannibalization risk** | Low (commodity tier serves price-sensitive segment) | Medium (could compete with SKU 1 for some use cases) | Low (different buyer, different value prop) |
| **Anti-leak strategy** | Continuous monitoring + quarterly rotation across shared base | Per-JD freshness IS the anti-leak (no shared questions) | Per-client variants + watermarking + exclusivity by contract |

---

## 2. SKU 1 — ReadyBank (Readymade Skill-Wise Question Bank)

### 2.1 The Use Case

A platform like Mettl or HackerEarth needs **40,000+ pre-validated questions** indexed across 1,000+ skills, available right now via API. They are not interested in spending six months authoring; they need a content layer they can ship into their product within 30 days. Same for a mid-tier IT staffing firm running 50 candidate screens per week — they need a fresh question for "Senior React Developer, 3 years" with one API call.

ReadyBank is the QOrium catalog: every question we have ever authored that has cleared SME validation, indexed in the role-graph, available to every paying customer.

### 2.2 The Value Proposition

**For Assessment Platforms (Tier 1 buyers):**
> "Stop spending $1.2M/year on a content team that ships 1,800 questions. License the QOrium ReadyBank API and get instant access to 40,000+ calibrated, anti-leak-rotated questions across 1,000 skills. Pay per call, scale infinitely."

**For Staffing Firms (Tier 3 buyers via Recruiter Subscription):**
> "Same Mettl questions every recruiter uses are leaked. Subscribe to ReadyBank for ₹14,999/month, get 1,000 fresh-rotated questions/month across 20 roles, ship signal your enterprise client trusts."

**For Mid-Market Enterprises:**
> "Buy a ReadyBank pack for your next hiring drive — 200 questions across the 5 roles you're hiring for, exported to your existing assessment tool's format, ₹3L one-time."

### 2.3 The Production Pipeline

Standard 7-stage QOrium pipeline (specified in Doc 4 §3.1):
1. SPEC IN (skill + difficulty + format — usually batched in waves)
2. AI DRAFT
3. AI SELF-CRITIQUE
4. SME REVIEW
5. CALIBRATE (sample on QOrium Reference Panel)
6. RELEASE → into ReadyBank
7. POST-DEPLOY (performance monitoring + leak detection + rotation)

**Critical for ReadyBank:** Quarterly leak-rotation cycle. Every question that appears on Glassdoor / LeetCode / Reddit / GeeksforGeeks within 90 days is auto-flagged → AI-regenerates a semantic variant → SME validates → released as v2 → original retired. This is what makes ReadyBank defensible as a "shared but fresh" library.

### 2.4 Pricing Structure

#### For Platforms (Tier 1):

| Tier | Questions/month | Anti-leak SLA | API rate limit | Annual price |
|---|---|---|---|---|
| Starter | 10,000 | Monthly scan + quarterly rotation | 100 req/min | $50,000 |
| Growth | 50,000 | Weekly scan + monthly rotation | 500 req/min | $150,000 |
| Enterprise | Unlimited | Continuous + real-time rotation | 5,000 req/min | $500,000+ |

#### For Recruiters / Staffing (Tier 3):

| Tier | Questions/month | Roles included | Modes | Monthly price |
|---|---|---|---|---|
| Solo | 200 | 5 | Bulk export only | ₹4,999 |
| Team | 1,000 | 20 | Bulk export + Widget | ₹14,999 |
| Agency | 5,000 | Unlimited | Bulk export + Widget + light API | ₹49,999 |

#### For Mid-Market Enterprises (one-time pack):

- Single role pack (50 questions): ₹1,00,000
- 5-role pack (200 questions): ₹3,00,000
- 10-role pack (500 questions): ₹6,00,000

### 2.5 Unit Economics

- Cost to author + validate one ReadyBank coding question: ~$9 (₹750)
- Amortized cost per question delivered (after first 100 deliveries): <$0.10
- Effective $/question across all SKU 1 channels: $0.25 (Platform Growth tier) → $0.80 (Recruiter Solo) → $15 (one-time pack)
- **Blended gross margin target: 90%+ once library size > 20,000 questions**

### 2.6 The Moat

ReadyBank's moat compounds with library size and anti-leak rotation maturity. The first 5,000 questions take ~9 months and ~$50K to produce. The 20,000th question costs $9 to add but the library's value is now exponentially higher because of:

1. **Combinatorial coverage** — 1,000 skills × 5 difficulty levels × 4 formats = 20,000 cells. Every cell filled reduces customer churn.
2. **IRT calibration data** — Each question has thousands of attempts logged across customers. Difficulty becomes scientifically defensible.
3. **Anti-leak rotation history** — Demonstrable proof that 15% of library is rotated quarterly. Customers cannot replicate this without a live customer base.
4. **Role-graph network effect** — More customers → more JD parsing → better role-skill mapping → more coverage gaps identified → faster authoring.

### 2.7 Risks

- **Cannibalization by Use Case 3 (Stack-Vault):** A customer might say "we'll just buy a Stack-Vault and not need ReadyBank." Mitigation: price Stack-Vault high enough that mid-market chooses ReadyBank.
- **Commodity pressure from foundation models:** A buyer could prompt GPT-5/Claude themselves. Mitigation: validation rigor + anti-leak service is what they cannot self-build.
- **Leak velocity outpaces rotation:** If a library question goes viral on Glassdoor in 7 days vs our 90-day SLA. Mitigation: continuous monitoring tier (Enterprise) for high-stakes customers.

---

## 3. SKU 2 — JD-Forge (Customised JD-Specific Question Generation)

### 3.1 The Use Case

A hiring manager at TCS uploads a JD for "Senior Salesforce Developer, 5+ years, Lightning Web Components experience, must know Apex triggers, Health Cloud familiarity." Ten seconds later, JD-Forge returns a custom 20-question pack: 5 MCQs on Apex internals, 3 LWC scenario questions, 2 Health Cloud domain SJTs, 5 coding problems (one Apex trigger debugging, one LWC component, three vanilla JS), 3 system-design SJTs, 2 take-home tasks.

The questions are **fresh-generated for this JD** — they are not pre-existing in QOrium's ReadyBank, and (by default) they are not added to ReadyBank after this JD's hiring drive completes. The customer gets uniqueness; QOrium gets per-JD revenue.

### 3.2 The Value Proposition

**For Enterprises with high JD volume:**
> "You upload 200 JDs/month. Each one needs a different assessment. Manually configuring 200 assessments takes 100 hours of your TA team's time. JD-Forge generates a calibrated, JD-aligned 20-question pack in 30 seconds, $99 per JD. Your TA team focuses on hiring, not assessment configuration."

**For Staffing Firms running active drives:**
> "Your end-client wants a custom assessment for the role you're sourcing. Upload the JD; JD-Forge gives you a complete pack ready to paste into HackerRank or Mettl in under a minute. ₹999 per JD or unlimited at ₹19,999/month."

**For Recruitment Agencies handling executive search:**
> "Each executive role is unique. JD-Forge generates a leadership-pattern SJT pack, a strategic case study, and 3-4 deep technical questions specific to the role's tech stack. ₹4,999 per JD."

### 3.3 The Production Pipeline

JD-Forge runs a **real-time variant** of the standard pipeline:

```
1. JD INGEST (web upload UI or API POST)
2. JD PARSE (LLM extracts: role, skills, seniority, domain, must-haves)
3. SPEC GENERATION (decompose into N questions with format mix)
4. AI DRAFT (parallel generation, 20 questions in ~10s)
5. AI SELF-CRITIQUE (auto-reject ambiguous / leaked-pattern matches)
6. EXPRESS SME REVIEW (optional — async within 4 hours; default skip for "Standard" tier)
7. RETURN PACK (JSON / CSV / direct platform export)
```

The "Express SME Review" is the pricing differentiator:
- **Standard tier:** AI-generated only, returned in 30 seconds, no human review
- **Reviewed tier:** Same pipeline + human SME validation, returned in 4 hours, premium price

### 3.4 Pricing Structure

| Tier | Per-JD price | Bundled subscription | Use case fit |
|---|---|---|---|
| **Standard (AI-only)** | $49 / ₹3,999 per JD | $499/mo for 25 JDs | Staffing firms, mid-volume |
| **Reviewed (AI + SME)** | $199 / ₹15,999 per JD | $1,999/mo for 15 reviewed JDs | Enterprises, high-stakes hires |
| **Enterprise (Reviewed + IP-protected)** | $499 / ₹39,999 per JD | $9,999/mo for 30 reviewed JDs + IP guarantee | GCCs, executive search |

The "IP-protected" Enterprise tier means the generated pack is contractually never added to ReadyBank or shown to other customers — important for high-stakes drives where the customer wants exclusivity even on JD-generated content.

### 3.5 Unit Economics

- AI generation cost per JD pack (20 questions): ~$1.50–$3 (LLM tokens)
- Express SME review cost per pack (Reviewed tier): ~$25 (15 min @ India rates)
- Storage + retrieval: <$0.10 per pack
- **Standard tier gross margin: ~95%**
- **Reviewed tier gross margin: ~85%**
- **Enterprise tier gross margin: ~80%** (includes IP guarantee overhead)

### 3.6 The Moat

JD-Forge's moat is in **pipeline quality** + **JD-parsing accuracy** — the ability to generate a 20-question pack that a hiring manager actually trusts. This requires:

1. **Best-in-class JD parser** — Trained on 100K+ tech JDs to extract role + skills + seniority + domain + tooling reliably.
2. **Format-mix optimization** — Knowing that a Senior Backend role needs more system-design SJT vs a Junior Frontend role which needs more coding fundamentals.
3. **Anti-leak filtering at generation** — Auto-rejecting any AI draft that semantically matches a known leaked question (LeetCode top-200, GeeksforGeeks company-tagged archive).
4. **Speed** — 30-second standard SLA. Hard for competitors to match without our pipeline investment.

### 3.7 Risks

- **AI generation quality regresses** when scaling to long-tail roles (niche stacks). Mitigation: fallback to Express SME Review tier; collect feedback to retrain.
- **JD-parsing failures** (vague JDs, copy-paste from inconsistent sources). Mitigation: interactive UI that asks the customer 3-4 clarifying questions when JD parse confidence is low.
- **Customer comparison vs in-house "ChatGPT for JDs" attempts.** Mitigation: validation rigor, anti-leak filter, format-mix expertise. Demo the QA difference.
- **Pricing arbitrage:** customers might use cheap Standard tier for high-stakes roles. Mitigation: tier discount only for verified subscription customers; premium tier IP guarantee is contractual differentiator.

---

## 4. SKU 3 — Stack-Vault (Customer-Exclusive IP-Protected Library)

### 4.1 The Use Case

A Bosch GCC in Bengaluru runs technical hiring across 25 distinct role families: embedded automotive engineers, Salesforce admins, SAP ABAP developers, full-stack web, DevOps SREs, automotive cybersecurity analysts, etc. They run **5,000+ candidate assessments per quarter**.

Bosch GCC engages QOrium to build the **Bosch Stack-Vault**: a customer-exclusive library of 2,000 questions covering Bosch's specific tech stack and domain. The library is delivered as a private namespace under Bosch's QOrium account. Bosch can pull from this library for any of their assessments — internal mobility tests, hiring drives, certification exams — without per-question billing. Quarterly, QOrium adds 200 new questions and rotates 100 older ones.

The Stack-Vault is **contractually exclusive to Bosch**. No question in their Stack-Vault appears in ReadyBank, in any JD-Forge output to another customer, or in any other customer's Stack-Vault. Watermarking enables forensic attribution if any question leaks externally — actionable for both legal recourse and customer accountability.

### 4.2 The Value Proposition

**For GCCs (primary):**
> "Your candidates have already seen the Mettl + HackerEarth banks. Your in-house TA team can't author 2,000 questions across your stack — they're hiring 100 people a week. Buy a Bosch-exclusive Stack-Vault: ₹40L/year, 2,000 questions covering every role you hire, refreshed quarterly, watermarked, contractually exclusive. Reuse infinitely across all your assessments."

**For Large IT Services (TCS, Infosys, Wipro, HCL):**
> "Your campus drives screen 500,000 candidates/year. The same 200 HackerEarth questions are in every prep blog. Buy a TCS Stack-Vault: ₹1Cr/year, 5,000+ questions specific to your service-line stack, exclusively yours, watermarked across drives. Your candidates earn a TCS offer because they have the skills, not because they memorized the leaked test."

**For BFSI Majors (HDFC, ICICI, Axis, JPMC India):**
> "Your tech stack is Salesforce + Oracle Banking + custom risk engines. No platform covers this depth. We'll build you a 1,500-question BFSI-specific Stack-Vault, ₹60L/year, with hands-on Salesforce config tasks, Oracle SQL puzzles, and risk-scenario SJTs that actually mirror your daily work."

### 4.3 The Production Pipeline

Stack-Vault runs the **highest-touch variant** of the QOrium pipeline:

```
1. STACK INTAKE (90-day discovery: customer's role list, tech stack, domain quirks, hiring patterns)
2. ROLE-GRAPH MAPPING (custom role-graph for THIS customer; what roles, what depth)
3. INITIAL LIBRARY BUILD (8-12 weeks; 2,000+ questions authored across role-graph)
4. PER-CLIENT VARIANT GENERATION (each question has a Bosch-specific version: identifiers, data, scenario flavor)
5. WATERMARK INJECTION (cryptographic per-customer marker in test cases, problem statements)
6. SME VALIDATION (mandatory for every Stack-Vault question — no exceptions)
7. CALIBRATION (sample on Reference Panel + customer's existing candidate pool)
8. PRIVATE RELEASE (delivered to customer's private QOrium namespace)
9. QUARTERLY REFRESH (200 new + 100 retired per quarter; leak monitoring continuous)
10. ANNUAL RE-ARCHITECTURE (optional add-on: re-evaluate the role-graph as customer's stack evolves)
```

### 4.4 Pricing Structure

| Tier | Library Size | Stack Scope | Annual Price | Refresh Cadence |
|---|---|---|---|---|
| **Stack-Vault Department** | 500 questions | 1 department, 5-10 roles | ₹10,00,000 (~$12,000) | Quarterly: 50 new + 25 retired |
| **Stack-Vault Enterprise** | 2,000 questions | Multi-department, 20-30 roles | ₹40,00,000 (~$48,000) | Quarterly: 200 new + 100 retired |
| **Stack-Vault Group** | 5,000+ questions | Whole organization, 50+ roles | ₹1,00,00,000+ (~$120,000+) | Quarterly: 500 new + 200 retired |

**Add-ons (per Stack-Vault):**
- Per-client watermarking + forensic attribution: included in all tiers
- Regional language localization (Hindi, Tamil, Telugu, etc.): +30% on the tier price
- Custom format development (e.g., proprietary internal tool simulation): ₹5L–25L per format
- Live SME interview design (custom interview rubrics + question pool): ₹2L per role family
- Stack-Vault API: included in Enterprise + Group tiers; ₹5L/year add-on for Department tier
- Real-time anti-leak monitoring (vs quarterly): +20% on the tier price

### 4.5 Unit Economics

- Discovery + role-graph mapping cost (one-time): ₹3-5L of senior-content-engineer time
- Cost to author + per-client-variant + watermark + SME validate one Stack-Vault question: ~$25 (₹2,000)
- Cost per question retired + replaced quarterly: ~$30 (₹2,500)
- **Stack-Vault Enterprise (₹40L/year, 2,000 questions year 1, +800 net new questions over 4 quarters):**
  - Year 1 cost: ₹3L discovery + 2,000 × ₹2,000 + 800 × ₹2,500 = ₹3L + ₹40L + ₹20L = ~₹63L
  - Year 1 revenue: ₹40L → **negative margin Year 1 by design** (customer-acquisition cost amortized)
  - Year 2+ cost: 800 × ₹2,500 = ₹20L (only refresh cost)
  - Year 2+ revenue: ₹40L+ → **gross margin 50% Year 2, 60%+ Year 3 onward**

The unit economics for Stack-Vault are intentionally Year-1-thin and Year-2+-strong. This is consistent with high-CAC enterprise SaaS.

### 4.6 The Moat

Stack-Vault has the strongest customer-lock-in moat of any QOrium SKU because:

1. **Customer-specific corpus** — A 2,000-question library tuned to Bosch's stack is unbuildable for a competitor without 6+ months of discovery + authoring + Bosch's cooperation.
2. **Watermarking + forensic attribution** — Even if a question leaks, QOrium can prove which customer leaked it. This is the rare service where customer accountability is contractually meaningful.
3. **Calibration data per customer** — Years of Bosch candidate performance data feeds QOrium's understanding of Bosch's hiring bar. A competitor starts from zero.
4. **Switching cost** — Replacing the Stack-Vault means rebuilding 2,000 questions + validating + integrating into existing assessment workflows. 3-6 months of pain. Customers don't switch.
5. **Organizational embedding** — TA, L&D, internal mobility, certification — all reuse the same Stack-Vault. Multiple internal teams depend on it. Decision to switch becomes an organization-wide decision, not a TA-team decision.

### 4.7 Risks

- **Long sales cycle (3-6 months)** — Mitigation: strong founder-led sales, Bosch as Logo #1 with fast turnaround as the proof point.
- **Year-1 negative margin** — Mitigation: intentional + amortized; cash flow covered by ReadyBank + JD-Forge.
- **Customer demands customizations beyond contract** — Mitigation: tight scope-of-work doc; clear add-on pricing.
- **Customer's stack changes** (e.g., migrates from on-prem SAP to Salesforce). Mitigation: annual re-architecture add-on; flexible role-graph.
- **Watermarking false-positives in leak attribution** — Mitigation: cryptographic markers + multi-marker redundancy; legal counsel reviewed before any attribution claim.
- **Customer pirates their own Stack-Vault to a competitor** — Mitigation: contractual liability; per-engagement NDAs; technical access logging.

---

## 5. The 3 SKUs × 3 Buyers × 4 Delivery Modes Matrix

This is how QOrium's product surface area integrates. Each cell is either a primary fit (●), a secondary fit (◐), or not applicable (○).

### 5.1 SKU × Buyer Fit

| | **SKU 1: ReadyBank** | **SKU 2: JD-Forge** | **SKU 3: Stack-Vault** |
|---|---|---|---|
| **Buyer A: Assessment Platforms** | ● Primary — API license for content layer | ◐ Secondary — Platforms can offer JD-Forge as a feature in their UI via QOrium API | ○ Not a fit — platforms don't buy customer-exclusive libraries |
| **Buyer B: Enterprises / GCCs** | ◐ Secondary — useful for low-stakes drives or as starter while Stack-Vault is being built | ● Primary — high JD volume, on-demand custom packs | ● Primary — flagship enterprise SKU |
| **Buyer C: Staffing Firms (incl. Talpro)** | ● Primary — subscription tier delivers ReadyBank | ● Primary — per-JD or subscription; very high fit for active staffing motion | ◐ Secondary — only top-tier staffing firms with large end-clients buy Stack-Vault-equivalent |

### 5.2 SKU × Delivery Mode Fit

| | **Mode A: REST API** | **Mode B: Bulk Export** | **Mode C: Embedded Widget** | **Mode D: White-Label** |
|---|---|---|---|---|
| **SKU 1: ReadyBank** | ● Primary — high-volume programmatic access | ● Primary — staffing firm + enterprise pack downloads | ● Primary — staffing firm widget delivery | ◐ Possible but not primary |
| **SKU 2: JD-Forge** | ● Primary — real-time JD upload + return | ● Primary — JD upload returns CSV/JSON pack | ◐ Possible — embedded JD upload widget | ○ Not a primary fit |
| **SKU 3: Stack-Vault** | ● Primary — private API namespace per customer | ● Primary — bulk exports from private library | ◐ Possible for niche customer use cases | ● Primary — fully white-labeled enterprise delivery |

### 5.3 Composite View

The 3 × 3 × 4 matrix has 36 cells. Approximately 18 are primary or secondary fits — meaning QOrium has 18 distinct go-to-market motions theoretically possible from Day 1. **In practice, we sequence them by buyer × SKU × mode combination, prioritizing by cash velocity and strategic value.**

**Year 1 priority sequence:**

1. **Buyer C × SKU 1 × Mode B** — Staffing firms, ReadyBank, Bulk Export. Fastest cash, lowest CAC, Talpro Customer Zero. (Started Month 2.)
2. **Buyer B × SKU 3 × Mode D** — GCCs, Stack-Vault, White-Label. Largest deal size, founder-led sales, Bosch GCC as Logo #1. (Started Month 4.)
3. **Buyer A × SKU 1 × Mode A** — Platforms, ReadyBank, REST API. Longest cycle but largest LTV. (Started Month 5.)
4. **Buyer C × SKU 2 × Mode A** — Staffing firms, JD-Forge, real-time API. Subscription upsell from ReadyBank customers. (Started Month 7.)
5. **Buyer B × SKU 2 × Mode A** — Enterprises, JD-Forge, real-time API. Standalone product offered to mid-market enterprises that don't yet need Stack-Vault. (Started Month 9.)

---

## 6. Updated Year 1 Revenue Plan (with 3 SKUs)

The Doc 4 Year-1 forecast assumed a single bundled product. With the 3 SKUs explicit, the forecast is more granular and slightly higher (because JD-Forge unlocks per-JD revenue from existing ReadyBank customers):

| Segment | Logos | SKU mix | Primary mode | Year 1 Revenue |
|---|---|---|---|---|
| **Platform API (Buyer A)** | 3 | SKU 1 (1 Growth + 2 Starter) | Mode A | $240K (~₹20L) |
| **Enterprise Stack-Vault (Buyer B)** | 5 | SKU 3 (3 Department + 2 Enterprise tier) | Mode D + B | ₹1.1Cr (~$130K) |
| **Enterprise JD-Forge (Buyer B)** | 8 | SKU 2 (subscription mostly Reviewed tier) | Mode A | ₹50L (~$60K) |
| **Recruiter ReadyBank Subscription (Buyer C)** | 30 | SKU 1 (mostly Solo + Team) | Mode B + C | ₹45L (~$54K) |
| **Recruiter JD-Forge (Buyer C)** | 20 | SKU 2 (per-JD + subscription) | Mode A | ₹30L (~$36K) |
| **Total Year 1** | **66 logos** | | | **~₹3.5Cr / $420K ARR** |

**Year 2 target with full 3-SKU motion:** $2M ARR (~₹17Cr).
**Year 3 target:** $7M ARR.
**Year 5 North Star:** $50M+ ARR with international expansion.

(Year 1 target moved from $384K → $420K, primarily from JD-Forge unlocking new revenue from buyers who previously only paid for ReadyBank.)

---

## 7. SKU Implications for the 12-Month Roadmap

Doc 4's roadmap was structured by **content waves** (Tech Core → Tech Breadth + India Stack → Domain + Aptitude → AI-Era Formats). Adding the 3 SKUs requires a **second axis** — when each SKU ships:

| Month | Content Wave | SKU Milestone |
|---|---|---|
| M0–M3 | Wave 1 (Tech Core, 5K questions) | **SKU 1 (ReadyBank) v0** — basic library + bulk export + recruiter subscription |
| M3–M6 | Wave 2 (India Stack, 12K questions) | **SKU 3 (Stack-Vault) Logo #1** — Bosch GCC; first Department tier engagement |
| M5–M7 | (parallel) | **SKU 1 API GA** — REST API for platform customers |
| M6–M9 | Wave 3 (Domain + Aptitude, 25K questions) | **SKU 2 (JD-Forge) v1** — Standard tier launch (AI-only) |
| M9–M12 | Wave 4 (AI-Era, 40K questions) | **SKU 2 (JD-Forge) v2** — Reviewed + Enterprise tiers; **SKU 3 Enterprise tier** with full Group offering |

The new roadmap commitment: **all 3 SKUs ship within Year 1**, with SKU 1 leading (Month 1), SKU 3 leading on enterprise revenue (Month 4), and SKU 2 unlocking subscription upsells (Month 6).

---

## 8. Pricing Discipline — Avoiding Cannibalization

Three pricing rules avoid SKU cannibalization:

### Rule 1 — ReadyBank is volume-priced; Stack-Vault is exclusivity-priced.

A customer with 5 roles and 100 hires/quarter should buy a ReadyBank Team subscription (₹14,999/month). A customer with 25 roles and 1,000 hires/quarter should buy a Stack-Vault Enterprise (₹40L/year). The math should always favor Stack-Vault at ~10× the volume threshold.

### Rule 2 — JD-Forge is generation-priced; ReadyBank is access-priced.

A customer who uploads 200 JDs/month and uses each pack once should pay per-JD via JD-Forge (~$10K/year). A customer who runs the same 50 questions across 1,000 candidates should subscribe to ReadyBank (~$60/year per question access). JD-Forge's per-unit price reflects the on-demand AI generation cost.

### Rule 3 — Stack-Vault customers get ReadyBank + JD-Forge bundled.

To avoid a Stack-Vault customer also buying ReadyBank or JD-Forge separately, all three are bundled into the Stack-Vault tier (with reasonable usage caps). This makes Stack-Vault the obvious choice for any customer above the volume threshold and removes pricing decision-paralysis.

---

## 9. The Three SKUs as a Defensible Portfolio

The 3-SKU model gives QOrium a defensible portfolio shape:

- **SKU 1 (ReadyBank)** is the **scale engine** — high gross margin at volume, infinite leverage, becomes the industry's default content layer over time. Defensibility = library size + role-graph + anti-leak rotation.
- **SKU 2 (JD-Forge)** is the **velocity product** — captures the on-demand, real-time, modern hiring workflow. Defensibility = pipeline quality + JD-parsing accuracy + speed.
- **SKU 3 (Stack-Vault)** is the **enterprise lock-in product** — the customer-exclusive library that becomes organizationally embedded. Defensibility = customer-specific corpus + switching cost + watermarking + accumulated calibration data.

Together, they cover the entire continuum of "shared commodity content → on-demand custom content → customer-exclusive IP-protected content." A customer can start with SKU 1 (low commitment), expand to SKU 2 (transactional), graduate to SKU 3 (full commitment). The expansion path is intentional and natural.

This is the same shape as enterprise software powerhouses: AWS sells S3 (SKU 1 commodity), Lambda (SKU 2 on-demand), Outposts (SKU 3 customer-exclusive). Salesforce sells Sales Cloud (SKU 1 packaged), Flow (SKU 2 customizable), Industries Cloud (SKU 3 vertical-specific). QOrium adopts the same playbook for assessment content.

---

## 10. CEO Decision Items (Updated)

The 6 decisions in Blueprint v1 §13 are still required. The 3-SKU addition adds:

7. **Confirm SKU naming.** Working names: ReadyBank, JD-Forge, Stack-Vault. Acceptable, or should marketing rename pre-launch?
8. **Confirm pricing tiers.** Specifically: is ₹40L/year for Stack-Vault Enterprise the right anchor for Bosch GCC pitch, or should we model ₹25L (lower CAC) or ₹60L (higher value-per-tier)?
9. **Confirm SKU sequencing.** Year 1 priority sequence in §5.3 — SKU 1 first, SKU 3 second, SKU 1 API third, SKU 2 fourth — does this match CEO's intuition about cash + strategic urgency?

---

*End of Document 5. The QOrium product story is now: 3 buyer segments × 4 delivery modes × 3 SKU use cases. All future deliverables (PPT deck, IdeaForge gate, CTO architecture, Bali sales playbook) build from this 3-SKU model.*
