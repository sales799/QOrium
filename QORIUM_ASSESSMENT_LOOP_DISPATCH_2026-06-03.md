# QOrium Assessment Loop v1 — KARYA Dispatch Record (2026-06-03)

**Trigger:** CEO "build the assessment loop" · **Planner:** Claude (CTO, this session)
**PRAROOP bundle:** `praroop-qorium-assessment-delivery-grading-loop--mpy7hzc4` — KASAUTI ✅ PASS 24/24
**GBS pre-flight:** GREEN (all backpressure clear) at dispatch time.

## Why this is a lane dispatch, not a direct build from this session
- All fixes must land on the **active origin** (`qorium-active-origin` / 187.127.155.150) — where qorium.online, api, candidate, and the live `content` DB resolve through Cloudflare.
- This Cowork session's shell runs on the **old origin** (talpro-vps / 147.93.103.194, rollback standby); `qorium-active-origin` does **not** resolve from here. The active origin is unreachable from this seat.
- The spec (`QORIUM_ASSESSMENT_LOOP_v1.md`) and migration `0015` header **explicitly forbid hand-applying** to the live bank DB: PR review by the cross-account reviewer → STAGING → production.
- Inviolable guardrail: cross-account review, author never self-merges. A single Cowork brain writing + merging all 8 branches would violate it.
- ∴ Execution belongs to the always-on Mac build lanes (BHIMA/ARJUN Codex), which hold the active-origin SSH alias and do cross-account review. This session = single-brain planner (done); lanes = 4-wide executors.

## Live blocker state (verified 2026-06-03, via Cloudflare)
- `candidate.qorium.online` → HTTP 200 but **Express catch-all serving the Talpro staffing homepage** on `/`, `/t/test`, `/sessions/test` (BR-5 NOT fixed).
- `api.qorium.online/healthz` 200, but **`/v1/assessments` = 404** (BR-2/BR-3 backend not live).
- `content.responses` = 1 → 0 questions IRT-calibrated until real attempts land.

## Dispatch (priority + dependency order)

| Branch | Lane | Ship | Deps | Status |
|---|---|---|---|---|
| BR-1 DB migration 0021 | BHIMA (B) | **NOW** | — | PR #113 open (`3f24d50`) — review/staging required |
| BR-5 candidate runtime + nginx route | ARJUN (A) | **NOW** | — | PR #114 open (`d12c4fd`) — merge/deploy PM2 before nginx cutover |
| BR-2 assessment+invite APIs | BHIMA | after BR-1 | BR-1 | queued |
| BR-3 attempt/answer/submit + grading | BHIMA | after BR-2 | BR-1,BR-2 | queued |
| BR-4 IRT calibration feedback | BHIMA | after BR-3 | BR-1,BR-3 | queued |
| BR-6 candidate /t/[token] | ARJUN | after BR-2 | BR-2 | queued |
| BR-7 test runner + anti-cheat | ARJUN | after BR-3 | BR-3 | queued |
| BR-8 result + admin trace UI | ARJUN | after BR-3 | BR-3 | queued |

Lane briefs (already in repo, current vs DAG): `CODEX_PENDING_ASSESSMENT_LOOP_v1_LANE_A_ARJUN.md`, `CODEX_PENDING_ASSESSMENT_LOOP_v1_LANE_B_BHIMA.md`.
DAG (machine-readable for spine_dag_ingest): `PRAROOP_DAG_assessment_loop_2026-06-03.json`.

## Exit criteria (build done)
1. `candidate.qorium.online/` serves the candidate portal (not Talpro title).
2. `api.qorium.online/v1/assessments` reachable (auth-gated, not 404).
3. A Talpro-tenant recruiter creates an assessment, invites a candidate by token link, candidate takes a timed test, answer graded with per-answer reasoning trace.
4. `content.responses` grows; first item crosses `calibration_n ≥ 30` → "IRT-calibrated" becomes literally true.
5. PRAHARI GO 80/80 before any external (non-Talpro) pilot.

## Single consolidated CEO/ops action
- Ensure **BHIMA (Mac Pro) + ARJUN (Mac Mini) are awake** so the Codex lanes drain BR-1 + BR-5 now (Telegram dispatch sent).
- Business lever (only CEO): once the loop proof is green, point a real Talpro hiring drive's candidates at the QOrium link → 100+ responses → first IRT-calibrated cohort.
