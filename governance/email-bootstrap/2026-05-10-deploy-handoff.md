# Deploy handoff — recruiter invitation pipeline

**Date:** 2026-05-10 (updated post-merge ~10:55 UTC)
**Status:** Code is on `main`. Deploy still blocked by VPS deploy-key + migration-divergence reconciliation.

## Post-merge state (2026-05-10 10:55 UTC)

| Artifact | Value |
|---|---|
| PR | [#51](https://github.com/sales799/QOrium/pull/51) — **MERGED** |
| Merge commit on `main` | `f96e886c303e1c2a367ad9b8507450e407776434` |
| Source branch (now redundant) | `claude/qorium-continuation-eJJlB` |
| CI status | 8/8 green (lint, typecheck, test, build, secret-scan, security-audit; deploys skipped pre-merge) |
| Self-review | Posted on PR #51 (CTO autonomous mode) |

### ⚠ NEW BLOCKER — sibling branch divergence

`claude/setup-qorium-build-agent-zA0l5` (50 commits, the branch currently RUNNING on the VPS) **cannot be cleanly merged** to the new `main`. Both branches independently numbered migrations `0004`–`0014` with different content, and both authored ATS connectors. This means:

- ❌ Cannot simply `git checkout main` on the VPS — it would attempt to apply `0004_recruiter_auth.sql` on top of a postgres state that was built from `0004_calibration_history.sql`.
- ❌ Cannot just merge sibling branch via "Option A second half" — produces uncountable conflicts.

Full incident report and reconciliation plan: [`governance/incidents/2026-05-10-migration-divergence.md`](../incidents/2026-05-10-migration-divergence.md).

**Until reconciliation lands**, the recruiter invitation pipeline can be deployed to:

- ✅ A fresh VPS bootstrapped from `main` (with pgcrypto + CITEXT extensions installed first).
- ✅ A side-deployed `/opt/qorium-mailer` instance on a different port (Option B from the original plan).
- ❌ NOT the existing `/opt/qorium` running on the VPS today, without the migration-tracker remap work.

---

## What's in this PR

| Surface | File | Purpose |
|---|---|---|
| Mailer factory | `services/readybank/src/mailer/index.ts` | Driver-agnostic; lazy-loads SDK |
| Mock driver | `services/readybank/src/mailer/mock.ts` | Dev/test; in-memory log |
| SES driver | `services/readybank/src/mailer/ses.ts` | `@aws-sdk/client-ses@^3.700` |
| SendGrid driver | `services/readybank/src/mailer/sendgrid.ts` | `@sendgrid/mail@^8.1` |
| Email template | `services/readybank/src/mailer/templates.ts` | HTML + text, no remote assets |
| Admin invite route | `services/readybank/src/routes/auth.ts` (`adminAuthRouter`) | `POST /v1/auth/invite` (API-key gated) |
| Accept-invite route | `services/readybank/src/routes/auth.ts` (`authRouter`) | `POST /v1/auth/accept` (token-gated) |
| Recruiters table | `infra/B7-postgres-migrations/0004_recruiter_auth.sql` | `app.recruiters` |
| Invitations table | `infra/B7-postgres-migrations/0005_recruiter_invitations.sql` | `app.recruiter_invitations` |
| Tests | `services/readybank/__tests__/{invite,mailer.unit,auth}.test.ts` | 8 + 9 + 11 specs |

Acceptance flow: admin POSTs `/v1/auth/invite` → service generates token, hashes it (SHA-256), inserts pending recruiter + invitation row, sends email via configured driver. Recipient clicks `/accept-invite.html?token=...` which POSTs to `/v1/auth/accept` → service verifies token hash + expiry, sets argon2id password, flips recruiter to `active`. Single-use; 7-day TTL.

---

## Branch-strategy decision (revised post-merge)

**Original "Option A" is dead** — the sibling branch cannot be cleanly merged (see incident report). Revised options:

| Option | Steps | Pros | Cons |
|---|---|---|---|
| **B (recommended now) — Side-deploy** | Clone `main` to `/opt/qorium-mailer`, run readybank on a separate port (e.g. 5102), proxy `/v1/auth/invite` + `/v1/auth/accept` from nginx. Migration tracker stays per-instance. | Zero risk to the running VPS service; mailer ships in hours. | Two codebases to maintain until reconciliation. |
| **A′ (long-term) — Reconciliation project** | Execute the 5-phase plan in the migration-divergence incident report. | Trunk health restored; one canonical codebase. | Multi-day; requires Phase A (postgres truth-establishment) first; needs human review. |
| **C — Force-checkout main on VPS** | `cd /opt/qorium && git checkout main`. | Fastest. | **Will fail** — postgres rejects re-applying `0004` with new content. Even if forced, Sprint 2.x work disappears from the live service. **Don't do this.** |

**CTO recommendation: B for the mailer ship + A′ as a sprint-2-week project for trunk health.**

---

## The 2 pastes you'll need to do on the VPS

Everything else is automated. These two require human hands because (1) the deploy key requires GitHub web UI, and (2) SES creds aren't in my context.

### Paste 1 — Add a working deploy key for `sales799/qorium`

The current VPS deploy key is scoped to `sales799/MAYA` only (verified by SSH greeting). Generate a new key and register it.

**On the VPS:**
```bash
# Generate ed25519 deploy key (no passphrase — needed for non-interactive git)
ssh-keygen -t ed25519 -f ~/.ssh/qorium_deploy -N '' -C "vps-qorium-deploy-$(date +%Y%m%d)" && \
echo "" && \
echo "=== PUBLIC KEY (paste into GitHub Settings → Deploy keys) ===" && \
cat ~/.ssh/qorium_deploy.pub && \
echo "" && \
echo "=== After GitHub registration, configure SSH to use it ===" && \
cat >> ~/.ssh/config <<'EOF'

Host github-qorium
  HostName github.com
  User git
  IdentityFile ~/.ssh/qorium_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config && \
echo "SSH config updated. Now test:" && \
ssh -T github-qorium 2>&1 | head -3 && \
echo "" && \
echo "Then point /opt/qorium origin at the new host alias:" && \
cd /opt/qorium && \
git remote set-url origin git@github-qorium:sales799/qorium.git && \
git remote get-url origin
```

**Then in browser:** open https://github.com/sales799/qorium/settings/keys → "Add deploy key" → title `vps-qorium-deploy-2026-05-10` → paste the public key from the output above → **check "Allow write access"** → Save.

After GitHub registration, SSH greeting should change to `Hi sales799/qorium!` and `git fetch origin` will work.

### Paste 2 — Add mailer env vars to `/opt/qorium/.env`

After the deploy is done (Option A: pull main; Option B: clone branch separately), the service needs these env vars. SES creds come from your `qorium-bootstrap-tf` IAM user (region `ap-south-1`).

Append to `/opt/qorium/.env`:
```
MAILER_DRIVER=ses
MAILER_FROM_ADDRESS=noreply@qorium.online
MAILER_REPLY_TO_ADDRESS=bhaskar@talpro.in
RECRUITER_PORTAL_URL=https://my.qorium.online
SES_REGION=ap-south-1
SES_ACCESS_KEY_ID=<paste from your AWS bootstrap secrets>
SES_SECRET_ACCESS_KEY=<paste from your AWS bootstrap secrets>
```

⚠ **SES production access is denied** (case 177825922400683 — see `2026-05-09-ses-bootstrap-record.md`). Sending only works to verified recipients (`bhaskar@talpro.in` is verified). For external recipients, switch `MAILER_DRIVER=sendgrid` + add `SENDGRID_API_KEY=...` instead. Either driver works the same way at the route level.

---

## Deploy commands — Option B (side-deploy, recommended)

After both pastes done:

```bash
# 1. Clone main into a parallel directory (does NOT touch /opt/qorium)
cd /opt && \
git clone -b main git@github-qorium:sales799/qorium.git qorium-mailer && \
cd qorium-mailer && \
pnpm install --frozen-lockfile && \
pnpm --filter @qorium/db build && \
pnpm --filter @qorium/auth build && \
pnpm --filter @qorium/readybank build && \
# 2. Set up its own postgres database (separate schema or separate DB)
psql "$DATABASE_URL" -c "CREATE SCHEMA IF NOT EXISTS app_mailer;" && \
# Then run migrations 0001, 0002, 0004, 0005 ONLY against app_mailer schema
# (skip the 0006-0015 from main since this instance only needs auth + invitations)
# Detailed migration script needed — see Phase A of the reconciliation plan
# 3. Copy /opt/qorium/.env to /opt/qorium-mailer/.env, override:
#    READYBANK_PORT=5102
#    DATABASE_URL=...?currentSchema=app_mailer
#    MAILER_DRIVER=ses (+ SES creds from Paste 2)
# 4. Start under PM2 as a NEW process (not a restart of qorium-api)
cd /opt/qorium-mailer && \
pm2 start ecosystem.config.cjs --only qorium-mailer || \
  pm2 start "node services/readybank/dist/index.js" --name qorium-mailer --env production
# 5. Add nginx route on api.qorium.online:
#    location /v1/auth/invite { proxy_pass http://localhost:5102; }
#    location /v1/auth/accept { proxy_pass http://localhost:5102; }
nginx -t && systemctl reload nginx
```

Expected log on `pm2 logs qorium-mailer`: `mailer initialized driver=ses region=ap-south-1`.

**Note:** the side-deploy needs its own database (or schema) so its migration history doesn't collide with the live `qorium-api`. If a new DB is preferred, swap the `psql` line for `createdb qorium_mailer` and adjust `DATABASE_URL` accordingly. The CEO/CTO can decide schema-vs-database at execute time.

## Smoke test (first real send)

```bash
# Replace API_KEY with a valid admin API key (from app.api_keys, or generate one)
curl -X POST https://api.qorium.online/v1/auth/invite \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bhaskar@talpro.in",
    "name": "Bhaskar (test)",
    "tenant_id": "<tenant uuid from app.tenants>"
  }'
```

Expect HTTP 201 with `mailer.driver: "ses"` and `mailer.message_id: "<aws-message-id>"`. Email lands in `bhaskar@talpro.in` inbox (DKIM=pass per the 2026-05-09 record).

## Rollback (if anything breaks)

```bash
cd /opt/qorium && \
git reset --hard $(cat /tmp/qorium-pre-deploy-sha.txt) && \
pnpm install --frozen-lockfile && \
pnpm --filter @qorium/readybank build && \
pm2 restart qorium-api --update-env
```
(Snapshot SHA was saved earlier: `d5389b7555403ad00829ebd5e4c319e4b7b57903`.)
