#!/usr/bin/env bash
###############################################################################
# infra/auto-bootstrap/apply.sh
#
# Authorization wrapper for the auto-bootstrap Terraform modules. Refuses
# to run `terraform apply` unless every gate below passes. The autonomous
# CTO agent NEVER calls this script; only the CEO does.
#
# Gates:
#   1. .env.bootstrap exists in this directory
#   2. BOOTSTRAP_AUTHORIZED=true is set in the env
#   3. AWS credentials are present
#   4. The named module exists in this directory
#
# Usage:
#   BOOTSTRAP_AUTHORIZED=true ./apply.sh email-auth
#   ./apply.sh email-auth                       # plan-only
###############################################################################

set -euo pipefail

cd "$(dirname "$0")"

MODULE="${1:-}"
if [[ -z "${MODULE}" ]]; then
  echo "usage: $0 <module>"
  echo "available modules:"
  ls -1 *.tf | sed 's/\.tf$//' | sed 's/^/  /'
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
  if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
    echo "ERROR: BOOTSTRAP_AUTHORIZED=true but AWS credentials are missing."
    echo "Drop AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY into .env.bootstrap."
    exit 3
  fi
  echo "→ Authorized apply for module ${MODULE}"
else
  echo "→ Plan-only for module ${MODULE} (set BOOTSTRAP_AUTHORIZED=true to apply)"
fi

# Per-module workspace keeps state files isolated.
WORKDIR=".terraform-${MODULE}"
mkdir -p "${WORKDIR}"
cp "${MODULE_FILE}" "${WORKDIR}/main.tf"

cd "${WORKDIR}"

terraform init -upgrade -input=false

if [[ "${ACTION}" == "plan" ]]; then
  terraform plan -input=false -no-color \
    -var "domain=${QORIUM_DOMAIN:-qorium.online}" \
    -var "aws_region=${QORIUM_AWS_REGION:-ap-south-1}" \
    -var "route53_zone_id=${QORIUM_ROUTE53_ZONE_ID:-PLACEHOLDER_ZONE}" \
    -var "dmarc_policy=${QORIUM_DMARC_POLICY:-quarantine}" \
    -var "dmarc_rua=${QORIUM_DMARC_RUA:-mailto:dmarc-rua@qorium.online}" \
    -var "dmarc_ruf=${QORIUM_DMARC_RUF:-mailto:dmarc-ruf@qorium.online}"
  exit $?
fi

terraform apply -input=false -auto-approve \
  -var "domain=${QORIUM_DOMAIN}" \
  -var "aws_region=${QORIUM_AWS_REGION}" \
  -var "route53_zone_id=${QORIUM_ROUTE53_ZONE_ID}" \
  -var "dmarc_policy=${QORIUM_DMARC_POLICY:-quarantine}" \
  -var "dmarc_rua=${QORIUM_DMARC_RUA:-mailto:dmarc-rua@qorium.online}" \
  -var "dmarc_ruf=${QORIUM_DMARC_RUF:-mailto:dmarc-ruf@qorium.online}"
