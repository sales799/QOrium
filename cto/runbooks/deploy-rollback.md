# Runbook — Deploy Rollback

**Owner:** CTO Office · **Authority:** Constitution SO-3 (Quality Gate Discipline) · **Cross-ref:** ADR 0004 (VPS deploy stack)

---

## When to use this runbook

When the marketing site has been deployed (via `deploy-marketing.yml` or manual `safe-deploy qorium-marketing`) and the resulting deploy is broken. Symptoms:

- Smoke test in the deploy workflow failed (any of 6 routes returns non-200)
- PM2 process is restarting in a loop (`pm2 logs qorium-marketing` shows repeated crashes)
- Site loads but a critical feature is broken (form submission, page render, etc.)
- Customer report confirms degradation in production

**Containment-before-fix rule:** if the site is in a bad state, rollback FIRST. Don't try to forward-fix on prod. Forward-fix happens after rollback restores service.

---

## Rollback decision (fast)

| Situation                                                         | Action                                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Deploy just completed, smoke test failed, no customer impact yet  | **Rollback immediately.** Customer harm < 5 min.                                                                 |
| Deploy completed, customers are seeing errors                     | **Rollback immediately.** Investigate after rollback.                                                            |
| Deploy is in progress (workflow still running)                    | **Wait for completion**, then assess. Killing mid-deploy can leave a worse state than completing + rolling back. |
| Deploy completed, smoke test passed, but a customer reports a bug | **Don't rollback.** Forward-fix in a normal PR. The bug isn't a deploy failure.                                  |

---

## Rollback procedure (step-by-step, ~3 minutes)

### Step 1 — SSH to VPS

```bash
ssh -p 2244 root@147.93.103.194
```

(Or use the GH Actions deploy-marketing workflow's `workflow_dispatch` to re-run with the previous commit; see Step 4 alternative below.)

### Step 2 — Find the previous PM2 deploy state

```bash
cd /opt/apps/qorium-marketing
git log --oneline -10
```

Identify the SHA of the previous known-good deploy. Two ways:

- **From `pm2 status`:** the current PM2 process metadata includes the commit SHA it was started against (set by `infra/marketing-deploy.sh` §3 to write `.pm2-start.sh`).
- **From the deploy workflow runs:** GitHub → Actions → "Deploy marketing site" → previous successful run shows the merged SHA.

### Step 3 — Roll back to the previous SHA

```bash
git checkout <previous-good-sha>
safe-deploy qorium-marketing
```

If `pnpm install` fails (e.g., lockfile drift between SHAs), use:

```bash
git checkout <previous-good-sha> -- pnpm-lock.yaml
safe-deploy qorium-marketing
```

### Step 4 — Verify rollback succeeded

From the VPS:

```bash
for path in / /product /pricing /security /changelog /press-kit; do
  code=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "https://qorium.online${path}")
  echo "${path} → ${code}"
done
```

Expected: all 6 return `200`. If any return non-200 → rollback failed; escalate to CEO + CTO immediately.

### Alternative: rollback via GH Actions (no SSH needed)

If SSH isn't available (e.g., VPS_SSH_KEY rotated mid-incident):

1. GitHub → Actions → "Deploy marketing site" → previous successful run
2. Click "Re-run all jobs"
3. The workflow will re-clone at the latest `main` SHA — so this only works if you've also reverted the bad commit on `main`.

To revert the bad commit on `main`:

```bash
# From local clone:
git checkout main
git pull
git revert <bad-sha>
git push
```

Then trigger the deploy workflow.

### Step 5 — Notify

Post in the team channel (Slack/WhatsApp Y1):

```
Marketing site rolled back from <bad-sha> to <good-sha>.
Reason: <one-line>.
Smoke test passed at <timestamp>.
Forward-fix PR coming next.
```

---

## After rollback: forward-fix discipline

Once the site is back to known-good state:

1. **Don't re-deploy the bad SHA.** Even with a "small fix" — apply the discipline: rollback then forward-fix in a clean PR.
2. **Investigate root cause.** What broke? Why didn't CI catch it?
3. **Add a test or check** for the failure mode. If CI didn't catch it, that's a CI gap; fix the gap in the same PR or in a follow-up.
4. **Write a postmortem** if the customer impact warranted P0 or P1 classification (per `cto/runbooks/incident-response.md` §Step 7).

---

## Edge cases

### Database migration deployed with bad SHA

Marketing app has no DB (per ADR 0006), so this doesn't apply to marketing rollbacks. For ReadyBank rollbacks (when those become an issue):

- **Migrations are forward-only.** Rolling back code without rolling back migrations leaves the DB in a state the older code doesn't understand.
- The procedure is: roll back code + apply a new "rollback migration" if needed. NEVER `migrate:down` blindly on production.
- This will get its own ADR + runbook when ReadyBank has live customer data.

### nginx config changed in the bad deploy

`infra/marketing-deploy.sh` §6 backs up the previous nginx vhost config to `/etc/nginx/sites-available/.bak` before applying changes. Restore:

```bash
sudo cp /etc/nginx/sites-available/qorium.online.bak /etc/nginx/sites-available/qorium.online
sudo nginx -t && sudo systemctl reload nginx
```

If the bad deploy created a new vhost (e.g., the qorium.in §9b addition was buggy), the rollback script removes only what it added.

### TLS cert was renewed in the bad deploy

Let's Encrypt certs don't change between deploys (renewal is on a separate cron). If a deploy unintentionally triggered a new cert that's misconfigured, the rollback procedure above doesn't restore the old cert. Manual remediation:

```bash
ls /etc/letsencrypt/live/qorium.online/  # see current certs
# check certbot logs for what changed:
journalctl -u certbot --since "1 hour ago"
# if needed, restore previous cert from /etc/letsencrypt/archive/qorium.online/
```

---

## Post-rollback checklist

- [ ] Site smoke test: 6/6 routes 200
- [ ] PM2 logs clean for 5 min after rollback
- [ ] Team notified via Slack/WhatsApp
- [ ] Customer impact assessment logged (count of failed requests during incident window if available)
- [ ] CEO emailed if P0 or P1 classification
- [ ] Forward-fix PR opened (or scheduled) within 24 hours
- [ ] Tech debt added to `cto/tech-debt.md` if root cause exposed a recurring pattern

---

_Cross-references: Constitution SO-3, ADR 0004 (VPS deploy stack), ADR 0005 (env injection), `cto/runbooks/incident-response.md` (escalation parent), `cto/runbooks/secret-rotation.md` (if secrets are involved), `infra/marketing-deploy.sh` (the deploy script being rolled back from)._
