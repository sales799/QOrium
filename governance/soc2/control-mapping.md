# SOC 2 Control Mapping (Sprint 5.1)

Maps SOC 2 Trust Services Criteria (TSC) to QOrium's implementing
controls. Each row shows the AICPA criterion + how QOrium operates it +
where the auditor finds evidence.

Acronyms: **CC** = Common Criteria · **SO** = Strategic Objective from
Constitution v2.0 · **PR** = pull request reference.

## CC1 — Control Environment

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC1.1 | Demonstrates commitment to integrity and ethical values | Constitution v2.0 Article VII (no misrepresentation); CTO-DELTA discipline | `governance/Auto-Mode-Remote-Plan-v1.md` + `infra/CTO-deltas/*.md` |
| CC1.2 | Board exercises oversight responsibility | CEO sign-off required for Articles I/IV/VII/IX changes | git history of constitution files; PRs with CEO ratification record |
| CC1.3 | Establishes structure, authority, and responsibility | Constitution §11 + governance/dashboard.json human-lane tiles | `governance/dashboard.json#lanes.human` |
| CC1.4 | Demonstrates commitment to competence | SME Content Lead hire (M2/I2); Senior Engineer #1 hire (M2/I1) | `governance/dashboard.json#lanes.human.tiles.sme-lead-hire` |
| CC1.5 | Enforces accountability | Per-PR Gatekeeper ≥88 score; `governance/QUEUE.md` halt log | CI history; `governance/QUEUE.md` |

## CC2 — Communication and Information

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC2.1 | Internal information meets needs to support functioning of internal control | `_QORIUM_BUILD_LOG.md` + `governance/dashboard.json` daily refresh | `dashboard.json#runs[]` |
| CC2.2 | Internally communicates information necessary to support internal control | `governance/operating-rituals.md` (cadence) + Sprint 4.4.3 hash-chain audit log | `audit.events WHERE event_type LIKE 'governance.%'` |
| CC2.3 | Communicates with external parties about matters affecting internal control | Customer audit-log API (Sprint 4.4); status.qorium.online | `/v1/audit/events` exports per tenant |

## CC3 — Risk Assessment

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC3.1 | Specifies suitable objectives | Constitution Article IX phase gates (M3/M6/M9/Y1/Y2) | constitution doc |
| CC3.2 | Identifies, analyzes, and responds to risks | `infra/CTO-deltas/*.md` (CTO-DELTA-template); `governance/QUEUE.md` halt entries | folder listings + queue file |
| CC3.3 | Considers potential for fraud | SO-9 anti-leak (Sprint 1.8c); SO-10 Stack-Vault tenant isolation; signing-secret rotation | `audit.events WHERE event_type LIKE 'leak.%' OR 'security.%'` |
| CC3.4 | Identifies and analyzes significant change | Migration discipline (`infra/B7-postgres-migrations/*.sql`); CTO-DELTA folder | git log `infra/B7-postgres-migrations/` |

## CC4 — Monitoring Activities

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC4.1 | Selects, develops, and performs ongoing/separate evaluations | Sprint 4.1 observability (Grafana + Sentry); 92-pt Gatekeeper per merge | CI artefacts; observability runbook |
| CC4.2 | Communicates internal-control deficiencies | `governance/QUEUE.md` (halt log); PR-level review comments | git log + GitHub PR comments |

## CC5 — Control Activities

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC5.1 | Selects and develops control activities | Sprint 1.2 API-key + rate-limit; Sprint 1.6 JWT cookie auth | `app.api_keys` history; `audit.events WHERE event_type='api_key.auth.success'` |
| CC5.2 | Selects and develops general controls over technology | Sprint 1.1 CI/CD pipeline; Sprint 4.2 PITR; Sprint 5.0 multi-region DR | `.github/workflows/ci.yml`; `infra/auto-bootstrap/*.tf` |
| CC5.3 | Deploys through policies and procedures | `governance/Auto-Mode-Remote-Plan-v1.md`; runbooks/* | folder listings |

## CC6 — Logical and Physical Access

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC6.1 | Implements logical access security software, infrastructure, and architectures | Sprint 1.2 HMAC-keyed API keys; Sprint 3.3 SAML/SSO; Sprint 1.6 8-hr JWT sliding window | `app.api_keys`, `app.tenant_sso_config` |
| CC6.2 | Restricts access through user identification and authentication | Recruiter cookie auth (Sprint 1.6); panel-token auth (Sprint 1.8b); api_key family enforcement (D3) | `audit.events WHERE event_type LIKE 'auth.%'` |
| CC6.3 | Manages role-based access | RBAC sub-roles via SAML claim mapping (Sprint 3.3); recruiter vs admin via `recruiterAuth` | JWT claim history |
| CC6.6 | Implements logical access controls for external users | Sprint 4.4 Audit Log API tenant scope (SCOPE_CLAUSE: `tenant_id = $1 OR (NULL AND actor_id = $2)`) | repository SQL |
| CC6.7 | Restricts transmission of sensitive information | TLS 1.3+ enforced (Sprint 4.5 webhook spec §9); HSTS via security-headers middleware | nginx config; security-headers.ts |
| CC6.8 | Detects/prevents unauthorized software installation | gitleaks pre-commit + CI; pnpm audit --prod | `.gitleaks.toml`; CI security-audit job |

## CC7 — System Operations

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC7.1 | Detects and responds to anomalies | Sprint 4.1 multi-burn-rate SLO alerts; Sprint 1.8c anti-leak engine | observability-runbook.md; `content.leak_alerts` |
| CC7.2 | Monitors system components | `governance/observability-runbook.md`; CloudWatch alarms (Sprint 5.0 multi-region composite alarm) | dashboard JSON |
| CC7.3 | Evaluates security events | Sprint 4.4.3 audit-log hash chain + `GET /v1/audit/verify`; SO-9 leak detection inbox | `/v1/audit/verify` per tenant |
| CC7.4 | Responds to identified security events | `governance/incident-response-runbook.md` (Sprint 1.1); `governance/dr-runbook.md` (Sprint 4.2) | runbook timestamps + git log |
| CC7.5 | Recovers from identified security incidents | Sprint 4.2 PITR (RPO 5min same-region); Sprint 5.0 DR cutover (RPO 15min cross-region) | dr-runbook.md + multi-region-runbook.md |

## CC8 — Change Management

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC8.1 | Authorizes, designs, develops, configures, documents, tests, approves, and implements changes | Branch convention `claude/sprint-X.Y-<slug>` + per-PR Gatekeeper ≥88 + 92-pt quality gate | git log + CI history |

## CC9 — Risk Mitigation

| TSC | Control description | QOrium implementation | Evidence query |
|---|---|---|---|
| CC9.1 | Identifies, selects, and develops risk mitigation activities | `governance/Auto-Mode-Remote-Plan-v1.md` §3 stop conditions | plan doc |
| CC9.2 | Vendor / third-party risk | Vendor-account-pattern (Magic UI Pro / Tailwind UI / etc.); per-vendor `vendorstalpro` separation | `governance/vendor-account-pattern.md` (sales799/MAYA repo) |

---

## Override log

_Append-only. Add a new section if any mapping changes._

(no overrides yet)
