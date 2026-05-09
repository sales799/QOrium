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

| File                | What it manages                                                            | Halt condition                                              |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `state-backend.tf`  | S3 bucket + DynamoDB lock table for remote Terraform state                 | `BOOTSTRAP_AUTHORIZED=true` env var must be set             |
| `dns-zone.tf`       | Route 53 public hosted zone for the apex domain                            | `BOOTSTRAP_AUTHORIZED=true` env var must be set             |
| `email-auth.tf`     | SES domain identity · DKIM CNAMEs · SPF + DMARC TXT records · Mail-FROM    | `BOOTSTRAP_AUTHORIZED=true` env var must be set; needs zone |
| `multi-region.tf`   | DR pair (VPC peering, RDS replica, Route53 failover) — Sprint 5.0          | `BOOTSTRAP_AUTHORIZED=true` + audit-log bucket ARN          |
| `pitr.tf`           | RDS PITR + cross-region backup replication                                 | `BOOTSTRAP_AUTHORIZED=true` env var must be set             |
| `observability.tf`  | Grafana Cloud stack + Sentry projects                                      | Non-empty `QORIUM_GRAFANA_API_TOKEN` + `QORIUM_SENTRY_AUTH_TOKEN` |

The wrapper script `apply.sh` enforces every gate and is the only
sanctioned way to invoke `terraform apply` on these modules.

## How to apply (CEO-only)

When you (the CEO) are ready to drop credentials and let the agent apply:

```bash
# 1. Drop creds into a non-versioned env file
cp infra/auto-bootstrap/.env.bootstrap.example infra/auto-bootstrap/.env.bootstrap
# Fill in:
#   - BOOTSTRAP_AUTHORIZED=true
#   - either AWS_PROFILE=<configured profile> OR AWS_ACCESS_KEY_ID + SECRET
#   - QORIUM_DOMAIN (default: qorium.online)
#   - QORIUM_ROUTE53_ZONE_ID (leave blank on first run; dns-zone.tf will create)

# 2. Apply in order
cd infra/auto-bootstrap

# First-time bootstrap of an empty AWS account:
./apply.sh state-backend       # S3 + DynamoDB for remote state
./apply.sh dns-zone            # Route 53 hosted zone

# After dns-zone, copy the four output.name_servers values to your
# domain registrar's NS settings, wait 5-60 min for propagation, then
# paste the output zone_id into QORIUM_ROUTE53_ZONE_ID in .env.bootstrap.

./apply.sh email-auth          # SES + DKIM + SPF + DMARC
./apply.sh pitr                # RDS backups
./apply.sh multi-region        # DR pair
./apply.sh observability       # Grafana + Sentry
```

Until you set `BOOTSTRAP_AUTHORIZED=true`, every CI run on every module
produces a `terraform plan` only. The plan is posted as a PR comment by
the `terraform-plan` workflow.

## Variable reference

See `.env.bootstrap.example` for the full list of supported env vars.
Each module declares only the variables it needs; `apply.sh` exports
every var as `TF_VAR_*` and Terraform silently ignores undeclared ones,
which is what allows one wrapper to drive heterogeneous modules.

## Why these modules in this order

The dependency chain is tight:

1. **state-backend** — every other module's `terraform { backend "s3" {} }`
   block points here. Bootstrap with local state once, then migrate.
2. **dns-zone** — Route 53 must hold the apex zone before any DNS-publishing
   module (email-auth, observability webhooks, multi-region failover) can run.
3. **email-auth** — Sprint 1.7 closes Phase 1 with SES-verified candidate
   emails (real recruiter invitations land in real inboxes). The Cowork
   dashboard's Sprint 1.0 PUBLIC DoD 7th gate ("first REAL Talpro candidate")
   is human-bound to a recruiter login — but the recruiter cannot log in
   without an invitation email. So SES verification is on the engineering
   critical path even though the apply itself needs your hand.
4. **pitr / multi-region / observability** — production-readiness gates
   that follow once the foundation is in place.
