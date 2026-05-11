# Runbook — Secret Rotation

**Owner:** CTO Office · **Authority:** Constitution SO-15 (Zero Secrets in Git — extended to "secrets must rotate quarterly"), SO-3 (Quality Gate Discipline)
**Cadence:** Quarterly (regular) · Immediate (on incident)

---

## What gets rotated

Every secret QOrium owns rotates on a schedule. The catalog:

### Application secrets (deploy via `deploy-marketing.yml`)

| Secret                                       | Where it lives                            | Rotation cadence                    | How to rotate                                                                                                                                  |
| -------------------------------------------- | ----------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                             | GH Actions repo secret + VPS `.env.local` | Quarterly                           | Resend dashboard → API Keys → Create new → copy → update GH secret → re-deploy → revoke old key                                                |
| `GMAIL_USER` + `GMAIL_APP_PASSWORD`          | GH Actions repo secret + VPS `.env.local` | Quarterly                           | Google Account → Security → 2-Step Verification → App passwords → Generate new → copy → update GH secret → re-deploy → revoke old app password |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`               | GH Actions repo secret + VPS `.env.local` | Stable (no rotation; it's a domain) | n/a                                                                                                                                            |
| `NEXT_PUBLIC_CALENDLY_URL`                   | GH Actions repo secret + VPS `.env.local` | Stable (no rotation; it's a URL)    | n/a                                                                                                                                            |
| `UPSTASH_REDIS_REST_TOKEN` (when configured) | GH Actions repo secret + VPS `.env.local` | Quarterly                           | Upstash dashboard → DB → Reset token → update GH secret → re-deploy                                                                            |

### Infrastructure secrets

| Secret                             | Where it lives                                        | Rotation cadence                                   | How to rotate                                                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VPS_SSH_KEY` (deploy key)         | GH Actions repo secret + VPS `~/.ssh/authorized_keys` | Quarterly OR on departure of any holder            | Generate new ed25519 keypair → add public key to VPS `~/.ssh/authorized_keys` → update GH secret with private key → test deploy → remove old public key from VPS |
| `VPS_HOST`, `VPS_USER`, `VPS_PORT` | GH Actions repo secret                                | Stable (no rotation; rotates only on infra change) | n/a                                                                                                                                                              |
| Hostinger API key                  | Hostinger panel + (any local automation tools)        | Quarterly                                          | Hostinger panel → API → Revoke + Regenerate                                                                                                                      |
| Let's Encrypt cert                 | VPS `/etc/letsencrypt/`                               | 90-day automatic via certbot cron                  | `certbot renew --force-renewal` if cron drifts; see `cto/runbooks/incident-response.md` §TLS expiry                                                              |

### Anthropic / OpenAI / OpenRouter API keys (when ReadyBank engine uses them)

| Secret               | Where it lives                | Rotation cadence | How to rotate                                                 |
| -------------------- | ----------------------------- | ---------------- | ------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | (TBD when M2 service uses it) | Quarterly        | Anthropic console → API keys → Create new → swap → revoke old |
| `OPENAI_API_KEY`     | (TBD)                         | Quarterly        | OpenAI console → API keys → Create new → swap → revoke old    |
| `OPENROUTER_API_KEY` | (TBD)                         | Quarterly        | OpenRouter console → keys → Create new → swap → revoke old    |

### GitHub Personal Access Tokens (PATs)

| Token                              | Cadence                                                       | How to rotate                                                            |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Any PAT used during build sessions | Immediate revoke after session ends + 60-day automatic expiry | GitHub → Settings → Developer settings → Personal access tokens → Revoke |

---

## Rotation procedure (canonical, applies to all application secrets)

### Step 1 — Generate the new secret

In the provider's dashboard (Resend / Google / Upstash / etc.), create a NEW secret. **Do not revoke the old one yet.** You need both during the swap.

### Step 2 — Update the GH Actions repo secret

GitHub → Settings → Secrets and variables → Actions → Repository secrets → Find the secret → "Update secret" → paste new value.

(GH Actions auto-redacts secrets in workflow logs. The new value is in effect on the next workflow run; existing in-flight runs continue with the old value.)

### Step 3 — Re-deploy

Trigger `deploy-marketing.yml` via `workflow_dispatch` (Actions tab → Deploy marketing site → Run workflow). The "Inject env vars into VPS .env.local" step will write the new value to the VPS via stdin (per ADR 0005).

### Step 4 — Smoke test

The deploy workflow's smoke test step verifies the site is up. For mailer rotations, additionally:

1. Submit `/contact` form on the live site.
2. Verify email arrives at `hello@qorium.online`.
3. If email doesn't arrive, check PM2 logs (`pm2 logs qorium-marketing --lines 50`) for mailer dispatch errors.

### Step 5 — Revoke the old secret

In the provider's dashboard, revoke the OLD secret. Confirm it's marked revoked.

### Step 6 — Log the rotation

Append to `cto/secret-rotation-log.md` (created on first rotation):

```
2026-MM-DD — RESEND_API_KEY rotated. Old key prefix: re_xxx... → New key prefix: re_yyy...
              Triggered by: quarterly cadence / incident <ID> / departure of <person>
              Verified: smoke test pass at HH:MM UTC + email delivery confirmed.
              CTO sign-off: <name>.
```

---

## VPS_SSH_KEY rotation (special procedure)

SSH key rotation has a "you can lock yourself out" failure mode. Steps:

### Step 1 — Generate new keypair (locally, on a workstation with SSH access to VPS)

```bash
ssh-keygen -t ed25519 -C "claude-cowork-deploy-2026-Q3" -f ~/.ssh/qorium_deploy_2026_q3 -N ""
```

This creates two files: private key (`qorium_deploy_2026_q3`) and public key (`qorium_deploy_2026_q3.pub`).

### Step 2 — Add new public key to VPS

```bash
cat ~/.ssh/qorium_deploy_2026_q3.pub | ssh -p 2244 root@147.93.103.194 "cat >> ~/.ssh/authorized_keys"
```

This appends; doesn't remove the old key. **Both keys work now.**

### Step 3 — Test new key works

```bash
ssh -p 2244 -i ~/.ssh/qorium_deploy_2026_q3 root@147.93.103.194 "whoami && hostname"
```

Expected: `root` and the VPS hostname. If this fails, **DO NOT proceed to step 4** — old key still works as fallback.

### Step 4 — Update GH Actions repo secret

GitHub → Settings → Secrets → `VPS_SSH_KEY` → Update with the contents of `~/.ssh/qorium_deploy_2026_q3` (private key, including BEGIN/END lines).

### Step 5 — Trigger a deploy

Run `deploy-marketing.yml` via `workflow_dispatch`. The deploy uses the new key.

### Step 6 — Verify deploy succeeded

The workflow's smoke test step should pass. If it fails (likely an SSH key issue), the GH runner's SSH command would have shown the error — review the workflow log.

### Step 7 — Remove old public key from VPS

ONLY after the deploy succeeded with the new key:

```bash
ssh -p 2244 -i ~/.ssh/qorium_deploy_2026_q3 root@147.93.103.194 "
  # Edit authorized_keys to remove the old line
  # Find the line containing the old key's comment (e.g., 'claude-cowork-deploy-2026-Q2')
  sed -i '/claude-cowork-deploy-2026-Q2/d' ~/.ssh/authorized_keys
"
```

### Step 8 — Test old key no longer works

```bash
ssh -p 2244 -i ~/.ssh/qorium_deploy_2026_q2 root@147.93.103.194 "whoami"
# Expected: Permission denied (publickey).
```

### Step 9 — Log the rotation

Append to `cto/secret-rotation-log.md` per Step 6 of the canonical procedure.

---

## Incident-driven rotation (immediate, not scheduled)

When a secret is exposed (committed to repo, pasted in chat, leaked in logs), the rotation is IMMEDIATE — don't wait for the quarterly cadence.

Triggers:

- gitleaks blocked a commit containing a real secret (P1)
- gitleaks scan in CI on `main` flagged a secret (P0 — already pushed)
- Secret value visible in any chat / Slack / email / log file
- Departure of any person who had access to the secret
- Suspected compromise (anomalous API usage, unauthorized requests)

For incident-driven rotation:

1. Rotate the secret IMMEDIATELY (before investigating root cause).
2. Audit who had access to the old secret.
3. Audit what calls were made with the old secret in the window between exposure and rotation.
4. File a P0 or P1 incident per `cto/runbooks/incident-response.md`.
5. The rotation log entry includes "Triggered by: incident <ID>".

For secrets pushed to the repo:

- `git rebase -i` to remove the commit IS optional. Even if removed, assume the secret is compromised (GitHub's commit cache + clones already exist). Rotation is the ONLY effective response.
- Don't waste time on `git filter-branch` / BFG repo-cleaner unless legal requires it (sensitive PII, etc.).

---

## Quarterly rotation calendar

Set calendar reminders:

| Quarter | Target date                                                         | Secrets due             |
| ------- | ------------------------------------------------------------------- | ----------------------- |
| Q3 2026 | 2026-08-05 (aligned with Bali quarterly competitive scan per SO-25) | All app + infra secrets |
| Q4 2026 | 2026-11-04                                                          | All                     |
| Q1 2027 | 2027-02-03                                                          | All                     |
| Q2 2027 | 2027-05-05                                                          | All                     |

The Q3 2026 rotation is the first scheduled one; ad-hoc rotations may occur before then per the incident-driven path.

---

## Rotation pre-flight checklist

Before starting a quarterly rotation:

- [ ] Verify deploy workflow is healthy (last successful run within 30 days)
- [ ] Verify GH Actions secrets are accessible (you have admin access)
- [ ] Verify provider dashboards are accessible (Resend / Google / etc.)
- [ ] Verify VPS SSH access works with current key
- [ ] Block out 30 minutes per secret being rotated (most are 5-min, but mailers + SSH keys can take longer)
- [ ] Notify CEO that rotation is in flight (so any test emails can be expected)

---

## What's not in this runbook (yet)

- DNS rotation (Hostinger DNS records) — when DNS hosting moves off Hostinger or rotation strategy is needed
- Database password rotation — when ReadyBank has live customer data
- API key rotation for live customers (signed by `@qorium/auth`) — when there are live customers

These get added when their underlying systems are operational with real customer impact.

---

_Cross-references: Constitution SO-15 (Zero Secrets in Git), ADR 0005 (stdin-fed env injection — the technical foundation), `cto/runbooks/incident-response.md` (parent for incident-driven rotation), `.github/workflows/deploy-marketing.yml` (the workflow that consumes secrets). Rotation log: `cto/secret-rotation-log.md` (created on first rotation)._
