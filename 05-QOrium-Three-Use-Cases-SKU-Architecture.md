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
