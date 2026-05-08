# Cred-Drop Runbook

**For:** CEO Bhaskar Anand + Manthan + Talpro CTO + (future) Senior Eng hires
**Authored by:** CTO Office (autonomous agent)
**Filed:** 2026-05-09
**Refs:** `governance/Auto-Mode-Remote-Plan-v1.md` §3 (Charter stop conditions), `governance/CEO-Decision-Packet-2026-05-08.md` §1, `infra/auto-bootstrap/` (Terraform modules)

---

## Why this runbook exists

The autonomous CTO agent **never** touches `.env.bootstrap`, **never** runs `terraform apply`, **never** logs into AWS/Cloudflare/Sentry/Grafana on the CEO's behalf. Constitution Article XI + Auto-Mode Charter §3 stop condition #4. This is by design — credential operations are CEO-bound for both compliance and blast-radius reasons.

When the CEO needs to drop a new credential, this runbook is the kindergarten-level walk-through. It covers the four cred-drops that exist or are coming:

| # | What | Sprint | Status (2026-05-09) |
|---|---|---|---|
| 1 | **AWS access keys** for SES + Backup + Inspector | 1.7d / 4.1 / 4.2 | DNS done; AWS SES verifying; Observability + PITR pending |
| 2 | **Grafana Cloud + Sentry tokens** for observability | 4.1 | Pending |
| 3 | **AWS Backup + KMS perms** for PITR | 4.2 | Pending |
| 4 | **Anthropic API key** for JD-Forge live | 3.5 | Pending |

Each section below is one cred-drop, end-to-end.

---

## Cred-drop #1 — AWS access keys (SES already done; reuse for Backup/PITR)

### What this unblocks
- `infra/auto-bootstrap/email-auth.tf` — actually applies SES domain identity + DKIM
- `infra/auto-bootstrap/observability.tf` (later) — same AWS account
- `infra/auto-bootstrap/pitr.tf` (later) — same AWS account

### What you need before starting
- AWS root account access (you have this; recovered + MFA-Passkey-protected)
- A note app (Apple Notes / 1Password / Bitwarden) for credentials
- 15 minutes uninterrupted

### Step-by-step

**Step 1 — Log into AWS console**
- URL: `https://console.aws.amazon.com`
- Sign in as root with MFA Passkey

**Step 2 — Switch to ap-south-1 (Mumbai) region**
- Top-right region selector → "Asia Pacific (Mumbai) ap-south-1"
- This MUST be the region; SES + Backup are region-scoped

**Step 3 — Create an IAM user for the bootstrap agent**

Top-search "IAM" → IAM → Users → Create user.
- User name: `qorium-bootstrap-tf`
- ✓ Provide user access to AWS Management Console: **NO** (programmatic only)
- Click Next.

Permissions:
- Choose "Attach policies directly"
- Search and check the following policies:
  - `AmazonSESFullAccess` (for email-auth.tf)
  - `AWSBackupFullAccess` (for pitr.tf, later)
  - `AmazonS3FullAccess` (for pitr.tf S3 backup bucket)
  - `IAMReadOnlyAccess` (so Terraform can read existing IAM roles)
  - `AmazonRoute53FullAccess` (only if Route 53 is ever needed; safe to add)
- Click Next → Create user

**Step 4 — Generate access key**

In the user's detail page → Security credentials tab → Access keys → Create access key.
- Use case: "Application running outside AWS"
- Click Next → Create access key
- AWS shows you Access Key ID + Secret Access Key. **THIS IS THE ONLY TIME THE SECRET IS DISPLAYED.**

**Step 5 — Save to `.env.bootstrap`**

Open Terminal on Mac Mini:

```bash
cd /path/to/QOrium/infra/auto-bootstrap
# If .env.bootstrap doesn't exist, copy from template:
test -f .env.bootstrap || cp .env.bootstrap.example .env.bootstrap
nano .env.bootstrap   # or use any text editor
```

Add (replace the values from AWS):

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=<paste full secret>
AWS_REGION=ap-south-1
BOOTSTRAP_AUTHORIZED=true
```

Save and close.

**Step 6 — Verify the keys are NOT committed**

```bash
git status | grep bootstrap
# .env.bootstrap should appear as IGNORED (not tracked)
# If it shows up as a modified/new file, STOP — gitleaks will catch it but verify .gitignore:
cat .gitignore | grep .env.bootstrap
# Should output: .env.bootstrap
```

If `.env.bootstrap` is NOT in `.gitignore`, add it before doing anything else:
```bash
echo '.env.bootstrap' >> .gitignore
git add .gitignore && git commit -m "chore: gitignore .env.bootstrap"
```

**Step 7 — Apply the SES module**

```bash
cd infra/auto-bootstrap
./apply.sh email-auth
```

The wrapper script confirms `BOOTSTRAP_AUTHORIZED=true` is set (you put it there in step 5), then runs `terraform plan` + `terraform apply`.

Expected output: Terraform creates SES domain identity, DKIM CNAME records published (already done manually for `qorium.online` → these would be no-op or duplicate; review `terraform plan` first).

### What can go wrong

| Problem | Fix |
|---|---|
| "AccessDenied" on SES | Re-check IAM policies attached to `qorium-bootstrap-tf` |
| "AlreadyExists" on SES domain | Already created via console (expected) — `terraform import` to bring under IaC |
| Wrong region | Set `AWS_REGION=ap-south-1` in `.env.bootstrap` |
| `BOOTSTRAP_AUTHORIZED` not set | Re-edit `.env.bootstrap` |

### CTO-DELTA notes

- Keys above are CONSOLE-region-scoped. If we expand to multi-region (Phase 6), generate per-region keys.
- Rotate every 90 days. AWS shows last-used; if a key isn't used in 90 days, delete it.
- For higher-trust ops (production deploys), upgrade to IAM Identity Center + temporary STS tokens; this runbook is the simpler day-1 path.

---

## Cred-drop #2 — Grafana Cloud + Sentry tokens (Sprint 4.1, observability)

### What this unblocks
- `infra/auto-bootstrap/observability.tf` apply
- Per-service `OTEL_EXPORTER_OTLP_ENDPOINT` env vars
- Real-time error tracking via Sentry

### Prerequisites
- AWS keys already in `.env.bootstrap` (Cred-drop #1 done)
- ~20 min

### Step-by-step

**Grafana Cloud:**
1. URL: `https://grafana.com/auth/sign-up/create-user`
2. Sign up with `bhaskar@qorium.online` (or whichever; later configurable)
3. Once in dashboard, hit "Account" → "API Keys" or "Service Accounts" → "Add"
4. Name: `qorium-bootstrap-tf`
5. Role: Admin (broad scope; we narrow later)
6. Copy the token. Save.

**Sentry:**
1. URL: `https://sentry.io/signup/`
2. Sign up; create org slug `qorium`
3. Settings → Auth Tokens → Create New Token
4. Scopes: `project:write`, `team:write`, `org:read`, `event:read`
5. Copy. Save.

**Drop to `.env.bootstrap`:**

Add to existing file:
```
TF_VAR_grafana_cloud_org_slug=qorium
TF_VAR_grafana_cloud_api_token=<paste>
TF_VAR_sentry_org_slug=qorium
TF_VAR_sentry_auth_token=<paste>
```

**Apply:**
```bash
cd infra/auto-bootstrap
./apply.sh observability
```

Expected: Grafana Cloud stack provisioned, Sentry projects created, OTLP endpoints output. Manually copy these endpoints to per-service `.env`:

- `services/readybank/.env`: `OTEL_EXPORTER_OTLP_ENDPOINT=<from terraform output>` + `SENTRY_DSN=<from output>`
- Same for `services/anti-leak/.env`

Restart services to pick up.

### What can go wrong

| Problem | Fix |
|---|---|
| Grafana Cloud says "free tier limit" | Select prod-ap-south-1 region + Free plan (default) |
| Sentry needs org confirmation email | Click verification link in inbox |
| OTel collector not receiving | Verify env var is set in service shell, not just `.env` file (`echo $OTEL_EXPORTER_OTLP_ENDPOINT`) |

---

## Cred-drop #3 — AWS Backup + KMS perms (Sprint 4.2, PITR)

### What this unblocks
- Cross-region S3 backup vault
- Daily PITR plan with copy_action

### Prerequisites
- Cred-drop #1 done (same AWS account + IAM user)
- ~10 min

### Step-by-step

**Step 1 — Add to `qorium-bootstrap-tf` user:**
- IAM → Users → `qorium-bootstrap-tf` → Add permissions
- Attach: `AWSKeyManagementServicePowerUser`, `AWSBackupFullAccess` (already attached if you did cred-drop #1 step 3 fully)

**Step 2 — Decide backup destination region:**
- Default per `infra/auto-bootstrap/pitr.tf`: `ap-southeast-1` (Singapore)
- Override via `.env.bootstrap`: `TF_VAR_backup_region=ap-southeast-1`

**Step 3 — Apply:**
```bash
cd infra/auto-bootstrap
./apply.sh pitr
```

Expected: KMS keys per-region, S3 backup bucket in destination region with versioning + lifecycle (7d→30d Glacier IR→1y→7y Deep Archive), Backup vaults primary+destination, daily PITR plan.

**Step 4 — Verify the alarm:**
- AWS CloudWatch console → Alarms → search `qorium-backup-job-failure`
- Should be "OK" status (no jobs run yet, but alarm exists)

### Lifecycle policy ($-impact)

Default lifecycle keeps backups 7 years. Cost projection:

| Tier | Per-GB-month |
|---|---|
| S3 Standard (first 7 days) | ₹2-3 |
| Standard-IA (7-30 days) | ₹1-2 |
| Glacier IR (30d-1y) | ₹0.5 |
| Deep Archive (1y-7y) | ₹0.1 |

For a 10GB DB backed up daily, 7-year cost ~₹500-700 total. Negligible.

If compliance retention <7y is acceptable, edit `pitr.tf` `expiration { days = 2555 }` to e.g. `1095` (3y) and re-apply.

---

## Cred-drop #4 — Anthropic API key (Sprint 3.5, JD-Forge live)

### What this unblocks
- `services/jd-forge` Express service goes live (currently library-only at `packages/jd-forge`)
- Real LLM calls to Claude for JD parsing + question generation

### Prerequisites
- ~5 min

### Step-by-step

**Step 1 — Anthropic Console:**
- URL: `https://console.anthropic.com/settings/keys`
- Sign in (use `bhaskar@qorium.online` or whichever; can change later)
- Click "Create Key"
- Name: `qorium-jd-forge`
- Permissions: default (sufficient)
- Copy the key. **THIS IS THE ONLY TIME THE FULL KEY IS DISPLAYED.**

**Step 2 — Drop to `.env.bootstrap` AND service env:**

Add to `.env.bootstrap`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

When `services/jd-forge/` Express service is built (next sprint), it'll read this from env. For now: just store.

### Cost projection

JD-Forge Standard tier = $49/JD. Per JD ~10K input + 5K output tokens = ~$0.075 of Claude compute (Sonnet). Margin per JD ~98%.

Set spending limits in Anthropic console: Billing → Limits → Monthly cap (recommend $500/month while alpha).

### Rotation policy

Quarterly. Anthropic console → Keys → "Rotate". Old key valid 7 days during overlap.

---

## Cred-drop checklist (CEO meta)

After every cred-drop:

- [ ] `.env.bootstrap` is in `.gitignore`, not tracked
- [ ] Keys/tokens are saved to a password manager (1Password, Bitwarden, Apple Keychain) — `.env.bootstrap` is NOT the only copy
- [ ] `apply.sh` ran clean (no error stacks)
- [ ] Smoke test: actual operation works (send test SES email; query Grafana metric; trigger backup; call Anthropic)
- [ ] Rotate-by date noted (90d for AWS keys, 6mo for Sentry/Grafana, 90d for Anthropic)

---

## What you should NEVER do

1. Paste credentials into Slack / WhatsApp / Email / GitHub issue / PR comment.
2. Commit `.env.bootstrap` (gitleaks will catch but don't rely on it).
3. Share the same key across Dev + Staging + Prod (each gets its own).
4. Rotate via "create new key, never delete old" — old key still works forever, security debt grows.
5. Use AWS root account access keys for ANYTHING. Always use IAM users with scoped policies.
6. Disable MFA on root account (it's required AWS-side; if disabled the root account is locked in 35 days).

---

## What the agent CAN do for you in cred-drop ops (zero-cost CEO time)

- Read `terraform plan` output and explain what each resource creates/changes/destroys.
- Write `terraform import` commands to bring console-created resources under IaC.
- Update `governance/dashboard.json` to flip cred-drop tile from `engineering-complete-cred-bound` → `complete` once you confirm.
- Verify DNS / SES / observability emit events via socket DNS / curl tests.
- Author this runbook's continuation as new cred-drops emerge.

---

**End of cred-drop runbook v1.** Updates filed as new sprints land. Author: CTO Office (autonomous agent), 2026-05-09.
