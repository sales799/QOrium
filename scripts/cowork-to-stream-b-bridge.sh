#!/usr/bin/env bash
# QOrium — Cowork-to-Stream-B Bridge Protocol v1
# ================================================
# Author: CTO Office | First written: 2026-05-03 (Run #20 closeout — Sprint 0.6)
# Spec:   governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md
#
# Purpose:
#   Single command that copies 23 spec/governance/CI/migration files
#   from the Cowork QOrium folder → the Stream B (Claude Code) GitHub
#   repo `sales799/qorium`, on a fresh feature branch, ready for review.
#
# Usage:
#   Default (live):
#     bash scripts/cowork-to-stream-b-bridge.sh
#   Dry-run (prints actions without writing):
#     bash scripts/cowork-to-stream-b-bridge.sh --dry-run
#   Custom Stream B clone path:
#     QORIUM_STREAM_B_PATH=/path/to/clone bash scripts/cowork-to-stream-b-bridge.sh
#   Skip push (review locally first):
#     bash scripts/cowork-to-stream-b-bridge.sh --no-push
#   Verbose (every cp logged):
#     bash scripts/cowork-to-stream-b-bridge.sh --verbose
#
# Exit codes:
#   0  — success
#   1  — generic error
#   2  — missing source files
#   3  — Stream B repo not found / clone failed
#   4  — git working directory dirty
#   5  — git operation failed
#
# Idempotent: rerun safe. Existing branch is reused; missing files are skipped (warn).
# No CEO touch beyond `bash scripts/cowork-to-stream-b-bridge.sh` and clicking the printed PR URL.

set -euo pipefail

# ----------------------------------------------------------------------
# Configuration (override via env vars or CLI flags)
# ----------------------------------------------------------------------
COWORK_ROOT="${QORIUM_COWORK_PATH:-/Users/bhaskar_universe/Documents/Claude/Projects/QOrium}"
STREAM_B_PATH="${QORIUM_STREAM_B_PATH:-$HOME/QOrium}"
STREAM_B_REPO="${QORIUM_STREAM_B_REPO:-https://github.com/sales799/qorium.git}"
BRIDGE_BRANCH="${QORIUM_BRIDGE_BRANCH:-chore/cowork-spec-ingest-$(date -u +%Y%m%d)}"
COMMIT_AUTHOR_NAME="${QORIUM_COMMIT_AUTHOR:-CTO Office (Cowork Bridge)}"
COMMIT_AUTHOR_EMAIL="${QORIUM_COMMIT_EMAIL:-cto-office@qorium.online}"
DRY_RUN=0
NO_PUSH=0
VERBOSE=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=1 ;;
    --no-push)  NO_PUSH=1 ;;
    --verbose)  VERBOSE=1 ;;
    --help|-h)
      sed -n '1,30p' "$0" | grep -E '^#' | sed 's/^# \?//'
      exit 0
      ;;
    *) echo "[bridge] Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

# ----------------------------------------------------------------------
# Logging helpers
# ----------------------------------------------------------------------
ts()    { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log()   { echo "[bridge $(ts)] $*"; }
warn()  { echo "[bridge $(ts)] WARN  $*" >&2; }
fatal() { echo "[bridge $(ts)] FATAL $*" >&2; exit "${2:-1}"; }
vlog()  { [[ "$VERBOSE" -eq 1 ]] && log "  $*" || true; }
run()   { if [[ "$DRY_RUN" -eq 1 ]]; then echo "  [dry-run] $*"; else eval "$*"; fi; }

# ----------------------------------------------------------------------
# 23-file Cowork → Stream B mapping (relative paths within each root)
# Format: "<cowork-relative-path>::<stream-b-relative-path>"
# ----------------------------------------------------------------------
read -r -d '' BRIDGE_MAP <<'MAP' || true
09-QOrium-Constitution-v2.0.md::docs/CONSTITUTION-v2.0.md
09-QOrium-Constitution-v2.0.docx::docs/CONSTITUTION-v2.0.docx
07-CTO-Architecture-v1.md::docs/CTO-ARCHITECTURE-v1.md
infra/B5-CI-Pipeline.github-actions.yml::.github/workflows/ci.yml
infra/B6-gitleaks-config.yaml::.gitleaks.toml
infra/B7-postgres-migrations/0001_initial_schema.sql::infra/migrations/0001_initial_schema.sql
infra/B7-postgres-migrations/README.md::infra/migrations/README.md
infra/B10-ecosystem.config.js::infra/pm2/ecosystem.config.js
governance/Quality-Gate-92pt-Scorecard.md::docs/QUALITY-GATE-92pt-Scorecard.md
infra/Anti-Leak-Engine-v0-Design.md::docs/specs/Anti-Leak-Engine-v0-Design.md
infra/IRT-Calibration-Pipeline-v0-Spec.md::docs/specs/IRT-Calibration-Pipeline-v0-Spec.md
infra/Judge0-Sandbox-Integration-Spec-v0.md::docs/specs/Judge0-Sandbox-Integration-Spec-v0.md
infra/JD-Forge-v0-Design.md::docs/specs/JD-Forge-v0-Design.md
infra/ATS-Connector-Framework-v0.md::docs/specs/ATS-Connector-Framework-v0.md
infra/Webhooks-Service-v0-Spec.md::docs/specs/Webhooks-Service-v0-Spec.md
infra/SSO-SAML-Enterprise-Spec-v0.md::docs/specs/SSO-SAML-Enterprise-Spec-v0.md
infra/Audit-Log-API-Spec-v0.md::docs/specs/Audit-Log-API-Spec-v0.md
infra/Billing-Service-v0-Spec.md::docs/specs/Billing-Service-v0-Spec.md
infra/D3-Talpro-Internal-API-Key-Spec.md::docs/specs/D3-Talpro-Internal-API-Key-Spec.md
governance/TestForge-QA-Pipeline-v1.md::docs/QA/TestForge-QA-Pipeline-v1.md
governance/Bias-Detection-Methodology-v1.md::docs/QA/Bias-Detection-Methodology-v1.md
governance/AI-Plagiarism-Benchmark-Protocol-v1.md::docs/QA/AI-Plagiarism-Benchmark-Protocol-v1.md
MAP

# ----------------------------------------------------------------------
# Pre-flight checks
# ----------------------------------------------------------------------
log "QOrium Cowork → Stream B bridge starting (dry_run=$DRY_RUN, no_push=$NO_PUSH)"
log "Cowork root:   $COWORK_ROOT"
log "Stream B path: $STREAM_B_PATH"
log "Branch:        $BRIDGE_BRANCH"

[[ -d "$COWORK_ROOT" ]] || fatal "Cowork root not found: $COWORK_ROOT" 2

# Stream B clone — clone if missing (idempotent)
if [[ ! -d "$STREAM_B_PATH/.git" ]]; then
  log "Stream B repo not present at $STREAM_B_PATH — cloning $STREAM_B_REPO"
  run "git clone \"$STREAM_B_REPO\" \"$STREAM_B_PATH\""
fi

if [[ ! -d "$STREAM_B_PATH/.git" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    warn "[dry-run] Stream B clone target $STREAM_B_PATH does not exist; live run would clone here. Continuing dry-run."
  else
    fatal "Stream B clone failed: $STREAM_B_PATH" 3
  fi
fi

# Verify dependency files exist in Cowork; collect any missing
MISSING=()
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  src="${line%%::*}"
  [[ -f "$COWORK_ROOT/$src" ]] || MISSING+=("$src")
done <<< "$BRIDGE_MAP"

if [[ "${#MISSING[@]}" -gt 0 ]]; then
  warn "${#MISSING[@]} source file(s) missing in Cowork root — will be skipped:"
  for m in "${MISSING[@]}"; do warn "  - $m"; done
  warn "Continuing with present files; rerun the bridge after authoring the missing specs."
fi

# Working tree must be clean to avoid mixing changes
if [[ "$DRY_RUN" -eq 1 ]] && [[ ! -d "$STREAM_B_PATH/.git" ]]; then
  warn "[dry-run] Skipping git checks — Stream B clone would not exist yet."
  log "[dry-run] Would copy ${BRIDGE_MAP_LINES:-23} mapped files, commit + push to '$BRIDGE_BRANCH'."
  exit 0
fi
cd "$STREAM_B_PATH"
if [[ -n "$(git status --porcelain)" ]]; then
  if [[ "$DRY_RUN" -eq 0 ]]; then
    fatal "Stream B working tree is dirty. Commit/stash before bridging." 4
  else
    warn "[dry-run] Working tree dirty; live run would fail here."
  fi
fi

# Sync main + cut/reuse the bridge branch
run "git fetch origin --prune"
run "git checkout main"
run "git pull --ff-only origin main"

if git show-ref --quiet "refs/heads/$BRIDGE_BRANCH"; then
  log "Branch '$BRIDGE_BRANCH' already exists — checking out + rebasing on main"
  run "git checkout \"$BRIDGE_BRANCH\""
  run "git rebase main"
else
  log "Creating branch '$BRIDGE_BRANCH' from main"
  run "git checkout -b \"$BRIDGE_BRANCH\""
fi

# ----------------------------------------------------------------------
# Copy phase
# ----------------------------------------------------------------------
COPIED=0
SKIPPED=0
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  src="${line%%::*}"
  dst="${line##*::}"
  src_path="$COWORK_ROOT/$src"
  dst_path="$STREAM_B_PATH/$dst"

  if [[ ! -f "$src_path" ]]; then
    SKIPPED=$((SKIPPED + 1))
    vlog "SKIP  $src (not found)"
    continue
  fi

  dst_dir="$(dirname "$dst_path")"
  run "mkdir -p \"$dst_dir\""
  run "cp \"$src_path\" \"$dst_path\""
  COPIED=$((COPIED + 1))
  vlog "OK    $src → $dst"
done <<< "$BRIDGE_MAP"

log "Copy phase: $COPIED copied, $SKIPPED skipped"

# ----------------------------------------------------------------------
# Stage + commit + push
# ----------------------------------------------------------------------
run "git add -A"

if [[ "$DRY_RUN" -eq 0 ]] && git diff --cached --quiet; then
  log "No changes to commit (Stream B already in sync). Exiting cleanly."
  exit 0
fi

COMMIT_MSG=$(cat <<EOF
chore(specs): ingest Cowork specs (Bridge Protocol v1, run $(date -u +%Y%m%d-%H%M))

Bridge Protocol v1 ingest.
Source:    Cowork QOrium folder (Stream A — CTO Office authored)
Target:    Stream B (sales799/qorium)
Files:     $COPIED of $((COPIED + SKIPPED)) mapped (skipped=$SKIPPED — see warnings)
Branch:    $BRIDGE_BRANCH

Reference: governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md
Per:       Constitution v2.0 §X.0 (autonomous-mode dual-stream sync)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)

run "git -c user.name=\"$COMMIT_AUTHOR_NAME\" -c user.email=\"$COMMIT_AUTHOR_EMAIL\" commit -m \"$COMMIT_MSG\""

if [[ "$NO_PUSH" -eq 1 ]]; then
  log "--no-push set; skipping push. Branch is local at: $STREAM_B_PATH"
  exit 0
fi

run "git push -u origin \"$BRIDGE_BRANCH\""

# ----------------------------------------------------------------------
# Surface PR URL for CEO single click
# ----------------------------------------------------------------------
REPO_REMOTE=$(git remote get-url origin 2>/dev/null | sed -e 's/\.git$//' -e 's#git@github.com:#https://github.com/#')
PR_URL="${REPO_REMOTE}/pull/new/${BRIDGE_BRANCH}"

cat <<DONE

============================================================
QOrium Bridge Protocol v1 — done.
  Branch:    $BRIDGE_BRANCH
  Copied:    $COPIED files
  Skipped:   $SKIPPED files (warnings above)
  Pushed:    $( [[ "$NO_PUSH" -eq 1 ]] && echo no || echo yes )

Single CEO physical action remaining (≤30 sec):
  1. Open this URL in your browser:
       $PR_URL
  2. Click "Create pull request"
  3. (Optional) Tag CTO Office for review

Re-run anytime — the script is idempotent. Specs that arrive in
Cowork after this run will be picked up on the next invocation.
============================================================

DONE
