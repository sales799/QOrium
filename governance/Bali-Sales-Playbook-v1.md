# Bali Sales Playbook — v1

> **Status:** ratified — fills the gap referenced 7+ times across Constitution v1.0 / v2.0, Blueprint v1.1, SKU Architecture, and the Ratification Record.
> **Owner:** BALI (Office 7) — operated Y1 by CEO + AE Enterprise (M3) + BD Platforms (M3); Y2+ by Sales Lead.
> **Authority source:** Constitution v2.0 §2.7 (BALI charter) + SO-1, SO-9, SO-10, SO-11, SO-18, SO-19, SO-22, SO-23, SO-24, SO-25.
> **Last updated:** 2026-05-07
> **Source of truth for:** sales motions, pricing bands, pipeline stages, ICP definitions, objection handling, customer-zero pattern, AI-agent / human-AE split, KPIs, onboarding/renewal/expansion.

---

## §1 — Mission and Charter

QOrium's sales mission is to convert the three-sentence USP into signed contracts across three sales motions, while operating as a hybrid AI-agent + human-AE motion at every step where regulation, contract value, or trust permits the AI lead.

**Three-sentence USP** (verbatim, non-negotiable per Constitution §1.1 and SO-12):

> QOrium is the only company in the world that combines AI-speed authoring with I/O-psychologist-grade validation, runs a continuous anti-leak rotation engine, organizes every question in a normalized role-graph, and ships it to any assessment platform's import format via a single API. We sell three SKUs — a shared ReadyBank library, on-demand JD-Forge generation, and customer-exclusive Stack-Vault libraries — covering the full continuum from commodity to fully exclusive IP. We are the content layer the entire $30 billion talent assessment industry was missing.

The USP is the opener for **every** cold call, deck, demo, email, and proposal. No paraphrasing. No reordering. No trimming.

### What Bali owns
- All three sales motions end-to-end (top-of-funnel → close → expansion → renewal).
- Pipeline management in HubSpot CRM (the **only** source of truth — no shadow spreadsheets).
- Customer onboarding sequences (post-signature → first usage → first value).
- Customer success: QBRs, usage health, expansion plays, renewal motions.
- Reference customer cultivation (who's asked, what's offered).
- Quarterly competitive scan per SO-25.

### What Bali does **not** own (escalates to CEO)
- Pricing exceptions >10% off list (or any Stack-Vault deal below ₹35L) — SO-11.
- Strategic accounts where the CEO relationship is the decisive lever.
- New geographic markets (currently India + US-East + UK; everything else = CEO).
- Partnership-as-distribution agreements (channel, OEM, white-label).
- Brand messaging changes (the three-sentence USP is locked).
- Anything triggering MANTHAN re-validation (acquisitions, market exits, structural shifts).

---

## §2 — The Three Sales Motions

QOrium runs three distinct motions. Each has a different ICP, sales cycle length, ACV, decision unit, and content collateral. **Mixing motions on a single account is the most common Year-1 failure mode** — the playbook is explicit so the CEO + AE + BD never lose discipline.

### §2.1 Motion A — Staffing Subscription (ReadyBank for Recruiters)

| Attribute | Value |
|---|---|
| **SKU** | ReadyBank shared library + JD-Forge per-JD on-demand |
| **ICP** | Indian staffing firms (50–500 recruiters) hiring for tech roles end-to-end |
| **ACV** | ₹3L – ₹15L/yr (≈$3.5K – $18K/yr) |
| **Sales cycle** | 14–30 days |
| **Decision unit** | Founder/CEO + Delivery Head (2-person committee) |
| **Buyer pain** | "We can't tell who can actually code in <5 min screening" |
| **Primary lever** | Talpro Customer Zero reference (SO-1) |
| **AI-agent allowed?** | Yes, for outreach + qualification (SO-18) |
| **Human AE required?** | At demo + close |
| **Expansion play** | More seats → JD-Forge add-on → Stack-Vault for marquee end-customers |

**Why this is the Year-1 anchor motion:** Talpro India is QOrium's Customer Zero. Every Talpro peer is a 1-degree warm intro. The CEO has personal credibility with this exact ICP. The 470 questions already in ReadyBank cover the canonical Indian-recruiter use cases (Java/Node/Python/React/SQL backend + frontend full-stack roles). This is the motion that ships first **and** validates pricing fastest.

### §2.2 Motion B — Enterprise Stack-Vault (Customer-Exclusive Libraries)

| Attribute | Value |
|---|---|
| **SKU** | Stack-Vault custom-built library + IRT scoring + watermarked anti-leak rotation |
| **ICP** | India GCCs (German, US, Japanese parent), F500 India tech offices, well-funded scaleups (>₹500Cr revenue) |
| **ACV** | ₹35L – ₹2Cr/yr (≈$42K – $240K/yr) — **₹35L floor per SO-11** |
| **Sales cycle** | 90–180 days |
| **Decision unit** | Talent Head + CISO + Procurement + (sometimes) CTO — 4-person committee |
| **Buyer pain** | "Our internal stack is unique enough that off-the-shelf assessments leak our hiring filter and waste candidate time" |
| **Primary lever** | Watermark + IRT validation + role-graph mapped to **their** stack |
| **AI-agent allowed?** | No — pure-AI sales **forbidden** for deals >₹10L ACV per SO-18 |
| **Human AE required?** | Yes — AE Enterprise leads end-to-end; CEO co-pilots Y1 |
| **Expansion play** | More squads → API integration with their internal LMS/ATS → multi-year |

**Y1 marquee target:** Bosch GCC Bengaluru. Decision: closeable in Phase 2 (M3–M6) per Constitution Phase Map. Per Punchlist §E (E1–E4), this is currently CEO-only outreach work; AE Enterprise (M3 hire) joins once warm.

### §2.3 Motion C — Platform API (B2B2C: assessment platforms embed our content)

| Attribute | Value |
|---|---|
| **SKU** | ReadyBank API + JD-Forge API + bulk export |
| **ICP** | Tier-2/3 assessment platforms in India + global tier-3 (Xobin, Testlify, Talview cluster) |
| **ACV** | $5K – $25K/yr per SO-23 (Tier-3); $25K–$60K/yr (Tier-2 platforms scaling content); $60K+ Tier-1 (Phase 3+) |
| **Sales cycle** | 60–120 days |
| **Decision unit** | Product Lead + Engineering Lead + sometimes CEO (smaller platforms) |
| **Buyer pain** | "Building 5,000+ validated questions in-house is a 2-year project we don't want — yet our customers ask for more languages/sub-skills every quarter" |
| **Primary lever** | API simplicity (single integration, role-graph normalization, format-agnostic export) + IRT + anti-leak |
| **AI-agent allowed?** | Yes for prospecting; **no** for close (deals exceed ₹10L per SO-18) |
| **Human AE required?** | BD Platforms — leads end-to-end Y1; CEO co-pilots first 3 |
| **Expansion play** | More API calls → revenue share → eventually white-label co-brand |

**Y1 logo target:** 1× Tier-3 platform pilot signed by M9 (per Phase 3 gate). Tier-1 (HackerRank/Mercer/Mettl/HackerEarth/CodeSignal/iMocha) is Year 2-3 work.

### §2.4 Motion-discipline rules

1. **One motion per account.** If a Tier-3 platform also wants Stack-Vault for their internal hiring, **two separate deals, two separate AEs, two separate proposals.**
2. **Lead motion = whatever brought them in.** Cross-sell only after 90 days of clean usage on the lead motion.
3. **Stack-Vault leads do not flow into ReadyBank.** SO-10 — Stack-Vault questions are contractually exclusive; never mix.
4. **JD-Forge is the cheap entry point** but a JD-Forge customer is not a Stack-Vault prospect by default. Score them separately.
5. **AI-agent stops at ₹10L ACV** per SO-18. A human AE picks up the moment qualification exceeds that ceiling.

---

## §3 — Pricing Bands (verbatim — what AE/BD quote without escalation)

### §3.1 ReadyBank Staffing Subscription (Motion A)

| Tier | Seats | List price | AE discount authority |
|---|---|---|---|
| **Starter** | 1–10 recruiters | ₹3L/yr | up to 10% off → ₹2.7L floor |
| **Pro** | 11–50 recruiters | ₹8L/yr | up to 10% off → ₹7.2L floor |
| **Pro+** | 51–150 recruiters | ₹15L/yr | up to 10% off → ₹13.5L floor |
| **Custom** | >150 recruiters | bespoke | CEO approval mandatory |

### §3.2 ReadyBank API (Motion C — per SO-23)

| Tier | Volume | List price | AE/BD discount authority |
|---|---|---|---|
| **API Starter** | <50K questions/yr | $5,000/yr | up to 10% → $4,500 floor |
| **API Pro** | 50K–250K questions/yr | $12,000/yr | up to 10% → $10,800 floor |
| **API Enterprise** | 250K+ questions/yr | $25,000/yr | up to 10% → $22,500 floor |
| **API Custom** | >1M questions/yr OR multi-region | bespoke | CEO approval mandatory |

**Anchor logic** (per SO-23, defended against 20-competitor pricing landscape per Doc 10 §4.2):
- *Above commodity* — Codility Starter $1,200/yr, HackerRank Starter $1,990/yr, Testlify Starter $1,188/yr. We do not compete on price floor.
- *Above mid-market* — HackerRank Pro $4,490/yr, DevSkiller TalentScore $5,988/yr, Glider AI entry $3,588/yr. Our floor sits just above.
- *Below enterprise* — CodeSignal Pre-Screen $19,000/yr, HackerRank Enterprise ~$70,608/yr avg. Our ceiling sits below the enterprise ceiling, deliberately.

### §3.3 JD-Forge per-JD pricing (Motions A + C)

| Tier | What's included | List price |
|---|---|---|
| **Standard** | AI-authored + AI self-critique pass | ₹2,500/JD |
| **Reviewed** | + SME signoff (Per SO-7 quality bar) | ₹6,000/JD |
| **Enterprise** | + IRT calibration + role-graph mapping | ₹15,000/JD |

JD-Forge per-JD pricing is **firm** (SO-11 — no in-between). No AE discount authority.

### §3.4 Stack-Vault Enterprise (Motion B)

| Tier | Library size | Watermark | List price (annual) |
|---|---|---|---|
| **Vault-Starter** | 200–500 items | 3-marker | ₹35L/yr **floor — SO-11** |
| **Vault-Pro** | 500–1,500 items | 5-marker + IRT | ₹75L–₹1.2Cr/yr |
| **Vault-Enterprise** | 1,500+ items | 7-marker + IRT + forensic attribution | ₹1.5Cr–₹2Cr/yr |

> **AE/BD authority:** zero. Every Stack-Vault deal under ₹35L → CEO. Every Stack-Vault deal at-floor → CEO countersign. There are no exceptions to SO-11.

### §3.5 Multi-year discount schedule (AE authority)

| Term | Discount |
|---|---|
| 1 year | 0% |
| 2 years | 5% |
| 3 years | 10% (combinable with seat-based tier discount only with CEO approval) |

### §3.6 Reference customer rebate (SO-12 in Bali charter §2.7)

A customer who provides 3 active references in their first year earns a **5–10% renewal rebate** at year-2 signature. AE proposes; CEO approves the rebate at Y2 renewal.

---

## §4 — Pipeline Stages (HubSpot CRM canonical schema)

Every deal in HubSpot must move through these stages in order. Skipping is forbidden — it's the most common reason deal forecasts go wrong.

| Stage | Definition | Required artifacts to advance | Conversion target |
|---|---|---|---|
| **0. Prospecting** | AI agent identified or AE/BD researched | ICP fit ≥ 4/5; LinkedIn + signal; CRM record | n/a |
| **1. Outreach Sent** | First touch (LinkedIn DM / email / WhatsApp) | Sequence enrolled; first message logged | 25% → reply |
| **2. Replied / Qualified** | Prospect engaged; pain confirmed | Discovery notes; BANT-equivalent (budget, decision unit, timeline) | 60% → demo |
| **3. Demo Scheduled** | Time on calendar | Calendly link + brief in CRM | 90% → demo held |
| **4. Demo Held** | Live demo with USP + Customer Zero reference | Demo recording + objection log + next step | 50% → proposal |
| **5. Proposal Sent** | Written proposal with pricing + terms | Proposal PDF in CRM; mutual close plan | 50% → MSA/Order |
| **6. MSA / Order Form Negotiation** | Legal back-and-forth | Redlines tracked; CDO/CISO comms logged if Stack-Vault | 80% → signed |
| **7. Closed Won** | Signature obtained, kickoff scheduled | DocuSign + signed contract + invoice | n/a |
| **L. Closed Lost** | Decision: no | Disqualifying reason logged (one of the standard 8 — see §6) | n/a |

> **Forecasting rule:** A deal does not appear in any forecast until Stage 4 (Demo Held). Earlier stages are pipeline coverage, not forecast.

### §4.1 Deal-stage SLAs

| From → To | Max time | If exceeded |
|---|---|---|
| 1 → 2 | 7 days | Auto-nurture sequence; remove from active outreach |
| 2 → 4 | 14 days | AE/BD personal escalation; CEO touch if Stack-Vault |
| 4 → 5 | 5 business days | Prospect cooling — investigate or disqualify |
| 5 → 6 | 14 days | Mutual close plan re-issued |
| 6 → 7 | 30 days (Motion A), 60 days (Motion C), 90 days (Motion B) | Procurement escalation; CEO call |

---

## §5 — ICP Scoring & Buyer Personas

### §5.1 Motion A — Staffing Subscription ICP score (out of 5)

Score each prospect 0–5 across 5 dimensions; advance only if total ≥ 18/25.

| Dimension | 5 = ideal | 0 = disqualify |
|---|---|---|
| Recruiter count | 50–500 | <5 or >2,000 |
| Tech focus | 80%+ tech roles | <30% tech roles |
| India HQ or India delivery centre | Yes | No (Y1; revisit Y2 for SEA/ME) |
| Public Talpro-network 1-degree | Yes | Cold |
| Founder-decision-maker accessible | Yes | Layered procurement |

### §5.2 Motion B — Enterprise Stack-Vault ICP score

Score 0–5 across 6 dimensions; advance only if total ≥ 22/30. **Bosch Bengaluru = 28/30 reference benchmark.**

| Dimension | 5 = ideal | 0 = disqualify |
|---|---|---|
| Org type | India GCC of F500 parent | Pure services firm |
| Annual hiring volume | >300 tech hires/yr | <50 |
| Stack distinctiveness | Internal stack ≠ off-shelf coverage | Pure mainstream stack |
| Existing leak pain | Documented (e.g., questions on competitor blogs) | None reported |
| Talent Head + CISO accessible | Both reachable | Procurement-gatekept |
| Reference value to QOrium | F500 logo + GCC peer-leverage | Mid-market private |

### §5.3 Motion C — Platform API ICP score

Score 0–5 across 5 dimensions; advance only if total ≥ 18/25.

| Dimension | 5 = ideal | 0 = disqualify |
|---|---|---|
| Platform tier | Tier-2/3 (per Constitution §2.7 classification) | Tier-1 in Y1 (re-visit Y2) |
| Library gap | <2,000 questions in their library | >10,000 (less need) |
| Customer demand for India-stack | Confirmed inbound asks | None |
| Engineering bandwidth for integration | Has spare capacity | None for 6+ months |
| Strategic alignment | Their roadmap = "more content, faster" | Vertical pivot away from content |

### §5.4 Buyer personas (the four who matter)

**P1 — The Staffing-Firm Founder (Motion A)**
Pain: every recruiter screen is judgement; can't scale founder-quality hiring.
Title: Founder/CEO of a 50–300 person staffing firm.
What unlocks the call: Talpro Customer Zero usage data (real numbers, real candidates).
What unlocks signature: trial pilot for one delivery vertical (Java backend hiring) → 30-day metrics.
**Owner: CEO (Y1) → AE Enterprise (Y2).**

**P2 — The GCC Talent Head (Motion B)**
Pain: cross-leak between hiring drives wastes calibrated questions; off-shelf assessments don't reflect their stack.
Title: Head of Talent / Head of Engineering Hiring at India GCC.
What unlocks the call: peer reference (other GCC running QOrium) + Constitution USP delivered verbatim.
What unlocks signature: 90-day pilot vault on one squad (e.g., Bosch Mobility Solutions Java/AUTOSAR squad) → measure leak reduction + interviewer agreement.
**Owner: AE Enterprise (M3 hire) + CEO co-pilot.**

**P3 — The CISO at GCC / F500 (Motion B blocker)**
Pain: any vendor handling candidate data is a DPDPA / GDPR / parent-company-DPA risk.
Title: CISO or Data Protection Officer.
What unlocks signoff: SO-19 posture statement (no PII storage by default), DPA template ready, watermark + audit trail.
**Owner: AE Enterprise + CTO co-pilot for technical Q&A.**

**P4 — The Platform Product Lead (Motion C)**
Pain: their backlog of "more content" never gets to the top because hiring engineers to author questions is slow + low-leverage.
Title: VP Product / Head of Product at Tier-2/3 assessment platform.
What unlocks the call: technical reference (running enterprise customer happy with us) + API quickstart link.
What unlocks signature: integration spike (1-week pair-programming with their dev) → demonstrable end-to-end question flow.
**Owner: BD Platforms (M3 hire) + CTO co-pilot for the spike.**

---

## §6 — Objection Handling (referenced from Constitution Ratification Record §3.7)

The 8 standard objections + responses. Every AE/BD memorises this; the AI-agent loads it as a system prompt for outreach replies.

### O1 — "We already use HackerRank / CodeSignal / Codility — why switch?"
**Response:** "We don't ask you to switch — we ask you to layer. ReadyBank API runs alongside whatever assessment platform you use; we ship validated content into their import format. JD-Forge generates net-new content for roles where their bank is thin. Stack-Vault is the only customer-exclusive option in the market. Your existing tooling stays."
**Underlying rule:** SKU positioning per Constitution §1.0. Never disparage; layer.

### O2 — "₹35L is too high for Stack-Vault."
**Response:** "₹35L is the floor that protects exclusivity for every other Stack-Vault customer. The watermark + role-graph + IRT calibration is an order of magnitude beyond a simple custom question batch. If you're sizing for under ₹35L, JD-Forge Enterprise tier (₹15K/JD) for your top 50 critical roles = ₹7.5L; that's a better fit. Want me to scope that?"
**Underlying rule:** SO-11 — never discount below ₹35L without CEO. Re-route to JD-Forge.

### O3 — "How is your AI authoring different from anyone else's? Everyone says they use AI."
**Response:** "Three things, in order: (1) we self-critique every AI draft against I/O-psychologist rubrics — Cronbach's alpha, Item-difficulty distribution, content validity — before any human sees it. (2) Every released item is IRT-calibrated; HR-driven enterprise buyers expect this and most AI-only platforms don't have it. (3) The role-graph normalisation lets us trace any item to a specific sub-skill, so when a JD comes in we don't generate a fresh question, we serve the calibrated one. Speed without validation = noise; speed with validation = our wedge."
**Underlying rule:** SO-21 IRT mandate + SO-22 plagiarism detection + Constitution USP §1.1.

### O4 — "Show me real numbers — accuracy, library size, plagiarism detection."
**Response:** "Here's exactly that, dated this session." → fetch live numbers from `talpro_db_query` / live web sources. Never quote a number from a deck unless it has a live-source citation in the same session.
**Underlying rule:** SO-24 No-Fiction Rule — recursive; applies to every external claim.

### O5 — "What about candidate data privacy / DPDPA / GDPR?"
**Response:** "QOrium does not store candidate PII by default. Where Stack-Vault engagements involve any candidate-attributable data, we sign a DPA before any data flows. The default architecture passes IDs and assessment scores; the candidate's name + email never leave your system. Our DPA template is at [link]; have your DPO review."
**Underlying rule:** SO-19 — DPDPA + GDPR posture is absolute.

### O6 — "How do we know your questions won't leak?"
**Response:** "Three layers. (1) Anti-leak rotation engine runs continuously — Critical-severity leaks rotate within 24 hours, High within 7 days. (2) Every Stack-Vault question carries a multi-marker watermark; minimum 3 markers for Vault-Starter, 5 for Pro, 7 for Enterprise. (3) Forensic attribution lets us trace which customer's questions appeared on a leak source. The watermark is contractual + technical."
**Underlying rule:** SO-9 anti-leak SLA + SO-10 Stack-Vault exclusivity.

### O7 — "We need to talk to existing customers before we sign."
**Response:** "Talpro India is our Customer Zero — the founder team is on QOrium for internal hiring drives from Day 1. I'll set up a call directly with Talpro's Delivery Head. For [GCC reference / platform reference], I'll route it through CEO at the right time."
**Underlying rule:** SO-1 Talpro Customer Zero mandate; reference cultivation per Bali §2.7.

### O8 — "We don't have budget this quarter."
**Response:** "Understood. Two paths: (1) start with a 90-day pilot for one squad / one role family — that's a sub-₹3L commitment for Motion A, sub-₹7L for Motion B Vault-Starter scoping. (2) JD-Forge per-JD has zero subscription — pay per JD, scale on demand. Either lets you start producing value before the next budget cycle."
**Underlying rule:** Right-sized entry tier (Constitution Phase Map: M1–M3 first-logo motion).

---

## §7 — Stack-Vault Scoping Conversation (referenced from Ratification Record §3.8)

Stack-Vault sales fail when AE skips scoping. The discipline is rigorous.

### §7.1 Scoping discovery (mandatory before pricing — minimum 60-min call)

1. **Hiring volume + role mix** — How many tech hires/year? Which role families? Which sub-skills are critical?
2. **Stack inventory** — What internal frameworks, languages, platforms, libraries? **Specifics, not categories** — "Java" is not enough; "Java 17 + Spring Boot 3.2 + Kafka + internal DSL X" is.
3. **Existing leak pain** — Have you found your interview questions on competitor blogs / Glassdoor / LeetCode-style scrapes? (Most GCCs say yes; this is the wedge.)
4. **Internal validation appetite** — Will your engineering managers review draft questions, or rely on QOrium SME signoff?
5. **Integration target** — Do you import into your ATS (Workday, Greenhouse, Darwinbox), an LMS (Cornerstone, SAP SuccessFactors), or run direct on QOrium's portal?
6. **Watermark + forensic appetite** — Do you want forensic attribution (Vault-Enterprise) or is multi-marker watermarking enough (Vault-Pro)?
7. **Renewal triggers** — What metric defines success? (Reduction in leak alerts, improved interviewer agreement, faster hire cycle, reduced false positives.)

### §7.2 Scoping output (mandatory artifact — submit to CEO before pricing)

| Section | Required content |
|---|---|
| Customer profile | Hiring volume + role mix + stack inventory |
| Library scope | Item count + sub-skill coverage + difficulty distribution |
| Validation pathway | SME signoff plan + IRT calibration sample size |
| Watermark spec | Marker count + forensic attribution Y/N |
| Integration spec | ATS/LMS target + API surface + bulk export Y/N |
| Pricing recommendation | Tier (Starter / Pro / Enterprise) + annual + multi-year option |
| Risk register | Leak risk, dependency risk, renewal risk |

> **Submission rule:** No Stack-Vault proposal goes out without this artifact reviewed by CEO. The artifact + proposal go in CRM as the deal moves Stage 4 → Stage 5.

### §7.3 Common scoping mistakes (the avoid list)

- **Quoting before scoping.** Quote-first kills credibility and re-anchors low.
- **Underweighting validation.** GCC Talent Heads care about IRT + I/O-psych signoff more than item count.
- **Mixing motions.** A Stack-Vault scope should never reference ReadyBank seat counts; they are different products.
- **Promising integration without CTO sign-off.** Workday/Darwinbox connectors are real engineering work; do not promise without CTO timeline.

---

## §8 — AI-Agent + Human-AE Hybrid (per SO-18)

Per Constitution SO-18: *"Sales-motion architecture is hybrid: AI assistant for Recruiter outreach scale; human AE for Enterprise/Platform high-touch. Pure-AI sales is forbidden for deals >₹10L ACV."*

### §8.1 Where the AI agent operates

| Activity | AI agent? | Human required? |
|---|---|---|
| Prospect research / ICP scoring | ✅ | review only |
| Outreach sequencing (LinkedIn DM, email, WhatsApp) | ✅ | review reply |
| Reply qualification (BANT-equivalent) | ✅ | review escalations |
| Discovery call (Motion A only, sub-₹10L) | ✅ co-pilot | human leads |
| Discovery call (Motion B / C) | review notes | human leads |
| Demo (any motion) | review prep | human leads |
| Proposal generation | ✅ draft | human signs off |
| MSA negotiation | ❌ | human + Legal |
| Customer success ongoing | ✅ alerts + check-ins | human owns relationship |
| QBR / renewal | ✅ data prep | human leads |

### §8.2 The hand-off rule

The AI agent **must hand off** to human AE when **any** of these triggers fire:

1. Prospect's ACV signal exceeds ₹10L (per SO-18).
2. Stack-Vault is mentioned (any deal — SO-18 + SO-11).
3. Procurement is layered (3+ stakeholders identified).
4. CISO / DPO is engaged.
5. Prospect explicitly asks "talk to a real person."
6. Negative sentiment detected in reply.
7. Competitor name surfaces (Glider AI, HackerRank, CodeSignal, etc. — see Constitution §2.7).
8. Pricing discount > 5% requested.

### §8.3 The AI-agent system-prompt (canonical — do not edit without CEO approval)

```
ROLE: QOrium AI sales assistant — Bali Office, Motion A (ReadyBank Staffing).
GOAL: Move qualified prospects from Stage 0 → Stage 2 (Replied/Qualified).
HARD RULES:
- USP verbatim (Constitution §1.1) — opening for every cold message.
- Talpro Customer Zero in every demo-ask message.
- Never quote pricing — defer to AE for any pricing question.
- Hand off to AE on any ₹10L+ ACV signal, Stack-Vault mention, CISO engagement,
  procurement layering, or competitor mention.
- No-Fiction Rule (SO-24) — never quote a stat without a live source citation.
- DPDPA posture: never request candidate-PII to qualify a prospect.
TOOLS: HubSpot CRM, LinkedIn Sales Navigator, WhatsApp Business API, Calendly.
```

The agent is operationally implemented as a service in QOrium engineering (`services/bali-agent` — Phase 1 build per the engineering log; not yet shipped Y0).

### §8.4 Why pure-AI sales is forbidden >₹10L (SO-18 reasoning)

- Enterprise + Platform deals require CISO comms and DPA negotiation — pure-AI cannot legally bind.
- Stack-Vault scoping (§7) requires judgement about stack distinctiveness — pure-AI generates surface-level scopes that misprice.
- Reference customer cultivation (SO-1) is relationship work — AI agent cannot carry the introduction.
- The reputational cost of an AI sending a wrong answer to a CISO at a F500 GCC is asymmetric to the cost of a slower human-led cycle.

---

## §9 — Customer Zero Pattern (referenced from Ratification Record §2.9 + Constitution SO-1)

### §9.1 What Customer Zero **is**

Talpro India dogfoods QOrium for internal hiring drives from Month 1. This is non-negotiable. **Every Bali activity references Customer Zero.** Specifically:

1. **Every cold opener** (any motion, any AE/BD, any AI-agent message) leads with: "QOrium is dogfooded by Talpro India for internal hiring — first 100+ candidates run through QOrium by Month 3."
2. **Every demo** opens with the Customer Zero usage data (live, real, current-week numbers).
3. **Every reference call requested** routes first to Talpro's Delivery Head.
4. **Every weekly Bali pipeline review** asks: "What did we learn from Talpro this week?"
5. **Every quarterly QBR template** has a Customer Zero data slide.

### §9.2 What Customer Zero **is not**

- Not a one-time launch story.
- Not a free trial — Talpro India pays Talpro-internal-rate for QOrium per the internal-namespace API key model (SO-1 + Punchlist D3).
- Not a "discount example" — Talpro is a real customer with a real rate card.

### §9.3 Customer Zero data products (Bali references these by name)

| Artifact | Source | Refresh cadence | Use in sales |
|---|---|---|---|
| Talpro candidate volume YTD | DB query | weekly | Cold opener |
| Talpro interviewer agreement rate | Talpro Sentinel | monthly | Demo |
| Talpro time-to-screen reduction | Talpro Delivery Head report | monthly | ROI proposal |
| Talpro NPS on QOrium internal | Survey | quarterly | Reference call talking points |

### §9.4 The Customer Zero handoff (Bali → Talpro Delivery Head)

When a prospect requests a Talpro reference call:

1. AE/BD checks CRM for prior-call frequency (cap: 1 reference call per Talpro Delivery Head per week).
2. AE/BD writes a 5-line brief: prospect name, motion, what they're considering, the 2 questions they're likely to ask, the 1 thing **not** to discuss (NDA scope / pricing).
3. CEO blesses the routing (Y1 — to be delegated to Sales Lead Y2).
4. AE/BD intros to Talpro Delivery Head with the brief.
5. Post-call, prospect feedback logged in CRM under the deal record.
6. AE/BD writes 2-line thank-you to Talpro Delivery Head — relationship maintenance.

---

## §10 — Activity Counts and KPIs by Motion

### §10.1 Daily activity targets (per AE/BD per motion)

| Activity | Motion A (ReadyBank Staffing) | Motion B (Stack-Vault Enterprise) | Motion C (Platform API) |
|---|---|---|---|
| New prospects added (Stage 0) | 20/day | 5/day | 8/day |
| Outreach messages sent (Stage 1) | 30/day | 8/day | 10/day |
| Discovery calls held (Stage 2 → 4) | 2/day | 1/2 days | 1/day |
| Demos held (Stage 4) | 1/day | 1/week | 1/2 days |
| Proposals sent (Stage 5) | 1/2 days | 1/2 weeks | 1/week |
| CRM hygiene updates | 100% same-day | 100% same-day | 100% same-day |

### §10.2 Weekly KPIs (reviewed Monday Bali huddle)

- Pipeline coverage by motion (target: 3× quarterly bookings target by motion).
- Stage-conversion velocity (vs. the table in §4).
- Stuck deals (>SLA in any stage).
- Win rate by motion (rolling 4-week).
- Lost-reason distribution (using the 8 standard objections in §6 as the disqualifying-reason taxonomy).
- Talpro reference calls held + outcome.

### §10.3 Monthly KPIs (reviewed CEO + CTO + Bali)

- ARR added (by motion + by SKU).
- New logos (count + name + motion).
- Pipeline-to-bookings conversion (forecast vs. actual).
- CAC by motion.
- Sales-cycle length by motion (vs. target in §2.1–§2.3).
- AI-agent → human-AE hand-off rate + reasons (per §8.2).
- Reference customer requests + outcomes.

### §10.4 Quarterly (CEO-owned)

- Competitive scan per SO-25 (refresh §2.7 classification table).
- Win/loss debrief at portfolio level — what objection handling needs sharpening.
- Pricing band re-validation — has the 20-competitor landscape shifted (per Doc 10 §4.2)?
- Phase-gate readiness review — are we on Phase Map per Constitution Article IX.

### §10.5 Phase Gate KPIs (Constitution Phase Map alignment)

| Phase | Bali deliverable | Source |
|---|---|---|
| Phase 0 (Day 0–14) | Customer Zero formalised; first-5-JD scope from Talpro; Bosch + Mercedes outreach lists drafted | Punchlist §D, §E |
| Phase 1 (M1–M3) | 5 customer logos signed; Talpro CZ operating; first 100 candidates run through QOrium | Constitution Phase 1 |
| Phase 2 (M3–M6) | 15 logos; Stack-Vault Logo #1 (Bosch GCC target); $300K ARR | Constitution Phase 2 |
| Phase 3 (M6–M9) | 30+ logos; first Tier-3 platform pilot; $500K ARR | Constitution Phase 3 |
| Phase 4 (M9–M12) | 50+ logos; $1M+ ARR; Series Pre-A initiated or bootstrap-mode | Constitution Phase 4 |
| Phase 5 (Y2) | $2M ARR; first international (US + UK) | Constitution Phase 5 |

---

## §11 — First-5-Logos Plan (Phase 1)

**Objective:** Sign 5 customer logos by M3.

### §11.1 Logo target list (Y1 priority)

| # | Target | Motion | ICP score | Stage | Owner | ETA |
|---|---|---|---|---|---|---|
| 1 | Talpro India | Motion A | 25/25 | Closed Won (Customer Zero) | CEO | Done — Day 0 |
| 2 | [Talpro 1-degree staffing peer #1] | Motion A | est. 22/25 | Stage 0 — Day 14 prospect | CEO | M2 |
| 3 | [Talpro 1-degree staffing peer #2] | Motion A | est. 21/25 | Stage 0 | CEO | M2 |
| 4 | Bosch GCC Bengaluru | Motion B | est. 28/30 | Stage 0–1 (CEO outreach) | CEO + AE Enterprise (M3) | M3 (proposal) |
| 5 | [Tier-3 platform pilot — TBD: Xobin / Testlify / Talview cluster] | Motion C | est. 19/25 | Stage 0 | BD Platforms (M3) | M3 (LOI) |

### §11.2 Anchor: Talpro 1-degree warm intros

The CEO maintains a list of 30–50 staffing-firm founders within 1-degree LinkedIn / WhatsApp reach. These are the Phase-1 Motion-A pipeline. Cadence:

- **Week 1:** CEO drafts personalised intro DMs (USP + Customer Zero + 90-day pilot offer).
- **Week 2:** Send 10 intros; track replies.
- **Week 3:** Run 5 discovery calls.
- **Week 4:** Land 2 demos.
- **Repeat through M2.**

### §11.3 Bosch GCC plan (Motion B Y1 marquee)

**Punchlist §E (E1–E4) is the source-of-truth for Bosch outreach. This playbook just reflects what Bali does once a meeting is on calendar.**

- **Discovery call** — 60-min conversation per §7.1.
- **Scoping artifact** — drafted by CEO + AE Enterprise → reviewed by CTO (technical feasibility) + CDO (validation pathway) before submission.
- **Proposal** — Vault-Pro tier (Tier-2 of Stack-Vault) anchored at ₹75L/yr; multi-year discount available.
- **CISO comms** — DPA template + SO-19 posture statement attached on request.
- **POC ask** — 90-day vault on one squad (likely Mobility Solutions or Industrial-IoT).

### §11.4 Tier-3 platform pilot plan (Motion C Y1 logo)

**Target shortlist (in priority order):** Xobin, Testlify, Talview cluster, [other Tier-3 candidates from Constitution §2.7].

- **First touch** — BD Platforms LinkedIn DM with API quickstart link.
- **Discovery + technical demo** — 60-min joint call with their Product + Eng leads.
- **Integration spike proposal** — 1-week pair-programming with their dev to demonstrate end-to-end question flow.
- **LOI** — non-binding letter of intent on pricing (API Pro tier, $12K/yr anchor) with 90-day pilot terms.

---

## §12 — Onboarding (post-signature → first value)

### §12.1 Motion A onboarding (target: first value within 7 days)

| Day | Step | Owner |
|---|---|---|
| 0 | Contract signed; welcome email (CEO-signed) sent same day | CEO |
| 1 | Slack-shared channel created; Talpro Delivery Head invited as reference | AE |
| 2 | Recruiter accounts provisioned; SSO if available | CTO |
| 3 | Onboarding call (60 min) — walkthrough of ReadyBank dashboard, JD-Forge, role-graph navigation | AE + CDO |
| 4–7 | Recruiter trains on first 5 JDs; AE on standby | AE |
| 7 | First-week metrics review — candidates screened, time-to-screen, false-positive rate | AE |

### §12.2 Motion B onboarding (target: first vault batch within 30 days)

| Day | Step | Owner |
|---|---|---|
| 0 | Contract signed; CEO welcome call | CEO |
| 1 | DPA executed; technical kickoff scheduled | AE Enterprise |
| 7 | Stack inventory finalised (per §7.1) → handed to CDO | AE + customer Talent Head |
| 14 | First 100 vault items drafted (AI-authored + AI self-critique) | CDO + SME team |
| 21 | SME signoff on first 100 items | CDO + customer engineering managers |
| 28 | First batch released to customer environment with watermarks | CTO |
| 30 | First-month QBR — usage health, leak alert config, expansion conversation | AE + CEO co-pilot |

### §12.3 Motion C onboarding (target: first API call within 14 days)

| Day | Step | Owner |
|---|---|---|
| 0 | Contract signed; integration spike scheduled | BD Platforms |
| 1–3 | API key issued (Pro tier defaults); sandbox env provisioned | CTO |
| 3–7 | Pair-programming spike — first end-to-end question import | BD + customer Eng |
| 7 | First 1,000 API calls hit; usage dashboard shared | BD + customer Product |
| 14 | First production traffic; first-month KPI baseline established | BD + customer Product Lead |

---

## §13 — Renewal & Expansion

### §13.1 Renewal motion (90-day window before contract end)

| Days before renewal | Step | Owner |
|---|---|---|
| 90 | Renewal pre-brief (usage data + value-realised review) | AE |
| 60 | QBR with customer decision unit — propose renewal terms | AE + CEO co-pilot for Stack-Vault |
| 45 | Renewal proposal sent (with reference customer rebate if earned per §3.6) | AE |
| 30 | Negotiation window (multi-year, expansion add-ons) | AE + CEO if Stack-Vault |
| 14 | Final terms; CEO countersign for any Stack-Vault | CEO |
| 0 | Renewal signed; expansion play activated | AE |

### §13.2 Expansion plays (by motion)

**Motion A → Motion A expansion:** add seats; up-tier (Starter → Pro → Pro+); add JD-Forge per-JD layer.
**Motion A → Motion B expansion:** if customer is staffing for marquee end-customer with stack distinctiveness, propose Stack-Vault for that end-customer (separate deal).
**Motion B → Motion B expansion:** add squads; Vault-Starter → Vault-Pro → Vault-Enterprise; multi-year.
**Motion B → Motion C cross-sell:** if customer's internal LMS / ATS team wants programmatic access, propose API tier (separate deal).
**Motion C → Motion C expansion:** higher API volume tier; new geography; revenue share.
**Motion C → Motion A bundle:** if platform's customers ask for staffing-firm tier directly, propose channel-distribution deal (CEO escalation per §1).

### §13.3 Health-score signals (red flags)

| Signal | Threshold | Action |
|---|---|---|
| API calls / question pulls | <50% of last 30-day baseline | AE personal call within 7 days |
| Login frequency (Motion A) | <3 sessions/week per active recruiter | AE check-in |
| Leak alert response rate (Motion B) | not engaging with alerts | CTO + AE joint call |
| Open support tickets >7 days | any | CDO escalation |
| Decision-unit contact change | new Talent Head / new CISO / new Product Lead | AE re-introduction within 14 days |

---

## §14 — Tooling Stack (per Constitution §2.7)

| Tool | Use | Owner |
|---|---|---|
| **HubSpot CRM** | Pipeline source-of-truth (no shadow spreadsheets) | Bali |
| **LinkedIn Sales Navigator** | Prospecting Motion A + B + C | AE/BD |
| **WhatsApp Business API** | Indian customer outreach (Motion A primary) | AE + AI agent |
| **Calendly** | Scheduling — every demo + discovery routes through Calendly | AE/BD |
| **Talpro Sentinel** | Cross-product alerts (Customer Zero data feed) | CTO + Bali consumer |
| **founder_request** | CEO escalations | AE/BD when triggered |
| **services/bali-agent** | AI-agent prospecting + reply qualification (engineering build, Phase 1) | CTO + Bali |

---

## §15 — Compliance + Governance

### §15.1 Standing Orders that gate every Bali activity

- **SO-1** Talpro Customer Zero — referenced in every cold opener and demo.
- **SO-9** Anti-leak rotation 24h Critical / 7d High — referenced in objection O6.
- **SO-10** Stack-Vault Exclusivity Absolute — never mix Stack-Vault → ReadyBank.
- **SO-11** Pricing Anchor Discipline — no Stack-Vault below ₹35L without CEO.
- **SO-18** AI-Agent + Human-AE Hybrid — pure-AI forbidden >₹10L ACV.
- **SO-19** DPDPA + GDPR Posture — referenced in objection O5.
- **SO-21** IRT Scoring Day-1 Mandatory — referenced in objection O3.
- **SO-22** AI Plagiarism Public Benchmark — referenced in objection O3.
- **SO-23** ReadyBank API $5K–$25K/yr Anchor — defended pricing band.
- **SO-24** No-Fiction Rule (Recursive) — every external claim source-cited.
- **SO-25** Quarterly Competitive Scan — Bali-owned; refreshes §2.7 classification.

### §15.2 Audit-trail requirements

Every deal record in CRM must contain:
1. ICP score (per §5).
2. Motion classification (A / B / C).
3. Discovery notes (with explicit BANT-equivalent capture).
4. Objection log (which of the 8 came up; how it was handled).
5. Reference call log (who from Talpro / which existing customer; outcome).
6. Pricing rationale (which tier; what discount; CEO approval if applicable).
7. Lost-reason classification (one of 8 standard reasons) if Stage L.
8. AI-agent → human-AE hand-off log (SO-18 enforcement).

### §15.3 No-Fiction discipline (SO-24 application)

Every external claim — library size, customer count, integration coverage, accuracy benchmarks, partnerships, pricing references, regulatory posture — **must** be backed by:

- A live MCP query (DB / Talpro / current session), OR
- A live web fetch (current session), OR
- A current-quarter audited document with explicit citation.

The only acceptable fiction is the three-sentence USP itself, which is **claim-of-positioning** (and is verbatim and locked).

### §15.4 Quarterly competitive scan (per SO-25)

Bali runs the scan at end-of-quarter using `competitive_research_log.md` as the canonical scratchpad. Output:
1. Refreshed §2.7 classification table.
2. List of acquisitions / market exits / pricing shifts in the quarter.
3. Trigger MANTHAN re-validation if any change is material (per SO-25 + §10.3 Constitution).

---

## §16 — Operating Cadence (per Constitution §2.7)

| Cadence | Activity | Participants | Output |
|---|---|---|---|
| **Daily** | Outreach activity per §10.1 | Each AE/BD individually | CRM activity log |
| **Mon weekly** | Pipeline review | CEO + CTO + AE + BD | Forecast + stuck-deal list |
| **Wed weekly** | Outreach blitz day | All Bali | Pipeline additions |
| **Fri weekly** | Win/loss debrief | All Bali | Sales-process improvement notes |
| **Monthly** | ARR + pipeline + CAC + win/loss analysis | CEO + CTO + Bali | Monthly business review pack |
| **Quarterly** | Competitive scan + pricing-band validation + phase-gate readiness | CEO + Bali (CTO advisor) | Refreshed §2.7 + pricing memo + phase-gate report |

---

## §17 — Open Items (Year 1)

These items are explicitly deferred to v2 of this playbook (M6+ refresh).

| # | Item | Defer reason |
|---|---|---|
| 1 | International (non-India) ICP definition | Phase 5 (Y2) per Constitution Phase Map |
| 2 | Tier-1 platform sales motion (HackerRank, Mercer, Mettl, etc.) | Phase 6 (Y2-Y3) per Constitution Phase Map |
| 3 | Channel / OEM / white-label distribution | Phase 6 (Y3) per Constitution Phase Map |
| 4 | Psychometric SKU sales motion | Phase 5 add-on per Constitution Phase 5 |
| 5 | M&A-track customer acquisition (acquihire, content-acquisition) | Phase 7 / Article IX — strategic outcome lever |

---

## §18 — Amendment Procedure

Per Constitution Article XI:
- **Minor** (pricing band tweak within +/-10%, new objection added to §6, new ICP dimension scored): Bali authority; CEO informed.
- **Material** (motion architecture change, new SKU, pricing anchor shift): CEO approval mandatory; ratification record entry.
- **Constitutional** (changes that affect SO-1, SO-10, SO-11, SO-18, SO-23): Article XI amendment procedure required.

This v1 supersedes any prior Bali document referenced in Constitution v1.0 / v2.0 / Blueprint v1.1 / SKU Architecture / Ratification Record. References to "Bali Sales Playbook" in those documents resolve to this file.

---

## Appendix A — Cross-references resolved

| Source doc | Reference | Resolves to (this playbook) |
|---|---|---|
| Constitution v2.0 Companion docs index | "Bali Sales Playbook" | This document |
| Constitution v2.0 §2.7 | "per Bali Sales Playbook §9" (AI agent component) | §8 |
| Ratification Record §2.9 | Customer Zero pattern | §9 |
| Ratification Record §3.7 | Objection handling | §6 |
| Ratification Record §3.8 | Stack-Vault scoping | §7 |
| Constitution v2.0 §17 | "customer-facing pricing change documented in Bali Sales Playbook" | §3 + §18 |
| Blueprint v1.1 §13 | Pre-execution decision #8 (Stack-Vault Enterprise pricing anchor ₹40L/year) | §3.4 (₹35L floor per SO-11) |
| SKU Architecture | three SKU pricing detail | §3.1 / §3.2 / §3.3 / §3.4 |

---

## Appendix B — Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-05-07 | CTO Office | Initial ratified playbook; consolidates 7+ Constitution / Blueprint / SKU Arch / Ratification Record references that pointed to "Bali Sales Playbook" but had no source document. Aligns with Constitution v2.0 §2.7 charter, SO-1, SO-9, SO-10, SO-11, SO-18, SO-19, SO-21, SO-22, SO-23, SO-24, SO-25. |
