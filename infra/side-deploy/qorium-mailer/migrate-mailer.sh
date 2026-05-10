#!/usr/bin/env bash
# migrate-mailer.sh
# ---------------------------------------------------------------------------
# Stand-alone postgres provisioning + migration runner for the qorium-mailer
# side-deploy database. Idempotent — safe to re-run.
#
# Usage:
#   sudo bash infra/side-deploy/qorium-mailer/migrate-mailer.sh
#
# Assumes:
#   - Postgres is running locally
#   - The 'qorium' role already exists (used by /opt/qorium)
#   - sudo postgres access works
# ---------------------------------------------------------------------------

set -euo pipefail

DB_NAME="${DB_NAME:-qorium_mailer}"
DB_USER="${DB_USER:-qorium}"
INSTALL_DIR="${INSTALL_DIR:-/opt/qorium-mailer}"

echo "→ migrate-mailer.sh starting"
echo "  DB_NAME      = $DB_NAME"
echo "  DB_USER      = $DB_USER"
echo "  INSTALL_DIR  = $INSTALL_DIR"

# ----- 1. Verify the install dir exists --------------------------------------
if [[ ! -d "$INSTALL_DIR" ]]; then
  echo "✗ $INSTALL_DIR does not exist. Run deploy.sh first." >&2
  exit 1
fi

# ----- 2. Ensure the database exists -----------------------------------------
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [[ "$DB_EXISTS" == "1" ]]; then
  echo "  ✓ Database '$DB_NAME' already exists"
else
  echo "  → Creating database '$DB_NAME' owned by '$DB_USER'"
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

# ----- 3. Pre-install required extensions as superuser -----------------------
# Migration 0005 needs pgcrypto (for gen_random_uuid()) and CITEXT (for case-
# insensitive email column). Install in the new DB before running migrations.
echo "  → Installing pgcrypto + citext extensions in '$DB_NAME'"
sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SQL

# ----- 4. Run migrations against the new DB ----------------------------------
# The runner uses DATABASE_URL from .env in the install dir. We do NOT modify
# /opt/qorium/.env — only /opt/qorium-mailer/.env.
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  echo "✗ $INSTALL_DIR/.env not found. Copy .env.example and fill in DATABASE_URL." >&2
  exit 1
fi

echo "  → Running migrations from $INSTALL_DIR"
cd "$INSTALL_DIR"
# Load .env into the runner process (qorium-db reads DATABASE_URL from env)
set -a
# shellcheck disable=SC1091
source .env
set +a

# Confirm DATABASE_URL points at our new DB, not the production one.
if [[ "$DATABASE_URL" != *"$DB_NAME"* ]]; then
  echo "✗ Refusing to migrate: DATABASE_URL does not contain '$DB_NAME'." >&2
  echo "  Got: $DATABASE_URL" >&2
  exit 1
fi

pnpm --filter @qorium/db build
pnpm --filter @qorium/db exec qorium-db status
pnpm --filter @qorium/db exec qorium-db up

echo "✓ migrate-mailer.sh completed"
