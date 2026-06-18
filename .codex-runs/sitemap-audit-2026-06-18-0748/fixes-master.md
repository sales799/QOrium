# Fixes Master

Run folder: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/.codex-runs/sitemap-audit-2026-06-18-0748`
Generated: 2026-06-18T02:45:26.181Z
Source sitemap CSV: `/Users/talprouniversepro/Downloads/QOrium Complete Sitemap - 2026-06-17 - Sitemap URLs.csv`

## Implemented Fixes

- Removed nested page-level `<main>` wrappers from marketing pages and generated templates so the layout owns the only main landmark.
- Replaced the remaining shared solution-template `<main>` with a fragment, covering industry, use-case, and company-type solution pages.
- Added `min-w-0` containment around trust evidence ledger/detail sections so wide tables scroll within their container instead of forcing page-level horizontal overflow.
- Expanded safe public metadata descriptions across static pages and metadata generators for compare, guide, sample-pack, solution, legal, customer, and resource pages.
- Added Playwright regression coverage for representative generated sitemap families and the trust mobile overflow case.

## Files Touched

See git diff for exact files. Code changes are limited to marketing route templates, SEO metadata, TrustShell layout containment, and smoke tests.
