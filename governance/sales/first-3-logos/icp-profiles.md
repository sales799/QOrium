# Ideal Customer Profiles — First 3 Logos

3 ICPs are the canonical Y1 targets. They are ordered by
**conversion likelihood × cycle speed**, not by lifetime value.
Y2+ ICPs (Bosch GCC and similar enterprise GCC programs) live in a
separate Tier-A7 pack.

---

## ICP-1 — Indian Staffing & Recruitment Process Outsourcing (RPO) firms

**Why first:** Talpro is Customer-Zero (this is QOrium's own
founders' adjacent industry). Pain points are deeply understood.
Sales cycle is 6-10 weeks from cold to signed. Decision-makers are
accessible. Budget approval is single-step.

### Firmographic

| Attribute | Target |
|---|---|
| Geography | India (all major metros + tier-1 cities) |
| Size | 50-500 recruiters; ₹50Cr-₹500Cr ARR |
| Sub-segment | IT staffing; tech-heavy generalist staffing; specialist (BFSI / pharma / GCC tech) |
| Tech adoption | already use 1-2 SaaS tools (Naukri, Bullhorn, Zoho); not greenfield |

### Buyer

| Role | Typical title | Decision authority |
|---|---|---|
| Economic buyer | Founder / CEO / Managing Partner | budget approval |
| Champion | Head of Delivery / VP Recruiting / Director Tech Practice | technical eval |
| Influencer | Senior recruiter / team lead | day-to-day usage |
| Blocker | CFO (occasionally) | ROI proof |

### Pains we solve

1. **Question leakage:** their candidates' answers leak to public
   forums within 30 days; question rotation is manual + lossy
2. **Cheating signals:** AI-generated answers, screen-mirroring,
   no watermarking — they cannot prove who answered what
3. **Calibration drift:** their internal "tech screen" is dated; no
   IRT calibration; pass rates skew over time; senior hires
   complain about junior items being too easy
4. **Multi-tenant audit:** when a client asks "who answered Q47 in
   our shortlist?" they cannot produce an audit trail in < 4 hours

### What QOrium offers ICP-1

- ReadyBank API ($5K-$25K/yr) — drop-in IRT-calibrated technical
  questions with anti-leak rotation + per-candidate watermark
- Stack-Vault (₹10L-₹40L/yr) — tenant-isolated question library
  with double-watermark (HMAC + homoglyph stego)
- Audit Log API (Sprint 4.4 v0) — full audit trail per candidate,
  exportable as CSV/JSON in seconds (Sprint 4.4.2)
- Webhooks (Sprint 4.5) — pipeline integration with their existing
  ATS (Bullhorn, Greenhouse via Sprint 4.6 ATS connectors)
- White-glove onboarding — direct CEO + CTO Office support for the
  first 3 logos; we know the pain because we live it

### Pricing range (per BRAND.md ranges-only discipline)

- ReadyBank API entry: $5K-$15K/yr (depending on volume)
- Stack-Vault tenant: ₹10L-₹40L/yr (depending on tier + customisation)
- All pricing always quoted as ranges. Single-SKU quotes happen at
  contract stage, never at intro.

### Conversion likelihood scoring

Each prospect scored 1-5 on:

| Dimension | 5 = high | 1 = low |
|---|---|---|
| Pain awareness | already complains about leakage | "we don't have this problem" |
| Champion quality | warm intro + previous QOrium contact | cold list contact |
| Technical fit | already uses 2+ HRtech SaaS | spreadsheet + email shop |
| Budget signal | recent funding / cash on hand | recent layoffs |
| Decision speed | 1-2 step approval | committee + procurement gauntlet |

≥ 20/25 → priority outbound. 15-19 → standard. < 15 → deprioritise.

### Target list approach

Build 25-name target list from:
- LinkedIn Sales Navigator (filter: India staffing + 50-500
  employees + decision-maker titles)
- Indian Staffing Federation (ISF) member directory
- Naukri / Hirect / iimjobs paying-customer list (publicly visible
  via job-post volume)
- Talpro's own "competitor list" (CEO has organic insight)
- Headhunters India / NLB Services / TeamLease / Quess Corp / FirstMeridian
  (large strategic; longer cycle but high ARR)

### Anti-targets

- < 50 recruiters (not enough volume to justify $5K/yr)
- Pure-domestic non-tech (no IRT-tech-question pain)
- Government recruitment cells (procurement cycle 6-18 months;
  Y1 budget cannot wait)

---

## ICP-2 — Mid-market enterprise hiring teams (300-2000 engineers)

**Why second:** Pain is real but cycle is longer (12-20 weeks). One
champion-buyer often sufficient. Budget is enterprise-typed (annual
SaaS line item). Pricing is higher per logo (₹40L-₹1Cr+/yr Stack-Vault
tier).

### Firmographic

| Attribute | Target |
|---|---|
| Geography | India + India-GCC + Singapore HQ |
| Size | 300-2,000 engineers; ₹500Cr-₹5,000Cr ARR |
| Sub-segment | Series-D + tech (Razorpay/Cred/Setu/Zerodha tier); pre-IPO India tech; mid-cap IT services (Hexaware, LTIMindtree subsidiaries); Indian banks + insurance tech arms |

### Buyer

| Role | Typical title | Decision authority |
|---|---|---|
| Economic buyer | VP Engineering / CTO | budget approval (sub-cap) |
| Champion | Head of Talent Acquisition / Engineering Manager + TA partner | technical eval |
| Influencer | Tech lead / hiring manager | day-to-day usage |
| Blocker | Procurement (always); Security (always) | RFP + DPDPA + SOC 2 audit |

### Pains we solve

1. **Hiring fairness audit:** they hire across India + GCC, must
   defend bias-free assessment to legal + investors
2. **Question leakage at scale:** hiring 200 engineers/year; same
   questions across 10 panels = leakage exposure
3. **Audit trail for SOX / SOC 2:** they need who-answered-what
   trails for compliance auditors
4. **Vendor consolidation:** they want 1 vendor, not 3 (HackerRank
   + ATS + audit-tool stack); QOrium offers 3-in-1

### What QOrium offers ICP-2

- Stack-Vault (₹40L-₹1Cr+/yr) — enterprise tier with SAML/SCIM
  (Sprint 3.3) + tenant isolation + double watermark
- ReadyBank API enterprise tier — premium support, custom items
- Audit Log API + Audit Export (Sprint 4.4) — SOC 2 / SOX audit
  trail in CSV/JSON
- SOC 2 readiness harness (Sprint 5.1) — control-mapping +
  evidence pull; helps customer's own audit
- ATS connectors (Sprint 4.6) — sync candidate data + assessment
  results to their existing Greenhouse / Lever / Workday HCM
- Webhooks (Sprint 4.5) — real-time event flow to their internal
  hiring dashboards
- IRT calibration + Bias-Detection report — credentialed signoff
  by I/O Psychologist contractor (Tier-A2)

### Pricing range

- Stack-Vault tier: ₹40L-₹1Cr+/yr (size + customisation)
- Custom item authorship (post-SME-Lead-hire Tier-A3): ₹5L-₹15L/quarter
- ATS connector setup fee: $5K-$15K one-time; $10K-$30K/yr support

### Conversion likelihood

Same 1-5 rubric as ICP-1, but additional dimensions:
- Compliance pressure (SOC 2 in flight: +1, achieved: +0.5)
- Vendor consolidation appetite (CFO mandate: +1)
- Leadership turnover (new VP Eng: +1, stable VP Eng: 0)
- Investor reporting (pre-IPO: +1, public co: +1, PE-backed: +0.5)

### Target list approach

Build 25-name list from:
- Funding announcements (Series D+ in last 12 months from VCCircle,
  TechCrunch India, YourStory)
- Public job-post volume (≥ 10 SDE openings = good signal)
- Hiring manager LinkedIn outreach (target VP Eng + Head of TA)
- Mutual-introduction via existing Talpro client portfolio
- Indian Software Alliance (NASSCOM CoE membership) directory
- Conference attendee lists (BSidesBLR, Rootconf, SaaSBoomi)

### Anti-targets

- < 300 engineers (single-team scale; Stack-Vault economics don't fit)
- Government / PSU (procurement cycle 12-24 months)
- Highly regulated (PSU banks, defense) — long compliance cycle
- ICs without VP support (can't sponsor Stack-Vault budget)

---

## ICP-3 — India HRTech / EdTech recruiters

**Why third:** smallest ARR per logo (₹10L-₹40L/yr Stack-Vault entry
tier), but fastest cycle (4-8 weeks; product-led-growth-friendly).

### Firmographic

| Attribute | Target |
|---|---|
| Geography | India + India-diaspora HQ |
| Size | Series-A / Series-B India HRTech; 50-300 employees |
| Sub-segment | Recruitment marketplaces (Cutshort, iimjobs, Hirect); EdTech (Scaler, Newton School); coding bootcamps (Masai, Almabetter) |

### Buyer

| Role | Typical title | Decision authority |
|---|---|---|
| Economic buyer | Founder / CEO | budget approval |
| Champion | CTO / Head of Product | technical eval |
| Influencer | Lead engineer | implementation |
| Blocker | rare at this scale; CTO usually decides solo |

### Pains we solve

1. **Their candidates' tech-screen drops out** — they lose 30%+
   in tech screen due to outdated/leaked questions
2. **Their hiring partners want certified IRT-calibrated
   assessment** — partners are choosier; "trust signal" matters
3. **Their content team is 1-2 people** — they can't author + maintain
   1,000-question library themselves; QOrium is 5,000 ready
4. **Their investors ask about defensibility** — IRT-calibrated +
   anti-leak + watermark is the kind of moat investors love

### What QOrium offers ICP-3

- ReadyBank API entry tier ($5K-$15K/yr) — drop-in IRT-calibrated
  questions; their bootcamp/marketplace gets a credibility lift
- Stack-Vault entry tier (₹10L-₹40L/yr) — tenant-branded library
  for their members
- White-label option (Y2): they re-skin and re-sell within their
  ecosystem
- Methodology white paper (Tier-A2 D6) — they cite us, we cite them
- Co-marketing: investor decks, blog posts, joint webinar

### Pricing range

- ReadyBank API entry: $5K-$15K/yr
- Stack-Vault entry: ₹10L-₹40L/yr
- White-label (Y2): negotiated per-deal

### Conversion likelihood

Same rubric as ICP-1 + ICP-2, plus:
- Recent fundraise (last 6 months: +1)
- Product-led-growth orientation (PLG: +1)
- CTO is hands-on (yes: +1; no: 0)
- Investor-deck-driven (will mention QOrium in their deck: +1)

### Target list approach

Build 10-name list:
- Series-A India HRTech (last 24 months funding)
- EdTech with hiring marketplaces (Scaler, Newton, Almabetter,
  upGrad, etc.)
- Coding bootcamps with placement guarantees
- LinkedIn search: founders of Series-A HRTech in India

### Anti-targets

- Very early (pre-seed): can't pay
- Pure consumer-edu (no recruiter overlap)
- LMS-only (no assessment overlap)

---

## Combined target list

20 ICP-1 + 25 ICP-2 + 10 ICP-3 = **55 named accounts**.

Each scored on the 1-5 rubric in `qualification-scorecard.md`. Top 30
by score → priority outbound. Mid 15 → standard. Bottom 10 → nurture.

Conversion expectations:
- 55 outreach → 25-30 discovery calls
- 25 discovery → 10-12 qualified opportunities
- 10 qualified → 4-6 pilots
- 4-6 pilots → 3 signed logos in 12-16 weeks (best case 9 weeks)

---

_ICPs are draft. CEO refines per recent customer-conversation
signals. NO outbound has been sent._
