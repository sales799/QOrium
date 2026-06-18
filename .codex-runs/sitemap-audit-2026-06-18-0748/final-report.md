# QOrium Sitemap Audit Final Report

Run folder: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/.codex-runs/sitemap-audit-2026-06-18-0748`
Generated: 2026-06-18T02:45:26.181Z
Source sitemap CSV: `/Users/talprouniversepro/Downloads/QOrium Complete Sitemap - 2026-06-17 - Sitemap URLs.csv`

Status: in progress for the full sitemap queue. The latest `/try/jd-forge` continuation is fixed, committed, deployed, and live-verified.

## Summary So Far

- 168/168 normalized sitemap URLs prepared and audited for reachability.
- 168/168 returned HTTP 200 in slow production reachability before deploy.
- P1 duplicate main landmark issue fixed across marketing templates.
- P1 duplicate main landmark issue additionally fixed in the global loading fallback for no-JavaScript and streamed HTML verification.
- P1 trust detail mobile overflow risk fixed in the shared trust shell.
- P2 metadata descriptions expanded across safe static and generated pages.
- Regression tests added for representative sitemap template families and no-JavaScript HTML.
- Local gates passed twice: marketing typecheck, marketing lint, marketing build, targeted Playwright, root typecheck, root tests, root lint, gitleaks, high-threshold production audit, and root build.
- `/try/graded-answer` buyer-demo continuation completed: raw-looking public demo audit metadata replaced with demo-safe labels, public-demo safety boundary added, smoke coverage updated, GitHub Actions deploy run `27735942871` passed, and production desktop/mobile Playwright verification passed.
- `/try/jd-forge` continuation completed: buyer-demo page recreated to match proof-lab standard, OpenText xPression title casing fixed, plan evidence made demo-safe, lower proof-section contrast tightened, GitHub Actions deploy run `27737497276` passed, and production desktop/mobile Playwright verification passed.
