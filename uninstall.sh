#!/bin/bash
#
# Fullstack Test - Uninstall Script
# Description: Remove fullstack-test symlinks from OpenClaw and Claude Code
# Usage: bash uninstall.sh [openclaw|claude|all]
#

set -e

SKILL_NAME="fullstack-test"
SUB_SKILLS="coord-start coord-status coord-poll coord-test-start coord-resolve coord-done coord-backend-config"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo ""
echo "=========================================="
echo " Fullstack Test - Uninstall"
echo "=========================================="
echo ""

# Detect installation mode
MODE="all"
if [[ "$1" == "openclaw" ]]; then
  MODE="openclaw"
elif [[ "$1" == "claude" ]]; then
  MODE="claude"
elif [[ "$1" == "all" ]]; then
  MODE="all"
elif [[ -n "$1" ]]; then
  MODE="$1"
fi

remove_symlink() {
  local target="$1"
  local label="$2"

  if [[ -L "$target" ]]; then
    rm "$target"
    info "Removed: $target"
  else
    info "Not found (already removed): $target"
  fi
}

case "$MODE" in
  openclaw)
    remove_symlink "$HOME/.openclaw/skills/${SKILL_NAME}" "OpenClaw"
    ;;
  claude)
    remove_symlink "$HOME/.claude/skills/${SKILL_NAME}" "Claude Code main"
    for skill in $SUB_SKILLS; do
      remove_symlink "$HOME/.claude/skills/$skill" "Claude Code $skill"
    done
    ;;
  all)
    remove_symlink "$HOME/.openclaw/skills/${SKILL_NAME}" "OpenClaw"
    remove_symlink "$HOME/.claude/skills/${SKILL_NAME}" "Claude Code main"
    for skill in $SUB_SKILLS; do
      remove_symlink "$HOME/.claude/skills/$skill" "Claude Code $skill"
    done
    ;;
  *)
    error "Unknown mode: $MODE"
    echo "Usage: bash uninstall.sh [openclaw|claude|all]"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN} Uninstall Complete${NC}"
echo "=========================================="
echo ""
echo "Note: The skill source files were NOT deleted."
echo "      Only the symlinks were removed."
echo ""