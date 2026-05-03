# CTO-DELTA: API key at-rest hashing — HMAC-SHA256, not Argon2id

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/D3-Talpro-Internal-API-Key-Spec.md` §2.2 + `infra/B7-postgres-migrations/0001_initial_schema.sql`

## Background

D3 §2.2 mandates Argon2id at rest:

> **At Rest:** Hashed using **Argon2id** (OWASP-compliant, memory-hard; PHC string format)
>
> - Memory cost: 64 MB
> - Iterations: 3
> - Parallelism: 4

The schema in `0001_initial_schema.sql` defines:

```sql
CREATE TABLE app.api_keys (
  ...
  hashed_key VARCHAR(255) NOT NULL UNIQUE,
  ...
);
```

These two specs are **structurally incompatible**:

1. Argon2id always salts each hash with a fresh random value. The same input produces different PHC strings on every call. A `UNIQUE` constraint on the resulting hash cannot detect "is this key already in the table" — every insert succeeds.
2. To verify a candidate key against the table, the middleware would have to fetch _every_ row and run Argon2 against each — O(N) per request, ~100ms per Argon2 verify at the spec'd parameters → unworkable past a few dozen keys.
3. Argon2's design goal (slow, memory-hard) is overkill for **high-entropy random tokens** (32 chars × log2(36) ≈ 165 bits). Argon2 mitigates _low-entropy_ secrets like user-chosen passwords; for cryptographically random keys, fast keyed hashing is OWASP-acceptable.

## Adaptation

`packages/auth/src/api-key.ts` uses **HMAC-SHA256(pepper, key)**:

- **Deterministic** — same input → same hash. Satisfies `UNIQUE` constraint and enables O(1) lookup by hash.
- **Keyed** — server-side `pepper` (env `API_KEY_PEPPER`, ≥32 chars) prevents an attacker with read-only DB access from precomputing a rainbow table of common keys. Compromise of either the DB or the pepper alone is insufficient; both are needed.
- **Fast** — sub-microsecond per verify; rate limit becomes the bottleneck, not crypto.
- **Constant-time comparison** — `timingSafeEqualHex` provided as defence-in-depth, though equality is reduced to a single hex-string compare since lookups are by-hash.

This pattern is what GitHub, Stripe, and most commercial APIs use for their API keys (see Stripe's blog post "How we designed Stripe's API tokens", GitHub's RFC for `ghp_*` token format, Vercel's `vc_*` keys, etc.).

## Reconciliation request to CTO Office

Three options:

1. **Ratify HMAC-SHA256** (recommended). Cost: D3 §2.2 needs an amendment ("Hashed using HMAC-SHA256(pepper, key) — Argon2id reserved for password-class secrets per OWASP 2024 cheat-sheet"). No schema change needed.

2. **Keep Argon2id** — requires a migration to drop `UNIQUE` on `app.api_keys.hashed_key`, add a separate `key_lookup_id` column (HMAC-SHA256(pepper, key)) with the UNIQUE+INDEX, store Argon2 hash separately for verification. Argon2 verify cost (~100ms) becomes the per-request floor — defeats §6.2's rate limit math (10 r/s requires <100ms response budget).

3. **Compromise** — HMAC-SHA256 for the lookup-and-verify column (this PR), and additionally store an Argon2id hash in a new column for a periodic offline integrity check (e.g., nightly batch verifies that each row's Argon2 still matches a re-hash from a known plaintext stored in 1Password). Adds complexity without security gain since neither hash compromises the other.

Default action if no reconciliation by next sprint review: assume **option 1 (ratify HMAC-SHA256)**. Pre-existing keys can be re-hashed in place via a one-shot migration if D3's spec is updated; the wire format (`qor_*_*`) doesn't change.

## Verification

22 vitest cases in `packages/auth/__tests__/`:

```
$ pnpm --filter @qorium/auth test
✓ api-key parse / hash / equal     (16 tests)
✓ middleware happy / failure / rl  (8 tests)
```

Hash determinism, pepper sensitivity, and constant-time equality are all unit-tested. Middleware tests use a mock pool + in-memory rate limiter so no Postgres or Redis required to run the suite.
