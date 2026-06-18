# Performance Audit

Generated: 2026-06-18

## Baseline

The marketing app already has:

- `apps/marketing/lighthouserc.json`
- CI Lighthouse workflow in `.github/workflows/marketing-quality.yml`
- Next.js app router static pages and Cloudflare caching
- Motion components that respect reduced motion

## Findings

- Live `curl -I /` showed `x-nextjs-cache: HIT` and `cache-control: s-maxage=31536000`.
- The homepage uses animated visual primitives. The highest-risk one was the canvas-based `FlickeringGrid`, which ran requestAnimationFrame while visible.
- Lighthouse config previously skipped the canonical audit and tested legacy redirect routes.

## Fixes Implemented

- `FlickeringGrid` now stops continuous animation for reduced-motion users.
- Lighthouse CI route list now uses canonical pages: `/`, `/pricing`, `/platform`, `/library`, `/try/jd-forge`, `/security`.
- Lighthouse no longer skips the canonical audit.
- Non-marketing PWA installability audits are disabled in LHCI because QOrium is not shipped as an installable PWA.
- axe route list now uses canonical platform routes rather than legacy `/product` and `/features/*` routes.
- Playwright, Lighthouse, and axe local/CI server starts use `QORIUM_E2E=1` so QA traffic does not exhaust the public rate-limit bucket.

## Remaining Work

- Full Lighthouse CI was run locally against the production build and completed with warnings. Reports:
  - `/`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756689261-48050.report.html
  - `/pricing`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756690959-5538.report.html
  - `/platform`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756692714-38116.report.html
  - `/library`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756694691-76722.report.html
  - `/try/jd-forge`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756696461-61103.report.html
  - `/security`: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1781756698162-77936.report.html
- Remaining Lighthouse warnings: CSP strictness, color contrast, DOM size, main-thread work, total byte weight, local server response timing, and homepage bootup time.
- Review bundle analyzer output if performance score falls below the configured warning threshold.
- Consider replacing always-on decorative canvas work with CSS or static imagery on mobile if INP or battery usage regresses.
