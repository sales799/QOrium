# CODEX PENDING — QOrium Free-LLM Draft Factory (decisions locked)
**Filed:** 2026-06-03 by Claude (CTO) · **Lane:** KARYA/BHIMA (backend) · **Branch:** `codex/qorium-draft-factory`
**Companion design:** `QORIUM-FREE-LLM-DRAFT-FACTORY-CRON-2026-06-03.md` · **Priority:** HIGH (clears the Phase-1 volume gap, zero API cost)

## CEO decisions (locked 2026-06-03 — build to these)
1. **Validation gate (stage 6) = cheap PAID frontier pass.** Validate ONLY drafts that survive self-critique + anti-leak (the small surviving %) with a frontier model (Claude/GPT via API). Promote pass→`released`; everything else stays `draft`. Keep per-question cost logged.
2. **Model routing = MINI-ONLY for now.** Use `https://llm-mini.talpro.in` `qwen2.5-coder:7b` for all drafting. Do NOT depend on `llm-pro` (key-gated, deferred). Architect the model endpoint as config so `llm-pro` can be added later without code change.

## Live facts (verified this session)
- `llm-mini.talpro.in/v1/models` → 200, serves `qwen2.5-coder:7b` (OpenAI-compatible via LiteLLM). One authoring call = 200 in 38s; output valid JSON but had a real quality flaw (stem referenced absent code) → **drafts only, gate mandatory.**
- DB `qorium.content`: 986 released, 511 skills, **503 skills under 10 questions, deficit to 10/skill = 4,513**. `questions.status` supports `draft`; audit fields exist (`authored_by`, `ai_critique_scores`, `source_corpus`, `difficulty_b`).

## Build spec
1. **Gap queue** (`scripts/draft-gap-queue.ts`): the worklist = per (skill × difficulty_band × format) deficit vs a 10-per-skill floor (4,513 target). Emit a prioritized batch (India-stack + most-searched skills first).
2. **Draft** (reuse `services/jd-forge` generation core; do NOT fork a new generator): POST to `LLM_DRAFT_BASE_URL` (= llm-mini) `qwen2.5-coder:7b`, strict-JSON output mapped to `content.questions` (`body_md/body_json, answer_key, rubric_json, reference_solution, test_cases, format, skill_id, sub_skill_id, language, difficulty_b` prior).
3. **Self-critique** (2nd free pass): score correctness / ambiguity / **"is referenced code actually present"** / difficulty plausibility → `ai_critique_scores`; auto-reject below threshold.
4. **Anti-leak** (reuse `services/testforge-orchestrator` plagiarism/similarity): reject leaked/near-dup matches.
5. **Insert** `status='draft'`, `authored_by='qwen2.5-coder:7b@llm-mini'`, `source_corpus`, `ai_critique_scores`. **NEVER `released`.**
6. **Validation gate** (`scripts/draft-validation-gate.ts`): frontier-model pass on critique survivors only → on PASS set `sme_validated_by='<model>@frontier-validator'` + `status='released'`; log cost. (This is the SO-8 satisfier until a human SME is assigned.)
7. **CRON** (on a Mac, GPU-local): `*/30 22-23,0-6 * * *` draft-factory (N≈20/batch, throttled to keep Mac responsive); `0 * * * *` critique+anti-leak sweep; validation-gate hourly. Logs to `/var/log/qorium/`.
8. **Watchdog + guardrails:** nightly cap; never write `released` from the free path; gitleaks; `talpro_watchdog_add` on the cron heartbeat; record drafts/night + accept-rate to a metrics table.

## Exit criteria
- Free path inserts only `draft` rows; release path only via frontier validation gate (SO-8 honored).
- Demonstrate one full loop: gap→draft(mini)→critique→anti-leak→draft row→frontier-validate→released, with cost logged.
- Throughput + accept-rate metrics visible; cron + watchdog live; cross-account review before first prod content write.

## Founder: nothing further required (both decisions made). Optional later: `llm-pro` key to raise quality ceiling on India-stack depth.
