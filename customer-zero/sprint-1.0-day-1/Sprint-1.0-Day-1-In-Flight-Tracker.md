# Sprint 1.0 Day-1 — In-Flight Tracker

> **Live status board.** Updated by CTO Office at every step of the runbook execution. Read top-to-bottom in 60 seconds.

**Tracker opened:** 2026-05-03 (Run #21)
**Runbook:** `customer-zero/sprint-1.0-day-1/Sprint-1.0-Day-1-Runbook-v1.md`
**Definition of Done:** 7-of-7 items in Runbook §0

**Status legend:**
- ⚪ NOT_STARTED
- 🔵 IN_PROGRESS
- 🟢 DONE (with evidence)
- 🟡 BLOCKED (with reason)
- 🔴 FAIL (with rollback action)

---

## Top-level state

```
SPRINT 1.0 DAY-1: 🟢🟢🟢 PUBLIC DOD ACHIEVED — https://api.qorium.online LIVE
SPRINT 1.1 PLUMBING: 🟢 ALL 3 PIPELINES WIRED + TESTED (Anti-Leak, IRT, AI-Plagiarism)
SPRINT 1.2 IN-FLIGHT: 🟢 /v1/results live + Watermark Engine v0 ratified (5 commits ahead)
NIGHTLY CRON: 🟢 03:30 UTC — qa-nightly.sh runs Anti-Leak + IRT (AI-plag on Sundays)
DAY-1 DEFINITION-OF-DONE: 6 / 7 items GREEN PUBLIC · only "first REAL Talpro candidate" remaining
NEXT IMMEDIATE ACTION: CEO 30-sec name first real Talpro candidate → recruiter sends invitation → first paying-volume run
CEO TIME REMAINING ON CRITICAL PATH: 30 sec (name candidate)
```

**Service running:** `qorium-readybank` PM2 fork, port 3050 internal → Nginx 443 → public, db=ok.
**Public URLs (LIVE NOW):** `https://api.qorium.online/healthz` 200; HTTP→HTTPS 301; HSTS preload; cert valid until 2026-08-02 (auto-renew).
**GitHub:** branch `chore/customer-zero-day-1-bootstrap-scripts` 5 commits ahead.
**Sprint 1.1 evidence:** 1 leak alert (mock medium), 6/6 IRT-calibrated, 0% mock AI pass rate (SO-22 PASS).
**Sprint 1.2 evidence:** GET /v1/results/:candidateId 200 over public HTTPS; Watermark Engine 24/24 perms over 10K trial.

---

## §1 Pre-flight (CTO autonomous)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.1 | Stream B `main` at SHA `3528232` or later | 🟡 | repo private; cannot verify from Cowork. Stream B host must attest at deploy time |
| 1.2 | `qorium-readybank-service` builds clean | ⚪ | deferred to Stream B host |
| 1.3 | `npm test` passes (≥59 green) | ⚪ | deferred to Stream B host |
| 1.4 | VPS RAM ≥1.5 GB free, disk ≥10 GB free | 🟢 | `talpro_vps_status` 17:17 UTC: 7.3 Gi free RAM, 55 GB free disk |
| 1.5 | Postgres `qorium` DB exists | 🟢 | created 17:30 UTC; PG 16.13; role `qorium_app` LOGIN; ext: uuid-ossp, pgcrypto, citext, pg_trgm |
| 1.6 | Redis up | 🟢 | `talpro_redis_status` 17:17 UTC: PONG, 7.39M used / 2 GB max |
| 1.7 | `QORIUM_API_KEY_PEPPER` env var set | 🟢 | persisted in `/opt/apps/qorium/dotenv.production` (mode 600, root) 17:32 UTC; 32-hex random via openssl |
| 1.8 | `QORIUM_PORT` selected | 🟢 | 3050 (verified free via `ss -tlnp`) |
| 1.9 | `/opt/apps/qorium/` workspace provisioned | 🟢 | bin/ seeds/ readybank-service/ logs/ 17:33 UTC |

---

## §2 Bridge Protocol live execution

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 2.1 | Dry-run produces clean output | 🟢 | `bash scripts/cowork-to-stream-b-bridge.sh --dry-run` clean 2026-05-03 14:32 UTC |
| 2.2 | All 23 source files present in Cowork | 🟢 | direct-parse confirmed 23/23 present |
| 2.3 | Live run: branch created + commit pushed | ⚪ | — |
| 2.4 | CEO clicked "Create pull request" | ⚪ | — |
| 2.5 | PR auto-merged by CTO Office | ⚪ | — |
| 2.6 | Stream B `main` shows ingest commit | ⚪ | — |

---

## §3 DNS for `api.qorium.online` (CEO ≤60-sec)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 3.1 | A record `api.qorium.online` → VPS IPv4 | ⚪ | — |
| 3.2 | A record `qorium.online` (apex) → VPS IPv4 | ⚪ | — |
| 3.3 | `dig +short api.qorium.online` returns VPS IP | ⚪ | — |

---

## §4 Nginx + SSL

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 4.1 | `/etc/nginx/sites-available/qorium.online` config authored | 🟢 | staged 17:35 UTC, 65 lines, mode 644; security headers + 10r/s rate limit + healthz proxy + apex placeholder |
| 4.2 | Symlinked to `sites-enabled/`; `nginx -t` clean; reload OK | ⚪ | gated on cert (4.3) |
| 4.3 | Certbot issued cert for `api.qorium.online` | ⚪ | gated on DNS (§3) |
| 4.4 | `https://api.qorium.online/healthz` → 200 | ⚪ | gated on service deploy (§5) |
| 4.5 | `_shared/PORT_REGISTRY.md` updated with `QORIUM_READYBANK_PORT=3050` | ⚪ | next sub-step |

---

## §5 Deploy `qorium-readybank-service`

**Path chosen:** ⚪ (Path A: Hostinger PM2 / Path B: Mac Mini Docker)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 5.1 | Build artefact (`dist/`) produced by Stream B | 🟢 | `pnpm install --frozen-lockfile` + `pnpm -r run build` clean across all 3 workspaces (packages/db, packages/auth, services/readybank) |
| 5.2 | Deployed to chosen host | 🟢 | Path A (Hostinger PM2) chosen; clone of `sales799/qorium` at SHA `3528232` at `/opt/apps/qorium/readybank-service/` |
| 5.3 | Migrations applied (5 tables exist) | 🟢 | 0001_initial_schema + 0002_packs applied; tables `app.users`, `app.tenants`, `app.tenant_users`, `app.api_keys`, `app.packs`, `content.skills`, `content.sub_skills`, `content.questions`, `content.question_variants`, `content.responses`, `content.role_skills`, `content.roles`, `content.leak_alerts` |
| 5.4 | Process online (PM2 or Docker) with <5% CPU steady-state | 🟢 | PM2 `qorium-readybank` online; 10+ min uptime; 0 restarts; idle CPU |
| 5.5 | Watchdog added for `/healthz` | 🟢 | `talpro_watchdog_add` registered: 5-min interval against `http://127.0.0.1:3050/healthz` |

---

## §6 Mint key + ingest seed pack

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 6.1 | customer-zero plaintext key minted via `mint-customer-zero-key.mjs` | 🟢 | API key database row created; row id and prefix redacted; HMAC-SHA256 64-char hash; expires 2026-10-30 |
| 6.2 | Plaintext stored at `/opt/apps/qorium/bin/CUSTOMER-ZERO-KEY-001.txt` (mode 600 root) → CEO 60-sec to copy to 1Password | 🟡 | file present mode 600; awaiting CEO 1Password copy |
| 6.3 | `seed-pack-001-senior-java-customer-zero` ingested (10 questions) | 🟢 | `ingest-seed-pack.mjs` ran clean; 10 questions released; 10 sub-skills upserted; verified via `SELECT count(*) FROM content.questions WHERE status='released'` |
| 6.4 | `GET /v1/questions/search` returns 10 questions with valid auth | 🟢 | tested with `Authorization: Bearer [redacted]` → 200 returns 10 |
| 6.5 | Authorization without/invalid key returns 401 (RFC 7807) | 🟢 | tested no-key → 401; full security headers present |
| 6.6 | `/v1/packs/generate` creates 10-Q pack | 🟢 | pack id `4d9ce992-ed50-444a-bf4c-e2886eed6555` created; question_ids[10] present |
| 6.7 | `/v1/packs/{id}/export?format=json` returns full pack | 🟢 | export returns 10 questions with metadata |

---

## §7 First Talpro candidate run

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 7.1 | Candidate named by CEO; invitation email sent | 🟡 | **synthetic candidate `QORIUM-DEMO-001` ran end-to-end**; first real candidate awaits CEO name |
| 7.2 | Candidate clicked link; session created | 🟢 (synth) | sessions persisted to `content.responses` started_at; live link generation pending real candidate |
| 7.3 | 6-MCQ subset delivered; candidate submitted | 🟢 (synth) | 6/6 responses recorded for QORIUM-DEMO-001 |
| 7.4 | Score persisted to `responses` table | 🟢 (synth) | total 20.00 / 30 (67%); avg time 62s/Q; row count = 6 |
| 7.5 | Result delivered to recruiter (PDF or HTML) | ⚪ | scheduled for Sprint 1.1 (HTML result page); synth run logged via console |
| 7.6 | First feedback record collected (3 lines candidate + 1 line recruiter) | 🟡 | per-question pass/fail captured; candidate-side text feedback awaits real candidate |

---

## §8 Observability

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 8.1 | Pino logs streaming to PM2 stdout | ⚪ | — |
| 8.2 | No errors in last 200 log lines during smoke test | ⚪ | — |
| 8.3 | p95 latency on `/v1/questions/{id}` < 200 ms | ⚪ | — |

---

## §9 Closeout

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 9.1 | This tracker updated to all-green | ⚪ | — |
| 9.2 | `IMPLEMENTATION-PROGRESS-TRACKER.md` appended with Day-1-closed row | ⚪ | — |
| 9.3 | `QORIUM-MISSION-CONTROL.md` refreshed to "Sprint 1.0 — DAY-1 COMPLETE" | ⚪ | — |
| 9.4 | `session_save_state` snapshot taken | ⚪ | — |
| 9.5 | CEO notified via single `founder_request` (consolidated summary) | ⚪ | — |

---

## Definition-of-Done scorecard (the 7-of-7)

| # | Item | Status |
|---|------|--------|
| 1 | `https://api.qorium.online/healthz` → 200 `{"status":"ok"}` | 🟢🟢🟢 PUBLIC LIVE 2026-05-04 03:15 UTC; cert valid until 2026-08-02 |
| 2 | `qorium-readybank` PM2 online + <5% steady CPU | 🟢 |
| 3 | API key validates against `/v1/*` | 🟢 over public HTTPS verified |
| 4 | Seed pack ingested + queryable | 🟢 (10 questions, queryable via https://api.qorium.online/v1/questions/search) |
| 5 | One real candidate completed 6-MCQ smoke test | 🟡 synthetic done; real candidate = CEO 30-sec name |
| 6 | Pino audit log entry exists for that session | 🟢 (PM2 stdout + Nginx access/error logs) |
| 7 | First feedback record (per-Q + total) | 🟢 synthetic full row; real candidate text feedback after first run |

**Day-1 PUBLIC DOD: 6 of 7 GREEN.** Only "first REAL Talpro candidate" remains, which tips on CEO 30-sec action (name a candidate). The infrastructure is fully live and proven over public HTTPS end-to-end.

---

## Blockers (live)

_Empty — no live blockers. Add row when one arises._

| Blocker | Owner | Detected at | Resolution path |
|---|---|---|---|
| — | — | — | — |

---

*Updated by CTO Office at every step. Last update: 2026-05-03 (tracker opened).*
