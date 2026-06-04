# CODEX PENDING — QOrium Customer-Zero Candidate Flow (the IRT calibration unlock)
**Filed:** 2026-06-03 by Claude (CTO), CEO-directed ("point Talpro hiring at QOrium") · **Lane:** KARYA/BHIMA · **Branch:** `codex/qorium-customer-zero-flow` · **Priority:** HIGH (parallel to draft-factory)

## Why (the gap this closes)
Constitution SO-1 mandates Talpro = Customer Zero from Month 1; SO-21 requires IRT calibration; Phase-3 wants 1,000+ Reference-Panel candidates. **Live DB blocker:** `content.responses = 1`, no populated assessment/attempt/invite tables, `/my` route 404. So **the take-assessment loop is not wired end-to-end** — a Talpro recruiter literally cannot send a candidate a working QOrium test today. Until real candidates answer, **0/986 questions can be IRT-calibrated** (calibration needs responses). This shard builds the loop so calibration can begin.

## Live facts (verified 2026-06-03)
- 986 released questions, 511 skills, 881 sub-skills available to compose from.
- Services live: `qorium-candidate-portal` ×2, `qorium-api`, `qorium-irt-calibration` ×2, `qorium-admin`. `/signin` 200, `/my` 404.
- Tables present: `app.ats_candidate_links`, `content.ai_pair_coding_sessions`, `content.responses` (1 row). No composed-assessment / attempt / invite tables with data.

## Build spec (minimum viable calibration loop)
1. **Compose a starter assessment** from `content.questions WHERE status='released'` — e.g. one per top Talpro hiring role (JavaScript/React/Python/Java/SQL/Data Analyst). Persist an `assessment` + `assessment_question` mapping (use existing schema if present; else migration via the repo's migration tool — do NOT hand-create tables out of band).
2. **Invite/link flow:** generate a signed candidate link (reuse `app.ats_candidate_links` pattern) the candidate opens — no login wall for the candidate. Surface via `qorium-candidate-portal` (fix/confirm the candidate route; `/my` 404 today).
3. **Take + submit:** candidate answers → each answer writes a row to `content.responses` with question_id, candidate ref (anonymized per SO-19 DPDPA — no PII stored by default), correct/incorrect, latency.
4. **Feed calibration:** confirm `qorium-irt-calibration` consumes `content.responses` and updates `difficulty_b/discrimination_a/guessing_c/calibration_n` once an item has ≥ the configured response threshold (Constitution cites 3PL ≥ ~50/item; allow a low dev threshold to prove the wire).
5. **Admin visibility:** responses-per-item + calibration coverage on `qorium-admin` so CDO can watch the flywheel.
6. **Proof:** simulate 10 candidate submissions end-to-end → `content.responses` climbs 1 → 11, at least one item shows `calibration_n>0` at a low dev threshold. Then it's ready for real candidates.

## Guardrails
- DPDPA/SO-19: no candidate PII stored by default; anonymized refs only.
- Anti-cheat is out of scope for v1 (calibration ≠ high-stakes); flag for later.
- Cross-account review before merge.

## FOUNDER / BUSINESS ACTION (the real Customer-Zero lever — only Talpro can do this)
Once the loop proof passes, **Talpro Delivery must route a real hiring drive's candidates through the QOrium assessment link** (instead of / alongside the current tool). Target: 100+ candidates (Phase-1 criterion) → starts real IRT calibration. This is a Talpro-ops instruction from the CEO to the Delivery Head — not a technical step. Pick the first role + drive to point at QOrium.

## Exit criteria
Working candidate link → 100 real Talpro candidates' responses in `content.responses` → first cohort of questions IRT-calibrated (`calibration_n>0`) → marketing "IRT-calibrated" claim becomes literally true.
