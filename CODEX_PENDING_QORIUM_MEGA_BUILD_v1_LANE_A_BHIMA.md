# CODEX_PENDING — QORIUM MEGA BUILD v1.0 — LANE A — BHIMA (Backend)

**You are:** Codex BHIMA (Mac Pro, account `bhaskar@talpro.in`).
**Counterpart:** Codex ARJUN runs Lane B (marketing site) in parallel. Stay out of `qorium-marketing` repo. ARJUN stays out of `qorium-app` / `qorium-api`.
**You will not ask Claude or the CEO for permission per task.** Read this shard, plan, execute, prove. Single consolidated `founder_request` only for true blockers (credentials, payments, DNS).

---

## 0. APEX READS (do these first, every session)

1. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/QORIUM_MEGA_BUILD_v1.0.md` — master spec, source of truth
2. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/BACKEND_MODULES_360_v1.md` — your module list M1–M23
3. `/Users/talprouniversepro/Documents/Claude/Projects/QOrium/GAP_ANALYSIS_2026-05-31.md` — competitive context
4. MANTHAN session `9194eed8` — `manthan_read` then `manthan_status`
5. PM2 ground truth — `talpro_pm2_list` (do not trust prior memory for service state)
6. CTO Constitution — `talpro_cto_constitution(part: "quality-gate")` before every phase exit

---

## 1. PHASE 1 SCOPE — Ship now, end-to-end (CORN mode)

**Goal:** authenticated user composes assessment from 25-skill seed library, sends to one candidate via signed link, receives AI-graded results with reasoning trace + IRT placeholders.

**Modules in scope this run:** M1.A (Assessment Builder) · M1.B (Library seed, 25 skills × 10 questions each = 250 items) · M2 (Coding sandbox, JS/Python/Java first) · M4 v0.1 (AI grader, single-pass OpenRouter) · M12 (Skill taxonomy, full 150-node seed from GAP_ANALYSIS §C) · M21 (Audit log, mandatory).

**Out of scope this run:** M3 sims, M5 cognitive, M6 video, M7 chatbot, M8–M10, M11 anti-cheat, M13 JD-Forge, M14 IRT engine, M15+ enterprise.

---

## 2. REPO + INFRA SETUP

- Create org repo `qorium-app` (Next.js 16 App Router, TypeScript strict, NodeNext, extensionless imports under apps/web — lesson from prior incidents).
- Monorepo layout (Turborepo or Nx, your call):
  - `apps/web` — candidate + recruiter UIs (Next.js 16)
  - `apps/api` — Fastify/tRPC API
  - `apps/grader-worker` — BullMQ worker for M4
  - `apps/sandbox-bridge` — proxy to Judge0/Piston on BHIMA tunnel
  - `packages/db` — Drizzle ORM + migrations
  - `packages/auth` — NextAuth setup
  - `packages/taxonomy` — M12 skill graph seed
  - `packages/ui` — shared shadcn/ui components (compatible with marketing repo styling)
- Postgres 16: local dev via Docker; prod on VPS (or managed if Lakshmi-Kosh approves the spend — file `founder_request` if so).
- Redis: reuse existing VPS Redis (port from `_shared/PORT_REGISTRY.md` if present, else allocate fresh).
- Sandbox containers (Judge0 or Piston): run on BHIMA, expose via Cloudflare tunnel `sandbox.talpro.in` (or chosen subdomain). Keep off VPS.

---

## 3. PER-MODULE EXECUTION

For each module: build → test → migrate → deploy → smoke → watchdog. Then move on.

### M12 — Skill taxonomy seed (build FIRST — others depend on it)
1. Parse the TC `/skill-library` extract from `GAP_ANALYSIS_2026-05-31.md` §C.
2. Build `packages/taxonomy/seed.json` with 150+ skill nodes, hierarchy (category → skill → sub-skill), tags.
3. Drizzle migration: `skill` table + `skill_alias` (for synonym matching).
4. Migration applied on dev + prod.
5. Expose `GET /api/v1/skills` (paginated, cacheable).
6. Evidence: count >= 150 on `/api/v1/skills?stats=true`.

### M21 — Audit log (build SECOND — needed before any grade can be issued)
1. `audit_log` table: append-only, no UPDATE/DELETE, partitioned by org_id+day.
2. Helper `auditLog(event, actor, payload_hash, refs)` used by every mutating API call.
3. Trigger: protect against UPDATE/DELETE on `audit_log` at DB level.
4. Evidence: insert 10 rows, attempt one UPDATE — must fail.

### M1.A — Assessment Builder
1. Schema: `assessment`, `section`, `question`, `question_option`.
2. Builder UI in `apps/web/(recruiter)/assessments/new`.
3. Question types v1: MCQ, multi-select, short-answer, code-question.
4. Preview mode renders candidate view.
5. Save → produces signed shareable link (HMAC-signed, expiring).
6. Evidence: create→preview→save→share→complete on Playwright e2e.

### M1.B — Library seed (25 skills × 10 items)
1. Generate 250 seed questions. Two paths — pick the faster:
   - (a) LLM-author with human SME review (CEO call — file `founder_request` if SMEs needed)
   - (b) Curate from public Creative-Commons banks (verify licensing) + LLM gap-fill
2. Each item has: stem, options/answer, correct_answer, explanation, skill_id (M12), placeholder IRT params (a=1.0, b=0.0, c=0.25 until M14 calibrates).
3. "Clone from library" CTA in M1.A creates a new assessment pre-populated.
4. Evidence: library page returns 25 cards; clone flow works.

### M2 — Coding sandbox (JS/Python/Java)
1. Judge0 or Piston container running on BHIMA.
2. Cloudflare tunnel exposed at `sandbox.talpro.in` (or chosen).
3. `apps/sandbox-bridge` validates language, enforces 10s wall-clock + 256MB memory cap, signs request, forwards to tunnel.
4. Monaco editor in candidate view for code-questions.
5. Run-button submits → returns stdout/stderr/time/memory.
6. Evidence: fizzbuzz in all 3 languages returns expected output.

### M4 v0.1 — AI grader (single-pass OpenRouter)
1. BullMQ queue `grade-answer`.
2. Worker pulls answer → builds rubric prompt → calls OpenRouter (default to a cheap model; allow per-org override) → parses JSON response containing `score`, `reasoning`, `confidence`.
3. Persists `answer.grade`, `answer.reasoning_trace_ref` (R2 object), `answer.confidence`.
4. **Every grade emits an audit_log row** (M21 integration).
5. **Never return a bare score** — always with reasoning + confidence band.
6. Evidence: grade 20 short-answer + 10 code answers; SME spot-check ≥ 85% agreement on a sample of 10.

---

## 4. QUALITY GATES (before claiming Phase 1 done)

- `npm run build` clean across monorepo
- `next build` clean for `apps/web` (do NOT trust tsc alone)
- `npm test` green (unit + e2e)
- Security headers verified on every public route via `curl -I`
- Rate-limit verified (10r/s burst 20)
- Gitleaks clean in CI
- Pino structured logs flowing to existing fleet
- Watchdog added for each new PM2 service via `talpro_watchdog_add`, then watchdog run confirmed
- Rakshak re-audit run — target ≥ 85/100 to mark Phase 1 exit
- Atomic-release pattern used for all deploys (build in /tmp → mv to `releases/<SHA>/` → flip `current` symlink → `pm2 reload --update-env`)

---

## 5. FORBIDDEN

- ❌ Ollama on VPS (April 16 incident — runs on BHIMA only)
- ❌ Secrets in code (`.env` + gitleaks — verified in CI)
- ❌ `next build` or `rm -rf .next` inside live `/opt/apps/qorium-*` dir
- ❌ Sourcing env after build (NEXT_PUBLIC_* must bake into the bundle)
- ❌ Silent try/catch (surface both branches in thrown errors — Turnstile-incident lesson)
- ❌ Marketing copy promises before the backend module is live (per spec §5)
- ❌ Touching ARJUN's repos (`qorium-marketing`, marketing assets)
- ❌ Asking CEO mid-flight ("PROVE me" violations were a real pattern on the 2026-05-31 Rakshak run — see memory `feedback_prove_doctrine_codex_drift_2026_05_31`). Consolidate one founder_request at end.

---

## 6. COORDINATION WITH LANE B (ARJUN)

- `project_work_lock` before touching any file in `_shared/`
- Marketing surface mentions deferred until backend module ships (per master spec §5)
- If Lane B asks for an API endpoint not yet built, file a CODEX_PENDING delta shard for next sprint; do NOT block on it

---

## 7. CHECKPOINT CADENCE

- After each module exit: `manthan_save(sessionId="9194eed8", stage="bhima-progress-<module>.md", content=<evidence>)`
- After Phase 1 full exit: `manthan_save(sessionId="9194eed8", stage="blueprint.md", content=<full evidence>)`
- After every session: `session_save_state` with project="qorium", phase="phase1-backend", summary, currentTask, nextAction

---

## 8. EVIDENCE-FIRST CLOSE

Final CEO report at Phase 1 exit must include:
- PM2 list showing new qorium-* services online
- DB row counts (skills, questions, assessments, attempts, grade_decisions)
- 10 sample audit_log rows
- 1 graded candidate end-to-end with reasoning trace excerpt
- Rakshak re-audit score
- Phase 2 readiness statement (M13 JD-Forge + M14 IRT engine queued)

That is the bar. Ship to it. Then resume Phase 2 without asking.
