# CODEX PENDING — QOrium Programmatic SEO Factory (S1–S4)

**Queued by:** CTO (Claude, Super Brain). **Executors:** Codex BHIMA (generator + role-graph backend) + ARJUN (rendering, templates, internal-link mesh) — joint.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-01
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2.2 rows S1, S2, S3, S4 (all 🔴 P0).
**Companion specs (read first):** `MARKETING_REDESIGN_360_v1.md` §6 (sitemap) + Phase 5 (programmatic), `03-Gap-Analysis.md` §1 (40-format taxonomy + India-stack wedge), `04-QOrium-Blueprint-v1.md` (role-graph schema), `BACKEND_MODULES_360_v1.md` (M13 JD-Forge already live — reuse its skill taxonomy), existing seeded pages (25 /library + 5 /vs) for template precedent.
**Honesty hard-rule:** every generated page must show **calibration status** (IRT-calibrated / Beta / Authored). Pages without ≥ N items past IRT gate render as "Authored — calibration in progress" stub with sample-pack CTA, not as a fake-completed library page.

## What this ships

A role-graph-driven page generator producing four programmatic page families at scale:

| Family | Path | Target volume | Wedge |
|---|---|---|---|
| S1 | `/library/{skill}` | 1,000+ | Industry-standard; we're at 25 (2.5%) |
| S2 | `/solutions/role/{role}` | 80–120 | Engineering / data / devops / non-tech roles |
| S3 | `/solutions/stack/{stack}` | 40–60 | **India edge** — SAP, Oracle EBS/Fusion, Salesforce, Finacle, Embedded, etc. White space; no competitor has this depth. |
| S4 | `/vs/{competitor}` | 10+ | Vervoe, HackerRank, Mercer Mettl, iMocha, CoderByte, TestGorilla, WeCP, Adaface, Karat, DevSkiller. Currently 5. |

**Not in scope:** Glossary (S6), blog (S5), resource library (S7) — those are separate ARJUN tracks per audit §2.2.

## Architecture

### Role-graph as single source of truth

- Postgres tables (extend existing M1.B seed schema):
  - `skills` — `id, slug, name, category, stack_family, calibration_status, item_count_total, item_count_calibrated, last_calibrated_at, sme_lead, seo_meta {title, description, h1}, content_md`.
  - `roles` — `id, slug, name, family (eng/data/devops/non-tech/india-enterprise), seniority_levels[], description, seo_meta`.
  - `stacks` — `id, slug, name, vendor, region_relevance[], seo_meta` (India-flag for the wedge).
  - `role_skills` — many-to-many with `weight` (signal strength for matching) + `core/recommended` flag.
  - `stack_skills` — many-to-many with `weight`.
  - `skill_synonyms` — for SEO query coverage.
  - `competitor_matrix` — competitor × dimension (anti-leak, IRT, India-stack, DPDP, pricing transparency, etc.) → claim + cite-source.
- **Seeding source:** M13 JD-Forge already extracts skills from JDs; reuse its taxonomy as the spine. Wave-2 content (986 Qs parsed) maps skills→items today; that mapping is the calibration-status feeder.

### Generator (BHIMA)

- New service or build-time step: `qorium-seo-gen`. Decision matrix:
  - **Build-time** (Next.js `generateStaticParams` + ISR) for the 1,000+ /library pages — best CWV, lowest infra cost.
  - **Runtime** (server component + cache) for /vs/{competitor} where competitor-claim data refreshes (we want to update vs pages when a competitor's pricing/posture changes).
- One Next.js route per family with parameterized template. NO 1,000 hand-written files.
- Build hook regenerates sitemap.xml + per-family sub-sitemaps (sitemap-library.xml, sitemap-roles.xml, sitemap-stacks.xml, sitemap-vs.xml). Auto-ping Search Console on deploy.
- Drafting pipeline: skill/role/stack rows have `content_md` either (a) authored by SME (canonical), (b) LLM-drafted then SME-reviewed (acceptable for stub-tier with badge), (c) pure-stub for skills below content threshold (renders "Authored — calibration in progress").

### Templates (ARJUN)

Per-family page contract:

- **/library/{skill}** — H1, calibration badge, what-this-skill-measures section, sample question explorer (1 unlocked + 2 gated), role-mapping ("hired for roles X/Y/Z"), stack-mapping, related skills, FAQ schema, JSON-LD Article + BreadcrumbList.
- **/solutions/role/{role}** — H1, role description, recommended skill battery (core + extended), sample assessment flow, India-context callout where relevant, link to /platform/readybank primary CTA, JSON-LD Service.
- **/solutions/stack/{stack}** — H1, stack identity, which roles need it (cross-link to S2), the skill modules we have for it (cross-link to S1), India enterprise callout where relevant (DPDP, regional residency), case-study slot (evidence-gated), JSON-LD Service.
- **/vs/{competitor}** — H1, honesty-led intro ("here's what we do differently"), 8-dimension structural comparison table from `competitor_matrix`, "where they're better" honest column (DOCTRINE — never hide weaknesses), FAQ schema, JSON-LD ComparisonChart.

### Internal-link mesh

- Every page renders 8–12 contextual internal links via the role-graph (skill→role, skill→stack, role→stack, related-skills, related-vs).
- Sitemap section per family + footer mega-sitemap link.
- Hub pages: `/library` (all skills), `/solutions/role` (all roles), `/solutions/stack` (all stacks), `/vs` (all competitors).

### Honesty + evidence gates

- Calibration badge mandatory on every /library page. Values: `IRT-calibrated`, `Beta`, `Authored` (no IRT yet). Driven by `skills.calibration_status` + `item_count_calibrated`.
- /vs pages MUST include the "where competitor is better" section. CI lint rejects pages missing it.
- No fake stats. If a page would render with a stat we can't instrument, the stat component returns `null` (per evidence-gate doctrine in MARKETING_REDESIGN_360_v1 §0.1).

## Telemetry

- Events: `seo_page_view` (with family + slug), `seo_internal_link_click`, `sample_question_unlock_attempt`, `seo_demo_cta_click`.
- Funnels per family — measure which family converts demo-requests.

## Exit criteria

**Phase 1 — Schema + 1 family live:**
1. Role-graph tables migrated; seeded with M13 taxonomy + 25 existing skill pages.
2. `/library/{skill}` family fully programmatic — 25 pages re-rendered from generator (no hand-written files remain).
3. Calibration badge live.
4. Sitemap-library.xml live.

**Phase 2 — S4 /vs expanded to 10:**
5. `competitor_matrix` seeded for 10 competitors.
6. /vs/{vervoe, hackerrank, mettl, imocha, coderbyte, testgorilla, wecp, adaface, karat, devskiller} all live.

**Phase 3 — S2 + S3 launched:**
7. /solutions/role/* — minimum 30 roles live.
8. /solutions/stack/* — minimum 12 India-relevant stacks live (SAP, Oracle EBS, Oracle Fusion, Salesforce, Finacle, TCS BaNCS, Murex, Embedded C, RTOS, FIX-protocol, COBOL, AS/400 — confirm with CEO).

**Phase 4 — Scale S1 to 1,000+:**
9. Seed 1,000 skill stubs from M13 taxonomy + public skill datasets (O*NET, ESCO).
10. Stub pages render correctly with "Authored — calibration in progress" badge.
11. Sitemap submitted to Search Console; first crawl confirmed.

**Quality gates throughout:**
- Rakshak run ≥ 88/100 17/17 (no regression).
- CWV green on a random sample of 10 generated pages per family.
- JSON-LD valid on all generated pages (Schema.org validator CI step).
- WCAG 2.1 AA on the template.
- No hand-written page files after Phase 1 — generator is canonical.

## Coordination

- BHIMA owns generator service, schema, seed scripts, competitor-matrix admin tooling, sitemap automation.
- ARJUN owns Next.js templates, design tokens, internal-link mesh component, hub pages.
- Both review the competitor-matrix content (honesty audit) — CEO has final review on /vs claims before flip.

## Parallel-work guard

`gh pr list --state all --search "seo"`. Lock `project-lock:qorium-seo-factory` while mutating templates or generator.

## Open input (non-blocking)

- CEO: confirm the 12 India-stack list. Default above.
- CEO: confirm the 10 competitor list. Default above.
- CEO: whether to gate /library calibration badge to public ("we show our work") OR hide on stub pages until calibration completes. Default = public, per honesty doctrine.
