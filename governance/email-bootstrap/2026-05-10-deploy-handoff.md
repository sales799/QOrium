# Deploy handoff — recruiter invitation pipeline

**Date:** 2026-05-10  
**Branch:** `claude/qorium-continuation-eJJlB`  
**SHA:** `b2f394ec40bd1f7599c3acfc243891d017777ce5`  
**Status:** Code complete, typecheck clean, 166/187 tests pass (21 DB-integration skips expected without postgres). Branch is 106 commits ahead of `origin/main`.

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

## Branch-strategy decision (BLOCKS deploy)

The VPS currently runs `claude/setup-qorium-build-agent-zA0l5` (Sprint 2.20–2.21: leak-rotation worker, my self-service portal). That branch was never merged to main and is also ahead of main. **It does not contain the mailer.** This branch (`qorium-continuation-eJJlB`) does not contain the leak-rotation work. They are siblings off a stale `main`.

Three options, in order of cleanliness:

| Option | Steps | Pros | Cons |
|---|---|---|---|
| **A — Merge both to main** | 1) Merge this PR. 2) Merge a similar PR for `setup-qorium-build-agent-zA0l5`. 3) VPS pulls main. | Cleans up trunk; future deploys are simple. | Two PRs, two merges, possible conflicts to resolve. |
| **B — Side-deploy** | Clone branch to `/opt/qorium-mailer`, run on a separate port (e.g. 5102), proxy `/v1/auth/*` from nginx. | No risk to running services. | Two codebases to maintain temporarily. |
| **C — Force-checkout** | On VPS: `git checkout claude/qorium-continuation-eJJlB` directly. | Fastest. | **Loses Sprint 2.x work from running service** — anti-leak rotation stops. |

**CTO recommendation: Option A.** B is technically fine but adds ops burden. C is destructive and not worth the speed.

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

## Deploy commands (after both pastes done, Option A path)

```bash
cd /opt/qorium && \
git fetch origin && \
git checkout main && \
git pull origin main && \
pnpm install --frozen-lockfile && \
pnpm --filter @qorium/db build && \
pnpm --filter @qorium/auth build && \
pnpm --filter @qorium/readybank build && \
# Run new migrations (0004 + 0005 if not already applied)
pnpm --filter @qorium/db exec qorium-db migrate up && \
pm2 restart qorium-api --update-env && \
sleep 3 && \
pm2 logs qorium-api --lines 30 --nostream | tail -40
```

Expected log: `mailer initialized driver=ses region=ap-south-1`.

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
