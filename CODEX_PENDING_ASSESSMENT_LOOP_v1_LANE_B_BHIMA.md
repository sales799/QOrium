# CODEX_PENDING — Assessment Loop v1 · Lane B (BHIMA) · Backend

**Spec:** `QORIUM_ASSESSMENT_LOOP_v1.md` (read first). **Repo:** qorium-api (locate source dir hosting the `qorium-api` PM2 process; it is NOT under `/opt/qorium/apps` on old origin — `grep -rl "qorium-api" /opt` / inspect `pm2 describe qorium-api` script path).
**Doctrine:** dependency-ready only · cross-account review (ARJUN approves your merges) · never self-merge · no Ollama · no secrets in code.

## Your branches (in order)

### BR-1 — DB migration  [deps: none — ship first]
**Authored for you:** `0015_assessment_delivery.sql` (in the QOrium project folder). Drop it into
`infra/B7-postgres-migrations/0015_assessment_delivery.sql` in the qorium-platform repo verbatim.
- Tables are in the existing **`content`** schema (NOT a new `assess` schema), FK `tenant_id -> app.tenants(id)`, `candidate_id VARCHAR(128)` — matches migration 0014. Additive only.
- Apply via the documented pipeline (infra/B7 README): node-pg-migrate / `psql $DATABASE_URL -f`.
  **PR review by the ARJUN account, STAGING first, then production.** Do NOT hand-apply to the live bank DB.
- `gen_random_uuid()` is already in use (0014) — no new extension needed; confirm `pgcrypto` present.
- Verify: `content.{assessments,assessment_questions,invitations,attempts}` exist and
  `content.responses.attempt_id` (nullable, FK -> content.attempts) is present.

### BR-2 — Assessment + invite APIs  [deps: BR-1]
Implement spec §4 admin routes: create assessment (fixed = explicit question_ids ordered into
`content.assessment_questions`; blueprint = store `blueprint_json`), get, and invite (generate
url-safe ≥32-char token, `expires_at` default +14d, return `{token, link}` where
`link = https://candidate.qorium.online/t/<token>`). Email send optional via provisioned M365
mailbox (SAARTHI) — never the talpro.in zone; if mailbox unavailable, return link only.
Auth on all routes (401). Tenant scoping mandatory.

### BR-3 — Attempt + answer + submit + grading worker  [deps: BR-1, BR-2]
Candidate routes from spec §4. CRITICAL P1: a shared `sanitizeQuestion()` MUST drop
`answer_key`, `rubric_json`, `reference_solution`, `test_cases`, `sandbox_config` from every
candidate-facing payload — add a unit test asserting none appear.
- `/start`: validate token + not expired + not already submitted; materialize `question_order`
  (fixed = ordered set; blueprint = sample N released questions per skill/diff band, random seed
  stored); set invitation.status=in_progress; return attempt_id + sanitized first question.
- `/answer`: upsert `content.responses` row (attempt_id, question_id, candidate_id, tenant_id,
  response_body, time_taken_ms, started_at/submitted_at), merge integrity_events into
  `attempts.integrity_flags`.
- `/submit`: grade all unscored responses, set `attempts.total_score/max_score/status=graded`,
  invitation.status=submitted.
Grading worker (spec §4): MCQ→answer_key deterministic; code→run test_cases in sandbox_config;
open→JAYA LLM vs rubric_json. Write `score` + `execution_metadata.reasoning_trace` +
`rubric_breakdown` to the response. Reuse the existing JAYA/grading client; do not add a new model provider.

### BR-4 — IRT calibration feedback  [deps: BR-1, BR-3]
Wire existing `qorium-irt-calibration` job per spec §6: recompute `empirical_pass_rate` +
`calibration_n` from graded responses each tick; refit 3PL at n≥30; Telegram on first item crossing n≥30.

## Quality gate
`tsc --noEmit` 0 err · build 0 err · sanitize leak test green · RFC-7807 errors · Pino logs ·
rate-limit candidate routes 10r/s burst 20 · open PR per branch, ARJUN account reviews, GBS merge.
