# CODEX PENDING — QOrium Enterprise Surface Wave-2 (X4 + R2 + N11 + E4)

**Queued by:** CTO (Claude, Super Brain). **Executors:** Codex BHIMA (backend lane) + ARJUN (admin/recruiter UI lane) — joint.
**Apex rule:** Codex writes ALL code; Claude does not.
**Date queued:** 2026-06-02
**Parent audit:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` §2 rows X4, R2, N11, E4 (all 🔴 P0).
**Companion specs (read first):** `infra/API-Documentation-v0.md` (N11 extends), `infra/SSO-SAML-Enterprise-Spec-v0.md` (E4 cross-references), `BACKEND_MODULES_360_v1.md` A9 admin scaffold (X4 extends) + M4 grader (R2 consumes), `MARKETING_REDESIGN_360_v1.md` §0.1 (evidence-gate doctrine), live `qorium-admin` PM2 #179/#181, live `qorium-api` PM2 #1, `CODEX_PENDING_QORIUM_TRUST_SHELL_2026-06-01.md` T1+T2 (E4 residency claims must match).
**Honesty hard-rule:** every enterprise claim cites evidence. E4 residency claim must be backed by a per-region database connection string in `qorium-api`'s env; if no India-primary DB exists, page must NOT claim residency. N11 API claims must match what's actually deployed (response envelope, auth, rate-limits) — CI verifies docs vs. live.

## What this ships

The 4 enterprise-table-stakes surfaces still missing from QOrium:

| Item | Path / Surface | Wedge |
|---|---|---|
| X4 | `/m/assess/*` mobile-responsive candidate surface | Vervoe parity (every major has this; we have partial admin only) |
| R2 | `/admin/candidates/ranking` recruiter ranking + shortlist UI | Vervoe Automatic Grading & Ranking parity |
| N11 | `https://api.qorium.online/v1/` public REST API + OpenAPI docs at `/docs` | Vervoe API is a hero feature; we have `api.qorium.online` live but no public docs |
| E4 | `/trust/residency` + per-region tenant routing | Vervoe Regional Data Storage parity; India-primary is our wedge |

**Not in scope:** X5 ID verification, X6 tab-switch detection (separate cheat-signal shard — referenced by F2/F3/F6/F9), R1 Talent Pools (P1, separate), R3 shareable cards (P1), N1-N10 ATS integrations (already in A8 — needs creds, not new spec).

## X4 — Mobile-responsive candidate surface (`/m/assess/*`)

### Current state
A9 admin scaffold (per BACKEND_MODULES_360_v1) is partially responsive. Candidate-side `/assess/*` routes (the new F2-F9 runtimes from Wave-2-A shard) need first-class mobile UX. Candidates take tests on phones 40%+ of the time in India per industry benchmarks.

### Architecture (ARJUN-led)
- Mobile breakpoint strategy: mobile-first Tailwind (`sm:` ≥ 640px is the desktop break). Audit every `/assess/*` route for touch-target ≥ 44×44, no horizontal scroll at 360px width.
- Camera + mic permissions UX for F9 video: native browser prompts only (no Android/iOS native shell in v1).
- Spreadsheet (F2) on mobile: read-only preview + "open on desktop to complete" guard for tasks marked `requires_desktop` (config per task). Don't fake responsive spreadsheet editing — honesty.
- SQL sandbox (F3) on mobile: monaco-editor with mobile keyboard quirks fixed (semicolons + braces on iOS keyboard).
- CRM/ERP sim (F6) on mobile: mark stacks as `desktop_only` if the workflow can't be done on touch (most SAP/Oracle flows). Honesty over false-completion.
- Video response (F9) on mobile: native MediaRecorder works; verify on iOS Safari 17+ and Chrome 110+.

### Backend (BHIMA-led)
- New endpoint `GET /v1/candidate/device-capability` returns whether candidate's user-agent supports the format. Front-end gates accordingly.
- Session telemetry includes `device_class` (`mobile-phone | tablet | desktop`) and `viewport_px`.

### Exit
- Lighthouse mobile score ≥ 90 on `/m/assess/sql-sandbox` and `/m/assess/video-response` (most common mobile flows).
- Manual QA on iPhone Safari + Android Chrome (Founder smoke-test signs off).
- F2 / F6 desktop-only guards verified — candidate is redirected, not silently broken.
- WCAG 2.1 AA on every mobile surface.

## R2 — Auto candidate ranking + shortlist (`/admin/candidates/ranking`)

### Current state
M4 grader returns `score`. No ranking UI. Recruiters can't filter or shortlist. Vervoe ships this as a hero feature.

### Architecture (joint)
- New page `/admin/candidates/ranking?role={role_id}` lists candidates for the role, default-sorted by `score DESC, completed_at DESC`.
- Multi-dimensional sort: skill-level breakdown (one column per skill from role.skill_battery), composite score, time-to-completion, anti-cheat flag count.
- Filter chips: skill-level threshold (e.g. "Top 25% on SQL"), seniority, region, calibration-status of the assessment they took.
- Shortlist action: select candidates → "Add to shortlist" → writes to `recruiter_shortlists` table → emits `r2_shortlist_added` event. Shortlist has a sharable view: `/admin/shortlist/:id` (cross-link to R3 shareable cards in P1 shard).
- Bulk action: bulk-message via R5 invite path (cross-ref); R5 is P1, so v1 just exports CSV.

### Backend (BHIMA-led)
- `GET /v1/admin/candidates/ranking?role_id=&filters=...` — paginated, default page size 50.
- Composite-score formula documented in `infra/Composite-Score-v0.md` (NEW spec — first land of this is R2's owner). Default: weighted average of skill scores with role.skill_battery weights from S2 role-graph (cross-link to programmatic SEO shard).
- Honesty: ranking must show calibration status per skill column. Ranking based on uncalibrated skills surfaces a warning banner.

### Exit
- p95 ranking-page load < 1.5s for role with 500 candidates.
- Calibration-status warning shows correctly when ≥ 1 skill in battery is `authored` (not calibrated).
- Shortlist round-trip works; CSV export valid.
- Honesty CI: composite-score formula version + skill calibration statuses included in every shortlist export (audit-trail).
- WCAG 2.1 AA + keyboard navigation on ranking table.

## N11 — Public REST API + OpenAPI docs (`api.qorium.online/v1/*` + `/docs`)

### Current state
`api.qorium.online` is live (Cloudflare-fronted, qorium-api PM2 #1). `infra/API-Documentation-v0.md` defines the response envelope. No public-facing OpenAPI docs. Vervoe leads with a fully documented API; ours is undocumented.

**Discovered drift:** `api.qorium.online/v1/health` returns **404** as of 2026-06-02 (probed this session). Either the path is wrong (likely `/healthz`) or the route is unwired. Codex MUST fix this before N11 ships, AND add the correct path to the public docs.

### Architecture (BHIMA-led)
- OpenAPI 3.1 spec at `apps/qorium-api/openapi.json`. Auto-generated from route handlers (fastify-swagger or zod-to-openapi — BHIMA picks; log decision).
- Docs UI at `https://api.qorium.online/docs` — Scalar or Redoc (lean, fast, no Stripe-style heavy framework).
- Public read at `https://qorium.online/openapi.json` (already live as of 2026-06-02 per CLAUDE.md).
- Versioning: `/v1/...` is current; `/v2/...` reserved.
- Auth: API-key auth via `Authorization: Bearer qrm_live_*` header. Keys issued via existing `qorium-api-key-mgmt` service (PM2 #183/#187).
- Rate limit: 60 req/min default per key, 5,000 req/day. Per-customer overrides via `api_keys.rate_limit_overrides` jsonb.
- Response envelope per `infra/API-Documentation-v0.md` — strict `{ ok, data, error }`.

### Endpoints to publish in v1
- `/v1/health`, `/v1/healthz` (fix the health-path drift)
- `/v1/jd-forge/extract` (M13 already live)
- `/v1/assess/{format}/session` (Wave-2-A formats)
- `/v1/assess/{format}/submit`
- `/v1/assess/{format}/result/:id`
- `/v1/admin/candidates/ranking` (R2)
- `/v1/responsible-ai/status` (Trust shell T3 — already specced)
- `/v1/content/pipeline-stats` (T5)
- Webhooks subscribe/list/test (`infra/Webhooks-Service-v0-Spec.md` — N12)
- ATS integrations are documented in `infra/ATS-Bridge-v0.md` (already speced) — surface but mark `Beta` per honesty.

### Exit
- `/docs` page live with at least 15 endpoints documented.
- OpenAPI valid (passes Schema.org-style validator + Swagger validator CI step).
- `qrm_live_*` API key issuance flow works end-to-end (admin can mint a key, key authenticates, rate limit enforced).
- Honesty: every endpoint marked `Live | Beta | Roadmap` in the docs. `Live` only if smoke-tested in CI on every deploy.
- Discovery drift fix: `/v1/health` returns 200, watchdog points to the correct path.

## E4 — Regional data residency (`/trust/residency` + tenant routing)

### Current state
QOrium runs on Hetzner / VPS in India (qorium-active-origin at `187.127.155.150`, talpro-vps at `147.93.103.194`). All data is in India by default. No customer-facing residency claim. No multi-region capability. Vervoe leads with "Regional Data Storage" as an enterprise feature.

### Architecture (joint)
- `/trust/residency` page (in T1 trust-shell scope — this shard adds the residency-specific content): "QOrium data resides in India by default. US residency available on enterprise tier."
- Per-tenant `residency` column on `customers` table: `india | us | eu` (US/EU = Roadmap; India = Shipped).
- Routing layer: `qorium-api` reads `customer.residency` on auth and routes DB connection to the regional cluster.
- v1 ships India-only (single-region honesty). US/EU show as "Roadmap" per T3 doctrine — date-stamped commitment.
- Compliance cross-links: DPDP residency posture (T2), audit-log per-region storage (E3 pointer in companion shard), customer audit-log export (E3).

### Backend (BHIMA-led)
- Add `residency_check` middleware in `qorium-api`. Logs every cross-region access attempt; blocks if `customer.residency != cluster.region`.
- DB connection pool per region (v1: single-region pool but interface in place for multi-region).
- Honesty: every `/v1/customer/me` response includes `residency: "india"` so customers can verify.

### UI (ARJUN-led)
- `/trust/residency` content (lives under T1 trust-shell layout): map of where data is stored, DPDP-aligned residency statement, evidence link to env config (sanitized).
- Customer admin panel: residency badge on org-settings page.

### Exit
- `/trust/residency` live, cited.
- `residency_check` middleware deployed on `qorium-api`. Cross-region access blocked (verified by adversarial test).
- Customer admin shows residency badge.
- DPDP page (T2) cross-links to residency page.
- US/EU are explicit Roadmap rows on T3 with date estimates (CEO sign-off on date).

## Telemetry

- Events: `mobile_session_started` (X4), `mobile_desktop_only_redirect` (X4 honesty), `ranking_filter_applied` (R2), `ranking_shortlist_added` (R2), `api_key_issued` (N11), `api_request_authenticated` (N11), `cross_region_access_blocked` (E4 audit).

## Exit criteria

1. All 4 surfaces live at the URLs above.
2. `api.qorium.online/v1/health` returns 200 (drift-fix).
3. Public docs at `/docs` live with ≥ 15 endpoints.
4. Mobile Lighthouse ≥ 90 on the 2 high-traffic flows.
5. Ranking UI loads < 1.5s p95 for 500 candidates.
6. Residency middleware blocks cross-region (adversarial test passes).
7. Rakshak ≥ 88/100 17/17 on qorium.online + api.qorium.online + admin.qorium.online (no regression).
8. WCAG 2.1 AA on ranking + mobile surfaces.
9. Honesty CI: every page renders calibration / residency / version status accurately.
10. CEO sign-off on US/EU residency Roadmap dates (T3 mandatory row).

## Coordination

- BHIMA owns: OpenAPI generation, API-key auth, rate limit, residency middleware, ranking endpoint, M4 wiring, health-path drift fix.
- ARJUN owns: `/docs` page, `/m/assess/*` mobile chrome, ranking UI, residency page content, badge components.
- Joint review: API key issuance UX, ranking composite-score weight defaults — both lanes + CEO.

## Parallel-work guard

`gh pr list --state all --search "enterprise"`. Lock `project-lock:qorium-enterprise-surface-w2` while mutating shared admin chrome.

## Open input (non-blocking)

- CEO: confirm US residency Roadmap target quarter (default: Q1 2027, contingent on first US customer with payment commitment).
- CEO: composite-score weight defaults — equal-weighted across role.skill_battery is the default; alternative is role-specific weights tuned by SME.
- CEO: API key naming convention — `qrm_live_*` and `qrm_test_*` is the default (Stripe-pattern).
