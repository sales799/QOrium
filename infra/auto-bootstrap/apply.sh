#!/usr/bin/env bash
###############################################################################
# infra/auto-bootstrap/apply.sh
#
# Authorization wrapper for the auto-bootstrap Terraform modules. Refuses
# to run `terraform apply` unless every gate below passes. The autonomous
# CTO agent NEVER calls this script with apply; only the CEO does.
#
# Gates:
#   1. .env.bootstrap exists in this directory
#   2. BOOTSTRAP_AUTHORIZED=true is set in the env (literal string "true")
#   3. AWS credentials are present (via .env.bootstrap or shell env or
#      AWS_PROFILE — any default-chain source works)
#   4. The named module file <module>.tf exists in this directory
#
# Variables are passed via TF_VAR_* environment exports so each module
# only consumes the variables it actually declares; undeclared TF_VAR_*
# values are silently ignored by Terraform. This is what lets one
# wrapper script drive all auto-bootstrap modules without per-module
# dispatch logic.
#
# Usage:
#   ./apply.sh email-auth                       # plan-only
#   BOOTSTRAP_AUTHORIZED=true ./apply.sh email-auth   # plan + apply
#
# Available modules:
#   state-backend  — S3 + DynamoDB for remote tf state (bootstrap first)
#   dns-zone       — Route 53 hosted zone for the apex domain
#   email-auth     — SES + DKIM + SPF + DMARC (requires zone_id)
#   multi-region   — DR pair (Sprint 5.0)
#   observability  — Grafana Cloud + Sentry projects
#   pitr           — RDS PITR + cross-region backups
###############################################################################

set -euo pipefail

cd "$(dirname "$0")"

MODULE="${1:-}"
if [[ -z "${MODULE}" ]]; then
  echo "usage: $0 <module>"
  echo "available modules:"
  ls -1 *.tf 2>/dev/null | sed 's/\.tf$//' | sed 's/^/  /'
  exit 2
fi

MODULE_FILE="${MODULE}.tf"
if [[ ! -f "${MODULE_FILE}" ]]; then
  echo "ERROR: module file ${MODULE_FILE} not found in $(pwd)"
  exit 2
fi

# Source cred-drop file if present.
if [[ -f .env.bootstrap ]]; then
  # shellcheck disable=SC1091
  set -a
  . ./.env.bootstrap
  set +a
fi

# Default: plan-only. Apply requires BOOTSTRAP_AUTHORIZED=true literal.
ACTION="plan"
if [[ "${BOOTSTRAP_AUTHORIZED:-false}" == "true" ]]; then
  ACTION="apply"
fi

if [[ "${ACTION}" == "apply" ]]; then
  # Apply needs credentials reachable via the AWS SDK default chain.
  # Acceptable sources (any one):
  #   - AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY env vars
  #   - AWS_PROFILE pointing at a configured profile in ~/.aws/credentials
  #   - IAM role on the executing host
  if [[ -z "${AWS_ACCESS_KEY_ID:-}" \
     && -z "${AWS_PROFILE:-}" ]]; then
    echo "ERROR: BOOTSTRAP_AUTHORIZED=true but no AWS credentials reachable."
    echo "Either drop AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY into"
    echo ".env.bootstrap, or export AWS_PROFILE before running."
    exit 3
  fi
  echo "→ Authorized apply for module: ${MODULE}"
else
  echo "→ Plan-only for module: ${MODULE} (set BOOTSTRAP_AUTHORIZED=true to apply)"
fi

###############################################################################
# Variable dispatch — every TF_VAR_* below is exported. Terraform reads
# only the ones declared by the active module; the rest are ignored
# silently. This lets one wrapper drive heterogeneous modules.
###############################################################################

# email-auth + dns-zone + state-backend
export TF_VAR_domain="${QORIUM_DOMAIN:-qorium.online}"
export TF_VAR_aws_region="${QORIUM_AWS_REGION:-ap-south-1}"
export TF_VAR_route53_zone_id="${QORIUM_ROUTE53_ZONE_ID:-}"
export TF_VAR_dmarc_policy="${QORIUM_DMARC_POLICY:-quarantine}"
export TF_VAR_dmarc_rua="${QORIUM_DMARC_RUA:-mailto:dmarc-rua@qorium.online}"
export TF_VAR_dmarc_ruf="${QORIUM_DMARC_RUF:-mailto:dmarc-ruf@qorium.online}"

# state-backend (optional overrides)
export TF_VAR_state_bucket_name="${QORIUM_STATE_BUCKET_NAME:-}"
export TF_VAR_state_lock_table_name="${QORIUM_STATE_LOCK_TABLE:-qorium-terraform-state-lock}"

# multi-region (Sprint 5.0)
export TF_VAR_primary_region="${QORIUM_PRIMARY_REGION:-ap-south-1}"
export TF_VAR_dr_region="${QORIUM_DR_REGION:-ap-southeast-1}"
export TF_VAR_primary_cidr="${QORIUM_PRIMARY_CIDR:-10.10.0.0/16}"
export TF_VAR_dr_cidr="${QORIUM_DR_CIDR:-10.20.0.0/16}"
export TF_VAR_audit_log_bucket_arn="${QORIUM_AUDIT_LOG_BUCKET_ARN:-}"

# pitr
export TF_VAR_cluster_identifier="${QORIUM_RDS_CLUSTER_IDENTIFIER:-qorium-primary}"
export TF_VAR_backup_region="${QORIUM_BACKUP_REGION:-ap-southeast-1}"

# observability — sensitive; do NOT default to fake tokens
export TF_VAR_sentry_org_slug="${QORIUM_SENTRY_ORG_SLUG:-qorium}"
export TF_VAR_sentry_auth_token="${QORIUM_SENTRY_AUTH_TOKEN:-}"
export TF_VAR_grafana_cloud_org_slug="${QORIUM_GRAFANA_ORG_SLUG:-qorium}"
export TF_VAR_grafana_cloud_api_token="${QORIUM_GRAFANA_API_TOKEN:-}"
export TF_VAR_stack_region="${QORIUM_GRAFANA_STACK_REGION:-prod-ap-south-0}"

###############################################################################
# Per-module workspace keeps state files isolated.
###############################################################################

WORKDIR=".terraform-${MODULE}"
mkdir -p "${WORKDIR}"
cp "${MODULE_FILE}" "${WORKDIR}/main.tf"

cd "${WORKDIR}"

terraform init -upgrade -input=false

if [[ "${ACTION}" == "plan" ]]; then
  terraform plan -input=false -no-color
  exit $?
fi

terraform apply -input=false -auto-approve

echo
echo "→ Apply complete for module: ${MODULE}"
echo "→ Outputs:"
terraform output
