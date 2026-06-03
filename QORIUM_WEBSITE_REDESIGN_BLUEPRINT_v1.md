# QOrium — World-Class Website Redesign Blueprint v1.0

**Author:** Cowork (Super Brain) · **Executor:** Codex BHIMA + ARJUN (Super Coder)
**Date:** 2026-06-03 · **Domain:** qorium.online
**Supersedes for marketing copy/IA:** the live `marketing/data.ts` content (build-voice) — not the locked design direction (A+B+C) or brand tokens, which this blueprint honours.
**Companion files:** `MARKETING_REDESIGN_360_v1.md` (design direction), `brand/QOrium-Brand-Asset-Spec.md` (tokens), `QORIUM_SITEMAP_AUDIT_REDESIGN_RECORD_2026-06-02.md`, this doc's prototype `qorium-redesign-prototype.html`, this doc's executor brief `CODEX_PENDING_QORIUM_WEBSITE_REDESIGN_v1_LANE_B.md`.

---

## 0. Executive summary — what's wrong and the fix in one screen

QOrium's **strategy is ~9/10; the website expressing it is ~3.7/10** (design) and **~3.9/10** (copy). The live site has three fatal problems:

1. **Build-voice / spec-as-copy.** The public homepage narrates the *rebuild itself* — route counts ("1,190 live sitemap routes"), an internal competitor gap-analysis section, doctrine language ("evidence-gated," "founder-locked," "proof architecture"), and a hero image that is a screenshot of the website looking at itself. The CEO correctly flagged this as a "tech writeup." Buyers do not buy your roadmap; they buy their outcome.
2. **~99% templated filler.** Only 9 of ~1,190 pages have hand-written sections. Every `/features/*`, `/solutions/*`, `/science`, `/method`, `/security`, `/customers`, `/compare/*`, `/vs/*` page shares one of a few identical boilerplate bodies. Pages *promise* segmentation, comparison, and proof and deliver generic text.
3. **No proof, no price, broken IA.** Zero logos/quotes/metrics/demos. The pricing page literally says it has no prices. `/platform/*` and `/features/*` duplicate each other; `/vs/*` and `/compare/*` are two competing comparison patterns; competitor names are mis-cased ("Hackerrank"); secondary CTAs link to the wrong place.

**The fix (this blueprint):** a buyer-POV, evidence-first site that leads with the one tension no competitor owns — **"AI-graded skills tests that survive an audit — psychometrically calibrated, leak-resistant, built in India"** — backed by published science, transparent INR-native pricing, a named integrity page, and Talpro as a deep Customer-Zero case study. Honesty (evidence-gating) is *kept as a feature* but **never narrated as page copy**.

**What this blueprint contains:** (1) strategic foundation + voice contract; (2) the canonical sitemap with IA defect fixes; (3) the global design system; (4) a section-by-section recreate of all ~28 core page TYPES + the 6 programmatic template families; (5) the per-page-type gap matrix; (6) measurement + evidence-gating rules. The companion HTML prototype shows 6 flagship pages built to this spec; the Codex brief turns it into Next.js code.

---

## 1. Strategic foundation (locked — do not re-litigate)

### 1.1 Positioning
**"India-built, psychometrically-defensible, AI-graded skills assessments."** Brand essence: *QOrium is the source of truth for technical questions.* The one-line promise that already works and is amplified everywhere: **"Skills tests you can defend in an audit."**

### 1.2 The villain (narrative spine)
Leaked question banks rot in 6–9 months. *"Your question bank is rotting. You just can't see it yet."* Timeline: Week 1–4 first exposure → Month 2–6 the prep market catches up → Month 6–9 signal collapse. Every product and proof point answers this villain.

### 1.3 The moat — 8 differentiators reframed as buyer outcomes (no competitor covers >2)
1. AI-authored pipeline → **"Fresh items on demand."**
2. I/O-psych validation → **"Validated, not just written."**
3. Anti-leak rotation → **"Questions that retire before they leak."**
4. Multi-format export → **"Use the score anywhere."**
5. India-stack depth (SAP/Oracle/ABAP/BFSI) → **"Tests for the stack you actually run."**
6. Role-graph → **"Organised by the role you're hiring."**
7. Per-candidate watermarking → **"Every leak traces back."**
8. Content-API-first → **"Built to plug in."**

### 1.4 Three competitive wedges (12–24 month moat)
- **E1 — IRT-calibrated scoring:** the only player whose grades survive an HR-tribunal audit.
- **E2 — JD-Forge:** paste a JD → calibrated assessment pack in ~30–60s.
- **E3 — Bias-audited + DPDP-native + India data residency:** a structural advantage US incumbents cannot copy.

### 1.5 Products (3-SKU model, one engine)
| SKU | One-line | Primary buyer | Buy motion |
|---|---|---|---|
| **ReadyBank** | Calibrated, anti-leak skill libraries, ready now | Platforms (API), staffing, mid-market | Subscription / API license |
| **JD-Forge** | Paste a JD → a role-shaped, calibrated test in minutes | Staffing, mid-market TA | Self-serve trial → workflow plans |
| **Stack-Vault** | A private, watermarked bank for *your* exact stack | Enterprises & GCCs (SAP/Oracle/BFSI) | Scoped enterprise deal |

Shared **Engine** (mega-menu column): Anti-Leak Rotation · IRT Calibration · Watermark-per-Candidate · Role-Graph. **Delivery modes:** REST API · Bulk Export (CSV/JSON) · Embedded Widget · White-Label.

### 1.6 Three buyer spines (balanced multi-ICP — each gets a first-class path)
- **IT Staffing firms** — *"Send a shortlist your client actually trusts."* Lead with JD-Forge + Talpro Customer-Zero ROI. CTA: **Start a JD-Forge trial.**
- **Enterprises & GCCs** — *"A private library for your exact stack, watermarked to every candidate."* Lead with Stack-Vault + IRT defensibility + DPDP. CTA: **Scope a Stack-Vault.**
- **Assessment platforms** — *"License calibrated content through one API."* Lead with ReadyBank + Engine + content-API. CTA: **Talk to API sales.**

The homepage routes all three within two scrolls; each gets a dedicated `/solutions/*` landing page with its *own* workflow, proof, and CTA — not shared boilerplate.

### 1.7 Required attribution (every page footer)
**"QOrium™ is a product of Talpro India Private Limited."** (Only registered legal entity. Do not invent CIN/GST on the site.)

---

## 2. The voice contract (a hard build gate)

**Approved voice:** a senior practitioner who refuses to bullshit you. Confident, concrete, plain-spoken, evidence-first — Stripe/Linear, not hype-SaaS.

**Grammar of every sentence:** the **buyer is "you" and the subject of every verb**; QOrium is "we"; the site/page/redesign is **never** a subject. Present tense, short sentences, one idea each. A technical term is allowed only if the buyer already says it **and** it's translated to an outcome on first use (*"IRT-calibrated — so a hiring manager's score holds up in a tribunal"*).

**Message arc every page rides:** PAIN/AMBITION → STAKES → THE SHIFT → PROOF (shown) → ONE CLEAR NEXT STEP.

**BANNED — any hit fails the build (automated scanner over rendered copy):**
- Meta references: *"the site," "this page," "the redesign," "the homepage now," "this section," "we redesigned," "rebuild," "MVP website," "sitemap routes," "proof architecture."*
- Implementation leak: *"flag," "flag off," "module hidden," "feature-state," "not yet rendered," "founder-locked," "coming soon," "beta"* (as a visible label).
- Funnel/internal jargon: *"conversion story," "buyer routing," "route … into," "lead story," "proof system," "business model," "sales-ready."*
- Taxonomy-as-headline: *"Eight-dimension moat," "Role-graph organization," "I/O-psych validation path."*
- Empty intensifiers: *"world-class," "cutting-edge," "next-gen," "robust," "seamless," "leverage," "unlock," "supercharge."*

**Two self-checks before any line ships:**
1. **Competitor-paste test** — if a rival could paste their name over the line and it stays true, rewrite it.
2. **Buyer-subject test** — if the grammatical subject is QOrium, the site, or a module instead of the buyer, rewrite it.

---

## 3. Canonical sitemap + IA defect fixes

### 3.1 The IA defects in the live site (must fix)
| # | Defect | Fix |
|---|---|---|
| D1 | `/platform/*` **and** `/features/*` are duplicate product pages (SEO cannibalization) | **Keep `/platform/*` as the product homes. Kill `/features/*`; 301 → matching `/platform/*`.** `/features` hub → `/platform`. |
| D2 | `/vs/*` (10) **and** `/compare/*` (5) are two comparison patterns | **Canonical = `/compare/qorium-vs-{competitor}`.** 301 all `/vs/*` → `/compare/*`. One "Compare" hub at `/compare`. |
| D3 | `/product/*` (`/product`, `/product/api`, `/product/assessment-library`) overlaps `/platform/*` | Merge: `/product` → `/platform`; `/product/api` → `/platform/api`; `/product/assessment-library` → `/library` (the catalog hub). 301 the rest. |
| D4 | Duplicate role pages `/solutions/role/*-2`, `*-3` | De-duplicate to one canonical per role; 301 the `-2/-3` variants. |
| D5 | `/customers` headline announces it has no customers; `/customer/talpro-india` describes a future case study | Rebuild as a real Customer-Zero case study (§4.16). |
| D6 | Mis-cased competitor brand names ("Hackerrank") | Brand-name dictionary; render exact casing (HackerRank, CodeSignal, TestGorilla, iMocha, Mercer | Mettl). |
| D7 | Secondary CTAs link to wrong target (label ≠ href) | Every CTA's href must match its label intent; CTA registry in §5.4. |
| D8 | Footer has no contact/legal/social | Full footer (§3.4). |
| D9 | Pricing page has no pricing | Published INR-native pricing + plan matrix (§4.7). |

### 3.2 Canonical primary nav (mega-menu, Maitro/ProveIQ pattern)
`Platform ▾ · Solutions ▾ · Why QOrium ▾ · Resources ▾ · Pricing` + actions `Sign in` · **`Book a demo`** (primary) and a context secondary (`Start free` on product/pricing).

```
Platform ▾
  Products            The Engine               Delivery
  • ReadyBank         • Anti-leak rotation     • REST API
  • JD-Forge          • IRT calibration        • Bulk export (CSV/JSON)
  • Stack-Vault       • Watermark-per-candidate• Embedded widget
  • Assessment Library• Role-graph             • White-label
                                               → Platform overview

Solutions ▾
  By buyer            By industry              By use case
  • Staffing firms    • IT services & staffing • Technical screening
  • Enterprises & GCC • BFSI                    • High-volume / campus
  • Assessment platforms• GCC / global capability• Lateral hiring
                      • Healthcare, Retail      • Internal mobility

Why QOrium ▾
  • Science (IRT & validity)     • Anti-leak
  • Method                       • Trust & security
  • Responsible AI               • DPDP & data residency
  • Compare (vs hub)

Resources ▾
  • Blog            • Guides & templates   • Sample packs
  • Job descriptions• State of Skills Hiring report • Docs / API
```
Evidence-gated items render only when their evidence is live — and the copy **never says** an item is hidden/coming.

### 3.3 Canonical URL map (core + template families)
**Core marketing (≈28 types):**
`/` · `/platform` · `/platform/readybank` · `/platform/jd-forge` · `/platform/stack-vault` · `/platform/api` · `/library` (catalog hub) · `/pricing` · `/solutions` (hub) · `/solutions/staffing-firms` · `/solutions/enterprises-gcc` · `/solutions/assessment-platforms` · `/science` · `/method` · `/anti-leak` · `/trust` · `/security` · `/compliance-dpdp` · `/responsible-ai` · `/customers` · `/customer/talpro-india` · `/compare` (hub) · `/resources` · `/about` · `/contact` · `/demo` · `/changelog` · legal: `/privacy` `/terms` `/dpa` · `/llm-info` (GEO).

**Programmatic template families (design the TEMPLATE, not each instance):**
1. `/library/*` (1,000 skill pages) — catalog leaf template.
2. `/skill/*` (≈25 flagship skill landers).
3. `/solutions/role/*`, `/solutions/stack/*`, `/solutions/by-industry/*`, `/solutions/by-use-case/*`, `/solutions/by-company-type/*` — solution-landing template.
4. `/resources/job-descriptions/*` (20) — JD template.
5. `/resources/sample-packs/*` (13) — sample-pack template.
6. `/resources/guides/*` + `/blog/*` — article template.
7. `/compare/qorium-vs-*` — comparison template.

### 3.4 Footer (every page)
4 link columns (Platform · Solutions · Why QOrium · Resources) + **Company** (About, Customers, Contact, Changelog) + **Legal & Trust** (Privacy, Terms, DPA, DPDP, Security, Responsible AI). Row with: attribution line, `security.txt`/disclosure link, trust badges **only when earned**, and (when live) G2/Capterra. No fabricated badges.

---

## 4. Design system (global)

### 4.1 Color tokens (from brand spec — locked)
- **Navy** `#0A1F3D` (primary text, dark shells, logo) · **Cyan** `#00B3C7` (CTAs, accents, focus) · **Gold** `#D4A85A` (premium/Stack-Vault accent only).
- Charcoal `#2C3E50` (body) · Slate `#64748B` (secondary) · Fog `#E2E8F0` (borders) · Cloud `#F8FAFC` (cards/bg).
- Semantic: Success `#10B981` · Warning `#F59E0B` · Error/leak `#EF4444` · Info `#3B82F6`.

### 4.2 Typography — **conflict resolved**
The brand spec mandates Inter; the redesign doctrine bans Inter-as-primary. **Resolution (decisive): use distinctive Grotesk faces, keep brand sizes.** This satisfies "not generic Inter" while staying enterprise-credible.
- **Display:** `Space Grotesk` (600/700) — H1 48px, H2 36px, H3 28px.
- **Body:** `Inter Tight` (400/500/600), 16px/1.6 (distinct from default Inter; on Google Fonts).
- **Code/data:** `JetBrains Mono` 400/13px — used for the "evidence ledger" motif, item IDs, IRT values.
- (If brand later insists on Inter, body falls back to Inter — colors and layout unchanged.)

### 4.3 Three contextual surface treatments (A+B+C, one token system)
- **A — Trust Infrastructure** (dark navy shell, restrained motion, "evidence ledger" data-viz motif): owns global chrome, `/science` `/method` `/anti-leak` `/trust` `/security` `/compliance-dpdp` `/responsible-ai`.
- **B — Skills, Shown** (bright Cloud surfaces, interactive JD→test + graded-answer player): owns homepage proof band, `/platform/*`, `/library/*`.
- **C — India-Built Enterprise** (gold accents, GCC stack-depth, regional credibility band): threads `/solutions/*`, Stack-Vault, enterprise paths.

### 4.4 Components & motion
shadcn/ui + Tailwind v4 (structure) · Aceternity/Magic UI (effects, used sparingly) · Motion v12 (engine). Cards: Cloud bg, 1px Fog border, 8px radius, shadow `0 2px 8px rgba(0,0,0,.08)`. Inputs: 2px cyan focus. Every section gets a quiet entrance animation (fade/translate ≤16px, 150ms hover-intent on nav). Signature motif: the **evidence ledger** — a monospace mini-table showing item → IRT difficulty/discrimination → leak-status freshness → last-rotated date. Reused across science, library, anti-leak.

### 4.5 Accessibility
WCAG 2.1 AA: contrast ≥4.5:1 on body (navy on Cloud passes; cyan used on dark or as accent, not body text), keyboard-navigable mega-menu, visible focus, 44px tap targets, prefers-reduced-motion respected.

---

## 5. Per-page recreate — core page types

Format per page: **Goal · Surface · Section-by-section (with real recreated copy) · Proof slots · CTAs · Notes.** All copy obeys §2. Stat tiles marked ⟦target⟧ must be instrumented before publish (evidence-gating, §7).

### 5.1 Homepage `/` — Surface B over A chrome
**Goal:** in one scroll a buyer understands what QOrium is, why it's different, and which of three paths is theirs.

1. **Hero.** Eyebrow: *Skills assessment, built in India.* H1: **"Skills tests you can defend in an audit."** Sub: *"AI-graded assessments that stay calibrated and leak-resistant — so the score a hiring manager acts on holds up months later, and in a tribunal."* Primary CTA **`Book a demo`**; secondary **`See how grading works`** → `/science`. Hero visual: the **graded-answer player** (a real candidate answer with the IRT-banded, explainable score) — not a screenshot of the website.
2. **Logo / trust strip.** *"Dogfooded daily by Talpro India — our Customer Zero."* + Talpro mark. (Add pilot logos only when signed; until then, one honest line, not an empty rail.)
3. **The leak story (villain).** H2: *"Your question bank is rotting. You just can't see it yet."* Three-step timeline (Week 1–4 → Month 2–6 → Month 6–9) as an animated ledger. One line each, buyer-POV. Close: *"QOrium retires questions before they leak — automatically."*
4. **Three products.** Cards: ReadyBank / JD-Forge / Stack-Vault, each one outcome line + "who it's for" + link to `/platform/*`.
5. **The moat as 8 outcomes.** A 2×4 grid of the §1.3 outcome lines (not the taxonomy names), each with a one-line proof and an icon. No "eight-dimension" headline.
6. **Show, don't tell — JD→test.** The interactive **JD-Forge sample**: paste/﻿pick a JD → see a calibrated pack appear (skills, difficulty bands, rubric). This is the site's strongest real asset — feature it, no disclaimer wrapper.
7. **Three buyer paths.** Three columns (Staffing / Enterprise & GCC / Platforms), each: pain line → the shift → its own CTA (Start a JD-Forge trial / Scope a Stack-Vault / Talk to API sales).
8. **Proof band ⟦target⟧.** Three stat tiles (e.g., time-to-shortlist, JD→live-pack time, reliability α) — render **only when instrumented**; until then show a qualitative proof (the Talpro workflow) instead of fake numbers.
9. **Honesty-as-flex (kept, reworded).** H2: *"We only publish what we can prove."* One line: *"No logo we don't have. No number we didn't measure. No certification we haven't earned."* (States the value to the buyer; never narrates "gating/flags.")
10. **Final CTA.** *"See a defensible assessment in 20 minutes."* `Book a demo` + `See pricing`.

### 5.2 Platform overview `/platform` — Surface B
**Goal:** show the defensibility pipeline as one product.
1. Hero: H1 **"One calibrated content engine. Three ways to buy."** Sub ties item authoring → IRT calibration → anti-leak rotation → explainable score → delivery.
2. **The pipeline** (horizontal evidence-ledger diagram): Author → Calibrate (IRT) → Rotate (anti-leak) → Deliver (API/export) → Defend (audit trail). Each node one buyer-benefit line.
3. **The three SKUs** with "pick your motion" cards → `/platform/readybank|jd-forge|stack-vault`.
4. **The Engine** (4 capability tiles) + **Delivery** (4 modes).
5. Proof: graded-answer player + ledger snippet. CTA band: `Book a demo` / `See pricing`.
*(Kill `/features`, `/product`; 301 here.)*

### 5.3 `/platform/jd-forge` — Surface B
1. Hero (keep, it's the best on the site): **"Paste a job description. Get a hiring assessment that matches the work."** Sub on role→skill→difficulty→rubric→evidence-format.
2. **Live demo** — embed the working `/try/jd-forge` flow here (not a static mock). Show the actual generated pack.
3. **From job text to test architecture** — 3 steps with the real output.
4. **Made for staffing & mid-market** — speed + cleaner shortlist signal; link to `/solutions/staffing-firms`.
5. Plans strip (Standard / Reviewed / Enterprise, INR + USD) → `/pricing`. CTA: **`Start a JD-Forge trial`** (real, not "Book demo").

### 5.4 `/platform/readybank` — Surface B
1. Hero: **"A calibrated assessment library you can use today."** Sub: breadth + freshness, not commodity.
2. **Browse the library** → `/library` with category tiles + honest count (state the live number; if 1,000 routes ≠ 1,000 distinct calibrated tests, say the true figure).
3. **Why it doesn't rot** — anti-leak rotation tie-in (ledger: last-rotated dates).
4. **Preview & control** — sample items public (steal Adaface's proven "no trick questions, job-relevant" framing, in our words).
5. CTAs: `Browse library` / `Request a sample pack`.

### 5.5 `/platform/stack-vault` — Surface C (gold accent)
1. Hero: **"A private question bank for your exact stack — watermarked to every candidate."** Sub names real stacks: SAP ABAP, Oracle HCM, Finacle, Flexcube, embedded/automotive, mainframe, BFSI.
2. **When the stack is the moat** — why a shared library can't test your stack; why private + watermarked matters for regulated hiring.
3. **Watermark-per-candidate** — the "every leak traces back" proof (ledger viz).
4. **Scoping** — Department / Enterprise / Group tiers (ranges, not fake precision) → enterprise CTA.
5. CTA: **`Scope a Stack-Vault`** → `/contact?intent=stack-vault`.

### 5.6 `/platform/api` — Surface A/B
1. Hero: **"License calibrated content through one API."** For assessment platforms.
2. Quickstart code block (real endpoint shape from `infra/API-Documentation-v0.md`), auth note, rate-limit note.
3. Delivery modes (REST / export / widget / white-label) + freshness SLA framing.
4. CTA: **`Talk to API sales`** + `Read the API docs` → `/resources/docs`.

### 5.7 Pricing `/pricing` — Surface B
**Goal:** publish real, INR-native pricing with a free tier — the conversion engine US incumbents hide.
1. Hero: **"Start free. Pay for the trust layer when you're ready."** No "founder-locked," no "no fake precision."
2. **Plan matrix (4 cols):** Customer-Zero (Free — 10 assessments/mo) · Growth · Scale · Enterprise (custom). Show what's included per row (assessments, JD-Forge access, library access, anti-leak, watermarking, API, SSO, support, data-residency).
3. **By SKU** mini-tables: JD-Forge (Standard ₹3,999/$49 · Reviewed ₹15,999/$199 · Enterprise ₹39,999/$499) · ReadyBank subscriptions (₹4,999 / ₹14,999 / ₹49,999 /mo) · Stack-Vault (Department / Enterprise / Group — "scope a quote") · API (Platform tiers — "talk to sales").
4. **Pricing FAQ** (credits, no-show refund, INR/USD, annual discount, what counts as an assessment).
5. CTAs: `Start free` / `Book a demo`. **Note:** numbers above are from the SKU architecture doc; CEO must ratify exact figures before publish — but the page must show *a* committed structure, never "numbers not set."

### 5.8 Solutions hub `/solutions` — Surface C
3-axis grid (By buyer · By industry · By use case) → individual landers. Each lander uses its OWN content (§5.9–5.11 patterns), not shared boilerplate.

### 5.9 `/solutions/staffing-firms` — Surface C
1. Hero (keep): **"Turn every client JD into a stronger shortlist signal."**
2. **The staffing workflow:** client JD → JD-Forge pack → candidates tested → evidence-backed shortlist → client trusts the bench. 3-step diagram with the real artifact.
3. **Talpro Customer-Zero proof** — the dogfooding story + (⟦target⟧ once instrumented) time-to-shortlist and acceptance metrics. Until then, a concrete qualitative narrative + quote.
4. **ROI framing** — fewer wasted client interviews, faster fills (model, not fabricated stat).
5. CTA: **`Start a JD-Forge trial`** + `See staffing pricing`.

### 5.10 `/solutions/enterprises-gcc` — Surface C
1. Hero: **"Hire for your real stack — with scores you can defend to legal."** GCC/enterprise.
2. Pains: leaked banks, can't test SAP/Oracle/BFSI depth, audit/compliance exposure.
3. The shift: Stack-Vault + IRT defensibility + DPDP/India residency + bias audit (when earned).
4. **Trust block** — link to `/security` `/compliance-dpdp` `/responsible-ai`. Watermarking + audit trail.
5. CTA: **`Scope a Stack-Vault`** + `Talk to enterprise sales`.

### 5.11 `/solutions/assessment-platforms` — Surface A/B
1. Hero: **"Stop authoring content that rots. License ours."**
2. Pain: expensive in-house authoring + leak decay; the shift: ReadyBank via API.
3. Integration snippet + freshness SLA + white-label.
4. CTA: **`Talk to API sales`** + `Read API docs`.

### 5.12 `/science` — Surface A (the signature differentiation page)
**Goal:** publish the psychometric evidence the whole category asserts but rarely shows. QOrium's single biggest differentiation surface.
1. Hero: **"How an AI grade earns the right to be trusted."** Sub: *"Every QOrium score is calibrated with Item Response Theory, so difficulty and discrimination are measured — not guessed — and a hiring manager's decision survives scrutiny."*
2. **IRT in plain terms** — difficulty & discrimination explained, with the evidence-ledger viz (item → b/a parameters → fit).
3. **How we calibrate** — the sample, the pipeline, the human I/O-psych review step.
4. **Reliability & validity** — Cronbach's α and validity coefficients ⟦target — publish only when measured; until then state the *standard*: "we don't publish a test until α ≥ 0.75," framed as a commitment, not a claimed result.⟧
5. **Bias & fairness** — adverse-impact monitoring + independent bias audit (M16) when earned; until then state the method and cadence.
6. Dual CTA (TestGorilla pattern, our words): **`Talk to our psychometrician`** / **`See the math`** (methodology one-pager) + `Read the Method`.

### 5.13 `/method` — Surface A
1. Hero: **"The QOrium Method: author, validate, rotate, deliver, defend."**
2. Five numbered steps, each a real action + the evidence it produces. Diagram.
3. Link-outs: Author→`/library`, Validate→`/science`, Rotate→`/anti-leak`, Deliver→`/platform/api`, Defend→`/trust`.
4. CTA: `Book a demo`.

### 5.14 `/anti-leak` — Surface A
1. Hero: **"Questions that retire before they leak."**
2. **The leak lifecycle** (reuse villain timeline) + how rotation pre-empts it; **qorium-leak-crawler** as a real, named integrity capability (we monitor exposure).
3. **Watermark-per-candidate** — traceability.
4. Candidate-trust framing (integrity reassures honest candidates too).
5. CTA: `See the science` / `Book a demo`.

### 5.15 `/trust` — Surface A (trust center hub)
1. Hero: **"Everything you need to clear procurement."**
2. Tiles → Security, DPDP & data residency, Responsible AI, DPA, sub-processors, status, `security.txt`/disclosure.
3. Badges **only when earned** (ISO 27001 = M15, not yet — do not show).
4. CTA: `Request security docs`.

### 5.16 `/security` — Surface A
1. Hero: **"How we protect candidate evidence and your content."**
2. Real controls: encryption in transit/at rest, access control, secret rotation (B6 calendar), vuln disclosure (`security.txt`), audit logging (Audit-Log-API). No fabricated certifications.
3. CTA: `Request security docs` / `Talk to enterprise sales`.

### 5.17 `/compliance-dpdp` — Surface A (India wedge)
1. Hero: **"Built for India's DPDP Act — data that stays in India."**
2. Data residency, consent, candidate rights, retention, sub-processors — the structural advantage US incumbents can't match.
3. Link to DPA. CTA: `Request the DPA`.

### 5.18 `/responsible-ai` — Surface A
1. Hero: **"AI that explains its grade."** Explainability, human oversight, bias monitoring, model governance, what the AI does/doesn't decide.
2. CTA: `Read the science`.

### 5.19 Assessment Library / catalog `/library` — Surface B
**Goal:** a browsable, credible catalog — table stakes QOrium currently lacks.
1. Hero: **"Browse calibrated tests by skill and role."** Honest count.
2. **Category tiles** (Programming · Cognitive · Personality · Language · Role-specific · India-stack/BFSI) + filters (skill, role, difficulty, format).
3. **Library leaf cards** → `/library/{skill}` template (§6.1) with public **sample items** + evidence-ledger metadata (IRT difficulty, leak-status freshness, last-rotated) — catalog metadata no competitor exposes.
4. CTA: `Request a sample pack` / `Book a demo`.

### 5.20 Compare hub `/compare` + template `/compare/qorium-vs-{competitor}` — Surface A
**Goal:** real, fair comparisons that win brand-search SEO. Replace the empty "QOrium position: explicit and buyer-facing" table.
1. Hub `/compare`: grid of competitor cards (HackerRank, CodeSignal, TestGorilla, iMocha, Mercer | Mettl, Vervoe, Coderbyte, Adaface…). Correct brand casing (D6).
2. **Template** per page: hero "QOrium vs {Competitor}" → a **real feature matrix** (Library breadth · Private stack depth · Anti-leak lifecycle · IRT-defensible scoring · DPDP/India residency · Pricing transparency · API/white-label) with honest, sourced rows for *both* sides (no smearing; cite competitor public claims). Migration note where relevant.
3. Anchor every comparison on **defensibility + India cost/residency**, never raw feature parity.
4. CTA: `See why teams switch` → `/demo`.

### 5.21 Customers `/customers` + `/customer/talpro-india` — Surface B/C
**Goal:** turn the placeholder into a real flagship case study.
1. `/customers`: H1 **"Proof from the team that uses QOrium every day."** Lead with the Talpro Customer-Zero card; logo rail appears only when real logos exist (no "rendered only when evidence exists" meta-copy).
2. `/customer/talpro-india`: a genuine case study — context (IT staffing, high-volume screening), what they run (JD-Forge + ReadyBank), the workflow change, a real Talpro quote, and ⟦target⟧ metrics once instrumented. Until metrics exist, tell the operational story concretely — never describe "a future case study."
3. CTA: `Book a demo` / `Start a JD-Forge trial`.

### 5.22 Resources `/resources` (+ /blog, /guides, /sample-packs, /job-descriptions) — Surface B
1. Hub with content tiles + a **flagship report slot**: "The State of Skills Hiring in India / GCC" (category-owning thought leadership — build when data exists).
2. Article template §6.6; JD template §6.4; sample-pack template §6.5.
3. CTA per asset: contextual (download / try / book).

### 5.23 `/about` — Surface A
1. Hero: **"Built in India, by the team that hires at scale."** Talpro lineage as credibility, not apology.
2. Mission (defensible hiring), the people behind the science (visible I/O-psych function), principles (evidence over hype).
3. CTA: `See the science` / `Contact us`.

### 5.24 `/contact` & `/demo` — Surface A/B
- `/contact`: intent-aware form (sales / Stack-Vault / API / security docs / support), real email + response-time expectation. Footer-linked.
- `/demo`: a real booking flow (calendar), "what you'll see in 20 minutes" list, qualification fields. Primary site CTA target.

### 5.25 `/llm-info` (GEO / AI-search) — Surface A
A clean, factual machine-readable summary of QOrium (what it is, products, differentiators, pricing posture, contact) for AI answer engines — the emerging 2026 pattern. + "Ask AI for a summary" buttons site-wide.

---

## 6. Programmatic template families (design once, render many)

> Rule for all templates: hero kicker/title/summary may vary per instance, but **each template has ≥3 genuinely differentiated, data-driven sections** — never the identical boilerplate that plagues the live site.

### 6.1 `/library/{skill}` (×1,000) — Surface B
(1) Hero "Assess {skill} with calibrated, leak-resistant items." (2) **What this test measures** (sub-skills from role-graph — varies). (3) **Sample items** (2–3 public, real). (4) **Evidence ledger** (IRT difficulty band, discrimination, last-rotated, leak-status) — per-skill data. (5) Roles that need it (links). (6) CTA: `Add to an assessment` / `Request sample pack`. Schema: `Product` + FAQ JSON-LD.

### 6.2 `/skill/{flagship}` (×25) — richer lander
As 6.1 plus difficulty-distribution chart, role-graph map, "vs generic test" callout, related JD link. Internal-link hub to its `/library/*` leaves.

### 6.3 `/solutions/{role|stack|industry|use-case|company-type}/*` — Surface C
(1) segment hero. (2) **The segment's pain** (varies). (3) **The QOrium answer** (which SKU + why). (4) **Relevant proof** (segment-matched). (5) segment CTA. De-dupe `-2/-3` (D4).

### 6.4 `/resources/job-descriptions/{role}` (×20) — Surface B
A genuinely useful JD template (responsibilities, must-haves, nice-to-haves, screening questions) + a **"Test these skills with QOrium"** module linking the matching `/skill/*` + a JD-Forge CTA. Schema: `JobPosting`-adjacent + FAQ.

### 6.5 `/resources/sample-packs/{pack}` (×13) — Surface B
Pack overview + **real sample items** + "what's calibrated" ledger + `Request the full pack` CTA.

### 6.6 `/resources/guides/*` + `/blog/*` — article template
Clear H-structure, author + date, TL;DR, evidence-ledger embeds where relevant, one contextual CTA, `Article` + FAQ schema, related links. No build-voice.

### 6.7 `/compare/qorium-vs-{competitor}` — see §5.20 (real matrix, correct casing).

---

## 7. Per-page-type gap matrix (best-in-class → table stakes → QOrium's ownable angle)

| Page type | Best-in-class does | Table stakes QOrium needs | QOrium ownable angle |
|---|---|---|---|
| Homepage | Outcome hero + anti-AI-resume tension, logo wall, stat band, science CTA | Sharp outcome H1, real CTA, honest trust strip, 3-stat band | "Defensible in an audit" tension no rival owns; "See the IRT" CTA |
| Platform | Capability-tabbed journey | One page tying loop→AI grade→report | Show the defensibility pipeline as the product |
| Feature pages | Standalone SEO pages per capability | AI grading, JD-Forge, IRT, anti-leak pages | "Explainable AI score" out-evidenced with IRT bands + audit trail |
| Library | Category tiles + counts + public samples + explorer | Browsable catalog, honest counts, sample items | Per-item IRT difficulty + leak-status freshness as catalog metadata |
| Pricing | Free tier + transparent credits + matrix + FAQ | Published self-serve pricing + free tier | INR-native transparency vs demo-gated US incumbents |
| Solutions | 3-axis split, each a real lander | Staffing / enterprise-GCC / platforms / campus | India GCC / IT-services / DPDP-residency landers rivals can't claim |
| Science | Science page + bias audit + IO-psych persona | A real science page, not spec-as-copy | Publish IRT model, calibration sample, reliability + bias results |
| Trust/Security | Trust center + SOC2/ISO/GDPR badges | Trust center + disclosure policy | DPDP + India residency front-and-centre; anti-leak crawler as security |
| Customers | Logo wall + stat band + named case studies | ≥1 full case study w/ metric + quote | Talpro Customer-Zero deep dogfooded India case |
| Compare | Compare hub + per-competitor SEO pages | vs-TestGorilla/HackerRank/Adaface/Mettl | Anchor on defensibility + India cost/residency |
| Resources | Blog + reports + JD templates + tools | Blog + a few SEO assets | Annual "State of Skills Hiring in India/GCC" report |
| About/Contact/Demo | Founder story + demo form + contact | About, contact, demo form | Credible India-built origin + visible psychometrics team |

**10 patterns to adopt:** one-outcome hero + single primary CTA · logo wall under hero (Talpro first) · 3-stat results band w/ linked cases · library as its own nav column w/ counts · public sample questions + explorer · named integrity page in nav · science page in top nav w/ published evidence · transparent self-serve pricing + free tier + matrix + FAQ · Compare SEO hub · trust + G2/Capterra rows + `/llm-info` GEO.

**5 anti-patterns to avoid:** build-voice/spec-as-copy · "backed by science" without showing it · demo-gate everything with no price/free trial · vanity counts you can't back · generic global positioning that buries the India/DPDP/GCC home-field advantage.

---

## 8. Measurement + evidence-gating (non-negotiable)

**Evidence-gating is a feature — keep it, never narrate it.** Gated modules render only when their evidence flag is live; copy must never say something is hidden/coming/founder-locked. **Never fabricate:** no logo not held, no stat not instrumented, no certification not earned (ISO 27001 = M15, bias audit = M16 — neither yet held), no testimonial/award invented.

**⟦target⟧ tiles** (time-to-shortlist, JD→live-pack time, Cronbach's α ≥0.75) must be instrumented before they render with numbers — Phase 5 gate. Until then show qualitative proof (the Talpro workflow), not a placeholder number.

**Site KPIs to instrument:** demo-request rate, JD-Forge trial starts, pricing→signup, library→sample-pack requests, compare-page → demo, scroll-depth on `/science`, time-on-page for solution landers. Wire via the product-tracking plan; review monthly.

**Banned-words scanner** over rendered copy is a **hard CI gate** (§2 list) — any hit fails the build.

---

## 9. Build sequencing (exit-criteria gated, no calendar)
1. **Foundation** — design tokens (resolved fonts/colors), global nav + footer, CTA registry, banned-words CI gate.
2. **Flagship 6** — Home, /platform, /pricing, /solutions hub + 3 landers, /science, /compare hub+template (matches the prototype).
3. **Trust shell** — /trust /security /compliance-dpdp /responsible-ai /anti-leak /method.
4. **Catalog** — /library hub + leaf template + /skill flagships.
5. **Programmatic families** — solutions/*, JDs, sample-packs, guides/blog (de-dup, 301s).
6. **Customers + Resources flagship** — Talpro case study, State-of-Skills report slot.
7. **GEO + instrumentation** — /llm-info, KPI tracking, ⟦target⟧ tiles go live as evidence lands.

301 map (D1–D4) ships in Phase 1 so no SEO equity is lost.
