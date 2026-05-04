# CTO-DELTA: Domain rebrand `qorium.io` → `qorium.online`

**Date:** 2026-05-04
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Origin:** CEO directive in this session: "We just have one Domain
qorium.online" + the published A record `api.qorium.online → 147.93.103.194`.

## Background

The CTO Office spec set (every `infra/*-Spec-v0.md`, `infra/D3-*.md`,
`infra/B*-*.md`, `governance/*.md`, top-level architecture docs)
authored against the placeholder domain `qorium.io`. The autonomous
build agent inherited that placeholder as the default fallback in
~25 files: SSO config defaults, SDK base URLs, env templates, PM2
prod env hostnames, docs site references, GitHub Actions workflow
inputs, etc.

The CEO has acquired and published `qorium.online` (single domain).
The A record for `api.qorium.online → 147.93.103.194` is live.

## What landed (Sprint 2.15.1, rebrand patch)

- **Code defaults rebranded** — every fallback/default URL in the
  TypeScript, config, env-template, and CI workflow files now uses
  `qorium.online`:
  - `services/sso/src/config.ts` (3 hits)
  - `services/sso/src/metadata.ts` (1 hit)
  - `services/readybank/src/middleware/problem.ts` (1 hit)
  - `packages/auth/src/middleware.ts` (1 hit)
  - `packages/qorium-sdk/src/{client,index}.ts` (2 hits)
  - `apps/docs/src/{app,lib}/*` (9 hits)
  - `apps/candidate-portal/__tests__/orchestrator-client.test.ts` (2 hits)
  - `services/sso/__tests__/*.test.ts` (28 hits)
  - `packages/qorium-sdk/__tests__/client.test.ts` (2 hits)
  - `packages/ats-connectors/__tests__/adapters/greenhouse.test.ts` (3 hits)
  - `infra/B10-ecosystem.config.js` (6 hits)
  - `infra/B5-CI-Pipeline.github-actions.yml` (11 hits)
  - `.github/workflows/ci.yml` (2 hits)
  - `infra/deployment/{staging,production}.env.template` (7 hits)

- **CTO-DELTA #25 (Customer Zero VPS deferral) partially unblocked** —
  one of four DNS halts (`api.qorium.io` → `api.qorium.online`) is now
  resolved. Remaining halts in #25:
  - `admin.qorium.online` A record (Sprint 2.4 admin app)
  - `docs.qorium.online` A record (Sprint 2.5 docs site)
  - `setu.qorium.online` A record OR reverse-proxy `api.qorium.online/setu/*`
  - `my.qorium.online` A record (Sprint 2.6 customer portal)

- **Setu webhook URL updated** — production env template now expects
  `SETU_WEBHOOK_URL=https://api.qorium.online/setu/v1/setu/deploys/webhook`.

## What is NOT changed

- **`infra/CTO-deltas/*.md`** — historical record. The pre-rebrand deltas
  reference `qorium.io` because that was the live default at the time
  they were filed. Rewriting them would erase the trail of "what we
  knew when". This delta cross-references the rebrand for future readers.

- **CTO Office spec docs** (`infra/*-Spec-v0.md`, `infra/D3-*.md`,
  `infra/B1-VPS-*.md`, `infra/B6-Secret-Rotation-Calendar.md`,
  `governance/*.md`, `customer-zero/*.md`,
  `07-CTO-Architecture-v1.md`, `task_plan_phase0_phase1.md`,
  `CONSTITUTION-RATIFICATION-RECORD-v2.0.md`) — these are CTO Office
  authorship; the rebrand is a downstream operational decision. The
  CEO can issue a separate CTO Office update to refresh the spec set
  if/when the domain is treated as authoritative for the spec text
  itself (vs the live deployment).

## Reconciliation request to CTO Office

Default action: **ratify the rebrand at the code + config layer**.
Spec docs stay on `qorium.io` until the CTO Office issues a refreshed
spec set; live deployment uses `qorium.online`.

## Verification

- `grep -rn 'qorium\.io' services/ packages/ apps/ infra/deployment/
infra/B5-CI-Pipeline.github-actions.yml infra/B10-ecosystem.config.js
.github/workflows/` returns zero matches.
- `pnpm typecheck` clean across all 25 workspaces.
- `pnpm lint` clean.
- `pnpm format:check` clean.
- `pnpm test` workspace-wide green (test fixtures use the host as
  opaque text; substituting it does not change any assertions).

## What this unblocks

- **Setu auto-deploy** can now point GitHub webhooks at
  `https://api.qorium.online/setu/v1/setu/deploys/webhook` (once nginx
  is configured + Setu is booted).
- **TLS provisioning** via `certbot --nginx -d api.qorium.online` is now
  possible (DNS resolves).
- **SSO SP metadata** XML download at
  `https://api.qorium.online/v1/auth/saml/metadata` matches the entity
  ID embedded in the document.

## Appendix — additional domain `qorium.in` (2026-05-04)

The CEO has registered a second domain: **`qorium.in`**.

Recommended split (pending CEO ratification):

- **`qorium.in`** — customer-facing brand domain, matches the India-
  first positioning in the spec set. Suggested subdomains:
  - `app.qorium.in` — admin app + candidate portal
  - `docs.qorium.in` — public API docs
  - `my.qorium.in` — billing portal
- **`qorium.online`** — operational/API surface. Already wired:
  - `api.qorium.online` — HTTP API + Setu webhook target
  - `setu.qorium.online` (or proxied via api) — auto-deploy

If the CEO prefers a single canonical domain, every hostname in the
build is overridable via env vars (`SSO_BASE_URL`, `NEXTAUTH_URL`,
`AI_PAIR_CODING_URL`, `SETU_WEBHOOK_URL`, etc.) so flipping is one
env-template edit. The autonomous build keeps `qorium.online` as the
code default until further direction.
