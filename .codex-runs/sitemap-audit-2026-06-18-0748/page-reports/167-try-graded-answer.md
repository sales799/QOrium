# 167 — /try/graded-answer

URL: https://qorium.online/try/graded-answer

Category: Try

Template family: interactive proof template

Sheet status: 429

Slow reachability before deploy: HTTP 200 (154ms)

## Findings

- P2 buyer-trust/design gap: the public AI grading demo was technically synthetic, but the visible audit metadata still looked like internal implementation leakage (`rubric-*`, public grader build labels, raw ISO timestamp/fingerprints). On a marketing page, this could confuse buyers about whether real rubric, prompt, model, or candidate records were being exposed.
- Page narrative was generic for a proof page and did not clearly explain the demo-safe boundary, human-review loop, or why the metadata is safe to share publicly.

## Root Cause

- `GradedAnswerViewer` rendered audit metadata values directly from the demo fixture. The fixture values are safe, but their raw technical shape was not appropriate as buyer-facing marketing copy.
- `/try/graded-answer` had proof content but lacked the stronger public-demo framing used by the redesigned `/try` hub.

## Fix

- Reframed `/try/graded-answer` as a polished buyer demo for auditing an AI grade before trusting it.
- Added structured SEO data and clearer page metadata.
- Converted visible audit metadata into demo-safe labels, truncated fingerprints, and buyer-readable dates while preserving copy-to-clipboard replay behavior.
- Added an explicit public-demo safety boundary explaining that no real candidate answer, customer prompt, or production model identifier is exposed.
- Updated smoke coverage to assert the new buyer-facing copy and prevent raw grader/timestamp leakage.

## QA

- Reachability: PASS
- Focused Playwright coverage: PASS (`/try`, `/try/graded-answer`, `/try/jd-forge`, sitemap templates)
- Responsive/browser audit: PASS desktop + mobile, no overflow, one `<main>`, no console errors
- Accessibility sanity: PASS one `<main>`, one H1, semantic sections, keyboard-safe buttons/links
- SEO sanity: PASS route metadata + canonical + WebPage/Breadcrumb JSON-LD
- Local typecheck/lint/test/build: PASS
- Deployment verification: pending

## Notes

Family: interactive proof template. Slow reachability returned HTTP 200. This item now has a focused code fix and must be live-verified after deployment.
