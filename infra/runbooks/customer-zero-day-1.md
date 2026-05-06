# Customer Zero (Talpro India) Day-1 Deployment Runbook

**Owner:** CTO Office · **Last updated:** 2026-05-03 (Sprint 2.7)

This runbook reflects the v0 service surface as shipped through
Sprint 2.7. It maps every step from
`customer-zero/Customer-Zero-Day-1-Runbook.md` to a concrete v0
service health endpoint and command.

## Pre-flight (T-24 hours)

1. **Postgres ready**
   - Provision Hostinger Postgres 16 instance.
   - Set `DATABASE_URL_PROD` in `/opt/qorium/.env`.
   - Run `pnpm --filter @qorium/db migrate` to apply `0001` → `0012`.

2. **Redis ready**
   - Provision Redis 7+ on the same VPS.
   - Set `REDIS_URL` in `/opt/qorium/.env`.

3. **Pepper + signing secrets minted**
   - `openssl rand -hex 32` × 3 →
     `API_KEY_PEPPER`, `SSO_JWT_SIGNING_SECRET`, `NEXTAUTH_SECRET`.

4. **DNS records published** (CEO action)
   - `api.qorium.io` → VPS IP
   - `admin.qorium.io` → VPS IP
   - `docs.qorium.io` → VPS IP (or static-host CDN)

5. **TLS certificates provisioned** via Let's Encrypt + nginx.

## Boot (T-1 hour)

```bash
cd /opt/qorium
pnpm install --frozen-lockfile
pnpm build
pm2 start ecosystem.config.cjs --env production
pm2 save
```

## Smoke (T-0)

Run `pnpm --filter @qorium/smoke run check` from the VPS. The CLI
exercises every healthcheck primitive and reports pass/fail/skip with
a duration breakdown.

Expected pass list:

- `postgres.ping` — Postgres reachable
- `postgres.schema` — all required tables present
- `tcp.redis` — Redis reachable
- `http.readybank` (`http://localhost:5101/healthz`)
- `http.jd_forge` (`http://localhost:5102/healthz`)
- `http.stack_vault` (`http://localhost:5103/healthz`)
- `http.admin` (`http://localhost:5104/healthz`)
- `http.ats_bridge` (`http://localhost:5105/healthz`)
- `http.webhooks` (`http://localhost:5106/healthz`)
- `http.sso` (`http://localhost:5107/healthz`)
- `http.audit_log` (`http://localhost:5111/healthz`)
- `http.billing` (`http://localhost:5112/healthz`)
- `http.api_key_mgmt` (`http://localhost:5113/healthz`)

## Talpro key issuance (T+0)

1. **Create the tenant row** (one-off SQL, witnessed by CTO):
   ```sql
   INSERT INTO app.tenants (name, slug, status)
   VALUES ('Talpro India', 'talind001', 'active') RETURNING id;
   ```
2. **Issue the internal-namespace key** via api-key-mgmt:
   ```bash
   curl -X POST https://api.qorium.io/v1/api-keys \
     -H "Authorization: Bearer <CTO admin JWT>" \
     -H "x-tenant-id: <talpro tenant uuid>" \
     -d '{"family":"internal","tenant_prefix":"talind001","bundle":"talpro_internal","name":"Talpro Customer Zero"}'
   ```
3. **Persist the raw key** in Talpro's secret manager (1Password vault
   `qorium/talpro-customer-zero/api-key`).
4. **Rotation reminder** — capture `rotation_due_at` from the response;
   the secret rotation worker (Sprint 2.8) will surface alerts at T-30
   days and T-7 days.

## Talpro tenant onboarding (T+24h)

1. Talpro Delivery Head opens
   `https://admin.qorium.io/admin/customers` and confirms the
   onboarding checklist.
2. Talpro configures SSO at `https://admin.qorium.io/admin/sso`
   (test_mode → active once IdP test login passes).
3. Talpro adds a webhook subscription for the events they care about
   at `https://admin.qorium.io/admin/webhooks`.
4. Talpro reviews the audit log at
   `https://admin.qorium.io/admin/audit` to confirm their team's first
   actions are flowing.

## Halt conditions / escalation

- **Postgres unreachable** → CTO + Hostinger ticket.
- **Smoke `http.*` fail** → `pm2 logs qorium-<service>` for the
  service, then escalate.
- **API key issuance throws** → check `API_KEY_PEPPER` length ≥ 32.
- **SSO ACS rejects assertion** → see CTO-DELTA #21; live IdP
  credentials may not yet be wired.
- **Razorpay webhook 401** → KYB account not yet completed (Sprint
  2.6 CTO-DELTA #24).

## Day-1 rollback

```bash
pm2 stop all
git checkout <last-known-good-commit>
pnpm install --frozen-lockfile && pnpm build
pm2 start ecosystem.config.cjs --env production
```
