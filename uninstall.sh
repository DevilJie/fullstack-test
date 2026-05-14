#!/bin/bash
#
# Fullstack Test - Uninstall Script
# Description: Remove fullstack-test symlinks from OpenClaw and Claude Code
# Usage: bash uninstall.sh
#

set -e

SKILL_NAME="fullstack-test"
INSTALL_TARGET_OPENCLAW="$HOME/.openclaw/skills/${SKILL_NAME}"
INSTALL_TARGET_CLAUDE="$HOME/.claude/skills/${SKILL_NAME}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=========================================="
echo " Fullstack Test - Uninstall"
echo "=========================================="
echo ""

remove_symlink() {
  local target="$1"
  local label="$2"

  if [[ -L "$target" ]]; then
    rm "$target"
    info "Removed: $target"
  elif [[ -d "$target" ]]; then
    warn "Directory exists (not a symlink): $target"
    echo "  Run: rm -rf $target"
  else
    info "Not found (already removed): $target"
  fi
}

echo "Removing symlinks..."
echo ""

remove_symlink "$INSTALL_TARGET_OPENCLAW" "OpenClaw"
remove_symlink "$INSTALL_TARGET_CLAUDE" "Claude Code"

echo ""
echo "=========================================="
echo -e "${GREEN} Uninstall Complete${NC}"
echo "=========================================="
echo ""
echo "Note: The skill source files at"
echo "  /home/czy/workspace/ai/skills/fullstack-test"
echo "were NOT deleted. Only the symlinks were removed."
echo ""