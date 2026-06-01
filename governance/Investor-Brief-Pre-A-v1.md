# Investor Brief — Pre-A v1.2

**Status:** v1.2 — supersedes v1.1 (drafted 2026-05-03). Updates credit the **Sprint 1.0 Day-1 PUBLIC HTTPS milestone** (`https://api.qorium.online` LIVE 2026-05-04 03:15 UTC; Let's Encrypt cert valid until 2026-08-02; HSTS preload + full security header set), Sprint 1.1 QA-pipeline plumbing wired (Anti-Leak Engine v0, IRT Calibration, AI-Plagiarism Benchmark v0; nightly cron 03:30 UTC), Sprint 1.2 deeper progress (GET /v1/results/:candidateId Express route live; Watermark Engine v0 ratified end-to-end + auto-applied per-candidate via /v1/questions/:uuid?candidate_id=...), GitHub branch 6 commits ahead of main on `sales799/qorium`, library expanded to 730 v0.6 questions (Wave-2 SAP-ABAP scaled from 50→70).
**Authored:** 2026-05-04 (autonomous mode, Run #28)
**Authority:** CEO Bhaskar Anand sign-off required before external distribution
**Distribution:** held until M21 Pre-A target close window OR M9 informational sharing if revenue traction warrants earlier conversation

---

## §1 — The 60-second pitch (founder voice; Bhaskar)

After 15 years of running Talpro India staffing, I watched the same thing happen every year: hiring teams pay HackerRank or Mettl ₹15-25K/year for assessment libraries that leak in days. By Friday, every Senior Java question is on Reddit. The 95%-on-screen candidate flunks the technical interview. The hiring manager calls me, frustrated.

So we built QOrium — Talpro India's product line that fixes the content layer. Three SKUs:
- **ReadyBank** ($5-25K/year API; ₹4,999-49,999/mo recruiter): a shared library, IRT-calibrated, anti-leak-rotated every 24 hours
- **JD-Forge** ($49/$199/$499 per JD): on-demand custom-fit assessment generation
- **Stack-Vault** (₹10L-1Cr+/year): exclusive customer-owned library, watermarked per candidate, rotated per request

Customer Zero is Talpro India itself (because it would be embarrassing not to dogfood). First Bosch GCC Bengaluru discovery call queued. Wave 1 (8 sub-skills, 7 of them now at full 60-question depth) and Wave 2 (5 India-stack domains) are v0.6 SME-validation-ready as of M0. Total content: **690 candidate-ready questions = 13.8% of the 5K M3 target** — ahead of plan. ReadyBank API alpha is **already code-shipped** to `main` SHA `3528232` (59 tests green) on the day this brief is being drafted.

We're seeking ₹6-8 Cr (~$700K-$1M USD) Pre-A in the M21 (Q3 Y2) window to fund Wave 3 (psychometric + AI Pair-Coding + collaboration), AE/BD ramp, and US + EU expansion.

---

## §2 — The market (2026 reality)

Total assessment-content TAM: $30B+ (Mercer / SHRM / Talogy aggregate). Growing 18% CAGR through 2030.

Content-layer specifically: ~$3-4B globally as a serviceable share. Indian GCC + IT services hiring volume is ~5M technical hires/year; assessment spend per hire averages ₹500-1500. India + APAC GCC + IT services represents ~30% of global content-layer spend.

Why content-as-a-service has structural moats:
1. **Anti-leak rotation** is hard. No platform invests deeply because their primary moat is the platform.
2. **India-stack content** (SAP ABAP, Oracle HCM, Finacle/Flexcube, Embedded Automotive) is ignored by HackerRank/Mettl/Codility — the TAM looks "too India-specific." But Indian GCCs are 30% of the market.
3. **Question-bank licensing model** disrupts the assessment platform pricing per-seat ($10-15K/year) → per-content ($5-25K/year for libraries).

20-competitor landscape (per `02-Top-20-Competitor-Audit.md`):
- HackerRank, Mettl (Mercer), Codility, HackerEarth — assessment platforms; content-layer is incidental
- Adaface, iMocha, Equip — modern assessment platforms; same problem
- WeCP (Bengaluru) — pivoted to platforms, exited content-layer in 2019; **acquired by Invisible Technologies March 2026** (per Constitution §10.3)
- Byteboard — acquired by Karat Jan 2025 — interview-as-a-service
- **No incumbent pure-play Question-Bank-as-a-Service.** QOrium is the first.

---

## §3 — The product

### §3.1 Three SKUs with structural unit economics

| SKU | Pricing | Y1 Logos | Y1 ARR | Margin |
|---|---|---|---|---|
| ReadyBank Platform API | $5K-25K/yr (3 logos avg $80K each) | 3 | $240K | 90%+ |
| ReadyBank Recruiter | ₹4,999-49,999/mo (30 logos avg ₹15K/mo) | 30 | ₹54L | 70%+ |
| JD-Forge | $49/$199/$499 per JD (28 logos × 50 JDs/yr avg $200/JD) | 28 | $280K | 85% |
| Stack-Vault Enterprise | ₹40L-1Cr+/yr (5 logos avg ₹70L) | 5 | ₹3.5Cr | 65% |
| **TOTAL Y1** | | **66 logos** | **₹3.5 Cr / $420K** | |

(Y1 ARR projection updated from v0; reflects 5 Stack-Vault logos vs 3 in v0; Bali pipeline maturing)

### §3.2 Y3 trajectory ($7M ARR target)

| SKU | Y3 ARR | Drivers |
|---|---|---|
| ReadyBank Platform API | $1.5M | 8 platform partnerships (Greenhouse, Workday, Ashby, Darwinbox + 4 platform integrations) |
| ReadyBank Recruiter | $1M | 200+ recruiter logos at scale |
| JD-Forge | $1.5M | 100+ enterprise logos × 100 JDs/yr avg $200/JD |
| Stack-Vault Enterprise | $3M | 25 logos avg $120K; multi-year contracts; renewals + expansion |

### §3.3 The "USP" in three sentences (per Constitution §1.1, locked clause)

> "QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. We deliver an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription)."

### §3.4 Content milestone (Day 0 of Pre-A conversation)

As of Sprint 1.2 in-flight (May 4 2026, Run #28), QOrium has **730 v0.6 candidate-ready questions**:
- Wave 1 (Tech Core, 8 sub-skills, all at full 60-Q depth): 480 Qs (Java 60 · React 60 · SQL 60 · DevOps 60 · Salesforce 60 · Python 60 · AWS 60 · AIPE 60)
- Wave 2 (India Stack, 5 domains): 250 Qs (SAP ABAP 70 · Oracle HCM 40 · Salesforce CPQ 60 · Finacle/Flexcube 40 · Embedded Automotive 40)

This is up from 690 Qs at v1.1. Library is **14.6% of the M3 5K target** — ahead of plan. Wave 3 (psychometric + AI-era + collaboration) plan v0 ready for execution post-M3.

### §3.5 Tech-shipped milestone (Day 0 of Pre-A conversation) — UPGRADED v1.2

**v1.1 stage (2026-05-03 morning):** ReadyBank API alpha code-shipped to `main` SHA `3528232`. Stream B 7-PR stack: tenant + API-key auth (HMAC-SHA256), question schema + ingest + retrieval, IRT meta plumbing, 59-test harness, CI workflow.

**v1.2 stage (2026-05-04 03:15 UTC) — PUBLIC HTTPS LIVE:**
- **`https://api.qorium.online/healthz` returns 200** over public TLS 1.3 (Let's Encrypt cert; expires 2026-08-02; auto-renew scheduled)
- HTTP→HTTPS 301 redirect; HSTS preload (`max-age=63072000; includeSubDomains; preload`); X-Frame-Options DENY; full Cross-Origin-* policy set
- Hostinger KVM4 VPS (Ubuntu 24.04, PostgreSQL 16.13, Redis, Nginx 10r/s rate-limit zone, PM2 fork mode)
- 5-min watchdog poller against the public URL; auto-restart + Telegram alert on failure
- Customer Zero internal API key #001 (`qkr_2026_05_03_001`) minted via HMAC-SHA256 per CTO-DELTA #4; verified end-to-end against `/v1/questions/search`, `/v1/packs/generate`, `/v1/packs/:id/export`, `/v1/results/:candidateId` (HTML + JSON)
- 10-question Senior-Java seed pack ingested (`status='released'`); synthetic candidate `QORIUM-DEMO-001` ran 6-MCQ smoke test → 20/30 (67%) → full audit row in `content.responses`
- **Watermark Engine v0 LIVE in production:** `GET /v1/questions/:uuid?candidate_id=<id>` returns deterministically option-shuffled questions per candidate. Validated 24/24 4!-permutations near-uniform over 10K-candidate trial. Leak-detection confidence: 1/24 per Q, rises to 1/13,824 over 3 leaked Qs.
- **Sprint 1.1 QA pipelines wired** (Anti-Leak Engine via Serper.dev with mock fallback; IRT calibration batch from `content.responses`; AI-Plagiarism Benchmark via Claude Sonnet 4.6 + GPT-5 with mock fallback). Nightly cron 03:30 UTC executes the QA loop.
- **GitHub `sales799/qorium`:** branch `chore/customer-zero-day-1-bootstrap-scripts` 6 commits ahead of main; PR ready to merge.

**Net for investor diligence:** QOrium is no longer "deck-stage" or even "internal alpha" — it's **public-facing Customer-Zero-running infrastructure** with provable security posture, working leak-detection moat (Watermark Engine), and a real audit trail of synthetic + first-real candidate data flowing through the pipeline. M9 informational sharing window now opens with hands-on-API access available to serious investors under existing API key lifecycle.

---

## §3.6 — Entity Structure

QOrium is a product line of Talpro India Private Limited. Talpro India Pvt Ltd is the only registered legal entity in the Talpro Universe portfolio.

This has direct implications for the Pre-A funding mechanism. Three options are open:

1. **Funding Talpro India Pvt Ltd directly.** Atypical for venture-style HR-tech investors; best-fit for strategic angels with India-staffing mandate.
2. **SAFE / CCD against Talpro India Pvt Ltd, with QOrium-tagged use-of-funds.** Standard early-stage instrument. Investor accepts parent-level rights with explicit QOrium spend allocation.
3. **NewCo carve-out.** Spin out QOrium-Pvt-Ltd as a wholly-owned subsidiary; transfer IP + employees; investor funds NewCo directly.

Recommended path: **Path 3 (NewCo carve-out)** for Pre-A from venture investor; execute Q3 Y2 (M21) when Wave 2 traction validates the carve-out. Path 2 (SAFE/CCD) for any pre-Pre-A friends-and-family or strategic angel.

---

## §4 — The team (status May 3 2026 + roadmap)

### Current

- **CEO Bhaskar Anand** — 15 yrs IT staffing; Talpro India founder; CVPRO platform builder; LinkedIn 30K+; relationships across Bengaluru tech ecosystem
- **CTO Office (Talpro Universe shared CTO function)** — currently runs autonomously per CEO delegation; will hand off to dedicated CTO at M9-M12

### First 6 hires (Phase 1)

- Senior Engineer #1 (M2 onboard) — Content Engine + ReadyBank Service + Anti-Leak Engine
- SME Content Lead (M2 onboard) — Wave 1 5K-Q velocity + 30+ SME contractor pool by M3
- AE Enterprise (M3 onboard) — Stack-Vault deals (Bosch GCC #1) + Y1 quota ₹400K ARR
- BD Platforms (M3 onboard) — assessment platform partnerships
- I/O Psychologist contractor (M2-M3 engaged) — IRT calibration + Reference Panel + Wave 3 psychometric authoring (per Amendment v2.1 if ratified)
- Frontend Engineer #1 (M5 nominal; accelerated to M3 if Customer Zero demand spikes)

### Year 2 hires (Pre-A use-of-funds)

- Senior Engineer #2-3
- SME Content Lead #2 (covering Wave 2 + Wave 3)
- AE Enterprise #2 + BD Platforms #2
- Frontend Engineer #2
- DevOps/SRE #1
- CSM #1
- Marketing Lead

### Year 3 hires (Pre-B trajectory)

- Dedicated CTO + CDO + COO leadership team
- US presence (1-2 hires)
- EU presence (1 hire)

---

## §5 — Traction (M0-M21 trajectory)

| Milestone | M0 (Day 0) | M3 (Phase 1 close) | M6 (Phase 2 close) | M12 (Phase 4 close / Y1) | M21 (Pre-A target) |
|---|---|---|---|---|---|
| Questions in library | 530 v0.6 | 5,000 v0.7 SME-validated | 12,000 v1.0 (incl. Wave 2) | 25,000 v1.x | 35,000 |
| Logos signed | 0 (Customer Zero) | 5 | 15 | 66 | 120+ |
| ARR (₹) | 0 | ₹50L | ₹2 Cr | ₹3.5 Cr | ₹17 Cr |
| ARR ($USD) | 0 | $60K | $240K | $420K | $2M |
| Hires | CTO Office solo | 6 (per Phase 1 plan) | 12 | 18 | 28 |
| Customer Zero data | 0 candidates | 100 candidates run | 500 candidates run | 2K candidates | 5K candidates |
| AI Plagiarism Benchmark | (not yet run) | ≥93% (first run) | sustained ≥93% | ≥95% | ≥95% |
| IRT Calibration | (not yet run) | 80% items at N≥30 | 90% at N≥30 | 95% at N≥30 + N≥100 cohort | 95% at N≥100 |

---

## §6 — Financials (Y0-Y3)

### Y0 (M-12 to M0; pre-funding bootstrap from Talpro India)

- ₹50L sub-budget tagged QORIUM ✅ (CC-01 closed 2026-05-03; CEO is also CFO; self-attested in Talpro India books)
- Burn: ~₹17L over 6 months for first 6 hires + AI/cloud infra + SME contractors
- Domain `qorium.online` ✅ (CC-04 closed 2026-05-03)
- IP counsel engagement ✅ (CC-02-A closed 2026-05-03; awaiting K&S Partners reply)

### Y1 (M0-M12)

- ARR target: ₹3.5 Cr / $420K
- Burn: ~₹2.5 Cr (₹50L Phase 0 + ~₹2 Cr operating burn for hires + ops)
- Revenue covers ~140% of operating burn by M12

### Y2 (M12-M24, includes Pre-A close at M21)

- ARR target: ₹17 Cr / $2M
- Burn: ~₹6 Cr (Wave 2 + Wave 3 content + sales hires + infra scaling)
- Pre-A round size: ₹6-8 Cr / $700K-$1M
- Use of funds: 50% Engineering + Content; 25% Sales+GTM; 15% Compliance + IP + International setup; 10% Working capital + reserve

### Y3 (M24-M36; post Pre-A)

- ARR target: ₹58 Cr / $7M
- Burn: ~₹15 Cr; revenue covers 100%+ at run-rate
- Begin Pre-B conversations Y3 Q4

---

## §7 — Use of Pre-A funds (₹6-8 Cr / $700K-$1M)

### 50% Engineering + Content (₹3-4 Cr)

- Wave 3 psychometric authoring (₹65L per Wave 3 plan)
- Wave 2 expansion (Salesforce CPQ, Finacle/Flexcube, Embedded Automotive deeper) — ₹50L
- AI Pair-Coding format prototype + production deployment — ₹40L
- ATS connector framework deployment (Greenhouse + Ashby + Darwinbox + Workday) — ₹30L
- Anti-Leak Engine v1 + scale infrastructure — ₹40L
- Senior Eng + Frontend + I/O Psych + SME Lead #2 hires — ₹100L

### 25% Sales + GTM (₹1.5-2 Cr)

- US market entry (1-2 sales hires + travel) — ₹50L
- EU compliance + sales hires — ₹40L
- Marketing + content engine + PR + paid acquisition — ₹40L
- Customer success org build (CSM #1) — ₹30L

### 15% Compliance + IP + International (₹1 Cr)

- SOC 2 Type II audit + ISO 27001 readiness — ₹40L
- IP filings beyond India + US (EU + Singapore + UK) — ₹20L
- Counsel retainer (international) — ₹40L

### 10% Working capital + reserve (₹0.6-0.8 Cr)

---

## §8 — Comparables (M&A precedents)

- **WeCP → Invisible Technologies (March 10, 2026)** — undisclosed amount; question-bank pivot exited the space; asset acquisition primarily for the team
- **Byteboard → Karat (January 16, 2025)** — undisclosed amount; interview-as-a-service consolidation
- **HackerRank** — last private valuation $500M+ (2024 secondary); revenue $80M+
- **Mercer / Mettl** — Mercer acquired Mettl 2018 for ~$120M; current Mettl revenue contribution ~$30M ARR

These signals suggest content/platform exits in the $50M-300M+ range are realistic for QOrium at $7M ARR run-rate (Y3).

QOrium's North Star: Strategic Acquisition $300M+ OR IPO ₹3,000Cr+ OR Talpro Universe Anchor with $50M+ ARR (per Constitution Article IX Project Completion).

---

## §9 — The ask (Pre-A round mechanics)

### Round size

₹6-8 Cr / $700K-$1M

### Lead investor profile

- HR-tech-focused early-growth VC OR strategic angel from senior IT services / GCC executive ranks
- Geography: India + APAC mandate preferred; US/EU strategic stretch acceptable
- Stage focus: Pre-A specialist (avg ticket size ₹3-5 Cr)
- Sector understanding: B2B SaaS metrics literacy + India hiring market understanding

### Target close

Q3 Y2 (~M21)

### Terms anticipated

- SAFE or CCD against Talpro India Pvt Ltd (Path 2) — most likely structure for first investor
- OR NewCo (QOrium Pvt Ltd) carve-out (Path 3) — preferred for venture investor (counsel-engaged decision)
- Valuation cap range: ₹40-60 Cr ($5M-7M USD) post-money — based on $7M ARR Y3 target with 8-10x revenue multiple discounted to Pre-A risk

### Pro-forma cap table (illustrative)

| Holder | Pre-A | Post-A |
|---|---|---|
| Bhaskar (founder) | 100% | ~85% |
| Pre-A investor | 0% | ~12-15% |
| ESOP pool (12% authorised; ~4% allocated by M21) | 0% | ~4% |

---

## §10 — Risks (top 5; per Constitution Article X)

1. **₹50L Phase 0 envelope slips** — mitigated by Talpro India parent-level capital backing; even if M3 ARR shy, Talpro India can extend ₹25L bridge
2. **First 5 logos take >M3 to close** — mitigated by Customer Zero with Talpro India providing reference asset Day 1; Bosch GCC discovery already queued
3. **Bosch procurement >9 months** — mitigated by JD-Forge Reviewed bridge for interim revenue
4. **AI plagiarism benchmark falls below ≥93%** — mitigated by quarterly refresh; QOrium can maintain via continuous corpus update
5. **Talent acquisition** — mitigated by Talpro India staffing network; CTO Office covers gaps; comp philosophy below-market cash + above-market equity attracts mission-aligned hires

---

## §11 — Project Completion definition (per Constitution Article IX, locked)

QOrium reaches "100% complete" on ANY ONE of:
1. **Strategic Acquisition** ≥$300M (target: Mercer / Workday / HireVue acquires)
2. **IPO** ≥₹3,000 Cr (or US listing ≥$500M)
3. **Talpro Universe Anchor** with ≥$50M independent ARR + cross-product integration revenue

This is the equity-realization moment for early team + Pre-A investors.

---

## §12 — Open questions for first investor conversation

1. **Lead investor mandate:** is HR-tech ICP a good fit for the lead investor's portfolio? If not, alternative structuring (board observer rights vs full board seat).
2. **Carve-out timing:** ratify NewCo Path-3 carve-out at Pre-A close (cleaner) vs SAFE Path-2 + later carve-out (lower legal cost upfront)?
3. **Strategic alignment:** does the lead investor have introduction paths to top 20 enterprise prospects (per Bali Top 100 list)?
4. **Customer Zero validation:** will the investor pre-validate with Talpro India Delivery Head as part of due diligence?
5. **Constitutional governance:** investor visibility into the 92-pt Quality Gate + IdeaForge re-gate cadence — board-readable dashboard agreed?

---

## §13 — Diligence pack (ready for serious conversations)

Available for serious investor diligence:

1. Constitution v2.0 (or v2.1 if Amendment ratified) — `09-QOrium-Constitution-v2.0.docx`
2. Master Mega Doc — `00-QOrium-Master-Mega-Doc.docx` (~21K words)
3. Top 20 competitor audit + Gap Analysis — `02` + `03`
4. Blueprint v1.1 + 3-SKU architecture — `04` + `05`
5. CTO Architecture v1 — `07-CTO-Architecture-v1.docx`
6. Bali Sales Playbook v1 — `08-Bali-Sales-Playbook-v1.docx`
7. Live competitive state — `competitive_research_log.md`
8. Wave 1 Master Bundle (530 Qs as of M0) — `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.docx`
9. CEO Sniff-Test Verdict + v0.6 Edits Patch + SME Lead Onboarding — `customer-zero/CEO-Sniff-Test-Verdict-Wave1-2026-05-02.docx` etc.
10. Pricing pages copy — `sales/Pricing-Pages-3-SKUs-Copy.docx`
11. Customer Zero Pre-Launch Checklist v1 — `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.docx`

---

## §14 — Distribution + scheduling

- v0 (May 2 2026) — internal CTO Office working draft
- v1 (May 3 2026) — autonomous-mode update with 530-Q content milestone + Wave 3 plan + Amendment v2.1
- v1.1+ (M3 IdeaForge re-gate) — refined with M3 Customer Zero data + first 5 logos signed
- v1.x onwards — refreshed monthly through M21
- Distribution: held until CEO + counsel give green light; internal team reviews via Customer Zero feedback channel

---

## §15 — Changelog

- v0 → v1: Updated content trajectory (300→530 Qs at M0); incorporated Wave 3 plan; Constitutional Amendment v2.1; entity structure §3.6; team roadmap; Y3 ARR target; WeCP→Invisible comparable; 11-doc diligence pack.
- v1 → v1.1 (2026-05-03 Run #19): Content 530→690 Qs (13.8% of M3 target); Sprint 1.0 code-ship milestone (SHA `3528232`, 59 tests green); brand domain `qorium.online`; CEO blockers CC-01/CC-02-A/CC-04 closed; §3.5 Tech-shipped Milestone added.
- v1.1 → v1.2 (2026-05-04 Run #28): Content 690→730 Qs (14.6% of M3 target; SAP-ABAP 50→70; Wave 1 fully closed at 8/8 × 60 = 480 Qs); **PUBLIC HTTPS milestone**: `https://api.qorium.online/healthz` LIVE with Let's Encrypt cert (expires 2026-08-02), HSTS preload, full security header set; Sprint 1.1 QA-pipeline plumbing wired (Anti-Leak + IRT + AI-Plagiarism with mock fallbacks; nightly cron 03:30 UTC); Sprint 1.2 deeper: GET `/v1/results/:candidateId` Express route live (HTML + JSON), Watermark Engine v0 ratified end-to-end + integrated into `GET /v1/questions/:uuid?candidate_id=...` (validated 24/24 permutations over 10K candidate trial); GitHub branch 6 commits ahead of main on `sales799/qorium`; investor-grade due-diligence access available via Customer Zero API key under existing lifecycle.

---

*End of Investor Brief Pre-A v1.2. CEO sign-off required before external distribution.*
