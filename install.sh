#!/bin/bash
#
# Fullstack Test - One-Click Install Script
# Description: Install fullstack-test main skill + 7 sub-skills for OpenClaw / Claude Code
# Usage: bash install.sh [openclaw|claude|all]
#

set -e

SKILL_NAME="fullstack-test"
DEFAULT_REPO="https://github.com/DevilJie/fullstack-test.git"
SOURCE_DIR="$HOME/.local/share/fullstack-test"

# 子 skill 列表
SUB_SKILLS="coord-start coord-status coord-poll coord-test-start coord-resolve coord-done coord-backend-config"

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

  read -p "未找到本地源码，是否从 GitHub 克隆？[Y/n]: " -n 1 -r 2>&1
  echo ""
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    info "从 GitHub 克隆到 $SOURCE_DIR ..."
    git clone "$DEFAULT_REPO" "$SOURCE_DIR"
  else
    error "请先克隆仓库或确保本地源码存在于 /home/czy/workspace/ai/skills/"
    exit 1
  fi
}

# 安装主 skill for OpenClaw
install_openclaw_main() {
  local src_dir="$1"
  local target="$HOME/.openclaw/skills/${SKILL_NAME}"

  info "Installing OpenClaw main skill..."
  mkdir -p "$(dirname "$target")"

  if [[ -L "$target" ]]; then
    rm "$target"
  elif [[ -d "$target" ]]; then
    rm -rf "$target"
  fi

  ln -s "$src_dir" "$target"
  info "Created: $target"
}

# 安装子 skill for Claude Code
install_claude_sub_skills() {
  local src_dir="$1"

  info "Installing Claude Code sub-skills..."

  for skill in $SUB_SKILLS; do
    local target="$HOME/.claude/skills/$skill"
    local src_sub="$src_dir/$skill"

    if [[ ! -d "$src_sub" ]]; then
      warn "Skipped (not found): $src_sub"
      continue
    fi

    mkdir -p "$(dirname "$target")"

    if [[ -L "$target" ]]; then
      rm "$target"
    elif [[ -d "$target" ]]; then
      rm -rf "$target"
    fi

    ln -s "$src_sub" "$target"
    info "Created: $target"
  done
}

# 安装主 skill for Claude Code（fullstack-test 作为总入口）
install_claude_main() {
  local src_dir="$1"
  local target="$HOME/.claude/skills/${SKILL_NAME}"

  info "Installing Claude Code main skill..."
  mkdir -p "$(dirname "$target")"

  if [[ -L "$target" ]]; then
    rm "$target"
  elif [[ -d "$target" ]]; then
    rm -rf "$target"
  fi

  ln -s "$src_dir" "$target"
  info "Created: $target"
}

# 执行安装
install_source
src_dir=$(get_source_dir) || { error "未找到源码"; exit 1; }

case "$MODE" in
  openclaw)
    install_openclaw_main "$src_dir"
    ;;
  claude)
    install_claude_main "$src_dir"
    install_claude_sub_skills "$src_dir"
    ;;
  all)
    install_openclaw_main "$src_dir"
    echo ""
    install_claude_main "$src_dir"
    install_claude_sub_skills "$src_dir"
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
echo "Installed skills:"
echo ""
echo "OpenClaw:"
if [[ -L "$HOME/.openclaw/skills/${SKILL_NAME}" ]]; then
  echo "  ✅ ${SKILL_NAME}"
else
  echo "  ❌ ${SKILL_NAME}"
fi

echo ""
echo "Claude Code:"
if [[ -L "$HOME/.claude/skills/${SKILL_NAME}" ]]; then
  echo "  ✅ ${SKILL_NAME} (main)"
fi

for skill in $SUB_SKILLS; do
  if [[ -L "$HOME/.claude/skills/$skill" ]]; then
    echo "  ✅ $skill"
  else
    echo "  ❌ $skill"
  fi
done

echo ""
echo "Next steps:"
echo "  1. Restart your OpenClaw gateway (if using OpenClaw)"
echo "  2. Claude Code: Type / to see all available commands"
echo ""