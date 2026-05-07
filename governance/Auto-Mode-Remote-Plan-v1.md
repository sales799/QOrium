# QOrium — Auto-Mode Remote Completion Plan v1

**Owner:** CTO Office (autonomous agent)
**Mode:** No-human-in-the-loop · CTO-owned · CTO-governed · remote-only
**Anchor:** `task_plan_phase0_phase1.md` + `_QORIUM_BUILD_LOG.md` + Live Progress Dashboard (Run #32, 2026-05-06)
**Branch of record:** `claude/plan-cto-dashboard-automation-vgyKs`
**Filed:** 2026-05-07
**Supersedes:** none (first issue)

---

## 1. Honest framing of "Dashboard 100%"

The Live Progress Dashboard's master meter terminates at **Constitution Article IX Project Completion** — defined as a strategic acquisition ≥$300M, an IPO ≥₹3,000Cr, or Talpro Universe Anchor with ≥$50M ARR. No remote agent can ship those outcomes; they require sales motion, human relationships, regulatory filings, and multi-year market execution.

This plan therefore partitions the dashboard into two meters:

| Meter | Definition | Owner |
|---|---|---|
| **Auto-Mode meter** | Every tile whose evidence-of-done is a commit on `main` (code · spec · content authored under 92-pt gate · governance doc · CI artifact) | CTO Office (agent) |
| **Human-Bound meter** | Every tile whose evidence-of-done is a human action (signed logo · hire · panel recruitment · IP filing · M&A · CEO sign-off) | CEO + named humans |

**Auto-Mode meter target: 100%.** Achievable, this plan executes against it.
**Human-Bound meter target: surfaced, never claimed.** The agent annotates "ready for human" when the engineering predicate is met; never marks it done.
**Master meter ceiling under pure auto-mode: ~78%.** The remaining ~22% rises only as the human lane closes.

A claim of "Dashboard 100%" that conflates the two is a misrepresentation and is forbidden under SO-9 / Article VII.

---

## 2. State delta (from Run #32 dashboard, 2026-05-06)

| Tile | Dashboard says | Repo says | Action |
|---|---|---|---|
| Surface 6 — JWT recruiter auth | Spec ready · merge next | Already on `main` (PR #12 · `29ff865`) | Reconcile |
| Sprint 1.6 (5 tracks) | Cowork-shipped · awaiting Stream B | All 5 merged (PR #13 · `87b08b5`) | Reconcile |
| Web Application | 5/6 LIVE | 6/6 once dashboard reflects PR #12 | Reconcile |
| Question Library | 811 Qs · 16.2% of 5K | 358 parsable + 52 case-study parse misses + Wave-3 v0.1 = 430+ available; 811 count includes Cowork-only docs not in Stream B | Bridge sync |
| Sprint 1.7 | Pending | Spec stubs in `infra/` | Build |
| Phase 1 | 35% | 65% post-reconcile estimate | Ratchet |

**Single most important finding:** the live dashboard is reading `QORIUM-MISSION-CONTROL.md` and `IMPLEMENTATION-PROGRESS-TRACKER.md` snapshots that pre-date Stream B's PR-#12 and PR-#13 merges. A reconcile PR alone lifts the master meter ~5–8 points without writing a single line of feature code.

---

## 3. Auto-Mode Charter — stop conditions

The agent **halts and writes to `governance/QUEUE.md`** on any of:

1. Constitutional touch (Articles I, IV, VII, IX) — requires CEO+CTO Council per v2.0 §11
2. Any monetary commitment (purchase, subscription, paid API tier) — agent owns no purse
3. Any outbound message (email, Slack, WhatsApp, SMS, GitHub mention to humans outside the bot perimeter)
4. Any production-credential operation without prior cred-drop in `.env.bootstrap`
5. IRT auto-fail per SO-21
6. Anti-leak detection per SO-9
7. 92-pt Gatekeeper score < 88
8. Any CTO-DELTA whose magnitude exceeds the rubric in `infra/CTO-deltas/CTO-DELTA-template.md`
9. Migration that drops a column or table on a release-tagged schema

The agent **proceeds without prompting** on:

- Code commits within established service/package boundaries
- Spec authoring (markdown under `infra/`, `governance/`, `customer-zero/`)
- Content authoring under 92-pt gate (≥88) with IRT-safe parameters
- Test additions, refactors, dependency bumps under semver-minor
- Documentation, runbook, and dashboard-JSON updates
- CI/Make target additions

Bridge Protocol with Cowork preserved: every PR title carries the run number; reconcile PR each Friday close.

---

## 4. Sprint sequence

Each sprint = one PR, draft, branch-protected, CI-green, Gatekeeper ≥88, gitleaks clean. Each merge appends to `_QORIUM_BUILD_LOG.md` and bumps `governance/dashboard.json`.

### Phase A — Reconcile + Foundation

#### Sprint 1.6.5 — Reconcile + Dashboard JSON contract
- Update `QORIUM-MISSION-CONTROL.md` and `IMPLEMENTATION-PROGRESS-TRACKER.md` to reflect Stream B merges of PR #12 (`29ff865`) and PR #13 (`87b08b5`)
- Promote Surface 6 → LIVE
- Mark Sprint 1.6 → CLOSED both streams
- Introduce `governance/dashboard.json` as canonical source — both streams write only to this file; HTML reads only from it; eliminates drift class
- Schema: `{ lastRefresh, masterMeter, lanes: { auto, human }, phases[], sprints[], surfaces[], waves[], runs[] }`
- This document (`governance/Auto-Mode-Remote-Plan-v1.md`) committed alongside

**Done-when:** dashboard.json renders identically to the HTML; both streams agree on Sprint 1.6 closure; PR #12/#13 reflected in run history.

### Phase B — Sprint 1.7 (auto-eligible slice)

#### Sprint 1.7a — SAML/SSO v1 spec
- Extends `infra/SSO-SAML-Enterprise-Spec-v0.md` to v1 with: IdP-init + SP-init flows, JIT provisioning, SCIM 2.0 hooks, key rotation cadence, sample IdP configs (Okta, Azure AD, Google Workspace)
- No production code yet — spec gates implementation in Sprint 3.x

#### Sprint 1.7b — NSDC/NOS competency mapper
- `packages/nos-mapper` — translates QOrium skills ↔ NSQF levels + NOS codes
- Reference data `governance/data/nsqf-mapping.json` (NSDC public taxonomy)
- Unit tests covering every Wave-1 + Wave-2 sub-skill mapped end-to-end

#### Sprint 1.7c — Bloom's taxonomy tagging
- Migration `0006_bloom_tags.sql` — adds `bloom_level` (Remember/Understand/Apply/Analyze/Evaluate/Create) and `bloom_dimension` (Factual/Conceptual/Procedural/Metacognitive) to `content.questions`
- Heuristic backfill script + SME review queue surfaces (admin app)
- Competitive-defense vs Artifactum (per dashboard note)

#### Sprint 1.7d — Email-auth IaC (halts on cred-drop)
- `infra/auto-bootstrap/email-auth.tf` — Terraform for SES domain identity, DKIM CNAME records, SPF + DMARC TXT records
- CI runs `terraform plan` (green = ready); `terraform apply` blocked behind `BOOTSTRAP_AUTHORIZED=true` env
- Halts on cred-drop; documents the exact human action required

#### Sprint 1.7e — Ingest parser fix
- Extend `services/readybank/src/scripts/ingest-wave1.ts` to recognise `**solution:**` and `**reference_solution:**` synonyms
- Closes the 52 case-study parse misses surfaced in PR #13
- Brings ingest from 358 → ~410 questions live-loadable

**Sprint 1.7 done-when:** all 5 sub-PRs merged; library count on `main` reflects new ceiling; Phase 1 meter at ~85%.

### Phase C — Phase 1 closeout

#### Sprint 1.8a — IRT calibration pipeline (production-grade)
- `packages/irt` — 2PL fit (a, b parameters), MLE/EAP estimators
- ETL job `services/readybank/src/jobs/irt-calibrate.ts` reading `content.responses`
- SO-21 enforcement wired into Gatekeeper job
- Replaces the Run #24 `irt-calibration-batch.mjs` prototype with a typed, tested package

#### Sprint 1.8b — Reference-panel ingestion API
- `POST /v1/reference-panel/responses` — public, token-gated endpoint to receive panel responses
- `app.reference_panel_tokens` table (migration `0007`)
- Panel recruitment itself is human-bound — but the receiver is code

#### Sprint 1.8c — Anti-Leak Engine v0 productionized
- Promote `anti-leak-scan.mjs` (Run #24) to `services/anti-leak/` PM2 process
- Per `infra/Anti-Leak-Engine-v0-Design.md` — Serper.dev + secondary scraping fallback
- 24-hour rotation queue per SO-9
- Detection events → `audit.events`; SLA tracker in admin

#### Sprint 1.8d — Admin console (Next.js)
- `apps/admin` — JWT auth re-using `@qorium/auth`
- SME review queue against `content.questions WHERE status IN ('draft','sme_review')`
- Calibration panel showing IRT params + outliers
- Bloom's tag review surface
- Anti-leak detection inbox

**Sprint 1.8 done-when:** Phase 1 meter at 100% on engineering criteria (G1–G10 + J1–J4); only human-bound items remain (first Talpro candidate, Reference Panel ≥200, I/O Psych sign-off, 5 logos).

### Phase D — Phase 2 India Stack (engineering-only)

#### Sprint 2.0 — Wave-2 extension to depth
- Each Wave-2 domain extended to ≥100 Qs under 92-pt gate
- SAP-ABAP 70 → 120 · Oracle HCM 60 → 100 · Salesforce CPQ 60 → 100 · Finacle/Flexcube 60 → 100 · Embedded Auto 60 → 100
- Total Wave-2 311 → 520

#### Sprint 2.1 — Wave-1 extension to depth
- Each Wave-1 sub-skill 60 → 100 Qs
- Total Wave-1 480 → 800

#### Sprint 2.2 — INR pricing + GST
- Billing scaffold per `infra/Billing-Service-v0-Spec.md` with INR + USD support
- GST handling for Indian invoices (CGST/SGST/IGST)
- HSN codes for SaaS classification

#### Sprint 2.3 — i18n framework
- i18n keys extracted across recruiter SPA, candidate take flow, results page
- Hindi + Tamil + Telugu translation files seeded with English fallbacks
- Translation review queue in admin (translations themselves are human-reviewed; agent does not auto-translate user-facing copy)

**Phase 2 done-when:** library at 1,320+ across Waves 1+2; localization framework in repo; billing scaffold green; Phase 2 meter on engineering criteria at 100%.

### Phase E — Phase 3 SKU Maturity

#### Sprint 3.0 — JD-Forge service alpha
- `services/jd-forge/` on PM2 port 5102 per `infra/JD-Forge-v0-Design.md`
- 30-second SLA Standard tier; 4-hour Reviewed tier with SME queue handoff
- Multi-model fan-out (Claude → GPT → Gemini) with fallback table

#### Sprint 3.1 — JD-Forge beta
- Subscription tiers ($499 / $1,999 / $9,999/mo) per Constitution §1.2
- Per-JD billing ($49 / $199 / $499)
- Stripe integration (cred-bound; halts on apply)

#### Sprint 3.2 — Stack-Vault tenant isolation
- Customer-exclusive namespace per `app.tenants.tier='stack_vault'`
- Watermark hardening: per-tenant pepper + double watermark (question + tenant)
- Contractual exclusivity flag enforced at retrieval time

#### Sprint 3.3 — SAML/SSO implementation
- Per Sprint 1.7a spec
- IdP test harness with Okta dev tenant (cred-bound; halts on apply)

**Phase 3 done-when:** all 3 SKUs have working code paths; Stack-Vault tenant isolation tested; SAML/SSO implementation green in CI; revenue tiles remain human-bound.

### Phase F — Phase 4 Year-1 Close (engineering scaffolds)

#### Sprint 4.0 — Observability stack IaC
- OpenTelemetry collector + Grafana Cloud + Sentry per `infra/auto-bootstrap/observability.tf`
- Halts on cred-drop

#### Sprint 4.1 — PITR + backup automation
- Postgres WAL archive to R2; nightly base backup
- Restore-runbook automated test (CI weekly)

#### Sprint 4.2 — ATS connector framework
- Per `infra/ATS-Connector-Framework-v0.md`
- First connector: Lever (open API; OSS fixtures)

#### Sprint 4.3 — Webhooks service
- Per `infra/Webhooks-Service-v0-Spec.md`
- Per-tenant signing keys, replay protection, dead-letter queue

#### Sprint 4.4 — Audit Log API
- Per `infra/Audit-Log-API-Spec-v0.md`
- Read-only externalisation of `audit.events`

### Phase G — Phases 5–7 (engineering-reachable scaffolds)

#### Sprint 5.0 — Multi-region terraform skeleton (DR pair)
- ap-south-1 primary + ap-southeast-1 DR
- RPO 15min · RTO 1h targets per `infra/B1-VPS-Capacity-and-Topology-Plan.md`

#### Sprint 5.1 — SOC2-readiness audit harness
- Control mapping in `governance/soc2/`
- Evidence-collection automation (CI + cron)

#### Sprint 6.0 — Multi-region deploy automation
- Halts on cred-drop

#### Sprint 7.0 — Outcome instrumentation
- ARR + DAU + content-throughput metrics dashboards (data only — business outcomes are human)

**Phase 5–7 cap:** engineering scaffolds reach 100%; revenue/M&A tiles remain human-bound and surface as such on the dashboard.

---

## 5. Governance loop

| When | What | Where |
|---|---|---|
| Each merge | Append dated section | `_QORIUM_BUILD_LOG.md` |
| Each merge | Bump dashboard JSON | `governance/dashboard.json` |
| Each PR | Subscribe PR activity | GitHub MCP `subscribe_pr_activity` |
| Each Friday | Cowork-Bridge reconcile PR | per `governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md` |
| Each halt | Append entry | `governance/QUEUE.md` (one line: timestamp, reason, predicate, suggested human action) |
| Each sprint | Open draft PR | branch `claude/sprint-X.Y-<slug>` |
| Daily 08:00 IST | Dashboard refresh | reads `governance/dashboard.json` |

CI mandatory checks: `lint`, `typecheck`, `test`, `secret-scan`, `build`, `92pt-gatekeeper`, `gitleaks`.

---

## 6. Dashboard JSON contract (proposed schema)

```json
{
  "$schema": "./dashboard.schema.json",
  "lastRefresh": "ISO-8601 timestamp",
  "masterMeter": {
    "auto": 0.0,
    "human": 0.0,
    "total": 0.0,
    "autoCeiling": 0.78
  },
  "lanes": {
    "auto": { "completed": 0, "total": 0, "tiles": [] },
    "human": { "completed": 0, "total": 0, "tiles": [] }
  },
  "phases": [
    { "id": "0", "name": "Foundation", "percent": 100, "auto_eligible": true, "status": "complete" }
  ],
  "sprints": [
    { "id": "1.0", "name": "...", "status": "complete", "doneWhen": [], "evidence": [] }
  ],
  "surfaces": [
    { "id": 1, "name": "ReadyBank API", "status": "live", "url": "https://api.qorium.online/healthz" }
  ],
  "waves": [
    { "id": 1, "name": "Tech Core", "count": 480, "target": 800, "quality": "v0.6" }
  ],
  "runs": [
    { "id": 32, "date": "2026-05-04", "summary": "..." }
  ]
}
```

Each tile carries `auto_eligible: true|false`. Auto-mode never updates `auto_eligible: false` tiles to `complete` — only humans can.

---

## 7. Done-when summary

| Meter | Definition | Reachable by | Target date |
|---|---|---|---|
| Auto-Mode 100% | Every `auto_eligible: true` tile complete; library ≥1,320; all SKU code paths working; observability + DR + SOC2 harness shipped | Sprints 1.6.5 → 7.0 | T+90 days agent runtime |
| Human-Bound owner action | First Talpro candidate · Reference Panel ≥200 · I/O Psych sign-off · 5 logos · regulatory filings · M&A | CEO + named humans | unbounded |
| Master meter 100% | Auto-Mode 100% + Human-Bound 100% | Both lanes | unbounded |

This plan commits the agent to **Auto-Mode 100%**. The Human-Bound lane is surfaced honestly and handed back to the CEO at every dashboard refresh.

---

## 8. First moves on this plan

1. **Sprint 1.6.5 reconcile** — opens immediately on this branch
2. **Plan ratification** — this document committed; CEO can redirect by replying on the PR
3. **Sprint 1.7a–e** — opened in parallel as separate draft PRs once 1.6.5 merges

---

**Filed:** 2026-05-07
**Branch:** `claude/plan-cto-dashboard-automation-vgyKs`
**Reviewer:** CEO (Bhaskar Anand) — async, on PR
**Stop conditions:** §3 above
**Bridge with Cowork:** `governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md`

*The agent has the plan. The work continues.*
