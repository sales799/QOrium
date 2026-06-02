# CODEX COMPLETION - QOrium Marketing Redesign Phase 2

Session: Codex PROVE continuation
Agent: Codex BHIMA + ARJUN
Date: 2026-06-02
Branch: codex/qorium-marketing-redesign-phase2

## Scope

Completed the Phase 2 schema/verification hardening discovered during the marketing redesign deploy:

- product and solution route schema gate;
- interactive proof surface schema gate;
- two-origin deploy parity;
- public Cloudflare cache purge and live verification.

## Completed

- Added server-rendered `WebPage` JSON-LD to the three buyer solution pages and corrected the breadcrumb parent to `/solutions`.
- Added server-rendered proof-surface JSON-LD:
  - `/try/jd-forge` -> `WebPage` + `SoftwareApplication`;
  - `/resources/sample-packs` -> `CollectionPage` + `ItemList`.
- Extended `WebPageJsonLd` to support `CollectionPage`.
- Added route-render tests for product, solution, and proof-surface JSON-LD.
- Deployed both public origins to the same branch head and purged Cloudflare.

## Commits

- `70c57d7` - `test(marketing): lock phase two route schema`
- `dba8fc7` - `fix(marketing): add proof surface schema`

## Verification Evidence

- Local gates:
  - `pnpm --filter @qorium/marketing lint` -> passed, no warnings.
  - `pnpm --filter @qorium/marketing typecheck` -> passed.
  - `pnpm --filter @qorium/marketing test` -> 11 files / 54 tests passed.
  - `pnpm --filter @qorium/marketing build` -> passed, 1195/1195 static pages generated.
- Deploy:
  - Old origin `147.93.103.194`: GBS job `255d7193-6498-4007-8b29-3eb3cafe5c17` done, exit `0`, checkout `dba8fc7`, PM2 online.
  - Active origin `187.127.155.150`: raw deploy succeeded after shallow-ref correction, checkout `dba8fc7`, PM2 online.
  - Cloudflare targeted purge: success, 23 URL variants.
- Live route matrix:
  - HTTP 200 + valid HTML + parseable JSON-LD: `/`, `/product`, `/platform/readybank`, `/platform/jd-forge`, `/platform/stack-vault`, `/solutions/assessment-platforms`, `/solutions/staffing-firms`, `/solutions/enterprises-gcc`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`.
  - Required schema types all present; solution breadcrumb parent is `https://qorium.online/solutions`.
- Accessibility:
  - `@axe-core/cli` 4.11.4, WCAG 2.1 A/AA tags, 11 pages -> 0 violations.
  - Artifact: `/tmp/qorium-axe-dba8fc7.json`.
- CWV / Lighthouse desktop:
  - `/` perf 99, accessibility 100, LCP 959ms, CLS 0, TBT 0.
  - `/try/jd-forge` perf 99, accessibility 100, LCP 741ms, CLS 0, TBT 0.
  - `/resources/sample-packs` perf 100, accessibility 100, LCP 611ms, CLS 0, TBT 0.
  - `/trust` perf 100, accessibility 100, LCP 584ms, CLS 0, TBT 0.
  - `/compliance-dpdp` perf 100, accessibility 100, LCP 576ms, CLS 0, TBT 0.
- Quality:
  - `https://qorium.online/v1/science/quality-gate` -> HTTP 200, latest run `92/92`, date `2026-06-01`.
  - Latest saved Rakshak certification remains `rakshak-qorium_online-mpw46c2z-7bd0`, `GO 94/100`, `17/17`.
- Operations:
  - Correct API health paths: `https://api.qorium.online/healthz` and `/health`; `/api/health` is not the correct path and returns 404.
  - Active-origin PM2 default namespace enumerates 12 QOrium processes.

## Notes

- `deploy:atomic:raw` is currently an in-place deploy script, not a true `releases/<SHA>` symlink flip. This was recorded as a low-risk infra follow-up.
- The raw deploy script recreated baseline `.env.production` files with public/runtime keys only on both origins; no secret values were printed or committed.
- `qorium.in` redirect certificate issuance remains warning-only because ACME resolves that domain to the other origin.
