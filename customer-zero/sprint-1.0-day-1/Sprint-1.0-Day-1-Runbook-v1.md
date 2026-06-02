# Sprint 1.0 — Customer Zero Day-1 Runbook v1

> **The single document that takes QOrium from "code-shipped on `main`" to "first Talpro candidate runs through ReadyBank API alpha and gets a score."** Every step is owned. Every step has a verification check. Every step has a rollback. Every step is marked CTO-Office-autonomous (CTO) or CEO-≤60-sec (CEO) or Stream-B-build-loop (SB).

**Authored:** 2026-05-03 (Run #21)
**Authority:** CTO Office (autonomous mode per CEO delegation)
**Scope:** Customer Zero Day-1 only. Phase 1 hardening (Anti-Leak, Judge0, AI-Plagiarism Benchmark, full IRT) is Sprint 1.1+.
**Constitution refs:** SO-1 (Talpro Customer Zero), SO-9 (24h anti-leak — deferred to Sprint 1.1), SO-21 (IRT mandatory — start data collection), SO-24 (No-Fiction Rule)

---

## §0 — Definition of done

**Customer Zero Day-1 is COMPLETE when all of the following are true (verifiable):**

1. `https://api.qorium.online/healthz` returns HTTP 200 with `{ "status": "ok" }`
2. The `qorium-readybank-service` PM2 process is `online` with `<5%` CPU steady-state
3. The first internal Talpro API key (`qkr_2026_05_03_001`) successfully validates against `/v1/auth/echo`
4. The seed pack `seed-001-senior-java-customer-zero` (10 questions) is ingested and queryable via `GET /v1/questions/{id}`
5. **One real Talpro candidate** has completed the 6-MCQ smoke-test subset and a response payload is stored in `responses` table
6. A Pino-structured audit log entry exists for that candidate's session
7. The Customer Zero feedback channel (per D4 charter) has received the first feedback record

Anything less than 7-of-7 = Day-1 NOT complete; reschedule the missing items.

---

## §1 — Pre-flight checklist (CTO autonomous; complete before anything else)

| # | Step | Owner | Verify |
|---|------|-------|--------|
| 1.1 | Confirm Stream B `main` SHA is at `3528232` or later | CTO | `git log -1` in `/home/user/QOrium`; or check GitHub `sales799/qorium` |
| 1.2 | Confirm Stream B `qorium-readybank-service` builds clean (`npm ci && npm run build`) | SB | exit code 0 |
| 1.3 | Confirm Stream B `npm test` passes (target ≥59 tests green; 28 auto-skip on missing DATABASE_URL is acceptable for Day-1) | SB | exit code 0 |
| 1.4 | Confirm Hostinger VPS has free RAM ≥1.5 GB and disk ≥10 GB (per `talpro_vps_status`) | CTO | observed `talpro_vps_status` 2026-05-03: 7.3 Gi free RAM, 55 GB free disk → ✅ |
| 1.5 | Confirm Postgres `qorium` database exists on the chosen host (Mac Mini Docker pg-16 OR Hostinger VPS pg-16) | CTO | `psql -d qorium -c '\dt'` |
| 1.6 | Confirm Redis is up (used for API-key validation cache) | CTO | `redis-cli ping` returns `PONG` |
| 1.7 | Confirm `QORIUM_API_KEY_PEPPER` env var is set in Stream B service env (32+ random bytes) | CTO | `node -e "console.log(!!process.env.QORIUM_API_KEY_PEPPER)"` returns `true` |

**Stop condition:** if any 1.x is FAIL, do not proceed; resolve and re-run §1.

---

## §2 — Bridge Protocol live execution (CTO autonomous; ≤2 min)

**Why now:** Stream B's `_QORIUM_BUILD_LOG.md` lists 4+ CTO-DELTAs awaiting reconciliation. The Bridge Protocol (Sprint 0.6) ships the 23 Cowork specs into Stream B's repo so future spec questions are answered from the same canon as Stream A.

```bash
cd /Users/bhaskar_universe/Documents/Claude/Projects/QOrium
bash scripts/cowork-to-stream-b-bridge.sh --dry-run --verbose       # observe (≈30 sec)
bash scripts/cowork-to-stream-b-bridge.sh                           # live run (≈90 sec)
```

The script will:
1. Validate `/home/user/QOrium` clone (clone if missing).
2. Create branch `chore/cowork-spec-ingest-20260503`.
3. Copy 23 Cowork files → Stream B paths (per `governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md`).
4. Commit + push.
5. Print PR URL.

**CEO ≤30-sec action:** open the printed PR URL → click "Create pull request" → no review required (autonomous-mode pre-approved per CEO delegation; CTO Office self-merges within 1 min).

**Verify:** `git log --oneline origin/main` shows the new ingest commit within 5 min of merge.

**Rollback:** if script reports any error mid-flight, `git checkout main && git branch -D chore/cowork-spec-ingest-20260503`; rerun is idempotent.

---

## §3 — DNS for `api.qorium.online` (CEO ≤60-sec; Hostinger panel)

Per `talpro_nginx_status` 2026-05-03 17:17 UTC, **no `qorium` site is yet provisioned** in `/etc/nginx/sites-enabled/`. Sprint 1.0 needs `api.qorium.online` to resolve to the Hostinger VPS.

| Step | Action | Time |
|---|---|---|
| 3.1 | Open `https://hpanel.hostinger.com` → Domains → `qorium.online` → DNS Zone Editor | 20 sec |
| 3.2 | Add A record: name=`api`, value=`<VPS_PUBLIC_IPv4>`, TTL=3600 | 20 sec |
| 3.3 | Add A record: name=`@` (apex), value=`<VPS_PUBLIC_IPv4>`, TTL=3600 (for marketing site, future) | 10 sec |
| 3.4 | Save | 5 sec |

**CTO Office stamp once propagated:** `dig +short api.qorium.online` returns the VPS IPv4 within ~5 min (Hostinger TTL-honest).

**Rollback:** delete the A record; instant.

---

## §4 — Nginx + SSL provisioning (CTO autonomous via talpro MCP tools)

After DNS propagates:

| # | Step | Owner | Verify |
|---|------|-------|--------|
| 4.1 | Author `/etc/nginx/sites-available/qorium.online` config: `server_name api.qorium.online; proxy_pass http://127.0.0.1:<QORIUM_READYBANK_PORT>;` + security headers (HSTS, X-Content-Type-Options, X-Frame-Options); rate-limit zone 10r/s burst 20 | CTO | `nginx -t` clean |
| 4.2 | Symlink to `sites-enabled/`; reload Nginx | CTO | `talpro_nginx_status` shows `qorium.online` in enabled list |
| 4.3 | Issue Let's Encrypt cert via Certbot: `certbot --nginx -d api.qorium.online -d qorium.online -d www.qorium.online` | CTO | `talpro_ssl_status` shows valid cert with ≥89 days |
| 4.4 | Confirm `https://api.qorium.online/healthz` returns 200 (after §5 service is live) | CTO | `curl -I https://api.qorium.online/healthz` |

**Port assignment:** look up next free port in `_shared/PORT_REGISTRY.md`; assign as `QORIUM_READYBANK_PORT`. Update PORT_REGISTRY in same change.

**Rollback:** `rm /etc/nginx/sites-enabled/qorium.online && nginx -t && systemctl reload nginx`. Cert remains valid; harmless.

---

## §5 — Deploy `qorium-readybank-service` (Stream B build → CTO PM2)

**Two valid deployment paths. Choose one based on which host has Postgres + Redis available:**

### Path A — Hostinger VPS PM2 (preferred for Day-1)

| # | Step | Owner | Verify |
|---|------|-------|--------|
| A.1 | Build artefact: `npm ci && npm run build` in `/home/user/QOrium/services/qorium-readybank-service` | SB | `dist/` exists |
| A.2 | rsync `dist/` + `package.json` + `package-lock.json` + `infra/migrations/` to VPS `/opt/qorium/readybank-service/` | CTO | `ls /opt/qorium/readybank-service` |
| A.3 | `cd /opt/qorium/readybank-service && npm ci --omit=dev` | CTO | `npm ls` clean |
| A.4 | Run migrations: `node dist/scripts/migrate.js up` | CTO | `psql -d qorium -c '\dt'` shows `tenants`, `api_keys`, `questions`, `packs`, `responses` |
| A.5 | Add to PM2: `pm2 start ecosystem.config.js --only qorium-readybank-service` | CTO | `talpro_pm2_list` shows `qorium-readybank-service` online |
| A.6 | `pm2 save` | CTO | survives reboot |
| A.7 | Add watchdog: `talpro_watchdog_add` for `https://api.qorium.online/healthz` | CTO | `talpro_watchdog_list` |

### Path B — Mac Mini Docker (fallback if VPS RAM tight)

| # | Step | Owner | Verify |
|---|------|-------|--------|
| B.1 | Build Docker image: `docker build -t qorium-readybank:alpha .` | SB | image exists |
| B.2 | Run: `docker run -d --name qorium-readybank -p <port>:3000 --env-file .env qorium-readybank:alpha` | CTO | `docker ps` |
| B.3 | Cloudflare Tunnel (`cloudflared`) from Mac Mini → `api.qorium.online` | CTO | `curl -I https://api.qorium.online/healthz` |
| B.4 | Add to Mac Mini boot scripts | CTO | survives reboot |

**Rollback (either path):** `pm2 stop qorium-readybank-service && pm2 delete qorium-readybank-service` (Path A) or `docker stop qorium-readybank && docker rm qorium-readybank` (Path B).

---

## §6 — Mint first internal API key + seed first pack (CTO autonomous)

```bash
# On the host running qorium-readybank-service:
node scripts/issue-internal-key.js \
  --record-id qkr_2026_05_03_001 \
  --tenant talpro-india-customer-zero \
  --tenant-prefix talind001 \
  --scopes 'questions:read,search:read,export:bulk:csv,export:bulk:json,responses:write' \
  --expires 2026-10-30T23:59:59Z \
  --emit-plaintext-once stdout

# Capture plaintext from stdout into Signal one-time-link → CEO 1Password (per §6 of issuance record).
# Erase scrollback. Verify hash row exists in DB:
psql -d qorium -c "SELECT key_record_id, tenant_id, expires_at FROM api_keys WHERE key_record_id='qkr_2026_05_03_001'"

# Ingest seed pack:
node scripts/ingest-pack.js \
  --pack-file /opt/qorium/seeds/seed-pack-001-senior-java-Q001-Q010.json \
  --tenant talpro-india-customer-zero \
  --idempotency-key seed-001-2026-05-03

# Verify:
psql -d qorium -c "SELECT count(*) FROM questions WHERE pack_id='seed-001-senior-java-customer-zero'"
# expected: 10
```

**Verify end-to-end:**

```bash
curl -H "Authorization: Bearer qor_internal_talind001_<plaintext_32_hex>" \
     https://api.qorium.online/v1/questions/QOR-JAVA-001
# expected: 200 with question payload (no answer_key in response — answer_key is server-side only)
```

**Rollback:** `node scripts/revoke-internal-key.js --record-id qkr_2026_05_03_001 --reason "rollback"` + `node scripts/delete-pack.js --pack-id seed-001-senior-java-customer-zero --confirm` (idempotent re-run).

---

## §7 — First Talpro candidate run (CEO + Talpro Delivery Head)

**Goal:** the 7-of-7 Definition-of-Done item #5.

| # | Step | Owner | Verify |
|---|------|-------|--------|
| 7.1 | CEO names a real Talpro candidate (live recruiter pipeline; senior-Java JD); send invitation email per `smoke-test-invitation-customer-zero-day-1.md` | CEO | candidate clicks invitation link |
| 7.2 | Candidate authenticates via single-use session token (signed JWT, 24h TTL); takes the 6-MCQ smoke-test subset | candidate | session row created in `responses` |
| 7.3 | Candidate submits; service computes raw score (max 30 pts; pass ≥21) + records per-question time-on-task | system | row in `responses`, payload includes `question_id`, `selected_option`, `is_correct`, `time_on_task_ms` |
| 7.4 | Talpro recruiter receives one-page result PDF (auto-generated; templated per `infra/Result-PDF-v0-Spec.md` if exists, else minimal HTML→PDF via headless Chromium) | system | PDF in `/opt/qorium/results/<session_id>.pdf` |
| 7.5 | CTO Office collects the **first 3 lines of feedback** from candidate + recruiter via the Customer Zero feedback channel | CTO | rows in `customer_zero_feedback` table OR `customer-zero/sprint-1.0-day-1/first-feedback-log.md` |

**Pass criteria:**
- 6 MCQs delivered (no rendering bugs)
- Score persisted to DB
- Time-on-task ≥30 sec total (no instant-zero artefact)
- Recruiter can read the result PDF without confusion (1-line ack from recruiter is sufficient)

**If 7.4 missing template:** for Day-1, ship a plain HTML page (`/v1/results/<session_id>.html`) instead of PDF; PDF generation is Sprint 1.1.

---

## §8 — Observability (CTO autonomous; light-touch for Day-1)

For Day-1, **Pino structured logs to PM2 stdout are sufficient.** Full Loki/Grafana wiring is Sprint 1.1.

| # | Step | Owner |
|---|------|-------|
| 8.1 | Tail logs during smoke test: `pm2 logs qorium-readybank-service --lines 200` | CTO |
| 8.2 | Grep for errors: `pm2 logs qorium-readybank-service --err --lines 500 \| grep -i 'error\|warn'` | CTO |
| 8.3 | Confirm latency on protected route p95 < 200 ms; if exceeded, investigate before declaring Day-1 done | CTO |

**Watchdog:** add `talpro_watchdog_add` for `/healthz` (5-min interval; alert on 2 consecutive failures).

---

## §9 — Day-1 closeout

When all 7 Definition-of-Done items pass:

1. Update `Sprint-1.0-Day-1-In-Flight-Tracker.md` to all-green.
2. Append "Day-1 closed" entry to `IMPLEMENTATION-PROGRESS-TRACKER.md`.
3. Refresh `QORIUM-MISSION-CONTROL.md` to "Sprint 1.0 — DAY-1 COMPLETE".
4. Save session state with `session_save_state`.
5. Notify CEO via single `founder_request` consolidating: candidate name + score + 3-line feedback summary + watchdog status + next sprint preview (Sprint 1.1 — Anti-Leak Engine + AI Plagiarism Benchmark).

---

## §10 — Known deviations from canonical spec (recorded honestly per SO-24)

| # | What | Spec says | What we shipped | Recorded as |
|---|------|-----------|-----------------|-------------|
| D-1 | API-key hash | D3 §2.2: Argon2id | HMAC-SHA256 (CTO-DELTA #4 ratified 2026-05-03) | Stream B `_QORIUM_BUILD_LOG.md` + key issuance record §2 |
| D-2 | Anti-Leak Engine | SO-9: 24h rotation | Deferred to Sprint 1.1 (no rotation in Day-1; questions are single-use via watermark seeds for now) | This runbook §10 |
| D-3 | AI Plagiarism Benchmark | SO-22: ≥93% | Not run for seed pack (Phase 1 onboards the benchmark) | This runbook §10 |
| D-4 | Full IRT calibration (a, b, c per IRT pipeline) | SO-21: mandatory | Day-1 records raw responses; calibration runs nightly batch starting Sprint 1.1 | This runbook §10 |
| D-5 | Loki + Grafana dashboards | CTO Architecture v1 | Pino-to-stdout via PM2 logs only for Day-1 | This runbook §8 |

These deviations are explicit and time-boxed to Sprint 1.1 closure (≤14 days). If unresolved by Sprint 1.1 close, escalate via `founder_request`.

---

## §11 — One-line owner & ETA grid

| Phase | Owner | ETA from "go" |
|---|---|---|
| §1 Pre-flight | CTO | 5 min |
| §2 Bridge Protocol | CTO + 30-sec CEO click | 5 min |
| §3 DNS | **CEO ≤60 sec** | 5 min propagation |
| §4 Nginx + SSL | CTO | 10 min |
| §5 Deploy service | SB build + CTO ship | 20 min |
| §6 Key + seed | CTO | 5 min |
| §7 First candidate run | CEO names candidate; system runs | 30-90 min depending on candidate availability |
| §8 Observability | CTO | continuous |
| §9 Closeout | CTO | 10 min |

**Total wall clock from "go" to Day-1 closed:** **≈90 min** (excluding candidate availability).

**CEO time on critical path:** **≤2 minutes** (60 sec DNS + 30 sec PR merge + name candidate).

---

*Prepared by CTO Office, Run #21. Constitution v2.0 SO-1, SO-9, SO-21, SO-22, SO-24.*
