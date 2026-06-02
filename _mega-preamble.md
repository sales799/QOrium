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
