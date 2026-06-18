# Findings Master

Run folder: `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/.codex-runs/sitemap-audit-2026-06-18-0748`
Generated: 2026-06-18T02:45:26.181Z
Source sitemap CSV: `/Users/talprouniversepro/Downloads/QOrium Complete Sitemap - 2026-06-17 - Sitemap URLs.csv`

## Scope

- Normalized sitemap URLs audited: 168
- Unique internal URLs: 168
- Sheet-provided 429 rows rechecked slowly: 24
- Slow production reachability result before deploy: 168/168 HTTP 200
- Fast browser crawl sample before fixes: 110 desktop 200, 109 mobile 200, 117 rate-limited viewport visits.

## Findings

### P1 — Duplicate main landmarks on generated marketing templates

Fast browser sampling found 81 sampled pages rendering two `<main>` landmarks. Root cause was page-level `<main>` wrappers inside the shared marketing layout, plus the shared solution template. This is an accessibility and semantic-structure defect affecting screen-reader navigation and automated quality scoring.

### P1 — Trust detail mobile overflow risk

Manual targeted Playwright inspection of `/anti-leak` at 390px found document width forced to 938px by the evidence ledger table/grid interaction. Root cause was grid children retaining `min-width:auto` around horizontally scrollable trust tables.

### P2 — Short public meta descriptions

Fast browser sampling flagged 21 short page descriptions. Root cause was several static pages and generated route metadata using terse internal descriptions.

### Non-defect — Public rate limiting during fast crawl

The fast browser crawl hit QOrium's public middleware rate limit. A slower one-request-at-a-time reachability pass returned 168/168 HTTP 200, so these 429s are documented as audit-tool pressure, not broken routes.
