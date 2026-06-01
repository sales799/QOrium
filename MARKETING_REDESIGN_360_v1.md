# QOrium Marketing Site — 360° Audit, Gap Analysis, Competitor Gallery & Redesign Blueprint

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Author:** CTO (Claude, Super Brain lane — spec only; Codex BHIMA/ARJUN build)
**Date:** 2026-06-01
**Domain audited:** https://qorium.online/ (live since 2026-05-31, Rakshak GO 88/100)
**Status:** Draft v1.0 — for CEO review + design direction lock
**Companion specs:** `01-Market-Landscape.md`, `03-Gap-Analysis.md`, `05-...-SKU-Architecture.md`, `sales/Pricing-Pages-3-SKUs-Copy.md`, `brand/QOrium-Brand-Asset-Spec.md`

---

## 0. The one decision I need from you

You said: *"Show me some of the top competitors and I will share the Exact Design."*

This document gives you (1) a brutally honest 360 audit of what's live, (2) a curated competitor gallery with design signatures and mega-menus so you can pick a direction, (3) the gap analysis, (4) a **full QOrium mega-menu drafted in the Maitro / ProveIQ pattern**, and (5) the page-by-page redesign blueprint.

**What I need back from you:** lock **one** design direction (Section B closes with a 3-way pick), or paste the "exact design" reference you have in mind. Everything else I can decide and execute. I'm not bouncing technical choices to you — only the visual north star, because that's yours to own.

---

## 0.1 — DIRECTION LOCKED (CEO, 2026-06-01): A + B + C synthesis

CEO selected **all three**. "All three" is only coherent if each mode owns a *zone* rather than competing for the same surface. The synthesized QOrium design language:

| Layer | Owns | Design mode | Where it appears |
|---|---|---|---|
| **Shell & spine** | Global chrome, header/mega-menu, footer, trust shell | **A — Trust Infrastructure** (dark enterprise surfaces, "evidence ledger" motif, restrained motion, moat data-viz) | Every page chrome; `/method` `/science` `/anti-leak` `/trust` `/security` `/compliance-dpdp` `/responsible-ai` |
| **Product & proof** | The "wow" — show don't tell | **B — Skills, Shown** (brighter product surfaces, interactive JD→test, graded-answer player, sample-question viewer) | Homepage proof band; `/platform/*` SKU pages; `/library/*`; Sample-Pack |
| **Credibility** | India/GCC proof, stack depth, regional signal | **C — India-Built Enterprise** (India-first proof modules, GCC stack-depth, regional-language signal) | Homepage credibility band; `/solutions/*` (esp. enterprises-gcc + stack pages) |

One token system, three contextual surface treatments. Dark = trust/science. Light-bright = product/proof. India-credibility modules thread through both. This keeps it world-class-coherent, not a muddy "everything" mashup.

**Still open (non-blocking):** if you drop the "exact design" reference you mentioned, I'll tune the visual tokens (palette, type, motif) to match it — IA, mega-menu, and component structure proceed regardless since they're design-token-parameterized.

---

## 1. Executive summary

The current site is **honest, fast, and strategically thin**. It does one thing very well — it refuses to lie. "Trusted because we show our work," evidence-gated stats, "no unsupported public claims." That radical honesty is a genuine differentiator in a category full of inflated logo walls, and we **must not throw it away** in the redesign.

But honesty is currently doing all the work alone. The site reads like a clean internal MVP, not a world-class enterprise platform. Specifically:

- **No mega-menu / no IA depth.** Nav is a handful of links. A buyer can't navigate by *who they are* (Platform TA head vs GCC vs staffing firm) or *what they need* (ReadyBank vs JD-Forge vs Stack-Vault). The entire 3-SKU × 3-buyer story — the actual business — is invisible above the fold.
- **The moat is buried.** Our seven structural gaps (anti-leak rotation, watermark-per-candidate, India-stack depth, IRT calibration, role-graph, multi-format export, hybrid AI + I/O-psych pipeline) are the reason QOrium exists. The homepage mentions "IRT-calibrated, anti-leak-rotated, watermark-per-candidate" once, in a single line, with no explainer pages behind it.
- **No trust shell.** Enterprise/GCC buyers need a Security page, a Science/Methodology page, a DPDP/compliance page, and a "How we author & validate" page before they'll book. None exist as destinations.
- **No design system signature.** It's competent default SaaS. There's no memorable visual language — no signature motif, no proof-driven interactive hero, nothing that says "category creator."

**The redesign thesis:** keep the honesty, add the architecture. Turn a one-page MVP into a 20-page, mega-menu-driven, evidence-first enterprise site that makes the moat legible and routes three very different buyers to three very different stories — without publishing a single claim we can't prove.

**Decision scorecard for the redesign program: 4.4 / 5 — APPROVE** (P1 security/trust pages raise enterprise conversion; P3 revenue impact high; P5 maintainability strong via component system).

---

## 2. SECTION A — Current site 360° audit

Scored against a world-class enterprise-SaaS bar (10 = Stripe/Vanta/Vercel tier). This is the live state as rendered 2026-06-01.

| # | Dimension | Score | What's there | What's missing (the gap) |
|---|---|---|---|---|
| 1 | **Information architecture** | 3/10 | Flat: Library, JD-Forge, Compare pages, Pricing, Demo | No mega-menu; no Solutions-by-buyer; no Products taxonomy; 3 SKUs not navigable; no Resources hub; no Company section |
| 2 | **Positioning / narrative** | 5/10 | Clear honest line: "Skills assessments built in India. Trusted because we show our work." | Doesn't sell the *category* (content-factory moat). "India-built" is stated, not dramatized. No villain (leaked banks), no "why now," no proof story |
| 3 | **Moat legibility** | 2/10 | One line names IRT / anti-leak / watermark | Zero explainer pages. The 7 gaps that *are the company* are invisible. A buyer can't tell us apart from TestGorilla in 10 seconds |
| 4 | **Visual design system** | 4/10 | Clean, readable, fast, restrained | No signature motif, no depth, no motion, generic card grid. Looks like an MVP, not a leader. No dark "enterprise" surface, no data-viz language |
| 5 | **Trust shell** | 3/10 | Honest trust strip ("DPDP-aligned language live", "no unsupported claims") | No Security page, no Science/Methodology page, no DPDP/compliance destination, no SME/validation explainer, no case-study slot architecture |
| 6 | **Social proof** | 2/10 | "Talpro India customer-zero"; stats deliberately empty (correct, honesty-gated) | No design system *ready to receive* proof when it lands (logo rail, quote blocks, outcome-stat components gated behind a flag). Right now proof has nowhere to render |
| 7 | **Conversion architecture** | 4/10 | Two CTAs: "See library", "Book demo" | No buyer-segmented CTA paths; no JD-Forge interactive trial hook; no lead-magnet (sample pack); no pricing-page depth per SKU; weak demo qualification |
| 8 | **Product surface / interactivity** | 3/10 | Static library teaser cards, static compare cards | No live JD→test demo, no sample-question viewer, no "see a graded answer" proof widget. The product's wow is told, not shown |
| 9 | **SEO / programmatic** | 5/10 | Good: 25 seed skill pages, 5 compare pages, 6 guides, JSON-LD WebSite + FAQ schema present | Programmatic skill/role/stack pages are the natural SEO moat (1,000 skills × role-graph) and barely seeded. No /solutions, no /vs hub page, thin guides |
| 10 | **Accessibility / perf** | 6/10 | Light, fast, semantic-ish, JSON-LD | Needs a11y audit (contrast, focus, keyboard), Core Web Vitals baseline, mega-menu keyboard nav when added |

**Composite: ~3.7 / 10.** Translation: a trustworthy MVP that punches *below* the strategy behind it. The strategy is 9/10; the site expressing it is 3.7/10. Closing that delta is the entire job.

**What to protect (do NOT "fix"):** the evidence-gating. "Outcome stats stay empty until instrumentation supports them. Trust badges render only when evidence lands." That is a *feature*. The redesign keeps every claim evidence-gated and turns honesty itself into a marketing weapon (Section F).

---

## 3. SECTION B — Top competitor gallery (you asked to see these)

Eight competitors that matter, each with: positioning, design signature, mega-menu shape, and the steal/avoid call. Grouped by what you'd borrow.

### Tier 1 — Design + IA references (study these for the redesign)

**1. Vervoe** — *vervoe.com* — closest to QOrium's "AI-graded skills, see the work" promise.
- **Positioning:** "AI-powered skills assessments. Hire on merit." Skills-first, anti-resume, auto-grading hero.
- **Design signature:** Warm, human, bold rounded type, candidate-outcome imagery, lots of motion on grading visuals. Friendly-confident.
- **Nav shape:** Product ▾ · Solutions ▾ · Pricing · Customers · Book a Demo. Lean.
- **Steal:** the "watch a real answer get graded" interactive proof. The merit/anti-resume villain framing.
- **Avoid:** light on enterprise trust/security depth; thin India relevance.

**2. TestGorilla** — *testgorilla.com* — cleanest modern SaaS IA in the category.
- **Positioning:** "AI-powered talent sourcing & skills assessments." Volume, breadth, "replace CVs."
- **Design signature:** Crisp, bright, generous whitespace, big test-library grid, role-based landing pages at scale.
- **Nav shape:** Platform ▾ · Solutions ▾ · Resources ▾ · Pricing · Try free / Get a demo. Textbook enterprise mega-menu.
- **Steal:** the test-library-as-hero pattern (our Assessment Library is the equivalent asset); programmatic role pages.
- **Avoid:** breadth-over-depth feel; can read commodity. We win on depth + honesty.

**3. HackerRank** — *hackerrank.com* — category authority / enterprise-credible.
- **Positioning:** "Technical skills platform." Screen · Interview · SkillUp product split.
- **Design signature:** Dark, technical, data-dense, developer-credible, green accent. Feels like infrastructure.
- **Nav shape:** Products ▾ (Screen/Interview/Astra AI) · Solutions ▾ · Resources ▾ · Pricing · Request Demo. Multi-product mega-menu.
- **Steal:** the "products as named SKUs" mega-menu (maps 1:1 to our ReadyBank / JD-Forge / Stack-Vault); the AI-interviewer (Astra) module framing.
- **Avoid:** coding-only narrowness; heavy, can feel cold.

### Tier 2 — Enterprise + India credibility references

**4. iMocha** — *imocha.io* — "Skills Intelligence" enterprise motion.
- **Steal:** the pivot from "tests" to "skills intelligence" (graph/insights language) — validates our role-graph as a hero asset. Strong Solutions-by-industry mega-menu.
- **Avoid:** enterprise-bloat, busy pages.

**5. Mercer Mettl** — *mettl.com* — deepest India enterprise reach (our home turf rival).
- **Steal:** Solutions split by **industry + function**, proctoring/credibility trust shell, India enterprise logos.
- **Avoid:** dated, dense, legacy-enterprise feel. We can look a decade newer.

**6. CodeSignal** — *codesignal.com* — premium, research-led, "skills science."
- **Steal:** the research/methodology-as-marketing move (their General Coding Assessment Framework). This is the template for our **Science page** — our I/O-psych + IRT story.
- **Avoid:** US-centric, premium-priced positioning we don't need to mimic.

### Tier 3 — Out-of-category design north-stars (for the "wow")

**7. Vanta / Drata (trust & compliance SaaS)** — the gold standard for *making trust the product*. If our differentiator is "audit-forward, DPDP-aligned, show our work," their Security/Trust Center pattern is exactly what our trust shell should feel like.

**8. Stripe / Linear / Vercel (developer-enterprise design)** — the bar for design system, dark enterprise surfaces, signature motion, and "infrastructure-grade" credibility. This is the *visual ceiling* to aim at for a world-class build.

### → Your pick (this is the decision)

Three coherent directions. Pick one, or paste your own reference and I'll match it.

| Direction | Feels like | Best for | Risk |
|---|---|---|---|
| **A. "Trust Infrastructure"** (RECOMMENDED) | Vanta × Stripe — dark enterprise surfaces, signature "evidence ledger" motif, data-viz of the anti-leak/IRT moat, restrained motion | Leaning *all-in* on the honesty differentiator; GCC + platform buyers who buy on defensibility | Needs strong art direction to not feel cold |
| **B. "Skills, Shown"** | Vervoe × TestGorilla — bright, human, candidate-outcome imagery, interactive grading proof front-and-center | Leaning on the *product wow* (JD→test, graded answers); staffing + mid-market | Risks looking like the category, less "category-creator" |
| **C. "India-Built Enterprise"** | Mettl-credible but a decade newer; India-first proof, GCC stack depth, regional-language signal | Leaning hard into the India/GCC beachhead | Could cap the global aspiration if over-indexed |

My recommendation is **A**, with the interactive proof hooks from **B** layered in — it dramatizes the moat *and* keeps the honesty promise as the brand's spine. But this is your call; tell me the direction (or drop the exact design) and I'll lock the design system around it.

---

## 4. SECTION C — Gap analysis (current vs world-class enterprise bar)

| Capability | Current QOrium | World-class bar | Gap severity | Redesign move |
|---|---|---|---|---|
| Mega-menu / IA | None (flat links) | Multi-column mega-menu, buyer + product + solution routing | 🔴 Critical | Section D mega-menu + Section E sitemap |
| Buyer segmentation | One generic story | Distinct paths: Platforms / Enterprises-GCC / Staffing | 🔴 Critical | 3 "Solutions by buyer" landing pages |
| SKU storytelling | SKUs not navigable | Named products with dedicated pages | 🔴 Critical | ReadyBank / JD-Forge / Stack-Vault product pages |
| Moat / science | 1 line | Methodology page, IRT explainer, anti-leak explainer, author-pipeline page | 🔴 Critical | "The QOrium Method" hub (Section F) |
| Trust shell | Honest strip only | Security page, Trust Center, DPDP/compliance, sub-processors | 🟠 High | Trust Center + Security + Compliance pages |
| Interactive proof | Static cards | Live JD→test demo, graded-answer viewer, sample-question explorer | 🟠 High | 2–3 interactive hero widgets |
| Social-proof system | Empty (correct) but no slots | Logo rail, quote blocks, case studies — *gated, ready to populate* | 🟠 High | Evidence-gated proof components behind feature flags |
| Programmatic SEO | 25 skills / 5 compares / 6 guides | 1,000+ skill pages, role pages, /vs hub, stack pages, resource library | 🟠 High | Role-graph-driven programmatic page factory |
| Design system | Default SaaS | Signature motif, dark surfaces, motion, data-viz, brand tokens | 🟠 High | Design system in chosen direction (Section B) |
| Pricing depth | Single pricing nod | Per-SKU pricing, tier tables, "talk to sales" for founder-locked tiers | 🟡 Medium | 3 SKU pricing pages (copy already drafted in `sales/Pricing-Pages-3-SKUs-Copy.md`) |
| Conversion / lead-gen | 2 CTAs | Segmented CTAs, sample-pack lead magnet, qualified demo flow | 🟡 Medium | CTA architecture + sample-pack gated download |
| Accessibility / perf | Decent, unverified | WCAG 2.1 AA, CWV green, keyboard mega-menu | 🟡 Medium | a11y audit + perf budget in build gate |

**Honesty constraint carried through every row:** no logo we don't have, no stat we can't instrument, no certification we don't hold. Gated components render only when evidence lands. This is non-negotiable and it's also our edge.

---

## 5. SECTION D — QOrium mega-menu (Maitro / ProveIQ pattern)

Drafted in the same multi-column enterprise mega-menu structure we used for Maitro and ProveIQ: top-level items open a full-width panel with grouped columns + a featured right-rail promo. (If you want pixel-1:1 parity with the exact Maitro/ProveIQ column counts and promo card, point me at that menu file and I'll match it to the unit.)

**Top-level bar:**
`QOrium [logo]  ·  Platform ▾  ·  Solutions ▾  ·  Why QOrium ▾  ·  Resources ▾  ·  Pricing  ·  [Book a demo]  ·  [Sign in]`

---

### ▾ PLATFORM (the 3 SKUs + the engine)

| Col 1 — Products | Col 2 — The Engine | Col 3 — Delivery | Right rail (featured) |
|---|---|---|---|
| **ReadyBank** — calibrated skill-wise library, 1,000+ skills *(icon)* | **Anti-Leak Rotation** — scan → retire → regenerate → revalidate | **REST API** — programmatic content access | **Featured: The Assessment Library** — "Browse seeded skill pages with calibration status." → CTA |
| **JD-Forge** — paste a JD, get a structured assessment | **IRT Calibration** — psychometrically defensible difficulty | **Bulk Export** — CSV/JSON, multi-platform | thumbnail + "See it live" |
| **Stack-Vault** — customer-exclusive, watermarked, IP-protected | **Watermark-per-Candidate** — forensic leak attribution | **Embedded Widget** — drop-in assessment surface | |
| | **Role-Graph** — role × skill × difficulty × format taxonomy | **White-Label** — private enterprise delivery | |

### ▾ SOLUTIONS (by buyer — this is the missing routing)

| Col 1 — By buyer | Col 2 — By role hired | Col 3 — By stack (India edge) | Right rail |
|---|---|---|---|
| **Assessment Platforms** — license content via API | Software Engineering | SAP (ABAP, HCM, FICO) | **Featured: Talpro is Customer Zero** — "How we dogfood QOrium daily." |
| **Enterprises & GCCs** — exclusive Stack-Vaults | Data / ML / Analytics | Oracle (EBS, HCM, Apps) | |
| **IT Staffing Firms** — ReadyBank + JD-Forge subscriptions | DevOps / SRE / Cloud | Salesforce / ServiceNow | |
| **Mid-market hiring teams** — on-demand JD-Forge | Non-tech (Sales, Support, Finance) | Embedded / Mainframe / BFSI | |

### ▾ WHY QORIUM (the moat + trust shell — our differentiator made navigable)

| Col 1 — The Method | Col 2 — Trust & compliance | Col 3 — Compare | Right rail |
|---|---|---|---|
| **The QOrium Method** — AI-authored, I/O-psych-validated | **Trust Center** — security posture, evidence-gated | **vs Vervoe** | **Featured: "We show our work."** — the evidence-gating manifesto page |
| **Assessment Science** — IRT, validity, bias testing | **DPDP & Data Handling** — India-first compliance | **vs HackerRank** | |
| **Anti-Leak, Explained** — why banks rot, how we rotate | **Security** — architecture, sub-processors | **vs Mercer Mettl** | |
| **Author & Validate** — the SME pipeline | **Responsible AI** — what's shipped vs beta vs roadmap | **vs iMocha / CoderByte** | |

### ▾ RESOURCES

| Col 1 — Learn | Col 2 — Proof | Col 3 — Build | Right rail |
|---|---|---|---|
| Guides & Playbooks | Case Studies *(gated until live)* | API Documentation | **Featured: Sample Pack** — download a real, calibrated question pack (lead magnet) |
| Blog / Research | Customer Stories *(gated)* | Changelog / Roadmap | |
| Glossary (skills taxonomy) | Benchmarks & Reports | Status / Uptime | |

**Pricing** and **Book a demo** stay as direct top-level items (highest-intent, no submenu).

**Mega-menu behaviors:** full-width panel, keyboard-navigable (WCAG), 150ms hover-intent delay, mobile = accordion, icons per product, right-rail promo rotates by context. Evidence-gated items (case studies, badges) hidden entirely until their flag flips — never shown as "coming soon."

---

## 6. SECTION E — Full site IA / sitemap

```
/
├── Platform
│   ├── /platform/readybank
│   ├── /platform/jd-forge
│   ├── /platform/stack-vault
│   └── /platform  (engine overview: anti-leak, IRT, watermark, role-graph, delivery modes)
├── Solutions
│   ├── /solutions/assessment-platforms
│   ├── /solutions/enterprises-gcc
│   ├── /solutions/staffing-firms
│   ├── /solutions/role/{software,data,devops,non-tech}     (programmatic)
│   └── /solutions/stack/{sap,oracle,salesforce,...}        (programmatic, India edge)
├── Why QOrium
│   ├── /method                      (The QOrium Method hub)
│   ├── /science                     (IRT, validity, bias)
│   ├── /anti-leak
│   ├── /authoring                   (SME pipeline)
│   ├── /trust                       (Trust Center)
│   ├── /security
│   ├── /compliance-dpdp
│   ├── /responsible-ai              (shipped vs beta vs roadmap — the honesty page)
│   └── /vs/{vervoe,hackerrank,mettl,imocha,coderbyte}      (5 live + expandable)
├── Library
│   └── /library/{skill}             (1,000+ programmatic skill pages — SEO moat)
├── Resources
│   ├── /guides/{slug}
│   ├── /blog/{slug}
│   ├── /glossary
│   ├── /case-studies   (gated)
│   ├── /benchmarks
│   ├── /docs           (API)
│   ├── /changelog
│   └── /sample-pack    (lead magnet)
├── /pricing            (hub) → /pricing/{readybank,jd-forge,stack-vault}
├── /demo               (qualified booking)
├── Company
│   ├── /about  /careers  /contact  /press  /legal/{privacy,terms,dpa,msa}
```

Net new destinations vs today: ~18 hero pages + the programmatic factories (library skills, role, stack, vs). This is the architecture that makes the strategy legible.

---

## 7. SECTION F — Redesign blueprint (narrative, pages, design system, trust, conversion)

### 7.1 Narrative spine (homepage, top to bottom)
1. **Hero** — the honesty promise, dramatized. *"Skills assessments you can defend in an audit."* Sub: India-built, IRT-calibrated, anti-leak-rotated, watermark-per-candidate. Primary CTA: Book a demo · Secondary: Explore the Library. Interactive: live "evidence ledger" motif (Direction A) or graded-answer player (Direction B).
2. **The villain** — leaked question banks rot in 6–9 months. Show the leak timeline. (Straight from `01-Market-Landscape.md` §2.1.)
3. **The 3 products** — ReadyBank / JD-Forge / Stack-Vault, one line + visual each, routing into Platform pages.
4. **The moat, made visible** — the 7 gaps as an interactive "8-dimension" strip (no competitor covers >2; we cover all 8). From `03-Gap-Analysis.md` §6.
5. **Proof of work** — JD-Forge interactive demo OR sample-question viewer (the "wow"). Show, don't tell.
6. **Buyer routing** — three cards: Platforms / Enterprises-GCC / Staffing → Solutions pages.
7. **Trust strip (kept + leveled-up)** — evidence-gated badges, Talpro Customer-Zero, "no unsupported claims" manifesto link.
8. **Final CTA** — Book a 20-min walkthrough.

### 7.2 Page-by-page hero specs (the priority builds)
- **Each SKU page:** problem → how it works (pipeline diagram) → proof → pricing nod → CTA. Differentiated copy already exists in `sales/Pricing-Pages-3-SKUs-Copy.md`.
- **Each Solutions-by-buyer page:** their specific pain (platform content-team cost / GCC leak + stack depth / staffing leaked-bank problem) → matched SKU → proof → CTA.
- **The Method / Science / Anti-Leak pages:** this is our CodeSignal-style research-as-marketing. Diagrams, validity evidence, I/O-psych sign-off story. Turns the moat into authority content.
- **Trust Center:** Vanta-pattern. Security posture, DPDP handling, sub-processors, and the "shipped vs beta vs roadmap" honesty table front-and-center.

### 7.3 Design system direction (locks after your Section B pick)
Required stack per UI Design Bible: shadcn/ui + Tailwind v4 (structure) · Aceternity/Magic UI (effects) · Motion v12 (engine). Per-product color identity. Banned: Inter/Roboto/system as primary, default shadcn theme, purple-gradient-on-white, sections without entrance animation. A signature motif (Direction A: "evidence ledger" / data-viz of calibration & rotation) is what separates "leader" from "MVP."

### 7.4 Trust shell (the honesty differentiator, productized)
The current site already does the hard, rare thing: it gates claims behind evidence. The redesign turns that into a **named, navigable asset** — a "We Show Our Work" manifesto + a live "Shipped / Beta / Roadmap" status table + Trust Center. No competitor markets their honesty. We can own it.

### 7.5 Conversion architecture
- Segmented CTAs per buyer (Platform → "Talk to API sales"; GCC → "Scope a Stack-Vault"; Staffing → "Start free trial").
- **Sample-Pack lead magnet** — gated download of a real calibrated pack (we have populated packs in `sales/Sample-Pack-*`). High-intent email capture.
- JD-Forge interactive trial as the top-of-funnel wow.
- Qualified demo flow (segment + volume + stack questions) feeding the right SKU motion.

---

## 8. SECTION G — Build plan (apex doctrine: Claude specs → Codex builds)

No calendar dates — exit-criteria gated, sequenced by dependency.

| Phase | Exit criteria | Lane |
|---|---|---|
| **0. Direction lock** | CEO picks Section B direction (or shares exact design); design tokens + 1 hero mock approved | Claude spec + CEO |
| **1. Design system + mega-menu** | shadcn/Tailwind v4 component lib, mega-menu (keyboard + mobile accordion), header/footer shipped to prod, Rakshak ≥ 80/80 | Codex (ARJUN marketing lane) |
| **2. Core pages** | Homepage v2 + 3 SKU pages + 3 Solutions-by-buyer pages live | Codex ARJUN |
| **3. Trust + Method shell** | /method /science /anti-leak /trust /security /compliance-dpdp /responsible-ai live | Codex ARJUN |
| **4. Interactive proof** | JD→test demo widget + sample-question viewer + Sample-Pack lead magnet | Codex BHIMA (api hooks) + ARJUN (ui) |
| **5. Programmatic SEO** | role-graph page factory: skill + role + stack + /vs pages generated, JSON-LD, sitemap | Codex BHIMA |
| **6. Proof population** | evidence-gated logo rail / case-study / outcome-stat components wired to flags; flip as evidence lands | Codex ARJUN |

Each phase ships atomically (build in /tmp → releases/<SHA> → flip symlink → pm2 reload), `next build` clean, security headers, a11y + CWV in the gate. I'll stage the Codex KARYA briefs (Lane A backend / Lane B marketing) the moment you lock the direction.

---

## 9. What I need from you (one consolidated ask)

1. **Lock the design direction** — A (Trust Infrastructure, my rec), B (Skills Shown), or C (India-Built Enterprise) — **or paste the exact design reference** you have in mind. Everything downstream keys off this.
2. **Confirm the mega-menu structure** in Section D (and point me at the Maitro/ProveIQ menu file if you want pixel-1:1 column parity).
3. **Confirm SKU public naming** stays ReadyBank / JD-Forge / Stack-Vault for the site (or marketing rename pre-launch).

Give me #1 and I start staging the Codex build briefs immediately — I won't bounce any further technical choices to you.

---

*Sources: live crawl of qorium.online (2026-06-01); nav structures of testgorilla.com, vervoe.com, hackerrank.com (2026-06-01); QOrium internal `01-Market-Landscape.md`, `03-Gap-Analysis.md`, `05-...-SKU-Architecture.md`, `sales/Pricing-Pages-3-SKUs-Copy.md`; CTO Constitution UI Design Bible + 80-pt quality gate.*
