# @qorium/auth — SLI / SLO

**Owner:** CTO Office
**Authority:** Constitution SO-3 (Quality Gate), SO-15 (Zero Secrets in Git)
**Cadence:** Reviewed monthly; tightens at first paid customer onboard
**Parent SLO doc:** [`cto/sli-slo.md`](../../../cto/sli-slo.md) operational section + [`services/readybank/ops/sli-slo.md`](../../../services/readybank/ops/sli-slo.md) auth-tier section

---

## Why this exists

Auth is on the hot path for every authenticated API call. If auth is slow, the entire API is slow regardless of what the business logic does. If auth is wrong, the whole product is broken. SLOs make these failure modes measurable.

---

## Service-level indicators (per the auth middleware)

| SLI                                 | SLO target                            | Window     | Notes                                                                                            |
| ----------------------------------- | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| **Auth middleware p99 latency**     | <20ms                                 | 7 days     | Includes DB lookup + HMAC + rate-limit check + audit log enqueue                                 |
| **Auth middleware p95 latency**     | <10ms                                 | 7 days     | Most calls hit the cache layer (Redis); DB miss is the long tail                                 |
| **Auth correctness — over-allow**   | 0 events / quarter                    | continuous | A revoked or expired key MUST never be accepted. Any over-allow = P0                             |
| **Auth correctness — false-deny**   | <0.01% / month                        | continuous | A valid key MUST not be denied. False-deny rate measured via customer reports + audit log review |
| **Rate-limit accuracy**             | 100% (on-budget)                      | continuous | A key at 90% of its tier limit gets `rate_limit_warning`; at 100% gets denied. No off-by-one     |
| **Audit log completeness**          | 100% of authenticated requests logged | continuous | `audit.events` table append; missed entries trigger a P1                                         |
| **Audit log latency (write to DB)** | p95 <100ms                            | 7 days     | Fire-and-forget; if the queue backlogs, the audit log SLO degrades                               |

---

## Failure-mode escalation

| Mode                                                                     | Severity                             | Detection                                     | Action                                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Over-allow** (revoked/expired key accepted)                            | **P0**                               | Customer report OR security review finds it   | Immediate rotation of all keys in the affected blast radius; postmortem mandatory                  |
| **False-deny pattern** (multiple customers reporting deny on valid keys) | **P1**                               | Customer reports clustering; audit log review | Investigate within 4 hours; fix forward; postmortem                                                |
| **Auth latency p99 >50ms sustained 1h**                                  | **P1**                               | Per `cto/runbooks/incident-response.md`       | CTO investigates; likely Redis or DB issue downstream of auth                                      |
| **Audit log write failures >1%**                                         | **P1**                               | Pino log line `audit.write.failed` rate       | Investigate downstream sink; never block requests on audit (fire-and-forget design)                |
| **Single key compromised** (per customer report or security finding)     | **P0 if PII data accessed; else P1** | Customer / security report                    | Per `cto/runbooks/secret-rotation.md` incident-driven rotation; revoke compromised key immediately |
| **Rate-limit ceiling breached without expected `rate_limit_warning`**    | **P2**                               | Customer report                               | Investigate; may indicate Redis state drift                                                        |

---

## Hot-path optimization targets

The auth middleware is on EVERY authenticated request. Optimization priorities:

1. **Cache the API key → record lookup** (Redis with 5-min TTL; invalidated on revoke/expire)
2. **HMAC is constant-time** (`crypto.timingSafeEqual`) — protects against timing attacks
3. **Audit log write is async** — never block the request on the DB write
4. **Rate-limit check is single Redis call** (`rate-limiter-flexible` consume)

If the auth middleware ever exceeds 20ms p99 sustained, one of these has regressed.

---

## Customer-facing tier impact

`@qorium/auth` enforces tier-based rate limits. The tier values come from the customer record (provisioned via `services/readybank/ops/runbooks/customer-onboarding.md` Step 4). Defaults:

| Tier                        | Rate limit   | Burst       | Source                                  |
| --------------------------- | ------------ | ----------- | --------------------------------------- |
| Lite (~$5K/yr)              | 100 req/min  | 10 req/sec  | per `services/readybank/ops/sli-slo.md` |
| Pro (~$15K/yr)              | 500 req/min  | 25 req/sec  | per `services/readybank/ops/sli-slo.md` |
| Scale (~$25K/yr)            | 2000 req/min | 100 req/sec | per `services/readybank/ops/sli-slo.md` |
| Internal (`qor_internal_*`) | unlimited    | unlimited   | per ADR 0001                            |

Tier changes happen via key re-issuance with the new tier metadata; old keys revoke; new keys roll out in a 24-hour window.

---

## Quarterly audit (GATEKEEPER cadence)

Once per quarter, GATEKEEPER (per `gatekeeper/security-review-protocol.md` Quarterly section) reviews:

- All currently-active keys vs the customer roster (any orphan keys?)
- Audit log anomalies (unusual access patterns, geographic spikes, etc.)
- Rate-limit breach frequency (any customer hitting their ceiling repeatedly = upsell opportunity)
- Any false-deny customer reports clustered around a specific time

Findings logged in monthly business review (`bali/templates/monthly-business-review.md` §9) AND in `cto/tech-debt.md` if remediation needed.

---

## Y1 reality

Auth is shipped (PR #5) and working in dev. Production traffic = zero (no live customers). When the first customer onboards:

- Auth tier-limit configuration becomes real (per `services/readybank/ops/runbooks/customer-onboarding.md` Step 4)
- SLO measurement infrastructure activates (SLI 4: false-deny rate becomes meaningful only when there's customer traffic)
- This SLO doc gets re-validated against actual production characteristics

Until then, the SLOs are internal commitments measured via test suite + manual smoke. Real numbers populate at first-customer-onboard.

---

_Cross-references: Constitution SO-3, SO-15. Companion: `cto/sli-slo.md` (operational SLOs), `services/readybank/ops/sli-slo.md` (consumer of this auth layer), `cto/runbooks/secret-rotation.md` (key rotation procedure), `gatekeeper/security-review-protocol.md` (quarterly audit cadence)._
