# QOrium — Competitor Research (Rolling Log)

> **Single rolling research log.** All future competitor analyses append to this doc as new top-level `## Competitor: <Name>` sections. Per CEO preference (`feedback_consolidate_research_files`), do NOT spawn new files per competitor. Companion XLSX: `competitor-matrix.xlsx`.

**Maintained by:** CTO Office (under blanket CEO grant; SO-25 Quarterly Competitive Scan)
**First entry:** 2026-05-03 (Run #17)
**Constitution alignment:** v2.0 §10.3 Competitive Watch
**Scope guard (CEO directive, this run):** *We are NOT building an assessment platform. We are a Question-Bank-as-a-Service / question-generation venture.*

---

## Index

| # | Competitor | Domain | Profile date | Threat tier | Status |
|---|---|---|---|---|---|
| 1 | **Artifactum** | artifactum.in / artifactum.ai | 2026-05-03 | **HIGH — direct head-to-head** | Active monitoring |

---

# Competitor #1: Artifactum

**Profile date:** 2026-05-03
**Sources:** Sales deck (`artifactum_deck.pptx`, 9 slides) + product walkthrough video (5:30, transcribed via faster-whisper)
**Stage signal:** Visible sales motion, polished SaaS UI, "5-min live demo" CTA — likely seed/early-revenue stage
**Geography signal:** `.in` domain + India NOS / NSDC vocational framing → India-anchored, expanding globally
**Threat tier:** **HIGH — most direct competitor surfaced to date.** Same wedge (question generation, NOT assessment platform), explicit same self-positioning ("We're primarily a question creation tool" — verbatim from video timestamp 03:26).

---

## 1. What Artifactum says it does

### 1.1 Verbatim positioning (from deck)

- **Tagline:** "The fastest way to build high-stakes assessments."
- **One-liner:** "Artifactum transforms job standards and training material into high quality defensible question banks in minutes."
- **Five-part standard:** Valid · Reliable · Contextual · Fresh · Defensible
- **Production claim:** "What takes a team of SMEs 3–4 weeks takes Artifactum about 120 seconds."
- **Sales CTA:** "Bring us a real syllabus, job description, or competency framework. We will show you — live — exactly what Artifactum generates from it."

### 1.2 Three explicit service lines

| # | Service | What it is |
|---|---|---|
| 01 | **New assessment generation** | Upload JD/syllabus/competency framework → returns ready-to-deploy paper with NOS codes, performance criteria, difficulty levels pre-assigned |
| 02 | **Question bank modernisation** | Rebuild legacy banks with traceability + competency alignment |
| 03 | **Cross-lingual adaptation** | "Not translation. Assessment transposition." Regional languages preserving psychometric calibration |

### 1.3 Three assessment surfaces (from video walkthrough)

Vocational · Hiring · Learning — broader than QOrium's current hiring-first focus.

### 1.4 Workflow (observed in video)

1. Pick assessment type (vocational / hiring / learning)
2. Pick question format (MCQ / subjective / coding)
3. Paste JD + optional company context (e.g., "QuestCorp")
4. AI parses → builds **role profile** (e.g., "senior, 7-10 yrs, retail e-commerce performance engineering")
5. UI shows topics list (auto-extracted) — user can add/remove (e.g., add "scripting" → marked as code-snippet question)
6. UI shows question type per topic (conceptual MCQ, SJT, code-snippet, scenario)
7. UI shows difficulty levels (Bloom's taxonomy)
8. Generate N questions (default 14 in demo)
9. Output: question bank with multi-select, code-snippet, scenario, SJT examples
10. Save to question bank → integrate into "any platform"
11. Translation feature available

### 1.5 Stated buyer personas (deck slide 6)

Hiring teams · L&D · **Vocational assessment providers** · Internal mobility & succession · **Higher education** · **Assessment bodies**

### 1.6 Stated competitive frame (vs "Generic AI" — deck slide 5)

| Feature | Generic AI | Artifactum |
|---|---|---|
| Technical accuracy | Hallucinates | Grounded in your source docs |
| Standards mapping | Cannot map to PCs | Fully automated & traceable |
| Consistency | Varies by prompt | Psychometrically structured |
| Audit trail | None | Full forensic lineage |
| Data handling | May train on inputs | Your data never leaves your env |
| Evidence grounding | Not required | Every question linked to source |

### 1.7 Stated security posture (deck slide 8)

No model training on customer data · Siloed environments per customer · Full audit trail (timestamp + user + source ref)

---

## 2. What Artifactum does NOT show / mention (gap inventory)

This is where QOrium has structural advantage to exploit. None of the below appears in deck or video.

| Capability | Artifactum status | QOrium status | Why it matters |
|---|---|---|---|
| **IRT (Item Response Theory) calibration** | Bloom's only — no statistical IRT | **MANDATED** (SO-21, Constitution v2.0) | Bloom's = teacher-set difficulty; IRT = data-driven difficulty proven against real candidate panel. Enterprise psychometricians (the buyers Artifactum targets — assessment bodies, higher ed) test for this. |
| **Anti-Leak Engine + 24-hour rotation** | Claims "fresh" but no mechanism shown | **Operational** (SO-22, AntiLeak v0 designed) | Question half-life is 6–9 months in market. "Fresh at generation" decays without rotation. |
| **Public AI plagiarism benchmark (≥93%)** | Not mentioned | **Mandated public benchmark** (SO-22 v2.0) | Defensible buyer-trust artifact; Artifactum claims "fresh" but has no falsifiable proof. |
| **Watermarking + forensic leak attribution** | Not mentioned | **Stack-Vault default** (per-client cryptographic markers) | Critical for GCC/IT-services buyers worried about candidate prep blogs. |
| **ReadyBank-style commodity tier** | No shared library tier | SKU 1 — multi-tenant library | Captures price-sensitive recruiter / mid-market segment Artifactum's per-engagement pricing won't reach. |
| **API-first delivery (REST + bulk)** | UI-led; vague "integrate into your system" | **4 modes:** REST API, Bulk Export, Embedded Widget, White-Label | Platforms (HackerRank/Mettl tier) buy via API only. Artifactum loses Tier-1 platform deals here. |
| **Customer-exclusive Stack-Vault tier** | "Siloed environment" mentioned but no contractual exclusivity model | SKU 3 — per-customer library + watermarking + contractual exclusivity | Wins enterprise/GCC large-deal segment. |
| **Customer Zero / dogfooding** | Not visible | **Talpro India = Customer Zero from Day 1** | Proof-point asymmetry — every demo can show real production usage, not vendor scenarios. |
| **Role-graph network effect** | Not mentioned | Constitutional moat (CDO §2.5) | Compounds with library size + JD volume. |
| **Reference Panel for calibration** | Not mentioned | Article IX M9 + Constitutional Amendment v2.1 | Required for IRT validity. |
| **Programming-language coverage breadth** | Generic "coding" — no language list | Wave 1: Java/React/SQL/DevOps/Salesforce/Python/AWS/AIPE; Wave 2: SAP ABAP/Oracle HCM/CPQ/Finacle/Embedded | India-stack depth differentiates for GCC pitch. |
| **Pricing transparency** | None published | 3 SKUs × tiered bands published in Doc 5 | Reduces sales friction; signals confidence. |
| **Quality Gate (formal, scored)** | Generic "psychometric" claim | **92-pt Gatekeeper Quality Gate** with auto-fail criteria | Falsifiable quality claim wins procurement. |
| **Enterprise SSO / SAML** | Not mentioned | SSO-SAML-Enterprise-Spec-v0 in `/infra/` | GCC procurement gate. |
| **Audit Log API** | Generic audit-trail claim | Audit-Log-API-Spec-v0 in `/infra/` | Customer can pull logs, not just see them in vendor UI. |
| **Anti-leak SLA tiers** | None | SLA per ReadyBank tier (monthly/weekly/continuous scan) | Enterprise contract anchor. |
| **I/O Psychologist sign-off pathway** | Generic "psychometrically structured" | Article IX M9 mandates I/O Psych validation pre-customer-release | Defensible under EEOC / Equality Act / DPDPA scrutiny. |
| **Per-language / per-region IRT recalibration** | Cross-lingual feature claimed but no recalibration mention | Constitutional requirement — recalibration on each language target | Translation without recalibration breaks psychometric validity. |
| **Sandbox code execution** | Not mentioned | Judge0-Sandbox-Integration-Spec-v0 | Required for coding question quality verification. |
| **ATS integration coverage** | Not mentioned | ATS-Connector-Framework-v0 (Greenhouse, Lever, Workday, etc.) | Reduces buyer integration cost — deal accelerator. |
| **Webhooks for pipeline events** | Not mentioned | Webhooks-Service-v0-Spec | Required for platform integrations. |
| **Per-tier API rate limiting + metering** | Not mentioned | Designed in CTO Architecture v1 | Required for API monetization. |
| **Bias detection methodology** | Not mentioned | Bias-Detection-Methodology-v1 | EEOC/UK Equality Act high-stakes hiring requirement. |
| **Constitutional governance (multi-office)** | Not mentioned | 7 offices × 25 SOs × 92-pt gate × 5-lock state | Operational durability story for investors and Tier-1 enterprise deals. |
| **Founder-led India distribution moat** | Unknown | Talpro 15-yr IT staffing relationships + Bali AE/BD playbook | Distribution beats product in early enterprise sales. |

---

## 3. Where Artifactum is genuinely STRONGER than QOrium today

Honest accounting — areas where they appear ahead and we must close.

| # | Artifactum strength | Why we're behind | Closure plan (proposed) |
|---|---|---|---|
| 1 | **Visible polished SaaS UI** with JD-upload → role-profile → topic editor → generate flow | We have specs (JD-Forge v0); they have a shippable demo | M3 deliverable: JD-Forge v1 with equivalent UI; same demo motion — "your JD, our questions, in 60 seconds, live" |
| 2 | **NOS / NSDC / Sector Skill Council vocational positioning** — explicit | We have not carved this segment out in the 3-buyer model | Add **Buyer D — Vocational / Skilling Bodies** to Constitution as Article XI Amendment candidate (or as sub-segment of Buyer B). India has NSDC + 36 SSCs as named buyers; this is a stable, government-funded TAM. |
| 3 | **Cross-lingual built-in as marketed feature** | We have it as Stack-Vault add-on (+30%); not headlined | Promote translation/transposition to a **first-class capability** in v2.0 messaging — it's already in the architecture, just under-marketed. |
| 4 | **Higher Education explicit buyer** | Not in QOrium's 3 buyers | Higher Ed = Buyer E (sub-segment); academic year revenue cycle differs from corporate hiring; revisit at M6. |
| 5 | **Three explicit assessment surfaces (Vocational + Hiring + Learning)** | QOrium is hiring-first; L&D + internal mobility are Doc 1 §2.4 footnote | Add SKU 4 candidate: **L&D / Internal-Mobility Question Pack** (a JD-Forge variant for skill-graph diagnostic, not hiring). M6 IdeaForge gate. |
| 6 | **5-minute live demo sales motion** — concrete + repeatable | We have Bali playbook but no 5-min "your JD, our questions" demo packaged | Bali sprint deliverable (M2): build the 5-min `customer-JD → live-pack` demo; ship to AE/BD onboarding. |
| 7 | **"Grounded in your source docs" RAG framing** is sharp | We say "AI authoring + SME validation" — less buyer-friendly | Adopt RAG-grounding language in our marketing without changing the underlying pipeline. |
| 8 | **"Bloom's taxonomy" callout** is concrete + recognizable to L&D / Higher Ed buyers | We default to IRT (more rigorous but less recognized by non-psychometricians) | Position **Bloom's + IRT** — Bloom's for human readability, IRT for psychometric defensibility. Both, not either. |

---

## 4. Strategic differentiators — How QOrium builds better

### 4.1 The 8 differentiation pillars (strategic depth)

| # | Pillar | The QOrium advantage | Constitutional anchor |
|---|---|---|---|
| 1 | **Three SKUs vs One Service** | Artifactum sells "question generation" as a single service. QOrium sells the entire continuum: ReadyBank (commodity, $0.10/q at scale) + JD-Forge (on-demand, $49-499/JD) + Stack-Vault (exclusivity, ₹10L-1Cr/yr). Customers pick the right tool for each use case; we capture the full LTV. | Constitution §1.2 — immutable identity |
| 2 | **Anti-Leak Engine, not "fresh at generation"** | "Fresh" decays. QOrium's Anti-Leak Engine continuously scans Glassdoor/Reddit/GfG/LeetCode/private prep groups, flags semantic matches, auto-rotates within 24-72 hours per tier SLA. Artifactum has no rotation mechanism shown. | SO-22 (v2.0) + Anti-Leak-Engine-v0-Design.md |
| 3 | **IRT calibration on a Reference Panel** | Bloom's = teacher difficulty. IRT = empirical difficulty proven on real candidates. The QOrium Reference Panel (Constitutional Amendment v2.1 Article IX M9) makes our difficulty claims falsifiable. Artifactum's "psychometrically structured" is a marketing claim with no public benchmark. | SO-21 + IRT-Calibration-Pipeline-v0-Spec.md |
| 4 | **Watermarking + forensic leak attribution** | When (not if) a Stack-Vault question leaks, we can prove which customer leaked it. This is a contractual differentiator GCCs and IT-services majors will pay 30-50% premium for. | Constitution §2.5 CDO charter |
| 5 | **Customer Zero proof point** | Talpro India dogfoods QOrium from Day 1. Every Artifactum demo is "here's what could happen." Every QOrium demo is "here's our recruiter sending a candidate through right now." Asymmetric trust artifact. | `talpro_customer_zero` memory + Sprint 0.3 |
| 6 | **API-first + 4 delivery modes** | Artifactum is UI-first ("integrate into your system" is hand-wavy). QOrium ships REST API + Bulk Export + Embedded Widget + White-Label. Tier-1 platforms (HackerRank, Mettl) only buy via API; Artifactum loses these deals by default. | Constitution §1.1 + Doc 5 §5.2 |
| 7 | **Public 92-point Quality Gate + auto-fail criteria** | Falsifiable quality claim. Customer can audit our gate score per release. Artifactum has marketing claims without auditable gates. | Article VII + Quality-Gate-92pt-Scorecard.md |
| 8 | **Constitutional governance (7 offices, 25 SOs, 5-lock state)** | Scales from founder-led to 50-person ops without losing decision quality. Investor + Tier-1 enterprise procurement signal. Artifactum is at "polished founder demo" stage; no evidence of operational machinery. | Constitution v2.0 in entirety |

### 4.2 Three "wedge moves" that put Artifactum on permanent defense

**Wedge A — Public Anti-Leak Benchmark Report (M2-M3 ship):**
Quarterly published report: "We tested 1,000 questions from QOrium ReadyBank + 1,000 from competitor APIs against 5 leak-detection methods (Glassdoor scrape, Reddit search, GfG company tags, LeetCode top-1000, private Telegram corpus). Here's the leak rate per provider." Make leak rate a public market datum. Artifactum cannot match this without a real anti-leak engine.
*Sales asset — already drafted: `sales/Blog-P1-1-We-Tested-Java-Questions-Across-5-Leak-Detection-Methods.md`*

**Wedge B — IRT Calibration Public Disclosure (M4 ship):**
Per quarter, publish IRT calibration stats per ReadyBank skill: "1,247 calibrated questions in Senior Java pool; mean discrimination 0.62; mean difficulty 0.55; theta range -2.4 to +2.1." Buyers (especially GCCs, assessment bodies, higher ed) recognize these numbers. Artifactum's "Bloom's taxonomy" cannot equal this depth.

**Wedge C — Stack-Vault Logo #1 (Bosch GCC) Press Release (M5-M6):**
The Bosch Stack-Vault deal becomes a market-defining proof point — "GCC X commits ₹40L/year for a customer-exclusive, watermarked, IP-protected question library." This is a category Artifactum has not even named. Defines the upper tier of the market and locks the QOrium frame.
*Already drafted: `legal/Press-Release-IP-Counsel-Annotated-Brief.md` + `sales/Press-Release-M3-Soft-Launch-Draft-v0.md`*

---

## 5. Full feature roadmap — Mapped to QOrium phases

For each feature gap surfaced by this competitor analysis, the proposed phase + sprint + effort. Feature roadmap follows existing Constitution v2.0 phase structure.

### Phase 0 (Day 0–14) — close before Phase 1 launch

| Feature | Why now | Effort | Owner | Sprint |
|---|---|---|---|---|
| 5-minute "Your JD → Our Pack" live demo packaged for Bali AE/BD | Match Artifactum's primary sales motion + use Customer Zero advantage | 2 days CTO Office; 1 day Bali polish | CTO + Bali | New Sprint 0.9 |
| Position "RAG-grounding" + "Bloom's + IRT" language in deck | Adopt buyer-recognized framing without changing pipeline | 0.5 day messaging | CEO Office + CTO | Sprint 0.8 (existing Pre-Customer-Zero deck) |
| Cross-lingual / transposition headline elevation in marketing | Match Artifactum's translation positioning; we have it as an add-on | 0.5 day deck refresh | CTO Office | Sprint 0.8 |

### Phase 1 (M1–M3) — Engine MVP

| Feature | Why | Effort | Owner | Sprint |
|---|---|---|---|---|
| **JD-Forge v1 with polished UI** matching Artifactum's role-profile + topic-editor flow | We must be visibly equal-or-better at the demo Artifactum sells against | 3-4 weeks | CTO + Senior Engineer (C1) | New Sprint 1.5 |
| **Public Anti-Leak Benchmark Report** v0 (Java + Python + React, 200 questions per skill) | Wedge A; converts our SO-22 into market-defining content | 1 week (questions exist; need test infra + report writeup) | CDO + CTO | Sprint 1.6 |
| **NSDC / NOS code mapping pilot** for ReadyBank — IT-ITeS Sector Skill Council coverage | Counter Artifactum's vocational/NSDC positioning before they lock NSDC mindshare | 2 weeks (mapping + tagging existing 630 Qs) | CDO + SME Lead (C2) | Sprint 1.7 |
| **Bloom's taxonomy mapping** added to ReadyBank tags (alongside IRT) | Buyer-friendly difficulty language for L&D / vocational buyers | 1 week (auto-tag + SME audit) | CDO | Sprint 1.7 |

### Phase 2 (M4–M6) — Multi-buyer validation

| Feature | Why | Effort | Owner | Sprint |
|---|---|---|---|---|
| **L&D / Internal-Mobility SKU candidate** (JD-Forge variant — skill diagnostic, not hiring) | Artifactum's "Learning" surface is a real adjacent market; QOrium gates via M6 IdeaForge | MANTHAN session + IdeaForge gate; if PROCEED, 4-6 wk build | MANTHAN → CTO | New Sprint 2.x |
| **Higher-Ed beachhead validation** (3 IIT or top private-univ pilot programs) | Artifactum names higher-ed; QOrium needs a position before they brand-lock | Bali discovery + 3 paid pilots | CEO + Bali | New Sprint 2.x |
| **IRT Calibration Public Disclosure** v0 — quarterly stats per skill pool | Wedge B; falsifiable psychometric claim Artifactum cannot replicate without their own panel | 2 weeks | CDO + I/O Psych contractor (C5) | Sprint 2.x |
| **Cross-lingual recalibration pipeline** (not just translation) | Artifactum claims "transposition" but no recalibration evidence; we ship the real thing | 3 weeks | CTO + CDO + I/O Psych | Sprint 2.x |
| **Stack-Vault Logo #1 closure (Bosch GCC)** with watermarked deliverable + press release | Wedge C; defines upper tier of market | Founder-led sales + 8-week delivery | CEO + CTO + SME Lead | Sprint 2.x (already on roadmap in Doc 5 §7) |

### Phase 3 (M7–M9) — Platform-tier API motion

| Feature | Why | Effort | Owner | Sprint |
|---|---|---|---|---|
| **REST API GA** with rate limiting, metering, OAuth, webhooks | Tier-1 platforms only buy via API — capability Artifactum has not shown | 4-6 weeks (specs already exist in `/infra/`) | CTO + Senior Engineer | Sprint 3.x (already on Doc 5 roadmap M5-M7) |
| **ATS Connector Framework** — Greenhouse, Lever, Workday | Reduces enterprise integration cost; deal accelerator vs Artifactum | 2-3 weeks per ATS | CTO | Sprint 3.x |
| **Audit Log API** (customer pullable, not just vendor UI) | Procurement requirement enterprise-tier; Artifactum has UI-only audit | 1 week (spec exists) | CTO | Sprint 3.x |
| **SSO / SAML enterprise** | GCC procurement gate; Artifactum unknown | 2 weeks (spec exists) | CTO | Sprint 3.x |

### Phase 4 (M10–M12) — Defensibility hardening

| Feature | Why | Effort | Owner | Sprint |
|---|---|---|---|---|
| **Watermarking v1** (cryptographic per-customer markers in test cases + problem text) | Stack-Vault default; Artifactum has no equivalent | 4-6 weeks | CTO + CDO | Sprint 4.x |
| **Anti-Leak Engine v1** (continuous, real-time tier for Enterprise SLA) | Tier-up from the M2 benchmark report; SLA-grade engine | 6-8 weeks | CTO + CDO | Sprint 4.x |
| **Reference Panel v1** (1,000+ candidates onboarded, fairness-audited, IRT data accruing) | Required for SO-21 IRT mandate at scale | Continuous from M3; v1 milestone at M9-M12 | CDO + I/O Psych | Sprint 4.x |
| **Bias-Detection Methodology v1** in production | EEOC / Equality Act high-stakes hiring requirement; Artifactum has no equivalent | 4 weeks | CDO + I/O Psych + Legal | Sprint 4.x |

---

## 6. Quick gap analysis — Artifactum vs QOrium (snapshot)

For CEO 30-second read.

```
                   Artifactum     QOrium (current)    QOrium (M12 target)
SKUs                  1                3                   3 (+1 candidate)
Buyers (named)        6                3                   3-5
Delivery modes        1 (UI)           4 (specced)         4 (operational)
IRT calibration       ✗                ✓ (mandate)         ✓ (operational + public)
Anti-leak engine      ✗                ✓ (designed)        ✓ (24-72h SLA tiers)
Watermarking          ✗                ✓ (designed)        ✓ (Stack-Vault default)
Public benchmarks     ✗                ✗ (planned M2-M3)   ✓ (quarterly)
NOS/NSDC mapping      ✓ (claimed)      ✗ (planned M3)      ✓ (operational)
Bloom's taxonomy      ✓                ✗ (planned M3)      ✓ (alongside IRT)
Cross-lingual         ✓ (claimed)      ✓ (Stack-Vault add) ✓ (first-class + recalibrated)
Customer Zero         ✗                ✓ (Talpro)          ✓ (compounding)
Constitutional gov    ✗                ✓ (v2.0)            ✓ (v3.0)
Pricing transparent   ✗                ✓ (3 SKUs × tiers)  ✓ (published bands)
5-min live demo       ✓                ✗ (planned 0.9)     ✓ (Bali default motion)
```

**Net read:** QOrium has more depth in psychometric defensibility, distribution-mode breadth, and operational governance. Artifactum has more polish in shippable UI and India-vocational positioning. **The gap closes in QOrium's favor by M3 if we execute Sprints 0.9 + 1.5 + 1.6 + 1.7.**

---

## 7. Risks introduced by Artifactum's existence

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Vocational/NSDC mindshare lock-in** — if Artifactum signs an NSDC or large SSC partnership before us, we lose this TAM segment for 2-3 years | HIGH | Sprint 1.7 NSDC mapping; Bali outbound to NSDC + IT-ITeS SSC by M3 |
| 2 | **Brand confusion** — `artifactum` vs `QOrium` are both made-up tech names; SEO collision possible | MEDIUM | Trademark filing in flight (Talpro India Pvt Ltd) — accelerate; own qorium.* domains; SEO-content drumbeat per Bali Content-Marketing-Roadmap |
| 3 | **Pricing race-to-bottom** if Artifactum publishes aggressive India pricing first | MEDIUM | Publish QOrium tiered pricing first (Sprint 0.8 deck + pricing-pages); price ReadyBank Recruiter Solo at ₹4,999 anchor — competitive but profitable |
| 4 | **Investor pattern-match risk** — investors see Artifactum first, assume QOrium is "another one" | MEDIUM | Lead with 3-SKU continuum + IRT/Anti-Leak/Watermark moats in Investor Brief; emphasize Customer Zero |
| 5 | **Talent hiring competition** — Artifactum recruits the same SME contractors / I/O psych contractors | LOW-MEDIUM | C7 Compensation bands competitive; C6 SME sourcing plan diversified; lock 2-3 anchor SMEs on multi-month contracts |
| 6 | **Artifactum acquired by an HR-tech roll-up before market is established** | LOW (this run) | Trigger §10.3 Competitive Watch MANTHAN re-validation if acquired |

---

## 8. Talking points for CEO (next 3 conversations)

For Bali outbound, investor calls, partner discussions:

1. **"Artifactum is a question-generator. QOrium is the content layer."** — they sell one feature; we sell the entire spectrum from commodity library to customer-exclusive IP-protected vault.
2. **"Their 'fresh' is generation-time fresh. Ours is rotation-engine fresh."** — Anti-Leak Engine is the difference between a question that's never been used and a question that stays uncrackable.
3. **"They claim psychometric structure. We publish IRT calibration data quarterly."** — falsifiable beats marketing.
4. **"Their demo says 'imagine if your candidate got this.' Our demo says 'here's the candidate Talpro India sent through this morning.'"** — Customer Zero asymmetry.
5. **"They serve hiring + L&D + vocational. We serve all three plus we own the IP-exclusivity tier they don't even price."** — Stack-Vault is a category they haven't named.

---

## 9. Watch triggers (per Constitution v2.0 §10.3)

Re-open this competitor file and run a fresh MANTHAN re-validation on any of:

- Artifactum announces enterprise customers (Tier-1 IT services or GCC)
- Artifactum publishes pricing
- Artifactum announces funding round
- Artifactum announces NSDC / NCVET / SSC partnership
- Artifactum acquires or is acquired
- Artifactum publishes any benchmark or independent study
- Domain `artifactum.in` or `artifactum.ai` materially changes positioning
- Talpro Bali AE/BD reports buyer mentioning "we evaluated Artifactum"

---

## 10. Source artifacts (for re-audit)

Stored alongside this doc in `/QOrium/research/`:

- `artifactum_deck_extracted.md` — verbatim slide-by-slide text extract (9 slides)
- `competitor_audio_transcript.txt` — 5:30 video transcribed via faster-whisper (tiny.en model)
- `competitor-matrix.xlsx` — companion feature matrix + scoring + roadmap mapping

Original assets (in /uploads/, not copied to project for IP hygiene):
- `artifactum_deck.pptx` — 36KB sales deck
- `WhatsApp Video 2026-05-02 at 23.38.31.mp4` — 112MB product walkthrough

---

*End Competitor #1: Artifactum. Append next competitor as `# Competitor #2: <Name>` below this line. Index at top must be updated each addition.*
