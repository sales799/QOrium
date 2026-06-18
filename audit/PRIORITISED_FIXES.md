# Prioritised Fixes

Generated: 2026-06-18

| Priority | Issue                                                            | Why it matters                               | Fix                                                                                   | Status                       |
| -------- | ---------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| P0       | Legal pages said "pre-launch" while the site collects leads      | Undermines auditability and buyer trust      | Replaced with informational review-copy notice and contract-control language          | Done                         |
| P0       | Press kit repeated "world's first" outside a proof context       | Credibility and claim-risk issue             | Removed superlative from boilerplate and added claim-use guardrail beside locked USP  | Done                         |
| P0       | Live sitemap included duplicate legacy solution routes           | SEO canonical dilution                       | Local sitemap excludes legacy routes; redirects are in `next.config.mjs`; tests added | Done locally, deploy pending |
| P1       | Funnel events were not codified                                  | CRO and product-led learning gap             | Added Plausible event taxonomy and delegated tracking                                 | Done                         |
| P1       | Motion-heavy decorative canvas ignored reduced-motion preference | Accessibility and mobile CPU risk            | Added reduced-motion handling and `aria-hidden`                                       | Done                         |
| P1       | Lighthouse tested legacy routes and skipped canonical audit      | QA did not match SEO priorities              | Updated Lighthouse routes and enabled canonical audit                                 | Done                         |
| P2       | Metadata remains ad hoc across pages                             | Harder to prevent drift as route count grows | Added critical metadata tests; central helper remains future work                     | Partial                      |
| P2       | Security headers duplicated in live response                     | Edge/app layering cleanup                    | Documented; needs Cloudflare/app config decision after deploy                         | Open                         |
| P2       | Proof maturity still early                                       | Procurement confidence gap                   | Needs signed customer proof, counsel-approved claims, and external audit evidence     | Human/external               |
