# CTO-DELTA: auto-bootstrap state-backend + dns-zone modules

**Date:** 2026-05-09
**Author:** Claude Code (parallel build session, branch `claude/click-next-permissions-qhd1W`)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/auto-bootstrap/README.md`, `governance/Auto-Mode-Remote-Plan-v1.md`

## Background

The CEO created an IAM bootstrap user (`qorium-bootstrap-tf`, account `049666818793`) with an access key, configured the local `~/.aws/credentials` profile, and validated with `aws sts get-caller-identity`. Goal: maximize automation of `infra/auto-bootstrap/` so that one CEO cred-drop + one `apply.sh` invocation is sufficient to bootstrap a fresh AWS account end-to-end.

Two prerequisites were missing from the existing modules:

1. **Remote Terraform state.** Every existing module wrote `*.tfstate` to a local per-module workdir (`.terraform-<module>/`). This works for one operator but blocks any future move to multi-operator or CI-driven plans. There was no S3 bucket + DynamoDB lock table to point future modules' `terraform { backend "s3" {} }` blocks at.

2. **Route 53 hosted zone.** `email-auth.tf` requires `route53_zone_id` as a non-default input but assumes the zone already exists. On a fresh AWS account, no zone exists for `qorium.online`, so `email-auth.tf` cannot run until a zone is created out-of-band.

Both gaps had to be closed before the email-auth module (Sprint 1.7d critical-path dependency) could apply autonomously.

## Adaptation

Three new files plus one wrapper rewrite plus one CI workflow:

| File                                          | Purpose                                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `infra/auto-bootstrap/state-backend.tf`       | S3 bucket (versioned, encrypted, private) + DynamoDB lock table (PAY_PER_REQUEST) for remote state  |
| `infra/auto-bootstrap/dns-zone.tf`            | Route 53 public hosted zone for the apex domain; emits `zone_id` + `name_servers` outputs           |
| `infra/auto-bootstrap/apply.sh` (rewritten)   | Variables now exported as `TF_VAR_*` so one wrapper drives heterogeneous modules without dispatch   |
| `infra/auto-bootstrap/.env.bootstrap.example` | Documents new modules + introduces `AWS_PROFILE` as a credential source (alongside raw access keys) |
| `infra/auto-bootstrap/README.md`              | Updated module table + recommended apply order + zone-delegation step                               |
| `.github/workflows/terraform-plan.yml`        | Plan-only CI: matrix runs `fmt -check` + `init -backend=false` + `validate` per module on PR        |

### Why `TF_VAR_*` env exports instead of `-var foo=bar`

The previous `apply.sh` hard-coded six `-var` flags tuned to `email-auth.tf`. Running `multi-region.tf` or `pitr.tf` through it would have errored with _"Value for undeclared variable: domain"_ because those modules don't declare `domain`. Per Terraform docs, `TF_VAR_*` env vars are silently ignored when the module doesn't declare the corresponding variable, which is exactly the "one wrapper, many modules" semantic we want. The new `apply.sh` exports the union of variables across all current modules; each module reads only the ones it declares.

### Why state-backend uses local state itself

A backend can't store its own state in itself before it exists (chicken-and-egg). `state-backend.tf` deliberately omits the `backend "s3" {}` block; its state lives in the per-module workdir. This is fine because the bucket + lock table are themselves cheap to recreate from code if state is lost. Future modules will use:

```hcl
terraform {
  backend "s3" {
    bucket         = "qorium-terraform-state-049666818793"
    key            = "<module>/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "qorium-terraform-state-lock"
    encrypt        = true
  }
}
```

The exact bucket name is emitted as a `state-backend` output for paste-in.

### Why the CI workflow does `validate` not `plan`

`terraform plan` requires real AWS credentials to refresh state and compute the diff. Per the Auto-Mode Charter §3, the only legitimate path to running `plan` against AWS is via the cred-drop file `.env.bootstrap`, which is gitignored and never reaches CI. CI therefore validates structure (syntax, references, fmt drift, provider constraints); the CEO runs `./apply.sh <module>` (plan-only by default) locally to see the real plan before authorizing apply.

## Why this is safe

1. **No backwards-incompatible changes.** Existing `email-auth.tf` still applies via `./apply.sh email-auth` exactly as before. Variables it declared are unchanged. The wrapper still defaults to plan-only and still requires `BOOTSTRAP_AUTHORIZED=true` literal to apply.

2. **No production state created at PR-merge time.** CI runs `validate` only — no AWS API calls, no credentials in CI, no state files committed. Apply remains a CEO-only manual action.

3. **Charter halt conditions preserved.**

   - Monetary commitment: still gated by `BOOTSTRAP_AUTHORIZED=true`.
   - Production-credential operation: cred-drop file still gitignored; agent never reads it.
   - DNS / live-service mutation: same gate. `dns-zone.tf` cannot run unless the CEO has flipped the gate.

4. **Resource costs are bounded.** State bucket: pennies/month at QOrium scale. DynamoDB on-demand: ~$0 at our query rate. Route 53 zone: $0.50/month per zone. Total marginal cost of this delta when applied: under $1/month.

5. **`prevent_destroy` on the state bucket.** Once created, `terraform destroy` cannot remove it without removing the lifecycle block first. This is intentional protection against accidental state-loss.

## Required reconciliation

- The canonical Auto-Mode Charter document (`governance/Auto-Mode-Remote-Plan-v1.md`) should reference these two new modules in its module inventory.
- The Sprint Tracker (Phase 1) should mark `state-backend` and `dns-zone` as engineering-complete-cred-bound (same posture as `email-auth.tf`).
- Once the CEO runs the first `./apply.sh dns-zone` against `qorium.online` and updates the registrar's NS records, the resulting `zone_id` should be archived in the QORIUM Mission Control dashboard.

## Apply order on a fresh AWS account (CEO action)

```bash
# 1. Drop creds (one-time)
cp infra/auto-bootstrap/.env.bootstrap.example infra/auto-bootstrap/.env.bootstrap
# Edit .env.bootstrap:
#   BOOTSTRAP_AUTHORIZED=true
#   AWS_PROFILE=qorium-bootstrap-tf
#   QORIUM_DOMAIN=qorium.online
#   (leave QORIUM_ROUTE53_ZONE_ID blank)

# 2. Bootstrap state backend
cd infra/auto-bootstrap
./apply.sh state-backend

# 3. Bootstrap DNS zone
./apply.sh dns-zone
# Output: zone_id + four name_servers

# 4. (Manual) Update registrar NS records to the four name_servers
#    (5–60 min propagation)

# 5. Paste zone_id into .env.bootstrap as QORIUM_ROUTE53_ZONE_ID

# 6. Apply email-auth (Sprint 1.7d unblocks)
./apply.sh email-auth
```

After step 6, the recruiter-invitation flow can use `MAILER_DRIVER=ses` for real email delivery — closing the Phase 1 / Sprint 1.0 PUBLIC DoD 7th gate ("first REAL Talpro candidate").

## Incidental fixes shipped alongside

Local `terraform validate` revealed three pre-existing issues that were holding back the CI gate:

1. **`email-auth.tf` — `aws_route53_record.records` is a set, not a list.** `r.records[0]` and `aws_route53_record.dmarc.records[0]` were both invalid in the AWS provider 5.x family. Fixed with `tolist(...)[0]`. The original code would have errored at `terraform plan` time even before CI; it had never been validated against the pinned provider version.

2. **`multi-region.tf` and `pitr.tf` — fmt drift.** Pure whitespace alignment differences. Auto-fixed with `terraform fmt -write` so the new CI matrix passes `fmt -check`.

3. **`observability.tf` — pre-existing validation errors deferred.** Two errors:

   - `sentry_project.<name>.dsn_public` — attribute does not exist in the current sentry provider (it's surfaced as a `sentry_key` resource attribute now).
   - `data.sentry_organization.qorium.id` deprecated in favour of `.slug`.

   Neither was introduced by this delta. The module is excluded from the CI matrix (with a comment in `terraform-plan.yml`) until a separate CTO-DELTA reconciles the sentry provider version. Until then, `./apply.sh observability` would fail at plan-time anyway, so excluding it from CI is a no-op for production capability.
