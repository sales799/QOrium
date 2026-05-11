# ADR 0003 — Mailer fallback chain: Resend → Gmail SMTP → console-log

**Status:** Accepted
**Date:** 2026-05-01 (backfilled 2026-05-06)
**Authors:** CTO Office
**Constitutional anchor:** SO-15 (Zero Secrets in Git — env-driven config), SO-16 (Documentation as Code); also relevant to PRE-LAUNCH-CHECKLIST C2.1
**Reviewers:** CTO (sole, Y1)

---

## Context

The marketing site has two forms with server actions: `/contact` and `/demo`. Both send email on submission. We needed a strategy that:

1. Works in production with a real provider.
2. Works in development without requiring developers to set up real email accounts.
3. Works in pre-launch staging where keys may not yet be provisioned.
4. Doesn't fail silently — if email isn't dispatched, the user-facing form still completes successfully and the operator can recover the submission.

Resend is the primary provider (lightweight API, good React Email integration, $0 free tier under volume). Gmail SMTP via nodemailer is the fallback (every CEO has a Gmail account; app-passwords work for 2FA accounts). Console-log is the dev-environment + last-resort safety net.

## Decision

**Implement a 3-step mailer fallback chain in `apps/marketing/src/lib/mailer.ts`:**

```
1. If RESEND_API_KEY is set → dispatch via Resend.
2. Else if GMAIL_USER + GMAIL_APP_PASSWORD are set → dispatch via nodemailer/Gmail.
3. Else → console.log the message + return success.
```

The form's user-facing response is **always** "sent successfully" once the server action completes. Operator visibility into which step actually fired is via `mailer.ts` exporting a `mailerStatus` enum (`resend` | `gmail-smtp` | `console-fallback`) consumed by the `/contact` and `/demo` pages to surface a banner ("Pre-launch: requests are logged for manual review until the mail provider is configured").

## Consequences

### Positive

- Zero-config dev experience (console-log just works).
- Pre-launch staging works without keys (operator collects from logs).
- Production is a key-set away from full operation.
- No silent failures (banner surfaces on UI when in fallback mode).

### Negative

- Three code paths to maintain. Mitigated by a single `mailer.ts` module with one public `send()` function; each path is ~10 lines.
- Console-log in production is a footgun if env mis-configured. Mitigated by the UI banner.
- Resend has DNS requirements (SPF + DKIM on `qorium.online`) that must be configured separately. Mitigated by ADR 0005 (deploy-time env injection) which ensures the key only lands on a host where DNS is confirmed.

### Neutral / observations

- Upstash Redis is supported optionally for rate limiting (`UPSTASH_REDIS_REST_URL/TOKEN`); falls back to in-memory throttle when absent. Same fallback-chain philosophy.
- The Server Action pattern means form validation happens before any mailer dispatch — invalid input never hits the mailer.

## Alternatives considered

### Alternative 1: Resend-only, hard-fail without key

Rejected. Pre-launch users would see broken forms; dev experience requires a Resend dev key; no recovery path if Resend is down.

### Alternative 2: AWS SES

Considered. Excellent cost at scale and infinite reliability. Rejected for Y1 because:

- AWS account setup overhead vs Resend's 5-minute onboarding
- SES sandbox approval dance (Indian region quirks) adds 1-2 weeks of timeline
- Y1 volume doesn't justify the operational complexity

Re-evaluate at Y2+ when monthly email volume crosses ~10K.

### Alternative 3: Local SMTP via Postfix on the VPS

Rejected. Deliverability is the issue — fresh VPS IPs land in spam folders by default. Even with proper SPF/DKIM/DMARC, IP reputation is a real cost. Use a deliverability-as-a-service provider instead.

## Implementation notes

- **File:** `apps/marketing/src/lib/mailer.ts` — single public `send({to, from, subject, html, text})` function
- **Status export:** `apps/marketing/src/lib/mailer.ts` exports `mailerStatus: 'resend' | 'gmail-smtp' | 'console-fallback'`
- **UI consumers:** `/contact/page.tsx` and `/demo/page.tsx` import `mailerStatus` and conditionally render the pre-launch banner
- **Env documented:** `apps/marketing/.env.example` lists all 4 variables with comments on which trigger which path
- **Deploy-time injection:** ADR 0005 — the GH Actions deploy workflow writes these to `apps/marketing/.env.local` on the VPS via stdin (secrets never in process listings)
- **Commit:** `71b4c48` (Sprint 7 forms)

## Verification

- **Unit test (when added per Phase 1.2 of completion sprint):** mock each env-var combination, assert correct path fires.
- **E2E (Playwright, when added per Phase 1.2):** submit /contact form; assert response is success; assert (in fallback mode) the banner is visible.
- **Production smoke (post-deploy):** submit a real form, confirm email arrives at `hello@qorium.online`.

## References

- Constitution SO-15 (Zero Secrets in Git — env-driven by design)
- Constitution SO-16 (Documentation as Code — env vars documented in `.env.example`)
- ADR 0005 (stdin-fed env injection — partner pattern)
- `apps/marketing/.env.example` — env contract
- Resend docs (resend.com/docs)
- nodemailer docs (nodemailer.com)
