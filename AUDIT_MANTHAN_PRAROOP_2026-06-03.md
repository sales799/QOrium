# QOrium — AUDIT → MANTHAN → PRAROOP Record (2026-06-03)

**Trigger:** CEO command `AUDIT MANTHAN + PRAROOP : https://qorium.online/`
**Run by:** Claude (CTO), autonomous · live-state verified (no hard-coded facts)
**PRAROOP bundle id:** `praroop-qorium-assessment-delivery-grading-loop--mpy7hzc4` — KASAUTI ✅ PASS 24/24

---

## 1. AUDIT — live ground truth (verified 2026-06-03)

| Surface | Result | Verdict |
|---|---|---|
| `qorium.online/` | HTTP 200 · title+H1 "Skills assessments you can defend in an audit." | ✅ buyer-POV copy live |
| `api.qorium.online/healthz` | HTTP 200 | ✅ |
| `qorium.online/openapi.json` | HTTP 200 | ✅ |
| `qorium.online/pricing` | HTTP 200 | ✅ |
| Fleet (`talpro_qorium_fleet_status`) | 35 procs / 24 services online, 0 errored, 1.29 GB | ✅ healthy |
| Latest Rakshak (registry) | `rakshak-qorium_online-mptgu36b-413f` 🟡 CONDITIONAL-GO 92/100, 2026-05-31 | ⚠️ registry lags CLAUDE.md's active-origin 94/89/88 |
| **`candidate.qorium.online/`** | **HTTP 200 but serves the Talpro staffing homepage** (server: Express) | 🔴 **LAUNCH BLOCKER** |
| nginx `candidate.qorium.online` :443 | proxies to wrong upstream (Express staffing app), not `qorium-candidate-portal:5116` | 🔴 misroute |

**Divergences flagged (Truth Hierarchy):**
- MANTHAN `9194eed8` (Mega Build, cited in CLAUDE.md) is **not in this MCP's `manthan_list`** — different store/host. Canonical QOrium MANTHAN here = `c17a48c2` (Phase-1 blueprint, complete).
- MCP `talpro_db_query` hits the **old origin** (qorium DB there = `pgmigrations` only). Live data (1,406 released Qs, `content.responses`) is on the **active origin** — consistent with the dual-origin reality.
- Newer Rakshak runs (94/89/88) live on the active-origin host's `/opt/apps/rakshak-runs`, not the MCP registry.

**The launch-blocking gap (confirmed against the locked spec):** no candidate can take a test today — `content.responses = 1`, no assessment/attempt/invite tables populated, candidate portal misrouted, `/my` 404. The "psychometrically-defensible, AI-graded" positioning is **fiction until real candidates answer**, and **0 questions can be IRT-calibrated** without responses.

## 2. MANTHAN — reconciled (no duplicate spun)

- Phase-1 blueprint exists: MANTHAN `c17a48c2` (complete) → 3-SKU architecture (ReadyBank / JD-Forge / Stack-Vault), IdeaForge 21/24 PROCEED.
- Phase-2 "Core assessment loop" blueprint already authored as `QORIUM_ASSESSMENT_LOOP_v1.md` (LOCKED, MANTHAN `9194eed8`). This is the blueprint that fed PRAROOP — no new MANTHAN session created (Lock-3: never duplicate an open topic).

## 3. PRAROOP — constitution + DoR bundle + branch DAG (NEW)

Before this run, PRAROOP had **zero real QOrium bundles** (only sample/test runs). The locked spec had never been through the deterministic, KASAUTI-gated PRAROOP engine. Now it has:

- **DoR rubric: 24/24** (vision, files, deps, risk, acceptance, security all 4/4)
- **KASAUTI: ✅ PASS** (threshold 20) · **Open questions: 0 blocking**
- **Bundle artifacts:** CONSTITUTION.md + PRD + Tech Architecture + Security & Access + Frontend Spec + Feature Ticket List (retrieve via `praroop_bundle praroop-qorium-assessment-delivery-grading-loop--mpy7hzc4`)

### Branch DAG (8 branches, dependency-ordered)

| Branch | Lane | Risk | Prio | Depends on | Scope |
|---|---|---|---|---|---|
| BR-1 | BHIMA | high | 1 | — | DB migration 0015 (assessments/assessment_questions/invitations/attempts + responses.attempt_id) |
| BR-5 | ARJUN | high | 1 | — | nginx fix: candidate.qorium.online → candidate-portal:5116 |
| BR-2 | BHIMA | high | 2 | BR-1 | Assessment + invite admin APIs |
| BR-3 | BHIMA | high | 3 | BR-1,BR-2 | Attempt/answer/submit APIs + grading worker (reasoning-trace) |
| BR-4 | BHIMA | high | 4 | BR-1,BR-3 | IRT calibration feedback wiring |
| BR-6 | ARJUN | low | 5 | BR-2 | Candidate /t/[token] landing + start |
| BR-7 | ARJUN | high | 6 | BR-3 | Test runner /sessions/[id] + anti-cheat |
| BR-8 | ARJUN | high | 6 | BR-3 | Candidate result + admin reasoning-trace review |

**Dependency-ready NOW (4-lane immediate start):** BR-1 (BHIMA) + BR-5 (ARJUN) — both deps-free, both P1. Machine-readable DAG saved to `PRAROOP_DAG_assessment_loop_2026-06-03.json` (shape accepted by `spine_dag_ingest`).

## 4. Next action (recommended, not yet executed)

`spine_dag_ingest` the DAG → KARYA dispatches BR-1 + BR-5 to the two lanes (cross-account review, author never self-merges). Loop unblocks BR-2→BR-3→BR-4 / BR-6→BR-7→BR-8. Exit: a Talpro recruiter sends a working test link → graded result with per-answer reasoning trace → `content.responses` + `calibration_n` grow → "IRT-calibrated" becomes literally true. PRAHARI GO 80/80 before any external pilot.

**Founder lever (only CEO can pull):** once the loop proof passes, point a real Talpro hiring drive's candidates at the QOrium link → 100+ responses → first IRT-calibrated cohort.
