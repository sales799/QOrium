# ADR 0002 (ReadyBank) — API versioning via URL path (`/v1/...`), not header

**Status:** Accepted
**Date:** 2026-04-29 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Tech Stack discipline) + commercial-template implications for Bali Platform API motion
**Reviewers:** CTO (sole, Y1)

---

## Context

REST APIs need a versioning strategy. Three industry-standard options:

1. **URL path:** `GET /v1/questions/{uuid}` — version in the path
2. **Custom header:** `GET /questions/{uuid}` with `Accept-Version: v1` header
3. **Query parameter:** `GET /questions/{uuid}?api_version=1`

ReadyBank ships routes under `/v1/...` (per `services/readybank/src/server.ts`). This ADR backfills why.

## Decision

**Version the API via URL path: `/v1/...`, `/v2/...` etc.**

Versioning is at the major-version level only (no `/v1.2/`). Minor changes are backwards-compatible within a major version; breaking changes bump the major.

When `/v2/` ships, `/v1/` enters a deprecation window of **at least 12 months** (longer if any active customer is still on v1). Both versions coexist in the codebase during the deprecation window.

## Consequences

### Positive

- **Customer-facing visibility.** Customers see `/v1/...` in their integration code; the version is impossible to miss. Compare with header-based versioning where the version is invisible to anyone reading the integration code.
- **CDN-friendly.** URL-based versioning caches differently per version automatically; no `Vary: Accept-Version` complexity.
- **Easier deprecation rollout.** Telling customers "we're sunsetting `/v1/`" is concrete; URL deprecation is simpler than header deprecation.
- **Discoverable.** OpenAPI spec generation (TBD) can document each version under a separate base path.
- **Aligns with industry norm.** Stripe, GitHub, Twilio, AWS — all use URL-path versioning. Customer integrators don't have to learn QOrium-specific patterns.

### Negative

- **Couples URL structure to versioning.** If a customer has `/v1/...` URLs hardcoded, they have to update for `/v2/...`. Mitigated by the 12-month deprecation window.
- **Slight code duplication during deprecation.** When `/v2/` ships, `/v1/` route handlers stay around for ≥12 months. Mitigated by sharing service-layer code; only the route adapters duplicate.

### Neutral / observations

- The `/health` endpoint is intentionally NOT versioned (it's an operational concern, not customer API surface)
- Version bumps trigger `bali/leads/Y1-target-list.md` re-validation per SO-25 if the API change affects competitive positioning

## Alternatives considered

### Alternative 1: Header-based versioning (`Accept-Version: v1`)

Rejected. Invisible in integration code; harder to debug; requires customer-side tooling adjustment. The value (cleaner URLs) doesn't justify the operational cost.

### Alternative 2: Query parameter versioning (`?api_version=1`)

Rejected. Same invisibility problem as headers; cache-busting issues; not industry-norm. Considered the worst option.

### Alternative 3: No versioning, breaking changes via deprecated-flag

Rejected. We'll inevitably need to ship breaking changes. Unversioned APIs accumulate compatibility hacks until they're un-changeable. The marketing site claims "stable API"; that claim has teeth only with versioning discipline.

## When does v2 happen?

**Major version bump triggers:**

- Breaking change to request shape (renamed required field, removed optional field, changed semantics)
- Breaking change to response shape (renamed field, removed field, changed type)
- Authentication mechanism change (e.g., API key → OAuth2)
- Pricing model change that requires customers to re-classify their integration

**Does NOT trigger major bump:**

- Adding new optional fields to request or response
- Adding new endpoints
- Performance improvements
- Bug fixes that don't change documented behavior
- Anti-leak metadata additions (the `anti_leak_scan: { last: ..., status: ... }` field)

When v2 is on the horizon, MANTHAN runs a research classification (per `manthan/research-classification-protocol.md`) on whether the breaking change is worth it; CEO accepts; IdeaForge gates the blueprint; CTO ships v2 alongside v1 with a 12-month deprecation banner.

## Implementation notes

- **File:** `services/readybank/src/server.ts` — `app.use('/v1', v1Router)` at the top level
- **Route files:** `src/routes/{health,packs,questions}.ts` — all under v1
- **Future v2:** `src/v2/routes/...` — separate folder structure to avoid conflict
- **Deprecation header:** when v2 ships, v1 responses include `Deprecation: true; Sunset: <date>` header per RFC 8594
- **Commit:** `e07108c` (initial routes) + `3528232` (packs + bulk export adopting `/v1/` prefix)

## Verification

- All current routes live at `/v1/...` confirmed via `grep -r "router\.\\(get\\|post\\)" services/readybank/src/routes/`
- Health endpoint at `/health` (unversioned, intentional)
- OpenAPI spec generation TODO; tracked in `cto/tech-debt.md`

## References

- Constitution SO-13
- Stripe API versioning: <https://stripe.com/docs/api/versioning>
- RFC 8594 (Sunset HTTP header)
- ADR 0001 (Express choice — companion decision)
- `services/readybank/src/server.ts` — implementation
