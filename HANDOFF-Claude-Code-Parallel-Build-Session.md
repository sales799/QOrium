# QOrium — Complete Handoff for a Parallel Claude Code Build Session

**Purpose:** Hand this entire document to a fresh Claude Code session in your terminal. That session will build the QOrium codebase in parallel, while the Cowork session (separate window) keeps doing strategy, ops, MANTHAN research, and CEO coordination. The two sessions sync via the QOrium folder + QUEUE.md + task_plan.md.

**Read this first, top to bottom. Do not skip.**

---

## 0. What you (Claude Code) are doing here

You are the **builder** for QOrium — Talpro Universe's Question-Bank-as-a-Service venture. The strategy, blueprint, architecture, schema, API spec, and Phase 0/1 punchlist are already written. Your job is to turn those specs into running, deployable code.

You are NOT redesigning anything. You are NOT renegotiating scope. The Constitution v2.0 + CTO Architecture v1.0 are binding. If you think a spec is wrong, write the concern into `_QORIUM_BUILD_LOG.md` (defined below) and keep building per spec — flag it, don't fork.

The Cowork session (a different Claude, running in the desktop app) handles:
- Strategy, market research, MANTHAN deep-work
- CEO action cards (Part B browser walks + Part C physical actions)
- Coordinating with Talpro India delivery team (Customer Zero)
- Updating Constitution / Implementation Strategy / dashboards
- Live progress tracker artifact

You handle:
- All actual code (services, APIs, web app, admin console, content engine, anti-leak engine)
- Database migrations beyond the initial schema
- Tests
- CI/CD wiring
- Local dev environment setup
- Deployment-ready packaging (the deploy itself happens via VPS MCP from Cowork OR you, depending on credentials)

---

## 1. Project context (must-read before code)

QOrium = the world's first **role-graph-native** question-bank-as-a-service. It serves 3 buyer types via 4 SKUs, with Talpro India as Customer Zero from Day 1.

**SKUs (build priority order):**

1. **ReadyBank** — pre-built, calibrated question library. REST API + bulk export (CSV/JSON/HackerRank format). MVP target: 5,000 validated questions across 20+ programming languages by Month 3. **THIS IS WHAT YOU BUILD FIRST.**
2. **JD-Forge** — real-time JD-to-question pipeline. Customer pastes a JD, gets a custom question pack in <60 seconds. Build after ReadyBank is shipping.
3. **Stack-Vault** — per-client isolated question stores with anti-leak protection. Build last in Phase 1.
4. **Anti-Leak Engine** — crawls public sources (Glassdoor, LeetCode discuss, GitHub gists, Reddit) and matches against released questions, auto-rotates compromised items. Build alongside ReadyBank from Month 2.

**Buyer types:** (1) ATS/HR-Tech platforms (HackerRank, CodeSignal, etc. — we power their content), (2) Enterprises (Bosch GCC is Logo #1 target), (3) IT staffing firms (Talpro India = Customer Zero).

**The differentiating moat:** role-graph data model + IRT-calibrated difficulty + active anti-leak. Not "another question bank" — a role-aware, calibrated, defended one.

---

## 2. Required reading (in this order, before writing any code)

All paths are absolute on Bhaskar's Mac. If you're running on a different machine, replace `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/` with wherever you cloned the repo to.

| # | File | Why |
|---|------|-----|
| 1 | `09-QOrium-Constitution-v1.0.md` | Binding operating doc. 7 offices, 20 Standing Orders, 92-pt quality gate. Read all of it. |
| 2 | `CONSTITUTION-RATIFICATION-RECORD-v2.0.md` | What was ratified and when. |
| 3 | `04-QOrium-Blueprint-v1.md` | Product blueprint. What we're building and why. |
| 4 | `05-QOrium-Three-Use-Cases-SKU-Architecture.md` | How ReadyBank / JD-Forge / Stack-Vault diverge. |
| 5 | `07-CTO-Architecture-v1.md` | **The technical bible.** 13 sections. Tech stack, schema, API, deployment, security. This is your spec sheet — code from this. |
| 6 | `task_plan_phase0_phase1.md` | Phase 0 + Phase 1 punchlist. Your work items live in §G (Engineering). |
| 7 | `infra/B7-postgres-migrations/0001_initial_schema.sql` | Initial schema — already authored, run this first. |
| 8 | `infra/B5-CI-Pipeline.github-actions.yml` | CI config — wire this into the repo. |
| 9 | `infra/B6-gitleaks-config.yaml` | Pre-commit secret scanning. |
| 10 | `infra/B10-ecosystem.config.js` | PM2 process map for production. |
| 11 | `infra/Anti-Leak-Engine-v0-Design.md` | Anti-leak spec. |
| 12 | `infra/JD-Forge-v0-Design.md` | JD-Forge spec. |
| 13 | `infra/IRT-Calibration-Pipeline-v0-Spec.md` | IRT scoring spec — critical for SO-21. |
| 14 | `customer-zero/Talpro-Recruiter-Onboarding-QnA.md` | What Customer Zero needs from the API. |
| 15 | `customer-zero/Wave-1-Question-Batch-Plan.md` | First 1,000 questions roadmap. |
| 16 | `governance/Quality-Gate-92pt-Scorecard.md` | What "done" means before any release. |

---

## 3. Tech stack (locked — do not deviate)

From CTO Architecture §2:

**Runtime & language:**
- Node.js 20 LTS + TypeScript (strict mode, no `any` without justification)
- Express 4 (API framework)
- ESM modules

**Data:**
- PostgreSQL 16 (primary)
- Redis 7 (cache, queue, sessions, rate limit)
- S3-compatible object storage (Cloudflare R2 in production, MinIO in dev)
- Judge0 (code execution sandbox; self-hosted via Docker)

**AI layer:**
- Claude Opus 4.6 via Anthropic SDK (primary draft + critique)
- GPT-5 via OpenAI SDK (fallback, divergent angle)
- Gemini Pro via Google Generative AI SDK (third opinion on contested items)
- **NO Ollama on VPS** — banned per April 16 incident. Local inference only on Mac Mini M4 Pro.

**Frontend:**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui + Aceternity UI + Magic UI + Motion v12
- Banned: Inter, Roboto, Arial, MUI, Ant Design, Chakra, Bootstrap, default shadcn theme colors

**Infra:**
- Hostinger VPS (KVM tier — read live with `talpro_vps_status` from Cowork; do NOT hard-code "KVM2 8GB" or "KVM4 16GB", verify)
- Nginx (reverse proxy, rate limit 10r/s burst 20)
- PM2 (process manager, cluster mode for stateless services)
- Let's Encrypt SSL on every subdomain
- GitHub Actions CI/CD
- gitleaks pre-commit + CI secret scan
- OpenTelemetry + Grafana Cloud + Sentry

**Quality bars (non-negotiable, these block merges):**
- Zero TypeScript errors (`tsc --noEmit` must pass)
- Zero ESLint errors
- Test coverage ≥80% on services touching data
- All public API responses use RFC 7807 Problem Details for errors
- Pino structured logging
- Security headers on every response (HSTS, X-Content-Type-Options, X-Frame-Options, CSP)
- No secrets in git (gitleaks must pass)

---

## 4. Repo layout (build this on Day 1)

```
qorium/
├── apps/
│   ├── web/                      # Next.js public site (qorium.online)
│   ├── app/                      # Customer console (app.qorium.online) — JD-Forge UI, exports
│   ├── admin/                    # Internal admin (admin.qorium.online) — SME workflow, calibration panel
│   └── partners/                 # Partner portal (partners.qorium.online) — platform integrations
├── services/
│   ├── readybank/                # ReadyBank Service (REST API: search, retrieve, export)
│   ├── jdforge/                  # JD-Forge Service (real-time AI pipeline)
│   ├── stackvault/               # Stack-Vault Service (per-client isolation)
│   ├── antileak/                 # Anti-Leak Engine (scheduled crawl + match + rotate)
│   ├── content-engine/           # 7-stage pipeline orchestrator (Spec → AI → Critique → SME → Calibrate → Release → Post-Deploy)
│   └── gateway/                  # API gateway (Nginx config + Express auth middleware)
├── packages/
│   ├── db/                       # Prisma or Drizzle schema + migrations + seed
│   ├── ai/                       # Anthropic + OpenAI + Gemini wrappers, prompt templates
│   ├── irt/                      # IRT calibration math (1PL → 2PL roadmap)
│   ├── role-graph/               # Role-graph traversal + skill-edge queries
│   ├── auth/                     # API key auth, OAuth2, JWT
│   ├── shared-types/             # TypeScript types shared across services
│   └── ui/                       # shadcn/ui + Aceternity + Magic UI components shared across apps
├── infra/
│   ├── docker/                   # Dockerfiles per service + docker-compose.dev.yml
│   ├── nginx/                    # Nginx site configs per subdomain
│   ├── pm2/                      # ecosystem.config.js (already exists at QOrium/infra/B10-)
│   ├── migrations/               # SQL migrations (0001 already exists)
│   ├── ci/                       # GitHub Actions workflows (B5 already exists)
│   └── ops/                      # Backup scripts, runbooks, alert rules
├── tests/
│   ├── e2e/                      # Playwright end-to-end (full API flows)
│   ├── integration/              # Service-level integration tests
│   └── load/                     # k6 load tests
├── scripts/
│   ├── seed-questions.ts         # Seed Wave 1 batch from SME-validated YAML
│   ├── irt-recalibrate.ts        # Nightly IRT recalibration job
│   └── anti-leak-scan.ts         # Weekly anti-leak crawl
├── .github/workflows/            # Symlinked to infra/ci/
├── .env.example                  # All required env vars, no real values
├── .gitignore
├── .gitleaks.toml                # Already exists at QOrium/infra/B6-
├── package.json                  # Root pnpm workspace
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
└── _QORIUM_BUILD_LOG.md          # Your running build log (defined in §7)
```

Use **pnpm workspaces** (not npm, not yarn). Monorepo. Root `package.json` declares workspaces; each app/service/package has its own `package.json`.

---

## 5. Build sequence — what to ship in what order

Pick the next unfinished item and build it. Do not skip ahead. Each item ends with "definition of done" — when you can tick all boxes, mark it ✅ in `_QORIUM_BUILD_LOG.md` and pick the next.

### Sprint 0 — Repo + Dev Environment (target: Day 1–3)

**Item 0.1 — Bootstrap monorepo**
- pnpm workspace at root
- TypeScript base config with strict mode
- ESLint + Prettier shared configs in `packages/eslint-config-qorium`
- Husky pre-commit: prettier + eslint + gitleaks
- `.env.example` with every variable referenced anywhere in the codebase
- Done when: `pnpm install` works, `pnpm typecheck` passes (zero files yet, zero errors), `git commit` runs hooks.

**Item 0.2 — Local dev orchestration**
- `infra/docker/docker-compose.dev.yml` brings up: Postgres 16, Redis 7, MinIO (S3-compatible), Judge0
- Make targets: `make dev-up`, `make dev-down`, `make dev-reset`
- Done when: `make dev-up` brings up all 4 services and they're reachable on documented ports.

**Item 0.3 — Database package**
- `packages/db` with Drizzle ORM (preferred over Prisma for performance + raw SQL escape hatch)
- Run `infra/migrations/0001_initial_schema.sql` via Drizzle migrator
- Type-safe query helpers for all tables in CTO Architecture §5.1
- Done when: migration runs clean against fresh Postgres, types generated, basic CRUD works in a smoke test.

### Sprint 1 — ReadyBank API alpha (target: Day 4–14)

**Item 1.1 — `services/readybank` skeleton**
- Express + TypeScript app
- Health endpoint `GET /healthz` returns 200 + version + git SHA
- Pino logger
- Sentry instrumentation
- Done when: service starts via PM2 in dev, healthz returns 200, log lines are JSON.

**Item 1.2 — API key auth middleware**
- `packages/auth/api-key.ts`: validates `X-Talpro-API-Key` header against `api_keys` table
- Per-key rate limit via Redis (default 100 req/min, override per key)
- 401 on invalid, 429 on over limit, both as RFC 7807
- Done when: integration test proves 200 with valid key, 401 without, 429 after burst.

**Item 1.3 — `GET /v1/questions` (search + retrieve)**
- Query params per CTO Architecture §6: `role`, `skill`, `difficulty`, `language`, `format`, `tags`, `limit`, `cursor`
- Cursor pagination (not offset — cursors are stable under writes)
- Returns `Question[]` per `packages/shared-types/question.ts`
- Done when: returns documented results for at least 4 query combinations, p50 < 100ms with seeded data.

**Item 1.4 — `POST /v1/questions/export` (bulk export)**
- Accepts a question filter + format (`csv` | `json` | `hackerrank-yaml`)
- Streams output (not buffered) for large exports
- Audit-logs every export with key, timestamp, filter, row count
- Done when: 10k-row export streams without memory blowup, all 3 formats validate against their respective schemas.

**Item 1.5 — Seed Wave 1 batch 1 (1,000 questions)**
- `scripts/seed-questions.ts` reads from `customer-zero/Wave-1-Question-Batch-Plan.md` + a YAML file the SME Lead will populate
- Until SME Lead is hired, generate placeholder questions via Claude Opus 4.6 in batches of 50, with a `SEED=true` flag so they can be replaced
- Done when: 1,000 questions in DB, all pass JSON schema validation, role-graph edges populated.

### Sprint 2 — Admin Console (target: Day 15–28)

**Item 2.1 — `apps/admin` Next.js scaffold**
- Auth via OAuth2 (Google Workspace for staff)
- shadcn/ui + Aceternity + Magic UI per Constitution
- Layout: sidebar + header + main, dark mode default
- Done when: staff can log in via Google, see empty dashboard.

**Item 2.2 — SME review queue UI**
- Lists questions in `status='SME_REVIEW'`
- Per-question view: full question, options, expected answer, AI critique notes, role-graph context
- Approve / Reject / Request-changes actions write to `question_reviews` table
- Done when: SME contractor can review 10 questions in <5 min per question.

**Item 2.3 — Calibration panel (item-stats view)**
- For each released question: pass rate, time-to-solve distribution, IRT difficulty, leak signal score
- Bulk-rotate button (creates new variant + retires old) — guarded by 2-person rule (SO-15)
- Done when: panel loads 1,000 questions in <2s, rotate flow tested end-to-end.

### Sprint 3 — Content Engine (target: Day 29–60)

Implement the 7-stage pipeline per CTO Architecture §3. Each stage is a separate worker (BullMQ on Redis) that picks up jobs from the previous stage's queue.

Stages: **Spec → AI Draft → Self-Critique → SME Review → Calibrate → Release → Post-Deploy**

**Item 3.1 — Spec worker**
- Input: `{role_id, skill_id, difficulty_target, count, language?}`
- Output: written spec doc to `question_specs` table + enqueue AI Draft jobs
- Done when: produces 50-question specs in <30s.

**Item 3.2 — AI Draft worker**
- Calls Claude Opus 4.6 with a templated prompt, falls back to GPT-5 on rate limit / 5xx
- Strict JSON output validation
- Done when: 95%+ first-call success rate on draft-validation against schema.

**Item 3.3 — Self-Critique worker**
- Sends draft back to a different model (Gemini for diversity)
- Critique JSON: `clarity`, `correctness`, `difficulty`, `leak_risk`, `bias_flags`
- Auto-reject if any flag fires; otherwise push to SME Review
- Done when: rejection rate measured, false-positive rate <10% on a 200-question audit.

**Item 3.4 — SME Review** (uses 2.2 UI, no new code beyond the queue glue)

**Item 3.5 — Calibrate worker**
- Sends approved questions to a reference panel (TBD; placeholder = sample from Talpro candidate pool)
- Computes 1PL Rasch difficulty after ≥30 responses; mark `irt_calibrated=true`
- Done when: nightly job recalibrates and updates `irt_difficulty` column.

**Item 3.6 — Release worker**
- Promotes calibrated questions to `status='RELEASED'`, makes them queryable via ReadyBank API
- Writes audit entry
- Done when: a question can be traced from spec → release with full audit trail.

**Item 3.7 — Post-Deploy worker**
- Schedules anti-leak scans on the question (weekly for first month, monthly after)
- Schedules IRT recalibration triggers (every 100 new responses)
- Done when: a released question gets its first anti-leak scan within 7 days.

### Sprint 4 — Anti-Leak Engine v0 (target: Day 45–75, parallel with Sprint 3)

Per `infra/Anti-Leak-Engine-v0-Design.md`. Uses Serper.dev for crawl, Claude for semantic match, then auto-creates rotation tasks.

### Sprint 5 — JD-Forge service (target: Day 60–90)

Per `infra/JD-Forge-v0-Design.md`. Real-time pipeline; tighter latency budget. Build only after ReadyBank is shipping production traffic.

---

## 6. Coordination protocol with the Cowork session

You and the Cowork session **must not** both edit the same files at the same time. Lock discipline:

**Cowork session owns (Cowork edits, you read-only):**
- All strategy docs (00-* through 10-*, IMPLEMENTATION-STRATEGY-*, Constitution)
- `task_plan_phase0_phase1.md` — Cowork updates ⏳ → ✅ as Phase 0 actions complete
- `_shared/QUEUE.md` (if/when created across the Talpro Universe)
- MANTHAN sessions
- The Cowork live progress artifact

**You (Claude Code) own (you edit, Cowork reads):**
- All code under the QOrium repo (apps/, services/, packages/, infra/, tests/)
- `_QORIUM_BUILD_LOG.md` (your running log — see §7)
- Any new specs you draft as you uncover gaps (file them under `infra/CTO-deltas/` so they're clearly yours)

**Both can edit (with explicit handoff):**
- `infra/B7-postgres-migrations/` — new migrations are yours, but Cowork may add comments
- New design docs under `infra/` — coordinate via the build log

**Sync points:**
- Every time you finish a Sprint item, write a one-line entry in `_QORIUM_BUILD_LOG.md` with the date, item ID, evidence (commit SHA + test output)
- The Cowork session reads `_QORIUM_BUILD_LOG.md` at the start of every session to know where the code stands
- If you are blocked on a CEO action (domain not registered, API key not procured), write `BLOCKED: <action>` in the build log so Cowork can surface it on the live tracker

---

## 7. The build log — `_QORIUM_BUILD_LOG.md`

Create this file on Day 1. Append to it on every meaningful event. Format:

```markdown
# QOrium Build Log

A running log of the parallel Claude Code build session.
Cowork session reads this to know what's been built.

---

## 2026-05-03 — Sprint 0 kickoff

- ✅ 0.1 Monorepo bootstrap. Commit: a1b2c3d. `pnpm typecheck` passes.
- ✅ 0.2 Dev orchestration. `make dev-up` brings up postgres+redis+minio+judge0.
- ⏳ 0.3 Database package. Drizzle scaffolded, migration 0001 applied; query helpers TODO.
- BLOCKED: B11 (Anthropic API key) — Cowork session, please push CEO via Action Card.

## 2026-05-04 — ...
```

Keep entries short. The detail is in git history; this log is the index.

---

## 8. Quality gate — every PR must clear this before merge

From Constitution Article VII (Gatekeeper) and the 92-pt scorecard:

1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero errors, zero warnings
3. `pnpm test` — all green, coverage ≥80% on changed files
4. `gitleaks detect` — zero secrets
5. `pnpm build` — clean build for every workspace
6. PR description explains: what, why, test plan, rollback plan
7. At least one auto-test exercises the happy path of any new endpoint
8. Security headers validated on any new HTTP surface
9. RFC 7807 error format on all new error paths
10. Pino structured log on any new significant code path

If you ship code without one of these, log it in the build log as a known debt and create an item to fix it before the next phase gate.

---

## 9. What to do when you hit a wall

**Spec is ambiguous:** Read the closest spec doc twice. If still ambiguous, code the most defensible interpretation, write `CTO-DELTA-<topic>.md` under `infra/CTO-deltas/` explaining the interpretation, and flag in build log. Do not stop.

**A required service is down (Anthropic API, Postgres, etc.):** Retry once, then move to the next unblocked item. Log the blocker.

**You discover the Constitution / Architecture is wrong:** Write the concern to `infra/CTO-deltas/CONSTITUTIONAL-CONCERN-<topic>.md`. Continue building per current spec. The Cowork session + CEO will adjudicate via MANTHAN.

**You finish all queued work:** Read the next sprint section in this file. If all sprints are done, run a self-audit against the 92-pt gate, write findings to a Rakshak-style audit doc, and stop.

---

## 10. Your first prompt (paste this into Claude Code to start)

```
You are taking over the QOrium parallel build session per the handoff at:
/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/HANDOFF-Claude-Code-Parallel-Build-Session.md

Read that handoff file completely. Then:

1. Read the required-reading list in §2 of the handoff in order.
2. Bootstrap the repo per §4 and Sprint 0 §5.
3. Start `_QORIUM_BUILD_LOG.md` per §7 and append your first entry.
4. Begin Sprint 0 Item 0.1.
5. Continue autonomously through Sprint 0, then Sprint 1.
6. Stop and ask me only if you hit a wall the handoff §9 doesn't cover.

Do not redesign anything. Do not renegotiate scope. Build per spec.
The Cowork session is running in parallel — do not edit files §6 says it owns.

Confirm you have read the handoff + at least the CTO Architecture (07-CTO-Architecture-v1.md) before writing any code.
```

---

## 11. What the Cowork session will be doing in parallel

So you know what to expect from the other side of the wall:

- Pushing CEO through Phase 0 §A (Capital & Legal) and §B (Infrastructure) action cards — registering domains, opening bank account, procuring API keys
- Driving Bosch GCC outreach (Phase 0 §E)
- Coordinating Talpro India Customer Zero handoff (Phase 0 §D)
- Drafting JDs and posting them (Phase 0 §C — most JDs already exist under `jds/`, just need posting)
- Running MANTHAN sessions on contested decisions (e.g., "1PL vs 2PL IRT first?" "self-host Judge0 vs paid?")
- Updating the live progress dashboard artifact every session
- Updating Constitution / Implementation Strategy if the CEO ratifies amendments

The two of us only collide on `infra/` files (you write code, Cowork writes specs). Coordinate via the build log.

---

## 12. Success criteria (Phase 1 IdeaForge re-gate, Month 3)

By Month 3 your output should make these true (per Constitution Article IX):

- ✅ ReadyBank API alpha live, production traffic from at least 3 logos
- ✅ 5,000 validated questions in DB, IRT-calibrated
- ✅ 20+ programming languages supported (Judge0 sandbox verified per language)
- ✅ Bulk export working in CSV + JSON + HackerRank format
- ✅ Anti-Leak Engine v0 running weekly, with at least one rotation triggered end-to-end
- ✅ Admin console used daily by SME Lead
- ✅ Talpro India Customer Zero pushing 100+ candidates through QOrium

If those are true, the IdeaForge re-gate passes ≥20/24 and Phase 2 unlocks. If not, we hold and remediate.

---

**End of handoff. Now go build.**
