# 168 — /try/jd-forge

URL: https://qorium.online/try/jd-forge

Category: Try

Template family: interactive proof template

Sheet status: 429

Slow reachability before deploy: HTTP 200 (160ms)

## Findings

- P2 buyer-demo/design gap: `/try/jd-forge` passed API smoke but still used a thin legacy page shell, so it did not match the redesigned QOrium proof-lab standard now used by `/try` and `/try/graded-answer`.
- P2 trust/polish gap: the widget displayed raw-ish `input sha256:` copy in the plan evidence line instead of a buyer-safe short fingerprint label.
- P2 role-title research bug: OpenText xPression job-title input normalized to `Opentext Xpression`, which damaged brand trust for niche enterprise-platform roles.

## Root Cause

- The route page had not been upgraded with the richer proof-lab hero, safety framing, structured SEO, and buyer explanation used by related try routes.
- `titleCaseJobTitle` handled uppercase acronyms but not mixed-case product names.
- `JdForgeDemo` exposed the proof fingerprint in a developer-shaped string rather than buyer-facing evidence copy.

## Fix

- Rebuilt `/try/jd-forge` as a polished buyer proof-lab page with hero stats, title/JD workflow explanation, demo-safe evidence framing, structured SEO JSON-LD, proof-path cards, and buyer next step CTA.
- Updated the widget evidence line to say `Plan evidence` and show a short fingerprint rather than `input sha256:...`.
- Preserved OpenText xPression casing during title research.
- Added regression coverage for OpenText xPression casing and updated smoke coverage for the redesigned route.

## QA

- Reachability: PASS
- Production API pre-check: PASS for Network Engineer JD, OpenText xPression pasted JD, and OpenText xPression title research.
- Marketing unit/API tests: PASS for interactive proof fixtures/routes.
- Marketing typecheck: PASS.
- Marketing lint: PASS.
- Marketing build: PASS.
- Focused Playwright: PASS for `/try/jd-forge`.
- Responsive/browser audit: PASS desktop + mobile, no overflow, one `<main>`, one H1, no console errors.
- Accessibility sanity: PASS semantic headings, labels, keyboard-safe buttons/links, one main landmark.
- SEO sanity: PASS title, description, canonical, WebPage/Breadcrumb JSON-LD.
- Deployment verification: pending.

## Notes

Family: interactive proof template. Slow reachability returned HTTP 200. Focused code fix is ready for deployment verification.
