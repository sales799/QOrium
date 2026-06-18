# QA Master

Run folder: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/.codex-runs/sitemap-audit-2026-06-18-0748`
Generated: 2026-06-18T02:45:26.181Z
Source sitemap CSV: `/Users/talprouniversepro/Downloads/QOrium Complete Sitemap - 2026-06-17 - Sitemap URLs.csv`

## Completed Before Commit

- Slow production reachability before deploy: 168/168 HTTP 200.
- Browser crawl before fixes: reproduced duplicate landmark template issue and documented rate-limit behavior.
- Marketing typecheck after final sweep: PASS.
- Marketing lint after final sweep: PASS, with known Next.js deprecation/workspace-root warnings only.
- Marketing build after final sweep: PASS; 237 marketing routes prerendered.
- Targeted Playwright after final sweep: PASS, 5/5 for `sitemap templates|/try`, including no-JavaScript landmark regression.
- Root typecheck: PASS.
- Root tests: PASS.
- Root lint: PASS, with 19 pre-existing console warnings outside this change.
- Secret scan: PASS; no leaks found.
- Production dependency audit at high threshold: PASS; 3 moderate vulnerabilities remain as non-blocking dependency warnings.
- Root production build: PASS.
- Post-deploy verification of commit `243f8ee`: deployment succeeded, but no-JavaScript live HTML still exposed duplicate main landmarks from `loading.tsx`; second fix prepared and local gates rerun.

## Pending Quality Gates

- None for the `/try/graded-answer` continuation.

## Latest Continuation QA

- `/try/graded-answer` local focused Playwright: PASS.
- `/try/graded-answer` local desktop/mobile browser audit: PASS, no overflow, one `<main>`, one H1, no console errors.
- Marketing typecheck: PASS.
- Marketing lint: PASS.
- Root typecheck: PASS.
- Root lint: PASS, with 19 pre-existing console warnings outside this change.
- Root tests: PASS.
- Secret scan: PASS; no leaks found.
- Production dependency audit at high threshold: PASS, with 3 moderate non-blocking advisories.
- Root production build: PASS.
- GitHub Actions deployment run `27735942871`: PASS.
- Live production Playwright desktop + mobile: PASS for `https://qorium.online/try/graded-answer`.
