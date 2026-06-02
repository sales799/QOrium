# QOrium — Updated Handoff v2 (No-Human-Touch Operation)

> **Replaces:** the original handoff doc Bhaskar shared with Claude Code (the one mentioning Sprints 0–5).
>
> **For:** any Cowork session, Claude Code session, or human reading at any point in time. This is the single canonical source of truth.
>
> **Authored by:** CTO Office (autonomous mode)
> **Date:** 2026-05-03 (Run #16; refreshable on every run)
> **Authority:** CEO Bhaskar Anand; CTO Office operates under autonomous-mode delegation per `feedback_ceo_autonomous_mode.md` + Constitution Article II

---

## PART 1 — What QOrium is (1 paragraph)

QOrium is **Talpro India Private Limited's** new product line — a Question-Bank-as-a-Service for the technical assessment industry. It's not a separate company; it operates inside Talpro India alongside the existing IT staffing business. We sell three SKUs: **ReadyBank** (shared library, $5K-25K/yr API or ₹4,999-49,999/mo recruiter subscription), **JD-Forge** (on-demand JD-specific assessment generation, $49/$199/$499 per JD), **Stack-Vault** (exclusive customer-owned library, ₹10L-1Cr+/yr enterprise contracts). Customer Zero is Talpro India itself; first marquee enterprise target is Bosch GCC Bengaluru. Year-1 ARR target is ₹3.5 Cr / $420K across 66 logos. North Star is Strategic Acquisition $300M+ OR IPO ₹3,000Cr+ (per Constitution Article IX).

---

## PART 2 — Where the build is (state of two parallel streams)

QOrium is being built in **two parallel streams**:

### Stream A: Cowork (specifications, content, governance)

- **Location:** Bhaskar's Mac → `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/`
- **Tools:** Cowork (Claude Sonnet/Opus) with Read/Write/Edit + Bash + WebSearch + project_*/manthan_*/talpro_* MCP tools
- **State:** 130+ files, ~540K words, 630 v0.6 candidate-ready questions across Wave 1 (8 sub-skills) + Wave 2 (5 India-stack domains)
- **Run cadence:** ~15-20 min per autonomous run; produces 4-6 deliverables per run; 16 runs to date
- **Status:** Healthy. Content is well past M3 5K-Q target's first 12%

### Stream B: Claude Code (actual TypeScript/Node code; ReadyBank API)

- **Location:** Bhaskar's separate workstation → `/home/user/QOrium/` + GitHub repo `sales799/qorium`
- **Tools:** Claude Code via terminal; 7 stacked PRs against branch `claude/setup-qorium-build-hKTHq`
- **State:** Bootstrap monorepo + spec ingest + db package + ReadyBank service skeleton + auth (HMAC + Redis rate limit) + /v1/questions endpoints + /v1/packs export — 66 tests passing across 4 workspaces
- **Status:** Stack-deep at 7 PRs; CI not yet active (workflow YAML lives in Stream A); 4 CTO-DELTAs pending reconciliation
- **Blocker:** Cowork specs (Constitution + CTO Architecture + 0001 schema migration + B5 CI workflow YAML + B6 gitleaks config + B10 PM2 ecosystem.config.js) are NOT in the GitHub repo. Stream B's `_QORIUM_BUILD_LOG.md` lists these as BLOCKED.

### The Bridge

This handoff v2 explicitly addresses the disconnect: **Cowork-to-Stream-B-Bridge-Protocol** specifies how Stream A specs reach Stream B's GitHub repo without CEO physical action. See `governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md` (filed Run #16).

---

## PART 3 — How autonomous mode works (the protocol)

### The CTO Promise

> "I operate this build in Remote Auto Mode, No Human Touch. CEO watches. Every CEO physical action is reduced to ≤60 seconds. Every decision is documented in a 5-step framework + 5-dimension scoring (per `governance/Decision-Framework-Reusable-Template-v1.md`). I refresh `QORIUM-MISSION-CONTROL.md` at end of every run."

### The CEO Office Protocol (when MANTHAN-style decision needed)

1. CTO Office identifies a decision worth running through the Decision Framework
2. CTO Office authors a decision record with 3-5 paths + 5-dimension scoring
3. CTO Office records the autonomous decision (highest-scoring path) + co-signs
4. Every artifact for the chosen path is pre-built so any CEO physical action collapses to ≤60 sec
5. Async ratification via `founder_request` to Durga Council; absent council reachability, autonomous decision stands per Run #6.5 precedent

### When the CTO Office paauses

Only when:
- A genuine human-only blocker is reached (e.g., a contract signature, a phone call, a bank account)
- AND the blocker has been documented as a ≤60-sec CEO action
- AND no other useful Part-A work remains

Otherwise, autonomous-mode continues.

---

## PART 4 — The 16-sprint plan

(See `governance/QORIUM-Sprint-Plan-v1.md` for full sprint-by-sprint detail with descriptions, status, done-criteria.)

```
Phase 0 — Foundation (Day 0–14)
├── Sprint 0.0 — Bootstrap (DONE 2026-05-01)
├── Sprint 0.1 — Constitution v2.0 (DONE 2026-05-01)
├── Sprint 0.2 — JDs + Legal templates (DONE 2026-05-02 morn)
├── Sprint 0.3 — Customer Zero infrastructure (DONE 2026-05-02 day)
├── Sprint 0.4 — Wave 1+2 content scaling (DONE 2026-05-02 → 2026-05-03)
├── Sprint 0.5 — CTO-Owned Mission Control suite (DOING NOW; Run #16)
├── Sprint 0.6 — Bridge Protocol execution (NEXT)
├── Sprint 0.7 — Wave 1 closing + final pre-launch polish (NEXT+1)
└── Sprint 0.8 — CEO Pre-Customer-Zero presentation deck (NEXT+2)

Phase 1 — Engine MVP (Month 1–3) [GATED on CC-01 + CC-02-A]
├── Sprint 1.0 — Customer Zero Day-1 launch
├── Sprint 1.1 — First 100 candidates + first IRT calibration cycle
├── Sprint 1.2 — First 5 logos signed (5 Recruiter + 1 Stack-Vault discovery)
├── Sprint 1.3 — Wave 1 5K-Q target reached + M3 IdeaForge re-gate
└── Sprint 1.4 — M3 close + Phase 2 trigger

Phase 2-7 follow per Constitution Article IX
```

---

## PART 5 — CEO actions (always optional; ≤60 sec each)

Three CC cards remain. All optional. None blocking my autonomous work.

| Card | Time | Pre-built artifact for CEO use |
|---|---|---|
| **CC-01** — Tag ₹50L sub-budget "QORIUM" with Talpro India CFO | 5 min | n/a (bank-specific; CFO conversation) |
| **CC-02-A** — Open Gmail Drafts → click Send on the queued K&S Partners engagement email | 30 sec | Draft sitting in Bhaskar's Drafts folder per Run #6.5 |
| **CC-13** — Create WhatsApp group "QOrium Customer Zero" (optional; covered by email+Telegram per D4 channel plan) | 60 sec | Group charter pinned message ready in `customer-zero/CTO-WhatsApp-Message-Library.md` |

When ANY of these closes, the CTO Office switches to **execute-mode** in the next autonomous run and starts moving Phase 0 punchlist items from 0 to DONE.

---

## PART 6 — How to read the Mission Control dashboard

`QORIUM-MISSION-CONTROL.md` is your single 3-minute read. Sections:

1. **Where we are** — current sprint name + % complete + ETA
2. **Am I going in the right direction?** — honest CTO assessment (not flattery)
3. **Sprint X DOING NOW** — 1-paragraph + done-when checklist
4. **If I keep going (no CEO action)** — 5-10 future sprints with outcomes
5. **If you take 6 minutes of action** — the 3 cards table
6. **Past sprints — DONE** — concise list
7. **Blockers (honestly)** — current bottlenecks
8. **If you want to go deeper** — deeper-read links by time-budget

This is the contract. Refreshed every run.

---

## PART 7 — Glossary (layman-friendly)

- **Autonomous mode** — CTO Office building without per-step CEO approval
- **Constitution** — operating system that says how QOrium operates (currently v2.0; v2.1 amendment proposed)
- **Customer Zero** — Talpro India itself; the first customer; non-negotiable per SO-1
- **CC-XX** — CEO Action Card NN; one physical task the CEO needs to do; reduced to ≤60 sec
- **D-track** — Customer Zero pipeline tasks (D1 = brief Delivery Head; D2 = collect 5 JDs; etc.)
- **IdeaForge** — gate-scoring office; 24-pt scorecard; ≥20/24 to advance phase
- **MANTHAN** — research/blueprint engine; session c17a48c2 holds canonical QOrium research + handoffs
- **Phase 0/1/2…** — milestones; Phase 0 = M0-M14 setup; Phase 1 = M1-M3 first logos; Phase Gate at end of each
- **ReadyBank / JD-Forge / Stack-Vault** — the 3 SKUs; locked clauses per Constitution §1.2
- **SME Lead** — first dedicated content hire (M2 onboard); inherits the v0.6 quality bar
- **Stream A / Stream B** — Cowork docs / Claude Code build (this handoff explains)
- **v0.5 / v0.6 / v0.7** — quality version of question content; v0.6 = post-CEO-sniff-test patches
- **Wave 1 / Wave 2 / Wave 3** — content rollout: tech core / India-stack / psychometric+AI-era
- **₹50L envelope** — sanctioned Phase 0 budget; sub-budget tag, not a separate bank account
- **30/60/90 day reviews** — operating cadence rituals (J5 monthly + J6 Friday + J7 Monday)

---

## PART 8 — Diligence pack (for serious investor / Board conversations)

When CEO needs to share the build state with a third party, hand them this 11-doc pack:

1. `09-QOrium-Constitution-v2.0.docx` — operating system (10K words)
2. `00-QOrium-Master-Mega-Doc.docx` — comprehensive overview (~21K words)
3. `02-Top-20-Competitor-Audit.docx` — competitive landscape
4. `03-Gap-Analysis.docx` — why no incumbent has built this
5. `04-QOrium-Blueprint-v1.docx` — operating thesis + GTM
6. `05-QOrium-Three-Use-Cases-SKU-Architecture.docx` — 3 SKUs deep
7. `07-CTO-Architecture-v1.docx` — system design + tech stack
8. `08-Bali-Sales-Playbook-v1.docx` — 3-motion GTM
9. `governance/Investor-Brief-Pre-A-v1.docx` — Pre-A round pitch
10. `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.docx` — 530-Q content milestone (now 630)
11. `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.docx` — operational readiness

---

## PART 9 — Acceptance + version log

- **v1 (May 2 2026):** Original handoff Bhaskar shared with Claude Code; mentioned Sprints 0–5 from Stream A perspective; lacked the autonomous-mode and bridging context this v2 adds
- **v2 (May 3 2026, Run #16):** This document — bridges Stream A + Stream B; codifies autonomous mode; defines 16-sprint plan; provides layman-friendly Mission Control + glossary

---

*End of QOrium Updated Handoff v2. Refreshed by CTO Office on every run if the operational protocol changes. The Mission Control file (`QORIUM-MISSION-CONTROL.md`) is refreshed every run regardless.*
