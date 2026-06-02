# CODEX PENDING — QOrium Content Recreation v1 (Lane B / ARJUN)

**Lane:** B (marketing site, `qorium-marketing`) — ARJUN (Mac Mini, `bhaskar@talproindia.com`)
**Author of spec:** Claude (Super Brain). **Executor:** Codex ARJUN. Do NOT route this code build to Claude.
**Status:** 🔒 BLOCKED — gated on CEO locking voice charter (Part 2.1) + three-buyer lines (Part 2.5).
**Date staged:** 2026-06-01

## Source of truth
`QORIUM_CONTENT_360_AUDIT_AND_RECREATION_PROMPT_v1.md` — read in full. Part 3 is the master prompt; run it to generate copy. Part 2.2 is the BANNED list. Part 3.1 is the golden before/after sample (the bar to match).

## Why this exists
The live site shipped its redesign spec as buyer copy ("build-voice"): self-referential meta lines, implementation leaks ("Flag off / Module hidden"), taxonomy-as-headline. CEO flagged it as a "tech writeup," not engaging marketing. This is a COPY pass on the EXISTING component system — design direction A+B+C stays locked (`MARKETING_REDESIGN_360_v1.md`). No redesign, no new components unless a copy block has nowhere to render.

## Scope (in priority order)
1. Homepage — replace all copy per Part 3 + golden sample. DELETE the hero CLAIM/EVIDENCE/"Flag off/Module hidden" table.
2. 3 SKU pages: /platform/readybank, /platform/jd-forge, /platform/stack-vault.
3. 3 buyer pages: /solutions/{assessment-platforms,enterprises-gcc,staffing-firms}.
4. Why-QOrium: /method, /science, /anti-leak, /trust (honesty-as-flex manifesto).
5. /pricing hub + per-SKU.
6. Programmatic templates: /skill/:slug, /job-descriptions/:slug (template voice + 2 worked examples).
7. /vs/{vervoe,hackerrank,mettl,imocha,coderbyte} (factual, no smearing).

## Hard QA gate (NEW — build-fails on hit)
Add an automated rendered-copy scan for the Part 2.2 BANNED list:
`the site|this page|the redesign|this strip|this section|flag off|module hidden|coming soon|beta|conversion story|buyer routing|lead story|world-class|cutting-edge|seamless|leverage|unlock|robust|next-gen`
Any match in visitor-facing copy = fail the build. This is the structural guard against build-voice recurring.

## Evidence-gating (unchanged, sacred)
No invented customer/logo/stat/badge. Gate by NOT rendering — never by narrating that something is hidden. Express honesty as buyer benefit (see Part 2.3).

## Definition of done
- All pages recopied; per-page self-check rubric PASS (Part 3).
- BANNED-list QA gate wired into CI and passing.
- `next build` clean (apps/web prod build, not just tsc); a11y + CWV green.
- Rakshak ≥ 80/80; SEO sub-audit ≥ 90.
- Screenshot each page to `/screenshots/<slug>.png` for human review.
- Atomic release (build /tmp → releases/<SHA> → flip symlink → pm2 reload --update-env → pm2 save); `NEXT_PUBLIC_*` sourced before build.
- Re-verify prod (curl -I → 200 + security headers); watchdog present.
- Change-log: old line → new line for the 8 audited homepage failures.

## Unblock trigger
CEO confirms voice charter + three-buyer lines → flip status to READY and run.
