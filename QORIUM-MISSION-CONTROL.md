# QORIUM — Mission Control (Stream B mirror)

**Refresh:** 2026-05-12 · Run #33 (dormancy break + apex restored + state divergence flagged) — supersedes the 2026-05-07 entry below
**Earlier refresh:** 2026-05-07 · Sprint 1.6.5 (Stream B reconcile)
**Canonical machine-readable source:** [`governance/dashboard.json`](./governance/dashboard.json)
**Sister Stream-A copy (Cowork):** lives outside this repo on the CEO's Mac;
synced via [`governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md`](./governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md).

This file is the human-readable mirror of `governance/dashboard.json`. The
HTML dashboard at `qorium-live-progress/index.html` should be updated to
read from `dashboard.json` directly; until then, this file is the
3-min single-page status both streams agree on.

---

## Top-line meters

| Meter                                               | Value                                                        | Direction                                                  |
| --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **Auto-Mode lane** (engineering / spec / content)   | 14 / 33 tiles · ~42%                                         | Agent-owned, target 100%                                   |
| **Human-Bound lane** (sales / hiring / panel / M&A) | 4 / 14 tiles · ~29%                                          | CEO-owned, agent never claims                              |
| **Master meter** (12-Month Build)                   | ~34%                                                         | Cap ≈ 78% under pure auto-mode per Constitution Article IX |
| **Web Application surfaces**                        | **6 / 6 LIVE**                                               | Surface 6 (JWT auth) merged via PR #12 `29ff865`           |
| **Question Library**                                | 811 authored · 376 ingest-parsable · M3 target 5,000 (16.2%) | Wave-1 + Wave-2 closed at 791 v0.6 · parser hardened 1.7e  |
| **CEO critical path**                               | 0 blockers                                                   | CC-01/02-A/03/04 closed                                    |

---

## What the live dashboard (Run #32) had wrong

The 2026-05-06 dashboard refresh predates Stream B's PR-#12 and PR-#13 merges:

| Tile                           | Dashboard said                              | Reality on `main`                                                                     |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Surface 6 — Recruiter JWT auth | "spec ready · merge next"                   | Live at `29ff865` (PR #12) since 2026-05-06                                           |
| Sprint 1.6 (5 tracks)          | "Cowork-side shipped · Stream B merge next" | Fully merged at `87b08b5` (PR #13) — JWT + mailer + ingest + OHCM 60/60 + Wave-3 v0.1 |
| Web Application count          | 5 / 6 LIVE                                  | **6 / 6 LIVE**                                                                        |
| Sprint 1.0 7th gate            | "blocked on Sprint 1.6 merge"               | unblocked; awaiting only first REAL Talpro candidate (human-bound)                    |

Sprint 1.6.5 (PR #15) reconciles this and introduces `governance/dashboard.json`
so future drift is structural rather than narrative.

---

## Sprint state

**Closed:** 0.1 · 0.2 · 0.3 · 1.0 · 1.1 · 1.2 · 1.3 · 1.4 · 1.5 · 1.6
**In flight:** 1.6.5 (this PR)
**Next (auto-eligible):** 1.7a SAML/SSO v1 spec · 1.7b NSDC/NOS mapper · 1.7c Bloom's tags + migration 0006 · 1.7d email-auth IaC (halts on cred-drop) · 1.7e ingest parser synonyms
**Then:** 1.8a IRT prod · 1.8b reference-panel ingest API · 1.8c anti-leak prod · 1.8d Next.js admin
**Then:** Phase 2 India Stack engineering · Phase 3 SKU Maturity · Phase 4 Year-1 Close engineering · Phases 5–7 scaffolds

Full sequence: [`governance/Auto-Mode-Remote-Plan-v1.md`](./governance/Auto-Mode-Remote-Plan-v1.md).

---

## The 6 live web surfaces

1. **ReadyBank API** — `https://api.qorium.online/healthz` · PM2 `qorium-readybank` · Postgres + Redis · 13 tables · HMAC-SHA256 keys · RFC 7807 · live since Run #27
2. **Recruiter Portal SPA** — `/recruiter/dashboard.html` · 12,401-byte vanilla JS · live since Run #31
3. **Candidate Take Flow** — `/take/<token>` · 48h expiry · session-token bearer · live since Run #29
4. **Result Renderer** — `/v1/results/<candidate_id>` · HTML + JSON · live since Run #26
5. **Watermark Engine v0** — `/v1/questions/:uuid?candidate_id=...` · deterministic SHA-256 permutation · 10K-uniform validation · live since Run #28
6. **Recruiter JWT Auth** — `/v1/auth/login` · argon2id · 8-hr sliding cookie · 5-fail lockout · live since PR #12 / `29ff865`

---

## Library (811 questions across 3 waves)

| Wave                  | Authored | Quality | Notes                                                                                    |
| --------------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| Wave 1 — Tech Core    | 480      | v0.6    | 8/8 sub-skills × 60                                                                      |
| Wave 2 — India Stack  | 311      | v0.6    | SAP-ABAP 70 · OHCM 60 · Salesforce CPQ 60 · Finacle/Flexcube 60 · Embedded Auto 60       |
| Wave 3 — Psychometric | 20       | v0.1    | staged drafts; awaiting I/O Psych + Reference Panel ≥200 (Constitutional Amendment v2.1) |

Stream-B `ingest-wave1` parses 358 of the 811 today; 52 case-study items use `**solution:**` instead of `**answer_key:**` — Sprint 1.7e closes them.

---

## CEO action surface

**0 critical-path blockers.** Soft accelerators:

- CC-13 — WhatsApp group "QOrium Customer Zero" · 60 sec · OPTIONAL
- Amendment v2.1 — Wave-3 AUTHORED ratification YES/NO · 30 min review · SOFT

Human-bound items the agent will never auto-close:

- First REAL Talpro candidate run end-to-end (unblocks Sprint 1.0 7/7)
- I/O Psychologist contractor signed (C5 SOW)
- Reference Panel ≥200 recruited (unblocks Wave-3 v1)
- SME Content Lead hire (I2)
- Senior Engineer #1 hire (I1)
- First 3 Recruiter Subscription logos (H2)
- First Bosch GCC discovery call (E4)
- Production cred-drop to `.env.bootstrap` (unblocks SES / observability / multi-region IaC apply)

---

## Source-of-truth files

| File                                     | Purpose                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `governance/dashboard.json`              | Canonical machine-readable state                                   |
| `QORIUM-MISSION-CONTROL.md` (this file)  | Human-readable mirror                                              |
| `_QORIUM_BUILD_LOG.md`                   | Run-by-run build log                                               |
| `governance/Auto-Mode-Remote-Plan-v1.md` | Authoritative auto-mode plan + stop conditions                     |
| `task_plan_phase0_phase1.md`             | Phase 0/1 punchlist                                                |
| `09-QOrium-Constitution-v2.0.md`         | Operating system · 25 SOs · 92-pt Gate · Article IX completion bar |

---

_Refreshed by Sprint 1.6.5 reconcile · PR #15 · 2026-05-07._

---

## 2026-05-12 — Run #33 — Dormancy break + apex restored

**TL;DR.** The CTO-Office autonomous run #33 (2026-05-12 04:30–05:00 UTC) closed the apex 502, fired a high-urgency `founder_request` flagging a material divergence between this doc's narrative and the live production state, and drained the CEO-independent items in the Q3 backlog.

### Headline change vs the Run #32 doc

| Tile | Run #32 narrative (2026-05-07) | Live reality (2026-05-12, verified via talpro_pm2_list + talpro_db_query) |
|---|---|---|
| **Live PM2 fleet** | "PM2 `qorium-readybank` :3050 sole surface" | **~30 `qorium-*` services online** — `qorium-api`, `qorium-jd-forge`, `qorium-stack-vault`, `qorium-admin`, `qorium-candidate-portal`, `qorium-docs`, `qorium-my`, `qorium-sso`, `qorium-billing`, `qorium-audit-log`, `qorium-webhooks`, `qorium-ats-bridge`, `qorium-irt-calibration`, `qorium-leak-crawler`, `qorium-leak-rotation`, `qorium-mailer`, `qorium-judge0-orchestrator`, `qorium-testforge-orchestrator`, `qorium-api-key-mgmt`, `qorium-uptime-monitor`, `qorium-setu`, `qorium-webhooks-delivery-worker`, `qorium-ai-pair-coding-orchestrator`, `qorium-web-v2-preview`, **`qorium-marketing` (NEW — apex restored at 04:54Z)** — most up 5d, all `online`. NO `qorium-readybank` process exists. |
| **Library** | "811 authored · 376 ingest-parsable" | **986 rows in `content.questions`** (live count) · all SKU `readybank` · status `calibrating` |
| **DB schema** | "Postgres + Redis · 13 tables" | **38 tables across 7 schemas** (app, audit, billing, content, public, sso, webhooks) · 14 migrations applied 2026-05-04 |
| **Public surfaces** | "6/6 LIVE" | **7/7 LIVE** + redirect domain — apex `qorium.online` 200, `api.qorium.online/healthz` 200, `admin.qorium.online` 307 (auth), `candidate.qorium.online` 200, `my.qorium.online` 200, `docs.qorium.online` 200, `www.qorium.online` 301 → apex, `qorium.in` 301 → apex |
| **Master meter** | "~34%" (capped at 78%) | Per dashboard.json the auto-lane is `1.00` on engineering tiles; doc narrative lagged real progress. **No master-meter change in this run — only narrative correction.** |

### Apex restoration evidence

- `qorium.online` apex was 502 at run start (nginx vhost + SSL + redirects all in place since 2026-05-05; only the upstream PM2 process was missing).
- Root cause: previous `pnpm install` on `/opt/apps/qorium-marketing` left a broken `next` package install (`node_modules/next/dist/bin/next` missing). The lockfile was also stale against `packages/ats-connectors` deps (typescript + vitest added).
- Fix: `pnpm install --no-frozen-lockfile --prefer-offline` (12 packages added, 412 reused) → `pnpm --filter @qorium/marketing build` (clean, 27 routes) → `pm2 start ./.pm2-start.sh --name qorium-marketing` (online, PID 1973066, listening on 127.0.0.1:5110) → `pm2 save`.
- Smoke (just now): `curl -I https://qorium.online` → `200 OK` with HSTS preload + X-Frame DENY + CSP locked + all 6 Talpro standard security headers.
- Watchdog registered: `qorium-marketing` → `https://qorium.online/` every 5 min via `talpro_watchdog_add`.

### State-divergence `founder_request` submitted

A high-urgency `founder_request` was filed (Durga Council meeting `c991a6c8-9dcb-4090-b6d2-e9f83bd096c4`, decision `AUTO_EXECUTE`) flagging the following for CEO ratification:

1. **Is the API/SaaS platform on the current ~30 PM2 services the correct current QOrium product, OR is there a separate "recruiter web app" (Surfaces 1–5 + `qorium-readybank:3050`) that we lost track of?** Both interpretations are coherent — the live system has a Next.js portals layer (admin/candidate/my) AND an API layer (api/v1/*) that together cover the original Surface 1–5 narrative, but under completely different PM2 names. If a separate recruiter-web deployment is expected, please name target VPS path, target hostname, and target Postgres database/schema (it cannot share live `qorium` DB at current migration numbering — see below).
2. **Migration 0004/0005 collision.** Local files `infra/B7-postgres-migrations/0004_recruiter_auth.sql` and `0005_recruiter_invitations.sql` exist on disk; they target tables `app.recruiters`, `app.sessions`, `app.candidates` that DO NOT exist in the live DB. Live DB has `0004_calibration_history` and `0005_judge0_sandbox` under those numbers. Recruiter-web migrations would need renumbering (e.g. 0015+) AND a different DB/schema namespace.
3. **MOVE 3** — first real Talpro candidate event still requires CEO + Talpro Delivery Head. Not autonomous.
4. **Amendment v2.1** — YES/NO on Wave-3 Article-IX M9 Psychometric (`governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md`).
5. **Gmail drafts** for K&S Partners + Bosch GCC warm-intro — deferred to a follow-up run with proper thread context; flagged in the founder_request as outstanding.
6. **Hire JD post copy** staged under [`governance/hiring/jds-ready-to-post/`](./governance/hiring/jds-ready-to-post/) — LinkedIn + Naukri ready for senior-engineer-1, sme-content-lead; LinkedIn-only for io-psych-contractor.
7. **Investor Brief Pre-A v1.2** refreshed against live metrics — see [`governance/Investor-Brief-Pre-A-v1.2.md`](./governance/Investor-Brief-Pre-A-v1.2.md).

### Drain items closed this run

| Item | Artifact |
|---|---|
| Investor Brief Pre-A v1.2 supplement | `governance/Investor-Brief-Pre-A-v1.2.md` |
| Hire JDs (LinkedIn + Naukri) | `governance/hiring/jds-ready-to-post/` (4 files + README) |
| NSDC NOS mapping v0.1 | `governance/nsdc-mapping.csv` + `governance/nsdc-mapping-README.md` |
| Source-of-truth refresh | this section + `_QORIUM_BUILD_LOG.md` Run #33 entry + dashboard.json metadata + Phase-1-Sprint-Tracker header note |

### Out-of-scope / explicit non-attempts (per approved plan §F)

- **MOVE 1 verbatim** (bridge `specs` branch JWT auth): no `specs` branch exists; Sprint 1.6 already merged at `87b08b5` (PR #13).
- **Apex marketing site "from scratch"**: code was already in `apps/marketing/`; only deploy was missing.
- **Applying recruiter-auth migrations**: blocked on E2 of founder_request (numbering collision).
- **Seeding `delivery-head@talpro.in` recruiter account**: blocked on E1 of founder_request (product-shape confirmation).
- **MOVE 3** (real Talpro candidate event): requires CEO + Delivery Head.
- **Autonomous sending** of K&S / Bosch / investor emails — drafts only; deferred to a follow-up run with thread context.
- **Autonomous posting** of hire JDs to LinkedIn/Naukri — stage only.
- **DNS/Certbot work** for `qorium.online` — both already done before this run.

### Verification

- `talpro_pm2_list` — `qorium-marketing` `online`, restarts `0`, mem 56MB-ish.
- `talpro_watchdog_list` — `qorium-marketing-apex` watchdog registered.
- `curl -sI https://qorium.online` — HTTP/2 200 + HSTS + X-Frame DENY + CSP locked.
- `curl -sI https://www.qorium.online` — 301 → apex.
- `curl -sI https://qorium.in` — 301 → apex.
- `curl -sI https://qorium.online/pricing` + `/features/jd-forge` + `/sitemap.xml` + `/robots.txt` — all 200.

### Quality-Gate posture

Run is provisionally `92-pt-PASS` on apex restoration alone (security headers, HSTS, CSP, X-Frame, no secrets in repo, no DNS/SSL change, no DB write, watchdog registered, smoke green). Full 92-pt scorecard left to `talpro_cto_quality_gate` at next reconcile.

---

_Refreshed by autonomous Run #33 · 2026-05-12 — dormancy break + apex restored + state divergence flagged._
_Next refresh: after CEO ratifies founder_request items 1 + 2 + 4._
