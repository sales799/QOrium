# QOrium Universal Marketing Makeover Audit

Date: 2026-06-05
Target: `https://qorium.online`
Implementation app: `qorium-app/apps/web`

## Executive Finding

The marketing site now has a canonical enterprise-page architecture in source: flagship pages, generated page families, and canonical redirects are separated instead of being mixed into one broad sitemap.

The live deployment still exposes the previous production sitemap until this build is shipped.

## Sitemap Reconciliation

| Source | Count | Status |
|---|---:|---|
| Live production sitemap read on 2026-06-05 | 187 | Current deployed state |
| Local source `allMarketingPaths()` after canonicalization | 1,167 | Intended generated sitemap after deployment |
| Permanent canonical redirects in source | 44 | Duplicate or legacy routes |

Canonical source families:

| Route family | Count | Classification |
|---|---:|---|
| `/library/*` | 1,000 | canonical generated family |
| `/solutions/role/*` | 14 | canonical generated family; duplicate `-2` and `-3` routes redirect |
| `/solutions/stack/*` | 13 | canonical generated family |
| `/resources/job-descriptions/*` | 20 | canonical generated family |
| `/resources/sample-packs/*` | 13 | canonical generated family |
| `/resources/guides/*` | 6 | canonical generated family |
| `/blog/*` | 6 | canonical generated family |
| `/skill/*` | 25 | canonical generated family |
| `/compare/qorium-vs-*` | 11 | canonical comparison family |

## IA Decisions

- `/library` is the canonical assessment-library hub.
- `/platform/api` is the canonical API page.
- `/product`, `/product/api`, and `/product/assessment-library` redirect to canonical platform/library routes.
- `/features` and `/features/*` redirect to `/platform` and matching product pages.
- `/vs/*` redirects to `/compare/qorium-vs-*`.
- Duplicate role routes ending in `-2` or `-3` redirect to the unsuffixed role route.

## Page-Family Audit

| Family | Previous issue | Implemented fix |
|---|---|---|
| Core/product pages | Strong but inconsistent CTA and IA links | Canonical CTA hrefs and metadata added |
| Trust/legal pages | Good visual source, needed reusable proof posture | Evidence workflow and evidence-rule blocks added |
| Role solutions | Thin generated pages | Role workflow, assessment battery, related routes, and source-level canonical handling added |
| Stack solutions | Thin generated pages | Stack workflow, private-vault narrative, and trust links added |
| Library/skill pages | SEO pages could feel generic | Controlled preview, bank-protection narrative, and skill batteries added |
| Job-description pages | JD template did not lead strongly to assessment action | JD-to-test workflow and role-specific CTAs added |
| Sample packs | Needed proof-without-leakage framing | Controlled-preview workflow added |
| Comparisons | `/vs/*` and `/compare/*` split | `/compare/qorium-vs-*` is canonical; fair comparison table added |
| Resources/articles | Education pages needed conversion path | Learn/check/act workflow and sample-pack/trust CTAs added |

## Quality Gates

- `copy:audit` checks banned public-copy phrases and deprecated emitted paths.
- Metadata uses canonical URLs from page data.
- Structured data uses `Article`, `Product`, or `WebPage` based on page family.
- Visual QA should cover `/`, `/trust`, `/solutions/role/software`, `/solutions/stack/sap-abap`, `/library/python`, `/resources/job-descriptions/react-developer`, `/compare/qorium-vs-vervoe`, `/pricing`, and `/resources/guides`.
