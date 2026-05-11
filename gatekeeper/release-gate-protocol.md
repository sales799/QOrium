# Release Gate Protocol

**Authority:** Constitution §2.6 (GATEKEEPER) + SO-3 (Quality Gate Discipline) + SO-16 (Documentation as Code)
**Owner:** GATEKEEPER (CTO Office Y1)
**Cadence:** Per release / per merge to `main`

---

## What "release gate" means

A release gate is the explicit human sign-off that a change is safe to ship to production. It runs AFTER all automated CI gates pass; CI green is necessary but not sufficient.

The gate produces a single yes/no answer: **Ship?**

If yes → merge to `main` (which auto-deploys via `deploy-marketing.yml`).
If no → the contributing Office (CTO / CDO / Bali / etc.) addresses the gap; gate re-runs.

---

## When the gate runs

Per release. A "release" is any merge to `main` that affects production. Specifically:

- Code changes in `apps/marketing/` (deploys via `deploy-marketing.yml`)
- Code changes in `services/readybank/` or `packages/` (deploys via service-specific workflow when those exist)
- Content waves in `customer-zero/` (deploys via the content engine pipeline)
- Constitutional Amendments (per Article XI procedure; not a code release but still passes a gate)
- Operational changes to CI/CD workflows (`.github/workflows/`) — gate-on-self meta-discipline

NOT gated by this protocol:

- Changes purely in `cto/` / `bali/` / `manthan/` / `cdo/` / `gatekeeper/` operating folders (governance docs; covered by `quality-gate-operationalization.md` audit cadence)
- README typo fixes (no production impact)
- Test scaffolding changes (no production impact unless they break CI)

---

## The release-gate checklist

Run top-to-bottom. ALL items must pass for the gate to release.

### Section 1 — Automated CI gates (must be green)

- [ ] `ci.yml` workflow: lint ✅ · typecheck ✅ · test ✅ · secret-scan ✅ · security-audit ✅ · build ✅
- [ ] `marketing-quality.yml` (if PR touches `apps/marketing/**`): Lighthouse + axe + Playwright E2E ✅
- [ ] `gitleaks detect` clean against the full PR diff (gitleaks runs in CI; this is a manual paranoia check)
- [ ] `pnpm audit --prod --audit-level high` clean (covered by `security-audit` job)

If any CI gate is red → STOP. Address the failure before re-running the gate.

### Section 2 — Human review

- [ ] PR description matches the actual change (no scope creep beyond what's described)
- [ ] At least 1 reviewer approval from a different Office than the contributing one (Y1 is CTO solo on most PRs — CEO co-reviews when material per Article VI threshold)
- [ ] No outstanding `Request changes` blocks
- [ ] Linked issue / ADR / blueprint exists for material changes (SO-16 audit trail)

### Section 3 — Constitutional discipline

- [ ] No Constitutional violation introduced (cross-check the SOs touched by the change)
- [ ] If pricing band changed → SO-11 / SO-23 / Article XI Amendment cycle followed
- [ ] If competitive classification touched → SO-25 re-validation triggered + logged in `manthan/revalidations/`
- [ ] If new architectural decision → ADR exists in `cto/adrs/` (per ADR backfill discipline)
- [ ] If new content shipped → SO-21 (IRT) + SO-22 (anti-leak) + Article VII auto-fail criteria all satisfied

### Section 4 — Customer impact assessment

- [ ] What changes for end users? (One sentence answer required)
- [ ] What's the rollback plan if this breaks? (`cto/runbooks/deploy-rollback.md` reference)
- [ ] Any customer notification needed? (per `cto/runbooks/incident-response.md` §Customer notification thresholds)
- [ ] Smoke-test the staging or PR-preview environment passed

### Section 5 — Risk classification

- [ ] **Risk class:** Low / Medium / High / Critical (use the `cto/runbooks/incident-response.md` severity rubric reversed: Critical-class change = same caution level as P0 incident response)
- [ ] If High or Critical → CEO co-sign required (Article II §2.2)
- [ ] If Medium → CTO sign-off sufficient
- [ ] If Low → may be batched with other Low-class changes

### Section 6 — Post-deploy plan

- [ ] Who's monitoring for the next 4 hours after deploy?
- [ ] What metric / log line / smoke test confirms success?
- [ ] At what point does this rollback if metric trends bad?

---

## Sign-off log

Every gate pass logs to `gatekeeper/release-signoffs/YYYY-MM-DD-PR-NNN.md`:

```markdown
# Release Gate — PR #NN: <title>

**Date:** YYYY-MM-DD HH:MM UTC
**Risk class:** Low / Medium / High / Critical
**GATEKEEPER signer:** <name + Office>
**Co-signer (if High/Critical):** <CEO + date>

## Sections passed

- [x] Section 1 — CI gates green
- [x] Section 2 — Human review complete
- [x] Section 3 — Constitutional discipline
- [x] Section 4 — Customer impact assessed
- [x] Section 5 — Risk classified
- [x] Section 6 — Post-deploy plan logged

## Notes / exceptions

<Any deviations from the standard checklist; any waived items with justification>

## Post-deploy outcome (filled within 4 hours)

- Deploy time: HH:MM UTC
- Smoke test result: PASS / FAIL
- Customer impact observed: yes/no
- Rollback triggered: yes/no
- Status: SHIPPED / ROLLED BACK / IN MONITORING
```

---

## Anti-patterns (don't do these)

- ❌ **Skipping the gate "because it's a small change."** SO-3. Small changes ship through the gate; the time cost is ~3 minutes.
- ❌ **Co-signing your own work.** GATEKEEPER + contributing Office must differ for material changes.
- ❌ **Approving a gate with red CI.** No exceptions. Fix CI first.
- ❌ **Skipping the post-deploy plan.** A release that ships without a rollback plan is a release waiting to surprise the team.
- ❌ **Auto-merge on protected branches.** PR #10 explicitly disabled auto-merge per the Completion Sprint v1 Phase 4.3.

---

## Y1 reality: who runs the gate

In Y1, CTO Office wears the GATEKEEPER hat. Practical workflow:

1. Contributing Office opens PR
2. CI runs automatically (Section 1)
3. CTO reviews (Section 2 + 3 + 4)
4. CTO classifies risk (Section 5)
5. If High/Critical → CTO escalates to CEO; CEO co-signs
6. CTO logs sign-off (this protocol's log structure)
7. CTO merges PR (auto-deploy fires for marketing-touch changes)
8. CTO monitors for post-deploy window per Section 6 plan

When dedicated GATEKEEPER hire lands (Y2+), step 3-7 transfer; CTO retains escalation authority for Critical-class only.

---

## Pre-shipped lessons (from prior incidents informing this protocol)

These were resolved before this protocol existed. They informed the Section design:

- **2026-04-30:** PM2 6.0.14 ecosystem.cjs bug. Lesson: Section 6 (post-deploy plan) must include "what's the smoke test" — that smoke test would have caught the launcher-script breakage before customers saw it. (Captured in commit `9af3f39` + ADR 0004.)
- **2026-05-04:** gitleaks false positive on test fixture. Lesson: Section 1 secret-scan check must include reading the gitleaks allowlist (`.gitleaks.toml`) when extending detection — narrow allowlist scoping is the rule.
- **2026-05-06:** Prettier formatting CI fix. Lesson: Section 1 lint check must run lint-staged locally before gate, not just rely on CI to find it post-push.

---

## Companion: incident response on gate failure

If a release passes the gate AND breaks production anyway:

1. Trigger `cto/runbooks/incident-response.md` Step 1 (Detect)
2. Severity classification per the runbook
3. Containment via `cto/runbooks/deploy-rollback.md`
4. Post-incident: amend THIS protocol with whatever check would have caught the breakage

The release gate is iterative. Every miss strengthens the next gate's checklist.

---

_Cross-references: Constitution §2.6 (GATEKEEPER), Article VII (Quality Gate), SO-3, SO-15, SO-16. Companion: `gatekeeper/security-review-protocol.md` (Section 3 sub-protocol), `gatekeeper/ci-gate-maintenance.md` (Section 1 detail), `gatekeeper/quality-gate-operationalization.md` (Section 3 deeper procedure for content waves), `cto/runbooks/incident-response.md` (parent for gate-failure incidents), `cto/runbooks/deploy-rollback.md` (Section 4 reference)._
