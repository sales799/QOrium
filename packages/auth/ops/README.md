# @qorium/auth — Package Operating Folder

**Package status:** Shipped (PR #5). API key authentication + Redis-backed rate limiting + audit logging. Consumed by `services/readybank` and any future authenticated service.
**Owner:** CTO Office (engineering)
**Source-of-truth README:** [`packages/auth/README.md`](../README.md)
**Constitutional authority:** SO-13 (Tech Stack — Express middleware standard), SO-15 (Zero Secrets in Git), SO-3 (Quality Gate)

---

## Why this folder

The auth package is foundational — every authenticated API call flows through it. When something goes wrong with auth (invalid keys, rate-limit edge cases, audit log gaps), the team needs:

1. A documented record of WHY the auth design is what it is (ADRs)
2. Rotation + invalidation procedures (runbooks)
3. Numerical commitments — how fast is auth, what error rate is acceptable (SLOs)

This folder owns those.

---

## Folder structure

```
packages/auth/ops/
├── README.md                       ← you are here
├── adrs/
│   └── 0001-api-key-format.md      ← qor_{live,test,internal}_* canonical format
└── sli-slo.md                      ← Auth-specific SLOs
```

Runbooks (key rotation, audit log review) cross-reference `cto/runbooks/secret-rotation.md` rather than duplicate content here.

---

## What @qorium/auth does (high-level)

Per `packages/auth/README.md`:

- Parses API keys in the canonical `qor_(live|test|internal)_*` format (per ADR 0001)
- Hashes keys at rest with HMAC-SHA256 (deterministic; satisfies `app.api_keys.hashed_key UNIQUE`)
- Looks up `app.api_keys`, rejects revoked / expired
- Optional rate limiting via `rate-limiter-flexible` (Redis prod, in-memory tests)
- Optional scope enforcement (`requiredScopes`)
- Records every authenticated attempt to `audit.events` (fire-and-forget)
- Returns RFC 7807 Problem Details on every failure path

---

## What @qorium/auth does NOT do

- ❌ NOT a session manager (no cookies, no JWT issuance — API keys are the auth model Y1)
- ❌ NOT an OAuth provider (when OAuth becomes a customer ask, that's a separate ADR + likely separate package)
- ❌ NOT a permissions / RBAC system (basic scope check is the ceiling Y1)
- ❌ NOT user-facing (no signup / signin flow — that's customer-zero territory + Bali manual onboarding per `services/readybank/ops/runbooks/customer-onboarding.md`)

---

## Cadence

| Cadence                     | Activity                                                       | Owner                                                                     |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Per arch change**         | New ADR; backwards-compat strategy                             | CTO                                                                       |
| **Quarterly**               | Audit log review (any anomalies?) — `audit.events` table query | CTO + GATEKEEPER                                                          |
| **Per customer onboard**    | API key issuance via auth admin tooling                        | CTO (per `services/readybank/ops/runbooks/customer-onboarding.md` Step 4) |
| **Per key revocation**      | Key marked `revoked: true`; audit log records revocation event | CTO                                                                       |
| **Per rate-limit incident** | Investigate flagged customer; tune their plan tier             | Bali + CTO                                                                |

---

## Constitutional anchors

- **SO-15** Zero Secrets in Git — API keys never in code; all reside in `app.api_keys` table or env vars
- **SO-3** Quality Gate — auth failures must not silently allow requests; tests prove deny-by-default
- **SO-13** Tech Stack — Express middleware (not Fastify, not custom; consistent with services/readybank ADR 0001)
- **CTO Architecture §6.1 / §6.2** — full security architecture context

---

## Cross-references

| Topic                                           | Lives at                                                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Package README**                              | [`packages/auth/README.md`](../README.md)                                                                                   |
| **Source code**                                 | [`packages/auth/src/`](../src/)                                                                                             |
| **Test suite**                                  | [`packages/auth/__tests__/`](../__tests__/)                                                                                 |
| **Consumed by**                                 | [`services/readybank/`](../../../services/readybank/)                                                                       |
| **API key format spec**                         | `infra/B?/D3-Talpro-Internal-API-Key-Spec` (referenced in package README)                                                   |
| **Audit log table**                             | `infra/B7-postgres-migrations/` `audit.events` schema                                                                       |
| **Secret rotation runbook**                     | [`cto/runbooks/secret-rotation.md`](../../../cto/runbooks/secret-rotation.md) — covers customer API key rotation procedure  |
| **Customer onboarding (where keys get issued)** | [`services/readybank/ops/runbooks/customer-onboarding.md`](../../../services/readybank/ops/runbooks/customer-onboarding.md) |

---

_Maintained by CTO Office. Authority: Constitution §2.3._
