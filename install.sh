#!/bin/bash
#
# Fullstack Test - One-Click Install Script
# Description: Clone and install fullstack-test skill/plugin for OpenClaw, Claude Code
# Usage: curl -sL <repo-url>/install.sh | bash
#   Or: bash install.sh [openclaw|claude|all]
#

set -e

SKILL_NAME="fullstack-test"
# 默认从 Codeup 克隆（如果本地没有源码）
DEFAULT_REPO="https://codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test.git"
SOURCE_DIR="$HOME/.local/share/fullstack-test"
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

# 检查本地是否已有源码
get_source_dir() {
  # 优先使用本地已有的工作区源码
  if [[ -d "/home/czy/workspace/ai/skills/${SKILL_NAME}" ]]; then
    echo "/home/czy/workspace/ai/skills/${SKILL_NAME}"
    return 0
  fi
  if [[ -d "$SOURCE_DIR/.git" ]]; then
    echo "$SOURCE_DIR"
    return 0
  fi
  return 1
}

# 安装源码
install_source() {
  if [[ -d "/home/czy/workspace/ai/skills/${SKILL_NAME}" ]]; then
    info "使用本地源码: /home/czy/workspace/ai/skills/${SKILL_NAME}"
    return 0
  fi

  if [[ -d "$SOURCE_DIR/.git" ]]; then
    info "使用已克隆的源码: $SOURCE_DIR"
    return 0
  fi

  # 询问用户是否要从远程克隆
  read -p "未找到本地源码，是否从 Codeup 克隆？[Y/n]: " -n 1 -r 2>&1
  echo ""
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    info "从 Codeup 克隆到 $SOURCE_DIR ..."
    git clone "$DEFAULT_REPO" "$SOURCE_DIR"
  else
    error "请先克隆仓库或确保本地源码存在于 /home/czy/workspace/ai/skills/"
    exit 1
  fi
}

# 解析 token 用于克隆
get_token() {
  if [[ -f "/home/czy/workspace/ai/token" ]]; then
    cat "/home/czy/workspace/ai/token"
    return 0
  fi
  return 1
}

# 安装 for OpenClaw
install_openclaw() {
  info "Installing for OpenClaw..."

  local src_dir
  src_dir=$(get_source_dir) || { error "未找到源码"; return 1; }

  mkdir -p "$(dirname "$INSTALL_TARGET_OPENCLAW")"

  if [[ -L "$INSTALL_TARGET_OPENCLAW" ]]; then
    rm "$INSTALL_TARGET_OPENCLAW"
    info "Removed old symlink: $INSTALL_TARGET_OPENCLAW"
  elif [[ -d "$INSTALL_TARGET_OPENCLAW" ]]; then
    warn "Removing existing directory: $INSTALL_TARGET_OPENCLAW"
    rm -rf "$INSTALL_TARGET_OPENCLAW"
  fi

  ln -s "$src_dir" "$INSTALL_TARGET_OPENCLAW"
  info "Created symlink: $INSTALL_TARGET_OPENCLAW → $src_dir"
}

# 安装 for Claude Code / Codex
install_claude() {
  info "Installing for Claude Code / Codex..."

  local src_dir
  src_dir=$(get_source_dir) || { error "未找到源码"; return 1; }

  mkdir -p "$(dirname "$INSTALL_TARGET_CLAUDE")"

  if [[ -L "$INSTALL_TARGET_CLAUDE" ]]; then
    rm "$INSTALL_TARGET_CLAUDE"
    info "Removed old symlink: $INSTALL_TARGET_CLAUDE"
  elif [[ -d "$INSTALL_TARGET_CLAUDE" ]]; then
    warn "Removing existing directory: $INSTALL_TARGET_CLAUDE"
    rm -rf "$INSTALL_TARGET_CLAUDE"
  fi

  ln -s "$src_dir" "$INSTALL_TARGET_CLAUDE"
  info "Created symlink: $INSTALL_TARGET_CLAUDE → $src_dir"
}

# 执行安装
install_source

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