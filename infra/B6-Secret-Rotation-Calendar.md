# QOrium Secret Rotation Calendar & Policy
**Authored by CTO Office 2026-05-02**  
**Owner: CTO Office (until M9 dedicated Security hire)**  
**Status:** Active — effective from May 2026

---

## 1. Rotation Principles

QOrium handles production secrets (API keys, database credentials, encryption keys, tokens) according to **principle-based rotation** aligned with:

- **QOrium Constitution Standing Order #9**: Anti-leak rotation cadence; aggressive secret hygiene
- **Threat model**: Assume external API keys (Anthropic, OpenAI, Serper) may be discovered in logs, build artifacts, or via third-party abuse. Database credentials assume VPS compromise risk. All secrets are time-limited.
- **Security posture**: Secrets are rotated per-schedule OR on-demand if compromised/suspected leak. Rotation events logged to audit trail.

**Key principles:**
1. No secret lives forever; all have expiration dates
2. Rotation is deterministic (calendar-scheduled) and on-demand (after incidents)
3. Zero human delay: auto-rotate or automated runbook (no waiting for approvals)
4. Every rotation is audited and logged
5. Customers notified of breaches within 24 hours (per A7 DPA)

---

## 2. Per-Secret Rotation Cadence Table

| Secret | Type | Rotation Cadence | Risk Level | Notes |
|--------|------|------------------|------------|-------|
| **DATABASE_URL_PROD** | PostgreSQL connection + password | 90 days | **High** | Database compromise is critical. Managed service (DigitalOcean/RDS) provides credential rotation. CTO Office rotates on calendar. |
| **DATABASE_URL_STAGING** | PostgreSQL staging connection | 180 days | Medium | Lower risk; less frequent rotation. Test data only. |
| **Razorpay API Key (Live)** | Payment provider (live) | 90 days | **High** | Live keys can directly debit customers. Rotate aggressively. Applied in Phase 3 when payment live. |
| **Razorpay API Key (Test)** | Payment provider (test) | 180 days | Low | Test keys have no financial impact; rotated less frequently. |
| **Anthropic API Key (Claude)** | LLM generation (primary) | 180 days | High | Primary AI provider; compromise means token quota abuse. Cost cap enforced; key rotation per 180d schedule. |
| **OpenAI API Key (GPT-5 fallback)** | LLM fallback | 180 days | High | Fallback key; same risk as Anthropic. Rotated in sync with Anthropic. |
| **Google Gemini API Key** | LLM (specific tasks) | 180 days | Medium | Lower volume; specific task isolation. Rotated per schedule. |
| **OpenRouter API Key** | LLM gateway (if used) | 180 days | Medium | Lower risk; smaller API footprint. Rotated per schedule. |
| **Serper.dev API Key** | Web search (anti-leak crawl) | 180 days | Medium | Anti-leak crawl dependency; high request volume. Quota abuse risk; rotate per 180d. |
| **Cloudflare R2 Access Key ID + Secret** | Object storage (exports, backups) | 90 days | High | Separate keys per environment (staging/prod). Compromise allows data exfiltration. Rotate aggressively. |
| **GitHub PAT (Deploy)** | Deployment automation | 90 days | High | Deploy key can trigger production releases. Rotate before every major deployment. Store in GitHub Actions Secrets; rotate on calendar. |
| **Sentry DSN** | Error tracking (public-ish) | 365 days | Low | DSN is semi-public (embedded in frontend); low risk; rotate annually. |
| **Grafana Cloud API Token** | Metrics + alerts | 180 days | Medium | Token compromise means alert manipulation. Rotate per 180d. |
| **PM2 Deploy Key (SSH)** | PM2 deployments | 180 days | High | SSH key for remote PM2 reload commands. Rotate per 180d or if VPS accessed. |
| **Talpro Sentinel Webhook Key** | Internal monitoring | 180 days | Medium | Integration with Talpro monitoring. Rotate per 180d. |
| **SES/Resend SMTP Keys** | Email sending | 180 days | Medium | Email provider credentials; compromise means spam. Rotate per 180d. |
| **TLS Certificates (Let's Encrypt)** | HTTPS/TLS | 60 days | Medium | Automatic renewal via certbot; transparent rotation. No manual action. |

---

## 3. Rotation Runbook (Generic 5-Step Process)

**For every rotation (applies to all secrets):**

### Step 1: Pre-rotation verification (CTO Office)
- Confirm secret is approaching expiration (5-7 days prior)
- Verify no ongoing deployments or critical incidents
- Alert team: "Secret rotation planned for [DATE]"

### Step 2: Generate new secret
- Request new credential from provider (Anthropic, Razorpay, etc.) or generate locally (database password)
- Test new secret with read-only API call (if applicable) to verify validity
- Store new secret in temporary secure location (password manager, encrypted note)

### Step 3: Update environment
- Update `.env.production` secret in GitHub Actions Secrets (if applicable)
- OR update Cloudflare Workers KV / deployment config
- OR update `.env.local` + re-encrypt on VPS (for PM2 env vars)

### Step 4: Deploy + validate
- Trigger deployment (depends on secret type):
  - **API keys (Anthropic, Serper)**: PM2 restart services; tail logs for "unauthorized" errors
  - **Database URL**: Restart database connection pool (PM2 cluster reload)
  - **GitHub PAT**: Next deploy automatically uses new key
  - **TLS certs**: Auto-renewed; no manual restart
- Verify all services healthy via health checks: `curl https://api.qorium.io/health`

### Step 5: Archive old secret + log rotation
- Revoke old secret on provider side (if provider allows; e.g., GitHub revoke old PAT)
- Log event: `echo "[$(date)] SECRET_ROTATED=DATABASE_URL_PROD prev_key_hash=xxx" >> /opt/qorium/logs/secret-rotation.log`
- Audit trail: Every CTO Office member signs off on rotation completion

---

## 4. Per-Secret Rotation Procedures

### DATABASE_URL_PROD (90-day cadence)
**Responsibility:** CTO Office  
**Trigger:** Calendar (90 days from last rotation)

1. **Verify no active deployments** (check GitHub Actions, PM2 logs)
2. **Generate new Postgres password** via DigitalOcean/RDS console
   - New user OR rotate existing user password (depends on provider)
   - Test connectivity: `psql $DATABASE_URL_PROD -c "SELECT 1;"`
3. **Update GitHub Actions Environment Secret** (`DATABASE_URL_PROD`)
4. **Deploy to staging first** (validate with read-only query)
5. **PM2 reload all services** (cluster mode rolling restart)
6. **Monitor logs** for connection errors (Sentry, Grafana)
7. **Revoke old password** in provider console
8. **Log rotation event** with timestamp + hash of old credential

---

### Anthropic API Key (180-day cadence)
**Responsibility:** CTO Office  
**Trigger:** Calendar (180 days from last rotation) OR on-demand if quota abuse detected

1. **Check current month's token spend** (Anthropic console)
2. **Generate new API key** (Anthropic account dashboard)
3. **Store new key securely** (1Password or GitHub Secrets directly)
4. **Update GitHub Actions Secrets** (`ANTHROPIC_API_KEY`)
5. **Deploy to staging first**, run AI generation test (e.g., small JD-Forge request)
6. **PM2 restart** `qorium-api` and `qorium-jd-forge` services
7. **Monitor token rate** (Anthropic API dashboard) for 30 min post-rotation
8. **Revoke old key** (Anthropic console)
9. **Set calendar reminder** for next rotation (180 days from today)

---

### Razorpay Live Key (90-day cadence; Phase 3+)
**Responsibility:** CTO Office + Finance (CFO approval required)  
**Trigger:** Calendar (90 days) OR on-demand if compromise suspected

1. **CFO approval** (Razorpay key controls payment flow; requires sign-off)
2. **Backup current subscription state** (Razorpay API: export all active subscriptions)
3. **Generate new key pair** (Razorpay dashboard; keep test keys unchanged)
4. **Test with 1 test transaction** (refund immediately after)
5. **Update GitHub Actions Secrets** (`RAZORPAY_KEY_LIVE`, `RAZORPAY_SECRET_LIVE`)
6. **Deploy and monitor** (check Razorpay webhook delivery; watch for failed transactions)
7. **Revoke old key** (Razorpay dashboard)
8. **Notify Finance** of successful rotation

---

### GitHub PAT (Deploy) (90-day cadence)
**Responsibility:** CTO Office  
**Trigger:** Calendar (90 days) OR after every major production deploy

1. **Generate new PAT** (GitHub Settings → Developer settings → Personal access tokens)
   - Permissions: `repo`, `workflow`, `read:org`
   - Expiration: 90 days
2. **Store new PAT in GitHub Actions Secrets** (`PM2_DEPLOY_KEY` or equivalent)
3. **Test with dry-run deploy** (staging only)
4. **Delete old PAT** (GitHub dashboard)
5. **Log rotation** with timestamp

---

### Cloudflare R2 Keys (90-day cadence)
**Responsibility:** CTO Office  
**Trigger:** Calendar (90 days) OR on-demand if export/upload compromised

**Note:** Create separate key pairs per environment (staging/prod).

1. **Staging**: Generate new R2 API token (limited to staging bucket)
2. **Prod**: Generate new R2 API token (limited to prod bucket + backups)
3. **Update GitHub Actions Secrets** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` per env)
4. **Deploy** (services re-read env on restart)
5. **PM2 restart** `qorium-api` (for export functionality)
6. **Verify exports work** (test pack generation)
7. **Revoke old tokens** (Cloudflare dashboard)

---

### TLS Certificates (60-day auto-rotation; no manual action)
**Responsibility:** Automated (certbot on Nginx)  
**Trigger:** Auto-renewal via Let's Encrypt (60 days before expiry)

- **Nginx configuration**: `ssl_certificate /etc/letsencrypt/live/qorium.io/fullchain.pem;`
- **Certbot cron**: Runs daily; auto-renews 30 days before expiry
- **No manual action required**; verify certs with: `certbot certificates`
- **Monthly audit**: Check certificate expiry: `openssl s_client -connect api.qorium.io:443 -showcerts | grep -A 3 Validity`

---

## 5. 12-Month Rotation Calendar (May 2026 – May 2027)

**Starting baseline:** All secrets assumed fresh as of May 2026.

| Month | Day | Secret | Cadence | Next |
|-------|-----|--------|---------|------|
| **May 2026** | 15 | Baseline (all secrets initialized) | — | Per table below |
| **May 2026** | 20 | TLS Certs (auto-renewal; monitor only) | 60d | Jul 20 |
| **Jun 2026** | 10 | GitHub PAT (Deploy) | 90d | Sep 10 |
| **Jun 2026** | 15 | Cloudflare R2 keys (staging + prod) | 90d | Sep 15 |
| **Jun 2026** | 20 | DATABASE_URL_PROD | 90d | Sep 20 |
| **Jul 2026** | 20 | TLS Certs | 60d | Sep 20 |
| **Aug 2026** | 10 | Anthropic API Key | 180d | Feb 2027 |
| **Aug 2026** | 10 | OpenAI API Key | 180d | Feb 2027 |
| **Aug 2026** | 10 | Serper.dev Key | 180d | Feb 2027 |
| **Aug 2026** | 10 | PM2 Deploy Key (SSH) | 180d | Feb 2027 |
| **Aug 2026** | 10 | Grafana Token | 180d | Feb 2027 |
| **Sep 2026** | 10 | GitHub PAT | 90d | Dec 10 |
| **Sep 2026** | 15 | Cloudflare R2 keys | 90d | Dec 15 |
| **Sep 2026** | 20 | DATABASE_URL_PROD | 90d | Dec 20 |
| **Sep 2026** | 20 | TLS Certs | 60d | Nov 20 |
| **Oct 2026** | 1 | Razorpay Test Key | 180d | Apr 2027 |
| **Nov 2026** | 20 | TLS Certs | 60d | Jan 20 |
| **Dec 2026** | 10 | GitHub PAT | 90d | Mar 10 |
| **Dec 2026** | 15 | Cloudflare R2 keys | 90d | Mar 15 |
| **Dec 2026** | 20 | DATABASE_URL_PROD | 90d | Mar 20 |
| **Jan 2026** | 20 | TLS Certs | 60d | Mar 20 |
| **Feb 2027** | 10 | Anthropic API Key | 180d | Aug 2027 |
| **Feb 2027** | 10 | OpenAI API Key | 180d | Aug 2027 |
| **Feb 2027** | 10 | Serper.dev Key | 180d | Aug 2027 |
| **Feb 2027** | 10 | PM2 Deploy Key | 180d | Aug 2027 |
| **Feb 2027** | 10 | Grafana Token | 180d | Aug 2027 |
| **Mar 2027** | 10 | GitHub PAT | 90d | Jun 10 |
| **Mar 2027** | 15 | Cloudflare R2 keys | 90d | Jun 15 |
| **Mar 2027** | 20 | DATABASE_URL_PROD | 90d | Jun 20 |

---

## 6. Rotation Execution Checklist

Before executing any rotation, print and use this checklist:

```
SECRET ROTATION EXECUTION CHECKLIST
Date: ___________  Secret: __________________  Executor: __________

PRE-ROTATION
[ ] Confirm no active incidents or deployments
[ ] Backup existing credential (store in 1Password)
[ ] Alert team on Slack #qorium-ops: "Rotating [SECRET] at [TIME]"

GENERATE NEW CREDENTIAL
[ ] Create new secret from provider (Anthropic, Razorpay, etc.)
[ ] Verify new secret validity (test API call if applicable)
[ ] Document credential hash / thumbprint

UPDATE ENVIRONMENT
[ ] Update GitHub Actions Secrets OR .env.local
[ ] Push config to staging repo (if applicable)

DEPLOY & VALIDATE
[ ] Deploy to staging first; verify services boot
[ ] Run smoke tests: `curl https://staging.qorium.io/health`
[ ] Deploy to production
[ ] Monitor logs for 30 minutes (Sentry, Grafana, PM2)

ARCHIVE & AUDIT
[ ] Revoke old credential on provider side
[ ] Log rotation: `echo "[$(date)] ROTATED=[SECRET]" >> /opt/qorium/logs/secret-rotation.log`
[ ] Record hash of old credential + new credential in audit log
[ ] Post-rotation summary to Slack #qorium-ops

SIGN-OFF
[ ] CTO or delegated reviewer: Approve rotation
[ ] Finance (if Razorpay): Confirm payment processing OK
```

---

## 7. Compromise Response (4-hour SLA)

**If a secret is suspected compromised or leaked:**

1. **Alert Level: SEV-1** (Critical; page on-call)
2. **Immediate action (within 5 min):**
   - Slack: `@here [SECURITY] Potential leak of [SECRET]. Starting rotation.`
   - Create incident in Sentry / Grafana
3. **Rotation (within 30 min):**
   - Generate new credential immediately (don't wait for calendar)
   - Deploy to staging + validate
   - Deploy to production
4. **Notification (within 4 hours):**
   - **Internal**: Post-mortem scheduled for 24 hours post-rotation
   - **Customers**: If customer data exposed (Stack-Vault watermarks, etc.), notify within 24 hours per A7 DPA Clause 5.1
5. **Audit trail:**
   - Log incident ID + rotation timestamp + affected services
   - Append to `/opt/qorium/logs/secret-rotation.log`

---

## 8. Quarterly Audit & Review

**Every quarter (May, Aug, Nov, Feb):**

- CTO Office + Product Security (if hired) review:
  - All rotations completed on schedule (no missed rotations)
  - All secrets in GitHub Actions Secrets are non-expired
  - Sentry logs: zero "unauthorized" / "invalid api key" errors
  - Grafana: zero alert rate spikes post-rotation
- Audit log: `/opt/qorium/logs/secret-rotation.log` reviewed for completeness
- **Quarterly sign-off**: Signed by CTO + designated auditor

---

## 9. Ownership & Escalation

| Role | Responsibility |
|------|-----------------|
| **CTO Office (primary)** | Calendar rotations, runbook execution, audit log maintenance |
| **Finance / CFO** | Razorpay key rotations; payment provider coordination |
| **DevOps (future M9 hire)** | Execute rotations on-prem (SSH keys, TLS, database); own deployment runbooks |
| **Talpro Security (if shared)** | Quarterly audit review; incident response (Sec-1 compromises) |
| **GitHub Actions** | Auto-rotate secrets in Actions UI (if provider supports; otherwise manual) |

---

## 10. Tools & References

- **1Password**: Store secrets during transition (not long-term)
- **GitHub Actions Secrets**: Long-term secret storage (encrypted at rest)
- **Anthropic Console**: https://console.anthropic.com/account/keys
- **Razorpay Dashboard**: https://dashboard.razorpay.com/#/app/settings/keys
- **DigitalOcean Database**: https://cloud.digitalocean.com/databases
- **Cloudflare R2**: https://dash.cloudflare.com/?to=/:account/r2
- **Sentry Project**: https://sentry.io/organizations/qorium/

---

## 11. Approval & Ratification

- **Drafted by:** CTO, Talpro Universe
- **Approved by:** CTO Office (self-approval until M9)
- **Effective date:** May 2, 2026
- **Next review:** August 2, 2026 (quarterly)

---

*End of B6 — Secret Rotation Calendar.*
