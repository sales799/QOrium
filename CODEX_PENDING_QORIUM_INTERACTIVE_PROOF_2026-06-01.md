# CODEX PENDING — QOrium Interactive Proof Surface (I1 + I2 + I4)

**Queued by:** CTO (Claude, Super Brain). **Executors:** Codex BHIMA (backend APIs, grader plumbing, JD parser exposure) + ARJUN (interactive widgets, lead-capture, design tokens) — joint, tightly coupled.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-01
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2.4 rows I1, I2, I4 (all 🔴 P0).
**Companion specs (read first):** `infra/JD-Forge-v0-Design.md` (M13 — already live as qorium-jd-forge, this shard EXPOSES it publicly), `MARKETING_REDESIGN_360_v1.md` §7 (Phase 4 interactive proof blueprint), `04-QOrium-Blueprint-v1.md` (assessment loop), `BACKEND_MODULES_360_v1.md` M4 (grader), the 13 existing sample packs at `sales/Sample-Pack-v0.{5,6}-*-Populated.md`, parent companion shards `CODEX_PENDING_QORIUM_C1_MARKETING_CHATBOT_*.md` (shares RAG corpus seam) + `CODEX_PENDING_QORIUM_PROGRAMMATIC_SEO_FACTORY_*.md` (shares role-graph seam).
**Honesty hard-rule:** every interactive widget shows **real product output**, not stubbed/canned demos. If the live grader returns a degenerate answer for the demo input, the widget shows it honestly with a caveat — never fabricate. If JD-Forge can't extract a skill, the widget says "we couldn't extract this — here's why" rather than padding with fake skills.

## What this ships

Three interactive proof surfaces on the marketing site that move QOrium from "tell" to "show":

| ID | Widget | Path / Surface | What it proves |
|---|---|---|---|
| I1 | Live JD→test demo | Homepage hero + `/platform/jd-forge` + standalone `/try/jd-forge` | The JD-Forge product is real, not slideware |
| I2 | Graded-answer viewer | `/try/graded-answer` + embedded on `/library/{skill}` + `/method` | The grader is real and reasoning is auditable |
| I4 | Sample-Pack lead magnet | `/resources/sample-packs` hub + per-pack `/resources/sample-packs/{slug}` | Real calibrated content exists at depth |

**Not in scope:** Sample-question playground (I3 — P1, candidate-attempts a question and gets graded — that's larger surface, separate shard), product tour video (I5 — ARJUN content track), 8-dimension moat strip (I6 — design-led, handled in the marketing-redesign shard already queued).

## Architecture seams

This shard reuses two seams established in the prior batch:

- **I1 + I2 RAG corpus reuse** — both widgets ingest the same role-graph corpus the chatbot (C1) uses. A skill referenced in JD-Forge output OR a graded-answer rubric is a CLICKABLE LINK to its `/library/{skill}` page (S1). Internal-link mesh extends naturally to the proof widgets.
- **I4 inherits the Sample-Pack content** — 13 packs already authored in `sales/Sample-Pack-v0.{5,6}-*-Populated.md`. ARJUN renders them as Notion-style web pages + downloadable PDFs; BHIMA owns the email-capture + signed-download endpoint.

## I1 — Live JD→test demo widget

### Behavior

1. Visitor pastes a JD (textarea) OR picks from 6 pre-loaded sample JDs (Senior Java, Senior React, DevOps SRE, Salesforce, Embedded C, SAP ABAP — sourced from the populated sample packs so output is real).
2. Widget calls existing `qorium-jd-forge` API → returns extracted skills + recommended item battery.
3. Renders: 3-pane layout
   - **Left:** JD with highlighted skill phrases (the source spans).
   - **Center:** extracted skill battery with weights + role family + stack family. Each skill is a link to `/library/{skill}`.
   - **Right:** "your assessment" — generated test plan (skill battery → which item types → estimated duration → calibration coverage badge).
4. CTAs at bottom: "Book a demo with this assessment ready" (pre-fills lead form with the test plan ID) + "Download this assessment plan as PDF."

### BHIMA — backend

- New public route on the marketing-facing edge: `POST /v1/jd-forge/demo` (public, rate-limited 10/min/IP, 100/day/IP). Wraps the internal jd-forge service; never exposes internal endpoints directly.
- Honesty-mode flag on the public endpoint: if extraction confidence below threshold, return `{ ok, data: { skills: [...], lowConfidenceReason: "..." } }` — widget renders the honest fallback.
- Response cached 5min on (`hash(jd_text)`) — many visitors paste similar JDs.
- Audit log entry per call (anonymized IP + JD length + skill count). Feeds T3 honesty page later ("X JDs processed in last 30 days").
- Plan-PDF endpoint: `POST /v1/jd-forge/demo/plan-pdf` → returns signed-URL to a generated PDF. Email-gated (email captured before PDF link delivered).

### ARJUN — UI

- Surfaces: homepage hero replaces the static demo block with this widget (full-width on desktop, stacked on mobile); `/platform/jd-forge` has the canonical version; `/try/jd-forge` is standalone landing for direct linking.
- shadcn/ui + Motion v12 spring layout transitions when extraction completes.
- Skill chips animate in staggered (200ms cascade).
- Empty state, loading state (skeleton), error state (network), low-confidence state (honest banner), success state.
- WCAG 2.1 AA — textarea labeled, results region `aria-live="polite"`, all chips keyboard-navigable.
- Telemetry: `jd_forge_demo_paste`, `jd_forge_demo_sample_loaded`, `jd_forge_demo_extracted` (with skill count), `jd_forge_demo_skill_clicked`, `jd_forge_demo_plan_pdf_requested`, `jd_forge_demo_demo_cta_click`.

## I2 — Graded-answer viewer

### Behavior

A read-only theatre showing a real candidate response moving through the grader with the rubric visible and the reasoning trace exposed. Not interactive (no candidate attempt — that's I3). Goal: prove the grader is real + reasoning is auditable.

1. Surface presents a curated list of 8–12 graded-answer exemplars (3 per skill family: code, SQL, document/spreadsheet, scenario). Sourced from real items in the sample packs + their graded responses (BHIMA seeds these).
2. Click an exemplar → split-pane view:
   - **Left:** the question + candidate's submitted answer (verbatim).
   - **Right (top):** the rubric (criteria + weight + signal).
   - **Right (middle):** the grade (score + per-criterion breakdown).
   - **Right (bottom):** the reasoning trace — the grader's stepwise rubric-match (collapsed by default, expandable). Includes `{ rubric_version, model_version, prompt_hash, input_hash, graded_at }` for reproducibility — surfaces the auditability claim from T3.
3. "Was this fair?" buttons (👍/👎) — emit telemetry (we do NOT change the grade — this is signal-collection only, with a privacy note).
4. CTA: "See how this works on your assessments → book a demo."

### BHIMA — backend

- `GET /v1/grader/exemplars` → list of curated exemplars (id, title, skill, family). Public, cached.
- `GET /v1/grader/exemplars/:id` → full exemplar payload (question, answer, rubric, score, reasoning, audit-meta). Public, cached.
- Exemplars stored in `grader_exemplars` table — admin-curated, NOT every real candidate response (privacy). Seed batch from sample-pack items + a small set of representative answers BHIMA generates or surfaces from consented-test runs.
- `POST /v1/grader/exemplars/:id/feedback` → fairness vote (no-auth, dedupe by session+id). Public, rate-limited.

### ARJUN — UI

- Surface: `/try/graded-answer` standalone + embedded variant on `/library/{skill}` (filtered to that skill) + canonical mention on `/method` (links into the standalone).
- Code/SQL exemplars use syntax-highlighted Monaco read-only editor (already a dep if jd-forge live preview uses it; otherwise highlight.js to keep bundle lean).
- Document/spreadsheet exemplars render markdown/tabular respectively.
- Reasoning-trace expand → Motion v12 height animation, smooth.
- Audit-meta block uses monospace, copy-button per field.
- Telemetry: `graded_answer_viewer_open`, `graded_answer_exemplar_selected`, `graded_answer_reasoning_expanded`, `graded_answer_audit_meta_copied`, `graded_answer_fairness_vote`, `graded_answer_demo_cta_click`.

## I4 — Sample-Pack lead magnet hub

### Behavior

1. Hub at `/resources/sample-packs` lists all 13 packs with: cover art, title, skill, role, level (Senior / etc.), item count, calibration badge, "what's inside" preview.
2. Per-pack `/resources/sample-packs/{slug}` — first 2–3 items rendered openly (preview); remaining items gated behind email + role + company capture.
3. Submit form → lead written to CRM (existing pipeline) + signed-URL PDF delivered by email (NOT inline — the email round-trip is intentional buyer-friction signal).
4. After submit, page shows the full pack inline (so the captured visitor sees value immediately even before PDF arrives).
5. Each pack page cross-links to: the skill's `/library/{skill}` page, the relevant `/solutions/role/{role}` page, the relevant `/solutions/stack/{stack}` page (when India-stack relevant — e.g., SAP ABAP pack → `/solutions/stack/sap`).

### BHIMA — backend

- `GET /v1/sample-packs` → list (metadata only, no item content). Public, cached.
- `GET /v1/sample-packs/:slug/preview` → first 2–3 items. Public, cached.
- `POST /v1/sample-packs/:slug/unlock` → `{ email, company, role }` validated → returns full pack JSON + triggers PDF generation + email-send job.
- `GET /v1/sample-packs/:slug/pdf` → signed-URL, expires 7 days. Email-only delivery, never direct-render of the URL on the page.
- Source-of-truth: the 13 `sales/Sample-Pack-v0.{5,6}-*-Populated.md` files imported at build time into a `sample_packs` table. Re-import on Lane B redeploy.

### ARJUN — UI

- Hub: card grid, filters (skill family, role family, stack family, level).
- Per-pack: Notion-style long-form rendering. Cover image (or generated SVG identity per skill if none). Embedded lead form below preview items, replaced by full pack on submit.
- Honesty banner on any pack where calibration is incomplete: "These items are authored but not yet IRT-calibrated — see /method for what that means." Links to T5.
- Telemetry: `sample_pack_hub_view`, `sample_pack_filtered`, `sample_pack_card_click`, `sample_pack_preview_view`, `sample_pack_unlock_submitted`, `sample_pack_pdf_email_sent`, `sample_pack_full_view`.

## Cross-cutting

### Surfaces affected (single deployment, multi-file)

- Homepage → I1 hero (replaces static block)
- `/platform/jd-forge` → I1 canonical
- `/try/jd-forge`, `/try/graded-answer` → standalone landings (high-intent / direct-link entry)
- `/method`, `/science`, `/library/{skill}` → embed I2 contextually
- `/resources/sample-packs` + 13 per-pack pages → I4
- Mega-menu "Resources" → links Sample Packs + Try widgets
- Chatbot (C1) — gains tool: when user asks "show me a demo," chatbot can hand off to `/try/jd-forge` or `/try/graded-answer` with one click

### Conversion plumbing

- All three widgets emit `proof_cta_clicked` (top-funnel) → `demo_form_submitted` (mid-funnel) → handed to lead-capture pipeline shared with C1 chatbot.
- A/B-ready: ARJUN scaffolds variant slots so messaging can be CEO-tuned later without architectural rework. Flag library = existing Talpro flag system (NOT a new dep).

### Honesty enforcement (CI gates)

- I1 widget: integration test with 6 sample JDs → at least 5 of 6 must extract ≥ 5 skills above confidence threshold OR the widget renders the honest low-confidence state. CI fails if both fail.
- I2 widget: every exemplar in seed batch must have `{ rubric_version, model_version, prompt_hash, input_hash }` populated. CI lint blocks any exemplar missing these fields.
- I4: any pack page rendered without a calibration badge fails CI lint. Stub-calibrated packs render the honest banner; CI verifies.

## Telemetry rollup (analytics dashboard)

Single dashboard view `/internal/dashboards/interactive-proof`:
- Funnel: pageview → widget interaction → demo CTA → demo booked → demo qualified → opportunity → closed-won.
- Per-widget conversion rates so we can kill / double-down based on real signal.

## Exit criteria

**Phase 1 — I1 live:**
1. `/v1/jd-forge/demo` public endpoint live, rate-limited, audit-logged.
2. Widget shipped on homepage + `/platform/jd-forge` + `/try/jd-forge`.
3. 6 sample JDs preloaded; all return real extractions.
4. Plan-PDF email-gated download works end-to-end.

**Phase 2 — I2 live:**
5. `grader_exemplars` table seeded with ≥ 8 exemplars covering ≥ 4 skill families.
6. `/try/graded-answer` standalone + embedded variants on `/method` + `/library/{skill}` live.
7. Audit-meta block present on every exemplar; fairness-vote endpoint live.

**Phase 3 — I4 live:**
8. `/resources/sample-packs` hub + 13 per-pack pages live.
9. Preview-then-gate flow works; lead writes to CRM; PDF delivered by email within 60s p95.
10. Cross-links from packs to `/library`, `/solutions/role`, `/solutions/stack` all resolve.

**Quality gates throughout:**
- Rakshak run ≥ 88/100 17/17 (no regression). Trust + proof sub-scores should LIFT.
- CWV green on the 3 standalone surfaces (`/try/jd-forge`, `/try/graded-answer`, `/resources/sample-packs`) + homepage (with new widget).
- WCAG 2.1 AA on all widgets — axe-core CI clean.
- p95 JD-Forge demo extraction < 4s; p95 graded-answer-payload fetch < 600ms.
- Honesty CI gates above all pass.

## Coordination

- BHIMA owns: 3 public APIs (JD-Forge demo, grader exemplars, sample-pack unlock), `grader_exemplars` + `sample_packs` tables, build-time import job, email/PDF plumbing, audit logging.
- ARJUN owns: all 3 widgets, standalone landings, hub + per-pack pages, lead-form variants, telemetry events, design tokens (bright-product zone per `MARKETING_REDESIGN_360_v1.md` §0.1).
- Joint review: the curated exemplar seed batch (I2) — both lanes + CEO sign-off on which exemplars go public (privacy + brand check).

## Parallel-work guard

`gh pr list --state all --search "interactive-proof"`. Lock `project-lock:qorium-interactive-proof` while mutating widget or seed data. JD-Forge already locked separately — coordinate before mutating its API surface.

## Open input (non-blocking)

- CEO: confirm the 6 sample JDs (defaults pulled from sample packs — Senior Java, Senior React, DevOps SRE, Salesforce, Embedded C, SAP ABAP). Swap any for higher-value buyer personas if needed.
- CEO: confirm preview-item count for I4 (default = 2–3 items shown openly, rest gated). Raising count = lower friction, more value-give. Lowering = more leads.
- CEO: sign-off on the 8+ I2 exemplars before public flip. CTO has the curation power but doctrine says CEO eyes any externally-visible response surface once before launch.
