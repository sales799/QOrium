# ADR 0004 — VPS deploy via PM2 + nginx + Let's Encrypt (deferred Vercel)

**Status:** Accepted
**Date:** 2026-05-04 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-13 (Talpro Universe Tech Stack); also relevant to cost discipline + Phase 0 deployment options
**Reviewers:** CTO + CEO (CEO concurrence on VPS choice — KVM4 / VPS 1)

---

## Context

The marketing site needed to go live. Two deployment paths were viable:

1. **Vercel** — zero-infra, native Next 15 support, per-PR previews, $0 free tier under volume.
2. **Self-hosted on Talpro Universe VPS 1 (Hostinger KVM4)** — same stack as other Talpro Universe services, full control, no per-build limits.

The original 10-sprint plan pre-approved Vercel as the deploy target. Mid-build, the CEO directed VPS deployment to keep the marketing site on Talpro infrastructure (consistency with services + cost discipline + no Vercel-specific lock-in).

The deploy stack on Talpro Universe VPS 1 is already PM2 + nginx + Let's Encrypt for sister services (e.g., qorium-admin per `infra/B10-ecosystem.config.js`). The marketing site adopting the same stack avoids inventing new infrastructure.

## Decision

**Deploy the marketing site to VPS 1 (Hostinger KVM4) via PM2 + nginx + Let's Encrypt.** Reuse the established Talpro Universe deploy pattern.

Specifically:

- **Process management:** PM2 (per `services/readybank` precedent)
- **Reverse proxy:** nginx (TLS termination, gzip, security headers, vhost-per-domain)
- **TLS:** Let's Encrypt with automatic renewal via certbot
- **DNS:** Hostinger DNS API for both `qorium.online` (primary) and `qorium.in` (301 redirect)
- **Bootstrap:** idempotent shell script `infra/marketing-deploy.sh` with §1-10 sections (clone/pull, install, build, env-setup, PM2 start, nginx vhost, certbot, verify) + §9b (qorium.in redirect cert + vhost)

Vercel deploy explicitly deferred. Re-evaluate at Y2 if VPS scaling becomes a bottleneck.

## Consequences

### Positive

- Consistent stack across Talpro Universe services — single deploy mental model.
- Zero per-build / per-deploy cost.
- Full control: nginx config, PM2 logs, file system, IP allowlist, etc.
- qorium.in 301 redirect can be implemented at the nginx level (cleaner than DNS-only redirect).

### Negative

- No automatic per-PR preview URLs (Vercel's killer feature). Mitigated by the `marketing-quality.yml` workflow which builds the app on every PR; preview-deploy capability deferred to Y2.
- Deploy-script maintenance is on us (vs Vercel's managed pipeline).
- TLS rotation is on us (Let's Encrypt 90-day renewal — automated via certbot, but we own the process).
- VPS capacity ceiling (KVM4 = 4 vCPU, 8GB RAM) — fine for marketing site at expected Y1 traffic; re-evaluate at Y2.

### Neutral / observations

- The deploy script encountered a PM2 6.0.14 bug with `ecosystem.cjs` format → mitigated by using a shell launcher script instead. See ADR 0009 (TBD if we ever write it; currently captured in commit `9af3f39`).
- Hostinger API key needed for DNS automation → handled in scope of secret rotation runbook (`cto/runbooks/secret-rotation.md`).

## Alternatives considered

### Alternative 1: Vercel

Considered (and pre-approved in the original 10-sprint plan). Rejected mid-build per CEO directive: stay on Talpro Universe infrastructure for consistency + cost.

### Alternative 2: Cloudflare Pages

Rejected. Excellent CDN + zero-infra, but adds another vendor dependency; same operational consistency concern as Vercel; Worker runtime quirks vs Node would require extra QA.

### Alternative 3: Docker on VPS

Considered. Rejected because PM2 is the existing Talpro Universe pattern; introducing Docker for one app creates a fork in the operational model (PM2 for other services + Docker for marketing). Re-evaluate at Y2 when there are >3 apps to deploy.

### Alternative 4: VPS 2 (Hostinger KVM2)

Rejected per CEO direction — VPS 1 (KVM4, the larger box) hosts marketing alongside ReadyBank API + future admin services. VPS 2 reserved for Talpro Universe sister product workloads.

## Implementation notes

- **Deploy script:** `infra/marketing-deploy.sh` — idempotent, runs over SSH from the GH Actions deploy workflow OR manually from the VPS
- **GH Actions workflow:** `.github/workflows/deploy-marketing.yml` — triggers on push to `main` (paths: `apps/marketing/**`, `infra/marketing-deploy.sh`, this workflow itself) or on `workflow_dispatch`
- **VPS path:** `/opt/apps/qorium-marketing` (cloned from this repo)
- **PM2 process name:** `qorium-marketing`
- **nginx vhost:** `qorium.online` (primary, port 443) + `qorium.in` (301 redirect to qorium.online, port 443)
- **TLS:** Let's Encrypt via certbot, auto-renewed weekly via cron; both vhosts have certs
- **Initial deploy commit:** `029f519` (bootstrap), `9af3f39` (PM2 fix), `9eca7ff` (qorium.in §9b addition)

## Verification

- **GH Actions workflow runs `Smoke test the live URL`** step after deploy — curls 6 routes, fails the workflow if any returns non-200.
- **Manual smoke:** documented in `apps/marketing/PRE-LAUNCH-CHECKLIST.md` §F3.
- **TLS renewal:** certbot logs land at `/var/log/letsencrypt/`; renewal cron runs weekly; alert on failure (TBD: hook into Sentry when DSN is provisioned).
- **PM2 health:** `pm2 logs qorium-marketing` for runtime errors; `pm2 status` for process state.

## References

- Constitution SO-13 (Talpro Universe Tech Stack)
- `infra/marketing-deploy.sh` — the deploy script (~10 sections)
- `.github/workflows/deploy-marketing.yml` — the GH Actions workflow
- `apps/marketing/HANDOFF.md` — original handoff briefing
- `apps/marketing/PRE-LAUNCH-CHECKLIST.md` §A1, A2, F3 — operational verification
- `infra/B10-ecosystem.config.js` — reference precedent for PM2 patterns on Talpro Universe
