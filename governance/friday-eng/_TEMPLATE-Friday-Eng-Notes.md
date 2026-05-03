# FRIDAY ENG NOTES TEMPLATE

**Filename pattern:** `friday-eng/YYYY-MM-DD-Friday-Eng-Notes.md`  
**Author:** CTO Office  
**Posted:** Friday 4:00 PM IST (during 60-min engineering review)  
**Reference:** Constitution Article VIII §2, Operating Rituals §2

---

## [DATE] — SPRINT [N] — PHASE [X]

**Quality bar:** Gatekeeper failures discussed publicly with no-blame language. All tickets linked to QUEUE-QOrium.md.

---

## §1 SPRINT BOARD WALK-THROUGH

*Table: ticket / status / owner / blockers*

| Ticket | Status | Owner | Blockers / Notes |
|---|---|---|---|
| [QOR-001] | ✅ Done | [Owner] | Deployed to prod Thu EOD |
| [QOR-002] | 🟡 In Progress | [Owner] | Waiting on SME review (ETA Mon) |
| [QOR-003] | 🟡 In Progress | [Owner] | No blockers; on track for EOW |
| [QOR-004] | 🔴 Blocked | [Owner] | Depends on infrastructure provisioning; escalated to CTO |
| [QOR-005] | ❌ Not Started | [Owner] | De-prioritized this sprint; moved to M2W2 |
| [QOR-006] | ✅ Done | [Owner] | Closed early; QA passed Thu morning |
| [QOR-007] | 🟡 In Progress | [Owner] | Code review in progress (2 approvals, 1 pending) |
| [QOR-008] | 🟡 In Progress | [Owner] | Integration testing; found 1 edge case, fixing now |

**Velocity summary:**
- **Target points:** 40
- **Completed points:** 36
- **Velocity trend:** → Flat (aligned with forecast)
- **Overall status:** On track ✅

---

## §2 QUALITY GATE METRICS

### Gatekeeper Status

- **Overall score:** [X]/5 (PASS / CONDITIONAL / FAIL)
- **Code quality:** [X]/5 (test coverage >80%? no TODOs in prod? lint pass?)
- **Documentation:** [X]/5 (API docs updated? README current?)
- **Security posture:** [X]/5 (secrets scanning pass? no hardcoded API keys?)
- **Performance:** [X]/5 (latency within SLA? no regressions?)

**Gatekeeper failures (if any):**  
[If CONDITIONAL or FAIL, list each dimension with remediation owner + ETA]

### IRT Calibration Backlog

- **Questions pending calibration:** [X] items
- **In-flight (N ≥ 20):** [X] items
- **Released (N ≥ 30):** [X] items
- **Rejected / regenerating:** [X] items

**Status:** On track / At risk (target: clear ≥50 items/week for M3 gate)

### Anti-Leak Alerts

- **Suspected leaks detected this week:** [X] alerts
- **Confirmed leaks (manual review):** [X]
- **Status:** 🟢 All clear / 🟡 [X] under investigation / 🔴 [X] confirmed (rotation started)
- **Rotation timeline:** [If leak confirmed, when does new question subset deploy?]

### Production Health Snapshot

| Metric | Value | Status |
|---|---|---|
| **PM2 process uptime** | [X]% | ✅ / 🟡 / 🔴 |
| **Watchdog health** | [X] checks passing | ✅ / 🟡 / 🔴 |
| **Error rate (5xx)** | [X]% | ✅ / 🟡 / 🔴 |
| **p95 latency** | [X] ms | ✅ / 🟡 / 🔴 |
| **Database reachability** | [X] ms | ✅ / 🟡 / 🔴 |

**Incidents this week:** [X] P0 / [X] P1 / [X] P2  
**Details:** [Link to incident runbook or brief summary]

### Tech Debt Resolved

- [Debt item 1] — [brief outcome]
- [Debt item 2] — [brief outcome]

---

## §3 TECH DEBT + RISK REVIEW (DEEP DIVE — 1 Item)

*Discuss 1 tech-debt or risk item in depth (~1 paragraph). Tie to Phase Gate readiness if applicable.*

**Item:** [Name of debt or risk]

**Situation:** [Current state, why it matters]

**Impact:** [If unresolved, what breaks? Performance? Security? Hiring signal?]

**Proposed fix:** [Owner + ETA + effort estimate]

**M3 gate implication:** [Critical / Important / Can defer]

---

## §4 NEXT-WEEK SPRINT COMMIT

*Table: ticket / scope / owner*

| Ticket | Scope | Owner | Risk Level |
|---|---|---|---|
| [QOR-009] | [Brief description] | [Owner] | Low / Medium / High |
| [QOR-010] | [Brief description] | [Owner] | Low / Medium / High |
| [QOR-011] | [Brief description] | [Owner] | Low / Medium / High |
| [QOR-012] | [Brief description] | [Owner] | Low / Medium / High |
| [QOR-013] | [Brief description] | [Owner] | Low / Medium / High |

**Total capacity committed:** [X] points  
**Stretch goal (if velocity permits):** [Optional extra story]

---

## §5 DEMOS (2-min each, anyone can show)

*Bullet list of who/what was shipped this week.*

- **[Owner]**: [Feature/fix shipped] — Link to PR or GitHub release
- **[Owner]**: [Feature/fix shipped] — Link to PR or GitHub release
- **[Owner]**: [Feature/fix shipped] — Link to PR or GitHub release

---

## §6 DECISIONS MADE

*3-line max each; pushed to QUEUE-QOrium.md within 24 hours.*

- **Decision 1:** [Decision] → Decided by [Owner]; pushes to [downstream impact]
- **Decision 2:** [Decision] → Decided by [Owner]; pushes to [downstream impact]

---

## §7 ACTION ITEMS

*Table: action / owner / ETA*

| Action | Owner | ETA |
|---|---|---|
| [Action 1] | [Owner] | [YYYY-MM-DD] |
| [Action 2] | [Owner] | [YYYY-MM-DD] |

---

## FOOTER

**Quality bar:** Gatekeeper failures discussed publicly with no-blame language (e.g., "Dimension X flagged a test coverage gap; next action is...").  
**Cross-link:** All decisions + action items synced to QUEUE-QOrium.md by end-of-business Friday.

---

---

# EXAMPLE — 2026-07-03 Friday Eng Notes

**2026-07-03 (Sprint 4, Phase 1)**

---

## §1 SPRINT BOARD WALK-THROUGH

| Ticket | Status | Owner | Blockers / Notes |
|---|---|---|---|
| QOR-027 | ✅ Done | Senior Eng | Deployed API v0.3 Wed; latency drop: 450→280ms ✅ |
| QOR-028 | ✅ Done | Senior Eng | N8N workflow for Question batch import; tested, merged |
| QOR-029 | 🟡 In Progress | SME Lead | IRT calibration job v2; 95% coverage, final QA Mon |
| QOR-030 | 🟡 In Progress | Frontend Eng | UI polish on assessment replay; CSS grid fix in progress |
| QOR-031 | 🟡 In Progress | Senior Eng | Redis cache layer for anti-leak queries; perf testing |
| QOR-032 | 🔴 Blocked | SME Lead | Awaiting customer feedback on bias audit results; ETA Mon |
| QOR-033 | 🟡 In Progress | Frontend Eng | Candidate export (CSV) feature; 80% done, export logic left |
| QOR-034 | ✅ Done | Senior Eng | Watchdog restart automation; now auto-recovers on PM2 crash |

**Velocity summary:**
- **Target points:** 40
- **Completed points:** 32
- **Velocity trend:** → Down 1 point (acceptable; QOR-032 blocker delayed QOR-029)
- **Overall status:** On track ✅

---

## §2 QUALITY GATE METRICS

### Gatekeeper Status

- **Overall score:** 4.2/5 (PASS ✅)
  - Code quality: 5/5 (test coverage 89%, no lint errors, no TODOs in prod)
  - Documentation: 4/5 (API docs current; RUNBOOK updated Thu; 1 stale README in /archive/)
  - Security posture: 4/5 (secrets scan pass; 1 non-critical static analysis flag re: SQL parameterization — benign, already safe)
  - Performance: 4/5 (p95 latency 280ms, target 300ms; no regressions from baseline)

**No failures this week.** All dimensions passing per Constitution Article VIII quality gate.

### IRT Calibration Backlog

- **Questions pending calibration:** 180 items (awaiting N≥30 responses)
- **In-flight (N ≥ 20, < 30):** 250 items (Phase A + early Phase B)
- **Released (N ≥ 30, discrimination ≥ 0.3):** 520 items
- **Rejected / regenerating:** 18 items (poor discrimination)

**Status:** On track. Projected 800+ released by M3 gate (Jul 31).

### Anti-Leak Alerts

- **Suspected leaks detected this week:** 1 alert
- **Confirmed leaks (manual review):** 0 confirmed (false positive on QOR-001; semantic match to StackOverflow was 0.79, below 0.85 threshold; cleared)
- **Status:** 🟢 All clear
- **Rotation timeline:** N/A (no confirmed leaks)

### Production Health Snapshot

| Metric | Value | Status |
|---|---|---|
| **PM2 process uptime** | 99.92% | ✅ (SLA: 99.5%) |
| **Watchdog health** | 8/8 checks passing | ✅ |
| **Error rate (5xx)** | 0.04% | ✅ (SLA: <0.1%) |
| **p95 latency** | 280 ms | ✅ (target: 300ms) |
| **Database reachability** | 1.2 ms | ✅ |

**Incidents this week:** 0 P0 / 1 P1 (API latency spike Wed, root-caused to N8N workflow load; fixed Thu) / 2 P2 (UI sluggishness, auto-export timeout — both non-blocking)

### Tech Debt Resolved

- Redis caching layer deployed (was on debt backlog 2 weeks)
- Watchdog automation completed (removed manual restart need)

---

## §3 TECH DEBT + RISK REVIEW (DEEP DIVE)

**Item:** IRT calibration pipeline latency (Phase C bottleneck)

**Situation:** Phase C (calibration) is running on a single Postgres instance with no query optimization. Each calibration job (computing Rasch indices for N≥30 item-response pairs) takes ~45 min for 100 items. With 800 items to calibrate by M3 gate, we're looking at 360 hours of compute time (15 days nonstop). Current pipeline is serial; blocking other queries.

**Impact:** If we don't parallelize + optimize queries, M3 gate's IRT coverage criterion (≥80% of 5K items calibrated) will miss. Critical path risk.

**Proposed fix:** Senior Eng to implement query parallelization (batch IRT compute across 4 job workers) + index optimization on response_data table. Effort: 3 story points. ETA: Jun 28 (next sprint). Post-optimization: 360 hrs → 90 hrs (4x speedup).

**M3 gate implication:** Critical. Gating the gate.

---

## §4 NEXT-WEEK SPRINT COMMIT

| Ticket | Scope | Owner | Risk Level |
|---|---|---|---|
| QOR-029 | Complete IRT calibration job v2 (final QA + merge) | SME Lead | Low |
| QOR-035 | Parallelize IRT job scheduler (4-worker setup) | Senior Eng | Medium |
| QOR-033 | Finish CSV export feature (candidate download) | Frontend Eng | Low |
| QOR-036 | Bias audit tooling (DIF analysis on Phase B) | CTO | Medium |
| QOR-037 | Customer Zero API rate-limiting (throttle auth errors) | Senior Eng | Low |

**Total capacity committed:** 38 points  
**Stretch goal:** QOR-038 (anti-leak crawler v2; only if QOR-035 finishes early)

---

## §5 DEMOS

- **Senior Eng**: API v0.3 with latency improvements — PR #427 (merged Wed)
- **Frontend Eng**: Question import bulk-upload workflow — live on staging (demo Thu)
- **SME Lead**: IRT calibration dashboard (Grafana snapshot) — showing live calibration progress + item discrimination trends

---

## §6 DECISIONS MADE

- **Decision:** Prioritize IRT query optimization (QOR-035) over stretch goals in Sprint 5. Rationale: M3 gate dependency; blocking risk if delayed.
- **Decision:** Freeze feature scope for next 2 sprints (focus on M3 readiness). Any new asks defer to Phase 2 roadmap.

---

## §7 ACTION ITEMS

| Action | Owner | ETA |
|---|---|---|
| Complete IRT parallelization benchmarking | Senior Eng | 2026-07-10 |
| Review bias audit scope with I/O Psych contractor | CTO | 2026-07-07 |
| Lock M3 Phase Gate readiness checklist with CEO | CTO | 2026-07-08 |

---

**End of example. Total word count: 1,080.**
