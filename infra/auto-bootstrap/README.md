# `infra/auto-bootstrap/`

Infrastructure-as-code modules the autonomous CTO agent can author **without
prior human approval**, but which **halt before applying** any change to
production. Per the Auto-Mode Charter (`governance/Auto-Mode-Remote-Plan-v1.md`
§3), the agent stops on:

- any monetary commitment,
- any production-credential operation,
- any DNS or live-service mutation without prior cred-drop.

Every module here ships with a `terraform plan` that runs green in CI
and a hard `terraform apply` gate that requires a CEO-set environment
flag before it executes.

## Modules

| File            | What it manages                                             | Halt condition                                                                  |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `email-auth.tf` | SES domain identity · DKIM CNAMEs · SPF + DMARC TXT records | `BOOTSTRAP_AUTHORIZED=true` env var must be set; the wrapper script enforces it |

## How to apply (CEO-only)

When you (the CEO) are ready to drop credentials and let the agent apply:

```bash
# 1. Drop creds into a non-versioned env file
cp infra/auto-bootstrap/.env.bootstrap.example infra/auto-bootstrap/.env.bootstrap
# Fill in AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, QORIUM_DOMAIN, QORIUM_AWS_REGION

# 2. Authorize and apply
cd infra/auto-bootstrap
BOOTSTRAP_AUTHORIZED=true ./apply.sh email-auth
```

Until you run that, every CI run on the email-auth module produces a
`terraform plan` only and posts the plan output as a PR comment.

## Variable reference

See `email-auth.tf` for required and optional variables. Defaults are
production-safe (no destructive operations, no public exposure).

## Why this module before others

Sprint 1.7 closes Phase 1 with SES-verified candidate emails (real
recruiter invitations land in real inboxes). The Cowork dashboard's
Sprint 1.0 PUBLIC DoD 7th gate ("first REAL Talpro candidate") is
human-bound to a recruiter login — but the recruiter cannot log in
without an invitation email. So SES verification is on the engineering
critical path even though the apply itself needs your hand.
