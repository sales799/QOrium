# CTO-DELTA: Stack-Vault v0 ships watermark_id metadata; mechanical marker substitution deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Anti-Leak-Engine-v0-Design.md` §3 (Watermark Scheme) +
`05-QOrium-Three-Use-Cases-SKU-Architecture.md` §4.3 (Production Pipeline,
step 4 "Per-client variant generation")

## Background

The Anti-Leak Engine spec (Sprint 1.4 ratified) defines five mechanical
markers per question variant:

| Marker                | Operation on the question body                                        |
| --------------------- | --------------------------------------------------------------------- |
| `variableSuffix`      | Append 2 hex chars to identifier names (`crc_value` → `crc_value_7f`) |
| `testValuePercent`    | Scale non-critical numeric test values by `1 + n/100` (n ∈ 0–9)       |
| `synonymIndex`        | Synonym replacement on 2–3 adjectives in scenario text                |
| `commentStyle`        | Swap `//` ↔ `/* */` in code samples                                   |
| `helperReorderParity` | Reorder non-dependent helper functions                                |

The SKU architecture spec §4.3 step 4 calls for per-client variant
generation as a discovery-pipeline stage — fully customising the question
body for each customer.

Doing this **mechanically** (without an LLM in the loop) requires per-format
substitution engines:

- For `coding` format: a TS/Java/Python tokenizer + identifier renamer +
  test-value perturbation in the test-cases JSON
- For `mcq` / `msq`: synonym dictionaries per natural language + careful
  preservation of the `correctIndex` invariant when option order shuffles
- For `design` / `casestudy`: synonym substitution risks breaking the
  semantic intent; would need a constrained LLM pass

Doing it **with an LLM** is what the Anti-Leak rotation pipeline (spec §7)
describes — a round-trip to Anthropic with a strict variant-generation
prompt + validation loop. That requires `ANTHROPIC_API_KEY` (CEO-only)
and is the same activation halt as JD-Forge's live LLM (#14).

## Adaptation in v0

`services/stack-vault/src/variant.ts` ships a thin `buildVariant`
function that:

- Computes the canonical watermark seed via
  `@qorium/leak-crawler::deriveWatermarkSeed`
- Returns the master question payload **unchanged** plus two new fields:
  - `watermarkId` — first 16 chars of the seed (safe to expose; the
    customer-facing handle for forensic correlation)
  - `watermarkMarkers` — the 5 derived markers, attached as metadata.
    The customer (or an integration partner) can use these to audit
    that the markers they received match what their assessment platform
    rendered.

For v0 the question body is **shared across customers**. The watermarkId

- watermarkMarkers are the per-customer surface the Anti-Leak forensics
  step uses. If a question leaks publicly, the leak-crawler can:

1. Extract observable markers from the leaked text (per the same five
   marker rules)
2. Use `attributeLeakToVault` to score every active vault against the
   observed markers
3. Identify the highest-confidence vault as the likely source

## Why this is acceptable for v0

- **No customer onboarding yet.** Spec §6 (next-90-days) targets Logo
  #1 (Bosch GCC) at M4. v0 ships the API + audit log so the integration
  contract is testable; the marker-substitution upgrade lands by M4.
- **Forensic coverage is preserved.** Even without body substitution,
  every read records the per-customer watermarkId. If a question leaks,
  we can attribute it back to the customer that read it (subject to a
  one-question-many-customers caveat — a future migration adds
  `app.stack_vault_questions(vault_id, question_id)` membership and
  filters search to that vault's allotted set).
- **Switch path is clean.** Mechanical-substitution v1 is a per-format
  handler that mutates `bodyMd` / `bodyJson` / `testCases` /
  `referenceSolution` before they hit the wire. The interface stays
  the same; only the variant-builder grows new behaviour.

## Reconciliation request to CTO Office

Three options:

1. **Ratify v0 watermark-id-only** (recommended). Pros: ships the
   per-customer namespace API + audit log + forensic-attribution
   primitive today; the Bosch contract can be signed against this
   surface; mechanical substitution lands in dedicated Sprint ≥2.x.
2. **Block v0 on mechanical substitution** — bring per-format handlers
   first. Cons: drags Phase 2 schedule; substantial complexity per
   format; no customer is asking for it yet.
3. **LLM-driven variant generation now** — wire the rotation pipeline
   from Anti-Leak spec §7 directly into the Stack-Vault read path.
   Cons: activates the `ANTHROPIC_API_KEY` halt (#14); cost per read
   is high (~$2 per question); latency unsuitable for real-time API.

Default action if no reconciliation by next sprint review: **option 1**.
The marker-substitution upgrade ships before Logo #1 onboarding (M4
target per spec §6), gated on whichever first customer demands
body-level differentiation.

## Verification

`services/stack-vault/__tests__/`:

- `variant.test.ts` — 11 cases (deterministic seed, per-tenant /
  per-question / per-secret variation, payload preservation, IRT
  passthrough, attribution at confidence 1.0 vs lower for wrong vault)
- `server.test.ts` — 14 cases (auth, vault lookup, search returns
  variants with watermarkId, single-question fetch, refresh-request +
  leak-report acknowledgments, RFC 7807 errors, secret never surfaces
  in responses)

The `attributeLeakToVault` helper composes
`@qorium/leak-crawler::attributeLeak` (Sprint 1.4) with the Stack-Vault
identity, so the forensic-attribution code path is the same one the
Anti-Leak Engine already exercises for ReadyBank questions.
