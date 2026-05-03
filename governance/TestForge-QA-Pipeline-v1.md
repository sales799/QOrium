# QOrium TestForge QA Pipeline v1

**Status:** v1 — operational design integrating MANTHAN Stage 6c TestForge handoff with existing QA infrastructure components (Quality Gate scorecard, IRT calibration pipeline, Anti-Leak Engine, Judge0 sandbox, AI Plagiarism Benchmark, Bias Detection Methodology). Ready to operationalize once Mac Mini Docker setup completes (B7 prerequisite).

**Authored:** 2026-05-03 (autonomous mode)
**Authority:** CTO Office (per Constitution Article II — Gatekeeper office)
**Effective:** Phase 1 M2 onwards (when SME Lead onboards) with parts of pipeline starting Phase 1 M1

---

## §1 — TestForge mandate

QOrium ships content under a "no fiction" quality discipline (SO-24). Every released question must pass through a QA pipeline that:
- Validates technical correctness (SME Lead human gate)
- Calibrates difficulty empirically (IRT 3PL gate)
- Detects bias across 5 demographic groups (DIF gate)
- Detects leakage continuously (Anti-Leak Engine gate)
- Scores against the 92-point release Quality Gate (Gatekeeper office)

TestForge is the **operational glue** that runs these gates as a coordinated pipeline rather than 5 disconnected manual processes.

---

## §2 — Architecture

### 2.1 Data flow

```
[Authoring] → content.questions (status=draft)
    ↓
[SME validation] → content.questions (status=sme_review → accepted/revise/rejected)
    ↓
[Pre-calibration (AI prior)] → status=calibrating
    ↓
[Reference Panel + Customer Zero responses] → content.responses (N+=1)
    ↓
[IRT calibration nightly batch] → updates difficulty_b/discrimination_a/guessing_c when N≥30
    ↓
[Bias DIF check (monthly batch on items with N≥200)] → status=bias_review on flag
    ↓
[Anti-Leak Engine (24h crawl)] → content.leak_alerts → on confirmed leak → variant generation → status=leaked, rotated_to=<new_id>
    ↓
[AI Plagiarism Benchmark (quarterly)] → published metric; failure halts new releases
    ↓
[Quality Gate scorecard (per release)] → blocks release on any auto-fail
    ↓
[Released to customer ReadyBank/JD-Forge/Stack-Vault APIs]
```

### 2.2 Service topology

| Service | PM2 process | Port | Cadence | Owner |
|---|---|---|---|---|
| qorium-judge0-orchestrator | cluster x2 | 5108 | continuous (per-submission) | per Judge0 spec |
| qorium-leak-crawler | fork | 5104 | daily 02:00 IST cron | per Anti-Leak Engine spec |
| qorium-irt-batch | fork | (none; batch) | nightly 03:00 IST cron | per IRT pipeline spec |
| qorium-bias-dif-batch | fork | (none; batch) | monthly first Wed 04:00 IST cron | per Bias Methodology spec |
| qorium-plagiarism-detector | fork | (NEW; 5109) | continuous + quarterly benchmark | per AI Plagiarism Protocol spec |
| qorium-gatekeeper | fork | (none; CLI) | per release; manual or CI trigger | per Quality Gate scorecard |
| qorium-testforge-orchestrator | **NEW** fork | 5110 | continuous; coordinates 6 above | this doc |

### 2.3 Database schema deltas (migration 0007)

```sql
ALTER TABLE content.questions ADD COLUMN testforge_status enum('draft', 'sme_review', 'accepted', 'calibrating', 'bias_review', 'released', 'leaked', 'rejected');
ALTER TABLE content.questions ADD COLUMN testforge_last_check timestamp;
ALTER TABLE content.questions ADD COLUMN testforge_audit jsonb;

CREATE TABLE content.testforge_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type enum('sme_validation', 'irt_calibration', 'bias_dif', 'leak_crawl', 'plagiarism_benchmark', 'gate_scorecard'),
  triggered_at timestamp NOT NULL DEFAULT now(),
  completed_at timestamp,
  status enum('running', 'completed', 'failed'),
  items_processed int,
  items_passed int,
  items_flagged int,
  output jsonb,
  error_message text
);

CREATE INDEX testforge_runs_type_status ON content.testforge_runs (run_type, status, triggered_at DESC);
```

---

## §3 — Per-component operational integration

### 3.1 SME Validation gate (already specified)

- Tool: `customer-zero/SME-Validation-Tracker-Wave1.xlsx` (160 rows × 14 cols + Status Legend + Summary)
- Cadence: continuous; SME Lead reviews 5-10 questions/day at steady state
- Pass criteria: status=accepted before any further pipeline progression
- TestForge hook: on row update from "Pending" to "Accepted/Revise/Rejected", trigger `qorium-testforge-orchestrator/api/sme-decision` webhook
- Failure mode: questions stuck in "Pending" >14 days → flagged in J6 Friday Eng Review

### 3.2 Pre-calibration AI prior (NEW operational work)

- For every newly accepted question, AI sets initial difficulty_b prior based on similar items in library
- Algorithm: nearest-neighbor by (skill, sub_skill, format) on items with N≥30; weighted by IRT discrimination
- Status transition: accepted → calibrating
- TestForge hook: on AccountedAt event, async job assigns prior + queues for Reference Panel exposure

### 3.3 IRT calibration nightly batch (per IRT pipeline spec)

- Runs 03:00 IST after Anti-Leak Engine (02:00) completes
- Library: girth (Python; MIT licensed) for 3PL
- Batch size: ~500 items per nightly run; full library passes weekly
- Output: updated difficulty_b/discrimination_a/guessing_c on items with N≥30; flags items with |Δb|>0.5 for SME re-review
- Status transition: calibrating → released (when all gates pass)
- TestForge hook: writes to content.testforge_runs; failures alert via Sentry

### 3.4 Bias DIF check monthly batch (per Bias Methodology spec)

- Runs first Wed 04:00 IST (timed to be ready for J5 Monthly Close)
- Method: Mantel-Haenszel for v1; IRT-LR upgrade Y2
- Sample: items with N≥200 across all 5 demographic groups
- Threshold: MH p<0.05 + |delta|>1.5 → status=bias_review
- TestForge hook: writes to content.testforge_runs; bias_review items appear in SME Lead daily queue

### 3.5 Anti-leak engine (per Anti-Leak Engine spec)

- Runs 02:00 IST daily (cold restart per B10 spec)
- Detection: cosine + lexical overlap + AST similarity for code questions
- Action: status=leaked + auto-generate variant + status=released for variant
- TestForge hook: leak_alerts table; per-customer breach notification within 24h via D4 channel

### 3.6 AI Plagiarism Benchmark (per AI Plagiarism Protocol spec)

- Continuous: 1% sample of production submissions weekly
- Quarterly: full 1K-corpus benchmark against latest LLM models
- Threshold: ≥93% detection rate (SO-22 mandate)
- Failure: <93% halts new releases until threshold restored
- TestForge hook: testforge_runs entry + escalation to CTO + CEO if benchmark fails

### 3.7 Quality Gate scorecard (per Quality Gate spec)

- Per-release: 92-point scorecard saved to `/governance/quality-gate-runs/YYYY-MM-DD-release-X.md`
- Threshold: ≥88/92; 6 auto-fail criteria block release at any score
- TestForge integration: scorecard checks reference testforge_runs to verify all 6 gates passed before scoring
- Output: PASS / FAIL / FAIL-with-waiver decision; waiver requires CTO + CEO joint sign

---

## §4 — Operational cadence

| Cadence | Trigger | Components |
|---|---|---|
| Continuous (per-submission) | Every candidate response | qorium-judge0-orchestrator |
| Daily 02:00 IST | Cron | qorium-leak-crawler |
| Daily 03:00 IST | Cron (after leak crawler) | qorium-irt-batch |
| Weekly | Manual or CI trigger | AI Plagiarism Benchmark continuous sample |
| Monthly first-Wed 04:00 IST | Cron | qorium-bias-dif-batch |
| Per-release (any time) | CI trigger or manual | qorium-gatekeeper (Quality Gate scorecard) |
| Quarterly | First Mon of quarter | AI Plagiarism Benchmark full-corpus refresh |

---

## §5 — Integration with offices

| Office | TestForge interaction |
|---|---|
| MANTHAN | Files Stage 6c TestForge handoff per session; this doc operationalises that handoff |
| CEO | Receives quarterly QA dashboard summary at J5 Monthly Close |
| CTO | Owns the pipeline; reviews daily ops at J6 Friday Eng |
| IdeaForge | Re-gate at M3/M6/M9/M12 considers QA pipeline health (calibration coverage, leak detection rate, bias DIF flags) |
| CDO | Owns IRT calibration + Reference Panel + bias methodology |
| Gatekeeper | Owns 92-pt scorecard + auto-fail enforcement |
| Bali | Receives QA-readiness signal before any external sample-pack delivery |

---

## §6 — Phase 1 M1-M3 rollout plan

| Week | Component activated | Owner |
|---|---|---|
| W1 | SME Validation tracker XLSX live; SME Lead onboarded with v0.6 quality bar | CTO + SME Lead |
| W2 | IRT pipeline pre-calibration AI prior; Reference Panel recruited (10 candidates) | CTO + I/O Psych contractor (when hired) |
| W3 | Anti-Leak Engine deployed on Mac Mini Docker; first daily crawl | CTO + Senior Eng |
| W4 | Quality Gate scorecard runs on first 100 questions release | CTO/Gatekeeper |
| M2 | qorium-testforge-orchestrator deployed; coordinates all 6 gates | Senior Eng + CTO |
| M2 | First IRT calibration batch on items with N≥30 (Customer Zero data) | CDO + I/O Psych contractor |
| M3 | Bias DIF check first run (items reach N≥200) | CDO + Bias Methodology |
| M3 | AI Plagiarism Benchmark first quarterly run | Gatekeeper |
| M3 | M3 IdeaForge re-gate uses TestForge dashboard as evidence input | IdeaForge office |

---

## §7 — Health metrics (TestForge Dashboard)

Published at `/governance/testforge-dashboard/YYYY-MM.md` monthly + linked from J5 Monthly Close.

KPIs:
1. **SME validation throughput** — Qs reviewed/day, accepted/rejected ratio
2. **Pipeline lag** — median days from authoring to released status
3. **Calibration coverage** — % items with N≥30 (target ≥80%)
4. **Bias DIF flag rate** — items flagged / items checked (target <5%)
5. **Leak detection rate** — confirmed leaks / total items per month
6. **AI plagiarism benchmark** — quarterly score (must remain ≥93%)
7. **Quality Gate pass rate** — % releases passing ≥88/92 (target ≥95%)
8. **Auto-fail incidents** — count + remediation time

---

## §8 — Open questions for first 90-day review

1. Mac Mini capacity for parallel TestForge components (Judge0 + leak crawler + plagiarism detector all on same Mac Mini) — load test before Phase 1 M2
2. Reference Panel size for bias DIF (need N≥200 per demographic group; current target 250 candidates by M9 may be insufficient for sub-group sample sizes)
3. Quarterly AI Plagiarism Benchmark cost ($200/mo + $500/quarter for fresh LLM samples) — budget envelope
4. CDO role formalisation — currently CTO Office covers; M9 dedicated I/O Psych contractor; Y2 CDO hire
5. TestForge orchestrator failure modes — when one of 6 components is down, do other 5 continue or halt?

---

## §9 — Memory + state integration

- TestForge runs status persisted in content.testforge_runs (queryable for J5 dashboard)
- TestForge events (leak detected, bias flagged, calibration drift) emit webhook to `/api/webhooks/testforge` for downstream systems
- Failures trigger Sentry alerts + Slack/Telegram notification per D4 charter
- Memory captured: every TestForge run logged in audit.events (immutable; per Audit-Log-API spec)

---

## §10 — References

- Anti-Leak Engine v0 Design: `infra/Anti-Leak-Engine-v0-Design.md`
- IRT Calibration Pipeline v0: `infra/IRT-Calibration-Pipeline-v0-Spec.md`
- Bias Detection Methodology v1: `governance/Bias-Detection-Methodology-v1.md`
- AI Plagiarism Benchmark Protocol v1: `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
- 92-Point Quality Gate Scorecard: `governance/Quality-Gate-92pt-Scorecard.md`
- Judge0 Sandbox Integration v0: `infra/Judge0-Sandbox-Integration-Spec-v0.md`
- SME Lead Day-1 Onboarding: `customer-zero/SME-Lead-Onboarding-Day-1.md`
- Wave 1 v0.6 Edits Patch: `customer-zero/Wave-1-v0.6-Edits-Patch-2026-05-02.md`

---

*End of TestForge QA Pipeline v1. Operational glue between MANTHAN Stage 6c handoff and the 6 QA gates already specified. Ready for Senior Engineer #1 review on hire; deployment Phase 1 M2.*
