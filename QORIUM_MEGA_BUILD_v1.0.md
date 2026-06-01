# QORIUM MEGA BUILD v1.0

**Date:** 2026-05-31
**Author:** Claude (Apex Brain) — strategy & spec only
**Executor:** Codex BHIMA (Mac Pro, 20× Pro) + Codex ARJUN (Mac Mini, 20× Pro), parallel lanes A/B via KARYA
**MANTHAN session:** `9194eed8`
**Status:** Founder-approved input. Awaiting Phase 0 ratification.
**Supersedes:** N/A (first formal Mega Build spec post launch)

---

## 0. WHY THIS DOCUMENT EXISTS

QOrium shipped its marketing site to `qorium.online` on 2026-05-31 with Rakshak **GO 88/100 across 17/17 audits** (run `rakshak-qorium_online-mpt7km6c-44a4`). That milestone proves the **shell**. It does not yet prove the **product**.

The CEO surfaced four reference sites — TechCurators, Brainstack, Vervoe, CoderByte — and one supplementary index page (TechCurators Skill Library). This Mega Build:

1. Audits all five (Brainstack triaged as wrong-category — see §1).
2. Maps every feature to QOrium's existing/planned modules and produces a gap matrix.
3. Specifies a **360° build** covering **marketing site** + **backend modules**.
4. Splits work into parallel KARYA lanes for Codex BHIMA + Codex ARJUN to ship non-stop, no code from Claude.

Per APEX Boot Rule: **Claude writes the spec. Codex writes the code.** Every line below is a brief, not an implementation.

---

## 1. COMPETITIVE SET — CALIBRATION

| Site | Category | Stage | Use as |
|---|---|---|---|
| **Vervoe** (vervoe.com) | AI skills assessment SaaS, enterprise-grade | Mature (G2 Enterprise High Performer, ISO 27001, Holistic AI NYC bias audit) | **Primary product benchmark.** Closest direct competitor to QOrium's intended position. |
| **CoderByte** (coderbyte.com) | Coding-first assessment + interview + upskill | Mature, "unlimited candidates + AI credits" pricing posture | **Pricing-model and dev-experience benchmark.** Strongest signal on the "unlimited + AI" packaging story. |
| **TechCurators** (techcurators.in) | India-based assessment **service** (SME-curated, Google Form intake) | Agency, not product — 100+ skill domain catalog, no live platform | **Skill-taxonomy benchmark** (use their `/skill-library` as a coverage shopping list). Not a product competitor. |
| **TC Skill Library** (techcurators.in/skill-library) | Same as above, index only | Static catalog | **Coverage menu** for QOrium's Assessment Library v1. |
| **Brainstack** (brainstack.net) | Tunisia IT services + AI consulting | Services firm, not assessment | **Excluded** from competitive matrix — wrong category. Noted for the record only. |

**Implication:** the real two-horse race is **Vervoe vs CoderByte**. QOrium must clear both bars, then add the wedge.

---

## 2. FEATURE GAP MATRIX

Legend: ✅ shipped/firm in plan · ⚠️ partial/incomplete · ❌ not in QOrium's current plan · 🟦 QOrium differentiator (not in any competitor)

Current QOrium ground truth (from PM2 live read 2026-05-31): only `qorium-marketing` is online. Backend services referenced in prior memory snippets (qorium-api, qorium-jd-forge, qorium-stack-vault, qorium-leaky-crawler, qorium-irt-calibration, qorium-webhooks, qorium-sso, qorium-audit-log) are **not currently registered in PM2**. Treat backend as **greenfield rebuild** under this Mega Build, not an extension.

### 2.1 — Core assessment surface

| Feature | Vervoe | CoderByte | TechCurators | QOrium plan today | Gap action |
|---|---|---|---|---|---|
| Assessment Builder (drag-drop, custom q types) | ✅ | ✅ | ⚠️ (manual by SME) | ⚠️ planned, not built | **BUILD — M1.A** |
| Assessment Library (pre-built tests) | ✅ | ✅ | ✅ (100+ skills, PDF samples) | ❌ | **BUILD — M1.B** |
| Coding challenges (in-browser IDE) | ⚠️ (via Job Sim) | ✅ (core surface) | ❌ | ⚠️ qorium-jd-forge hints, not live | **BUILD — M2** |
| Job simulations / real-task replicas | ✅ (Job Simulations product) | ⚠️ | ❌ | ❌ | **BUILD — M3** |
| AI scoring / grading | ✅ (independently bias-audited) | ✅ | ❌ (SME manual) | ⚠️ qorium-irt-calibration hint | **BUILD — M4** |
| Cognitive / aptitude tests | ✅ (Cognitive Assessments product) | ⚠️ | ✅ | ❌ | **BUILD — M5** |
| Video response + transcription scoring | ✅ | ⚠️ | ❌ | ❌ | **BUILD — M6** |
| AI screening chatbot (conversational) | ✅ (AI Screening Agent) | ❌ | ❌ | ❌ | **BUILD — M7** 🟦 wedge candidate |
| Interview scheduling | ✅ | ⚠️ | ❌ | ❌ | **BUILD — M8** |
| Live coding interview | ⚠️ | ✅ (core) | ❌ | ❌ | **BUILD — M9** |
| Reference checking | ✅ | ❌ | ❌ | ❌ | **BUILD — M10** |
| Anti-cheating / generative-AI detection | ✅ (Advanced Gen-AI Detection) | ✅ | ❌ | ❌ | **BUILD — M11** |
| Skills-taxonomy depth | ⚠️ (curated) | ✅ (coding-heavy) | ✅ (broad 150+) | ⚠️ planned, narrow | **BUILD — M1.B + M12** |
| Job-description forge / JD ↔ skills auto-map | ❌ | ❌ | ❌ | ⚠️ qorium-jd-forge hint | **BUILD — M13** 🟦 wedge |
| IRT (Item Response Theory) calibration | ❌ | ❌ | ❌ | ⚠️ qorium-irt-calibration hint | **BUILD — M14** 🟦 wedge — psychometric defensibility |

### 2.2 — Trust, compliance, enterprise

| Feature | Vervoe | CoderByte | QOrium plan today | Gap action |
|---|---|---|---|---|
| ISO/IEC 27001 | ✅ | ⚠️ | ❌ | **PLAN — M15** (post-revenue) |
| GDPR | ✅ | ✅ | ⚠️ (DPDP 92/100 from Rakshak, GDPR partial) | **HARDEN — M15** |
| India DPDP Act compliance | ⚠️ | ⚠️ | ✅ (Rakshak 92/100) | **MAINTAIN** |
| Independent AI bias audit | ✅ (Holistic AI, NYC) | ❌ | ❌ | **BUILD — M16** 🟦 wedge in India (none have it) |
| Regional data residency | ✅ | ⚠️ | ⚠️ (single VPS) | **PLAN — M17** |
| SSO (SAML/OIDC) | ✅ | ✅ | ⚠️ qorium-sso hint, not live | **BUILD — M18** |
| ATS / HRIS integrations | ✅ (Greenhouse, Workday, Lever, etc.) | ✅ | ❌ | **BUILD — M19** |
| Public API + webhooks | ✅ (white-label) | ✅ | ⚠️ qorium-webhooks hint | **BUILD — M20** |
| Audit log | ✅ (enterprise) | ✅ | ⚠️ qorium-audit-log hint | **BUILD — M21** |
| SOC 2 Type II | ✅ (implied) | ✅ | ❌ | **PLAN — M22** (post-1cr ARR) |
| Priority support / SLAs | ✅ | ✅ | ❌ | **BUILD — M23** (commercial tier) |

### 2.3 — Marketing surface

| Section / play | Vervoe | CoderByte | TechCurators | QOrium today | Gap action |
|---|---|---|---|---|---|
| Hero: outcome-led headline + dual CTA | ✅ "Better talent starts with skills" | ✅ "Screen, interview, upskill" | ⚠️ ("Amazon of Assessments") | ⚠️ unknown — needs audit | **WRITE — W1** |
| Customer logos above the fold | ✅ (Tennis Australia, Dentsu, Australia Post, Lumen, Findex) | ✅ | ✅ (Amazon, IBM, Microsoft, Google, SAP, etc.) | ❌ | **BUILD — W2** (start with Talpro Customer-Zero) |
| Hard outcome stats | ✅ (67% fewer interviews, 80% better performers, 90% lower attrition) | ⚠️ | ⚠️ | ❌ | **BUILD — W3** (instrument first, then publish) |
| Product tour video / interactive demo | ✅ (autoplay nav video) | ✅ | ❌ | ❌ | **BUILD — W4** |
| Pricing page | ✅ (Enterprise-only, "Let's talk") | ✅ ("Free trial", unlimited usage anchor) | ❌ | ❌ | **BUILD — W5** |
| Assessment library landing | ✅ | ✅ | ✅ (the strongest TC page) | ❌ | **BUILD — W6** (SEO goldmine — see §3) |
| Solutions by company-type / use-case / industry | ✅ (3 axes) | ⚠️ | ❌ | ❌ | **BUILD — W7** |
| Customer stories / case studies | ✅ | ✅ | ⚠️ | ❌ | **BUILD — W8** |
| Resources hub: blog, guides, webinars, templates | ✅ (recruitment guides, JD templates, skills-gap templates, shortlisting matrix) | ⚠️ | ⚠️ (blogposts) | ❌ | **BUILD — W9** (programmatic-SEO play) |
| API docs surfaced in nav | ✅ | ✅ | ❌ | ❌ | **BUILD — W10** |
| Compare-vs pages | ✅ ("Compare Vervoe") | ⚠️ | ❌ | ❌ | **BUILD — W11** ("QOrium vs Vervoe", "vs CoderByte", "vs HackerRank", "vs Mercer Mettl") |
| LLM-info / AI overview readiness | ✅ (`/llm-info/`) | ✅ | ❌ | ❌ | **BUILD — W12** 🟦 — Indian assessment market has not done this yet |
| Trust badges (G2, Capterra, ISO, GDPR, Bias Audit) | ✅ | ⚠️ | ❌ | ❌ | **BUILD — W13** (after M15/M16 ship) |
| FAQ schema markup | ✅ | ✅ | ❌ | ❌ | **BUILD — W14** |
| Sitemap + LLMs.txt + robots hygiene | ✅ | ✅ | ⚠️ | ⚠️ Rakshak SEO 94/100, validate scope | **HARDEN — W15** |

---

## 3. POSITIONING & WEDGE

Vervoe owns *premium global enterprise skills-first*. CoderByte owns *coding-affordable unlimited*. TechCurators owns *Indian SME-curated agency service*. The white space QOrium can hold:

> **"India-built, psychometrically-defensible, AI-graded skills assessments — with the largest pre-built skill library in APAC and an independently-audited bias-free AI."**

Three wedges (none of the three competitors have all three together):

1. **IRT-calibrated scoring (M14)** — every Indian competitor reports raw score. None publish psychometric reliability per item. QOrium owns "the test that you can defend in a hiring tribunal."
2. **JD-Forge auto-mapping (M13)** — paste a JD, get an assessment in 60 seconds, calibrated to the role's actual skill weights. CoderByte and Vervoe both make you assemble; QOrium generates.
3. **Bias-audited AI grading + DPDP-native + India data residency (M15/M16/M17 stack)** — Vervoe has bias audit (NYC, US-jurisdictional). No Indian player does. Indian enterprises are about to need this for HR-AI regulation.

These three are the marketing site's spine.

---

## 4. THE BUILD — TWO TRACKS, 23 MODULES

### Track A: MARKETING SITE (qorium.online)
Owner: **Codex ARJUN** lane (Mac Mini, Strategy account `bhaskar@talproindia.com`)
Stack: existing qorium-marketing (Next.js, Tailwind, atomic-release pattern). Validate `next build` not `tsc` only.
Spec: see `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/MARKETING_SITE_IA_v1.md`.

Deliverables (W1–W15): hero rewrite, customer logos, outcome stats, product tour, pricing page, assessment library landing, solutions matrix, case studies, resources hub, API docs link, vs-pages, LLM-info, trust badges, FAQ schema, SEO hygiene pass.

### Track B: BACKEND MODULES (qorium-app + qorium-api + worker fleet)
Owner: **Codex BHIMA** lane (Mac Pro, Ops account `bhaskar@talpro.in`)
Stack: greenfield. Next.js 16.x app (apps/web) + Node/TS API workspace + Postgres (RDS-style on VPS or managed) + Redis + LiteLLM/OpenRouter for AI grading + Qwen3-Coder via tunnel for code execution sandbox. Atomic-release. No Ollama on VPS.
Spec: see `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/BACKEND_MODULES_360_v1.md`.

Deliverables (M1–M23): assessment builder, library seed, coding sandbox, job sims, AI grader, cognitive engine, video pipeline, AI chatbot screener, scheduler, live coding room, reference checking, anti-cheat, skill taxonomy, JD-Forge, IRT engine, ISO/SOC roadmap, GDPR hardening, data residency, SSO, ATS connectors, public API, audit log, support tier.

---

## 5. PHASE PLAN — DEPENDENCY-ORDERED, NO CALENDAR

Per Apex Doctrine ("no calendar timelines"), phases are gated by **exit criteria**, not dates. Each phase ends when the listed evidence is produced.

### Phase 0 — Foundation lock (this document + ratification)
Exit: CEO signs off on §3 wedge + §2 gap matrix. Project CLAUDE.md updated. QUEUE entries created. MANTHAN blueprint saved. CODEX_PENDING_* shards staged.

### Phase 1 — Core assessment loop (M1.A, M1.B seed, M2, M4 v0.1)
Exit: a user can build an assessment from a 25-skill seed library, run it against one candidate via shareable link, get AI-graded result. Talpro India = Customer Zero, internal-only.

### Phase 2 — Differentiator wedge (M13 JD-Forge v1, M14 IRT v0.1)
Exit: paste a JD, get an auto-built assessment with per-item IRT difficulty/discrimination. Internal evidence shows reliability ≥ 0.7 on at least 3 skills.

### Phase 3 — Trust shell (M11 anti-cheat, M16 bias-audit baseline, M21 audit log)
Exit: anti-cheat catches at least one realistic Gen-AI cheating attempt in test traffic. Bias-audit baseline report committed. Audit log captures all grade decisions.

### Phase 4 — Marketing site v2 (W1–W9, W12, W14, W15)
Exit: qorium.online live with hero rewrite, library landing, pricing, solutions matrix, resources hub, LLM-info, FAQ schema, Rakshak re-audit ≥ 90/100.

### Phase 5 — External pilots (first 3 paying customers)
Exit: 3 logos in production, ₹X MRR locked (CEO to set X), case-study evidence captured.

### Phase 6 — Enterprise hardening (M15 ISO/SOC, M17 residency, M18 SSO, M19 ATS, M20 API)
Exit: first enterprise design partner under contract.

### Phase 7 — Scale wedges (M6 video, M7 chatbot, M9 live coding, M10 reference, M22 SOC 2, M23 SLAs)
Exit: SOC 2 Type II report, ATS marketplace listings live (Greenhouse, Lever minimum).

---

## 6. RISKS & MITIGATIONS

| Risk | Severity | Mitigation |
|---|---|---|
| Greenfield backend rebuild blows past current 8GB VPS budget | HIGH | M1–M4 must run on existing VPS without OOM. Capacity gate: each new PM2 fork ≤150MB. Heavy AI grading offloaded to LiteLLM/Qwen3 tunnel on BHIMA. |
| AI-grading hallucination → hiring lawsuit | HIGH | M4 always returns calibration interval + reasoning trace. M16 bias audit before any external user. M21 audit log mandatory from day 1. |
| JD-Forge produces low-quality assessments → kills trust | MED | Phase 2 exit criteria gates this. Reliability ≥0.7 floor. Human-in-the-loop "edit before send" required in v1. |
| Customer-Zero (Talpro India) corner cases bias the product | MED | Phase 5 forces 3 external pilots in different segments before scaling. |
| Codex lanes collide on same files | MED | Track A = marketing only (qorium-marketing repo). Track B = app/api only (separate repos). `project_work_lock` before any shared-file mutation. |
| Constitution drift — Claude tempted to write code | HIGH | Hard rule: every code task → CODEX_PENDING_* shard. If Claude finds itself writing TypeScript, stop and route. |

---

## 7. OWNERSHIP MATRIX

| Surface | Codex BHIMA (Lane A) | Codex ARJUN (Lane B) | Claude (Brain) | CEO |
|---|---|---|---|---|
| Backend modules M1–M23 | ✅ build | — | ✅ spec, review | — |
| Marketing site W1–W15 | — | ✅ build | ✅ spec, copy, review | ✅ approve copy/wedge |
| MANTHAN blueprint upkeep | — | — | ✅ | — |
| Rakshak re-audit per phase exit | ✅ run | — | ✅ interpret | ✅ approve GO/NO-GO |
| QUEUE / task_plan updates | ✅ (per-phase) | ✅ (per-phase) | ✅ (cross-phase) | — |
| Founder-only actions: Razorpay LIVE keys, domain DNS, SOC auditor selection | — | — | ✅ consolidated `founder_request` | ✅ execute |

---

## 8. DECISION SCORECARD (per CTO Constitution P1–P5)

| Dimension | Weight | Score (1–5) | Weighted |
|---|---|---|---|
| Security & Data Protection | 30% | 4 | 1.20 |
| Cost Effectiveness | 25% | 5 (free Codex 20× lanes × 2, no API spend on bulk code) | 1.25 |
| Revenue Impact | 20% | 5 (this is the core monetizable product) | 1.00 |
| Performance & Reliability | 15% | 4 (greenfield = fresh budget, but VPS-constrained) | 0.60 |
| Simplicity & Maintainability | 10% | 3 (23 modules is large; phasing mitigates) | 0.30 |
| **Total** | | | **4.35 / 5 → APPROVE** |

---

## 9. EVIDENCE & NEXT ACTION

- **MANTHAN session:** `9194eed8` (started 2026-05-31)
- **Gap matrix:** §2 above + `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/GAP_ANALYSIS_2026-05-31.md`
- **Marketing site IA:** `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/MARKETING_SITE_IA_v1.md`
- **Backend modules:** `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/BACKEND_MODULES_360_v1.md`
- **Codex Lane A (BHIMA) handoff:** `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_A_BHIMA.md`
- **Codex Lane B (ARJUN) handoff:** `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_B_ARJUN.md`
- **Source crawls:** Vervoe homepage + pricing, CoderByte (saved full HTML), TechCurators homepage + skill-library, Brainstack homepage (excluded).

**Next action (CEO):** approve §3 wedge + §5 phase order. On approval, BHIMA and ARJUN begin Phase 1 in parallel.

**Next action (Claude):** save MANTHAN blueprint, write QUEUE entries, set memory, save session state.
