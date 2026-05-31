# QG-05 Conditional Follow-Up Gates

The 2026-05-31 Rakshak run returned `CONDITIONAL-GO` with seven follow-ups.
This file maps each follow-up to a repeatable production gate.

| Follow-up | Gate |
| --- | --- |
| Off-peak 2h soak | `QORIUM_SOAK_EVIDENCE_PATH` plus `QORIUM_MIN_SOAK_HOURS=2` |
| Public edge/app rate-limit detection | `rate limit` check now requires `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` on 429 |
| `security.txt` | `security.txt` check fetches `QORIUM_SECURITY_TXT_URL` or `${QORIUM_PROD_WEB_URL}/.well-known/security.txt` |
| Authenticated audit API customer smoke | `audit sample` now requires `QORIUM_MIN_AUDIT_SAMPLE_ROWS` rows |
| Scheduled chaos drill | `QORIUM_CHAOS_DRILL_EVIDENCE_PATH` must contain rollback, scope or blast radius, and final outcome language |
| DKIM selector verification | `QORIUM_DKIM_DOMAIN` plus `QORIUM_DKIM_SELECTOR` performs a live TXT lookup |
| Error-tracking instrumentation | `QORIUM_REQUIRE_ERROR_TRACKING=true` requires `QORIUM_ERROR_TRACKING_DSN` or `SENTRY_DSN` |

Run:

```bash
pnpm run production:gate
```

Keep optional evidence gates unset in local development. Set them in the VPS
release environment when closing the conditional Rakshak checklist for a live
deployment.
