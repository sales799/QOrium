# ADR 0003 (ReadyBank) — Bulk export ships in 3 formats: CSV / JSON / HackerRank-YAML

**Status:** Accepted
**Date:** 2026-04-29 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-23 (Platform API customer pricing band) + Bali Platform API motion (`bali/outreach/platform-api.md`)
**Reviewers:** CTO + Bali (joint review)

---

## Context

ReadyBank serves assessment platforms via API. The platforms generally want to **import** questions into their existing test runners. Each platform has its own import format.

QOrium needs to support enough formats to be a credible drop-in API replacement for the platform's existing content team. Per the Bali Sales Playbook §3.1 (Platform API motion) + the marketing claim "20+ platform formats," the bulk export feature was a competitive necessity.

But: shipping every format on day 1 is over-engineering. The question was **which formats first?**

Per `services/readybank/src/exporters/`, the answer was: **CSV** + **JSON** + **HackerRank-YAML**. This ADR backfills why.

## Decision

**Ship 3 bulk export formats in v1: CSV, JSON, HackerRank-YAML.**

```
services/readybank/src/exporters/
├── csv.ts             — CSV with QOrium-canonical column order
├── json.ts            — JSON array of full question records
└── hackerrank-yaml.ts — HackerRank-specific import format
```

Endpoints (per `services/readybank/src/routes/packs.ts`):

```
GET /v1/packs/{pack_id}/export?format=csv
GET /v1/packs/{pack_id}/export?format=json
GET /v1/packs/{pack_id}/export?format=hackerrank-yaml
```

Format selection via `format` query parameter; default = `json`; invalid format returns RFC 7807 error.

Future formats (Mettl, Codility, HackerEarth, etc.) ship as separate ADR + export modules added under `src/exporters/`.

## Consequences

### Positive

- **Cover the most-likely Y1 customers.** HackerRank is in the §2.7 Tier 1 API CUSTOMERS list (`bali/leads/Y1-target-list.md`); ships first. CSV + JSON are universal — every other platform can import these.
- **Bounded scope for v1.** Three formats means three exporters, three test suites, three docs. Deferred 17+ formats to follow-up ADRs as customers actually request them.
- **Customer-driven prioritization.** The 4th format ships when a paying customer asks; not before. This matches the no-fiction discipline (SO-24) — we don't claim "20+ formats supported" until we actually ship them.

### Negative

- **The marketing claim of "20+ formats" requires explanation.** Per the marketing site's `/features/readybank` page, we claim 20+ format support. The reality at v1 is 3 formats with documented intent to ship more. Mitigated by the [`apps/marketing/src/content/copy/features.ts`](../../../../apps/marketing/src/content/copy/features.ts) wording that's truthful about the current state vs the roadmap.
- **HackerRank-YAML is a moving target.** HackerRank changes their import format unpredictably. Mitigated by integration tests that pin the schema; if HackerRank ships a v2, we ship a `hackerrank-yaml-v2` exporter alongside.

### Neutral / observations

- All 3 exporters share the same source data (the question record). Their differences are output-shape only. The exporter pattern (`src/exporters/{format}.ts` exporting a `format(records: Question[]): string` function) generalizes to N additional formats.
- Bulk export operations are I/O bound; pagination on >5000 questions per pack at the API layer (per ADR 0001 Express middleware ordering).

## Alternatives considered

### Alternative 1: Ship JSON only; let customers transform

Rejected. Customer integration time goes from "1 day" to "1 week" if they have to write their own JSON-to-platform-X transformer. Bali competitive positioning requires the heavy lifting on our side.

### Alternative 2: Ship 7+ formats on day 1 (HackerRank, Mettl, Codility, HackerEarth, iMocha, CodeSignal, Adaface)

Rejected. Format-specific edge cases multiply quickly; we'd ship buggy exporters for 6 of 7 platforms. Better to ship 3 well + add as customers actually need.

### Alternative 3: GraphQL endpoint with format-on-the-fly

Rejected. GraphQL has its own learning curve for customer integrators; defeats the "drop-in API replacement" pitch (Bali Playbook §3.1). Add later if a customer's existing stack is GraphQL-native.

## When does the 4th format ship?

Triggers (any of):

1. **Customer in active deal cycle requests it.** Bali surfaces the request during discovery; CTO commits to a delivery date in the scoping memo (per `bali/templates/stack-vault-scoping-memo.md` analog for Platform API).
2. **Tier 1 API CUSTOMER (per Constitution §2.7) makes their format public OR partners with us.** If HackerRank or Mettl announces a partnership-level integration, we add their format proactively.
3. **Quarterly review identifies pattern.** If 3+ prospects across the quarter requested the same format, it goes into the next sprint regardless of single-customer demand.

Each new format gets a follow-on ADR (`0004-`, `0005-`, etc. in this folder) documenting which trigger fired.

## Implementation notes

- **Files:** `services/readybank/src/exporters/{csv,json,hackerrank-yaml}.ts`
- **Common interface:** `function format(records: Question[]): string`
- **Tests:** `services/readybank/__tests__/exporters/` — golden-file tests per format (sample input → expected output)
- **Commit:** `3528232` (Sprint feature: `/v1/packs` + bulk export CSV/JSON/HackerRank-YAML)

## Verification

- `pnpm --filter @qorium/readybank test` — exporter tests pass
- Manual smoke per format:
  ```bash
  curl http://localhost:5101/v1/packs/PACK_ID/export?format=csv
  curl http://localhost:5101/v1/packs/PACK_ID/export?format=json
  curl http://localhost:5101/v1/packs/PACK_ID/export?format=hackerrank-yaml
  ```
- Invalid format returns 400 with RFC 7807 Problem Details

## References

- Constitution SO-23 (Platform API customer pricing band — drives format-coverage rationale)
- Bali Sales Playbook §3.1 (Platform API motion competitive positioning)
- `bali/outreach/platform-api.md` (sales script references format coverage)
- `services/readybank/src/exporters/` — implementations
- `apps/marketing/src/content/copy/features.ts` — marketing claim about format coverage (truthful current state)
- HackerRank import format docs (vendor-specific; URL TBD on customer request)
