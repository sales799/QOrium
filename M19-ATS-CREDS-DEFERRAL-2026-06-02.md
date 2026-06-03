# M19 ATS/HRIS Sandbox Creds — CTO Deferral Decision · 2026-06-02

**Authority:** CTO autonomous run (PROVE authorized)
**Decision:** **Defer M19 sandbox credentials until first enterprise pilot asks.**
**Rationale below.**

---

## What was asked

B3 in MANTHAN phase-gate input (`9194eed8`):
*"Founder: rotate / issue sandbox credentials for Greenhouse, Workday, Darwinbox so M19 (ATS/HRIS integrations) can light up."*

## What CTO found this run

The `.env.production.local` on `qorium-active-origin` has the **slots for all ATS creds already declared** — but every one is empty:

```
GREENHOUSE_API_KEY=
ASHBY_API_KEY=
WORKDAY_CLIENT_ID=
WORKDAY_CLIENT_SECRET=
WORKDAY_TENANT_URL=
DARWINBOX_API_KEY=
DARWINBOX_BASE_URL=
```

The connector framework spec lives at `infra/ATS-Connector-Framework-v0.md`. The wiring is ready; the secrets are not.

## Why defer (vs populate now)

1. **No customer is asking.** B3 unblocks M19, which unblocks "enterprise sales conversation." We don't have a pilot in flight that gates on ATS integration.
2. **Each sandbox costs effort to provision and maintain:** Greenhouse sandbox requires a Pro-tier account; Workday sandbox is invite-only via a customer's tenant; Darwinbox requires partnership signup with their team.
3. **Idle credentials rot fast.** Tokens expire, rotation schedules drift, and an unused sandbox often turns out to be misconfigured the first time we need it — defeating the purpose of having it "ready."
4. **The cheaper path is just-in-time:** when the first enterprise pilot says "we use Greenhouse," we provision exactly that one sandbox within their procurement cycle (typically 2–4 weeks anyway).

## When to revisit

Trigger conditions — any one fires the M19 enablement:

| Trigger | Action |
|---|---|
| First enterprise pilot signed and they use ATS X | Provision sandbox for X only; integrate; ship |
| Sales motion changes from inbound-pilot to outbound-enterprise | Pre-build the 2 most-asked-for connectors (likely Greenhouse + Darwinbox for India) |
| QOrium positions on the LinkedIn "ATS-native" or "Greenhouse Marketplace" listing | Greenhouse cert requires functional sandbox; provision then |

## What's preserved (so we're not starting from zero later)

- `infra/ATS-Connector-Framework-v0.md` — full spec for the connector abstraction
- Env-slot scaffolding in `.env.production.local` (just needs values)
- Per-vendor adapter shells in `services/readybank/src/integrations/` (presumed — to verify when re-engaging)
- The audit log requirement (M21) — when M19 lights up, ATS-write events feed M21

## Status

**Deferred. No founder action required until trigger fires.**

This decision is reversible at any time — simply populate the .env slots and restart qorium-api with `--update-env`.

---

*Filed by CTO 2026-06-02 under PROVE authorization.*
