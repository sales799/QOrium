# CODEX PENDING — QOrium Marketing CONTENT-ONLY Refresh v1 (Lane B)

**CEO directive 2026-06-03:** **Change the CONTENT only. The look & feel stays exactly as live.** No design, CSS, layout, component-structure, font, or color changes.

**Scope already applied by Cowork (review + build + deploy):** buyer-POV copy edits, in-place, to text literals only in:
- `qorium-app/apps/web/src/marketing/data.ts` — core-page `title/summary/cta/proof/sections` + `routePageFactory` defaults (the ~1,180 generated pages now read buyer-POV instead of the meta boilerplate).
- `qorium-app/apps/web/src/marketing/MarketingPage.tsx` — **string literals only** in the home `stats`, `competitorSignals`, sitemap-grid labels, `SectionIntro` props, `ProductConsole`, compare table, `GapGrid`, and the hero ledger caption. **No JSX, className, structure, or style was touched.**

Both files pass a TypeScript parse check (0 syntax errors). No `globals.css`, no component markup, no layout changed.

## What was removed (the build-voice the CEO flagged on the live homepage)
- The `CLAIM / EVIDENCE STATUS / Flag off / Module hidden` framing and "gated until proof exists" → replaced with buyer outcomes.
- "The rebuild covers the complete public website surface" + route-count stat tiles ("1,193 generated public routes", "1,000 library pages", "0 unsupported claims") → buyer stats (skills covered, ways to buy, Talpro Customer Zero, no unproven claims).
- "The gap is no longer information. The gap is proof architecture." + competitor-audit grid → "What you get that no one else gives you" + QOrium outcome grid.
- "From MVP website to enterprise product marketing system" + gap-analysis grid → "A score you can stand behind" + defensibility grid.
- "Fair competitor pages sell QOrium without smearing the market" + empty "QOrium position: explicit and buyer-facing" cells → a real differentiator table.
- `data.ts`: "designed around proof slots / Founder-safe claims", "Content is the product", "founder-locked / No fake precision", "the page routes…", "SEO and sales surface", "explain the business model" → buyer-POV equivalents.

## Codex tasks (NO design changes)
1. **Review** the two diffs. Confirm zero changes outside string literals (no class/markup/CSS deltas). `git diff --stat` should show only `data.ts` and `MarketingPage.tsx`.
2. **Build:** `npm run build` 0 err · `npx tsc --noEmit` 0 err · `next build` clean.
3. **Banned-words gate (add as CI):** scan rendered HTML for: `rebuild, MVP website, sitemap routes, proof architecture, proof slots, founder-locked, founder-safe, the redesign, complete public surface, gated until proof, unsupported claims, world-class, seamless, leverage, unlock, supercharge`. Any hit fails the build. ("rebuilding the content team" on `/solutions/assessment-platforms` is a legit buyer phrase — allowlist that exact string.)
4. **Deploy (atomic, live look unchanged):** build in `/tmp` → `releases/<SHA>/` → flip `current` symlink → `pm2 reload` the marketing app (`--update-env` if env changed). Source `NEXT_PUBLIC_*` before build. Add/verify watchdog. Respect the dual-origin KEEP-NOW routing — deploy to the origin that serves the content this repo drives; verify which via the deployed strings.
5. **Verify:** `curl` the home + 6 flagship pages, confirm the new copy renders and the visual is pixel-identical to before (screenshot diff = layout unchanged). Run Rakshak; GO ≥80/80 before public flip. Log SHA to `QUEUE-QOrium.md`.

## CEO hard-blocker (one consolidated ask)
- `/pricing` copy now says "Start free / transparent INR-native tiers" but shows **no figures** (none were hardcoded). If you want actual numbers on the page, ratify them; otherwise the current structure-only pricing copy ships as-is.

## Reference (NOT a design instruction)
`QORIUM_WEBSITE_REDESIGN_BLUEPRINT_v1.md` remains the *content/IA strategy* reference (messaging, gap analysis, per-page intent). Its §4 design-system notes are **superseded** by "preserve live look & feel" — ignore any visual recommendation there. Use it only for copy direction and the optional future IA/301 cleanup, which is a **separate** decision and not part of this content-only change.
