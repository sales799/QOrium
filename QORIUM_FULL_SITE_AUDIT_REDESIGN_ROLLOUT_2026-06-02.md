# QOrium Full-Site Audit And Redesign Rollout

Date: 2026-06-02
Domain: https://qorium.online/
Branch: codex/qorium-marketing-enterprise-redesign-20260602

## Scope

The live sitemap was re-crawled and classified before the second rollout. The site moved from
1,190 live sitemap URLs to 1,191 planned sitemap URLs after adding the missing CodeSignal
comparison page. The production build generated 1,196 Next.js pages, including app health and API
routes that are not all public sitemap URLs.

## Sitemap Families

| Family                                      | Live count before rollout | Generator / surface                         |
| ------------------------------------------- | ------------------------: | ------------------------------------------- |
| Library                                     |                     1,000 | `library/[slug]` from `seo-graph.ts`        |
| Role solutions                              |                        30 | `solutions/role/[slug]` from `seo-graph.ts` |
| Legacy skill redirects                      |                        25 | `skill/[slug]` redirecting to library       |
| Job descriptions                            |                        21 | `resources/job-descriptions/[slug]`         |
| Sample packs                                |                        14 | `resources/sample-packs/[slug]`             |
| Dynamic solution axes                       |                        14 | company type, use case, industry            |
| Stack solutions                             |                        13 | `solutions/stack/[slug]`                    |
| Competitor pages                            |       10 before, 11 after | `vs/[slug]` from `seo-graph.ts`             |
| Guides                                      |                         7 | `resources/guides/[slug]`                   |
| Blog                                        |                         7 | `blog/[slug]`                               |
| Static product, trust, legal, company pages |                        49 | shared marketing surfaces and static pages  |

## Competitor And Global Benchmark Inputs

Official public pages reviewed on 2026-06-02:

- Vervoe: real-work assessments, explainable AI scoring, JD-to-assessment builder, bias-audit
  posture, anti-cheating signals.
- TestGorilla: strong self-serve skills-test library, AI-powered assessments, science-backed
  positioning, pricing/discovery clarity.
- HackerRank: technical-screening authority, certified assessments, real-world coding questions,
  integrity stack, AI interviewer.
- CodeSignal: AI-native skills validation, assessments, simulations, cheating/fraud route, skills
  journey framing.
- iMocha: skills intelligence, skills assessment library, workforce planning and evidence-based
  talent decisions.
- Mercer Mettl: online assessment operations, broad assessment categories, proctoring, India
  enterprise familiarity.

## Gap Analysis Closed In This Rollout

| Gap                                             | Before                                                          | After                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Every page had a next-step path                 | Mixed; many detail pages ended after content blocks             | Reusable `EnterpriseJourneyBand` added to library, role, stack, solution, resources, comparison, and blog templates |
| Proof posture was generic                       | PageHero had basic proof posture labels                         | PageHero now frames enterprise buyer path, evidence discipline, and trust/demo/library routing                      |
| Competitor pages looked templated               | Generic "Dimension 1" rows                                      | Specific buyer criteria per competitor, with competitor strengths visible before QOrium edges                       |
| High-volume library pages lacked a close        | 1,000 pages had samples, mapping, and proof, but no buyer close | Each library page now routes to demo, anti-leak, and library evidence with skill-specific proof points              |
| Role/stack pages were useful but thin           | Batteries and mappings existed                                  | Each page now explains buyer decision, seniority/region proof, and next action                                      |
| Resource pages educated but did not always sell | Guides and JDs had previews                                     | Guides, JDs, sample packs, and resources hub now convert into template/demo/trust journeys                          |

## Implemented Surfaces

- `MarketingSurface.tsx`
  - Upgraded `PageHero` proof panel.
  - Added `EnterpriseJourneyBand`.
- `library/[slug]` and `library`
  - Added skill-specific buyer journey and library spine messaging.
- `solutions/role/[slug]` and `solutions/role`
  - Added role-battery proof path and role hub conversion layer.
- `solutions/stack/[slug]` and `solutions/stack`
  - Added stack-specific enterprise proof path and Stack-Vault routing.
- `solutions/_shared-solution.tsx`
  - Added buyer journey to every dynamic company/use-case/industry solution page.
- `resources`
  - Added resources-to-evaluation journey.
- `resources/guides/[slug]`
  - Added education-to-action journey.
- `resources/job-descriptions/[slug]`
  - Added JD-to-assessment journey.
- `resources/sample-packs/[slug]`
  - Added protected-pack explanation and conversion path.
- `vs` and `vs/[slug]`
  - Added responsible comparison journey.
  - Replaced generic matrices with competitor-specific buyer criteria.
  - Added CodeSignal page.
- `blog/[slug]`
  - Added article-to-product-evidence journey.

## Verification Before Deploy

- `pnpm --filter @qorium/marketing typecheck` passed.
- `pnpm --filter @qorium/marketing test` passed: 13 files, 60 tests.
- `pnpm --filter @qorium/marketing build` passed: 1,196 / 1,196 pages generated.

## Remaining Content Governance

This rollout upgrades every relevant generated page family through shared templates and data. It
does not mean each of the 1,191 sitemap URLs has a human-written bespoke paragraph. The safe,
enterprise-grade pattern for this site is governed generation: route families carry the same trust,
conversion, and evidence discipline while each page uses its skill, role, stack, solution, guide,
job, sample-pack, or competitor data.
