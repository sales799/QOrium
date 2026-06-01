# CODEX PENDING — QOrium C1 Marketing Chatbot

**Queued by:** CTO (Claude, Super Brain). **Executors:** Codex BHIMA (backend lane) + ARJUN (marketing lane) — joint.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-01
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2.1 row C1 (🔴 P0).
**Companion specs (read first):** `MARKETING_REDESIGN_360_v1.md` §5 (mega-menu — chatbot is a header-pinned widget), `07-CTO-Architecture-v1.md` (service-bus + secrets), `infra/API-Documentation-v0.md` (response envelope), `infra/B6-Secret-Rotation-Calendar.md` (LLM key handling).
**Honesty hard-rule:** the chatbot itself must obey the Responsible-AI honesty table — it can ONLY answer from shipped surfaces. Beta/Roadmap topics → "this is on our roadmap, here's the date we'll show you." No hallucination of features that don't exist.

## What this ships

A marketing-site chatbot that (a) answers prospect questions from QOrium's actual marketing/library/trust corpus, (b) qualifies + books demos, (c) escalates to human (Slack/email) on intent signals, (d) showcases QOrium's own AI as proof-of-product.

**Not in scope:** in-product candidate-side AI (that's C2, separate shard), AI screening agent (C3), AI Interviewer (C4).

## Architecture (canonical stack)

- **Service:** `qorium-chatbot` — new PM2 fork next to existing qorium-* fleet. Node 22, Fastify or Express (match qorium-api convention).
- **Corpus:** indexed at build time from `/library/*`, `/vs/*`, `/method`, `/science`, `/anti-leak`, `/responsible-ai`, `/compliance-dpdp`, `/trust`, `/security`, `/platform/{readybank,jd-forge,stack-vault}`, `sales/Sample-Pack-*`. Rebuild on Lane B redeploy.
- **Retrieval:** lightweight RAG. Start with pgvector on the existing CockroachDB/Postgres — DO NOT introduce a second vector store. Embedding model: `text-embedding-3-small` (OpenAI) OR `voyage-3-lite` (cheaper, India-friendly latency) — BHIMA chooses, log decision.
- **LLM:** Claude Sonnet 4.6 default (fast, current canon). Fallback chain on rate-limit: GPT-4o-mini. Per-account routing keys from existing rotation infra. NO key embedded in client.
- **System prompt:** locked in repo at `services/qorium-chatbot/prompts/system.v1.md`. Hard-coded refusal patterns: pricing-quote (route to sales), candidate-cheat-help (refuse), competitor-disparagement (decline + redirect to /vs page).
- **Demo booking:** POST handoff to existing demo endpoint OR Cal.com embed (whichever ARJUN's landing uses); chatbot only collects email + company + role + 1-line need, never tries to schedule directly in v1.
- **Human escalation:** when intent score crosses threshold OR user types "talk to human" → emit Slack webhook to `#qorium-demo-inbound` + email to sales alias; chatbot tells user "a human will reach out within 4 business hours."
- **Persistence:** conversation logs to Postgres `chatbot_sessions` + `chatbot_messages` with 90-day retention (DPDP-aligned). PII redacted (email/phone) in summary export.

## API contract (BHIMA backend lane)

```
POST /v1/chatbot/session              → { sessionId, greeting }
POST /v1/chatbot/message              → { reply, intent, citations[], escalate?: bool }
POST /v1/chatbot/leadCapture          → { ok, leadId }
GET  /v1/chatbot/health               → standard health envelope (per API-Doc-v0)
```

- Rate limit: 30 req/min per IP, 200/day per session. Existing limiter middleware.
- Auth: public (no API key) for `/session` + `/message`; internal HMAC on `/leadCapture` from chatbot service only.
- Response envelope MUST match `infra/API-Documentation-v0.md` (`{ ok, data, error }`).
- **Citations field is mandatory** — every claim cites the source page. Honesty doctrine: if no citation, refuse the claim.

## UI (ARJUN marketing lane)

- **Surface:** floating launcher bottom-right on all `/` marketing pages EXCEPT `/responsible-ai` (hidden there — that page IS the honesty source). Hidden on `/admin/*`, candidate-test surfaces, and any authenticated app.
- **Token system:** uses bright-product palette per `MARKETING_REDESIGN_360_v1.md` §0.1. Dark-shell tokens forbidden — chatbot must read as product, not chrome.
- **Library:** native — no Intercom/Drift/Crisp. shadcn/ui dialog + Motion v12 spring entrance per CTO UI Bible.
- **States:** closed launcher (pulse only on first visit, never on returning), opening (spring), open (450×640 desktop, full-screen mobile), typing indicator, citation chips on each bot message (clickable → opens cited page in new tab).
- **Accessibility:** keyboard-trap inside dialog, ESC to close, focus return, ARIA live region for streamed reply. WCAG 2.1 AA.
- **Lead-capture form:** appears inline in chat when escalation triggers — email + company + role + 1-line need. NEVER pop a modal on top.

## Telemetry

- Events: `chatbot_opened`, `chatbot_message_sent`, `chatbot_citation_clicked`, `chatbot_demo_requested`, `chatbot_human_escalated`, `chatbot_session_ended`.
- Sink: existing Talpro analytics pipeline. Tag every event with `page_path` (source page of the conversation).

## Exit criteria

1. `qorium-chatbot` running under PM2, registered in fleet-status (this also forces the fix for the open registry gap in CLAUDE.md).
2. RAG corpus rebuilt on Lane B redeploy hook (CI step or post-deploy script).
3. Citation-mandate verified by adversarial prompt set (BHIMA writes 20 jailbreak/hallucination prompts; bot refuses or cites in 20/20).
4. Lead-capture → Slack `#qorium-demo-inbound` round-trip works end-to-end on staging.
5. Rakshak run on qorium.online ≥ 88/100 17/17 (no regression).
6. WCAG 2.1 AA on the widget — axe-core CI step clean.
7. p95 first-token latency < 1.5s; full-reply p95 < 6s.
8. Honesty regression test: ask "do you have an AI Interviewer?" → bot must answer "no, that's on the roadmap" and link `/responsible-ai`. Asked "what's your pricing?" → bot must collect lead, never quote a number. Both pass in CI.

## Coordination

- BHIMA owns service, RAG, API, escalation plumbing.
- ARJUN owns widget UI, launcher, token wiring, telemetry events, the lead-form UX.
- Joint owners on the system prompt (`prompts/system.v1.md`) — PR requires review from both lanes.

## Parallel-work guard

`gh pr list --state all --search "chatbot"` before opening a PR. Lock `project-lock:qorium-chatbot` in talpro-memory while mutating service code.

## Open input (non-blocking)

CEO may want a specific persona/voice ("Qori"? gendered? avatar?). Default is unnamed, no avatar, voice = QOrium honesty doctrine (terse, evidence-led, never oversells). Re-skin on CEO drop without architectural rework.
