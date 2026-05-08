#!/usr/bin/env bash
###############################################################################
# infra/B7-postgres-migrations/scripts/restore-pitr.sh
#
# Sprint 4.2 — Disaster Recovery: restore the QOrium production database
# from PITR continuous backups (AWS Backup) to a target point-in-time.
#
# This script is the on-call team's runbook companion. It validates the
# inputs, builds the AWS CLI command, performs a DRY-RUN by default, and
# requires explicit --execute to actually perform the restore. The
# autonomous CTO agent NEVER calls this with --execute.
#
# Usage:
#   ./restore-pitr.sh \
#     --cluster qorium-prod \
#     --target-time "2026-05-08T14:32:00Z" \
#     --new-cluster qorium-restore-2026-05-08
#
# Add --execute once the on-call team is satisfied with the dry-run plan.
#
# RTO: ~30-60 min same-region; ~1-2h cross-region (depends on size).
# RPO: ~5 minutes (PITR continuous).
###############################################################################

set -euo pipefail

CLUSTER=""
TARGET_TIME=""
NEW_CLUSTER=""
EXECUTE=false

usage() {
  cat <<EOF
usage: $0 --cluster <id> --target-time <ISO8601> --new-cluster <id> [--execute]

  --cluster        source cluster identifier (e.g. qorium-prod)
  --target-time    UTC ISO8601 timestamp to restore to (e.g. 2026-05-08T14:32:00Z)
  --new-cluster    target cluster identifier for the restored DB (must be unused)
  --execute        actually run the restore (default: dry-run only)

DR runbook reference: governance/dr-runbook.md
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cluster) CLUSTER="$2"; shift 2;;
    --target-time) TARGET_TIME="$2"; shift 2;;
    --new-cluster) NEW_CLUSTER="$2"; shift 2;;
    --execute) EXECUTE=true; shift;;
    -h|--help) usage; exit 0;;
    *) echo "ERROR: unknown arg $1"; usage; exit 2;;
  esac
done

if [[ -z "$CLUSTER" || -z "$TARGET_TIME" || -z "$NEW_CLUSTER" ]]; then
  echo "ERROR: --cluster, --target-time, and --new-cluster are required"
  usage
  exit 2
fi

# Validate ISO8601 format (basic check; AWS will reject anything weird)
if ! [[ "$TARGET_TIME" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$ ]]; then
  echo "ERROR: target-time must be ISO8601 UTC (e.g. 2026-05-08T14:32:00Z); got: $TARGET_TIME"
  exit 2
fi

# Sanity: new cluster must not already exist
if aws rds describe-db-clusters --db-cluster-identifier "$NEW_CLUSTER" >/dev/null 2>&1; then
  echo "ERROR: target cluster $NEW_CLUSTER already exists; pick a different --new-cluster"
  exit 2
fi

# Build the command
read -r -d '' CMD <<EOF || true
aws rds restore-db-cluster-to-point-in-time \\
  --source-db-cluster-identifier $CLUSTER \\
  --db-cluster-identifier $NEW_CLUSTER \\
  --restore-to-time $TARGET_TIME \\
  --use-latest-restorable-time-disabled \\
  --tags Key=Project,Value=qorium Key=Component,Value=pitr-restore Key=RestoreFrom,Value=$CLUSTER Key=RestoreTime,Value=$TARGET_TIME
EOF

cat <<EOF
==============================================================================
QOrium PITR Restore — $(date -u '+%Y-%m-%d %H:%M:%S UTC')
==============================================================================
  Source cluster:   $CLUSTER
  Target cluster:   $NEW_CLUSTER
  Restore to:       $TARGET_TIME
  Mode:             $($EXECUTE && echo EXECUTE || echo DRY-RUN)

Command that would run:

$CMD

==============================================================================
EOF

if ! $EXECUTE; then
  echo "DRY-RUN complete. Re-run with --execute to perform the restore."
  echo "On-call: confirm target-time is correct, target cluster name is unused,"
  echo "and downstream services are prepared for cutover before --execute."
  exit 0
fi

echo "EXECUTING restore..."
eval "$CMD"

echo
echo "Restore initiated. Monitor with:"
echo "  aws rds describe-db-clusters --db-cluster-identifier $NEW_CLUSTER \\"
echo "    --query 'DBClusters[0].Status'"
echo
echo "Status will progress: creating → backing-up → available."
echo "Cutover steps after 'available':"
echo "  1. Update services to point at new cluster endpoint."
echo "  2. Verify with smoke tests."
echo "  3. Decommission old cluster ONLY after 24h without rollback."
echo
echo "DR runbook: governance/dr-runbook.md"
