# CODEX PENDING — QOrium Website Redesign v1 (Lane B / ARJUN-eligible, work-stealing)

**Brain source of truth:** `QORIUM_WEBSITE_REDESIGN_BLUEPRINT_v1.md` (this dir). **Visual target:** `qorium-redesign-prototype.html`.
**App:** `qorium-app/apps/web` (Next.js 16, Tailwind v4, shadcn/ui). Marketing content currently lives in `src/marketing/data.ts` + `MarketingPage.tsx`.
**Doctrine:** dependency-ready branches only · cross-account review (author never self-merges) · atomic release for live Next dir · banned-words CI gate is a hard build gate · never fabricate proof.

---

## 0. Non-negotiables (read first)
1. **Voice contract = §2 of the blueprint.** Buyer is the subject of every verb; QOrium = "we"; the site is never a subject. Ship the **banned-words scanner as a CI gate** over rendered copy — any hit fails the build. Wire it in CI before any copy lands.
2. **Evidence-gating stays, never narrated.** No logo not held, no stat not instrumented, no cert not earned (ISO 27001 = M15, bias audit = M16 — both pending). ⟦target⟧ tiles render qualitative proof until instrumented; never a placeholder number and never the words "coming soon / hidden / founder-locked".
3. **PRESERVE THE LIVE LOOK & FEEL (CEO directive 2026-06-03).** Do **not** change the visual system. Keep `apps/web/src/app/globals.css` tokens exactly: ink `#11130f`, shell `#0b3027`, paper `#f6f8f4`, paper-2 `#e7eee9`, saffron `#d4892f`, teal `#187a86`, green `#0d4c3a/#0f6a4c`; **serif display + sans UI + mono eyebrows**; grid-paper texture; dark sticky header + mega-panels. This is a **structural + content refactor in-place** — reuse existing components/styles, swap copy & sections. (Ignore any earlier navy/cyan/Space-Grotesk idea — superseded.)
4. **No new content boilerplate.** Every template (§6) needs ≥3 genuinely data-driven sections. The current single-boilerplate body (and the build-voice copy: the `CLAIM / EVIDENCE STATUS / Flag off / Module hidden` table, "The marketing system now covers the complete public surface", route-count cards, "The redesign turns QOrium's content lifecycle into a scannable proof system") are the defects being removed.

## 1. Branch DAG (depends_on in brackets)
- **B0 — foundation (NO restyle)** [none]: keep existing `globals.css` tokens/fonts/texture; refresh **content** of global Header mega-panels to §3.2 IA (same dark styling, keyboard-nav, 150ms hover-intent already present), Footer to §3.4, CTA registry (§5, fix label≠href), banned-words CI gate. Files: `src/app/globals.css` (untouched visually), Header/Footer components, `scripts/banned-words-check.ts`, CI workflow. Risk: L–M.
- **B1 — 301 + IA cleanup** [B0]: redirect map for D1–D4 (`/features/*`→`/platform/*`, `/vs/*`→`/compare/*`, `/product*`→`/platform`/`/library`, dedupe `-2/-3` roles), brand-name casing dictionary (D6). Files: `next.config` redirects, `src/marketing/brandNames.ts`. Risk: M (SEO-critical — ship early).
- **B2 — flagship 6** [B0,B1]: Home, `/platform`, `/pricing`, `/solutions` hub + 3 landers, `/science`, `/compare` hub + template — built to prototype + §5. Replace build-voice copy. Risk: H.
- **B3 — trust shell** [B0]: `/trust /security /compliance-dpdp /responsible-ai /anti-leak /method` with real content (§5.13–5.18). Risk: M.
- **B4 — catalog** [B0,B1]: `/library` hub + `/library/{skill}` leaf template + `/skill/*` (§5.19, 6.1–6.2) incl. evidence-ledger metadata + public sample items. Risk: H.
- **B5 — programmatic families** [B1,B4]: `/solutions/*`, `/resources/job-descriptions/*`, `/resources/sample-packs/*`, guides/blog templates (§6.3–6.6), each with ≥3 differentiated sections. Risk: M.
- **B6 — customers + resources flagship** [B2]: Talpro Customer-Zero case study (§5.21), resources hub + State-of-Skills report slot. Risk: M.
- **B7 — GEO + instrumentation** [B2]: `/llm-info`, "Ask AI for a summary", KPI tracking (§8), ⟦target⟧ tiles wired to real metrics as they land. Risk: L.

Work-stealing: B2/B3/B4 are parallelizable after B0+B1. ARJUN may take B3/B5; BHIMA B2/B4. Author never approves own merge.

## 2. Acceptance criteria (per branch + global)
- `npm run build` 0 err · `npx tsc --noEmit` 0 err · `next build` clean · banned-words gate green · Lighthouse ≥90 perf/SEO/a11y on flagship pages.
- Every page: one buyer-POV H1, ≥1 real CTA with matching href, correct schema (Product/Article/JobPosting/FAQ as in §6), no `data.ts` boilerplate body reused across >1 route.
- 301s resolve (B1) — no orphaned `/features|/vs|/product` 200s; competitor names correctly cased.
- Pricing renders a committed plan matrix + per-SKU + FAQ (CEO-ratified numbers; until then the prototype figures, flagged in PR for CEO sign-off — do **not** ship "numbers not set").
- `/science` publishes the IRT explanation + standard-we-hold-to; reliability/bias numbers only when measured.
- Atomic release for the live Next dir (build in /tmp → releases/<SHA> → flip symlink → pm2 reload); source `NEXT_PUBLIC_*` before build; add a watchdog + verify after deploy; Rakshak GO ≥80/80 before public flip.

## 3. CEO hard-blockers to surface in ONE consolidated founder_request
- Ratify exact pricing numbers (or approve prototype figures) before `/pricing` publishes.
- Confirm any second customer logo may be shown (else Talpro-only trust strip stays).
- (Font/visual choice settled: preserve live look & feel — no decision needed.)

## 4. Verification step (required)
After B2 merges, run Rakshak on qorium.online + a screenshot diff of the 6 flagship pages vs `qorium-redesign-prototype.html`; run the banned-words gate over rendered HTML (not just source); confirm 301 map with `curl -I`. Log SHAs to QUEUE-QOrium.md with evidence.
