# ADR 0005 — Env-var injection via stdin in deploy workflow (secrets never in process listings)

**Status:** Accepted
**Date:** 2026-05-06
**Authors:** CTO Office
**Constitutional anchor:** SO-15 (Zero Secrets in Git — extended interpretation: zero secrets in process listings either)
**Reviewers:** CTO (sole, Y1)

---

## Context

The Completion Sprint v1 (PRE-LAUNCH-CHECKLIST §C2) needed a path for runtime secrets — `RESEND_API_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` — to land on the production VPS without:

1. Committing them to the repo (SO-15 hard rule, gitleaks blocks).
2. Requiring CTO/CEO to SSH manually for every key change (slow, error-prone, doesn't scale).
3. Appearing in process listings (`ps`, `history`, journalctl) on the VPS — a common security anti-pattern when shell expansion is used inline.

The standard naive pattern would be:

```bash
ssh user@host "echo RESEND_API_KEY=$KEY > .env.local"
```

This puts the secret in the SSH command line. `ps auxw | grep ssh` on the GitHub runner would briefly show it. Worse: if the command is in shell history (or a workflow log), it's persistent.

## Decision

**The `deploy-marketing.yml` workflow streams secrets to the VPS via stdin (heredoc-fed), never as command-line arguments.**

The pattern:

```yaml
- name: Inject env vars into VPS .env.local
  env:
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
    GMAIL_USER: ${{ secrets.GMAIL_USER }}
    # ... other secrets
  run: |
    ssh -p ${{ secrets.VPS_PORT }} \
        -o StrictHostKeyChecking=accept-new \
        -i ~/.ssh/id_ed25519 \
        ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} \
        "cat > /opt/apps/qorium-marketing/apps/marketing/.env.local && chmod 600 /opt/apps/qorium-marketing/apps/marketing/.env.local" <<EOF
    NEXT_PUBLIC_SITE_URL=https://qorium.online
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
    NEXT_PUBLIC_CALENDLY_URL=${NEXT_PUBLIC_CALENDLY_URL}
    RESEND_API_KEY=${RESEND_API_KEY}
    CONTACT_TO_EMAIL=hello@qorium.online
    CONTACT_FROM_EMAIL=noreply@qorium.online
    GMAIL_USER=${GMAIL_USER}
    GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD}
    EOF
```

The secrets land in the runner's process environment (where they belong) and stream to the remote shell via heredoc-on-stdin. The remote `cat > .env.local` writes the file with `chmod 600` (owner-readable only).

## Consequences

### Positive

- **Secrets never appear in process listings** on either the GitHub runner OR the VPS. They're stdin → file content, never command args.
- **Secrets never appear in `~/.bash_history`** on the VPS (heredoc bypasses history).
- **Secrets never appear in workflow logs** (GH Actions auto-redacts secret-typed values; stdin doesn't get logged anyway).
- **File permission `600`** ensures only the deploy user (root or the deploy account) can read after write.
- **Idempotent:** every deploy rewrites the file with the latest secret values; rotation is a one-line workflow re-run.

### Negative

- The heredoc format is sensitive to YAML indentation — if the workflow file is reformatted by a tool that re-indents YAML, the heredoc may break. Mitigated by Prettier ignoring workflow YAML (root `.prettierignore` would handle this if needed; current setup hasn't tripped it).
- Empty optional secrets (e.g., user hasn't set `RESEND_API_KEY` yet) write `RESEND_API_KEY=` — empty value, still parseable by Next.js as undefined, falls back to console-log (per ADR 0003). Acceptable.
- Requires the runner to have SSH access, so `VPS_HOST` / `VPS_USER` / `VPS_PORT` / `VPS_SSH_KEY` are still secrets that must be configured.

### Neutral / observations

- This pattern can be extended to other workspaces (e.g., a future `qorium-admin` app) without changes — copy the workflow step.
- If the secret rotation cadence becomes painful (more than ~5 secrets total), consider a secret manager (Hashicorp Vault, AWS Secrets Manager, Doppler). For Y1, GitHub Actions secrets are fine.

## Alternatives considered

### Alternative 1: Inline shell expansion

```bash
ssh user@host "echo RESEND_API_KEY=$KEY > .env.local"
```

Rejected (motivating example). Secret lands in the SSH command line → visible in `ps` briefly + leaks into shell history.

### Alternative 2: `scp` a pre-written `.env.local`

```bash
echo "RESEND_API_KEY=$KEY" > /tmp/env.local
scp /tmp/env.local user@host:/opt/apps/.../env.local
rm /tmp/env.local
```

Rejected. Adds intermediate file on the runner (cleanup risk if the workflow fails between `scp` and `rm`). Not materially safer than stdin.

### Alternative 3: Vault / Doppler / AWS Secrets Manager pull on the VPS

Considered. Defers responsibility to a managed service which is the right pattern at scale. Y1 has 5 secrets; not worth a $20/month vendor commitment + integration work yet. Re-evaluate when secret count >15 or rotation cadence >quarterly.

### Alternative 4: SystemD environment file owned by the PM2 service

Considered. Solid pattern but doesn't change the question of how secrets get TO the file in the first place. The stdin pattern in this ADR feeds whatever target file the workflow points at — could be the SystemD env file in a future iteration.

## Implementation notes

- **File:** `.github/workflows/deploy-marketing.yml` — see "Inject env vars into VPS .env.local" step
- **Deploy script:** `infra/marketing-deploy.sh` runs AFTER this step; the deploy script reads from `.env.local` via the standard Next.js mechanism
- **Permissions:** `chmod 600` enforced at write time; verified by post-deploy smoke
- **Commit:** `2cae92b` (Completion Sprint v1 Phase 2.1)

## Verification

- **CI workflow log inspection:** confirm secrets are auto-redacted by GH Actions; the workflow log shows `***` instead of values.
- **VPS file inspection:** post-deploy, `ls -la /opt/apps/qorium-marketing/apps/marketing/.env.local` should show `-rw-------` (600) and owner = deploy user.
- **Process listing audit:** `ps auxw` on the VPS during deploy should NOT show secrets.
- **History audit:** `~/.bash_history` on the VPS should NOT contain secrets (heredoc bypasses).
- **Quarterly secret rotation:** runbook `cto/runbooks/secret-rotation.md` walks through rotating each key; this ADR is the technical foundation.

## References

- Constitution SO-15 (Zero Secrets in Git — extended)
- ADR 0003 (mailer fallback chain — uses these env vars)
- ADR 0004 (VPS deploy stack — provides the SSH target)
- `.github/workflows/deploy-marketing.yml` — the workflow
- `cto/runbooks/secret-rotation.md` — operationalization
