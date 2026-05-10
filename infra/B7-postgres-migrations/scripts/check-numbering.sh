#!/usr/bin/env bash
# check-numbering.sh
# ---------------------------------------------------------------------------
# Validates the migration directory against RESERVED.md.
#
# Fails (exit 1) if:
#   - Any two .sql files share the same NNNN prefix
#   - A file's NNNN is missing from the RESERVED.md table OR uses an undocumented gap
#   - File naming doesn't match ^NNNN_[a-z0-9_]+\.sql$
#
# Documented gaps in RESERVED.md (sections starting with "### GAP NNNN") are
# tolerated — the script does NOT require contiguous numbering, only that
# every present file is registered and no duplicates exist.
#
# Usage:
#   bash infra/B7-postgres-migrations/scripts/check-numbering.sh
#   (run from repo root or from the migrations directory)
# ---------------------------------------------------------------------------

set -euo pipefail

# ----- Locate migrations dir -------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$(dirname "$SCRIPT_DIR")"
RESERVED_MD="$MIGRATIONS_DIR/RESERVED.md"

if [[ ! -f "$RESERVED_MD" ]]; then
  echo "✗ RESERVED.md not found at $RESERVED_MD" >&2
  exit 1
fi

ERRORS=0
err() { echo "✗ $*" >&2; ERRORS=$((ERRORS + 1)); }
ok()  { echo "  ✓ $*"; }

# ----- 1. Find all migration files -------------------------------------------
mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '[0-9]*.sql' | sort)
if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  echo "  (no migration files found — nothing to check)"
  exit 0
fi

# ----- 2. Validate naming format ---------------------------------------------
for file in "${MIGRATION_FILES[@]}"; do
  base="$(basename "$file")"
  if ! [[ "$base" =~ ^[0-9]{4}_[a-z0-9_]+\.sql$ ]]; then
    err "Invalid filename: $base (must match ^NNNN_snake_case.sql$)"
  fi
done

# ----- 3. Check for duplicate numbers ----------------------------------------
declare -A SEEN_NUMBERS
for file in "${MIGRATION_FILES[@]}"; do
  base="$(basename "$file")"
  num="${base:0:4}"
  if [[ -n "${SEEN_NUMBERS[$num]:-}" ]]; then
    err "Duplicate migration number $num: ${SEEN_NUMBERS[$num]} AND $base"
  else
    SEEN_NUMBERS[$num]="$base"
  fi
done

# ----- 4. Extract the registered numbers from RESERVED.md --------------------
# Looks for table rows like: "| 0004 | `0004_recruiter_auth.sql` | applied | ..."
# Status "RESERVED" or "GAP" means the file is not required to exist.
# Section headers like "### GAP 0003" also mark documented gaps.
declare -A REGISTERED IS_GAP IS_RESERVED
while IFS= read -r line; do
  if [[ "$line" =~ ^\|[[:space:]]*([0-9]{4})[[:space:]]*\|(.*) ]]; then
    num="${BASH_REMATCH[1]}"
    rest="${BASH_REMATCH[2]}"
    REGISTERED[$num]=1
    if [[ "$rest" =~ \|[[:space:]]*(GAP|RESERVED|gap|reserved)[[:space:]]*\| ]]; then
      IS_RESERVED[$num]=1
    fi
  elif [[ "$line" =~ ^###[[:space:]]+GAP[[:space:]]+([0-9]{4}) ]]; then
    num="${BASH_REMATCH[1]}"
    IS_GAP[$num]=1
    IS_RESERVED[$num]=1   # gap sections also don't require a file
  fi
done < "$RESERVED_MD"

# ----- 5. Every present file must be registered ------------------------------
for num in "${!SEEN_NUMBERS[@]}"; do
  if [[ -z "${REGISTERED[$num]:-}" ]]; then
    err "Migration $num (${SEEN_NUMBERS[$num]}) is NOT listed in RESERVED.md — add a row to the table"
  fi
done

# ----- 6. Every registered number must have a file (or be a documented gap/reservation) -
for num in "${!REGISTERED[@]}"; do
  if [[ -z "${SEEN_NUMBERS[$num]:-}" ]] && [[ -z "${IS_RESERVED[$num]:-}" ]]; then
    err "RESERVED.md lists $num but no file exists — either commit the file, mark status as RESERVED, or move the row to a 'GAP' section"
  fi
done

# ----- Summary ---------------------------------------------------------------
echo ""
ok "Files checked:       ${#MIGRATION_FILES[@]}"
ok "Registered numbers:  ${#REGISTERED[@]}"
ok "Documented gaps:     ${#IS_GAP[@]}"
echo ""

if [[ $ERRORS -gt 0 ]]; then
  echo "✗ check-numbering FAILED with $ERRORS error(s)" >&2
  exit 1
fi

echo "✓ check-numbering passed"
