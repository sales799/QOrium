# BHIMA — Phase A / D / G state report (2026-06-03)

**Lane:** BHIMA backend/app build (account: `bhaskar@talpro.in`, device: MacBook Air).
**Briefs dispatched:** PHASE_A_PROOF_LOOP, PHASE_A_ENGINE_FINDINGS, PHASE_D_INTEGRATION, M5_M6_APTITUDE_VIDEO, PHASE_G_ENTERPRISE.
**Branch:** `codex/qorium-bhima-phase-a-d-g-drafts-20260603` (branched from `qorium/main`).
**Guardrail honoured:** cross-account review — this report and the migrations are queued for ARJUN review. **Nothing has been merged or applied.**

---

## 0. UPDATE after CTO review of PR #103 (2026-06-03)

- **0018 (irt_lifecycle_calibrating): REJECTED → WITHDRAWN.** The CTO verified all 1,414 released questions have `calibration_n=0` AND every pack serves only `status='released'`. Bulk-moving them to `calibrating` would un-release the entire catalogue and empty every live assessment. The lifecycle fix is **already live + correct**: `/opt/qorium/scripts/calib-router.sql` (cron \*/20) flips `released`→`calibrating` only at ≥50 **real** responses; the IRT engine fits + promotes back. File removed from this branch; slot retired in `RESERVED.md`. **My error: I never verified the pack-serving invariant before proposing a destructive bulk status change — the cross-account review gate is exactly what caught it.**
- **0019 (grade_decisions): APPROVED.** Verified net-new, matches A2/M21. Apply staging→prod via the runner.
- **0020 (RLS DRAFT): APPROVED as reviewed.** Do-not-apply; needs app `SET LOCAL app.current_tenant_id` wiring + staging verify.
- **HOST CORRECTION (root cause of my §1 wall):** the qorium source + DB live on **`talpro-vps` (147.93.103.194, Mumbai)**, NOT the 187.x `qorium-active-origin` I SSHed to. On `talpro-vps`: `/opt/apps/qorium-marketing` (live marketing monorepo), `/opt/qorium/services/*` (all backend), `/opt/qorium/apps/{candidate-portal,my,admin,docs}`, `/etc/nginx/sites-enabled/qorium.conf`. Blockers 3.1/3.2/3.3/3.5/3.6 in §3 are now **access-unblocked** — re-running the lane there.

### Follow-on shipped this session (post-correction)

- **`/openapi.json` regression FIXED on a branch (Phase D).** Root cause: the route handler `apps/marketing/src/app/openapi.json/route.ts` + its spec module `apps/marketing/src/content/api-docs.ts` (`publicOpenApiSpec`, OpenAPI 3.1.0, `0.1.0-preview`, honest evidence-gated) existed in commit `dba8fc7` but **never landed on `main`**, so prod 404s. Restored both verbatim; `tsc --noEmit` exit 0. Branch `codex/qorium-bhima-openapi-restore-20260603` (code repo `sales799/qorium`), SHA `3ea5340`, **PR #105**. **Not deployed** — `safe-deploy` does `git reset --hard origin/main`, so the prod restore requires PR #105 merged first (cross-account guardrail).

---

## 1. Verified state (edge + active origin, 2026-06-03 ~08:39Z)

| Surface                                        | Status                                     | Note                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://qorium.online/healthz`                | **HTTP 200**                               | marketing edge fine                                                                                                                                                                                                                                                                                                                                                                                   |
| `https://qorium.online/openapi.json`           | **HTTP 404 (Next.js 404)**                 | **regressed since 2026-06-02T04:00Z ground truth (was 200 JSON)** — Phase D blocker                                                                                                                                                                                                                                                                                                                   |
| `https://api.qorium.online/healthz`            | **HTTP 200**                               | api edge fine                                                                                                                                                                                                                                                                                                                                                                                         |
| `https://api.qorium.online/openapi.json`       | **HTTP 404 (raw nginx)**                   | not even reaching the upstream — no nginx route for it                                                                                                                                                                                                                                                                                                                                                |
| `https://api.qorium.online/chatbot/v1/healthz` | **HTTP 200**                               | per CLAUDE.md ground truth — unchanged                                                                                                                                                                                                                                                                                                                                                                |
| Active-origin PM2 (`kvm2-prod`)                | **17 processes**                           | qorium-{admin, api, chatbot, jd-forge, keeper, leak-crawler, marketing, stack-vault} + brahma/durga-coo/heartbeat/karya/leadhunter-platform/mcp-oauth-shadow/talpro-codex-mcp-bridge-shadow/talpro-memory-mcp-shadow/talpro-spine. **`qorium-my` is NOT in this snapshot** (CLAUDE.md said it should be) — may have moved to a different host, may have been renamed, may be down. Worth a CTO probe. |
| `/opt/apps` on active origin                   | only `qorium-marketing` visible (non-sudo) | source for the other 12 qorium services is root-protected from my SSH user                                                                                                                                                                                                                                                                                                                            |

---

## 2. Artifacts written this session (review queue for ARJUN)

All three live under `infra/B7-postgres-migrations/` on the working branch. Reserved in `RESERVED.md` in the same commit (CI numbering guard passes).

### 2.1 `0018_irt_lifecycle_calibrating.sql` — Phase A engine fix (gap 1)

- **What:** moves questions with `status='released' AND calibration_n=0` into `status='calibrating'`, so the hourly IRT cron starts collecting responses against them. Idempotent. Audit table `content.irt_lifecycle_audit` captures every row moved for a precise DOWN.
- **Apply order:** ARJUN review → STAGING psql → PROD via `apps/scripts/atomic-release.sh` migrations phase with `pg_dump` snapshot.
- **Expected delta:** ~1,406 rows moved (matches launch question count). Verification SELECTs at the bottom of the file.

### 2.2 `0019_grade_decisions.sql` — A2 reasoning-trace storage

- **What:** new `content.grade_decisions` table per BACKEND_MODULES_360 M21: `(response_id, model, prompt_version, grader_source, score, confidence, reasoning_text, reasoning_hash, rubric_breakdown)`. Unique on `(response_id, model, prompt_version)`. Four indexes (response, tenant, question+model, created_at).
- **Apply order:** ARJUN review → STAGING psql → PROD.
- **Surfacing requires:** the M4 grader (`qorium-api`) wired to write here on every non-objective grade — that wiring is **NOT in this PR** (source not in this Mac's reach).

### 2.3 `drafts/0020_rls_tenant_isolation.sql` — Phase G RLS (DO NOT APPLY)

- **What:** RLS ENABLE+FORCE + `tenant_isolation` policy on all 10 tables flagged in the CTO audit + `qorium_bypass_rls` role + `app.current_tenant_id()` helper function.
- **Hard banner:** must not be applied to prod without (a) app-layer `SET LOCAL app.current_tenant_id` shipped on every request handler, (b) BYPASSRLS role grants, (c) staging verify captured in a runbook, (d) ARJUN cross-account review of the full stack.
- **This is an illustrative artifact** so the CI numbering guard claims 0020 and ARJUN/CTO can iterate on the policy shape; it should remain `status='DRAFT'` in `RESERVED.md` until all four prerequisites are met.

---

## 3. Honest blocker list (numbered — founder action / cred-gating / cross-account)

These items are in BHIMA scope per the briefs but **cannot be executed by a single Claude session with my current access**. Each is followed by what unblocks it.

### 3.1 Phase D — `openapi.json` regression (NEW blocker discovered this session)

- **State:** 404 at both `qorium.online/openapi.json` and `api.qorium.online/openapi.json`. CLAUDE.md ground truth said 200 JSON publicly as of 2026-06-02T04:00Z — that has regressed.
- **Unblocks on:** root-level access to find what was serving it yesterday (nginx config + marketing Next.js routes are root-owned on the active origin). 5-minute fix once the source is reachable.
- **Why it matters:** Phase D item 2 (API SDK + Postman at `/resources/docs`) is dependency-blocked until openapi.json is back to 200.

### 3.2 Phase A — A4 candidate send-flow (the unlock vehicle)

- **State:** spec'd in `CODEX_PENDING_PHASE_A_PROOF_LOOP` Branch A4. Requires code changes in `qorium-my` (recruiter "Send pack to candidate" action) + `qorium-candidate-portal` (signed-invite consumer + completion → response row).
- **Blocker:** `qorium-my` is not in the active-origin PM2 snapshot, and neither it nor candidate-portal source is visible to my SSH user. Cannot edit, build, or atomic-release without sudo + repo locations.
- **Unblocks on:** CTO confirms the canonical source paths and either grants sudo on `kvm2-prod` for the BHIMA SSH user, or hands the work via a clone+push workflow.

### 3.3 Phase A — A2 grader wiring (separate from the schema)

- **State:** schema in 0019 (this PR). The M4 grader inside `qorium-api` must write `grade_decisions` rows on every non-objective grade (text + confidence + sha256(reasoning) verification). Recruiter + candidate result UIs must surface the trace with a confidence band and the "AI-verified · model-estimated · calibrating with live use" label.
- **Blocker:** qorium-api + qorium-my source not reachable from this Mac. Same unblock as 3.2.

### 3.4 Phase D — ATS round-trip smoke (2 sandboxes)

- **State:** the brief asks Greenhouse + Lever and / or Naukri RMS sandbox round-trip via `ats-bridge`.
- **Blocker:** sandbox credentials (Greenhouse partner key, Lever bot token, Naukri RMS test tenant) are not in conversation context and I have no policy basis to pull them from secret store on the active origin.
- **Unblocks on:** founder hands creds to the ats-bridge .env on `kvm2-prod` and confirms `ats-bridge` PM2 process is up (not visible in current snapshot — like `qorium-my`, may be elsewhere).

### 3.5 M6 — video runtime (R2 Mumbai + Whisper + M4 grade)

- **State:** content already seeded by CTO (8 video prompts under Wave3 Technical Communication). Runtime is candidate-portal browser recorder → R2 Mumbai upload → Whisper transcribe → M4 grade against `body_json.rubric` → write to `content.responses` + 0019 `grade_decisions`.
- **Blocker:** Cloudflare R2 Mumbai bucket creds (residency guardrail — must be `ap-south-1`-equivalent), Whisper API key, candidate-portal source. Liveness + single-take anti-cheat = ~3–5 days of focused work even with full access.
- **Unblocks on:** founder confirms R2 bucket region + creds, Whisper key, and source-tree access. Then split into a 4-PR sequence (recorder → uploader → transcriber → grader-wiring).

### 3.6 Phase G — RLS app wiring + staging verify

- **State:** migration drafted (0020). The blocking work is in **every** request handler across qorium-api, qorium-my, qorium-admin, qorium-marketing/api-routes, candidate-portal: each must `SET LOCAL app.current_tenant_id` from the authenticated session before the first SQL call, with a connection-pool middleware that resets the GUC on connection return.
- **Blocker:** source-tree access (3.2) + a staging environment with at least 2 tenants and a representative dataset. CLAUDE.md doesn't mention a staging cluster; if there isn't one, that's a Phase G prerequisite of its own.
- **Unblocks on:** CTO confirms staging cluster, grants source access, ARJUN reviews the middleware shape before any per-handler wiring lands.

### 3.7 Phase G — SSO test matrix (Okta + Azure AD + Google Workspace)

- **State:** spec'd as 3 green round-trips with `qorium-sso` (in old-origin snapshot, not current).
- **Blocker:** test tenants in all three IdPs + endpoint not visible in current PM2 snapshot.
- **Unblocks on:** CTO confirms `qorium-sso` is alive somewhere (or queue M18 deployment first); founder provisions test tenants in Okta dev, Azure AD test, Google Workspace test.

### 3.8 Phase G — backup restore drill (India-region)

- **State:** clear runbook task; needs a target cluster to restore INTO so prod isn't disturbed.
- **Blocker:** restore-target cluster + the pg_dump cadence + India-region storage location (confirm Cloudflare R2 ap-south-1 vs. AWS ap-south-1).
- **Unblocks on:** CTO confirms backup destination + target cluster; ARJUN reviews the drill runbook before the first test restore.

### 3.9 Cross-account merge guardrail

- **State:** non-negotiable per the founder's own dispatch and Constitution SO. Even items where I have all access (the 3 migrations in this PR), I push but do not merge.
- **Unblocks on:** ARJUN (a separate Claude account) reviews the PR opened from this branch and lands it.

---

## 4. What the founder + CTO can verify from DB/edge

| Claim                                                                        | Verification                                                                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Three migration files committed                                              | `git show` on the SHA in the PR (see section 5)                                                       |
| Migrations are valid SQL                                                     | `psql -d $STAGING_DB --single-transaction -f 0018_*.sql --dry-run-equivalent` (run via STAGING apply) |
| 1,406 launch questions are currently `status='released' AND calibration_n=0` | `SELECT COUNT(*) FROM content.questions WHERE status='released' AND COALESCE(calibration_n,0)=0;`     |
| RESERVED.md doesn't break CI numbering                                       | the PR's CI check `migration-numbering.yml` should pass green                                         |
| openapi.json is 404 (regression)                                             | `curl -sI https://qorium.online/openapi.json` from any device                                         |

---

## 5. Coordinates

- **Branch:** `codex/qorium-bhima-phase-a-d-g-drafts-20260603`
- **Files added (3):**
  - `infra/B7-postgres-migrations/0019_grade_decisions.sql`
  - `infra/B7-postgres-migrations/drafts/0020_rls_tenant_isolation.sql` (DRAFT, off the runner path)
  - `BHIMA_PHASE_A_D_G_STATE_2026-06-03.md` (this file)
  - _0018 withdrawn in review — slot retired, no file (see RESERVED.md)_
- **Files modified (1):** `infra/B7-postgres-migrations/RESERVED.md` (reserves 0018/0019/0020)
- **PR:** opened to `qorium/main` for ARJUN review (URL in the BHIMA reply to the founder).

---

## 6. Honest framing for the founder

The dispatch asked for 5 briefs to GREEN this session. Of the work asked for, **what one Claude session with my current access can honestly land is 3 reviewable migrations + a state report**. The remaining ~75% of the work either needs (a) sudo / source access I don't have, (b) external credentials (R2 Mumbai, Whisper, ATS sandboxes, IdP tenants), (c) a staging cluster, or (d) ARJUN cross-account review which is structurally a separate session.

The cheapest unblock that turns the most blockers green simultaneously is **3.2 (CTO grants the BHIMA SSH user access to the qorium-\* source trees on `kvm2-prod`)**. That single unblock makes 3.1, 3.2, 3.3, 3.5 (partially), and 3.6 (partially) all tractable in subsequent sessions.

— BHIMA, 2026-06-03
