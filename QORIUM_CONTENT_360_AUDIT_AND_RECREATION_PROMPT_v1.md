# QOrium Content — 360° Audit, Rectification & End-to-End Recreation Prompt

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Author:** CTO (Claude — Super Brain lane; spec/prompt only. Codex ARJUN builds.)
**Date:** 2026-06-01
**Audited surface:** https://qorium.online/ live homepage copy (rendered 2026-06-01)
**Companion specs:** `MARKETING_REDESIGN_360_v1.md` (IA/design — already locked A+B+C), `MARKETING_SITE_IA_v1.md` (sitemap + section map), `01-Market-Landscape.md`, `03-Gap-Analysis.md`, `sales/Pricing-Pages-3-SKUs-Copy.md`, `brand/QOrium-Brand-Asset-Spec.md`
**Status:** v1.0 — diagnosis + ready-to-run recreation prompt
**Non-negotiable carried through:** evidence-gating honesty stays. We add desire, not claims.

---

## 0. The one-line verdict

The redesign fixed the **architecture** (IA, mega-menu, trust shell, moat made navigable). It did **not** fix the **voice**. The live site is now writing *about its own redesign* in front of the buyer. The copy reads like a build log because, literally, the spec got shipped as the copy.

**The disease has a precise name: build-voice.** The page narrates what *the site* and *the redesign* are doing, exposes internal mechanisms (feature flags, "modules hidden"), and leads with internal taxonomy ("eight-dimension moat," "I/O-psych validation path," "role-graph organization"). A buyer doesn't care what the site does. They care what *happens to them*.

The rectification is not a rewrite of words — it's a change of **point of view**: from *system describing itself* to *buyer seeing their own problem solved.*

---

# PART 1 — CONTENT AUDIT & RECTIFICATION

## 1.1 Evidence: the actual live copy that fails

These are verbatim lines from the live homepage, with the diagnosis and the buyer impact.

| # | Live line (verbatim) | Failure pattern | What the buyer feels |
|---|---|---|---|
| 1 | "The site now turns that risk into the lead story instead of hiding it in a feature list." | **Meta / build-voice** — the page narrates its own editorial decision | "Why is this website talking to itself? Who is this for?" |
| 2 | "The redesign turns QOrium's content lifecycle into a scannable proof system instead of burying it in back-office language." | **Meta + jargon** — references "the redesign," then says "back-office language" *in* back-office language | Confusion. No product benefit landed. |
| 3 | "The sample viewer keeps the proof concrete without rendering unavailable capture or widget flows." | **Implementation-leak** — describes what the UI *can't* render yet | "They're telling me what's broken. Not confidence-inspiring." |
| 4 | Hero table: "CLAIM / EVIDENCE STATUS / PUBLIC BEHAVIOR · Flag off · Module hidden" | **Internal QA surfaced as UI** — feature-flag states shown to a prospect | "Module hidden? Is this even finished?" Kills trust instead of building it. |
| 5 | "This strip names the trust posture without showing logo rails, case studies, or outcome numbers ahead of evidence." | **Meta** — describes the section's own gating logic | The honesty *intent* is right; the *narration* of it is the problem. |
| 6 | "The homepage now routes platform leaders, GCC teams, and staffing firms into distinct conversion stories." | **Meta + funnel-jargon** ("conversion stories," "routes") | Buyer is told they're being routed. Nobody wants to feel processed. |
| 7 | "EIGHT-DIMENSION MOAT" → "01 AI-authored pipeline … 08 Content API first" | **Internal taxonomy as headline** — a numbered list of mechanisms | A wall of nouns. No outcome, no reason to care about any one item. |
| 8 | "QOrium packages India-built assessment content, JD-specific authoring, and private stack libraries inside an evidence-first trust shell." | **Feature-stacking** — three nouns + a metaphor, zero verbs the buyer performs | "What do I *get*? What changes for me?" unanswered. |

**The hero headline is the bright spot:** *"Skills assessments you can defend in an audit."* That is a real, buyer-felt promise — outcome, stakes, emotion. The rest of the page abandons that voice within one scroll.

## 1.2 The 7 content failure patterns (the rule set we're breaking)

1. **Build-voice / meta-copy.** The page references itself, "the redesign," "the site now," "this strip," "the homepage now." → *Never refer to the website, the redesign, the section, or the page inside the copy.*
2. **Implementation leakage.** "Flag off," "module hidden," "without rendering unavailable … flows." → *Internal states (flags, beta, not-yet-built) never appear as visitor-facing words. Gate by hiding, not by narrating the gate.*
3. **Taxonomy-as-headline.** "Eight-dimension moat," "role-graph organization." → *Lead with the outcome; the internal name (if kept at all) is a subhead, never the hook.*
4. **Feature-stacking without a verb.** Nouns piled up ("content, authoring, libraries, trust shell"). → *Every block answers "what changes for you," with the buyer as the subject of the sentence.*
5. **No stakes, no villain, no emotion** (except the leak section, which is close). → *Every page opens on the buyer's pain or ambition, not our mechanism.*
6. **One voice for three buyers.** Platform / GCC / Staffing get one generic frame. → *Three buyers, three pains, three proof paths, three CTAs.*
7. **Proof told, not shown — then apologized for.** The "proof of work" section explains why it *can't* show things. → *Show the one concrete artifact we do have (the JD→plan sample is genuinely good) and let it speak; cut the apology.*

## 1.3 Content-specific scorecard (distinct from the design 360)

The earlier 360 scored IA/design. This scores **copy & message**, 10 = Stripe/Linear/Vanta narrative bar.

| Dimension | Score | Note |
|---|---|---|
| Hero clarity & desire | 6/10 | Headline strong; sub-head reverts to feature-stack |
| Buyer-centricity (POV) | 2/10 | System is the subject, not the buyer |
| Emotional arc / stakes | 4/10 | Leak section lands; rest is flat |
| Plain language (anti-jargon) | 3/10 | Taxonomy and funnel words dominate |
| Build-voice discipline | 1/10 | Pervasive meta narration |
| Proof expression | 4/10 | Great raw asset (JD→plan), wrapped in apology |
| Buyer segmentation in copy | 3/10 | Named, not spoken-to |
| Honesty/trust *as desire* | 5/10 | Right intent, narrated instead of felt |
| CTA specificity | 6/10 | Decent; not yet buyer-matched |
| Scannability / rhythm | 5/10 | Dense, abstract, low contrast of idea |
| **Composite** | **~3.9 / 10** | Trustworthy and honest — but talking to itself, not the customer |

## 1.4 What to PROTECT (do not "fix")

- **The evidence-gating principle.** No logo we don't have, no stat we can't instrument, no badge we don't hold. This is the brand's spine and a true differentiator. *We keep the discipline; we stop narrating the mechanism.*
- **The hero promise** — "defend in an audit." Keep and amplify.
- **The leak-timeline story.** Strongest narrative asset on the page. Keep the structure; strip the meta sentence.
- **The JD→assessment-plan sample.** Genuinely the "show don't tell" moment. Feature it; lose the disclaimer wrapper.

---

# PART 2 — THE CONTENT OPERATING SYSTEM (rules the recreation must obey)

## 2.1 Voice & tone charter

QOrium sounds like **a senior practitioner who refuses to bullshit you.** Confident, concrete, plain-spoken, evidence-first. Closer to Stripe/Linear than to hype-SaaS. Indian-built and proud, never parochial. Honesty is a *flex*, not a confession.

- **Person:** speak to "you" (the buyer). QOrium is "we." Never "the site/page/redesign."
- **Tense:** present, active. The buyer is the subject of the verb.
- **Sentences:** short. One idea each. Concrete noun + strong verb beats adjective pile-ups.
- **Jargon budget:** a technical term must earn its place by being something the buyer *already says*. "IRT-calibrated" is allowed *once it's been translated* ("so a hiring manager's score holds up in a tribunal").

## 2.2 The BANNED list (hard fail in QA)

Any of these in visitor-facing copy = automatic reject:

- Meta references: "the site," "this page," "the redesign," "the homepage now," "this strip," "this section," "we redesigned," "turns … into a scannable proof system."
- Implementation leak: "flag," "flag off," "module hidden," "feature-state," "not yet rendered," "without rendering," "back-office language," "coming soon," "beta" (as a visible label on marketing pages).
- Funnel/internal jargon as buyer copy: "conversion story," "buyer routing," "route … into," "lead story," "proof system" (as self-description).
- Taxonomy-as-hook: a headline whose first words are an internal label ("Eight-dimension moat," "Role-graph organization," "I/O-psych validation path").
- Empty intensifiers: "world-class," "cutting-edge," "next-gen," "robust," "seamless," "leverage," "unlock," "supercharge."

## 2.3 Evidence-gating, expressed as desire (not as a flag table)

The current hero shows a CLAIM/EVIDENCE/BEHAVIOR table with "Flag off / Module hidden." **Delete that table from the hero.** Gating is enforced by *what renders*, never by *narrating what's hidden*.

Where honesty is the message (the trust strip), phrase it as a promise the buyer benefits from:

- ❌ "No customer logo rail without a live evidence flag."
- ✅ "We don't show a logo wall we haven't earned. When a customer says yes to being named, they show up here — not before."
- ❌ "No unsupported outcome statistics."
- ✅ "Every number on this site is one we can put in front of your auditor. If we can't prove it, we don't print it."

Same discipline. Now it sells.

## 2.4 Message architecture — the arc every page rides

`PAIN/AMBITION → STAKES (what it costs you) → THE SHIFT (the new way) → PROOF (shown) → THE PATH (one clear next step)`

The buyer is the hero; QOrium is the guide. Mechanism (IRT, anti-leak, watermark, role-graph) appears only *after* the pain, and always translated into a buyer outcome.

## 2.5 Three buyers, three spines

| Buyer | The pain they feel | The line they need to hear | Proof that lands | CTA |
|---|---|---|---|---|
| **Assessment Platforms** | Authoring teams are expensive; content goes stale | "License calibrated content through an API instead of staffing an authoring team." | API + library depth + rotation | "Talk to API sales" |
| **Enterprises & GCCs** | Leaked banks + can't test their real stack (SAP/Oracle/ABAP) | "A private library for your exact stack, watermarked to every candidate." | Stack-Vault + watermark + India-stack depth | "Scope a Stack-Vault" |
| **IT Staffing Firms** | Submit shortlists clients don't trust | "Send a cleaner shortlist signal — paste the JD, get a defensible pack in seconds." | JD-Forge + ReadyBank speed | "Start a JD-Forge trial" |

---

# PART 3 — THE 360° RECREATION MASTER PROMPT (copy-paste, run end-to-end)

> Use this verbatim as the brief for the content-generation pass. It is model-agnostic for *writing*; the *implementation* into the Next.js marketing repo is executed by Codex ARJUN (Lane B) — see Part 4. Per apex doctrine, Claude/super-brain authors copy + specs; Codex writes the production code. Do not route the code build to Claude.

```
ROLE
You are QOrium's principal brand writer — a senior I/O-psychology-literate B2B
copywriter who writes like Stripe and Linear and refuses to publish a claim QOrium
cannot defend in an audit. You are rewriting every word of the QOrium marketing
site from scratch.

MISSION
Recreate all QOrium marketing copy so it grabs the buyer, makes the product
instantly understandable, and creates desire — while preserving QOrium's
evidence-gating honesty. Kill build-voice. Make the buyer the hero of every page.

NON-NEGOTIABLE CONSTRAINTS
1. EVIDENCE-GATING IS SACRED. Never invent a customer, logo, stat, certification,
   award, or testimonial. If proof doesn't exist, the module does not render — and
   you NEVER write a sentence narrating that it's hidden. Honesty is expressed as a
   buyer benefit, never as an internal flag.
2. BANNED WORDS/PATTERNS (auto-reject — see full list): no "the site/page/
   redesign/this strip/this section," no "flag off/module hidden/beta/coming soon/
   not yet rendered," no "conversion story/buyer routing/lead story/proof system"
   as self-description, no taxonomy-as-headline, no empty intensifiers
   (world-class, cutting-edge, seamless, leverage, unlock, robust, next-gen).
3. POINT OF VIEW: the buyer is "you" and the subject of every verb. QOrium is "we."
   Never let the website, the section, or the redesign be the subject of a sentence.
4. EVERY PAGE rides the arc: PAIN/AMBITION → STAKES → THE SHIFT → PROOF (shown) →
   ONE CLEAR NEXT STEP. Mechanism (IRT, anti-leak, watermark, role-graph) appears
   only after the pain and always translated into a buyer outcome.
5. THREE BUYERS get three voices: Assessment Platforms, Enterprises & GCCs, IT
   Staffing Firms (pains + lines + CTAs defined in the buyer table below).
6. INDIA-BUILT is a strength stated with pride, never an apology or a limitation.

INPUTS TO LOAD BEFORE WRITING (read, do not guess)
- Live copy baseline + audit: QORIUM_CONTENT_360_AUDIT_AND_RECREATION_PROMPT_v1.md
  (this file — Part 1 failures, Part 2 rules, Part 3 golden sample).
- IA + sitemap: MARKETING_SITE_IA_v1.md and MARKETING_REDESIGN_360_v1.md
  (mega-menu, page list, locked design direction A+B+C).
- Substance/facts: 01-Market-Landscape.md (the leak timeline, the villain),
  03-Gap-Analysis.md (the real differentiators), 05-...-SKU-Architecture.md
  (ReadyBank/JD-Forge/Stack-Vault truth), sales/Pricing-Pages-3-SKUs-Copy.md.
- Brand tokens/voice: brand/QOrium-Brand-Asset-Spec.md.

VOICE CHARTER
Senior practitioner who won't bullshit you. Confident, concrete, plain. Short
sentences, one idea each. A technical term must be something the buyer already
says, and must be translated to an outcome on first use.

DELIVERABLE — per page, produce:
  • <eyebrow> short category line (optional; never an internal taxonomy label)
  • <h1> the buyer promise (outcome + stakes), ≤ 9 words where possible
  • <subhead> one sentence: who it's for + what changes for them
  • <body blocks> each = a buyer outcome with the buyer as subject; mechanism
    translated; ≤ 3 sentences per block
  • <proof block> the most concrete real artifact available (e.g., the JD→plan
    sample). No apology, no disclaimer-wrapper.
  • <primary CTA> + <secondary CTA>, buyer-matched
  • <meta title> + <meta description> (SEO; ≤ 60 / ≤ 155 chars; benefit-led)
  • <evidence note> (internal, not rendered): which claims are gated and why,
    so the build hides — never narrates — unproven modules.

PAGES TO RECREATE (priority order)
1. Homepage (hero, leak story, three products, the moat-as-outcomes, the JD→plan
   proof, three-buyer routing-without-saying-routing, honesty-as-flex strip, final CTA)
2. The 3 SKU pages: /platform/readybank, /platform/jd-forge, /platform/stack-vault
3. The 3 buyer pages: /solutions/assessment-platforms, /solutions/enterprises-gcc,
   /solutions/staffing-firms
4. Why-QOrium shell: /method, /science, /anti-leak, /trust (honesty manifesto)
5. /pricing hub + per-SKU pricing
6. Programmatic templates: /skill/:slug and /job-descriptions/:slug
   (write the template voice + 2 fully-worked examples)
7. /vs/{vervoe,hackerrank,mettl,imocha,coderbyte} (factual, no smearing)

THREE-BUYER TABLE
- Assessment Platforms — pain: expensive authoring teams, content rots.
  hook: "License calibrated content through an API instead of staffing an
  authoring team." CTA: "Talk to API sales."
- Enterprises & GCCs — pain: leaked banks; can't test the real stack (SAP/Oracle/
  ABAP). hook: "A private library for your exact stack, watermarked to every
  candidate." CTA: "Scope a Stack-Vault."
- IT Staffing Firms — pain: shortlists clients don't trust. hook: "Paste the JD,
  send a cleaner shortlist signal in minutes." CTA: "Start a JD-Forge trial."

SELF-CHECK RUBRIC (run on every page before returning it; fix and re-run)
[ ] Could a competitor paste their name over this and have it still be true?
    If yes — it's generic. Rewrite until only QOrium can say it.
[ ] Is the website/redesign/section ever the subject of a sentence? If yes — FAIL.
[ ] Any banned word/pattern present? If yes — FAIL.
[ ] Does the buyer appear as "you," doing/getting something, in the first 2 lines?
[ ] Is every number/logo/badge backed by real evidence? If not — remove (don't narrate).
[ ] Read the h1 + subhead alone: does a stranger understand what they get and why
    it matters in under 5 seconds?
[ ] Is there exactly one obvious next step?

OUTPUT FORMAT
Markdown, one section per page, fields labeled as in DELIVERABLE. End each page with
its self-check result (PASS, with any tradeoffs noted). Then a master change-log:
old line → new line for the 8 audited homepage failures, proving each is fixed.
```

## 3.1 Golden sample — worked before/after (the north star to match)

This is the standard every page must hit. Real facts only; nothing invented.

**HERO**

- ❌ Before (sub): "QOrium packages India-built assessment content, JD-specific authoring, and private stack libraries inside an evidence-first trust shell."
- ✅ After:
  - **Eyebrow:** Skills assessment, built in India
  - **H1:** Skills tests you can defend in an audit. *(keep — it works)*
  - **Subhead:** "Hire on evidence, not on a question bank that leaked six months ago. Calibrated content, JD-specific packs, and private stack libraries — every score you can stand behind."
  - **Primary CTA:** Book a 20-min walkthrough · **Secondary:** Explore the library
  - **Cut entirely:** the CLAIM / EVIDENCE STATUS / "Flag off / Module hidden" table.

**THE LEAK STORY**

- ❌ Before: "The site now turns that risk into the lead story instead of hiding it in a feature list."
- ✅ After:
  - **H2:** "Your question bank is rotting. You just can't see it yet."
  - **Body:** "A fresh question gets screenshotted, indexed by prep sites, and taught as a pattern — inside the same hiring year you bought it. By month nine, pass rates spike, the signal's gone, and you're trusting a score that's already been gamed." *(keep the Week 1–4 / Month 2–6 / Month 6–9 timeline; delete the meta sentence)*

**THE MOAT (taxonomy → outcomes)**

- ❌ Before: "EIGHT-DIMENSION MOAT … 01 AI-authored pipeline … 08 Content API first."
- ✅ After:
  - **H2:** "Eight things that keep your tests honest. Most vendors do one or two."
  - Reframe each item as a buyer outcome, e.g.:
    - "01 AI-authored pipeline" → **"Fresh items on demand"** — "New questions generated and validated, so you're never stuck reusing a burned one."
    - "03 Anti-leak rotation" → **"Questions that retire before they leak"** — "We scan, retire, and regenerate on a cycle, so the bank can't go stale on you."
    - "07 Per-client watermarking" → **"Every leak traces back"** — "Each candidate sees a uniquely watermarked variant, so if it surfaces online, you know the source."

**HONESTY STRIP (flag-table → flex)**

- ❌ Before: "No unsupported outcome statistics."
- ✅ After: **"Every number here, we can put in front of your auditor."** — "If we can't prove it, we don't print it. No borrowed logos, no invented win-rates, no badge we haven't earned."

---

# PART 4 — HANDOFF (apex doctrine)

- **Authoring (this prompt + copy):** Claude / Super-Brain lane. Spec only.
- **Implementation into `qorium-marketing` (Next.js):** Codex ARJUN, Lane B. Stage as `CODEX_PENDING_QORIUM_CONTENT_RECREATION_v1_LANE_B_ARJUN.md`. **Do not route this code build to Claude in KARYA — route to Codex via the queue file.**
- **Design tokens:** unchanged — direction A+B+C is locked in `MARKETING_REDESIGN_360_v1.md`. This is a *copy* pass on the existing component system, not a redesign.
- **Gate before prod:** `next build` clean; Rakshak ≥ 80/80; SEO sub-audit ≥ 90; a11y + CWV green; screenshot to `/screenshots/` for human review; atomic release (build /tmp → releases/<SHA> → flip symlink → pm2 reload), `NEXT_PUBLIC_*` sourced before build.
- **QA hard-gate added:** automated scan of rendered copy for the BANNED list (Part 2.2). Any hit fails the build — this is the structural guard against build-voice ever shipping again.

## 4.1 The one decision I need from you

Lock the **voice charter (Part 2.1)** and the **three-buyer lines (Part 2.5)**. Those are yours to own. The moment you confirm, I stage the Codex ARJUN Lane-B brief and the recreation runs end-to-end against the locked design system — no further technical choices bounced to you.

---

*Sources: live rendered copy of qorium.online (2026-06-01); QOrium internal `MARKETING_REDESIGN_360_v1.md`, `MARKETING_SITE_IA_v1.md`, `01-Market-Landscape.md`, `03-Gap-Analysis.md`, `05-...-SKU-Architecture.md`; CTO Constitution voice/quality-gate doctrine; evidence-gating honesty constraint (banked, non-negotiable).*
