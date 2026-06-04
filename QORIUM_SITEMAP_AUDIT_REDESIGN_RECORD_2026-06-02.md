# QOrium Sitemap, Audit, Competitor Gap Analysis, and Redesign Record

Date: 2026-06-02
Target: https://qorium.online/
Implementation app: `qorium-app/apps/web`

## 1. Live Sitemap Created

The live sitemap was crawled from `https://qorium.online/sitemap.xml` and reconciled into the local Next.js marketing route system.

Total public URLs represented: 1,190

| Route family | Count | Purpose |
|---|---:|---|
| `/library/*` | 1,000 | Programmatic assessment library pages by skill and scenario |
| `/solutions/*` | 63 | Buyer, company-type, use-case, industry, role, and stack routes |
| `/resources/*` | 44 | Docs, guides, sample packs, job descriptions |
| `/skill/*` | 25 | Flagship skill assessment SEO pages |
| `/vs/*` | 10 | Modern competitor comparison routes |
| `/blog/*` | 7 | Thought-leadership and SEO education |
| `/compare/*` | 5 | Migration-style competitor comparison pages |
| `/platform/*` | 4 | Platform and SKU routes |
| `/features/*` | 4 | Feature family routes |
| Other core pages | 28 | Product, pricing, trust, legal, company, demo, try routes |

The rebuilt app now generates `/sitemap.xml` from the same route inventory and preserves existing operational routes: `/assessments/new`, `/candidate/[token]`, and `/results/[attemptId]`.

## 2. Page Audit Summary

The existing public site had strong honesty and proof discipline, but the user journey read more like an MVP proof shell than a global enterprise product marketing site.

Primary gaps found:

1. Information architecture was broad in the sitemap but not expressed clearly enough as a buyer journey.
2. The three-SKU story, ReadyBank, JD-Forge, and Stack-Vault, needed stronger page-level product marketing.
3. The moat needed to be made visible: anti-leak lifecycle, IRT posture, role graph, private stack depth, and proof gating.
4. Enterprise trust needed a clearer center of gravity across security, DPDP, responsible AI, science, and method.
5. Competitor comparison pages needed a fair, repeatable structure instead of generic comparison copy.
6. Programmatic pages needed a consistent conversion path, not just SEO presence.

## 3. Competitor and Global Research

Sources checked:

- Vervoe: https://vervoe.com/assessments/ and https://vervoe.com/features/
- TestGorilla: https://www.testgorilla.com/pricing/
- HackerRank: https://www.hackerrank.com/products/screen and HackerRank AI feature docs
- CodeSignal: https://codesignal.com/ and CodeSignal certified assessment docs
- iMocha: https://www.imocha.io/
- Mercer Mettl: https://mettl.com/

Research takeaways:

| Competitor | What they do well | QOrium gap/opportunity |
|---|---|---|
| Vervoe | Real-work assessment story, explainable AI, capability over resume proxies | QOrium should show product proof while staying more enterprise-trust focused |
| TestGorilla | Library breadth, pricing clarity, broad SEO surface | QOrium should match navigability but differentiate on defensible content infrastructure |
| HackerRank | Technical screening authority, enterprise familiarity, AI feature depth | QOrium should avoid coding-only framing and win on India/GCC stack depth |
| CodeSignal | Certified assessment language, validation, anti-cheat research posture | QOrium should make assessment science readable and buyer-facing |
| iMocha | Skills intelligence framing beyond assessments | QOrium should present role graph and stack coverage as strategic workforce evidence |
| Mercer Mettl | India enterprise familiarity, proctoring, large-scale assessment operations | QOrium should feel newer, cleaner, and more transparent while owning India-built credibility |

## 4. Redesign Strategy

The implemented direction combines:

1. Trust infrastructure: dark enterprise shell, evidence ledger, proof-gated claims.
2. Product proof: visible JD-Forge, ReadyBank, and Stack-Vault workflow panel.
3. India/GCC credibility: stack, role, BFSI, and enterprise pages made navigable.
4. Global standard IA: mega-menu, buyer routes, product routes, trust routes, comparison routes, resource routes.
5. Customer-centered copy: every page explains the buyer problem, QOrium answer, proof posture, and next action.

## 5. Implementation Completed

Implemented in:

- `qorium-app/apps/web/src/marketing/data.ts`
- `qorium-app/apps/web/src/marketing/MarketingPage.tsx`
- `qorium-app/apps/web/src/app/page.tsx`
- `qorium-app/apps/web/src/app/[...slug]/page.tsx`
- `qorium-app/apps/web/src/app/sitemap.ts`
- `qorium-app/apps/web/src/app/robots.ts`
- `qorium-app/apps/web/src/app/layout.tsx`
- `qorium-app/apps/web/src/app/globals.css`
- `qorium-app/apps/web/public/assets/*`

Screenshots captured:

- `audits/post-deploy-qa/screenshots/qorium-redesign-desktop-home.png`
- `audits/post-deploy-qa/screenshots/qorium-redesign-mobile-home.png`
- `audits/post-deploy-qa/screenshots/qorium-redesign-desktop-library.png`
- `audits/post-deploy-qa/screenshots/qorium-redesign-mobile-compare.png`
- `audits/post-deploy-qa/screenshots/qorium-redesign-mobile-menu.png`

## 6. Verification

Commands passed:

- `pnpm --dir qorium-app/apps/web typecheck`
- `pnpm --dir qorium-app/apps/web build`

Rendered QA passed:

- `/`
- `/platform/readybank`
- `/library/javascript-debugging`
- `/vs/vervoe`
- `/solutions/by-industry/gcc-global-capability-centers`
- `/pricing`
- `/sitemap.xml`

Checks:

- Desktop and mobile routes return 200.
- No horizontal overflow at 1440px or 390px.
- Primary CTAs visible on desktop and mobile.
- Mobile menu opens and exposes navigation links.
- Generated sitemap count matches live count: 1,190 URLs.

## 7. Remaining Production Notes

1. Deploy the app build to the production service currently serving `https://qorium.online/`.
2. After deployment, re-run live smoke checks against production.
3. Replace screenshot-derived visual assets with approved product screenshots when final product surfaces are locked.
4. Add real customer logos, outcome metrics, certifications, and case studies only when evidence flags are live.
