# CODEX PENDING — QOrium Assessment Formats Wave-2 (F2 + F3 + F6 + F9)

**Queued by:** CTO (Claude, Super Brain). **Executor:** Codex BHIMA (backend lane) — primary; ARJUN only for the candidate-side surface chrome.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-02
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2 rows F2, F3, F6, F9 (all 🔴 P0).
**Companion specs (read first):** `infra/Judge0-Sandbox-v0.md` (F3 extends this), `BACKEND_MODULES_360_v1.md` M4 (grader contract — every format must emit grader-compatible payload), `MARKETING_REDESIGN_360_v1.md` §0.1 (evidence-gate doctrine for /library/{skill} stub fallback), Wave-2 content corpus (50+ Qs/format already authored per audit row F6 note), live qorium-leak-crawler service (anti-leak posture per format).
**Honesty hard-rule:** every format must publish a calibration status. Formats without ≥ N items past IRT gate render the candidate-facing card as `Authored — calibration in progress` with a sample-pack CTA, not as a fake-ready format tile. No format ships with a `Live` badge until M4 grader returns a deterministic `{score, rubric_version, model_version, prompt_hash, input_hash}` for that format.

## What this ships

Four assessment-format runtimes that match the Vervoe / HackerRank / Mercer Mettl wedge surface:

| Format | Path | Wedge | Live-by-target |
|---|---|---|---|
| F2 | `/assess/spreadsheet` | Vervoe parity (Spreadsheet/Document production) | Codex Wave-2 |
| F3 | `/assess/sql-sandbox` | HackerRank / Mercer Mettl / iMocha / CodeSignal parity (write+execute SQL) | Codex Wave-2 |
| F6 | `/assess/crm-erp-sim` | **India wedge — no competitor at depth** (SAP / Oracle / Salesforce / Finacle simulation) | Codex Wave-2 |
| F9 | `/assess/video-response` | Vervoe / HireVue / Mercer Mettl parity (async video) | Codex Wave-2 |

**Not in scope:** F1 codebase-level coding (P1 — separate shard), F4 Jupyter notebook (P1), F5 cloud sandbox (P1), F11 live IDE (P1), F13 AI pair coding (spec exists, F13 prototype shard).

## Shared architecture (BHIMA)

### Runtime contract — every format implements `IAssessmentRuntime`

```
POST /v1/assess/:format/session              → { sessionId, taskSpec, expiresAt }
POST /v1/assess/:format/submit               → { submissionId, status: "queued|grading|done" }
GET  /v1/assess/:format/result/:submissionId → { score, rubric_version, audit_meta, evidence[] }
GET  /v1/assess/:format/health               → standard envelope
```

- All sessions write to `assessment_sessions` (existing table). New column `format_runtime` (varchar) + `runtime_payload` (jsonb).
- All submissions write to `assessment_submissions` with `audit_meta` jsonb (rubric_version, model_version, prompt_hash, input_hash) — non-null enforced.
- Rate limit: 10 sessions/min/IP for previews, no limit for authenticated candidate sessions.
- Auth: session token issued via existing candidate-portal auth; preview sessions are public.

### Grading hook — every format emits M4-compatible payload

- M4 grader (`qorium-api` `M4-Grader-v0.md`) accepts `{ format, candidate_payload, rubric_id }`. Each runtime above MUST produce a candidate_payload matching the M4 contract.
- New rubric type per format. Rubrics versioned per `infra/Rubric-Versioning-v0.md` (if missing, create as part of F2 ship — first format to land owns the spec).

### Calibration gate

- Each format ships with a `calibration_status` enum: `irt-calibrated | beta | authored`. Driven by `irt_calibrations` table — count of items with `calibrated_at IS NOT NULL` per format.
- `/library/{skill}` and `/assess/{format}` pages MUST surface this status. No "Live" badge without `irt-calibrated` AND ≥ N candidates graded (N = 50 default; CEO-tunable).

## F2 — Spreadsheet / Document production (`/assess/spreadsheet`)

### Surface
- Embed an open-source spreadsheet editor (Univer.ai OR Luckysheet — BHIMA picks; log decision). Forbidden: Microsoft 365 / Google Sheets embeds (licensing + privacy).
- Candidate sees: prompt, starter workbook (xlsx), submit button. Auto-save every 30s to `submissions/spreadsheet/<id>/snapshot_<ts>.xlsx`.
- Time limit per task (X9-extend hook): default 45 min, configurable per task.

### Grading
- Deterministic evaluators run server-side: cell-value equality, formula-presence, named-range checks, pivot-table existence, conditional-format rules.
- LLM grader (Claude Sonnet 4.6) reviews freeform layout/labeling quality against rubric. Output deterministic via `temperature: 0` + fixed seed.
- Anti-cheat: paste-event detection in editor → flagged to X6 anti-cheat hook (NEW SPEC — Wave-2-B will define X6 properly; F2 ships the event emitter).

### Exit
- 5 reference tasks live (entry-level data entry, mid-level formulas, advanced pivot/lookup, financial-model, audit-trail).
- Calibration status visible on each task tile.
- Honesty CI: prompt without rubric → block.

## F3 — SQL Sandbox (`/assess/sql-sandbox`)

### Surface
- Extends `infra/Judge0-Sandbox-v0.md` — DO NOT introduce a second sandbox. Add PostgreSQL + MySQL + SQLite kernels.
- Per-candidate ephemeral DB instance, seeded from `task.seed_sql` at session start. Disposed at session end (TTL 90 min default).
- Read/write allowed within session schema; DROP DATABASE / CREATE ROLE blocked.

### Grading
- Deterministic: run candidate's final query, compare result-set to expected (set equality, no ordering unless task says so).
- Performance dimension: candidate query vs. reference query EXPLAIN ANALYZE comparison; rubric scores on rows-scanned + index-use + plan-shape.
- LLM grader scores SQL quality (readability, idioms) per rubric.
- Anti-cheat: paste-event detection; clipboard inspection (browser-only signal — best-effort).

### Exit
- 8 reference tasks: SELECT/JOIN basics, GROUP BY/HAVING, window functions, CTEs, INSERT/UPDATE/DELETE with transaction, schema design, query optimization, real-world reporting.
- Sandbox isolation verified (one candidate's DB unreachable from another's session — adversarial test in CI).

## F6 — CRM / ERP Simulation (`/assess/crm-erp-sim`)

### Wedge note
**This is the India enterprise wedge.** No competitor has SAP/Oracle/Salesforce/Finacle simulations at depth. Audit row F6 confirms Wave-2 content already has 50+ Qs per stack — surface them here.

### Surface
- Stacks (Wave-2 launch set): **SAP S/4HANA** (mock), **Oracle EBS** (mock), **Salesforce Sales Cloud** (mock), **Finacle Core Banking** (mock). Each is a custom SPA mimicking the real UI with stub data.
- Tasks are workflow-based: "create a sales order for customer X with these line items" / "post a GL journal for these entries" / "configure a workflow rule for this lead-routing".
- DO NOT embed real vendor SDKs. All UIs are open-source mocks under `apps/crm-erp-sim/{stack}/`.

### Grading
- Deterministic: workflow-state-machine assertions. At end of task, system snapshots in-memory state (orders/journals/configs) and diffs against expected golden state.
- LLM grader scores process correctness, error-recovery, business-judgment freeform questions.
- Audit-meta logs full action-trail per session for replay.

### Exit
- 4 stacks live. ≥ 12 reference tasks per stack (48 total).
- Calibration status per stack (most start `authored`; calibration over first 50 sessions).
- India enterprise CTAs on /solutions/stack/{sap,oracle-ebs,salesforce,finacle} pages (cross-link to S3 SEO shard).

## F9 — Video Response async (`/assess/video-response`)

### Surface
- Browser MediaRecorder API → MP4/WebM upload to S3-equivalent (Hetzner Object Storage OR Cloudflare R2 — BHIMA picks; log decision).
- Time limits: prep 30s, record 90s default (per-task overridable). Re-record allowed up to 3× (configurable).
- Transcription: Whisper (local on Mac Mini fleet via existing inference rig) OR OpenAI Whisper API (fallback). Per `model_selection_v3_nim_tier` doctrine — prefer local.

### Grading
- Transcript scored by Claude Sonnet 4.6 rubric grader (clarity, structure, content-completeness, persuasiveness).
- Audio-quality signals (volume, clarity) computed server-side; rubric optional.
- Video face-presence verification (X5 anti-cheat hook — basic, not full ID-verification).

### Exit
- CDN play-back latency p95 < 1.5s.
- Transcription accuracy ≥ 92% on internal benchmark (10 reference videos).
- Storage cost <  ₹0.50/candidate average (engineering target).
- Privacy: video deleted from S3 at retention TTL (default 90 days; DPDP-aligned; configurable per customer).

## Telemetry

- Events: `assess_session_started`, `assess_session_submitted`, `assess_session_abandoned`, `assess_paste_detected` (X6 hook), `assess_video_uploaded`, `assess_sql_query_executed`, `assess_workflow_step_completed`.
- Funnel: marketing-page → sample-pack unlock (I4) → assess preview-session → demo-CTA (proves the wedge sells).

## Exit criteria

**Per format:**
1. Runtime API live + smoke-tested.
2. Grading round-trip works (session → submit → score with full audit_meta).
3. Calibration status surface live (no "Live" without irt-calibrated).
4. ≥ N reference tasks (F2: 5, F3: 8, F6: 48, F9: 5 prompts × 3 difficulty levels).
5. WCAG 2.1 AA on candidate UI.
6. Rakshak run ≥ 88/100 17/17 on the qorium.online domain (no regression).

**Across all 4:**
7. Honesty lint passes — every task without a rubric blocks deploy.
8. Anti-cheat events (paste, focus-loss, video face-absence) emit to NIRANTAR for cross-session pattern detection.
9. /library/{skill} pages that reference these formats render correct calibration badges.
10. CEO sign-off on the F6 stack list (SAP / Oracle EBS / Salesforce / Finacle is the recommended launch set; CEO may swap one for Stack-Vault customer-zero stack).

## Coordination

- BHIMA owns: 4 runtime services, sandbox isolation, grading hooks, M4 wiring, calibration plumbing, storage + transcription.
- ARJUN owns: candidate-side chrome (`/assess/{format}` page shells), preview embed on `/library/{skill}`, telemetry events, the calibration-badge component (already shared with S1).
- Joint review: anti-cheat event taxonomy — both lanes + CEO sign-off (cheat-signal severity policy is a CEO call).

## Parallel-work guard

`gh pr list --state all --search "assess"`. Lock `project-lock:qorium-assess-formats-w2` while mutating runtime services.

## Open input (non-blocking)

- CEO: confirm the 4 F6 stacks. Default: SAP / Oracle EBS / Salesforce / Finacle.
- CEO: video-retention default (DPDP says reasonable + purpose-limited; 90 days is the working default).
- CEO: whether to ship F9 with Whisper-local or Whisper-API on day 1. Default: local first (cost + privacy), API fallback.
