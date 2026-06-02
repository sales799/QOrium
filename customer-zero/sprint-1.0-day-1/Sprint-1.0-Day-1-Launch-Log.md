# Sprint 1.0 — Customer Zero Day-1 Launch Log

> **Append-only log of every meaningful action during Sprint 1.0 live execution.** Every line has a UTC timestamp, an actor (CTO/CEO/SB), and either evidence or an explicit "deferred" note. The Truth Hierarchy means: only commands that actually ran with observed output get a green checkmark.

**Log opened:** 2026-05-03T17:32 UTC (Run #22)
**Runbook:** `Sprint-1.0-Day-1-Runbook-v1.md`
**Tracker:** `Sprint-1.0-Day-1-In-Flight-Tracker.md`

---

## 2026-05-03T17:17:40 UTC — Pre-flight VPS state captured

| Check | Result | Tool / evidence |
|---|---|---|
| VPS up | ✅ uptime 17d, load 1.81/1.86/1.71 | `talpro_vps_status` |
| RAM free | ✅ 7.3 Gi free (Hostinger KVM4 16 GB) | `talpro_vps_status` |
| Disk free | ✅ 55 GB free of 193 GB (72% used) | `talpro_vps_status` |
| Swap | ⚠ 5.5 Gi used / 6 Gi (high pressure but functional; monitor) | `talpro_vps_status` |
| Redis | ✅ PONG; 7.39M used / 2 GB max | `talpro_redis_status` |
| Postgres reachable | ✅ port 5432 + pgbouncer 6432 LISTEN | `talpro_vps_ports` |
| Postgres `qorium` DB | ❌ NOT FOUND (36 DBs, no qorium) | `talpro_db_query list_databases` |
| Nginx site for qorium.online | ❌ NOT YET PROVISIONED | `talpro_nginx_status` |
| SSL cert for qorium.online / api.qorium.online | ❌ NOT ISSUED | `talpro_ssl_status` |
| Stream B `main` SHA `3528232` | ⚠ Cannot verify from Cowork (repo private; GitHub returns 404 on public API) | `WebFetch sales799/qorium` |

**Decision:** proceed with autonomous-side resolution of the ❌ items inside CTO Office's authority. Defer Stream B build verification to Stream B's own host attestation.

---

## 2026-05-03T17:30 UTC — Postgres provisioned (CTO autonomous)

```
sudo -u postgres psql -c "CREATE DATABASE qorium WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE template0;"
sudo -u postgres psql -c "CREATE ROLE qorium_app WITH LOGIN PASSWORD '<rotated>';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qorium TO qorium_app;"
sudo -u postgres psql -d qorium -c "GRANT ALL ON SCHEMA public TO qorium_app;"
```

**Result:** ✅
- DB `qorium` exists (PostgreSQL 16.13)
- Role `qorium_app` exists with LOGIN
- Connectivity test: `SELECT current_database(), current_user, version()` returned `qorium / qorium_app / PostgreSQL 16.13`
- Extensions verified available: `uuid-ossp`, `pgcrypto`, `citext`, `pg_trgm` (all required by Stream B PR #3 schema)

---

## 2026-05-03T17:32 UTC — Service env file written + password rotated (CTO autonomous)

```
/opt/apps/qorium/dotenv.production    (mode 600, root-owned, 403 bytes)

Variables (values redacted):
  NODE_ENV
  QORIUM_PORT=3050             ← free port verified via `ss -tlnp`
  DATABASE_URL                 ← qorium_app credential (rotated after first leak in audit)
  REDIS_URL                    ← uses Redis db 3 (isolated from other apps)
  QORIUM_API_KEY_PEPPER        ← 32-hex random, generated via openssl rand
  QORIUM_TENANT_DEFAULT=talpro-india-customer-zero
  QORIUM_LOG_LEVEL=info
  QORIUM_PUBLIC_BASE_URL=https://api.qorium.online
```

**Note on password rotation:** the initial `qorium_app` password was inadvertently emitted in a `sed` echo to the audit log during a connectivity test. To honour the security rules, the password was immediately rotated via `ALTER ROLE qorium_app WITH PASSWORD '<new>'` and the new value is stored only inside `/opt/apps/qorium/dotenv.production`. The old credential is dead.

---

## 2026-05-03T17:33 UTC — Service workspace provisioned (CTO autonomous)

```
/opt/apps/qorium/
├── bin/                  (script targets)
├── seeds/                (seed-pack JSON drops)
├── readybank-service/    (Stream B build target)
├── logs/                 (Pino + PM2 sinks)
└── dotenv.production
```

**Result:** ✅ directory tree present.

---

## 2026-05-03T17:35 UTC — Nginx site config staged (CTO autonomous)

```
/etc/nginx/sites-available/qorium.online    (65 lines, root:root mode 644)

Contents:
  - HTTP→HTTPS redirect (port 80) with ACME challenge passthrough
  - api.qorium.online vhost on 443 + http2:
      * proxy_pass to 127.0.0.1:3050
      * 5 security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
      * 10r/s rate limit, burst 20
      * dedicated /healthz proxy with short timeouts
      * access_log + error_log to /var/log/nginx/qorium-api.{access,error}.log
  - qorium.online + www.qorium.online vhost on 443:
      * 200-OK placeholder text page on /
      * 404 elsewhere (Phase 1.x lands real marketing site)
```

**Status:** ⏳ STAGED, NOT ENABLED. Symlink to `/etc/nginx/sites-enabled/` is intentionally absent — the cert paths reference `/etc/letsencrypt/live/qorium.online/...` which Certbot has not yet issued. Activating the symlink now would fail `nginx -t`. **Activation gated on:** (a) DNS A record `api.qorium.online → VPS_IPv4` propagating; (b) `certbot --nginx -d api.qorium.online -d qorium.online -d www.qorium.online` succeeding.

---

## 2026-05-03T17:36 UTC — Bridge Protocol dry-run (already verified Run #20)

```
bash scripts/cowork-to-stream-b-bridge.sh --dry-run
```

Verified earlier (Run #20) — 23/23 source files present in Cowork. Live run deferred to next "continue" cycle when Stream B's repo state is confirmable.

---

## CTO autonomous progress ledger (so far)

| Phase 1 → Definition-of-Done item | Status before Run #22 | Status after Run #22 |
|---|---|---|
| Postgres `qorium` DB | ❌ missing | ✅ created + role + GRANTS |
| `/opt/apps/qorium/` workspace | ❌ missing | ✅ provisioned |
| Service env file + secrets | ❌ missing | ✅ written, mode 600, root-owned |
| `QORIUM_PORT` selected | ❓ undefined | ✅ 3050 (verified free) |
| `QORIUM_API_KEY_PEPPER` | ❌ missing | ✅ generated, persisted |
| Nginx site config | ❌ missing | ⏳ staged at sites-available; awaiting cert + DNS |
| SSL cert | ❌ missing | ⏳ Certbot command ready; awaiting DNS |
| Bridge Protocol script | ✅ tested Run #20 | ✅ unchanged |
| Stream B build verified | ⚠ private repo, cannot verify from Cowork | ⚠ unchanged — Stream B host attestation needed |

---

## What's left on critical path

1. **CEO ≤60-sec** — DNS A record `api.qorium.online → VPS_IPv4` at Hostinger panel
2. **CTO autonomous (~5 min after DNS)** — `certbot --nginx -d api.qorium.online -d qorium.online -d www.qorium.online`
3. **CTO autonomous** — symlink Nginx site, `nginx -t`, `systemctl reload nginx`
4. **Stream B + CTO** — build `qorium-readybank-service`, rsync to `/opt/apps/qorium/readybank-service/`, run migrations
5. **CTO autonomous** — `pm2 start ecosystem.config.js --only qorium-readybank-service` + `pm2 save` + watchdog
6. **CTO autonomous** — mint API key #001 + ingest seed pack
7. **CEO** — name the first Talpro candidate; recruiter sends invitation email
8. **System** — first candidate completes 6-MCQ smoke test; CTO collects feedback

---

*Append entries below this line as each step completes.*
