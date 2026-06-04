# QORIUM — Assessment Delivery + Grading Loop v1 (PRAROOP spec)

**Status:** LOCKED for build · single-brain plan · 2026-06-03
**Owner:** CTO (spec) → Codex BHIMA (Lane B backend) + ARJUN (Lane A frontend)
**MANTHAN:** 9194eed8 (Mega Build) — this is Phase 2 "Core assessment loop"
**Decision:** CEO-approved 2026-06-03 — build our own loop; PyjamaHR stopgap declined.

---

## 1. Why this exists (the missing 20%)

Live truth on 2026-06-03:
- `content.questions` = 1,426 rows, **1,406 released**, full 3PL IRT columns present
  (`difficulty_b`, `discrimination_a`, `guessing_c`, `empirical_pass_rate`, `calibration_n`).
- `content.responses` exists with the correct per-answer shape but holds **1 row**.
- **No candidate can take a test today.** There is no assessment container, no invite,
  no attempt/session orchestration, and `candidate.qorium.online` / `my.qorium.online`
  currently serve the **Talpro staffing homepage**, not the candidate portal.
- `candidate-portal` (Next.js, port 5116) is a stub: `layout.tsx`, `page.tsx`,
  `sessions/[id]/page.tsx`. No API, no invite, no public route.

Consequence: the "psychometrically-defensible, AI-graded" positioning is fiction until
real candidates answer real questions. This spec closes that gap and makes the two CEO
checkboxes self-satisfying:
- **Empirical IRT from real candidates (auto)** → calibration job recomputes
  `empirical_pass_rate` + `calibration_n` from live responses; refits 3PL at n≥30.
- **Reasoning-trace in grading UI (active origin)** → grader stores a reasoning trace on
  every response; admin review UI renders it.

## 2. Reuse-first (do NOT rebuild)

| Need | Reuse |
|---|---|
| Question bank + IRT params | `content.questions` (1,406 released) |
| Per-answer storage | `content.responses` (+ one new column) |
| IRT calibration runtime | existing PM2 svc `qorium-irt-calibration` |
| AI grading inference | JAYA (OpenRouter/Anthropic) — locate live grading svc in `qorium-api`; do NOT add Ollama |
| Candidate test screen | `candidate-portal/src/app/sessions/[id]` scaffold |

## 3. Data model (additions only — `content` schema)

> **Canonical SQL = `0015_assessment_delivery.sql`** (authored, house style verified against migration 0014). Tables live in the existing **`content`** schema — NOT a new `assess` schema. `tenant_id` FKs to `app.tenants(id)`; `candidate_id` is `VARCHAR(128)`. The block below is indicative; `0015` is source of truth and drops into `infra/B7-postgres-migrations/`.

```sql
-- indicative — see 0015_assessment_delivery.sql for the applied DDL

CREATE TABLE content.assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  title           varchar NOT NULL,
  slug            varchar NOT NULL,
  selection_mode  varchar NOT NULL DEFAULT 'fixed',   -- fixed | blueprint | adaptive(v2)
  blueprint_json  jsonb,                               -- [{skill_id, count, diff_band}] for blueprint mode
  time_limit_sec  integer NOT NULL DEFAULT 3600,
  pass_score      numeric NOT NULL DEFAULT 0.6,        -- fraction 0..1
  total_questions integer NOT NULL,
  status          varchar NOT NULL DEFAULT 'draft',    -- draft | active | archived
  created_by      varchar,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE content.assessment_questions (   -- fixed-mode ordered set
  assessment_id uuid NOT NULL REFERENCES content.assessments(id) ON DELETE CASCADE,
  question_id   uuid NOT NULL REFERENCES content.questions(id),
  position      integer NOT NULL,
  PRIMARY KEY (assessment_id, question_id)
);

CREATE TABLE content.invitations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id  uuid NOT NULL REFERENCES content.assessments(id),
  tenant_id      uuid NOT NULL,
  candidate_email varchar NOT NULL,
  candidate_name  varchar,
  token          varchar NOT NULL UNIQUE,             -- url-safe, 32+ chars
  status         varchar NOT NULL DEFAULT 'pending',  -- pending|opened|in_progress|submitted|expired
  expires_at     timestamptz NOT NULL,
  sent_at        timestamptz,
  created_by     varchar,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON content.invitations (token);

CREATE TABLE content.attempts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid NOT NULL REFERENCES content.invitations(id),
  assessment_id  uuid NOT NULL REFERENCES content.assessments(id),
  tenant_id      uuid NOT NULL,
  candidate_id   varchar NOT NULL,                    -- ties to content.responses.candidate_id
  status         varchar NOT NULL DEFAULT 'in_progress', -- in_progress|submitted|graded|abandoned
  question_order uuid[] NOT NULL,                     -- materialized at start
  current_idx    integer NOT NULL DEFAULT 0,
  total_score    numeric,
  max_score      numeric,
  percentile     numeric,
  integrity_flags jsonb NOT NULL DEFAULT '{}',        -- {tab_switches, paste_events, focus_loss, fullscreen_exits}
  started_at     timestamptz NOT NULL DEFAULT now(),
  submitted_at   timestamptz,
  graded_at      timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON content.attempts (invitation_id);

ALTER TABLE content.responses ADD COLUMN IF NOT EXISTS attempt_id uuid REFERENCES content.attempts(id);
CREATE INDEX IF NOT EXISTS responses_attempt_idx ON content.responses (attempt_id);
```

Grading output contract written back to `content.responses`:
- `score numeric` (0..1 of question weight)
- `execution_metadata.reasoning_trace` (string/JSON — the WHY behind the score; rendered in admin UI)
- `execution_metadata.rubric_breakdown` (per-criterion when rubric_json present)
- `suspicious_signals` (jsonb — paste/timing/similarity flags)

## 4. API contract (qorium-api, `/v1`)

Admin (auth required):
- `POST /v1/assessments` → create (fixed: question_ids[]; blueprint: blueprint_json)
- `GET  /v1/assessments/:id`
- `POST /v1/assessments/:id/invite` → {candidate_email, name} → {token, link, expires_at}; optional email send via provisioned M365 mailbox (SAARTHI), never talpro.in zone
- `GET  /v1/attempts/:id/review` → full responses + reasoning_trace + scores (admin only)

Candidate (token/attempt scoped, rate-limited, **answer_key/rubric/test_cases stripped**):
- `GET  /v1/invitations/:token` → assessment meta + candidate name (pre-start)
- `POST /v1/invitations/:token/start` → creates attempt, materializes `question_order`, returns attempt_id + first question (sanitized)
- `GET  /v1/attempts/:id/question/:idx` → sanitized question payload
- `POST /v1/attempts/:id/answer` → {question_id, response_body, time_taken_ms, integrity_events} → persists `content.responses` row
- `POST /v1/attempts/:id/submit` → grade all unscored responses, finalize totals, set status=graded
- `GET  /v1/attempts/:id/result` → candidate-facing summary (score, per-skill, pass/fail)

Grading worker (per response):
- MCQ/objective → compare against `answer_key`, deterministic score, short trace.
- Code → run `test_cases` in `sandbox_config`; score = tests passed; trace = failing cases.
- Open/short → JAYA LLM grade against `rubric_json` → {score, reasoning_trace, rubric_breakdown}.

## 5. Candidate frontend (candidate-portal, public via candidate.qorium.online)

- `/t/[token]/page.tsx` — landing: validate invite, candidate consent + name confirm, "Start".
- `/sessions/[id]/page.tsx` — runner (scaffold exists): countdown timer, question renderer
  (MCQ / code editor / short-text), per-question autosave, prev/next, submit. Anti-cheat:
  `visibilitychange` (tab switches), paste capture, fullscreen request + exit detection,
  focus loss — all POSTed as `integrity_events`.
- `/sessions/[id]/result/page.tsx` — candidate result (score, per-skill, pass/fail).

Admin reasoning-trace review UI lives in `admin` app: `/attempts/[id]` — per-question
response + score + `reasoning_trace` + rubric breakdown + integrity flags.

## 6. IRT calibration feedback (auto — closes checkbox #1)

Wire existing `qorium-irt-calibration` job to, on each tick:
1. Recompute `content.questions.empirical_pass_rate` and `calibration_n` from graded
   `content.responses` (objective items: mean correctness; weighted items: pass threshold).
2. When `calibration_n >= 30`, refit 3PL (`difficulty_b`, `discrimination_a`, `guessing_c`);
   below threshold leave priors, only update empirical_pass_rate + n.
3. Log calibration deltas; Telegram on first question crossing n≥30 (first defensible item).

## 7. Branch DAG (dependency-ordered; build only when deps merged to main)

| Branch | Lane | Depends on | Scope |
|---|---|---|---|
| BR-1 | B/BHIMA | — | DB migration `0015`: `content.{assessments,assessment_questions,invitations,attempts}` + `content.responses.attempt_id` |
| BR-5 | A/ARJUN | — | nginx: `candidate.qorium.online` → `candidate-portal:5116` (+ `my.` decision) |
| BR-2 | B/BHIMA | BR-1 | Assessment + invite APIs |
| BR-3 | B/BHIMA | BR-1,BR-2 | Attempt/answer/submit APIs + grading worker (reasoning-trace) |
| BR-4 | B/BHIMA | BR-1,BR-3 | IRT calibration feedback wiring |
| BR-6 | A/ARJUN | BR-2 | Candidate `/t/[token]` landing + start |
| BR-7 | A/ARJUN | BR-3 | Test runner `/sessions/[id]` + anti-cheat |
| BR-8 | A/ARJUN | BR-3 | Candidate result + admin reasoning-trace review |

Parallel front: BR-1 and BR-5 start immediately (both dependency-ready).

## 8. Guardrails (inviolable)

- **P1 security:** candidate payloads MUST strip `answer_key`, `rubric_json`,
  `reference_solution`, `test_cases`, `sandbox_config`. Tenant isolation on every query by `tenant_id`.
- Cross-account review: a branch authored by BHIMA is approved by the ARJUN account and vice
  versa. Author never self-merges. GBS serializes the merge slot.
- Build only dependency-ready branches (deps merged to main). Never park-all.
- Rate-limit candidate endpoints (10 r/s burst 20). RFC-7807 errors. Pino logging. No secrets in code.
- Customer Zero = Talpro tenant for the first real attempts. No external pilot until PRAHARI GO 80/80.
- No Ollama on VPS. Atomic release for the Next apps. Source `NEXT_PUBLIC_*` before build.

## 9. Definition of done (v1)

A Talpro recruiter creates an assessment, invites a candidate by email, the candidate opens
`candidate.qorium.online/t/<token>`, takes a timed test on real released questions, submits,
and is graded; the recruiter sees the score **with reasoning trace per answer**; and
`content.responses` + `questions.calibration_n` grow automatically so IRT calibration begins.

## 10. Verification gate

`npm run build` 0 err · `tsc --noEmit` 0 err · candidate payload leak test (no answer_key in
any candidate response) · end-to-end attempt on Talpro tenant produces graded result + ≥N new
`content.responses` rows · PRAHARI GO 80/80 before public/external use.
