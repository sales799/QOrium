# CI Gate Maintenance

**Authority:** Constitution §2.6 (GATEKEEPER) + SO-3 (Quality Gate Discipline)
**Owner:** GATEKEEPER (CTO Office Y1)
**Cadence:** Continuous (CI workflows fire on push) + monthly audit

---

## What CI gates QOrium runs

Four GitHub Actions workflows in `.github/workflows/`:

| Workflow                | Triggers                                                                                   | What it gates                                                  | Failure response                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                | every push to `main`, every PR to `main`                                                   | lint, typecheck, test, secret-scan, security-audit, build      | Block merge until green                                                                                             |
| `marketing-quality.yml` | PRs touching `apps/marketing/**`                                                           | Lighthouse CI, axe-core a11y, Playwright E2E                   | Soft-fail in `warn` mode (per TD-006); flips to hard-fail after 3 baselines                                         |
| `deploy-marketing.yml`  | push to `main` (paths: marketing app, deploy script, this workflow) OR `workflow_dispatch` | SSH to VPS, inject env, run deploy script, smoke-test 6 routes | If smoke fails, deploy job fails (red on the run); operator triggers rollback per `cto/runbooks/deploy-rollback.md` |
| `uptime.yml`            | cron `*/5 * * * *` (every 5 min)                                                           | 6 critical-route 200 + TLS cert ≥14 days + qorium.in 301       | Workflow run goes red; visible on repo home; team monitors GitHub notifications                                     |

---

## What each gate catches (and what it doesn't)

### `ci.yml` (the canonical gate)

**Catches:**

- Lint errors (ESLint flat config + Prettier formatting)
- TypeScript errors (strict mode; no `any`)
- Test failures (Vitest in services/packages; future Playwright in marketing)
- Committed secrets (gitleaks against full diff)
- High-severity dep CVEs (`pnpm audit --prod --audit-level high`)
- Build failures (`pnpm build` across all workspaces)

**Doesn't catch:**

- Logic bugs (you can write passing tests for wrong behavior)
- Runtime config errors (env var typos)
- Bundle size regressions (per `apps/marketing/BUNDLE-BASELINE.md` — manual check)
- Performance regressions (handled by `marketing-quality.yml`)
- Constitutional violations (handled by GATEKEEPER human review)

### `marketing-quality.yml`

**Catches:**

- Lighthouse Performance regressions (warn mode; ≥85 target)
- Lighthouse Accessibility / Best Practices / SEO regressions (warn mode; ≥90 target)
- axe-core a11y violations on 9 critical routes
- Playwright E2E smoke failures on 5 critical routes

**Doesn't catch:**

- A11y issues axe doesn't catch (~70% coverage of WCAG 2.1 violations is automated; the rest needs human review)
- Visual regressions (no Percy / Chromatic configured Y1)
- Cross-browser issues (Chromium only Y1; Firefox / Safari testing manual)
- Mobile-specific issues (synthetic monitor only; real-device test in F8)

### `deploy-marketing.yml`

**Catches:**

- SSH connection failures
- Deploy script errors (`infra/marketing-deploy.sh` exit non-zero)
- Smoke-test failures post-deploy

**Doesn't catch:**

- Long-tail bugs that surface only with real traffic
- DNS issues (handled separately by `uptime.yml`'s redirect check)
- TLS cert renewal failures more than 14 days out (caught by `uptime.yml`)

### `uptime.yml`

**Catches:**

- Site outages (any of 6 routes returning non-200)
- Slow routes (>5s warning)
- TLS cert expiring within 14 days
- qorium.in redirect breakage

**Doesn't catch:**

- Brief outages (cron has up to 5-min jitter; outages <10 min may slip)
- Subdomain-specific issues if not on the 6-route list
- Application errors that return 200 with garbage content

---

## Workflow change discipline

Any change to a workflow file triggers a security review per `gatekeeper/security-review-protocol.md` Section 1. Why: workflows have admin-level scope; mistakes leak secrets or break deploys.

Specific rules:

- **`ci.yml`**: changes require CTO + 1 reviewer; never modify the secret-scan job to "ignore X" without a `.gitleaks.toml` allowlist entry (always tighter scoping)
- **`marketing-quality.yml`**: changing thresholds in `apps/marketing/lighthouserc.json` from `warn` → `error` requires 3 PR runs of baseline data per TD-006 paydown
- **`deploy-marketing.yml`**: changes affect production directly; CTO + CEO co-review for any non-trivial change; especially scrutinize secret-injection step (ADR 0005)
- **`uptime.yml`**: relatively safe to iterate; add new routes when the route count on the live site grows; remove routes ONLY when they're permanently retired

---

## CI failure response (when a gate goes red)

### `ci.yml` red on `main`

This is **P1 incident** per `cto/runbooks/incident-response.md`. Mean time to fix per `cto/sli-slo.md` operational SLO: <2 hours.

1. CTO acknowledged within 2h
2. Identify the failing job; reproduce locally
3. Fix in a new PR (NOT a force-push to main; Constitution discipline)
4. Once fix PR is green, merge; main is back to green
5. Postmortem if the failure pattern was preventable (typically yes; CI failures are rarely surprises)

### `ci.yml` red on PR

Block merge. Contributor addresses; re-runs CI. No human review until CI is green.

### `marketing-quality.yml` red

Currently soft-fail (warn mode per TD-006). Review the artifact (Lighthouse report, axe report, Playwright HTML report). If a regression: block merge until addressed. If a baseline drift: log to baseline file; tune threshold in next iteration.

### `deploy-marketing.yml` red

This is **P0 incident**. Production may be in a broken state.

1. Trigger `cto/runbooks/deploy-rollback.md` immediately
2. CTO + CEO notified
3. Postmortem within 48h per Section 7 of incident-response runbook

### `uptime.yml` red

Single fail = transient (cron jitter, brief network blip). Two consecutive fails = real incident; trigger `cto/runbooks/incident-response.md` Section 1 (Detect).

---

## Quarterly CI audit (GATEKEEPER cadence)

Once per quarter:

1. **Workflow effectiveness review:** for each workflow, did it catch what it was supposed to catch? Any false negatives where a real issue slipped through?
2. **Workflow timing review:** are any jobs hitting timeout? Should the timeout extend, or should the job run faster?
3. **Workflow cost review:** GitHub Actions free-tier minutes — are we approaching the limit? (Y1 expected: well under; Y2+ may need monitoring)
4. **Threshold tuning:** for `marketing-quality.yml`, is the warn-mode-to-error-mode flip ready? (TD-006 trigger condition)
5. **New gates needed:** any class of bug that's reached production but isn't gated yet?

Findings logged in monthly business review (`bali/templates/monthly-business-review.md` §9 asks for CTO).

---

## Pre-shipped lessons

These predate this maintenance protocol; they inform the design:

- **2026-05-04 — gitleaks v8 syntax migration:** original gitleaks-action v8 wasn't picking up our config syntax. Replaced with direct gitleaks binary install per `infra/CTO-deltas/CTO-DELTA-gitleaks-v8-syntax.md`. **Lesson:** prefer direct binary installs over GitHub Marketplace actions for security-critical tools (binary is auditable, action's source may not be).
- **2026-05-04 — CI postgres + redis services:** `services/readybank` tests need postgres + redis. Added service containers to `ci.yml` test job. **Lesson:** when a workspace tests need infra, declare it in CI; don't expect contributors to run docker-compose locally.
- **2026-05-05 — Prettier on .css/.mdx CI failure:** pre-commit lint-staged glob didn't cover .css/.mdx. Extended glob; ran prettier --write in same commit. **Lesson:** lint-staged glob coverage should match Prettier glob coverage; verify when adding new file types.
- **2026-05-06 — Bundle baseline tooling:** `@next/bundle-analyzer` plumbed but baseline run wasn't captured. Now resolved per `apps/marketing/BUNDLE-BASELINE.md`. **Lesson:** any tool plumbed should have its first-use captured in the same sprint, not deferred indefinitely.

---

## What's NOT here

- ❌ **GitHub branch protection rules** — those live in GitHub repo settings, not in code. Document them at `gatekeeper/github-settings.md` if/when they're configured (currently the repo has implicit protection via PR review requirement; explicit rules deferred until C1.2 — repo flipped back to private).
- ❌ **Secret scanning beyond gitleaks** — GitHub has its own secret scanning that may surface additional findings; check repo Security tab quarterly.
- ❌ **CodeQL / SAST workflows** — not Y1 priority; revisit when paid customers onboard.

---

_Cross-references: Constitution §2.6, SO-3, SO-15. Companion: `gatekeeper/release-gate-protocol.md` (Section 1 inputs are the CI gates), `gatekeeper/security-review-protocol.md` (workflow changes trigger this), `cto/runbooks/incident-response.md` (CI failure → incident workflow), `cto/runbooks/deploy-rollback.md` (deploy-marketing failure → rollback). All workflow files live at `.github/workflows/`._
