# QOrium Online Design Audit and Execution Handoff

Date: 2026-06-14
Domain: https://qorium.online/
Scope: public marketing site, sitemap, representative desktop/mobile templates, and local implementation pass.

## Executive Summary

QOrium's public site has a strong strategic position: evidence-first hiring, audit-defensible assessments, India residency, and proof-gated claims. The global shell, security headers, canonical product taxonomy, and most Phase 4 template pages are already in good shape.

The live audit found three consistency defects worth fixing immediately:

1. Scroll-reveal wrappers rendered off-screen sections with opacity 0, producing blank full-page captures on the homepage and creating a no-JS/screenshot resilience risk.
2. The cookie consent card covered buyer-critical pricing content on desktop.
3. Legacy solution URLs were still listed in the sitemap and returned 200, competing with the newer canonical solution URLs.

Those three items were fixed in this pass. Remaining work is mostly content governance and comparison-page evidence quality.

## Inputs and Assumptions

- Primary site inspected: `https://qorium.online/`
- Live sitemap inspected: `https://qorium.online/sitemap.xml`
- Local app inspected after edits: `http://127.0.0.1:3108`
- Representative page templates inspected:
  - `/`
  - `/platform`
  - `/library`
  - `/solutions/role/software`
  - `/pricing`
  - `/compare/qorium-vs-vervoe`
  - `/demo`
  - `/trust/security`
- Assumption: unauthenticated public marketing experience is the priority. Authenticated product surfaces were not included.

## Global Design Constitution

### Brand Expression

QOrium should feel like trust infrastructure for hiring, not a generic SaaS assessment tool. The stable signals are dark evidence-led shell, calm teal accent, proof-gated language, visible compliance restraint, and dense but readable operational surfaces.

### Design Principles

- Evidence before marketing claim.
- Buyer task completion before decoration.
- Canonical information architecture before page proliferation.
- Public pages must survive screenshots, PDF capture, crawlers, reduced motion, and no-JS conditions.
- Comparison pages must be fair, source-backed, and careful with competitor claims.

### Visual Foundations

- Primary shell: dark ink surface with grid/data texture.
- Content bands: pale operational backgrounds, not decorative gradients.
- Accent: signal teal for CTAs, links, icons, and proof markers.
- Cards: restrained 8px radius or less, clear borders, no nested-card stacking.
- Motion: reveal may add movement, but content must never be invisible until user interaction.

### Content Standards

- Use concrete, defensible claims.
- Avoid unsupported metrics and customer proof.
- Comparison content must distinguish public-source evidence, internal-source evidence, and opinion.
- CTAs should remain stable across pages: demo, pricing, library, product detail, and trust.

## Current-State Domain Inventory

### Strengths

- Homepage positioning is clear: "Skills assessments you can defend in an audit."
- Headers include good security posture: HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- Sitemap is broad and strategically useful: 171 live URLs before the fix.
- Main route families exist for product, buyer solutions, library, role pages, stack pages, resources, trust, legal, and comparisons.
- Most inspected pages had one H1, a `main` landmark, and usable heading hierarchy.

### Problems Found

| Severity | Area                    | Finding                                                                                                                                                     | Status  |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P1       | Motion/no-JS resilience | Full-page screenshots showed large blank bands because reveal wrappers started at opacity 0 until viewport entry.                                           | Fixed   |
| P1       | Conversion UI           | Cookie consent covered pricing plan cards and CTAs on desktop.                                                                                              | Fixed   |
| P2       | IA/SEO                  | `/solutions/platforms`, `/solutions/enterprises`, and `/solutions/staffing` remained in sitemap and returned 200, while newer canonical pages also existed. | Fixed   |
| P2       | Comparison proof        | Comparison pages use internal-source labels for competitor facts. This is weak for buyer trust and SEO.                                                     | Backlog |
| P3       | Visual system           | Index and generated template pages overuse similar white cards, creating a repetitive page texture.                                                         | Backlog |
| P3       | Crawl ergonomics        | Full 171 URL check hit public rate limits after the first tranche. This is acceptable protection, but crawler allowances should be reviewed separately.     | Backlog |

## Sitemap and IA Report

Live sitemap before fix:

- Count: 171 URLs
- Legacy solution aliases present:
  - `/solutions/platforms`
  - `/solutions/enterprises`
  - `/solutions/staffing`

Local sitemap after fix:

- Count: 168 URLs
- Legacy solution aliases removed from sitemap.
- Redirects verified locally:
  - `/solutions/platforms` -> 308 -> `/solutions/assessment-platforms`
  - `/solutions/enterprises` -> 308 -> `/solutions/enterprises-gcc`
  - `/solutions/staffing` -> 308 -> `/solutions/staffing-firms`
  - `/product/assessment-library` -> 308 -> `/library`
  - `/resources/docs` -> 307 -> `/platform/api`

## Template Family Redesign Plans

### Homepage

Current purpose: explain the leak problem, three products, proof posture, buyer paths, and final demo/library CTA.

Issue fixed: off-screen sections were invisible in full-page capture because motion primitives used opacity 0 for hidden state.

Acceptance:

- Full-page desktop screenshot shows every homepage band.
- Mobile full-page screenshot shows every homepage band.
- Motion remains reduced-motion aware.

### Pricing

Current purpose: make INR pricing explicit and route buyers to demo/pricing call.

Issue fixed: cookie banner no longer covers the pricing cards.

Acceptance:

- Plan cards and plan CTAs remain visible while cookie consent is open.
- Banner remains dismissible by accept, decline, and close.
- Cookie policy link remains available.

### Solution Pages

Current purpose: buyer-specific entry points.

Issue fixed: old solution URLs are canonicalised through redirects and removed from sitemap.

Acceptance:

- Old aliases redirect with 308.
- Sitemap includes only canonical buyer solution URLs.
- Internal copy/nav links target canonical URLs.

### Comparison Pages

Current purpose: SEO and buyer comparison.

Remaining issue: competitor facts should not rely only on `internal-source` labels.

Recommended next change:

- Add public source URLs per competitor comparison row where available.
- If a fact is not public-source backed, mark it as "QOrium assessment" or remove it.
- Add a visible source panel with retrieval date and source type.

## Shared Implementation Backlog

Done in this pass:

- Make `Reveal`, `FadeIn`, and `StaggerItem` screenshot/no-JS resilient by keeping hidden-state opacity at 1.
- Move cookie consent into a compact centred banner instead of a bottom-right overlay.
- Add canonical redirects for legacy solution routes.
- Remove legacy solution routes from sitemap.
- Update stale internal solution links in `site.config.ts` and `copy/home.ts`.

Next backlog:

1. Add source-backed evidence model for comparison pages.
2. Review generated index/card pages for visual hierarchy and reduce card monotony.
3. Add a Playwright visual smoke that screenshots `/` full-page and fails when large blank regions appear.
4. Review public rate-limit policy for sitemap/crawler paths.
5. Decide whether legacy route page files should be deleted after redirects prove stable.

## Codex Handoff Package

### Files Changed

- `apps/marketing/src/components/motion/Reveal.tsx`
- `apps/marketing/src/components/motion/FadeIn.tsx`
- `apps/marketing/src/components/motion/Stagger.tsx`
- `apps/marketing/src/components/site/CookieConsent.tsx`
- `apps/marketing/next.config.mjs`
- `apps/marketing/src/app/sitemap.ts`
- `apps/marketing/src/content/copy/home.ts`
- `apps/marketing/src/content/site.config.ts`

### Verification Completed

- `pnpm --filter @qorium/marketing test` passed: 14 files, 78 tests.
- `pnpm --filter @qorium/marketing typecheck` passed.
- `pnpm --filter @qorium/marketing build` passed: 237 static pages generated.
- Local dev server: `http://127.0.0.1:3108`
- Local sitemap count: 168.
- Local legacy redirects passed.
- Local screenshots passed:
  - `/tmp/qorium-audit-local/home-after.png`
  - `/tmp/qorium-audit-local/home-mobile-after.png`
  - `/tmp/qorium-audit-local/pricing-after.png`

### Regression Risks

- Motion now uses visible hidden states, so entrance feels more like a slight slide than fade-in. This is intentional because content invisibility is worse than reduced animation.
- Legacy solution pages still exist in source, but Next redirects should take precedence. Delete them only after route analytics confirm no need for direct page rendering.
- Production deploy still needs the approved QOrium deployment path and cross-account review.

## Machine-Friendly Appendices

```yaml
design_constitution:
  brand_intent: 'Evidence-first hiring trust infrastructure'
  stable_elements:
    - dark evidence shell
    - signal teal accent
    - proof-gated claims
    - DPDP-aware language
    - audit-defensible comparison posture
  banned_patterns:
    - invisible content before scroll
    - duplicate canonical pages
    - cookie overlays covering conversion cards
    - unsupported competitor claims

execution_register:
  fixed:
    - id: motion-visible-hidden-state
      files:
        - apps/marketing/src/components/motion/Reveal.tsx
        - apps/marketing/src/components/motion/FadeIn.tsx
        - apps/marketing/src/components/motion/Stagger.tsx
    - id: cookie-banner-placement
      files:
        - apps/marketing/src/components/site/CookieConsent.tsx
    - id: canonical-solution-redirects
      files:
        - apps/marketing/next.config.mjs
        - apps/marketing/src/app/sitemap.ts
        - apps/marketing/src/content/copy/home.ts
        - apps/marketing/src/content/site.config.ts
  remaining:
    - id: comparison-public-sources
      priority: high
    - id: visual-card-monotony
      priority: medium
    - id: crawler-rate-limit-review
      priority: medium

certification:
  homepage: 'pass after updates'
  pricing: 'pass after updates'
  solution_aliases: 'pass after updates'
  comparison_pages: 'pass with required updates'
```

## Final Certification Summary

Current status: PASS WITH REQUIRED UPDATES.

The executed fixes remove the highest-impact design consistency and IA defects found in this pass. The site is not yet fully certified because comparison pages still need public evidence governance and the visual system should be tightened on repeated generated page families.
