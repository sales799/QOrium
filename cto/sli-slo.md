# Service-Level Indicators + Objectives (SLI / SLO)

**Owner:** CTO Office · **Authority:** Constitution SO-3 (Quality Gate), SO-21 (IRT mandate), SO-22 (AI Plagiarism Public Benchmark), CTO Architecture v1 §6/§8
**Cadence:** Reviewed monthly (in business review per `bali/templates/monthly-business-review.md`)
**Last reviewed:** 2026-05-06

---

## Why this exists

SLOs are the binding numerical commitments behind the marketing claims on `qorium.online`. When the home page says "<200ms p95 API," that's a constitutional claim; this doc says how we measure it, what we promise, and what triggers action when we miss.

Three categories: **product surfaces** (marketing site, ReadyBank API), **content engine** (anti-leak, IRT calibration, AI plagiarism), and **operational** (deploy success, incident response).

---

## Glossary

- **SLI (Service Level Indicator):** the actual measurement (e.g., "p95 latency on /v1/packs over 7 days")
- **SLO (Service Level Objective):** the target the SLI must meet (e.g., "<200ms")
- **Error budget:** the room we have to miss the SLO before we stop shipping new features and fix what's broken (typically `1 - SLO uptime` over a window)
- **SLA (Service Level Agreement):** a contractual commitment to a customer (we DON'T have customer SLAs yet; SLOs are internal-only Y1)

---

## Product surfaces

### qorium.online (marketing site)

| SLI                      | SLO target               | Window       | Measurement                                                            | Current state                                                                                   |
| ------------------------ | ------------------------ | ------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Uptime (200 OK on `/`)   | 99.5%                    | 30 days      | UptimeRobot or equivalent (TBD: monitor not yet provisioned)           | Unmeasured — gap                                                                                |
| p95 latency on `/`       | <500ms (TTFB from EU/US) | 24 hours     | Manual cURL from MacBook + future synthetic monitor                    | ~1.85s observed in May smoke (cold cache; warm cache ~300ms)                                    |
| All 21 routes return 200 | 100%                     | every deploy | `marketing-quality.yml` smoke step + `deploy-marketing.yml` smoke step | ✅ as of last check                                                                             |
| Lighthouse Performance   | ≥85                      | per PR       | `marketing-quality.yml` Lighthouse CI job                              | Warn-mode baseline (not enforced yet)                                                           |
| Lighthouse Accessibility | ≥90                      | per PR       | `marketing-quality.yml` axe-core job                                   | Warn-mode baseline                                                                              |
| Lighthouse SEO           | ≥90                      | per PR       | `marketing-quality.yml` Lighthouse CI job                              | Warn-mode baseline                                                                              |
| TLS cert valid           | always                   | continuous   | certbot cron + `curl -I` checks                                        | ✅ qorium.online + qorium.in both valid                                                         |
| Security headers present | 100% (all 6 headers)     | per response | `curl -I` smoke                                                        | ✅ HSTS · CSP · X-Frame-Options · X-Content-Type-Options · Referrer-Policy · Permissions-Policy |

**Error budget for uptime:** 99.5% over 30 days = ~3.6 hours/month of unavailability. Burn 50%+ in a month → CTO pauses non-essential deploys until root-caused.

**Action thresholds:**

- p95 >800ms sustained 24h → CTO investigates (likely Next.js cold-start or VPS resource issue)
- Uptime drops below 99% in any 30-day window → P1 incident per `cto/runbooks/incident-response.md`
- Lighthouse Performance drops >5 points between runs → CTO investigates regression (PR-level)

### ReadyBank API (services/readybank)

(Live customers haven't onboarded yet, but the SLOs are committed in the marketing copy + Investor Brief.)

| SLI                                   | SLO target           | Window     | Measurement                                     | Notes                                                                 |
| ------------------------------------- | -------------------- | ---------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| p95 latency on `/v1/packs/generate`   | <200ms               | 7 days     | TBD: instrumentation in PM2 + log-based metrics | Marketing claim on home page proof bar                                |
| p95 latency on `/v1/questions/{uuid}` | <100ms               | 7 days     | TBD                                             | Bulk lookup; should be faster than pack generate                      |
| Uptime                                | 99.9%                | 30 days    | TBD: same monitor as marketing                  | Public API SLO; binding commitment for first paid customer onboarding |
| Rate limit accuracy                   | 100% (no over-allow) | continuous | `@qorium/auth` rate limiter                     | Must enforce per-API-key plan tier                                    |
| API key validation                    | 100%                 | continuous | `@qorium/auth` middleware                       | No unauthorized request reaches business logic                        |

**Error budget for ReadyBank uptime:** 99.9% over 30 days = ~43 minutes/month of downtime. Once live customers onboard, this becomes a contractual bound.

**Action thresholds:**

- p95 >250ms on `/v1/packs/generate` for >1 hour → P1 incident
- Any 5xx > 1% over 5-minute window → P0 (customer-facing API)

### qorium.in (301 redirect)

| SLI                           | SLO target | Window     | Measurement                       |
| ----------------------------- | ---------- | ---------- | --------------------------------- |
| All paths 301 → qorium.online | 100%       | per deploy | `curl -I https://qorium.in` smoke |
| TLS cert valid                | always     | continuous | certbot                           |

(Lower SLO bar than primary because it's a redirect-only surface.)

---

## Content engine SLOs

### Anti-leak rotation (SO-22 — AI Plagiarism Public Benchmark)

| SLI                                             | SLO target                            | Window         | Measurement                                                                         |
| ----------------------------------------------- | ------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| Anti-leak fingerprint freshness                 | <24 hours since last full corpus scan | continuous     | Background job timestamp; surfaced on customer dashboard (TBD when dashboard ships) |
| Time from leak detection to retired+regenerated | <48 hours                             | per leak event | Job log + content engine event stream                                               |
| % of library quarterly-rotated                  | ≥15%                                  | quarterly      | Rotation log per quarter                                                            |

**Why the 24-hour SLO:** Adaface ships a 24-hour anti-leak guarantee. We claim "daily" rotation publicly. To stay strictly better than the published benchmark, our SLO is `<24h` (i.e., we strictly beat 24h, not equal to it).

**Action threshold:**

- Fingerprint freshness >24h sustained → P0 (constitutional violation — anti-leak claim becomes false)

### IRT calibration (SO-21 — IRT Mandate)

| SLI                                                     | SLO target        | Window       | Measurement                                            |
| ------------------------------------------------------- | ----------------- | ------------ | ------------------------------------------------------ |
| % of shipped questions with IRT calibration metadata    | 100%              | per release  | Reference Panel calibration job output                 |
| Time from question authored → calibrated                | <14 days          | per question | Authoring → calibration pipeline timestamps            |
| Calibration accuracy (predicted vs observed difficulty) | ≥0.85 correlation | quarterly    | Calibration audit on a sample of 100 questions/quarter |

**Action threshold:**

- Any shipped question without IRT metadata → P0 (constitutional violation)
- Calibration correlation drops below 0.80 → P1 (Reference Panel needs review)

### Bias detection (governance/Bias-Detection-Methodology-v1.md)

| SLI                                                    | SLO target | Window      |
| ------------------------------------------------------ | ---------- | ----------- |
| % of shipped questions through bias-detection pass     | 100%       | per release |
| % of flagged questions reviewed within 5 business days | 100%       | continuous  |

---

## Operational SLOs

### Deploy success

| SLI                                                        | SLO target | Window       | Measurement                                      |
| ---------------------------------------------------------- | ---------- | ------------ | ------------------------------------------------ |
| `deploy-marketing.yml` workflow success rate               | ≥95%       | 30 days      | GH Actions workflow success/failure log          |
| Deploy duration (workflow start → smoke pass)              | <10 min    | per deploy   | Workflow timing                                  |
| Time-to-rollback (incident detected → known-good restored) | <15 min    | per rollback | `cto/runbooks/deploy-rollback.md` execution time |

**Action thresholds:**

- Deploy success drops below 90% in 30 days → CTO reviews `infra/marketing-deploy.sh` for fragility
- Time-to-rollback >20 min in an incident → postmortem includes a runbook update

### CI gates

| SLI                                         | SLO target | Window      | Measurement     |
| ------------------------------------------- | ---------- | ----------- | --------------- |
| `ci.yml` success rate on `main`             | 100%       | continuous  | GH Actions      |
| `marketing-quality.yml` success rate on PRs | ≥90%       | 30 days     | GH Actions      |
| Time from push → CI green                   | <15 min    | per push    | Workflow timing |
| Mean time to fix CI failure on `main`       | <2 hours   | per failure | Failure log     |

**Action threshold:**

- CI fails on `main` and stays failing >4 hours → P1 (blocks all deploys)

### Incident response

| SLI                                                 | SLO target | Window       |
| --------------------------------------------------- | ---------- | ------------ |
| P0 acknowledgment time                              | <30 min    | per incident |
| P0 resolution time (or workaround)                  | <4 hours   | per incident |
| P1 acknowledgment time                              | <2 hours   | per incident |
| P1 resolution time                                  | <24 hours  | per incident |
| Postmortem published within 48h of P0/P1 resolution | 100%       | per incident |

---

## Monitoring gaps (current honest state)

| Gap                                                 | Impact                                       | Plan                                                                                             |
| --------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| No external uptime monitor (UptimeRobot or similar) | Uptime SLI is unmeasured                     | Add UptimeRobot free tier; alert to CTO email + WhatsApp. ETA: post-launch C2 phase.             |
| No real-time p95 latency metric                     | Latency SLO is sampled manually              | Add Plausible Analytics performance plugin OR a simple TTFB synthetic monitor. ETA: post-launch. |
| No anti-leak job exists yet                         | Anti-leak SLO is aspirational, not measured  | Anti-leak engine is M2 deliverable per Blueprint; SLOs become measurable then.                   |
| No IRT calibration metric                           | IRT SLO is aspirational, not measured        | IRT pipeline is M3 deliverable; SLOs become measurable then.                                     |
| No customer-facing status page                      | Customer notification on incidents is manual | Status page deferred to post-launch when there's a customer to notify.                           |

These gaps are legitimate Y1 reality. The SLOs are documented because they're constitutional claims; the measurement infrastructure follows the engineering trajectory.

---

## Review cadence

- **Monthly:** SLO review in `bali/templates/monthly-business-review.md` §6 (added to that template's check list).
- **Quarterly:** Add new SLOs as new product surfaces ship (e.g., when ReadyBank gets first live customer, the API SLOs become contractual).
- **Per-incident:** any P0 or P1 incident's postmortem reviews whether the SLO that was violated needs adjustment OR whether the measurement infrastructure was inadequate.

---

## Relation to customer SLAs (Y2+ contractual commitments)

When QOrium signs first ReadyBank customer:

- The internal SLOs above become the floor for any customer-facing SLA we offer
- Customer-facing SLAs are typically more lenient than internal SLOs (e.g., we promise 99.5% to customer; we operate to 99.9% internally)
- SLA breaches trigger contractual remedies (credits, etc.) — separate from the operational `cto/runbooks/incident-response.md` flow

This entire customer SLA track is OUT OF SCOPE for Y1. Add it when first ReadyBank customer signs.

---

_Cross-references: Constitution SO-3 (Quality Gate), SO-21 (IRT), SO-22 (AI Plagiarism Benchmark), CTO Architecture v1 §6 (Anti-Leak Engine) + §8 (Security Posture). Companion runbooks: `cto/runbooks/incident-response.md`, `cto/runbooks/deploy-rollback.md`. Tech-debt register: `cto/tech-debt.md` (gaps tracked there)._
