# ReadyBank API — SLI / SLO

**Owner:** CTO Office (engineering) + Bali (customer-facing — translates to SLAs in commercial template)
**Authority:** Constitution SO-3 (Quality Gate Discipline), SO-23 (pricing band — the SLOs commit what the band promises) + marketing claim on `qorium.online/` proof bar (`<200ms p95`)
**Cadence:** Reviewed monthly (in business review per `bali/templates/monthly-business-review.md`)
**Parent SLO doc:** [`cto/sli-slo.md`](../../../cto/sli-slo.md) (this is the deeper ReadyBank-specific extension)

---

## Why this exists separately from `cto/sli-slo.md`

`cto/sli-slo.md` lists ReadyBank SLOs at a high level (alongside marketing site SLOs, content engine SLOs, operational SLOs). This file is the deeper expansion — per-endpoint targets, error-budget math, action thresholds specific to the API service.

When a CTO or Bali walks through "what's our actual API SLO commitment to a customer," THIS doc is the read.

---

## Customer-facing commitments (when contracts sign)

These become contractual SLAs in the Platform API license template (per `bali/outreach/platform-api.md` + Bali Playbook §6.2 — contracts). Y1 reality: no live customer yet; SLOs are internal commitments documented for the contract template.

### Headline numbers (the marketing claim)

Per `qorium.online/` proof bar:

> **<200ms p95 API**

The proof-bar number translates here as a 200ms p95 target on `/v1/packs/generate` over a 7-day rolling window.

Three layers of customer commitment — each tier of customer gets a different layer:

| Tier                             | Uptime         | p95 latency | Webhook delivery            | Support                                                          |
| -------------------------------- | -------------- | ----------- | --------------------------- | ---------------------------------------------------------------- |
| **API access (Lite, ~$5K/yr)**   | 99.5% / month  | <300ms      | best-effort                 | email, 2 business-day response                                   |
| **API access (Pro, ~$15K/yr)**   | 99.9% / month  | <200ms      | <1 retry / day              | email + Slack channel, 1 business-day response                   |
| **API access (Scale, ~$25K/yr)** | 99.95% / month | <150ms      | <1 retry / day, with replay | email + Slack channel + monthly review, 4-hour response on P0/P1 |

**Internal SLOs** (the ones we operate to, regardless of which tier the customer signed):

- Uptime: 99.9% / month (so we have headroom over the Lite tier promise)
- p95: <200ms (matches marketing claim; matches Pro tier; ahead of Lite)

If we systematically can't meet the internal numbers, we don't sell the higher tiers until we can.

### Y2+ tier evolution

Tier names + price-band sub-divisions (`$5K/$15K/$25K`) are illustrative; final naming + sub-segmentation locks when first paying customer signs. The tier structure is in the SO-23 band ($5K-25K/yr); how we slice it is Bali's commercial-template decision.

---

## Per-endpoint SLI / SLO

| Endpoint                             | SLI              | SLO target | Window       | Notes                                                                                                         |
| ------------------------------------ | ---------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `GET /health`                        | uptime + 200 OK  | 99.95%     | continuous   | Should never fail; if it does, the box is dying                                                               |
| `GET /v1/questions/{uuid}`           | p95 latency      | <100ms     | 7 days       | Single-question lookup; should be DB index lookup + minimal serialization                                     |
| `GET /v1/questions/{uuid}`           | error rate (5xx) | <0.1%      | 5-min window | Anything higher = something deeper broken                                                                     |
| `GET /v1/questions/search`           | p95 latency      | <250ms     | 7 days       | Multi-record query with filtering                                                                             |
| `GET /v1/questions/search`           | error rate (5xx) | <0.5%      | 5-min window | Allows a touch more variance because query complexity varies                                                  |
| `POST /v1/packs/generate`            | p95 latency      | **<200ms** | 7 days       | **The headline claim.** Pack generation is N question lookups + role-graph traversal + format-mix application |
| `POST /v1/packs/generate`            | error rate (5xx) | <0.5%      | 5-min window |                                                                                                               |
| `GET /v1/packs/{id}/export?format=*` | p95 latency      | <500ms     | 7 days       | Bulk export; tolerates higher latency due to serialization volume                                             |
| `GET /v1/packs/{id}/export?format=*` | error rate (5xx) | <0.5%      | 5-min window |                                                                                                               |
| Auth-failure response                | p99 latency      | <50ms      | continuous   | Failing fast on bad keys is critical; don't burn server resources on unauthorized requests                    |

---

## Error budget math

### Uptime: 99.9% over 30 days = ~43 minutes/month

This is the headroom. Burn modes:

- Burn 25% in 7 days = ~10 min — review at next Mon weekly forecast
- Burn 50% in 14 days = ~22 min — pause non-essential deploys; CTO investigates root cause
- Burn 100% in 30 days = ~43 min — P1 incident; postmortem mandatory; customer notification per `cto/runbooks/incident-response.md` §Customer notification

### Latency: p95 budget per endpoint

Latency doesn't have a "burn budget" the same way; instead, sustained breach of p95 over the SLO window triggers escalation:

- p95 above target for **1h continuous** → CTO investigates (transient backend issue?)
- p95 above target for **24h continuous** → P1 incident; root cause analysis required
- p95 above target for **7 days continuous** → P0 incident; SLO is now untrue; commercial-implication review (does any customer SLA contract depend on this?)

---

## Auth + rate-limiting SLOs

The `@qorium/auth` package provides API key validation + rate limiting. Per the Auth package's own SLOs:

| Metric                      | Target                                                        | Window     |
| --------------------------- | ------------------------------------------------------------- | ---------- |
| API key validation accuracy | 100% (no over-allow; no false-deny)                           | continuous |
| Rate-limit accuracy         | 100% (a key at 90% of limit gets warned; at 100% gets denied) | continuous |
| Auth middleware p99 latency | <20ms                                                         | 7 days     |

Auth failures (denied requests) do NOT count toward the API endpoint's error rate (different metric class). They DO count toward customer-facing observability if the customer hits their own rate limit too often.

---

## Anti-leak SLO ties (CDO-owned, ReadyBank-relevant)

ReadyBank serves questions with embedded anti-leak metadata (`anti_leak_scan: { last: ..., status: clean }`). The freshness of this data is bounded by SO-22:

- `anti_leak_scan.last` MUST be ≤24h ago for any question returned by the API (per CDO `cdo/anti-leak-forensics.md`)
- If a question's `last` field is >24h, the API filters it OUT — auto-rotation hasn't completed yet, so we'd rather return one less question than serve a stale one

This is a **service-level enforcement of a constitutional SLO** — the SLO lives in `cdo/anti-leak-forensics.md`; the enforcement happens at the API query layer.

---

## Action thresholds + escalation

| Threshold breach                          | Severity | First responder                                  | Escalation                                         |
| ----------------------------------------- | -------- | ------------------------------------------------ | -------------------------------------------------- |
| p95 >250ms on `/v1/packs/generate` for 1h | P1       | CTO                                              | If sustained 4h, CEO                               |
| Any 5xx >1% over 5-min window             | P0       | CTO                                              | CEO + customer notification                        |
| Auth middleware p99 >50ms for 30 min      | P1       | CTO                                              | If broken auth indicates compromise: CEO immediate |
| Health endpoint 5xx                       | P0       | CTO + auto-rollback per `runbooks/api-deploy.md` | CEO immediate                                      |
| Anti-leak `last >24h` filter rate >5%     | P1       | CTO + CDO                                        | Anti-leak engine investigation                     |

Per `cto/runbooks/incident-response.md` for incident classification + customer notification + postmortem cadence.

---

## Customer-facing transparency

Once the first paid customer onboards (per Y1 target), publish a **status page** at `status.qorium.online` showing:

- Current uptime (last 30 days)
- Current p95 latencies per endpoint
- Anti-leak rotation freshness (last successful corpus scan timestamp)
- Recent incidents (last 90 days)

Status page deferred per TD-004 in `cto/tech-debt.md` — pre-paid-customer reality.

---

## Y1 reality

ReadyBank has no live customer traffic. SLO measurement infrastructure is partial:

- ✅ Uptime monitor extends from `.github/workflows/uptime.yml` once API has public URL (currently localhost dev only; production URL TBD)
- ⚠️ p95 latency: not currently measured; instrumentation TODO (Plausible Performance plugin OR Pino-Pretty + log analysis OR Sentry transaction-tracking; tracked in TD-002 of `cto/tech-debt.md`)
- ⚠️ Error-rate dashboards: PM2 logs only Y1; aggregate dashboards via Sentry post-DSN provisioning (TD-007)

When first customer signs (per `bali/leads/Y1-target-list.md`), instrumentation backlog accelerates per `runbooks/api-deploy.md` Pre-customer-onboarding readiness check.

---

## Related SLOs (cross-Office)

| Topic                                                             | Lives at                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Marketing site SLOs**                                           | `cto/sli-slo.md` Product surfaces section                                        |
| **Content engine SLOs** (anti-leak, IRT, AI plagiarism benchmark) | `cto/sli-slo.md` Content engine section                                          |
| **Operational SLOs** (deploy success, incident response)          | `cto/sli-slo.md` Operational section                                             |
| **Anti-leak fingerprint freshness**                               | `cdo/anti-leak-forensics.md` SLA                                                 |
| **IRT calibration latency**                                       | `cdo/irt-calibration-protocol.md` (target: question → calibrated within 14 days) |

Together these compose QOrium's full SLO surface. This doc is the API-specific layer; the others handle the rest.

---

_Cross-references: Constitution SO-3, SO-22, SO-23, marketing site `/` proof-bar claim. Companion: `cto/sli-slo.md` (parent), ADR 0001-0003 in this folder, `runbooks/api-deploy.md` (deploy implications), `runbooks/customer-onboarding.md` (commercial SLA derivation), Bali Sales Playbook §6.2 (commercial template)._
