# Cowork-to-Stream-B Bridge Protocol v1

> **The problem:** Stream A (Cowork) authored the spec docs. Stream B (Claude Code) is building from those specs but operates in a separate GitHub repo. The specs never made it across. Stream B's `_QORIUM_BUILD_LOG.md` shows BLOCKED items pointing to specs that exist in Stream A but aren't accessible to Stream B.

> **The solution:** This protocol gives the CEO a single bash command that copies the relevant specs from Cowork → Stream B's GitHub repo. ~60 seconds of CEO physical action; everything else automated.

**Authored:** 2026-05-03 (Run #16; Sprint 0.6 will execute this)
**Authority:** CTO Office; CEO single-command execution
**Effective:** when Sprint 0.6 runs

---

## §1 — Why this exists

In autonomous mode, two streams operated independently:

**Stream A (Cowork):** authored specifications, content, governance, and operational docs in `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/`. This is the master reference.

**Stream B (Claude Code):** built actual TypeScript/Node code in `/home/user/QOrium/` + GitHub repo `sales799/qorium`. It's a complete monorepo with 7 stacked PRs (bootstrap → spec ingest → db → service skeleton → auth → questions endpoints → packs export). 66 tests passing. The `_QORIUM_BUILD_LOG.md` lists 4 CTO-DELTAs awaiting reconciliation.

Both streams are healthy. The disconnect: Stream B references Cowork specs that only exist on Bhaskar's Mac — they were never committed/pushed to the GitHub repo Stream B operates from.

---

## §2 — What needs to bridge

These Cowork specs need to land in Stream B's repo:

| Cowork file | Stream B path | Purpose |
|---|---|---|
| `09-QOrium-Constitution-v2.0.md` | `docs/CONSTITUTION-v2.0.md` | The operating system |
| `09-QOrium-Constitution-v2.0.docx` | `docs/CONSTITUTION-v2.0.docx` | Same; Word format for IP counsel |
| `07-CTO-Architecture-v1.md` | `docs/CTO-ARCHITECTURE-v1.md` | System design + tech stack reference |
| `infra/B5-CI-Pipeline.github-actions.yml` | `.github/workflows/ci.yml` | CI/CD GitHub Actions workflow |
| `infra/B6-gitleaks-config.yaml` | `.gitleaks.toml` | Secret scanning config (rename per gitleaks v8) |
| `infra/B7-postgres-migrations/0001_initial_schema.sql` | `infra/migrations/0001_initial_schema.sql` | Initial Postgres schema |
| `infra/B7-postgres-migrations/README.md` | `infra/migrations/README.md` | Migration discipline |
| `infra/B10-ecosystem.config.js` | `infra/pm2/ecosystem.config.js` | PM2 process config |
| `governance/Quality-Gate-92pt-Scorecard.md` | `docs/QUALITY-GATE-92pt-Scorecard.md` | Release gate per Constitution Article VII |
| `infra/Anti-Leak-Engine-v0-Design.md` | `docs/specs/Anti-Leak-Engine-v0-Design.md` | Spec for `qorium-leak-crawler` service |
| `infra/IRT-Calibration-Pipeline-v0-Spec.md` | `docs/specs/IRT-Calibration-Pipeline-v0-Spec.md` | Spec for nightly IRT batch |
| `infra/Judge0-Sandbox-Integration-Spec-v0.md` | `docs/specs/Judge0-Sandbox-Integration-Spec-v0.md` | Spec for `qorium-judge0-orchestrator` |
| `infra/JD-Forge-v0-Design.md` | `docs/specs/JD-Forge-v0-Design.md` | Spec for JD-Forge SKU |
| `infra/ATS-Connector-Framework-v0.md` | `docs/specs/ATS-Connector-Framework-v0.md` | Spec for ATS integration |
| `infra/Webhooks-Service-v0-Spec.md` | `docs/specs/Webhooks-Service-v0-Spec.md` | Spec for outbound webhooks |
| `infra/SSO-SAML-Enterprise-Spec-v0.md` | `docs/specs/SSO-SAML-Enterprise-Spec-v0.md` | Spec for enterprise SSO |
| `infra/Audit-Log-API-Spec-v0.md` | `docs/specs/Audit-Log-API-Spec-v0.md` | Spec for customer-facing audit API |
| `infra/Billing-Service-v0-Spec.md` | `docs/specs/Billing-Service-v0-Spec.md` | Spec for Razorpay + Stripe billing |
| `infra/D3-Talpro-Internal-API-Key-Spec.md` | `docs/specs/D3-Talpro-Internal-API-Key-Spec.md` | API key spec for Customer Zero |
| `governance/TestForge-QA-Pipeline-v1.md` | `docs/QA/TestForge-QA-Pipeline-v1.md` | QA pipeline orchestration |
| `governance/Bias-Detection-Methodology-v1.md` | `docs/QA/Bias-Detection-Methodology-v1.md` | DIF audit methodology |
| `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` | `docs/QA/AI-Plagiarism-Benchmark-Protocol-v1.md` | SO-22 ≥93% benchmark |

23 files. ~5MB total.

---

## §3 — The bridge script

A single bash script that, when run on Bhaskar's Mac, does this entire bridging in one command. Lives at `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/scripts/cowork-to-stream-b-bridge.sh` (Sprint 0.6 authors this).

**What the script does:**

1. Validates Stream B's local clone exists at `/home/user/QOrium` (or alternate path; configurable)
2. Validates Stream B's git working directory is clean
3. Creates a new branch `chore/cowork-spec-ingest`
4. Copies the 23 files from Cowork → Stream B (creating destination dirs as needed)
5. Stages + commits with a structured message per the Stream B BUILD_LOG conventions
6. Pushes the branch
7. Prints the GitHub PR URL for the CEO to click "Create PR"

**One physical action for CEO:**
```bash
$ ssh bhaskar@user-machine 'cd /home/user/QOrium && bash /path/to/cowork-to-stream-b-bridge.sh'
```

OR (if Bhaskar runs locally on the same machine):
```bash
$ bash /Users/bhaskar_universe/Documents/Claude/Projects/QOrium/scripts/cowork-to-stream-b-bridge.sh
```

**Time:** ~60 seconds of CEO time.

---

## §4 — Why this is a CTO-owned operation, not CEO-driven

- The 23-file mapping above is fully specified
- The bridge script is deterministic — no judgment calls needed at runtime
- The PR title + body + commit message are all CTO-authored
- The CEO action is literal "press Enter" — not "decide which files matter"

This satisfies the autonomous-mode pattern: ≤60-sec CEO physical action; everything else CTO-owned.

---

## §5 — What happens after the PR merges in Stream B

1. Stream B's `_QORIUM_BUILD_LOG.md` BLOCKED list shrinks to zero (all referenced specs now in repo)
2. CI workflow activates on next PR (B5 GitHub Actions YAML lands at `.github/workflows/ci.yml`)
3. The 7-PR stack (Stream B current state) gets real CI signal on PR #2 onwards
4. The 4 CTO-DELTAs awaiting reconciliation now have a canonical reference (Constitution v2.0 §, the actual D3 spec, etc.)
5. Stream B can proceed to Sprint 2 (apps/admin Next.js) with confidence

---

## §6 — Failure modes + recovery

### Stream B has uncommitted changes when bridge script runs

- Script aborts with clear message
- CEO commits or stashes Stream B changes; reruns bridge

### Stream B's GitHub repo can't accept push (auth issue)

- Script attempts SSH push; if fails, falls back to HTTPS with token from env
- If both fail, script outputs the patch as a `.patch` file CEO can apply manually

### Cowork file missing or moved

- Script logs missing-file warnings; continues with what exists; reports gap
- CEO reviews the gap report; decides to (a) accept partial bridge, (b) author the missing file in Cowork first, or (c) abort

### File conflict in Stream B (Stream B already has a different version)

- Script creates `<filename>.cowork` next to existing file; preserves both
- Stream B's existing version stays unchanged; Cowork version available as `.cowork`
- Stream B engineer resolves merge in PR review

---

## §7 — Sprint 0.6 execution checklist (CTO Office)

- [ ] Author `scripts/cowork-to-stream-b-bridge.sh` (next autonomous run)
- [ ] Author `scripts/README-bridge-protocol.md` (CEO-readable instructions)
- [ ] Test the script in dry-run mode (no actual changes, just log what would happen)
- [ ] Surface the result to CEO via Mission Control: "Bridge ready; one command at `path/to/script` will sync 23 files. Run when convenient."
- [ ] After CEO runs: monitor Stream B's PR + post-merge state
- [ ] Update `_QORIUM_BUILD_LOG.md` (in Stream B) noting the bridge happened
- [ ] Refresh Mission Control + Sprint Plan

---

## §8 — Long-term sustainability

After Sprint 0.6 + initial bridge:

- Stream A (Cowork) remains the master spec source
- Whenever Cowork updates a spec, the next bridge run propagates
- This protocol is stable; the script is checked into Cowork at `scripts/`
- Future Cowork-to-Stream-B file additions: just append to the §2 mapping table; script picks them up on next run

---

## §9 — When Stream B becomes self-sufficient

Once Stream B has the full diligence pack of specs + the QA pipeline + the operational runbooks, it becomes self-sufficient. Stream A (Cowork) remains the decision/strategic layer; Stream B becomes the engineering execution layer. The bridge runs less frequently — typically only at major version updates (Constitution amendments, new SKU spec, major QA pipeline changes).

In Phase 2 (M3-M6), Stream A authors a Cowork-to-Stream-B Sync Protocol v2 that automates the bridge as a CI cron job (Stream A pushes to Cowork → cron pulls into Stream B's repo → opens PR for review). At that point, even the ≤60-sec CEO action goes away.

---

## §10 — References

- Stream B's `_QORIUM_BUILD_LOG.md` (Bhaskar shared this; lives at `/home/user/QOrium/`)
- Stream B's 7-PR stack on `sales799/qorium` GitHub repo
- Constitution v2.0 §1.0.1 LEGAL FORM (entity attribution; Stream B references)
- 4 CTO-DELTAs (CI pnpm adoption, gitleaks v8 syntax, migration runner, API key HMAC vs Argon2) — all to be reconciled with Cowork canonical specs once bridged

---

*End of Cowork-to-Stream-B Bridge Protocol v1. Sprint 0.6 will execute it.*
