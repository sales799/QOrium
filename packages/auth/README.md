# @qorium/auth

API key authentication + Redis-backed rate limiting per CTO Architecture §6.1 / §6.2 + D3 Talpro Internal API Key Spec.

## What it does

- Parses API keys in the canonical `qor_(live|test|internal)_*` format
- Hashes keys at rest with HMAC-SHA256 (deterministic; satisfies the `app.api_keys.hashed_key UNIQUE` constraint)
- Looks keys up in `app.api_keys`, rejects revoked / expired
- Optional rate limiting via `rate-limiter-flexible` (Redis in prod, in-memory for tests)
- Optional scope enforcement (`requiredScopes`)
- Records every authenticated attempt to `audit.events` (fire-and-forget)
- Returns RFC 7807 `application/problem+json` on every failure path

## Usage

```ts
import { apiKeyAuth, createRedisRateLimiter } from '@qorium/auth';
import { createPool } from '@qorium/db';
import Redis from 'ioredis';

const pool = createPool({ applicationName: 'qorium-readybank' });
const redis = new Redis(process.env.REDIS_URL!);
const rateLimiter = createRedisRateLimiter(redis); // 20-req burst, 1s window

app.use(
  '/v1',
  apiKeyAuth({
    pool,
    pepper: process.env.API_KEY_PEPPER!,
    rateLimiter,
  }),
);

app.get('/v1/me', (req, res) => {
  const auth = (req as AuthenticatedRequest).auth!;
  res.json({ tenant_id: auth.tenantId, scopes: auth.scopes });
});
```

For a route requiring specific scopes:

```ts
app.post(
  '/v1/packs/generate',
  apiKeyAuth({
    pool,
    pepper,
    rateLimiter,
    requiredScopes: ['questions:read', 'export:bulk:json'],
  }),
  packsRouter,
);
```

## Headers accepted

- `Authorization: Bearer <key>` — canonical, per D3 §8 examples
- `X-Talpro-API-Key: <key>` — alias

Both are redacted from Pino logs (configured in `services/readybank/src/logger.ts`).

## Failure responses

| Status | Title               | When                                                                                  |
| ------ | ------------------- | ------------------------------------------------------------------------------------- |
| 401    | Unauthorized        | header missing or unparseable                                                         |
| 401    | Invalid Credentials | key not found                                                                         |
| 403    | Forbidden           | revoked, expired, or scope missing (with `missing_scopes` extension)                  |
| 429    | Too Many Requests   | rate limit exceeded; includes `Retry-After` header + `retry_after_seconds` body field |

All responses include `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers when a rate limiter is configured.

## Hashing decision (CTO-DELTA)

D3 §2.2 specifies Argon2id at rest with 64MB / 3 iter / 4 parallelism. The `app.api_keys.hashed_key VARCHAR(255) UNIQUE` constraint in `0001_initial_schema.sql` is incompatible with salted Argon2 (each hash is unique per call). Decision: HMAC-SHA256(pepper, key). See `infra/CTO-deltas/CTO-DELTA-api-key-hashing.md` for full reasoning.

## Tests

```bash
pnpm --filter @qorium/auth test
```

22 vitest cases — unit tests for parse/hash/equal + supertest integration tests for the middleware (happy path, all four failure modes, rate-limit headers, audit logging). All pass without Postgres or Redis (mock pool + in-memory rate limiter).
