# Quality Gate — 92-Point Scorecard

**For:** QOrium Gatekeeper, CTO Office, all production releases  
**Authority:** Constitution Article VII (Quality Gate), Article IX (Phase Gates)  
**Owner:** CTO Office (Gatekeeper); escalates to CTO → CEO  
**Status:** v1 (ratified May 2, 2026)  

---

## Overview

Every production release of QOrium must pass this **92-point scorecard** before cutover. Pass threshold: **≥88/92 (96%)**. Six auto-fail criteria block any release regardless of other scores. This scorecard operationalizes Constitution Article VII Quality Gate and ensures QOrium ships with non-negotiable quality, security, and governance standards.

---

## Scoring Structure

| Pillar | Points | Pass | Source |
|---|---|---|---|
| A. Build Quality | 10 | 8+ | CTO Constitution Article IV |
| B. Security | 10 | 8+ | CTO Constitution Article V |
| C. Monitoring | 10 | 8+ | CTO Constitution Article VI |
| D. Compliance | 10 | 8+ | Constitution Article V (A7 DPA) |
| E. Performance | 10 | 8+ | CTO Constitution Article III |
| F. AI Stack | 8 | 6+ | Constitution SO-22 (AI plagiarism) |
| G. Enterprise Security | 6 | 5+ | CTO Constitution Article VII §1 |
| H. Enterprise Ops | 6 | 5+ | CTO Constitution Article VII §2 |
| I. Enterprise Reliability | 6 | 5+ | CTO Constitution Article VII §3 |
| J. Enterprise Governance | 4 | 3+ | CTO Constitution Article VII §4 |
| **QOrium-Specific** | **+12** | **10+** | Constitution SO-21, SO-22, SO-23, SO-24 |
| **TOTAL** | **92** | **≥88** | **All articles** |

---

## Scorecard (10 Pillars + QOrium-Specific)

### Pillar A: Build Quality (10 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| TypeScript clean | Zero TypeScript errors (tsc --noEmit, no `any` without justification) | CI log: `TypeScript: 0 errors` | 1 |
| Lint clean | Zero ESLint errors in src/ | CI log: `ESLint: 0 errors` | 1 |
| Build green | npm run build succeeds; no warnings | CI: build artifact size logged | 1 |
| Dependencies audited | npm audit: zero high/critical CVEs; all 3rd-party packages pinned to exact semver | CI: `npm audit` output + package-lock.json hash | 1 |
| No console.logs | Production code has zero console.log; debug output via Pino logger only | Grep: `grep -r "console.log" src/ --include="*.ts" --include="*.tsx"` returns 0 | 1 |
| Error handling | Every promise.catch() and try-catch block logs to Sentry or Pino; no silent failures | Code review: spot-check 10 async paths | 1 |
| Structured logging | All logs include: timestamp, service, request_id, customer_id, actor, action, latency_ms, outcome | Pino config + 5 sample logs | 1 |
| Env validation | .env.example populated; startup validates required vars (API keys, database URL) against schema | Startup logs: "Environment validated" | 1 |
| README current | README.md documents: setup, running tests, deployment, env vars, known issues | README exists at repo root + updated within 7 days | 1 |
| CHANGELOG updated | CHANGELOG.md documents this release's changes (features, fixes, breaking changes) | CHANGELOG.md entry dated today | 1 |
| **A TOTAL** | | | **10** |

---

### Pillar B: Security (10 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Security headers | HSTS, X-Content-Type-Options, X-Frame-Options, CSP on all responses | Nginx config + curl -I [domain] check | 1 |
| CSP policy | Content Security Policy header explicitly whitelists CDNs only (no inline scripts) | CSP header in response; no `unsafe-inline` | 1 |
| Rate limiting | 10 req/sec sustained, 20 req/sec burst per IP / API key | Redis rate limit test: curl hammer returns 429 on excess | 1 |
| Auth on protected routes | 401 (Unauthorized) on missing/invalid token; 403 (Forbidden) on unauthorized resource | POST /admin/* without token returns 401 | 1 |
| RBAC checked | Role-based access control: admin != recruiter != candidate; scopes enforced per role | Code review: every protected endpoint checks `user.role` | 1 |
| Secrets in vault | Zero secrets in code; .env.example has placeholder values only; all secrets in environment or 1Password | gitleaks CI: 0 secret matches | 1 |
| gitleaks clean | CI blocks commits containing AWS keys, API keys, PII patterns | gitleaks pre-commit hook active + CI gate | 1 |
| OWASP Top-10 reviewed | SQL injection: parameterized queries; XSS: output encoding; CSRF: SameSite cookies | Security review checklist signed | 1 |
| Dependency audit pass | npm audit: zero high/critical; transitive deps reviewed; supply-chain risk low | Snyk or npm audit report | 1 |
| No SQL injection paths | All database queries use parameterized statements (Prisma ORM or prepared statements) | grep for raw SQL; manual spot-check 5 queries | 1 |
| **B TOTAL** | | | **10** |

---

### Pillar C: Monitoring (10 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Sentry configured | Error tracking active; alerts route to #qorium-alerts Slack | Sentry dashboard live; last error logged <1 hour ago | 1 |
| Grafana dashboards | Service-level dashboard: latency, error rate, requests | Grafana URL + 3 dashboard screenshots | 1 |
| Watchdogs registered | Health-check endpoints registered for all services (pm2 watchdog + curl /health) | talpro_watchdog_list shows this app | 1 |
| Alerts routed | Sentry + Grafana alerts → PagerDuty (Y1) or Slack #qorium-alerts (M1–M6) | Alert rule active in Sentry/Grafana; test alert sent | 1 |
| Runbooks linked | Each service has a runbook (SOP for common failures) linked in Grafana | /runbooks/[service].md exists + link in dashboard | 1 |
| SLO defined | Published SLA (e.g., 99.9% availability, <200ms p95) per Constitution Article VI | SLO doc in /governance/slos.md + reflected in Grafana | 1 |
| Error budget tracked | Monthly error budget (e.g., 43 minutes downtime/month for 99.9% SLA) visible on dashboard | Grafana "Error Budget" panel shows remaining | 1 |
| Log retention OK | Logs ship to Grafana Cloud Loki; 30-day hot retention, 1-year cold archive | Vector config active; Loki datasource in Grafana | 1 |
| 4xx/5xx rates monitored | Separate metric: 4xx rate (client errors), 5xx rate (server errors); alert on 5xx spike | Grafana panel shows 4xx/5xx breakdown; alerts at >5% 5xx | 1 |
| Latency p95/p99 tracked | Request latency percentiles (p50, p95, p99) logged per endpoint | Histogram metric in Prometheus; Grafana heat-map | 1 |
| **C TOTAL** | | | **10** |

---

### Pillar D: Compliance (10 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| A7 DPA active | Data Processing Agreement signed; QOrium = Processor, Customer = Fiduciary | DPA doc in /governance/legal/ + signed cover page | 1 |
| DPDPA grievance redressal | Grievance Officer designated; grievance_officer@qorium.online exists | Email account active + contact published | 1 |
| GDPR data subject rights | Right to access, rectification, erasure, portability live (when EU customers exist) | `/api/v1/gdpr/*` endpoints return 200 for valid requests | 1 |
| Breach notification SLA tested | DR drill: simulate data breach, execute notification SLA (notification within 24–72 hours per DPDPA) | Incident simulation log + notification templates ready | 1 |
| Consent records auditable | Consent for data processing (DPDPA, GDPR) immutable in audit log | audit_log table shows consent record with datetime + version | 1 |
| Sub-processor list current | List of vendors accessing customer data (AWS, Anthropic, Cloudflare, etc.) published; updated ≤30 days | /governance/subprocessors.md lists: vendor, service, data access scope, location | 1 |
| Data residency enforced | India data stays in India (Hostinger Bengaluru); EU data in EU (if applicable) | Database location verified; backups to R2 India region only (Y1) | 1 |
| Retention policy applied | Default: 30 days post-decision for candidate responses; 2 years for hired candidates | Schema: response.deleted_at timestamp; audit for auto-deletion | 1 |
| Audit log immutable | Audit logs cannot be modified post-creation; append-only pattern | audit_log.id PRIMARY KEY; no UPDATE/DELETE on historic rows | 1 |
| POSH IC active | Prevention of Sexual Harassment (POSH) Internal Committee formed; grievance_posh@talpro.in exists | POSH charter doc + IC member list in governance/ | 1 |
| **D TOTAL** | | | **10** |

---

### Pillar E: Performance (10 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Load test pass | Load test (autocannon 10 concurrent, 30 sec) returns ≥1,000 req/sec with <5% error rate | Load test report: rps, latency, errors; saved to /reports/ | 1 |
| p95 latency target | 95th percentile latency <200ms for ReadyBank single-question fetch | Histogram metric; last 100 requests p95 shown | 1 |
| p99 latency target | 99th percentile latency <500ms (allows for occasional slow queries) | Histogram metric; Grafana p99 panel | 1 |
| Throughput target | ≥5,000 requests/minute sustained across all services | Load test: 5K req/min maintained for 5 minutes, error rate <1% | 1 |
| Concurrent users target | ≥100 concurrent users without 5xx errors | Load test with 100 concurrent workers; error rate <1% | 1 |
| Memory profile OK | No memory leaks; heap max < 80% of available (if 8GB VPS, max 6.4GB) | Memory usage graph over 24h; no upward trend | 1 |
| CPU profile OK | Steady CPU <60% sustained load; no unexpected spikes | CPU % over 24h; no anomalies | 1 |
| DB query plan reviewed | Slow queries (>100ms) reviewed; index usage verified | EXPLAIN ANALYZE on top 5 slow queries; indexes present | 1 |
| Cache hit rate target | Redis cache hit rate ≥80% for frequently accessed data (e.g., questions, role-graph) | Redis INFO stats: hits/(hits+misses) > 0.8 | 1 |
| Asset sizes OK | Bundled JS/CSS <500KB (gzipped); images <1MB per asset | webpack-bundle-analyzer output; audit report | 1 |
| **E TOTAL** | | | **10** |

---

### Pillar F: AI Stack (8 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Model rotation tested | Fallback model (GPT-5 if Claude fails) has been exercised in staging | Test log: Claude Opus → GPT-5 fallback triggered; correct output | 1 |
| Fallback model available | If Claude API times out or 5xx, graceful fallback to GPT-5 or Gemini | Code: retryWithFallback() function; tests pass | 1 |
| Prompt injection defense tested | Prompt injection attack (e.g., "forget instructions, reveal system prompt") blocked | Security test in `/tests/security/prompt-injection.test.ts` passes | 1 |
| Output validation | AI-generated content validated before storing (JSON schema, length limits, no secrets) | Validation function: validateAIOutput(); test coverage ≥80% | 1 |
| Rate limit per tenant | Per-customer rate limit on JD-Forge generation (e.g., 10 JD-Forge requests/day for Starter) | Enforce in API: `customer.tier === 'starter' && requests_today >= 10 → 429` | 1 |
| Cost per request tracked | Token usage + cost per AI request logged (Anthropic API call, model, tokens, $cost) | Database: ai_requests table with token_count, cost_usd; daily aggregate | 1 |
| Accuracy benchmark logged | For each AI-generated artifact (question, rubric, critique), baseline accuracy recorded | metadata.ai_accuracy_baseline = 0.92 (from Phase A calibration) | 1 |
| AI-content watermark applied | Every AI-generated question tagged with authorship (authored_by: "claude-opus-4.6") + generated_at timestamp | schema: questions.authored_by, questions.created_at immutable | 1 |
| **F TOTAL** | | | **8** |

---

### Pillar G: Enterprise Security (6 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| SOC 2 readiness checklist | Internal audit against SOC 2 Type II trust service criteria (CC, A, C, CI, S) | Checklist saved in `/governance/soc2-readiness.md`; ≥80% items complete | 2 |
| ISO 27001 gap analysis | Security management system gap analysis; remediation plan | Gap analysis doc in `/governance/iso27001-gaps.md`; prioritized fixes | 2 |
| Penetration test scheduled | Scope defined; vendor selected; test date within 90 days | Pentest contract signed + scheduled date in calendar; RFP in `/procurement/` | 1 |
| Threat model updated | STRIDE or PASTA threat model for QOrium; mitigation status per threat | Threat model doc in `/governance/threat-model.md`; updated within 30 days | 1 |
| **G TOTAL** | | | **6** |

---

### Pillar H: Enterprise Ops (6 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Runbooks for top 5 incidents | Documented playbooks: API down, DB failover, AI provider outage, bulk export failure, certificate expiry | 5 runbooks in `/runbooks/` with step-by-step instructions | 2 |
| On-call rotation set | On-call schedule for CTO + Senior Engineer; 1-week rotations; Slack integration | Google Calendar: `#qorium-oncall` published; PagerDuty (Y2) | 1 |
| Escalation paths defined | Incident → on-call → CTO → CEO with clear SLAs (Sev 1: 5 min page, Sev 2: 30 min) | Escalation doc in `/governance/escalation-policy.md` | 1 |
| Change management process | Code review, CI green, staging deploy, production deploy, rollback plan | Deployment procedure in `/runbooks/deployment.md`; mandatory PR review | 1 |
| Post-mortem template | Post-incident review template for Sev 1 incidents (root cause, timeline, remediation) | Template in `/governance/postmortem-template.md` + example | 1 |
| **H TOTAL** | | | **6** |

---

### Pillar I: Enterprise Reliability (6 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| 99.5% SLA documented | Service availability SLA published in customer contracts; rollup: 99.5% uptime/month | Contract template + SLA sheet in `/governance/` | 2 |
| Multi-region readiness assessed | Plan for US/EU region expansion (Y2) documented; geo-redundancy design | Design doc in `/governance/multi-region-roadmap.md` | 1 |
| DR drill done | Disaster recovery drill executed; failover from primary to backup verified | DR drill report: date, duration, RTO/RPO achieved | 1 |
| Backup verified | Database backups tested; restore time measured | Restore test log: backup → restored DB; time logged | 1 |
| Failover tested | Failover from primary to secondary infrastructure tested (Y2 when secondary exists) | Failover test log + rollback verification (Y1: N/A, document plan) | 1 |
| **I TOTAL** | | | **6** |

---

### Pillar J: Enterprise Governance (4 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| Board-readable metrics dashboard | CEO-facing dashboard: ARR, MRR, active customers, NPS, Phase Gate progress | Grafana dashboard + monthly email to CEO | 1 |
| Customer audit response template | Template for responding to customer security audits (SOC 2, ISO, penetration test requests) | Template in `/governance/audit-response.md` | 1 |
| SLA credit policy | If uptime <99.5%, customer receives credit (e.g., 10% of monthly fee per 0.1% breach) | Policy in `/governance/sla-credits.md`; integrated into billing | 1 |
| Incident customer-comms template | Template for notifying affected customers of incidents | Template in `/governance/incident-comms.md` + example | 1 |
| **J TOTAL** | | | **4** |

---

### QOrium-Specific Pillars (+12 points)

| Item | Criteria | Evidence | Points |
|---|---|---|---|
| **IRT Calibration Coverage ≥80%** | ≥80% of released items have N≥30 responses + IRT b/a parameters computed | Database query: `SELECT COUNT(*) WHERE status='released' AND irt_difficulty IS NOT NULL` ≥80% of total released | 2 |
| **AI Plagiarism Benchmark ≥93%** | Public benchmark (Adaface, Hired, similar): AI-generated questions undetectable as synthetic; plagiarism check via semantic similarity <0.75 | Public plagiarism detection audit; ≥93% pass rate vs. known leaked corpus | 1 |
| **24h Anti-Leak Rotation Operational** | Daily crawl of GeeksforGeeks, LeetCode, GitHub, Reddit for leaked QOrium questions; auto-rotation workflow active (SO-9) | N8N workflow logs: last crawl within 24 hours; >0 questions scanned | 1 |
| **Per-Client Variants Delivered** | Stack-Vault questions watermarked + per-customer variants generated correctly | Query: Stack-Vault customer receives Q#42 variant A; competitor receives variant B; identical content, different variables | 1 |
| **ATS Connector Smoke Test Pass** | HackerRank, Mettl, Taleo integration endpoints return 200 (if M9+ roadmap) | M9 prerequisite: API call to GET /connectors/hackerrank/export returns valid batch | 1 |
| **Reference Panel Diversity Check** | Panel composition: 60% India, 30% APAC, 10% global; gender ≥40% underrep; no single role >50% | Panel audit report: diversity breakdown per quarterly audit | 1 |
| **Bias DIF Audit Fresh** | Differential Item Functioning (DIF) analysis performed within last 30 days; no items with effect size >1.0 | DIF audit report dated within 30 days; all items pass | 1 |
| **Question Quality QA 8-Item Checklist** | Every released batch passes 8-item checklist (format, clarity, correctness, bias, uniqueness, leak, calibration, metadata) | QA report: batch ID, date, all 8 items ✓; saved in `/governance/qa-batches/` | 1 |
| **Pricing-Anchor Compliance** | All SKU pricing bands comply with SO-23 anchor: ReadyBank $5K–25K/year; JD-Forge $199–$499/JD; Stack-Vault $25K–$250K/year | Pricing table in `/governance/pricing.md` + contract review | 1 |
| **No-Fiction Rule Audit** | Every external claim (marketing, customer-facing metrics, competitive positioning) sourced (SO-24) | Claims audit doc: claim → source link; 100% sourced | 1 |
| **IO-Psych Contractor Sign-off** | I/O Psychologist contractor certifies: calibration rigor, bias analysis, Reference Panel quality | Sign-off email + contractor name in audit report | 1 |
| **Phase Gate Prerequisites Met** | All Phase Gate prerequisites from Constitution Article IX met (M1 CZ launch, M3 5K questions, M6 platform feature complete) | Phase Gate readiness checklist completed + CEO approval | 1 |
| **QORIUM-SPECIFIC TOTAL** | | | **+12** |

---

## Scoring Summary

```
A  =  10   (Build Quality)
B  =  10   (Security)
C  =  10   (Monitoring)
D  =  10   (Compliance)
E  =  10   (Performance)
F  =   8   (AI Stack)
G  =   6   (Enterprise Security)
H  =   6   (Enterprise Ops)
I  =   6   (Enterprise Reliability)
J  =   4   (Enterprise Governance)
━━━━━━━━━━━
    80 (Foundation)
    +12 (QOrium-Specific)
────────────────
    92 TOTAL
```

**PASS if ≥88/92 (96%)**

---

## Auto-Fail Criteria (6 Items — Any ONE Blocks Release)

The following 6 conditions **automatically fail** the gate regardless of other scores:

1. **IRT calibration not active on a released item** — If any question marked `status='released'` is missing `irt_difficulty` or `irt_discrimination`, FAIL
2. **24-hour anti-leak rotation breached** — If last N8N crawl was >24h ago, FAIL
3. **AI plagiarism <90% public benchmark** — If semantic similarity check shows >10% of AI questions match known leaked corpus, FAIL
4. **ATS connector regression on critical path** (M9+) — If HackerRank export endpoint returns error, FAIL
5. **IO-Psych validation pathway violated** — If a released item bypassed SME review (mandatory for ReadyBank per Constitution §2.3), FAIL
6. **No-Fiction Rule violated** — If an external claim (marketing, case study metric) has zero source attribution, FAIL

**Rule:** If ANY of these 6 are true, **RELEASE IS BLOCKED**. Remediate and re-attempt gate.

---

## Gatekeeper Ownership & Two-Person Sign-Off

**Gatekeeper (until M9 dedicated SecOps hire):** CTO Office  
**Secondary reviewer:** CDO (for compliance + AI-stack items) or CEO (for final approval)

**Sign-off requirement:** Both Gatekeeper AND one secondary reviewer must electronically sign off on the completed scorecard before production cutover.

**Signature method:** Email approval (captured in audit log) + name in scorecard footer.

---

## Failure Handling

- **Any auto-fail:** Release is **BLOCKED**. Remediate and re-run gate.
- **Any pillar <60%:** Remediation queued; CTO Office determines if critical (blocks release) or deferrable (fix in next sprint).
- **Non-critical Pillar G/H/I <70% (pre-Y2 waiver):** CTO Office may waive (documented + CEO approval) if enterprise customers not yet onboarded. Once customers live, all pillars mandatory.

---

## Execution

**Run cadence:** Every customer-facing release (typically weekly M1–M3, then bi-weekly)

**Submission:** Completed scorecard saved to `/governance/quality-gate-runs/YYYY-MM-DD-release-X.md` with:
- Timestamp (release date + time UTC)
- Engineer/Gatekeeper sign-off (name + email)
- Evidence links (per each item above)
- Final score + PASS/FAIL verdict
- Any waivers or notes

**Reference:** This scorecard is the executable form of Constitution Article VII Quality Gate. All production releases must complete this form.

---

## Drafting Notes (For CTO Office)

1. **Pillar weights:** Weights (10 for security, 10 for compliance, etc.) are provisional until CEO ratification in M1. Adjust per CEO feedback.

2. **Specific p95 latency targets:** Once Talpro live (DC/customer data available), measure actual p95 latency and adjust target upward/downward. Default 200ms is conservative.

3. **DIF library choice:** I/O Psych contractor selects Mantel-Haenszel vs. IRT logistic regression by Month 4. Store decision + rationale in `/governance/dif-methodology.md`.

---

*End of Quality Gate 92-Point Scorecard. Effective May 2, 2026. First release gate: J2 (Phase 1 first-pass) at M2 end.*
