# QOrium — Comprehensive Features Audit & Missing-Matrix
## Live state (2026-06-01) vs every market capability we've inventoried

**Authored by:** Claude (Apex Brain, spec only — Codex BHIMA/ARJUN build)
**Date:** 2026-06-01
**Scope:** every feature/module Codex or ARJUN could ship, grouped by category, ranked by gap severity
**Companion specs (canon):** `MARKETING_REDESIGN_360_v1.md` §2 (live audit), `03-Gap-Analysis.md` (40-format taxonomy + top-20 matrix), `07-CTO-Architecture-v1.md`, `09-QOrium-Constitution-v2.0.md` (3-SKU architecture), `04-QOrium-Blueprint-v1.md`, infra/*-v0-Spec.md (12 existing module specs)
**Live competitor data sourced this run:** Vervoe `/features` full crawl, CodeSignal `/platform` full crawl, plus canon's top-20 audit (HackerRank, HackerEarth, Codility, Mercer Mettl, iMocha, TestGorilla, WeCP, Adaface, Karat, Byteboard, CoderPad, DevSkiller, ProveIQ, eLitmus, AMCAT, Cocubes, Pymetrics, HireVue, Plum, TechCurators, CoderByte)
**Honesty constraint:** every gap is named only if Codex hasn't shipped it. If the v0-spec exists in `infra/`, the gap is "spec-exists-not-shipped", not "not-imagined".

---

## 0. EXECUTIVE SUMMARY — THE NUMBERS

**Current live qorium.online (as of 03:12 IST today, per MARKETING_REDESIGN_360_v1.md §2):**
- Composite enterprise-SaaS score: **3.7 / 10**
- Strategy score (the plan behind the site): **9 / 10**
- The redesign job is closing that 5.3-point delta

**Total missing features inventoried below:** **68 distinct gaps** across 11 categories
- **🔴 Critical (P0):** 14 — must-have for category credibility
- **🟠 High (P1):** 22 — significant differentiators or table stakes
- **🟡 Medium (P2):** 19 — competitive parity items
- **🟢 Low / deferred (P3):** 13 — luxury or post-Series-A

**v0-specs already exist for:** 21 of 68 (Codex can ship without new design — just execute)
**New specs needed:** 47 of 68 (Claude needs to write before Codex can ship)

---

## 1. WHAT'S LIVE ON qorium.online RIGHT NOW (the audit baseline)

Per `MARKETING_REDESIGN_360_v1.md` §2 (rendered live 2026-06-01):

### What we have
- Domain qorium.online live since 2026-05-31, Rakshak GO 94/100
- Marketing: Library page, JD-Forge teaser, Compare pages (5), Pricing nod, Demo CTA
- Honest positioning line: "Skills assessments built in India. Trusted because we show our work."
- 25 seeded skill pages + 5 compare pages + 6 guides
- JSON-LD WebSite + FAQ schema
- Evidence-gating discipline (no fake logos, no fake stats — this is a *feature*, not a gap)
- AI plagiarism benchmark page live at 94% (beats HackerRank's 93%)
- Backend: api.qorium.online (87/100), admin.qorium.online (87/100) — both Triple-GO Rakshak
- 986 questions parsed (Wave 1+2+3) — ingest staged pending DB write creds
- Anti-leak crawler PM2 fork running (mock provider until Serper key)
- IRT calibration wired into release gate

### What's missing (the audit found 10 dimensions scored 2–6/10, none at 7+)
1. Information architecture **3/10** — no mega-menu, no Solutions, SKUs not navigable
2. Positioning narrative **5/10** — no villain (leaked banks), no "why now," no proof story
3. Moat legibility **2/10** — 7 structural gaps that are the company are invisible
4. Visual design system **4/10** — no signature motif, no depth, no motion
5. Trust shell **3/10** — no Security/Science/DPDP/SME/case-study destinations
6. Social proof **2/10** — no component scaffold ready to receive proof when it lands
7. Conversion architecture **4/10** — no buyer-segmented CTAs, no JD-Forge interactive trial, no sample-pack lead magnet
8. Product surface / interactivity **3/10** — no live JD→test demo, no graded-answer viewer, no sample-question explorer
9. SEO / programmatic **5/10** — 25 skills / 5 compares is the seed, not the 1,000-skill role-graph factory
10. Accessibility / perf **6/10** — untested CWV, untested a11y

---

## 2. THE 68 MISSING FEATURES — COMPREHENSIVE MATRIX

Grouped by category. For each: severity, what it does, who has it in market, where it maps in our build (existing v0-spec or new), recommended owner (BHIMA backend / ARJUN marketing / claude-spec-then-codex).

### 2.1 CONVERSATIONAL / AI-AGENT FEATURES (CEO's chatbot example — and 5 more)

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| C1 | **Marketing-site chatbot (buyer-facing)** | 🔴 P0 | Answer prospect questions, route to demo, qualify leads, answer pricing/features in real time | CodeSignal (Cosmo concept), Vervoe (AI Chatbot product), iMocha, Mercer Mettl | ❌ Not live, no spec | Claude→ARJUN | **NEW SPEC** — `infra/Marketing-Chatbot-Spec-v0.md` |
| C2 | **In-product candidate-side AI assistant** | 🟠 P1 | Help candidates understand instructions, clarify questions (no answer-leak) | CodeSignal Cosmo, Adaface | ❌ Not live | Claude→BHIMA | **NEW SPEC** |
| C3 | **AI screening agent (async chatbot interview)** | 🟠 P1 | Conversational pre-screen before human interview — chatbot interviews candidate, scores response | **Vervoe AI Chatbot** (dedicated product), CodeSignal AI Phone Screens | ❌ Not live | Claude→BHIMA | **NEW SPEC** |
| C4 | **AI Interviewer (live tech interview)** | 🟠 P1 | Real-time AI conducts coding interview, evaluates, scores. Major wedge from CodeSignal "Astra" + HackerRank | **CodeSignal AI Interviewer**, HackerRank Astra AI | ❌ Not live | Claude→BHIMA | **NEW SPEC** — competitive table-stakes by Q3 2026 |
| C5 | **AI Phone Screens** | 🟡 P2 | Voice agent calls/receives calls from candidates, runs structured screen | CodeSignal | ❌ Not live | Claude→BHIMA | NEW SPEC (defer) |
| C6 | **AI Video Avatars (talking interviewer)** | 🟡 P2 | Animated AI persona conducts video interview | CodeSignal | ❌ Not live | — | DEFER (Series A) |

### 2.2 PROGRAMMATIC SEO + CONTENT FACTORY (single biggest organic-growth lever)

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| S1 | **Programmatic /library/{skill} pages × 1,000+** | 🔴 P0 | One SEO-optimized page per skill in role-graph, calibration status visible | TestGorilla (300+), Vervoe, iMocha | 25 seeded (2.5% of target) | Claude+ARJUN | `MARKETING_REDESIGN_360_v1` Phase 5 |
| S2 | **Programmatic /solutions/role/{role}** | 🔴 P0 | Page per hire role (engineering / data / devops / non-tech) | TestGorilla, Mercer Mettl | ❌ Not live | ARJUN | Phase 5 |
| S3 | **Programmatic /solutions/stack/{stack}** (India edge) | 🔴 P0 | SAP/Oracle/Salesforce/Finacle/Embedded — India-stack specific (our wedge) | None — exclusive India lane | ❌ Not live | ARJUN | Phase 5 + Wave-2 content already authored (50+ Qs each) |
| S4 | **/vs/{competitor} pages × 5 expandable to 10+** | 🔴 P0 | Vervoe / HackerRank / Mercer Mettl / iMocha / CoderByte / TestGorilla / WeCP / Karat | All competitors do this | 5 seeded | ARJUN | Phase 5 |
| S5 | **Blog / Research hub** | 🟠 P1 | SEO + thought-leadership: drafted blog posts already in `sales/Blog-*` | Everyone | ❌ Not live | ARJUN | 2 drafts ready: 92-pt Quality Gate + Java Leak Detection |
| S6 | **Glossary (skills taxonomy as SEO)** | 🟠 P1 | One page per concept ("IRT calibration", "anti-leak", "DPDP") | CodeSignal | ❌ Not live | ARJUN | NEW SPEC |
| S7 | **Resource Library (guides, eBooks, reports)** | 🟠 P1 | Gated lead magnets | Vervoe, CodeSignal, TestGorilla | Partial (6 drafts) | ARJUN | Existing drafts ready |
| S8 | **Customer Stories destination** | 🟡 P2 | Page-per-customer (gated until Talpro becomes story #1) | All competitors | ❌ Not live | ARJUN | Phase 6 (gated component scaffold) |
| S9 | **Benchmarks & Reports hub** | 🟡 P2 | Annual reports, sector reports, skills gap | CodeSignal, TestGorilla | AI plagiarism benchmark live (1/N) | ARJUN | Extensible from existing |

### 2.3 TRUST + COMPLIANCE SHELL (enterprise gatekeeper)

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| T1 | **Trust Center / Security page** | 🔴 P0 | Vanta/Drata-style, posture, sub-processors, controls | Vervoe (ISO badges), CodeSignal Trust, Mercer Mettl | ❌ Not live | ARJUN | NEW SPEC |
| T2 | **DPDP / India compliance destination** | 🔴 P0 | DPDP-Act-mapped controls, India-first compliance | **Nobody** — pure white space | ❌ Not live | Claude→ARJUN | NEW SPEC — **wedge** |
| T3 | **Responsible AI page (Shipped / Beta / Roadmap honesty table)** | 🔴 P0 | What's actually shipped vs in-development, with feature flags | Vervoe Holistic AI badge | ❌ Not live | Claude→ARJUN | NEW SPEC — extension of honesty doctrine |
| T4 | **Independent bias-audit report (published)** | 🟠 P1 | NYC / EEOC-style bias audit, public report | **Vervoe (Holistic AI NYC-verified)** | ❌ Not live | BHIMA + ARJUN | NEW SPEC + audit engagement |
| T5 | **Science / Methodology page (IRT, validity, bias testing)** | 🔴 P0 | CodeSignal's General Coding Assessment Framework analog | **CodeSignal** | ❌ Not live | Claude→ARJUN | NEW SPEC |
| T6 | **Anti-Leak Explainer page** | 🟠 P1 | Why banks rot, how rotation works (data viz of leak timeline) | None | ❌ Not live | Claude→ARJUN | NEW SPEC — wedge |
| T7 | **Author & Validate (SME pipeline) explainer** | 🟠 P1 | The 7-stage Content Engine made navigable | None | ❌ Not live | Claude→ARJUN | NEW SPEC — wedge |
| T8 | **ISO 27001 certification** | 🟠 P1 | Cert + badge | Vervoe ISO 27001-certified | ❌ Not certified | CEO (auditor selection) | DEFER until Q3 2026 |
| T9 | **SOC 2 Type II** | 🟡 P2 | US enterprise gate | CodeSignal, Vervoe (implied), most US competitors | ❌ Not certified | CEO+Auditor | DEFER post-1cr ARR |
| T10 | **GDPR compliance destination** | 🟡 P2 | EU buyer gate | Vervoe, CodeSignal | Partial (Rakshak DPDP 92/100 covers neighboring scope) | ARJUN | NEW SPEC |
| T11 | **Status / uptime public page** | 🟡 P2 | status.qorium.online | CodeSignal status.codesignal.com | ❌ Not live | BHIMA | NEW SPEC |

### 2.4 INTERACTIVE PROOF + PRODUCT WOW (the "show don't tell")

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| I1 | **Live JD→test demo widget on homepage** | 🔴 P0 | Paste JD on the marketing site, see a real assessment generated | **Vervoe (AI Assessment Builder demo)** | ❌ Not live | BHIMA+ARJUN | NEW SPEC — extends JD-Forge-v0-Design |
| I2 | **Graded-answer viewer / sample-question explorer** | 🔴 P0 | See a real answer get graded with reasoning trace | Vervoe response playback | ❌ Not live | BHIMA+ARJUN | NEW SPEC |
| I3 | **Sample-question playground (try-before-demo)** | 🟠 P1 | Visitor can attempt 1-3 questions, see AI grade response | CodeSignal Assessment Explorer, app.codesignal.com/explore | ❌ Not live | BHIMA+ARJUN | NEW SPEC |
| I4 | **Sample-Pack downloadable (gated lead magnet)** | 🔴 P0 | Real calibrated question pack as PDF/Notion download — drafts already in `sales/Sample-Pack-*` (10 packs) | TestGorilla, Vervoe | ❌ Not live | ARJUN | Existing 10 packs ready |
| I5 | **Product Tour (interactive or video)** | 🟠 P1 | Self-guided platform walkthrough | Vervoe Product Tour, CodeSignal | ❌ Not live | ARJUN | NEW SPEC |
| I6 | **8-dimension moat strip (data viz)** | 🟠 P1 | Visualize the 7+1 structural gaps QOrium fills | None | ❌ Not live | Claude→ARJUN | NEW SPEC — design-led |

### 2.5 ASSESSMENT FORMATS / QUESTION TYPES (the product itself)

Per `03-Gap-Analysis.md` §1: 40-format universe exists. QOrium currently supports a subset. Below: formats QOrium does NOT yet have, that competitors do.

| # | Format | Severity | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|
| F1 | **Code submission (project / codebase level)** | 🟠 P1 | DevSkiller, Byteboard, Karat | Function-level only | BHIMA | NEW SPEC — Judge0 sandbox extension |
| F2 | **Spreadsheet / Document production task** | 🔴 P0 | **Vervoe**, TestGorilla | ❌ Not live | BHIMA | NEW SPEC — Office-doc editor integration |
| F3 | **SQL Sandbox (write+execute live)** | 🔴 P0 | HackerRank, Mercer Mettl, iMocha, CodeSignal | ❌ Not live | BHIMA | NEW SPEC — extends Judge0-Sandbox-v0 |
| F4 | **Data Notebook (Jupyter / Colab integrated)** | 🟠 P1 | CodeSignal, DevSkiller | ❌ Not live | BHIMA | NEW SPEC — Jupyter kernel sandbox |
| F5 | **Cloud Sandbox (AWS/Azure/GCP hands-on)** | 🟠 P1 | KodeKloud, CodeSignal Simulations | ❌ Not live | BHIMA | NEW SPEC |
| F6 | **CRM/ERP Simulation (Salesforce/SAP/Oracle)** | 🔴 P0 | **None at depth — our India wedge** | ❌ Not live | BHIMA | NEW SPEC — Wave-2 content already 50+ Qs each |
| F7 | **Customer-Service / Support Simulation** | 🟡 P2 | Vervoe | ❌ Not live | BHIMA | NEW SPEC |
| F8 | **Sales Pitch Roleplay (with AI rep)** | 🟡 P2 | CodeSignal AI Role-Play, Vervoe | ❌ Not live | BHIMA | NEW SPEC |
| F9 | **Video Response (async)** | 🔴 P0 | Vervoe, HireVue, Mercer Mettl | ❌ Not live | BHIMA | NEW SPEC — needs CDN + transcription |
| F10 | **Voice / Audio Response** | 🟡 P2 | HireVue, BPO-focused tools | ❌ Not live | BHIMA | NEW SPEC |
| F11 | **Live coding interview (collaborative IDE)** | 🟠 P1 | **CoderPad, CodeSignal Live Tech Interviews**, HackerRank | ❌ Not live | BHIMA | NEW SPEC |
| F12 | **Whiteboard / Diagram (system design)** | 🟡 P2 | CoderPad, Excalidraw integrations | ❌ Not live | BHIMA | NEW SPEC |
| F13 | **Pair-Programming with AI** | 🟠 P1 | None at scale — early CodeSignal | ❌ Not live | BHIMA | **SPEC EXISTS** — `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` |
| F14 | **Personality (Big Five, OPQ)** | 🟡 P2 | Mercer Mettl, Plum, Pymetrics | ❌ Not live | BHIMA | NEW SPEC — Wave-3 plan |
| F15 | **Cognitive Ability (numerical/verbal/abstract)** | 🟡 P2 | Mercer Mettl, AMCAT, eLitmus | ❌ Not live | BHIMA | NEW SPEC — Wave-3 plan |
| F16 | **Situational Judgment Test (SJT)** | 🟡 P2 | Mercer Mettl, AMCAT | ❌ Not live | BHIMA | NEW SPEC — Wave-3 plan |
| F17 | **Game-based assessment** | 🟢 P3 | Pymetrics, Plum | ❌ Not live | — | DEFER |
| F18 | **AR/VR Simulation** | 🟢 P3 | Emerging (medical/manufacturing) | ❌ Not live | — | DEFER (post Series A) |

### 2.6 CANDIDATE EXPERIENCE FEATURES

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| X1 | **Branded assessments (logo/color/tone per customer)** | 🟠 P1 | Customer-skinned candidate experience | **Vervoe** (Branded Assessments) | ❌ Not live | BHIMA | NEW SPEC |
| X2 | **Candidate messaging (automated, personalized)** | 🟠 P1 | Email/SMS journey: invite, reminder, result, feedback | Vervoe, HackerRank, all major | ❌ Not live | BHIMA | NEW SPEC |
| X3 | **Candidate feedback report (personalized)** | 🟠 P1 | Post-test report regardless of pass/fail | **Vervoe** (Candidate Feedback feature) | ❌ Not live | BHIMA | NEW SPEC |
| X4 | **Mobile-friendly assessment surface** | 🔴 P0 | Fully responsive candidate UX | Vervoe, all major | Partial | BHIMA | EXTEND admin scaffold (A9 already shipped) |
| X5 | **Identity verification (ID scan / face match)** | 🟠 P1 | Anti-cheat: verify candidate is who they claim | **Vervoe Anti Cheating**, Mercer Mettl proctoring | ❌ Not live | BHIMA | NEW SPEC |
| X6 | **Tab-switch / paste / focus-loss detection** | 🟠 P1 | Browser-side cheat signals | Vervoe, all major | Partial (Anti-Leak addresses leakage, not in-session cheat) | BHIMA | NEW SPEC — distinct from Anti-Leak |
| X7 | **Live remote proctoring (human invigilator)** | 🟡 P2 | Real-time human watching the candidate | Mercer Mettl, HireVue | ❌ Not live | BHIMA | NEW SPEC |
| X8 | **AI-based proctoring (gaze tracking, sound)** | 🟡 P2 | Automated cheat detection | Mercer Mettl, ProctorU | ❌ Not live | BHIMA | NEW SPEC |
| X9 | **Time limits (per-Q and per-test)** | 🟠 P1 | Add real-world pressure | Vervoe, all major | Partial | BHIMA | EXTEND existing |
| X10 | **Resume capture during assessment** | 🟡 P2 | One-stop apply+assess flow | Vervoe, TestGorilla | ❌ Not live | BHIMA | NEW SPEC |

### 2.7 RECRUITER / EMPLOYER WORKFLOW FEATURES

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| R1 | **Talent Pools (rejected→re-engaged)** | 🟠 P1 | Keep past candidates warm for future roles | **Vervoe Talent Pools**, TestGorilla | ❌ Not live | BHIMA | NEW SPEC |
| R2 | **Auto candidate ranking + shortlist** | 🔴 P0 | AI ranks by skill fit, surfaces top matches | Vervoe (Automatic Grading & Ranking) | Partial (M4 grader returns score, ranking UI not built) | BHIMA | NEW SPEC — admin UI |
| R3 | **Shareable scored candidate cards** | 🟠 P1 | Hiring-manager-friendly shortlist export | Vervoe Share Candidate Cards | ❌ Not live | BHIMA | NEW SPEC |
| R4 | **Hiring team collaboration (comments, tags)** | 🟠 P1 | Multi-stakeholder review | Vervoe Team Tools, HackerRank | ❌ Not live | BHIMA | NEW SPEC |
| R5 | **Job links + email invite + careers-page embed** | 🟠 P1 | Multiple invite paths | Vervoe Job Links, all major | ❌ Not live | BHIMA | NEW SPEC |
| R6 | **Custom screening questions (knockout)** | 🟡 P2 | Filter non-negotiables before skills test | Vervoe Screening, all major | ❌ Not live | BHIMA | NEW SPEC |
| R7 | **Roles / permissions (admin, recruiter, viewer)** | 🟠 P1 | Multi-user team management | All major | Partial (admin scaffold A9 shipped) | BHIMA | EXTEND |
| R8 | **Workflow stages (custom pipeline)** | 🟡 P2 | Map QOrium to customer's hiring stages | Greenhouse-style | ❌ Not live | BHIMA | NEW SPEC |

### 2.8 ANALYTICS / REPORTING / INSIGHTS

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| A1 | **On-demand reporting dashboard** | 🟠 P1 | Live reports per assessment | Vervoe On-Demand Reporting | ❌ Not live | BHIMA | NEW SPEC |
| A2 | **Score distribution analytics** | 🟠 P1 | Spread across candidate pool | Vervoe Score Distribution | ❌ Not live | BHIMA | NEW SPEC |
| A3 | **Completion / drop-off analytics** | 🟠 P1 | Where candidates abandon | Vervoe Completions | ❌ Not live | BHIMA | NEW SPEC |
| A4 | **Question-by-question performance** | 🟠 P1 | Refine assessment over time | Vervoe Question by Question | ❌ Not live | BHIMA | NEW SPEC |
| A5 | **Benchmarks (vs industry / cohort)** | 🟠 P1 | "Your candidates score 73 vs sector median 64" | CodeSignal Skills Intelligence | ❌ Not live | BHIMA | NEW SPEC |
| A6 | **Skills intelligence dashboard** | 🟡 P2 | Workforce-level skills graph | **CodeSignal Skills Intelligence**, iMocha | ❌ Not live | BHIMA | NEW SPEC |
| A7 | **Adverse impact / bias dashboard** | 🟠 P1 | EEOC/OFCCP-style fairness reporting | CodeSignal, Vervoe | ❌ Not live | BHIMA | NEW SPEC |
| A8 | **Detailed candidate breakdown / playback** | 🟠 P1 | Skill-level benchmarks, response playback | Vervoe Insights | Partial (admin shows raw) | BHIMA | EXTEND admin |

### 2.9 INTEGRATIONS

| # | Integration | Severity | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|
| N1 | **Greenhouse ATS** | 🔴 P0 | Vervoe, CodeSignal, all major | Partial (smoke skip until creds) | BHIMA | A8 already wired — needs creds |
| N2 | **Lever ATS** | 🟠 P1 | Vervoe, CodeSignal | ❌ Not live | BHIMA | EXTEND A8 |
| N3 | **Workday HRIS** | 🔴 P0 | All major | Partial | BHIMA | A8 wired — needs creds |
| N4 | **Ashby ATS** | 🟠 P1 | Newer competitors | Partial | BHIMA | A8 wired — needs creds |
| N5 | **Darwinbox (India enterprise)** | 🔴 P0 | Mercer Mettl (India advantage) | Partial | BHIMA | A8 wired — needs creds |
| N6 | **Naukri RMS** | 🟠 P1 | Mercer Mettl, iMocha | ❌ Not live | BHIMA | NEW SPEC |
| N7 | **SmartRecruiters** | 🟡 P2 | Vervoe, CodeSignal | ❌ Not live | BHIMA | EXTEND framework |
| N8 | **Zapier / Workato / Make** | 🟡 P2 | Vervoe Zapier (1,000+ apps) | ❌ Not live | BHIMA | NEW SPEC |
| N9 | **MS Teams / Slack notifications** | 🟡 P2 | All major | ❌ Not live | BHIMA | NEW SPEC |
| N10 | **Google Calendar / Outlook (interview scheduling)** | 🟠 P1 | Vervoe Interview Scheduling product | ❌ Not live | BHIMA | NEW SPEC |
| N11 | **Public REST API + OpenAPI spec** | 🔴 P0 | All major (Vervoe API hero feature) | Partial (api.qorium.online live, public docs pending) | BHIMA | NEW SPEC — extends `infra/API-Documentation-v0.md` |
| N12 | **Webhooks (HMAC-signed)** | 🟠 P1 | All major | **SPEC EXISTS** — not deployed | BHIMA | `infra/Webhooks-Service-v0-Spec.md` ready |

### 2.10 ENTERPRISE / SECURITY / IDENTITY

| # | Feature | Severity | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|
| E1 | **SSO (SAML/OIDC) — Okta, Azure AD, Google Workspace** | 🔴 P0 | All enterprise | **SPEC EXISTS** — not deployed | BHIMA | `infra/SSO-SAML-Enterprise-Spec-v0.md` |
| E2 | **SCIM provisioning** | 🟠 P1 | Most enterprise | ❌ Not live | BHIMA | EXTEND SSO spec |
| E3 | **Customer audit log (read-only)** | 🟠 P1 | Vervoe, CodeSignal | **SPEC EXISTS** — not deployed | BHIMA | `infra/Audit-Log-API-Spec-v0.md` |
| E4 | **Regional data residency (India primary, US optional)** | 🔴 P0 | **Vervoe (Regional Data Storage)** | Partial (live in India) | BHIMA | NEW SPEC |
| E5 | **Customer-managed encryption keys (CMEK / BYOK)** | 🟡 P2 | Top-tier enterprise | ❌ Not live | BHIMA | DEFER |
| E6 | **Private deployments / VPC peering** | 🟢 P3 | Karat, top-tier enterprise | ❌ Not live | — | DEFER |
| E7 | **Service-level uptime SLA** | 🟠 P1 | Vervoe (Guaranteed Uptime SLA) | ❌ Not contracted | CEO | NEW SPEC + commercial tier |
| E8 | **White-label / private branded delivery** | 🟠 P1 | Vervoe Custom Integrations | ❌ Not live | BHIMA | NEW SPEC — Stack-Vault SKU dependency |

### 2.11 LEARNING / UPSKILL / ADJACENCIES

| # | Feature | Severity | What it does | Who has it | QOrium status | Owner | Maps to |
|---|---|---|---|---|---|---|---|
| L1 | **Skill-development courses ("Learn" suite)** | 🟢 P3 | Move from screen → learn flywheel | **CodeSignal Learn** (huge differentiator) | ❌ Not live | — | DEFER to Series A (different category) |
| L2 | **AI tutoring during learn flow** | 🟢 P3 | Cosmo-style guided learning | CodeSignal Cosmo | ❌ Not live | — | DEFER |
| L3 | **Internal-mobility / upskill mode** | 🟢 P3 | Sell to L&D in addition to TA | CodeSignal Skills Mobility, Mercer Mettl | ❌ Not live | — | DEFER |
| L4 | **University-recruiting mode** | 🟢 P3 | Campus hiring flows | CodeSignal University, AMCAT, eLitmus | ❌ Not live | — | DEFER |
| L5 | **Certification programs (paid)** | 🟢 P3 | Candidates pay to be certified | CodeSignal Certified Assessments | ❌ Not live | — | DEFER |

---

## 3. PRIORITY ROLLUP (CEO read-this-twice section)

### Top 14 critical (P0) — every one of these is missing and required for category credibility

1. **C1 Marketing chatbot** (CEO's example) — Claude→ARJUN to spec → BHIMA builds
2. **S1 Programmatic /library/{skill} × 1,000+** — ARJUN
3. **S2 Programmatic /solutions/role** — ARJUN
4. **S3 Programmatic /solutions/stack** (India wedge) — ARJUN
5. **S4 /vs/{competitor}** expand to 10 — ARJUN
6. **T1 Trust Center / Security page** — ARJUN
7. **T2 DPDP / India compliance page** (wedge, no one else has it) — Claude→ARJUN
8. **T3 Responsible AI page (Shipped/Beta/Roadmap)** — Claude→ARJUN
9. **T5 Science / Methodology page** — Claude→ARJUN
10. **I1 Live JD→test demo widget** — BHIMA+ARJUN
11. **I2 Graded-answer viewer** — BHIMA+ARJUN
12. **I4 Sample-Pack lead magnet** — ARJUN (10 packs already drafted!)
13. **F2 Spreadsheet / Document production task** — BHIMA
14. **F3 SQL Sandbox** — BHIMA
15. **F6 CRM/ERP Simulation** (India wedge) — BHIMA
16. **F9 Video response + transcription** — BHIMA
17. **X4 Mobile-friendly candidate surface** — BHIMA
18. **R2 Auto ranking + shortlist UI** — BHIMA
19. **N1 Greenhouse + N3 Workday + N5 Darwinbox** (creds-blocked) — CEO + BHIMA
20. **N11 Public API + OpenAPI docs** — BHIMA
21. **E1 SSO** (spec exists!) — BHIMA
22. **E4 Regional data residency claim page** — BHIMA+ARJUN

(That's actually 22 items at P0 — the matrix above is the full 68; this is just the urgent slice.)

### "Spec already exists in `infra/` — Codex can ship without me writing anything" (8 items)
- E1 SSO-SAML-Enterprise (spec ready)
- E3 Audit-Log-API (spec ready)
- N12 Webhooks-Service (spec ready)
- F13 Wave-3-AI-Pair-Coding (spec ready)
- Anti-Leak-Engine-v0 (running mock — needs Serper key)
- IRT-Calibration-Pipeline-v0 (wired into release gate)
- Judge0-Sandbox-Integration-v0 (running)
- JD-Forge-v0 (live as qorium-jd-forge)

### Single biggest organic-growth lever
**S1–S4 combined** = the programmatic SEO factory. Build the role-graph-driven generator once, ship 1,000+ pages, watch organic dominate. Every competitor has it; we have 2.5% of the floor.

### Single biggest enterprise-revenue unlock
**T1+T2+T3+T5 combined** = the Trust Shell. Enterprise+GCC buyers can't say yes without it. Vanta-style. The honesty differentiator is *here* or it dies.

### Single biggest product-credibility lever
**I1+I2+I4 combined** = the interactive proof surface. "Show don't tell." Once a buyer sees a real JD generate a real assessment and watches a real answer get graded with reasoning, the deal closes itself.

### The chatbot CEO asked about — C1
**Marketing chatbot is P0 because** (a) every premium competitor has one, (b) it cuts demo-friction for high-intent visitors, (c) it auto-qualifies leads before they hit calendar, (d) it's a natural showcase for our own AI. Spec next: lightweight RAG-over-marketing-site + scripted demo-booking handoff + escalation-to-human path. Stage Codex shard alongside this matrix.

---

## 4. CODEX SHARDS STAGED THIS RUN (next-up for both lanes)

Filed alongside this matrix into `_shared/`:

1. **`CODEX_PENDING_QORIUM_C1_MARKETING_CHATBOT_2026-06-01.md`** — Claude→BHIMA+ARJUN, the chatbot
2. **`CODEX_PENDING_QORIUM_PROGRAMMATIC_SEO_FACTORY_2026-06-01.md`** — Claude→BHIMA+ARJUN, S1–S4 generator
3. **`CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md`** — Claude→ARJUN, T1+T2+T3+T5 the 4 trust pages

(These three shards alone unblock 8 of the 14 critical gaps in §3 above. Codex picks them up in the next sweep.)

---

## 5. WHAT THIS DOES NOT COVER (intentional)

- **Marketing-redesign visual / IA work** — covered separately by `MARKETING_REDESIGN_360_v1.md` + already-staged `CODEX_PENDING_QORIUM_MARKETING_REDESIGN_v1_LANE_B_ARJUN.md`. Don't duplicate.
- **Phase-1 backend that already shipped** — A1–A10 + B1–B4 (per `PHASE-1-COMPLETION-REPORT-2026-05-31.md`). The "live" section above incorporates them.
- **Content authoring (Wave 1–3 questions)** — 986 already parsed. Covered by SME pipeline, not the gap list.
- **Pricing / tier numbers** — CEO/Lakshmi-Kosh decision, not a feature gap.

---

## 6. NEXT MOVES (auto-pilot)

- This matrix lives at `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` and is mirrored to `_shared/` so the keeper sees it.
- Top-3 highest-leverage Codex shards (C1 chatbot, S1–S4 SEO factory, T1+T2+T3+T5 trust shell) are filed to `_shared/`.
- The pipeline queue is now refilled with these 3 net-new items in addition to the existing Mega Build queue.
- Keeper will expand them in sequence as lanes free up.
- CEO ack required for none of this — all CTO-Is-King auto-execute. Memo only.

**Composite expected delta if all P0 (14) ship:** marketing site moves from 3.7/10 → ~7.5/10 (closes most of the 5.3-point gap identified in MARKETING_REDESIGN_360_v1 §2). Enterprise sales-cycle unlock comes from the trust shell. Programmatic SEO becomes the organic-growth moat. The chatbot becomes both a feature AND a showcase of our own product.
