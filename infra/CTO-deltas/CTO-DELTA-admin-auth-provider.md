# CTO-DELTA: Admin auth provider — Credentials stub now, MSG91 OTP target, optional Google OAuth

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `07-CTO-Architecture-v1.md` §6.1 + Stream B handoff Sprint 1.2 brief

## Background

Two specs disagree on the admin auth provider:

| Source                                   | Provider                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `07-CTO-Architecture-v1.md` §6.1         | NextAuth.js with **email + OTP via MSG91**, MFA via TOTP for prod actions          |
| Stream B Sprint 1.2 handoff (CTO Office) | NextAuth.js with **Google OAuth** (Google client credentials are a halt-condition) |

Both sources insist on NextAuth.js as the framework, so the disagreement is
purely the **provider** binding.

## Adaptation in `apps/admin`

The Sprint 1.2 scaffold can't realistically commit to either binding:
real MSG91 needs an MSG91 API key + sender ID + DLT template, and real Google
OAuth needs a Google Cloud OAuth client (both gated on CEO-only secrets per
the handoff halt rules). To unblock everything else (route stubs, layout,
guard middleware, tests, dev workflow), the scaffold ships a third option:

- **Provider for now:** `next-auth` Credentials provider whose `authorize`
  callback validates the submitted email against
  `ADMIN_EMAIL_ALLOWLIST` (comma-separated env). No password, no OTP — this
  is a **scaffold stub for local dev only**.
- **Disabled by default:** `parseEmailAllowlist('')` returns `[]`, and
  `isEmailAllowed` returns `false` whenever the allowlist is empty, so a
  freshly-cloned repo cannot grant access without an explicit env var.
- **Lazy AUTH_SECRET validation:** `loadAdminEnv` returns a dev fallback
  when `AUTH_SECRET` is unset (so `next build` succeeds without
  production secrets). A separate `assertProdEnv` helper is exposed for
  startup smoke tests / healthchecks; NextAuth itself rejects an empty
  or stub secret at request time.

The scaffold deliberately separates `auth-config.ts` (pure logic) from
`auth.ts` (NextAuth wiring). When the CTO Office picks a provider, the
swap is a one-file change in `auth.ts`:

- For **MSG91 OTP** (architecture §6.1 default): add the MSG91 client, swap
  Credentials for an Email + OTP flow (or keep Credentials with a `code`
  field that verifies against MSG91's verification API).
- For **Google OAuth** (handoff option): add `next-auth/providers/google`,
  pass `clientId` + `clientSecret` from env, restrict to `hd: "talpro.in"`
  hosted domain, and gate via the same email allowlist.

## Reconciliation request to CTO Office

Three options:

1. **MSG91 OTP** (architecture §6.1 canonical). Pros: aligns with India-first
   user base, no third-party identity dependency, adds SMS as a 2FA channel.
   Cons: SMS deliverability + DLT compliance, cost per OTP, vendor lock-in.
2. **Google OAuth** (handoff option). Pros: zero-cost, instant MFA via Google's
   account security, sub-second sign-in. Cons: assumes every admin has a
   Google Workspace identity at `talpro.in`; couples admin access to a
   Google outage.
3. **Both, env-gated** (recommended). Implement both providers; primary for
   prod is whichever env is configured (`MSG91_*` vs `GOOGLE_OAUTH_*`); fall
   back to Credentials stub only when `NODE_ENV !== 'production'`. Lets
   different deployments make different choices.

Default action if no reconciliation by next sprint review: assume **option 3**
(both providers, env-gated). The Sprint 1.2 PR ships only the Credentials
stub; provider integration is a follow-up sprint blocked on real credentials.

## Verification

`apps/admin/__tests__/`:

- `auth-config.test.ts` — 30 cases covering allowlist parsing, email format
  validation (9 parametrised inputs), allowlist matching, user construction,
  protected-path detection (9 parametrised inputs), login redirect URL building.
- `env.test.ts` — 7 cases covering the dev fallback, env override, build-time
  tolerance for missing `AUTH_SECRET`, allowlist raw passthrough, and
  `assertProdEnv` (3 boundary scenarios).

The scaffold's protected-route gating (the actual goal of Sprint 1.2) is
exercised end-to-end by the NextAuth `authorized` callback, which in turn
delegates to `isProtectedPath` — both pure-function-tested.
