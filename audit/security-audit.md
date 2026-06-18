# Security Audit

Generated: 2026-06-18

## Live Header Check

`curl -I https://qorium.online/` returned HTTP 200 and the following security controls:

- Strict-Transport-Security
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Findings

- Security headers are implemented in `apps/marketing/next.config.mjs`.
- Live responses currently show duplicate header values for several controls, likely from app plus edge/CDN layering. This is not an immediate blocker, but should be cleaned up in the edge configuration if possible.
- CSP permits Plausible, Calendly, Resend API, Cloudflare insights, Google Fonts, inline styles, and inline/eval scripts required by the current Next/third-party setup.
- Lighthouse flags the current CSP as not fully XSS-hardened because it still permits inline script patterns. This remains a documented warning, not a new regression from this patch.
- The site correctly avoids SOC 2 and ISO certification claims in `/security`.

## Fixes Implemented

- No new external analytics vendor was introduced.
- Event props deliberately avoid personal data and assessment content.
- Legal pages now present review-copy status without the misleading "pre-launch" framing.
- Press kit now flags the locked "world's first" phrase as positioning rather than independently verified market-ranking proof.

## Remaining Work

- Confirm whether duplicated security headers should be removed at Cloudflare or app level.
- Tighten CSP in a follow-up after checking Calendly and Plausible behavior in production.
- Run `pnpm secrets:scan` before merge if this patch is committed.
