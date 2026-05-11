# Runbook — Incident Response

**Owner:** CTO Office (Y1: CTO is on-call) · **Authority:** Constitution SO-3, SO-15 · **Companion doc:** `governance/Incident-Response-Runbook-v1.md` (governance-level — this is the operational counterpart)
**SLA:** see `cto/sli-slo.md` for binding numbers

---

## Severity classifications

| Level                                 | Definition                                                                                                                       | Detection                                                                                        | Notification                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **P0 — site down or data exposure**   | qorium.online returns non-200 OR customer data is publicly visible OR a secret has been exposed in commits/logs/process listings | Any uptime monitor failure 2× consecutive · gitleaks on push · CVE-class report from researchers | CTO + CEO immediately (call, not just email/Slack)      |
| **P1 — major degradation**            | Specific page broken (`/contact` form fails consistently) OR p95 latency >2× SLO for >15 min OR CI workflow failing on `main`    | UptimeRobot/Plausible drop · CI workflow status                                                  | CTO immediately; CEO within 1 business hour             |
| **P2 — minor issue or risk surfaced** | Non-critical bug with workaround · single failing test · dependency CVE without active exploit                                   | CI report · weekly tech debt review                                                              | CTO within 1 business day; logged in `cto/tech-debt.md` |
| **P3 — informational**                | Documentation drift · ADR backfill needed · style nit                                                                            | Quarterly audit · drive-by                                                                       | CTO at next monthly review                              |

---

## Triage decision tree (run top-to-bottom)

### Step 1 — Detect

Sources that fire incidents:

- `deploy-marketing.yml` workflow Smoke test step → fails on non-200 from any of 6 critical routes
- `marketing-quality.yml` workflow → Lighthouse / axe / Playwright failure (P2 unless thresholds set to hard-fail)
- `ci.yml` → lint / typecheck / test / secret-scan / security-audit failure on `main`
- gitleaks pre-commit → blocked secret in commit (P0 if pushed before block; P1 if blocked locally)
- External report → email to `security@qorium.online` (set up at C2 phase)
- PM2 log monitoring → process restarts >3 in 1 hour
- nginx error log → 5xx rate >5% over 5 min window

### Step 2 — Classify (use the table above)

If ambiguous between P0 and P1 — **classify as P0**. Cost of escalating one rung too high is small; cost of under-classifying a real P0 is unbounded (per SO-3 Quality Gate Discipline).

### Step 3 — Page

| Severity | Action                                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | (1) Phone call to CEO. (2) Slack/WhatsApp to CTO if not on-call. (3) Customer notification path (see §Customer notification) within 30 min of confirmation. |
| P1       | (1) Slack/WhatsApp to CTO. (2) Email summary to CEO within 1 hour.                                                                                          |
| P2       | Log in `cto/tech-debt.md` with severity tag; address in next sprint.                                                                                        |
| P3       | Log in `cto/tech-debt.md` with severity tag; address in next quarter.                                                                                       |

### Step 4 — Contain

Containment-before-fix is the rule. Specific containment by incident type:

| Incident type                           | Containment action                                                                                     | Reference                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Marketing site 5xx                      | Roll back to previous PM2 version                                                                      | `cto/runbooks/deploy-rollback.md`                                             |
| Secret exposed in commit                | Rotate the secret immediately (don't wait to remove from history)                                      | `cto/runbooks/secret-rotation.md`                                             |
| Secret exposed in logs/process          | Rotate the secret immediately + audit who had access                                                   | `cto/runbooks/secret-rotation.md`                                             |
| ReadyBank API 5xx                       | Restart PM2 process; if persistent, rollback to previous version                                       | (TBD: separate readybank runbook — currently inherits this one's containment) |
| nginx config error                      | Restore previous nginx config from `/etc/nginx/sites-available/.bak`                                   | (created automatically by `infra/marketing-deploy.sh` §6)                     |
| TLS expiry                              | Force certbot renewal; if blocked, deploy ACME HTTP-01 fallback                                        | (acme.sh as backup; documented in §TLS expiry below)                          |
| Form spam attack                        | Enable in-memory IP throttle (already deployed); upgrade to Upstash Redis throttle if pattern persists | `apps/marketing/src/actions/contact.ts`                                       |
| Database leak (when ReadyBank has data) | Read-only mode on the affected tables; rotate `DATABASE_URL`                                           | (TBD: when ReadyBank has live customers)                                      |

### Step 5 — Fix

Apply the fix. ALL fixes go through PR review even in incident response — SO-3 doesn't suspend. The PR description should reference the incident ID + what changed + what's the verification.

### Step 6 — Verify

- Re-run the originating detection (smoke test, CI workflow, etc.)
- For P0/P1: monitor for 1 hour after fix to confirm no recurrence
- Update incident log (see §Incident log below)

### Step 7 — Post-incident review

For P0 and P1 incidents only. Within 48 hours:

- Write a postmortem (template below)
- Identify any tech debt + add to `cto/tech-debt.md`
- Identify any ADR worth writing if the incident exposed a recurring architectural weakness
- Discuss in next monthly business review (`bali/templates/monthly-business-review.md` §9 asks for CEO/CTO)

---

## Customer notification

For P0 incidents involving customer-facing impact:

| Affected                                       | Notify within                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Customer data exposure                         | 24 hours (DPDPA + GDPR requirement)                                                     |
| Site down >1 hour                              | 2 hours via status page (TBD: status page deferred until live customer count justifies) |
| API outage (when ReadyBank has live customers) | 30 min via direct email to integration contacts                                         |
| Form submission loss                           | Same-day acknowledgment + manual recovery from console-fallback logs                    |

Customer notification template:

```
Subject: [QOrium] <severity>: <one-line description>

We detected <incident description> at <timestamp UTC>.

Impact: <what was affected, who was affected>

Status: <current state — fixed / mitigated / under investigation>

Action you need to take: <if any — usually none>

Root cause: <one-paragraph or "investigation in progress">

What we're doing: <containment + fix actions>

We'll send a final update by <timestamp>.

— Bhaskar Anand, CEO
   security@qorium.online
```

---

## TLS expiry

Let's Encrypt certs expire every 90 days. Certbot auto-renewal runs weekly via cron on VPS 1. If renewal fails:

1. **Detect:** UptimeRobot (when set up) flags TLS errors. OR: `curl -I https://qorium.online` shows expired cert warning.
2. **Diagnose:** SSH to VPS, run `certbot certificates`. Look for `INVALID` or expiring soon.
3. **Force renewal:** `certbot renew --force-renewal` on the VPS.
4. **If certbot fails (rate limit, DNS issue):**
   - Check Let's Encrypt rate limits (5 cert/week per domain).
   - Use acme.sh as fallback: `acme.sh --issue -d qorium.online --webroot /var/www/letsencrypt`.
5. **Reload nginx:** `systemctl reload nginx`.
6. **Verify:** `curl -I https://qorium.online` should show fresh cert.

---

## Incident log

Maintained in `cto/incidents/YYYY-MM-DD-INC-NNN.md` (folder created on first P0/P1; for P2 the entry lives in `cto/tech-debt.md`).

Postmortem template:

```markdown
# Incident YYYY-MM-DD-INC-NNN — <one-line title>

**Severity:** P0 / P1 / P2
**Detected:** <timestamp UTC> via <source>
**Resolved:** <timestamp UTC>
**Duration:** <X minutes/hours>
**Customer impact:** <described — none / forms unavailable / API errors / etc.>

## Timeline

- HH:MM UTC — <event>
- HH:MM UTC — <event>
- ...

## Root cause

<What actually broke. Be specific. "A bug" is not a root cause.>

## Why we didn't catch it earlier

<Honest answer. "We didn't have monitoring for X" is acceptable.>

## What we did to contain

<Step-by-step.>

## What we did to fix

<Commit references + PR links.>

## What we're changing to prevent recurrence

<Concrete actions with owners + dates.>

## Tech debt added

<Cross-reference cto/tech-debt.md entries.>

## ADR worth writing?

<Yes/No + draft ADR title if Yes.>
```

---

## Pre-shipped lessons (from prior session incidents)

These were resolved before this runbook existed. They inform Y1 on-call defaults:

| Date         | Incident                                              | Lesson                                                                                                                                      |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Apr 16, 2026 | Ollama OOM on production VPS                          | Constitution SO-14: No Ollama on VPS. Heavy inference runs on Mac Mini M4 Pro or via Anthropic/OpenAI/Gemini APIs.                          |
| 2026-05-04   | PM2 6.0.14 ecosystem.cjs TypeError on `config.deploy` | PM2 6.x bug. Switched to shell launcher script `.pm2-start.sh`. (Captured in commit `9af3f39`.)                                             |
| 2026-05-05   | gitleaks false positive on test fixture               | Added explicit allowlist entries to `.gitleaks.toml`. Always scope allowlists narrowly (path or regex), never broaden to "ignore all of X." |

---

_Cross-references: Constitution SO-3 (Quality Gate Discipline), SO-14 (No Ollama on VPS), SO-15 (Zero Secrets in Git). Companion: `governance/Incident-Response-Runbook-v1.md` (governance-level). Related runbooks: `cto/runbooks/deploy-rollback.md`, `cto/runbooks/secret-rotation.md`. Tech debt log: `cto/tech-debt.md`._
