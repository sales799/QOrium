# QOrium Phase F — Scale Wedges (CTO 2026-06-03)
_M3 job-sim · M5 cognitive · M6 video · M7 chatbot · M8 scheduling · M9 live-room · M10 reference_
**CTO governance: PROVE override executed locally, production-gated.** Original recommendation was demand-gated; CEO explicitly pulled full breadth on 2026-06-03. The implementation now ships honest on-demand runtime surfaces locally, but production claims remain blocked until deploy + Prahari/Rakshak GO.

## Built now (no-regret scaffolding)
- **Cognitive taxonomy (M5):** seeded sub-skills under Wave3 Cognitive Ability (Numerical, Verbal, Logical, Abstract Reasoning, Data Interpretation) + Wave3 Personality/SJT (Situational Judgement, Work Style, Integrity). Gives the authoring stream + adaptive engine real targets. **Content authoring → frontier (Codex-Pro) stream, NOT Qwen** (cognitive/SJT quality).
- **Simulation format (M3):** `content.questions.format='simulation'`, `body_json = { steps:[{prompt, input_type, rubric}], scenario, role_context }`. Multi-step, AI-graded per step with reasoning trace. (Author 2-3 reference sims first, then scale.)
- **Runtime breadth (local app):** `qorium-app` exposes authenticated `/api/v1/scale-wedges/*/sessions` for M5 cognitive, M3 job-sim, M6 video-response, M8 scheduling, M9 live-room, and M10 reference-check. Live-room event persistence and audit rows are included.
- **DB shape:** `0003_phase_f_scale_wedges.sql` adds `question.body_json`, enum values `simulation` / `video_response`, and `scale_wedge_session`.
- **Candidate UI:** simulation steps and video-response transcript capture render explicitly; candidate payload sanitization strips answer/rubric internals.
- **Verification:** `pnpm exec vitest run tests/phase-f-scale-wedges.test.ts`, `pnpm typecheck`, `pnpm test`, `pnpm smoke`, `pnpm build`, `pnpm e2e`, `pnpm scan:secrets`, and `pnpm lint` passed on 2026-06-03.

## Module specs + build triggers (pull on demand)
| M | Module | Build when (trigger) | Lane | Notes |
|---|---|---|---|---|
| M5 | Cognitive/aptitude | a pilot needs aptitude screening | frontier authoring + active-origin adaptive serving | taxonomy seeded; author numerical/logical first (most defensible), then SJT |
| M3 | Job simulations | a pilot asks for "real-work" tasks | frontier authoring + active-origin runtime | format defined; start with 3 sims (e.g., "triage 5 tickets", "fix this query") |
| M7 | Screening chatbot polish | high-volume pilot | active origin (qorium-chatbot live) | wire to M4 grader + reasoning trace |
| M6 | Video response | a pilot requires video | active origin + India object-store (R2 Mumbai) + Whisper | residency: store media in India (Phase C) |
| M8 | Interview scheduling | a pilot books interviews | active origin + Google/MS OAuth | ICS + reminders |
| M9 | Live coding room | a CoderByte-parity pilot | active origin + WebSocket | reuse M2 sandbox |
| M10 | Reference checking | a pilot asks | active origin | async referee questionnaire → aggregate |

## DISPATCH
- **Frontier authoring stream:** when triggered, author cognitive (numerical→logical→abstract→SJT) + 3 job-sims via Codex-Pro into the seeded sub-skills (auto-ingest loader already handles JSONL). Honest: AI-verified, model-estimated IRT.
- **Active-origin/lanes:** build the runtime per module ONLY when its trigger fires (adaptive serving, video recorder, scheduler, WebSocket room, reference flow). Each: cross-account review, honest IRT label, India residency for any new storage.
- **Guardrail:** marketing must NOT claim M3/M5/M6/M8/M9/M10 until the specific module ships (Rakshak Legal). Today the site correctly omits them.

## CTO recommendation
Local full-breadth runtime is now built. Keep public marketing claims off until active-origin deploy, migration application, cross-account review, and Prahari/Rakshak GO. First production hardening order remains: **M5 numerical/logical aptitude**, then **M3 job-sims**, then M6/M8/M9/M10 by pilot pressure.
