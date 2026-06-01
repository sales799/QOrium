# CODEX PENDING — QOrium Trust Shell (T1 + T2 + T3 + T5)

**Queued by:** CTO (Claude, Super Brain). **Executor:** Codex ARJUN (marketing lane) — primary; BHIMA only for the live data feeds in T3 (honesty status table) and T5 (IRT calibration stats).
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-01
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2.3 rows T1, T2, T3, T5 (all 🔴 P0).
**Companion specs (read first):** `MARKETING_REDESIGN_360_v1.md` §7 (Phase 3 trust shell blueprint), `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` (already live; T3 must surface it), `governance/Quality-Gate-92pt-Scorecard.md` (T5 evidence), `infra/SSO-SAML-Enterprise-Spec-v0.md` + `infra/Audit-Log-API-Spec-v0.md` (T1 surface area), Rakshak GO 88/100 17/17 result for qorium.online (T1 evidence), Rakshak DPDP 92/100 (T2 evidence).
**Honesty hard-rule:** the trust shell IS the honesty doctrine made navigable. Every claim cites a source. Every "Shipped" item must be flag-verified live. Every "Beta" item must have a real flag + date. Every "Roadmap" item must have an owner + quarter. CI lint rejects pages missing any of these.

## What this ships

Four trust-shell destinations in QOrium's dark-shell (A-mode) visual zone:

| Page | Path | What it does | Wedge |
|---|---|---|---|
| T1 | `/trust` + `/security` | Vanta/Drata-style trust center: posture, controls, sub-processors, certifications, security architecture | Table stakes for enterprise |
| T2 | `/compliance-dpdp` | DPDP-Act-mapped controls, India-first compliance | **Pure white space** — no competitor has DPDP-led posture page |
| T3 | `/responsible-ai` | Shipped / Beta / Roadmap honesty table — what's actually live vs in-development | **Doctrinal wedge** — competitors hide; we publish |
| T5 | `/science` + `/method` | IRT methodology, validity research, bias testing, Quality Gate scorecard, AI plagiarism benchmark | CodeSignal-pattern; matches our 94% AI-plagiarism live result |

## Architecture (ARJUN)

### Shared shell

- Dark-shell tokens per `MARKETING_REDESIGN_360_v1.md` §0.1 — A-mode (trust infrastructure).
- All four pages share a `<TrustShellLayout>` with: side-rail TOC, breadcrumb, evidence-citation footer pattern (every page lists its sources as numbered references).
- Header pinned mega-menu entry "Why QOrium" → Trust / Security / DPDP / Responsible AI / Science / Method (per §5).
- Footer mega-sitemap entry under "Trust & Method."

### Component primitives (shared by all four pages)

- `<EvidenceCard kind="shipped|beta|roadmap" flag="..." date="..." owner="...">` — shipped variant verifies flag-source at render time; rejects build if flag missing.
- `<ControlRow control="..." status="implemented|in-progress|planned" evidence="..." last_verified="...">` — for T1/T2 control matrices.
- `<CitationStrip sources={[{label, url, accessed_at}]} />` — mandatory footer on every page.
- `<ComplianceBadge framework="DPDP|ISO27001|SOC2|GDPR" status="certified|in-progress|self-attested" evidence="..." />` — strict — `certified` ONLY renders if a cert URL is present.

### T1 — `/trust` + `/security`

- `/trust` = entry hub. Hero: "Built for Indian enterprise trust. We show our work." Sub-pages linked.
- `/security` = technical depth. Sections:
  - Architecture diagram (atomic-release VPS, isolated PM2 namespaces, RLS-where-applicable, secrets via env-rotation calendar).
  - Encryption — at rest + in transit (TLS 1.3, AES-256, rotated quarterly per `infra/B6-Secret-Rotation-Calendar.md`).
  - Identity — SSO (SAML/OIDC) via `infra/SSO-SAML-Enterprise-Spec-v0.md` (mark as Beta until shipped; date target).
  - Audit log — `infra/Audit-Log-API-Spec-v0.md` (Beta).
  - Sub-processors — published list with last-reviewed date.
  - Vulnerability disclosure — security@qorium.online + 90-day disclosure policy.
  - Posture evidence — link to Rakshak result (qorium.online GO 88/100 17/17, 2026-05-31 dated).
- Page MUST include a "what we don't have yet" honest section (ISO 27001 in-progress, SOC 2 deferred, etc.) — per doctrine.

### T2 — `/compliance-dpdp`

- The **wedge page**. India-first. Hero: "We were built after the DPDP Act. Most competitors weren't."
- Map every applicable DPDP control to QOrium implementation with evidence and last-verified date. Use `<ControlRow>` matrix.
- Topics: lawful basis & consent, purpose limitation, data minimization, accuracy, storage limitation, security safeguards, accountability, data principal rights (access/correction/erasure/grievance), Data Protection Officer contact, breach notification timelines, cross-border transfer posture (default: India residency), significant data fiduciary readiness.
- Evidence anchor: Rakshak DPDP 92/100 result. Surface the score with citation + date.
- Downloadable: DPDP DPIA template (gated, lead capture) — content from existing governance docs.
- Compare-callout (subtle, not competitor-bashing): a single line ("most legacy assessment platforms were built before DPDP; their compliance is retrofit") with cite-source disclaimer.

### T3 — `/responsible-ai`

- The **doctrinal flagship**. Hero: "Honesty is our differentiator. Here's what's shipped, what's in beta, and what's on the roadmap. Date-stamped."
- Live honesty table — data sourced via `/api/v1/responsible-ai/status` (BHIMA must build this — see below). Columns:
  - Capability | Status (Shipped/Beta/Roadmap) | Flag/version | Live as of | Owner | Evidence link.
- Mandatory rows (extend as needed):
  - AI item-generation grading (M4 — Shipped).
  - JD-Forge skill extraction (M13 — Shipped).
  - IRT calibration (Shipped).
  - Anti-leak crawler (Beta — mock provider until Serper key, surface honestly).
  - AI Interviewer (Roadmap — Q3 2026 target if/when committed).
  - AI Phone Screens (Roadmap).
  - Bias-audit report (Roadmap — Q4 2026 commitment after auditor selection).
- Sections beyond the table:
  - How our AI is trained / what it's NOT trained on (no candidate-PII training, no scraped-test-bank training — explicit).
  - Human-in-the-loop policy — SME review on every authored item (cite Content Engine 7-stage).
  - Plagiarism + leakage posture (cite the live 94% benchmark page — already live).
  - Refusals — what our AI will not do (grade candidates without rubric, generate items without SME review, etc.).
  - Auditability — every grade is reproducible from `{ rubric_version, model_version, prompt_hash, input_hash }`.
  - Contact for AI concerns — explicit email + response SLA.

### T5 — `/science` + `/method`

- `/science` = methodology depth. Sections:
  - IRT framework — 1PL/2PL/3PL choice + why; reference items, ability estimation, exposure control.
  - Validity research — content validity (SME pipeline), construct validity (correlation studies — gated/honest), criterion validity (post-hire performance — gated until data exists).
  - Reliability — Cronbach's alpha targets, test-retest design.
  - Bias testing — DIF (Differential Item Functioning) framework, what we test for, what we report.
  - Quality Gate scorecard (cite `governance/Quality-Gate-92pt-Scorecard.md`) — published thresholds.
- `/method` = SME pipeline depth. The 7-stage Content Engine made navigable:
  - Stage 1 ideation → Stage 7 calibration. Each stage = card with criteria + reviewer + artifact.
  - Live counts (sourced from BHIMA `/api/v1/content/pipeline-stats`): items in-pipeline, items past calibration, average days-in-stage.
- AI plagiarism benchmark — surface the live 94% result prominently with methodology link.

## BHIMA-owned API endpoints for T3 + T5 data feeds

```
GET /v1/responsible-ai/status      → { capabilities: [{name, status, flag, liveAsOf, owner, evidenceUrl}] }
GET /v1/content/pipeline-stats     → { stage1: n, ..., stage7: n, calibrated: n, avgDaysInStage: {...} }
GET /v1/science/quality-gate       → { latestRun: {score, total, date, evidenceUrl} }
GET /v1/science/plagiarism-bench   → { latestBench: {score, methodology, date, comparisons: [...]} }
```

- Public read, no auth. Cached 5min edge. Standard `{ ok, data, error }` envelope per API-Doc-v0.
- Status values driven by REAL feature flags / DB queries — NOT static JSON. CI smoke test verifies the endpoints return live data.

## Telemetry

- Events: `trust_page_view`, `trust_evidence_clicked` (cite-link click — measures buyer-seriousness), `trust_demo_cta_click`, `dpia_download_attempt`, `responsible_ai_status_table_expand`.
- Funnel: trust-page view → demo CTA click (this funnel proves the shell sells).

## Exit criteria

1. All four destinations live (T1 + T2 + T3 + T5 — 7 URLs counting hubs + depth pages: `/trust /security /compliance-dpdp /responsible-ai /science /method` + planned `/anti-leak` and `/authoring` already in Lane B Phase 3 scope, not re-counted here).
2. BHIMA endpoints live; T3 table refreshes from real flag-source on page load.
3. Citation lint passes — no page deployed without `<CitationStrip>` and ≥ 1 cited source.
4. Honesty lint passes — every "Shipped" `<EvidenceCard>` resolves its flag at build time; build fails otherwise.
5. Compliance-badge lint — no `certified` badge renders without cert URL.
6. Rakshak run on qorium.online ≥ 88/100 17/17 (no regression). T1 + T2 specifically lift the compliance + transparency sub-scores.
7. WCAG 2.1 AA + CWV green on a random sample of 4 pages.
8. SEO: each trust page has JSON-LD (`AboutPage` for /trust, `TechArticle` for /science, `WebPage` w/ ItemList for /responsible-ai). Sitemap updated.
9. CEO sign-off on T3 mandatory rows + T2 DPDP claims (legal-adjacent — final review). All other content auto-publishes.

## Coordination

- ARJUN owns: layout, components, all four pages, citation system, telemetry, design tokens, lead-capture for DPIA download.
- BHIMA owns: the four `/v1/...` endpoints, flag-source plumbing, pipeline-stats query, live data smoke tests.
- Joint review: `/responsible-ai` honesty table content — both lanes + CEO.

## Parallel-work guard

`gh pr list --state all --search "trust"`. Lock `project-lock:qorium-trust-shell` while mutating components or page content.

## Open input (non-blocking)

- CEO: confirm target dates for AI Interviewer (C4) and bias-audit report — needed for honest Roadmap row in T3. Default: leave date blank with "in evaluation" status — but blank dates weaken the honesty story.
- CEO: confirm sub-processor list for `/security`. Default: anthropic, openai, cockroach cloud, hetzner/vps provider, sendgrid (or whatever exists). BHIMA verifies actual deployed dependencies.
- CEO: ISO 27001 auditor selection — required to flip the ISO badge from `in-progress` to `certified` eventually. Tracked as CEO Pending item §3 of parent audit.
