# QOrium Pricing Pages — 3 SKU Copy v1.0

**Status:** v1.0 — CTO-Office authored. Designer hand-off-ready. Ratification path: CEO sign-off → web team builds at qorium.online/pricing/{readybank|jdforge|stackvault} during M3 soft launch.
**Authored:** 2026-05-02 (autonomous mode)
**Companion brief:** `brand/QOrium-Brand-Asset-Spec.md` (voice + colors + entity attribution rules) · `08-Bali-Sales-Playbook-v1.md` (3-motion GTM)

---

## SKU 1 — ReadyBank Pricing Page

**Route:** qorium.online/pricing/readybank
**Audience:** Two segments — Platform buyer (HackerRank/Mettl/HackerEarth-class) AND Recruiter buyer (staffing firm, in-house TA team)
**Decision split:** segment selector at top of page

### Hero

**Headline:** A library that doesn't leak.
**Sub:** ReadyBank is QOrium's shared question library for technical assessments — 5,000+ items across 8+ tech roles, IRT-calibrated, anti-leak-rotated every 24 hours, watermarked per candidate.
**Primary CTA:** Book a 30-min library walkthrough →
**Secondary CTA:** Download a sample 50-question pack (free)

### Segment selector

[ For Assessment Platforms (API + bulk export) ] [ For Recruiters & Staffing Firms (subscription) ]

### Platform tier (assessment-platform buyers)

**Headline:** Embed QOrium content into your platform via API.

| Tier | Price/yr | Volume | Best for |
|---|---|---|---|
| Starter | $5,000 | up to 100K candidate-views/yr | <50K MAU platforms |
| Growth | $15,000 | up to 500K candidate-views/yr | 50K-250K MAU platforms |
| Scale | $25,000 | unlimited | platforms with 250K+ MAU |

Custom enterprise pricing for >$25K — email partnerships@qorium.online.

**What's included (all platform tiers):**
- REST API + JSON bulk export
- 24-hour anti-leak rotation per question
- Per-platform watermarking
- IRT-calibrated difficulty parameters
- Quarterly content refresh
- Dedicated Slack/email channel
- 99.5% API uptime SLA

**What's NOT included:**
- Per-customer variants (Stack-Vault SKU)
- On-demand JD-specific generation (JD-Forge SKU)

### Recruiter tier (in-house TA + staffing firm buyers)

**Headline:** A library your candidates haven't seen on Google.

| Tier | Price/mo | Recruiters | Best for |
|---|---|---|---|
| Solo | ₹4,999 | 1 | Independent recruiters |
| Team | ₹19,999 | up to 5 | Small staffing firms |
| Studio | ₹49,999 | up to 25 | Mid-size in-house TA |

**What's included (all recruiter tiers):**
- ReadyBank library access (web portal + REST API)
- Watermarked candidate links
- Bulk export (CSV/JSON/HackerRank format)
- 1-business-day support SLA
- Monthly newly-validated questions

**Free trial:** 14 days, full access, no credit card required. Includes 50 candidate assessment links.

### Compare-at-a-glance

| Need | ReadyBank | JD-Forge | Stack-Vault |
|---|---|---|---|
| Shared library, scale | ✅ | — | — |
| JD-specific custom Qs | — | ✅ | — |
| Customer-exclusive | — | — | ✅ |
| Anti-leak rotation | ✅ | ✅ | ✅ |
| Watermarking | ✅ | ✅ | ✅ |
| Single annual price | ✅ | per-JD | annual |

### FAQ (top 6)

1. **Is the library updated?** Yes — quarterly refresh adds 1,000+ new IRT-validated items per quarter.
2. **What languages?** Wave 1: 8 sub-skills (Java, React/JS, SQL/Data, DevOps/SRE, Salesforce, Python, AWS, AI Prompt Engineering). Wave 2 (M6): SAP ABAP, Oracle HCM Cloud, Salesforce CPQ, Finacle/Flexcube, Embedded Automotive.
3. **What about anti-cheat?** We capture suspicious_signals (paste vs typed, time anomalies, watermark verification). You decide hire/no-hire — we don't auto-fail.
4. **How is pricing fair?** Anchored to peer benchmarks: HackerRank library-only seat is ~$10K/yr; Mettl ~$8K/yr. Our $5-25K/yr API tier targets the underserved content-only buyer.
5. **Can I integrate with my ATS?** Phase 3 M6-M9: native connectors for Greenhouse, Ashby, Darwinbox, Workday. Phase 1: REST API + webhooks for any ATS that supports them.
6. **Is QOrium a separate company?** No — QOrium is a product line of Talpro India Pvt Ltd. Same legal entity that operates Talpro India staffing services.

### Footer micro-text

QOrium™ is a product of Talpro India Private Limited. © 2026.

---

## SKU 2 — JD-Forge Pricing Page

**Route:** qorium.online/pricing/jdforge
**Audience:** Hiring managers, internal TA, staffing firms — anyone with a real JD who needs an assessment for it today.

### Hero

**Headline:** From JD to assessment in 2 hours. Or 24. Or 5 days.
**Sub:** JD-Forge takes your job description and generates a custom-fitted technical assessment, calibrated to the role, the seniority, and the JD-specific stack. Three tiers — pick by how much hand-craft you want.
**Primary CTA:** Generate a sample (free; no credit card)

### Three-tier table

| Tier | Standard | Reviewed | Enterprise |
|---|---|---|---|
| **Price per JD** | **$49** | **$199** | **$499** |
| **SLA** | 24 hours | 48 hours | 5 days |
| **Authoring** | AI-only | AI + SME review | AI + SME + IRT calibration on 10+ panel + custom export + named delivery PM |
| **Question count** | 30 (15 MCQ + 10 code + 5 design) | 50 | up to 100, role-shaped |
| **Anti-leak rotation** | yes (24h) | yes (24h) | yes (per-tenant variants) |
| **Watermark** | per-candidate | per-candidate | per-candidate, per-tenant |
| **Best for** | high-volume, fast-turnaround hiring | mid-tier deals, role-critical hires | Stack-Vault customers needing one-off custom JD packs |

### What's the same across all tiers

- Generated specifically for **your** JD — not "Senior Java" template; YOUR Senior Java with your stack, your seniority bar, your domain
- Difficulty distribution targets your IRT band (default 30% easy, 40% medium, 25% hard, 5% very-hard; configurable)
- Output format: Bundle (JSON + CSV + optional PDF)
- All formats: MCQ, code (Judge0-runnable), design, case-study
- Webhook callback when ready
- 7-day money-back if generation quality fails

### How it works (4 steps)

1. **Upload your JD** — PDF, .docx, or paste plain text
2. **Pick tier + question count + delivery format** — defaults work for 80% of buyers
3. **Wait for SLA** — Standard 24h, Reviewed 48h, Enterprise 5 days
4. **Receive bundle + integrate** — REST API, webhook, or download portal

### Pricing comparison

| Need | Best tier | Per-question cost |
|---|---|---|
| Quick turnaround, single role | Standard | $1.63/Q |
| Critical hire with reviewer eyes | Reviewed | $3.98/Q |
| Stack-Vault customer wanting a one-off | Enterprise | $5.00/Q (with role-shape + IRT pre-calibration) |

### FAQ (top 5)

1. **Will my JD be used for other customers?** No. Your JD content is private; the questions generated for you are yours by license; the underlying authoring engine improves on aggregate signals only (per A7 DPA).
2. **What if quality is poor?** 7-day money-back guarantee on Standard + Reviewed; Enterprise tier ships under acceptance criteria.
3. **Volume discount?** Yes — 10% on annual prepay of 100+ JDs; 15% on 500+ JDs.
4. **Difference vs ChatGPT?** ChatGPT generates one question at a time, no IRT calibration, no anti-leak, no watermarking, no rubrics, no quality bar, no warranty. JD-Forge is a productized service with all those guarantees.
5. **Can I integrate via API?** Yes — POST /jd-forge/orders. See [API docs](/docs/api/jdforge).

### Footer micro-text

QOrium™ is a product of Talpro India Private Limited. © 2026.

---

## SKU 3 — Stack-Vault Pricing Page

**Route:** qorium.online/pricing/stackvault
**Audience:** GCC + enterprise hiring leadership — TA Heads + Engineering hiring managers + InfoSec/IP at companies with proprietary tech stacks.

### Hero

**Headline:** Your roles. Your rubric. Your private vault.
**Sub:** Stack-Vault is QOrium's exclusive question library — custom-built for your stack, your hiring bar, your department or your enterprise. Watermarked per candidate. Rotated every 24 hours. Owned by you.
**Primary CTA:** Book a discovery call →

### Three tiers (annual)

| Tier | Department | Enterprise | Group |
|---|---|---|---|
| **Anchor price** | from ₹10L/yr | from ₹40L/yr | from ₹1Cr+/yr |
| **Library size** | 1,000-2,500 questions | 2,500-5,000 questions | 5,000-15,000 questions |
| **Stack coverage** | 1 stack (e.g., AUTOSAR, SAP S/4, Salesforce CPQ) | 3-5 stacks | 5-15 stacks; multi-region |
| **Rotation cycle** | 24h, weekly variant generation | 24h, daily variant generation | 24h, real-time variant generation per candidate |
| **Watermark** | per candidate | per candidate, per tenant | per candidate, per region, per BU |
| **SLA** | 48h support | 24h support; named CSM | 4h P0; dedicated CSM; quarterly executive reviews |
| **Multi-year discount** | 5% / 10% / 15% | 5% / 10% / 15% | up to 15% |
| **Best for** | single-team GCCs (e.g., Bosch India embedded automotive team) | mid-size enterprise (e.g., Wipro Salesforce practice) | mega-GCC (e.g., Bosch India 30K+ engineers) or multi-BU enterprise |

**Custom pricing** for >₹1Cr/yr — email enterprise@qorium.online.

### What you get (all Stack-Vault tiers)

- **Authored against your role-graph** — your sub-skills, your difficulty bar, your rubrics
- **Anti-leak engine v1** — 24-hour rotation cycle; if your library is leaked anywhere, we know within 24h and rotate before the next candidate
- **Per-candidate variants** — every candidate sees a uniquely watermarked variant
- **IRT-calibrated** — difficulty parameters validated on a 30+ candidate calibration panel (paid; QOrium-managed)
- **Forensic export on leak** — if confirmed leak, you get the source URL, screenshot, hash chain, and breach notification within 24h
- **IP assignment** — questions in your Stack-Vault are licensed exclusively to you (within your defined scope) for the contract term
- **Custom format** — JSON, CSV, your own ATS format, video questions on request
- **MSA + DPA** — Master Service Agreement + Data Processing Agreement (DPDPA + GDPR compliant)
- **Dedicated CS team** — Department: shared CSM; Enterprise+: named CSM with quarterly business reviews
- **QBR (Quarterly Business Review)** — Enterprise+ tier; CTO-level discussion of library performance, calibration drift, leak alerts

### 3-step engagement

1. **Discovery call (60 min)** — your TA + Engineering hiring leadership + QOrium CTO. Map your role-graph; size the library; discuss anti-leak SLAs.
2. **Sample 50-question pack** — we deliver within 2 weeks; your engineers review for technical accuracy + fit; signed feedback loop.
3. **Multi-stack scoping + procurement** — finalize stack list, library size, contract term, MSA, DPA, payment terms. Typical procurement window: 4-9 months for Indian GCCs (per Bali Playbook §3.8).

### Why Stack-Vault, not ReadyBank

| Question | ReadyBank | Stack-Vault |
|---|---|---|
| Is the library yours? | No (shared, sold to many) | Yes (exclusive within scope) |
| Can a competitor see the same Qs? | Yes | No |
| Can your candidates pre-coach on Reddit? | Eventually | No (24h rotation + watermarks) |
| Custom to your stack? | Generic Wave 1 | Yes (authored against your role-graph) |
| Annual price | $5-25K | ₹10L-1Cr+ |

### FAQ (top 5)

1. **Procurement timeline?** Indian GCCs: 4-9 months from discovery to first PO. We support full procurement (MSA, DPA, InfoSec questionnaires, GDPR DPIA for German parents).
2. **What's the IP ownership model?** Questions authored for your Stack-Vault are licensed exclusively to you within the defined scope (e.g., "Bosch India hiring across 30K engineers"); QOrium retains the underlying authoring engine; multi-year contracts include carry-forward rights.
3. **What about regulatory data residency?** EU customers' data stored in EU regions per Phase 6 milestone; India + APAC default; cross-border via Standard Contractual Clauses + supplementary measures (per A7 DPA).
4. **What if you go out of business?** Source-code escrow + question library escrow per Master Service Agreement §13. You retain perpetual licensed access to your Stack-Vault on QOrium discontinuation.
5. **Can we audit your security posture?** Yes. SOC 2 Type II target by Y2; ISO 27001 by Y3; customer audit rights with reasonable notice per A7 DPA §11.

### Footer micro-text

QOrium™ is a product of Talpro India Private Limited. © 2026. Trademarks "QOrium", "ReadyBank", "JD-Forge", "Stack-Vault" are trademarks of Talpro India Pvt Ltd; registration pending in India + US (Class 9, 42).

---

## DESIGNER + WEB TEAM HAND-OFF NOTES

- **Brand colors per spec:** Primary navy #0A1F3D / Cyan #00B3C7 / Gold #D4A85A
- **Typography:** Inter Display (headings) / Inter (body) / JetBrains Mono (code samples in JD-Forge / API examples)
- **Layout:** mobile-first; tier table responsive (collapses to cards on mobile <768px)
- **CTAs:** primary = filled gold button on navy; secondary = ghost outline
- **Conversion tracking:** GA4 events on each CTA click (book_call, download_sample, free_trial_start, contact_sales)
- **A/B test candidates:** hero headline; segment-selector vs tabs vs separate-pages on ReadyBank
- **Accessibility:** WCAG 2.1 AA; comparison tables get proper <th scope="col"> semantics
- **Copy review cadence:** quarterly; tier prices pegged to SO-23 anchor + market data refresh

## CHANGELOG

- v1.0 (2026-05-02): initial draft per autonomous-mode CTO authoring; pricing pegged to Wave 1 sample-pack inventory + Bali Playbook + Constitution v2.0 §1.2 + entity-clarification §1.0.1 (footer attribution).

---

*End of pricing pages. Hand off to designer + web team for M3 soft-launch implementation. Ratification: CEO + Bali sign-off before publish.*
