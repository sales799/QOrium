# Security Review Protocol

**Authority:** Constitution §2.6 (GATEKEEPER) + SO-15 (Zero Secrets in Git) + SO-3 (Quality Gate Discipline) + CTO Architecture v1 §8 (Security Posture)
**Owner:** GATEKEEPER (CTO Office Y1)
**Cadence:** Per security-sensitive PR + Quarterly comprehensive review

---

## When this protocol fires

A security review is REQUIRED on any PR that touches:

- ☑ `.github/workflows/` — CI/CD changes (potential to leak secrets, change deploy permissions)
- ☑ `infra/` — deploy scripts, nginx configs, PM2 launchers
- ☑ `apps/marketing/next.config.mjs` — security headers, CSP rules
- ☑ `apps/marketing/src/lib/mailer.ts` or `actions/contact.ts` / `actions/demo.ts` — input validation, rate limiting
- ☑ `packages/auth/` — API key validation, rate limit logic
- ☑ Any `.env.example` change — env var contract changes
- ☑ Any new dependency added (transitive deps included)
- ☑ `.gitleaks.toml` — secret-scan allowlist changes
- ☑ Any file that introduces new SSH / HTTP / DB connection logic

A security review is OPTIONAL but recommended on:

- ◯ Marketing copy that touches security claims (e.g., updates to `/security` page)
- ◯ Changes to `cto/sli-slo.md` security-related SLOs

---

## The security review checklist

Run top-to-bottom on the PR diff:

### Section 1 — Secrets

- [ ] No hardcoded API key, password, token, or secret in any file
- [ ] No secret in any log line / error message / debug output
- [ ] No secret in shell command line (per ADR 0005 — secrets stream over stdin)
- [ ] `gitleaks detect` clean against the full PR diff
- [ ] `.env.example` updated for any new env var (SO-15 + SO-16)
- [ ] Any new env var documented in `.env.example` AND `cto/runbooks/secret-rotation.md` (if rotatable)

### Section 2 — Input validation

- [ ] All user-input paths validated via Zod schema (or equivalent) at the server-action boundary
- [ ] No raw user input concatenated into SQL queries (parameterized only)
- [ ] No raw user input concatenated into shell commands (no `exec(` patterns with template strings)
- [ ] No raw user input rendered as HTML without sanitization (React's default JSX escaping is fine; `dangerouslySetInnerHTML` requires explicit review)
- [ ] Honeypot field present on public forms (anti-bot)
- [ ] Rate limiting applied to public endpoints (in-memory throttle minimum; Upstash Redis if available)

### Section 3 — Dependencies

- [ ] Any new direct dependency reviewed for: maintenance status (last commit ≤6 months), npm-audit clean (no high CVEs), license compatible (MIT / Apache 2.0 / ISC / BSD; flag GPL/AGPL/proprietary)
- [ ] `pnpm audit --prod --audit-level high` clean (CI enforces)
- [ ] No transitive dep with known CVE (audit tool catches; manual review on tool failure)

### Section 4 — Network surface

- [ ] CSP rules updated if new external domain reached (e.g., Calendly added in ADR 0005's CSP update)
- [ ] CORS rules tight (no wildcard origins on authenticated endpoints)
- [ ] Security headers all present per `apps/marketing/next.config.mjs` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP)
- [ ] No new outbound network call without explicit justification (privacy + cost + reliability concerns)

### Section 5 — Auth + authorization

- [ ] Any new authenticated endpoint has explicit auth check (no implicit "user must be logged in" assumption)
- [ ] API keys (when ReadyBank goes live) validated via `@qorium/auth` middleware before business logic
- [ ] Session tokens (when applicable) follow the `httpOnly: true; secure: true; sameSite: lax` pattern
- [ ] No new "admin"-style endpoint without role-based access control

### Section 6 — Threat model check (light-weight)

- [ ] What's the most plausible attack on this change? (One sentence answer)
- [ ] What's the blast radius if the attack succeeds? (PII exposure / financial loss / brand damage / etc.)
- [ ] What's the mitigation already in place? (existing controls)
- [ ] What's the residual risk? (acceptable / needs additional control)

### Section 7 — Constitutional security obligations

- [ ] SO-15: zero secrets in git (Section 1)
- [ ] SO-14: no Ollama on VPS (verify the change doesn't introduce a heavy local model)
- [ ] CTO Architecture §8: DPDPA-ready posture maintained (PII handling per the `qorium.online/security` data flow diagram)
- [ ] If change affects customer data path → review with CDO (`cdo/watermark-forensics.md` privacy section applies)

---

## Sign-off log

Every security review logs to `gatekeeper/security-reviews/YYYY-MM-DD-PR-NNN.md`:

```markdown
# Security Review — PR #NN: <title>

**Date:** YYYY-MM-DD
**Reviewer:** GATEKEEPER (CTO Office)
**Result:** PASS | FAIL | CONDITIONAL PASS
**Constitutional anchor:** SO-15 + (any others triggered by the change)

## Scope

<What did this PR change that triggered a security review?>

## Section results

- [ ] Section 1 — Secrets: PASS
- [ ] Section 2 — Input validation: PASS
- [ ] Section 3 — Dependencies: PASS
- [ ] Section 4 — Network surface: PASS
- [ ] Section 5 — Auth: PASS / N/A
- [ ] Section 6 — Threat model: <one-paragraph summary>
- [ ] Section 7 — Constitutional: PASS

## Conditions (if CONDITIONAL PASS)

<List specific conditions that must be met before merge>

## Identified residual risks (Section 6)

<Risks accepted; document why; cross-reference cto/tech-debt.md if any>

## Follow-up actions

<Any actions added to cto/tech-debt.md or scheduled for next iteration>
```

---

## Quarterly comprehensive security review

Once per quarter (target alongside Bali competitive scan + secret rotation), GATEKEEPER runs a comprehensive review NOT tied to a specific PR:

### Step 1 — CSP audit

Review `apps/marketing/next.config.mjs` security headers. Compare against current best practices. Tighten where possible. Document any retained looseness with justification.

### Step 2 — Dependency audit

Run `pnpm audit --prod --audit-level low` (note: lower threshold than CI's `high`). Triage every finding: ignore (with reason), upgrade, or replace.

### Step 3 — Secret-rotation audit

Verify `cto/runbooks/secret-rotation.md` quarterly cadence ran; check `cto/secret-rotation-log.md` (when it exists) for completeness.

### Step 4 — Access audit

- VPS `~/.ssh/authorized_keys` — list of authorized keys; remove any from departed contributors
- GitHub repo collaborator list — same
- Hostinger panel access list — same
- Any third-party admin panel (Resend, Calendly, Plausible) — same

### Step 5 — Threat model refresh

Review `qorium.online/security` claims; verify they're still accurate. Update `cto/sli-slo.md` security SLOs if posture has improved (or honestly documented if regressed).

### Step 6 — Findings report

Save to `gatekeeper/security-reviews/YYYY-Qn-comprehensive.md`. Findings either: closed in same quarter, or added to `cto/tech-debt.md` with severity + owner + ETA.

---

## Anti-patterns (don't do these)

- ❌ **Reviewing your own security-sensitive PR.** GATEKEEPER + contributing Office must differ. Y1 exception: when CTO is the only contributor, CEO co-signs Section 5 (auth) + Section 7 (constitutional) for material changes.
- ❌ **"It's just a small CI tweak."** CI workflows have admin scope; small changes there can leak secrets at scale. Always run security review on workflow changes.
- ❌ **Marking Section 6 "no plausible attack."** Adversarial thinking is the point. If you can't think of an attack, ask AI or a colleague — there's always at least one realistic one to acknowledge.
- ❌ **Deferring CONDITIONAL PASS conditions to "the next sprint."** Conditions are blocking. Either meet them or fail the gate.

---

## Companion: incident response on security findings

A security finding can be:

- **Detected during review** — captured in this protocol's sign-off log; addressed before merge
- **Detected post-merge** — escalates to `cto/runbooks/incident-response.md` (P0 if customer data exposure or active exploit; P1 if vulnerability discovered without exploit)
- **Detected by external party** — same incident-response track, plus `security@qorium.online` triage process (TBD: set up that mailbox before launch announce)

---

## Y1 reality

Y1 has not yet had a security-sensitive PR that triggered formal review (the build sprints have all been CTO-solo work; CI has caught the would-be issues). This protocol pre-shipped so when the first such PR lands (likely C2 secrets provisioning + first customer onboarding work), the review process is documented.

By Y2+, with a dedicated GATEKEEPER operator, this protocol becomes the day-job of someone other than CTO.

---

_Cross-references: Constitution §2.6 (GATEKEEPER), SO-3, SO-14, SO-15, CTO Architecture §8 (Security Posture). Companion: `cto/runbooks/secret-rotation.md` (parallel — rotation schedule), `cto/runbooks/incident-response.md` (parent for security incidents), `gatekeeper/release-gate-protocol.md` (Section 3 of release gate triggers this protocol when needed), `qorium.online/security` (customer-facing posture)._
