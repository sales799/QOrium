# India-Stack Content Roadmap: M3–M6 (Wave 2)

**For:** CTO Office, CDO, Bali (Sales)  
**Authority:** Constitution Article IX (Phase Gates), M6 Phase Gate explicit: "India-stack content priority"  
**Owner:** CDO / Content Lead (once hired Y1)  
**Status:** v1 Roadmap (pending I/O Psych contractor + SME sourcing; content authoring M3 kickoff)  
**Effective:** May 2026  

**Header:** Per Constitution Article IX M6 Phase Gate success criterion: **200+ SAP ABAP, 150+ Oracle HCM, 100+ Salesforce (additional), 100+ Finacle/Flexcube, 50+ embedded automotive (additional).** Total Wave 2 target: **600+ released items by M6 cutover.**

---

## §1 Why India-Stack Matters: Strategic Defensibility

### 1.1 Market Reality

**E2 research finding** (from `10-Competitive-Capabilities-Consolidated-Final.md`): Bosch GCC (Global Competency Centers) + India-anchored enterprise customer base dominates QOrium's SAM.

**Bosch GCC hiring profile:**
- SAP ABAP engineers: 400+ FTEs across Bengaluru, Pune, Hyderabad sites.
- Oracle HCM admins: 150+ FTEs managing APAC payroll + HR transformations.
- Embedded automotive engineers: 600+ FTEs on AUTOSAR, ISO 26262, V2X, ADAS.
- Salesforce developers: 200+ FTEs on CPQ, Service Cloud, Marketing Cloud.

**India enterprise ecosystem:**
- ICICI Bank, HDFC Bank, Axis Bank: Oracle HCM + Finacle backend stack.
- TCS, Infosys, Cognizant, Wipro GCCs: SAP ABAP + embedded automotive.
- Flipkart, Myntra, Amazon India: Salesforce CPQ + custom integrations.

### 1.2 Competitive Vacuum

**HackerRank:** Deep global coverage (AWS, Azure, JavaScript, Python). Shallow on SAP ABAP, Oracle HCM, Finacle.

**Mettl:** India-focused but coverage is breadth-first (all skills, no depth). SAP ABAP content is generic; not certified against real SAP S/4HANA releases.

**Codility:** Competitive programming focus; zero enterprise stack coverage.

**Adaface:** General technical + data science; no India-stack specialization.

**WeCP (now Invisible):** Exited technical assessment (acquired by Invisible for AI training). No longer a competitive threat.

### 1.3 QOrium's Defensible Moat

**Why others won't build this:**
- SAP ABAP content requires certified SAP developers (scarce, expensive).
- Oracle HCM India payroll is complex statutory compliance (PF, ESI, Gratuity, TDS, Form 16, NREGA contributions); changes annually; high legal risk.
- Finacle is a closed banking platform (proprietary source code); content requires vendor partnerships or reverse-engineering.
- Embedded automotive (AUTOSAR, ISO 26262 FMEA, CAN bus diagnostics) is niche; content doesn't sell to general tech hiring.

**TAM perceived as "too India-specific":** Competitors see India-stack as niche; won't invest R&D. QOrium builds first, locks customers for 3–5 years.

**Result:** India-stack becomes QOrium's defensible moat for Y1–Y3.

---

## §2 Wave 2 Content Targets: 700+ Questions, 5 Sub-Domains

### 2.1 SAP ABAP (200 questions)

**Coverage domains:**
- ABAP Object-Oriented (100 Qs): classes, inheritance, polymorphism, interfaces, exception handling.
- Reports & ALV (40 Qs): ALV (ABAP List Viewer) grid creation, event handling, interactive reports.
- BAPIs & Function Modules (30 Qs): RFC calls, parameter mapping, error handling.
- IDocs & EDI (20 Qs): Inbound/outbound processing, control records, segments.
- Smart Forms & Print Programs (10 Qs): layout design, table processing, conditional printing.

**Version anchor:** SAP S/4HANA 2023 baseline. Light coverage of ABAP on HANA (CDS views, analytical expressions): 30% of target (60 Qs focused on CDS syntax, virtual data models, transports).

**Why 200?** Bosch GCC ABAP hiring: ~400 FTEs. Typical assessment batches: 20–50 candidates per quarter. Competitive differentiation = unique, variant-rotated ABAP questions. 200 questions provides 2–3 question packs of 50 unique questions each; sufficient for exclusive assessment.

### 2.2 Oracle HCM (150 questions)

**Coverage domains:**
- Core HR Modules (40 Qs): organization structures, job definitions, positions, assignments, benefits eligibility.
- Payroll India (50 Qs): earnings + deductions, statutory configurations (PF %, ESI %, TDS), Gratuity accrual, NREGA, statutory close procedures, Form 16 generation, compliance rules.
- Talent & Recruitment (30 Qs): job searches, requisitions, recruiting workflows, offer approval, onboarding.
- Fast Formulas & Calculations (20 Qs): syntax, context variables, payroll-specific formulas, tax calculations.
- HDL/HSDL Loaders (10 Qs): bulk data import, header/detail structures, error handling.

**Version anchor:** Oracle Cloud HCM 24A (latest SAAS version as of May 2026).

**Statutory accuracy critical:** Oracle HCM India Payroll rules change annually (Union Budget FY27, state-level changes). Hire specialist contractor for compliance review before release. Flag questions with "effective_from_fy" metadata (e.g., FY27, FY28) to track legal currency.

**Why 150?** ICICI + HDFC + Axis Bank + TCS + Infosys: ~800 Oracle HCM FTEs collectively. Assessment need = 2–3 packs per year per customer = 120–180 unique questions minimum for 3-year exclusivity. 150 provides buffer + reserve for retired items.

### 2.3 Salesforce (100 questions, additional)

**Context:** Phase 1 baseline includes ~50 Salesforce questions (Service Cloud, core sales). Wave 2 adds 100 more (advanced sub-skills).

**New coverage:**
- Service Cloud Voice (15 Qs): CTI integrations, call recording, voice workflows.
- Marketing Cloud (25 Qs): Journey Builder, email studio, audience segmentation, lead scoring.
- CPQ (Configure-Price-Quote) (35 Qs): quote templates, price rules, discounting logic, subscription management.
- B2B Commerce (15 Qs): storefront setup, catalog management, self-service configuration.
- OmniStudio (10 Qs): OmniScript, Calculation Matrix, Integration Procedures.

**Version anchor:** Salesforce Spring '26 release baseline.

**Why 100 additional?** Flipkart, Myntra hiring: ~200 Salesforce FTEs. Competitive 100 question library enables multi-year customer lock-in.

### 2.4 Finacle/Flexcube (100 questions)

**Context:** Proprietary banking platforms; no open-source competitors; deep specialization = customer lock-in.

**Finacle coverage (50 Qs):**
- Core banking configuration (20 Qs): customer account structures, product definitions, pricing rules, account linking.
- BPEL workflows (15 Qs): workflow design, branching, compensation, error handling.
- Finacle scripting (10 Qs): custom processing logic, event triggers.
- Regulatory reporting (5 Qs): Basel III compliance reporting, KYC workflows.

**Flexcube coverage (50 Qs):**
- Database structures (15 Qs): table schemas, primary keys, FX rate management.
- UBS architecture (20 Qs): Flexcube Universal Banking System design, module dependencies.
- Configuration frameworks (10 Qs): parameter tables, static data, reference data management.
- Disaster recovery & backups (5 Qs): failover procedures, recovery time objectives (RTO).

**Version anchor:** Finacle 11+, Flexcube UBS 14.x baseline.

**Licensing/IP risk:** Finacle is proprietary to EdgeVerve (Infosys subsidiary); Flexcube is UBS IP. Content authorship requires reverse-engineering or vendor partnership. Legal review critical before release (handle via IP counsel; flag in risk section).

**Why 100?** ICICI + HDFC + Axis + SBI: ~600 banking IT FTEs combined. Finacle/Flexcube specialization is hiring bottleneck; very few candidates have deep knowledge. 100 questions establishes QOrium as credible assessor for banking tech talent.

### 2.5 Embedded Automotive (50 questions, additional)

**Context:** Phase 1 baseline includes ~50 embedded automotive questions (AUTOSAR Classic, CAN, basic safety). Wave 2 adds 50 for deepening.

**New coverage:**
- AUTOSAR Adaptive Platform (20 Qs): Adaptive AUTOSAR v1.5+, middleware, communication, services, time synchronization.
- Functional Safety (ISO 26262:2018) (15 Qs): ASIL classification, FMEA, hardware safety concepts, hazard analysis.
- Cybersecurity (ISO 21434) (10 Qs): threat modeling, secure onboarding, update strategies, OTA deployment security.
- V2X (Vehicle-to-Everything) (5 Qs): communication protocols, latency budgets, safety of the intended functionality (SOTIF).

**Version anchor:** AUTOSAR Classic 4.5, Adaptive R20-11 (Q3 2026 release), ISO 26262:2018, ISO 21434:2021.

**Why 50 additional?** Bosch automotive GCC: 600 embedded engineers. Autonomous vehicle + connected car hiring surge (Tesla, Ather, Mahindra EV teams). Adaptive AUTOSAR is emerging skillset (Y2+); early QOrium coverage = competitive advantage vs. HackerRank (who have zero Adaptive coverage as of May 2026).

---

## §3 Authoring Strategy: SME Contractor Model

### 3.1 SME Sourcing Channels

**Channel 1: LinkedIn direct recruitment**
- Boolean search: `(ABAP OR "SAP ERP") AND (Infosys OR TCS OR Cognizant) AND India`
- Outreach: "Help us build the gold-standard SAP question bank; ₹3.5K–₹5.5K per accepted Q."
- Target: 100 SMEs across 5 sub-domains by M4.

**Channel 2: Alumni networks**
- IIT / BITS alumni groups in Bangalore, Pune, Hyderabad.
- Post to alumni job board: "Contract SME writing: Oracle HCM Payroll India expertise."
- Expected response rate: 20–30 per post per month.

**Channel 3: Vendor partnerships**
- SAP Mentor community (online; approachable for ABAP).
- EdgeVerve Finacle developer forums (pitch directly).
- Oracle HCMM community (Oracle HCM mentors).

**Channel 4: TopCoder / CodeSignal talent networks**
- Hired talent: offer referral bonus for 3–5 high-quality question submissions.
- Existing contractor base: graduate top performers to SME tier.

### 3.2 SME Vetting Per C6 Protocol

**Existing C6 (Contractor Governance) protocol:**
- Portfolio review: 2–3 sample questions or technical write-ups.
- Reference check: prior contractor/client testimonial.
- Technical assessment: take a 30-min domain test (e.g., solve 5 Finacle questions; score ≥80% to qualify).
- Background check: standard Talpro India background verification.

**India-stack specific:** Add certification check. SAP ABAP contractors should have SAP certification (C_ABAP_2208 or equivalent). Oracle HCM: Oracle University certification (1Z0-956 or similar). Finacle: EdgeVerve training certificate (if available).

**Minimum vetting bar:** C6 protocol + domain certification OR 10+ years production experience in stated domain.

### 3.3 Compensation & Incentive

**Base rate:** ₹3,500–₹5,500 per accepted question (₹1,000 higher than Wave 1 avg ₹2,500–₹4,500 due to scarcity).

**Acceptance criteria (tighter than Wave 1):**
- Technical correctness: 100% (no approximations in SAP ABAP syntax or Oracle Payroll rules).
- Question clarity: ≥4.5/5 (SME Lead + I/O Psych review).
- Bias audit: passes 20-item checklist.
- IRT calibration-ready: has feasible answer, measurable difficulty, discrimination >0.5 target.

**Accept rate projection:** Wave 1 accept rate ≈50%; Wave 2 India-stack ≈40% (tighter bar, lower SME pool, higher rejection).

**Bonuses:**
- Certification completion bonus: ₹5K if SME obtains/renews Oracle HCM cert during contract.
- High-performer bonus: if ≥70% accept rate across 20 questions, +₹2K per extra question.

---

## §4 Quality Bar Per Sub-Domain

### 4.1 SAP ABAP Quality Bar

**Technical baseline:** SAP S/4HANA 2023 official documentation.

**Code correctness:** All code snippets must compile + execute without error in ABAP workbench (local simulator or IDE). No approximations.

**CDS views:** 30% of ABAP questions include CDS (Core Data Services) syntax; questions must run against HANA-specific CDS dialect (not old ABAP dictionary).

**Example question (acceptable):**
> Write an ABAP OO class that implements a Factory pattern to create different report types. The class must: (1) define an interface `IF_REPORT_FACTORY`, (2) implement create methods for SALV_GUI_TABLE report, (3) include error handling for invalid report types. Show the full class definition.

### 4.2 Oracle HCM Quality Bar

**Baseline:** Oracle Cloud HCM 24A official docs + Oracle University training materials.

**India Payroll statutory accuracy:** Every payroll question must cite the applicable fiscal year (FY27, FY28, etc.). If statutory rules change (Union Budget), question is revisioned or retired with audit log.

**Specific rules to embed:**
- PF contribution: 12% employee, 12% employer (ceiling: ₹15K/month for employee).
- ESI contribution: 0.75% employee, 3.25% employer (threshold: ₹21K/month wage).
- Gratuity: 15 days / month of service (formula must account for amendments over time).
- TDS: slab-based; question must cite FY27 slab (as of May 2026).

**Example question (acceptable):**
> An employee earns ₹50K/month in July 2026 (FY27). Calculate: (1) PF contribution (employee + employer), (2) ESI (if applicable), (3) Gratuity accrual for 5 years of service. Assume standard India rules as of FY27. Show calculations.

### 4.3 Salesforce Quality Bar

**Baseline:** Salesforce Spring '26 release notes + official setup guides.

**API version:** All Apex code must target API v60.0 or later.

**Example question (acceptable):**
> Using Salesforce CPQ, configure a price rule that: (1) applies 10% discount if customer lifetime value > ₹1M, (2) applies an additional 5% "volume bonus" if order quantity > 1000 units, (3) logs a warning if discount exceeds 20%. Write the price rule definition + test case.

### 4.4 Finacle/Flexcube Quality Bar

**Baseline:** Finacle 11 release documentation (vendor-controlled; may require NDA).

**Flexibility:** Questions may be conceptual (architecture, configuration logic) rather than code, since Finacle is closed-source.

**Example question (acceptable):**
> In Finacle, describe the flow for processing an inbound SWIFT message for a customer's foreign exchange transaction. Include: (1) message validation steps, (2) FX rate lookup, (3) debit/credit entry creation, (4) reconciliation with nostro account. What BPEL workflow would orchestrate this?

### 4.5 Embedded Automotive Quality Bar

**Baseline:** AUTOSAR v4.5 specification, ISO 26262:2018, ISO 21434:2021.

**Functional Safety rigor:** Every safety-related question must reference ASIL level (A, B, C, D).

**Example question (acceptable):**
> Design an AUTOSAR Adaptive SoftwareService for a vehicle's lane-keeping system. The service must: (1) receive camera input (ASIL D), (2) compute steering correction, (3) output to the steering actuator with <100ms latency, (4) include watchdog supervision. Sketch the SoftwareService interface (ARXML format), event flow, and deadline spec.

---

## §5 IRT Calibration: Reference Panel Expansion

**Wave 2 Reference Panel target (M4–M6):** 30 specialist candidates per sub-domain minimum.

**Recruitment:**
- SAP ABAP: hire 30 from TopCoder SAP challenge participants + LinkedIn.
- Oracle HCM: hire 30 from Oracle University + customer IT teams (with permission).
- Salesforce: hire 30 from Trailblazer community (Salesforce's credential program).
- Finacle: hire 20–25 (scarce; approach EdgeVerve developer network + banks).
- Embedded automotive: hire 20–25 from AUTOSAR forums + embedded bootcamp alumni.

**Compensation:** ₹50–200 per question attempted (same as Wave 1).

**Expected calibration N:** 30 panel members × 40 questions per member = 1,200 responses per sub-domain = sufficient for stable IRT parameters (N≥30 per item).

---

## §6 Anti-Leak Vigilance for India-Stack

**Insight:** India-stack content has fewer existing "leaked" sources online (compared to generic LeetCode/HackerRank problems).

**Leaked-source risk distribution:**
- SAP ABAP: SAP community forums, SAP certifications study guides (moderate leak risk).
- Oracle HCM Payroll: ORACLE payroll modules have less public documentation (lower leak risk).
- Finacle: Closed banking platform; minimal public leaks (very low risk).
- Salesforce: Trailhead, Salesforce developer forums, GitHub (moderate-high leak risk).
- Embedded automotive: AUTOSAR specifications + research papers (low leak risk).

**Mitigation:** Anti-leak crawler (SO-9) will scan Finacle-specific forums + banking GitHub repos + Oracle certification dumps (e.g., DumpsArena). Add region-specific queries (e.g., "ICICI Finacle interview questions") to Serper API.

---

## §7 Cost Envelope: M3–M6 Wave 2

### 7.1 SME Contractor Compensation

**Formula:** 700 questions × ₹4,500 average accept rate = ₹31.5 lakh (~$37K USD).

**Breakdown by sub-domain:**
- SAP ABAP (200 Qs × ₹4,200): ₹8.4L (lower rate; large pool).
- Oracle HCM (150 Qs × ₹5,000): ₹7.5L (higher rate; statutory complexity).
- Salesforce (100 Qs × ₹4,500): ₹4.5L.
- Finacle (100 Qs × ₹5,500): ₹5.5L (scarcity premium).
- Embedded automotive (50 Qs × ₹5,000): ₹2.5L (niche skill).

**Total:** ₹28.4L (accounting for overhead, recruitment, contractor management by Content Lead + C6 contractor).

### 7.2 AI-Augmented Authoring Calls

**Cost:** GPT-4 API or Claude API for domain-specific priming prompts.

**Volume:** 700 questions × 2 API calls average (draft + critique) = 1,400 calls × ~$0.01–0.02 per call = ₹1K–2K per question = ₹7L–14L total.

**Estimate:** ₹5L (conservative; assumes internal Anthropic partnership discount available).

### 7.3 Reference Panel Expansion

**Compensation:** 150 panel members × 40 questions × ₹100–150 average per Q = ₹6M–9M.

**Admin overhead:** CDO + Content Lead coordination, onboarding, compliance = ₹1L.

**Total:** ₹10L.

### 7.4 Grand Total M3–M6 Wave 2

```
SME contractor compensation:      ₹28.4L
AI API + augmentation:            ₹5L
Reference Panel expansion:        ₹10L
─────────────────────────────────────
TOTAL:                            ₹43.4L (~$52K USD)
```

**Budget assumption:** Phase 1 budget allocates ₹50–60L for content creation (all Waves). Wave 2 ₹43.4L is **significant but feasible** if Wave 1 SME costs come in under budget (target: ₹40L).

**Phase 2 envelope reset:** Y2 budget assumptions will account for additional India-stack continuation (Wave 3: M6+).

---

## §8 Sequence: M3 → M6 Deliverables

### M3: SAP ABAP + Oracle HCM Kickoff

**By M3 end:**
- Recruit 40 SAP ABAP + 30 Oracle HCM SMEs.
- SME training: QOrium quality bar, bias checklist, IRT calibration approach.
- First 50 SAP ABAP questions authored + in SME review.
- First 40 Oracle HCM questions authored + in SME review.
- Reference Panel expansion begins (15–20 new recruits per domain).

**Delivery:** 0 released questions yet; heavy front-end work (sourcing, training, initial drafts).

### M4: Salesforce Expansion + Finacle/Flexcube Kickoff

**By M4 end:**
- 50 SAP ABAP questions passed SME review + in IRT calibration.
- 40 Oracle HCM questions passed SME review + in IRT calibration.
- Recruit 35 Salesforce + 25 Finacle SMEs.
- First 30 Salesforce (additional) questions authored.
- First 30 Finacle questions authored (5 in QA; 25 in draft).

**Delivery:** 90 questions in calibration pipeline; 0 released (still collecting N responses).

### M5: Cross-Wave QA + Embedded Automotive

**By M5 end:**
- 80 SAP ABAP released (IRT calibration ≥60%; DIF audit pass).
- 65 Oracle HCM released (statutory audit pass + compliance certification).
- 50 Salesforce (additional) in calibration.
- 40 Finacle in calibration.
- Recruit 20 embedded automotive SMEs (top performers from Wave 1 + new contractors).
- First 35 embedded automotive questions authored.

**Delivery:** 145 questions released; 185 in calibration; 35 in draft.

### M6: Wave 2 Closeout + Stack-Vault Flagship Pack Readiness

**By M6 end (Phase Gate success criterion):**
- **200 SAP ABAP released.** IRT coverage ≥80% (N≥30 per item). DIF audit complete. Variant-rotated pack ready.
- **150 Oracle HCM released.** Statutory compliance audit (FY27 rules) complete. Payroll specialist sign-off. Variant-rotated pack ready.
- **100 Salesforce (additional) released.** Spring '26 version verified. Multi-module coverage confirmed.
- **100 Finacle/Flexcube released.** Finacle 11 + Flexcube 14.x coverage balanced. Vendor relationship clarity (IP licensing). Variant-rotated pack ready.
- **50 embedded automotive (additional) released.** AUTOSAR Adaptive + ISO 21434 coverage. Bosch-compatible question bank confirmed.
- **Total: 600 released items across 5 sub-domains.**

**India-Stack Flagship Pack:** Combine all 600 into a "QOrium India-Stack Library" white-label offering. Ready for Bosch GCC, ICICI/HDFC, Wipro/TCS GCC customer outreach.

---

## §9 Phase Gate M6 Success Criteria

**Numeric targets:**
- ✓ 200+ SAP ABAP released, IRT ≥80% coverage, DIF pass, bias audit pass.
- ✓ 150+ Oracle HCM released, statutory FY27 audit pass, bias audit pass.
- ✓ 100+ Salesforce released, Spring '26 verified, bias audit pass.
- ✓ 100+ Finacle/Flexcube released, vendor clarity confirmed, bias audit pass.
- ✓ 50+ embedded automotive released, AUTOSAR Adaptive coverage ≥20%, bias audit pass.
- ✓ 600+ total released across 5 domains.
- ✓ IRT calibration: ≥60% of items have N≥30 responses + stable parameters.
- ✓ Bias audit: 0 items in bias_review status; 100% content checklist pass.

**Quality bar:**
- ✓ Acceptance rate ≥35% (QOrium maintains quality threshold despite scarcity).
- ✓ Reference Panel: 150 diverse panelists across domains; demographic diversity targets met.

**Customer signal:**
- ✓ First "Stack-Vault Logo" customer signed for India-stack pack (Bosch GCC, ICICI, Flipkart, or Tata Consultancy Services equivalent).
- ✓ Bosch GCC initial assessment run: ≥50 candidates assessed using Wave 1+2 India-stack questions; feedback integrated.

**Competitive position:**
- ✓ QOrium India-stack recognized as distinct from Wave 1; Bali (Sales) has credible asset to pitch to India enterprise.

---

## §10 Risk Register & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Statutory rule changes (India Payroll)** | Medium (annual budget) | High (content invalidation) | Hire Oracle HCM payroll specialist contractor (FY27 tax cert required). Schedule quarterly audit. Mark Q with effective_from_fy. Plan Wave 3 for FY28 refresh. |
| **SAP ABAP SME scarcity** | Medium (niche domain) | Medium (content quality risk) | Start recruitment at M1; offer ₹500 referral bonus per successful hire. Engage SAP Mentor community + TopCoder SAP challenge participants early. |
| **Finacle IP licensing ambiguity** | Medium (proprietary platform) | High (legal risk) | Engage IP counsel at M2 to clarify EdgeVerve / Infosys licensing. Negotiate content partnership or NDA. May require revenue-share with EdgeVerve. Plan accordingly. |
| **Embedded automotive AUTOSAR adoption slow** | Low (market pulling forward) | Medium (lower take-rate) | Pair with Bosch GCC outreach at M5. Plan AUTOSAR Adaptive deep-dive case study. Market adoption accelerating (EVs, autonomous); risk diminishing. |
| **Reference Panel recruitment lag** | Medium (tight timeline) | Medium (IRT calibration delay) | Start recruitment at M2 (2 months early). Budget ₹15L for rapid onboarding. Use Wave 1 top performers as "mentors" to recruit friends/colleagues. |
| **Content accept rate <35%** | Low (Wave 1 baseline ≈50%) | Medium (cost overrun) | Increase SME compensation 15% if accept rate drops below 40%. Invest in SME training upfront (M2–M3) to improve quality. |

---

## §11 Phase Gate Recommendation & Success Signal

**To Bali + CEO:** India-Stack (Wave 2) is a **GO decision** for M3 kickoff based on:
1. Defensible competitive moat (no other assessment vendor has depth in SAP ABAP, Oracle HCM payroll India, Finacle).
2. Clear customer demand signal (Bosch GCC hiring + India enterprise banking stack).
3. Cost envelope ₹43.4L is achievable within Phase 1 budget.
4. M6 Phase Gate provides clear go/no-go decision point (600 released items = success; <500 = signal downstream scaling risk).

**Sales play (M3–M6):** Position India-Stack as QOrium's "secret ingredient" for India enterprise hiring. Parallel outreach to Bosch GCC + ICICI + TCS GCC starting M4 with early preview access (readiness message: "QOrium is building the first India-stack assessment library; exclusive early access for [customer]").

---

**Version:** v1  
**Effective:** May 2026  
**Phase Gate M6:** Success criterion = 600+ released items + IRT ≥60% coverage + first Stack-Vault Logo signed.
