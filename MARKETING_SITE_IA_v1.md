# QOrium Marketing Site IA v1.0

**Domain:** qorium.online
**Repo:** qorium-marketing (PM2 service `qorium-marketing`, currently online)
**Owner lane:** Codex ARJUN (Mac Mini, account `bhaskar@talproindia.com`)
**Companion:** QORIUM_MEGA_BUILD_v1.0.md §4 (Track A), W1–W15 deliverables

This spec is information-architecture + copy direction. It is not pixel design. UI Design Bible (`_shared/TALPRO-UI-DESIGN-BIBLE.md`) governs visual treatment. No purple-gradient-on-white. No Inter/Roboto. No MUI/Ant/Chakra.

---

## 1. SITEMAP

```
/                                   Home (W1–W4 + W13)
/product
  /assessment-builder              (W6 product page — builder)
  /assessment-library              (W6 — flagship SEO surface)
  /ai-grading                      (M4 product page — IRT-backed pitch)
  /job-simulations                 (M3 product page)
  /jd-forge                        (M13 product page — WEDGE)
  /ai-screening-chatbot            (M7 product page — WEDGE)
  /anti-cheating                   (M11 product page)
  /interview-scheduling            (M8)
  /reference-checking              (M10)
  /api                             (W10 — API marketing landing)
/solutions
  /by-company-type
    /enterprise
    /startup
    /smb
  /by-use-case
    /high-volume-hiring
    /technical-screening
    /campus-hiring
    /lateral-hiring
    /internal-mobility
  /by-industry
    /it-services-staffing          (Talpro Customer-Zero showcase)
    /bfsi
    /healthcare
    /retail-and-ecommerce
    /it-product
    /gcc-global-capability-centers
/pricing                            (W5)
/customers                          (W8 — case studies index)
  /customer/:slug                  (case study detail; seed: talpro-india)
/compare
  /qorium-vs-vervoe                 (W11)
  /qorium-vs-coderbyte              (W11)
  /qorium-vs-hackerrank             (W11)
  /qorium-vs-mercer-mettl           (W11)
  /qorium-vs-imocha                 (W11)
  /qorium-vs-hireselect             (W11)
/resources
  /blog
  /blog/:slug
  /guides
    /skills-testing
    /how-to-evaluate-ai-hiring-vendors
    /recruitment-plan-template
    /skills-gap-analysis-template
    /shortlisting-matrix-template
  /webinars
  /job-descriptions
  /job-descriptions/:slug           (programmatic-SEO; one per role)
  /skill                            (programmatic-SEO; one per skill in library)
  /skill/:slug
/trust
  /security
  /privacy
  /dpdp-act-compliance
  /gdpr
  /bias-audit                       (W13 — after M16)
  /uptime
  /sub-processors
/about
/careers
/contact
/demo                               (booking flow)
/llm-info                           (W12 — LLM-readable plain-text product brief)
/sitemap.xml
/robots.txt
/llms.txt                           (W12)
```

**Programmatic-SEO surfaces** (W9): `/job-descriptions/:slug` and `/skill/:slug` — generated from the same skill taxonomy that powers the Assessment Library (TC list of ~150 skills is the floor for skills; ~200 job-description templates target the most-searched roles in India).

---

## 2. HOMEPAGE — SECTION-BY-SECTION (W1, W2, W3, W4, W13)

### Section 1 — Hero (W1)
**Headline (copy direction, not final):** "Skills assessments built in India. Trusted because we show our work."
**Sub:** "AI-graded. IRT-calibrated. DPDP-native. The only Indian skills platform that publishes its psychometric reliability."
**Primary CTA:** "See the Assessment Library" → `/product/assessment-library`
**Secondary CTA:** "Book a 20-min demo" → `/demo`
**Hero visual:** product screenshot of an in-progress assessment in the builder, with a Reliability badge visible on a question card.

### Section 2 — Customer logos (W2)
Above the fold. Start with Talpro India as the founding customer ("Built for Talpro India. Built by Talpro India."). Open slots for 5 more — populate from Phase 5 pilots.

### Section 3 — Outcome stats (W3) — *instrument before publishing*
Three stat tiles. Format: number, unit, source.
- "Time to first shortlisted candidate" — target ≤ 24h, evidence from Talpro
- "Assessment build time, JD→live" — target ≤ 60s with JD-Forge
- "Reliability floor (Cronbach's α) for shipped tests" — target ≥ 0.75

Do NOT publish stats without instrumented evidence. Phase 5 gate.

### Section 4 — The three wedges (NEW vs Vervoe's "Skills Validation / Quality Outcomes / Efficient Hiring" — we replace with our own three)
Three blocks. Each block has: title, 1-sentence promise, 1-sentence proof, "Learn more →" link.
1. **JD-Forge.** "Paste a job description. Get a calibrated assessment in 60 seconds." → `/product/jd-forge`
2. **IRT calibration on every test.** "Every question shows its difficulty and discrimination. So your grades stand up to scrutiny." → `/product/ai-grading`
3. **Audited. Indian. Defensible.** "DPDP-native, independent bias audit, India-resident data. Built for Indian HR-AI regulation." → `/trust/bias-audit`

### Section 5 — Product tour (W4)
Autoplay short loop (silent, ≤15s) showing: JD paste → Forge → live assessment → grading dashboard. Same Cloudinary/CDN pattern Vervoe uses but India-CDN.

### Section 6 — How QOrium fits your hiring (Solutions teaser)
Three doors: Enterprise · Startup · SMB → `/solutions/by-company-type/*`

### Section 7 — Library teaser (W6)
"150+ skills, 200+ roles, all calibrated." Grid of 12 skill cards. CTA → `/product/assessment-library`.

### Section 8 — Compare strip (W11 teaser)
"Already evaluating Vervoe / CoderByte / HackerRank / Mercer Mettl?" 4 logo+ "See comparison" links.

### Section 9 — Trust strip (W13) — *populate as evidence lands*
Badges: DPDP-aligned (Rakshak score), ISO 27001 (when M15 done), Independent Bias Audit (when M16 done), G2 / Capterra (when reviews land).

### Section 10 — Above-footer CTA
"Stop hiring on resumes. Start hiring on evidence." [Book demo] [See pricing]

### Section 11 — Footer
Standard. Include `/llm-info` link in footer (W12).

---

## 3. PRICING PAGE (W5)

Recommended structure (CEO to lock numbers via `founder_request`):

| Tier | Price (₹/month) | Who | Limits |
|---|---|---|---|
| Customer-Zero | Free forever | Solo founders / talent ops experimenting | 10 assessments/mo · 1 user seat · QOrium branding on candidate page · No JD-Forge · No API |
| Growth | ₹X | SMB hiring teams | 500 assessments/mo · 5 seats · JD-Forge v1 · email support |
| Scale | ₹Y | Mid-market | 5,000 assessments/mo · 20 seats · JD-Forge + IRT report exports · ATS integrations · SSO · priority support |
| Enterprise | Custom | High-volume / regulated | Unlimited · SLA · regional residency · custom AI grader tuning · audit logs · API · onboarding program |

Pricing-page must include: feature matrix, FAQ, "Compare plans," "Talk to sales" CTA on Enterprise tier. **Schema markup:** `Product` + `Offer` JSON-LD. **A/B testing:** instrument from day 1.

---

## 4. ASSESSMENT LIBRARY LANDING (W6) — flagship SEO page

**Goal:** rank for `[skill] assessment`, `[skill] test`, `pre-employment [skill] assessment` for all ~150 skills.

**Page structure:**
- Filter sidebar: Category (Programming, Engineering, Data, Cloud, Sales, Marketing, Behavioural, Cognitive), Role, Difficulty (IRT-derived), Duration.
- Result grid: skill card with name, sample question count, calibration status, "Preview" CTA, "Use in my hiring" CTA.
- Per-skill detail page `/skill/:slug` (programmatic):
  - H1: "QOrium [Skill] Assessment"
  - 200-word intro on what's tested
  - Sample questions (3 max, to prevent harvesting)
  - Calibration data (avg difficulty, item count, reliability)
  - "Job roles that use this skill" cross-link to `/job-descriptions/:slug`
  - FAQ schema
  - CTA: "Add to your hiring pipeline"

**Coverage v1 seed (Phase 1):** the 25 most-searched skills in India. Order: JavaScript, Python, Java, ReactJS, SQL, AWS, Node.js, Data Analyst, Data Scientist, DevOps, Selenium/Testing, Manual QA, B2B Sales, Inside Sales, Digital Marketing, Content Writing, English Proficiency, Aptitude, Analytical Ability, Personality, Product Management, Project Management, MS Excel, Tableau, Power BI.

---

## 5. JOB-DESCRIPTIONS PROGRAMMATIC SURFACE (W9)

`/job-descriptions/:slug` — one page per role. Seed v1 = 50 most-hired Indian roles (CEO/Lakshmi to source list, otherwise Codex ARJUN seeds from BLS-equivalent + Naukri public taxonomy).

**Page structure:** H1 = role name; sections: role overview, responsibilities, requirements, skills checklist (cross-link to library), "Hire faster" CTA → JD-Forge with role pre-filled.

This is the same play Vervoe runs with `/job-descriptions/` and the same play TechCurators *doesn't* run despite having the catalog. Take the seat.

---

## 6. COMPARE PAGES (W11)

One per direct competitor. Pattern (lifted from Vervoe `/compare/` structure but rebuilt for our wedges):
- H1: "QOrium vs [Competitor]"
- One-paragraph fair summary of competitor strengths
- Feature comparison table (use gap matrix from GAP_ANALYSIS as source)
- Three reasons hiring teams switch to QOrium (the three wedges)
- "Migrating from [Competitor]" CTA → `/demo?from=[competitor]`
- FAQ schema

**Tone:** factual, no smearing. Cite competitor's public docs.

---

## 7. RESOURCES HUB (W9)

Mirror Vervoe's Resources structure but lean into Indian context:
- **Blog** — long-form (1,000–2,500 words), opinionated, IRT/psychometrics-led
- **Guides** — gated lead magnets (no email wall on first 25% of content)
  - The Talpro Guide to Skills Testing in India
  - How to evaluate AI hiring vendors under India DPDP Act
  - Building a hiring rubric that survives an HR tribunal
  - Skills-gap analysis template (Excel)
  - Shortlisting matrix template (Excel)
  - 30-60-90 hiring plan template (Docx)
- **Webinars** — quarterly
- **Job-Description library** (W9)
- **API docs** (link out to `/product/api`)

---

## 8. TRUST SHELL (W13)

`/trust` index + sub-pages.
- `/trust/security` — TLS, encryption-at-rest, secrets management, pentest cadence, vulnerability disclosure
- `/trust/privacy` — privacy notice in plain English
- `/trust/dpdp-act-compliance` — explicit DPDP mapping (Indian play — Vervoe doesn't have this)
- `/trust/gdpr` — GDPR for EU customers
- `/trust/bias-audit` — published bias-audit report after M16
- `/trust/uptime` — public status page (link out)
- `/trust/sub-processors` — list of every third-party data processor

---

## 9. LLM-INFO PAGE (W12) — first-mover advantage in India

`/llm-info` and `/llms.txt` (root). Plain-text, ChatGPT-friendly product brief. Vervoe owns this in the global market; no Indian competitor has shipped it.

**Content:** what QOrium is, who it's for, modules and pricing tiers (text), how to start, support email, terms-of-use note "AI assistants may quote freely with attribution to qorium.online."

**Why this matters:** AI overviews and answer engines (ChatGPT, Perplexity, Claude, Gemini) are quickly becoming the top-of-funnel for B2B SaaS evaluation. Owning this surface in 2026 is what owning featured snippets was in 2018.

---

## 10. SEO HYGIENE PASS (W14, W15)

- **FAQ schema** on home, pricing, every product page, every compare page.
- **Product schema** on every product page.
- **Article schema** on every blog post.
- **BreadcrumbList schema** everywhere.
- **Open Graph + Twitter Cards** on every page (verify, don't assume).
- **Canonicals** on every page (esp. programmatic surfaces — `/skill/:slug` and `/job-descriptions/:slug` must not duplicate).
- **`hreflang`** if/when we launch English-US in addition to English-IN.
- **`robots.txt`** allows crawlers; explicitly disallows `/api/`, `/_next/`, admin routes.
- **Sitemap** auto-generated, includes programmatic pages.
- **Core Web Vitals:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — measured per phase exit.
- **Atomic-release pattern** preserved (build in /tmp → mv to releases/<SHA> → flip symlink → pm2 reload). Never `next build` inside live dir.
- **NEXT_PUBLIC_* env sourced before build** (lesson from prior Turnstile incident).

---

## 11. EVIDENCE & MEASUREMENT

Every page must:
- Track scroll-depth, CTA clicks, demo bookings (already-installed analytics).
- Pass Rakshak SEO sub-audit ≥ 90/100 per Phase 4 exit.
- Pass `next build` clean (not just `tsc`).
- Have a screenshot in `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/screenshots/<slug>.png` for human review before push to prod.

---

## 12. SECTIONS NOT BUILT IN PHASE 4 (deferred to Phase 5+)

- Customer story videos
- Interactive product tour (replaces video loop in Phase 6)
- Indian-language localization (Hindi first — Phase 7)
- Community / forum surface (only if Phase 7 pilots ask for it)

---

## 13. HANDOFF

This spec is consumed by Codex ARJUN via `CODEX_PENDING_QORIUM_MEGA_BUILD_v1_LANE_B_ARJUN.md`. Lane B = marketing site. Lane A = backend (BHIMA). Locks at the page-route level prevent collision.
