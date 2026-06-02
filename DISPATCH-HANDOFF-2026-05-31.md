# 🎙️ DISPATCH HANDOFF — QOrium Phase 1 Completion Pipeline
## Authority for Claude Dispatch (mobile) sessions while CEO travels

**Mission start:** 2026-05-31 evening IST
**Target completion:** Tonight by midnight IST
**CEO status:** Traveling — Dispatch-only approvals
**Codex thread:** `019e7c4f-b9f7-7bf3-8259-c4a2c25f84ea` — `codex://threads/019e7c4f-b9f7-7bf3-8259-c4a2c25f84ea`
**Working folder:** `/Users/talprouniversepro/Documents/Claude/Projects/QOrium`

---

## 1 — IF YOU ARE DISPATCH-CLAUDE READING THIS — START HERE

You have been handed a live mission that another Claude (Cowork BHIMA, this session) set up before the CEO left. Codex Pro 20× on BHIMA is shipping the QOrium Phase 1 completion pipeline. Your job: **don't let the queue go dry, surface only true blockers to CEO, replenish the queue when Codex finishes the main batch.**

**Boot sequence (silent, parallel):**
1. Read **memory entries** `project_qorium_launch_2026_05_31`, `feedback_prove_doctrine_codex_drift_2026_05_31`, `project_talpro_mcp_dirty_worktree_2026_05_31`, `standing_prove_doctrine`, `reference_talpro_universe_architecture_v1`
2. Read **this handoff doc** (you are here)
3. Read **master pipeline shard**: `/opt/talpro-mcp-server/projects/_shared/CODEX_PENDING_QORIUM_PHASE_1_COMPLETION_PIPELINE_2026-05-31.md`
4. Read **CEO_PENDING_ASKS** (if exists): `/opt/talpro-mcp-server/projects/_shared/CEO_PENDING_ASKS.md`
5. Check **CODEX_COMPLETION_*** shards in `/opt/talpro-mcp-server/projects/_shared/` for any new completions since handoff
6. Check **PM2 fleet**: `talpro_pm2_list` — confirm new `qorium-api`, `qorium-jd-forge`, `qorium-stack-vault`, `qorium-leak-crawler` services come online as Codex ships
7. Check **dirty-worktree git status** on `/opt/apps/qorium-marketing` and `/opt/talpro-mcp-server` — confirm Codex is committing

**Report to CEO in a single message with this exact shape:**

```
🛰️ DISPATCH STATUS — QOrium Phase 1
Codex BHIMA: <RUNNING | IDLE | DONE | FAILED>
Pipeline progress: A1 ✓ A2 ✓ A3 ⏳ ... B1 ✓ ...
PM2 services online: <list> (was 1; target 5)
Library: <count> released (was 791; target 1500+)
CEO_PENDING_ASKS: <0 new | N new — listed below>
Next action: <what I'm doing | what I need from you | "all clear, sleep well">
```

---

## 2 — PRE-DECIDED AUTHORITY MATRIX (what dispatch-Claude can do without CEO)

### ✅ AUTO-APPROVE (do it, log it, don't ping CEO)

| Action | Rationale |
|---|---|
| File new CODEX_PENDING_*.md shard for any item in §11 OUT-OF-SCOPE of master shard that became unblocked | Queue replenishment |
| Update existing CODEX_PENDING_*.md shard with clarification, fix, or expanded spec | Reduces Codex friction |
| Read/write CEO_PENDING_ASKS.md to consolidate Codex's queued asks | Single-channel discipline |
| Send `talpro_notify(level="info", ...)` status pings (≤2/hour) | Keeps CEO informed without spam |
| Call `talpro_rakshak`, `rakshak_save`, `rakshak_consolidate` to drive audit cycles | Read/audit ops are safe |
| Call `sudhaarak_scan`, `sudhaarak_heal`, `talpro_sentinel_fleet` to keep infra healthy | Self-healing ops |
| Update memory files (project/feedback/reference types) | Long-horizon context |
| Update `session_save_state` at each checkpoint | Cross-session continuity |
| Write/update files under `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/` | Deliverables folder |
| Write/update files under `/opt/talpro-mcp-server/projects/_shared/` | Shared shard space |
| Stage queue replenishment shards per §6 below | Keep Codex fed |

### ⚠️ ESCALATE TO CEO (file in CEO_PENDING_ASKS + send `talpro_notify(level="warn", ...)`)

| Action | Why CEO needed |
|---|---|
| Production code change in non-QOrium product (HireIQ, Jharokha, Pramaan, etc.) | Different parent mission |
| Domain / DNS / SSL change | External-facing config |
| Third-party OAuth or secret rotation | Credential handling |
| GitHub repo creation, ownership change, branch protection edit | Access control |
| New PM2 service binding to port already in PORT_REGISTRY | Conflict risk |
| Public marketing copy claim (e.g., publishing a benchmark % to qorium.online) — if Codex emits one without clear backing per SO-24 | No-Fiction Rule |
| Codex emits "What to type next: PROVE [child]" mid-mission | Doctrine violation — paste back the Standing PROVE inheritance rule, do NOT relay to CEO |
| Rakshak verdict comes back NO-GO on critical Phase 1 item | CEO sees verdict first |

### ❌ DENY (do NOT do, send `talpro_notify(level="crit", ...)` if Codex requests it)

| Action | Reason |
|---|---|
| Anything in `_shared/NEVER_TOUCH.md` | Standing prohibition |
| Deletion of any live product process (talpro-temp, brahma, karya, heartbeat, MCP shadows, qorium-marketing) | Live product registry |
| Financial actions (payments, transfers, refunds, trades) | Apex rule — CEO only |
| Force-push to main/master on any repo | Banned by CTO Constitution |
| Promotion of /opt/mcp-shadow/ to canonical without explicit CEO sign-off | Separate ticket per memory |
| Editing the Constitution v2.0 (`09-QOrium-Constitution-v2.0.md`) | Locked clauses per Article XI |
| Disabling gitleaks, lint, or tsc gates | SO-15, SO-13 |
| Writing production code yourself (Claude Apex rule) | Codex's lane |

---

## 3 — TRUE BLOCKERS (consolidated CEO ask list)

These are the ONLY items dispatch-Claude can ping CEO about. Pile them into one `talpro_notify(level="warn", text="CEO ASKS (3): ...")` message after collecting; never drip individually.

| # | Ask | Default if CEO can't respond in 1h |
|---|---|---|
| 1 | GitHub push auth on VPS (carryover from prior session) | Codex continues committing locally; push deferred to next sprint |
| 2 | Serper.dev API key for anti-leak crawler production mode | Codex deploys with mock provider; flagged in §10 of master shard |
| 3 | Sentry DSN | Codex deploys without Sentry; flagged |
| 4 | ATS sandbox keys (Greenhouse, Workday, Ashby, Darwinbox) | Codex skips A8 smoke tests; documented as awaiting CEO-procured keys |
| 5 | Cloudflare API token (read-only zone, for A7 origin discovery) | Codex uses DNS + curl probes; documents what it can see |
| 6 | Production DB write credentials (for ingest in A1/B1/B2) | Codex stages to dev DB and flags |
| 7 | Two reference website URLs (for enterprise feature audit) | Audit deferred; main pipeline continues unaffected |

**If CEO responds with any credential or decision:** dispatch-Claude immediately files an UPDATE shard for the relevant CODEX_PENDING and notifies via `talpro_notify(level="info", ...)`.

---

## 4 — MONITORING CADENCE

A scheduled task named **`qorium-pipeline-keeper`** runs every 30 minutes (created at handoff). Each run:

1. Lists new files in `/opt/talpro-mcp-server/projects/_shared/` matching `CODEX_COMPLETION_QORIUM_*` or `CEO_PENDING_ASKS.md` (modified time > last run)
2. If a CODEX_COMPLETION shard appeared:
   - Parse the BALI Recap
   - Validate verdict (GO / hard-failure)
   - Send `talpro_notify(level=info|crit, text=...)` to CEO Telegram
   - Trigger queue replenishment per §6 below if queue empty + budget remaining
3. If CEO_PENDING_ASKS grew: send consolidated `talpro_notify(level="warn", text="CEO ASKS: ...")` once per 2 hours max
4. If `talpro_pm2_list` shows a new errored qorium-* service: `sudhaarak_heal`, then alert if not self-healed in 10 min
5. If 2 consecutive runs find no progress AND no completion shard: send `talpro_notify(level="warn", text="Codex appears idle — last activity X min ago")`
6. If 6 hours pass with no completion: send `talpro_notify(level="crit", text="Pipeline stalled — see /opt/talpro-mcp-server/projects/_shared/")`
7. Update `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/DISPATCH-STATUS-LOG.md` with each run's findings (one line per run)

---

## 5 — STOP-LOSS CONDITIONS (when to halt the pipeline)

If ANY of these trip, dispatch-Claude calls `talpro_notify(level="crit", ...)` AND stops queue replenishment AND waits for CEO:

- Rakshak run on qorium.online OR api.qorium.online OR admin.qorium.online returns 🔴 NO-GO ≤60/100
- Sudhaarak emits 2+ crit alerts within 30 min
- Disk >85% on KVM2 (`talpro_vps_status` check)
- Any deletion attempt targeting NEVER_TOUCH item
- Codex emits same error 3 times consecutively
- Codex thread is "DEAD" / unrecoverable

Otherwise continue.

---

## 6 — QUEUE REPLENISHMENT (next shards, in order)

When the master pipeline shard (`CODEX_PENDING_QORIUM_PHASE_1_COMPLETION_PIPELINE_2026-05-31.md`) reports DONE, the next-priority shards to enqueue are listed in:

`/opt/talpro-mcp-server/projects/_shared/QORIUM_PIPELINE_QUEUE_2026-05-31.md`

That file is the canonical queue. Dispatch-Claude pulls the next pending entry, expands it into a full CODEX_PENDING_*.md shard using the master shard's structure as template, and tells Codex (via a new chat prompt CEO will need to relay OR via a follow-up scheduled task) to pick it up.

**Pre-staged queue items (Lane C and beyond):**

| Pri | Lane | Item | Effort | Dependency |
|---|---|---|---|---|
| 1 | C1 | admin.qorium.online cutover from current origin to monorepo apps/admin scaffold (built in A9) | M | A9 complete |
| 2 | C2 | Stack-Vault first-customer onboarding flow (vault provisioning runbook, per-vault DB namespace, first paid contract test) | L | Bosch GCC LOI |
| 3 | C3 | Constitution Amendment v2.1 — formally codify multi-host topology (from A7 ADR) | S | A7 ADR exists |
| 4 | C4 | Dirty worktree triage on `/opt/talpro-mcp-server` (5 missing domains backfill done; remaining src/index.ts + src/tools/prahari-v2.ts unfinished work) | M | None |
| 5 | C5 | Wave 3 psychometric stage — process the 20 staged drafts through SME validation queue, queue for Reference Panel | M | Reference Panel ≥200 (human-bound) |
| 6 | C6 | AI Pair Coding format prototype per Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md | L | None |
| 7 | C7 | Reference website feature audit findings (TBD URLs from CEO) — extract enterprise-grade patterns | S-M | URLs received |
| 8 | C8 | Cloudflare/Nginx rate limiting deduplication (Rakshak follow-up from 2026-05-31 audit) | S | None |
| 9 | C9 | DKIM selector setup for email deliverability (Rakshak follow-up) | S | Mail provider chosen (CEO) |
| 10 | C10 | Sentry DSN provisioning + observability dashboards for all new services | M | Sentry DSN (CEO) |

When CEO responds with the 2 reference website URLs, dispatch-Claude:
1. Crawls each (via Bright Data CLI or Chrome MCP)
2. Extracts enterprise-grade features QOrium should consider
3. Cross-references with Constitution v2.0 + Three-SKU Architecture
4. Writes findings to `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/REFERENCE-AUDIT-2026-05-31.md`
5. If features are accepted (auto-approve if scope fits Phase 1-2; escalate if Phase 3+): expand C7 into a full CODEX_PENDING shard and inject into queue

---

## 7 — TELEGRAM PROTOCOL

Codex pings via `talpro_notify` (level info|warn|crit). Dispatch-Claude pings via `talpro_notify` too. Conventions:

| Level | When | Cadence cap |
|---|---|---|
| `info` | Routine status, BALI Recap, GO verdict | 2/hr max |
| `warn` | Consolidated CEO_PENDING_ASKS, stalled-Codex alerts | 1/2hr max |
| `crit` | NO-GO Rakshak, hard failure, NEVER_TOUCH attempt, disk crisis, security incident | Immediate, no cap |

Every Telegram message **starts with a discriminator** so CEO can triage from phone:
- `🛰️` — dispatch status
- `🛡️` — Rakshak verdict
- `📋` — CEO asks
- `⚠️` — stalled / degraded
- `🚨` — crit / immediate attention

---

## 8 — CONTEXT FILES (the dispatch-Claude library)

| File | Purpose |
|---|---|
| `/opt/talpro-mcp-server/projects/_shared/CODEX_PENDING_QORIUM_PHASE_1_COMPLETION_PIPELINE_2026-05-31.md` | Master shard — what Codex is shipping |
| `/opt/talpro-mcp-server/projects/_shared/CODEX_PENDING_PROVE_DOCTRINE_REINFORCEMENT_2026-05-31.md` | Codex behavior patch (filed earlier today) |
| `/opt/talpro-mcp-server/projects/_shared/CODEX_PENDING_RAKSHAK_QORIUM_ALLOWLIST_2026-05-31.md` | Allow-list shard (already shipped) |
| `/opt/talpro-mcp-server/projects/_shared/CODEX_COMPLETION_RAKSHAK_QORIUM_ALLOWLIST_2026-05-31.md` | First completion shard — reference for structure |
| `/opt/talpro-mcp-server/projects/_shared/QORIUM_PIPELINE_QUEUE_2026-05-31.md` | Queue of next-priority shards (this file) |
| `/opt/talpro-mcp-server/projects/_shared/CEO_PENDING_ASKS.md` | Consolidated CEO unblock list |
| `/opt/talpro-mcp-server/projects/_shared/STANDING_PROVE_DOCTRINE_2026-05-24.md` | PROVE inheritance rule |
| `/opt/apps/qorium-marketing/09-QOrium-Constitution-v2.0.md` | QOrium operating system (1037 lines, 25 SOs, 92-pt gate) |
| `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/RAKSHAK-CEO-Report-2026-05-31.md` | Today's marketing-site Rakshak GO 88/100 |
| `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/RAKSHAK-CTO-Report-2026-05-31.md` | Same, full technical detail |
| `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/QORIUM-COMPLETENESS-AUDIT-2026-05-31.md` | Spec-vs-live gap analysis (52% Phase 1, 28% Phase 4) |
| `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/DISPATCH-STATUS-LOG.md` | Rolling log of dispatch-keeper runs |

---

## 9 — RESUME PROTOCOL FOR NEW CLAUDE SESSIONS

Any new Claude session (cowork, dispatch, mobile, desktop) wanting to pick up this mission:

1. Read `MEMORY.md` index — entries for qorium launch + PROVE doctrine + dirty worktree are now in place
2. Read this DISPATCH-HANDOFF doc
3. Read latest `session_load_state` or `session_resume(session-2026-05-31T03-42-00-680Z)` for the prior closeout state
4. Read latest `DISPATCH-STATUS-LOG.md` for current state
5. Skim `CEO_PENDING_ASKS.md` for outstanding asks
6. Then operate per §2 authority matrix

---

## 10 — WHEN MISSION COMPLETES (success exit)

When Codex's final BALI Recap arrives AND both Rakshak verdicts come back GO ≥85/100:

1. Dispatch-Claude consolidates a **CEO Phase-1-Complete Report** at `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/PHASE-1-COMPLETION-REPORT-2026-05-31.md`. Include: per-pillar new % completion, before/after PM2 fleet, before/after library count, all 6 auto-fail criteria status, what's queued for Lane C+.
2. `talpro_notify(level="info", text="🟢 QOrium Phase 1 COMPLETE — GO verdict on api + admin. Report at /Users/.../PHASE-1-COMPLETION-REPORT-2026-05-31.md. Queue: Lane C ready (C1-C10).")`
3. Disable the `qorium-pipeline-keeper` scheduled task OR retarget it to monitor Lane C readiness
4. Update memory entry `project_qorium_launch_2026_05_31` with completion timestamp + final stats
5. `session_save_state` with `phase: PHASE_1_COMPLETE_PHASE_2_READY`

---

## 11 — IF I'M LOST OR THE PIPELINE IS BROKEN

Dispatch-Claude's circuit-breaker: if you find yourself unable to make progress for 2 consecutive runs (Codex stalled + CEO_PENDING_ASKS unanswered + no new completion shards):

1. Run a full Sudhaarak + Sentinel + Rakshak status sweep
2. Diff against last known good (this handoff's state)
3. Write a `DISPATCH-INTERVENTION-REQUEST.md` with the diff + recommended manual step
4. `talpro_notify(level="warn", text="🛰️ Dispatch needs CEO touch — see DISPATCH-INTERVENTION-REQUEST.md")`
5. STOP queue replenishment, wait for CEO response

---

*Authored by Claude (Cowork, BHIMA) 2026-05-31 evening IST — handoff to dispatch mode before CEO travel. The mission is in motion; Codex is executing; the queue won't go dry while the keeper runs.*
