#!/bin/bash
#
# Fullstack Test - One-Click Install Script
# Description: Install fullstack-test skill/plugin for OpenClaw, Claude Code, and Codex
# Usage: curl -sL <url>/install.sh | bash
#   Or: bash install.sh
#

set -e

SKILL_NAME="fullstack-test"
SKILL_SOURCE="/home/czy/workspace/ai/skills/${SKILL_NAME}"
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
echo " Fullstack Test - One-Click Installer"
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

# Check source exists
if [[ ! -d "$SKILL_SOURCE" ]]; then
  error "Source skill not found: $SKILL_SOURCE"
  echo ""
  echo "Please clone the repository first:"
  echo "  git clone <repo-url> /home/czy/workspace/ai/skills/"
  exit 1
fi

info "Source: $SKILL_SOURCE"

# Install for OpenClaw
install_openclaw() {
  info "Installing for OpenClaw..."

  mkdir -p "$(dirname "$INSTALL_TARGET_OPENCLAW")"

  if [[ -L "$INSTALL_TARGET_OPENCLAW" ]]; then
    rm "$INSTALL_TARGET_OPENCLAW"
    info "Removed old symlink: $INSTALL_TARGET_OPENCLAW"
  elif [[ -d "$INSTALL_TARGET_OPENCLAW" ]]; then
    warn "Removing existing directory: $INSTALL_TARGET_OPENCLAW"
    rm -rf "$INSTALL_TARGET_OPENCLAW"
  fi

  ln -s "$SKILL_SOURCE" "$INSTALL_TARGET_OPENCLAW"
  info "Created symlink: $INSTALL_TARGET_OPENCLAW → $SKILL_SOURCE"
}

# Install for Claude Code / Codex
install_claude() {
  info "Installing for Claude Code / Codex..."

  mkdir -p "$(dirname "$INSTALL_TARGET_CLAUDE")"

  if [[ -L "$INSTALL_TARGET_CLAUDE" ]]; then
    rm "$INSTALL_TARGET_CLAUDE"
    info "Removed old symlink: $INSTALL_TARGET_CLAUDE"
  elif [[ -d "$INSTALL_TARGET_CLAUDE" ]]; then
    warn "Removing existing directory: $INSTALL_TARGET_CLAUDE"
    rm -rf "$INSTALL_TARGET_CLAUDE"
  fi

  ln -s "$SKILL_SOURCE" "$INSTALL_TARGET_CLAUDE"
  info "Created symlink: $INSTALL_TARGET_CLAUDE → $SKILL_SOURCE"
}

# Execute based on mode
case "$MODE" in
  openclaw)
    install_openclaw
    ;;
  claude)
    install_claude
    ;;
  all)
    install_openclaw
    echo ""
    install_claude
    ;;
  *)
    error "Unknown mode: $MODE"
    echo "Usage: bash install.sh [openclaw|claude|all]"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN} Installation Complete!${NC}"
echo "=========================================="
echo ""

# Verify installation
if [[ -L "$INSTALL_TARGET_OPENCLAW" ]]; then
  info "OpenClaw: ✅ $INSTALL_TARGET_OPENCLAW"
else
  warn "OpenClaw: ❌ symlink not created"
fi

if [[ -L "$INSTALL_TARGET_CLAUDE" ]]; then
  info "Claude Code: ✅ $INSTALL_TARGET_CLAUDE"
else
  warn "Claude Code: ❌ symlink not created"
fi

echo ""
echo "Next steps:"
echo "  1. Restart your OpenClaw gateway (if using OpenClaw)"
echo "  2. For OpenClaw: /coord-start --help"
echo "  3. For Claude Code: Use coord_start tool"
echo ""