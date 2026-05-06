# ADR 0001 (auth) — API key format: `qor_(live|test|internal)_*`

**Status:** Accepted
**Date:** 2026-04-22 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-15 (Zero Secrets in Git), SO-13 (Tech Stack); also `infra/B?/D3-Talpro-Internal-API-Key-Spec` (canonical)

---

## Context

QOrium needs an API key format that is:

1. **Visually distinguishable** at a glance (live vs test vs internal — preventing dev/prod mix-ups)
2. **Greppable** for accidental commits (gitleaks regex per `.gitleaks.toml` `qorium-internal-key-prefix` rule)
3. **Customer-friendly** when pasted in error reports / support threads (a key prefix tells support which env without revealing the secret)
4. **Aligned with industry conventions** (Stripe's `sk_live_*` / `sk_test_*` is the model)

## Decision

**API keys use the format `qor_(live|test|internal)_<32-lowercase-hex-chars>`.**

Format examples (placeholder format — real keys are 32 random lowercase hex chars):

```
qor_live_<32-hex>
qor_test_<32-hex>
qor_internal_<32-hex>
```

Three prefix tiers:

- `qor_live_*` — production customer keys; rate-limited per plan tier
- `qor_test_*` — staging/test keys; sandbox data only; never against prod DB
- `qor_internal_*` — Talpro internal team keys; bypass rate limits for ops use; require explicit Bali + CTO approval to issue

The key body is 32 lowercase hex characters generated via `crypto.randomBytes(16).toString('hex')`. Keys are HMAC-SHA256 hashed at rest in `app.api_keys.hashed_key` (deterministic so we can index UNIQUE on the hash).

## Consequences

### Positive

- **gitleaks catches accidental commits.** The `qorium-internal-key-prefix` rule in `.gitleaks.toml` matches this format; any key checked in fails the pre-commit hook. SO-15 enforced mechanically.
- **Customer support clarity.** When a customer says "my key starts with `qor_live_a7f3...`," support knows it's a prod key without seeing the rest.
- **Test safety.** `qor_test_*` keys can't be silently used against prod (the lookup table separates).
- **Industry-norm familiar.** Stripe / OpenAI / Anthropic all use the prefix-based pattern; customer integrators don't have to learn a QOrium-specific convention.

### Negative

- **Key format is now part of the API contract.** Changing it breaks customer integrations. Mitigated by the prefix being stable (the body can rotate; the format doesn't).
- **32-char body is shorter than some industry norms** (e.g., GitHub's 40-char ghp\_\*). Sufficient entropy for our scale (32 hex = 128 bits); revisit if usage volume scales 100x.

### Neutral / observations

- The `qor_*` prefix is short enough to be human-readable but distinctive enough that a stray match against random data is essentially zero
- The lowercase-hex constraint means keys are URL-safe without encoding

## Alternatives considered

### Alternative 1: UUID v4 keys

Rejected. UUIDs don't carry env (live/test/internal) signal in the format itself; we'd need a separate field on every API call. Visual confusion risk.

### Alternative 2: JWT tokens

Rejected. JWTs are stateful (signing key + claims) which couples auth to a key-management service. API keys are simpler + sufficient for Y1.

### Alternative 3: Stripe-style `sk_live_*` exact format

Considered. Rejected only because we want OUR brand prefix (`qor_*`) to make the key visibly QOrium's; otherwise the format philosophy is the same.

### Alternative 4: Random base64

Rejected. URL-safety quirks (`+`, `/`, `=` padding) make customer integration messier than hex.

## Implementation notes

- **Generation:** `packages/auth/src/keys/generate.ts` (or equivalent) — `crypto.randomBytes(16).toString('hex')`
- **Validation regex:** `/^qor_(live|test|internal)_[a-f0-9]{32}$/`
- **Storage:** `app.api_keys.hashed_key` column (unique index); HMAC-SHA256 of the full key
- **Lookup path:** `request → parse Bearer token → validate format regex → HMAC → DB lookup → check revoked + expires_at → return key record OR 401`
- **gitleaks rule:** `qorium-internal-key-prefix` in `.gitleaks.toml` — regex `qor_(live|test)_[a-z0-9]{32}` (catches accidental commits)

## Verification

- `pnpm --filter @qorium/auth test` — auth tests cover format validation + hash determinism + revoke/expire flows
- `gitleaks detect --config .gitleaks.toml` — clean against full repo history (any test-fixture keys are allowlisted explicitly per `.gitleaks.toml` regexes section)

## References

- Constitution SO-15
- `.gitleaks.toml` `qorium-internal-key-prefix` rule
- `packages/auth/README.md` "Usage" section
- `infra/B?/D3-Talpro-Internal-API-Key-Spec` (canonical spec referenced in package README)
- Stripe API keys docs (the inspiration for the prefix-based format)
